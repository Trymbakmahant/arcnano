/**
 * @title ArcNano X402 Types
 * @notice Type definitions for ArcNano HTTP X402 zero-knowledge micropayments
 */

export interface Groth16Proof {
  pi_a?: string[];
  pi_b?: string[][];
  pi_c?: string[];
  protocol?: string;
  curve?: string;
  // Compact form matching SpendProof in ArcNanoPool.sol
  a: [string, string];
  b: [[string, string], [string, string]];
  c: [string, string];
}

export interface SpendProofPayload {
  proof: Groth16Proof;
  root: string;
  nullifierHash: string;
  recipient: string;
  aspRoot: string;
}

export interface X402Invoice {
  pool: string;
  denomination: string;
  denominationFormatted: string;
  recipient: string;
  root: string;
  aspRoot: string;
  chainId: number;
  timestamp: number;
}

export interface VerifiedPaymentContext {
  nullifierHash: string;
  root: string;
  recipient: string;
  aspRoot: string;
  denomination: string;
  verifiedAt: number;
  verificationLatencyMs: number;
  settlementStatus: "queued" | "settled" | "skipped";
  proof: Groth16Proof;
}

export interface X402MiddlewareOptions {
  recipient: string;
  poolAddress?: string;
  denomination?: string; // in micro-units (default 10000 = 0.01 USDC)
  denominationFormatted?: string;
  chainId?: number;
  rpcUrl?: string;
  currentRoot?: string;
  aspRoot?: string;
  enableOffchainVerification?: boolean;
  autoBatchSettlement?: boolean;
  batchSize?: number;
  relayerPrivateKey?: string;
}
