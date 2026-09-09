import { expect, test } from "@playwright/test";

test("installed SSR markup hydrates with styles and keyboard controls", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const failed: string[] = [];
  page.on("requestfailed", (request) => failed.push(request.url()));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Installed package consumer" }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Name")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Room")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Joined 0" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Joined 1" })).toBeVisible();
  const styles = await page.getByRole("button").evaluate((button) => ({
    height: button.getBoundingClientRect().height,
    background: getComputedStyle(button).backgroundColor,
    focus: getComputedStyle(document.documentElement).getPropertyValue(
      "--focus",
    ),
  }));
  expect(styles.height).toBeGreaterThan(30);
  expect(styles.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(styles.focus.trim()).not.toBe("");
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});
