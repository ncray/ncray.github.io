/**
 * Adaptive Universal Sequential Predictor (Variable-Order Context Tree / PPM Mixture)
 * Maintains predictive distributions for order 0, 1, 2, and 3 Markov contexts with Bayesian mixture weights.
 */
export class UniversalPredictor {
  /**
   * @param {number} radix Number of symbols in the alphabet (2 or 10)
   * @param {number} maxOrder Maximum context order (default: 3)
   */
  constructor(radix = 2, maxOrder = 3) {
    this.radix = radix;
    this.maxOrder = maxOrder;
    this.uniformProb = 1.0 / radix;
    this.reset();
  }

  reset() {
    this.history = [];
    // Tree of context counts: Map<string, number[]>
    // key: context string (e.g. "" for order 0, "1" for order 1, "01" for order 2)
    // value: array of count per symbol
    this.contextCounts = new Map();
    
    // Weights for each order d in 0..maxOrder
    this.weights = new Array(this.maxOrder + 1).fill(1.0 / (this.maxOrder + 1));
    this.totalSteps = 0;
    this.correctPredictions = 0;
  }

  /**
   * Get context string for order d given current history
   * @param {number} order
   * @returns {string|null}
   */
  getContext(order) {
    if (order === 0) return '';
    if (this.history.length < order) return null;
    return this.history.slice(this.history.length - order).join(',');
  }

  /**
   * Compute predicted probability distribution for next symbol Q(x | history)
   * @returns {{ probabilities: number[], topSymbol: number, topProb: number, confidence: number }}
   */
  predictNext() {
    const mixedProbs = new Array(this.radix).fill(0);
    let activeWeightSum = 0;

    for (let d = 0; d <= this.maxOrder; d++) {
      const ctx = this.getContext(d);
      if (ctx === null) continue; // Not enough history for this order yet

      const w = this.weights[d];
      activeWeightSum += w;

      const counts = this.contextCounts.get(ctx);
      let totalContextCount = 0;
      if (counts) {
        for (let i = 0; i < this.radix; i++) {
          totalContextCount += counts[i];
        }
      }

      // Krichevsky-Trofimov / Laplace smoothing (alpha = 0.5)
      const alpha = 0.5;
      const denom = totalContextCount + this.radix * alpha;

      for (let s = 0; s < this.radix; s++) {
        const count = counts ? counts[s] : 0;
        const p_d = (count + alpha) / denom;
        mixedProbs[s] += w * p_d;
      }
    }

    // Normalize by active weights sum
    if (activeWeightSum > 0) {
      for (let s = 0; s < this.radix; s++) {
        mixedProbs[s] /= activeWeightSum;
      }
    } else {
      for (let s = 0; s < this.radix; s++) {
        mixedProbs[s] = this.uniformProb;
      }
    }

    // Find top symbol and confidence
    let topSymbol = 0;
    let topProb = -1;
    for (let s = 0; s < this.radix; s++) {
      if (mixedProbs[s] > topProb) {
        topProb = mixedProbs[s];
        topSymbol = s;
      }
    }

    const confidence = Math.max(0, (topProb - this.uniformProb) / (1.0 - this.uniformProb));

    return {
      probabilities: mixedProbs,
      topSymbol,
      topProb,
      confidence
    };
  }

  /**
   * Observe actual pressed symbol, compute log loss, and update context counts and mixture weights
   * @param {number} symbol The symbol that was pressed (0..radix-1)
   * @returns {{ actualProb: number, logLoss: number, wasTopGuess: boolean, topSymbol: number }}
   */
  observe(symbol) {
    const prediction = this.predictNext();
    const actualProb = Math.max(1e-9, prediction.probabilities[symbol]);
    const logLoss = -Math.log2(actualProb);
    const wasTopGuess = (symbol === prediction.topSymbol);

    if (wasTopGuess) {
      this.correctPredictions++;
    }
    this.totalSteps++;

    // Compute probability assigned to observed symbol by each order d, and update Bayesian weights
    const orderLikelihoods = new Array(this.maxOrder + 1).fill(this.uniformProb);
    for (let d = 0; d <= this.maxOrder; d++) {
      const ctx = this.getContext(d);
      if (ctx !== null) {
        const counts = this.contextCounts.get(ctx);
        let totalCount = 0;
        let symCount = 0;
        if (counts) {
          symCount = counts[symbol];
          for (let i = 0; i < this.radix; i++) totalCount += counts[i];
        }
        const alpha = 0.5;
        orderLikelihoods[d] = (symCount + alpha) / (totalCount + this.radix * alpha);
      }
    }

    // Bayesian weight update with a mild discount / regularization to keep higher orders agile
    let newWeightSum = 0;
    for (let d = 0; d <= this.maxOrder; d++) {
      this.weights[d] = Math.max(1e-6, this.weights[d] * orderLikelihoods[d]);
      newWeightSum += this.weights[d];
    }
    if (newWeightSum > 0) {
      for (let d = 0; d <= this.maxOrder; d++) {
        this.weights[d] /= newWeightSum;
      }
    }

    // Update context counts for all orders
    for (let d = 0; d <= this.maxOrder; d++) {
      const ctx = this.getContext(d);
      if (ctx !== null) {
        let counts = this.contextCounts.get(ctx);
        if (!counts) {
          counts = new Array(this.radix).fill(0);
          this.contextCounts.set(ctx, counts);
        }
        counts[symbol]++;
      }
    }

    // Append to history
    this.history.push(symbol);

    return {
      actualProb,
      logLoss,
      wasTopGuess,
      topSymbol: prediction.topSymbol
    };
  }

  getAccuracy() {
    return this.totalSteps > 0 ? this.correctPredictions / this.totalSteps : 0;
  }
}
