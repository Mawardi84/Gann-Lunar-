/**
 * Pure mathematical functions for W.D. Gann Square of 9 and 4D Market Oracle.
 * Supports bi-directional (BUY / LONG and SELL / SHORT) algorithmic decision engine.
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
  action: 'BUY' | 'SELL';
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

  // Directional Action Determination (BUY vs SELL)
  const patternLower = candlestickPattern.toLowerCase();
  const isBearishPattern = 
    patternLower.includes('bearish') || 
    patternLower.includes('shooting star') || 
    patternLower.includes('breakdown') ||
    patternLower.includes('rejection atas');
    
  const isBullishPattern = 
    patternLower.includes('bullish') || 
    patternLower.includes('hammer') || 
    patternLower.includes('bounce') ||
    patternLower.includes('breakout') ||
    patternLower.includes('rejection bawah');

  const midpoint = (swingHigh + swingLow) / 2;

  let action: 'BUY' | 'SELL' = 'BUY';
  if (isBearishPattern) {
    action = 'SELL';
  } else if (isBullishPattern) {
    action = 'BUY';
  } else if (currentPrice > midpoint) {
    action = 'SELL';
  } else {
    action = 'BUY';
  }

  // Calculate Confluence Zone & Fibonacci Level based on direction
  let closestFib: number;
  let confluenceZoneStart: number;
  let confluenceZoneEnd: number;
  let stopLoss: number;
  let takeProfit1: number;
  let takeProfit2: number;
  let takeProfit3: number;

  if (action === 'BUY') {
    closestFib = Math.abs(currentPrice - fib.fib618) < Math.abs(currentPrice - fib.fib500)
      ? fib.fib618
      : fib.fib500;
    confluenceZoneStart = Math.min(gann.sup1, closestFib);
    confluenceZoneEnd = Math.max(gann.sup1, closestFib);
    stopLoss = Math.min(gann.sup1, confluenceZoneStart) * 0.997;
    takeProfit1 = gann.res1;
    takeProfit2 = gann.res2;
    takeProfit3 = gann.res3;
  } else {
    // SELL / SHORT
    closestFib = Math.abs(currentPrice - fib.fib382) < Math.abs(currentPrice - fib.fib500)
      ? fib.fib382
      : fib.fib500;
    confluenceZoneStart = Math.min(gann.res1, closestFib);
    confluenceZoneEnd = Math.max(gann.res1, closestFib);
    stopLoss = Math.max(gann.res1, confluenceZoneEnd) * 1.003;
    takeProfit1 = gann.sup1;
    takeProfit2 = gann.sup2;
    takeProfit3 = gann.sup3;
  }

  const isLunarValid = lunarPhase.includes('Full Moon') || lunarPhase.includes('New Moon');
  const isSpaceHarmonic = trendAngle >= 40 && trendAngle <= 55;
  const isSpaceExhausted = trendAngle > 70;
  const isCandleConfirmed =
    patternLower.includes('pin bar') ||
    patternLower.includes('hammer') ||
    patternLower.includes('engulfing') ||
    patternLower.includes('shooting star') ||
    patternLower.includes('rejection') ||
    patternLower.includes('breakout') ||
    patternLower.includes('breakdown');

  let decision: 'EXECUTE' | 'STANDBY' | 'IGNORE' = 'STANDBY';

  if (!isLunarValid || isSpaceExhausted || trendAngle < 30) {
    decision = 'IGNORE';
  } else if (isCandleConfirmed && isSpaceHarmonic) {
    decision = 'EXECUTE';
  } else {
    decision = 'STANDBY';
  }

  return {
    decision,
    action,
    confluenceZoneStart,
    confluenceZoneEnd,
    closestFib,
    isLunarValid,
    isSpaceHarmonic,
    isSpaceExhausted,
    isCandleConfirmed,
    stopLoss,
    takeProfit: takeProfit1,
    takeProfit1,
    takeProfit2,
    takeProfit3,
  };
}
