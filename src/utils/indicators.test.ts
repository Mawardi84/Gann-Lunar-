import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateTechnicalIndicators, 
  calculateWildersRSI, 
  calculateBollingerBands, 
  calculateEMASeries, 
  calculateMACD 
} from './indicators.ts';

test('Wilders RSI calculation works correctly with simulated price series', () => {
  // 30 points of ascending prices
  const prices = Array.from({ length: 30 }, (_, i) => 100 + i * 2);
  const rsi = calculateWildersRSI(prices, 14);
  assert.ok(rsi !== null);
  assert.ok(rsi.value >= 70, `RSI should be high for purely ascending series, got ${rsi.value}`);
  assert.strictEqual(rsi.status, 'Overbought');
  assert.strictEqual(rsi.signal, 'Bearish');
});

test('Bollinger Bands calculation works correctly with historical window', () => {
  const prices = Array.from({ length: 25 }, (_, i) => 100 + Math.sin(i) * 5);
  const bb = calculateBollingerBands(prices, 20, 2);
  assert.ok(bb !== null);
  assert.ok(bb.upper > bb.middle);
  assert.ok(bb.middle > bb.lower);
  assert.ok(bb.bandwidth > 0);
});

test('EMA series computes exponential moving average', () => {
  const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const ema = calculateEMASeries(prices, 5);
  assert.ok(ema.length > 0);
  assert.ok(ema[ema.length - 1] > ema[0]);
});

test('MACD returns valid line, signal and histogram with 50 points', () => {
  const prices = Array.from({ length: 50 }, (_, i) => 2000 + i * 3 + (i % 2 === 0 ? 1 : -1));
  const macd = calculateMACD(prices, 12, 26, 9);
  assert.ok(macd !== null);
  assert.ok(typeof macd.macdLine === 'number');
  assert.ok(typeof macd.signalLine === 'number');
  assert.ok(typeof macd.histogram === 'number');
});

test('calculateTechnicalIndicators returns "Mengumpulkan data..." when buffer is insufficient', () => {
  const currentPrice = 4164.22;
  const swingHigh = 4199.08;
  const swingLow = 4147.16;
  const trendAngle = 45;
  const candlePattern = 'Hammer / Pin Bar';

  // Only 5 points in history
  const insufficientHistory = [4160, 4162, 4161, 4163, 4164];
  const indicators = calculateTechnicalIndicators(currentPrice, swingHigh, swingLow, trendAngle, candlePattern, undefined, insufficientHistory);

  assert.strictEqual(indicators.isCollectingData, true);
  assert.strictEqual(indicators.rsi.status, 'Mengumpulkan data...');
  assert.strictEqual(indicators.bollinger.status, 'Mengumpulkan data...');
  assert.strictEqual(indicators.macd.signal, 'Mengumpulkan data...');
  assert.strictEqual(indicators.trend, 'Mengumpulkan data...');
});

test('calculateTechnicalIndicators computes full indicators when buffer >= 50 points', () => {
  const currentPrice = 4164.22;
  const swingHigh = 4199.08;
  const swingLow = 4147.16;
  const trendAngle = 45;
  const candlePattern = 'Hammer / Pin Bar';

  const fullHistory = Array.from({ length: 60 }, (_, i) => 4140 + (i * 0.4) + ((i % 3) * 0.5));
  const indicators = calculateTechnicalIndicators(currentPrice, swingHigh, swingLow, trendAngle, candlePattern, undefined, fullHistory);

  assert.strictEqual(indicators.isCollectingData, false);
  assert.ok(indicators.rsi.value !== null && indicators.rsi.value >= 0 && indicators.rsi.value <= 100);
  assert.ok(['Oversold', 'Neutral', 'Overbought'].includes(indicators.rsi.status as string));
  assert.ok(indicators.bollinger.upper !== null && indicators.bollinger.middle !== null && indicators.bollinger.lower !== null);
  assert.ok((indicators.bollinger.upper as number) >= (indicators.bollinger.middle as number));
  assert.ok(indicators.macd.macdLine !== null);

  // Rule-based indicators continue to work
  assert.strictEqual(indicators.pythagoras.angleDegrees, 45);
  assert.strictEqual(indicators.pythagoras.evaluation, 'Seimbang (Harmonis)');
  assert.strictEqual(indicators.homma.patternType, 'Bullish Reversal');
  assert.ok(indicators.compositeScore >= 0 && indicators.compositeScore <= 100);
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
