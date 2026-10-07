/**
 * @title NullifierCache
 * @notice In-memory high-throughput double-spend protection cache
 * @dev Protects API providers from off-chain nullifier replays with sub-millisecond lookups (<0.1ms)
 */
export class NullifierCache {
  private cache: Map<string, { timestamp: number; recipient: string }>;
  private maxEntries: number;

  constructor(maxEntries = 500_000) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
  }

  /**
   * Normalizes a nullifier hash into a 0x-prefixed 64-char hex string
   */
  public normalize(nullifier: string): string {
    if (!nullifier || typeof nullifier !== "string") return "0x0";
    const clean = nullifier.toLowerCase().replace(/^0x/, "");
    return "0x" + clean.padStart(64, "0");
  }

  /**
   * Checks if nullifier has already been seen / redeemed off-chain
   */
  public has(nullifier: string): boolean {
    const key = this.normalize(nullifier);
    return this.cache.has(key);
  }

  /**
   * Records a spent nullifier. Returns true if recorded, false if already spent.
   */
  public record(nullifier: string, recipient: string): boolean {
    const key = this.normalize(nullifier);
    if (this.cache.has(key)) {
      return false; // Already spent!
    }

    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, { timestamp: Date.now(), recipient });
    return true;
  }

  /**
   * Returns total count of cached nullifiers
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * Clears the cache
   */
  public clear(): void {
    this.cache.clear();
  }
}
