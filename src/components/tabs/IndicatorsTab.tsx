import React from 'react';
import { Gauge, Zap, CandlestickChart } from 'lucide-react';
import { MarketState } from '../../hooks/useMarketState';
import { IndicatorStudySelector } from '../IndicatorStudySelector';
import { TechnicalIndicatorsPanel } from '../TechnicalIndicatorsPanel';
import { TimeframeSelectorBar } from '../TimeframeSelectorBar';

interface IndicatorsTabProps {
  state: MarketState;
}

export const IndicatorsTab: React.FC<IndicatorsTabProps> = ({ state }) => {
  const {
    assetName,
    handleSyncAllParametersFromChart,
    watchlist,
    handleSelectWatchlistAsset,
    livePrice,
    selectedStudies,
    handleToggleStudy,
    handleSelectStudyPreset,
    tvSymbol,
    technicalMetrics,
    priceVal,
    chartInterval,
    chartStyle,
    chartTheme,
    chartTimezone,
    showSideToolbar,
  } = state;

  const studiesParam = selectedStudies.length > 0
    ? `&studies=${encodeURIComponent(JSON.stringify(selectedStudies))}`
    : '';

  return (
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
              Pantau pergerakan osilator modern (RSI Wilder, MACD 12,26,9, Bollinger Bands 20,2) secara simultan dengan getaran geometris Gann, rasio emas Fibonacci, siklus lunar, dan psikologi candlestick.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAllParametersFromChart}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer shadow-emerald-500/20"
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
                {item.source === 'fallback' && (
                  <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    FB
                  </span>
                )}
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

        <TimeframeSelectorBar state={state} variant="compact" title="Timeframe Analisis Indikator & Deteksi Entry" />

        <div className="h-[420px] w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <iframe
            key={`ind-${tvSymbol}-${chartInterval}-${chartStyle}-${chartTheme}-${showSideToolbar}-${chartTimezone}-${selectedStudies.join('-')}`}
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_indicators_widget&symbol=${encodeURIComponent(tvSymbol)}&interval=${chartInterval}&hidesidetoolbar=${showSideToolbar ? '0' : '1'}&symboledit=1&saveimage=1&toolbarbg=${chartTheme === 'dark' ? '0f172a' : 'f8fafc'}&theme=${chartTheme}&style=${chartStyle}&timezone=${encodeURIComponent(chartTimezone)}&locale=id${studiesParam}`}
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
  );
};
