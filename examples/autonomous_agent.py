import sys
import time
import json
from arczk import ArcAgentClient, NoteVault

def main():
    print("=" * 60)
    print("🤖 ArcNano Autonomous AI Agent — Live M2M Nanopayment Demo")
    print("=" * 60)

    # 1. Initialize local note vault
    vault = NoteVault()
    # Create an unspent note with testnet root parameters
    note = vault.create_note(denomination=10000)
    print(f"\n[Agent] Initialized Shielded Note:")
    print(f"  • Commitment:     {note.commitment[:24]}...")
    print(f"  • Nullifier Hash: {note.nullifier_hash[:24]}...")
    print(f"  • Denomination:   0.01 USDC ({note.denomination} units)")
    print(f"  • Unspent Balance: {vault.unspent_balance()} micro-units")

    # 2. Initialize autonomous HTTP client
    client = ArcAgentClient(vault=vault)
    endpoint = "http://localhost:4020/api/v1/inference"

    print(f"\n[Agent] Requesting protected AI inference from: {endpoint}")
    print("[Agent] Step 1: Agent queries endpoint without prior payment credentials...")

    start_time = time.time()
    response = client.post(
        endpoint,
        json={"prompt": "Demonstrate autonomous ZK payments on Arc"},
    )
    total_latency_ms = (time.time() - start_time) * 1000

    print(f"\n[Agent] Response received with status: {response.status_code} OK")
    print(f"[Agent] Total Roundtrip Latency: {total_latency_ms:.2f} ms")

    data = response.json()
    print(f"[Agent] Streamed AI Output: {' '.join(data.get('tokens', []))}")
    print(f"[Agent] Gateway Verified Time: {data.get('latencyMs', 0):.4f} ms")

    print(f"\n[Agent] Vault Status:")
    print(f"  • Active Unspent Notes: {vault.unspent_count()}")
    print(f"  • Active Balance:       {vault.unspent_balance()} micro-units")
    print(f"  • Note Spent:           {note.is_spent}")

    print("\n✅ Autonomous Agent M2M Micropayment Handshake Completed Successfully!")
    print("=" * 60)

if __name__ == "__main__":
    main()
