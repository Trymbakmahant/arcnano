import { ethers } from "ethers";
import { SpendProofPayload, Groth16Proof } from "./types.js";

// ArcNanoPool ABI subset required for batch settlement
const ARC_NANO_POOL_ABI = [
  "function batchSpend((uint256[2] a, uint256[2][2] b, uint256[2] c, bytes32 root, bytes32 nullifierHash, bytes32 aspRoot)[] calldata proofs, address recipient) external",
  "function denomination() external view returns (uint256)",
  "function isSpent(bytes32 nullifierHash) external view returns (bool)",
  "event BatchSpend(address indexed relayer, address indexed recipient, uint256 count, uint256 totalAmount)",
];

export interface BatchItem {
  payload: SpendProofPayload;
  timestamp: number;
}

export interface SettlementReceipt {
  txHash?: string;
  batchCount: number;
  totalSettledUnits: string;
  recipient: string;
  timestamp: number;
  simulated: boolean;
}

export class BatchSettlementManager {
  private queue: BatchItem[] = [];
  private batchSize: number;
  private flushIntervalMs: number;
  private timer: NodeJS.Timeout | null = null;
  private recipient: string;
  private poolAddress: string;
  private rpcUrl: string;
  private relayerPrivateKey?: string;
  private settledHistory: SettlementReceipt[] = [];
  private onSettledCallback?: (receipt: SettlementReceipt) => void;

  constructor(options: {
    recipient: string;
    poolAddress?: string;
    batchSize?: number;
    flushIntervalMs?: number;
    rpcUrl?: string;
    relayerPrivateKey?: string;
    onSettled?: (receipt: SettlementReceipt) => void;
  }) {
    this.recipient = options.recipient;
    this.poolAddress = options.poolAddress || "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";
    this.batchSize = options.batchSize || 10;
    this.flushIntervalMs = options.flushIntervalMs || 30_000;
    this.rpcUrl = options.rpcUrl || "https://rpc.testnet.arc.network";
    this.relayerPrivateKey = options.relayerPrivateKey;
    this.onSettledCallback = options.onSettled;

    // Start background auto-flush interval
    this.startTimer();
  }

  private startTimer(): void {
    if (this.flushIntervalMs > 0 && !this.timer) {
      this.timer = setInterval(() => {
        if (this.queue.length > 0) {
          this.flush().catch((err) =>
            console.error("[ArcNano Batcher] Auto-flush failed:", err.message)
          );
        }
      }, this.flushIntervalMs);
      // Unref so process can exit cleanly in tests
      if (this.timer.unref) this.timer.unref();
    }
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Enqueue a verified note spend proof into the pending batch
   */
  public async enqueue(payload: SpendProofPayload): Promise<{ queuedCount: number; willFlush: boolean }> {
    this.queue.push({ payload, timestamp: Date.now() });

    const willFlush = this.queue.length >= this.batchSize;
    if (willFlush) {
      // Trigger batch flush asynchronously
      setImmediate(() => {
        this.flush().catch((err) =>
          console.error("[ArcNano Batcher] Threshold flush failed:", err.message)
        );
      });
    }

    return { queuedCount: this.queue.length, willFlush };
  }

  /**
   * Flushes current queued proofs and submits batchSpend to ArcNanoPool on Arc L1
   */
  public async flush(): Promise<SettlementReceipt | null> {
    if (this.queue.length === 0) return null;

    const itemsToSettle = [...this.queue];
    this.queue = [];

    // Format proofs into Solidity SpendProof[] struct format
    const formattedProofs = itemsToSettle.map(({ payload }) => {
      const p = payload.proof;
      return {
        a: [BigInt(p.a[0]), BigInt(p.a[1])],
        b: [
          [BigInt(p.b[0][0]), BigInt(p.b[0][1])],
          [BigInt(p.b[1][0]), BigInt(p.b[1][1])],
        ],
        c: [BigInt(p.c[0]), BigInt(p.c[1])],
        root: ethers.zeroPadValue(ethers.toBeHex(BigInt(payload.root)), 32),
        nullifierHash: ethers.zeroPadValue(ethers.toBeHex(BigInt(payload.nullifierHash)), 32),
        aspRoot: ethers.zeroPadValue(ethers.toBeHex(BigInt(payload.aspRoot)), 32),
      };
    });

    let receipt: SettlementReceipt;

    if (this.relayerPrivateKey) {
      try {
        const provider = new ethers.JsonRpcProvider(this.rpcUrl);
        const wallet = new ethers.Wallet(this.relayerPrivateKey, provider);
        const contract = new ethers.Contract(this.poolAddress, ARC_NANO_POOL_ABI, wallet);

        const tx = await contract.batchSpend(formattedProofs, this.recipient);
        const conf = await tx.wait(1);

        receipt = {
          txHash: conf.hash,
          batchCount: formattedProofs.length,
          totalSettledUnits: (formattedProofs.length * 10000).toString(),
          recipient: this.recipient,
          timestamp: Date.now(),
          simulated: false,
        };
      } catch (err: any) {
        // If settlement failed on-chain, re-queue items
        this.queue.unshift(...itemsToSettle);
        throw new Error(`On-chain batchSpend settlement failed: ${err.message}`);
      }
    } else {
      // Simulated off-chain batch accumulation
      receipt = {
        txHash: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        batchCount: formattedProofs.length,
        totalSettledUnits: (formattedProofs.length * 10000).toString(),
        recipient: this.recipient,
        timestamp: Date.now(),
        simulated: true,
      };
    }

    this.settledHistory.push(receipt);
    if (this.onSettledCallback) {
      this.onSettledCallback(receipt);
    }

    return receipt;
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getSettledHistory(): SettlementReceipt[] {
    return [...this.settledHistory];
  }
}
