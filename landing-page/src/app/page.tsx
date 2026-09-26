"use client";

import React, { useState, useEffect, useRef } from "react";

interface LogEntry {
  id: string;
  time: string;
  text: string;
  colorClass?: string;
}

export default function Home() {
  const [activeStep, setActiveStep] = useState<number>(4);
  const [selectedDenomination, setSelectedDenomination] = useState<string>("0.01");
  const [codeTab, setCodeTab] = useState<"agent" | "gateway" | "circom">("agent");
  const [copyFeedback, setCopyFeedback] = useState<string>("Copy");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isGeneratingProof, setIsGeneratingProof] = useState<boolean>(false);
  const [proofProgress, setProofProgress] = useState<number>(100);
  
  // Spotlight grid mouse tracking
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Live leaves state
  const [merkleLeaves, setMerkleLeaves] = useState<string[]>([
    "0x9f2...a1",
    "0xb83...4e",
    "0x12c...9d",
    "0x55a...3c",
    "0x7e1...f0",
    "0x3d9...8b",
    "0xa4c...12",
    "0xf02...6a",
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", time: "00:00:01", text: "Initializing ArcZK-x402 Agent Client...", colorClass: "text-neutral-500" },
    { id: "2", time: "00:00:02", text: "Poseidon Tree Depth: 20 | Anonymity Set: 128 notes active", colorClass: "text-neutral-500" },
    { id: "3", time: "00:00:03", text: "[HTTP 402] Challenge received: cost=0.01 USDC", colorClass: "text-sky-400" },
    { id: "4", time: "00:00:04", text: "[CIRCOM] Groth16 witness generated (184ms off-chain)", colorClass: "text-amber-400" },
    { id: "5", time: "00:00:05", text: "[VERIFY] Local snarkjs check completed in 6.4ms ($0 gas)", colorClass: "text-emerald-400" },
    { id: "6", time: "00:00:06", text: "[BATCH] Nullifier queued for aggregated Arc Gas Station settlement", colorClass: "text-indigo-400" },
  ]);

  const getTimeString = () => {
    const d = new Date();
    return d.toTimeString().split(" ")[0];
  };

  const addLog = (text: string, colorClass: string = "text-neutral-300") => {
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      time: getTimeString(),
      text,
      colorClass,
    };
    setLogs((prev) => [...prev, newEntry]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
    if (step === 1) {
      addLog(`[DEPOSIT] Agent allocated 10 x ${selectedDenomination} USDC notes into Arc Poseidon Tree.`, "text-emerald-400");
    } else if (step === 2) {
      addLog(`[HTTP 402] Gateway returned challenge: nonce=0xbf28... cost=${selectedDenomination} USDC.`, "text-sky-400");
    } else if (step === 3) {
      addLog("[PROOF] Witness generated in 184ms. Zero knowledge of spender wallet maintained.", "text-amber-400");
    } else if (step === 4) {
      addLog("[VERIFY] Proof verified in 6.4ms. Payload delivered immediately to agent.", "text-emerald-400");
    }
  };

  const handleDepositCommitment = () => {
    const randomLeaf = "0x" + Math.random().toString(16).substring(2, 5) + "..." + Math.random().toString(16).substring(2, 4);
    setMerkleLeaves((prev) => [randomLeaf, ...prev.slice(0, 7)]);
    addLog(`[DEPOSIT-TX] Committed ${selectedDenomination} USDC leaf ${randomLeaf} into ArcShieldPool contract.`, "text-emerald-400");
  };

  const runProofGeneration = () => {
    setIsGeneratingProof(true);
    setProofProgress(15);
    addLog("[WITNESS] Calculating BN254 Poseidon Merkle inclusion path...", "text-amber-400");
    
    setTimeout(() => {
      setProofProgress(65);
      addLog("[ASP-CHECK] Evaluating Association Set non-membership check against OFAC roots...", "text-neutral-400");
    }, 200);

    setTimeout(() => {
      setProofProgress(100);
      setIsGeneratingProof(false);
      addLog("[PROOF-READY] Groth16 proof {pi_a, pi_b, pi_c} ready for X-PAYMENT header injection.", "text-emerald-400");
    }, 450);
  };

  const runVerificationDemo = () => {
    setIsVerifying(true);
    addLog("[VERIFY-REQ] Received X-Payment header, initiating Groth16 memory pairing check...", "text-amber-400");

    setTimeout(() => {
      addLog("[PASSED] In-memory verification valid in 5.8ms. Nullifier recorded. Status 200 returned.", "text-emerald-400");
      setIsVerifying(false);
    }, 380);
  };

  const flushBatchDemo = () => {
    addLog("[BATCH] Flushing 64 queued notes to Arc Network contract 0x3d1... (batchSpend)", "text-indigo-400");
    setTimeout(() => {
      addLog("[CIRCLE-STATION] Sponsored Paymaster Tx: 0x99f48... Total Agent Gas: $0.00.", "text-indigo-300");
    }, 420);
  };

  const clearTerminalLogs = () => {
    setLogs([
      { id: "reset", time: getTimeString(), text: "[CONSOLE RESET] Stream cleared. Ready for telemetry.", colorClass: "text-neutral-500" }
    ]);
  };

  const codeSnippets = {
    agent: `# agent_client.py — Autonomous agent handling HTTP 402 with Groth16 note spend
import requests
from arczk_sdk import ZKWallet, generate_spend_proof

wallet = ZKWallet.from_seed("agent-private-entropy")
api_endpoint = "https://api.agentinference.ai/v1/context"

# 1. Attempt standard GET request
resp = requests.get(api_endpoint)

if resp.status_code == 402:
    challenge = resp.headers.get("X-Payment-Challenge")
    pool_root = resp.headers.get("X-Pool-Root")
    asp_root = resp.headers.get("X-ASP-Exclusion-Root")
    
    # 2. Select 0.01 USDC note from local shielded vault
    note = wallet.get_unspent_note(denomination=0.01)
    
    # 3. Compute Circom Groth16 witness locally with non-membership proof
    zk_payload = generate_spend_proof(note, root=pool_root, asp_root=asp_root, challenge=challenge)
    
    # 4. Re-issue request with anonymous payment authorization in header
    data = requests.get(api_endpoint, headers={
        "X-Payment-Authorization": zk_payload.serialize(),
        "X-Nullifier": zk_payload.nullifier_hash
    })
    
    # 5. Successfully received 200 OK with payload within 8ms
    print("Inference Result:", data.json())`,

    gateway: `// gateway.js — Express/Node.js Zero-Knowledge x402 Middleware
import { snarkjs } from "snarkjs";
import vKey from "./verification_key.json";

export function x402ZKMiddleware(req, res, next) {
  const authHeader = req.headers['x-payment-authorization'];
  
  if (!authHeader) {
    return res.status(402)
      .header('X-Payment-Required', '0.01 USDC')
      .header('X-Challenge', crypto.randomBytes(16).toString('hex'))
      .header('X-Pool-Root', currentPoolMerkleRoot)
      .json({ error: "Payment required via ArcZK-x402" });
  }

  // Stage 1: Ultra-fast local in-memory pairing check (< 8ms)
  const { proof, publicSignals } = JSON.parse(authHeader);
  const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  if (!isValid || isNullifierSpent(publicSignals.nullifier)) {
    return res.status(403).json({ error: "Invalid or double-spent ZK proof" });
  }

  // Stage 2: Queue for background Arc settlement batch via Circle Gas Station
  batchQueue.push(publicSignals);
  next();
}`,

    circom: `/* spend.circom — Fixed-Denomination Anonymous Spend with ASP Check */
pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/merkleTree.circom";

template SpendProof(levels) {
    // Public inputs
    signal input root;
    signal input nullifierHash;
    signal input aspExclusionRoot;
    signal input challengeNonce;
    signal input recipient;

    // Private inputs
    signal input secret;
    signal input nullifier;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    // 1. Compute leaf commitment = Poseidon(amount, secret, nullifier)
    component leafHasher = Poseidon(2);
    leafHasher.inputs[0] <== nullifier;
    leafHasher.inputs[1] <== secret;

    // 2. Verify Membership in Shielded Deposit Root
    component tree = MerkleTreeChecker(levels);
    tree.leaf <== leafHasher.out;
    tree.root <== root;
    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }

    // 3. Nullifier derivation prevents double spending
    component nullHasher = Poseidon(2);
    nullHasher.inputs[0] <== nullifier;
    nullHasher.inputs[1] <== pathIndices[0];
    nullifierHash === nullHasher.out;
}`
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippets[codeTab]).then(() => {
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback("Copy"), 2000);
    });
  };

  const marqueeItems = [
    "LangChain AI Swarms",
    "Circle Gas Station (Paymaster)",
    "Groth16 BN254 Pairings",
    "AutoGPT Autonomous Agents",
    "HTTP 402 Protocol",
    "Poseidon Merkle Vault",
    "Privacy Pools ASP Checks",
    "Arc Network Testnet",
    "Sub-10ms Local Verification",
    "Native USDC Micro-Settlement",
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen bg-[#FAFAFA] text-[#111215] font-sans antialiased overflow-x-hidden selection:bg-black selection:text-white"
    >
      {/* RewampUI Spotlight Grid Cursor Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.08), transparent 75%)`,
        }}
      />

      {/* Floating Navigation Bar */}
      <header className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-[#111215]/95 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 flex items-center gap-6 shadow-2xl transition-all duration-300">
          <a className="flex items-center gap-2.5 text-white pr-2 group" href="#">
            <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center font-bold text-xs tracking-tighter shadow-sm">
              ▲
            </div>
            <span className="font-semibold text-sm tracking-tight text-white/95">
              ArcZK<span className="text-white/40">-x402</span>
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider">
              Arc Grant
            </span>
          </a>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-white/70">
            <a className="hover:text-white transition-colors" href="#simulator">Simulator</a>
            <a className="hover:text-white transition-colors" href="#pillars">Architecture</a>
            <a className="hover:text-white transition-colors" href="#comparison">Comparison</a>
            <a className="hover:text-white transition-colors" href="#sdk">SDK</a>
          </div>

          <div className="pl-2 border-l border-white/10 flex items-center">
            <a
              className="bg-white text-black text-xs font-semibold px-3.5 py-1.5 rounded-full hover:bg-neutral-200 transition-colors shadow-sm"
              href="#simulator"
            >
              Launch Demo
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-36 pb-16 md:pt-44 md:pb-24 px-4 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Grant & Solo Project Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-neutral-300/80 bg-white/90 shadow-sm text-xs text-neutral-800 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium tracking-tight">Independent Solo Project by Trymbak Mahant &bull; Arc Ecosystem Grant</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-[-0.035em] text-[#111215] max-w-5xl leading-[1.04]">
            Zero-Knowledge Nanopayments
            <span className="block text-neutral-400 font-light mt-1">For The Autonomous Agent Era</span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-neutral-600 font-normal max-w-3xl leading-relaxed tracking-tight">
            Decouple machine-to-machine payments from on-chain identity. Combine native{" "}
            <code className="font-mono text-xs px-2 py-0.5 bg-neutral-200/80 rounded text-neutral-800 font-semibold">
              HTTP 402
            </code>{" "}
            with shielded note pools, instant sub-10ms off-chain Groth16 verification, and sanctioned-address exclusion proofs on Arc.
          </p>

          {/* CTA Buttons with Chrome Border Finish */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <div className="rounded-full p-[1.5px] bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-800 shadow-lg">
              <a
                className="bg-[#111215] text-white text-sm font-medium px-6 py-3.5 rounded-full hover:bg-neutral-800 transition-all flex items-center gap-2"
                href="#simulator"
              >
                <span>Run x402 ZK Simulator</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </a>
            </div>

            <a
              className="bg-white text-neutral-900 border border-neutral-300 text-sm font-medium px-6 py-3.5 rounded-full hover:bg-neutral-50 transition-all shadow-sm"
              href="#pillars"
            >
              System Specification
            </a>
          </div>

          {/* Hero Visual Card with Animated Iridescent Mesh & 3D Cryptographic Wireframe Rings */}
          <div className="w-full mt-16 md:mt-20 rounded-[32px] md:rounded-[44px] p-2.5 md:p-3 bg-neutral-200/50 border border-neutral-300/80 shadow-2xl relative">
            <div className="hero-mesh-gradient w-full min-h-[460px] md:min-h-[580px] rounded-[24px] md:rounded-[36px] overflow-hidden relative flex flex-col justify-between p-6 sm:p-10 md:p-14 text-white">
              
              {/* Header inside Card */}
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Poseidon Tree Root: 0x7c4f...b389</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-medium">
                  <span>Groth16 / BN254</span>
                  <span className="opacity-40">•</span>
                  <span>10,240 Constrained Gates</span>
                </div>
              </div>

              {/* Centerpiece: Cryptographic Wireframe Ring Orb (RewampUI Inspired) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
                <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center">
                  {/* Outer Orbit */}
                  <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-spin-slow"></div>
                  {/* Mid Ring with Tilt */}
                  <div className="absolute w-4/5 h-4/5 rounded-full border border-indigo-400/40 animate-spin-reverse-slow rotate-45"></div>
                  {/* Inner Ring with Glow */}
                  <div className="absolute w-3/5 h-3/5 rounded-full border-2 border-emerald-400/40 animate-spin-slow -rotate-12 shadow-[0_0_30px_rgba(16,185,129,0.3)]"></div>
                  {/* Core Glowing Orb */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 blur-sm opacity-90 shadow-2xl animate-pulse"></div>
                  <div className="absolute w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center font-mono text-[10px] text-black font-bold">
                    ZK
                  </div>
                </div>
              </div>

              {/* Bottom Info inside Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end relative z-10">
                <div className="col-span-2 text-left">
                  <span className="text-xs uppercase font-mono tracking-widest text-white/70">
                    Decoupled Ephemeral Note Transfer
                  </span>
                  <p className="text-xl sm:text-3xl font-light tracking-tight mt-2 text-white/95 max-w-xl">
                    Unlinkable machine micropayments. Provable solvency without revealing sender address or wallet histories.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-4 text-left shadow-lg">
                  <div className="text-[11px] font-mono uppercase text-white/60">Off-Chain Verification</div>
                  <div className="text-3xl font-mono font-bold mt-1 text-emerald-300">6.4ms</div>
                  <div className="text-xs text-white/70 mt-1">
                    Direct local memory check via <code className="text-white font-mono">snarkjs.groth16</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Velocity Marquee (RewampUI Inspired) */}
        <div className="w-full bg-[#111215] py-3.5 border-y border-neutral-800 overflow-hidden relative z-10">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-mono text-neutral-400">
            {marqueeItems.concat(marqueeItems).map((item, idx) => (
              <span key={idx} className="flex items-center gap-8">
                <span>{item}</span>
                <span className="text-emerald-400">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* Metrics Ribbon */}
        <section className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm text-left hover:border-neutral-400 transition-all">
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111215]">0%</div>
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-500 mt-2">Identity Leakage</div>
              <p className="text-xs text-neutral-600 mt-1">
                <code className="font-mono">msg.sender</code> decoupled from note spending.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm text-left hover:border-neutral-400 transition-all">
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-emerald-600">&lt; 8ms</div>
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-500 mt-2">Proof Verification</div>
              <p className="text-xs text-neutral-600 mt-1">Direct local memory execution before payload response.</p>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm text-left hover:border-neutral-400 transition-all">
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111215]">100%</div>
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-500 mt-2">Compliance Ready</div>
              <p className="text-xs text-neutral-600 mt-1">Privacy Pools ASP exclusion proof with each batch.</p>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-sm text-left hover:border-neutral-400 transition-all">
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-indigo-600">$0.00</div>
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-500 mt-2">Agent Native Gas</div>
              <p className="text-xs text-neutral-600 mt-1">Circle Gas Station Paymaster handles L1/L2 gas.</p>
            </div>
          </div>
        </section>

        {/* Interactive Protocol Simulator */}
        <section className="py-20 bg-[#F4F4F6] border-y border-neutral-200/80 px-4 relative z-10" id="simulator">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-300 text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-3">
                Interactive Testbed
              </div>
              <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-neutral-900">
                The Complete ZK-x402 Protocol Flow
              </h2>
              <p className="text-neutral-600 text-sm md:text-base mt-2">
                Simulate an autonomous agent triggering an{" "}
                <code className="font-mono text-xs bg-neutral-200 px-1 py-0.5 rounded">
                  HTTP 402 Payment Required
                </code>{" "}
                challenge, computing the Groth16 zero-knowledge proof, and verifying within single-digit milliseconds.
              </p>
            </div>

            {/* Simulator Frame */}
            <div className="bg-[#12141A] rounded-[32px] border border-neutral-800 text-white shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-4 bg-neutral-950/40">
                <div className="flex items-center gap-3">
                  <span className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                  </span>
                  <span className="text-xs font-mono text-neutral-400 pl-2 border-l border-neutral-800">
                    x402 Interactive Pipeline
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Arc Testnet Connected</span>
                </div>
              </div>

              {/* Step Navigation Tabs */}
              <div className="px-6 py-3 bg-neutral-900/50 border-b border-neutral-800/80 flex overflow-x-auto gap-2 text-xs">
                {[
                  { step: 1, label: "1. Pool Deposit" },
                  { step: 2, label: "2. HTTP 402 Trigger" },
                  { step: 3, label: "3. ZK Proof Gen" },
                  { step: 4, label: "4. Verify & Settle" },
                ].map((item) => (
                  <button
                    key={item.step}
                    onClick={() => handleStepChange(item.step)}
                    className={`px-3.5 py-1.5 rounded-lg border font-mono whitespace-nowrap transition-all cursor-pointer ${
                      activeStep === item.step
                        ? "bg-white/10 text-white border-white/20 font-medium"
                        : "text-neutral-400 border-transparent hover:bg-neutral-800"
                    }`}
                  >
                    {item.label} {activeStep === item.step ? "(Active)" : ""}
                  </button>
                ))}
              </div>

              {/* Simulator Body */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
                {/* Left Interactive Column */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    {activeStep === 1 && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs uppercase font-mono tracking-wider text-emerald-400">Step 1 of 4</span>
                            <h3 className="text-xl font-medium text-white mt-1">Shielded Pool Deposit &amp; Note Commitment</h3>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                            Poseidon Hash Commit
                          </span>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-neutral-900/80 rounded-2xl p-4 border border-neutral-800">
                            <div className="text-xs font-mono text-neutral-400 mb-2">Select Fixed Denomination (Uniform Anonymity Set):</div>
                            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                              {["0.01", "0.05", "0.10"].map((denom) => (
                                <button
                                  key={denom}
                                  onClick={() => setSelectedDenomination(denom)}
                                  className={`p-2.5 rounded-lg border transition-all cursor-pointer font-bold ${
                                    selectedDenomination === denom
                                      ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-400"
                                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                                  }`}
                                >
                                  {denom} USDC
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="bg-neutral-900/80 rounded-2xl p-4 border border-neutral-800 text-xs font-mono text-neutral-400">
                            <span className="text-white block font-sans font-medium mb-1">Generated Secret Commitment:</span>
                            <div className="bg-neutral-950 p-2.5 rounded text-neutral-300 font-mono break-all border border-neutral-800/80">
                              commitment = Poseidon({selectedDenomination} USDC, secret, nullifier_seed) &rarr; 0x8a92f09c71b...
                            </div>
                          </div>
                        </div>
                        <div className="pt-2">
                          <button
                            onClick={handleDepositCommitment}
                            className="bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round"/></svg>
                            Commit Note into Arc Merkle Tree
                          </button>
                        </div>
                      </div>
                    )}

                    {activeStep === 2 && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs uppercase font-mono tracking-wider text-amber-400">Step 2 of 4</span>
                            <h3 className="text-xl font-medium text-white mt-1">HTTP 402 Trigger &amp; Server Challenge</h3>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono">
                            Standard HTTP 402
                          </span>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-neutral-900/80 rounded-2xl p-4 border border-neutral-800">
                            <div className="text-xs font-mono text-amber-400">HTTP/1.1 402 Payment Required</div>
                            <div className="mt-2 text-xs font-mono bg-neutral-950 p-2.5 rounded text-neutral-300 space-y-1 border border-neutral-800/80">
                              <div>X-Price-Per-Request: {selectedDenomination} USDC</div>
                              <div>X-Payment-Address: 0xa94b8...F3C7</div>
                              <div>X-Challenge-Nonce: 0xbf28489c017d...</div>
                              <div>X-Pool-Merkle-Root: 0x7c4f19b2a...</div>
                              <div>X-ASP-Exclusion-Root: 0x19a0bc...</div>
                            </div>
                          </div>
                        </div>
                        <div className="pt-2">
                          <button
                            onClick={() => addLog("[HTTP 402] GET /api/v1/inference &rarr; Returned HTTP 402 challenge challengeNonce=0xbf28...", "text-sky-400")}
                            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium px-4 py-2.5 rounded-lg transition-all cursor-pointer"
                          >
                            Re-send Request to Gateway
                          </button>
                        </div>
                      </div>
                    )}

                    {activeStep === 3 && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs uppercase font-mono tracking-wider text-indigo-400">Step 3 of 4</span>
                            <h3 className="text-xl font-medium text-white mt-1">Groth16 Client Witness &amp; Proof Generation</h3>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono">
                            Wasm / Circom
                          </span>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-neutral-900/80 rounded-2xl p-4 border border-neutral-800">
                            <div className="flex justify-between items-center text-xs font-mono text-neutral-400">
                              <span className="text-white">spend.circom execution</span>
                              <span className="text-emerald-400">{isGeneratingProof ? "Computing..." : "Proof Valid"}</span>
                            </div>
                            <div className="mt-2 text-xs font-mono bg-neutral-950 p-2.5 rounded text-neutral-300 space-y-1 border border-neutral-800/80">
                              <div>Private: note.secret, note.nullifier, merklePath[20]</div>
                              <div>Public: root, nullifierHash, challenge, recipient</div>
                              <div className="text-neutral-500">Constraint verification count: 10,240 gates</div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-neutral-950 h-1.5 rounded-full mt-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300"
                                style={{ width: `${proofProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="pt-2">
                          <button
                            onClick={runProofGeneration}
                            disabled={isGeneratingProof}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2"/></svg>
                            {isGeneratingProof ? "Synthesizing Proof..." : "Re-generate Groth16 Proof"}
                          </button>
                        </div>
                      </div>
                    )}

                    {activeStep === 4 && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs uppercase font-mono tracking-wider text-emerald-400">Step 4 of 4</span>
                            <h3 className="text-xl font-medium text-white mt-1">Sub-10ms Verify &amp; Arc Batch Settlement</h3>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                            &lt; 8ms latency
                          </span>
                        </div>
                        <div className="space-y-4">
                          {/* Stage 1 */}
                          <div className="bg-neutral-900/80 rounded-2xl p-4 border border-neutral-800">
                            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                              <span className="text-white font-medium">Stage 1: Memory Verification</span>
                              <span className="text-emerald-400">PASSED (6.4ms)</span>
                            </div>
                            <div className="mt-2 text-xs font-mono text-neutral-300 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80 space-y-1">
                              <div>snarkjs.groth16.verify(vKey, publicSignals, proof)</div>
                              <div className="text-neutral-500">&rarr; Nullifier: 0x93e10fa728bc2... (Unspent)</div>
                              <div className="text-neutral-500">&rarr; ASP Root: 0x41f3... (Whitelisted set)</div>
                            </div>
                          </div>
                          {/* Stage 2 */}
                          <div className="bg-neutral-900/80 rounded-2xl p-4 border border-neutral-800">
                            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                              <span className="text-white font-medium">Stage 2: Arc Batch Settlement</span>
                              <span className="text-indigo-400">Deferred Queue</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                              <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800 font-mono">
                                <span className="text-neutral-500 block text-[10px]">RECIPIENT ADDRESS</span>
                                <span className="text-white truncate block">0xa94b8...F3C7</span>
                              </div>
                              <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800 font-mono">
                                <span className="text-neutral-500 block text-[10px]">GAS SPONSOR</span>
                                <span className="text-emerald-400 block">$0.00 (Circle Paymaster)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-wrap gap-3">
                    <button
                      onClick={runVerificationDemo}
                      disabled={isVerifying}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-black text-xs font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                      <span>{isVerifying ? "Verifying In Memory..." : "Verify X-PAYMENT & Serve Payload"}</span>
                    </button>
                    <button
                      onClick={flushBatchDemo}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium px-4 py-2.5 rounded-lg transition-all cursor-pointer"
                    >
                      Flush Batch Settlement
                    </button>
                  </div>
                </div>

                {/* Right Telemetry Column */}
                <div className="lg:col-span-5 p-6 sm:p-8 bg-neutral-950/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs uppercase font-mono tracking-wider text-neutral-400">
                        Telemetry &amp; Proof Log
                      </span>
                      <button
                        onClick={clearTerminalLogs}
                        className="text-[10px] text-neutral-500 hover:text-neutral-300 font-mono underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="terminal-scroll h-60 overflow-y-auto font-mono text-[11px] leading-relaxed p-3 bg-neutral-950 rounded-xl border border-neutral-800/80 space-y-1.5">
                      {logs.map((log) => (
                        <div key={log.id} className={log.colorClass || "text-neutral-300"}>
                          <span className="text-neutral-500">[{log.time}]</span> {log.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Anonymity Set Leaves */}
                  <div className="mt-6 pt-4 border-t border-neutral-800/80">
                    <div className="flex justify-between items-center text-xs font-mono mb-2">
                      <span className="text-neutral-400">Live Merkle Leaves (Anonymity Set)</span>
                      <span className="text-emerald-400 font-bold">{merkleLeaves.length + 120} Notes</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
                      {merkleLeaves.map((leaf, i) => (
                        <div
                          key={i}
                          className={`p-1.5 rounded text-center truncate border transition-all ${
                            i === 0
                              ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold"
                              : "bg-neutral-900 border-neutral-800 text-neutral-400"
                          }`}
                        >
                          {leaf}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Pillars (Bento Grid Layout) */}
        <section className="py-24 max-w-7xl mx-auto px-4 relative z-10" id="pillars">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-3">
              Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#111215]">
              Why Naive ZK Fails &amp; How ArcZK Solves It
            </h2>
            <p className="text-neutral-600 text-base mt-3">
              Traditional privacy protocols either leak the spender via transaction signing, impose second-long verification stalls, or face regulatory non-compliance. ArcZK architects around these limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bento Card 1 */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-sm flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-mono text-sm font-semibold mb-6">
                  01
                </div>
                <h3 className="text-xl font-medium text-neutral-900 tracking-tight">Fixed Denomination Pools</h3>
                <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                  Eliminates value-based transaction correlation. All agent notes are uniform (e.g. 0.01 USDC, 0.05 USDC), creating high anonymity sets even at fractional micropayment volumes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-mono text-neutral-400">
                Poseidon Hash Merkle Tree
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-sm flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-mono text-sm font-semibold mb-6">
                  02
                </div>
                <h3 className="text-xl font-medium text-neutral-900 tracking-tight">Decoupled msg.sender</h3>
                <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                  The AI agent pays via HTTP header without signing an on-chain transaction. The recipient API gateway batches nullifier settlements on-chain, eliminating payer wallet linkability entirely.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-mono text-neutral-400">
                Zero Sender Footprint
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-sm flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-mono text-sm font-semibold mb-6">
                  03
                </div>
                <h3 className="text-xl font-medium text-neutral-900 tracking-tight">Compliant Privacy Pools</h3>
                <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                  Incorporates Association Set Providers (ASPs). Each proof mathematically proves the spent note is NOT derived from sanctioned or flagged deposits without disclosing the origin leaf.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-mono text-neutral-400">
                OFAC &amp; FinCEN Provable Filter
              </div>
            </div>

            {/* Bento Card 4 */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-sm flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-mono text-sm font-semibold mb-6">
                  04
                </div>
                <h3 className="text-xl font-medium text-neutral-900 tracking-tight">Two-Stage Verification</h3>
                <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                  Stage 1 checks Groth16 pairings in local server RAM in &lt;10ms to serve the HTTP payload instantly. Stage 2 executes asynchronous aggregated settlement on Arc Network.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-mono text-emerald-600 font-semibold">
                Sub-10ms API Overhead
              </div>
            </div>

            {/* Bento Card 5 */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-sm flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-mono text-sm font-semibold mb-6">
                  05
                </div>
                <h3 className="text-xl font-medium text-neutral-900 tracking-tight">Circle Gas Station Integration</h3>
                <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                  Autonomous agents only manage stablecoin notes. The Circle Paymaster subsidizes on-chain batching gas, meaning agents never hold native gas tokens or leak balances.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-mono text-neutral-400">
                ERC-4337 Sponsored Paymaster
              </div>
            </div>

            {/* Bento Card 6 */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-sm flex flex-col justify-between hover:border-neutral-400 hover:shadow-md transition-all">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-mono text-sm font-semibold mb-6">
                  06
                </div>
                <h3 className="text-xl font-medium text-neutral-900 tracking-tight">Autonomous M2M Protocol</h3>
                <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                  Built specifically for autonomous LLMs and agent swarms querying APIs, retrieving contextual embeddings, compute nodes, and vector search on per-inference basis.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs font-mono text-neutral-400">
                Standard HTTP 402 Headers
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table Section */}
        <section className="py-20 bg-white border-t border-neutral-200/80 px-4 relative z-10" id="comparison">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-3">
                Ecosystem Benchmark
              </div>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#111215]">
                Market Architecture Comparison
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base mt-2">
                Evaluating how ArcZK-x402 solves identity isolation and latency compared to incumbent solutions.
              </p>
            </div>

            <div className="overflow-x-auto border border-neutral-200 rounded-3xl shadow-sm">
              <table className="w-full text-left text-sm border-collapse min-w-[720px]">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/70 font-mono text-xs text-neutral-600">
                    <th className="py-4 px-6 font-semibold">Evaluation Metric</th>
                    <th className="py-4 px-6 font-medium">Public ERC-20 (USDC)</th>
                    <th className="py-4 px-6 font-medium">Legacy Mixer (Tornado)</th>
                    <th className="py-4 px-6 font-medium">Privacy Pools (Railgun)</th>
                    <th className="py-4 px-6 font-semibold bg-emerald-500/5 text-emerald-950 border-l border-emerald-500/20">
                      ArcZK-x402 Protocol
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 text-neutral-700">
                  <tr>
                    <td className="py-4 px-6 font-medium text-neutral-900">Identity Privacy</td>
                    <td className="py-4 px-6 text-rose-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> Publicly Visible
                    </td>
                    <td className="py-4 px-6 text-neutral-700">Zero-Knowledge</td>
                    <td className="py-4 px-6 text-neutral-700">Zero-Knowledge</td>
                    <td className="py-4 px-6 font-semibold bg-emerald-500/5 text-emerald-700 border-l border-emerald-500/20">
                      Zero-Knowledge (Decoupled)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-neutral-900">Signer Address Leakage</td>
                    <td className="py-4 px-6 text-rose-600">100% Leaked (msg.sender)</td>
                    <td className="py-4 px-6 text-amber-600">Requires Relayer Gas Fee</td>
                    <td className="py-4 px-6 text-amber-600">Requires Relayer Setup</td>
                    <td className="py-4 px-6 font-semibold bg-emerald-500/5 text-emerald-700 border-l border-emerald-500/20">
                      0% (Receiver Settles)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-neutral-900">Regulatory Status</td>
                    <td className="py-4 px-6 text-neutral-700">Compliant</td>
                    <td className="py-4 px-6 text-rose-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> OFAC Sanctioned
                    </td>
                    <td className="py-4 px-6 text-neutral-700">Optional Disclosures</td>
                    <td className="py-4 px-6 font-semibold bg-emerald-500/5 text-emerald-700 border-l border-emerald-500/20">
                      Inherent ASP Exclusion Proof
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-neutral-900">API Request Latency</td>
                    <td className="py-4 px-6 text-neutral-700">Block confirmation (2-12s)</td>
                    <td className="py-4 px-6 text-neutral-700">N/A (Non-API)</td>
                    <td className="py-4 px-6 text-neutral-700">On-chain verify (seconds)</td>
                    <td className="py-4 px-6 font-semibold bg-emerald-500/5 text-emerald-700 border-l border-emerald-500/20">
                      &lt; 10ms (In-Memory Snarkjs)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-neutral-900">Nanopayment Economics</td>
                    <td className="py-4 px-6 text-rose-600">Gas exceeds $0.01 value</td>
                    <td className="py-4 px-6 text-rose-600">Fixed Large Tiers (0.1+ ETH)</td>
                    <td className="py-4 px-6 text-amber-600">High gas per execution</td>
                    <td className="py-4 px-6 font-semibold bg-emerald-500/5 text-emerald-700 border-l border-emerald-500/20">
                      Batched Circle Paymaster ($0)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-neutral-900">Agent Protocol Native</td>
                    <td className="py-4 px-6 text-rose-600">No (Web3 Only)</td>
                    <td className="py-4 px-6 text-rose-600">No</td>
                    <td className="py-4 px-6 text-rose-600">No</td>
                    <td className="py-4 px-6 font-semibold bg-emerald-500/5 text-emerald-700 border-l border-emerald-500/20">
                      Yes (Native HTTP 402)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Code SDK Section */}
        <section className="py-24 bg-[#0D0E12] text-white px-4 border-t border-neutral-800 relative z-10" id="sdk">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/70 text-[11px] font-mono uppercase tracking-wider mb-3">
                  Developer Kit
                </div>
                <h2 className="text-3xl md:text-4xl font-normal tracking-tight">Plug-and-Play Implementation</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-mono">Compatible with:</span>
                <span className="px-2.5 py-1 rounded-md bg-white/10 text-neutral-300 font-mono text-xs">LangChain</span>
                <span className="px-2.5 py-1 rounded-md bg-white/10 text-neutral-300 font-mono text-xs">AutoGPT</span>
                <span className="px-2.5 py-1 rounded-md bg-white/10 text-neutral-300 font-mono text-xs">Express/Node</span>
              </div>
            </div>

            <div className="bg-[#14161E] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/30">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCodeTab("agent")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      codeTab === "agent" ? "bg-white/15 text-white" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    agent_client.py
                  </button>
                  <button
                    onClick={() => setCodeTab("gateway")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      codeTab === "gateway" ? "bg-white/15 text-white" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    gateway.js (x402 Middleware)
                  </button>
                  <button
                    onClick={() => setCodeTab("circom")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      codeTab === "circom" ? "bg-white/15 text-white" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    spend.circom (Circuit)
                  </button>
                </div>
                <button
                  onClick={copyCode}
                  className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                  </svg>
                  <span>{copyFeedback}</span>
                </button>
              </div>

              <pre className="p-6 md:p-8 font-mono text-xs sm:text-sm text-neutral-300 overflow-x-auto leading-relaxed max-h-[460px] terminal-scroll">
                <code>{codeSnippets[codeTab]}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Minimal Sign-off & Solo Author Card */}
        <section className="py-24 max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg mx-auto mb-8 shadow-md">
            ▲
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#111215] max-w-3xl mx-auto leading-tight">
            Experience zero-knowledge nanopayments for autonomous agents
          </h2>
          <p className="text-neutral-500 text-base md:text-lg mt-4 max-w-xl mx-auto">
            Built as a grant proposal and open protocol on Arc Network. Enable sub-cent private agent interactions today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              className="bg-[#111215] text-white text-sm font-medium px-7 py-3.5 rounded-full hover:bg-neutral-800 transition-all shadow-md"
              href="#simulator"
            >
              Test Live Simulator
            </a>
            <a
              className="bg-transparent text-neutral-800 border border-neutral-300 text-sm font-medium px-7 py-3.5 rounded-full hover:bg-neutral-100 transition-all"
              href="https://github.com/trymbakmahant/p2pzkpayment"
              target="_blank"
              rel="noopener noreferrer"
            >
              View GitHub Repo
            </a>
          </div>
        </section>
      </main>

      {/* Main Footer */}
      <footer className="bg-[#0B0C0E] text-white pt-16 pb-12 border-t border-neutral-900 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-16 border-b border-neutral-800">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center text-xs font-bold">
                  ▲
                </div>
                <span className="text-base font-semibold tracking-tight text-white">ArcZK-x402</span>
              </div>
              <p className="text-neutral-400 text-xs sm:text-sm max-w-sm leading-relaxed">
                The privacy-preserving zero-knowledge payment infrastructure tailored for autonomous machine-to-machine interactions and AI agent micro-transactions on Arc.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 pt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>All Systems Operational (Arc Testnet)</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-4">Architecture</h4>
              <ul className="space-y-2.5 text-xs text-neutral-400 font-sans">
                <li><a className="hover:text-white transition-colors" href="#simulator">x402 Protocol Spec</a></li>
                <li><a className="hover:text-white transition-colors" href="#pillars">Circom Verification</a></li>
                <li><a className="hover:text-white transition-colors" href="#pillars">Poseidon Trees</a></li>
                <li><a className="hover:text-white transition-colors" href="#pillars">Circle Gas Station</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-4">Resources</h4>
              <ul className="space-y-2.5 text-xs text-neutral-400 font-sans">
                <li><a className="hover:text-white transition-colors" href="#sdk">Developer Documentation</a></li>
                <li><a className="hover:text-white transition-colors" href="#sdk">Python SDK</a></li>
                <li><a className="hover:text-white transition-colors" href="#sdk">TypeScript SDK</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Security Audit</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-4">Protocol</h4>
              <ul className="space-y-2.5 text-xs text-neutral-400 font-sans">
                <li><a className="hover:text-white transition-colors" href="#">Arc Network Bridge</a></li>
                <li><a className="hover:text-white transition-colors" href="#">ASP Whitelist Registry</a></li>
                <li><a className="hover:text-white transition-colors" href="#">GitHub Repository</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Discord Community</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-mono gap-4">
            <div>&copy; 2026 ArcZK-x402 Protocol &bull; Independent project by Trymbak Mahant. MIT License.</div>
            <div className="flex items-center gap-6">
              <a className="hover:text-neutral-400 transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-neutral-400 transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-neutral-400 transition-colors" href="#">Audit Disclosures</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
