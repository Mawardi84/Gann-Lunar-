import React from 'react';
import { 
  Star, Zap, Edit3, Calculator, RefreshCw, Target, TrendingUp, TrendingDown 
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, Bar, Cell 
} from 'recharts';
import { MarketState, Candle, WatchlistItem } from '../../hooks/useMarketState';
import { IndicatorStudySelector } from '../IndicatorStudySelector';
import { TechnicalIndicatorsPanel } from '../TechnicalIndicatorsPanel';

interface DashboardTabProps {
  state: MarketState;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ state }) => {
  const {
    result,
    assetName,
    livePrice,
    liveHigh,
    liveLow,
    isPriceUp,
    priceSource,
    watchlist,
    handleSelectWatchlistAsset,
    handleSyncAllParametersFromChart,
    handleManualSyncTradingViewPrice,
    chartSource,
    setChartSource,
    selectedStudies,
    handleToggleStudy,
    handleSelectStudyPreset,
    tvSymbol,
    pivotInput,
    setPivotInput,
    oracleSwingHigh,
    setOracleSwingHigh,
    oracleSwingLow,
    setOracleSwingLow,
    factorInput,
    setFactorInput,
    calculateGann,
    loading,
    technicalMetrics,
    priceVal,
  } = state;

  if (!result) return null;

  const studiesParam = selectedStudies.length > 0
    ? `&studies=${encodeURIComponent(JSON.stringify(selectedStudies))}`
    : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Sidebar: Watchlist */}
      <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4 sticky top-24">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Watchlist (TradingView Feeds)</h3>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
            priceSource === 'live'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {priceSource === 'live' ? '● Live Feeds' : '● Fallback Data'}
          </span>
        </div>

        <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
          {watchlist.map((item) => {
            const isSelected = assetName.includes(item.symbol);
            const isFallback = item.source === 'fallback';
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
                    {isFallback ? (
                      <span className="text-[8px] px-1.5 py-0.2 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded font-mono font-semibold" title="Data fallback offline">
                        FB
                      </span>
                    ) : (
                      <span className="text-[8px] px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded font-mono font-semibold">
                        LIVE
                      </span>
                    )}
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
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-mono">TradingView Real-Time Chart</span>
                  {priceSource === 'fallback' && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      FALLBACK DATA
                    </span>
                  )}
                </div>
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
  );
};
