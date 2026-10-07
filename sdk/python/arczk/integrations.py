from typing import Optional, Dict, Any
from .client import ArcAgentClient
from .vault import NoteVault

class ArcNanoPaymentTool:
    """
    Framework-agnostic tool wrapper for AI agent pipelines (LangChain, AutoGPT, CrewAI).
    Allows agents to pay for inference, web scraping, and compute endpoints on Arc.
    """

    def __init__(self, client: Optional[ArcAgentClient] = None, vault_path: Optional[str] = None):
        self.client = client or ArcAgentClient(vault=NoteVault(vault_path))

    def run(self, url: str, method: str = "POST", json_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes autonomous request against X402-enabled API.
        """
        resp = self.client.request(
            method=method,
            url=url,
            json=json_data,
        )
        try:
            return {
                "status_code": resp.status_code,
                "data": resp.json(),
                "headers": dict(resp.headers),
            }
        except Exception:
            return {
                "status_code": resp.status_code,
                "text": resp.text,
                "headers": dict(resp.headers),
            }


# LangChain BaseTool implementation (optional dependency)
try:
    from langchain_core.tools import BaseTool

    class ArcNanoLangChainTool(BaseTool):
        name: str = "arcnano_paid_api_caller"
        description: str = (
            "Calls an HTTP endpoint protected by ArcNano X402 micropayments. "
            "Automatically negotiates zero-knowledge Groth16 proofs and USDC payments."
        )
        client: Optional[Any] = None

        def _run(self, url: str, prompt: str) -> str:
            client = self.client or ArcAgentClient()
            resp = client.post(url, json={"prompt": prompt})
            return resp.text

        async def _arun(self, url: str, prompt: str) -> str:
            return self._run(url, prompt)

except ImportError:
    pass
