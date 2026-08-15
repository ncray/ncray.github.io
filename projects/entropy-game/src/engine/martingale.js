/**
 * Ensemble Test Martingale & E-Process Sequential Testing Engine
 * Combines:
 * 1. Alternation Beta-Binomial Martingale (Direct Gambler's Fallacy Detector)
 * 2. Markov 1st-Order Transition Dirichlet Martingale
 * 3. Monobit Marginal Frequency Dirichlet Martingale
 * 4. Multi-Order Universal Predictor Martingale
 * 
 * Any convex combination of valid test martingales satisfies Ville's Maximal Inequality.
 */
export class TestMartingale {
  /**
   * @param {number} radix 2 for binary, 10 for decimal
   * @param {number} alpha Significance level (default 0.01)
   * @param {number} minKeys Minimum warm-up keystrokes before halting
   */
  constructor(radix = 2, alpha = 0.01, minKeys = 15) {
    this.radix = radix;
    this.alpha = alpha;
    this.minKeys = minKeys;
    this.threshold = 1.0 / alpha;
    this.logThreshold = Math.log(this.threshold);
    this.reset();
  }

  reset() {
    this.wealth = 1.0;
    this.logWealth = 0;
    this.steps = 0;
    this.history = [];
    this.hasHalted = false;

    // Component martingales (all start at 1.0)
    this.wealthUniv = 1.0;
    this.wealthAlt = 1.0;
    this.wealthMarkov = 1.0;
    this.wealthMono = 1.0;

    // Counts for online Beta-Binomial and Dirichlet-Multinomial martingales
    this.switches = 0;
    this.repeats = 0;
    this.monoCounts = new Array(this.radix).fill(0);
    this.transCounts = Array.from({ length: this.radix }, () => new Array(this.radix).fill(0));
    this.prevSymbol = null;
  }

  /**
   * Update all component martingales on observing symbol x_t
   * @param {number} symbol The observed symbol (0..radix-1)
   * @param {number} univProb Q(x_t | x_{<t}) from universal predictor
   * @returns {{
   *   wealth: number,
   *   logWealth: number,
   *   integrity: number,
   *   shouldHalt: boolean,
   *   pValUpper: number,
   *   bitsLostPerKey: number
   * }}
   */
  update(symbol, univProb) {
    this.steps++;

    // 1. Universal Predictor E-value increment
    const eUniv = this.radix * Math.max(1e-7, univProb);
    this.wealthUniv *= eUniv;

    // 2. Alternation Beta-Binomial E-value increment
    if (this.prevSymbol !== null) {
      const isSwitch = (symbol !== this.prevSymbol);
      const expectedSwitchProb = 1.0 - (1.0 / this.radix); // 0.5 for binary, 0.9 for decimal
      
      // Beta(1, 1) prior predictive probability of switch
      const totalTrans = this.switches + this.repeats;
      const predSwitchProb = (this.switches + 1.0) / (totalTrans + 2.0);
      
      const eAlt = isSwitch 
        ? (predSwitchProb / expectedSwitchProb) 
        : ((1.0 - predSwitchProb) / (1.0 - expectedSwitchProb));
      
      this.wealthAlt *= Math.max(1e-5, eAlt);

      if (isSwitch) this.switches++;
      else this.repeats++;
    }

    // 3. Monobit Marginal Dirichlet-Multinomial E-value increment
    const alphaMono = 0.5;
    const totalMono = this.monoCounts.reduce((a, b) => a + b, 0);
    const pMono = (this.monoCounts[symbol] + alphaMono) / (totalMono + this.radix * alphaMono);
    const eMono = this.radix * pMono;
    this.wealthMono *= eMono;
    this.monoCounts[symbol]++;

    // 4. Markov Transition Dirichlet-Multinomial E-value increment
    if (this.prevSymbol !== null) {
      const rowCounts = this.transCounts[this.prevSymbol];
      const totalRow = rowCounts.reduce((a, b) => a + b, 0);
      const alphaTrans = 0.5;
      const pTrans = (rowCounts[symbol] + alphaTrans) / (totalRow + this.radix * alphaTrans);
      const eTrans = this.radix * pTrans;
      this.wealthMarkov *= eTrans;
      this.transCounts[this.prevSymbol][symbol]++;
    }
    this.prevSymbol = symbol;

    // Convex combination ensemble (valid test martingale with weights summing to 1.0)
    this.wealth = (0.30 * this.wealthUniv) + 
                  (0.40 * this.wealthAlt) + 
                  (0.15 * this.wealthMarkov) + 
                  (0.15 * this.wealthMono);

    this.logWealth = Math.log(Math.max(1e-9, this.wealth));

    // Randomness Integrity Score (100% down to 0%)
    let integrity = 100;
    if (this.logWealth > 0) {
      integrity = Math.max(0, 100 * (1.0 - this.logWealth / this.logThreshold));
    }

    // Ville's inequality p-value upper bound
    const pValUpper = Math.min(1.0, 1.0 / Math.max(1.0, this.wealth));

    // Cumulative bits of entropy lost per key
    const bitsLostPerKey = Math.max(0, (this.logWealth / Math.LN2) / this.steps);

    // Should halt?
    const shouldHalt = (this.steps >= this.minKeys && this.wealth >= this.threshold);
    if (shouldHalt) {
      this.hasHalted = true;
    }

    const state = {
      step: this.steps,
      wealth: this.wealth,
      logWealth: this.logWealth,
      integrity: Math.round(integrity * 10) / 10,
      shouldHalt,
      pValUpper,
      bitsLostPerKey
    };

    this.history.push(state);
    return state;
  }

  setAlpha(alpha) {
    this.alpha = alpha;
    this.threshold = 1.0 / alpha;
    this.logThreshold = Math.log(this.threshold);
  }

  setMinKeys(minKeys) {
    this.minKeys = minKeys;
  }
}
