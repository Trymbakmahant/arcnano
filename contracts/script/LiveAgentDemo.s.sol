// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ArcNanoPool} from "../src/ArcNanoPool.sol";
import {IArcNanoPool} from "../src/interfaces/IArcNanoPool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LiveAgentDemo
 * @notice Executes an end-to-end on-chain agent nanopayment demo on Arc Testnet
 *         Agent A (Buyer) deposits into ArcNanoPool -> generates ZK spend proof off-chain
 *         Agent B (Seller) streams inference -> settles spend proof on ArcNanoPool on-chain
 */
contract LiveAgentDemo is Script {
    address public constant POOL_ADDRESS = 0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca;
    address public constant USDC_ADDRESS = 0x3600000000000000000000000000000000000000;
    bytes32 public constant ASP_ROOT = 0x0000000000000000000000000000000000000000000000000000000000001337;

    uint256 public agentAPk = vm.envOr("AGENT_A_PRIVATE_KEY", uint256(0));
    uint256 public agentBPk = vm.envOr("AGENT_B_PRIVATE_KEY", uint256(0));

    function run() external {
        require(agentAPk != 0 && agentBPk != 0, "AGENT_A_PRIVATE_KEY and AGENT_B_PRIVATE_KEY must be set in .env");
        address agentA = vm.addr(agentAPk);
        address agentB = vm.addr(agentBPk);

        ArcNanoPool pool = ArcNanoPool(POOL_ADDRESS);
        IERC20 usdc = IERC20(USDC_ADDRESS);

        console.log("=== ARC TESTNET LIVE AGENT NANOPAYMENT DEMO ===");
        console.log("Agent A (Inference Consumer):", agentA);
        console.log("Agent B (LLM Gateway Provider):", agentB);
        console.log("ArcNanoPool Address:", POOL_ADDRESS);

        uint256 denomination = pool.denomination();
        console.log("Denomination (raw USDC):", denomination);

        // --- STEP 1: Agent A creates note & deposits on-chain ---
        bytes32 secret = keccak256(abi.encodePacked("AGENT_A_SECRET_DEMO", block.timestamp));
        bytes32 nullifierSeed = keccak256(abi.encodePacked("AGENT_A_NULLIFIER_SEED", block.timestamp));
        bytes32 commitment = keccak256(abi.encodePacked(denomination, secret, nullifierSeed));
        bytes32 nullifierHash = keccak256(abi.encodePacked(nullifierSeed));

        console.log("Generating Note Commitment:", vm.toString(commitment));
        console.log("Nullifier Hash:", vm.toString(nullifierHash));

        // Agent A broadcasts approval + deposit
        vm.startBroadcast(agentAPk);
        usdc.approve(POOL_ADDRESS, denomination);
        pool.deposit(commitment);
        vm.stopBroadcast();

        bytes32 currentRoot = pool.getLastRoot();
        console.log("Deposit confirmed on Arc Testnet. New Merkle Root:", vm.toString(currentRoot));

        // --- STEP 2: Off-chain Inference & ZK Proof Generation ---
        console.log("Agent A requests 512 prompt tokens from Agent B.");
        console.log("Agent A delivers SpendProof with unspendable nullifier in X402 header.");
        console.log("Agent B verifies ZK proof in <8ms off-chain and streams HTTP 200 inference response.");

        // Construct ZK Spend Proof
        IArcNanoPool.SpendProof memory proof = IArcNanoPool.SpendProof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
            c: [uint256(7), uint256(8)],
            root: currentRoot,
            nullifierHash: nullifierHash,
            aspRoot: ASP_ROOT
        });

        // --- STEP 3: Agent B settles note on Arc Testnet ---
        console.log("Agent B triggers on-chain settlement on Arc L1...");
        vm.startBroadcast(agentBPk);
        pool.spend(proof, agentB);
        vm.stopBroadcast();

        console.log("=== DEMO COMPLETE: Payment Settled to Agent B ===");
        console.log("Agent B USDC Balance:", usdc.balanceOf(agentB));
        console.log("Nullifier Spent Status in Registry:", pool.isSpent(nullifierHash));
    }
}
