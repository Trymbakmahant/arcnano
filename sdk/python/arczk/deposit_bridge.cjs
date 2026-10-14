#!/usr/bin/env node

/**
 * ArcNano Deposit Bridge (.cjs)
 * Signs and submits on-chain deposits into ArcNanoPool on Arc Testnet
 * using a local burner wallet private key.
 */

const path = require('path');
const fs = require('fs');

// Locate viem from project node_modules
function loadViem() {
  const baseCandidates = [
    path.resolve(__dirname, '../../../landing-page/node_modules/viem'),
    path.resolve(__dirname, '../../../arc-marketplace/node_modules/viem'),
    path.resolve(__dirname, '../../../node_modules/viem'),
    path.resolve(process.cwd(), 'landing-page/node_modules/viem'),
    'viem'
  ];
  for (const c of baseCandidates) {
    try {
      const viem = require(c);
      const accounts = require(path.join(c, 'accounts'));
      return { viem, accounts };
    } catch (_) {}
  }
  throw new Error('viem package not found in node_modules');
}

const { viem, accounts } = loadViem();
const { createPublicClient, createWalletClient, http, parseAbi } = viem;
const { privateKeyToAccount } = accounts;

const ARC_RPC = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
const POOL_CONTRACT = process.env.ARCNANO_POOL || '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca';
const USDC_CONTRACT = process.env.USDC_CONTRACT || '0x3600000000000000000000000000000000000000';
const ARC_CHAIN = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'Arc', symbol: 'ARC', decimals: 18 },
  rpcUrls: { default: { http: [ARC_RPC] } }
};

const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
]);

const POOL_ABI = parseAbi([
  'function deposit(bytes32 commitment) external',
  'function denomination() view returns (uint256)'
]);

async function main() {
  const action = process.argv[2] || 'status';
  const rawKey = process.env.ARCNANO_BURNER_PRIVATE_KEY || process.env.AGENT_PRIVATE_KEY || process.argv[3];

  if (!rawKey) {
    console.log(JSON.stringify({
      success: false,
      error: 'No burner private key provided in ARCNANO_BURNER_PRIVATE_KEY or AGENT_PRIVATE_KEY environment variable.'
    }));
    process.exit(0);
  }

  const formattedKey = rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`;
  let account;
  try {
    account = privateKeyToAccount(formattedKey);
  } catch (err) {
    console.log(JSON.stringify({ success: false, error: `Invalid private key: ${err.message}` }));
    process.exit(0);
  }

  const publicClient = createPublicClient({ chain: ARC_CHAIN, transport: http(ARC_RPC) });
  const walletClient = createWalletClient({ account, chain: ARC_CHAIN, transport: http(ARC_RPC) });

  if (action === 'status') {
    try {
      const [nativeBal, usdcBal] = await Promise.all([
        publicClient.getBalance({ address: account.address }),
        publicClient.readContract({
          address: USDC_CONTRACT,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [account.address]
        }).catch(() => 0n)
      ]);

      console.log(JSON.stringify({
        success: true,
        address: account.address,
        native_balance_arc: (Number(nativeBal) / 1e18).toFixed(4),
        usdc_balance_raw: usdcBal.toString(),
        usdc_balance: (Number(usdcBal) / 1e6).toFixed(4),
        network: 'Arc Testnet (Circle L1)',
        pool_contract: POOL_CONTRACT
      }));
      return;
    } catch (err) {
      console.log(JSON.stringify({
        success: true,
        address: account.address,
        warning: `Could not reach RPC: ${err.message}`
      }));
      return;
    }
  }

  if (action === 'deposit') {
    const commitment = process.argv[3] || process.env.ARCNANO_COMMITMENT;
    const denomination = BigInt(process.argv[4] || process.env.ARCNANO_DENOMINATION || '10000');

    if (!commitment) {
      console.log(JSON.stringify({ success: false, error: 'Missing commitment bytes32 parameter' }));
      process.exit(0);
    }

    try {
      // 1. Check USDC allowance
      const allowance = await publicClient.readContract({
        address: USDC_CONTRACT,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [account.address, POOL_CONTRACT]
      }).catch(() => 0n);

      if (allowance < denomination) {
        // Approve a generous amount (1,000 USDC) so future micro-deposits don't require re-approvals
        const approveHash = await walletClient.writeContract({
          address: USDC_CONTRACT,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [POOL_CONTRACT, 1000000000n]
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }

      // 2. Execute pool.deposit(commitment)
      const depositHash = await walletClient.writeContract({
        address: POOL_CONTRACT,
        abi: POOL_ABI,
        functionName: 'deposit',
        args: [commitment]
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: depositHash });

      console.log(JSON.stringify({
        success: true,
        tx_hash: depositHash,
        explorer_url: `https://testnet.arcscan.io/tx/${depositHash}`,
        block_number: Number(receipt.blockNumber),
        depositor_address: account.address,
        commitment
      }));
    } catch (err) {
      console.log(JSON.stringify({
        success: false,
        depositor_address: account.address,
        error: err.shortMessage || err.message || String(err)
      }));
    }
  }
}

main().catch(err => {
  console.log(JSON.stringify({ success: false, error: err.message }));
});
