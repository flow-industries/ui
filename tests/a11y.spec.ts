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
const knownViolations: { id: string; ticket: string }[] = [
  // Token-level contrast failures (brand/success buttons, muted-foreground);
  // fixing them is a palette decision, not a showcase change.
  { id: "color-contrast", ticket: "UI-32" },
];

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
});
