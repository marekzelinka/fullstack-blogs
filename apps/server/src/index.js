import mongoose from "mongoose";

import { app } from "./app.js";
import { config } from "./core/config.js";
import { logger } from "./core/logger.js";

try {
  logger.info("Connecting to MongoDB:", config.MONGODB_URI);
  await mongoose.connect(config.MONGODB_URI, {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
    family: 4,
  });
  logger.info("Connected to MongoDB");
} catch (error) {
  logger.error("Error connection to MongoDB:", error.message);
}

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
