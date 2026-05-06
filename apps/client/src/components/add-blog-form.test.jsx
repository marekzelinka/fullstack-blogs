import { test, vi, expect } from "vitest";
import { render } from "vitest-browser-react";

import { AddBlogForm } from "./add-blog-form.jsx";

const MOCK_BLOG = {
  title: "TDD harms architecture",
  author: "Robert C. Martin",
  url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
};

test("calls event handler on submit", async () => {
  const onSubmit = vi.fn(() => ({ success: true }));

  const screen = await render(<AddBlogForm onSubmit={onSubmit} />);

  await screen.getByLabelText(/title/i).fill(MOCK_BLOG.title);
  await screen.getByLabelText(/author/i).fill(MOCK_BLOG.author);
  await screen.getByLabelText(/url/i).fill(MOCK_BLOG.url);

  await screen.getByRole("button", { name: /new blog/i }).click();

  expect(onSubmit).toHaveBeenCalledWith(MOCK_BLOG);
});

test("author is not required to submit", async () => {
  const onSubmit = vi.fn(() => ({ success: true }));

  const screen = await render(<AddBlogForm onSubmit={onSubmit} />);

  await screen.getByLabelText(/title/i).fill(MOCK_BLOG.title);
  await screen.getByLabelText(/url/i).fill(MOCK_BLOG.url);

  await screen.getByRole("button", { name: /new blog/i }).click();

  expect(onSubmit).toHaveBeenCalledWith({ ...MOCK_BLOG, author: "" });
});

test("does not call event handler when title is missing", async () => {
  const onSubmit = vi.fn(() => ({ success: true }));

  const screen = await render(<AddBlogForm onSubmit={onSubmit} />);

  await screen.getByLabelText(/author/i).fill(MOCK_BLOG.author);
  await screen.getByLabelText(/url/i).fill(MOCK_BLOG.url);

  await screen.getByRole("button", { name: /new blog/i }).click();

  expect(onSubmit).toHaveBeenCalledTimes(0);
});

test("does not call event handler when url is missing", async () => {
  const onSubmit = vi.fn(() => ({ success: true }));

  const screen = await render(<AddBlogForm onSubmit={onSubmit} />);

  await screen.getByLabelText(/title/i).fill(MOCK_BLOG.title);
  await screen.getByLabelText(/author/i).fill(MOCK_BLOG.author);

  await screen.getByRole("button", { name: /new blog/i }).click();

  expect(onSubmit).toHaveBeenCalledTimes(0);
});

test("resets form inputs on success", async () => {
  const onSubmit = vi.fn(() => ({ success: true }));

  const screen = await render(<AddBlogForm onSubmit={onSubmit} />);

  const titleInput = screen.getByLabelText(/title/i);
  const urlInput = screen.getByLabelText(/url/i);

  await titleInput.fill(MOCK_BLOG.title);
  await urlInput.fill(MOCK_BLOG.url);

  await screen.getByRole("button", { name: /new blog/i }).click();

  await expect.element(titleInput).toHaveValue("");
  await expect.element(urlInput).toHaveValue("");
});

test("does not reset form inputs if submission fails", async () => {
  const onSubmit = vi.fn(() => ({ success: false }));

  const screen = await render(<AddBlogForm onSubmit={onSubmit} />);

  const titleInput = screen.getByLabelText(/title/i);
  const urlInput = screen.getByLabelText(/url/i);

  await titleInput.fill(MOCK_BLOG.title);
  await urlInput.fill(MOCK_BLOG.url);

  await screen.getByRole("button", { name: /new blog/i }).click();

  await expect.element(titleInput).toHaveValue(MOCK_BLOG.title);
  await expect.element(urlInput).toHaveValue(MOCK_BLOG.url);
});
