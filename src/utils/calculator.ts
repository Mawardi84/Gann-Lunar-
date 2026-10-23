/**
 * Position Size & Gann Square of 9 Angle Calculator Utilities
 */

export interface PositionSizeResult {
  accountBalance: number;
  riskPercent: number;
  riskAmount: number;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  priceRisk: number;
  priceReward: number;
  riskRewardRatio: number;
  recommendedLots: number; // for Gold/FX standard lots
  totalUnits: number;
}

export interface GannWheelPosition {
  pivotPrice: number;
  currentPrice: number;
  deltaRoot: number;
  angleDegrees: number;
  normalizedAngle: number;
  quadrantName: string;
  nearestCardinalAngle: number;
  nearestOrdinalAngle: number;
}

/**
 * Calculate Risk Management Position Size
 */
export function calculatePositionSize(
  accountBalance: number,
  riskPercent: number,
  entryPrice: number,
  stopLossPrice: number,
  takeProfitPrice: number,
  contractSize: number = 100 // Default 100 for Gold (XAU/USD)
): PositionSizeResult {
  const balance = Math.max(1, accountBalance);
  const riskPct = Math.max(0.1, Math.min(100, riskPercent));
  const riskAmount = (balance * riskPct) / 100;

  const priceRisk = Math.abs(entryPrice - stopLossPrice);
  const priceReward = Math.abs(takeProfitPrice - entryPrice);

  const riskRewardRatio = priceRisk > 0 ? Number((priceReward / priceRisk).toFixed(2)) : 0;

  // Formula for standard lots: Lot = RiskAmount / (PriceRisk * ContractSize)
  let recommendedLots = 0;
  let totalUnits = 0;

  if (priceRisk > 0) {
    totalUnits = riskAmount / priceRisk;
    recommendedLots = Number((totalUnits / contractSize).toFixed(2));
  }

  return {
    accountBalance: balance,
    riskPercent: riskPct,
    riskAmount: Number(riskAmount.toFixed(2)),
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
    priceRisk: Number(priceRisk.toFixed(2)),
    priceReward: Number(priceReward.toFixed(2)),
    riskRewardRatio,
    recommendedLots,
    totalUnits: Number(totalUnits.toFixed(2)),
  };
}

/**
 * Calculate Gann Radial Wheel Angle Position
 */
export function calculateGannWheelPosition(pivotPrice: number, currentPrice: number): GannWheelPosition {
  const p = Math.max(0.0001, pivotPrice);
  const c = Math.max(0.0001, currentPrice);

  const rootPivot = Math.sqrt(p);
  const rootCurrent = Math.sqrt(c);
  const deltaRoot = rootCurrent - rootPivot;

  // 1 full turn (360 degrees) = 2.0 in Square of 9 root space
  const rawAngle = (deltaRoot / 2) * 360;
  let normalizedAngle = rawAngle % 360;
  if (normalizedAngle < 0) {
    normalizedAngle += 360;
  }

  let quadrantName = '0° - 90° (Kuadran I)';
  if (normalizedAngle >= 90 && normalizedAngle < 180) quadrantName = '90° - 180° (Kuadran II)';
  if (normalizedAngle >= 180 && normalizedAngle < 270) quadrantName = '180° - 270° (Kuadran III)';
  if (normalizedAngle >= 270 && normalizedAngle < 360) quadrantName = '270° - 360° (Kuadran IV)';

  const cardinals = [0, 90, 180, 270, 360];
  const ordinals = [45, 135, 225, 315];

  const nearestCardinal = cardinals.reduce((prev, curr) => 
    Math.abs(curr - normalizedAngle) < Math.abs(prev - normalizedAngle) ? curr : prev
  );

  const nearestOrdinal = ordinals.reduce((prev, curr) => 
    Math.abs(curr - normalizedAngle) < Math.abs(prev - normalizedAngle) ? curr : prev
  );

  return {
    pivotPrice: p,
    currentPrice: c,
    deltaRoot: Number(deltaRoot.toFixed(4)),
    angleDegrees: Number(rawAngle.toFixed(2)),
    normalizedAngle: Number(normalizedAngle.toFixed(2)),
    quadrantName,
    nearestCardinalAngle: nearestCardinal === 360 ? 0 : nearestCardinal,
    nearestOrdinalAngle: nearestOrdinal,
  };
}
