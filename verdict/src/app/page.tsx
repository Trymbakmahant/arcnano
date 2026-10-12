"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Check,
  X,
  Search,
  ExternalLink,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
  Zap,
  Terminal,
  RotateCcw,
} from "lucide-react";
import { PRESET_VERDICTS, VerdictResult, evaluateVerdict } from "@/lib/verdict-engine";

export default function VerdictPage() {
  const [query, setQuery] = useState<string>("");
  const [selectedVerdict, setSelectedVerdict] = useState<VerdictResult>(PRESET_VERDICTS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [history, setHistory] = useState<VerdictResult[]>(PRESET_VERDICTS.slice(0, 4));

  // Initialize theme from preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  const handleEvaluate = async (questionToEval?: string) => {
    const q = (questionToEval ?? query).trim();
    if (!q) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      if (res.ok) {
        const data: VerdictResult = await res.json();
        setSelectedVerdict(data);
        setHistory((prev) => {
          const filtered = prev.filter((item) => item.id !== data.id && item.question !== data.question);
          return [data, ...filtered].slice(0, 6);
        });
      } else {
        const local = evaluateVerdict(q);
        setSelectedVerdict(local);
      }
    } catch {
      const local = evaluateVerdict(q);
      setSelectedVerdict(local);
    } finally {
      setIsLoading(false);
    }
  };

  const isYes = selectedVerdict.verdict === "YES";

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors ${isDark ? "bg-[#090A0F] text-neutral-100" : "bg-[#F8FAFC] text-neutral-900"}`}>
      {/* Subtle CAD Grid Backdrop */}
      <div className="fixed inset-0 pointer-events-none cad-grid opacity-70 z-0" />

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-neutral-950 dark:bg-white flex items-center justify-center p-1.5 shadow-xs">
              <Image
                src={isDark ? "/arcnano-icon.png" : "/arcnano-icon-white.png"}
                alt="ArcNano Logo"
                width={20}
                height={20}
                className="w-4 h-4 object-contain"
                priority
              />
            </div>
            <span className="font-semibold text-sm tracking-tight">
              ArcNano <span className="font-mono text-amber-500">Verdict</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 border border-black/[0.05] dark:border-white/[0.08]">
              Binary Engine
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <a
              href="https://docs.arcnano.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="h-3.5 w-px bg-neutral-200 dark:bg-neutral-800" />

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 relative z-10 flex flex-col justify-center">
        
        {/* HERO TITLE: ULTRA MINIMAL */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest bg-neutral-100 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400 mb-3">
            <Terminal className="w-3 h-3 text-amber-500" />
            <span>Deterministic Cryptographic Truth</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight">
            Binary Protocol Verdict
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
            Binary answers with cryptographic proofs. Zero marketing filler.
          </p>
        </div>

        {/* INPUT COMMAND BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEvaluate();
          }}
          className="relative max-w-2xl mx-auto w-full mb-6"
        >
          <div className="relative flex items-center rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/15 shadow-sm focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            <Search className="w-4 h-4 text-neutral-400 ml-4 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask any protocol capability or security question..."
              className="w-full py-3.5 px-3 bg-transparent text-sm focus:outline-hidden placeholder:text-neutral-400 text-neutral-900 dark:text-neutral-100 font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="mr-2 px-4 py-1.5 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer shrink-0"
            >
              {isLoading ? "Proving..." : "Evaluate"}
            </button>
          </div>
        </form>

        {/* QUICK PRESET CHIPS */}
        <div className="max-w-2xl mx-auto w-full mb-8">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px] font-mono">
            {PRESET_VERDICTS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setQuery(preset.question);
                  setSelectedVerdict(preset);
                }}
                className={`px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedVerdict.id === preset.id
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 border-neutral-900 dark:border-white font-medium"
                    : "bg-white dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 border-black/8 dark:border-white/10 hover:border-black/20 dark:hover:border-white/25"
                }`}
              >
                {preset.question}
              </button>
            ))}
          </div>
        </div>

        {/* THE VERDICT DISPLAY CARD (MINIMAL, INSTITUTIONAL, ZERO FLUFF) */}
        <div className="max-w-2xl mx-auto w-full relative">
          <div
            className={`relative rounded-2xl p-6 sm:p-8 border transition-all shadow-sm ${
              isYes
                ? "bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] border-emerald-500/25"
                : "bg-rose-500/[0.03] dark:bg-rose-500/[0.05] border-rose-500/25"
            }`}
          >
            {/* Corner Blueprint Ticks ┌ ┐ └ ┘ */}
            <div className={`corner-tick corner-tick-tl ${isYes ? "text-emerald-500" : "text-rose-500"}`} />
            <div className={`corner-tick corner-tick-tr ${isYes ? "text-emerald-500" : "text-rose-500"}`} />
            <div className={`corner-tick corner-tick-bl ${isYes ? "text-emerald-500" : "text-rose-500"}`} />
            <div className={`corner-tick corner-tick-br ${isYes ? "text-emerald-500" : "text-rose-500"}`} />

            {/* Top Micro-Bar */}
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-black/[0.06] dark:border-white/[0.08] pb-3 mb-6">
              <span className="uppercase text-neutral-400 tracking-wider">
                [{selectedVerdict.domain}]
              </span>
              <span className={`font-semibold ${isYes ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {selectedVerdict.confidence}
              </span>
            </div>

            {/* Core Question & Large Verdict Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
              <div className="flex-1">
                <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-1">
                  Question
                </div>
                <h2 className="text-lg sm:text-xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
                  {selectedVerdict.question}
                </h2>
              </div>

              {/* BOLD VERDICT BADGE */}
              <div className="shrink-0 flex items-center justify-start sm:justify-end">
                <div
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-2xl font-bold tracking-tight shadow-sm border ${
                    isYes
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  }`}
                >
                  {isYes ? <Check className="w-6 h-6 stroke-[3]" /> : <X className="w-6 h-6 stroke-[3]" />}
                  <span>{selectedVerdict.verdict}</span>
                </div>
              </div>
            </div>

            {/* REASONING SECTION (ONLY REQUIRED TEXT) */}
            <div className="space-y-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                Cryptographic Reasoning
              </div>

              <ul className="space-y-2">
                {selectedVerdict.reasoning.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* PROTOCOL ANCHOR FOOTNOTE */}
            <div className="mt-6 pt-4 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Anchor: <strong className="text-neutral-800 dark:text-neutral-200">{selectedVerdict.anchor}</strong></span>
              </div>

              <a
                href="https://docs.arcnano.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Verify Spec</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* EVALUATION HISTORY (COMPACT PILLS) */}
        {history.length > 1 && (
          <div className="max-w-2xl mx-auto w-full mt-8">
            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-2">
              <span>Recent Evaluations</span>
              <button
                onClick={() => setHistory([selectedVerdict])}
                className="hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Clear</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedVerdict(item);
                    setQuery(item.question);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    selectedVerdict.id === item.id
                      ? "bg-neutral-100 dark:bg-white/10 border-black/20 dark:border-white/20"
                      : "bg-white dark:bg-neutral-900 border-black/[0.06] dark:border-white/[0.08] hover:border-black/15 dark:hover:border-white/15"
                  }`}
                >
                  <span className="truncate text-neutral-800 dark:text-neutral-200">
                    {item.question}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      item.verdict === "YES"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {item.verdict}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.08] py-4 px-4 sm:px-8 text-center text-[11px] font-mono text-neutral-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ArcNano Verdict • Minimalist Deterministic Reasoner</span>
          <div className="flex items-center gap-4">
            <a href="https://docs.arcnano.xyz/" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-700 dark:hover:text-neutral-200">Docs</a>
            <span>•</span>
            <a href="https://github.com/Trymbakmahant/arcnano" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-700 dark:hover:text-neutral-200">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
