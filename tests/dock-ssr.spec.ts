import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const script = execFileSync(
  "bun",
  ["build", "tests/dock-ssr.fixture.tsx", "--target", "browser"],
  { encoding: "utf8", maxBuffer: 5_000_000 },
);
const css = readFileSync("dist/index.html", "utf8").match(
  /href="([^"]+\.css)"/,
)?.[1];
const markup = execFileSync(
  "bun",
  [
    "-e",
    'import { renderToString } from "react-dom/server"; import { createElement } from "react"; import { DockFixture } from "./tests/dock-ssr.fixture"; process.stdout.write(renderToString(createElement(DockFixture)));',
  ],
  { encoding: "utf8" },
);
const html = `<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="${css}"><div id="root">${markup}</div><script type="module" src="/dock-ssr-fixture.js"></script>`;

test("a server-rendered Dock counts More and fits the phone bar at 320px", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 640 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(
    (url) => url.pathname === "/dock-ssr-fixture",
    (route) => route.fulfill({ contentType: "text/html", body: html }),
  );
  await page.route("**/dock-ssr-fixture.js", (route) =>
    route.fulfill({ contentType: "text/javascript", body: script }),
  );
  await page.goto("/dock-ssr-fixture");
  await page.evaluate(() => document.fonts.ready);
  const more = page.getByRole("button", { name: "More" });
  await expect(more).toBeVisible();
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  const fit = await page.evaluate(() => {
    const bar = document.querySelector('nav[data-slot="dock"]');
    const items = [
      ...(bar?.querySelectorAll(
        '[data-slot="dock-item"], [data-slot="dock-more"]',
      ) ?? []),
    ]
      .map((item) => item.getBoundingClientRect())
      .filter((rect) => rect.width > 0);
    return {
      left: Math.min(...items.map((rect) => rect.left)),
      right: Math.max(...items.map((rect) => rect.right)),
    };
  });
  expect(fit.left).toBeGreaterThanOrEqual(16);
  expect(
    await page
      .locator('nav[data-slot="dock"] [data-more]')
      .evaluate((label) => label.getBoundingClientRect().width),
  ).toBeGreaterThan(0);
  expect(fit.right).toBeLessThanOrEqual(304);
  expect(errors).toEqual([]);
  await context.close();
});
