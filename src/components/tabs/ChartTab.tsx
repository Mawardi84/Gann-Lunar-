import React from 'react';
import { CandlestickChart, Zap } from 'lucide-react';
import { MarketState } from '../../hooks/useMarketState';
import { IndicatorStudySelector } from '../IndicatorStudySelector';

interface ChartTabProps {
  state: MarketState;
}

export const ChartTab: React.FC<ChartTabProps> = ({ state }) => {
  const {
    assetName,
    livePrice,
    tvSymbol,
    selectedStudies,
    handleToggleStudy,
    handleSelectStudyPreset,
    handleSyncAllParametersFromChart,
  } = state;

  const studiesParam = selectedStudies.length > 0
    ? `&studies=${encodeURIComponent(JSON.stringify(selectedStudies))}`
    : '';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <CandlestickChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Chart Interaktif TradingView ({assetName})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Live Price: <strong className="text-emerald-400">${livePrice.toLocaleString()}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAllParametersFromChart}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer shadow-emerald-500/20"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Sync ke Kalkulator</span>
            </button>
          </div>
        </div>

        <IndicatorStudySelector
          selectedStudies={selectedStudies}
          onToggleStudy={handleToggleStudy}
          onSelectPreset={handleSelectStudyPreset}
        />

        <div className="h-[600px] w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <iframe
            key={`chart-tab-${tvSymbol}-${selectedStudies.join('-')}`}
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart_tab&symbol=${encodeURIComponent(tvSymbol)}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0f172a&theme=dark&style=1&timezone=Etc%2FUTC&locale=id${studiesParam}`}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="TradingView Full Chart"
          />
        </div>
      </div>
    </div>
  );
};
