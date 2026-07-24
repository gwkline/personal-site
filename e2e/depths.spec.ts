import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const openGame = async (page: Page) => {
  await page.goto("/depths", { waitUntil: "domcontentloaded" });
  const game = page.getByTestId("depths-game");
  await expect(game).toBeVisible();
  await page.getByRole("button", { name: "Begin descent" }).click();
  await expect(game).toHaveAttribute("data-phase", "Exploring", {
    timeout: 15_000,
  });
  return game;
};

test.describe("Depths", () => {
  test("starts, moves, pauses, and resumes", async ({ page }) => {
    const game = await openGame(page);
    const before = await game.getAttribute("data-player-x");

    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => game.evaluate((element) => element.dataset.playerX))
      .not.toBe(before);

    await page.getByRole("button", { name: "Pause run" }).click();
    await expect(game).toHaveAttribute("data-phase", "Paused");
    await page.getByRole("button", { name: "Return" }).click();
    await expect(game).toHaveAttribute("data-phase", "Exploring");
  });

  test("offers usable touch controls", async ({ page }) => {
    await page.setViewportSize({ height: 780, width: 390 });
    const game = await openGame(page);
    const before = await game.getAttribute("data-player-x");

    await page.getByRole("button", { name: "Move right" }).click();
    await expect
      .poll(() => game.evaluate((element) => element.dataset.playerX))
      .not.toBe(before);
    await expect(page.getByRole("button", { name: "Attack" })).toBeVisible();
  });

  test("reaches game over and accepts arcade initials", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "Desktop Chrome",
      "Long combat lifecycle runs once"
    );
    const game = await openGame(page);
    await page.locator("body").pressSequentially("dddddddddddd");
    await expect(game).toHaveAttribute("data-phase", "Fighting");
    await expect(game).toHaveAttribute("data-phase", "GameOver", {
      timeout: 30_000,
    });

    const initials = page.getByLabel("Leaderboard initials");
    await initials.fill("gkl");
    await expect(initials).toHaveValue("GKL");
    await expect(
      page.getByRole("button", { name: "Submit score" })
    ).toBeEnabled();
  });
});
