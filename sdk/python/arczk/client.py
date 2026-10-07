import json
import logging
from typing import Optional, Dict, Any, Union
import requests

from .types import ShieldedNote, X402Invoice, SpendProofPayload
from .vault import NoteVault
from .prover import Groth16Prover

logger = logging.getLogger("arczk.client")


class ArcAgentClient:
    """
    Autonomous AI Agent HTTP client with automatic X402 payment handling.
    Intercepts HTTP 402 Payment Required, generates zero-knowledge spend proofs in memory,
    and retries transparently with X-PAYMENT headers.
    """

    def __init__(
        self,
        vault: Optional[NoteVault] = None,
        prover: Optional[Groth16Prover] = None,
        max_payment_per_call: int = 50000, # 0.05 USDC max limit per call
        session: Optional[requests.Session] = None,
    ):
        self.vault = vault or NoteVault()
        self.prover = prover or Groth16Prover()
        self.max_payment_per_call = max_payment_per_call
        self.session = session or requests.Session()

    def parse_invoice(self, response: requests.Response) -> X402Invoice:
        """Parses X402 challenge from response headers or JSON body."""
        headers = response.headers
        recipient = headers.get("x402-recipient")
        pool = headers.get("x402-pool", "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca")
        root = headers.get("x402-root")
        asp_root = headers.get("x402-asp-root")
        denomination = int(headers.get("x402-denomination", "10000"))
        chain_id = int(headers.get("x402-chain-id", "5042002"))

        # Fallback to response JSON body if headers missing
        raw_challenge = {}
        try:
            body = response.json()
            raw_challenge = body
            invoice_data = body.get("invoice", {})
            if invoice_data:
                recipient = recipient or invoice_data.get("recipient")
                pool = pool or invoice_data.get("pool")
                root = root or invoice_data.get("root")
                asp_root = asp_root or invoice_data.get("aspRoot")
                denomination = int(invoice_data.get("denomination", denomination))
                chain_id = int(invoice_data.get("chainId", chain_id))
        except Exception:
            pass

        if not recipient or not root:
            raise ValueError(f"Incomplete X402 payment invoice from server: {headers}")

        return X402Invoice(
            pool=pool,
            denomination=denomination,
            recipient=recipient,
            root=root,
            asp_root=asp_root or "0",
            chain_id=chain_id,
            raw_challenge=raw_challenge,
        )

    def request(
        self,
        method: str,
        url: str,
        headers: Optional[Dict[str, str]] = None,
        auto_pay: bool = True,
        **kwargs,
    ) -> requests.Response:
        """
        Executes HTTP request with autonomous X402 negotiation.
        """
        req_headers = dict(headers or {})

        # 1. Dispatch initial request
        resp = self.session.request(method, url, headers=req_headers, **kwargs)

        # 2. If 402 Payment Required and auto_pay enabled, negotiate ZK proof
        if resp.status_code == 402 and auto_pay:
            logger.info("Received HTTP 402 Payment Required from %s. Negotiating proof...", url)
            invoice = self.parse_invoice(resp)

            if invoice.denomination > self.max_payment_per_call:
                raise PermissionError(
                    f"Invoice denomination ({invoice.denomination}) exceeds agent spending limit ({self.max_payment_per_call})"
                )

            # Retrieve unspent note from vault
            note = self.vault.get_unspent_note(invoice.denomination)
            if not note:
                # If no note exists, create one for demonstration/testnet flow
                note = self.vault.create_note(denomination=invoice.denomination)
                logger.info("Generated note %s for invoice", note.nullifier_hash[:16])

            # Generate Groth16 spend proof in RAM
            proof_payload = self.prover.generate_proof(note, invoice)

            # Attach payment header and retry
            req_headers["X-PAYMENT"] = json.dumps(proof_payload.to_dict())
            retry_resp = self.session.request(method, url, headers=req_headers, **kwargs)

            if retry_resp.status_code in (200, 201, 204):
                # Mark note as spent upon successful fulfillment
                self.vault.mark_spent(note.nullifier_hash)
                logger.info("Payment verified and fulfilled. Note %s marked spent.", note.nullifier_hash[:16])
                return retry_resp
            else:
                logger.warning("Payment retry failed with status %d: %s", retry_resp.status_code, retry_resp.text)
                return retry_resp

        return resp

    def get(self, url: str, **kwargs) -> requests.Response:
        return self.request("GET", url, **kwargs)

    def post(self, url: str, **kwargs) -> requests.Response:
        return self.request("POST", url, **kwargs)
