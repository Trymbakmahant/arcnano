// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IVerifier} from "../../src/interfaces/IVerifier.sol";

/**
 * @title MockVerifier
 * @notice Mock Groth16 verifier for testing ArcNano spend proofs and public inputs
 */
contract MockVerifier is IVerifier {
    bool public shouldPass = true;
    uint256[4] public lastInput;

    function setShouldPass(bool _pass) external {
        shouldPass = _pass;
    }

    function verifyProof(
        uint256[2] calldata,
        uint256[2][2] calldata,
        uint256[2] calldata,
        uint256[4] calldata
    ) external view override returns (bool) {
        return shouldPass;
    }
}
