import { Request, Response } from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { predictCrops } from './crop-prediction';
import { recommendFertilizers } from '../../../shared/api';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8001';

// Crop-specific fertilizer recommendation ranges (N-P-K ratios)
const FERTILIZER_DOSES: Record<string, { n: number; p: number; k: number; total: number }> = {
  Rice: { n: 80, p: 40, k: 40, total: 160 },
  Wheat: { n: 120, p: 60, k: 40, total: 220 },
  Maize: { n: 150, p: 60, k: 60, total: 270 },
  'Sugarcane': { n: 150, p: 80, k: 100, total: 330 },
  Cotton: { n: 100, p: 60, k: 60, total: 220 },
  Groundnut: { n: 25, p: 50, k: 40, total: 115 },
  Soybean: { n: 0, p: 50, k: 40, total: 90 },
  Chickpea: { n: 20, p: 50, k: 40, total: 110 },
};

function calculateFertilizerDose(
  crop: string,
  currentN: number,
  currentP: number,
  currentK: number
): { n: number; p: number; k: number; total: number } {
  const baseDose = FERTILIZER_DOSES[crop] || { n: 100, p: 50, k: 50, total: 200 };

  // Adjust based on current soil values
  const nAdjust = Math.max(0, baseDose.n - currentN / 2);
  const pAdjust = Math.max(0, baseDose.p - currentP / 2);
  const kAdjust = Math.max(0, baseDose.k - currentK / 2);

  return {
    n: Math.round(nAdjust),
    p: Math.round(pAdjust),
    k: Math.round(kAdjust),
    total: Math.round(nAdjust + pAdjust + kAdjust),
  };
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not configured. ML recommendation saving will fail.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function cropRecommendation(req: Request, res: Response) {
  try {
    // Parameters: N (nitrogen), P (phosphorus), K (potassium), pH, rainfall, temperature, season
    const { nitrogen, phosphorus, potassium, temperature, ph, rainfall, season, humidity, user_id } = req.body;

    // Validate required parameters
    if (nitrogen === undefined || phosphorus === undefined || potassium === undefined) {
      return res.status(400).json({ error: 'Nitrogen (N), phosphorus (P), and potassium (K) are required' });
    }

    const normalizedInputs = {
      nitrogen: parseFloat(nitrogen),
      phosphorus: parseFloat(phosphorus),
      potassium: parseFloat(potassium),
      temperature: parseFloat(temperature) || 25,
      humidity: parseFloat(humidity) || 65,
      ph: parseFloat(ph) || 7,
      rainfall: parseFloat(rainfall) || 100,
      season: season || 'kharif',
    };

    try {
      // Use local crop prediction engine
      const predictions = predictCrops(
        normalizedInputs.nitrogen,
        normalizedInputs.phosphorus,
        normalizedInputs.potassium,
        normalizedInputs.temperature,
        normalizedInputs.ph,
        normalizedInputs.rainfall,
        normalizedInputs.season
      );

      // Format predictions with additional metadata
      const formattedPredictions = predictions.map((p: any) => {
        const confidencePercentage = Math.round(p.confidence * 100);
        const cropReasons: Record<string, string[]> = {
          Rice: ['Thrives in monsoon conditions', 'Requires consistent moisture', 'Suited for warm temperatures'],
          Wheat: ['Ideal for winter season', 'Low water requirement', 'Performs well in cool climate'],
          Maize: ['High yield potential', 'Moderate water needs', 'Good nitrogen utilization'],
          Sugarcane: ['Long growth period crop', 'High nutrient demand', 'Requires adequate rainfall'],
          Cotton: ['Heat tolerant crop', 'Well-drained soil requirement', 'Cash crop with good returns'],
          Groundnut: ['Low nitrogen requirement', 'Improves soil fertility', 'Suitable for dry regions'],
          Soybean: ['Nitrogen-fixing legume', 'Good for crop rotation', 'Moderate water needs'],
          Chickpea: ['Winter crop', 'Low input requirement', 'Enriches soil nitrogen'],
        };

        return {
          crop: p.crop,
          confidence: confidencePercentage,
          yield: p.crop === 'Rice' ? '4-5 t/ha' : p.crop === 'Wheat' ? '3-4 t/ha' : '3-4 t/ha',
          roi: '15-25%',
          duration: p.crop === 'Rice' ? '120-150 days' : p.crop === 'Wheat' ? '150-180 days' : '120-140 days',
          suitability: confidencePercentage >= 80 ? 'Excellent' : confidencePercentage >= 70 ? 'Very Good' : 'Good',
          reasons: cropReasons[p.crop as keyof typeof cropReasons] || ['Suitable for your conditions'],
          tips: [
            'Monitor soil moisture regularly',
            'Apply fertilizers in split doses',
            'Use certified seeds for better yield',
            'Implement pest management practices',
          ],
        };
      });

      // Save to Supabase crop_recommendations table
      if (user_id && supabase) {
        try {
          const topPrediction = formattedPredictions[0];
          const { data, error } = await supabase.from('crop_recommendation').insert({
            user_id: user_id,
            nitrogen: normalizedInputs.nitrogen,
            phosphorus: normalizedInputs.phosphorus,
            potassium: normalizedInputs.potassium,
            temperature: normalizedInputs.temperature,
            humidity: normalizedInputs.humidity,
            soil_moisture: req.body.soil_moisture || 50,
            soil_type: req.body.soil_type || 'loamy',
            crop_type: req.body.crop_type || null,
            fertilizer_predicted: topPrediction.crop,
            fertilizer_confidence: topPrediction.confidence,
          });

          if (error) {
            console.warn('Failed to save crop recommendation:', error.message);
          } else {
            console.log('Crop recommendation saved successfully');
          }
        } catch (dbError: any) {
          console.warn('Failed to save crop recommendation to database:', dbError.message);
        }
      }

      return res.json({
        success: true,
        message: 'Crop recommendations generated successfully',
        predictions: formattedPredictions,
      });
    } catch (error: any) {
      console.error('Crop recommendation error:', error.message);
      res.status(500).json({
        error: error.message || 'Failed to process crop recommendation request',
      });
    }
  } catch (error: any) {
    console.error('Crop recommendation error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to process crop recommendation request',
    });
  }
}

async function getMLFertilizerPrediction(inputs: {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  moisture: number;
  ph: number;
  rainfall: number;
  season: string;
}): Promise<any> {
  try {
    // Call the Python ML API
    const response = await axios.post(`${ML_API_URL}/predict-fertilizer`, {
      nitrogen: inputs.nitrogen,
      phosphorus: inputs.phosphorus,
      potassium: inputs.potassium,
      temperature: inputs.temperature,
      humidity: inputs.humidity,
      ph: inputs.ph,
      rainfall: inputs.rainfall,
      season: inputs.season,
    }, {
      timeout: 30000,
    });

    return response.data;
  } catch (error: any) {
    console.warn('ML API call failed, using local calculation:', error.message);
    return null;
  }
}

function generateFertilizerRecommendationDetails(
  crop: string,
  recommendedDose: { n: number; p: number; k: number; total: number }
): any {
  const totalDose = recommendedDose.total;
  const basalDose = Math.round(totalDose * 0.4);
  const dressing1Dose = Math.round(totalDose * 0.3);
  const dressing2Dose = Math.round(totalDose * 0.3);

  const costPerKg = 30;
  const minCost = totalDose * costPerKg;
  const maxCost = Math.round(minCost * 1.25);

  return {
    fertilizer: `NPK ${recommendedDose.n}:${recommendedDose.p}:${recommendedDose.k}`,
    dosage: `${totalDose} kg/ha`,
    applicationMethod: 'Broadcasting and incorporation recommended for even distribution',
    timing: `Apply in 2-3 split doses over the growing season`,
    estimatedCost: `₹${minCost} - ₹${maxCost}`,
    benefits: [
      'Balanced nutrient supply optimized for crop growth',
      'Improved grain quality and yield potential',
      'Enhanced soil health and microbe activity',
      'Efficient nutrient uptake and reduced losses'
    ],
    schedule: [
      {
        stage: 'Basal Application',
        timing: 'At sowing/field preparation',
        dosage: `${basalDose} kg/ha`,
        notes: 'Mix thoroughly with soil before sowing for uniform distribution'
      },
      {
        stage: 'First Top Dressing',
        timing: '30-40 days after sowing (Tillering)',
        dosage: `${dressing1Dose} kg/ha`,
        notes: 'Apply after first irrigation when soil has adequate moisture'
      },
      {
        stage: 'Second Top Dressing',
        timing: '60-70 days after sowing (Boot stage)',
        dosage: `${dressing2Dose} kg/ha`,
        notes: 'Critical for grain development; apply when plant starts flowering'
      }
    ],
    alternatives: [
      {
        name: 'Urea + Single Super Phosphate + Muriate of Potash',
        cost: `₹${Math.round(minCost * 0.95)}`,
        availability: 'High'
      },
      {
        name: 'DAP + Muriate of Potash',
        cost: `₹${Math.round(minCost * 1.05)}`,
        availability: 'High'
      },
      {
        name: 'Organic Compost (FYM)',
        cost: `₹${Math.round(minCost * 0.6)}`,
        availability: 'Medium'
      }
    ],
    warnings: [
      'Avoid application during heat waves or drought conditions',
      'Do not exceed recommended dosage to prevent nutrient toxicity',
      'Ensure adequate soil moisture before applying top dressing',
      'Keep fertilizers away from water bodies to prevent runoff',
      'Store fertilizers in dry, cool place to maintain effectiveness'
    ]
  };
}

function generateFertilizerDetailsFromDatabase(
  fertilizerName: string,
  totalDose: number,
  alternatives: any[]
): any {
  const costPerKg = 30;
  const minCost = totalDose * costPerKg;
  const maxCost = Math.round(minCost * 1.25);
  const basalDose = Math.round(totalDose * 0.4);
  const dressingDose = Math.round(totalDose * 0.6);

  return {
    fertilizer: fertilizerName,
    dosage: `${totalDose} kg/ha`,
    applicationMethod: 'Broadcasting or Banding recommended for even distribution',
    timing: 'Apply in 2-3 split doses over the growing season',
    estimatedCost: `₹${minCost} - ₹${maxCost}`,
    benefits: [
      `${fertilizerName} provides targeted nutrient support`,
      'Optimized for current soil conditions',
      'Improved nutrient utilization efficiency',
      'Better crop growth and yield'
    ],
    schedule: [
      {
        stage: 'Basal Application',
        timing: 'At sowing/field preparation',
        dosage: `${basalDose} kg/ha`,
        notes: 'Incorporate into soil during field preparation'
      },
      {
        stage: 'Top Dressing',
        timing: '35-50 days after sowing',
        dosage: `${dressingDose} kg/ha`,
        notes: 'Apply during active growth phase'
      }
    ],
    alternatives: alternatives.map((alt) => ({
      name: alt.name,
      cost: `₹${Math.round(totalDose * 25)}-${Math.round(totalDose * 35)}`,
      availability: 'High'
    })),
    warnings: [
      'Follow recommended dosage to avoid nutrient toxicity',
      'Ensure adequate soil moisture before application',
      'Apply during evening or cloudy weather when possible',
      'Store fertilizers in dry, cool place'
    ]
  };
}

export async function fertilizerSuggestion(req: Request, res: Response) {
  try {
    // Handle both naming conventions: crop/crop_type, soilType/soil_type
    const crop = req.body.crop_type || req.body.crop;
    const soilType = req.body.soil_type || req.body.soilType;
    const { temperature, humidity, moisture, nitrogen, potassium, phosphorus, cropStage, ph, rainfall, season, user_id } = req.body;

    if (!crop) {
      return res.status(400).json({ error: 'Crop type is required' });
    }

    const normalizedInputs = {
      nitrogen: parseFloat(nitrogen) || 50,
      phosphorus: parseFloat(phosphorus) || 50,
      potassium: parseFloat(potassium) || 50,
      temperature: parseFloat(temperature) || 25,
      humidity: parseFloat(humidity) || 65,
      moisture: parseFloat(moisture) || 50,
      ph: parseFloat(ph) || 6.5,
      rainfall: parseFloat(rainfall) || 100,
      season: season || 'kharif',
    };

    try {
      // Try to get ML prediction first
      const mlPrediction = await getMLFertilizerPrediction(normalizedInputs);

      let formattedPredictions: any[] = [];

      if (mlPrediction && mlPrediction.predictions && mlPrediction.predictions.length > 0) {
        // Use ML API predictions
        const mlPred = mlPrediction.predictions[0];

        // Extract fertilizer info from ML model
        const fertilizerName = mlPred.fertilizer || mlPred.label || 'Recommended NPK Mix';
        const mlDose = mlPred.dose || mlPred.dosage || 250;

        formattedPredictions = [
          {
            fertilizer: fertilizerName,
            dosage: `${mlDose} kg/ha`,
            dose: mlDose,
            applicationMethod: mlPred.applicationMethod || 'Broadcasting recommended with incorporation into soil',
            timing: mlPred.timing || 'Apply in split doses at different growth stages',
            estimatedCost: mlPred.estimatedCost || `₹${mlDose * 25}-${mlDose * 35}`,
            benefits: mlPred.benefits || [
              'Optimized nutrient balance for crop',
              'Improved yield and crop quality',
              'Better soil health',
              'Efficient nutrient utilization'
            ],
            schedule: mlPred.schedule || [
              {
                stage: 'Basal Application',
                timing: 'At sowing',
                dosage: `${Math.round(mlDose * 0.4)} kg/ha`,
                notes: 'Incorporate into soil during field preparation'
              },
              {
                stage: 'Top Dressing',
                timing: '40-50 days after sowing',
                dosage: `${Math.round(mlDose * 0.6)} kg/ha`,
                notes: 'Apply during active growth phase'
              }
            ],
            alternatives: mlPred.alternatives || [
              { name: 'Organic Compost', cost: `₹${Math.round(mlDose * 10)}`, availability: 'High' },
              { name: 'Farm Yard Manure', cost: `₹${Math.round(mlDose * 8)}`, availability: 'Medium' }
            ],
            warnings: mlPred.warnings || [
              'Avoid application during water stress',
              'Apply during evening or cloudy hours',
              'Ensure soil moisture before application'
            ]
          }
        ];
      } else {
        // Fallback to database-driven recommendations
        const soilType = req.body.soil_type || req.body.soilType || 'loamy';
        const recommendedFertilizers = recommendFertilizers(
          normalizedInputs.nitrogen,
          normalizedInputs.phosphorus,
          normalizedInputs.potassium,
          soilType
        );

        if (recommendedFertilizers && recommendedFertilizers.length > 0) {
          // Use the top recommended fertilizer
          const topFert = recommendedFertilizers[0];

          // Calculate dosage based on deficiency
          let totalDose = 100;
          if (normalizedInputs.nitrogen < 40) totalDose += 30;
          if (normalizedInputs.phosphorus < 20) totalDose += 20;
          if (normalizedInputs.potassium < 40) totalDose += 25;

          // Get alternative fertilizers
          const altFerts = recommendedFertilizers.slice(1, 3);

          const details = generateFertilizerDetailsFromDatabase(
            topFert.name,
            totalDose,
            altFerts
          );
          formattedPredictions = [details];
        } else {
          // Final fallback to balanced calculation
          const recommendedDose = calculateFertilizerDose(
            crop,
            normalizedInputs.nitrogen,
            normalizedInputs.phosphorus,
            normalizedInputs.potassium
          );

          const details = generateFertilizerRecommendationDetails(crop, recommendedDose);
          formattedPredictions = [details];
        }
      }

      // Save to Supabase fertilizer_recommendation table
      if (user_id && supabase) {
        try {
          const topPrediction = formattedPredictions[0];
          const { data, error } = await supabase.from('fertilizer_recommendation').insert({
            user_id: user_id,
            crop: crop,
            nitrogen: normalizedInputs.nitrogen,
            phosphorus: normalizedInputs.phosphorus,
            potassium: normalizedInputs.potassium,
            ph: normalizedInputs.ph,
            rainfall: normalizedInputs.rainfall,
            temperature: normalizedInputs.temperature,
            season: normalizedInputs.season,
            crop_name_predicted: topPrediction.fertilizer,
            crop_confidence: 85,
            recommended_fertilizer: topPrediction.fertilizer,
            fertilizer_dosage: topPrediction.dose || parseInt(topPrediction.dosage),
            application_timing: topPrediction.timing,
          });

          if (error) {
            console.warn('Failed to save fertilizer recommendation:', error.message);
          } else {
            console.log('Fertilizer recommendation saved successfully');
          }
        } catch (dbError: any) {
          console.warn('Failed to save fertilizer recommendation to database:', dbError.message);
        }
      }

      return res.json({
        success: true,
        message: 'Fertilizer recommendations generated successfully',
        predictions: formattedPredictions,
      });
    } catch (error: any) {
      console.error('Fertilizer suggestion error:', error.message);
      res.status(500).json({
        error: error.message || 'Failed to process fertilizer recommendation request',
      });
    }
  } catch (error: any) {
    console.error('Fertilizer suggestion error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to process fertilizer recommendation request',
    });
  }
}
