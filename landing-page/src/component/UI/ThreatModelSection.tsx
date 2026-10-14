"use client";

import React, { memo } from "react";
import HeroCubeeCloud from "./HeroCubeeCloud";
import { Radar, Unlink, ShieldBan, Gauge } from "lucide-react";

export const PROBLEM_THOUGHTS = [
  "Trap 1: Public block explorers log every AI model call, prompt, and tool supplier.",
  "Trap 2: Naive ZK still leaks the signer's wallet when broadcasting on-chain.",
  "Trap 3: Mixers get blacklisted by enterprise APIs because dirty and clean funds pool together.",
  "Trap 4: 10 to 15 second block times stall real-time LLM loops and gas fees kill nanopayments.",
  "ArcNano resolves this through off-chain Groth16 proofs and ASP non-membership compliance.",
];

function ThreatModelSection() {
  return (
    <section
      className="py-24 bg-[var(--section-alt-bg)] border-y border-[var(--card-border)] px-4 relative z-10 transition-colors overflow-visible"
      id="problem"
    >
      {/* Subtle atmospheric ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[900px] h-[450px] bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-800 mb-4 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{"01 // Threat Model & Traps"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-950 max-w-4xl mx-auto leading-[1.15]">
            Why Existing Machine Payments Fail for AI Agents
          </h2>
          <p className="text-neutral-600 text-base md:text-lg mt-4 max-w-2xl mx-auto">
            Paying for autonomous compute and LLM tools with public blockchain transactions creates 4 fatal traps.
          </p>
        </div>

        {/* Mobile Mascot (< md) */}
        <div className="md:hidden flex justify-center mb-6">
          <HeroCubeeCloud
            sectionId="problem"
            sectionLabel="Threat Model"
            thoughts={PROBLEM_THOUGHTS}
            pretextTitle="ArcNano Threat Model & Fatal Traps"
            pretextHint="4 reasons standard public blockchain payments fail for AI agents"
            triggerSelector="#problem-card-middle"
          />
        </div>

        {/* Architectural Blueprint Grid */}
        <div className="relative bg-white border border-neutral-200/90 shadow-sm max-w-6xl mx-auto">
          {/* Sentinel to trigger Cubee Cloud animation when middle of card is visible */}
          <div
            id="problem-card-middle"
            className="absolute top-1/2 left-0 w-full h-1 pointer-events-none -translate-y-1/2"
          />

          {/* Top-Right Cloud Cubee */}
          <div className="hidden md:block absolute -right-3 sm:-right-6 md:-right-8 lg:-right-10 -top-[190px] z-30 pointer-events-auto">
            <HeroCubeeCloud
              sectionId="problem"
              sectionLabel="Threat Model"
              thoughts={PROBLEM_THOUGHTS}
              pretextTitle="ArcNano Threat Model & Fatal Traps"
              pretextHint="4 reasons standard public blockchain payments fail for AI agents"
              triggerSelector="#problem-card-middle"
              cloudPosition="left"
            />
          </div>

          {/* Corner and Intersection Architectural Ticks */}
          {/* Top-Left Corner ┌ */}
          <svg className="absolute -top-[1px] -left-[1px] w-5 h-5 pointer-events-none text-neutral-400 z-10" viewBox="0 0 20 20" fill="none">
            <path d="M1 20V1H20" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>

          {/* Top-Center T ┬ */}
          <svg className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-5 pointer-events-none text-neutral-400 hidden md:block z-10" viewBox="0 0 32 20" fill="none">
            <path d="M0 1H32M16 1V20" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>

          {/* Top-Right Corner ┐ */}
          <svg className="absolute -top-[1px] -right-[1px] w-5 h-5 pointer-events-none text-neutral-400 z-10" viewBox="0 0 20 20" fill="none">
            <path d="M19 20V1H0" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>

          {/* Middle-Left T ├ */}
          <svg className="absolute top-1/2 -left-[1px] -translate-y-1/2 w-5 h-8 pointer-events-none text-neutral-400 hidden md:block z-10" viewBox="0 0 20 32" fill="none">
            <path d="M1 0V32M1 16H20" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>

          {/* Center Crosshair + */}
          <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none text-neutral-400 hidden md:block z-10" viewBox="0 0 32 32" fill="none">
            <path d="M0 16H32M16 0V32" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>

          {/* Middle-Right T ┤ */}
          <svg className="absolute top-1/2 -right-[1px] -translate-y-1/2 w-5 h-8 pointer-events-none text-neutral-400 hidden md:block z-10" viewBox="0 0 20 32" fill="none">
            <path d="M19 0V32M19 16H0" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>

          {/* Bottom-Left Corner └ */}
          <svg className="absolute -bottom-[1px] -left-[1px] w-5 h-5 pointer-events-none text-neutral-400 z-10" viewBox="0 0 20 20" fill="none">
            <path d="M1 0V19H20" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>

          {/* Bottom-Center T ┴ */}
          <svg className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-8 h-5 pointer-events-none text-neutral-400 hidden md:block z-10" viewBox="0 0 32 20" fill="none">
            <path d="M0 19H32M16 19V0" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>

          {/* Bottom-Right Corner ┘ */}
          <svg className="absolute -bottom-[1px] -right-[1px] w-5 h-5 pointer-events-none text-neutral-400 z-10" viewBox="0 0 20 20" fill="none">
            <path d="M19 0V19H0" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>

          {/* 2x2 Architectural Grid Cells */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Cell 1: Surveillance */}
            <div
              className="p-8 sm:p-10 md:p-12 border-b md:border-r border-neutral-200/90 flex flex-col justify-between hover:bg-neutral-50/50 transition-colors duration-200 cursor-pointer"
              data-card="true"
              data-cubee-title="Trap 1: Public Ledgers Dox AI Agents"
              data-cubee-hint="Trap 1: Public transactions leak msg.sender, IP addresses, and trade secrets on block explorers every time an agent buys an LLM prompt!"
              data-cubee-anim="suspicious"
            >
              <div>
                <Radar className="w-7 h-7 text-amber-500 stroke-[1.5]" />
                <h3 className="text-2xl sm:text-[26px] font-normal text-neutral-900 tracking-tight leading-snug mt-5">
                  Public ledgers dox AI agents
                </h3>
                <p className="text-neutral-600 text-sm sm:text-[15px] mt-4 leading-relaxed">
                  Standard crypto payments permanently log every prompt, tool call, and model supplier to block explorers for competitors to copy.
                </p>
              </div>
            </div>

            {/* Cell 2: Transport Leak */}
            <div
              className="p-8 sm:p-10 md:p-12 border-b border-neutral-200/90 flex flex-col justify-between hover:bg-neutral-50/50 transition-colors duration-200 cursor-pointer"
              data-card="true"
              data-cubee-title="Trap 2: Naive ZK Still Leaks Signer"
              data-cubee-hint="Trap 2: Naive ZK still leaks the signer if the agent broadcasts on-chain! ArcNano decouples the signer via receiver-batched settlement."
              data-cubee-anim="scared"
            >
              <div>
                <Unlink className="w-7 h-7 text-amber-500 stroke-[1.5]" />
                <h3 className="text-2xl sm:text-[26px] font-normal text-neutral-900 tracking-tight leading-snug mt-5">
                  Naive ZK still leaks the signer
                </h3>
                <p className="text-neutral-600 text-sm sm:text-[15px] mt-4 leading-relaxed">
                  Even with a ZK proof, if the agent signs the transaction on-chain, its wallet address is broadcast to every node in the network.
                </p>
              </div>
            </div>

            {/* Cell 3: Sanctions Ban */}
            <div
              className="p-8 sm:p-10 md:p-12 border-b md:border-b-0 md:border-r border-neutral-200/90 flex flex-col justify-between hover:bg-neutral-50/50 transition-colors duration-200 cursor-pointer"
              data-card="true"
              data-cubee-title="Trap 3: Mixers Blocked By Enterprise APIs"
              data-cubee-hint="Trap 3: Mixers get blacklisted by OFAC because dirty funds mix with clean funds. ArcNano uses Association Set Provider (ASP) proofs to stay clean!"
              data-cubee-anim="angry"
            >
              <div>
                <ShieldBan className="w-7 h-7 text-amber-500 stroke-[1.5]" />
                <h3 className="text-2xl sm:text-[26px] font-normal text-neutral-900 tracking-tight leading-snug mt-5">
                  Mixers are blocked by enterprise APIs
                </h3>
                <p className="text-neutral-600 text-sm sm:text-[15px] mt-4 leading-relaxed">
                  Traditional mixers pool dirty and clean funds together, causing AI gateways, AWS, and Cloudflare to automatically blacklist them.
                </p>
              </div>
            </div>

            {/* Cell 4: Latency & Gas */}
            <div
              className="p-8 sm:p-10 md:p-12 flex flex-col justify-between hover:bg-neutral-50/50 transition-colors duration-200 cursor-pointer"
              data-card="true"
              data-cubee-title="Trap 4: Block Times & Gas Kill Nanopayments"
              data-cubee-hint="Trap 4: Waiting 10-15 seconds for a block stops LLM token streams! ArcNano verifies locally in under 8ms."
              data-cubee-anim="confused"
            >
              <div>
                <Gauge className="w-7 h-7 text-amber-500 stroke-[1.5]" />
                <h3 className="text-2xl sm:text-[26px] font-normal text-neutral-900 tracking-tight leading-snug mt-5">
                  Block times &amp; gas kill nanopayments
                </h3>
                <p className="text-neutral-600 text-sm sm:text-[15px] mt-4 leading-relaxed">
                  Waiting 10–15 seconds for a block stalls real-time agent loops, while gas fees cost 10x more than a $0.001 inference call.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ThreatModelSection);
