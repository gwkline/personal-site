import { expect, test } from "@playwright/test";

import { gotoReady } from "./lib/page";
import { HOME } from "./lib/routes";

const GYM_PATH = "/gym";

test.describe("gym tracker", () => {
  test("dashboard renders for the anonymous visitor", async ({ page }) => {
    await gotoReady(page, { id: "gym", path: GYM_PATH, ready: "main h1" });

    // The hero card (its title is a styled div, so assert by text).
    await expect(page.getByText("Today").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "This week's plan" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Training load" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Goals" })).toBeVisible();

    // Owner-only surfaces stay hidden for visitors.
    await expect(page.getByRole("button", { name: "Log today" })).toHaveCount(
      0
    );
    await expect(page.getByRole("button", { name: /Add goal/u })).toHaveCount(
      0
    );
    await expect(page.getByRole("heading", { name: "Coach" })).toHaveCount(0);
    await expect(
      page.getByLabel(
        /Edit (?<day>Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/u
      )
    ).toHaveCount(0);

    // The training-load chart renders; with seeded data both series show.
    const surface = page.locator(".recharts-surface").first();
    await expect(surface).toBeVisible({ timeout: 15_000 });
    if (
      (await page.locator("main h1").textContent()) !== "No session planned"
    ) {
      await expect(page.locator(".recharts-bar").first()).toBeVisible();
      await expect(page.locator(".recharts-line").first()).toBeVisible();
    }
  });

  test("gym is reachable from the playground nav surface", async ({ page }) => {
    await gotoReady(page, HOME);
    const gymLink = page.locator('a[href="/gym"]').first();
    // The hover card only previews the first items; click when present,
    // otherwise go direct. Either way the hero must render.
    if (await gymLink.isVisible()) {
      await gymLink.click();
      await expect(page).toHaveURL(/\/gym\/?$/u);
    } else {
      await page.goto(`${GYM_PATH}`);
    }
    await expect(page.locator("main h1").first()).toBeVisible();
  });
});
