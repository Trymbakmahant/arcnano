"use client";

import React, { memo } from "react";

const MARQUEE_ITEMS = [
  "X402 Protocol",
  "Zero msg.sender Leakage",
  "Receiver-Batched Settlement",
  "Arc Circle Gas Station",
  "Privacy Pools ASP Checks",
  "Poseidon Merkle Vault",
  "Sub-Cent Machine Micropayments",
  "Autonomous AI Agent Swarms",
  "Arc Network Ecosystem",
  "Two-Stage Verification",
];

function ProtocolMarquee() {
  return (
    <div className="w-full bg-white py-3.5 border-y border-neutral-200/90 overflow-hidden relative z-10 shadow-sm select-none">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-mono text-neutral-600 will-change-transform">
        {MARQUEE_ITEMS.concat(MARQUEE_ITEMS).map((item, idx) => (
          <span key={idx} className="flex items-center gap-8">
            <span className="font-medium text-neutral-800">{item}</span>
            <span className="text-sky-500">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default memo(ProtocolMarquee);
