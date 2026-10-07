"use client";

import React from "react";
import { ExternalLink, Edit3, MessageSquare } from "lucide-react";

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  // Extract headings from markdown content
  const headings = content
    .split("\n")
    .filter((line) => line.startsWith("## ") || line.startsWith("### "))
    .map((line) => {
      const isH2 = line.startsWith("## ");
      const title = line.replace(/^#{2,3}\s/, "").trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return { id, title, isH2 };
    });

  if (headings.length === 0) return null;

  return (
    <div className="hidden xl:block w-64 shrink-0 pl-6 border-l border-[var(--gh-border)] text-xs sticky top-[75px] max-h-[calc(100vh-100px)] overflow-y-auto">
      <span className="font-semibold text-[var(--gh-text)] block mb-3 uppercase tracking-wider text-[11px]">
        In this article
      </span>
      <nav className="space-y-1.5 mb-8">
        {headings.map((h, i) => (
          <a
            key={i}
            href={`#${h.id}`}
            className={`block text-[var(--gh-text-muted)] hover:text-[var(--gh-accent)] transition-colors leading-relaxed ${
              h.isH2 ? "font-medium" : "pl-3 text-[11px]"
            }`}
          >
            {h.title}
          </a>
        ))}
      </nav>

      <div className="pt-4 border-t border-[var(--gh-border-muted)] space-y-2 text-[11px] text-[var(--gh-text-muted)]">
        <a
          href="https://github.com/Trymbakmahant/arcnano"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 hover:text-[var(--gh-text)] transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit this page on GitHub</span>
        </a>
        <a
          href="https://github.com/Trymbakmahant/arcnano/issues"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 hover:text-[var(--gh-text)] transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Report documentation issue</span>
        </a>
      </div>
    </div>
  );
}
