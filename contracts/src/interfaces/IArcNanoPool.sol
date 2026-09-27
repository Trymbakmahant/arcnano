// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IArcNanoPool
 * @notice Interface for ArcNano Shielded Nanopayment Note Pools
 */
interface IArcNanoPool {
    /// @notice ZK Groth16 spend proof structure bundled in X402 headers
    struct SpendProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        bytes32 root;
        bytes32 nullifierHash;
        bytes32 aspRoot;
    }

    // --- Events ---
    event Deposit(bytes32 indexed commitment, uint32 leafIndex, uint256 timestamp);
    event Spend(bytes32 indexed nullifierHash, address indexed recipient, uint256 amount);
    event BatchSpend(
        address indexed relayer,
        address indexed recipient,
        uint256 count,
        uint256 totalAmount
    );
    event AspRootUpdated(bytes32 indexed aspRoot, bool active);
    event RootRecorded(bytes32 indexed root, uint32 indexed rootIndex);

    // --- Custom Errors ---
    error InvalidDepositAmount();
    error NullifierAlreadySpent(bytes32 nullifierHash);
    error InvalidMerkleRoot(bytes32 root);
    error InvalidAspRoot(bytes32 aspRoot);
    error InvalidZkProof();
    error EmptyBatch();
    error ZeroAddress();

    function deposit(bytes32 commitment) external;

    function spend(SpendProof calldata proof, address recipient) external;

    function batchSpend(SpendProof[] calldata proofs, address recipient) external;

    function isSpent(bytes32 nullifierHash) external view returns (bool);

    function isKnownRoot(bytes32 root) external view returns (bool);

    function isAspRootValid(bytes32 aspRoot) external view returns (bool);

    function denomination() external view returns (uint256);

    function getLastRoot() external view returns (bytes32);
}
