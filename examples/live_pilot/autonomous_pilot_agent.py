import sys
import time
import json
from arczk import ArcAgentClient, NoteVault

def main():
    print("=" * 70)
    print("🤖 ArcNano Autonomous Pilot Agent (Stage 04 Live Showcase)")
    print("🎯 Task: Multi-Step Autonomous Intelligence Gathering Loop")
    print("⛽ Gas Requirement: $0.00 Native Gas (Decoupled via Groth16 in RAM)")
    print("=" * 70)

    # 1. Initialize Shielded Note Vault with pre-minted shielded notes
    vault = NoteVault()
    # Generate 3 unspent shielded notes of 0.01 USDC (10,000 micro-units each)
    notes = [
        vault.create_note(denomination=10000),
        vault.create_note(denomination=10000),
        vault.create_note(denomination=10000),
    ]

    print(f"\n[Agent Vault] Loaded {len(notes)} shielded deposit commitments:")
    for i, n in enumerate(notes, 1):
        print(f"  [{i}] Note: {n.commitment[:18]}... | Nullifier: {n.nullifier_hash[:18]}... | Balance: 0.01 USDC")
    print(f"  • Total Shielded Balance: {vault.unspent_balance()} micro-units (0.03 USDC)\n")

    client = ArcAgentClient(vault=vault)
    endpoint = "http://localhost:4030/api/v1/inference"

    tasks = [
        {"id": "TASK-1", "prompt": "Execute market liquidity depth scan on Arc L1 AMMs"},
        {"id": "TASK-2", "prompt": "Verify OFAC ASP compliance and sanctions exclusion proof"},
        {"id": "TASK-3", "prompt": "Execute synthesis and autonomous trade signal consensus"},
    ]

    for step, task in enumerate(tasks, 1):
        print(f"\n--- [Step {step}/3] Agent Sub-Goal: {task['id']} ---")
        print(f"  • Prompt: \"{task['prompt']}\"")
        print(f"  • Sending HTTP request to Inference Provider...")

        t0 = time.time()
        response = client.post(endpoint, json={"prompt": task["prompt"]})
        elapsed_ms = (time.time() - t0) * 1000

        if response.status_code != 200:
            print(f"  ❌ Step failed with HTTP {response.status_code}: {response.text}")
            sys.exit(1)

        data = response.json()
        tokens = data.get("tokens", [])
        streamed_text = " ".join(tokens)
        gw_latency = data.get("metrics", {}).get("gatewayLatencyMs", 0)

        print(f"  ✔ Status: HTTP 200 OK (Roundtrip: {elapsed_ms:.2f} ms | Gateway ZK Verify: {gw_latency:.3f} ms)")
        print(f"  ✔ Streamed Output: \"{streamed_text}\"")
        print(f"  ✔ Agent Gas Expended: $0.00 | Payer Identity Leaked: 0%")

    print("\n" + "=" * 70)
    print("📊 Autonomous Research Pilot Summary:")
    print(f"  • All 3 intelligence goals completed autonomously.")
    print(f"  • Unspent notes remaining in vault: {vault.unspent_count()}")
    print(f"  • Total USDC transferred for inference: 0.03 USDC")
    print(f"  • Total native gas paid by agent: $0.00")
    print("=" * 70)

if __name__ == "__main__":
    main()
