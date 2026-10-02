import type { Page } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { SitePage } from '../pages/site.page';
import type { UserData } from '../support/types';

export class AccountFlow {
  readonly auth: AuthPage;
  readonly site: SitePage;

  constructor(page: Page) {
    this.auth = new AuthPage(page);
    this.site = new SitePage(page);
  }

  async register(user: UserData): Promise<void> { await this.auth.register(user); }

  async login(user: UserData): Promise<void> {
    await this.site.goTo('Signup / Login');
    await this.auth.expectAuthPage();
    await this.auth.login(user.email, user.password);
    await this.site.expectLoggedInAs(user.name);
  }
}
