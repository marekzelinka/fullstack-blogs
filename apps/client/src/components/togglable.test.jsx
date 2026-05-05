import { createRef } from "react";
import { test, expect } from "vitest";
import { render } from "vitest-browser-react";

import { Togglable } from "./togglable.jsx";

test("renders its children but keeps them hidden initially", async () => {
  const screen = await render(
    <Togglable>
      <div data-testid="content">togglable content</div>
    </Togglable>,
  );

  await expect.element(screen.getByTestId("content")).toBeInTheDocument();
  await expect.element(screen.getByText("togglable content")).not.toBeVisible();
});

test("renders without custom button labels", async () => {
  const screen = await render(
    <Togglable>
      <div>togglable content</div>
    </Togglable>,
  );

  const openButton = screen.getByText(/open/i);
  await expect.element(openButton).toBeInTheDocument();

  await openButton.click();

  expect(screen.getByText(/close/i)).toBeInTheDocument();
});

test("after clicking the toggle button, children are visible", async () => {
  const screen = await render(
    <Togglable openButtonLabel="show..." closeButtonLabel="hide...">
      <div>togglable content</div>
    </Togglable>,
  );

  await screen.getByRole("button", { name: /show/i }).click();

  await expect.element(screen.getByText("togglable content")).toBeVisible();
});

test("toggled content can be closed", async () => {
  const screen = await render(
    <Togglable openButtonLabel="show..." closeButtonLabel="hide...">
      <div>togglable content</div>
    </Togglable>,
  );

  await screen.getByRole("button", { name: /show/i }).click();
  await screen.getByRole("button", { name: /hide/i }).click();

  await expect.element(screen.getByText("togglable content")).not.toBeVisible();
});

test("allows programmatic toggling via ref", async () => {
  const togglableRef = createRef();

  const screen = await render(
    <Togglable ref={togglableRef}>
      <div>togglable content</div>
    </Togglable>,
  );

  await expect.element(screen.getByText("togglable content")).not.toBeVisible();

  togglableRef.current.toggleVisibility();

  await expect.element(screen.getByText("togglable content")).toBeVisible();

  togglableRef.current.toggleVisibility();

  await expect.element(screen.getByText("togglable content")).not.toBeVisible();
});

test("shows/hides toggle buttons based on state", async () => {
  const screen = await render(
    <Togglable openButtonLabel="show..." closeButtonLabel="hide...">
      <div>togglable content</div>
    </Togglable>,
  );

  await expect.element(screen.getByRole("button", { name: /hide/i })).not.toBeInTheDocument();
  await screen.getByRole("button", { name: /show/i }).click();
  await expect.element(screen.getByRole("button", { name: /show/i })).not.toBeInTheDocument();
});

test("updates aria-expanded attributes correctly", async () => {
  const screen = await render(
    <Togglable openButtonLabel="show..." closeButtonLabel="hide...">
      <div>togglable content</div>
    </Togglable>,
  );

  const showButton = screen.getByRole("button", { name: /show/i });
  await expect.element(showButton).toHaveAttribute("aria-expanded", "false");

  // Toggle to check if the "hide..." button has the correct aria attributes
  await showButton.click();

  const hideButton = screen.getByRole("button", { name: /hide/i });
  await expect.element(hideButton).toHaveAttribute("aria-expanded", "true");
});

test("aria-controls matches the content ID", async () => {
  const screen = await render(
    <Togglable openButtonLabel="show..." closeButtonLabel="hide...">
      <div>togglable content</div>
    </Togglable>,
  );

  const showButton = screen.getByRole("button", { name: /show/i });
  const contentId = showButton.element().getAttribute("aria-controls");

  const contentContainer = document.getElementById(contentId);
  expect(contentContainer).not.toBeNull();
  expect(contentContainer?.textContent).toContain("togglable content");

  // Toggle to reveal the "hide..." button
  await showButton.click();

  const hideButton = screen.getByRole("button", { name: /hide/i });
  await expect.element(hideButton).toHaveAttribute("aria-controls", contentId);
});
