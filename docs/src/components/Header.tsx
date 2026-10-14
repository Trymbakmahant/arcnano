"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Moon,
  Sun,
  ExternalLink,
  BookOpen,
  Sparkles,
  Command,
} from "lucide-react";

interface HeaderProps {
  onOpenSearch: () => void;
}

export default function Header({ onOpenSearch }: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("arcnano_docs_theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("arcnano_docs_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--gh-border)] bg-[var(--gh-header-bg)] backdrop-blur-md px-4 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand + Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-neutral-950 dark:bg-neutral-800 text-white flex items-center justify-center font-bold font-mono text-xs shadow-xs group-hover:scale-105 transition-transform">
              AN
            </div>
            <span className="font-semibold text-sm tracking-tight text-[var(--gh-text)]">
              ArcNano
            </span>
            <span className="text-[var(--gh-border)]">/</span>
            <span className="text-xs font-mono font-medium text-[var(--gh-text-muted)]">
              docs
            </span>
          </Link>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            v0.1.0-stage3
          </span>
        </div>

        {/* Center: Search Button (GitHub Style Command Bar) */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[var(--gh-text-muted)] bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded-md hover:border-[var(--gh-accent)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search documentation...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[var(--gh-border)] bg-[var(--gh-bg)] text-[10px] font-mono">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 text-xs font-medium">
          <a
            href="https://arcnano.xyz/playground"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[var(--gh-text)] hover:bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Playground</span>
          </a>

          {/* npm Package Link */}
          <a
            href="https://www.npmjs.com/package/arcnano-x402"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 hover:border-red-400 transition-colors"
            title="arcnano-x402 on npm"
          >
            <span className="font-extrabold text-[10px] tracking-tight">npm</span>
            <span className="text-[10px] opacity-80">v0.1.4</span>
          </a>

          {/* PyPI Package Link */}
          <a
            href="https://pypi.org/project/arczk-agent/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:border-blue-400 transition-colors"
            title="arczk-agent on PyPI"
          >
            <span className="font-extrabold text-[10px] tracking-tight">PyPI</span>
            <span className="text-[10px] opacity-80">v0.1.2</span>
          </a>

          {/* Live on Mainnet Contract Link */}
          <a
            href="https://explorer.arc.io/address/0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-2xs"
            title="ArcNanoPool Contract on Arc Mainnet Explorer (Chain 5042)"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">Live on Mainnet</span>
            <ExternalLink className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          </a>

          <a
            href="https://github.com/Trymbakmahant/arcnano"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-md text-[var(--gh-text-muted)] hover:text-[var(--gh-text)] hover:bg-[var(--gh-canvas-subtle)] transition-colors"
            title="GitHub Repository"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
            </svg>
          </a>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-[var(--gh-text-muted)] hover:text-[var(--gh-text)] hover:bg-[var(--gh-canvas-subtle)] transition-colors cursor-pointer"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
