import React from 'react';
import { SlidersHorizontal, Check, RefreshCw, BarChart3 } from 'lucide-react';

export interface StudyItem {
  id: string;
  label: string;
  shortLabel: string;
  category: 'momentum' | 'trend' | 'volatility' | 'volume';
}

export const AVAILABLE_STUDIES: StudyItem[] = [
  { id: 'RSI@tv-basicstudies', label: 'RSI (14)', shortLabel: 'RSI', category: 'momentum' },
  { id: 'MACD@tv-basicstudies', label: 'MACD (12, 26, 9)', shortLabel: 'MACD', category: 'momentum' },
  { id: 'BB@tv-basicstudies', label: 'Bollinger Bands', shortLabel: 'BB', category: 'volatility' },
  { id: 'MASimple@tv-basicstudies', label: 'SMA (Moving Avg)', shortLabel: 'SMA', category: 'trend' },
  { id: 'MAExp@tv-basicstudies', label: 'EMA (Exponential)', shortLabel: 'EMA', category: 'trend' },
  { id: 'StochasticRSI@tv-basicstudies', label: 'Stoch RSI', shortLabel: 'StochRSI', category: 'momentum' },
  { id: 'Volume@tv-basicstudies', label: 'Volume Flow', shortLabel: 'Vol', category: 'volume' },
];

interface IndicatorStudySelectorProps {
  selectedStudies: string[];
  onToggleStudy: (studyId: string) => void;
  onSelectPreset: (presetName: 'momentum' | 'trend' | 'all' | 'clean') => void;
}

export const IndicatorStudySelector: React.FC<IndicatorStudySelectorProps> = ({
  selectedStudies,
  onToggleStudy,
  onSelectPreset,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
      
      {/* Left: Indicator Toggle Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold mr-1 text-[11px] uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
          <span>Indikator Chart:</span>
        </div>

        {AVAILABLE_STUDIES.map((study) => {
          const isActive = selectedStudies.includes(study.id);
          return (
            <button
              key={study.id}
              onClick={() => onToggleStudy(study.id)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
              title={`Aktifkan indikator ${study.label} di chart TradingView`}
            >
              {isActive && <Check className="w-3 h-3 stroke-[3]" />}
              <span>{study.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Quick Presets */}
      <div className="flex items-center gap-1 self-end sm:self-auto shrink-0 text-[11px]">
        <span className="text-slate-500 text-[10px] mr-1 hidden sm:inline">Preset:</span>
        <button
          onClick={() => onSelectPreset('momentum')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
        >
          Momentum
        </button>
        <button
          onClick={() => onSelectPreset('trend')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
        >
          Trend
        </button>
        <button
          onClick={() => onSelectPreset('all')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 cursor-pointer"
        >
          Semua
        </button>
        <button
          onClick={() => onSelectPreset('clean')}
          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 cursor-pointer"
          title="Hapus semua indikator overlay"
        >
          Reset
        </button>
      </div>

    </div>
  );
};
