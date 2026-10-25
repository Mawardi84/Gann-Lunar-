import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, AlertTriangle, ShieldCheck, Volume2, VolumeX, Flame, 
  ArrowUpRight, ArrowDownRight, Compass, Zap 
} from 'lucide-react';
import { 
  EconomicCalendarEvent, 
  getEventCountdown, 
  getGannVolatilityBlackout, 
  CountdownResult 
} from '../utils/economicCalendar';

interface NextMacroEventCountdownProps {
  event: EconomicCalendarEvent | null;
  onSelectEvent?: (event: EconomicCalendarEvent) => void;
}

export const NextMacroEventCountdown: React.FC<NextMacroEventCountdownProps> = ({
  event,
  onSelectEvent
}) => {
  const [currentMs, setCurrentMs] = useState<number>(Date.now());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const audioPlayedRef = useRef<boolean>(false);

  // Tick every second for true real-time precision
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio API Synthesizer for gentle alert chime
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.15); // A5

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  if (!event) {
    return null;
  }

  const countdown: CountdownResult = getEventCountdown(event.timestamp, currentMs);
  const blackout = getGannVolatilityBlackout(event.timestamp, currentMs, 30);

  // Trigger audio alert when entering imminent state (<15m) if sound enabled
  if (soundEnabled && countdown.urgency === 'IMMINENT' && !audioPlayedRef.current && !countdown.isPast) {
    playAlertChime();
    audioPlayedRef.current = true;
  }

  // Format current UTC and WIB time
  const utcString = new Date(currentMs).toISOString().substring(11, 19) + ' UTC';
  const wibDate = new Date(currentMs + 7 * 60 * 60 * 1000);
  const wibString = wibDate.toISOString().substring(11, 19) + ' WIB';

  return (
    <div className={`bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border rounded-md p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-all ${
      countdown.urgency === 'IMMINENT' ? 'border-2 border-rose-500 animate-urgent-pulse' : 'border-amber-500/30'
    }`}>
      {/* Background ambient glow */}
      <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        countdown.urgency === 'IMMINENT' ? 'bg-rose-500/15' : 'bg-amber-500/10'
      }`} />

      <div className="relative z-10 space-y-5">
        {/* Top Status Bar: Clock + Live Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              RILIS TIER-1 TERDEKAT
            </span>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{wibString}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">{utcString}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                if (nextState) playAlertChime();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' 
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
              title={soundEnabled ? 'Alarm suara aktif (<15m)' : 'Aktifkan alarm suara (<15m)'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'Alarm Aktif' : 'Alarm Senyap'}</span>
            </button>
          </div>
        </div>

        {/* Main Countdown & Event Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Info Column */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{event.flag}</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800 text-xs font-mono font-bold">
                {event.currency}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                HIGH IMPACT
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {event.sourceAgency}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {event.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
              {event.description}
            </p>

            {/* Quick Metrics Bar: Konsensus vs Sebelumnya */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
              <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Konsensus Pasar</span>
                <span className="text-amber-300 font-bold">{event.forecast ?? 'N/A'} {event.unit}</span>
              </div>
              <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Sebelumnya</span>
                <span className="text-white font-bold">{event.previous ?? 'N/A'} {event.unit}</span>
              </div>
              {event.historicalVolatilityPips && (
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Historis Deviasi Volatilitas</span>
                  <span className="text-rose-400 font-bold">±{event.historicalVolatilityPips} pips/pts</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Countdown Digital Display */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-md bg-slate-950/90 border border-slate-800 shadow-inner space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Hitung Mundur Waktu Rilis
            </span>

            {/* High-visibility Digital Ticker */}
            <div className={`font-mono font-black text-3xl sm:text-4xl tracking-wider transition-colors ${
              countdown.isPast 
                ? 'text-emerald-400' 
                : (countdown.urgency === 'IMMINENT' ? 'text-rose-400 animate-pulse' : 'text-amber-300')
            }`}>
              {countdown.formatted}
            </div>

            <div className="text-[11px] font-mono text-center">
              {countdown.isPast ? (
                <span className="text-emerald-400 font-bold">Data resmi telah dirilis. Simak kejutan deviasi aktual di bawah.</span>
              ) : countdown.urgency === 'IMMINENT' ? (
                <span className="text-rose-400 font-bold">Waspada! Rilis dalam waktu kurang dari 15 menit.</span>
              ) : (
                <span className="text-slate-400">Jadwal: {new Date(event.timestamp).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</span>
              )}
            </div>
          </div>

        </div>

        {/* Gann Confluence & Volatility Advisory Banner */}
        <div className={`p-3.5 rounded-md border text-xs font-mono flex items-start gap-3 transition-colors ${
          blackout.isInWindow 
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200' 
            : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
        }`}>
          <Compass className={`w-4 h-4 shrink-0 mt-0.5 ${blackout.isInWindow ? 'text-rose-400' : 'text-amber-400'}`} />
          <div className="space-y-1">
            <div className="font-bold flex items-center gap-2">
              <span>Gann 4D Volatility Advisory:</span>
              <span className={`px-2 py-0.2 rounded text-[10px] font-extrabold ${
                blackout.isInWindow ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {blackout.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              {blackout.recommendation} — {event.gannImpactNotes}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
