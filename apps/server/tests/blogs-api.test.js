import supertest from "supertest";
import { beforeEach, describe, test, expect } from "vitest";

import { app } from "../src/app.js";
import * as security from "../src/core/security.js";
import { Blog } from "../src/models/blog.js";
import { User } from "../src/models/user.js";
import * as apiTestUtils from "./api-test-utils.js";

const api = supertest(app);

describe("when there are initially some blogs seeded with a owner", () => {
  let authHeader;
  let user;
  let userBlogs;

  beforeEach(async () => {
    const passwordHash = await security.hashPassword(apiTestUtils.initialUser.password);
    user = await User.create({
      username: apiTestUtils.initialUser.username,
      name: apiTestUtils.initialUser.name,
      passwordHash,
    });

    const token = security.createAccessToken({ sub: user.username });
    authHeader = { Authorization: `Bearer ${token}` };

    userBlogs = apiTestUtils.getInitialBlogs(user._id);
    const blogs = await Blog.insertMany(userBlogs);

    // Link seeded blogs back to the user
    await User.findByIdAndUpdate(user._id, {
      $push: { blogs: { $each: blogs.map((blog) => blog._id) } },
    });
  });

  describe("addition of a new blog", () => {
    test("succeeds with valid data", async () => {
      const newBlog = {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      };

      const res = await api.post("/api/blogs").set(authHeader).send(newBlog);
      expect(res.status).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);

      const blogsAtEnd = await apiTestUtils.getBlogsInDb();
      expect(blogsAtEnd).toHaveLength(userBlogs.length + 1);

      const titles = blogsAtEnd.map((blog) => blog.title);
      expect(titles).toContain(newBlog.title);

      const userInDb = await User.findOne({ username: apiTestUtils.initialUser.username });
      const userNoteIds = userInDb.blogs.map((id) => id.toString());
      expect(userNoteIds).toContain(res.body.id);
    });

    test("returns populated owner", async () => {
      const newBlog = {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      };

      const res = await api.post("/api/blogs").set(authHeader).send(newBlog);
      expect(res.body.owner).toBeTypeOf("object");
      expect(res.body.owner.username).toBe(apiTestUtils.initialUser.username);
      expect(res.body.owner.name).toBe(apiTestUtils.initialUser.name);
    });

    test("succeeds with likes the property defaults to 0", async () => {
      const newBlog = {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      };

      const res = await api.post("/api/blogs").set(authHeader).send(newBlog);
      expect(res.body.likes).toBe(0);
    });

    test("fails with status 400 if data is invalid", async () => {
      const res1 = await api
        .post("/api/blogs")
        .set(authHeader)
        .send({ author: "Robert C. Martin" });
      expect(res1.status).toBe(400);

      const res2 = await api
        .post("/api/blogs")
        .set(authHeader)
        .send({ title: "TDD harms architecture", author: "Robert C. Martin" });
      expect(res2.status).toBe(400);

      const res3 = await api.post("/api/blogs").set(authHeader).send({
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      });
      expect(res3.status).toBe(400);

      const blogsAtEnd = await apiTestUtils.getBlogsInDb();
      expect(blogsAtEnd).toHaveLength(userBlogs.length);
    });

    test("fails with status 401 if auth header is missing", async () => {
      const newBlog = {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      };

      const res = await api.post("/api/blogs").send(newBlog);
      expect(res.status).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/invalid authentication credentials/i);
    });
  });

  describe("liking a blog", () => {
    test("succeeds with likes incrementing by 1 and has populated owner", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();
      const blogToLike = blogsAtStart[0];

      const res = await api.post(`/api/blogs/${blogToLike.id}/likes`).set(authHeader);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.likes).toBe(blogToLike.likes + 1);
    });

    test("returns populated owner", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();
      const blogToLike = blogsAtStart[0];

      const res = await api.post(`/api/blogs/${blogToLike.id}/likes`).set(authHeader);
      expect(res.body.owner).toBeTypeOf("object");
      expect(res.body.owner.username).toBeDefined();
      expect(res.body.owner.passwordHash).toBeUndefined();
    });

    test("fails with status 401 if auth header is missing", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();
      const blogToLike = blogsAtStart[0];

      const res = await api.post(`/api/blogs/${blogToLike.id}/likes`);
      expect(res.status).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/invalid authentication credentials/i);
    });

    test("fails with status 404 if blog does not exist", async () => {
      const validNonexistingId = await apiTestUtils.getNonExistingBlogId(user._id);

      const res = await api.post(`/api/blogs/${validNonexistingId}/likes`).set(authHeader);
      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/blog not found/i);
    });
  });

  describe("viewing blogs", () => {
    test("all blogs are returned and match seed content", async () => {
      const res = await api.get("/api/blogs");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(userBlogs.length);

      const titles = res.body.map((blog) => blog.title);
      const expectedTitles = userBlogs.map((blog) => blog.title);
      expect(titles).toEqual(expect.arrayContaining(expectedTitles));
    });

    test("returns blogs with populated owner", async () => {
      const res = await api.get("/api/blogs");

      const firstBlog = res.body[0];
      expect(firstBlog.owner).toBeTypeOf("object");
      expect(firstBlog.owner.username).toBe(apiTestUtils.initialUser.username);
      expect(firstBlog.owner.passwordHash).toBeUndefined();
    });

    describe("viewing a specific blog", () => {
      test("succeeds with a valid id", async () => {
        const blogsAtStart = await apiTestUtils.getBlogsInDb();
        const blogToView = blogsAtStart[0];

        const res = await api.get(`/api/blogs/${blogToView.id}`);
        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body).toStrictEqual(blogToView);
      });

      test("fails with status 400 if id is invalid", async () => {
        const invalidId = "5a3d5da59070081a82a3445";

        const res = await api.get(`/api/blogs/${invalidId}`);
        expect(res.status).toBe(400);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body.error).toMatch(/malformatted id/i);
      });

      test("fails with status 404 if blog does not exist", async () => {
        const validNonexistingId = await apiTestUtils.getNonExistingBlogId(user._id);

        const res = await api.get(`/api/blogs/${validNonexistingId}`);
        expect(res.status).toBe(404);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body.error).toMatch(/blog not found/i);
      });
    });
  });

  describe("update of a blog", () => {
    test("succeeds when owned by the user and return populated owner", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();
      const blogToEdit = blogsAtStart[0];
      const updateData = {
        title: "React patterns!",
        author: "Mike Chan",
        url: "https://reactpatterns.org/",
      };

      const res = await api.patch(`/api/blogs/${blogToEdit.id}`).set(authHeader).send(updateData);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.title).toBe(updateData.title);
      expect(res.body.author).toBe(updateData.author);
      expect(res.body.url).toBe(updateData.url);
    });

    test("returns populated owner", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();
      const blogToEdit = blogsAtStart[0];
      const updateData = {
        title: "React patterns!",
        author: "Mike Chan",
        url: "https://reactpatterns.org/",
      };

      const res = await api.patch(`/api/blogs/${blogToEdit.id}`).set(authHeader).send(updateData);
      expect(res.body.owner).toBeTypeOf("object");
      expect(res.body.owner.username).toBeDefined();
      expect(res.body.owner.passwordHash).toBeUndefined();
    });

    test("ignores attempts to change the immutable owner", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();
      const blogToEdit = blogsAtStart[0];

      const otherUser = await User.create({ username: "other", passwordHash: "..." });

      const res = await api
        .patch(`/api/blogs/${blogToEdit.id}`)
        .set(authHeader) // auth header is blog owner
        .send({ owner: otherUser._id.toString() });
      expect(res.status).toBe(200);

      const blogInDb = await Blog.findById(blogToEdit.id);
      expect(blogInDb.owner.toString()).not.toBe(otherUser._id.toString());
      expect(blogInDb.owner.toString()).toBe(user._id.toString());
    });

    test("fails with status 400 if id is invalid", async () => {
      const invalidId = "5a3d5da59070081a82a3445";

      const res = await api.patch(`/api/blogs/${invalidId}`).set(authHeader).send({});
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/malformatted id/i);
    });

    test("fails with status 401 if auth header is missing", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();
      const blogToEdit = blogsAtStart[0];

      const res = await api.patch(`/api/blogs/${blogToEdit.id}`).send({});
      expect(res.status).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/invalid authentication credentials/i);
    });

    test("fails with status 403 if trying to update someone else's blog", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();
      const blogToEdit = blogsAtStart[0];

      const otherUser = await User.create({ username: "hacker", passwordHash: "..." });
      const otherHeader = {
        Authorization: `Bearer ${security.createAccessToken({ sub: otherUser.username })}`,
      };

      const res = await api
        .patch(`/api/blogs/${blogToEdit.id}`)
        .set(otherHeader)
        .send({ title: "Hacked!" });
      expect(res.status).toBe(403);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/only the owner can update this blog/i);
    });

    test("fails with status 404 if blog does not exist", async () => {
      const validNonexistingId = await apiTestUtils.getNonExistingBlogId(user._id);

      const res = await api.patch(`/api/blogs/${validNonexistingId}`).set(authHeader).send({});
      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/blog not found/i);
    });
  });

  describe("deletion of a blog", () => {
    test("succeeds with status 204 when owned by user", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();
      const blogToDelete = blogsAtStart[0];

      const res = await api.delete(`/api/blogs/${blogToDelete.id}`).set(authHeader);
      expect(res.status).toBe(204);

      const blogsAtEnd = await apiTestUtils.getBlogsInDb();
      expect(blogsAtEnd).toHaveLength(userBlogs.length - 1);

      const ids = blogsAtEnd.map((blog) => blog.id);
      expect(ids).not.toContain(blogToDelete.id);

      const userInDb = await User.findOne({ username: apiTestUtils.initialUser.username });
      const userNoteIds = userInDb.blogs.map((id) => id.toString());
      expect(userNoteIds).not.toContain(blogToDelete.id);
    });

    test("fails with status 400 if id is invalid", async () => {
      const invalidId = "5a3d5da59070081a82a3445";

      const res = await api.delete(`/api/blogs/${invalidId}`).set(authHeader);
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/malformatted id/i);
    });

    test("fails with status 401 if auth header is missing", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();
      const blogToEdit = blogsAtStart[0];

      const res = await api.delete(`/api/blogs/${blogToEdit.id}`);
      expect(res.status).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/invalid authentication credentials/i);
    });

    test("fails with status 403 if trying to delete someone else's blog", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();

      const otherUser = await User.create({ username: "hacker", passwordHash: "..." });
      const otherHeader = {
        Authorization: `Bearer ${security.createAccessToken({ sub: otherUser.username })}`,
      };

      const res = await api.delete(`/api/blogs/${blogsAtStart[0].id}`).set(otherHeader);
      expect(res.status).toBe(403);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/only the owner can delete this blog/i);
    });
  });

  describe("unliking a blog", () => {
    test("succeeds by decrementing the likes property by 1 and returns the populated owner", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();
      const blogToUnlike = blogsAtStart[0];
      // Ensure it has at least 1 like to start
      const updatedBlogToUnlike = await Blog.findByIdAndUpdate(
        blogToUnlike.id,
        { likes: 5 },
        { returnDocument: "after" },
      );

      const res = await api.delete(`/api/blogs/${updatedBlogToUnlike.id}/likes`).set(authHeader);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.likes).toBe(updatedBlogToUnlike.likes - 1);
    });

    test("returns populated owner", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();
      const blogToUnlike = blogsAtStart[0];
      // Ensure it has at least 1 like to start
      const updatedBlogToUnlike = await Blog.findByIdAndUpdate(
        blogToUnlike.id,
        { likes: 5 },
        { returnDocument: "after" },
      );

      const res = await api.delete(`/api/blogs/${updatedBlogToUnlike.id}/likes`).set(authHeader);
      expect(res.body.owner).toBeTypeOf("object");
      expect(res.body.owner.username).toBeDefined();
      expect(res.body.owner.passwordHash).toBeUndefined();
    });

    test("fails with status 400 if likes would go below 0", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();
      const blogToUnlike = blogsAtStart[0];
      // Ensure it has at least 1 like to start
      const updatedBlogToUnlike = await Blog.findByIdAndUpdate(
        blogToUnlike.id,
        { likes: 0 },
        { returnDocument: "after" },
      );

      const res = await api.delete(`/api/blogs/${updatedBlogToUnlike.id}/likes`).set(authHeader);
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/cannot unlike a blog with 0 likes/i);
    });

    test("fails with status 401 if auth header is missing", async () => {
      const blogsAtStart = await apiTestUtils.getBlogsInDb();
      const blogToUnlike = blogsAtStart[0];
      // Ensure it has at least 1 like to start
      const updatedBlogToUnlike = await Blog.findByIdAndUpdate(
        blogToUnlike.id,
        { likes: 5 },
        { returnDocument: "after" },
      );

      const res = await api.delete(`/api/blogs/${updatedBlogToUnlike.id}/likes`);
      expect(res.status).toBe(401);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/invalid authentication credentials/i);
    });

    test("fails with status 404 if blog does not exist", async () => {
      const validNonexistingId = await apiTestUtils.getNonExistingBlogId(user._id);

      const res = await api.delete(`/api/blogs/${validNonexistingId}/likes`).set(authHeader);
      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/blog not found/i);
    });
  });
});
