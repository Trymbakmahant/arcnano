"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, CircuitBoard, ExternalLink, BookOpen, Shield } from "lucide-react";
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
              href="https://docs.arcnano.xyz/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-950 transition-colors flex items-center gap-1"
            >
              <span>Documentation</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
            <a
              href="https://testnet.arcscan.io/address/0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca"
              target="_blank"
              rel="noreferrer"
              className="hover:text-neutral-950 transition-colors flex items-center gap-1"
            >
              <span>Arcscan Contract</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
          </nav>

          {/* Right Action Button (Royal Blue pill like screenshot) */}
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Arc Testnet
            </span>
            <Link
              href="/#blueprint"
              className="bg-[#0033FF] hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Get Started</span>
            </Link>
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
