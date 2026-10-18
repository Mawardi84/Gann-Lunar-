import React from 'react';
import { Target, Zap, ShieldCheck } from 'lucide-react';
import { MarketState } from '../../hooks/useMarketState';

interface SignalTabProps {
  state: MarketState;
}

export const SignalTab: React.FC<SignalTabProps> = ({ state }) => {
  const { result, assetName, livePrice, handleSyncAllParametersFromChart } = state;

  if (!result) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Area Buy & Area Sell (Presisi Tinggi)</h2>
            <p className="text-xs text-slate-400 mt-0.5">Aset: {assetName} (Chart Price: {livePrice.toLocaleString()})</p>
          </div>
          <button
            onClick={handleSyncAllParametersFromChart}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-md"
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
  );
};
