import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  StoredProof,
  StoredBatch,
  PendingQueueGroup,
  SpendProofPayload,
  ProofStatus,
  BatchStatus,
} from "./types.js";

export interface RelayerStoreData {
  version: number;
  updatedAt: number;
  proofs: Record<string, StoredProof>;
  batches: Record<string, StoredBatch>;
}

export class ProofStorage {
  private filePath: string;
  private proofs: Map<string, StoredProof> = new Map();
  private batches: Map<string, StoredBatch> = new Map();
  private nullifiers: Set<string> = new Set();

  constructor(customPath?: string) {
    const defaultDir = path.join(process.cwd(), "data");
    this.filePath = customPath || process.env.RELAYER_STORE_PATH || path.join(defaultDir, "relayer_proofs.json");
    this.init();
  }

  private init(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err: any) {
        console.warn(`[ProofStorage] Failed to create data dir ${dir}:`, err.message);
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
        console.warn(`[ProofStorage] Error loading store at ${this.filePath}, initializing fresh store:`, err.message);
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

      const tempFile = `${this.filePath}.tmp.${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
      fs.renameSync(tempFile, this.filePath);
    } catch (err: any) {
      console.error(`[ProofStorage] Atomic persist failed:`, err.message);
    }
  }

  public hasNullifier(nullifier: string): boolean {
    return this.nullifiers.has(this.normalizeNullifier(nullifier));
  }

  public saveProof(params: {
    payload: SpendProofPayload;
    recipient: string;
    poolAddress?: string;
    chainId?: number;
    denomination?: string;
    amountFormatted?: string;
  }): StoredProof {
    const norm = this.normalizeNullifier(params.payload.nullifierHash);
    if (this.nullifiers.has(norm)) {
      throw new Error(`Double-spend rejected: Nullifier ${norm} has already been submitted or redeemed.`);
    }

    const id = `proof_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const denomination = params.denomination || "10000";
    const amountFormatted =
      params.amountFormatted ||
      (denomination === "1000000" ? "1.00 USDC" : denomination === "100000" ? "0.10 USDC" : "0.01 USDC");

    const record: StoredProof = {
      id,
      nullifierHash: norm,
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
    this.nullifiers.add(norm);
    this.persist();

    return record;
  }

  public getProof(idOrNullifier: string): StoredProof | undefined {
    if (this.proofs.has(idOrNullifier)) return this.proofs.get(idOrNullifier);
    const norm = this.normalizeNullifier(idOrNullifier);
    for (const p of this.proofs.values()) {
      if (p.nullifierHash === norm) return p;
    }
    return undefined;
  }

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

    list.sort((a, b) => b.createdAt - a.createdAt);
    const total = list.length;
    const offset = filter.offset || 0;
    const limit = filter.limit || 100;

    return { proofs: list.slice(offset, offset + limit), total };
  }

  public getPendingQueues(): Map<string, PendingQueueGroup> {
    const map = new Map<string, PendingQueueGroup>();

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
            totalUsdc: "0.00 USDC",
            count: 0,
          });
        }
        const group = map.get(queueKey)!;
        group.proofs.push(proof);
        group.count = group.proofs.length;
        const totalUnits = BigInt(group.denomination) * BigInt(group.count);
        group.totalUsdc = `${(Number(totalUnits) / 1e6).toFixed(2)} USDC`;
      }
    }

    return map;
  }

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
    const formattedUsdc = `${(Number(totalUnitsBig) / 1e6).toFixed(2)} USDC`;

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
    if (!batch) throw new Error(`Batch ${batchId} not found`);

    const now = Date.now();
    batch.status = "settled";
    batch.txHash = details.txHash;
    batch.blockNumber = details.blockNumber;
    batch.explorerUrl = details.explorerUrl;
    batch.gasSponsoredUsd = details.gasSponsoredUsd;
    batch.simulated = !!details.simulated;
    batch.settledAt = now;
    this.batches.set(batchId, batch);

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

  public markBatchFailed(
    batchId: string,
    error: string,
    requeueProofs = true
  ): StoredBatch {
    const batch = this.batches.get(batchId);
    if (!batch) throw new Error(`Batch ${batchId} not found`);

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

  public listBatches(filter: {
    recipient?: string;
    status?: BatchStatus;
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

  public getStats() {
    let queued = 0;
    let processing = 0;
    let settled = 0;
    let failed = 0;
    let totalSettledUnits = 0n;

    for (const p of this.proofs.values()) {
      if (p.status === "queued") queued++;
      else if (p.status === "processing") processing++;
      else if (p.status === "settled") {
        settled++;
        totalSettledUnits += BigInt(p.denomination || "10000");
      } else if (p.status === "failed") failed++;
    }

    const settledBatches = Array.from(this.batches.values()).filter((b) => b.status === "settled").length;

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
