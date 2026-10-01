pragma circom 2.1.6;

include "./merkle.circom";

/**
 * @title ASPVerifier
 * @notice Verifies that a note commitment belongs to an authorized Association Set Provider (ASP) root
 * @dev Enforces Privacy Pools compliance without deanonymizing the agent
 */
template ASPVerifier(levels) {
    signal input leaf;
    signal input aspPathElements[levels];
    signal input aspPathIndices[levels];
    signal output aspRoot;

    component treeVerifier = MerkleProof(levels);
    treeVerifier.leaf <== leaf;
    for (var i = 0; i < levels; i++) {
        treeVerifier.pathElements[i] <== aspPathElements[i];
        treeVerifier.pathIndices[i] <== aspPathIndices[i];
    }
    aspRoot <== treeVerifier.root;
}
