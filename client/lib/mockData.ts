/**
 * Mock data for ML predictions when the FastAPI server is unavailable
 * Used for development and testing purposes
 */

import { recommendFertilizers } from '@shared/api';

export interface MockCropPrediction {
  crop: string;
  confidence: number;
}

export interface MockFertilizerPrediction {
  fertilizer: string;
  dose?: number;
  confidence: number;
}

// Crop requirements database based on agronomic data
interface CropRequirements {
  nitrogen: 'Low' | 'Medium' | 'High';
  phosphorus: 'Low' | 'Medium' | 'High';
  potassium: 'Low' | 'Medium' | 'High';
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  phMin: number;
  phMax: number;
  rainfallMin: number;
  rainfallMax: number;
  seasons: string[];
}

const CROP_DATABASE: { [key: string]: CropRequirements } = {
  'Rice': {
    nitrogen: 'High',
    phosphorus: 'Medium',
    potassium: 'Medium',
    tempMin: 22, tempMax: 30,
    humidityMin: 60, humidityMax: 100,
    phMin: 5.5, phMax: 7.0,
    rainfallMin: 1000, rainfallMax: 2000,
    seasons: ['kharif', 'monsoon']
  },
  'Wheat': {
    nitrogen: 'Medium',
    phosphorus: 'Medium',
    potassium: 'Low',
    tempMin: 15, tempMax: 25,
    humidityMin: 40, humidityMax: 70,
    phMin: 6.0, phMax: 7.5,
    rainfallMin: 400, rainfallMax: 1000,
    seasons: ['rabi', 'winter']
  },
  'Maize': {
    nitrogen: 'Medium',
    phosphorus: 'Medium',
    potassium: 'Medium',
    tempMin: 18, tempMax: 27,
    humidityMin: 40, humidityMax: 70,
    phMin: 5.8, phMax: 7.0,
    rainfallMin: 500, rainfallMax: 1200,
    seasons: ['kharif', 'summer']
  },
  'Cotton': {
    nitrogen: 'High',
    phosphorus: 'Low',
    potassium: 'Medium',
    tempMin: 21, tempMax: 30,
    humidityMin: 30, humidityMax: 60,
    phMin: 5.5, phMax: 8.0,
    rainfallMin: 500, rainfallMax: 1000,
    seasons: ['kharif']
  },
  'Sugarcane': {
    nitrogen: 'High',
    phosphorus: 'Medium',
    potassium: 'High',
    tempMin: 20, tempMax: 35,
    humidityMin: 60, humidityMax: 100,
    phMin: 6.0, phMax: 7.5,
    rainfallMin: 1000, rainfallMax: 2000,
    seasons: ['kharif', 'annual']
  },
  'Barley': {
    nitrogen: 'Low',
    phosphorus: 'Medium',
    potassium: 'Low',
    tempMin: 12, tempMax: 25,
    humidityMin: 20, humidityMax: 50,
    phMin: 6.0, phMax: 7.5,
    rainfallMin: 300, rainfallMax: 600,
    seasons: ['rabi', 'winter']
  },
  'Sorghum': {
    nitrogen: 'Low',
    phosphorus: 'Low',
    potassium: 'Medium',
    tempMin: 25, tempMax: 32,
    humidityMin: 20, humidityMax: 50,
    phMin: 5.5, phMax: 8.5,
    rainfallMin: 300, rainfallMax: 700,
    seasons: ['kharif', 'summer']
  },
  'Millets': {
    nitrogen: 'Low',
    phosphorus: 'Low',
    potassium: 'Low',
    tempMin: 25, tempMax: 35,
    humidityMin: 20, humidityMax: 50,
    phMin: 5.0, phMax: 8.0,
    rainfallMin: 200, rainfallMax: 600,
    seasons: ['kharif']
  },
  'Groundnut': {
    nitrogen: 'Medium',
    phosphorus: 'Low',
    potassium: 'Medium',
    tempMin: 22, tempMax: 28,
    humidityMin: 40, humidityMax: 70,
    phMin: 6.0, phMax: 7.5,
    rainfallMin: 500, rainfallMax: 900,
    seasons: ['kharif']
  },
  'Soybean': {
    nitrogen: 'Medium',
    phosphorus: 'Medium',
    potassium: 'Low',
    tempMin: 20, tempMax: 30,
    humidityMin: 60, humidityMax: 100,
    phMin: 6.0, phMax: 7.0,
    rainfallMin: 500, rainfallMax: 1000,
    seasons: ['kharif']
  },
  'Chickpea': {
    nitrogen: 'Low',
    phosphorus: 'Medium',
    potassium: 'Low',
    tempMin: 18, tempMax: 25,
    humidityMin: 20, humidityMax: 50,
    phMin: 6.0, phMax: 7.5,
    rainfallMin: 400, rainfallMax: 700,
    seasons: ['rabi', 'winter']
  },
  'Pigeon Pea': {
    nitrogen: 'Low',
    phosphorus: 'Medium',
    potassium: 'Low',
    tempMin: 20, tempMax: 30,
    humidityMin: 40, humidityMax: 70,
    phMin: 5.5, phMax: 7.0,
    rainfallMin: 500, rainfallMax: 1000,
    seasons: ['kharif']
  },
  'Lentil': {
    nitrogen: 'Low',
    phosphorus: 'Medium',
    potassium: 'Low',
    tempMin: 18, tempMax: 24,
    humidityMin: 20, humidityMax: 50,
    phMin: 6.0, phMax: 7.5,
    rainfallMin: 300, rainfallMax: 700,
    seasons: ['rabi', 'winter']
  },
  'Black Gram': {
    nitrogen: 'Low',
    phosphorus: 'Medium',
    potassium: 'Low',
    tempMin: 25, tempMax: 35,
    humidityMin: 40, humidityMax: 70,
    phMin: 5.5, phMax: 7.0,
    rainfallMin: 500, rainfallMax: 900,
    seasons: ['kharif']
  },
  'Green Gram': {
    nitrogen: 'Low',
    phosphorus: 'Medium',
    potassium: 'Low',
    tempMin: 25, tempMax: 35,
    humidityMin: 40, humidityMax: 70,
    phMin: 6.0, phMax: 7.0,
    rainfallMin: 500, rainfallMax: 900,
    seasons: ['kharif']
  },
  'Potato': {
    nitrogen: 'High',
    phosphorus: 'Medium',
    potassium: 'High',
    tempMin: 15, tempMax: 25,
    humidityMin: 60, humidityMax: 100,
    phMin: 5.0, phMax: 6.5,
    rainfallMin: 500, rainfallMax: 900,
    seasons: ['rabi', 'winter']
  },
  'Tomato': {
    nitrogen: 'Medium',
    phosphorus: 'Medium',
    potassium: 'Medium',
    tempMin: 20, tempMax: 30,
    humidityMin: 40, humidityMax: 70,
    phMin: 5.5, phMax: 7.0,
    rainfallMin: 500, rainfallMax: 900,
    seasons: ['zaid', 'summer']
  },
  'Onion': {
    nitrogen: 'Medium',
    phosphorus: 'Medium',
    potassium: 'Medium',
    tempMin: 15, tempMax: 30,
    humidityMin: 20, humidityMax: 60,
    phMin: 6.0, phMax: 7.5,
    rainfallMin: 300, rainfallMax: 600,
    seasons: ['rabi', 'winter']
  },
  'Banana': {
    nitrogen: 'High',
    phosphorus: 'Medium',
    potassium: 'High',
    tempMin: 25, tempMax: 30,
    humidityMin: 60, humidityMax: 100,
    phMin: 5.5, phMax: 7.0,
    rainfallMin: 1500, rainfallMax: 2500,
    seasons: ['annual']
  },
  'Mango': {
    nitrogen: 'Medium',
    phosphorus: 'Low',
    potassium: 'Medium',
    tempMin: 24, tempMax: 30,
    humidityMin: 40, humidityMax: 70,
    phMin: 5.5, phMax: 7.5,
    rainfallMin: 500, rainfallMax: 1000,
    seasons: ['perennial']
  }
};

/**
 * Convert numerical NPK values to categories
 */
function categorizeMacronutrient(value: number): 'Low' | 'Medium' | 'High' {
  if (value < 50) return 'Low';
  if (value < 120) return 'Medium';
  return 'High';
}

/**
 * Calculate confidence score for a crop based on input parameters
 */
function calculateCropScore(
  params: { nitrogen: number; phosphorus: number; potassium: number; temperature: number; humidity: number; ph: number; rainfall: number; season: string },
  crop: string,
  requirements: CropRequirements
): number {
  let score = 100;

  // Nitrogen matching (20 points)
  const nitrogenCat = categorizeMacronutrient(params.nitrogen);
  if (nitrogenCat === requirements.nitrogen) score += 20;
  else if (nitrogenCat !== 'Low' && requirements.nitrogen !== 'Low') score += 10;
  else score -= 5;

  // Phosphorus matching (15 points)
  const phosphorusCat = categorizeMacronutrient(params.phosphorus);
  if (phosphorusCat === requirements.phosphorus) score += 15;
  else if (phosphorusCat !== 'Low' && requirements.phosphorus !== 'Low') score += 8;
  else score -= 3;

  // Potassium matching (15 points)
  const potassiumCat = categorizeMacronutrient(params.potassium);
  if (potassiumCat === requirements.potassium) score += 15;
  else if (potassiumCat !== 'Low' && requirements.potassium !== 'Low') score += 8;
  else score -= 3;

  // Temperature matching (15 points)
  if (params.temperature >= requirements.tempMin && params.temperature <= requirements.tempMax) {
    score += 15;
  } else if (params.temperature >= requirements.tempMin - 3 && params.temperature <= requirements.tempMax + 3) {
    score += 8;
  } else {
    score -= 10;
  }

  // Humidity matching (10 points)
  if (params.humidity >= requirements.humidityMin && params.humidity <= requirements.humidityMax) {
    score += 10;
  } else if (params.humidity >= requirements.humidityMin - 10 && params.humidity <= requirements.humidityMax + 10) {
    score += 5;
  }

  // pH matching (10 points)
  if (params.ph >= requirements.phMin && params.ph <= requirements.phMax) {
    score += 10;
  } else if (params.ph >= requirements.phMin - 0.5 && params.ph <= requirements.phMax + 0.5) {
    score += 5;
  } else {
    score -= 5;
  }

  // Rainfall matching (15 points)
  if (params.rainfall >= requirements.rainfallMin && params.rainfall <= requirements.rainfallMax) {
    score += 15;
  } else if (params.rainfall >= requirements.rainfallMin * 0.7 && params.rainfall <= requirements.rainfallMax * 1.2) {
    score += 8;
  } else {
    score -= 5;
  }

  // Season matching (15 points)
  const seasonNormalized = params.season.toLowerCase();
  if (requirements.seasons.includes(seasonNormalized)) {
    score += 15;
  } else if (requirements.seasons.includes('annual') || requirements.seasons.includes('perennial')) {
    score += 10;
  } else {
    score -= 8;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate crop-specific reasons based on input parameters
 */
function generateReasons(
  crop: string,
  params: { nitrogen: number; phosphorus: number; potassium: number; temperature: number; humidity: number; ph: number; rainfall: number; season: string },
  requirements: CropRequirements
): string[] {
  const cropSpecificReasons: { [key: string]: string[] } = {
    'Rice': [
      'High rainfall and humidity levels ideal for paddy field conditions',
      'Temperature range (22-30°C) perfectly matches monsoon conditions',
      'Acidic soil pH suitable for nutrient uptake and growth',
      'Kharif season provides natural moisture for flooding requirement'
    ],
    'Wheat': [
      'Ideal NPK ratio for wheat cultivation and grain development',
      'Temperature range perfectly suited for tillering and grain filling',
      'Adequate rainfall for growth without waterlogging concerns',
      'Soil pH within optimal range for disease prevention',
      'Perfect match for Rabi (winter) season cultivation'
    ],
    'Maize': [
      'Good soil nutrient compatibility for hybrid maize varieties',
      'Suitable temperature for pollination and cob development',
      'Moderate rainfall matches maize water requirement',
      'Adequate pH for nutrient availability and root development',
      'Excellent kharif and summer season option'
    ],
    'Cotton': [
      'Moderate nitrogen levels promote fiber quality over excessive vegetative growth',
      'Warm temperature range ideal for boll development',
      'Lower humidity preferred by cotton reduces pest incidence',
      'Well-drained soil conditions suit cotton cultivation',
      'Kharif season provides natural growth window'
    ],
    'Sugarcane': [
      'High nitrogen requirement matches your soil fertility levels',
      'Warm temperatures promote higher sugar content accumulation',
      'High rainfall supports long growth period demand',
      'Adequate potassium ensures quality and disease resistance',
      'Year-round crop with multiple seasons viable'
    ],
    'Barley': [
      'Good soil nutrient compatibility for malting barley production',
      'Suitable climate conditions for grain maturation',
      'Lower water requirement matches rainfall pattern',
      'Tolerates cooler temperatures typical of rabi season',
      'Excellent for winter cultivation and disease prevention'
    ],
    'Sorghum': [
      'Drought-tolerant nature suits water availability pattern',
      'Heat-tolerant variety for warm temperature regions',
      'Lower fertilizer demand reduces input costs',
      'Deep root system efficient with available rainfall',
      'Ideal for both kharif and summer seasons'
    ],
    'Millets': [
      'Minimal fertilizer requirement with your NPK levels',
      'Highly drought-resistant for variable rainfall',
      'Heat-tolerant crop for warm seasons',
      'Excellent soil conservation and minimal pest issues',
      'Suitable for marginal lands with your conditions'
    ],
    'Groundnut': [
      'Good nitrogen fixation capability with moderate nitrogen input',
      'Warm temperature range ideal for pod development',
      'Moderate rainfall prevents waterlogging stress',
      'Well-drained soil with suitable pH for nodulation',
      'Kharif season timing matches growth requirements'
    ],
    'Soybean': [
      'Good nitrogen fixation reduces fertilizer dependency',
      'Temperature suited for vegetative and reproductive growth',
      'Moderate to good rainfall supports pod filling',
      'Neutral pH optimal for nutrient absorption',
      'Kharif season provides ideal growing conditions'
    ],
    'Chickpea': [
      'Excellent nitrogen fixation with lower nitrogen requirement',
      'Cool season temperatures ideal for flowering and pod set',
      'Lower water demand matches available rainfall',
      'Soil pH within optimal range for disease prevention',
      'Perfect for crop rotation after cereals in your system'
    ],
    'Pigeon Pea': [
      'Nitrogen-fixing capability with your soil NPK levels',
      'Warm temperature range suits growth and flowering',
      'Moderate rainfall adequate for crop development',
      'Good soil compatibility for nodulation',
      'Kharif season provides natural moisture window'
    ],
    'Lentil': [
      'Low nitrogen requirement reduces fertilizer cost',
      'Cool temperature optimal for grain filling quality',
      'Minimal water requirement suits rainfall pattern',
      'Soil pH perfect for disease-free cultivation',
      'Excellent rabi season option for your region'
    ],
    'Black Gram': [
      'Nitrogen fixation matches your soil fertility status',
      'Warm temperature ideal for vegetative growth',
      'Moderate to good rainfall supports pod development',
      'Compatible soil pH for healthy growth',
      'Kharif season provides optimal conditions'
    ],
    'Green Gram': [
      'Efficient nitrogen fixation with moderate nitrogen levels',
      'Warm temperature range suits faster maturity (60-70 days)',
      'Good rainfall pattern for pod filling stage',
      'Suitable soil pH for nutrient availability',
      'Ideal for kharif intercropping and quick harvest'
    ],
    'Potato': [
      'High nitrogen supports vegetative growth and tuber formation',
      'Cool temperature range ideal for tuber development',
      'High rainfall supports consistent soil moisture',
      'Acidic soil pH suits potato cultivation',
      'Rabi season provides cooler conditions for quality tubers'
    ],
    'Tomato': [
      'Good NPK ratio for balanced fruit development',
      'Warm temperature ideal for flowering and fruiting',
      'Moderate rainfall supports fruit quality without cracking',
      'Suitable pH for nutrient uptake and disease resistance',
      'Zaid (summer) season provides extended harvest'
    ],
    'Onion': [
      'Balanced NPK for bulb development and storage quality',
      'Moderate temperature range suits bulb formation',
      'Controlled rainfall prevents rot and disease',
      'Suitable soil pH for dormancy and storage',
      'Rabi season provides natural drying conditions'
    ],
    'Banana': [
      'High nitrogen supports vegetative growth and yield',
      'Warm temperature ideal for year-round growth',
      'High rainfall meets water demand requirements',
      'Potassium ensures fruit quality and disease resistance',
      'Perennial crop viable with your climate'
    ],
    'Mango': [
      'Good NPK balance for fruit development and flowering',
      'Warm temperature supports fruit ripening and quality',
      'Adequate rainfall during growing season',
      'Suitable soil pH for healthy root development',
      'Perennial orchard crop ideal for your conditions'
    ]
  };

  return cropSpecificReasons[crop] || [
    'Well-suited for your soil nutrient profile',
    'Climate conditions favorable for growth',
    'Rainfall pattern supports crop development',
    'Soil pH within acceptable range'
  ];
}

/**
 * Generate crop-specific growing tips
 */
function generateTips(crop: string): string[] {
  const cropTips: { [key: string]: string[] } = {
    'Rice': [
      'Maintain water level of 5-7 cm during growing season',
      'Apply nitrogen in three splits: basal, tillering, and panicle initiation',
      'Monitor for brown spot and blast diseases during monsoon'
    ],
    'Wheat': [
      'Use disease-resistant varieties like HD-2967 or HD-3086',
      'Apply first irrigation 21 days after sowing',
      'Monitor for rust diseases in flowering stage',
    ],
    'Maize': [
      'Use hybrid varieties for better yield',
      'Maintain row spacing of 60 cm and plant spacing of 20-25 cm',
      'Control stem borer by spraying appropriate insecticides at silking stage'
    ],
    'Cotton': [
      'Choose high-yielding varieties suited to your region',
      'Implement drip irrigation for water efficiency',
      'Monitor for bollworm and other pests regularly'
    ],
    'Sugarcane': [
      'Use high-yielding clones suitable for your climate',
      'Apply organic manure (10 tons/ha) before planting',
      'Ensure adequate irrigation during dry months'
    ],
    'Barley': [
      'Choose high-yielding varieties like RD-2052 or BH-902',
      'Ensure proper seed treatment before sowing',
      'Apply irrigation at CRI and flowering stages for better yield'
    ],
    'Sorghum': [
      'Use drought-tolerant hybrid varieties',
      'Maintain plant population of 20,000-25,000 plants/hectare',
      'Spray for shoot fly at 3-4 leaf stage'
    ],
    'Millets': [
      'Select varieties suitable for your rainfall zone',
      'Minimal fertilizer requirement compared to cereals',
      'Harvest when plants turn golden brown'
    ],
    'Groundnut': [
      'Use certified seeds from disease-free sources',
      'Maintain field sanitation to prevent pest incidence',
      'Apply calcium nitrate at 40 kg/ha for better pod development'
    ],
    'Soybean': [
      'Select suitable maturity group varieties',
      'Inoculate seeds with Bradyrhizobium bacteria',
      'Monitor for yellow mosaic virus and leaf spot diseases'
    ],
    'Chickpea': [
      'Ideal for crop rotation after cereals',
      'Minimal fertilizer requirement due to nitrogen fixation',
      'Monitor for wilt disease and pod borer insects'
    ],
    'Pigeon Pea': [
      'Use high-yielding varieties with resistance to Fusarium wilt',
      'Provide support structures for better pod development',
      'Intercropping with other crops can improve productivity'
    ],
    'Lentil': [
      'Use disease-resistant varieties',
      'Minimal nitrogen requirement; good for crop rotation',
      'Harvest when pods turn brown and rattle when shaken'
    ],
    'Black Gram': [
      'Select varieties resistant to yellow mosaic virus',
      'Time sowing for kharif season for better yields',
      'Monitor for thrips and spider mites'
    ],
    'Green Gram': [
      'Use high-yielding varieties suited to your region',
      'Suitable for quick harvest (60-70 days)',
      'Good choice for intercropping systems'
    ],
    'Potato': [
      'Use certified seed potatoes for disease prevention',
      'Provide ridge cultivation for better tuber development',
      'Apply proper earthing up 45 days after planting'
    ],
    'Tomato': [
      'Choose varieties suited to your climatic zone',
      'Provide support structures and prune suckers',
      'Monitor for early and late blight diseases'
    ],
    'Onion': [
      'Use quality seeds or sets for better germination',
      'Maintain proper spacing (15 cm between rows)',
      'Harvest when leaves turn brown and fall over'
    ],
    'Banana': [
      'Plant disease-free suckers',
      'Provide adequate shade during establishment',
      'Apply mulch to conserve soil moisture'
    ],
    'Mango': [
      'Choose grafted plants for early bearing',
      'Provide wind protection for young plantations',
      'Monitor for anthracnose and mango hopper pests'
    ]
  };

  return cropTips[crop] || [
    `Use certified seeds of improved varieties`,
    `Follow recommended spacing and planting density`,
    `Monitor regularly for pests and diseases`
  ];
}

/**
 * Generate mock crop recommendations based on input parameters
 */
export function generateMockCropRecommendation(params: {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  season: string;
}): { predictions: Array<{ crop: string; confidence: number; reasons: string[]; tips: string[] }> } {
  const cropScores: Array<{ crop: string; score: number; requirements: CropRequirements }> = [];

  // Calculate scores for all crops
  for (const [cropName, requirements] of Object.entries(CROP_DATABASE)) {
    const score = calculateCropScore(params, cropName, requirements);
    cropScores.push({ crop: cropName, score, requirements });
  }

  // Sort by score descending and take top 3
  const predictions = cropScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => ({
      crop: item.crop,
      confidence: Math.round(item.score),
      reasons: generateReasons(item.crop, params, item.requirements),
      tips: generateTips(item.crop),
    }));

  return { predictions };
}

/**
 * Generate mock fertilizer recommendations based on input parameters
 */
export function generateMockFertilizerRecommendation(params: {
  crop: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  moisture: number;
  soilType: string;
}): { predictions: MockFertilizerPrediction[] } {
  // Get recommended fertilizers based on NPK levels and soil pH
  const recommendedFertilizers = recommendFertilizers(
    params.nitrogen,
    params.phosphorus,
    params.potassium,
    params.soilType
  );

  // Convert to mock predictions with dosage calculations
  const predictions: MockFertilizerPrediction[] = recommendedFertilizers.map((fert: any, index: number) => {
    // Calculate estimated dosage based on deficiency
    let dosage = 50;
    if (params.nitrogen < 40) dosage += 30;
    if (params.phosphorus < 20) dosage += 20;
    if (params.potassium < 40) dosage += 25;

    return {
      fertilizer: fert.name,
      dose: Math.round(dosage),
      confidence: Math.max(70, 90 - index * 5),
    };
  });

  // If no recommendations found, provide balanced NPK as fallback
  if (predictions.length === 0) {
    predictions.push({
      fertilizer: 'NPK (Balanced Fertilizer)',
      dose: 100,
      confidence: 75,
    });
  }

  return { predictions };
}
