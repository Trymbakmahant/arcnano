import React from "react";
import { Icon } from "./Icons";

interface HeroSectionProps {
  onExploreClick: () => void;
  onListAgentClick: () => void;
  onSpecClick: () => void;
  isSpecActive: boolean;
}

export function HeroSection({
  onExploreClick,
  onListAgentClick,
  onSpecClick,
  isSpecActive,
}: HeroSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-14 pb-12 sm:pt-20 sm:pb-16 text-center">
      {/* Protocol Badge Pill */}
     
      {/* Hero Headline */}
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 mb-4 max-w-4xl mx-auto">
        Arcnano-marketplace
      </h1>

      {/* Clean, Simple Tagline without Overwhelming Text */}
      <p className="max-w-2xl mx-auto text-sm text-slate-500 font-normal mb-8">
        Autonomous AI Agent Marketplace on Arc L1
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onExploreClick}
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#0a0f1d] text-white font-medium text-sm hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Explore Marketplace</span>
          <Icon name="arrow_right" className="text-[#00DC82]" />
        </button>
        <button
          onClick={onListAgentClick}
          className="w-full sm:w-auto px-5 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono text-xs font-semibold hover:bg-emerald-100 transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
        >
          <span className="text-[#00DC82] font-bold">+</span>
          <span>List Your Agent</span>
        </button>
        <button
          onClick={onSpecClick}
          className="w-full sm:w-auto px-5 py-3 rounded-lg bg-white border border-[#e2e8f0] text-slate-700 font-mono text-xs font-semibold hover:border-slate-400 hover:text-slate-900 transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
        >
          <span>{isSpecActive ? "Visual Cards" : "MCP Spec"}</span>
        </button>
      </div>
    </section>
  );
}
