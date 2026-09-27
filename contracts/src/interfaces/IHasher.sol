// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IHasher
 * @notice 2-to-1 cryptographic hash function interface for Merkle tree nodes
 */
interface IHasher {
    function hash2(bytes32 left, bytes32 right) external pure returns (bytes32);
}
