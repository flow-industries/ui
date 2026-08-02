import type { Page } from "@playwright/test";

export const hashes = ["design", "showcases", "components"] as const;
export const themes = ["light", "dark"] as const;

export type ShowcaseHash = (typeof hashes)[number];
export type ShowcaseTheme = (typeof themes)[number];

const FIXED_TIME = new Date("2026-01-01T12:00:00Z");

export async function openShowcase(
  page: Page,
  hash: ShowcaseHash,
  theme: ShowcaseTheme,
) {
  await page.clock.setFixedTime(FIXED_TIME);
  await page.goto(`/#${hash}`, { waitUntil: "networkidle" });
  if (theme === "dark") {
    await page.evaluate(() => document.documentElement.classList.add("dark"));
  }
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );
}
