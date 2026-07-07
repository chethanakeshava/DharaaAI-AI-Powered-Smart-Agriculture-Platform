import { Request, Response } from 'express';
import { Crop, Fertilizer } from '@shared/api';

// In-memory storage for crops and fertilizers (in production, use Supabase)
const crops: Map<string, Crop> = new Map([
  ['crop-1', {
    id: 'crop-1',
    name: 'Wheat',
    season: 'Rabi',
    waterRequired: 450,
    nRequirement: 80,
    pRequirement: 40,
    kRequirement: 40,
    soilType: 'Loamy',
    minTemp: 10,
    maxTemp: 30,
    growthPeriod: 120,
    yieldPotential: 5,
    description: 'Winter crop suitable for temperate regions',
    createdAt: new Date().toISOString(),
  }],
  ['crop-2', {
    id: 'crop-2',
    name: 'Rice',
    season: 'Kharif',
    waterRequired: 1200,
    nRequirement: 100,
    pRequirement: 40,
    kRequirement: 40,
    soilType: 'Clayey',
    minTemp: 20,
    maxTemp: 35,
    growthPeriod: 120,
    yieldPotential: 5.5,
    description: 'Monsoon crop requiring high water',
    createdAt: new Date().toISOString(),
  }],
]);

const fertilizers: Map<string, Fertilizer> = new Map([
  ['fert-1', {
    id: 'fert-1',
    name: 'Urea',
    npkStatus: { n: 'Low', p: null, k: null },
    soilPH: 'Neutral',
    recommendedUse: 'To increase nitrogen content',
    benefits: ['Quick nitrogen availability', 'Increases vegetative growth'],
    price: 500,
    availability: 'In Stock',
    createdAt: new Date().toISOString(),
  }],
  ['fert-2', {
    id: 'fert-2',
    name: 'DAP (Di-Ammonium Phosphate)',
    npkStatus: { n: 'Medium', p: 'Low', k: null },
    soilPH: 'Neutral–Slightly Alkaline',
    recommendedUse: 'Nitrogen and phosphorus boost',
    benefits: ['Balanced N and P', 'Supports early growth'],
    price: 650,
    availability: 'In Stock',
    createdAt: new Date().toISOString(),
  }],
]);

// CROPS ENDPOINTS

export const getCrops = (req: Request, res: Response) => {
  try {
    const cropList = Array.from(crops.values());
    res.json({ crops: cropList });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCropById = (req: Request, res: Response) => {
  try {
    const { cropId } = req.params;
    const crop = crops.get(cropId);
    
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    
    res.json({ crop });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCrop = (req: Request, res: Response) => {
  try {
    const { name, season, waterRequired, nRequirement, pRequirement, kRequirement, soilType, minTemp, maxTemp, growthPeriod, yieldPotential, description } = req.body;

    // Validation
    if (!name || !season || !soilType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cropId = `crop-${Date.now()}`;
    const newCrop: Crop = {
      id: cropId,
      name,
      season,
      waterRequired,
      nRequirement,
      pRequirement,
      kRequirement,
      soilType,
      minTemp,
      maxTemp,
      growthPeriod,
      yieldPotential,
      description,
      createdAt: new Date().toISOString(),
    };

    crops.set(cropId, newCrop);
    res.status(201).json({ crop: newCrop, message: 'Crop created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCrop = (req: Request, res: Response) => {
  try {
    const { cropId } = req.params;
    const crop = crops.get(cropId);

    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    const updatedCrop: Crop = {
      ...crop,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    crops.set(cropId, updatedCrop);
    res.json({ crop: updatedCrop, message: 'Crop updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCrop = (req: Request, res: Response) => {
  try {
    const { cropId } = req.params;
    
    if (!crops.has(cropId)) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    crops.delete(cropId);
    res.json({ message: 'Crop deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// FERTILIZERS ENDPOINTS

export const getFertilizers = (req: Request, res: Response) => {
  try {
    const fertilizerList = Array.from(fertilizers.values());
    res.json({ fertilizers: fertilizerList });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFertilizerById = (req: Request, res: Response) => {
  try {
    const { fertilizerId } = req.params;
    const fertilizer = fertilizers.get(fertilizerId);
    
    if (!fertilizer) {
      return res.status(404).json({ error: 'Fertilizer not found' });
    }
    
    res.json({ fertilizer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createFertilizer = (req: Request, res: Response) => {
  try {
    const { name, npkStatus, soilPH, recommendedUse, benefits, price, availability } = req.body;

    // Validation
    if (!name || !soilPH || !recommendedUse) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const fertilizerId = `fert-${Date.now()}`;
    const newFertilizer: Fertilizer = {
      id: fertilizerId,
      name,
      npkStatus: npkStatus || { n: null, p: null, k: null },
      soilPH,
      recommendedUse,
      benefits,
      price,
      availability,
      createdAt: new Date().toISOString(),
    };

    fertilizers.set(fertilizerId, newFertilizer);
    res.status(201).json({ fertilizer: newFertilizer, message: 'Fertilizer created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFertilizer = (req: Request, res: Response) => {
  try {
    const { fertilizerId } = req.params;
    const fertilizer = fertilizers.get(fertilizerId);

    if (!fertilizer) {
      return res.status(404).json({ error: 'Fertilizer not found' });
    }

    const updatedFertilizer: Fertilizer = {
      ...fertilizer,
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    fertilizers.set(fertilizerId, updatedFertilizer);
    res.json({ fertilizer: updatedFertilizer, message: 'Fertilizer updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFertilizer = (req: Request, res: Response) => {
  try {
    const { fertilizerId } = req.params;
    
    if (!fertilizers.has(fertilizerId)) {
      return res.status(404).json({ error: 'Fertilizer not found' });
    }

    fertilizers.delete(fertilizerId);
    res.json({ message: 'Fertilizer deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
