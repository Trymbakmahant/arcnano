#!/usr/bin/env node

/**
 * ArcNano Deposit Bridge (.cjs)
 * Signs and submits on-chain deposits into ArcNanoPool on Arc Mainnet & Testnet
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

const NETWORKS = {
  testnet: {
    chainId: 5042002,
    name: 'Arc Testnet (Circle L1)',
    rpc: process.env.ARC_TESTNET_RPC || process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network',
    explorer: 'https://testnet.arcscan.io',
    pools: {
      10000: '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca',
      1000000: '0x716F5ea75f0B2a27c7a50F25E8Bb343A3B3530CB'
    },
    defaultPool: '0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca'
  },
  mainnet: {
    chainId: 5042,
    name: 'Arc Mainnet (Circle L1)',
    rpc: process.env.ARC_MAINNET_RPC || 'https://rpc.mainnet.arc.io',
    explorer: 'https://arcscan.io',
    pools: {
      10000: '0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd',
      1000000: '0x385394d11a93e84452970acf958bDdAab34f208f'
    },
    defaultPool: '0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd'
  }
};

const USDC_CONTRACT = process.env.USDC_CONTRACT || '0x3600000000000000000000000000000000000000';

const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
]);

const POOL_ABI = parseAbi([
  'function deposit(bytes32 commitment) external',
  'function denomination() view returns (uint256)'
]);

function resolveNetwork(targetNet) {
  const normalized = (targetNet || process.env.ARCNANO_NETWORK || 'testnet').toLowerCase().trim();
  if (normalized === 'mainnet' || normalized === '5042') {
    return NETWORKS.mainnet;
  }
  return NETWORKS.testnet;
}

async function main() {
  const action = process.argv[2] || 'status';
  const rawKey = process.env.ARCNANO_BURNER_PRIVATE_KEY || process.env.AGENT_PRIVATE_KEY || process.argv[3];
  const networkArg = process.env.ARCNANO_NETWORK || process.argv[5];
  const netConfig = resolveNetwork(networkArg);

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

  const ARC_CHAIN = {
    id: netConfig.chainId,
    name: netConfig.name,
    nativeCurrency: { name: 'Arc', symbol: 'ARC', decimals: 18 },
    rpcUrls: { default: { http: [netConfig.rpc] } }
  };

  const publicClient = createPublicClient({ chain: ARC_CHAIN, transport: http(netConfig.rpc) });
  const walletClient = createWalletClient({ account, chain: ARC_CHAIN, transport: http(netConfig.rpc) });

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
        network: netConfig.name,
        chain_id: netConfig.chainId,
        default_pool: netConfig.defaultPool,
        pools: netConfig.pools,
        explorer_url: `${netConfig.explorer}/address/${account.address}`
      }));
      return;
    } catch (err) {
      console.log(JSON.stringify({
        success: true,
        address: account.address,
        network: netConfig.name,
        chain_id: netConfig.chainId,
        warning: `Could not reach RPC: ${err.message}`
      }));
      return;
    }
  }

  if (action === 'deposit') {
    const commitment = process.argv[3] || process.env.ARCNANO_COMMITMENT;
    const denominationNum = parseInt(process.argv[4] || process.env.ARCNANO_DENOMINATION || '10000', 10);
    const denomination = BigInt(denominationNum);

    const poolContract = process.env.ARCNANO_POOL ||
      process.argv[6] ||
      netConfig.pools[denominationNum] ||
      netConfig.defaultPool;

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
        args: [account.address, poolContract]
      }).catch(() => 0n);

      if (allowance < denomination) {
        // Approve a generous amount (1,000 USDC) so future micro-deposits don't require re-approvals
        const approveHash = await walletClient.writeContract({
          address: USDC_CONTRACT,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [poolContract, 1000000000n]
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }

      // 2. Execute pool.deposit(commitment)
      const depositHash = await walletClient.writeContract({
        address: poolContract,
        abi: POOL_ABI,
        functionName: 'deposit',
        args: [commitment]
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: depositHash });

      console.log(JSON.stringify({
        success: true,
        tx_hash: depositHash,
        explorer_url: `${netConfig.explorer}/tx/${depositHash}`,
        block_number: Number(receipt.blockNumber),
        depositor_address: account.address,
        pool_contract: poolContract,
        chain_id: netConfig.chainId,
        network: netConfig.name,
        commitment
      }));
    } catch (err) {
      console.log(JSON.stringify({
        success: false,
        depositor_address: account.address,
        pool_contract: poolContract,
        chain_id: netConfig.chainId,
        network: netConfig.name,
        error: err.shortMessage || err.message || String(err)
      }));
    }
  }
}

main().catch(err => {
  console.log(JSON.stringify({ success: false, error: err.message }));
});
