import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateGannLevels, calculateFibonacciLevels, evaluate4DOracle } from './gann.ts';

test('Gann Square of 9 levels calculation', () => {
  const pivot = 4164.22;
  const factor = 0.125;
  const levels = calculateGannLevels(pivot, factor);

  const root = Math.sqrt(pivot);
  assert.equal(levels.pivot, pivot);
  assert.equal(levels.factor, factor);
  assert.ok(Math.abs(levels.root - root) < 0.0001);

  // Check Resisten 1: (root + 0.125)^2
  const expectedRes1 = Math.pow(root + 0.125, 2);
  assert.ok(Math.abs(levels.res1 - expectedRes1) < 0.0001);
  assert.ok(levels.res1 > pivot);

  // Check Support 1: (root - 0.125)^2
  const expectedSup1 = Math.pow(root - 0.125, 2);
  assert.ok(Math.abs(levels.sup1 - expectedSup1) < 0.0001);
  assert.ok(levels.sup1 < pivot);

  // Check Buy & Sell Zone boundaries
  assert.equal(levels.buyZoneStart, levels.sup1);
  assert.ok(levels.buyZoneEnd > levels.buyZoneStart && levels.buyZoneEnd < pivot);
  assert.equal(levels.sellZoneStart, levels.res1);
  assert.ok(levels.sellZoneEnd > levels.sellZoneStart && levels.sellZoneEnd < levels.res2);
});

test('Fibonacci retracement calculation', () => {
  const high = 4200;
  const low = 4100;
  const fib = calculateFibonacciLevels(high, low);

  assert.equal(fib.swingHigh, 4200);
  assert.equal(fib.swingLow, 4100);
  assert.equal(fib.fib500, 4150);
  assert.ok(Math.abs(fib.fib618 - 4161.8) < 0.001);
  assert.ok(Math.abs(fib.fib382 - 4138.2) < 0.001);
});

test('4D Market Oracle Decision Engine', () => {
  // Scenario 1: All 4 dimensions align -> EXECUTE BUY / LONG
  const resultExecute = evaluate4DOracle(
    4164,
    4200,
    4140,
    'Full Moon (H-1) - Jendela Volatilitas Tinggi',
    45,
    'Bullish Pin Bar / Hammer (Rejection)'
  );
  assert.equal(resultExecute.decision, 'EXECUTE');
  assert.equal(resultExecute.action, 'BUY');
  assert.equal(resultExecute.isLunarValid, true);
  assert.equal(resultExecute.isSpaceHarmonic, true);
  assert.equal(resultExecute.isCandleConfirmed, true);
  assert.ok(resultExecute.stopLoss < 4164);
  assert.ok(resultExecute.takeProfit > 4164);
  assert.ok(resultExecute.takeProfit1 > 4164);
  assert.ok(resultExecute.takeProfit2 > resultExecute.takeProfit1);
  assert.ok(resultExecute.takeProfit3 > resultExecute.takeProfit2);

  // Scenario 2: Bearish Rejection Pattern -> EXECUTE SELL / SHORT
  const resultSell = evaluate4DOracle(
    4190,
    4200,
    4140,
    'Full Moon (H-1) - Jendela Volatilitas Tinggi',
    45,
    'Bearish Rejection / Shooting Star'
  );
  assert.equal(resultSell.decision, 'EXECUTE');
  assert.equal(resultSell.action, 'SELL');
  assert.ok(resultSell.stopLoss > 4190);
  assert.ok(resultSell.takeProfit1 < 4190);
  assert.ok(resultSell.takeProfit2 < resultSell.takeProfit1);
  assert.ok(resultSell.takeProfit3 < resultSell.takeProfit2);

  // Scenario 3: Lunar invalid -> IGNORE
  const resultIgnore = evaluate4DOracle(
    4164,
    4200,
    4140,
    'Waxing Gibbous (Fase Normal)',
    45,
    'Bullish Pin Bar / Hammer (Rejection)'
  );
  assert.equal(resultIgnore.decision, 'IGNORE');

  // Scenario 4: Valid time, space, but no candlestick confirmation -> STANDBY
  const resultStandby = evaluate4DOracle(
    4164,
    4200,
    4140,
    'Full Moon (H-1) - Jendela Volatilitas Tinggi',
    45,
    'Doji / Spinning Top (Indecision)'
  );
  assert.equal(resultStandby.decision, 'STANDBY');
});
