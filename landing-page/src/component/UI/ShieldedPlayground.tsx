"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  Lock,
  ArrowRight,
  Wallet,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Zap,
  CheckCircle2,
  DollarSign,
  Send,
  ArrowDownToLine,
  ArrowUpFromLine,
  X,
  Scale,
  Cpu,
  QrCode,
  Smartphone,
  LogOut,
} from "lucide-react";

// Arc Testnet Constants
const ARC_CHAIN_ID = 5042002;
const ARC_CHAIN_HEX = "0x4cef12";
const POOL_CONTRACT = "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";
const DEFAULT_RECIPIENT = "0x71C25e79603348f98A53E42D7Fe920d31F1Aa89F"; // Bob

interface DemoFriend {
  id: string;
  name: string;
  handle: string;
  address: string;
  avatar: string;
}

const DEMO_FRIENDS: DemoFriend[] = [
  {
    id: "bob",
    name: "Bob",
    handle: "@bob_research",
    address: "0x71C25e79603348f98A53E42D7Fe920d31F1Aa89F",
    avatar: "🤖",
  },
  {
    id: "charlie",
    name: "Charlie",
    handle: "@charlie_dev",
    address: "0x3A2bF88C0f6120D51b8D361301981F287A791cB7",
    avatar: "🦊",
  },
  {
    id: "david",
    name: "David",
    handle: "@david_crypto",
    address: "0x063829800C7214C6AaD38f57C72561641cD80333",
    avatar: "👤",
  },
];

interface ShieldedNote {
  id: string;
  denominationFormatted: string;
  amount: number;
  commitment: string;
  nullifierHash: string;
  secret: string;
  nullifierSeed: string;
  isSpent: boolean;
  createdAt: string;
}

export default function ShieldedPlayground() {
  // Navigation tab: 'deposit' | 'send' | 'withdraw'
  const [activeTab, setActiveTab] = useState<"deposit" | "send" | "withdraw">("deposit");

  // Wallet Connection State
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<number>(5.00);
  const [connectedWalletName, setConnectedWalletName] = useState<string>("MetaMask");
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const [walletModalView, setWalletModalView] = useState<"select" | "walletconnect_qr">("select");
  const [walletDropdownOpen, setWalletDropdownOpen] = useState<boolean>(false);
  const [wcCopied, setWcCopied] = useState<boolean>(false);

  // Shielded Notes Vault (initialize with 3 unspent 0.01 USDC notes)
  const [notes, setNotes] = useState<ShieldedNote[]>([
    {
      id: "note-1",
      denominationFormatted: "0.01 USDC",
      amount: 0.01,
      commitment: "0x7b4a8e29f10c49b2910a3d9e48c0b291c9f0a1b2",
      nullifierHash: "0x11223344556677889900aabbccddeeff00112233",
      secret: "0x28f9a0c3b8471e95...",
      nullifierSeed: "0x98b7d6a5c4e3f210...",
      isSpent: false,
      createdAt: "10m ago",
    },
    {
      id: "note-2",
      denominationFormatted: "0.01 USDC",
      amount: 0.01,
      commitment: "0x3f9c2d1e0a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d",
      nullifierHash: "0x223344556677889900aabbccddeeff0011223344",
      secret: "0x74e92a10b8c73d5f...",
      nullifierSeed: "0x1a2b3c4d5e6f7a8b...",
      isSpent: false,
      createdAt: "5m ago",
    },
    {
      id: "note-3",
      denominationFormatted: "0.01 USDC",
      amount: 0.01,
      commitment: "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b",
      nullifierHash: "0x3344556677889900aabbccddeeff001122334455",
      secret: "0x9c8b7a6f5e4d3c2b...",
      nullifierSeed: "0x5f6e7d8c9b0a1b2c...",
      isSpent: false,
      createdAt: "Just now",
    },
  ]);

  // SEND TAB STATE
  const [sendAmount, setSendAmount] = useState<string>("0.01");
  const [recipientAddress, setRecipientAddress] = useState<string>(DEFAULT_RECIPIENT);
  const [sendBalanceType, setSendBalanceType] = useState<"private" | "public">("private");

  // DEPOSIT TAB STATE
  const [depositAmount, setDepositAmount] = useState<string>("0.01");

  // WITHDRAW TAB STATE
  const [withdrawRecipient, setWithdrawRecipient] = useState<string>("");
  const [withdrawNoteId, setWithdrawNoteId] = useState<string>("");

  // EXECUTION & MODAL STATE
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculate unspent shielded balance
  const unspentNotes = notes.filter((n) => !n.isSpent);
  const shieldedBalance = (unspentNotes.length * 0.01).toFixed(2);

  // Sync default withdraw recipient with connected wallet
  useEffect(() => {
    if (walletAddress && !withdrawRecipient) {
      setWithdrawRecipient(walletAddress);
    }
  }, [walletAddress, withdrawRecipient]);

  // Select default note for withdraw if available
  useEffect(() => {
    if (unspentNotes.length > 0 && !withdrawNoteId) {
      setWithdrawNoteId(unspentNotes[0].id);
    }
  }, [unspentNotes, withdrawNoteId]);

  // 1. CONNECT INJECTED WALLET (MetaMask, Rabby, Brave)
  const handleConnectInjected = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const ethereum = (window as any).ethereum;
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts && accounts[0]) {
          // Attempt network switch to Arc Testnet (5042002 / 0x4cef12)
          try {
            await ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: ARC_CHAIN_HEX }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: ARC_CHAIN_HEX,
                    chainName: "Arc Testnet",
                    nativeCurrency: { name: "Arc", symbol: "ARC", decimals: 18 },
                    rpcUrls: ["https://rpc.testnet.arc.network"],
                    blockExplorerUrls: ["https://testnet.arcscan.io"],
                  },
                ],
              });
            }
          }

          setWalletAddress(accounts[0]);
          setIsWalletConnected(true);
          setConnectedWalletName("MetaMask");
          setWalletModalOpen(false);
          return;
        }
      } catch (err) {
        console.warn("User rejected injected wallet connection", err);
      }
    } else {
      alert("No Web3 browser wallet detected! Switching to Arc Ephemeral Sandbox.");
      handleConnectDemo();
    }
  };

  // 2. CONNECT WALLETCONNECT
  const handleOpenWalletConnect = () => {
    setWalletModalView("walletconnect_qr");
  };

  const handleSimulateWcApproval = () => {
    const mockWcAddress = "0x71C25e79603348f98A53E42D7Fe920d31F1Aa89F";
    setWalletAddress(mockWcAddress);
    setIsWalletConnected(true);
    setConnectedWalletName("WalletConnect");
    setWalletModalOpen(false);
    setWalletModalView("select");
  };

  // 3. CONNECT COINBASE WALLET
  const handleConnectCoinbase = () => {
    const mockCbAddress = "0x3A2bF88C0f6120D51b8D361301981F287A791cB7";
    setWalletAddress(mockCbAddress);
    setIsWalletConnected(true);
    setConnectedWalletName("Coinbase Wallet");
    setWalletModalOpen(false);
  };

  // 4. CONNECT DEMO AGENT WALLET (Instant Sandbox)
  const handleConnectDemo = () => {
    setWalletAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    setWalletBalance(5.00);
    setIsWalletConnected(true);
    setConnectedWalletName("Arc Sandbox Wallet");
    setWalletModalOpen(false);
  };

  // DISCONNECT
  const handleDisconnect = () => {
    setIsWalletConnected(false);
    setWalletAddress("");
    setWalletDropdownOpen(false);
  };

  // EXECUTE SEND (ANONYMOUS P2P)
  const handleSend = async () => {
    if (!isWalletConnected) {
      setWalletModalOpen(true);
      return;
    }

    if (unspentNotes.length === 0) {
      alert("No unspent shielded notes available! Please deposit to mint a shielded note first.");
      setActiveTab("deposit");
      return;
    }

    const noteToSpend = unspentNotes[0];
    const targetRecip = recipientAddress.trim() || DEFAULT_RECIPIENT;

    setIsProcessing(true);
    setProcessingStatus("Generating Groth16 witness in RAM...");

    try {
      await new Promise((r) => setTimeout(r, 260));
      setProcessingStatus("Synthesizing alt_bn128 curve proof...");

      await new Promise((r) => setTimeout(r, 220));
      setProcessingStatus("Verifying pairing equations off-chain (<8ms)...");

      const response = await fetch("/api/playground", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Payment": JSON.stringify({
            proof: {
              pi_a: ["0x1", "0x2"],
              pi_b: [["0x3", "0x4"], ["0x5", "0x6"]],
              pi_c: ["0x7", "0x8"],
            },
            publicSignals: [
              "15055926234077295509216400193975320613085685875483293700481590095656163448343",
              noteToSpend.nullifierHash,
              targetRecip,
              "19128018104003351169958007405541096654276287024914820341236452486826146398487",
            ],
            nullifierHash: noteToSpend.nullifierHash,
            recipient: targetRecip,
          }),
        },
        body: JSON.stringify({
          mode: "p2p_friend",
          recipient: targetRecip,
          amount: `${sendAmount} USDC`,
          senderAddress: walletAddress,
          memo: "Anonymous transfer via ArcNano",
        }),
      });

      const data = await response.json();

      setNotes((prev) =>
        prev.map((n) => (n.id === noteToSpend.id ? { ...n, isSpent: true } : n))
      );

      setLastReceipt({
        type: "send",
        amount: `${sendAmount} USDC`,
        recipient: targetRecip,
        latencyMs: data.verificationLatencyMs || 0.42,
        nullifierHash: noteToSpend.nullifierHash,
        sponsor: "Circle Gas Station",
        privacyAudit: data.settlement?.privacyAudit,
      });
    } catch (err) {
      console.error(err);
      alert("Transfer simulation failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  // EXECUTE DEPOSIT
  const handleDeposit = async () => {
    if (!isWalletConnected) {
      setWalletModalOpen(true);
      return;
    }

    const depositAmt = parseFloat(depositAmount) || 0.01;
    if (walletBalance < depositAmt) {
      alert("Insufficient public wallet balance for deposit!");
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Generating random 256-bit scalar & Poseidon commitment in RAM...");

    await new Promise((r) => setTimeout(r, 350));
    setProcessingStatus("Submitting gasless deposit to ArcNanoPool.sol...");

    await new Promise((r) => setTimeout(r, 400));

    const randHex = Math.random().toString(16).substring(2, 10);
    const newNote: ShieldedNote = {
      id: `note-${Date.now()}`,
      denominationFormatted: `${depositAmt.toFixed(2)} USDC`,
      amount: depositAmt,
      commitment: `0x${randHex}9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4`,
      nullifierHash: `0x${randHex}11223344556677889900aabbccddeeff`,
      secret: `0x${randHex}c8b7a6f5e4...`,
      nullifierSeed: `0x${randHex}7d8c9b0a1b...`,
      isSpent: false,
      createdAt: "Just now",
    };

    setNotes((prev) => [newNote, ...prev]);
    setWalletBalance((prev) => Math.max(0, prev - depositAmt));

    setLastReceipt({
      type: "deposit",
      amount: `${depositAmt.toFixed(2)} USDC`,
      commitment: newNote.commitment,
      noteId: newNote.id,
      pool: POOL_CONTRACT,
    });

    setIsProcessing(false);
    setProcessingStatus("");
  };

  // EXECUTE WITHDRAW
  const handleWithdraw = async () => {
    if (!isWalletConnected) {
      setWalletModalOpen(true);
      return;
    }

    const noteToWithdraw = notes.find((n) => n.id === withdrawNoteId && !n.isSpent);
    if (!noteToWithdraw) {
      alert("Please select an active unspent shielded note to withdraw.");
      return;
    }

    const targetRecip = withdrawRecipient.trim() || walletAddress;

    setIsProcessing(true);
    setProcessingStatus("Synthesizing Groth16 withdrawal proof...");

    await new Promise((r) => setTimeout(r, 300));
    setProcessingStatus("Relaying nullifier to ArcNanoPool.sol via Circle Gas Station...");

    await new Promise((r) => setTimeout(r, 380));

    setNotes((prev) =>
      prev.map((n) => (n.id === noteToWithdraw.id ? { ...n, isSpent: true } : n))
    );
    setWalletBalance((prev) => prev + noteToWithdraw.amount);

    setLastReceipt({
      type: "withdraw",
      amount: noteToWithdraw.denominationFormatted,
      recipient: targetRecip,
      nullifierHash: noteToWithdraw.nullifierHash,
      sponsor: "Circle Gas Station ($0.00 Gas)",
    });

    setIsProcessing(false);
    setProcessingStatus("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-10 px-4 sm:px-6">
      {/* Sleek Dotted Grid Matrix Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1.2px, transparent 1.2px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative Matrix Shield Halo behind the Hero & Card */}
      <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[580px] bg-gradient-to-b from-blue-400/10 via-indigo-400/10 to-transparent blur-3xl rounded-full" />

      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center">
        
        {/* WALLET CONNECTION STATUS / TRIGGER BAR */}
        <div className="mb-4 relative">
          {!isWalletConnected ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setWalletModalView("select");
                  setWalletModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200/90 shadow-xs text-xs font-medium text-neutral-800 transition-all cursor-pointer hover:border-neutral-300"
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <Wallet className="w-3.5 h-3.5 text-[#0033FF]" />
                <span className="font-semibold">Connect Wallet</span>
                <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200/60">
                  WalletConnect / Injected
                </span>
              </button>

              <button
                type="button"
                onClick={handleConnectDemo}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-[#0033FF] border border-blue-200/80 text-xs font-mono font-medium transition-colors cursor-pointer shadow-2xs"
                title="1-Click Instant Demo Wallet with funded test balance"
              >
                <Sparkles className="w-3 h-3 text-[#0033FF]" />
                <span>Instant Demo</span>
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/95 border border-neutral-200/90 shadow-2xs text-[11px] font-mono text-neutral-600">
              <button
                type="button"
                onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                className="flex items-center gap-1.5 text-neutral-800 hover:text-neutral-950 font-medium cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>
              <span className="text-neutral-300">|</span>
              <span>
                Shielded: <strong className="text-neutral-900 font-semibold">{shieldedBalance} USDC</strong>
              </span>
              <span className="text-neutral-300">|</span>
              <span>
                Public: <strong className="text-neutral-700">{walletBalance.toFixed(2)} USDC</strong>
              </span>

              {/* Wallet Dropdown Menu */}
              {walletDropdownOpen && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-white rounded-2xl border border-neutral-200 shadow-xl p-3 z-30 space-y-2 text-xs font-sans">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block">Connected via</span>
                      <span className="font-semibold text-neutral-900 text-xs">{connectedWalletName}</span>
                    </div>
                    <span className="text-[9.5px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                      Arc Testnet
                    </span>
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        copyToClipboard(walletAddress);
                        setWalletDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 flex items-center justify-between text-xs cursor-pointer font-mono"
                    >
                      <span>Copy Address</span>
                      <Copy className="w-3 h-3 text-neutral-400" />
                    </button>

                    <a
                      href={`https://testnet.arcscan.io/address/${walletAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 flex items-center justify-between text-xs cursor-pointer font-mono"
                    >
                      <span>View on Arcscan</span>
                      <ExternalLink className="w-3 h-3 text-neutral-400" />
                    </a>
                  </div>

                  <div className="pt-1.5 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="w-full py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* THE UMBRA-STYLE CARD */}
        <div className="w-full max-w-[480px] bg-white rounded-[28px] border border-neutral-200/90 shadow-xl shadow-neutral-900/5 p-4 sm:p-5 transition-all">
          
          {/* TOP TABS: DEPOSIT / SEND / WITHDRAW */}
          <div className="bg-neutral-100/90 p-1 rounded-2xl flex items-center justify-between mb-4 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("deposit")}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer text-center ${
                activeTab === "deposit"
                  ? "bg-white text-neutral-950 font-semibold shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              Deposit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("send")}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer text-center ${
                activeTab === "send"
                  ? "bg-white text-neutral-950 font-semibold shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              Send
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("withdraw")}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer text-center ${
                activeTab === "withdraw"
                  ? "bg-white text-neutral-950 font-semibold shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              Withdraw
            </button>
          </div>

          {/* TAB 1: SEND */}
          {activeTab === "send" && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* Box 1: You're sending */}
              <div className="bg-neutral-50/90 border border-neutral-200/70 rounded-2xl p-4 transition-colors focus-within:border-neutral-300">
                <span className="text-[11px] text-neutral-500 font-medium block mb-1">
                  You&apos;re sending
                </span>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <input
                      type="number"
                      step="0.01"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="0"
                      className="w-full text-3xl sm:text-4xl font-semibold text-neutral-900 bg-transparent focus:outline-none placeholder-neutral-300 tracking-tight"
                    />
                    <span className="text-xs text-neutral-400 block mt-0.5 font-mono">
                      ${sendAmount ? (parseFloat(sendAmount) || 0).toFixed(2) : "0.00"}
                    </span>
                  </div>

                  {/* Token selector pill */}
                  <div className="flex items-center gap-2 bg-white border border-neutral-200/90 px-3 py-1.5 rounded-full shadow-2xs shrink-0">
                    <div className="w-5 h-5 rounded-full bg-[#2775CA] text-white flex items-center justify-center text-[10px] font-bold">
                      $
                    </div>
                    <span className="text-xs font-semibold text-neutral-900">USDC</span>
                    <span className="text-[10px] text-neutral-400 font-mono">Arc</span>
                  </div>
                </div>

                {/* Quick denomination chips */}
                <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-neutral-200/60 text-[11px] font-mono">
                  <span className="text-neutral-400 text-[10px]">Quick:</span>
                  {["0.01", "0.05", "0.10"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSendAmount(amt)}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        sendAmount === amt
                          ? "bg-neutral-900 text-white font-semibold"
                          : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                  <span className="ml-auto text-[10px] text-neutral-400">
                    Avail: {shieldedBalance} USDC
                  </span>
                </div>
              </div>

              {/* Box 2: Receiving address */}
              <div className="bg-neutral-50/90 border border-neutral-200/70 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 font-medium">
                    Receiving address
                  </span>
                  <div className="flex items-center gap-1 bg-neutral-200/70 p-0.5 rounded-lg text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setSendBalanceType("private")}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        sendBalanceType === "private"
                          ? "bg-white text-neutral-900 font-semibold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      Private balance
                    </button>
                    <button
                      type="button"
                      onClick={() => setSendBalanceType("public")}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        sendBalanceType === "public"
                          ? "bg-white text-neutral-900 font-semibold shadow-2xs"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      Public balance
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white border border-neutral-200/90 rounded-xl px-3 py-2 shadow-2xs">
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Enter an Arc address"
                    className="w-full text-xs font-mono text-neutral-900 bg-transparent focus:outline-none placeholder-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const clip = await navigator.clipboard.readText();
                        if (clip && clip.startsWith("0x")) setRecipientAddress(clip.trim());
                      } catch {
                        setRecipientAddress(DEFAULT_RECIPIENT);
                      }
                    }}
                    className="text-[11px] font-mono font-medium text-neutral-600 hover:text-neutral-950 px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Paste
                  </button>
                </div>

                {/* Friend Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-neutral-400 font-mono">Friends:</span>
                  {DEMO_FRIENDS.map((friend) => (
                    <button
                      key={friend.id}
                      type="button"
                      onClick={() => setRecipientAddress(friend.address)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                        recipientAddress.toLowerCase() === friend.address.toLowerCase()
                          ? "bg-blue-50 border-blue-300 text-blue-800 font-semibold"
                          : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                      }`}
                    >
                      <span>{friend.avatar}</span>
                      <span>{friend.name}</span>
                    </button>
                  ))}
                </div>

                <p className="text-[10.5px] text-neutral-400">
                  Enter a recipient to choose where funds arrive.
                </p>
              </div>

              {/* Box 3: Send using */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-3.5 flex items-center justify-between transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-blue-200/80 flex items-center justify-center text-[#0033FF] shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-[#0033FF]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-900">
                      ArcNano Privacy
                    </h4>
                    <p className="text-[10.5px] text-neutral-500">
                      Your default option for private sending.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                    0% Spender Trace
                  </span>
                </div>
              </div>

              {/* Box 4: Fee & Details */}
              <div className="bg-neutral-50/70 border border-neutral-200/70 rounded-2xl p-3.5 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>Total fee</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                    $0.00 (Circle Gas Station)
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>Total received</span>
                  <span className="text-neutral-900 font-semibold">
                    {sendAmount || "0.00"} USDC
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>Verification speed</span>
                  <span className="text-blue-700 font-medium">
                    &lt; 8ms (Groth16 in RAM)
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>Receiving address</span>
                  <span className="text-neutral-700 truncate max-w-[170px]">
                    {recipientAddress ? `${recipientAddress.slice(0, 8)}...${recipientAddress.slice(-4)}` : "—"}
                  </span>
                </div>
              </div>

              {/* PRIMARY CTA BUTTON */}
              {!isWalletConnected ? (
                <button
                  type="button"
                  onClick={() => {
                    setWalletModalView("select");
                    setWalletModalOpen(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#0033FF] hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet to Send</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isProcessing || unspentNotes.length === 0}
                  className="w-full py-3.5 rounded-2xl bg-[#0033FF] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{processingStatus || "Synthesizing Proof..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Privately</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* TAB 2: DEPOSIT */}
          {activeTab === "deposit" && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* Box 1: You're depositing */}
              <div className="bg-neutral-50/90 border border-neutral-200/70 rounded-2xl p-4">
                <span className="text-[11px] text-neutral-500 font-medium block mb-1">
                  You&apos;re depositing into Shielded Pool
                </span>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <input
                      type="number"
                      step="0.01"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.01"
                      className="w-full text-3xl sm:text-4xl font-semibold text-neutral-900 bg-transparent focus:outline-none placeholder-neutral-300 tracking-tight"
                    />
                    <span className="text-xs text-neutral-400 block mt-0.5 font-mono">
                      ${depositAmount ? (parseFloat(depositAmount) || 0).toFixed(2) : "0.00"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white border border-neutral-200/90 px-3 py-1.5 rounded-full shadow-2xs shrink-0">
                    <div className="w-5 h-5 rounded-full bg-[#2775CA] text-white flex items-center justify-center text-[10px] font-bold">
                      $
                    </div>
                    <span className="text-xs font-semibold text-neutral-900">USDC</span>
                    <span className="text-[10px] text-neutral-400 font-mono">Arc</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-neutral-200/60 text-[11px] font-mono">
                  <span className="text-neutral-400 text-[10px]">Select Denomination:</span>
                  {["0.01", "0.05", "0.10", "1.00"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        depositAmount === amt
                          ? "bg-neutral-900 text-white font-semibold"
                          : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Box 2: Shielded Note Preview (Off-Chain RAM) */}
              <div className="bg-neutral-50/90 border border-neutral-200/70 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 font-medium flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Shielded Note Generated in RAM</span>
                  </span>
                  <span className="text-[10px] font-mono bg-amber-100/70 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                    Off-Chain Secret
                  </span>
                </div>
                <p className="text-[10.5px] text-neutral-500 leading-relaxed">
                  A random 256-bit scalar and Poseidon commitment are synthesized locally in browser RAM. Your address is never stored on the deposit note.
                </p>
                <div className="p-2.5 rounded-xl bg-white border border-neutral-200 font-mono text-[10px] text-neutral-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Target Pool:</span>
                    <span className="font-semibold text-neutral-800">{POOL_CONTRACT.slice(0, 10)}...{POOL_CONTRACT.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Deposit Gas:</span>
                    <span className="text-emerald-700 font-semibold">$0.00 (Gasless Circle Sponsor)</span>
                  </div>
                </div>
              </div>

              {/* PRIMARY CTA BUTTON */}
              {!isWalletConnected ? (
                <button
                  type="button"
                  onClick={() => {
                    setWalletModalView("select");
                    setWalletModalOpen(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#0033FF] hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet to Deposit</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDeposit}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-[#0033FF] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{processingStatus || "Depositing..."}</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>Deposit &amp; Mint Shielded Note</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* TAB 3: WITHDRAW */}
          {activeTab === "withdraw" && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* Box 1: Note Selector */}
              <div className="bg-neutral-50/90 border border-neutral-200/70 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 font-medium">
                    Select Shielded Note to Withdraw
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {unspentNotes.length} Notes Available
                  </span>
                </div>

                {unspentNotes.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-neutral-200 rounded-xl text-xs text-neutral-500">
                    No unspent notes found in vault. Please deposit first.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                    {unspentNotes.map((note) => {
                      const isSel = withdrawNoteId === note.id;
                      return (
                        <div
                          key={note.id}
                          onClick={() => setWithdrawNoteId(note.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs font-mono ${
                            isSel
                              ? "bg-blue-50 border-blue-400 text-blue-950 font-semibold shadow-2xs"
                              : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {note.denominationFormatted}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            Commitment: {note.commitment.slice(0, 10)}...
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Box 2: Payout destination address */}
              <div className="bg-neutral-50/90 border border-neutral-200/70 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 font-medium">
                    Payout Destination Address
                  </span>
                  {isWalletConnected && (
                    <button
                      type="button"
                      onClick={() => setWithdrawRecipient(walletAddress)}
                      className="text-[10px] font-mono text-blue-700 hover:text-blue-900 cursor-pointer"
                    >
                      Use My Wallet
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={withdrawRecipient}
                  onChange={(e) => setWithdrawRecipient(e.target.value)}
                  placeholder="0x... (Public Wallet Address)"
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-neutral-800"
                />
                <p className="text-[10.5px] text-neutral-400">
                  The pool will dispense funds directly to this address with zero linkage to the initial depositor.
                </p>
              </div>

              {/* Box 3: Breakdown */}
              <div className="bg-neutral-50/70 border border-neutral-200/70 rounded-2xl p-3.5 space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>Withdrawal fee</span>
                  <span className="text-emerald-700 font-semibold">$0.00 (Gasless)</span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>Traceability</span>
                  <span className="text-emerald-700 font-semibold">0.0% Unlinkable</span>
                </div>
              </div>

              {/* PRIMARY CTA BUTTON */}
              {!isWalletConnected ? (
                <button
                  type="button"
                  onClick={() => {
                    setWalletModalView("select");
                    setWalletModalOpen(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#0033FF] hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet to Withdraw</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={isProcessing || unspentNotes.length === 0}
                  className="w-full py-3.5 rounded-2xl bg-[#0033FF] hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{processingStatus || "Withdrawing..."}</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpFromLine className="w-4 h-4" />
                      <span>Generate ZK Proof &amp; Withdraw</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM HELPER BANNER */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-mono text-neutral-400">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>ArcNano Protocol • Alt_bn128 Alt-Curve ZK Nanopayments</span>
        </div>
      </div>

      {/* WALLETCONNECT / WEB3MODAL CONNECTION MODAL */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
              {walletModalView === "walletconnect_qr" ? (
                <button
                  type="button"
                  onClick={() => setWalletModalView("select")}
                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#0033FF] flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-900">Connect a Wallet</h3>
                    <p className="text-[10px] text-neutral-400 font-mono">Arc Testnet (5042002)</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setWalletModalOpen(false);
                  setWalletModalView("select");
                }}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content: Provider Selection */}
            {walletModalView === "select" ? (
              <div className="p-4 space-y-2.5">
                {/* 1. MetaMask / Injected Extension */}
                <button
                  type="button"
                  onClick={handleConnectInjected}
                  className="w-full p-3.5 rounded-2xl border border-neutral-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-lg shadow-2xs">
                      🦊
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-neutral-900 group-hover:text-blue-900">
                        MetaMask / Browser
                      </h4>
                      <p className="text-[10px] text-neutral-400">
                        Connect browser extension
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 group-hover:bg-blue-100 group-hover:text-blue-700 px-2 py-0.5 rounded-md font-medium">
                    Detected
                  </span>
                </button>

                {/* 2. WalletConnect */}
                <button
                  type="button"
                  onClick={handleOpenWalletConnect}
                  className="w-full p-3.5 rounded-2xl border border-neutral-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3B99FC]/10 border border-[#3B99FC]/30 flex items-center justify-center shadow-2xs">
                      <QrCode className="w-5 h-5 text-[#3B99FC]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-neutral-900 group-hover:text-blue-900">
                        WalletConnect
                      </h4>
                      <p className="text-[10px] text-neutral-400">
                        Scan QR with mobile wallet
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#3B99FC] bg-blue-50 px-2 py-0.5 rounded-md font-medium border border-blue-200/60">
                    QR Code
                  </span>
                </button>

                {/* 3. Coinbase Wallet */}
                <button
                  type="button"
                  onClick={handleConnectCoinbase}
                  className="w-full p-3.5 rounded-2xl border border-neutral-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0052FF]/10 border border-[#0052FF]/30 flex items-center justify-center shadow-2xs">
                      <div className="w-4 h-4 rounded-full bg-[#0052FF]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-neutral-900 group-hover:text-blue-900">
                        Coinbase Wallet
                      </h4>
                      <p className="text-[10px] text-neutral-400">
                        Smart wallet or mobile app
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600" />
                </button>

                {/* 4. Instant Demo Sandbox */}
                <div className="pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={handleConnectDemo}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-200/80 hover:border-blue-400 transition-all flex items-center justify-between cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#0033FF] text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-neutral-900">
                          Arc Sandbox Wallet
                        </h4>
                        <p className="text-[10px] text-neutral-500">
                          Instant testnet wallet (Funded $5 USDC)
                        </p>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-semibold">
                      1-Click
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* Modal Content: WalletConnect QR Code View */
              <div className="p-5 text-center space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-neutral-900">
                    Scan with WalletConnect
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Scan with Rainbow, Trust Wallet, MetaMask Mobile, or any supported app.
                  </p>
                </div>

                {/* Simulated QR Code Canvas */}
                <div className="relative mx-auto w-56 h-56 p-3 bg-white rounded-2xl border-2 border-blue-500/30 shadow-md flex flex-col items-center justify-center">
                  {/* Decorative Scan Corners */}
                  <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#3B99FC]" />
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#3B99FC]" />
                  <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#3B99FC]" />
                  <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#3B99FC]" />

                  {/* QR Pattern Representation */}
                  <div className="w-full h-full bg-neutral-950 rounded-xl p-2 flex items-center justify-center relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-80"
                      style={{
                        backgroundImage: `radial-gradient(#ffffff 2px, transparent 2px)`,
                        backgroundSize: "8px 8px",
                      }}
                    />
                    {/* Center WalletConnect Badge */}
                    <div className="relative z-10 w-12 h-12 rounded-xl bg-[#3B99FC] text-white flex items-center justify-center shadow-lg border-2 border-white">
                      <QrCode className="w-7 h-7" />
                    </div>
                  </div>
                </div>

                {/* Pairing Code Copy */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      copyToClipboard("wc:8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b@2?relay-protocol=irn");
                      setWcCopied(true);
                      setTimeout(() => setWcCopied(false), 2000);
                    }}
                    className="text-[11px] font-mono text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg border border-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {wcCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{wcCopied ? "URI Copied" : "Copy Pairing Code"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateWcApproval}
                    className="text-[11px] font-medium text-white bg-[#0033FF] hover:bg-blue-700 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Simulate Connect
                  </button>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-center">
              <span className="text-[10px] text-neutral-400 font-mono">
                ArcNano Shielded Nanopayments • Alt_bn128 Alt-Curve
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION RECEIPT MODAL */}
      {lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-neutral-900">
                    {lastReceipt.type === "send"
                      ? "Shielded Payment Delivered!"
                      : lastReceipt.type === "deposit"
                      ? "Shielded Note Minted!"
                      : "Withdrawal Succeeded!"}
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-600 block">
                    Zero-Knowledge Proof Verified
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLastReceipt(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Summary Body */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Amount:</span>
                <span className="font-bold text-neutral-900">{lastReceipt.amount}</span>
              </div>

              {lastReceipt.recipient && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Recipient:</span>
                  <span className="text-neutral-800 font-medium">
                    {lastReceipt.recipient.slice(0, 8)}...{lastReceipt.recipient.slice(-4)}
                  </span>
                </div>
              )}

              {lastReceipt.latencyMs && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Verification Latency:</span>
                  <span className="text-emerald-700 font-semibold">
                    {lastReceipt.latencyMs.toFixed(3)} ms (Target &lt;8ms)
                  </span>
                </div>
              )}

              {lastReceipt.nullifierHash && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Nullifier Hash:</span>
                  <span className="text-neutral-700">
                    {lastReceipt.nullifierHash.slice(0, 10)}...
                  </span>
                </div>
              )}

              {lastReceipt.commitment && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Note Commitment:</span>
                  <span className="text-neutral-700">
                    {lastReceipt.commitment.slice(0, 10)}...
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-200/80 flex justify-between items-center text-[10.5px]">
                <span className="text-neutral-500">Gas Paid:</span>
                <span className="text-emerald-700 font-semibold">$0.00 (Circle Gas Station)</span>
              </div>

              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-neutral-500">Spender Linkability:</span>
                <span className="text-emerald-700 font-semibold">0.00% (Unlinkable)</span>
              </div>
            </div>

            {/* Public Blockchain vs Shielded Contrast */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] font-mono text-blue-900 space-y-1">
              <span className="font-semibold block text-blue-800">
                🛡️ Arcscan Blockchain Verification:
              </span>
              <p className="text-[10px] text-blue-700 leading-relaxed">
                Public explorers see <code className="bg-blue-100 px-1 py-0.5 rounded">{POOL_CONTRACT.slice(0, 8)}... (ArcNano Pool)</code> as the originator. Your personal wallet address was never broadcast on-chain!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLastReceipt(null)}
              className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs font-mono transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
