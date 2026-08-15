/**
 * Entropy Computations Engine
 * Calculates Shannon entropy (H0), Markov conditional entropy (H1, H2),
 * instantaneous rolling entropy, and empirical sequential entropy rate.
 */
export class EntropyCalculator {
  /**
   * @param {number} radix 2 for binary, 10 for decimal
   */
  constructor(radix = 2) {
    this.radix = radix;
    this.maxEntropy = Math.log2(radix);
    this.reset();
  }

  reset() {
    this.totalLogLoss = 0;
    this.steps = 0;
    this.logLossHistory = [];
    this.entropyRateHistory = [];
  }

  /**
   * Record a new keystroke log-loss
   * @param {number} logLoss -log2 Q(x_t | x_{<t})
   * @returns {{
   *   instantLogLoss: number,
   *   cumulativeEntropyRate: number,
   *   rollingEntropyRate: number,
   *   maxEntropy: number,
   *   efficiency: number
   * }}
   */
  recordStep(logLoss) {
    this.steps++;
    this.totalLogLoss += logLoss;
    this.logLossHistory.push(logLoss);

    // Cumulative empirical entropy rate
    const cumulativeEntropyRate = Math.min(this.maxEntropy, this.totalLogLoss / this.steps);
    this.entropyRateHistory.push(cumulativeEntropyRate);

    // Rolling window (last 15 keystrokes)
    const windowSize = Math.min(15, this.logLossHistory.length);
    let windowSum = 0;
    for (let i = this.logLossHistory.length - windowSize; i < this.logLossHistory.length; i++) {
      windowSum += this.logLossHistory[i];
    }
    const rollingEntropyRate = Math.min(this.maxEntropy, windowSum / windowSize);

    const efficiency = (cumulativeEntropyRate / this.maxEntropy) * 100;

    return {
      instantLogLoss: logLoss,
      cumulativeEntropyRate,
      rollingEntropyRate,
      maxEntropy: this.maxEntropy,
      efficiency: Math.max(0, Math.min(100, efficiency))
    };
  }

  /**
   * Calculate Marginal 0th-order Shannon Entropy H0 = - sum p_i log2(p_i)
   * @param {number[]} counts Array of counts per symbol
   * @param {number} total Total count
   * @returns {{ H0: number, maxEntropy: number, efficiency: number, probs: number[] }}
   */
  calculateH0(counts, total) {
    if (total === 0) {
      return { H0: this.maxEntropy, maxEntropy: this.maxEntropy, efficiency: 100, probs: new Array(this.radix).fill(1/this.radix) };
    }

    let h0 = 0;
    const probs = [];
    for (let i = 0; i < counts.length; i++) {
      const p = counts[i] / total;
      probs.push(p);
      if (p > 0) {
        h0 -= p * Math.log2(p);
      }
    }

    return {
      H0: Math.min(this.maxEntropy, h0),
      maxEntropy: this.maxEntropy,
      efficiency: Math.min(100, (h0 / this.maxEntropy) * 100),
      probs
    };
  }

  /**
   * Calculate 1st-order Markov Conditional Entropy H1 = - sum_i p(i) sum_j p(j|i) log2 p(j|i)
   * @param {number[][]} transitionMatrix 2D array [prev][next] of counts
   * @param {number[]} marginalCounts Count of each symbol
   * @param {number} totalTransitions Total transitions
   * @returns {{ H1: number, maxEntropy: number, efficiency: number }}
   */
  calculateH1(transitionMatrix, marginalCounts, totalTransitions) {
    if (totalTransitions === 0) {
      return { H1: this.maxEntropy, maxEntropy: this.maxEntropy, efficiency: 100 };
    }

    let h1 = 0;
    for (let i = 0; i < this.radix; i++) {
      let rowTotal = 0;
      for (let j = 0; j < this.radix; j++) {
        rowTotal += transitionMatrix[i][j];
      }

      if (rowTotal > 0) {
        const p_i = rowTotal / totalTransitions;
        let rowEntropy = 0;
        for (let j = 0; j < this.radix; j++) {
          const p_j_given_i = transitionMatrix[i][j] / rowTotal;
          if (p_j_given_i > 0) {
            rowEntropy -= p_j_given_i * Math.log2(p_j_given_i);
          }
        }
        h1 += p_i * rowEntropy;
      }
    }

    return {
      H1: Math.min(this.maxEntropy, h1),
      maxEntropy: this.maxEntropy,
      efficiency: Math.min(100, (h1 / this.maxEntropy) * 100)
    };
  }
}
