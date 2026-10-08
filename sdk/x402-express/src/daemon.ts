import http from "node:http";
import { ethers } from "ethers";
import { SpendProofPayload } from "./types.js";
import { CirclePaymasterClient, SponsoredSettlementReceipt } from "./paymaster.js";
import { NullifierCache } from "./cache.js";

export interface DaemonConfig {
  port?: number;
  batchThreshold?: number;
  flushIntervalMs?: number;
  defaultRecipient?: string;
  poolAddress?: string;
  rpcUrl?: string;
  relayerPrivateKey?: string;
  paymasterUrl?: string;
  enableHttpServer?: boolean;
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
}

export class ArcNanoRelayerDaemon {
  private config: Required<DaemonConfig>;
  private queue: IngestedItem[] = [];
  private cache: NullifierCache;
  private paymaster: CirclePaymasterClient;
  private server: http.Server | null = null;
  private timer: NodeJS.Timeout | null = null;
  private startedAt: number = Date.now();
  private totalIngested: number = 0;
  private totalSettledNotes: number = 0;
  private totalBatchesSettled: number = 0;
  private totalGasSponsoredUsd: number = 0;
  private lastSettlementReceipt?: SponsoredSettlementReceipt;

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
        "https://rpc.testnet.arc.network",
      relayerPrivateKey:
        config.relayerPrivateKey ?? process.env.ARC_RELAYER_KEY ?? "",
      paymasterUrl:
        config.paymasterUrl ??
        process.env.ARC_PAYMASTER_URL ??
        "https://gas-station.testnet.arc.network/v1",
      enableHttpServer: config.enableHttpServer ?? true,
    };

    this.cache = new NullifierCache();
    this.paymaster = new CirclePaymasterClient({
      paymasterUrl: this.config.paymasterUrl,
      rpcUrl: this.config.rpcUrl,
      poolAddress: this.config.poolAddress,
      relayerPrivateKey: this.config.relayerPrivateKey || undefined,
    });
  }

  /**
   * Starts the relayer daemon service and HTTP listener
   */
  public async start(): Promise<void> {
    this.startedAt = Date.now();

    // Start background flush timer
    if (this.config.flushIntervalMs > 0) {
      this.timer = setInterval(() => {
        if (this.queue.length > 0) {
          this.flush().catch((err) =>
            console.error("[RelayerDaemon] Scheduled flush failed:", err.message)
          );
        }
      }, this.config.flushIntervalMs);
      if (this.timer.unref) this.timer.unref();
    }

    if (this.config.enableHttpServer) {
      await this.startHttpServer();
    }

    console.log(
      `[RelayerDaemon] 🚀 ArcNano Batch Relayer active | Queue threshold: ${this.config.batchThreshold} | Flush: ${this.config.flushIntervalMs}ms | Circle Paymaster: ON`
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
   * Ingest a verified note proof into the pending batch buffer
   */
  public async ingest(
    payload: SpendProofPayload,
    recipient?: string
  ): Promise<{ success: boolean; queuedCount: number; id: string }> {
    const targetRecipient = recipient || this.config.defaultRecipient;
    const nullifier = payload.nullifierHash;

    // 1. Off-chain deduplication check
    if (this.cache.has(nullifier)) {
      throw new Error(`Duplicate nullifier detected: ${nullifier.slice(0, 16)}...`);
    }

    // 2. Mark in local cache
    this.cache.record(nullifier, targetRecipient);

    const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.queue.push({
      id,
      payload,
      recipient: targetRecipient,
      receivedAt: Date.now(),
    });
    this.totalIngested++;

    // 3. Check if threshold reached
    if (this.queue.length >= this.config.batchThreshold) {
      setImmediate(() => {
        this.flush().catch((err) =>
          console.error("[RelayerDaemon] Threshold flush failed:", err.message)
        );
      });
    }

    return {
      success: true,
      queuedCount: this.queue.length,
      id,
    };
  }

  /**
   * Flushes queued proofs and executes sponsored batch settlement on Arc Testnet
   */
  public async flush(): Promise<SponsoredSettlementReceipt | null> {
    if (this.queue.length === 0) return null;

    const items = [...this.queue];
    this.queue = [];

    const payloads = items.map((i) => i.payload);
    // Group by recipient or use primary recipient
    const recipient = items[0].recipient;

    try {
      const receipt = await this.paymaster.executeSponsoredBatch(
        payloads,
        recipient
      );

      this.totalBatchesSettled++;
      this.totalSettledNotes += items.length;
      const gasSavedFloat = parseFloat(
        receipt.gasSponsoredEstimatedValueUsd.replace("$", "")
      );
      this.totalGasSponsoredUsd += isNaN(gasSavedFloat) ? 0 : gasSavedFloat;
      this.lastSettlementReceipt = receipt;

      console.log(
        `[RelayerDaemon] ⚡ Settle Batch: ${receipt.batchCount} notes -> Recipient: ${recipient.slice(0, 8)}... | Tx: ${receipt.txHash.slice(0, 18)}... | Sponsor: ${receipt.sponsor}`
      );

      return receipt;
    } catch (err: any) {
      // Re-queue on failure
      this.queue.unshift(...items);
      console.error(`[RelayerDaemon] Settlement failure: ${err.message}`);
      throw err;
    }
  }

  /**
   * Returns live daemon metrics
   */
  public getMetrics(): DaemonMetrics {
    return {
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      totalIngested: this.totalIngested,
      totalSettledNotes: this.totalSettledNotes,
      totalBatchesSettled: this.totalBatchesSettled,
      totalGasSponsoredUsd: `$${this.totalGasSponsoredUsd.toFixed(4)}`,
      currentQueueLength: this.queue.length,
      lastSettlementTimestamp: this.lastSettlementReceipt?.timestamp,
      lastTxHash: this.lastSettlementReceipt?.txHash,
    };
  }

  private startHttpServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(async (req, res) => {
        const url = req.url || "/";
        const method = req.method || "GET";

        if (url === "/v1/status" && method === "GET") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              status: "running",
              metrics: this.getMetrics(),
              config: {
                batchThreshold: this.config.batchThreshold,
                flushIntervalMs: this.config.flushIntervalMs,
                poolAddress: this.config.poolAddress,
                sponsor: "Arc Circle Gas Station Paymaster",
              },
            })
          );
          return;
        }

        if (url === "/v1/metrics" && method === "GET") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(this.getMetrics()));
          return;
        }

        if (url === "/v1/flush" && method === "POST") {
          try {
            const receipt = await this.flush();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ flushed: true, receipt }));
          } catch (err: any) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        if (url === "/v1/submit-proof" && method === "POST") {
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", async () => {
            try {
              const data = JSON.parse(body);
              if (!data.payload || !data.payload.proof) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Missing payload.proof" }));
                return;
              }

              const result = await this.ingest(data.payload, data.recipient);
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(result));
            } catch (err: any) {
              const status = err.message.includes("Duplicate") ? 409 : 400;
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
