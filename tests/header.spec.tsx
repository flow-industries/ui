import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    headerSamples: number[][][];
  }
}

const script = execFileSync(
  "bun",
  ["build", "tests/header.fixture.tsx", "--target", "browser"],
  { encoding: "utf8", maxBuffer: 5_000_000 },
);
const css = readFileSync("dist/index.html", "utf8").match(
  /href="([^"]+\.css)"/,
)?.[1];
const html = `<link rel="stylesheet" href="${css}"><div id="root">${execFileSync("bun", ["-e", 'import { renderToString } from "react-dom/server"; import { createElement } from "react"; import { HeaderFixture } from "./tests/header.fixture"; process.stdout.write(renderToString(createElement(HeaderFixture)));'], { encoding: "utf8" })}</div><script type="module" src="/header-fixture.js"></script>`;

for (const width of [320, 390, 768, 1280]) {
  for (const touch of [false, true]) {
    test(`product geometry at ${width}px ${touch ? "coarse" : "fine"}`, async ({
      browser,
    }, testInfo) => {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        hasTouch: touch,
      });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript(() => {
        const target = window;
        target.headerSamples = [];
        function sample() {
          const headers = [...document.querySelectorAll("header")];
          if (
            headers.length === 6 &&
            headers[0]?.getBoundingClientRect().height === 96
          ) {
            target.headerSamples.push(
              headers.map((header) => {
                const rect = header
                  .querySelector('[data-slot="header-brand"]')
                  ?.firstElementChild?.getBoundingClientRect();
                return rect
                  ? [
                      rect.x,
                      rect.y,
                      rect.width,
                      rect.height,
                      header.getBoundingClientRect().height,
                    ]
                  : [];
              }),
            );
          }
          requestAnimationFrame(sample);
        }
        requestAnimationFrame(sample);
      });
      await page.route("**/header-fixture", (route) =>
        route.fulfill({ contentType: "text/html", body: html }),
      );
      await page.route("**/header-fixture.js", (route) =>
        route.fulfill({ contentType: "text/javascript", body: script }),
      );
      await page.route("**/api/users/*", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 350));
        await route.fulfill({
          json: {
            image: route.request().url().endsWith("long_account_name")
              ? "/failed-avatar.svg"
              : "/avatar.svg",
          },
        });
      });
      await page.route("**/avatar.svg", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 350));
        await route.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="36" height="36" fill="pink"/></svg>',
        });
      });
      await page.route("**/failed-avatar.svg", (route) =>
        route.fulfill({ status: 404, body: "missing" }),
      );
      await page.goto("/header-fixture");
      await page.evaluate(() => document.fonts.ready);
      const bounds = () =>
        page.locator("header").evaluateAll((headers) =>
          headers.map((header) => {
            const box = header.getBoundingClientRect();
            const brand = header.querySelector('[data-slot="header-brand"]');
            const icon = brand?.firstElementChild?.getBoundingClientRect();
            const text = brand?.lastElementChild;
            const actions = header
              .querySelector('[data-slot="header-actions"]')
              ?.getBoundingClientRect();
            return {
              x: icon?.x,
              y: icon ? icon.y - box.y : null,
              width: icon?.width,
              height: icon?.height,
              shell: box.height,
              label: header.getAttribute("aria-label"),
              font: text ? getComputedStyle(text).fontSize : null,
              actions: actions?.height,
              overflow: header.scrollWidth > box.width,
            };
          }),
        );
      const initial = await bounds();
      for (const box of initial)
        expect(box).toEqual({
          x: width >= 768 ? 32 : 16,
          y: 38,
          width: 20,
          height: 20,
          shell: width < 360 && box.label === "Industries" ? 160 : 96,
          label: box.label,
          font: "19.8px",
          actions: 48,
          overflow: false,
        });
      await expect(page.locator("header img").first()).toBeVisible();
      expect(await bounds()).toEqual(initial);
      await page
        .getByRole("button", { name: "Account menu for alice" })
        .first()
        .click();
      const failedAvatar = page.waitForResponse("**/failed-avatar.svg");
      await page.getByRole("menuitem", { name: /long_account_name/ }).click();
      await expect(
        page.getByRole("button", {
          name: "Account menu for long_account_name",
        }),
      ).toHaveCount(6);
      expect((await failedAvatar).status()).toBe(404);
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      expect(await bounds()).toEqual(initial);
      await page
        .getByRole("button", { name: "Signed out", exact: true })
        .click();
      expect(await bounds()).toEqual(initial);
      await page.getByRole("button", { name: "Restore", exact: true }).click();
      expect(await bounds()).toEqual(initial);
      const samples = await page.evaluate(() => window.headerSamples);
      expect(samples.length).toBeGreaterThan(2);
      for (const sample of samples) expect(sample).toEqual(samples[0]);
      expect(errors).toEqual([]);
      const screenshot = testInfo.outputPath("contract.png");
      await page.screenshot({ path: screenshot });
      await testInfo.attach("header geometry", {
        body: JSON.stringify({ initial, samples }),
        contentType: "application/json",
      });
      await testInfo.attach("header screenshot", {
        path: screenshot,
        contentType: "image/png",
      });
      await context.close();
    });
  }
}
