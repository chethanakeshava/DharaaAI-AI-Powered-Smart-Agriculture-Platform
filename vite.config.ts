import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: [".", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
    proxy: {
      // Proxy ML API calls directly to FastAPI server for faster predictions
      '/api/ml': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          // Convert /api/ml/crop-recommendation to /predict
          if (path.includes('crop-recommendation')) {
            return path.replace('/api/ml/crop-recommendation', '/predict');
          }
          // Convert /api/ml/fertilizer-suggestion to /predict-fertilizer
          if (path.includes('fertilizer-suggestion')) {
            return path.replace('/api/ml/fertilizer-suggestion', '/predict-fertilizer');
          }
          return path;
        },
      },
      // Proxy other API calls to Express server
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // Legacy direct proxies for backward compatibility
      '/predict': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      },
      '/predict-fertilizer': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
      const app = await createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
