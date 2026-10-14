"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import ShieldedPlayground from "@/component/UI/ShieldedPlayground";

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFC] text-neutral-900 font-sans antialiased selection:bg-blue-600 selection:text-white relative flex flex-col justify-between overflow-x-hidden">
      {/* TOP HEADER (Umbra-style minimalist navigation) */}
      <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-neutral-950 flex items-center justify-center p-1.5 shadow-2xs group-hover:bg-[#0033FF] transition-colors">
              <Image
                src="/arcnano-icon-white.png"
                alt="ArcNano Logo"
                width={20}
                height={20}
                className="w-4 h-4 object-contain"
              />
            </div>
            <span className="font-semibold text-base tracking-tight text-neutral-900">
              ArcNano
            </span>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-neutral-600 font-medium">
            <Link
              href="/"
              className="hover:text-neutral-950 transition-colors"
            >
              Protocol
            </Link>
            <Link
              href="/#blueprint"
              className="hover:text-neutral-950 transition-colors"
            >
              A2A Architecture
            </Link>
            <a
              href="https://marketplace.arcnano.xyz/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-950 transition-colors flex items-center gap-1 text-indigo-600 font-medium"
            >
              <span>Marketplace</span>
              <ExternalLink className="w-3 h-3 text-indigo-500" />
            </a>
            <a
              href="https://docs.arcnano.xyz/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-950 transition-colors flex items-center gap-1"
            >
              <span>Documentation</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
            <a
              href="https://explorer.arc.io/address/0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-950 transition-colors flex items-center gap-1 font-semibold text-emerald-700"
            >
              <span>Mainnet Contract</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>
          </nav>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://explorer.arc.io/address/0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 px-3 py-1 rounded-full shadow-2xs transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live on Mainnet (5042)
            </a>
          </div>
        </div>
      </header>

      {/* MAIN PLAYGROUND BODY */}
      <main className="flex-1 relative z-10">
        <ShieldedPlayground />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-200/70 bg-white/60 py-6 px-4 sm:px-8 text-center text-xs font-mono text-neutral-500 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>ArcNano Protocol • Stage 03 Confidential Micropayments Layer</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Trymbakmahant/arcnano"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-900 transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <a
              href="https://testnet.arcscan.io"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-900 transition-colors"
            >
              Arcscan Explorer
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
