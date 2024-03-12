import type { Page } from "@playwright/test";

interface BasePageProps {
  page: Page;
  route: string;
  selectors: { [key: string]: string };
}

class BasePage {
  readonly page: Page;
  protected route: string;
  selectors: { [key: string]: string };

  constructor({ page, route, selectors }: BasePageProps) {
    this.page = page;
    this.route = route;
    this.selectors = selectors;
  }

  async navigate() {
    await this.page.goto(this.route);
  }
}

export default BasePage;
