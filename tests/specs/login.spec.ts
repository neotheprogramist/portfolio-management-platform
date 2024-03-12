import { test } from "@playwright/test";
import LoginPage from "pages/login.page";

test.describe('login page', () => {
  test("title is visible", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.verifyTitle();
  });
});
