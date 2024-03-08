import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";
import "dotenv/config";

const config: PlaywrightTestConfig = {
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PW_BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command: "npm run serve",
    url: process.env.PW_BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
