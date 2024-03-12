import { expect, type Page } from "@playwright/test";
import { routes } from "data/routes";
import { loginFixture } from "fixtures/login.fixture";
import BasePage from "./base.page";

class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
    this.route = routes.login;
    this.selectors = {
      title: "h1",
      useMetamaskButton: 'button[data-test="use-metamask-button"]',
      useWalletConnectButton: 'button[data-test="use-walletconnect-button"]',
      howToUseWalletButton: 'button[data-test="how-to-use-wallet-button"]',
    };
  }

  async verifyTitle() {
    const title = this.page.locator(this.selectors.title);

    await expect(title).toBeVisible();
    await expect(title).toHaveText(loginFixture.title);
  }

  async useWalletConnect() {
    const useWalletConnectButton = this.page.locator(
      this.selectors.useWalletConnect,
    );

    await useWalletConnectButton.click();
  }
}

export default LoginPage;
