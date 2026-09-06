import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { hashes, openShowcase, themes } from "./showcase";

// False positives only — a genuine violation gets fixed or filed against UI-3,
// never allowlisted to make CI green. Every entry needs a reason.
const allowlistedRules: { id: string; reason: string }[] = [];

// Genuine violations that are already tracked in Plane. The gate fails on any
// serious/critical rule NOT listed here, so new regressions still break CI
// while a filed finding is being fixed. Remove the entry when its ticket
// closes. Caveat: while a rule is listed, additional instances of that same
// rule are masked too — keep this list short-lived.
const knownViolations: { id: string; ticket: string }[] = [];

async function expectNoSevereViolations(page: Page, include?: string) {
  let builder = new AxeBuilder({ page });
  if (include) {
    builder = builder.include(include);
  }
  const { violations } = await builder.analyze();
  const severe = violations.filter(
    (violation) =>
      (violation.impact === "serious" || violation.impact === "critical") &&
      !allowlistedRules.some((allowed) => allowed.id === violation.id) &&
      !knownViolations.some((known) => known.id === violation.id),
  );
  const report = severe.map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.map((node) => node.target.join(" ")),
  }));
  expect(report).toEqual([]);
}

for (const hash of hashes) {
  for (const theme of themes) {
    test(`axe: ${hash} page in ${theme} theme`, async ({ page }) => {
      await openShowcase(page, hash, theme);
      await expectNoSevereViolations(page);
    });
  }
}

// Overlays unmount their content while closed, so each gets opened and scanned
// scoped to its popup. Hover/right-click popups (tooltip, hover card, context
// menu, menubar, navigation menu) are out of scope for this pass.
const overlays = [
  { slot: "dialog-content", trigger: "Open Dialog" },
  { slot: "alert-dialog-content", trigger: "Delete Account" },
  { slot: "sheet-content", trigger: "Open Sheet" },
  { slot: "drawer-content", trigger: "Open Drawer" },
  { slot: "popover-content", trigger: "Open Popover" },
  { slot: "dropdown-menu-content", trigger: "Options" },
] as const;

for (const { slot, trigger } of overlays) {
  for (const theme of themes) {
    test(`axe: ${slot} open in ${theme} theme`, async ({ page }) => {
      await openShowcase(page, "components", theme);
      await page.getByRole("button", { name: trigger, exact: true }).click();
      const popup = page.locator(`[data-slot="${slot}"]`);
      await popup.waitFor({ state: "visible" });
      await popup.evaluate((element) =>
        Promise.all(
          element
            .getAnimations({ subtree: true })
            .map((animation) => animation.finished.catch(() => undefined)),
        ),
      );
      await expectNoSevereViolations(page, `[data-slot="${slot}"]`);
    });
  }
}

// UI-45: touch targets are a floor on coarse pointers only, so the assertion
// has to run under emulation — a fine-pointer run passes at any size.
const TOUCH_TARGET_MIN = 44;

test.describe("touch targets on a coarse pointer", () => {
  test.use({ hasTouch: true, isMobile: true });

  test("select trigger and options are at least 44px tall", async ({
    page,
  }) => {
    await openShowcase(page, "components", "light");
    expect(
      await page.evaluate(() => matchMedia("(pointer: coarse)").matches),
    ).toBe(true);

    const trigger = page.getByRole("combobox", { name: "Framework" });
    await trigger.scrollIntoViewIfNeeded();
    expect((await trigger.boundingBox())?.height).toBeGreaterThanOrEqual(
      TOUCH_TARGET_MIN,
    );

    await trigger.click();
    const options = page.locator('[data-slot="select-item"]');
    await options.first().waitFor({ state: "visible" });
    const heights = await options.evaluateAll((items) =>
      items.map((item) => item.getBoundingClientRect().height),
    );
    expect(heights.length).toBeGreaterThan(0);
    for (const height of heights) {
      expect(height).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
    }
  });

  // UI-46: the native control had no coarse-pointer floor at all, so a 40px
  // target — 28px at size="sm" — shipped to touch devices.
  test("native select is at least 44px tall at every size", async ({
    page,
  }) => {
    await openShowcase(page, "components", "light");

    for (const name of ["Theme", "Theme, compact", "Theme, tall"]) {
      const control = page.getByRole("combobox", { name, exact: true });
      await control.scrollIntoViewIfNeeded();
      expect((await control.boundingBox())?.height).toBeGreaterThanOrEqual(
        TOUCH_TARGET_MIN,
      );
    }
  });
});

// UI-46: NativeSelect used to route `className` to its wrapper, so a consumer
// height class sized a box nobody sees while the control kept its own height.
// The class list is not the assertion — only the measured control proves it.
test("a consumer height class sizes the native select control", async ({
  page,
}) => {
  await openShowcase(page, "components", "light");

  const control = page.getByRole("combobox", { name: "Theme, tall" });
  await control.scrollIntoViewIfNeeded();
  expect((await control.boundingBox())?.height).toBeCloseTo(44, 1);

  const unstyled = page.getByRole("combobox", { name: "Theme", exact: true });
  expect((await unstyled.boundingBox())?.height).toBeCloseTo(40, 1);
});

// UI-4: the config runs every test with reducedMotion "reduce", so the
// indicators below must already be at rest here. The base rule shortens every
// animation to 0.01ms only for consumers importing base.css; the utility class
// is what makes the component honour the preference on its own.
test.describe("reduced motion", () => {
  test("spinner and status dot do not animate", async ({ page }) => {
    await openShowcase(page, "components", "light");
    expect(
      await page.evaluate(
        () => matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    ).toBe(true);

    const animationNames = await page
      .locator(
        '[role="status"][aria-label="Loading"], [data-slot="status-widget"] .animate-ping',
      )
      .evaluateAll((nodes) =>
        nodes.map((node) => getComputedStyle(node).animationName),
      );
    expect(animationNames.length).toBeGreaterThan(0);
    for (const name of animationNames) {
      expect(name).toBe("none");
    }
  });
});
