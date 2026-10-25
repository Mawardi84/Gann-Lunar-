import React, { useState, useMemo } from 'react';
import { 
  History, AlertCircle, TrendingUp, TrendingDown, CheckCircle2, XCircle, 
  RefreshCw, Play, Sliders, ShieldCheck, Award, Zap, BookOpen
} from 'lucide-react';
import { MarketState } from '../../hooks/useMarketState';
import { runGannBacktest, BacktestTradeLog } from '../../utils/backtest';

interface BacktestTabProps {
  state: MarketState;
}

export const BacktestTab: React.FC<BacktestTabProps> = ({ state }) => {
  const { 
    assetName, 
    currentAssetHistory, 
    priceVal, 
    gannVals, 
    saveToJournal,
    calculateGann 
  } = state;

  // Simulation Configuration States
  const [strategy, setStrategy] = useState<'REVERSION' | 'BREAKOUT' | 'CONFLUENCE'>('REVERSION');
  const [sampleBars, setSampleBars] = useState<number>(100);
  const [riskRewardRatio, setRiskRewardRatio] = useState<number>(2.0);
  const [filterOutcome, setFilterOutcome] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [importedTradeId, setImportedTradeId] = useState<string | null>(null);

  // Trigger Backtest recalculation based on options
  const backtestStats = useMemo(() => {
    return runGannBacktest(
      currentAssetHistory,
      {
        pivot: priceVal,
        sup1: gannVals.sup1,
        res1: gannVals.res1,
        sup2: gannVals.sup2,
        res2: gannVals.res2,
      },
      {
        strategy,
        sampleBars,
        riskRewardRatio,
        assetPrice: priceVal,
      }
    );
  }, [currentAssetHistory, priceVal, gannVals, strategy, sampleBars, riskRewardRatio]);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    calculateGann(false);
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  const filteredTrades = useMemo(() => {
    if (!backtestStats.trades) return [];
    if (filterOutcome === 'WIN') return backtestStats.trades.filter(t => t.outcome === 'Success');
    if (filterOutcome === 'LOSS') return backtestStats.trades.filter(t => t.outcome === 'Failed');
    return backtestStats.trades;
  }, [backtestStats.trades, filterOutcome]);

  const handleImportToJournal = (trade: BacktestTradeLog) => {
    const isWin = trade.outcome === 'Success';
    saveToJournal({
      entryType: 'TRADE',
      asset: assetName,
      tradeDirection: trade.type.includes('Buy') ? 'BUY' : 'SELL',
      entryPrice: trade.entryPrice,
      stopLoss: trade.stopLossPrice,
      takeProfit: trade.takeProfitPrice,
      lotSize: 0.1,
      pnlAmount: trade.profit,
      tradeStatus: isWin ? 'WIN' : 'LOSS',
      strategyTag: `Backtest: Gann ${strategy}`,
      psychologyRating: 'Disiplin',
      notes: `Hasil simulasi backtest Gann pada ${trade.date}. Hit: ${trade.levelHit}. P&L: ${trade.profit} pts (${trade.profitPct}%).`,
      price: trade.entryPrice,
    });

    setImportedTradeId(trade.id);
    setTimeout(() => setImportedTradeId(null), 2000);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-md p-6 sm:p-8 shadow-2xl backdrop-blur-sm max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Simulasi Backtest <span className="text-amber-400">Gann Algorithmic Engine</span>
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            Pengujian kuantitatif strategi S1/R1 Gann & rasio Risk:Reward pada riwayat pergerakan harga <strong className="text-amber-300 font-mono">{assetName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-md shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2 border border-amber-300/40"
          >
            {isSimulating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-slate-950" />
            )}
            <span>Mulai Simulasi Ulang</span>
          </button>
        </div>
      </div>

      {/* Interactive Simulation Parameters Toolbar */}
      <div className="bg-slate-950 p-4 rounded-md border border-slate-800 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-[11px] pb-2 border-b border-slate-800">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>PARAMETER SIMULASI STRATEGI BACKTEST</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Strategy Select */}
          <div>
            <label className="block text-slate-400 text-[10px] uppercase mb-1 font-semibold">Strategi Gann</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer font-mono"
            >
              <option value="REVERSION">Gann Reversion (Buy S1 / Sell R1)</option>
              <option value="BREAKOUT">Gann Breakout (Buy R1 / Sell S1)</option>
              <option value="CONFLUENCE">Gann 4D Matrix Confluence</option>
            </select>
          </div>

          {/* Sample Size Select */}
          <div>
            <label className="block text-slate-400 text-[10px] uppercase mb-1 font-semibold">Jumlah Sampel Bar</label>
            <select
              value={sampleBars}
              onChange={(e) => setSampleBars(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer font-mono"
            >
              <option value={50}>50 Bar Data</option>
              <option value={100}>100 Bar Data</option>
              <option value={200}>200 Bar Data</option>
            </select>
          </div>

          {/* Risk Reward Ratio */}
          <div>
            <label className="block text-slate-400 text-[10px] uppercase mb-1 font-semibold">Rasio Risk : Reward (R:R)</label>
            <select
              value={riskRewardRatio}
              onChange={(e) => setRiskRewardRatio(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-amber-500 cursor-pointer font-mono"
            >
              <option value={1.5}>1 : 1.5</option>
              <option value={2.0}>1 : 2.0 (Standar Gann)</option>
              <option value={3.0}>1 : 3.0 (Agresif)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono">
        <div className="bg-slate-950 p-4 rounded-md border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>Win Rate</span>
            <Award className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 tabular-nums">
            {backtestStats.winRate}%
          </div>
          <div className="text-[10px] text-slate-500">
            {backtestStats.winCount} Win / {backtestStats.lossCount} Loss
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-md border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>Total Sinyal</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {backtestStats.totalSignals}
          </div>
          <div className="text-[10px] text-slate-500">
            Eksekusi Teruji
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-md border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>Net Profit</span>
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className={`text-2xl font-black tabular-nums ${backtestStats.totalProfit >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
            {backtestStats.totalProfit >= 0 ? `+${backtestStats.totalProfit}` : backtestStats.totalProfit} pts
          </div>
          <div className="text-[10px] text-slate-500">
            Akumulasi P/L
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-md border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>Profit Factor</span>
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 tabular-nums">
            {backtestStats.profitFactor}
          </div>
          <div className="text-[10px] text-slate-500">
            Gross Win / Gross Loss
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-md border border-slate-800 space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase">
            <span>Max Drawdown</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 tabular-nums">
            -${backtestStats.maxDrawdown}
          </div>
          <div className="text-[10px] text-slate-500">
            Maks Penurunan Peak
          </div>
        </div>
      </div>

      {/* Trade Logs Table */}
      <div className="space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Riwayat Eksekusi Sinyal Simulasi ({filteredTrades.length})
          </span>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
            <button
              onClick={() => setFilterOutcome('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                filterOutcome === 'ALL' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({backtestStats.totalSignals})
            </button>
            <button
              onClick={() => setFilterOutcome('WIN')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                filterOutcome === 'WIN' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Win ({backtestStats.winCount})
            </button>
            <button
              onClick={() => setFilterOutcome('LOSS')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                filterOutcome === 'LOSS' ? 'bg-rose-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Loss ({backtestStats.lossCount})
            </button>
          </div>
        </div>

        <div className="bg-slate-950 rounded-md border border-slate-800 overflow-hidden text-xs">
          <div className="grid grid-cols-7 gap-2 p-3 bg-slate-900/80 font-bold text-slate-400 border-b border-slate-800 text-[11px]">
            <span>Bar Index</span>
            <span>Tipe Sinyal</span>
            <span>Entry ($)</span>
            <span>Exit ($)</span>
            <span>Target / SL Hit</span>
            <span className="text-center">Hasil (P/L)</span>
            <span className="text-right">Aksi Jurnal</span>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
            {filteredTrades.map((trade) => {
              const isWin = trade.outcome === 'Success';
              const isImported = importedTradeId === trade.id;

              return (
                <div key={trade.id} className="grid grid-cols-7 gap-2 p-3 items-center hover:bg-slate-900/50 transition-colors">
                  <span className="text-slate-400 text-[10px]">{trade.date}</span>
                  
                  <span className={`font-bold text-[11px] flex items-center gap-1 ${
                    trade.type.includes('Buy') ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {trade.type.includes('Buy') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{trade.type}</span>
                  </span>

                  <span className="text-slate-200 tabular-nums">${trade.entryPrice.toLocaleString()}</span>
                  <span className="text-slate-200 tabular-nums">${trade.exitPrice.toLocaleString()}</span>

                  <span className="text-slate-400 text-[10px] truncate" title={trade.levelHit}>
                    {trade.levelHit}
                  </span>

                  <div className="text-center flex items-center justify-center gap-1">
                    {isWin ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span className={`font-bold tabular-nums ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.profit >= 0 ? `+${trade.profit}` : trade.profit} pts
                    </span>
                  </div>

                  <div className="text-right">
                    <button
                      onClick={() => handleImportToJournal(trade)}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-end gap-1 ml-auto ${
                        isImported
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-white border-slate-700'
                      }`}
                      title="Simpan sinyal simulasi ini ke Executive Trading Journal"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>{isImported ? 'Tersimpan' : 'Ke Jurnal'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacktestTab;
