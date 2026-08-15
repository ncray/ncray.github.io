/**
 * Run-Length / Streak Distribution Analysis Engine
 * Evaluates consecutive streak lengths against the theoretical Geometric distribution.
 */
export class RunLengthAnalyzer {
  /**
   * @param {number} radix 2 for binary, 10 for decimal
   */
  constructor(radix = 2) {
    this.radix = radix;
    this.reset();
  }

  reset() {
    this.currentSymbol = null;
    this.currentRunLength = 0;
    this.runs = []; // list of { symbol, length }
    // Histogram of completed run lengths: length -> count
    this.runHistogram = new Map();
    this.maxObservedRun = 0;
    this.totalKeystrokes = 0;
  }

  observe(symbol) {
    this.totalKeystrokes++;

    if (this.currentSymbol === null) {
      this.currentSymbol = symbol;
      this.currentRunLength = 1;
      this.maxObservedRun = 1;
      return;
    }

    if (symbol === this.currentSymbol) {
      this.currentRunLength++;
      if (this.currentRunLength > this.maxObservedRun) {
        this.maxObservedRun = this.currentRunLength;
      }
    } else {
      // Completed previous run
      this.runs.push({ symbol: this.currentSymbol, length: this.currentRunLength });
      const prevCount = this.runHistogram.get(this.currentRunLength) || 0;
      this.runHistogram.set(this.currentRunLength, prevCount + 1);

      this.currentSymbol = symbol;
      this.currentRunLength = 1;
    }
  }

  getStats() {
    // Include current ongoing run in copy of histogram for real-time visualization
    const histCopy = new Map(this.runHistogram);
    if (this.currentRunLength > 0) {
      const curCount = histCopy.get(this.currentRunLength) || 0;
      histCopy.set(this.currentRunLength, curCount + 1);
    }

    const totalRuns = this.runs.length + (this.currentRunLength > 0 ? 1 : 0);
    
    // Expected run length: for binary, mean run length = 2.0; for decimal, = 10/9 ~ 1.111
    const pSuccess = 1.0 / this.radix; // prob of extending run
    const pStop = 1.0 - pSuccess;      // prob of stopping run
    const theoreticalMeanRun = 1.0 / pStop;

    let observedTotalLength = 0;
    for (const [len, count] of histCopy.entries()) {
      observedTotalLength += len * count;
    }
    const observedMeanRun = totalRuns > 0 ? observedTotalLength / totalRuns : theoreticalMeanRun;

    // Expected maximum run length: approx log_radix(totalKeystrokes * pStop)
    const expectedMaxRun = this.totalKeystrokes > 5
      ? Math.max(1, Math.round(Math.log(this.totalKeystrokes * pStop) / Math.log(this.radix) + 0.577 / Math.LN2))
      : 2;

    // Build bins for 1, 2, 3, 4, 5, 6+
    const maxBin = 6;
    const bins = [];
    for (let k = 1; k <= maxBin; k++) {
      const count = histCopy.get(k) || 0;
      // Theoretical prob of run length k: pStop * (pSuccess)^(k-1)
      const theoProb = pStop * Math.pow(pSuccess, k - 1);
      const expectedCount = totalRuns * theoProb;
      bins.push({
        length: k,
        label: k === maxBin ? `${k}+` : `${k}`,
        count,
        expectedCount,
        theoProb
      });
    }

    // Check for streak starvation: sequence >= 35 keys, but max run <= 2 in binary mode
    const isStreakStarved = (this.radix === 2 && this.totalKeystrokes >= 35 && this.maxObservedRun <= 2);

    return {
      totalRuns,
      totalKeystrokes: this.totalKeystrokes,
      maxObservedRun: this.maxObservedRun,
      expectedMaxRun,
      observedMeanRun,
      theoreticalMeanRun,
      bins,
      isStreakStarved,
      currentRun: { symbol: this.currentSymbol, length: this.currentRunLength }
    };
  }
}
