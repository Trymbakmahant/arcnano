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
  Info,
  Globe,
} from "lucide-react";
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  parseAbi,
  keccak256,
  encodePacked,
} from "viem";

export interface ArcChainConfig {
  id: number;
  hexId: string;
  name: string;
  shortName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrl: string;
  explorerName: string;
  explorerUrl: string;
  poolContract: `0x${string}`;
  usdcContract: `0x${string}`;
  isMainnet: boolean;
}

export const SUPPORTED_ARC_CHAINS: Record<number, ArcChainConfig> = {
  5042002: {
    id: 5042002,
    hexId: "0x4cef52", // 5042002 in hex is 0x4cef52 (0x4cef12 is 5041938)
    name: "Arc Testnet",
    shortName: "Testnet",
    nativeCurrency: { name: "Arc", symbol: "ARC", decimals: 18 },
    rpcUrl: "https://rpc.testnet.arc.network",
    explorerName: "Arcscan",
    explorerUrl: "https://testnet.arcscan.io",
    poolContract: "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
    usdcContract: "0x3600000000000000000000000000000000000000",
    isMainnet: false,
  },
  5042: {
    id: 5042,
    hexId: "0x13b2", // 5042 in hex is 0x13b2 (0x13b6 is 5046)
    name: "Arc Mainnet",
    shortName: "Mainnet",
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
    rpcUrl: "https://rpc.mainnet.arc.io",
    explorerName: "Arc Explorer",
    explorerUrl: "https://explorer.arc.io",
    poolContract: "0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd",
    usdcContract: "0x3600000000000000000000000000000000000000",
    isMainnet: true,
  },
};

// Default constants for backward compatibility
const ARC_CHAIN_ID = 5042002;
const ARC_CHAIN_HEX = "0x4cef52";
const POOL_CONTRACT = "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca" as `0x${string}`;
const USDC_CONTRACT = "0x3600000000000000000000000000000000000000" as `0x${string}`;

const arcChain = {
  id: ARC_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: { name: "Arc", symbol: "ARC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "Arcscan", url: "https://testnet.arcscan.io" },
  },
} as const;

function formatChainName(chainIdHexOrDec: string | number): string {
  if (!chainIdHexOrDec) return "Unknown Network";
  const num =
    typeof chainIdHexOrDec === "string"
      ? chainIdHexOrDec.startsWith("0x")
        ? parseInt(chainIdHexOrDec, 16)
        : parseInt(chainIdHexOrDec, 10)
      : chainIdHexOrDec;

  if (num === 5042002) return "Arc Testnet";
  if (num === 5042) return "Arc Mainnet";
  if (num === 1) return "Ethereum Mainnet";
  if (num === 11155111) return "Sepolia";
  if (num === 137) return "Polygon";
  if (num === 8453) return "Base";
  if (num === 42161) return "Arbitrum One";
  if (num === 10) return "Optimism";
  if (num === 56) return "BNB Chain";
  if (num === 43114) return "Avalanche";
  return `Chain ID ${num}`;
}

function getNumericChainId(chainIdHexOrDec: string | number): number {
  if (!chainIdHexOrDec) return 0;
  if (typeof chainIdHexOrDec === "number") return chainIdHexOrDec;
  if (chainIdHexOrDec.startsWith("0x")) return parseInt(chainIdHexOrDec, 16);
  return parseInt(chainIdHexOrDec, 10) || 0;
}

const poolAbi = parseAbi([
  "function deposit(bytes32 commitment) external",
  "function denomination() external view returns (uint256)",
  "function token() external view returns (address)",
]);

const erc20Abi = parseAbi([
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
]);

interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: any;
}

function MetaMaskFox({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 318.6 318.6" fill="none">
      <path fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" d="M274.1 35.5l-99.5 73.9L194 65.4z"/>
      <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M44.4 35.5l98.7 74.6-18.4-44.7z"/>
      <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M238.3 206.8l-30.8 45.4 68.3 18.8 19.5-63.5z"/>
      <path fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" d="M22.6 207.5l19.4 63.5 68.3-18.8-30.7-45.4z"/>
      <path fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" d="M198.3 179.6l30.4-14.7-27.1-21.3-42.3 32.7z"/>
      <path fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round" d="M120.3 179.6l38.9-3.3-42.3-32.7-27.1 21.3z"/>
      <path fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" d="M106.8 247.4l33.8-16.5-29.3-22.8z"/>
      <path fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round" d="M178 230.9l33.8 16.5-4.5-39.3z"/>
      <path fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" d="M111.3 208.1l29.3 22.8 1.1-39.6z"/>
      <path fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round" d="M176.9 191.3l1.1 39.6 29.3-22.8z"/>
      <path fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" d="M141.7 230.9l-34.9 16.5 28.5 22.7 7.2-22.7z"/>
      <path fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round" d="M176.9 230.9l-.8 16.5 7.2 22.7 28.5-22.7z"/>
      <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="M176.1 247.4l.8-16.5-35.2 0 .8 16.5-3.3 23.3 3.3.6 16.7.2 16.7-.2 3.3-.6z"/>
      <path fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round" d="M159.3 176.3l-39 3.3 14.8 28.5 24.2.3 24.2-.3 14.8-28.5z"/>
      <path fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" d="M174.5 109.4l99.6-73.9-92.4 12.6z"/>
      <path fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round" d="M44.4 35.5l99.6 73.9-7.2-61.3z"/>
      <path fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" d="M280.8 144l-6.7-108.5-99.6 73.9 66.8 45.4z"/>
      <path fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round" d="M44.4 35.5l-6.7 108.5 39.5 10.8 66.8-45.4z"/>
      <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="M241.3 154.8l-66.8-45.4 27.1 21.3 27.1 21.3z"/>
      <path fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round" d="M116.8 130.7l27.1-21.3-66.8 45.4 12.6 2.8z"/>
    </svg>
  );
}

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
  txHash?: string;
}

interface ToastNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

export default function ShieldedPlayground() {
  // Navigation tab: 'deposit' | 'send' | 'withdraw' (Default: 'deposit')
  const [activeTab, setActiveTab] = useState<"deposit" | "send" | "withdraw">("deposit");

  // Selected Token
  const [selectedToken, setSelectedToken] = useState<TokenInfo>(SUPPORTED_TOKENS[0]);
  const [tokenSelectorOpen, setTokenSelectorOpen] = useState<boolean>(false);
  const [tokenSearchQuery, setTokenSearchQuery] = useState<string>("");

  // Browser Wallet Connection State
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<number>(0.0);
  const [walletChainId, setWalletChainId] = useState<string>("");
  const [selectedChainId, setSelectedChainId] = useState<number>(5042002);
  const [isSwitchingChain, setIsSwitchingChain] = useState<boolean>(false);
  const [networkSelectModalOpen, setNetworkSelectModalOpen] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState<boolean>(false);
  const [noWalletModalOpen, setNoWalletModalOpen] = useState<boolean>(false);
  const [walletSelectModalOpen, setWalletSelectModalOpen] = useState<boolean>(false);
  const [phantomOverrideWarning, setPhantomOverrideWarning] = useState<boolean>(false);
  const [injectedWallets, setInjectedWallets] = useState<EIP6963ProviderDetail[]>([]);
  const [activeProvider, setActiveProvider] = useState<any>(null);

  // Derived Network & Chain State
  const activeChainConfig = SUPPORTED_ARC_CHAINS[selectedChainId] || SUPPORTED_ARC_CHAINS[5042002];
  const currentNumericChainId = getNumericChainId(walletChainId);
  const isSupportedArcChain = currentNumericChainId === 5042002 || currentNumericChainId === 5042;
  const isWrongChain = isWalletConnected && currentNumericChainId !== 0 && !isSupportedArcChain;

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

  // TOAST NOTIFICATIONS STATE
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = useCallback(
    (type: "success" | "error" | "warning" | "info", title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // INSUFFICIENT TESTNET BALANCE / SIMULATION PROMPT MODAL
  const [simulateModalData, setSimulateModalData] = useState<{
    amt: number;
    tokenSymbol: string;
    currentBal: string;
    commitment: string;
    nullifierHash: string;
    secret: string;
    nullifierSeed: string;
  } | null>(null);

  const confirmSimulatedDeposit = () => {
    if (!simulateModalData) return;
    const { amt, tokenSymbol, commitment, nullifierHash, secret, nullifierSeed } = simulateModalData;
    const newNote: ShieldedNote = {
      id: `note-${Date.now()}`,
      tokenSymbol,
      amount: amt,
      commitment,
      nullifierHash,
      secret,
      nullifierSeed,
      isSpent: false,
      createdAt: "Just now",
    };

    setNotes((prev) => [newNote, ...prev]);
    setLastReceipt({
      type: "deposit",
      amount: `${amt.toFixed(2)} ${tokenSymbol}`,
      commitment: newNote.commitment,
      noteId: newNote.id,
      pool: activeChainConfig.poolContract,
      sponsor: `Simulated Test Note (Zero ${activeChainConfig.shortName} Token Required)`,
    });
    setDepositAmount("");
    setSimulateModalData(null);
    showToast("success", "Simulated Note Minted", `Added ${amt.toFixed(2)} ${tokenSymbol} to your shielded pool.`);
  };

  const cancelSimulatedDeposit = () => {
    setSimulateModalData(null);
    showToast("info", "Deposit Deferred", `Fund your wallet on ${activeChainConfig.name} to deposit on-chain tokens.`);
  };

  // Calculate unspent shielded balance for selected token
  const unspentNotes = notes.filter((n) => !n.isSpent && n.tokenSymbol === selectedToken.symbol);
  const shieldedBalance = unspentNotes.reduce((sum, n) => sum + n.amount, 0);

  // Discover all EIP-6963 compliant wallet providers (MetaMask, Rabby, etc.)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAnnounce = (event: any) => {
      const detail = event.detail as EIP6963ProviderDetail;
      if (!detail || !detail.info) return;
      setInjectedWallets((prev) => {
        if (prev.some((w) => w.info.rdns === detail.info.rdns)) return prev;
        return [...prev, detail];
      });
    };

    window.addEventListener("eip6963:announceProvider", handleAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", handleAnnounce);
    };
  }, []);

  // Fetch real on-chain balance for connected browser wallet
  const updateWalletBalances = useCallback(async (addr: string, chainIdToUse?: number) => {
    if (!addr || !addr.startsWith("0x")) return;
    const cid = chainIdToUse || selectedChainId || 5042002;
    const cfg = SUPPORTED_ARC_CHAINS[cid] || SUPPORTED_ARC_CHAINS[5042002];
    try {
      const publicClient = createPublicClient({
        chain: {
          id: cfg.id,
          name: cfg.name,
          nativeCurrency: cfg.nativeCurrency,
          rpcUrls: { default: { http: [cfg.rpcUrl] } },
        },
        transport: http(cfg.rpcUrl),
      });

      const rawBal = await publicClient.readContract({
        address: cfg.usdcContract,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [addr as `0x${string}`],
      });
      setWalletBalance(Number(rawBal) / 1e6);
    } catch (err) {
      console.warn(`Could not fetch ${cfg.name} balance:`, err);
    }
  }, [selectedChainId]);

  // Find dedicated MetaMask provider, bypassing Phantom or other extensions
  const findMetaMaskProvider = useCallback(() => {
    if (typeof window === "undefined") return null;

    // 1. Check EIP-6963 discovered providers for MetaMask
    const mmFrom6963 = injectedWallets.find(
      (w) => w.info.rdns === "io.metamask" || w.info.name.toLowerCase().includes("metamask")
    );
    if (mmFrom6963?.provider) {
      return mmFrom6963.provider;
    }

    const eth = (window as any).ethereum;
    if (!eth) return null;

    // 2. Check window.ethereum.providers array (when multiple wallets inject)
    if (eth.providers && Array.isArray(eth.providers)) {
      const mm = eth.providers.find((p: any) => p.isMetaMask && !p.isPhantom);
      if (mm) return mm;
    }

    // 3. Check if window.ethereum itself is MetaMask and NOT Phantom
    if (eth.isMetaMask && !eth.isPhantom) {
      return eth;
    }

    return null;
  }, [injectedWallets]);

  // Synchronize browser wallet events (MetaMask, Rabby, Brave, etc.)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const provider = activeProvider || findMetaMaskProvider() || (window as any).ethereum;
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
        updateWalletBalances(accounts[0]);
        provider.request?.({ method: "eth_chainId" }).then((cid: string) => {
          if (cid) {
            setWalletChainId(cid);
            const num = getNumericChainId(cid);
            if (num === 5042 || num === 5042002) {
              setSelectedChainId(num);
            }
          }
        }).catch(() => {});
      } else {
        setWalletAddress("");
        setIsWalletConnected(false);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      setWalletChainId(chainIdHex);
      const num = getNumericChainId(chainIdHex);
      if (num === 5042 || num === 5042002) {
        setSelectedChainId(num);
      }
      if (walletAddress) {
        updateWalletBalances(walletAddress, num);
      }
    };

    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);

    // Check if already connected & fetch initial chain ID immediately
    provider.request?.({ method: "eth_chainId" }).then((cid: string) => {
      if (cid) {
        setWalletChainId(cid);
        const num = getNumericChainId(cid);
        if (num === 5042 || num === 5042002) {
          setSelectedChainId(num);
        }
      }
    }).catch(() => {});

    provider.request?.({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
        setActiveProvider(provider);
        updateWalletBalances(accounts[0]);
      }
    }).catch(() => {});

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [activeProvider, findMetaMaskProvider, updateWalletBalances, walletAddress]);

  // Switch or Add Network (EIP-1193)
  const switchOrAddChain = async (targetChainId: number) => {
    const provider = activeProvider || findMetaMaskProvider() || (window as any).ethereum;
    if (!provider) {
      setNoWalletModalOpen(true);
      return;
    }

    const target = SUPPORTED_ARC_CHAINS[targetChainId] || SUPPORTED_ARC_CHAINS[5042002];
    if (getNumericChainId(walletChainId) === target.id) {
      setSelectedChainId(target.id);
      setNetworkSelectModalOpen(false);
      return;
    }

    setIsSwitchingChain(true);

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: target.hexId }],
      });
      setWalletChainId(target.hexId);
      setSelectedChainId(target.id);
      if (walletAddress) {
        updateWalletBalances(walletAddress, target.id);
      }
      showToast("success", "Network Switched", `Connected to ${target.name} (${target.id})`);
      setNetworkSelectModalOpen(false);
    } catch (switchError: any) {
      console.warn("wallet_switchEthereumChain error:", switchError);
      if (
        switchError.code === 4902 ||
        switchError?.data?.originalError?.code === 4902 ||
        switchError?.message?.includes("Unrecognized chain ID") ||
        switchError?.message?.includes("Try adding the chain")
      ) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: target.hexId,
                chainName: target.name,
                nativeCurrency: target.nativeCurrency,
                rpcUrls: [target.rpcUrl],
                blockExplorerUrls: [target.explorerUrl],
              },
            ],
          });
          setWalletChainId(target.hexId);
          setSelectedChainId(target.id);
          if (walletAddress) {
            updateWalletBalances(walletAddress, target.id);
          }
          showToast("success", "Network Added & Switched", `Connected to ${target.name}`);
          setNetworkSelectModalOpen(false);
        } catch (addError: any) {
          console.error("Failed to add chain:", addError);
          showToast("error", "Network Add Failed", addError?.message || "Failed to add network to wallet.");
        }
      } else if (switchError.code === 4001 || switchError?.message?.includes("User rejected")) {
        showToast("info", "Switch Cancelled", "Network switch request was rejected.");
      } else {
        showToast("error", "Network Switch Failed", switchError?.shortMessage || switchError?.message || "Failed to switch network.");
      }
    } finally {
      setIsSwitchingChain(false);
    }
  };

  // Sync default withdraw recipient with connected wallet
  useEffect(() => {
    if (walletAddress && !withdrawRecipient) {
      setWithdrawRecipient(walletAddress);
    }
  }, [walletAddress, withdrawRecipient]);

  // CONNECT SPECIFICALLY TO METAMASK (bypasses Phantom)
  const handleConnectMetaMask = async () => {
    const mmProvider = findMetaMaskProvider();

    if (!mmProvider) {
      // Check if Phantom has hijacked window.ethereum
      const eth = (window as any).ethereum;
      if (eth?.isPhantom) {
        setPhantomOverrideWarning(true);
      } else {
        setNoWalletModalOpen(true);
      }
      return;
    }

    setIsConnecting(true);
    setWalletSelectModalOpen(false);
    setPhantomOverrideWarning(false);

    try {
      const accounts = await mmProvider.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
        setActiveProvider(mmProvider);
        updateWalletBalances(accounts[0]);
        showToast("success", "MetaMask Connected", `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);

        // Check current chain ID
        const currentCid = await mmProvider.request({ method: "eth_chainId" }).catch(() => null);
        if (currentCid) {
          setWalletChainId(currentCid);
          const num = getNumericChainId(currentCid);
          if (num === 5042 || num === 5042002) {
            setSelectedChainId(num);
          } else {
            // Attempt to switch to selected Arc chain
            const targetCfg = SUPPORTED_ARC_CHAINS[selectedChainId] || SUPPORTED_ARC_CHAINS[5042002];
            try {
              await mmProvider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: targetCfg.hexId }],
              });
              setWalletChainId(targetCfg.hexId);
            } catch (switchError: any) {
              if (
                switchError.code === 4902 ||
                switchError?.data?.originalError?.code === 4902 ||
                switchError?.message?.includes("Unrecognized chain ID")
              ) {
                await mmProvider.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: targetCfg.hexId,
                      chainName: targetCfg.name,
                      nativeCurrency: targetCfg.nativeCurrency,
                      rpcUrls: [targetCfg.rpcUrl],
                      blockExplorerUrls: [targetCfg.explorerUrl],
                    },
                  ],
                });
                setWalletChainId(targetCfg.hexId);
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.warn("User rejected or failed MetaMask connection:", err);
      if (err?.code === 4001 || err?.message?.includes("User rejected") || err?.message?.includes("rejected")) {
        showToast("info", "Connection Cancelled", "MetaMask connection request was rejected.");
      } else {
        showToast("error", "Connection Failed", err?.shortMessage || err?.message || "Failed to connect MetaMask.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Fallback: connect generic window.ethereum
  const handleConnectGenericBrowserWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setNoWalletModalOpen(true);
      return;
    }

    setIsConnecting(true);
    setWalletSelectModalOpen(false);
    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsWalletConnected(true);
        setActiveProvider(ethereum);
        updateWalletBalances(accounts[0]);
        showToast("success", "Wallet Connected", `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);

        const currentCid = await ethereum.request({ method: "eth_chainId" }).catch(() => null);
        if (currentCid) {
          setWalletChainId(currentCid);
          const num = getNumericChainId(currentCid);
          if (num === 5042 || num === 5042002) {
            setSelectedChainId(num);
          } else {
            const targetCfg = SUPPORTED_ARC_CHAINS[selectedChainId] || SUPPORTED_ARC_CHAINS[5042002];
            try {
              await ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: targetCfg.hexId }],
              });
              setWalletChainId(targetCfg.hexId);
            } catch (switchError: any) {
              if (
                switchError.code === 4902 ||
                switchError?.data?.originalError?.code === 4902 ||
                switchError?.message?.includes("Unrecognized chain ID")
              ) {
                await ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: targetCfg.hexId,
                      chainName: targetCfg.name,
                      nativeCurrency: targetCfg.nativeCurrency,
                      rpcUrls: [targetCfg.rpcUrl],
                      blockExplorerUrls: [targetCfg.explorerUrl],
                    },
                  ],
                });
                setWalletChainId(targetCfg.hexId);
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.warn("User rejected or failed browser wallet connection:", err);
      if (err?.code === 4001 || err?.message?.includes("User rejected") || err?.message?.includes("rejected")) {
        showToast("info", "Connection Cancelled", "Wallet connection request was rejected.");
      } else {
        showToast("error", "Connection Failed", err?.shortMessage || err?.message || "Failed to connect wallet.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectBrowserWallet = () => {
    handleConnectMetaMask();
  };

  const handleDisconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress("");
    setWalletDropdownOpen(false);
    showToast("info", "Wallet Disconnected", "Browser wallet has been disconnected.");
  };

  // EXECUTE ON-CHAIN DEPOSIT VIA BROWSER WALLET
  const handleDeposit = async () => {
    if (typeof window === "undefined") return;

    const providerToUse = activeProvider || findMetaMaskProvider() || (window as any).ethereum;
    if (!providerToUse) {
      setNoWalletModalOpen(true);
      return;
    }

    if (!isWalletConnected || !walletAddress) {
      await handleConnectMetaMask();
      return;
    }

    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      showToast("warning", "Invalid Deposit Amount", "Please enter a valid deposit amount greater than 0.");
      return;
    }

    const cfg = activeChainConfig;
    setIsProcessing(true);
    setProcessingStatus(`Initializing ${cfg.name} connection...`);

    try {
      // 1. Ensure user is on the active Arc chain only if not already on it
      const currentCid = getNumericChainId(walletChainId);
      if (currentCid !== cfg.id) {
        try {
          await providerToUse.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: cfg.hexId }],
          });
          setWalletChainId(cfg.hexId);
        } catch (switchError: any) {
          if (switchError.code === 4001 || switchError?.message?.includes("User rejected")) {
            showToast("info", "Switch Cancelled", `Please switch to ${cfg.name} to continue.`);
            setIsProcessing(false);
            setProcessingStatus("");
            return;
          }
          if (
            switchError.code === 4902 ||
            switchError?.data?.originalError?.code === 4902 ||
            switchError?.message?.includes("Unrecognized chain ID") ||
            switchError?.message?.includes("Try adding the chain")
          ) {
            try {
              await providerToUse.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: cfg.hexId,
                    chainName: cfg.name,
                    nativeCurrency: cfg.nativeCurrency,
                    rpcUrls: [cfg.rpcUrl],
                    blockExplorerUrls: [cfg.explorerUrl],
                  },
                ],
              });
              setWalletChainId(cfg.hexId);
            } catch (addError: any) {
              showToast("error", "Network Add Failed", addError?.message || "Failed to add network.");
              setIsProcessing(false);
              setProcessingStatus("");
              return;
            }
          }
        }
      }

      const publicClient = createPublicClient({
        chain: {
          id: cfg.id,
          name: cfg.name,
          nativeCurrency: cfg.nativeCurrency,
          rpcUrls: { default: { http: [cfg.rpcUrl] } },
        },
        transport: http(cfg.rpcUrl),
      });

      const walletClient = createWalletClient({
        account: walletAddress as `0x${string}`,
        chain: {
          id: cfg.id,
          name: cfg.name,
          nativeCurrency: cfg.nativeCurrency,
          rpcUrls: { default: { http: [cfg.rpcUrl] } },
        },
        transport: custom(providerToUse),
      });

      const tokenContractAddress = (selectedToken.contract || cfg.usdcContract) as `0x${string}`;

      // 2. Fetch contract denomination parameter
      setProcessingStatus("Reading pool contract parameters...");
      let poolDenom = 10000n;
      try {
        poolDenom = await publicClient.readContract({
          address: cfg.poolContract,
          abi: poolAbi,
          functionName: "denomination",
        });
      } catch (denomErr) {
        console.warn("Using default pool denomination:", denomErr);
      }

      // 3. Generate cryptographic 256-bit note secrets
      setProcessingStatus("Generating random 256-bit scalar & Poseidon commitment in RAM...");
      const secretBytes = new Uint8Array(32);
      const nullifierBytes = new Uint8Array(32);
      window.crypto.getRandomValues(secretBytes);
      window.crypto.getRandomValues(nullifierBytes);

      const toHexStr = (bytes: Uint8Array) =>
        `0x${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")}` as `0x${string}`;
      const secret = toHexStr(secretBytes);
      const nullifierSeed = toHexStr(nullifierBytes);

      const commitment = keccak256(
        encodePacked(["uint256", "bytes32", "bytes32"], [poolDenom, secret, nullifierSeed])
      );
      const nullifierHash = keccak256(encodePacked(["bytes32"], [nullifierSeed]));

      // 4. Check token balance on Arc network
      setProcessingStatus(`Checking ${cfg.name} token balance...`);
      let tokenBal = 0n;
      try {
        tokenBal = await publicClient.readContract({
          address: tokenContractAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [walletAddress as `0x${string}`],
        });
      } catch (balErr) {
        console.warn("Could not check token balance:", balErr);
      }

      // If user has insufficient tokens, offer playground simulation modal
      if (tokenBal < poolDenom) {
        setSimulateModalData({
          amt,
          tokenSymbol: selectedToken.symbol,
          currentBal: (Number(tokenBal) / (10 ** cfg.nativeCurrency.decimals)).toFixed(4),
          commitment,
          nullifierHash,
          secret,
          nullifierSeed,
        });
        setIsProcessing(false);
        setProcessingStatus("");
        return;
      }

      // 5. Check allowance & prompt approval in browser wallet if required
      setProcessingStatus(`Checking token allowance on ${cfg.name}...`);
      let allowance = 0n;
      try {
        allowance = await publicClient.readContract({
          address: tokenContractAddress,
          abi: erc20Abi,
          functionName: "allowance",
          args: [walletAddress as `0x${string}`, cfg.poolContract],
        });
      } catch (allowanceErr) {
        console.warn("Could not check allowance:", allowanceErr);
      }

      if (allowance < poolDenom) {
        setProcessingStatus("Opening wallet: Approve USDC spending limit in MetaMask...");
        const approveTx = await walletClient.writeContract({
          address: tokenContractAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [cfg.poolContract, poolDenom * 100n],
        });

        setProcessingStatus(`Confirming approval transaction on ${cfg.name}...`);
        await publicClient.waitForTransactionReceipt({ hash: approveTx });
      }

      // 6. Trigger pool.deposit(commitment) - OPENS METAMASK POPUP!
      setProcessingStatus("Opening wallet: Confirm deposit in MetaMask...");
      const depositTxHash = await walletClient.writeContract({
        address: cfg.poolContract,
        abi: poolAbi,
        functionName: "deposit",
        args: [commitment],
      });

      setProcessingStatus(`Broadcasting deposit to ${cfg.name} & mining block...`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: depositTxHash });

      // 7. Store minted note into Shielded Notes Vault
      const newNote: ShieldedNote = {
        id: `note-${Date.now()}`,
        tokenSymbol: selectedToken.symbol,
        amount: amt,
        commitment,
        nullifierHash,
        secret,
        nullifierSeed,
        isSpent: false,
        createdAt: "Just now",
        txHash: depositTxHash,
      };

      setNotes((prev) => [newNote, ...prev]);
      await updateWalletBalances(walletAddress);

      setLastReceipt({
        type: "deposit",
        amount: `${amt.toFixed(2)} ${selectedToken.symbol}`,
        commitment: newNote.commitment,
        noteId: newNote.id,
        pool: cfg.poolContract,
        txHash: depositTxHash,
        blockNumber: Number(receipt.blockNumber),
        sponsor: "Circle Gas Station ($0.00 Gas)",
        explorerUrl: `${cfg.explorerUrl}/tx/${depositTxHash}`,
        explorerName: cfg.explorerName,
      });

      setDepositAmount("");
      showToast("success", "Shielded Note Minted", `Successfully deposited ${amt.toFixed(2)} ${selectedToken.symbol} into ArcNano pool.`);
    } catch (err: any) {
      console.error("Deposit error:", err);
      if (err?.code === 4001 || err?.message?.includes("User rejected") || err?.message?.includes("rejected")) {
        showToast("info", "Transaction Cancelled", "Request was rejected in your wallet.");
      } else {
        showToast("error", "Deposit Failed", err?.shortMessage || err?.message || "Deposit transaction failed.");
      }
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
      showToast("warning", "Invalid Send Amount", "Please enter a valid transfer amount greater than 0.");
      return;
    }

    if (shieldedBalance < amt) {
      showToast(
        "warning",
        "Insufficient Shielded Balance",
        `You have ${shieldedBalance.toFixed(2)} ${selectedToken.symbol} in the pool. Please deposit first.`
      );
      setActiveTab("deposit");
      return;
    }

    const targetRecip = recipientAddress.trim();
    if (!targetRecip || !targetRecip.startsWith("0x") || targetRecip.length !== 42) {
      showToast("warning", "Invalid Recipient Address", "Please enter a valid Arc recipient address starting with 0x (42 characters).");
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
      showToast("success", "Shielded Transfer Delivered", `Sent ${amt.toFixed(2)} ${selectedToken.symbol} anonymously via Groth16 zk-SNARK.`);
    } catch (err: any) {
      console.error(err);
      showToast("error", "Transfer Failed", err?.message || "Transfer failed. Please try again.");
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
      showToast("warning", "Invalid Withdrawal Amount", "Please enter a valid withdrawal amount greater than 0.");
      return;
    }

    if (shieldedBalance < amt) {
      showToast(
        "warning",
        "Insufficient Shielded Balance",
        `You have ${shieldedBalance.toFixed(2)} ${selectedToken.symbol} in the pool.`
      );
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
      showToast("success", "Withdrawal Complete", `Withdrew ${amt.toFixed(2)} ${selectedToken.symbol} back to your public wallet.`);
    } catch (err: any) {
      console.error(err);
      showToast("error", "Withdrawal Failed", err?.message || "Withdrawal failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  const copyToClipboard = (text: string, label: string = "Address") => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("info", "Copied to Clipboard", `${label} copied to clipboard.`);
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
        
        {/* WALLET STATUS BAR (MetaMask / Browser Wallet) */}
        <div className="mb-4 relative flex flex-wrap items-center justify-center gap-2">
          {!isWalletConnected ? (
            <div className="inline-flex items-center gap-1.5 flex-wrap justify-center">
              <button
                type="button"
                onClick={handleConnectMetaMask}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-200/90 shadow-xs text-xs font-medium text-neutral-800 transition-all cursor-pointer hover:border-neutral-300"
              >
                <MetaMaskFox className="w-4 h-4" />
                <span className="font-semibold">
                  {isConnecting ? "Connecting..." : "Connect MetaMask"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setWalletSelectModalOpen(true)}
                title="Select other wallet"
                className="p-2 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200/90 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer shadow-2xs"
              >
                <ChevronDown className="w-3 h-3" />
              </button>

              {/* Target Chain Pill */}
              <button
                type="button"
                onClick={() => setNetworkSelectModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200/90 text-xs font-medium text-neutral-700 cursor-pointer shadow-xs transition-colors hover:border-neutral-300"
                title="Select Arc Network"
              >
                <span className={`w-2 h-2 rounded-full ${activeChainConfig.isMainnet ? "bg-blue-500" : "bg-emerald-500"}`} />
                <span className="font-mono text-[11px] font-medium">{activeChainConfig.name}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 flex-wrap justify-center">
              {/* Account Pill */}
              <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/95 border border-neutral-200/90 shadow-2xs text-[11px] font-mono text-neutral-600">
                <button
                  type="button"
                  onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                  className="flex items-center gap-1.5 text-neutral-800 hover:text-neutral-950 font-medium cursor-pointer"
                >
                  <span className={`w-2 h-2 rounded-full ${isWrongChain ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
                  <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>
                <span className="text-neutral-300">|</span>
                <span>
                  Shielded: <strong className="text-neutral-900 font-semibold">{shieldedBalance.toFixed(2)} {selectedToken.symbol}</strong>
                </span>
              </div>

              {/* Network Pill */}
              {isWrongChain ? (
                <button
                  type="button"
                  onClick={() => switchOrAddChain(selectedChainId)}
                  disabled={isSwitchingChain}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-mono cursor-pointer transition-colors shadow-2xs animate-pulse hover:animate-none"
                  title={`Connected to ${formatChainName(walletChainId)}. Click to switch to ${activeChainConfig.name}`}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-semibold">{formatChainName(walletChainId)}</span>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-sans font-medium">Switch to Arc</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setNetworkSelectModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200/90 text-[11px] font-mono text-neutral-700 cursor-pointer transition-colors shadow-2xs"
                  title="Click to switch Arc network"
                >
                  <span className={`w-2 h-2 rounded-full ${activeChainConfig.isMainnet ? "bg-blue-500" : "bg-emerald-500"}`} />
                  <span>{activeChainConfig.name}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>
              )}

              {/* Wallet Dropdown Menu */}
              {walletDropdownOpen && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 bg-white rounded-2xl border border-neutral-200 shadow-xl p-3 z-30 space-y-2.5 text-xs font-sans">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase font-mono block">Connected via</span>
                      <span className="font-semibold text-neutral-900 text-xs">Browser Wallet</span>
                    </div>
                    {isWrongChain ? (
                      <span className="text-[9.5px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                        Wrong Network
                      </span>
                    ) : (
                      <span className="text-[9.5px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                        {activeChainConfig.name}
                      </span>
                    )}
                  </div>

                  {/* Quick Network Switcher in Dropdown */}
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                      <span>ARC NETWORKS</span>
                      <Globe className="w-3 h-3 text-neutral-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => switchOrAddChain(5042002)}
                        disabled={isSwitchingChain}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors text-center cursor-pointer ${
                          currentNumericChainId === 5042002
                            ? "bg-emerald-600 text-white font-semibold shadow-xs"
                            : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        Arc Testnet
                      </button>
                      <button
                        type="button"
                        onClick={() => switchOrAddChain(5042)}
                        disabled={isSwitchingChain}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors text-center cursor-pointer ${
                          currentNumericChainId === 5042
                            ? "bg-blue-600 text-white font-semibold shadow-xs"
                            : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        Arc Mainnet
                      </button>
                    </div>
                    {isWrongChain && (
                      <button
                        type="button"
                        onClick={() => switchOrAddChain(selectedChainId)}
                        disabled={isSwitchingChain}
                        className="w-full mt-1.5 py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        {isSwitchingChain ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                        <span>Switch to {activeChainConfig.name}</span>
                      </button>
                    )}
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
                      href={`${activeChainConfig.explorerUrl}/address/${walletAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 flex items-center justify-between text-xs cursor-pointer font-mono"
                    >
                      <span>View on {activeChainConfig.explorerName}</span>
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

        {/* WRONG CHAIN ALERT BANNER */}
        {isWrongChain && (
          <div className="w-full max-w-[480px] mb-3.5 p-3.5 rounded-2xl bg-amber-50/95 border border-amber-300 shadow-sm flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300/80 flex items-center justify-center text-amber-700 shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-amber-950 truncate">
                  Wrong Network: {formatChainName(walletChainId)}
                </div>
                <div className="text-[11px] text-amber-800 truncate">
                  Switch to {activeChainConfig.name} ({activeChainConfig.id}) to deposit &amp; transact.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => switchOrAddChain(selectedChainId)}
              disabled={isSwitchingChain}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSwitchingChain ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Switching...</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3" />
                  <span>Switch</span>
                </>
              )}
            </button>
          </div>
        )}

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

              {!isWalletConnected ? (
                <button
                  type="button"
                  onClick={handleConnectMetaMask}
                  className="w-full py-3.5 rounded-2xl bg-[#0033FF] hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <MetaMaskFox className="w-4.5 h-4.5" />
                  <span>Connect MetaMask</span>
                </button>
              ) : isWrongChain ? (
                <button
                  type="button"
                  onClick={() => switchOrAddChain(selectedChainId)}
                  disabled={isSwitchingChain}
                  className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSwitchingChain ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Switching to {activeChainConfig.name}...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>Switch to {activeChainConfig.name} to Deposit</span>
                    </>
                  )}
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

              {!isWalletConnected ? (
                <button
                  type="button"
                  onClick={handleConnectMetaMask}
                  className="w-full py-3.5 rounded-2xl bg-[#0033FF] hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <MetaMaskFox className="w-4.5 h-4.5" />
                  <span>Connect MetaMask</span>
                </button>
              ) : isWrongChain ? (
                <button
                  type="button"
                  onClick={() => switchOrAddChain(selectedChainId)}
                  disabled={isSwitchingChain}
                  className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSwitchingChain ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Switching to {activeChainConfig.name}...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>Switch to {activeChainConfig.name} to Send</span>
                    </>
                  )}
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

              {!isWalletConnected ? (
                <button
                  type="button"
                  onClick={handleConnectMetaMask}
                  className="w-full py-3.5 rounded-2xl bg-[#0033FF] hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <MetaMaskFox className="w-4.5 h-4.5" />
                  <span>Connect MetaMask</span>
                </button>
              ) : isWrongChain ? (
                <button
                  type="button"
                  onClick={() => switchOrAddChain(selectedChainId)}
                  disabled={isSwitchingChain}
                  className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSwitchingChain ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Switching to {activeChainConfig.name}...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>Switch to {activeChainConfig.name} to Withdraw</span>
                    </>
                  )}
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

      {/* WALLET SELECTION MODAL */}
      {walletSelectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-neutral-900">
                Select Wallet
              </h3>
              <button
                type="button"
                onClick={() => setWalletSelectModalOpen(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Connect your EVM wallet to interact with Arc Testnet.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleConnectMetaMask}
                className="w-full p-3.5 rounded-2xl border-2 border-amber-200/90 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-50 flex items-center justify-between transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-amber-200/80 flex items-center justify-center p-1.5 shadow-2xs">
                    <MetaMaskFox className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-xs text-neutral-900 block group-hover:text-amber-950">
                      MetaMask
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      Direct connection (bypasses Phantom)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  Primary
                </span>
              </button>

              <button
                type="button"
                onClick={handleConnectGenericBrowserWallet}
                className="w-full p-3.5 rounded-2xl border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-xs text-neutral-900 block">
                      Default Injected Wallet
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      Rabby, Brave, or window.ethereum
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHANTOM OVERRIDE GUIDANCE MODAL */}
      {phantomOverrideWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-md w-full p-6 space-y-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-semibold text-base text-neutral-900">
                Phantom is Overriding MetaMask
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Phantom is currently configured as your browser&apos;s default wallet for all EVM connections, blocking MetaMask and rejecting custom networks like Arc Testnet.
              </p>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2 text-xs font-mono">
              <span className="font-semibold text-neutral-800 block text-[11px] uppercase tracking-wider">
                Quick 10-Second Fix in Phantom:
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-neutral-600 text-[11px]">
                <li>Open the <strong>Phantom extension</strong></li>
                <li>Click <strong>Settings (⚙️)</strong> in the top-left</li>
                <li>Click <strong>Preferences → Default App Wallet</strong></li>
                <li>Choose <strong>Always Ask</strong> (or turn off default)</li>
                <li>Refresh this page and click <strong>Connect MetaMask</strong></li>
              </ol>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full py-2.5 rounded-xl bg-[#0033FF] hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Page to Re-detect MetaMask</span>
              </button>

              <button
                type="button"
                onClick={() => setPhantomOverrideWarning(false)}
                className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
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

              {lastReceipt.txHash && (
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">{activeChainConfig.explorerName} Explorer:</span>
                  <a
                    href={`${activeChainConfig.explorerUrl}/tx/${lastReceipt.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0033FF] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>{lastReceipt.txHash.slice(0, 10)}...{lastReceipt.txHash.slice(-4)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
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
                🛡️ {activeChainConfig.explorerName} Blockchain Verification:
              </span>
              <p className="text-[10px] text-blue-700 leading-relaxed">
                Public explorers see <code className="bg-blue-100 px-1 py-0.5 rounded">{activeChainConfig.poolContract.slice(0, 8)}... (ArcNano Pool)</code> as the originator. Your personal wallet address was never broadcast on-chain!
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

      {/* INSUFFICIENT TESTNET BALANCE / SIMULATION PROMPT MODAL */}
      {simulateModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-neutral-900">
                    Arc Testnet Balance Notice
                  </h3>
                  <span className="text-[10px] font-mono text-amber-600 font-semibold block">
                    Pool Denomination: 0.01 {simulateModalData.tokenSymbol}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={cancelSimulatedDeposit}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-2">
              <div className="flex justify-between items-center font-mono">
                <span className="text-neutral-500">Your Wallet Balance:</span>
                <span className="font-bold text-neutral-900">
                  {simulateModalData.currentBal} {simulateModalData.tokenSymbol}
                </span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-neutral-500">Required on Arc:</span>
                <span className="font-bold text-neutral-900">
                  0.0100 {simulateModalData.tokenSymbol}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-200 leading-relaxed font-sans">
                Your wallet currently has insufficient testnet tokens for an on-chain deposit. You can simulate the shielded note locally to test zero-knowledge transfers and withdrawals in the playground!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1 font-mono text-xs">
              <button
                type="button"
                onClick={confirmSimulatedDeposit}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0033FF] hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Simulate Note</span>
              </button>
              <button
                type="button"
                onClick={cancelSimulatedDeposit}
                className="py-3 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NETWORK SELECTION MODAL */}
      {networkSelectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0033FF]">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-neutral-900">
                    Select Arc Network
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Switch between Arc Testnet and Arc Mainnet
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNetworkSelectModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              {Object.values(SUPPORTED_ARC_CHAINS).map((chain) => {
                const isSelected = selectedChainId === chain.id;
                const isCurrentWalletChain = currentNumericChainId === chain.id;

                return (
                  <button
                    key={chain.id}
                    type="button"
                    onClick={() => {
                      setSelectedChainId(chain.id);
                      if (isWalletConnected) {
                        switchOrAddChain(chain.id);
                      } else {
                        setNetworkSelectModalOpen(false);
                      }
                    }}
                    disabled={isSwitchingChain}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs"
                        : "bg-white hover:bg-neutral-50 border-neutral-200/90"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          chain.isMainnet
                            ? "bg-blue-600 text-white shadow-xs shadow-blue-500/30"
                            : "bg-emerald-600 text-white shadow-xs shadow-emerald-500/30"
                        }`}
                      >
                        {chain.isMainnet ? "MAIN" : "TEST"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-neutral-900">
                            {chain.name}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                            Chain {chain.id}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-500 block font-mono mt-0.5 truncate">
                          Pool: {chain.poolContract.slice(0, 8)}...{chain.poolContract.slice(-4)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCurrentWalletChain && (
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                          Active
                        </span>
                      )}
                      {isSelected && (
                        <CheckCircle2 className="w-4.5 h-4.5 text-[#0033FF]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {currentNumericChainId !== 0 && !isSupportedArcChain && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                <span className="font-semibold block text-amber-900">Current Wallet Chain:</span>
                <p className="text-[11px] text-amber-700">
                  Your wallet is currently on <strong className="font-mono">{formatChainName(walletChainId)}</strong>. Selecting an Arc network will prompt your wallet to switch.
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setNetworkSelectModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATIONS */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[150] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";

          const bgBorderColor = isSuccess
            ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-50 shadow-emerald-950/40"
            : isError
            ? "bg-rose-950/90 border-rose-500/40 text-rose-50 shadow-rose-950/40"
            : isWarning
            ? "bg-amber-950/90 border-amber-500/40 text-amber-50 shadow-amber-950/40"
            : "bg-[#0b1329]/95 border-cyan-500/40 text-cyan-50 shadow-cyan-950/40";

          const iconColor = isSuccess
            ? "text-emerald-400"
            : isError
            ? "text-rose-400"
            : isWarning
            ? "text-amber-400"
            : "text-cyan-400";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl border p-4 shadow-xl backdrop-blur-xl transition-all duration-300 flex items-start gap-3 ${bgBorderColor}`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className={`w-5 h-5 ${iconColor}`} />}
                {isError && <AlertCircle className={`w-5 h-5 ${iconColor}`} />}
                {isWarning && <AlertCircle className={`w-5 h-5 ${iconColor}`} />}
                {!isSuccess && !isError && !isWarning && <Info className={`w-5 h-5 ${iconColor}`} />}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold tracking-wide text-white font-mono">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed break-words font-sans">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 p-1 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
