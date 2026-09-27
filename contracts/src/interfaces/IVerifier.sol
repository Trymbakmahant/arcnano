// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IVerifier
 * @notice Groth16 zero-knowledge proof verifier interface for ArcNano
 * @dev Public inputs correspond to:
 *      input[0]: Merkle root (deposit tree)
 *      input[1]: Nullifier hash (unique spend ticket)
 *      input[2]: Recipient address (converted to uint256 scalar)
 *      input[3]: ASP root (Association Set Provider compliance root)
 */
interface IVerifier {
    function verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[4] calldata input
    ) external view returns (bool);
}
