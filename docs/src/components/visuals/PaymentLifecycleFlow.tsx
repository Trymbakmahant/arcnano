"use client";

import React, { useState } from "react";
import { Shield, ArrowRight, Zap, Database, Cpu, CheckCircle2, Lock, EyeOff, Server, Globe } from "lucide-react";

interface Step {
  id: number;
  badge: string;
  title: string;
  latency: string;
  description: string;
  privateInRam: string[];
  publicOnWire: string[];
  arcFootprint: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    badge: "Stage 01",
    title: "Shield Funds into Arc NanoPool",
    latency: "~1 block (Arc Testnet)",
    description:
      "Agent deposits 0.01 USDC into the ArcNanoPool smart contract. The deposit generates a secret and nullifier seed, hashing them into a leaf commitment.",
    privateInRam: [
      "Spending Secret (s) — 254-bit random scalar",
      "Nullifier Seed (k) — 254-bit secret key",
      "Leaf Index in Merkle Tree",
    ],
    publicOnWire: [
      "Leaf Commitment = Poseidon(s, k)",
      "Deposit Amount = 0.01 USDC",
      "Depositor wallet (only linked to deposit pool, never to future spenders)",
    ],
    arcFootprint: "ArcNanoPool.sol updates 20-level incremental Merkle tree root.",
  },
  {
    id: 2,
    badge: "Stage 02",
    title: "HTTP 402 Challenge & RAM Proof Synthesis",
    latency: "<120ms (Client RAM)",
    description:
      "Agent attempts to access paywalled AI inference API. Gateway halts request with HTTP 402 Payment Required and provides invoice challenge. Client synthesizes Groth16 witness in local memory.",
    privateInRam: [
      "Spending Secret & Nullifier Seed",
      "20 Merkle Path Siblings (Membership proof)",
      "ASP Merkle Inclusion Proof",
    ],
    publicOnWire: [
      "HTTP 402 Response Headers: X-Payment-Challenge, Recipient Address",
      "Invoice Identifier",
    ],
    arcFootprint: "Zero on-chain activity. Purely local computation in client RAM.",
  },
  {
    id: 3,
    badge: "Stage 03",
    title: "Sub-8ms Off-Chain Pairing & Stream Release",
    latency: "<8ms (Gateway Verifier)",
    description:
      "Client submits Groth16 proof with payment request. The Gateway executes in-memory bilinear BN254 pairing (e(A,B) == e(alpha,beta)...) and checks local nullifier cache in <0.05ms.",
    privateInRam: [
      "Identity of payer completely absent (0% msg.sender)",
      "Zero knowledge of which original deposit is being redeemed",
    ],
    publicOnWire: [
      "Groth16 Proof (pi_a, pi_b, pi_c)",
      "Public Signals: [MerkleRoot, NullifierHash, Recipient, ASPRoot]",
      "Token streaming chunks dispatched to client concurrently",
    ],
    arcFootprint: "Zero on-chain latency. Zero gas spent. Instant delivery.",
  },
  {
    id: 4,
    badge: "Stage 04",
    title: "Batched Settlement on Arc Testnet",
    latency: "Async (~60s batch interval)",
    description:
      "Gateway collects verified shielded proofs throughout the epoch and submits a batched settlement transaction to ArcNanoPool.sol, transferring USDC to provider balance.",
    privateInRam: [
      "Client is long offline; no active connection required.",
    ],
    publicOnWire: [
      "Batch Transaction: Array of nullifier hashes & proofs",
      "Provider receives aggregated USDC payout",
    ],
    arcFootprint: "Nullifiers registered in on-chain mapping; double-spends permanently prevented.",
  },
];

export default function PaymentLifecycleFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const current = STEPS[activeStep];

  return (
    <div className="my-6 border border-[var(--gh-border)] rounded-lg bg-[var(--gh-bg)] overflow-hidden shadow-xs">
      {/* Top Header */}
      <div className="px-4 py-3 bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-xs tracking-wide text-[var(--gh-text)] uppercase">
            Interactive Architecture Flow: End-to-End Payment Lifecycle
          </span>
        </div>
        <span className="text-[11px] font-mono text-[var(--gh-text-muted)]">
          Step {activeStep + 1} of {STEPS.length}
        </span>
      </div>

      {/* Step Pills Navigation */}
      <div className="p-3 border-b border-[var(--gh-border)] bg-[var(--gh-bg)] grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STEPS.map((s, idx) => {
          const isActive = idx === activeStep;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className={`p-2.5 rounded-md text-left transition-all cursor-pointer border ${
                isActive
                  ? "bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-600 text-sky-900 dark:text-sky-200 shadow-2xs"
                  : "bg-[var(--gh-canvas-subtle)] border-[var(--gh-border)] text-[var(--gh-text-muted)] hover:text-[var(--gh-text)] hover:border-neutral-400"
              }`}
            >
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider mb-0.5">
                {s.badge}
              </div>
              <div className="text-xs font-medium truncate">{s.title}</div>
            </button>
          );
        })}
      </div>

      {/* Main Flow Visualizer Card */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-[var(--gh-border)]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-2">
              <CheckCircle2 className="w-3 h-3" />
              Latency: {current.latency}
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-[var(--gh-text)]">
              {current.title}
            </h4>
            <p className="text-xs sm:text-sm text-[var(--gh-text-muted)] mt-1 max-w-2xl leading-relaxed">
              {current.description}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-center">
            <button
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              className="px-3 py-1.5 text-xs rounded border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] text-[var(--gh-text)] hover:bg-[var(--gh-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={activeStep === STEPS.length - 1}
              onClick={() => setActiveStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
              className="px-3 py-1.5 text-xs rounded border border-sky-600 bg-sky-600 hover:bg-sky-700 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dual Inspection Panels: Private RAM vs Public Wire */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Private in Client RAM */}
          <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>STRICTLY CONFIDENTIAL (Client RAM)</span>
            </div>
            <ul className="space-y-1.5">
              {current.privateInRam.map((item, i) => (
                <li key={i} className="text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                  <span className="text-emerald-500 font-mono text-[11px] mt-0.5">•</span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Public on Network Wire */}
          <div className="p-3.5 rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-800 dark:text-sky-300 mb-2.5">
              <Globe className="w-4 h-4 text-sky-600" />
              <span>PUBLIC ON WIRE / NETWORK PAYLOAD</span>
            </div>
            <ul className="space-y-1.5">
              {current.publicOnWire.map((item, i) => (
                <li key={i} className="text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                  <span className="text-sky-500 font-mono text-[11px] mt-0.5">•</span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Arc Footprint Bar */}
        <div className="mt-4 p-3 rounded-md bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] flex items-center gap-2 text-xs text-[var(--gh-text)]">
          <Database className="w-4 h-4 text-purple-500 shrink-0" />
          <div>
            <strong className="font-medium mr-1.5">Arc Testnet Footprint:</strong>
            <span className="text-[var(--gh-text-muted)] font-mono text-[11px]">
              {current.arcFootprint}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
