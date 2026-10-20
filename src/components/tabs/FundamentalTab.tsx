import React, { useState } from 'react';
import { 
  Building2, Calendar, TrendingUp, TrendingDown, AlertCircle, ShieldCheck, Zap, RefreshCw, FileText, ExternalLink, CheckCircle2, Layers, Clock 
} from 'lucide-react';
import { MarketState } from '../../hooks/useMarketState';
import { INITIAL_MACRO_EVENTS, MacroEventRecord, calculateEconomicSurprise } from '../../utils/fundamental';

interface FundamentalTabProps {
  state: MarketState;
}

export const FundamentalTab: React.FC<FundamentalTabProps> = ({ state }) => {
  const { livePrice } = state;
  const [events, setEvents] = useState<MacroEventRecord[]>(INITIAL_MACRO_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>(INITIAL_MACRO_EVENTS[0].event_id);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedEvent = events.find(e => e.event_id === selectedEventId) || events[0];
  const surpriseData = calculateEconomicSurprise(selectedEvent.actual_value, selectedEvent.consensus_value, selectedEvent.event_type);

  const filteredEvents = filterType === 'ALL' 
    ? events 
    : events.filter(e => e.event_type === filterType);

  const handleRunFundamentalAI = async (event: MacroEventRecord) => {
    setAiLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/fundamental/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: event.event_type,
          indicatorName: event.indicator_name,
          actual: event.range_label || event.actual_value,
          consensus: event.range_label || event.consensus_value,
          previous: event.previous_value,
          unit: event.unit,
          sourceRef: event.source_reference
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menganalisis fundamental.');
      setAiAnalysisResult(prev => ({ ...prev, [event.event_id]: data.analysis }));
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                QUANTITATIVE FUNDAMENTAL ANALYSIS ENGINE
              </span>
              <span className="px-2.5 py-1 bg-blue-500/15 text-blue-300 border border-blue-500/30 rounded-full text-[11px] font-mono flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Data historis referensi per April 2026 — belum ada rilis baru yang ditambahkan ke sistem.
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Analisis Makroekonomi & Kejutan Statistik
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pusat audit rilis data tier-1 AS (FOMC, NFP, CPI, PPI). Mencegah look-ahead bias dengan verifikasi konsensus pra-rilis, perhitungan <em>Economic Surprise Z-score</em>, dan penjelasan AI berbasis dokumen resmi BLS/Federal Reserve.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center shrink-0 space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Spot Gold (XAU/USD)</span>
            <div className="text-xl font-mono font-bold text-emerald-400">${livePrice.toLocaleString()}</div>
            <span className="text-[10px] text-amber-400 font-mono flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Macro Aligned
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Economic Calendar Events Table / List */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Kalender Rilis Tier-1</h3>
            </div>
            <div className="flex items-center gap-1">
              {['ALL', 'FOMC', 'NFP', 'CPI', 'PPI'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    filterType === t 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredEvents.map(ev => {
              const isSelected = ev.event_id === selectedEventId;
              const surprise = calculateEconomicSurprise(ev.actual_value, ev.consensus_value, ev.event_type);
              return (
                <button
                  key={ev.event_id}
                  onClick={() => setSelectedEventId(ev.event_id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected 
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10' 
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800 text-[10px] font-mono font-bold">
                      {ev.event_type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(ev.release_time_utc).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-white text-xs">{ev.indicator_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{ev.reporting_period}</div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px]">Aktual/Kons: </span>
                      <strong className="text-white">{ev.range_label || ev.actual_value}</strong> / <span className="text-slate-300">{ev.consensus_value}</span>
                    </div>
                    {ev.event_type === 'FOMC' ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                        In-Line
                      </span>
                    ) : surprise.zScore !== null && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        surprise.zScore > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        Z: {surprise.zScore > 0 ? `+${surprise.zScore}` : surprise.zScore}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Inspector & AI Grounding */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
            
            {/* Header Selected Event */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                    {selectedEvent.event_type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Status: <strong className="text-emerald-400">VERIFIED (per Apr 2026)</strong></span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">{selectedEvent.indicator_name}</h2>
                <p className="text-xs text-slate-400 font-mono">Periode: {selectedEvent.reporting_period}</p>
              </div>

              <div className="shrink-0">
                <a 
                  href={selectedEvent.source_reference} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sumber Resmi ({selectedEvent.source_name})</span>
                </a>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Nilai Aktual</span>
                <div className="text-lg font-bold text-emerald-400">{selectedEvent.range_label || selectedEvent.actual_value} <span className="text-xs text-slate-400">{selectedEvent.unit}</span></div>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Konsensus Pra-Rilis</span>
                <div className="text-lg font-bold text-amber-300">{selectedEvent.consensus_value} <span className="text-xs text-slate-400">{selectedEvent.unit}</span></div>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Periode Sebelumnya</span>
                <div className="text-lg font-bold text-white">{selectedEvent.previous_value} <span className="text-xs text-slate-400">{selectedEvent.unit}</span></div>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">{selectedEvent.event_type === 'FOMC' ? 'Penilaian Diskrit' : 'Economic Surprise (Z)'}</span>
                <div className="text-lg font-bold text-sky-400">
                  {selectedEvent.event_type === 'FOMC' ? 'In-Line' : (surpriseData.zScore !== null ? (surpriseData.zScore > 0 ? `+${surpriseData.zScore}` : surpriseData.zScore) : 'N/A')}
                </div>
              </div>
            </div>

            {/* AI Fundamental Analysis Section */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Analisis AI & Grounding Makro (XAU/USD)</h3>
                </div>
                <button
                  onClick={() => handleRunFundamentalAI(selectedEvent)}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-slate-950" />}
                  <span>{aiLoading ? 'Menganalisis...' : 'Jalankan Analisis AI'}</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 min-h-[140px]">
                {aiAnalysisResult[selectedEvent.event_id] || (
                  <span className="text-slate-500 italic font-mono">
                    Klik "Jalankan Analisis AI" di atas untuk meminta evaluasi kuantitatif fundamental dan implikasi dampaknya terhadap instrumen XAU/USD berdasarkan data rilis ini.
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
