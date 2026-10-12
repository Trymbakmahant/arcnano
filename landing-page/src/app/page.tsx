"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import SineRibbonBackground from "@/component/UI/SineRibbonBackground";
import VerticalCurvyStepper from "@/component/UI/VerticalCurvyStepper";
import RoadmapCarousel from "@/component/UI/RoadmapCarousel";
import CornerTicks from "@/component/UI/CornerTicks";
import HeroCubeeCloud from "@/component/UI/HeroCubeeCloud";

const BLUEPRINT_THOUGHTS = [
  "Phase 1: Fixed-tier USDC notes in a 20-level Merkle tree create uniform anonymity! 🌲",
  "Phase 2: X402 HTTP challenge returns invoice & tree root for instant inference! ⚡",
  "Phase 3: Off-chain Groth16 proof in ~74ms eliminates mempool doxing completely! 🔒",
  "Phase 4: Provider batches settlements to Arc L1 with $0.00 agent gas fees! 🚀",
];
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

  // Active Section Tracker for Teleporting Cubee Companion
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    const sectionIds = ["hero", "blueprint", "problem", "solution", "roadmap"];

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportMid = scrollY + window.innerHeight * 0.45;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top + scrollY;
          if (viewportMid >= top) {
            setActiveSection(sectionIds[i]);
            return;
          }
        }
      }
      setActiveSection("hero");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    "X402 Protocol",
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
      className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans antialiased overflow-x-clip selection:bg-sky-500 selection:text-white"
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
            <a className="text-amber-600 hover:text-amber-700 font-semibold transition-colors flex items-center gap-1" href="/demo">
              <span>Demo</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            </a>
            <a className="text-sky-600 hover:text-sky-700 font-semibold transition-colors flex items-center gap-1" href="/playground">
              <span>Playground</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            </a>
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
        <section className="min-h-screen lg:h-screen lg:max-h-screen flex flex-col justify-between items-center text-center px-4 max-w-6xl xl:max-w-7xl mx-auto relative z-10 pt-20 pb-4 md:pt-24 md:pb-6 overflow-visible" id="hero">
          {/* Main content centered within 100vh */}
          <div className="flex-1 flex flex-col justify-center items-center w-full my-auto">
            {/* Brand Logo Presentation */}
            <div className="mb-4 sm:mb-5 flex items-center justify-center">
              <Image
                src="/arcnano-logo.png"
                alt="ArcNano Logo"
                width={220}
                height={40}
                className="h-8 sm:h-10 w-auto object-contain"
                priority
              />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-[-0.035em] text-neutral-950 max-w-4xl leading-[1.08] transition-colors">
              Shielded Nanopayments
              <span className="block text-neutral-500 font-light mt-1.5 sm:mt-2">
                For Autonomous AI Agents
              </span>
            </h1>

            <div className="relative w-full max-w-3xl mx-auto">
              <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-neutral-600 font-normal leading-relaxed tracking-tight transition-colors">
                When autonomous AI agents pay for inference or data using public blockchain transactions, their wallet permanently logs every model call and trade secret. <strong className="text-neutral-900 font-medium">ArcNano</strong> is building private, compliant, sub-cent micropayments via native{" "}
                <span className="inline-flex items-center whitespace-nowrap font-mono text-xs px-2.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded font-semibold text-neutral-900 shadow-xs align-baseline">
                  X402
                </span>{" "}
                on the Arc Network.
              </p>

              {/* Desktop Mascot with Thought Cloud */}
              <div className="hidden xl:block absolute left-[calc(100%-12px)] 2xl:left-[calc(100%+16px)] bottom-0 z-20 pointer-events-auto">
                <HeroCubeeCloud
                  sectionId="hero"
                  sectionLabel="Hero Overview"
                />
              </div>
            </div>

            {/* Screens below xl (1280px and down) inline centered view */}
            <div className="xl:hidden mt-6 mb-2 flex justify-center w-full">
              <HeroCubeeCloud
                sectionId="hero"
                sectionLabel="Hero Overview"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                className="bg-neutral-950 text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold px-6 py-2.5 sm:py-3 rounded-full transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                href="#problem"
                data-cubee-hint="Curious why normal crypto fails AI agents? Let's explore the 4 fatal traps of public mempools!"
                data-cubee-anim="suspicious"
              >
                <span>The Problem We Are Solving</span>
                <ArrowDown className="w-4 h-4" />
              </a>

              <a
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-500/30 backdrop-blur-xl text-xs sm:text-sm font-medium px-5 py-2.5 sm:py-3 rounded-full transition-all shadow-sm flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer"
                href="/demo"
                data-cubee-hint="Explore our cryptographic architecture flowchart with sub-8ms off-chain verification!"
                data-cubee-anim="curious"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Flowchart Demo</span>
              </a>

              <a
                className="bg-white/80 hover:bg-white text-neutral-800 border border-neutral-200 backdrop-blur-xl text-xs sm:text-sm font-medium px-5 py-2.5 sm:py-3 rounded-full transition-all shadow-sm flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer"
                href="#roadmap"
                data-cubee-hint="Check out our roadmap: 20-level Merkle tree circuits, Python SDK for LangChain/CrewAI, and Arc testnet deployment!"
                data-cubee-anim="working"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Roadmap (Coming Soon)</span>
              </a>

              <a
                className="bg-white/60 hover:bg-white/90 text-neutral-600 hover:text-neutral-900 border border-neutral-200 backdrop-blur-xl text-xs sm:text-sm font-medium px-5 py-2.5 sm:py-3 rounded-full transition-all shadow-sm flex items-center gap-1.5 hover:-translate-y-0.5 cursor-pointer"
                href="https://github.com/Trymbakmahant/arcnano"
                target="_blank"
                rel="noopener noreferrer"
                data-cubee-hint="Go check our codebase on GitHub! Don't forget to star ⭐ the repo!"
                data-cubee-anim="excited"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                className="bg-white/60 hover:bg-white/90 text-neutral-600 hover:text-neutral-900 border border-neutral-200 backdrop-blur-xl text-xs sm:text-sm font-medium px-5 py-2.5 sm:py-3 rounded-full transition-all shadow-sm flex items-center gap-1.5 hover:-translate-y-0.5 cursor-pointer"
                href="https://x.com/0xarcnano"
                target="_blank"
                rel="noopener noreferrer"
                data-cubee-hint="Follow @0xarcnano on X for real-time protocol updates and testnet releases!"
                data-cubee-anim="playful"
              >
                <span>X (@0xarcnano)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Arc L1 Institutional Spec Ribbon (Direct arc.io inspiration) */}
            <div className="w-full max-w-5xl mx-auto mt-6 sm:mt-8 mb-1">
              <div className="relative bg-white/80 backdrop-blur-xl border border-neutral-200/90 p-3 sm:p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 divide-y md:divide-y-0 md:divide-x divide-neutral-200/70 group">
                {/* Architectural Blueprint Corner Ticks ┌ ┐ └ ┘ */}
                <CornerTicks activeColor="text-neutral-400 group-hover:text-amber-500" />
                <div
                  className="pt-2 md:pt-0 md:px-3 text-left cursor-pointer transition-colors hover:bg-neutral-50/60 p-2 rounded-lg"
                  data-card="true"
                  data-cubee-title="Arc Network (Circle L1)"
                  data-cubee-hint="Why Arc? Arc L1 is built with Circle for deterministic <500ms finality and native USDC gas paymasters, giving AI agents a stable, zero-volatility economy!"
                  data-cubee-anim="proud"
                >
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{"// SETTLEMENT LAYER"}</div>
                  <div className="text-sm font-semibold text-neutral-900 mt-0.5">Arc Network (Circle)</div>
                  <div className="text-[11px] text-neutral-500 font-mono">Permissioned L1 Cohort</div>
                </div>
                <div
                  className="pt-2 md:pt-0 md:px-3 text-left cursor-pointer transition-colors hover:bg-neutral-50/60 p-2 rounded-lg"
                  data-card="true"
                  data-cubee-title="Circle Gas Station (Paymaster)"
                  data-cubee-hint="Circle's Gas Station Paymaster sponsors all batch settlements on Arc L1! Autonomous agents pay $0.00 in gas fees!"
                  data-cubee-anim="celebrate"
                >
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{"// GAS ENGINE"}</div>
                  <div className="text-sm font-semibold text-neutral-900 mt-0.5">Circle Gas Station</div>
                  <div className="text-[11px] text-neutral-500 font-mono">Native USDC Paymaster</div>
                </div>
                <div
                  className="pt-2 md:pt-0 md:px-3 text-left cursor-pointer transition-colors hover:bg-neutral-50/60 p-2 rounded-lg"
                  data-card="true"
                  data-cubee-title="<500ms Deterministic Settlement"
                  data-cubee-hint="Deterministic <500ms finality means immediate settlement without volatility risks during streaming inference!"
                  data-cubee-anim="proud"
                >
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{"// SETTLEMENT FINALITY"}</div>
                  <div className="text-sm font-semibold text-neutral-900 mt-0.5">&lt; 500ms Deterministic</div>
                  <div className="text-[11px] text-neutral-500 font-mono">Sub-second certainty</div>
                </div>
                <div
                  className="pt-2 md:pt-0 md:px-3 text-left cursor-pointer transition-colors hover:bg-neutral-50/60 p-2 rounded-lg"
                  data-card="true"
                  data-cubee-title="Groth16 + Privacy Pools ASP"
                  data-cubee-hint="Groth16 + Privacy Pools ASP non-membership: 100% OFAC compliant privacy without dirty mixer pooling!"
                  data-cubee-anim="working"
                >
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{"// PRIVACY MECHANISM"}</div>
                  <div className="text-sm font-semibold text-neutral-900 mt-0.5">Groth16 + Privacy Pools</div>
                  <div className="text-[11px] text-neutral-500 font-mono">Opt-in OFAC compliance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Glass Scroll Cue pinned cleanly to the bottom */}
          <div className="mt-2 sm:mt-3 pb-2 hidden sm:flex items-center justify-center shrink-0">
            <a
              href="#blueprint"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 hover:bg-white border border-neutral-200 backdrop-blur-xl text-[11px] font-mono uppercase tracking-widest text-neutral-600 hover:text-neutral-950 transition-all shadow-sm animate-bounce cursor-pointer"
            >
              <span>Protocol Architecture</span>
              <ChevronDown className="w-3.5 h-3.5 text-sky-600" />
            </a>
          </div>
        </section>

        {/* Architectural Blueprint Section */}
        <section className="flex flex-col items-center px-4 max-w-7xl mx-auto relative z-10 pt-4 pb-16 md:pt-6 md:pb-24 scroll-mt-24" id="blueprint">
          <div className="relative w-full">
            {/* Top-Left Cloud Cubee (Positioned on the side where the star is) */}
            <div className="hidden md:block absolute -left-10 lg:-left-16 xl:-left-20 -top-[195px] z-30 pointer-events-auto">
              <HeroCubeeCloud
                sectionId="blueprint"
                sectionLabel="Protocol Blueprint"
                thoughts={BLUEPRINT_THOUGHTS}
                pretextTitle="ArcNano Cryptographic Blueprint"
                pretextHint="4-phase shielded micropayment pipeline on Arc L1"
                triggerSelector="#blueprint-card-bottom"
              />
            </div>

            {/* Mobile Mascot (< md) */}
            <div className="md:hidden flex justify-center mb-6">
              <HeroCubeeCloud
                sectionId="blueprint"
                sectionLabel="Protocol Blueprint"
                thoughts={BLUEPRINT_THOUGHTS}
                pretextTitle="ArcNano Cryptographic Blueprint"
                pretextHint="4-phase shielded micropayment pipeline on Arc L1"
                triggerSelector="#blueprint-card-bottom"
              />
            </div>

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
                  <span>{"01 // Protocol Blueprint"}</span>
                </div>
                <div className="flex items-center gap-2 bg-amber-500/15 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-500/30 text-xs font-mono text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Specification &amp; Circuit Phase</span>
                </div>
              </div>

              {/* Center Conceptual Diagram */}
              <div className="relative z-10 my-8 py-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                  <div
                    className="relative bg-white/5 backdrop-blur-md border border-white/10 p-5 hover:border-white/20 transition-all group cursor-pointer"
                    data-card="true"
                    data-cubee-title="Phase 1: Shielded Note Deposit"
                    data-cubee-hint="Phase 1: Agent commits USDC notes into a 20-level Poseidon Merkle tree, creating a uniform anonymity set."
                    data-cubee-anim="working"
                  >
                    <CornerTicks color="text-white/25" activeColor="group-hover:text-amber-400" />
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Phase 1</div>
                    <div className="text-base font-medium text-white mt-1">Shielded Note Deposit</div>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                       Agent commits fixed-tier USDC notes into a Poseidon Merkle tree on Arc, creating a uniform anonymity set.
                    </p>
                  </div>

                  <div
                    className="relative bg-white/5 backdrop-blur-md border border-white/10 p-5 hover:border-white/20 transition-all group cursor-pointer"
                    data-card="true"
                    data-cubee-title="Phase 2: X402 Challenge"
                    data-cubee-hint="Phase 2: When an agent requests inference, the server responds with an HTTP 402 invoice with root parameters."
                    data-cubee-anim="listening"
                  >
                    <CornerTicks color="text-white/25" activeColor="group-hover:text-amber-400" />
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Phase 2</div>
                    <div className="text-base font-medium text-white mt-1">X402 Challenge</div>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                       Agent queries an AI inference API and receives an automated X402 challenge with root parameters.
                    </p>
                  </div>

                  <div
                    className="relative bg-white/5 backdrop-blur-md border border-white/10 p-5 hover:border-white/20 transition-all group cursor-pointer"
                    data-card="true"
                    data-cubee-title="Phase 3: Off-Chain Groth16 Proof"
                    data-cubee-hint="Phase 3: The agent generates an off-chain Groth16 proof in ~74ms, proving ownership & clean ASP status without signing an on-chain tx."
                    data-cubee-anim="proud"
                  >
                    <CornerTicks color="text-white/25" activeColor="group-hover:text-amber-400" />
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Phase 3</div>
                    <div className="text-base font-medium text-white mt-1">Off-Chain Groth16 Proof</div>
                    <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                       Agent proves note membership and ASP non-sanctioned compliance off-chain in memory without signing a tx.
                    </p>
                  </div>

                  <div
                    className="relative bg-white/5 backdrop-blur-md border border-white/10 p-5 hover:border-white/20 transition-all group cursor-pointer"
                    data-card="true"
                    data-cubee-title="Phase 4: Receiver Arc Settlement"
                    data-cubee-hint="Phase 4: The provider verifies in <8ms, streams LLM tokens instantly, and batches settlement to Arc L1 via Circle Gas Station."
                    data-cubee-anim="celebrate"
                  >
                    <CornerTicks color="text-white/25" activeColor="group-hover:text-amber-400" />
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
              {/* Sentinel to trigger Cubee Cloud animation when bottom of card is visible */}
              <div id="blueprint-card-bottom" className="w-full h-1 pointer-events-none" />
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


        {/* SECTION 3: THE PROBLEM WE ARE SOLVING (PUNCHY, 2-LINE SCAN) */}
        <section className="py-24 bg-[var(--section-alt-bg)] border-y border-[var(--card-border)] px-4 relative z-10 transition-colors overflow-hidden" id="problem">
          {/* Subtle atmospheric ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[900px] h-[450px] bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-800 mb-4 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{"02 // Threat Model & Traps"}</span>
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

        {/* SECTION 3: HOW ARCNANO SOLVES IT */}
        <section className="py-24 max-w-7xl mx-auto px-4 relative z-10" id="solution">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-800 mb-4 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>{"03 // Architectural Resolution"}</span>
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

        {/* SECTION 4: DEVELOPMENT ROADMAP (ARC.IO DEVELOPER RESOURCES DESIGN - HORIZONTAL SCROLL CAROUSEL) */}
        <div id="roadmap" className="relative">
          <RoadmapCarousel />
        </div>
      </main>

      {/* Minimized Clean Footer */}
      <footer className="border-t border-neutral-200/90 bg-white/70 backdrop-blur-md py-6 px-6 sm:px-8 relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-neutral-950 flex items-center justify-center p-1 shadow-xs">
              <Image
                src="/arcnano-icon-white.png"
                alt="ArcNano Icon"
                width={16}
                height={16}
                className="w-3.5 h-3.5 object-contain"
              />
            </div>
            <Image
              src="/arcnano-logo.png"
              alt="ArcNano"
              width={100}
              height={18}
              className="h-4 w-auto object-contain"
            />
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
              • MIT License
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono text-neutral-600">
            <a
              className="hover:text-neutral-950 transition-colors"
              href="https://github.com/Trymbakmahant/arcnano"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <span className="text-neutral-300">•</span>
            <a
              className="hover:text-neutral-950 transition-colors"
              href="https://x.com/0xarcnano"
              target="_blank"
              rel="noopener noreferrer"
            >
              X (@0xarcnano)
            </a>
            <span className="text-neutral-300">•</span>
            <a className="hover:text-neutral-950 transition-colors" href="#roadmap">
              Roadmap
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
