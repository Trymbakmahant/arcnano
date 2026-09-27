"use client";

import React, { useState, useEffect, useRef } from "react";
import SineRibbonBackground from "@/component/UI/SineRibbonBackground";
import VerticalCurvyStepper from "@/component/UI/VerticalCurvyStepper";
import ArcAgentSimulator from "@/component/UI/ArcAgentSimulator";
import ArcRoleTabs from "@/component/UI/ArcRoleTabs";
import {
  Radar,
  Unlink,
  ShieldBan,
  Gauge,
  ArrowDown,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Globe,
  Coins,
  ChevronDown,
} from "lucide-react";

export default function Home() {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string>("Copy GitHub Command");
  
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

  const copyCloneCommand = () => {
    navigator.clipboard.writeText("git clone https://github.com/trymbakmahant/p2pzkpayment.git").then(() => {
      setIsCopied(true);
      setCopyFeedback("Copied to Clipboard!");
      setTimeout(() => {
        setIsCopied(false);
        setCopyFeedback("Copy GitHub Command");
      }, 2200);
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
          <a className="flex items-center gap-2.5 text-neutral-950 pr-2 group" href="#">
            <div className="w-6 h-6 rounded-md bg-neutral-950 text-white flex items-center justify-center font-bold text-xs tracking-tighter shadow-sm">
              ▲
            </div>
            <span className="font-semibold text-sm tracking-tight text-neutral-950">
              ArcNano
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-neutral-100 text-neutral-600 border border-neutral-200">
              Protocol
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-600">
            <a className="hover:text-neutral-950 transition-colors" href="#about">What We Are</a>
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
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 max-w-7xl mx-auto relative z-10 py-12 md:py-16">
          {/* Glassmorphism Hero Card */}
          <div className="w-full max-w-5xl md:max-w-6xl liquid-glass-border shadow-2xl">
            <div className="w-full rounded-[40px] px-8 sm:px-14 md:px-20 py-12 md:py-16 liquid-glass flex flex-col items-center text-center relative overflow-hidden">
              {/* Prismatic glass refraction flares */}
              <div className="absolute -top-28 -left-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-28 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              {/* Glass specular top reflection sheen */}
              <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/[0.4] via-white/[0.1] to-transparent pointer-events-none rounded-t-[40px]" />

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-neutral-200/90 backdrop-blur-xl text-xs font-mono text-neutral-800 mb-6 shadow-sm relative z-10">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-neutral-900 font-semibold">Arc Ecosystem Protocol</span>
                <span className="text-neutral-300">•</span>
                <span className="text-amber-700 font-medium">Under Active Development</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-[-0.035em] text-neutral-950 max-w-4xl leading-[1.08] transition-colors relative z-10">
                Shielded Nanopayments
                <span className="block text-neutral-500 font-light mt-1.5">
                  For Autonomous AI Agents
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg md:text-xl text-neutral-600 font-normal max-w-3xl leading-relaxed tracking-tight transition-colors relative z-10">
                When autonomous AI agents pay for inference or data using public blockchain transactions, their wallet permanently logs every model call and trade secret. <strong className="text-neutral-900 font-medium">ArcNano</strong> is building private, compliant, sub-cent micropayments via native{" "}
                <span className="inline-flex items-center whitespace-nowrap font-mono text-xs px-2.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded font-semibold text-neutral-900 shadow-sm align-baseline">
                  HTTP 402
                </span>{" "}
                on the Arc Network.
              </p>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5 relative z-10">
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
            </div>
          </div>

          {/* Arc L1 Institutional Spec Ribbon (Direct arc.io inspiration) */}
          <div className="w-full max-w-5xl mx-auto mt-8 mb-2 relative z-10">
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
          <div className="mt-5 hidden sm:flex items-center justify-center">
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
                <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
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

        {/* SECTION 1: WHAT WE ARE (TAKES FULL VIEWPORT) */}
        <section className="py-20 px-4 max-w-7xl mx-auto relative z-10" id="about">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-[11px] font-mono uppercase tracking-wider text-sky-800 mb-3">
              {"// 02 ARCHITECTURE & MISSION"}
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-neutral-950">
              What Is ArcNano?
            </h2>
            <p className="text-neutral-600 text-base md:text-xl mt-4 leading-relaxed">
              ArcNano is an open-source zero-knowledge payment protocol engineered for the <strong className="text-neutral-950 font-medium">Arc Ecosystem</strong>, designed to enable true private machine-to-machine commerce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-neutral-200/90 hover:border-sky-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center mb-6">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-medium text-neutral-950 tracking-tight">
                  Zero-Knowledge for Agents
                </h3>
                <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                  Cryptographic payment infrastructure specifically designed for machine-to-machine interactions. Autonomous software agents and LLMs require private payments that do not dox their operational logic, prompt pipelines, or trading intelligence.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200/70 text-xs font-mono text-neutral-400">
                Poseidon Merkle Trees • Groth16
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-neutral-200/90 hover:border-emerald-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mb-6">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-medium text-neutral-950 tracking-tight">
                  Native Web Standard (x402)
                </h3>
                <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                  Instead of requiring manual wallet popups or custom RPC bridges, payments occur naturally over the Internet&apos;s standard <code className="font-mono text-xs text-neutral-900 bg-neutral-100 px-1 py-0.5 rounded">HTTP 402 Payment Required</code> protocol via standard HTTP request/response headers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200/70 text-xs font-mono text-neutral-400">
                RFC-Standardized Header Exchange
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-neutral-200/90 hover:border-amber-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mb-6">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-medium text-neutral-950 tracking-tight">
                  Purpose-Built for Arc
                </h3>
                <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                  Leveraging Arc&apos;s native Circle Gas Station (ERC-4337 Paymaster) and native USDC. Receiver-sponsored gas eliminates the need for agents to hold native gas tokens, preventing the gas-funding paper trail that destroys privacy.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-200/70 text-xs font-mono text-neutral-400">
                Circle Paymaster • Native USDC
              </div>
            </div>
          </div>

          {/* Arc.io Persona Segmentation Tabs */}
          <ArcRoleTabs />
        </section>

        {/* SECTION 2: THE PROBLEM WE ARE SOLVING (PUNCHY, 2-LINE SCAN) */}
        <section className="py-24 bg-[var(--section-alt-bg)] border-y border-[var(--card-border)] px-4 relative z-10 transition-colors overflow-hidden" id="problem">
          {/* Subtle atmospheric ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[900px] h-[450px] bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-xs font-mono uppercase tracking-wider text-rose-600 mb-4 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>{"// 03 THREAT MODEL & TRAPS"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-950 max-w-4xl mx-auto leading-[1.15]">
                Why Existing Machine Payments Fail for AI Agents
              </h2>
              <p className="text-neutral-600 text-base md:text-lg mt-4 max-w-2xl mx-auto">
                Paying for autonomous compute and LLM tools with public blockchain transactions creates 4 fatal traps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Problem 1 */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-7 md:p-8 border border-neutral-200/90 hover:border-rose-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center">
                        <Radar className="w-4 h-4 text-rose-600" />
                      </div>
                      <span className="text-xs font-mono uppercase tracking-wider text-rose-600 font-semibold">
                        01 • Surveillance
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md">
                      msg.sender Doxxing
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-medium text-neutral-950 tracking-tight">
                    Public Ledgers Dox Your AI Agents
                  </h3>
                  <p className="text-neutral-600 text-sm sm:text-base mt-2.5 leading-relaxed">
                    Standard crypto payments permanently log every prompt, tool call, and model supplier to block explorers for competitors to copy.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-200/70 flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Impact</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Zero business or prompt privacy
                  </span>
                </div>
              </div>

              {/* Problem 2 */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-7 md:p-8 border border-neutral-200/90 hover:border-amber-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
                        <Unlink className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="text-xs font-mono uppercase tracking-wider text-amber-600 font-semibold">
                        02 • Transport Leak
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md">
                      Naive ZK Trap
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-medium text-neutral-950 tracking-tight">
                    Naive ZK Still Leaks The Signer
                  </h3>
                  <p className="text-neutral-600 text-sm sm:text-base mt-2.5 leading-relaxed">
                    Even with a ZK proof, if the agent signs the transaction on-chain, its wallet address is broadcast to every node in the network.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-200/70 flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Impact</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Privacy broken at network layer
                  </span>
                </div>
              </div>

              {/* Problem 3 */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-7 md:p-8 border border-neutral-200/90 hover:border-rose-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center">
                        <ShieldBan className="w-4 h-4 text-rose-600" />
                      </div>
                      <span className="text-xs font-mono uppercase tracking-wider text-rose-600 font-semibold">
                        03 • Sanctions Ban
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md">
                      Mixer Ban
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-medium text-neutral-950 tracking-tight">
                    Mixers Are Blocked By Enterprise APIs
                  </h3>
                  <p className="text-neutral-600 text-sm sm:text-base mt-2.5 leading-relaxed">
                    Traditional mixers pool dirty and clean funds together, causing AI gateways, AWS, and Cloudflare to automatically blacklist them.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-200/70 flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Impact</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Banned by compliant API gateways
                  </span>
                </div>
              </div>

              {/* Problem 4 */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-7 md:p-8 border border-neutral-200/90 hover:border-amber-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
                        <Gauge className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="text-xs font-mono uppercase tracking-wider text-amber-600 font-semibold">
                        04 • Latency &amp; Gas
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-md">
                      Economic Trap
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-medium text-neutral-950 tracking-tight">
                    Block Times &amp; Gas Kill Nanopayments
                  </h3>
                  <p className="text-neutral-600 text-sm sm:text-base mt-2.5 leading-relaxed">
                    Waiting 10–15 seconds for a block stalls real-time agent loops, while gas fees cost 10x more than a $0.001 inference call.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-200/70 flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Impact</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Economically &amp; computationally broken
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW ARCNANO SOLVES IT */}
        <section className="py-24 max-w-7xl mx-auto px-4 relative z-10" id="solution">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono uppercase tracking-wider text-emerald-800 mb-3">
              {"// 05 ARCHITECTURAL RESOLUTION"}
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

          {/* Interactive Protocol Playground (arc.io inspiration) */}
          <ArcAgentSimulator />

          {/* Arc Ecosystem Reference Strip (Direct arc.io REF. 01 / REF. 02 inspiration) */}
          <div className="mt-20 pt-14 border-t border-neutral-200/80 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono font-semibold text-sky-800 uppercase tracking-wider mb-3">
                    {"// REF. 01 • ARC THESIS ON AGENTIC COMMERCE"}
                  </div>
                  <blockquote className="text-neutral-700 text-sm sm:text-base leading-relaxed italic">
                    &ldquo;Predictable low fees and deterministic sub-second finality make payments behave more like API calls: clear, fast, and settled with certainty. This unlocks high-frequency, sub-cent flows like nanopayments, enabling agents to pay, trade, retrieve data, coordinate, and do business at machine scale.&rdquo;
                  </blockquote>
                </div>
                <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-mono text-neutral-500">
                  <span>Source: Arc Platform Specification (arc.io)</span>
                  <span className="text-sky-700 font-semibold">[ARC-L1-SPEC]</span>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono font-semibold text-purple-800 uppercase tracking-wider mb-3">
                    {"// REF. 02 • THE ARCNANO SHIELDED PRINCIPLE"}
                  </div>
                  <blockquote className="text-neutral-700 text-sm sm:text-base leading-relaxed italic">
                    &ldquo;Decoupling the spender&apos;s msg.sender identity from the settlement transaction is the only way autonomous AI agents can consume commercial APIs without publishing their operational trade secrets to block explorers.&rdquo;
                  </blockquote>
                </div>
                <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-mono text-neutral-500">
                  <span>Source: ArcNano Architecture Whitepaper</span>
                  <span className="text-purple-700 font-semibold">[SPEC-x402]</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: DEVELOPMENT ROADMAP & COMING SOON */}
        <section className="py-24 bg-[var(--section-alt-bg)] border-t border-[var(--card-border)] px-4 relative z-10 transition-colors" id="roadmap">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-700 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>{"// 06 DEVELOPMENT ROADMAP"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-950">
                Development Roadmap
              </h2>
              <p className="text-neutral-600 text-base md:text-lg mt-4 leading-relaxed">
                We believe in total transparency. Here is our honest, step-by-step progress from architectural design to live testnet deployment on Arc.
              </p>
            </div>

            <div className="space-y-6">
              {/* Milestone 1 - Completed */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-neutral-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Milestone 1 • Completed
                    </span>
                    <span className="text-xs font-mono text-neutral-500">Research &amp; Specification</span>
                  </div>
                  <h3 className="text-xl font-medium text-neutral-950">
                    System Architecture &amp; Protocol Specification Formulation
                  </h3>
                  <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed">
                    Designed the two-stage HTTP 402 verification model, solved the <code className="font-mono text-xs text-neutral-900 bg-neutral-100 px-1 py-0.5 rounded">msg.sender</code> leakage via receiver-batched settlement, and authored the foundational protocol specification for the Arc ecosystem.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-mono shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Completed</span>
                </div>
              </div>

              {/* Milestone 2 - In Progress / Coming Soon */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 border-2 border-amber-500/40 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Milestone 2 • In Active Development
                    </span>
                    <span className="text-xs font-mono text-amber-700 font-medium">Coming Soon</span>
                  </div>
                  <h3 className="text-xl font-medium text-neutral-950">
                    Circom Circuits &amp; Arc Testnet Smart Contracts
                  </h3>
                  <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed">
                    Finalizing the 20-level Poseidon Merkle tree inclusion circuit (<code className="font-mono text-xs text-neutral-900 bg-neutral-100 px-1 py-0.5 rounded">spend.circom</code>), implementing Association Set non-membership constraints (<code className="font-mono text-xs text-neutral-900 bg-neutral-100 px-1 py-0.5 rounded">asp_check.circom</code>), and preparing <code className="font-mono text-xs text-neutral-900 bg-neutral-100 px-1 py-0.5 rounded">ArcShieldPool.sol</code> for deployment on Arc Testnet.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-amber-600 text-xs font-mono shrink-0 relative z-10">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span>In Progress</span>
                </div>
              </div>

              {/* Milestone 3 - Coming Soon */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-neutral-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-90">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                      Milestone 3 • Coming Soon
                    </span>
                    <span className="text-xs font-mono text-neutral-400">Developer Tooling</span>
                  </div>
                  <h3 className="text-xl font-medium text-neutral-950">
                    Autonomous Agent SDK &amp; Gateway Middleware
                  </h3>
                  <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed">
                    Building client libraries for autonomous AI frameworks (LangChain, AutoGPT, CrewAI) and drop-in Express/Fastify HTTP 402 middleware for API providers to verify ZK proofs in single-digit milliseconds.
                  </p>
                </div>
                <div className="text-neutral-500 text-xs font-mono shrink-0">
                  Coming Soon
                </div>
              </div>

              {/* Milestone 4 - Coming Soon */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-neutral-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-90">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                      Milestone 4 • Coming Soon
                    </span>
                    <span className="text-xs font-mono text-neutral-400">Live Ecosystem Pilot</span>
                  </div>
                  <h3 className="text-xl font-medium text-neutral-950">
                    Circle Gas Station Relayer &amp; AI Pilot on Arc
                  </h3>
                  <p className="text-sm text-neutral-600 max-w-2xl leading-relaxed">
                    Production integration with Arc&apos;s Circle Gas Station Paymaster for zero-gas settlement, followed by a live testnet pilot connecting autonomous AI agents to live inference providers.
                  </p>
                </div>
                <div className="text-neutral-500 text-xs font-mono shrink-0">
                  Coming Soon
                </div>
              </div>
            </div>

            {/* Coming Soon Callout Box */}
            <div className="mt-12 bg-neutral-950 rounded-3xl p-8 md:p-10 border border-neutral-800 text-white shadow-2xl text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-mono mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Open Source • Public Research</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-normal tracking-tight">
                Follow the Development of ArcNano
              </h3>
              <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto mt-3 leading-relaxed">
                As circuits, testnet contracts, and the agent client library are committed, all code is published openly on GitHub under the MIT License.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://github.com/trymbakmahant/p2pzkpayment"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-black hover:bg-neutral-200 text-xs sm:text-sm font-semibold px-6 py-3 rounded-full transition-all flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Star &amp; View Repository</span>
                </a>

                <button
                  onClick={copyCloneCommand}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs sm:text-sm font-mono px-5 py-3 rounded-full transition-all border border-neutral-700 cursor-pointer flex items-center gap-2"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copyFeedback}</span>
                </button>
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
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center text-xs font-bold shadow-sm">
                  ▲
                </div>
                <span className="text-base font-semibold tracking-tight text-white">ArcNano</span>
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
                <li><a className="hover:text-white transition-colors" href="#about">What Is ArcNano?</a></li>
                <li><a className="hover:text-white transition-colors" href="#about">Actor Perspectives</a></li>
                <li><a className="hover:text-white transition-colors" href="#problem">Threat Model &amp; Traps</a></li>
                <li><a className="hover:text-white transition-colors" href="#solution">Curvy Execution Stepper</a></li>
                <li><a className="hover:text-white transition-colors" href="#solution">Live Protocol Simulator</a></li>
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
