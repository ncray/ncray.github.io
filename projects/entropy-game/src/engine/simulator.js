/**
 * Simulation Generator for Benchmarks and Demonstrations
 * Generates true cryptographic pseudo-random sequences and realistic biased human heuristic sequences.
 */
export class SimulationEngine {
  /**
   * Generate next symbol from Cryptographically Secure PRNG (crypto.getRandomValues)
   * @param {number} radix 2 or 10
   */
  static getTrueRandom(radix) {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const buffer = new Uint32Array(1);
      crypto.getRandomValues(buffer);
      return buffer[0] % radix;
    }
    return Math.floor(Math.random() * radix);
  }

  /**
   * Generate next symbol mimicking typical human Gambler's Fallacy (Alternation Bias ~65%)
   * @param {number} prevSymbol
   * @param {number} radix
   */
  static getGamblerFallacy(prevSymbol, radix = 2) {
    if (prevSymbol === null) return Math.floor(Math.random() * radix);
    if (radix === 2) {
      // 72% chance of switching (typical human alternation bias)
      return Math.random() < 0.72 ? (1 - prevSymbol) : prevSymbol;
    } else {
      // Decimal: pick anything other than prevSymbol 98% of the time, and prefer step +1/-1 35% of the time
      if (Math.random() < 0.35) {
        return (prevSymbol + (Math.random() < 0.5 ? 1 : 9)) % 10;
      }
      let sym;
      do {
        sym = Math.floor(Math.random() * radix);
      } while (sym === prevSymbol);
      return sym;
    }
  }

  /**
   * Generate next symbol from a repetitive N-gram rhythm
   * @param {number} step
   * @param {number} radix
   */
  static getRhythmPattern(step, radix = 2) {
    if (radix === 2) {
      const pattern = [0, 1, 0, 1, 1, 0, 1, 0];
      return pattern[step % pattern.length];
    } else {
      const pattern = [1, 2, 3, 5, 8, 1, 2, 3, 4, 7];
      return pattern[step % pattern.length];
    }
  }

  /**
   * Generate next symbol from arithmetic counting bias (+1 / -1)
   * @param {number} prevSymbol
   * @param {number} radix
   */
  static getCountingPattern(prevSymbol, radix = 2) {
    if (prevSymbol === null) return 1;
    if (radix === 2) {
      return 1 - prevSymbol;
    }
    // 80% chance of stepping +1 or -1
    if (Math.random() < 0.80) {
      return (prevSymbol + (Math.random() < 0.85 ? 1 : 9)) % 10;
    }
    return Math.floor(Math.random() * radix);
  }
}
