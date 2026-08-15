import { MODE_CONFIGS, FATAL_FLAW_TYPES } from './types.js';
import { UniversalPredictor } from './predictor.js';
import { TestMartingale } from './martingale.js';
import { EntropyCalculator } from './entropy.js';
import { MonobitAnalyzer } from './monobit.js';
import { TransitionAnalyzer } from './transitions.js';
import { RunLengthAnalyzer } from './runs.js';
import { NGramAnalyzer } from './ngrams.js';
import { SpatialAnalyzer } from './spatial.js';

export class EntropyEngine {
  /**
   * @param {'binary' | 'decimal'} mode
   * @param {number} alpha Significance level (default 0.01)
   * @param {number} minKeys Minimum warm-up keystrokes before halting
   */
  constructor(mode = 'binary', alpha = 0.01, minKeys = null) {
    this.mode = mode;
    this.config = MODE_CONFIGS[mode];
    this.alpha = alpha;
    this.minKeys = minKeys !== null ? minKeys : this.config.minKeysBeforeHalt;

    this.predictor = new UniversalPredictor(this.config.radix, 3);
    this.martingale = new TestMartingale(this.config.radix, this.alpha, this.minKeys);
    this.entropyCalc = new EntropyCalculator(this.config.radix);
    this.monobit = new MonobitAnalyzer(this.config.radix);
    this.transitions = new TransitionAnalyzer(this.config.radix);
    this.runs = new RunLengthAnalyzer(this.config.radix);
    this.ngrams = new NGramAnalyzer(this.config.radix);
    this.spatial = this.config.radix === 10 ? new SpatialAnalyzer() : null;

    this.reset();
  }

  setMode(mode) {
    this.mode = mode;
    this.config = MODE_CONFIGS[mode];
    this.minKeys = this.config.minKeysBeforeHalt;
    this.predictor = new UniversalPredictor(this.config.radix, 3);
    this.martingale = new TestMartingale(this.config.radix, this.alpha, this.minKeys);
    this.entropyCalc = new EntropyCalculator(this.config.radix);
    this.monobit = new MonobitAnalyzer(this.config.radix);
    this.transitions = new TransitionAnalyzer(this.config.radix);
    this.runs = new RunLengthAnalyzer(this.config.radix);
    this.ngrams = new NGramAnalyzer(this.config.radix);
    this.spatial = this.config.radix === 10 ? new SpatialAnalyzer() : null;
    this.reset();
  }

  setAlpha(alpha) {
    this.alpha = alpha;
    this.martingale.setAlpha(alpha);
  }

  setMinKeys(minKeys) {
    this.minKeys = minKeys;
    this.martingale.setMinKeys(minKeys);
  }

  reset() {
    this.sequence = [];
    this.timestamps = [];
    this.haltReport = null;
    this.isHalted = false;

    this.predictor.reset();
    this.martingale.reset();
    this.entropyCalc.reset();
    this.monobit.reset();
    this.transitions.reset();
    this.runs.reset();
    this.ngrams.reset();
    if (this.spatial) this.spatial.reset();
  }

  /**
   * Add a single keystroke symbol
   * @param {number|string} rawSymbol 0 or 1 for binary, 0-9 for decimal
   * @param {number} timestamp optional Date.now()
   */
  processKeystroke(rawSymbol, timestamp = Date.now()) {
    if (this.isHalted) {
      return this.getSnapshot();
    }

    const symbol = parseInt(rawSymbol, 10);
    if (isNaN(symbol) || symbol < 0 || symbol >= this.config.radix) {
      return this.getSnapshot();
    }

    this.sequence.push(symbol);
    this.timestamps.push(timestamp);

    // 1. Observe via predictor (gets probability assigned before update)
    const predResult = this.predictor.observe(symbol);

    // 2. Feed likelihood to Martingale
    const martState = this.martingale.update(symbol, predResult.actualProb);

    // 3. Record Entropy step
    const entState = this.entropyCalc.recordStep(predResult.logLoss);

    // 4. Update individual diagnostic analyzers
    this.monobit.observe(symbol);
    this.transitions.observe(symbol);
    this.runs.observe(symbol);
    this.ngrams.observe(symbol);
    if (this.spatial) this.spatial.observe(symbol);

    // Check if test reached statistical halt
    if (martState.shouldHalt) {
      this.isHalted = true;
      this.haltReport = this.generateAutopsyReport();
    }

    return this.getSnapshot(predResult);
  }

  /**
   * Get complete real-time data snapshot
   */
  getSnapshot(lastPredResult = null) {
    const monoStats = this.monobit.getStats();
    const h0Stats = this.entropyCalc.calculateH0(monoStats.counts, monoStats.total);
    const transStats = this.transitions.getStats();
    const h1Stats = this.entropyCalc.calculateH1(transStats.matrixCounts, monoStats.counts, transStats.totalTransitions);
    const runStats = this.runs.getStats();
    const ngramStats = this.ngrams.getStats();
    const spatialStats = this.spatial ? this.spatial.getStats() : null;

    // Upcoming AI prediction for next keystroke
    const nextPred = this.predictor.predictNext();

    // Typing speed calculation
    let typingSpeed = 0;
    if (this.timestamps.length >= 2) {
      const durationSec = (this.timestamps[this.timestamps.length - 1] - this.timestamps[0]) / 1000;
      if (durationSec > 0) {
        typingSpeed = Math.round((this.sequence.length / durationSec) * 10) / 10;
      }
    }

    return {
      mode: this.mode,
      config: this.config,
      totalKeystrokes: this.sequence.length,
      sequence: [...this.sequence],
      isHalted: this.isHalted,
      haltReport: this.haltReport,
      typingSpeed,

      // Hero metrics
      entropy: {
        maxEntropy: this.config.maxEntropyBits,
        cumulativeRate: this.entropyCalc.entropyRateHistory[this.entropyCalc.entropyRateHistory.length - 1] || this.config.maxEntropyBits,
        instantLogLoss: lastPredResult ? lastPredResult.logLoss : this.config.maxEntropyBits,
        H0: h0Stats.H0,
        H1: h1Stats.H1,
        efficiency: ( (this.entropyCalc.entropyRateHistory[this.entropyCalc.entropyRateHistory.length - 1] || this.config.maxEntropyBits) / this.config.maxEntropyBits ) * 100
      },
      martingale: {
        wealth: this.martingale.wealth,
        logWealth: this.martingale.logWealth,
        integrity: this.martingale.history.length > 0 ? this.martingale.history[this.martingale.history.length - 1].integrity : 100,
        threshold: this.martingale.threshold,
        alpha: this.alpha,
        pValUpper: this.martingale.history.length > 0 ? this.martingale.history[this.martingale.history.length - 1].pValUpper : 1.0,
        bitsLostPerKey: this.martingale.history.length > 0 ? this.martingale.history[this.martingale.history.length - 1].bitsLostPerKey : 0
      },
      aiPredictor: {
        accuracy: this.predictor.getAccuracy(),
        baselineAccuracy: 1.0 / this.config.radix,
        nextGuess: nextPred.topSymbol,
        nextGuessProb: nextPred.topProb,
        confidence: nextPred.confidence,
        probabilities: nextPred.probabilities
      },

      // Sub-engine diagnostic stats
      monobit: monoStats,
      transitions: transStats,
      runs: runStats,
      ngrams: ngramStats,
      spatial: spatialStats
    };
  }

  /**
   * Generate an in-depth statistical autopsy explaining why the sequence failed
   */
  generateAutopsyReport() {
    const mono = this.monobit.getStats();
    const trans = this.transitions.getStats();
    const run = this.runs.getStats();
    const ng = this.ngrams.getStats();
    const sp = this.spatial ? this.spatial.getStats() : null;
    const n = this.sequence.length;

    // Detect candidate flaws and score their severity
    const candidates = [];

    // 1. Alternation / Gambler's Fallacy
    if (this.config.radix === 2 && trans.totalTransitions >= 15) {
      if (trans.alternationRate > 0.58) {
        const excessPct = Math.round((trans.alternationRate - 0.50) * 100);
        // Chi-squared / Wald score = Z^2
        const zScore = Math.abs(trans.zScore);
        candidates.push({
          type: FATAL_FLAW_TYPES.GAMBLERS_FALLACY,
          score: zScore * zScore + 5.0, // High priority root cause
          title: "Gambler's Fallacy (Alternation Bias)",
          subtitle: `Switched symbols on ${Math.round(trans.alternationRate * 100)}% of keys (+${excessPct}% above random)`,
          explanation: `In true randomness, the next flip is independent of the last (50% alternation). You switched digits excessively, intuitively assuming that after a 0 or 1, the opposite was 'due'.`,
          metric: `${Math.round(trans.alternationRate * 100)}% switches`,
          expected: '50.0% switches',
          pValue: trans.pValue,
          bitsLostEstimate: Math.max(0, 1.0 - (- (trans.alternationRate * Math.log2(trans.alternationRate) + (1-trans.alternationRate)*Math.log2(1-trans.alternationRate))))
        });
      } else if (trans.alternationRate < 0.38) {
        const zScore = Math.abs(trans.zScore);
        candidates.push({
          type: FATAL_FLAW_TYPES.EXCESS_RUNS,
          score: zScore * zScore + 5.0,
          title: 'Excessive Clustering (Stickiness)',
          subtitle: `Repeated the same symbol on ${Math.round((1 - trans.alternationRate) * 100)}% of keys`,
          explanation: `You repeated digits significantly more often than the 50% baseline, creating long sticky clusters.`,
          metric: `${Math.round(trans.alternationRate * 100)}% switches`,
          expected: '50.0% switches',
          pValue: trans.pValue,
          bitsLostEstimate: 0.15
        });
      }
    }

    // 2. Run / Streak Starvation (If alternation rate is normal, but runs are artificially capped)
    if (this.config.radix === 2 && n >= 25 && trans.alternationRate <= 0.58) {
      if (run.maxObservedRun <= 2 && run.expectedMaxRun >= 4) {
        candidates.push({
          type: FATAL_FLAW_TYPES.RUN_STARVATION,
          score: (run.expectedMaxRun - run.maxObservedRun) * 2.5,
          title: 'Streak Starvation (Fear of Long Runs)',
          subtitle: `Longest streak was only ${run.maxObservedRun} (expected ${run.expectedMaxRun}+)`,
          explanation: `A true random sequence of ${n} bits has a >90% probability of containing a streak of 4 or more identical symbols. You actively avoided streaks longer than 2.`,
          metric: `Max run: ${run.maxObservedRun}`,
          expected: `Max run: ${run.expectedMaxRun}+`,
          pValue: 0.005,
          bitsLostEstimate: 0.22
        });
      }
    }

    // 3. Monobit / Marginal Frequency Imbalance
    if (mono.pValue < 0.05) {
      const domSym = this.config.symbols[mono.dominantSymbol];
      const domPct = Math.round(mono.proportions[mono.dominantSymbol] * 100);
      const expPct = Math.round(this.config.theoreticalProb * 100);
      candidates.push({
        type: FATAL_FLAW_TYPES.MONOBIT_BIAS,
        score: mono.chiSquare + 2.0,
        title: 'Marginal Frequency Imbalance',
        subtitle: `Overused digit '${domSym}' (${domPct}% vs ${expPct}% expected)`,
        explanation: `Symbols were not chosen uniformly. Digit '${domSym}' appeared ${mono.counts[mono.dominantSymbol]} times while digit '${this.config.symbols[mono.rarestSymbol]}' appeared only ${mono.counts[mono.rarestSymbol]} times.`,
        metric: `Digit '${domSym}': ${domPct}%`,
        expected: `${expPct}% per digit`,
        pValue: mono.pValue,
        bitsLostEstimate: Math.max(0, this.config.maxEntropyBits - this.entropyCalc.calculateH0(mono.counts, mono.total).H0)
      });
    }

    // 4. Repetitive N-gram Cycle (excluding simple period-2 alternation which is Gambler's Fallacy)
    if ((ng.activeCycle && ng.activeCycle.period > 2) || (ng.topPatterns.length > 0 && ng.topPatterns[0].ratio >= 2.8 && ng.topPatterns[0].pattern.length > 2)) {
      const topPat = ng.activeCycle ? ng.activeCycle.pattern : ng.topPatterns[0].pattern;
      const count = ng.topPatterns.length > 0 ? ng.topPatterns[0].count : 'multiple';
      candidates.push({
        type: FATAL_FLAW_TYPES.REPETITIVE_PATTERN,
        score: ng.activeCycle ? 8.0 : (ng.topPatterns[0].ratio * 1.5),
        title: 'Repetitive N-Gram Cycle',
        subtitle: `Rhythm loop detected around pattern '${topPat}'`,
        explanation: `The model detected a recurring sub-sequence ('${topPat}'). Humans naturally fall into muscle memory rhythms when attempting to be random.`,
        metric: `Pattern '${topPat}': ${count} occurrences`,
        expected: 'Uniform permutation',
        pValue: 0.001,
        bitsLostEstimate: 0.35
      });
    }

    // 5. Spatial / Counting progression (Decimal mode)
    if (sp && (sp.isCountingBias || sp.isAdjacencyBias)) {
      if (sp.isCountingBias) {
        const ascPct = Math.round(sp.ascendingRate * 100);
        candidates.push({
          type: FATAL_FLAW_TYPES.SPATIAL_COUNTING,
          score: 6.0,
          title: 'Arithmetic Progression Bias (Counting)',
          subtitle: `Consecutive digits step (+1/-1) on ${ascPct}% of keys (expected 10%)`,
          explanation: `You frequently typed sequential steps (e.g. 1-2-3 or 7-8-9) or arithmetic increments instead of uniform leaps.`,
          metric: `${ascPct}% arithmetic steps`,
          expected: '10.0% steps',
          pValue: 0.002,
          bitsLostEstimate: 0.40
        });
      }
      if (sp.isAdjacencyBias) {
        const adjPct = Math.round(sp.adjacentRate * 100);
        candidates.push({
          type: FATAL_FLAW_TYPES.SPATIAL_COUNTING,
          score: 5.5,
          title: 'Numpad / Keyboard Proximity Bias',
          subtitle: `Adjacent physical keys pressed ${adjPct}% of the time (expected ~38%)`,
          explanation: `Your fingers naturally gravitated to neighboring keys on the keypad rather than jumping across the keyboard layout.`,
          metric: `${adjPct}% adjacent keys`,
          expected: '~38% adjacent keys',
          pValue: 0.008,
          bitsLostEstimate: 0.28
        });
      }
    }

    // Fallback if generic universal predictability triggered
    if (candidates.length === 0) {
      const accuracyPct = Math.round(this.predictor.getAccuracy() * 100);
      const baselinePct = Math.round(this.config.theoreticalProb * 100);
      candidates.push({
        type: FATAL_FLAW_TYPES.HIGH_PREDICTABILITY,
        score: 5.0,
        title: 'High Context-Tree Predictability',
        subtitle: `AI model anticipated your next key with ${accuracyPct}% accuracy (baseline: ${baselinePct}%)`,
        explanation: `Even without a single isolated bias, your higher-order Markov transitions formed a predictable multi-state grammar that allowed the predictor to reliably guess your next move.`,
        metric: `${accuracyPct}% AI accuracy`,
        expected: `${baselinePct}% random baseline`,
        pValue: 1.0 / this.martingale.wealth,
        bitsLostEstimate: this.martingale.history[this.martingale.history.length - 1].bitsLostPerKey
      });
    }

    // Sort by severity score
    candidates.sort((a, b) => b.score - a.score);
    const primaryFlaw = candidates[0];
    const secondaryFlaws = candidates.slice(1);

    const totalBitsLost = this.martingale.history[this.martingale.history.length - 1].bitsLostPerKey;
    const finalEntropyRate = Math.max(0, this.config.maxEntropyBits - totalBitsLost);

    return {
      keystrokeCount: n,
      primaryFlaw,
      secondaryFlaws,
      finalEntropyRate,
      maxEntropy: this.config.maxEntropyBits,
      totalBitsLost,
      martingaleWealth: this.martingale.wealth,
      pValUpper: this.martingale.history[this.martingale.history.length - 1].pValUpper,
      aiAccuracy: this.predictor.getAccuracy(),
      baselineAccuracy: this.config.theoreticalProb
    };
  }
}
