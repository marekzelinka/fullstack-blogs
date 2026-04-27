import express from "express";

import { Blog } from "../models/blog.js";

export const blogsRouter = express.Router();

blogsRouter.post("/", async (req, res) => {
  const { title, author, url } = req.body ?? {};

  const blog = await Blog.create({
    title,
    author,
    url,
  });

  res.status(201).json(blog);
});

blogsRouter.get("/", async (_req, res) => {
  const blogs = await Blog.find();

  res.json(blogs);
});

blogsRouter.get("/:blogId", async (req, res) => {
  const blog = await Blog.findById(req.params.blogId);
  if (!blog) {
    res.status(404).json({ error: "Blog not found" });

    return;
  }

  res.json(blog);
});

blogsRouter.patch("/:blogId", async (req, res) => {
  const { title, author, url, likes } = req.body ?? {};

  const blog = await Blog.findByIdAndUpdate(
    req.params.blogId,
    { title, author, url, likes },
    { runValidators: true, returnDocument: "after" },
  );
  if (!blog) {
    res.status(404).json({ error: "Blog not found" });

    return;
  }

  res.json(blog);
});

blogsRouter.delete("/:blogId", async (req, res) => {
  await Blog.findByIdAndDelete(req.params.blogId);

  res.status(204).end();
});
