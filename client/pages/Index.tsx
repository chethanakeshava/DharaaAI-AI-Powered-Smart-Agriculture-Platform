import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Sprout,
  TrendingUp,
  Leaf,
  RotateCw,
  BarChart3,
  Check,
  Users,
  Award,
  Target,
  Newspaper,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

function AgriculturalNewsSection() {
  const [news, setNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      try {
        if (!isMounted) return;

        const response = await fetch('/api/news', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          if (isMounted && data.articles) {
            setNews(data.articles);
          }
        }
      } catch (err) {
        // Silently fail - don't show error, just don't show news section
        if (isMounted) {
          setNews([]);
        }
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Only show news section if we have news articles
  if (news.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Newspaper className="h-8 w-8 text-primary" />
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
              Agricultural News & Updates
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest news and developments in agriculture, farming, and sustainable practices
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article, index) => (
            <motion.div
              key={`${article.title}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                <Card className="h-full hover:shadow-xl transition-all flex flex-col group overflow-hidden">
                  {article.urlToImage && (
                    <div className="relative overflow-hidden bg-muted h-48">
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop';
                        }}
                      />
                    </div>
                  )}
                  <CardHeader className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {article.source.name}
                      </span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="text-sm mt-2 flex-1 line-clamp-2">
                      {article.description}
                    </CardDescription>
                    <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                      {formatDate(article.publishedAt)}
                    </div>
                  </CardHeader>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const redirectedRef = useRef(false);

  const userRole = useMemo(() => user?.role, [user?.role]);

  // Redirect admins to admin home page
  useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        navigate('/admin-home', { replace: true });
      }
    }
  }, [isAuthenticated, userRole]);

  // Don't render farmer features for admins
  if (isAuthenticated && user?.role === 'admin') {
    return null;
  }

  const features = [
    {
      icon: BarChart3,
      title: "Crop Price Finder",
      description:
        "Get real-time crop prices from markets across India. Search for any crop to view current prices and market trends.",
    },
    {
      icon: Sprout,
      title: "Smart Crop Recommendations",
      description:
        "AI-powered suggestions based on soil health, climate data, and market trends to help you choose the right crops.",
    },
    {
      icon: Leaf,
      title: "Fertilizer Optimizer",
      description:
        "Get precise fertilizer recommendations tailored to your soil composition and crop requirements.",
    },
    {
      icon: RotateCw,
      title: "Crop Rotation Planner",
      description:
        "Maximize soil health and yields with scientifically planned crop rotation schedules.",
    },
    {
      icon: TrendingUp,
      title: "Profit Analysis",
      description:
        "Track expenses, predict yields, and analyze profitability to make data-driven farming decisions.",
    },
    {
      icon: RotateCw,
      title: "Crop Rotation Model",
      description:
        "Advanced ML-based modeling to predict optimal crop sequences and soil health outcomes for long-term farm sustainability.",
    },
  ];

  const benefits = [
    "AI-based crop and fertilizer recommendations",
    "Soil health–focused farming approach",
    "Data-backed planting and rotation insights",
    "Market price awareness and trends",
    "Smart decision support for modern agriculture",
    "Accessible guidance anytime, anywhere",
  ];

  const stats = [
    { icon: Users, value: "10,000+", label: "Active Farmers" },
    { icon: Sprout, value: "50,000+", label: "Acres Managed" },
    { icon: Award, value: "95%", label: "Success Rate" },
    { icon: Target, value: "₹2Cr+", label: "Revenue Increased" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-20 pb-32">
        <div className="absolute bottom-0 left-[-95px] right-0 top-[-51px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEzNywgMTU3LCA5NCwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+') opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h1 initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
                Grow Smarter with{' '}
                <span className="text-primary">DharaaAI</span>
              </motion.h1>

              <motion.p initial={{opacity:0, y:16}} animate={{opacity:1, y:0}} transition={{duration:0.6, delay:0.12}} className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Transform your farming with AI-driven crop recommendations, fertilizer optimization, and profit analysis. Make data-backed decisions for sustainable and profitable agriculture.
              </motion.p>

              <motion.div initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} transition={{duration:0.6, delay:0.2}} className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/dashboard"><p>Get Started</p></Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/about">Learn More</Link>
                </Button>
              </motion.div>
            </div>

            <div className="relative">
              <motion.div initial={{opacity:0, scale:0.98, x:20}} animate={{opacity:1, scale:1, x:0}} transition={{duration:0.8, delay:0.28}} className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&h=1000&fit=crop"
                  alt="Modern farming with technology"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Comprehensive Farming Solutions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make informed decisions and boost your farm's productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                {feature.title === "Smart Crop Recommendations" ? (
                  <Link to="/crop-advisor" className="block">
                    <Card className="h-full hover:shadow-xl transition-all group">
                      <CardHeader>
                        <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <feature.icon className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription className="text-base">{feature.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ) : feature.title === "Crop Price Finder" ? (
                  <Link to="/crop-price-finder" className="block">
                    <Card className="h-full hover:shadow-xl transition-all group">
                      <CardHeader>
                        <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <feature.icon className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription className="text-base">{feature.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ) : feature.title === "Fertilizer Optimizer" ? (
                  <Link to="/fertilizer" className="block">
                    <Card className="h-full hover:shadow-xl transition-all group">
                      <CardHeader>
                        <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <feature.icon className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription className="text-base">{feature.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ) : feature.title === "Crop Rotation Planner" ? (
                  <Link to="/rotation" className="block">
                    <Card className="h-full hover:shadow-xl transition-all group">
                      <CardHeader>
                        <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <feature.icon className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription className="text-base">{feature.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ) : feature.title === "Crop Rotation Model" ? (
                  <Link to="/crop-rotation-model" className="block">
                    <Card className="h-full hover:shadow-xl transition-all group">
                      <CardHeader>
                        <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <feature.icon className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription className="text-base">{feature.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ) : feature.title === "Profit Analysis" ? (
                  <Link to="/profit-analysis" className="block">
                    <Card className="h-full hover:shadow-xl transition-all group">
                      <CardHeader>
                        <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <feature.icon className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription className="text-base">{feature.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ) : (
                  <Card className="h-full hover:shadow-xl transition-all group">
                    <CardHeader>
                      <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <feature.icon className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-6">
                Building Smarter Farming with DharaaAI
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                DharaaAI is designed to support farmers with intelligent, data-driven agricultural guidance. By combining machine learning with real-world agricultural knowledge, our platform aims to help farmers make smarter and more sustainable decisions.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-start gap-3"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=900&fit=crop"
                alt="Farmer using technology"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Agricultural News Section - Only for logged-in non-admin users */}
      {isAuthenticated && user?.role !== 'admin' && <AgriculturalNewsSection />}

      {/* CTA Section */}
      <section className="py-24 bg-secondary relative overflow-hidden">
        <div className="absolute bottom-0 left-[-95px] right-0 top-[-51px] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEzNywgMTU3LCA5NCwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+') opacity-30" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-6">
              Ready to Transform Your Farm?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of farmers already using DharaaAI to increase yields, reduce costs, and farm sustainably.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/dashboard">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
