export interface PredictionMarketTask {
  id: string;
  title: string;
  category: "CRYPTO" | "MACRO" | "AI" | "POLICY";
  summary: string;
  priceUsdc: number;
  priceUnits: number;
  volume24h: string;
  totalAgentQueries: number;
  oracleSource: string;
  probabilityYes: number;
  probabilityNo: number;
  confidenceScore: number;
  resolutionDate: string;
  status: "ACTIVE" | "SETTLING" | "RESOLVED";
  signals: {
    agentConsensus: string;
    volatilityIndex: string;
    liquidityDepth: string;
    topPredictors: number;
  };
  sampleEndpoint: string;
}

export const PREDICTION_MARKETS: PredictionMarketTask[] = [
  {
    id: "mkt-arc-tvl-q4",
    title: "Will Arc Network Total Value Locked (TVL) Exceed $500M in 2026?",
    category: "CRYPTO",
    summary: "Consensus prediction on Arc Network Circle L1 DeFi ecosystem expansion and institutional stablecoin vault adoption.",
    priceUsdc: 0.005,
    priceUnits: 5000,
    volume24h: "$342,800",
    totalAgentQueries: 48920,
    oracleSource: "DefiLlama Multi-Oracle + Arcscan On-Chain Aggregator",
    probabilityYes: 78.4,
    probabilityNo: 21.6,
    confidenceScore: 94.2,
    resolutionDate: "2026-12-31T23:59:59Z",
    status: "ACTIVE",
    signals: {
      agentConsensus: "Strong Bullish (+14.2% 7d change)",
      volatilityIndex: "Medium (0.28)",
      liquidityDepth: "1.25M USDC in Escrow Pool",
      topPredictors: 142,
    },
    sampleEndpoint: "/api/v1/markets/mkt-arc-tvl-q4/forecast",
  },
  {
    id: "mkt-fed-rate-cut",
    title: "Will the US Federal Reserve Cut Benchmark Rates by >=25bps at Next Meeting?",
    category: "MACRO",
    summary: "Aggregated machine forecasts from macroeconomic data releases, CPI prints, and nonfarm payroll sentiment pipelines.",
    priceUsdc: 0.005,
    priceUnits: 5000,
    volume24h: "$1,120,400",
    totalAgentQueries: 112450,
    oracleSource: "CME FedWatch API + BLS Official Data Feeds",
    probabilityYes: 63.1,
    probabilityNo: 36.9,
    confidenceScore: 91.8,
    resolutionDate: "2026-11-15T18:00:00Z",
    status: "ACTIVE",
    signals: {
      agentConsensus: "Moderately Dovish",
      volatilityIndex: "Low (0.16)",
      liquidityDepth: "3.80M USDC in Escrow Pool",
      topPredictors: 388,
    },
    sampleEndpoint: "/api/v1/markets/mkt-fed-rate-cut/forecast",
  },
  {
    id: "mkt-btc-120k",
    title: "Will Bitcoin Spot Price Reach or Exceed $120,000 Before Q1 2027?",
    category: "CRYPTO",
    summary: "High-throughput probabilistic orderbook prediction synthesized from global centralized and decentralized spot exchanges.",
    priceUsdc: 0.002,
    priceUnits: 2000,
    volume24h: "$2,890,100",
    totalAgentQueries: 320910,
    oracleSource: "Chainlink TWAP + Pyth Network High-Frequency Feeds",
    probabilityYes: 81.9,
    probabilityNo: 18.1,
    confidenceScore: 96.5,
    resolutionDate: "2026-12-31T23:59:59Z",
    status: "ACTIVE",
    signals: {
      agentConsensus: "Aggressively Bullish",
      volatilityIndex: "High (0.42)",
      liquidityDepth: "8.40M USDC in Escrow Pool",
      topPredictors: 924,
    },
    sampleEndpoint: "/api/v1/markets/mkt-btc-120k/forecast",
  },
  {
    id: "mkt-frontier-llm-bench",
    title: "Will Any Open-Weights Model Exceed 92.0% on HumanEval / MMLU Benchmark by Q4?",
    category: "AI",
    summary: "Machine learning research tracker analyzing parameter-efficiency breakthroughs in open-weight models.",
    priceUsdc: 0.008,
    priceUnits: 8000,
    volume24h: "$184,200",
    totalAgentQueries: 28400,
    oracleSource: "Hugging Face Leaderboard + LMSYS Chatbot Arena Verified Elo",
    probabilityYes: 54.7,
    probabilityNo: 45.3,
    confidenceScore: 88.3,
    resolutionDate: "2026-10-31T23:59:59Z",
    status: "ACTIVE",
    signals: {
      agentConsensus: "Toss-up (Rapid architectural shifts)",
      volatilityIndex: "Very High (0.61)",
      liquidityDepth: "640K USDC in Escrow Pool",
      topPredictors: 84,
    },
    sampleEndpoint: "/api/v1/markets/mkt-frontier-llm-bench/forecast",
  },
  {
    id: "mkt-circle-paymaster-usage",
    title: "Will Arc Circle Gas Station Sponsor >10,000,000 AI Agent Transactions?",
    category: "CRYPTO",
    summary: "Forecast on the rapid adoption of sponsored gas paymasters for autonomous agent machine-to-machine microtransactions.",
    priceUsdc: 0.003,
    priceUnits: 3000,
    volume24h: "$96,400",
    totalAgentQueries: 19800,
    oracleSource: "Arc L1 Arcscan Paymaster Contract Metrics",
    probabilityYes: 93.2,
    probabilityNo: 6.8,
    confidenceScore: 97.4,
    resolutionDate: "2026-12-31T23:59:59Z",
    status: "ACTIVE",
    signals: {
      agentConsensus: "Overwhelmingly Positive",
      volatilityIndex: "Very Low (0.09)",
      liquidityDepth: "450K USDC in Escrow Pool",
      topPredictors: 112,
    },
    sampleEndpoint: "/api/v1/markets/mkt-circle-paymaster-usage/forecast",
  },
  {
    id: "mkt-ai-copyright-treaty",
    title: "Will G7 Nations Ratify a Unified AI Training Data Fair-Use Framework?",
    category: "POLICY",
    summary: "Geopolitical and regulatory prediction evaluating policy coordination between US, EU, and Asian legal bodies.",
    priceUsdc: 0.005,
    priceUnits: 5000,
    volume24h: "$78,500",
    totalAgentQueries: 14200,
    oracleSource: "OECD AI Policy Observatory + Global Regulatory Monitor",
    probabilityYes: 38.6,
    probabilityNo: 61.4,
    confidenceScore: 89.1,
    resolutionDate: "2026-12-15T23:59:59Z",
    status: "ACTIVE",
    signals: {
      agentConsensus: "Skeptical (Bilateral fragmentation)",
      volatilityIndex: "Medium (0.33)",
      liquidityDepth: "320K USDC in Escrow Pool",
      topPredictors: 76,
    },
    sampleEndpoint: "/api/v1/markets/mkt-ai-copyright-treaty/forecast",
  },
];

export const PROTOCOL_CONFIG = {
  recipient: "0x063829800C7214C6AaD38f57C72561641cD80333",
  poolAddress: "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
  currentRoot: "15055926234077295509216400193975320613085685875483293700481590095656163448343",
  aspRoot: "19128018104003351169958007405541096654276287024914820341236452486826146398487",
  chain: "Arc Testnet (5042002)",
  relayerFee: "Sponsored ($0.00 by Circle Gas Station)",
};
