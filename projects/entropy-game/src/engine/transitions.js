/**
 * Markov Transition and Alternation Analysis Engine
 * Detects 1st-order Markov dependencies, alternation bias (Gambler's Fallacy), and transition anomalies.
 */
export class TransitionAnalyzer {
  /**
   * @param {number} radix 2 for binary, 10 for decimal
   */
  constructor(radix = 2) {
    this.radix = radix;
    // Expected alternation rate: for binary, 0.50. For decimal, 0.90 (since only 1/10 repeat)
    this.expectedAltRate = 1.0 - (1.0 / radix);
    this.reset();
  }

  reset() {
    this.matrix = Array.from({ length: this.radix }, () => new Array(this.radix).fill(0));
    this.prevSymbol = null;
    this.totalTransitions = 0;
    this.switches = 0;
    this.repeats = 0;
  }

  observe(symbol) {
    if (this.prevSymbol !== null) {
      this.matrix[this.prevSymbol][symbol]++;
      this.totalTransitions++;

      if (symbol !== this.prevSymbol) {
        this.switches++;
      } else {
        this.repeats++;
      }
    }
    this.prevSymbol = symbol;
  }

  /**
   * Standard normal cumulative distribution function approximation
   */
  static stdNormalCdf(z) {
    const p = 0.2316419;
    const b1 = 0.319381530;
    const b2 = -0.356563782;
    const b3 = 1.781477937;
    const b4 = -1.821255978;
    const b5 = 1.330274429;
    
    const absZ = Math.abs(z);
    const t = 1.0 / (1.0 + p * absZ);
    const pdf = Math.exp(-0.5 * absZ * absZ) / Math.sqrt(2 * Math.PI);
    const cdf = 1.0 - pdf * (b1 * t + b2 * t * t + b3 * Math.pow(t, 3) + b4 * Math.pow(t, 4) + b5 * Math.pow(t, 5));
    return z >= 0 ? cdf : 1.0 - cdf;
  }

  getStats() {
    if (this.totalTransitions === 0) {
      const uniformMatrix = Array.from({ length: this.radix }, () => 
        new Array(this.radix).fill(1.0 / this.radix)
      );
      return {
        matrixCounts: this.matrix.map(row => [...row]),
        probMatrix: uniformMatrix,
        totalTransitions: 0,
        switches: 0,
        repeats: 0,
        alternationRate: this.expectedAltRate,
        expectedAltRate: this.expectedAltRate,
        zScore: 0,
        pValue: 1.0,
        isExcessiveAlternation: false,
        isExcessiveRepetition: false
      };
    }

    const alternationRate = this.switches / this.totalTransitions;
    const p0 = this.expectedAltRate;
    const se = Math.sqrt((p0 * (1.0 - p0)) / this.totalTransitions);
    const zScore = se > 0 ? (alternationRate - p0) / se : 0;
    
    // Two-tailed p-value
    const pValue = 2 * (1.0 - TransitionAnalyzer.stdNormalCdf(Math.abs(zScore)));

    // Compute normalized probability matrix P(next | prev)
    const probMatrix = [];
    for (let i = 0; i < this.radix; i++) {
      const row = new Array(this.radix).fill(0);
      let rowTotal = 0;
      for (let j = 0; j < this.radix; j++) {
        rowTotal += this.matrix[i][j];
      }
      for (let j = 0; j < this.radix; j++) {
        row[j] = rowTotal > 0 ? this.matrix[i][j] / rowTotal : 1.0 / this.radix;
      }
      probMatrix.push(row);
    }

    return {
      matrixCounts: this.matrix.map(row => [...row]),
      probMatrix,
      totalTransitions: this.totalTransitions,
      switches: this.switches,
      repeats: this.repeats,
      alternationRate,
      expectedAltRate: this.expectedAltRate,
      zScore,
      pValue: Math.max(0, Math.min(1.0, pValue)),
      isExcessiveAlternation: (zScore > 2.0),
      isExcessiveRepetition: (zScore < -2.0)
    };
  }
}
