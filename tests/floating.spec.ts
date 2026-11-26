import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { openShowcase } from "./showcase";

test.setTimeout(60_000);

function box(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((element) => element.getBoundingClientRect().toJSON());
}

const mark =
  '[data-slot="floating-header-brand"] [data-slot="header-brand"] > :first-child';

for (const theme of ["light", "dark"] as const) {
  test(`top row and rail hold the family geometry at 1440px in ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openShowcase(page, "design", theme);

    const logo = await box(page, mark);
    expect(logo).toMatchObject({ x: 32, width: 20, height: 20 });
    expect(logo.y + logo.height / 2).toBe(48);
    expect((await box(page, "main")).y).toBe(96);

    const rail = await box(page, 'nav[data-slot="dock"]');
    expect(1440 - (rail.x + rail.width / 2)).toBe(48);

    const header = page.locator('[data-slot="floating-header"]');
    const fade = header.locator('[data-slot="floating-header-fade"]');
    await expect(fade).toHaveCSS("opacity", "0");
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(header).toHaveAttribute("data-scrolled", "");
    await expect(fade).toHaveCSS("opacity", "1");
    expect((await fade.boundingBox())?.height).toBe(104);
    const background = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(
      await header.evaluate((element) =>
        element.style.getPropertyValue("--flow-fade-color"),
      ),
    ).toBe(background);

    const { violations } = await new AxeBuilder({ page })
      .include('[data-slot="floating-header"]')
      .include('nav[data-slot="dock"]')
      .analyze();
    expect(violations).toEqual([]);
  });
}

test("the profile sits on the avatar line and the inset", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openShowcase(page, "components", "light");
  const frame = page.getByTestId("floating-header-demo");
  await frame.scrollIntoViewIfNeeded();
  const geometry = await frame.evaluate((element) => {
    const edge = Number.parseFloat(getComputedStyle(element).borderLeftWidth);
    const outer = element.getBoundingClientRect();
    const rect = (selector: string) =>
      element.querySelector(selector)?.getBoundingClientRect();
    const avatar = rect('[data-slot="avatar"]');
    const ring = rect('[data-slot="presence-ring"]');
    return {
      avatar: avatar ? [avatar.width, avatar.height] : null,
      avatarCentreY: avatar ? avatar.y + avatar.height / 2 - outer.y - edge : 0,
      avatarCentreFromRight: avatar
        ? outer.right - edge - (avatar.x + avatar.width / 2)
        : 0,
      ringFromRight: ring ? outer.right - edge - ring.right : 0,
    };
  });
  expect(geometry).toEqual({
    avatar: [24, 24],
    avatarCentreY: 48,
    avatarCentreFromRight: 48,
    ringFromRight: 32,
  });

  await page.getByRole("switch", { name: "Signed in" }).click();
  const signIn = frame.getByRole("button", { name: "Sign in" });
  const button = await signIn.boundingBox();
  const outer = await frame.boundingBox();
  expect(button && outer && button.y + button.height / 2 - outer.y - 2).toBe(
    48,
  );
});

test("the phone bar sits on the insets and overflows into More", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await openShowcase(page, "design", "light");

  const logo = await box(page, mark);
  expect(logo.x).toBe(16);
  expect(logo.y + logo.height / 2).toBe(48);
  const bar = await box(page, 'nav[data-slot="dock"]');
  expect(bar.x).toBe(16);
  expect(390 - bar.right).toBe(16);

  const dock = page.getByRole("navigation", { name: "Places and controls" });
  await expect(
    dock.getByRole("link", { name: "Design System" }),
  ).toHaveAttribute("aria-current", "page");
  for (const item of await dock
    .locator('[data-slot="dock-item"]:visible, [data-slot="dock-more"]')
    .all()) {
    const size = await item.boundingBox();
    expect(size?.height).toBeGreaterThanOrEqual(44);
    expect(size?.width).toBeGreaterThanOrEqual(44);
  }
  await expect(dock.getByRole("button", { name: "Dark mode" })).toBeHidden();

  await dock.getByRole("button", { name: "More" }).tap();
  const sheet = page.getByRole("menu");
  const toggle = sheet.getByRole("menuitemcheckbox", { name: /Dark mode/ });
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await expect(toggle).toContainText("Off");
  await toggle.tap();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await expect(toggle).toContainText("On");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(
    sheet.getByRole("menuitem", { name: /GitHub \(opens in a new tab\)/ }),
  ).toHaveAttribute("target", "_blank");

  await page.keyboard.press("Escape");
  await page.goto("/#components");
  const appDock = page.locator('nav[data-dock-layout="auto"]');
  await expect(appDock).toBeVisible();
  await page.getByRole("textbox").first().focus();
  await expect(appDock).toBeHidden();
  await context.close();
});

test("rail labels open on keyboard focus and long-press, and toggles stay distinct", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await openShowcase(page, "design", "light");
  const dock = page.getByRole("navigation", { name: "Places and controls" });
  const showcases = dock.getByRole("link", { name: "Showcases" });
  const label = showcases.locator('[data-slot="dock-label"]');

  await showcases.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(showcases).toBeFocused();
  await expect(label).toHaveCSS("opacity", "1");
  await page.keyboard.press("Tab");
  await expect(label).toHaveCSS("opacity", "0");

  const rail = await box(page, 'nav[data-slot="dock"]');
  expect(1024 - (rail.x + rail.width / 2)).toBe(48);
  expect((await showcases.boundingBox())?.width).toBe(44);

  const target = await showcases.boundingBox();
  if (!target) throw new Error("Showcases has no box");
  const point = {
    x: target.x + target.width / 2,
    y: target.y + target.height / 2,
  };
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point],
  });
  await expect(label).toHaveCSS("opacity", "1");
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(page).toHaveURL(/#design$/);

  const toggle = dock.getByRole("button", { name: "Dark mode" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  const fills = await dock
    .locator('[data-slot="dock-item"]')
    .evaluateAll((items) =>
      items.map((item) => getComputedStyle(item).backgroundColor),
    );
  expect(fills.filter((fill) => fill !== "rgba(0, 0, 0, 0)")).toHaveLength(1);
  await context.close();
});

test("the row returns to the page flow in short windows", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 480 });
  await openShowcase(page, "design", "light");
  await expect(page.locator('[data-slot="floating-header"]')).toHaveCSS(
    "position",
    "relative",
  );
  expect((await box(page, "main")).y).toBe(96);
  await page.evaluate(() => window.scrollTo(0, 400));
  expect((await box(page, '[data-slot="floating-header"]')).y).toBe(-400);
});
