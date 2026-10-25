import { test, describe } from 'node:test';
import assert from 'node:assert';
import { calculateLunarPhase } from './lunarCycle';

describe('Lunar Cycle Calculation Utility', () => {
  test('Verifikasi New Moon 1 Oktober 2024 (age ~0.5) -> phase New Moon', () => {
    const date = new Date('2024-10-01T12:00:00Z');
    const result = calculateLunarPhase(date);
    
    // Check that phase is New Moon
    assert.strictEqual(result.phase, 'New Moon');
    assert.strictEqual(result.volatilityWindow, true);
    assert.ok(result.oracleLabel.includes('New Moon'));
  });

  test('Verifikasi Full Moon 14 Oktober 2024 (age ~14.5) -> phase Full Moon', () => {
    const date = new Date('2024-10-14T12:00:00Z');
    const result = calculateLunarPhase(date);

    assert.strictEqual(result.phase, 'Full Moon');
    assert.strictEqual(result.volatilityWindow, true);
    assert.ok(result.oracleLabel.includes('Full Moon'));
  });

  test('Verifikasi illumination range 0-1 tidak pernah keluar batas', () => {
    // Test multiple dates across a month
    for (let day = 1; day <= 30; day++) {
      const date = new Date(2025, 0, day);
      const result = calculateLunarPhase(date);
      assert.ok(result.illumination >= 0.0, `Illumination ${result.illumination} should be >= 0`);
      assert.ok(result.illumination <= 1.0, `Illumination ${result.illumination} should be <= 1`);
      assert.ok(result.age >= 0.0, `Age ${result.age} should be >= 0`);
      assert.ok(result.age <= 29.54, `Age ${result.age} should be <= 29.54`);
    }
  });

  test('Verifikasi volatilityWindow = true saat Full Moon dan New Moon', () => {
    const newMoonDate = new Date('2024-10-01T12:00:00Z');
    const fullMoonDate = new Date('2024-10-14T12:00:00Z');

    const res1 = calculateLunarPhase(newMoonDate);
    const res2 = calculateLunarPhase(fullMoonDate);

    assert.strictEqual(res1.volatilityWindow, true);
    assert.strictEqual(res2.volatilityWindow, true);
  });
});
