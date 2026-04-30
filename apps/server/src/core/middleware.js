import { User } from "../models/user.js";
import * as logger from "./logger.js";
import * as security from "./security.js";

export function unknownEndpoint(_req, res) {
  res.status(404).send({ error: "Unknown endpoint" });
}

export function _MUST_BE_LAST_errorHandler(error, _req, res, next) {
  logger.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).json({ error: "Malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  } else if (error.code === 11000 || error.name === "MongoServerError") {
    const field = Object.keys(error.keyValue)[0];
    const capitalized = field[0].toUpperCase() + field.slice(1);

    return res.status(400).json({ error: `${capitalized} must be unique` });
  } else if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid authentication credentials" });
  } else if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Expired token",
    });
  }

  next(error);
}

export function tokenExtractor(req, _res, next) {
  const authorization = req.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    req.token = authorization.replace("Bearer ", "");
  } else {
    req.token = null;
  }

  next();
}

export async function userExtractor(req, res, next) {
  const username = security.verifyToken(req.token);

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ error: "Invalid authentication credentials" });
  }

  req.user = user;

  next();
}
