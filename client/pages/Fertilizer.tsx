import React, { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sprout,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { generateMockFertilizerRecommendation } from "@/lib/mockData";

// Types for fertilizer response mapping
type FertilizerScheduleItem = {
  stage: string;
  timing: string;
  dosage: string;
  notes?: string;
};

type FertilizerRecommendation = {
  fertilizer: string;
  dosage?: string;
  applicationMethod?: string;
  timing?: string;
  estimatedCost?: string;
  benefits: string[];
  schedule: FertilizerScheduleItem[];
  alternatives: { name: string; cost: string; availability: string }[];
  warnings: string[];
};

export default function Fertilizer() {
  const [formData, setFormData] = useState({
    crop: "wheat",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    soilType: "loamy",
    temperature: "",
    humidity: "",
    moisture: "",
    cropStage: "vegetative",
  });

  const [recommendation, setRecommendation] = useState<FertilizerRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMockData, setIsMockData] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      // Validate required fields
      if (!formData.nitrogen || !formData.phosphorus || !formData.potassium) {
        throw new Error('Please fill in all NPK values');
      }

      const payload = {
        crop: formData.crop,
        nitrogen: parseFloat(formData.nitrogen || '0'),
        phosphorus: parseFloat(formData.phosphorus || '0'),
        potassium: parseFloat(formData.potassium || '0'),
        soilType: formData.soilType,
        temperature: parseFloat(formData.temperature || '25'),
        humidity: parseFloat(formData.humidity || '65'),
        moisture: parseFloat(formData.moisture || '50'),
        cropStage: formData.cropStage,
      };

      const ML_API = (import.meta as any).env?.VITE_ML_API_URL || '/api/ml/fertilizer-suggestion';

      // Get user_id from localStorage if available for tracking
      const user_id = localStorage.getItem('user_id');

      const payloadWithUser = {
        ...payload,
        ...(user_id && { user_id }),
      };

      const res = await fetch(ML_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadWithUser),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => null);
        console.error('Fertilizer API error', res.status, res.statusText, body);
        throw new Error(body || 'Failed to get fertilizer recommendation');
      }

      const data = await res.json();

      // Map model response to frontend-friendly recommendation
      let rec: FertilizerRecommendation;
      const pred = Array.isArray(data.predictions) ? data.predictions[0] : data.predictions || data;

      // If model returned a numeric dose
      if (pred?.dose || typeof pred?.fertilizer === 'number') {
        const dosage = pred.dose || `${pred.fertilizer} kg/ha`;
        rec = {
          fertilizer: 'Recommended Mix',
          dosage: typeof dosage === 'number' ? `${dosage} kg/ha` : String(dosage),
          applicationMethod: 'Follow recommended best-practices',
          timing: 'Split as per schedule below',
          estimatedCost: pred.estimatedCost || '—',
          benefits: pred.benefits || ['Improves nutrient balance'],
          schedule: pred.schedule || [
            { stage: 'Basal', timing: 'At sowing', dosage: typeof dosage === 'number' ? `${dosage * 0.4} kg/ha` : '—' },
            { stage: 'Top Dressing', timing: 'Tillering', dosage: typeof dosage === 'number' ? `${dosage * 0.6} kg/ha` : '—' },
          ],
          alternatives: pred.alternatives || [],
          warnings: pred.warnings || [],
        };
      } else {
        // If model returned fertilizer name and other fields
        rec = {
          fertilizer: pred?.fertilizer || pred?.label || 'NPK Mix',
          dosage: pred?.dosage || '—',
          applicationMethod: pred?.applicationMethod || 'Broadcast / Banding as applicable',
          timing: pred?.timing || 'Split applications',
          estimatedCost: pred?.estimatedCost || '—',
          benefits: pred?.benefits || ['Improves soil fertility'],
          schedule: pred?.schedule || [],
          alternatives: pred?.alternatives || [],
          warnings: pred?.warnings || [],
        };
      }

      setRecommendation(rec);
      toast.success('Fertilizer recommendation generated!');
    } catch (err: any) {
      console.error('Fertilizer prediction error', err);
      let userMsg = err?.message || 'Failed to fetch fertilizer recommendation';
      const isConnectionError = err?.name === 'AbortError' || err?.message?.includes('Failed to fetch') || err?.message?.includes('ECONNREFUSED');

      if (isConnectionError) {
        // Use mock data as fallback when ML server is unavailable
        console.log('ML server unavailable, using mock data for demo');
        try {
          const user_id = localStorage.getItem('user_id');
          const mockPayload = {
            crop: formData.crop,
            nitrogen: parseFloat(formData.nitrogen || '50'),
            phosphorus: parseFloat(formData.phosphorus || '50'),
            potassium: parseFloat(formData.potassium || '50'),
            temperature: parseFloat(formData.temperature || '25'),
            humidity: parseFloat(formData.humidity || '65'),
            moisture: parseFloat(formData.moisture || '50'),
            soilType: formData.soilType,
            ...(user_id && { user_id }),
          };

          const mockResponse = generateMockFertilizerRecommendation(mockPayload);

          if (Array.isArray(mockResponse.predictions) && mockResponse.predictions.length > 0) {
            const mockRec = mockResponse.predictions[0];
            const rec: FertilizerRecommendation = {
              fertilizer: mockRec.fertilizer || 'Recommended Fertilizer Mix',
              dosage: `${mockRec.dose || 100} kg/ha`,
              applicationMethod: 'Broadcasting or Banding',
              timing: 'Pre-planting or as per growth stage',
              estimatedCost: '₹5,000 - ₹8,000 per acre (approx)',
              benefits: ['Increased yield potential', 'Better nutrient balance', 'Improved soil health'],
              schedule: [
                { stage: 'Germination', timing: '0-20 days', dosage: '30%', notes: 'Early nutrient boost' },
                { stage: 'Vegetative', timing: '20-60 days', dosage: '50%', notes: 'Growth phase' },
                { stage: 'Reproductive', timing: '60+ days', dosage: '20%', notes: 'Flower/Fruit formation' },
              ],
              alternatives: [
                { name: 'Organic Compost', cost: '₹3,000/acre', availability: 'High' },
                { name: 'Vermicompost', cost: '₹6,000/acre', availability: 'Medium' },
              ],
              warnings: ['Demo data - Consult local agricultural officer for personalized advice'],
            };

            setRecommendation(rec);
            setIsMockData(true);
            toast.info('Using demo data (ML server unavailable). Start ML API to get real recommendations.');
            return;
          }
        } catch (mockErr) {
          console.error('Mock data generation error', mockErr);
          userMsg = 'ML server is not running. Please start: uvicorn main:app --reload --port 8001 from server/ml_api directory';
          toast.error(userMsg);
        }
      } else {
        toast.error(userMsg);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Fertilizer Optimizer</h1>
              <p className="text-muted-foreground">Get precise fertilizer recommendations for optimal crop nutrition</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Crop & Soil Details</CardTitle>
                <CardDescription>Provide information for accurate recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Select Crop</label>
                    <Select value={formData.crop} onValueChange={(val) => setFormData(prev => ({ ...prev, crop: val }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wheat">Wheat</SelectItem>
                        <SelectItem value="rice">Rice</SelectItem>
                        <SelectItem value="maize">Maize</SelectItem>
                        <SelectItem value="cotton">Cotton</SelectItem>
                        <SelectItem value="sugarcane">Sugarcane</SelectItem>
                        <SelectItem value="potato">Potato</SelectItem>
                        <SelectItem value="tomato">Tomato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Crop Growth Stage</label>
                    <Select value={formData.cropStage} onValueChange={(val) => setFormData(prev => ({ ...prev, cropStage: val }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="germination">Germination</SelectItem>
                        <SelectItem value="vegetative">Vegetative</SelectItem>
                        <SelectItem value="flowering">Flowering</SelectItem>
                        <SelectItem value="maturity">Maturity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Current Nitrogen (N) <span className="text-muted-foreground">(kg/ha)</span></label>
                    <Input type="number" name="nitrogen" value={formData.nitrogen} onChange={handleInputChange} placeholder="e.g., 80" required />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Current Phosphorus (P) <span className="text-muted-foreground">(kg/ha)</span></label>
                    <Input type="number" name="phosphorus" value={formData.phosphorus} onChange={handleInputChange} placeholder="e.g., 45" required />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Current Potassium (K) <span className="text-muted-foreground">(kg/ha)</span></label>
                    <Input type="number" name="potassium" value={formData.potassium} onChange={handleInputChange} placeholder="e.g., 50" required />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Soil Type</label>
                    <Select value={formData.soilType} onValueChange={(val) => setFormData(prev => ({ ...prev, soilType: val }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandy">Sandy</SelectItem>
                        <SelectItem value="loamy">Loamy</SelectItem>
                        <SelectItem value="clayey">Clayey</SelectItem>
                        <SelectItem value="silt">Silt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Temperature <span className="text-muted-foreground">(°C)</span></label>
                    <Input type="number" name="temperature" value={formData.temperature} onChange={handleInputChange} placeholder="e.g., 25" required step="0.1" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Humidity <span className="text-muted-foreground">(%)</span></label>
                    <Input type="number" name="humidity" value={formData.humidity} onChange={handleInputChange} placeholder="e.g., 65" required step="0.1" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Soil Moisture <span className="text-muted-foreground">(%)</span></label>
                    <Input type="number" name="moisture" value={formData.moisture} onChange={handleInputChange} placeholder="e.g., 60" required step="0.1" />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Analyzing..." : "Get Recommendation"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recommendation */}
          <div className="lg:col-span-2">
            {loading ? (
              <Card className="h-full flex items-center justify-center py-16">
                <div className="text-center max-w-md">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Leaf className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Analyzing Soil & Crop...</h3>
                  <p className="text-muted-foreground mb-4">Our AI is calculating the perfect fertilizer mix for your needs. This may take a moment.</p>
                  <div className="flex justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </Card>
            ) : !recommendation ? (
              <Card className="h-full flex items-center justify-center py-16">
                <div className="text-center max-w-md">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Leaf className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Ready for Precision Nutrition?</h3>
                  <p className="text-muted-foreground">Enter your crop and soil details to receive customized fertilizer recommendations that maximize yields while minimizing costs.</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {isMockData && (
                  <Card className="border-accent/30 bg-accent/5">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Demo Mode - Mock Data</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            The ML server is currently unavailable. These are example recommendations based on your parameters.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            To get real predictions, start the ML API: <code className="bg-muted px-2 py-1 rounded text-foreground">uvicorn main:app --reload --port 8001</code> from the <code className="bg-muted px-2 py-1 rounded text-foreground">server/ml_api</code> directory.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {/* Main Recommendation Card */}
                <Card className="overflow-hidden">
                  <div className="bg-primary p-6">
                    <h3 className="text-2xl font-display font-bold text-primary-foreground mb-2">{recommendation.fertilizer}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-primary-foreground text-primary border-0">{recommendation.dosage}</Badge>
                      <Badge className="bg-primary-foreground text-primary border-0">{recommendation.estimatedCost}</Badge>
                    </div>
                  </div>

                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sprout className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold text-foreground">Application Method</h4>
                        </div>
                        <p className="text-muted-foreground">{recommendation.applicationMethod}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold text-foreground">Timing</h4>
                        </div>
                        <p className="text-muted-foreground">{recommendation.timing}</p>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Key Benefits
                      </h4>
                      <ul className="space-y-2">
                        {recommendation.benefits.map((benefit: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Application Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle>Application Schedule</CardTitle>
                    <CardDescription>Follow this schedule for optimal results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendation.schedule.map((stage: any, index: number) => (
                        <div
                          key={index}
                          className="flex gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col items-center">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="font-bold text-primary">{index + 1}</span>
                            </div>
                            {index < recommendation.schedule.length - 1 && (
                              <div className="w-px h-full bg-border mt-2" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">{stage.stage}</h4>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge variant="outline">{stage.timing}</Badge>
                              <Badge variant="default">{stage.dosage}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{stage.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Alternatives */}
                <Card>
                  <CardHeader>
                    <CardTitle>Alternative Options</CardTitle>
                    <CardDescription>Other suitable fertilizer combinations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendation.alternatives.map((alt: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <p className="font-medium text-foreground">{alt.name}</p>
                            <p className="text-sm text-muted-foreground">Availability: {alt.availability}</p>
                          </div>
                          <Badge variant="outline">{alt.cost}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Warnings */}
                <Card className="border-warning">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-warning">
                      <AlertTriangle className="h-5 w-5" />
                      Important Precautions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {recommendation.warnings.map((warning: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
