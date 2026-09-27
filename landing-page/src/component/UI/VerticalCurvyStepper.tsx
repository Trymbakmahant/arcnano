"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  Layers,
  Fuel,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Terminal,
} from "lucide-react";

export interface SolutionStep {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  problemCountered: string;
  tag: string;
  metric: {
    value: string;
    label: string;
  };
  summary: string;
  details: string[];
  flowSteps: {
    label: string;
    sublabel: string;
    type: "agent" | "gateway" | "chain" | "math";
  }[];
}

const SOLUTIONS_DATA: SolutionStep[] = [
  {
    id: "solution-01",
    stepNumber: "01",
    title: "Receiver-Batched Settlement",
    subtitle: "Eliminating the Payer's msg.sender",
    problemCountered: "Solves Trap 01: msg.sender Surveillance",
    tag: "Architecture Pillar 01",
    metric: {
      value: "0%",
      label: "Traceability",
    },
    summary:
      "In ArcNano, the spending agent never broadcasts an on-chain transaction. Instead, it generates a Groth16 proof locally in memory and embeds it in the X402 request header.",
    details: [
      "The client proves knowledge of a secret deposit note commitment without disclosing its nullifier or secret key.",
      "The API receiver collects valid proofs and aggregates them into a single batchSpend() transaction broadcasted on Arc.",
    ],
    flowSteps: [
      { label: "Agent", sublabel: "Local ZK Proof", type: "agent" },
      { label: "X402 Header", sublabel: "X-PAYMENT", type: "gateway" },
      { label: "Receiver", sublabel: "Batch Aggregate", type: "gateway" },
      { label: "Arc Chain", sublabel: "batchSpend()", type: "chain" },
    ],
  },
  {
    id: "solution-02",
    stepNumber: "02",
    title: "Arc Circle Gas Station Sponsorship",
    subtitle: "$0 Gas & Zero Funding Paper Trails",
    problemCountered: "Solves Trap 02: Gas Funding Linkage",
    tag: "Architecture Pillar 02",
    metric: {
      value: "$0",
      label: "Native Gas",
    },
    summary:
      "Normally, funding burner wallets with native gas tokens links them back to master accounts. ArcNano eliminates native gas through Circle Gas Station paymasters.",
    details: [
      "Settlement transactions on Arc are submitted via the Circle Gas Station (ERC-4337 Paymaster).",
      "No native gas tokens are ever transferred to agent wallets, permanently closing the centralized exchange graph leak.",
    ],
    flowSteps: [
      { label: "Agent Wallet", sublabel: "Zero Gas Needed", type: "agent" },
      { label: "Circle Paymaster", sublabel: "Gas Sponsor", type: "gateway" },
      { label: "Relayer", sublabel: "USDC Settle", type: "chain" },
      { label: "Arc Finality", sublabel: "No Graph Leak", type: "chain" },
    ],
  },
  {
    id: "solution-03",
    stepNumber: "03",
    title: "Association Set Provider Proofs",
    subtitle: "Compliance by Mathematics (Privacy Pools)",
    problemCountered: "Solves Trap 03: Blacklist Sanctions",
    tag: "Architecture Pillar 03",
    metric: {
      value: "100%",
      label: "Math-Clean",
    },
    summary:
      "Inspired by the Privacy Pools standard, ArcNano uses dual Merkle membership circuits so legitimate agents prove clean origin without revealing their individual deposit leaf.",
    details: [
      "Enforces dual constraints: inclusion in the deposit Merkle tree, plus non-inclusion in the ASP sanctioned root.",
      "Enterprise APIs verify compliance mathematically before fulfilling requests, remaining 100% compliant.",
    ],
    flowSteps: [
      { label: "Circom Circuit", sublabel: "Dual Merkle", type: "math" },
      { label: "Deposit Tree", sublabel: "ZK Member", type: "math" },
      { label: "ASP Root", sublabel: "Non-Sanctioned", type: "math" },
      { label: "API Gateway", sublabel: "Verified Clean", type: "gateway" },
    ],
  },
  {
    id: "solution-04",
    stepNumber: "04",
    title: "Two-Stage X402 Verification",
    subtitle: "Sub-10ms Delivery + Periodic Batching",
    problemCountered: "Solves Trap 04: Block Mining Latency",
    tag: "Architecture Pillar 04",
    metric: {
      value: "< 10ms",
      label: "Off-Chain Latency",
    },
    summary:
      "We decouple high-frequency API responses from on-chain block mining times through an in-memory two-stage verification architecture.",
    details: [
      "Stage 1: Gateway executes in-memory Groth16 pairing check and Redis nullifier cache in < 10ms for instant responses.",
      "Stage 2: Gateway queues spent nullifiers and settles 50–100 transactions together in periodic batches on Arc.",
    ],
    flowSteps: [
      { label: "Agent Query", sublabel: "X402 Request", type: "agent" },
      { label: "Stage 1 (<10ms)", sublabel: "Pairing Check", type: "gateway" },
      { label: "Instant 200 OK", sublabel: "Unblocked Stream", type: "agent" },
      { label: "Stage 2 (Async)", sublabel: "Batch Settle", type: "chain" },
    ],
  },
];

export default function VerticalCurvyStepper() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Dynamic Layout Measurements
  const [containerWidth, setContainerWidth] = useState<number>(1000);
  const [svgHeight, setSvgHeight] = useState<number>(1200);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [nodePositions, setNodePositions] = useState<
    { x: number; y: number; isLeft: boolean }[]
  >([
    { x: 456, y: 60, isLeft: true },
    { x: 544, y: 360, isLeft: false },
    { x: 456, y: 660, isLeft: true },
    { x: 544, y: 960, isLeft: false },
  ]);
  const [curvyPath, setCurvyPath] = useState<string>("");
  const [branchPaths, setBranchPaths] = useState<string[]>([]);

  // Framer Motion Scroll Progress for Drawing the Curvy Line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 75%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001,
  });

  // Calculate Node Positions and S-Curve Bezier Path
  useEffect(() => {
    const updateMeasurements = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const width = containerRect.width;
      const height = containerRect.height;
      const isMobile = window.innerWidth < 768;

      setIsMobileView(isMobile);
      setContainerWidth(width);
      setSvgHeight(height);

      const cx = width / 2;
      const positions: { x: number; y: number; isLeft: boolean }[] = [];
      const branches: string[] = [];

      stepRefs.current.forEach((el, idx) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Align node level with the top header of each card
        const relativeY = rect.top - containerRect.top + 38;
        const isLeft = idx % 2 === 0;

        let nx: number;
        if (isMobile) {
          nx = 24;
          const cardLeft = rect.left - containerRect.left;
          branches.push(`M 24 ${relativeY} L ${cardLeft} ${relativeY}`);
        } else {
          // Node is placed in the center gap (Left 1, Right 2, Left 3, Right 4)
          nx = isLeft ? cx - 44 : cx + 44;
          if (isLeft) {
            const cardRight = rect.right - containerRect.left;
            branches.push(`M ${cardRight} ${relativeY} L ${nx} ${relativeY}`);
          } else {
            const cardLeft = rect.left - containerRect.left;
            branches.push(`M ${nx} ${relativeY} L ${cardLeft} ${relativeY}`);
          }
        }

        positions.push({ x: nx, y: Math.max(30, relativeY), isLeft });
      });

      setNodePositions(positions);

      if (positions.length > 1) {
        if (isMobile) {
          let d = `M 24 0 L 24 ${positions[0].y}`;
          for (let i = 0; i < positions.length - 1; i++) {
            const p1 = positions[i];
            const p2 = positions[i + 1];
            const dy = p2.y - p1.y;
            d += ` C 36 ${p1.y + dy * 0.35}, 12 ${p2.y - dy * 0.35}, 24 ${p2.y}`;
          }
          const last = positions[positions.length - 1];
          d += ` C 24 ${last.y + 40}, 24 ${last.y + 70}, 24 ${last.y + 90}`;
          setCurvyPath(d);
        } else {
          // Serpentine Curve: Left (1) -> Right (2) -> Left (3) -> Right (4)
          const p0 = positions[0];
          let d = `M ${cx} 0 C ${cx} ${p0.y * 0.4}, ${p0.x} ${p0.y * 0.6}, ${p0.x} ${p0.y}`;

          for (let i = 0; i < positions.length - 1; i++) {
            const pA = positions[i];
            const pB = positions[i + 1];
            const dy = pB.y - pA.y;

            // Natural S-curve crossing the center line smoothly
            const c1x = pA.x + (pB.x - pA.x) * 0.15;
            const c1y = pA.y + dy * 0.5;
            const c2x = pB.x - (pB.x - pA.x) * 0.15;
            const c2y = pB.y - dy * 0.5;

            d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${pB.x} ${pB.y}`;
          }

          const last = positions[positions.length - 1];
          d += ` C ${last.x} ${last.y + 40}, ${cx} ${last.y + 80}, ${cx} ${last.y + 110}`;
          setCurvyPath(d);
        }
        setBranchPaths(branches);
      }
    };

    updateMeasurements();
    window.addEventListener("resize", updateMeasurements);
    const observer = new ResizeObserver(updateMeasurements);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", updateMeasurements);
      observer.disconnect();
    };
  }, []);

  const getStepIcon = (idx: number, isSelected = false) => {
    const iconClass = `w-4 h-4 ${
      isSelected
        ? "text-amber-600"
        : "text-neutral-500 group-hover:text-neutral-800 transition-colors"
    }`;
    switch (idx) {
      case 0:
        return <Layers className={iconClass} />;
      case 1:
        return <Fuel className={iconClass} />;
      case 2:
        return <ShieldCheck className={iconClass} />;
      case 3:
        return <Zap className={iconClass} />;
      default:
        return <CheckCircle2 className={iconClass} />;
    }
  };

  const getFlowTypeBadge = (type: SolutionStep["flowSteps"][0]["type"]) => {
    switch (type) {
      case "agent":
        return "bg-sky-50 text-sky-700 border-sky-200/90";
      case "gateway":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/90";
      case "chain":
        return "bg-neutral-100 text-neutral-700 border-neutral-200/90";
      case "math":
        return "bg-amber-50 text-amber-800 border-amber-200/90";
      default:
        return "bg-neutral-100 text-neutral-600 border-neutral-200";
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-6xl mx-auto">
      {/* Dynamic Curvy Stepper SVG Track */}
      <div className="absolute inset-0 pointer-events-none z-10 w-full h-full">
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${containerWidth} ${svgHeight}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Architectural Slate and Amber Gradient */}
            <linearGradient id="stepperPathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="35%" stopColor="#D97706" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>

            {/* Traveling Subtle Energy Pulse */}
            <linearGradient id="stepperLaserBeam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background Guide Track (Dashed Architectural Line) */}
          {curvyPath && (
            <path
              d={curvyPath}
              stroke="rgba(0, 0, 0, 0.08)"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
          )}

          {/* Horizontal Branch Connectors into each Card */}
          {branchPaths.map((bp, idx) => (
            <path
              key={`branch-${idx}`}
              d={bp}
              stroke="rgba(0, 0, 0, 0.12)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              strokeLinecap="round"
            />
          ))}

          {/* Animated Scroll-Progress Active Line */}
          {curvyPath && (
            <motion.path
              d={curvyPath}
              stroke="url(#stepperPathGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                pathLength: smoothProgress,
              }}
            />
          )}

          {/* Continuous Traveling Energy Pulse */}
          {curvyPath && (
            <motion.path
              d={curvyPath}
              stroke="url(#stepperLaserBeam)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="36 280"
              animate={{
                strokeDashoffset: [0, -620],
              }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </svg>

        {/* Dynamic Nodes Overlay along the Curvy Path */}
        {nodePositions.map((pos, idx) => {
          const isSelected = activeStep === idx;
          return (
            <div
              key={`node-${idx}`}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
              }}
              onClick={() => setActiveStep(idx)}
            >
              {/* Subtle Pulsing Ring */}
              <motion.div
                className={`absolute -inset-2 rounded-2xl border transition-colors ${
                  isSelected ? "border-amber-500/40" : "border-neutral-300/40"
                }`}
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.5, 0.1, 0.5],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  delay: idx * 0.7,
                  ease: "easeInOut",
                }}
              />

              {/* Stepper Node Orb */}
              <div
                className={`relative w-10 h-10 md:w-11 md:h-11 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 shadow-sm border ${
                  isSelected
                    ? "bg-white border-amber-500 text-neutral-950 shadow-md shadow-amber-500/10 ring-4 ring-amber-500/15 scale-105"
                    : "bg-white border-neutral-200/90 text-neutral-600 hover:border-neutral-300 hover:scale-105"
                }`}
              >
                <div
                  className={`text-[10px] md:text-[11px] font-mono font-semibold tracking-tight ${
                    isSelected ? "text-amber-600" : "text-neutral-500"
                  }`}
                >
                  {SOLUTIONS_DATA[idx].stepNumber}
                </div>
                <div className="scale-75 transform -mt-0.5">
                  {getStepIcon(idx, isSelected)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alternating Steps Content: Left (1) -> Right (2) -> Left (3) -> Right (4) */}
      <div className="space-y-10 sm:space-y-12 md:space-y-14 relative z-0">
        {SOLUTIONS_DATA.map((step, idx) => {
          const isSelected = activeStep === idx;
          const isLeft = idx % 2 === 0;

          return (
            <div
              key={step.id}
              ref={(el) => {
                stepRefs.current[idx] = el;
              }}
              className={`w-full md:w-[calc(50%-60px)] ${
                isLeft ? "md:mr-auto" : "md:ml-auto"
              } ${isMobileView ? "pl-14" : ""}`}
            >
              <motion.div
                initial={{ opacity: 0, x: isLeft ? -20 : 20, y: 15 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                  delay: idx * 0.08,
                }}
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300 relative border ${
                  isSelected
                    ? "bg-white border-amber-400/80 shadow-lg shadow-neutral-900/5 ring-1 ring-amber-300/50"
                    : "bg-white/95 border-neutral-200/90 hover:border-neutral-300 shadow-xs hover:shadow-md"
                }`}
              >
                {/* Subtle Warm Accent Top Rim Highlight */}
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent pointer-events-none" />

                {/* Compact Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-800 border border-amber-500/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>Solution {step.stepNumber}</span>
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                        {step.tag}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-neutral-950 pt-1">
                      {step.title}
                    </h3>
                    <div className="text-xs font-mono text-neutral-500 font-medium">
                      {step.subtitle}
                    </div>
                  </div>

                  {/* Impact Metric Chip */}
                  <div className="shrink-0 text-right bg-neutral-50 border border-neutral-200/80 px-3 py-1.5 rounded-xl">
                    <div className="text-lg sm:text-xl font-bold font-mono text-neutral-950 tracking-tight leading-tight">
                      {step.metric.value}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider font-mono">
                      {step.metric.label}
                    </div>
                  </div>
                </div>

                {/* Problem Countered Badge */}
                <div className="text-[11px] font-mono text-amber-800 bg-amber-50/70 border border-amber-200/60 rounded-lg px-2.5 py-1 mt-3 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{step.problemCountered}</span>
                </div>

                {/* Summary & Core Mechanism */}
                <p className="text-sm text-neutral-700 font-normal leading-relaxed mt-3">
                  {step.summary}
                </p>

                {/* Concise Technical Highlights */}
                <div className="mt-3 space-y-1.5 text-xs sm:text-[13px] text-neutral-600 leading-relaxed">
                  {step.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 mt-1.5 shrink-0" />
                      <p>{detail}</p>
                    </div>
                  ))}
                </div>

                {/* Compact Pipeline Breadcrumb Strip */}
                <div className="mt-4 pt-3.5 border-t border-neutral-100">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3 h-3 text-neutral-500" />
                      Execution Flow
                    </span>
                    <span className="text-[9px] text-amber-700 font-mono bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded">
                      Autonomous Pipeline
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {step.flowSteps.map((flow, fIdx) => (
                      <div
                        key={fIdx}
                        className="relative p-2 rounded-xl bg-neutral-50/80 border border-neutral-200/80 hover:bg-white hover:border-neutral-300 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <span
                            className={`inline-block px-1 py-0.2 rounded text-[8px] font-mono uppercase tracking-wide border mb-1 ${getFlowTypeBadge(
                              flow.type
                            )}`}
                          >
                            {flow.type}
                          </span>
                          <div className="text-[11px] font-semibold text-neutral-900 leading-tight truncate">
                            {flow.label}
                          </div>
                        </div>
                        <div className="text-[9px] font-mono text-neutral-500 mt-1 leading-tight truncate">
                          {flow.sublabel}
                        </div>
                        {fIdx < step.flowSteps.length - 1 && (
                          <div className="hidden sm:block absolute -right-1.5 top-1/2 -translate-y-1/2 z-10">
                            <ArrowRight className="w-2.5 h-2.5 text-neutral-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
