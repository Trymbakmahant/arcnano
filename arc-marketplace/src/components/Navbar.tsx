import React from "react";
import { FilterKey, ArcUser } from "./types";

interface NavbarProps {
  activeFilter: FilterKey;
  onSelectFilter: (key: FilterKey) => void;
  currentUser: ArcUser | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onDisconnect: () => void;
}

export function Navbar({
  activeFilter,
  onSelectFilter,
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onDisconnect,
}: NavbarProps) {
  const handleNavClick = (filterKey: FilterKey) => {
    onSelectFilter(filterKey);
    const el = document.getElementById("browse-catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSdkClick = () => {
    const el = document.getElementById("sdk-discovery");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="w-full border-b border-[#e2e8f0] bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3 shrink-0">
          <a className="flex items-center space-x-2.5 group" href="#">
            <div className="w-8 h-8 rounded-lg bg-[#0a0f1d] flex items-center justify-center text-white font-mono text-sm font-bold shadow-sm ring-1 ring-slate-800 shrink-0">
              <span className="text-[#00DC82]">ARC</span>
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-black whitespace-nowrap">
              Arcnano-marketplace
            </span>
          </a>
        </div>

        {/* Clean Nav Links */}
        <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium text-slate-600">
          <button
            onClick={() => handleNavClick("All")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === "All"
                ? "text-slate-900 bg-slate-100 font-semibold"
                : "hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => handleNavClick("MCP")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === "MCP"
                ? "text-slate-900 bg-slate-100 font-semibold"
                : "hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            MCP Servers
          </button>
          <button
            onClick={() => handleNavClick("Sub-Agents")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === "Sub-Agents"
                ? "text-slate-900 bg-slate-100 font-semibold"
                : "hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Sub-Agents
          </button>
          <button
            onClick={() => handleNavClick("Compute")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === "Compute"
                ? "text-slate-900 bg-slate-100 font-semibold"
                : "hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Compute
          </button>
          <button
            onClick={() => handleNavClick("Security")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === "Security"
                ? "text-slate-900 bg-slate-100 font-semibold"
                : "hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Security
          </button>
          <button
            onClick={handleSdkClick}
            className="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            SDK
          </button>
        </nav>

        {/* Right Actions: List Agent CTA & Account State */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {currentUser ? (
            <>
              {/* List Agent Button */}
              <button
                onClick={onOpenRegister}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold font-mono rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                + List Agent
              </button>

              {/* Connected Arc ID Handle */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a0f1d] text-white font-mono text-xs font-semibold shadow-sm whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-[#00DC82] animate-pulse shrink-0"></span>
                <span className="truncate max-w-[130px]">{currentUser.arcId}</span>
                <button
                  onClick={onDisconnect}
                  title="Disconnect"
                  className="text-slate-400 hover:text-white ml-1 text-xs cursor-pointer leading-none"
                >
                  ✕
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold tracking-wide uppercase font-mono rounded-lg bg-[#0a0f1d] text-white hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
              type="button"
            >
              Login with Arc ID
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
