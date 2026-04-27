import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const config = createEnv({
  server: {
    PORT: z.coerce.number().default(3001),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    MONGODB_URI: z.url({ protocol: /^mongodb(\+srv)?$/ }),
  },
  runtimeEnv: process.env,
});
