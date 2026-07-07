import { RequestHandler } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not configured. Crop rotation saving will fail.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Crop rotation compatibility data
// Crops that benefit from being planted after each crop
const CROP_ROTATION_MAP: Record<string, { benefits: string[]; avoidAfter: string[] }> = {
  Rice: {
    benefits: ['Wheat', 'Pulses', 'Oilseeds'],
    avoidAfter: ['Rice', 'Sugarcane']
  },
  Wheat: {
    benefits: ['Pulses', 'Oilseeds', 'Vegetables'],
    avoidAfter: ['Wheat', 'Maize']
  },
  Maize: {
    benefits: ['Pulses', 'Legumes', 'Root vegetables'],
    avoidAfter: ['Maize', 'Sugarcane']
  },
  Cotton: {
    benefits: ['Pulses', 'Oilseeds', 'Cereals'],
    avoidAfter: ['Cotton']
  },
  Sugarcane: {
    benefits: ['Pulses', 'Oilseeds', 'Cereals'],
    avoidAfter: ['Sugarcane']
  },
  Groundnut: {
    benefits: ['Cereals', 'Root vegetables', 'Vegetables'],
    avoidAfter: ['Oilseeds']
  },
  Soybean: {
    benefits: ['Cereals', 'Root vegetables', 'Vegetables'],
    avoidAfter: ['Legumes']
  },
  Chickpea: {
    benefits: ['Cereals', 'Root vegetables', 'Oilseeds'],
    avoidAfter: ['Pulses']
  },
  Potato: {
    benefits: ['Cereals', 'Legumes', 'Root vegetables'],
    avoidAfter: ['Potato', 'Tomato']
  },
  Tomato: {
    benefits: ['Cereals', 'Legumes', 'Root vegetables'],
    avoidAfter: ['Tomato', 'Potato']
  }
};

// Soil nutrient requirements and benefits
const CROP_SOIL_IMPACT: Record<string, { nitrogenImpact: number; soilHealth: number; waterRequirement: number }> = {
  Rice: { nitrogenImpact: -40, soilHealth: -20, waterRequirement: 90 },
  Wheat: { nitrogenImpact: -30, soilHealth: -15, waterRequirement: 40 },
  Maize: { nitrogenImpact: -35, soilHealth: -18, waterRequirement: 50 },
  Cotton: { nitrogenImpact: -45, soilHealth: -25, waterRequirement: 55 },
  Sugarcane: { nitrogenImpact: -50, soilHealth: -30, waterRequirement: 100 },
  Groundnut: { nitrogenImpact: +20, soilHealth: +15, waterRequirement: 45 },
  Soybean: { nitrogenImpact: +25, soilHealth: +20, waterRequirement: 50 },
  Chickpea: { nitrogenImpact: +20, soilHealth: +15, waterRequirement: 35 },
  Potato: { nitrogenImpact: -35, soilHealth: -20, waterRequirement: 60 },
  Tomato: { nitrogenImpact: -25, soilHealth: -15, waterRequirement: 65 }
};

interface RotationPrediction {
  year: number;
  recommendedCrop: string;
  confidence: number;
  soilHealthScore: number;
  nitrogenLevel: number;
  benefits: string[];
  warnings: string[];
}

function calculateCropRotationScore(
  nitrogen: number,
  phosphorus: number,
  potassium: number,
  ph: number,
  rainfall: number,
  temperature: number,
  previousCrop: string,
  candidateCrop: string
): number {
  let score = 100;

  // Penalize if previous crop doesn't support current crop
  const rotationData = CROP_ROTATION_MAP[previousCrop];
  if (rotationData && !rotationData.benefits.includes(candidateCrop)) {
    score *= 0.7;
  }
  if (rotationData && rotationData.avoidAfter.includes(candidateCrop)) {
    score *= 0.4;
  }

  // Check nutrient requirements
  const soilImpact = CROP_SOIL_IMPACT[previousCrop];
  if (soilImpact) {
    const projectedNitrogen = Math.max(0, nitrogen + soilImpact.nitrogenImpact);

    // Penalize if nitrogen too low for candidate crop
    if (candidateCrop === 'Rice' && projectedNitrogen < 40) score *= 0.6;
    if (candidateCrop === 'Wheat' && projectedNitrogen < 40) score *= 0.6;
    if (candidateCrop === 'Maize' && projectedNitrogen < 50) score *= 0.6;
  }

  // pH compatibility
  const phRanges: Record<string, { min: number; max: number }> = {
    Rice: { min: 5.5, max: 7.0 },
    Wheat: { min: 6.0, max: 7.5 },
    Maize: { min: 5.8, max: 7.0 },
    Cotton: { min: 5.5, max: 8.0 },
    Sugarcane: { min: 6.0, max: 7.5 },
    Groundnut: { min: 6.0, max: 7.5 },
    Soybean: { min: 6.0, max: 7.0 },
    Chickpea: { min: 6.0, max: 7.5 },
    Potato: { min: 5.0, max: 6.5 },
    Tomato: { min: 5.5, max: 7.0 }
  };

  const range = phRanges[candidateCrop];
  if (range && (ph < range.min || ph > range.max)) {
    score *= 0.8;
  }

  // Rainfall compatibility
  const rainfallRanges: Record<string, { min: number; max: number }> = {
    Rice: { min: 1000, max: 2000 },
    Wheat: { min: 400, max: 1000 },
    Maize: { min: 500, max: 1200 },
    Cotton: { min: 500, max: 1000 },
    Sugarcane: { min: 1000, max: 2000 },
    Groundnut: { min: 500, max: 900 },
    Soybean: { min: 500, max: 1000 },
    Chickpea: { min: 400, max: 700 },
    Potato: { min: 500, max: 900 },
    Tomato: { min: 500, max: 900 }
  };

  const rainRange = rainfallRanges[candidateCrop];
  if (rainRange && (rainfall < rainRange.min || rainfall > rainRange.max)) {
    score *= 0.75;
  }

  return Math.max(0, Math.min(100, score));
}

function projectSoilHealth(
  currentNitrogen: number,
  currentPhosphorus: number,
  currentPotassium: number,
  currentHealth: number,
  crop: string
): { nitrogen: number; phosphorus: number; potassium: number; health: number } {
  const impact = CROP_SOIL_IMPACT[crop];

  const projectedNitrogen = Math.max(0, currentNitrogen + (impact?.nitrogenImpact || 0));
  const projectedPhosphorus = Math.max(0, currentPhosphorus - 15);
  const projectedPotassium = Math.max(0, currentPotassium - 10);
  const projectedHealth = Math.max(0, Math.min(100, currentHealth + (impact?.soilHealth || 0)));

  return {
    nitrogen: projectedNitrogen,
    phosphorus: projectedPhosphorus,
    potassium: projectedPotassium,
    health: projectedHealth
  };
}

export const predictCropRotation: RequestHandler = async (req, res) => {
  try {
    const {
      nitrogen,
      phosphorus,
      potassium,
      temperature,
      ph,
      rainfall,
      input_season,
      previous_crop,
      years = 3,
      user_id
    } = req.body;

    // Validate required parameters
    if (nitrogen === undefined || phosphorus === undefined || potassium === undefined) {
      return res.status(400).json({
        error: 'Nitrogen (N), phosphorus (P), and potassium (K) are required'
      });
    }

    if (!previous_crop) {
      return res.status(400).json({
        error: 'Previous crop is required for rotation planning'
      });
    }

    const normalizedInputs = {
      nitrogen: parseFloat(nitrogen),
      phosphorus: parseFloat(phosphorus),
      potassium: parseFloat(potassium),
      temperature: parseFloat(temperature) || 25,
      ph: parseFloat(ph) || 7,
      rainfall: parseFloat(rainfall) || 100,
      season: input_season || 'kharif',
      years: parseInt(years) || 3
    };

    const predictions: RotationPrediction[] = [];
    let currentNitrogen = normalizedInputs.nitrogen;
    let currentPhosphorus = normalizedInputs.phosphorus;
    let currentPotassium = normalizedInputs.potassium;
    let currentHealth = 60;
    let currentCrop = previous_crop;

    // Generate rotation plan for specified years
    const allCrops = Object.keys(CROP_ROTATION_MAP);

    for (let year = 1; year <= normalizedInputs.years; year++) {
      // Calculate scores for all crops
      const cropScores = allCrops.map(crop => ({
        crop,
        score: calculateCropRotationScore(
          currentNitrogen,
          currentPhosphorus,
          currentPotassium,
          normalizedInputs.ph,
          normalizedInputs.rainfall,
          normalizedInputs.temperature,
          currentCrop,
          crop
        )
      }));

      // Sort by score and get best crop
      cropScores.sort((a, b) => b.score - a.score);
      const bestCrop = cropScores[0].crop;
      const confidence = cropScores[0].score / 100;

      // Project soil health after this crop
      const projectedSoil = projectSoilHealth(
        currentNitrogen,
        currentPhosphorus,
        currentPotassium,
        currentHealth,
        bestCrop
      );

      const rotationData = CROP_ROTATION_MAP[bestCrop];
      const benefits: string[] = [];
      const warnings: string[] = [];

      // Generate benefits
      if (rotationData) {
        const nextYearCrops = rotationData.benefits.slice(0, 2);
        benefits.push(`Excellent preparation for growing ${nextYearCrops.join(' or ')}`);
      }

      if (projectedSoil.health > currentHealth) {
        benefits.push('Improves overall soil health');
      }

      if (projectedSoil.nitrogen > currentNitrogen) {
        benefits.push('Increases soil nitrogen content');
      }

      // Generate warnings
      if (projectedSoil.nitrogen < 40) {
        warnings.push('Nitrogen levels may become depleted - consider adding legumes');
      }

      if (confidence < 0.6) {
        warnings.push('This rotation is suboptimal - consider alternative crops');
      }

      if (currentPotassium < 50) {
        warnings.push('Low potassium levels - apply potassium-rich fertilizers');
      }

      predictions.push({
        year,
        recommendedCrop: bestCrop,
        confidence,
        soilHealthScore: projectedSoil.health,
        nitrogenLevel: projectedSoil.nitrogen,
        benefits,
        warnings
      });

      // Update for next iteration
      currentNitrogen = projectedSoil.nitrogen;
      currentPhosphorus = projectedSoil.phosphorus;
      currentPotassium = projectedSoil.potassium;
      currentHealth = projectedSoil.health;
      currentCrop = bestCrop;
    }

    // Save to Supabase if user_id provided
    if (user_id && supabase) {
      try {
        const topPrediction = predictions[0];
        const { error } = await supabase.from('crop_rotation_recommendation').insert({
          user_id: user_id,
          nitrogen: normalizedInputs.nitrogen,
          phosphorus: normalizedInputs.phosphorus,
          potassium: normalizedInputs.potassium,
          ph: normalizedInputs.ph,
          rainfall: normalizedInputs.rainfall,
          temperature: normalizedInputs.temperature,
          previous_crop: previous_crop,
          recommended_crop: topPrediction.recommendedCrop,
          confidence: topPrediction.confidence,
          soil_health_score: topPrediction.soilHealthScore
        });

        if (error) {
          console.warn('Failed to save crop rotation:', error.message);
        }
      } catch (dbError: any) {
        console.warn('Failed to save crop rotation to database:', dbError.message);
      }
    }

    return res.json({
      success: true,
      message: 'Crop rotation plan generated successfully',
      predictions: predictions.map(p => ({
        year: p.year,
        recommendedCrop: p.recommendedCrop,
        confidence: Math.round(p.confidence * 100),
        soilHealthScore: Math.round(p.soilHealthScore),
        projectedNitrogen: Math.round(p.nitrogenLevel),
        benefits: p.benefits,
        warnings: p.warnings
      }))
    });
  } catch (error: any) {
    console.error('Crop rotation prediction error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to process crop rotation prediction'
    });
  }
};
