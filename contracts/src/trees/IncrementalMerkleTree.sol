// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IHasher} from "../interfaces/IHasher.sol";

/**
 * @title IncrementalMerkleTree
 * @notice 20-level incremental Merkle tree supporting up to 1,048,576 note commitments
 * @dev Maintains a ring buffer of historical roots to allow proofs verified against recent roots
 */
abstract contract IncrementalMerkleTree {
    uint32 public constant LEVELS = 20;
    uint32 public constant MAX_LEAVES = 1048576; // 2**20
    uint32 public constant ROOT_HISTORY_SIZE = 100;

    IHasher public immutable hasher;

    bytes32[LEVELS] public filledSubtrees;
    bytes32[LEVELS] public zeros;
    bytes32[ROOT_HISTORY_SIZE] public roots;
    uint32 public currentRootIndex;
    uint32 public nextIndex;

    error MerkleTreeFull();

    constructor(IHasher _hasher) {
        hasher = _hasher;

        // Initialize zero values for 20 levels
        // Level 0 zero is Poseidon("ArcNanoZero") or keccak256("ArcNanoZero")
        bytes32 currentZero = bytes32(uint256(keccak256("ArcNano.ZeroLeaf.v1")) % 21888242871839275222246405745257275088548364400416034343698204186575808495617);
        zeros[0] = currentZero;
        filledSubtrees[0] = currentZero;

        for (uint8 i = 1; i < LEVELS; i++) {
            currentZero = _hash(currentZero, currentZero);
            zeros[i] = currentZero;
            filledSubtrees[i] = currentZero;
        }

        // Set initial empty tree root
        bytes32 initialRoot = _hash(currentZero, currentZero);
        roots[0] = initialRoot;
    }

    function _hash(bytes32 left, bytes32 right) internal view returns (bytes32) {
        return hasher.hash2(left, right);
    }

    /**
     * @notice Inserts a new note commitment leaf into the tree
     * @param leaf The cryptographic commitment to insert
     * @return index The index position of the inserted leaf
     */
    function _insert(bytes32 leaf) internal returns (uint32 index) {
        uint32 _nextIndex = nextIndex;
        if (_nextIndex >= MAX_LEAVES) revert MerkleTreeFull();

        bytes32 current = leaf;
        uint32 currentIndex = _nextIndex;

        for (uint8 i = 0; i < LEVELS; i++) {
            if (currentIndex % 2 == 0) {
                filledSubtrees[i] = current;
                current = _hash(current, zeros[i]);
            } else {
                current = _hash(filledSubtrees[i], current);
            }
            currentIndex /= 2;
        }

        uint32 newRootIndex = (currentRootIndex + 1) % ROOT_HISTORY_SIZE;
        currentRootIndex = newRootIndex;
        roots[newRootIndex] = current;
        nextIndex = _nextIndex + 1;

        return _nextIndex;
    }

    /**
     * @notice Checks if a Merkle root has been recorded in the historical root ring buffer
     * @param root The root to verify
     * @return True if the root is known and valid
     */
    function isKnownRoot(bytes32 root) public view virtual returns (bool) {
        if (root == bytes32(0)) return false;

        uint32 _currentRootIndex = currentRootIndex;
        uint32 i = _currentRootIndex;
        do {
            if (roots[i] == root) return true;
            if (i == 0) {
                i = ROOT_HISTORY_SIZE;
            }
            i--;
        } while (i != _currentRootIndex);

        return false;
    }

    /**
     * @notice Returns the latest recorded Merkle tree root
     */
    function getLastRoot() public view virtual returns (bytes32) {
        return roots[currentRootIndex];
    }
}
