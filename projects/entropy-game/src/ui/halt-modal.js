/**
 * Halt & Autopsy Post-Mortem Modal Component
 * Renders the educational, scientifically rigorous breakdown when the sequential test halts.
 */
export class HaltAutopsyModal {
  /**
   * @param {HTMLElement} container
   * @param {Object} options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.onReset = options.onReset || (() => {});
    this.onRunPRNG = options.onRunPRNG || (() => {});
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-backdrop" id="halt-modal-backdrop" style="display: none;">
        <div class="modal-dialog halt-dialog">
          <!-- Modal Header -->
          <div class="modal-header-halt">
            <div class="verdict-banner">
              <div class="verdict-icon">⛔</div>
              <div class="verdict-text-block">
                <div class="verdict-title">STATISTICAL HALT: SEQUENCE IS NON-RANDOM</div>
                <div class="verdict-sub" id="halt-verdict-sub">Null hypothesis of uniform randomness rejected (p &lt; 0.01)</div>
              </div>
            </div>
            <button class="modal-close-btn" id="halt-modal-close" title="Close modal">&times;</button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Primary Flaw Highlight Card -->
            <div class="autopsy-flaw-card" id="autopsy-flaw-card">
              <div class="flaw-badge">PRIMARY FATAL FLAW</div>
              <h2 class="flaw-title" id="flaw-title">Gambler's Fallacy (Alternation Bias)</h2>
              <div class="flaw-subtitle" id="flaw-subtitle">Switched symbols on 68% of keys (+18% above random)</div>
              <p class="flaw-explanation" id="flaw-explanation">
                In true randomness, the next flip is independent of the last. You switched digits excessively, intuitively assuming that after a 0 or 1, the opposite was 'due'.
              </p>
              <div class="flaw-metrics-row">
                <div class="flaw-metric-box">
                  <div class="f-lbl">Observed Metric</div>
                  <div class="f-val f-val-obs" id="flaw-metric-obs">68.0% switches</div>
                </div>
                <div class="flaw-metric-box">
                  <div class="f-lbl">Expected Baseline</div>
                  <div class="f-val" id="flaw-metric-exp">50.0% switches</div>
                </div>
                <div class="flaw-metric-box">
                  <div class="f-lbl">Statistical P-Value</div>
                  <div class="f-val f-val-p" id="flaw-metric-p">&lt; 0.005</div>
                </div>
              </div>
            </div>

            <!-- Entropy Loss Breakdown Table -->
            <div class="autopsy-section">
              <div class="section-title">📉 ENTROPY LOSS WATERFALL BREAKDOWN</div>
              <div class="waterfall-table">
                <div class="wf-row">
                  <span class="wf-label">Theoretical Maximum Entropy:</span>
                  <span class="wf-val wf-val-max" id="wf-max-entropy">1.000 bits / key</span>
                </div>
                <div class="wf-row">
                  <span class="wf-label" id="wf-primary-loss-label">Loss from Alternation / Markov Bias:</span>
                  <span class="wf-val wf-val-loss" id="wf-primary-loss">-0.192 bits</span>
                </div>
                <div class="wf-row">
                  <span class="wf-label">Loss from High-Order Predictability:</span>
                  <span class="wf-val wf-val-loss" id="wf-secondary-loss">-0.065 bits</span>
                </div>
                <div class="wf-row wf-row-total">
                  <span class="wf-label">Your Effective Entropy Rate:</span>
                  <span class="wf-val wf-val-final" id="wf-final-entropy">0.743 bits / key (74.3% efficiency)</span>
                </div>
              </div>
            </div>

            <!-- Sequential Evidence Summary -->
            <div class="autopsy-section">
              <div class="section-title">🔬 SEQUENTIAL SPRT EVIDENCE</div>
              <div class="sprt-summary-grid">
                <div class="sprt-box">
                  <div class="s-lbl">Keystrokes Survived</div>
                  <div class="s-val" id="sprt-keys-survived">42 keys</div>
                </div>
                <div class="sprt-box">
                  <div class="s-lbl">Evidence Wealth (M)</div>
                  <div class="s-val" id="sprt-martingale-wealth">104.2×</div>
                </div>
                <div class="sprt-box">
                  <div class="s-lbl">AI Predictor Accuracy</div>
                  <div class="s-val" id="sprt-ai-accuracy">64.3% (vs 50% chance)</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-autopsy-inspect">Inspect Dashboard</button>
            <button class="btn btn-primary" id="btn-autopsy-retry">🔄 Try Again</button>
            <button class="btn btn-accent" id="btn-autopsy-prng">⚡ Simulate True PRNG</button>
          </div>
        </div>
      </div>
    `;

    this.backdrop = this.container.querySelector('#halt-modal-backdrop');
    this.closeBtn = this.container.querySelector('#halt-modal-close');
    this.inspectBtn = this.container.querySelector('#btn-autopsy-inspect');
    this.retryBtn = this.container.querySelector('#btn-autopsy-retry');
    this.prngBtn = this.container.querySelector('#btn-autopsy-prng');

    this.verdictSub = this.container.querySelector('#halt-verdict-sub');
    this.flawTitle = this.container.querySelector('#flaw-title');
    this.flawSubtitle = this.container.querySelector('#flaw-subtitle');
    this.flawExplanation = this.container.querySelector('#flaw-explanation');
    this.flawMetricObs = this.container.querySelector('#flaw-metric-obs');
    this.flawMetricExp = this.container.querySelector('#flaw-metric-exp');
    this.flawMetricP = this.container.querySelector('#flaw-metric-p');

    this.wfMaxEntropy = this.container.querySelector('#wf-max-entropy');
    this.wfPrimaryLossLabel = this.container.querySelector('#wf-primary-loss-label');
    this.wfPrimaryLoss = this.container.querySelector('#wf-primary-loss');
    this.wfSecondaryLoss = this.container.querySelector('#wf-secondary-loss');
    this.wfFinalEntropy = this.container.querySelector('#wf-final-entropy');

    this.sprtKeysSurvived = this.container.querySelector('#sprt-keys-survived');
    this.sprtMartingaleWealth = this.container.querySelector('#sprt-martingale-wealth');
    this.sprtAiAccuracy = this.container.querySelector('#sprt-ai-accuracy');

    // Attach button listeners
    this.closeBtn.addEventListener('click', () => this.hide());
    this.inspectBtn.addEventListener('click', () => this.hide());
    this.retryBtn.addEventListener('click', () => {
      this.hide();
      this.onReset();
    });
    this.prngBtn.addEventListener('click', () => {
      this.hide();
      this.onRunPRNG();
    });
  }

  /**
   * Open modal with autopsy report
   * @param {Object} report
   * @param {Object} config
   */
  show(report, config) {
    if (!report) return;

    const { primaryFlaw, keystrokeCount, finalEntropyRate, maxEntropy, totalBitsLost, martingaleWealth, pValUpper, aiAccuracy, baselineAccuracy } = report;

    this.verdictSub.textContent = `Null hypothesis of uniform randomness rejected (p < ${(pValUpper < 0.001 ? '0.001' : pValUpper.toFixed(3))}, α = 0.01)`;
    
    this.flawTitle.textContent = primaryFlaw.title;
    this.flawSubtitle.textContent = primaryFlaw.subtitle;
    this.flawExplanation.textContent = primaryFlaw.explanation;
    this.flawMetricObs.textContent = primaryFlaw.metric;
    this.flawMetricExp.textContent = primaryFlaw.expected;
    this.flawMetricP.textContent = primaryFlaw.pValue < 0.001 ? '< 0.001' : primaryFlaw.pValue.toFixed(3);

    // Waterfall table
    this.wfMaxEntropy.textContent = `${maxEntropy.toFixed(3)} ${config.unit}`;
    const primLoss = Math.min(totalBitsLost, primaryFlaw.bitsLostEstimate || (totalBitsLost * 0.7));
    const secLoss = Math.max(0, totalBitsLost - primLoss);

    this.wfPrimaryLossLabel.textContent = `Loss from ${primaryFlaw.title}:`;
    this.wfPrimaryLoss.textContent = `-${primLoss.toFixed(3)} bits`;
    this.wfSecondaryLoss.textContent = `-${secLoss.toFixed(3)} bits`;

    const efficiencyPct = ((finalEntropyRate / maxEntropy) * 100).toFixed(1);
    this.wfFinalEntropy.textContent = `${finalEntropyRate.toFixed(3)} ${config.unit} (${efficiencyPct}% efficiency)`;

    // SPRT summary
    this.sprtKeysSurvived.textContent = `${keystrokeCount} keys`;
    this.sprtMartingaleWealth.textContent = `${martingaleWealth < 1000 ? martingaleWealth.toFixed(1) : martingaleWealth.toExponential(1)}×`;
    
    const accPct = Math.round(aiAccuracy * 100);
    const basePct = Math.round(baselineAccuracy * 100);
    this.sprtAiAccuracy.textContent = `${accPct}% (vs ${basePct}% chance)`;

    this.backdrop.style.display = 'flex';
  }

  hide() {
    this.backdrop.style.display = 'none';
  }
}
