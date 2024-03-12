import type { Page } from "@playwright/test";

class BasePage {
  readonly page: Page;
  protected route: string;
  selectors: { [key: string]: string };

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto(this.route);
  }
}

export default BasePage;
