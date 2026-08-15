/**
 * Real-Time Diagnostic Visualizations Grid
 * 4 Interactive Diagnostic Cards:
 * 1. Frequency Distribution (Observed vs Expected Uniform)
 * 2. Transition Matrix Heatmap & Alternation Dynamics
 * 3. Streak / Run-Length Histogram (Observed vs Theoretical Geometric Curve)
 * 4. Pattern Radar & Autocorrelation Lag Sparklines
 */
export class DiagnosticCharts {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="diagnostic-grid">
        <!-- Card 1: Frequency Distribution -->
        <div class="diag-card" id="card-freq">
          <div class="diag-card-header">
            <div class="diag-card-title">
              <span class="diag-icon">📊</span>
              <span>1. MARGINAL FREQUENCY (MONOBIT)</span>
            </div>
            <div class="diag-meta" id="freq-meta">χ²: 0.00 (p = 1.00)</div>
          </div>
          <div class="diag-body">
            <div class="chart-container" id="freq-chart-container">
              <!-- Dynamically populated bars -->
            </div>
            <div class="chart-caption" id="freq-caption">
              Dashed line represents theoretical uniform probability.
            </div>
          </div>
        </div>

        <!-- Card 2: Markov Transitions & Alternation -->
        <div class="diag-card" id="card-transitions">
          <div class="diag-card-header">
            <div class="diag-card-title">
              <span class="diag-icon">🔄</span>
              <span>2. MARKOV TRANSITIONS & ALTERNATION</span>
            </div>
            <div class="diag-meta" id="trans-meta">Alternation: 50.0%</div>
          </div>
          <div class="diag-body">
            <div class="transitions-wrapper" id="transitions-wrapper">
              <!-- Heatmap / matrix grid -->
            </div>
            <div class="chart-caption" id="trans-caption">
              Transition probabilities P(next | previous).
            </div>
          </div>
        </div>

        <!-- Card 3: Streak / Run-Length Histogram -->
        <div class="diag-card" id="card-runs">
          <div class="diag-card-header">
            <div class="diag-card-title">
              <span class="diag-icon">📏</span>
              <span>3. STREAK / RUN-LENGTH SPECTRUM</span>
            </div>
            <div class="diag-meta" id="runs-meta">Max Streak: 0 (Exp: 0)</div>
          </div>
          <div class="diag-body">
            <div class="chart-container" id="runs-chart-container">
              <!-- Dynamically populated run histogram -->
            </div>
            <div class="chart-caption" id="runs-caption">
              Observed streaks vs expected Geometric decay curve (2⁻ᵏ).
            </div>
          </div>
        </div>

        <!-- Card 4: Pattern Radar & Autocorrelation -->
        <div class="diag-card" id="card-patterns">
          <div class="diag-card-header">
            <div class="diag-card-title">
              <span class="diag-icon">🎯</span>
              <span>4. PATTERN RADAR & AUTOCORRELATION</span>
            </div>
            <div class="diag-meta" id="patterns-meta">Lags: 1..4</div>
          </div>
          <div class="diag-body">
            <div class="patterns-wrapper" id="patterns-wrapper">
              <!-- Patterns & Autocorrelation bars -->
            </div>
            <div class="chart-caption" id="patterns-caption">
              Serial lag correlation and over-represented n-gram cycles.
            </div>
          </div>
        </div>
      </div>
    `;

    this.freqContainer = this.container.querySelector('#freq-chart-container');
    this.freqMeta = this.container.querySelector('#freq-meta');
    this.freqCaption = this.container.querySelector('#freq-caption');

    this.transWrapper = this.container.querySelector('#transitions-wrapper');
    this.transMeta = this.container.querySelector('#trans-meta');
    this.transCaption = this.container.querySelector('#trans-caption');

    this.runsContainer = this.container.querySelector('#runs-chart-container');
    this.runsMeta = this.container.querySelector('#runs-meta');
    this.runsCaption = this.container.querySelector('#runs-caption');

    this.patternsWrapper = this.container.querySelector('#patterns-wrapper');
    this.patternsMeta = this.container.querySelector('#patterns-meta');
    this.patternsCaption = this.container.querySelector('#patterns-caption');
  }

  /**
   * Update all diagnostic cards
   * @param {Object} snapshot
   */
  update(snapshot) {
    this.updateFrequency(snapshot);
    this.updateTransitions(snapshot);
    this.updateRuns(snapshot);
    this.updatePatterns(snapshot);
  }

  updateFrequency(snapshot) {
    const { monobit, config, totalKeystrokes } = snapshot;
    const { counts, proportions, chiSquare, pValue } = monobit;

    const pValFormatted = pValue < 0.001 ? '< 0.001' : pValue.toFixed(3);
    this.freqMeta.innerHTML = `χ²: <strong>${chiSquare.toFixed(2)}</strong> (p = <strong>${pValFormatted}</strong>)`;

    if (totalKeystrokes === 0) {
      this.freqContainer.innerHTML = `<div class="chart-empty">Awaiting data...</div>`;
      return;
    }

    const expectedPct = config.theoreticalProb * 100;
    const maxPct = Math.max(expectedPct * 1.6, ...proportions.map(p => p * 100), 20);

    let html = `<div class="bar-chart-grid ${config.radix === 10 ? 'grid-10' : 'grid-2'}">`;
    for (let i = 0; i < config.radix; i++) {
      const sym = config.symbols[i];
      const count = counts[i];
      const pct = (proportions[i] * 100);
      const barHeightPct = (pct / maxPct) * 100;
      const expHeightPct = (expectedPct / maxPct) * 100;

      // Color coding deviation
      const diff = Math.abs(pct - expectedPct);
      let barClass = 'bar-normal';
      if (diff > 15) barClass = 'bar-deviant-high';
      else if (diff > 8) barClass = 'bar-deviant-mid';

      html += `
        <div class="bar-col">
          <div class="bar-val-label">${pct.toFixed(0)}%</div>
          <div class="bar-track">
            <div class="bar-baseline-line" style="bottom: ${expHeightPct}%;" title="Expected: ${expectedPct.toFixed(1)}%"></div>
            <div class="bar-fill ${barClass}" style="height: ${barHeightPct}%;"></div>
          </div>
          <div class="bar-sym-label">${sym} <span class="sym-count">(${count})</span></div>
        </div>
      `;
    }
    html += `</div>`;

    this.freqContainer.innerHTML = html;
  }

  updateTransitions(snapshot) {
    const { transitions, config, totalKeystrokes } = snapshot;
    const { probMatrix, alternationRate, expectedAltRate, zScore, pValue } = transitions;

    const altPct = (alternationRate * 100).toFixed(1);
    const expAltPct = (expectedAltRate * 100).toFixed(1);
    
    this.transMeta.innerHTML = `Alt Rate: <strong>${altPct}%</strong> (exp: ${expAltPct}%)`;

    if (totalKeystrokes < 2) {
      this.transWrapper.innerHTML = `<div class="chart-empty">Need at least 2 keystrokes for transitions...</div>`;
      return;
    }

    if (config.radix === 2) {
      // Binary 2x2 Matrix + Alternation Gauge
      const p00 = (probMatrix[0][0] * 100).toFixed(0);
      const p01 = (probMatrix[0][1] * 100).toFixed(0);
      const p10 = (probMatrix[1][0] * 100).toFixed(0);
      const p11 = (probMatrix[1][1] * 100).toFixed(0);

      const isHighAlt = alternationRate > 0.58;
      const isLowAlt = alternationRate < 0.42;

      this.transWrapper.innerHTML = `
        <div class="binary-trans-layout">
          <div class="matrix-2x2">
            <div class="matrix-header-cell">From \\ To</div>
            <div class="matrix-header-cell">→ 0</div>
            <div class="matrix-header-cell">→ 1</div>
            
            <div class="matrix-row-label">0 →</div>
            <div class="matrix-cell ${p00 > 58 ? 'cell-hot' : ''} ${p00 < 42 ? 'cell-cold' : ''}">${p00}%</div>
            <div class="matrix-cell ${p01 > 58 ? 'cell-hot' : ''} ${p01 < 42 ? 'cell-cold' : ''}">${p01}%</div>
            
            <div class="matrix-row-label">1 →</div>
            <div class="matrix-cell ${p10 > 58 ? 'cell-hot' : ''} ${p10 < 42 ? 'cell-cold' : ''}">${p10}%</div>
            <div class="matrix-cell ${p11 > 58 ? 'cell-hot' : ''} ${p11 < 42 ? 'cell-cold' : ''}">${p11}%</div>
          </div>
          <div class="alt-meter-card">
            <div class="alt-meter-title">Alternation Bias (Gambler's Fallacy)</div>
            <div class="alt-meter-track">
              <div class="alt-meter-marker-expected" style="left: 50%;"></div>
              <div class="alt-meter-needle" style="left: ${Math.max(0, Math.min(100, alternationRate * 100))}%;"></div>
            </div>
            <div class="alt-labels">
              <span>0% (Clustered)</span>
              <span class="center-tag">50% (True Random)</span>
              <span>100% (Alternating)</span>
            </div>
            <div class="alt-verdict ${isHighAlt ? 'tag-warn' : (isLowAlt ? 'tag-warn' : 'tag-good')}">
              ${isHighAlt ? '⚠️ Alternating too much (Avoids streaks)' : (isLowAlt ? '⚠️ Clumping too much' : '✓ Normal switching')}
            </div>
          </div>
        </div>
      `;
    } else {
      // Decimal 10x10 Mini Heatmap
      let html = `<div class="heatmap-10x10">`;
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          const prob = probMatrix[i][j];
          const pct = Math.round(prob * 100);
          // 10% is expected. High is > 20%, low is 0%
          const intensity = Math.min(1, prob / 0.35);
          html += `
            <div class="hm-cell" style="--cell-alpha: ${intensity};" title="${i} → ${j}: ${pct}% (count: ${transitions.matrixCounts[i][j]})">
              ${pct > 0 ? pct : ''}
            </div>
          `;
        }
      }
      html += `</div>`;
      this.transWrapper.innerHTML = html;
    }
  }

  updateRuns(snapshot) {
    const { runs, config, totalKeystrokes } = snapshot;
    const { bins, maxObservedRun, expectedMaxRun, isStreakStarved } = runs;

    this.runsMeta.innerHTML = `Max Streak: <strong>${maxObservedRun}</strong> (exp: <strong>${expectedMaxRun}+</strong>)`;

    if (totalKeystrokes === 0) {
      this.runsContainer.innerHTML = `<div class="chart-empty">Awaiting streak data...</div>`;
      return;
    }

    const maxCount = Math.max(1, ...bins.map(b => Math.max(b.count, b.expectedCount)));

    let html = `<div class="runs-chart-grid">`;
    for (const bin of bins) {
      const obsHeight = (bin.count / maxCount) * 100;
      const expHeight = (bin.expectedCount / maxCount) * 100;

      html += `
        <div class="run-col">
          <div class="run-val-label">${bin.count} <span class="exp-sub">(${bin.expectedCount.toFixed(1)})</span></div>
          <div class="run-track">
            <div class="run-exp-fill" style="height: ${expHeight}%;" title="Theoretical expected count: ${bin.expectedCount.toFixed(1)}"></div>
            <div class="run-obs-fill" style="height: ${obsHeight}%;" title="Observed: ${bin.count}"></div>
          </div>
          <div class="run-label">Len ${bin.label}</div>
        </div>
      `;
    }
    html += `</div>`;

    if (isStreakStarved) {
      html += `
        <div class="alert-inline alert-warn">
          ⚠️ Streak Starvation: You have typed ${totalKeystrokes} keys with max streak ${maxObservedRun}. Long streaks (4+) are overdue!
        </div>
      `;
    }

    this.runsContainer.innerHTML = html;
  }

  updatePatterns(snapshot) {
    const { ngrams, totalKeystrokes } = snapshot;
    const { topPatterns, autocorrelations, activeCycle } = ngrams;

    if (totalKeystrokes < 6) {
      this.patternsWrapper.innerHTML = `<div class="chart-empty">Analyzing n-gram rhythms and lag correlation...</div>`;
      return;
    }

    let html = `<div class="patterns-layout">`;

    // 1. Autocorrelation Bars (Lag 1 to 4)
    html += `<div class="autocorr-box">`;
    html += `<div class="box-title">Lag Autocorrelation (rₖ)</div>`;
    html += `<div class="autocorr-grid">`;
    for (const ac of autocorrelations) {
      const val = ac.value;
      const pct = Math.min(100, Math.abs(val) * 100);
      const isPositive = val >= 0;
      const isSig = Math.abs(val) > 0.30;

      html += `
        <div class="autocorr-item">
          <div class="ac-label">Lag ${ac.lag}</div>
          <div class="ac-bar-track">
            <div class="ac-bar-center"></div>
            <div class="ac-bar-fill ${isPositive ? 'ac-pos' : 'ac-neg'} ${isSig ? 'ac-sig' : ''}" 
                 style="width: ${pct / 2}%; ${isPositive ? 'left: 50%;' : 'right: 50%;'}"></div>
          </div>
          <div class="ac-val ${isSig ? 'ac-val-sig' : ''}">${val > 0 ? '+' : ''}${val.toFixed(2)}</div>
        </div>
      `;
    }
    html += `</div></div>`;

    // 2. Detected Repetitive N-Grams or Cycle
    html += `<div class="top-patterns-box">`;
    html += `<div class="box-title">Detected Recurring Sub-Patterns</div>`;

    if (activeCycle) {
      html += `
        <div class="cycle-detected-badge">
          🚨 Periodic Cycle Detected: Pattern '<strong>${activeCycle.pattern}</strong>' repeating!
        </div>
      `;
    }

    if (topPatterns.length === 0 && !activeCycle) {
      html += `<div class="no-patterns-msg">No repetitive n-gram loops detected yet. Good variety!</div>`;
    } else {
      html += `<div class="pattern-pill-list">`;
      for (const pat of topPatterns) {
        html += `
          <div class="pattern-pill">
            <span class="pattern-str">${pat.pattern}</span>
            <span class="pattern-count">${pat.count}× (${pat.ratio.toFixed(1)}× expected)</span>
          </div>
        `;
      }
      html += `</div>`;
    }

    html += `</div></div>`;

    this.patternsWrapper.innerHTML = html;
  }
}
