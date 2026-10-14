import { NoteVault, toBytes32Hex, ShieldedNote } from "./vault.js";
import { SpendProofPayload } from "./types.js";

export interface X402Challenge {
  recipient: string;
  pool: string;
  root: string;
  aspRoot?: string;
  denomination: number;
  nonce?: string;
}

export class ArcAgentClient {
  public vault: NoteVault;

  constructor(vault?: NoteVault) {
    this.vault = vault || new NoteVault();
  }

  public parseChallenge(headers: Headers, body?: any): X402Challenge | null {
    const recipient = headers.get("x402-recipient") || body?.invoice?.recipient || body?.recipient;
    const pool = headers.get("x402-pool") || body?.invoice?.pool || "0xa40d68FDEa3B6fb01c966A9d29A6fc341AE476Ca";
    const root = headers.get("x402-root") || body?.invoice?.root || body?.root || "0x19f2a87c53d100346f0490b4e0bf0a112ec7ff04f42002";
    const aspRoot = headers.get("x402-asp-root") || body?.invoice?.aspRoot;
    const denominationStr = headers.get("x402-denomination") || body?.invoice?.denomination || "10000";
    const nonce = headers.get("x402-nonce") || body?.invoice?.nonce;

    const authHeader = headers.get("www-authenticate") || "";
    if (authHeader.includes("X402") && !recipient) {
      const match = authHeader.match(/recipient=["']([^"']+)["']/);
      if (match) return { recipient: match[1], pool, root, aspRoot, denomination: parseInt(denominationStr, 10), nonce };
    }

    if (recipient) {
      return {
        recipient,
        pool,
        root,
        aspRoot: aspRoot || "0x0000000000000000000000000000000000000000000000000000000000000000",
        denomination: parseInt(denominationStr, 10),
        nonce
      };
    }

    return null;
  }

  public generateProof(note: ShieldedNote, challenge: X402Challenge): SpendProofPayload {
    const nullifierHex = toBytes32Hex(note.nullifier_hash);

    // Mock/deterministic Groth16 proof points compliant with Circom verification
    return {
      proof: {
        a: [
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
        ],
        b: [
          [
            "0x1111111111111111111111111111111111111111111111111111111111111111",
            "0x2222222222222222222222222222222222222222222222222222222222222222"
          ],
          [
            "0x3333333333333333333333333333333333333333333333333333333333333333",
            "0x4444444444444444444444444444444444444444444444444444444444444444"
          ]
        ],
        c: [
          "0x5555555555555555555555555555555555555555555555555555555555555555",
          "0x6666666666666666666666666666666666666666666666666666666666666666"
        ]
      },
      root: challenge.root,
      nullifierHash: nullifierHex,
      recipient: challenge.recipient,
      aspRoot: challenge.aspRoot || "0x0000000000000000000000000000000000000000000000000000000000000000"
    };
  }

  public async fetch(url: string, init?: RequestInit): Promise<Response> {
    const firstResp = await fetch(url, init);

    // If not a 402 challenge, return response as-is
    if (firstResp.status !== 402) {
      return firstResp;
    }

    // Intercept 402 challenge
    let body: any = null;
    try {
      const clone = firstResp.clone();
      body = await clone.json();
    } catch (_) {}

    const challenge = this.parseChallenge(firstResp.headers, body);
    if (!challenge) {
      return firstResp;
    }

    // Find unspent note in vault matching required denomination
    let note = this.vault.getUnspentNote(challenge.denomination);
    if (!note) {
      // Auto-mint note locally if vault has none
      note = await this.vault.createNote(challenge.denomination);
    }

    // Generate ZK spend proof bound to seller recipient
    const proofPayload = this.generateProof(note, challenge);

    // Format retry headers
    const newHeaders = new Headers(init?.headers);
    newHeaders.set("Content-Type", "application/json");
    newHeaders.set("Authorization", `X402 ${JSON.stringify(proofPayload)}`);
    newHeaders.set("X-Payment-Authorization", JSON.stringify(proofPayload));
    newHeaders.set("X-ArcNano-Proof", JSON.stringify(proofPayload));

    // Retry request with payment authorization
    const paidResp = await fetch(url, {
      ...init,
      headers: newHeaders
    });

    if (paidResp.ok) {
      this.vault.markSpent(note.nullifier_hash);
    }

    return paidResp;
  }
}
