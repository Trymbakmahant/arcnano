"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Avatar } from "@bible-strong/avatar-react";
import "@bible-strong/avatar-react/styles.css";
import type { AvatarDefinition } from "@bible-strong/avatar-core";
import agentAvatarsData from "@/data/agentAvatars.json";
import CornerTicks from "./CornerTicks";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Terminal,
  Activity,
  Bot,
  Play,
  RotateCcw,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface AgentPersona {
  role: string;
  badge: string;
  speech: string;
}

interface AgentAvatarItem {
  id: string;
  name: string;
  persona: AgentPersona;
  definition: AvatarDefinition;
}

const avatarsList = agentAvatarsData as unknown as AgentAvatarItem[];

// Highlighted moods for quick interaction
const QUICK_ANIMATIONS = [
  { key: "idle", label: "Idle" },
  { key: "proud", label: "Proud" },
  { key: "thinking", label: "Thinking" },
  { key: "working", label: "Working" },
  { key: "excited", label: "Excited" },
  { key: "listening", label: "Listening" },
  { key: "sleeping", label: "Sleeping" },
  { key: "celebrate", label: "Celebrate" },
];

export default function AgentAvatarStudio() {
  // Start with Cloudee as default active avatar
  const defaultIndex = avatarsList.findIndex((a) => a.name === "Cloudee");
  const [selectedIdx, setSelectedIdx] = useState<number>(defaultIndex >= 0 ? defaultIndex : 0);
  const [currentAnimation, setCurrentAnimation] = useState<string>("proud");
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [speechText, setSpeechText] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);

  const activeAgent = avatarsList[selectedIdx] || avatarsList[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update speech text on avatar change
  useEffect(() => {
    if (activeAgent) {
      setSpeechText(activeAgent.persona.speech);
      setPaymentSuccess(false);
    }
  }, [activeAgent]);

  // Simulate private micropayment inference transaction
  const handleTriggerPayment = useCallback(() => {
    if (isPaying) return;
    setIsPaying(true);
    setCurrentAnimation("working");
    setSpeechText("Synthesizing Halo2 Groth16 witness & generating Poseidon nullifier...");

    setTimeout(() => {
      setCurrentAnimation("celebrate");
      setIsPaying(false);
      setPaymentSuccess(true);
      setSpeechText(
        `Sub-8ms off-chain verification PASS! Paid 0.0012 USDC. Received 4,096 LLM tokens with zero msg.sender on Arc.`
      );
    }, 1100);
  }, [isPaying]);

  const handlePokeAvatar = () => {
    const moods = ["excited", "proud", "surprised", "celebrate", "playful"];
    const nextMood = moods[Math.floor(Math.random() * moods.length)];
    setCurrentAnimation(nextMood);
  };

  if (!mounted) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center bg-white border border-neutral-200">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          <span>Loading Autonomous Agent Studio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-neutral-200/90 shadow-sm relative group">
      {/* Corner Blueprint Ticks */}
      <CornerTicks activeColor="text-amber-500" />

      {/* STUDIO HEADER */}
      <div className="p-4 sm:p-6 border-b border-neutral-200/80 bg-neutral-50/50 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 font-bold">
              Autonomous Agent Persona Engine
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200/60 text-neutral-700 border border-neutral-300">
              Procedural 3D SVG
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 flex items-center gap-2">
            <span>Meet the ArcNano Swarm Agents</span>
            <Bot className="w-5 h-5 text-amber-600" />
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl">
            Autonomous AI agents operating without on-chain surveillance. Each agent holds private note commitments and pays for inference per-token in &lt;8ms.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTriggerPayment}
            disabled={isPaying}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-mono font-medium shadow-sm transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
          >
            {isPaying ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isPaying ? "Proving Groth16..." : "Simulate Private Inference"}</span>
          </button>
        </div>
      </div>

      {/* AVATAR SELECTOR STRIP */}
      <div className="border-b border-neutral-200/80 bg-white px-4 sm:px-6 py-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mr-1">
            Agents:
          </span>
          {avatarsList.map((item, idx) => {
            const isSelected = selectedIdx === idx;
            const primaryColor = item.definition.colors.body || "#5b7fe5";
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedIdx(idx);
                  setCurrentAnimation("proud");
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-neutral-950 text-white border-neutral-950 shadow-xs font-bold ring-2 ring-amber-400/50"
                    : "bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 border-neutral-200"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/60 shrink-0"
                  style={{ backgroundColor: primaryColor }}
                />
                <span>{item.name}</span>
                {isSelected && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-semibold">
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN INTERACTIVE STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200/80">
        {/* LEFT / CENTER: PROCEDURAL AVATAR VIEWPORT (7 COLS) */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col items-center justify-between relative bg-gradient-to-b from-[#F8FAFC] to-white min-h-[460px]">
          {/* Top Status & Agent Role Badge */}
          <div className="w-full flex items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/25 text-amber-800 text-[10px] font-mono font-bold uppercase">
                {activeAgent.persona.badge}
              </span>
              <span className="text-xs font-mono text-neutral-500">
                {activeAgent.persona.role}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
              <Activity className="w-3 h-3 text-emerald-500" />
              <span>OFF-CHAIN P2P</span>
            </div>
          </div>

          {/* DYNAMIC SPEECH BUBBLE */}
          <div className="my-3 max-w-md w-full relative z-10 transition-all duration-300">
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-3.5 shadow-sm relative group hover:border-amber-300 transition-colors">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    {activeAgent.name}&apos;s Live Signal
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-800 font-medium leading-relaxed">
                    &ldquo;{speechText}&rdquo;
                  </p>
                </div>
              </div>

              {/* Triangle Tail */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-neutral-200/90 rotate-45" />
            </div>
          </div>

          {/* THE 3D PROCEDURAL AVATAR CANVAS */}
          <div
            onClick={handlePokeAvatar}
            title="Click to interact with avatar!"
            className="relative my-2 py-1 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 group/avatar"
          >
            {/* Luminous aura behind avatar */}
            <div
              className="absolute w-40 h-40 rounded-full blur-2xl opacity-40 transition-colors pointer-events-none"
              style={{ backgroundColor: activeAgent.definition.colors.body || "#5b7fe5" }}
            />

            {/* Procedural Avatar Renderer */}
            <div className="relative z-10 drop-shadow-md flex items-center justify-center">
              <Avatar
                definition={activeAgent.definition}
                animation={currentAnimation}
                size={180}
                ariaLabel={`${activeAgent.name} procedural avatar`}
              />
            </div>

            {/* Subtle click cue */}
            <div className="absolute -bottom-1 bg-neutral-950/80 backdrop-blur-sm text-white text-[9px] font-mono px-2.5 py-0.5 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none">
              Tap to Poke
            </div>
          </div>

          {/* QUICK MOOD CONTROLLER PILLS */}
          <div className="w-full z-10 mt-2">
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider text-center mb-2">
              Expression / Animation State
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {QUICK_ANIMATIONS.map((anim) => {
                const isActive = currentAnimation === anim.key;
                return (
                  <button
                    key={anim.key}
                    onClick={() => setCurrentAnimation(anim.key)}
                    className={`px-3 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-neutral-900 text-white shadow-xs font-bold"
                        : "bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200"
                    }`}
                  >
                    {anim.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: CRYPTOGRAPHIC AGENT TELEMETRY & SPECS (5 COLS) */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-neutral-50/40 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-600" />
                <span>Agent Off-Chain Telemetry</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 font-semibold">
                SYNCED
              </span>
            </div>

            {/* Telemetry Metric Cards */}
            <div className="space-y-2.5">
              <div className="p-3 bg-white border border-neutral-200/90 rounded-lg flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-xs font-mono text-neutral-600">Privacy Mode</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                  Zero msg.sender Leak
                </span>
              </div>

              <div className="p-3 bg-white border border-neutral-200/90 rounded-lg flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-xs font-mono text-neutral-600">Prover Circuit</span>
                </div>
                <span className="text-xs font-mono font-bold text-neutral-900">
                  Halo2 Groth16 (BN254)
                </span>
              </div>

              <div className="p-3 bg-white border border-neutral-200/90 rounded-lg flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-xs font-mono text-neutral-600">ASP Compliance</span>
                </div>
                <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80">
                  OFAC Clean Set PASS
                </span>
              </div>

              <div className="p-3 bg-white border border-neutral-200/90 rounded-lg flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-xs font-mono text-neutral-600">Off-Chain Latency</span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                  &lt; 7.2 ms Local
                </span>
              </div>

              <div className="p-3 bg-white border border-neutral-200/90 rounded-lg flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-xs font-mono text-neutral-600">Gas Sponsorship</span>
                </div>
                <span className="text-xs font-mono font-bold text-neutral-900">
                  Circle Gas Station ($0.00)
                </span>
              </div>
            </div>

            {/* Status Message Container */}
            {paymentSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs font-mono space-y-1 animate-in fade-in duration-300">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>X402 Settlement Validated</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Receipt enqueued into buffer. 4,096 tokens unlocked in 6.8ms.
                </p>
              </div>
            )}
          </div>

          {/* Quick Architecture Note */}
          <div className="pt-4 border-t border-neutral-200/80 text-[11px] font-mono text-neutral-500 leading-relaxed">
            Procedural avatars rendered dynamically via <code className="text-neutral-800">@bible-strong/avatar-react</code>. Fully reactive to agent state, inference stream events, and payment receipts.
          </div>
        </div>
      </div>
    </div>
  );
}
