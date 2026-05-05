import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

import { Alert } from "./alert.jsx";

test("renders the message correctly", async () => {
  const message = "Note saved successfully!";

  const screen = await render(<Alert message={message} />);

  await expect.element(screen.getByText(message)).toBeVisible();
});

test("applies the correct variant as a data attribute", async () => {
  const screen = await render(<Alert variant="error" message="Something went wrong" />);

  const alert = screen.getByRole("status");

  await expect.element(alert).toHaveAttribute("data-variant", "error");

  await screen.rerender(<Alert variant="success" message="Fixed!" />);

  await expect.element(alert).toHaveAttribute("data-variant", "success");
});

test("has correct accessibility attributes for screen readers", async () => {
  const screen = await render(<Alert message="Update" />);

  const alert = screen.getByRole("status");

  await expect.element(alert).toHaveAttribute("role", "status");
  await expect.element(alert).toHaveAttribute("aria-atomic", "true");
});

test("renders with the correct CSS class", async () => {
  const screen = await render(<Alert message="Styled" />);

  const alert = screen.getByRole("status");

  expect(alert.element().classList.contains("alert")).toBe(true);
});
