"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Avatar } from "@bible-strong/avatar-react";
import "@bible-strong/avatar-react/styles.css";
import type { AvatarDefinition } from "@bible-strong/avatar-core";
import agentAvatarsData from "@/data/agentAvatars.json";
import { Send, Loader2, ChevronDown, RotateCcw } from "lucide-react";
import gsap from "gsap";

interface AgentAvatarItem {
  id: string;
  name: string;
  definition: AvatarDefinition;
}

const avatarsList = agentAvatarsData as unknown as AgentAvatarItem[];
const cubeeAvatar = avatarsList.find((a) => a.name === "Cubee") || avatarsList[0];

const DEFAULT_HERO_THOUGHTS = [
  "Zero msg.sender on Arc: agent identities remain completely shielded.",
  "Circle Gas Station sponsors batch settlement. Agents pay $0.00 gas.",
  "Deterministic sub-500ms finality ensures streaming LLM token delivery never stalls.",
  "Groth16 ZK-SNARKs and Privacy Pools ASP guarantee mathematical compliance.",
  "Poseidon Merkle Vault manages over 1M shielded notes across a 64-root ring buffer.",
  "Autonomous AI agents require instant machine micropayments via X402 headers.",
  "Ask questions below or explore off-chain cryptographic verification.",
];

export interface HeroCubeeCloudProps {
  sectionId?: string;
  sectionLabel?: string;
  isActive?: boolean;
  thoughts?: string[];
  pretextTitle?: string;
  pretextHint?: string;
  className?: string;
  triggerSelector?: string;
  cloudPosition?: "left" | "right";
}

export default function HeroCubeeCloud({
  sectionId = "hero",
  sectionLabel = "Hero",
  isActive = true,
  thoughts = DEFAULT_HERO_THOUGHTS,
  pretextTitle = "ArcNano Hero Overview",
  pretextHint = "Shielded Nanopayments for Autonomous AI Agents on Arc Network",
  className = "",
  triggerSelector,
  cloudPosition = "right",
}: HeroCubeeCloudProps) {
  const activeThoughts = useMemo(() => {
    return thoughts && thoughts.length > 0 ? thoughts : DEFAULT_HERO_THOUGHTS;
  }, [thoughts]);

  const [thoughtIndex, setThoughtIndex] = useState<number>(0);
  const [animation, setAnimation] = useState<string>("proud");
  const [speechText, setSpeechText] = useState<string>(activeThoughts[0]);
  const [inputQuery, setInputQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [userAsked, setUserAsked] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [canScrollMore, setCanScrollMore] = useState<boolean>(false);

  // DOM Refs for high-performance GSAP hardware-accelerated animations & scrolling
  const containerRef = useRef<HTMLDivElement>(null);
  const portalRing1Ref = useRef<HTMLDivElement>(null);
  const portalRing2Ref = useRef<HTMLDivElement>(null);
  const cloudWrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const dot1Ref = useRef<HTMLDivElement>(null);
  const dot2Ref = useRef<HTMLDivElement>(null);
  const dot3Ref = useRef<HTMLDivElement>(null);
  const avatarWrapperRef = useRef<HTMLDivElement>(null);
  const avatarFloatRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  // Determine if cloud holds a response/answer or long explanation
  const hasResponse = userAsked || speechText.length > 95;
  const isExpanded = hasResponse || isHovered || isPinned;

  // Responsive dimension calculations with upward expansion math (y_bottom remains fixed at 122px)
  const cloudDimensions = useMemo(() => {
    if (hasResponse) {
      if (isHovered || isPinned) {
        return {
          cloud: "w-[340px] sm:w-[380px] md:w-[410px] h-[184px] sm:h-[196px] -mt-[48px] sm:-mt-[60px]",
          form: "w-[260px] sm:w-[290px]",
          textMaxH: "max-h-[106px] sm:max-h-[118px]",
        };
      }
      return {
        cloud: "w-[315px] sm:w-[355px] md:w-[385px] h-[168px] sm:h-[180px] -mt-[32px] sm:-mt-[44px]",
        form: "w-[250px] sm:w-[280px]",
        textMaxH: "max-h-[92px] sm:max-h-[104px]",
      };
    }
    if (isHovered || isPinned) {
      return {
        cloud: "w-[260px] sm:w-[285px] h-[138px] -mt-[14px]",
        form: "w-[220px] sm:w-[240px]",
        textMaxH: "max-h-[78px]",
      };
    }
    return {
      cloud: "w-[225px] sm:w-[235px] h-[122px] mt-0",
      form: "w-[205px] sm:w-[218px]",
      textMaxH: "max-h-[70px]",
    };
  }, [hasResponse, isHovered, isPinned]);

  // Check if content overflows vertically to toggle scroll indicator
  const checkScrollOverflow = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setCanScrollMore(scrollHeight - scrollTop - clientHeight > 8);
  };

  // Reset thought to initial rotating stream
  const handleResetThought = () => {
    setUserAsked(false);
    setIsPinned(false);
    setThoughtIndex(0);
    setSpeechText(activeThoughts[0]);
  };

  // Reset scroll position and re-check overflow on speech change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    checkScrollOverflow();
  }, [speechText]);

  // Re-check overflow when expanded state or hover changes
  useEffect(() => {
    const t = setTimeout(checkScrollOverflow, 120);
    return () => clearTimeout(t);
  }, [speechText, isExpanded, isHovered, isPinned]);

  // Sync initial thought when thoughts array changes
  useEffect(() => {
    if (activeThoughts.length > 0) {
      setSpeechText(activeThoughts[0]);
      setThoughtIndex(0);
    }
  }, [activeThoughts]);

  // Robust viewport detection on mount and scroll
  useEffect(() => {
    setIsClient(true);

    let observer: IntersectionObserver | null = null;

    const setupObserver = () => {
      // If triggerSelector is provided (e.g. bottom of Blueprint or Problem card), observe that element
      const targetEl = triggerSelector
        ? (document.querySelector(triggerSelector) as HTMLElement | null)
        : containerRef.current;

      if (!targetEl) return false;

      // Immediate viewport check
      const rect = targetEl.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
      if (inViewport && isActive) {
        setIsInView(true);
      } else {
        setIsInView(false);
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && isActive) {
            setIsInView(true);
          } else if (!entry.isIntersecting) {
            // Off-screen: reset so it re-triggers emergence animation when scrolled back
            setIsInView(false);
          }
        },
        {
          threshold: triggerSelector ? 0.05 : 0.08,
          rootMargin: triggerSelector ? "0px 0px -10px 0px" : "60px 0px 60px 0px",
        }
      );

      observer.observe(targetEl);
      return true;
    };

    if (!setupObserver() && triggerSelector) {
      const t = setTimeout(setupObserver, 60);
      return () => {
        clearTimeout(t);
        if (observer) observer.disconnect();
      };
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [isActive, triggerSelector]);

  // Buttery-smooth GSAP Hardware-Accelerated Emergence Sequence
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      if (isInView) {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        // 1. Teleportation Portal Warps
        if (portalRing1Ref.current && portalRing2Ref.current) {
          tl.fromTo(
            portalRing1Ref.current,
            { scale: 0, opacity: 0.95 },
            { scale: 2.2, opacity: 0, duration: 0.65, ease: "power2.out", force3D: true },
            0
          );
          tl.fromTo(
            portalRing2Ref.current,
            { scale: 0, opacity: 0.8 },
            { scale: 1.8, opacity: 0, duration: 0.55, ease: "power2.out", force3D: true },
            0.08
          );
        }

        // 2. Avatar pop-in with organic back ease
        if (avatarWrapperRef.current) {
          tl.fromTo(
            avatarWrapperRef.current,
            { scale: 0.6, opacity: 0, y: 15 },
            { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: "back.out(2)", force3D: true },
            0.05
          );
        }
        if (shadowRef.current) {
          tl.fromTo(
            shadowRef.current,
            { scale: 0.2, opacity: 0 },
            { scale: 1, opacity: 0.15, duration: 0.4, ease: "power2.out", force3D: true },
            0.05
          );
        }

        // 3. The 3 Trailing Thought Dots (staggered elastic pops)
        if (dot1Ref.current) {
          tl.fromTo(
            dot1Ref.current,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.26, ease: "back.out(3)", force3D: true },
            0.18
          );
        }
        if (dot2Ref.current) {
          tl.fromTo(
            dot2Ref.current,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.26, ease: "back.out(3)", force3D: true },
            0.28
          );
        }
        if (dot3Ref.current) {
          tl.fromTo(
            dot3Ref.current,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.26, ease: "back.out(3)", force3D: true },
            0.38
          );
        }

        // 4. Scalloped Thought Cloud emerges with organic spring
        if (cloudWrapperRef.current) {
          tl.fromTo(
            cloudWrapperRef.current,
            { scale: 0, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.52,
              ease: "back.out(1.6)",
              force3D: true,
              transformOrigin: cloudPosition === "left" ? "bottom right" : "bottom left",
            },
            0.46
          );
        }

        // 5. Speech text fades & glides in
        if (textRef.current) {
          tl.fromTo(
            textRef.current,
            { opacity: 0, y: 5 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", force3D: true },
            0.68
          );
        }

        // 6. Interactive form glides in
        if (formRef.current) {
          tl.fromTo(
            formRef.current,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", force3D: true },
            0.78
          );
        }
      } else {
        // Smoothly fade out when out of view
        const elementsToHide = [
          cloudWrapperRef.current,
          dot1Ref.current,
          dot2Ref.current,
          dot3Ref.current,
          avatarWrapperRef.current,
          shadowRef.current,
        ].filter(Boolean);

        if (elementsToHide.length > 0) {
          gsap.to(elementsToHide, {
            opacity: 0,
            scale: 0.65,
            duration: 0.25,
            ease: "power2.in",
            overwrite: "auto",
            force3D: true,
          });
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isInView, cloudPosition]);

  // Buttery-smooth GSAP 60fps GPU idle float for the avatar
  useEffect(() => {
    if (!avatarFloatRef.current || !shadowRef.current || !isInView) return;

    const floatTween = gsap.to(avatarFloatRef.current, {
      y: -6,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      force3D: true,
    });

    const shadowTween = gsap.to(shadowRef.current, {
      scale: 0.88,
      opacity: 0.1,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      force3D: true,
    });

    return () => {
      floatTween.kill();
      shadowTween.kill();
    };
  }, [isInView]);

  // Smooth speech text transitions
  useEffect(() => {
    if (!textRef.current) return;
    gsap.fromTo(
      textRef.current,
      { opacity: 0, y: 4 },
      { opacity: 1, y: 0, duration: 0.28, ease: "power2.out", force3D: true }
    );
  }, [speechText]);

  // Auto rotate thoughts every 8.5 seconds when visible and user is not typing
  useEffect(() => {
    if (!isClient || !isInView || userAsked || isTyping) return;

    const timer = setInterval(() => {
      setThoughtIndex((prev) => {
        const next = (prev + 1) % activeThoughts.length;
        setSpeechText(activeThoughts[next]);
        return next;
      });
    }, 8500);

    return () => clearInterval(timer);
  }, [isClient, isInView, userAsked, isTyping, activeThoughts]);

  // Handle asking questions to GLM agent
  const handleAsk = async (queryToAsk?: string) => {
    const q = (queryToAsk || inputQuery).trim();
    if (!q || isLoading) return;

    setUserAsked(true);
    setInputQuery("");
    setIsLoading(true);
    setAnimation("working");

    try {
      const storedKey = localStorage.getItem("cubee_glm_api_key") || "";
      const storedModel = localStorage.getItem("cubee_glm_model") || "glm-4-flash";

      const res = await fetch("/api/cubee-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          pretext: {
            title: pretextTitle,
            hint: pretextHint,
          },
          clientApiKey: storedKey || undefined,
          model: storedModel,
        }),
      });

      const data = await res.json();
      const reply = data.answer || "I processed your question about ArcNano!";
      setSpeechText(reply);
      setAnimation("celebrate");

      setTimeout(() => {
        setAnimation("proud");
      }, 4500);
    } catch {
      setSpeechText("ArcNano shields machine micropayments with zero msg.sender on Arc L1!");
      setAnimation("confused");
    } finally {
      setIsLoading(false);
    }
  };

  // Poking Cubee triggers mood and cloud bounce with GSAP
  const handlePoke = () => {
    const pokeMoods = [
      { text: "Tap acknowledged. Standing by as your off-chain settlement daemon.", anim: "celebrate" },
      { text: "Poseidon nullifier verified in RAM in under 8ms.", anim: "working" },
      { text: "Zero msg.sender on-chain. Autonomous agent identity is completely shielded.", anim: "proud" },
      { text: "Micro-receipts aggregated with 99.1% calldata compression on Arc.", anim: "excited" },
      { text: "Circle Gas Station sponsors Layer 1 settlement with $0.00 gas fees.", anim: "playful" },
    ];
    const pick = pokeMoods[Math.floor(Math.random() * pokeMoods.length)];
    setUserAsked(true);
    setSpeechText(pick.text);
    setAnimation(pick.anim);

    // GSAP elastic bounce on cloud
    if (cloudWrapperRef.current) {
      gsap.timeline()
        .to(cloudWrapperRef.current, { scale: 1.08, duration: 0.12, ease: "power2.out", force3D: true })
        .to(cloudWrapperRef.current, { scale: 1, duration: 0.3, ease: "elastic.out(1.2, 0.4)", force3D: true });
    }

    // Portal warp pulse on poke
    if (portalRing1Ref.current && portalRing2Ref.current) {
      gsap.fromTo(
        portalRing1Ref.current,
        { scale: 0.5, opacity: 0.8 },
        { scale: 2.1, opacity: 0, duration: 0.55, ease: "power2.out", force3D: true }
      );
      gsap.fromTo(
        portalRing2Ref.current,
        { scale: 0.5, opacity: 0.6 },
        { scale: 1.7, opacity: 0, duration: 0.5, ease: "power2.out", force3D: true }
      );
    }
  };

  // If explicitly disabled via prop, hide
  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col select-none min-h-[190px] ${
        cloudPosition === "left" ? "items-end" : "items-start"
      } ${isExpanded ? "z-40" : "z-20"} ${className}`}
    >
      {/* TELEPORTATION PORTAL GLOW & WARP AURA */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 overflow-visible">
        <div
          ref={portalRing1Ref}
          className={`absolute -bottom-4 ${
            cloudPosition === "left" ? "right-4" : "left-4"
          } w-24 h-24 rounded-full border-2 border-cyan-400 bg-cyan-400/20 blur-sm opacity-0 will-change-transform`}
        />
        <div
          ref={portalRing2Ref}
          className={`absolute -bottom-2 ${
            cloudPosition === "left" ? "right-6" : "left-6"
          } w-20 h-20 rounded-full border border-amber-400 bg-amber-400/15 blur-xs opacity-0 will-change-transform`}
        />
      </div>

      {/* TOP: IDEA CLOUD + OUTSIDE INPUT BOX */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative ${
          cloudPosition === "left" ? "pr-3 sm:pr-4" : "pl-3 sm:pl-4"
        } flex flex-col items-center z-30`}
      >
        {/* 1. SCALLOPED THOUGHT CLOUD */}
        <div
          ref={cloudWrapperRef}
          onClick={() => {
            if (hasResponse) {
              setIsPinned((prev) => !prev);
            }
          }}
          style={{
            transformOrigin: cloudPosition === "left" ? "bottom right" : "bottom left",
          }}
          className={`relative ${cloudDimensions.cloud} max-w-[calc(100vw-32px)] drop-shadow-md opacity-0 will-change-transform transition-all duration-300 ease-out ${
            hasResponse ? "cursor-pointer" : ""
          }`}
          title={hasResponse ? (isPinned ? "Click to unpin cloud view" : "Click to pin expanded view") : undefined}
        >
          <div className="w-full h-full relative">
            {/* Scalloped Cartoon Cloud SVG Outline */}
            <svg
              viewBox="0 0 250 135"
              className={`absolute inset-0 w-full h-full pointer-events-none filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.08)] ${
                cloudPosition === "left" ? "-scale-x-100" : ""
              }`}
              preserveAspectRatio="none"
            >
              <path
                d="M 35,34 C 42,14 65,10 80,22 C 94,6 120,4 134,18 C 148,6 174,8 186,24 C 200,12 222,16 228,36 C 246,46 246,72 238,86 C 248,98 238,114 222,118 C 210,130 188,132 174,120 C 160,132 136,132 122,120 C 108,132 84,130 72,118 C 56,128 36,122 30,106 C 10,98 8,76 18,62 C 8,48 18,34 35,34 Z"
                fill="white"
                stroke="#171717"
                strokeWidth="2.8"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>

            {/* ALL TEXT IS 100% INSIDE THE CLOUD SAFE ZONE */}
            <div
              ref={textRef}
              className={`relative z-10 w-full h-full flex flex-col items-center opacity-0 will-change-transform ${
                isExpanded
                  ? "justify-start pt-[34px] sm:pt-[38px] pb-[28px] sm:pb-[32px] px-8 sm:px-10"
                  : "justify-center px-7 sm:px-9 py-4"
              }`}
            >
              {/* Scrollable Response Container constrained to 78% central safe belly */}
              <div
                ref={scrollContainerRef}
                onScroll={checkScrollOverflow}
                className={`cubee-cloud-scroll w-full max-w-[80%] sm:max-w-[78%] mx-auto overflow-y-auto overscroll-contain transition-all duration-200 select-text text-center px-1 py-0.5 ${cloudDimensions.textMaxH}`}
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(23, 23, 23, 0.25) transparent",
                }}
              >
                <p
                  className={`text-[10px] sm:text-[10.5px] font-medium text-neutral-800 leading-[1.65] font-sans select-text whitespace-pre-wrap ${
                    isExpanded ? "" : "line-clamp-3"
                  }`}
                >
                  {speechText}
                </p>
              </div>

              {/* Subtle Scroll Hint When Overflowing */}
              {canScrollMore && !isLoading && (
                <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-950/8 backdrop-blur-xs text-[8px] sm:text-[8.5px] font-mono font-medium text-neutral-700 tracking-tight shadow-xs animate-pulse">
                  <span>Scroll for more</span>
                  <ChevronDown className="w-2.5 h-2.5 text-neutral-600" />
                </div>
              )}

              {/* Loading State with GLM-4 */}
              {isLoading && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-700 font-mono shadow-xs backdrop-blur-xs">
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-600" />
                  <span>Proving with GLM-4...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. INPUT BOX IN BOTTOM OF CLOUD OUTSIDE OF IT */}
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className={`mt-1.5 ${cloudDimensions.form} max-w-[calc(100vw-48px)] flex items-center gap-1 bg-white border border-neutral-300 hover:border-neutral-900 focus-within:border-neutral-950 focus-within:ring-1 focus-within:ring-neutral-900/15 px-2.5 py-1 rounded-full shadow-sm transition-all duration-300 ease-out opacity-0 will-change-transform`}
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => {
              setInputQuery(e.target.value);
              setIsTyping(true);
            }}
            onFocus={() => {
              setIsTyping(true);
              setAnimation("curious");
            }}
            onBlur={() => setIsTyping(false)}
            placeholder={`Ask about ${sectionLabel}...`}
            className="flex-1 bg-transparent text-[10px] text-neutral-900 placeholder:text-neutral-400 outline-none font-sans"
          />
          {userAsked && (
            <button
              type="button"
              onClick={handleResetThought}
              title="Reset to automated hints"
              className="w-5 h-5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center shrink-0 transition-all cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="w-5 h-5 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs"
            title={`Ask Cubee about ${sectionLabel}`}
          >
            {isLoading ? (
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
            ) : (
              <Send className="w-2.5 h-2.5" />
            )}
          </button>
        </form>
      </div>

      {/* 3. THE 3 TRAILING THOUGHT DOTS */}
      <div className="relative w-full h-7 -mt-1 pointer-events-none z-20">
        {/* Dot 3 (Large) near cloud */}
        <div
          ref={dot3Ref}
          className={`absolute ${
            cloudPosition === "left"
              ? "right-[26px] sm:right-[30px]"
              : "left-[26px] sm:left-[30px]"
          } top-0 w-3 h-3 rounded-full bg-white border-[2px] border-neutral-900 shadow-xs opacity-0 will-change-transform`}
        />

        {/* Dot 2 (Medium) midway */}
        <div
          ref={dot2Ref}
          className={`absolute ${
            cloudPosition === "left"
              ? "right-[18px] sm:right-[21px]"
              : "left-[18px] sm:left-[21px]"
          } top-2.5 w-2.5 h-2.5 rounded-full bg-white border-[1.5px] border-neutral-900 shadow-xs opacity-0 will-change-transform`}
        />

        {/* Dot 1 (Small) near Cubee */}
        <div
          ref={dot1Ref}
          className={`absolute ${
            cloudPosition === "left"
              ? "right-[12px] sm:right-[14px]"
              : "left-[12px] sm:left-[14px]"
          } top-4.5 w-2 h-2 rounded-full bg-white border-[1.5px] border-neutral-900 shadow-xs opacity-0 will-change-transform`}
        />
      </div>

      {/* 4. CUBEE AVATAR */}
      <div
        ref={avatarWrapperRef}
        onClick={handlePoke}
        title="Click to poke Cubee!"
        className={`relative z-20 cursor-pointer group flex flex-col opacity-0 will-change-transform transition-transform hover:scale-105 active:scale-95 ${
          cloudPosition === "left" ? "items-end pr-1 sm:pr-2" : "items-start pl-1 sm:pl-2"
        }`}
      >
        {/* Floating motion wrapper */}
        <div
          ref={avatarFloatRef}
          className="relative flex items-center justify-center min-h-[76px] will-change-transform"
        >
          {isClient ? (
            <Avatar
              definition={cubeeAvatar.definition}
              animation={animation}
              size={76}
              ariaLabel="Cubee avatar mascot"
            />
          ) : (
            <div className="w-[76px] h-[76px]" />
          )}
        </div>

        {/* Floating shadow on the floor */}
        <div
          ref={shadowRef}
          className={`w-14 h-2 rounded-full bg-black/15 blur-xs mt-1 opacity-0 will-change-transform ${
            cloudPosition === "left" ? "mr-2" : "ml-2"
          }`}
        />
      </div>
    </div>
  );
}
