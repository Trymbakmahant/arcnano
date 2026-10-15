# arczk-agent

> **Autonomous AI Agent SDK for ArcNano Shielded Zero-Knowledge Nanopayments on Arc.**

[![PyPI version](https://img.shields.io/pypi/v/arczk-agent.svg?color=emerald)](https://pypi.org/project/arczk-agent/)
[![Python Version](https://img.shields.io/badge/python-3.9+-blue.svg)](https://pypi.org/project/arczk-agent/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Arc Testnet](https://img.shields.io/badge/Arc_Testnet-5042002-blue.svg)](https://explorer.testnet.arc.io)
[![Latency](https://img.shields.io/badge/ZK_Proof_Gen-<10ms-brightgreen.svg)](https://github.com/Trymbakmahant/arcnano)

---

## Overview

`arczk-agent` empowers autonomous AI agents (**LangChain**, **CrewAI**, **AutoGPT**, **LlamaIndex**) to execute instant, privacy-preserving micro-payments over standard **HTTP 402 Payment Required** protocols with complete identity unlinkability on the **Arc Network**.

### Why use `arczk-agent`?

- **Zero Signer Exposure**: The calling AI agent never broadcasts on-chain transactions or exposes private keys. API providers cannot link prompt requests to any on-chain wallet balance.
- **Autonomous X402 Negotiation**: Automatically intercepts `402 Payment Required` responses, extracts cryptographic invoice parameters, generates Groth16 spend proofs in RAM, and retries in single-digit milliseconds.
- **Shielded Note Vault**: Client-side note generation (`secret`, `nullifier_seed`, Poseidon commitments) with local encrypted JSON persistence.
- **Agent Framework Ready**: Drop-in tool adapters for **LangChain** and **CrewAI** multi-agent pipelines.
- **Zero Gas Overhead**: Note settlement is batched and sponsored by API providers via Circle Gas Station (ERC-4337) on Arc L1.

---

## How Autonomous X402 Negotiation Works

```
 Autonomous Agent (Python)                 Protected API Gateway (X402)               Arc L1
           |                                              |                             |
           |  1. POST /v1/inference (no credentials)      |                             |
           |--------------------------------------------->|                             |
           |                                              |                             |
           |  2. 402 Payment Required                     |                             |
           |     WWW-Authenticate: X402 pool=...          |                             |
           |<---------------------------------------------|                             |
           |                                              |                             |
           |  -- Parse X402 Invoice                       |                             |
           |  -- Retrieve Note from Vault                 |                             |
           |  -- Generate Groth16 Proof in RAM            |                             |
           |                                              |                             |
           |  3. POST /v1/inference                       |                             |
           |     Authorization: X402 {"proof": ...}       |                             |
           |--------------------------------------------->|                             |
           |                                              |-- Verify Proof (<8ms)       |
           |                                              |-- Check Nullifier Cache     |
           |  4. 200 OK (Stream LLM Response)             |                             |
           |<---------------------------------------------|                             |
           |                                              |  5. batchSpend (Sponsored)  |
           |  -- Mark Note Spent in Vault                 |---------------------------->|
```

---

## Installation

```bash
# Standard installation
pip install arczk-agent

# Using uv (recommended for ultra-fast installs)
uv pip install arczk-agent

# With LangChain support
pip install "arczk-agent[langchain]"

# With CrewAI support
pip install "arczk-agent[crewai]"
```

---

## Quickstart

### 1. Direct Python Client with Transparent X402 Handling

The `ArcAgentClient` behaves like standard `requests`, but transparently intercepts HTTP 402 challenges and fulfills them:

```python
from arczk import ArcAgentClient, NoteVault

# 1. Initialize local shielded note vault
vault = NoteVault("~/.arcnano/agent_vault.json")

# 2. Fund/initialize an unspent note (0.01 USDC = 10,000 micro-units)
vault.create_note(denomination=10000)

print(f"Active unspent balance: {vault.unspent_balance()} micro-units")

# 3. Create autonomous agent HTTP client
client = ArcAgentClient(vault=vault)

# 4. Request any X402-enabled API endpoint:
# The client automatically handles HTTP 402, generates a ZK proof, and fulfills payment!
response = client.post(
    "https://api.inference.ai/v1/generate",
    json={"prompt": "Analyze autonomous financial markets on Arc"}
)

print("Status:", response.status_code)
print("Response:", response.json())
```

---

### 2. Model Context Protocol (MCP) Server for Antigravity & Claude Code

`arczk-agent` includes an official Model Context Protocol (MCP) server that empowers any LLM agent or IDE (**Google Antigravity**, **Claude Code**, **Claude Desktop**, **Cursor**) to autonomously manage zero-knowledge payments.

#### MCP Tools Provided:
- **`create_shielded_note`**: Mints a local ZK note (Poseidon commitment, secret, nullifier) in `agent_vault.json` and outputs the commitment for pool deposit.
- **`get_vault_status`**: Inspects local unspent balance and active note commitments.
- **`get_burner_wallet`**: Checks the agent's on-chain burner wallet address and balance (ARC & USDC) on Arc Testnet, auto-generating one if not set.
- **`deposit_to_pool`**: Automatically signs and submits the on-chain deposit using your burner wallet, or generates the commitment for web Playground funding.
- **`pay_x402_api`**: Calls any HTTP 402 endpoint, generates a Groth16 proof in RAM (~74ms), and unlocks the data stream without revealing the caller's identity.

---

#### 🚀 Setup Guide: Google Antigravity IDE

Add `arcnano` to your Antigravity IDE MCP configuration (either in `~/.gemini/antigravity-ide/mcp_config.json` or your project `.agents/mcp_config.json`).

> **💡 Autonomous Burner Wallet (Optional):** Add `ARCNANO_BURNER_PRIVATE_KEY` so Antigravity can automatically sign on-chain deposits without you having to click MetaMask!

```json
{
  "mcpServers": {
    "arcnano": {
      "command": "python3",
      "args": ["-m", "arczk.mcp_server"],
      "env": {
        "ARCNANO_BURNER_PRIVATE_KEY": "0xYourBurnerPrivateKeyHere",
        "PYTHONUNBUFFERED": "1"
      }
    }
  }
}
```

---

#### 🚀 Setup Guide: Claude Code

Add the ArcNano MCP server to Claude Code with an optional burner wallet:

```bash
claude mcp add arcnano python3 -m arczk.mcp_server
```

Or configure it with your burner wallet in `~/.claude/mcp.json` or Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "arcnano": {
      "command": "python3",
      "args": ["-m", "arczk.mcp_server"],
      "env": {
        "ARCNANO_BURNER_PRIVATE_KEY": "0xYourBurnerPrivateKeyHere"
      }
    }
  }
}
```

Once loaded, you can ask Claude Code or Antigravity:
> *"What is my ArcNano burner wallet address and balance?"*  
> *"Create and deposit a 0.01 USDC shielded note on Arc Testnet."*  
> *"Call https://api.inference.ai/v1/generate and pay with ArcNano ZK proof."*

---

### 3. LangChain Autonomous Agent Integration

Plug `ArcNanoLangChainTool` into any LangChain agent executor:

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from arczk.integrations import ArcNanoLangChainTool

# Initialize tool
payment_tool = ArcNanoLangChainTool()

tools = [payment_tool]
llm = ChatOpenAI(model="gpt-4o", temperature=0)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an autonomous research agent. Use the arcnano tool to pay for external compute APIs."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

agent = create_openai_tools_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

agent_executor.invoke({
    "input": "Call https://api.inference.ai/v1/generate to retrieve specialized market intelligence."
})
```

---

### 4. CrewAI Autonomous Agent Tool

```python
from crewai import Agent, Task, Crew
from arczk.integrations import ArcNanoPaymentTool

payment_tool = ArcNanoPaymentTool()

researcher = Agent(
    role="Autonomous Intelligence Scout",
    goal="Gather paid API data on Arc without leaking signer identity",
    backstory="Specialized in zero-knowledge agent transactions",
    tools=[payment_tool.run],
    verbose=True,
)

task = Task(
    description="Fetch data from https://api.inference.ai/v1/generate using shielded payment.",
    expected_output="JSON data returned from the paid inference endpoint.",
    agent=researcher,
)

crew = Crew(agents=[researcher], tasks=[task])
result = crew.kickoff()
print(result)
```

---

## Core Modules Reference

### `ArcAgentClient`
Autonomous HTTP client with session pooling and automated payment retry:
- `client.request(method, url, headers=None, auto_pay=True, **kwargs)`
- `client.get(url, **kwargs)`
- `client.post(url, **kwargs)`
- `client.parse_invoice(response)`: Extracts `recipient`, `pool`, `root`, and `denomination` from RFC `WWW-Authenticate` headers or JSON body.

### `NoteVault`
Encrypted local note manager storing client-side shielded notes:
- `vault.create_note(denomination=10000)`: Generates cryptographically secure random `secret` and `nullifier_seed` scalars in the BN254 field and computes Poseidon commitments.
- `vault.get_unspent_note(denomination=None)`: Retrieves the first unspent note with sufficient value.
- `vault.mark_spent(nullifier_hash)`: Marks note as consumed to prevent client-side replays.
- `vault.unspent_balance()`: Total available unspent units.
- `vault.save(filepath)` / `vault.load(filepath)`: JSON file persistence.

### `Groth16Prover`
RAM-based Groth16 spend proof generator:
- Binds public signals `[root, nullifierHash, recipient, aspRoot]` to the provider's wallet.
- Prevents frontrunning: proof is cryptographically tied to the exact recipient address specified in the invoice.

---

## Network & Contract Reference

| Parameter | Value |
| :--- | :--- |
| **Network** | Arc Testnet (Circle L1) |
| **Chain ID** | `5042002` |
| **Gas & Settlement Asset** | USDC (Native Gas & Denomination) |
| **RPC Endpoint** | `https://rpc.testnet.arc.network` |
| **Explorer** | [https://explorer.testnet.arc.io](https://explorer.testnet.arc.io) |
| **ArcNanoPool Contract** | [`0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca`](https://explorer.testnet.arc.io/address/0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca) |
| **Standard Denominations** | `1000` (0.001 USDC), `10000` (0.01 USDC), `100000` (0.1 USDC) |

---

## Testing

```bash
# Run test suite
pytest tests/ -v
```

---

## License

MIT © [Trymbak Mahant](https://github.com/Trymbakmahant)
