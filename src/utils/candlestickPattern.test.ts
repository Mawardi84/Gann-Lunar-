import { test, describe } from 'node:test';
import assert from 'node:assert';
import { detectCandlestickPattern, MANDATORY_DISCLAIMER } from './candlestickPattern';

describe('Candlestick Pattern Detection Utility', () => {
  test('Verifikasi isFromOHLC selalu false', () => {
    const res = detectCandlestickPattern(2650, 2700, 2600);
    assert.strictEqual(res.isFromOHLC, false);
  });

  test('Verifikasi disclaimer selalu ada dan sesuai string wajib', () => {
    const res = detectCandlestickPattern(2650, 2700, 2600);
    assert.strictEqual(typeof res.disclaimer, 'string');
    assert.strictEqual(res.disclaimer, MANDATORY_DISCLAIMER);
  });

  test('Verifikasi confidence tidak pernah High', () => {
    const prices = [2650, 2705, 2595, 2700, 2600];
    for (const p of prices) {
      const res = detectCandlestickPattern(p, 2700, 2600);
      assert.notStrictEqual(res.confidence, 'High');
    }
  });

  test('Verifikasi currentPrice di atas gannRes1 menghasilkan bias Bullish', () => {
    const gannRes1 = 2700;
    const gannSup1 = 2600;
    const currentPrice = 2715; // above gannRes1

    const res = detectCandlestickPattern(currentPrice, gannRes1, gannSup1);
    assert.strictEqual(res.bias, 'Bullish');
    assert.ok(res.pattern.includes('Bullish Breakout'));
  });
});
