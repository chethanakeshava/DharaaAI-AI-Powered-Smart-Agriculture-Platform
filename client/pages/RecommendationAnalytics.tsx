import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sprout, Leaf, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/hooks/useAuth';

interface Analytics {
  totalRecommendations: number;
  avgConfidence: number;
  trends: Array<{ period: string; count: number }>;
  topRecommendations: Array<{ name: string; count: number }>;
}

const RecommendationAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [cropAnalytics, setCropAnalytics] = useState<Analytics | null>(null);
  const [fertilizerAnalytics, setFertilizerAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [cropRes, fertilizerRes] = await Promise.all([
        fetch(`/api/recommendations/crop-analytics/${user?.id}`),
        fetch(`/api/recommendations/fertilizer-analytics/${user?.id}`),
      ]);

      const cropData = await cropRes.json();
      const fertilizerData = await fertilizerRes.json();

      setCropAnalytics(cropData);
      setFertilizerAnalytics(fertilizerData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const AnalyticsCard = ({ analytics, type }: { analytics: Analytics | null; type: 'crop' | 'fertilizer' }) => {
    if (!analytics) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No analytics data available.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-2">Total Recommendations</p>
                <p className="text-3xl font-bold">{analytics.totalRecommendations}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-2">Average Confidence</p>
                <p className="text-3xl font-bold">{analytics.avgConfidence.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-2">Type</p>
                <Badge variant="outline" className="mt-2">
                  {type === 'crop' ? <Sprout className="w-3 h-3 mr-1" /> : <Leaf className="w-3 h-3 mr-1" />}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {analytics.trends && analytics.trends.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recommendation Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {analytics.topRecommendations && analytics.topRecommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Top Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.topRecommendations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Recommendation Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Analyze your crop and fertilizer recommendation patterns and trends.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      ) : (
        <Tabs defaultValue="crop" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="crop" className="flex items-center gap-2">
              <Sprout className="w-4 h-4" />
              Crop Analytics
            </TabsTrigger>
            <TabsTrigger value="fertilizer" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Fertilizer Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crop">
            <AnalyticsCard analytics={cropAnalytics} type="crop" />
          </TabsContent>

          <TabsContent value="fertilizer">
            <AnalyticsCard analytics={fertilizerAnalytics} type="fertilizer" />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RecommendationAnalytics;
