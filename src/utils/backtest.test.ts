import test from 'node:test';
import assert from 'node:assert/strict';
import { runGannBacktest } from './backtest.ts';

test('runGannBacktest returns hasEnoughData: false when points are insufficient', () => {
  const shortHistory = [100, 102, 101];
  const gannLevels = { pivot: 100, sup1: 98, res1: 102 };
  const res = runGannBacktest(shortHistory, gannLevels);

  assert.strictEqual(res.hasEnoughData, false);
  assert.strictEqual(res.message, 'Data historis belum cukup');
});

test('runGannBacktest successfully detects S1 bounce trade and records profit', () => {
  // Simulate an asset oscillating: starts at 100, dips to S1 (98.2), then rallies to R1 (102)
  const history: number[] = [];
  // 15 initial points around 100
  for (let i = 0; i < 15; i++) history.push(100 + (i % 2 === 0 ? 0.2 : -0.2));
  // Dip to S1 (98)
  history.push(98.1);
  history.push(98.05);
  // Rally up to R1 (102.5)
  history.push(99.5);
  history.push(101.0);
  history.push(102.6);
  // Continue
  for (let i = 0; i < 10; i++) history.push(101);

  const gannLevels = { pivot: 100, sup1: 98.2, res1: 102.4 };
  const res = runGannBacktest(history, gannLevels);

  assert.strictEqual(res.hasEnoughData, true);
  assert.ok(res.totalSignals >= 1);
  assert.strictEqual(res.trades[0].outcome, 'Success');
  assert.ok(res.totalProfit > 0);
  assert.strictEqual(res.winRate, 100);
});

test('runGannBacktest triggers stop loss when price breaks below threshold', () => {
  const history: number[] = [];
  for (let i = 0; i < 20; i++) history.push(100);
  // Dip to S1 (98.1)
  history.push(98.1);
  // Then crash through stop loss (98.1 * 0.997 = 97.80) -> dips to 96
  history.push(97.0);
  for (let i = 0; i < 5; i++) history.push(96.5);

  const gannLevels = { pivot: 100, sup1: 98.2, res1: 102.4 };
  const res = runGannBacktest(history, gannLevels);

  assert.strictEqual(res.hasEnoughData, true);
  assert.ok(res.totalSignals >= 1);
  assert.strictEqual(res.trades[0].outcome, 'Failed');
  assert.ok(res.trades[0].profit < 0);
});
