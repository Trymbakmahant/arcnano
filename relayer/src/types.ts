export type ProofStatus = "queued" | "processing" | "settled" | "failed";
export type BatchStatus = "processing" | "settled" | "failed";

export interface Groth16Coordinates {
  a: [string, string];
  b: [[string, string], [string, string]];
  c: [string, string];
}

export interface SpendProofPayload {
  proof: Groth16Coordinates;
  root: string;
  nullifierHash: string;
  recipient?: string;
  aspRoot?: string;
}

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

export interface PendingQueueGroup {
  queueKey: string;
  chainId: number;
  poolAddress: string;
  recipient: string;
  denomination: string;
  proofs: StoredProof[];
  totalUsdc: string;
  count: number;
}

export interface RelayerConfig {
  port: number;
  batchThreshold: number;
  flushIntervalMs: number;
  defaultRecipient: string;
  poolAddress: string;
  rpcUrl: string;
  chainId: number;
  relayerPrivateKey?: string;
  storagePath?: string;
}
