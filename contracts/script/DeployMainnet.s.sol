// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ArcNanoPool} from "../src/ArcNanoPool.sol";
import {KeccakHasher} from "../src/hashers/KeccakHasher.sol";
import {IVerifier} from "../src/interfaces/IVerifier.sol";
import {Groth16Verifier} from "../src/verifiers/Groth16Verifier.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeployArcNanoMainnet
 * @notice Production Foundry script to deploy ArcNano smart contracts on Mainnet
 *         using the real BN254 Groth16 zk-SNARK verifier.
 * @dev Usage:
 *      forge script script/DeployMainnet.s.sol:DeployArcNanoMainnet --rpc-url <RPC> --broadcast
 */
contract DeployArcNanoMainnet is Script {
    // Default Arc USDC contract (System contract on Circle Arc L1)
    address public constant ARC_MAINNET_USDC = 0x3600000000000000000000000000000000000000;

    address public usdcAddress = vm.envOr("USDC_ADDRESS", ARC_MAINNET_USDC);
    address public verifierAddress = vm.envOr("VERIFIER_ADDRESS", address(0));
    uint256 public denomination = vm.envOr("DENOMINATION", uint256(10_000)); // 0.01 USDC (6 decimals)

    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        if (deployerPrivateKey != 0) {
            vm.startBroadcast(deployerPrivateKey);
        } else {
            vm.startBroadcast();
        }

        address deployer = msg.sender;

        console.log("=================================================");
        console.log("Deploying ArcNano Protocol to MAINNET");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer Address:", deployer);
        console.log("USDC Token:", usdcAddress);
        console.log("Note Denomination (micro-units):", denomination);
        console.log("=================================================");

        // 1. Deploy Merkle Tree 2-to-1 Hasher
        KeccakHasher hasher = new KeccakHasher();
        console.log("KeccakHasher deployed at:", address(hasher));

        // 2. Deploy Real Production Groth16 Verifier
        address finalVerifier = verifierAddress;
        if (finalVerifier == address(0)) {
            Groth16Verifier realVerifier = new Groth16Verifier();
            finalVerifier = address(realVerifier);
            console.log("Production Groth16Verifier deployed at:", finalVerifier);
        } else {
            console.log("Using existing Verifier at:", finalVerifier);
        }

        // 3. Deploy ArcNanoPool core shielded note pool
        ArcNanoPool pool = new ArcNanoPool(
            IERC20(usdcAddress),
            IVerifier(finalVerifier),
            hasher,
            denomination,
            deployer
        );
        console.log("ArcNanoPool deployed at:", address(pool));

        vm.stopBroadcast();

        console.log("=================================================");
        console.log("MAINNET DEPLOYMENT SUCCESSFUL!");
        console.log("Pool Contract:     ", address(pool));
        console.log("Verifier Contract: ", finalVerifier);
        console.log("Hasher Contract:   ", address(hasher));
        console.log("=================================================");
    }
}
