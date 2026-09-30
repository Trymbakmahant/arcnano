"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import CornerTicks from "@/component/UI/CornerTicks";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  Zap,
  AlertTriangle,
  Cpu,
} from "lucide-react";

interface WirePath {
  id: string;
  d: string;
  activeAtStep: number[];
  color?: string;
  label?: string;
}

export default function SchematicFlowGraph() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showArcscanInspector, setShowArcscanInspector] = useState<boolean>(true);
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM_INIT] Autonomous Agent Schematic Pipeline initialized.",
    "[CIRCUIT] Ephemeral keygen and Poseidon Merkle circuit ready.",
    "[ARCSCAN] Monitoring Arc L1 Mempool and Explorer traces...",
  ]);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Total steps in the execution sequence: 1 through 7
  const TOTAL_STEPS = 7;
  const STEP_DURATION = 2600; // ms per step at 1x speed

  const stepDescriptions: Record<
    number,
    { title: string; subtitle: string; log: string; badge: string }
  > = useMemo(
    () => ({
      1: {
        title: "Agent A (Buyer) Initiates API Request",
        subtitle:
          "Off-chain HTTP handshake: Agent requests LLM inference quote ($0.0012 USDC)",
        log: "[AGENT_A] HTTP POST /v1/chat/completions (Prompt: 512 tokens). Negotiating 0.0012 USDC fee.",
        badge: "01 // Request Handshake",
      },
      2: {
        title: "Privacy Routing: Intercepting Public Mempool Leak",
        subtitle:
          "Standard crypto broadcast leaks msg.sender to Arcscan. ArcNano reroutes off-chain.",
        log: "[ROUTER] Bypassing public mempool. Activating ERC-5564 Dual-Key Stealth Address Generator.",
        badge: "02 // Privacy Router",
      },
      3: {
        title: "Halo2 Client ZK-SNARK Prover (In-Memory WASM)",
        subtitle:
          "Proves balance solvency in Poseidon Merkle tree + computes unspendable nullifier",
        log: "[HALO2_WASM] Synthesized circuit in 74.2ms. Proof (π) & Nullifier (0x9b4f...) ready.",
        badge: "03 // ZK Prover",
      },
      4: {
        title: "Privacy Pools ASP Non-Sanctioned Set Check",
        subtitle:
          "Proves deposit funds are clean without pooling into a dirty mixer (No Tornado trap)",
        log: "[ASP_ENGINE] Merkle non-membership verified against OFAC blacklist root (16.8ms). Status: CLEAN.",
        badge: "04 // ASP Compliance",
      },
      5: {
        title: "P2P Off-Chain Handshake & Sub-8ms Verification",
        subtitle:
          "API Gateway verifies ZK receipt in <8ms off-chain and streams inference tokens",
        log: "[GATEWAY_P2P] Receipt verified in 7.2ms. HTTP 200 OK: Streaming 4,096 tokens to Agent A.",
        badge: "05 // P2P Fulfillment",
      },
      6: {
        title: "Receiver Enqueues Receipt into Off-Chain Batch Buffer",
        subtitle:
          "Provider accumulates 100 micro-receipts off-chain before settling on Arc L1",
        log: "[BATCH_QUEUE] Enqueued receipt #94/100. Calldata reduction: 99.1%.",
        badge: "06 // Batch Buffer",
      },
      7: {
        title: "Circle Gas Station Sponsored Settlement on Arc L1",
        subtitle:
          "1 aggregated transaction lands on Arcscan. All agent prompts, wallets, & IPs remain HIDDEN.",
        log: "[ARCSCAN_BLOCK] Tx 0x7a8c... settled on Arc L1. From: Circle Gas Station | Value: 0 USDC Gas.",
        badge: "07 // L1 Settlement",
      },
    }),
    []
  );

  const appendStepLog = useCallback(
    (stepNum: number) => {
      const info = stepDescriptions[stepNum];
      if (info) {
        const time = new Date().toISOString().substring(11, 23);
        setLogs((prev) => [...prev.slice(-14), `[${time}] ${info.log}`]);
      }
    },
    [stepDescriptions]
  );

  // Auto-scroll terminal log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => {
      const next = prev >= TOTAL_STEPS ? 1 : prev + 1;
      appendStepLog(next);
      return next;
    });
  }, [TOTAL_STEPS, appendStepLog]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => {
      const next = prev <= 1 ? TOTAL_STEPS : prev - 1;
      appendStepLog(next);
      return next;
    });
  }, [TOTAL_STEPS, appendStepLog]);

  const handleSelectStep = useCallback(
    (stepNum: number) => {
      setCurrentStep(stepNum);
      appendStepLog(stepNum);
    },
    [appendStepLog]
  );

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setLogs([
      "[SYSTEM_RESET] Resetting schematic execution pipeline.",
      `[STEP_01] ${stepDescriptions[1].log}`,
    ]);
  }, [stepDescriptions]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const nextState = !prev;
      if (nextState) {
        // Trigger on-chain transaction if anti-spam cooldown allows
        if (typeof window !== "undefined") {
          const lastTimeStr = localStorage.getItem("arcnano_last_tx_time");
          const elapsed = lastTimeStr ? Date.now() - parseInt(lastTimeStr, 10) : 999999;
          const todayKey = `arcnano_tx_day_${new Date().toISOString().substring(0, 10)}`;
          const todayCount = parseInt(localStorage.getItem(todayKey) || "0", 10);

          if (elapsed >= 30000 && todayCount < 5) {
            localStorage.setItem("arcnano_last_tx_time", Date.now().toString());
            localStorage.setItem(todayKey, (todayCount + 1).toString());
            const time = new Date().toISOString().substring(11, 23);
            setLogs((l) => [
              ...l.slice(-14),
              `[${time}] [ARCSCAN] Broadcasting real live Arc Testnet transaction (0.01 USDC note)...`,
            ]);

            fetch("/api/agent-demo/execute", { method: "POST" })
              .then((res) => res.json())
              .then((data) => {
                if (data && data.success) {
                  const t = new Date().toISOString().substring(11, 23);
                  setLogs((l) => [
                    ...l.slice(-14),
                    `[${t}] [ARCSCAN_CONFIRMED] Real L1 Tx Settled: ${data.spendTx.hash.substring(0, 14)}... Block #${data.spendTx.block}`,
                  ]);
                }
              })
              .catch(() => {});
          } else if (elapsed < 30000) {
            const waitSec = Math.ceil((30000 - elapsed) / 1000);
            const time = new Date().toISOString().substring(11, 23);
            setLogs((l) => [
              ...l.slice(-14),
              `[${time}] [ANTI_SPAM] Blockchain cooldown active (${waitSec}s remaining). Circuit schematic playing locally.`,
            ]);
          }
        }
      }
      return nextState;
    });
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " ") {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key >= "1" && e.key <= "7") {
        handleSelectStep(parseInt(e.key, 10));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, handleSelectStep, handleTogglePlay]);

  // Check URL query param ?step= on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get("step");
      if (stepParam) {
        const parsed = parseInt(stepParam, 10);
        if (parsed >= 1 && parsed <= TOTAL_STEPS) {
          setCurrentStep(parsed);
          appendStepLog(parsed);
        }
      }
    }
  }, [TOTAL_STEPS, appendStepLog]);

  // Animation Timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      setCurrentStep((prev) => {
        const next = prev >= TOTAL_STEPS ? 1 : prev + 1;
        appendStepLog(next);
        return next;
      });
    }, STEP_DURATION / playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, playbackSpeed, TOTAL_STEPS, appendStepLog]);

  // Pixel-perfect circuit wire layout defined on 1180 x 500 coordinate grid
  const wires: WirePath[] = useMemo(
    () => [
      // Wire 1: Agent Alpha -> API Handshake (HTTP /v1/infer)
      { id: "w1", d: "M 100 144 L 100 200", activeAtStep: [1] },

      // Wire 2: API Handshake -> Privacy Diamond (Router)
      { id: "w2", d: "M 155 225 L 220 225", activeAtStep: [1, 2] },

      // Wire 3: Privacy Diamond Red Branch -> Traditional Mempool Leak Trap
      {
        id: "w3_leak",
        d: "M 255 190 L 255 145 Q 255 135 265 135 L 330 135",
        activeAtStep: [2],
        color: "#EF4444",
      },

      // Wire 4: Privacy Diamond Green Branch -> ERC-5564 Stealth Address
      { id: "w4", d: "M 290 225 L 350 225", activeAtStep: [2, 3], color: "#10B981" },

      // Wire 5: ERC-5564 -> Halo2 WASM Prover (Branches up)
      {
        id: "w5_up",
        d: "M 420 225 L 445 225 Q 455 225 455 215 L 455 170 Q 455 160 465 160 L 490 160",
        activeAtStep: [3],
      },

      // Wire 6: ERC-5564 -> ASP Validator (Branches down)
      {
        id: "w6_down",
        d: "M 420 225 L 445 225 Q 455 225 455 235 L 455 280 Q 455 290 465 290 L 490 290",
        activeAtStep: [3, 4],
      },

      // Wire 7: Halo2 Prover -> Verify Diamond (Joins from top)
      {
        id: "w7_join_up",
        d: "M 595 160 L 620 160 Q 630 160 630 170 L 630 215 Q 630 225 640 225 L 660 225",
        activeAtStep: [4],
      },

      // Wire 8: ASP Engine -> Verify Diamond (Joins from bottom)
      {
        id: "w8_join_down",
        d: "M 595 290 L 620 290 Q 630 290 630 280 L 630 235 Q 630 225 640 225 L 660 225",
        activeAtStep: [4],
      },

      // Wire 9: Verify Diamond -> Receiver Gateway
      { id: "w9", d: "M 730 225 L 770 225", activeAtStep: [4, 5], color: "#10B981" },

      // Wire 10a: Receiver Gateway -> Instant Token Stream Banner (Feedback loop start)
      {
        id: "w10a_stream",
        d: "M 828 200 L 828 80 Q 828 70 818 70 L 560 70",
        activeAtStep: [5],
        color: "#10B981",
      },

      // Wire 10b: Instant Token Stream Banner -> Agent Alpha (Feedback loop completion)
      {
        id: "w10b_stream",
        d: "M 340 70 L 110 70 Q 100 70 100 80 L 100 100",
        activeAtStep: [5],
        color: "#10B981",
      },

      // Wire 11: Receiver Gateway -> Batch Queue Buffer (Downwards)
      { id: "w11_batch", d: "M 828 250 L 828 330", activeAtStep: [5, 6] },

      // Wire 12: Batch Buffer -> Arc L1 Settlement Diamond (Crosses Public Barrier at X=920)
      { id: "w12_settle", d: "M 875 355 L 940 355", activeAtStep: [6, 7] },

      // Wire 13: Arc L1 Settlement Diamond -> Circle Gas Station (Up branch)
      {
        id: "w13_gas",
        d: "M 975 320 L 975 234 Q 975 224 985 224 L 1020 224",
        activeAtStep: [7],
        color: "#F59E0B",
      },

      // Wire 14: Arc L1 Settlement Diamond -> Arcscan Finalized Block (Down branch)
      {
        id: "w14_arc",
        d: "M 975 390 L 975 406 Q 975 416 985 416 L 1020 416",
        activeAtStep: [7],
        color: "#10B981",
      },
    ],
    []
  );

  return (
    <div className="w-full bg-[#FAFAFC] text-neutral-900 border border-neutral-200/90 rounded-none shadow-sm relative overflow-hidden flex flex-col justify-between">
      {/* Precision CAD Corner Ticks */}
      <CornerTicks color="text-neutral-400" activeColor="text-amber-500" />

      {/* TOP HEADER CONTROLS & BREADCRUMB */}
      <div className="border-b border-neutral-200/90 bg-white/95 px-5 py-4 relative z-20 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-neutral-500">
              <Activity className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span>03 // Architectural Flow Graph</span>
              <span className="text-neutral-300">•</span>
              <span className="text-amber-600 font-semibold">
                Off-Chain P2P vs. Public Arcscan
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-normal text-neutral-950 tracking-tight mt-0.5">
              {stepDescriptions[currentStep]?.title ||
                "Autonomous Agent Commerce Lifecycle"}
            </h2>
            <p className="text-xs text-neutral-600 font-normal mt-0.5">
              {stepDescriptions[currentStep]?.subtitle}
            </p>
          </div>

          {/* Playback & View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-md border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
              title="Previous step (←)"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={handleTogglePlay}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer ${
                isPlaying
                  ? "bg-neutral-950 text-white hover:bg-neutral-800"
                  : "bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold shadow-xs ring-2 ring-amber-300/60"
              }`}
              title="Toggle simulation (Space)"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-neutral-950" />
                  <span>Start Simulation</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-md border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
              title="Reset sequence"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-md border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
              title="Next step (→)"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Speed Toggle */}
            <button
              onClick={() =>
                setPlaybackSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 0.75 : 1))
              }
              className="px-2 py-1 rounded-md border border-neutral-200 text-[11px] font-mono text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Toggle playback speed"
            >
              {playbackSpeed}x
            </button>

            {/* Toggle Arcscan Comparison Card */}
            <button
              onClick={() => setShowArcscanInspector((v) => !v)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-mono border transition-all cursor-pointer ${
                showArcscanInspector
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-900"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {showArcscanInspector ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span>Arcscan Compare</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Arcscan Compare</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 7-STEP PIPELINE PROGRESS TRACKER */}
        <div className="pt-2 border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto pb-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((stepNum) => {
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            const stepInfo = stepDescriptions[stepNum];

            return (
              <button
                key={`step-pill-${stepNum}`}
                onClick={() => handleSelectStep(stepNum)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-neutral-950 font-bold shadow-xs ring-2 ring-amber-400/40"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/70"
                    : "bg-neutral-100 text-neutral-500 border border-neutral-200/70 hover:bg-neutral-200/60 hover:text-neutral-800"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive
                      ? "bg-neutral-950 animate-pulse"
                      : isCompleted
                      ? "bg-emerald-600"
                      : "bg-neutral-400"
                  }`}
                />
                <span>0{stepNum}</span>
                <span className="opacity-90 font-normal hidden sm:inline">
                  {stepInfo?.badge.split("// ")[1]}
                </span>
                {stepNum < TOTAL_STEPS && (
                  <ArrowRight className="w-2.5 h-2.5 opacity-40 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SCHEMATIC CIRCUIT GRAPH CANVAS */}
      <div className="relative w-full overflow-x-auto p-4 sm:p-6 select-none bg-[#FAFAFC]">
        {/* Visual Partition Markers: Off-Chain P2P Zone vs Public Arcscan Zone */}
        <div className="min-w-[1180px] h-[500px] relative">
          {/* Subtle Grid Dot Matrix */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.4]"
            style={{
              backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Zone 1: Off-Chain Shielded Layer Banner */}
          <div className="absolute top-3 left-4 text-[10px] font-mono tracking-widest uppercase text-emerald-600 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{"// PRIVATE OFF-CHAIN P2P LAYER (ZERO ON-CHAIN FOOTPRINT)"}</span>
          </div>

          {/* Vertical Boundary: Public Arcscan Barrier */}
          <div className="absolute top-0 bottom-0 left-[920px] w-[1px] border-r border-dashed border-neutral-300 z-10" />

          {/* Clean Barrier Pill (Positioned cleanly below header to prevent text overlap) */}
          <div className="absolute top-9 left-[928px] bg-neutral-900 border border-neutral-800 text-neutral-100 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest whitespace-nowrap shadow-xs z-20">
            L1 Boundary
          </div>

          {/* Zone 2: Public Arcscan Banner */}
          <div className="absolute top-3 right-4 text-[10px] font-mono tracking-widest uppercase text-sky-600 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span>{"// ARCSCAN (PUBLIC L1 LEDGER)"}</span>
          </div>

          {/* SVG INTERCONNECTING CIRCUIT WIRES */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
            viewBox="0 0 1180 500"
            fill="none"
          >
            <defs>
              {/* Particle Glow Filter */}
              <filter id="wireParticleGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. Base Inactive Architectural Wires */}
            {wires.map((w) => (
              <path
                key={`base-${w.id}`}
                d={w.d}
                stroke={w.color ? `${w.color}35` : "#CBD5E1"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* 2. Active Glowing Wires with Smooth Laser Motion */}
            {wires.map((w) => {
              const isActive = w.activeAtStep.includes(currentStep);
              if (!isActive) return null;
              const wireColor = w.color || "#F59E0B";

              return (
                <g key={`active-${w.id}`}>
                  {/* Glowing ambient drop-shadow pipe */}
                  <path
                    d={w.d}
                    stroke={wireColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-60"
                    style={{
                      filter: `drop-shadow(0 0 8px ${wireColor})`,
                    }}
                  />

                  {/* Flowing animated dash stroke (Framer Motion strokeDashoffset) */}
                  <motion.path
                    d={w.d}
                    stroke={wireColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="10 10"
                    animate={{
                      strokeDashoffset: [20, 0],
                    }}
                    transition={{
                      duration: 0.75,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* Crisp white photon core for high-tech energy look */}
                  <motion.path
                    d={w.d}
                    stroke="#FFFFFF"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6 14"
                    animate={{
                      strokeDashoffset: [20, 0],
                    }}
                    transition={{
                      duration: 0.75,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />

                  {/* Native SVG Traveling Photon Packet along wire path */}
                  <circle r="4.5" fill={wireColor} opacity="0.85" filter="url(#wireParticleGlow)">
                    <animateMotion
                      path={w.d}
                      dur={`${1.6 / playbackSpeed}s`}
                      repeatCount="indefinite"
                      rotate="auto"
                    />
                  </circle>
                  <circle r="2.2" fill="#FFFFFF">
                    <animateMotion
                      path={w.d}
                      dur={`${1.6 / playbackSpeed}s`}
                      repeatCount="indefinite"
                      rotate="auto"
                    />
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* ======================================================== */}
          {/* SCHEMATIC CIRCUIT NODES WITH VERIFIED MATHEMATICAL PINS  */}
          {/* ======================================================== */}

          {/* 1. AGENT A (BUYER) NODE */}
          {/* Position: (45, 100), Width: 110, Height: 44. Center X: 100 */}
          <div
            onClick={() => handleSelectStep(1)}
            className={`absolute top-[100px] left-[45px] w-[110px] h-[44px] rounded-none border cursor-pointer transition-all duration-200 z-20 flex items-center justify-center p-1.5 shadow-sm group ${
              currentStep === 1 || currentStep === 5
                ? "bg-[#0284C7] border-[#0369A1] text-white shadow-md ring-2 ring-sky-300 scale-102"
                : "bg-[#0284C7]/90 hover:bg-[#0284C7] border-[#0369A1] text-white"
            }`}
          >
            {/* Red Input Pin Top (Stream return at 100, 100) */}
            <span
              className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 5 ? "bg-emerald-400 animate-ping" : "bg-rose-500"
              }`}
            />
            {/* Green Output Pin Bottom (at 100, 144) */}
            <span
              className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 1 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />

            <div className="text-center font-mono">
              <div className="text-[10px] font-bold tracking-tight">AGENT_ALPHA</div>
              <div className="text-[8px] opacity-85 uppercase">[Buyer Agent]</div>
            </div>
          </div>

          {/* 2. API REQUEST & QUOTE NEGOTIATOR */}
          {/* Position: (45, 200), Width: 110, Height: 50. Center X: 100, Center Y: 225 */}
          <div
            onClick={() => handleSelectStep(1)}
            className={`absolute top-[200px] left-[45px] w-[110px] h-[50px] rounded-none border cursor-pointer transition-all duration-200 z-20 flex flex-col justify-center items-center p-1 shadow-sm ${
              currentStep === 1
                ? "bg-neutral-950 border-neutral-900 text-white ring-2 ring-amber-400 scale-102"
                : "bg-neutral-900 hover:bg-neutral-800 border-neutral-950 text-white"
            }`}
          >
            {/* Top Pin (at 100, 200) */}
            <span
              className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 1 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            {/* Right Pin (at 155, 225) */}
            <span
              className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 1 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />

            <span className="text-[9px] font-mono text-neutral-300 font-semibold uppercase">
              HTTP /v1/infer
            </span>
            <span className="text-[8px] font-mono text-amber-400">Quote: 0.0012 USDC</span>
          </div>

          {/* 3. DECISION DIAMOND 1: PRIVACY ROUTING / INTERCEPT */}
          {/* Position: center at (255, 225). Container: top 190, left 220, 70x70 */}
          <div
            onClick={() => handleSelectStep(2)}
            className="absolute top-[190px] left-[220px] w-[70px] h-[70px] z-20 cursor-pointer group flex items-center justify-center"
          >
            {/* 45-degree Rotated Diamond Box */}
            <div
              className={`w-[50px] h-[50px] rotate-45 transition-all duration-200 border flex items-center justify-center shadow-md ${
                currentStep === 2
                  ? "bg-[#00B4D8] border-[#0284C7] ring-4 ring-cyan-200 shadow-cyan-500/30 scale-105"
                  : "bg-[#00B4D8] hover:bg-[#0284C7] border-[#0284C7]"
              }`}
            />

            {/* Diamond Text in Center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-center">
              <span className="text-[8px] font-mono font-bold text-white uppercase leading-none drop-shadow-xs">
                ROUTER
              </span>
            </div>

            {/* Left Input Pin (from HTTP /v1/infer at 220, 225) */}
            <span
              className={`absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 2 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            {/* Red Output Pin Top (Mempool Leak at 255, 190) */}
            <span
              className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 2 ? "bg-rose-400 animate-ping" : "bg-rose-500"
              }`}
              title="Red Path: Public Mempool Leak"
            />
            {/* Green Output Pin Right (ArcNano Shielded at 290, 225) */}
            <span
              className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 2 ? "bg-emerald-400 animate-ping" : "bg-emerald-500"
              }`}
              title="Green Path: ArcNano Shielded"
            />
          </div>

          {/* 4. RED WARNING BLOCK: TRADITIONAL PUBLIC MEMPOOL LEAK */}
          {/* Position: (330, 115), Width: 140, Height: 40. Center Y: 135 */}
          <div
            className={`absolute top-[115px] left-[330px] w-[140px] h-[40px] rounded-none border border-rose-300 p-1.5 flex flex-col justify-center bg-rose-50/95 text-rose-900 transition-all ${
              currentStep === 2
                ? "ring-2 ring-rose-500 shadow-sm opacity-100 scale-102"
                : "opacity-75"
            }`}
          >
            {/* Left Pin (at 330, 135) */}
            <span
              className={`absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 2 ? "bg-rose-500 animate-ping" : "bg-rose-400"
              }`}
            />
            <div className="text-[9px] font-mono font-bold uppercase text-rose-700 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
              <span className="truncate">LEAK TRAP (PUBLIC)</span>
            </div>
            <div className="text-[8px] font-mono text-rose-600 truncate">
              msg.sender &amp; IP leaked
            </div>
          </div>

          {/* 5. BLACK HORIZONTAL BUS: EPHEMERAL STEALTH KEYGEN */}
          {/* Position: (350, 203), Width: 70, Height: 44. Center Y: 225 */}
          <div
            onClick={() => handleSelectStep(2)}
            className={`absolute top-[203px] left-[350px] w-[70px] h-[44px] rounded-none border cursor-pointer transition-all duration-200 z-20 flex flex-col items-center justify-center p-1 shadow-sm ${
              currentStep === 2 || currentStep === 3
                ? "bg-neutral-950 border-neutral-800 text-white ring-2 ring-amber-400 scale-102"
                : "bg-neutral-900 hover:bg-neutral-950 border-neutral-800 text-white"
            }`}
          >
            {/* Left Pin (at 350, 225) */}
            <span
              className={`absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 2 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            {/* Right Pin (at 420, 225) */}
            <span
              className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 3 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            <span className="text-[8px] font-mono font-bold tracking-tight">ERC-5564</span>
            <span className="text-[7px] font-mono text-neutral-400">Stealth DH</span>
          </div>

          {/* 6. HALO2 WASM PROVER STACK (TOP LATTICE) */}
          {/* Position: (490, 135), Width: 105, Height: 50. Center Y: 160 */}
          <div
            onClick={() => handleSelectStep(3)}
            className={`absolute top-[135px] left-[490px] w-[105px] h-[50px] rounded-none border cursor-pointer transition-all duration-200 z-20 flex flex-col justify-center p-1.5 shadow-sm ${
              currentStep === 3
                ? "bg-[#0284C7] border-[#0369A1] text-white ring-2 ring-sky-300 shadow-md scale-102"
                : "bg-[#0284C7]/90 hover:bg-[#0284C7] border-[#0369A1] text-white"
            }`}
          >
            {/* Left Pin (at 490, 160) */}
            <span
              className={`absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 3 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            {/* Right Pin (at 595, 160) */}
            <span
              className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 4 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            <div className="text-[9px] font-mono font-bold flex items-center gap-1">
              <Cpu className="w-3 h-3 text-sky-200" />
              <span>HALO2_PROVER</span>
            </div>
            <div className="text-[8px] font-mono opacity-85">Poseidon WASM</div>
            <div className="text-[7px] font-mono text-amber-200">Time: ~74 ms</div>
          </div>

          {/* 7. ASP COMPLIANCE CHECK STACK (BOTTOM LATTICE) */}
          {/* Position: (490, 265), Width: 105, Height: 50. Center Y: 290 */}
          <div
            onClick={() => handleSelectStep(4)}
            className={`absolute top-[265px] left-[490px] w-[105px] h-[50px] rounded-none border cursor-pointer transition-all duration-200 z-20 flex flex-col justify-center p-1.5 shadow-sm ${
              currentStep === 4
                ? "bg-[#0369A1] border-[#075985] text-white ring-2 ring-sky-300 shadow-md scale-102"
                : "bg-[#0369A1]/90 hover:bg-[#0369A1] border-[#075985] text-white"
            }`}
          >
            {/* Left Pin (at 490, 290) */}
            <span
              className={`absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 3 || currentStep === 4
                  ? "bg-amber-400 animate-ping"
                  : "bg-emerald-500"
              }`}
            />
            {/* Right Pin (at 595, 290) */}
            <span
              className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 4 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            <div className="text-[9px] font-mono font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              <span>ASP_VALIDATOR</span>
            </div>
            <div className="text-[8px] font-mono opacity-85">Clean Set Root</div>
            <div className="text-[7px] font-mono text-emerald-300 font-semibold">
              Non-OFAC: PASS
            </div>
          </div>

          {/* 8. DECISION DIAMOND 2: PROOF & COMPLIANCE VERIFIER */}
          {/* Position: center at (695, 225). Container: top 190, left 660, 70x70 */}
          <div
            onClick={() => handleSelectStep(4)}
            className="absolute top-[190px] left-[660px] w-[70px] h-[70px] z-20 cursor-pointer group flex items-center justify-center"
          >
            <div
              className={`w-[50px] h-[50px] rotate-45 transition-all duration-200 border flex items-center justify-center shadow-md ${
                currentStep === 4
                  ? "bg-[#00B4D8] border-[#0284C7] ring-4 ring-cyan-200 shadow-cyan-500/30 scale-105"
                  : "bg-[#00B4D8] hover:bg-[#0284C7] border-[#0284C7]"
              }`}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-center">
              <span className="text-[8px] font-mono font-bold text-white uppercase leading-none drop-shadow-xs">
                VERIFY
              </span>
            </div>

            {/* Input Pin Left (at 660, 225) */}
            <span
              className={`absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 4 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            {/* Output Pin Right (at 730, 225) */}
            <span
              className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 5 ? "bg-emerald-400 animate-ping" : "bg-emerald-500"
              }`}
            />
          </div>

          {/* 9. RECEIVER GATEWAY (SELLER) NODE */}
          {/* Position: (770, 200), Width: 115, Height: 50. Center X: 828, Center Y: 225 */}
          <div
            onClick={() => handleSelectStep(5)}
            className={`absolute top-[200px] left-[770px] w-[115px] h-[50px] rounded-none border cursor-pointer transition-all duration-200 z-20 flex flex-col justify-center p-1.5 shadow-sm ${
              currentStep === 5
                ? "bg-neutral-950 border-neutral-900 text-white ring-2 ring-emerald-400 shadow-md scale-102"
                : "bg-neutral-900 hover:bg-neutral-800 border-neutral-950 text-white"
            }`}
          >
            {/* Left Pin (Input from Verify at 770, 225) */}
            <span
              className={`absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 5 ? "bg-emerald-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            {/* Top Pin (Instant Stream Feedback output at 828, 200) */}
            <span
              className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 5 ? "bg-emerald-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            {/* Bottom Pin (Batch Queue output at 828, 250) */}
            <span
              className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 6 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />

            <div className="text-[9px] font-mono font-bold text-white">RECEIVER_GATEWAY</div>
            <div className="text-[8px] font-mono text-neutral-300">P2P Verification</div>
            <div className="text-[7px] font-mono text-emerald-400 font-semibold">
              Latency: &lt; 8.0 ms
            </div>
          </div>

          {/* 10. EMERALD GREEN TERMINAL: FULFILLMENT STREAM BANNER */}
          {/* Position: (340, 48), Width: 220, Height: 44. Center Y: 70 */}
          <div
            className={`absolute top-[48px] left-[340px] w-[220px] h-[44px] rounded-none border border-emerald-500/80 bg-emerald-600 text-white p-2 flex flex-col justify-center z-20 shadow-md transition-all ${
              currentStep === 5
                ? "ring-4 ring-emerald-200/80 shadow-emerald-600/30 scale-102"
                : "opacity-85"
            }`}
          >
            {/* Right Pin (Input from Gateway at 560, 70) */}
            <span
              className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-emerald-700 shadow-xs ${
                currentStep === 5 ? "bg-white animate-ping" : "bg-emerald-200"
              }`}
            />
            {/* Left Pin (Output streaming to Agent A at 340, 70) */}
            <span
              className={`absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-emerald-700 shadow-xs ${
                currentStep === 5 ? "bg-white animate-ping" : "bg-emerald-200"
              }`}
            />

            <div className="text-[9px] font-mono font-bold flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-300" />
                <span>INFERENCE STREAM OPEN</span>
              </span>
              <span className="text-[7px] font-mono px-1 py-0.5 bg-white/20 rounded font-semibold">
                HTTP 200 OK
              </span>
            </div>
            <div className="text-[8px] font-mono opacity-90 truncate">
              Agent A receives 4,096 tokens (Zero Block Wait)
            </div>
          </div>

          {/* 11. BATCH BUFFER QUEUE */}
          {/* Position: (785, 330), Width: 90, Height: 50. Center X: 830, Center Y: 355 */}
          <div
            onClick={() => handleSelectStep(6)}
            className={`absolute top-[330px] left-[785px] w-[90px] h-[50px] rounded-none border cursor-pointer transition-all duration-200 z-20 flex flex-col justify-center items-center p-1 shadow-sm ${
              currentStep === 6
                ? "bg-[#0284C7] border-[#0369A1] text-white ring-2 ring-sky-300 shadow-md scale-102"
                : "bg-[#0284C7]/90 hover:bg-[#0284C7] border-[#0369A1] text-white"
            }`}
          >
            {/* Top Pin (Input from Gateway at 830, 330) */}
            <span
              className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 6 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            {/* Right Pin (Output crossing barrier at 875, 355) */}
            <span
              className={`absolute top-1/2 -right-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 6 || currentStep === 7
                  ? "bg-amber-400 animate-ping"
                  : "bg-emerald-500"
              }`}
            />

            <span className="text-[8px] font-mono font-bold uppercase tracking-tight">
              BATCH_QUEUE
            </span>
            <span className="text-[7px] font-mono text-amber-200 font-semibold">
              Buffer: 94 / 100
            </span>
          </div>

          {/* 12. DECISION DIAMOND 3: ARC L1 SETTLEMENT ENGINE */}
          {/* Position: center at (975, 355). Container: top 320, left 940, 70x70 */}
          <div
            onClick={() => handleSelectStep(7)}
            className="absolute top-[320px] left-[940px] w-[70px] h-[70px] z-20 cursor-pointer group flex items-center justify-center"
          >
            <div
              className={`w-[50px] h-[50px] rotate-45 transition-all duration-200 border flex items-center justify-center shadow-md ${
                currentStep === 7
                  ? "bg-[#00B4D8] border-[#0284C7] ring-4 ring-cyan-200 shadow-cyan-500/30 scale-105"
                  : "bg-[#00B4D8] hover:bg-[#0284C7] border-[#0284C7]"
              }`}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-center">
              <span className="text-[8px] font-mono font-bold text-white uppercase leading-none drop-shadow-xs">
                ARC_L1
              </span>
            </div>

            {/* Input Left (from Batch Queue at 940, 355) */}
            <span
              className={`absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 7 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            {/* Output Top (to Gas Station at 975, 320) */}
            <span
              className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 7 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            {/* Output Bottom (to Arcscan Block at 975, 390) */}
            <span
              className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 7 ? "bg-emerald-400 animate-ping" : "bg-emerald-500"
              }`}
            />
          </div>

          {/* 13. CIRCLE GAS STATION NODE */}
          {/* Position: (1020, 200), Width: 125, Height: 48. Center Y: 224 */}
          <div
            onClick={() => handleSelectStep(7)}
            className={`absolute top-[200px] left-[1020px] w-[125px] h-[48px] rounded-none border cursor-pointer transition-all duration-200 z-20 flex flex-col justify-center p-1.5 shadow-sm ${
              currentStep === 7
                ? "bg-neutral-950 border-neutral-800 text-white ring-2 ring-emerald-400 shadow-md scale-102"
                : "bg-neutral-900 hover:bg-neutral-950 border-neutral-800 text-white"
            }`}
          >
            {/* Left Pin (Input from Arc L1 at 1020, 224) */}
            <span
              className={`absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
                currentStep === 7 ? "bg-amber-400 animate-ping" : "bg-emerald-500"
              }`}
            />
            <div className="text-[9px] font-mono font-bold text-white flex items-center justify-between">
              <span>GAS_STATION</span>
              <span className="text-[7px] text-amber-400 font-normal">Paymaster</span>
            </div>
            <div className="text-[8px] font-mono text-neutral-400">Circle ERC-4337</div>
            <div className="text-[7px] font-mono text-emerald-400 font-semibold">
              Agent Gas: $0.00 (Sponsored)
            </div>
          </div>

          {/* 14. ARCSCAN ON-CHAIN SETTLEMENT BLOCK */}
          {/* Position: (1020, 390), Width: 125, Height: 52. Center Y: 416 */}
          <div
            onClick={() => handleSelectStep(7)}
            className={`absolute top-[390px] left-[1020px] w-[125px] h-[52px] rounded-none border border-emerald-600 bg-emerald-600 text-white p-2 flex flex-col justify-center z-20 shadow-md transition-all ${
              currentStep === 7
                ? "ring-4 ring-emerald-200/80 shadow-emerald-600/30 scale-102"
                : "opacity-90"
            }`}
          >
            {/* Left Pin (Input from Arc L1 at 1020, 416) */}
            <span
              className={`absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-emerald-700 shadow-xs ${
                currentStep === 7 ? "bg-white animate-ping" : "bg-emerald-200"
              }`}
            />
            <div className="text-[9px] font-mono font-bold flex items-center justify-between">
              <span>ARCSCAN BLOCK</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
            </div>
            <div className="text-[8px] font-mono opacity-90 truncate">settleBatch(100)</div>
            <div className="text-[7px] font-mono text-emerald-100 font-semibold">
              &lt; 500ms Arc Finality
            </div>
          </div>
        </div>
      </div>

      {/* ARCSCAN COMPARISON DRAWER / INSPECTOR (What Arcscan sees vs What happened off-chain) */}
      {showArcscanInspector && (
        <div className="border-t border-neutral-200/90 bg-white p-4 sm:p-5 relative z-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Panel Left: What Actually Happened Between Agents (Off-Chain P2P) */}
            <div className="border border-neutral-200 rounded-none p-4 bg-neutral-50/60 relative group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Off-Chain P2P Reality (Private)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Zero Surveillance
                </span>
              </div>

              <div className="font-mono text-xs space-y-1.5 text-neutral-700">
                <div className="flex justify-between border-b border-neutral-200/70 pb-1">
                  <span className="text-neutral-500">Spender Agent:</span>
                  <span className="font-medium text-neutral-900">
                    Agent-Alpha (Portfolio Optimizer)
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-200/70 pb-1">
                  <span className="text-neutral-500">Target Provider:</span>
                  <span className="font-medium text-neutral-900">
                    Agent-Omega (LLM Inference Gateway)
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-200/70 pb-1">
                  <span className="text-neutral-500">Prompt &amp; API Call:</span>
                  <span className="font-medium text-neutral-900 truncate max-w-[260px]">
                    &quot;Analyze trading pair risk matrix...&quot;
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-200/70 pb-1">
                  <span className="text-neutral-500">Payment Value:</span>
                  <span className="font-medium text-neutral-900">
                    $0.0012 USDC (Sub-Cent)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Verification Latency:</span>
                  <span className="font-semibold text-emerald-600">
                    7.2 milliseconds (WASM)
                  </span>
                </div>
              </div>
            </div>

            {/* Panel Right: What Arcscan (Public Block Explorer) Sees */}
            <div className="border border-neutral-200 rounded-none p-4 bg-white relative group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-sky-700 font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-600" />
                  <span>Arcscan Public Explorer View</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                  Batched Calldata
                </span>
              </div>

              <div className="font-mono text-xs space-y-1.5 text-neutral-700">
                <div className="flex justify-between border-b border-neutral-200/70 pb-1">
                  <span className="text-neutral-500">Transaction Sender:</span>
                  <span className="font-medium text-neutral-900">
                    Circle Gas Station (Paymaster)
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-200/70 pb-1">
                  <span className="text-neutral-500">Agent A Identity:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    [REDACTED / OFF-CHAIN]
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-200/70 pb-1">
                  <span className="text-neutral-500">Prompts &amp; Tool Calls:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    [REDACTED / 0 BYTES]
                  </span>
                </div>
                <div className="flex justify-between border-b border-neutral-200/70 pb-1">
                  <span className="text-neutral-500">On-Chain Method:</span>
                  <span className="font-medium text-neutral-900 truncate max-w-[260px]">
                    settleBatch(bytes32 root, proof)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Agent Gas Paid:</span>
                  <span className="font-semibold text-emerald-600">
                    $0.000 USDC (Sponsored)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM TELEMETRY LOG */}
      <div className="border-t border-neutral-200/90 bg-neutral-900 text-white px-5 py-3 relative z-20">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
            <Terminal className="w-3.5 h-3.5 text-amber-500" />
            <span>Cryptographic Execution Trace Log</span>
            <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="text-[10px] font-mono text-neutral-500 hidden sm:block">
            Keyboard: [← / →] Steps • [Space] Play/Pause • [1-7] Direct
          </div>
        </div>

        <div
          ref={logContainerRef}
          className="h-16 overflow-y-auto font-mono text-xs space-y-1 terminal-scroll pr-2 text-neutral-400"
        >
          {logs.map((line, i) => (
            <div
              key={i}
              className={`transition-colors ${
                i === logs.length - 1
                  ? "text-amber-400 font-medium"
                  : i === logs.length - 2
                  ? "text-neutral-200"
                  : "text-neutral-500"
              }`}
            >
              <span className="text-neutral-600 mr-2">&gt;</span>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
