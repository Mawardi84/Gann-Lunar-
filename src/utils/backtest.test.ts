import test from 'node:test';
import assert from 'node:assert/strict';
import { runGannBacktest, generateSyntheticHistory } from './backtest.ts';

test('generateSyntheticHistory generates valid price series', () => {
  const history = generateSyntheticHistory(4000, 50, 0.015);
  assert.equal(history.length, 50);
  assert.equal(history[0], 4000);
  assert.ok(history.every(p => typeof p === 'number' && p > 0));
});

test('runGannBacktest produces active signals and valid winRate', () => {
  const result = runGannBacktest(
    [],
    { pivot: 4164.86, sup1: 4120.00, res1: 4210.00 },
    { strategy: 'REVERSION', sampleBars: 100, riskRewardRatio: 2.0 }
  );

  assert.equal(result.hasEnoughData, true);
  assert.ok(result.totalSignals > 0);
  assert.ok(result.winRate >= 0 && result.winRate <= 100);
  assert.ok(result.trades.length > 0);
  assert.equal(result.winCount + result.lossCount, result.totalSignals);
});
