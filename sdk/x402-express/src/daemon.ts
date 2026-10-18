import http from "node:http";
import { ethers } from "ethers";
import { SpendProofPayload } from "./types.js";
import { CirclePaymasterClient, SponsoredSettlementReceipt } from "./paymaster.js";
import { RelayerStorage, StoredProof, StoredBatch, ProofStatus } from "./storage.js";

export interface DaemonConfig {
  port?: number;
  batchThreshold?: number;
  flushIntervalMs?: number;
  defaultRecipient?: string;
  poolAddress?: string;
  rpcUrl?: string;
  chainId?: number;
  relayerPrivateKey?: string;
  paymasterUrl?: string;
  enableHttpServer?: boolean;
  storagePath?: string;
}

export interface IngestedItem {
  id: string;
  payload: SpendProofPayload;
  recipient: string;
  receivedAt: number;
}

export interface DaemonMetrics {
  uptimeSeconds: number;
  totalIngested: number;
  totalSettledNotes: number;
  totalBatchesSettled: number;
  totalGasSponsoredUsd: string;
  currentQueueLength: number;
  lastSettlementTimestamp?: number;
  lastTxHash?: string;
  storageStats: {
    totalProofs: number;
    queuedProofs: number;
    processingProofs: number;
    settledProofs: number;
    failedProofs: number;
    totalBatches: number;
    settledBatches: number;
    totalSettledUsdc: string;
  };
}

export class ArcNanoRelayerDaemon {
  private config: Required<Omit<DaemonConfig, "storagePath">> & { storagePath?: string };
  private storage: RelayerStorage;
  private paymaster: CirclePaymasterClient;
  private server: http.Server | null = null;
  private timer: NodeJS.Timeout | null = null;
  private startedAt: number = Date.now();
  private totalIngested: number = 0;
  private totalSettledNotes: number = 0;
  private totalBatchesSettled: number = 0;
  private totalGasSponsoredUsd: number = 0;
  private lastSettlementReceipt?: SponsoredSettlementReceipt;
  private isFlushing: boolean = false;

  constructor(config: DaemonConfig = {}) {
    this.config = {
      port: config.port ?? 4040,
      batchThreshold: config.batchThreshold ?? 5,
      flushIntervalMs: config.flushIntervalMs ?? 15_000,
      defaultRecipient:
        config.defaultRecipient ??
        "0x063829800C7214C6AaD38f57C72561641cD80333",
      poolAddress:
        config.poolAddress ??
        process.env.ARC_POOL_ADDRESS ??
        "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
      rpcUrl:
        config.rpcUrl ??
        process.env.ARC_RPC_URL ??
        "https://rpc.testnet.arc.io",
      chainId: config.chainId ?? 5042002,
      relayerPrivateKey:
        config.relayerPrivateKey ?? process.env.ARC_RELAYER_KEY ?? process.env.AGENT_B_PRIVATE_KEY ?? "",
      paymasterUrl:
        config.paymasterUrl ??
        process.env.ARC_PAYMASTER_URL ??
        "https://gas-station.testnet.arc.network/v1",
      enableHttpServer: config.enableHttpServer ?? true,
      storagePath: config.storagePath,
    };

    this.storage = new RelayerStorage({ storagePath: this.config.storagePath });
    this.paymaster = new CirclePaymasterClient({
      paymasterUrl: this.config.paymasterUrl,
      rpcUrl: this.config.rpcUrl,
      chainId: this.config.chainId,
      poolAddress: this.config.poolAddress,
      relayerPrivateKey: this.config.relayerPrivateKey || undefined,
    });
  }

  public getStorage(): RelayerStorage {
    return this.storage;
  }

  /**
   * Starts the relayer daemon service and HTTP listener
   */
  public async start(): Promise<void> {
    this.startedAt = Date.now();

    // Start background auto-flush timer
    if (this.config.flushIntervalMs > 0) {
      this.timer = setInterval(() => {
        this.flushAll().catch((err) =>
          console.error("[RelayerDaemon] Scheduled flush failed:", err.message)
        );
      }, this.config.flushIntervalMs);
      if (this.timer.unref) this.timer.unref();
    }

    if (this.config.enableHttpServer) {
      await this.startHttpServer();
    }

    const mode = this.config.relayerPrivateKey ? "Live On-Chain EOA + Paymaster" : "Simulated Paymaster";
    console.log(
      `[RelayerDaemon] 🚀 ArcNano Batch Relayer active | Port: ${this.config.port} | Threshold: ${this.config.batchThreshold} | Flush: ${this.config.flushIntervalMs}ms | Mode: ${mode}`
    );
  }

  /**
   * Stops the relayer daemon and HTTP server
   */
  public async stop(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server?.close(() => resolve());
      });
      this.server = null;
    }
  }

  /**
   * Ingest a verified note proof into persistent storage
   */
  public async ingest(
    payload: SpendProofPayload,
    recipient?: string,
    options?: {
      poolAddress?: string;
      chainId?: number;
      denomination?: string;
      amountFormatted?: string;
    }
  ): Promise<{ success: boolean; queuedCount: number; id: string; proof: StoredProof }> {
    const targetRecipient = recipient || this.config.defaultRecipient;
    const poolAddress = options?.poolAddress || this.config.poolAddress;
    const chainId = options?.chainId || this.config.chainId;
    const denomination = options?.denomination || "10000";

    // 1. Off-chain deduplication check via persistent store
    if (this.storage.hasNullifier(payload.nullifierHash)) {
      throw new Error(`Duplicate nullifier detected: ${payload.nullifierHash.slice(0, 16)}...`);
    }

    // 2. Persist proof to atomic disk store
    const storedProof = this.storage.saveProof({
      payload,
      recipient: targetRecipient,
      poolAddress,
      chainId,
      denomination,
      amountFormatted: options?.amountFormatted,
    });

    this.totalIngested++;

    // 3. Check queue size for this specific recipient and pool
    const queues = this.storage.getPendingQueues();
    const queueKey = `${chainId}:${this.storage.normalizeAddress(poolAddress)}:${this.storage.normalizeAddress(targetRecipient)}`;
    const currentQueue = queues.get(queueKey);
    const queuedCount = currentQueue ? currentQueue.proofs.length : 1;

    // 4. If threshold reached, trigger immediate flush for this queue
    if (queuedCount >= this.config.batchThreshold) {
      setImmediate(() => {
        this.flushQueue(queueKey).catch((err) =>
          console.error(`[RelayerDaemon] Threshold flush failed for ${queueKey}:`, err.message)
        );
      });
    }

    return {
      success: true,
      queuedCount,
      id: storedProof.id,
      proof: storedProof,
    };
  }

  /**
   * Flushes a specific queue group by key
   */
  public async flushQueue(
    queueKey: string
  ): Promise<SponsoredSettlementReceipt | null> {
    const queues = this.storage.getPendingQueues();
    const queueGroup = queues.get(queueKey);
    if (!queueGroup || queueGroup.proofs.length === 0) {
      return null;
    }

    const proofsToSettle = [...queueGroup.proofs];
    const payloads = proofsToSettle.map((p) => p.payload);
    const recipient = queueGroup.recipient;
    const poolAddress = queueGroup.poolAddress;
    const chainId = queueGroup.chainId;
    const denomination = queueGroup.denomination;

    // 1. Create batch record in storage and mark proofs "processing"
    const batch = this.storage.createBatch({
      proofs: proofsToSettle,
      recipient,
      poolAddress,
      chainId,
      denomination,
    });

    try {
      // 2. Submit on-chain batchSpend transaction via Circle Paymaster / Relayer Wallet
      const receipt = await this.paymaster.executeSponsoredBatch(
        payloads,
        recipient,
        {
          poolAddress,
          chainId,
          denomination,
        }
      );

      const explorerBase =
        chainId === 5042
          ? "https://explorer.arc.io"
          : "https://explorer.testnet.arc.io";
      const explorerUrl = receipt.txHash ? `${explorerBase}/tx/${receipt.txHash}` : undefined;

      // 3. Mark batch and all contained proofs as "settled" in persistent storage
      this.storage.markBatchSettled(batch.id, {
        txHash: receipt.txHash,
        blockNumber: receipt.blockNumber,
        explorerUrl,
        gasSponsoredUsd: receipt.gasSponsoredEstimatedValueUsd,
        simulated: receipt.simulated,
      });

      this.totalBatchesSettled++;
      this.totalSettledNotes += proofsToSettle.length;
      const gasSavedFloat = parseFloat(
        receipt.gasSponsoredEstimatedValueUsd.replace("$", "")
      );
      this.totalGasSponsoredUsd += isNaN(gasSavedFloat) ? 0 : gasSavedFloat;
      this.lastSettlementReceipt = receipt;

      console.log(
        `[RelayerDaemon] ⚡ Settle Batch [${batch.id}]: ${receipt.batchCount} notes -> Recipient: ${recipient.slice(0, 8)}... | Tx: ${receipt.txHash.slice(0, 18)}... | Pool: ${poolAddress.slice(0, 8)}...`
      );

      return receipt;
    } catch (err: any) {
      // Re-queue proofs on failure
      this.storage.markBatchFailed(batch.id, err.message, true);
      console.error(`[RelayerDaemon] Batch settlement failure for ${queueKey}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Flushes all pending queues
   */
  public async flushAll(): Promise<SponsoredSettlementReceipt[]> {
    if (this.isFlushing) return [];
    this.isFlushing = true;

    const receipts: SponsoredSettlementReceipt[] = [];
    try {
      const queues = this.storage.getPendingQueues();
      for (const [key, group] of queues.entries()) {
        if (group.proofs.length > 0) {
          try {
            const receipt = await this.flushQueue(key);
            if (receipt) receipts.push(receipt);
          } catch (err: any) {
            console.error(`[RelayerDaemon] Queue flush error (${key}):`, err.message);
          }
        }
      }
    } finally {
      this.isFlushing = false;
    }

    return receipts;
  }

  /**
   * Backwards compatible flush() implementation
   */
  public async flush(targetRecipient?: string): Promise<SponsoredSettlementReceipt | null> {
    const queues = this.storage.getPendingQueues();
    if (queues.size === 0) return null;

    if (targetRecipient) {
      const norm = this.storage.normalizeAddress(targetRecipient);
      for (const [key, group] of queues.entries()) {
        if (this.storage.normalizeAddress(group.recipient) === norm) {
          return await this.flushQueue(key);
        }
      }
      return null;
    }

    // Flush first available queue
    const firstKey = queues.keys().next().value;
    if (firstKey) {
      return await this.flushQueue(firstKey);
    }
    return null;
  }

  /**
   * Returns live daemon metrics
   */
  public getMetrics(): DaemonMetrics {
    const stats = this.storage.getStats();
    return {
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      totalIngested: this.totalIngested,
      totalSettledNotes: this.totalSettledNotes,
      totalBatchesSettled: this.totalBatchesSettled,
      totalGasSponsoredUsd: `$${this.totalGasSponsoredUsd.toFixed(4)}`,
      currentQueueLength: stats.queuedProofs,
      lastSettlementTimestamp: this.lastSettlementReceipt?.timestamp,
      lastTxHash: this.lastSettlementReceipt?.txHash,
      storageStats: stats,
    };
  }

  private startHttpServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(async (req, res) => {
        // Handle CORS
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, X-Payment, X402-Recipient"
        );

        if (req.method === "OPTIONS") {
          res.writeHead(204);
          res.end();
          return;
        }

        const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
        const pathname = parsedUrl.pathname;
        const method = req.method || "GET";

        // 1. Health & Status
        if (pathname === "/v1/status" && method === "GET") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              status: "running",
              metrics: this.getMetrics(),
              config: {
                batchThreshold: this.config.batchThreshold,
                flushIntervalMs: this.config.flushIntervalMs,
                poolAddress: this.config.poolAddress,
                chainId: this.config.chainId,
                sponsor: "Arc Circle Gas Station Paymaster",
                relayerConfigured: !!this.config.relayerPrivateKey,
              },
            })
          );
          return;
        }

        // 2. Metrics
        if (pathname === "/v1/metrics" && method === "GET") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(this.getMetrics()));
          return;
        }

        // 3. Queue Inspection
        if (pathname === "/v1/queue" && method === "GET") {
          const queues = this.storage.getPendingQueues();
          const queueArray = Array.from(queues.values()).map((q) => ({
            queueKey: q.queueKey,
            chainId: q.chainId,
            poolAddress: q.poolAddress,
            recipient: q.recipient,
            denomination: q.denomination,
            count: q.proofs.length,
            totalUsdc: `${(Number(BigInt(q.denomination) * BigInt(q.proofs.length)) / 1e6).toFixed(2)} USDC`,
            proofIds: q.proofs.map((p) => p.id),
          }));

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ queues: queueArray, totalQueues: queueArray.length }));
          return;
        }

        // 4. List Stored Proofs
        if (pathname === "/v1/proofs" && method === "GET") {
          const status = parsedUrl.searchParams.get("status") as ProofStatus | undefined;
          const recipient = parsedUrl.searchParams.get("recipient") || undefined;
          const poolAddress = parsedUrl.searchParams.get("poolAddress") || undefined;
          const limit = parseInt(parsedUrl.searchParams.get("limit") || "100", 10);
          const offset = parseInt(parsedUrl.searchParams.get("offset") || "0", 10);

          const result = this.storage.listProofs({
            status,
            recipient,
            poolAddress,
            limit,
            offset,
          });

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
          return;
        }

        // 5. Query Specific Proof by ID or Nullifier
        if (pathname.startsWith("/v1/proofs/") && method === "GET") {
          const key = pathname.replace("/v1/proofs/", "");
          const proof =
            this.storage.getProofById(key) ||
            this.storage.getProofByNullifier(key);

          if (!proof) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Proof not found" }));
            return;
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(proof));
          return;
        }

        // 6. List Settled Batches
        if (pathname === "/v1/batches" && method === "GET") {
          const recipient = parsedUrl.searchParams.get("recipient") || undefined;
          const limit = parseInt(parsedUrl.searchParams.get("limit") || "50", 10);
          const offset = parseInt(parsedUrl.searchParams.get("offset") || "0", 10);

          const result = this.storage.listBatches({
            recipient,
            limit,
            offset,
          });

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
          return;
        }

        // 7. Force Flush / Trigger Batch Withdrawal
        if ((pathname === "/v1/flush" || pathname === "/v1/batch/withdraw") && method === "POST") {
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", async () => {
            try {
              let parsedBody: any = {};
              if (body) {
                try {
                  parsedBody = JSON.parse(body);
                } catch {
                  // ignore non-json
                }
              }

              if (parsedBody.recipient) {
                const receipt = await this.flush(parsedBody.recipient);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ flushed: true, receipt }));
              } else {
                const receipts = await this.flushAll();
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    flushed: true,
                    batchesCount: receipts.length,
                    receipts,
                  })
                );
              }
            } catch (err: any) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // 8. Submit Proof for Ingestion & Batched Withdrawal
        if (
          (pathname === "/v1/submit-proof" || pathname === "/v1/proofs/submit") &&
          method === "POST"
        ) {
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", async () => {
            try {
              const data = JSON.parse(body);
              const payload = data.payload || data;
              if (!payload || !payload.proof || !payload.nullifierHash) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Missing required payload (proof, nullifierHash)" }));
                return;
              }

              const recipient = data.recipient || payload.recipient;
              const result = await this.ingest(payload, recipient, {
                poolAddress: data.poolAddress,
                chainId: data.chainId,
                denomination: data.denomination,
                amountFormatted: data.amountFormatted,
              });

              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(result));
            } catch (err: any) {
              const status = err.message.includes("Duplicate") || err.message.includes("Double-spend") ? 409 : 400;
              res.writeHead(status, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not Found" }));
      });

      this.server.listen(this.config.port, () => {
        resolve();
      });

      this.server.on("error", (err) => reject(err));
    });
  }
}
