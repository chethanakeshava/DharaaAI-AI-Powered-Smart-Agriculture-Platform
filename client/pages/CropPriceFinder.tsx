import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, MapPin, Loader2, AlertCircle, Building2 } from 'lucide-react';

type MarketData = {
  market: string;
  district: string;
  commodity: string;
  variety: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  arrivalDate: string;
};

export type CropPriceData = {
  crop: string;
  averagePrice: number;
  marketCount: number;
  recordCount: number;
  lastUpdated: string;
  markets: MarketData[];
  dataSource: string;
};

interface SearchBarProps {
  onSearch: (crop: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [cropName, setCropName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cropName.trim()) onSearch(cropName.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
            placeholder="Enter crop name (e.g., Tomato, Onion, Wheat)"
            className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 transition-colors shadow-sm"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !cropName.trim()}
          className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md flex items-center gap-2"
        >
          <Search size={20} />
          Search
        </button>
      </div>
    </form>
  );
}

interface PriceCardProps {
  data: CropPriceData;
}

export function PriceCard({ data }: PriceCardProps) {
  const formattedDate = new Date(data.lastUpdated).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-4xl">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2 capitalize">{data.crop}</h2>
            <p className="text-green-600 font-semibold flex items-center gap-2">
              <MapPin size={16} />
              Karnataka Markets (APMC)
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Markets Found</p>
            <p className="text-3xl font-bold text-green-600">{data.marketCount}</p>
          </div>
        </div>
        <div className="flex items-baseline gap-4 mt-4">
          <span className="text-5xl font-bold text-green-600">₹{data.averagePrice.toLocaleString('en-IN')}</span>
          <span className="text-gray-600">Average Price (Modal)</span>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 size={20} className="text-green-600" />
          Mandi Prices Across Karnataka
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 font-semibold text-gray-700">Market (APMC)</th>
                <th className="text-left p-3 font-semibold text-gray-700">District</th>
                <th className="text-right p-3 font-semibold text-gray-700">Min Price</th>
                <th className="text-right p-3 font-semibold text-gray-700">Modal Price</th>
                <th className="text-right p-3 font-semibold text-gray-700">Max Price</th>
                <th className="text-left p-3 font-semibold text-gray-700">Variety</th>
              </tr>
            </thead>
            <tbody>
              {data.markets.map((market, index) => (
                <tr key={`${market.market}-${index}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-medium text-gray-900">{market.market}</td>
                  <td className="p-3 text-gray-600">{market.district}</td>
                  <td className="p-3 text-right">
                    <span className="text-gray-700 font-medium">₹{market.minPrice.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-green-700 font-bold text-lg">₹{market.price.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-gray-700 font-medium">₹{market.maxPrice.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{market.variety}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>
            <p>Last updated: {formattedDate}</p>
            <p className="text-xs mt-1">Source: {data.dataSource}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-700">{data.recordCount} records</p>
            <p className="text-xs">from data.gov.in</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      <p className="mt-4 text-gray-600 text-lg">Fetching crop prices...</p>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-4 max-w-2xl">
      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
      <div>
        <h3 className="font-semibold text-red-900 text-lg mb-1">Error</h3>
        <p className="text-red-700">{message}</p>
      </div>
    </div>
  );
}

// Fetching helper - fetches real data from backend API
export async function fetchCropPrices(crop: string): Promise<CropPriceData> {
  const response = await fetch(`/api/prices/karnataka/${encodeURIComponent(crop)}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to fetch prices for ${crop}`);
  }

  const data = await response.json();
  return data;
}

export default function CropPriceFinderPage() {
  const [data, setData] = useState<CropPriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (crop: string) => {
    setError(''); setLoading(true); setData(null);
    try {
      const res = await fetchCropPrices(crop);
      setData(res);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch prices');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Karnataka Crop Price Finder</h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Get real-time mandi prices for various crops across Karnataka from data.gov.in. Search for any commodity to view prices from all APMC markets.
          </p>
          <p className="text-sm text-green-700 mt-4 font-semibold">📊 Data Source: Ministry of Agriculture and Farmers Welfare</p>
        </div>

        <div className="flex justify-center mb-12">
          <SearchBar onSearch={handleSearch} isLoading={loading} />
        </div>

        <div className="w-full flex justify-center">
          {loading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          {data && !loading && <PriceCard data={data} />}
        </div>

        {!loading && !error && !data && (
          <div className="mt-16 text-center">
            <p className="text-gray-600 text-lg mb-8 font-semibold">Popular commodities available in Karnataka mandis:</p>
            <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
              {['Maize', 'Wheat', 'Rice', 'Jowar', 'Onion', 'Tomato', 'Sunflower', 'Arhar', 'Gram', 'Bajra', 'Groundnut', 'Copra'].map((crop) => (
                <button
                  key={crop}
                  onClick={() => handleSearch(crop)}
                  className="px-6 py-3 bg-white border-2 border-green-200 text-green-700 rounded-xl font-medium hover:bg-green-50 hover:border-green-400 transition-colors shadow-sm"
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-20 py-8 border-t border-gray-200 bg-white rounded-lg">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-700 font-semibold mb-2">📍 All prices shown are from Karnataka Agricultural Produce Market Committees (APMC)</p>
            <p className="text-gray-600 text-sm">Data sourced from data.gov.in - Ministry of Agriculture and Farmers Welfare | Last updated: Real-time</p>
            <p className="text-gray-500 text-xs mt-2">Min Price = Minimum Modal Price | Modal Price = Most Common Price | Max Price = Maximum Modal Price</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
