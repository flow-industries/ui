import { expect, test } from "@playwright/test";
import { hashes, openShowcase, themes } from "./showcase";

for (const hash of hashes) {
  for (const theme of themes) {
    test(`${hash} page in ${theme} theme`, async ({ page }) => {
      await openShowcase(page, hash, theme);
      await expect(page).toHaveScreenshot(`${hash}-${theme}.png`, {
        fullPage: true,
        animations: "disabled",
      });
    });
  }
}
