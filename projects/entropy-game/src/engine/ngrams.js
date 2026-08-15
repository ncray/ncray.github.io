/**
 * N-Gram Pattern Radar & Autocorrelation Analysis Engine
 * Detects 2-gram, 3-gram, and 4-gram repetition cycles, and computes serial lag correlations.
 */
export class NGramAnalyzer {
  /**
   * @param {number} radix 2 for binary, 10 for decimal
   */
  constructor(radix = 2) {
    this.radix = radix;
    this.reset();
  }

  reset() {
    this.sequence = [];
    this.ngramCounts = new Map(); // string pattern -> count
  }

  observe(symbol) {
    this.sequence.push(symbol);
    const n = this.sequence.length;

    // Record 2-grams, 3-grams, 4-grams ending at current position
    for (let len = 2; len <= 4; len++) {
      if (n >= len) {
        const pattern = this.sequence.slice(n - len).join('');
        const prev = this.ngramCounts.get(pattern) || 0;
        this.ngramCounts.set(pattern, prev + 1);
      }
    }
  }

  /**
   * Compute serial Pearson autocorrelation at lag k
   * @param {number} lag
   */
  computeAutocorrelation(lag) {
    const n = this.sequence.length;
    if (n <= lag + 2) return 0;

    let mean = 0;
    for (let i = 0; i < n; i++) mean += this.sequence[i];
    mean /= n;

    let variance = 0;
    for (let i = 0; i < n; i++) {
      const diff = this.sequence[i] - mean;
      variance += diff * diff;
    }
    if (variance < 1e-9) return 0;

    let cov = 0;
    for (let i = 0; i < n - lag; i++) {
      cov += (this.sequence[i] - mean) * (this.sequence[i + lag] - mean);
    }

    return cov / variance;
  }

  getStats() {
    const n = this.sequence.length;
    
    // Autocorrelations at lag 1, 2, 3, 4
    const autocorrelations = [
      { lag: 1, value: this.computeAutocorrelation(1) },
      { lag: 2, value: this.computeAutocorrelation(2) },
      { lag: 3, value: this.computeAutocorrelation(3) },
      { lag: 4, value: this.computeAutocorrelation(4) }
    ];

    // Find top repeating n-grams
    const patternList = [];
    for (const [pattern, count] of this.ngramCounts.entries()) {
      const len = pattern.length;
      const totalPossible = n - len + 1;
      if (totalPossible <= 0) continue;

      const expectedProb = Math.pow(1.0 / this.radix, len);
      const expectedCount = totalPossible * expectedProb;
      const ratio = count / Math.max(0.5, expectedCount);

      if (count >= 3 && ratio > 1.8) {
        patternList.push({
          pattern,
          length: len,
          count,
          expectedCount,
          ratio
        });
      }
    }

    // Sort by ratio descending
    patternList.sort((a, b) => b.ratio - a.ratio);
    const topPatterns = patternList.slice(0, 5);

    // Detect period-2, period-3, or period-4 cycles in recent history
    let activeCycle = null;
    if (n >= 6) {
      const recent = this.sequence.slice(-8);
      // Check period 2: e.g. 0 1 0 1 0 1
      if (recent.length >= 6) {
        let isP2 = true;
        for (let i = 2; i < recent.length; i++) {
          if (recent[i] !== recent[i - 2]) { isP2 = false; break; }
        }
        if (isP2) activeCycle = { period: 2, pattern: recent.slice(-2).join('') };
      }
      // Check period 3: e.g. 1 2 3 1 2 3
      if (!activeCycle && recent.length >= 6) {
        let isP3 = true;
        for (let i = 3; i < recent.length; i++) {
          if (recent[i] !== recent[i - 3]) { isP3 = false; break; }
        }
        if (isP3) activeCycle = { period: 3, pattern: recent.slice(-3).join('') };
      }
    }

    return {
      topPatterns,
      autocorrelations,
      activeCycle
    };
  }
}
