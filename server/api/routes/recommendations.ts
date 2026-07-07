import { RequestHandler } from "express";

interface CropRecommendation {
  id: string;
  user_id: string;
  recommendation: string;
  confidence: number;
  soil_ph?: number;
  rainfall?: number;
  created_at: string;
}

interface FertilizerRecommendation {
  id: string;
  user_id: string;
  recommendation: string;
  confidence: number;
  soil_ph?: number;
  created_at: string;
}

interface Analytics {
  totalRecommendations: number;
  avgConfidence: number;
  trends: Array<{ period: string; count: number }>;
  topRecommendations: Array<{ name: string; count: number }>;
}

// Mock data storage (in production, this would be a database)
const mockCropHistory: CropRecommendation[] = [
  {
    id: "crop-1",
    user_id: "user-1",
    recommendation: "Wheat",
    confidence: 92,
    soil_ph: 6.5,
    rainfall: 450,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "crop-2",
    user_id: "user-1",
    recommendation: "Rice",
    confidence: 85,
    soil_ph: 6.8,
    rainfall: 600,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockFertilizerHistory: FertilizerRecommendation[] = [
  {
    id: "fert-1",
    user_id: "user-1",
    recommendation: "NPK 20:10:10",
    confidence: 88,
    soil_ph: 6.5,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "fert-2",
    user_id: "user-1",
    recommendation: "NPK 10:26:26",
    confidence: 82,
    soil_ph: 6.8,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const getCropRecommendationHistory: RequestHandler = (req, res) => {
  try {
    const { user_id } = req.params;
    const history = mockCropHistory.filter(rec => rec.user_id === user_id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch crop recommendation history" });
  }
};

export const deleteCropRecommendation: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const index = mockCropHistory.findIndex(rec => rec.id === id);
    if (index > -1) {
      mockCropHistory.splice(index, 1);
      res.json({ success: true, message: "Recommendation deleted" });
    } else {
      res.status(404).json({ error: "Recommendation not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete crop recommendation" });
  }
};

export const getFertilizerRecommendationHistory: RequestHandler = (req, res) => {
  try {
    const { user_id } = req.params;
    const history = mockFertilizerHistory.filter(rec => rec.user_id === user_id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fertilizer recommendation history" });
  }
};

export const deleteFertilizerRecommendation: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const index = mockFertilizerHistory.findIndex(rec => rec.id === id);
    if (index > -1) {
      mockFertilizerHistory.splice(index, 1);
      res.json({ success: true, message: "Recommendation deleted" });
    } else {
      res.status(404).json({ error: "Recommendation not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete fertilizer recommendation" });
  }
};

export const getCropAnalytics: RequestHandler = (req, res) => {
  try {
    const { user_id } = req.params;
    const userHistory = mockCropHistory.filter(rec => rec.user_id === user_id);
    
    if (userHistory.length === 0) {
      return res.json({
        totalRecommendations: 0,
        avgConfidence: 0,
        trends: [],
        topRecommendations: [],
      });
    }

    const avgConfidence = userHistory.reduce((sum, rec) => sum + rec.confidence, 0) / userHistory.length;
    
    // Group by month for trends
    const trends: { [key: string]: number } = {};
    userHistory.forEach(rec => {
      const date = new Date(rec.created_at);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      trends[period] = (trends[period] || 0) + 1;
    });

    const trendArray = Object.entries(trends)
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // Top recommendations
    const topRecs: { [key: string]: number } = {};
    userHistory.forEach(rec => {
      topRecs[rec.recommendation] = (topRecs[rec.recommendation] || 0) + 1;
    });

    const topRecommendations = Object.entries(topRecs)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      totalRecommendations: userHistory.length,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      trends: trendArray,
      topRecommendations,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch crop analytics" });
  }
};

export const getFertilizerAnalytics: RequestHandler = (req, res) => {
  try {
    const { user_id } = req.params;
    const userHistory = mockFertilizerHistory.filter(rec => rec.user_id === user_id);
    
    if (userHistory.length === 0) {
      return res.json({
        totalRecommendations: 0,
        avgConfidence: 0,
        trends: [],
        topRecommendations: [],
      });
    }

    const avgConfidence = userHistory.reduce((sum, rec) => sum + rec.confidence, 0) / userHistory.length;
    
    // Group by month for trends
    const trends: { [key: string]: number } = {};
    userHistory.forEach(rec => {
      const date = new Date(rec.created_at);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      trends[period] = (trends[period] || 0) + 1;
    });

    const trendArray = Object.entries(trends)
      .map(([period, count]) => ({ period, count }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // Top recommendations
    const topRecs: { [key: string]: number } = {};
    userHistory.forEach(rec => {
      topRecs[rec.recommendation] = (topRecs[rec.recommendation] || 0) + 1;
    });

    const topRecommendations = Object.entries(topRecs)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      totalRecommendations: userHistory.length,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      trends: trendArray,
      topRecommendations,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fertilizer analytics" });
  }
};
