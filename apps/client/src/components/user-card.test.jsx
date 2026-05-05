import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import { UserCard } from "./user-card.jsx";

const MOCK_USER = { username: "root", name: "Admin User" };

test("renders display name when user.name is provided", async () => {
  const screen = await render(<UserCard user={MOCK_USER} onLogout={vi.fn()} />);

  await expect.element(screen.getByText(`Logged in as ${MOCK_USER.name}`)).toBeVisible();
});

test("falls back to username when user.name is missing", async () => {
  const screen = await render(
    <UserCard user={{ ...MOCK_USER, name: undefined }} onLogout={vi.fn()} />,
  );

  await expect.element(screen.getByText(`Logged in as ${MOCK_USER.username}`)).toBeVisible();
});

test("calls onLogout when the button is clicked", async () => {
  const onLogout = vi.fn();

  const screen = await render(<UserCard user={MOCK_USER} onLogout={onLogout} />);

  await screen.getByRole("button", { name: /sign out/i }).click();

  expect(onLogout).toHaveBeenCalledTimes(1);
});
