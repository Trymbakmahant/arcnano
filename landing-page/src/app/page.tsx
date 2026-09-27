"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import SineRibbonBackground from "@/component/UI/SineRibbonBackground";
import VerticalCurvyStepper from "@/component/UI/VerticalCurvyStepper";
import {
  Radar,
  Unlink,
  ShieldBan,
  Gauge,
  ArrowDown,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export default function Home() {
  // Spotlight grid mouse tracking
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track cursor position globally for spotlight overlay
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const marqueeItems = [
    "HTTP 402 Protocol",
    "Zero msg.sender Leakage",
    "Receiver-Batched Settlement",
    "Arc Circle Gas Station",
    "Privacy Pools ASP Checks",
    "Poseidon Merkle Vault",
    "Sub-Cent Machine Micropayments",
    "Autonomous AI Agent Swarms",
    "Arc Network Ecosystem",
    "Two-Stage Verification",
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans antialiased overflow-x-hidden selection:bg-sky-500 selection:text-white"
    >
      {/* Spotlight Grid Cursor Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, var(--spotlight-color), transparent 75%)`,
        }}
      />

      {/* Floating Navigation Bar */}
      <header className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-white/85 backdrop-blur-xl border border-black/[0.08] rounded-full px-5 py-2.5 flex items-center gap-4 sm:gap-6 shadow-lg shadow-black/[0.03] transition-all duration-300">
          <a className="flex items-center gap-2.5 pr-2 group cursor-pointer" href="#">
            <div className="w-7 h-7 rounded-lg bg-neutral-950 flex items-center justify-center shadow-xs p-1 group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/arcnano-icon-white.png"
                alt="ArcNano Icon"
                width={20}
                height={20}
                className="w-4 h-4 object-contain"
                priority
              />
            </div>
            <Image
              src="/arcnano-logo.png"
              alt="ArcNano"
              width={105}
              height={19}
              className="h-4.5 w-auto object-contain"
              priority
            />
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-neutral-100 text-neutral-600 border border-neutral-200">
              Protocol
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-600">
            <a className="hover:text-neutral-950 transition-colors" href="#blueprint">Blueprint</a>
            <a className="hover:text-neutral-950 transition-colors" href="#problem">The Problem</a>
            <a className="hover:text-neutral-950 transition-colors" href="#solution">How It Works</a>
            <a className="hover:text-neutral-950 transition-colors" href="#roadmap">Roadmap</a>
          </div>

          <div className="pl-2 border-l border-neutral-200 flex items-center gap-2.5">
            {/* Coming Soon Status Pill */}
            <a
              href="#roadmap"
              className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-800 text-xs font-medium px-3.5 py-1.5 rounded-full hover:bg-amber-500/20 transition-all shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Coming Soon</span>
            </a>
          </div>
        </nav>
      </header>

      <main className="relative">
        {/* Ambient Multi-Harmonic Sine Ribbon Background for Hero Section */}
        <div className="absolute top-0 inset-x-0 h-screen overflow-hidden pointer-events-none z-0">
          <SineRibbonBackground
            className="w-full h-full"
            palette="arc"
            speed={0.85}
            interactive={true}
            transparentBg={true}
            opacity={0.55}
          />
          {/* Soft fade out to background color at the bottom of the backdrop */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-app)] pointer-events-none" />
        </div>

        {/* Hero Section (100vh) */}
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 max-w-5xl mx-auto relative z-10 py-16 md:py-24">
          {/* Brand Logo Presentation */}
          <div className="mb-6 flex items-center justify-center">
            <Image
              src="/arcnano-logo.png"
              alt="ArcNano Logo"
              width={220}
              height={40}
              className="h-9 sm:h-11 w-auto object-contain"
              priority
            />
          </div>

     

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-[-0.035em] text-neutral-950 max-w-4xl leading-[1.08] transition-colors">
            Shielded Nanopayments
            <span className="block text-neutral-500 font-light mt-2">
              For Autonomous AI Agents
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-neutral-600 font-normal max-w-3xl leading-relaxed tracking-tight transition-colors">
            When autonomous AI agents pay for inference or data using public blockchain transactions, their wallet permanently logs every model call and trade secret. <strong className="text-neutral-900 font-medium">ArcNano</strong> is building private, compliant, sub-cent micropayments via native{" "}
            <span className="inline-flex items-center whitespace-nowrap font-mono text-xs px-2.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded font-semibold text-neutral-900 shadow-xs align-baseline">
              HTTP 402
            </span>{" "}
            on the Arc Network.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <a
              className="bg-neutral-950 text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold px-6 py-3 rounded-full transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
              href="#problem"
            >
              <span>The Problem We Are Solving</span>
              <ArrowDown className="w-4 h-4" />
            </a>

            <a
              className="bg-white/80 hover:bg-white text-neutral-800 border border-neutral-200 backdrop-blur-xl text-xs sm:text-sm font-medium px-5 py-3 rounded-full transition-all shadow-sm flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer"
              href="#roadmap"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Roadmap (Coming Soon)</span>
            </a>

            <a
              className="bg-white/60 hover:bg-white/90 text-neutral-600 hover:text-neutral-900 border border-neutral-200 backdrop-blur-xl text-xs sm:text-sm font-medium px-5 py-3 rounded-full transition-all shadow-sm flex items-center gap-1.5 hover:-translate-y-0.5 cursor-pointer"
              href="https://github.com/trymbakmahant/p2pzkpayment"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Arc L1 Institutional Spec Ribbon (Direct arc.io inspiration) */}
          <div className="w-full max-w-5xl mx-auto mt-12 mb-2">
            <div className="bg-white/80 backdrop-blur-xl border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-neutral-200/70">
              <div className="pt-2 md:pt-0 md:px-3 text-left">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{"// SETTLEMENT LAYER"}</div>
                <div className="text-sm font-semibold text-neutral-900 mt-0.5">Arc Network (Circle)</div>
                <div className="text-[11px] text-neutral-500 font-mono">Permissioned L1 Cohort</div>
              </div>
              <div className="pt-2 md:pt-0 md:px-3 text-left">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{"// GAS ENGINE"}</div>
                <div className="text-sm font-semibold text-neutral-900 mt-0.5">Circle Gas Station</div>
                <div className="text-[11px] text-neutral-500 font-mono">Native USDC Paymaster</div>
              </div>
              <div className="pt-2 md:pt-0 md:px-3 text-left">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{"// SETTLEMENT FINALITY"}</div>
                <div className="text-sm font-semibold text-neutral-900 mt-0.5">&lt; 500ms Deterministic</div>
                <div className="text-[11px] text-neutral-500 font-mono">Sub-second certainty</div>
              </div>
              <div className="pt-2 md:pt-0 md:px-3 text-left">
                <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{"// PRIVACY MECHANISM"}</div>
                <div className="text-sm font-semibold text-neutral-900 mt-0.5">Groth16 + Privacy Pools</div>
                <div className="text-[11px] text-neutral-500 font-mono">Opt-in OFAC compliance</div>
              </div>
            </div>
          </div>

          {/* Floating Glass Scroll Cue */}
          <div className="mt-8 hidden sm:flex items-center justify-center">
            <a
              href="#blueprint"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 hover:bg-white border border-neutral-200 backdrop-blur-xl text-[11px] font-mono uppercase tracking-widest text-neutral-600 hover:text-neutral-950 transition-all shadow-sm animate-bounce cursor-pointer"
            >
              <span>Protocol Architecture</span>
              <ChevronDown className="w-3.5 h-3.5 text-sky-600" />
            </a>
          </div>
        </section>

        {/* Architectural Blueprint Section (100vh) */}
        <section className="min-h-screen flex flex-col justify-center items-center px-4 max-w-7xl mx-auto relative z-10 py-12 md:py-20" id="blueprint">
          <div className="w-full rounded-[32px] md:rounded-[44px] p-2.5 md:p-3 bg-neutral-100 border border-neutral-200/90 shadow-2xl relative transition-colors group">
            <div className="w-full min-h-[460px] md:min-h-[540px] rounded-[24px] md:rounded-[36px] overflow-hidden relative flex flex-col justify-between p-6 sm:p-10 md:p-12 text-white bg-[#07090F] shadow-2xl">
              {/* Interactive Sine Ribbon Background Canvas */}
              <SineRibbonBackground
                className="absolute inset-0 z-0 w-full h-full"
                palette="arc"
                speed={0.9}
                interactive={true}
              />

              {/* Luminous vignette overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/40 pointer-events-none z-[1]" />
              
              {/* Top Banner inside Blueprint */}
              <div className="flex flex-wrap items-center justify-between gap-3 w-full relative z-10">
                <div className="flex items-center gap-2.5 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-mono">
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                    <Image
                      src="/arcnano-icon-white.png"
                      alt="ArcNano"
                      width={16}
                      height={16}
                      className="w-3.5 h-3.5 object-contain"
                    />
                  </div>
                  <span>{"// 01 PROTOCOL BLUEPRINT"}</span>
                </div>
                <div className="flex items-center gap-2 bg-amber-500/15 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-500/30 text-xs font-mono text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Specification &amp; Circuit Phase</span>
                </div>
              </div>

              {/* Center Conceptual Diagram */}
              <div className="relative z-10 my-8 py-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Phase 1</div>
                    <div className="text-base font-medium text-white mt-1">Shielded Note Deposit</div>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                      Agent commits fixed-tier USDC notes into a Poseidon Merkle tree on Arc, creating a uniform anonymity set.
                    </p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Phase 2</div>
                    <div className="text-base font-medium text-white mt-1">HTTP 402 Challenge</div>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                      Agent queries an AI inference API and receives an automated HTTP 402 challenge with root parameters.
                    </p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Phase 3</div>
                    <div className="text-base font-medium text-white mt-1">Off-Chain Groth16 Proof</div>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                      Agent proves note membership and ASP non-sanctioned compliance off-chain in memory without signing a tx.
                    </p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Phase 4</div>
                    <div className="text-base font-medium text-white mt-1">Receiver Arc Settlement</div>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                      Gateway verifies instantly and settles aggregated batches on Arc using Circle Gas Station sponsorship.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Info inside Blueprint */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-white/10 relative z-10 text-left">
                <div>
                  <span className="text-xs uppercase font-mono tracking-wider text-neutral-400">Core Cryptographic Guarantee</span>
                  <div className="text-sm sm:text-base font-light text-white/90 mt-0.5">
                    The spender never broadcasts an on-chain transaction. <code className="text-emerald-300 font-mono text-xs">msg.sender</code> linkability is mathematically eliminated.
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="#solution"
                    className="text-xs font-mono text-white/70 hover:text-white underline underline-offset-4 transition-colors"
                  >
                    Read Technical Breakdown &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Protocol Pillars Marquee */}
        <div className="w-full bg-white py-3.5 border-y border-neutral-200/90 overflow-hidden relative z-10 shadow-sm">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-mono text-neutral-600">
            {marqueeItems.concat(marqueeItems).map((item, idx) => (
              <span key={idx} className="flex items-center gap-8">
                <span className="font-medium text-neutral-800">{item}</span>
                <span className="text-sky-500">•</span>
              </span>
            ))}
          </div>
        </div>


        {/* SECTION 2: THE PROBLEM WE ARE SOLVING (PUNCHY, 2-LINE SCAN) */}
        <section className="py-24 bg-[var(--section-alt-bg)] border-y border-[var(--card-border)] px-4 relative z-10 transition-colors overflow-hidden" id="problem">
          {/* Subtle atmospheric ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[900px] h-[450px] bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-xs font-mono uppercase tracking-wider text-rose-600 mb-4 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>{"// 02 THREAT MODEL & TRAPS"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-950 max-w-4xl mx-auto leading-[1.15]">
                Why Existing Machine Payments Fail for AI Agents
              </h2>
              <p className="text-neutral-600 text-base md:text-lg mt-4 max-w-2xl mx-auto">
                Paying for autonomous compute and LLM tools with public blockchain transactions creates 4 fatal traps.
              </p>
            </div>

            {/* Architectural Blueprint Grid (Inspired by arc.io spec layout) */}
            <div className="relative bg-white border border-neutral-200/90 shadow-sm max-w-6xl mx-auto">
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
                <div className="p-8 sm:p-10 md:p-12 border-b md:border-r border-neutral-200/90 flex flex-col justify-between hover:bg-neutral-50/50 transition-colors duration-200">
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
                <div className="p-8 sm:p-10 md:p-12 border-b border-neutral-200/90 flex flex-col justify-between hover:bg-neutral-50/50 transition-colors duration-200">
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
                <div className="p-8 sm:p-10 md:p-12 border-b md:border-b-0 md:border-r border-neutral-200/90 flex flex-col justify-between hover:bg-neutral-50/50 transition-colors duration-200">
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
                <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-between hover:bg-neutral-50/50 transition-colors duration-200">
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

        {/* SECTION 3: HOW ARCNANO SOLVES IT */}
        <section className="py-24 max-w-7xl mx-auto px-4 relative z-10" id="solution">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono uppercase tracking-wider text-emerald-800 mb-3">
              {"// 03 ARCHITECTURAL RESOLUTION"}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-950">
              How ArcNano Solves Every Trap
            </h2>
            <p className="text-neutral-600 text-base md:text-lg mt-4 leading-relaxed">
              We architected ArcNano from first principles to decouple payments from identity, guarantee legal compliance, and deliver instant sub-second verification.
            </p>
          </div>

          {/* Animated Vertical Curvy Stepper */}
          <VerticalCurvyStepper />

         
        </section>

        {/* SECTION 4: DEVELOPMENT ROADMAP (ARC.IO DEVELOPER RESOURCES DESIGN - 100VH) */}
        <section className="w-full relative z-10" id="roadmap">
          <div className="min-h-screen flex flex-col justify-center py-16 md:py-24 px-6 sm:px-8 max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-700 mb-4 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>{"// 04 DEVELOPMENT ROADMAP"}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-950">
              Development roadmap
            </h2>
            <p className="text-neutral-600 text-base md:text-lg mt-3 max-w-2xl leading-relaxed">
              Transparent, step-by-step progress from foundational circuit formulation to live testnet deployment on Arc.
            </p>
          </div>

          {/* 4-Column Horizontal Minimalist Grid (Direct arc.io inspiration) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* Column 1: R.01 */}
            <div className="flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400 font-medium">{"// R.01"}</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Completed
                  </span>
                </div>
                {/* Thin divider line */}
                <div className="w-full h-[1px] bg-neutral-200/90 mt-3 mb-6 group-hover:bg-neutral-400 transition-colors" />

                <h3 className="text-xl sm:text-[22px] font-normal text-neutral-950 tracking-tight leading-snug flex items-start justify-between gap-2 group-hover:text-sky-600 transition-colors cursor-pointer">
                  <span>Architecture &amp; protocol spec</span>
                  <span className="text-neutral-400 group-hover:text-sky-600 transition-colors text-lg">&rarr;</span>
                </h3>

                <p className="text-neutral-600 text-sm leading-relaxed mt-3.5">
                  Formulated the two-stage HTTP 402 verification model, solved <code className="font-mono text-xs text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded">msg.sender</code> leakage via receiver-batched settlement, and authored the foundational protocol specification.
                </p>
              </div>
            </div>

            {/* Column 2: R.02 */}
            <div className="flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400 font-medium">{"// R.02"}</span>
                  <span className="text-amber-800 font-medium flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    In Progress
                  </span>
                </div>
                {/* Thin divider line */}
                <div className="w-full h-[1px] bg-amber-300/80 mt-3 mb-6 group-hover:bg-amber-500 transition-colors" />

                <h3 className="text-xl sm:text-[22px] font-normal text-neutral-950 tracking-tight leading-snug flex items-start justify-between gap-2 group-hover:text-amber-600 transition-colors cursor-pointer">
                  <span>Circom circuits &amp; testnet</span>
                  <span className="text-neutral-400 group-hover:text-amber-600 transition-colors text-lg">&rarr;</span>
                </h3>

                <p className="text-neutral-600 text-sm leading-relaxed mt-3.5">
                  Finalizing the 20-level Poseidon Merkle tree inclusion circuit (<code className="font-mono text-xs text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded">spend.circom</code>), ASP non-membership constraints, and preparing <code className="font-mono text-xs text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded">ArcShieldPool.sol</code> for Arc Testnet.
                </p>
              </div>
            </div>

            {/* Column 3: R.03 */}
            <div className="flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400 font-medium">{"// R.03"}</span>
                  <span className="text-neutral-500 font-normal text-[11px] bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    Coming Soon
                  </span>
                </div>
                {/* Thin divider line */}
                <div className="w-full h-[1px] bg-neutral-200/90 mt-3 mb-6 group-hover:bg-neutral-400 transition-colors" />

                <h3 className="text-xl sm:text-[22px] font-normal text-neutral-950 tracking-tight leading-snug flex items-start justify-between gap-2 group-hover:text-sky-600 transition-colors cursor-pointer">
                  <span>Agent SDK &amp; gateway tooling</span>
                  <span className="text-neutral-400 group-hover:text-sky-600 transition-colors text-lg">&rarr;</span>
                </h3>

                <p className="text-neutral-600 text-sm leading-relaxed mt-3.5">
                  Building client libraries for autonomous AI frameworks (LangChain, AutoGPT, CrewAI) and drop-in Express/Fastify HTTP 402 middleware for API providers to verify ZK proofs in single-digit milliseconds.
                </p>
              </div>
            </div>

            {/* Column 4: R.04 */}
            <div className="flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400 font-medium">{"// R.04"}</span>
                  <span className="text-neutral-500 font-normal text-[11px] bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    Coming Soon
                  </span>
                </div>
                {/* Thin divider line */}
                <div className="w-full h-[1px] bg-neutral-200/90 mt-3 mb-6 group-hover:bg-neutral-400 transition-colors" />

                <h3 className="text-xl sm:text-[22px] font-normal text-neutral-950 tracking-tight leading-snug flex items-start justify-between gap-2 group-hover:text-sky-600 transition-colors cursor-pointer">
                  <span>Circle Gas Station &amp; AI pilot</span>
                  <span className="text-neutral-400 group-hover:text-sky-600 transition-colors text-lg">&rarr;</span>
                </h3>

                <p className="text-neutral-600 text-sm leading-relaxed mt-3.5">
                  Production integration with Arc&apos;s Circle Gas Station Paymaster for zero-gas settlement, followed by a live testnet pilot connecting autonomous AI agents to live inference providers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* Main Footer (Inspired by arc.io clean taxonomy) */}
      <footer className="bg-[#090D16] text-white pt-16 pb-12 border-t border-neutral-800 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-16 border-b border-neutral-800">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center p-1.5 shadow-sm">
                  <Image
                    src="/arcnano-icon-white.png"
                    alt="ArcNano Icon"
                    width={24}
                    height={24}
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <Image
                  src="/arcnano-logo-white.png"
                  alt="ArcNano"
                  width={130}
                  height={24}
                  className="h-6 w-auto object-contain"
                />
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 text-neutral-300 border border-white/10">
                  Arc Native
                </span>
              </div>
              <p className="text-neutral-400 text-xs sm:text-sm max-w-sm leading-relaxed">
                Shielded zero-knowledge payment infrastructure purpose-built for autonomous machine-to-machine interactions and agentic economic activity on the Arc Network.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300 pt-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Active Research &amp; Circuit Implementation Phase</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-300 mb-4 font-semibold">
                {"// BUILD"}
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-400 font-sans">
                <li><a className="hover:text-white transition-colors" href="https://github.com/trymbakmahant/p2pzkpayment" target="_blank" rel="noopener noreferrer">Agent SDK Suite</a></li>
                <li><a className="hover:text-white transition-colors" href="#solution">Circom Prover (spend.circom)</a></li>
                <li><a className="hover:text-white transition-colors" href="#solution">ArcShieldPool.sol</a></li>
                <li><a className="hover:text-white transition-colors" href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer">Circle Testnet Faucet &rarr;</a></li>
                <li><a className="hover:text-white transition-colors" href="https://docs.arc.network" target="_blank" rel="noopener noreferrer">Arc Network Docs &rarr;</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-300 mb-4 font-semibold">
                {"// EXPLORE"}
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-400 font-sans">
                <li><a className="hover:text-white transition-colors" href="#blueprint">Protocol Blueprint</a></li>
                <li><a className="hover:text-white transition-colors" href="#problem">Threat Model &amp; Traps</a></li>
                <li><a className="hover:text-white transition-colors" href="#solution">How ArcNano Solves It</a></li>
                <li><a className="hover:text-white transition-colors" href="#solution">Architectural Resolution</a></li>
                <li><a className="hover:text-white transition-colors" href="#roadmap">Development Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-300 mb-4 font-semibold">
                {"// PROTOCOL & ARC"}
              </h4>
              <ul className="space-y-2.5 text-xs text-neutral-400 font-sans">
                <li><a className="hover:text-white transition-colors" href="https://www.arc.io/" target="_blank" rel="noopener noreferrer">Arc Platform (arc.io) &rarr;</a></li>
                <li><a className="hover:text-white transition-colors" href="https://circle.com" target="_blank" rel="noopener noreferrer">Circle Internet Group &rarr;</a></li>
                <li><a className="hover:text-white transition-colors" href="#solution">Circle Gas Station (Paymaster)</a></li>
                <li><a className="hover:text-white transition-colors" href="#solution">Privacy Pools (ASP Compliance)</a></li>
                <li><a className="hover:text-white transition-colors" href="https://github.com/trymbakmahant/p2pzkpayment/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT Open License</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 text-neutral-500 text-[11px] leading-relaxed font-sans max-w-4xl">
            <p>
              ArcNano is an open-source zero-knowledge protocol research project engineered for the Arc ecosystem. Arc is an open Layer-1 blockchain launched by Arc Network Services LLC and Circle Internet Group, Inc. USDC is issued by Circle.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-mono gap-4">
            <div>&copy; 2026 ArcNano Protocol &bull; MIT License.</div>
            <div className="flex items-center gap-6">
              <a className="hover:text-neutral-400 transition-colors" href="https://github.com/trymbakmahant/p2pzkpayment" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
              <span className="text-neutral-700">•</span>
              <a className="hover:text-neutral-400 transition-colors" href="https://www.arc.io" target="_blank" rel="noopener noreferrer">Arc Network</a>
              <span className="text-neutral-700">•</span>
              <a className="hover:text-neutral-400 transition-colors" href="#roadmap">Roadmap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
