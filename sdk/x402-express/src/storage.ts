import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { SpendProofPayload } from "./types.js";

export type ProofStatus = "queued" | "processing" | "settled" | "failed";
export type BatchStatus = "processing" | "settled" | "failed";

export interface StoredProof {
  id: string;
  nullifierHash: string;
  recipient: string;
  poolAddress: string;
  chainId: number;
  denomination: string; // e.g. "10000" (0.01 USDC) or "1000000" (1.00 USDC)
  amountFormatted: string; // e.g. "0.01 USDC"
  payload: SpendProofPayload;
  status: ProofStatus;
  createdAt: number;
  updatedAt: number;
  batchId?: string;
  txHash?: string;
  blockNumber?: number;
  explorerUrl?: string;
  error?: string;
}

export interface StoredBatch {
  id: string;
  recipient: string;
  poolAddress: string;
  chainId: number;
  denomination: string;
  proofCount: number;
  totalAmountFormatted: string;
  totalUnits: string;
  proofIds: string[];
  nullifiers: string[];
  status: BatchStatus;
  txHash?: string;
  blockNumber?: number;
  explorerUrl?: string;
  gasSponsoredUsd?: string;
  simulated: boolean;
  createdAt: number;
  settledAt?: number;
  error?: string;
}

export interface RelayerStoreData {
  version: number;
  updatedAt: number;
  proofs: Record<string, StoredProof>;
  batches: Record<string, StoredBatch>;
}

export interface StorageOptions {
  storagePath?: string;
}

export class RelayerStorage {
  private filePath: string;
  private proofs: Map<string, StoredProof> = new Map();
  private batches: Map<string, StoredBatch> = new Map();
  private nullifiers: Set<string> = new Set();

  constructor(options: StorageOptions = {}) {
    const defaultDir =
      process.env.RELAYER_STORE_DIR ||
      path.join(process.cwd(), "data");
    this.filePath =
      options.storagePath ||
      process.env.RELAYER_STORE_PATH ||
      path.join(defaultDir, "relayer_store.json");

    this.init();
  }

  private init(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err: any) {
        console.warn(`[RelayerStorage] Failed to create dir ${dir}:`, err.message);
      }
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const data: RelayerStoreData = JSON.parse(raw);
        if (data && data.proofs) {
          for (const [id, proof] of Object.entries(data.proofs)) {
            this.proofs.set(id, proof);
            this.nullifiers.add(this.normalizeNullifier(proof.nullifierHash));
          }
        }
        if (data && data.batches) {
          for (const [id, batch] of Object.entries(data.batches)) {
            this.batches.set(id, batch);
          }
        }
      } catch (err: any) {
        console.warn(
          `[RelayerStorage] Error loading store at ${this.filePath}, initializing fresh store:`,
          err.message
        );
      }
    }
  }

  public normalizeNullifier(nullifier: string): string {
    if (!nullifier || typeof nullifier !== "string") return "0x0";
    const clean = nullifier.toLowerCase().replace(/^0x/, "");
    return "0x" + clean.padStart(64, "0");
  }

  public normalizeAddress(addr: string): string {
    if (!addr || typeof addr !== "string") return "";
    return addr.toLowerCase();
  }

  private persist(): void {
    try {
      const data: RelayerStoreData = {
        version: 1,
        updatedAt: Date.now(),
        proofs: Object.fromEntries(this.proofs.entries()),
        batches: Object.fromEntries(this.batches.entries()),
      };

      const tempFile = `${this.filePath}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
      fs.renameSync(tempFile, this.filePath);
    } catch (err: any) {
      console.error(`[RelayerStorage] Atomic persist failed:`, err.message);
    }
  }

  /**
   * Checks if nullifier has already been recorded
   */
  public hasNullifier(nullifier: string): boolean {
    return this.nullifiers.has(this.normalizeNullifier(nullifier));
  }

  /**
   * Save a newly submitted proof into the queue
   */
  public saveProof(params: {
    payload: SpendProofPayload;
    recipient: string;
    poolAddress?: string;
    chainId?: number;
    denomination?: string;
    amountFormatted?: string;
  }): StoredProof {
    const normNullifier = this.normalizeNullifier(params.payload.nullifierHash);
    if (this.nullifiers.has(normNullifier)) {
      throw new Error(`Double-spend rejected: Nullifier ${normNullifier} already exists in relayer store.`);
    }

    const id = `proof_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const denomination = params.denomination || "10000";
    const amountFormatted =
      params.amountFormatted ||
      (denomination === "1000000" ? "1.00 USDC" : denomination === "100000" ? "0.10 USDC" : "0.01 USDC");

    const record: StoredProof = {
      id,
      nullifierHash: normNullifier,
      recipient: params.recipient,
      poolAddress: params.poolAddress || "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
      chainId: params.chainId || 5042002,
      denomination,
      amountFormatted,
      payload: params.payload,
      status: "queued",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.proofs.set(id, record);
    this.nullifiers.add(normNullifier);
    this.persist();

    return record;
  }

  public getProofById(id: string): StoredProof | undefined {
    return this.proofs.get(id);
  }

  public getProofByNullifier(nullifier: string): StoredProof | undefined {
    const norm = this.normalizeNullifier(nullifier);
    for (const proof of this.proofs.values()) {
      if (proof.nullifierHash === norm) return proof;
    }
    return undefined;
  }

  /**
   * Returns list of proofs with optional filtering and pagination
   */
  public listProofs(filter: {
    status?: ProofStatus;
    recipient?: string;
    poolAddress?: string;
    chainId?: number;
    limit?: number;
    offset?: number;
  } = {}): { proofs: StoredProof[]; total: number } {
    let list = Array.from(this.proofs.values());

    if (filter.status) {
      list = list.filter((p) => p.status === filter.status);
    }
    if (filter.recipient) {
      const target = this.normalizeAddress(filter.recipient);
      list = list.filter((p) => this.normalizeAddress(p.recipient) === target);
    }
    if (filter.poolAddress) {
      const target = this.normalizeAddress(filter.poolAddress);
      list = list.filter((p) => this.normalizeAddress(p.poolAddress) === target);
    }
    if (filter.chainId) {
      list = list.filter((p) => p.chainId === filter.chainId);
    }

    // Sort descending by creation time
    list.sort((a, b) => b.createdAt - a.createdAt);

    const total = list.length;
    const offset = filter.offset || 0;
    const limit = filter.limit || 100;
    const paginated = list.slice(offset, offset + limit);

    return { proofs: paginated, total };
  }

  /**
   * Groups all pending "queued" proofs into batches partitioned by (chainId, poolAddress, recipient)
   */
  public getPendingQueues(): Map<
    string,
    {
      queueKey: string;
      chainId: number;
      poolAddress: string;
      recipient: string;
      denomination: string;
      proofs: StoredProof[];
    }
  > {
    const map = new Map<
      string,
      {
        queueKey: string;
        chainId: number;
        poolAddress: string;
        recipient: string;
        denomination: string;
        proofs: StoredProof[];
      }
    >();

    for (const proof of this.proofs.values()) {
      if (proof.status === "queued") {
        const queueKey = `${proof.chainId}:${this.normalizeAddress(proof.poolAddress)}:${this.normalizeAddress(proof.recipient)}`;
        if (!map.has(queueKey)) {
          map.set(queueKey, {
            queueKey,
            chainId: proof.chainId,
            poolAddress: proof.poolAddress,
            recipient: proof.recipient,
            denomination: proof.denomination,
            proofs: [],
          });
        }
        map.get(queueKey)!.proofs.push(proof);
      }
    }

    return map;
  }

  /**
   * Creates a batch record and marks candidate proofs as "processing"
   */
  public createBatch(params: {
    proofs: StoredProof[];
    recipient: string;
    poolAddress: string;
    chainId: number;
    denomination: string;
  }): StoredBatch {
    const batchId = `batch_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const proofIds = params.proofs.map((p) => p.id);
    const nullifiers = params.proofs.map((p) => p.nullifierHash);

    const unitInt = BigInt(params.denomination);
    const totalUnitsBig = unitInt * BigInt(params.proofs.length);
    const totalUnits = totalUnitsBig.toString();
    const formattedUsdc = (Number(totalUnitsBig) / 1e6).toFixed(2) + " USDC";

    const batch: StoredBatch = {
      id: batchId,
      recipient: params.recipient,
      poolAddress: params.poolAddress,
      chainId: params.chainId,
      denomination: params.denomination,
      proofCount: params.proofs.length,
      totalAmountFormatted: formattedUsdc,
      totalUnits,
      proofIds,
      nullifiers,
      status: "processing",
      simulated: false,
      createdAt: Date.now(),
    };

    this.batches.set(batchId, batch);

    // Update proofs
    const now = Date.now();
    for (const proof of params.proofs) {
      proof.status = "processing";
      proof.batchId = batchId;
      proof.updatedAt = now;
      this.proofs.set(proof.id, proof);
    }

    this.persist();
    return batch;
  }

  /**
   * Finalizes a batch as settled with on-chain transaction details
   */
  public markBatchSettled(
    batchId: string,
    details: {
      txHash: string;
      blockNumber?: number;
      explorerUrl?: string;
      gasSponsoredUsd?: string;
      simulated?: boolean;
    }
  ): StoredBatch {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    const now = Date.now();
    batch.status = "settled";
    batch.txHash = details.txHash;
    batch.blockNumber = details.blockNumber;
    batch.explorerUrl = details.explorerUrl;
    batch.gasSponsoredUsd = details.gasSponsoredUsd;
    batch.simulated = !!details.simulated;
    batch.settledAt = now;

    this.batches.set(batchId, batch);

    // Mark proofs settled
    for (const proofId of batch.proofIds) {
      const proof = this.proofs.get(proofId);
      if (proof) {
        proof.status = "settled";
        proof.txHash = details.txHash;
        proof.blockNumber = details.blockNumber;
        proof.explorerUrl = details.explorerUrl;
        proof.updatedAt = now;
        this.proofs.set(proofId, proof);
      }
    }

    this.persist();
    return batch;
  }

  /**
   * Marks a batch and its proofs as failed (or re-queues them)
   */
  public markBatchFailed(
    batchId: string,
    error: string,
    requeueProofs = true
  ): StoredBatch {
    const batch = this.batches.get(batchId);
    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    const now = Date.now();
    batch.status = "failed";
    batch.error = error;
    this.batches.set(batchId, batch);

    for (const proofId of batch.proofIds) {
      const proof = this.proofs.get(proofId);
      if (proof) {
        if (requeueProofs) {
          proof.status = "queued";
          proof.batchId = undefined;
          proof.error = `Previous batch failed: ${error}`;
        } else {
          proof.status = "failed";
          proof.error = error;
        }
        proof.updatedAt = now;
        this.proofs.set(proofId, proof);
      }
    }

    this.persist();
    return batch;
  }

  /**
   * Returns list of settled or processing batches
   */
  public listBatches(filter: {
    status?: BatchStatus;
    recipient?: string;
    limit?: number;
    offset?: number;
  } = {}): { batches: StoredBatch[]; total: number } {
    let list = Array.from(this.batches.values());

    if (filter.status) {
      list = list.filter((b) => b.status === filter.status);
    }
    if (filter.recipient) {
      const target = this.normalizeAddress(filter.recipient);
      list = list.filter((b) => this.normalizeAddress(b.recipient) === target);
    }

    list.sort((a, b) => b.createdAt - a.createdAt);

    const total = list.length;
    const offset = filter.offset || 0;
    const limit = filter.limit || 50;

    return { batches: list.slice(offset, offset + limit), total };
  }

  /**
   * Aggregate statistics
   */
  public getStats(): {
    totalProofs: number;
    queuedProofs: number;
    processingProofs: number;
    settledProofs: number;
    failedProofs: number;
    totalBatches: number;
    settledBatches: number;
    totalSettledUsdc: string;
  } {
    let queued = 0;
    let processing = 0;
    let settled = 0;
    let failed = 0;
    let totalSettledUnits = 0n;

    for (const proof of this.proofs.values()) {
      if (proof.status === "queued") queued++;
      else if (proof.status === "processing") processing++;
      else if (proof.status === "settled") {
        settled++;
        totalSettledUnits += BigInt(proof.denomination || "10000");
      } else if (proof.status === "failed") failed++;
    }

    const settledBatches = Array.from(this.batches.values()).filter(
      (b) => b.status === "settled"
    ).length;

    return {
      totalProofs: this.proofs.size,
      queuedProofs: queued,
      processingProofs: processing,
      settledProofs: settled,
      failedProofs: failed,
      totalBatches: this.batches.size,
      settledBatches,
      totalSettledUsdc: `$${(Number(totalSettledUnits) / 1e6).toFixed(2)}`,
    };
  }
}
