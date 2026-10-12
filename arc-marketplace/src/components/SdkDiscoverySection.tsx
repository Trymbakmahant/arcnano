import React, { useState } from "react";
import { MarketplaceNode } from "./types";
import { Icon } from "./Icons";

interface SdkDiscoverySectionProps {
  selectedNode: MarketplaceNode;
  allNodes: MarketplaceNode[];
  onSelectNode: (node: MarketplaceNode) => void;
}

export function SdkDiscoverySection({
  selectedNode,
  allNodes,
  onSelectNode,
}: SdkDiscoverySectionProps) {
  const [activeTab, setActiveTab] = useState<"python" | "typescript" | "curl">("python");
  const [copied, setCopied] = useState<boolean>(false);

  const cleanEndpointPath = selectedNode.endpoint.replace(/^(GET|POST|RPC|WSS)\s+/, "");
  const method = selectedNode.endpoint.startsWith("GET") ? "GET" : "POST";

  const pythonSnippet = `# 1. Install autonomous agent SDK:
# pip install arczk-agent

from arczk import ArcAgentClient, NoteVault

# 2. Load local shielded note vault (zero msg.sender exposure)
vault = NoteVault("~/.arcnano/agent_vault.json")

# 3. Initialize autonomous agent client with Arcnano Marketplace registry
client = ArcAgentClient(
    vault=vault,
    registry_url="https://marketplace.arcnano.xyz/api/v1/agents"
)

# 4. Programmatically discover capability: "${selectedNode.name}"
target_agent = client.discover_agent(agent_id="${selectedNode.id}")
print(f"Target found: {target_agent.endpoint} | Rate: {target_agent.price}")

# 5. Call endpoint via Arcnano Zero-Knowledge privacy payment:
# Client detects HTTP 402, generates Groth16 BN254 proof in RAM, 
# and fulfills invoice to recipient "${selectedNode.ownerArcId || "provider.arc"}" in <8ms!
response = client.call_marketplace_agent(
    agent_id="${selectedNode.id}",
    payload={
        "task": "execute_autonomous_step",
        "inputs": {"context": "Arc L1 machine commerce query"}
    }
)

print("Agent Response:", response.json())`;

  const tsSnippet = `// 1. Install Arcnano SDK:
// pnpm add @arcnano/sdk

import { ArcAgentClient, ShieldedNoteVault } from "@arcnano/sdk";

// 2. Initialize agent note vault from private subkey
const vault = new ShieldedNoteVault({
  storagePath: "~/.arcnano/notes.vault",
  network: "arc-testnet-5042002"
});

// 3. Connect autonomous agent client
const agent = new ArcAgentClient({
  vault,
  arcId: "buyer-agent.arc"
});

// 4. Query registry & execute capability: ${selectedNode.name}
// Settle on ArcNanoPool (0xa40d...76Ca) without revealing buyer balance
const result = await agent.executeMarketplaceCapability({
  agentId: "${selectedNode.id}",
  endpoint: "https://api.x402.org${cleanEndpointPath}",
  method: "${method}",
  body: { query: "Autonomous agent execution payload" },
  payment: {
    maxPriceUsdc: "${selectedNode.costNumeric}",
    zkGroth16: true,
    aspComplianceProof: true
  }
});

console.log("Shielded Response:", result.data);`;

  const curlSnippet = `# Step 1: Programmatically query the live marketplace registry
$ curl -s https://marketplace.arcnano.xyz/api/v1/agents?category=${encodeURIComponent(
    selectedNode.categoryShort
  )}

# Step 2: Probe the agent endpoint (returns 402 Challenge)
$ curl -i -X ${method} https://api.x402.org${cleanEndpointPath} \\
  -H "Content-Type: application/json"

# < HTTP/1.1 402 Payment Required
# < WWW-Authenticate: X402 recipient="${selectedNode.ownerArcId || "provider.arc"}" pool="0xa40d...76Ca" cost="${selectedNode.costNumeric}"

# Step 3: Agent signs Groth16 zero-knowledge proof from note vault and pays:
$ curl -i -X ${method} https://api.x402.org${cleanEndpointPath} \\
  -H "Authorization: X402 proof=0x89ab... nullifier=0x42f7..." \\
  -H "X-Arcnano-Recipient: ${selectedNode.ownerArcId || "provider.arc"}" \\
  -H "Content-Type: application/json" \\
  -d '{"task": "autonomous_work"}'

# < HTTP/1.1 200 OK (Settled in ${selectedNode.latency})`;

  const activeSnippet =
    activeTab === "python" ? pythonSnippet : activeTab === "typescript" ? tsSnippet : curlSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12" id="sdk-discovery">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
        {/* Header block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00DC82]"></span>
              Arcnano Autonomous Agent SDK
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Autonomous Discovery &amp; Privacy Payment Flow
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Any external AI agent (LangChain, CrewAI, AutoGPT, or custom sub-worker) can discover
              agents in this marketplace and pay for API calls using Arcnano shielded ZK payments.
            </p>
          </div>

          {/* Target Selector Dropdown */}
          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
            <label className="text-xs font-mono text-slate-500">Target Capability to Call:</label>
            <select
              value={selectedNode.id}
              onChange={(e) => {
                const found = allNodes.find((n) => n.id === e.target.value);
                if (found) onSelectNode(found);
              }}
              className="bg-slate-50 border border-[#e2e8f0] rounded-lg px-3 py-1.5 font-mono text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#0a0f1d] cursor-pointer"
            >
              {allNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.price})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Node Architecture HUD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400">Target Endpoint</span>
            <div className="font-mono text-xs font-bold text-slate-900 truncate mt-1">
              {selectedNode.endpoint}
            </div>
            <span className="text-[10px] text-emerald-700 font-mono mt-0.5">
              SLA: {selectedNode.latency}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400">Recipient Arc ID</span>
            <div className="font-mono text-xs font-bold text-slate-900 truncate mt-1">
              {selectedNode.ownerArcId || "provider.arc"}
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              Shielded Stealth Address
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400">Payment Verification</span>
            <div className="font-mono text-xs font-bold text-slate-900 mt-1">
              Arc Shielded
            </div>
            <span className="text-[10px] text-[#00DC82] font-mono mt-0.5 font-semibold">
              Privacy Preserved
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400">Micro-Rate</span>
            <div className="font-mono text-xs font-bold text-slate-900 mt-1">
              {selectedNode.price}
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              {selectedNode.priceUnit}
            </span>
          </div>
        </div>

        {/* Code Block Container */}
        <div className="bg-[#0a0f1d] rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
          {/* Tabs bar */}
          <div className="bg-slate-900/90 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 flex-wrap gap-2">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setActiveTab("python")}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                  activeTab === "python"
                    ? "bg-[#00DC82] text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Python (arczk-agent)
              </button>
              <button
                onClick={() => setActiveTab("typescript")}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                  activeTab === "typescript"
                    ? "bg-[#00DC82] text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                TypeScript (@arcnano/sdk)
              </button>
              <button
                onClick={() => setActiveTab("curl")}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                  activeTab === "curl"
                    ? "bg-[#00DC82] text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                cURL / Direct Call
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/api/v1/agents"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-slate-400 hover:text-[#00DC82] transition-colors underline mr-2"
              >
                Inspect Registry JSON ↗
              </a>
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>{copied ? "✓ Copied!" : "Copy Code"}</span>
              </button>
            </div>
          </div>

          {/* Code content */}
          <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed bg-[#070b14]">
            <code>{activeSnippet}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
