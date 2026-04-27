import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";

import { middleware } from "./core/middleware.js";
import { blogsRouter } from "./routers/blogs.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/api/health", async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Mongoose not connected");
    }

    await mongoose.connection.db.admin().command({ ping: 1 });

    res.status(200).json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      error: error.message,
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  }
});

app.use("/api/blogs", blogsRouter);
app.use("/api/*splat", middleware.unknownEndpoint);

app.get("/*splat", (_req, res) => {
  res.sendFile("public/index.html", { root: "." });
});

app.use(middleware._MUST_BE_LAST_errorHandler);
