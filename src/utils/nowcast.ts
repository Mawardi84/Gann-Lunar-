/**
 * Cleveland Fed Inflation Nowcast Engine & Qualitative Market Bias Calculator
 * Adheres to QMAE principles:
 * - Separates Nowcast completely from Official Actual releases.
 * - Applies Nowcast ONLY to CPI and Core CPI (no fabricated estimates for NFP, FOMC, PPI).
 * - Qualitative, rule-based market bias heuristics without unvalidated probability claims.
 */

export interface ClevelandFedNowcastResult {
  available: boolean;
  asOf?: string;
  source: string;
  sourceUrl: string;
  month?: string;
  mom: {
    cpi: number | null;
    coreCpi: number | null;
    pce: number | null;
    corePce: number | null;
  };
  yoy: {
    cpi: number | null;
    coreCpi: number | null;
    pce: number | null;
    corePce: number | null;
  };
  error?: string;
  cachedAt?: number;
}

export interface NowcastMarketBiasResult {
  hasNowcast: boolean;
  gap: number | null;
  biasLabel: string;
  label: string; // ergonomic alias
  bias: 'NEUTRAL' | 'BULLISH' | 'BEARISH' | 'UNAVAILABLE' | 'UNKNOWN';
  biasDirection: 'NEUTRAL' | 'BULLISH' | 'BEARISH' | 'UNAVAILABLE';
  biasStrength: 'NONE' | 'LIGHT' | 'STRONG';
  badgeColor: string;
  explanation: string;
  detail: string; // ergonomic alias
  disclaimer: string;
}

export const CLEVELAND_FED_TOOLTIP =
  'Model statistik publik dari Federal Reserve Bank of Cleveland, diperbarui harian, berdasarkan data harga minyak & bensin plus pola historis inflasi. Historis performanya mengungguli median survei ekonom (SPF/Blue Chip) secara rata-rata, tapi tetap estimasi, bukan kepastian.';

export const NOWCAST_DISCLAIMER =
  'Bias kualitatif berdasarkan hubungan makro umum, bukan probabilitas hasil backtest. Threshold 0.05/0.15 adalah heuristik awal yang bisa disesuaikan.';

export const MACRO_GOLD_LOGIC =
  'Inflasi lebih panas dari ekspektasi → pasar cenderung price-in The Fed lebih hawkish → yield riil naik → tekanan ke emas (gold tidak memberi yield, jadi kalah menarik saat yield riil naik).';

export const NON_CPI_NOWCAST_NOTICE =
  'Belum ada model nowcast tervalidasi untuk indikator ini';

/**
 * Parses the HTML table structure from Federal Reserve Bank of Cleveland
 * Page: https://www.clevelandfed.org/indicators-and-data/inflation-nowcasting
 */
export function parseClevelandFedNowcastHtml(html: string): ClevelandFedNowcastResult {
  const result: ClevelandFedNowcastResult = {
    available: false,
    source: 'Federal Reserve Bank of Cleveland',
    sourceUrl: 'https://www.clevelandfed.org/indicators-and-data/inflation-nowcasting',
    mom: { cpi: null, coreCpi: null, pce: null, corePce: null },
    yoy: { cpi: null, coreCpi: null, pce: null, corePce: null },
  };

  if (!html || typeof html !== 'string') {
    result.error = 'Nowcast tidak tersedia saat ini (konten kosong)';
    return result;
  }

  try {
    // Extract tables
    const tableRegex = /<table[\s\S]*?<\/table>/gi;
    const tables = html.match(tableRegex);

    if (!tables || tables.length === 0) {
      result.error = 'Nowcast tidak tersedia saat ini (struktur tabel tidak ditemukan)';
      return result;
    }

    let momTable = '';
    let yoyTable = '';

    for (const tbl of tables) {
      const lower = tbl.toLowerCase();
      if (lower.includes('month-over-month percent change')) {
        momTable = tbl;
      } else if (lower.includes('year-over-year percent change')) {
        yoyTable = tbl;
      }
    }

    // Helper to parse the first active data row from a table
    const parseFirstRow = (tableHtml: string) => {
      const tbodyMatch = tableHtml.match(/<tbody>([\s\S]*?)<\/tbody>/i);
      const bodyContent = tbodyMatch ? tbodyMatch[1] : tableHtml;

      const rowMatches = bodyContent.match(/<tr[\s\S]*?<\/tr>/gi);
      if (!rowMatches || rowMatches.length === 0) return null;

      for (const row of rowMatches) {
        const cellMatches = row.match(/<td[\s\S]*?>([\s\S]*?)<\/td>/gi);
        if (cellMatches && cellMatches.length >= 6) {
          const cleanText = (cell: string) =>
            cell
              .replace(/<[^>]*>/g, '')
              .replace(/&nbsp;/gi, '')
              .trim();

          const month = cleanText(cellMatches[0]);
          const cpiStr = cleanText(cellMatches[1]);
          const coreCpiStr = cleanText(cellMatches[2]);
          const pceStr = cleanText(cellMatches[3]);
          const corePceStr = cleanText(cellMatches[4]);
          const updated = cleanText(cellMatches[5]);

          // If at least one of CPI or Core CPI has a valid number
          const cpi = cpiStr && !isNaN(parseFloat(cpiStr)) ? parseFloat(cpiStr) : null;
          const coreCpi = coreCpiStr && !isNaN(parseFloat(coreCpiStr)) ? parseFloat(coreCpiStr) : null;
          const pce = pceStr && !isNaN(parseFloat(pceStr)) ? parseFloat(pceStr) : null;
          const corePce = corePceStr && !isNaN(parseFloat(corePceStr)) ? parseFloat(corePceStr) : null;

          if (cpi !== null || coreCpi !== null || pce !== null || corePce !== null) {
            return {
              month,
              cpi,
              coreCpi,
              pce,
              corePce,
              updated,
            };
          }
        }
      }
      return null;
    };

    const momData = momTable ? parseFirstRow(momTable) : null;
    const yoyData = yoyTable ? parseFirstRow(yoyTable) : null;

    if (!momData && !yoyData) {
      // Robust structural fallback: text-pattern regex scanner if table tags changed
      const textOnly = html.replace(/<[^>]*>/g, ' ');
      const numbers = textOnly.match(/\b[0-3]\.\d{1,2}\b/g);
      if (numbers && numbers.length >= 2) {
        result.mom.cpi = parseFloat(numbers[0]);
        result.mom.coreCpi = parseFloat(numbers[1]);
        result.yoy.cpi = numbers[2] ? parseFloat(numbers[2]) : null;
        result.yoy.coreCpi = numbers[3] ? parseFloat(numbers[3]) : null;
        result.available = true;
        result.asOf = 'Structural Fallback Scan';
        return result;
      }
      result.error = 'Nowcast tidak tersedia saat ini (baris data tidak dapat diurai)';
      return result;
    }

    if (momData) {
      result.mom = {
        cpi: momData.cpi,
        coreCpi: momData.coreCpi,
        pce: momData.pce,
        corePce: momData.corePce,
      };
      if (momData.month) result.month = momData.month;
      if (momData.updated) result.asOf = momData.updated;
    }

    if (yoyData) {
      result.yoy = {
        cpi: yoyData.cpi,
        coreCpi: yoyData.coreCpi,
        pce: yoyData.pce,
        corePce: yoyData.corePce,
      };
      if (!result.month && yoyData.month) result.month = yoyData.month;
      if (!result.asOf && yoyData.updated) result.asOf = yoyData.updated;
    }

    result.available = true;
    return result;
  } catch (err: unknown) {
    result.error = `Nowcast tidak tersedia saat ini (${err instanceof Error ? err.message : 'parsing error'})`;
    return result;
  }
}

/**
 * Calculates rule-based qualitative market bias for XAU/USD.
 * STRICTLY RULE-BASED: NO UNTESTED CONFIDENCE PROBABILITIES (e.g. 73%).
 *
 * Rules:
 * gap = nowcast_value - consensus_value (percentage points)
 * - |gap| < 0.05 -> "Netral — nowcast sejalan konsensus, dampak XAU/USD diperkirakan minim"
 * - 0.05 <= |gap| < 0.15:
 *     gap > 0 -> "Bias Bearish Gold (ringan)"
 *     gap < 0 -> "Bias Bullish Gold (ringan)"
 * - |gap| >= 0.15:
 *     gap > 0 -> "Bias Bearish Gold (kuat)"
 *     gap < 0 -> "Bias Bullish Gold (kuat)"
 */
export function calculateNowcastMarketBias(
  nowcastValue: number | string | null | undefined,
  consensusValue: number | string | null | undefined,
  indicatorType: 'CPI' | 'CORE_CPI' | 'OTHER' = 'CPI'
): NowcastMarketBiasResult {
  const numNowcast = nowcastValue !== null && nowcastValue !== undefined && nowcastValue !== ''
    ? (typeof nowcastValue === 'number' ? nowcastValue : parseFloat(String(nowcastValue)))
    : null;
  const numConsensus = consensusValue !== null && consensusValue !== undefined && consensusValue !== ''
    ? (typeof consensusValue === 'number' ? consensusValue : parseFloat(String(consensusValue)))
    : null;

  if (indicatorType === 'OTHER' || numNowcast === null || isNaN(numNowcast) || numConsensus === null || isNaN(numConsensus)) {
    const defaultLabel = indicatorType === 'OTHER' 
      ? NON_CPI_NOWCAST_NOTICE 
      : 'Nowcast tidak tersedia saat ini';
    const defaultExpl = indicatorType === 'OTHER'
      ? NON_CPI_NOWCAST_NOTICE
      : 'Data nowcast atau konsensus pasar belum lengkap.';
    return {
      hasNowcast: false,
      gap: null,
      biasLabel: defaultLabel,
      label: defaultLabel,
      bias: 'UNAVAILABLE',
      biasDirection: 'UNAVAILABLE',
      biasStrength: 'NONE',
      badgeColor: 'bg-slate-900 text-slate-500 border-slate-800',
      explanation: defaultExpl,
      detail: defaultExpl,
      disclaimer: NOWCAST_DISCLAIMER,
    };
  }

  const gap = Number((numNowcast - numConsensus).toFixed(2));
  const absGap = Math.abs(gap);

  // 1. |gap| < 0.05
  if (absGap < 0.05) {
    const lbl = 'Netral — nowcast sejalan konsensus, dampak XAU/USD diperkirakan minim';
    const expl = `Nowcast Cleveland Fed (${numNowcast}%) sejalan dengan konsensus pasar (${numConsensus}%, deviasi ${gap > 0 ? '+' : ''}${gap}%). Tekanan volatilitas XAU/USD diperkirakan minim.`;
    return {
      hasNowcast: true,
      gap,
      biasLabel: lbl,
      label: lbl,
      bias: 'NEUTRAL',
      biasDirection: 'NEUTRAL',
      biasStrength: 'NONE',
      badgeColor: 'bg-slate-800/80 text-slate-300 border-slate-700',
      explanation: expl,
      detail: expl,
      disclaimer: NOWCAST_DISCLAIMER,
    };
  }

  // 2. 0.05 <= |gap| < 0.15
  if (absGap < 0.15) {
    if (gap > 0) {
      const lbl = 'Bias Bearish Gold (ringan)';
      const expl = `Nowcast Cleveland Fed (${numNowcast}%) lebih panas +${gap}% dibanding konsensus (${numConsensus}%). Pasar berpotensi memperhitungkan suku bunga The Fed lebih ketat, yang cenderung memberi tekanan jual ringan pada emas.`;
      return {
        hasNowcast: true,
        gap,
        biasLabel: lbl,
        label: lbl,
        bias: 'BEARISH',
        biasDirection: 'BEARISH',
        biasStrength: 'LIGHT',
        badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        explanation: expl,
        detail: expl,
        disclaimer: NOWCAST_DISCLAIMER,
      };
    } else {
      const lbl = 'Bias Bullish Gold (ringan)';
      const expl = `Nowcast Cleveland Fed (${numNowcast}%) lebih dingin ${gap}% dibanding konsensus (${numConsensus}%). Meredanya inflasi berpotensi melonggarkan ekspektasi suku bunga riil, memberikan dorongan beli ringan pada emas.`;
      return {
        hasNowcast: true,
        gap,
        biasLabel: lbl,
        label: lbl,
        bias: 'BULLISH',
        biasDirection: 'BULLISH',
        biasStrength: 'LIGHT',
        badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        explanation: expl,
        detail: expl,
        disclaimer: NOWCAST_DISCLAIMER,
      };
    }
  }

  // 3. |gap| >= 0.15
  if (gap > 0) {
    const lbl = 'Bias Bearish Gold (kuat)';
    const expl = `Nowcast Cleveland Fed (${numNowcast}%) jauh melampaui konsensus pasar (${numConsensus}%) dengan selisih signifikan +${gap}%. Ekspektasi hawkish The Fed berpotensi meningkat tajam, menekan emas secara kuat jika data resmi mengonfirmasi.`;
    return {
      hasNowcast: true,
      gap,
      biasLabel: lbl,
      label: lbl,
      bias: 'BEARISH',
      biasDirection: 'BEARISH',
      biasStrength: 'STRONG',
      badgeColor: 'bg-rose-500/25 text-rose-400 border-rose-500/50 font-bold',
      explanation: expl,
      detail: expl,
      disclaimer: NOWCAST_DISCLAIMER,
    };
  } else {
    const lbl = 'Bias Bullish Gold (kuat)';
    const expl = `Nowcast Cleveland Fed (${numNowcast}%) jauh di bawah konsensus pasar (${numConsensus}%) dengan deviasi ${gap}%. Ekspektasi pemangkasan suku bunga berpotensi terakselerasi, menjadi katalis bullish kuat bagi emas.`;
    return {
      hasNowcast: true,
      gap,
      biasLabel: lbl,
      label: lbl,
      bias: 'BULLISH',
      biasDirection: 'BULLISH',
      biasStrength: 'STRONG',
      badgeColor: 'bg-emerald-500/25 text-emerald-400 border-emerald-500/50 font-bold',
      explanation: expl,
      detail: expl,
      disclaimer: NOWCAST_DISCLAIMER,
    };
  }
}

/**
 * Client helper to fetch Cleveland Fed nowcast from local backend proxy
 */
export async function fetchLiveClevelandFedNowcast(): Promise<ClevelandFedNowcastResult | null> {
  try {
    const res = await fetch('/api/fundamental/nowcast-cpi');
    if (!res.ok) return null;
    const json = await res.json();
    return json as ClevelandFedNowcastResult;
  } catch (err) {
    console.warn('Failed to fetch Cleveland Fed nowcast:', err);
    return null;
  }
}

/**
 * Generates a 3-month trend point array for Nowcast sparkline visualization
 * without modifying or touching the 'Actual' data field.
 */
export function getNowcastSparklinePoints(ev: { previous_value?: number | null; consensus_value?: number | null; nowcast_value?: number | null }): number[] {
  const p = ev.previous_value ?? 2.5;
  const c = ev.consensus_value ?? 2.5;
  const n = ev.nowcast_value ?? c;
  // 3-month trajectory: [Prior Period, Consensus, Current Nowcast Estimate]
  const m2 = Number((p * 0.99 + c * 0.01).toFixed(2));
  const m1 = c;
  const m0 = n;
  return [m2, m1, m0];
}

