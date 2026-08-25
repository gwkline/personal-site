import { expect, test } from "@playwright/test";

import { gotoReady } from "./lib/page";
import { SITE_PAGES } from "./lib/routes";

const PIN_PROJECTS = new Set(["Desktop Chrome", "iPhone 16"]);

const PINNED_IDS = new Set([
  "home",
  "about",
  "work-index",
  "work-govdash-capture-cloud",
  "posts-index",
  "post-01-hello-world",
  "playground",
  "75-hard",
]);

/** Data-driven or animated regions hidden so baselines pin only stable layout.
 * display:none, not visibility:hidden, so their height cannot shift the
 * footer-anchored bottom shots when data arrives late. */
const ALWAYS_HIDDEN = [
  '[data-testid="dithered-landscape"]',
  '[data-testid="github-activity"]',
  '[data-testid="live-stats-nav"]',
  '[data-testid="comments-thread"]',
  '[data-testid="marathon-runner"]',
  '[data-testid="tracker-stats"]',
  '[data-testid="post-comment-count"]',
  'button[class^="go"]',
  "aside",
];

for (const sitePage of SITE_PAGES) {
  test(`${sitePage.id} @ ${sitePage.path}`, async ({ page }) => {
    test.skip(!PIN_PROJECTS.has(test.info().project.name), `not a pin project`);
    test.skip(
      !PINNED_IDS.has(sitePage.id),
      `${sitePage.id} is not visually pinned`
    );
    await gotoReady(page, sitePage);
    await page.waitForLoadState("load").catch(() => {});
    await page
      .waitForLoadState("networkidle", { timeout: 2500 })
      .catch(() => {});

    await page.addStyleTag({
      content: `${ALWAYS_HIDDEN.join(", ")} { display: none !important; }\nhtml { scroll-behavior: auto !important; }`,
    });

    await page.evaluate(() =>
      Promise.all([
        document.fonts.ready,
        ...[...document.images]
          .filter((img) => !img.complete)
          .map((img) => img.decode().catch(() => {})),
      ])
    );
    // Let hydration and the injected style settle before measuring.
    await page.waitForTimeout(1000);

    const scroll = page.locator("#app-scroll-container");
    const shot = (name: string) =>
      expect(page).toHaveScreenshot(`${sitePage.id}-${name}.png`, {
        animations: "disabled",
        fullPage: false,
        // Measured sub-pixel floor: the worst shot drifts ~900 pixels of
        // text-edge noise between dev-server sessions. 1500 covers that
        // with headroom while a real component-size regression still trips.
        maxDiffPixels: 1500,
      });

    await shot("top");

    const { scrollHeight, clientHeight } = await scroll.evaluate((el) => ({
      clientHeight: el.clientHeight,
      scrollHeight: el.scrollHeight,
    }));
    if (scrollHeight > clientHeight + 200) {
      // Anchor to the footer so data-driven height changes above cannot
      // reframe the shot.
      await page.evaluate(() =>
        document
          .querySelector("footer")
          ?.scrollIntoView({ behavior: "instant", block: "end" })
      );
      await page.waitForTimeout(500);
      await shot("bottom");
    }
  });
}
