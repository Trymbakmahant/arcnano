"""
ArcNano Model Context Protocol (MCP) Server
Allows AI agents (Antigravity, Claude Code, Cursor, LangChain) to:
- Generate shielded notes (Poseidon commitment, secret, nullifier)
- Inspect local shielded vault balance
- Prepare & execute on-chain deposits into ArcNanoPool on Arc Layer 1
- Autonomously pay for HTTP 402 APIs using Groth16 zero-knowledge proofs
"""

import sys
import os
import json
import logging
import subprocess
import traceback
from typing import Dict, Any, Optional

from .vault import NoteVault
from .client import ArcAgentClient
from .types import ShieldedNote
from .crypto import BN254_FIELD_PRIME

# Default Contract and Network Parameters
DEFAULT_POOL_ADDRESS = "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca"
DEFAULT_RPC_URL = "https://rpc.testnet.arc.network"
DEFAULT_CHAIN_ID = 5042002
DEFAULT_VAULT_PATH = os.path.expanduser("~/.arcnano/agent_vault.json")

# Standard denomination map
DENOMINATION_MAP = {
    1000: "0.001 USDC",
    10000: "0.01 USDC",
    100000: "0.1 USDC",
    1000000: "1.00 USDC"
}

logging.basicConfig(level=logging.ERROR, stream=sys.stderr)
logger = logging.getLogger("arcnano.mcp")


def to_bytes32_hex(val: Any) -> str:
    """Converts a scalar int or string into 0x-prefixed 32-byte hex."""
    int_val = int(val)
    hex_str = hex(int_val)[2:].rstrip("L")
    return "0x" + hex_str.zfill(64)


# ============================================================================
# Core MCP Tool Implementations
# ============================================================================

def handle_create_shielded_note(args: Dict[str, Any]) -> Dict[str, Any]:
    """Generates a new private shielded note and stores it in the local vault."""
    denomination = int(args.get("denomination", 10000))
    vault_path = os.path.expanduser(args.get("vault_path", DEFAULT_VAULT_PATH))

    vault = NoteVault(vault_path)
    note = vault.create_note(denomination=denomination)

    commitment_hex = to_bytes32_hex(note.commitment)
    nullifier_hex = to_bytes32_hex(note.nullifier_hash)

    denom_label = DENOMINATION_MAP.get(denomination, f"{denomination / 1_000_000:.6f} USDC")

    return {
        "success": True,
        "message": f"Successfully minted shielded note of {denom_label} in local vault.",
        "note": {
            "denomination": denomination,
            "denomination_usdc": denom_label,
            "commitment_dec": str(note.commitment),
            "commitment_hex": commitment_hex,
            "nullifier_hash_dec": str(note.nullifier_hash),
            "nullifier_hash_hex": nullifier_hex,
            "is_spent": note.is_spent,
        },
        "vault": {
            "path": vault_path,
            "total_unspent_notes": vault.unspent_count(),
            "total_unspent_balance_usdc": f"{vault.unspent_balance() / 1_000_000:.6f} USDC"
        },
        "deposit_instructions": {
            "pool_contract": DEFAULT_POOL_ADDRESS,
            "chain_id": DEFAULT_CHAIN_ID,
            "playground_url": f"https://arcnano.xyz/playground",
            "cli_command": f'cast send {DEFAULT_POOL_ADDRESS} "deposit(bytes32)" {commitment_hex} --rpc-url {DEFAULT_RPC_URL}'
        }
    }


def handle_get_vault_status(args: Dict[str, Any]) -> Dict[str, Any]:
    """Inspects the local shielded note vault balance and active notes."""
    vault_path = os.path.expanduser(args.get("vault_path", DEFAULT_VAULT_PATH))
    vault = NoteVault(vault_path)

    unspent_notes = []
    for n in vault.notes:
        if not n.is_spent:
            unspent_notes.append({
                "denomination": n.denomination,
                "denomination_usdc": DENOMINATION_MAP.get(n.denomination, f"{n.denomination / 1_000_000:.6f} USDC"),
                "commitment_hex": to_bytes32_hex(n.commitment),
                "nullifier_hash_hex": to_bytes32_hex(n.nullifier_hash)
            })

    total_units = vault.unspent_balance()
    return {
        "success": True,
        "vault_path": vault_path,
        "active_unspent_notes": vault.unspent_count(),
        "total_unspent_units": total_units,
        "total_unspent_usdc": f"{total_units / 1_000_000:.6f} USDC",
        "notes": unspent_notes,
    }


def get_active_burner_key(args_key: Optional[str] = None) -> Optional[str]:
    """Retrieves burner wallet private key from args, env vars, or local file."""
    if args_key:
        return args_key
    env_key = os.environ.get("ARCNANO_BURNER_PRIVATE_KEY") or os.environ.get("AGENT_PRIVATE_KEY")
    if env_key:
        return env_key
    burner_file = os.path.expanduser("~/.arcnano/burner_wallet.json")
    if os.path.exists(burner_file):
        try:
            with open(burner_file, "r") as f:
                data = json.load(f)
                return data.get("private_key")
        except Exception:
            pass
    return None


def run_bridge_command(action: str, private_key: str, commitment: Optional[str] = None, denomination: Optional[int] = None) -> Dict[str, Any]:
    """Runs deposit_bridge.cjs to sign/broadcast transactions on Arc Testnet."""
    bridge_script = os.path.join(os.path.dirname(__file__), "deposit_bridge.cjs")
    cmd = ["node", bridge_script, action]
    if commitment:
        cmd.append(commitment)
    if denomination:
        cmd.append(str(denomination))

    env = dict(os.environ)
    env["ARCNANO_BURNER_PRIVATE_KEY"] = private_key

    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, env=env)
        stdout = proc.stdout.strip()
        if stdout:
            for line in stdout.split("\n"):
                if line.startswith("{") and line.endswith("}"):
                    return json.loads(line)
        return {"success": False, "error": proc.stderr.strip() or "No JSON output from bridge"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def handle_get_burner_wallet(args: Dict[str, Any]) -> Dict[str, Any]:
    """Gets status of burner wallet, creating a local one if none exists."""
    burner_key = get_active_burner_key(args.get("private_key"))
    burner_file = os.path.expanduser("~/.arcnano/burner_wallet.json")

    # If no burner wallet exists, auto-generate one
    if not burner_key:
        import secrets
        new_key = "0x" + secrets.token_hex(32)
        os.makedirs(os.path.dirname(burner_file), exist_ok=True)
        with open(burner_file, "w") as f:
            json.dump({"private_key": new_key, "created_at": "auto-generated"}, f, indent=2)
        os.chmod(burner_file, 0o600)
        burner_key = new_key

    bridge_res = run_bridge_command("status", burner_key)
    return {
        "success": True,
        "burner_wallet": bridge_res,
        "funding_instructions": {
            "address": bridge_res.get("address"),
            "network": "Arc Testnet (Chain ID 5042002)",
            "message": "Send testnet USDC or ARC to this address to enable autonomous deposits."
        }
    }


def handle_deposit_to_pool(args: Dict[str, Any]) -> Dict[str, Any]:
    """Prepares or executes on-chain deposit into the ArcNanoPool."""
    denomination = int(args.get("denomination", 10000))
    vault_path = os.path.expanduser(args.get("vault_path", DEFAULT_VAULT_PATH))
    pool_address = args.get("pool_address", DEFAULT_POOL_ADDRESS)
    burner_key = get_active_burner_key(args.get("private_key"))

    vault = NoteVault(vault_path)
    # Create the note locally first so the agent holds the private spend secrets
    note = vault.create_note(denomination=denomination)
    commitment_hex = to_bytes32_hex(note.commitment)

    denom_label = DENOMINATION_MAP.get(denomination, f"{denomination / 1_000_000:.6f} USDC")
    response_data = {
        "success": True,
        "message": "Shielded note created in vault.",
        "note": {
            "denomination": denomination,
            "denomination_usdc": denom_label,
            "commitment_hex": commitment_hex,
            "vault_path": vault_path
        },
        "pool": {
            "contract": pool_address,
            "chain_id": DEFAULT_CHAIN_ID,
            "network": "Arc Testnet (Circle L1)"
        },
        "playground_deposit_link": f"https://arcnano.xyz/playground",
        "cast_deposit_command": f'cast send {pool_address} "deposit(bytes32)" {commitment_hex} --rpc-url {DEFAULT_RPC_URL}'
    }

    # If a burner wallet private key is available, execute on-chain deposit automatically
    if burner_key:
        bridge_res = run_bridge_command("deposit", burner_key, commitment=commitment_hex, denomination=denomination)
        if bridge_res.get("success"):
            response_data["onchain_status"] = "Deposited Successfully"
            response_data["onchain_tx_hash"] = bridge_res.get("tx_hash")
            response_data["explorer_url"] = bridge_res.get("explorer_url")
            response_data["depositor_address"] = bridge_res.get("depositor_address")
        else:
            response_data["onchain_status"] = "Deposit Execution Attempted"
            response_data["burner_address"] = bridge_res.get("depositor_address")
            response_data["onchain_notice"] = bridge_res.get("error", "Insufficient balance in burner wallet. Fund this burner address with testnet USDC.")

    return response_data


def handle_pay_x402_api(args: Dict[str, Any]) -> Dict[str, Any]:
    """Calls an HTTP 402 protected endpoint, automatically generating ZK proof and paying."""
    url = args.get("url")
    if not url:
        return {"success": False, "error": "Missing required 'url' parameter."}

    method = args.get("method", "POST").upper()
    json_data = args.get("json_body")
    vault_path = os.path.expanduser(args.get("vault_path", DEFAULT_VAULT_PATH))

    vault = NoteVault(vault_path)
    client = ArcAgentClient(vault=vault)

    try:
        resp = client.request(method=method, url=url, json=json_data)
        content_type = resp.headers.get("content-type", "")
        result_body = resp.json() if "application/json" in content_type else resp.text

        return {
            "success": resp.status_code in (200, 201),
            "status_code": resp.status_code,
            "url": url,
            "response": result_body,
            "vault_balance_remaining_usdc": f"{vault.unspent_balance() / 1_000_000:.6f} USDC"
        }
    except Exception as e:
        return {
            "success": False,
            "url": url,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


# ============================================================================
# MCP Protocol Definitions
# ============================================================================

MCP_TOOLS = [
    {
        "name": "create_shielded_note",
        "description": "Mint/create a new ArcNano zero-knowledge shielded note in the local vault with secret, nullifier seed, and Poseidon commitment. Returns the commitment hex for pool funding.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "denomination": {
                    "type": "integer",
                    "description": "Denomination in micro-USDC (default: 10000 = 0.01 USDC). Available: 1000 (0.001 USDC), 10000 (0.01 USDC), 100000 (0.1 USDC).",
                    "default": 10000
                },
                "vault_path": {
                    "type": "string",
                    "description": "Optional custom path to agent vault JSON file (defaults to ~/.arcnano/agent_vault.json)."
                }
            }
        }
    },
    {
        "name": "get_vault_status",
        "description": "Check the local ArcNano shielded vault balance, unspent note count, and list of unspent commitment hashes.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "vault_path": {
                    "type": "string",
                    "description": "Optional custom path to agent vault JSON file."
                }
            }
        }
    },
    {
        "name": "get_burner_wallet",
        "description": "Inspects or auto-generates the agent's on-chain burner wallet on Arc Testnet, returning its address, native ARC balance, and USDC balance for automated deposits.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "private_key": {
                    "type": "string",
                    "description": "Optional custom burner private key override."
                }
            }
        }
    },
    {
        "name": "deposit_to_pool",
        "description": "Prepares an on-chain deposit of USDC into the ArcNanoPool on Arc Testnet, generating the cryptographic commitment and deposit command or executing with private key.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "denomination": {
                    "type": "integer",
                    "description": "Denomination in micro-USDC (e.g. 10000 for 0.01 USDC).",
                    "default": 10000
                },
                "private_key": {
                    "type": "string",
                    "description": "Optional hex private key if signing and submitting on-chain transaction directly from agent."
                },
                "vault_path": {
                    "type": "string",
                    "description": "Optional path to agent vault JSON file."
                }
            }
        }
    },
    {
        "name": "pay_x402_api",
        "description": "Calls an external API protected by ArcNano HTTP 402 Payment Required. Intercepts the challenge, computes a Groth16 zero-knowledge proof in memory (~74ms), and returns the unlocked data without leaking the agent's identity.",
        "inputSchema": {
            "type": "object",
            "required": ["url"],
            "properties": {
                "url": {
                    "type": "string",
                    "description": "The endpoint URL to query (e.g. https://api.inference.ai/v1/generate or http://localhost:4020/api/v1/inference)."
                },
                "method": {
                    "type": "string",
                    "description": "HTTP Method: POST or GET (default: POST).",
                    "default": "POST"
                },
                "json_body": {
                    "type": "object",
                    "description": "Optional JSON payload dictionary to send with the request."
                },
                "vault_path": {
                    "type": "string",
                    "description": "Optional path to agent vault JSON file."
                }
            }
        }
    }
]

TOOL_HANDLERS = {
    "create_shielded_note": handle_create_shielded_note,
    "get_vault_status": handle_get_vault_status,
    "get_burner_wallet": handle_get_burner_wallet,
    "deposit_to_pool": handle_deposit_to_pool,
    "pay_x402_api": handle_pay_x402_api,
}


def run_stdio_server():
    """Runs standard Model Context Protocol JSON-RPC 2.0 loop over stdin/stdout."""
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except json.JSONDecodeError:
            continue

        req_id = req.get("id")
        method = req.get("method")
        params = req.get("params", {})

        if method == "initialize":
            resp = {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {
                        "name": "arcnano-mcp",
                        "version": "0.1.1"
                    }
                }
            }
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()

        elif method == "notifications/initialized":
            # Ack notification, no response required
            pass

        elif method == "ping":
            resp = {"jsonrpc": "2.0", "id": req_id, "result": {}}
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()

        elif method == "tools/list":
            resp = {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "tools": MCP_TOOLS
                }
            }
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()

        elif method == "tools/call":
            tool_name = params.get("name")
            tool_args = params.get("arguments", {})
            handler = TOOL_HANDLERS.get(tool_name)

            if handler:
                try:
                    result = handler(tool_args)
                    resp = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": json.dumps(result, indent=2)
                                }
                            ]
                        }
                    }
                except Exception as err:
                    resp = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": json.dumps({"success": False, "error": str(err)}, indent=2)
                                }
                            ],
                            "isError": True
                        }
                    }
            else:
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32601,
                        "message": f"Method or tool '{tool_name}' not found."
                    }
                }

            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()

        else:
            if req_id is not None:
                resp = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32601,
                        "message": f"Unsupported method: {method}"
                    }
                }
                sys.stdout.write(json.dumps(resp) + "\n")
                sys.stdout.flush()


if __name__ == "__main__":
    run_stdio_server()
