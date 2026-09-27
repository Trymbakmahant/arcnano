// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ArcNanoPool} from "../src/ArcNanoPool.sol";
import {KeccakHasher} from "../src/hashers/KeccakHasher.sol";
import {IVerifier} from "../src/interfaces/IVerifier.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeployArcNano
 * @notice Foundry script to deploy ArcNano smart contracts on the Arc Network
 * @dev Usage:
 *      forge script script/Deploy.s.sol:DeployArcNano --rpc-url <ARC_RPC> --broadcast --verify
 */
contract DeployArcNano is Script {
    // Default Arc Testnet USDC or configured via env
    address public usdcAddress = vm.envOr("USDC_ADDRESS", address(0));
    address public verifierAddress = vm.envOr("VERIFIER_ADDRESS", address(0));
    uint256 public denomination = vm.envOr("DENOMINATION", uint256(10_000)); // 0.01 USDC (6 decimals)

    function run() external {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        address deployer = deployerPrivateKey != 0 
            ? vm.addr(deployerPrivateKey) 
            : msg.sender;

        console.log("=== Deploying ArcNano Protocol on Arc ===");
        console.log("Deployer:", deployer);
        console.log("Denomination:", denomination);

        if (deployerPrivateKey != 0) {
            vm.startBroadcast(deployerPrivateKey);
        } else {
            vm.startBroadcast();
        }

        // 1. Deploy Merkle Tree 2-to-1 Hasher
        KeccakHasher hasher = new KeccakHasher();
        console.log("KeccakHasher deployed at:", address(hasher));

        // 2. Validate external token and verifier addresses
        require(usdcAddress != address(0), "USDC_ADDRESS must be set");
        require(verifierAddress != address(0), "VERIFIER_ADDRESS must be set");

        // 3. Deploy ArcNanoPool core shielded note pool
        ArcNanoPool pool = new ArcNanoPool(
            IERC20(usdcAddress),
            IVerifier(verifierAddress),
            hasher,
            denomination,
            deployer
        );
        console.log("ArcNanoPool deployed at:", address(pool));

        vm.stopBroadcast();
        console.log("=== Deployment Complete ===");
    }
}
