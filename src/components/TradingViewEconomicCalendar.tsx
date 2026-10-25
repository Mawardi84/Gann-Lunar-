import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Globe2, ShieldAlert, Sparkles, RefreshCw, Filter } from 'lucide-react';

interface TradingViewEconomicCalendarProps {
  countryFilterPreset?: 'global' | 'us' | 'majors' | 'asia_pac';
  importanceFilter?: '-1,0,1' | '0,1' | '1';
  height?: number | string;
}

export const TradingViewEconomicCalendar: React.FC<TradingViewEconomicCalendarProps> = ({
  countryFilterPreset = 'global',
  importanceFilter = '0,1',
  height = 680,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPreset, setSelectedPreset] = useState<'global' | 'us' | 'majors' | 'asia_pac'>(countryFilterPreset);
  const [selectedImportance, setSelectedImportance] = useState<'-1,0,1' | '0,1' | '1'>(importanceFilter);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Map presets to country code strings
  const getCountryCodes = (preset: typeof selectedPreset): string => {
    switch (preset) {
      case 'us':
        return 'us';
      case 'majors':
        return 'us,eu,gb,jp,ch,ca,au';
      case 'asia_pac':
        return 'id,jp,au,cn,sg,in';
      case 'global':
      default:
        return 'us,eu,gb,jp,id,au,ca,ch,cn';
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget
    container.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    widgetContainer.style.width = '100%';
    widgetContainer.style.height = '100%';
    container.appendChild(widgetContainer);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.async = true;

    const widgetConfig = {
      colorTheme: 'dark',
      isTransparent: false,
      width: '100%',
      height: typeof height === 'number' ? `${height}px` : height,
      locale: 'id',
      importanceFilter: selectedImportance,
      countryFilter: getCountryCodes(selectedPreset)
    };

    script.innerHTML = JSON.stringify(widgetConfig);

    const handleLoad = () => {
      setIsLoading(false);
    };

    script.addEventListener('load', handleLoad);
    container.appendChild(script);

    // Timeout fallback to clear loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      script.removeEventListener('load', handleLoad);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [selectedPreset, selectedImportance, reloadKey, height]);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-md p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
      {/* Top Filter Bar for TradingView Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Globe2 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">TradingView Real-Time Feed</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE STREAMING
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Pembaruan live otomatis tanpa refresh. Dilengkapi chart historis dan konsensus pra-rilis.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Negara */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => setSelectedPreset('global')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPreset === 'global' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Global
            </button>
            <button
              onClick={() => setSelectedPreset('us')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPreset === 'us' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇺🇸 US Tier-1
            </button>
            <button
              onClick={() => setSelectedPreset('majors')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPreset === 'majors' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              G7 FX
            </button>
            <button
              onClick={() => setSelectedPreset('asia_pac')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedPreset === 'asia_pac' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇮🇩 Asia-Pac
            </button>
          </div>

          {/* Preset Dampak */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => setSelectedImportance('-1,0,1')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                selectedImportance === '-1,0,1' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Semua tingkatan dampak"
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedImportance('0,1')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                selectedImportance === '0,1' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Dampak Sedang & Tinggi"
            >
              Sedang & Tinggi
            </button>
            <button
              onClick={() => setSelectedImportance('1')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                selectedImportance === '1' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Khusus Dampak Tinggi (High Impact)"
            >
              🔴 Khusus Tinggi
            </button>
          </div>

          <button
            onClick={() => setReloadKey(k => k + 1)}
            className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl transition-all cursor-pointer"
            title="Muat ulang widget"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Widget Container */}
      <div className="relative rounded-md overflow-hidden border border-slate-800/80 bg-[#131722] min-h-[580px] w-full">
        <style>{`
          .tradingview-widget-container, .tradingview-widget-container__widget, .tradingview-widget-container iframe {
            width: 100% !important;
            height: 640px !important;
            border: none !important;
          }
        `}</style>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 gap-3 backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
            <p className="text-xs font-mono text-slate-400">Sinkronisasi data streaming TradingView...</p>
          </div>
        )}
        <div ref={containerRef} className="tradingview-widget-container w-full h-[640px]" />
      </div>

      {/* Institutional Footer Notice */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60 gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          Data waktu rilis disinkronkan langsung dengan bursa global & lembaga statistik resmi.
        </span>
        <span className="text-slate-500">
          Powered by TradingView Economic Stream Engine
        </span>
      </div>
    </div>
  );
};
