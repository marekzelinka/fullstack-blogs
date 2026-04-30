import jwt from "jsonwebtoken";
import supertest from "supertest";
import { beforeEach, test, describe, expect, afterEach, vi } from "vitest";

import { app } from "../src/app.js";
import { env } from "../src/core/config.js";
import * as security from "../src/core/security.js";
import { User } from "../src/models/user.js";
import * as apiTestUtils from "./api-test-utils.js";

const api = supertest(app);

describe("when there is initially an user seeded", () => {
  beforeEach(async () => {
    const passwordHash = await security.hashPassword(apiTestUtils.initialUser.password);
    await User.create({
      username: apiTestUtils.initialUser.username,
      name: apiTestUtils.initialUser.name,
      passwordHash,
    });
  });

  describe("logging in", () => {
    test("succeeds with correct credentials and returning user details and the token", async () => {
      const credentials = {
        username: apiTestUtils.initialUser.username,
        password: apiTestUtils.initialUser.password,
      };

      const res = await api.post("/api/login").send(credentials);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.token).toBeDefined();
      expect(res.body.token).toBeTypeOf("string");
      expect(res.body.username).toBe(apiTestUtils.initialUser.username);
      expect(res.body.name).toBe(apiTestUtils.initialUser.name);
    });

    test("succeeds with the valid issued token that contains the correct sub", async () => {
      const credentials = {
        username: apiTestUtils.initialUser.username,
        password: apiTestUtils.initialUser.password,
      };

      const res = await api.post("/api/login").send(credentials);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);

      const token = res.body.token;
      const decoded = jwt.verify(token, env.SECRET_KEY);
      expect(decoded.sub).toBe(apiTestUtils.initialUser.username);
    });

    test("fails with status 401 and correct message for wrong password", async () => {
      const credentials = {
        username: apiTestUtils.initialUser.username,
        password: "wrongpassword",
      };

      const res = await api.post("/api/login").send(credentials);
      expect(res.status).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/invalid username or password/i);
    });

    test("fails with status 401 for non-existent user", async () => {
      const credentials = {
        username: "ghostuser",
        password: "anypassword",
      };

      const res = await api.post("/api/login").send(credentials);
      expect(res.status).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/invalid username or password/i);
    });
  });

  describe("access token", () => {
    const payload = { sub: "testuser" };

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("creates a valid token where the sub claim is the username", () => {
      const token = security.createAccessToken(payload);
      const username = security.verifyToken(token);

      expect(username).toBe(payload.sub);
    });

    test("fails verification if the token is invalid", () => {
      const token = security.createAccessToken(payload);
      const brokenToken = token.slice(0, -5) + "abcde";
      expect(() => security.verifyToken(brokenToken)).toThrow(jwt.JsonWebTokenError);
    });

    test("fails verification if the token is expired", () => {
      // Create a token that expires in 5 minutes
      const token = security.createAccessToken(payload, 5);
      // Should work fine immediately
      expect(security.verifyToken(token)).toBe(payload.sub);

      // Should throw an error after fast-forwarding past expiration by 5 minutes and 1 second
      vi.advanceTimersByTime(301 * 1000);
      expect(() => security.verifyToken(token)).toThrow(jwt.TokenExpiredError);
    });
  });
});
