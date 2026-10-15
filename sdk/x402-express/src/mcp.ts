import { NoteVault, toBytes32Hex } from "./vault.js";
import { ArcAgentClient } from "./client.js";
import { ethers } from "ethers";

export interface ArcNetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  usdcContract: string;
  pools: Record<number, string>;
  batchers: Record<number, string>;
  defaultPool: string;
}

export const ARC_NETWORKS: Record<string, ArcNetworkConfig> = {
  testnet: {
    name: "Arc Testnet (Circle L1)",
    chainId: 5042002,
    rpcUrl: process.env.ARC_TESTNET_RPC || process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network",
    explorerUrl: "https://explorer.testnet.arc.io",
    usdcContract: "0x3600000000000000000000000000000000000000",
    pools: {
      10000: "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
      1000000: "0x716F5ea75f0B2a27c7a50F25E8Bb343A3B3530CB",
    },
    batchers: {
      10000: "0xD20E2c9aa6C291c15571440DAc7a6e773EC386e4",
      1000000: "0x76f7EA532E8080211d9B6Dcc03976c2101c7Ab86",
    },
    defaultPool: "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
  },
  mainnet: {
    name: "Arc Mainnet (Circle L1)",
    chainId: 5042,
    rpcUrl: process.env.ARC_MAINNET_RPC || "https://rpc.mainnet.arc.io",
    explorerUrl: "https://explorer.arc.io",
    usdcContract: "0x3600000000000000000000000000000000000000",
    pools: {
      10000: "0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd",
      1000000: "0x385394d11a93e84452970acf958bDdAab34f208f",
    },
    batchers: {
      10000: "0x34e54d470E4D95B3cFD8d6089Ae742346C19Af50",
      1000000: "0x006B10444dd88e463E93a7f4769b6885C7fa7b3b",
    },
    defaultPool: "0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd",
  }
};

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const POOL_ABI = [
  "function deposit(bytes32 commitment) external",
  "function denomination() view returns (uint256)"
];

export function resolveNetwork(networkArg?: string, chainIdArg?: number): { id: string; config: ArcNetworkConfig } {
  if (networkArg) {
    const key = networkArg.trim().toLowerCase();
    if (key === "mainnet" || key === "5042") return { id: "mainnet", config: ARC_NETWORKS.mainnet };
    if (key === "testnet" || key === "5042002") return { id: "testnet", config: ARC_NETWORKS.testnet };
  }
  if (chainIdArg) {
    if (chainIdArg === 5042) return { id: "mainnet", config: ARC_NETWORKS.mainnet };
    if (chainIdArg === 5042002) return { id: "testnet", config: ARC_NETWORKS.testnet };
  }
  const envNet = (process.env.ARCNANO_NETWORK || "testnet").trim().toLowerCase();
  if (envNet === "mainnet" || envNet === "5042") {
    return { id: "mainnet", config: ARC_NETWORKS.mainnet };
  }
  return { id: "testnet", config: ARC_NETWORKS.testnet };
}

export function getActiveBurnerKey(overrideKey?: string): string | null {
  if (overrideKey) return overrideKey;
  return process.env.ARCNANO_BURNER_PRIVATE_KEY || process.env.AGENT_PRIVATE_KEY || null;
}

export async function handleGetBurnerWallet(args: any = {}): Promise<any> {
  const { id: netKey, config: netConfig } = resolveNetwork(args.network, args.chain_id);
  const privateKey = getActiveBurnerKey(args.private_key);

  if (!privateKey) {
    // Generate a fresh burner wallet
    const randomWallet = ethers.Wallet.createRandom();
    return {
      success: true,
      burner_wallet: {
        address: randomWallet.address,
        private_key: randomWallet.privateKey,
        native_balance_arc: "0.0000",
        usdc_balance: "0.0000",
        network: netConfig.name,
        chain_id: netConfig.chainId,
        notice: "Auto-generated fresh burner wallet. Add this private key to ARCNANO_BURNER_PRIVATE_KEY in your MCP config."
      },
      funding_instructions: {
        address: randomWallet.address,
        network: `${netConfig.name} (Chain ID ${netConfig.chainId})`,
        faucet: `Send native ARC (gas) and USDC here to enable automated on-chain deposits on ${netConfig.name}.`
      }
    };
  }

  const provider = new ethers.JsonRpcProvider(netConfig.rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const usdc = new ethers.Contract(netConfig.usdcContract, ERC20_ABI, provider);

  const [nativeBal, usdcBal] = await Promise.all([
    provider.getBalance(wallet.address).catch(() => 0n),
    usdc.balanceOf(wallet.address).catch(() => 0n)
  ]);

  return {
    success: true,
    burner_wallet: {
      address: wallet.address,
      native_balance_arc: ethers.formatEther(nativeBal),
      usdc_balance: (Number(usdcBal) / 1e6).toFixed(4),
      network: netConfig.name,
      chain_id: netConfig.chainId,
      default_pool: netConfig.defaultPool,
      pools: netConfig.pools,
      explorer_url: `${netConfig.explorerUrl}/address/${wallet.address}`
    },
    funding_instructions: {
      address: wallet.address,
      network: `${netConfig.name} (Chain ID ${netConfig.chainId})`
    }
  };
}

export async function handleCreateShieldedNote(args: any = {}): Promise<any> {
  const denomination = args.denomination ? Number(args.denomination) : 10000;
  const { id: netKey, config: netConfig } = resolveNetwork(args.network, args.chain_id);

  const poolContract = args.pool_address || netConfig.pools[denomination] || netConfig.defaultPool;
  const batcherContract = netConfig.batchers[denomination] || netConfig.batchers[10000];

  const vault = new NoteVault(args.vault_path);
  const note = await vault.createNote(denomination);

  const commitmentHex = toBytes32Hex(note.commitment);
  const nullifierHex = toBytes32Hex(note.nullifier_hash);

  return {
    success: true,
    message: `Successfully minted shielded note in local vault for ${netConfig.name}.`,
    note: {
      denomination,
      denomination_usdc: `${(denomination / 1e6).toFixed(4)} USDC`,
      commitment_hex: commitmentHex,
      nullifier_hash_hex: nullifierHex,
      is_spent: note.is_spent
    },
    network: {
      id: netKey,
      name: netConfig.name,
      chain_id: netConfig.chainId,
      rpc_url: netConfig.rpcUrl,
      explorer_url: netConfig.explorerUrl
    },
    vault: {
      path: vault.vaultPath,
      total_unspent_notes: vault.getUnspentCount(),
      total_unspent_usdc: `${(vault.getUnspentBalance() / 1e6).toFixed(4)} USDC`
    },
    deposit_instructions: {
      pool_contract: poolContract,
      batcher_contract: batcherContract,
      chain_id: netConfig.chainId,
      playground_url: `https://arcnano.xyz/playground`,
      cli_command: `cast send ${poolContract} "deposit(bytes32)" ${commitmentHex} --rpc-url ${netConfig.rpcUrl}`,
      batch_deposit_cli: `cast send ${batcherContract} "depositBatch(bytes32[])" "[${commitmentHex}]" --rpc-url ${netConfig.rpcUrl}`
    }
  };
}

export async function handleGetVaultStatus(args: any = {}): Promise<any> {
  const { id: netKey, config: netConfig } = resolveNetwork(args.network, args.chain_id);
  const vault = new NoteVault(args.vault_path);
  const unspentNotes = vault.notes
    .filter(n => !n.is_spent)
    .map(n => ({
      denomination: n.denomination,
      denomination_usdc: `${(n.denomination / 1e6).toFixed(4)} USDC`,
      commitment_hex: toBytes32Hex(n.commitment),
      nullifier_hash_hex: toBytes32Hex(n.nullifier_hash)
    }));

  return {
    success: true,
    vault_path: vault.vaultPath,
    active_unspent_notes: vault.getUnspentCount(),
    total_unspent_usdc: `${(vault.getUnspentBalance() / 1e6).toFixed(4)} USDC`,
    current_network: {
      id: netKey,
      name: netConfig.name,
      chain_id: netConfig.chainId,
      default_pool: netConfig.defaultPool
    },
    notes: unspentNotes
  };
}

export async function handleDepositToPool(args: any = {}): Promise<any> {
  const denomination = args.denomination ? Number(args.denomination) : 10000;
  const { id: netKey, config: netConfig } = resolveNetwork(args.network, args.chain_id);

  const poolAddress = args.pool_address || netConfig.pools[denomination] || netConfig.defaultPool;
  const batcherAddress = netConfig.batchers[denomination] || netConfig.batchers[10000];

  const vault = new NoteVault(args.vault_path);
  const note = await vault.createNote(denomination);
  const commitmentHex = toBytes32Hex(note.commitment);

  const burnerKey = getActiveBurnerKey(args.private_key);

  const result: any = {
    success: true,
    message: `Shielded note created in vault for ${netConfig.name}.`,
    note: {
      denomination,
      denomination_usdc: `${(denomination / 1e6).toFixed(4)} USDC`,
      commitment_hex: commitmentHex,
      vault_path: vault.vaultPath
    },
    pool: {
      contract: poolAddress,
      batcher_contract: batcherAddress,
      chain_id: netConfig.chainId,
      network: netConfig.name
    },
    playground_deposit_link: `https://arcnano.xyz/playground`,
    cast_deposit_command: `cast send ${poolAddress} "deposit(bytes32)" ${commitmentHex} --rpc-url ${netConfig.rpcUrl}`
  };

  if (burnerKey) {
    try {
      const provider = new ethers.JsonRpcProvider(netConfig.rpcUrl);
      const wallet = new ethers.Wallet(burnerKey, provider);
      const usdc = new ethers.Contract(netConfig.usdcContract, ERC20_ABI, wallet);
      const pool = new ethers.Contract(poolAddress, POOL_ABI, wallet);

      const allowance = await usdc.allowance(wallet.address, poolAddress);
      if (allowance < BigInt(denomination)) {
        const approveTx = await usdc.approve(poolAddress, 1000000000n);
        await approveTx.wait();
      }

      const depositTx = await pool.deposit(commitmentHex);
      const receipt = await depositTx.wait();

      result.onchain_status = "Deposited Successfully";
      result.onchain_tx_hash = receipt.hash;
      result.explorer_url = `${netConfig.explorerUrl}/tx/${receipt.hash}`;
      result.depositor_address = wallet.address;
      result.block_number = receipt.blockNumber;
    } catch (err: any) {
      result.onchain_status = "Deposit Execution Attempted";
      result.onchain_notice = err.reason || err.message || `Failed to broadcast deposit transaction on ${netConfig.name}.`;
    }
  }

  return result;
}

export async function handlePayX402Api(args: any = {}): Promise<any> {
  if (!args.url) {
    return { success: false, error: "Missing required 'url' parameter" };
  }

  const vault = new NoteVault(args.vault_path);
  const client = new ArcAgentClient(vault);

  try {
    const resp = await client.fetch(args.url, {
      method: (args.method || "POST").toUpperCase(),
      body: args.json_body ? JSON.stringify(args.json_body) : undefined,
      headers: { "Content-Type": "application/json" }
    });

    const isJson = resp.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await resp.json() : await resp.text();

    return {
      success: resp.ok,
      status_code: resp.status,
      url: args.url,
      response: data,
      vault_balance_remaining_usdc: `${(vault.getUnspentBalance() / 1e6).toFixed(4)} USDC`
    };
  } catch (err: any) {
    return {
      success: false,
      url: args.url,
      error: err.message || String(err)
    };
  }
}
