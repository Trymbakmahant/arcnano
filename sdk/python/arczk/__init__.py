"""
ArcNano: Shielded Zero-Knowledge Nanopayments on Arc
Autonomous AI Agent SDK (LangChain, AutoGPT, CrewAI)
"""

from .types import ShieldedNote, X402Invoice, SpendProofPayload
from .crypto import poseidon, derive_commitment, derive_nullifier_hash, BN254_FIELD_PRIME
from .vault import NoteVault
from .prover import Groth16Prover
from .client import ArcAgentClient
from .integrations import ArcNanoPaymentTool
from .mcp_server import run_stdio_server, MCP_TOOLS

__version__ = "0.1.2"
__all__ = [
    "ShieldedNote",
    "X402Invoice",
    "SpendProofPayload",
    "poseidon",
    "derive_commitment",
    "derive_nullifier_hash",
    "BN254_FIELD_PRIME",
    "NoteVault",
    "Groth16Prover",
    "ArcAgentClient",
    "ArcNanoPaymentTool",
    "run_stdio_server",
    "MCP_TOOLS",
]
