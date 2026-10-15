// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {ArcNanoPool} from "../src/ArcNanoPool.sol";
import {ArcNanoBatchDeposit} from "../src/ArcNanoBatchDeposit.sol";
import {KeccakHasher} from "../src/hashers/KeccakHasher.sol";
import {MockVerifier} from "./mocks/MockVerifier.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract ArcNanoBatchDepositTest is Test {
    ArcNanoPool public pool;
    ArcNanoBatchDeposit public batchHelper;
    MockUSDC public token;
    MockVerifier public verifier;
    KeccakHasher public hasher;

    address public owner = address(0xABCD);
    address public alice = address(0x1111);
    uint256 public constant DENOMINATION = 10_000; // 0.01 USDC

    function setUp() public {
        vm.startPrank(owner);
        token = new MockUSDC();
        verifier = new MockVerifier();
        hasher = new KeccakHasher();
        pool = new ArcNanoPool(token, verifier, hasher, DENOMINATION, owner);
        batchHelper = new ArcNanoBatchDeposit(pool, token);
        vm.stopPrank();

        // Fund Alice with 100 USDC
        token.mint(alice, 100 * 1e6);
    }

    function test_BatchDeposit_Success() public {
        uint256 noteCount = 50;
        bytes32[] memory commitments = new bytes32[](noteCount);
        for (uint256 i = 0; i < noteCount; i++) {
            commitments[i] = keccak256(abi.encodePacked("note", i, block.timestamp));
        }

        uint256 totalCost = DENOMINATION * noteCount;

        vm.startPrank(alice);
        token.approve(address(batchHelper), totalCost);
        batchHelper.batchDeposit(commitments);
        vm.stopPrank();

        // Verify pool balance increased by totalCost
        assertEq(token.balanceOf(address(pool)), totalCost);

        // Verify all 50 leaves are inserted
        assertEq(pool.nextIndex(), uint32(noteCount));
    }

    function test_BatchDeposit_HundredNotes() public {
        uint256 noteCount = 100; // 1.00 USDC
        bytes32[] memory commitments = new bytes32[](noteCount);
        for (uint256 i = 0; i < noteCount; i++) {
            commitments[i] = keccak256(abi.encodePacked("batch_100_note", i));
        }

        uint256 totalCost = DENOMINATION * noteCount;

        vm.startPrank(alice);
        token.approve(address(batchHelper), totalCost);
        batchHelper.batchDeposit(commitments);
        vm.stopPrank();

        assertEq(token.balanceOf(address(pool)), totalCost);
        assertEq(pool.nextIndex(), uint32(noteCount));
    }
}
