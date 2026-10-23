import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getInitialCalendarEvents,
  filterEconomicCalendarEvents,
  getNextUpcomingHighImpactEvent,
  getEventCountdown,
  calculateSurprise,
  getGannVolatilityBlackout,
  fetchLiveNasdaqEconomicEvents
} from './economicCalendar';

test('getInitialCalendarEvents generates expected high-impact and multi-currency events', () => {
  const events = getInitialCalendarEvents();
  assert.ok(events.length >= 10, 'Should have at least 10 initial events');
  
  // Verify currency coverage
  const currencies = new Set(events.map(e => e.currency));
  assert.ok(currencies.has('USD'), 'Should include USD events');
  assert.ok(currencies.has('EUR'), 'Should include EUR events');
  assert.ok(currencies.has('IDR'), 'Should include IDR events (Bank Indonesia)');
  assert.ok(currencies.has('JPY'), 'Should include JPY events');

  // Verify FOMC exists
  const fomc = events.find(e => e.id === 'fomc-interest-rate');
  assert.ok(fomc, 'FOMC event must exist');
  assert.strictEqual(fomc?.impact, 'HIGH');
  assert.strictEqual(fomc?.currency, 'USD');
});

test('filterEconomicCalendarEvents correctly filters by currency', () => {
  const events = getInitialCalendarEvents();
  
  const usdEvents = filterEconomicCalendarEvents(events, { currency: 'USD' });
  assert.ok(usdEvents.length > 0, 'Should return USD events');
  assert.ok(usdEvents.every(e => e.currency === 'USD'), 'All returned events must be USD');

  const idrEvents = filterEconomicCalendarEvents(events, { currency: 'IDR' });
  assert.ok(idrEvents.length > 0, 'Should return IDR events');
  assert.ok(idrEvents.every(e => e.currency === 'IDR'), 'All returned events must be IDR');
});

test('filterEconomicCalendarEvents correctly filters by impact level', () => {
  const events = getInitialCalendarEvents();

  const highOnly = filterEconomicCalendarEvents(events, { impact: 'HIGH' });
  assert.ok(highOnly.length > 0);
  assert.ok(highOnly.every(e => e.impact === 'HIGH'), 'All events should be HIGH impact');

  const highMedium = filterEconomicCalendarEvents(events, { impact: 'HIGH_MEDIUM' });
  assert.ok(highMedium.every(e => e.impact === 'HIGH' || e.impact === 'MEDIUM'));
});

test('filterEconomicCalendarEvents filters by search query string', () => {
  const events = getInitialCalendarEvents();

  const searchFomc = filterEconomicCalendarEvents(events, { searchQuery: 'fomc' });
  assert.ok(searchFomc.length >= 1);
  assert.ok(searchFomc.some(e => e.title.includes('FOMC')));

  const searchIndonesia = filterEconomicCalendarEvents(events, { searchQuery: 'indonesia' });
  assert.ok(searchIndonesia.length >= 1);
  assert.strictEqual(searchIndonesia[0].currency, 'IDR');
});

test('getNextUpcomingHighImpactEvent selects the nearest future high-impact event', () => {
  const baseDate = new Date('2026-10-22T10:00:00Z');
  const nowMs = baseDate.getTime();
  const events = getInitialCalendarEvents(baseDate);

  const nextEvent = getNextUpcomingHighImpactEvent(events, nowMs);
  assert.ok(nextEvent, 'Should find an upcoming event');
  assert.strictEqual(nextEvent?.impact, 'HIGH');
  assert.ok(new Date(nextEvent.timestamp).getTime() > nowMs, 'Event must be in the future');
});

test('getEventCountdown calculates proper remaining time and urgency states', () => {
  const nowMs = 1700000000000;
  
  // 10 minutes in the future (< 15 min -> IMMINENT)
  const tenMinTarget = new Date(nowMs + 10 * 60 * 1000).toISOString();
  const imminent = getEventCountdown(tenMinTarget, nowMs);
  assert.strictEqual(imminent.isPast, false);
  assert.strictEqual(imminent.urgency, 'IMMINENT');
  assert.strictEqual(imminent.minutes, 10);
  assert.strictEqual(imminent.seconds, 0);

  // Past event
  const pastTarget = new Date(nowMs - 60000).toISOString();
  const past = getEventCountdown(pastTarget, nowMs);
  assert.strictEqual(past.isPast, true);
  assert.strictEqual(past.urgency, 'COMPLETED');
  assert.strictEqual(past.formatted, 'Dirilis (Data Tersedia)');
});

test('calculateSurprise computes surprise delta and directional sentiment', () => {
  // Positive surprise
  const bullish = calculateSurprise(180, 140);
  assert.strictEqual(bullish.diff, 40);
  assert.strictEqual(bullish.direction, 'BULLISH');
  assert.strictEqual(bullish.formattedDiff, '+40');

  // Negative surprise
  const bearish = calculateSurprise(2.4, 2.7);
  assert.strictEqual(bearish.diff, -0.3);
  assert.strictEqual(bearish.direction, 'BEARISH');

  // In-line
  const inLine = calculateSurprise(4.5, 4.5);
  assert.strictEqual(inLine.diff, 0);
  assert.strictEqual(inLine.direction, 'IN_LINE');

  // Pending
  const pending = calculateSurprise(null, 4.5);
  assert.strictEqual(pending.direction, 'PENDING');
});

test('getGannVolatilityBlackout detects blackout and normal periods correctly', () => {
  const nowMs = 1700000000000;

  // 3 minutes before release -> BLACKOUT_ACTIVE
  const closeEvent = new Date(nowMs + 3 * 60 * 1000).toISOString();
  const blackout = getGannVolatilityBlackout(closeEvent, nowMs);
  assert.strictEqual(blackout.isInWindow, true);
  assert.strictEqual(blackout.status, 'BLACKOUT_ACTIVE');

  // 120 minutes before release -> NORMAL
  const farEvent = new Date(nowMs + 120 * 60 * 1000).toISOString();
  const normal = getGannVolatilityBlackout(farEvent, nowMs);
  assert.strictEqual(normal.isInWindow, false);
  assert.strictEqual(normal.status, 'NORMAL');
});

test('fetchLiveNasdaqEconomicEvents handles online live data or graceful fallback', async () => {
  const events = await fetchLiveNasdaqEconomicEvents();
  assert.ok(Array.isArray(events), 'Should return an array');
  if (events.length > 0) {
    const first = events[0];
    assert.ok(first.id, 'Event must have an ID');
    assert.ok(first.title, 'Event must have a title');
    assert.ok(first.currency, 'Event must have a currency');
  }
});
