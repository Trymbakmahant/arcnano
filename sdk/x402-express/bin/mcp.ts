#!/usr/bin/env node

import readline from "readline";
import {
  handleCreateShieldedNote,
  handleGetVaultStatus,
  handleGetBurnerWallet,
  handleDepositToPool,
  handlePayX402Api
} from "../src/mcp.js";

const MCP_TOOLS = [
  {
    name: "create_shielded_note",
    description: "Mint/create a new ArcNano zero-knowledge shielded note in the local vault with secret, nullifier seed, and Poseidon commitment. Returns the commitment hex for pool funding.",
    inputSchema: {
      type: "object",
      properties: {
        denomination: {
          type: "integer",
          description: "Denomination in micro-USDC (default: 10000 = 0.01 USDC). Available: 1000 (0.001 USDC), 10000 (0.01 USDC), 100000 (0.1 USDC).",
          default: 10000
        },
        vault_path: {
          type: "string",
          description: "Optional custom path to agent vault JSON file."
        }
      }
    }
  },
  {
    name: "get_vault_status",
    description: "Check the local ArcNano shielded vault balance, unspent note count, and list of unspent commitment hashes.",
    inputSchema: {
      type: "object",
      properties: {
        vault_path: {
          type: "string",
          description: "Optional custom path to agent vault JSON file."
        }
      }
    }
  },
  {
    name: "get_burner_wallet",
    description: "Inspects or auto-generates the agent's on-chain burner wallet on Arc Testnet, returning its address, native ARC balance, and USDC balance for automated deposits.",
    inputSchema: {
      type: "object",
      properties: {
        private_key: {
          type: "string",
          description: "Optional custom burner private key override."
        }
      }
    }
  },
  {
    name: "deposit_to_pool",
    description: "Prepares or executes on-chain deposit of USDC into ArcNanoPool on Arc Testnet, generating the cryptographic commitment and deposit command, or signing automatically with the burner wallet.",
    inputSchema: {
      type: "object",
      properties: {
        denomination: {
          type: "integer",
          description: "Denomination in micro-USDC (e.g. 10000 for 0.01 USDC).",
          default: 10000
        },
        private_key: {
          type: "string",
          description: "Optional hex private key override if not set in ARCNANO_BURNER_PRIVATE_KEY."
        },
        vault_path: {
          type: "string",
          description: "Optional path to agent vault JSON file."
        }
      }
    }
  },
  {
    name: "pay_x402_api",
    description: "Calls an external API protected by ArcNano HTTP 402 Payment Required. Intercepts the challenge, computes a Groth16 zero-knowledge proof in memory (~74ms), and returns the unlocked data without leaking the agent's identity.",
    inputSchema: {
      type: "object",
      required: ["url"],
      properties: {
        url: {
          type: "string",
          description: "The endpoint URL to query."
        },
        method: {
          type: "string",
          description: "HTTP Method: POST or GET (default: POST).",
          default: "POST"
        },
        json_body: {
          type: "object",
          description: "Optional JSON payload dictionary to send with the request."
        },
        vault_path: {
          type: "string",
          description: "Optional path to agent vault JSON file."
        }
      }
    }
  }
];

const TOOL_HANDLERS: Record<string, (args: any) => Promise<any>> = {
  create_shielded_note: handleCreateShieldedNote,
  get_vault_status: handleGetVaultStatus,
  get_burner_wallet: handleGetBurnerWallet,
  deposit_to_pool: handleDepositToPool,
  pay_x402_api: handlePayX402Api
};

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on("line", async (line) => {
    const text = line.trim();
    if (!text) return;

    let req: any;
    try {
      req = JSON.parse(text);
    } catch {
      return;
    }

    const reqId = req.id;
    const method = req.method;
    const params = req.params || {};

    if (method === "initialize") {
      const resp = {
        jsonrpc: "2.0",
        id: reqId,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: {
            name: "arcnano-x402-mcp",
            version: "0.1.3"
          }
        }
      };
      process.stdout.write(JSON.stringify(resp) + "\n");
    } else if (method === "notifications/initialized") {
      // Ack
    } else if (method === "ping") {
      process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: reqId, result: {} }) + "\n");
    } else if (method === "tools/list") {
      const resp = {
        jsonrpc: "2.0",
        id: reqId,
        result: {
          tools: MCP_TOOLS
        }
      };
      process.stdout.write(JSON.stringify(resp) + "\n");
    } else if (method === "tools/call") {
      const toolName = params.name;
      const toolArgs = params.arguments || {};
      const handler = TOOL_HANDLERS[toolName];

      if (handler) {
        try {
          const result = await handler(toolArgs);
          const resp = {
            jsonrpc: "2.0",
            id: reqId,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result, null, 2)
                }
              ]
            }
          };
          process.stdout.write(JSON.stringify(resp) + "\n");
        } catch (err: any) {
          const resp = {
            jsonrpc: "2.0",
            id: reqId,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({ success: false, error: err.message }, null, 2)
                }
              ],
              isError: true
            }
          };
          process.stdout.write(JSON.stringify(resp) + "\n");
        }
      } else {
        const resp = {
          jsonrpc: "2.0",
          id: reqId,
          error: {
            code: -32601,
            message: `Tool '${toolName}' not found.`
          }
        };
        process.stdout.write(JSON.stringify(resp) + "\n");
      }
    } else {
      if (reqId !== undefined) {
        const resp = {
          jsonrpc: "2.0",
          id: reqId,
          error: {
            code: -32601,
            message: `Unsupported method: ${method}`
          }
        };
        process.stdout.write(JSON.stringify(resp) + "\n");
      }
    }
  });
}

main().catch((err) => {
  console.error("MCP Server Error:", err);
});
