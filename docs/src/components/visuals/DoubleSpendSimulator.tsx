"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Play,
  Pause,
  GitBranch,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldAlert,
} from "lucide-react";

interface StepData {
  title: string;
  time: string;
  details: string;
  statusB: { label: string; type: "idle" | "inflight" | "verified" | "completed" };
  statusC: { label: string; type: "idle" | "inflight" | "processing" | "reverted" };
  poolState: string;
  callout: string;
}

const STEPS: StepData[] = [
  {
    title: "1. Agent A Holds 1 Shielded Note (0.01 USDC)",
    time: "T + 0ms",
    details:
      "Agent A holds a private note with secret s and nullifier seed k. The mathematical nullifier hash is uniquely deterministic: N = Poseidon(k, leafIndex) = 0x8f4b...19a2.",
    statusB: { label: "IDLE (Listening)", type: "idle" },
    statusC: { label: "IDLE (Listening)", type: "idle" },
    poolState: "Nullifier 0x8f4b... UNSPENT in ArcNanoPool.sol",
    callout:
      "Because Poseidon is a deterministic permutation, Agent A CANNOT derive a second nullifier for this note without changing the leafIndex (which breaks the Merkle inclusion proof).",
  },
  {
    title: "2. Agent A Concurrently Dispatches Request to Provider B & C",
    time: "T + 2ms",
    details:
      "Agent A generates two Groth16 proofs: Proof #1 bound to Provider B's recipient address (0x0638...), and Proof #2 bound to Provider C's recipient address (0x918f...). Both proofs contain the identical nullifier N = 0x8f4b...19a2.",
    statusB: { label: "DISPATCHED: PROOF #1 (0x0638)", type: "inflight" },
    statusC: { label: "DISPATCHED: PROOF #2 (0x918f)", type: "inflight" },
    poolState: "Nullifier 0x8f4b... UNSPENT on Arc Testnet",
    callout:
      "Anti-Frontrunning check: Proof #1 has recipient_sq = (0x0638)^2 in public signals; if intercepted or redirected to C, C's gateway immediately rejects it because the recipient does not match.",
  },
  {
    title: "3. Provider B Verifies in <8ms & Claims Nullifier N",
    time: "T + 7ms",
    details:
      "Provider B's gateway verifies Groth16 pairing in 0.0024ms and checks its local memory cache. Nullifier N is free! Provider B locks N in fast cache and immediately streams the LLM response tokens to Agent A.",
    statusB: { label: "VERIFIED & STREAMING (200 OK)", type: "verified" },
    statusC: { label: "PENDING VERIFICATION", type: "processing" },
    poolState: "Provider B queues N for Arc Testnet batch settlement.",
    callout:
      "Provider B is 100% safe. Even if Agent A disconnects or double-spends elsewhere, Provider B holds a valid ZK withdrawal voucher for 0.01 USDC on Arc.",
  },
  {
    title: "4. Provider C Verifies or Attempts Arc NanoPool Settlement",
    time: "T + 12ms / Settlement",
    details:
      "Provider C receives Proof #2. If using shared memory cache / cluster gossip, C rejects instantly with HTTP 409 Conflict. If isolated, C submits to ArcNanoPool.sol.",
    statusB: { label: "COMPLETED & PAID (0.01 USDC)", type: "completed" },
    statusC: { label: "SETTLEMENT REVERTED (0 USDC)", type: "reverted" },
    poolState: "ArcNanoPool.sol REVERTS: 'NullifierAlreadySpent(0x8f4b...19a2)'",
    callout:
      "CRITICAL SECURITY INVARIANT: ArcNanoPool enforces `require(!nullifiers[N])`. Exactly ONE provider receives the USDC deposit. Double spending is mathematically impossible on Arc.",
  },
];

export default function DoubleSpendSimulator() {
  const [simulationStep, setSimulationStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setSimulationStep((prev) => {
          if (prev >= STEPS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2200);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (simulationStep >= STEPS.length - 1) {
        setSimulationStep(0);
      }
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (simulationStep < STEPS.length - 1) {
      setSimulationStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (simulationStep > 0) {
      setSimulationStep((s) => s - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSimulationStep(0);
  };

  const current = STEPS[simulationStep];

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
            onClick={togglePlay}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isPlaying
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                : "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800 hover:bg-sky-100"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Auto-Play</span>
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="px-2 py-1 text-xs font-mono text-[var(--gh-text-muted)] hover:text-[var(--gh-text)] hover:bg-[var(--gh-bg)] rounded border border-[var(--gh-border)] flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset to Step 1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {/* Scenario description banner with guaranteed contrast */}
        <div className="p-3 rounded-md bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] mb-4 text-xs">
          <strong className="text-[var(--gh-text)] font-semibold">Test Scenario: </strong>
          <span className="text-[var(--gh-text-muted)] font-mono">
            Agent A (1 Note = 0.01 USDC) executes concurrent spend against Provider B & Provider C.
          </span>
        </div>

        {/* Step progress tracker */}
        <div className="mb-5">
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            {STEPS.map((st, idx) => {
              const isCurrent = idx === simulationStep;
              const isPast = idx < simulationStep;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setIsPlaying(false);
                    setSimulationStep(idx);
                  }}
                  className={`p-2 rounded text-left transition-all cursor-pointer border text-xs ${
                    isCurrent
                      ? "bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-800 dark:text-sky-200 font-semibold shadow-2xs"
                      : isPast
                      ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                      : "bg-[var(--gh-bg)] border-[var(--gh-border)] text-[var(--gh-text-muted)] hover:border-neutral-400"
                  }`}
                >
                  <div className="text-[10px] font-mono uppercase mb-0.5 flex items-center justify-between">
                    <span>Step {idx + 1}</span>
                    {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {isCurrent && <Clock className="w-3 h-3 text-sky-600" />}
                  </div>
                  <div className="hidden sm:block text-[11px] truncate">{st.time}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stage Details */}
        <div className="p-4 rounded-lg border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
            <h4 className="text-sm sm:text-base font-semibold text-[var(--gh-text)]">
              {current.title}
            </h4>
            <span className="self-start sm:self-auto text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--gh-bg)] border border-[var(--gh-border)] text-sky-700 dark:text-sky-300">
              {current.time}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--gh-text)] leading-relaxed opacity-90">
            {current.details}
          </p>

          {/* Callout box with consistent theme border and text */}
          <div className="mt-3 p-3 rounded-md border border-amber-300 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <span className="leading-relaxed">{current.callout}</span>
          </div>
        </div>

        {/* Real-time State Monitors: Provider B vs Provider C vs Arc NanoPool */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Provider B */}
          <div className="p-3 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)]">
            <div className="text-[10px] font-mono uppercase tracking-wide text-[var(--gh-text-muted)] mb-1.5 font-semibold">
              PROVIDER B (Recipient 0x0638)
            </div>
            <div className="flex items-center gap-2 font-semibold text-xs">
              {current.statusB.type === "verified" || current.statusB.type === "completed" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : current.statusB.type === "inflight" ? (
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                </span>
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 shrink-0" />
              )}
              <span
                className={
                  current.statusB.type === "verified" || current.statusB.type === "completed"
                    ? "text-emerald-700 dark:text-emerald-400"
                    : current.statusB.type === "inflight"
                    ? "text-sky-700 dark:text-sky-300"
                    : "text-[var(--gh-text)]"
                }
              >
                {current.statusB.label}
              </span>
            </div>
          </div>

          {/* Provider C */}
          <div className="p-3 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)]">
            <div className="text-[10px] font-mono uppercase tracking-wide text-[var(--gh-text-muted)] mb-1.5 font-semibold">
              PROVIDER C (Recipient 0x918f)
            </div>
            <div className="flex items-center gap-2 font-semibold text-xs">
              {current.statusC.type === "reverted" ? (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : current.statusC.type === "inflight" ? (
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
              ) : current.statusC.type === "processing" ? (
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-400 shrink-0" />
              )}
              <span
                className={
                  current.statusC.type === "reverted"
                    ? "text-rose-700 dark:text-rose-400 font-bold"
                    : current.statusC.type === "inflight"
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-[var(--gh-text)]"
                }
              >
                {current.statusC.label}
              </span>
            </div>
          </div>

          {/* On-Chain Arc NanoPool */}
          <div className="p-3 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)]">
            <div className="text-[10px] font-mono uppercase tracking-wide text-[var(--gh-text-muted)] mb-1.5 font-semibold">
              ARC TESTNET POOL STATE
            </div>
            <div className="text-xs font-mono font-medium text-[var(--gh-text)]" title={current.poolState}>
              {current.poolState}
            </div>
          </div>
        </div>

        {/* Simulator controls */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-[var(--gh-border)]">
          <div className="flex items-center gap-2">
            <button
              disabled={simulationStep === 0}
              onClick={handlePrev}
              className="px-2.5 py-1 text-xs rounded border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] text-[var(--gh-text)] hover:bg-[var(--gh-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Prev</span>
            </button>
            <span className="text-xs font-mono text-[var(--gh-text-muted)]">
              {simulationStep + 1} / {STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {simulationStep === STEPS.length - 1 ? (
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replay from Start</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
