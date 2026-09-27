// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ArcNanoPool} from "../src/ArcNanoPool.sol";
import {IArcNanoPool} from "../src/interfaces/IArcNanoPool.sol";
import {KeccakHasher} from "../src/hashers/KeccakHasher.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";
import {MockVerifier} from "./mocks/MockVerifier.sol";

contract ArcNanoPoolTest is Test {
    ArcNanoPool public pool;
    MockUSDC public usdc;
    MockVerifier public verifier;
    KeccakHasher public hasher;

    address public owner = address(this);
    address public agentPayer = makeAddr("agentPayer");
    address public apiReceiver = makeAddr("apiReceiver");
    address public attacker = makeAddr("attacker");

    uint256 public constant DENOMINATION = 10_000; // 0.01 USDC (6 decimals)
    bytes32 public constant SAMPLE_ASP_ROOT = bytes32(uint256(0x123456789));

    function setUp() public {
        usdc = new MockUSDC();
        verifier = new MockVerifier();
        hasher = new KeccakHasher();

        pool = new ArcNanoPool(
            usdc,
            verifier,
            hasher,
            DENOMINATION,
            owner
        );

        // Register default authorized ASP compliance root
        pool.setAspRoot(SAMPLE_ASP_ROOT, true);

        // Fund agent with 100 USDC and approve pool
        usdc.mint(agentPayer, 100 * 10 ** 6);
        vm.prank(agentPayer);
        usdc.approve(address(pool), type(uint256).max);
    }

    function test_InitialState() public view {
        assertEq(address(pool.token()), address(usdc));
        assertEq(address(pool.verifier()), address(verifier));
        assertEq(pool.denomination(), DENOMINATION);
        assertTrue(pool.complianceEnforced());
        assertTrue(pool.isAspRootValid(SAMPLE_ASP_ROOT));
    }

    function test_Deposit() public {
        bytes32 commitment = keccak256("commitment_01");

        uint256 payerBalBefore = usdc.balanceOf(agentPayer);
        uint256 poolBalBefore = usdc.balanceOf(address(pool));

        vm.prank(agentPayer);
        pool.deposit(commitment);

        assertEq(usdc.balanceOf(agentPayer), payerBalBefore - DENOMINATION);
        assertEq(usdc.balanceOf(address(pool)), poolBalBefore + DENOMINATION);
        assertEq(pool.nextIndex(), 1);

        bytes32 currentRoot = pool.getLastRoot();
        assertTrue(pool.isKnownRoot(currentRoot));
    }

    function test_SingleSpend() public {
        // 1. Agent deposits note
        bytes32 commitment = keccak256("commitment_alice");
        vm.prank(agentPayer);
        pool.deposit(commitment);

        bytes32 root = pool.getLastRoot();
        bytes32 nullifier = keccak256("nullifier_alice_01");

        // 2. Prepare spend proof
        IArcNanoPool.SpendProof memory proof = IArcNanoPool.SpendProof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
            c: [uint256(7), uint256(8)],
            root: root,
            nullifierHash: nullifier,
            aspRoot: SAMPLE_ASP_ROOT
        });

        uint256 receiverBalBefore = usdc.balanceOf(apiReceiver);

        // 3. Receiver claims payout via X402 proof
        vm.prank(apiReceiver);
        pool.spend(proof, apiReceiver);

        assertEq(usdc.balanceOf(apiReceiver), receiverBalBefore + DENOMINATION);
        assertTrue(pool.isSpent(nullifier));
        assertEq(usdc.balanceOf(address(pool)), 0);
    }

    function test_BatchSpend() public {
        uint256 count = 5;
        IArcNanoPool.SpendProof[] memory proofs = new IArcNanoPool.SpendProof[](count);

        // 1. Agent deposits 5 notes
        vm.startPrank(agentPayer);
        for (uint256 i = 0; i < count; i++) {
            bytes32 commitment = keccak256(abi.encodePacked("note_", i));
            pool.deposit(commitment);
        }
        vm.stopPrank();

        bytes32 root = pool.getLastRoot();

        // 2. Prepare 5 spend proofs
        for (uint256 i = 0; i < count; i++) {
            bytes32 nullifier = keccak256(abi.encodePacked("nullifier_", i));
            proofs[i] = IArcNanoPool.SpendProof({
                a: [uint256(1), uint256(2)],
                b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
                c: [uint256(7), uint256(8)],
                root: root,
                nullifierHash: nullifier,
                aspRoot: SAMPLE_ASP_ROOT
            });
        }

        uint256 receiverBalBefore = usdc.balanceOf(apiReceiver);

        // 3. Relayer / Receiver broadcasts single batchSpend
        vm.prank(apiReceiver);
        pool.batchSpend(proofs, apiReceiver);

        uint256 totalPayout = DENOMINATION * count;
        assertEq(usdc.balanceOf(apiReceiver), receiverBalBefore + totalPayout);

        for (uint256 i = 0; i < count; i++) {
            assertTrue(pool.isSpent(proofs[i].nullifierHash));
        }
        assertEq(usdc.balanceOf(address(pool)), 0);
    }

    function test_DoubleSpendReverts() public {
        bytes32 commitment = keccak256("commitment_double");
        vm.prank(agentPayer);
        pool.deposit(commitment);

        bytes32 root = pool.getLastRoot();
        bytes32 nullifier = keccak256("nullifier_double");

        IArcNanoPool.SpendProof memory proof = IArcNanoPool.SpendProof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
            c: [uint256(7), uint256(8)],
            root: root,
            nullifierHash: nullifier,
            aspRoot: SAMPLE_ASP_ROOT
        });

        // First spend succeeds
        pool.spend(proof, apiReceiver);
        assertTrue(pool.isSpent(nullifier));

        // Second spend with same nullifier MUST revert
        vm.expectRevert(
            abi.encodeWithSelector(IArcNanoPool.NullifierAlreadySpent.selector, nullifier)
        );
        pool.spend(proof, apiReceiver);
    }

    function test_InvalidRootReverts() public {
        bytes32 fakeRoot = keccak256("non_existent_merkle_root");
        bytes32 nullifier = keccak256("nullifier_invalid_root");

        IArcNanoPool.SpendProof memory proof = IArcNanoPool.SpendProof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
            c: [uint256(7), uint256(8)],
            root: fakeRoot,
            nullifierHash: nullifier,
            aspRoot: SAMPLE_ASP_ROOT
        });

        vm.expectRevert(
            abi.encodeWithSelector(IArcNanoPool.InvalidMerkleRoot.selector, fakeRoot)
        );
        pool.spend(proof, apiReceiver);
    }

    function test_InvalidAspRootReverts() public {
        // Deposit valid note
        bytes32 commitment = keccak256("commitment_asp_check");
        vm.prank(agentPayer);
        pool.deposit(commitment);

        bytes32 root = pool.getLastRoot();
        bytes32 nullifier = keccak256("nullifier_sanctioned");
        bytes32 unauthorizedAspRoot = keccak256("unauthorized_asp_tree");

        IArcNanoPool.SpendProof memory proof = IArcNanoPool.SpendProof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
            c: [uint256(7), uint256(8)],
            root: root,
            nullifierHash: nullifier,
            aspRoot: unauthorizedAspRoot
        });

        vm.expectRevert(
            abi.encodeWithSelector(IArcNanoPool.InvalidAspRoot.selector, unauthorizedAspRoot)
        );
        pool.spend(proof, apiReceiver);
    }

    function test_InvalidZkProofReverts() public {
        bytes32 commitment = keccak256("commitment_zk_check");
        vm.prank(agentPayer);
        pool.deposit(commitment);

        bytes32 root = pool.getLastRoot();
        bytes32 nullifier = keccak256("nullifier_failed_zk");

        IArcNanoPool.SpendProof memory proof = IArcNanoPool.SpendProof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
            c: [uint256(7), uint256(8)],
            root: root,
            nullifierHash: nullifier,
            aspRoot: SAMPLE_ASP_ROOT
        });

        // Set verifier to reject proof
        verifier.setShouldPass(false);

        vm.expectRevert(IArcNanoPool.InvalidZkProof.selector);
        pool.spend(proof, apiReceiver);
    }

    function test_EmptyBatchReverts() public {
        IArcNanoPool.SpendProof[] memory emptyProofs = new IArcNanoPool.SpendProof[](0);

        vm.expectRevert(IArcNanoPool.EmptyBatch.selector);
        pool.batchSpend(emptyProofs, apiReceiver);
    }

    function test_AspRootAdminManagement() public {
        bytes32 newAspRoot = keccak256("new_compliance_root_v2");
        assertFalse(pool.isAspRootValid(newAspRoot));

        pool.setAspRoot(newAspRoot, true);
        assertTrue(pool.isAspRootValid(newAspRoot));

        pool.setAspRoot(newAspRoot, false);
        assertFalse(pool.isAspRootValid(newAspRoot));

        // Non-owner cannot update ASP root
        vm.prank(attacker);
        vm.expectRevert();
        pool.setAspRoot(newAspRoot, true);
    }
}
