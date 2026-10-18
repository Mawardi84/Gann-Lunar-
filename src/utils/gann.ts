/**
 * Pure mathematical functions for W.D. Gann Square of 9 and 4D Market Oracle.
 */

export interface GannLevels {
  pivot: number;
  factor: number;
  root: number;
  res1: number;
  sup1: number;
  res2: number;
  sup2: number;
  res3: number;
  sup3: number;
  buyZoneStart: number;
  buyZoneEnd: number;
  sellZoneStart: number;
  sellZoneEnd: number;
}

export interface FibonacciLevels {
  swingHigh: number;
  swingLow: number;
  fib382: number;
  fib500: number;
  fib618: number;
}

export interface OracleDecisionResult {
  decision: 'EXECUTE' | 'STANDBY' | 'IGNORE';
  confluenceZoneStart: number;
  confluenceZoneEnd: number;
  closestFib: number;
  isLunarValid: boolean;
  isSpaceHarmonic: boolean;
  isSpaceExhausted: boolean;
  isCandleConfirmed: boolean;
  stopLoss: number;
  takeProfit: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
}

export function calculateGannLevels(pivot: number, factor = 0.125): GannLevels {
  if (pivot <= 0 || factor <= 0) {
    throw new Error('Pivot and factor must be positive numbers');
  }

  const root = Math.sqrt(pivot);
  const res1 = Math.pow(root + factor, 2);
  const sup1 = Math.pow(root - factor, 2);
  const res2 = Math.pow(root + factor * 2, 2);
  const sup2 = Math.pow(root - factor * 2, 2);
  const res3 = Math.pow(root + factor * 3, 2);
  const sup3 = Math.pow(root - factor * 3, 2);

  const buyZoneStart = sup1;
  const buyZoneEnd = sup1 + (pivot - sup1) * 0.35;
  const sellZoneStart = res1;
  const sellZoneEnd = res1 + (res2 - res1) * 0.35;

  return {
    pivot,
    factor,
    root,
    res1,
    sup1,
    res2,
    sup2,
    res3,
    sup3,
    buyZoneStart,
    buyZoneEnd,
    sellZoneStart,
    sellZoneEnd,
  };
}

export function calculateFibonacciLevels(swingHigh: number, swingLow: number): FibonacciLevels {
  const high = Math.max(swingHigh, swingLow);
  const low = Math.min(swingHigh, swingLow);
  const range = high - low;

  return {
    swingHigh: high,
    swingLow: low,
    fib382: low + range * 0.382,
    fib500: low + range * 0.50,
    fib618: low + range * 0.618,
  };
}

export function evaluate4DOracle(
  currentPrice: number,
  swingHigh: number,
  swingLow: number,
  lunarPhase: string,
  trendAngle: number,
  candlestickPattern: string
): OracleDecisionResult {
  const gann = calculateGannLevels(currentPrice, 0.125);
  const fib = calculateFibonacciLevels(swingHigh, swingLow);

  // Closest Fib to current price/S1
  const closestFib = Math.abs(currentPrice - fib.fib618) < Math.abs(currentPrice - fib.fib500)
    ? fib.fib618
    : fib.fib500;

  const confluenceZoneStart = Math.min(gann.sup1, closestFib);
  const confluenceZoneEnd = Math.max(gann.sup1, closestFib);

  const isLunarValid = lunarPhase.includes('Full Moon') || lunarPhase.includes('New Moon');
  const isSpaceHarmonic = trendAngle >= 40 && trendAngle <= 55;
  const isSpaceExhausted = trendAngle > 70;
  const isCandleConfirmed =
    candlestickPattern.includes('Pin Bar') ||
    candlestickPattern.includes('Hammer') ||
    candlestickPattern.includes('Engulfing');

  let decision: 'EXECUTE' | 'STANDBY' | 'IGNORE' = 'STANDBY';

  if (!isLunarValid || isSpaceExhausted || trendAngle < 30) {
    decision = 'IGNORE';
  } else if (isCandleConfirmed && isSpaceHarmonic) {
    decision = 'EXECUTE';
  } else {
    decision = 'STANDBY';
  }

  const stopLoss = gann.sup1 * 0.997;
  const takeProfit = gann.res1;
  const takeProfit1 = gann.res1;
  const takeProfit2 = gann.res2;
  const takeProfit3 = gann.res3;

  return {
    decision,
    confluenceZoneStart,
    confluenceZoneEnd,
    closestFib,
    isLunarValid,
    isSpaceHarmonic,
    isSpaceExhausted,
    isCandleConfirmed,
    stopLoss,
    takeProfit,
    takeProfit1,
    takeProfit2,
    takeProfit3,
  };
}
