// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IHasher} from "../interfaces/IHasher.sol";

/**
 * @title KeccakHasher
 * @notice 2-to-1 cryptographic hasher using keccak256 mod BN254 scalar field
 * @dev Used for gas-efficient on-chain testing and EVM benchmarking
 */
contract KeccakHasher is IHasher {
    uint256 public constant FIELD_SIZE = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

    function hash2(bytes32 left, bytes32 right) external pure override returns (bytes32) {
        return bytes32(uint256(keccak256(abi.encodePacked(left, right))) % FIELD_SIZE);
    }
}
