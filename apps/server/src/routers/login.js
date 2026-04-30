import express from "express";

import * as security from "../core/security.js";
import { User } from "../models/user.js";

export const loginRouter = express.Router();

loginRouter.post("/", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user || !(await security.verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const accessToken = security.createAccessToken({ sub: user.username });

  res.status(200).json({ token: accessToken, username: user.username, name: user.name });
});
