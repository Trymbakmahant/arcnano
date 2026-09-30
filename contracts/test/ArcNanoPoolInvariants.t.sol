// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {ArcNanoPool} from "../src/ArcNanoPool.sol";
import {IArcNanoPool} from "../src/interfaces/IArcNanoPool.sol";
import {KeccakHasher} from "../src/hashers/KeccakHasher.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";
import {MockVerifier} from "./mocks/MockVerifier.sol";

/**
 * @title ArcNanoPoolHandler
 * @notice Actor handler for Foundry stateful invariant testing
 */
contract ArcNanoPoolHandler is Test {
    ArcNanoPool public pool;
    MockUSDC public usdc;

    uint256 public totalDeposits;
    uint256 public totalSpends;

    bytes32[] public activeNullifiers;
    bytes32 public constant ASP_ROOT = bytes32(uint256(0x999));

    constructor(ArcNanoPool _pool, MockUSDC _usdc) {
        pool = _pool;
        usdc = _usdc;
    }

    function deposit(uint256 seed) external {
        bytes32 commitment = keccak256(abi.encodePacked("inv_commit_", seed, totalDeposits));
        usdc.mint(address(this), pool.denomination());
        usdc.approve(address(pool), pool.denomination());

        pool.deposit(commitment);
        totalDeposits++;
    }

    function spend(uint256 nullifierSeed, address recipient) external {
        if (recipient == address(0) || recipient == address(pool)) return;
        if (totalDeposits <= totalSpends) return;

        bytes32 nullifier = keccak256(abi.encodePacked("inv_null_", nullifierSeed, totalSpends));
        if (pool.isSpent(nullifier)) return;

        bytes32 root = pool.getLastRoot();

        IArcNanoPool.SpendProof memory proof = IArcNanoPool.SpendProof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
            c: [uint256(7), uint256(8)],
            root: root,
            nullifierHash: nullifier,
            aspRoot: ASP_ROOT
        });

        pool.spend(proof, recipient);
        totalSpends++;
        activeNullifiers.push(nullifier);
    }
}

/**
 * @title ArcNanoPoolInvariantTest
 * @notice Stateful invariant test suite verifying solvency and integrity
 */
contract ArcNanoPoolInvariantTest is Test {
    ArcNanoPool public pool;
    MockUSDC public usdc;
    MockVerifier public verifier;
    KeccakHasher public hasher;
    ArcNanoPoolHandler public handler;

    uint256 public constant DENOMINATION = 10_000;
    bytes32 public constant ASP_ROOT = bytes32(uint256(0x999));

    function setUp() public {
        usdc = new MockUSDC();
        verifier = new MockVerifier();
        hasher = new KeccakHasher();

        pool = new ArcNanoPool(
            usdc,
            verifier,
            hasher,
            DENOMINATION,
            address(this)
        );

        pool.setAspRoot(ASP_ROOT, true);

        handler = new ArcNanoPoolHandler(pool, usdc);
        targetContract(address(handler));
    }

    /// @notice Invariant 1: Pool token balance MUST always equal (deposits - spends) * denomination
    function invariant_PoolSolvency() public view {
        uint256 expectedBalance = (handler.totalDeposits() - handler.totalSpends()) * DENOMINATION;
        assertEq(usdc.balanceOf(address(pool)), expectedBalance);
    }

    /// @notice Invariant 2: Leaf counter must equal total deposits
    function invariant_NextIndexEqualsTotalDeposits() public view {
        assertEq(pool.nextIndex(), handler.totalDeposits());
    }

    /// @notice Invariant 3: Denomination is permanently constant
    function invariant_DenominationConstant() public view {
        assertEq(pool.denomination(), DENOMINATION);
    }
}
