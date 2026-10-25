import React from 'react';
import { BarChart2 } from 'lucide-react';
import { MacroEventRecord } from '../../utils/fundamental';

interface StatsViewProps {
  events: MacroEventRecord[];
}

export const StatsView: React.FC<StatsViewProps> = ({ events }) => {
  const verifiedEvents = events.filter(e => e.actual_value !== null && e.actual_value !== undefined);
  const pendingEvents = events.filter(e => e.actual_value === null || e.actual_value === undefined);
  const cpiPairs = events.filter(e => e.event_type === 'CPI' && e.actual_value !== null && e.actual_value !== undefined && e.nowcast_value !== null && e.nowcast_value !== undefined);
  const errors = cpiPairs.map(e => Math.abs((e.nowcast_value as number) - (e.actual_value as number)));
  const mae = errors.length > 0 ? (errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(4) : 'N/A';

  return (
    <div className="space-y-6 font-mono tabular-nums">
      {/* Hero Banner for Stats */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-md p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <span className="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-md text-xs font-mono font-bold inline-flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
            QMAE STATISTICAL MACRO ANALYTICS & ERROR METRICS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Analisis Statistik Nowcast vs Actual (MAE & Korelasi)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
            Evaluasi performa akurasi estimasi Nowcast Cleveland Fed dibandingkan dengan rilis Actual resmi. Mematuhi aturan pembersihan data (null handling) di mana rilis yang belum terjadi dipisahkan secara ketat untuk menghindari bias.
          </p>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono tabular-nums">
        <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 space-y-1 shadow-lg">
          <span className="text-slate-400 text-[10px] uppercase">Total Event Makro</span>
          <div className="text-2xl font-bold text-white">{events.length}</div>
          <span className="text-[10px] text-slate-500">Database tersimpan</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 space-y-1 shadow-lg">
          <span className="text-slate-400 text-[10px] uppercase">Rilis Aktual Terverifikasi</span>
          <div className="text-2xl font-bold text-emerald-400">{verifiedEvents.length}</div>
          <span className="text-[10px] text-emerald-500/80">Data historis resmi</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 space-y-1 shadow-lg">
          <span className="text-slate-400 text-[10px] uppercase">Pending (Protected Nulls)</span>
          <div className="text-2xl font-bold text-amber-400">{pendingEvents.length}</div>
          <span className="text-[10px] text-amber-500/80">Menunggu rilis resmi</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-md p-4 space-y-1 shadow-lg">
          <span className="text-slate-400 text-[10px] uppercase">Mean Absolute Error (MAE)</span>
          <div className="text-2xl font-bold text-sky-400">{mae}%</div>
          <span className="text-[10px] text-sky-500/80">Nowcast vs Actual (CPI)</span>
        </div>
      </div>

      {/* Detailed CPI Comparison Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-md shadow-xl overflow-hidden p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Perbandingan Detail CPI: Nowcast vs Consensus vs Actual
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase">
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
  );
};
