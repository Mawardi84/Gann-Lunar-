import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculatePriceAngle } from './priceAngle';

describe('Price Angle (Pythagoras Vector) Calculation Utility', () => {
  test('Verifikasi angle selalu berada pada rentang 0-90 derajat', () => {
    const res1 = calculatePriceAngle(2700, 2600, 2680);
    const res2 = calculatePriceAngle(2700, 2600, 2500);
    const res3 = calculatePriceAngle(2700, 2600, 2800);

    assert.ok(res1.angle >= 0 && res1.angle <= 90);
    assert.ok(res2.angle >= 0 && res2.angle <= 90);
    assert.ok(res3.angle >= 0 && res3.angle <= 90);
  });

  test('Verifikasi isHarmonic = true untuk sudut 45 derajat (±4)', () => {
    // With swingHigh = 2700, swingLow = 2600, midpoint = 2650
    // If price = 2650 + 50 = 2700 -> delta = 100, priceRange = 100 -> ratio = 1 -> atan(1) = 45 deg
    const res = calculatePriceAngle(2700, 2600, 2700, 20);
    assert.strictEqual(res.angle, 45);
    assert.strictEqual(res.isHarmonic, true);
  });

  test('Verifikasi direction = Bullish jika currentPrice di atas midpoint', () => {
    const swingHigh = 2700;
    const swingLow = 2600;
    const midpoint = (swingHigh + swingLow) / 2; // 2650
    const currentPrice = 2680; // above midpoint

    const res = calculatePriceAngle(swingHigh, swingLow, currentPrice);
    assert.strictEqual(res.direction, 'Bullish');
  });

  test('Verifikasi direction = Bearish jika currentPrice di bawah midpoint', () => {
    const swingHigh = 2700;
    const swingLow = 2600;
    const currentPrice = 2610; // below midpoint

    const res = calculatePriceAngle(swingHigh, swingLow, currentPrice);
    assert.strictEqual(res.direction, 'Bearish');
  });
});
