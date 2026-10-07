import { FastGroth16Verifier } from "../src/verifier.js";
import { SpendProofPayload } from "../src/types.js";

async function runBenchmark() {
  console.log("==========================================================");
  console.log("⚡ ArcNano Sub-8ms Verification Benchmark (Groth16 BN254)");
  console.log("==========================================================\n");

  const verifier = new FastGroth16Verifier();
  const recipient = "0x063829800C7214C6AaD38f57C72561641cD80333";
  const root = "15055926234077295509216400193975320613085685875483293700481590095656163448343";
  const nullifierHash = "20422268048524814187777998610497463970402096973561728977312170140886346563691";
  const aspRoot = "19128018104003351169958007405541096654276287024914820341236452486826146398487";

  const payload: SpendProofPayload = {
    proof: {
      a: [
        "1002345678901234567890123456789012345678901234567890123456789012",
        "2002345678901234567890123456789012345678901234567890123456789012",
      ],
      b: [
        [
          "3002345678901234567890123456789012345678901234567890123456789012",
          "4002345678901234567890123456789012345678901234567890123456789012",
        ],
        [
          "5002345678901234567890123456789012345678901234567890123456789012",
          "6002345678901234567890123456789012345678901234567890123456789012",
        ],
      ],
      c: [
        "7002345678901234567890123456789012345678901234567890123456789012",
        "8002345678901234567890123456789012345678901234567890123456789012",
      ],
    },
    root,
    nullifierHash,
    recipient,
    aspRoot,
  };

  // Warm-up runs
  for (let i = 0; i < 10; i++) {
    await verifier.verify(payload, recipient, { expectedRoot: root, expectedAspRoot: aspRoot });
  }

  const iterations = 1000;
  const latencies: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const res = await verifier.verify(payload, recipient, { expectedRoot: root, expectedAspRoot: aspRoot });
    latencies.push(res.latencyMs);
  }

  latencies.sort((a, b) => a - b);
  const avg = latencies.reduce((sum, v) => sum + v, 0) / latencies.length;
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  const min = latencies[0];
  const max = latencies[latencies.length - 1];

  console.log(`Completed ${iterations.toLocaleString()} iterations:`);
  console.log(`  • Minimum Latency:  ${min.toFixed(4)} ms`);
  console.log(`  • 50th Percentile:  ${p50.toFixed(4)} ms`);
  console.log(`  • Average Latency:  ${avg.toFixed(4)} ms`);
  console.log(`  • 95th Percentile:  ${p95.toFixed(4)} ms`);
  console.log(`  • 99th Percentile:  ${p99.toFixed(4)} ms`);
  console.log(`  • Max Latency:      ${max.toFixed(4)} ms`);
  console.log("\nTarget: < 8.000 ms");
  console.log(avg < 8 ? "✅ BENCHMARK PASSED: Sub-8ms requirement met!" : "❌ Failed requirement");
  console.log("==========================================================\n");
}

runBenchmark().catch(console.error);
