/**
 * Hero Metrics Bar Component
 * Displays the core live indicators:
 * 1. Live Bits of Entropy Gauge (with theoretical max and efficiency)
 * 2. Randomness Integrity Meter (Martingale survival against Ville boundary)
 * 3. AI Next-Key Guess & Accuracy vs Random Baseline
 */
export class HeroMetrics {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="hero-grid">
        <!-- Card 1: Entropy Gauge -->
        <div class="hero-card entropy-hero-card">
          <div class="card-header-sm">
            <span class="card-label">CURRENT ENTROPY RATE</span>
            <span class="badge" id="entropy-rating-badge">Optimal</span>
          </div>
          <div class="entropy-gauge-body">
            <div class="gauge-svg-wrapper">
              <svg viewBox="0 0 120 120" class="radial-gauge">
                <circle cx="60" cy="60" r="48" class="gauge-bg"></circle>
                <circle cx="60" cy="60" r="48" class="gauge-fill" id="gauge-entropy-arc"></circle>
              </svg>
              <div class="gauge-center-text">
                <span class="gauge-val" id="entropy-value-text">1.000</span>
                <span class="gauge-unit" id="entropy-unit-text">bits / key</span>
              </div>
            </div>
            <div class="entropy-sub-details">
              <div class="metric-row">
                <span class="sub-label">Max Possible:</span>
                <span class="sub-val" id="entropy-max-text">1.000 bits</span>
              </div>
              <div class="metric-row">
                <span class="sub-label">Shannon H₀:</span>
                <span class="sub-val" id="entropy-h0-text">1.000</span>
              </div>
              <div class="metric-row">
                <span class="sub-label">Markov H₁:</span>
                <span class="sub-val" id="entropy-h1-text">1.000</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 2: Randomness Integrity Bar -->
        <div class="hero-card integrity-hero-card">
          <div class="card-header-sm">
            <span class="card-label">RANDOMNESS INTEGRITY (SPRT)</span>
            <span class="integrity-pct" id="integrity-pct-text">100%</span>
          </div>
          <div class="integrity-body">
            <div class="integrity-bar-track">
              <div class="integrity-bar-fill" id="integrity-bar-fill" style="width: 100%;"></div>
              <div class="integrity-marker-halt" title="Statistical Halt Boundary (p < alpha)"></div>
            </div>
            <div class="integrity-meta">
              <span id="martingale-wealth-text">Martingale Wealth: 1.0×</span>
              <span id="p-value-bound-text">p-value: &gt; 0.50</span>
            </div>
            <div class="integrity-explanation" id="integrity-status-desc">
              Sequence conforms to uniform randomness. Keep typing!
            </div>
          </div>
        </div>

        <!-- Card 3: AI Predictor -->
        <div class="hero-card ai-hero-card">
          <div class="card-header-sm">
            <span class="card-label">AI NEXT-KEY PREDICTOR</span>
            <span class="badge" id="ai-accuracy-badge">Accuracy: 50%</span>
          </div>
          <div class="ai-body">
            <div class="ai-guess-box">
              <div class="ai-guess-label">Anticipated Next Key:</div>
              <div class="ai-guess-symbol-wrapper">
                <span class="ai-guess-digit" id="ai-guess-digit">?</span>
                <span class="ai-guess-prob" id="ai-guess-prob">(50% confidence)</span>
              </div>
            </div>
            <div class="ai-benchmark-row">
              <div class="metric-row">
                <span class="sub-label">AI Win Rate:</span>
                <span class="sub-val" id="ai-winrate-text">0 / 0 (0%)</span>
              </div>
              <div class="metric-row">
                <span class="sub-label">Random Baseline:</span>
                <span class="sub-val" id="ai-baseline-text">50.0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Cache elements
    this.entropyValueText = this.container.querySelector('#entropy-value-text');
    this.entropyUnitText = this.container.querySelector('#entropy-unit-text');
    this.entropyMaxText = this.container.querySelector('#entropy-max-text');
    this.entropyH0Text = this.container.querySelector('#entropy-h0-text');
    this.entropyH1Text = this.container.querySelector('#entropy-h1-text');
    this.entropyRatingBadge = this.container.querySelector('#entropy-rating-badge');
    this.gaugeArc = this.container.querySelector('#gauge-entropy-arc');

    this.integrityPctText = this.container.querySelector('#integrity-pct-text');
    this.integrityBarFill = this.container.querySelector('#integrity-bar-fill');
    this.martingaleWealthText = this.container.querySelector('#martingale-wealth-text');
    this.pValueBoundText = this.container.querySelector('#p-value-bound-text');
    this.integrityStatusDesc = this.container.querySelector('#integrity-status-desc');

    this.aiAccuracyBadge = this.container.querySelector('#ai-accuracy-badge');
    this.aiGuessDigit = this.container.querySelector('#ai-guess-digit');
    this.aiGuessProb = this.container.querySelector('#ai-guess-prob');
    this.aiWinrateText = this.container.querySelector('#ai-winrate-text');
    this.aiBaselineText = this.container.querySelector('#ai-baseline-text');

    // Circumference for r=48 is 2 * PI * 48 = 301.59
    this.circumference = 2 * Math.PI * 48;
    this.gaugeArc.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
    this.gaugeArc.style.strokeDashoffset = '0';
  }

  /**
   * Update hero metrics from engine snapshot
   * @param {Object} snapshot
   */
  update(snapshot) {
    const { entropy, martingale, aiPredictor, config, totalKeystrokes } = snapshot;

    // 1. Entropy Rate Update
    const curRate = totalKeystrokes > 0 ? entropy.cumulativeRate : config.maxEntropyBits;
    this.entropyValueText.textContent = curRate.toFixed(3);
    this.entropyUnitText.textContent = config.unit;
    this.entropyMaxText.textContent = `${config.maxEntropyBits.toFixed(3)} ${config.unit}`;
    this.entropyH0Text.textContent = entropy.H0.toFixed(3);
    this.entropyH1Text.textContent = entropy.H1.toFixed(3);

    const ratio = Math.max(0, Math.min(1, curRate / config.maxEntropyBits));
    const offset = this.circumference * (1.0 - ratio);
    this.gaugeArc.style.strokeDashoffset = `${offset}`;

    if (ratio >= 0.92) {
      this.entropyRatingBadge.textContent = 'High Entropy';
      this.entropyRatingBadge.className = 'badge badge-success';
      this.gaugeArc.style.stroke = 'var(--accent-emerald)';
    } else if (ratio >= 0.75) {
      this.entropyRatingBadge.textContent = 'Moderate Bias';
      this.entropyRatingBadge.className = 'badge badge-warning';
      this.gaugeArc.style.stroke = 'var(--accent-amber)';
    } else {
      this.entropyRatingBadge.textContent = 'Low Entropy (Biased)';
      this.entropyRatingBadge.className = 'badge badge-danger';
      this.gaugeArc.style.stroke = 'var(--accent-rose)';
    }

    // 2. Randomness Integrity Update
    const integrity = totalKeystrokes > 0 ? martingale.integrity : 100;
    this.integrityPctText.textContent = `${integrity.toFixed(1)}%`;
    this.integrityBarFill.style.width = `${integrity}%`;

    if (integrity > 60) {
      this.integrityBarFill.style.background = 'var(--gradient-integrity-good)';
    } else if (integrity > 25) {
      this.integrityBarFill.style.background = 'var(--gradient-integrity-warn)';
    } else {
      this.integrityBarFill.style.background = 'var(--gradient-integrity-crit)';
    }

    this.martingaleWealthText.textContent = totalKeystrokes > 0 
      ? `Evidence Wealth: ${martingale.wealth < 1000 ? martingale.wealth.toFixed(1) : martingale.wealth.toExponential(1)}× (Critical: ${martingale.threshold}×)`
      : `Evidence Wealth: 1.0× (Critical: ${martingale.threshold}×)`;

    const pVal = martingale.pValUpper;
    this.pValueBoundText.textContent = totalKeystrokes > 0
      ? `p-value upper bound: ${pVal < 0.001 ? '< 0.001' : pVal.toFixed(3)}`
      : 'p-value: > 0.50';

    if (totalKeystrokes < snapshot.config.minKeysBeforeHalt) {
      this.integrityStatusDesc.textContent = `Warming up (${totalKeystrokes}/${snapshot.config.minKeysBeforeHalt} keys)...`;
    } else if (integrity > 70) {
      this.integrityStatusDesc.textContent = `No strong pattern detected. Passed sequential test so far.`;
    } else if (integrity > 20) {
      this.integrityStatusDesc.textContent = `Warning: Emerging patterns detected. Integrity declining.`;
    } else {
      this.integrityStatusDesc.textContent = `Critical: Imminent statistical halt! Patterns strongly predictable.`;
    }

    // 3. AI Predictor Update
    const baselinePct = Math.round(aiPredictor.baselineAccuracy * 100);
    const aiAccPct = totalKeystrokes > 0 ? Math.round(aiPredictor.accuracy * 100) : baselinePct;
    
    this.aiAccuracyBadge.textContent = `AI Accuracy: ${aiAccPct}%`;
    if (aiAccPct > baselinePct + 12) {
      this.aiAccuracyBadge.className = 'badge badge-danger';
    } else if (aiAccPct > baselinePct + 5) {
      this.aiAccuracyBadge.className = 'badge badge-warning';
    } else {
      this.aiAccuracyBadge.className = 'badge badge-neutral';
    }

    this.aiGuessDigit.textContent = `${aiPredictor.nextGuess}`;
    const nextProbPct = Math.round(aiPredictor.nextGuessProb * 100);
    this.aiGuessProb.textContent = `(${nextProbPct}% confidence)`;

    const correctCount = Math.round(aiPredictor.accuracy * totalKeystrokes);
    this.aiWinrateText.textContent = `${correctCount} / ${totalKeystrokes} (${aiAccPct}%)`;
    this.aiBaselineText.textContent = `${baselinePct}.0% (random chance)`;
  }
}
