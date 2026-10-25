import React, { useState } from 'react';
import { 
  Activity, Gauge, TrendingUp, TrendingDown, Moon, ShieldCheck, 
  Orbit, Compass, Sparkles, AlertTriangle, CheckCircle2, ChevronRight,
  Flame, BarChart2, Layers
} from 'lucide-react';
import { IndicatorMetrics } from '../utils/indicators';

interface TechnicalIndicatorsPanelProps {
  metrics: IndicatorMetrics;
  assetName: string;
  currentPrice: number;
}

export const TechnicalIndicatorsPanel: React.FC<TechnicalIndicatorsPanelProps> = ({
  metrics,
  assetName,
  currentPrice,
}) => {
  const [filter, setFilter] = useState<'all' | 'momentum' | 'ancient' | 'psychology'>('all');

  const verdictColors = {
    'STRONG BUY': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40 shadow-emerald-500/20',
    'BUY': 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10',
    'STANDBY / NEUTRAL': 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-amber-500/10',
    'SELL': 'text-rose-300 bg-rose-500/10 border-rose-500/30 shadow-rose-500/10',
    'STRONG SELL': 'text-rose-400 bg-rose-500/10 border-rose-500/40 shadow-rose-500/20',
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-md p-6 shadow-xl backdrop-blur-sm space-y-6">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-wide">
                Indikator Teknikal & 4 Dimensi Pasar
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono animate-pulse ${
                metrics.isCollectingData 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {metrics.isCollectingData ? `● Mengumpulkan Data (${metrics.dataPointsCount}/50)` : '● Live Real-Time'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Kompilasi matematis Gann Square of 9, Fibonacci, Lunar Clock, Pythagoras, dan Osilator Modern ({assetName}).
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${filter === 'all' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Semua (8)
          </button>
          <button
            onClick={() => setFilter('momentum')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${filter === 'momentum' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Modern
          </button>
          <button
            onClick={() => setFilter('ancient')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${filter === 'ancient' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
          >
            4 Dimensi
          </button>
        </div>
      </div>

      {/* Composite Consensus Card */}
      <div className={`p-5 rounded-md border ${verdictColors[metrics.overallVerdict]} shadow-lg transition-all`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Sinyal Konsensus Multi-Indikator
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-black tracking-tight">
                {metrics.overallVerdict}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-white font-bold">
                Skor: {metrics.compositeScore}%
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 max-w-xl">
              Harga saat ini ({currentPrice.toLocaleString()}) berada pada tren{' '}
              <strong className="text-amber-400">{metrics.trend}</strong> dengan konvergensi ruang Pythagoras{' '}
              <strong className="text-white">{metrics.pythagoras.angleDegrees}° ({metrics.pythagoras.evaluation})</strong> dan status siklus lunar{' '}
              <strong className="text-white">{metrics.lunar.phaseName}</strong>.
            </p>
          </div>

          {/* Progress bar gauge */}
          <div className="md:w-64 space-y-2 shrink-0">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Konfluensi</span>
              <span className="font-bold text-white">{metrics.compositeScore} / 100</span>
            </div>
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  metrics.compositeScore >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                  metrics.compositeScore >= 45 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                  'bg-gradient-to-r from-rose-500 to-rose-400'
                }`}
                style={{ width: `${metrics.compositeScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Bearish (0%)</span>
              <span>Netral (50%)</span>
              <span>Bullish (100%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">

        {/* 1. RSI Indicator */}
        {(filter === 'all' || filter === 'momentum') && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>RSI (14) Momentum</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                metrics.rsi.status === 'Overbought' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                metrics.rsi.status === 'Oversold' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                metrics.rsi.status === 'Mengumpulkan data...' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                'bg-slate-800 text-slate-300'
              }`}>
                {metrics.rsi.status}
              </span>
            </div>

            {metrics.rsi.isCollecting || metrics.rsi.value === null ? (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-1">
                <span className="text-xs font-semibold text-amber-400 block animate-pulse">Mengumpulkan data...</span>
                <span className="text-[10px] text-slate-400 block">Menunggu akumulasi minimal 15 titik data time-series</span>
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono text-white">{metrics.rsi.value}</span>
                  <span className={`text-xs font-semibold flex items-center gap-1 ${metrics.rsi.signal === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {metrics.rsi.signal === 'Bullish' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {metrics.rsi.signal}
                  </span>
                </div>

                {/* RSI visual scale */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-sky-400 rounded-full transition-all duration-300"
                      style={{ width: `${metrics.rsi.value}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>30 (Oversold)</span>
                    <span>50</span>
                    <span>70 (Overbought)</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 2. MACD Momentum */}
        {(filter === 'all' || filter === 'momentum') && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>MACD (12, 26, 9)</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                metrics.macd.signal === 'Mengumpulkan data...' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                metrics.macd.signal.includes('Bullish') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {metrics.macd.signal}
              </span>
            </div>

            {metrics.macd.isCollecting || metrics.macd.macdLine === null ? (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-1">
                <span className="text-xs font-semibold text-amber-400 block animate-pulse">Mengumpulkan data...</span>
                <span className="text-[10px] text-slate-400 block">Menunggu akumulasi minimal 35 titik data time-series</span>
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Histogram:</span>
                    <span className={`text-xl font-black font-mono ${(metrics.macd.histogram ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {(metrics.macd.histogram ?? 0) >= 0 ? `+${metrics.macd.histogram}` : metrics.macd.histogram}
                    </span>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400">
                    <div>MACD: <span className="text-white font-bold">{metrics.macd.macdLine}</span></div>
                    <div>Signal: <span className="text-slate-300">{metrics.macd.signalLine}</span></div>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Momentum Tren:</span>
                  <strong className={(metrics.macd.histogram ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {(metrics.macd.histogram ?? 0) >= 0 ? 'Akumulasi Bullish' : 'Distribusi Bearish'}
                  </strong>
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. Bollinger Bands & Volatility */}
        {(filter === 'all' || filter === 'momentum') && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Bollinger Bands (20, 2)</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                metrics.bollinger.status === 'Mengumpulkan data...' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                metrics.bollinger.status === 'Squeeze' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                metrics.bollinger.status === 'Expansion' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                'bg-slate-800 text-slate-300'
              }`}>
                {metrics.bollinger.status === 'Squeeze' ? '⚡ Squeeze Alert' : metrics.bollinger.status}
              </span>
            </div>

            {metrics.bollinger.isCollecting || metrics.bollinger.upper === null ? (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center space-y-1">
                <span className="text-xs font-semibold text-amber-400 block animate-pulse">Mengumpulkan data...</span>
                <span className="text-[10px] text-slate-400 block">Menunggu akumulasi minimal 20 titik data time-series</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">Upper</span>
                    <span className="text-rose-400 font-bold">{metrics.bollinger.upper}</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 block text-[9px]">Middle (SMA)</span>
                    <span className="text-amber-400 font-bold">{metrics.bollinger.middle}</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-emerald-400 font-bold">{metrics.bollinger.lower}</span>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Bandwidth: <strong className="text-white font-mono">{metrics.bollinger.bandwidth}%</strong></span>
                  <span>%B: <strong className="text-purple-400 font-mono">{metrics.bollinger.percentB}%</strong></span>
                </div>
              </>
            )}
          </div>
        )}

        {/* 4. Gann Square of 9 Vibration Angle */}
        {(filter === 'all' || filter === 'ancient') && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Orbit className="w-3.5 h-3.5 text-amber-400" />
                <span>Gann Square of 9</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold font-mono">
                √P: {metrics.gannVibration.root}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Sudut Rotasi:</span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  {metrics.gannVibration.currentAngleDegrees}°
                </span>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <div>Harmonik Terdekat:</div>
                <div className="text-white font-bold">{metrics.gannVibration.nearestHarmonic}</div>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between font-mono">
              <span>Jarak ke Harmonik:</span>
              <span className="text-amber-400 font-bold">{metrics.gannVibration.distanceToHarmonicPct}%</span>
            </div>
          </div>
        )}

        {/* 5. Fibonacci Golden Pocket (0.5 - 0.618) */}
        {(filter === 'all' || filter === 'ancient') && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Golden Pocket (Fib)</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                metrics.fibonacci.inGoldenPocket ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                'bg-slate-800 text-slate-300'
              }`}>
                {metrics.fibonacci.inGoldenPocket ? '🎯 In Golden Pocket' : 'Di Luar Pocket'}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>Fib 0.500:</span>
                <strong className="text-white">{metrics.fibonacci.fib500.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Fib 0.618:</span>
                <strong className="text-amber-400">{metrics.fibonacci.fib618.toFixed(2)}</strong>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between">
              <span>Status Konfluensi:</span>
              <strong className={metrics.fibonacci.inGoldenPocket ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {metrics.fibonacci.inGoldenPocket ? 'Valid (Berhimpitan)' : `Deviasi ${metrics.fibonacci.distanceToPocketPct}%`}
              </strong>
            </div>
          </div>
        )}

        {/* 6. Lunar Volatility Clock */}
        {(filter === 'all' || filter === 'ancient') && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Siklus Lunar (Waktu)</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                metrics.lunar.isHighVolatilityWindow ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-slate-800 text-slate-300'
              }`}>
                {metrics.lunar.isHighVolatilityWindow ? '⚡ Volatilitas Tinggi' : 'Normal'}
              </span>
            </div>

            <div>
              <div className="text-white font-bold text-xs truncate" title={metrics.lunar.phaseName}>
                {metrics.lunar.phaseName}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Iluminasi: <strong className="text-indigo-300">{metrics.lunar.illuminationPct}%</strong>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between font-mono">
              <span>Ke Pivot Berikutnya:</span>
              <span className="text-white font-bold">{metrics.lunar.daysToNextPivot} hari</span>
            </div>
          </div>
        )}

        {/* 7. Pythagoras Space Vector Angle (Cyan - Ruang) */}
        {(filter === 'all' || filter === 'ancient') && (
          <div className="bg-slate-950 p-4 rounded-md border border-slate-800 border-l-4 border-l-cyan-500 hover:border-cyan-500/80 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pythagoras (Ruang)</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono tabular-nums ${
                metrics.pythagoras.angleDegrees >= 70 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                metrics.pythagoras.angleDegrees >= 40 && metrics.pythagoras.angleDegrees <= 55 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                'bg-slate-800 text-slate-300'
              }`}>
                {metrics.pythagoras.angleDegrees}° Vektor
              </span>
            </div>

            <div>
              <div className="text-2xl font-black font-mono tabular-nums text-cyan-400">
                {metrics.pythagoras.angleDegrees}°
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {metrics.pythagoras.evaluation}
              </p>
            </div>

            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between font-mono">
              <span>Status Keseimbangan:</span>
              <strong className={metrics.pythagoras.angleDegrees >= 70 ? 'text-rose-400' : 'text-cyan-400'}>
                {metrics.pythagoras.angleDegrees >= 70 ? 'Tren Lelah (Awas Reversal)' : 'Seimbang 1x1'}
              </strong>
            </div>
          </div>
        )}

        {/* 8. Homma Candlestick Psychology (Fuchsia - Psikologi) */}
        {(filter === 'all' || filter === 'psychology') && (
          <div className="bg-slate-950 p-4 rounded-md border border-slate-800 border-l-4 border-l-fuchsia-500 hover:border-fuchsia-500/80 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Homma Candlestick</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                metrics.homma.patternType === 'Bullish Reversal' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                metrics.homma.patternType === 'Bearish Reversal' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                'bg-slate-800 text-slate-300'
              }`}>
                {metrics.homma.patternType}
              </span>
            </div>

            <div>
              <div className="text-white font-bold text-xs truncate" title={metrics.homma.patternName}>
                {metrics.homma.patternName}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono tabular-nums">
                Tekanan Buyer: <strong className="text-emerald-400">{metrics.homma.bullPressurePct}%</strong> vs Seller: <strong className="text-rose-400">{metrics.homma.bearPressurePct}%</strong>
              </div>
            </div>

            {/* Pressure Bar */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-rose-500/40 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${metrics.homma.bullPressurePct}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono tabular-nums">
                <span className="text-emerald-400 font-bold">Buyer {metrics.homma.bullPressurePct}%</span>
                <span className="text-rose-400 font-bold">Seller {metrics.homma.bearPressurePct}%</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
