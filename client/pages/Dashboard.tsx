import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Sprout, Leaf, RotateCw, BarChart3, Calendar, MapPin, CloudRain, Thermometer, LogIn, Cloud, Droplets, Wind, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/hooks/useAuth';

interface WeatherData {
  temp: string;
  humidity: string;
  rainfall: string;
  condition: string;
  windSpeed?: string;
  feelsLike?: string;
}

const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedSeason, setSelectedSeason] = useState('kharif');
  const [mounted, setMounted] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temp: '--°C',
    humidity: '--%',
    rainfall: '--mm',
    condition: 'Loading...',
    windSpeed: '--m/s',
    feelsLike: '--°C',
  });
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherLocation] = useState('Mangalore, Karnataka');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setWeatherLoading(true);
        setWeatherError(null);

        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

        // Use mock data if API key is not configured
        if (!apiKey) {
          console.log('[Weather] Using mock data - API key not configured');
          setWeatherData({
            temp: '32°C',
            humidity: '75%',
            rainfall: '8mm',
            condition: 'Partly Cloudy',
            windSpeed: '15km/h',
            feelsLike: '35°C',
          });
          setWeatherLoading(false);
          return;
        }

        // Get user's location (default to Mangalore coordinates)
        const latitude = 12.8628; // Mangalore latitude
        const longitude = 74.8454; // Mangalore longitude

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
        console.log('[Weather] Fetching from OpenWeatherMap API...');

        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

        console.log('[Weather] Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn('[Weather] API Error - Using mock data:', response.status, errorData.message);

          // Use mock data as fallback
          setWeatherData({
            temp: '32°C',
            humidity: '75%',
            rainfall: '8mm',
            condition: 'Partly Cloudy',
            windSpeed: '15km/h',
            feelsLike: '35°C',
          });
          setWeatherError('Using local weather data for Mangalore (API unavailable)');
          setWeatherLoading(false);
          return;
        }

        const data = await response.json();
        console.log('[Weather] Data received successfully');

        setWeatherData({
          temp: `${Math.round(data.main.temp)}°C`,
          humidity: `${data.main.humidity}%`,
          rainfall: `${data.rain?.['1h'] || 0}mm`,
          condition: data.weather[0]?.main || 'Unknown',
          windSpeed: `${(data.wind.speed * 3.6).toFixed(1)}km/h`,
          feelsLike: `${Math.round(data.main.feels_like)}°C`,
        });
        setWeatherError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('[Weather] Error fetching - Using mock data:', errorMessage);

        // Use mock data as fallback
        setWeatherData({
          temp: '32°C',
          humidity: '75%',
          rainfall: '8mm',
          condition: 'Partly Cloudy',
          windSpeed: '15km/h',
          feelsLike: '35°C',
        });
        setWeatherError('Using local weather data for Mangalore (API unavailable)');
      } finally {
        setWeatherLoading(false);
      }
    };

    if (mounted && isAuthenticated) {
      fetchWeatherData();
      // Refresh weather data every 10 minutes
      const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [mounted, isAuthenticated]);

  const seasons = [
    { id: 'kharif', label: 'Kharif (Monsoon)', months: 'June - October' },
    { id: 'rabi', label: 'Rabi (Winter)', months: 'October - March' },
    { id: 'zaid', label: 'Zaid (Summer)', months: 'March - June' },
  ];

  // Season-specific data structure
  const seasonData = {
    kharif: {
      yieldData: [
        { month: 'Jun', yield: 45 },
        { month: 'Jul', yield: 52 },
        { month: 'Aug', yield: 68 },
        { month: 'Sep', yield: 75 },
        { month: 'Oct', yield: 82 },
      ],
      stats: [
        { title: 'Total Revenue', value: '₹2,80,000', change: '+15.2%', trend: 'up', icon: TrendingUp, color: 'text-primary' },
        { title: 'Total Expenses', value: '₹1,20,000', change: '-3.5%', trend: 'down', icon: TrendingDown, color: 'text-primary' },
        { title: 'Net Profit', value: '₹1,60,000', change: '+22.1%', trend: 'up', icon: BarChart3, color: 'text-primary' },
        { title: 'Crop Yield', value: '82 Q/Acre', change: '+12.5%', trend: 'up', icon: Sprout, color: 'text-primary' },
      ],
      recommendations: [
        { icon: Sprout, title: 'Rice for Monsoon', description: 'Monsoon season is ideal for rice cultivation. High rainfall supports optimal growth.', confidence: 94, link: '/crop-advisor' },
        { icon: Leaf, title: 'NPK 15:15:15 Fertilizer', description: 'Balanced fertilizer recommended for monsoon crops to boost yield.', confidence: 90, link: '/fertilizer' },
        { icon: RotateCw, title: 'Legume Rotation', description: 'Prepare fields with legumes in previous season for nitrogen enrichment.', confidence: 88, link: '/rotation' },
      ],
      currentCrops: [
        { name: 'Rice', area: '5 Acres', stage: 'Panicle Formation', health: 'Excellent' },
        { name: 'Maize', area: '3 Acres', stage: 'Tassel Emergence', health: 'Excellent' },
        { name: 'Sugarcane', area: '2 Acres', stage: 'Growth', health: 'Good' },
      ],
      recentActivities: [
        { date: '2025-09-20', activity: 'Irrigation Management', crop: 'Rice' },
        { date: '2025-09-18', activity: 'Weed Control', crop: 'Maize' },
        { date: '2025-09-15', activity: 'Fertilizer Application', crop: 'Sugarcane' },
        { date: '2025-09-12', activity: 'Pest Monitoring', crop: 'Rice' },
      ],
    },
    rabi: {
      yieldData: [
        { month: 'Oct', yield: 48 },
        { month: 'Nov', yield: 58 },
        { month: 'Dec', yield: 65 },
        { month: 'Jan', yield: 72 },
        { month: 'Feb', yield: 78 },
        { month: 'Mar', yield: 85 },
      ],
      stats: [
        { title: 'Total Revenue', value: '₹2,95,000', change: '+14.8%', trend: 'up', icon: TrendingUp, color: 'text-primary' },
        { title: 'Total Expenses', value: '₹1,10,000', change: '-2.1%', trend: 'down', icon: TrendingDown, color: 'text-primary' },
        { title: 'Net Profit', value: '₹1,85,000', change: '+25.3%', trend: 'up', icon: BarChart3, color: 'text-primary' },
        { title: 'Crop Yield', value: '85 Q/Acre', change: '+15.2%', trend: 'up', icon: Sprout, color: 'text-primary' },
      ],
      recommendations: [
        { icon: Sprout, title: 'Wheat for Winter', description: 'Winter season is perfect for wheat. Cool temperatures ensure better yields.', confidence: 92, link: '/crop-advisor' },
        { icon: Leaf, title: 'NPK 20:10:10 Fertilizer', description: 'Nitrogen-rich fertilizer for winter crops to maximize productivity.', confidence: 90, link: '/fertilizer' },
        { icon: RotateCw, title: 'Rotate with Pulses', description: 'Use pulses to naturally replenish soil nitrogen for next season.', confidence: 87, link: '/rotation' },
      ],
      currentCrops: [
        { name: 'Wheat', area: '5 Acres', stage: 'Flowering', health: 'Excellent' },
        { name: 'Gram', area: '3 Acres', stage: 'Pod Formation', health: 'Good' },
        { name: 'Mustard', area: '2 Acres', stage: 'Silique Development', health: 'Excellent' },
      ],
      recentActivities: [
        { date: '2024-12-18', activity: 'Irrigation', crop: 'Wheat' },
        { date: '2024-12-15', activity: 'Fertilizer Application', crop: 'Gram' },
        { date: '2024-12-12', activity: 'Pest Control', crop: 'Mustard' },
        { date: '2024-12-10', activity: 'Soil Testing', crop: 'All Fields' },
      ],
    },
    zaid: {
      yieldData: [
        { month: 'Mar', yield: 50 },
        { month: 'Apr', yield: 60 },
        { month: 'May', yield: 70 },
        { month: 'Jun', yield: 65 },
      ],
      stats: [
        { title: 'Total Revenue', value: '₹1,85,000', change: '+8.5%', trend: 'up', icon: TrendingUp, color: 'text-primary' },
        { title: 'Total Expenses', value: '₹85,000', change: '-6.2%', trend: 'down', icon: TrendingDown, color: 'text-primary' },
        { title: 'Net Profit', value: '₹1,00,000', change: '+12.8%', trend: 'up', icon: BarChart3, color: 'text-primary' },
        { title: 'Crop Yield', value: '70 Q/Acre', change: '+9.3%', trend: 'up', icon: Sprout, color: 'text-primary' },
      ],
      recommendations: [
        { icon: Sprout, title: 'Cucumber for Summer', description: 'Summer season crops thrive with proper irrigation. Cucumber yields are high.', confidence: 89, link: '/crop-advisor' },
        { icon: Leaf, title: 'Balanced NPK Fertilizer', description: 'Micronutrients are essential in hot season for consistent growth.', confidence: 85, link: '/fertilizer' },
        { icon: RotateCw, title: 'Quick-Growing Crops', description: 'Use fast-maturing varieties suitable for short summer season.', confidence: 83, link: '/rotation' },
      ],
      currentCrops: [
        { name: 'Cucumber', area: '4 Acres', stage: 'Flowering', health: 'Excellent' },
        { name: 'Bitter Gourd', area: '2.5 Acres', stage: 'Fruit Development', health: 'Good' },
        { name: 'Squash', area: '1.5 Acres', stage: 'Vegetative', health: 'Good' },
      ],
      recentActivities: [
        { date: '2024-05-15', activity: 'Drip Irrigation Setup', crop: 'Cucumber' },
        { date: '2024-05-12', activity: 'Fertilizer Application', crop: 'Bitter Gourd' },
        { date: '2024-05-10', activity: 'Mulching', crop: 'Squash' },
        { date: '2024-05-08', activity: 'Pest Monitoring', crop: 'All Fields' },
      ],
    },
  };

  const currentSeasonData = seasonData[selectedSeason as keyof typeof seasonData];
  const yieldData = currentSeasonData.yieldData;
  const stats = currentSeasonData.stats;
  const recommendations = currentSeasonData.recommendations;
  const recentActivities = currentSeasonData.recentActivities;
  const currentCrops = currentSeasonData.currentCrops;

  const expenseData = [
    { category: 'Seeds', amount: 15000 },
    { category: 'Fertilizer', amount: 25000 },
    { category: 'Labor', amount: 30000 },
    { category: 'Equipment', amount: 20000 },
    { category: 'Other', amount: 10000 },
  ];

  const COLORS = ['#3cc274bb', '#3661a8bb', '#d19328db', '#5f37bc', '#e85c4af3'];

  if (!mounted || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-lg text-muted-foreground">Loading...</div></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-subtle py-12">
        <div className="max-w-md mx-auto px-4">
          <Card className="border-2 shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <LogIn className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Access Dashboard</CardTitle>
              <CardDescription className="text-base">
                You need to be logged in to view your farm dashboard and access all features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sign in to your account to view your farm statistics, crop recommendations, and analytics.
              </p>
              <Button asChild size="lg" className="w-full">
                <Link to="/login" className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Go to Login
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Don't have an account? <Link to="/register" className="text-primary hover:underline">Register here</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">Farm Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's what's happening with your farm today.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="appearance-none bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  {seasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      {season.label}
                    </option>
                  ))}
                </select>
                <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground" />
              </div>
              <Button asChild>
                <Link to="/crop-advisor">New Analysis</Link>
              </Button>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Weather Forecast</CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {weatherLocation}
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-6">
            {weatherError && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{weatherError}</p>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10">
                  <Thermometer className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="text-xl font-bold text-foreground">{weatherData.temp}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10">
                  <CloudRain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rainfall</p>
                  <p className="text-xl font-bold text-foreground">{weatherData.rainfall}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10">
                  <Droplets className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                  <p className="text-xl font-bold text-foreground">{weatherData.humidity}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10">
                  <Cloud className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Condition</p>
                  <p className="text-xl font-bold text-foreground">{weatherData.condition}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10">
                  <Wind className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wind Speed</p>
                  <p className="text-xl font-bold text-foreground">{weatherData.windSpeed}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10">
                  <Thermometer className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Feels Like</p>
                  <p className="text-xl font-bold text-foreground">{weatherData.feelsLike}</p>
                </div>
              </div>
            </div>
            {weatherLoading && (
              <p className="text-sm text-muted-foreground mt-4 text-center animate-pulse">Updating weather data...</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-primary" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-sm font-medium text-primary">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Yield Trend</CardTitle>
              <CardDescription>Monthly crop yield performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={yieldData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="yield" stroke="hsl(var(--primary))" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Distribution of farming costs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--surface))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                    formatter={(value: any) => `₹${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {expenseData.map((expense, index) => (
                  <div key={expense.category} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{expense.category}</p>
                      <p className="text-sm font-semibold text-foreground">₹{(expense.amount / 1000).toFixed(0)}k</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>Smart insights based on your farm data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.title} className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <rec.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-foreground">{rec.title}</h4>
                      <Badge variant="default">{rec.confidence}% Match</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={rec.link}>View Details →</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Crops</CardTitle>
              <CardDescription>Active crops in your fields</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentCrops.map((crop) => (
                  <div key={crop.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sprout className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{crop.name}</p>
                        <p className="text-sm text-muted-foreground">{crop.area} • {crop.stage}</p>
                      </div>
                    </div>
                    <Badge variant={crop.health === 'Excellent' ? 'default' : crop.health === 'Good' ? 'secondary' : 'outline'}>{crop.health}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest farm operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-success mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-foreground">{activity.activity}</p>
                        <span className="text-xs text-muted-foreground">{activity.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.crop}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
