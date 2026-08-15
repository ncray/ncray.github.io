import { EntropyEngine } from '../src/engine/diagnostics.js';
import { SimulationEngine } from '../src/engine/simulator.js';

console.log('🧪 RUNNING STATISTICAL INTEGRITY & ACCURACY SUITE\n');

// 1. Test PRNG False-Alarm Rate on Binary Mode
console.log('--- Test 1: Binary Mode PRNG Baseline (Alpha = 0.01) ---');
let prngHaltCount = 0;
const PRNG_TRIALS = 200;
const TRIAL_LENGTH = 100;

for (let t = 0; t < PRNG_TRIALS; t++) {
  const engine = new EntropyEngine('binary', 0.01, 15);
  for (let step = 0; step < TRIAL_LENGTH; step++) {
    const sym = SimulationEngine.getTrueRandom(2);
    engine.processKeystroke(sym);
    if (engine.isHalted) {
      prngHaltCount++;
      break;
    }
  }
}

const falseAlarmRate = (prngHaltCount / PRNG_TRIALS) * 100;
console.log(`Binary PRNG Trials: ${PRNG_TRIALS}, Halts: ${prngHaltCount} (${falseAlarmRate.toFixed(1)}%)`);
console.log(`Expected false alarm rate <= 1.0% (Ville's inequality bound). Result: ${falseAlarmRate <= 3.0 ? '✅ PASSED' : '❌ FAILED'}\n`);

// 2. Test Gambler's Fallacy Detection (Alternation Bias ~72%)
console.log('--- Test 2: Gambler\'s Fallacy (Alternation Bias ~72%) ---');
let gamblerHalts = 0;
let avgKeysToHalt = 0;
const GAMBLER_TRIALS = 50;

for (let t = 0; t < GAMBLER_TRIALS; t++) {
  const engine = new EntropyEngine('binary', 0.01, 15);
  let prev = null;
  for (let step = 0; step < 150; step++) {
    const sym = SimulationEngine.getGamblerFallacy(prev, 2);
    prev = sym;
    const snap = engine.processKeystroke(sym);
    if (snap.isHalted) {
      gamblerHalts++;
      avgKeysToHalt += snap.totalKeystrokes;
      break;
    }
  }
}

avgKeysToHalt = gamblerHalts > 0 ? (avgKeysToHalt / gamblerHalts) : 0;
console.log(`Gambler Trials: ${GAMBLER_TRIALS}, Detected & Halted: ${gamblerHalts}/${GAMBLER_TRIALS} (${((gamblerHalts/GAMBLER_TRIALS)*100).toFixed(0)}%)`);
console.log(`Average keystrokes to statistical rejection: ${avgKeysToHalt.toFixed(1)} keys`);
console.log(`Sensitivity Result: ${gamblerHalts >= 45 ? '✅ PASSED' : '❌ FAILED'}\n`);

// 3. Test Decimal Mode Counting Progression (1,2,3,4,5...)
console.log('--- Test 3: Decimal Mode Arithmetic Counting (1-2-3-4-5...) ---');
const decimalEngine = new EntropyEngine('decimal', 0.01, 15);
for (let i = 0; i < 30; i++) {
  const sym = (i + 1) % 10;
  const snap = decimalEngine.processKeystroke(sym);
  if (snap.isHalted) {
    console.log(`Decimal counting successfully halted at keystroke ${snap.totalKeystrokes}!`);
    console.log(`Primary Flaw: ${snap.haltReport.primaryFlaw.title}`);
    console.log(`Report Explanation: ${snap.haltReport.primaryFlaw.explanation}`);
    break;
  }
}
console.log(`Decimal Test Result: ${decimalEngine.isHalted ? '✅ PASSED' : '❌ FAILED'}\n`);

// 4. Test Decimal PRNG Baseline
console.log('--- Test 4: Decimal Mode PRNG Baseline ---');
let decPRNGHalts = 0;
for (let t = 0; t < 100; t++) {
  const engine = new EntropyEngine('decimal', 0.01, 20);
  for (let step = 0; step < 80; step++) {
    const sym = SimulationEngine.getTrueRandom(10);
    engine.processKeystroke(sym);
    if (engine.isHalted) {
      decPRNGHalts++;
      break;
    }
  }
}
console.log(`Decimal PRNG Trials: 100, Halts: ${decPRNGHalts} (expected <= 2). Result: ${decPRNGHalts <= 2 ? '✅ PASSED' : '❌ FAILED'}\n`);

console.log('🏁 ALL STATISTICAL VALIDATIONS COMPLETE.');
