import React, { useState } from 'react';
import { 
  CandlestickChart, Zap, Clock, Palette, Globe, Layers, Maximize2, Minimize2, Check, RefreshCw, Terminal 
} from 'lucide-react';
import { MarketState } from '../../hooks/useMarketState';
import { IndicatorStudySelector } from '../IndicatorStudySelector';
import { PineScriptEditor } from '../PineScriptEditor';

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
    chartInterval,
    setChartInterval,
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
    result,
  } = state;

  const [showPineEditor, setShowPineEditor] = useState<boolean>(false);

  const studiesParam = selectedStudies.length > 0
    ? `&studies=${encodeURIComponent(JSON.stringify(selectedStudies))}`
    : '';

  const hideSide = showSideToolbar ? '0' : '1';
  const toolbarBg = chartTheme === 'dark' ? '0f172a' : 'f8fafc';

  const tradingViewUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart_tab&symbol=${encodeURIComponent(tvSymbol)}&interval=${chartInterval}&hidesidetoolbar=${hideSide}&symboledit=1&saveimage=1&toolbarbg=${toolbarBg}&theme=${chartTheme}&style=${chartStyle}&timezone=${encodeURIComponent(chartTimezone)}&locale=id${studiesParam}`;

  const pivotVal = result?.pivot ?? livePrice;
  const s1Val = result?.sup1 ?? livePrice * 0.98;
  const r1Val = result?.res1 ?? livePrice * 1.02;

  return (
    <div className={`space-y-6 mx-auto transition-all ${isChartFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto max-w-none' : 'max-w-6xl'}`}>
      <div className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-5 ${isChartFullscreen ? 'min-h-[90vh] flex flex-col' : ''}`}>
        
        {/* Header & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <CandlestickChart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  TradingView Professional Chart ({assetName})
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                  PRO SUITE + PINE v5
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Live Symbol: <span className="text-amber-300 font-semibold">{tvSymbol}</span> | Price: <strong className="text-emerald-400">${livePrice.toLocaleString()}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowPineEditor(!showPineEditor)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showPineEditor 
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>{showPineEditor ? 'Tutup Pine Editor' : 'Buka Pine Editor'}</span>
            </button>

            <button
              onClick={() => setIsChartFullscreen(!isChartFullscreen)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
              title={isChartFullscreen ? "Keluar Fullscreen" : "Fullscreen Chart"}
            >
              {isChartFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-amber-400" />}
              <span>{isChartFullscreen ? 'Normal' : 'Fullscreen'}</span>
            </button>

            <button
              onClick={handleSyncAllParametersFromChart}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer shadow-emerald-500/20"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Sync ke Kalkulator</span>
            </button>
          </div>
        </div>

        {/* Advanced TradingView Customization Toolbar */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          
          {/* 1. Timeframe / Interval Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Timeframe / Interval</span>
            </label>
            <div className="flex flex-wrap gap-1">
              {[
                { label: '1m', val: '1' },
                { label: '5m', val: '5' },
                { label: '15m', val: '15' },
                { label: '30m', val: '30' },
                { label: '1H', val: '60' },
                { label: '4H', val: '240' },
                { label: '1D', val: 'D' },
                { label: '1W', val: 'W' },
              ].map(item => (
                <button
                  key={item.val}
                  onClick={() => setChartInterval(item.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartInterval === item.val
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Chart Style Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-400 flex items-center gap-1.5">
              <CandlestickChart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tipe Chart (Style)</span>
            </label>
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'Candle', val: '1' },
                { label: 'Bars', val: '0' },
                { label: 'Line', val: '3' },
                { label: 'Area', val: '9' },
                { label: 'Heiken', val: '8' },
              ].map(item => (
                <button
                  key={item.val}
                  onClick={() => setChartStyle(item.val)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartStyle === item.val
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Theme & Side Toolbar */}
          <div className="space-y-1.5">
            <label className="text-slate-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-sky-400" />
              <span>Tema & Toolbar Gambar</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChartTheme(chartTheme === 'dark' ? 'light' : 'dark')}
                className="px-3 py-1 rounded-lg bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer font-semibold"
              >
                Tema: {chartTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
              <button
                onClick={() => setShowSideToolbar(!showSideToolbar)}
                className={`px-3 py-1 rounded-lg border transition-all cursor-pointer font-semibold ${
                  showSideToolbar 
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' 
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Tools: {showSideToolbar ? 'Aktif' : 'Hidden'}
              </button>
            </div>
          </div>

          {/* 4. Timezone Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>Zona Waktu (Timezone)</span>
            </label>
            <select
              value={chartTimezone}
              onChange={(e) => setChartTimezone(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="Etc/UTC">UTC (Coordinated)</option>
              <option value="Asia/Jakarta">Jakarta (WIB / GMT+7)</option>
              <option value="America/New_York">New York (EST)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>

        </div>

        {/* Indicator Studies Selector */}
        <IndicatorStudySelector
          selectedStudies={selectedStudies}
          onToggleStudy={handleToggleStudy}
          onSelectPreset={handleSelectStudyPreset}
        />

        {/* TradingView Embed Iframe Container */}
        <div className={`w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden ${isChartFullscreen ? 'flex-1 min-h-[75vh]' : 'h-[600px]'}`}>
          <iframe
            key={`chart-tab-${tvSymbol}-${chartInterval}-${chartStyle}-${chartTheme}-${showSideToolbar}-${chartTimezone}-${selectedStudies.join('-')}`}
            src={tradingViewUrl}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title="TradingView Pro Full Chart"
          />
        </div>

        {/* Pine Script Editor Section */}
        {showPineEditor && (
          <div className="pt-4 border-t border-slate-800 animate-fadeIn">
            <PineScriptEditor 
              tvSymbol={tvSymbol} 
              pivot={pivotVal} 
              s1={s1Val} 
              r1={r1Val} 
            />
          </div>
        )}
      </div>
    </div>
  );
};
