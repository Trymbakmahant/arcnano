"use client";

import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import CornerTicks from "./CornerTicks";
import {
  Play,
  Pause,
  Zap,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface StepMeta {
  step: number;
  label: string;
  shortTitle: string;
  description: string;
  badge: string;
}

const STEPS_META: StepMeta[] = [
  {
    step: 1,
    label: "01 // Discovery",
    shortTitle: "Discovery",
    description: "Agent A discovers Agent B capabilities via decentralized MCP registry query.",
    badge: "GET /tools/v1",
  },
  {
    step: 2,
    label: "02 // Invoke",
    shortTitle: "Invoke",
    description: "Agent A submits an unauthenticated invocation to Agent B's inference tool endpoint.",
    badge: "POST /execute",
  },
  {
    step: 3,
    label: "03 // HTTP 402",
    shortTitle: "HTTP 402",
    description: "Agent B's middleware rejects with HTTP 402 challenge containing invoice hash and Merkle tree root.",
    badge: "402 Payment Required",
  },
  {
    step: 4,
    label: "04 // ZK Proof",
    shortTitle: "ZK Proof",
    description: "Agent A computes an off-chain Groth16 ZK proof in RAM in ~74ms, generating a cryptographically secure nullifier.",
    badge: "~74ms Off-Chain",
  },
  {
    step: 5,
    label: "05 // Stream",
    shortTitle: "Stream",
    description: "Agent B validates proof in RAM in <8ms and immediately initiates HTTP 200 chunked data streaming.",
    badge: "<8ms In-Memory",
  },
  {
    step: 6,
    label: "06 // Settlement",
    shortTitle: "Settlement",
    description: "Agent B webhooks proof to ArcNano Relayer, which batches 10–50 notes on Arc L1 with $0.00 agent gas.",
    badge: "$0.00 Gas Paymaster",
  },
];

export default function A2APaymentFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Connection Port Refs
  const portA_Ref = useRef<HTMLDivElement>(null);
  const portB_Ref = useRef<HTMLDivElement>(null);
  const portB_RejectRef = useRef<HTMLDivElement>(null);
  const portProver_TopRef = useRef<HTMLDivElement>(null);
  const portProver_OutRef = useRef<HTMLDivElement>(null);
  const portVerifier_InRef = useRef<HTMLDivElement>(null);
  const portVerifier_StreamRef = useRef<HTMLDivElement>(null);
  const portVerifier_BotRef = useRef<HTMLDivElement>(null);
  const portRelayer_InRef = useRef<HTMLDivElement>(null);
  const portRelayer_OutRef = useRef<HTMLDivElement>(null);
  const portL1_InRef = useRef<HTMLDivElement>(null);

  // SVG Path Element Refs
  const path1BaseRef = useRef<SVGPathElement>(null);
  const path1ActiveRef = useRef<SVGPathElement>(null);
  const path2BaseRef = useRef<SVGPathElement>(null);
  const path2ActiveRef = useRef<SVGPathElement>(null);
  const path3BaseRef = useRef<SVGPathElement>(null);
  const path3ActiveRef = useRef<SVGPathElement>(null);
  const path4BaseRef = useRef<SVGPathElement>(null);
  const path4ActiveRef = useRef<SVGPathElement>(null);
  const path5BaseRef = useRef<SVGPathElement>(null);
  const path5ActiveRef = useRef<SVGPathElement>(null);
  const path6BaseRef = useRef<SVGPathElement>(null);
  const path6ActiveRef = useRef<SVGPathElement>(null);

  // Pill Element Refs for Dynamic Centering
  const pill1Ref = useRef<HTMLDivElement>(null);
  const pill2Ref = useRef<HTMLDivElement>(null);
  const pill3Ref = useRef<HTMLDivElement>(null);
  const pill4Ref = useRef<HTMLDivElement>(null);
  const pill5Ref = useRef<HTMLDivElement>(null);
  const pill6aRef = useRef<HTMLDivElement>(null);
  const pill6bRef = useRef<HTMLDivElement>(null);

  // Step state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const currentStepRef = useRef<number>(1);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLDivElement>(null);
  const stepTitleRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);

  // Recalculate and update SVG paths and pill positions directly from DOM anchors
  const updateDynamicCoordinates = useCallback(() => {
    if (!stageRef.current) return;
    const stage = stageRef.current.getBoundingClientRect();
    if (stage.width <= 0 || stage.height <= 0) return;

    const getPt = (el: HTMLElement | null, defX: number, defY: number) => {
      if (!el) return { x: defX, y: defY };
      const r = el.getBoundingClientRect();
      return {
        x: r.left - stage.left + r.width / 2,
        y: r.top - stage.top + r.height / 2,
      };
    };

    const setPill = (el: HTMLElement | null, x: number, y: number) => {
      if (!el) return;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    };

    const setD = (el: SVGPathElement | null, d: string) => {
      if (!el) return;
      el.setAttribute("d", d);
      // Reset stroke length for GSAP
      const len = el.getTotalLength?.() || 1000;
      el.style.strokeDasharray = `${len} ${len}`;
    };

    // Calculate Anchor Points
    const pA = getPt(portA_Ref.current, stage.width * 0.22, stage.height * 0.16);
    const pB = getPt(portB_Ref.current, stage.width * 0.78, stage.height * 0.16);
    const pB_rej = getPt(portB_RejectRef.current, stage.width * 0.78, stage.height * 0.22);
    const pProv_top = getPt(portProver_TopRef.current, stage.width * 0.22, stage.height * 0.38);
    const pProv_out = getPt(portProver_OutRef.current, stage.width * 0.26, stage.height * 0.46);
    const pVerif_in = getPt(portVerifier_InRef.current, stage.width * 0.74, stage.height * 0.46);
    const pVerif_stream = getPt(portVerifier_StreamRef.current, stage.width * 0.74, stage.height * 0.40);
    const pVerif_bot = getPt(portVerifier_BotRef.current, stage.width * 0.82, stage.height * 0.54);
    const pRel_in = getPt(portRelayer_InRef.current, stage.width * 0.48, stage.height * 0.72);
    const pRel_out = getPt(portRelayer_OutRef.current, stage.width * 0.60, stage.height * 0.80);
    const pL1 = getPt(portL1_InRef.current, stage.width * 0.76, stage.height * 0.80);

    // 1. Path 1: Agent A -> Agent B (Discovery & Invoke)
    const d1 = `M ${pA.x} ${pA.y} L ${pB.x} ${pB.y}`;
    setD(path1BaseRef.current, d1);
    setD(path1ActiveRef.current, d1);

    // 2. Path 2: Agent B -> Prover RAM (HTTP 402 Challenge)
    const d2 = `M ${pB_rej.x} ${pB_rej.y} C ${pB_rej.x - 120} ${pB_rej.y + 15}, ${pProv_top.x + 120} ${pProv_top.y - 30}, ${pProv_top.x} ${pProv_top.y}`;
    setD(path2BaseRef.current, d2);
    setD(path2ActiveRef.current, d2);

    // 3. Path 3: Prover -> Verifier (ZK Proof Authorization)
    const d3 = `M ${pProv_out.x} ${pProv_out.y} L ${pVerif_in.x} ${pVerif_in.y}`;
    setD(path3BaseRef.current, d3);
    setD(path3ActiveRef.current, d3);

    // 4. Path 4: Verifier -> Agent A (HTTP 200 Stream)
    const d4 = `M ${pVerif_stream.x} ${pVerif_stream.y} C ${pVerif_stream.x - 120} ${pVerif_stream.y - 15}, ${pA.x + 120} ${pA.y + 30}, ${pA.x} ${pA.y + 12}`;
    setD(path4BaseRef.current, d4);
    setD(path4ActiveRef.current, d4);

    // 5. Path 5: Verifier -> Relayer (Webhook Buffer)
    const d5 = `M ${pVerif_bot.x} ${pVerif_bot.y} C ${pVerif_bot.x} ${pRel_in.y}, ${pRel_in.x + 40} ${pRel_in.y}, ${pRel_in.x} ${pRel_in.y}`;
    setD(path5BaseRef.current, d5);
    setD(path5ActiveRef.current, d5);

    // 6. Path 6: Relayer -> Arc L1 (Batch Settlement)
    const d6 = `M ${pRel_out.x} ${pRel_out.y} L ${pL1.x} ${pL1.y}`;
    setD(path6BaseRef.current, d6);
    setD(path6ActiveRef.current, d6);

    // Position Label Pills directly above or on the generated paths without ANY overlap
    // Step 1: 30% along Line 1
    setPill(pill1Ref.current, pA.x + (pB.x - pA.x) * 0.30, pA.y - 22);
    // Step 2: 70% along Line 1
    setPill(pill2Ref.current, pA.x + (pB.x - pA.x) * 0.70, pA.y - 22);

    // Step 3 (402 Challenge): Positioned on the RIGHT side near Agent B (t ≈ 0.28)
    const pill3X = pB_rej.x - (pB_rej.x - pProv_top.x) * 0.28;
    const pill3Y = pB_rej.y + (pProv_top.y - pB_rej.y) * 0.24 - 14;
    setPill(pill3Ref.current, pill3X, pill3Y);

    // Step 4 (ZK Proof in RAM): Midpoint of Line 3
    setPill(pill4Ref.current, (pProv_out.x + pVerif_in.x) / 2, pProv_out.y - 20);

    // Step 5 (HTTP 200 Stream): Positioned on the LEFT side near Agent A (t ≈ 0.28 from Agent A)
    const pill5X = pA.x + (pVerif_stream.x - pA.x) * 0.28;
    const pill5Y = pA.y + (pVerif_stream.y - pA.y) * 0.30 - 14;
    setPill(pill5Ref.current, pill5X, pill5Y);

    // Step 6a (Webhook): Midpoint of Curve 5
    setPill(pill6aRef.current, (pVerif_bot.x + pRel_in.x) / 2 + 10, (pVerif_bot.y + pRel_in.y) / 2 - 8);
    // Step 6b (Settlement): Midpoint of Line 6
    setPill(pill6bRef.current, (pRel_out.x + pL1.x) / 2, pRel_out.y - 20);
  }, []);

  // Jump to a specific step
  const jumpToStep = useCallback((stepIdx: number) => {
    if (!timelineRef.current) return;
    const progress = (stepIdx - 1) / 5;

    const st = timelineRef.current.scrollTrigger;
    if (st) {
      const targetScroll = st.start + progress * (st.end - st.start);
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  }, []);

  // Toggle Auto-Play preview
  const togglePlay = () => {
    if (!timelineRef.current) return;
    const tl = timelineRef.current;

    if (isPlayingRef.current) {
      tl.pause();
      isPlayingRef.current = false;
      setIsPlaying(false);
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      if (tl.progress() >= 0.98) {
        tl.restart();
      } else {
        tl.play();
      }
    }
  };

  // Measure initial coordinates and attach ResizeObserver
  useLayoutEffect(() => {
    updateDynamicCoordinates();

    const ro = new ResizeObserver(() => {
      updateDynamicCoordinates();
      ScrollTrigger.refresh();
    });

    if (stageRef.current) {
      ro.observe(stageRef.current);
    }

    return () => ro.disconnect();
  }, [updateDynamicCoordinates]);

  // Master GSAP Timeline Setup
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Calculate dynamic lengths of all active SVG paths
      const l1 = path1ActiveRef.current?.getTotalLength() || 600;
      const l2 = path2ActiveRef.current?.getTotalLength() || 600;
      const l3 = path3ActiveRef.current?.getTotalLength() || 600;
      const l4 = path4ActiveRef.current?.getTotalLength() || 600;
      const l5 = path5ActiveRef.current?.getTotalLength() || 600;
      const l6 = path6ActiveRef.current?.getTotalLength() || 600;

      // Setup Initial State: Badges hidden with soft offset
      gsap.set(".step-badge-node", { opacity: 0, y: -6, scale: 0.94, force3D: true });
      gsap.set(path1ActiveRef.current, { strokeDasharray: `${l1} ${l1}`, strokeDashoffset: l1, opacity: 0 });
      gsap.set(path2ActiveRef.current, { strokeDasharray: `${l2} ${l2}`, strokeDashoffset: l2, opacity: 0 });
      gsap.set(path3ActiveRef.current, { strokeDasharray: `${l3} ${l3}`, strokeDashoffset: l3, opacity: 0 });
      gsap.set(path4ActiveRef.current, { strokeDasharray: `${l4} ${l4}`, strokeDashoffset: l4, opacity: 0 });
      gsap.set(path5ActiveRef.current, { strokeDasharray: `${l5} ${l5}`, strokeDashoffset: l5, opacity: 0 });
      gsap.set(path6ActiveRef.current, { strokeDasharray: `${l6} ${l6}`, strokeDashoffset: l6, opacity: 0 });

      gsap.set(".actor-card", {
        borderColor: "rgba(0, 0, 0, 0.08)",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
        force3D: true,
      });
      gsap.set("#active-zk-pulse", { scale: 0, opacity: 0 });

      // Master Timeline driven by Scroll (pinned for 2800px of smooth, slow scrub)
      const tl = gsap.timeline({
        paused: true,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=2800",
          scrub: 1.4,
          pin: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          preventOverlaps: true,
          onUpdate: (self) => {
            const p = self.progress;
            const pct = Math.round(p * 100);

            // Direct DOM update: 0 React re-renders for buttery 120fps progress
            if (progressTrackRef.current) {
              progressTrackRef.current.style.width = `${pct}%`;
            }
            if (progressTextRef.current) {
              progressTextRef.current.textContent = `${pct}% Scrolled`;
            }

            const step = Math.min(6, Math.max(1, Math.ceil(p * 5.99)));
            if (step !== currentStepRef.current) {
              currentStepRef.current = step;
              setCurrentStep(step);
              if (stepTitleRef.current) {
                stepTitleRef.current.textContent = STEPS_META[step - 1]?.shortTitle || "";
              }
            }
            if (p >= 0.99 && isPlayingRef.current) {
              isPlayingRef.current = false;
              setIsPlaying(false);
            }
          },
        },
      });

      timelineRef.current = tl;

      // ================= TIMELINE STEPS =================
      // STEP 1: Discovery Query (Agent A -> Agent B halfway)
      tl.to("#card-agent-a", {
        borderColor: "#D97706",
        backgroundColor: "#FFFBEB",
        boxShadow: "0 10px 25px -5px rgba(217, 119, 6, 0.15)",
        duration: 1.2,
      })
      .to(path1ActiveRef.current, {
        opacity: 1,
        strokeDashoffset: l1 * 0.5,
        duration: 2,
        ease: "power1.inOut",
      }, "<")
      .to(pill1Ref.current, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, "<+=0.3")

      // STEP 2: Tool Invocation (Agent A -> Agent B full connection)
      .to(path1ActiveRef.current, {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 2,
        ease: "power1.inOut",
      })
      .to(pill2Ref.current, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, "<+=0.3")
      .to("#card-agent-b", {
        borderColor: "#D97706",
        backgroundColor: "#FFFBEB",
        boxShadow: "0 10px 25px -5px rgba(217, 119, 6, 0.15)",
        duration: 1.2,
      }, "<+=0.4")

      // STEP 3: HTTP 402 Challenge Rejected (Agent B -> Prover RAM)
      .to("#card-agent-b", {
        borderColor: "#EF4444",
        backgroundColor: "#FEF2F2",
        duration: 1,
      })
      .to(path2ActiveRef.current, {
        opacity: 1,
        strokeDashoffset: 0,
        duration: 2.4,
        ease: "power1.inOut",
      }, "<+=0.2")
      .to(pill3Ref.current, { opacity: 1, y: 0, scale: 1, duration: 1 }, "<+=0.3")
      .to("#card-prover", {
        borderColor: "#8B5CF6",
        backgroundColor: "#F5F3FF",
        boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.15)",
        duration: 1.2,
      }, "<+=0.8")

      // STEP 4: Groth16 Proof Generated in RAM & Transmitted to Verifier RAM
      .to("#active-zk-pulse", {
        scale: 1.6,
        opacity: 0.85,
        repeat: 2,
        yoyo: true,
        duration: 0.6,
      })
      .to(pill4Ref.current, { opacity: 1, y: 0, scale: 1, duration: 1 }, "<+=0.2")
      .to(path3ActiveRef.current, {
        opacity: 1,
        strokeDashoffset: 0,
        duration: 2.2,
        ease: "power1.inOut",
      }, "<+=0.3")
      .to("#card-verifier", {
        borderColor: "#0284C7",
        backgroundColor: "#F0F9FF",
        boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.15)",
        duration: 1.2,
      }, "<+=0.8")

      // STEP 5: Authenticated Payload & <8ms In-Memory Verification -> HTTP 200 Stream Return
      .to(pill5Ref.current, { opacity: 1, y: 0, scale: 1, duration: 1 })
      .to(path4ActiveRef.current, {
        opacity: 1,
        strokeDashoffset: 0,
        duration: 2.4,
        ease: "power1.inOut",
      }, "<")
      .to("#card-agent-a", {
        borderColor: "#10B981",
        backgroundColor: "#ECFDF5",
        boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.15)",
        duration: 1.2,
      }, "<+=0.5")

      // STEP 6: Webhook to Relayer & Batch Settlement on Arc Layer 1
      .to(path5ActiveRef.current, {
        opacity: 1,
        strokeDashoffset: 0,
        duration: 2,
        ease: "power1.inOut",
      })
      .to("#card-relayer", {
        borderColor: "#8B5CF6",
        backgroundColor: "#F5F3FF",
        boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.15)",
        duration: 1.2,
      }, "<+=0.4")
      .to(pill6aRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, "<")
      .to(path6ActiveRef.current, {
        opacity: 1,
        strokeDashoffset: 0,
        duration: 2,
        ease: "power1.inOut",
      }, "<+=0.4")
      .to("#card-layer1", {
        borderColor: "#10B981",
        backgroundColor: "#ECFDF5",
        boxShadow: "0 12px 30px -5px rgba(16, 185, 129, 0.2)",
        duration: 1.2,
      }, "<+=0.5")
      .to(pill6bRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, "<");

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="blueprint"
      className="relative w-full min-h-screen bg-[#FAFAFC] text-slate-900 flex flex-col justify-center py-4 sm:py-6 px-3 sm:px-6 md:px-8 select-none overflow-hidden scroll-mt-6"
    >
      {/* Subtle background ambient warmth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-r from-amber-500/5 via-sky-500/5 to-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Max-Width Wrapper */}
      <div className="max-w-6xl w-full mx-auto relative z-10 flex flex-col my-auto">
        {/* ================= HEADER SECTION ================= */}
        <div className="text-center max-w-3xl mx-auto mb-2 sm:mb-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10.5px] font-mono text-amber-800 mb-1 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>{"03 // Autonomous Execution Protocol"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-normal tracking-tight text-neutral-950 leading-tight">
            The 6-Step Autonomous A2A Payment Flow
          </h2>
          <p className="text-neutral-600 text-xs sm:text-[13px] mt-1 max-w-2xl mx-auto leading-relaxed line-clamp-1 sm:line-clamp-none">
            Scroll smoothly to trace an end-to-end micro-transaction between two autonomous AI agents from HTTP 402 challenge to zero-gas settlement.
          </p>
        </div>

        {/* ================= ARCHITECTURAL BLUEPRINT CONTAINER ================= */}
        <div className="relative bg-white border border-neutral-200/90 shadow-sm rounded-2xl md:rounded-3xl overflow-hidden p-3 sm:p-4">
          {/* Architectural Corner Ticks ┌ ┐ └ ┘ */}
          <CornerTicks size="w-5 h-5 sm:w-6 sm:h-6" color="text-neutral-400" strokeWidth={2} />

          {/* Precision Blueprint Grid Texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.45] bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:24px_24px]"
            aria-hidden="true"
          />

          {/* ================= STEP CONTROLLER & PROGRESS BAR ================= */}
          <div className="relative z-20 mb-2 pb-2 border-b border-neutral-200/80 flex flex-col md:flex-row items-center justify-between gap-2">
            {/* Step Selector Pills */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto w-full md:w-auto pb-0.5 md:pb-0 scrollbar-none">
              {STEPS_META.map((meta) => {
                const isActive = currentStep === meta.step;
                const isPast = currentStep > meta.step;

                return (
                  <button
                    key={meta.step}
                    onClick={() => jumpToStep(meta.step)}
                    className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-md text-[10px] sm:text-[11px] font-mono transition-all whitespace-nowrap cursor-pointer border ${
                      isActive
                        ? "bg-neutral-950 text-white border-neutral-950 shadow-xs scale-[1.02]"
                        : isPast
                        ? "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100/60"
                        : "bg-neutral-50 text-neutral-600 border-neutral-200/80 hover:bg-neutral-100"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive
                          ? "bg-amber-400 animate-ping"
                          : isPast
                          ? "bg-amber-500"
                          : "bg-neutral-400"
                      }`}
                    />
                    <span className="font-semibold">{`Step ${meta.step}:`}</span>
                    <span>{meta.shortTitle}</span>
                  </button>
                );
              })}
            </div>

            {/* Play/Pause & Live Step Status */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right hidden sm:block">
                <div ref={stepTitleRef} className="text-[10.5px] font-mono font-medium text-neutral-800">
                  {STEPS_META[currentStep - 1]?.shortTitle}
                </div>
                <div ref={progressTextRef} className="text-[9.5px] font-mono text-neutral-400">
                  0% Scrolled
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-18 sm:w-20 h-1.5 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200/80">
                <div
                  ref={progressTrackRef}
                  className="h-full bg-amber-500 transition-all duration-75 ease-out rounded-full"
                  style={{ width: "0%" }}
                />
              </div>

              {/* Auto Play / Pause Button */}
              <button
                onClick={togglePlay}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-md border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-[11px] font-mono transition-colors cursor-pointer shadow-2xs"
                title={isPlaying ? "Pause automated animation" : "Auto-play flow animation"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3 text-neutral-600" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-neutral-600" />
                    <span>Auto Play</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ================= FLOW STAGE (DYNAMIC PIXEL-LOCKED SYSTEM) ================= */}
          <div
            ref={stageRef}
            className="relative w-full h-[380px] sm:h-[410px] md:h-[430px] select-none"
          >
            {/* ================= ARCHITECTURAL ZONE LABELS ================= */}
            {/* Top-Left: Buyer Side */}
            <div className="absolute left-2 sm:left-4 md:left-6 top-1.5 z-20 flex items-center pointer-events-none">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-[10px] sm:text-[11px] font-mono text-amber-900 shadow-2xs backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-semibold uppercase tracking-wider">Buyer Side</span>
              </div>
            </div>

            {/* Top-Right: Seller Side */}
            <div className="absolute right-2 sm:right-4 md:right-6 top-1.5 z-20 flex items-center pointer-events-none">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/25 text-[10px] sm:text-[11px] font-mono text-sky-900 shadow-2xs backdrop-blur-xs">
                <span className="font-semibold uppercase tracking-wider">Seller Side</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              </div>
            </div>

            {/* SVG CONNECTION BEAMS (DYNAMICALLY TIED TO CARD DOM PORTS) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
              fill="none"
            >
              {/* ================= BASE GUIDE TRACKS (DASHED ARCHITECTURAL) ================= */}
              <path ref={path1BaseRef} stroke="rgba(0,0,0,0.12)" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
              <path ref={path2BaseRef} stroke="rgba(0,0,0,0.12)" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
              <path ref={path3BaseRef} stroke="rgba(0,0,0,0.12)" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
              <path ref={path4BaseRef} stroke="rgba(0,0,0,0.12)" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
              <path ref={path5BaseRef} stroke="rgba(0,0,0,0.12)" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
              <path ref={path6BaseRef} stroke="rgba(0,0,0,0.12)" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />

              {/* ================= ANIMATED ACTIVE BEAMS (VIBRANT ROCK-SOLID STROKES) ================= */}
              <path ref={path1ActiveRef} className="flow-path-active" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
              <path ref={path2ActiveRef} className="flow-path-active" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
              <path ref={path3ActiveRef} className="flow-path-active" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
              <path ref={path4ActiveRef} className="flow-path-active" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
              <path ref={path5ActiveRef} className="flow-path-active" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
              <path ref={path6ActiveRef} className="flow-path-active" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            </svg>

            {/* ================= STEP LABEL PILLS (DYNAMICALLY PLACED BY RESIZEOBSERVER) ================= */}
            <div
              ref={pill1Ref}
              className="step-badge-node absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            >
              <div className="bg-white px-2 py-0.5 rounded-md border border-neutral-200/90 shadow-xs flex items-center gap-1 font-mono text-[9.5px] text-neutral-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="font-bold">01</span>
                <span className="text-neutral-500">MCP Discovery</span>
              </div>
            </div>

            <div
              ref={pill2Ref}
              className="step-badge-node absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            >
              <div className="bg-white px-2 py-0.5 rounded-md border border-neutral-200/90 shadow-xs flex items-center gap-1 font-mono text-[9.5px] text-neutral-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="font-bold">02</span>
                <span className="text-neutral-500">Unauthenticated Invoke</span>
              </div>
            </div>

            <div
              ref={pill3Ref}
              className="step-badge-node absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            >
              <div className="bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 shadow-xs flex items-center gap-1.5 font-mono text-[10px] text-rose-900">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-bold">03</span>
                <span>HTTP 402: Invoice &amp; Tree Root</span>
              </div>
            </div>

            <div
              ref={pill4Ref}
              className="step-badge-node absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            >
              <div className="bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200 shadow-xs flex items-center gap-1.5 font-mono text-[10px] text-purple-900">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
                <span className="font-bold">04</span>
                <span>X-ArcNano-Proof (Groth16 in RAM)</span>
              </div>
            </div>

            <div
              ref={pill5Ref}
              className="step-badge-node absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            >
              <div className="bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 shadow-xs flex items-center gap-1.5 font-mono text-[10px] text-emerald-900">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">05</span>
                <span>&lt;8ms Verified: HTTP 200 Stream</span>
              </div>
            </div>

            <div
              ref={pill6aRef}
              className="step-badge-node absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            >
              <div className="bg-white px-2 py-0.5 rounded-md border border-neutral-200 shadow-xs flex items-center gap-1 font-mono text-[9.5px] text-neutral-800">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span className="font-bold">06a</span>
                <span className="text-neutral-500">Buffer Webhook</span>
              </div>
            </div>

            <div
              ref={pill6bRef}
              className="step-badge-node absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            >
              <div className="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shadow-xs flex items-center gap-1 font-mono text-[9.5px] text-emerald-900">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span className="font-bold">06b</span>
                <span>$0.00 Gas Settle</span>
              </div>
            </div>

            {/* ================= ACTOR NODES (POSITIONED WITH ZERO OVERFLOW) ================= */}

            {/* 1. AGENT A (BUYER / CONSUMER SWARM) - ANCHORED LEFT */}
            <div
              id="card-agent-a"
              className="actor-card absolute left-2 sm:left-4 md:left-6 top-[9%] w-[24%] min-w-[170px] max-w-[210px] rounded-xl p-2.5 sm:p-3 border transition-all duration-300 z-30"
            >
              {/* Output Connection Port */}
              <div ref={portA_Ref} className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 pointer-events-none opacity-0" />

              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[8.5px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                  Consumer
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9.5px] font-mono text-neutral-500">Active</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-50 border border-neutral-200/80 flex items-center justify-center p-1 shadow-2xs shrink-0">
                  <Image
                    src="/a2a-agent-a.png"
                    alt="Agent A"
                    width={28}
                    height={28}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs sm:text-[13px] text-neutral-900 tracking-tight truncate">
                    Agent A (Buyer)
                  </h3>
                  <p className="text-[9.5px] font-mono text-neutral-500 truncate">Autonomous LLM</p>
                </div>
              </div>
            </div>

            {/* 2. AGENT B (SELLER / MCP TOOL GATEWAY) - ANCHORED RIGHT */}
            <div
              id="card-agent-b"
              className="actor-card absolute right-2 sm:right-4 md:right-6 top-[9%] w-[24%] min-w-[170px] max-w-[210px] rounded-xl p-2.5 sm:p-3 border transition-all duration-300 z-30"
            >
              {/* Input Connection Port */}
              <div ref={portB_Ref} className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 pointer-events-none opacity-0" />
              {/* 402 Reject Out Port */}
              <div ref={portB_RejectRef} className="absolute -left-1 bottom-2 w-2 h-2 pointer-events-none opacity-0" />

              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[8.5px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                  Provider
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  <span className="text-[9.5px] font-mono text-neutral-500">Listening</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-50 border border-neutral-200/80 flex items-center justify-center p-1 shadow-2xs shrink-0">
                  <Image
                    src="/a2a-agent-b.png"
                    alt="Agent B"
                    width={28}
                    height={28}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs sm:text-[13px] text-neutral-900 tracking-tight truncate">
                    Agent B (Seller)
                  </h3>
                  <p className="text-[9.5px] font-mono text-neutral-500 truncate">MCP Gateway</p>
                </div>
              </div>
            </div>

            {/* 3. OFF-CHAIN GROTH16 PROVER IN RAM - ANCHORED LEFT */}
            <div
              id="card-prover"
              className="actor-card absolute left-2 sm:left-4 md:left-6 top-[38%] w-[26%] min-w-[190px] max-w-[230px] rounded-xl p-2.5 sm:p-3 border transition-all duration-300 z-30"
            >
              {/* Challenge Input Port */}
              <div ref={portProver_TopRef} className="absolute right-4 -top-1 w-2 h-2 pointer-events-none opacity-0" />
              {/* Proof Output Port */}
              <div ref={portProver_OutRef} className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 pointer-events-none opacity-0" />

              <div className="relative flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1">
                  <div
                    id="active-zk-pulse"
                    className="absolute -left-1 -top-1 w-5 h-5 rounded-full bg-purple-500/20 pointer-events-none"
                  />
                  <span className="font-mono text-[8.5px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200 font-bold">
                    ZK-SNARK
                  </span>
                </div>
                <span className="text-[9.5px] font-mono text-purple-700 font-semibold">
                  ~74ms Off-Chain
                </span>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-2xs">
                  ZK
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs text-neutral-900 tracking-tight truncate">
                    Groth16 Prover
                  </h4>
                  <p className="text-[9px] text-neutral-500 mt-0.5 leading-snug line-clamp-1">
                    Proves in agent RAM. Zero on-chain trace.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. IN-MEMORY VERIFICATION GATE (<8ms) - ANCHORED RIGHT */}
            <div
              id="card-verifier"
              className="actor-card absolute right-2 sm:right-4 md:right-6 top-[38%] w-[26%] min-w-[190px] max-w-[230px] rounded-xl p-2.5 sm:p-3 border transition-all duration-300 z-30"
            >
              {/* Proof Input Port */}
              <div ref={portVerifier_InRef} className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 pointer-events-none opacity-0" />
              {/* Stream Return Port */}
              <div ref={portVerifier_StreamRef} className="absolute -left-1 top-2 w-2 h-2 pointer-events-none opacity-0" />
              {/* Webhook Bottom Port */}
              <div ref={portVerifier_BotRef} className="absolute left-1/3 -bottom-1 w-2 h-2 pointer-events-none opacity-0" />

              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[8.5px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200 font-bold">
                  Gateway RAM
                </span>
                <span className="text-[9.5px] font-mono text-sky-700 font-semibold">
                  &lt;8ms In-Memory
                </span>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs text-neutral-900 tracking-tight truncate">
                    Verify &amp; Stream
                  </h4>
                  <p className="text-[9px] text-neutral-500 mt-0.5 leading-snug line-clamp-1">
                    Instant pairing check in RAM before stream.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. ARCNANO RELAYER (SETTLEMENT BUFFER) - CENTER-LEFT */}
            <div
              id="card-relayer"
              className="actor-card absolute left-[34%] sm:left-[36%] md:left-[38%] top-[72%] w-[24%] min-w-[180px] max-w-[210px] rounded-xl p-2.5 sm:p-3 border transition-all duration-300 z-30"
            >
              {/* Inbound Webhook Port */}
              <div ref={portRelayer_InRef} className="absolute left-1/2 -top-1 -translate-x-1/2 w-2 h-2 pointer-events-none opacity-0" />
              {/* Outbound Settlement Port */}
              <div ref={portRelayer_OutRef} className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 pointer-events-none opacity-0" />

              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[8.5px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                  Buffer
                </span>
                <span className="text-[9.5px] font-mono text-neutral-500">10–50 Notes</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-50 border border-neutral-200/80 flex items-center justify-center p-1 shadow-2xs shrink-0">
                  <Image
                    src="/a2a-relayer.png"
                    alt="ArcNano Relayer"
                    width={26}
                    height={26}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs sm:text-[13px] text-neutral-900 tracking-tight truncate">
                    ArcNano Relayer
                  </h3>
                  <p className="text-[9.5px] font-mono text-neutral-500 truncate">Batches proofs</p>
                </div>
              </div>
            </div>

            {/* 6. ARC LAYER 1 & CIRCLE GAS STATION - ANCHORED RIGHT */}
            <div
              id="card-layer1"
              className="actor-card absolute right-2 sm:right-4 md:right-6 top-[72%] w-[24%] min-w-[180px] max-w-[210px] rounded-xl p-2.5 sm:p-3 border transition-all duration-300 z-30"
            >
              {/* Inbound Batch Port */}
              <div ref={portL1_InRef} className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 pointer-events-none opacity-0" />

              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[8.5px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                  Arc Layer 1
                </span>
                <span className="text-[9.5px] font-mono text-emerald-700 font-semibold truncate">
                  $0.00 Gas
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-50 border border-neutral-200/80 flex items-center justify-center p-1 shadow-2xs shrink-0">
                  <Image
                    src="/a2a-layer1.png"
                    alt="Arc Layer 1"
                    width={26}
                    height={26}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs sm:text-[13px] text-neutral-900 tracking-tight truncate">
                    Arc L1 Settle
                  </h3>
                  <p className="text-[9.5px] font-mono text-neutral-500 truncate">Paymaster $0 Gas</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BOTTOM METRIC BAR ================= */}
          <div className="mt-3 pt-2.5 border-t border-neutral-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="py-1.5 px-2 rounded-lg bg-neutral-50/70 border border-neutral-200/60">
              <div className="text-sm sm:text-base font-bold font-mono text-neutral-900">&lt;8ms</div>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">In-Memory Verification</div>
            </div>
            <div className="py-1.5 px-2 rounded-lg bg-neutral-50/70 border border-neutral-200/60">
              <div className="text-sm sm:text-base font-bold font-mono text-neutral-900">~74ms</div>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">Off-Chain Groth16 Prover</div>
            </div>
            <div className="py-1.5 px-2 rounded-lg bg-neutral-50/70 border border-neutral-200/60">
              <div className="text-sm sm:text-base font-bold font-mono text-neutral-900">$0.00</div>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">Agent Native Gas Cost</div>
            </div>
            <div className="py-1.5 px-2 rounded-lg bg-neutral-50/70 border border-neutral-200/60">
              <div className="text-sm sm:text-base font-bold font-mono text-emerald-600">Zero Trace</div>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">No msg.sender On-Chain</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
