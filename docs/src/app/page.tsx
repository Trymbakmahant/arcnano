"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import TableOfContents from "@/components/TableOfContents";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import SearchModal from "@/components/SearchModal";
import { DOC_SECTIONS, DOC_CATEGORIES, DocSection } from "@/content/docsData";
import { ChevronRight, ArrowLeft, ArrowRight, ShieldCheck, ExternalLink } from "lucide-react";

export default function DocsPage() {
  const [activeSectionId, setActiveSectionId] = useState<string>("privacy-guarantees");
  const [filterText, setFilterText] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Sync hash from URL if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash && DOC_SECTIONS[hash]) {
        setActiveSectionId(hash);
      }
    }
  }, []);

  const activeSection: DocSection =
    DOC_SECTIONS[activeSectionId] || DOC_SECTIONS["privacy-guarantees"];

  // Find previous and next section for bottom navigation
  const allSectionIds = Object.keys(DOC_SECTIONS);
  const currentIndex = allSectionIds.indexOf(activeSectionId);
  const prevSection = currentIndex > 0 ? DOC_SECTIONS[allSectionIds[currentIndex - 1]] : null;
  const nextSection =
    currentIndex < allSectionIds.length - 1
      ? DOC_SECTIONS[allSectionIds[currentIndex + 1]]
      : null;

  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    if (typeof window !== "undefined") {
      window.location.hash = id;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gh-bg)] flex flex-col justify-between">
      {/* Top GitHub Docs Header */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main 3-Column Documentation Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        {/* Left Sidebar */}
        <Sidebar
          activeId={activeSectionId}
          onSelectSection={handleSelectSection}
          filterText={filterText}
          onFilterChange={setFilterText}
        />

        {/* Center Main Reading Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-[var(--gh-text-muted)] mb-4 font-medium">
            <span>Docs</span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--gh-border)]" />
            <span>{activeSection.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--gh-border)]" />
            <span className="text-[var(--gh-text)] font-semibold">{activeSection.title}</span>
          </nav>

          {/* Section Header with Badge */}
          <div className="mb-6 pb-4 border-b border-[var(--gh-border)]">
            <div className="flex items-center gap-2.5 mb-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--gh-text)]">
                {activeSection.title}
              </h1>
              {activeSection.badge && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                  {activeSection.badge}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-[var(--gh-text-muted)] max-w-3xl">
              {activeSection.summary}
            </p>
          </div>

          {/* Render Markdown Content */}
          <article className="prose max-w-none">
            <MarkdownRenderer content={activeSection.content} />
          </article>

          {/* Prev / Next Page Footer Navigation */}
          <div className="mt-12 pt-6 border-t border-[var(--gh-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
            {prevSection ? (
              <button
                onClick={() => handleSelectSection(prevSection.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--gh-border)] hover:bg-[var(--gh-canvas-subtle)] text-[var(--gh-text)] transition-colors cursor-pointer w-full sm:w-auto text-left"
              >
                <ArrowLeft className="w-4 h-4 text-[var(--gh-text-muted)]" />
                <div>
                  <span className="text-[10px] text-[var(--gh-text-muted)] block uppercase">Previous</span>
                  <span>{prevSection.title}</span>
                </div>
              </button>
            ) : (
              <div />
            )}

            {nextSection && (
              <button
                onClick={() => handleSelectSection(nextSection.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--gh-border)] hover:bg-[var(--gh-canvas-subtle)] text-[var(--gh-text)] transition-colors cursor-pointer w-full sm:w-auto text-right justify-end"
              >
                <div>
                  <span className="text-[10px] text-[var(--gh-text-muted)] block uppercase">Next</span>
                  <span>{nextSection.title}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--gh-text-muted)]" />
              </button>
            )}
          </div>
        </main>

        {/* Right Rail Table of Contents */}
        <TableOfContents content={activeSection.content} />
      </div>

      {/* Global Cmd+K Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSection={handleSelectSection}
      />

      {/* GitHub Docs Footer */}
      <footer className="border-t border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] py-6 px-4 sm:px-8 text-xs text-[var(--gh-text-muted)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>© 2026 ArcNano Protocol • Documentation for docs.arcnano.xyz</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <a
              href="https://github.com/Trymbakmahant/arcnano"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--gh-text)] transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <a
              href="https://testnet.arcscan.io/address/0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[var(--gh-text)] transition-colors"
            >
              Arc Testnet (5042002)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
