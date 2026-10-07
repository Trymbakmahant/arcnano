import subprocess
import time
import sys
import urllib.request
import signal
import os

def wait_for_server(url, timeout=10):
    start = time.time()
    while time.time() - start < timeout:
        try:
            req = urllib.request.Request(url, method="POST", data=b"{}")
            req.add_header("Content-Type", "application/json")
            with urllib.request.urlopen(req) as resp:
                return True
        except urllib.error.HTTPError as e:
            # 402 means the server is running and middleware is active!
            if e.code == 402:
                return True
        except Exception:
            time.sleep(0.3)
    return False

def main():
    print("🚀 Starting ArcNano Stage 03 End-to-End M2M Integration Simulation...\n")

    # 1. Start Gateway Server
    print("1. Launching Express X402 Gateway Server...")
    tsx_bin = os.path.abspath("sdk/x402-express/node_modules/.bin/tsx")
    env = dict(os.environ)
    env["NODE_PATH"] = os.path.abspath("sdk/x402-express/node_modules")

    gateway_proc = subprocess.Popen(
        [tsx_bin, "examples/gateway_server.ts"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env,
    )

    try:
        # Wait for server to bind to port 4020
        endpoint = "http://localhost:4020/api/v1/inference"
        if not wait_for_server(endpoint, timeout=10):
            print("❌ Error: Gateway server failed to start within timeout.")
            if gateway_proc.poll() is not None:
                out, err = gateway_proc.communicate()
                print("Server stdout:", out)
                print("Server stderr:", err)
            sys.exit(1)

        print("✔ Gateway Server active and serving HTTP 402 challenges on :4020\n")

        # 2. Run Autonomous AI Agent Client
        print("2. Spawning Autonomous AI Agent...")
        agent_proc = subprocess.run(
            ["sdk/python/.venv/bin/python", "examples/autonomous_agent.py"],
            capture_output=True,
            text=True
        )

        print(agent_proc.stdout)
        if agent_proc.returncode != 0:
            print("❌ Agent error output:", agent_proc.stderr)
            sys.exit(1)

    finally:
        print("\nShutting down Gateway Server...")
        gateway_proc.terminate()
        try:
            gateway_proc.wait(timeout=2)
        except subprocess.TimeoutExpired:
            gateway_proc.kill()
        print("✔ Cleanup complete.")

if __name__ == "__main__":
    main()
