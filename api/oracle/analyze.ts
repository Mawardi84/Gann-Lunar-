import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { assetName, currentPrice, swingHigh, swingLow, lunarPhase, trendAngle, candlestickPattern } = req.body || {};

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

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah "Gann-Lunar Architect", asisten trading algoritmik tingkat eksekutif. Patuhi dengan ketat format keluaran yang diinstruksikan.',
        temperature: 0.3,
      },
    });

    res.status(200).json({ oracleReport: response.text || '' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan analisis Gann-Lunar Architect.';
    console.error('Gann-Lunar Architect API Error:', error);
    res.status(500).json({ error: message });
  }
}
