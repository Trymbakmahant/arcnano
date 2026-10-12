import React from "react";
import { Icon } from "./Icons";
import { ASSET_CLASSES } from "./data";
import { FilterKey } from "./types";

interface AssetClassesSectionProps {
  activeFilter: FilterKey;
  onSelectFilter: (key: FilterKey) => void;
}

export function AssetClassesSection({ activeFilter, onSelectFilter }: AssetClassesSectionProps) {
  const handleClick = (filterKey: FilterKey) => {
    onSelectFilter(activeFilter === filterKey ? "All" : filterKey);
    const el = document.getElementById("browse-catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8" id="assets">
      <div className="flex items-center justify-between mb-5 border-b border-[#e2e8f0] pb-3">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00DC82]"></span>
          <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-900">
            Digital Asset Classes
          </h2>
        </div>
      </div>

      {/* Streamlined Interactive Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {ASSET_CLASSES.map((item) => {
          const isSelected = activeFilter === item.filterKey;

          if (item.isDark) {
            return (
              <div
                key={item.id}
                onClick={() => handleClick(item.filterKey)}
                className={`bg-[#0a0f1d] text-white border border-[#0a0f1d] rounded-xl p-5 card-hover-fx flex flex-col justify-between group cursor-pointer shadow-md transition-all ${
                  isSelected ? "ring-2 ring-[#00DC82]" : ""
                }`}
                data-purpose="asset-card"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 text-[#00DC82] flex items-center justify-center">
                      <Icon name={item.icon} />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-[#00DC82] font-medium border border-slate-700">
                      {item.count} Nodes
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-[#00DC82] group-hover:text-white">
                  <span>{item.subtext}</span>
                  <span>→</span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              onClick={() => handleClick(item.filterKey)}
              className={`bg-white border rounded-xl p-5 card-hover-fx flex flex-col justify-between group cursor-pointer transition-all ${
                isSelected
                  ? "border-slate-900 shadow-md ring-2 ring-slate-900/10"
                  : "border-[#e2e8f0] hover:border-slate-400"
              }`}
              data-purpose="asset-card"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                    <Icon name={item.icon} />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                    {item.count} Nodes
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-black">
                  {item.title}
                </h3>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400 group-hover:text-slate-800">
                <span>{item.subtext}</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
