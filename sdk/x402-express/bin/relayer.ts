#!/usr/bin/env node
import { ArcNanoRelayerDaemon } from "../src/daemon.js";

const port = parseInt(process.env.PORT || "4040", 10);
const batchThreshold = parseInt(process.env.BATCH_THRESHOLD || "5", 10);
const flushIntervalMs = parseInt(process.env.FLUSH_INTERVAL_MS || "15000", 10);

const daemon = new ArcNanoRelayerDaemon({
  port,
  batchThreshold,
  flushIntervalMs,
});

async function main() {
  console.log("==================================================================");
  console.log("⚡ ArcNano Automated Batch Relayer Backend (Production-Grade)");
  console.log("🌐 Networks: Arc Testnet (5042002) & Arc Mainnet (5042)");
  console.log("💾 Storage: Persistent Disk Store (Atomically synced)");
  console.log("⛽ Gas Sponsor: Arc Circle Gas Station & Funded Relayer Wallet");
  console.log("==================================================================");

  await daemon.start();

  console.log(`\n📡 Available REST Endpoints:`);
  console.log(`  • POST http://localhost:${port}/v1/proofs/submit    - Ingest proof for batch withdrawal`);
  console.log(`  • GET  http://localhost:${port}/v1/queue            - Inspect pending withdrawal queues`);
  console.log(`  • GET  http://localhost:${port}/v1/proofs           - List stored proofs (filter by status/recipient)`);
  console.log(`  • GET  http://localhost:${port}/v1/proofs/:id       - Query specific proof settlement status`);
  console.log(`  • POST http://localhost:${port}/v1/batch/withdraw   - Trigger on-demand on-chain batch withdrawal`);
  console.log(`  • GET  http://localhost:${port}/v1/batches          - List historical settled batch transactions`);
  console.log(`  • GET  http://localhost:${port}/v1/status           - Daemon health, metrics, & wallet stats`);
  console.log("==================================================================\n");

  const shutdown = async () => {
    console.log("\n[RelayerDaemon] Gracefully terminating...");
    await daemon.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Fatal daemon error:", err);
  process.exit(1);
});
