import "dotenv/config";
import path from "path";
import { createServer } from "./index";
import express, { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

// ============== AUTH ROUTES ==============
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "./api/routes/auth";

// ============== COMMUNITY ROUTES ==============
import {
  getCommunities,
  createCommunity,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
} from "./api/routes/communities";

// ============== POSTS ROUTES ==============
import {
  getPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
} from "./api/routes/posts";

// ============== COMMENTS ROUTES ==============
import {
  getComments,
  createComment,
  deleteComment,
} from "./api/routes/comments";

// ============== FEEDBACK ROUTES ==============
import {
  getFeedback,
  submitFeedback,
  deleteFeedback,
} from "./api/routes/feedback";

// ============== ML ROUTES ==============
import {
  cropRecommendation,
  fertilizerSuggestion,
} from "./api/routes/ml";

// ============== CROP PRICES ROUTES ==============
import { getCropPrices, getKarnatakaPrices } from "./api/routes/prices";

// ============== DASHBOARD ROUTES ==============
import { getDashboardData } from "./api/routes/dashboard";

async function startServer() {
  const app = await createServer();
  const port = process.env.PORT || 3000;

  // Supabase client
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // ============== AUTH ROUTES ==============
  app.post("/api/auth/register", registerUser);
  app.post("/api/auth/login", loginUser);
  app.get("/api/auth/profile/:userId", getUserProfile);
  app.put("/api/auth/profile/:userId", updateUserProfile);
  app.post("/api/auth/change-password", changePassword);

  // ============== COMMUNITY ROUTES ==============
  app.get("/api/communities", getCommunities);
  app.post("/api/communities", createCommunity);
  app.get("/api/communities/:id", getCommunityById);
  app.put("/api/communities/:id", updateCommunity);
  app.delete("/api/communities/:id", deleteCommunity);
  app.post("/api/communities/:id/join", joinCommunity);
  app.post("/api/communities/:id/leave", leaveCommunity);

  // ============== POSTS ROUTES ==============
  app.get("/api/posts", getPosts);
  app.post("/api/posts", createPost);
  app.get("/api/posts/:id", getPostById);
  app.put("/api/posts/:id", updatePost);
  app.delete("/api/posts/:id", deletePost);
  app.post("/api/posts/:id/like", likePost);

  // ============== COMMENTS ROUTES ==============
  app.get("/api/posts/:postId/comments", getComments);
  app.post("/api/posts/:postId/comments", createComment);
  app.delete("/api/comments/:id", deleteComment);

  // ============== FEEDBACK ROUTES ==============
  app.get("/api/feedback", getFeedback);
  app.post("/api/feedback", submitFeedback);
  app.delete("/api/feedback/:id", deleteFeedback);

  // ============== ML ROUTES ==============
  app.post("/api/ml/crop-recommendation", cropRecommendation);
  app.post("/api/ml/fertilizer-suggestion", fertilizerSuggestion);

  // ============== CROP PRICES ROUTES ==============
  app.get("/api/prices/crop/:cropName", getCropPrices);
  app.get("/api/prices/karnataka/:cropName", getKarnatakaPrices);

  // ============== DASHBOARD ROUTES ==============
  app.get("/api/dashboard/:userId", getDashboardData);

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(distPath, "index.html"));
});

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
}

startServer();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
