import React, { useState } from 'react';
import { 
  Calculator, Zap, Compass, Shield, Target, Copy, Check, 
  ArrowUpRight, ArrowDownRight, Layers, Sparkles, DollarSign, 
  Percent, RefreshCw, BarChart2, Info, RotateCcw
} from 'lucide-react';
import { MarketState } from '../../hooks/useMarketState';
import { calculateGannLevels, calculateFibonacciLevels } from '../../utils/gann';
import { calculatePositionSize, calculateGannWheelPosition } from '../../utils/calculator';

interface CalculatorTabProps {
  state: MarketState;
}

export const CalculatorTab: React.FC<CalculatorTabProps> = ({ state }) => {
  const { 
    pivotInput, 
    setPivotInput, 
    factorInput, 
    setFactorInput, 
    calculateGann, 
    handleSyncAllParametersFromChart, 
    livePrice,
    liveHigh,
    liveLow,
    assetName,
    watchlist,
    handleSelectWatchlistAsset,
    result
  } = state;

  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'wheel' | 'risk'>('matrix');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Risk Calculator States
  const [accountBalanceInput, setAccountBalanceInput] = useState<string>('10000');
  const [riskPercentInput, setRiskPercentInput] = useState<string>('1');
  const [customContractSize, setCustomContractSize] = useState<string>('100');

  // Parse values safely
  const pivotVal = parseFloat(pivotInput) || livePrice;
  const factorVal = parseFloat(factorInput) || 0.125;
  const decimals = pivotVal < 10 ? 4 : 2;

  // Compute Gann Levels
  const gann = calculateGannLevels(pivotVal, factorVal);
  const fib = calculateFibonacciLevels(liveHigh, liveLow);
  const wheel = calculateGannWheelPosition(pivotVal, livePrice);

  // Compute Position Sizing
  const accountBal = parseFloat(accountBalanceInput) || 10000;
  const riskPct = parseFloat(riskPercentInput) || 1;
  const contractSize = parseFloat(customContractSize) || 100;

  const positionRisk = calculatePositionSize(
    accountBal,
    riskPct,
    livePrice,
    gann.sup1,
    gann.res1,
    contractSize
  );

  const handleCopyValue = (key: string, val: number | string) => {
    const text = typeof val === 'number' ? val.toFixed(decimals) : val;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Step-by-step formulas
  const r1Step = `(√${pivotVal.toFixed(decimals)} + ${factorVal})² = (${gann.root.toFixed(4)} + ${factorVal})² = ${gann.res1.toFixed(decimals)}`;
  const s1Step = `(√${pivotVal.toFixed(decimals)} - ${factorVal})² = (${gann.root.toFixed(4)} - ${factorVal})² = ${gann.sup1.toFixed(decimals)}`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                QUANTITATIVE GANN CALCULATOR ENGINE
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Presisi Matematis Square of 9
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Kalkulator W.D. Gann Square of 9 & Manajemen Risiko
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Hitung level Support & Resisten harmonis W.D. Gann secara transparan, proyeksi sudut kuadran radial 360°, serta kalkulasi ukuran lot posisi berdasarkan toleransi batas risiko modal akun Anda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center shrink-0 space-y-1 w-full sm:w-auto">
              <span className="text-[10px] text-slate-400 font-mono uppercase">{assetName}</span>
              <div className="text-xl font-mono font-bold text-emerald-400">${livePrice.toLocaleString()}</div>
              <button
                onClick={handleSyncAllParametersFromChart}
                className="w-full mt-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md shadow-emerald-500/20"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Sync Pivot Dari Chart</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel: Inputs & Asset Quick Switcher */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
        
        {/* Watchlist Quick Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Pilih Aset Pasar:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {watchlist.slice(0, 10).map(item => {
              const isSelected = assetName.includes(item.symbol);
              return (
                <button
                  key={item.symbol}
                  onClick={() => {
                    handleSelectWatchlistAsset(item);
                    setPivotInput(item.price.toString());
                    calculateGann(false, item.price, parseFloat(factorInput));
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 border ${
                    isSelected 
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold' 
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{item.symbol}</span>
                  <span className={isSelected ? 'text-slate-950 font-mono' : 'text-slate-400 font-mono'}>
                    ${item.price.toFixed(item.price > 100 ? 2 : 4)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
          
          <div className="md:col-span-5 space-y-1.5">
            <label className="block text-xs font-mono font-bold text-slate-300">
              Harga Acuan Pivot (Root Origin)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={pivotInput}
                onChange={(e) => setPivotInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-base font-mono text-white focus:outline-none focus:border-amber-400 font-bold"
                placeholder="misal: 4164.86"
              />
              <button
                onClick={() => {
                  setPivotInput(livePrice.toString());
                  calculateGann(false, livePrice, parseFloat(factorInput));
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title="Gunakan harga live saat ini"
              >
                Use Live
              </button>
            </div>
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-mono font-bold text-slate-300">
              Faktor Sudut (Angle Factor)
            </label>
            <select
              value={factorInput}
              onChange={(e) => {
                const newFact = e.target.value;
                setFactorInput(newFact);
                calculateGann(false, parseFloat(pivotInput), parseFloat(newFact));
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-400 cursor-pointer font-bold"
            >
              <option value="0.125">0.125 (45° Harmonic - Day Trading)</option>
              <option value="0.250">0.250 (90° Square Angle - Swing)</option>
              <option value="0.375">0.375 (135° Major Vibration)</option>
              <option value="0.500">0.500 (180° Opposition Reversal)</option>
              <option value="0.750">0.750 (270° Major Cycle)</option>
              <option value="1.000">1.000 (360° Full Revolution)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              onClick={() => calculateGann(false)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-2xl transition-all cursor-pointer text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4 text-slate-950" />
              <span>Hitung Level Gann</span>
            </button>
          </div>

        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-800/80 flex-wrap">
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-1 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'matrix' ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Matriks Level & Formula</span>
          </button>
          <button
            onClick={() => setActiveSubTab('wheel')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'wheel' ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Roda Sudut Radial (Square of 9)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('risk')}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'risk' ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Kalkulator Risiko & Lot Size</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: MATRIX & FORMULA */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          
          {/* Step-by-Step Formula Explanation Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Derivasi Formula W.D. Gann Square of 9: (√Pivot ± Faktor)²
              </span>
              <span className="text-slate-400 text-[11px]">Akar Pivot: {gann.root.toFixed(4)}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/30 space-y-2">
                <span className="text-rose-400 font-bold block">Resisten R1 (Target Bullish 45°)</span>
                <code className="text-white block bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] overflow-x-auto">
                  {r1Step}
                </code>
                <p className="text-[11px] text-slate-400 font-sans">
                  Target proyeksi kenaikan awal saat harga menembus pivot ke atas.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                <span className="text-emerald-400 font-bold block">Support S1 (Target Bearish 45°)</span>
                <code className="text-white block bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] overflow-x-auto">
                  {s1Step}
                </code>
                <p className="text-[11px] text-slate-400 font-sans">
                  Target batas bawah penurunan awal saat harga tertekan dari pivot.
                </p>
              </div>
            </div>
          </div>

          {/* Level Resistance & Support Display Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Resistance Column */}
            <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2 uppercase tracking-wider">
                  <ArrowUpRight className="w-4 h-4 text-rose-400" />
                  Resisten & Zona Distribusi (Sell Target)
                </h3>
                <span className="text-xs font-mono text-slate-400">Target Atas</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* R3 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Resisten 3 (R3 - 135°)</span>
                    <strong className="text-lg text-rose-300 font-bold">${gann.res3.toFixed(decimals)}</strong>
                    <span className="text-slate-500 text-[10px] ml-2">
                      (+{(((gann.res3 - pivotVal) / pivotVal) * 100).toFixed(2)}%)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyValue('res3', gann.res3)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all cursor-pointer"
                    title="Copy R3"
                  >
                    {copiedKey === 'res3' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* R2 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Resisten 2 (R2 - 90°)</span>
                    <strong className="text-lg text-rose-400 font-bold">${gann.res2.toFixed(decimals)}</strong>
                    <span className="text-slate-500 text-[10px] ml-2">
                      (+{(((gann.res2 - pivotVal) / pivotVal) * 100).toFixed(2)}%)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyValue('res2', gann.res2)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all cursor-pointer"
                    title="Copy R2"
                  >
                    {copiedKey === 'res2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* R1 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Resisten 1 (R1 - 45°)</span>
                    <strong className="text-lg text-rose-400 font-bold">${gann.res1.toFixed(decimals)}</strong>
                    <span className="text-slate-500 text-[10px] ml-2">
                      (+{(((gann.res1 - pivotVal) / pivotVal) * 100).toFixed(2)}%)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyValue('res1', gann.res1)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all cursor-pointer"
                    title="Copy R1"
                  >
                    {copiedKey === 'res1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Sell Distribution Zone Banner */}
                <div className="bg-rose-950/20 border border-rose-500/30 p-3.5 rounded-2xl text-[11px] font-mono text-rose-300 space-y-1">
                  <span className="font-bold block">Zona Distribusi Jual (Sell Zone):</span>
                  <div>${gann.sellZoneStart.toFixed(decimals)} – ${gann.sellZoneEnd.toFixed(decimals)}</div>
                </div>
              </div>
            </div>

            {/* Support Column */}
            <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                  <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                  Support & Zona Akumulasi (Buy Target)
                </h3>
                <span className="text-xs font-mono text-slate-400">Target Bawah</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* S1 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Support 1 (S1 - 45°)</span>
                    <strong className="text-lg text-emerald-400 font-bold">${gann.sup1.toFixed(decimals)}</strong>
                    <span className="text-slate-500 text-[10px] ml-2">
                      ({(((gann.sup1 - pivotVal) / pivotVal) * 100).toFixed(2)}%)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyValue('sup1', gann.sup1)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all cursor-pointer"
                    title="Copy S1"
                  >
                    {copiedKey === 'sup1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* S2 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Support 2 (S2 - 90°)</span>
                    <strong className="text-lg text-emerald-400 font-bold">${gann.sup2.toFixed(decimals)}</strong>
                    <span className="text-slate-500 text-[10px] ml-2">
                      ({(((gann.sup2 - pivotVal) / pivotVal) * 100).toFixed(2)}%)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyValue('sup2', gann.sup2)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all cursor-pointer"
                    title="Copy S2"
                  >
                    {copiedKey === 'sup2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* S3 */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Support 3 (S3 - 135°)</span>
                    <strong className="text-lg text-emerald-300 font-bold">${gann.sup3.toFixed(decimals)}</strong>
                    <span className="text-slate-500 text-[10px] ml-2">
                      ({(((gann.sup3 - pivotVal) / pivotVal) * 100).toFixed(2)}%)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyValue('sup3', gann.sup3)}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-all cursor-pointer"
                    title="Copy S3"
                  >
                    {copiedKey === 'sup3' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Buy Accumulation Zone Banner */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-2xl text-[11px] font-mono text-emerald-300 space-y-1">
                  <span className="font-bold block">Zona Akumulasi Beli (Buy Zone):</span>
                  <div>${gann.buyZoneStart.toFixed(decimals)} – ${gann.buyZoneEnd.toFixed(decimals)}</div>
                </div>

              </div>
            </div>

          </div>

          {/* Fibonacci Confluence Overlay */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                Matriks Konfluensi Fibonacci Retracement (24h Range)
              </span>
              <span className="text-slate-400 text-[11px]">
                High: ${fib.swingHigh.toFixed(decimals)} · Low: ${fib.swingLow.toFixed(decimals)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Fib 38.2%</span>
                <span className="text-amber-300 font-bold">${fib.fib382.toFixed(decimals)}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Fib 50.0% (Golden Pivot)</span>
                <span className="text-emerald-400 font-bold">${fib.fib500.toFixed(decimals)}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Fib 61.8% (Golden Ratio)</span>
                <span className="text-sky-400 font-bold">${fib.fib618.toFixed(decimals)}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* VIEW MODE 2: RADIAL WHEEL (SQUARE OF 9) */}
      {activeSubTab === 'wheel' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <span>Roda Sudut Radial W.D. Gann Square of 9 (360°)</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Posisi sudut relatif harga live terhadap titik tengah pivot ({pivotVal.toFixed(decimals)})
              </p>
            </div>

            <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-amber-500/30 font-mono text-xs text-amber-300">
              Sudut Saat Ini: <strong className="text-white text-sm">{wheel.normalizedAngle}°</strong> ({wheel.quadrantName})
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* SVG Visual Radial Wheel */}
            <div className="lg:col-span-7 flex justify-center py-4">
              <svg viewBox="0 0 300 300" className="w-full max-w-[340px] h-auto font-mono text-[9px]">
                {/* Outer Ring */}
                <circle cx="150" cy="150" r="130" fill="none" stroke="#334155" strokeWidth="2" />
                <circle cx="150" cy="150" r="95" fill="none" stroke="#1e293b" strokeWidth="1.5" />
                <circle cx="150" cy="150" r="55" fill="none" stroke="#1e293b" strokeWidth="1.5" />
                <circle cx="150" cy="150" r="22" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />

                {/* Central Pivot */}
                <text x="150" y="153" textAnchor="middle" fill="#f59e0b" fontWeight="bold" fontSize="8">
                  PIVOT
                </text>

                {/* Cross Axes (0°, 90°, 180°, 270°) */}
                <line x1="20" y1="150" x2="280" y2="150" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="150" y1="20" x2="150" y2="280" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />

                {/* Ordinal Axes (45°, 135°, 225°, 315°) */}
                <line x1="58" y1="58" x2="242" y2="242" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="242" y1="58" x2="58" y2="242" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />

                {/* Angle Labels */}
                <text x="285" y="153" textAnchor="start" fill="#10b981" fontWeight="bold">0° (East)</text>
                <text x="150" y="12" textAnchor="middle" fill="#38bdf8" fontWeight="bold">90° (North)</text>
                <text x="10" y="153" textAnchor="end" fill="#f43f5e" fontWeight="bold">180° (West)</text>
                <text x="150" y="295" textAnchor="middle" fill="#fbbf24" fontWeight="bold">270° (South)</text>

                {/* Ordinals */}
                <text x="248" y="52" fill="#94a3b8">45° (R1/S1)</text>
                <text x="52" y="52" fill="#94a3b8" textAnchor="end">135° (R3/S3)</text>
                <text x="52" y="258" fill="#94a3b8" textAnchor="end">225°</text>
                <text x="248" y="258" fill="#94a3b8">315°</text>

                {/* Live Price Vector Needle */}
                {(() => {
                  const rad = (wheel.normalizedAngle * Math.PI) / 180;
                  const x2 = 150 + Math.cos(rad) * 115;
                  const y2 = 150 - Math.sin(rad) * 115; // Invert Y for SVG canvas
                  return (
                    <g>
                      <line x1="150" y1="150" x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx={x2} cy={y2} r="6" fill="#f59e0b" className="animate-pulse" />
                      <circle cx={x2} cy={y2} r="10" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Wheel Metrics Breakdown */}
            <div className="lg:col-span-5 space-y-4 font-mono text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-slate-400 text-[10px] block">Sudut Normalisasi Live</span>
                <div className="text-2xl font-bold text-amber-300">{wheel.normalizedAngle}°</div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Posisi sudut menunjukkan lintasan orbit harga relatif pada siklus W.D. Gann Square of 9.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-slate-400 text-[10px] block">Sudut Kardinal & Ordinal Terdekat</span>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-sky-400 font-bold">Kardinal: {wheel.nearestCardinalAngle}°</span>
                  <span className="text-amber-400 font-bold">Ordinal: {wheel.nearestOrdinalAngle}°</span>
                </div>
              </div>

              <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl text-amber-200 text-xs font-mono space-y-1">
                <span className="font-bold block">Strategi Eksekusi Sudut:</span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  Sudut Kardinal (0°, 90°, 180°, 270°) beraksi sebagai dinding pertahanan harga utama. Penembusan di atas sudut ordinal 45° membuka jalur akselerasi menuju resisten berikutnya.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW MODE 3: RISK & POSITION SIZING */}
      {activeSubTab === 'risk' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>Kalkulator Manajemen Risiko & Ukuran Lot (Position Size)</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Hitung batas maksimal risiko $ dan rekomendasi lot agar akun tidak berisiko *overleveraged*.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Form */}
            <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-bold">Saldo Modal Akun ($)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="any"
                    value={accountBalanceInput}
                    onChange={(e) => setAccountBalanceInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">Toleransi Risiko Per Transaksi (%)</label>
                <div className="relative">
                  <Percent className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="any"
                    value={riskPercentInput}
                    onChange={(e) => setRiskPercentInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-amber-300 font-bold text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-bold">Ukuran Kontrak Aset (Contract Size)</label>
                <select
                  value={customContractSize}
                  onChange={(e) => setCustomContractSize(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="100">100 (Standard Gold XAU/USD Lot)</option>
                  <option value="100000">100,000 (Standard Forex FX Lot)</option>
                  <option value="1">1 (Crypto BTC/USD / Stocks 1 Unit)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-400">
                <div>Entry: <strong className="text-white">${livePrice.toFixed(decimals)}</strong></div>
                <div>Stop Loss (S1): <strong className="text-rose-400">${gann.sup1.toFixed(decimals)}</strong></div>
                <div>Take Profit (R1): <strong className="text-emerald-400">${gann.res1.toFixed(decimals)}</strong></div>
              </div>
            </div>

            {/* Position Size Results Output */}
            <div className="lg:col-span-7 space-y-4 font-mono text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px]">Maksimal Toleransi Kerugian ($)</span>
                  <div className="text-2xl font-bold text-rose-400">${positionRisk.riskAmount.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-500 block">{positionRisk.riskPercent}% dari ${accountBal.toLocaleString()}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px]">Rekomendasi Ukuran Lot (Lots)</span>
                  <div className="text-2xl font-bold text-emerald-400">{positionRisk.recommendedLots} Lot</div>
                  <span className="text-[10px] text-slate-500 block">Total {positionRisk.totalUnits.toLocaleString()} unit</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px]">Jarak Risk (Point)</span>
                  <div className="text-lg font-bold text-amber-300">${positionRisk.priceRisk}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px]">Rasio Risk-to-Reward (R:R)</span>
                  <div className="text-lg font-bold text-sky-400">1 : {positionRisk.riskRewardRatio}</div>
                </div>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl text-emerald-200 space-y-1">
                <span className="font-bold block">Evaluasi Kedisiplinan Modal:</span>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  Membuka posisi sebesar <strong>{positionRisk.recommendedLots} Lot</strong> memastikan kerugian Anda tidak akan pernah melebihi <strong>${positionRisk.riskAmount}</strong> ({positionRisk.riskPercent}%) jika harga menyentuh Stop Loss pada S1.
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
