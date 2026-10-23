import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { pivot, angleFactor, resistance, support, assetName } = req.body || {};

    const prompt = `Bertindaklah sebagai ahli Analisis Teknikal pasar keuangan profesional yang berspesialisasi dalam metode W.D. Gann (Gann Square of 9).
Analisis level harga berikut untuk aset ${assetName || 'Market'} dengan Pivot ${pivot} dan Faktor Sudut ${angleFactor}:
- Harga Pivot: ${pivot}
- Faktor Sudut: ${angleFactor}
- Resisten Utama (Target Atas): ${resistance}
- Support Utama (Target Bawah): ${support}

Tolong berikan 2 paragraf interpretasi teknikal dalam bahasa Indonesia yang elegan dan profesional. Jelaskan probabilitas arah harga jika level support bertahan atau jika resisten tertembus. Tambahkan catatan disclaimer di akhir bahwa analisis ini murni probabilitas matematis dari metode Gann Square of 9 dan bukan saran finansial pasti.`;

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
        systemInstruction: 'Anda adalah pakar W.D. Gann Square of 9 yang memberikan analisis teknikal akurat, berwibawa, dan profesional dalam Bahasa Indonesia.',
        temperature: 0.7,
      },
    });

    res.status(200).json({ analysis: response.text || 'Analisis Gann tidak tersedia.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan analisis AI.';
    console.error('Gemini Gann API Error:', error);
    res.status(500).json({ error: message });
  }
}
