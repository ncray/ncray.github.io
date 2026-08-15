/**
 * Sequence Tape / Ribbon Component
 * Renders the real-time stream of entered symbols with streak grouping and hit/miss indicators.
 */
export class SequenceRibbon {
  /**
   * @param {HTMLElement} container
   */
  constructor(container) {
    this.container = container;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="tape-wrapper">
        <div class="tape-header">
          <div class="tape-title">
            <span class="pulse-dot"></span>
            <span>LIVE SEQUENCE STREAM</span>
          </div>
          <div class="tape-meta">
            <span class="badge" id="tape-count-badge">0 keys</span>
            <span class="badge" id="tape-streak-badge">Streak: 0</span>
          </div>
        </div>
        <div class="tape-track-container">
          <div class="tape-track" id="tape-track">
            <div class="tape-placeholder">Awaiting first keystroke... (Use 0/1 or keys on your keyboard)</div>
          </div>
        </div>
      </div>
    `;

    this.trackEl = this.container.querySelector('#tape-track');
    this.countBadge = this.container.querySelector('#tape-count-badge');
    this.streakBadge = this.container.querySelector('#tape-streak-badge');
  }

  /**
   * Update ribbon with current sequence and run info
   * @param {number[]} sequence
   * @param {Object} runsStats
   */
  update(sequence, runsStats) {
    this.countBadge.textContent = `${sequence.length} key${sequence.length === 1 ? '' : 's'}`;
    
    if (runsStats && runsStats.currentRun) {
      const curRun = runsStats.currentRun;
      this.streakBadge.textContent = curRun.length > 1 
        ? `Streak: ${curRun.length} × '${curRun.symbol}'` 
        : `Streak: 1`;
      if (curRun.length >= 4) {
        this.streakBadge.classList.add('streak-hot');
      } else {
        this.streakBadge.classList.remove('streak-hot');
      }
    }

    if (sequence.length === 0) {
      this.trackEl.innerHTML = `<div class="tape-placeholder">Awaiting keystrokes... (Press keys on keyboard or click below)</div>`;
      return;
    }

    // Keep last 40 symbols rendered in track for smooth performance
    const visibleLength = Math.min(40, sequence.length);
    const startIndex = sequence.length - visibleLength;
    const visibleSeq = sequence.slice(startIndex);

    let html = '';
    for (let i = 0; i < visibleSeq.length; i++) {
      const sym = visibleSeq[i];
      const actualIndex = startIndex + i;
      const isLatest = (i === visibleSeq.length - 1);
      
      // Check if repeating previous symbol
      const isRepeat = (i > 0 && sym === visibleSeq[i - 1]);

      html += `
        <div class="tape-cell sym-${sym} ${isLatest ? 'cell-latest' : ''} ${isRepeat ? 'cell-repeat' : ''}" data-idx="${actualIndex}">
          <span class="cell-num">${sym}</span>
        </div>
      `;
    }

    this.trackEl.innerHTML = html;

    // Auto-scroll to end
    this.trackEl.scrollLeft = this.trackEl.scrollWidth;
  }
}
