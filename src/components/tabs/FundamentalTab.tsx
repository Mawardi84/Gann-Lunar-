import React, { useState, useEffect } from 'react';
import { Calendar, Table, FileText, Activity, BarChart2, ShieldCheck, X, Plus } from 'lucide-react';
import { MarketState } from '../../hooks/useMarketState';
import { INITIAL_MACRO_EVENTS, MacroEventRecord, calculateEconomicSurprise } from '../../utils/fundamental';
import { AuditInfoOverlay, AuditInfoRecord } from '../AuditInfoOverlay';
import { auditTrail, AuditLogEntry, AuditTrailStats } from '../../utils/auditTrail';
import { fetchLiveClevelandFedNowcast, getNowcastSparklinePoints } from '../../utils/nowcast';

import { CalendarView } from '../fundamental/CalendarView';
import { TableView } from '../fundamental/TableView';
import { AuditView } from '../fundamental/AuditView';
import { TrailView } from '../fundamental/TrailView';
import { StatsView } from '../fundamental/StatsView';

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
    <span title="Ilustrasi tren, bukan data nowcast historis aktual">
      <svg width={w} height={h} className="inline-block overflow-visible my-0.5">
        <polyline fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
        {points.map((p, idx) => {
          const x = (idx / (points.length - 1 || 1)) * w;
          const y = h - ((p - min) / range) * (h - 4) - 2;
          return <circle key={idx} cx={isNaN(x) ? 0 : x} cy={isNaN(y) ? h / 2 : y} r="2" fill="#f59e0b" />;
        })}
      </svg>
    </span>
  );
};

export const FundamentalTab: React.FC<FundamentalTabProps> = ({ state }) => {
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
      {/* Subview Selector Bar */}
      <div className="flex items-center justify-between gap-4 p-2 bg-slate-900/90 border border-slate-800 rounded-md flex-wrap">
        <div className="flex items-center gap-2 flex-wrap font-mono tabular-nums">
          <button
            onClick={() => setSubView('calendar')}
            className={`px-4 py-2 rounded-md text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subView === 'calendar'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Kalender Real-Time</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
              LIVE
            </span>
          </button>

          <button
            onClick={() => setSubView('table')}
            className={`px-4 py-2 rounded-md text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subView === 'table'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Tabel Data Makro</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold">
              AUDIT
            </span>
          </button>

          <button
            onClick={() => setSubView('audit')}
            className={`px-4 py-2 rounded-md text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subView === 'audit'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Grounding AI</span>
          </button>

          <button
            onClick={() => setSubView('trail')}
            className={`px-4 py-2 rounded-md text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subView === 'trail'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Log Audit Trail</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold">
              {auditLogs.length} LOGS
            </span>
          </button>

          <button
            onClick={() => setSubView('stats')}
            className={`px-4 py-2 rounded-md text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subView === 'stats'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analisis Statistik</span>
            <span className="px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-bold">
              STATS
            </span>
          </button>
        </div>
      </div>

      {/* Render Active Subview */}
      {subView === 'calendar' && <CalendarView state={state} />}
      {subView === 'table' && (
        <TableView
          events={events}
          filterType={filterType}
          setFilterType={setFilterType}
          tableSearchQuery={tableSearchQuery}
          setTableSearchQuery={setTableSearchQuery}
          openAuditOverlay={openAuditOverlay}
          openAddModal={openAddModal}
          handleResetToDefault={handleResetToDefault}
          renderSparklineSvg={renderSparklineSvg}
        />
      )}
      {subView === 'audit' && (
        <AuditView
          events={events}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
          aiLoading={aiLoading}
          aiAnalysisResult={aiAnalysisResult}
          errorMsg={errorMsg}
          handleRunFundamentalAI={handleRunFundamentalAI}
          openAuditOverlay={openAuditOverlay}
        />
      )}
      {subView === 'trail' && (
        <TrailView
          auditLogs={auditLogs}
          auditStats={auditStats}
          onClearLogs={() => {
            auditTrail.clearLogs();
            setAuditLogs([]);
            setAuditStats(auditTrail.getStats());
          }}
        />
      )}
      {subView === 'stats' && <StatsView events={events} />}

      {/* Add / Edit Macro Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-mono">
          <div className="bg-slate-900 border border-slate-800 rounded-md max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {modalMode === 'add' ? 'Tambah Rilis Makro Eksternal' : 'Edit Rilis Makro'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Tipe Event</label>
                  <select
                    value={formEvent.event_type}
                    onChange={(e) => setFormEvent({ ...formEvent, event_type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-white"
                  >
                    <option value="NFP">NFP</option>
                    <option value="CPI">CPI</option>
                    <option value="FOMC">FOMC</option>
                    <option value="PPI">PPI</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Satuan Data</label>
                  <input
                    type="text"
                    value={formEvent.unit}
                    onChange={(e) => setFormEvent({ ...formEvent, unit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Nama Indikator</label>
                <input
                  type="text"
                  value={formEvent.indicator_name}
                  onChange={(e) => setFormEvent({ ...formEvent, indicator_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-white font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3 tabular-nums">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Previous</label>
                  <input
                    type="text"
                    value={formEvent.previous_value ?? ''}
                    onChange={(e) => setFormEvent({ ...formEvent, previous_value: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-sky-400 uppercase block mb-1">Consensus</label>
                  <input
                    type="text"
                    value={formEvent.consensus_value ?? ''}
                    onChange={(e) => setFormEvent({ ...formEvent, consensus_value: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-emerald-400 uppercase block mb-1">Actual (Resmi)</label>
                  <input
                    type="text"
                    value={formEvent.actual_value ?? ''}
                    onChange={(e) => setFormEvent({ ...formEvent, actual_value: e.target.value })}
                    placeholder="Kosongkan jika pending"
                    className="w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Simpan Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Audit Overlay Modal */}
      {isAuditOverlayOpen && auditModalRecord && (
        <AuditInfoOverlay
          record={auditModalRecord}
          isOpen={isAuditOverlayOpen}
          onClose={() => setIsAuditOverlayOpen(false)}
        />
      )}
    </div>
  );
};
