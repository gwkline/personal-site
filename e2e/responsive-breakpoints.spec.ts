import { expect, test } from "@playwright/test";

import { gotoReady } from "./lib/page";
import { RESPONSIVE_WIDTHS, SITE_PAGES } from "./lib/routes";
import { expectStableViewport } from "./lib/viewport";

test.describe("responsive widths", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "Desktop Chrome",
      "Desktop Chrome only"
    );
  });

  for (const sitePage of SITE_PAGES) {
    test(`${sitePage.id}`, async ({ page }) => {
      await gotoReady(page, sitePage);

      for (const width of RESPONSIVE_WIDTHS) {
        await page.setViewportSize({ height: 900, width });
        await expect(page.locator("main")).toBeVisible();
        await expectStableViewport(page, width < 820 ? 2 : 4);
      }
    });
  }
});
