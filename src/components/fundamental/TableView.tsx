import React from 'react';
import { Table, Search, Plus, RotateCcw, ShieldCheck, ExternalLink, Info, X } from 'lucide-react';
import { MacroEventRecord, calculateEconomicSurprise } from '../../utils/fundamental';
import { calculateNowcastMarketBias, CLEVELAND_FED_TOOLTIP, NON_CPI_NOWCAST_NOTICE, getNowcastSparklinePoints } from '../../utils/nowcast';

interface TableViewProps {
  events: MacroEventRecord[];
  filterType: string;
  setFilterType: (t: string) => void;
  tableSearchQuery: string;
  setTableSearchQuery: (q: string) => void;
  openAuditOverlay: (ev: MacroEventRecord, point?: any) => void;
  openAddModal: () => void;
  handleResetToDefault: () => void;
  renderSparklineSvg: (pts: number[]) => React.ReactNode;
}

export const TableView: React.FC<TableViewProps> = ({
  events,
  filterType,
  setFilterType,
  tableSearchQuery,
  setTableSearchQuery,
  openAuditOverlay,
  openAddModal,
  handleResetToDefault,
  renderSparklineSvg,
}) => {
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

  return (
    <div className="space-y-6">
      {/* Hero Banner for Table */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-md p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-md text-xs font-mono font-bold flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-amber-400" />
                TABEL DATA MAKROEKONOMI & AUDIT TRAIL
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-md text-[11px] font-mono flex items-center gap-1.5">
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
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md text-xs font-mono font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rilis</span>
            </button>
            <button
              onClick={handleResetToDefault}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 rounded-md transition-all cursor-pointer"
              title="Reset data ke standar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Controls: Search & Category Filter */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'FOMC', 'NFP', 'CPI', 'PPI'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
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
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono tabular-nums"
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-md shadow-xl overflow-hidden">
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
            <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
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
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
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
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-amber-300 font-bold">
                          {ev.event_type}
                        </span>
                        <span className="text-white font-semibold font-sans">{ev.indicator_name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Periode: <span className="text-slate-300">{ev.reporting_period}</span>
                      </div>
                    </td>

                    {/* Column 1: Previous */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="text-slate-300 font-medium tabular-nums">
                        {ev.previous_value !== null && ev.previous_value !== undefined ? `${ev.previous_value}${ev.unit}` : 'N/A'}
                      </div>
                      {hasRevision ? (
                        <span className="text-[9px] text-rose-400 block font-semibold tabular-nums">
                          Rev: {ev.revised_previous}{ev.unit}
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-500 block">Sama</span>
                      )}
                    </td>

                    {/* Column 2: Forecast */}
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

                    {/* Column 3: Nowcast */}
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
                            <span className="text-[8px] text-slate-500 block italic">Ilustrasi tren, bukan data nowcast historis aktual</span>
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

                    {/* Column 4: Actual */}
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

                    {/* Column 5: Bias / Surprise */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {nowcastBias && nowcastBias.bias !== 'UNKNOWN' && (ev.actual_value === null || ev.actual_value === undefined) ? (
                        <div className="space-y-0.5" title={nowcastBias.detail + '\n' + nowcastBias.disclaimer}>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border inline-block ${nowcastBias.badgeColor}`}>
                            {nowcastBias.label}
                          </span>
                          {nowcastBias.gap !== null && (
                            <span className="text-[9px] text-slate-400 block font-mono tabular-nums">
                              Gap: {nowcastBias.gap > 0 ? `+${nowcastBias.gap.toFixed(2)}` : nowcastBias.gap.toFixed(2)}%
                            </span>
                          )}
                        </div>
                      ) : ev.event_type === 'FOMC' ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          {surprise.discreteAssessment?.includes('In-Line') ? 'In-Line' : 'Surprise'}
                        </span>
                      ) : surprise.zScore !== null ? (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${
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
                        className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 transition-colors mt-0.5 font-mono"
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold transition-all cursor-pointer shadow-sm"
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
  );
};
