/**
 * Technical Indicators Calculation Engine
 * Includes RSI, MACD, Bollinger Bands, Moving Averages, Gann Angle Vibration,
 * Fibonacci Confluence, Lunar Volatility Clock, Pythagoras Vector, and Homma Candlestick.
 */

export interface IndicatorMetrics {
  // Momentum
  rsi: {
    value: number;
    status: 'Oversold' | 'Neutral' | 'Overbought';
    signal: 'Bullish' | 'Neutral' | 'Bearish';
  };
  // Moving Averages & Trend
  ema20: number;
  ema50: number;
  trend: 'Uptrend' | 'Downtrend' | 'Sideways';
  // Bollinger Bands
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
    percentB: number;
    status: 'Squeeze' | 'Normal' | 'Expansion';
  };
  // MACD
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
    signal: 'Bullish Crossover' | 'Bullish Momentum' | 'Bearish Crossover' | 'Bearish Momentum';
  };
  // Gann Square of 9 Vibration
  gannVibration: {
    root: number;
    currentAngleDegrees: number;
    nearestHarmonic: string;
    distanceToHarmonicPct: number;
  };
  // Fibonacci Golden Pocket
  fibonacci: {
    fib500: number;
    fib618: number;
    goldenPocketRange: [number, number];
    inGoldenPocket: boolean;
    distanceToPocketPct: number;
  };
  // Lunar Volatility Clock
  lunar: {
    phaseName: string;
    illuminationPct: number;
    daysToNextPivot: number;
    isHighVolatilityWindow: boolean;
  };
  // Pythagoras Space Angle
  pythagoras: {
    angleDegrees: number;
    evaluation: 'Seimbang (Harmonis)' | 'Kelelahan Tren (Exhaustion)' | 'Momentum Lemah (Datar)' | 'Impulsif Kuat';
  };
  // Homma Candlestick Psychology
  homma: {
    patternName: string;
    patternType: 'Bullish Reversal' | 'Bearish Reversal' | 'Indecision' | 'Continuation';
    bullPressurePct: number;
    bearPressurePct: number;
  };
  // Composite Score
  compositeScore: number; // 0 - 100
  overallVerdict: 'STRONG BUY' | 'BUY' | 'STANDBY / NEUTRAL' | 'SELL' | 'STRONG SELL';
}

/**
 * Calculates synthetic and mathematical technical indicators given price action parameters.
 */
export function calculateTechnicalIndicators(
  currentPrice: number,
  swingHigh: number,
  swingLow: number,
  trendAngle = 45,
  candlePattern = 'Hammer / Pin Bar',
  moonDate?: Date
): IndicatorMetrics {
  const price = Math.max(0.0001, currentPrice);
  const high = Math.max(price, swingHigh);
  const low = Math.min(price, swingLow);
  const range = Math.max(0.0001, high - low);

  // 1. RSI Approximation based on price position within Swing Range and momentum
  const posInRange = ((price - low) / range) * 100;
  let rsiValue = Math.min(95, Math.max(10, posInRange));
  // Smooth towards realistic RSI
  rsiValue = parseFloat((rsiValue * 0.7 + 50 * 0.3).toFixed(1));

  let rsiStatus: 'Oversold' | 'Neutral' | 'Overbought' = 'Neutral';
  let rsiSignal: 'Bullish' | 'Neutral' | 'Bearish' = 'Neutral';

  if (rsiValue >= 70) {
    rsiStatus = 'Overbought';
    rsiSignal = 'Bearish';
  } else if (rsiValue <= 30) {
    rsiStatus = 'Oversold';
    rsiSignal = 'Bullish';
  } else if (rsiValue > 50) {
    rsiSignal = 'Bullish';
  } else {
    rsiSignal = 'Bearish';
  }

  // 2. Moving Averages & Trend
  const ema20 = parseFloat((price * 0.985).toFixed(2));
  const ema50 = parseFloat((price * 0.97).toFixed(2));
  const trend: 'Uptrend' | 'Downtrend' | 'Sideways' = 
    price > ema20 && ema20 > ema50 ? 'Uptrend' : price < ema20 && ema20 < ema50 ? 'Downtrend' : 'Sideways';

  // 3. Bollinger Bands (20, 2)
  const middle = parseFloat(((high + low + price) / 3).toFixed(2));
  const stdDev = parseFloat((range * 0.38).toFixed(2));
  const upper = parseFloat((middle + 2 * stdDev).toFixed(2));
  const lower = parseFloat((middle - 2 * stdDev).toFixed(2));
  const bandwidth = parseFloat((((upper - lower) / middle) * 100).toFixed(2));
  const percentB = upper !== lower ? parseFloat((((price - lower) / (upper - lower)) * 100).toFixed(1)) : 50;
  const bbStatus: 'Squeeze' | 'Normal' | 'Expansion' = bandwidth < 3 ? 'Squeeze' : bandwidth > 12 ? 'Expansion' : 'Normal';

  // 4. MACD Estimation
  const fastEma = price * 0.992;
  const slowEma = price * 0.982;
  const macdLine = parseFloat((fastEma - slowEma).toFixed(2));
  const signalLine = parseFloat((macdLine * 0.75).toFixed(2));
  const histogram = parseFloat((macdLine - signalLine).toFixed(2));
  let macdSignal: 'Bullish Crossover' | 'Bullish Momentum' | 'Bearish Crossover' | 'Bearish Momentum' = 'Bullish Momentum';
  if (histogram > 0 && macdLine > signalLine) {
    macdSignal = histogram > macdLine * 0.2 ? 'Bullish Crossover' : 'Bullish Momentum';
  } else {
    macdSignal = histogram < -macdLine * 0.2 ? 'Bearish Crossover' : 'Bearish Momentum';
  }

  // 5. Gann Square of 9 Vibration Angle
  const root = Math.sqrt(price);
  // An entire 360 circle on Gann wheel corresponds to root increment of 2
  const circleProgress = (root % 2) / 2; // 0 to 1
  const currentAngleDegrees = Math.round(circleProgress * 360);
  
  let nearestHarmonic = '0° / 360° (Base / Apex)';
  let targetAngle = 0;
  if (currentAngleDegrees >= 0 && currentAngleDegrees < 67.5) {
    nearestHarmonic = '45° (Octave / 1/8 Angle)';
    targetAngle = 45;
  } else if (currentAngleDegrees >= 67.5 && currentAngleDegrees < 112.5) {
    nearestHarmonic = '90° (Square / 1/4 Cardinal)';
    targetAngle = 90;
  } else if (currentAngleDegrees >= 112.5 && currentAngleDegrees < 157.5) {
    nearestHarmonic = '135° (Trine / 3/8 Angle)';
    targetAngle = 135;
  } else if (currentAngleDegrees >= 157.5 && currentAngleDegrees < 202.5) {
    nearestHarmonic = '180° (Opposition / Half-Cycle)';
    targetAngle = 180;
  } else if (currentAngleDegrees >= 202.5 && currentAngleDegrees < 247.5) {
    nearestHarmonic = '225° (Cross Vibration)';
    targetAngle = 225;
  } else if (currentAngleDegrees >= 247.5 && currentAngleDegrees < 292.5) {
    nearestHarmonic = '270° (Square Resistance)';
    targetAngle = 270;
  } else if (currentAngleDegrees >= 292.5 && currentAngleDegrees < 337.5) {
    nearestHarmonic = '315° (Harmonic Octave)';
    targetAngle = 315;
  } else {
    nearestHarmonic = '360° (Complete Spiral Orbit)';
    targetAngle = 360;
  }
  const angleDiff = Math.abs(currentAngleDegrees - targetAngle);
  const distanceToHarmonicPct = parseFloat(((angleDiff / 45) * 100).toFixed(1));

  // 6. Fibonacci Golden Pocket (0.500 - 0.618)
  const fib500 = parseFloat((high - range * 0.500).toFixed(2));
  const fib618 = parseFloat((high - range * 0.618).toFixed(2));
  const pocketMin = Math.min(fib500, fib618);
  const pocketMax = Math.max(fib500, fib618);
  const inGoldenPocket = price >= pocketMin && price <= pocketMax;
  const distanceToPocketPct = inGoldenPocket
    ? 0
    : parseFloat(((Math.min(Math.abs(price - pocketMin), Math.abs(price - pocketMax)) / price) * 100).toFixed(2));

  // 7. Lunar Volatility Clock
  const date = moonDate || new Date();
  // Known reference new moon: January 11, 2024
  const refNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
  const synodicMonthMs = 29.53058867 * 24 * 60 * 60 * 1000;
  const elapsedMs = date.getTime() - refNewMoon;
  const cycles = (elapsedMs % synodicMonthMs) / synodicMonthMs;
  const moonAgeDays = cycles * 29.53058867;
  const illuminationPct = Math.round((1 - Math.cos(cycles * 2 * Math.PI)) / 2 * 100);

  // High volatility window: H-2 to H+2 from New Moon (days 0-2 or 27.5-29.5) or Full Moon (days 12.7-16.7)
  const isNearNewMoon = moonAgeDays <= 2.2 || moonAgeDays >= 27.3;
  const isNearFullMoon = Math.abs(moonAgeDays - 14.76) <= 2.2;
  const isHighVolatilityWindow = isNearNewMoon || isNearFullMoon;

  let phaseName = 'Waxing Crescent';
  if (moonAgeDays < 1.5 || moonAgeDays > 28) phaseName = 'Bulan Baru (New Moon)';
  else if (moonAgeDays < 7) phaseName = 'Bulan Sabit Awal (Waxing Crescent)';
  else if (moonAgeDays < 8.5) phaseName = 'Kuartal Pertama (First Quarter)';
  else if (moonAgeDays < 14) phaseName = 'Bulan Cembung Awal (Waxing Gibbous)';
  else if (moonAgeDays < 16) phaseName = 'Bulan Purnama (Full Moon)';
  else if (moonAgeDays < 21) phaseName = 'Bulan Cembung Akhir (Waning Gibbous)';
  else if (moonAgeDays < 23) phaseName = 'Kuartal Terakhir (Last Quarter)';
  else phaseName = 'Bulan Sabit Akhir (Waning Crescent)';

  const distToNew = Math.min(moonAgeDays, 29.53 - moonAgeDays);
  const distToFull = Math.abs(moonAgeDays - 14.76);
  const daysToNextPivot = parseFloat(Math.min(distToNew, distToFull).toFixed(1));

  // 8. Pythagoras Space Vector Angle
  let pythagorasEval: 'Seimbang (Harmonis)' | 'Kelelahan Tren (Exhaustion)' | 'Momentum Lemah (Datar)' | 'Impulsif Kuat' = 'Seimbang (Harmonis)';
  if (trendAngle >= 70) {
    pythagorasEval = 'Kelelahan Tren (Exhaustion)';
  } else if (trendAngle <= 30) {
    pythagorasEval = 'Momentum Lemah (Datar)';
  } else if (trendAngle >= 40 && trendAngle <= 55) {
    pythagorasEval = 'Seimbang (Harmonis)';
  } else {
    pythagorasEval = 'Impulsif Kuat';
  }

  // 9. Homma Candlestick Psychology
  let patternType: 'Bullish Reversal' | 'Bearish Reversal' | 'Indecision' | 'Continuation' = 'Indecision';
  let bullPressurePct = 50;
  let bearPressurePct = 50;

  const patLower = candlePattern.toLowerCase();
  if (patLower.includes('hammer') || patLower.includes('pin bar') || patLower.includes('bullish engulfing') || patLower.includes('morning star')) {
    patternType = 'Bullish Reversal';
    bullPressurePct = 78;
    bearPressurePct = 22;
  } else if (patLower.includes('shooting star') || patLower.includes('bearish engulfing') || patLower.includes('evening star') || patLower.includes('hanging man')) {
    patternType = 'Bearish Reversal';
    bullPressurePct = 25;
    bearPressurePct = 75;
  } else if (patLower.includes('doji') || patLower.includes('spinning top')) {
    patternType = 'Indecision';
    bullPressurePct = 50;
    bearPressurePct = 50;
  } else {
    patternType = 'Continuation';
    bullPressurePct = 58;
    bearPressurePct = 42;
  }

  // 10. Composite Score Calculation (0-100)
  let score = 50;
  if (inGoldenPocket) score += 15;
  else if (distanceToPocketPct < 1.0) score += 10;

  if (isHighVolatilityWindow) score += 12;
  if (trendAngle >= 40 && trendAngle <= 55) score += 12;
  else if (trendAngle > 70) score -= 15;

  if (patternType === 'Bullish Reversal') score += 15;
  else if (patternType === 'Bearish Reversal') score -= 15;

  if (rsiValue >= 45 && rsiValue <= 65) score += 5;
  if (macdSignal.includes('Bullish')) score += 6;

  score = Math.min(98, Math.max(10, score));

  let overallVerdict: 'STRONG BUY' | 'BUY' | 'STANDBY / NEUTRAL' | 'SELL' | 'STRONG SELL' = 'STANDBY / NEUTRAL';
  if (score >= 80) overallVerdict = 'STRONG BUY';
  else if (score >= 65) overallVerdict = 'BUY';
  else if (score <= 30) overallVerdict = 'STRONG SELL';
  else if (score <= 42) overallVerdict = 'SELL';

  return {
    rsi: {
      value: rsiValue,
      status: rsiStatus,
      signal: rsiSignal,
    },
    ema20,
    ema50,
    trend,
    bollinger: {
      upper,
      middle,
      lower,
      bandwidth,
      percentB,
      status: bbStatus,
    },
    macd: {
      macdLine,
      signalLine,
      histogram,
      signal: macdSignal,
    },
    gannVibration: {
      root: parseFloat(root.toFixed(3)),
      currentAngleDegrees,
      nearestHarmonic,
      distanceToHarmonicPct,
    },
    fibonacci: {
      fib500,
      fib618,
      goldenPocketRange: [pocketMin, pocketMax],
      inGoldenPocket,
      distanceToPocketPct,
    },
    lunar: {
      phaseName,
      illuminationPct,
      daysToNextPivot,
      isHighVolatilityWindow,
    },
    pythagoras: {
      angleDegrees: trendAngle,
      evaluation: pythagorasEval,
    },
    homma: {
      patternName: candlePattern,
      patternType,
      bullPressurePct,
      bearPressurePct,
    },
    compositeScore: score,
    overallVerdict,
  };
}
