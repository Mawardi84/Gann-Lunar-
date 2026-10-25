/**
 * Price Angle & Pythagoras Vector Calculation Module
 * Implements 4D Oracle Space Dimension automatic angle calculation.
 */

export interface PriceAngleResult {
  angle: number;           // sudut dalam derajat, 0-90
  angleLabel: string;      // misal "45°", "67°"
  trendStrength: 'Weak' | 'Moderate' | 'Strong' | 'Very Strong';
  trendStrengthLabel: string;  // dalam Bahasa Indonesia
  direction: 'Bullish' | 'Bearish' | 'Sideways';
  isHarmonic: boolean;        // true jika sudut 30°±5°, 45°±5°, atau 60°±5° (sudut Gann harmonis)
  oracleAngle: number;        // nilai angka untuk dikirim ke evaluate4DOracle
}

export function calculatePriceAngle(
  swingHigh: number,
  swingLow: number,
  currentPrice: number,
  barsElapsed: number = 20
): PriceAngleResult {
  // Edge case: empty or invalid prices
  if (!swingHigh || !swingLow || !currentPrice || swingHigh <= swingLow) {
    return {
      angle: 45,
      angleLabel: '45°',
      trendStrength: 'Moderate',
      trendStrengthLabel: 'Tren Moderat',
      direction: 'Sideways',
      isHarmonic: true,
      oracleAngle: 45,
    };
  }

  const priceRange = Math.max(swingHigh - swingLow, 0.0001);
  const midpoint = (swingHigh + swingLow) / 2;
  const priceDiffFromMid = currentPrice - midpoint;
  const relativeDiffRatio = Math.abs(priceDiffFromMid) / priceRange;

  // Direction determination
  let direction: PriceAngleResult['direction'];
  if (relativeDiffRatio < 0.02) {
    direction = 'Sideways';
  } else if (currentPrice > midpoint) {
    direction = 'Bullish';
  } else {
    direction = 'Bearish';
  }

  // Calculate Price Delta
  const priceDelta = currentPrice >= midpoint 
    ? currentPrice - swingLow 
    : swingHigh - currentPrice;

  // Calculate angle using arctan
  const timeFactor = barsElapsed / 20;
  const ratio = (priceDelta / priceRange) * timeFactor;
  const rawAngle = Math.atan(ratio) * (180 / Math.PI);
  const angle = Math.max(0, Math.min(90, Math.round(rawAngle)));

  // Trend strength classification
  let trendStrength: PriceAngleResult['trendStrength'];
  let trendStrengthLabel: string;

  if (angle <= 22) {
    trendStrength = 'Weak';
    trendStrengthLabel = 'Tren Lemah / Konsolidasi';
  } else if (angle <= 45) {
    trendStrength = 'Moderate';
    trendStrengthLabel = 'Tren Moderat';
  } else if (angle <= 67) {
    trendStrength = 'Strong';
    trendStrengthLabel = 'Tren Kuat (Harmonis Gann)';
  } else {
    trendStrength = 'Very Strong';
    trendStrengthLabel = 'Tren Sangat Kuat / Parabolik';
  }

  // Harmonic Gann Angle Check: 30°±5°, 45°±5°, 60°±5°
  const isHarmonic = 
    Math.abs(angle - 30) <= 5 || 
    Math.abs(angle - 45) <= 5 || 
    Math.abs(angle - 60) <= 5;

  return {
    angle,
    angleLabel: `${angle}°`,
    trendStrength,
    trendStrengthLabel,
    direction,
    isHarmonic,
    oracleAngle: angle,
  };
}
