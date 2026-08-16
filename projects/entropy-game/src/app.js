import { MODES } from './engine/types.js';
import { EntropyEngine } from './engine/diagnostics.js';
import { SimulationEngine } from './engine/simulator.js';
import { KeypadArena } from './ui/keypad.js';
import { SequenceRibbon } from './ui/sequence-ribbon.js';
import { HeroMetrics } from './ui/hero-metrics.js';
import { DiagnosticCharts } from './ui/diagnostic-charts.js';
import { HaltAutopsyModal } from './ui/halt-modal.js';
import { SettingsModal } from './ui/settings-modal.js';
import { MathDetails } from './ui/math-details.js';

class App {
  constructor() {
    this.currentMode = MODES.BINARY;
    this.alpha = 0.01;
    this.minKeys = 15;
    this.soundEnabled = true;
    this.simInterval = null;

    this.engine = new EntropyEngine(this.currentMode, this.alpha, this.minKeys);

    this.initUI();
    this.updateAll();
  }

  initUI() {
    // Mode switcher buttons
    this.btnModeBinary = document.getElementById('btn-mode-binary');
    this.btnModeDecimal = document.getElementById('btn-mode-decimal');
    this.btnReset = document.getElementById('btn-reset');
    this.btnSettings = document.getElementById('btn-settings');
    this.btnSimPRNG = document.getElementById('btn-sim-prng');
    this.btnSimBot = document.getElementById('btn-sim-bot');
    this.simBotSelect = document.getElementById('sim-bot-select');

    // UI Containers
    this.heroContainer = document.getElementById('hero-metrics-mount');
    this.ribbonContainer = document.getElementById('sequence-ribbon-mount');
    this.keypadContainer = document.getElementById('keypad-mount');
    this.chartsContainer = document.getElementById('diagnostic-charts-mount');
    this.mathContainer = document.getElementById('math-details-mount');
    this.modalMount = document.getElementById('modal-mount');

    // Initialize Component Instances
    this.heroMetrics = new HeroMetrics(this.heroContainer);
    this.ribbon = new SequenceRibbon(this.ribbonContainer);
    this.diagnosticCharts = new DiagnosticCharts(this.chartsContainer);
    this.mathDetails = new MathDetails(this.mathContainer);

    this.keypad = new KeypadArena(
      this.keypadContainer,
      this.engine.config,
      (symbol) => this.handleInput(symbol)
    );

    this.haltModal = new HaltAutopsyModal(this.modalMount, {
      onReset: () => this.resetSession(),
      onRunPRNG: () => this.runSimulation('prng')
    });

    this.settingsModal = new SettingsModal(this.modalMount, {
      onSave: (settings) => this.applySettings(settings)
    });

    this.prngBtnIcon = document.getElementById('prng-btn-icon');
    this.prngBtnText = document.getElementById('prng-btn-text');
    this.simBotBtnText = document.getElementById('sim-bot-btn-text');
    this.simSpeedSelect = document.getElementById('sim-speed-select');
    this.isSimulating = false;
    this.currentSimType = null;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Mode switching
    this.btnModeBinary.addEventListener('click', () => this.switchMode(MODES.BINARY));
    this.btnModeDecimal.addEventListener('click', () => this.switchMode(MODES.DECIMAL));

    // Reset session
    this.btnReset.addEventListener('click', () => this.resetSession());

    // Settings
    this.btnSettings.addEventListener('click', () => {
      this.settingsModal.show({
        alpha: this.alpha,
        minKeys: this.minKeys,
        sound: this.soundEnabled
      });
    });

    // PRNG Simulation (Infinite toggle)
    this.btnSimPRNG.addEventListener('click', () => {
      if (this.isSimulating && this.currentSimType === 'prng') {
        this.stopSimulation();
      } else {
        this.runSimulation('prng');
      }
    });

    // Bot Simulation
    this.btnSimBot.addEventListener('click', () => {
      const botType = this.simBotSelect.value;
      if (this.isSimulating && this.currentSimType === botType) {
        this.stopSimulation();
      } else {
        this.runSimulation(botType);
      }
    });

    // Header Math Details toggle
    const btnHeaderMath = document.getElementById('btn-header-math');
    if (btnHeaderMath) {
      btnHeaderMath.addEventListener('click', () => {
        if (!this.mathDetails.isOpen) {
          this.mathDetails.toggleBtn.click();
        }
        document.getElementById('section-math-details')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  switchMode(newMode) {
    if (this.isSimulating) this.stopSimulation();
    this.currentMode = newMode;
    this.engine.setMode(newMode);

    if (newMode === MODES.BINARY) {
      this.btnModeBinary.classList.add('active');
      this.btnModeDecimal.classList.remove('active');
    } else {
      this.btnModeBinary.classList.remove('active');
      this.btnModeDecimal.classList.add('active');
    }

    this.keypad.setConfig(this.engine.config);
    this.resetSession();
  }

  handleInput(symbol) {
    if (this.engine.isHalted) return;

    const snapshot = this.engine.processKeystroke(symbol);
    this.updateAll(snapshot);

    if (snapshot.isHalted) {
      if (this.isSimulating) this.stopSimulation();
      this.keypad.playHaltSound();
      this.keypad.setEnabled(false);
      setTimeout(() => {
        this.haltModal.show(snapshot.haltReport, snapshot.config);
      }, 350);
    }
  }

  updateAll(snapshot = null) {
    const data = snapshot || this.engine.getSnapshot();
    this.heroMetrics.update(data);
    this.ribbon.update(data.sequence, data.runs);
    this.diagnosticCharts.update(data);
    this.mathDetails.update(data);
  }

  resetSession() {
    if (this.isSimulating) this.stopSimulation();
    this.engine.reset();
    this.keypad.setEnabled(true);
    this.updateAll();
  }

  applySettings(settings) {
    this.alpha = settings.alpha;
    this.minKeys = settings.minKeys;
    this.soundEnabled = settings.sound;

    this.engine.setAlpha(this.alpha);
    this.engine.setMinKeys(this.minKeys);
    this.keypad.setSoundEnabled(this.soundEnabled);
    this.updateAll();
  }

  runSimulation(type) {
    this.stopSimulation();
    this.resetSession();

    this.isSimulating = true;
    this.currentSimType = type;
    
    // PRNG runs infinitely; biased bots run until halt or up to 300 steps
    const isInfinitePRNG = (type === 'prng');
    const maxSteps = isInfinitePRNG ? Infinity : 300;
    const speedMs = parseInt(this.simSpeedSelect?.value || '90', 10);
    const radix = this.engine.config.radix;

    // Update UI button states
    if (isInfinitePRNG) {
      this.btnSimPRNG.classList.add('btn-sim-active');
      if (this.prngBtnIcon) this.prngBtnIcon.textContent = '⏹';
      if (this.prngBtnText) this.prngBtnText.textContent = 'Stop PRNG';
    } else {
      this.btnSimBot.classList.add('btn-sim-active');
      if (this.simBotBtnText) this.simBotBtnText.textContent = 'Stop Bot';
    }

    let stepCount = 0;
    let prev = null;

    this.simInterval = setInterval(() => {
      if (stepCount >= maxSteps || this.engine.isHalted) {
        this.stopSimulation();
        return;
      }

      let sym;
      if (type === 'prng') {
        sym = SimulationEngine.getTrueRandom(radix);
      } else if (type === 'gambler') {
        sym = SimulationEngine.getGamblerFallacy(prev, radix);
      } else if (type === 'rhythm') {
        sym = SimulationEngine.getRhythmPattern(stepCount, radix);
      } else if (type === 'counting') {
        sym = SimulationEngine.getCountingPattern(prev, radix);
      } else {
        sym = SimulationEngine.getTrueRandom(radix);
      }

      prev = sym;
      stepCount++;
      this.keypad.triggerKey(sym);
    }, speedMs);
  }

  stopSimulation() {
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
    this.isSimulating = false;
    this.currentSimType = null;

    // Reset button states
    this.btnSimPRNG.classList.remove('btn-sim-active');
    if (this.prngBtnIcon) this.prngBtnIcon.textContent = '⚡';
    if (this.prngBtnText) this.prngBtnText.textContent = 'Infinite PRNG Bot';

    this.btnSimBot.classList.remove('btn-sim-active');
    if (this.simBotBtnText) this.simBotBtnText.textContent = 'Run Bot';
  }
}

// Boot application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();

  const renderGlobalMath = () => {
    if (typeof renderMathInElement === 'function') {
      try {
        renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '$', right: '$', display: false }
          ],
          ignoredTags: ['script', 'noscript', 'style', 'textarea', 'code', 'pre'],
          throwOnError: false
        });
      } catch (e) {
        console.warn('KaTeX render warning:', e);
      }
      return true;
    }
    return false;
  };

  if (!renderGlobalMath()) {
    const katexTimer = setInterval(() => {
      if (renderGlobalMath()) clearInterval(katexTimer);
    }, 150);
    setTimeout(() => clearInterval(katexTimer), 4000);
  }
});
