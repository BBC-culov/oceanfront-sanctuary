import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Public browser configuration. Keep this explicit so external CI/CD providers
// cannot accidentally build Bazhouse against a stale backend via old env vars.
const BAZHOUSE_BACKEND_URL = "https://lreerhxykovhkfciffnu.supabase.co";
const BAZHOUSE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZWVyaHh5a292aGtmY2lmZm51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDMwNzMsImV4cCI6MjA4ODU3OTA3M30.xYZhCrXQQfUyOb1sqhD6kpuKEQBkre7mrMsS4Cz_bz8";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(BAZHOUSE_BACKEND_URL),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(BAZHOUSE_PUBLISHABLE_KEY),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify("lreerhxykovhkfciffnu"),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
}));
