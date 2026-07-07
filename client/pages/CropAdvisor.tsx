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
  Sprout,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { generateMockCropRecommendation } from "@/lib/mockData";

export default function CropAdvisor() {
  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
    season: "kharif",
  });

  const [recommendations, setRecommendations] = useState<any[] | null>(null);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
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

      // Humidity is kept in the form for demo purposes but not sent to backend
      const payload = {
        nitrogen: parseFloat(formData.nitrogen),
        phosphorus: parseFloat(formData.phosphorus),
        potassium: parseFloat(formData.potassium),
        temperature: parseFloat(formData.temperature) || 25,
        ph: parseFloat(formData.ph) || 7,
        rainfall: parseFloat(formData.rainfall) || 100,
        season: formData.season,
      };

      // Allow overriding API URL via Vite env (VITE_ML_API_URL). Falls back to relative /api/ml/crop-recommendation (proxied in dev).
      const ML_API = (import.meta as any).env?.VITE_ML_API_URL || '/api/ml/crop-recommendation';

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
        // Try to read body for better diagnostics
        let bodyText: string | null = null;
        try {
          bodyText = await res.text();
        } catch (e) {
          /* ignore */
        }
        const errorDetails = { status: res.status, statusText: res.statusText, body: bodyText };
        console.error('ML API error:', errorDetails);
        // Build a user-friendly message with status and short body
        let msg = `Prediction failed (status ${res.status})`;
        if (bodyText) {
          try {
            const err = JSON.parse(bodyText);
            const detail = err?.detail || err?.message || err?.error || err?.description || JSON.stringify(err);
            msg = `${msg}: ${String(detail).slice(0, 200)}`;
          } catch (e) {
            msg = `${msg}: ${String(bodyText).slice(0, 200)}`;
          }
        }
        msg = msg || 'Failed to get prediction';
        throw new Error(msg);
      }

      const data = await res.json();

      let recs: any[] = [];
      if (Array.isArray(data.predictions)) {
        recs = data.predictions.map((p: any) => ({
          crop: p.crop || String(p.label || p.prediction),
          confidence: p.confidence || Math.round((p.probability || 0) * 100) || 80,
          yield: p.yield || '—',
          roi: p.roi || '—',
          duration: p.duration || '—',
          suitability: p.suitability || 'Good',
          reasons: p.reasons || [],
          tips: p.tips || [],
        }));
      } else if (data.prediction) {
        recs = [
          {
            crop: data.prediction,
            confidence: data.confidence || 85,
            yield: '—',
            roi: '—',
            duration: '—',
            suitability: 'Good',
            reasons: [],
            tips: [],
          },
        ];
      } else {
        throw new Error('Invalid response from model');
      }

      setRecommendations(recs.slice(0, 3));
      setSubmittedData(payload);
      toast.success('Crop recommendations generated successfully!');
    } catch (err: any) {
      console.error('Prediction error', err);
      let userMsg = err?.message || 'Prediction failed';
      const isConnectionError = err?.name === 'AbortError' || err?.message?.includes('Failed to fetch') || err?.message?.includes('ECONNREFUSED');

      if (isConnectionError) {
        // Use mock data as fallback when ML server is unavailable
        console.log('ML server unavailable, using mock data for demo');
        try {
          const user_id = localStorage.getItem('user_id');
          const mockPayload = {
            nitrogen: parseFloat(formData.nitrogen),
            phosphorus: parseFloat(formData.phosphorus),
            potassium: parseFloat(formData.potassium),
            temperature: parseFloat(formData.temperature) || 25,
            humidity: parseFloat(formData.humidity) || 65,
            ph: parseFloat(formData.ph) || 7,
            rainfall: parseFloat(formData.rainfall) || 100,
            season: formData.season,
          };

          const mockResponse = generateMockCropRecommendation(mockPayload);

          let recs: any[] = [];
          if (Array.isArray(mockResponse.predictions)) {
            recs = mockResponse.predictions.map((p: any) => ({
              crop: p.crop || 'Unknown',
              confidence: Math.round(p.confidence),
              yield: '—',
              roi: '—',
              duration: '—',
              suitability: p.confidence > 85 ? 'Excellent' : p.confidence > 75 ? 'Very Good' : 'Good',
              reasons: p.reasons || [],
              tips: p.tips || [],
            }));
          }

          setRecommendations(recs.slice(0, 3));
          setSubmittedData(mockPayload);
          setIsMockData(true);
          toast.info('Using demo data (ML server unavailable). Start ML API to get real predictions.');
          return;
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

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case "Excellent":
        return "success";
      case "Very Good":
        return "default";
      case "Good":
        return "warning";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sprout className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Crop Recommendation</h1>
              <p className="text-muted-foreground">Get AI-powered crop suggestions based on your farm conditions</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Farm Parameters</CardTitle>
                <CardDescription>Enter your soil and climate data</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Nitrogen (N) <span className="text-muted-foreground">(kg/ha)</span>
                    </label>
                    <Input type="number" name="nitrogen" value={formData.nitrogen} onChange={handleInputChange} placeholder="e.g., 80" required />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Phosphorus (P) <span className="text-muted-foreground">(kg/ha)</span>
                    </label>
                    <Input type="number" name="phosphorus" value={formData.phosphorus} onChange={handleInputChange} placeholder="e.g., 45" required />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Potassium (K) <span className="text-muted-foreground">(kg/ha)</span>
                    </label>
                    <Input type="number" name="potassium" value={formData.potassium} onChange={handleInputChange} placeholder="e.g., 50" required />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Temperature <span className="text-muted-foreground">(°C)</span>
                    </label>
                    <Input type="number" name="temperature" value={formData.temperature} onChange={handleInputChange} placeholder="e.g., 25" required step="0.1" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Humidity <span className="text-muted-foreground">(%)</span>
                    </label>
                    <Input type="number" name="humidity" value={formData.humidity} onChange={handleInputChange} placeholder="e.g., 65" required step="0.1" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Soil pH</label>
                    <Input type="number" name="ph" value={formData.ph} onChange={handleInputChange} placeholder="e.g., 6.5" required step="0.1" min="0" max="14" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Rainfall <span className="text-muted-foreground">(mm)</span>
                    </label>
                    <Input type="number" name="rainfall" value={formData.rainfall} onChange={handleInputChange} placeholder="e.g., 150" required step="0.1" />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Season</label>
                    <Select value={formData.season} onValueChange={(val) => setFormData(prev => ({ ...prev, season: val }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kharif">Kharif (Monsoon)</SelectItem>
                        <SelectItem value="rabi">Rabi (Winter)</SelectItem>
                        <SelectItem value="zaid">Zaid (Summer)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Analyzing..." : "Get Recommendations"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-2">
            {loading ? (
              <Card className="h-full flex items-center justify-center py-16">
                <div className="text-center max-w-md">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Sprout className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Analyzing Your Farm...</h3>
                  <p className="text-muted-foreground mb-4">Our AI is processing your soil and climate data. This may take a moment.</p>
                  <div className="flex justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </Card>
            ) : !recommendations ? (
              <Card className="h-full flex items-center justify-center py-16">
                <div className="text-center max-w-md">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sprout className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Get Started?</h3>
                  <p className="text-muted-foreground">Fill in your farm parameters on the left to receive personalized crop recommendations powered by AI.</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {submittedData && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-foreground">Your Farm Parameters</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                          <span className="text-sm font-medium text-foreground">Nitrogen (N)</span>
                          <span className="font-semibold text-foreground">{submittedData.nitrogen} kg/ha</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                          <span className="text-sm font-medium text-foreground">Phosphorus (P)</span>
                          <span className="font-semibold text-foreground">{submittedData.phosphorus} kg/ha</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                          <span className="text-sm font-medium text-foreground">Potassium (K)</span>
                          <span className="font-semibold text-foreground">{submittedData.potassium} kg/ha</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                          <span className="text-sm font-medium text-foreground">Temperature</span>
                          <span className="font-semibold text-foreground">{submittedData.temperature}°C</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                          <span className="text-sm font-medium text-foreground">Soil pH</span>
                          <span className="font-semibold text-foreground">{submittedData.ph}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                          <span className="text-sm font-medium text-foreground">Rainfall</span>
                          <span className="font-semibold text-foreground">{submittedData.rainfall} mm</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                          <span className="text-sm font-medium text-foreground">Season</span>
                          <span className="font-semibold text-foreground capitalize">{submittedData.season}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                <div className="mt-8">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">Top Crop Recommendations</h2>
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <Card key={rec.crop} className="overflow-hidden border-0 shadow-soft">
                        <div className="bg-primary p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div>
                                <h3 className="text-2xl font-display font-bold text-primary-foreground">{rec.crop}</h3>
                              </div>
                              <Badge className="bg-primary-foreground/90 text-primary border-0 text-xs font-semibold">
                                {rec.confidence}% Match
                              </Badge>
                            </div>
                            <Badge variant={getSuitabilityColor(rec.suitability)} className="font-semibold">
                              {rec.suitability}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="pt-6 pb-6">
                          {/* Key Metrics */}
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 rounded-lg bg-gray-100">
                              <TrendingUp className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                              <p className="text-xs text-muted-foreground mb-2">Expected Yield</p>
                              <p className="font-semibold text-foreground text-sm">{rec.yield}</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-gray-100">
                              <TrendingUp className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                              <p className="text-xs text-muted-foreground mb-2">ROI</p>
                              <p className="font-semibold text-foreground text-sm">{rec.roi}</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-gray-100">
                              <Sprout className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                              <p className="text-xs text-muted-foreground mb-2">Duration</p>
                              <p className="font-semibold text-foreground text-sm">{rec.duration}</p>
                            </div>
                          </div>

                          {/* Why This Crop */}
                          <div className="mb-6">
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-base">
                              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                              Why This Crop?
                            </h4>
                            <ul className="space-y-2">
                              {rec.reasons.map((reason: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Growing Tips */}
                          <div>
                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-base">
                              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0" />
                              Growing Tips
                            </h4>
                            <ul className="space-y-2">
                              {rec.tips.map((tip: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
