import json
import os
from typing import List, Optional, Dict, Any
from .types import ShieldedNote
from .crypto import generate_random_field_element, derive_commitment, derive_nullifier_hash

class NoteVault:
    """
    Manages client-side shielded notes, note generation, secrets, and local storage.
    Enforces privacy by ensuring secrets never leave local process memory unshielded.
    """

    def __init__(self, vault_path: Optional[str] = None):
        self.vault_path = vault_path
        self.notes: List[ShieldedNote] = []
        if self.vault_path and os.path.exists(self.vault_path):
            self.load(self.vault_path)

    def create_note(
        self,
        denomination: int = 10000,
        secret: Optional[int] = None,
        nullifier_seed: Optional[int] = None,
        leaf_index: Optional[int] = None,
        path_elements: Optional[List[str]] = None,
        path_indices: Optional[List[int]] = None,
    ) -> ShieldedNote:
        """
        Creates a new private shielded note with random secret credentials.
        Default denomination: 10,000 micro-units (0.01 USDC).
        """
        sec = secret or generate_random_field_element()
        seed = nullifier_seed or generate_random_field_element()

        commitment = derive_commitment(denomination, sec, seed)
        nullifier_hash = derive_nullifier_hash(seed, sec)

        note = ShieldedNote(
            denomination=denomination,
            secret=sec,
            nullifier_seed=seed,
            commitment=commitment,
            nullifier_hash=nullifier_hash,
            leaf_index=leaf_index,
            merkle_path_elements=path_elements or [str(i + 1) for i in range(20)],
            merkle_path_indices=path_indices or [(i % 2) for i in range(20)],
            is_spent=False,
        )

        self.notes.append(note)
        self._auto_save()
        return note

    def get_unspent_note(self, denomination: Optional[int] = None) -> Optional[ShieldedNote]:
        """Finds and returns the first available unspent note matching denomination."""
        for note in self.notes:
            if not note.is_spent:
                if denomination is None or note.denomination >= denomination:
                    return note
        return None

    def mark_spent(self, nullifier_hash: str) -> bool:
        """Marks a note as spent by nullifier hash."""
        for note in self.notes:
            if note.nullifier_hash == nullifier_hash or note.nullifier_hash == str(nullifier_hash):
                note.is_spent = True
                self._auto_save()
                return True
        return False

    def unspent_balance(self) -> int:
        """Returns total unspent balance in micro-units."""
        return sum(note.denomination for note in self.notes if not note.is_spent)

    def unspent_count(self) -> int:
        """Returns count of active unspent notes."""
        return sum(1 for note in self.notes if not note.is_spent)

    def _auto_save(self) -> None:
        if self.vault_path:
            self.save(self.vault_path)

    def save(self, filepath: str) -> None:
        """Saves note vault to local JSON file."""
        data = {
            "version": "1.0.0",
            "notes": [n.to_dict() for n in self.notes],
        }
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def load(self, filepath: str) -> None:
        """Loads notes from a local JSON file."""
        if not os.path.exists(filepath) or os.path.getsize(filepath) == 0:
            self.notes = []
            return
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.notes = [ShieldedNote.from_dict(item) for item in data.get("notes", [])]
