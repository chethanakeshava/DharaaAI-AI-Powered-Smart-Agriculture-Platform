import { Request, Response } from 'express';
import axios from 'axios';

// Commodity name mappings for flexibility
const COMMODITY_MAPPINGS: Record<string, string[]> = {
  'wheat': ['Wheat'],
  'rice': ['Rice'],
  'tomato': ['Tomato'],
  'onion': ['Onion'],
  'potato': ['Potato'],
  'cotton': ['Cotton'],
  'sugarcane': ['Sugarcane'],
  'corn': ['Maize', 'Corn'],
  'maize': ['Maize'],
  'jowar': ['Jowar(Sorghum)'],
  'bajra': ['Bajra(Pearl Millet/Cumbu)'],
  'sunflower': ['Sunflower'],
  'arhar': ['Arhar(Tur/Red Gram)(Whole)'],
  'gram': ['Bengal Gram(Gram)(Whole)'],
  'groundnut': ['Groundnut'],
  'soybean': ['Soybean'],
  'arecanut': ['Arecanut(Betelnut/Supari)'],
  'copra': ['Copra'],
  'cowpea': ['Cowpea(Lobia/Karamani)'],
};

export async function getCropPrices(req: Request, res: Response) {
  try {
    const { cropName } = req.params;

    if (!cropName) {
      return res.status(400).json({ error: 'Crop name is required' });
    }

    // Use getKarnatakaPrices function since we're focusing on Karnataka mandis
    return getKarnatakaPrices(req, res);
  } catch (error: any) {
    console.error('Get prices error:', error);
    res.status(500).json({ error: error.message || 'Failed to get prices' });
  }
}

export async function getKarnatakaPrices(req: Request, res: Response) {
  try {
    let { cropName } = req.params;

    if (!cropName) {
      return res.status(400).json({ error: 'Crop name is required' });
    }

    // Handle case where cropName might be an array
    const crop = Array.isArray(cropName) ? cropName[0] : cropName;

    // Get the list of commodities to search for
    const commoditiesToSearch = COMMODITY_MAPPINGS[crop.toLowerCase()] || [crop];

    // Fetch from data.gov.in API for Karnataka
    const DATAGOV_MANDI_API = process.env.DATAGOV_MANDI_API || '';
    const DATAGOV_API_KEY = process.env.DATAGOV_API_KEY || '';

    if (!DATAGOV_MANDI_API || !DATAGOV_API_KEY) {
      return res.status(500).json({
        error: 'API configuration missing. Please check environment variables.'
      });
    }

    const response = await axios.get(DATAGOV_MANDI_API, {
      params: {
        'api-key': DATAGOV_API_KEY,
        format: 'json',
        'filters[state.keyword]': 'Karnataka',
        limit: 100,
      },
      timeout: 10000,
    });

    if (!response.data || !response.data.records) {
      return res.status(400).json({ error: 'No data received from API' });
    }

    // Filter records by commodity
    const allRecords = response.data.records;
    const filteredRecords = allRecords.filter((record: any) => {
      const recordCommodity = Array.isArray(record.commodity) ? record.commodity[0] : record.commodity;
      return recordCommodity && commoditiesToSearch.some(commodity =>
        recordCommodity.toLowerCase().includes(commodity.toLowerCase())
      );
    });

    if (filteredRecords.length === 0) {
      return res.status(404).json({
        error: `Commodity '${crop}' not found in Karnataka markets`,
        availableCommodities: allRecords
          .map((r: any) => r.commodity)
          .filter((v: any, i: any, a: any) => a.indexOf(v) === i)
          .slice(0, 10),
      });
    }

    // Aggregate prices by market
    const marketPrices: Record<string, any> = {};
    let totalModalPrice = 0;
    let totalRecords = 0;

    for (const record of filteredRecords) {
      const market = record.market || 'Unknown Market';
      const district = record.district || 'Unknown District';
      const modalPrice = parseFloat(record.modal_price) || 0;
      const minPrice = parseFloat(record.min_price) || 0;
      const maxPrice = parseFloat(record.max_price) || 0;

      if (!marketPrices[market]) {
        marketPrices[market] = {
          market,
          district,
          commodity: record.commodity,
          variety: record.variety,
          prices: [],
          minPrices: [],
          maxPrices: [],
          arrivalDate: record.arrival_date,
        };
      }

      if (modalPrice > 0) {
        marketPrices[market].prices.push(modalPrice);
        totalModalPrice += modalPrice;
        totalRecords++;
      }
      if (minPrice > 0) marketPrices[market].minPrices.push(minPrice);
      if (maxPrice > 0) marketPrices[market].maxPrices.push(maxPrice);
    }

    // Calculate averages for each market
    const markets = Object.values(marketPrices).map((market: any) => ({
      market: market.market,
      district: market.district,
      commodity: market.commodity,
      variety: market.variety,
      price: Math.round(
        market.prices.reduce((a: number, b: number) => a + b, 0) / market.prices.length
      ),
      minPrice: Math.round(
        market.minPrices.reduce((a: number, b: number) => a + b, 0) / market.minPrices.length
      ),
      maxPrice: Math.round(
        market.maxPrices.reduce((a: number, b: number) => a + b, 0) / market.maxPrices.length
      ),
      arrivalDate: market.arrivalDate,
    }));

    // Sort by price descending
    markets.sort((a, b) => b.price - a.price);

    const averagePrice = totalRecords > 0 ? Math.round(totalModalPrice / totalRecords) : 0;

    res.json({
      success: true,
      crop: crop,
      region: 'Karnataka',
      averagePrice,
      marketCount: markets.length,
      recordCount: filteredRecords.length,
      lastUpdated: new Date().toISOString(),
      dataSource: 'data.gov.in - Ministry of Agriculture and Farmers Welfare',
      markets: markets.slice(0, 20), // Return top 20 markets
    });
  } catch (error: any) {
    console.error('Get Karnataka prices error:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to fetch Karnataka mandi prices',
    });
  }
}
