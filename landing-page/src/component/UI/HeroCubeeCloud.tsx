"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Avatar } from "@bible-strong/avatar-react";
import "@bible-strong/avatar-react/styles.css";
import type { AvatarDefinition } from "@bible-strong/avatar-core";
import agentAvatarsData from "@/data/agentAvatars.json";
import { Send, Loader2 } from "lucide-react";

interface AgentAvatarItem {
  id: string;
  name: string;
  definition: AvatarDefinition;
}

const avatarsList = agentAvatarsData as unknown as AgentAvatarItem[];
const cubeeAvatar = avatarsList.find((a) => a.name === "Cubee") || avatarsList[0];

const DEFAULT_HERO_THOUGHTS = [
  "Zero msg.sender on Arc! Your AI agent identity is 100% shielded 🛡️",
  "Circle Gas Station sponsors batch settlement! Agents pay $0.00 gas! ⚡",
  "Deterministic <500ms finality means streaming LLM never stalls! 🚀",
  "Groth16 ZK-SNARKs + Privacy Pools ASP: clean OFAC compliance! 🔒",
  "Poseidon Merkle Vault holds 1M+ shielded notes in a 64-root ring! 🌲",
  "Autonomous AI agents need machine micropayments. X402 is instant! 🤖",
  "Click me or type below to test my GLM-4 ArcNano knowledge! 💭",
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

// Framer Motion Animation Variants for the Idea Cloud sequence
const dot1Variants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 450,
      damping: 15,
      delay: 0.12,
    },
  },
};

const dot2Variants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 450,
      damping: 15,
      delay: 0.25,
    },
  },
};

const dot3Variants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 450,
      damping: 15,
      delay: 0.38,
    },
  },
};

const cloudVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18,
      mass: 0.8,
      delay: 0.52,
    },
  },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.78,
      ease: "easeOut",
    },
  },
};

const inputVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.88,
      ease: "easeOut",
    },
  },
};

const avatarVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 20,
      delay: 0.05,
    },
  },
};

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

  // In-view detection: auto-starts when visible in viewport
  const [isInView, setIsInView] = useState<boolean>(false);
  const [pokeCount, setPokeCount] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

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
      // If triggerSelector is provided (e.g. bottom of Blueprint card), observe that element
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
      // Retry once after a brief delay if DOM node wasn't ready
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

  // Poking Cubee triggers mood and cloud bounce
  const handlePoke = () => {
    const pokeMoods = [
      { text: "Hey! Tap received! 👋 I'm your off-chain companion!", anim: "celebrate" },
      { text: "Proving Poseidon nullifier in RAM... sub-8ms verification verified! 🤖", anim: "working" },
      { text: "Zero msg.sender leaked! Your autonomous agent identity is 100% shielded.", anim: "proud" },
      { text: "100 micro-receipts batched with 99.1% calldata compression on Arc!", anim: "excited" },
      { text: "Circle Gas Station sponsors our L1 settlement completely: $0.00 gas fees!", anim: "playful" },
    ];
    const pick = pokeMoods[Math.floor(Math.random() * pokeMoods.length)];
    setUserAsked(true);
    setSpeechText(pick.text);
    setAnimation(pick.anim);
    setPokeCount((prev) => prev + 1);
  };

  // If explicitly disabled via prop, hide
  if (!isActive) return null;

  return (
    <motion.div
      ref={containerRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`relative flex flex-col select-none min-h-[190px] ${
        cloudPosition === "left" ? "items-end" : "items-start"
      } ${className}`}
    >
      {/* TELEPORTATION PORTAL GLOW & WARP AURA */}
      <AnimatePresence>
        {isInView && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
            <motion.div
              key={`warp-${pokeCount}`}
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 2.1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className={`absolute -bottom-4 ${
                cloudPosition === "left" ? "right-4" : "left-4"
              } w-24 h-24 rounded-full border-2 border-cyan-400 bg-cyan-400/20 blur-sm`}
            />
            <motion.div
              key={`amber-warp-${pokeCount}`}
              initial={{ scale: 0, opacity: 0.7 }}
              animate={{ scale: 1.7, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
              className={`absolute -bottom-2 ${
                cloudPosition === "left" ? "right-6" : "left-6"
              } w-20 h-20 rounded-full border border-amber-400 bg-amber-400/15 blur-xs`}
            />
          </div>
        )}
      </AnimatePresence>

      {/* TOP: IDEA CLOUD + OUTSIDE INPUT BOX */}
      <div
        className={`relative ${
          cloudPosition === "left" ? "pr-3 sm:pr-4" : "pl-3 sm:pl-4"
        } flex flex-col items-center`}
      >
        {/* 1. SCALLOPED THOUGHT CLOUD */}
        <motion.div
          variants={cloudVariants}
          style={{
            transformOrigin: cloudPosition === "left" ? "bottom right" : "bottom left",
          }}
          className="relative w-[225px] sm:w-[235px] h-[122px] drop-shadow-md"
        >
          {/* Subtle poke bounce reaction wrapper */}
          <motion.div
            key={`cloud-bounce-${pokeCount}`}
            animate={pokeCount > 0 ? { scale: [1, 1.06, 0.98, 1] } : undefined}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full h-full relative"
          >
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

            {/* ALL TEXT IS 100% INSIDE THE CLOUD (Centered with ample padding) */}
            <motion.div
              variants={textVariants}
              className="relative z-10 w-full h-full flex items-center justify-center px-6 py-4 text-center"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={speechText}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="text-[10.5px] sm:text-[11px] font-medium text-neutral-900 leading-snug font-sans select-text line-clamp-3"
                >
                  {speechText}
                </motion.p>
              </AnimatePresence>

              {isLoading && (
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[9px] text-amber-600 font-mono">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  <span>Proving with GLM-4...</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 2. INPUT BOX IN BOTTOM OF CLOUD OUTSIDE OF IT */}
        <motion.form
          variants={inputVariants}
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="mt-1.5 w-[205px] sm:w-[218px] flex items-center gap-1 bg-white border border-neutral-300 hover:border-neutral-900 focus-within:border-neutral-950 focus-within:ring-1 focus-within:ring-neutral-900/15 px-2.5 py-1 rounded-full shadow-sm transition-all"
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
        </motion.form>
      </div>

      {/* 3. THE 3 TRAILING THOUGHT DOTS */}
      <div className="relative w-full h-7 -mt-1 pointer-events-none z-20">
        {/* Dot 3 (Large) near cloud */}
        <motion.div
          variants={dot3Variants}
          className={`absolute ${
            cloudPosition === "left"
              ? "right-[26px] sm:right-[30px]"
              : "left-[26px] sm:left-[30px]"
          } top-0 w-3 h-3 rounded-full bg-white border-[2px] border-neutral-900 shadow-xs`}
        />

        {/* Dot 2 (Medium) midway */}
        <motion.div
          variants={dot2Variants}
          className={`absolute ${
            cloudPosition === "left"
              ? "right-[18px] sm:right-[21px]"
              : "left-[18px] sm:left-[21px]"
          } top-2.5 w-2.5 h-2.5 rounded-full bg-white border-[1.5px] border-neutral-900 shadow-xs`}
        />

        {/* Dot 1 (Small) near Cubee */}
        <motion.div
          variants={dot1Variants}
          className={`absolute ${
            cloudPosition === "left"
              ? "right-[12px] sm:right-[14px]"
              : "left-[12px] sm:left-[14px]"
          } top-4.5 w-2 h-2 rounded-full bg-white border-[1.5px] border-neutral-900 shadow-xs`}
        />
      </div>

      {/* 4. CUBEE AVATAR */}
      <motion.div
        variants={avatarVariants}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={handlePoke}
        title="Click to poke Cubee!"
        className={`relative z-20 cursor-pointer group flex flex-col ${
          cloudPosition === "left" ? "items-end pr-1 sm:pr-2" : "items-start pl-1 sm:pl-2"
        }`}
      >
        {/* Floating motion wrapper */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex items-center justify-center min-h-[76px]"
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
        </motion.div>

        {/* Floating shadow on the floor */}
        <div className={`w-14 h-2 rounded-full bg-black/15 blur-xs mt-1 ${
          cloudPosition === "left" ? "mr-2" : "ml-2"
        } transition-transform duration-300 group-hover:scale-90`} />
      </motion.div>
    </motion.div>
  );
}
