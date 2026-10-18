import React from 'react';
import { History, AlertCircle, TrendingUp, TrendingDown, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { MarketState } from '../../hooks/useMarketState';

interface BacktestTabProps {
  state: MarketState;
}

export const BacktestTab: React.FC<BacktestTabProps> = ({ state }) => {
  const { backtestStats, assetName, currentAssetHistory, result, calculateGann } = state;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Backtest Real-Time Sinyal W.D. Gann
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulasi eksekusi otomatis level S1 (Buy) & R1 (Sell) terhadap riwayat pergerakan harga riil ({assetName}).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            Buffer: <strong className="text-amber-400">{currentAssetHistory.length}</strong> titik data
          </span>
          <button
            onClick={() => calculateGann(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Refresh Kalkulasi"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!backtestStats.hasEnoughData ? (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto animate-pulse">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-amber-300">Data Historis Belum Cukup</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            {backtestStats.message || 'Sistem sedang mengakumulasi buffer data time-series real-time (minimal 20 titik data). Simulasi sinyal akan muncul otomatis saat harga menyentuh level support S1 atau resisten R1 Gann.'}
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span>Terkumpul: {currentAssetHistory.length} / 20 titik</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Win Rate</div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                {backtestStats.winRate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Rasio Sukses Sinyal</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Total Sinyal</div>
              <div className="text-2xl font-black font-mono text-white mt-1">
                {backtestStats.totalSignals}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sinyal Terverifikasi</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Total Profit</div>
              <div className={`text-2xl font-black font-mono mt-1 ${backtestStats.totalProfit >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                {backtestStats.totalProfit >= 0 ? `+${backtestStats.totalProfit}` : backtestStats.totalProfit} pts
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Akumulasi P/L Riil</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Best Trade</div>
              <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
                +{backtestStats.bestTrade} pts
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Keuntungan Terbesar</div>
            </div>
          </div>

          {/* Trade Logs List */}
          {backtestStats.trades && backtestStats.trades.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
                <span>Riwayat Eksekusi Sinyal Simulasi</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {backtestStats.trades.length} Transaksi Terbaca
                </span>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
                <div className="grid grid-cols-6 gap-2 p-3 bg-slate-900/60 font-semibold text-slate-400 border-b border-slate-800 text-[11px]">
                  <span>Titik</span>
                  <span>Tipe Sinyal</span>
                  <span>Entry</span>
                  <span>Exit</span>
                  <span>Target / SL Hit</span>
                  <span className="text-right">Hasil (P/L)</span>
                </div>

                <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto font-mono">
                  {backtestStats.trades.map((trade) => {
                    const isWin = trade.outcome === 'Success';
                    return (
                      <div key={trade.id} className="grid grid-cols-6 gap-2 p-3 items-center hover:bg-slate-900/40 transition-colors">
                        <span className="text-slate-400 text-[10px]">{trade.date}</span>
                        <span className={`font-semibold text-[11px] ${trade.type.includes('Buy') ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {trade.type}
                        </span>
                        <span className="text-slate-300">{trade.entryPrice.toLocaleString()}</span>
                        <span className="text-slate-300">{trade.exitPrice.toLocaleString()}</span>
                        <span className="text-slate-400 text-[10px] truncate" title={trade.levelHit}>
                          {trade.levelHit}
                        </span>
                        <div className="text-right flex items-center justify-end gap-1.5">
                          {isWin ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span className={`font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {trade.profit >= 0 ? `+${trade.profit}` : trade.profit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
