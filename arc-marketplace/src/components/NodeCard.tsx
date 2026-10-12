import React from "react";
import { MarketplaceNode } from "./types";

interface NodeCardProps {
  node: MarketplaceNode;
  onSelectRepl: (node: MarketplaceNode) => void;
  onSelectSdk?: (node: MarketplaceNode) => void;
}

export function NodeCard({ node, onSelectRepl, onSelectSdk }: NodeCardProps) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 card-hover-fx flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs relative">
      {node.isUserRegistered && (
        <div className="absolute -top-2.5 right-6 bg-[#0a0f1d] text-[#00DC82] border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
          ★ Your Registered Agent
        </div>
      )}

      <div className="flex flex-col gap-3.5">
        {/* Header endpoint row */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-slate-800 font-semibold px-2.5 py-1 bg-slate-50 rounded-md border border-slate-200/70 truncate max-w-[210px]">
            {node.endpoint}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 font-mono text-[11px] font-semibold text-emerald-700 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00DC82] animate-pulse"></span>
            <span>{node.latency}</span>
          </div>
        </div>

        {/* Category Label & Owner */}
        <div className="text-[11px] font-mono font-medium text-slate-500 flex items-center justify-between uppercase">
          <div className="flex items-center gap-1.5">
            <span className="text-[#00DC82] font-bold">•</span>
            <span>{node.categoryBadge}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 lowercase">{node.categoryShort}</span>
          </div>
          {node.ownerArcId && (
            <span className="text-[10px] text-slate-400 font-mono lowercase truncate max-w-[120px]">
              @{node.ownerArcId}
            </span>
          )}
        </div>

        {/* Title & description */}
        <div>
          <h3 className="text-base font-bold text-slate-900 hover:text-black transition-colors leading-snug">
            {node.name}
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
            {node.description}
          </p>
        </div>

        {/* Arcnano Verification Tag */}
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50/70 border border-emerald-200/50 text-[10px] font-mono text-emerald-800 w-fit">
          <span className="text-[#00DC82] font-bold">✓</span>
          <span>Verified on Arc</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {node.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/70 text-slate-600 font-mono text-[10px]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Specs Box */}
        <div className="bg-slate-50/80 border border-slate-200/60 rounded-lg p-2.5 font-mono text-xs flex items-center justify-between text-slate-600 mt-1">
          {node.specs.map((spec) => (
            <span key={spec.label}>
              {spec.label}: <strong className="text-slate-900 font-semibold">{spec.value}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Footer Card Pricing & CTAs */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="font-mono text-base font-bold text-slate-900">{node.price}</div>
          <div className="font-mono text-[10px] text-slate-500">{node.priceUnit}</div>
        </div>
        <div className="flex items-center gap-2">
          {onSelectSdk && (
            <button
              onClick={() => onSelectSdk(node)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs transition-colors cursor-pointer"
              title="View SDK discovery snippet"
            >
              SDK
            </button>
          )}
          <button
            onClick={() => onSelectRepl(node)}
            className="px-3 py-1.5 rounded-lg bg-[#0a0f1d] hover:bg-slate-800 text-white font-mono text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            {node.actionText}
          </button>
        </div>
      </div>
    </div>
  );
}
