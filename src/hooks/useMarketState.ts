import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { calculateGannLevels, calculateFibonacciLevels, evaluate4DOracle, OracleDecisionResult, GannLevels, FibonacciLevels } from '../utils/gann';
import { calculateTechnicalIndicators, IndicatorMetrics } from '../utils/indicators';
import { runGannBacktest, BacktestResult } from '../utils/backtest';
import { fetchDirectLiveMarketPrices } from '../utils/marketFeeds';
import { 
  calculateTimeframeLevels, 
  TimeframeLevelResult, 
  TIMEFRAME_CONFIGS, 
  TimeframeId, 
  fetchBinanceTimeframeHighLow 
} from '../utils/timeframeLevels';
import { calculateLunarPhase, LunarPhaseResult } from '../utils/lunarCycle';
import { calculatePriceAngle, PriceAngleResult } from '../utils/priceAngle';
import { detectCandlestickPattern, CandlestickPatternResult } from '../utils/candlestickPattern';

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  isGreen: boolean;
  pivot: number;
}

export interface CalculationResult {
  pivot: number;
  factor: number;
  root: number;
  res1: number;
  sup1: number;
  res1Steps: string;
  sup1Steps: string;
  res2: number;
  sup2: number;
  res3: number;
  sup3: number;
  buyZoneStart: number;
  buyZoneEnd: number;
  sellZoneStart: number;
  sellZoneEnd: number;
  fib382: number;
  fib500: number;
  fib618: number;
  aiAnalysis: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  sentimentScore: number;
  candles: Candle[];
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  tvSymbol: string;
  price: number;
  high: number;
  low: number;
  change: number;
  isUp: boolean;
  factor: number;
  source?: 'live' | 'fallback';
  flash?: 'up' | 'down' | null;
}

export interface JournalEntry {
  id: string;
  timestamp: string;
  asset: string;
  oracleReport?: string;
  price: number;
  confluenceScore?: number;
  decision?: string;
  entryType?: 'SNAPSHOT' | 'TRADE';
  tradeDirection?: 'BUY' | 'SELL';
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize?: number;
  pnlAmount?: number;
  tradeStatus?: 'WIN' | 'LOSS' | 'OPEN' | 'CANCELLED';
  strategyTag?: string;
  notes?: string;
  psychologyRating?: 'Disiplin' | 'FOMO' | 'Dendam' | 'Sabar' | 'Impulsif';
}

export type TabType = 
  | 'landing' 
  | 'oracle' 
  | 'dashboard' 
  | 'indicators' 
  | 'calculator' 
  | 'signal' 
  | 'chart' 
  | 'backtest' 
  | 'journal'
  | 'fundamental'
  | 'calendar';

export const INITIAL_WATCHLIST: WatchlistItem[] = [
  { symbol: 'XAU/USD', name: 'Gold Spot', tvSymbol: 'OANDA:XAUUSD', price: 4164.86, high: 4199.08, low: 4147.16, change: -0.14, isUp: false, factor: 0.125, source: 'fallback' },
  { symbol: 'XAG/USD', name: 'Silver Spot', tvSymbol: 'OANDA:XAGUSD', price: 32.45, high: 33.10, low: 31.90, change: +0.45, isUp: true, factor: 0.125, source: 'fallback' },
  { symbol: 'BTC/USD', name: 'Bitcoin', tvSymbol: 'BINANCE:BTCUSDT', price: 81320.00, high: 82940.80, low: 80809.25, change: -1.13, isUp: true, factor: 0.125, source: 'fallback' },
  { symbol: 'ETH/USD', name: 'Ethereum', tvSymbol: 'BINANCE:ETHUSDT', price: 2415.72, high: 2494.00, low: 2393.48, change: -1.09, isUp: true, factor: 0.125, source: 'fallback' },
  { symbol: 'SOL/USD', name: 'Solana', tvSymbol: 'BINANCE:SOLUSDT', price: 103.81, high: 107.44, low: 102.80, change: -1.55, isUp: false, factor: 0.125, source: 'fallback' },
  { symbol: 'BNB/USD', name: 'Binance Coin', tvSymbol: 'BINANCE:BNBUSDT', price: 615.40, high: 628.00, low: 610.10, change: +0.82, isUp: true, factor: 0.125, source: 'fallback' },
  { symbol: 'XRP/USD', name: 'Ripple', tvSymbol: 'BINANCE:XRPUSDT', price: 2.35, high: 2.44, low: 2.28, change: +2.10, isUp: true, factor: 0.125, source: 'fallback' },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', tvSymbol: 'FX:EURUSD', price: 1.1228, high: 1.1269, low: 1.1208, change: +0.07, isUp: true, factor: 0.125, source: 'fallback' },
  { symbol: 'GBP/USD', name: 'British Pound', tvSymbol: 'FX:GBPUSD', price: 1.3315, high: 1.3372, low: 1.3262, change: +0.29, isUp: true, factor: 0.125, source: 'fallback' },
  { symbol: 'USD/JPY', name: 'US Dollar / Yen', tvSymbol: 'FX:USDJPY', price: 152.40, high: 153.15, low: 151.90, change: -0.18, isUp: false, factor: 0.125, source: 'fallback' },
  { symbol: 'AUD/USD', name: 'Australian Dollar', tvSymbol: 'FX:AUDUSD', price: 0.6712, high: 0.6745, low: 0.6690, change: +0.15, isUp: true, factor: 0.125, source: 'fallback' },
  { symbol: 'S&P 500', name: 'US 500 Index', tvSymbol: 'SP:SPX', price: 7657.01, high: 7756.84, low: 7651.91, change: -1.12, isUp: false, factor: 0.125, source: 'fallback' },
  { symbol: 'NASDAQ', name: 'Nasdaq 100', tvSymbol: 'NASDAQ:NDX', price: 20450.80, high: 20680.00, low: 20390.10, change: -0.75, isUp: false, factor: 0.125, source: 'fallback' },
  { symbol: 'DOW JONES', name: 'Dow Jones Industrial', tvSymbol: 'DJ:DJI', price: 43210.50, high: 43500.00, low: 43100.00, change: +0.34, isUp: true, factor: 0.125, source: 'fallback' },
  { symbol: 'OIL/USD', name: 'Crude Oil WTI', tvSymbol: 'NYMEX:CL1!', price: 98.57, high: 99.00, low: 95.29, change: +0.61, isUp: true, factor: 0.125, source: 'fallback' },
  { symbol: 'GAS/USD', name: 'Natural Gas', tvSymbol: 'NYMEX:NG1!', price: 2.85, high: 2.92, low: 2.78, change: -1.20, isUp: false, factor: 0.125, source: 'fallback' },
  { symbol: 'AAPL', name: 'Apple Inc', tvSymbol: 'NASDAQ:AAPL', price: 235.60, high: 238.20, low: 234.10, change: +1.15, isUp: true, factor: 0.125, source: 'fallback' },
  { symbol: 'TSLA', name: 'Tesla Inc', tvSymbol: 'NASDAQ:TSLA', price: 242.80, high: 248.50, low: 239.00, change: -2.30, isUp: false, factor: 0.125, source: 'fallback' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', tvSymbol: 'NASDAQ:NVDA', price: 138.45, high: 141.20, low: 137.00, change: +2.45, isUp: true, factor: 0.125, source: 'fallback' }
];

export function useMarketState() {
  const [activeTab, setActiveTab] = useState<TabType>('landing');
  const [pivotInput, setPivotInput] = useState<string>('4164.86');
  const [factorInput, setFactorInput] = useState<string>('0.125');
  const [assetName, setAssetName] = useState<string>('XAU/USD (Gold Spot)');
  const [tvSymbol, setTvSymbol] = useState<string>('OANDA:XAUUSD');
  const [chartSource, setChartSource] = useState<'tradingview' | 'simulation'>('tradingview');
  const [volatility, setVolatility] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [showOracleChart, setShowOracleChart] = useState<boolean>(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);

  // Advanced TradingView Chart Customization States
  const [chartInterval, setChartInterval] = useState<string>('D');
  const [chartStyle, setChartStyle] = useState<string>('1'); // 1: Candles, 0: Bars, 3: Line, 9: Area, 8: Heiken Ashi
  const [chartTheme, setChartTheme] = useState<'dark' | 'light'>('dark');
  const [chartTimezone, setChartTimezone] = useState<string>('Etc/UTC');
  const [showSideToolbar, setShowSideToolbar] = useState<boolean>(true);
  const [isChartFullscreen, setIsChartFullscreen] = useState<boolean>(false);

  // 4D Market Oracle States
  const [oracleSwingHigh, setOracleSwingHigh] = useState<string>('4199.08');
  const [oracleSwingLow, setOracleSwingLow] = useState<string>('4147.16');
  const [oracleLunarPhase, setOracleLunarPhase] = useState<string>('Full Moon (H-1) - Jendela Volatilitas Tinggi');
  const [oracleAngle, setOracleAngle] = useState<string>('45');
  const [oracleCandle, setOracleCandle] = useState<string>('Bullish Pin Bar / Hammer (Rejection)');
  const [oracleAiReport, setOracleAiReport] = useState<string>('');
  const [oracleAiLoading, setOracleAiLoading] = useState<boolean>(false);
  const [matrixSynced, setMatrixSynced] = useState<boolean>(true);
  const [syncGlowing, setSyncGlowing] = useState<boolean>(false);
  const [copiedFormat, setCopiedFormat] = useState<boolean>(false);
  const [marketSpaceChartMode, setMarketSpaceChartMode] = useState<'simulation' | 'tradingview'>('simulation');

  // Live active asset ticker
  const [livePrice, setLivePrice] = useState<number>(4164.86);
  const [liveHigh, setLiveHigh] = useState<number>(4199.08);
  const [liveLow, setLiveLow] = useState<number>(4147.16);
  const [priceChange, setPriceChange] = useState<number>(-0.14);
  const [isPriceUp, setIsPriceUp] = useState<boolean>(false);
  const [priceSource, setPriceSource] = useState<'live' | 'fallback'>('fallback');
  const [activePriceFlash, setActivePriceFlash] = useState<'up' | 'down' | null>(null);

  // Price Flash tracking ref
  const prevPricesRef = useRef<Record<string, number>>({});

  // Watchlist
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(INITIAL_WATCHLIST);

  // Real rolling price history buffer (at least 200 data points per asset)
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>(() => {
    try {
      const stored = localStorage.getItem('gann_price_history_v2');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read price history from storage', e);
    }
    return {};
  });

  // Journal entries (localStorage backed)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem('gann_journal');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveToJournal = useCallback((entry: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    };
    setJournalEntries(prev => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem('gann_journal', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save journal', e);
      }
      return updated;
    });
  }, []);

  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('gann_journal', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to delete journal entry', e);
      }
      return updated;
    });
  }, []);

  const clearJournal = useCallback(() => {
    setJournalEntries([]);
    localStorage.removeItem('gann_journal');
  }, []);

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // News Ticker
  const [isNewsTickerVisible, setIsNewsTickerVisible] = useState<boolean>(true);
  const [newsTickerSpeed, setNewsTickerSpeed] = useState<number>(60);
  const [isNewsTickerPinned, setIsNewsTickerPinned] = useState<boolean>(true);

  // TradingView Studies
  const [selectedStudies, setSelectedStudies] = useState<string[]>([
    'RSI@tv-basicstudies',
    'MASimple@tv-basicstudies',
  ]);

  const handleToggleStudy = useCallback((studyId: string) => {
    setSelectedStudies(prev =>
      prev.includes(studyId) ? prev.filter(s => s !== studyId) : [...prev, studyId]
    );
  }, []);

  const handleSelectStudyPreset = useCallback((presetName: 'momentum' | 'trend' | 'all' | 'clean') => {
    if (presetName === 'momentum') {
      setSelectedStudies(['RSI@tv-basicstudies', 'MACD@tv-basicstudies', 'StochasticRSI@tv-basicstudies']);
    } else if (presetName === 'trend') {
      setSelectedStudies(['MASimple@tv-basicstudies', 'MAExp@tv-basicstudies', 'BB@tv-basicstudies']);
    } else if (presetName === 'all') {
      setSelectedStudies([
        'RSI@tv-basicstudies',
        'MACD@tv-basicstudies',
        'BB@tv-basicstudies',
        'MASimple@tv-basicstudies',
        'Volume@tv-basicstudies',
      ]);
    } else {
      setSelectedStudies([]);
    }
  }, []);

  // Poll real-time market prices & accumulate into rolling time-series buffer (>= 200 points)
  useEffect(() => {
    let isMounted = true;
    const fetchLivePrices = async () => {
      try {
        let priceMap: Record<string, { price: number; high: number; low: number; change: number; source?: 'live' | 'fallback' }> | null = null;
        let backendFailed = false;

        // Step 1: Attempt to query backend endpoint
        try {
          console.log('Fetching live prices from backend...');
          const res = await fetch('/api/market/live-prices');
          if (res.ok) {
            const data = await res.json();
            if (data && data.prices) {
              priceMap = data.prices;
              console.log('Backend live prices received:', priceMap);
            }
          } else {
            console.error('Backend API returned error:', res.status, await res.text());
            backendFailed = true;
          }
        } catch (e) {
          console.error('Backend API fetch failed:', e);
          backendFailed = true;
        }

        // Step 2: Fallback or overlay with direct client-side open market feeds if backend fails or returns any fallback data
        if (!priceMap || Object.values(priceMap).some(p => p.source === 'fallback')) {
          try {
            const direct = await fetchDirectLiveMarketPrices();
            if (direct && Object.keys(direct).length > 0) {
              priceMap = priceMap || {};
              for (const [sym, data] of Object.entries(direct)) {
                if (!priceMap[sym] || priceMap[sym].source === 'fallback' || data.source === 'live') {
                  priceMap[sym] = data;
                }
              }
            }
          } catch (e) {
            console.warn('Direct live market feed error:', e);
          }
        }

        if (priceMap && isMounted) {
          const validPriceMap = priceMap;
          // 1. Update watchlist with flash animation triggers
          setWatchlist(prev => prev.map(item => {
            const liveData = validPriceMap[item.symbol];
            if (liveData) {
              const newPrice = liveData.price;
              const newHigh = liveData.high;
              const newLow = liveData.low;
              const newChange = liveData.change;
              const isUp = newPrice >= item.price;
              const src = liveData.source || 'live';

              const prevPrice = prevPricesRef.current[item.symbol] ?? item.price;
              let itemFlash: 'up' | 'down' | null = null;
              if (newPrice > prevPrice) {
                itemFlash = 'up';
              } else if (newPrice < prevPrice) {
                itemFlash = 'down';
              }
              prevPricesRef.current[item.symbol] = newPrice;

              if (assetName.includes(item.symbol)) {
                setLivePrice(newPrice);
                setLiveHigh(newHigh);
                setLiveLow(newLow);
                setPriceChange(newChange);
                setIsPriceUp(isUp);
                setPriceSource(src);
                if (itemFlash) {
                  setActivePriceFlash(itemFlash);
                  setTimeout(() => setActivePriceFlash(null), 400);
                }

                if (autoSyncEnabled) {
                  setPivotInput(newPrice.toString());
                  const tfLevels = calculateTimeframeLevels(newPrice, newHigh, newLow, chartInterval);
                  setOracleSwingHigh(tfLevels.high.toString());
                  setOracleSwingLow(tfLevels.low.toString());
                }
              }

              return {
                ...item,
                price: newPrice,
                high: newHigh,
                low: newLow,
                change: newChange,
                isUp,
                source: src,
                flash: itemFlash,
              };
            }
            return item;
          }));

          // 2. Accumulate price history buffer per asset (minimum 200 points cap)
          setPriceHistory(prev => {
            const updated = { ...prev };
            for (const [sym, priceObj] of Object.entries(validPriceMap as Record<string, { price: number }>)) {
              const currentList = updated[sym] ? [...updated[sym]] : [];
              currentList.push(priceObj.price);
              if (currentList.length > 250) {
                updated[sym] = currentList.slice(-200);
              } else {
                updated[sym] = currentList;
              }
            }
            try {
              localStorage.setItem('gann_price_history_v2', JSON.stringify(updated));
            } catch {
              // Ignore local storage quota
            }
            return updated;
          });
        }
      } catch (err) {
        console.error('Failed to fetch real-time market prices:', err);
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [assetName, autoSyncEnabled, chartInterval]);

  // Gann calculation
  const calculateGann = useCallback(async (
    useAi = false,
    overridePivot?: number,
    overrideFactor?: number,
    overrideHigh?: number,
    overrideLow?: number
  ) => {
    const pivot = overridePivot !== undefined ? overridePivot : parseFloat(pivotInput);
    const factor = overrideFactor !== undefined ? overrideFactor : parseFloat(factorInput);
    const currentHigh = overrideHigh !== undefined ? overrideHigh : parseFloat(oracleSwingHigh);
    const currentLow = overrideLow !== undefined ? overrideLow : parseFloat(oracleSwingLow);

    if (isNaN(pivot) || pivot <= 0 || isNaN(factor) || factor <= 0) {
      return;
    }

    const decimals = pivot < 10 ? 4 : 2;
    const gann = calculateGannLevels(pivot, factor);
    const fib = calculateFibonacciLevels(
      !isNaN(currentHigh) ? currentHigh : pivot * 1.02,
      !isNaN(currentLow) ? currentLow : pivot * 0.98
    );

    const res1Steps = `(√${pivot.toFixed(2)} + ${factor})² = (${gann.root.toFixed(4)} + ${factor})² = ${(gann.root + factor).toFixed(4)}² = ${gann.res1.toFixed(decimals)}`;
    const sup1Steps = `(√${pivot.toFixed(2)} - ${factor})² = (${gann.root.toFixed(4)} - ${factor})² = ${(gann.root - factor).toFixed(4)}² = ${gann.sup1.toFixed(decimals)}`;

    // Candlestick path
    const candles: Candle[] = [];
    const periods = 12;
    const range = gann.res1 - gann.sup1;
    const waveMultiplier = volatility === 'Low' ? 0.2 : volatility === 'High' ? 0.8 : 0.45;
    const noiseMultiplier = volatility === 'Low' ? 0.05 : volatility === 'High' ? 0.25 : 0.1;

    let prevClose = pivot;
    for (let i = 0; i < periods; i++) {
      const progress = i / (periods - 1);
      const wave = Math.sin(progress * Math.PI * 2.5) * waveMultiplier;
      const noise = Math.sin(i * 1.8) * noiseMultiplier;
      const targetPrice = pivot + range * (wave + noise);

      const open = prevClose;
      const close = parseFloat(targetPrice.toFixed(decimals));
      const highVal = parseFloat((Math.max(open, close) + Math.abs(range * 0.08 * Math.random())).toFixed(decimals));
      const lowVal = parseFloat((Math.min(open, close) - Math.abs(range * 0.08 * Math.random())).toFixed(decimals));
      const isGreen = close >= open;

      candles.push({
        time: `T-${periods - i}`,
        open,
        high: highVal,
        low: lowVal,
        close,
        isGreen,
        pivot,
      });
      prevClose = close;
    }
    candles[candles.length - 1].close = pivot;

    let analysisText = `Berdasarkan analisis Square of 9 W.D. Gann dengan harga acuan ${pivot} dan faktor sudut ${factor}, area akumulasi buy yang ketat berada di sekitar support S1 (${gann.sup1.toFixed(decimals)}) hingga ${gann.buyZoneEnd.toFixed(decimals)}, sedangkan area distribusi sell berada di sekitar Resisten R1 (${gann.res1.toFixed(decimals)}) hingga ${gann.sellZoneEnd.toFixed(decimals)}.`;

    setLoading(true);
    if (useAi) {
      try {
        const res = await fetch('/api/gann/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pivot,
            angleFactor: factor,
            resistance: gann.res1.toFixed(decimals),
            support: gann.sup1.toFixed(decimals),
            assetName,
          }),
        });
        const text = await res.text();
        if (text && text.trim().startsWith('{')) {
          try {
            const data = JSON.parse(text);
            if (data && data.analysis) {
              analysisText = data.analysis;
            }
          } catch {
            // Ignore non-json
          }
        }
      } catch (err) {
        console.error('AI analysis error:', err);
      }
    }

    setResult({
      pivot,
      factor,
      root: gann.root,
      res1: parseFloat(gann.res1.toFixed(decimals)),
      sup1: parseFloat(gann.sup1.toFixed(decimals)),
      res1Steps,
      sup1Steps,
      res2: parseFloat(gann.res2.toFixed(decimals)),
      sup2: parseFloat(gann.sup2.toFixed(decimals)),
      res3: parseFloat(gann.res3.toFixed(decimals)),
      sup3: parseFloat(gann.sup3.toFixed(decimals)),
      buyZoneStart: parseFloat(gann.buyZoneStart.toFixed(decimals)),
      buyZoneEnd: parseFloat(gann.buyZoneEnd.toFixed(decimals)),
      sellZoneStart: parseFloat(gann.sellZoneStart.toFixed(decimals)),
      sellZoneEnd: parseFloat(gann.sellZoneEnd.toFixed(decimals)),
      fib382: parseFloat(fib.fib382.toFixed(decimals)),
      fib500: parseFloat(fib.fib500.toFixed(decimals)),
      fib618: parseFloat(fib.fib618.toFixed(decimals)),
      aiAnalysis: analysisText,
      sentiment: 'Bullish',
      sentimentScore: 70,
      candles,
    });
    setLoading(false);
  }, [pivotInput, factorInput, oracleSwingHigh, oracleSwingLow, volatility, assetName]);

  useEffect(() => {
    calculateGann(false);
  }, [volatility]);

  // Derived current symbol string (e.g. 'XAU/USD')
  const currentSymbol = useMemo(() => {
    const match = assetName.split(' ')[0];
    return match || 'XAU/USD';
  }, [assetName]);

  const currentAssetHistory = useMemo(() => {
    return priceHistory[currentSymbol] || [];
  }, [priceHistory, currentSymbol]);

  const changeTimeframe = useCallback(async (newInterval: string) => {
    setChartInterval(newInterval);

    let tfHigh: number | null = null;
    let tfLow: number | null = null;

    const cryptoMap: Record<string, string> = {
      'BTC/USD': 'BTCUSDT',
      'ETH/USD': 'ETHUSDT',
      'SOL/USD': 'SOLUSDT',
      'BNB/USD': 'BNBUSDT',
      'XRP/USD': 'XRPUSDT',
    };
    const bSymbol = cryptoMap[currentSymbol];
    if (bSymbol && (newInterval in TIMEFRAME_CONFIGS)) {
      try {
        const klineResult = await fetchBinanceTimeframeHighLow(bSymbol, newInterval as TimeframeId);
        if (klineResult) {
          tfHigh = klineResult.high;
          tfLow = klineResult.low;
        }
      } catch (err) {
        console.warn('Binance kline fetch fallback to ATR model:', err);
      }
    }

    const calculated = calculateTimeframeLevels(
      livePrice,
      tfHigh ?? liveHigh,
      tfLow ?? liveLow,
      newInterval,
      currentAssetHistory
    );

    const finalHigh = tfHigh ?? calculated.high;
    const finalLow = tfLow ?? calculated.low;
    const finalFactor = calculated.recommendedFactor;

    setOracleSwingHigh(finalHigh.toString());
    setOracleSwingLow(finalLow.toString());
    setFactorInput(finalFactor.toString());
    calculateGann(false, livePrice, finalFactor, finalHigh, finalLow);
  }, [currentSymbol, livePrice, liveHigh, liveLow, currentAssetHistory, calculateGann]);

  const handleSelectWatchlistAsset = useCallback((item: WatchlistItem) => {
    setAssetName(`${item.symbol} (${item.name})`);
    setTvSymbol(item.tvSymbol);
    setLivePrice(item.price);
    setLiveHigh(item.high);
    setLiveLow(item.low);
    setPriceChange(item.change);
    setIsPriceUp(item.isUp);
    if (item.source) setPriceSource(item.source);

    const tfLevels = calculateTimeframeLevels(item.price, item.high, item.low, chartInterval);
    setPivotInput(item.price.toString());
    setOracleSwingHigh(tfLevels.high.toString());
    setOracleSwingLow(tfLevels.low.toString());
    setFactorInput(tfLevels.recommendedFactor.toString());
    calculateGann(false, item.price, tfLevels.recommendedFactor, tfLevels.high, tfLevels.low);
  }, [calculateGann, chartInterval]);

  const handleSyncAllParametersFromChart = useCallback(() => {
    const tfLevels = calculateTimeframeLevels(livePrice, liveHigh, liveLow, chartInterval, currentAssetHistory);
    setPivotInput(livePrice.toString());
    setOracleSwingHigh(tfLevels.high.toString());
    setOracleSwingLow(tfLevels.low.toString());
    setFactorInput(tfLevels.recommendedFactor.toString());
    calculateGann(false, livePrice, tfLevels.recommendedFactor, tfLevels.high, tfLevels.low);
  }, [livePrice, liveHigh, liveLow, chartInterval, currentAssetHistory, calculateGann]);

  const handleManualSyncTradingViewPrice = useCallback(() => {
    const entered = prompt(`Masukkan harga aktual yang tertera di chart TradingView (${assetName}):`, livePrice.toString());
    if (entered !== null && !isNaN(parseFloat(entered))) {
      const val = parseFloat(entered);
      setLivePrice(val);
      setPivotInput(val.toString());
      calculateGann(false, val, parseFloat(factorInput));
    }
  }, [assetName, livePrice, factorInput, calculateGann]);

  const handleAutoSyncPrice = useCallback(() => {
    const tfLevels = calculateTimeframeLevels(livePrice, liveHigh, liveLow, chartInterval, currentAssetHistory);
    setPivotInput(livePrice.toString());
    setOracleSwingHigh(tfLevels.high.toString());
    setOracleSwingLow(tfLevels.low.toString());
    setFactorInput(tfLevels.recommendedFactor.toString());
    calculateGann(false, livePrice, tfLevels.recommendedFactor, tfLevels.high, tfLevels.low);
    setMatrixSynced(true);
  }, [livePrice, liveHigh, liveLow, chartInterval, currentAssetHistory, calculateGann]);

  const handleSynchronize4DMatrix = useCallback(() => {
    setSyncGlowing(true);
    setMatrixSynced(true);
    calculateGann(false);
    setTimeout(() => {
      setSyncGlowing(false);
    }, 1200);
  }, [calculateGann]);

  const handleRunOracleAI = useCallback(async () => {
    setOracleAiLoading(true);
    try {
      const res = await fetch('/api/oracle/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetName,
          currentPrice: pivotInput,
          swingHigh: oracleSwingHigh,
          swingLow: oracleSwingLow,
          lunarPhase: oracleLunarPhase,
          trendAngle: oracleAngle,
          candlestickPattern: oracleCandle,
        }),
      });
      const text = await res.text();
      if (text && text.trim().startsWith('{')) {
        try {
          const data = JSON.parse(text);
          if (data && data.oracleReport) {
            setOracleAiReport(data.oracleReport);
          }
        } catch {
          // Ignore non-json
        }
      }
    } catch (e) {
      console.error('Failed to run Oracle AI:', e);
    } finally {
      setOracleAiLoading(false);
    }
  }, [assetName, pivotInput, oracleSwingHigh, oracleSwingLow, oracleLunarPhase, oracleAngle, oracleCandle]);

  // Automated 4D Dimension Calculations
  const prevPriceRef = useRef<number>(0);
  const [lunarRefreshTrigger, setLunarRefreshTrigger] = useState<number>(0);

  const lunarPhaseResult: LunarPhaseResult = useMemo(() => {
    return calculateLunarPhase(new Date());
  }, [lunarRefreshTrigger]);

  const priceVal = parseFloat(pivotInput) || livePrice;
  const sHigh = parseFloat(oracleSwingHigh) || liveHigh;
  const sLow = parseFloat(oracleSwingLow) || liveLow;

  const priceAngleResult: PriceAngleResult = useMemo(() => {
    return calculatePriceAngle(sHigh, sLow, priceVal, 20);
  }, [sHigh, sLow, priceVal]);

  const candlestickPatternResult: CandlestickPatternResult = useMemo(() => {
    const gLevels = calculateGannLevels(priceVal, 0.125);
    const prevP = prevPriceRef.current;
    const res = detectCandlestickPattern(
      priceVal,
      gLevels.res1,
      gLevels.sup1,
      gLevels.res2,
      gLevels.sup2,
      prevP
    );
    prevPriceRef.current = priceVal;
    return res;
  }, [priceVal]);

  const recalculateOracleDimensions = useCallback(() => {
    setLunarRefreshTrigger(prev => prev + 1);
  }, []);

  // Sync automated calculation outputs to oracle state parameters
  useEffect(() => {
    if (lunarPhaseResult.oracleLabel) {
      setOracleLunarPhase(lunarPhaseResult.oracleLabel);
    }
  }, [lunarPhaseResult.oracleLabel]);

  useEffect(() => {
    if (priceAngleResult.oracleAngle !== undefined) {
      setOracleAngle(priceAngleResult.oracleAngle.toString());
    }
  }, [priceAngleResult.oracleAngle]);

  useEffect(() => {
    if (candlestickPatternResult.patternLabel) {
      setOracleCandle(candlestickPatternResult.patternLabel);
    }
  }, [candlestickPatternResult.patternLabel]);

  // 4D Mathematical Computations
  const angleNum = parseFloat(oracleAngle) || priceAngleResult.angle;

  // Timeframe-specific High, Low, Range, and Confluence Entry Zone calculation
  const currentTimeframeLevels: TimeframeLevelResult = useMemo(() => {
    return calculateTimeframeLevels(
      priceVal,
      sHigh,
      sLow,
      chartInterval,
      currentAssetHistory
    );
  }, [priceVal, sHigh, sLow, chartInterval, currentAssetHistory]);

  const oracleResult: OracleDecisionResult = useMemo(() => {
    return evaluate4DOracle(
      priceVal,
      sHigh,
      sLow,
      oracleLunarPhase,
      angleNum,
      oracleCandle
    );
  }, [priceVal, sHigh, sLow, oracleLunarPhase, angleNum, oracleCandle]);

  const gannVals: GannLevels = useMemo(() => {
    return calculateGannLevels(priceVal, 0.125);
  }, [priceVal]);

  const fibVals: FibonacciLevels = useMemo(() => {
    return calculateFibonacciLevels(sHigh, sLow);
  }, [sHigh, sLow]);

  // Real-time Technical & 4D Indicators calculation from real client price history buffer
  const technicalMetrics: IndicatorMetrics = useMemo(() => {
    return calculateTechnicalIndicators(
      priceVal,
      sHigh,
      sLow,
      angleNum,
      oracleCandle,
      undefined,
      currentAssetHistory
    );
  }, [priceVal, sHigh, sLow, angleNum, oracleCandle, currentAssetHistory]);

  // Genuine Backtest simulation calculated against real rolling price history buffer
  const backtestStats: BacktestResult = useMemo(() => {
    return runGannBacktest(
      currentAssetHistory,
      {
        pivot: priceVal,
        sup1: gannVals.sup1,
        res1: gannVals.res1,
        sup2: gannVals.sup2,
        res2: gannVals.res2,
      },
      20
    );
  }, [currentAssetHistory, priceVal, gannVals]);

  const confluenceZoneText = `${oracleResult.confluenceZoneStart.toFixed(2)} – ${oracleResult.confluenceZoneEnd.toFixed(2)}`;

  const structuredReportText = useMemo(() => {
    const slLabel = oracleResult.action === 'BUY' ? 'Di bawah Support S1' : 'Di atas Resisten R1';
    const tp1Label = oracleResult.action === 'BUY' ? 'R1' : 'S1';
    const tp2Label = oracleResult.action === 'BUY' ? 'R2' : 'S2';
    const tp3Label = oracleResult.action === 'BUY' ? 'R3' : 'S3';

    return `**1. Arsitektur Harga (Zona Konfluensi):** Level Gann Support S1 (${gannVals.sup1.toFixed(2)}) dan Resisten R1 (${gannVals.res1.toFixed(2)}) dihitung dengan (√${priceVal.toFixed(2)} ± 0.125)². Retracement Fibonacci pada rentang Swing High ${sHigh} ke Swing Low ${sLow} menghasilkan Fib 50.0% (${fibVals.fib500.toFixed(2)}) dan Fib 61.8% (${fibVals.fib618.toFixed(2)}). Titik irisan Zona Konfluensi berada di rentang harga ${confluenceZoneText}.

**2. Sinkronisasi Waktu (Filter Lunar):** ${oracleResult.isLunarValid ? 'Valid' : 'Tidak Valid'} - Fase saat ini adalah ${oracleLunarPhase}. ${oracleResult.isLunarValid ? 'Jendela aktif terkonfirmasi berada dalam rentang H-2 hingga H+2 puncak fase bulan dengan gravitasi pembalikan arah tinggi.' : 'Berada di luar jendela H-2 hingga H+2 fase bulan utama (volatilitas siklus tidak sinkron).'}

**3. Validasi Ruang (Momentum Vektor):** Sudut momentum tren terukur ${angleNum}°. ${oracleResult.isSpaceHarmonic ? 'Sudut harmonis 45° (Gann 1x1) menandakan keseimbangan sempurna antara vektor harga dan waktu.' : oracleResult.isSpaceExhausted ? 'Sudut curam >70° mengindikasikan momentum vertikal yang over-extended/kelelahan tren dan rentan memantul tajam.' : 'Sudut moderat/datar, momentum belum mencapai harmonisasi sempurna.'}

**4. Konfirmasi Psikologi (Candlestick):** ${oracleCandle}. ${oracleResult.isCandleConfirmed ? 'Pola lilin pembalikan arah ajaran Munehisa Homma terkonfirmasi aktif menyentuh Zona Konfluensi.' : 'Belum terdapat reaksi pola lilin pembalikan arah Homma yang valid di Zona Konfluensi.'}

**KEPUTUSAN GANN-LUNAR ARCHITECT:**
${oracleResult.decision === 'EXECUTE' 
  ? `🟢 EXECUTE: (Semua dimensi sinkron. Rekomendasi ${oracleResult.action === 'BUY' ? 'BUY / LONG' : 'SELL / SHORT'} di zona ${confluenceZoneText} dengan Stop Loss di ${oracleResult.stopLoss.toFixed(2)} [${slLabel}], TP 1 di ${oracleResult.takeProfit1.toFixed(2)} [${tp1Label}], TP 2 di ${oracleResult.takeProfit2.toFixed(2)} [${tp2Label}], TP 3 di ${oracleResult.takeProfit3.toFixed(2)} [${tp3Label}])`
  : oracleResult.decision === 'STANDBY'
  ? `🟡 STANDBY: (Zona Konfluensi ${confluenceZoneText} tersentuh, menunggu konfirmasi pola candlestick Homma)`
  : `🔴 IGNORE: (Harga & Waktu tidak sinkron, abaikan dan hindari posisi)`}`;
  }, [gannVals, priceVal, sHigh, sLow, fibVals, confluenceZoneText, oracleResult, oracleLunarPhase, angleNum, oracleCandle]);

  const handleCopyStructuredReport = useCallback(() => {
    navigator.clipboard.writeText(structuredReportText);
    setCopiedFormat(true);
    setTimeout(() => setCopiedFormat(false), 2500);
  }, [structuredReportText]);

  const isPivotMatched = Math.abs(parseFloat(pivotInput) - livePrice) < 0.001;
  const isHighMatched = Math.abs(parseFloat(oracleSwingHigh) - liveHigh) < 0.001;
  const isLowMatched = Math.abs(parseFloat(oracleSwingLow) - liveLow) < 0.001;
  const areAllParametersMatched = isPivotMatched && isHighMatched && isLowMatched;

  return {
    activeTab,
    setActiveTab,
    pivotInput,
    setPivotInput,
    factorInput,
    setFactorInput,
    assetName,
    setAssetName,
    tvSymbol,
    setTvSymbol,
    chartSource,
    setChartSource,
    volatility,
    setVolatility,
    showOracleChart,
    setShowOracleChart,
    autoSyncEnabled,
    setAutoSyncEnabled,
    oracleSwingHigh,
    setOracleSwingHigh,
    oracleSwingLow,
    setOracleSwingLow,
    oracleLunarPhase,
    setOracleLunarPhase,
    oracleAngle,
    setOracleAngle,
    oracleCandle,
    setOracleCandle,
    oracleAiReport,
    setOracleAiReport,
    oracleAiLoading,
    matrixSynced,
    syncGlowing,
    copiedFormat,
    marketSpaceChartMode,
    setMarketSpaceChartMode,
    livePrice,
    liveHigh,
    liveLow,
    priceChange,
    isPriceUp,
    priceSource,
    activePriceFlash,
    watchlist,
    priceHistory,
    currentAssetHistory,
    currentSymbol,
    journalEntries,
    saveToJournal,
    deleteJournalEntry,
    clearJournal,
    result,
    loading,
    calculateGann,
    handleSelectWatchlistAsset,
    handleSyncAllParametersFromChart,
    handleManualSyncTradingViewPrice,
    handleAutoSyncPrice,
    handleSynchronize4DMatrix,
    handleRunOracleAI,
    handleCopyStructuredReport,
    isNewsTickerVisible,
    setIsNewsTickerVisible,
    newsTickerSpeed,
    setNewsTickerSpeed,
    isNewsTickerPinned,
    setIsNewsTickerPinned,
    selectedStudies,
    handleToggleStudy,
    handleSelectStudyPreset,
    oracleResult,
    gannVals,
    fibVals,
    technicalMetrics,
    backtestStats,
    confluenceZoneText,
    structuredReportText,
    priceVal,
    sHigh,
    sLow,
    angleNum,
    isPivotMatched,
    isHighMatched,
    isLowMatched,
    areAllParametersMatched,
    chartInterval,
    setChartInterval,
    currentTimeframeLevels,
    changeTimeframe,
    chartStyle,
    setChartStyle,
    chartTheme,
    setChartTheme,
    chartTimezone,
    setChartTimezone,
    showSideToolbar,
    setShowSideToolbar,
    isChartFullscreen,
    setIsChartFullscreen,
    lunarPhaseResult,
    priceAngleResult,
    candlestickPatternResult,
    recalculateOracleDimensions,
  };
}

export type MarketState = ReturnType<typeof useMarketState>;
