/* eslint-disable no-await-in-loop -- Navigation assertions must run sequentially. */

import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { gotoReady } from "./lib/page";
import { HOME, isPhone, NAV_PATHS } from "./lib/routes";
import { expectStableViewport } from "./lib/viewport";

const openMobileSheet = async (page: Page) => {
  const trigger = page.locator('[data-slot="sheet-trigger"]');
  await expect(trigger).toBeVisible();

  // WebKit can miss the first click before hydration finishes.
  await expect(async () => {
    if ((await trigger.getAttribute("aria-expanded")) === "true") {
      return;
    }
    await trigger.click({ force: true });
    await expect(trigger).toHaveAttribute("aria-expanded", "true", {
      timeout: 750,
    });
  }).toPass({ timeout: 15_000 });

  const sheet = page.getByRole("dialog");
  await expect(sheet).toBeVisible();
  return { sheet, trigger };
};

test.describe("navigation", () => {
  test("desktop nav", async ({ page }, testInfo) => {
    test.skip(isPhone(testInfo.project.name), "phones use the sheet");

    await gotoReady(page, HOME);

    for (const path of NAV_PATHS) {
      await page.locator(`header a[href="${path}"]`).first().click();
      await expect(page).toHaveURL(new RegExp(`${path}/?$`, "u"));
      await expect(page.locator("main")).toBeVisible();
      await expectStableViewport(page);
    }
  });

  test("mobile sheet", async ({ page }, testInfo) => {
    test.skip(!isPhone(testInfo.project.name), "phones only");

    await gotoReady(page, HOME);

    const { trigger, sheet } = await openMobileSheet(page);
    // SheetClose + Link exposes as a button in the a11y tree.
    await sheet.getByRole("button", { exact: true, name: "About" }).click();
    await expect(page).toHaveURL(/\/about\/?$/u);
    await expectStableViewport(page);

    await openMobileSheet(page);
    await page
      .getByRole("dialog")
      .getByRole("button", { exact: true, name: "Work" })
      .click();
    await expect(page).toHaveURL(/\/work\/?$/u);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expectStableViewport(page);
  });

  test("theme toggle", async ({ page }) => {
    await gotoReady(page, HOME);
    await page.getByRole("button", { name: /toggle theme/iu }).click();
    await expect(page.locator("main")).toBeVisible();
    await expectStableViewport(page);
  });
});
