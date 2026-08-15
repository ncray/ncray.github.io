/**
 * Mathematical & Statistical Deep-Dive Details Component
 * Renders in-depth mathematical formulations, derivations, and real-time substituted values with LaTeX / KaTeX.
 */
export class MathDetails {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container;
    this.activeTab = 'martingales';
    this.isOpen = false;
    this.render();
    this.initKatex();
  }

  initKatex() {
    this.renderMath();
    // Re-check periodically for CDN script load
    const checkInterval = setInterval(() => {
      if (typeof renderMathInElement === 'function') {
        this.renderMath();
        clearInterval(checkInterval);
      }
    }, 200);
    setTimeout(() => clearInterval(checkInterval), 4000);
  }

  renderMath() {
    const target = this.container.querySelector('#math-details-content') || this.container;
    if (typeof renderMathInElement === 'function') {
      try {
        renderMathInElement(target, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false }
          ],
          ignoredTags: ['script', 'noscript', 'style', 'textarea', 'code'],
          throwOnError: false
        });
      } catch (e) {
        console.warn('KaTeX rendering notice:', e);
      }
    }
  }

  render() {
    this.container.innerHTML = `
      <section class="section-math-details" id="section-math-details">
        <div class="math-details-wrapper">
          <!-- Details Header & Toggle -->
          <div class="math-details-header">
            <div class="math-header-title-block">
              <span class="math-icon">📐</span>
              <div>
                <h2 class="math-header-title">MATHEMATICAL & STATISTICAL FOUNDATIONS</h2>
                <div class="math-header-subtitle">Live formula evaluations, formal derivations, and sequential SPRT mechanics</div>
              </div>
            </div>
            <button class="btn btn-sm btn-outline" id="btn-toggle-math-details">
              <span id="math-toggle-icon">▼</span> <span id="math-toggle-text">Show Math & Stats Details</span>
            </button>
          </div>

          <!-- Collapsible Content -->
          <div class="math-details-content" id="math-details-content" style="display: none;">
            <!-- Tab Navigation -->
            <div class="math-tabs" role="tablist">
              <button class="math-tab-btn active" data-tab="martingales">
                <span>⚡ 1. Test Martingales & Ville SPRT</span>
              </button>
              <button class="math-tab-btn" data-tab="entropy">
                <span>📊 2. Shannon & Conditional Entropy</span>
              </button>
              <button class="math-tab-btn" data-tab="frequency">
                <span>🎯 3. Chi-Square & Alternation Z-Score</span>
              </button>
              <button class="math-tab-btn" data-tab="runs">
                <span>📏 4. Run Lengths & Autocorrelation</span>
              </button>
            </div>

            <!-- Tab 1: Martingales & SPRT -->
            <div class="math-tab-pane active" id="pane-martingales">
              <div class="math-card-grid">
                <!-- Card 1.1: Sequential Hypothesis & E-Values -->
                <div class="math-card">
                  <div class="math-card-title">1.1 Sequential Hypothesis Formulation & E-Values</div>
                  <p class="math-text">
                    We test the null hypothesis \\(H_0: X_t \\sim \\text{Uniform}(K)\\) against the alternative \\(H_1: X_t \\sim Q(x_t \\mid x_{&lt;t})\\), where \\(Q\\) is an adaptive universal context-tree predictor.
                  </p>
                  <div class="formula-box">
                    <div class="formula-label">Likelihood Ratio Increment (E-Value):</div>
                    <div class="formula-eq">
                      \\[ e_t = \\frac{Q(x_t \\mid x_{&lt;t})}{P_0(x_t)} = K \\cdot Q(x_t \\mid x_{&lt;t}) \\]
                    </div>
                  </div>
                  <div class="live-eval-box" id="live-eval-evalue">
                    <!-- Populated dynamically -->
                  </div>
                </div>

                <!-- Card 1.2: Ensemble Test Martingale -->
                <div class="math-card">
                  <div class="math-card-title">1.2 Ensemble Test Martingale Wealth (M_N)</div>
                  <p class="math-text">
                    To detect diverse cognitive biases rapidly while preserving mathematical validity, we combine 4 specialized sub-martingales with fixed prior weights summing to 1:
                  </p>
                  <div class="formula-box">
                    <div class="formula-label">Convex Combination Test Martingale:</div>
                    <div class="formula-eq">
                      \\[ M_N = 0.30 M_N^{\\text{univ}} + 0.40 M_N^{\\text{alt}} + 0.15 M_N^{\\text{markov}} + 0.15 M_N^{\\text{mono}} \\]
                    </div>
                  </div>
                  <div class="live-eval-box" id="live-eval-martingale">
                    <!-- Populated dynamically -->
                  </div>
                </div>

                <!-- Card 1.3: Ville's Maximal Inequality -->
                <div class="math-card span-2">
                  <div class="math-card-title">1.3 Ville's Maximal Inequality (Strict Type I Error Bound)</div>
                  <p class="math-text">
                    Unlike classical fixed-sample tests that suffer from false-alarm inflation under continuous peeking, Jean Ville's 1939 maximal inequality guarantees exact Type I error control for any arbitrary stopping time \\(\\tau\\):
                  </p>
                  <div class="formula-box">
                    <div class="formula-eq">
                      \\[ \\mathbb{P}_{H_0}\\left( \\sup_{N \\ge 1} M_N \\ge \\frac{1}{\\alpha} \\right) \\le \\alpha \\implies p_{\\text{upper}} = \\min\\left(1.0, \\, \\frac{1}{M_N}\\right) \\]
                    </div>
                  </div>
                  <div class="live-eval-box" id="live-eval-ville">
                    <!-- Populated dynamically -->
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 2: Shannon & Conditional Entropy -->
            <div class="math-tab-pane" id="pane-entropy">
              <div class="math-card-grid">
                <!-- Card 2.1: Marginal Shannon Entropy H0 -->
                <div class="math-card">
                  <div class="math-card-title">2.1 Marginal Shannon Entropy (Order 0)</div>
                  <p class="math-text">
                    Measures single-symbol distribution spread. Achieves maximum \\(\\log_2(K)\\) if and only if each digit appears with equal probability \\(1/K\\).
                  </p>
                  <div class="formula-box">
                    <div class="formula-eq">
                      \\[ H_0(X) = -\\sum_{i=0}^{K-1} \\hat{p}_i \\log_2(\\hat{p}_i) \\]
                    </div>
                  </div>
                  <div class="live-eval-box" id="live-eval-h0">
                    <!-- Populated dynamically -->
                  </div>
                </div>

                <!-- Card 2.2: Markov 1st-Order Conditional Entropy H1 -->
                <div class="math-card">
                  <div class="math-card-title">2.2 Markov Conditional Entropy (Order 1)</div>
                  <p class="math-text">
                    Quantifies uncertainty in the next symbol given the immediate previous symbol \\(X_{t-1}\\). Any alternation or repeat bias causes \\(H_1 &lt; H_0\\).
                  </p>
                  <div class="formula-box">
                    <div class="formula-eq">
                      \\[ H(X_t \\mid X_{t-1}) = -\\sum_{i=0}^{K-1} \\hat{p}_i \\sum_{j=0}^{K-1} P(j \\mid i) \\log_2 P(j \\mid i) \\]
                    </div>
                  </div>
                  <div class="live-eval-box" id="live-eval-h1">
                    <!-- Populated dynamically -->
                  </div>
                </div>

                <!-- Card 2.3: Empirical Sequential Entropy Rate -->
                <div class="math-card span-2">
                  <div class="math-card-title">2.3 Sequential Empirical Cross-Entropy Rate (\\hat{H}_N)</div>
                  <p class="math-text">
                    The true empirical entropy rate achieved by the sequence under the multi-order universal context-tree predictor:
                  </p>
                  <div class="formula-box">
                    <div class="formula-eq">
                      \\[ \\hat{H}_N = \\frac{1}{N} \\sum_{t=1}^N -\\log_2 Q(x_t \\mid x_{&lt;t}) = H_{\\max} - \\frac{\\log_2(M_N^{\\text{univ}})}{N} \\]
                    </div>
                  </div>
                  <div class="live-eval-box" id="live-eval-hrate">
                    <!-- Populated dynamically -->
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 3: Frequency & Alternation -->
            <div class="math-tab-pane" id="pane-frequency">
              <div class="math-card-grid">
                <!-- Card 3.1: Chi-Square Goodness-of-Fit -->
                <div class="math-card">
                  <div class="math-card-title">3.1 Pearson \\(\\chi^2\\) Goodness-of-Fit Test</div>
                  <p class="math-text">
                    Compares observed marginal symbol counts \\(O_i\\) against theoretical uniform expectation \\(E_i = N/K\\) with \\(df = K - 1\\).
                  </p>
                  <div class="formula-box">
                    <div class="formula-eq">
                      \\[ \\chi^2 = \\sum_{i=0}^{K-1} \\frac{(O_i - N/K)^2}{N/K}, \\quad p = Q\\left(\\frac{K-1}{2}, \\, \\frac{\\chi^2}{2}\\right) \\]
                    </div>
                  </div>
                  <div class="live-eval-box" id="live-eval-chisq">
                    <!-- Populated dynamically -->
                  </div>
                </div>

                <!-- Card 3.2: Alternation Z-Score -->
                <div class="math-card">
                  <div class="math-card-title">3.2 Alternation Rate Z-Score (Gambler's Fallacy)</div>
                  <p class="math-text">
                    Evaluates the probability of switching symbols between consecutive keystrokes against the theoretical null probability \\(\\mu_0 = 1 - 1/K\\).
                  </p>
                  <div class="formula-box">
                    <div class="formula-eq">
                      \\[ Z = \\frac{\\hat{r}_{\\text{alt}} - \\mu_0}{\\sqrt{\\mu_0(1-\\mu_0)/(N-1)}}, \\quad p_{\\text{2-tail}} = 2(1 - \\Phi(|Z|)) \\]
                    </div>
                  </div>
                  <div class="live-eval-box" id="live-eval-zalt">
                    <!-- Populated dynamically -->
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 4: Run Lengths & Autocorrelation -->
            <div class="math-tab-pane" id="pane-runs">
              <div class="math-card-grid">
                <!-- Card 4.1: Geometric Run-Length Distribution -->
                <div class="math-card">
                  <div class="math-card-title">4.1 Geometric Run-Length / Streak Distribution</div>
                  <p class="math-text">
                    Under uniform i.i.d. randomness, streak lengths \\(L\\) follow a geometric distribution with continuation probability \\(p = 1/K\\) and stopping probability \\(1 - 1/K\\):
                  </p>
                  <div class="formula-box">
                    <div class="formula-eq">
                      \\[ \\mathbb{P}(L = k) = \\left(1 - \\frac{1}{K}\\right)\\left(\\frac{1}{K}\\right)^{k-1}, \\quad \\mathbb{E}[L] = \\frac{1}{1 - 1/K}, \\quad \\mathbb{E}[\\max L] \\approx \\log_K(N) \\]
                    </div>
                  </div>
                  <div class="live-eval-box" id="live-eval-runs">
                    <!-- Populated dynamically -->
                  </div>
                </div>

                <!-- Card 4.2: Serial Autocorrelation -->
                <div class="math-card">
                  <div class="math-card-title">4.2 Serial Pearson Autocorrelation (Lags 1–4)</div>
                  <p class="math-text">
                    Measures linear memory dependency between symbol \\(X_t\\) and past symbol \\(X_{t-k}\\). Under \\(H_0\\), \\(r_k \\sim \\mathcal{N}(0, 1/N)\\):
                  </p>
                  <div class="formula-box">
                    <div class="formula-eq">
                      \\[ r_k = \\frac{\\sum_{t=1}^{N-k} (x_t - \\bar{x})(x_{t+k} - \\bar{x})}{\\sum_{t=1}^N (x_t - \\bar{x})^2}, \\quad \\text{95\\% CI} = \\pm \\frac{1.96}{\\sqrt{N}} \\]
                    </div>
                  </div>
                  <div class="live-eval-box" id="live-eval-autocorr">
                    <!-- Populated dynamically -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    this.wrapper = this.container.querySelector('#section-math-details');
    this.content = this.container.querySelector('#math-details-content');
    this.toggleBtn = this.container.querySelector('#btn-toggle-math-details');
    this.toggleIcon = this.container.querySelector('#math-toggle-icon');
    this.toggleText = this.container.querySelector('#math-toggle-text');

    // Live boxes
    this.boxEValue = this.container.querySelector('#live-eval-evalue');
    this.boxMartingale = this.container.querySelector('#live-eval-martingale');
    this.boxVille = this.container.querySelector('#live-eval-ville');
    this.boxH0 = this.container.querySelector('#live-eval-h0');
    this.boxH1 = this.container.querySelector('#live-eval-h1');
    this.boxHRate = this.container.querySelector('#live-eval-hrate');
    this.boxChiSq = this.container.querySelector('#live-eval-chisq');
    this.boxZAlt = this.container.querySelector('#live-eval-zalt');
    this.boxRuns = this.container.querySelector('#live-eval-runs');
    this.boxAutocorr = this.container.querySelector('#live-eval-autocorr');

    // Toggle button listener
    this.toggleBtn.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      this.content.style.display = this.isOpen ? 'block' : 'none';
      this.toggleIcon.textContent = this.isOpen ? '▲' : '▼';
      this.toggleText.textContent = this.isOpen ? 'Hide Math & Stats Details' : 'Show Math & Stats Details';
      if (this.isOpen) {
        this.renderMath();
      }
    });

    // Tab switching
    this.container.querySelectorAll('.math-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    this.container.querySelectorAll('.math-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
    });
    this.container.querySelectorAll('.math-tab-pane').forEach(p => {
      p.classList.toggle('active', p.id === `pane-${tabName}`);
    });
    this.renderMath();
  }

  /**
   * Update live formula values from snapshot
   * @param {Object} snapshot
   */
  update(snapshot) {
    const { sequence, totalKeystrokes, config, entropy, martingale, aiPredictor, monobit, transitions, runs, ngrams } = snapshot;

    // 1.1 E-Value Live Box
    const latestSymbol = sequence.length > 0 ? sequence[sequence.length - 1] : '-';
    const latestProb = aiPredictor.probabilities ? aiPredictor.probabilities[sequence[sequence.length - 1]] || (1/config.radix) : (1/config.radix);
    const latestEVal = (config.radix * latestProb);

    this.boxEValue.innerHTML = `
      <div class="live-grid">
        <div class="live-item"><span class="lbl">Radix K:</span> <span class="val">${config.radix}</span></div>
        <div class="live-item"><span class="lbl">Latest Key:</span> <span class="val sym-tag">${latestSymbol}</span></div>
        <div class="live-item"><span class="lbl">Q(x<sub>t</sub> | x<sub>&lt;t</sub>):</span> <span class="val">${latestProb.toFixed(4)}</span></div>
        <div class="live-item"><span class="lbl">E-Value e<sub>t</sub>:</span> <span class="val val-accent">${latestEVal.toFixed(3)}×</span></div>
      </div>
      <div class="live-verdict">
        ${latestEVal > 1.05 
          ? `⚠️ Predictor favored '${latestSymbol}' (${(latestProb*100).toFixed(1)}% vs ${(config.theoreticalProb*100).toFixed(0)}% null) → Evidence accumulated (+${((latestEVal-1)*100).toFixed(0)}%).` 
          : `✓ Predictor was surprised by '${latestSymbol}' (${(latestProb*100).toFixed(1)}%) → Conforms to randomness.`}
      </div>
    `;

    // 1.2 Martingale Live Box
    this.boxMartingale.innerHTML = `
      <div class="live-grid">
        <div class="live-item"><span class="lbl">Steps (N):</span> <span class="val">${totalKeystrokes}</span></div>
        <div class="live-item"><span class="lbl">Ensemble M<sub>N</sub>:</span> <span class="val val-accent">${martingale.wealth < 1000 ? martingale.wealth.toFixed(2) : martingale.wealth.toExponential(2)}×</span></div>
        <div class="live-item"><span class="lbl">ln(M<sub>N</sub>):</span> <span class="val">${martingale.logWealth.toFixed(3)} nats</span></div>
        <div class="live-item"><span class="lbl">Integrity:</span> <span class="val">${martingale.integrity}%</span></div>
      </div>
    `;

    // 1.3 Ville Live Box
    const pValFormatted = martingale.pValUpper < 0.001 ? '< 0.001' : martingale.pValUpper.toFixed(4);
    this.boxVille.innerHTML = `
      <div class="live-grid">
        <div class="live-item"><span class="lbl">Significance &alpha;:</span> <span class="val">${martingale.alpha}</span></div>
        <div class="live-item"><span class="lbl">Halt Threshold &lambda; (1/&alpha;):</span> <span class="val">${martingale.threshold}×</span></div>
        <div class="live-item"><span class="lbl">Current Wealth M<sub>N</sub>:</span> <span class="val val-accent">${martingale.wealth.toFixed(2)}×</span></div>
        <div class="live-item"><span class="lbl">Ville p-value Upper Bound:</span> <span class="val val-p">${pValFormatted}</span></div>
      </div>
      <div class="live-verdict">
        ${martingale.wealth >= martingale.threshold 
          ? `⛔ Ville threshold breached: M<sub>N</sub> = ${martingale.wealth.toFixed(1)} ≥ ${martingale.threshold}. False rejection probability bounded by ${martingale.alpha}.` 
          : `✓ M<sub>N</sub> = ${martingale.wealth.toFixed(1)} < ${martingale.threshold}. Null hypothesis cannot be rejected.`}
      </div>
    `;

    // 2.1 Shannon H0 Live Box
    let h0Terms = '';
    for (let i = 0; i < Math.min(config.radix, 4); i++) {
      const p = monobit.proportions[i];
      const term = p > 0 ? -p * Math.log2(p) : 0;
      h0Terms += `p(${config.symbols[i]})=${p.toFixed(2)} [${term.toFixed(3)}b] `;
    }
    if (config.radix > 4) h0Terms += '...';

    this.boxH0.innerHTML = `
      <div class="live-grid">
        <div class="live-item"><span class="lbl">H<sub>0</sub>(X):</span> <span class="val val-accent">${entropy.H0.toFixed(4)} bits</span></div>
        <div class="live-item"><span class="lbl">Max H<sub>max</sub>:</span> <span class="val">${config.maxEntropyBits.toFixed(4)} bits</span></div>
        <div class="live-item"><span class="lbl">H<sub>0</sub> Efficiency:</span> <span class="val">${((entropy.H0/config.maxEntropyBits)*100).toFixed(1)}%</span></div>
        <div class="live-item"><span class="lbl">Lost from Bias:</span> <span class="val val-loss">-${Math.max(0, config.maxEntropyBits - entropy.H0).toFixed(4)} b</span></div>
      </div>
      <div class="live-terms">${h0Terms}</div>
    `;

    // 2.2 Markov H1 Live Box
    this.boxH1.innerHTML = `
      <div class="live-grid">
        <div class="live-item"><span class="lbl">H<sub>1</sub>(X<sub>t</sub> | X<sub>t-1</sub>):</span> <span class="val val-accent">${entropy.H1.toFixed(4)} bits</span></div>
        <div class="live-item"><span class="lbl">Marginal H<sub>0</sub>:</span> <span class="val">${entropy.H0.toFixed(4)} bits</span></div>
        <div class="live-item"><span class="lbl">Markov Redundancy:</span> <span class="val val-loss">-${Math.max(0, entropy.H0 - entropy.H1).toFixed(4)} b</span></div>
        <div class="live-item"><span class="lbl">H<sub>1</sub> Efficiency:</span> <span class="val">${((entropy.H1/config.maxEntropyBits)*100).toFixed(1)}%</span></div>
      </div>
    `;

    // 2.3 Sequential Rate Live Box
    this.boxHRate.innerHTML = `
      <div class="live-grid">
        <div class="live-item"><span class="lbl">Cumulative Ĥ<sub>N</sub>:</span> <span class="val val-accent">${entropy.cumulativeRate.toFixed(4)} bits/key</span></div>
        <div class="live-item"><span class="lbl">Theoretical Max:</span> <span class="val">${config.maxEntropyBits.toFixed(4)} bits/key</span></div>
        <div class="live-item"><span class="lbl">Entropy Deficit:</span> <span class="val val-loss">-${(config.maxEntropyBits - entropy.cumulativeRate).toFixed(4)} bits/key</span></div>
        <div class="live-item"><span class="lbl">Overall Efficiency:</span> <span class="val">${entropy.efficiency.toFixed(1)}%</span></div>
      </div>
    `;

    // 3.1 Chi-Square Live Box
    const chiPFormatted = monobit.pValue < 0.001 ? '< 0.001' : monobit.pValue.toFixed(4);
    this.boxChiSq.innerHTML = `
      <div class="live-grid">
        <div class="live-item"><span class="lbl">Degrees of Freedom:</span> <span class="val">${config.radix - 1}</span></div>
        <div class="live-item"><span class="lbl">Observed &chi;<sup>2</sup>:</span> <span class="val val-accent">${monobit.chiSquare.toFixed(3)}</span></div>
        <div class="live-item"><span class="lbl">&chi;<sup>2</sup> p-value:</span> <span class="val val-p">${chiPFormatted}</span></div>
        <div class="live-item"><span class="lbl">Max Proportional Dev:</span> <span class="val">${(monobit.maxDeviation*100).toFixed(1)}%</span></div>
      </div>
    `;

    // 3.2 Alternation Z-Score Live Box
    const zPFormatted = transitions.pValue < 0.001 ? '< 0.001' : transitions.pValue.toFixed(4);
    this.boxZAlt.innerHTML = `
      <div class="live-grid">
        <div class="live-item"><span class="lbl">Observed Alt Rate:</span> <span class="val val-accent">${(transitions.alternationRate*100).toFixed(1)}%</span></div>
        <div class="live-item"><span class="lbl">Expected &mu;<sub>0</sub>:</span> <span class="val">${(transitions.expectedAltRate*100).toFixed(1)}%</span></div>
        <div class="live-item"><span class="lbl">Z-Score:</span> <span class="val ${Math.abs(transitions.zScore) > 2 ? 'val-loss' : ''}">${transitions.zScore > 0 ? '+' : ''}${transitions.zScore.toFixed(2)}&sigma;</span></div>
        <div class="live-item"><span class="lbl">2-Tailed p-value:</span> <span class="val val-p">${zPFormatted}</span></div>
      </div>
    `;

    // 4.1 Runs Live Box
    this.boxRuns.innerHTML = `
      <div class="live-grid">
        <div class="live-item"><span class="lbl">Total Runs / Streaks:</span> <span class="val">${runs.totalRuns}</span></div>
        <div class="live-item"><span class="lbl">Observed Mean Run:</span> <span class="val">${runs.observedMeanRun.toFixed(2)} keys</span></div>
        <div class="live-item"><span class="lbl">Expected Mean Run:</span> <span class="val">${runs.theoreticalMeanRun.toFixed(2)} keys</span></div>
        <div class="live-item"><span class="lbl">Max Streak:</span> <span class="val">${runs.maxObservedRun} (expected ${runs.expectedMaxRun}+)</span></div>
      </div>
    `;

    // 4.2 Autocorrelation Live Box
    let acHtml = '';
    const ci95 = totalKeystrokes > 2 ? (1.96 / Math.sqrt(totalKeystrokes)).toFixed(2) : '1.00';
    for (const ac of ngrams.autocorrelations) {
      const isSig = Math.abs(ac.value) > (1.96 / Math.max(1, Math.sqrt(totalKeystrokes)));
      acHtml += `
        <div class="live-item">
          <span class="lbl">r<sub>${ac.lag}</sub> (Lag ${ac.lag}):</span>
          <span class="val ${isSig ? 'val-loss' : ''}">${ac.value > 0 ? '+' : ''}${ac.value.toFixed(3)} ${isSig ? '(p&lt;0.05)' : ''}</span>
        </div>
      `;
    }

    this.boxAutocorr.innerHTML = `
      <div class="live-grid">
        ${acHtml}
        <div class="live-item"><span class="lbl">95% Null Confidence Bound:</span> <span class="val">&plusmn;${ci95}</span></div>
      </div>
    `;
  }
}
