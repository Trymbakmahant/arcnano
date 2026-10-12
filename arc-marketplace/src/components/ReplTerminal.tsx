import React from "react";
import { MarketplaceNode } from "./types";
import { Icon } from "./Icons";

interface ReplTerminalProps {
  selectedNode: MarketplaceNode;
  terminalState: "initial" | "running" | "done";
  onRunProtocol: () => void;
}

export function ReplTerminal({
  selectedNode,
  terminalState,
  onRunProtocol,
}: ReplTerminalProps) {
  return (
    <section id="repl-terminal-section" className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00DC82]"></span> Developer Playground
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Live Agent Execution Playground
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00DC82] animate-pulse"></span>
            <span className="font-mono text-xs text-slate-600">
              Target: <strong className="text-slate-900">{selectedNode.endpoint}</strong>
            </span>
          </div>
        </div>

        {/* Terminal Container */}
        <div className="w-full bg-[#0a0f1d] rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col">
          {/* Terminal Titlebar */}
          <div className="bg-slate-900/90 px-5 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="ml-2 font-mono text-xs text-slate-400">
                agent-terminal@arc-l1 ~ bash ({selectedNode.categoryBadge})
              </span>
            </div>
            <button
              onClick={onRunProtocol}
              className="px-3.5 py-1.5 rounded-lg bg-[#00DC82] text-slate-950 font-mono text-xs font-bold uppercase hover:bg-emerald-400 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              id="run-curl-btn"
            >
              <Icon name="play" />
              <span>Run Protocol Flow</span>
            </button>
          </div>

          {/* Terminal Body Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 p-6 gap-6 bg-[#070b14]">
            {/* Left: Request Stream */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="uppercase tracking-wider font-semibold">
                  1. Client Probe &amp; Signed Call
                </span>
                <span className="text-[#00DC82]">cURL / Python Agent</span>
              </div>
              <pre className="bg-[#0a0f1d] p-4 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed border border-slate-800">
                <span className="text-slate-500"># Autonomous probe targeting endpoint</span>
                {"\n"}
                <span className="text-[#00DC82] font-bold">$ </span>
                {selectedNode.curlSnippet}
              </pre>
            </div>

            {/* Right: Response Interception */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="uppercase tracking-wider font-semibold">
                  2. Gateway Wire Response Interception
                </span>
                <span className="text-[#00DC82] font-mono">Real-Time Trace</span>
              </div>
              <div
                className="bg-[#0a0f1d] p-4 rounded-xl font-mono text-xs space-y-2 h-[260px] overflow-y-auto border border-slate-800"
                id="terminal-output"
              >
                {terminalState === "running" && (
                  <div className="text-[#00DC82] animate-pulse">
                    Executing payment handshake for {selectedNode.endpoint}...
                  </div>
                )}
                {(terminalState === "initial" || terminalState === "done") && (
                  <>
                    <div className="text-red-400 font-bold">
                      &lt; HTTP/1.1 402 Payment Required
                    </div>
                    <div className="text-slate-400 text-[12px] leading-relaxed">
                      &lt; WWW-Authenticate: L402 token=&quot;AgEKbWFjYXJvb24...&quot;,
                      invoice=&quot;lnbc120n1p3...&quot;
                      <br />
                      &lt; X-402-Cost-USDC: {selectedNode.costNumeric}
                      <br />
                      &lt; X-402-Capability: {selectedNode.id}
                      <br />
                      &lt; X-402-Settlement-Deadline: 45s
                    </div>
                    <div className="text-slate-500 text-[12px] pt-1 border-t border-slate-800">
                      [Agent Runtime: Validating {selectedNode.price} budget threshold:
                      APPROVED]
                    </div>
                    <div className="text-[#00DC82] text-[12px]">
                      &gt;&gt; Arc L1 Channel 0x7f9b broadcast preimage:{" "}
                      <span className="text-cyan-300">0x9f402c89be117c...</span>
                    </div>
                    <div className="text-[#00DC82] font-bold pt-1">&lt; HTTP/1.1 200 OK</div>
                    <div className="text-slate-300 text-[12px]">
                      &#123; &quot;status&quot;: &quot;leased&quot;, &quot;capability&quot;: &quot;
                      {selectedNode.id}&quot;, &quot;gas_settled&quot;: true,
                      &quot;duration_ms&quot;: {selectedNode.latencyNumeric} &#125;
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

            {/* Terminal Micro Bar */}
          <div className="bg-slate-900 px-5 py-2.5 font-mono text-xs text-slate-400 flex flex-wrap items-center justify-between border-t border-slate-800">
            <span>Signer: Ed25519 Subkey (Ephemeral Agent Delegation)</span>
            <span className="text-[#00DC82] font-medium">
              Zero Signups. Deterministic Settlement.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
