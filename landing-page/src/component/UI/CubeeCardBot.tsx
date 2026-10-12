"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@bible-strong/avatar-react";
import "@bible-strong/avatar-react/styles.css";
import type { AvatarDefinition } from "@bible-strong/avatar-core";
import agentAvatarsData from "@/data/agentAvatars.json";
import {
  Bot,
  Send,
  Key,
  RotateCcw,
  Loader2,
  X,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Smile,
  Zap,
} from "lucide-react";
import type { PretextContext } from "@/lib/arcnano-knowledge";

interface AgentAvatarItem {
  id: string;
  name: string;
  definition: AvatarDefinition;
}

export interface CardBotItem {
  id: string;
  tabLabel: string;
  title: string;
  hint: string;
  suggestedQuestions?: string[];
  anim?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface CubeeCardBotProps {
  badge?: string;
  theme?: "light" | "dark";
  items?: CardBotItem[];
  defaultTitle?: string;
  defaultHint?: string;
  defaultQuestions?: string[];
  defaultAnim?: string;
  className?: string;
}

const avatarsList = agentAvatarsData as unknown as AgentAvatarItem[];
const cubeeAvatar = avatarsList.find((a) => a.name === "Cubee") || avatarsList[0];

export default function CubeeCardBot({
  badge = "Cubee // Interactive Mascot",
  theme = "light",
  items,
  defaultTitle = "Protocol Context",
  defaultHint = "Ask me anything about how ArcNano implements this feature!",
  defaultQuestions = [
    "How does this prevent frontrunning?",
    "Why does Arc Network solve this?",
    "What is the cryptographic proof here?",
  ],
  defaultAnim = "proud",
  className = "",
}: CubeeCardBotProps) {
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const activeItem = items && items.length > 0 ? items[activeItemIndex] : null;

  const currentTitle = activeItem ? activeItem.title : defaultTitle;
  const currentHint = activeItem ? activeItem.hint : defaultHint;
  const currentQuestions = activeItem?.suggestedQuestions || defaultQuestions;

  // Mascot animation & speech states (inspired by Bible Strong Avatar Lab form reactions)
  const [animation, setAnimation] = useState<string>("sleeping");
  const [mascotStatus, setMascotStatus] = useState<string>("Asleep");
  const [speech, setSpeech] = useState<string>(currentHint);
  const [isAwake, setIsAwake] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [inputError, setInputError] = useState<boolean>(false);

  // Q&A state
  const [inputQuery, setInputQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [glmApiKey, setGlmApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("glm-4-flash");
  const [isClient, setIsClient] = useState<boolean>(false);

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
    const storedKey = localStorage.getItem("cubee_glm_api_key") || "";
    const storedModel = localStorage.getItem("cubee_glm_model") || "glm-4-flash";
    setGlmApiKey(storedKey);
    setSelectedModel(storedModel);
  }, []);

  // When card scrolls into view: Wake up sequence (sleeping -> waking -> proud)
  const handleViewportEnter = () => {
    if (!isAwake) {
      setAnimation("waking");
      setMascotStatus("Waking up...");
      setTimeout(() => {
        setIsAwake(true);
        setAnimation(activeItem?.anim || defaultAnim || "proud");
        setMascotStatus("Awake & Ready");
      }, 700);
    }
  };

  // Synchronize when tabs/items change
  useEffect(() => {
    if (isAwake) {
      setSpeech(currentHint);
      setAnimation(activeItem?.anim || "proud");
      setMascotStatus("Listening");
      setChatMessages([]);
    }
  }, [activeItemIndex, currentHint, activeItem, isAwake]);

  // Real-time input typing reaction
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputQuery(text);
    setInputError(false);

    if (!isAwake) {
      setIsAwake(true);
    }

    setIsTyping(true);
    setAnimation("working");
    setMascotStatus("Watching you type...");

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      if (text.trim().endsWith("?")) {
        setAnimation("curious");
        setMascotStatus("Curious!");
      } else if (text.length > 0) {
        setAnimation("thinking");
        setMascotStatus("Thinking...");
      } else {
        setAnimation("proud");
        setMascotStatus("Awake & Ready");
      }
    }, 600);
  };

  // Real-time input focus reaction
  const handleInputFocus = () => {
    setIsInputFocused(true);
    if (!isAwake) {
      setIsAwake(true);
    }
    setAnimation("curious");
    setMascotStatus("Listening carefully");
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    if (!isLoading && chatMessages.length === 0) {
      setAnimation(inputQuery.trim() ? "thinking" : "proud");
      setMascotStatus("Ready");
    }
  };

  // Submit Question to GLM Agent
  const handleAsk = async (queryToAsk?: string) => {
    const q = (queryToAsk || inputQuery).trim();

    if (!q) {
      // Trigger error reaction like in Saksham's video!
      setInputError(true);
      setAnimation("confused");
      setMascotStatus("Question missing!");
      setSpeech("Whoops! Type a question first, or pick one of the quick prompts below!");
      setTimeout(() => setInputError(false), 1200);
      return;
    }

    if (isLoading) return;

    setInputQuery("");
    setIsLoading(true);
    setAnimation("working");
    setMascotStatus("Proving with GLM-4...");

    const userMsg: ChatMessage = {
      id: "u-" + Date.now(),
      role: "user",
      content: q,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, userMsg]);

    const pretextObj: PretextContext = {
      title: currentTitle,
      hint: currentHint,
    };

    try {
      const res = await fetch("/api/cubee-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          pretext: pretextObj,
          history: chatMessages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          clientApiKey: glmApiKey || undefined,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      const reply =
        data.answer || "I processed your request, but couldn't retrieve an answer.";

      const assistantMsg: ChatMessage = {
        id: "a-" + Date.now(),
        role: "assistant",
        content: reply,
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
      setSpeech(reply);

      // Celebration reaction on success!
      setAnimation("celebrate");
      setMascotStatus("Success");

      setTimeout(() => {
        setAnimation("proud");
        setMascotStatus("Answer Ready");
      }, 4000);

      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 50);
    } catch (err) {
      console.error("Ask Cubee error:", err);
      const errorMsg: ChatMessage = {
        id: "a-" + Date.now(),
        role: "assistant",
        content: "Error reaching agent. Using built-in ArcNano knowledge base.",
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
      setAnimation("scared");
      setMascotStatus("Network glitch");
    } finally {
      setIsLoading(false);
    }
  };

  // Poke mascot interaction
  const handlePoke = () => {
    const pokeMoods = [
      { text: "Tap acknowledged. Standing by as your off-chain settlement daemon.", anim: "celebrate", status: "Active" },
      { text: "Poseidon nullifier verified in RAM in under 8ms.", anim: "working", status: "Proving in RAM" },
      { text: "Zero msg.sender leaked. Autonomous agent identity is completely shielded.", anim: "proud", status: "Shielded" },
      { text: "Micro-receipts aggregated with 99.1% calldata compression on Arc.", anim: "excited", status: "Aggregating" },
    ];
    const pick = pokeMoods[Math.floor(Math.random() * pokeMoods.length)];
    setSpeech(pick.text);
    setAnimation(pick.anim);
    setMascotStatus(pick.status);
  };

  const isDark = theme === "dark";

  if (!isClient) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      onViewportEnter={handleViewportEnter}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`relative w-full transition-all duration-300 pt-14 sm:pt-16 ${className}`}
    >
      {/* 1. PERCHED MASCOT STAGE (Sitting right on the top edge of the card, looking down at input) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 sm:-translate-y-6 z-30 flex flex-col items-center">
        {/* Mascot Avatar Orb */}
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={handlePoke}
          title="Click to poke Cubee!"
          className={`relative w-[96px] h-[96px] sm:w-[110px] sm:h-[110px] rounded-3xl flex items-center justify-center cursor-pointer shadow-2xl transition-all duration-200 border-2 ${
            isDark
              ? "bg-[#0B0F19] border-white/20 shadow-rose-500/10"
              : "bg-white border-neutral-300/90 shadow-black/15"
          }`}
        >
          {/* Ambient Glow */}
          <div
            className={`absolute inset-0 rounded-3xl blur-xl pointer-events-none transition-opacity ${
              animation === "celebrate"
                ? "bg-emerald-500/30 opacity-100"
                : animation === "working"
                ? "bg-amber-500/25 opacity-100"
                : isDark
                ? "bg-rose-500/15 opacity-80"
                : "bg-amber-500/15 opacity-80"
            }`}
          />

          {/* Procedural Avatar Canvas */}
          <div className="relative z-10 flex items-center justify-center">
            <Avatar
              definition={cubeeAvatar.definition}
              animation={animation}
              size={90}
              ariaLabel="Cubee interactive mascot"
            />
          </div>

          {/* Real-time Status Badge */}
          <span
            className={`absolute -bottom-2 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold tracking-wider uppercase shadow-md border whitespace-nowrap transition-colors ${
              animation === "celebrate"
                ? "bg-emerald-600 text-white border-emerald-400"
                : animation === "working"
                ? "bg-amber-500 text-neutral-950 border-amber-300"
                : isDark
                ? "bg-neutral-900 text-neutral-200 border-white/20"
                : "bg-neutral-950 text-white border-neutral-700"
            }`}
          >
            {mascotStatus}
          </span>
        </motion.div>
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div
        className={`w-full rounded-3xl overflow-hidden border transition-all duration-300 shadow-2xl pt-10 sm:pt-12 ${
          isDark
            ? "bg-[#0A0D17]/95 backdrop-blur-2xl border-white/10 text-white"
            : "bg-white/95 backdrop-blur-2xl border-neutral-200/90 text-neutral-900"
        }`}
      >
        {/* CARD TOP BAR */}
        <div
          className={`px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b ${
            isDark ? "border-white/10 bg-black/25" : "border-neutral-200/70 bg-neutral-50/70"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-amber-500">
              {badge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
                showSettings
                  ? "bg-amber-500 text-neutral-950 font-semibold"
                  : isDark
                  ? "text-neutral-400 hover:text-white hover:bg-white/10 border border-white/10"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200"
              }`}
              title="Configure GLM API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="text-[10px]">GLM Settings</span>
            </button>

            {chatMessages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setChatMessages([]);
                  setSpeech(currentHint);
                  setAnimation("proud");
                  setMascotStatus("Ready");
                }}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  isDark
                    ? "text-neutral-400 hover:text-white hover:bg-white/10"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* CONTEXT TABS (If multiple phases/traps are provided) */}
        {items && items.length > 1 && (
          <div
            className={`px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto border-b scrollbar-none ${
              isDark ? "border-white/10 bg-black/15" : "border-neutral-200/60 bg-neutral-100/50"
            }`}
          >
            {items.map((item, idx) => {
              const isSelected = activeItemIndex === idx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveItemIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? isDark
                        ? "bg-white text-neutral-950 font-semibold shadow-md scale-102"
                        : "bg-neutral-950 text-white font-semibold shadow-md scale-102"
                      : isDark
                      ? "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
                      : "bg-white text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 border border-neutral-200/80"
                  }`}
                >
                  <span>{item.tabLabel}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 3. INTERACTIVE CHAT & INPUT BODY */}
        <div className="p-4 sm:p-6 flex flex-col gap-4">
          {/* Active Context Banner */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold">
                Target:
              </span>
              <span className={`font-semibold truncate ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                {currentTitle}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono hidden sm:inline ${
                isDark ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              Ask questions directly below
            </span>
          </div>

          {/* DYNAMIC SPEECH / CHAT RESPONSE BUBBLE */}
          <div
            ref={chatScrollRef}
            className={`relative p-4 rounded-2xl border max-h-[190px] overflow-y-auto space-y-2.5 text-xs sm:text-[13px] leading-relaxed transition-all shadow-inner ${
              isDark
                ? "bg-black/35 border-white/10 text-neutral-200 scrollbar-thumb-neutral-700"
                : "bg-neutral-50/90 border-neutral-200/80 text-neutral-800 scrollbar-thumb-neutral-300"
            }`}
          >
            {chatMessages.length === 0 ? (
              <p className="font-medium font-sans leading-relaxed text-sm">
                {speech}
              </p>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? isDark
                        ? "bg-white/15 text-white ml-8 border border-white/20 shadow-sm"
                        : "bg-neutral-950 text-white ml-8 shadow-sm"
                      : isDark
                      ? "bg-black/50 text-neutral-200 mr-2 border border-white/10"
                      : "bg-white text-neutral-900 mr-2 border border-neutral-200/90"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2 p-2 rounded-xl text-xs text-amber-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Cubee is querying GLM-4 with ArcNano book knowledge...</span>
              </div>
            )}
          </div>

          {/* SUGGESTED PROMPTS PILLS */}
          <div>
            <div className={`text-[10px] font-mono uppercase tracking-wider mb-2 ${
              isDark ? "text-neutral-400" : "text-neutral-500"
            }`}>
              Click to ask Cubee:
            </div>
            <div className="flex flex-wrap gap-2">
              {currentQuestions.slice(0, 3).map((prompt, qIdx) => (
                <button
                  key={qIdx}
                  type="button"
                  onClick={() => handleAsk(prompt)}
                  disabled={isLoading}
                  className={`text-left text-[11px] font-medium px-3 py-1.5 rounded-xl border transition-all cursor-pointer truncate max-w-full hover:scale-101 ${
                    isDark
                      ? "bg-white/5 hover:bg-white/10 text-neutral-200 border-white/10 hover:border-white/25"
                      : "bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-200/90 hover:border-neutral-300"
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* 4. REACTIVE FORM INPUT (Directly reacts to cursor, focus & typing!) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={`Ask Cubee about ${currentTitle}...`}
                className={`w-full rounded-2xl px-4 py-3 text-xs sm:text-sm font-sans outline-none border transition-all shadow-sm ${
                  inputError
                    ? "border-rose-500 ring-2 ring-rose-500/20"
                    : isInputFocused
                    ? "border-amber-500 ring-2 ring-amber-500/20"
                    : isDark
                    ? "bg-black/40 border-white/15 text-white placeholder-neutral-500"
                    : "bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 hover:border-neutral-400"
                }`}
              />

              {/* Typing indicator pulse */}
              {isTyping && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-amber-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>typing...</span>
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`p-3 rounded-2xl font-semibold transition-all shadow-md cursor-pointer shrink-0 flex items-center justify-center ${
                isDark
                  ? "bg-amber-500 hover:bg-amber-400 text-neutral-950 disabled:opacity-40"
                  : "bg-neutral-950 hover:bg-neutral-800 text-white disabled:opacity-40"
              }`}
              title="Send question to Cubee"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>

        {/* 5. GLM KEY CONFIGURATION DRAWER */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`border-t px-4 sm:px-6 py-4 text-xs ${
                isDark ? "bg-black/50 border-white/10" : "bg-neutral-100/90 border-neutral-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-semibold text-amber-500 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Configure GLM API Key</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className={`text-[11px] mb-2 leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-600"}`}>
                Enter your Zhipu AI GLM key here or set{" "}
                <code className="text-amber-500 font-mono text-[10px]">GLM_API_KEY</code> in{" "}
                <code className="text-amber-500 font-mono text-[10px]">.env.local</code>. Cubee will use live GLM-4 inference with complete ArcNano knowledge!
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="password"
                  value={glmApiKey}
                  onChange={(e) => setGlmApiKey(e.target.value)}
                  placeholder="Paste GLM API Key here..."
                  className={`flex-1 rounded-xl px-3.5 py-2 text-xs outline-none border ${
                    isDark
                      ? "bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500"
                      : "bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400"
                  }`}
                />
                <div className="flex items-center gap-2">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className={`rounded-xl px-2.5 py-2 text-xs font-mono border ${
                      isDark
                        ? "bg-neutral-900 border-neutral-700 text-white"
                        : "bg-white border-neutral-300 text-neutral-900"
                    }`}
                  >
                    <option value="glm-4-flash">glm-4-flash (Fast)</option>
                    <option value="glm-4">glm-4 (Deep)</option>
                    <option value="glm-4-plus">glm-4-plus</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem("cubee_glm_api_key", glmApiKey.trim());
                      localStorage.setItem("cubee_glm_model", selectedModel);
                      setShowSettings(false);
                      setSpeech(
                        glmApiKey.trim()
                          ? "GLM API Key saved! I am now connected with live GLM-4 reasoning!"
                          : "Using built-in ArcNano knowledge base engine."
                      );
                      setAnimation("celebrate");
                      setMascotStatus("Key Saved");
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition-colors cursor-pointer shrink-0"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
