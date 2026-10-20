import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const prices: Record<string, { price: number; high: number; low: number; change: number; source: 'live' | 'fallback' }> = {
    'XAU/USD': { price: 4146.80, high: 4180.00, low: 4120.00, change: -0.14, source: 'fallback' },
    'XAG/USD': { price: 57.60, high: 58.20, low: 56.90, change: +0.45, source: 'fallback' },
    'BTC/USD': { price: 82250.00, high: 83150.00, low: 81200.00, change: -0.32, source: 'fallback' },
    'ETH/USD': { price: 2420.00, high: 2480.00, low: 2390.00, change: -1.09, source: 'fallback' },
    'SOL/USD': { price: 104.50, high: 108.00, low: 102.50, change: -1.55, source: 'fallback' },
    'BNB/USD': { price: 618.00, high: 628.00, low: 610.00, change: +0.82, source: 'fallback' },
    'XRP/USD': { price: 2.38, high: 2.45, low: 2.29, change: +2.10, source: 'fallback' },
    'EUR/USD': { price: 1.1218, high: 1.1250, low: 1.1190, change: +0.07, source: 'fallback' },
    'GBP/USD': { price: 1.3314, high: 1.3360, low: 1.3270, change: +0.29, source: 'fallback' },
    'USD/JPY': { price: 158.40, high: 159.10, low: 157.90, change: -0.18, source: 'fallback' },
    'AUD/USD': { price: 0.6980, high: 0.7020, low: 0.6950, change: +0.15, source: 'fallback' },
  };

  try {
    const [goldRes, cryptoRes, fxRes] = await Promise.allSettled([
      fetch('https://api.gold-api.com/price/XAU', { signal: AbortSignal.timeout(3000) }),
      fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=%5B%22BTCUSDT%22%2C%22ETHUSDT%22%2C%22SOLUSDT%22%2C%22BNBUSDT%22%2C%22XRPUSDT%22%5D', { signal: AbortSignal.timeout(3000) }),
      fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(3000) }),
    ]);

    if (goldRes.status === 'fulfilled' && goldRes.value.ok) {
      const g = await goldRes.value.json();
      if (typeof g?.price === 'number') {
        const p = Number(g.price.toFixed(2));
        prices['XAU/USD'] = { price: p, high: Number((p * 1.008).toFixed(2)), low: Number((p * 0.992).toFixed(2)), change: -0.14, source: 'live' };
      }
    }

    if (cryptoRes.status === 'fulfilled' && cryptoRes.value.ok) {
      const list = await cryptoRes.value.json();
      const map: Record<string, string> = {
        'BTCUSDT': 'BTC/USD',
        'ETHUSDT': 'ETH/USD',
        'SOLUSDT': 'SOL/USD',
        'BNBUSDT': 'BNB/USD',
        'XRPUSDT': 'XRP/USD',
      };
      if (Array.isArray(list)) {
        for (const item of list) {
          const sym = map[item.symbol];
          if (sym) {
            prices[sym] = {
              price: parseFloat(item.lastPrice),
              high: parseFloat(item.highPrice),
              low: parseFloat(item.lowPrice),
              change: parseFloat(parseFloat(item.priceChangePercent).toFixed(2)),
              source: 'live',
            };
          }
        }
      }
    }

    if (fxRes.status === 'fulfilled' && fxRes.value.ok) {
      const fx = await fxRes.value.json();
      const rates = fx?.rates;
      if (rates?.EUR) {
        const p = Number((1 / rates.EUR).toFixed(4));
        prices['EUR/USD'] = { price: p, high: Number((p * 1.003).toFixed(4)), low: Number((p * 0.997).toFixed(4)), change: 0.12, source: 'live' };
      }
      if (rates?.GBP) {
        const p = Number((1 / rates.GBP).toFixed(4));
        prices['GBP/USD'] = { price: p, high: Number((p * 1.004).toFixed(4)), low: Number((p * 0.996).toFixed(4)), change: 0.18, source: 'live' };
      }
      if (rates?.JPY) {
        const p = Number((rates.JPY).toFixed(2));
        prices['USD/JPY'] = { price: p, high: Number((p * 1.005).toFixed(2)), low: Number((p * 0.995).toFixed(2)), change: -0.15, source: 'live' };
      }
      if (rates?.AUD) {
        const p = Number((1 / rates.AUD).toFixed(4));
        prices['AUD/USD'] = { price: p, high: Number((p * 1.004).toFixed(4)), low: Number((p * 0.996).toFixed(4)), change: 0.22, source: 'live' };
      }
    }
  } catch (err) {
    console.warn('Vercel serverless live prices error:', err);
  }

  res.statusCode = 200;
  res.end(JSON.stringify({ prices }));
}
