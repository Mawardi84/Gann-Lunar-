import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Search, Zap } from 'lucide-react';
import { WatchlistItem } from '../hooks/useMarketState';

interface WatchlistRailProps {
  watchlist: WatchlistItem[];
  assetName: string;
  priceSource: 'live' | 'fallback';
  onSelectAsset: (item: WatchlistItem) => void;
  className?: string;
  isCollapsible?: boolean;
}

export const WatchlistRail: React.FC<WatchlistRailProps> = ({
  watchlist,
  assetName,
  priceSource,
  onSelectAsset,
  className = '',
  isCollapsible = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredWatchlist = watchlist.filter(item => 
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-md p-4 shadow-xl backdrop-blur-sm space-y-3 transition-all duration-300 ${className} ${isCollapsed ? 'w-16' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2 overflow-hidden">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
          {!isCollapsed && (
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono truncate">
              Watchlist
            </h3>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isCollapsed && (
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-sm font-bold ${
              priceSource === 'live'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {priceSource === 'live' ? 'LIVE' : 'FB'}
            </span>
          )}

          {isCollapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Search Filter (shown if expanded) */}
      {!isCollapsed && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Cari simbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-sm pl-8 pr-2 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500/60"
          />
        </div>
      )}

      {/* Watchlist Item List */}
      <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
        {filteredWatchlist.map((item) => {
          const isSelected = assetName.includes(item.symbol);
          const isFallback = item.source === 'fallback';

          let flashClass = '';
          if (item.flash === 'up') flashClass = 'animate-flash-up border-emerald-500/80';
          if (item.flash === 'down') flashClass = 'animate-flash-down border-rose-500/80';

          if (isCollapsed) {
            return (
              <button
                key={item.symbol}
                onClick={() => onSelectAsset(item)}
                className={`w-full p-2 rounded-sm border text-center transition-all cursor-pointer relative group ${
                  isSelected ? 'bg-amber-500/20 border-amber-500/80 text-amber-300' : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                } ${flashClass}`}
                title={`${item.symbol}: $${item.price}`}
              >
                <span className="text-[10px] font-bold font-mono block text-white truncate">
                  {item.symbol.split('/')[0]}
                </span>
                <span className={`text-[9px] font-mono font-bold block ${item.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.change >= 0 ? '▲' : '▼'}
                </span>
              </button>
            );
          }

          return (
            <div
              key={item.symbol}
              onClick={() => onSelectAsset(item)}
              className={`p-2.5 rounded-sm border transition-all cursor-pointer flex items-center justify-between ${
                isSelected 
                  ? 'bg-amber-500/15 border-amber-500/70 shadow-sm shadow-amber-500/10' 
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
              } ${flashClass}`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white font-mono">{item.symbol}</span>
                  {isSelected && (
                    <span className="text-[8px] px-1 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-xs font-mono">
                      ACTIVE
                    </span>
                  )}
                  {isFallback ? (
                    <span className="text-[8px] px-1 py-0.2 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-xs font-mono" title="Data fallback">
                      FB
                    </span>
                  ) : (
                    <span className="text-[8px] px-1 py-0.2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xs font-mono">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[110px]">{item.name}</div>
              </div>

              <div className="text-right font-mono tabular-nums">
                <div className={`text-xs font-bold transition-colors ${item.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.price.toLocaleString(undefined, { minimumFractionDigits: item.price > 100 ? 2 : 4 })}
                </div>
                <div className={`text-[10px] font-semibold ${item.change >= 0 ? 'text-emerald-400/90' : 'text-rose-400/90'}`}>
                  {item.change >= 0 ? `+${item.change.toFixed(2)}%` : `${item.change.toFixed(2)}%`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
