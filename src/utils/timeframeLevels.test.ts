import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTimeframeLevels, TIMEFRAME_CONFIGS } from './timeframeLevels';

test('calculateTimeframeLevels returns exact 24h high/low for Daily timeframe D', () => {
  const price = 4164.86;
  const high24 = 4199.08;
  const low24 = 4147.16;

  const result = calculateTimeframeLevels(price, high24, low24, 'D');

  assert.equal(result.interval, 'D');
  assert.equal(result.high, high24);
  assert.equal(result.low, low24);
  assert.equal(result.range, Number((high24 - low24).toFixed(2)));
  assert.equal(result.recommendedFactor, 0.25);
});

test('calculateTimeframeLevels produces tighter swing High/Low for small timeframes (1m, 5m, 15m)', () => {
  const price = 4164.86;
  const high24 = 4199.08;
  const low24 = 4147.16;
  const range24 = high24 - low24; // 51.92

  const tf1 = calculateTimeframeLevels(price, high24, low24, '1');
  const tf5 = calculateTimeframeLevels(price, high24, low24, '5');
  const tf15 = calculateTimeframeLevels(price, high24, low24, '15');
  const tf60 = calculateTimeframeLevels(price, high24, low24, '60');

  // Verify smaller timeframes have smaller swing ranges
  assert.ok(tf1.range < tf5.range, `1m range (${tf1.range}) should be less than 5m range (${tf5.range})`);
  assert.ok(tf5.range < tf15.range, `5m range (${tf5.range}) should be less than 15m range (${tf15.range})`);
  assert.ok(tf15.range < tf60.range, `15m range (${tf15.range}) should be less than 1H range (${tf60.range})`);
  assert.ok(tf60.range < range24, `1H range (${tf60.range}) should be less than 24h range (${range24})`);

  // Verify current price is safely inside [low, high]
  assert.ok(price >= tf15.low, `Price should be >= 15m low`);
  assert.ok(price <= tf15.high, `Price should be <= 15m high`);

  // Verify recommended factors scale down for scalping/intraday
  assert.equal(tf1.recommendedFactor, 0.015625);
  assert.equal(tf5.recommendedFactor, 0.03125);
  assert.equal(tf15.recommendedFactor, 0.0625);
  assert.equal(tf60.recommendedFactor, 0.125);
});

test('calculateTimeframeLevels detects entry zone and Fibonacci levels correctly', () => {
  const price = 4165.0;
  const high24 = 4200.0;
  const low24 = 4150.0;

  const result = calculateTimeframeLevels(price, high24, low24, '15');

  assert.ok(result.entryZone);
  assert.ok(result.entryZone.fib50 > result.low);
  assert.ok(result.entryZone.fib618 > result.entryZone.fib50);
  assert.ok(result.entryZone.gannS1 > 0);
  assert.ok(result.entryZone.gannR1 > result.entryZone.gannS1);
  assert.ok(typeof result.entryZone.statusText === 'string');
});

test('calculateTimeframeLevels expands range for macro timeframes (W, M)', () => {
  const price = 4164.86;
  const high24 = 4199.08;
  const low24 = 4147.16;
  const range24 = high24 - low24;

  const weekly = calculateTimeframeLevels(price, high24, low24, 'W');
  const monthly = calculateTimeframeLevels(price, high24, low24, 'M');

  assert.ok(weekly.range > range24, `Weekly range (${weekly.range}) should exceed 24h range (${range24})`);
  assert.ok(monthly.range > weekly.range, `Monthly range (${monthly.range}) should exceed Weekly range (${weekly.range})`);
});
