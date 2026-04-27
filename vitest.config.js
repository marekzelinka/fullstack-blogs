import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["apps/*"],
    coverage: {
      provider: "v8",
    },
  },
});
