import { test, vi, expect } from "vitest";
import { render } from "vitest-browser-react";

import { BlogCard } from "./blog-card.jsx";

const MOCK_BLOG = {
  id: "69f4d84da6568a97bd8d333a",
  title: "TDD harms architecture",
  author: "Robert C. Martin",
  url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
  likes: 4,
  owner: { username: "root", name: "Admin User" },
};

test("renders blog title and author but hides details by default", async () => {
  const screen = await render(
    <BlogCard blog={MOCK_BLOG} isOwner={false} onLike={vi.fn()} onDelete={vi.fn()} />,
  );

  await expect.element(screen.getByText(MOCK_BLOG.title)).toBeVisible();
  await expect.element(screen.getByText(MOCK_BLOG.author)).toBeVisible();
  await expect.element(screen.getByText(MOCK_BLOG.url)).not.toBeVisible();
  await expect.element(screen.getByText(`${MOCK_BLOG.likes} likes`)).not.toBeVisible();
  await expect.element(screen.getByText(MOCK_BLOG.owner.name)).not.toBeVisible();
});

test("shows details when the 'View' button is clicked", async () => {
  const screen = await render(
    <BlogCard blog={MOCK_BLOG} isOwner={false} onLike={vi.fn()} onDelete={vi.fn()} />,
  );

  await screen.getByRole("button", { name: /view/i }).click();

  await expect.element(screen.getByText(`${MOCK_BLOG.likes} likes`)).toBeVisible();
  await expect.element(screen.getByText(MOCK_BLOG.owner.name)).toBeVisible();
});

test("when expanded, rendering owner falls back to username when name is missing", async () => {
  const screen = await render(
    <BlogCard
      blog={{ ...MOCK_BLOG, owner: { username: MOCK_BLOG.owner.username } }}
      isOwner={false}
      onLike={vi.fn()}
      onDelete={vi.fn()}
    />,
  );

  await screen.getByRole("button", { name: /view/i }).click();

  await expect.element(screen.getByText(MOCK_BLOG.owner.username)).toBeVisible();
});

test("when expanded, renders the correct pluralization based on blog likes", async () => {
  const screen = await render(
    <BlogCard
      blog={{ ...MOCK_BLOG, likes: 0 }}
      isOwner={false}
      onLike={vi.fn()}
      onDelete={vi.fn()}
    />,
  );

  await screen.getByRole("button", { name: /view/i }).click();

  await expect.element(screen.getByText(`0 likes`)).toBeVisible();

  await screen.rerender(
    <BlogCard
      blog={{ ...MOCK_BLOG, likes: 1 }}
      isOwner={false}
      onLike={vi.fn()}
      onDelete={vi.fn()}
    />,
  );

  await expect.element(screen.getByText(`1 like`)).toBeVisible();

  await screen.rerender(
    <BlogCard
      blog={{ ...MOCK_BLOG, likes: 420 }}
      isOwner={false}
      onLike={vi.fn()}
      onDelete={vi.fn()}
    />,
  );

  await expect.element(screen.getByText(`420 likes`)).toBeVisible();
});

test("when expanded, like button is visible to every user", async () => {
  const screen = await render(
    <BlogCard blog={MOCK_BLOG} isOwner={true} onLike={vi.fn()} onDelete={vi.fn()} />,
  );

  await screen.getByRole("button", { name: /view/i }).click();

  await expect.element(screen.getByRole("button", { name: /like/i })).toBeVisible();

  await screen.rerender(
    <BlogCard blog={MOCK_BLOG} isOwner={false} onLike={vi.fn()} onDelete={vi.fn()} />,
  );

  await expect.element(screen.getByRole("button", { name: /like/i })).toBeInTheDocument();
});

test("when expanded, calls event handler when like button is clicked", async () => {
  const onLike = vi.fn();

  const screen = await render(
    <BlogCard blog={MOCK_BLOG} isOwner={false} onLike={onLike} onDelete={vi.fn()} />,
  );

  await screen.getByRole("button", { name: /view/i }).click();
  await screen.getByRole("button", { name: /like/i }).click();

  expect(onLike).toHaveBeenCalledTimes(1);
});

test("delete button is visible only if user is owner and blog is expanded", async () => {
  const screen = await render(
    <BlogCard blog={MOCK_BLOG} isOwner={true} onLike={vi.fn()} onDelete={vi.fn()} />,
  );

  await screen.getByRole("button", { name: /view/i }).click();

  await expect.element(screen.getByRole("button", { name: /delete/i })).toBeVisible();

  await screen.rerender(
    <BlogCard blog={MOCK_BLOG} isOwner={false} onLike={vi.fn()} onDelete={vi.fn()} />,
  );

  await expect.element(screen.getByRole("button", { name: /delete/i })).not.toBeInTheDocument();
});

test("when expanded, calls event handler when delete button is clicked and confirmed", async () => {
  const onDelete = vi.fn();

  const screen = await render(
    <BlogCard blog={MOCK_BLOG} isOwner={true} onLike={vi.fn()} onDelete={onDelete} />,
  );

  await screen.getByRole("button", { name: /view/i }).click();

  const shouldDeleteConfirmation = vi.spyOn(window, "confirm").mockImplementation(() => true);
  await screen.getByRole("button", { name: /delete/i }).click();

  expect(shouldDeleteConfirmation).toHaveBeenCalledWith(
    `Remove blog "${MOCK_BLOG.title}" by "${MOCK_BLOG.author}"?`,
  );
  expect(onDelete).toHaveBeenCalledWith(MOCK_BLOG.id);
});

test("when expanded, does not call the event handler when delete button is clicked and not confirmed", async () => {
  const onDelete = vi.fn();

  const screen = await render(
    <BlogCard blog={MOCK_BLOG} isOwner={true} onLike={vi.fn()} onDelete={onDelete} />,
  );

  await screen.getByRole("button", { name: /view/i }).click();

  const shouldDeleteConfirmation = vi.spyOn(window, "confirm").mockImplementation(() => false);
  await screen.getByRole("button", { name: /delete/i }).click();

  expect(shouldDeleteConfirmation).toHaveBeenCalledWith(
    `Remove blog "${MOCK_BLOG.title}" by "${MOCK_BLOG.author}"?`,
  );
  expect(onDelete).toHaveBeenCalledTimes(0);
});

test("updates aria-expanded attributes correctly", async () => {
  const screen = await render(
    <BlogCard blog={MOCK_BLOG} isOwner={true} onLike={vi.fn()} onDelete={vi.fn()} />,
  );

  const viewButton = screen.getByRole("button", { name: /view/i });
  await expect.element(viewButton).toHaveAttribute("aria-expanded", "false");

  // Toggle to check if the "Hide" button has the correct aria attributes
  await viewButton.click();

  const hideButton = screen.getByRole("button", { name: /hide/i });
  await expect.element(hideButton).toHaveAttribute("aria-expanded", "true");
});

test("aria-controls matches the content ID", async () => {
  const screen = await render(
    <BlogCard blog={MOCK_BLOG} isOwner={true} onLike={vi.fn()} onDelete={vi.fn()} />,
  );

  const viewButton = screen.getByRole("button", { name: /view/i });
  const contentId = viewButton.element().getAttribute("aria-controls");

  const contentContainer = document.getElementById(contentId);
  expect(contentContainer).not.toBeNull();
  await expect.element(contentContainer).not.toBeVisible();

  // Toggle to reveal the "Hide" button
  await viewButton.click();

  const hideButton = screen.getByRole("button", { name: /hide/i });
  await expect.element(hideButton).toHaveAttribute("aria-controls", contentId);
});
