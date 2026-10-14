"use client";

import React, { useState } from "react";
import Image from "next/image";

const GUARDIAN_FACTS = [
  "1M+ shielded notes active in Poseidon Vault",
  "Zero msg.sender on Arc: agent identities remain completely shielded from mempool surveillance.",
  "Circle Gas Station sponsors batch settlement so autonomous agents pay $0.00 gas.",
  "Deterministic sub-500ms finality ensures streaming LLM token delivery never stalls.",
  "Groth16 ZK-SNARKs and Privacy Pools ASP guarantee OFAC compliance without dirty mixer pooling.",
  "Off-chain Groth16 proofs generated in ~74ms eliminate wallet trace links entirely.",
];

export default function ArcNanoHero() {
  const [copiedPkg, setCopiedPkg] = useState<string | null>(null);
  const [askQuery, setAskQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [speechText, setSpeechText] = useState(GUARDIAN_FACTS[0]);

  const copyCommand = (cmd: string, label: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(cmd);
      setCopiedPkg(label);
      setTimeout(() => setCopiedPkg(null), 2000);
    }
  };

  const handleMascotClick = () => {
    const nextIndex = (factIndex + 1) % GUARDIAN_FACTS.length;
    setFactIndex(nextIndex);
    setSpeechText(GUARDIAN_FACTS[nextIndex]);
  };

  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = askQuery.trim();
    if (!query || isLoading) return;

    setIsLoading(true);
    setSpeechText("Verifying query against ArcNano knowledge protocol...");

    try {
      const res = await fetch("/api/cubee-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          pretext: {
            title: "ArcNano Hero Overview",
            hint: "Shielded Nanopayments for Autonomous AI Agents on Arc Network",
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply =
          data.answer ||
          "ArcNano shields machine micropayments using X402 headers, Groth16 proofs, and Circle Gas Station paymasters on Arc.";
        setSpeechText(reply);
      } else {
        setSpeechText(
          "ArcNano decouples machine micropayments from identity via 64-root Poseidon ring buffers and sub-500ms Arc L1 settlement."
        );
      }
    } catch {
      setSpeechText(
        "ArcNano shields machine micropayments with zero msg.sender and opt-in OFAC Privacy Pools compliance on Arc Network."
      );
    } finally {
      setIsLoading(false);
      setAskQuery("");
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full overflow-hidden bg-[#FAFAFC] text-slate-900 flex flex-col justify-between select-none"
    >
      {/* ================= BACKGROUND ARCHITECTURAL GRID & WAVE RIBBON ================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Subtle Architectural Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(circle at 50% 35%, black 30%, transparent 80%)",
          }}
        />

        {/* Sweeping Pastel Ribbon SVG (Positioned lower & right so text stays crisp) */}
        <svg
          className="absolute bottom-12 left-0 w-full h-[460px] opacity-85"
          viewBox="0 0 1440 400"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M-100 280 C 320 120, 680 390, 1120 180 C 1320 90, 1440 160, 1600 120 L 1600 400 L -100 400 Z"
            fill="url(#lavenderWave)"
          />
          <path
            d="M-100 320 C 420 190, 760 60, 1180 240 C 1350 310, 1450 220, 1600 190 L 1600 400 L -100 400 Z"
            fill="url(#mintWave)"
          />
          <path
            d="M-100 220 C 260 340, 680 120, 1080 280 C 1300 360, 1440 250, 1600 260"
            stroke="url(#strokeRibbon)"
            strokeWidth="3"
            fill="none"
          />
          <defs>
            <linearGradient id="lavenderWave" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#A5B4FC" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.32" />
            </linearGradient>
            <linearGradient id="mintWave" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#99F6E4" stopOpacity="0.3" />
              <stop offset="60%" stopColor="#C7D2FE" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="strokeRibbon" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.35" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ================= COFOUNDER-STYLE TOP NAVBAR ================= */}
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        {/* Left Brand */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform p-1.5">
            <Image
              src="/arcnano-icon-white.png"
              alt="ArcNano Icon"
              width={20}
              height={20}
              className="w-5 h-5 object-contain"
              priority
            />
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-900">
            ArcNano
          </span>
          <span className="rounded-md border border-slate-200/80 bg-white/70 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-slate-500 backdrop-blur-sm">
            Protocol
          </span>
        </a>

        {/* Right Glass Pill Nav (Cofounder inspired) */}
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/65 px-2 py-1.5 shadow-sm backdrop-blur-md">
            <a
              href="#problem"
              className="rounded-full px-3.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Threat Model
            </a>
            <a
              href="#solution"
              className="rounded-full px-3.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Architecture
            </a>
            <a
              href="#blueprint"
              className="rounded-full px-3.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Protocol Flow
            </a>
            <a
              href="/playground"
              className="rounded-full px-3.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Playground
            </a>
            <a
              href="https://marketplace.arcnano.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-3.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Marketplace ↗
            </a>
            <a
              href="https://docs.arcnano.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-3.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Docs ↗
            </a>
          </nav>

          {/* Live on Mainnet Contract Link */}
          <a
            href="https://explorer.arc.io/address/0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 backdrop-blur-md transition hover:bg-emerald-500/20 hover:border-emerald-400 shadow-xs group"
            title="ArcNanoPool Contract on Arc Mainnet Explorer (Chain 5042)"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tracking-tight">Live on Mainnet</span>
            <span className="hidden sm:inline font-mono text-[10px] text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-300/80">
              5042
            </span>
            <svg
              className="w-3 h-3 text-emerald-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </header>

      {/* ================= MAIN 2-COLUMN HERO CONTENT ================= */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-12 px-6 py-8 lg:grid-cols-12">
        {/* LEFT COLUMN: Clean Typography & Focused Actions (7 Cols) */}
        <div className="flex flex-col items-start text-left lg:col-span-7">
          {/* Subtle Eyebrow Tag */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-md">
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-indigo-700">
              X402
            </span>
            <span>Native Sub-Cent Privacy on Arc Network</span>
          </div>

          {/* High-Impact Headline */}
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl leading-[1.08]">
            Shielded Nanopayments <br />
            <span className="text-slate-500 font-normal">
              for Autonomous AI Agents.
            </span>
          </h1>

          {/* Crisp, high-contrast body text */}
          <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-slate-600">
            Public blockchains permanently expose every model call and trade secret your agents pay for.{" "}
            <span className="font-medium text-slate-900">ArcNano</span> enables private, OFAC-compliant, sub-cent micropayments with deterministic sub-second finality.
          </p>

          {/* Cofounder-Style 2-Button CTA Row */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <a
              href="#blueprint"
              className="group inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <span>Explore Protocol Flow</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </a>

            <a
              href="/playground"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white/75 px-5 py-3.5 text-sm font-medium text-slate-800 shadow-sm backdrop-blur-md transition hover:bg-white hover:border-slate-400"
            >
              <span>Shielded Playground</span>
            </a>
          </div>

          {/* Consolidated Developer SDK & Social Strip */}
          <div className="mt-8 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/70 p-2 shadow-sm backdrop-blur-md">
            <button
              type="button"
              onClick={() => copyCommand("npm i arcnano-x402", "npm")}
              className="flex items-center gap-2 rounded-xl bg-rose-50/90 hover:bg-rose-100/80 border border-rose-200/60 px-3 py-1.5 text-xs font-mono text-rose-900 transition cursor-pointer"
              title="Click to copy npm install command"
            >
              <span className="rounded bg-rose-600 px-1.5 py-0.2 text-[10px] font-sans font-bold text-white">
                npm
              </span>
              <span>arcnano-x402</span>
              <span className="text-[10px] text-rose-500 font-sans">
                {copiedPkg === "npm" ? "✓ Copied" : "⎘"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => copyCommand("pip install arczk-agent", "pypi")}
              className="flex items-center gap-2 rounded-xl bg-blue-50/90 hover:bg-blue-100/80 border border-blue-200/60 px-3 py-1.5 text-xs font-mono text-blue-900 transition cursor-pointer"
              title="Click to copy PyPI install command"
            >
              <span className="rounded bg-blue-600 px-1.5 py-0.2 text-[10px] font-sans font-bold text-white">
                PyPI
              </span>
              <span>arczk-agent</span>
              <span className="text-[10px] text-blue-500 font-sans">
                {copiedPkg === "pypi" ? "✓ Copied" : "⎘"}
              </span>
            </button>

            <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

            <a
              href="https://github.com/Trymbakmahant/arcnano"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              GitHub ↗
            </a>
            <a
              href="https://x.com/0xarcnano"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              @0xarcnano ↗
            </a>
            <a
              href="https://explorer.arc.io/address/0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition border border-emerald-200/60"
            >
              Arc Explorer Contract ↗
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive 2.5D / 3D-Tilt Holographic Stage (5 Cols) */}
        <div
          className="relative flex flex-col items-center justify-center lg:col-span-5 [perspective:1200px]"
          onMouseMove={(e) => {
            const card = e.currentTarget.querySelector("#arc-3d-stage") as HTMLElement;
            if (!card) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
          }}
          onMouseLeave={(e) => {
            const card = e.currentTarget.querySelector("#arc-3d-stage") as HTMLElement;
            if (card) card.style.transform = `rotateY(0deg) rotateX(0deg)`;
          }}
        >
          <div
            id="arc-3d-stage"
            className="relative w-full max-w-md transition-transform duration-200 ease-out [transform-style:preserve-3d]"
          >
            {/* Ambient 3D Backplate Shadow */}
            <div
              className="pointer-events-none absolute -inset-6 rounded-[36px] bg-slate-200/40 blur-2xl"
              style={{ transform: "translateZ(-40px)" }}
            />

            {/* FLOATING TELEMETRY PILLS (Staggered in 3D Z-Space) */}
            <div
              className="relative z-20 mb-5 flex flex-col gap-2.5 pl-2 sm:pl-6"
              style={{ transform: "translateZ(45px)" }}
            >
              {/* Pill 1 */}
              <div className="flex items-center justify-between rounded-2xl border border-white/90 bg-white/80 px-4 py-2.5 shadow-lg shadow-indigo-950/5 backdrop-blur-xl">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs text-slate-500">x402 Shield</span>
                  <span className="text-xs font-semibold text-slate-900">
                    0.0004 USDC
                  </span>
                </div>
                <span className="font-mono text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                  320ms
                </span>
              </div>

              {/* Pill 2 (Pushed deeper in Z-space) */}
              <div
                className="flex items-center justify-between rounded-2xl border border-white/90 bg-white/80 px-4 py-2.5 shadow-lg shadow-indigo-950/5 backdrop-blur-xl ml-4"
                style={{ transform: "translateZ(20px)" }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-xs text-slate-500">Groth16</span>
                  <span className="text-xs font-semibold text-slate-900">
                    Privacy Pool Verified
                  </span>
                </div>
                <span className="font-mono text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                  ZK-OK
                </span>
              </div>
            </div>

            {/* MAIN HOLOGRAPHIC VAULT CARD */}
            <div
              className="relative overflow-hidden rounded-3xl border border-white bg-gradient-to-b from-white/90 to-white/65 p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur-2xl"
              style={{ transform: "translateZ(20px)" }}
            >


              {/* Top Interactive 3D Node Visualizer */}
              <div className="relative mb-5 flex items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/70 p-4 overflow-hidden">
                {/* Animated SVG Data Stream Line */}
                <svg className="absolute inset-0 h-full w-full opacity-50" fill="none">
                  <path
                    d="M 60 44 Q 160 15, 280 44"
                    stroke="url(#pulseGrad)"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                  />
                  <defs>
                    <linearGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F43F5E" />
                      <stop offset="50%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Left: 3D Red Mascot Node with Orbital Ring */}
                <div className="relative z-10 flex items-center gap-3.5">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                    {/* Spinning ZK Orbital Ring */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-rose-300/70 animate-[spin_12s_linear_infinite]" />
                    {/* 3D Mascot Cube */}
                    <button
                      type="button"
                      onClick={handleMascotClick}
                      title="Click to cycle protocol insights"
                      className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 shadow-lg shadow-rose-500/30 rotate-[-6deg] transition-transform duration-300 hover:rotate-0 hover:scale-105 cursor-pointer"
                    >
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-1.5 rounded-full bg-slate-950 animate-pulse" />
                        <span className="h-2.5 w-1.5 rounded-full bg-slate-950 animate-pulse" />
                      </div>
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-900">
                        Agent Guardian
                      </span>
                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-indigo-600">
                        64-Root Ring
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed transition-all">
                      {speechText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Prompt Box */}
              <form
                onSubmit={handleAskSubmit}
                className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition"
              >
                <input
                  type="text"
                  value={askQuery}
                  onChange={(e) => setAskQuery(e.target.value)}
                  placeholder="Ask how x402 shields agent wallet metadata..."
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white text-xs hover:bg-indigo-600 transition disabled:opacity-50 cursor-pointer"
                  title="Submit question"
                >
                  {isLoading ? (
                    <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    "↗"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

   
    </section>
  );
}
