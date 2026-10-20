import { test } from 'node:test';
import assert from 'node:assert';
import { fetchDirectLiveMarketPrices } from './marketFeeds';

test('fetchDirectLiveMarketPrices returns an object with price items when online', async () => {
  const prices = await fetchDirectLiveMarketPrices();
  assert.ok(typeof prices === 'object', 'Prices result must be an object');
  
  // If online, check structure of returned assets
  for (const [symbol, item] of Object.entries(prices)) {
    assert.ok(typeof item.price === 'number', `${symbol} price must be a number`);
    assert.ok(typeof item.high === 'number', `${symbol} high must be a number`);
    assert.ok(typeof item.low === 'number', `${symbol} low must be a number`);
    assert.ok(typeof item.change === 'number', `${symbol} change must be a number`);
    assert.strictEqual(item.source, 'live');
  }
});
