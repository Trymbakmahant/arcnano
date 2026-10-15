"""
ArcNano Model Context Protocol (MCP) Server
Allows AI agents (Antigravity, Claude Code, Cursor, LangChain) to:
- Generate shielded notes (Poseidon commitment, secret, nullifier)
- Inspect local shielded vault balance
- Prepare & execute on-chain deposits into ArcNanoPool on Arc Mainnet & Testnet
- Autonomously pay for HTTP 402 APIs using Groth16 zero-knowledge proofs
"""

import warnings
warnings.filterwarnings("ignore")

import sys
import os
import json
import logging
import subprocess
import traceback
from typing import Dict, Any, Optional, Tuple

from .vault import NoteVault
from .client import ArcAgentClient
from .types import ShieldedNote
from .crypto import BN254_FIELD_PRIME

# Multi-Network Configuration
NETWORKS: Dict[str, Dict[str, Any]] = {
    "testnet": {
        "name": "Arc Testnet (Circle L1)",
        "chain_id": 5042002,
        "rpc_url": os.getenv("ARC_TESTNET_RPC") or os.getenv("ARC_RPC_URL") or "https://rpc.testnet.arc.network",
        "explorer_url": "https://explorer.testnet.arc.io",
        "usdc_contract": "0x3600000000000000000000000000000000000000",
        "pools": {
            10000: "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
            1000000: "0x716F5ea75f0B2a27c7a50F25E8Bb343A3B3530CB",
        },
        "batchers": {
            10000: "0xD20E2c9aa6C291c15571440DAc7a6e773EC386e4",
            1000000: "0x76f7EA532E8080211d9B6Dcc03976c2101c7Ab86",
        },
        "default_pool": "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca",
    },
    "mainnet": {
        "name": "Arc Mainnet (Circle L1)",
        "chain_id": 5042,
        "rpc_url": os.getenv("ARC_MAINNET_RPC") or "https://rpc.mainnet.arc.io",
        "explorer_url": "https://explorer.arc.io",
        "usdc_contract": "0x3600000000000000000000000000000000000000",
        "pools": {
            10000: "0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd",
            1000000: "0x385394d11a93e84452970acf958bDdAab34f208f",
        },
        "batchers": {
            10000: "0x34e54d470E4D95B3cFD8d6089Ae742346C19Af50",
            1000000: "0x006B10444dd88e463E93a7f4769b6885C7fa7b3b",
        },
        "default_pool": "0x8D49FE6B8EfA2C10486374CaE243243e18D1b5Dd",
    }
}

DEFAULT_NETWORK = "testnet"
DEFAULT_VAULT_PATH = os.path.expanduser("~/.arcnano/agent_vault.json")

# Standard denomination map
DENOMINATION_MAP = {
    1000: "0.001 USDC",
    10000: "0.01 USDC",
    100000: "0.10 USDC",
    1000000: "1.00 USDC"
}

logging.basicConfig(level=logging.ERROR, stream=sys.stderr)
logger = logging.getLogger("arcnano.mcp")


def resolve_network(network_arg: Optional[str] = None, chain_id_arg: Optional[int] = None) -> Tuple[str, Dict[str, Any]]:
    """Resolves target network from argument, chain ID, or environment variable."""
    if network_arg:
        key = network_arg.strip().lower()
        if key in ("mainnet", "5042"):
            return "mainnet", NETWORKS["mainnet"]
        if key in ("testnet", "5042002"):
            return "testnet", NETWORKS["testnet"]

    if chain_id_arg:
        if chain_id_arg == 5042:
            return "mainnet", NETWORKS["mainnet"]
        if chain_id_arg == 5042002:
            return "testnet", NETWORKS["testnet"]

    env_key = os.getenv("ARCNANO_NETWORK", DEFAULT_NETWORK).strip().lower()
    if env_key in ("mainnet", "5042"):
        return "mainnet", NETWORKS["mainnet"]
    return "testnet", NETWORKS["testnet"]


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
    net_key, net_config = resolve_network(args.get("network"), args.get("chain_id"))

    pool_contract = args.get("pool_address") or net_config["pools"].get(denomination, net_config["default_pool"])
    batcher_contract = net_config["batchers"].get(denomination, net_config["batchers"][10000])

    vault = NoteVault(vault_path)
    note = vault.create_note(denomination=denomination)

    commitment_hex = to_bytes32_hex(note.commitment)
    nullifier_hex = to_bytes32_hex(note.nullifier_hash)

    denom_label = DENOMINATION_MAP.get(denomination, f"{denomination / 1_000_000:.6f} USDC")

    return {
        "success": True,
        "message": f"Successfully minted shielded note of {denom_label} in local vault for {net_config['name']}.",
        "note": {
            "denomination": denomination,
            "denomination_usdc": denom_label,
            "commitment_dec": str(note.commitment),
            "commitment_hex": commitment_hex,
            "nullifier_hash_dec": str(note.nullifier_hash),
            "nullifier_hash_hex": nullifier_hex,
            "is_spent": note.is_spent,
        },
        "network": {
            "id": net_key,
            "name": net_config["name"],
            "chain_id": net_config["chain_id"],
            "rpc_url": net_config["rpc_url"],
            "explorer_url": net_config["explorer_url"]
        },
        "vault": {
            "path": vault_path,
            "total_unspent_notes": vault.unspent_count(),
            "total_unspent_balance_usdc": f"{vault.unspent_balance() / 1_000_000:.6f} USDC"
        },
        "deposit_instructions": {
            "pool_contract": pool_contract,
            "batcher_contract": batcher_contract,
            "chain_id": net_config["chain_id"],
            "playground_url": f"https://arcnano.xyz/playground",
            "cli_command": f'cast send {pool_contract} "deposit(bytes32)" {commitment_hex} --rpc-url {net_config["rpc_url"]}',
            "batch_deposit_cli": f'cast send {batcher_contract} "depositBatch(bytes32[])" "[{commitment_hex}]" --rpc-url {net_config["rpc_url"]}'
        }
    }


def handle_get_vault_status(args: Dict[str, Any]) -> Dict[str, Any]:
    """Inspects the local shielded note vault balance and active notes."""
    vault_path = os.path.expanduser(args.get("vault_path", DEFAULT_VAULT_PATH))
    net_key, net_config = resolve_network(args.get("network"), args.get("chain_id"))
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
        "current_network": {
            "id": net_key,
            "name": net_config["name"],
            "chain_id": net_config["chain_id"],
            "default_pool": net_config["default_pool"]
        },
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


def run_bridge_command(
    action: str,
    private_key: str,
    commitment: Optional[str] = None,
    denomination: Optional[int] = None,
    network: str = "testnet",
    pool_address: Optional[str] = None
) -> Dict[str, Any]:
    """Runs deposit_bridge.cjs to sign/broadcast transactions on Arc Mainnet or Testnet."""
    bridge_script = os.path.join(os.path.dirname(__file__), "deposit_bridge.cjs")
    cmd = ["node", bridge_script, action]
    if commitment:
        cmd.append(commitment)
    else:
        cmd.append("")
    if denomination:
        cmd.append(str(denomination))
    else:
        cmd.append("10000")
    cmd.append(network)
    if pool_address:
        cmd.append(pool_address)

    env = dict(os.environ)
    env["ARCNANO_BURNER_PRIVATE_KEY"] = private_key
    env["ARCNANO_NETWORK"] = network

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
    """Gets status of burner wallet on Arc Mainnet or Testnet, creating a local one if none exists."""
    net_key, net_config = resolve_network(args.get("network"), args.get("chain_id"))
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

    bridge_res = run_bridge_command("status", burner_key, network=net_key)
    return {
        "success": True,
        "burner_wallet": bridge_res,
        "network": {
            "id": net_key,
            "name": net_config["name"],
            "chain_id": net_config["chain_id"],
            "pools": net_config["pools"]
        },
        "funding_instructions": {
            "address": bridge_res.get("address"),
            "network": f"{net_config['name']} (Chain ID {net_config['chain_id']})",
            "message": f"Send native ARC (gas) and USDC to this address to enable autonomous deposits on {net_config['name']}."
        }
    }


def handle_deposit_to_pool(args: Dict[str, Any]) -> Dict[str, Any]:
    """Prepares or executes on-chain deposit into the ArcNanoPool on Arc Mainnet or Testnet."""
    denomination = int(args.get("denomination", 10000))
    vault_path = os.path.expanduser(args.get("vault_path", DEFAULT_VAULT_PATH))
    net_key, net_config = resolve_network(args.get("network"), args.get("chain_id"))

    pool_address = args.get("pool_address") or net_config["pools"].get(denomination, net_config["default_pool"])
    batcher_address = net_config["batchers"].get(denomination, net_config["batchers"][10000])
    burner_key = get_active_burner_key(args.get("private_key"))

    vault = NoteVault(vault_path)
    note = vault.create_note(denomination=denomination)
    commitment_hex = to_bytes32_hex(note.commitment)

    denom_label = DENOMINATION_MAP.get(denomination, f"{denomination / 1_000_000:.6f} USDC")
    response_data = {
        "success": True,
        "message": f"Shielded note created in vault for {net_config['name']}.",
        "note": {
            "denomination": denomination,
            "denomination_usdc": denom_label,
            "commitment_hex": commitment_hex,
            "vault_path": vault_path
        },
        "pool": {
            "contract": pool_address,
            "batcher_contract": batcher_address,
            "chain_id": net_config["chain_id"],
            "network": net_config["name"]
        },
        "playground_deposit_link": f"https://arcnano.xyz/playground",
        "cast_deposit_command": f'cast send {pool_address} "deposit(bytes32)" {commitment_hex} --rpc-url {net_config["rpc_url"]}'
    }

    # If a burner wallet private key is available, execute on-chain deposit automatically
    if burner_key:
        bridge_res = run_bridge_command(
            "deposit",
            burner_key,
            commitment=commitment_hex,
            denomination=denomination,
            network=net_key,
            pool_address=pool_address
        )
        if bridge_res.get("success"):
            response_data["onchain_status"] = "Deposited Successfully"
            response_data["onchain_tx_hash"] = bridge_res.get("tx_hash")
            response_data["explorer_url"] = bridge_res.get("explorer_url")
            response_data["depositor_address"] = bridge_res.get("depositor_address")
            response_data["block_number"] = bridge_res.get("block_number")
        else:
            response_data["onchain_status"] = "Deposit Execution Attempted"
            response_data["burner_address"] = bridge_res.get("depositor_address")
            response_data["onchain_notice"] = bridge_res.get("error", f"Insufficient balance in burner wallet. Fund this burner address with USDC and native ARC on {net_config['name']}.")

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
        "description": "Mint/create a new ArcNano zero-knowledge shielded note in the local vault with secret, nullifier seed, and Poseidon commitment. Returns the commitment hex and deposit instructions for Arc Mainnet (Chain ID 5042) or Arc Testnet (Chain ID 5042002).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "denomination": {
                    "type": "integer",
                    "description": "Denomination in micro-USDC (default: 10000 = 0.01 USDC). Available: 10000 (0.01 USDC), 1000000 (1.00 USDC).",
                    "default": 10000
                },
                "network": {
                    "type": "string",
                    "enum": ["testnet", "mainnet"],
                    "default": "testnet",
                    "description": "Target Arc Network: 'mainnet' (Chain ID 5042) or 'testnet' (Chain ID 5042002). Default: 'testnet'."
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
        "description": "Check the local ArcNano shielded vault balance, unspent note count, and list of unspent commitment hashes across Arc Mainnet or Testnet.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "network": {
                    "type": "string",
                    "enum": ["testnet", "mainnet"],
                    "default": "testnet",
                    "description": "Target Arc Network: 'mainnet' or 'testnet'."
                },
                "vault_path": {
                    "type": "string",
                    "description": "Optional custom path to agent vault JSON file."
                }
            }
        }
    },
    {
        "name": "get_burner_wallet",
        "description": "Inspects or auto-generates the agent's on-chain burner wallet on Arc Mainnet or Arc Testnet, returning its address, native ARC balance, and USDC balance for automated deposits.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "network": {
                    "type": "string",
                    "enum": ["testnet", "mainnet"],
                    "default": "testnet",
                    "description": "Target Arc Network: 'mainnet' (Chain ID 5042) or 'testnet' (Chain ID 5042002)."
                },
                "private_key": {
                    "type": "string",
                    "description": "Optional custom burner private key override."
                }
            }
        }
    },
    {
        "name": "deposit_to_pool",
        "description": "Prepares and executes on-chain deposit of USDC into ArcNanoPool on Arc Mainnet (Chain ID 5042) or Arc Testnet (Chain ID 5042002), generating cryptographic commitment and executing with burner key or CLI.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "denomination": {
                    "type": "integer",
                    "description": "Denomination in micro-USDC (10000 for 0.01 USDC, 1000000 for 1.00 USDC).",
                    "default": 10000
                },
                "network": {
                    "type": "string",
                    "enum": ["testnet", "mainnet"],
                    "default": "testnet",
                    "description": "Target Arc Network: 'mainnet' (Chain ID 5042) or 'testnet' (Chain ID 5042002)."
                },
                "pool_address": {
                    "type": "string",
                    "description": "Optional specific pool contract address override."
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
        "description": "Calls an external API protected by ArcNano HTTP 402 Payment Required on Arc Mainnet or Testnet. Intercepts the challenge, computes a Groth16 zero-knowledge proof in memory (~74ms), and returns the unlocked data without leaking the agent's identity.",
        "inputSchema": {
            "type": "object",
            "required": ["url"],
            "properties": {
                "url": {
                    "type": "string",
                    "description": "The endpoint URL to query (e.g. https://api.inference.ai/v1/generate or http://localhost:4020/api/v1/inference)."
                },
                "network": {
                    "type": "string",
                    "enum": ["testnet", "mainnet"],
                    "description": "Optional target network ('mainnet' or 'testnet'). Defaults to challenge network."
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
                        "version": "0.2.0"
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
                        "message": f"Unsupported method: ${method}"
                    }
                }
                sys.stdout.write(json.dumps(resp) + "\n")
                sys.stdout.flush()


if __name__ == "__main__":
    run_stdio_server()
