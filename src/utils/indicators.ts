/**
 * Technical Indicators Calculation Engine
 * Includes Wilder's RSI, MACD (12,26,9), Bollinger Bands (20,2), Real EMA20/EMA50,
 * Gann Square of 9 Vibration, Fibonacci Confluence, Lunar Volatility Clock,
 * Pythagoras Vector, and Homma Candlestick.
 */

export interface IndicatorMetrics {
  isCollectingData: boolean;
  dataPointsCount: number;
  // Momentum
  rsi: {
    value: number | null;
    status: 'Oversold' | 'Neutral' | 'Overbought' | 'Mengumpulkan data...';
    signal: 'Bullish' | 'Neutral' | 'Bearish' | 'Mengumpulkan data...';
    isCollecting: boolean;
  };
  // Moving Averages & Trend
  ema20: number | null;
  ema50: number | null;
  trend: 'Uptrend' | 'Downtrend' | 'Sideways' | 'Mengumpulkan data...';
  // Bollinger Bands
  bollinger: {
    upper: number | null;
    middle: number | null;
    lower: number | null;
    bandwidth: number | null;
    percentB: number | null;
    status: 'Squeeze' | 'Normal' | 'Expansion' | 'Mengumpulkan data...';
    isCollecting: boolean;
  };
  // MACD
  macd: {
    macdLine: number | null;
    signalLine: number | null;
    histogram: number | null;
    signal: 'Bullish Crossover' | 'Bullish Momentum' | 'Bearish Crossover' | 'Bearish Momentum' | 'Mengumpulkan data...';
    isCollecting: boolean;
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
 * Calculates exponential moving average series from a number array.
 */
export function calculateEMASeries(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  const k = 2 / (period + 1);
  const emaSeries: number[] = [];
  
  // Initial SMA for first 'period' elements
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  let currentEma = sum / period;
  emaSeries.push(currentEma);

  for (let i = period; i < prices.length; i++) {
    currentEma = (prices[i] - currentEma) * k + currentEma;
    emaSeries.push(currentEma);
  }
  return emaSeries;
}

/**
 * Calculates Wilder's Smoothing RSI (14 period)
 */
export function calculateWildersRSI(prices: number[], period = 14): {
  value: number;
  status: 'Oversold' | 'Neutral' | 'Overbought';
  signal: 'Bullish' | 'Neutral' | 'Bearish';
} | null {
  if (prices.length < period + 1) return null;

  let gainSum = 0;
  let lossSum = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) {
      gainSum += diff;
    } else {
      lossSum += Math.abs(diff);
    }
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  let rsiValue: number;
  if (avgLoss === 0) {
    rsiValue = 100;
  } else {
    const rs = avgGain / avgLoss;
    rsiValue = 100 - (100 / (1 + rs));
  }
  rsiValue = parseFloat(rsiValue.toFixed(1));

  let status: 'Oversold' | 'Neutral' | 'Overbought' = 'Neutral';
  let signal: 'Bullish' | 'Neutral' | 'Bearish' = 'Neutral';

  if (rsiValue >= 70) {
    status = 'Overbought';
    signal = 'Bearish';
  } else if (rsiValue <= 30) {
    status = 'Oversold';
    signal = 'Bullish';
  } else if (rsiValue > 50) {
    status = 'Neutral';
    signal = 'Bullish';
  } else {
    status = 'Neutral';
    signal = 'Bearish';
  }

  return { value: rsiValue, status, signal };
}

/**
 * Calculates Bollinger Bands (period 20, 2 stdDev)
 */
export function calculateBollingerBands(prices: number[], period = 20, multiplier = 2): {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
  percentB: number;
  status: 'Squeeze' | 'Normal' | 'Expansion';
} | null {
  if (prices.length < period) return null;

  const slice = prices.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  const middle = sum / period;

  const variance = slice.reduce((acc, val) => acc + Math.pow(val - middle, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = middle + multiplier * stdDev;
  const lower = middle - multiplier * stdDev;
  const currentPrice = prices[prices.length - 1];

  const bandwidth = middle > 0 ? ((upper - lower) / middle) * 100 : 0;
  const percentB = upper !== lower ? ((currentPrice - lower) / (upper - lower)) * 100 : 50;
  const status: 'Squeeze' | 'Normal' | 'Expansion' = bandwidth < 2 ? 'Squeeze' : bandwidth > 8 ? 'Expansion' : 'Normal';

  return {
    upper: parseFloat(upper.toFixed(2)),
    middle: parseFloat(middle.toFixed(2)),
    lower: parseFloat(lower.toFixed(2)),
    bandwidth: parseFloat(bandwidth.toFixed(2)),
    percentB: parseFloat(percentB.toFixed(1)),
    status,
  };
}

/**
 * Calculates MACD (12, 26, 9)
 */
export function calculateMACD(prices: number[], fast = 12, slow = 26, signalPeriod = 9): {
  macdLine: number;
  signalLine: number;
  histogram: number;
  signal: 'Bullish Crossover' | 'Bullish Momentum' | 'Bearish Crossover' | 'Bearish Momentum';
} | null {
  if (prices.length < slow + signalPeriod) return null;

  // We need EMA12 and EMA26 aligned
  // Fast multiplier and slow multiplier
  const kFast = 2 / (fast + 1);
  const kSlow = 2 / (slow + 1);

  // Initial SMA for slow
  let slowSum = 0;
  for (let i = 0; i < slow; i++) {
    slowSum += prices[i];
  }
  let slowEma = slowSum / slow;

  // Fast SMA for same starting point
  let fastSum = 0;
  for (let i = slow - fast; i < slow; i++) {
    fastSum += prices[i];
  }
  let fastEma = fastSum / fast;

  const macdSeries: number[] = [fastEma - slowEma];

  for (let i = slow; i < prices.length; i++) {
    fastEma = (prices[i] - fastEma) * kFast + fastEma;
    slowEma = (prices[i] - slowEma) * kSlow + slowEma;
    macdSeries.push(fastEma - slowEma);
  }

  if (macdSeries.length < signalPeriod) return null;

  const signalSeries = calculateEMASeries(macdSeries, signalPeriod);
  if (signalSeries.length === 0) return null;

  const currentMacd = parseFloat(macdSeries[macdSeries.length - 1].toFixed(2));
  const currentSignal = parseFloat(signalSeries[signalSeries.length - 1].toFixed(2));
  const histogram = parseFloat((currentMacd - currentSignal).toFixed(2));

  let signal: 'Bullish Crossover' | 'Bullish Momentum' | 'Bearish Crossover' | 'Bearish Momentum' = 'Bullish Momentum';
  if (histogram >= 0 && currentMacd >= currentSignal) {
    signal = histogram > Math.abs(currentMacd) * 0.25 ? 'Bullish Crossover' : 'Bullish Momentum';
  } else {
    signal = histogram < -Math.abs(currentMacd) * 0.25 ? 'Bearish Crossover' : 'Bearish Momentum';
  }

  return {
    macdLine: currentMacd,
    signalLine: currentSignal,
    histogram,
    signal,
  };
}

/**
 * Calculates technical indicators given price action parameters and real price history.
 */
export function calculateTechnicalIndicators(
  currentPrice: number,
  swingHigh: number,
  swingLow: number,
  trendAngle = 45,
  candlePattern = 'Hammer / Pin Bar',
  moonDate?: Date,
  priceHistory?: number[]
): IndicatorMetrics {
  const price = Math.max(0.0001, currentPrice);
  const high = Math.max(price, swingHigh);
  const low = Math.min(price, swingLow);
  const range = Math.max(0.0001, high - low);

  const history = priceHistory || [];
  const count = history.length;
  const hasHistory = count >= 20;

  // 1. RSI
  const rsiCalc = count >= 15 ? calculateWildersRSI(history, 14) : null;
  const rsiValue = rsiCalc ? rsiCalc.value : null;
  const rsiStatus = rsiCalc ? rsiCalc.status : 'Mengumpulkan data...';
  const rsiSignal = rsiCalc ? rsiCalc.signal : 'Mengumpulkan data...';

  // 2. EMA20 & EMA50
  const ema20Series = count >= 20 ? calculateEMASeries(history, 20) : [];
  const ema50Series = count >= 50 ? calculateEMASeries(history, 50) : [];
  const ema20 = ema20Series.length > 0 ? parseFloat(ema20Series[ema20Series.length - 1].toFixed(2)) : null;
  const ema50 = ema50Series.length > 0 ? parseFloat(ema50Series[ema50Series.length - 1].toFixed(2)) : null;

  let trend: 'Uptrend' | 'Downtrend' | 'Sideways' | 'Mengumpulkan data...' = 'Mengumpulkan data...';
  if (ema20 !== null && ema50 !== null) {
    trend = price > ema20 && ema20 > ema50 ? 'Uptrend' : price < ema20 && ema20 < ema50 ? 'Downtrend' : 'Sideways';
  } else if (ema20 !== null) {
    trend = price > ema20 ? 'Uptrend' : 'Downtrend';
  }

  // 3. Bollinger Bands
  const bbCalc = count >= 20 ? calculateBollingerBands(history, 20, 2) : null;
  const bbStatus = bbCalc ? bbCalc.status : 'Mengumpulkan data...';

  // 4. MACD
  const macdCalc = count >= 35 ? calculateMACD(history, 12, 26, 9) : null;
  const macdSignal = macdCalc ? macdCalc.signal : 'Mengumpulkan data...';

  // 5. Gann Square of 9 Vibration Angle (rule-based from price)
  const root = Math.sqrt(price);
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
  const refNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
  const synodicMonthMs = 29.53058867 * 24 * 60 * 60 * 1000;
  const elapsedMs = date.getTime() - refNewMoon;
  const cycles = (elapsedMs % synodicMonthMs) / synodicMonthMs;
  const moonAgeDays = cycles * 29.53058867;
  const illuminationPct = Math.round((1 - Math.cos(cycles * 2 * Math.PI)) / 2 * 100);

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

  if (rsiValue !== null) {
    if (rsiValue >= 45 && rsiValue <= 65) score += 5;
    else if (rsiValue < 30) score += 8;
    else if (rsiValue > 70) score -= 8;
  }
  if (macdCalc && macdSignal.includes('Bullish')) score += 6;

  score = Math.min(98, Math.max(10, score));

  let overallVerdict: 'STRONG BUY' | 'BUY' | 'STANDBY / NEUTRAL' | 'SELL' | 'STRONG SELL' = 'STANDBY / NEUTRAL';
  if (score >= 80) overallVerdict = 'STRONG BUY';
  else if (score >= 65) overallVerdict = 'BUY';
  else if (score <= 30) overallVerdict = 'STRONG SELL';
  else if (score <= 42) overallVerdict = 'SELL';

  return {
    isCollectingData: !hasHistory,
    dataPointsCount: count,
    rsi: {
      value: rsiValue,
      status: rsiStatus,
      signal: rsiSignal,
      isCollecting: rsiCalc === null,
    },
    ema20,
    ema50,
    trend,
    bollinger: {
      upper: bbCalc ? bbCalc.upper : null,
      middle: bbCalc ? bbCalc.middle : null,
      lower: bbCalc ? bbCalc.lower : null,
      bandwidth: bbCalc ? bbCalc.bandwidth : null,
      percentB: bbCalc ? bbCalc.percentB : null,
      status: bbStatus,
      isCollecting: bbCalc === null,
    },
    macd: {
      macdLine: macdCalc ? macdCalc.macdLine : null,
      signalLine: macdCalc ? macdCalc.signalLine : null,
      histogram: macdCalc ? macdCalc.histogram : null,
      signal: macdSignal,
      isCollecting: macdCalc === null,
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
