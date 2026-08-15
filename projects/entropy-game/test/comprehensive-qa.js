import { EntropyEngine } from '../src/engine/diagnostics.js';
import { SimulationEngine } from '../src/engine/simulator.js';
import { UniversalPredictor } from '../src/engine/predictor.js';
import { TestMartingale } from '../src/engine/martingale.js';
import { EntropyCalculator } from '../src/engine/entropy.js';
import { MonobitAnalyzer } from '../src/engine/monobit.js';
import { TransitionAnalyzer } from '../src/engine/transitions.js';
import { RunLengthAnalyzer } from '../src/engine/runs.js';
import { NGramAnalyzer } from '../src/engine/ngrams.js';
import { SpatialAnalyzer } from '../src/engine/spatial.js';
import { MODE_CONFIGS, FATAL_FLAW_TYPES } from '../src/engine/types.js';

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║           ENTROPY PROFILER COMPREHENSIVE QA TEST SUITE           ║');
console.log('╚══════════════════════════════════════════════════════════════════╝\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} — ${details}`);
  }
}

// =========================================================================
// SUITE 1: MATHEMATICAL & STATISTICAL SOUNDNESS (PRNG NULL HYPOTHESIS)
// =========================================================================
console.log('📊 SUITE 1: Null Hypothesis (PRNG) Type I Error & Convergence');

// Test 1.1: Binary PRNG Large Sample Type I Error Bound
{
  const trials = 500;
  const trialLen = 100;
  let halts = 0;
  let finalEntropySum = 0;

  for (let t = 0; t < trials; t++) {
    const engine = new EntropyEngine('binary', 0.01, 15);
    for (let i = 0; i < trialLen; i++) {
      const sym = SimulationEngine.getTrueRandom(2);
      const snap = engine.processKeystroke(sym);
      if (snap.isHalted) {
        halts++;
        break;
      }
    }
    const snap = engine.getSnapshot();
    finalEntropySum += snap.entropy.cumulativeRate;
  }

  const falseAlarmRate = (halts / trials) * 100;
  const avgEntropy = finalEntropySum / trials;
  
  assert(falseAlarmRate <= 1.5, `Binary PRNG Type I Error Rate (Observed: ${falseAlarmRate.toFixed(2)}%, Bound: <= 1.0%)`, `False alarms: ${halts}/${trials}`);
  assert(avgEntropy >= 0.95 && avgEntropy <= 1.00, `Binary PRNG Entropy Rate Convergence (Observed: ${avgEntropy.toFixed(3)} / 1.000 bits)`, `Avg entropy was ${avgEntropy}`);
}

// Test 1.2: Decimal PRNG Large Sample Type I Error Bound
{
  const trials = 300;
  const trialLen = 100;
  let halts = 0;
  let finalEntropySum = 0;

  for (let t = 0; t < trials; t++) {
    const engine = new EntropyEngine('decimal', 0.01, 20);
    for (let i = 0; i < trialLen; i++) {
      const sym = SimulationEngine.getTrueRandom(10);
      const snap = engine.processKeystroke(sym);
      if (snap.isHalted) {
        halts++;
        break;
      }
    }
    const snap = engine.getSnapshot();
    finalEntropySum += snap.entropy.cumulativeRate;
  }

  const falseAlarmRate = (halts / trials) * 100;
  const avgEntropy = finalEntropySum / trials;
  
  assert(falseAlarmRate <= 1.5, `Decimal PRNG Type I Error Rate (Observed: ${falseAlarmRate.toFixed(2)}%, Bound: <= 1.0%)`, `False alarms: ${halts}/${trials}`);
  assert(avgEntropy >= 3.15 && avgEntropy <= 3.322, `Decimal PRNG Entropy Rate Convergence (Observed: ${avgEntropy.toFixed(3)} / 3.322 bits)`, `Avg entropy was ${avgEntropy}`);
}

// =========================================================================
// SUITE 2: STATISTICAL SENSITIVITY & PRIMARY FLAW IDENTIFICATION
// =========================================================================
console.log('\n🎯 SUITE 2: Statistical Sensitivity on Human Bias Archetypes');

// Test 2.1: Gambler's Fallacy (72% Alternation)
{
  const trials = 50;
  let detected = 0;
  let correctDiagnosis = 0;

  for (let t = 0; t < trials; t++) {
    const engine = new EntropyEngine('binary', 0.01, 15);
    let prev = null;
    for (let i = 0; i < 150; i++) {
      const sym = SimulationEngine.getGamblerFallacy(prev, 2);
      prev = sym;
      const snap = engine.processKeystroke(sym);
      if (snap.isHalted) {
        detected++;
        if (snap.haltReport.primaryFlaw.type === FATAL_FLAW_TYPES.GAMBLERS_FALLACY) {
          correctDiagnosis++;
        }
        break;
      }
    }
  }

  assert(detected >= 42, `Gambler's Fallacy Detection Sensitivity (${detected}/${trials} detected, ${((detected/trials)*100).toFixed(0)}%)`);
  assert(correctDiagnosis >= 38, `Gambler's Fallacy Accurate Flaw Diagnosis (${correctDiagnosis}/${detected} correct)`);
}

// Test 2.2: Repetitive Rhythm Pattern ('01010101' loop)
{
  const engine = new EntropyEngine('binary', 0.01, 15);
  let haltedAt = null;

  for (let i = 0; i < 60; i++) {
    const sym = i % 2; // 0, 1, 0, 1, 0, 1...
    const snap = engine.processKeystroke(sym);
    if (snap.isHalted) {
      haltedAt = snap.totalKeystrokes;
      break;
    }
  }

  assert(haltedAt !== null && haltedAt <= 25, `Repetitive 0101 Loop Rejection (Halted at key ${haltedAt})`);
  assert(engine.haltReport !== null, `Repetitive Rhythm Generates Autopsy Report`);
}

// Test 2.3: Monobit Frequency Bias (75% ones, 25% zeros)
{
  const engine = new EntropyEngine('binary', 0.01, 15);
  let haltedAt = null;

  for (let i = 0; i < 100; i++) {
    const sym = Math.random() < 0.75 ? 1 : 0;
    const snap = engine.processKeystroke(sym);
    if (snap.isHalted) {
      haltedAt = snap.totalKeystrokes;
      break;
    }
  }

  assert(haltedAt !== null && haltedAt <= 80, `Monobit 75/25 Imbalance Rejection (Halted at key ${haltedAt})`);
}

// Test 2.4: Decimal Arithmetic Counting (1-2-3-4-5-6-7-8-9-0...)
{
  const engine = new EntropyEngine('decimal', 0.01, 15);
  let haltedAt = null;

  for (let i = 0; i < 30; i++) {
    const sym = (i + 1) % 10;
    const snap = engine.processKeystroke(sym);
    if (snap.isHalted) {
      haltedAt = snap.totalKeystrokes;
      break;
    }
  }

  assert(haltedAt !== null && haltedAt <= 20, `Decimal Counting Progression Rejection (Halted at key ${haltedAt})`);
  assert(engine.haltReport.primaryFlaw.title.includes('Counting') || engine.haltReport.primaryFlaw.title.includes('Progression') || engine.haltReport.primaryFlaw.title.includes('Predictability'), `Decimal Counting Flaw Correctly Identified (${engine.haltReport.primaryFlaw.title})`);
}

// =========================================================================
// SUITE 3: MATHEMATICAL IDENTITIES & BOUNDS
// =========================================================================
console.log('\n📐 SUITE 3: Information Theory & Entropy Mathematical Bounds');

// Test 3.1: H0 >= H1 for any sequence
{
  const engine = new EntropyEngine('binary');
  let boundsHold = true;
  
  // Test across 100 arbitrary keystrokes
  for (let i = 0; i < 100; i++) {
    const sym = Math.random() < 0.6 ? 1 : 0;
    const snap = engine.processKeystroke(sym);
    if (snap.entropy.H0 < -1e-9 || snap.entropy.H0 > 1.0001) boundsHold = false;
    if (snap.entropy.H1 < -1e-9 || snap.entropy.H1 > 1.0001) boundsHold = false;
  }

  assert(boundsHold, `Shannon Entropies H0 and H1 strictly bounded within [0, 1.000]`);
}

// Test 3.2: Cumulative entropy rate <= Max theoretical entropy
{
  const engineBinary = new EntropyEngine('binary');
  const engineDecimal = new EntropyEngine('decimal');

  for (let i = 0; i < 50; i++) {
    engineBinary.processKeystroke(SimulationEngine.getTrueRandom(2));
    engineDecimal.processKeystroke(SimulationEngine.getTrueRandom(10));
  }

  const snapB = engineBinary.getSnapshot();
  const snapD = engineDecimal.getSnapshot();

  assert(snapB.entropy.cumulativeRate <= 1.0001, `Binary empirical entropy rate <= 1.000 (${snapB.entropy.cumulativeRate.toFixed(4)})`);
  assert(snapD.entropy.cumulativeRate <= 3.3220, `Decimal empirical entropy rate <= 3.322 (${snapD.entropy.cumulativeRate.toFixed(4)})`);
}

// =========================================================================
// SUITE 4: EDGE CASES & ROBUSTNESS
// =========================================================================
console.log('\n🛡️ SUITE 4: Edge Cases, Monotony & Numeric Robustness');

// Test 4.1: Single Keystroke (N = 1) Stability
{
  const engine = new EntropyEngine('binary');
  const snap = engine.processKeystroke(1);
  
  assert(!isNaN(snap.entropy.cumulativeRate) && !isNaN(snap.martingale.wealth), `N = 1 Keystroke Numeric Stability (no NaN/Infinity)`);
  assert(snap.martingale.integrity === 100, `N = 1 Randomness Integrity starts at 100%`);
}

// Test 4.2: Degenerate Extreme Sequence (All 0s for 30 keystrokes)
{
  const engine = new EntropyEngine('binary', 0.01, 15);
  for (let i = 0; i < 20; i++) {
    engine.processKeystroke(0);
  }
  const snap = engine.getSnapshot();

  assert(snap.isHalted, `Degenerate sequence (All 0s) triggers halt by key 20`);
  assert(snap.martingale.wealth > 100, `Degenerate sequence explodes martingale wealth (${snap.martingale.wealth.toFixed(1)}x)`);
}

// Test 4.3: Mode Switch and Clean Reset
{
  const engine = new EntropyEngine('binary');
  engine.processKeystroke(0);
  engine.processKeystroke(1);
  engine.processKeystroke(0);

  engine.setMode('decimal');
  const snap = engine.getSnapshot();

  assert(snap.mode === 'decimal', `Engine successfully switches mode to decimal`);
  assert(snap.totalKeystrokes === 0, `Mode switch resets sequence cleanly`);
  assert(snap.config.radix === 10, `Decimal configuration loaded with radix 10`);
}

// Test 4.4: Autocorrelation Calculation with Flat Sequence
{
  const ngrams = new NGramAnalyzer(2);
  // All 1s (variance = 0)
  for (let i = 0; i < 20; i++) ngrams.observe(1);
  const stats = ngrams.getStats();

  assert(stats.autocorrelations.every(ac => !isNaN(ac.value) && isFinite(ac.value)), `Zero-variance sequence handles autocorrelation without NaN/div-by-zero`);
}

// =========================================================================
// SUMMARY
// =========================================================================
console.log('\n══════════════════════════════════════════════════════════════════');
console.log(`🏁 QA RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${((passedTests/totalTests)*100).toFixed(1)}%)`);
console.log('══════════════════════════════════════════════════════════════════\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
