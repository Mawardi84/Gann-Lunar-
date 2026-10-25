import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseClevelandFedNowcastHtml,
  calculateNowcastMarketBias,
  NON_CPI_NOWCAST_NOTICE,
  NOWCAST_DISCLAIMER
} from './nowcast';

const MOCK_CLEVELAND_FED_HTML = `
<!DOCTYPE html>
<html>
<body>
  <div class="content">
    <table id="" class="table-default">
      <caption>Inflation, month-over-month percent change</caption>
      <thead>
        <tr><th scope="col">Month</th><th scope="col">CPI</th><th scope="col">Core CPI</th><th scope="col">PCE</th><th scope="col">Core PCE</th><th scope="col">Updated</th></tr>
      </thead>
      <tbody>
        <tr><td>October 2026</td><td>0.25</td><td>0.21</td><td>0.27</td><td>0.25</td><td>10/23</td></tr>
        <tr><td>September 2026</td><td></td><td></td><td>0.47</td><td>0.28</td><td>10/23</td></tr>
      </tbody>
    </table>

    <table id="" class="table-default">
      <caption>Inflation, year-over-year percent change</caption>
      <thead>
        <tr><th scope="col">Month</th><th scope="col">CPI</th><th scope="col">Core CPI</th><th scope="col">PCE</th><th scope="col">Core PCE</th><th scope="col">Updated</th></tr>
      </thead>
      <tbody>
        <tr><td>October 2026</td><td>3.75</td><td>2.48</td><td>3.72</td><td>3.13</td><td>10/23</td></tr>
        <tr><td>September 2026</td><td></td><td></td><td>3.60</td><td>3.05</td><td>10/23</td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>
`;

test('parseClevelandFedNowcastHtml correctly extracts MoM, YoY, and Updated fields', () => {
  const result = parseClevelandFedNowcastHtml(MOCK_CLEVELAND_FED_HTML);
  assert.strictEqual(result.available, true);
  assert.strictEqual(result.month, 'October 2026');
  assert.strictEqual(result.asOf, '10/23');

  // MoM assertions
  assert.strictEqual(result.mom.cpi, 0.25);
  assert.strictEqual(result.mom.coreCpi, 0.21);
  assert.strictEqual(result.mom.pce, 0.27);
  assert.strictEqual(result.mom.corePce, 0.25);

  // YoY assertions
  assert.strictEqual(result.yoy.cpi, 3.75);
  assert.strictEqual(result.yoy.coreCpi, 2.48);
  assert.strictEqual(result.yoy.pce, 3.72);
  assert.strictEqual(result.yoy.corePce, 3.13);
});

test('parseClevelandFedNowcastHtml handles broken or empty HTML gracefully with honest fallback', () => {
  const emptyRes = parseClevelandFedNowcastHtml('');
  assert.strictEqual(emptyRes.available, false);
  assert.ok(emptyRes.error?.includes('Nowcast tidak tersedia saat ini'));

  const brokenRes = parseClevelandFedNowcastHtml('<div>No tables found here</div>');
  assert.strictEqual(brokenRes.available, false);
  assert.ok(brokenRes.error?.includes('Nowcast tidak tersedia saat ini'));
});

test('calculateNowcastMarketBias handles |gap| < 0.05 as NEUTRAL with minimal XAU/USD impact', () => {
  // gap = 2.48 - 2.50 = -0.02
  const res1 = calculateNowcastMarketBias(2.48, 2.50, 'CORE_CPI');
  assert.strictEqual(res1.hasNowcast, true);
  assert.strictEqual(res1.gap, -0.02);
  assert.strictEqual(res1.biasDirection, 'NEUTRAL');
  assert.strictEqual(res1.biasStrength, 'NONE');
  assert.ok(res1.biasLabel.includes('Netral'));

  // gap = 2.53 - 2.50 = +0.03
  const res2 = calculateNowcastMarketBias(2.53, 2.50, 'CPI');
  assert.strictEqual(res2.biasDirection, 'NEUTRAL');
  assert.strictEqual(res2.biasStrength, 'NONE');
  assert.ok(res2.biasLabel.includes('Netral'));
});

test('calculateNowcastMarketBias handles 0.05 <= |gap| < 0.15 as LIGHT Bullish or Bearish Gold', () => {
  // gap = 2.58 - 2.50 = +0.08 (hotter inflation -> bearish gold light)
  const bearishLight = calculateNowcastMarketBias(2.58, 2.50, 'CPI');
  assert.strictEqual(bearishLight.hasNowcast, true);
  assert.strictEqual(bearishLight.gap, 0.08);
  assert.strictEqual(bearishLight.biasDirection, 'BEARISH');
  assert.strictEqual(bearishLight.biasStrength, 'LIGHT');
  assert.strictEqual(bearishLight.biasLabel, 'Bias Bearish Gold (ringan)');

  // gap = 2.40 - 2.50 = -0.10 (cooler inflation -> bullish gold light)
  const bullishLight = calculateNowcastMarketBias(2.40, 2.50, 'CORE_CPI');
  assert.strictEqual(bullishLight.hasNowcast, true);
  assert.strictEqual(bullishLight.gap, -0.10);
  assert.strictEqual(bullishLight.biasDirection, 'BULLISH');
  assert.strictEqual(bullishLight.biasStrength, 'LIGHT');
  assert.strictEqual(bullishLight.biasLabel, 'Bias Bullish Gold (ringan)');
});

test('calculateNowcastMarketBias handles |gap| >= 0.15 as STRONG Bullish or Bearish Gold', () => {
  // gap = 2.75 - 2.50 = +0.25 (much hotter inflation -> bearish gold strong)
  const bearishStrong = calculateNowcastMarketBias(2.75, 2.50, 'CPI');
  assert.strictEqual(bearishStrong.hasNowcast, true);
  assert.strictEqual(bearishStrong.gap, 0.25);
  assert.strictEqual(bearishStrong.biasDirection, 'BEARISH');
  assert.strictEqual(bearishStrong.biasStrength, 'STRONG');
  assert.strictEqual(bearishStrong.biasLabel, 'Bias Bearish Gold (kuat)');

  // gap = 2.30 - 2.50 = -0.20 (much cooler inflation -> bullish gold strong)
  const bullishStrong = calculateNowcastMarketBias(2.30, 2.50, 'CORE_CPI');
  assert.strictEqual(bullishStrong.hasNowcast, true);
  assert.strictEqual(bullishStrong.gap, -0.20);
  assert.strictEqual(bullishStrong.biasDirection, 'BULLISH');
  assert.strictEqual(bullishStrong.biasStrength, 'STRONG');
  assert.strictEqual(bullishStrong.biasLabel, 'Bias Bullish Gold (kuat)');
});

test('calculateNowcastMarketBias shows explicit disclaimer and no numeric probability claims', () => {
  const res = calculateNowcastMarketBias(2.58, 2.50, 'CPI');
  assert.strictEqual(res.disclaimer, NOWCAST_DISCLAIMER);
  // Ensure no fabricated percentage probabilities (like "73%" or "65% win rate") appear in biasLabel
  assert.doesNotMatch(res.biasLabel, /\d+%/);
});

test('calculateNowcastMarketBias rejects non-CPI indicators with standard message', () => {
  const nfpRes = calculateNowcastMarketBias(150, 140, 'OTHER');
  assert.strictEqual(nfpRes.hasNowcast, false);
  assert.strictEqual(nfpRes.biasLabel, NON_CPI_NOWCAST_NOTICE);
  assert.strictEqual(nfpRes.biasDirection, 'UNAVAILABLE');

  const nullRes = calculateNowcastMarketBias(null, 2.50, 'CPI');
  assert.strictEqual(nullRes.hasNowcast, false);
  assert.strictEqual(nullRes.biasDirection, 'UNAVAILABLE');
});
