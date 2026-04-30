import express from "express";

import * as security from "../core/security.js";
import { User } from "../models/user.js";

export const usersRouter = express.Router();

usersRouter.post("/", async (req, res) => {
  const { username, name, password } = req.body;

  // We check this here because the database only sees the hash, not the raw string
  if (!password || password.length < 8) {
    return res.status(400).json({
      error: "Password must be at least 8 characters long",
    });
  }

  const passwordHash = await security.hashPassword(password);
  const user = await User.create({ username, name, passwordHash });

  res.status(201).json(user);
});

usersRouter.get("/", async (_req, res) => {
  const users = await User.find().populate("blogs", { title: 1, author: 1, url: 1, likes: 1 });

  res.json(users);
});
