/**
 * Keypad & Keyboard Listener Component
 * Handles user input via physical keyboard or on-screen touch/click keypad.
 */
export class KeypadArena {
  /**
   * @param {HTMLElement} container
   * @param {Object} config
   * @param {(symbol: number) => void} onInput
   */
  constructor(container, config, onInput) {
    this.container = container;
    this.config = config;
    this.onInput = onInput;
    this.isEnabled = true;
    this.audioCtx = null;
    this.soundEnabled = true;

    this.render();
    this.setupListeners();
  }

  setConfig(config) {
    this.config = config;
    this.render();
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    const buttons = this.container.querySelectorAll('.key-btn');
    buttons.forEach(btn => {
      btn.disabled = !enabled;
      if (!enabled) {
        btn.classList.add('disabled');
      } else {
        btn.classList.remove('disabled');
      }
    });
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  playKeySound(symbol) {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      // Pitch based on symbol
      const baseFreq = this.config.radix === 2 ? (symbol === 0 ? 320 : 440) : (240 + symbol * 40);
      osc.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {
      // Audio context might be restricted
    }
  }

  playHaltSound() {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.frequency.setValueAtTime(180, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.audioCtx.currentTime + 0.4);
      osc.type = 'sawtooth';

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.4);
    } catch (e) {}
  }

  render() {
    const isBinary = this.config.radix === 2;
    
    let keypadHtml = '';
    if (isBinary) {
      keypadHtml = `
        <div class="binary-keypad">
          <button class="key-btn binary-btn key-0" data-key="0" id="btn-key-0">
            <span class="key-symbol">0</span>
            <span class="key-hint">Press 0</span>
          </button>
          <button class="key-btn binary-btn key-1" data-key="1" id="btn-key-1">
            <span class="key-symbol">1</span>
            <span class="key-hint">Press 1</span>
          </button>
        </div>
      `;
    } else {
      // 10-digit numpad layout
      keypadHtml = `
        <div class="decimal-keypad">
          <div class="numpad-grid">
            <button class="key-btn decimal-btn" data-key="7"><span>7</span></button>
            <button class="key-btn decimal-btn" data-key="8"><span>8</span></button>
            <button class="key-btn decimal-btn" data-key="9"><span>9</span></button>
            <button class="key-btn decimal-btn" data-key="4"><span>4</span></button>
            <button class="key-btn decimal-btn" data-key="5"><span>5</span></button>
            <button class="key-btn decimal-btn" data-key="6"><span>6</span></button>
            <button class="key-btn decimal-btn" data-key="1"><span>1</span></button>
            <button class="key-btn decimal-btn" data-key="2"><span>2</span></button>
            <button class="key-btn decimal-btn" data-key="3"><span>3</span></button>
            <button class="key-btn decimal-btn key-0-span" data-key="0"><span>0</span></button>
          </div>
          <div class="keypad-hint">Use physical keyboard keys 0–9 or click buttons</div>
        </div>
      `;
    }

    this.container.innerHTML = keypadHtml;

    // Attach click events
    this.container.querySelectorAll('.key-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!this.isEnabled) return;
        const key = parseInt(btn.getAttribute('data-key'), 10);
        this.triggerKey(key, btn);
      });
    });
  }

  triggerKey(key, btnElement = null) {
    if (!this.isEnabled) return;
    if (isNaN(key) || key < 0 || key >= this.config.radix) return;

    // Animate button if found
    const targetBtn = btnElement || this.container.querySelector(`.key-btn[data-key="${key}"]`);
    if (targetBtn) {
      targetBtn.classList.remove('pressed');
      // Trigger reflow
      void targetBtn.offsetWidth;
      targetBtn.classList.add('pressed');
      setTimeout(() => targetBtn.classList.remove('pressed'), 120);
    }

    this.playKeySound(key);
    this.onInput(key);
  }

  setupListeners() {
    this.boundKeyDown = (e) => {
      if (!this.isEnabled) return;
      
      // Ignore if user is inside an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      const key = e.key;
      if (this.config.allowedKeys.includes(key)) {
        e.preventDefault();
        const num = parseInt(key, 10);
        this.triggerKey(num);
      }
    };

    window.addEventListener('keydown', this.boundKeyDown);
  }

  destroy() {
    if (this.boundKeyDown) {
      window.removeEventListener('keydown', this.boundKeyDown);
    }
  }
}
