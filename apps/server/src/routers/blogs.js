import express from "express";

import * as middleware from "../core/middleware.js";
import { Blog } from "../models/blog.js";

export const blogsRouter = express.Router();

blogsRouter.post("/", middleware.userExtractor, async (req, res) => {
  const user = req.user;
  const { title, author, url } = req.body;

  const blog = await Blog.create({
    title,
    author,
    url,
    owner: user._id,
  });

  await blog.populate("owner", { username: 1, name: 1 });

  await user.updateOne({ $push: { blogs: blog._id } });

  res.status(201).json(blog);
});

blogsRouter.post("/:blogId/likes", middleware.userExtractor, async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(
    req.params.blogId,
    { $inc: { likes: 1 } },
    { runValidators: true, returnDocument: "after" },
  ).populate("owner", { username: 1, name: 1 });
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }

  res.json(blog);
});

blogsRouter.get("/", async (_req, res) => {
  const blogs = await Blog.find().populate("owner", { username: 1, name: 1 });

  res.json(blogs);
});

blogsRouter.get("/:blogId", async (req, res) => {
  const { blogId } = req.params;

  const blog = await Blog.findById(blogId);
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }

  res.json(blog);
});

blogsRouter.patch("/:blogId", middleware.userExtractor, async (req, res) => {
  const user = req.user;
  const { blogId } = req.params;
  const { title, author, url } = req.body;

  const blog = await Blog.findOneAndUpdate(
    { _id: blogId, owner: user._id },
    {
      title,
      author,
      url,
    },
    { runValidators: true, returnDocument: "after" },
  ).populate("owner", { username: 1, name: 1 });
  if (!blog) {
    const docExists = await Blog.findById(blogId);
    if (!docExists) {
      return res.status(404).json({ error: "Blog not found" });
    }

    return res.status(403).json({ error: "Only the owner can update this blog" });
  }

  res.json(blog);
});

blogsRouter.delete("/:blogId", middleware.userExtractor, async (req, res) => {
  const user = req.user;
  const { blogId } = req.params;

  const blog = await Blog.findOneAndDelete({ _id: blogId, owner: user._id });
  if (!blog) {
    const docExists = await Blog.findById(blogId);
    if (!docExists) {
      return res.status(404).json({ error: "Blog not found" });
    }

    return res.status(403).json({ error: "Only the owner can delete this blog" });
  }

  await user.updateOne({ $pull: { blogs: blog._id } });

  res.status(204).end();
});

blogsRouter.delete("/:blogId/likes", middleware.userExtractor, async (req, res) => {
  const { blogId } = req.params;

  const blog = await Blog.findOneAndUpdate(
    // Only decrement if likes is greater than 0
    { _id: blogId, likes: { $gt: 0 } },
    { $inc: { likes: -1 } },
    { returnDocument: "after" },
  ).populate("owner", { username: 1, name: 1 });
  if (!blog) {
    // If blog is null, it's either not found or the blog already had 0 likes.
    const blogExists = await Blog.findById(req.params.blogId);
    if (!blogExists) {
      return res.status(404).json({ error: "Blog not found" });
    }

    return res.status(400).json({ error: "Cannot unlike a blog with 0 likes" });
  }

  res.json(blog);
});
