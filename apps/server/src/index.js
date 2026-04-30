import mongoose from "mongoose";

import { app } from "./app.js";
import { env } from "./core/config.js";
import * as logger from "./core/logger.js";

try {
  logger.info("Connecting to MongoDB:", env.MONGODB_URI);
  await mongoose.connect(env.MONGODB_URI, {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
    family: 4,
  });
  logger.info("Connected to MongoDB");
} catch (error) {
  logger.error("Error connection to MongoDB:", error.message);
}

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});
