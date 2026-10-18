/**
 * Gann Real-Time Backtest Simulation Engine
 * Simulates entry and exit triggers using Gann Levels (S1/R1) and Stop Loss rules
 * over client-side rolling price history buffers.
 */

export interface BacktestTradeLog {
  id: string;
  date: string;
  type: 'Buy at S1' | 'Sell at R1';
  entryPrice: number;
  exitPrice: number;
  levelHit: string;
  outcome: 'Success' | 'Failed';
  profit: number;
}

export interface BacktestResult {
  hasEnoughData: boolean;
  message?: string;
  totalSignals: number;
  winRate: number; // percentage, e.g. 75.0
  totalProfit: number;
  bestTrade: number;
  trades: BacktestTradeLog[];
}

export interface GannLevelsForBacktest {
  pivot: number;
  sup1: number;
  res1: number;
  sup2?: number;
  res2?: number;
}

/**
 * Runs a real simulation of Gann S1 / R1 entries and exits against a historical price sequence.
 */
export function runGannBacktest(
  priceHistory: number[],
  gannLevels: GannLevelsForBacktest,
  minDataPoints = 20
): BacktestResult {
  if (!priceHistory || priceHistory.length < minDataPoints) {
    return {
      hasEnoughData: false,
      message: 'Data historis belum cukup',
      totalSignals: 0,
      winRate: 0,
      totalProfit: 0,
      bestTrade: 0,
      trades: [],
    };
  }

  const { sup1, res1 } = gannLevels;
  if (!sup1 || !res1 || sup1 >= res1) {
    return {
      hasEnoughData: false,
      message: 'Level Gann tidak valid untuk backtest',
      totalSignals: 0,
      winRate: 0,
      totalProfit: 0,
      bestTrade: 0,
      trades: [],
    };
  }

  const longStopLoss = sup1 * 0.997;
  const longTakeProfit = res1;
  const shortStopLoss = res1 * 1.003;
  const shortTakeProfit = sup1;

  const trades: BacktestTradeLog[] = [];
  
  type Position = {
    type: 'LONG' | 'SHORT';
    entryPrice: number;
    startIndex: number;
  } | null;

  let activePosition: Position = null;

  for (let i = 0; i < priceHistory.length; i++) {
    const price = priceHistory[i];

    if (!activePosition) {
      // Entry triggers:
      // Long entry: price touches or dips below sup1, but above stop loss
      if (price <= sup1 && price > longStopLoss) {
        activePosition = {
          type: 'LONG',
          entryPrice: price,
          startIndex: i,
        };
      }
      // Short entry: price touches or spikes above res1, but below stop loss
      else if (price >= res1 && price < shortStopLoss) {
        activePosition = {
          type: 'SHORT',
          entryPrice: price,
          startIndex: i,
        };
      }
    } else {
      // Position is active, check exit conditions:
      if (activePosition.type === 'LONG') {
        if (price <= longStopLoss) {
          // Stop Loss Hit
          const profit = parseFloat((price - activePosition.entryPrice).toFixed(2));
          trades.push({
            id: `trade-${trades.length + 1}`,
            date: `Point #${i}`,
            type: 'Buy at S1',
            entryPrice: activePosition.entryPrice,
            exitPrice: price,
            levelHit: `Stop Loss (${longStopLoss.toFixed(2)})`,
            outcome: 'Failed',
            profit,
          });
          activePosition = null;
        } else if (price >= longTakeProfit) {
          // Take Profit Hit (Target R1)
          const profit = parseFloat((price - activePosition.entryPrice).toFixed(2));
          trades.push({
            id: `trade-${trades.length + 1}`,
            date: `Point #${i}`,
            type: 'Buy at S1',
            entryPrice: activePosition.entryPrice,
            exitPrice: price,
            levelHit: `Target R1 (${longTakeProfit.toFixed(2)})`,
            outcome: 'Success',
            profit,
          });
          activePosition = null;
        }
      } else if (activePosition.type === 'SHORT') {
        if (price >= shortStopLoss) {
          // Stop Loss Hit
          const profit = parseFloat((activePosition.entryPrice - price).toFixed(2));
          trades.push({
            id: `trade-${trades.length + 1}`,
            date: `Point #${i}`,
            type: 'Sell at R1',
            entryPrice: activePosition.entryPrice,
            exitPrice: price,
            levelHit: `Stop Loss (${shortStopLoss.toFixed(2)})`,
            outcome: 'Failed',
            profit,
          });
          activePosition = null;
        } else if (price <= shortTakeProfit) {
          // Take Profit Hit (Target S1)
          const profit = parseFloat((activePosition.entryPrice - price).toFixed(2));
          trades.push({
            id: `trade-${trades.length + 1}`,
            date: `Point #${i}`,
            type: 'Sell at R1',
            entryPrice: activePosition.entryPrice,
            exitPrice: price,
            levelHit: `Target S1 (${shortTakeProfit.toFixed(2)})`,
            outcome: 'Success',
            profit,
          });
          activePosition = null;
        }
      }
    }
  }

  if (trades.length === 0) {
    return {
      hasEnoughData: false,
      message: 'Data historis belum cukup (menunggu siklus osilasi S1/R1)',
      totalSignals: 0,
      winRate: 0,
      totalProfit: 0,
      bestTrade: 0,
      trades: [],
    };
  }

  const successCount = trades.filter((t) => t.outcome === 'Success').length;
  const winRate = parseFloat(((successCount / trades.length) * 100).toFixed(1));
  const totalProfit = parseFloat(trades.reduce((acc, t) => acc + t.profit, 0).toFixed(2));
  const bestTrade = parseFloat(Math.max(...trades.map((t) => t.profit)).toFixed(2));

  return {
    hasEnoughData: true,
    totalSignals: trades.length,
    winRate,
    totalProfit,
    bestTrade,
    trades,
  };
}
