import React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, RotateCw, Sprout, TrendingUp, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

export default function Rotation() {
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const [rotationPlan, setRotationPlan] = useState<any | null>(null);

  const cropOptions = [
    { value: "wheat", label: "Wheat", type: "Cereal" },
    { value: "rice", label: "Rice", type: "Cereal" },
    { value: "maize", label: "Maize", type: "Cereal" },
    { value: "cotton", label: "Cotton", type: "Fiber" },
    { value: "chickpea", label: "Chickpea", type: "Legume" },
    { value: "pigeon-pea", label: "Pigeon Pea", type: "Legume" },
    { value: "mustard", label: "Mustard", type: "Oilseed" },
  ];

  const generatePlan = (crop: string) => {
    setSelectedCrop(crop);

    const plans: Record<string, any> = {
      wheat: {
        year1: { season: "Rabi", crop: "Wheat", benefit: "Base crop - High market demand", nitrogen: "-80" },
        year2: { season: "Kharif", crop: "Green Gram", benefit: "Nitrogen fixation restores soil", nitrogen: "+40" },
        year3: { season: "Rabi", crop: "Mustard", benefit: "Disease break, improves soil structure", nitrogen: "-50" },
        year4: { season: "Kharif", crop: "Maize", benefit: "Deep roots improve soil aeration", nitrogen: "-70" },
        benefits: [
          "Reduces wheat-specific pest and disease buildup",
          "Improves soil nitrogen through legume inclusion",
          "Balances nutrient uptake patterns",
          "Increases overall farm profitability",
        ],
        soilHealth: "+35%",
        profitIncrease: "+28%",
        pestReduction: "-45%",
      },
      rice: {
        year1: { season: "Kharif", crop: "Rice", benefit: "Primary crop - staple food production", nitrogen: "-100" },
        year2: { season: "Rabi", crop: "Wheat", benefit: "Utilizes residual moisture", nitrogen: "-80" },
        year3: { season: "Kharif", crop: "Pigeon Pea", benefit: "Nitrogen fixation and soil improvement", nitrogen: "+50" },
        year4: { season: "Rabi", crop: "Chickpea", benefit: "Continued nitrogen enrichment", nitrogen: "+45" },
        benefits: [
          "Breaks rice blast and brown plant hopper cycles",
          "Improves waterlogged soil structure",
          "Balances nutrient depletion with legumes",
          "Diversifies income sources",
        ],
        soilHealth: "+40%",
        profitIncrease: "+32%",
        pestReduction: "-50%",
      },
    };

    const plan = plans[crop] || plans.wheat;
    setRotationPlan(plan);
    toast.success("Crop rotation plan generated!");
  };

  useEffect(() => {
    generatePlan("wheat");
  }, []);

  const implementationGuidelines = [
    {
      title: "Soil Testing",
      text: "Conduct soil tests before each season to track nutrient levels and adjust fertilizer accordingly. This ensures you're making data-driven decisions.",
      variant: "primary",
    },
    {
      title: "Transition Period",
      text: "The first rotation cycle may show modest improvements. Full benefits typically manifest in the second and third cycles as soil health compounds.",
      variant: "muted",
    },
    {
      title: "Record Keeping",
      text: "Maintain detailed records of yields, pest occurrences, and fertilizer use for each crop. This data helps optimize future rotations.",
      variant: "muted",
    },
    {
      title: "Flexibility",
      text: "While this plan is scientifically designed, be prepared to adjust based on market conditions, weather patterns, and your specific farm observations.",
      variant: "success",
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <RotateCw className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Crop Rotation Planner</h1>
              <p className="text-muted-foreground">Maximize soil health and yields with scientific rotation schedules</p>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Your Primary Crop</CardTitle>
            <CardDescription>Choose the crop you currently grow or plan to grow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {cropOptions.map((crop) => (
                <button
                  key={crop.value}
                  onClick={() => generatePlan(crop.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-center hover:scale-105 ${
                    selectedCrop === crop.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <Sprout className={`h-6 w-6 mx-auto mb-2 ${selectedCrop === crop.value ? "text-primary" : "text-muted-foreground"}`} />
                  <p className={`font-medium text-sm ${selectedCrop === crop.value ? "text-primary" : "text-foreground"}`}>{crop.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{crop.type}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {rotationPlan && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Soil Health Improvement</p>
                      <p className="text-3xl font-bold text-foreground">{rotationPlan.soilHealth}</p>
                      <p className="text-xs text-success mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Over 4-year cycle
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Profit Increase</p>
                      <p className="text-3xl font-bold text-foreground">{rotationPlan.profitIncrease}</p>
                      <p className="text-xs text-primary mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Compared to monoculture
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Pest Reduction</p>
                      <p className="text-3xl font-bold text-foreground">{rotationPlan.pestReduction}</p>
                      <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Lower pesticide costs
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>4-Year Rotation Schedule</CardTitle>
                <CardDescription>Scientifically designed crop sequence for your farm</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["year1", "year2", "year3", "year4"].map((year, index) => {
                    const yearData = rotationPlan[year];
                    return (
                      <div key={year} className="flex gap-4 p-5 rounded-lg border-2 border-border hover:border-primary/50 transition-all bg-card">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-xl font-bold text-primary-foreground">Y{index + 1}</span>
                          </div>
                          {index < 3 && <RotateCw className="h-5 w-5 text-primary animate-spin" style={{ animationDuration: "3s" }} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-xl font-display font-bold text-foreground">{yearData.crop}</h4>
                              <Badge variant="outline" className="mt-1">{yearData.season} Season</Badge>
                            </div>
                            <Badge variant={yearData.nitrogen.startsWith("+") ? "success" : "default"} className="text-sm">
                              {yearData.nitrogen} kg N/ha
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{yearData.benefit}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Info className="h-4 w-4 text-primary" />
                            <span className="text-primary font-medium">
                              {index === 0 && "Foundation year - Establishes baseline"}
                              {index === 1 && "Restoration phase - Rebuilds nutrients"}
                              {index === 2 && "Diversification - Breaks pest cycles"}
                              {index === 3 && "Optimization - Prepares for next cycle"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  Key Benefits of This Rotation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {rotationPlan.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                      <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                      <p className="text-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-6 w-6 text-primary" />
                  Implementation Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {implementationGuidelines.map((item) => {
                    const bgClass =
                      item.variant === "primary"
                        ? "bg-primary/5 border border-primary/20"
                        : item.variant === "success"
                        ? "bg-success/5 border border-success/20"
                        : "bg-muted/50 border border-border";

                    return (
                      <div key={item.title} className={`p-4 rounded-lg ${bgClass}`}>
                        <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.text}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
