import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle, RotateCw, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface RotationPrediction {
  year: number;
  recommendedCrop: string;
  confidence: number;
  soilHealthScore: number;
  projectedNitrogen: number;
  benefits: string[];
  warnings: string[];
}

const AVAILABLE_CROPS = [
  'Rice',
  'Wheat',
  'Maize',
  'Cotton',
  'Sugarcane',
  'Groundnut',
  'Soybean',
  'Chickpea',
  'Potato',
  'Tomato'
];

export default function CropRotation() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<RotationPrediction[]>([]);

  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '7',
    rainfall: '100',
    temperature: '25',
    input_season: 'kharif',
    previous_crop: '',
    years: '3'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nitrogen || !formData.phosphorus || !formData.potassium) {
      toast.error('Please fill in all required fields (N, P, K)');
      return;
    }

    if (!formData.previous_crop) {
      toast.error('Please select the previous crop');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ml/crop-rotation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          nitrogen: parseFloat(formData.nitrogen),
          phosphorus: parseFloat(formData.phosphorus),
          potassium: parseFloat(formData.potassium),
          ph: parseFloat(formData.ph),
          rainfall: parseFloat(formData.rainfall),
          temperature: parseFloat(formData.temperature),
          years: parseInt(formData.years),
          user_id: user?.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get predictions');
      }

      setPredictions(data.predictions);
      toast.success('Crop rotation plan generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate crop rotation plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <RotateCw className="h-8 w-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                Crop Rotation Model
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced ML-based modeling to predict optimal crop sequences and soil health outcomes for long-term farm sustainability
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-1"
            >
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Soil & Environment Parameters</CardTitle>
                  <CardDescription>Enter your farm conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nitrogen */}
                    <div className="space-y-2">
                      <Label htmlFor="nitrogen">
                        Nitrogen (N) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="nitrogen"
                        name="nitrogen"
                        type="number"
                        placeholder="e.g., 60"
                        value={formData.nitrogen}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        required
                      />
                      <p className="text-xs text-muted-foreground">kg/ha</p>
                    </div>

                    {/* Phosphorus */}
                    <div className="space-y-2">
                      <Label htmlFor="phosphorus">
                        Phosphorus (P) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phosphorus"
                        name="phosphorus"
                        type="number"
                        placeholder="e.g., 30"
                        value={formData.phosphorus}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        required
                      />
                      <p className="text-xs text-muted-foreground">kg/ha</p>
                    </div>

                    {/* Potassium */}
                    <div className="space-y-2">
                      <Label htmlFor="potassium">
                        Potassium (K) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="potassium"
                        name="potassium"
                        type="number"
                        placeholder="e.g., 40"
                        value={formData.potassium}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                        required
                      />
                      <p className="text-xs text-muted-foreground">kg/ha</p>
                    </div>

                    {/* pH */}
                    <div className="space-y-2">
                      <Label htmlFor="ph">Soil pH</Label>
                      <Input
                        id="ph"
                        name="ph"
                        type="number"
                        placeholder="e.g., 7"
                        value={formData.ph}
                        onChange={handleInputChange}
                        min="0"
                        max="14"
                        step="0.1"
                      />
                    </div>

                    {/* Rainfall */}
                    <div className="space-y-2">
                      <Label htmlFor="rainfall">Annual Rainfall</Label>
                      <Input
                        id="rainfall"
                        name="rainfall"
                        type="number"
                        placeholder="e.g., 100"
                        value={formData.rainfall}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                      />
                      <p className="text-xs text-muted-foreground">mm</p>
                    </div>

                    {/* Temperature */}
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input
                        id="temperature"
                        name="temperature"
                        type="number"
                        placeholder="e.g., 25"
                        value={formData.temperature}
                        onChange={handleInputChange}
                        min="0"
                        step="0.1"
                      />
                      <p className="text-xs text-muted-foreground">°C</p>
                    </div>

                    {/* Season */}
                    <div className="space-y-2">
                      <Label htmlFor="season">Season</Label>
                      <Select
                        value={formData.input_season}
                        onValueChange={(value) => handleSelectChange('input_season', value)}
                      >
                        <SelectTrigger id="season">
                          <SelectValue placeholder="Select season" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kharif">Kharif</SelectItem>
                          <SelectItem value="rabi">Rabi</SelectItem>
                          <SelectItem value="zaid">Zaid (Summer)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Previous Crop */}
                    <div className="space-y-2">
                      <Label htmlFor="previous_crop">
                        Previous Crop <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.previous_crop}
                        onValueChange={(value) => handleSelectChange('previous_crop', value)}
                      >
                        <SelectTrigger id="previous_crop">
                          <SelectValue placeholder="Select crop" />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_CROPS.map(crop => (
                            <SelectItem key={crop} value={crop}>
                              {crop}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Prediction Years */}
                    <div className="space-y-2">
                      <Label htmlFor="years">Planning Period</Label>
                      <Select
                        value={formData.years}
                        onValueChange={(value) => handleSelectChange('years', value)}
                      >
                        <SelectTrigger id="years">
                          <SelectValue placeholder="Select years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Year</SelectItem>
                          <SelectItem value="2">2 Years</SelectItem>
                          <SelectItem value="3">3 Years</SelectItem>
                          <SelectItem value="4">4 Years</SelectItem>
                          <SelectItem value="5">5 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Generating...' : 'Generate Rotation Plan'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="lg:col-span-2"
            >
              {predictions.length === 0 ? (
                <Card className="h-full flex items-center justify-center min-h-96">
                  <CardContent className="text-center">
                    <RotateCw className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      Fill in the form and click "Generate Rotation Plan" to see your personalized crop rotation recommendations
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {predictions.map((prediction, index) => (
                    <motion.div
                      key={prediction.year}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Year {prediction.year}</span>
                                <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden max-w-xs">
                                  <div
                                    className="h-full bg-gradient-to-r from-primary to-primary/70"
                                    style={{ width: `${prediction.confidence}%` }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-foreground">
                                  {prediction.confidence}%
                                </span>
                              </div>
                              <CardTitle className="text-2xl mb-1">
                                {prediction.recommendedCrop}
                              </CardTitle>
                              <CardDescription>
                                Recommended crop for optimal rotation
                              </CardDescription>
                            </div>
                            <TrendingUp className="h-8 w-8 text-primary flex-shrink-0" />
                          </div>
                        </CardHeader>

                        <CardContent className="pt-6 space-y-6">
                          {/* Metrics */}
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-2">Soil Health Score</p>
                              <p className="text-2xl font-bold text-foreground">
                                {prediction.soilHealthScore}%
                              </p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-2">Projected Nitrogen</p>
                              <p className="text-2xl font-bold text-foreground">
                                {prediction.projectedNitrogen}
                              </p>
                              <p className="text-xs text-muted-foreground">kg/ha</p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/50">
                              <p className="text-xs text-muted-foreground mb-2">Confidence</p>
                              <p className="text-2xl font-bold text-foreground">
                                {prediction.confidence}%
                              </p>
                            </div>
                          </div>

                          {/* Benefits */}
                          {prediction.benefits.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <h4 className="font-semibold text-foreground">Benefits</h4>
                              </div>
                              <ul className="space-y-2">
                                {prediction.benefits.map((benefit, idx) => (
                                  <li key={idx} className="flex gap-2 text-sm text-foreground">
                                    <span className="text-green-600 font-bold">•</span>
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Warnings */}
                          {prediction.warnings.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                                <h4 className="font-semibold text-foreground">Warnings</h4>
                              </div>
                              <ul className="space-y-2">
                                {prediction.warnings.map((warning, idx) => (
                                  <li key={idx} className="flex gap-2 text-sm text-foreground">
                                    <span className="text-yellow-600 font-bold">⚠</span>
                                    {warning}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
