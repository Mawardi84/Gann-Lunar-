import { test } from 'node:test';
import assert from 'node:assert';
import { INITIAL_MACRO_EVENTS, calculateEconomicSurprise } from './fundamental';

test('INITIAL_MACRO_EVENTS contains accurately verified data for NFP, CPI, FOMC, and PPI', () => {
  assert.strictEqual(INITIAL_MACRO_EVENTS.length, 4);

  // NFP
  const nfp = INITIAL_MACRO_EVENTS.find(e => e.event_id === 'nfp-2026-04');
  assert.ok(nfp, 'NFP event must exist');
  assert.strictEqual(nfp.actual_value, 178.0);
  assert.strictEqual(nfp.consensus_value, 60.0);
  assert.strictEqual(nfp.previous_value, -92.0);
  assert.strictEqual(nfp.revised_previous, -133.0);
  assert.strictEqual(nfp.release_time_utc, '2026-04-03T12:30:00Z');
  assert.strictEqual(nfp.data_status, 'VERIFIED');

  // CPI
  const cpi = INITIAL_MACRO_EVENTS.find(e => e.event_id === 'cpi-2026-03');
  assert.ok(cpi, 'CPI event must exist');
  assert.strictEqual(cpi.actual_value, 2.5);
  assert.strictEqual(cpi.consensus_value, 2.5);
  assert.strictEqual(cpi.previous_value, 2.5);
  assert.strictEqual(cpi.revised_previous, 2.5);
  assert.strictEqual(cpi.release_time_utc, '2026-03-11T12:30:00Z');
  assert.strictEqual(cpi.data_status, 'VERIFIED');

  // FOMC
  const fomc = INITIAL_MACRO_EVENTS.find(e => e.event_id === 'fomc-2026-03');
  assert.ok(fomc, 'FOMC event must exist');
  assert.strictEqual(fomc.actual_value, 3.75);
  assert.strictEqual(fomc.consensus_value, 3.75);
  assert.strictEqual(fomc.previous_value, 3.75);
  assert.strictEqual(fomc.revised_previous, 3.75);
  assert.strictEqual(fomc.range_label, '3.50%–3.75%');
  assert.strictEqual(fomc.release_time_utc, '2026-03-18T18:00:00Z');
  assert.strictEqual(fomc.data_status, 'VERIFIED');

  // PPI
  const ppi = INITIAL_MACRO_EVENTS.find(e => e.event_id === 'ppi-2026-03');
  assert.ok(ppi, 'PPI event must exist');
  assert.strictEqual(ppi.actual_value, 0.5);
  assert.strictEqual(ppi.consensus_value, 0.3);
  assert.strictEqual(ppi.previous_value, 0.8);
  assert.strictEqual(ppi.revised_previous, 0.8);
  assert.strictEqual(ppi.release_time_utc, '2026-03-18T12:30:00Z');
  assert.strictEqual(ppi.source_name, 'U.S. Bureau of Labor Statistics (BLS)');
  assert.strictEqual(ppi.data_status, 'VERIFIED');
});

test('calculateEconomicSurprise correctly handles event-specific stddev and FOMC discrete assessment', () => {
  // NFP: surprise = 178 - 60 = 118, stdDev = 70 => zScore ~ 1.69
  const nfpRes = calculateEconomicSurprise(178.0, 60.0, 'NFP');
  assert.strictEqual(nfpRes.surprise, 118.0);
  assert.strictEqual(nfpRes.zScore, 1.69);
  assert.strictEqual(nfpRes.status, 'VERIFIED');
  assert.strictEqual(nfpRes.discreteAssessment, null);

  // CPI: surprise = 2.5 - 2.5 = 0.0, stdDev = 0.12 => zScore = 0.0
  const cpiRes = calculateEconomicSurprise(2.5, 2.5, 'CPI');
  assert.strictEqual(cpiRes.surprise, 0.0);
  assert.strictEqual(cpiRes.zScore, 0.0);
  assert.strictEqual(cpiRes.status, 'VERIFIED');

  // PPI: surprise = 0.5 - 0.3 = 0.2, stdDev = 0.12 => zScore ~ 1.67
  const ppiRes = calculateEconomicSurprise(0.5, 0.3, 'PPI');
  assert.strictEqual(ppiRes.surprise, 0.2);
  assert.strictEqual(ppiRes.zScore, 1.67);
  assert.strictEqual(ppiRes.status, 'VERIFIED');

  // FOMC: discrete assessment without continuous zScore
  const fomcResMatched = calculateEconomicSurprise(3.75, 3.75, 'FOMC');
  assert.strictEqual(fomcResMatched.surprise, 0.0);
  assert.strictEqual(fomcResMatched.zScore, null);
  assert.strictEqual(fomcResMatched.discreteAssessment, 'Sesuai Ekspektasi (Rate Hold In-Line)');

  const fomcResHawkish = calculateEconomicSurprise(4.0, 3.75, 'FOMC');
  assert.strictEqual(fomcResHawkish.discreteAssessment, 'Mengejutkan (Hawkish Surprise)');

  // Null input
  const nullRes = calculateEconomicSurprise(null, 60.0, 'NFP');
  assert.strictEqual(nullRes.status, 'INSUFFICIENT_DATA');
  assert.strictEqual(nullRes.surprise, null);
  assert.strictEqual(nullRes.zScore, null);
});
