"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SchematicFlowGraph from "@/component/UI/SchematicFlowGraph";
import LiveArcnetDemo from "@/component/UI/LiveArcnetDemo";
import {
  Maximize2,
  Minimize2,
  ChevronLeft,
  CircuitBoard,
} from "lucide-react";

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<"live" | "schematic">("live");
  const [cinemaMode, setCinemaMode] = useState<boolean>(false);

  // Keyboard shortcut for presentation / cinema view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "c" || e.key === "C" || e.key === "Escape") {
        setCinemaMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 font-sans antialiased selection:bg-amber-500 selection:text-white relative flex flex-col justify-between overflow-x-hidden">
      {/* Background CAD Grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* TOP HEADER / CONTROLS BAR (Hidden in Cinema Mode) */}
      {!cinemaMode && (
        <header className="relative z-40 border-b border-neutral-200/90 bg-white/90 backdrop-blur-xl px-4 sm:px-6 py-3 transition-all">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
            {/* Brand + Breadcrumb */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs font-mono text-neutral-600 hover:text-neutral-950 transition-colors bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 px-2.5 py-1.5 rounded-md"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Protocol</span>
              </Link>

              <div className="h-4 w-[1px] bg-neutral-200 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-neutral-950 flex items-center justify-center p-1 shadow-xs">
                  <Image
                    src="/arcnano-icon-white.png"
                    alt="ArcNano"
                    width={16}
                    height={16}
                    className="w-3.5 h-3.5 object-contain"
                  />
                </div>
                <span className="text-sm font-semibold tracking-tight text-neutral-950">
                  ArcNano Protocol Studio
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 uppercase font-medium">
                  Arc Testnet (5042002)
                </span>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-neutral-100 border border-neutral-200 rounded-lg shadow-2xs">
              <button
                onClick={() => setActiveTab("live")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                  activeTab === "live"
                    ? "bg-white text-neutral-950 shadow-xs border border-neutral-200/80 font-bold"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Testnet Sandbox</span>
              </button>

              <button
                onClick={() => setActiveTab("schematic")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                  activeTab === "schematic"
                    ? "bg-white text-neutral-950 shadow-xs border border-neutral-200/80 font-bold"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                <CircuitBoard className="w-3.5 h-3.5 text-sky-600" />
                <span>Circuit Schematic</span>
              </button>
            </div>

            {/* Presentation / Cinema Action */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setCinemaMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-mono font-medium transition-colors shadow-xs cursor-pointer"
                title="Fullscreen presentation view (Press C or Esc)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Cinema View (C)</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* FLOATING ESCAPE PILL (Only visible in Cinema Mode) */}
      {cinemaMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-neutral-300 text-[11px] font-mono text-neutral-700 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cinema Presentation</span>
            <button
              onClick={() => setCinemaMode(false)}
              className="ml-2 px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-900 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Minimize2 className="w-3 h-3" />
              <span>Exit (Esc)</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN STAGE CANVAS */}
      <main className="flex-1 flex flex-col justify-start max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {activeTab === "live" ? (
          <LiveArcnetDemo />
        ) : (
          <SchematicFlowGraph />
        )}
      </main>

      {/* FOOTER */}
      {!cinemaMode && (
        <footer className="border-t border-neutral-200/90 bg-white/80 backdrop-blur-sm py-3 px-6 text-center text-[11px] font-mono text-neutral-500">
          Tip: Hit <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-neutral-800">Cinema View</kbd> or press <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-neutral-800">C</kbd> for fullscreen presentation mode. Toggle <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-neutral-800">Arcscan Compare</kbd> to inspect the public block explorer.
        </footer>
      )}
    </div>
  );
}
