import os
import tempfile
import pytest
from arczk.vault import NoteVault

def test_note_creation_and_balance():
    vault = NoteVault()
    assert vault.unspent_balance() == 0
    assert vault.unspent_count() == 0

    note1 = vault.create_note(denomination=10000)
    assert note1.denomination == 10000
    assert not note1.is_spent
    assert vault.unspent_balance() == 10000
    assert vault.unspent_count() == 1

    note2 = vault.create_note(denomination=20000)
    assert vault.unspent_balance() == 30000
    assert vault.unspent_count() == 2

    # Spend note1
    vault.mark_spent(note1.nullifier_hash)
    assert note1.is_spent
    assert vault.unspent_balance() == 20000
    assert vault.unspent_count() == 1

def test_vault_persistence():
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        vault1 = NoteVault(vault_path=tmp_path)
        vault1.create_note(denomination=10000)
        vault1.create_note(denomination=50000)

        # Reopen with new instance
        vault2 = NoteVault(vault_path=tmp_path)
        assert vault2.unspent_count() == 2
        assert vault2.unspent_balance() == 60000
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
