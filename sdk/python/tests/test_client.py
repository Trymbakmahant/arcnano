import json
import pytest
import requests
from unittest.mock import Mock, patch
from arczk.client import ArcAgentClient
from arczk.vault import NoteVault

def test_client_x402_negotiation():
    vault = NoteVault()
    note = vault.create_note(denomination=10000)
    client = ArcAgentClient(vault=vault)

    # Mock response 1: 402 Payment Required
    resp402 = requests.Response()
    resp402.status_code = 402
    resp402.headers["x402-recipient"] = "0x063829800C7214C6AaD38f57C72561641cD80333"
    resp402.headers["x402-pool"] = "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca"
    resp402.headers["x402-root"] = "15055926234077295509216400193975320613085685875483293700481590095656163448343"
    resp402.headers["x402-asp-root"] = "19128018104003351169958007405541096654276287024914820341236452486826146398487"
    resp402.headers["x402-denomination"] = "10000"
    resp402._content = b'{"error": "Payment Required", "status": 402}'

    # Mock response 2: 200 OK after sending proof
    resp200 = requests.Response()
    resp200.status_code = 200
    resp200.headers["x-arcnano-verification-time"] = "0.04ms"
    resp200._content = b'{"tokens": ["Autonomous", "agent", "inference"]}'

    mock_session = Mock()
    mock_session.request.side_effect = [resp402, resp200]
    client.session = mock_session

    res = client.post("https://api.inference.ai/v1/generate", json={"prompt": "Hello"})

    assert res.status_code == 200
    assert mock_session.request.call_count == 2

    # Verify that X-PAYMENT header was attached on the retry call
    retry_kwargs = mock_session.request.call_args_list[1]
    headers_used = retry_kwargs[1]["headers"]
    assert "X-PAYMENT" in headers_used

    payload = json.loads(headers_used["X-PAYMENT"])
    assert payload["recipient"] == "0x063829800C7214C6AaD38f57C72561641cD80333"
    assert payload["nullifier_hash"] == note.nullifier_hash

    # Verify note was marked spent
    assert note.is_spent is True
    assert vault.unspent_balance() == 0
