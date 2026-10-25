import { test } from 'node:test';
import assert from 'node:assert';
import { 
  AuditTrailManager, 
  sanitizeUri, 
  generateVintageHash, 
  analyzePayloadStructure,
  auditTrail 
} from './auditTrail';

test('sanitizeUri correctly strips API keys and credentials from URLs', () => {
  const dirtyUrl1 = 'https://api.example.com/macro?token=secret123&indicator=cpi';
  const cleanUrl1 = sanitizeUri(dirtyUrl1);
  assert.ok(!cleanUrl1.includes('secret123'), 'Must redact token parameter');
  assert.ok(cleanUrl1.includes('REDACTED'), 'Must include redacted placeholder');
  assert.ok(cleanUrl1.includes('indicator=cpi'), 'Must keep harmless query parameters');

  const dirtyUrl2 = 'https://data.gov/release?api_key=AIzaSyD-XYZ999&period=2026-10';
  const cleanUrl2 = sanitizeUri(dirtyUrl2);
  assert.ok(!cleanUrl2.includes('AIzaSyD-XYZ999'), 'Must redact api_key');
  assert.ok(cleanUrl2.includes('REDACTED'), 'Must include redacted placeholder');
});

test('generateVintageHash produces deterministic format with QMAE prefix', () => {
  const hash1 = generateVintageHash({ actual: 150, consensus: 145 }, '2026-10-24T00:00:00Z');
  const hash2 = generateVintageHash({ actual: 150, consensus: 145 }, '2026-10-24T00:00:00Z');
  const hash3 = generateVintageHash({ actual: 180, consensus: 145 }, '2026-10-24T00:00:00Z');

  assert.strictEqual(hash1, hash2, 'Identical payload and timestamp must yield same hash');
  assert.notStrictEqual(hash1, hash3, 'Different payload must yield different hash');
  assert.ok(hash1.startsWith('QMAE-'), 'Hash must start with QMAE- prefix');
  assert.strictEqual(hash1.length, 13, 'Hash should follow QMAE-XXXXXXXX format');
});

test('analyzePayloadStructure correctly identifies objects, arrays, and keys', () => {
  // Test Object
  const obj = { actual: 2.5, consensus: 2.4, previous: 2.3, indicator: 'CPI' };
  const structObj = analyzePayloadStructure(obj);
  assert.strictEqual(structObj.schemaType, 'json_object');
  assert.strictEqual(structObj.fieldCount, 4);
  assert.ok(structObj.topLevelKeys?.includes('actual'));
  assert.strictEqual(structObj.hasRequiredMacroFields, true);

  // Test Array
  const arr = [
    { event: 'NFP', date: '2026-10-02', actual: 29 },
    { event: 'CPI', date: '2026-10-14', actual: 2.5 }
  ];
  const structArr = analyzePayloadStructure(arr);
  assert.strictEqual(structArr.schemaType, 'json_array');
  assert.strictEqual(structArr.recordCount, 2);
  assert.ok(structArr.topLevelKeys?.includes('actual'));

  // Test Null / Empty
  const structEmpty = analyzePayloadStructure(null);
  assert.strictEqual(structEmpty.schemaType, 'empty');
  assert.strictEqual(structEmpty.hasRequiredMacroFields, false);
});

test('AuditTrailManager logs fetch attempts and maintains ring buffer', () => {
  const manager = new AuditTrailManager(5);
  manager.clearLogs();

  const entry = manager.logFetchAttempt({
    sourceUri: 'https://api.nasdaq.com/api/calendar/economicevents?date=2026-10-24',
    httpMethod: 'GET',
    status: 'SUCCESS',
    statusCode: 200,
    durationMs: 145,
    domain: 'MACRO_ECONOMIC',
    institution: 'NASDAQ Market Intelligence',
    sourceName: 'NASDAQ Global Feed',
    indicatorCode: 'FOMC_CALENDAR',
    reportingPeriod: 'October 2026',
    dataStatus: 'VERIFIED',
    revisionVersion: 1,
    rawPayload: { rows: [{ title: 'Fed Rate Decision' }] }
  });

  assert.ok(entry.id.startsWith('audit-'));
  assert.strictEqual(entry.status, 'SUCCESS');
  assert.strictEqual(entry.status_code, 200);
  assert.strictEqual(entry.duration_ms, 145);
  assert.strictEqual(entry.domain, 'MACRO_ECONOMIC');
  assert.strictEqual(entry.provenance.institution, 'NASDAQ Market Intelligence');
  assert.strictEqual(entry.versioning.data_status, 'VERIFIED');
  assert.strictEqual(entry.versioning.revision_version, 1);
  assert.strictEqual(entry.versioning.bitemporal_point_in_time, true);
  assert.ok(entry.versioning.vintage_hash.startsWith('QMAE-'));

  // Test Capacity limit (max 5)
  for (let i = 0; i < 10; i++) {
    manager.logFetchAttempt({
      sourceUri: `https://api.example.com/item/${i}`,
      status: i % 2 === 0 ? 'SUCCESS' : 'FAILURE',
      durationMs: 50 + i,
      domain: 'MARKET_FEED',
    });
  }

  const logs = manager.getLogs();
  assert.strictEqual(logs.length, 5, 'Must respect max capacity limit');
});

test('AuditTrailManager filtering and stats calculations work accurately', () => {
  const manager = new AuditTrailManager(20);
  manager.clearLogs();

  manager.logFetchAttempt({
    sourceUri: 'https://api.bls.gov/timeseries/cpi',
    status: 'SUCCESS',
    durationMs: 120,
    domain: 'MACRO_ECONOMIC',
    institution: 'U.S. Bureau of Labor Statistics (BLS)',
    indicatorCode: 'CPI_HEADLINE',
  });

  manager.logFetchAttempt({
    sourceUri: 'https://api.gold-api.com/price/XAU',
    status: 'SUCCESS',
    durationMs: 80,
    domain: 'MARKET_FEED',
    institution: 'Gold API Direct',
  });

  manager.logFetchAttempt({
    sourceUri: 'https://api.federalreserve.gov/rates',
    status: 'ERROR',
    statusCode: 500,
    durationMs: 250,
    domain: 'CENTRAL_BANK',
    institution: 'Federal Reserve Board',
    errorMessage: 'Gateway Timeout',
  });

  // Filter by Domain
  const macroOnly = manager.getLogs({ domain: 'MACRO_ECONOMIC' });
  assert.strictEqual(macroOnly.length, 1);
  assert.strictEqual(macroOnly[0].provenance.institution, 'U.S. Bureau of Labor Statistics (BLS)');

  // Filter by Status
  const errorOnly = manager.getLogs({ status: 'ERROR' });
  assert.strictEqual(errorOnly.length, 1);
  assert.strictEqual(errorOnly[0].error_message, 'Gateway Timeout');

  // Search Query
  const searchQuery = manager.getLogs({ searchQuery: 'gold-api' });
  assert.strictEqual(searchQuery.length, 1);

  // Stats
  const stats = manager.getStats();
  assert.strictEqual(stats.totalAttempts, 3);
  assert.strictEqual(stats.successCount, 2);
  assert.strictEqual(stats.failureCount, 1);
  assert.strictEqual(stats.successRatePct, 66.7);
  assert.strictEqual(stats.domainBreakdown.MACRO_ECONOMIC, 1);
  assert.strictEqual(stats.domainBreakdown.MARKET_FEED, 1);
  assert.strictEqual(stats.domainBreakdown.CENTRAL_BANK, 1);

  // Export JSON
  const jsonStr = manager.exportLogsJson();
  const parsedExport = JSON.parse(jsonStr);
  assert.strictEqual(parsedExport.total_records, 3);
  assert.strictEqual(parsedExport.logs.length, 3);
});

test('AuditTrailManager subscription dispatches updates to listeners', () => {
  const manager = new AuditTrailManager(10);
  manager.clearLogs();

  let receivedLogId: string | null = null;
  const unsubscribe = manager.subscribe((entry) => {
    receivedLogId = entry.id;
  });

  const created = manager.logFetchAttempt({
    sourceUri: 'https://api.example.com/test',
    status: 'SUCCESS',
    durationMs: 40,
    domain: 'EXTERNAL_API',
  });

  assert.strictEqual(receivedLogId, created.id);

  // Test unsubscribe
  unsubscribe();
  manager.logFetchAttempt({
    sourceUri: 'https://api.example.com/test-after',
    status: 'SUCCESS',
    durationMs: 40,
  });

  // receivedLogId should remain created.id
  assert.strictEqual(receivedLogId, created.id);
});
