from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any
import time

@dataclass
class ShieldedNote:
    """Represents a private shielded note owned by the autonomous AI agent."""
    denomination: int
    secret: int
    nullifier_seed: int
    commitment: str
    nullifier_hash: str
    leaf_index: Optional[int] = None
    merkle_path_elements: List[str] = field(default_factory=list)
    merkle_path_indices: List[int] = field(default_factory=list)
    is_spent: bool = False
    created_at: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ShieldedNote":
        return cls(**data)


@dataclass
class X402Invoice:
    """Parsed HTTP 402 Payment Required challenge from the API provider."""
    pool: str
    denomination: int
    recipient: str
    root: str
    asp_root: str
    chain_id: int = 5042002
    denomination_formatted: str = "0.01 USDC"
    raw_challenge: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SpendProofPayload:
    """Groth16 spend proof structure bundled inside HTTP X-PAYMENT header."""
    proof: Dict[str, Any]
    root: str
    nullifier_hash: str
    recipient: str
    asp_root: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "proof": self.proof,
            "root": str(self.root),
            "nullifierHash": str(self.nullifier_hash),
            "recipient": str(self.recipient),
            "aspRoot": str(self.asp_root),
            "nullifier_hash": str(self.nullifier_hash),
            "asp_root": str(self.asp_root),
        }
