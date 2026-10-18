import React, { useState } from 'react';
import { BookOpen, Trash2, Copy, Check, Clock, TrendingUp, AlertCircle, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { MarketState, JournalEntry } from '../../hooks/useMarketState';

interface JournalTabProps {
  state: MarketState;
}

export const JournalTab: React.FC<JournalTabProps> = ({ state }) => {
  const { journalEntries, deleteJournalEntry, clearJournal, saveToJournal, assetName, livePrice, structuredReportText, oracleAiReport, oracleResult, technicalMetrics } = state;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyReport = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTakeNewSnapshot = () => {
    saveToJournal({
      asset: assetName,
      oracleReport: oracleAiReport || structuredReportText,
      price: livePrice,
      confluenceScore: technicalMetrics.compositeScore,
      decision: oracleResult.decision,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Jurnal Snapshot Pasar 4D
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Arsip snapshot kondisi pasar, konfluensi indikator, dan hasil evaluasi 4D Oracle yang tersimpan aman di local storage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTakeNewSnapshot}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Simpan Snapshot Saat Ini</span>
            </button>
            {journalEntries.length > 0 && (
              <button
                onClick={clearJournal}
                className="px-3 py-2.5 bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/40 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
                title="Hapus semua snapshot"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Snapshot List */}
      {journalEntries.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Belum Ada Snapshot Tersimpan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Klik tombol &quot;Simpan Snapshot Saat Ini&quot; atau tombol &quot;Simpan Snapshot ke Journal&quot; di tab 4D Architect untuk merekam analisis teknikal dan konfluensi saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
            <span>Menampilkan {journalEntries.length} snapshot tersimpan</span>
            <span>Tersimpan di LocalStorage</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {journalEntries.map((entry) => {
              const isCopied = copiedId === entry.id;
              const decisionColor = 
                entry.decision === 'EXECUTE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                entry.decision === 'IGNORE' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' :
                'text-amber-400 bg-amber-500/10 border-amber-500/30';

              return (
                <div
                  key={entry.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{entry.timestamp}</span>
                      </div>
                      <span className="font-bold text-white text-sm">{entry.asset}</span>
                      <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        ${entry.price.toLocaleString()}
                      </span>
                      {entry.decision && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${decisionColor}`}>
                          {entry.decision}
                        </span>
                      )}
                      {entry.confluenceScore !== undefined && (
                        <span className="text-[10px] font-mono text-slate-400">
                          Skor: <strong className="text-white">{entry.confluenceScore}%</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyReport(entry.id, entry.oracleReport)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1 transition-all cursor-pointer"
                        title="Salin isi report"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                      </button>
                      <button
                        onClick={() => deleteJournalEntry(entry.id)}
                        className="p-1 rounded-lg hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Hapus snapshot ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 font-mono bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {entry.oracleReport}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
