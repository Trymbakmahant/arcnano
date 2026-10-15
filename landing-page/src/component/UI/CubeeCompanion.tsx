"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Avatar } from "@bible-strong/avatar-react";
import "@bible-strong/avatar-react/styles.css";
import type { AvatarDefinition } from "@bible-strong/avatar-core";
import agentAvatarsData from "@/data/agentAvatars.json";
import {
  Sparkles,
  Bot,
  Minimize2,
  Maximize2,
  Send,
  Key,
  Pin,
  PinOff,
  RotateCcw,
  Loader2,
  CheckCircle2,
  HelpCircle,
  MessageCircle,
  X,
  ExternalLink,
} from "lucide-react";
import type { PretextContext } from "@/lib/arcnano-knowledge";

interface AgentAvatarItem {
  id: string;
  name: string;
  definition: AvatarDefinition;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  contextTitle?: string;
  timestamp: number;
}

const avatarsList = agentAvatarsData as unknown as AgentAvatarItem[];
const cubeeAvatar = avatarsList.find((a) => a.name === "Cubee") || avatarsList[0];

const DEFAULT_GREETING =
  "Welcome to ArcNano. Hover over any card on the page to inspect it, or ask any question about the architecture below.";

// Smart suggested questions based on keywords in title/hint
function getSuggestedQuestions(pretext?: PretextContext | null): string[] {
  if (!pretext) {
    return [
      "How does the Playground work?",
      "Why is Arc best for AI agents?",
      "How does ArcNano hide msg.sender?",
      "Where are Docs & Marketplace?",
    ];
  }

  const t = (pretext.title + " " + (pretext.hint || "")).toLowerCase();

  if (t.includes("msg.sender") || t.includes("surveillance") || t.includes("dox") || t.includes("receiver-batched")) {
    return [
      "Why is msg.sender eliminated?",
      "How does batchSpend() settle on Arc?",
      "What is the calldata compression?",
    ];
  }

  if (t.includes("naive zk") || t.includes("signer") || t.includes("transport")) {
    return [
      "How does naive ZK leak the signer?",
      "What is the X-PAYMENT header payload?",
      "Why is off-chain proof delivery better?",
    ];
  }

  if (t.includes("mixer") || t.includes("asp") || t.includes("privacy pool") || t.includes("ofac") || t.includes("sanction")) {
    return [
      "What is an ASP non-membership proof?",
      "How does this comply with OFAC?",
      "Why do traditional mixers fail?",
    ];
  }

  if (t.includes("block time") || t.includes("latency") || t.includes("gas") || t.includes("paymaster") || t.includes("circle")) {
    return [
      "How does Circle Gas Station sponsor fees?",
      "Why is <500ms deterministic finality key?",
      "How do agents pay $0.00 in gas?",
    ];
  }

  if (t.includes("merkle") || t.includes("poseidon") || t.includes("circuit") || t.includes("groth16") || t.includes("snark")) {
    return [
      "What is the 20-level Merkle tree capacity?",
      "Why Poseidon over SHA256?",
      "What is the Groth16 proof size?",
    ];
  }

  if (t.includes("x402") || t.includes("402") || t.includes("http")) {
    return [
      "What is the X402 challenge flow?",
      "How is off-chain verification <8ms?",
      "How does streaming inference work?",
    ];
  }

  return [
    `How does this work in ArcNano?`,
    `What problem does this solve?`,
    `How does Arc Network support this?`,
  ];
}

export default function CubeeCompanion() {
  const [speech, setSpeech] = useState<string>(DEFAULT_GREETING);
  const [animation, setAnimation] = useState<string>("proud");
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Active contextual pretext
  const [activePretext, setActivePretext] = useState<PretextContext | null>(null);

  // Interactive Question & Answer state
  const [inputQuery, setInputQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatExpanded, setIsChatExpanded] = useState<boolean>(false);

  // API Key & Model Configuration
  const [glmApiKey, setGlmApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("glm-4-flash");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [hasServerKey, setHasServerKey] = useState<boolean>(false);

  // Cursor following & Pinning state
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isMouseOverCompanion, setIsMouseOverCompanion] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [isHoveringCard, setIsHoveringCard] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize on client mount
  useEffect(() => {
    setIsClient(true);

    // Load stored GLM key
    const storedKey = localStorage.getItem("cubee_glm_api_key") || "";
    const storedModel = localStorage.getItem("cubee_glm_model") || "glm-4-flash";
    setGlmApiKey(storedKey);
    setSelectedModel(storedModel);

    // Check if server environment has GLM key
    fetch("/api/cubee-agent")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasEnvKey) {
          setHasServerKey(true);
        }
      })
      .catch(() => {});
  }, []);

  // Trigger contextual hint & update animation without moving position
  const triggerHint = useCallback(
    (text: string, anim: string = "proud", pretextInfo?: PretextContext) => {
      setSpeech(text);
      setAnimation(anim);
      setIsHoveringCard(true);

      if (pretextInfo) {
        setActivePretext(pretextInfo);
      }

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = setTimeout(() => {
        setAnimation("idle");
      }, 12000);
    },
    []
  );

  // Global card hover listener
  useEffect(() => {
    if (!isClient) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Ignore if hovering inside Cubee companion itself
      if (containerRef.current?.contains(target)) {
        return;
      }


      // 1. Direct explicit data-cubee-hint or data-card
      const cardEl = target.closest<HTMLElement>(
        '[data-card="true"], [data-cubee-hint], article, [data-cubee-title], .arcnano-card'
      );

      if (cardEl) {
        const hintText = cardEl.getAttribute("data-cubee-hint");
        const titleText =
          cardEl.getAttribute("data-cubee-title") ||
          cardEl.querySelector("h2, h3, h4, .text-base, .font-semibold")?.textContent?.trim() ||
          "Protocol Element";
        const animMood = cardEl.getAttribute("data-cubee-anim") || "proud";

        const pretextObj: PretextContext = {
          title: titleText,
          hint: hintText || undefined,
          description: cardEl.querySelector("p")?.textContent?.trim() || undefined,
        };

        if (hintText) {
          triggerHint(hintText, animMood, pretextObj);
          return;
        } else if (titleText) {
          triggerHint(
            `Inspecting ${titleText}. Ask me anything about how ArcNano implements this!`,
            animMood,
            pretextObj
          );
          return;
        }
      }

      // 2. Specific key links and sections
      const githubLink = target.closest('a[href*="github.com"]');
      if (githubLink) {
        triggerHint(
          "Check our complete open-source codebase on GitHub! Circom circuits, contracts, and Python SDK are all public.",
          "excited",
          { title: "ArcNano GitHub Repository", hint: "github.com/Trymbakmahant/arcnano" }
        );
        return;
      }

      const twitterLink = target.closest('a[href*="x.com"], a[href*="twitter.com"]');
      if (twitterLink) {
        triggerHint(
          "Follow @0xarcnano on X for real-time protocol updates and testnet releases!",
          "playful",
          { title: "X (@0xarcnano)", hint: "Official updates channel" }
        );
        return;
      }

      const flowLink = target.closest('a[href="#blueprint"], a[href*="#blueprint"]');
      if (flowLink) {
        triggerHint(
          "Trace our 6-step autonomous agent payment protocol with Groth16 zero-gas settlement live!",
          "curious",
          { title: "Autonomous A2A Flow", hint: "Interactive 6-step protocol execution flow" }
        );
        return;
      }

      const playgroundLink = target.closest('a[href="/playground"], a[href*="/playground"]');
      if (playgroundLink) {
        triggerHint(
          "Try our Shielded Playground to simulate agent deposit notes, stealth keys, and spend proofs live!",
          "excited",
          { title: "Shielded Playground", hint: "Simulate notes and off-chain proofs live" }
        );
        return;
      }

      // Check text patterns for spec cards
      const text = target.textContent || "";
      if (text.includes("SETTLEMENT LAYER") || (text.includes("Arc Network") && text.includes("Circle"))) {
        triggerHint(
          "Why Arc? Arc L1 is built with Circle for deterministic <500ms finality and native USDC gas paymasters, giving AI agents a zero-volatility economy!",
          "proud",
          { title: "Arc Network (Circle L1)", hint: "Permissioned L1 cohort settlement" }
        );
        return;
      }

      if (text.includes("GAS ENGINE") || text.includes("Circle Gas Station")) {
        triggerHint(
          "Circle's Gas Station Paymaster sponsors all batch settlements on Arc L1! Autonomous agents pay $0.00 in gas fees!",
          "celebrate",
          { title: "Circle Gas Station", hint: "100% sponsored ERC-4337 gas engine" }
        );
        return;
      }

      if (text.includes("SETTLEMENT FINALITY") || text.includes("< 500ms Deterministic")) {
        triggerHint(
          "Deterministic <500ms finality means immediate settlement without volatility risks during streaming inference!",
          "proud",
          { title: "Settlement Finality", hint: "Deterministic sub-second finality" }
        );
        return;
      }

      if (text.includes("PRIVACY MECHANISM") || text.includes("Privacy Pools")) {
        triggerHint(
          "Groth16 ZK-SNARKs + Privacy Pools ASP non-membership: 100% OFAC compliant privacy without dirty mixer pooling!",
          "working",
          { title: "Privacy Mechanism", hint: "Groth16 + Privacy Pools ASP proofs" }
        );
        return;
      }
    };

    window.addEventListener("mouseover", handleMouseOver);
    return () => window.removeEventListener("mouseover", handleMouseOver);
  }, [isClient, triggerHint]);

  // Handle asking questions to the GLM Agent
  const handleAskQuestion = async (queryToAsk?: string) => {
    const q = (queryToAsk || inputQuery).trim();
    if (!q || isLoading) return;

    setInputQuery("");
    setIsLoading(true);
    setIsChatExpanded(true);
    setAnimation("working");

    // Add user message to chat
    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      role: "user",
      content: q,
      contextTitle: activePretext?.title,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/cubee-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          pretext: activePretext,
          history: chatMessages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          clientApiKey: glmApiKey || undefined,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      const replyText =
        data.answer || "I processed your request, but couldn't retrieve a response.";

      const assistantMsg: ChatMessage = {
        id: "a-" + Date.now(),
        role: "assistant",
        content: replyText,
        contextTitle: activePretext?.title,
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
      setSpeech(replyText);
      setAnimation(data.suggestedAnimation || "proud");

      // Auto scroll to bottom
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 50);
    } catch (err) {
      console.error("Ask question error:", err);
      const errorMsg: ChatMessage = {
        id: "a-" + Date.now(),
        role: "assistant",
        content:
          "Encountered a network error reaching the agent. Please check your connection or GLM API key.",
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
      setAnimation("confused");
    } finally {
      setIsLoading(false);
    }
  };

  // Poke Cubee for fun
  const handlePokeCubee = () => {
    const pokeMoods = [
      { text: "Tap acknowledged. Standing by as your off-chain settlement daemon.", anim: "celebrate" },
      { text: "Poseidon nullifier verified in RAM in under 8ms.", anim: "working" },
      { text: "Zero msg.sender leaked. Autonomous agent identity is mathematically decoupled.", anim: "proud" },
      { text: "Micro-receipts aggregated with 99.1% calldata compression on Arc.", anim: "excited" },
      { text: "Circle Gas Station sponsors Layer 1 settlement with $0.00 gas fees.", anim: "playful" },
      { text: "ArcNano architecture index loaded. Ask any technical question below.", anim: "thinking" },
    ];
    const pick = pokeMoods[Math.floor(Math.random() * pokeMoods.length)];
    triggerHint(pick.text, pick.anim);
  };

  // Save GLM Key
  const handleSaveSettings = (newKey: string, newModel: string) => {
    setGlmApiKey(newKey);
    setSelectedModel(newModel);
    localStorage.setItem("cubee_glm_api_key", newKey.trim());
    localStorage.setItem("cubee_glm_model", newModel);
    setShowSettings(false);
    triggerHint(
      newKey.trim()
        ? "GLM API Key saved! I am now connected with live GLM-4 reasoning!"
        : "Using ArcNano local knowledge base engine.",
      "proud"
    );
  };

  const suggestedQuestions = getSuggestedQuestions(activePretext);

  if (!isClient) return null;

  return (
    <aside
      ref={containerRef}
      aria-label="Cubee Protocol Companion"
      className="fixed bottom-5 right-5 z-40 pointer-events-auto select-none"
    >
      {/* EXPANDED CUBEE WIDGET */}
      {!isMinimized ? (
        <div className="flex flex-col items-end gap-2 max-w-[360px] sm:max-w-[390px] drop-shadow-2xl">
          {/* MAIN COMPANION CARD */}
          <div className="w-full bg-white/95 backdrop-blur-2xl border border-neutral-300/95 rounded-2xl p-3.5 shadow-2xl shadow-black/15 text-neutral-900 relative transition-all duration-300">
            {/* CARD HEADER */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80 gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-neutral-900 font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate">Cubee // AI Companion</span>
                {hasServerKey || glmApiKey ? (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-mono border border-emerald-300">
                    GLM-4
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-mono border border-amber-300">
                    Local KB
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Pin Button */}
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isPinned
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                  }`}
                  title={isPinned ? "Unpin (Follow cursor on hover)" : "Pin companion in place"}
                >
                  {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>

                {/* Settings / GLM Key Button */}
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    showSettings || glmApiKey
                      ? "text-sky-600 bg-sky-50 hover:bg-sky-100"
                      : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                  }`}
                  title="Configure GLM API Key"
                >
                  <Key className="w-3.5 h-3.5" />
                </button>

                {/* Minimize Button */}
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  title="Minimize Cubee"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* PRETEXT TARGET BANNER (When hovering a specific card) */}
            {activePretext?.title && (
              <div className="mt-2 px-2.5 py-1 rounded-lg bg-neutral-100/90 border border-neutral-200/90 flex items-center justify-between text-[11px] font-mono text-neutral-700">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-semibold text-neutral-900 truncate">
                    Target: {activePretext.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePretext(null)}
                  className="text-neutral-400 hover:text-neutral-700 ml-1 cursor-pointer shrink-0"
                  title="Clear targeted context"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* SPEECH / PRIMARY ADVICE CONTENT */}
            {!isChatExpanded && (
              <div className="mt-2.5">
                <p className="text-xs sm:text-[13px] font-medium text-neutral-800 leading-relaxed font-sans line-clamp-4">
                  {speech}
                </p>
              </div>
            )}

            {/* CHAT MESSAGES THREAD (When expanded) */}
            {isChatExpanded && (
              <div
                ref={chatScrollRef}
                className="mt-2.5 max-h-[220px] overflow-y-auto space-y-2.5 pr-1 text-xs font-sans scrollbar-thin scrollbar-thumb-neutral-300"
              >
                {chatMessages.length === 0 ? (
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-neutral-700 leading-relaxed">
                    <p className="font-medium">{speech}</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-neutral-950 text-white ml-6 shadow-sm"
                          : "bg-neutral-100 text-neutral-900 mr-2 border border-neutral-200/90"
                      }`}
                    >
                      {msg.contextTitle && msg.role === "user" && (
                        <div className="text-[10px] text-amber-300 font-mono mb-1 truncate">
                          [{msg.contextTitle}]
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-100 text-neutral-600 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    <span>Cubee is analyzing with GLM-4...</span>
                  </div>
                )}
              </div>
            )}

            {/* SUGGESTED PRETEXT PROMPTS */}
            <div className="mt-2.5 pt-2 border-t border-neutral-200/70">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1.5">
                <span>Suggested Questions</span>
                {chatMessages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setChatMessages([]);
                      setIsChatExpanded(false);
                      setSpeech(DEFAULT_GREETING);
                    }}
                    className="text-neutral-400 hover:text-neutral-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[58px] overflow-hidden">
                {suggestedQuestions.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAskQuestion(prompt)}
                    disabled={isLoading}
                    className="text-left text-[11px] font-medium px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200/90 text-neutral-800 border border-neutral-200/80 transition-all truncate max-w-full cursor-pointer hover:border-neutral-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* INTERACTIVE QUESTION INPUT BOX */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion();
              }}
              className="mt-2.5 flex items-center gap-1.5"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onFocus={() => {
                  setIsInputFocused(true);
                  setIsChatExpanded(true);
                }}
                onBlur={() => setIsInputFocused(false)}
                placeholder={
                  activePretext?.title
                    ? `Ask Cubee about ${activePretext.title.slice(0, 18)}...`
                    : "Ask Cubee about ArcNano..."
                }
                className="flex-1 bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white text-xs font-sans text-neutral-900 border border-neutral-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-2 rounded-xl bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md cursor-pointer shrink-0"
                title="Send query to Cubee"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>

            {/* SETTINGS POPUP (GLM API KEY CONFIGURATION) */}
            {showSettings && (
              <div className="mt-3 p-3 bg-neutral-900 text-white rounded-xl text-xs space-y-2 border border-neutral-700 shadow-xl animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-amber-400">
                    <Key className="w-3.5 h-3.5" />
                    <span>GLM API Key Setup</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                  Enter your Zhipu AI GLM API key (or configure{" "}
                  <code className="text-amber-300 font-mono text-[10px]">GLM_API_KEY</code> in{" "}
                  <code className="text-amber-300 font-mono text-[10px]">.env.local</code>):
                </p>
                <input
                  type="password"
                  value={glmApiKey}
                  onChange={(e) => setGlmApiKey(e.target.value)}
                  placeholder="Paste GLM API Key here..."
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-400"
                />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-mono text-neutral-400">Model:</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="bg-neutral-800 text-[10px] font-mono text-white rounded px-1.5 py-0.5 border border-neutral-700"
                    >
                      <option value="glm-4-flash">glm-4-flash (Fast)</option>
                      <option value="glm-4">glm-4 (Deep)</option>
                      <option value="glm-4-plus">glm-4-plus</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveSettings(glmApiKey, selectedModel)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CUBEE AVATAR CONTAINER */}
          <div
            onClick={handlePokeCubee}
            title="Click to poke Cubee!"
            className="flex items-center gap-2 group cursor-pointer"
          >
            {/* Action pill tag */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950/90 backdrop-blur-md text-white text-[10px] font-mono shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              <span>Tap Cubee</span>
              {isPinned && <span className="text-amber-400 font-bold">• Pinned</span>}
            </div>

            {/* Avatar Canvas */}
            <div className="relative w-[95px] h-[95px] sm:w-[105px] sm:h-[105px] flex items-center justify-center rounded-2xl bg-white/80 hover:bg-white backdrop-blur-xl border border-neutral-300/90 shadow-2xl transition-all duration-200 group-hover:scale-105 active:scale-95">
              {/* Soft glow */}
              <div className="absolute inset-0 rounded-2xl bg-rose-500/10 blur-xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-center">
                <Avatar
                  definition={cubeeAvatar.definition}
                  animation={animation}
                  size={90}
                  ariaLabel="Cubee procedural avatar companion"
                />
              </div>

              {/* Mood indicator badge */}
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-neutral-950 text-white text-[8px] font-mono uppercase tracking-wider shadow-sm border border-white/40">
                {animation}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* MINIMIZED FLOATING BADGE */
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-950 text-white text-xs font-mono shadow-2xl hover:bg-neutral-800 transition-all hover:scale-105 cursor-pointer border border-neutral-700"
          title="Open Cubee Assistant"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Bot className="w-4 h-4 text-amber-400" />
          <span>Cubee AI Companion</span>
          {activePretext?.title && (
            <span className="max-w-[100px] truncate text-amber-300 font-sans text-[10px]">
              ({activePretext.title})
            </span>
          )}
        </button>
      )}
    </aside>
  );
}
