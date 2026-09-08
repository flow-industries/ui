import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";

const script = execFileSync(
  "bun",
  ["build", "tests/focus-provider.fixture.tsx", "--target", "browser"],
  { encoding: "utf8", maxBuffer: 5_000_000 },
);

test.beforeEach(async ({ page }) => {
  await page.route("**/provider-fixture", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<div id="root"></div><script type="module" src="/provider-fixture.js"></script>',
    }),
  );
  await page.route("**/provider-fixture.js", (route) =>
    route.fulfill({ contentType: "text/javascript", body: script }),
  );
});

test("child mount loads study and account change discards delayed old subjects", async ({
  page,
}) => {
  await page.goto("/provider-fixture");
  await expect(page.locator("output")).toContainText('"name":"Alice"');
  await page.reload();
  await page.getByRole("button", { name: "Switch" }).click();
  await expect(page.locator("output")).toContainText('"name":"Bob"');
  await page.waitForTimeout(350);
  await expect(page.locator("output")).not.toContainText('"name":"Alice"');
});

for (const failure of ["catalog", "subjects"]) {
  test(`preserves successful data when ${failure} fails and recovers`, async ({
    page,
  }) => {
    await page.addInitScript(
      (value) => localStorage.setItem("failure", value),
      failure,
    );
    await page.goto("/provider-fixture");
    await expect(page.locator("output")).toContainText('"failed":true');
    await expect(page.locator("output")).toContainText(
      failure === "catalog" ? '"name":"Alice"' : '"label":"Languages"',
    );
    await page.evaluate(() => localStorage.removeItem("failure"));
    await page.getByRole("button", { name: "Retry" }).click();
    await expect(page.locator("output")).toContainText('"failed":false');
    await expect(page.locator("output")).toContainText('"name":"Alice"');
    await expect(page.locator("output")).toContainText('"label":"Languages"');
  });
}
