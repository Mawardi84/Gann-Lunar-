/**
 * Quantitative Fundamental Analysis Engine Utilities for XAU/USD
 * Implements Economic Surprise Z-score, macro regime evaluation, and tier-1 event calendar.
 */

export interface MacroEventRecord {
  event_id: string;
  event_type: 'FOMC' | 'NFP' | 'CPI' | 'PPI';
  indicator_code: string;
  indicator_name: string;
  reporting_period: string;
  actual_value: number | null;
  consensus_value: number | null;
  previous_value: number | null;
  revised_previous: number | null;
  unit: string;
  release_time_utc: string;
  source_name: string;
  source_reference: string;
  data_status: 'VERIFIED' | 'ESTIMATED' | 'DISPUTED' | 'INSUFFICIENT_DATA';
  revision_version: number;
}

export const INITIAL_MACRO_EVENTS: MacroEventRecord[] = [
  {
    event_id: 'nfp-2026-04',
    event_type: 'NFP',
    indicator_code: 'NFP_CHANGE',
    indicator_name: 'Non-Farm Payrolls Employment Change',
    reporting_period: 'March 2026',
    actual_value: 220.0,
    consensus_value: 185.0,
    previous_value: 175.0,
    revised_previous: 180.0,
    unit: 'K (Thousands)',
    release_time_utc: '2026-04-03T12:30:00Z',
    source_name: 'U.S. Bureau of Labor Statistics (BLS)',
    source_reference: 'https://www.bls.gov/news.release/empsit.nr0.htm',
    data_status: 'VERIFIED',
    revision_version: 1
  },
  {
    event_id: 'cpi-2026-03',
    event_type: 'CPI',
    indicator_code: 'CORE_CPI_YOY',
    indicator_name: 'Core Consumer Price Index (YoY)',
    reporting_period: 'February 2026',
    actual_value: 2.8,
    consensus_value: 2.9,
    previous_value: 3.0,
    revised_previous: 3.0,
    unit: '%',
    release_time_utc: '2026-03-12T12:30:00Z',
    source_name: 'U.S. Bureau of Labor Statistics (BLS)',
    source_reference: 'https://www.bls.gov/cpi/',
    data_status: 'VERIFIED',
    revision_version: 1
  },
  {
    event_id: 'fomc-2026-03',
    event_type: 'FOMC',
    indicator_code: 'FED_FUNDS_RATE',
    indicator_name: 'FOMC Rate Decision (Target Range)',
    reporting_period: 'March 2026 Meeting',
    actual_value: 4.50,
    consensus_value: 4.50,
    previous_value: 4.50,
    revised_previous: 4.50,
    unit: '%',
    release_time_utc: '2026-03-18T18:00:00Z',
    source_name: 'Federal Reserve Board',
    source_reference: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260318a.htm',
    data_status: 'VERIFIED',
    revision_version: 1
  },
  {
    event_id: 'ppi-2026-03',
    event_type: 'PPI',
    indicator_code: 'CORE_PPI_MOM',
    indicator_name: 'Core Producer Price Index (MoM)',
    reporting_period: 'February 2026',
    actual_value: 0.3,
    consensus_value: 0.2,
    previous_value: 0.1,
    revised_previous: 0.1,
    unit: '%',
    release_time_utc: '2026-03-13T12:30:00Z',
    source_name: 'U.S. Bureau of Labor Statistics (BLS)',
    source_reference: 'https://www.bls.gov/ppi/',
    data_status: 'VERIFIED',
    revision_version: 1
  }
];

export function calculateEconomicSurprise(actual: number | null, consensus: number | null, historicalStdDev: number = 25.0) {
  if (actual === null || consensus === null) {
    return { surprise: null, zScore: null, status: 'INSUFFICIENT_DATA' as const };
  }
  const surprise = actual - consensus;
  const zScore = surprise / historicalStdDev;
  return {
    surprise: Number(surprise.toFixed(2)),
    zScore: Number(zScore.toFixed(2)),
    status: 'VERIFIED' as const
  };
}
