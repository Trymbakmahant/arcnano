"use client";

import React, { useState } from "react";
import { ShieldCheck, XCircle, CheckCircle2, AlertTriangle, Eye, EyeOff, Shield } from "lucide-react";

interface ComparisonRow {
  dimension: string;
  traditionalWeb3: {
    status: "bad" | "warning" | "good";
    text: string;
    detail: string;
  };
  centralizedStripe: {
    status: "bad" | "warning" | "good";
    text: string;
    detail: string;
  };
  arcnanoZk: {
    status: "bad" | "warning" | "good";
    text: string;
    detail: string;
  };
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    dimension: "Payer Identity (msg.sender)",
    traditionalWeb3: {
      status: "bad",
      text: "100% Leaked",
      detail: "Wallet address is permanently visible on public explorer. Every API call links directly to payer address.",
    },
    centralizedStripe: {
      status: "bad",
      text: "Full KYC / Real Name",
      detail: "Legal name, billing address, bank account or credit card number required and logged.",
    },
    arcnanoZk: {
      status: "good",
      text: "0% Leakage (Cryptographically Blind)",
      detail: "The withdrawal transaction is submitted by the provider or relayer. User wallet is NEVER referenced on-chain.",
    },
  },
  {
    dimension: "Counterparty & API Prompt Metadata",
    traditionalWeb3: {
      status: "bad",
      text: "Publicly Correlatable",
      detail: "Transaction graph reveals who paid which AI provider and at what exact timestamp.",
    },
    centralizedStripe: {
      status: "warning",
      text: "Vendor & Processor Logging",
      detail: "Stripe and provider log all query metadata, invoice details, and user accounts for analytics/audit.",
    },
    arcnanoZk: {
      status: "good",
      text: "Zero Knowledge Linkage",
      detail: "Deposit commitments are blinded (Poseidon(s,k)). An outside observer cannot discover which API provider received payment.",
    },
  },
  {
    dimension: "Balance & Holdings Snooping",
    traditionalWeb3: {
      status: "bad",
      text: "Total Portfolio Exposed",
      detail: "API provider can view user's entire token balance, DeFi positions, and transaction history.",
    },
    centralizedStripe: {
      status: "warning",
      text: "Credit Limits Checked",
      detail: "Requires financial institution credit checks and balance checks.",
    },
    arcnanoZk: {
      status: "good",
      text: "Single Note Confidentiality",
      detail: "Provider only learns that one 0.01 USDC note exists in the 20-level Merkle tree. Zero wallet balance is revealed.",
    },
  },
  {
    dimension: "Sanctions / Clean Funds Compliance",
    traditionalWeb3: {
      status: "warning",
      text: "Manual Chainalysis Screener",
      detail: "Provider must run expensive third-party taint-analysis heuristics on raw wallet address.",
    },
    centralizedStripe: {
      status: "good",
      text: "Traditional KYC / OFAC checks",
      detail: "Centralized compliance with personal identity verification.",
    },
    arcnanoZk: {
      status: "good",
      text: "Privacy Pools ASP Proof",
      detail: "Mathematical ZK non-membership proof: proves note did NOT originate from sanctioned set without revealing which note it is.",
    },
  },
  {
    dimension: "Sub-Cent Micropayments Viability",
    traditionalWeb3: {
      status: "bad",
      text: "Failed by Gas Fees",
      detail: "Paying $0.005 for 1 LLM query costs $0.05 - $0.50 in gas fees on L1/L2 networks.",
    },
    centralizedStripe: {
      status: "bad",
      text: "30¢ Minimum Base Fee",
      detail: "Standard $0.30 + 2.9% fee makes <$1.00 micropayments economically impossible.",
    },
    arcnanoZk: {
      status: "good",
      text: "Sub-8ms (<$0.0001 amortized)",
      detail: "Sub-8ms off-chain verification + amortized batch settlements allow true $0.001 per-query streaming.",
    },
  },
];

export default function PrivacyComparisonMatrix() {
  const [selectedRow, setSelectedRow] = useState<number | null>(0);

  const renderBadge = (status: "bad" | "warning" | "good", text: string) => {
    switch (status) {
      case "good":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            {text}
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3" />
            {text}
          </span>
        );
      case "bad":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3 h-3" />
            {text}
          </span>
        );
    }
  };

  return (
    <div className="my-6 border border-[var(--gh-border)] rounded-lg bg-[var(--gh-bg)] overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-4 py-3 bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-xs tracking-wide text-[var(--gh-text)] uppercase">
            Privacy & Identity Leakage Comparison Matrix
          </span>
        </div>
        <span className="text-[11px] font-mono text-[var(--gh-text-muted)]">
          Click any row for architectural deep-dive
        </span>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] text-[var(--gh-text)]">
              <th className="py-2.5 px-4 font-semibold w-1/4">Evaluation Vector</th>
              <th className="py-2.5 px-4 font-semibold w-1/4">Standard On-Chain (ERC-20)</th>
              <th className="py-2.5 px-4 font-semibold w-1/4">Stripe / Credit Card</th>
              <th className="py-2.5 px-4 font-semibold w-1/4 bg-sky-50/50 dark:bg-sky-950/20 text-sky-800 dark:text-sky-300 border-x border-[var(--gh-border)]">
                ArcNano (Shielded ZK)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--gh-border)]">
            {COMPARISON_DATA.map((row, idx) => {
              const isSelected = selectedRow === idx;
              return (
                <tr
                  key={idx}
                  onClick={() => setSelectedRow(idx)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-sky-50/60 dark:bg-sky-950/30"
                      : "hover:bg-[var(--gh-canvas-subtle)]"
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-[var(--gh-text)]">
                    {row.dimension}
                  </td>
                  <td className="py-3 px-4">
                    {renderBadge(row.traditionalWeb3.status, row.traditionalWeb3.text)}
                  </td>
                  <td className="py-3 px-4">
                    {renderBadge(row.centralizedStripe.status, row.centralizedStripe.text)}
                  </td>
                  <td className="py-3 px-4 bg-sky-50/30 dark:bg-sky-950/10 border-x border-[var(--gh-border)]">
                    {renderBadge(row.arcnanoZk.status, row.arcnanoZk.text)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Expanded Detail Panel */}
      {selectedRow !== null && (
        <div className="p-4 bg-[var(--gh-canvas-subtle)] border-t border-[var(--gh-border)]">
          <div className="text-[11px] font-mono font-semibold text-[var(--gh-text-muted)] uppercase mb-2">
            Detailed Breakdown: {COMPARISON_DATA[selectedRow].dimension}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded border border-[var(--gh-border)] bg-[var(--gh-bg)]">
              <span className="font-semibold block text-[var(--gh-text)] mb-1">Standard Web3:</span>
              <p className="text-[var(--gh-text-muted)] leading-relaxed">
                {COMPARISON_DATA[selectedRow].traditionalWeb3.detail}
              </p>
            </div>
            <div className="p-2.5 rounded border border-[var(--gh-border)] bg-[var(--gh-bg)]">
              <span className="font-semibold block text-[var(--gh-text)] mb-1">Centralized Stripe:</span>
              <p className="text-[var(--gh-text-muted)] leading-relaxed">
                {COMPARISON_DATA[selectedRow].centralizedStripe.detail}
              </p>
            </div>
            <div className="p-2.5 rounded border border-sky-300 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/30">
              <span className="font-semibold block text-sky-900 dark:text-sky-200 mb-1">ArcNano Shielded ZK:</span>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {COMPARISON_DATA[selectedRow].arcnanoZk.detail}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
