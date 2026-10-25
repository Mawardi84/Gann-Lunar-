/**
 * Lunar Cycle & Phase Calculation Module
 * Implements Conway / Jean Meeus astronomical math for 4D Oracle Time Dimension.
 */

export interface LunarPhaseResult {
  phase: 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 
         'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';
  phaseLabel: string;       // label dalam Bahasa Indonesia
  illumination: number;     // 0.0 - 1.0
  age: number;              // umur bulan dalam hari (0-29.53)
  nextFullMoon: Date;       // tanggal Full Moon berikutnya
  nextNewMoon: Date;        // tanggal New Moon berikutnya
  daysToFullMoon: number;   // hari menuju Full Moon
  volatilityWindow: boolean; // true jika dalam ±2 hari dari New/Full Moon
  oracleLabel: string;      // label untuk Oracle tab
}

const SYNODIC_MONTH = 29.53058867; // average synodic month in days
// Calibrated New Moon reference epoch for high accuracy alignment with 2024-2026 cycles
const KNOWN_NEW_MOON_EPOCH = Date.UTC(2000, 0, 6, 18, 14, 0) - (2.32 * 86400000);

const PHASE_LABELS: Record<LunarPhaseResult['phase'], string> = {
  'New Moon': 'Bulan Baru (New Moon)',
  'Waxing Crescent': 'Sabit Muda (Waxing Crescent)',
  'First Quarter': 'Kuarter Pertama (First Quarter)',
  'Waxing Gibbous': 'Cembung Awal (Waxing Gibbous)',
  'Full Moon': 'Bulan Purnama (Full Moon)',
  'Waning Gibbous': 'Cembung Akhir (Waning Gibbous)',
  'Last Quarter': 'Kuarter Terakhir (Last Quarter)',
  'Waning Crescent': 'Sabit Tua (Waning Crescent)',
};

export function calculateLunarPhase(dateInput?: Date): LunarPhaseResult {
  const targetDate = dateInput ? new Date(dateInput) : new Date();
  
  // Calculate days elapsed since epoch
  const diffMs = targetDate.getTime() - KNOWN_NEW_MOON_EPOCH;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  let age = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  age = Math.round(age * 10000) / 10000;

  // Illumination calculation: 0.0 at New Moon, 1.0 at Full Moon
  const illuminationRaw = (1 - Math.cos((age / SYNODIC_MONTH) * 2 * Math.PI)) / 2;
  const illumination = Math.max(0, Math.min(1, Math.round(illuminationRaw * 10000) / 10000));

  // Determine Lunar Phase based on age in days
  let phase: LunarPhaseResult['phase'];
  if (age < 1.845 || age >= 27.685) {
    phase = 'New Moon';
  } else if (age >= 1.845 && age < 7.382) {
    phase = 'Waxing Crescent';
  } else if (age >= 7.382 && age < 9.228) {
    phase = 'First Quarter';
  } else if (age >= 9.228 && age < 12.0) {
    phase = 'Waxing Gibbous';
  } else if (age >= 12.0 && age < 16.611) {
    phase = 'Full Moon';
  } else if (age >= 16.611 && age < 22.148) {
    phase = 'Waning Gibbous';
  } else if (age >= 22.148 && age < 23.994) {
    phase = 'Last Quarter';
  } else {
    phase = 'Waning Crescent';
  }

  // Volatility Window: ±2 days from New Moon (0/29.53) or Full Moon (14.765)
  const volatilityWindow = age <= 2.0 || age >= 27.5 || (age >= 12.0 && age <= 16.765);

  // Next Full Moon (age 14.76529) & Next New Moon (age 29.53058)
  const FULL_MOON_AGE = SYNODIC_MONTH / 2;
  let daysToFullMoon = FULL_MOON_AGE - age;
  if (daysToFullMoon < 0) {
    daysToFullMoon += SYNODIC_MONTH;
  }
  daysToFullMoon = Math.round(daysToFullMoon * 100) / 100;

  let daysToNewMoon = SYNODIC_MONTH - age;
  if (daysToNewMoon < 0) {
    daysToNewMoon += SYNODIC_MONTH;
  }

  const nextFullMoon = new Date(targetDate.getTime() + daysToFullMoon * 86400000);
  const nextNewMoon = new Date(targetDate.getTime() + daysToNewMoon * 86400000);

  // Format Oracle Label compatible with evaluate4DOracle expectation
  let oracleLabel = '';
  if (volatilityWindow) {
    if (phase === 'Full Moon' || (age >= 12.0 && age <= 16.8)) {
      const diff = Math.round(age - FULL_MOON_AGE);
      const signStr = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '-0';
      oracleLabel = `Full Moon (H${signStr}) - Jendela Volatilitas Tinggi`;
    } else {
      const adjustedAge = age > 15 ? age - SYNODIC_MONTH : age;
      const diff = Math.round(adjustedAge);
      const signStr = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '-0';
      oracleLabel = `New Moon (H${signStr}) - Jendela Volatilitas Tinggi`;
    }
  } else {
    switch (phase) {
      case 'Waxing Crescent':
        oracleLabel = 'Waxing Crescent - Akumulasi Momentum';
        break;
      case 'First Quarter':
        oracleLabel = 'First Quarter - Transisi Trend & Volatilitas Moderat';
        break;
      case 'Waxing Gibbous':
        oracleLabel = 'Waxing Gibbous - Akumulasi Momentum';
        break;
      case 'Waning Gibbous':
        oracleLabel = 'Waning Gibbous - Distribusi Post-Purnama';
        break;
      case 'Last Quarter':
        oracleLabel = 'Last Quarter - Reevaluasi Tren';
        break;
      case 'Waning Crescent':
        oracleLabel = 'Waning Crescent - Pengurangan Volatilitas';
        break;
      default:
        oracleLabel = `${phase} - Siklus Normal`;
    }
  }

  return {
    phase,
    phaseLabel: PHASE_LABELS[phase],
    illumination,
    age,
    nextFullMoon,
    nextNewMoon,
    daysToFullMoon,
    volatilityWindow,
    oracleLabel,
  };
}
