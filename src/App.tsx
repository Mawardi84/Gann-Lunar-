/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, RefreshCw, Copy, Check, Sparkles, 
  BookOpen, Calculator, BarChart3, HelpCircle, Layers, Sliders, Download, Activity, Bell, Compass, Target, Gauge, Percent, Newspaper, CandlestickChart, Ruler, X, History, Clock, Zap, Star, ExternalLink, Edit3, Moon, Eye, EyeOff, Orbit, ShieldCheck, AlertTriangle, CheckCircle2, ArrowRight, Settings, Pin, PinOff, FastForward, Rewind
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, ComposedChart, Bar, Cell 
} from 'recharts';
import { calculateGannLevels, calculateFibonacciLevels, evaluate4DOracle } from './utils/gann';
import { calculateTechnicalIndicators } from './utils/indicators';
import { TechnicalIndicatorsPanel } from './components/TechnicalIndicatorsPanel';
import { IndicatorStudySelector } from './components/IndicatorStudySelector';
import { LandingPage } from './components/LandingPage';

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  isGreen: boolean;
  pivot: number;
}

interface CalculationResult {
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

interface WatchlistItem {
  symbol: string;
  name: string;
  tvSymbol: string;
  price: number;
  high: number;
  low: number;
  change: number;
  isUp: boolean;
  factor: number;
}

interface BacktestLog {
  id: string;
  date: string;
  type: 'Buy at S1' | 'Sell at R1' | 'Pivot Bounce';
  price: number;
  levelHit: string;
  outcome: 'Success' | 'Failed';
  profit: number;
}

const INITIAL_WATCHLIST: WatchlistItem[] = [
  { symbol: 'XAU/USD', name: 'Gold Spot', tvSymbol: 'OANDA:XAUUSD', price: 4164.86, high: 4199.08, low: 4147.16, change: -0.14, isUp: false, factor: 0.125 },
  { symbol: 'BTC/USD', name: 'Bitcoin', tvSymbol: 'BINANCE:BTCUSDT', price: 81320.00, high: 82940.80, low: 80809.25, change: -1.13, isUp: true, factor: 0.125 },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', tvSymbol: 'FX:EURUSD', price: 1.1228, high: 1.1269, low: 1.1208, change: +0.07, isUp: true, factor: 0.125 },
  { symbol: 'S&P 500', name: 'US 500 Index', tvSymbol: 'SP:SPX', price: 7657.01, high: 7756.84, low: 7651.91, change: -1.12, isUp: false, factor: 0.125 },
  { symbol: 'ETH/USD', name: 'Ethereum', tvSymbol: 'BINANCE:ETHUSDT', price: 2415.72, high: 2494.00, low: 2393.48, change: -1.09, isUp: true, factor: 0.125 },
  { symbol: 'OIL/USD', name: 'Crude Oil WTI', tvSymbol: 'NYMEX:CL1!', price: 98.57, high: 99.00, low: 95.29, change: +0.61, isUp: true, factor: 0.125 },
  { symbol: 'GBP/USD', name: 'British Pound', tvSymbol: 'FX:GBPUSD', price: 1.3315, high: 1.3372, low: 1.3262, change: +0.29, isUp: true, factor: 0.125 },
  { symbol: 'SOL/USD', name: 'Solana', tvSymbol: 'BINANCE:SOLUSDT', price: 103.81, high: 107.44, low: 102.80, change: -1.55, isUp: false, factor: 0.125 }
];

export default function App() {
  const [pivotInput, setPivotInput] = useState<string>('4164.86');
  const [factorInput, setFactorInput] = useState<string>('0.125');
  const [assetName, setAssetName] = useState<string>('XAU/USD (Gold Spot)');
  const [tvSymbol, setTvSymbol] = useState<string>('OANDA:XAUUSD');
  const [chartSource, setChartSource] = useState<'tradingview' | 'simulation'>('tradingview');
  const [volatility, setVolatility] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [showOracleChart, setShowOracleChart] = useState<boolean>(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);

  // 4D Market Oracle States (Dynamically synced with TradingView chart)
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

  // Live Ticker State for active asset (Directly from TradingView Scanner API)
  const [livePrice, setLivePrice] = useState<number>(4164.86);
  const [liveHigh, setLiveHigh] = useState<number>(4199.08);
  const [liveLow, setLiveLow] = useState<number>(4147.16);
  const [priceChange, setPriceChange] = useState<number>(-0.14);
  const [isPriceUp, setIsPriceUp] = useState<boolean>(false);

  // Watchlist real-time feed state
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(INITIAL_WATCHLIST);

interface JournalEntry {
  id: string;
  timestamp: string;
  asset: string;
  oracleReport: string;
  price: number;
}

type TabType = 'landing' | 'oracle' | 'dashboard' | 'indicators' | 'calculator' | 'signal' | 'chart' | 'backtest' | 'journal';

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('gann_journal');
    return saved ? JSON.parse(saved) : [];
  });
  
  const saveToJournal = (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString(),
    };
    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem('gann_journal', JSON.stringify(updated));
  };

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'landing' | 'oracle' | 'dashboard' | 'indicators' | 'calculator' | 'signal' | 'chart' | 'backtest' | 'journal'>('landing');

  // News Ticker States
  const [isNewsTickerVisible, setIsNewsTickerVisible] = useState<boolean>(true);
  const [newsTickerSpeed, setNewsTickerSpeed] = useState<number>(60);
  const [isNewsTickerPinned, setIsNewsTickerPinned] = useState<boolean>(true);

  // Chart Studies / Indicators configuration for TradingView widget
  const [selectedStudies, setSelectedStudies] = useState<string[]>([
    'RSI@tv-basicstudies',
    'MASimple@tv-basicstudies',
  ]);

  const handleToggleStudy = (studyId: string) => {
    setSelectedStudies((prev) =>
      prev.includes(studyId) ? prev.filter((s) => s !== studyId) : [...prev, studyId]
    );
  };

  const handleSelectStudyPreset = (presetName: 'momentum' | 'trend' | 'all' | 'clean') => {
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
  };

  // Backtest states
  const [backtestStats] = useState({
    totalSignals: 8,
    winRate: 75.0,
    totalProfit: 219.80,
    bestTrade: 60.30
  });

  // Fetch real-time market prices from TradingView backend endpoint
  useEffect(() => {
    let isMounted = true;
    const fetchLivePrices = async () => {
      try {
        const res = await fetch('/api/market/live-prices');
        const data = await res.json();
        if (data && data.prices && isMounted) {
          setWatchlist(prev => prev.map(item => {
            const liveData = data.prices[item.symbol];
            if (liveData) {
              const newPrice = liveData.price;
              const newHigh = liveData.high;
              const newLow = liveData.low;
              const newChange = liveData.change;
              const isUp = newPrice >= item.price;
              
              if (assetName.includes(item.symbol)) {
                setLivePrice(newPrice);
                setLiveHigh(newHigh);
                setLiveLow(newLow);
                setPriceChange(newChange);
                setIsPriceUp(isUp);

                // Auto-sync parameters to chart if enabled
                if (autoSyncEnabled) {
                  setPivotInput(newPrice.toString());
                  setOracleSwingHigh(newHigh.toString());
                  setOracleSwingLow(newLow.toString());
                }
              }
              return {
                ...item,
                price: newPrice,
                high: newHigh,
                low: newLow,
                change: newChange,
                isUp
              };
            }
            return item;
          }));
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
  }, [assetName, autoSyncEnabled]);

  const calculateGann = async (
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
      alert('Masukkan harga pivot dan faktor sudut yang valid (angka positif).');
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

    // Generate simulated candlestick path
    const candles: Candle[] = [];
    const periods = 12;
    const range = gann.res1 - gann.sup1;
    const waveMultiplier = volatility === 'Low' ? 0.2 : volatility === 'High' ? 0.8 : 0.45;
    const noiseMultiplier = volatility === 'Low' ? 0.05 : volatility === 'High' ? 0.25 : 0.1;

    let prevClose = pivot;
    for (let i = 0; i < periods; i++) {
      const progress = i / (periods - 1);
      const wave = Math.sin(progress * Math.PI * 2.5) * waveMultiplier;
      const noise = (Math.sin(i * 1.8) * noiseMultiplier);
      const targetPrice = pivot + (range * (wave + noise));
      
      const open = prevClose;
      const close = parseFloat(targetPrice.toFixed(decimals));
      const high = parseFloat((Math.max(open, close) + Math.abs(range * 0.08 * Math.random())).toFixed(decimals));
      const low = parseFloat((Math.min(open, close) - Math.abs(range * 0.08 * Math.random())).toFixed(decimals));
      const isGreen = close >= open;

      candles.push({
        time: `T-${periods - i}`,
        open,
        high,
        low,
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
        const data = await res.json();
        if (data.analysis) {
          analysisText = data.analysis;
        }
      } catch (err) {
        console.error('AI analysis error:', err);
      }
    } else {
      await new Promise(r => setTimeout(r, 100));
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
  };

  useEffect(() => {
    calculateGann(false);
  }, [volatility]);

  // Asset selection that synchronizes chart AND all parameters
  const handleSelectWatchlistAsset = (item: WatchlistItem) => {
    setAssetName(`${item.symbol} (${item.name})`);
    setTvSymbol(item.tvSymbol);
    setLivePrice(item.price);
    setLiveHigh(item.high);
    setLiveLow(item.low);
    setPriceChange(item.change);
    setIsPriceUp(item.isUp);

    // Synchronize parameter fields to match chart
    setPivotInput(item.price.toString());
    setOracleSwingHigh(item.high.toString());
    setOracleSwingLow(item.low.toString());
    calculateGann(false, item.price, item.factor, item.high, item.low);
  };

  // Full synchronization of all parameters from the active chart
  const handleSyncAllParametersFromChart = () => {
    setPivotInput(livePrice.toString());
    setOracleSwingHigh(liveHigh.toString());
    setOracleSwingLow(liveLow.toString());
    calculateGann(false, livePrice, parseFloat(factorInput), liveHigh, liveLow);
  };

  // 1-Click exact price sync prompt for TradingView chart matching
  const handleManualSyncTradingViewPrice = () => {
    const entered = prompt(`Masukkan harga aktual yang tertera di chart TradingView (${assetName}):`, livePrice.toString());
    if (entered !== null && !isNaN(parseFloat(entered))) {
      const val = parseFloat(entered);
      setLivePrice(val);
      setPivotInput(val.toString());
      calculateGann(false, val, parseFloat(factorInput));
    }
  };

  const handleAutoSyncPrice = () => {
    setPivotInput(livePrice.toString());
    setOracleSwingHigh(liveHigh.toString());
    setOracleSwingLow(liveLow.toString());
    calculateGann(false, livePrice, parseFloat(factorInput), liveHigh, liveLow);
    setMatrixSynced(true);
  };

  const handleSynchronize4DMatrix = () => {
    setSyncGlowing(true);
    setMatrixSynced(true);
    calculateGann(false);
    setTimeout(() => {
      setSyncGlowing(false);
    }, 1200);
  };

  // Run 4D Market Oracle AI Synthesis
  const handleRunOracleAI = async () => {
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
      const data = await res.json();
      if (data.oracleReport) {
        setOracleAiReport(data.oracleReport);
      }
    } catch (e) {
      console.error('Failed to run Oracle AI:', e);
    } finally {
      setOracleAiLoading(false);
    }
  };

  // 4D Mathematical Computations using pure decoupled logic
  const priceVal = parseFloat(pivotInput) || livePrice;
  const sHigh = parseFloat(oracleSwingHigh) || liveHigh;
  const sLow = parseFloat(oracleSwingLow) || liveLow;
  const angleNum = parseFloat(oracleAngle) || 45;

  const oracleResult = evaluate4DOracle(
    priceVal,
    sHigh,
    sLow,
    oracleLunarPhase,
    angleNum,
    oracleCandle
  );

  const gannVals = calculateGannLevels(priceVal, 0.125);
  const fibVals = calculateFibonacciLevels(sHigh, sLow);

  // Real-time Technical & 4D Indicators calculation
  const technicalMetrics = calculateTechnicalIndicators(
    priceVal,
    sHigh,
    sLow,
    angleNum,
    oracleCandle
  );

  // TradingView studies query string
  const studiesParam = selectedStudies.length > 0
    ? `&studies=${encodeURIComponent(JSON.stringify(selectedStudies))}`
    : '';

  const confluenceZoneText = `${oracleResult.confluenceZoneStart.toFixed(2)} – ${oracleResult.confluenceZoneEnd.toFixed(2)}`;

  let decisionBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  let decisionIcon = '🟡';

  if (oracleResult.decision === 'IGNORE') {
    decisionBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    decisionIcon = '🔴';
  } else if (oracleResult.decision === 'EXECUTE') {
    decisionBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    decisionIcon = '🟢';
  } else {
    decisionBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    decisionIcon = '🟡';
  }

  const structuredReportText = `**1. Arsitektur Harga (Zona Konfluensi):** Level Gann Support S1 (${gannVals.sup1.toFixed(2)}) dan Resisten R1 (${gannVals.res1.toFixed(2)}) dihitung dengan (√${priceVal.toFixed(2)} ± 0.125)². Retracement Fibonacci pada rentang Swing High ${sHigh} ke Swing Low ${sLow} menghasilkan Fib 50.0% (${fibVals.fib500.toFixed(2)}) dan Fib 61.8% (${fibVals.fib618.toFixed(2)}). Titik irisan Zona Konfluensi berada di rentang harga ${confluenceZoneText}.

**2. Sinkronisasi Waktu (Filter Lunar):** ${oracleResult.isLunarValid ? 'Valid' : 'Tidak Valid'} - Fase saat ini adalah ${oracleLunarPhase}. ${oracleResult.isLunarValid ? 'Jendela aktif terkonfirmasi berada dalam rentang H-2 hingga H+2 puncak fase bulan dengan gravitasi pembalikan arah tinggi.' : 'Berada di luar jendela H-2 hingga H+2 fase bulan utama (volatilitas siklus tidak sinkron).'}

**3. Validasi Ruang (Momentum Vektor):** Sudut momentum tren terukur ${angleNum}°. ${oracleResult.isSpaceHarmonic ? 'Sudut harmonis 45° (Gann 1x1) menandakan keseimbangan sempurna antara vektor harga dan waktu.' : oracleResult.isSpaceExhausted ? 'Sudut curam >70° mengindikasikan momentum vertikal yang over-extended/kelelahan tren dan rentan memantul tajam.' : 'Sudut moderat/datar, momentum belum mencapai harmonisasi sempurna.'}

**4. Konfirmasi Psikologi (Candlestick):** ${oracleCandle}. ${oracleResult.isCandleConfirmed ? 'Pola lilin pembalikan arah ajaran Munehisa Homma terkonfirmasi aktif menyentuh Zona Konfluensi.' : 'Belum terdapat reaksi pola lilin pembalikan arah Homma yang valid di Zona Konfluensi.'}

**KEPUTUSAN GANN-LUNAR ARCHITECT:**
${oracleResult.decision === 'EXECUTE' 
  ? `🟢 EXECUTE: (Semua dimensi sinkron. Rekomendasi BUY di zona ${confluenceZoneText} dengan Stop Loss di ${oracleResult.stopLoss.toFixed(2)}, TP 1 di ${oracleResult.takeProfit1.toFixed(2)} [R1], TP 2 di ${oracleResult.takeProfit2.toFixed(2)} [R2], TP 3 di ${oracleResult.takeProfit3.toFixed(2)} [R3])`
  : oracleResult.decision === 'STANDBY'
  ? `🟡 STANDBY: (Zona Konfluensi ${confluenceZoneText} tersentuh, menunggu konfirmasi pola candlestick Homma)`
  : `🔴 IGNORE: (Harga & Waktu tidak sinkron, abaikan dan hindari posisi)`}`;

  const handleCopyStructuredReport = () => {
    navigator.clipboard.writeText(structuredReportText);
    setCopiedFormat(true);
    setTimeout(() => setCopiedFormat(false), 2500);
  };

  // Check if parameters currently match the live chart
  const isPivotMatched = Math.abs(parseFloat(pivotInput) - livePrice) < 0.001;
  const isHighMatched = Math.abs(parseFloat(oracleSwingHigh) - liveHigh) < 0.001;
  const isLowMatched = Math.abs(parseFloat(oracleSwingLow) - liveLow) < 0.001;
  const areAllParametersMatched = isPivotMatched && isHighMatched && isLowMatched;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar with Aesthetic Hover Effects & 3-Zone Contract (Hidden on Landing Page) */}
      {activeTab !== 'landing' && (
        <header className="flex items-center justify-between gap-6 px-6 lg:px-12 py-3.5 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-50">
          {/* Zone 1: Minimalist Brand Wordmark */}
          <button 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 group text-left cursor-pointer transition-transform duration-200 active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:border-amber-500/60 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all duration-300">
              <Orbit className="w-5 h-5 text-amber-400 group-hover:rotate-90 transition-transform duration-700 ease-out" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap group-hover:text-amber-300 transition-colors">
                Gann-Lunar Architect
              </span>
              <span className="text-[11px] text-slate-400 block font-mono">Algorithmic 4D Confluence</span>
            </div>
          </button>

          {/* Zone 2: Aesthetic Hover Navigation Bar */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1.5 bg-slate-900/70 border border-slate-800/90 rounded-2xl backdrop-blur-md shadow-inner shadow-black/40">
            <button 
              onClick={() => setActiveTab('landing')}
              className={`relative group px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                (activeTab as string) === 'landing'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <span>Beranda</span>
              <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('oracle')}
              className={`relative group px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'oracle'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <Orbit className={`w-3.5 h-3.5 transition-transform group-hover:rotate-45 duration-300 ${activeTab === 'oracle' ? 'text-amber-400' : 'text-purple-400'}`} />
              <span>4D Architect</span>
              <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`relative group px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Market Space</span>
              <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('indicators')}
              className={`relative group px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'indicators'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Indikator</span>
              <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('signal')}
              className={`relative group px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'signal'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <span>Area Buy / Sell</span>
              <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('calculator')}
              className={`relative group px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <span>Kalkulator Gann</span>
              <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('journal')}
              className={`relative group px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'journal'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
              <span>Journal</span>
              <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('backtest')}
              className={`relative group px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'backtest'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <span>Backtest</span>
              <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>
          </nav>

          {/* Zone 3: 1 Primary High-Intent Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('oracle')}
              className="group relative flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-xl hover:shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 whitespace-nowrap cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>Buka Matriks 4D</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </header>
      )}

      {/* Ticker / News Tickers for Dashboard (Running Market Ticker on Top) */}
      {activeTab !== 'landing' && (
        <div className="bg-slate-950 border-b border-slate-800/80 sticky top-0 z-40">
          {/* Top Ticker: Live Market Running Price (Animated, Slow) */}
          <div className="bg-slate-950/95 border-b border-slate-900 px-4 py-2 flex items-center gap-4 overflow-hidden text-xs font-mono">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold shrink-0 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>BURSA LIVE</span>
            </div>
            {/* Animasi running text - Slowed down */}
            <div className="flex overflow-hidden relative">
              <div className="flex items-center gap-12 animate-marquee-slow whitespace-nowrap">
                {[...watchlist, ...watchlist].map((item, index) => (
                  <div key={`${item.symbol}-${index}`} className="flex items-center gap-2">
                    <span className="font-semibold text-white">{item.symbol}</span>
                    <span className="text-slate-200">${item.price.toFixed(item.price > 100 ? 2 : 4)}</span>
                    <span className={item.isUp ? 'text-emerald-400' : 'text-rose-400'}>
                      {item.isUp ? '+' : ''}{item.change.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating News Ticker (Dashboard only) */}
      {isNewsTickerVisible && activeTab !== 'landing' && (
        <div className={`${isNewsTickerPinned ? 'fixed bottom-4 left-4 right-4' : 'relative mt-4 mx-4'} z-50 bg-slate-900/90 border border-slate-700/50 rounded-xl px-4 py-2 flex items-center gap-3 text-xs font-mono text-slate-200 shadow-2xl backdrop-blur-md transition-all`}>
          <div className="flex items-center gap-1.5 text-blue-400 font-bold shrink-0 bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800">
            <Newspaper className="w-3 h-3 text-blue-400" />
            <span>MARKET NEWS</span>
          </div>
          <div className="flex overflow-hidden w-full">
            <div className="animate-marquee-slow whitespace-nowrap" style={{ animationDuration: `${newsTickerSpeed}s` }}>
              <span className="text-amber-300 font-semibold mx-4">[LUNAR ALIGNED]:</span> Siklus Full Moon H-1 mengonfirmasi volatilitas tinggi pada komoditas XAU/USD dan crypto major. Zona konfluensi Gann Square of 9 diuji pada level 4,148.74.
              <span className="mx-8">|</span>
              <span className="text-amber-300 font-semibold">[MARKET ALERT]:</span> S&P 500 menunjukkan kelelahan tren pada sudut 72°. Waspadai potensi koreksi tajam.
              <span className="mx-8">|</span>
              <span className="text-amber-300 font-semibold">[PSYCHOLOGY]:</span> Engulfing Bearish terdeteksi di chart 4 jam. Standby untuk konfirmasi posisi Short.
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-1 border-l border-slate-700 pl-3 ml-2 shrink-0">
             <button onClick={() => setNewsTickerSpeed(prev => Math.max(20, prev - 20))} className="p-1 hover:text-white text-slate-400" title="Faster">
               <FastForward className="w-3.5 h-3.5" />
             </button>
             <button onClick={() => setNewsTickerSpeed(prev => Math.min(120, prev + 20))} className="p-1 hover:text-white text-slate-400" title="Slower">
               <Rewind className="w-3.5 h-3.5" />
             </button>
             <button onClick={() => setIsNewsTickerPinned(!isNewsTickerPinned)} className="p-1 hover:text-white text-slate-400" title="Pin/Unpin">
               {isNewsTickerPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
             </button>
             <button onClick={() => setIsNewsTickerVisible(false)} className="p-1 hover:text-white text-slate-400" title="Close">
               <EyeOff className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>
      )}

      {/* Visibility Toggle if hidden */}
      {!isNewsTickerVisible && activeTab !== 'landing' && (
        <button 
           onClick={() => setIsNewsTickerVisible(true)}
           className="fixed bottom-4 right-4 z-50 p-2 bg-slate-900 border border-slate-700 rounded-full text-blue-400 hover:text-white shadow-lg"
           title="Show News Ticker"
        >
          <Eye className="w-5 h-5" />
        </button>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        
        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden bg-slate-900/90 p-1.5 rounded-xl mb-6 border border-slate-800 text-[11px] overflow-x-auto gap-1">
          <button 
            onClick={() => setActiveTab('landing')}
            className={`py-1.5 px-3 font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'landing' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Beranda
          </button>
          <button 
            onClick={() => setActiveTab('oracle')}
            className={`py-1.5 px-3 font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'oracle' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            4D Architect
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`py-1.5 px-3 font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Market Space
          </button>
          <button 
            onClick={() => setActiveTab('indicators')}
            className={`py-1.5 px-3 font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'indicators' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Indikator
          </button>
          <button 
            onClick={() => setActiveTab('signal')}
            className={`py-1.5 px-3 font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'signal' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Buy/Sell
          </button>
          <button 
            onClick={() => setActiveTab('calculator')}
            className={`py-1.5 px-3 font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'calculator' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Kalkulator
          </button>
          <button 
            onClick={() => setActiveTab('journal')}
            className={`py-1.5 px-3 font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'journal' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Journal
          </button>
        </div>

        {/* LANDING PAGE WITH MARKET THEME HERO */}
        {activeTab === 'landing' && (
          <LandingPage
            onLaunchMatrix={() => setActiveTab('oracle')}
            onOpenMarketSpace={() => setActiveTab('dashboard')}
            onOpenCalculator={() => setActiveTab('calculator')}
            livePrice={livePrice}
            liveHigh={liveHigh}
            liveLow={liveLow}
            assetName={assetName}
            watchlist={watchlist}
            onSelectAsset={(item) => {
              setAssetName(item.name);
              setTvSymbol(item.tvSymbol);
              setLivePrice(item.price);
              setLiveHigh(item.high);
              setLiveLow(item.low);
              setPriceChange(item.change);
              setIsPriceUp(item.isUp);
              setPivotInput(item.price.toString());
              setOracleSwingHigh(item.high.toString());
              setOracleSwingLow(item.low.toString());
              calculateGann(false, item.price, item.factor, item.high, item.low);
            }}
          />
        )}

        {/* JOURNAL TAB */}
        {activeTab === 'journal' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Market Journal</h2>
              <button 
                onClick={() => saveToJournal({ 
                  asset: assetName, 
                  oracleReport: oracleAiReport || structuredReportText, 
                  price: livePrice 
                })}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg text-sm hover:bg-amber-400"
              >
                Save Current Snapshot
              </button>
            </div>
            <div className="grid gap-4">
              {journalEntries.map(entry => (
                <div key={entry.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>{entry.timestamp}</span>
                    <span>{entry.asset} @ {entry.price}</span>
                  </div>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{entry.oracleReport}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4D GANN-LUNAR ARCHITECT SYSTEM */}
        {activeTab === 'oracle' && (
          <div className="space-y-8 max-w-6xl mx-auto">
            
            {/* Header Hero Banner */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      EXECUTIVE ALGORITHMIC SYSTEM
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Aset: {assetName}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Gann-Lunar Architect <span className="text-amber-400">Dashboard</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Sistem asisten trading algoritmik tingkat eksekutif. Memetakan probabilitas pasar melalui 4 fase saringan berjenjang: <strong>Harga</strong> (Gann & Fibonacci), <strong>Waktu</strong> (Siklus Lunar), <strong>Ruang</strong> (Pythagoras), dan <strong>Psikologi</strong> (Candlestick Homma).
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className={`px-6 py-3.5 rounded-2xl border text-center ${decisionBadgeColor} shadow-xl transition-all duration-300 ${syncGlowing ? 'scale-105 ring-2 ring-amber-400' : ''}`}>
                    <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Status 4D Architect</div>
                    <div className="text-2xl font-black font-mono flex items-center justify-center gap-2 mt-0.5">
                      <span>{decisionIcon}</span>
                      <span>{oracleResult.decision}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TOP PANEL: MARKET SPACE */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">Top Panel: Market Space</h2>
                      <span className="text-[10px] font-mono text-slate-400">Real-Time Candlestick Feed</span>
                    </div>
                    {/* Active price indicator pulsing smoothly */}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <div className="relative flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="font-mono text-xs font-extrabold text-emerald-400">
                          {assetName.split(' ')[0]}: ${livePrice.toLocaleString()} USD
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${priceChange >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {priceChange >= 0 ? `+${priceChange}%` : `${priceChange}%`}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono">
                        24h High: <strong className="text-white">{liveHigh.toLocaleString()}</strong> | 24h Low: <strong className="text-white">{liveLow.toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Switcher Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleAutoSyncPrice}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
                    title="Tarik harga live dari chart secara otomatis ke kalkulator"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Auto-Sync Price</span>
                  </button>

                  <button
                    onClick={() => setMarketSpaceChartMode(marketSpaceChartMode === 'simulation' ? 'tradingview' : 'simulation')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                  >
                    <CandlestickChart className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mode: {marketSpaceChartMode === 'simulation' ? 'Simulasi Candlestick' : 'TradingView Stream'}</span>
                  </button>

                  <button
                    onClick={handleManualSyncTradingViewPrice}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
                    title="Ketik manual harga broker TradingView Anda"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Input TV</span>
                  </button>
                </div>
              </div>

              {/* Quick Asset Selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-500 text-[11px] uppercase font-semibold shrink-0">Pilih Instrumen:</span>
                {watchlist.map((item) => {
                  const isSelected = assetName.includes(item.symbol);
                  return (
                    <button
                      key={item.symbol}
                      onClick={() => handleSelectWatchlistAsset(item)}
                      className={`px-3 py-1 rounded-lg border text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${isSelected ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm' : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'}`}
                    >
                      <span>{item.symbol}</span>
                      <span className={`font-mono text-[11px] ${isSelected ? 'text-slate-950 font-bold' : item.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.price.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Chart Display: Simulasi Real-Time Candlestick Chart OR TradingView */}
              {marketSpaceChartMode === 'simulation' && result ? (
                <div className="space-y-3">
                  <div className="h-[360px] w-full bg-slate-950/90 rounded-2xl border border-slate-800/80 p-4 relative overflow-hidden">
                    {/* Live overlay tags */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-amber-300 border border-slate-700/80 flex items-center gap-1">
                        <CandlestickChart className="w-3 h-3 text-amber-400" />
                        Simulasi Candlestick Real-Time (Munehisa Homma Pattern Stream)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                        ● Harga Aktif Berkedip Halus
                      </span>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={result.candles} margin={{ top: 35, right: 35, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                        <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#64748b" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                        />
                        <ReferenceLine y={gannVals.res1} stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" label={{ value: `R1: ${gannVals.res1.toFixed(2)}`, fill: '#f43f5e', fontSize: 10 }} />
                        <ReferenceLine y={priceVal} stroke="#f59e0b" strokeWidth={2} label={{ value: `Pivot: ${priceVal.toFixed(2)}`, fill: '#f59e0b', fontSize: 10 }} />
                        <ReferenceLine y={gannVals.sup1} stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" label={{ value: `S1: ${gannVals.sup1.toFixed(2)}`, fill: '#10b981', fontSize: 10 }} />
                        <ReferenceLine y={fibVals.fib618} stroke="#a855f7" strokeWidth={1} label={{ value: `Fib 61.8%: ${fibVals.fib618.toFixed(2)}`, fill: '#a855f7', fontSize: 10 }} />
                        <Bar dataKey={(d: Candle) => [Math.min(d.open, d.close), Math.max(d.open, d.close)]} fill="#38bdf8">
                          {result.candles.map((entry, index) => (
                            <Cell key={`cell-candle-${index}`} fill={entry.isGreen ? '#10b981' : '#f43f5e'} />
                          ))}
                        </Bar>
                        <Line type="monotone" dataKey="close" stroke="#38bdf8" strokeWidth={1.5} dot={{ r: 3, fill: '#38bdf8' }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <IndicatorStudySelector
                    selectedStudies={selectedStudies}
                    onToggleStudy={handleToggleStudy}
                    onSelectPreset={handleSelectStudyPreset}
                  />
                  <div className="h-[380px] w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                    <iframe
                      key={`oracle-${tvSymbol}-${selectedStudies.join('-')}`}
                      src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_oracle_widget&symbol=${encodeURIComponent(tvSymbol)}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0f172a&theme=dark&style=1&timezone=Etc%2FUTC&locale=id${studiesParam}`}
                      width="100%"
                      height="100%"
                      style={{ border: 'none' }}
                      title="TradingView Oracle Chart"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOM PANEL: 4D CALCULATOR */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white uppercase tracking-wider">Bottom Panel: 4D Calculator</h2>
                    <p className="text-xs text-slate-400">Saringan 4 Fase Berjenjang: Harga, Waktu, Ruang, dan Psikologi</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAutoSyncPrice}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                    title="Tarik harga live dan 24h high/low dari chart secara otomatis"
                  >
                    <Zap className="w-3.5 h-3.5 fill-amber-300" />
                    <span>Auto-Sync dari Chart</span>
                  </button>
                </div>
              </div>

              {/* Calculator Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                
                {/* 1. Current Price (Pivot) */}
                <div className={`p-4 rounded-2xl border transition-all ${isPivotMatched ? 'bg-slate-950/80 border-slate-800' : 'bg-amber-950/20 border-amber-500/40'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span>Harga Saat Ini (Current Price / Pivot)</span>
                    </label>
                    <button
                      onClick={handleAutoSyncPrice}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-mono font-bold underline cursor-pointer"
                      title="Auto-Sync harga"
                    >
                      Auto-Sync
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={pivotInput}
                      onChange={(e) => {
                        setPivotInput(e.target.value);
                        setAutoSyncEnabled(false);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono text-white text-base font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-mono">
                    <span>Live Chart: {livePrice.toLocaleString()}</span>
                    <span>√Price = {Math.sqrt(priceVal).toFixed(3)}</span>
                  </div>
                </div>

                {/* 2. Swing High */}
                <div className={`p-4 rounded-2xl border transition-all ${isHighMatched ? 'bg-slate-950/80 border-slate-800' : 'bg-amber-950/20 border-amber-500/40'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-300 font-semibold">Ayunan Atas (Swing High)</label>
                    <span className="text-[10px] font-mono text-slate-400">High: {liveHigh.toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={oracleSwingHigh}
                      onChange={(e) => {
                        setOracleSwingHigh(e.target.value);
                        setAutoSyncEnabled(false);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono text-white text-base font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 font-mono">Titik awal ayunan gelombang harga</p>
                </div>

                {/* 3. Swing Low */}
                <div className={`p-4 rounded-2xl border transition-all ${isLowMatched ? 'bg-slate-950/80 border-slate-800' : 'bg-amber-950/20 border-amber-500/40'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-300 font-semibold">Ayunan Bawah (Swing Low)</label>
                    <span className="text-[10px] font-mono text-slate-400">Low: {liveLow.toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={oracleSwingLow}
                      onChange={(e) => {
                        setOracleSwingLow(e.target.value);
                        setAutoSyncEnabled(false);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono text-white text-base font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 font-mono">Titik akhir ayunan gelombang harga</p>
                </div>

                {/* 4. Sakelar / Dropdown: Lunar Phase */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Lunar Phase (Dimensi Waktu)</span>
                  </label>
                  <select
                    value={oracleLunarPhase}
                    onChange={(e) => setOracleLunarPhase(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
                  >
                    <option value="Full Moon (H-1) - Jendela Volatilitas Tinggi">Bulan Purnama (Full Moon ±2 Hari) [Valid]</option>
                    <option value="New Moon (H+1) - Jendela Volatilitas Tinggi">Bulan Baru (New Moon ±2 Hari) [Valid]</option>
                    <option value="Waxing Gibbous (Fase Normal)">Waxing Gibbous (Fase Normal) [Tidak Valid]</option>
                    <option value="Waning Crescent (Fase Normal)">Waning Crescent (Fase Normal) [Tidak Valid]</option>
                  </select>
                  <p className="text-[11px] text-indigo-400/90 mt-2 font-mono">Jendela aktif: H-2 s/d H+2 dari puncak fase</p>
                </div>

                {/* 5. Sakelar / Dropdown: Candlestick Pattern */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
                    <CandlestickChart className="w-4 h-4 text-emerald-400" />
                    <span>Candlestick Pattern (Dimensi Psikologi Homma)</span>
                  </label>
                  <select
                    value={oracleCandle}
                    onChange={(e) => setOracleCandle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-emerald-500 cursor-pointer text-xs"
                  >
                    <option value="Bullish Pin Bar / Hammer (Rejection)">Bullish Pin Bar / Hammer (Rejection Bawah)</option>
                    <option value="Bullish Engulfing (Reversal Kuat)">Bullish Engulfing (Reversal Pembeli)</option>
                    <option value="Bearish Engulfing / Shooting Star">Bearish Engulfing / Shooting Star (Rejection Atas)</option>
                    <option value="Doji / Spinning Top (Indecision)">Doji / Spinning Top (Ragu-ragu / Tanpa Konfirmasi)</option>
                    <option value="Belum Ada Pola Konfirmasi">Belum Ada Pola Konfirmasi (No Pattern)</option>
                  </select>
                  <p className="text-[11px] text-emerald-400/90 mt-2 font-mono">Ajaran visual Munehisa Homma</p>
                </div>

                {/* 6. Sakelar / Dropdown: Momentum Vektor Pythagoras */}
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Sudut Momentum Vektor (Dimensi Ruang)</span>
                  </label>
                  <select
                    value={oracleAngle}
                    onChange={(e) => setOracleAngle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-amber-500 cursor-pointer text-xs"
                  >
                    <option value="45">45° (Gann 1x1 - Keseimbangan Harmonik Sempurna)</option>
                    <option value="75">75° (Sudut Curam - Kelelahan Tren / Exhaustion)</option>
                    <option value="60">60° (Momentum Cepat Vektor 2x1)</option>
                    <option value="25">25° (Momentum Lemah / Fluktuasi Mendatar)</option>
                  </select>
                  <p className="text-[11px] text-amber-400/90 mt-2 font-mono">Sudut &gt;70° kelelahan; 45° seimbang</p>
                </div>

              </div>

              {/* TOMBOL UTAMA BESAR & BERCAHAYA (GLOWING): Synchronize 4D Matrix */}
              <div className="pt-2">
                <button
                  onClick={handleSynchronize4DMatrix}
                  className={`w-full py-4 px-8 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-base uppercase tracking-wider rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.55)] hover:shadow-[0_0_55px_rgba(245,158,11,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-3 border border-amber-300/40 relative overflow-hidden group ${syncGlowing ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-[1.01]' : ''}`}
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  <Zap className="w-5 h-5 fill-slate-950" />
                  <span>Synchronize 4D Matrix</span>
                </button>
              </div>
            </div>

            {/* OUTPUT CARDS: 4 PANEL HARGA, WAKTU, RUANG, PSIKOLOGI & KEPUTUSAN EKSEKUSI */}
            {matrixSynced && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white uppercase tracking-wider">
                        Hasil Sinkronisasi 4 Dimensi (Format Keluaran Wajib)
                      </h3>
                      <p className="text-xs text-slate-400">Gann-Lunar Architect Executive Matrix</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyStructuredReport}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
                      title="Salin hasil analisis dengan format baku"
                    >
                      {copiedFormat ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedFormat ? 'Tersalin ke Clipboard!' : 'Salin Format Eksekutif'}</span>
                    </button>

                    <button
                      onClick={handleRunOracleAI}
                      disabled={oracleAiLoading}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{oracleAiLoading ? 'Sintesis AI Berjalan...' : 'AI Synthesis (Gemini)'}</span>
                    </button>
                  </div>
                </div>

                {/* The 4 Neat Panel Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
                  
                  {/* KARTU 1: Arsitektur Harga (Zona Konfluensi) */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-amber-400 font-extrabold text-sm flex items-center gap-2">
                        <span>1. Arsitektur Harga (Zona Konfluensi):</span>
                      </span>
                      <Target className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-slate-300 space-y-2 leading-relaxed">
                      <p>
                        <strong>Rumus Gann Square of 9:</strong> (√{priceVal} ± 0.125)²<br />
                        • Support S1 = <span className="text-emerald-400 font-bold">{gannVals.sup1.toFixed(2)}</span><br />
                        • Resisten R1 = <span className="text-rose-400 font-bold">{gannVals.res1.toFixed(2)}</span>
                      </p>
                      <p>
                        <strong>Fibonacci Retracement (High {sHigh} ke Low {sLow}):</strong><br />
                        • Level 50.0% = <span className="text-indigo-300 font-bold">{fibVals.fib500.toFixed(2)}</span><br />
                        • Level 61.8% (Golden Pocket) = <span className="text-purple-400 font-bold">{fibVals.fib618.toFixed(2)}</span>
                      </p>
                      <div className="pt-2 border-t border-slate-800/80 text-amber-300">
                        <strong>Titik Irisan Zona Konfluensi:</strong><br />
                        <span className="text-sm font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 inline-block mt-1">
                          {confluenceZoneText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* KARTU 2: Sinkronisasi Waktu (Filter Lunar) */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all space-y-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-indigo-400 font-extrabold text-sm flex items-center gap-2">
                        <span>2. Sinkronisasi Waktu (Filter Lunar):</span>
                      </span>
                      <Moon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-slate-300 space-y-2 leading-relaxed">
                      <p className="flex items-center gap-2">
                        <strong>Status Filter:</strong>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${oracleResult.isLunarValid ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
                          {oracleResult.isLunarValid ? 'VALID' : 'TIDAK VALID'}
                        </span>
                      </p>
                      <p>
                        <strong>Fase Lunar:</strong> {oracleLunarPhase}
                      </p>
                      <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
                        {oracleResult.isLunarValid 
                          ? 'Waktu saat ini berada di dalam jendela aktif H-2 hingga H+2 dari puncak fase bulan (Bulan Purnama/Bulan Baru). Gravitasi waktu selaras untuk memicu pembalikan arah pasar.' 
                          : 'Waktu saat ini berada di luar jendela aktif H-2 hingga H+2 fase bulan utama. Volatilitas siklikal netral/lemah.'}
                      </p>
                    </div>
                  </div>

                  {/* KARTU 3: Validasi Ruang (Momentum Vektor) */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all space-y-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none"></div>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-purple-400 font-extrabold text-sm flex items-center gap-2">
                        <span>3. Validasi Ruang (Momentum Vektor):</span>
                      </span>
                      <Compass className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-slate-300 space-y-2 leading-relaxed">
                      <p>
                        <strong>Sudut Tren Pythagoras:</strong> <span className="text-white font-bold">{angleNum}°</span>
                      </p>
                      <p>
                        <strong>Evaluasi Geometris:</strong>{' '}
                        <span className={oracleResult.isSpaceHarmonic ? 'text-emerald-400 font-bold' : oracleResult.isSpaceExhausted ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                          {oracleResult.isSpaceHarmonic ? 'Keseimbangan Harmonik (45°)' : oracleResult.isSpaceExhausted ? 'Kelelahan Tren (>70° Exhaustion)' : 'Momentum Sedang / Datar'}
                        </span>
                      </p>
                      <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
                        {oracleResult.isSpaceHarmonic
                          ? 'Sudut 45 derajat (Gann 1x1) merefleksikan keselarasan sempurna 1 unit harga per 1 unit waktu.'
                          : oracleResult.isSpaceExhausted
                          ? 'Sudut curam (>70°) menandakan akselerasi harga yang tidak seimbang dengan waktu (over-extended) dan rentan memantul tajam.'
                          : 'Sudut tren berada pada fase akselerasi biasa tanpa distorsi kelelahan.'}
                      </p>
                    </div>
                  </div>

                  {/* KARTU 4: Konfirmasi Psikologi (Candlestick) */}
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-emerald-400 font-extrabold text-sm flex items-center gap-2">
                        <span>4. Konfirmasi Psikologi (Candlestick):</span>
                      </span>
                      <CandlestickChart className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-slate-300 space-y-2 leading-relaxed">
                      <p>
                        <strong>Pola Homma Terpantau:</strong><br />
                        <span className={oracleResult.isCandleConfirmed ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                          {oracleCandle}
                        </span>
                      </p>
                      <p>
                        <strong>Sentuhan Zona Konfluensi:</strong>{' '}
                        <span className={oracleResult.isCandleConfirmed ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                          {oracleResult.isCandleConfirmed ? 'Terkonfirmasi Aktif' : 'Menunggu Reaksi'}
                        </span>
                      </p>
                      <p className="text-slate-400 text-[11px] leading-relaxed pt-1">
                        {oracleResult.isCandleConfirmed
                          ? 'Pola lilin penolakan harga ajaran Munehisa Homma mengonfirmasi masuknya tekanan beli institusional pada zona harga kritis.'
                          : 'Belum terkonfirmasi adanya reaksi penolakan harga yang jelas pada Zona Konfluensi. Diperlukan kesabaran konfirmasi.'}
                      </p>
                    </div>
                  </div>

                </div>

                {/* KEPUTUSAN GANN-LUNAR ARCHITECT BANNER */}
                <div className={`p-6 rounded-2xl border ${decisionBadgeColor} space-y-4 shadow-xl`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-current/20 pb-3">
                    <span className="font-black text-lg uppercase tracking-wider text-white">
                      KEPUTUSAN GANN-LUNAR ARCHITECT:
                    </span>
                    <span className="text-2xl font-black flex items-center gap-2 font-mono">
                      <span>{decisionIcon}</span>
                      <span>{oracleResult.decision}</span>
                    </span>
                  </div>

                  {oracleResult.decision === 'EXECUTE' && (
                    <div className="space-y-3 font-mono text-xs sm:text-sm">
                      <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-xl space-y-2">
                        <div className="text-emerald-300 font-bold text-sm">
                          🟢 EXECUTE: Semua 4 Dimensi Sinkron Sempurna!
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                          <div>
                            <span className="text-slate-400">Rekomendasi Tindakan:</span>
                            <div className="text-white font-bold text-sm">BUY / LONG POSISI</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Area Entry (Zona Konfluensi):</span>
                            <div className="text-emerald-400 font-bold text-sm">{confluenceZoneText}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Letak Stop Loss (SL):</span>
                            <div className="text-rose-400 font-bold text-sm">
                              {oracleResult.stopLoss.toFixed(2)}{' '}
                              <span className="text-[10px] text-slate-400 font-normal">(Di bawah level Gann Support S1)</span>
                            </div>
                          </div>
                          <div className="sm:col-span-2 mt-2 pt-2 border-t border-slate-800">
                            <span className="text-slate-400 font-medium">Target Take Profit Bertingkat (TP 1, TP 2, TP 3):</span>
                            <div className="grid grid-cols-3 gap-2.5 mt-2">
                              <div className="bg-slate-900/90 border border-emerald-500/40 p-2.5 rounded-xl text-center">
                                <span className="text-[10px] text-emerald-400 font-bold block uppercase tracking-wider">TP 1 (Gann R1)</span>
                                <span className="text-emerald-300 font-bold text-sm font-mono">{oracleResult.takeProfit1.toFixed(2)}</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5">Conservative</span>
                              </div>
                              <div className="bg-slate-900/90 border border-teal-500/40 p-2.5 rounded-xl text-center">
                                <span className="text-[10px] text-teal-400 font-bold block uppercase tracking-wider">TP 2 (Gann R2)</span>
                                <span className="text-teal-300 font-bold text-sm font-mono">{oracleResult.takeProfit2.toFixed(2)}</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5">Harmonic 90°</span>
                              </div>
                              <div className="bg-slate-900/90 border border-cyan-500/40 p-2.5 rounded-xl text-center">
                                <span className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">TP 3 (Gann R3)</span>
                                <span className="text-cyan-300 font-bold text-sm font-mono">{oracleResult.takeProfit3.toFixed(2)}</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5">Extended 180°</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {oracleResult.decision === 'STANDBY' && (
                    <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200 text-xs sm:text-sm font-sans leading-relaxed">
                      🟡 <strong>STANDBY:</strong> Zona Konfluensi ({confluenceZoneText}) telah tersentuh dan dimensi Waktu/Ruang valid, namun menunggu konfirmasi reaksi pola candlestick Homma yang tegas di area tersebut. <strong>Jangan mendahului pasar; tunggu penutupan lilin konfirmasi.</strong>
                    </div>
                  )}

                  {oracleResult.decision === 'IGNORE' && (
                    <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-200 text-xs sm:text-sm font-sans leading-relaxed">
                      🔴 <strong>IGNORE:</strong> Dimensi Harga dan Waktu Lunar tidak sinkron (atau momentum sudut tren tidak memenuhi syarat harmonik). <strong>Abaikan kondisi pasar saat ini (NO TRADE); jangan memaksakan entri pada struktur yang belum matang.</strong>
                    </div>
                  )}
                </div>

                {/* AI Synthesis Deep Report */}
                {oracleAiReport && (
                  <div className="pt-6 border-t border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Executive AI Deep Analysis (Gemini 3.8 Flash)</span>
                    </div>
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans shadow-inner">
                      {oracleAiReport}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Real-Time Technical Indicators Suite */}
            <TechnicalIndicatorsPanel
              metrics={technicalMetrics}
              assetName={assetName}
              currentPrice={priceVal}
            />

          </div>
        )}

        {/* LIVE TRADING DASHBOARD */}
        {activeTab === 'dashboard' && result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar: Watchlist */}
            <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Watchlist (TradingView Feeds)</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 animate-pulse">● Live</span>
              </div>

              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                {watchlist.map((item) => {
                  const isSelected = assetName.includes(item.symbol);
                  return (
                    <div
                      key={item.symbol}
                      onClick={() => handleSelectWatchlistAsset(item)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-500/10' : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'}`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{item.symbol}</span>
                          {isSelected && <span className="text-[9px] px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded">Active</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{item.name}</div>
                      </div>

                      <div className="text-right font-mono">
                        <div className={`text-xs font-bold transition-colors duration-300 ${item.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.price.toLocaleString()}
                        </div>
                        <div className={`text-[10px] font-semibold ${item.change >= 0 ? 'text-emerald-400/90' : 'text-rose-400/90'}`}>
                          {item.change >= 0 ? `+${item.change}%` : `${item.change}%`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Main Column */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Top Section: TradingView Widget Iframe */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-amber-400 font-mono">TradingView Real-Time Chart</span>
                      <h2 className="text-xl font-bold text-white flex items-center gap-3 mt-0.5">
                        <span>{assetName}</span>
                        <span className={`text-2xl font-mono font-extrabold px-3 py-0.5 rounded-lg border transition-all duration-300 ${isPriceUp ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]'}`}>
                          {livePrice.toLocaleString()}
                        </span>
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSyncAllParametersFromChart}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md"
                      title="Sinkronkan harga dan swing high/low ke kalkulator"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Sync ke Kalkulator</span>
                    </button>
                    <button
                      onClick={handleManualSyncTradingViewPrice}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/40 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Input TV</span>
                    </button>
                    <button
                      onClick={() => setChartSource('tradingview')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${chartSource === 'tradingview' ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
                    >
                      TradingView
                    </button>
                    <button
                      onClick={() => setChartSource('simulation')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${chartSource === 'simulation' ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' : 'bg-slate-950 border-slate-800 text-slate-300'}`}
                    >
                      Gann Sim
                    </button>
                  </div>
                </div>

                {/* Interactive Chart Studies / Indicator Toolbar */}
                <IndicatorStudySelector
                  selectedStudies={selectedStudies}
                  onToggleStudy={handleToggleStudy}
                  onSelectPreset={handleSelectStudyPreset}
                />

                <div className="h-[420px] w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative">
                  {chartSource === 'tradingview' ? (
                    <iframe
                      key={`dashboard-${tvSymbol}-${selectedStudies.join('-')}`}
                      src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(tvSymbol)}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0f172a&theme=dark&style=1&timezone=Etc%2FUTC&locale=id${studiesParam}`}
                      width="100%"
                      height="100%"
                      style={{ border: 'none' }}
                      title="TradingView Chart"
                    />
                  ) : (
                    <div className="h-full w-full p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={result.candles} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                          <YAxis stroke="#64748b" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <ReferenceLine y={result.res1} stroke="#fb7185" strokeWidth={1.5} label="R1" />
                          <ReferenceLine y={result.pivot} stroke="#fbbf24" strokeWidth={2} label="Pivot" />
                          <ReferenceLine y={result.sup1} stroke="#34d399" strokeWidth={1.5} label="S1" />
                          <Bar dataKey={(d: Candle) => [Math.min(d.open, d.close), Math.max(d.open, d.close)]} fill="#38bdf8">
                            {result.candles.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.isGreen ? '#10b981' : '#f43f5e'} />
                            ))}
                          </Bar>
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section: Automated Trading Tool (W.D. Gann) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Automated Trading Tool (W.D. Gann Square of 9)</h3>
                      <p className="text-xs text-slate-400">Sinkronkan harga live TradingView secara otomatis tanpa mengetik manual.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSyncAllParametersFromChart}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer animate-pulse whitespace-nowrap"
                    >
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>Auto-Sync Current Price</span>
                    </button>
                  </div>
                </div>

                {/* Form Parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                      <span>Harga Acuan (Pivot)</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Live: {livePrice.toLocaleString()}</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={pivotInput}
                      onChange={(e) => setPivotInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                      <span>Swing High</span>
                      <span className="text-[10px] text-slate-400 font-mono">Chart: {liveHigh.toLocaleString()}</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={oracleSwingHigh}
                      onChange={(e) => setOracleSwingHigh(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                      <span>Swing Low</span>
                      <span className="text-[10px] text-slate-400 font-mono">Chart: {liveLow.toLocaleString()}</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={oracleSwingLow}
                      onChange={(e) => setOracleSwingLow(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-white text-sm font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      <span>Faktor Sudut Gann</span>
                    </label>
                    <select
                      value={factorInput}
                      onChange={(e) => setFactorInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="0.125">0.125 (45° Harmonic - Standard)</option>
                      <option value="0.250">0.250 (90° Square Angle)</option>
                      <option value="0.375">0.375 (135° Major Vibration)</option>
                      <option value="0.500">0.500 (180° Opposition)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => calculateGann(false)}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-95 text-slate-950 font-black py-4 px-6 rounded-xl transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer text-base uppercase tracking-wider"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      <span>Calculate Support & Resistance</span>
                    </>
                  )}
                </button>

                {/* Target Probability Cards (Support & Resistance) */}
                <div className="pt-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Hasil Probabilitas Level Target (W.D. Gann Square of 9)</span>
                    <span className="text-[11px] font-mono text-slate-400">Pivot Acuan: {result.pivot}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Resistance Card */}
                    <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-rose-900/30">
                        <span className="text-xs font-bold text-rose-400 uppercase">Resisten Utama (Atas)</span>
                        <TrendingUp className="w-4 h-4 text-rose-400" />
                      </div>
                      <div className="space-y-1 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">R3 (Target 3):</span>
                          <span className="text-rose-300 font-bold">{result.res3}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">R2 (Target 2):</span>
                          <span className="text-rose-300 font-bold">{result.res2}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-1 border-t border-rose-900/30">
                          <span className="text-white font-bold">R1 (Target Utama):</span>
                          <span className="text-rose-400 font-black">{result.res1}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {result.res1Steps}
                      </div>
                    </div>

                    {/* Pivot Card */}
                    <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-900/30">
                        <span className="text-xs font-bold text-amber-400 uppercase">Harga Acuan (Pivot)</span>
                        <Target className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-center py-2">
                        <div className="text-3xl font-black font-mono text-white">{result.pivot}</div>
                        <div className="text-[11px] text-amber-300 mt-1 font-mono">√Price = {result.root.toFixed(4)}</div>
                      </div>
                      <div className="text-[11px] text-slate-300 space-y-1 border-t border-amber-900/30 pt-2 font-mono">
                        <div className="flex justify-between">
                          <span>Fibonacci 50%:</span>
                          <span className="text-white font-bold">{result.fib500}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fibonacci 61.8%:</span>
                          <span className="text-purple-400 font-bold">{result.fib618}</span>
                        </div>
                      </div>
                    </div>

                    {/* Support Card */}
                    <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-900/30">
                        <span className="text-xs font-bold text-emerald-400 uppercase">Support Utama (Bawah)</span>
                        <TrendingDown className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="space-y-1 font-mono text-xs">
                        <div className="flex justify-between text-sm pb-1 border-b border-emerald-900/30">
                          <span className="text-white font-bold">S1 (Bantalan Utama):</span>
                          <span className="text-emerald-400 font-black">{result.sup1}</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-slate-400">S2 (Target 2):</span>
                          <span className="text-emerald-300 font-bold">{result.sup2}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">S3 (Target 3):</span>
                          <span className="text-emerald-300 font-bold">{result.sup3}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {result.sup1Steps}
                      </div>
                    </div>
                  </div>

                  {/* Precision Execution Zones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-emerald-400 uppercase">Area Akumulasi Buy (S1 Tight Zone)</div>
                        <div className="text-xs text-slate-400 mt-0.5">Rentang pantulan support Gann</div>
                      </div>
                      <div className="font-mono text-sm font-bold text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                        {result.buyZoneStart} – {result.buyZoneEnd}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-rose-400 uppercase">Area Distribusi Sell (R1 Tight Zone)</div>
                        <div className="text-xs text-slate-400 mt-0.5">Rentang penolakan resisten Gann</div>
                      </div>
                      <div className="font-mono text-sm font-bold text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
                        {result.sellZoneStart} – {result.sellZoneEnd}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Real-Time Technical Indicators Suite inside Dashboard */}
              <TechnicalIndicatorsPanel
                metrics={technicalMetrics}
                assetName={assetName}
                currentPrice={priceVal}
              />

            </div>

          </div>
        )}

        {/* DEDICATED TECHNICAL INDICATORS TAB */}
        {activeTab === 'indicators' && (
          <div className="space-y-8 max-w-6xl mx-auto">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                      SUITE INDIKATOR MULTI-DIMENSI
                    </span>
                    <span className="text-xs text-amber-400 font-mono">Aset: {assetName}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Indikator Teknikal & 4 Dimensi Real-Time
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Pantau pergerakan osilator modern (RSI, MACD, Bollinger Bands) secara simultan dengan getaran geometris Gann, rasio emas Fibonacci, siklus lunar, dan psikologi candlestick.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncAllParametersFromChart}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Auto-Sync Semua</span>
                  </button>
                </div>
              </div>

              {/* Quick Asset Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px] uppercase font-semibold shrink-0">Pilih Aset:</span>
                {watchlist.map((item) => {
                  const isSelected = assetName.includes(item.symbol);
                  return (
                    <button
                      key={item.symbol}
                      onClick={() => handleSelectWatchlistAsset(item)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${isSelected ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm' : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'}`}
                    >
                      <span>{item.symbol}</span>
                      <span className={`font-mono text-[11px] ${isSelected ? 'text-slate-950 font-bold' : item.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.price.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Chart with Studies Toolbar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CandlestickChart className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Visualisasi Chart & Indikator ({assetName})</span>
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  Live: {livePrice.toLocaleString()}
                </div>
              </div>

              <IndicatorStudySelector
                selectedStudies={selectedStudies}
                onToggleStudy={handleToggleStudy}
                onSelectPreset={handleSelectStudyPreset}
              />

              <div className="h-[420px] w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                <iframe
                  key={`ind-${tvSymbol}-${selectedStudies.join('-')}`}
                  src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_indicators_widget&symbol=${encodeURIComponent(tvSymbol)}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0f172a&theme=dark&style=1&timezone=Etc%2FUTC&locale=id${studiesParam}`}
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  title="TradingView Indicator Chart"
                />
              </div>
            </div>

            {/* Technical Indicators Complete Panel */}
            <TechnicalIndicatorsPanel
              metrics={technicalMetrics}
              assetName={assetName}
              currentPrice={priceVal}
            />

          </div>
        )}

        {/* Other Tabs */}
        {activeTab === 'signal' && result && (
          <div className="space-y-8 max-w-5xl mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Area Buy & Area Sell (Presisi Tinggi)</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Aset: {assetName} (Chart Price: {livePrice.toLocaleString()})</p>
                </div>
                <button
                  onClick={handleSyncAllParametersFromChart}
                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Sync dari Chart</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-5 space-y-3">
                  <div className="text-xs font-bold text-emerald-400 uppercase">Area Akumulasi Buy (Demand / S1)</div>
                  <div className="font-mono text-base text-white font-bold">{result.buyZoneStart} – {result.buyZoneEnd}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Level akumulasi optimal di sekitar Support S1 Gann. Tempatkan Stop Loss ketat di level {(result.sup1 * 0.997).toFixed(2)}.
                  </p>
                </div>
                <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-5 space-y-3">
                  <div className="text-xs font-bold text-rose-400 uppercase">Area Distribusi Sell (Supply / R1)</div>
                  <div className="font-mono text-base text-white font-bold">{result.sellZoneStart} – {result.sellZoneEnd}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Level distribusi / take profit optimal di sekitar Resisten R1 Gann. Batas invalidasi di level {(result.res1 * 1.003).toFixed(2)}.
                  </p>
                </div>
              </div>

              {/* Multi-Target Take Profit (TP 1, TP 2, TP 3) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    <span>Target Take Profit Bertingkat (Multi-Target Gann)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Berdasarkan Putaran Derajat Gann Square of 9</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950/80 border border-emerald-500/30 p-3.5 rounded-xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-bold">TP 1 (Gann R1)</span>
                      <span className="text-[10px] text-slate-500 font-mono">45° Shift</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-emerald-300 mt-1">{result.res1}</div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Amankan 40% volume posisi di target konservatif pertama.</p>
                  </div>
                  <div className="bg-slate-950/80 border border-teal-500/30 p-3.5 rounded-xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-teal-400 font-bold">TP 2 (Gann R2)</span>
                      <span className="text-[10px] text-slate-500 font-mono">90° Square</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-teal-300 mt-1">{result.res2}</div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Amankan 40% volume & geser SL ke titik impas (Breakeven).</p>
                  </div>
                  <div className="bg-slate-950/80 border border-cyan-500/30 p-3.5 rounded-xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cyan-400 font-bold">TP 3 (Gann R3)</span>
                      <span className="text-[10px] text-slate-500 font-mono">135° Extended</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-cyan-300 mt-1">{result.res3}</div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Trailing stop untuk 20% sisa posisi sampai momentum jenuh.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <span>Kalkulator Utama W.D. Gann Square of 9</span>
              </h2>
              <button
                onClick={handleSyncAllParametersFromChart}
                className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Sync dari Chart ({livePrice.toLocaleString()})</span>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Harga Acuan (Pivot)</label>
                <input
                  type="number"
                  step="any"
                  value={pivotInput}
                  onChange={(e) => setPivotInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Faktor Sudut (Angle Factor)</label>
                <select
                  value={factorInput}
                  onChange={(e) => setFactorInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="0.125">0.125 (45° Harmonic - Standard Day Trading)</option>
                  <option value="0.250">0.250 (90° Square Angle - Swing)</option>
                  <option value="0.375">0.375 (135° Major Vibration)</option>
                  <option value="0.500">0.500 (180° Opposition)</option>
                </select>
              </div>
              <button
                onClick={() => calculateGann(false)}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all cursor-pointer text-sm"
              >
                Hitung Ulang Level Gann
              </button>
            </div>
          </div>
        )}

        {activeTab === 'backtest' && result && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm max-w-5xl mx-auto space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <span>Backtest Performa Sinyal W.D. Gann</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Win Rate</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">{backtestStats.winRate}%</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Total Sinyal</div>
                <div className="text-xl font-bold text-white mt-1">{backtestStats.totalSignals}</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Total Profit</div>
                <div className="text-xl font-bold text-amber-400 mt-1">+{backtestStats.totalProfit} pts</div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Best Trade</div>
                <div className="text-xl font-bold text-emerald-300 mt-1">+{backtestStats.bestTrade} pts</div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md mt-16">
        {/* News Ticker (Dashboard only) */}
        {activeTab !== 'landing' && (
          <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-1.5 flex items-center gap-3 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold shrink-0 bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800">
              <Newspaper className="w-3 h-3 text-blue-400" />
              <span>MARKET NEWS</span>
            </div>
            <div className="truncate text-slate-300">
              <span className="text-amber-300 font-semibold">[LUNAR ALIGNED]:</span> Siklus Full Moon H-1 mengonfirmasi volatilitas tinggi pada komoditas XAU/USD dan crypto major. Zona konfluensi Gann Square of 9 diuji pada level 4,148.74.
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <Orbit className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white tracking-tight">Gann-Lunar Architect</span>
            <span className="text-slate-600">·</span>
            <span>Algorithmic 4D Confluence Execution System</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <button onClick={() => setActiveTab('landing')} className="hover:text-amber-300 transition-colors cursor-pointer">Beranda</button>
            <button onClick={() => setActiveTab('oracle')} className="hover:text-amber-300 transition-colors cursor-pointer">4D Architect</button>
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-amber-300 transition-colors cursor-pointer">Market Space</button>
            <button onClick={() => setActiveTab('indicators')} className="hover:text-amber-300 transition-colors cursor-pointer">Indikator</button>
            <button onClick={() => setActiveTab('calculator')} className="hover:text-amber-300 transition-colors cursor-pointer">Kalkulator Gann</button>
          </div>
          <p className="text-slate-500 font-mono text-[11px]">© 2026 Gann-Lunar Architect. Presisi 4 Dimensi Pasar.</p>
        </div>
      </footer>
    </div>
  );
}
