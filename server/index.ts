import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";

export async function createServer(): Promise<Express> {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Example API route
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Dynamically load all API routes
  try {
    // ============== AUTH ROUTES ==============
    const { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword } = await import("./api/routes/auth.js");
    app.post('/api/auth/register', registerUser);
    app.post('/api/auth/login', loginUser);
    app.get('/api/auth/profile/:userId', getUserProfile);
    app.put('/api/auth/profile/:userId', updateUserProfile);
    app.post('/api/auth/change-password', changePassword);
    console.log('✓ Auth routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load auth routes:', (e as any).message);
  }

  try {
    // ============== CHAT ROUTES ==============
    const { handleChat } = await import("./api/routes/chat.js");
    app.post('/api/chat', handleChat);
    console.log('✓ Chat routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load chat routes:', (e as any).message);
  }

  try {
    // ============== COMMUNITY ROUTES ==============
    const {
      getCommunities,
      createCommunity,
      getCommunityById,
      updateCommunity,
      deleteCommunity,
      joinCommunity,
      leaveCommunity,
    } = await import("./api/routes/communities.js");
    app.get('/api/communities', getCommunities);
    app.post('/api/communities', createCommunity);
    app.get('/api/communities/:id', getCommunityById);
    app.put('/api/communities/:id', updateCommunity);
    app.delete('/api/communities/:id', deleteCommunity);
    app.post('/api/communities/:id/join', joinCommunity);
    app.post('/api/communities/:id/leave', leaveCommunity);
    console.log('✓ Community routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load community routes:', (e as any).message);
  }

  try {
    // ============== POSTS ROUTES ==============
    const {
      getPosts,
      createPost,
      getPostById,
      updatePost,
      deletePost,
      likePost,
    } = await import("./api/routes/posts.js");
    app.get('/api/posts', getPosts);
    app.post('/api/posts', createPost);
    app.get('/api/posts/:id', getPostById);
    app.put('/api/posts/:id', updatePost);
    app.delete('/api/posts/:id', deletePost);
    app.post('/api/posts/:id/like', likePost);
    console.log('✓ Posts routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load posts routes:', (e as any).message);
  }

  try {
    // ============== COMMENTS ROUTES ==============
    const {
      getComments,
      createComment,
      deleteComment,
    } = await import("./api/routes/comments.js");
    app.get('/api/posts/:postId/comments', getComments);
    app.post('/api/posts/:postId/comments', createComment);
    app.delete('/api/comments/:id', deleteComment);
    console.log('✓ Comments routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load comments routes:', (e as any).message);
  }

  try {
    // ============== FEEDBACK ROUTES ==============
    const {
      getFeedback,
      submitFeedback,
      deleteFeedback,
    } = await import("./api/routes/feedback.js");
    app.get('/api/feedback', getFeedback);
    app.post('/api/feedback', submitFeedback);
    app.delete('/api/feedback/:id', deleteFeedback);
    console.log('✓ Feedback routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load feedback routes:', (e as any).message);
  }

  try {
    // ============== ML ROUTES ==============
    const {
      cropRecommendation,
      fertilizerSuggestion,
    } = await import("./api/routes/ml.js");
    app.post('/api/ml/crop-recommendation', cropRecommendation);
    app.post('/api/ml/fertilizer-suggestion', fertilizerSuggestion);
    console.log('✓ ML routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load ML routes:', (e as any).message);
  }

  try {
    // ============== CROP PRICES ROUTES ==============
    const { getCropPrices, getKarnatakaPrices } = await import("./api/routes/prices.js");
    app.get('/api/prices/crop/:cropName', getCropPrices);
    app.get('/api/prices/karnataka/:cropName', getKarnatakaPrices);
    console.log('✓ Prices routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load prices routes:', (e as any).message);
  }

  try {
    // ============== DASHBOARD ROUTES ==============
    const { getDashboardData } = await import("./api/routes/dashboard.js");
    app.get('/api/dashboard/:userId', getDashboardData);
    console.log('✓ Dashboard routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load dashboard routes:', (e as any).message);
  }

  try {
    // ============== RECOMMENDATION HISTORY & ANALYTICS ROUTES ==============
    const {
      getCropRecommendationHistory,
      deleteCropRecommendation,
      getFertilizerRecommendationHistory,
      deleteFertilizerRecommendation,
      getCropAnalytics,
      getFertilizerAnalytics,
    } = await import("./api/routes/recommendations.js");
    app.get('/api/recommendations/crop-history/:user_id', getCropRecommendationHistory);
    app.delete('/api/recommendations/crop/:id', deleteCropRecommendation);
    app.get('/api/recommendations/fertilizer-history/:user_id', getFertilizerRecommendationHistory);
    app.delete('/api/recommendations/fertilizer/:id', deleteFertilizerRecommendation);
    app.get('/api/recommendations/crop-analytics/:user_id', getCropAnalytics);
    app.get('/api/recommendations/fertilizer-analytics/:user_id', getFertilizerAnalytics);
    console.log('✓ Recommendations routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load recommendations routes:', (e as any).message);
  }

  try {
    // ============== ADMIN ROUTES ==============
    const {
      verifyToken,
      getAllUsers,
      getUserDetails,
      blockUser,
      unblockUser,
      makeUserAdmin,
      removeAdminRole,
      getAdminStats,
    } = await import("./api/routes/admin.js");
    app.get('/api/admin/users', verifyToken, getAllUsers);
    app.get('/api/admin/users/:userId', verifyToken, getUserDetails);
    app.post('/api/admin/users/:userId/block', verifyToken, blockUser);
    app.post('/api/admin/users/:userId/unblock', verifyToken, unblockUser);
    app.post('/api/admin/users/:userId/make-admin', verifyToken, makeUserAdmin);
    app.post('/api/admin/users/:userId/remove-admin', verifyToken, removeAdminRole);
    app.get('/api/admin/stats', verifyToken, getAdminStats);
    console.log('✓ Admin routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load admin routes:', (e as any).message);
  }

  try {
    // ============== ADMIN DATA ROUTES (Crops & Fertilizers) ==============
    const { verifyToken } = await import("./api/routes/admin.js");

    // Import the new admin-data routes
    const {
      getCrops,
      getCropById,
      createCrop,
      updateCrop,
      deleteCrop,
      getFertilizers,
      getFertilizerById,
      createFertilizer,
      updateFertilizer,
      deleteFertilizer,
    } = await import("./api/routes/admin-data.js");

    // Crop management routes
    app.get('/api/admin/crops', verifyToken, getCrops);
    app.get('/api/admin/crops/:cropId', verifyToken, getCropById);
    app.post('/api/admin/crops', verifyToken, createCrop);
    app.put('/api/admin/crops/:cropId', verifyToken, updateCrop);
    app.delete('/api/admin/crops/:cropId', verifyToken, deleteCrop);

    // Fertilizer management routes
    app.get('/api/admin/fertilizers', verifyToken, getFertilizers);
    app.get('/api/admin/fertilizers/:fertilizerId', verifyToken, getFertilizerById);
    app.post('/api/admin/fertilizers', verifyToken, createFertilizer);
    app.put('/api/admin/fertilizers/:fertilizerId', verifyToken, updateFertilizer);
    app.delete('/api/admin/fertilizers/:fertilizerId', verifyToken, deleteFertilizer);

    console.log('✓ Admin data routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load admin data routes:', (e as any).message);
  }

  try {
    // ============== SEED ROUTES ==============
    const { seedFirstAdmin } = await import("./api/routes/seed.js");
    app.post('/api/seed/create-first-admin', seedFirstAdmin);
    console.log('✓ Seed routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load seed routes:', (e as any).message);
  }

  try {
    // ============== NEWS ROUTES ==============
    const { getNews } = await import("./api/routes/news.js");
    app.get('/api/news', getNews);
    console.log('✓ News routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load news routes:', (e as any).message);
  }

  try {
    // ============== CROP ROTATION ROUTES ==============
    const { predictCropRotation } = await import("./api/routes/crop-rotation.js");
    app.post('/api/ml/crop-rotation', predictCropRotation);
    console.log('✓ Crop rotation routes loaded');
  } catch (e) {
    console.warn('⚠️ Failed to load crop rotation routes:', (e as any).message);
  }

  return app;
}
