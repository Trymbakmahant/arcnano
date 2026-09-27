"use client";

import React, { useState } from "react";
import {
  Bot,
  Server,
  Building2,
  CheckCircle2,
  Code2,
} from "lucide-react";

interface RoleFeature {
  title: string;
  description: string;
}

interface RoleData {
  id: string;
  tabLabel: string;
  badge: string;
  tagline: string;
  summary: string;
  icon: React.ElementType;
  features: RoleFeature[];
  codeLabel: string;
  codeSnippet: string;
}

export default function ArcRoleTabs() {
  const [activeTab, setActiveTab] = useState<string>("agents");

  const roles: RoleData[] = [
    {
      id: "agents",
      tabLabel: "For Autonomous Agents",
      badge: "AGENTIC WORKFLOWS",
      tagline: "Transact at machine scale with complete privacy.",
      summary:
        "Autonomous LLMs and multi-agent swarms require high-frequency, sub-cent micropayments without leaking their proprietary prompts, agent addresses, or pipeline graph.",
      icon: Bot,
      features: [
        {
          title: "Zero On-Chain Spender Footprint",
          description:
            "Agents never broadcast transactions or sign with a public key. Your agent's wallet address is never published to the Arc ledger.",
        },
        {
          title: "Zero Gas Token Overhead",
          description:
            "Agents never need to hold native gas tokens or manage gas balances. Settlement gas is fully sponsored via Arc's Circle Gas Station.",
        },
        {
          title: "Ultra-Fast In-Memory Prover",
          description:
            "Generate Groth16 zk-SNARK proofs in under 40 milliseconds using WebAssembly in Python, Node.js, or Rust agent environments.",
        },
      ],
      codeLabel: "agent-client.ts",
      codeSnippet: `import { ArcNanoClient } from "@arcnano/agent-sdk";

// Initialize shielded note vault in memory
const agent = new ArcNanoClient({ network: "arc-testnet" });
await agent.loadShieldedNotes({ vaultKey: process.env.AGENT_SECRET });

// Request inference — SDK handles HTTP 402 + ZK proof automatically
const response = await agent.fetchWithPayment("https://api.inference.arc/v1/chat", {
  method: "POST",
  body: JSON.stringify({ prompt: "Analyze market liquidity" })
});

console.log(await response.json()); // Settled in 42ms with 0.001 USDC note`,
    },
    {
      id: "providers",
      tabLabel: "For API & Model Providers",
      badge: "HTTP 402 INFRASTRUCTURE",
      tagline: "Instant sub-cent monetization with zero chargebacks.",
      summary:
        "AI inference hosts, vector database gateways, and data providers can monetize per-token or per-query with single-digit millisecond verification latency.",
      icon: Server,
      features: [
        {
          title: "Drop-In RFC 402 Middleware",
          description:
            "Integrate easily into Express, Fastify, Next.js, or Cloudflare Workers with three lines of code. No custom crypto bridges needed.",
        },
        {
          title: "Single-Digit Millisecond Verification",
          description:
            "Verify off-chain Groth16 cryptographic pairings in <5ms. Unlock API responses instantly before waiting for on-chain block mining.",
        },
        {
          title: "Direct USDC Balance Settlement",
          description:
            "Batched nullifiers redeem directly to your institutional USDC balance on the Arc Network with automated relayer aggregation.",
        },
      ],
      codeLabel: "gateway-middleware.ts",
      codeSnippet: `import { arc402Middleware } from "@arcnano/express-middleware";

app.use("/v1/models/*", arc402Middleware({
  pricePerCallUSDC: "0.001",
  recipientVault: "0x82A1...9F04",
  aspCheckRequired: true, // Validate non-sanctioned association set
  onVerified: async (proof, req) => {
    // Zero latency: stream LLM response immediately
    return streamInferenceTokens(req);
  }
}));`,
    },
    {
      id: "relayers",
      tabLabel: "For Relayers & Compliance",
      badge: "INSTITUTIONAL INTEGRITY",
      tagline: "Compliant privacy with Association Sets (ASP).",
      summary:
        "Unlike deprecated mixers that pool illicit and clean funds, ArcNano integrates Privacy Pools ASP criteria to guarantee institutional and regulatory safety.",
      icon: Building2,
      features: [
        {
          title: "Privacy Pools ASP Enforcement",
          description:
            "ZK circuits cryptographically prove the spender's note originates from an Association Set of non-sanctioned deposits without revealing the exact deposit.",
        },
        {
          title: "Circle Gas Station Integration",
          description:
            "Batch settlement transactions leverage Arc's native Circle Paymaster, paying gas in native USDC without volatile network token risk.",
        },
        {
          title: "Institutional Audit Trails",
          description:
            "Permits voluntary disclosure of viewing keys for enterprise tax, audit, and regulatory reporting while maintaining default privacy against competitors.",
        },
      ],
      codeLabel: "ArcShieldPool.sol",
      codeSnippet: `// Arc Network Smart Contract Interface
interface IArcShieldPool {
    /// @notice Settle aggregated agent nullifiers sponsored by Circle Gas Station
    function settleBatch(
        bytes32[] calldata nullifiers,
        uint256[8][] calldata zkProofs,
        bytes32 aspRoot
    ) external returns (bool success);
    
    /// @dev Validated against Arc validator cohort
    event BatchSettled(address indexed relayer, uint256 totalAmountUSDC);
}`,
    },
  ];

  const currentRole = roles.find((r) => r.id === activeTab) || roles[0];
  const IconComponent = currentRole.icon;

  return (
    <div className="w-full max-w-6xl mx-auto my-16">
      {/* Section Pre-Header & Title */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-mono text-neutral-700 mb-3">
          <span>{"// 03 ACTOR PERSPECTIVES"}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-950">
          Supporting AI As It Operates Today.
          <span className="block text-neutral-500 font-light mt-1">
            Built For What Comes Next.
          </span>
        </h2>
        <p className="text-neutral-600 text-base md:text-lg mt-3 leading-relaxed">
          ArcNano is engineered to integrate natively across every layer of the Arc economic platform.
        </p>

        {/* Tab Buttons (Styled like Arc.io) */}
        <div className="mt-8 inline-flex p-1.5 rounded-full bg-neutral-100 border border-neutral-200/90 shadow-inner">
          {roles.map((role) => {
            const isActive = activeTab === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveTab(role.id)}
                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-neutral-950 shadow-sm font-semibold"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                {role.tabLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tab Content Card */}
      <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] border border-neutral-200/90 p-6 sm:p-10 md:p-12 shadow-xl relative overflow-hidden transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Role Info & Feature Points */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200 uppercase">
                  {currentRole.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-medium text-neutral-950 mt-1">
                  {currentRole.tagline}
                </h3>
              </div>
            </div>

            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              {currentRole.summary}
            </p>

            {/* Feature List */}
            <div className="space-y-4 pt-2">
              {currentRole.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Code Sample Box */}
          <div className="lg:col-span-6">
            <div className="bg-[#090D16] rounded-3xl border border-neutral-800 p-5 sm:p-6 text-white shadow-xl overflow-hidden">
              <div className="flex items-center justify-between pb-3.5 border-b border-neutral-800 text-xs font-mono text-neutral-400 mb-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-sky-400" />
                  <span>{currentRole.codeLabel}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-neutral-300">
                  Arc SDK
                </span>
              </div>
              <pre className="font-mono text-xs sm:text-[12.5px] text-sky-200/90 leading-relaxed overflow-x-auto py-2 whitespace-pre-wrap">
                {currentRole.codeSnippet}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
