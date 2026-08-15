/**
 * Spatial, Keypad & Arithmetic Progression Analysis Engine (Decimal 0–9 Mode)
 * Detects counting biases (+1, -1, +2), physical numpad spatial adjacencies, and keyboard sweeps.
 */
export class SpatialAnalyzer {
  constructor() {
    this.reset();
    
    // Numpad coordinate mapping (0 at bottom, 1-9 in 3x3 grid)
    // 7 8 9
    // 4 5 6
    // 1 2 3
    //   0
    this.numpadCoords = {
      0: [1, 0],
      1: [0, 1], 2: [1, 1], 3: [2, 1],
      4: [0, 2], 5: [1, 2], 6: [2, 2],
      7: [0, 3], 8: [1, 3], 9: [2, 3]
    };
  }

  reset() {
    this.prevSymbol = null;
    this.totalSteps = 0;
    this.deltaCounts = new Array(10).fill(0); // delta = (next - prev + 10) % 10
    this.adjacentCount = 0;
    this.ascendingCount = 0; // +1
    this.descendingCount = 0; // -1 (or 9)
    this.evenOddStepCount = 0; // +2 or -2
  }

  isNumpadAdjacent(a, b) {
    const c1 = this.numpadCoords[a];
    const c2 = this.numpadCoords[b];
    if (!c1 || !c2) return false;
    const dx = Math.abs(c1[0] - c2[0]);
    const dy = Math.abs(c1[1] - c2[1]);
    return (dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0));
  }

  observe(symbol) {
    if (this.prevSymbol !== null) {
      this.totalSteps++;
      const delta = (symbol - this.prevSymbol + 10) % 10;
      this.deltaCounts[delta]++;

      if (delta === 1) this.ascendingCount++;
      if (delta === 9) this.descendingCount++;
      if (delta === 2 || delta === 8) this.evenOddStepCount++;

      if (this.isNumpadAdjacent(this.prevSymbol, symbol)) {
        this.adjacentCount++;
      }
    }
    this.prevSymbol = symbol;
  }

  getStats() {
    if (this.totalSteps === 0) {
      return {
        totalSteps: 0,
        ascendingRate: 0.1,
        descendingRate: 0.1,
        adjacentRate: 0.35,
        deltaProbs: new Array(10).fill(0.1),
        isCountingBias: false,
        isAdjacencyBias: false
      };
    }

    const ascendingRate = this.ascendingCount / this.totalSteps;
    const descendingRate = this.descendingCount / this.totalSteps;
    const adjacentRate = this.adjacentCount / this.totalSteps;

    const deltaProbs = this.deltaCounts.map(c => c / this.totalSteps);

    // Expected random numpad adjacency is ~38%
    const isAdjacencyBias = (this.totalSteps >= 15 && adjacentRate > 0.65);
    // Expected +1 or -1 is 10% each
    const isCountingBias = (this.totalSteps >= 15 && (ascendingRate > 0.28 || descendingRate > 0.28));

    return {
      totalSteps: this.totalSteps,
      ascendingRate,
      descendingRate,
      adjacentRate,
      deltaProbs,
      isCountingBias,
      isAdjacencyBias
    };
  }
}
