import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    name: "server",
    environment: "node",
    setupFiles: ["./mongodb-memory-server.setup.js", "./env.setup.js"],
    isolate: false,
    maxWorkers: 1,
    sequence: {
      groupOrder: 0,
    },
  },
});
