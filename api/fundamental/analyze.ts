import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { eventType, indicatorName, actual, consensus, previous, unit, sourceRef } = req.body || {};

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
1. Hitung besaran kejutan (*economic surprise*) atau gap deviasi terhadap konsensus pasar.
2. Jelaskan implikasi fundamental makroekonomi terhadap instrumen XAU/USD (pertimbangkan faktor suku bunga riil, DXY, dan inflasi).
3. Evaluasi apakah kondisi ini memicu bias \`BULLISH\`, \`BEARISH\`, \`MIXED\`, atau \`NO_CLEAR_BIAS\`.
4. Jelaskan alasan di balik bias ini secara kualitatif. JANGAN berikan angka probabilitas spesifik (seperti '70% kemungkinan...') kecuali diminta eksplisit dan ada data pengujian yang mendasarinya — gunakan istilah seperti 'cenderung', 'berpotensi', 'secara historis arah serupa biasanya...' tanpa klaim presisi numerik yang tidak berdasar.
5. Berikan rangkuman analisis terstruktur dalam Bahasa Indonesia profesional.`;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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

    res.status(200).json({ analysis: analysisText });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan analisis fundamental AI.';
    console.error('Gemini Fundamental API Error:', error);
    res.status(500).json({ error: message });
  }
}
