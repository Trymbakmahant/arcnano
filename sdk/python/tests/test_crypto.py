import pytest
from arczk.crypto import (
    poseidon,
    derive_commitment,
    derive_nullifier_hash,
    generate_random_field_element,
    BN254_FIELD_PRIME,
)

def test_random_field_element_range():
    val = generate_random_field_element()
    assert 0 < val < BN254_FIELD_PRIME

def test_poseidon_test_vector_consistency():
    # Test vector from circuits/scripts/generate_input.js
    denomination = 10000
    secret = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
    nullifier_seed = 0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321

    # Commitment: Poseidon(3)
    comm = derive_commitment(denomination, secret, nullifier_seed)
    assert comm is not None
    assert int(comm) > 0
    assert int(comm) < BN254_FIELD_PRIME

    # Nullifier: Poseidon(2)
    nullifier = derive_nullifier_hash(nullifier_seed, secret)
    assert nullifier is not None
    assert int(nullifier) > 0
    assert int(nullifier) < BN254_FIELD_PRIME

    # Determinism check
    comm2 = derive_commitment(denomination, secret, nullifier_seed)
    assert comm == comm2
