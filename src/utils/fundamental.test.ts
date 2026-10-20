import { test } from 'node:test';
import assert from 'node:assert';
import { INITIAL_MACRO_EVENTS, calculateEconomicSurprise } from './fundamental';

test('INITIAL_MACRO_EVENTS contains accurately verified and estimated tier-1 macro events', () => {
  assert.strictEqual(INITIAL_MACRO_EVENTS.length, 8);

  // 1. Verified NFP March 2026 (Released April 2026)
  const nfpVerified = INITIAL_MACRO_EVENTS.find(e => e.event_id === 'nfp-2026-04');
  assert.ok(nfpVerified, 'Verified NFP event must exist');
  assert.strictEqual(nfpVerified.actual_value, 178.0);
  assert.strictEqual(nfpVerified.consensus_value, 60.0);
  assert.strictEqual(nfpVerified.previous_value, -92.0);
  assert.strictEqual(nfpVerified.revised_previous, -133.0);
  assert.strictEqual(nfpVerified.release_time_utc, '2026-04-03T12:30:00Z');
  assert.strictEqual(nfpVerified.data_status, 'VERIFIED');

  // 2. Verified CPI February 2026 (Released March 11, 2026)
  const cpiVerified = INITIAL_MACRO_EVENTS.find(e => e.event_id === 'cpi-2026-03');
  assert.ok(cpiVerified, 'Verified CPI event must exist');
  assert.strictEqual(cpiVerified.actual_value, 2.5);
  assert.strictEqual(cpiVerified.consensus_value, 2.5);
  assert.strictEqual(cpiVerified.previous_value, 2.5);
  assert.strictEqual(cpiVerified.revised_previous, 2.5);
  assert.strictEqual(cpiVerified.release_time_utc, '2026-03-11T12:30:00Z');
  assert.strictEqual(cpiVerified.data_status, 'VERIFIED');

  // 3. Verified FOMC March 2026 (Released March 18, 2026)
  const fomcVerified = INITIAL_MACRO_EVENTS.find(e => e.event_id === 'fomc-2026-03');
  assert.ok(fomcVerified, 'Verified FOMC event must exist');
  assert.strictEqual(fomcVerified.actual_value, 3.75);
  assert.strictEqual(fomcVerified.consensus_value, 3.75);
  assert.strictEqual(fomcVerified.range_label, '3.50%–3.75%');
  assert.strictEqual(fomcVerified.data_status, 'VERIFIED');

  // 4. Verified PPI February 2026 (Released March 18, 2026)
  const ppiVerified = INITIAL_MACRO_EVENTS.find(e => e.event_id === 'ppi-2026-03');
  assert.ok(ppiVerified, 'Verified PPI event must exist');
  assert.strictEqual(ppiVerified.actual_value, 0.5);
  assert.strictEqual(ppiVerified.consensus_value, 0.3);
  assert.strictEqual(ppiVerified.previous_value, 0.8);
  assert.strictEqual(ppiVerified.revised_previous, 0.8);
  assert.strictEqual(ppiVerified.release_time_utc, '2026-03-18T12:30:00Z');
  assert.strictEqual(ppiVerified.data_status, 'VERIFIED');

  // 5. Recent NFP September 2026 (Released October 2026)
  const nfpLatest = INITIAL_MACRO_EVENTS.find(e => e.event_id === 'nfp-2026-10');
  assert.ok(nfpLatest, 'Latest NFP event must exist');
  assert.strictEqual(nfpLatest.actual_value, 142.0);
  assert.strictEqual(nfpLatest.consensus_value, 140.0);

  // 6. Recent CPI September 2026 (Released October 2026)
  const cpiLatest = INITIAL_MACRO_EVENTS.find(e => e.event_id === 'cpi-2026-10');
  assert.ok(cpiLatest, 'Latest CPI event must exist');
  assert.strictEqual(cpiLatest.actual_value, 2.6);
  assert.strictEqual(cpiLatest.consensus_value, 2.6);

  // 7. Recent FOMC September 2026
  const fomcLatest = INITIAL_MACRO_EVENTS.find(e => e.event_id === 'fomc-2026-09');
  assert.ok(fomcLatest, 'Latest FOMC event must exist');
  assert.strictEqual(fomcLatest.actual_value, 3.50);
  assert.strictEqual(fomcLatest.range_label, '3.25%–3.50%');

  // 8. Recent PPI September 2026 (Released October 2026)
  const ppiLatest = INITIAL_MACRO_EVENTS.find(e => e.event_id === 'ppi-2026-10');
  assert.ok(ppiLatest, 'Latest PPI event must exist');
  assert.strictEqual(ppiLatest.actual_value, 0.2);
  assert.strictEqual(ppiLatest.consensus_value, 0.2);
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
