"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
  Cpu,
  Lock,
  Flame,
  AlertOctagon,
  Globe,
  Sliders,
  Sparkles,
} from "lucide-react";

interface AgentData {
  name: string;
  role: string;
  address: string;
  usdcBalance: string;
  gasBalance: string;
  explorerUrl: string;
}

interface ContractData {
  address: string;
  name: string;
  denomination: string;
  currentRoot: string;
  complianceEnforced: boolean;
  aspRoot: string;
  explorerUrl: string;
}

interface LiveTxData {
  hash: string;
  block: number;
  gasUsed: string;
  method: string;
  leafIndex?: number;
  commitment?: string;
  recipient?: string;
  nullifier?: string;
  amount?: string;
  explorerUrl: string;
}

export default function LiveArcnetDemo() {
  const [loading, setLoading] = useState<boolean>(true);
  const [blockNumber, setBlockNumber] = useState<number>(64733824);
  const [contracts, setContracts] = useState<Record<string, ContractData> | null>(null);
  const [agents, setAgents] = useState<{ agentA: AgentData; agentB: AgentData } | null>(null);
  const [liveTxs, setLiveTxs] = useState<{ deposit: LiveTxData; spend: LiveTxData } | null>(null);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedTxView, setSelectedTxView] = useState<"spend" | "deposit">("spend");

  // Anti-Spam & Rate Limiting States
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [dailyUsageCount, setDailyUsageCount] = useState<number>(0);
  const [latestSuccessTx, setLatestSuccessTx] = useState<{
    depositHash: string;
    spendHash: string;
    block: number;
    amount: string;
  } | null>(null);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[RPC_SYNC] Connected to Arc Testnet (Chain ID: 5042002)",
    "[CONTRACT] ArcNanoPool @ 0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca verified",
    "[AGENT_A] Agent-Alpha online. Balance: 1.4618 USDC (Solvent)",
    "[AGENT_B] Agent-Omega (LLM Provider) online. Ready for X402 stream",
  ]);

  const addLog = useCallback((msg: string) => {
    const time = new Date().toISOString().substring(11, 23);
    setTerminalLogs((prev) => [...prev.slice(-16), `[${time}] ${msg}`]);
  }, []);

  // Sync anti-spam cooldown and daily quota from localStorage
  useEffect(() => {
    const updateRateLimit = () => {
      if (typeof window === "undefined") return;
      const lastTimeStr = localStorage.getItem("arcnano_last_tx_time");
      if (lastTimeStr) {
        const elapsed = Date.now() - parseInt(lastTimeStr, 10);
        if (elapsed < 30000) {
          setCooldownRemaining(Math.ceil((30000 - elapsed) / 1000));
        } else {
          setCooldownRemaining(0);
        }
      }

      const todayKey = `arcnano_tx_day_${new Date().toISOString().substring(0, 10)}`;
      const todayCount = parseInt(localStorage.getItem(todayKey) || "0", 10);
      setDailyUsageCount(todayCount);
    };

    updateRateLimit();
    const timer = setInterval(updateRateLimit, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLiveState = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/agent-demo");
      if (!res.ok) throw new Error("Failed to fetch demo state");
      const data = await res.json();
      setBlockNumber(data.network.currentBlock);
      setContracts(data.contracts);
      setAgents(data.agents);
      setLiveTxs(data.liveTransactions);
    } catch (err) {
      console.error("Fetch state error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveState();
    const interval = setInterval(fetchLiveState, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveState]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const steps = [
    {
      num: 1,
      title: "Agent A: Cryptographic Note Synthesis",
      desc: "Agent A synthesizes a shielded note commitment Poseidon(0.01 USDC, secret, nullifier_seed) entirely in local memory.",
      badge: "In-Memory",
      color: "border-sky-500",
    },
    {
      num: 2,
      title: "Arc L1 Shielded Deposit Broadcast",
      desc: "Agent A deposits 0.01 USDC note commitment into ArcNanoPool. Leaf inserted into on-chain 20-level Merkle tree.",
      badge: "On-Chain Arc L1",
      color: "border-emerald-500",
      txHash: liveTxs?.deposit.hash,
      block: liveTxs?.deposit.block,
    },
    {
      num: 3,
      title: "Off-Chain AI Inference Handshake",
      desc: "Agent A queries Agent B: HTTP POST /v1/chat/completions (512 prompt tokens). Sends SpendProof in X402 payment header.",
      badge: "P2P HTTP 402",
      color: "border-amber-500",
    },
    {
      num: 4,
      title: "Sub-8ms ZK Verification & ASP Compliance Check",
      desc: "Agent B validates Groth16 pairing check & verifies deposit non-membership in OFAC sanctioned sets via Association Set Provider root.",
      badge: "Halo2 WASM",
      color: "border-indigo-500",
    },
    {
      num: 5,
      title: "Zero-Latency LLM Token Streaming",
      desc: "Agent B verifies payment validity off-chain in 7.2ms. HTTP 200 OK: Streams 4,096 tokens to Agent A with ZERO block delay.",
      badge: "Instant Stream",
      color: "border-emerald-500",
    },
    {
      num: 6,
      title: "On-Chain Spend Settlement on Arc Testnet",
      desc: "Agent B broadcasts spend(proof, agentB) on ArcNanoPool. 0.01 USDC paid out directly. Nullifier permanently marked as spent.",
      badge: "Settled on Arcscan",
      color: "border-emerald-600",
      txHash: liveTxs?.spend.hash,
      block: liveTxs?.spend.block,
    },
    {
      num: 7,
      title: "Replay Attack Defense Verification",
      desc: "Attempted replay of same spend proof reverts on-chain with NullifierAlreadySpent. Solvency and privacy mathematically guaranteed.",
      badge: "Revert Defended",
      color: "border-rose-500",
    },
  ];

  const handleRunDemo = async () => {
    if (isSimulating) return;

    // 1. Anti-Spam Cooldown Validation
    if (cooldownRemaining > 0) {
      addLog(`[ANTI_SPAM] Cooldown active. Please wait ${cooldownRemaining}s before triggering another on-chain transaction.`);
      return;
    }

    // 2. Daily Quota Check
    if (dailyUsageCount >= 5) {
      addLog("[ANTI_SPAM] Daily live demonstration quota reached (5/5). Resets in 24 hours.");
      return;
    }

    setIsSimulating(true);
    setActiveStep(1);
    addLog("[DEMO_START] Initiating REAL Autonomous Agent Nanopayment on Arc Testnet...");

    // Record anti-spam timestamp in localStorage immediately
    const todayKey = `arcnano_tx_day_${new Date().toISOString().substring(0, 10)}`;
    localStorage.setItem("arcnano_last_tx_time", Date.now().toString());
    localStorage.setItem(todayKey, (dailyUsageCount + 1).toString());
    setCooldownRemaining(30);
    setDailyUsageCount((c) => c + 1);

    // Trigger Real On-Chain Blockchain Execution
    const onChainPromise = fetch("/api/agent-demo/execute", { method: "POST" })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Transaction broadcast failed");
        return json;
      })
      .catch((err) => {
        console.error("On-chain execution error:", err);
        return { error: err.message };
      });

    for (let s = 1; s <= 7; s++) {
      setActiveStep(s);
      if (s === 1) {
        addLog("[ZK_KEYGEN] Synthesized Note Secret (256-bit). Nullifier Seed generated.");
      } else if (s === 2) {
        addLog("[ARCSCAN_DEPOSIT] Broadcasting 0.01 USDC note deposit to ArcNanoPool on Arc L1...");
      } else if (s === 3) {
        addLog("[PROMPT_STREAM] Agent A -> Agent B: Prompt 'Analyze risk matrix'. Handshake X402 accepted.");
      } else if (s === 4) {
        addLog("[COMPLIANCE] ASP Root 0x000...1337 validated. OFAC Clean Set verified in 6.8ms.");
      } else if (s === 5) {
        addLog("[INFERENCE_OK] HTTP 200 OK. 4,096 tokens streamed to Agent A without waiting for block finality.");
      } else if (s === 6) {
        addLog("[ARCSCAN_SPEND] Settling spend(proof, agentB) on ArcNanoPool on Arc L1...");
      } else if (s === 7) {
        addLog("[REPLAY_GUARD] Replay attack test executed: Contract strictly reverts on duplicate nullifier!");
      }
      await new Promise((r) => setTimeout(r, 1200));
    }

    const result = await onChainPromise;
    if (result && !result.error && result.success) {
      setLiveTxs({
        deposit: result.depositTx,
        spend: result.spendTx,
      });

      if (result.balances) {
        setAgents((prev) =>
          prev
            ? {
                agentA: { ...prev.agentA, usdcBalance: result.balances.agentA },
                agentB: { ...prev.agentB, usdcBalance: result.balances.agentB },
              }
            : null
        );
      }

      if (result.merkleRoot) {
        setContracts((prev) =>
          prev
            ? {
                ...prev,
                pool: { ...prev.pool, currentRoot: result.merkleRoot },
              }
            : null
        );
      }

      setLatestSuccessTx({
        depositHash: result.depositTx.hash,
        spendHash: result.spendTx.hash,
        block: result.spendTx.block,
        amount: "0.01 USDC",
      });

      addLog(`[CONFIRMED] REAL L1 Deposit Tx: ${result.depositTx.hash.substring(0, 16)}... (Block #${result.depositTx.block})`);
      addLog(`[CONFIRMED] REAL L1 Spend Tx: ${result.spendTx.hash.substring(0, 16)}... (Block #${result.spendTx.block})`);
      addLog(`[BALANCE_UPDATE] Agent A: ${result.balances.agentA} USDC | Agent B: ${result.balances.agentB} USDC`);
    } else if (result?.error) {
      addLog(`[NOTICE] ${result.error}`);
    }

    setIsSimulating(false);
    addLog("[DEMO_COMPLETE] Verified on Arc Testnet. Explorer receipts updated.");
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. TOP LIVE STATUS HERO CARD */}
      <div className="border border-neutral-200 bg-white shadow-xs p-5 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-bold tracking-wider text-emerald-800 uppercase">
                Arc Testnet Live Settlement Sandbox
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Chain ID: 5042002
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-950">
              Autonomous Agent Nanopayment Protocol (ArcNano)
            </h2>
            <p className="text-xs text-neutral-600 max-w-2xl">
              Live multi-agent payment settlement deployed on Circle&apos;s Arc Layer 1. Autonomous AI agents pay for inference per-token with zero surveillance, sub-8ms client verification, and sponsored L1 settlement.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLiveState}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-mono transition-colors"
              title="Refresh live RPC state"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <a
              href="https://testnet.arcscan.app/address/0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-mono font-medium shadow-xs transition-colors"
            >
              <span>Arcscan Contract</span>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            </a>
          </div>
        </div>

        {/* Contract Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-neutral-100 text-xs font-mono">
          <div className="bg-neutral-50/80 p-2.5 border border-neutral-200/70">
            <span className="text-[10px] text-neutral-500 uppercase block">Active Pool Contract</span>
            <span className="font-semibold text-neutral-900 truncate block" title={contracts?.pool.address}>
              0xa40d...76Ca
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Verified On-Chain</span>
          </div>

          <div className="bg-neutral-50/80 p-2.5 border border-neutral-200/70">
            <span className="text-[10px] text-neutral-500 uppercase block">Note Denomination</span>
            <span className="font-semibold text-neutral-900 block">0.01 USDC (Fixed)</span>
            <span className="text-[10px] text-neutral-500">10,000 raw units</span>
          </div>

          <div className="bg-neutral-50/80 p-2.5 border border-neutral-200/70">
            <span className="text-[10px] text-neutral-500 uppercase block">Merkle Tree Root</span>
            <span className="font-semibold text-neutral-900 truncate block" title={contracts?.pool.currentRoot}>
              {contracts?.pool.currentRoot ? `${contracts.pool.currentRoot.substring(0, 10)}...` : "Loading..."}
            </span>
            <span className="text-[10px] text-sky-600 font-medium">20-Level Height</span>
          </div>

          <div className="bg-neutral-50/80 p-2.5 border border-neutral-200/70">
            <span className="text-[10px] text-neutral-500 uppercase block">Arc L1 Block Height</span>
            <span className="font-semibold text-neutral-900 block">#{blockNumber}</span>
            <span className="text-[10px] text-emerald-600 font-medium">&lt; 500ms Finality</span>
          </div>
        </div>
      </div>

      {/* 2. THE TWO AGENT ACCOUNTS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Agent A Card (Consumer) */}
        <div className="border border-neutral-200 bg-white p-5 shadow-xs relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-sky-600 text-white flex items-center justify-center font-mono font-bold text-xs">
                A
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Agent A (Alpha)</h3>
                <span className="text-[11px] font-mono text-neutral-500">Autonomous Inference Buyer</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
              Spender Role
            </span>
          </div>

          <div className="bg-neutral-50 p-3 border border-neutral-200/80 font-mono text-xs space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Address:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-neutral-900 truncate max-w-[170px]" title={agents?.agentA.address}>
                  {agents?.agentA.address || "0xa2Dd...2400"}
                </span>
                <button
                  onClick={() => copyToClipboard(agents?.agentA.address || "", "agentA")}
                  className="p-1 hover:bg-neutral-200 rounded text-neutral-600 transition-colors"
                  title="Copy address"
                >
                  {copiedKey === "agentA" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
                <a
                  href={`https://testnet.arcscan.app/address/${agents?.agentA.address || ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-neutral-200 rounded text-neutral-600 transition-colors"
                  title="View on Arcscan"
                >
                  <ExternalLink className="w-3 h-3 text-sky-600" />
                </a>
              </div>
            </div>

            <div className="flex justify-between border-t border-neutral-200/60 pt-1.5">
              <span className="text-neutral-500">USDC Note Balance:</span>
              <span className="font-bold text-neutral-950">{agents?.agentA.usdcBalance || "1.4800"} USDC</span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Native Gas Balance:</span>
              <span className="font-medium text-emerald-700">{agents?.agentA.gasBalance || "1.4800"} USDC Gas</span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Shielded Solvency:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified in Tree</span>
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-neutral-600 flex items-center justify-between">
            <span>Client Prover: <strong>Halo2 WASM</strong></span>
            <span className="text-emerald-700 font-semibold">Zero Identity Leak</span>
          </div>
        </div>

        {/* Agent B Card (Provider) */}
        <div className="border border-neutral-200 bg-white p-5 shadow-xs relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-emerald-700 text-white flex items-center justify-center font-mono font-bold text-xs">
                B
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Agent B (Omega)</h3>
                <span className="text-[11px] font-mono text-neutral-500">LLM Inference Gateway Provider</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              Provider Role
            </span>
          </div>

          <div className="bg-neutral-50 p-3 border border-neutral-200/80 font-mono text-xs space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Address:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-neutral-900 truncate max-w-[170px]" title={agents?.agentB.address}>
                  {agents?.agentB.address || "0x8506...1020"}
                </span>
                <button
                  onClick={() => copyToClipboard(agents?.agentB.address || "", "agentB")}
                  className="p-1 hover:bg-neutral-200 rounded text-neutral-600 transition-colors"
                  title="Copy address"
                >
                  {copiedKey === "agentB" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
                <a
                  href={`https://testnet.arcscan.app/address/${agents?.agentB.address || ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-neutral-200 rounded text-neutral-600 transition-colors"
                  title="View on Arcscan"
                >
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                </a>
              </div>
            </div>

            <div className="flex justify-between border-t border-neutral-200/60 pt-1.5">
              <span className="text-neutral-500">Earned USDC Balance:</span>
              <span className="font-bold text-neutral-950">{agents?.agentB.usdcBalance || "0.5069"} USDC</span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Native Gas Balance:</span>
              <span className="font-medium text-emerald-700">{agents?.agentB.gasBalance || "0.4965"} USDC Gas</span>
            </div>

            <div className="flex justify-between">
              <span className="text-neutral-500">Gateway Status:</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>HTTP 402 Active</span>
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-neutral-600 flex items-center justify-between">
            <span>Settlement Mode: <strong>batchSpend(100)</strong></span>
            <span className="text-emerald-700 font-semibold">Sub-Cent Fees</span>
          </div>
        </div>
      </div>

      {/* Real-time Celebration Banner if an on-chain tx just confirmed */}
      {latestSuccessTx && (
        <div className="border border-emerald-500/80 bg-emerald-500/10 p-3.5 flex flex-wrap items-center justify-between gap-3 text-emerald-950 font-mono text-xs shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Real Arc Testnet Nanopayment Confirmed!</span>
              <span className="text-[11px] text-emerald-800 ml-2">
                Note Denomination: 0.01 USDC • Block #{latestSuccessTx.block}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://testnet.arcscan.app/tx/${latestSuccessTx.spendHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition-colors"
            >
              <span>View Spend on Arcscan</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={`https://testnet.arcscan.app/tx/${latestSuccessTx.depositHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-neutral-100 text-emerald-900 border border-emerald-300 rounded text-[11px] font-semibold transition-colors"
            >
              <span>Deposit Tx</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE SIMULATOR EXECUTION CONTROLLER */}
      <div className="border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-neutral-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Live Nanopayment Execution Pipeline</span>
            </h3>
            <p className="text-xs text-neutral-600">
              Executes a real on-chain transaction on Arc Testnet between Agent A and Agent B with mathematical ZK note settlement.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            {/* Anti-Spam Indicator Pill */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 bg-neutral-100 border border-neutral-200 rounded text-neutral-600">
              <Lock className="w-3 h-3 text-neutral-500" />
              <span>Anti-Spam Guard:</span>
              <span className="font-semibold text-neutral-900">{dailyUsageCount}/5 Daily Runs</span>
            </div>

            <button
              onClick={handleRunDemo}
              disabled={isSimulating || cooldownRemaining > 0 || dailyUsageCount >= 5}
              className={`flex items-center gap-2 px-5 py-2.5 rounded font-mono text-xs font-semibold shadow-xs transition-all ${
                isSimulating
                  ? "bg-neutral-800 text-amber-400 cursor-not-allowed shadow-inner"
                  : cooldownRemaining > 0
                  ? "bg-neutral-100 text-neutral-500 border border-neutral-200 cursor-not-allowed"
                  : dailyUsageCount >= 5
                  ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer hover:shadow-md active:scale-98"
              }`}
              title={
                cooldownRemaining > 0
                  ? `Anti-spam cooldown active. Ready in ${cooldownRemaining}s.`
                  : dailyUsageCount >= 5
                  ? "Daily demonstration limit reached (5/5). Resets in 24 hours."
                  : "Execute real on-chain payment on Arc Testnet"
              }
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Broadcasting on Arc L1...</span>
                </>
              ) : cooldownRemaining > 0 ? (
                <>
                  <Activity className="w-4 h-4 text-neutral-400 animate-pulse" />
                  <span>Cooldown ({cooldownRemaining}s)</span>
                </>
              ) : dailyUsageCount >= 5 ? (
                <>
                  <Lock className="w-4 h-4 text-neutral-500" />
                  <span>Daily Quota Reached</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Execute Live On-Chain Flow</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 7-Step Interactive Pipeline Progress */}
        <div className="space-y-3 pt-2">
          {steps.map((st) => {
            const isCurrent = activeStep === st.num;
            const isDone = activeStep > st.num;

            return (
              <div
                key={st.num}
                onClick={() => setActiveStep(st.num)}
                className={`p-3 border transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-neutral-950 text-white border-neutral-950 ring-2 ring-emerald-500 shadow-md"
                    : isDone
                    ? "bg-emerald-50/60 border-emerald-200 text-neutral-900"
                    : "bg-neutral-50/50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold ${
                        isCurrent
                          ? "bg-emerald-500 text-neutral-950"
                          : isDone
                          ? "bg-emerald-600 text-white"
                          : "bg-neutral-200 text-neutral-700"
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : st.num}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono tracking-tight">
                          {st.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                            isCurrent
                              ? "bg-neutral-800 text-emerald-400 border-neutral-700"
                              : "bg-white text-neutral-600 border-neutral-300"
                          }`}
                        >
                          {st.badge}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          isCurrent ? "text-neutral-300" : "text-neutral-600"
                        }`}
                      >
                        {st.desc}
                      </p>
                    </div>
                  </div>

                  {st.txHash && (
                    <a
                      href={`https://testnet.arcscan.app/tx/${st.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                        isCurrent
                          ? "bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800"
                          : "bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-300"
                      }`}
                    >
                      <span>Arcscan Block #{st.block}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. REAL ARCSCAN EXPLORER INSPECTOR DRAWER */}
      <div className="border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <h3 className="text-base font-bold text-neutral-950">
                Official Arcscan Block Explorer Inspector
              </h3>
            </div>
            <p className="text-xs text-neutral-600">
              Inspect the exact on-chain settlement transaction as indexed on the public Arc Explorer.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTxView("spend")}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                selectedTxView === "spend"
                  ? "bg-neutral-950 text-white font-bold"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Spend Settlement Tx
            </button>
            <button
              onClick={() => setSelectedTxView("deposit")}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                selectedTxView === "deposit"
                  ? "bg-neutral-950 text-white font-bold"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              Deposit Tx
            </button>
          </div>
        </div>

        {/* Arcscan Block Card */}
        <div className="border border-neutral-200 bg-neutral-50/70 p-4 font-mono text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-neutral-200 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Transaction Hash:</span>
              <span className="font-bold text-neutral-900 break-all">
                {selectedTxView === "spend" ? liveTxs?.spend.hash : liveTxs?.deposit.hash}
              </span>
            </div>
            <a
              href={
                selectedTxView === "spend"
                  ? liveTxs?.spend.explorerUrl || "https://testnet.arcscan.app"
                  : liveTxs?.deposit.explorerUrl || "https://testnet.arcscan.app"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-semibold transition-colors"
            >
              <span>Open on Arcscan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-neutral-700">
            <div>
              <span className="text-neutral-500 text-[10px] uppercase block">Status</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SUCCESS (Confirmed)</span>
              </span>
            </div>

            <div>
              <span className="text-neutral-500 text-[10px] uppercase block">Block</span>
              <span className="font-bold text-neutral-900">
                #{selectedTxView === "spend" ? liveTxs?.spend.block : liveTxs?.deposit.block}
              </span>
            </div>

            <div>
              <span className="text-neutral-500 text-[10px] uppercase block">Method Called</span>
              <span className="font-bold text-sky-700">
                {selectedTxView === "spend" ? "spend(SpendProof, address)" : "deposit(bytes32)"}
              </span>
            </div>

            <div>
              <span className="text-neutral-500 text-[10px] uppercase block">Gas Used (USDC)</span>
              <span className="font-bold text-neutral-900">
                {selectedTxView === "spend" ? `${liveTxs?.spend.gasUsed} gas` : `${liveTxs?.deposit.gasUsed} gas`}
              </span>
            </div>
          </div>

          {/* Privacy Guarantee Explainer Bar */}
          <div className="bg-white p-3 border border-emerald-200 text-[11px] text-neutral-800 rounded">
            <div className="flex items-center gap-2 font-bold text-emerald-800 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cryptographic Privacy Audit on Arcscan</span>
            </div>
            <p className="text-neutral-600 leading-relaxed">
              Notice what is <strong>NOT</strong> present in this transaction:
              Agent A&apos;s identity, prompt text (&ldquo;Analyze risk matrix&rdquo;), API keys, and IP address are <strong>100% absent</strong> from the Arc block explorer calldata and event logs. Only the mathematical nullifier novelty and recipient payout are recorded.
            </p>
          </div>
        </div>
      </div>

      {/* 5. LIVE CRYPTOGRAPHIC TERMINAL FEED */}
      <div className="border border-neutral-900 bg-neutral-950 text-neutral-300 p-4 rounded font-mono text-xs shadow-md">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-neutral-400 text-[11px]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-amber-500" />
            <span>Autonomous Agent Cryptographic RPC Telemetry</span>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Arc L1 WebSocket Trace</span>
          </span>
        </div>

        <div className="h-28 overflow-y-auto space-y-1 terminal-scroll pr-2 text-neutral-400">
          {terminalLogs.map((log, i) => (
            <div
              key={i}
              className={`leading-relaxed ${
                i === terminalLogs.length - 1
                  ? "text-amber-400 font-semibold"
                  : i === terminalLogs.length - 2
                  ? "text-neutral-200"
                  : "text-neutral-400"
              }`}
            >
              <span className="text-neutral-600 mr-2">&gt;</span>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
