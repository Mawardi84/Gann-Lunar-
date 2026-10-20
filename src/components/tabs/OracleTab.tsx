import React from 'react';
import { 
  ShieldCheck, Activity, Zap, CandlestickChart, Edit3, Moon, Compass, Target, 
  Sparkles, Check, Copy, BookOpen 
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, Bar, Cell, Line 
} from 'recharts';
import { MarketState, Candle } from '../../hooks/useMarketState';
import { IndicatorStudySelector } from '../IndicatorStudySelector';
import { TechnicalIndicatorsPanel } from '../TechnicalIndicatorsPanel';

interface OracleTabProps {
  state: MarketState;
}

export const OracleTab: React.FC<OracleTabProps> = ({ state }) => {
  const {
    assetName,
    livePrice,
    liveHigh,
    liveLow,
    priceChange,
    priceSource,
    marketSpaceChartMode,
    setMarketSpaceChartMode,
    result,
    watchlist,
    handleSelectWatchlistAsset,
    handleAutoSyncPrice,
    handleManualSyncTradingViewPrice,
    handleSynchronize4DMatrix,
    syncGlowing,
    matrixSynced,
    pivotInput,
    setPivotInput,
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
    setAutoSyncEnabled,
    oracleResult,
    gannVals,
    fibVals,
    confluenceZoneText,
    copiedFormat,
    handleCopyStructuredReport,
    handleRunOracleAI,
    oracleAiLoading,
    oracleAiReport,
    technicalMetrics,
    priceVal,
    sHigh,
    sLow,
    angleNum,
    tvSymbol,
    selectedStudies,
    handleToggleStudy,
    handleSelectStudyPreset,
    isPivotMatched,
    isHighMatched,
    isLowMatched,
    saveToJournal,
    structuredReportText,
    chartInterval,
    chartStyle,
    chartTheme,
    chartTimezone,
    showSideToolbar,
  } = state;

  const studiesParam = selectedStudies.length > 0
    ? `&studies=${encodeURIComponent(JSON.stringify(selectedStudies))}`
    : '';

  let decisionBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  let decisionIcon = '🟡';

  if (oracleResult.decision === 'IGNORE') {
    decisionBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    decisionIcon = '🔴';
  } else if (oracleResult.decision === 'EXECUTE') {
    decisionBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    decisionIcon = '🟢';
  }

  return (
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
              {priceSource === 'fallback' && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  FALLBACK DATA
                </span>
              )}
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
                {item.source === 'fallback' && (
                  <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    FB
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Chart Display */}
        {marketSpaceChartMode === 'simulation' && result ? (
          <div className="space-y-3">
            <div className="h-[360px] w-full bg-slate-950/90 rounded-2xl border border-slate-800/80 p-4 relative overflow-hidden">
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
                key={`oracle-${tvSymbol}-${chartInterval}-${chartStyle}-${chartTheme}-${showSideToolbar}-${chartTimezone}-${selectedStudies.join('-')}`}
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_oracle_widget&symbol=${encodeURIComponent(tvSymbol)}&interval=${chartInterval}&hidesidetoolbar=${showSideToolbar ? '0' : '1'}&symboledit=1&saveimage=1&toolbarbg=${chartTheme === 'dark' ? '0f172a' : 'f8fafc'}&theme=${chartTheme}&style=${chartStyle}&timezone=${encodeURIComponent(chartTimezone)}&locale=id${studiesParam}`}
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
              <Compass className="w-5 h-5" />
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
          <div className={`p-4 rounded-2xl border transition-all ${isPivotMatched ? 'bg-slate-950/80 border-slate-800' : 'bg-amber-950/20 border-amber-500/40'}`}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <span>Harga Saat Ini (Pivot)</span>
              </label>
              <button
                onClick={handleAutoSyncPrice}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-mono font-bold underline cursor-pointer"
              >
                Auto-Sync
              </button>
            </div>
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
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-mono">
              <span>Live Chart: {livePrice.toLocaleString()}</span>
              <span>√Price = {Math.sqrt(priceVal).toFixed(3)}</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${isHighMatched ? 'bg-slate-950/80 border-slate-800' : 'bg-amber-950/20 border-amber-500/40'}`}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-300 font-semibold">Ayunan Atas (Swing High)</label>
              <span className="text-[10px] font-mono text-slate-400">High: {liveHigh.toLocaleString()}</span>
            </div>
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
            <p className="text-[11px] text-slate-400 mt-2 font-mono">Titik awal ayunan gelombang harga</p>
          </div>

          <div className={`p-4 rounded-2xl border transition-all ${isLowMatched ? 'bg-slate-950/80 border-slate-800' : 'bg-amber-950/20 border-amber-500/40'}`}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-300 font-semibold">Ayunan Bawah (Swing Low)</label>
              <span className="text-[10px] font-mono text-slate-400">Low: {liveLow.toLocaleString()}</span>
            </div>
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
            <p className="text-[11px] text-slate-400 mt-2 font-mono">Titik akhir ayunan gelombang harga</p>
          </div>

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

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
            <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <CandlestickChart className="w-4 h-4 text-emerald-400" />
              <span>Candlestick Pattern (Psikologi Homma)</span>
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

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
            <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Sudut Vektor Pythagoras (Dimensi Ruang)</span>
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

        {/* Big Glowing Button */}
        <div className="pt-2">
          <button
            onClick={handleSynchronize4DMatrix}
            className={`w-full py-4 px-8 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-base uppercase tracking-wider rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.55)] hover:shadow-[0_0_55px_rgba(245,158,11,0.85)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-3 border border-amber-300/40 relative overflow-hidden group ${syncGlowing ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-[1.01]' : ''}`}
          >
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

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => saveToJournal({
                  asset: assetName,
                  oracleReport: oracleAiReport || structuredReportText,
                  price: livePrice,
                  confluenceScore: technicalMetrics.compositeScore,
                  decision: oracleResult.decision,
                })}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
                title="Simpan analisis ini ke daftar Journal lokal"
              >
                <BookOpen className="w-4 h-4" />
                <span>Simpan ke Journal</span>
              </button>

              <button
                onClick={handleCopyStructuredReport}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                {copiedFormat ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedFormat ? 'Tersalin ke Clipboard!' : 'Salin Format'}</span>
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
            {/* KARTU 1: Harga */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-amber-400 font-extrabold text-sm">1. Arsitektur Harga (Zona Konfluensi):</span>
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

            {/* KARTU 2: Waktu */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-indigo-400 font-extrabold text-sm">2. Sinkronisasi Waktu (Filter Lunar):</span>
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

            {/* KARTU 3: Ruang */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-purple-400 font-extrabold text-sm">3. Validasi Ruang (Momentum Vektor):</span>
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

            {/* KARTU 4: Psikologi */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3 relative overflow-hidden group">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-emerald-400 font-extrabold text-sm">4. Konfirmasi Psikologi (Candlestick):</span>
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
  );
};

export default OracleTab;
