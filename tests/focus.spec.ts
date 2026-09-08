import { expect, test } from "@playwright/test";
import type { FocusShowcase } from "../app/FocusShowcase";

export type FocusFixture = typeof FocusShowcase;

test.beforeEach(async ({ page }) => {
  await page.goto("/#focus");
});

test("keyboard selection, pause, reload recovery and finish", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Choose what to Practice" }).click();
  const search = page.getByRole("combobox");
  await expect(search).toBeFocused();
  await search.fill("Chinese");
  await search.press("Enter");
  await expect(page.locator('[data-focus-view="running"]')).toContainText(
    "Alice's Chinese",
  );
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const elapsed = await page.locator("[data-focus-elapsed]").textContent();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await expect(page.locator("[data-focus-elapsed]")).toHaveText(elapsed ?? "");
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.locator('[data-focus-view="finished"]')).toBeVisible();
});

test("account changes discard delayed private subjects and guest stays inert", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Slow responses" }).click();
  await page.getByRole("button", { name: "Choose what to Practice" }).click();
  await page.getByRole("button", { name: "Switch account" }).click();
  await page.getByRole("button", { name: "Choose what to Practice" }).click();
  await expect(
    page.getByRole("option", { name: /Bob's Chinese/ }),
  ).toBeVisible();
  await expect(page.locator("[data-study-picker]")).not.toContainText("Alice");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.locator("[data-study-picker]")).toHaveCount(0);
  await expect(page.locator("[data-focus-view]")).not.toContainText("Bob");
});

test("mutation failure retains session and retry succeeds", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Start Meditation" }).click();
  await page.getByRole("button", { name: "Simulate errors" }).click();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(
    page.locator('[data-focus-view="running"] [role="status"]'),
  ).toBeVisible();
  await page.getByRole("button", { name: "Simulate errors" }).click();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await expect(page.locator('[data-focus-view="finished"]')).toBeVisible();
});
