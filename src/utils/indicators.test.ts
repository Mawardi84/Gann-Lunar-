import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTechnicalIndicators } from './indicators.ts';

test('Technical indicators calculation produces valid numbers and status', () => {
  const currentPrice = 4164.22;
  const swingHigh = 4199.08;
  const swingLow = 4147.16;
  const trendAngle = 45;
  const candlePattern = 'Hammer / Pin Bar';

  const indicators = calculateTechnicalIndicators(currentPrice, swingHigh, swingLow, trendAngle, candlePattern);

  // Assert RSI
  assert.ok(indicators.rsi.value >= 0 && indicators.rsi.value <= 100);
  assert.ok(['Oversold', 'Neutral', 'Overbought'].includes(indicators.rsi.status));

  // Assert Bollinger Bands
  assert.ok(indicators.bollinger.upper > indicators.bollinger.middle);
  assert.ok(indicators.bollinger.middle > indicators.bollinger.lower);
  assert.ok(indicators.bollinger.bandwidth > 0);

  // Assert MACD
  assert.ok(typeof indicators.macd.macdLine === 'number');
  assert.ok(typeof indicators.macd.signalLine === 'number');

  // Assert Gann Vibration
  assert.ok(indicators.gannVibration.root > 0);
  assert.ok(indicators.gannVibration.currentAngleDegrees >= 0 && indicators.gannVibration.currentAngleDegrees <= 360);

  // Assert Fibonacci Golden Pocket
  assert.ok(indicators.fibonacci.fib500 > indicators.fibonacci.fib618);
  assert.ok(indicators.fibonacci.goldenPocketRange[0] <= indicators.fibonacci.goldenPocketRange[1]);

  // Assert Lunar
  assert.ok(indicators.lunar.illuminationPct >= 0 && indicators.lunar.illuminationPct <= 100);
  assert.ok(typeof indicators.lunar.isHighVolatilityWindow === 'boolean');

  // Assert Pythagoras
  assert.strictEqual(indicators.pythagoras.angleDegrees, 45);
  assert.strictEqual(indicators.pythagoras.evaluation, 'Seimbang (Harmonis)');

  // Assert Homma
  assert.strictEqual(indicators.homma.patternType, 'Bullish Reversal');
  assert.strictEqual(indicators.homma.bullPressurePct, 78);

  // Assert Composite Score
  assert.ok(indicators.compositeScore >= 0 && indicators.compositeScore <= 100);
  assert.ok(['STRONG BUY', 'BUY', 'STANDBY / NEUTRAL', 'SELL', 'STRONG SELL'].includes(indicators.overallVerdict));
});

test('Pythagoras marks angles > 70 as exhaustion', () => {
  const indicators = calculateTechnicalIndicators(100, 110, 90, 75, 'Doji');
  assert.strictEqual(indicators.pythagoras.evaluation, 'Kelelahan Tren (Exhaustion)');
});

test('Homma detects bearish reversals accurately', () => {
  const indicators = calculateTechnicalIndicators(100, 110, 90, 45, 'Bearish Engulfing');
  assert.strictEqual(indicators.homma.patternType, 'Bearish Reversal');
  assert.strictEqual(indicators.homma.bearPressurePct, 75);
});
