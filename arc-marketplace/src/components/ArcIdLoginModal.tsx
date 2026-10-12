import React, { useState } from "react";
import { ArcUser } from "./types";

interface ArcIdLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: ArcUser) => void;
}

const PRESET_IDENTITIES = [
  {
    arcId: "agent-master.arc",
    shieldedAddress: "0xarc7f9b821a3e...402c",
    balanceUsdc: 248.5,
    vaultNotesCount: 14,
    network: "Arc Testnet (5042002)",
  },
  {
    arcId: "alphabot-pro.arc",
    shieldedAddress: "0xarc3c8812ff90...11a0",
    balanceUsdc: 512.0,
    vaultNotesCount: 28,
    network: "Arc Testnet (5042002)",
  },
  {
    arcId: "zk-arbitrageur.arc",
    shieldedAddress: "0xarc9f1cd04a67...99e1",
    balanceUsdc: 1240.0,
    vaultNotesCount: 45,
    network: "Arc Testnet (5042002)",
  },
];

export function ArcIdLoginModal({ isOpen, onClose, onLogin }: ArcIdLoginModalProps) {
  const [customArcId, setCustomArcId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: (typeof PRESET_IDENTITIES)[0]) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin(preset);
      onClose();
    }, 350);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customArcId.trim()) return;

    const formattedId = customArcId.endsWith(".arc")
      ? customArcId.trim()
      : `${customArcId.trim()}.arc`;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin({
        arcId: formattedId,
        shieldedAddress: `0xarc${Math.random().toString(16).slice(2, 10)}...402c`,
        balanceUsdc: 250.0,
        vaultNotesCount: 15,
        network: "Arc Testnet (5042002)",
      });
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 font-mono text-sm cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#0a0f1d] flex items-center justify-center text-[#00DC82] font-mono text-base font-bold shadow-sm">
            ARC
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-950">Login with Arc ID</h3>
            <p className="text-xs text-slate-500 font-mono">
              Arc L1 Agent Identity
            </p>
          </div>
        </div>

        {/* Value Prop Banner */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-5 text-xs text-slate-600 leading-relaxed font-sans">
          Connect your Arc ID to register your agent, list APIs for sale, and receive instant private payments on Arc L1.
        </div>

        {/* Custom Arc ID Form */}
        <form onSubmit={handleCustomSubmit} className="mb-5">
          <label className="block text-xs font-mono font-medium text-slate-700 mb-1.5">
            Enter Your Arc ID Handle:
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={customArcId}
                onChange={(e) => setCustomArcId(e.target.value)}
                placeholder="e.g. my-autonomous-agent.arc"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-[#e2e8f0] rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a0f1d] font-mono text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !customArcId.trim()}
              className="px-4 py-2.5 bg-[#0a0f1d] hover:bg-slate-800 disabled:opacity-50 text-[#00DC82] rounded-lg text-xs font-mono font-semibold transition-all shadow-sm cursor-pointer shrink-0"
            >
              {isSubmitting ? "Connecting..." : "Connect ID"}
            </button>
          </div>
        </form>

        {/* Quick Select Presets */}
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2.5">
            Or quick-connect demo identity:
          </div>
          <div className="space-y-2">
            {PRESET_IDENTITIES.map((preset) => (
              <button
                key={preset.arcId}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                disabled={isSubmitting}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50/70 transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00DC82]"></span>
                    <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-black">
                      {preset.arcId}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {preset.shieldedAddress}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 group-hover:bg-emerald-100 transition-colors">
                    Connect →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Target Network: Arc L1 (5042002)</span>
          <span>Zero msg.sender Leakage</span>
        </div>
      </div>
    </div>
  );
}
