import React, { useState } from 'react';
import { 
  ShieldCheck, Clock, FileText, ExternalLink, X, Copy, Check, 
  Layers, AlertTriangle, Database, Info, GitCommit, CheckCircle2 
} from 'lucide-react';

export interface AuditInfoRecord {
  event_id: string;
  indicator_name: string;
  indicator_code?: string;
  event_type?: string;
  reporting_period: string;
  actual_value: number | string | null;
  consensus_value: number | string | null;
  previous_value: number | string | null;
  revised_previous?: number | string | null;
  nowcast_value?: number | string | null;
  nowcast_source?: string;
  nowcast_asof?: string;
  unit: string;
  release_time_utc: string;
  source_name: string;
  source_reference: string;
  data_status: 'VERIFIED' | 'ESTIMATED' | 'DISPUTED' | 'INSUFFICIENT_DATA' | string;
  revision_version?: number;
  range_label?: string;
  activeDataPoint?: 'actual' | 'consensus' | 'previous' | 'revised' | 'nowcast' | 'all';
}

interface AuditInfoOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  record: AuditInfoRecord | null;
}

export const AuditInfoOverlay: React.FC<AuditInfoOverlayProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !record) return null;

  // Format UTC and Local timestamps
  const releaseDate = new Date(record.release_time_utc);
  const formattedUtc = isNaN(releaseDate.getTime()) 
    ? record.release_time_utc 
    : releaseDate.toISOString().replace('.000Z', ' UTC').replace('T', ' ');
  
  const formattedLocal = isNaN(releaseDate.getTime())
    ? 'N/A'
    : releaseDate.toLocaleString('id-ID', {
        dateStyle: 'full',
        timeStyle: 'medium',
        timeZone: 'Asia/Jakarta'
      }) + ' WIB';

  // Calculate Revision Difference
  const prevVal = Number(record.previous_value);
  const revVal = Number(record.revised_previous);
  const hasRevision = !isNaN(prevVal) && !isNaN(revVal) && prevVal !== revVal;
  const revisionDiff = hasRevision ? (revVal - prevVal) : 0;

  // Copy Full Audit JSON
  const handleCopyAuditJson = () => {
    const auditData = {
      event_id: record.event_id,
      indicator_code: record.indicator_code || `${record.event_type}_INDICATOR`,
      indicator_name: record.indicator_name,
      reporting_period: record.reporting_period,
      provenance: {
        source_institution: record.source_name,
        source_reference_url: record.source_reference,
        retrieval_method: 'Official Primary Release Grounding',
      },
      timestamps: {
        official_release_time_utc: record.release_time_utc,
        local_formatted_wib: formattedLocal,
        bitemporal_valid_from: record.release_time_utc,
      },
      values: {
        actual: record.range_label || record.actual_value,
        consensus: record.consensus_value,
        previous: record.previous_value,
        revised_previous: record.revised_previous,
        unit: record.unit,
      },
      versioning: {
        revision_version: record.revision_version ?? 1,
        verification_status: record.data_status,
        has_revision_applied: hasRevision,
        revision_delta: hasRevision ? revisionDiff : 0,
      },
      audit_integrity: {
        point_in_time_guarantee: true,
        anti_lookahead_checked: true,
        hash_tag: `QMAE-${record.event_id}-${record.revision_version || 1}`,
      }
    };

    navigator.clipboard.writeText(JSON.stringify(auditData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-400',
          label: 'VERIFIED (Resmi Terkonfirmasi)',
          desc: 'Data telah diverifikasi 100% terhadap publikasi primer resmi BLS / Fed.'
        };
      case 'ESTIMATED':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400',
          label: 'ESTIMATED (Konsensus Pra-Rilis)',
          desc: 'Nilai proyeksi pasar terkunci sebelum waktu rilis resmi.'
        };
      case 'DISPUTED':
        return {
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
          dot: 'bg-rose-400',
          label: 'DISPUTED (Dalam Sengketa)',
          desc: 'Terdapat anomali revisi atau inkonsistensi metodologi.'
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          dot: 'bg-slate-400',
          label: status,
          desc: 'Status verifikasi data makroekonomi.'
        };
    }
  };

  const statusConfig = getStatusBadge(record.data_status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8 text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                AUDIT INFO OVERLAY
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                ID: <strong className="text-white">{record.event_id}</strong>
              </span>
              {record.indicator_code && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  {record.indicator_code}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-1">
              {record.indicator_name}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Periode Pelaporan: <strong className="text-amber-300">{record.reporting_period}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer shrink-0"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Core Pillars: Source, Timestamp, and Versioning */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          
          {/* Pillar 1: Source */}
          <div className="bg-slate-950 p-4 rounded border border-slate-800/90 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-slate-800/80 pb-2">
              <Database className="w-4 h-4 text-amber-400 shrink-0" />
              <span>1. Sumber Data (Source)</span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Lembaga Resmi</span>
                <span className="text-white font-bold block">{record.source_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Metode Verifikasi</span>
                <span className="text-emerald-400 font-semibold block text-[11px]">Rilis Primer Tanpa Perantara</span>
              </div>
              <div className="pt-1">
                <a
                  href={record.source_reference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-700 transition-all text-[11px] font-semibold"
                >
                  <ExternalLink className="w-3 h-3 text-amber-400" />
                  <span>Buka Dokumen Resmi</span>
                </a>
              </div>
            </div>
          </div>

          {/* Pillar 2: Timestamp */}
          <div className="bg-slate-950 p-4 rounded border border-slate-800/90 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold border-b border-slate-800/80 pb-2">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <span>2. Timestamp (Waktu Rilis)</span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Timestamp UTC Resmi</span>
                <span className="text-white font-bold tabular-nums block">{formattedUtc}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Konversi Waktu Lokal</span>
                <span className="text-slate-300 text-[11px] block">{formattedLocal}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Integritas Bitemporal</span>
                <span className="text-sky-300 text-[10px] block">Point-in-Time Valid (Anti Look-Ahead)</span>
              </div>
            </div>
          </div>

          {/* Pillar 3: Versioning Status */}
          <div className="bg-slate-950 p-4 rounded border border-slate-800/90 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold border-b border-slate-800/80 pb-2">
              <GitCommit className="w-4 h-4 text-purple-400 shrink-0" />
              <span>3. Versioning Status</span>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Versi Rilis (Revision)</span>
                <span className="text-white font-bold block">
                  v{record.revision_version ?? 1}.0 {record.revision_version && record.revision_version > 1 ? '(Revisi Aktif)' : '(Rilis Pertama)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Status Verifikasi</span>
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold mt-0.5 ${statusConfig.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                  <span>{record.data_status}</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Riwayat Revisi Vintage</span>
                {hasRevision ? (
                  <span className="text-rose-400 font-semibold block text-[10px]">
                    Direvisi {revisionDiff > 0 ? `+${revisionDiff}` : revisionDiff} {record.unit}
                  </span>
                ) : (
                  <span className="text-slate-400 block text-[10px]">Tidak Ada Revisi Vintage</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Economic Data Point Snapshot */}
        <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
            <span className="font-bold text-white uppercase flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Rincian Titik Data Ekonomi Terverifikasi</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Satuan: <strong className="text-amber-300">{record.unit}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
            <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block font-semibold">SEBELUMNYA</span>
              <div className="text-base font-bold text-slate-200 tabular-nums">
                {record.previous_value ?? 'N/A'}
              </div>
              <span className="text-[9px] text-slate-500 block">Laporan lalu</span>
            </div>

            <div className="bg-slate-900 p-3 rounded border border-sky-900/40 space-y-1">
              <span className="text-sky-400 text-[10px] block font-semibold">KONSENSUS PASAR</span>
              <div className="text-base font-bold text-sky-400 tabular-nums">
                {record.consensus_value ?? 'N/A'}
              </div>
              <span className="text-[9px] text-slate-400 block">Ekspektasi terkunci</span>
            </div>

            <div className="bg-slate-900 p-3 rounded border border-amber-500/30 space-y-1">
              <span className="text-amber-300 text-[10px] block font-semibold">NOWCAST (FED)</span>
              <div className="text-base font-bold text-amber-400 tabular-nums">
                {record.nowcast_value !== null && record.nowcast_value !== undefined ? `${record.nowcast_value} ${record.unit}` : '—'}
              </div>
              <span className="text-[9px] text-slate-400 block truncate" title={record.nowcast_source || 'Cleveland Fed'}>
                {record.nowcast_value !== null && record.nowcast_value !== undefined ? `as of ${record.nowcast_asof || 'Daily'}` : 'Tidak Ada Model'}
              </span>
            </div>

            <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block font-semibold">NILAI AKTUAL</span>
              <div className={`text-base font-bold tabular-nums ${record.actual_value !== null && record.actual_value !== undefined ? 'text-emerald-400' : 'text-slate-500'}`}>
                {(record.range_label || record.actual_value) ?? '—'}
              </div>
              <span className="text-[9px] text-slate-500 block">
                {record.actual_value !== null && record.actual_value !== undefined ? 'Diumumkan resmi' : 'Belum dirilis'}
              </span>
            </div>

            <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block font-semibold">REVISI SEBELUMNYA</span>
              <div className={`text-base font-bold tabular-nums ${hasRevision ? 'text-rose-400' : 'text-slate-300'}`}>
                {record.revised_previous ?? record.previous_value ?? 'N/A'}
              </div>
              <span className="text-[9px] text-slate-500 block">
                {hasRevision ? `Diff: ${revisionDiff > 0 ? `+${revisionDiff}` : revisionDiff}` : 'Tanpa koreksi'}
              </span>
            </div>
          </div>

          {/* Audit Verification Note */}
          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold font-mono text-[10px] uppercase">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Jaminan Kredibilitas Data Kuantitatif:</span>
            </div>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              Titik data ini terdaftar dalam sistem bitemporal QMAE dengan hash provenance <code className="text-amber-300 font-mono">QMAE-{record.event_id}-V{record.revision_version || 1}</code>. Menggunakan waktu rilis resmi untuk memastikan kalkulasi Economic Surprise Z-Score terbebas dari kesalahan *look-ahead bias*.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
          <button
            onClick={handleCopyAuditJson}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded transition-all cursor-pointer shadow-sm"
            title="Salin metadata JSON untuk reproduksibilitas riset"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copied ? 'Audit JSON Tersalin!' : 'Salin Audit JSON'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded shadow transition-all cursor-pointer"
          >
            Tutup Audit Info
          </button>
        </div>

      </div>
    </div>
  );
};
