import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
// @ts-ignore
import { buildPoseidon } from "circomlibjs";

export const BN254_PRIME = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

export interface ShieldedNote {
  denomination: number;
  secret: string;
  nullifier_seed: string;
  commitment: string;
  nullifier_hash: string;
  leaf_index?: number;
  merkle_path_elements: string[];
  merkle_path_indices: number[];
  is_spent: boolean;
  created_at: string;
}

export function toBytes32Hex(val: string | number | bigint): string {
  const b = BigInt(val);
  const hex = b.toString(16);
  return "0x" + hex.padStart(64, "0");
}

let poseidonInstance: any = null;

export async function getPoseidon() {
  if (!poseidonInstance) {
    poseidonInstance = await buildPoseidon();
  }
  return poseidonInstance;
}

export function generateRandomScalar(): bigint {
  while (true) {
    const buf = crypto.randomBytes(32);
    const val = BigInt("0x" + buf.toString("hex"));
    if (val > 0n && val < BN254_PRIME) {
      return val;
    }
  }
}

export class NoteVault {
  public vaultPath: string;
  public notes: ShieldedNote[] = [];

  constructor(vaultPath?: string) {
    this.vaultPath = vaultPath
      ? path.resolve(vaultPath)
      : path.join(os.homedir(), ".arcnano", "agent_vault.json");
    this.load();
  }

  public async createNote(denomination: number = 10000): Promise<ShieldedNote> {
    const poseidon = await getPoseidon();

    const sec = generateRandomScalar();
    const seed = generateRandomScalar();

    // Commitment = Poseidon(denomination, secret, nullifier_seed)
    const commRes = poseidon([BigInt(denomination), sec, seed]);
    const commitment = poseidon.F.toString(commRes);

    // Nullifier = Poseidon(nullifier_seed, secret)
    const nullRes = poseidon([seed, sec]);
    const nullifierHash = poseidon.F.toString(nullRes);

    const note: ShieldedNote = {
      denomination,
      secret: sec.toString(),
      nullifier_seed: seed.toString(),
      commitment,
      nullifier_hash: nullifierHash,
      merkle_path_elements: Array.from({ length: 20 }, (_, i) => (i + 1).toString()),
      merkle_path_indices: Array.from({ length: 20 }, (_, i) => i % 2),
      is_spent: false,
      created_at: new Date().toISOString()
    };

    this.notes.push(note);
    this.save();
    return note;
  }

  public getUnspentNote(denomination?: number): ShieldedNote | null {
    for (const note of this.notes) {
      if (!note.is_spent) {
        if (!denomination || note.denomination >= denomination) {
          return note;
        }
      }
    }
    return null;
  }

  public markSpent(nullifierHash: string): boolean {
    for (const note of this.notes) {
      if (note.nullifier_hash === nullifierHash || toBytes32Hex(note.nullifier_hash) === nullifierHash) {
        note.is_spent = true;
        this.save();
        return true;
      }
    }
    return false;
  }

  public getUnspentBalance(): number {
    return this.notes
      .filter((n) => !n.is_spent)
      .reduce((acc, curr) => acc + curr.denomination, 0);
  }

  public getUnspentCount(): number {
    return this.notes.filter((n) => !n.is_spent).length;
  }

  public save(): void {
    const dir = path.dirname(this.vaultPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = {
      version: "1.0.0",
      notes: this.notes
    };
    fs.writeFileSync(this.vaultPath, JSON.stringify(data, null, 2), "utf-8");
  }

  public load(): void {
    if (!fs.existsSync(this.vaultPath)) {
      this.notes = [];
      return;
    }
    try {
      const raw = fs.readFileSync(this.vaultPath, "utf-8");
      const parsed = JSON.parse(raw);
      this.notes = parsed.notes || [];
    } catch {
      this.notes = [];
    }
  }
}
