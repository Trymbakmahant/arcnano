"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  ExternalLink,
  Sun,
  Moon,
  Zap,
  ShieldCheck,
  Cpu,
  TrendingUp,
  Terminal,
  Code2,
  Copy,
  Check,
  ChevronRight,
  Filter,
  Layers,
  ArrowRight,
  Database,
  Lock,
} from "lucide-react";
import { PREDICTION_MARKETS, PROTOCOL_CONFIG, PredictionMarketTask } from "@/lib/markets";

export default function ArcMarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarketTask>(PREDICTION_MARKETS[0]);
  const [activeTab, setActiveTab] = useState<"marketplace" | "api">("marketplace");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeLang, setActiveLang] = useState<"python" | "typescript" | "curl">("python");

  // Agent SDK Purchase Simulation States
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulationStep, setSimulationStep] = useState<number>(0);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  const filteredMarkets = PREDICTION_MARKETS.filter((m) => {
    const matchesCat = selectedCategory === "ALL" || m.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.oracleSource.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleRunAgentPurchase = async (market: PredictionMarketTask) => {
    setSelectedMarket(market);
    setIsSimulating(true);
    setSimulationResult(null);
    setSimulationStep(1);

    try {
      // Step 1: HTTP 402 challenge
      await new Promise((r) => setTimeout(r, 600));
      setSimulationStep(2);

      // Step 2: Note Vault Groth16 synthesis in RAM
      await new Promise((r) => setTimeout(r, 800));
      setSimulationStep(3);

      // Step 3: Call backend agent-query simulation
      const res = await fetch("/api/v1/agent-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketId: market.id }),
      });

      const data = await res.json();
      setSimulationStep(4);
      await new Promise((r) => setTimeout(r, 500));
      setSimulationResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const getCodeSnippet = () => {
    if (activeLang === "python") {
      return `# Python Autonomous Agent querying prediction task via arczk-agent SDK
from arczk import ArcAgentClient, NoteVault

# 1. Initialize agent note vault (holds Poseidon shielded notes)
vault = NoteVault()

# 2. Agent queries prediction market endpoint
# ArcAgentClient intercepts HTTP 402 and generates Groth16 proof in RAM
client = ArcAgentClient(vault=vault)
endpoint = "https://marketplace.arcnano.xyz/api/v1/markets/${selectedMarket.id}/forecast"

response = client.get(endpoint)
forecast = response.json()

print(f"Verified Yes Probability: {forecast['predictionData']['probabilityYes']}%")
print(f"Proof Latency: {forecast['verifiedPayment']['verificationLatencyMs']}ms")
print(f"Gas Paid by Agent: {forecast['verifiedPayment']['gasPaidByAgent']}")`;
    }

    if (activeLang === "typescript") {
      return `// TypeScript / Node AI Agent using @arcnano/x402-client
import { ArcNanoClient, MemoryVault } from "@arcnano/x402-client";

const vault = new MemoryVault();
const client = new ArcNanoClient({ vault });

const marketId = "${selectedMarket.id}";
const forecast = await client.queryMarketForecast(marketId);

console.log("Prediction Consensus:", forecast.predictionData.signals.agentConsensus);
console.log("Confidence Score:", forecast.predictionData.confidenceScore);
console.log("Nullifier Recorded:", forecast.verifiedPayment.nullifierHash);`;
    }

    return `# Step 1: Initial request returns HTTP 402 Payment Required with invoice
curl -i https://marketplace.arcnano.xyz/api/v1/markets/${selectedMarket.id}/forecast

# Step 2: Resend with Groth16 proof in X-PAYMENT-PROOF header
curl -X GET https://marketplace.arcnano.xyz/api/v1/markets/${selectedMarket.id}/forecast \\
  -H "X-PAYMENT-PROOF: 0x2a98f103b49e...c7" \\
  -H "Content-Type: application/json"`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors ${isDark ? "bg-[#090A0F] text-neutral-100" : "bg-[#F8FAFC] text-neutral-900"}`}>
      {/* Subtle CAD Grid Backdrop */}
      <div className="fixed inset-0 pointer-events-none cad-grid opacity-60 z-0" />

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/85 dark:bg-neutral-950/85 backdrop-blur-md px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-neutral-950 dark:bg-white flex items-center justify-center p-1.5 shadow-xs">
              <Image
                src={isDark ? "/arcnano-icon.png" : "/arcnano-icon-white.png"}
                alt="ArcNano Logo"
                width={20}
                height={20}
                className="w-4 h-4 object-contain"
                priority
              />
            </div>
            <span className="font-semibold text-sm tracking-tight">
              Arc<span className="font-mono text-amber-500">Marketplace</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 border border-black/[0.05] dark:border-white/[0.08]">
              AI Agent Prediction Markets
            </span>
          </div>

          {/* Center Tabs: Marketplace vs API Integration */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono">
            <button
              onClick={() => setActiveTab("marketplace")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === "marketplace"
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              }`}
            >
              Task Marketplace
            </button>
            <button
              onClick={() => setActiveTab("api")}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === "api"
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
              }`}
            >
              Prediction API & SDK
            </button>
          </div>

          {/* Right Status Pill & Docs */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Arc Testnet • $0 Gas Paymaster</span>
            </div>

            <a
              href="https://docs.arcnano.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="h-3.5 w-px bg-neutral-200 dark:bg-neutral-800" />

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 relative z-10 space-y-8">
        
        {/* HERO SECTION */}
        <section className="text-left relative">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20 mb-3">
            <Zap className="w-3 h-3" />
            <span>Autonomous Machine-to-Machine Nanopayments</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
            AI Agent Prediction Marketplace
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2 max-w-2xl leading-relaxed">
            Autonomous AI agents search prediction tasks, query probabilistic oracle feeds, and execute sub-cent zero-knowledge micropayments over HTTP 402 with $0.00 gas fees.
          </p>

          {/* 4 Protocol Metric Ticks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="p-3 sm:p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-neutral-900/60 relative">
              <div className="corner-tick corner-tick-tl text-neutral-400" />
              <div className="corner-tick corner-tick-tr text-neutral-400" />
              <div className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">Settlement Cost</div>
              <div className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">$0.002 - $0.008</div>
              <div className="text-[11px] text-neutral-500 font-mono">Per agent query</div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-neutral-900/60 relative">
              <div className="corner-tick corner-tick-tl text-neutral-400" />
              <div className="corner-tick corner-tick-tr text-neutral-400" />
              <div className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">Agent Gas Balance</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">$0.00 Required</div>
              <div className="text-[11px] text-neutral-500 font-mono">Circle Gas Station sponsored</div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-neutral-900/60 relative">
              <div className="corner-tick corner-tick-tl text-neutral-400" />
              <div className="corner-tick corner-tick-tr text-neutral-400" />
              <div className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">Gateway Latency</div>
              <div className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5">&lt; 8ms In-Memory</div>
              <div className="text-[11px] text-neutral-500 font-mono">Groth16 pair verification</div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-neutral-900/60 relative">
              <div className="corner-tick corner-tick-tl text-neutral-400" />
              <div className="corner-tick corner-tick-tr text-neutral-400" />
              <div className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">Identity Exposure</div>
              <div className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-0.5">Zero msg.sender</div>
              <div className="text-[11px] text-neutral-500 font-mono">Receiver-batched calldata</div>
            </div>
          </div>
        </section>

        {/* TAB TOGGLE ON MOBILE */}
        <div className="flex md:hidden items-center gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono">
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer ${
              activeTab === "marketplace"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-2xs"
                : "text-neutral-600 dark:text-neutral-400"
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`flex-1 py-1.5 rounded-md text-center transition-all cursor-pointer ${
              activeTab === "api"
                ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold shadow-2xs"
                : "text-neutral-600 dark:text-neutral-400"
            }`}
          >
            API & Code
          </button>
        </div>

        {/* SECTION A: TASK MARKETPLACE */}
        {activeTab === "marketplace" && (
          <div className="space-y-6">
            {/* SEARCH & FILTER BAR */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-mono">
                {["ALL", "CRYPTO", "MACRO", "AI", "POLICY"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                      selectedCategory === cat
                        ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white font-semibold"
                        : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-black/8 dark:border-white/10 hover:border-black/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prediction tasks..."
                  className="w-full py-1.5 pl-8 pr-3 text-xs rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 focus:outline-hidden focus:border-amber-500 text-neutral-900 dark:text-neutral-100 font-sans"
                />
              </div>
            </div>

            {/* PREDICTION TASK CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarkets.map((market) => (
                <div
                  key={market.id}
                  className="p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-neutral-900/70 hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  {/* Corner Blueprint Ticks */}
                  <div className="corner-tick corner-tick-tl text-neutral-300 dark:text-neutral-700 group-hover:text-amber-500 transition-colors" />
                  <div className="corner-tick corner-tick-tr text-neutral-300 dark:text-neutral-700 group-hover:text-amber-500 transition-colors" />
                  <div className="corner-tick corner-tick-bl text-neutral-300 dark:text-neutral-700 group-hover:text-amber-500 transition-colors" />
                  <div className="corner-tick corner-tick-br text-neutral-300 dark:text-neutral-700 group-hover:text-amber-500 transition-colors" />

                  <div>
                    {/* Category + Cost Tag */}
                    <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                      <span className="px-2 py-0.5 rounded uppercase font-semibold bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
                        {market.category}
                      </span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        ${market.priceUsdc} USDC
                      </span>
                    </div>

                    {/* Market Title */}
                    <h3 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 line-clamp-2">
                      {market.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                      {market.summary}
                    </p>

                    {/* PROBABILITY BAR */}
                    <div className="mt-4 pt-3 border-t border-black/[0.05] dark:border-white/[0.06]">
                      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          YES {market.probabilityYes}%
                        </span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          NO {market.probabilityNo}%
                        </span>
                      </div>

                      <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-white/10 overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full transition-all"
                          style={{ width: `${market.probabilityYes}%` }}
                        />
                        <div
                          className="bg-rose-500 h-full transition-all"
                          style={{ width: `${market.probabilityNo}%` }}
                        />
                      </div>
                    </div>

                    {/* METRICS ROW */}
                    <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-mono text-neutral-500">
                      <div>
                        <div className="text-[10px] text-neutral-400">24H VOLUME</div>
                        <div className="font-semibold text-neutral-800 dark:text-neutral-200">{market.volume24h}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-400">AGENT QUERIES</div>
                        <div className="font-semibold text-neutral-800 dark:text-neutral-200">{market.totalAgentQueries.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="mt-5 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-2">
                    <button
                      onClick={() => handleRunAgentPurchase(market)}
                      className="flex-1 py-2 px-3 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-mono font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Run Agent SDK</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedMarket(market);
                        setActiveTab("api");
                      }}
                      className="p-2 rounded-xl border border-black/10 dark:border-white/15 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-neutral-600 dark:text-neutral-300"
                      title="Inspect API endpoint"
                    >
                      <Code2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION B: API & CODE INTEGRATION */}
        {activeTab === "api" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Active Market Endpoint Details */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-neutral-900/70 relative">
                <div className="corner-tick corner-tick-tl text-neutral-400" />
                <div className="corner-tick corner-tick-tr text-neutral-400" />
                <div className="text-xs font-mono text-neutral-400 uppercase tracking-widest mb-1">
                  Target Prediction Task
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {selectedMarket.title}
                </h3>

                <div className="mt-4 space-y-2.5 text-xs font-mono border-t border-black/[0.06] dark:border-white/[0.08] pt-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Endpoint:</span>
                    <span className="text-neutral-900 dark:text-neutral-100 truncate ml-2">
                      GET {selectedMarket.sampleEndpoint}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Query Price:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      ${selectedMarket.priceUsdc} USDC ({selectedMarket.priceUnits} units)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Oracle Source:</span>
                    <span className="text-neutral-800 dark:text-neutral-200 text-right truncate ml-2">
                      {selectedMarket.oracleSource}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Escrow Contract:</span>
                    <span className="text-neutral-800 dark:text-neutral-200">
                      {PROTOCOL_CONFIG.poolAddress.slice(0, 8)}...{PROTOCOL_CONFIG.poolAddress.slice(-6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Gas Sponsorship:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      $0.00 (Circle Paymaster)
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    onClick={() => handleRunAgentPurchase(selectedMarket)}
                    className="w-full py-2.5 px-4 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-mono font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Test Payment Handshake Live</span>
                  </button>
                </div>
              </div>

              {/* Protocol Invoice Schema */}
              <div className="p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-neutral-50/70 dark:bg-neutral-900/40 text-xs font-mono text-neutral-600 dark:text-neutral-400 space-y-1.5">
                <div className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>X402 Challenge Protocol Handshake</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  When an agent queries without proof, the API gateway halts inference with HTTP 402, returning Merkle root and ASP non-membership parameters.
                </p>
              </div>
            </div>

            {/* Right: Code Snippets Explorer */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-neutral-950 text-neutral-100 overflow-hidden shadow-md">
                {/* Code Header Bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-neutral-900/60">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    {(["python", "typescript", "curl"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveLang(lang)}
                        className={`px-3 py-1 rounded-md uppercase font-semibold transition-colors cursor-pointer ${
                          activeLang === lang
                            ? "bg-white/15 text-white"
                            : "text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                {/* Preformatted Code Content */}
                <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed max-h-[380px] scrollbar-thin">
                  <pre className="text-neutral-200">
                    <code>{getCodeSnippet()}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL / SIMULATION OVERLAY: LIVE AGENT EXECUTION */}
        {(isSimulating || simulationResult) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="max-w-xl w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-950 p-6 shadow-2xl relative space-y-5 animate-in fade-in duration-200">
              {/* Corner ticks */}
              <div className="corner-tick corner-tick-tl text-amber-500" />
              <div className="corner-tick corner-tick-tr text-amber-500" />

              <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                    Autonomous Agent Payment Simulation
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsSimulating(false);
                    setSimulationResult(null);
                  }}
                  className="text-xs font-mono text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  Close [Esc]
                </button>
              </div>

              {/* Progress Steps */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Target Task: {selectedMarket.title}
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${simulationStep >= 1 ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-400" : "bg-neutral-50 dark:bg-white/5 border-transparent text-neutral-400"}`}>
                    <span>1. Query /api/v1/forecast (HTTP 402 Handshake)</span>
                    {simulationStep > 1 ? <Check className="w-4 h-4 text-emerald-500" /> : simulationStep === 1 ? <span className="animate-spin text-amber-500">⟳</span> : null}
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${simulationStep >= 2 ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-400" : "bg-neutral-50 dark:bg-white/5 border-transparent text-neutral-400"}`}>
                    <span>2. Synthesize Groth16 Note Proof in RAM (~74ms)</span>
                    {simulationStep > 2 ? <Check className="w-4 h-4 text-emerald-500" /> : simulationStep === 2 ? <span className="animate-spin text-amber-500">⟳</span> : null}
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${simulationStep >= 3 ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-400" : "bg-neutral-50 dark:bg-white/5 border-transparent text-neutral-400"}`}>
                    <span>3. In-Memory Gateway Verification (&lt; 8ms)</span>
                    {simulationStep > 3 ? <Check className="w-4 h-4 text-emerald-500" /> : simulationStep === 3 ? <span className="animate-spin text-amber-500">⟳</span> : null}
                  </div>

                  <div className={`p-2.5 rounded-lg border flex items-center justify-between ${simulationStep >= 4 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" : "bg-neutral-50 dark:bg-white/5 border-transparent text-neutral-400"}`}>
                    <span>4. Arc L1 Circle Paymaster Batch Settlement ($0.00 Gas)</span>
                    {simulationStep >= 4 ? <Check className="w-4 h-4 text-emerald-500" /> : null}
                  </div>
                </div>
              </div>

              {/* UNLOCKED PREDICTION DATA RESULTS */}
              {simulationResult && (
                <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 text-xs font-mono space-y-2">
                    <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400">
                      <span>PREDICTION DATA UNLOCKED</span>
                      <span>Confidence: {simulationResult.result.confidenceScore}%</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-neutral-800 dark:text-neutral-200">
                      <div>Consensus Yes: <strong>{simulationResult.result.probabilityYes}%</strong></div>
                      <div>Consensus No: <strong>{simulationResult.result.probabilityNo}%</strong></div>
                      <div>Proof Gen Time: <strong>{simulationResult.result.proofLatencyMs}ms</strong></div>
                      <div>Gateway Latency: <strong>{simulationResult.result.gatewayLatencyMs}ms</strong></div>
                      <div>Agent Gas Paid: <strong className="text-emerald-500">{simulationResult.result.agentGasPaid}</strong></div>
                      <div>Identity Leaked: <strong>Zero (msg.sender shielded)</strong></div>
                    </div>

                    <div className="pt-2 border-t border-emerald-500/20 text-[10px] text-neutral-500 truncate">
                      Nullifier: {simulationResult.result.nullifierHash}
                    </div>
                  </div>

                  <button
                    onClick={() => setSimulationResult(null)}
                    className="w-full py-2 px-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-mono font-semibold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.08] py-5 px-4 sm:px-8 text-center text-xs font-mono text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>ArcMarketplace • Autonomous AI Agent Prediction Markets • Arc Network (5042002)</span>
          <div className="flex items-center gap-4">
            <a href="https://docs.arcnano.xyz/" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-800 dark:hover:text-white transition-colors">Docs</a>
            <span>•</span>
            <a href="https://github.com/Trymbakmahant/arcnano" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-800 dark:hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
