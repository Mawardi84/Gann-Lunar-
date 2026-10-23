/**
 * Real-Time Economic Calendar Engine
 * Provides live countdown calculations, multi-currency filtering,
 * impact scoring, economic surprise delta calculations, and Gann volatility window analysis.
 */

export type EconomicImpact = 'HIGH' | 'MEDIUM' | 'LOW';

export type EconomicCurrency = 
  | 'USD' 
  | 'EUR' 
  | 'GBP' 
  | 'JPY' 
  | 'IDR' 
  | 'AUD' 
  | 'CAD' 
  | 'CHF' 
  | 'CNY';

export interface EconomicCalendarEvent {
  id: string;
  title: string;
  currency: EconomicCurrency;
  country: string;
  flag: string; // ISO country code or emoji
  timestamp: string; // ISO UTC string
  impact: EconomicImpact;
  actual?: number | string | null;
  forecast?: number | string | null;
  previous?: number | string | null;
  unit: string;
  period: string;
  description: string;
  sourceAgency: string;
  gannImpactNotes: string;
  historicalVolatilityPips?: number;
}

export interface CalendarFilterOptions {
  currency?: EconomicCurrency | 'ALL';
  impact?: EconomicImpact | 'ALL' | 'HIGH_MEDIUM';
  timeframe?: 'TODAY' | 'TOMORROW' | 'THIS_WEEK' | 'ALL';
  searchQuery?: string;
}

export interface CountdownResult {
  isPast: boolean;
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  urgency: 'IMMINENT' | 'SOON' | 'UPCOMING' | 'COMPLETED';
}

export interface SurpriseCalculation {
  diff: number | null;
  pctChange: number | null;
  direction: 'BULLISH' | 'BEARISH' | 'IN_LINE' | 'PENDING';
  formattedDiff: string;
  description: string;
}

export interface GannBlackoutWindow {
  isInWindow: boolean;
  minutesToRelease: number;
  status: 'BLACKOUT_ACTIVE' | 'HIGH_VOLATILITY_WARNING' | 'POST_RELEASE_REVERSAL_ZONE' | 'NORMAL';
  recommendation: string;
}

/**
 * Generate dynamic timestamps relative to current time so the calendar always feels alive and fresh,
 * while maintaining historical events and upcoming tier-1 releases.
 */
export function getInitialCalendarEvents(baseDate: Date = new Date()): EconomicCalendarEvent[] {
  const y = baseDate.getUTCFullYear();
  const m = baseDate.getUTCMonth();
  const d = baseDate.getUTCDate();

  // Helper to format UTC iso string
  const createRelativeIso = (dayOffset: number, hour: number, minute: number): string => {
    const dt = new Date(Date.UTC(y, m, d + dayOffset, hour, minute, 0));
    return dt.toISOString();
  };

  return [
    {
      id: 'fomc-interest-rate',
      title: 'FOMC Interest Rate Decision & Fed Funds Target',
      currency: 'USD',
      country: 'United States',
      flag: '🇺🇸',
      timestamp: createRelativeIso(0, 18, 0), // Today at 18:00 UTC
      impact: 'HIGH',
      actual: null,
      forecast: 4.50,
      previous: 4.75,
      unit: '%',
      period: 'Rate Decision',
      description: 'Keputusan suku bunga acuan Federal Reserve AS. Penurunan suku bunga 25 bps diekspektasikan pasar.',
      sourceAgency: 'Federal Reserve Board (FRB)',
      gannImpactNotes: 'Katalis utama XAU/USD. Seringkali membentuk puncak (high) atau lembah (low) pada siklus 90° atau 180° Gann Square of 9.',
      historicalVolatilityPips: 180
    },
    {
      id: 'fomc-press-conference',
      title: 'FOMC Press Conference (Jerome Powell)',
      currency: 'USD',
      country: 'United States',
      flag: '🇺🇸',
      timestamp: createRelativeIso(0, 18, 30),
      impact: 'HIGH',
      actual: null,
      forecast: null,
      previous: null,
      unit: 'Speech',
      period: 'Live Briefing',
      description: 'Konferensi pers Gubernur The Fed mengenai proyeksi inflasi dan arah pelonggaran moneter lanjutan.',
      sourceAgency: 'Federal Reserve Board (FRB)',
      gannImpactNotes: 'Volatilitas dua arah ekstrem. Pantau support/resistance Fibonacci 50% dan 61.8% intraday.',
      historicalVolatilityPips: 150
    },
    {
      id: 'us-cpi-yoy',
      title: 'US Core CPI (Consumer Price Index YoY)',
      currency: 'USD',
      country: 'United States',
      flag: '🇺🇸',
      timestamp: createRelativeIso(1, 12, 30), // Tomorrow at 12:30 UTC
      impact: 'HIGH',
      actual: null,
      forecast: 2.7,
      previous: 2.8,
      unit: '%',
      period: 'Bulanan',
      description: 'Indeks Harga Konsumen Inti tahunan (tidak termasuk makanan & energi). Ukuran utama inflasi The Fed.',
      sourceAgency: 'U.S. Bureau of Labor Statistics (BLS)',
      gannImpactNotes: 'Jika aktual lebih rendah dari konsensus, harga emas Spot (XAU/USD) cenderung melonjak menembus level resistensi Gann.',
      historicalVolatilityPips: 210
    },
    {
      id: 'us-nonfarm-payrolls',
      title: 'US Non-Farm Payrolls (NFP Employment Change)',
      currency: 'USD',
      country: 'United States',
      flag: '🇺🇸',
      timestamp: createRelativeIso(2, 12, 30),
      impact: 'HIGH',
      actual: null,
      forecast: 145,
      previous: 142,
      unit: 'K',
      period: 'Bulanan',
      description: 'Jumlah penambahan tenaga kerja non-pertanian bulanan di AS.',
      sourceAgency: 'U.S. Bureau of Labor Statistics (BLS)',
      gannImpactNotes: 'Lonjakan deviasi NFP > 30K biasanya memicu penembusan sudut 45° 1x1 Gann chart.',
      historicalVolatilityPips: 195
    },
    {
      id: 'ecb-monetary-policy',
      title: 'ECB Main Refinancing Rate Decision',
      currency: 'EUR',
      country: 'Eurozone',
      flag: '🇪🇺',
      timestamp: createRelativeIso(1, 13, 15),
      impact: 'HIGH',
      actual: null,
      forecast: 3.15,
      previous: 3.40,
      unit: '%',
      period: 'Rapat Dewan ECB',
      description: 'Keputusan tingkat suku bunga acuan Bank Sentral Eropa.',
      sourceAgency: 'European Central Bank (ECB)',
      gannImpactNotes: 'Dampak signifikan terhadap pasangan mata uang EUR/USD dan korelasi DXY terhadap komoditas.',
      historicalVolatilityPips: 110
    },
    {
      id: 'bi-rate-decision',
      title: 'Bank Indonesia (BI-Rate 7-Day Reverse Repo)',
      currency: 'IDR',
      country: 'Indonesia',
      flag: '🇮🇩',
      timestamp: createRelativeIso(2, 7, 0),
      impact: 'HIGH',
      actual: null,
      forecast: 6.00,
      previous: 6.00,
      unit: '%',
      period: 'Rapat Dewan Gubernur (RDG)',
      description: 'Keputusan suku bunga acuan Bank Indonesia untuk stabilitas rupiah dan pengendalian inflasi domestik.',
      sourceAgency: 'Bank Indonesia (BI)',
      gannImpactNotes: 'Mempengaruhi pasangan USD/IDR dan sentimen arus modal masuk (inflow) di pasar modal Asia Tenggara.',
      historicalVolatilityPips: 75
    },
    {
      id: 'boe-official-bank-rate',
      title: 'Bank of England Official Bank Rate',
      currency: 'GBP',
      country: 'United Kingdom',
      flag: '🇬🇧',
      timestamp: createRelativeIso(3, 11, 0),
      impact: 'HIGH',
      actual: null,
      forecast: 4.75,
      previous: 5.00,
      unit: '%',
      period: 'MPC Decision',
      description: 'Keputusan suku bunga Monetary Policy Committee BoE.',
      sourceAgency: 'Bank of England',
      gannImpactNotes: 'Memicu pergerakan tajam pada GBP/USD dan cross-pair GBP.',
      historicalVolatilityPips: 130
    },
    {
      id: 'us-initial-jobless-claims',
      title: 'US Initial Jobless Claims',
      currency: 'USD',
      country: 'United States',
      flag: '🇺🇸',
      timestamp: createRelativeIso(1, 12, 30),
      impact: 'MEDIUM',
      actual: null,
      forecast: 218,
      previous: 221,
      unit: 'K',
      period: 'Mingguan',
      description: 'Klaim awal tunjangan pengangguran mingguan Departemen Tenaga Kerja AS.',
      sourceAgency: 'U.S. Department of Labor',
      gannImpactNotes: 'Volatilitas jangka pendek 15-30 menit.',
      historicalVolatilityPips: 60
    },
    {
      id: 'boj-interest-rate',
      title: 'Bank of Japan Monetary Policy Decision',
      currency: 'JPY',
      country: 'Japan',
      flag: '🇯🇵',
      timestamp: createRelativeIso(3, 3, 0),
      impact: 'HIGH',
      actual: null,
      forecast: 0.50,
      previous: 0.25,
      unit: '%',
      period: 'MPM Statement',
      description: 'Keputusan target suku bunga jangka pendek Bank of Japan.',
      sourceAgency: 'Bank of Japan (BoJ)',
      gannImpactNotes: 'Menggerakkan USD/JPY secara masif, berdampak pada unwind carry trade global.',
      historicalVolatilityPips: 240
    },
    {
      id: 'us-ism-manufacturing-pmi',
      title: 'US ISM Manufacturing PMI',
      currency: 'USD',
      country: 'United States',
      flag: '🇺🇸',
      timestamp: createRelativeIso(-1, 14, 0), // Yesterday at 14:00 UTC (Released)
      impact: 'HIGH',
      actual: 49.2,
      forecast: 48.5,
      previous: 47.9,
      unit: 'Index',
      period: 'Bulan Lalu',
      description: 'Survei manajer pembelian manufaktur nasional oleh Institute for Supply Management.',
      sourceAgency: 'Institute for Supply Management (ISM)',
      gannImpactNotes: 'Aktual 49.2 mengungguli konsensus, memicu penguatan DXY jangka pendek.',
      historicalVolatilityPips: 90
    },
    {
      id: 'china-gdp-yoy',
      title: 'China GDP (Gross Domestic Product YoY)',
      currency: 'CNY',
      country: 'China',
      flag: '🇨🇳',
      timestamp: createRelativeIso(-1, 2, 0), // Released yesterday
      impact: 'HIGH',
      actual: 4.8,
      forecast: 4.6,
      previous: 4.7,
      unit: '%',
      period: 'Kuartalan',
      description: 'Pertumbuhan Produk Domestik Bruto tahunan ekonomi Tiongkok.',
      sourceAgency: 'National Bureau of Statistics of China',
      gannImpactNotes: 'Mendukung permintaan industri untuk komoditas tembaga dan logam mulia fisik.',
      historicalVolatilityPips: 85
    },
    {
      id: 'us-retail-sales',
      title: 'US Retail Sales (MoM Advance)',
      currency: 'USD',
      country: 'United States',
      flag: '🇺🇸',
      timestamp: createRelativeIso(0, 12, 30),
      impact: 'MEDIUM',
      actual: null,
      forecast: 0.4,
      previous: 0.1,
      unit: '%',
      period: 'Bulanan',
      description: 'Penjualan ritel bulanan AS mengukur belanja konsumsi masyarakat.',
      sourceAgency: 'U.S. Census Bureau',
      gannImpactNotes: 'Katalis pendukung sentimen sebelum rilis FOMC.',
      historicalVolatilityPips: 70
    },
    {
      id: 'australia-unemployment-rate',
      title: 'Australia Unemployment Rate',
      currency: 'AUD',
      country: 'Australia',
      flag: '🇦🇺',
      timestamp: createRelativeIso(1, 0, 30),
      impact: 'MEDIUM',
      actual: null,
      forecast: 4.1,
      previous: 4.2,
      unit: '%',
      period: 'Bulanan',
      description: 'Tingkat pengangguran resmi Biro Statistik Australia (ABS).',
      sourceAgency: 'Australian Bureau of Statistics',
      gannImpactNotes: 'Memandu volatilitas pasangan AUD/USD di sesi perdagangan Asia.',
      historicalVolatilityPips: 55
    }
  ];
}

/**
 * Filter economic calendar events by currency, impact, timeframe, and search text
 */
export function filterEconomicCalendarEvents(
  events: EconomicCalendarEvent[],
  filters: CalendarFilterOptions,
  currentTimestamp: number = Date.now()
): EconomicCalendarEvent[] {
  const { currency = 'ALL', impact = 'ALL', timeframe = 'ALL', searchQuery = '' } = filters;

  const nowDate = new Date(currentTimestamp);
  const startOfToday = new Date(Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), nowDate.getUTCDate())).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000 - 1;
  const startOfTomorrow = endOfToday + 1;
  const endOfTomorrow = startOfTomorrow + 24 * 60 * 60 * 1000 - 1;
  const endOfWeek = startOfToday + 7 * 24 * 60 * 60 * 1000 - 1;

  return events.filter(event => {
    const eventTime = new Date(event.timestamp).getTime();

    // Currency filter
    if (currency !== 'ALL' && event.currency !== currency) {
      return false;
    }

    // Impact filter
    if (impact === 'HIGH' && event.impact !== 'HIGH') {
      return false;
    }
    if (impact === 'HIGH_MEDIUM' && event.impact === 'LOW') {
      return false;
    }
    if (impact === 'MEDIUM' && event.impact !== 'MEDIUM') {
      return false;
    }
    if (impact === 'LOW' && event.impact !== 'LOW') {
      return false;
    }

    // Timeframe filter
    if (timeframe === 'TODAY') {
      if (eventTime < startOfToday || eventTime > endOfToday) return false;
    } else if (timeframe === 'TOMORROW') {
      if (eventTime < startOfTomorrow || eventTime > endOfTomorrow) return false;
    } else if (timeframe === 'THIS_WEEK') {
      if (eventTime < startOfToday - 24 * 60 * 60 * 1000 || eventTime > endOfWeek) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = event.title.toLowerCase().includes(q);
      const matchCurrency = event.currency.toLowerCase().includes(q);
      const matchCountry = event.country.toLowerCase().includes(q);
      const matchAgency = event.sourceAgency.toLowerCase().includes(q);
      if (!matchTitle && !matchCurrency && !matchCountry && !matchAgency) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Identify the closest upcoming high-impact event for countdown
 */
export function getNextUpcomingHighImpactEvent(
  events: EconomicCalendarEvent[],
  nowMs: number = Date.now()
): EconomicCalendarEvent | null {
  const upcomingHighImpact = events
    .filter(e => e.impact === 'HIGH')
    .filter(e => new Date(e.timestamp).getTime() > nowMs)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (upcomingHighImpact.length > 0) {
    return upcomingHighImpact[0];
  }

  // Fallback to any closest upcoming event if no high impact future event
  const anyUpcoming = events
    .filter(e => new Date(e.timestamp).getTime() > nowMs)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return anyUpcoming[0] || null;
}

/**
 * Real-time Countdown Calculator
 */
export function getEventCountdown(
  targetTimestamp: string,
  currentTimestamp: number = Date.now()
): CountdownResult {
  const targetMs = new Date(targetTimestamp).getTime();
  const diffMs = targetMs - currentTimestamp;

  if (diffMs <= 0) {
    return {
      isPast: true,
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: 'Dirilis (Data Tersedia)',
      urgency: 'COMPLETED'
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  let formatted = '';
  if (days > 0) {
    formatted = `${days}h ${pad(hours)}j ${pad(minutes)}m ${pad(seconds)}d`;
  } else {
    formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  let urgency: CountdownResult['urgency'] = 'UPCOMING';
  if (totalSeconds < 900) { // < 15 minutes
    urgency = 'IMMINENT';
  } else if (totalSeconds < 3600) { // < 1 hour
    urgency = 'SOON';
  }

  return {
    isPast: false,
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    formatted,
    urgency
  };
}

/**
 * Calculate Surprise Score (Actual vs Consensus/Forecast)
 */
export function calculateSurprise(
  actual: number | string | null | undefined,
  forecast: number | string | null | undefined
): SurpriseCalculation {
  if (actual === null || actual === undefined || forecast === null || forecast === undefined) {
    return {
      diff: null,
      pctChange: null,
      direction: 'PENDING',
      formattedDiff: 'Menunggu Rilis',
      description: 'Data aktual belum diumumkan oleh lembaga resmi.'
    };
  }

  const actNum = typeof actual === 'number' ? actual : parseFloat(String(actual));
  const fctNum = typeof forecast === 'number' ? forecast : parseFloat(String(forecast));

  if (isNaN(actNum) || isNaN(fctNum)) {
    return {
      diff: null,
      pctChange: null,
      direction: 'PENDING',
      formattedDiff: 'N/A',
      description: 'Format data bukan numerik standar.'
    };
  }

  const diff = Number((actNum - fctNum).toFixed(2));
  const pctChange = fctNum !== 0 ? Number(((diff / Math.abs(fctNum)) * 100).toFixed(2)) : 0;

  if (diff === 0) {
    return {
      diff: 0,
      pctChange: 0,
      direction: 'IN_LINE',
      formattedDiff: 'In-Line (0.00)',
      description: 'Sesuai dengan ekspektasi konsensus pasar.'
    };
  }

  const isPositive = diff > 0;
  return {
    diff,
    pctChange,
    direction: isPositive ? 'BULLISH' : 'BEARISH',
    formattedDiff: `${isPositive ? '+' : ''}${diff}`,
    description: isPositive 
      ? `Aktual melampaui konsensus sebesar +${diff} (${pctChange > 0 ? '+' : ''}${pctChange}%)`
      : `Aktual di bawah konsensus sebesar ${diff} (${pctChange}%)`
  };
}

/**
 * Determine Gann Volatility Blackout window around news release
 */
export function getGannVolatilityBlackout(
  eventTimestamp: string,
  currentTimestamp: number = Date.now(),
  windowMinutes: number = 30
): GannBlackoutWindow {
  const eventMs = new Date(eventTimestamp).getTime();
  const diffMinutes = (eventMs - currentTimestamp) / (60 * 1000);

  // If between -15 min (post release) and +windowMinutes (prior)
  if (diffMinutes <= windowMinutes && diffMinutes >= 0) {
    return {
      isInWindow: true,
      minutesToRelease: Math.round(diffMinutes),
      status: diffMinutes <= 5 ? 'BLACKOUT_ACTIVE' : 'HIGH_VOLATILITY_WARNING',
      recommendation: diffMinutes <= 5
        ? 'Jendela Blackout Rilis Berlangsung: Hindari eksekusi posisi baru, spread broker melebar tajam.'
        : `Peringatan Volatilitas Rilis: Tersisa ~${Math.round(diffMinutes)} menit. Amankan profit dan pasang Trailing Stop.`
    };
  }

  if (diffMinutes < 0 && diffMinutes >= -15) {
    return {
      isInWindow: true,
      minutesToRelease: Math.round(diffMinutes),
      status: 'POST_RELEASE_REVERSAL_ZONE',
      recommendation: 'Zona Penetrasi Awal: Waspadai false breakout sebelum struktur harga mengonfirmasi level Gann S1/R1.'
    };
  }

  return {
    isInWindow: false,
    minutesToRelease: Math.round(diffMinutes),
    status: 'NORMAL',
    recommendation: 'Kondisi Likuiditas Normal. Eksekusi sesuai matriks konfluensi Gann & Fibonacci.'
  };
}

/**
 * Helper to map country names to ISO currency codes and flags
 */
const COUNTRY_CURRENCY_MAP: Record<string, { currency: EconomicCurrency; flag: string }> = {
  'United States': { currency: 'USD', flag: '🇺🇸' },
  'US': { currency: 'USD', flag: '🇺🇸' },
  'Euro Zone': { currency: 'EUR', flag: '🇪🇺' },
  'Germany': { currency: 'EUR', flag: '🇩🇪' },
  'France': { currency: 'EUR', flag: '🇫🇷' },
  'Japan': { currency: 'JPY', flag: '🇯🇵' },
  'United Kingdom': { currency: 'GBP', flag: '🇬🇧' },
  'UK': { currency: 'GBP', flag: '🇬🇧' },
  'Indonesia': { currency: 'IDR', flag: '🇮🇩' },
  'Australia': { currency: 'AUD', flag: '🇦🇺' },
  'China': { currency: 'CNY', flag: '🇨🇳' },
  'Canada': { currency: 'CAD', flag: '🇨🇦' },
  'Switzerland': { currency: 'CHF', flag: '🇨🇭' },
};

/**
 * Determine impact level based on event title keywords
 */
function classifyEventImpact(title: string): EconomicImpact {
  const upper = title.toUpperCase();
  if (
    upper.includes('FOMC') || 
    upper.includes('RATE DECISION') || 
    upper.includes('INTEREST RATE') || 
    upper.includes('NON-FARM') || 
    upper.includes('PAYROLLS') || 
    upper.includes('NFP') || 
    upper.includes('CPI') || 
    upper.includes('INFLATION') || 
    upper.includes('GDP') || 
    upper.includes('JOBLESS CLAIMS') || 
    upper.includes('RETAIL SALES') || 
    upper.includes('PMI') || 
    upper.includes('BI-RATE')
  ) {
    return 'HIGH';
  }
  if (
    upper.includes('SPEAKS') || 
    upper.includes('CONFIDENCE') || 
    upper.includes('MORTGAGE') || 
    upper.includes('TRADE BALANCE') || 
    upper.includes('UNEMPLOYMENT') || 
    upper.includes('SENTIMENT')
  ) {
    return 'MEDIUM';
  }
  return 'LOW';
}

function cleanHtmlText(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw
    .replace(/&lt;br\s*\/*&gt;/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, '')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch Live Economic Calendar Data directly from NASDAQ Live Feed API
 */
export async function fetchLiveNasdaqEconomicEvents(targetDateStr?: string): Promise<EconomicCalendarEvent[]> {
  try {
    const today = targetDateStr || new Date().toISOString().split('T')[0];
    const url = `https://api.nasdaq.com/api/calendar/economicevents?date=${today}`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    });

    if (!res.ok) {
      console.warn('NASDAQ Economic API returned non-OK status:', res.status);
      return [];
    }

    const json = await res.json();
    const rows = json?.data?.rows;
    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    const parsedEvents: EconomicCalendarEvent[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const countryInfo = COUNTRY_CURRENCY_MAP[row.country] || { currency: 'USD', flag: '🌐' };
      const impact = classifyEventImpact(row.eventName || '');

      const actVal = cleanHtmlText(row.actual);
      const conVal = cleanHtmlText(row.consensus);
      const prevVal = cleanHtmlText(row.previous);

      // Construct timestamp
      const gmtTime = row.gmt || '12:00';
      const isoTimestamp = `${today}T${gmtTime}:00Z`;

      parsedEvents.push({
        id: `nasdaq-${today}-${i}-${row.country?.toLowerCase().replace(/\s+/g, '-')}`,
        title: cleanHtmlText(row.eventName),
        currency: countryInfo.currency,
        country: row.country || 'Global',
        flag: countryInfo.flag,
        timestamp: isoTimestamp,
        impact,
        actual: actVal && actVal !== '' ? actVal : null,
        forecast: conVal && conVal !== '' ? conVal : null,
        previous: prevVal && prevVal !== '' ? prevVal : null,
        unit: actVal.includes('%') || conVal.includes('%') ? '%' : (actVal.includes('K') || conVal.includes('K') ? 'K' : ''),
        period: 'Live Bursa',
        description: cleanHtmlText(row.description) || 'Laporan rilis data makroekonomi resmi publikasi bursa global.',
        sourceAgency: `NASDAQ Market Intelligence (${row.country})`,
        gannImpactNotes: impact === 'HIGH' 
          ? 'Rilis berpotensi tinggi memicu pengujian sudut 90°/180° Gann Square of 9.' 
          : 'Volatilitas lokal terukur pada siklus harian.',
        historicalVolatilityPips: impact === 'HIGH' ? 120 : 45
      });
    }

    return parsedEvents;
  } catch (err) {
    console.warn('Failed to fetch live NASDAQ economic events:', err);
    return [];
  }
}
