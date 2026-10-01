pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "./merkle.circom";
include "./asp_check.circom";

/**
 * @title ArcNanoSpend
 * @notice Complete zero-knowledge spend circuit for ArcNano autonomous agent nanopayments
 * @dev Enforces:
 *      1. Commitment formation: Poseidon(denomination, secret, nullifierSeed)
 *      2. Deterministic nullifier: Poseidon(nullifierSeed, secret)
 *      3. 20-level Merkle deposit tree membership proof (depth 20 = 1,048,576 notes)
 *      4. ASP compliance tree membership proof
 *      5. Cryptographic binding of payout recipient address
 */
template ArcNanoSpend(levels) {
    // --- Public Inputs (must match ArcNanoPool.sol order) ---
    signal input root;                // input[0]: Deposit Merkle tree root
    signal input nullifierHash;       // input[1]: Unique spend nullifier
    signal input recipient;           // input[2]: EVM payout destination address
    signal input aspRoot;             // input[3]: ASP Compliance Merkle root

    // --- Private Witness Inputs ---
    signal input denomination;        // Note amount (e.g. 10000 = 0.01 USDC)
    signal input secret;              // Random spending secret
    signal input nullifierSeed;       // Random nullifier seed
    signal input pathElements[levels];// Deposit Merkle proof siblings
    signal input pathIndices[levels]; // Deposit Merkle proof path bits (0=left, 1=right)
    signal input aspPathElements[levels]; // ASP Merkle proof siblings
    signal input aspPathIndices[levels];  // ASP Merkle proof path bits

    // 1. Verify Note Commitment Formulation
    // Commitment = Poseidon(denomination, secret, nullifierSeed)
    component commitmentHasher = Poseidon(3);
    commitmentHasher.inputs[0] <== denomination;
    commitmentHasher.inputs[1] <== secret;
    commitmentHasher.inputs[2] <== nullifierSeed;
    signal commitment <== commitmentHasher.out;

    // 2. Verify Deterministic Nullifier Derivation
    // Nullifier = Poseidon(nullifierSeed, secret)
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== nullifierSeed;
    nullifierHasher.inputs[1] <== secret;
    nullifierHash === nullifierHasher.out;

    // 3. Verify Merkle Deposit Tree Membership Proof (20 levels)
    component treeVerifier = MerkleProof(levels);
    treeVerifier.leaf <== commitment;
    for (var i = 0; i < levels; i++) {
        treeVerifier.pathElements[i] <== pathElements[i];
        treeVerifier.pathIndices[i] <== pathIndices[i];
    }
    root === treeVerifier.root;

    // 4. Verify ASP Compliance Proof
    component aspVerifier = ASPVerifier(levels);
    aspVerifier.leaf <== commitment;
    for (var i = 0; i < levels; i++) {
        aspVerifier.aspPathElements[i] <== aspPathElements[i];
        aspVerifier.aspPathIndices[i] <== aspPathIndices[i];
    }
    aspRoot === aspVerifier.aspRoot;

    // 5. Quadratic constraint binding recipient to prevent front-running / proof hijacking
    signal recipientSquare;
    recipientSquare <== recipient * recipient;
}

// Instantiate main component with 20 Merkle levels ($2^{20} = 1,048,576$ commitments)
component main {public [root, nullifierHash, recipient, aspRoot]} = ArcNanoSpend(20);
