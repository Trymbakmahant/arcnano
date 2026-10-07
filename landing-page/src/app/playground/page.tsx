"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, CircuitBoard, Sparkles, ExternalLink } from "lucide-react";
import ShieldedPlayground from "@/component/UI/ShieldedPlayground";

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-neutral-900 font-sans antialiased selection:bg-sky-500 selection:text-white relative flex flex-col justify-between overflow-x-hidden">
      {/* Background CAD Grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(#000000 1px, transparent 1px), linear-gradient(90deg, #000000 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* TOP HEADER / CONTROLS BAR */}
      <header className="sticky top-0 z-40 border-b border-neutral-200/90 bg-white/95 backdrop-blur-xl px-4 sm:px-6 py-3 transition-all shadow-2xs">
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
                  alt="ArcNano Logo"
                  width={20}
                  height={20}
                  className="w-3.5 h-3.5 object-contain"
                />
              </div>
              <span className="font-semibold text-sm tracking-tight text-neutral-900">
                ArcNano
              </span>
              <span className="text-neutral-400 font-mono text-xs">/</span>
              <span className="text-xs font-mono uppercase text-sky-800 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Playground
              </span>
            </div>
          </div>

          {/* Quick Nav to other pages */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <Link
              href="/demo"
              className="text-neutral-600 hover:text-neutral-950 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50"
            >
              <CircuitBoard className="w-3.5 h-3.5 text-amber-600" />
              <span>Agent Demo & Schematic</span>
            </Link>
            <a
              href="https://testnet.arcscan.io/address/0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              <span>Arcscan Contract</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* MAIN PLAYGROUND BODY */}
      <main className="flex-1 relative z-10">
        <ShieldedPlayground />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-200/80 bg-white py-6 px-4 sm:px-8 text-center text-xs font-mono text-neutral-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>ArcNano Protocol • Stage 03 Shielded Micropayments Playground</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Trymbakmahant/arcnano"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-900 transition-colors"
            >
              GitHub Repository
            </a>
            <span>•</span>
            <a
              href="https://testnet.arcscan.io"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-900 transition-colors"
            >
              Arc Testnet Explorer (5042002)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
