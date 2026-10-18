import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { ProofStorage } from "./storage.js";
import { BatchSettlementService } from "./settlement.js";
import { ProofStatus, RelayerConfig } from "./types.js";

export function createRelayerApp(config: Partial<RelayerConfig> = {}) {
  const app = new Hono();

  const batchThreshold = config.batchThreshold ?? parseInt(process.env.BATCH_THRESHOLD || "5", 10);
  const storage = new ProofStorage(config.storagePath);
  const settlement = new BatchSettlementService({
    storage,
    relayerPrivateKey: config.relayerPrivateKey,
    defaultRpcUrl: config.rpcUrl,
  });

  // Middleware
  app.use("*", cors());
  app.use("*", logger());
  app.use("*", prettyJSON());

  // 1. Root Information & Dashboard
  app.get("/", (c) => {
    const stats = storage.getStats();
    const queues = Array.from(storage.getPendingQueues().values());
    const wallet = settlement.getRelayerWalletInfo();

    return c.json({
      name: "ArcNano Automated Batch Relayer Backend",
      version: "1.0.0",
      framework: "Hono.js (TypeScript)",
      description: "Automated zero-knowledge spend proof storage & batch withdrawal engine for Arc Network",
      status: "operational",
      batchThreshold,
      wallet: {
        configured: wallet.configured,
        address: wallet.address,
      },
      stats,
      pendingQueuesCount: queues.length,
      endpoints: {
        "POST /v1/proofs/submit": "Ingest and persist Groth16 spend proof into batch withdrawal queue",
        "GET /v1/queue": "Inspect all pending withdrawal queues grouped by recipient",
        "GET /v1/proofs": "List stored proofs (filter by status, recipient)",
        "GET /v1/proofs/:id": "Query proof status, transaction hash, and explorer link",
        "POST /v1/batch/withdraw": "Trigger on-chain batchSpend withdrawal settlement",
        "GET /v1/batches": "List historical settled batch transactions",
        "GET /v1/status": "System health, relayer wallet balance, and metrics",
      },
    });
  });

  // 2. Health & Status
  app.get("/v1/status", async (c) => {
    const stats = storage.getStats();
    const wallet = settlement.getRelayerWalletInfo();
    const balance = await settlement.getRelayerNativeBalance();

    return c.json({
      status: "operational",
      role: "ArcNano Automated Batch Relayer Backend",
      batchThreshold,
      relayerWallet: {
        configured: wallet.configured,
        address: wallet.address,
        balanceArc: balance,
      },
      supportedNetworks: [
        {
          name: "Arc Testnet",
          chainId: 5042002,
          rpc: "https://rpc.testnet.arc.io",
          explorer: "https://explorer.testnet.arc.io",
        },
        {
          name: "Arc Mainnet",
          chainId: 5042,
          rpc: "https://rpc.mainnet.arc.io",
          explorer: "https://explorer.arc.io",
        },
      ],
      stats,
      sponsor: "Arc Circle Gas Station Paymaster & Relayer EOA ($0.00 Gas for Agents)",
    });
  });

  // 3. Inspect Pending Withdrawal Queues
  app.get("/v1/queue", (c) => {
    const queuesMap = storage.getPendingQueues();
    const recipient = c.req.query("recipient")?.toLowerCase();

    let queues = Array.from(queuesMap.values());
    if (recipient) {
      queues = queues.filter((q) => q.recipient.toLowerCase() === recipient);
    }

    const totalPendingNotes = queues.reduce((sum, q) => sum + q.count, 0);

    return c.json({
      success: true,
      totalQueues: queues.length,
      totalPendingNotes,
      batchThreshold,
      queues,
    });
  });

  // 4. Submit Proof for Ingestion & Batched Withdrawal
  app.post("/v1/proofs/submit", async (c) => {
    try {
      const body = await c.req.json();
      const payload = body.payload || body;

      if (!payload || !payload.proof || !payload.nullifierHash) {
        return c.json(
          { error: "Missing required payload: Groth16 proof coordinates and nullifierHash are required." },
          400
        );
      }

      const recipient = body.recipient || payload.recipient;
      if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
        return c.json(
          { error: "Missing or invalid recipient address. Please provide a valid 42-character 0x Arc address." },
          400
        );
      }

      const storedProof = storage.saveProof({
        payload,
        recipient,
        poolAddress: body.poolAddress,
        chainId: body.chainId ? Number(body.chainId) : 5042002,
        denomination: body.denomination,
        amountFormatted: body.amountFormatted,
      });

      const queues = storage.getPendingQueues();
      const queueKey = `${storedProof.chainId}:${storage.normalizeAddress(storedProof.poolAddress)}:${storage.normalizeAddress(recipient)}`;
      const currentQueue = queues.get(queueKey);
      const queuedCount = currentQueue ? currentQueue.proofs.length : 1;

      // Check if threshold reached
      let autoBatch = null;
      if (queuedCount >= batchThreshold) {
        try {
          autoBatch = await settlement.executeBatch({ queueKey });
        } catch (flushErr: any) {
          console.warn("[RelayerApp] Auto-batch threshold execution warning:", flushErr.message);
        }
      }

      return c.json({
        success: true,
        message: autoBatch
          ? `Batch threshold reached (${queuedCount}/${batchThreshold})! Automatically settled ${autoBatch.proofCount} notes on-chain.`
          : `Proof securely stored and queued for batch withdrawal (${queuedCount}/${batchThreshold} notes).`,
        proofId: storedProof.id,
        queuedCount,
        batchThreshold,
        autoFlushed: !!autoBatch,
        batch: autoBatch,
        proof: storedProof,
      });
    } catch (err: any) {
      const isConflict =
        err.message?.includes("Double-spend") ||
        err.message?.includes("already exists") ||
        err.message?.includes("already been submitted");

      return c.json({ error: err.message || "Failed to submit proof" }, isConflict ? 409 : 500);
    }
  });

  // 5. Query Stored Proofs List
  app.get("/v1/proofs", (c) => {
    const status = c.req.query("status") as ProofStatus | undefined;
    const recipient = c.req.query("recipient");
    const poolAddress = c.req.query("poolAddress");
    const limit = parseInt(c.req.query("limit") || "100", 10);
    const offset = parseInt(c.req.query("offset") || "0", 10);

    const result = storage.listProofs({
      status,
      recipient,
      poolAddress,
      limit,
      offset,
    });

    return c.json({ success: true, ...result });
  });

  // 6. Query Specific Proof by ID or Nullifier
  app.get("/v1/proofs/:id", (c) => {
    const id = c.req.param("id");
    const proof = storage.getProof(id);

    if (!proof) {
      return c.json({ error: "Proof not found" }, 404);
    }

    return c.json({ success: true, proof });
  });

  // 7. Trigger On-Demand Batch Withdrawal Execution
  app.post("/v1/batch/withdraw", async (c) => {
    try {
      let body: any = {};
      try {
        body = await c.req.json();
      } catch {
        // empty body allowed
      }

      if (body.queueKey || body.recipient) {
        const batch = await settlement.executeBatch({
          queueKey: body.queueKey,
          recipient: body.recipient,
          poolAddress: body.poolAddress,
          chainId: body.chainId ? Number(body.chainId) : undefined,
        });

        if (!batch) {
          return c.json({ success: false, message: "No pending proofs found in queue matching criteria." }, 404);
        }

        return c.json({
          success: true,
          message: `Successfully executed batch withdrawal for ${batch.proofCount} notes (${batch.totalAmountFormatted}) to ${batch.recipient}!`,
          batch,
        });
      }

      // Flush all queues
      const batches = await settlement.flushAll();
      return c.json({
        success: true,
        message: `Flushed all pending queues (${batches.length} batches settled).`,
        batchesCount: batches.length,
        batches,
      });
    } catch (err: any) {
      return c.json({ error: err.message || "Failed to execute batch withdrawal" }, 500);
    }
  });

  // 8. List Historical Settled Batches
  app.get("/v1/batches", (c) => {
    const recipient = c.req.query("recipient");
    const limit = parseInt(c.req.query("limit") || "50", 10);
    const offset = parseInt(c.req.query("offset") || "0", 10);

    const result = storage.listBatches({ recipient, limit, offset });
    return c.json({ success: true, ...result });
  });

  return { app, storage, settlement };
}
