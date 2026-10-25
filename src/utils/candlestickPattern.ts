/**
 * Candlestick Pattern & Psychology Detection Module
 * Implements 4D Oracle Psychology Dimension pattern estimation based on price position relative to Gann levels.
 */

export interface CandlestickPatternResult {
  pattern: string;           // nama pola
  patternLabel: string;      // label untuk Oracle, kompatibel dengan format existing
  confidence: 'High' | 'Medium' | 'Low' | 'None';
  confidenceLabel: string;   // dalam Bahasa Indonesia
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  explanation: string;       // penjelasan singkat alasan deteksi
  isFromOHLC: boolean;       // SELALU false untuk implementasi ini (tidak ada data OHLC real)
  disclaimer: string;        // WAJIB ADA
}

export const MANDATORY_DISCLAIMER = "Estimasi berbasis posisi harga relatif terhadap level Gann, bukan data OHLC asli. Konfirmasi manual diperlukan.";

const CONFIDENCE_LABELS: Record<CandlestickPatternResult['confidence'], string> = {
  'High': 'Kepercayaan Tinggi',
  'Medium': 'Kepercayaan Sedang',
  'Low': 'Kepercayaan Rendah',
  'None': 'Tidak Ada Sinyal',
};

export function detectCandlestickPattern(
  currentPrice: number,
  gannRes1: number,
  gannSup1: number,
  _gannRes2?: number,
  _gannSup2?: number,
  prevPrice?: number
): CandlestickPatternResult {
  // Edge case handling
  if (!currentPrice || !gannRes1 || !gannSup1 || gannRes1 <= gannSup1) {
    return {
      pattern: 'Belum Ada Pola Konfirmasi',
      patternLabel: 'Belum Ada Pola Konfirmasi',
      confidence: 'None',
      confidenceLabel: CONFIDENCE_LABELS['None'],
      bias: 'Neutral',
      explanation: 'Data harga atau level Gann belum siap untuk deteksi pola.',
      isFromOHLC: false,
      disclaimer: MANDATORY_DISCLAIMER,
    };
  }

  const distToRes1Ratio = Math.abs(currentPrice - gannRes1) / gannRes1;
  const distToSup1Ratio = Math.abs(currentPrice - gannSup1) / gannSup1;

  let pattern = '';
  let bias: CandlestickPatternResult['bias'] = 'Neutral';
  let confidence: CandlestickPatternResult['confidence'] = 'None';
  let explanation = '';

  // Rule-based estimation logic
  if (currentPrice > gannRes1) {
    pattern = 'Bullish Breakout Zone';
    bias = 'Bullish';
    confidence = 'Medium';
    explanation = 'Harga menembus Resisten 1 Gann (Zone Breakout Beli).';
  } else if (currentPrice < gannSup1) {
    pattern = 'Bearish Breakdown Zone';
    bias = 'Bearish';
    confidence = 'Medium';
    explanation = 'Harga menembus Support 1 Gann (Zone Breakdown Jual).';
  } else if (distToRes1Ratio <= 0.003) {
    pattern = 'Potential Bearish Rejection / Resistance Test';
    bias = 'Bearish';
    confidence = 'Medium';
    explanation = 'Harga mendekati Resisten 1 Gann (potensi penolakan penjual).';
  } else if (distToSup1Ratio <= 0.003) {
    pattern = 'Potential Bullish Bounce / Support Test';
    bias = 'Bullish';
    confidence = 'Medium';
    explanation = 'Harga mendekati Support 1 Gann (potensi pantulan pembeli).';
  } else {
    pattern = 'Neutral — No Clear Pattern';
    bias = 'Neutral';
    confidence = 'None';
    explanation = 'Harga bergerak di area netral antara Support 1 dan Resisten 1.';
  }

  // Consolidation modifier if previous price is available
  if (prevPrice && prevPrice > 0) {
    const changeRatio = Math.abs(currentPrice - prevPrice) / prevPrice;
    if (changeRatio < 0.001) {
      pattern += ' — Consolidation';
    }
  }

  return {
    pattern,
    patternLabel: pattern,
    confidence,
    confidenceLabel: CONFIDENCE_LABELS[confidence],
    bias,
    explanation,
    isFromOHLC: false,
    disclaimer: MANDATORY_DISCLAIMER,
  };
}
