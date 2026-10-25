/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { 
  Orbit, Sparkles, ArrowRight, BookOpen, Calculator, BarChart3, 
  Layers, Target, Gauge, Newspaper, CandlestickChart, History, 
  FastForward, Rewind, Pin, PinOff, Eye, EyeOff, Building2, Calendar 
} from 'lucide-react';

import { useMarketState } from './hooks/useMarketState';
import { LandingPage } from './components/LandingPage';
import { StatusBar } from './components/StatusBar';
import { WatchlistRail } from './components/WatchlistRail';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

const OracleTab = lazy(() => import('./components/tabs/OracleTab').then(m => ({ default: m.OracleTab })));
const DashboardTab = lazy(() => import('./components/tabs/DashboardTab').then(m => ({ default: m.DashboardTab })));
const IndicatorsTab = lazy(() => import('./components/tabs/IndicatorsTab').then(m => ({ default: m.IndicatorsTab })));
const CalculatorTab = lazy(() => import('./components/tabs/CalculatorTab').then(m => ({ default: m.CalculatorTab })));
const SignalTab = lazy(() => import('./components/tabs/SignalTab').then(m => ({ default: m.SignalTab })));
const ChartTab = lazy(() => import('./components/tabs/ChartTab').then(m => ({ default: m.ChartTab })));
const BacktestTab = lazy(() => import('./components/tabs/BacktestTab').then(m => ({ default: m.BacktestTab })));
const JournalTab = lazy(() => import('./components/tabs/JournalTab').then(m => ({ default: m.JournalTab })));
const FundamentalTab = lazy(() => import('./components/tabs/FundamentalTab').then(m => ({ default: m.FundamentalTab })));
const EconomicCalendarTab = lazy(() => import('./components/tabs/EconomicCalendarTab').then(m => ({ default: m.EconomicCalendarTab })));

export default function App() {
  const state = useMarketState();
  const {
    activeTab,
    setActiveTab,
    watchlist,
    isNewsTickerVisible,
    setIsNewsTickerVisible,
    newsTickerSpeed,
    setNewsTickerSpeed,
    isNewsTickerPinned,
    setIsNewsTickerPinned,
    journalEntries,
    technicalMetrics,
    priceSource,
  } = state;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar with Aesthetic Hover Effects & 3-Zone Contract (Hidden on Landing Page) */}
      {activeTab !== 'landing' && (
        <header className="flex items-center justify-between gap-6 px-6 lg:px-12 py-3.5 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-50">
          {/* Zone 1: Minimalist Brand Wordmark */}
          <button 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 group text-left cursor-pointer transition-transform duration-200 active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 group-hover:border-amber-500/60 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all duration-300">
              <Orbit className="w-5 h-5 text-amber-400 group-hover:rotate-90 transition-transform duration-700 ease-out" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap group-hover:text-amber-300 transition-colors">
                Gann-Lunar Architect
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${priceSource === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span>{priceSource === 'live' ? 'Algorithmic 4D Engine' : 'Engine (Fallback Mode)'}</span>
              </div>
            </div>
          </button>

          {/* Zone 2: Navigation Links with Sleek Hover Micro-Interactions */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-md border border-slate-800/80 backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('landing')}
              className={`relative group px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                (activeTab as string) === 'landing'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <span>Beranda</span>
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('oracle')}
              className={`relative group px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'oracle'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>4D Architect</span>
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`relative group px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
              <span>Market Space</span>
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('fundamental')}
              className={`relative group px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'fundamental'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Fundamental</span>
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('calendar')}
              className={`relative group px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'calendar'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>Kalender</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold">
                LIVE
              </span>
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('indicators')}
              className={`relative group px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'indicators'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-45 transition-transform" />
              <span>Indikator</span>
              {technicalMetrics.isCollectingData && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('signal')}
              className={`relative group px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'signal'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>Sinyal</span>
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('chart')}
              className={`relative group px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'chart'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Chart</span>
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('calculator')}
              className={`relative group px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Kalkulator</span>
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('journal')}
              className={`relative group px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'journal'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
              <span>Journal</span>
              {journalEntries.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold">
                  {journalEntries.length}
                </span>
              )}
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>

            <button 
              onClick={() => setActiveTab('backtest')}
              className={`relative group px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'backtest'
                  ? 'bg-slate-800 text-amber-300 shadow-sm border border-slate-700/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:shadow-[0_0_15px_rgba(245,158,11,0.12)] border border-transparent'
              }`}
            >
              <History className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Backtest</span>
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out pointer-events-none" />
            </button>
          </nav>

          {/* Zone 3: Primary Action & PWA Install */}
          <div className="flex items-center gap-2.5 shrink-0">
            <PWAInstallButton />
            <button
              onClick={() => setActiveTab('oracle')}
              className="group relative flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-md hover:shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 whitespace-nowrap cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>Buka Matriks 4D</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </header>
      )}

      {/* Running Market Ticker on Top (Dashboard / Non-Landing) */}
      {activeTab !== 'landing' && (
        <div className="bg-slate-950 border-b border-slate-800/80 sticky top-0 z-40">
          <div className="bg-slate-950/95 border-b border-slate-900 px-4 py-2 flex items-center gap-4 overflow-hidden text-xs font-mono">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold shrink-0 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 z-10">
              <span className={`w-2 h-2 rounded-full ${priceSource === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>BURSA LIVE</span>
              {priceSource === 'fallback' && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  FALLBACK
                </span>
              )}
            </div>
            {/* Animasi running text */}
            <div className="flex overflow-hidden relative">
              <div className="flex items-center gap-12 animate-marquee-slow whitespace-nowrap">
                {[...watchlist, ...watchlist].map((item, index) => {
                  let flashBg = '';
                  if (item.flash === 'up') flashBg = 'animate-flash-up';
                  if (item.flash === 'down') flashBg = 'animate-flash-down';

                  return (
                    <div key={`${item.symbol}-${index}`} className={`flex items-center gap-2 px-1.5 py-0.5 rounded ${flashBg}`}>
                      <span className="font-semibold text-white font-mono">{item.symbol}</span>
                      <span className="text-slate-200 font-mono tabular-nums">${item.price.toFixed(item.price > 100 ? 2 : 4)}</span>
                      <span className={`font-mono tabular-nums ${item.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.isUp ? '+' : ''}{item.change.toFixed(2)}%
                      </span>
                      {item.source === 'fallback' && (
                        <span className="text-[8px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold">
                          FB
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating News Ticker */}
      {isNewsTickerVisible && activeTab !== 'landing' && (
        <div className={`${isNewsTickerPinned ? 'fixed bottom-4 left-4 right-4' : 'relative mt-4 mx-4'} z-50 bg-slate-900/90 border border-slate-700/50 rounded-md px-4 py-2 flex items-center gap-3 text-xs font-mono text-slate-200 shadow-2xl backdrop-blur-md transition-all`}>
          <div className="flex items-center gap-1.5 text-blue-400 font-bold shrink-0 bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800">
            <Newspaper className="w-3 h-3 text-blue-400" />
            <span>MARKET NEWS</span>
          </div>
          <div className="flex overflow-hidden w-full">
            <div className="animate-marquee-slow whitespace-nowrap" style={{ animationDuration: `${newsTickerSpeed}s` }}>
              <span className="text-amber-300 font-semibold mx-4">[LUNAR ALIGNED]:</span> Siklus Full Moon H-1 mengonfirmasi volatilitas tinggi pada komoditas XAU/USD dan crypto major. Zona konfluensi Gann Square of 9 diuji pada level 4,148.74.
              <span className="mx-8">|</span>
              <span className="text-amber-300 font-semibold">[MARKET ALERT]:</span> S&P 500 menunjukkan kelelahan tren pada sudut 72°. Waspadai potensi koreksi tajam.
              <span className="mx-8">|</span>
              <span className="text-amber-300 font-semibold">[PSYCHOLOGY]:</span> Engulfing Bearish terdeteksi di chart 4 jam. Standby untuk konfirmasi posisi Short.
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-1 border-l border-slate-700 pl-3 ml-2 shrink-0">
             <button onClick={() => setNewsTickerSpeed(prev => Math.max(20, prev - 20))} className="p-1 hover:text-white text-slate-400" title="Faster">
               <FastForward className="w-3.5 h-3.5" />
             </button>
             <button onClick={() => setNewsTickerSpeed(prev => Math.min(120, prev + 20))} className="p-1 hover:text-white text-slate-400" title="Slower">
               <Rewind className="w-3.5 h-3.5" />
             </button>
             <button onClick={() => setIsNewsTickerPinned(!isNewsTickerPinned)} className="p-1 hover:text-white text-slate-400" title="Pin/Unpin">
               {isNewsTickerPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
             </button>
             <button onClick={() => setIsNewsTickerVisible(false)} className="p-1 hover:text-white text-slate-400" title="Close">
               <EyeOff className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>
      )}

      {!isNewsTickerVisible && activeTab !== 'landing' && (
        <button 
           onClick={() => setIsNewsTickerVisible(true)}
           className="fixed bottom-4 right-4 z-50 p-2 bg-slate-900 border border-slate-700 rounded-full text-blue-400 hover:text-white shadow-lg"
           title="Show News Ticker"
        >
          <Eye className="w-5 h-5" />
        </button>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Tab Switcher */}
        {activeTab !== 'landing' && (
          <div className="flex lg:hidden bg-slate-900/90 p-1.5 rounded-md mb-6 border border-slate-800 text-[11px] overflow-x-auto gap-1">
            <button onClick={() => setActiveTab('landing')} className="px-3 py-1.5 rounded-md text-slate-300 font-medium shrink-0">Beranda</button>
            <button onClick={() => setActiveTab('oracle')} className={`px-3 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'oracle' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>4D Architect</button>
            <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Market Space</button>
            <button onClick={() => setActiveTab('fundamental')} className={`px-3 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'fundamental' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Fundamental</button>
            <button onClick={() => setActiveTab('calendar')} className={`px-3 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'calendar' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Kalender</button>
            <button onClick={() => setActiveTab('indicators')} className={`px-3 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'indicators' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Indikator</button>
            <button onClick={() => setActiveTab('signal')} className={`px-3 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'signal' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Sinyal</button>
            <button onClick={() => setActiveTab('chart')} className={`px-3 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'chart' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Chart</button>
            <button onClick={() => setActiveTab('calculator')} className={`px-3 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'calculator' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Kalkulator</button>
            <button onClick={() => setActiveTab('journal')} className={`px-3 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'journal' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Journal ({journalEntries.length})</button>
            <button onClick={() => setActiveTab('backtest')} className={`px-3 py-1.5 rounded-md shrink-0 font-medium ${activeTab === 'backtest' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Backtest</button>
          </div>
        )}

        {/* Tab Views with Suspense */}
        <Suspense fallback={
          <div className="flex items-center justify-center py-24 text-slate-400 font-mono text-sm animate-pulse">
            Memuat modul fundamental makro...
          </div>
        }>
          {activeTab === 'landing' && (
            <LandingPage 
              onLaunchMatrix={() => setActiveTab('oracle')}
              onOpenMarketSpace={() => setActiveTab('dashboard')}
              onOpenCalculator={() => setActiveTab('calculator')}
              livePrice={state.livePrice}
              liveHigh={state.liveHigh}
              liveLow={state.liveLow}
              assetName={state.assetName}
              watchlist={state.watchlist}
              onSelectAsset={state.handleSelectWatchlistAsset}
            />
          )}

          {activeTab === 'oracle' && (
            <OracleTab state={state} />
          )}

          {activeTab === 'dashboard' && (
            <DashboardTab state={state} />
          )}

          {activeTab === 'fundamental' && (
            <FundamentalTab state={state} />
          )}

          {activeTab === 'calendar' && (
            <EconomicCalendarTab state={state} />
          )}

          {activeTab === 'indicators' && (
            <IndicatorsTab state={state} />
          )}

          {activeTab === 'signal' && (
            <SignalTab state={state} />
          )}

          {activeTab === 'chart' && (
            <ChartTab state={state} />
          )}

          {activeTab === 'calculator' && (
            <CalculatorTab state={state} />
          )}

          {activeTab === 'journal' && (
            <JournalTab state={state} />
          )}

          {activeTab === 'backtest' && (
            <BacktestTab state={state} />
          )}
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md mt-16">
        {activeTab !== 'landing' && (
          <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-1.5 flex items-center gap-3 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold shrink-0 bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800">
              <Newspaper className="w-3 h-3 text-blue-400" />
              <span>MARKET NEWS</span>
            </div>
            <div className="truncate text-slate-300">
              <span className="text-amber-300 font-semibold">[LUNAR ALIGNED]:</span> Siklus Full Moon H-1 mengonfirmasi volatilitas tinggi pada komoditas XAU/USD dan crypto major. Zona konfluensi Gann Square of 9 diuji pada level 4,148.74.
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <Orbit className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white tracking-tight">Gann-Lunar Architect</span>
            <span className="text-slate-600">·</span>
            <span>Algorithmic 4D Confluence Execution System</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <button onClick={() => setActiveTab('landing')} className="hover:text-amber-300 transition-colors cursor-pointer">Beranda</button>
            <button onClick={() => setActiveTab('oracle')} className="hover:text-amber-300 transition-colors cursor-pointer">4D Architect</button>
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-amber-300 transition-colors cursor-pointer">Market Space</button>
            <button onClick={() => setActiveTab('fundamental')} className="hover:text-amber-300 transition-colors cursor-pointer">Fundamental</button>
            <button onClick={() => setActiveTab('calendar')} className="hover:text-amber-300 transition-colors cursor-pointer">Kalender</button>
            <button onClick={() => setActiveTab('indicators')} className="hover:text-amber-300 transition-colors cursor-pointer">Indikator</button>
            <button onClick={() => setActiveTab('signal')} className="hover:text-amber-300 transition-colors cursor-pointer">Sinyal</button>
            <button onClick={() => setActiveTab('calculator')} className="hover:text-amber-300 transition-colors cursor-pointer">Kalkulator Gann</button>
            <button onClick={() => setActiveTab('journal')} className="hover:text-amber-300 transition-colors cursor-pointer">Journal</button>
            <button onClick={() => setActiveTab('backtest')} className="hover:text-amber-300 transition-colors cursor-pointer">Backtest</button>
          </div>
          <p className="text-slate-500 font-mono text-[11px]">© 2026 Gann-Lunar Architect. Presisi 4 Dimensi Pasar.</p>
        </div>
      </footer>

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Persistent Status Bar Fixed at Bottom */}
      <StatusBar priceSource={priceSource} activeTab={activeTab} />
    </div>
  );
}
