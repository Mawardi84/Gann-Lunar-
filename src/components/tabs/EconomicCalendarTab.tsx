import React, { useState, useMemo } from 'react';
import { 
  Calendar, Globe2, Clock, Search, Filter, ShieldCheck, Flame, 
  ExternalLink, Layers, ArrowUpRight, ArrowDownRight, Compass, 
  Sparkles, RefreshCw, BarChart2, Eye, Info, X, Zap 
} from 'lucide-react';
import { MarketState } from '../../hooks/useMarketState';
import { 
  getInitialCalendarEvents, 
  filterEconomicCalendarEvents, 
  getNextUpcomingHighImpactEvent, 
  getEventCountdown, 
  calculateSurprise, 
  fetchLiveNasdaqEconomicEvents,
  EconomicCalendarEvent, 
  EconomicCurrency, 
  EconomicImpact, 
  CalendarFilterOptions 
} from '../../utils/economicCalendar';
import { TradingViewEconomicCalendar } from '../TradingViewEconomicCalendar';
import { NextMacroEventCountdown } from '../NextMacroEventCountdown';

interface EconomicCalendarTabProps {
  state: MarketState;
}

export const EconomicCalendarTab: React.FC<EconomicCalendarTabProps> = ({ state }) => {
  const { livePrice } = state;

  // View modes: 'stream' (TradingView), 'radar' (Interactive list & surprise), 'dual' (Both)
  const [viewMode, setViewMode] = useState<'stream' | 'radar' | 'dual'>('dual');

  // Filter states
  const [selectedCurrency, setSelectedCurrency] = useState<EconomicCurrency | 'ALL'>('ALL');
  const [selectedImpact, setSelectedImpact] = useState<EconomicImpact | 'ALL' | 'HIGH_MEDIUM'>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'TODAY' | 'TOMORROW' | 'THIS_WEEK' | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected event for deep analysis modal
  const [modalEvent, setModalEvent] = useState<EconomicCalendarEvent | null>(null);
  const [simulatedActual, setSimulatedActual] = useState<string>('');

  // All economic events with relative timestamps and live NASDAQ integration
  const [events, setEvents] = useState<EconomicCalendarEvent[]>(() => getInitialCalendarEvents());
  const [isLiveFetching, setIsLiveFetching] = useState<boolean>(false);

  // Fetch real live economic events from NASDAQ endpoint
  const handleFetchLiveEvents = async () => {
    setIsLiveFetching(true);
    try {
      const liveData = await fetchLiveNasdaqEconomicEvents();
      if (liveData.length > 0) {
        setEvents(prev => {
          const combined = [...liveData, ...prev];
          const uniqueMap = new Map<string, EconomicCalendarEvent>();
          for (const item of combined) {
            const key = `${item.title.toLowerCase()}-${item.timestamp.substring(0, 10)}`;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, item);
            }
          }
          return Array.from(uniqueMap.values());
        });
      }
    } catch (e) {
      console.warn('Live events fetch error:', e);
    } finally {
      setIsLiveFetching(false);
    }
  };

  React.useEffect(() => {
    handleFetchLiveEvents();
  }, []);

  // Filtered events
  const filterOptions: CalendarFilterOptions = useMemo(() => ({
    currency: selectedCurrency,
    impact: selectedImpact,
    timeframe: selectedTimeframe,
    searchQuery: searchQuery,
  }), [selectedCurrency, selectedImpact, selectedTimeframe, searchQuery]);

  const filteredEvents = useMemo(() => {
    return filterEconomicCalendarEvents(events, filterOptions);
  }, [events, filterOptions]);

  // Nearest upcoming high-impact event
  const nextHighImpact = useMemo(() => {
    return getNextUpcomingHighImpactEvent(events);
  }, [events]);

  const currencies: { code: EconomicCurrency | 'ALL'; label: string; flag: string }[] = [
    { code: 'ALL', label: 'Semua', flag: '🌐' },
    { code: 'USD', label: 'USD', flag: '🇺🇸' },
    { code: 'EUR', label: 'EUR', flag: '🇪🇺' },
    { code: 'IDR', label: 'IDR', flag: '🇮🇩' },
    { code: 'GBP', label: 'GBP', flag: '🇬🇧' },
    { code: 'JPY', label: 'JPY', flag: '🇯🇵' },
    { code: 'AUD', label: 'AUD', flag: '🇦🇺' },
    { code: 'CNY', label: 'CNY', flag: '🇨🇳' },
  ];

  const handleOpenDetailModal = (event: EconomicCalendarEvent) => {
    setModalEvent(event);
    setSimulatedActual(event.actual !== null && event.actual !== undefined ? String(event.actual) : '');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                REAL-TIME ECONOMIC CALENDAR
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Event Streaming Aktif
              </span>
              <button
                onClick={handleFetchLiveEvents}
                disabled={isLiveFetching}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-full text-[11px] font-mono flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                title="Muat ulang data live rilis bursa NASDAQ global"
              >
                <RefreshCw className={`w-3 h-3 text-emerald-400 ${isLiveFetching ? 'animate-spin' : ''}`} />
                <span>{isLiveFetching ? 'Menyinkronkan...' : 'Refresh Live Bursa'}</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Kalender Ekonomi Real-Time & Volatilitas Pasar
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pantau jadwal rilis data makroekonomi global (FOMC, CPI, NFP, GDP, PMI, BI-Rate) dengan hitung mundur real-time, evaluasi kejutan konsensus, dan panduan mitigasi risiko volatilitas pada siklus Gann Square of 9.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center shrink-0 space-y-1 w-full sm:w-auto">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Spot Gold (XAU/USD)</span>
              <div className="text-xl font-mono font-bold text-emerald-400">${livePrice.toLocaleString()}</div>
              <span className="text-[10px] text-amber-400 font-mono flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Makro & Siklus Sinkron
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Macro Event Live Countdown Banner */}
      {nextHighImpact && (
        <NextMacroEventCountdown 
          event={nextHighImpact} 
          onSelectEvent={handleOpenDetailModal}
        />
      )}

      {/* View Mode Switcher */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Tampilan Kalender</h2>
        </div>

        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-1 text-xs font-mono">
          <button
            onClick={() => setViewMode('dual')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'dual' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dual View (Rekomendasi)</span>
          </button>
          <button
            onClick={() => setViewMode('stream')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'stream' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>TradingView Widget</span>
          </button>
          <button
            onClick={() => setViewMode('radar')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'radar' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Radar Gann & Kejutan</span>
          </button>
        </div>
      </div>

      {/* View 1: TradingView Streaming Widget */}
      {(viewMode === 'stream' || viewMode === 'dual') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Feed TradingView Global
            </h3>
            <span className="text-xs font-mono text-slate-400">Sinkronisasi otomatis detik per detik</span>
          </div>
          <TradingViewEconomicCalendar />
        </div>
      )}

      {/* View 2: Custom Interactive Radar & Surprise Matrix */}
      {(viewMode === 'radar' || viewMode === 'dual') && (
        <div className="space-y-6">
          {/* Filter Bar Controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Currency Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {currencies.map(curr => (
                  <button
                    key={curr.code}
                    onClick={() => setSelectedCurrency(curr.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      selectedCurrency === curr.code
                        ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{curr.flag}</span>
                    <span>{curr.label}</span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari rilis, negara, atau indikator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>

            {/* Sub-Filters: Impact & Timeframe */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Dampak:</span>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setSelectedImpact('ALL')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedImpact === 'ALL' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setSelectedImpact('HIGH')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedImpact === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🔴 Khusus Tinggi
                  </button>
                  <button
                    onClick={() => setSelectedImpact('HIGH_MEDIUM')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedImpact === 'HIGH_MEDIUM' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🟠 Sedang & Tinggi
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Waktu:</span>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setSelectedTimeframe('ALL')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedTimeframe === 'ALL' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setSelectedTimeframe('TODAY')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedTimeframe === 'TODAY' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={() => setSelectedTimeframe('TOMORROW')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedTimeframe === 'TOMORROW' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Besok
                  </button>
                  <button
                    onClick={() => setSelectedTimeframe('THIS_WEEK')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedTimeframe === 'THIS_WEEK' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Minggu Ini
                  </button>
                </div>
              </div>

              <div className="text-slate-400 text-[11px]">
                Menampilkan <strong className="text-white">{filteredEvents.length}</strong> rilis acara
              </div>
            </div>

          </div>

          {/* Events Grid / Card List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map(event => {
              const countdown = getEventCountdown(event.timestamp);
              const surprise = calculateSurprise(event.actual, event.forecast);
              const eventDate = new Date(event.timestamp);

              return (
                <div
                  key={event.id}
                  onClick={() => handleOpenDetailModal(event)}
                  className="group bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 shadow-lg transition-all cursor-pointer space-y-3 relative overflow-hidden"
                >
                  {/* Card Header: Currency, Flag, Impact, Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{event.flag}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800 text-xs font-mono font-bold">
                        {event.currency}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        event.impact === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : (event.impact === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300')
                      }`}>
                        {event.impact === 'HIGH' ? '🔴 TINGGI' : (event.impact === 'MEDIUM' ? '🟠 SEDANG' : '🟡 RENDAH')}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-right">
                      <span className="text-slate-400">
                        {eventDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </span>
                      <span className="text-slate-500 block text-[10px]">
                        {eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Title & Agency */}
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      {event.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                      {event.period} · {event.sourceAgency}
                    </span>
                  </div>

                  {/* Metrics: Actual vs Forecast vs Previous */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/90 p-3 rounded-xl border border-slate-800/80 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Aktual</span>
                      <span className={`font-bold ${event.actual !== null && event.actual !== undefined ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {event.actual !== null && event.actual !== undefined ? `${event.actual} ${event.unit}` : 'Menunggu'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Konsensus</span>
                      <span className="text-amber-300 font-bold">
                        {event.forecast !== null && event.forecast !== undefined ? `${event.forecast} ${event.unit}` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Sebelumnya</span>
                      <span className="text-slate-300 font-bold">
                        {event.previous !== null && event.previous !== undefined ? `${event.previous} ${event.unit}` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Surprise Badge & Countdown Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs font-mono">
                    <div>
                      {surprise.direction === 'BULLISH' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1 text-[10px]">
                          <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                          Kejutan Positif ({surprise.formattedDiff})
                        </span>
                      )}
                      {surprise.direction === 'BEARISH' && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold flex items-center gap-1 text-[10px]">
                          <ArrowDownRight className="w-3 h-3 text-rose-400" />
                          Kejutan Negatif ({surprise.formattedDiff})
                        </span>
                      )}
                      {surprise.direction === 'IN_LINE' && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                          Sesuai Konsensus
                        </span>
                      )}
                      {surprise.direction === 'PENDING' && (
                        <span className="text-slate-500 text-[10px]">
                          {event.historicalVolatilityPips ? `Potensi deviasi ~${event.historicalVolatilityPips} pips` : 'Volatilitas Normal'}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px]">
                      {countdown.isPast ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Dirilis
                        </span>
                      ) : (
                        <span className={`font-bold ${countdown.urgency === 'IMMINENT' ? 'text-rose-400 animate-pulse' : 'text-amber-300'}`}>
                          ⏳ {countdown.formatted}
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
              <Calendar className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">Tidak ada data rilis acara yang cocok</h3>
              <p className="text-xs text-slate-400 font-mono">
                Coba sesuaikan filter mata uang, tingkat dampak, atau kata kunci pencarian Anda.
              </p>
              <button
                onClick={() => {
                  setSelectedCurrency('ALL');
                  setSelectedImpact('ALL');
                  setSelectedTimeframe('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}

        </div>
      )}

      {/* Deep Event Modal: Analysis, Gann Confluence, & Surprise Simulator */}
      {modalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6 my-8">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{modalEvent.flag}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800 text-xs font-mono font-bold">
                    {modalEvent.currency}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    modalEvent.impact === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {modalEvent.impact} IMPACT
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{modalEvent.title}</h3>
                <span className="text-xs text-slate-400 font-mono">{modalEvent.period} · {modalEvent.sourceAgency}</span>
              </div>
              <button
                onClick={() => setModalEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {modalEvent.description}
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Nilai Aktual</span>
                <div className="text-base font-bold text-emerald-400">
                  {modalEvent.actual !== null && modalEvent.actual !== undefined ? `${modalEvent.actual} ${modalEvent.unit}` : 'Belum Dirilis'}
                </div>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Konsensus</span>
                <div className="text-base font-bold text-amber-300">
                  {modalEvent.forecast !== null && modalEvent.forecast !== undefined ? `${modalEvent.forecast} ${modalEvent.unit}` : 'N/A'}
                </div>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px]">Sebelumnya</span>
                <div className="text-base font-bold text-white">
                  {modalEvent.previous !== null && modalEvent.previous !== undefined ? `${modalEvent.previous} ${modalEvent.unit}` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Interactive Surprise Simulator */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Simulasi Kejutan Data Rilis (Economic Surprise)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Uji skenario angka aktual</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="any"
                  placeholder="Masukkan angka aktual..."
                  value={simulatedActual}
                  onChange={(e) => setSimulatedActual(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400 flex-1"
                />
                <button
                  onClick={() => {
                    if (modalEvent.forecast) {
                      setSimulatedActual(String(Number(modalEvent.forecast) + (modalEvent.unit === '%' ? 0.2 : 25)));
                    }
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition-all cursor-pointer"
                >
                  Hawkish +
                </button>
                <button
                  onClick={() => {
                    if (modalEvent.forecast) {
                      setSimulatedActual(String(Number(modalEvent.forecast) - (modalEvent.unit === '%' ? 0.2 : 25)));
                    }
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition-all cursor-pointer"
                >
                  Dovish -
                </button>
              </div>

              {simulatedActual !== '' && (
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                  {(() => {
                    const testSurprise = calculateSurprise(simulatedActual, modalEvent.forecast);
                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Deviasi Kejutan:</span>
                          <span className={`font-bold ${
                            testSurprise.direction === 'BULLISH' ? 'text-emerald-400' : (testSurprise.direction === 'BEARISH' ? 'text-rose-400' : 'text-blue-400')
                          }`}>
                            {testSurprise.formattedDiff} ({testSurprise.pctChange}%)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-sans">{testSurprise.description}</p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Gann Impact Notes */}
            <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl text-xs font-mono space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Korelasi Siklus Gann & Arah Harga (XAU/USD):</span>
              </div>
              <p className="text-slate-300 font-sans text-xs leading-relaxed">
                {modalEvent.gannImpactNotes}
              </p>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setModalEvent(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
