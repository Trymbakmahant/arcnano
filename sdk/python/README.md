# arczk-agent

> **Autonomous AI Agent SDK for ArcNano Shielded Zero-Knowledge Nanopayments on Arc.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Arc Testnet](https://img.shields.io/badge/Arc_Testnet-5042002-blue.svg)](https://testnet.arcscan.io)
[![Python: >=3.9](https://img.shields.io/badge/Python->=3.9-blue.svg)](https://python.org)

`arczk-agent` empowers autonomous AI agents (LangChain, CrewAI, AutoGPT) to execute instant, zero-knowledge micro-payments over standard HTTP 402 protocols with complete identity unlinkability on the Arc Network.

---

## ⚡ Why Use `arczk-agent`?

- **Zero Signer Exposure**: The agent never broadcasts an on-chain transaction. Public keys and wallet balances are never linked to prompt API calls.
- **Autonomous X402 Negotiation**: Automatically detects `402 Payment Required`, parses cryptographic invoices, builds Groth16 proofs in RAM, and retries in single-digit milliseconds.
- **Shielded Note Vault**: Client-side note generation (`secret`, `nullifier_seed`, Poseidon commitments) with persistent local encrypted storage.
- **LangChain & CrewAI Tool Ready**: Drop-in tool adapters for autonomous multi-agent pipelines.

---

## 📦 Installation

```bash
pip install arczk-agent
# or using uv:
uv pip install arczk-agent
```

---

## 🚀 Quickstart

### 1. Direct Python Client

```python
from arczk import ArcAgentClient, NoteVault

# 1. Initialize local shielded note vault
vault = NoteVault("~/.arcnano/agent_vault.json")

# 2. Deposit / initialize a note (0.01 USDC)
vault.create_note(denomination=10000)

# 3. Create autonomous agent HTTP client
client = ArcAgentClient(vault=vault)

# 4. Make requests to any X402-enabled AI endpoint seamlessly:
# Client automatically detects HTTP 402, constructs ZK proof, and fulfills payment!
response = client.post(
    "https://api.inference.ai/v1/generate",
    json={"prompt": "Analyze autonomous market trends on Arc"}
)

print(response.json())
```

### 2. LangChain Autonomous Agent Integration

```python
from arczk.integrations import ArcNanoPaymentTool

# Create payment tool
payment_tool = ArcNanoPaymentTool()

# Use inside LangChain or CrewAI agent tool list
tools = [payment_tool]
```

---

## 🧪 Testing

```bash
pytest sdk/python/tests/ -v
```
