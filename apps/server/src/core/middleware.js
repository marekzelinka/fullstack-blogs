import { logger } from "./logger.js";

export const middleware = {
  unknownEndpoint: (_req, res) => {
    res.status(404).send({ error: "Unknown endpoint" });
  },
  _MUST_BE_LAST_errorHandler: (error, _req, res, next) => {
    logger.error(error.message);

    if (error.name === "CastError") {
      res.status(400).json({ error: "Malformatted id" });

      return;
    } else if (error.name === "ValidationError") {
      res.status(400).json({ error: error.message });

      return;
    } else if (error.code === 11000 || error.name === "MongoServerError") {
      const key = Object.keys(error.keyValue)[0];
      const field = key[0].toUpperCase() + key.slice(1);

      res.status(400).json({ error: `${field} must be unique` });

      return;
    }

    next(error);
  },
};
