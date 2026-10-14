import { NoteVault, toBytes32Hex } from "./vault.js";
import { ArcAgentClient } from "./client.js";
import { ethers } from "ethers";

const DEFAULT_POOL = "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";
const DEFAULT_RPC = "https://rpc.testnet.arc.network";
const USDC_CONTRACT = "0x3600000000000000000000000000000000000000";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const POOL_ABI = [
  "function deposit(bytes32 commitment) external",
  "function denomination() view returns (uint256)"
];

export function getActiveBurnerKey(overrideKey?: string): string | null {
  if (overrideKey) return overrideKey;
  return process.env.ARCNANO_BURNER_PRIVATE_KEY || process.env.AGENT_PRIVATE_KEY || null;
}

export async function handleGetBurnerWallet(args: any = {}): Promise<any> {
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
        notice: "Auto-generated fresh burner wallet. Add this private key to ARCNANO_BURNER_PRIVATE_KEY in your MCP config."
      },
      funding_instructions: {
        address: randomWallet.address,
        network: "Arc Testnet (Chain ID 5042002)",
        faucet: "Send testnet USDC or ARC here to enable automated on-chain deposits."
      }
    };
  }

  const provider = new ethers.JsonRpcProvider(DEFAULT_RPC);
  const wallet = new ethers.Wallet(privateKey, provider);
  const usdc = new ethers.Contract(USDC_CONTRACT, ERC20_ABI, provider);

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
      network: "Arc Testnet (Circle L1)",
      pool_contract: DEFAULT_POOL
    },
    funding_instructions: {
      address: wallet.address,
      network: "Arc Testnet (Chain ID 5042002)"
    }
  };
}

export async function handleCreateShieldedNote(args: any = {}): Promise<any> {
  const denomination = args.denomination ? Number(args.denomination) : 10000;
  const vault = new NoteVault(args.vault_path);
  const note = await vault.createNote(denomination);

  const commitmentHex = toBytes32Hex(note.commitment);
  const nullifierHex = toBytes32Hex(note.nullifier_hash);

  return {
    success: true,
    message: `Successfully minted shielded note in local vault.`,
    note: {
      denomination,
      denomination_usdc: `${(denomination / 1e6).toFixed(4)} USDC`,
      commitment_hex: commitmentHex,
      nullifier_hash_hex: nullifierHex,
      is_spent: note.is_spent
    },
    vault: {
      path: vault.vaultPath,
      total_unspent_notes: vault.getUnspentCount(),
      total_unspent_usdc: `${(vault.getUnspentBalance() / 1e6).toFixed(4)} USDC`
    },
    deposit_instructions: {
      pool_contract: DEFAULT_POOL,
      chain_id: 5042002,
      playground_url: `https://arcnano.xyz/playground`,
      cli_command: `cast send ${DEFAULT_POOL} "deposit(bytes32)" ${commitmentHex} --rpc-url ${DEFAULT_RPC}`
    }
  };
}

export async function handleGetVaultStatus(args: any = {}): Promise<any> {
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
    notes: unspentNotes
  };
}

export async function handleDepositToPool(args: any = {}): Promise<any> {
  const denomination = args.denomination ? Number(args.denomination) : 10000;
  const vault = new NoteVault(args.vault_path);
  const note = await vault.createNote(denomination);
  const commitmentHex = toBytes32Hex(note.commitment);

  const burnerKey = getActiveBurnerKey(args.private_key);

  const result: any = {
    success: true,
    message: "Shielded note created in vault.",
    note: {
      denomination,
      denomination_usdc: `${(denomination / 1e6).toFixed(4)} USDC`,
      commitment_hex: commitmentHex,
      vault_path: vault.vaultPath
    },
    pool: {
      contract: DEFAULT_POOL,
      chain_id: 5042002,
      network: "Arc Testnet (Circle L1)"
    },
    playground_deposit_link: `https://arcnano.xyz/playground`,
    cast_deposit_command: `cast send ${DEFAULT_POOL} "deposit(bytes32)" ${commitmentHex} --rpc-url ${DEFAULT_RPC}`
  };

  if (burnerKey) {
    try {
      const provider = new ethers.JsonRpcProvider(DEFAULT_RPC);
      const wallet = new ethers.Wallet(burnerKey, provider);
      const usdc = new ethers.Contract(USDC_CONTRACT, ERC20_ABI, wallet);
      const pool = new ethers.Contract(DEFAULT_POOL, POOL_ABI, wallet);

      const allowance = await usdc.allowance(wallet.address, DEFAULT_POOL);
      if (allowance < BigInt(denomination)) {
        const approveTx = await usdc.approve(DEFAULT_POOL, 1000000000n);
        await approveTx.wait();
      }

      const depositTx = await pool.deposit(commitmentHex);
      const receipt = await depositTx.wait();

      result.onchain_status = "Deposited Successfully";
      result.onchain_tx_hash = receipt.hash;
      result.explorer_url = `https://testnet.arcscan.io/tx/${receipt.hash}`;
      result.depositor_address = wallet.address;
    } catch (err: any) {
      result.onchain_status = "Deposit Execution Attempted";
      result.onchain_notice = err.reason || err.message || "Failed to broadcast deposit transaction.";
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
