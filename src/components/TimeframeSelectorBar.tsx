import React from 'react';
import { Clock, Target, Zap, ArrowUpRight, ArrowDownRight, Layers, Sparkles } from 'lucide-react';
import { MarketState } from '../hooks/useMarketState';
import { TIMEFRAME_CONFIGS, TimeframeId } from '../utils/timeframeLevels';

interface TimeframeSelectorBarProps {
  state: MarketState;
  variant?: 'full' | 'compact';
  title?: string;
}

export const TimeframeSelectorBar: React.FC<TimeframeSelectorBarProps> = ({
  state,
  variant = 'full',
  title = 'Timeframe & Dynamic Entry Zone',
}) => {
  const {
    chartInterval,
    changeTimeframe,
    currentTimeframeLevels,
    livePrice,
    handleSyncAllParametersFromChart,
  } = state;

  const timeframes: TimeframeId[] = ['1', '5', '15', '30', '60', '240', 'D', 'W'];

  const tfLabel = currentTimeframeLevels?.label ?? chartInterval ?? 'D';
  const tfCategory = currentTimeframeLevels?.category ?? 'Swing';
  const tfHigh = currentTimeframeLevels?.high ?? livePrice * 1.01;
  const tfLow = currentTimeframeLevels?.low ?? livePrice * 0.99;
  const tfRange = currentTimeframeLevels?.range ?? (tfHigh - tfLow);
  const tfFactor = currentTimeframeLevels?.recommendedFactor ?? 0.125;

  const entryZone = currentTimeframeLevels?.entryZone;
  const isEntryActive = entryZone?.confluenceStatus === 'ENTRY_ZONE_ACTIVE';
  const isNearZone = entryZone?.confluenceStatus === 'NEAR_ZONE';

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-3.5">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">{title}</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                TF: {tfLabel} ({tfCategory})
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              High & Low dihitung adaptif per timeframe agar area entry dan level konfluensi terdeteksi presisi.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSyncAllParametersFromChart}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          title="Terapkan High, Low, dan Faktor TF ini langsung ke kalkulator dan oracle"
        >
          <Zap className="w-3.5 h-3.5 fill-emerald-300" />
          <span>Sync TF ke Oracle</span>
        </button>
      </div>

      {/* Timeframe Buttons Row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-slate-400 text-xs font-mono font-semibold mr-1">Pilih TF:</span>
        {timeframes.map((tfId) => {
          const cfg = TIMEFRAME_CONFIGS[tfId];
          const isSelected = chartInterval === tfId;
          return (
            <button
              key={tfId}
              onClick={() => changeTimeframe(tfId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{cfg.label}</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                  isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : 'text-slate-500'
                }`}
              >
                {cfg.category === 'Scalping' ? 'Scalp' : cfg.category === 'Intraday' ? 'Day' : 'Swing'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeframe Metrics & Entry Zone Detection Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
        {/* Metric 1: Swing High */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-rose-400" />
              <span>TF Swing High</span>
            </div>
            <div className="text-sm font-bold text-rose-400 mt-0.5">
              ${tfHigh.toLocaleString()}
            </div>
          </div>
          <span className="text-[10px] text-slate-500">Resisten TF</span>
        </div>

        {/* Metric 2: Swing Low */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-emerald-400" />
              <span>TF Swing Low</span>
            </div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">
              ${tfLow.toLocaleString()}
            </div>
          </div>
          <span className="text-[10px] text-slate-500">Support TF</span>
        </div>

        {/* Metric 3: Range & Factor */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-400" />
              <span>Rentang & Faktor</span>
            </div>
            <div className="text-sm font-bold text-amber-300 mt-0.5">
              ${tfRange.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Faktor Gann</span>
            <span className="text-[11px] font-bold text-white">{tfFactor}</span>
          </div>
        </div>

        {/* Metric 4: Area Entry Status */}
        <div
          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
            isEntryActive
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : isNearZone
              ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
              : 'bg-slate-900/90 border-slate-800 text-slate-300'
          }`}
        >
          <div>
            <div className="text-[10px] uppercase flex items-center gap-1 font-bold">
              <Target className="w-3 h-3" />
              <span>Status Area Entry</span>
            </div>
            <div className="text-xs font-bold mt-0.5 flex items-center gap-1">
              <span>{isEntryActive ? '🟢 AKTIF' : isNearZone ? '🟡 MENDEKATI' : '⚪ STANDBY'}</span>
            </div>
          </div>
          <div className="text-right text-[10px]">
            <span className="text-slate-400 block">Zona Beli:</span>
            <span className="text-white font-bold">
              {entryZone ? `${entryZone.buyZoneStart.toFixed(2)}–${entryZone.buyZoneEnd.toFixed(2)}` : 'Memetakan...'}
            </span>
          </div>
        </div>
      </div>

      {/* Banner Detil Area Entry yang Terdeteksi */}
      {variant === 'full' && entryZone && (
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
            isEntryActive
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : isNearZone
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-slate-900/70 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="font-mono text-[11px]">
              <strong className="text-white">{entryZone.statusText}</strong> | Fibonacci 50%: <span className="text-indigo-300 font-bold">${entryZone.fib50}</span> | Fib 61.8% Golden Pocket: <span className="text-purple-300 font-bold">${entryZone.fib618}</span>
            </span>
          </div>

          <div className="text-[10px] font-mono text-slate-400 shrink-0">
            Harga Saat Ini: <strong className="text-white">${livePrice.toLocaleString()}</strong>
          </div>
        </div>
      )}
    </div>
  );
};
