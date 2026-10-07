"use client";

import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, RefreshCw, XCircle, CheckCircle2, Play, GitBranch } from "lucide-react";

export default function DoubleSpendSimulator() {
  const [simulationStep, setSimulationStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const steps = [
    {
      title: "1. Agent A Holds 1 Shielded Note (0.01 USDC)",
      time: "T + 0ms",
      details: "Agent A holds a private note with secret s and nullifier seed k. Crucially, the mathematical nullifier hash is uniquely deterministic: N = Poseidon(k, leafIndex) = 0x8f4b...19a2.",
      statusB: "IDLE",
      statusC: "IDLE",
      poolState: "Nullifier 0x8f4b... UNSPENT in ArcNanoPool.sol",
      callout: "Because Poseidon is a deterministic permutation, Agent A CANNOT produce a second nullifier for this note without changing the leafIndex (which would invalidate the Merkle inclusion proof).",
    },
    {
      title: "2. Agent A Concurrently Dispatches Request to Provider B & C",
      time: "T + 2ms",
      details: "Agent A generates two Groth16 proofs: Proof #1 bound to Provider B's recipient address (0x0638...), and Proof #2 bound to Provider C's recipient address (0x918f...). Both proofs contain the identical nullifier N = 0x8f4b...19a2.",
      statusB: "RECEIVING PROOF #1",
      statusC: "RECEIVING PROOF #2",
      poolState: "Nullifier 0x8f4b... UNSPENT",
      callout: "Agent A cannot swap the proofs: Proof #1 has recipient_sq = (0x0638)^2 in public signals; if sent to C, C's gateway immediately rejects it as a front-run attempt.",
    },
    {
      title: "3. Provider B Verifies in <8ms & Claims Nullifier N",
      time: "T + 7ms",
      details: "Provider B's gateway verifies Groth16 pairing in 0.0024ms and checks its local memory cache. Nullifier N is free! Provider B locks N in fast cache and immediately streams the LLM response tokens to Agent A.",
      statusB: "VERIFIED & STREAMING (200 OK)",
      statusC: "PROCESSING PROOF #2",
      poolState: "Provider B queues N for Arc Testnet batch settlement.",
      callout: "Provider B is 100% safe. Even if Agent A disconnects, Provider B holds a valid ZK withdrawal voucher for 0.01 USDC on Arc.",
    },
    {
      title: "4. Provider C Verifies or Attempts Arc NanoPool Settlement",
      time: "T + 12ms / Settlement",
      details: "Provider C receives Proof #2. If using shared memory cache / cluster gossip, C rejects instantly with HTTP 409 Conflict. If isolated, C submits to ArcNanoPool.sol.",
      statusB: "COMPLETED & PAID",
      statusC: "SETTLEMENT REVERTED (0 USDC)",
      poolState: "ArcNanoPool.sol REVERTS: 'NullifierAlreadySpent(0x8f4b...19a2)'",
      callout: "CRITICAL SECURITY INVARIANT: ArcNanoPool enforces `require(!nullifiers[N])`. Exactly ONE provider receives the USDC deposit. Double spending is mathematically impossible.",
    },
  ];

  const handleNext = () => {
    if (simulationStep < steps.length - 1) {
      setSimulationStep((s) => s + 1);
    } else {
      setSimulationStep(0);
    }
  };

  const handleReset = () => {
    setSimulationStep(0);
  };

  const current = steps[simulationStep];

  return (
    <div className="my-6 border border-[var(--gh-border)] rounded-lg bg-[var(--gh-bg)] overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-4 py-3 bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="font-semibold text-xs tracking-wide text-[var(--gh-text)] uppercase">
            Interactive Simulation: Double-Spend Race Condition
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="text-[11px] font-mono text-[var(--gh-text-muted)] hover:text-[var(--gh-text)] flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {/* Scenario description banner */}
        <div className="p-3 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-[var(--gh-border)] mb-4 text-xs">
          <span className="font-semibold text-[var(--gh-text)]">Test Scenario: </span>
          <span className="text-[var(--gh-text-muted)] font-mono">
            Agent A (1 Note = 0.01 USDC) executes concurrent spend against Provider B & Provider C.
          </span>
        </div>

        {/* Step progress tracker */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between">
            {steps.map((st, idx) => (
              <button
                key={idx}
                onClick={() => setSimulationStep(idx)}
                className={`flex-1 text-center pb-2 border-b-2 text-[11px] font-mono cursor-pointer transition-colors ${
                  idx === simulationStep
                    ? "border-sky-600 text-sky-600 font-bold"
                    : idx < simulationStep
                    ? "border-emerald-500 text-emerald-600"
                    : "border-neutral-300 dark:border-neutral-800 text-[var(--gh-text-muted)]"
                }`}
              >
                Step {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Active Stage Details */}
        <div className="p-4 rounded-lg border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] mb-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm sm:text-base font-semibold text-[var(--gh-text)]">
              {current.title}
            </h4>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--gh-bg)] border border-[var(--gh-border)] text-sky-600">
              {current.time}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--gh-text-muted)] leading-relaxed">
            {current.details}
          </p>

          <div className="mt-3 p-2.5 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span className="leading-snug">{current.callout}</span>
          </div>
        </div>

        {/* Real-time State Monitors: Provider B vs Provider C vs Arc NanoPool */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Provider B */}
          <div className="p-3 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)]">
            <div className="text-[11px] font-mono text-[var(--gh-text-muted)] mb-1">
              PROVIDER B (Recipient 0x0638)
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-xs">
              {current.statusB.includes("VERIFIED") || current.statusB.includes("COMPLETED") ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : current.statusB.includes("RECEIVING") ? (
                <RefreshCw className="w-4 h-4 text-sky-500 animate-spin" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
              )}
              <span
                className={
                  current.statusB.includes("VERIFIED") || current.statusB.includes("COMPLETED")
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-[var(--gh-text)]"
                }
              >
                {current.statusB}
              </span>
            </div>
          </div>

          {/* Provider C */}
          <div className="p-3 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)]">
            <div className="text-[11px] font-mono text-[var(--gh-text-muted)] mb-1">
              PROVIDER C (Recipient 0x918f)
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-xs">
              {current.statusC.includes("REVERTED") ? (
                <XCircle className="w-4 h-4 text-rose-600" />
              ) : current.statusC.includes("PROCESSING") ? (
                <RefreshCw className="w-4 h-4 text-sky-500 animate-spin" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
              )}
              <span
                className={
                  current.statusC.includes("REVERTED")
                    ? "text-rose-700 dark:text-rose-400"
                    : "text-[var(--gh-text)]"
                }
              >
                {current.statusC}
              </span>
            </div>
          </div>

          {/* On-Chain Arc NanoPool */}
          <div className="p-3 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)]">
            <div className="text-[11px] font-mono text-[var(--gh-text-muted)] mb-1">
              ARC TESTNET POOL STATE
            </div>
            <div className="text-xs font-mono font-medium text-[var(--gh-text)] truncate" title={current.poolState}>
              {current.poolState}
            </div>
          </div>
        </div>

        {/* Simulator controls */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-[var(--gh-border)]">
          <span className="text-xs text-[var(--gh-text-muted)]">
            Step {simulationStep + 1} of {steps.length}
          </span>
          <button
            onClick={handleNext}
            className="px-4 py-1.5 text-xs font-medium rounded-md bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{simulationStep === steps.length - 1 ? "Replay Simulation" : "Simulate Next Tick"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
