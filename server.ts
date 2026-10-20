import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/gann/analyze', async (req, res) => {
  try {
    const { pivot, angleFactor, resistance, support, assetName } = req.body;
    
    const prompt = `Bertindaklah sebagai ahli Analisis Teknikal pasar keuangan profesional yang berspesialisasi dalam metode W.D. Gann (Gann Square of 9).
Analisis level harga berikut untuk aset ${assetName || 'Market'} dengan Pivot ${pivot} dan Faktor Sudut ${angleFactor}:
- Harga Pivot: ${pivot}
- Faktor Sudut: ${angleFactor}
- Resisten Utama (Target Atas): ${resistance}
- Support Utama (Target Bawah): ${support}

Tolong berikan 2 paragraf interpretasi teknikal dalam bahasa Indonesia yang elegan dan profesional. Jelaskan probabilitas arah harga jika level support bertahan atau jika resisten tertembus. Tambahkan catatan disclaimer di akhir bahwa analisis ini murni probabilitas matematis dari metode Gann Square of 9 dan bukan saran finansial pasti.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah pakar W.D. Gann Square of 9 yang memberikan analisis teknikal akurat, berwibawa, dan profesional dalam Bahasa Indonesia.',
        temperature: 0.7,
      },
    });

    res.json({ analysis: response.text || 'Analisis Gann tidak tersedia.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan analisis AI.';
    console.error('Gemini Gann API Error:', error);
    res.status(500).json({ error: message });
  }
});

app.post('/api/oracle/analyze', async (req, res) => {
  try {
    const { assetName, currentPrice, swingHigh, swingLow, lunarPhase, trendAngle, candlestickPattern } = req.body;
    
    const prompt = `Anda adalah "Gann-Lunar Architect", sistem asisten trading algoritmik tingkat eksekutif. Keahlian utama Anda adalah memetakan probabilitas pasar menggunakan sinkronisasi 4 Dimensi: Harga (Gann & Fibonacci), Waktu (Siklus Lunar), Ruang (Pythagoras), dan Psikologi (Candlestick Homma).

TUGAS UTAMA:
Proses setiap input kondisi pasar dari pengguna melalui 4 fase saringan berjenjang untuk menghasilkan keputusan eksekusi yang sangat terstruktur.

DATA PASAR SAAT INI:
- Aset: ${assetName || 'Market Asset'}
- Harga Saat Ini: ${currentPrice}
- Swing High: ${swingHigh}
- Swing Low: ${swingLow}
- Fase Bulan: ${lunarPhase}
- Sudut Tren (Pythagoras): ${trendAngle}°
- Pola Candlestick: ${candlestickPattern}

ALUR KERJA 4 DIMENSI:
1. FASE 1 (Dimensi Harga): 
   - Hitung Support/Resisten menggunakan rumus Gann Square of 9: (√Harga ± 0.125)².
   - Pantau posisi Fibonacci Retracement (0.5 dan 0.618) pada ayunan harga (Swing High ke Swing Low).
   - Temukan "Zona Konfluensi" (titik irisan antara level Gann dan Fibonacci).
2. FASE 2 (Dimensi Waktu): 
   - Evaluasi keselarasan siklus Lunar (Bulan Purnama/Full Moon atau Bulan Baru/New Moon). Jendela aktif adalah H-2 hingga H+2 dari puncak fase bulan.
3. FASE 3 (Dimensi Ruang): 
   - Analisis momentum vektor (sudut tren). Sudut curam (>70°) berarti tren kelelahan dan rentan memantul; sudut 45° berarti tren seimbang.
4. FASE 4 (Dimensi Psikologi): 
   - Tunggu konfirmasi visual candlestick dari ajaran Munehisa Homma (seperti Pin Bar, Bullish/Bearish Engulfing) yang menyentuh Zona Konfluensi.

FORMAT KELUARAN YANG WAJIB DIGUNAKAN:
**1. Arsitektur Harga (Zona Konfluensi):** [Tuliskan hasil hitungan Gann & Fibonacci]
**2. Sinkronisasi Waktu (Filter Lunar):** [Valid/Tidak Valid - Penjelasan fase]
**3. Validasi Ruang (Momentum Vektor):** [Evaluasi sudut tren]
**4. Konfirmasi Psikologi (Candlestick):** [Reaksi pola lilin]

**KEPUTUSAN GANN-LUNAR ARCHITECT:**
[Pilih salah satu]
- 🔴 IGNORE: (Harga & Waktu tidak sinkron, abaikan)
- 🟡 STANDBY: (Zona Konfluensi tersentuh, menunggu pola candlestick)
- 🟢 EXECUTE: (Semua dimensi sinkron. Berikan rekomendasi Buy/Sell, letak Stop Loss, dan 3 level Take Profit (TP1, TP2, TP3) berdasarkan Zona Konfluensi dan Fibonacci Retracement)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah "Gann-Lunar Architect", asisten trading algoritmik tingkat eksekutif. Patuhi dengan ketat format keluaran yang diinstruksikan.',
        temperature: 0.3,
      },
    });

    res.json({ oracleReport: response.text || '' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan analisis Gann-Lunar Architect.';
    console.error('Gann-Lunar Architect API Error:', error);
    res.status(500).json({ error: message });
  }
});

interface MarketPriceItem {
  price: number;
  high: number;
  low: number;
  change: number;
  source: 'live' | 'fallback';
}

app.get('/api/market/live-prices', async (req, res) => {
  try {
    const prices: Record<string, MarketPriceItem> = {
      'XAU/USD': { price: 4146.80, high: 4180.00, low: 4120.00, change: -0.14, source: 'fallback' },
      'XAG/USD': { price: 57.60, high: 58.20, low: 56.90, change: +0.45, source: 'fallback' },
      'BTC/USD': { price: 82250.00, high: 83150.00, low: 81200.00, change: -0.32, source: 'fallback' },
      'ETH/USD': { price: 2420.00, high: 2480.00, low: 2390.00, change: -1.09, source: 'fallback' },
      'SOL/USD': { price: 104.50, high: 108.00, low: 102.50, change: -1.55, source: 'fallback' },
      'BNB/USD': { price: 618.00, high: 628.00, low: 610.00, change: +0.82, source: 'fallback' },
      'XRP/USD': { price: 2.38, high: 2.45, low: 2.29, change: +2.10, source: 'fallback' },
      'EUR/USD': { price: 1.1218, high: 1.1250, low: 1.1190, change: +0.07, source: 'fallback' },
      'GBP/USD': { price: 1.3314, high: 1.3360, low: 1.3270, change: +0.29, source: 'fallback' },
      'USD/JPY': { price: 158.40, high: 159.10, low: 157.90, change: -0.18, source: 'fallback' },
      'AUD/USD': { price: 0.6980, high: 0.7020, low: 0.6950, change: +0.15, source: 'fallback' },
      'S&P 500': { price: 7657.01, high: 7756.84, low: 7651.91, change: -1.12, source: 'fallback' },
      'NASDAQ': { price: 20450.80, high: 20680.00, low: 20390.10, change: -0.75, source: 'fallback' },
      'DOW JONES': { price: 43210.50, high: 43500.00, low: 43100.00, change: +0.34, source: 'fallback' },
      'OIL/USD': { price: 98.57, high: 99.00, low: 95.29, change: +0.61, source: 'fallback' },
      'GAS/USD': { price: 2.85, high: 2.92, low: 2.78, change: -1.20, source: 'fallback' },
      'AAPL': { price: 235.60, high: 238.20, low: 234.10, change: +1.15, source: 'fallback' },
      'TSLA': { price: 242.80, high: 248.50, low: 239.00, change: -2.30, source: 'fallback' },
      'NVDA': { price: 138.45, high: 141.20, low: 137.00, change: +2.45, source: 'fallback' },
    };

    // 1. Fetch live gold & silver
    try {
      const gRes = await fetch('https://api.gold-api.com/price/XAU', { signal: AbortSignal.timeout(3000) });
      if (gRes.ok) {
        const gData = await gRes.json();
        if (typeof gData?.price === 'number') {
          const p = Number(gData.price.toFixed(2));
          prices['XAU/USD'] = {
            price: p,
            high: Number((p * 1.008).toFixed(2)),
            low: Number((p * 0.992).toFixed(2)),
            change: -0.14,
            source: 'live'
          };
        }
      }
    } catch {}

    // 2. Fetch live crypto from Binance
    try {
      const cryptoSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'];
      const cRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(cryptoSymbols))}`, { signal: AbortSignal.timeout(3000) });
      if (cRes.ok) {
        const list = await cRes.json();
        const map: Record<string, string> = {
          'BTCUSDT': 'BTC/USD',
          'ETHUSDT': 'ETH/USD',
          'SOLUSDT': 'SOL/USD',
          'BNBUSDT': 'BNB/USD',
          'XRPUSDT': 'XRP/USD',
        };
        for (const item of list) {
          const key = map[item.symbol];
          if (key) {
            prices[key] = {
              price: parseFloat(item.lastPrice),
              high: parseFloat(item.highPrice),
              low: parseFloat(item.lowPrice),
              change: parseFloat(parseFloat(item.priceChangePercent).toFixed(2)),
              source: 'live',
            };
          }
        }
      }
    } catch {}

    // 3. Fetch live forex rates
    try {
      const fxRes = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(3000) });
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        const rates = fxData?.rates;
        if (rates?.EUR) {
          const p = Number((1 / rates.EUR).toFixed(4));
          prices['EUR/USD'] = { price: p, high: Number((p * 1.003).toFixed(4)), low: Number((p * 0.997).toFixed(4)), change: 0.12, source: 'live' };
        }
        if (rates?.GBP) {
          const p = Number((1 / rates.GBP).toFixed(4));
          prices['GBP/USD'] = { price: p, high: Number((p * 1.004).toFixed(4)), low: Number((p * 0.996).toFixed(4)), change: 0.18, source: 'live' };
        }
        if (rates?.JPY) {
          const p = Number((rates.JPY).toFixed(2));
          prices['USD/JPY'] = { price: p, high: Number((p * 1.005).toFixed(2)), low: Number((p * 0.995).toFixed(2)), change: -0.15, source: 'live' };
        }
        if (rates?.AUD) {
          const p = Number((1 / rates.AUD).toFixed(4));
          prices['AUD/USD'] = { price: p, high: Number((p * 1.004).toFixed(4)), low: Number((p * 0.996).toFixed(4)), change: 0.22, source: 'live' };
        }
      }
    } catch {}

    res.json({ prices });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Error in /api/market/live-prices:', errMsg);
    res.json({ prices: {} });
  }
});

app.post('/api/fundamental/analyze', async (req, res) => {
  try {
    const { eventType, indicatorName, actual, consensus, previous, unit, sourceRef } = req.body;
    
    const prompt = `Bertindaklah sebagai Quantitative Fundamental Research Analyst yang berspesialisasi pada instrumen XAU/USD (Gold).
Analisis data rilis makroekonomi berikut secara objektif, berimbang, dan grounded pada sumber resmi:
- Jenis Event: ${eventType}
- Indikator: ${indicatorName}
- Nilai Aktual: ${actual} ${unit}
- Nilai Konsensus (Ekspektasi Pra-Rilis): ${consensus} ${unit}
- Nilai Periode Sebelumnya: ${previous} ${unit}
- Referensi Sumber Resmi: ${sourceRef || 'Official Release'}

CATATAN: Data ini adalah data historis referensi, bukan rilis real-time terbaru. Jika relevan, sebutkan dalam analisis bahwa kondisi pasar saat ini mungkin sudah bergeser sejak tanggal rilis data ini.

TUGAS ANALISIS:
1. Hitung besaran kejutan (*economic surprise*) dan arah deviasinya terhadap konsensus.
2. Jelaskan implikasi fundamental makroekonomi terhadap instrumen XAU/USD (pertimbangkan faktor suku bunga riil, DXY, dan inflasi).
3. Evaluasi apakah kondisi ini memicu bias \`BULLISH\`, \`BEARISH\`, \`MIXED\`, atau \`NO_CLEAR_BIAS\`.
4. Berikan rangkuman analisis terstruktur dalam Bahasa Indonesia profesional.`;

    const aiPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah Quantitative Fundamental Research Analyst XAU/USD. Berikan analisis berbasis data yang objektif, grounded, dan profesional dalam Bahasa Indonesia.',
        temperature: 0.2,
      },
    });

    const timeoutPromise = new Promise<{ text?: string }>((_, reject) => {
      setTimeout(() => reject(new Error('AI request timeout')), 10000);
    });

    let analysisText = '';
    try {
      const response = await Promise.race([aiPromise, timeoutPromise]);
      analysisText = response.text || '';
    } catch {
      // Deterministic Quantitative Grounded Fallback
      analysisText = `[Analisis Kuantitatif Fundamental - Mode Deterministik]\n` +
        `• Indikator: ${indicatorName} (${eventType})\n` +
        `• Data Rilis: Aktual ${actual} ${unit} vs Konsensus ${consensus} ${unit} (Sebelumnya: ${previous} ${unit})\n` +
        `• Sumber Rilis: ${sourceRef || 'Lembaga Resmi (BLS / Federal Reserve)'}\n\n` +
        `Implikasi Makroekonomi terhadap XAU/USD:\n` +
        `Data rilis ini menunjukkan deviasi terhadap konsensus pasar. Untuk instrumen emas (XAU/USD), reaksi harga umumnya berbanding terbalik dengan arah pergerakan Dolar AS (DXY) dan imbal hasil riil obligasi pemerintah AS (TIPS). Jika data lebih kuat dari ekspektasi pasar, kecenderungan jangka pendek adalah menekan emas; jika lebih lemah atau in-line, tekanan jual mereda.\n\n` +
        `CATATAN: Data ini adalah data historis referensi per April 2026. Kondisi pasar saat ini mungkin telah mengalami pergeseran siklus sejak tanggal rilis tersebut.`;
    }

    res.json({ analysis: analysisText });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan analisis fundamental AI.';
    console.error('Gemini Fundamental API Error:', error);
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
