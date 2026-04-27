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
    }

    next(error);
  },
};
