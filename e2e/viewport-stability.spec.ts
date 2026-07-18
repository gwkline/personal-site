import { expect, test } from "@playwright/test";

import { gotoReady } from "./lib/page";
import { HOME, isMobile } from "./lib/routes";
import {
  expectStableViewport,
  readViewport,
  scrollAppBy,
  scrollAppToTop,
} from "./lib/viewport";

test.describe("mobile viewport", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(!isMobile(testInfo.project.name), "mobile / tablet only");
  });

  test("scroll and tap stay unshifted", async ({ page }) => {
    await gotoReady(page, HOME);
    await expectStableViewport(page);

    await scrollAppBy(page, 600);
    await expectStableViewport(page);

    await page.locator("#app-scroll-container").click({
      force: true,
      position: { x: 12, y: 96 },
    });
    await expectStableViewport(page);

    await scrollAppToTop(page);
    await expectStableViewport(page);
  });

  test("nested container is the scroll root", async ({ page }) => {
    await gotoReady(page, HOME);

    const before = await readViewport(page);
    expect(before.scroll).not.toBeNull();

    await scrollAppBy(page, 250);
    const after = await readViewport(page);
    expect(after.scroll?.top ?? 0).toBeGreaterThan(0);

    const windowScroll = await page.evaluate(() => ({
      body: document.body.scrollTop,
      doc: document.documentElement.scrollTop,
    }));
    expect(windowScroll.body).toBe(0);
    expect(windowScroll.doc).toBe(0);
  });
});
