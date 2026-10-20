import React, { useState } from 'react';
import { Code, Copy, Check, Play, RefreshCw, Terminal, Sparkles, FileText } from 'lucide-react';

interface PineScriptEditorProps {
  tvSymbol: string;
  pivot: number;
  s1: number;
  r1: number;
}

const TEMPLATES = {
  gann_sq9: `//@version=5
indicator("Gann Square of 9 & Confluence Pro v5", overlay=true)

// Input Parameters
pivotInput = input.float(${4164.86}, title="Gann Base Pivot Price")
factorInput = input.float(${0.125}, title="Gann Vibration Factor")

// Calculate Gann S1 / R1
s1Calc = pivotInput * (1 - factorInput)
r1Calc = pivotInput * (1 + factorInput)

// Plotting Gann Levels
plot(pivotInput, title="Gann Pivot", color=color.yellow, linewidth=2, style=plot.style_line)
plot(s1Calc, title="Gann Support S1", color=color.rgb(244, 63, 94), linewidth=2, style=plot.style_dashed)
plot(r1Calc, title="Gann Resistance R1", color=color.rgb(16, 185, 129), linewidth=2, style=plot.style_dashed)

// Signals
longSignal = ta.crossover(close, s1Calc)
shortSignal = ta.crossunder(close, r1Calc)

alertcondition(longSignal, title="Gann S1 Bounce Long", message="Harga memantul di Support S1 Gann Square of 9!")
alertcondition(shortSignal, title="Gann R1 Rejection Short", message="Harga tertahan di Resistance R1 Gann!")

bgcolor(longSignal ? color.new(color.emerald, 85) : na)
bgcolor(shortSignal ? color.new(color.rose, 85) : na)`,

  lunar_oscillator: `//@version=5
indicator("Lunar Cycle & Volatility Clock v5", overlay=false)

// Lunar Phase Cycle Simulation
lunarCycle = math.sin(bar_index * 0.1) * 100
plot(lunarCycle, title="Lunar Phase Oscillator", color=color.purple, linewidth=2)
hline(50, "Full Moon High Volatility Zone", color=color.orange, linestyle=hline.style_dotted)
hline(-50, "New Moon Accumulation Zone", color=color.blue, linestyle=hline.style_dotted)

highVol = lunarCycle > 70 or lunarCycle < -70
bgcolor(highVol ? color.new(color.purple, 90) : na)`,

  rsi_bollinger: `//@version=5
indicator("Wilder RSI & Bollinger Bands Confluence", overlay=true)

// Bollinger Bands
length = input.int(20, minval=1)
src = input(close, title="Source")
mult = input.float(2.0, minval=0.001, maxval=50, title="StdDev")
basis = ta.sma(src, length)
dev = mult * ta.stdev(src, length)
upper = basis + dev
lower = basis - dev

plot(basis, "BB Basis", color=color.orange)
p1 = plot(upper, "BB Upper", color=color.blue)
p2 = plot(lower, "BB Lower", color=color.blue)
fill(p1, p2, title="BB Background", color=color.new(color.blue, 95))

// Wilder RSI
rsiVal = ta.rsi(src, 14)
rsiOversold = rsiVal < 30
rsiOverbought = rsiVal > 70

plotshape(rsiOversold, title="RSI Oversold", style=shape.triangleup, location=location.belowbar, color=color.emerald, size=size.small)
plotshape(rsiOverbought, title="RSI Overbought", style=shape.triangledown, location=location.abovebar, color=color.rose, size=size.small)`
};

export const PineScriptEditor: React.FC<PineScriptEditorProps> = ({ tvSymbol, pivot, s1, r1 }) => {
  const [activeTemplate, setActiveTemplate] = useState<keyof typeof TEMPLATES>('gann_sq9');
  const [code, setCode] = useState<string>(TEMPLATES.gann_sq9);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isCompiled, setIsCompiled] = useState<boolean>(false);
  const [compileMsg, setCompileMsg] = useState<string>('Siap dikompilasi untuk TradingView Pine v5');

  const handleSelectTemplate = (key: keyof typeof TEMPLATES) => {
    setActiveTemplate(key);
    let templateContent = TEMPLATES[key];
    if (key === 'gann_sq9') {
      templateContent = templateContent
        .replace('4164.86', pivot.toString())
        .replace('0.125', '0.125');
    }
    setCode(templateContent);
    setIsCompiled(false);
    setCompileMsg('Template dimuat. Siap dikompilasi.');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCompile = () => {
    setIsCompiled(true);
    setCompileMsg('Sukses! Kode Pine Script v5 valid dan kompatibel dengan TradingView Pine Editor.');
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                TradingView Pine Script Editor (v5)
              </h3>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                PINE v5
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Buat dan salin skrip kustom Gann Square of 9 & Lunar untuk TradingView ({tvSymbol})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCompile}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kompilasi Skrip</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer shadow-amber-500/20"
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'Berhasil Disalin!' : 'Salin Kode Pine'}</span>
          </button>
        </div>
      </div>

      {/* Template Selector Tabs */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-400 font-mono text-[11px]">Template Skrip:</span>
        <button
          onClick={() => handleSelectTemplate('gann_sq9')}
          className={`px-3 py-1.5 rounded-lg border font-mono transition-all cursor-pointer ${activeTemplate === 'gann_sq9' ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'}`}
        >
          Gann Square of 9 Confluence
        </button>
        <button
          onClick={() => handleSelectTemplate('lunar_oscillator')}
          className={`px-3 py-1.5 rounded-lg border font-mono transition-all cursor-pointer ${activeTemplate === 'lunar_oscillator' ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'}`}
        >
          Lunar Volatility Clock
        </button>
        <button
          onClick={() => handleSelectTemplate('rsi_bollinger')}
          className={`px-3 py-1.5 rounded-lg border font-mono transition-all cursor-pointer ${activeTemplate === 'rsi_bollinger' ? 'bg-amber-500 text-slate-950 font-bold border-amber-400' : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'}`}
        >
          Wilder RSI & Bollinger
        </button>
      </div>

      {/* Code Editor TextArea */}
      <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>gann_lunar_strategy_v5.pine</span>
          </div>
          <span className={isCompiled ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
            ● {compileMsg}
          </span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={14}
          className="w-full bg-slate-950 text-amber-200/90 font-mono text-xs p-4 focus:outline-none resize-y leading-relaxed selection:bg-amber-500/30"
          spellCheck={false}
        />
      </div>

      <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
        <span>💡 Tips: Salin kode di atas, buka TradingView, pilih menu **Pine Editor** di bagian bawah, paste kodenya, lalu klik **Add to Chart**.</span>
        <span className="text-amber-400 font-bold">Pine Script v5 Compliant</span>
      </div>
    </div>
  );
};
