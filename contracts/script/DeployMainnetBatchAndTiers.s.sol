// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ArcNanoPool} from "../src/ArcNanoPool.sol";
import {ArcNanoBatchDeposit} from "../src/ArcNanoBatchDeposit.sol";
import {IArcNanoPool} from "../src/interfaces/IArcNanoPool.sol";
import {IHasher} from "../src/interfaces/IHasher.sol";
import {IVerifier} from "../src/interfaces/IVerifier.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeployMainnetBatchAndTiers
 * @notice Deploys ArcNanoBatchDeposit (0.01 USDC), ArcNanoPool (1.00 USDC), and ArcNanoBatchDeposit (1.00 USDC) on Arc Mainnet
 */
contract DeployMainnetBatchAndTiers is Script {
    address public constant ARC_MAINNET_USDC = 0x3600000000000000000000000000000000000000;
    address public constant MAINNET_POOL_0_01 = 0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd;
    address public constant MAINNET_VERIFIER = 0x809199ab5AB49FbF69f13dc9F28BCD157494C607;
    address public constant MAINNET_HASHER = 0xa7507BBED66D2a26331cF4C1f5A16C9462241954;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Deploying Batcher & Multi-Tier Pool to Arc Mainnet ===");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy BatchDeposit for existing 0.01 USDC pool
        ArcNanoBatchDeposit batchDeposit0_01 = new ArcNanoBatchDeposit(
            IArcNanoPool(MAINNET_POOL_0_01),
            IERC20(ARC_MAINNET_USDC)
        );
        console.log("BatchDeposit 0.01 USDC deployed at:", address(batchDeposit0_01));

        // 2. Deploy 1.00 USDC Pool (denomination = 1,000,000)
        ArcNanoPool pool1Usdc = new ArcNanoPool(
            IERC20(ARC_MAINNET_USDC),
            IVerifier(MAINNET_VERIFIER),
            IHasher(MAINNET_HASHER),
            1_000_000, // 1.00 USDC
            deployer
        );
        console.log("ArcNanoPool 1.00 USDC deployed at:", address(pool1Usdc));

        // 3. Deploy BatchDeposit for 1.00 USDC pool
        ArcNanoBatchDeposit batchDeposit1Usdc = new ArcNanoBatchDeposit(
            IArcNanoPool(address(pool1Usdc)),
            IERC20(ARC_MAINNET_USDC)
        );
        console.log("BatchDeposit 1.00 USDC deployed at:", address(batchDeposit1Usdc));

        vm.stopBroadcast();
        console.log("=== Mainnet Deployment Complete ===");
    }
}
