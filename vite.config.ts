import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import viteCompression from "vite-plugin-compression";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manualChunks = (id: string) => {
  const normalizedId = id.replace(/\\/g, "/");

  if (!normalizedId.includes("/node_modules/")) {
    return undefined;
  }

  if (normalizedId.includes("/@radix-ui/")) {
    return "radix-vendor";
  }

  if (normalizedId.includes("/framer-motion/")) {
    return "motion-vendor";
  }

  if (normalizedId.includes("/recharts/")) {
    return "charts-vendor";
  }

  if (normalizedId.includes("/face-api.js/")) {
    return "face-api-vendor";
  }

  if (normalizedId.includes("/tfjs-image-recognition-base/")) {
    return "vision-base-vendor";
  }

  if (normalizedId.includes("/@tensorflow/")) {
    return "tensorflow-vendor";
  }

  if (normalizedId.includes("/socket.io-client/")) {
    return "realtime-vendor";
  }

  if (normalizedId.includes("/lucide-react/")) {
    return "icons-vendor";
  }

  return undefined;
};

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:5000",
        changeOrigin: true,
        ws: true,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), viteCompression()],
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: process.env.GENERATE_SOURCEMAP === "true",
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@lib": path.resolve(__dirname, "./src/lib"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.tsx",
  },
});
