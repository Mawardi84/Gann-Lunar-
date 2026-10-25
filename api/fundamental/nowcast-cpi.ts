import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseClevelandFedNowcastHtml, ClevelandFedNowcastResult } from '../../src/utils/nowcast';

interface CacheEntry {
  timestamp: number;
  data: ClevelandFedNowcastResult;
}

let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=3600');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const now = Date.now();
  // Return cached result if fresh (< 6 hours)
  if (memoryCache && (now - memoryCache.timestamp) < CACHE_TTL_MS && memoryCache.data.available) {
    res.status(200).json(memoryCache.data);
    return;
  }

  const url = 'https://www.clevelandfed.org/indicators-and-data/inflation-nowcasting';

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Cleveland Fed returned status ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const parsed = parseClevelandFedNowcastHtml(html);
    parsed.cachedAt = now;

    if (parsed.available) {
      memoryCache = { timestamp: now, data: parsed };
      res.status(200).json(parsed);
      return;
    }

    // Honest fallback if parsing failed
    res.status(200).json({
      available: false,
      error: parsed.error || 'Nowcast tidak tersedia saat ini',
      source: 'Federal Reserve Bank of Cleveland',
      sourceUrl: url,
      mom: { cpi: null, coreCpi: null, pce: null, corePce: null },
      yoy: { cpi: null, coreCpi: null, pce: null, corePce: null },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(200).json({
      available: false,
      error: `Nowcast tidak tersedia saat ini (${msg})`,
      source: 'Federal Reserve Bank of Cleveland',
      sourceUrl: url,
      mom: { cpi: null, coreCpi: null, pce: null, corePce: null },
      yoy: { cpi: null, coreCpi: null, pce: null, corePce: null },
    });
  }
}
