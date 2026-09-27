// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IArcNanoPool} from "./interfaces/IArcNanoPool.sol";
import {IVerifier} from "./interfaces/IVerifier.sol";
import {IHasher} from "./interfaces/IHasher.sol";
import {IncrementalMerkleTree} from "./trees/IncrementalMerkleTree.sol";

/**
 * @title ArcNanoPool
 * @notice Shielded M2M Nanopayment Pool for Autonomous AI Agents on Arc
 * @dev Combines Poseidon Merkle tree deposit commitments, Groth16 ZK spend proofs,
 *      receiver-batched settlement with Circle Gas Station sponsorship, and Privacy Pools ASP compliance.
 */
contract ArcNanoPool is IArcNanoPool, IncrementalMerkleTree, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    /// @notice The underlying settlement token (e.g. USDC on Arc)
    IERC20 public immutable token;

    /// @notice The Groth16 zero-knowledge proof verifier contract
    IVerifier public immutable verifier;

    /// @notice Fixed denomination value for every note in this pool (e.g. 0.01 USDC)
    uint256 public immutable override denomination;

    /// @notice Nullifier registry tracking spent note commitments to prevent double spending
    mapping(bytes32 => bool) public override isSpent;

    /// @notice Association Set Provider (ASP) registry tracking sanctioned/compliant tree roots
    mapping(bytes32 => bool) public override isAspRootValid;

    /// @notice Whether ASP non-membership compliance proof verification is strictly enforced
    bool public complianceEnforced;

    constructor(
        IERC20 _token,
        IVerifier _verifier,
        IHasher _hasher,
        uint256 _denomination,
        address _initialOwner
    ) IncrementalMerkleTree(_hasher) Ownable(_initialOwner) {
        if (address(_token) == address(0) || address(_verifier) == address(0)) {
            revert ZeroAddress();
        }
        if (_denomination == 0) {
            revert InvalidDepositAmount();
        }

        token = _token;
        verifier = _verifier;
        denomination = _denomination;
        complianceEnforced = true;
    }

    /**
     * @notice Deposit funds into the shielded pool and create a new commitment note
     * @param commitment The cryptographic commitment Poseidon(denomination, secret, nullifier_seed)
     */
    function deposit(bytes32 commitment) external override nonReentrant {
        if (commitment == bytes32(0)) revert InvalidDepositAmount();

        // 1. Transfer fixed denomination note value into the pool
        token.safeTransferFrom(msg.sender, address(this), denomination);

        // 2. Insert commitment leaf into the on-chain Merkle tree
        uint32 leafIndex = _insert(commitment);

        emit Deposit(commitment, leafIndex, block.timestamp);
    }

    /**
     * @notice Spend a single shielded note and deliver funds to recipient
     * @param proof The Groth16 spend proof and public inputs
     * @param recipient The address receiving the note value
     */
    function spend(SpendProof calldata proof, address recipient) external override nonReentrant {
        if (recipient == address(0)) revert ZeroAddress();

        _validateAndRecordSpend(proof, recipient);

        token.safeTransfer(recipient, denomination);

        emit Spend(proof.nullifierHash, recipient, denomination);
    }

    /**
     * @notice Batch multiple verified spend proofs into a single on-chain transaction
     * @dev Called by the API receiver / paymaster relayer to claim aggregated payments
     *      with zero msg.sender linkage to individual spending agents.
     * @param proofs Array of verified Groth16 spend proofs bundled from X402 headers
     * @param recipient The destination address receiving the accumulated payout
     */
    function batchSpend(
        SpendProof[] calldata proofs,
        address recipient
    ) external override nonReentrant {
        uint256 count = proofs.length;
        if (count == 0) revert EmptyBatch();
        if (recipient == address(0)) revert ZeroAddress();

        for (uint256 i = 0; i < count; i++) {
            _validateAndRecordSpend(proofs[i], recipient);
            emit Spend(proofs[i].nullifierHash, recipient, denomination);
        }

        uint256 totalAmount = denomination * count;
        token.safeTransfer(recipient, totalAmount);

        emit BatchSpend(msg.sender, recipient, count, totalAmount);
    }

    /**
     * @dev Internal validation logic: verifies Merkle root, ASP root, nullifier novelty, and Groth16 proof
     */
    function _validateAndRecordSpend(
        SpendProof calldata proof,
        address recipient
    ) internal {
        // 1. Verify that the deposit root exists in historical ring buffer
        if (!isKnownRoot(proof.root)) {
            revert InvalidMerkleRoot(proof.root);
        }

        // 2. If compliance is enforced, verify that ASP root is recognized
        if (complianceEnforced && !isAspRootValid[proof.aspRoot]) {
            revert InvalidAspRoot(proof.aspRoot);
        }

        // 3. Prevent double-spending: check nullifier
        bytes32 nullifier = proof.nullifierHash;
        if (isSpent[nullifier]) {
            revert NullifierAlreadySpent(nullifier);
        }
        isSpent[nullifier] = true;

        // 4. Construct public inputs scalar array matching Circom circuit:
        //    input[0]: Merkle root
        //    input[1]: Nullifier hash
        //    input[2]: Recipient address
        //    input[3]: ASP root
        uint256[4] memory publicInputs;
        publicInputs[0] = uint256(proof.root);
        publicInputs[1] = uint256(nullifier);
        publicInputs[2] = uint256(uint160(recipient));
        publicInputs[3] = uint256(proof.aspRoot);

        // 5. Execute pairing check via Groth16 verifier contract
        bool isValid = verifier.verifyProof(proof.a, proof.b, proof.c, publicInputs);
        if (!isValid) {
            revert InvalidZkProof();
        }
    }

    // --- Admin / Compliance Governance Functions ---

    /**
     * @notice Register or update active Association Set Provider (ASP) root
     * @param aspRoot The Merkle root of the compliant/sanction-free association set
     * @param active Whether the root is authorized for spend compliance verification
     */
    function setAspRoot(bytes32 aspRoot, bool active) external onlyOwner {
        isAspRootValid[aspRoot] = active;
        emit AspRootUpdated(aspRoot, active);
    }

    /**
     * @notice Toggle whether ASP compliance proofs are strictly required
     */
    function setComplianceEnforced(bool enforced) external onlyOwner {
        complianceEnforced = enforced;
    }

    // --- IncrementalMerkleTree Overrides ---

    function isKnownRoot(
        bytes32 root
    ) public view override(IArcNanoPool, IncrementalMerkleTree) returns (bool) {
        return super.isKnownRoot(root);
    }

    function getLastRoot()
        public
        view
        override(IArcNanoPool, IncrementalMerkleTree)
        returns (bytes32)
    {
        return super.getLastRoot();
    }
}
