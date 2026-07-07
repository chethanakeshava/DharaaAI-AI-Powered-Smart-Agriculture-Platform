// Crop prediction engine
// Uses soil nutrients, climate conditions, and season to recommend suitable crops

interface CropPrediction {
  crop: string;
  confidence: number;
  suitability: 'high' | 'medium' | 'low';
}

// Crop requirements based on soil and climate conditions
const CROP_REQUIREMENTS: Record<string, { minN: number; maxN: number; minP: number; maxP: number; minK: number; maxK: number; minTemp: number; maxTemp: number; minPH: number; maxPH: number; minRainfall: number; maxRainfall: number; seasons: string[] }> = {
  Rice: {
    minN: 60, maxN: 150,
    minP: 30, maxP: 60,
    minK: 30, maxK: 60,
    minTemp: 22, maxTemp: 30,
    minPH: 5.5, maxPH: 7.0,
    minRainfall: 1000, maxRainfall: 2000,
    seasons: ['kharif', 'monsoon']
  },
  Wheat: {
    minN: 60, maxN: 120,
    minP: 30, maxP: 60,
    minK: 20, maxK: 50,
    minTemp: 15, maxTemp: 25,
    minPH: 6.0, maxPH: 7.5,
    minRainfall: 400, maxRainfall: 1000,
    seasons: ['rabi', 'winter']
  },
  Maize: {
    minN: 80, maxN: 150,
    minP: 40, maxP: 70,
    minK: 30, maxK: 60,
    minTemp: 18, maxTemp: 27,
    minPH: 5.8, maxPH: 7.0,
    minRainfall: 500, maxRainfall: 1200,
    seasons: ['kharif', 'summer']
  },
  Cotton: {
    minN: 60, maxN: 150,
    minP: 20, maxP: 50,
    minK: 30, maxK: 60,
    minTemp: 21, maxTemp: 30,
    minPH: 5.5, maxPH: 8.0,
    minRainfall: 500, maxRainfall: 1000,
    seasons: ['kharif']
  },
  Sugarcane: {
    minN: 100, maxN: 180,
    minP: 40, maxP: 80,
    minK: 60, maxK: 120,
    minTemp: 20, maxTemp: 35,
    minPH: 6.0, maxPH: 7.5,
    minRainfall: 1000, maxRainfall: 2000,
    seasons: ['kharif', 'annual']
  },
  Barley: {
    minN: 20, maxN: 80,
    minP: 30, maxP: 60,
    minK: 20, maxK: 50,
    minTemp: 12, maxTemp: 25,
    minPH: 6.0, maxPH: 7.5,
    minRainfall: 300, maxRainfall: 600,
    seasons: ['rabi', 'winter']
  },
  Sorghum: {
    minN: 20, maxN: 80,
    minP: 20, maxP: 50,
    minK: 30, maxK: 60,
    minTemp: 25, maxTemp: 32,
    minPH: 5.5, maxPH: 8.5,
    minRainfall: 300, maxRainfall: 700,
    seasons: ['kharif', 'summer']
  },
  Millets: {
    minN: 20, maxN: 60,
    minP: 20, maxP: 50,
    minK: 20, maxK: 50,
    minTemp: 25, maxTemp: 35,
    minPH: 5.0, maxPH: 8.0,
    minRainfall: 200, maxRainfall: 600,
    seasons: ['kharif']
  },
  Groundnut: {
    minN: 40, maxN: 80,
    minP: 20, maxP: 50,
    minK: 30, maxK: 60,
    minTemp: 22, maxTemp: 28,
    minPH: 6.0, maxPH: 7.5,
    minRainfall: 500, maxRainfall: 900,
    seasons: ['kharif']
  },
  Soybean: {
    minN: 40, maxN: 80,
    minP: 40, maxP: 70,
    minK: 20, maxK: 50,
    minTemp: 20, maxTemp: 30,
    minPH: 6.0, maxPH: 7.0,
    minRainfall: 500, maxRainfall: 1000,
    seasons: ['kharif']
  },
  Chickpea: {
    minN: 20, maxN: 60,
    minP: 40, maxP: 70,
    minK: 20, maxK: 50,
    minTemp: 18, maxTemp: 25,
    minPH: 6.0, maxPH: 7.5,
    minRainfall: 400, maxRainfall: 700,
    seasons: ['rabi', 'winter']
  },
  'Pigeon Pea': {
    minN: 20, maxN: 60,
    minP: 40, maxP: 70,
    minK: 20, maxK: 50,
    minTemp: 20, maxTemp: 30,
    minPH: 5.5, maxPH: 7.0,
    minRainfall: 500, maxRainfall: 1000,
    seasons: ['kharif']
  },
  Lentil: {
    minN: 20, maxN: 60,
    minP: 40, maxP: 70,
    minK: 20, maxK: 50,
    minTemp: 18, maxTemp: 24,
    minPH: 6.0, maxPH: 7.5,
    minRainfall: 300, maxRainfall: 700,
    seasons: ['rabi', 'winter']
  },
  'Black Gram': {
    minN: 20, maxN: 60,
    minP: 40, maxP: 70,
    minK: 20, maxK: 50,
    minTemp: 25, maxTemp: 35,
    minPH: 5.5, maxPH: 7.0,
    minRainfall: 500, maxRainfall: 900,
    seasons: ['kharif']
  },
  'Green Gram': {
    minN: 20, maxN: 60,
    minP: 40, maxP: 70,
    minK: 20, maxK: 50,
    minTemp: 25, maxTemp: 35,
    minPH: 6.0, maxPH: 7.0,
    minRainfall: 500, maxRainfall: 900,
    seasons: ['kharif']
  },
  Potato: {
    minN: 80, maxN: 150,
    minP: 40, maxP: 80,
    minK: 60, maxK: 120,
    minTemp: 15, maxTemp: 25,
    minPH: 5.0, maxPH: 6.5,
    minRainfall: 500, maxRainfall: 900,
    seasons: ['rabi', 'winter']
  },
  Tomato: {
    minN: 60, maxN: 120,
    minP: 40, maxP: 70,
    minK: 40, maxK: 80,
    minTemp: 20, maxTemp: 30,
    minPH: 5.5, maxPH: 7.0,
    minRainfall: 500, maxRainfall: 900,
    seasons: ['zaid', 'summer']
  },
  Onion: {
    minN: 60, maxN: 120,
    minP: 40, maxP: 70,
    minK: 40, maxK: 80,
    minTemp: 15, maxTemp: 30,
    minPH: 6.0, maxPH: 7.5,
    minRainfall: 300, maxRainfall: 600,
    seasons: ['rabi', 'winter']
  },
  Banana: {
    minN: 80, maxN: 150,
    minP: 40, maxP: 70,
    minK: 60, maxK: 120,
    minTemp: 25, maxTemp: 30,
    minPH: 5.5, maxPH: 7.0,
    minRainfall: 1500, maxRainfall: 2500,
    seasons: ['annual']
  },
  Mango: {
    minN: 60, maxN: 120,
    minP: 20, maxP: 50,
    minK: 40, maxK: 80,
    minTemp: 24, maxTemp: 30,
    minPH: 5.5, maxPH: 7.5,
    minRainfall: 500, maxRainfall: 1000,
    seasons: ['perennial']
  }
};

function calculateCropScore(
  nitrogen: number,
  phosphorus: number,
  potassium: number,
  temperature: number,
  ph: number,
  rainfall: number,
  season: string,
  crop: string
): number {
  const requirements = CROP_REQUIREMENTS[crop];
  if (!requirements) return 0;

  let score = 100;

  // Nitrogen score (0-100)
  if (nitrogen >= requirements.minN && nitrogen <= requirements.maxN) {
    score *= 1.0; // Full score
  } else if (nitrogen >= requirements.minN - 20 && nitrogen <= requirements.maxN + 20) {
    score *= 0.8; // 80% score (slightly off)
  } else {
    score *= 0.5; // 50% score (very off)
  }

  // Phosphorus score
  if (phosphorus >= requirements.minP && phosphorus <= requirements.maxP) {
    score *= 1.0;
  } else if (phosphorus >= requirements.minP - 15 && phosphorus <= requirements.maxP + 15) {
    score *= 0.8;
  } else {
    score *= 0.5;
  }

  // Potassium score
  if (potassium >= requirements.minK && potassium <= requirements.maxK) {
    score *= 1.0;
  } else if (potassium >= requirements.minK - 15 && potassium <= requirements.maxK + 15) {
    score *= 0.8;
  } else {
    score *= 0.5;
  }

  // Temperature score
  if (temperature >= requirements.minTemp && temperature <= requirements.maxTemp) {
    score *= 1.0;
  } else if (temperature >= requirements.minTemp - 3 && temperature <= requirements.maxTemp + 3) {
    score *= 0.85;
  } else {
    score *= 0.4;
  }

  // pH score
  if (ph >= requirements.minPH && ph <= requirements.maxPH) {
    score *= 1.0;
  } else if (ph >= requirements.minPH - 0.5 && ph <= requirements.maxPH + 0.5) {
    score *= 0.9;
  } else {
    score *= 0.5;
  }

  // Rainfall score
  if (rainfall >= requirements.minRainfall && rainfall <= requirements.maxRainfall) {
    score *= 1.0;
  } else if (rainfall >= requirements.minRainfall * 0.7 && rainfall <= requirements.maxRainfall * 1.2) {
    score *= 0.8;
  } else {
    score *= 0.5;
  }

  // Season compatibility
  if (requirements.seasons.includes(season.toLowerCase())) {
    score *= 1.0;
  } else {
    score *= 0.6;
  }

  return Math.max(0, Math.min(100, score));
}

export function predictCrops(
  nitrogen: number,
  phosphorus: number,
  potassium: number,
  temperature: number,
  ph: number,
  rainfall: number,
  season: string
): CropPrediction[] {
  const predictions: CropPrediction[] = [];

  // Calculate scores for all crops
  for (const crop of Object.keys(CROP_REQUIREMENTS)) {
    const score = calculateCropScore(
      nitrogen,
      phosphorus,
      potassium,
      temperature,
      ph,
      rainfall,
      season,
      crop
    );

    predictions.push({
      crop,
      confidence: score / 100,
      suitability: score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low'
    });
  }

  // Sort by confidence (descending)
  predictions.sort((a, b) => b.confidence - a.confidence);

  return predictions;
}
