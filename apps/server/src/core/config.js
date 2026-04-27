import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const config = createEnv({
  server: {
    PORT: z.coerce.number().default(3001),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    // Only require a real URL if we aren't testing
    MONGODB_URI:
      process.env.NODE_ENV === "test"
        ? z.url().optional()
        : z.url({ protocol: /^mongodb(\+srv)?$/ }),
  },
  runtimeEnv: process.env,
});
