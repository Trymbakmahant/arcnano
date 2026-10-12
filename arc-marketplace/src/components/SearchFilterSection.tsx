import React from "react";
import { Icon } from "./Icons";
import { FILTER_CHIPS } from "./data";
import { FilterKey } from "./types";

interface SearchFilterSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterKey;
  onSelectFilter: (key: FilterKey) => void;
  onExecuteFirst: () => void;
}

export function SearchFilterSection({
  searchQuery,
  onSearchChange,
  activeFilter,
  onSelectFilter,
  onExecuteFirst,
}: SearchFilterSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 mb-6" id="browse-catalog">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-6 shadow-xs">
        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon name="search" />
            </div>
            <input
              className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a0f1d] focus:border-[#0a0f1d] transition-all font-sans"
              placeholder="Search assets..."
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange("")}
                  className="font-mono text-[10px] text-slate-500 bg-white border border-[#e2e8f0] px-1.5 py-0.5 rounded hover:text-slate-900 cursor-pointer"
                >
                  Clear
                </button>
              ) : (
                <kbd className="hidden sm:inline-block font-mono text-[10px] text-slate-400 bg-white border border-[#e2e8f0] px-1.5 py-0.5 rounded">
                  ESC to clear
                </kbd>
              )}
            </div>
          </div>

          {/* Fast Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onExecuteFirst}
              className="px-4 py-2.5 bg-[#0a0f1d] hover:bg-slate-800 text-[#00DC82] rounded-lg text-xs font-mono font-semibold transition-colors flex items-center space-x-1.5 shadow-sm cursor-pointer"
              type="button"
            >
              <Icon name="bolt" />
              <span>Execute First</span>
            </button>
          </div>
        </div>

        {/* Filter Chips (Categorized & Streamlined) */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-1">Filter:</span>
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilter === chip.key;
            return (
              <button
                key={chip.key}
                onClick={() => onSelectFilter(chip.key)}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                type="button"
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
