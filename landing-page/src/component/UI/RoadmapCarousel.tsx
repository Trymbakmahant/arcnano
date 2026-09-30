"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  ShieldCheck,
  Cpu,
  Fuel,
} from "lucide-react";

export interface RoadmapCard {
  id: string;
  number: string;
  tags: string[];
  name: string;
  date: string;
  status: "completed" | "in-progress" | "coming-soon";
  statusLabel: string;
  strokeColor: string;
  summary: string;
  deliverables: {
    title: string;
    done: boolean;
  }[];
  codeOrDiagram: {
    type: "math" | "circuit" | "code" | "flow";
    lines: string[];
  };
  metrics?: { label: string; value: string };
  icon: React.ComponentType<{ className?: string }>;
}

const ROADMAP_CARDS: RoadmapCard[] = [
  {
    id: "r-01",
    number: "01",
    tags: ["ZK Cryptography", "HTTP X402", "Spec RFC"],
    name: "Architecture & Protocol Spec",
    date: "August 2026",
    status: "completed",
    statusLabel: "Completed",
    strokeColor: "#10b981", // emerald
    summary:
      "Formulated the two-stage X402 verification model, solved msg.sender leakage via receiver-batched settlement, and authored the foundational protocol specification.",
    deliverables: [
      { title: "Two-stage X402 verification model RFC", done: true },
      { title: "Poseidon shielded note commitment scheme", done: true },
      { title: "Next.js 16 interactive testbed & visualizer", done: true },
    ],
    codeOrDiagram: {
      type: "math",
      lines: [
        "// 1. Note Commitment Generation",
        "commitment = Poseidon(0.01_USDC, secret, nullifier_seed)",
        "// 2. Off-chain X402 Header Delivery",
        "X-PAYMENT: { proof, nullifier, pool_root, recipient }",
        "// 3. Sub-8ms In-Memory Bilinear Pairing Check",
        "e(π_A, π_B) = e(α, β) · e(x, γ) · e(π_C, δ) -> TRUE",
      ],
    },
    metrics: { label: "Signer Traceability", value: "0%" },
    icon: Layers,
  },
  {
    id: "r-02",
    number: "02",
    tags: ["Circom 2.1", "Groth16", "Privacy Pools"],
    name: "Circom Circuits & Arc Testnet",
    date: "September – October 2026",
    status: "in-progress",
    statusLabel: "In Progress",
    strokeColor: "#f59e0b", // amber
    summary:
      "Finalizing the 20-level Poseidon Merkle tree inclusion circuit (spend.circom), ASP non-membership constraints, and preparing ArcShieldPool.sol for Arc Testnet.",
    deliverables: [
      { title: "20-Level spend.circom note inclusion circuit", done: true },
      { title: "ASP non-membership proof (asp_check.circom)", done: false },
      { title: "ArcShieldPool.sol deployment on Arc Testnet", done: false },
    ],
    codeOrDiagram: {
      type: "circuit",
      lines: [
        "template SpendNote(levels) {",
        "  signal input noteRoot, nullifier, secret, path[levels];",
        "  // Enforce Poseidon inclusion inside valid pool",
        "  component tree = MerkleVerifier(levels);",
        "  // Enforce Non-Membership in Sanctioned ASP Registry",
        "  component asp = VerifyNonMembership(aspRoot, commitment);",
        "  asp.isExcluded === 1; // 100% OFAC Compliant",
        "}",
      ],
    },
    metrics: { label: "Merkle Tree Depth", value: "20 Levels" },
    icon: ShieldCheck,
  },
  {
    id: "r-03",
    number: "03",
    tags: ["Python SDK", "AI Agent Toolchains", "Middleware"],
    name: "Agent SDK & Gateway Tooling",
    date: "November 2026",
    status: "coming-soon",
    statusLabel: "Coming Soon",
    strokeColor: "#0284c7", // sky
    summary:
      "Building client libraries for autonomous AI frameworks (LangChain, AutoGPT, CrewAI) and drop-in Express/Fastify X402 middleware for API providers to verify ZK proofs in single-digit milliseconds.",
    deliverables: [
      { title: "arczk-agent Python package for AI agent toolchains", done: false },
      { title: "@arcnano/x402-express drop-in server middleware", done: false },
      { title: "Sub-8ms off-chain WASM pairing verifier", done: false },
    ],
    codeOrDiagram: {
      type: "code",
      lines: [
        "from arczk import ArcAgentClient",
        "",
        "agent = ArcAgentClient(pool='0xArcNanoPool...')",
        "# Autonomous X402 handshake & local Groth16 proof",
        "response = agent.post(",
        "    'https://api.inference.ai/v1/generate',",
        "    json={'prompt': 'Autonomous research loop'},",
        "    max_micropayment='0.005_USDC'",
        ")",
      ],
    },
    metrics: { label: "Local Verification", value: "< 8ms" },
    icon: Cpu,
  },
  {
    id: "r-04",
    number: "04",
    tags: ["Circle Paymaster", "ERC-4337", "Live Pilot"],
    name: "Circle Gas Station & AI Pilot",
    date: "December 2026",
    status: "coming-soon",
    statusLabel: "Upcoming",
    strokeColor: "#8b5cf6", // violet
    summary:
      "Production integration with Arc's Circle Gas Station Paymaster for zero-gas settlement, followed by a live testnet pilot connecting autonomous AI agents to live inference providers.",
    deliverables: [
      { title: "Circle Gas Station paymaster contract sponsorship", done: false },
      { title: "Automated batch relayer daemon for note aggregation", done: false },
      { title: "Live M2M AI agent inference & scraping pilot", done: false },
    ],
    codeOrDiagram: {
      type: "flow",
      lines: [
        "1. AI Agent generates off-chain Groth16 proof in RAM ($0 gas)",
        "2. API Gateway receives proof -> streams LLM token response",
        "3. Gateway queues 50 proofs -> calls batchSpend()",
        "4. Circle Gas Station pays 100% of native transaction gas",
        "5. ArcNanoPool releases 0.50 USDC directly to Gateway",
        "== Identity link between Agent and Gateway severed ==",
      ],
    },
    metrics: { label: "Agent Gas Cost", value: "$0.00" },
    icon: Fuel,
  },
];

export default function RoadmapCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxScrollDistance, setMaxScrollDistance] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Measure dynamic horizontal scroll range with parent container width & expansion delta
  useEffect(() => {
    const updateScrollRange = () => {
      if (trackRef.current) {
        // Measure against parent container's actual visible width (not raw window.innerWidth)
        const containerWidth =
          trackRef.current.parentElement?.clientWidth || window.innerWidth;
        const cards = trackRef.current.querySelectorAll("article");
        const lastCard = cards[cards.length - 1] as HTMLElement | undefined;

        let totalTrackWidth = trackRef.current.scrollWidth;

        // When the last card becomes featured, its width expands up to 700px.
        // Pre-account for any pending expansion delta so maxScrollDistance is always generous.
        if (lastCard) {
          const currentLastWidth = lastCard.offsetWidth;
          const targetExpandedWidth =
            window.innerWidth >= 1024
              ? 700
              : window.innerWidth >= 768
              ? 640
              : window.innerWidth >= 640
              ? 520
              : 330;
          const expansionDelta = Math.max(0, targetExpandedWidth - currentLastWidth);
          totalTrackWidth += expansionDelta;
        }

        // Additional end margin to guarantee the last card and its shadow/border are 100% visible
        const endMargin = window.innerWidth < 640 ? 40 : 100;
        const diff = Math.max(0, totalTrackWidth - containerWidth + endMargin);
        setMaxScrollDistance(diff);
      }
    };

    updateScrollRange();

    // Re-check as CSS expansion animations finish
    const t1 = setTimeout(updateScrollRange, 100);
    const t2 = setTimeout(updateScrollRange, 350);
    const t3 = setTimeout(updateScrollRange, 600);

    const ro = new ResizeObserver(() => {
      updateScrollRange();
    });

    if (trackRef.current) {
      ro.observe(trackRef.current);
    }
    if (trackRef.current?.parentElement) {
      ro.observe(trackRef.current.parentElement);
    }

    window.addEventListener("resize", updateScrollRange);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ro.disconnect();
      window.removeEventListener("resize", updateScrollRange);
    };
  }, [activeIndex]);

  // Track vertical scroll across the tall container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 26,
    mass: 0.8,
    restDelta: 0.001,
  });

  // Transform scroll progress to horizontal translation
  const x = useTransform(smoothProgress, [0, 1], [0, -maxScrollDistance]);

  // Update active card based on scroll progress
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      const idx = Math.min(
        ROADMAP_CARDS.length - 1,
        Math.max(0, Math.round(latest * (ROADMAP_CARDS.length - 1)))
      );
      setActiveIndex(idx);
    });
  }, [scrollYProgress]);

  // Scroll window vertically to target card
  const scrollToSlide = (index: number) => {
    setActiveIndex(index);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY + rect.top;
    const totalScrollableDistance =
      containerRef.current.offsetHeight - window.innerHeight;
    const targetScrollY =
      scrollTop + totalScrollableDistance * (index / (ROADMAP_CARDS.length - 1));

    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth",
    });
  };

  const handleNext = () => {
    if (activeIndex < ROADMAP_CARDS.length - 1) {
      scrollToSlide(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToSlide(activeIndex - 1);
    }
  };

  return (
    <section
      ref={containerRef}
      id="roadmap"
      aria-label="Development Roadmap"
      className="relative w-full h-[280vh] md:h-[320vh] bg-[#FAFAFA]"
    >
      {/* Sticky 100vh Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden pt-20 sm:pt-24 pb-6 sm:pb-8 px-4 sm:px-8 max-w-[1440px] mx-auto">
        {/* Background Stylized Typographic Watermark (Direct design inspiration) */}
        <div className="absolute top-8 left-6 sm:left-12 pointer-events-none select-none z-0 opacity-[0.04]">
          <span className="text-[120px] sm:text-[180px] md:text-[220px] font-black tracking-tighter text-neutral-900 leading-none">
            ROADMAP
          </span>
        </div>

        {/* Section Top Header & Carousel Controls */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 shrink-0 pt-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-xs font-mono text-amber-800 mb-2.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>{"04 // Development Roadmap"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-neutral-950">
              Selected Milestones
            </h2>
            <p className="text-neutral-600 text-xs sm:text-sm md:text-base mt-1.5 max-w-xl leading-relaxed">
              Scroll down to navigate horizontally through active engineering phases, or click any card to inspect.
            </p>
          </div>

          {/* Carousel Controls (Top Right) */}
          <div className="flex items-center gap-3">
            {/* Step Selector Pills */}
            <div className="flex items-center gap-1 bg-neutral-200/60 backdrop-blur-md p-1 rounded-xl border border-neutral-300/60 shadow-xs">
              {ROADMAP_CARDS.map((card, idx) => {
                const isSelected = activeIndex === idx;
                return (
                  <button
                    key={card.id}
                    onClick={() => scrollToSlide(idx)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white text-neutral-950 font-semibold shadow-xs"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    R.{card.number}
                  </button>
                );
              })}
            </div>

            {/* Slide Index Badge */}
            <div className="text-xs font-mono text-neutral-500 px-2 py-1 bg-neutral-100 rounded-md border border-neutral-200/70 hidden sm:block">
              <span className="font-semibold text-neutral-950">
                0{activeIndex + 1}
              </span>
              <span className="text-neutral-400"> / 0{ROADMAP_CARDS.length}</span>
            </div>

            {/* Left & Right Chevron Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                disabled={activeIndex === 0}
                aria-label="Previous milestone"
                className="w-9 h-9 rounded-xl border border-neutral-200/90 bg-white/90 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-neutral-800 transition-colors shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={activeIndex === ROADMAP_CARDS.length - 1}
                aria-label="Next milestone"
                className="w-9 h-9 rounded-xl border border-neutral-200/90 bg-white/90 hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-neutral-800 transition-colors shadow-xs cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* PROJECTS TRACK: Horizontal Scrolling Carousel with Featured Card Expansion */}
        <div className="relative z-10 w-full my-auto overflow-visible py-4 sm:py-6">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex items-end gap-6 sm:gap-8 will-change-transform"
          >
            {ROADMAP_CARDS.map((card, index) => {
              const isFeatured = activeIndex === index;
              const Icon = card.icon;

              return (
                <article
                  key={card.id}
                  onClick={() => scrollToSlide(index)}
                  style={
                    {
                      "--stroke": card.strokeColor,
                    } as React.CSSProperties
                  }
                  className={`group relative shrink-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer select-none ${
                    isFeatured
                      ? "w-[330px] sm:w-[520px] md:w-[640px] lg:w-[700px] opacity-100 z-20"
                      : "w-[280px] sm:w-[340px] md:w-[350px] opacity-65 hover:opacity-90 z-10"
                  }`}
                >
                  {/* card__tags (Uppercase tags with slash separators) */}
                  <p className="text-[11px] font-mono tracking-wider text-neutral-500 uppercase mb-3 flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                    {card.tags.map((tag, tIdx) => (
                      <React.Fragment key={tIdx}>
                        <span>{tag}</span>
                        {tIdx < card.tags.length - 1 && (
                          <span className="text-neutral-300 font-light">/</span>
                        )}
                      </React.Fragment>
                    ))}
                  </p>

                  {/* card__image container: Expands in height and width when is-featured */}
                  <div
                    className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] bg-white shadow-sm flex flex-col justify-between p-5 sm:p-7 ${
                      isFeatured
                        ? "h-[360px] sm:h-[420px] md:h-[460px] shadow-xl border-neutral-300/90 ring-1 ring-black/5"
                        : "h-[220px] sm:h-[260px] md:h-[280px] border-neutral-200/80 hover:border-neutral-300"
                    }`}
                    style={{
                      borderColor: isFeatured ? card.strokeColor : undefined,
                    }}
                  >
                    {/* Top row inside card: Milestone number, icon, and status badge */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                          style={{
                            backgroundColor: `${card.strokeColor}15`,
                            color: card.strokeColor,
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-xs font-semibold text-neutral-800">
                          {"// R."}{card.number}
                        </span>
                      </div>

                      {/* Status Badge */}
                      {card.status === "completed" && (
                        <span className="text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-[11px] font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {card.statusLabel}
                        </span>
                      )}
                      {card.status === "in-progress" && (
                        <span className="text-amber-800 font-medium flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-[11px] font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          {card.statusLabel}
                        </span>
                      )}
                      {card.status === "coming-soon" && (
                        <span className="text-neutral-500 font-normal text-[11px] font-mono bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">
                          {card.statusLabel}
                        </span>
                      )}
                    </div>

                    {/* Middle: Rich Content Preview / Diagram / Code Terminal */}
                    {isFeatured ? (
                      <div className="my-auto py-2 sm:py-3 space-y-3">
                        <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed max-w-xl">
                          {card.summary}
                        </p>

                        {/* Interactive Code / Circuit Window inside Featured Card */}
                        <div className="w-full rounded-xl bg-neutral-950 text-neutral-300 font-mono text-[11px] sm:text-xs p-3.5 sm:p-4 border border-neutral-800 overflow-x-auto shadow-inner">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-[10px] text-neutral-500">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-500/80"></span>
                              <span className="w-2 h-2 rounded-full bg-amber-500/80"></span>
                              <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
                              <span className="ml-1 text-neutral-400">
                                {card.codeOrDiagram.type.toUpperCase()}_SPEC.arcnano
                              </span>
                            </span>
                            {card.metrics && (
                              <span className="text-amber-400 font-semibold">
                                {card.metrics.label}: {card.metrics.value}
                              </span>
                            )}
                          </div>
                          <pre className="space-y-1 text-neutral-300 leading-relaxed overflow-x-auto">
                            {card.codeOrDiagram.lines.slice(0, 5).map((ln, lIdx) => (
                              <div key={lIdx} className="hover:text-white transition-colors">
                                <span className="text-neutral-600 select-none mr-3">
                                  0{lIdx + 1}
                                </span>
                                {ln}
                              </div>
                            ))}
                          </pre>
                        </div>

                        {/* Key Deliverables Check-List */}
                        <div className="hidden sm:grid grid-cols-2 gap-2 pt-1 text-xs">
                          {card.deliverables.slice(0, 2).map((del, dIdx) => (
                            <div key={dIdx} className="flex items-center gap-2 text-neutral-700">
                              {del.done ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-neutral-300 shrink-0 flex items-center justify-center text-[8px] text-neutral-400">
                                  ○
                                </span>
                              )}
                              <span className="truncate">{del.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Compressed Inactive Card Middle State */
                      <div className="my-auto py-2">
                        <h4 className="text-base sm:text-lg font-normal text-neutral-900 tracking-tight leading-snug line-clamp-2">
                          {card.name}
                        </h4>
                        <p className="text-neutral-500 text-xs mt-2 line-clamp-3 leading-relaxed">
                          {card.summary}
                        </p>
                      </div>
                    )}

                    {/* Bottom of card image container */}
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-neutral-100">
                      <span className="text-[11px] font-mono text-neutral-400">
                        {isFeatured ? "Active Focus" : "Click to inspect"}
                      </span>
                      <span
                        className="font-mono text-[11px] flex items-center gap-1 transition-transform group-hover:translate-x-1"
                        style={{ color: card.strokeColor }}
                      >
                        Explore &rarr;
                      </span>
                    </div>
                  </div>

                  {/* card__meta: Title & Date (Under the image, exactly as in reference snippet) */}
                  <div className="flex items-baseline justify-between mt-3 px-1 text-neutral-900">
                    <span className="font-normal text-sm sm:text-base tracking-tight text-neutral-950 font-sans">
                      {card.name}
                    </span>
                    <span className="text-xs font-mono text-neutral-500 ml-2 shrink-0">
                      {card.date}
                    </span>
                  </div>

                  {/* card__hit: Full hit-area action button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToSlide(index);
                    }}
                    className="sr-only"
                  >
                    Open {card.name}
                  </button>
                </article>
              );
            })}

            {/* End buffer spacer to guarantee the last card has generous right breathing room */}
            <div
              className="w-16 sm:w-28 md:w-40 shrink-0 pointer-events-none"
              aria-hidden="true"
            />
          </motion.div>
        </div>

        {/* Bottom Bar: Progress Indicator & Hint */}
        <div className="relative z-10 shrink-0 flex items-center justify-between gap-4 pt-3 sm:pt-4 border-t border-neutral-200/70">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Scroll vertically to advance • Click any project card to expand</span>
          </div>

          {/* Smooth Progress Meter */}
          <div className="flex items-center gap-3">
            <div className="w-28 sm:w-44 h-1.5 bg-neutral-200/90 rounded-full overflow-hidden">
              <motion.div
                style={{ scaleX: smoothProgress, transformOrigin: "left" }}
                className="h-full bg-amber-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
