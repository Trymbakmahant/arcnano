"use client";

import React, { useState, useEffect, useRef } from "react";
import SineRibbonBackground from "@/component/UI/SineRibbonBackground";

function subscribeTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);
  window.addEventListener("storage", callback);
  return () => {
    mediaQuery.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getThemeSnapshot(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getThemeServerSnapshot(): "light" | "dark" {
  return "dark";
}

export default function Home() {
  const systemTheme = React.useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
  const [themeOverride, setThemeOverride] = useState<"light" | "dark" | null>(null);
  const theme = themeOverride ?? systemTheme;
  const [copyFeedback, setCopyFeedback] = useState<string>("Copy GitHub Command");
  
  // Spotlight grid mouse tracking
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setThemeOverride(next);
    localStorage.setItem("theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
  };

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
      setCopyFeedback("Copied to Clipboard!");
      setTimeout(() => setCopyFeedback("Copy GitHub Command"), 2200);
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
      className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white transition-colors duration-300"
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
        <nav className="pointer-events-auto bg-[#111215]/95 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 flex items-center gap-4 sm:gap-6 shadow-2xl transition-all duration-300">
          <a className="flex items-center gap-2.5 text-white pr-2 group" href="#">
            <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs tracking-tighter shadow-sm">
              ▲
            </div>
            <span className="font-semibold text-sm tracking-tight text-white/95">
              ArcNano
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/10 text-neutral-300 border border-white/15">
              Protocol
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-white/70">
            <a className="hover:text-white transition-colors" href="#about">What We Are</a>
            <a className="hover:text-white transition-colors" href="#problem">The Problem</a>
            <a className="hover:text-white transition-colors" href="#solution">How It Works</a>
            <a className="hover:text-white transition-colors" href="#roadmap">Roadmap</a>
          </div>

          <div className="pl-2 border-l border-white/10 flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-white/15 bg-white/5 hover:bg-white/15 text-white transition-all cursor-pointer shadow-sm"
            >
              {theme === "dark" ? (
                // Sun Icon
                <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" strokeWidth="2"></circle>
                  <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round"></line>
                  <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round"></line>
                  <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round"></line>
                  <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round"></line>
                </svg>
              ) : (
                // Moon Icon
                <svg className="w-4 h-4 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              )}
            </button>

            {/* Coming Soon Status Pill */}
            <a
              href="#roadmap"
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium px-3.5 py-1.5 rounded-full hover:bg-amber-500/25 transition-all shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
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
            opacity={theme === "dark" ? 0.75 : 0.45}
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
              <div className="absolute -top-28 -left-20 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-28 -right-20 w-96 h-96 bg-emerald-500/15 dark:bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
              
              {/* Glass specular top reflection sheen */}
              <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/[0.22] via-white/[0.06] to-transparent pointer-events-none rounded-t-[40px]" />

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-white/[0.08] border border-white/60 dark:border-white/20 backdrop-blur-xl text-xs font-mono text-neutral-800 dark:text-neutral-200 mb-6 shadow-sm relative z-10">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-[var(--text-primary)] font-semibold">Arc Ecosystem Protocol</span>
                <span className="text-neutral-400 dark:text-neutral-500">•</span>
                <span className="text-amber-600 dark:text-amber-300 font-medium">Under Active Development</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-[-0.035em] text-[var(--text-primary)] max-w-4xl leading-[1.08] transition-colors relative z-10">
                Shielded Nanopayments
                <span className="block text-[var(--text-muted)] font-light mt-1.5">
                  For Autonomous AI Agents
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg md:text-xl text-[var(--text-secondary)] font-normal max-w-3xl leading-relaxed tracking-tight transition-colors relative z-10">
                When autonomous AI agents pay for inference or data using public blockchain transactions, their wallet permanently logs every model call and trade secret. <strong className="text-[var(--text-primary)] font-medium">ArcNano</strong> is building private, compliant, sub-cent micropayments via native{" "}
                <span className="inline-flex items-center whitespace-nowrap font-mono text-xs px-2.5 py-0.5 bg-white/60 dark:bg-white/10 border border-white/50 dark:border-white/20 rounded font-semibold text-[var(--text-primary)] shadow-sm align-baseline">
                  HTTP 402
                </span>{" "}
                on the Arc Network.
              </p>

              {/* Genuine Intent Action Buttons */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5 relative z-10">
                <a
                  className="bg-white text-black hover:bg-neutral-100 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs sm:text-sm font-semibold px-6 py-3 rounded-full transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                  href="#problem"
                >
                  <span>The Problem We Are Solving</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </a>

                <a
                  className="bg-white/40 dark:bg-white/[0.08] hover:bg-white/60 dark:hover:bg-white/[0.14] text-[var(--text-primary)] border border-white/60 dark:border-white/15 backdrop-blur-xl text-xs sm:text-sm font-medium px-5 py-3 rounded-full transition-all shadow-sm flex items-center gap-2 hover:-translate-y-0.5 cursor-pointer"
                  href="#roadmap"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Roadmap (Coming Soon)</span>
                </a>

                <a
                  className="bg-white/20 dark:bg-white/[0.04] hover:bg-white/40 dark:hover:bg-white/[0.10] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-white/40 dark:border-white/10 backdrop-blur-xl text-xs sm:text-sm font-medium px-5 py-3 rounded-full transition-all shadow-sm flex items-center gap-1.5 hover:-translate-y-0.5 cursor-pointer"
                  href="https://github.com/trymbakmahant/p2pzkpayment"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>GitHub Repository</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Floating Glass Scroll Cue */}
          <div className="mt-7 hidden sm:flex items-center justify-center">
            <a
              href="#blueprint"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/30 dark:bg-white/[0.06] hover:bg-white/50 dark:hover:bg-white/[0.12] border border-white/40 dark:border-white/10 backdrop-blur-xl text-[11px] font-mono uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm animate-bounce cursor-pointer"
            >
              <span>Protocol Architecture</span>
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </a>
          </div>
        </section>

        {/* Architectural Blueprint Section (100vh) */}
        <section className="min-h-screen flex flex-col justify-center items-center px-4 max-w-7xl mx-auto relative z-10 py-12 md:py-20" id="blueprint">
          <div className="w-full rounded-[32px] md:rounded-[44px] p-2.5 md:p-3 bg-neutral-200/50 dark:bg-neutral-900/40 border border-[var(--card-border)] shadow-2xl relative transition-colors group">
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
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <span>ArcNano Protocol Blueprint</span>
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
        <div className="w-full bg-[#111215] py-3.5 border-y border-neutral-800 overflow-hidden relative z-10">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-mono text-neutral-400">
            {marqueeItems.concat(marqueeItems).map((item, idx) => (
              <span key={idx} className="flex items-center gap-8">
                <span>{item}</span>
                <span className="text-indigo-400">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* SECTION 1: WHAT WE ARE (TAKES 100vh FULL VIEWPORT) */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-4 max-w-7xl mx-auto relative z-10" id="about">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--badge-bg)] border border-[var(--badge-border)] text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3">
              Mission Statement
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[var(--text-primary)]">
              What Is ArcNano?
            </h2>
            <p className="text-[var(--text-secondary)] text-base md:text-xl mt-4 leading-relaxed">
              ArcNano is an open-source zero-knowledge payment protocol engineered for the <strong className="text-[var(--text-primary)] font-medium">Arc Ecosystem</strong>, designed to enable true private machine-to-machine commerce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[var(--card-bg)] rounded-3xl p-8 border border-[var(--card-border)] shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-lg mb-6">
                  01
                </div>
                <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight">
                  Zero-Knowledge for Agents
                </h3>
                <p className="text-[var(--text-secondary)] text-sm mt-3 leading-relaxed">
                  Cryptographic payment infrastructure specifically designed for machine-to-machine interactions. Autonomous software agents and LLMs require private payments that do not dox their operational logic, prompt pipelines, or trading intelligence.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--card-border)] text-xs font-mono text-[var(--text-muted)]">
                Poseidon Merkle Trees • Groth16
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[var(--card-bg)] rounded-3xl p-8 border border-[var(--card-border)] shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-lg mb-6">
                  02
                </div>
                <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight">
                  Native Web Standard (x402)
                </h3>
                <p className="text-[var(--text-secondary)] text-sm mt-3 leading-relaxed">
                  Instead of requiring manual wallet popups or custom RPC bridges, payments occur naturally over the Internet&apos;s standard <code className="font-mono text-xs">HTTP 402 Payment Required</code> protocol via standard HTTP request/response headers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--card-border)] text-xs font-mono text-[var(--text-muted)]">
                RFC-Standardized Header Exchange
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[var(--card-bg)] rounded-3xl p-8 border border-[var(--card-border)] shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-lg mb-6">
                  03
                </div>
                <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight">
                  Purpose-Built for Arc
                </h3>
                <p className="text-[var(--text-secondary)] text-sm mt-3 leading-relaxed">
                  Leveraging Arc&apos;s native Circle Gas Station (ERC-4337 Paymaster) and native USDC. Receiver-sponsored gas eliminates the need for agents to hold native gas tokens, preventing the gas-funding paper trail that destroys privacy.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--card-border)] text-xs font-mono text-[var(--text-muted)]">
                Circle Paymaster • Native USDC
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: THE PROBLEM WE ARE SOLVING (PUNCHY, 2-LINE SCAN) */}
        <section className="py-24 bg-[var(--section-alt-bg)] border-y border-[var(--card-border)] px-4 relative z-10 transition-colors" id="problem">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[11px] font-mono uppercase tracking-wider text-rose-500 mb-3">
                The Problem
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[var(--text-primary)]">
                Why Existing Machine Payments Fail
              </h2>
              <p className="text-[var(--text-secondary)] text-base mt-3">
                Paying for AI compute and tools with public crypto creates 4 fatal traps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Problem 1 */}
              <div className="bg-[var(--card-bg)] rounded-3xl p-8 border border-[var(--card-border)] shadow-sm hover:border-rose-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-md font-semibold">
                      01 • Surveillance
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">msg.sender Doxxing</span>
                  </div>
                  <h3 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">
                    Public Ledgers Dox Your AI Agents
                  </h3>
                  <p className="text-[var(--text-secondary)] text-base mt-3 leading-relaxed">
                    Standard crypto payments permanently log every prompt, tool call, and model supplier to block explorers for competitors to copy.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--card-border)] flex items-center justify-between text-xs font-mono text-rose-500">
                  <span>Impact</span>
                  <span className="font-semibold">Zero business or operational privacy</span>
                </div>
              </div>

              {/* Problem 2 */}
              <div className="bg-[var(--card-bg)] rounded-3xl p-8 border border-[var(--card-border)] shadow-sm hover:border-amber-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md font-semibold">
                      02 • Transport Leak
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">Naive ZK Trap</span>
                  </div>
                  <h3 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">
                    Naive ZK Still Leaks The Signer
                  </h3>
                  <p className="text-[var(--text-secondary)] text-base mt-3 leading-relaxed">
                    Even with a ZK proof, if the agent signs the transaction on-chain, its wallet address is broadcast to every node in the network.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--card-border)] flex items-center justify-between text-xs font-mono text-amber-500">
                  <span>Impact</span>
                  <span className="font-semibold">Privacy broken at the network layer</span>
                </div>
              </div>

              {/* Problem 3 */}
              <div className="bg-[var(--card-bg)] rounded-3xl p-8 border border-[var(--card-border)] shadow-sm hover:border-rose-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-md font-semibold">
                      03 • Sanctions Ban
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">Mixer Ban</span>
                  </div>
                  <h3 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">
                    Mixers Are Blocked By Enterprise APIs
                  </h3>
                  <p className="text-[var(--text-secondary)] text-base mt-3 leading-relaxed">
                    Traditional mixers pool dirty and clean funds together, causing AI gateways, AWS, and Cloudflare to automatically blacklist them.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--card-border)] flex items-center justify-between text-xs font-mono text-rose-500">
                  <span>Impact</span>
                  <span className="font-semibold">Banned by compliant API gateways</span>
                </div>
              </div>

              {/* Problem 4 */}
              <div className="bg-[var(--card-bg)] rounded-3xl p-8 border border-[var(--card-border)] shadow-sm hover:border-amber-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md font-semibold">
                      04 • Latency &amp; Gas
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">Economic Trap</span>
                  </div>
                  <h3 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">
                    Block Times &amp; Gas Kill Nanopayments
                  </h3>
                  <p className="text-[var(--text-secondary)] text-base mt-3 leading-relaxed">
                    Waiting 10–15 seconds for a block stalls real-time agent loops, while gas fees cost 10x more than a $0.001 inference call.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--card-border)] flex items-center justify-between text-xs font-mono text-amber-500">
                  <span>Impact</span>
                  <span className="font-semibold">Economically &amp; computationally broken</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW ARCNANO SOLVES IT */}
        <section className="py-24 max-w-7xl mx-auto px-4 relative z-10" id="solution">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono uppercase tracking-wider text-emerald-500 mb-3">
              The Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[var(--text-primary)]">
              How ArcNano Solves Every Trap
            </h2>
            <p className="text-[var(--text-secondary)] text-base md:text-lg mt-4 leading-relaxed">
              We architected ArcNano from first principles to decouple payments from identity, guarantee legal compliance, and deliver instant sub-second verification.
            </p>
          </div>

          <div className="space-y-6">
            {/* Solution Card 1 */}
            <div className="bg-[var(--card-bg)] rounded-3xl p-8 md:p-10 border border-[var(--card-border)] shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-500 block mb-2">Solution 01</span>
                  <h3 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">
                    Receiver-Batched Settlement
                  </h3>
                  <div className="text-xs font-mono text-[var(--text-muted)] mt-1">
                    Eliminating the Payer&apos;s msg.sender
                  </div>
                </div>
                <div className="lg:col-span-7 text-sm md:text-base text-[var(--text-secondary)] leading-relaxed space-y-3">
                  <p>
                    In ArcNano, <strong className="text-[var(--text-primary)] font-medium">the agent never broadcasts an on-chain transaction to spend a note</strong>.
                  </p>
                  <p>
                    Instead, the agent computes the Groth16 proof locally in memory and embeds it directly into the HTTP header (<code className="font-mono text-xs bg-[var(--badge-bg)] px-1.5 py-0.5 rounded text-[var(--text-primary)]">X-PAYMENT</code>) when calling the API.
                  </p>
                  <p>
                    The <em>receiver</em> (the API service) collects valid proofs from multiple agents and broadcasts an aggregated <code className="font-mono text-xs">batchSpend()</code> transaction to Arc. Because the receiver is the transaction signer, the payer&apos;s wallet address is never published to the blockchain.
                  </p>
                </div>
              </div>
            </div>

            {/* Solution Card 2 */}
            <div className="bg-[var(--card-bg)] rounded-3xl p-8 md:p-10 border border-[var(--card-border)] shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-500 block mb-2">Solution 02</span>
                  <h3 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">
                    Arc Circle Gas Station Sponsorship
                  </h3>
                  <div className="text-xs font-mono text-[var(--text-muted)] mt-1">
                    $0 Gas &amp; No Funding Paper Trails
                  </div>
                </div>
                <div className="lg:col-span-7 text-sm md:text-base text-[var(--text-secondary)] leading-relaxed space-y-3">
                  <p>
                    Normally, funding burner wallets with native gas tokens creates a traceable link back to the funding exchange or master account.
                  </p>
                  <p>
                    On Arc, settlement transactions are submitted via the <strong className="text-[var(--text-primary)] font-medium">Circle Gas Station (Paymaster)</strong>. Receiver settlement gas is sponsored, meaning agents only need to manage stable USDC commitments. No gas tokens are held, and no funding trails are created.
                  </p>
                </div>
              </div>
            </div>

            {/* Solution Card 3 */}
            <div className="bg-[var(--card-bg)] rounded-3xl p-8 md:p-10 border border-[var(--card-border)] shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-500 block mb-2">Solution 03</span>
                  <h3 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">
                    Association Set Provider (ASP) Proofs
                  </h3>
                  <div className="text-xs font-mono text-[var(--text-muted)] mt-1">
                    Compliance by Mathematics (Privacy Pools)
                  </div>
                </div>
                <div className="lg:col-span-7 text-sm md:text-base text-[var(--text-secondary)] leading-relaxed space-y-3">
                  <p>
                    To avoid the regulatory fate of legacy mixers, ArcNano integrates Association Set Providers (ASPs) inspired by the <em>Privacy Pools</em> research paper.
                  </p>
                  <p>
                    Every Circom spend circuit includes a cryptographic non-membership constraint against sanctioned deposit roots. The agent mathematically proves: <em className="text-[var(--text-primary)]">&ldquo;My deposited note exists in the legitimate tree, AND my note is NOT present in any flagged/OFAC sanctioned root.&rdquo;</em>
                  </p>
                  <p>
                    Enterprise APIs can verify clean funds with 100% mathematical certainty without learning the depositor&apos;s identity.
                  </p>
                </div>
              </div>
            </div>

            {/* Solution Card 4 */}
            <div className="bg-[var(--card-bg)] rounded-3xl p-8 md:p-10 border border-[var(--card-border)] shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600 transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-500 block mb-2">Solution 04</span>
                  <h3 className="text-2xl font-medium text-[var(--text-primary)] tracking-tight">
                    Two-Stage HTTP 402 Verification
                  </h3>
                  <div className="text-xs font-mono text-[var(--text-muted)] mt-1">
                    Sub-10ms Delivery + Periodic Batching
                  </div>
                </div>
                <div className="lg:col-span-7 text-sm md:text-base text-[var(--text-secondary)] leading-relaxed space-y-3">
                  <p>
                    We decouple the API response from on-chain block mining times:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
                    <li>
                      <strong className="text-[var(--text-primary)] font-medium">Stage 1 (Off-Chain Verification):</strong> When the API gateway receives the HTTP 402 payment header, it executes an in-memory Groth16 pairing check and checks an in-memory nullifier cache. The verification completes in milliseconds, and the API payload is returned to the agent without delay.
                    </li>
                    <li>
                      <strong className="text-[var(--text-primary)] font-medium">Stage 2 (On-Chain Settlement):</strong> The gateway queues the nullifiers and settles 50–100 transactions together on Arc in periodic background batches, dropping per-request settlement costs to fractions of a cent.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: DEVELOPMENT ROADMAP & COMING SOON */}
        <section className="py-24 bg-[var(--section-alt-bg)] border-t border-[var(--card-border)] px-4 relative z-10 transition-colors" id="roadmap">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-500 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Active Research &amp; Implementation</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[var(--text-primary)]">
                Development Roadmap
              </h2>
              <p className="text-[var(--text-secondary)] text-base md:text-lg mt-4 leading-relaxed">
                We believe in total transparency. Here is our honest, step-by-step progress from architectural design to live testnet deployment on Arc.
              </p>
            </div>

            <div className="space-y-6">
              {/* Milestone 1 - Completed */}
              <div className="bg-[var(--card-bg)] rounded-3xl p-6 md:p-8 border border-[var(--card-border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Milestone 1 • Completed
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">Research &amp; Specification</span>
                  </div>
                  <h3 className="text-xl font-medium text-[var(--text-primary)]">
                    System Architecture &amp; Protocol Specification Formulation
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                    Designed the two-stage HTTP 402 verification model, solved the <code className="font-mono text-xs">msg.sender</code> leakage via receiver-batched settlement, and authored the foundational protocol specification for the Arc ecosystem.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-emerald-500 text-xs font-mono shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Completed</span>
                </div>
              </div>

              {/* Milestone 2 - In Progress / Coming Soon */}
              <div className="bg-[var(--card-bg)] rounded-3xl p-6 md:p-8 border-2 border-amber-500/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      Milestone 2 • In Active Development
                    </span>
                    <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-medium">Coming Soon</span>
                  </div>
                  <h3 className="text-xl font-medium text-[var(--text-primary)]">
                    Circom Circuits &amp; Arc Testnet Smart Contracts
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                    Finalizing the 20-level Poseidon Merkle tree inclusion circuit (<code className="font-mono text-xs">spend.circom</code>), implementing Association Set non-membership constraints (<code className="font-mono text-xs">asp_check.circom</code>), and preparing <code className="font-mono text-xs">ArcShieldPool.sol</code> for deployment on Arc Testnet.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-amber-500 text-xs font-mono shrink-0 relative z-10">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span>In Progress</span>
                </div>
              </div>

              {/* Milestone 3 - Coming Soon */}
              <div className="bg-[var(--card-bg)] rounded-3xl p-6 md:p-8 border border-[var(--card-border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-85">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
                      Milestone 3 • Coming Soon
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">Developer Tooling</span>
                  </div>
                  <h3 className="text-xl font-medium text-[var(--text-primary)]">
                    Autonomous Agent SDK &amp; Gateway Middleware
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                    Building client libraries for autonomous AI frameworks (LangChain, AutoGPT, CrewAI) and drop-in Express/Fastify HTTP 402 middleware for API providers to verify ZK proofs in single-digit milliseconds.
                  </p>
                </div>
                <div className="text-neutral-400 text-xs font-mono shrink-0">
                  Coming Soon
                </div>
              </div>

              {/* Milestone 4 - Coming Soon */}
              <div className="bg-[var(--card-bg)] rounded-3xl p-6 md:p-8 border border-[var(--card-border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 opacity-85">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
                      Milestone 4 • Coming Soon
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">Live Ecosystem Pilot</span>
                  </div>
                  <h3 className="text-xl font-medium text-[var(--text-primary)]">
                    Circle Gas Station Relayer &amp; AI Pilot on Arc
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                    Production integration with Arc&apos;s Circle Gas Station Paymaster for zero-gas settlement, followed by a live testnet pilot connecting autonomous AI agents to live inference providers.
                  </p>
                </div>
                <div className="text-neutral-400 text-xs font-mono shrink-0">
                  Coming Soon
                </div>
              </div>
            </div>

            {/* Coming Soon Callout Box */}
            <div className="mt-12 bg-[#12141A] rounded-3xl p-8 md:p-10 border border-white/10 text-white shadow-2xl text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 text-xs font-mono mb-4">
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
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>Star &amp; View Repository</span>
                </a>

                <button
                  onClick={copyCloneCommand}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs sm:text-sm font-mono px-5 py-3 rounded-full transition-all border border-neutral-700 cursor-pointer flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{copyFeedback}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Main Footer */}
      <footer className="bg-[#0B0C0E] text-white pt-16 pb-12 border-t border-neutral-900 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-16 border-b border-neutral-800">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center text-xs font-bold">
                  ▲
                </div>
                <span className="text-base font-semibold tracking-tight text-white">ArcNano</span>
              </div>
              <p className="text-neutral-400 text-xs sm:text-sm max-w-sm leading-relaxed">
                Privacy-preserving zero-knowledge payment infrastructure for autonomous machine-to-machine interactions and AI agent micro-transactions on the Arc Network.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300 pt-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Active Research &amp; Circuit Implementation Phase</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-4">Architecture</h4>
              <ul className="space-y-2.5 text-xs text-neutral-400 font-sans">
                <li><a className="hover:text-white transition-colors" href="#about">What We Are</a></li>
                <li><a className="hover:text-white transition-colors" href="#problem">The Problem</a></li>
                <li><a className="hover:text-white transition-colors" href="#solution">How ArcNano Solves It</a></li>
                <li><a className="hover:text-white transition-colors" href="#roadmap">Development Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-4">Protocol Tenets</h4>
              <ul className="space-y-2.5 text-xs text-neutral-400 font-sans">
                <li><a className="hover:text-white transition-colors" href="#solution">HTTP 402 Standard</a></li>
                <li><a className="hover:text-white transition-colors" href="#solution">Zero msg.sender Leakage</a></li>
                <li><a className="hover:text-white transition-colors" href="#solution">Privacy Pools (ASP Check)</a></li>
                <li><a className="hover:text-white transition-colors" href="#solution">Arc Circle Gas Station</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-4">Project &amp; Source</h4>
              <ul className="space-y-2.5 text-xs text-neutral-400 font-sans">
                <li><a className="hover:text-white transition-colors" href="https://github.com/trymbakmahant/p2pzkpayment" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
                <li><a className="hover:text-white transition-colors" href="https://github.com/trymbakmahant" target="_blank" rel="noopener noreferrer">Author Profile</a></li>
                <li><a className="hover:text-white transition-colors" href="https://github.com/trymbakmahant/p2pzkpayment/blob/main/README.md" target="_blank" rel="noopener noreferrer">Architecture README</a></li>
                <li><a className="hover:text-white transition-colors" href="https://github.com/trymbakmahant/p2pzkpayment/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT License</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-mono gap-4">
            <div>&copy; 2026 ArcNano Protocol &bull; MIT License.</div>
            <div className="flex items-center gap-6">
              <a className="hover:text-neutral-400 transition-colors" href="https://github.com/trymbakmahant/p2pzkpayment" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
              <span className="text-neutral-700">•</span>
              <a className="hover:text-neutral-400 transition-colors" href="#roadmap">Coming Soon</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
