import { test, vi, expect } from "vitest";
import { render } from "vitest-browser-react";

import { BlogList } from "./blog-list.jsx";

const MOCK_USER = { username: "root", name: "Admin User" };
const MOCK_BLOGS = [
  {
    id: "69f4d84da6568a97bd8d333a",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 4,
    owner: { username: "mzelinka", name: "Marek Zelinka" },
  },
  {
    id: "69ef04b887bad89639b19206",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    owner: MOCK_USER,
  },
];

test("renders all blogs in descending order of likes", async () => {
  const screen = await render(
    <BlogList blogs={MOCK_BLOGS} user={MOCK_USER} onLike={vi.fn()} onDelete={vi.fn()} />,
  );

  const items = screen.getByRole("list").getByRole("listitem");

  expect(items.all()).toHaveLength(MOCK_BLOGS.length);

  // The second blog in MOCK_BLOGS has more likes than the first one,
  // so it should come firts
  await expect.element(items.nth(0)).toHaveTextContent(MOCK_BLOGS[1].title);
  await expect.element(items.nth(1)).toHaveTextContent(MOCK_BLOGS[0].title);
});

test("handles empty blogs array", async () => {
  const screen = await render(
    <BlogList blogs={[]} user={MOCK_USER} onLike={vi.fn()} onDelete={vi.fn()} />,
  );

  const list = screen.getByRole("list");

  await expect.element(list).toBeEmptyDOMElement();
  await expect.element(list.getByRole("listitem")).toHaveLength(0);
  await expect.element(screen.getByText(MOCK_BLOGS[0].title)).not.toBeInTheDocument();
  await expect.element(screen.getByText(MOCK_BLOGS[1].title)).not.toBeInTheDocument();
});

test("uses correct list semantics for accessibility", async () => {
  const screen = await render(
    <BlogList blogs={MOCK_BLOGS} user={MOCK_USER} onLike={vi.fn()} onDelete={vi.fn()} />,
  );

  await expect.element(screen.getByRole("list")).toBeVisible();
  expect(screen.getByRole("listitem")).toHaveLength(2);
});

test("passes event handlers correctly to child BlogCard's when user is owner", async () => {
  const onLike = vi.fn();
  const onDelete = vi.fn();

  const screen = await render(
    <BlogList blogs={MOCK_BLOGS} user={MOCK_USER} onLike={onLike} onDelete={onDelete} />,
  );

  const items = screen.getByRole("list").getByRole("listitem");
  const firstItem = items.nth(0);

  await firstItem.getByRole("button", { name: /view/i }).click();

  // Click the toggle button inside the rendered BlogCard
  await firstItem.getByRole("button", { name: /like/i }).click();

  expect(onLike).toHaveBeenCalledWith(MOCK_BLOGS[1].id);

  // Click the delete button inside the rendered BlogCard
  vi.spyOn(window, "confirm").mockImplementation(() => true);
  await firstItem.getByRole("button", { name: /delete/i }).click();

  expect(onDelete).toHaveBeenCalledWith(MOCK_BLOGS[1].id);
});

test("only allows to delete blog when user is owner", async () => {
  const screen = await render(
    <BlogList blogs={MOCK_BLOGS} user={MOCK_USER} onLike={vi.fn()} onDelete={vi.fn()} />,
  );

  // Items are sorted by likes, so items[0] is owned by user
  const items = screen.getByRole("list").getByRole("listitem");

  const firstItem = items.nth(1);

  await firstItem.getByRole("button", { name: /view/i }).click();
  // screen.debug(firstItem);

  await expect.element(firstItem.getByRole("button", { name: /delete/i })).not.toBeInTheDocument();

  const ownedItem = items.nth(0);

  await ownedItem.getByRole("button", { name: /view/i }).click();

  await expect.element(ownedItem.getByRole("button", { name: /delete/i })).toBeVisible();
  expect(screen.getByRole("button", { name: /delete/i }).all()).toHaveLength(1);
});
