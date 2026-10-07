import { Request, Response, NextFunction } from "express";
import {
  X402MiddlewareOptions,
  X402Invoice,
  SpendProofPayload,
  VerifiedPaymentContext,
} from "./types.js";
import { NullifierCache } from "./cache.js";
import { FastGroth16Verifier } from "./verifier.js";
import { BatchSettlementManager } from "./batcher.js";

// Extend Express Request interface to include req.payment
declare global {
  namespace Express {
    interface Request {
      payment?: VerifiedPaymentContext;
    }
  }
}

/**
 * @title x402PaymentMiddleware
 * @notice Drop-in Express middleware providing sub-8ms off-chain ZK verification and HTTP 402 challenges
 * @param options Configuration for recipient address, pool contract, denomination, and batching
 */
export function x402PaymentMiddleware(options: X402MiddlewareOptions) {
  const recipient = options.recipient;
  const poolAddress = options.poolAddress || "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";
  const denomination = options.denomination || "10000"; // 0.01 USDC (6 decimals)
  const denominationFormatted = options.denominationFormatted || "0.01 USDC";
  const chainId = options.chainId || 5042002; // Arc Testnet
  const currentRoot = options.currentRoot || "0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c";
  const aspRoot = options.aspRoot || "0x0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b";

  // In-memory singletons for this middleware instance
  const cache = new NullifierCache();
  const verifier = new FastGroth16Verifier();
  const batcher = new BatchSettlementManager({
    recipient,
    poolAddress,
    batchSize: options.batchSize || 10,
    rpcUrl: options.rpcUrl,
    relayerPrivateKey: options.relayerPrivateKey,
  });

  return async function middleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const rawHeader = req.headers["x-payment"] || req.headers["authorization"];

    // 1. If no payment header present, challenge client with standard HTTP 402
    if (!rawHeader || (typeof rawHeader === "string" && !rawHeader.includes("X402") && !rawHeader.startsWith("{"))) {
      const invoice: X402Invoice = {
        pool: poolAddress,
        denomination,
        denominationFormatted,
        recipient,
        root: currentRoot,
        aspRoot,
        chainId,
        timestamp: Date.now(),
      };

      res.setHeader("WWW-Authenticate", `X402 realm="ArcNano", token="USDC", denomination="${denominationFormatted}"`);
      res.setHeader("X402-Pool", poolAddress);
      res.setHeader("X402-Denomination", denomination);
      res.setHeader("X402-Recipient", recipient);
      res.setHeader("X402-Root", currentRoot);
      res.setHeader("X402-Asp-Root", aspRoot);
      res.setHeader("X402-Chain-Id", chainId.toString());

      res.status(402).json({
        error: "Payment Required",
        status: 402,
        protocol: "X402",
        scheme: "ArcNano-Groth16",
        message: "Protected autonomous agent endpoint. Present a valid Groth16 spend proof in the X-PAYMENT header.",
        invoice,
      });
      return;
    }

    // 2. Parse proof payload from header
    let payload: SpendProofPayload;
    try {
      let headerStr = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
      if (headerStr.startsWith("X402 ")) {
        headerStr = headerStr.slice(5).trim();
      }

      // Check if base64 encoded
      if (!headerStr.startsWith("{")) {
        headerStr = Buffer.from(headerStr, "base64").toString("utf-8");
      }

      payload = JSON.parse(headerStr);
      payload.nullifierHash = payload.nullifierHash || (payload as any).nullifier_hash;
      payload.aspRoot = payload.aspRoot || (payload as any).asp_root;
    } catch (err: any) {
      res.status(400).json({
        error: "Bad Request",
        message: `Malformed X-PAYMENT header payload: ${err.message}`,
      });
      return;
    }

    // 3. Fast In-Memory Nullifier Check (<0.1ms off-chain double spend prevention)
    if (cache.has(payload.nullifierHash)) {
      res.status(409).json({
        error: "Conflict",
        code: "NULLIFIER_ALREADY_SPENT",
        message: "Off-chain double spend rejected: this note nullifier was already redeemed.",
        nullifierHash: payload.nullifierHash,
      });
      return;
    }

    // 4. Sub-8ms Fast Groth16 Off-Chain Verification
    const verification = await verifier.verify(payload, recipient, {
      expectedRoot: currentRoot,
      expectedAspRoot: aspRoot,
    });

    if (!verification.valid) {
      res.status(401).json({
        error: "Payment Authorization Failed",
        code: "INVALID_ZK_PROOF",
        reason: verification.reason,
        verificationLatencyMs: verification.latencyMs,
      });
      return;
    }

    // 5. Record nullifier in memory cache
    cache.record(payload.nullifierHash, recipient);

    // 6. Enqueue spend into batch settlement queue
    const { queuedCount } = await batcher.enqueue(payload);

    // 7. Inject verified context into request object
    const paymentContext: VerifiedPaymentContext = {
      nullifierHash: payload.nullifierHash,
      root: payload.root,
      recipient: payload.recipient,
      aspRoot: payload.aspRoot,
      denomination,
      verifiedAt: Date.now(),
      verificationLatencyMs: verification.latencyMs,
      settlementStatus: "queued",
      proof: payload.proof,
    };

    req.payment = paymentContext;

    // Attach performance headers
    res.setHeader("X-ArcNano-Verification-Time", `${verification.latencyMs.toFixed(2)}ms`);
    res.setHeader("X-ArcNano-Batch-Queue", queuedCount.toString());

    // 8. Proceed to downstream handler (e.g. streaming LLM tokens)
    next();
  };
}
