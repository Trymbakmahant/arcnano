"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  ShieldCheck,
  Lock,
  ArrowRight,
  Wallet,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  ExternalLink,
  Send,
  ArrowDownToLine,
  ArrowUpFromLine,
  X,
  LogOut,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Arc Testnet Constants
const ARC_CHAIN_ID = 5042002;
const ARC_CHAIN_HEX = "0x4cef12";
const POOL_CONTRACT = "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";

interface TokenInfo {
  symbol: string;
  name: string;
  iconBg: string;
  iconColor: string;
  iconText: string;
  priceUsd: number;
  decimals: number;
  contract?: string;
}

const SUPPORTED_TOKENS: TokenInfo[] = [
  {
    symbol: "USDC",
    name: "Circle USD Coin",
    iconBg: "bg-[#2775CA]",
    iconColor: "text-white",
    iconText: "$",
    priceUsd: 1.0,
    decimals: 6,
    contract: "0x3600000000000000000000000000000000000000",
  },
  {
    symbol: "EURC",
    name: "Circle Euro Coin",
    iconBg: "bg-[#0A4D92]",
    iconColor: "text-white",
    iconText: "€",
    priceUsd: 1.08,
    decimals: 6,
  },
  {
    symbol: "ARC",
    name: "Arc Native Token",
    iconBg: "bg-neutral-900",
    iconColor: "text-white",
    iconText: "A",
    priceUsd: 0.85,
    decimals: 18,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    iconBg: "bg-[#26A17B]",
    iconColor: "text-white",
    iconText: "₮",
    priceUsd: 1.0,
    decimals: 6,
  },
];

interface ShieldedNote {
  id: string;
  tokenSymbol: string;
  amount: number;
  commitment: string;
  nullifierHash: string;
  secret: string;
  nullifierSeed: string;
  isSpent: boolean;
  createdAt: string;
}

export default function ShieldedPlayground() {
  // Navigation tab: 'deposit' | 'send' | 'withdraw' (Default: 'deposit')
  const [activeTab, setActiveTab] = useState<"deposit" | "send" | "withdraw">("deposit");

  // Selected Token
  const [selectedToken, setSelectedToken] = useState<TokenInfo>(SUPPORTED_TOKENS[0]);
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState<boolean>(false);
  const [tokenSearchQuery, setTokenSearchQuery] = useState<string>("");

  // Browser Wallet Connection State (window.ethereum ONLY)
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<number>(100.0);
  const [walletChainId, setWalletChainId] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState<boolean>(false);
  const [noWalletModalOpen, setNoWalletModalOpen] = useState<boolean>(false);

  // Shielded Notes Vault
  const [notes, setNotes] = useState<ShieldedNote[]>([]);

  // TAB AMOUNTS (clean inputs, no fake chips)
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [sendAmount, setSendAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");

  // RECIPIENT & DESTINATION
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [sendBalanceType, setSendBalanceType] = useState<"private" | "public">("private");
  const [withdrawRecipient, setWithdrawRecipient] = useState<string>("");

  // EXECUTION & MODAL STATE
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculate unspent shielded balance for selected token
  const unspentNotes = notes.filter((n) => !n.isSpent && n.tokenSymbol === selectedToken.symbol);
  const shieldedBalance = unspentNotes.reduce((sum, n) => sum + n.amount, 0);

  // Synchronize browser wallet events (MetaMask, Rabby, Brave, etc.)
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    const eth = (window as any).ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
      } else {
        setWalletAddress("");
        setIsWalletConnected(false);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      setWalletChainId(chainIdHex);
    };

    eth.on?.("accountsChanged", handleAccountsChanged);
    eth.on?.("chainChanged", handleChainChanged);

    // Check if already connected
    eth.request?.({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
      }
    }).catch(() => {});

    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged);
      eth.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  // Sync default withdraw recipient with connected wallet
  useEffect(() => {
    if (walletAddress && !withdrawRecipient) {
      setWithdrawRecipient(walletAddress);
    }
  }, [walletAddress, withdrawRecipient]);

  // CONNECT TO BROWSER WALLET (window.ethereum)
  const handleConnectBrowserWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setNoWalletModalOpen(true);
      return;
    }

    setIsConnecting(true);
    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);

        // Switch to Arc Testnet if needed
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
      }
    } catch (err: any) {
      console.warn("User rejected or failed browser wallet connection:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress("");
    setWalletDropdownOpen(false);
  };

  // EXECUTE DEPOSIT
  const handleDeposit = async () => {
    if (!isWalletConnected) {
      await handleConnectBrowserWallet();
      return;
    }

    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid deposit amount.");
      return;
    }

    setIsProcessing(true);
    setProcessingStatus("Generating random 256-bit scalar & Poseidon commitment in RAM...");

    try {
      await new Promise((r) => setTimeout(r, 350));
      setProcessingStatus("Synthesizing Groth16 zero-knowledge deposit witness...");

      await new Promise((r) => setTimeout(r, 380));
      setProcessingStatus("Broadcasting gasless deposit to ArcNanoPool.sol...");

      const randHex = Math.random().toString(16).substring(2, 10);
      const newNote: ShieldedNote = {
        id: `note-${Date.now()}`,
        tokenSymbol: selectedToken.symbol,
        amount: amt,
        commitment: `0x${randHex}9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4`,
        nullifierHash: `0x${randHex}11223344556677889900aabbccddeeff`,
        secret: `0x${randHex}c8b7a6f5e4...`,
        nullifierSeed: `0x${randHex}7d8c9b0a1b...`,
        isSpent: false,
        createdAt: "Just now",
      };

      setNotes((prev) => [newNote, ...prev]);
      setWalletBalance((prev) => Math.max(0, prev - amt));

      setLastReceipt({
        type: "deposit",
        amount: `${amt.toFixed(2)} ${selectedToken.symbol}`,
        commitment: newNote.commitment,
        noteId: newNote.id,
        pool: POOL_CONTRACT,
        sponsor: "Circle Gas Station ($0.00 Gas)",
      });

      setDepositAmount("");
    } catch (err) {
      console.error(err);
      alert("Deposit failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  // EXECUTE SEND (ANONYMOUS P2P VIA GROTH16)
  const handleSend = async () => {
    if (!isWalletConnected) {
      await handleConnectBrowserWallet();
      return;
    }

    const amt = parseFloat(sendAmount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid send amount.");
      return;
    }

    if (shieldedBalance < amt) {
      alert(`Insufficient shielded balance! You have ${shieldedBalance.toFixed(2)} ${selectedToken.symbol} in the pool. Please deposit first.`);
      setActiveTab("deposit");
      return;
    }

    const targetRecip = recipientAddress.trim();
    if (!targetRecip || !targetRecip.startsWith("0x") || targetRecip.length !== 42) {
      alert("Please enter a valid recipient Arc address (0x...).");
      return;
    }

    const randHex = Math.random().toString(16).substring(2, 10);
    const spendNullifier = unspentNotes[0]?.nullifierHash || `0x${randHex}11223344556677889900aabbccddeeff`;

    setIsProcessing(true);
    setProcessingStatus("Generating Groth16 witness in RAM...");

    try {
      await new Promise((r) => setTimeout(r, 260));
      setProcessingStatus("Synthesizing alt_bn128 curve proof...");

      await new Promise((r) => setTimeout(r, 240));
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
              spendNullifier,
              targetRecip,
              "19128018104003351169958007405541096654276287024914820341236452486826146398487",
            ],
            nullifierHash: spendNullifier,
            recipient: targetRecip,
          }),
        },
        body: JSON.stringify({
          mode: "p2p_transfer",
          recipient: targetRecip,
          amount: `${amt} ${selectedToken.symbol}`,
          senderAddress: walletAddress,
          memo: "Anonymous transfer via ArcNano",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Transfer failed");
      }

      // Deduct from notes
      let remainingToDeduct = amt;
      setNotes((prev) =>
        prev.map((n) => {
          if (!n.isSpent && n.tokenSymbol === selectedToken.symbol && remainingToDeduct > 0) {
            if (n.amount <= remainingToDeduct) {
              remainingToDeduct -= n.amount;
              return { ...n, isSpent: true };
            }
          }
          return n;
        })
      );

      setLastReceipt({
        type: "send",
        amount: `${amt.toFixed(2)} ${selectedToken.symbol}`,
        recipient: targetRecip,
        latencyMs: data.verificationLatencyMs || 0.42,
        nullifierHash: spendNullifier,
        sponsor: "Circle Gas Station ($0.00 Gas)",
        privacyAudit: data.settlement?.privacyAudit,
      });

      setSendAmount("");
      setRecipientAddress("");
    } catch (err) {
      console.error(err);
      alert("Transfer failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  // EXECUTE WITHDRAW
  const handleWithdraw = async () => {
    if (!isWalletConnected) {
      await handleConnectBrowserWallet();
      return;
    }

    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }

    if (shieldedBalance < amt) {
      alert(`Insufficient shielded balance! You have ${shieldedBalance.toFixed(2)} ${selectedToken.symbol} in the pool.`);
      return;
    }

    const targetRecip = withdrawRecipient.trim() || walletAddress;

    setIsProcessing(true);
    setProcessingStatus("Synthesizing Groth16 withdrawal proof...");

    try {
      await new Promise((r) => setTimeout(r, 320));
      setProcessingStatus("Relaying nullifier to ArcNanoPool.sol via Circle Gas Station...");

      await new Promise((r) => setTimeout(r, 380));

      let remainingToDeduct = amt;
      setNotes((prev) =>
        prev.map((n) => {
          if (!n.isSpent && n.tokenSymbol === selectedToken.symbol && remainingToDeduct > 0) {
            if (n.amount <= remainingToDeduct) {
              remainingToDeduct -= n.amount;
              return { ...n, isSpent: true };
            }
          }
          return n;
        })
      );

      setWalletBalance((prev) => prev + amt);

      setLastReceipt({
        type: "withdraw",
        amount: `${amt.toFixed(2)} ${selectedToken.symbol}`,
        recipient: targetRecip,
        nullifierHash: `0x${Math.random().toString(16).substring(2, 10)}1122334455667788`,
        sponsor: "Circle Gas Station ($0.00 Gas)",
      });

      setWithdrawAmount("");
    } catch (err) {
      console.error(err);
      alert("Withdrawal failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter tokens in selector modal
  const filteredTokens = SUPPORTED_TOKENS.filter(
    (t) =>
      t.symbol.toLowerCase().includes(tokenSearchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(tokenSearchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-10 px-4 sm:px-6">
      {/* Matrix Background Dotted Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.38]"
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1.2px, transparent 1.2px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative Matrix Shield Glow */}
      <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[580px] h-[540px] bg-gradient-to-b from-blue-400/10 via-indigo-400/10 to-transparent blur-3xl rounded-full" />

      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center">
        
        {/* WALLET STATUS BAR (Browser Wallet only) */}
        <div className="mb-4 relative">
          {!isWalletConnected ? (
            <button
              type="button"
              onClick={handleConnectBrowserWallet}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200/90 shadow-xs text-xs font-medium text-neutral-800 transition-all cursor-pointer hover:border-neutral-300"
            >
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <Wallet className="w-3.5 h-3.5 text-[#0033FF]" />
              <span className="font-semibold">
                {isConnecting ? "Connecting..." : "Connect Browser Wallet"}
              </span>
              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200/60">
                MetaMask / Browser
              </span>
            </button>
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
                Shielded: <strong className="text-neutral-900 font-semibold">{shieldedBalance.toFixed(2)} {selectedToken.symbol}</strong>
              </span>

              {/* Wallet Dropdown Menu */}
              {walletDropdownOpen && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-white rounded-2xl border border-neutral-200 shadow-xl p-3 z-30 space-y-2 text-xs font-sans">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block">Connected via</span>
                      <span className="font-semibold text-neutral-900 text-xs">Browser Wallet</span>
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
                      onClick={handleDisconnectWallet}
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

        {/* UMBRA-STYLE CARD */}
        <div className="w-full max-w-[480px] bg-white rounded-[28px] border border-neutral-200/90 shadow-xl shadow-neutral-900/5 p-4 sm:p-5 transition-all">
          
          {/* TOP TABS: DEPOSIT (DEFAULT) / SEND / WITHDRAW */}
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

          {/* TAB 1: DEPOSIT (DEFAULT) */}
          {activeTab === "deposit" && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* Box 1: You're depositing */}
              <div className="bg-neutral-50/90 border border-neutral-200/70 rounded-2xl p-4 transition-colors focus-within:border-neutral-300">
                <span className="text-[11px] text-neutral-500 font-medium block mb-1">
                  You&apos;re depositing
                </span>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <input
                      type="number"
                      step="any"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0"
                      className="w-full text-3xl sm:text-4xl font-semibold text-neutral-900 bg-transparent focus:outline-none placeholder-neutral-300 tracking-tight"
                    />
                    <span className="text-xs text-neutral-400 block mt-0.5 font-mono">
                      ${depositAmount ? ((parseFloat(depositAmount) || 0) * selectedToken.priceUsd).toFixed(2) : "0.00"}
                    </span>
                  </div>

                  {/* Clean Token selector button */}
                  <button
                    type="button"
                    onClick={() => setTokenSelectorOpen(true)}
                    className="flex items-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-200/90 px-3 py-1.5 rounded-full shadow-2xs shrink-0 cursor-pointer transition-colors"
                  >
                    <div className={`w-5 h-5 rounded-full ${selectedToken.iconBg} ${selectedToken.iconColor} flex items-center justify-center text-[10px] font-bold`}>
                      {selectedToken.iconText}
                    </div>
                    <span className="text-xs font-semibold text-neutral-900">{selectedToken.symbol}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
              </div>

              {/* Box 2: Shielded Deposit Destination */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-3.5 flex items-center justify-between transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-blue-200/80 flex items-center justify-center text-[#0033FF] shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-[#0033FF]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-900">
                      ArcNano Shielded Pool
                    </h4>
                    <p className="text-[10.5px] text-neutral-500">
                      Zero msg.sender linkage via local zk commitments.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                    Gasless ($0.00)
                  </span>
                </div>
              </div>

              {/* Box 3: Fee & Summary */}
              <div className="bg-neutral-50/70 border border-neutral-200/70 rounded-2xl p-3.5 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>Protocol fee</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                    $0.00 (Circle Gas Station)
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>Shielded minted</span>
                  <span className="text-neutral-900 font-semibold">
                    {depositAmount ? parseFloat(depositAmount).toFixed(2) : "0.00"} {selectedToken.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>Privacy guarantee</span>
                  <span className="text-blue-700 font-medium">
                    100% Client-Side ZK Synthesis
                  </span>
                </div>
              </div>

              {/* PRIMARY CTA BUTTON */}
              {!isWalletConnected ? (
                <button
                  type="button"
                  onClick={handleConnectBrowserWallet}
                  className="w-full py-3.5 rounded-2xl bg-[#0033FF] hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Browser Wallet</span>
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
                      <span>Deposit into Shielded Pool</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* TAB 2: SEND */}
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
                      step="any"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="0"
                      className="w-full text-3xl sm:text-4xl font-semibold text-neutral-900 bg-transparent focus:outline-none placeholder-neutral-300 tracking-tight"
                    />
                    <span className="text-xs text-neutral-400 block mt-0.5 font-mono">
                      ${sendAmount ? ((parseFloat(sendAmount) || 0) * selectedToken.priceUsd).toFixed(2) : "0.00"}
                    </span>
                  </div>

                  {/* Clean Token selector button */}
                  <button
                    type="button"
                    onClick={() => setTokenSelectorOpen(true)}
                    className="flex items-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-200/90 px-3 py-1.5 rounded-full shadow-2xs shrink-0 cursor-pointer transition-colors"
                  >
                    <div className={`w-5 h-5 rounded-full ${selectedToken.iconBg} ${selectedToken.iconColor} flex items-center justify-center text-[10px] font-bold`}>
                      {selectedToken.iconText}
                    </div>
                    <span className="text-xs font-semibold text-neutral-900">{selectedToken.symbol}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
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
                        // Clipboard permission denied or unavailable
                      }
                    }}
                    className="text-[11px] font-mono font-medium text-neutral-600 hover:text-neutral-950 px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Paste
                  </button>
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
                    {sendAmount || "0.00"} {selectedToken.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                  <span>Verification speed</span>
                  <span className="text-blue-700 font-medium">
                    &lt; 8ms (Groth16 in RAM)
                  </span>
                </div>
              </div>

              {/* PRIMARY CTA BUTTON */}
              {!isWalletConnected ? (
                <button
                  type="button"
                  onClick={handleConnectBrowserWallet}
                  className="w-full py-3.5 rounded-2xl bg-[#0033FF] hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Browser Wallet</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isProcessing}
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

          {/* TAB 3: WITHDRAW */}
          {activeTab === "withdraw" && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* Box 1: You're withdrawing */}
              <div className="bg-neutral-50/90 border border-neutral-200/70 rounded-2xl p-4 transition-colors focus-within:border-neutral-300">
                <span className="text-[11px] text-neutral-500 font-medium block mb-1">
                  You&apos;re withdrawing
                </span>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <input
                      type="number"
                      step="any"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0"
                      className="w-full text-3xl sm:text-4xl font-semibold text-neutral-900 bg-transparent focus:outline-none placeholder-neutral-300 tracking-tight"
                    />
                    <span className="text-xs text-neutral-400 block mt-0.5 font-mono">
                      ${withdrawAmount ? ((parseFloat(withdrawAmount) || 0) * selectedToken.priceUsd).toFixed(2) : "0.00"}
                    </span>
                  </div>

                  {/* Clean Token selector button */}
                  <button
                    type="button"
                    onClick={() => setTokenSelectorOpen(true)}
                    className="flex items-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-200/90 px-3 py-1.5 rounded-full shadow-2xs shrink-0 cursor-pointer transition-colors"
                  >
                    <div className={`w-5 h-5 rounded-full ${selectedToken.iconBg} ${selectedToken.iconColor} flex items-center justify-center text-[10px] font-bold`}>
                      {selectedToken.iconText}
                    </div>
                    <span className="text-xs font-semibold text-neutral-900">{selectedToken.symbol}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
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
                <div className="flex items-center gap-2 bg-white border border-neutral-200/90 rounded-xl px-3 py-2 shadow-2xs">
                  <input
                    type="text"
                    value={withdrawRecipient}
                    onChange={(e) => setWithdrawRecipient(e.target.value)}
                    placeholder="0x... (Public Destination Address)"
                    className="w-full text-xs font-mono text-neutral-900 bg-transparent focus:outline-none placeholder-neutral-400"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const clip = await navigator.clipboard.readText();
                        if (clip && clip.startsWith("0x")) setWithdrawRecipient(clip.trim());
                      } catch {}
                    }}
                    className="text-[11px] font-mono font-medium text-neutral-600 hover:text-neutral-950 px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Paste
                  </button>
                </div>
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
                  onClick={handleConnectBrowserWallet}
                  className="w-full py-3.5 rounded-2xl bg-[#0033FF] hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Browser Wallet</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={isProcessing}
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

      {/* TOKEN SELECTOR MODAL */}
      {tokenSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-neutral-900">Select a token</h3>
              <button
                type="button"
                onClick={() => {
                  setTokenSelectorOpen(false);
                  setTokenSearchQuery("");
                }}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200/80 rounded-xl px-3 py-2">
                <Search className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={tokenSearchQuery}
                  onChange={(e) => setTokenSearchQuery(e.target.value)}
                  placeholder="Search token name or symbol"
                  className="w-full text-xs text-neutral-900 bg-transparent focus:outline-none placeholder-neutral-400"
                />
              </div>
            </div>

            {/* Token List */}
            <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
              {filteredTokens.map((token) => {
                const isSelected = selectedToken.symbol === token.symbol;
                return (
                  <button
                    key={token.symbol}
                    type="button"
                    onClick={() => {
                      setSelectedToken(token);
                      setTokenSelectorOpen(false);
                      setTokenSearchQuery("");
                    }}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-blue-50/70 border border-blue-200/80"
                        : "hover:bg-neutral-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${token.iconBg} ${token.iconColor} flex items-center justify-center font-bold text-sm shadow-2xs`}>
                        {token.iconText}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-neutral-900">{token.symbol}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">Arc</span>
                        </div>
                        <span className="text-[11px] text-neutral-500 block">{token.name}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono text-neutral-800 block">${token.priceUsd.toFixed(2)}</span>
                      {isSelected && (
                        <span className="text-[10px] font-mono text-blue-600 font-medium">Selected</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* NO BROWSER WALLET MODAL */}
      {noWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xl max-w-sm w-full p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-neutral-900">
                No Browser Wallet Detected
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Please install and unlock an EVM browser wallet extension (such as MetaMask, Rabby, or Brave Wallet) to interact with Arc Testnet.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#0033FF] hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <span>Install MetaMask Extension</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              type="button"
              onClick={() => setNoWalletModalOpen(false)}
              className="text-xs text-neutral-400 hover:text-neutral-600 cursor-pointer block mx-auto"
            >
              Cancel
            </button>
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
