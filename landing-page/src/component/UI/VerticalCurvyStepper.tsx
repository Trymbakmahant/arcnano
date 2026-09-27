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
    problemCountered: "Solves Trap 01: msg.sender On-Chain Surveillance",
    tag: "Architecture Pillar 01",
    metric: {
      value: "0%",
      label: "Payer Traceability",
    },
    summary:
      "In ArcNano, the spending agent never broadcasts an on-chain transaction. Instead, it generates a Groth16 proof locally in memory and embeds it in the HTTP 402 request header.",
    details: [
      "The client proves knowledge of a secret deposit note commitment without disclosing its nullifier or secret key to the wire.",
      "The API receiver collects valid proofs from multiple agents and aggregates them into a single batchSpend() transaction broadcasted on Arc.",
      "Because the receiver is the transaction signer and msg.sender, the payer's wallet address never touches the Arc mempool or blockchain ledger.",
    ],
    flowSteps: [
      {
        label: "Agent Client",
        sublabel: "Local Groth16 Proof",
        type: "agent",
      },
      {
        label: "HTTP 402 Header",
        sublabel: "X-PAYMENT Payload",
        type: "gateway",
      },
      {
        label: "Receiver Aggregator",
        sublabel: "Proof Collection",
        type: "gateway",
      },
      {
        label: "Arc Blockchain",
        sublabel: "batchSpend() by Receiver",
        type: "chain",
      },
    ],
  },
  {
    id: "solution-02",
    stepNumber: "02",
    title: "Arc Circle Gas Station Sponsorship",
    subtitle: "$0 Gas & Zero Funding Paper Trails",
    problemCountered: "Solves Trap 02: Burner Wallet Gas Funding Linkage",
    tag: "Architecture Pillar 02",
    metric: {
      value: "$0",
      label: "Agent Native Gas Required",
    },
    summary:
      "Normally, funding burner wallets with native gas tokens links them back to a master exchange account. ArcNano eliminates native gas through Circle Gas Station paymasters.",
    details: [
      "Settlement transactions on Arc are submitted via the Circle Gas Station (ERC-4337 Paymaster).",
      "Settlement gas is fully sponsored or deducted from off-chain USDC fee allowances. Agents only manage confidential cryptographic commitments.",
      "No native gas tokens are ever transferred to agent wallets, permanently closing the centralized exchange funding graph leak.",
    ],
    flowSteps: [
      {
        label: "Agent Wallet",
        sublabel: "Zero Gas Needed",
        type: "agent",
      },
      {
        label: "Circle Paymaster",
        sublabel: "Gas Station Sponsor",
        type: "gateway",
      },
      {
        label: "Sponsored Relayer",
        sublabel: "USDC Batch Settle",
        type: "chain",
      },
      {
        label: "Arc Finality",
        sublabel: "No Funding Graph",
        type: "chain",
      },
    ],
  },
  {
    id: "solution-03",
    stepNumber: "03",
    title: "Association Set Provider (ASP) Proofs",
    subtitle: "Compliance by Mathematics (Privacy Pools)",
    problemCountered: "Solves Trap 03: Blacklist Sanctions & Mixer Taint",
    tag: "Architecture Pillar 03",
    metric: {
      value: "100%",
      label: "Math-Guaranteed Clean Funds",
    },
    summary:
      "Inspired by the Privacy Pools standard, ArcNano uses dual Merkle membership circuits so legitimate agents prove clean origin without revealing their individual deposit leaf.",
    details: [
      "Every Circom spend circuit enforces dual constraints: inclusion in the verified deposit Merkle tree, plus non-inclusion in the ASP sanctioned root.",
      "The agent mathematically proves: 'My deposit is authentic AND is not part of any OFAC/illicit cluster.'",
      "Enterprise APIs verify compliance with mathematical certainty before fulfilling requests, remaining 100% compliant with global regulations.",
    ],
    flowSteps: [
      {
        label: "Circom Circuit",
        sublabel: "Dual Merkle Constraints",
        type: "math",
      },
      {
        label: "Deposit Tree",
        sublabel: "ZK Membership Proof",
        type: "math",
      },
      {
        label: "ASP Sanction Root",
        sublabel: "ZK Non-Membership",
        type: "math",
      },
      {
        label: "Enterprise Gateway",
        sublabel: "100% Clean Verified",
        type: "gateway",
      },
    ],
  },
  {
    id: "solution-04",
    stepNumber: "04",
    title: "Two-Stage HTTP 402 Verification",
    subtitle: "Sub-10ms Delivery + Periodic Batching",
    problemCountered: "Solves Trap 04: Block Mining Latency & Gas Waste",
    tag: "Architecture Pillar 04",
    metric: {
      value: "< 10ms",
      label: "Off-Chain Gateway Latency",
    },
    summary:
      "We decouple high-frequency API responses from on-chain block mining times through an in-memory two-stage verification architecture.",
    details: [
      "Stage 1 (Off-Chain Verification): The gateway executes an in-memory Groth16 pairing check and consults a Redis nullifier cache in under 10ms, instantly serving the LLM response.",
      "Stage 2 (On-Chain Settlement): The gateway queues spent nullifiers and settles 50–100 transactions together in periodic batches on Arc.",
      "This reduces per-query settlement overhead to fractions of a cent while enabling high-throughput autonomous agent loops.",
    ],
    flowSteps: [
      {
        label: "Agent Query",
        sublabel: "HTTP 402 Request",
        type: "agent",
      },
      {
        label: "Stage 1 (<10ms)",
        sublabel: "In-Memory Pairing Check",
        type: "gateway",
      },
      {
        label: "Instant 200 OK",
        sublabel: "Unblocked LLM Stream",
        type: "agent",
      },
      {
        label: "Stage 2 (Async)",
        sublabel: "Batch Arc Settlement",
        type: "chain",
      },
    ],
  },
];

export default function VerticalCurvyStepper() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Measurements for SVG Curvy Path
  const [trackWidth, setTrackWidth] = useState<number>(88);
  const [svgHeight, setSvgHeight] = useState<number>(1200);
  const [nodePositions, setNodePositions] = useState<{ x: number; y: number }[]>([
    { x: 44, y: 50 },
    { x: 44, y: 360 },
    { x: 44, y: 670 },
    { x: 44, y: 980 },
  ]);
  const [curvyPath, setCurvyPath] = useState<string>(
    "M 44 0 L 44 50 C 72 158.5, 24.4 251.5, 44 360 C 24.4 468.5, 72 561.5, 44 670 C 72 778.5, 24.4 871.5, 44 980 C 44 1020, 44 1060, 44 1090"
  );
  const [branchPaths, setBranchPaths] = useState<string[]>([
    "M 44 50 L 100 50",
    "M 44 360 L 100 360",
    "M 44 670 L 100 670",
    "M 44 980 L 100 980",
  ]);

  // Framer Motion Scroll Progress for Drawing the Curvy Line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 75%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 45,
    restDelta: 0.001,
  });

  // Calculate Node Positions and Curvy Bezier Path dynamically
  useEffect(() => {
    const updateMeasurements = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      const currentTrackWidth = isMobile ? 56 : 88;
      setTrackWidth(currentTrackWidth);
      setSvgHeight(containerRect.height);

      const cx = currentTrackWidth / 2;
      const positions: { x: number; y: number }[] = [];

      stepRefs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Center of the step orb relative to container top
        const relativeY = rect.top - containerRect.top + 36; // align with top header of card
        positions.push({ x: cx, y: Math.max(36, relativeY) });
      });

      setNodePositions(positions);

      if (positions.length > 1) {
        let d = `M ${cx} 0 L ${cx} ${positions[0].y}`;
        const branches: string[] = [];

        for (let i = 0; i < positions.length - 1; i++) {
          const p1 = positions[i];
          const p2 = positions[i + 1];
          const dy = p2.y - p1.y;

          // Serpentine S-curve with alternating wave amplitudes
          const curveAmp = isMobile ? 18 : 28;
          const direction = i % 2 === 0 ? 1 : -1;
          const c1x = cx + curveAmp * direction;
          const c1y = p1.y + dy * 0.35;
          const c2x = cx - curveAmp * direction * 0.7;
          const c2y = p2.y - dy * 0.35;

          d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${cx} ${p2.y}`;

          // Horizontal branch connector to card
          branches.push(`M ${cx} ${p1.y} L ${currentTrackWidth + 12} ${p1.y}`);
        }

        // Branch for last node
        const lastNode = positions[positions.length - 1];
        branches.push(`M ${cx} ${lastNode.y} L ${currentTrackWidth + 12} ${lastNode.y}`);

        // Trail out smoothly at bottom
        d += ` C ${cx} ${lastNode.y + 40}, ${cx} ${lastNode.y + 80}, ${cx} ${lastNode.y + 110}`;

        setCurvyPath(d);
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

  const getStepIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Layers className="w-5 h-5 text-[var(--primary)]" />;
      case 1:
        return <Fuel className="w-5 h-5 text-[var(--primary)]" />;
      case 2:
        return <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />;
      case 3:
        return <Zap className="w-5 h-5 text-[var(--primary)]" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />;
    }
  };

  const getFlowTypeBadge = (type: SolutionStep["flowSteps"][0]["type"]) => {
    switch (type) {
      case "agent":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "gateway":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "chain":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "math":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-white/10 text-neutral-300 border-white/15";
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Dynamic Curvy Stepper SVG Track */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none z-10"
        style={{
          left: 0,
          width: `${trackWidth + 14}px`,
        }}
      >
        <svg
          className="w-full h-full overflow-visible"
          style={{ height: `${svgHeight}px` }}
          viewBox={`0 0 ${trackWidth + 14} ${svgHeight}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Clean Light Dynamic Gradient */}
            <linearGradient id="stepperNeonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="35%" stopColor="#06B6D4" />
              <stop offset="70%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Traveling Light Pulse Laser */}
            <linearGradient id="stepperLaserBeam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0" />
              <stop offset="50%" stopColor="#0284C7" stopOpacity="1" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Circuit Guide Track (Dashed Blueprint Line) */}
          {curvyPath && (
            <path
              d={curvyPath}
              stroke="rgba(2, 132, 199, 0.18)"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              strokeLinecap="round"
            />
          )}

          {/* Horizontal Branch Connectors into each Card */}
          {branchPaths.map((bp, idx) => (
            <path
              key={`branch-${idx}`}
              d={bp}
              stroke="rgba(2, 132, 199, 0.22)"
              strokeWidth="2"
              strokeDasharray="3 3"
              strokeLinecap="round"
            />
          ))}

          {/* Animated Scroll-Progress Active Neon Line */}
          {curvyPath && (
            <motion.path
              d={curvyPath}
              stroke="url(#stepperNeonGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#neonGlow)"
              style={{
                pathLength: smoothProgress,
              }}
            />
          )}

          {/* Continuous Traveling Energy Pulse Laser Beam */}
          {curvyPath && (
            <motion.path
              d={curvyPath}
              stroke="url(#stepperLaserBeam)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="60 360"
              animate={{
                strokeDashoffset: [0, -840],
              }}
              transition={{
                duration: 4.8,
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
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
              }}
              onClick={() => setActiveStep(idx)}
            >
              {/* Outer Pulsing Radar Ring */}
              <motion.div
                className="absolute -inset-3 rounded-full border border-sky-400/40"
                animate={{
                  scale: [1, 1.35, 1],
                  opacity: [0.6, 0.1, 0.6],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  delay: idx * 0.7,
                  ease: "easeInOut",
                }}
              />

              {/* Glowing Aura on Hover or Selected */}
              <div
                className={`absolute -inset-2 rounded-full transition-opacity duration-300 blur-md ${
                  isSelected ? "bg-sky-500/25 opacity-100" : "bg-sky-500/10 opacity-0 group-hover:opacity-60"
                }`}
              />

              {/* Stepper Node Orb */}
              <div
                className={`relative w-11 h-11 md:w-13 md:h-13 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 shadow-md border backdrop-blur-xl ${
                  isSelected
                    ? "bg-white border-sky-500 text-sky-900 shadow-sky-500/20 ring-2 ring-sky-400/40 scale-105"
                    : "bg-white/95 border-neutral-200/90 text-neutral-700 hover:border-sky-400 hover:scale-105"
                }`}
              >
                <div className="text-[10px] md:text-[11px] font-mono font-bold tracking-tight text-sky-600">
                  {SOLUTIONS_DATA[idx].stepNumber}
                </div>
                <div className="scale-75 md:scale-80 transform -mt-0.5">
                  {getStepIcon(idx)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Steps Content Stack (aligned with the curvy track) */}
      <div
        className="space-y-10 md:space-y-14"
        style={{
          paddingLeft: `${trackWidth + 18}px`,
        }}
      >
        {SOLUTIONS_DATA.map((step, idx) => {
          const isSelected = activeStep === idx;
          return (
            <motion.div
              key={step.id}
              ref={(el) => {
                stepRefs.current[idx] = el;
              }}
              initial={{ opacity: 0, x: 28, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
                delay: idx * 0.1,
              }}
              className={`rounded-[28px] md:rounded-[36px] p-6 sm:p-8 md:p-10 transition-all duration-500 relative border ${
                isSelected
                  ? "bg-white/95 border-sky-500/50 shadow-xl shadow-sky-500/10 ring-1 ring-sky-500/25"
                  : "bg-white/80 border-neutral-200/90 hover:border-sky-500/35 shadow-md hover:shadow-xl"
              } backdrop-blur-2xl`}
            >
              {/* Top Accent Rim Highlight */}
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Header Column */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Step Category Badge & Problem Countered */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-sky-500/10 text-sky-700 border border-sky-500/20">
                      {getStepIcon(idx)}
                      <span>Solution {step.stepNumber}</span>
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                      {step.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-[var(--text-primary)]">
                      {step.title}
                    </h3>
                    <div className="text-sm font-mono text-sky-600 mt-1 font-medium">
                      {step.subtitle}
                    </div>
                    <div className="text-xs font-mono text-[var(--text-muted)] mt-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      <span>{step.problemCountered}</span>
                    </div>
                  </div>

                  {/* Impact Metric Pill */}
                  <div className="inline-flex items-center gap-3 p-3.5 rounded-2xl bg-sky-500/5 border border-sky-500/20">
                    <div className="text-2xl font-bold font-mono text-sky-600 tracking-tight">
                      {step.metric.value}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] font-medium leading-tight">
                      {step.metric.label}
                    </div>
                  </div>
                </div>

                {/* Right Content Column */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Summary Callout */}
                  <p className="text-base sm:text-lg text-[var(--text-primary)] font-normal leading-relaxed">
                    {step.summary}
                  </p>

                  {/* In-Depth Technical Details */}
                  <div className="space-y-2.5 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                    {step.details.map((detail, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-2.5 shrink-0" />
                        <p>{detail}</p>
                      </div>
                    ))}
                  </div>

                  {/* Sleek Interactive / Visual Protocol Flow Diagram */}
                  <div className="pt-2">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        Execution Flow Breakdown
                      </span>
                      <span className="text-[10px] text-emerald-500">Autonomous Pipeline</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {step.flowSteps.map((flow, fIdx) => (
                        <div
                          key={fIdx}
                          className="relative p-3 rounded-2xl bg-neutral-100/80 border border-neutral-200/80 hover:border-emerald-500/40 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wide border mb-1.5 ${getFlowTypeBadge(
                                flow.type
                              )}`}
                            >
                              {flow.type}
                            </span>
                            <div className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                              {flow.label}
                            </div>
                          </div>
                          <div className="text-[11px] font-mono text-[var(--text-muted)] mt-2 leading-tight">
                            {flow.sublabel}
                          </div>
                          {fIdx < step.flowSteps.length - 1 && (
                            <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                              <ArrowRight className="w-3.5 h-3.5 text-emerald-400/60" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
