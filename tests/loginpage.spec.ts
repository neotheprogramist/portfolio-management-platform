import { expect, test } from "@playwright/test";

test("login page header is visible", async ({ page }) => {
  await page.goto('/');

  const header = page.locator('h1');

  await expect(header).toBeVisible();
  await expect(header).toHaveText('Login to Emeth');
});
