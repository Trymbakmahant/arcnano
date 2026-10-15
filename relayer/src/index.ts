import { serve } from "@hono/node-server";
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { createRelayerApp } from "./app.js";

// Load environment variables (.env, ../contracts/.env, ../landing-page/.env.local)
dotenv.config();

const envLocations = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../contracts/.env"),
  path.resolve(process.cwd(), "../landing-page/.env.local"),
];

for (const loc of envLocations) {
  if (fs.existsSync(loc)) {
    dotenv.config({ path: loc });
  }
}

const port = parseInt(process.env.PORT || "4040", 10);
const batchThreshold = parseInt(process.env.BATCH_THRESHOLD || "5", 10);
const flushIntervalMs = parseInt(process.env.FLUSH_INTERVAL_MS || "15000", 10);
const rpcUrl = process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network";
const chainId = parseInt(process.env.ARC_CHAIN_ID || "5042002", 10);
const poolAddress = process.env.POOL_ADDRESS || "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";
const relayerPrivateKey = process.env.AGENT_B_PRIVATE_KEY || process.env.ARC_RELAYER_KEY;

const { app, settlement } = createRelayerApp({
  port,
  batchThreshold,
  flushIntervalMs,
  rpcUrl,
  chainId,
  poolAddress,
  relayerPrivateKey,
});

// Periodic background auto-flush timer
let flushTimer: NodeJS.Timeout | null = null;
if (flushIntervalMs > 0) {
  flushTimer = setInterval(() => {
    settlement.flushAll().catch((err: any) => {
      console.error("[RelayerDaemon] Background periodic flush error:", err.message);
    });
  }, flushIntervalMs);
  if (flushTimer.unref) flushTimer.unref();
}

console.log("==================================================================");
console.log("⚡ ArcNano Batch Relayer Backend (Hono.js + TypeScript)");
console.log(`🌐 Network:      Arc Testnet (${chainId}) / Arc Mainnet (5042)`);
console.log(`📡 RPC Endpoint: ${rpcUrl}`);
console.log(`🏊 Default Pool: ${poolAddress}`);
console.log(`⚙️  Batch Size:   ${batchThreshold} notes per withdrawal batch`);
console.log(`⏱️  Auto Flush:   Every ${flushIntervalMs / 1000}s`);

const walletInfo = settlement.getRelayerWalletInfo();
if (walletInfo.configured) {
  console.log(`🔑 Relayer Wallet: ${walletInfo.address} (Live on-chain broadcast active)`);
} else {
  console.log(`⚠️  Relayer Wallet: Not configured (Operating in gas-sponsored simulation mode)`);
}

console.log("==================================================================");

const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`\n🚀 Relayer HTTP Server running at http://localhost:${info.port}`);
    console.log(`\nAvailable REST Endpoints:`);
    console.log(`  • GET  http://localhost:${info.port}/                 - Status & API index`);
    console.log(`  • GET  http://localhost:${info.port}/v1/status        - Health check & relayer wallet balance`);
    console.log(`  • POST http://localhost:${info.port}/v1/proofs/submit - Ingest spend proof for batch withdrawal`);
    console.log(`  • GET  http://localhost:${info.port}/v1/queue         - Inspect pending queues partitioned by recipient`);
    console.log(`  • GET  http://localhost:${info.port}/v1/proofs        - List stored proofs (filter by status/recipient)`);
    console.log(`  • GET  http://localhost:${info.port}/v1/proofs/:id    - Query individual proof status`);
    console.log(`  • POST http://localhost:${info.port}/v1/batch/withdraw- Trigger on-chain batch withdrawal now`);
    console.log(`  • GET  http://localhost:${info.port}/v1/batches       - List settled batch transactions`);
    console.log("==================================================================\n");
  }
);

const shutdown = () => {
  console.log("\n[RelayerDaemon] Gracefully terminating...");
  if (flushTimer) clearInterval(flushTimer);
  server.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
