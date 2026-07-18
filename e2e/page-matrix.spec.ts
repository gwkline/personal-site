import { test } from "@playwright/test";

import { expectHealthyPage } from "./lib/page";
import { SITE_PAGES } from "./lib/routes";

for (const sitePage of SITE_PAGES) {
  test(`${sitePage.id} @ ${sitePage.path}`, async ({ page }) => {
    await expectHealthyPage(page, sitePage);
  });
}
