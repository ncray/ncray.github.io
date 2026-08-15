/**
 * Monobit / Marginal Frequency Analysis Engine
 * Tracks symbol frequencies, deviations from uniform, and Chi-Square goodness-of-fit.
 */
export class MonobitAnalyzer {
  /**
   * @param {number} radix 2 for binary, 10 for decimal
   */
  constructor(radix = 2) {
    this.radix = radix;
    this.expectedProb = 1.0 / radix;
    this.reset();
  }

  reset() {
    this.counts = new Array(this.radix).fill(0);
    this.total = 0;
  }

  observe(symbol) {
    this.counts[symbol]++;
    this.total++;
  }

  /**
   * Approximate regularized upper incomplete gamma function Q(s, x) for Chi-Square p-value
   * @param {number} s df / 2
   * @param {number} x chi2 / 2
   */
  static gammaQ(s, x) {
    if (x < 0 || s <= 0) return 1.0;
    if (x === 0) return 1.0;
    if (x < s + 1) {
      // Series expansion for P(s, x)
      let sum = 1.0 / s;
      let term = 1.0 / s;
      for (let n = 1; n < 100; n++) {
        term *= x / (s + n);
        sum += term;
        if (term < sum * 1e-10) break;
      }
      // log gamma approximation using Stirling/Lanczos
      const logGamma = MonobitAnalyzer.logGamma(s);
      const logP = s * Math.log(x) - x - logGamma + Math.log(sum);
      return Math.max(0, Math.min(1.0, 1.0 - Math.exp(logP)));
    } else {
      // Continued fraction for Q(s, x)
      let a0 = 1, a1 = x;
      let b0 = 0, b1 = 1;
      let fac = 1;
      let g = 0;
      let gold = 0;
      for (let n = 1; n < 100; n++) {
        const ana = n - s;
        a0 = (a1 + a0 * ana) * fac;
        b0 = (b1 + b0 * ana) * fac;
        const anf = n * fac;
        a1 = x * a0 + anf * a1;
        b1 = x * b0 + anf * b1;
        if (a1 !== 0) {
          fac = 1.0 / a1;
          g = b1 * fac;
          if (Math.abs((g - gold) / g) < 1e-10) break;
          gold = g;
        }
      }
      const logGamma = MonobitAnalyzer.logGamma(s);
      const logQ = s * Math.log(x) - x - logGamma + Math.log(g);
      return Math.max(0, Math.min(1.0, Math.exp(logQ)));
    }
  }

  static logGamma(x) {
    const c = [
      76.18009172947146, -86.50532032941677,
      24.01409824083091, -1.231739572450155,
      0.1208650973866179e-2, -0.5395239384953e-5
    ];
    let y = x;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) {
      y += 1;
      ser += c[j] / y;
    }
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }

  getStats() {
    if (this.total === 0) {
      return {
        counts: [...this.counts],
        proportions: new Array(this.radix).fill(this.expectedProb),
        expectedCounts: new Array(this.radix).fill(0),
        chiSquare: 0,
        pValue: 1.0,
        maxDeviation: 0,
        dominantSymbol: 0,
        rarestSymbol: 0
      };
    }

    const expectedCount = this.total / this.radix;
    const proportions = [];
    const expectedCounts = [];
    let chiSquare = 0;
    let maxDev = 0;
    let maxCount = -1;
    let minCount = Infinity;
    let dominantSymbol = 0;
    let rarestSymbol = 0;

    for (let i = 0; i < this.radix; i++) {
      const cnt = this.counts[i];
      const p = cnt / this.total;
      proportions.push(p);
      expectedCounts.push(expectedCount);

      const dev = Math.abs(p - this.expectedProb);
      if (dev > maxDev) maxDev = dev;

      if (cnt > maxCount) {
        maxCount = cnt;
        dominantSymbol = i;
      }
      if (cnt < minCount) {
        minCount = cnt;
        rarestSymbol = i;
      }

      const diff = cnt - expectedCount;
      chiSquare += (diff * diff) / expectedCount;
    }

    // Chi-Square p-value with (radix - 1) degrees of freedom
    const df = this.radix - 1;
    const pValue = MonobitAnalyzer.gammaQ(df / 2, chiSquare / 2);

    return {
      counts: [...this.counts],
      proportions,
      expectedCounts,
      chiSquare,
      pValue,
      maxDeviation: maxDev,
      dominantSymbol,
      rarestSymbol
    };
  }
}
