import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePositionSize, calculateGannWheelPosition } from './calculator';

test('calculatePositionSize accurately computes risk amount, lots, and R:R ratio', () => {
  const result = calculatePositionSize(10000, 1, 4160, 4140, 4200, 100);
  
  assert.strictEqual(result.accountBalance, 10000);
  assert.strictEqual(result.riskPercent, 1);
  assert.strictEqual(result.riskAmount, 100); // 1% of 10k
  assert.strictEqual(result.priceRisk, 20); // 4160 - 4140
  assert.strictEqual(result.priceReward, 40); // 4200 - 4160
  assert.strictEqual(result.riskRewardRatio, 2); // 40 / 20 = 1:2
  assert.strictEqual(result.recommendedLots, 0.05); // 100 / (20 * 100) = 0.05 lots
});

test('calculateGannWheelPosition identifies correct angles and quadrants', () => {
  const pivot = 4000; // sqrt = 63.24555
  const current = 4126.73; // sqrt = 64.2396

  const wheel = calculateGannWheelPosition(pivot, current);
  assert.ok(wheel.normalizedAngle > 0, 'Angle must be positive');
  assert.ok(wheel.quadrantName, 'Quadrant name should exist');
  assert.ok(wheel.nearestCardinalAngle >= 0);
  assert.ok(wheel.nearestOrdinalAngle >= 0);
});
