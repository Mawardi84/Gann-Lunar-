import React, { useState, useEffect } from 'react';
import { 
  Building2, Calendar, TrendingUp, TrendingDown, AlertCircle, ShieldCheck, Zap, RefreshCw, FileText, 
  ExternalLink, CheckCircle2, Layers, Clock, Plus, Edit3, RotateCcw, X, Info
} from 'lucide-react';
import { MarketState } from '../../hooks/useMarketState';
import { INITIAL_MACRO_EVENTS, MacroEventRecord, calculateEconomicSurprise } from '../../utils/fundamental';
import { EconomicCalendarTab } from './EconomicCalendarTab';

interface FundamentalTabProps {
  state: MarketState;
}

interface FormMacroEvent {
  event_id?: string;
  event_type: 'FOMC' | 'NFP' | 'CPI' | 'PPI';
  indicator_code?: string;
  indicator_name: string;
  reporting_period: string;
  actual_value: string | number | null;
  consensus_value: string | number | null;
  previous_value: string | number | null;
  revised_previous: string | number | null;
  unit: string;
  release_time_utc: string;
  source_name: string;
  source_reference: string;
  data_status: 'VERIFIED' | 'ESTIMATED' | 'DISPUTED' | 'INSUFFICIENT_DATA';
  revision_version: number;
  range_label?: string;
}

export const FundamentalTab: React.FC<FundamentalTabProps> = ({ state }) => {
  const { livePrice } = state;
  const [events, setEvents] = useState<MacroEventRecord[]>(() => {
    try {
      const saved = localStorage.getItem('gann_macro_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_MACRO_EVENTS;
  });

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.event_id || INITIAL_MACRO_EVENTS[0].event_id);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [subView, setSubView] = useState<'calendar' | 'audit'>('calendar');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State for Adding/Editing Events
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formEvent, setFormEvent] = useState<FormMacroEvent>({
    event_type: 'NFP',
    indicator_code: 'NFP_CHANGE',
    indicator_name: 'Non-Farm Payrolls Employment Change',
    reporting_period: 'October 2026',
    actual_value: null,
    consensus_value: null,
    previous_value: null,
    revised_previous: null,
    unit: 'K (Thousands)',
    release_time_utc: new Date().toISOString(),
    source_name: 'U.S. Bureau of Labor Statistics (BLS)',
    source_reference: 'https://www.bls.gov/',
    data_status: 'VERIFIED',
    revision_version: 1,
    range_label: '',
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gann_macro_events', JSON.stringify(events));
    } catch (e) {
      console.warn('Failed to save macro events to localStorage:', e);
    }
  }, [events]);

  const selectedEvent = events.find(e => e.event_id === selectedEventId) || events[0] || INITIAL_MACRO_EVENTS[0];
  const surpriseData = calculateEconomicSurprise(selectedEvent.actual_value, selectedEvent.consensus_value, selectedEvent.event_type);

  const filteredEvents = filterType === 'ALL' 
    ? events 
    : events.filter(e => e.event_type === filterType);

  // Calculate latest release date for reference badge
  const latestEventDate = events.length > 0 
    ? new Date(Math.max(...events.map(e => new Date(e.release_time_utc).getTime())))
    : new Date();
  
  const latestDateLabel = latestEventDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

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
      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server tidak mengembalikan format JSON yang valid (${res.status}). Silakan coba lagi.`);
      }
      if (!res.ok || !data) {
        throw new Error(data?.error || `Gagal menganalisis fundamental (HTTP ${res.status}).`);
      }
      setAiAnalysisResult(prev => ({ ...prev, [event.event_id]: data.analysis }));
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setAiLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormEvent({
      event_id: `macro-${Date.now()}`,
      event_type: 'NFP',
      indicator_code: 'NFP_CHANGE',
      indicator_name: 'Non-Farm Payrolls Employment Change',
      reporting_period: 'October 2026',
      actual_value: 150,
      consensus_value: 145,
      previous_value: 142,
      revised_previous: 142,
      unit: 'K (Thousands)',
      release_time_utc: new Date().toISOString().split('T')[0] + 'T12:30:00Z',
      source_name: 'U.S. Bureau of Labor Statistics (BLS)',
      source_reference: 'https://www.bls.gov/',
      data_status: 'VERIFIED',
      revision_version: 1,
      range_label: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: MacroEventRecord) => {
    setModalMode('edit');
    setFormEvent({ ...event });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEvent.event_type || !formEvent.indicator_name) return;

    const parseVal = (v: string | number | null | undefined): number | null => {
      if (v === undefined || v === null || v === '') return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    };

    const newRecord: MacroEventRecord = {
      event_id: formEvent.event_id || `macro-${Date.now()}`,
      event_type: formEvent.event_type as 'FOMC' | 'NFP' | 'CPI' | 'PPI',
      indicator_code: formEvent.indicator_code || `${formEvent.event_type}_INDICATOR`,
      indicator_name: formEvent.indicator_name,
      reporting_period: formEvent.reporting_period || 'Period',
      actual_value: parseVal(formEvent.actual_value),
      consensus_value: parseVal(formEvent.consensus_value),
      previous_value: parseVal(formEvent.previous_value),
      revised_previous: parseVal(formEvent.revised_previous),
      unit: formEvent.unit || '',
      release_time_utc: formEvent.release_time_utc || new Date().toISOString(),
      source_name: formEvent.source_name || 'Official Agency',
      source_reference: formEvent.source_reference || 'https://www.bls.gov/',
      data_status: formEvent.data_status || 'VERIFIED',
      revision_version: formEvent.revision_version || 1,
      range_label: formEvent.range_label || undefined,
    };

    if (modalMode === 'add') {
      const updated = [newRecord, ...events];
      setEvents(updated);
      setSelectedEventId(newRecord.event_id);
    } else {
      const updated = events.map(ev => ev.event_id === newRecord.event_id ? newRecord : ev);
      setEvents(updated);
      setSelectedEventId(newRecord.event_id);
    }

    setIsModalOpen(false);
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan seluruh daftar data makroekonomi ke data standar rilis resmi?')) {
      setEvents(INITIAL_MACRO_EVENTS);
      setSelectedEventId(INITIAL_MACRO_EVENTS[0].event_id);
      localStorage.removeItem('gann_macro_events');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Subview Selector */}
      <div className="flex items-center justify-between gap-4 p-2 bg-slate-900/90 border border-slate-800 rounded-2xl flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubView('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subView === 'calendar'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Kalender Real-Time (Live Stream & Radar)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
              LIVE
            </span>
          </button>

          <button
            onClick={() => setSubView('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subView === 'audit'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Rilis Makroekonomi & AI Grounding</span>
          </button>
        </div>
      </div>

      {subView === 'calendar' ? (
        <EconomicCalendarTab state={state} />
      ) : (
        <>
          {/* Hero Header for Audit */}
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
                    Data referensi makro per {latestDateLabel} — {events.length} rilis data tercatat
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Analisis Makroekonomi & Kejutan Statistik
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Pusat audit rilis data tier-1 AS (FOMC, NFP, CPI, PPI). Mencegah look-ahead bias dengan verifikasi konsensus pra-rilis, perhitungan <em>Economic Surprise Z-score</em>, dan penjelasan AI berbasis dokumen resmi BLS/Federal Reserve.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center shrink-0 space-y-1 w-full sm:w-auto">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Spot Gold (XAU/USD)</span>
                  <div className="text-xl font-mono font-bold text-emerald-400">${livePrice.toLocaleString()}</div>
                  <span className="text-[10px] text-amber-400 font-mono flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Macro Aligned
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid: Calendar & Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Economic Calendar Events Table / List */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Kalender Rilis Tier-1</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openAddModal}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                title="Tambah data rilis makro baru"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
              <button
                onClick={handleResetToDefault}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-lg transition-all cursor-pointer"
                title="Reset ke data default standar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {['ALL', 'FOMC', 'NFP', 'CPI', 'PPI'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all cursor-pointer shrink-0 ${
                  filterType === t 
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' 
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredEvents.map(ev => {
              const isSelected = ev.event_id === selectedEventId;
              const surprise = calculateEconomicSurprise(ev.actual_value, ev.consensus_value, ev.event_type);
              const eventDate = new Date(ev.release_time_utc);
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
                      {eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                        {surprise.discreteAssessment?.includes('In-Line') ? 'In-Line' : 'Surprise'}
                      </span>
                    ) : surprise.zScore !== null && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        surprise.zScore > 0 ? 'bg-emerald-500/20 text-emerald-400' : (surprise.zScore < 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300')
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                    {selectedEvent.event_type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Status: <strong className={selectedEvent.data_status === 'VERIFIED' ? 'text-emerald-400' : 'text-sky-400'}>
                      {selectedEvent.data_status} (per {new Date(selectedEvent.release_time_utc).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })})
                    </strong>
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">{selectedEvent.indicator_name}</h2>
                <p className="text-xs text-slate-400 font-mono">Periode: {selectedEvent.reporting_period}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditModal(selectedEvent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
                  title="Edit data rilis terpilih"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Data</span>
                </button>
                <a 
                  href={selectedEvent.source_reference} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sumber Resmi</span>
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
                  {selectedEvent.event_type === 'FOMC' ? (surpriseData.discreteAssessment?.includes('In-Line') ? 'In-Line' : 'Surprise') : (surpriseData.zScore !== null ? (surpriseData.zScore > 0 ? `+${surpriseData.zScore}` : surpriseData.zScore) : 'N/A')}
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
      </>
      )}

      {/* Interactive Modal: Add / Edit Macro Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  {modalMode === 'add' ? 'Tambah Data Rilis Makroekonomi' : 'Perbarui Data Rilis Makroekonomi'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tipe Event</label>
                  <select
                    value={formEvent.event_type}
                    onChange={(e) => {
                      const val = e.target.value as 'FOMC' | 'NFP' | 'CPI' | 'PPI';
                      let defaultName = formEvent.indicator_name;
                      let defaultUnit = formEvent.unit;
                      if (val === 'NFP') { defaultName = 'Non-Farm Payrolls Employment Change'; defaultUnit = 'K (Thousands)'; }
                      if (val === 'CPI') { defaultName = 'Core Consumer Price Index (YoY)'; defaultUnit = '%'; }
                      if (val === 'PPI') { defaultName = 'Core Producer Price Index (MoM)'; defaultUnit = '%'; }
                      if (val === 'FOMC') { defaultName = 'FOMC Rate Decision (Target Range)'; defaultUnit = '%'; }
                      setFormEvent(prev => ({ ...prev, event_type: val, indicator_name: defaultName, unit: defaultUnit }));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="NFP">NFP (Non-Farm Payrolls)</option>
                    <option value="CPI">CPI (Consumer Price Index)</option>
                    <option value="PPI">PPI (Producer Price Index)</option>
                    <option value="FOMC">FOMC (Federal Open Market Committee)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Status Verifikasi Data</label>
                  <select
                    value={formEvent.data_status}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, data_status: e.target.value as any }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="VERIFIED">VERIFIED (Resmi Terkonfirmasi)</option>
                    <option value="ESTIMATED">ESTIMATED (Estimasi / Konsensus)</option>
                    <option value="INSUFFICIENT_DATA">INSUFFICIENT_DATA (Data Belum Lengkap)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Nama Indikator</label>
                <input
                  type="text"
                  required
                  value={formEvent.indicator_name || ''}
                  onChange={(e) => setFormEvent(prev => ({ ...prev, indicator_name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Periode Laporan</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: September 2026"
                    value={formEvent.reporting_period || ''}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, reporting_period: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Satuan (Unit)</label>
                  <input
                    type="text"
                    required
                    value={formEvent.unit || ''}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Nilai Aktual</label>
                  <input
                    type="number"
                    step="any"
                    value={formEvent.actual_value ?? ''}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, actual_value: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Konsensus</label>
                  <input
                    type="number"
                    step="any"
                    value={formEvent.consensus_value ?? ''}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, consensus_value: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Sebelumnya</label>
                  <input
                    type="number"
                    step="any"
                    value={formEvent.previous_value ?? ''}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, previous_value: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Revisi Seb.</label>
                  <input
                    type="number"
                    step="any"
                    value={formEvent.revised_previous ?? ''}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, revised_previous: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {formEvent.event_type === 'FOMC' && (
                <div>
                  <label className="text-slate-400 block mb-1">Range Label Suku Bunga (FOMC Target Range)</label>
                  <input
                    type="text"
                    placeholder="misal: 3.25%–3.50%"
                    value={formEvent.range_label || ''}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, range_label: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tanggal & Waktu Rilis (UTC)</label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DDTHH:mm:ssZ"
                    value={formEvent.release_time_utc || ''}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, release_time_utc: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Nama Lembaga Sumber</label>
                  <input
                    type="text"
                    value={formEvent.source_name || ''}
                    onChange={(e) => setFormEvent(prev => ({ ...prev, source_name: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">URL Referensi Sumber Resmi</label>
                <input
                  type="url"
                  value={formEvent.source_reference || ''}
                  onChange={(e) => setFormEvent(prev => ({ ...prev, source_reference: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  {modalMode === 'add' ? 'Simpan Rilis Baru' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
