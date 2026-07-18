import { defineConfig, devices } from "@playwright/test";

const iPhone16 = devices["iPhone 16"];

/** Core cross-section. Set PLAYWRIGHT_FULL_MATRIX=1 for the expanded set. */
const core = [
  { name: "Desktop Chrome", use: { ...devices["Desktop Chrome"] } },
  { name: "Desktop Safari", use: { ...devices["Desktop Safari"] } },
  { name: "iPhone 16", use: { ...iPhone16 } },
  {
    name: "iPhone 16 · bottom chrome",
    use: {
      ...iPhone16,
      // Approximate Safari bottom search bar eating viewport height.
      viewport: {
        height: Math.max(500, iPhone16.viewport.height - 56),
        width: iPhone16.viewport.width,
      },
    },
  },
  { name: "Pixel 9", use: { ...devices["Pixel 9"] } },
  { name: "iPad Pro 11", use: { ...devices["iPad Pro 11"] } },
];

const full = [
  ...core,
  { name: "Desktop Firefox", use: { ...devices["Desktop Firefox"] } },
  { name: "iPhone SE", use: { ...devices["iPhone SE"] } },
  { name: "iPhone 16 Pro Max", use: { ...devices["iPhone 16 Pro Max"] } },
  { name: "iPhone 16 landscape", use: { ...devices["iPhone 16 landscape"] } },
  { name: "Galaxy S24", use: { ...devices["Galaxy S24"] } },
  { name: "Pixel 9 landscape", use: { ...devices["Pixel 9 landscape"] } },
];

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: true,
  projects: process.env.PLAYWRIGHT_FULL_MATRIX === "1" ? full : core,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "on-failure" }]],
  retries: process.env.CI ? 2 : 0,
  testDir: "./e2e",
  timeout: 45_000,
  use: {
    baseURL,
    colorScheme: "dark",
    locale: "en-US",
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    timezoneId: "America/New_York",
    trace: "on-first-retry",
    video: "off",
  },
  webServer: {
    command:
      process.env.PW_WEB_SERVER_COMMAND ??
      "bunx --bun vp dev --port 3000 --host 127.0.0.1",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    url: baseURL,
  },
  workers: process.env.CI ? 2 : undefined,
});
