import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { env } from "./config.js";

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  return passwordHash;
}

export async function verifyPassword(password, passwordHash) {
  return await bcrypt.compare(password, passwordHash);
}

/**
 * Signs a new JWT access token with custom payload and expiration
 * @param {Object} payload - The payload to include in the token
 * @param {string|number} expiresDelta - The expiration time (e.g., '1h', '2d', or seconds)
 */
export function createAccessToken(payload, expireMinutes = undefined) {
  const expiresIn = `${expireMinutes ?? env.ACCESS_TOKEN_EXPIRE_MINUTES}m`;

  return jwt.sign(payload, env.SECRET_KEY, {
    expiresIn,
    algorithm: env.ALGORITHM,
  });
}

/**
 * Verifies a JWT and returns the decoded payload
 */
export function verifyToken(token) {
  const payload = jwt.verify(token, env.SECRET_KEY, {
    algorithms: [env.ALGORITHM],
  });

  return payload.sub;
}
