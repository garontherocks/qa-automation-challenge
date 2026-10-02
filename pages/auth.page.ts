import { expect, type Page } from '@playwright/test';
import type { UserData } from '../support/types';
import { SitePage } from './site.page';

export class AuthPage extends SitePage {
  constructor(page: Page) { super(page); }

  async expectAuthPage(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'New User Signup!' })).toBeVisible();
  }

  async submitSignupIdentity(name: string, email: string): Promise<void> {
    const signup = this.page.locator('.signup-form');
    await signup.getByPlaceholder('Name').fill(name);
    await signup.getByPlaceholder('Email Address').fill(email);
    await signup.getByRole('button', { name: 'Signup' }).click();
  }

  async completeRegistration(user: UserData): Promise<void> {
    await expect(this.page.getByText('Enter Account Information', { exact: true })).toBeVisible();
    await this.page.getByLabel(user.title === 'Mr' ? 'Mr.' : 'Mrs.').check();
    await this.page.getByLabel('Password').fill(user.password);
    await this.page.locator('#days').selectOption(user.birthDay);
    await this.page.locator('#months').selectOption(user.birthMonth);
    await this.page.locator('#years').selectOption(user.birthYear);
    await this.page.getByLabel('Sign up for our newsletter!').check();
    await this.page.getByLabel('Receive special offers from our partners!').check();
    await this.page.getByLabel('First name').fill(user.firstName);
    await this.page.getByLabel('Last name').fill(user.lastName);
    await this.page.getByLabel('Company', { exact: true }).fill(user.company);
    await this.page.locator('#address1').fill(user.address1);
    await this.page.locator('#address2').fill(user.address2);
    await this.page.getByLabel('Country').selectOption(user.country);
    await this.page.locator('#state').fill(user.state);
    await this.page.locator('#city').fill(user.city);
    await this.page.locator('#zipcode').fill(user.zipcode);
    await this.page.locator('#mobile_number').fill(user.mobileNumber);
    await this.page.getByRole('button', { name: 'Create Account' }).click();
    await expect(this.page.getByText('Account Created!', { exact: true })).toBeVisible();
    await this.page.getByRole('link', { name: 'Continue' }).click();
    await this.expectLoggedInAs(user.name);
  }

  async register(user: UserData): Promise<void> {
    await this.goTo('Signup / Login');
    await this.expectAuthPage();
    await this.submitSignupIdentity(user.name, user.email);
    await this.completeRegistration(user);
  }

  async login(email: string, password: string): Promise<void> {
    const login = this.page.locator('.login-form');
    await login.getByPlaceholder('Email Address').fill(email);
    await login.getByPlaceholder('Password').fill(password);
    await login.getByRole('button', { name: 'Login' }).click();
  }
}
