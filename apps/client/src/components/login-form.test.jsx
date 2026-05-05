import { test, vi, expect } from "vitest";
import { render } from "vitest-browser-react";

import { LoginForm } from "./login-form.jsx";

test("calls event handler on submit", async () => {
  const testCredentials = { username: "testuser123", password: "tester123456" };
  const onSubmit = vi.fn(() => ({ success: true }));

  const screen = await render(<LoginForm onSubmit={onSubmit} />);

  await screen.getByLabelText(/username/i).fill(testCredentials.username);
  await screen.getByLabelText(/password/i).fill(testCredentials.password);

  await screen.getByRole("button", { name: /login/i }).click();

  expect(onSubmit).toHaveBeenCalled(testCredentials);
});

test("resets the form inputs on success", async () => {
  const testCredentials = { username: "testuser123", password: "tester123456" };
  const onSubmit = vi.fn(() => ({ success: true }));

  const screen = await render(<LoginForm onSubmit={onSubmit} />);

  const usernameInput = screen.getByLabelText(/username/i);
  await usernameInput.fill(testCredentials.username);
  const passwordInput = screen.getByLabelText(/password/i);
  await passwordInput.fill(testCredentials.password);

  await screen.getByRole("button", { name: /login/i }).click();

  await expect.element(usernameInput).toHaveValue("");
  await expect.element(passwordInput).toHaveValue("");
});

test("does not reset the form inputs on success", async () => {
  const testCredentials = { username: "testuser123", password: "tester123456" };
  const onSubmit = vi.fn(() => ({ success: false }));

  const screen = await render(<LoginForm onSubmit={onSubmit} />);

  const usernameInput = screen.getByLabelText(/username/i);
  await usernameInput.fill(testCredentials.username);
  const passwordInput = screen.getByLabelText(/password/i);
  await passwordInput.fill(testCredentials.password);

  await screen.getByRole("button", { name: /login/i }).click();

  await expect.element(usernameInput).toHaveValue(testCredentials.username);
  await expect.element(passwordInput).toHaveValue(testCredentials.password);
});
