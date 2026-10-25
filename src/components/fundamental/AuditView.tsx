import React from 'react';
import { FileText, ShieldCheck, Sparkles, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { MacroEventRecord } from '../../utils/fundamental';

interface AuditViewProps {
  events: MacroEventRecord[];
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  aiLoading: boolean;
  aiAnalysisResult: Record<string, string>;
  errorMsg: string | null;
  handleRunFundamentalAI: (event: MacroEventRecord) => void;
  openAuditOverlay: (ev: MacroEventRecord) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({
  events,
  selectedEventId,
  setSelectedEventId,
  aiLoading,
  aiAnalysisResult,
  errorMsg,
  handleRunFundamentalAI,
  openAuditOverlay,
}) => {
  const currentSelectedEvent = events.find(e => e.event_id === selectedEventId) || events[0];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-md p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-blue-500/15 text-blue-300 border border-blue-500/30 rounded-md text-xs font-mono font-bold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              AI GROUNDING & FUNDAMENTAL ASSESSMENT
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md text-[11px] font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Primary Source Grounding
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Analisis Narasi AI & Grounding Makro
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Evaluasi dampak fundamental dan transmisi kejutan makroekonomi ke komoditas emas (XAU/USD) menggunakan Google Gemini AI dengan pencegahan klaim probabilitas numerik fiktif.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/50 rounded-md text-xs text-rose-300 font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Event Selector List */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 space-y-3 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Pilih Rilis Indikator</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {events.map(ev => (
              <button
                key={ev.event_id}
                onClick={() => setSelectedEventId(ev.event_id)}
                className={`w-full text-left p-3 rounded-md border transition-all cursor-pointer space-y-1 ${
                  selectedEventId === ev.event_id
                    ? 'bg-amber-500/15 border-amber-500/50 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-amber-400 font-bold">{ev.event_type}</span>
                  <span className="text-slate-500">{ev.reporting_period}</span>
                </div>
                <div className="text-xs font-bold text-white font-sans truncate">{ev.indicator_name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Selected Event Deep Dive & AI Analysis */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-md p-6 space-y-6 shadow-xl">
          {currentSelectedEvent && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 text-amber-300 border border-slate-800 font-bold">
                      {currentSelectedEvent.event_type}
                    </span>
                    <span className="text-slate-400">{currentSelectedEvent.reporting_period}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{currentSelectedEvent.indicator_name}</h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openAuditOverlay(currentSelectedEvent)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-xs font-mono font-bold border border-slate-700 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Audit Bitemporal</span>
                  </button>
                  <button
                    onClick={() => handleRunFundamentalAI(currentSelectedEvent)}
                    disabled={aiLoading}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md text-xs font-mono font-bold transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{aiLoading ? 'Menganalisis...' : 'Analisis Gemini AI'}</span>
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="bg-slate-950 p-3 rounded-md border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px]">Previous</span>
                  <div className="text-sm font-bold text-slate-200 tabular-nums">
                    {currentSelectedEvent.previous_value !== null ? `${currentSelectedEvent.previous_value}${currentSelectedEvent.unit}` : 'N/A'}
                  </div>
                </div>
                <div className="bg-sky-950/20 p-3 rounded-md border border-sky-500/30 space-y-1">
                  <span className="text-sky-300 text-[10px]">Forecast (Konsensus)</span>
                  <div className="text-sm font-bold text-sky-400 tabular-nums">
                    {currentSelectedEvent.consensus_value !== null ? `${currentSelectedEvent.consensus_value}${currentSelectedEvent.unit}` : 'N/A'}
                  </div>
                </div>
                <div className="bg-emerald-950/20 p-3 rounded-md border border-emerald-500/30 space-y-1">
                  <span className="text-emerald-400 text-[10px]">Actual (Resmi)</span>
                  <div className="text-sm font-extrabold text-emerald-400 tabular-nums">
                    {currentSelectedEvent.actual_value !== null ? `${currentSelectedEvent.actual_value}${currentSelectedEvent.unit}` : 'Pending (-)'}
                  </div>
                </div>
              </div>

              {/* AI Analysis Result Display */}
              <div className="bg-slate-950 p-5 rounded-md border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Hasil Analisis Narasi & Grounding AI</span>
                </div>
                <div className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                  {aiAnalysisResult[currentSelectedEvent.event_id] || (
                    <span className="text-slate-500 italic font-mono">
                      Belum ada analisis AI untuk rilis ini. Klik tombol &quot;Analisis Gemini AI&quot; di atas untuk menghasilkan narasi kualitatif dan transmisi dampak XAU/USD.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
