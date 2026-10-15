# ⚡ ArcNano Batch Relayer Backend (Hono.js + TypeScript)

> Production-ready, ultra-low latency relayer backend built with **Hono.js** and **TypeScript**.  
> Persistently stores incoming zero-knowledge spend proofs, deduplicates nullifiers in sub-millisecond time, partitions queues by recipient, and triggers on-chain `batchSpend` withdrawals on the **Arc Network**.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Clients["Clients & Autonomous Agents"]
        AgentA["AI Agent / Gateway"]
        User["User Wallet / Playground"]
    end

    subgraph Relayer["ArcNano Hono.js Relayer (Port 4040)"]
        Hono["Hono Web Server & REST API"]
        Storage[("Persistent Proof Store (Disk JSON)")]
        Dedupe{"Nullifier Replay Check"}
        Batcher["Multi-Recipient Queue Partitioning"]
        Settler["On-Chain Settlement Engine (batchSpend)"]
    end

    subgraph Blockchain["Arc Network (Circle L1)"]
        Pool["ArcNanoPool.sol (0xa40d... / 0x716F...)"]
        Paymaster["Circle Gas Station Paymaster ($0.00 Gas)"]
        Recipient["Recipient Wallet Address"]
    end

    AgentA -->|POST /v1/proofs/submit| Hono
    User -->|POST /v1/proofs/submit| Hono
    Hono --> Dedupe
    Dedupe -->|Duplicate| Reject["409 Conflict (Replay Rejected)"]
    Dedupe -->|Novel| Storage
    Storage --> Batcher
    Batcher -->|Count >= BATCH_THRESHOLD or Auto-Flush Timer| Settler
    Settler -->|batchSpend(proofs, recipient)| Pool
    Pool -->|ERC-20 Transfer totalAmount| Recipient
    Pool -.->|100% Sponsored Gas| Paymaster
    Settler -->|Record txHash & blockNumber| Storage
```

---

## 🚀 Quickstart

### 1. Install & Build
```bash
cd relayer
pnpm install
pnpm build
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key environment settings:
| Variable | Default | Description |
|---|---|---|
| `PORT` | `4040` | HTTP Server port |
| `BATCH_THRESHOLD` | `5` | Proof threshold before auto-triggering on-chain batch withdrawal |
| `FLUSH_INTERVAL_MS` | `15000` | Background periodic flush interval (milliseconds) |
| `ARC_RPC_URL` | `https://rpc.testnet.arc.network` | Arc Testnet RPC URL |
| `AGENT_B_PRIVATE_KEY` | *(Funded testnet key)* | Relayer EOA private key for signing on-chain transactions |
| `POOL_ADDRESS` | `0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca` | ArcNanoPool 0.01 USDC contract address |

### 3. Start Relayer Server
```bash
# Development (with live reload)
pnpm dev

# Production
pnpm start
```

### 4. Run Test Suite
```bash
pnpm test
```

---

## 📡 REST API Reference

### 1. Ingest Spend Proof
Stores a verified Groth16 spend proof into the pending batch buffer.

- **Endpoint:** `POST /v1/proofs/submit`
- **Request Body:**
```json
{
  "recipient": "0x8506a1aC60e574fEBc6f6301844b3DE910801020",
  "poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
  "chainId": 5042002,
  "denomination": "10000",
  "amountFormatted": "0.01 USDC",
  "payload": {
    "proof": {
      "a": ["1", "2"],
      "b": [["3", "4"], ["5", "6"]],
      "c": ["7", "8"]
    },
    "root": "15055926234077295509216400193975320613085685875483293700481590095656163448343",
    "nullifierHash": "0x1111111111111111111111111111111111111111111111111111111111111111",
    "aspRoot": "0x0000000000000000000000000000000000000000000000000000000000001337"
  }
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Proof securely stored and queued for batch withdrawal (1/5 notes).",
  "proofId": "proof_1729000000000_abc123",
  "queuedCount": 1,
  "batchThreshold": 5,
  "autoFlushed": false
}
```

---

### 2. Inspect Pending Queues
Lists all pending proofs partitioned by recipient and pool.

- **Endpoint:** `GET /v1/queue`
- **Optional Query:** `?recipient=0x...`
- **Response:**
```json
{
  "success": true,
  "totalQueues": 1,
  "totalPendingNotes": 3,
  "batchThreshold": 5,
  "queues": [
    {
      "queueKey": "5042002:0xa40d68fdea3b6fb01c966a9d29a6fc341ae476ca:0x8506a1ac60e574febc6f6301844b3de910801020",
      "chainId": 5042002,
      "poolAddress": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
      "recipient": "0x8506a1aC60e574fEBc6f6301844b3DE910801020",
      "denomination": "10000",
      "count": 3,
      "totalUsdc": "0.03 USDC"
    }
  ]
}
```

---

### 3. Trigger On-Demand Batch Withdrawal
Forces immediate execution of `batchSpend` on Arc Network for a specific recipient or all pending queues.

- **Endpoint:** `POST /v1/batch/withdraw`
- **Request Body (Optional):**
```json
{
  "recipient": "0x8506a1aC60e574fEBc6f6301844b3DE910801020"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Successfully executed batch withdrawal for 3 notes (0.03 USDC) to 0x8506a1aC60e574fEBc6f6301844b3DE910801020!",
  "batch": {
    "id": "batch_1729000000000_def456",
    "recipient": "0x8506a1aC60e574fEBc6f6301844b3DE910801020",
    "proofCount": 3,
    "totalAmountFormatted": "0.03 USDC",
    "status": "settled",
    "txHash": "0x38fa07bf4939c14049d0f1add34ef1ae6c28cfbba05f340f473c2b9a368c83fd",
    "explorerUrl": "https://explorer.testnet.arc.io/tx/0x38fa07bf4939c14049d0f1add34ef1ae6c28cfbba05f340f473c2b9a368c83fd",
    "gasSponsoredUsd": "$0.0025",
    "settledAt": 1729000002000
  }
}
```

---

### 4. Query Stored Proofs
- **Endpoint:** `GET /v1/proofs`
- **Query Filters:** `?status=queued` or `?recipient=0x...` or `?limit=50&offset=0`

### 5. Query Proof by ID or Nullifier
- **Endpoint:** `GET /v1/proofs/:idOrNullifier`

### 6. List Settled Batches History
- **Endpoint:** `GET /v1/batches`
- **Query Filters:** `?recipient=0x...&limit=20`

### 7. Health & Relayer Wallet Status
- **Endpoint:** `GET /v1/status`

---

## 🛡️ Security & Invariants
1. **Double-Spend Immunity:** Every submitted nullifier is indexed and checked before ingestion. Replays are rejected with HTTP 409 Conflict.
2. **Recipient Boundary Binding:** Proofs destined for different recipients are strictly partitioned into independent queues because Solidity `batchSpend(proofs, recipient)` deposits the total batch funds directly into that single recipient address.
3. **Atomic Persistence:** Proofs and batch settlement state are committed using atomic temporary file renames, ensuring zero corrupted records during power failures or crashes.
