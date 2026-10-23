import React, { useState, useEffect, useMemo } from 'react';
import { Flame, Clock, Radio, Zap } from 'lucide-react';
import { 
  getInitialCalendarEvents,
  getNextUpcomingHighImpactEvent, 
  getEventCountdown, 
  CountdownResult 
} from '../utils/economicCalendar';

interface StatusBarProps {
  priceSource: 'live' | 'fallback';
  activeTab: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ priceSource, activeTab }) => {
  const [currentMs, setCurrentMs] = useState<number>(Date.now());

  // Tick every second for the real-time clock and event countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const now = new Date(currentMs);
  const timeString = now.toLocaleTimeString('id-ID', { hour12: false });
  const utcString = now.toISOString().substring(11, 19) + ' UTC';

  // Get next upcoming high impact event
  const calendarEvents = useMemo(() => getInitialCalendarEvents(), []);
  const nextEvent = getNextUpcomingHighImpactEvent(calendarEvents, currentMs);
  const countdown: CountdownResult | null = nextEvent 
    ? getEventCountdown(nextEvent.timestamp, currentMs)
    : null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800/80 text-[11px] font-mono px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 text-slate-300 backdrop-blur-md shadow-2xl select-none">
      {/* Left: Real-time Digital Clock & Timezone */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-white font-bold tabular-nums">{timeString} WIB</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 tabular-nums">{utcString}</span>
        </div>
        
        {/* Active Tab Indicator */}
        <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-amber-300 uppercase font-semibold">
          MODE: {activeTab}
        </span>
      </div>

      {/* Center: Next Macro Event Summary (Single line) */}
      {nextEvent && countdown ? (
        <div className="flex items-center gap-2 overflow-hidden truncate max-w-xl">
          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase flex items-center gap-1 ${
            countdown.urgency === 'IMMINENT' 
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' 
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            <Flame className="w-3 h-3 text-rose-400" />
            <span>NEXT TIER-1</span>
          </span>
          <span className="text-white font-semibold truncate">
            {nextEvent.flag} {nextEvent.title}:
          </span>
          <span className={`font-bold tabular-nums ${
            countdown.isPast 
              ? 'text-emerald-400' 
              : (countdown.urgency === 'IMMINENT' ? 'text-rose-400 animate-pulse' : 'text-amber-300')
          }`}>
            {countdown.formatted}
          </span>
        </div>
      ) : (
        <div className="hidden sm:flex items-center gap-1 text-slate-500 text-[10px]">
          <span>Gann 4D Engine Active</span>
        </div>
      )}

      {/* Right: Live Connection Status Indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wider uppercase transition-all ${
          priceSource === 'live'
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priceSource === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <Radio className="w-3 h-3 text-current" />
          <span>{priceSource === 'live' ? 'LIVE FEED (0ms)' : 'FALLBACK DATA'}</span>
        </div>
      </div>
    </div>
  );
};
