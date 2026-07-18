import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import type { SitePage } from "./routes";
import {
  expectStableViewport,
  expectViewportAllowsZoom,
  scrollAppBy,
  scrollAppToTop,
} from "./viewport";

export const gotoReady = async (page: Page, sitePage: SitePage) => {
  const response = await page.goto(sitePage.path, {
    waitUntil: "domcontentloaded",
  });
  expect(response?.ok() || response?.status() === 304).toBeTruthy();
  await expect(page.locator(sitePage.ready).first()).toBeVisible();
};

export const expectPageShell = async (page: Page) => {
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /gavin kline/i }).first()
  ).toBeVisible();
  await expectViewportAllowsZoom(page);
};

/** Load, shell, viewport stable before/after scroll. */
export const expectHealthyPage = async (page: Page, sitePage: SitePage) => {
  await gotoReady(page, sitePage);
  await expectPageShell(page);
  await expectStableViewport(page);

  await scrollAppBy(page, 400);
  await expectStableViewport(page);
  await scrollAppToTop(page);
  await expectStableViewport(page);
};
