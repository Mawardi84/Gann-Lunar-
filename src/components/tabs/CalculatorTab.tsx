import React from 'react';
import { Calculator, Zap } from 'lucide-react';
import { MarketState } from '../../hooks/useMarketState';

interface CalculatorTabProps {
  state: MarketState;
}

export const CalculatorTab: React.FC<CalculatorTabProps> = ({ state }) => {
  const { pivotInput, setPivotInput, factorInput, setFactorInput, calculateGann, handleSyncAllParametersFromChart, livePrice } = state;

  return (
    <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-amber-400" />
          <span>Kalkulator Utama W.D. Gann Square of 9</span>
        </h2>
        <button
          onClick={handleSyncAllParametersFromChart}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-md"
        >
          <Zap className="w-3.5 h-3.5 fill-slate-950" />
          <span>Sync dari Chart ({livePrice.toLocaleString()})</span>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Harga Acuan (Pivot)</label>
          <input
            type="number"
            step="any"
            value={pivotInput}
            onChange={(e) => setPivotInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500 font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Faktor Sudut (Angle Factor)</label>
          <select
            value={factorInput}
            onChange={(e) => setFactorInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="0.125">0.125 (45° Harmonic - Standard Day Trading)</option>
            <option value="0.250">0.250 (90° Square Angle - Swing)</option>
            <option value="0.375">0.375 (135° Major Vibration)</option>
            <option value="0.500">0.500 (180° Opposition)</option>
          </select>
        </div>

        <button
          onClick={() => calculateGann(false)}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all cursor-pointer text-sm shadow-lg shadow-amber-500/20"
        >
          Hitung Ulang Level Gann
        </button>
      </div>
    </div>
  );
};
