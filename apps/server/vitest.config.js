import { loadEnvFile } from "node:process";

import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "server",
    environment: "node",
    env: loadEnvFile("./apps/server/.env.local"),
    setupFiles: "./vitest.setup.js",
  },
});
