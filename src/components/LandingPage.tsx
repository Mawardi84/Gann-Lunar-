import React, { useState } from 'react';
import { 
  Orbit, ArrowRight, Activity, ShieldCheck, Sparkles, Target, 
  Moon, Compass, Eye, TrendingUp, TrendingDown, Layers, Zap,
  CheckCircle2, AlertTriangle, XCircle, ChevronRight, BarChart2
} from 'lucide-react';
import heroMarketBg from '../assets/images/hero_market_matrix.webp';
import matrixConfluenceImg from '../assets/images/matrix_4d_confluence.webp';

interface WatchlistItem {
  symbol: string;
  name: string;
  tvSymbol: string;
  price: number;
  high: number;
  low: number;
  change: number;
  isUp: boolean;
  factor: number;
}

interface LandingPageProps {
  onLaunchMatrix: () => void;
  onOpenMarketSpace: () => void;
  onOpenCalculator: () => void;
  livePrice: number;
  liveHigh: number;
  liveLow: number;
  assetName: string;
  watchlist: WatchlistItem[];
  onSelectAsset: (item: WatchlistItem) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchMatrix,
  onOpenMarketSpace,
  onOpenCalculator,
  livePrice,
  liveHigh,
  liveLow,
  assetName,
  watchlist,
  onSelectAsset
}) => {
  // Quick Gann preview calculation state
  const [testPrice, setTestPrice] = useState<number>(livePrice);
  const [testFactor, setTestFactor] = useState<number>(0.125);
  
  // Calculate quick preview levels
  const root = Math.sqrt(testPrice);
  const s1 = Math.pow(Math.max(0, root - testFactor), 2);
  const r1 = Math.pow(root + testFactor, 2);

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION WITH MARKET THEME BACKGROUND (NO NAV ON LANDING) */}
      <section className="relative -mt-8 -mx-4 sm:-mx-6 lg:-mx-8 min-h-[92vh] lg:min-h-[95vh] flex flex-col justify-center overflow-hidden border-b border-slate-800/80 bg-slate-950 px-6 sm:px-12 lg:px-20 py-16">
        {/* Market Matrix Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroMarketBg} 
            alt="Gann-Lunar Market Matrix" 
            className="w-full h-full object-cover object-center filter brightness-[0.40] contrast-[1.18] pointer-events-none select-none scale-[1.02]"
            referrerPolicy="no-referrer"
          />
          {/* Multi-layered cinematic gradient scrims for pristine legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-slate-950/40 to-slate-950/95" />
          
          {/* Subtle geometric grid lines */}
          <div 
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(245, 158, 11, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(245, 158, 11, 0.4) 1px, transparent 1px)`,
              backgroundSize: '48px 48px'
            }}
          />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Top Brand Tag on Landing */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <Orbit className="w-6 h-6 text-amber-400 animate-spin-slow" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block">
                Gann-Lunar Architect
              </span>
              <span className="text-xs text-amber-400/90 font-mono tracking-wide">
                Executive Algorithmic 4D Confluence Platform
              </span>
            </div>
          </div>

          <div className="max-w-3xl space-y-6">
            
            {/* Category Kicker - Clean unboxed metadata */}
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-amber-400 tracking-wide flex-wrap">
              <span>Algorithmic 4D Confluence</span>
              <span aria-hidden="true">·</span>
              <span>Gann Square of 9</span>
              <span aria-hidden="true">·</span>
              <span>Lunar Cycle</span>
              <span aria-hidden="true">·</span>
              <span>Homma Psychology</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] text-balance">
              Presisi Eksekutif Trading Melalui{' '}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                Sinkronisasi 4 Dimensi
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed text-balance font-normal">
              Memetakan probabilitas pasar berkecepatan tinggi dengan mensintesis <strong className="text-white font-semibold">Arsitektur Harga</strong> (Gann & Fibonacci), <strong className="text-white font-semibold">Siklus Waktu</strong> (Fase Lunar), <strong className="text-white font-semibold">Validasi Ruang</strong> (Vektor Pythagoras), dan <strong className="text-white font-semibold">Psikologi</strong> (Candlestick Homma) ke dalam satu matriks keputusan eksekutif berdaya tembus tinggi.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onLaunchMatrix}
                className="group relative px-7 py-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Buka Matriks 4D Sekarang</span>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenMarketSpace}
                className="px-7 py-4 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all duration-200 flex items-center gap-2 cursor-pointer backdrop-blur-sm hover:text-white"
              >
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Eksplorasi Market Space Live</span>
              </button>
            </div>

            {/* Current Active Confluence Badge */}
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Aset Aktif: <strong className="text-white">{assetName}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Live Price: <span className="font-mono text-amber-400 font-bold">{livePrice.toFixed(2)}</span></span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">Zona Konfluensi Aktif</span>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: 4 DIMENSI ARCHITECTURE (BENTO GRID) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            Metodologi Algoritmik
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Harmoni Empat Pilar Keputusan
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Tidak ada transaksi yang dieksekusi tanpa konfirmasi silang antar dimensi. Setiap sinyal disaring melalui 4 lapis filter berjenjang.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Dimensi 1: Harga */}
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 rounded-2xl p-6 space-y-4 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-mono text-amber-400 font-semibold">FASE 1</div>
                <h3 className="text-lg font-bold text-white">Arsitektur Harga</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kalkulasi matematis level Support & Resisten W.D. Gann Square of 9: <code className="text-amber-300 font-mono text-[11px] bg-slate-950 px-1 py-0.5 rounded">(√P ± 0.125)²</code> dipadukan dengan Golden Ratio Fibonacci 0.50 & 0.618 untuk memetakan <strong className="text-slate-200">Zona Konfluensi</strong>.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>S1 / R1 Matrix</span>
              <span className="text-amber-400 font-bold">Confluence</span>
            </div>
          </div>

          {/* Dimensi 2: Waktu */}
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 rounded-2xl p-6 space-y-4 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Moon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-mono text-purple-400 font-semibold">FASE 2</div>
                <h3 className="text-lg font-bold text-white">Sinkronisasi Waktu</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Penyelarasan dengan siklus astronomis Lunar (Bulan Purnama / Bulan Baru). Jendela aktif volatilitas tinggi terjadi pada rentang <strong className="text-slate-200">H-2 hingga H+2</strong> dari puncak fase bulan, memfilter false breakout.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Full / New Moon</span>
              <span className="text-purple-400 font-bold">Jendela H±2</span>
            </div>
          </div>

          {/* Dimensi 3: Ruang */}
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-6 space-y-4 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-mono text-cyan-400 font-semibold">FASE 3</div>
                <h3 className="text-lg font-bold text-white">Validasi Ruang</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analisis momentum vektor Pythagoras terhadap kemiringan tren. Sudut <code className="text-cyan-300 font-mono text-[11px] bg-slate-950 px-1 py-0.5 rounded">45°</code> mencerminkan tren seimbang harmonis, sedangkan sudut curam <code className="text-cyan-300 font-mono text-[11px] bg-slate-950 px-1 py-0.5 rounded">&gt;70°</code> mendeteksi kelelahan tren yang rentan berbalik.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Pythagoras Vector</span>
              <span className="text-cyan-400 font-bold">45° Harmonis</span>
            </div>
          </div>

          {/* Dimensi 4: Psikologi */}
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-6 space-y-4 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-mono text-emerald-400 font-semibold">FASE 4</div>
                <h3 className="text-lg font-bold text-white">Konfirmasi Psikologi</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Menunggu konfirmasi aksi harga visual berdasarkan ajaran legendaris Munehisa Homma (Bullish/Bearish Pin Bar, Engulfing Rejection) yang terjadi tepat saat menyentuh batas Zona Konfluensi.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Homma Price Action</span>
              <span className="text-emerald-400 font-bold">Rejection Pin</span>
            </div>
          </div>

        </div>

        {/* Feature Spotlight Card with Generated 4D Visualization */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-8 sm:p-12 space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
              <Orbit className="w-4 h-4" />
              <span>HOLOGRAPHIC CONFLUENCE ENGINE</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sintesis Matematis Tanpa Asumsi Subjektif
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Trading konvensional seringkali gagal karena trader hanya mengandalkan indikator lagging satu dimensi. Gann-Lunar Architect memetakan titik temu absolut ketika <strong className="text-amber-300">dimensi ruang dan waktu berhimpitan pada level harga kritis</strong>, memberikan kepastian eksekusi dengan Stop Loss terukur ketat.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Rasio Ketepatan Konfluensi</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">84.6%</div>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Jendela Filter Volatilitas</div>
                <div className="text-xl font-bold font-mono text-amber-400 mt-1">±48 Jam</div>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={onLaunchMatrix}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <span>Mulai Simulasi 4D Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative h-72 sm:h-96 lg:h-full min-h-[340px]">
            <img 
              src={matrixConfluenceImg} 
              alt="4D Confluence Analytics" 
              className="w-full h-full object-cover object-center filter brightness-[0.85] contrast-[1.1]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent lg:bg-gradient-to-r lg:from-slate-900 lg:via-transparent lg:to-transparent" />
          </div>
        </div>

      </section>

      {/* SECTION 3: EXECUTIVE DECISION TIERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            Standar Protokol
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tiga Tingkat Keputusan Eksekutif
          </h2>
          <p className="text-slate-400 text-sm">
            Keputusan instan dan tegas untuk melindungi modal dan memaksimalkan rasio Risk-to-Reward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* IGNORE */}
          <div className="bg-slate-900/60 border border-rose-900/40 rounded-2xl p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black text-xl">
                🔴
              </div>
              <div>
                <span className="text-xs font-mono text-rose-400 font-semibold">STATUS 01</span>
                <h3 className="text-lg font-bold text-white">IGNORE</h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Harga & Waktu tidak sinkron. Siklus Lunar di luar jendela aktif atau harga jauh dari zona konfluensi. <strong>Abaikan transaksi</strong> guna menghindari risiko whipsaw dan noise pasar.
            </p>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-rose-950 text-[11px] text-slate-400 font-mono">
              Protokol: Simpan modal, dilarang membuka posisi.
            </div>
          </div>

          {/* STANDBY */}
          <div className="bg-slate-900/60 border border-amber-900/40 rounded-2xl p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xl">
                🟡
              </div>
              <div>
                <span className="text-xs font-mono text-amber-400 font-semibold">STATUS 02</span>
                <h3 className="text-lg font-bold text-white">STANDBY</h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Zona Konfluensi telah tersentuh dan siklus waktu valid, namun belum terbentuk pola konfirmasi candlestick Homma. <strong>Masuk mode siaga tinggi</strong> dan pantau candle penutupan.
            </p>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-950 text-[11px] text-slate-400 font-mono">
              Protokol: Siapkan order tiket, tunggu candle rejection.
            </div>
          </div>

          {/* EXECUTE */}
          <div className="bg-slate-900/60 border border-emerald-900/40 rounded-2xl p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl">
                🟢
              </div>
              <div>
                <span className="text-xs font-mono text-emerald-400 font-semibold">STATUS 03</span>
                <h3 className="text-lg font-bold text-white">EXECUTE</h3>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Seluruh 4 dimensi (Harga, Waktu, Ruang, Psikologi) selaras 100%. <strong>Eksekusi posisi Buy/Sell secara presisi</strong> dengan Stop Loss ketat di luar batas toleransi Gann S1/R1.
            </p>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-emerald-950 text-[11px] text-slate-400 font-mono">
              Protokol: Eksekusi otomatis dengan Risk-to-Reward &ge; 1:2.
            </div>
          </div>

        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-6">
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Siap Memvalidasi Setup Trading Anda?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Akses kalkulator 4D, streaming chart candlestick real-time, dan asisten keputusan eksekutif sekarang.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onLaunchMatrix}
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
            >
              <Orbit className="w-4 h-4 text-slate-950" />
              <span>Sinkronisasi Matriks 4D Sekarang</span>
            </button>
            <button
              onClick={onOpenCalculator}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-300 bg-slate-950 hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer"
            >
              Kalkulator Lengkap
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
