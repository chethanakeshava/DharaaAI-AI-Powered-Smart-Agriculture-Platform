/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Crop data model for admin management
 */
export interface Crop {
  id: string;
  name: string;
  season: 'Kharif' | 'Rabi' | 'Summer' | 'Year-round';
  waterRequired: number; // in mm
  nRequirement: number; // in kg/ha
  pRequirement: number; // in kg/ha
  kRequirement: number; // in kg/ha
  soilType: 'Sandy' | 'Loamy' | 'Clayey' | 'Silt';
  minTemp: number; // in Celsius
  maxTemp: number; // in Celsius
  growthPeriod: number; // in days
  yieldPotential: number; // in tons/hectare
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Extended Fertilizer model for admin management
 */
export interface Fertilizer {
  id: string;
  name: string;
  npkStatus: {
    n: 'Low' | 'Medium' | null;
    p: 'Low' | 'Medium' | null;
    k: 'Low' | 'Medium' | null;
  };
  soilPH: string;
  recommendedUse: string;
  benefits?: string[];
  price?: number; // per unit
  availability?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Fertilizer database with NPK status and soil pH requirements
 */
export interface FertilizerOption {
  name: string;
  npkStatus: {
    n: 'Low' | 'Medium' | null;
    p: 'Low' | 'Medium' | null;
    k: 'Low' | 'Medium' | null;
  };
  soilPH: string;
  recommendedUse: string;
  benefits?: string[];
}

export const FERTILIZER_DATABASE: FertilizerOption[] = [
  {
    name: 'Urea',
    npkStatus: { n: 'Low', p: null, k: null },
    soilPH: 'Neutral',
    recommendedUse: 'To increase nitrogen content',
    benefits: ['Quick nitrogen availability', 'Increases vegetative growth'],
  },
  {
    name: 'DAP (Di-Ammonium Phosphate)',
    npkStatus: { n: 'Medium', p: 'Low', k: null },
    soilPH: 'Neutral–Slightly Alkaline',
    recommendedUse: 'Nitrogen and phosphorus boost',
    benefits: ['Balanced N and P', 'Supports early growth'],
  },
  {
    name: 'SSP (Single Super Phosphate)',
    npkStatus: { n: null, p: 'Low', k: null },
    soilPH: 'Acidic–Neutral',
    recommendedUse: 'Improve phosphorus availability',
    benefits: ['Good source of phosphorus', 'Contains calcium and sulphur'],
  },
  {
    name: 'MOP (Muriate of Potash)',
    npkStatus: { n: null, p: null, k: 'Low' },
    soilPH: 'Neutral',
    recommendedUse: 'Increase potassium levels',
    benefits: ['Pure potassium source', 'Improves crop quality'],
  },
  {
    name: 'NPK (Balanced Fertilizer)',
    npkStatus: { n: 'Low', p: 'Low', k: 'Low' },
    soilPH: 'Neutral',
    recommendedUse: 'Overall nutrient balance',
    benefits: ['Complete nutrition', 'Balanced growth'],
  },
  {
    name: 'Ammonium Sulphate',
    npkStatus: { n: 'Low', p: null, k: null },
    soilPH: 'Alkaline',
    recommendedUse: 'Nitrogen with sulphur',
    benefits: ['Nitrogen plus sulphur', 'Suitable for alkaline soils'],
  },
  {
    name: 'Calcium Ammonium Nitrate',
    npkStatus: { n: 'Medium', p: null, k: null },
    soilPH: 'Neutral',
    recommendedUse: 'Quick nitrogen availability',
    benefits: ['Fast-acting nitrogen', 'Contains calcium'],
  },
  {
    name: 'Potassium Sulphate',
    npkStatus: { n: null, p: null, k: 'Low' },
    soilPH: 'Acidic',
    recommendedUse: 'Potassium without chloride',
    benefits: ['Chloride-free potassium', 'Suitable for sensitive crops'],
  },
  {
    name: 'Organic Compost',
    npkStatus: { n: 'Low', p: 'Low', k: 'Low' },
    soilPH: 'Any',
    recommendedUse: 'Improve soil health naturally',
    benefits: ['Improves soil structure', 'Increases microbial activity', 'Sustainable option'],
  },
  {
    name: 'Vermicompost',
    npkStatus: { n: 'Low', p: 'Low', k: 'Low' },
    soilPH: 'Any',
    recommendedUse: 'Enhance microbial activity',
    benefits: ['Rich in nutrients', 'Promotes beneficial microbes', 'Improves soil biology'],
  },
];

/**
 * Get NPK status level (Low, Medium, High) based on input values
 */
export function getNPKStatus(value: number, nutrient: 'n' | 'p' | 'k'): 'Low' | 'Medium' | 'High' {
  // Reference values for status classification (kg/ha)
  const thresholds = {
    n: { low: 40, medium: 80 },
    p: { low: 20, medium: 40 },
    k: { low: 40, medium: 80 },
  };

  const threshold = thresholds[nutrient];
  if (value < threshold.low) return 'Low';
  if (value < threshold.medium) return 'Medium';
  return 'High';
}

/**
 * Get soil pH category from soil type
 */
export function getSoilPHCategory(soilType: string): string {
  const phMap: { [key: string]: string } = {
    sandy: 'Neutral',
    loamy: 'Neutral',
    clayey: 'Neutral–Slightly Alkaline',
    silt: 'Neutral',
  };
  return phMap[soilType.toLowerCase()] || 'Neutral';
}

/**
 * Recommend fertilizers based on NPK levels and soil pH
 */
export function recommendFertilizers(
  nitrogen: number,
  phosphorus: number,
  potassium: number,
  soilType: string
): FertilizerOption[] {
  const nStatus = getNPKStatus(nitrogen, 'n');
  const pStatus = getNPKStatus(phosphorus, 'p');
  const kStatus = getNPKStatus(potassium, 'k');
  const soilPH = getSoilPHCategory(soilType);

  const recommendations: FertilizerOption[] = [];

  // Score each fertilizer based on NPK status match and soil pH compatibility
  const scored = FERTILIZER_DATABASE.map((fert) => {
    let score = 0;

    // Check NPK status match
    if (fert.npkStatus.n && nStatus !== 'High') {
      if (fert.npkStatus.n === nStatus) score += 3;
      else if (fert.npkStatus.n === 'Medium' && nStatus === 'Low') score += 2;
    }

    if (fert.npkStatus.p && pStatus !== 'High') {
      if (fert.npkStatus.p === pStatus) score += 3;
      else if (fert.npkStatus.p === 'Medium' && pStatus === 'Low') score += 2;
    }

    if (fert.npkStatus.k && kStatus !== 'High') {
      if (fert.npkStatus.k === kStatus) score += 3;
      else if (fert.npkStatus.k === 'Medium' && kStatus === 'Low') score += 2;
    }

    // Check soil pH compatibility
    const isPhCompatible = fert.soilPH === 'Any' || fert.soilPH.includes(soilPH.split('–')[0].trim());
    if (isPhCompatible) score += 2;

    return { fert, score };
  }).filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored.map(({ fert }) => fert);
}
