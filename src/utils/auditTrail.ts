/**
 * Centralized AuditTrail Utility for Macro Data Provenance, Versioning & External Fetch Tracking.
 * 
 * Fulfills Section 5 / P03 & P07 Data Specification requirements:
 * 1. Complete Provenance: Tracking source institution, official URI, retrieval method.
 * 2. Bitemporal Timestamping: UTC official time, converted local WIB time, ingestion time.
 * 3. Versioning & Vintage Integrity: Checksum hash, revision counters, verified/estimated status.
 * 4. Raw Payload Structure Analysis: Schema type, field counts, top-level keys, byte size, sanitized sample.
 * 5. Success / Failure Logging: HTTP codes, execution duration, network error captures.
 */

export type AuditLogStatus = 'SUCCESS' | 'FAILURE' | 'ERROR' | 'TIMEOUT' | 'IN_FLIGHT';

export type AuditDataDomain = 
  | 'MACRO_ECONOMIC' 
  | 'MARKET_FEED' 
  | 'AI_GROUNDING' 
  | 'CENTRAL_BANK' 
  | 'EXTERNAL_API';

export interface AuditPayloadStructure {
  schemaType: 'json_object' | 'json_array' | 'text' | 'empty' | 'binary' | 'error';
  fieldCount?: number;
  topLevelKeys?: string[];
  recordCount?: number;
  byteSize?: number;
  sampleSummary: string;
  hasRequiredMacroFields?: boolean;
}

export interface AuditLogProvenance {
  institution: string;
  source_name: string;
  source_reference_url?: string;
  indicator_code?: string;
  reporting_period?: string;
  retrieval_method: string;
}

export interface AuditLogVersioning {
  revision_version: number;
  data_status: 'VERIFIED' | 'ESTIMATED' | 'DISPUTED' | 'INSUFFICIENT_DATA';
  vintage_hash: string;
  bitemporal_point_in_time: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp_utc: string;
  timestamp_local: string;
  ingested_at_utc: string;
  source_uri: string;
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string;
  status: AuditLogStatus;
  status_code?: number;
  duration_ms: number;
  domain: AuditDataDomain;
  provenance: AuditLogProvenance;
  versioning: AuditLogVersioning;
  payload_structure: AuditPayloadStructure;
  error_message?: string;
  caller_context?: string;
}

export interface LogFetchParams {
  sourceUri: string;
  httpMethod?: string;
  status: AuditLogStatus;
  statusCode?: number;
  durationMs: number;
  domain?: AuditDataDomain;
  institution?: string;
  sourceName?: string;
  indicatorCode?: string;
  reportingPeriod?: string;
  retrievalMethod?: string;
  revisionVersion?: number;
  dataStatus?: 'VERIFIED' | 'ESTIMATED' | 'DISPUTED' | 'INSUFFICIENT_DATA';
  rawPayload?: unknown;
  errorMessage?: string;
  callerContext?: string;
}

export interface AuditTrailStats {
  totalAttempts: number;
  successCount: number;
  failureCount: number;
  successRatePct: number;
  averageDurationMs: number;
  domainBreakdown: Record<AuditDataDomain, number>;
  latestAttemptTimeUtc: string | null;
}

export interface AuditLogFilter {
  domain?: AuditDataDomain | 'ALL';
  status?: AuditLogStatus | 'ALL';
  searchQuery?: string;
  institution?: string;
  limit?: number;
}

/**
 * Sanitizes URLs to remove sensitive credentials (api_key, tokens, auth query params)
 */
export function sanitizeUri(rawUri: string): string {
  try {
    const url = new URL(rawUri);
    const sensitiveKeys = ['key', 'api_key', 'apikey', 'token', 'auth', 'secret', 'password', 'access_token'];
    for (const key of sensitiveKeys) {
      if (url.searchParams.has(key)) {
        url.searchParams.set(key, 'REDACTED');
      }
    }
    return decodeURIComponent(url.toString());
  } catch {
    // If not a full URL or relative path
    return rawUri.replace(/([?&](?:api_?key|apikey|token|auth|secret|password)=)[^&]+/gi, '$1REDACTED');
  }
}

/**
 * Generates deterministic 32-bit FNV-1a hash formatted as hex string
 */
export function generateVintageHash(data: unknown, timestamp: string): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data || '');
  const seed = `${timestamp}:${content}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `QMAE-${hex.toUpperCase()}`;
}

/**
 * Inspects and summarizes raw payload structure safely without logging gigabytes of data
 */
export function analyzePayloadStructure(payload: unknown): AuditPayloadStructure {
  if (payload === null || payload === undefined) {
    return {
      schemaType: 'empty',
      sampleSummary: 'Empty or null payload',
      byteSize: 0,
      fieldCount: 0,
      hasRequiredMacroFields: false,
    };
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return analyzePayloadStructure(parsed);
      } catch {
        // Raw string text
      }
    }
    return {
      schemaType: 'text',
      byteSize: payload.length,
      sampleSummary: payload.length > 120 ? `${payload.substring(0, 117)}...` : payload,
      hasRequiredMacroFields: false,
    };
  }

  if (Array.isArray(payload)) {
    const keys = payload.length > 0 && typeof payload[0] === 'object' && payload[0] !== null
      ? Object.keys(payload[0] as object)
      : [];
    
    const requiredKeys = ['actual', 'consensus', 'previous', 'date', 'timestamp', 'indicator', 'event'];
    const hasRequired = requiredKeys.some(k => keys.some(rk => rk.toLowerCase().includes(k)));

    let byteSize = 0;
    try {
      byteSize = JSON.stringify(payload).length;
    } catch {}

    return {
      schemaType: 'json_array',
      recordCount: payload.length,
      fieldCount: keys.length,
      topLevelKeys: keys.slice(0, 10),
      byteSize,
      sampleSummary: `Array with ${payload.length} records. Sample keys: [${keys.slice(0, 5).join(', ')}]`,
      hasRequiredMacroFields: hasRequired,
    };
  }

  if (typeof payload === 'object') {
    const keys = Object.keys(payload as object);
    const requiredKeys = ['price', 'actual', 'consensus', 'previous', 'rows', 'data', 'indicators'];
    const hasRequired = requiredKeys.some(k => keys.some(rk => rk.toLowerCase().includes(k)));

    let byteSize = 0;
    try {
      byteSize = JSON.stringify(payload).length;
    } catch {}

    return {
      schemaType: 'json_object',
      fieldCount: keys.length,
      topLevelKeys: keys.slice(0, 12),
      byteSize,
      sampleSummary: `Object with fields: [${keys.slice(0, 6).join(', ')}${keys.length > 6 ? '...' : ''}]`,
      hasRequiredMacroFields: hasRequired,
    };
  }

  return {
    schemaType: 'text',
    sampleSummary: String(payload),
    byteSize: String(payload).length,
    hasRequiredMacroFields: false,
  };
}

/**
 * AuditTrail Manager Class
 */
export class AuditTrailManager {
  private logs: AuditLogEntry[] = [];
  private maxCapacity: number = 500;
  private listeners: Set<(entry: AuditLogEntry) => void> = new Set();
  private storageKey: string = 'qmae_audit_trail_logs';

  constructor(maxCapacity: number = 500) {
    this.maxCapacity = maxCapacity;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.logs = parsed.slice(-this.maxCapacity);
        }
      }
    } catch {
      // Graceful fallback for SSR or restricted environments
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs.slice(-100)));
    } catch {
      // Storage quota or restriction protection
    }
  }

  /**
   * Log an external fetch attempt with complete Section 5 provenance & versioning
   */
  public logFetchAttempt(params: LogFetchParams): AuditLogEntry {
    const now = new Date();
    const timestampUtc = now.toISOString();
    const timestampLocal = now.toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: 'Asia/Jakarta'
    }) + ' WIB';

    const cleanUri = sanitizeUri(params.sourceUri);
    const payloadStructure = analyzePayloadStructure(params.rawPayload);
    const vintageHash = generateVintageHash(params.rawPayload || params.sourceUri, timestampUtc);

    const entry: AuditLogEntry = {
      id: `audit-${now.getTime()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp_utc: timestampUtc,
      timestamp_local: timestampLocal,
      ingested_at_utc: timestampUtc,
      source_uri: cleanUri,
      http_method: (params.httpMethod || 'GET').toUpperCase(),
      status: params.status,
      status_code: params.statusCode,
      duration_ms: Math.max(0, Math.round(params.durationMs)),
      domain: params.domain || 'MACRO_ECONOMIC',
      provenance: {
        institution: params.institution || 'Primary Official Agency',
        source_name: params.sourceName || 'Central Bank / Statistical Bureau',
        source_reference_url: cleanUri,
        indicator_code: params.indicatorCode,
        reporting_period: params.reportingPeriod,
        retrieval_method: params.retrievalMethod || 'Direct REST / HTTPS Ingestion',
      },
      versioning: {
        revision_version: params.revisionVersion ?? 1,
        data_status: params.dataStatus || (params.status === 'SUCCESS' ? 'VERIFIED' : 'ESTIMATED'),
        vintage_hash: vintageHash,
        bitemporal_point_in_time: true,
      },
      payload_structure: payloadStructure,
      error_message: params.errorMessage,
      caller_context: params.callerContext,
    };

    // Prepend to ring buffer
    this.logs.unshift(entry);
    if (this.logs.length > this.maxCapacity) {
      this.logs.length = this.maxCapacity;
    }

    this.saveToStorage();

    // Notify active listeners
    for (const listener of this.listeners) {
      try {
        listener(entry);
      } catch (err) {
        console.warn('AuditTrail listener callback error:', err);
      }
    }

    return entry;
  }

  /**
   * High-level wrapper around native fetch that transparently logs attempts
   */
  public async wrapFetch<T = unknown>(
    sourceUri: string,
    fetchFn: () => Promise<Response>,
    meta?: Partial<LogFetchParams>
  ): Promise<{ response: Response; data?: T; auditEntry: AuditLogEntry }> {
    const startTime = Date.now();
    try {
      const response = await fetchFn();
      const durationMs = Date.now() - startTime;
      let rawPayload: unknown = null;

      // Clone response to inspect body without consuming the original stream
      try {
        const cloned = response.clone();
        const text = await cloned.text();
        try {
          rawPayload = JSON.parse(text);
        } catch {
          rawPayload = text;
        }
      } catch {
        rawPayload = '[Payload unreadable or stream consumed]';
      }

      const status: AuditLogStatus = response.ok ? 'SUCCESS' : 'FAILURE';
      const auditEntry = this.logFetchAttempt({
        sourceUri,
        httpMethod: meta?.httpMethod || 'GET',
        status,
        statusCode: response.status,
        durationMs,
        domain: meta?.domain || 'MACRO_ECONOMIC',
        institution: meta?.institution,
        sourceName: meta?.sourceName,
        indicatorCode: meta?.indicatorCode,
        reportingPeriod: meta?.reportingPeriod,
        retrievalMethod: meta?.retrievalMethod || 'HTTPS Ingestion',
        rawPayload,
        errorMessage: !response.ok ? `HTTP ${response.status} ${response.statusText}` : undefined,
        callerContext: meta?.callerContext,
      });

      return { response, data: rawPayload as T, auditEntry };
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);
      const auditEntry = this.logFetchAttempt({
        sourceUri,
        httpMethod: meta?.httpMethod || 'GET',
        status: 'ERROR',
        durationMs,
        domain: meta?.domain || 'MACRO_ECONOMIC',
        institution: meta?.institution,
        sourceName: meta?.sourceName,
        indicatorCode: meta?.indicatorCode,
        reportingPeriod: meta?.reportingPeriod,
        rawPayload: { error: errorMsg },
        errorMessage: errorMsg,
        callerContext: meta?.callerContext,
      });
      throw err;
    }
  }

  /**
   * Retrieves audit logs with optional domain/status/text filtering
   */
  public getLogs(filter?: AuditLogFilter): AuditLogEntry[] {
    if (!filter) return [...this.logs];

    return this.logs.filter(entry => {
      if (filter.domain && filter.domain !== 'ALL' && entry.domain !== filter.domain) {
        return false;
      }
      if (filter.status && filter.status !== 'ALL' && entry.status !== filter.status) {
        return false;
      }
      if (filter.institution && !entry.provenance.institution.toLowerCase().includes(filter.institution.toLowerCase())) {
        return false;
      }
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const matchesUri = entry.source_uri.toLowerCase().includes(q);
        const matchesInstitution = entry.provenance.institution.toLowerCase().includes(q);
        const matchesSourceName = entry.provenance.source_name.toLowerCase().includes(q);
        const matchesCode = (entry.provenance.indicator_code || '').toLowerCase().includes(q);
        const matchesPeriod = (entry.provenance.reporting_period || '').toLowerCase().includes(q);
        const matchesHash = entry.versioning.vintage_hash.toLowerCase().includes(q);
        if (!matchesUri && !matchesInstitution && !matchesSourceName && !matchesCode && !matchesPeriod && !matchesHash) {
          return false;
        }
      }
      return true;
    }).slice(0, filter.limit || this.maxCapacity);
  }

  /**
   * Get specific log entry by its unique audit ID
   */
  public getLogById(id: string): AuditLogEntry | undefined {
    return this.logs.find(l => l.id === id);
  }

  /**
   * Calculates real-time analytics & health metrics of external data fetching
   */
  public getStats(): AuditTrailStats {
    const total = this.logs.length;
    const successes = this.logs.filter(l => l.status === 'SUCCESS').length;
    const failures = this.logs.filter(l => l.status === 'FAILURE' || l.status === 'ERROR' || l.status === 'TIMEOUT').length;
    const totalDuration = this.logs.reduce((acc, l) => acc + l.duration_ms, 0);

    const domainBreakdown: Record<AuditDataDomain, number> = {
      MACRO_ECONOMIC: 0,
      MARKET_FEED: 0,
      AI_GROUNDING: 0,
      CENTRAL_BANK: 0,
      EXTERNAL_API: 0,
    };

    for (const log of this.logs) {
      if (domainBreakdown[log.domain] !== undefined) {
        domainBreakdown[log.domain]++;
      }
    }

    return {
      totalAttempts: total,
      successCount: successes,
      failureCount: failures,
      successRatePct: total > 0 ? Number(((successes / total) * 100).toFixed(1)) : 100,
      averageDurationMs: total > 0 ? Math.round(totalDuration / total) : 0,
      domainBreakdown,
      latestAttemptTimeUtc: this.logs[0]?.timestamp_utc || null,
    };
  }

  /**
   * Subscribes to new audit log arrivals (returns unsubscribe callback)
   */
  public subscribe(listener: (entry: AuditLogEntry) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Exports full audit logs in structured JSON format
   */
  public exportLogsJson(): string {
    return JSON.stringify(
      {
        exported_at_utc: new Date().toISOString(),
        stats: this.getStats(),
        total_records: this.logs.length,
        logs: this.logs,
      },
      null,
      2
    );
  }

  /**
   * Clears in-memory and stored audit logs
   */
  public clearLogs(): void {
    this.logs = [];
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.storageKey);
      } catch {}
    }
  }
}

// Global Singleton Instance
export const auditTrail = new AuditTrailManager();

// Functional Shortcuts
export function logExternalFetch(params: LogFetchParams): AuditLogEntry {
  return auditTrail.logFetchAttempt(params);
}

export function getAuditLogs(filter?: AuditLogFilter): AuditLogEntry[] {
  return auditTrail.getLogs(filter);
}

export function getAuditStats(): AuditTrailStats {
  return auditTrail.getStats();
}
