"use client";

import React from "react";
import { DOC_CATEGORIES } from "@/content/docsData";
import { ChevronDown, ChevronRight, Book, Shield, Lock, Cpu, Code2, Database } from "lucide-react";

interface SidebarProps {
  activeId: string;
  onSelectSection: (id: string) => void;
  filterText: string;
  onFilterChange: (text: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  overview: Book,
  privacy: Lock,
  security: Shield,
  circuits: Cpu,
  sdks: Code2,
  contracts: Database,
};

export default function Sidebar({
  activeId,
  onSelectSection,
  filterText,
  onFilterChange,
}: SidebarProps) {
  return (
    <aside className="w-full lg:w-72 shrink-0 border-r border-[var(--gh-border)] bg-[var(--gh-sidebar-bg)] p-4 sm:p-5 overflow-y-auto max-h-[calc(100vh-55px)] sticky top-[55px] text-xs">
      {/* Filter Input */}
      <div className="mb-4">
        <input
          type="text"
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Filter documentation..."
          className="w-full px-2.5 py-1.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] text-[var(--gh-text)] placeholder:text-[var(--gh-text-muted)] focus:outline-none focus:border-[var(--gh-accent)] transition-colors text-xs"
        />
      </div>

      <nav className="space-y-6">
        {DOC_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id] || Book;
          const filteredItems = cat.items.filter((item) =>
            item.title.toLowerCase().includes(filterText.toLowerCase())
          );

          if (filterText && filteredItems.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center gap-2 px-2 py-1 font-semibold text-[var(--gh-text)] uppercase tracking-wider text-[11px]">
                <Icon className="w-3.5 h-3.5 text-[var(--gh-text-muted)]" />
                <span>{cat.name}</span>
              </div>

              <div className="space-y-0.5 pl-2 border-l border-[var(--gh-border-muted)] ml-2.5">
                {filteredItems.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectSection(item.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between text-xs cursor-pointer ${
                        isActive
                          ? "bg-[var(--gh-code-bg)] text-[var(--gh-accent)] font-semibold border-l-2 border-[var(--gh-accent)] -ml-[1px]"
                          : "text-[var(--gh-text-muted)] hover:text-[var(--gh-text)] hover:bg-[var(--gh-code-bg)]"
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span className="ml-2 shrink-0 text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
