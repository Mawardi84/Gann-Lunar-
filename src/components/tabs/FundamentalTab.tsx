import React, { useState, useEffect } from 'react';
import { 
  Building2, Calendar, TrendingUp, TrendingDown, AlertCircle, ShieldCheck, Zap, RefreshCw, FileText, 
  ExternalLink, CheckCircle2, Layers, Clock, Plus, Edit3, RotateCcw, X, Info, Table, Search, Database,
  ArrowUpRight, ArrowDownRight, Activity, Download, Trash2, ChevronDown, ChevronUp, Copy, Check, BarChart2
} from 'lucide-react';
import { MarketState } from '../../hooks/useMarketState';
import { INITIAL_MACRO_EVENTS, MacroEventRecord, calculateEconomicSurprise } from '../../utils/fundamental';
import { EconomicCalendarTab } from './EconomicCalendarTab';
import { AuditInfoOverlay, AuditInfoRecord } from '../AuditInfoOverlay';
import { auditTrail, AuditLogEntry, AuditTrailStats } from '../../utils/auditTrail';
import { 
  calculateNowcastMarketBias, 
  CLEVELAND_FED_TOOLTIP, 
  NOWCAST_DISCLAIMER, 
  MACRO_GOLD_LOGIC, 
  NON_CPI_NOWCAST_NOTICE, 
  fetchLiveClevelandFedNowcast,
  getNowcastSparklinePoints
} from '../../utils/nowcast';

const renderSparklineSvg = (points: number[]) => {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 54;
  const h = 16;
  const pts = points.map((p, idx) => {
    const x = (idx / (points.length - 1 || 1)) * w;
    const y = h - ((p - min) / range) * (h - 4) - 2;
    return `${x},${isNaN(y) ? h / 2 : y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="inline-block overflow-visible my-0.5" title="Tren Nowcast 3 Bulan Terakhir">
      <polyline fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      {points.map((p, idx) => {
        const x = (idx / (points.length - 1 || 1)) * w;
        const y = h - ((p - min) / range) * (h - 4) - 2;
        return <circle key={idx} cx={isNaN(x) ? 0 : x} cy={isNaN(y) ? h / 2 : y} r="2" fill="#f59e0b" />;
      })}
    </svg>
  );
};

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
  nowcast_value?: string | number | null;
  nowcast_source?: string;
  nowcast_asof?: string;
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
  const [subView, setSubView] = useState<'calendar' | 'table' | 'audit' | 'trail' | 'stats'>('calendar');
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');
  const [auditModalRecord, setAuditModalRecord] = useState<AuditInfoRecord | null>(null);
  const [isAuditOverlayOpen, setIsAuditOverlayOpen] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Centralized Audit Trail Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => auditTrail.getLogs());
  const [auditStats, setAuditStats] = useState<AuditTrailStats>(() => auditTrail.getStats());
  const [trailDomainFilter, setTrailDomainFilter] = useState<string>('ALL');
  const [trailStatusFilter, setTrailStatusFilter] = useState<string>('ALL');
  const [trailSearchQuery, setTrailSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = auditTrail.subscribe(() => {
      setAuditLogs(auditTrail.getLogs());
      setAuditStats(auditTrail.getStats());
    });
    return unsub;
  }, []);

  // Hydrate CPI Nowcast dynamically from Cleveland Fed API
  useEffect(() => {
    fetchLiveClevelandFedNowcast().then(nowcastRes => {
      if (nowcastRes && nowcastRes.available) {
        setEvents(prev => prev.map(ev => {
          if (ev.event_type === 'CPI') {
            const isMom = ev.indicator_code?.includes('MOM');
            const val = isMom ? (nowcastRes.mom.coreCpi ?? nowcastRes.mom.cpi) : (nowcastRes.yoy.coreCpi ?? nowcastRes.yoy.cpi);
            return {
              ...ev,
              nowcast_value: val ?? ev.nowcast_value,
              nowcast_source: nowcastRes.source,
              nowcast_asof: nowcastRes.asOf ?? ev.nowcast_asof,
            };
          }
          return ev;
        }));
      }
    });
  }, []);

  const openAuditOverlay = (event: MacroEventRecord, activeDataPoint?: 'actual' | 'consensus' | 'previous' | 'revised' | 'nowcast' | 'all') => {
    setAuditModalRecord({
      event_id: event.event_id,
      indicator_name: event.indicator_name,
      indicator_code: event.indicator_code,
      event_type: event.event_type,
      reporting_period: event.reporting_period,
      actual_value: event.actual_value,
      consensus_value: event.consensus_value,
      previous_value: event.previous_value,
      revised_previous: event.revised_previous,
      nowcast_value: event.nowcast_value,
      nowcast_source: event.nowcast_source,
      nowcast_asof: event.nowcast_asof,
      unit: event.unit,
      release_time_utc: event.release_time_utc,
      source_name: event.source_name,
      source_reference: event.source_reference,
      data_status: event.data_status,
      revision_version: event.revision_version,
      range_label: event.range_label,
      activeDataPoint: activeDataPoint || 'all',
    });
    setIsAuditOverlayOpen(true);
  };

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

  const tableFilteredEvents = events.filter(e => {
    const matchesType = filterType === 'ALL' || e.event_type === filterType;
    if (!matchesType) return false;
    if (!tableSearchQuery.trim()) return true;
    const q = tableSearchQuery.toLowerCase();
    return (
      e.indicator_name.toLowerCase().includes(q) ||
      (e.indicator_code && e.indicator_code.toLowerCase().includes(q)) ||
      e.reporting_period.toLowerCase().includes(q) ||
      e.source_name.toLowerCase().includes(q) ||
      e.event_type.toLowerCase().includes(q)
    );
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    if (trailDomainFilter !== 'ALL' && log.domain !== trailDomainFilter) {
      return false;
    }
    if (trailStatusFilter !== 'ALL' && log.status !== trailStatusFilter) {
      return false;
    }
    if (trailSearchQuery.trim()) {
      const q = trailSearchQuery.toLowerCase();
      const matchUri = log.source_uri.toLowerCase().includes(q);
      const matchInst = log.provenance.institution.toLowerCase().includes(q);
      const matchSrc = log.provenance.source_name.toLowerCase().includes(q);
      const matchCode = (log.provenance.indicator_code || '').toLowerCase().includes(q);
      const matchHash = log.versioning.vintage_hash.toLowerCase().includes(q);
      if (!matchUri && !matchInst && !matchSrc && !matchCode && !matchHash) {
        return false;
      }
    }
    return true;
  });

  const handleCopySingleLog = (log: AuditLogEntry) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedLogId(log.id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  const handleDownloadLogsJson = () => {
    const jsonStr = auditTrail.exportLogsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qmae-audit-trail-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate latest release date for reference badge
  const latestEventDate = events.length > 0 
    ? new Date(Math.max(...events.map(e => new Date(e.release_time_utc).getTime())))
    : new Date();
  
  const latestDateLabel = latestEventDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const handleRunFundamentalAI = async (event: MacroEventRecord) => {
    setAiLoading(true);
    setErrorMsg(null);
    const startTime = Date.now();
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

      const durationMs = Date.now() - startTime;
      auditTrail.logFetchAttempt({
        sourceUri: '/api/fundamental/analyze',
        httpMethod: 'POST',
        status: res.ok ? 'SUCCESS' : 'FAILURE',
        statusCode: res.status,
        durationMs,
        domain: 'AI_GROUNDING',
        institution: 'Google Gemini 2.5 Flash / AI Studio',
        sourceName: 'Quantitative Fundamental AI Oracle',
        indicatorCode: event.indicator_code || `${event.event_type}_INDICATOR`,
        reportingPeriod: event.reporting_period,
        retrievalMethod: 'Serverless Endpoint Proxy',
        dataStatus: 'VERIFIED',
        revisionVersion: event.revision_version,
        rawPayload: data,
        callerContext: 'handleRunFundamentalAI',
      });

      if (!res.ok || !data) {
        throw new Error(data?.error || `Gagal menganalisis fundamental (HTTP ${res.status}).`);
      }
      setAiAnalysisResult(prev => ({ ...prev, [event.event_id]: data.analysis }));
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime;
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      auditTrail.logFetchAttempt({
        sourceUri: '/api/fundamental/analyze',
        httpMethod: 'POST',
        status: 'ERROR',
        durationMs,
        domain: 'AI_GROUNDING',
        institution: 'Google Gemini 2.5 Flash / AI Studio',
        sourceName: 'Quantitative Fundamental AI Oracle',
        indicatorCode: event.indicator_code || `${event.event_type}_INDICATOR`,
        reportingPeriod: event.reporting_period,
        retrievalMethod: 'Serverless Endpoint Proxy',
        rawPayload: { error: message },
        errorMessage: message,
        callerContext: 'handleRunFundamentalAI',
      });
      setErrorMsg(message);
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
        <div className="flex items-center gap-2 flex-wrap">
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
            onClick={() => setSubView('table')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subView === 'table'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Tabel Data Makro & Audit Info</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold font-mono">
              AUDIT
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
            <span>Grounding AI & Detail Rilis</span>
          </button>

          <button
            onClick={() => setSubView('trail')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subView === 'trail'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Log Jejak Audit (Centralized Audit Trail)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold font-mono">
              {auditLogs.length} LOGS
            </span>
          </button>

          <button
            onClick={() => setSubView('stats')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subView === 'stats'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analisis Statistik & MAE</span>
            <span className="px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-bold font-mono">
              STATS
            </span>
          </button>
        </div>
      </div>

      {subView === 'calendar' ? (
        <EconomicCalendarTab state={state} />
      ) : subView === 'stats' ? (
        <div className="space-y-6">
          {/* Hero Banner for Stats */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 space-y-2">
              <span className="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full text-xs font-mono font-bold inline-flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                QMAE STATISTICAL MACRO ANALYTICS & ERROR METRICS
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Analisis Statistik Nowcast vs Actual (MAE & Korelasi)
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Evaluasi performa akurasi estimasi Nowcast Cleveland Fed dibandingkan dengan rilis Actual resmi. Mematuhi aturan pembersihan data (null handling) di mana rilis yang belum terjadi dipisahkan secara ketat untuk menghindari bias.
              </p>
            </div>
          </div>

          {/* Metric Summary Cards */}
          {(() => {
            const verifiedEvents = events.filter(e => e.actual_value !== null && e.actual_value !== undefined);
            const pendingEvents = events.filter(e => e.actual_value === null || e.actual_value === undefined);
            const cpiPairs = events.filter(e => e.event_type === 'CPI' && e.actual_value !== null && e.actual_value !== undefined && e.nowcast_value !== null && e.nowcast_value !== undefined);
            const errors = cpiPairs.map(e => Math.abs((e.nowcast_value as number) - (e.actual_value as number)));
            const mae = errors.length > 0 ? (errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(4) : 'N/A';

            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
                  <span className="text-slate-400 text-[10px] uppercase">Total Event Makro</span>
                  <div className="text-2xl font-bold text-white">{events.length}</div>
                  <span className="text-[10px] text-slate-500">Database tersimpan</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
                  <span className="text-slate-400 text-[10px] uppercase">Rilis Aktual Terverifikasi</span>
                  <div className="text-2xl font-bold text-emerald-400">{verifiedEvents.length}</div>
                  <span className="text-[10px] text-emerald-500/80">Data historis resmi</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
                  <span className="text-slate-400 text-[10px] uppercase">Pending (Protected Nulls)</span>
                  <div className="text-2xl font-bold text-amber-400">{pendingEvents.length}</div>
                  <span className="text-[10px] text-amber-500/80">Menunggu rilis resmi</span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
                  <span className="text-slate-400 text-[10px] uppercase">Mean Absolute Error (MAE)</span>
                  <div className="text-2xl font-bold text-sky-400">{mae}%</div>
                  <span className="text-[10px] text-sky-500/80">Nowcast vs Actual (CPI)</span>
                </div>
              </div>
            );
          })()}

          {/* Detailed CPI Comparison Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Perbandingan Detail CPI: Nowcast vs Consensus vs Actual
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Periode</th>
                    <th className="py-3 px-4">Indikator</th>
                    <th className="py-3 px-4 text-right text-sky-400">Konsensus</th>
                    <th className="py-3 px-4 text-right text-amber-400">Nowcast (Fed)</th>
                    <th className="py-3 px-4 text-right text-emerald-400">Actual (Resmi)</th>
                    <th className="py-3 px-4 text-right">Deviasi Error |Nowcast − Actual|</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {events.filter(e => e.event_type === 'CPI').map(ev => {
                    const hasActual = ev.actual_value !== null && ev.actual_value !== undefined;
                    const hasNowcast = ev.nowcast_value !== null && ev.nowcast_value !== undefined;
                    const err = hasActual && hasNowcast ? Math.abs((ev.nowcast_value as number) - (ev.actual_value as number)).toFixed(2) : null;
                    return (
                      <tr key={ev.event_id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-white font-semibold">{ev.reporting_period}</td>
                        <td className="py-3 px-4 text-slate-300 font-sans">{ev.indicator_name}</td>
                        <td className="py-3 px-4 text-right text-sky-400 font-bold">{ev.consensus_value !== null ? `${ev.consensus_value}%` : '-'}</td>
                        <td className="py-3 px-4 text-right text-amber-400 font-bold">{hasNowcast ? `${ev.nowcast_value}%` : 'N/A'}</td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-bold">{hasActual ? `${ev.actual_value}%` : <span className="text-slate-500 italic">Pending (-)</span>}</td>
                        <td className="py-3 px-4 text-right text-slate-300 font-bold">{err !== null ? `${err}%` : <span className="text-slate-500 font-normal">N/A (Pending)</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : subView === 'table' ? (
        <div className="space-y-6">
          {/* Hero Banner for Table */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-amber-400" />
                    TABEL DATA MAKROEKONOMI & AUDIT TRAIL
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Bitemporal Point-In-Time Valid ({events.length} Data Points)
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Tabel Data Makroekonomi & Riwayat Audit
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  Tabel data historis dan konsensus pra-rilis untuk setiap indikator tier-1 (FOMC, NFP, CPI, PPI). Klik tombol <strong className="text-amber-400 font-mono">Audit Info</strong> atau klik angka data ekonomi mana pun untuk membuka overlay audit bitemporal (sumber lembaga resmi, stempel waktu UTC/WIB, dan status revisi vintage).
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Rilis</span>
                </button>
                <button
                  onClick={handleResetToDefault}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 rounded-xl transition-all cursor-pointer"
                  title="Reset data ke standar"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Table Controls: Search & Category Filter */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['ALL', 'FOMC', 'NFP', 'CPI', 'PPI'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                    filterType === t 
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' 
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari indikator, periode, sumber..."
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
              {tableSearchQuery && (
                <button 
                  onClick={() => setTableSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* The Rich Data Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/90 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold text-slate-400">Status & Versi</th>
                    <th className="py-3 px-4 font-bold text-slate-400">Waktu Rilis (UTC / WIB)</th>
                    <th className="py-3 px-4 font-bold text-slate-400">Indikator & Periode</th>
                    <th className="py-3 px-4 font-bold text-right text-slate-400">Previous (Seb.)</th>
                    <th className="py-3 px-4 font-bold text-right text-sky-400">Forecast (Konsensus)</th>
                    <th className="py-3 px-4 font-bold text-right text-amber-400">
                      <div className="inline-flex items-center gap-1">
                        <span>Nowcast (Fed)</span>
                        <span title={CLEVELAND_FED_TOOLTIP} className="cursor-help">
                          <Info className="w-3 h-3 text-amber-400/80 inline" />
                        </span>
                      </div>
                    </th>
                    <th className="py-3 px-4 font-bold text-right text-emerald-400">Actual (Resmi)</th>
                    <th className="py-3 px-4 font-bold text-center text-slate-400">Bias / Kejutan</th>
                    <th className="py-3 px-4 font-bold text-slate-400">Sumber Resmi</th>
                    <th className="py-3 px-4 font-bold text-center text-slate-400">Audit Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {tableFilteredEvents.map((ev) => {
                    const surprise = calculateEconomicSurprise(ev.actual_value, ev.consensus_value, ev.event_type);
                    const releaseDate = new Date(ev.release_time_utc);
                    const formattedDate = releaseDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                    const formattedTimeWIB = releaseDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
                    const hasRevision = ev.revised_previous !== null && ev.revised_previous !== undefined && ev.previous_value !== ev.revised_previous;
                    const nowcastBias = ev.event_type === 'CPI' 
                      ? calculateNowcastMarketBias(ev.nowcast_value, ev.consensus_value)
                      : null;
                    
                    return (
                      <tr 
                        key={ev.event_id} 
                        className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                        onClick={() => openAuditOverlay(ev)}
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              ev.data_status === 'VERIFIED'
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                            }`}>
                              {ev.data_status}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              v{ev.revision_version ?? 1}.0
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="text-white font-semibold">{formattedDate}</div>
                          <div className="text-[10px] text-slate-400">{formattedTimeWIB}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-amber-300 font-bold">
                              {ev.event_type}
                            </span>
                            <span className="text-white font-semibold font-sans">{ev.indicator_name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Periode: <span className="text-slate-300">{ev.reporting_period}</span>
                          </div>
                        </td>

                        {/* Column 1: Previous (abu-abu/netral) */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="text-slate-300 font-medium tabular-nums">
                            {ev.previous_value !== null && ev.previous_value !== undefined ? `${ev.previous_value}${ev.unit}` : 'N/A'}
                          </div>
                          {hasRevision ? (
                            <span className="text-[9px] text-rose-400 block font-semibold">
                              Rev: {ev.revised_previous}{ev.unit}
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-500 block">Sama</span>
                          )}
                        </td>

                        {/* Column 2: Forecast / Konsensus Pasar (biru/sky) */}
                        <td 
                          className="py-3 px-4 text-right whitespace-nowrap cursor-pointer hover:bg-slate-800/80"
                          onClick={(e) => {
                            e.stopPropagation();
                            openAuditOverlay(ev, 'consensus');
                          }}
                          title="Konsensus Pasar — Klik untuk membuka Audit Info"
                        >
                          <div className="text-sky-400 font-bold tabular-nums text-sm">
                            {ev.consensus_value !== null && ev.consensus_value !== undefined ? `${ev.consensus_value}${ev.unit}` : 'N/A'}
                          </div>
                          <span className="text-[9px] text-sky-500/80">Konsensus</span>
                        </td>

                        {/* Column 3: Nowcast (amber/kuning, Cleveland Fed — bukan rilis resmi) */}
                        <td 
                          className="py-3 px-4 text-right whitespace-nowrap cursor-pointer hover:bg-slate-800/80"
                          onClick={(e) => {
                            e.stopPropagation();
                            openAuditOverlay(ev, 'nowcast');
                          }}
                          title={ev.event_type === 'CPI' ? CLEVELAND_FED_TOOLTIP : NON_CPI_NOWCAST_NOTICE}
                        >
                          {ev.event_type === 'CPI' ? (
                            ev.nowcast_value !== null && ev.nowcast_value !== undefined ? (
                              <div>
                                <div className="text-amber-400 font-bold tabular-nums text-sm flex items-center justify-end gap-1">
                                  <span>{ev.nowcast_value}{ev.unit}</span>
                                  <Info className="w-3 h-3 text-amber-400/70 inline" />
                                </div>
                                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                  <span className="text-[9px] text-amber-500/80">
                                    Fed ({ev.nowcast_asof || 'Live'})
                                  </span>
                                  {renderSparklineSvg(getNowcastSparklinePoints(ev))}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="text-[10px] text-amber-400/60 italic">Tidak tersedia saat ini</span>
                              </div>
                            )
                          ) : (
                            <div title={NON_CPI_NOWCAST_NOTICE}>
                              <span className="text-slate-600 font-mono text-xs">-</span>
                              <span className="text-[8px] text-slate-600 block">Non-CPI</span>
                            </div>
                          )}
                        </td>

                        {/* Column 4: Actual (hijau/merah tegas, tetap "-" sampai rilis resmi, TIDAK PERNAH diisi otomatis) */}
                        <td 
                          className="py-3 px-4 text-right whitespace-nowrap cursor-pointer hover:bg-slate-800/80"
                          onClick={(e) => {
                            e.stopPropagation();
                            openAuditOverlay(ev, 'actual');
                          }}
                          title="Nilai Aktual Resmi — Klik untuk membuka Audit Info"
                        >
                          {ev.actual_value !== null && ev.actual_value !== undefined ? (
                            <div>
                              <div className="text-emerald-400 font-extrabold tabular-nums text-sm">
                                {(ev.range_label || ev.actual_value)}{ev.unit}
                              </div>
                              <span className="text-[9px] text-emerald-500/80 block">Rilis Resmi</span>
                            </div>
                          ) : (
                            <div>
                              <span className="text-slate-500 font-bold text-sm tabular-nums">-</span>
                              <span className="text-[9px] text-slate-600 block">Menunggu Rilis</span>
                            </div>
                          )}
                        </td>

                        {/* Column 5: Kejutan / Rule-based Bias */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {nowcastBias && nowcastBias.bias !== 'UNKNOWN' && (ev.actual_value === null || ev.actual_value === undefined) ? (
                            <div className="space-y-0.5" title={nowcastBias.detail + '\n' + nowcastBias.disclaimer}>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${nowcastBias.badgeColor}`}>
                                {nowcastBias.label}
                              </span>
                              {nowcastBias.gap !== null && (
                                <span className="text-[9px] text-slate-400 block font-mono">
                                  Gap: {nowcastBias.gap > 0 ? `+${nowcastBias.gap.toFixed(2)}` : nowcastBias.gap.toFixed(2)}%
                                </span>
                              )}
                            </div>
                          ) : ev.event_type === 'FOMC' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                              {surprise.discreteAssessment?.includes('In-Line') ? 'In-Line' : 'Surprise'}
                            </span>
                          ) : surprise.zScore !== null ? (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                              surprise.zScore > 0 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : (surprise.zScore < 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300')
                            }`}>
                              Z: {surprise.zScore > 0 ? `+${surprise.zScore}` : surprise.zScore}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="text-slate-300 font-sans text-xs">{ev.source_name}</div>
                          <a
                            href={ev.source_reference}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 transition-colors mt-0.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Dokumen Primer</span>
                          </a>
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openAuditOverlay(ev);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold transition-all cursor-pointer shadow-sm"
                            title="Buka Overlay Audit Info Lengkap"
                          >
                            <ShieldCheck className="w-3 h-3 text-amber-400" />
                            <span>Audit Info</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {tableFilteredEvents.length === 0 && (
              <div className="p-8 text-center text-slate-400 font-mono text-xs">
                Tidak ada data rilis makroekonomi yang sesuai kriteria pencarian.
              </div>
            )}
          </div>
        </div>
      ) : subView === 'trail' ? (
        <div className="space-y-6">
          {/* Hero Banner for Centralized Audit Trail */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                    CENTRALIZED AUDIT TRAIL & DATA PROVENANCE
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Section 5 Governance Compliant
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Pencatatan Jejak Audit Data Eksternal (Audit Trail)
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                  Log tersentralisasi yang mencatat setiap upaya pengambilan data makroekonomi, streaming feed pasar, dan analisis AI. Memverifikasi status HTTP, stempel waktu bitemporal (UTC & WIB), URI sumber tersanitasi, serta integritas struktur payload mentah.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownloadLogsJson}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border border-slate-700 shadow-md"
                  title="Unduh seluruh riwayat log audit dalam format JSON"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Ekspor JSON</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Hapus seluruh riwayat log jejak audit?')) {
                      auditTrail.clearLogs();
                      setAuditLogs([]);
                      setAuditStats(auditTrail.getStats());
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border border-slate-800"
                  title="Hapus log riwayat saat ini"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Bersihkan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Health & Performance Analytics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
              <span className="text-slate-400 text-[10px] uppercase block">Total Upaya Ingestion</span>
              <div className="text-2xl font-bold text-white tabular-nums">{auditStats.totalAttempts}</div>
              <span className="text-[10px] text-slate-500">Percobaan fetch tercatat</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
              <span className="text-slate-400 text-[10px] uppercase block">Tingkat Keberhasilan (Success Rate)</span>
              <div className={`text-2xl font-bold tabular-nums ${auditStats.successRatePct >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {auditStats.successRatePct}%
              </div>
              <span className="text-[10px] text-slate-500">{auditStats.successCount} berhasil / {auditStats.failureCount} gagal</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
              <span className="text-slate-400 text-[10px] uppercase block">Rata-Rata Latensi Jaringan</span>
              <div className="text-2xl font-bold text-sky-400 tabular-nums">{auditStats.averageDurationMs} ms</div>
              <span className="text-[10px] text-slate-500">Waktu respons server sumber</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
              <span className="text-slate-400 text-[10px] uppercase block">Integritas Bitemporal</span>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Look-Ahead</span>
              </div>
              <span className="text-[10px] text-slate-500">Point-in-time vintage verified</span>
            </div>
          </div>

          {/* Filtering and Search Toolbar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {[
                { id: 'ALL', label: 'Semua Domain' },
                { id: 'MACRO_ECONOMIC', label: 'Makroekonomi' },
                { id: 'MARKET_FEED', label: 'Feed Pasar' },
                { id: 'AI_GROUNDING', label: 'Grounding AI' }
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => setTrailDomainFilter(d.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                    trailDomainFilter === d.id 
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' 
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {d.label}
                </button>
              ))}

              <div className="h-5 w-px bg-slate-800 mx-1 shrink-0"></div>

              {['ALL', 'SUCCESS', 'FAILURE', 'ERROR'].map(s => (
                <button
                  key={s}
                  onClick={() => setTrailStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer shrink-0 ${
                    trailStatusFilter === s 
                      ? 'bg-slate-800 text-amber-300 border border-amber-500/40 font-extrabold' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari URI, lembaga, atau hash..."
                value={trailSearchQuery}
                onChange={(e) => setTrailSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
              {trailSearchQuery && (
                <button 
                  onClick={() => setTrailSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Audit Logs Feed / Expanded Cards */}
          <div className="space-y-3">
            {filteredAuditLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const isCopied = copiedLogId === log.id;
              const isSuccess = log.status === 'SUCCESS';

              return (
                <div 
                  key={log.id} 
                  className={`bg-slate-900/90 border rounded-2xl p-4.5 shadow-xl transition-all ${
                    isSuccess ? 'border-slate-800 hover:border-slate-700' : 'border-rose-900/60 bg-rose-950/10'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    
                    {/* Left: Status, Domain, HTTP Method, URI */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          isSuccess 
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                            : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                        }`}>
                          {log.status} {log.status_code ? `(${log.status_code})` : ''}
                        </span>

                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-purple-300 font-bold">
                          {log.domain}
                        </span>

                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {log.http_method}
                        </span>

                        <span className="text-[10px] font-mono text-slate-500">
                          ID: <strong className="text-slate-300">{log.id}</strong>
                        </span>
                      </div>

                      <div className="font-mono text-xs text-white break-all flex items-center gap-1.5">
                        <span className="text-slate-400 select-none">URI:</span>
                        <span className="text-amber-300 font-semibold">{log.source_uri}</span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-sans flex items-center gap-3 flex-wrap">
                        <span>Lembaga: <strong className="text-slate-200">{log.provenance.institution}</strong></span>
                        <span>Sumber: <strong className="text-slate-300">{log.provenance.source_name}</strong></span>
                        {log.provenance.indicator_code && (
                          <span>Indikator: <code className="text-amber-400 font-mono text-[10px]">{log.provenance.indicator_code}</code></span>
                        )}
                      </div>
                    </div>

                    {/* Right: Metrics, Hash, Actions */}
                    <div className="flex items-center gap-3 shrink-0 flex-wrap lg:flex-nowrap justify-between lg:justify-end">
                      <div className="text-right font-mono text-[11px]">
                        <div className="text-white font-bold tabular-nums">{log.duration_ms} ms</div>
                        <div className="text-slate-400 text-[10px]">{log.timestamp_local}</div>
                        <div className="text-[9px] text-slate-500 tabular-nums">{log.timestamp_utc}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-amber-400 font-bold" title="Deterministik Vintage Checksum Hash">
                          {log.versioning.vintage_hash}
                        </span>

                        <button
                          onClick={() => handleCopySingleLog(log)}
                          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                          title="Salin JSON Log Entri ini"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        </button>

                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-mono font-bold transition-all cursor-pointer"
                        >
                          <span>{isExpanded ? 'Tutup Payload' : 'Struktur Payload'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Expanded Payload & Provenance Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 font-mono text-xs animate-in fade-in duration-150">
                      
                      {log.error_message && (
                        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Pesan Error: {log.error_message}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase block">1. Tipe Skema Payload</span>
                          <span className="text-emerald-400 font-bold block">{log.payload_structure.schemaType}</span>
                          <span className="text-[10px] text-slate-400 block">Ukuran: ~{log.payload_structure.byteSize || 0} bytes</span>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase block">2. Kunci / Kolom Terdeteksi</span>
                          <span className="text-amber-300 font-bold block">{log.payload_structure.fieldCount || 0} kolom</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {log.payload_structure.topLevelKeys?.join(', ') || 'None'}
                          </span>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase block">3. Provenance & Versioning</span>
                          <span className="text-white font-bold block">Versi: v{log.versioning.revision_version}.0 ({log.versioning.data_status})</span>
                          <span className="text-[10px] text-purple-300 block truncate">Metode: {log.provenance.retrieval_method}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase block">Ringkasan Struktur Payload Mentah:</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed break-all font-mono">
                          {log.payload_structure.sampleSummary}
                        </p>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}

            {filteredAuditLogs.length === 0 && (
              <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
                <Activity className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">Belum Ada Log Ingestion yang Tercatat</h3>
                <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
                  Setiap pemanggilan API eksternal (NASDAQ calendar, streaming live prices, atau grounding fundamental) akan secara otomatis tercatat di log audit trail ini.
                </p>
              </div>
            )}
          </div>
        </div>
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

                  {/* 4 Distinct Metric Badges */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/60 text-[10px] font-mono">
                    <div className="bg-slate-900/60 px-1.5 py-1 rounded border border-slate-800">
                      <span className="text-slate-500 block text-[8px] uppercase">Prev</span>
                      <span className="text-slate-300 font-bold tabular-nums">
                        {ev.previous_value !== null && ev.previous_value !== undefined ? `${ev.previous_value}` : '-'}
                      </span>
                    </div>
                    <div className="bg-sky-950/30 px-1.5 py-1 rounded border border-sky-500/20">
                      <span className="text-sky-400/80 block text-[8px] uppercase">Forecast</span>
                      <span className="text-sky-400 font-bold tabular-nums">
                        {ev.consensus_value !== null && ev.consensus_value !== undefined ? `${ev.consensus_value}` : '-'}
                      </span>
                    </div>
                    <div className={`px-1.5 py-1 rounded border ${
                      ev.event_type === 'CPI' ? 'bg-amber-950/30 border-amber-500/30 text-amber-300' : 'bg-slate-900/30 border-slate-800 text-slate-600'
                    }`}>
                      <span className="text-[8px] uppercase block opacity-80">Nowcast</span>
                      <span className="font-bold tabular-nums">
                        {ev.event_type === 'CPI' ? (ev.nowcast_value !== null && ev.nowcast_value !== undefined ? `${ev.nowcast_value}` : '-') : '-'}
                      </span>
                    </div>
                    <div className={`px-1.5 py-1 rounded border ${
                      ev.actual_value !== null && ev.actual_value !== undefined ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400' : 'bg-slate-900/30 border-slate-800 text-slate-500'
                    }`}>
                      <span className="text-[8px] uppercase block opacity-80">Actual</span>
                      <span className="font-bold tabular-nums">
                        {ev.actual_value !== null && ev.actual_value !== undefined ? `${ev.range_label || ev.actual_value}` : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <div>
                      {ev.event_type === 'CPI' && ev.nowcast_value !== null && ev.nowcast_value !== undefined && (ev.actual_value === null || ev.actual_value === undefined) ? (
                        (() => {
                          const bias = calculateNowcastMarketBias(ev.nowcast_value, ev.consensus_value);
                          return (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${bias.badgeColor}`}>
                              {bias.label}
                            </span>
                          );
                        })()
                      ) : ev.event_type === 'FOMC' ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          {surprise.discreteAssessment?.includes('In-Line') ? 'In-Line' : 'Surprise'}
                        </span>
                      ) : surprise.zScore !== null && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                          surprise.zScore > 0 ? 'bg-emerald-500/20 text-emerald-400' : (surprise.zScore < 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300')
                        }`}>
                          Z: {surprise.zScore > 0 ? `+${surprise.zScore}` : surprise.zScore}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAuditOverlay(ev);
                        }}
                        className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 text-[9px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                        title="Buka Audit Info"
                      >
                        <ShieldCheck className="w-2.5 h-2.5 text-amber-400" />
                        <span>Audit</span>
                      </button>
                    </div>
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

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => openAuditOverlay(selectedEvent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/40 transition-all cursor-pointer font-mono shadow-sm"
                  title="Buka Audit Info Overlay untuk data ini"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Audit Info</span>
                </button>
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

            {/* 4 Distinct Visual Columns: Previous, Forecast, Nowcast, Actual */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              {/* 1. Previous (abu-abu/netral) */}
              <div 
                onClick={() => openAuditOverlay(selectedEvent, 'previous')}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1 hover:border-slate-700 cursor-pointer transition-all group"
                title="Periode Sebelumnya (Vintage Data) — Klik untuk membuka Audit Info"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">Previous (Seb.)</span>
                  <ShieldCheck className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="text-lg font-bold text-slate-200 tabular-nums">
                  {selectedEvent.previous_value !== null && selectedEvent.previous_value !== undefined ? `${selectedEvent.previous_value} ${selectedEvent.unit}` : 'N/A'}
                </div>
                <span className="text-[9px] text-slate-500 block">
                  {selectedEvent.revised_previous !== null && selectedEvent.revised_previous !== undefined && selectedEvent.previous_value !== selectedEvent.revised_previous 
                    ? `Rev: ${selectedEvent.revised_previous} ${selectedEvent.unit}` 
                    : 'Data Historis Resmi'}
                </span>
              </div>

              {/* 2. Forecast (biru, label "Konsensus Pasar") */}
              <div 
                onClick={() => openAuditOverlay(selectedEvent, 'consensus')}
                className="bg-sky-950/20 p-3.5 rounded-xl border border-sky-500/30 space-y-1 hover:border-sky-400 cursor-pointer transition-all group"
                title="Konsensus Pasar — Klik untuk membuka Audit Info"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sky-300 text-[10px] font-semibold">Forecast (Konsensus)</span>
                  <ShieldCheck className="w-3 h-3 text-sky-400/60 group-hover:text-sky-400 transition-colors" />
                </div>
                <div className="text-lg font-bold text-sky-400 tabular-nums">
                  {selectedEvent.consensus_value !== null && selectedEvent.consensus_value !== undefined ? `${selectedEvent.consensus_value} ${selectedEvent.unit}` : 'N/A'}
                </div>
                <span className="text-[9px] text-sky-400/70 block">Konsensus Pasar</span>
              </div>

              {/* 3. Nowcast (amber/kuning, label "Estimasi Cleveland Fed — bukan rilis resmi") */}
              <div 
                onClick={() => openAuditOverlay(selectedEvent, 'nowcast')}
                className="bg-amber-950/25 p-3.5 rounded-xl border border-amber-500/40 space-y-1 hover:border-amber-400 cursor-pointer transition-all group relative"
                title={selectedEvent.event_type === 'CPI' ? CLEVELAND_FED_TOOLTIP : NON_CPI_NOWCAST_NOTICE}
              >
                <div className="flex items-center justify-between">
                  <span className="text-amber-300 text-[10px] font-semibold flex items-center gap-1">
                    <span>Nowcast (Fed)</span>
                    <Info className="w-3 h-3 text-amber-400 inline" />
                  </span>
                  <ShieldCheck className="w-3 h-3 text-amber-400/60 group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="text-lg font-bold text-amber-300 tabular-nums">
                  {selectedEvent.event_type === 'CPI' ? (
                    selectedEvent.nowcast_value !== null && selectedEvent.nowcast_value !== undefined ? (
                      `${selectedEvent.nowcast_value} ${selectedEvent.unit}`
                    ) : (
                      <span className="text-xs text-amber-400/80 italic font-normal">Nowcast tidak tersedia saat ini</span>
                    )
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </div>
                <span className="text-[9px] text-amber-400/80 block truncate">
                  {selectedEvent.event_type === 'CPI' 
                    ? `Estimasi Cleveland Fed (${selectedEvent.nowcast_asof || 'Live'})` 
                    : 'Belum ada model nowcast'}
                </span>
              </div>

              {/* 4. Actual (hijau/merah tegas, tetap "-" sampai rilis resmi, TIDAK PERNAH diisi otomatis) */}
              <div 
                onClick={() => openAuditOverlay(selectedEvent, 'actual')}
                className={`p-3.5 rounded-xl border space-y-1 transition-all group cursor-pointer ${
                  selectedEvent.actual_value !== null && selectedEvent.actual_value !== undefined
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 hover:border-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
                title="Nilai Rilis Resmi — Tetap '-' sampai rilis resmi terjadi"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400">Actual (Resmi)</span>
                  <ShieldCheck className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="text-lg font-extrabold tabular-nums">
                  {selectedEvent.actual_value !== null && selectedEvent.actual_value !== undefined 
                    ? `${selectedEvent.range_label || selectedEvent.actual_value} ${selectedEvent.unit}` 
                    : '-'}
                </div>
                <span className="text-[9px] block">
                  {selectedEvent.actual_value !== null && selectedEvent.actual_value !== undefined 
                    ? 'Rilis Resmi Terverifikasi' 
                    : 'Menunggu Rilis Resmi'}
                </span>
              </div>
            </div>

            {/* Bias Arah Pasar (Rule-Based Macro Bias XAU/USD) — Only for events with Nowcast (CPI / Core CPI) */}
            {selectedEvent.event_type === 'CPI' ? (
              (() => {
                const biasResult = calculateNowcastMarketBias(selectedEvent.nowcast_value, selectedEvent.consensus_value);
                return (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-3 font-mono">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Bias Arah Pasar XAU/USD (Rule-Based Nowcast Gap)
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold border ${biasResult.badgeColor}`}>
                          {biasResult.label}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Kalkulasi Gap (Nowcast − Konsensus):</span>
                        <div className="text-base font-bold text-white tabular-nums">
                          {biasResult.gap !== null ? (
                            <span className={biasResult.gap > 0 ? 'text-amber-400' : (biasResult.gap < 0 ? 'text-emerald-400' : 'text-slate-300')}>
                              {biasResult.gap > 0 ? `+${biasResult.gap.toFixed(2)}` : biasResult.gap.toFixed(2)}% poin
                            </span>
                          ) : 'N/A'}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 block">
                          Nowcast: {selectedEvent.nowcast_value ?? 'N/A'}% vs Konsensus: {selectedEvent.consensus_value ?? 'N/A'}%
                        </span>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 md:col-span-2">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Logika Transmisi Makro ke Emas:</span>
                        <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                          {MACRO_GOLD_LOGIC}
                        </p>
                      </div>
                    </div>

                    {/* Explicit Rule-Based Disclaimer */}
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300/90 font-sans flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Disclaimer:</strong> {NOWCAST_DISCLAIMER}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 text-xs font-mono text-slate-400 flex items-center gap-2.5">
                <Info className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-[11px]">
                  <strong>Belum ada model nowcast tervalidasi untuk indikator ini ({selectedEvent.event_type}).</strong> Hanya CPI dan Core CPI yang memiliki model estimasi publik tervalidasi dari Federal Reserve Bank of Cleveland.
                </span>
              </div>
            )}

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

              {formEvent.event_type === 'CPI' && (
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-3">
                  <span className="text-[11px] font-bold text-amber-300 block">
                    Nowcast Estimasi (Cleveland Fed — Hanya untuk CPI/Core CPI)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-slate-400 block mb-1 text-[10px]">Nilai Nowcast (%)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="misal: 0.25"
                        value={formEvent.nowcast_value ?? ''}
                        onChange={(e) => setFormEvent(prev => ({ ...prev, nowcast_value: e.target.value ? Number(e.target.value) : null }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 text-[10px]">Tanggal Update (As of)</label>
                      <input
                        type="text"
                        placeholder="misal: 2026-10-23"
                        value={formEvent.nowcast_asof || ''}
                        onChange={(e) => setFormEvent(prev => ({ ...prev, nowcast_asof: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 text-[10px]">Lembaga Sumber Nowcast</label>
                      <input
                        type="text"
                        value={formEvent.nowcast_source || 'Federal Reserve Bank of Cleveland'}
                        onChange={(e) => setFormEvent(prev => ({ ...prev, nowcast_source: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
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

      {/* Audit Info Modal / Overlay */}
      <AuditInfoOverlay
        isOpen={isAuditOverlayOpen}
        onClose={() => setIsAuditOverlayOpen(false)}
        record={auditModalRecord}
      />

    </div>
  );
};
