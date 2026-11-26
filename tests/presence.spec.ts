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
      for (const size of ["sm", "md", "lg"]) {
        const row = showcase.locator(`[data-presence-size="${size}"]`);
        const signatures: string[] = [];
        for (const status of [
          "Online",
          "Idle",
          "Busy",
          "Invisible",
          "Offline",
        ]) {
          const ring = row.getByRole("img", { name: status, exact: true });
          await expect(ring).toBeVisible();
          const geometry = await ring.evaluate((element) => {
            const avatar = element.parentElement?.getBoundingClientRect();
            const box = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            const photo = element.parentElement
              ? getComputedStyle(element.parentElement).filter
              : "";
            return {
              grow: avatar ? box.width - avatar.width : 0,
              concentric: avatar
                ? Math.abs(
                    box.x + box.width / 2 - (avatar.x + avatar.width / 2),
                  ) < 0.5 &&
                  Math.abs(
                    box.y + box.height / 2 - (avatar.y + avatar.height / 2),
                  ) < 0.5
                : false,
              signature: [
                style.borderTopStyle,
                style.borderTopColor === "rgba(0, 0, 0, 0)" ? "none" : "ring",
                style.maskImage === "none" ? "closed" : "open",
                element.children.length > 0 ? "cut" : "whole",
                photo.includes("grayscale") ? "grey" : "photo",
              ].join(" "),
            };
          });
          expect(geometry.grow).toBe(8);
          expect(geometry.concentric).toBe(true);
          signatures.push(geometry.signature);
        }
        expect(new Set(signatures).size).toBe(5);
      }
      const away = page.getByTestId("presence-away");
      await expect(
        away.getByRole("img", { name: "Idle for 12 minutes" }),
      ).toBeVisible();
      await expect(
        away.getByRole("img", { name: "Idle for 1 hour" }),
      ).toBeVisible();
      await expect(
        away.getByRole("img", { name: "Busy until 15:00" }),
      ).toBeVisible();
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
      await expect(unknown.locator('[data-slot="presence-ring"]')).toHaveCount(
        0,
      );
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
