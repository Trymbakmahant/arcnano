pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/switcher.circom";

/**
 * @title MerkleProof
 * @notice Verifies binary Merkle inclusion proof of depth `levels` using Poseidon(2)
 */
template MerkleProof(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels]; // 0 for left child, 1 for right child
    signal output root;

    component switchers[levels];
    component hashers[levels];

    signal current[levels + 1];
    current[0] <== leaf;

    for (var i = 0; i < levels; i++) {
        // Enforce pathIndices bit is strictly 0 or 1
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        switchers[i] = Switcher();
        switchers[i].sel <== pathIndices[i];
        switchers[i].L <== current[i];
        switchers[i].R <== pathElements[i];

        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== switchers[i].outL;
        hashers[i].inputs[1] <== switchers[i].outR;

        current[i + 1] <== hashers[i].out;
    }

    root <== current[levels];
}
