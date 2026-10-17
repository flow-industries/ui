import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openShowcase } from "./showcase";

test.setTimeout(60_000);

for (const theme of ["light", "dark"] as const) {
  for (const width of [1280, 390]) {
    test(`presence is readable at ${width}px in ${theme}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("response", (response) => {
        if (
          new URL(response.url()).hostname === "localhost" &&
          response.status() >= 400
        ) {
          errors.push(`${response.status()} ${response.url()}`);
        }
      });
      await openShowcase(page, "components", theme);
      const showcase = page.getByTestId("presence-showcase");
      for (const size of ["sm", "default", "lg"]) {
        const row = showcase.locator(`[data-presence-size="${size}"]`);
        const glyphs: string[] = [];
        for (const status of [
          "Online",
          "Idle",
          "Busy",
          "Invisible",
          "Offline",
        ]) {
          const indicator = row.getByRole("img", { name: status, exact: true });
          await expect(indicator).toBeVisible();
          const glyph = indicator.locator("svg");
          await expect(glyph).toBeVisible();
          const box = await glyph.boundingBox();
          expect(box?.width).toBeGreaterThanOrEqual(14);
          glyphs.push(
            await glyph.evaluate(
              (svg) =>
                svg.innerHTML +
                (getComputedStyle(svg).fill === "none" ? "hollow" : "filled"),
            ),
          );
        }
        expect(new Set(glyphs).size).toBe(5);
      }
      const publicPill = showcase
        .locator('[data-slot="profile-pill"]')
        .filter({ hasText: "public-invisible" });
      await expect(
        publicPill.getByRole("img", { name: "Offline" }),
      ).toBeVisible();
      await expect(publicPill.locator('[data-status="invisible"]')).toHaveCount(
        0,
      );
      const unknown = showcase
        .locator('[data-slot="profile-pill"]')
        .filter({ hasText: "unknown" });
      await expect(
        unknown.locator('[data-slot="presence-indicator"]'),
      ).toHaveCount(0);
      await expect(unknown).not.toHaveAttribute("type");
      await expect(unknown).not.toHaveAttribute("tabindex");
      const trigger = page.getByRole("button", {
        name: "presence-trigger Online",
      });
      await trigger.focus();
      await page.keyboard.press("Enter");
      await expect(
        page.getByRole("menuitem", { name: "View profile" }),
      ).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
      await showcase.scrollIntoViewIfNeeded();
      await showcase.screenshot({
        path: testInfo.outputPath(`presence-${theme}-${width}.png`),
      });
      await testInfo.attach(`presence-${theme}-${width}`, {
        path: testInfo.outputPath(`presence-${theme}-${width}.png`),
        contentType: "image/png",
      });
      expect(
        await showcase.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      ).toBe(true);
      await page.evaluate(() => {
        document.documentElement.style.zoom = "2";
      });
      await expect(trigger).toBeVisible();
      expect(
        await showcase.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      ).toBe(true);
      await showcase.evaluate((element) =>
        element.scrollIntoView({ block: "start" }),
      );
      await page.screenshot({
        path: testInfo.outputPath(`presence-zoom-${theme}-${width}.png`),
      });
      await testInfo.attach(`presence-zoom-${theme}-${width}`, {
        path: testInfo.outputPath(`presence-zoom-${theme}-${width}.png`),
        contentType: "image/png",
      });
      const { violations } = await new AxeBuilder({ page })
        .include('[data-testid="presence-showcase"]')
        .analyze();
      expect(violations).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}
