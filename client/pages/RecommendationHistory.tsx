import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sprout, Leaf, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Recommendation {
  id: string;
  type: 'crop' | 'fertilizer';
  recommendation: string;
  confidence: number;
  date: string;
  soil_ph?: number;
  rainfall?: number;
}

const RecommendationHistory: React.FC = () => {
  const { user } = useAuth();
  const [cropRecommendations, setCropRecommendations] = useState<Recommendation[]>([]);
  const [fertilizerRecommendations, setFertilizerRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchRecommendations();
    }
  }, [user?.id]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const [cropRes, fertilizerRes] = await Promise.all([
        fetch(`/api/recommendations/crop-history/${user?.id}`),
        fetch(`/api/recommendations/fertilizer-history/${user?.id}`),
      ]);

      const cropData = await cropRes.json();
      const fertilizerData = await fertilizerRes.json();

      setCropRecommendations(Array.isArray(cropData) ? cropData : []);
      setFertilizerRecommendations(Array.isArray(fertilizerData) ? fertilizerData : []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: 'crop' | 'fertilizer') => {
    try {
      const endpoint = type === 'crop' 
        ? `/api/recommendations/crop/${id}`
        : `/api/recommendations/fertilizer/${id}`;
      
      await fetch(endpoint, { method: 'DELETE' });
      
      if (type === 'crop') {
        setCropRecommendations(prev => prev.filter(r => r.id !== id));
      } else {
        setFertilizerRecommendations(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Error deleting recommendation:', error);
    }
  };

  const RecommendationCard = ({ rec, type }: { rec: Recommendation; type: 'crop' | 'fertilizer' }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {type === 'crop' ? (
                <Sprout className="w-5 h-5 text-primary" />
              ) : (
                <Leaf className="w-5 h-5 text-accent" />
              )}
              <h3 className="font-semibold text-lg">{rec.recommendation}</h3>
              <Badge variant="outline" className="ml-auto">
                {rec.confidence}% confidence
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(rec.date).toLocaleDateString()}
              </div>
              {rec.soil_ph && <span>Soil pH: {rec.soil_ph}</span>}
              {rec.rainfall && <span>Rainfall: {rec.rainfall}mm</span>}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(rec.id, type)}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Recommendation History</h1>
        <p className="text-muted-foreground mt-2">
          View your crop and fertilizer recommendations from previous analyses.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading recommendations...</p>
        </div>
      ) : (
        <Tabs defaultValue="crop" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="crop" className="flex items-center gap-2">
              <Sprout className="w-4 h-4" />
              Crop Recommendations ({cropRecommendations.length})
            </TabsTrigger>
            <TabsTrigger value="fertilizer" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Fertilizer Recommendations ({fertilizerRecommendations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crop">
            {cropRecommendations.length === 0 ? (
              <Card>
                <CardContent className="pt-12 text-center">
                  <Sprout className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No crop recommendations yet.</p>
                </CardContent>
              </Card>
            ) : (
              cropRecommendations.map(rec => (
                <RecommendationCard key={rec.id} rec={rec} type="crop" />
              ))
            )}
          </TabsContent>

          <TabsContent value="fertilizer">
            {fertilizerRecommendations.length === 0 ? (
              <Card>
                <CardContent className="pt-12 text-center">
                  <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No fertilizer recommendations yet.</p>
                </CardContent>
              </Card>
            ) : (
              fertilizerRecommendations.map(rec => (
                <RecommendationCard key={rec.id} rec={rec} type="fertilizer" />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RecommendationHistory;
