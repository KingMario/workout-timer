import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/layout.tsx",
        "src/**/globals.css",
        "src/app/layout.tsx",
      ],
      // Layout usually has simple html structure.
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
