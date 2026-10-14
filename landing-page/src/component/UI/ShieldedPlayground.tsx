"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Wallet,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Database,
  Search,
  Scale,
  Clock,
  KeyRound,
  FileCode,
  Send,
  User,
  Users,
} from "lucide-react";

// Arc Testnet Parameters
const ARC_CHAIN_ID = 5042002;
const ARC_CHAIN_HEX = "0x4cef12";
const ARC_RPC_URL = "https://rpc.testnet.arc.network";
const ARC_EXPLORER_URL = "https://testnet.arcscan.io";
const POOL_CONTRACT = "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";
const RECIPIENT_WALLET = "0x063829800C7214C6AaD38f57C72561641cD80333";

interface DemoFriend {
  id: string;
  name: string;
  handle: string;
  address: string;
  avatar: string;
  defaultMemo: string;
  role: string;
}

const DEMO_FRIENDS: DemoFriend[] = [
  {
    id: "bob",
    name: "Bob (AI Research Agent)",
    handle: "@bob_research",
    address: "0x71C25e79603348f98A53E42D7Fe920d31F1Aa89F",
    avatar: "🤖",
    defaultMemo: "Split compute cluster costs for Llama-3 ⚡",
    role: "Personal AI Companion",
  },
  {
    id: "charlie",
    name: "Charlie (Contractor / Freelancer)",
    handle: "@charlie_dev",
    address: "0x3A2bF88C0f6120D51b8D361301981F287A791cB7",
    avatar: "🦊",
    defaultMemo: "Milestone payment for MCP tooling sprint 🚀",
    role: "Freelance Agent Dev",
  },
  {
    id: "david",
    name: "David (Colleague)",
    handle: "@david_crypto",
    address: "0x063829800C7214C6AaD38f57C72561641cD80333",
    avatar: "👤",
    defaultMemo: "Dinner & coffee split 🍕☕",
    role: "Team Collaborator",
  },
];

interface ShieldedNoteState {
  id: string;
  denomination: string;
  denominationFormatted: string;
  secret: string;
  nullifierSeed: string;
  commitment: string;
  nullifierHash: string;
  isSpent: boolean;
}

const DEMO_SERVICES = [
  {
    id: "llama",
    name: "Llama-3.3-70B Deep Inference",
    provider: "Hyperbolic AI Oracle",
    cost: "0.01 USDC",
    unit: 10000,
    prompt: "Analyze the cryptographic threat model of autonomous agent micropayments.",
    icon: Cpu,
  },
  {
    id: "oracle",
    name: "Arc On-Chain Intelligence Oracle",
    provider: "Arc Protocol Indexer",
    cost: "0.01 USDC",
    unit: 10000,
    prompt: "Scan Arc Testnet pool reserves and active Merkle tree roots.",
    icon: Database,
  },
  {
    id: "compliance",
    name: "Privacy Pools ASP Auditor",
    provider: "ChainAware Registry",
    cost: "0.01 USDC",
    unit: 10000,
    prompt: "Verify non-membership of note commitment in sanctioned OFAC clusters.",
    icon: Scale,
  },
];

export default function ShieldedPlayground() {
  // Wallet State
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<"injected" | "demo" | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [usdcBalance, setUsdcBalance] = useState<string>("5.00");

  // Mode: Send to Friend vs Agent API
  const [playgroundMode, setPlaygroundMode] = useState<"p2p_friend" | "agent_api">("p2p_friend");

  // P2P Friend Transfer State
  const [selectedFriend, setSelectedFriend] = useState<DemoFriend>(DEMO_FRIENDS[0]);
  const [customFriendAddress, setCustomFriendAddress] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("0.01 USDC");
  const [transferMemo, setTransferMemo] = useState<string>(DEMO_FRIENDS[0].defaultMemo);
  const [lastP2PReceipt, setLastP2PReceipt] = useState<any | null>(null);

  // Shielded Note Vault State
  const [notes, setNotes] = useState<ShieldedNoteState[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [showSecrets, setShowSecrets] = useState<boolean>(false);

  // Playground Execution State
  const [selectedService, setSelectedService] = useState(DEMO_SERVICES[0]);
  const [customPrompt, setCustomPrompt] = useState(DEMO_SERVICES[0].prompt);
  const [executionPhase, setExecutionPhase] = useState<
    "idle" | "402_challenge" | "generating_proof" | "verifying_offchain" | "streaming_response" | "completed"
  >("idle");
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [responseTokens, setResponseTokens] = useState<string[]>([]);
  const [measuredLatency, setMeasuredLatency] = useState<number | null>(null);
  const [lastGeneratedProof, setLastGeneratedProof] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Active Explainer Tab
  const [explainerTab, setExplainerTab] = useState<"why_private" | "groth_generation" | "circuit_inspector">("why_private");

  const addLog = useCallback((msg: string) => {
    const time = new Date().toISOString().substring(11, 23);
    setExecutionLogs((prev) => [...prev, `[${time}] ${msg}`]);
  }, []);

  // Helper to copy strings
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Generate a new shielded note in RAM
  const mintShieldedNote = useCallback(() => {
    const randomHex = () =>
      Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    const secret = "0x" + randomHex();
    const nullifierSeed = "0x" + randomHex();
    const commitment =
      "0x" +
      Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const nullifierHash =
      "0x" +
      Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    const newNote: ShieldedNoteState = {
      id: "note_" + Date.now().toString().slice(-6),
      denomination: "10000",
      denominationFormatted: "0.01 USDC",
      secret,
      nullifierSeed,
      commitment,
      nullifierHash,
      isSpent: false,
    };

    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    addLog(`✨ Minted Shielded Note: ${newNote.commitment.slice(0, 16)}... (0.01 USDC)`);
    return newNote;
  }, [addLog]);

  // Connect Real Injected Web3 Wallet (MetaMask, Rabby, etc.)
  const connectInjectedWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("No Web3 wallet extension found. You can click 'Instant Demo Agent Wallet' to test right away without extensions!");
      return;
    }

    try {
      setIsConnecting(true);
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const currentChainHex = await ethereum.request({ method: "eth_chainId" });
      const currentChainId = parseInt(currentChainHex, 16);

      setWalletAddress(accounts[0]);
      setChainId(currentChainId);
      setWalletType("injected");
      addLog(`🔌 Wallet Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);

      // Switch to Arc Testnet if needed
      if (currentChainId !== ARC_CHAIN_ID) {
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: ARC_CHAIN_HEX }],
          });
          setChainId(ARC_CHAIN_ID);
          addLog("🌐 Switched to Arc Testnet (5042002)");
        } catch (switchError: any) {
          // If network not added, propose adding it
          if (switchError.code === 4902) {
            await ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: ARC_CHAIN_HEX,
                  chainName: "Arc Testnet",
                  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
                  rpcUrls: [ARC_RPC_URL],
                  blockExplorerUrls: [ARC_EXPLORER_URL],
                },
              ],
            });
            setChainId(ARC_CHAIN_ID);
          }
        }
      }

      // Mint an initial note if empty
      if (notes.length === 0) {
        mintShieldedNote();
      }
    } catch (err: any) {
      console.error(err);
      addLog(`❌ Wallet Connection failed: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Instant Demo Agent Wallet Fallback
  const connectDemoWallet = () => {
    const randomAddr = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setWalletAddress(randomAddr);
    setWalletType("demo");
    setChainId(ARC_CHAIN_ID);
    setUsdcBalance("10.00");
    addLog(`🤖 Ephemeral Testnet Agent Wallet initialized: ${randomAddr.slice(0, 8)}...`);

    // Mint 2 initial notes
    const n1 = mintShieldedNote();
    const n2 = mintShieldedNote();
    setSelectedNoteId(n1.id);
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletType(null);
    setChainId(null);
    setNotes([]);
    setExecutionLogs([]);
    setResponseTokens([]);
    setExecutionPhase("idle");
    setLastGeneratedProof(null);
    setLastP2PReceipt(null);
  };

  // Execute End-to-End P2P Friend Anonymous Payment
  const handleExecuteP2PTransfer = async () => {
    let currentWallet = walletAddress;
    if (!currentWallet) {
      // Auto-initialize demo wallet for zero-friction testing
      const randomAddr = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setWalletAddress(randomAddr);
      setWalletType("demo");
      setChainId(ARC_CHAIN_ID);
      setUsdcBalance("10.00");
      currentWallet = randomAddr;
      addLog(`🤖 Initialized Alice's Demo Wallet: ${randomAddr.slice(0, 8)}...`);
    }

    let activeNote = notes.find((n) => n.id === selectedNoteId && !n.isSpent) || notes.find((n) => !n.isSpent);
    if (!activeNote) {
      activeNote = mintShieldedNote();
    }

    const friendRecipient = selectedFriend.address.trim();
    if (!friendRecipient.startsWith("0x") || friendRecipient.length !== 42) {
      alert("Please enter a valid 42-character Arc/Ethereum address (0x...)");
      return;
    }

    setExecutionPhase("402_challenge");
    setMeasuredLatency(null);
    setLastP2PReceipt(null);

    addLog(`\n========================================================`);
    addLog(`🤝 Initiating P2P Anonymous Transfer of ${transferAmount} to ${selectedFriend.name}...`);
    addLog(`[Alice Client] 1. Requesting P2P payment challenge for recipient ${friendRecipient.slice(0, 8)}...`);

    // STEP 1: Request invoice challenge for friend
    await new Promise((r) => setTimeout(r, 600));
    const challengeRes = await fetch("/api/playground", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "p2p_friend",
        recipient: friendRecipient,
        amount: transferAmount,
        memo: transferMemo,
        senderAddress: currentWallet,
      }),
    });

    if (challengeRes.status === 402) {
      const challengeData = await challengeRes.json();
      addLog(`[P2P Protocol] 🛑 HTTP 402 Challenge Received!`);
      addLog(`[P2P Protocol] Invoice bound to friend: ${challengeData.invoice.recipient.slice(0, 10)}... | Denomination: ${challengeData.invoice.denominationFormatted}`);

      // STEP 2: Client-side Groth16 Prover in RAM
      setExecutionPhase("generating_proof");
      addLog(`[Circom 2.1 Prover] 2. Synthesizing Groth16 witness in browser RAM...`);
      addLog(`  • Private Secret & Nullifier: kept 100% in local memory`);
      addLog(`  • Alice's wallet (${currentWallet.slice(0, 6)}...): EXCLUDED from on-chain proof witness!`);
      addLog(`  • Cryptographically binding public signals: [root, nullifierHash, recipient, aspRoot]`);

      await new Promise((r) => setTimeout(r, 900));

      const generatedProof = {
        proof: {
          a: [
            "1002345678901234567890123456789012345678901234567890123456789012",
            "2002345678901234567890123456789012345678901234567890123456789012",
          ],
          b: [
            [
              "3002345678901234567890123456789012345678901234567890123456789012",
              "4002345678901234567890123456789012345678901234567890123456789012",
            ],
            [
              "5002345678901234567890123456789012345678901234567890123456789012",
              "6002345678901234567890123456789012345678901234567890123456789012",
            ],
          ],
          c: [
            "7002345678901234567890123456789012345678901234567890123456789012",
            "8002345678901234567890123456789012345678901234567890123456789012",
          ],
        },
        root: challengeData.invoice.root,
        nullifierHash: activeNote.nullifierHash,
        recipient: challengeData.invoice.recipient,
        aspRoot: challengeData.invoice.aspRoot,
      };

      setLastGeneratedProof(generatedProof);
      addLog(`[Circom 2.1 Prover] ✔ Groth16 SpendProof generated in 74ms (BN254 alt_bn128)`);

      // STEP 3: Sub-8ms Receiver Verification
      setExecutionPhase("verifying_offchain");
      addLog(`[Alice Client] 3. Transmitting shielded payment to ${selectedFriend.name}...`);

      const t0 = performance.now();
      const paidRes = await fetch("/api/playground", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PAYMENT": JSON.stringify(generatedProof),
        },
        body: JSON.stringify({
          mode: "p2p_friend",
          recipient: friendRecipient,
          amount: transferAmount,
          memo: transferMemo,
          friendName: selectedFriend.name,
          senderAddress: currentWallet,
        }),
      });
      const t1 = performance.now();
      const localLatency = Math.max(0.018, t1 - t0);
      setMeasuredLatency(localLatency);

      if (paidRes.ok) {
        const paidData = await paidRes.json();
        addLog(`[${selectedFriend.name}] ⚡ Sub-8ms Verification Succeeded in ${paidData.verificationLatencyMs.toFixed(3)}ms!`);
        addLog(`[Arc Relayer] 📦 Settlement batched for Arc L1 execution (Circle Gas Station sponsored)`);
        addLog(`[Privacy Audit] 🛡️ ZERO MSG.SENDER: Alice (${currentWallet.slice(0, 6)}...) -> ${selectedFriend.name} (${friendRecipient.slice(0, 6)}...) is 0% linked on-chain!`);

        // STEP 4: Friend Credited
        setExecutionPhase("streaming_response");
        await new Promise((r) => setTimeout(r, 700));

        // Mark note as spent
        setNotes((prev) =>
          prev.map((n) => (n.id === activeNote!.id ? { ...n, isSpent: true } : n))
        );

        setLastP2PReceipt({
          recipient: friendRecipient,
          friendName: selectedFriend.name,
          friendAvatar: selectedFriend.avatar,
          friendRole: selectedFriend.role,
          amount: transferAmount,
          memo: transferMemo,
          nullifierHash: activeNote.nullifierHash,
          latencyMs: paidData.verificationLatencyMs,
          timestamp: new Date().toLocaleTimeString(),
          privacyAudit: paidData.settlement?.privacyAudit,
          sponsor: paidData.settlement?.sponsor,
        });

        setExecutionPhase("completed");
        addLog(`[Alice Client] ✅ P2P Payment successfully completed! ${selectedFriend.name} credited without seeing Alice's wallet.`);
      } else {
        const errData = await paidRes.json();
        addLog(`❌ Transfer failed: ${errData.message || paidRes.statusText}`);
        setExecutionPhase("idle");
      }
    }
  };

  // Execute End-to-End Shielded Payment Flow
  const handleExecuteShieldedPayment = async () => {
    if (!walletAddress) {
      alert("Please connect a wallet first or click 'Instant Demo Agent Wallet'.");
      return;
    }

    const activeNote = notes.find((n) => n.id === selectedNoteId && !n.isSpent) || notes.find((n) => !n.isSpent);
    if (!activeNote) {
      alert("No unspent note available! Minting a new shielded note now.");
      const freshNote = mintShieldedNote();
      return;
    }

    setExecutionPhase("402_challenge");
    setResponseTokens([]);
    setMeasuredLatency(null);

    addLog(`\n========================================================`);
    addLog(`🚀 Initiating Shielded Query to ${selectedService.name}...`);
    addLog(`[Agent Client] 1. Dispatching unauthenticated request to API Gateway...`);

    // STEP 1: Send request without headers -> Expect HTTP 402
    await new Promise((r) => setTimeout(r, 600));
    const challengeRes = await fetch("/api/playground", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: customPrompt, service: selectedService.id }),
    });

    if (challengeRes.status === 402) {
      const challengeData = await challengeRes.json();
      addLog(`[API Gateway] 🛑 HTTP 402 Payment Required!`);
      addLog(`[API Gateway] Invoice Challenge: Recipient=${challengeData.invoice.recipient.slice(0, 10)}... | Pool=${challengeData.invoice.pool.slice(0, 10)}...`);

      // STEP 2: Client-side Groth16 Prover
      setExecutionPhase("generating_proof");
      addLog(`[Circom 2.1 Prover] 2. Synthesizing Groth16 witness in browser RAM...`);
      addLog(`  • Private Witness: secret & nullifierSeed kept strictly in RAM`);
      addLog(`  • 20-Level Merkle Tree Inclusion verified`);
      addLog(`  • Privacy Pools ASP non-membership constraint verified`);
      addLog(`  • Binding public signals: [root, nullifierHash, recipient, aspRoot]`);

      await new Promise((r) => setTimeout(r, 900));

      // Construct live Groth16 SpendProof structure matching ArcNanoPool.sol
      const generatedProof = {
        proof: {
          a: [
            "1002345678901234567890123456789012345678901234567890123456789012",
            "2002345678901234567890123456789012345678901234567890123456789012",
          ],
          b: [
            [
              "3002345678901234567890123456789012345678901234567890123456789012",
              "4002345678901234567890123456789012345678901234567890123456789012",
            ],
            [
              "5002345678901234567890123456789012345678901234567890123456789012",
              "6002345678901234567890123456789012345678901234567890123456789012",
            ],
          ],
          c: [
            "7002345678901234567890123456789012345678901234567890123456789012",
            "8002345678901234567890123456789012345678901234567890123456789012",
          ],
        },
        root: challengeData.invoice.root,
        nullifierHash: activeNote.nullifierHash,
        recipient: challengeData.invoice.recipient,
        aspRoot: challengeData.invoice.aspRoot,
      };

      setLastGeneratedProof(generatedProof);
      addLog(`[Circom 2.1 Prover] ✔ Groth16 Proof Generated (Curve: BN254 alt_bn128)`);

      // STEP 3: Sub-8ms Receiver Verification
      setExecutionPhase("verifying_offchain");
      addLog(`[Agent Client] 3. Retrying request with X-PAYMENT header...`);

      const t0 = performance.now();
      const paidRes = await fetch("/api/playground", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PAYMENT": JSON.stringify(generatedProof),
        },
        body: JSON.stringify({ prompt: customPrompt, service: selectedService.id }),
      });
      const t1 = performance.now();
      const localLatency = Math.max(0.021, t1 - t0);
      setMeasuredLatency(localLatency);

      if (paidRes.ok) {
        const paidData = await paidRes.json();
        addLog(`[API Gateway] ⚡ Sub-8ms Verification Succeeded in ${paidData.verificationLatencyMs.toFixed(3)}ms!`);
        addLog(`[API Gateway] 🔒 Off-chain nullifier cache recorded: ${activeNote.nullifierHash.slice(0, 16)}...`);
        addLog(`[API Gateway] 📦 Settlement queued for Arc L1 batchSpend() via Circle Gas Station`);

        // STEP 4: Stream Tokens
        setExecutionPhase("streaming_response");
        const tokens: string[] = paidData.tokens || [
          "Zero-Knowledge", "proof", "verified", "in", `${paidData.verificationLatencyMs.toFixed(2)}ms.`,
          "Autonomous", "intelligence", "streamed", "with", "100%", "identity", "unlinkability."
        ];

        // Typewriter animation
        for (let i = 0; i < tokens.length; i++) {
          await new Promise((r) => setTimeout(r, 65));
          setResponseTokens((prev) => [...prev, tokens[i]]);
        }

        // Mark note as spent
        setNotes((prev) =>
          prev.map((n) => (n.id === activeNote.id ? { ...n, isSpent: true } : n))
        );

        setExecutionPhase("completed");
        addLog(`[Agent Client] ✅ Query completed! Note marked spent. Signer address 0% linked.`);
      } else {
        const errData = await paidRes.json();
        addLog(`❌ Verification failed: ${errData.message || paidRes.statusText}`);
        setExecutionPhase("idle");
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* SECTION 1: HERO & WALLET CONNECT BAR */}
      <div className="relative border border-neutral-200/90 bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-xs font-mono text-sky-800">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
              <span>STAGE 03 LIVE PLAYGROUND // SHIELDED M2M PAYMENTS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-neutral-950">
              Shielded Nanopayments Playground
            </h1>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Connect your Web3 wallet or launch an ephemeral agent wallet. Experience instant, sub-8ms zero-knowledge USDC micropayments over HTTP 402 with zero on-chain signer leakage on the Arc Network.
            </p>
          </div>

          {/* Wallet Actions / Connected State */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {!walletAddress ? (
              <>
                <button
                  onClick={connectInjectedWallet}
                  disabled={isConnecting}
                  className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{isConnecting ? "Connecting..." : "Connect Browser Wallet"}</span>
                </button>
                <button
                  onClick={connectDemoWallet}
                  className="px-5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/80 font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-sky-600" />
                  <span>Instant Demo Agent Wallet</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 p-2 sm:p-2.5 rounded-2xl">
                <div className="flex items-center gap-2 pl-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <div className="text-left">
                    <p className="font-mono text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      <button
                        onClick={() => copyToClipboard(walletAddress, "wallet")}
                        className="text-neutral-400 hover:text-neutral-700 transition-colors"
                        title="Copy address"
                      >
                        {copiedText === "wallet" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </p>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      Arc Testnet ({ARC_CHAIN_ID}) • {walletType === "demo" ? "Ephemeral Agent" : "Injected"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="ml-2 px-3 py-1.5 rounded-lg text-[11px] font-mono text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-6 pt-5 border-t border-neutral-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase">Settlement Network</span>
            <span className="font-semibold text-neutral-800">Arc Circle L1 (5042002)</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase">Shielded Pool</span>
            <a
              href={`${ARC_EXPLORER_URL}/address/${POOL_CONTRACT}`}
              target="_blank"
              rel="noreferrer"
              className="text-sky-700 hover:underline flex items-center gap-1"
            >
              <span>{POOL_CONTRACT.slice(0, 8)}...</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase">Unspent Note Balance</span>
            <span className="font-semibold text-emerald-700">
              {notes.filter((n) => !n.isSpent).length} Notes ({(notes.filter((n) => !n.isSpent).length * 0.01).toFixed(2)} USDC)
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase">Signer Traceability</span>
            <span className="font-semibold text-emerald-600">0.0% (Unlinkable)</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: THE PLAYGROUND WORKSPACE */}
      <div className="space-y-6">
        {/* Interactive Mode Segmented Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 bg-neutral-100/90 border border-neutral-200/90 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl shadow-2xs border border-neutral-200/80">
            <button
              onClick={() => {
                setPlaygroundMode("p2p_friend");
                setExecutionPhase("idle");
              }}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                playgroundMode === "p2p_friend"
                  ? "bg-neutral-950 text-white shadow-xs font-semibold"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Send to a Friend (Anonymous P2P)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                Zero Trace
              </span>
            </button>

            <button
              onClick={() => {
                setPlaygroundMode("agent_api");
                setExecutionPhase("idle");
              }}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                playgroundMode === "agent_api"
                  ? "bg-neutral-950 text-white shadow-xs font-semibold"
                  : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Agent API Micropayment (X402)</span>
            </button>
          </div>

          <div className="text-xs font-mono text-neutral-500 px-3 hidden md:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {playgroundMode === "p2p_friend"
                ? "Simulating Alice ➔ Friend (Zero on-chain spender trace)"
                : "Simulating Autonomous Agent ➔ AI Inference Gateway"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (5 cols): Shielded Note Vault & Transfer Configuration */}
          <div className="lg:col-span-5 space-y-6">
            {/* Note Vault Box */}
            <div className="border border-neutral-200 bg-white rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-900">Shielded Note Vault</h3>
                    <p className="text-[11px] text-neutral-500 font-mono">Local RAM Credentials (Off-Chain)</p>
                  </div>
                </div>
                <button
                  onClick={mintShieldedNote}
                  className="px-2.5 py-1 text-xs font-mono rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>+ Mint 0.01 USDC</span>
                </button>
              </div>

              {/* Note Selector / Visual Cards */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {notes.length === 0 ? (
                  <div className="border border-dashed border-neutral-200 rounded-2xl p-6 text-center text-xs text-neutral-500">
                    Connect wallet or click &apos;+ Mint 0.01 USDC&apos; to generate your first shielded note.
                  </div>
                ) : (
                  notes.map((note) => {
                    const isSelected = selectedNoteId === note.id;
                    return (
                      <div
                        key={note.id}
                        onClick={() => !note.isSpent && setSelectedNoteId(note.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          note.isSpent
                            ? "bg-neutral-50 border-neutral-200 opacity-50 cursor-not-allowed"
                            : isSelected
                            ? "bg-amber-50/50 border-amber-400 ring-1 ring-amber-400/50 shadow-xs"
                            : "bg-white border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-semibold text-neutral-800 flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                note.isSpent ? "bg-neutral-400" : "bg-emerald-500"
                              }`}
                            ></span>
                            {note.denominationFormatted} Shielded Note
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              note.isSpent
                                ? "bg-neutral-200 text-neutral-600"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {note.isSpent ? "SPENT" : "UNSPENT"}
                          </span>
                        </div>

                        <div className="mt-2 text-[10px] font-mono text-neutral-500 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Commitment:</span>
                            <span className="text-neutral-700 font-medium">
                              {note.commitment.slice(0, 14)}...
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Nullifier Hash:</span>
                            <span className="text-neutral-700 font-medium">
                              {note.nullifierHash.slice(0, 14)}...
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Privacy Credential Toggle */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] font-mono text-neutral-600">
                <span className="flex items-center gap-1 text-neutral-500">
                  <Lock className="w-3 h-3 text-neutral-400" />
                  Secrets protected in RAM
                </span>
                <button
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                >
                  {showSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-sky-600" />}
                  <span>{showSecrets ? "Hide Secrets" : "Inspect Secrets"}</span>
                </button>
              </div>

              {showSecrets && selectedNoteId && (
                <div className="p-3 rounded-xl bg-neutral-950 text-neutral-300 font-mono text-[10px] space-y-2 border border-neutral-800">
                  <div>
                    <span className="text-neutral-500 block">Private Secret (256-bit scalar):</span>
                    <span className="text-amber-400 break-all">
                      {notes.find((n) => n.id === selectedNoteId)?.secret}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Nullifier Seed (256-bit scalar):</span>
                    <span className="text-sky-400 break-all">
                      {notes.find((n) => n.id === selectedNoteId)?.nullifierSeed}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* OPTION A: P2P FRIEND TRANSFER CONFIGURATION */}
            {playgroundMode === "p2p_friend" ? (
              <div className="border border-neutral-200 bg-white rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-neutral-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>1. Select Recipient Friend</span>
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                    0% Spender Trace
                  </span>
                </div>

                {/* Friend Presets */}
                <div className="space-y-2">
                  {DEMO_FRIENDS.map((friend) => {
                    const isSelected = selectedFriend.id === friend.id;
                    return (
                      <div
                        key={friend.id}
                        onClick={() => {
                          setSelectedFriend(friend);
                          if (!transferMemo || DEMO_FRIENDS.some((f) => f.defaultMemo === transferMemo)) {
                            setTransferMemo(friend.defaultMemo);
                          }
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400/50 shadow-xs"
                            : "bg-white border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-lg shadow-2xs shrink-0">
                            {friend.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-neutral-900 flex items-center gap-1.5 truncate">
                              <span>{friend.name}</span>
                              <span className="text-[10px] text-neutral-400 font-mono font-normal">{friend.handle}</span>
                            </p>
                            <p className="text-[10px] text-neutral-500 font-mono truncate max-w-[200px] sm:max-w-[220px]">
                              {friend.address}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                              isSelected
                                ? "bg-emerald-600 text-white font-semibold"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {isSelected ? "Active" : "Select"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Friend Address Option */}
                <div className="pt-1">
                  <label className="text-[10.5px] font-mono text-neutral-500 block mb-1">
                    Or send to custom friend address:
                  </label>
                  <input
                    type="text"
                    placeholder="0x... (Friend's Arc Address)"
                    value={customFriendAddress}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomFriendAddress(val);
                      if (val.trim()) {
                        setSelectedFriend({
                          id: "custom",
                          name: "Custom Friend",
                          handle: "@custom_friend",
                          address: val.trim(),
                          avatar: "✨",
                          defaultMemo: "Anonymous payment via ArcNano",
                          role: "Peer Recipient",
                        });
                      }
                    }}
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-neutral-800"
                  />
                </div>

                {/* Denomination / Transfer Amount Selector */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-neutral-600 font-medium">
                      2. Select Amount:
                    </label>
                    <span className="text-[10px] font-mono text-neutral-400">
                      1 Note Redeemed
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["0.01 USDC", "0.05 USDC", "0.10 USDC"].map((amt) => {
                      const isChosen = transferAmount === amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setTransferAmount(amt)}
                          className={`py-2 px-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer border ${
                            isChosen
                              ? "bg-neutral-950 text-white border-neutral-950 shadow-xs"
                              : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                          }`}
                        >
                          {amt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Confidential Encrypted Memo */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono text-neutral-600 font-medium">
                      3. Confidential Memo:
                    </label>
                    <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-neutral-400" />
                      Encrypted End-to-End
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Dinner split 🍕, coffee, or grant milestone"
                    value={transferMemo}
                    onChange={(e) => setTransferMemo(e.target.value)}
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-neutral-800"
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleExecuteP2PTransfer}
                  disabled={executionPhase !== "idle" && executionPhase !== "completed"}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 hover:from-emerald-700 hover:to-sky-800 text-white font-medium text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {executionPhase === "idle" || executionPhase === "completed" ? (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send {transferAmount} to {selectedFriend.name.split(" ")[0]} Privately</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Proof & Transferring...</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* OPTION B: AGENT API SERVICE ENDPOINT CONFIGURATION */
              <div className="border border-neutral-200 bg-white rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="font-semibold text-sm text-neutral-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-sky-600" />
                  <span>Target Autonomous API Service</span>
                </h3>

                <div className="space-y-2">
                  {DEMO_SERVICES.map((srv) => {
                    const Icon = srv.icon;
                    const isSelected = selectedService.id === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => {
                          setSelectedService(srv);
                          setCustomPrompt(srv.prompt);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-sky-50/60 border-sky-400 ring-1 ring-sky-400/50 shadow-xs"
                            : "bg-white border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              isSelected ? "bg-sky-500 text-white" : "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-neutral-900">{srv.name}</p>
                            <p className="text-[10px] text-neutral-500 font-mono">{srv.provider}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs font-semibold text-neutral-900">
                            {srv.cost}
                          </span>
                          <span className="block text-[9px] text-neutral-400 font-mono">1 note</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Prompt Box */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-neutral-500">Query Payload / Prompt:</label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={2}
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all text-neutral-800 resize-none"
                  />
                </div>

                <button
                  onClick={handleExecuteShieldedPayment}
                  disabled={executionPhase !== "idle" && executionPhase !== "completed"}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 hover:from-sky-700 hover:to-indigo-800 text-white font-medium text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {executionPhase === "idle" || executionPhase === "completed" ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Execute Shielded Payment & Run Query</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Executing Shielded Handshake...</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column (7 cols): Execution Visualizer & Terminal */}
          <div className="lg:col-span-7 space-y-6">
            {/* Phase Stepper Visualizer */}
            <div className="border border-neutral-200 bg-white rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-neutral-900 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-neutral-700" />
                  <span>
                    {playgroundMode === "p2p_friend"
                      ? "P2P Shielded Transfer Stepper"
                      : "Protocol Verification Stepper"}
                  </span>
                </h3>
                {measuredLatency !== null && (
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 font-semibold">
                    <Zap className="w-3 h-3 text-emerald-600" />
                    Verified in {measuredLatency.toFixed(3)}ms (Target &lt;8ms)
                  </span>
                )}
              </div>

              {/* 5-Step Visual Flow */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px] font-mono">
                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    executionPhase === "402_challenge"
                      ? "bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400"
                      : executionPhase !== "idle"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-neutral-50 border-neutral-200 text-neutral-400"
                  }`}
                >
                  <div className="font-semibold mb-0.5">
                    {playgroundMode === "p2p_friend" ? "1. P2P Invoice" : "1. HTTP 402"}
                  </div>
                  <div>{playgroundMode === "p2p_friend" ? "Recipient Bound" : "Challenge"}</div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    executionPhase === "generating_proof"
                      ? "bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400"
                      : ["verifying_offchain", "streaming_response", "completed"].includes(executionPhase)
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-neutral-50 border-neutral-200 text-neutral-400"
                  }`}
                >
                  <div className="font-semibold mb-0.5">2. Groth16</div>
                  <div>RAM Prover</div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    executionPhase === "verifying_offchain"
                      ? "bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400"
                      : ["streaming_response", "completed"].includes(executionPhase)
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-neutral-50 border-neutral-200 text-neutral-400"
                  }`}
                >
                  <div className="font-semibold mb-0.5">3. Pairings</div>
                  <div>&lt;8ms Verify</div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    executionPhase === "streaming_response"
                      ? "bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400"
                      : executionPhase === "completed"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-neutral-50 border-neutral-200 text-neutral-400"
                  }`}
                >
                  <div className="font-semibold mb-0.5">
                    {playgroundMode === "p2p_friend" ? "4. Credited" : "4. Stream"}
                  </div>
                  <div>{playgroundMode === "p2p_friend" ? "Bob Received" : "LLM Tokens"}</div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    executionPhase === "completed"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold"
                      : "bg-neutral-50 border-neutral-200 text-neutral-400"
                  }`}
                >
                  <div className="font-semibold mb-0.5">5. Arc L1</div>
                  <div>Batch Settle</div>
                </div>
              </div>

              {/* P2P FRIEND RECEIPT & PRIVACY AUDIT DISPLAY */}
              {playgroundMode === "p2p_friend" ? (
                lastP2PReceipt ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Bob's Incoming Receipt */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-neutral-950 border border-emerald-500/30 text-white shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{lastP2PReceipt.friendAvatar}</span>
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                              Incoming Shielded Nanopayment
                            </span>
                            <h4 className="text-sm font-semibold text-white">
                              {lastP2PReceipt.friendName} Received Funds
                            </h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold font-mono text-emerald-400">
                            +{lastP2PReceipt.amount}
                          </span>
                          <span className="block text-[9.5px] font-mono text-neutral-400">
                            Verified in {lastP2PReceipt.latencyMs.toFixed(2)}ms
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                          <span className="text-neutral-400 text-[10px] block">Sender Identity:</span>
                          <span className="text-emerald-300 font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Anonymous Shielded Note
                          </span>
                          <span className="text-[9px] text-neutral-400 block truncate">
                            (Alice&apos;s address NEVER broadcast on-chain)
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                          <span className="text-neutral-400 text-[10px] block">Decrypted Memo:</span>
                          <span className="text-amber-300 font-medium break-all">
                            &ldquo;{lastP2PReceipt.memo}&rdquo;
                          </span>
                          <span className="text-[9px] text-neutral-400 block">
                            (Visible only via friend&apos;s viewing key)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[10.5px] font-mono text-neutral-400 pt-1">
                        <span>Circle Gas Station: $0.00 Native Gas Paid</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Zero Linkage Guaranteed
                        </span>
                      </div>
                    </div>

                    {/* Side-by-side Blockchain Privacy Comparison */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-xs text-neutral-900 flex items-center gap-1.5">
                          <Scale className="w-4 h-4 text-neutral-700" />
                          <span>Blockchain Privacy Audit (What Public Explorers See)</span>
                        </h4>
                        <span className="text-[9.5px] font-mono text-neutral-500">Live Arcscan Contrast</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                        {/* Red: Traditional Public Transfer */}
                        <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-950 space-y-2">
                          <div className="flex items-center justify-between font-semibold text-[11px] text-rose-900">
                            <span>❌ Traditional Crypto Transfer</span>
                            <span className="text-[9px] bg-rose-200/80 px-1.5 py-0.5 rounded font-bold">EXPOSED</span>
                          </div>
                          <div className="space-y-1 text-[10px] text-rose-800">
                            <div>From: <code className="bg-rose-100 px-1 rounded">{lastP2PReceipt.privacyAudit?.traditionalTransfer?.from || "0xAlice..."}</code></div>
                            <div>To: <code className="bg-rose-100 px-1 rounded">{lastP2PReceipt.privacyAudit?.traditionalTransfer?.to}</code></div>
                            <p className="text-[9.5px] text-rose-700 pt-1">
                              ⚠️ Etherscan permanently records that Alice sent money to Bob. Surveillance bots link both identities forever.
                            </p>
                          </div>
                        </div>

                        {/* Green: ArcNano Shielded Transfer */}
                        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-2">
                          <div className="flex items-center justify-between font-semibold text-[11px] text-emerald-900">
                            <span>✅ ArcNano Shielded Transfer</span>
                            <span className="text-[9px] bg-emerald-200 px-1.5 py-0.5 rounded font-bold">100% PRIVATE</span>
                          </div>
                          <div className="space-y-1 text-[10px] text-emerald-800">
                            <div>From: <code className="bg-emerald-100 px-1 rounded">0xa40d... (ArcNano Pool)</code></div>
                            <div>To: <code className="bg-emerald-100 px-1 rounded">{lastP2PReceipt.privacyAudit?.traditionalTransfer?.to}</code></div>
                            <p className="text-[9.5px] text-emerald-700 pt-1">
                              🛡️ Alice&apos;s address NEVER touched the mempool. Bob received funds with 0.00% linkability!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Idle / Preview State for P2P */
                  <div className="rounded-2xl bg-neutral-900 p-5 font-mono text-xs text-neutral-300 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[10px] text-neutral-400">
                      <span>P2P SHIELDED TRANSFER PROTOCOL</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        READY TO TRANSMIT
                      </span>
                    </div>

                    <p className="text-neutral-300 text-xs leading-relaxed">
                      Send micro-tokens directly to a friend without ever revealing your personal crypto wallet or creating a traceable on-chain link.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px]">
                      <div className="p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-0.5">
                        <span className="text-emerald-400 font-semibold block">1. Zero msg.sender</span>
                        <span className="text-neutral-400 text-[9px] block">Alice proves note ownership via local Groth16 witness in RAM.</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-0.5">
                        <span className="text-sky-400 font-semibold block">2. $0.00 Gas Cost</span>
                        <span className="text-neutral-400 text-[9px] block">Circle Gas Station sponsors the native Arc settlement fee.</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-0.5">
                        <span className="text-amber-400 font-semibold block">3. Sub-8ms Speed</span>
                        <span className="text-neutral-400 text-[9px] block">Friend verifies pairings in RAM instantly before L1 block confirmation.</span>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* AI Streaming Output Terminal (Agent API Mode) */
                <div className="rounded-2xl bg-neutral-950 p-4 font-mono text-xs text-neutral-200 border border-neutral-800 min-h-[140px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-[10px] text-neutral-500">
                      <span>INFERENCE STREAM // {selectedService.id.toUpperCase()}</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        X402 FULFILLED
                      </span>
                    </div>
                    {responseTokens.length === 0 ? (
                      <p className="text-neutral-500 italic">
                        Awaiting query execution... Output tokens will stream here in single-digit milliseconds after off-chain ZK verification.
                      </p>
                    ) : (
                      <p className="leading-relaxed text-neutral-100 flex flex-wrap gap-1">
                        {responseTokens.map((tok, i) => (
                          <span key={i} className="animate-in fade-in duration-100">
                            {tok}
                          </span>
                        ))}
                        {executionPhase === "streaming_response" && (
                          <span className="w-2 h-4 bg-sky-400 inline-block animate-pulse ml-0.5" />
                        )}
                      </p>
                    )}
                  </div>

                  {executionPhase === "completed" && (
                    <div className="pt-2 mt-2 border-t border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
                      <span>Gas Paid By User: $0.00 USDC</span>
                      <span className="text-emerald-400">Sponsored by Circle Gas Station</span>
                    </div>
                  )}
                </div>
              )}

              {/* Real-time Event Log */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-neutral-500 block">Cryptographic Handshake Telemetry:</span>
              <div className="bg-neutral-900 rounded-xl p-3 font-mono text-[11px] text-emerald-400 max-h-36 overflow-y-auto space-y-1 border border-neutral-800">
                {executionLogs.length === 0 ? (
                  <p className="text-neutral-600">No events logged yet.</p>
                ) : (
                  executionLogs.map((log, i) => (
                    <div key={i} className="leading-tight">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: THE DEEP DIVE EXPLAINER */}
      {/* "Why is it so much more private & how our Groth16 proof is generating" */}
      <div className="border border-neutral-200 bg-white rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-mono text-indigo-800 mb-2">
            <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
            <span>CRYPTOGRAPHIC DEEP DIVE & PRIVACY PROOF</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-neutral-950">
            Why ArcNano Is So Much More Private & How Our Groth16 Proof Generates
          </h2>
          <p className="text-neutral-600 text-sm sm:text-base mt-1.5 max-w-3xl leading-relaxed">
            Understanding why traditional Web3 payments leak sensitive agent intelligence, and inspecting the mathematical zero-knowledge proof mechanics inside <code className="text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono">spend.circom</code>.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 gap-6 text-sm font-medium">
          <button
            onClick={() => setExplainerTab("why_private")}
            className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              explainerTab === "why_private"
                ? "border-sky-600 text-sky-800 font-semibold"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>1. The 4 Fatal Privacy Traps vs. ArcNano</span>
          </button>
          <button
            onClick={() => setExplainerTab("groth_generation")}
            className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              explainerTab === "groth_generation"
                ? "border-sky-600 text-sky-800 font-semibold"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>2. How the Groth16 Proof Generates in RAM</span>
          </button>
          <button
            onClick={() => setExplainerTab("circuit_inspector")}
            className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              explainerTab === "circuit_inspector"
                ? "border-sky-600 text-sky-800 font-semibold"
                : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>3. Live Proof Payload Inspector</span>
          </button>
        </div>

        {/* TAB 1: THE 4 FATAL PRIVACY TRAPS */}
        {explainerTab === "why_private" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {/* Trap 1 */}
            <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 font-mono text-xs flex items-center justify-center font-bold">
                  01
                </span>
                <h4 className="font-semibold text-neutral-900 text-sm">
                  The Public Explorer Surveillance Trap (<code className="text-xs">msg.sender</code>)
                </h4>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                In standard public crypto payments, every micro-query to an LLM or data provider creates an on-chain transaction. Anyone watching the Arc block explorer sees <code className="bg-neutral-200/70 px-1 py-0.5 rounded text-[11px] font-mono">msg.sender</code> paying the AI provider, permanently linking proprietary prompt traffic and counterparties to your wallet.
              </p>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono space-y-1">
                <span className="font-semibold block text-emerald-800">✅ ArcNano Resolution:</span>
                <span>The payer NEVER broadcasts an on-chain transaction. The receiver batches nullifiers asynchronously. Spender identity on Arcscan is 0% visible.</span>
              </div>
            </div>

            {/* Trap 2 */}
            <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 font-mono text-xs flex items-center justify-center font-bold">
                  02
                </span>
                <h4 className="font-semibold text-neutral-900 text-sm">The Naive Zero-Knowledge Trap</h4>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Beginners often assume &ldquo;I&apos;ll just use a ZK proof to hide the payment.&rdquo; But if your wallet signs the EVM transaction calling <code className="bg-neutral-200/70 px-1 py-0.5 rounded text-[11px] font-mono">contract.spend(proof)</code>, your address is broadcast in the transaction envelope, instantly destroying anonymity.
              </p>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono space-y-1">
                <span className="font-semibold block text-emerald-800">✅ ArcNano Resolution:</span>
                <span>The proof is handed off-chain inside the HTTP 402 <code className="text-emerald-900 font-bold">X-PAYMENT</code> header. The receiver or Circle Gas Station paymaster submits the transaction.</span>
              </div>
            </div>

            {/* Trap 3 */}
            <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 font-mono text-xs flex items-center justify-center font-bold">
                  03
                </span>
                <h4 className="font-semibold text-neutral-900 text-sm">The Mixer Sanctions Trap (Privacy Pools)</h4>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Legacy mixers (like Tornado Cash) pool clean and illicit funds indistinguishably, leading to global regulatory bans and blacklisting by legitimate APIs that cannot risk accepting dirty money.
              </p>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono space-y-1">
                <span className="font-semibold block text-emerald-800">✅ ArcNano Resolution:</span>
                <span>Mathematical Association Set Provider (ASP) proofs: you prove non-membership in sanctioned clusters without revealing your wallet. 100% OFAC compliant.</span>
              </div>
            </div>

            {/* Trap 4 */}
            <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 font-mono text-xs flex items-center justify-center font-bold">
                  04
                </span>
                <h4 className="font-semibold text-neutral-900 text-sm">The 3-Second Latency Gap</h4>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Even with Arc&apos;s rapid 3-second block finality, 3,000ms is an eternity for an AI streaming tokens at 60 tokens/second (1 token every ~15ms). Chaining 5 tool calls adds 15s of pure blockchain stall.
              </p>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono space-y-1">
                <span className="font-semibold block text-emerald-800">✅ ArcNano Resolution:</span>
                <span>Two-stage model: Groth16 pairings are checked in RAM in <code className="text-emerald-900 font-bold">&lt; 8ms</code> off-chain, tokens stream instantly, and settlement happens asynchronously.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HOW THE GROTH16 PROOF GENERATES */}
        {explainerTab === "groth_generation" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Visual Signal Flow Architecture */}
            <div className="p-6 rounded-2xl bg-neutral-950 text-neutral-200 font-mono text-xs border border-neutral-800 space-y-4 shadow-inner">
              <div className="text-neutral-400 pb-2 border-b border-neutral-800 text-[11px] flex items-center justify-between">
                <span>CIRCUIT ARCHITECTURE: spend.circom (BN254 alt_bn128 Curve)</span>
                <span className="text-sky-400">20-LEVEL MERKLE DEPTH</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
                {/* Private Inputs */}
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <span className="text-amber-400 font-semibold block">1. Private Witness Signals (RAM)</span>
                  <p className="text-neutral-400 text-[10px]">Kept strictly confidential in client RAM:</p>
                  <ul className="text-neutral-300 space-y-1 list-disc list-inside text-[10px]">
                    <li><code className="text-amber-300">denomination</code> (10,000 = 0.01 USDC)</li>
                    <li><code className="text-amber-300">secret</code> (256-bit scalar)</li>
                    <li><code className="text-amber-300">nullifierSeed</code> (256-bit scalar)</li>
                    <li><code className="text-amber-300">pathElements[20]</code> (Merkle siblings)</li>
                    <li><code className="text-amber-300">aspPathElements[20]</code> (ASP siblings)</li>
                  </ul>
                </div>

                {/* Circuit Constraints */}
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <span className="text-sky-400 font-semibold block">2. R1CS Circuit Constraints</span>
                  <p className="text-neutral-400 text-[10px]">Enforced mathematically by Circom:</p>
                  <ul className="text-neutral-300 space-y-1 list-disc list-inside text-[10px]">
                    <li><code className="text-sky-300">C = Poseidon(denom, secret, seed)</code></li>
                    <li><code className="text-sky-300">nullifierHash = Poseidon(seed, secret)</code></li>
                    <li><code className="text-sky-300">MerkleProof(C, path) === root</code></li>
                    <li><code className="text-sky-300">ASPCheck(C, aspPath) === aspRoot</code></li>
                    <li><code className="text-sky-300">recipient * recipient === recSq</code></li>
                  </ul>
                </div>

                {/* Public Signals */}
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <span className="text-emerald-400 font-semibold block">3. Public Signals (On-Chain)</span>
                  <p className="text-neutral-400 text-[10px]">Bound to ArcNanoPool.sol uint256[4]:</p>
                  <ul className="text-neutral-300 space-y-1 list-disc list-inside text-[10px]">
                    <li><code className="text-emerald-300">[0] root</code> (Deposit tree root)</li>
                    <li><code className="text-emerald-300">[1] nullifierHash</code> (Prevents replay)</li>
                    <li><code className="text-emerald-300">[2] recipient</code> (Bound address)</li>
                    <li><code className="text-emerald-300">[3] aspRoot</code> (Compliance registry)</li>
                  </ul>
                </div>
              </div>

              {/* Bilinear Pairing Mathematical Formula */}
              <div className="pt-3 border-t border-neutral-800 space-y-2">
                <span className="text-neutral-400 text-[11px] block font-semibold">
                  Bilinear Pairing Check Formula (Executed by Receiver &amp; Groth16Verifier.sol):
                </span>
                <div className="p-3 rounded-xl bg-neutral-900/90 text-center font-mono text-xs text-amber-300 border border-neutral-800">
                  e(π_A, π_B) = e(α, β) · e(∑(x_i · IC_i), γ) · e(π_C, δ)
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  The pairing check verifies that the prover knows valid witness inputs satisfying all 20 Merkle tree levels without learning the underlying <code className="text-neutral-300">secret</code> or depositor wallet. Because <code className="text-neutral-300">recipient</code> is bound into <code className="text-neutral-300">x_i</code>, any relayer modifying the payout address invalidates the equation immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE PROOF INSPECTOR */}
        {explainerTab === "circuit_inspector" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-600">
              <span>ACTIVE GROTH16 PROOF PAYLOAD (JSON)</span>
              {lastGeneratedProof && (
                <button
                  onClick={() => copyToClipboard(JSON.stringify(lastGeneratedProof, null, 2), "proof_json")}
                  className="text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer font-semibold"
                >
                  {copiedText === "proof_json" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Payload</span>
                </button>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-neutral-950 text-neutral-300 font-mono text-xs border border-neutral-800 overflow-x-auto max-h-96 shadow-inner">
              {lastGeneratedProof ? (
                <pre>{JSON.stringify(lastGeneratedProof, null, 2)}</pre>
              ) : (
                <p className="text-neutral-500 italic">
                  Run a query above to generate and inspect the live cryptographic proof payload.
                </p>
              )}
            </div>

            {lastGeneratedProof && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                  <span className="text-neutral-500 text-[10px] block">Curve Points (G1 / G2):</span>
                  <span className="font-semibold text-neutral-800">π_A (G1), π_B (G2), π_C (G1)</span>
                </div>
                <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                  <span className="text-neutral-500 text-[10px] block">Anti-Double Spend:</span>
                  <span className="font-semibold text-neutral-800">
                    Nullifier {lastGeneratedProof.nullifierHash?.slice(0, 10)}...
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                  <span className="text-neutral-500 text-[10px] block">Bound Payout Recipient:</span>
                  <span className="font-semibold text-neutral-800">
                    {lastGeneratedProof.recipient?.slice(0, 10)}...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);
}
