import process from "node:process";

import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  test: {
    name: "client",
    sequence: {
      groupOrder: 1,
    },
    browser: {
      provider: playwright({
        launchOptions: {
          // Use system chrome locally, but default playwright binary in CI
          // TODO: Once playwright support ubuntu 26 lts we can remove this
          channel: process.env.CI ? undefined : "chrome",
        },
      }),
      enabled: true,
      headless: true,
      instances: [{ browser: "chromium" }],
    },
  },
});
