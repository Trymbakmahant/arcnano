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
  console.log("⚡ ArcNano Automated Batch Relayer Daemon (Stage 04)");
  console.log("🌐 Network: Arc Testnet (Circle L1, Chain ID: 5042002)");
  console.log("⛽ Gas Sponsor: Arc Circle Gas Station (ERC-4337 Paymaster)");
  console.log("==================================================================");

  await daemon.start();

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
