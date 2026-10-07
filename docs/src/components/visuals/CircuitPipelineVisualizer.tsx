"use client";

import React, { useState } from "react";
import { Cpu, Binary, ShieldCheck, ArrowRight, ArrowDown, Lock, Unlock, Hash, EyeOff } from "lucide-react";

interface CircuitStage {
  id: string;
  name: string;
  formula: string;
  type: "private" | "constraint" | "public";
  description: string;
  r1csConstraints: string;
  securityImpact: string;
}

const CIRCUIT_STAGES: CircuitStage[] = [
  {
    id: "leaf",
    name: "1. Leaf Commitment Derivation",
    formula: "leaf = Poseidon(secret, nullifierSeed)",
    type: "constraint",
    description: "Computes the 254-bit BN254 scalar leaf hash using Poseidon(2). The inputs secret and nullifierSeed remain strictly in memory and are never revealed.",
    r1csConstraints: "~240 R1CS constraints",
    securityImpact: "Pre-image resistance guarantees an adversary cannot recover the spending secret even if they possess the on-chain leaf commitment.",
  },
  {
    id: "merkle",
    name: "2. 20-Level Merkle Tree Inclusion",
    formula: "MerkleCheck(leaf, pathElements[20], pathIndices[20]) === root",
    type: "constraint",
    description: "Traverses 20 levels of Poseidon hashing to verify that the leaf exists inside the on-chain incremental Merkle tree whose root is certified on ArcNanoPool.",
    r1csConstraints: "~4,800 R1CS constraints (20 levels × Poseidon(2))",
    securityImpact: "Proves that the note was genuinely deposited into the pool without revealing its leafIndex or position in the tree (anonymity set = 2^20).",
  },
  {
    id: "nullifier",
    name: "3. Deterministic Nullifier Tag",
    formula: "nullifierHash = Poseidon(nullifierSeed, leafIndex)",
    type: "constraint",
    description: "Derives the unforgeable public nullifier hash. Because Poseidon is deterministic, there is exactly one valid nullifierHash for this note.",
    r1csConstraints: "~240 R1CS constraints",
    securityImpact: "Prevents double-spending. If the note is presented again, the same nullifierHash will be computed, causing instant rejection.",
  },
  {
    id: "anti-frontrun",
    name: "4. Anti-Frontrunning Quadratic Constraint",
    formula: "recipient_sq <== recipient * recipient",
    type: "constraint",
    description: "Forces recipient to be an active linear constraint in the R1CS system, binding the withdrawal proof specifically to the merchant / API provider address.",
    r1csConstraints: "1 quadratic R1CS constraint",
    securityImpact: "Cryptographically binds the Groth16 proof to the recipient. An eavesdropper or MEV bot cannot intercept the proof and substitute their own address.",
  },
  {
    id: "asp",
    name: "5. Privacy Pools ASP Non-Membership",
    formula: "ASPVerifier(leaf, aspPath) === aspRoot",
    type: "constraint",
    description: "Verifies that the deposit commitment does NOT belong to the illicit association set (ASP root 0x0), proving clean provenance without doxxing.",
    r1csConstraints: "~4,800 R1CS constraints",
    securityImpact: "Ensures OFAC & AML compliance by mathematically excluding flagged depositors while preserving 100% financial confidentiality.",
  },
];

export default function CircuitPipelineVisualizer() {
  const [selectedStage, setSelectedStage] = useState<string>("anti-frontrun");

  const stage = CIRCUIT_STAGES.find((s) => s.id === selectedStage) || CIRCUIT_STAGES[0];

  return (
    <div className="my-6 border border-[var(--gh-border)] rounded-lg bg-[var(--gh-bg)] overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-4 py-3 bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span className="font-semibold text-xs tracking-wide text-[var(--gh-text)] uppercase">
            Circom 2.1 R1CS Circuit Pipeline: `withdraw.circom`
          </span>
        </div>
        <span className="text-[11px] font-mono text-[var(--gh-text-muted)]">
          Total Constraints: ~10,081 R1CS
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {/* Top Architecture Blueprint: Private RAM -> Circom Circuit -> Public Signals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          {/* Box 1: Private Witness */}
          <div className="p-3 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
              <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
              <span>Private Witness (RAM Only)</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
              <div className="bg-[var(--gh-bg)] p-1 rounded border border-emerald-200 dark:border-emerald-900/60">
                • secret [254-bit scalar]
              </div>
              <div className="bg-[var(--gh-bg)] p-1 rounded border border-emerald-200 dark:border-emerald-900/60">
                • nullifierSeed [254-bit]
              </div>
              <div className="bg-[var(--gh-bg)] p-1 rounded border border-emerald-200 dark:border-emerald-900/60">
                • pathElements[20]
              </div>
              <div className="bg-[var(--gh-bg)] p-1 rounded border border-emerald-200 dark:border-emerald-900/60">
                • pathIndices[20]
              </div>
            </div>
          </div>

          {/* Box 2: R1CS Engine */}
          <div className="p-3 rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-800 dark:text-purple-300 mb-2">
              <Binary className="w-3.5 h-3.5 text-purple-600" />
              <span>Groth16 Zero-Knowledge Synthesis</span>
            </div>
            <div className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-2">
              Enforces quadratic constraints $A \cdot s \circ B \cdot s = C \cdot s$ over the BN254 elliptic curve.
            </div>
            <div className="text-[11px] font-mono text-purple-700 dark:text-purple-300 font-semibold">
              Prover time: &lt;120ms in browser/Python
            </div>
          </div>

          {/* Box 3: Public Signals */}
          <div className="p-3 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 dark:text-sky-300 mb-2">
              <Hash className="w-3.5 h-3.5 text-sky-600" />
              <span>Public Signals Output</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
              <div className="bg-[var(--gh-bg)] p-1 rounded border border-sky-200 dark:border-sky-900/60">
                • root (Merkle Root)
              </div>
              <div className="bg-[var(--gh-bg)] p-1 rounded border border-sky-200 dark:border-sky-900/60">
                • nullifierHash (Anti Double-Spend)
              </div>
              <div className="bg-[var(--gh-bg)] p-1 rounded border border-sky-200 dark:border-sky-900/60">
                • recipient (Anti-Frontrun target)
              </div>
              <div className="bg-[var(--gh-bg)] p-1 rounded border border-sky-200 dark:border-sky-900/60">
                • aspRoot (Sanctions Set)
              </div>
            </div>
          </div>
        </div>

        {/* Constraint Stages Selector */}
        <div className="border border-[var(--gh-border)] rounded-md overflow-hidden bg-[var(--gh-canvas-subtle)] mb-4">
          <div className="p-2 border-b border-[var(--gh-border)] text-[11px] font-mono font-semibold text-[var(--gh-text-muted)] uppercase">
            Circuit Constraints Sub-Modules (Click to inspect)
          </div>
          <div className="divide-y divide-[var(--gh-border)]">
            {CIRCUIT_STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStage(s.id)}
                className={`w-full p-2.5 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  s.id === selectedStage
                    ? "bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-semibold"
                    : "hover:bg-[var(--gh-bg)] text-[var(--gh-text)]"
                }`}
              >
                <span>{s.name}</span>
                <span className="font-mono text-[11px] text-[var(--gh-text-muted)]">{s.r1csConstraints}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Selected Constraint Card */}
        <div className="p-4 rounded-lg border border-[var(--gh-border)] bg-[var(--gh-bg)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-[var(--gh-border)]">
            <span className="text-sm font-semibold text-[var(--gh-text)]">{stage.name}</span>
            <code className="px-2 py-0.5 rounded bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-sky-600 text-[11px] font-mono">
              {stage.formula}
            </code>
          </div>
          <p className="text-xs text-[var(--gh-text-muted)] leading-relaxed mb-3">
            {stage.description}
          </p>
          <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <strong className="font-semibold mr-1">Security Guarantee:</strong>
              <span>{stage.securityImpact}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
