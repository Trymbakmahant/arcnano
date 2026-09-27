"use client";

import React, { useState, useEffect } from "react";
import {
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Zap,
  ShieldCheck,
  ArrowRight,
  Copy,
  Check,
  Layers,
  Fuel,
} from "lucide-react";

interface StepDetail {
  id: number;
  label: string;
  sublabel: string;
  badge: string;
  duration: string;
  httpStatus?: string;
  codeSnippet: string;
  note: string;
}

export default function ArcAgentSimulator() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const steps: StepDetail[] = [
    {
      id: 1,
      label: "Agent Queries LLM Inference",
      sublabel: "HTTP GET /v1/chat/completions",
      badge: "HTTP REQ",
      duration: "1ms",
      httpStatus: "In Transit",
      codeSnippet: `GET /v1/models/claude-3-haiku/completions HTTP/1.1
Host: api.inference-gateway.arc
Accept: text/event-stream
User-Agent: LangChain-Agent/2.4 (ArcNano-Client)`,
      note: "Agent sends standard HTTP request with no payment attached. No wallet signature or on-chain transaction yet.",
    },
    {
      id: 2,
      label: "Gateway Issues HTTP 402 Challenge",
      sublabel: "Requires Shielded Nanopayment",
      badge: "RFC 402",
      duration: "4ms",
      httpStatus: "402 Payment Required",
      codeSnippet: `HTTP/1.1 402 Payment Required
Content-Type: application/json
Arc-Challenge-Root: 0x27b49f918c...b09e
Arc-Challenge-Amount: 1000 // 0.001 USDC ($0.001)
Arc-Recipient-Vault: 0x82A1...9F04
Arc-ASP-Root: 0x51c8e... // Association Set (Privacy Pools)`,
      note: "Gateway rejects unpaid request with current Arc Merkle tree root and ASP non-membership parameters.",
    },
    {
      id: 3,
      label: "Agent Proves Off-Chain (Groth16)",
      sublabel: "Zero-Knowledge Circuit Prover",
      badge: "ZK PROVE",
      duration: "34ms",
      httpStatus: "Off-Chain",
      codeSnippet: `// spend.circom (Off-Chain snarkjs execution)
Inputs: {
  root: 0x27b49f...,
  nullifierHash: 0x7c12a8..., // Unique spend ticket
  aspRoot: 0x51c8e...,        // Legitimate non-sanctioned set
  privateKey: [HIDDEN],       // Note secret never leaves memory
  pathIndices: [HIDDEN]
}
Result: Groth16 Proof Generated in 34ms (256 bytes)`,
      note: "Agent proves ownership of a 0.001 USDC note and non-membership in sanctions list without broadcasting any transaction.",
    },
    {
      id: 4,
      label: "Instant Verification & Token Stream",
      sublabel: "Sub-5ms Cryptographic Verification",
      badge: "HTTP 200",
      duration: "5ms",
      httpStatus: "200 OK Streaming",
      codeSnippet: `POST /v1/models/claude-3-haiku/completions HTTP/1.1
X-Arc-Proof-A: 0x18a9...
X-Arc-Proof-B: [[0x0f...],[0x22...]]
X-Arc-Nullifier: 0x7c12a8...99e1

HTTP/1.1 200 OK
Content-Type: text/event-stream
data: {"token": "Analysis", "done": false}
data: {"token": " complete.", "done": true}`,
      note: "Gateway cryptographically verifies Groth16 proof pairing in <5ms. Compute is unlocked immediately with zero block wait time.",
    },
    {
      id: 5,
      label: "Receiver-Batched Settlement on Arc",
      sublabel: "Circle Gas Station Sponsored",
      badge: "ARC L1",
      duration: "Sub-Second",
      httpStatus: "Batched Arc L1 Finality",
      codeSnippet: `// ArcShieldPool.sol :: settleBatch(nullifiers[], proofs[])
Broadcasted by: 0xGatewayRelayerAddress
Sponsored by: Circle Gas Station (Paymaster 0xCircleGas...)
Gas Token: Native USDC (Zero gas cost for AI Agent)
msg.sender on Arc: 0xGatewayRelayerAddress
Payer Linkability: MATHEMATICALLY 0.00%`,
      note: "Gateway batches 1,000 nanopayments into a single Arc transaction. The spender address is never seen on the Arc ledger.",
    },
  ];

  // Auto-play interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length) {
            setIsPlaying(false);
            return 1;
          }
          return prev + 1;
        });
      }, 3200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const activeStepData = steps[currentStep - 1];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeStepData.codeSnippet).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto my-12">
      <div className="bg-white/95 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] border border-neutral-200/90 shadow-2xl p-6 sm:p-10 md:p-12 relative overflow-hidden">
        {/* Arc Background Grid & Specular Ambient Highlights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/60 via-transparent to-transparent pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-200/80 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-mono text-sky-800 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
              <span>{"// 04 INTERACTIVE PROTOCOL PLAYGROUND"}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-neutral-950">
              Payments That Behave Like API Calls
            </h3>
            <p className="text-neutral-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Experience the end-to-end HTTP 402 lifecycle: sub-second ZK proof generation, instant off-chain verification, and gas-sponsored Arc settlement.
            </p>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
                isPlaying
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-neutral-950 text-white hover:bg-neutral-800"
              }`}
            >
              {isPlaying ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Pause Auto-Sim</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Live Simulation</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(1);
              }}
              title="Reset Simulation"
              className="p-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 my-8 relative z-10">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStep(step.id);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isActive
                    ? "bg-sky-50/80 border-sky-500/50 shadow-md ring-2 ring-sky-500/20"
                    : isCompleted
                    ? "bg-white border-emerald-500/30 text-neutral-800 hover:bg-neutral-50"
                    : "bg-neutral-50/80 border-neutral-200/80 text-neutral-400 hover:bg-neutral-100/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase font-semibold">
                    Step 0{step.id}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  ) : null}
                </div>
                <div
                  className={`text-xs font-medium leading-tight truncate ${
                    isActive ? "text-sky-950 font-semibold" : "text-neutral-700"
                  }`}
                >
                  {step.label}
                </div>
                <div className="text-[10px] font-mono text-neutral-500 mt-1">
                  {step.duration}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Simulation Showcase Window */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
          {/* Left: Technical Inspector & Code Terminal */}
          <div className="lg:col-span-8 bg-[#090D16] rounded-3xl border border-neutral-800 p-5 sm:p-7 text-white shadow-xl flex flex-col justify-between">
            <div>
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 mb-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-neutral-400 ml-2 font-mono text-[11px]">
                    arcnano-runtime :: {activeStepData.sublabel}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-neutral-300 border border-white/10">
                    {activeStepData.httpStatus}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{isCopied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Code Snippet Box */}
              <pre className="font-mono text-xs sm:text-[13px] text-sky-200/90 leading-relaxed overflow-x-auto py-2 whitespace-pre-wrap select-all">
                {activeStepData.codeSnippet}
              </pre>
            </div>

            {/* Note & Architectural Explanation */}
            <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-start gap-3 text-xs text-neutral-300">
              <Terminal className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-sans">{activeStepData.note}</p>
            </div>
          </div>

          {/* Right: Real-Time Protocol Guarantees & Metrics */}
          <div className="lg:col-span-4 bg-neutral-50/80 border border-neutral-200 rounded-3xl p-6 flex flex-col justify-between gap-6 shadow-sm">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold mb-4 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Active Cryptographic State</span>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">
                    Spender Identity Leakage
                  </div>
                  <div className="text-xl font-semibold text-emerald-600 mt-0.5">
                    0.00% Zero-Dox
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    No wallet broadcast, no msg.sender association.
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">
                    Proof Generation Latency
                  </div>
                  <div className="text-xl font-semibold text-neutral-900 mt-0.5 flex items-center gap-2">
                    <span>34 ms</span>
                    <span className="text-xs font-mono text-emerald-600 font-medium">
                      (In-Memory WASM)
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Poseidon circuit optimized for sub-50ms browser/agent provers.
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">
                    Agent Gas Token Requirement
                  </div>
                  <div className="text-xl font-semibold text-sky-600 mt-0.5 flex items-center gap-2">
                    <span>$0.00 (Zero Gas)</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Settlement gas is sponsored by Arc Circle Gas Station.
                  </div>
                </div>
              </div>
            </div>

            {/* Step navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <button
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-neutral-950 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                &larr; Previous Step
              </button>

              <button
                disabled={currentStep === steps.length}
                onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Arc Network Pillar Strip */}
        <div className="mt-8 pt-6 border-t border-neutral-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-900">Sub-Second Finality</div>
              <div className="text-[11px] text-neutral-500">Deterministic Arc L1</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Fuel className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-900">Circle Gas Station</div>
              <div className="text-[11px] text-neutral-500">Native USDC Sponsorship</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-900">Agentic Economic OS</div>
              <div className="text-[11px] text-neutral-500">Autonomous Machine Scale</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-900">Privacy Pools (ASP)</div>
              <div className="text-[11px] text-neutral-500">Clean OFAC Compliance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
