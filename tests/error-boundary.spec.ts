import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ErrorBoundary } from "../src/components/ui/error-boundary";
import { openShowcase, themes } from "./showcase";

for (const error of [
  null,
  undefined,
  "Render failed",
  new Error("Render failed"),
]) {
  test(`fallback receives a thrown ${String(error)}`, () => {
    let caught: unknown = Symbol("uncaught");
    const boundary = new ErrorBoundary({
      children: "Healthy child",
      fallback: ({ error }) => {
        caught = error;
        return "Recovered";
      },
    });

    boundary.state = ErrorBoundary.getDerivedStateFromError(error);

    expect(boundary.render()).toBe("Recovered");
    expect(caught).toBe(error);
  });
}

test("render errors focus the fallback and retry restores the child", async ({
  page,
}) => {
  await openShowcase(page, "components", "light");
  await page.getByRole("button", { name: "Throw render error" }).click();

  const fallback = page.locator('[data-slot="error-fallback"]').last();
  await expect(
    fallback.getByRole("heading", { name: "Something went wrong" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    fallback.getByRole("button", { name: "Try again" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(
    page.getByRole("button", { name: "Throw render error" }),
  ).toBeVisible();
  await expect(page.locator('[data-slot="error-fallback"]')).toHaveCount(1);
});

for (const theme of themes) {
  test(`error details keep readable text and a focus border in ${theme}`, async ({
    page,
  }) => {
    await openShowcase(page, "components", theme);
    const summary = page.locator('[data-slot="error-fallback"] summary');
    const unfocusedColor = await summary.evaluate(
      (element) => getComputedStyle(element).color,
    );
    const focusColor = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = "var(--focus)";
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });
    await summary.focus();

    await expect(summary).toBeFocused();
    await expect(summary).toHaveCSS("color", unfocusedColor);
    await expect(summary).toHaveCSS("border-top-width", "2px");
    await expect(summary).toHaveCSS("border-top-color", focusColor);

    const { violations } = await new AxeBuilder({ page })
      .include('[data-slot="error-fallback"] summary')
      .withRules(["color-contrast"])
      .analyze();
    expect(violations).toEqual([]);
  });
}
