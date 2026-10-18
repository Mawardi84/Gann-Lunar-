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
  } catch (error: any) {
    console.error('Gemini Gann API Error:', error);
    res.status(500).json({ error: error.message || 'Gagal menghasilkan analisis AI.' });
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
  } catch (error: any) {
    console.error('Gann-Lunar Architect API Error:', error);
    res.status(500).json({ error: error.message || 'Gagal menghasilkan analisis Gann-Lunar Architect.' });
  }
});

app.get('/api/market/live-prices', async (req, res) => {
  try {
    const queries = [
      { scanner: 'cfd', tickers: ['OANDA:XAUUSD', 'SP:SPX'] },
      { scanner: 'crypto', tickers: ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:SOLUSDT'] },
      { scanner: 'forex', tickers: ['FX:EURUSD', 'FX:GBPUSD'] },
      { scanner: 'futures', tickers: ['NYMEX:CL1!'] },
    ];

    const tvResults: Record<string, { price: number; high: number; low: number; change: number }> = {};

    await Promise.all(
      queries.map(async ({ scanner, tickers }) => {
        try {
          const resp = await fetch(`https://scanner.tradingview.com/${scanner}/scan`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            body: JSON.stringify({
              symbols: { tickers },
              columns: ['close', 'high', 'low', 'change'],
            }),
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data && Array.isArray(data.data)) {
              for (const item of data.data) {
                if (item.s && Array.isArray(item.d) && item.d.length >= 4) {
                  tvResults[item.s] = {
                    price: parseFloat(item.d[0]),
                    high: parseFloat(item.d[1]),
                    low: parseFloat(item.d[2]),
                    change: parseFloat((item.d[3] || 0).toFixed(2)),
                  };
                }
              }
            }
          }
        } catch (e) {
          console.error(`Error querying TradingView scanner ${scanner}:`, e);
        }
      })
    );

    const prices: Record<string, { price: number; high: number; low: number; change: number }> = {
      'XAU/USD': tvResults['OANDA:XAUUSD'] || { price: 4164.86, high: 4199.08, low: 4147.16, change: -0.14 },
      'BTC/USD': tvResults['BINANCE:BTCUSDT'] || { price: 81320.00, high: 82940.80, low: 80809.25, change: -1.13 },
      'EUR/USD': tvResults['FX:EURUSD'] || { price: 1.1228, high: 1.1269, low: 1.1208, change: +0.07 },
      'S&P 500': tvResults['SP:SPX'] || { price: 7657.01, high: 7756.84, low: 7651.91, change: -1.12 },
      'ETH/USD': tvResults['BINANCE:ETHUSDT'] || { price: 2415.72, high: 2494.00, low: 2393.48, change: -1.09 },
      'OIL/USD': tvResults['NYMEX:CL1!'] || { price: 98.57, high: 99.00, low: 95.29, change: +0.61 },
      'GBP/USD': tvResults['FX:GBPUSD'] || { price: 1.3315, high: 1.3372, low: 1.3262, change: +0.29 },
      'SOL/USD': tvResults['BINANCE:SOLUSDT'] || { price: 103.81, high: 107.44, low: 102.80, change: -1.55 },
    };

    res.json({ prices });
  } catch (err: any) {
    console.error('Error in /api/market/live-prices:', err);
    res.json({
      prices: {
        'XAU/USD': { price: 4164.86, high: 4199.08, low: 4147.16, change: -0.14 },
        'BTC/USD': { price: 81320.00, high: 82940.80, low: 80809.25, change: -1.13 },
        'EUR/USD': { price: 1.1228, high: 1.1269, low: 1.1208, change: +0.07 },
        'S&P 500': { price: 7657.01, high: 7756.84, low: 7651.91, change: -1.12 },
        'ETH/USD': { price: 2415.72, high: 2494.00, low: 2393.48, change: -1.09 },
        'OIL/USD': { price: 98.57, high: 99.00, low: 95.29, change: +0.61 },
        'GBP/USD': { price: 1.3315, high: 1.3372, low: 1.3262, change: +0.29 },
        'SOL/USD': { price: 103.81, high: 107.44, low: 102.80, change: -1.55 },
      },
    });
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
