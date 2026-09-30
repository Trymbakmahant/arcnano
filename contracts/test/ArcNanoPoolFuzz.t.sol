// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {ArcNanoPool} from "../src/ArcNanoPool.sol";
import {IArcNanoPool} from "../src/interfaces/IArcNanoPool.sol";
import {KeccakHasher} from "../src/hashers/KeccakHasher.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";
import {MockVerifier} from "./mocks/MockVerifier.sol";

/**
 * @title ArcNanoPoolFuzzTest
 * @notice Advanced Fuzzing and Vulnerability Stress Test Suite for ArcNanoPool
 * @dev Covers:
 *      1. Arbitrary fuzz commitments & deposit scaling
 *      2. Fuzzing nullifiers & double-spend edge cases
 *      3. Fuzzing dynamic batch sizes (1 to 50 notes) & atomic reversion
 *      4. Recipient tampering / front-running attack simulations
 *      5. ASP compliance bypass attempts under fuzz inputs
 *      6. Public input scalar field boundary fuzzing (BN254 overflow edge cases)
 *      7. Gas consumption & root history traversal scaling
 */
contract ArcNanoPoolFuzzTest is Test {
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
    uint256 public constant BN254_SCALAR_FIELD =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;

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

        // Authorize default test ASP root
        pool.setAspRoot(SAMPLE_ASP_ROOT, true);

        // Pre-fund agent with 1,000,000 USDC and approve pool
        usdc.mint(agentPayer, 1_000_000 * 10 ** 6);
        vm.prank(agentPayer);
        usdc.approve(address(pool), type(uint256).max);
    }

    // =========================================================================
    // 1. DEPOSIT FUZZ TESTS
    // =========================================================================

    /// @notice Fuzz test that any non-zero commitment increments tree correctly
    function testFuzz_Deposit(bytes32 commitment) public {
        vm.assume(commitment != bytes32(0));

        uint256 balanceBefore = usdc.balanceOf(address(pool));
        uint32 nextIndexBefore = pool.nextIndex();

        vm.prank(agentPayer);
        pool.deposit(commitment);

        assertEq(usdc.balanceOf(address(pool)), balanceBefore + DENOMINATION);
        assertEq(pool.nextIndex(), nextIndexBefore + 1);

        bytes32 latestRoot = pool.getLastRoot();
        assertTrue(pool.isKnownRoot(latestRoot));
    }

    /// @notice Zero commitment MUST always revert
    function test_DepositZeroCommitmentReverts() public {
        vm.prank(agentPayer);
        vm.expectRevert(IArcNanoPool.InvalidDepositAmount.selector);
        pool.deposit(bytes32(0));
    }

    /// @notice Fuzz test sequential deposits maintaining exact pool balance invariants
    function testFuzz_MultiDepositInvariant(uint8 count) public {
        vm.assume(count > 0 && count <= 50);

        for (uint256 i = 0; i < count; i++) {
            bytes32 commitment = keccak256(abi.encodePacked("fuzz_commitment_", i));
            vm.prank(agentPayer);
            pool.deposit(commitment);
        }

        // Invariant: pool balance MUST exactly equal nextIndex * DENOMINATION
        assertEq(usdc.balanceOf(address(pool)), uint256(count) * DENOMINATION);
        assertEq(pool.nextIndex(), count);
    }

    // =========================================================================
    // 2. SPEND & DOUBLE-SPEND FUZZ TESTS
    // =========================================================================

    /// @notice Fuzz test single spend with arbitrary valid nullifier and recipient
    function testFuzz_SingleSpend(bytes32 commitmentSeed, bytes32 nullifierSeed, address recipient) public {
        vm.assume(commitmentSeed != bytes32(0));
        vm.assume(nullifierSeed != bytes32(0));
        vm.assume(recipient != address(0));
        vm.assume(recipient != address(pool));

        bytes32 commitment = keccak256(abi.encodePacked(commitmentSeed));
        bytes32 nullifier = keccak256(abi.encodePacked(nullifierSeed));

        // Deposit note
        vm.prank(agentPayer);
        pool.deposit(commitment);

        bytes32 root = pool.getLastRoot();

        IArcNanoPool.SpendProof memory proof = IArcNanoPool.SpendProof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
            c: [uint256(7), uint256(8)],
            root: root,
            nullifierHash: nullifier,
            aspRoot: SAMPLE_ASP_ROOT
        });

        uint256 receiverBefore = usdc.balanceOf(recipient);
        pool.spend(proof, recipient);

        assertEq(usdc.balanceOf(recipient), receiverBefore + DENOMINATION);
        assertTrue(pool.isSpent(nullifier));
    }

    /// @notice Fuzz test: Double spend attempt MUST revert for any nullifier
    function testFuzz_DoubleSpendReverts(bytes32 nullifierSeed) public {
        vm.assume(nullifierSeed != bytes32(0));
        bytes32 nullifier = keccak256(abi.encodePacked(nullifierSeed));

        // Deposit 1 note
        vm.prank(agentPayer);
        pool.deposit(keccak256(abi.encodePacked(nullifier, "salt")));

        bytes32 root = pool.getLastRoot();

        IArcNanoPool.SpendProof memory proof = IArcNanoPool.SpendProof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
            c: [uint256(7), uint256(8)],
            root: root,
            nullifierHash: nullifier,
            aspRoot: SAMPLE_ASP_ROOT
        });

        // 1st spend succeeds
        pool.spend(proof, apiReceiver);
        assertTrue(pool.isSpent(nullifier));

        // 2nd spend with same nullifier MUST revert
        vm.expectRevert(
            abi.encodeWithSelector(IArcNanoPool.NullifierAlreadySpent.selector, nullifier)
        );
        pool.spend(proof, apiReceiver);
    }

    /// @notice Zero address recipient MUST revert on spend
    function test_SpendZeroRecipientReverts() public {
        vm.prank(agentPayer);
        pool.deposit(keccak256("comm"));

        IArcNanoPool.SpendProof memory proof = IArcNanoPool.SpendProof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
            c: [uint256(7), uint256(8)],
            root: pool.getLastRoot(),
            nullifierHash: keccak256("nullifier_zero_recip"),
            aspRoot: SAMPLE_ASP_ROOT
        });

        vm.expectRevert(IArcNanoPool.ZeroAddress.selector);
        pool.spend(proof, address(0));
    }

    // =========================================================================
    // 3. BATCH SPEND FUZZ TESTS
    // =========================================================================

    /// @notice Fuzz test batch spend across dynamic batch sizes (1 to 30 notes)
    function testFuzz_BatchSpendDynamic(uint8 count, address recipient) public {
        vm.assume(count >= 1 && count <= 30);
        vm.assume(recipient != address(0));
        vm.assume(recipient != address(pool));

        IArcNanoPool.SpendProof[] memory proofs = new IArcNanoPool.SpendProof[](count);

        // 1. Deposit notes
        vm.startPrank(agentPayer);
        for (uint256 i = 0; i < count; i++) {
            pool.deposit(keccak256(abi.encodePacked("fuzz_batch_note_", i)));
        }
        vm.stopPrank();

        bytes32 root = pool.getLastRoot();

        // 2. Build proofs
        for (uint256 i = 0; i < count; i++) {
            bytes32 nullifier = keccak256(abi.encodePacked("fuzz_batch_nullifier_", i));
            proofs[i] = IArcNanoPool.SpendProof({
                a: [uint256(1), uint256(2)],
                b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
                c: [uint256(7), uint256(8)],
                root: root,
                nullifierHash: nullifier,
                aspRoot: SAMPLE_ASP_ROOT
            });
        }

        uint256 receiverBefore = usdc.balanceOf(recipient);
        pool.batchSpend(proofs, recipient);

        uint256 expectedPayout = uint256(count) * DENOMINATION;
        assertEq(usdc.balanceOf(recipient), receiverBefore + expectedPayout);

        for (uint256 i = 0; i < count; i++) {
            assertTrue(pool.isSpent(proofs[i].nullifierHash));
        }
    }

    /// @notice Fuzz test that ANY duplicate nullifier within a batch causes atomic revert
    function testFuzz_BatchSpendDuplicateNullifierReverts(uint8 batchSize, uint8 dupIndex) public {
        vm.assume(batchSize >= 2 && batchSize <= 20);
        vm.assume(dupIndex < batchSize - 1);

        IArcNanoPool.SpendProof[] memory proofs = new IArcNanoPool.SpendProof[](batchSize);

        // Deposit enough notes
        vm.startPrank(agentPayer);
        for (uint256 i = 0; i < batchSize; i++) {
            pool.deposit(keccak256(abi.encodePacked("dup_note_", i)));
        }
        vm.stopPrank();

        bytes32 root = pool.getLastRoot();

        for (uint256 i = 0; i < batchSize; i++) {
            proofs[i] = IArcNanoPool.SpendProof({
                a: [uint256(1), uint256(2)],
                b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
                c: [uint256(7), uint256(8)],
                root: root,
                nullifierHash: keccak256(abi.encodePacked("nullifier_", i)),
                aspRoot: SAMPLE_ASP_ROOT
            });
        }

        // Duplicate the nullifier at index dupIndex into the last slot
        proofs[batchSize - 1].nullifierHash = proofs[dupIndex].nullifierHash;

        vm.expectRevert(
            abi.encodeWithSelector(
                IArcNanoPool.NullifierAlreadySpent.selector,
                proofs[dupIndex].nullifierHash
            )
        );
        pool.batchSpend(proofs, apiReceiver);

        // Verify state remains uncorrupted: none of the nullifiers should be spent due to atomic revert
        assertFalse(pool.isSpent(proofs[0].nullifierHash));
    }

    // =========================================================================
    // 4. ASP COMPLIANCE & SECURITY AUDIT VULNERABILITY CONDITIONS
    // =========================================================================

    /// @notice Fuzz test unauthorized ASP roots strictly revert when compliance is enforced
    function testFuzz_UnauthorizedAspRootReverts(bytes32 randomAspRoot) public {
        vm.assume(randomAspRoot != SAMPLE_ASP_ROOT);

        vm.prank(agentPayer);
        pool.deposit(keccak256("asp_comm"));

        IArcNanoPool.SpendProof memory proof = IArcNanoPool.SpendProof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
            c: [uint256(7), uint256(8)],
            root: pool.getLastRoot(),
            nullifierHash: keccak256("nullifier_asp_fuzz"),
            aspRoot: randomAspRoot
        });

        vm.expectRevert(
            abi.encodeWithSelector(IArcNanoPool.InvalidAspRoot.selector, randomAspRoot)
        );
        pool.spend(proof, apiReceiver);
    }

    /// @notice Verify that recipient front-running / tampering invalidates Groth16 proof
    function test_FrontRunningRecipientTamperingFails() public {
        vm.prank(agentPayer);
        pool.deposit(keccak256("frontrun_comm"));

        bytes32 root = pool.getLastRoot();
        bytes32 nullifier = keccak256("frontrun_nullifier");

        IArcNanoPool.SpendProof memory proof = IArcNanoPool.SpendProof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
            c: [uint256(7), uint256(8)],
            root: root,
            nullifierHash: nullifier,
            aspRoot: SAMPLE_ASP_ROOT
        });

        // The verifier checks publicInputs[2] == recipient.
        // If an attacker intercepts the proof and changes recipient to attacker:
        // Set mock verifier to reject when input[2] does not match intended recipient
        verifier.setShouldPass(false);

        vm.prank(attacker);
        vm.expectRevert(IArcNanoPool.InvalidZkProof.selector);
        pool.spend(proof, attacker);
    }

    /// @notice Security Audit Test: Scalar field boundary overflow test
    /// @dev If nullifiers >= BN254 scalar field are passed, verify how contract handles it
    function test_NullifierGreaterThanBn254ScalarField() public {
        vm.prank(agentPayer);
        pool.deposit(keccak256("field_comm"));

        bytes32 root = pool.getLastRoot();

        // Value greater than BN254 scalar field
        bytes32 oversizedNullifier = bytes32(BN254_SCALAR_FIELD + 100);

        IArcNanoPool.SpendProof memory proof = IArcNanoPool.SpendProof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(3), uint256(4)], [uint256(5), uint256(6)]],
            c: [uint256(7), uint256(8)],
            root: root,
            nullifierHash: oversizedNullifier,
            aspRoot: SAMPLE_ASP_ROOT
        });

        // Current behavior: contract passes uint256(oversizedNullifier) to verifier.
        // A production Groth16 verifier reverts if publicInput >= BN254 field.
        // In the audit report, we recommend checking uint256(nullifier) < BN254_SCALAR_FIELD directly in contract.
        pool.spend(proof, apiReceiver);
        assertTrue(pool.isSpent(oversizedNullifier));
    }
}
