import supertest from "supertest";
import { beforeEach, describe, test, expect } from "vitest";

import { app } from "../src/app.js";
import { Blog } from "../src/models/blog.js";
import { blogTestUtils } from "./blog-test-utils.js";

const api = supertest(app);

describe("when there are initially some blogs saved", () => {
  beforeEach(async () => {
    await Blog.insertMany(blogTestUtils.initial);
  });

  describe("addition of a new blog", () => {
    test("succeeds with valid data", async () => {
      const newBlog = {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      };

      const res = await api.post("/api/blogs").send(newBlog);
      expect(res.status).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);

      const blogsAtEnd = await blogTestUtils.getSaved();
      expect(blogsAtEnd).toHaveLength(blogTestUtils.initial.length + 1);
      const titles = blogsAtEnd.map((blog) => blog.title);
      expect(titles).toContain(newBlog.title);
    });

    test("succeeds with likes the property defaults to 0", async () => {
      const newBlog = {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      };

      const res = await api.post("/api/blogs").send(newBlog);
      expect(res.status).toBe(201);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.likes).toBe(0);
    });

    test("fails with status 400 if data is invalid", async () => {
      const res1 = await api.post("/api/blogs").send({ author: "Robert C. Martin" });
      expect(res1.status).toBe(400);

      const res2 = await api
        .post("/api/blogs")
        .send({ title: "TDD harms architecture", author: "Robert C. Martin" });
      expect(res2.status).toBe(400);

      const res3 = await api.post("/api/blogs").send({
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      });
      expect(res3.status).toBe(400);

      const blogsAtEnd = await blogTestUtils.getSaved();
      expect(blogsAtEnd).toHaveLength(blogTestUtils.initial.length);
    });
  });

  describe("liking a blog", () => {
    test("succeeds by incrementing the likes property by 1", async () => {
      const blogsAtStart = await blogTestUtils.getSaved();
      const blogToLike = blogsAtStart[0];

      const res = await api.post(`/api/blogs/${blogToLike.id}/likes`);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.likes).toBe(blogToLike.likes + 1);
    });

    test("fails with status 404 if blog does not exist", async () => {
      const validNonexistingId = await blogTestUtils.nonExistingId();

      const res = await api.post(`/api/blogs/${validNonexistingId}/likes`);
      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/blog not found/i);
    });
  });

  describe("viewing blogs", () => {
    test("blogs are returned as json", async () => {
      const res = await api.get("/api/blogs");
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
    });

    test("all blogs are returned", async () => {
      const res = await api.get("/api/blogs");
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(blogTestUtils.initial.length);
    });

    test("a specific blog is within the returned blogs", async () => {
      const res = await api.get("/api/blogs");
      const titles = res.body.map((blog) => blog.title);
      expect(titles).toContain(blogTestUtils.initial[0].title);
    });

    describe("viewing a specific blog", () => {
      test("succeeds with a valid id", async () => {
        const blogsAtStart = await blogTestUtils.getSaved();
        const blogToView = blogsAtStart[0];

        const res = await api.get(`/api/blogs/${blogToView.id}`);
        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body).toStrictEqual(blogToView);
      });

      test("fails with status 404 if blog does not exist", async () => {
        const validNonexistingId = await blogTestUtils.nonExistingId();

        const res = await api.get(`/api/blogs/${validNonexistingId}`);
        expect(res.status).toBe(404);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body.error).toMatch(/blog not found/i);
      });

      test("fails with status 400 if id is invalid", async () => {
        const invalidId = "5a3d5da59070081a82a3445";

        const res = await api.get(`/api/blogs/${invalidId}`);
        expect(res.status).toBe(400);
        expect(res.headers["content-type"]).toMatch(/json/);
        expect(res.body.error).toMatch(/malformatted id/i);
      });
    });
  });

  describe("update of a blog", () => {
    test("succeeds with a valid id and update data", async () => {
      const blogsAtStart = await blogTestUtils.getSaved();
      const blogToEdit = blogsAtStart[0];

      const res = await api
        .patch(`/api/blogs/${blogToEdit.id}`)
        .send({ title: "React patterns!", author: "Mike Chan", url: "https://reactpatterns.org/" });
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body).toStrictEqual({
        ...blogToEdit,
        title: "React patterns!",
        author: "Mike Chan",
        url: "https://reactpatterns.org/",
      });
    });

    test("fails with status 404 if blog does not exist", async () => {
      const validNonexistingId = await blogTestUtils.nonExistingId();

      const res = await api.patch(`/api/blogs/${validNonexistingId}`).send({});
      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/blog not found/i);
    });

    test("fails with status 400 if id is invalid", async () => {
      const invalidId = "5a3d5da59070081a82a3445";

      const res = await api.patch(`/api/blogs/${invalidId}`).send({});
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/malformatted id/i);
    });
  });

  describe("deletion of a blog", () => {
    test("succeeds with status 204 if id is valid", async () => {
      const blogsAtStart = await blogTestUtils.getSaved();
      const blogToDelete = blogsAtStart[0];

      const res = await api.delete(`/api/blogs/${blogToDelete.id}`);
      expect(res.status).toBe(204);

      const blogsAtEnd = await blogTestUtils.getSaved();
      expect(blogsAtEnd).toHaveLength(blogTestUtils.initial.length - 1);
      const ids = blogsAtEnd.map((blog) => blog.id);
      expect(ids).not.toContain(blogToDelete.id);
    });

    test("succeeds with status 204 even if blog does not exist", async () => {
      const validNonexistingId = await blogTestUtils.nonExistingId();

      const res = await api.delete(`/api/blogs/${validNonexistingId}`);
      expect(res.status).toBe(204);
    });

    test("fails with status 400 if id is invalid", async () => {
      const invalidId = "5a3d5da59070081a82a3445";

      const res = await api.delete(`/api/blogs/${invalidId}`);
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/malformatted id/i);
    });
  });

  describe("unliking a blog", () => {
    test("succeeds by decrementing the likes property by 1", async () => {
      const blogsAtStart = await blogTestUtils.getSaved();
      const blogToUnlike = blogsAtStart[0];

      const res = await api.delete(`/api/blogs/${blogToUnlike.id}/likes`);
      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.likes).toBe(blogToUnlike.likes - 1);
    });

    test("fails with status 400 if likes would go below 0", async () => {
      const blogsAtStart = await blogTestUtils.getSaved();
      const blogToUnlike = blogsAtStart[0];
      // Manually set likes to 0
      await Blog.findByIdAndUpdate(blogToUnlike.id, { likes: 0 });

      const res = await api.delete(`/api/blogs/${blogToUnlike.id}/likes`);
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/cannot unlike a blog with 0 likes/i);
    });

    test("fails with status 404 if blog does not exist", async () => {
      const validNonexistingId = await blogTestUtils.nonExistingId();

      const res = await api.delete(`/api/blogs/${validNonexistingId}/likes`);
      expect(res.status).toBe(404);
      expect(res.headers["content-type"]).toMatch(/json/);
      expect(res.body.error).toMatch(/blog not found/i);
    });
  });
});
