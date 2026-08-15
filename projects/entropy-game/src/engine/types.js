/**
 * @typedef {'binary' | 'decimal'} ModeType
 */

export const MODES = {
  BINARY: /** @type {ModeType} */ ('binary'),
  DECIMAL: /** @type {ModeType} */ ('decimal')
};

export const MODE_CONFIGS = {
  binary: {
    name: 'Binary (0 / 1)',
    radix: 2,
    symbols: ['0', '1'],
    allowedKeys: ['0', '1'],
    maxEntropyBits: 1.0,
    theoreticalProb: 0.5,
    minKeysBeforeHalt: 15,
    defaultAlpha: 0.01,
    unit: 'bit / key'
  },
  decimal: {
    name: 'Decimal (0 – 9)',
    radix: 10,
    symbols: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    allowedKeys: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    maxEntropyBits: Math.log2(10), // ~3.32193
    theoreticalProb: 0.1,
    minKeysBeforeHalt: 20,
    defaultAlpha: 0.01,
    unit: 'bits / key'
  }
};

export const FATAL_FLAW_TYPES = {
  GAMBLERS_FALLACY: 'GAMBLERS_FALLACY', // Excess alternation
  RUN_STARVATION: 'RUN_STARVATION',     // Severe lack of longer streaks
  MONOBIT_BIAS: 'MONOBIT_BIAS',         // Uneven single symbol frequencies
  REPETITIVE_PATTERN: 'REPETITIVE_PATTERN', // Repeating n-grams (0101, 123123)
  EXCESS_RUNS: 'EXCESS_RUNS',           // Excess clustering / long streaks
  SPATIAL_COUNTING: 'SPATIAL_COUNTING', // Counting +1/-1 or numpad geometric sweeps
  HIGH_PREDICTABILITY: 'HIGH_PREDICTABILITY' // Universal predictor compressed the sequence
};
