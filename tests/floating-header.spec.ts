import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const script = execFileSync(
  "bun",
  ["build", "tests/floating-header.fixture.tsx", "--target", "browser"],
  { encoding: "utf8", maxBuffer: 5_000_000 },
);
const css = readFileSync("dist/index.html", "utf8").match(
  /href="([^"]+\.css)"/,
)?.[1];
const html = `<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="${css}"><div id="root"></div><script type="module" src="/floating-header-fixture.js"></script>`;

const LONG_NAME = "averyverylongusernameindeed";

for (const width of [320, 360, 390]) {
  for (const brand of ["Industries", "Time"]) {
    for (const user of ["fern", LONG_NAME, null]) {
      test(`${brand} with ${user ?? "Join"} at ${width}px keeps the brand clear`, async ({
        browser,
      }) => {
        const context = await browser.newContext({
          viewport: { width, height: 640 },
          hasTouch: true,
          isMobile: true,
        });
        const page = await context.newPage();
        await page.route(
          (url) => url.pathname === "/floating-header-fixture",
          (route) => route.fulfill({ contentType: "text/html", body: html }),
        );
        await page.route("**/floating-header-fixture.js", (route) =>
          route.fulfill({ contentType: "text/javascript", body: script }),
        );
        const query = new URLSearchParams({ brand });
        if (user) query.set("user", user);
        await page.goto(`/floating-header-fixture?${query}`);
        await page
          .locator('[data-slot="floating-header-end"] > *')
          .first()
          .waitFor();
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({
          path: test.info().outputPath(`row-${width}.png`),
        });

        const row = await page.evaluate(() => {
          const rect = (selector: string) =>
            document.querySelector(selector)?.getBoundingClientRect();
          const brand = rect('[data-slot="header-brand"]');
          const end = rect('[data-slot="floating-header-end"] > *');
          const ring = rect('[data-slot="presence-ring"]');
          const avatar = rect('[data-slot="avatar"]');
          const name = document.querySelector<HTMLElement>(
            '[data-slot="profile-pill-name"]',
          );
          return {
            brandRight: brand?.right ?? 0,
            endLeft: end?.left ?? 0,
            endRight: end?.right ?? 0,
            ringRight: ring?.right ?? null,
            avatarCentreY: avatar ? avatar.y + avatar.height / 2 : null,
            nameWidth: name?.getBoundingClientRect().width ?? null,
            nameClipped: name ? name.scrollWidth > name.clientWidth : null,
            overflow: document.documentElement.scrollWidth - window.innerWidth,
          };
        });

        expect(row.endLeft).toBeGreaterThanOrEqual(row.brandRight);
        expect(row.endRight).toBeLessThanOrEqual(width);
        expect(row.overflow).toBe(0);
        if (!user) return context.close();

        const pill = page.getByRole("button", { name: `${user} Online` });
        await expect(pill).toBeVisible();
        expect(row.ringRight).toBe(width - 16);
        expect(row.avatarCentreY).toBe(48);
        if (brand === "Time" && user === "fern") {
          expect(row.nameClipped).toBe(false);
        }
        if (brand === "Industries" && width === 320) {
          expect(row.nameWidth).toBeLessThanOrEqual(1);
        }
        // The name is whole, truncated to a few characters or more, or gone; never a sliver.
        const name = row.nameWidth ?? 0;
        expect(!row.nameClipped || name <= 1 || name >= 30).toBe(true);
        await context.close();
      });
    }
  }
}

for (const status of [true, false]) {
  test(`FlowFooter ${status ? "shows" : "leaves out"} the status line`, async ({
    page,
  }) => {
    const statusRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/v1/endpoints/statuses"))
        statusRequests.push(request.url());
    });
    await page.route(
      (url) => url.pathname === "/floating-header-fixture",
      (route) => route.fulfill({ contentType: "text/html", body: html }),
    );
    await page.route("**/floating-header-fixture.js", (route) =>
      route.fulfill({ contentType: "text/javascript", body: script }),
    );
    await page.route("**/api/v1/endpoints/statuses", (route) =>
      route.fulfill({
        json: [{ name: "probe", results: [{ success: true }] }],
      }),
    );
    await page.goto(
      `/floating-header-fixture?footer=${status ? "status" : "no-status"}`,
    );
    await expect(page.getByText(/Flow Industries/).first()).toBeVisible();
    await expect(page.locator('[data-slot="status-widget"]')).toHaveCount(
      status ? 1 : 0,
    );
    if (!status) expect(statusRequests).toEqual([]);
  });
}
