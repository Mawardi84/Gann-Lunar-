/**
 * Pure mathematical and algorithmic utility to calculate timeframe-specific
 * Swing High, Swing Low, Gann Factors, and Confluence Entry Zones.
 * Supports standard intervals: 1m, 5m, 15m, 30m, 1H, 4H, 1D, 1W, 1M.
 */

export type TimeframeId = '1' | '5' | '15' | '30' | '60' | '240' | 'D' | 'W' | 'M';

export interface TimeframeConfig {
  id: TimeframeId;
  label: string;
  name: string;
  category: 'Scalping' | 'Intraday' | 'Swing' | 'Position';
  rangeRatio: number; // Ratio of typical swing range relative to 24h range
  recommendedFactor: number; // Optimal W.D. Gann Square of 9 factor for this timeframe
  binanceInterval: string;
  approxMinutes: number;
}

export const TIMEFRAME_CONFIGS: Record<TimeframeId, TimeframeConfig> = {
  '1': {
    id: '1',
    label: '1m',
    name: '1 Menit (Ultra Scalp)',
    category: 'Scalping',
    rangeRatio: 0.08,
    recommendedFactor: 0.015625,
    binanceInterval: '1m',
    approxMinutes: 1,
  },
  '5': {
    id: '5',
    label: '5m',
    name: '5 Menit (Intraday Scalp)',
    category: 'Scalping',
    rangeRatio: 0.16,
    recommendedFactor: 0.03125,
    binanceInterval: '5m',
    approxMinutes: 5,
  },
  '15': {
    id: '15',
    label: '15m',
    name: '15 Menit (Day Trading M15)',
    category: 'Intraday',
    rangeRatio: 0.28,
    recommendedFactor: 0.0625,
    binanceInterval: '15m',
    approxMinutes: 15,
  },
  '30': {
    id: '30',
    label: '30m',
    name: '30 Menit (Intraday M30)',
    category: 'Intraday',
    rangeRatio: 0.42,
    recommendedFactor: 0.0625,
    binanceInterval: '30m',
    approxMinutes: 30,
  },
  '60': {
    id: '60',
    label: '1H',
    name: '1 Jam (Intraday Swing H1)',
    category: 'Intraday',
    rangeRatio: 0.60,
    recommendedFactor: 0.125,
    binanceInterval: '1h',
    approxMinutes: 60,
  },
  '240': {
    id: '240',
    label: '4H',
    name: '4 Jam (Major Swing H4)',
    category: 'Swing',
    rangeRatio: 0.85,
    recommendedFactor: 0.125,
    binanceInterval: '4h',
    approxMinutes: 240,
  },
  'D': {
    id: 'D',
    label: '1D',
    name: 'Daily (Harian D1)',
    category: 'Swing',
    rangeRatio: 1.00,
    recommendedFactor: 0.250,
    binanceInterval: '1d',
    approxMinutes: 1440,
  },
  'W': {
    id: 'W',
    label: '1W',
    name: 'Weekly (Mingguan W1)',
    category: 'Position',
    rangeRatio: 2.10,
    recommendedFactor: 0.375,
    binanceInterval: '1w',
    approxMinutes: 10080,
  },
  'M': {
    id: 'M',
    label: '1M',
    name: 'Monthly (Bulanan M1)',
    category: 'Position',
    rangeRatio: 4.50,
    recommendedFactor: 0.500,
    binanceInterval: '1M',
    approxMinutes: 43200,
  },
};

export interface EntryZoneInfo {
  buyZoneStart: number;
  buyZoneEnd: number;
  sellZoneStart: number;
  sellZoneEnd: number;
  fib50: number;
  fib618: number;
  gannS1: number;
  gannR1: number;
  confluenceStatus: 'ENTRY_ZONE_ACTIVE' | 'NEAR_ZONE' | 'RANGING';
  statusText: string;
}

export interface TimeframeLevelResult {
  interval: TimeframeId;
  label: string;
  name: string;
  category: string;
  high: number;
  low: number;
  range: number;
  recommendedFactor: number;
  entryZone: EntryZoneInfo;
}

/**
 * Calculates High and Low calibrated for a specific timeframe.
 * Automatically aligns Gann factors and detects confluence entry zones.
 */
export function calculateTimeframeLevels(
  currentPrice: number,
  base24hHigh: number,
  base24hLow: number,
  interval: string = 'D',
  historyPoints?: number[]
): TimeframeLevelResult {
  const tfKey = (interval in TIMEFRAME_CONFIGS ? interval : 'D') as TimeframeId;
  const config = TIMEFRAME_CONFIGS[tfKey];

  const decimals = currentPrice < 2 ? 4 : currentPrice < 50 ? 3 : 2;

  // Safeguard price & ranges
  const safePrice = currentPrice > 0 ? currentPrice : 100;
  let safeBaseHigh = base24hHigh > 0 ? base24hHigh : safePrice * 1.015;
  let safeBaseLow = base24hLow > 0 ? base24hLow : safePrice * 0.985;

  if (safeBaseHigh <= safeBaseLow) {
    safeBaseHigh = safePrice * 1.015;
    safeBaseLow = safePrice * 0.985;
  }

  const baseRange = Math.max(safeBaseHigh - safeBaseLow, safePrice * 0.008);

  let high: number;
  let low: number;

  if (tfKey === 'D') {
    high = safeBaseHigh;
    low = safeBaseLow;
  } else if (tfKey === 'W' || tfKey === 'M') {
    // Macro timeframes expand beyond 24h
    const expansion = baseRange * (config.rangeRatio - 1) * 0.5;
    high = safeBaseHigh + expansion;
    low = Math.max(safeBaseLow - expansion, safePrice * 0.5);
  } else {
    // Intraday & Scalping timeframes: compress range to timeframe swing
    let targetRange = baseRange * config.rangeRatio;

    // If real history buffer exists, consider local swing variance
    if (historyPoints && historyPoints.length >= 10) {
      // Window size proportional to timeframe
      const windowSize = Math.min(
        historyPoints.length,
        tfKey === '1' ? 8 : tfKey === '5' ? 18 : tfKey === '15' ? 35 : tfKey === '30' ? 60 : 100
      );
      const slice = historyPoints.slice(-windowSize);
      const minObserved = Math.min(...slice);
      const maxObserved = Math.max(...slice);
      const observedRange = maxObserved - minObserved;

      if (observedRange > 0 && observedRange >= targetRange * 0.5) {
        targetRange = Math.min(targetRange * 1.25, Math.max(targetRange * 0.75, observedRange));
      }
    }

    // Anchor position relative to where current price sits in 24h channel
    const positionIn24h = Math.min(
      Math.max((safePrice - safeBaseLow) / baseRange, 0.20),
      0.80
    );

    low = safePrice - targetRange * positionIn24h;
    high = safePrice + targetRange * (1 - positionIn24h);

    // Ensure price is within [low, high]
    if (safePrice < low) low = safePrice - targetRange * 0.15;
    if (safePrice > high) high = safePrice + targetRange * 0.15;
  }

  // Format to standard decimals
  high = parseFloat(high.toFixed(decimals));
  low = parseFloat(low.toFixed(decimals));
  const range = parseFloat((high - low).toFixed(decimals));

  // Compute entry zone metrics with recommended factor
  const factor = config.recommendedFactor;
  const root = Math.sqrt(safePrice);
  const gannS1 = parseFloat(Math.pow(root - factor, 2).toFixed(decimals));
  const gannR1 = parseFloat(Math.pow(root + factor, 2).toFixed(decimals));

  const fib50 = parseFloat((low + range * 0.5).toFixed(decimals));
  const fib618 = parseFloat((low + range * 0.618).toFixed(decimals));

  const buyZoneStart = Math.min(gannS1, fib50);
  const buyZoneEnd = Math.max(gannS1, fib618);

  const sellZoneStart = Math.min(gannR1, high);
  const sellZoneEnd = Math.max(gannR1, high);

  // Confluence detection
  let confluenceStatus: 'ENTRY_ZONE_ACTIVE' | 'NEAR_ZONE' | 'RANGING' = 'RANGING';
  let statusText = 'Harga bergerak di luar area entry utama';

  const inBuyZone = safePrice >= buyZoneStart * 0.998 && safePrice <= buyZoneEnd * 1.002;
  const inSellZone = safePrice >= sellZoneStart * 0.998 && safePrice <= sellZoneEnd * 1.002;

  if (inBuyZone) {
    confluenceStatus = 'ENTRY_ZONE_ACTIVE';
    statusText = `Area Buy Terdeteksi (Gann S1 ${gannS1} & Fib 50-61.8%)`;
  } else if (inSellZone) {
    confluenceStatus = 'ENTRY_ZONE_ACTIVE';
    statusText = `Area Sell Terdeteksi (Gann R1 ${gannR1} & Swing High)`;
  } else {
    const distToBuy = Math.abs(safePrice - buyZoneEnd) / safePrice;
    const distToSell = Math.abs(safePrice - sellZoneStart) / safePrice;
    if (distToBuy < 0.005 || distToSell < 0.005) {
      confluenceStatus = 'NEAR_ZONE';
      statusText = 'Mendekati Area Entry Terdeteksi (< 0.5%)';
    }
  }

  return {
    interval: tfKey,
    label: config.label,
    name: config.name,
    category: config.category,
    high,
    low,
    range,
    recommendedFactor: factor,
    entryZone: {
      buyZoneStart,
      buyZoneEnd,
      sellZoneStart,
      sellZoneEnd,
      fib50,
      fib618,
      gannS1,
      gannR1,
      confluenceStatus,
      statusText,
    },
  };
}

/**
 * Fetch real Binance klines for crypto timeframes if available (CORS friendly).
 */
export async function fetchBinanceTimeframeHighLow(
  binanceSymbol: string,
  interval: TimeframeId
): Promise<{ high: number; low: number } | null> {
  const config = TIMEFRAME_CONFIGS[interval];
  if (!config) return null;

  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(binanceSymbol)}&interval=${config.binanceInterval}&limit=20`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      let maxHigh = -Infinity;
      let minLow = Infinity;
      for (const kline of data) {
        const h = parseFloat(kline[2]);
        const l = parseFloat(kline[3]);
        if (!isNaN(h) && h > maxHigh) maxHigh = h;
        if (!isNaN(l) && l < minLow) minLow = l;
      }
      if (maxHigh > 0 && minLow > 0 && maxHigh > minLow) {
        return {
          high: maxHigh,
          low: minLow,
        };
      }
    }
  } catch (err) {
    console.warn(`Could not fetch Binance ${interval} klines for ${binanceSymbol}:`, err);
  }
  return null;
}
