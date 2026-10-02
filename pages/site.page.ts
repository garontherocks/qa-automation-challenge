import { expect, type Page } from '@playwright/test';

export class SitePage {
  constructor(protected readonly page: Page) {}

  async openHome(): Promise<void> {
    await this.page.goto('/');
    await this.expectHome();
  }

  async expectHome(): Promise<void> {
    await expect(this.page).toHaveURL(/automationexercise\.com\/?$/);
    await expect(this.page.getByText('Full-Fledged practice website for Automation Engineers').first()).toBeVisible();
  }

  async goTo(path: 'Products' | 'Cart' | 'Signup / Login' | 'Contact us' | 'Test Cases'): Promise<void> {
    const href = {
      Products: '/products', Cart: '/view_cart', 'Signup / Login': '/login',
      'Contact us': '/contact_us', 'Test Cases': '/test_cases',
    }[path];
    await this.page.locator(`header a[href="${href}"]`).click();
  }

  async expectLoggedInAs(name: string): Promise<void> {
    await expect(this.page.getByText('Logged in as').locator('b')).toHaveText(name);
  }

  async deleteAccountThroughUi(): Promise<void> {
    await this.page.getByRole('link', { name: 'Delete Account' }).click();
    await expect(this.page.getByText('Account Deleted!', { exact: true })).toBeVisible();
    await this.page.getByRole('link', { name: 'Continue' }).click();
  }

  async subscribe(email: string): Promise<void> {
    const heading = this.page.getByRole('heading', { name: 'Subscription' });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    await this.page.getByPlaceholder('Your email address').fill(email);
    await this.page.locator('#subscribe').click();
    await expect(this.page.getByText('You have been successfully subscribed!')).toBeVisible();
  }
}
