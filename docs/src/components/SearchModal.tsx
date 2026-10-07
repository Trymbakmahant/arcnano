"use client";

import React, { useState, useEffect } from "react";
import { DOC_SECTIONS } from "@/content/docsData";
import { Search, X, FileText, ArrowRight } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (id: string) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  onSelectSection,
}: SearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // Toggle or open
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = Object.values(DOC_SECTIONS).filter(
    (sec) =>
      sec.title.toLowerCase().includes(query.toLowerCase()) ||
      sec.summary.toLowerCase().includes(query.toLowerCase()) ||
      sec.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-xl border border-[var(--gh-border)] bg-[var(--gh-bg)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--gh-border)]">
          <Search className="w-4 h-4 text-[var(--gh-text-muted)]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search docs (e.g. privacy, double-spend, Groth16, SDK)..."
            className="flex-1 bg-transparent text-sm text-[var(--gh-text)] placeholder:text-[var(--gh-text-muted)] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--gh-text-muted)] hover:text-[var(--gh-text)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 text-xs divide-y divide-[var(--gh-border-muted)]">
          {results.length === 0 ? (
            <div className="p-6 text-center text-[var(--gh-text-muted)]">
              No documentation pages found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            results.map((res) => (
              <div
                key={res.id}
                onClick={() => {
                  onSelectSection(res.id);
                  onClose();
                }}
                className="p-3 hover:bg-[var(--gh-canvas-subtle)] rounded-lg cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--gh-text)] group-hover:text-[var(--gh-accent)]">
                      {res.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--gh-code-bg)] text-[var(--gh-text-muted)]">
                      {res.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--gh-text-muted)] line-clamp-1">
                    {res.summary}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--gh-text-muted)] group-hover:text-[var(--gh-accent)] shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
