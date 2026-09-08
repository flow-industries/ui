import { expect, test } from "@playwright/test";

test("heading level overrides size without changing its style", async ({
  page,
}) => {
  await page.goto("/#design");
  const heading = page.getByRole("heading", {
    name: "Large section heading",
    exact: true,
  });
  await expect(heading).toHaveJSProperty("tagName", "H2");
  const defaultHeading = page.getByRole("heading", {
    name: "@flow-industries/ui",
    exact: true,
  });
  await expect(defaultHeading).toHaveJSProperty("tagName", "H1");
  const fontSize = await defaultHeading.evaluate(
    (element) => getComputedStyle(element).fontSize,
  );
  await expect(heading).toHaveCSS("font-size", fontSize);
});

test("relative and calendar times expose exact timestamps", async ({
  page,
}) => {
  await page.goto("/#components");
  for (const slot of ["time-elapsed", "time-since"]) {
    const times = page.locator(`[data-slot="${slot}"]`);
    await expect(times.first()).toBeVisible();
    for (const time of await times.all()) {
      await expect(time).toHaveJSProperty("tagName", "TIME");
      const iso = await time.getAttribute("datetime");
      expect(iso).toBeTruthy();
      expect(Number.isNaN(Date.parse(iso ?? ""))).toBe(false);
      await expect(time.locator(".sr-only")).toHaveText(/\d{4}/);
      await expect(time).toHaveAttribute(
        "title",
        (await time.locator(".sr-only").textContent()) ?? "",
      );
    }
  }
});
