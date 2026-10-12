import React from "react";
import { MarketplaceNode, FilterKey } from "./types";
import { NodeCard } from "./NodeCard";

interface CatalogGridProps {
  nodes: MarketplaceNode[];
  activeFilter: FilterKey;
  viewMode: "catalog" | "raw";
  onSelectRepl: (node: MarketplaceNode) => void;
  onSelectSdk?: (node: MarketplaceNode) => void;
  onResetFilters: () => void;
}

export function CatalogGrid({
  nodes,
  activeFilter,
  viewMode,
  onSelectRepl,
  onSelectSdk,
  onResetFilters,
}: CatalogGridProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
      {viewMode === "raw" ? (
        /* RAW SPEC JSON VIEW */
        <div className="w-full bg-[#0a0f1d] rounded-2xl p-6 border border-slate-800 shadow-lg font-mono text-xs text-slate-200 overflow-x-auto">
          <div className="text-slate-400 mb-4 pb-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[#00DC82] font-bold uppercase tracking-wider">
              # OpenAPI 3.1 &amp; Model Context Protocol Manifest Spec
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Arc L1 Autonomous Gateway Registry
            </span>
          </div>
          <pre className="text-slate-300 leading-relaxed">
            {JSON.stringify(
              {
                spec_version: "arcnano-x402-v1.4",
                gateway: "https://api.arcnano.xyz",
                filter: activeFilter,
                total_available: nodes.length,
                nodes: nodes.map((n) => ({
                  id: n.id,
                  name: n.name,
                  category: n.category,
                  endpoint: n.endpoint,
                  owner_arc_id: n.ownerArcId,
                  pricing: {
                    amount_usdc: n.costNumeric,
                    unit: n.priceUnit,
                    scheme: "X402-Shielded-Groth16",
                  },
                  arcnano_verification: n.arcnanoVerification,
                  sla: {
                    latency_ms: n.latencyNumeric,
                    status: "verified",
                  },
                  tags: n.tags,
                })),
              },
              null,
              2
            )}
          </pre>
        </div>
      ) : (
        /* VISUAL NODE CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              onSelectRepl={onSelectRepl}
              onSelectSdk={onSelectSdk}
            />
          ))}
        </div>
      )}

      {nodes.length === 0 && (
        <div className="w-full bg-white rounded-2xl p-12 border border-[#e2e8f0] text-center flex flex-col items-center justify-center gap-2">
          <h4 className="text-base font-bold text-slate-800">
            No matching autonomous capabilities found
          </h4>
          <p className="text-xs text-slate-500 max-w-md">
            Try clearing your search query or reset the filter to view all digital assets.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-3 px-4 py-2 bg-[#0a0f1d] text-white rounded-lg text-xs font-mono font-medium hover:bg-slate-800 cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </section>
  );
}
