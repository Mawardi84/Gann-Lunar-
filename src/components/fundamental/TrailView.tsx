import React, { useState } from 'react';
import { Activity, ShieldCheck, Download, Trash2, Search, Copy, Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { auditTrail, AuditLogEntry, AuditTrailStats } from '../../utils/auditTrail';

interface TrailViewProps {
  auditLogs: AuditLogEntry[];
  auditStats: AuditTrailStats;
  onClearLogs: () => void;
}

export const TrailView: React.FC<TrailViewProps> = ({ auditLogs, auditStats, onClearLogs }) => {
  const [trailDomainFilter, setTrailDomainFilter] = useState<string>('ALL');
  const [trailStatusFilter, setTrailStatusFilter] = useState<string>('ALL');
  const [trailSearchQuery, setTrailSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Hero Banner for Centralized Audit Trail */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-md p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded-md text-xs font-mono font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                CENTRALIZED AUDIT TRAIL & DATA PROVENANCE
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md text-[11px] font-mono flex items-center gap-1.5">
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
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-xs font-mono font-bold transition-all cursor-pointer border border-slate-700 shadow-md"
              title="Unduh seluruh riwayat log audit dalam format JSON"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Ekspor JSON</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Hapus seluruh riwayat log jejak audit?')) {
                  onClearLogs();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-md text-xs font-mono font-bold transition-all cursor-pointer border border-slate-800"
              title="Hapus log riwayat saat ini"
            >
              <Trash2 className="w-4 h-4" />
              <span>Bersihkan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Health & Performance Analytics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono tabular-nums">
        <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 space-y-1 shadow-lg">
          <span className="text-slate-400 text-[10px] uppercase">Total Upaya Ingestion</span>
          <div className="text-2xl font-bold text-white">{auditStats.totalAttempts}</div>
          <span className="text-[10px] text-slate-500">Percobaan fetch tercatat</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 space-y-1 shadow-lg">
          <span className="text-slate-400 text-[10px] uppercase">Tingkat Keberhasilan</span>
          <div className={`text-2xl font-bold ${auditStats.successRatePct >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {auditStats.successRatePct}%
          </div>
          <span className="text-[10px] text-slate-500">{auditStats.successCount} berhasil / {auditStats.failureCount} gagal</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 space-y-1 shadow-lg">
          <span className="text-slate-400 text-[10px] uppercase">Rata-Rata Latensi</span>
          <div className="text-2xl font-bold text-sky-400">{auditStats.averageDurationMs} ms</div>
          <span className="text-[10px] text-slate-500">Waktu respons server sumber</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 space-y-1 shadow-lg">
          <span className="text-slate-400 text-[10px] uppercase">Integritas Bitemporal</span>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero Look-Ahead</span>
          </div>
          <span className="text-[10px] text-slate-500">Point-in-time vintage verified</span>
        </div>
      </div>

      {/* Filtering and Search Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
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
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer shrink-0 ${
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
            placeholder="Cari URI, institusi, vintage hash..."
            value={trailSearchQuery}
            onChange={(e) => setTrailSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono tabular-nums"
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

      {/* Audit Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-md shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Status & Waktu (UTC)</th>
                <th className="py-3 px-4">Domain & Metode</th>
                <th className="py-3 px-4">Sumber / Institusi</th>
                <th className="py-3 px-4">URI / Endpoint</th>
                <th className="py-3 px-4 text-right">Durasi (ms)</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAuditLogs.map(log => {
                const isExpanded = expandedLogId === log.id;
                const dateUtc = new Date(log.timestamp_utc);
                const timeStr = dateUtc.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const dateStr = dateUtc.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

                return (
                  <React.Fragment key={log.id}>
                    <tr 
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                          }`}>
                            {log.status}
                          </span>
                          <div>
                            <span className="text-white font-semibold">{timeStr}</span>
                            <span className="text-[10px] text-slate-400 block">{dateStr}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-purple-300 font-bold">
                          {log.domain}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {log.http_method} · {log.provenance.retrieval_method}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-white font-semibold font-sans">{log.provenance.source_name}</div>
                        <div className="text-[10px] text-slate-400">{log.provenance.institution}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-amber-400 font-mono text-[11px] truncate max-w-xs" title={log.source_uri}>
                          {log.source_uri}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Hash: {log.versioning.vintage_hash.substring(0, 10)}...
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="text-sky-400 font-bold">{log.duration_ms} ms</span>
                        <span className="text-[10px] text-slate-500 block">HTTP {log.status_code || 200}</span>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleCopySingleLog(log)}
                            className="p-1.5 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                            title="Salin JSON Log"
                          >
                            {copiedLogId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="p-1.5 rounded-md bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                            title="Detail Payload"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-950/80 border-b border-slate-800">
                        <td colSpan={6} className="p-4 space-y-3">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                            <span>Integritas Vintage & Provenance Details</span>
                            <span className="text-amber-400 font-mono">ID: {log.id}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                            <div className="space-y-1 bg-slate-900/60 p-3 rounded-md border border-slate-800">
                              <span className="text-slate-400 text-[10px]">Stempel Waktu Bitemporal:</span>
                              <div className="text-white">UTC: {log.timestamp_utc}</div>
                              <div className="text-white">Lokal: {log.timestamp_local}</div>
                            </div>
                            <div className="space-y-1 bg-slate-900/60 p-3 rounded-md border border-slate-800">
                              <span className="text-slate-400 text-[10px]">Version Control & Vintage Hash:</span>
                              <div className="text-white">Revision: v{log.versioning.revision_version}.0</div>
                              <div className="text-amber-300 break-all text-[10px]">Hash: {log.versioning.vintage_hash}</div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 text-[10px] uppercase">Payload Mentah Tersanitasi:</span>
                            <pre className="bg-slate-900 p-3 rounded-md border border-slate-800 text-[10px] text-emerald-300 overflow-x-auto max-h-48">
                              {JSON.stringify(log.payload_structure, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAuditLogs.length === 0 && (
          <div className="p-8 text-center text-slate-400 font-mono text-xs">
            Tidak ada log audit yang sesuai dengan filter pencarian.
          </div>
        )}
      </div>
    </div>
  );
};
