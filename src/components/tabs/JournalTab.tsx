import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Trash2, Copy, Check, Clock, TrendingUp, TrendingDown, 
  PlusCircle, Download, Search, Filter, ShieldCheck, DollarSign, 
  BarChart2, Target, Award, X, PieChart, Scale, Activity,
  Zap, CheckCircle2, XCircle
} from 'lucide-react';
import { MarketState, JournalEntry } from '../../hooks/useMarketState';

interface JournalTabProps {
  state: MarketState;
}

export const JournalTab: React.FC<JournalTabProps> = ({ state }) => {
  const { 
    journalEntries, 
    deleteJournalEntry, 
    clearJournal, 
    saveToJournal, 
    assetName, 
    livePrice, 
    structuredReportText, 
    oracleAiReport, 
    oracleResult, 
    technicalMetrics,
    watchlist 
  } = state;

  // UI state
  const [tabMode, setTabMode] = useState<'ENTRIES' | 'SUMMARY'>('ENTRIES');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TRADE' | 'SNAPSHOT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WIN' | 'LOSS' | 'OPEN'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Trade Form state
  const [tradeAsset, setTradeAsset] = useState<string>(assetName);
  const [tradeDirection, setTradeDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [entryPrice, setEntryPrice] = useState<string>(livePrice.toString());
  const [stopLoss, setStopLoss] = useState<string>((livePrice * 0.992).toFixed(2));
  const [takeProfit, setTakeProfit] = useState<string>((livePrice * 1.015).toFixed(2));
  const [lotSize, setLotSize] = useState<string>('0.10');
  const [tradeStatus, setTradeStatus] = useState<'OPEN' | 'WIN' | 'LOSS'>('OPEN');
  const [pnlAmount, setPnlAmount] = useState<string>('0');
  const [strategyTag, setStrategyTag] = useState<string>('Gann Square of 9 + Confluence');
  const [psychologyRating, setPsychologyRating] = useState<'Disiplin' | 'FOMO' | 'Dendam' | 'Sabar' | 'Impulsif'>('Disiplin');
  const [notes, setNotes] = useState<string>('');

  // Performance & Summary Metrics Calculation
  const stats = useMemo(() => {
    const tradeEntries = journalEntries.filter(e => e.entryType === 'TRADE' || e.tradeStatus);
    const totalTrades = tradeEntries.length;
    const wins = tradeEntries.filter(e => e.tradeStatus === 'WIN');
    const losses = tradeEntries.filter(e => e.tradeStatus === 'LOSS');
    const opens = tradeEntries.filter(e => e.tradeStatus === 'OPEN');

    const closedTradesCount = wins.length + losses.length;
    
    // Win Rate %
    const winRatePct = closedTradesCount > 0 ? (wins.length / closedTradesCount) * 100 : 0;
    
    // Win/Loss Ratio
    const winLossRatioVal = losses.length > 0 ? wins.length / losses.length : wins.length > 0 ? wins.length : 0;
    const winLossRatioText = losses.length > 0 ? `${(wins.length / losses.length).toFixed(2)} : 1` : wins.length > 0 ? `${wins.length} : 0` : '0 : 0';

    // P&L Sums
    const totalPnl = tradeEntries.reduce((sum, e) => sum + (e.pnlAmount || 0), 0);
    const grossProfit = wins.reduce((sum, e) => sum + (e.pnlAmount || 0), 0);
    const grossLoss = Math.abs(losses.reduce((sum, e) => sum + (e.pnlAmount || 0), 0));
    
    // Averages
    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
    const avgPnlPerTrade = closedTradesCount > 0 ? totalPnl / closedTradesCount : 0;
    
    // Average Risk:Reward Ratio (Avg Win / Avg Loss)
    const avgRR = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? avgWin : 0;
    
    // Expectancy = (WinRate% * AvgWin) - (LossRate% * AvgLoss)
    const winRateFraction = closedTradesCount > 0 ? wins.length / closedTradesCount : 0;
    const lossRateFraction = closedTradesCount > 0 ? losses.length / closedTradesCount : 0;
    const expectancy = (winRateFraction * avgWin) - (lossRateFraction * avgLoss);

    // Profit Factor
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;

    // Best & Worst Trade
    const pnlList = tradeEntries.map(e => e.pnlAmount || 0);
    const bestTrade = pnlList.length > 0 ? Math.max(...pnlList) : 0;
    const worstTrade = pnlList.length > 0 ? Math.min(...pnlList) : 0;

    // Strategy Performance Breakdown
    const strategyMap: Record<string, { total: number; wins: number; losses: number; pnl: number }> = {};
    tradeEntries.forEach(e => {
      const tag = e.strategyTag || 'Umum / Unspecified';
      if (!strategyMap[tag]) {
        strategyMap[tag] = { total: 0, wins: 0, losses: 0, pnl: 0 };
      }
      strategyMap[tag].total += 1;
      if (e.tradeStatus === 'WIN') strategyMap[tag].wins += 1;
      if (e.tradeStatus === 'LOSS') strategyMap[tag].losses += 1;
      strategyMap[tag].pnl += (e.pnlAmount || 0);
    });

    const strategyList = Object.entries(strategyMap).map(([tag, data]) => {
      const closed = data.wins + data.losses;
      const rate = closed > 0 ? Math.round((data.wins / closed) * 100) : 0;
      return { tag, ...data, winRate: rate };
    }).sort((a, b) => b.pnl - a.pnl);

    return {
      totalTrades,
      winCount: wins.length,
      lossCount: losses.length,
      openCount: opens.length,
      closedTradesCount,
      winRatePct: Math.round(winRatePct * 10) / 10,
      winLossRatioVal: Math.round(winLossRatioVal * 100) / 100,
      winLossRatioText,
      totalPnl: Math.round(totalPnl * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossLoss: Math.round(grossLoss * 100) / 100,
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      avgPnlPerTrade: Math.round(avgPnlPerTrade * 100) / 100,
      avgRR: Math.round(avgRR * 100) / 100,
      expectancy: Math.round(expectancy * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      bestTrade: Math.round(bestTrade * 100) / 100,
      worstTrade: Math.round(worstTrade * 100) / 100,
      strategyList,
    };
  }, [journalEntries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return journalEntries.filter(entry => {
      if (activeFilter === 'TRADE' && entry.entryType !== 'TRADE' && !entry.tradeStatus) {
        return false;
      }
      if (activeFilter === 'SNAPSHOT' && entry.entryType === 'TRADE') {
        return false;
      }

      if (statusFilter !== 'ALL' && entry.tradeStatus !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAsset = entry.asset.toLowerCase().includes(q);
        const matchStrategy = (entry.strategyTag || '').toLowerCase().includes(q);
        const matchNotes = (entry.notes || '').toLowerCase().includes(q);
        const matchReport = (entry.oracleReport || '').toLowerCase().includes(q);
        if (!matchAsset && !matchStrategy && !matchNotes && !matchReport) {
          return false;
        }
      }

      return true;
    });
  }, [journalEntries, activeFilter, statusFilter, searchQuery]);

  const handleCopyReport = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTakeNewSnapshot = () => {
    saveToJournal({
      entryType: 'SNAPSHOT',
      asset: assetName,
      oracleReport: oracleAiReport || structuredReportText,
      price: livePrice,
      confluenceScore: technicalMetrics.compositeScore,
      decision: oracleResult.decision,
    });
  };

  const handleCreateTradeEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const entryP = parseFloat(entryPrice) || livePrice;
    const slP = parseFloat(stopLoss) || entryP * 0.99;
    const tpP = parseFloat(takeProfit) || entryP * 1.02;
    const lot = parseFloat(lotSize) || 0.1;
    const pnl = parseFloat(pnlAmount) || 0;

    saveToJournal({
      entryType: 'TRADE',
      asset: tradeAsset,
      tradeDirection,
      entryPrice: entryP,
      stopLoss: slP,
      takeProfit: tpP,
      lotSize: lot,
      pnlAmount: pnl,
      tradeStatus,
      strategyTag,
      psychologyRating,
      notes: notes.trim() || 'Posisi trading dicatat manual ke jurnal.',
      price: entryP,
      oracleReport: `**Transaksi Manual**: ${tradeDirection} ${tradeAsset} @ $${entryP.toLocaleString()}\n- Stop Loss: $${slP.toLocaleString()}\n- Take Profit: $${tpP.toLocaleString()}\n- Lot Size: ${lot}\n- Strategy: ${strategyTag}\n- Psikologi: ${psychologyRating}\n- Catatan: ${notes || 'N/A'}`,
    });

    setShowAddModal(false);
    setNotes('');
    setPnlAmount('0');
  };

  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const handleExportJournalJSON = () => {
    if (journalEntries.length === 0) {
      alert('Tidak ada catatan jurnal untuk diekspor.');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(journalEntries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gann_journal_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccessMsg('File backup JSON berhasil diunduh!');
    setTimeout(() => setExportSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Export Toast Notification */}
      {exportSuccessMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 p-3 rounded-md text-xs font-mono flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{exportSuccessMsg}</span>
          </div>
          <button onClick={() => setExportSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-md p-6 sm:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-xs font-mono font-bold">
                EXECUTIVE TRADING JOURNAL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Jurnal & Rekap <span className="text-amber-400">Transaksi Trading 4D</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pusat pencatatan transaksi trading, evaluasi P&L, manajemen risiko, serta pengarsipan snapshot analisis 4D Oracle terintegrasi local storage.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2 border border-emerald-300/40"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Transaksi Baru</span>
            </button>

            <button
              onClick={handleTakeNewSnapshot}
              className="px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Simpan snapshot analisis 4D Oracle saat ini"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Snapshot Pasar</span>
            </button>

            <button
              onClick={handleExportJournalJSON}
              disabled={journalEntries.length === 0}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                journalEntries.length > 0
                  ? 'bg-slate-950 hover:bg-slate-800 text-sky-300 hover:text-sky-200 border-slate-800 hover:border-slate-700 cursor-pointer shadow-sm'
                  : 'bg-slate-950/50 text-slate-600 border-slate-800/50 cursor-not-allowed'
              }`}
              title="Ekspor seluruh catatan jurnal ke file JSON untuk backup lokal"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON Backup</span>
            </button>

            {journalEntries.length > 0 && (
              <button
                onClick={clearJournal}
                className="p-2.5 bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/40 rounded-xl transition-colors cursor-pointer"
                title="Bersihkan seluruh jurnal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View Mode Switcher Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setTabMode('ENTRIES')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
            tabMode === 'ENTRIES'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Daftar Jurnal & Transaksi ({journalEntries.length})</span>
        </button>

        <button
          onClick={() => setTabMode('SUMMARY')}
          className={`px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
            tabMode === 'SUMMARY'
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-md'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Summary & Rapor Performa (Analytics View)</span>
        </button>
      </div>

      {/* View Mode 1: Summary Analytics View */}
      {tabMode === 'SUMMARY' && (
        <div className="space-y-6">
          {/* Summary Hero Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Win/Loss Ratio */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-md p-5 shadow-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span className="uppercase tracking-wider">Rasio Win / Loss</span>
                <Scale className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-400 tabular-nums">
                {stats.winLossRatioText}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {stats.winCount} Win vs {stats.lossCount} Loss ({stats.closedTradesCount} Tutup)
              </div>
            </div>

            {/* Card 2: Win Rate */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-md p-5 shadow-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span className="uppercase tracking-wider">Win Rate Persentase</span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
                {stats.winRatePct}%
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Profit Factor: <strong className="text-white">{stats.profitFactor}</strong>
              </div>
            </div>

            {/* Card 3: Net Realized P&L */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-md p-5 shadow-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span className="uppercase tracking-wider">Total Net Realized P&L</span>
                <DollarSign className="w-4 h-4 text-sky-400" />
              </div>
              <div className={`text-2xl font-black font-mono tabular-nums ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stats.totalPnl >= 0 ? `+$${stats.totalPnl.toLocaleString()}` : `-$${Math.abs(stats.totalPnl).toLocaleString()}`}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Rata-rata / Trade: <strong className={stats.avgPnlPerTrade >= 0 ? 'text-emerald-300' : 'text-rose-300'}>${stats.avgPnlPerTrade}</strong>
              </div>
            </div>

            {/* Card 4: Expectancy */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-md p-5 shadow-xl space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span className="uppercase tracking-wider">Ekspektasi Per Trade</span>
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <div className={`text-2xl font-black font-mono tabular-nums ${stats.expectancy >= 0 ? 'text-purple-300' : 'text-rose-400'}`}>
                {stats.expectancy >= 0 ? `+$${stats.expectancy.toLocaleString()}` : `-$${Math.abs(stats.expectancy).toLocaleString()}`}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Rasio R:R Rata-Rata: <strong className="text-cyan-300">1 : {stats.avgRR}</strong>
              </div>
            </div>
          </div>

          {/* Average Performance Detailed Grid */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-md p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Rincian Performa Rata-Rata & Statistik Risiko
                </h3>
                <p className="text-xs text-slate-400">Matriks komprehensif evaluasi transaksi historis</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-4 rounded-md border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Rata-Rata Profit (Avg Win)</span>
                <div className="text-lg font-bold text-emerald-400 tabular-nums">+$${stats.avgWin.toLocaleString()}</div>
                <span className="text-[10px] text-slate-500 block">Gross Profit: ${stats.grossProfit}</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-md border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Rata-Rata Loss (Avg Loss)</span>
                <div className="text-lg font-bold text-rose-400 tabular-nums">-$${stats.avgLoss.toLocaleString()}</div>
                <span className="text-[10px] text-slate-500 block">Gross Loss: ${stats.grossLoss}</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-md border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Trade Terbaik (Best Trade)</span>
                <div className="text-lg font-bold text-emerald-300 tabular-nums">+$${stats.bestTrade.toLocaleString()}</div>
                <span className="text-[10px] text-slate-500 block">Maksimum Profit Posisi Tunggal</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-md border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase">Trade Terburuk (Worst Trade)</span>
                <div className="text-lg font-bold text-rose-300 tabular-nums">-$${Math.abs(stats.worstTrade).toLocaleString()}</div>
                <span className="text-[10px] text-slate-500 block">Maksimum Kerugian Posisi Tunggal</span>
              </div>
            </div>

            {/* Win vs Loss Proportion Visual Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Distribusi Proporsi Win vs Loss</span>
                <span>{stats.winCount} Win ({stats.winRatePct}%) · {stats.lossCount} Loss ({stats.closedTradesCount > 0 ? Math.round((stats.lossCount / stats.closedTradesCount) * 100) : 0}%)</span>
              </div>

              <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
                <div
                  style={{ width: `${stats.winRatePct}%` }}
                  className="bg-emerald-500 h-full rounded-l-full transition-all duration-500 flex items-center justify-center text-[9px] font-mono font-bold text-slate-950 overflow-hidden"
                >
                  {stats.winRatePct > 10 ? `${stats.winRatePct}%` : ''}
                </div>
                <div
                  style={{ width: `${100 - stats.winRatePct}%` }}
                  className="bg-rose-500 h-full rounded-r-full transition-all duration-500 flex items-center justify-center text-[9px] font-mono font-bold text-slate-950 overflow-hidden"
                >
                  {(100 - stats.winRatePct) > 10 ? `${Math.round(100 - stats.winRatePct)}%` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Strategy / Setup Tag Performance Ranking Table */}
          {stats.strategyList.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    Performa Per Strategi & Formulasi Setup
                  </h3>
                  <p className="text-xs text-slate-400">Peringkat keberhasilan berdasarkan kategori setup</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                      <th className="py-3 px-4">Nama Strategi / Setup</th>
                      <th className="py-3 px-4 text-center">Total Trade</th>
                      <th className="py-3 px-4 text-center">Win / Loss</th>
                      <th className="py-3 px-4 text-center">Win Rate</th>
                      <th className="py-3 px-4 text-right">Net P&L ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stats.strategyList.map((item) => (
                      <tr key={item.tag} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                            {item.tag}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-300">{item.total}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-emerald-400 font-bold">{item.wins}W</span> / <span className="text-rose-400 font-bold">{item.losses}L</span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-amber-300">
                          {item.winRate}%
                        </td>
                        <td className={`py-3 px-4 text-right font-bold tabular-nums ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.pnl >= 0 ? `+$${item.pnl.toLocaleString()}` : `-$${Math.abs(item.pnl).toLocaleString()}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Mode 2: Entries List View */}
      {tabMode === 'ENTRIES' && (
        <div className="space-y-6">
          {/* Quick Performance Analytics Overview Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 shadow-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Total Net P&L</span>
                <div className={`text-xl font-black font-mono tabular-nums ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stats.totalPnl >= 0 ? `+$${stats.totalPnl.toLocaleString()}` : `-$${Math.abs(stats.totalPnl).toLocaleString()}`}
                </div>
                <span className="text-[10px] text-slate-500 block font-mono">Gross Profit: ${stats.grossProfit}</span>
              </div>
              <div className={`p-3 rounded-xl border ${stats.totalPnl >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 shadow-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Win / Loss Ratio</span>
                <div className="text-xl font-black font-mono text-amber-400 tabular-nums">
                  {stats.winLossRatioText}
                </div>
                <span className="text-[10px] text-slate-500 block font-mono">Win Rate: {stats.winRatePct}%</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Scale className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 shadow-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Total Posisi</span>
                <div className="text-xl font-black font-mono text-white tabular-nums">
                  {stats.totalTrades}
                </div>
                <span className="text-[10px] text-slate-500 block font-mono">{stats.openCount} Posisi Aktif</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <BarChart2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 shadow-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Profit Factor</span>
                <div className="text-xl font-black font-mono text-cyan-400 tabular-nums">
                  {stats.profitFactor}
                </div>
                <span className="text-[10px] text-slate-500 block font-mono">R:R Avg: 1 : {stats.avgRR}</span>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Target className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter and Search Toolbar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeFilter === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua ({journalEntries.length})
              </button>
              <button
                onClick={() => setActiveFilter('TRADE')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeFilter === 'TRADE' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Transaksi Trading ({stats.totalTrades})
              </button>
              <button
                onClick={() => setActiveFilter('SNAPSHOT')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeFilter === 'SNAPSHOT' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Snapshot Pasar ({journalEntries.length - stats.totalTrades})
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-transparent text-white focus:outline-none cursor-pointer font-mono text-xs"
                >
                  <option value="ALL" className="bg-slate-950 text-white">Semua Status</option>
                  <option value="WIN" className="bg-slate-950 text-emerald-400">WIN (Profit)</option>
                  <option value="LOSS" className="bg-slate-950 text-rose-400">LOSS (Rugi)</option>
                  <option value="OPEN" className="bg-slate-950 text-amber-400">OPEN (Aktif)</option>
                </select>
              </div>

              {/* Search Box */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari aset, strategi, catatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Entry List */}
          {filteredEntries.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-md p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-md bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Tidak Ada Entry Tersimpan</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Klik tombol &quot;Catat Transaksi Baru&quot; atau &quot;Snapshot Pasar&quot; untuk mulai mencatat riwayat trading Anda.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => {
                const isTrade = entry.entryType === 'TRADE' || entry.tradeDirection !== undefined;
                const isCopied = copiedId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-md p-5 shadow-xl space-y-3 hover:border-slate-700 transition-all relative overflow-hidden"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${
                          isTrade ? 'bg-purple-500/15 border-purple-500/30 text-purple-300' : 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                        }`}>
                          {isTrade ? 'TRANSAKSI TRADING' : 'SNAPSHOT PASAR'}
                        </span>

                        <span className="font-bold text-white text-sm">{entry.asset}</span>

                        {/* Trade Direction Badge */}
                        {isTrade && entry.tradeDirection && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${
                            entry.tradeDirection === 'BUY'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}>
                            {entry.tradeDirection === 'BUY' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{entry.tradeDirection}</span>
                          </span>
                        )}

                        {/* Trade Status Badge */}
                        {isTrade && entry.tradeStatus && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            entry.tradeStatus === 'WIN'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : entry.tradeStatus === 'LOSS'
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {entry.tradeStatus}
                          </span>
                        )}

                        {/* P&L Display */}
                        {isTrade && entry.pnlAmount !== undefined && (
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 tabular-nums ${
                            entry.pnlAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            P&L: {entry.pnlAmount >= 0 ? `+$${entry.pnlAmount}` : `-$${Math.abs(entry.pnlAmount)}`}
                          </span>
                        )}

                        <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{entry.timestamp}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {entry.oracleReport && (
                          <button
                            onClick={() => handleCopyReport(entry.id, entry.oracleReport || '')}
                            className="px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium text-[11px] flex items-center gap-1 border border-slate-800 transition-all cursor-pointer"
                            title="Salin rincian"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteJournalEntry(entry.id)}
                          className="p-1 rounded-md hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Hapus entry ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Trade Specific Metadata Grid */}
                    {isTrade && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3 rounded-md border border-slate-800 text-xs font-mono">
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">Harga Entry</span>
                          <span className="text-white font-bold tabular-nums">${entry.entryPrice?.toLocaleString() || entry.price.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">Stop Loss (SL)</span>
                          <span className="text-rose-400 font-bold tabular-nums">${entry.stopLoss?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">Take Profit (TP)</span>
                          <span className="text-emerald-400 font-bold tabular-nums">${entry.takeProfit?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase block">Lot / Evaluasi</span>
                          <span className="text-amber-300 font-bold">{entry.lotSize || 0.10} Lot · <span className="text-slate-300">{entry.psychologyRating || 'Disiplin'}</span></span>
                        </div>
                      </div>
                    )}

                    {/* Strategy Tag & Notes */}
                    {entry.strategyTag && (
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-slate-500">Strategi/Setup:</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                          {entry.strategyTag}
                        </span>
                      </div>
                    )}

                    {/* Notes or Full Oracle Report */}
                    <div className="text-xs text-slate-300 font-mono bg-slate-950/60 p-3.5 rounded-md border border-slate-800/80 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {entry.notes || entry.oracleReport}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Form: Catat Transaksi Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-md max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <PlusCircle className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-white">Catat Transaksi Trading Baru</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTradeEntry} className="space-y-4 text-xs">
              {/* Asset & Direction Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Instrumen / Aset</label>
                  <select
                    value={tradeAsset}
                    onChange={(e) => setTradeAsset(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    {watchlist.map(w => (
                      <option key={w.symbol} value={`${w.symbol} (${w.name})`}>
                        {w.symbol} - ${w.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Arah Posisi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTradeDirection('BUY')}
                      className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border cursor-pointer ${
                        tradeDirection === 'BUY'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>BUY (LONG)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeDirection('SELL')}
                      className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border cursor-pointer ${
                        tradeDirection === 'SELL'
                          ? 'bg-rose-500 text-slate-950 border-rose-400 font-black shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>SELL (SHORT)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Price, SL, TP, Lot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-sans font-semibold">Harga Entry ($)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-sans font-semibold">Stop Loss ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-rose-300 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-sans font-semibold">Take Profit ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-emerald-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1 font-sans font-semibold">Lot Size</label>
                  <input
                    type="number"
                    step="0.01"
                    value={lotSize}
                    onChange={(e) => setLotSize(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Status & PnL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Status Transaksi</label>
                  <select
                    value={tradeStatus}
                    onChange={(e) => setTradeStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="OPEN">OPEN (Posisi Masih Berjalan)</option>
                    <option value="WIN">WIN (Profit Target Disentuh)</option>
                    <option value="LOSS">LOSS (Stop Loss Disentuh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Net Realized P&L ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={pnlAmount}
                    onChange={(e) => setPnlAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="Contoh: +150 atau -45"
                  />
                </div>
              </div>

              {/* Strategy & Psychology */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Strategi / Setup Formulasi</label>
                  <input
                    type="text"
                    value={strategyTag}
                    onChange={(e) => setStrategyTag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="Contoh: Gann Square of 9 + Lunar Window"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Evaluasi Psikologi Trading</label>
                  <select
                    value={psychologyRating}
                    onChange={(e) => setPsychologyRating(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="Disiplin">Disiplin (Sesuai Trading Plan)</option>
                    <option value="Sabar">Sabar (Menunggu Konfirmasi 4D)</option>
                    <option value="FOMO">FOMO (Terburu-buru Masuk Pasar)</option>
                    <option value="Impulsif">Impulsif (Tanpa Manajemen Risiko)</option>
                    <option value="Dendam">Dendam (Revenge Trade)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Catatan Evaluasi / Alasan Entry</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tuliskan catatan teknikal, alasan entry, atau pembelajaran dari trade ini..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-lg shadow-md cursor-pointer transition-all"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalTab;
