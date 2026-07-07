import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "@/components/site/Layout";
import Placeholder from "@/pages/Placeholder";
import About from "@/pages/About";
import Dashboard from "@/pages/Dashboard";
import CropAdvisor from "@/pages/CropAdvisor";
import Fertilizer from "@/pages/Fertilizer";
import Rotation from "@/pages/Rotation";
import CropRotation from "@/pages/CropRotation";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import LoginSelect from "@/pages/LoginSelect";
import LoginUser from "@/pages/LoginUser";
import LoginAdmin from "@/pages/LoginAdmin";
import InitializeAdmin from "@/pages/InitializeAdmin";
import ProfileDashboard from "@/pages/ProfileDashboard";
import CropPriceFinder from "@/pages/CropPriceFinder";
import CommunityForum from "@/pages/CommunityForum";
import RecommendationHistory from "@/pages/RecommendationHistory";
import RecommendationAnalytics from "@/pages/RecommendationAnalytics";
import AdminProfile from "@/pages/AdminProfile";
import AdminUsers from "@/pages/AdminUsers";
import AdminCrops from "@/pages/AdminCrops";
import AdminFertilizers from "@/pages/AdminFertilizers";
import AdminHome from "@/pages/AdminHome";
import ProfitAnalysis from "@/pages/ProfitAnalysis";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AppProvider>
            <Toaster />
            <Sonner />
            <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="crop-advisor" element={<CropAdvisor />} />
            <Route path="fertilizer" element={<Fertilizer />} />
            <Route path="rotation" element={<Rotation />} />
            <Route path="crop-rotation-model" element={<CropRotation />} />
            <Route path="community" element={<CommunityForum />} />
            <Route path="recommendation-history" element={<RecommendationHistory />} />
            <Route path="recommendation-analytics" element={<RecommendationAnalytics />} />
            <Route path="crop-price-finder" element={<CropPriceFinder />} />
            <Route path="profit-analysis" element={<ProfitAnalysis />} />
            <Route path="profiledashboard" element={<ProfileDashboard />} />
            <Route path="about" element={<About />} />
            <Route path="register" element={<Register />} />
            <Route path="login" element={<LoginSelect />} />
            <Route path="login/user" element={<LoginUser />} />
            <Route path="login/admin" element={<LoginAdmin />} />
            <Route path="initialize-admin" element={<InitializeAdmin />} />
            <Route path="admin-home" element={<ProtectedRoute requiredRole="admin"><AdminHome /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute requiredRole="admin"><AdminProfile /></ProtectedRoute>} />
            <Route path="admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="admin/crops" element={<ProtectedRoute requiredRole="admin"><AdminCrops /></ProtectedRoute>} />
            <Route path="admin/fertilizers" element={<ProtectedRoute requiredRole="admin"><AdminFertilizers /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Route>
            </Routes>
          </AppProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

const container = document.getElementById("root");
if (container) {
  const win = window as any;
  // reuse existing root if present (avoids createRoot on HMR)
  if (!win.__APP_ROOT__) {
    win.__APP_ROOT__ = createRoot(container);
  }
  const root = win.__APP_ROOT__;
  root.render(<App />);

  // HMR: unmount on dispose so the next module can mount cleanly
  if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose(() => {
      try {
        root.unmount();
      } catch (e) {
        // ignore
      }
      win.__APP_ROOT__ = undefined;
    });
  }
}
