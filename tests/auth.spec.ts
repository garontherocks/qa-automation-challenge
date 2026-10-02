import { AuthPage } from '../pages/auth.page';
import { SitePage } from '../pages/site.page';
import { createUser } from '../support/data-factory';
import { expect, test } from '../support/test';

test.describe('Authentication and account lifecycle', () => {
  test('TC01 - Register User', async ({ page, trackAccount }) => {
    const user = createUser('tc01'); trackAccount(user);
    const site = new SitePage(page); const auth = new AuthPage(page);
    await site.openHome(); await auth.register(user); await site.deleteAccountThroughUi();
  });

  test('TC02 - Login User with correct email and password', async ({ page, accountApi, trackAccount }) => {
    const user = createUser('tc02'); trackAccount(user); await accountApi.create(user);
    const site = new SitePage(page); const auth = new AuthPage(page);
    await site.openHome(); await site.goTo('Signup / Login'); await auth.expectAuthPage();
    await auth.login(user.email, user.password); await site.expectLoggedInAs(user.name);
    await site.deleteAccountThroughUi();
  });

  test('TC03 - Login User with incorrect email and password', async ({ page }) => {
    const site = new SitePage(page); const auth = new AuthPage(page);
    await site.openHome(); await site.goTo('Signup / Login'); await auth.expectAuthPage();
    await auth.login(`missing.${Date.now()}@example.com`, 'wrong-password');
    await expect(page.getByText('Your email or password is incorrect!')).toBeVisible();
  });

  test('TC04 - Logout User', async ({ page, accountApi, trackAccount }) => {
    const user = createUser('tc04'); trackAccount(user); await accountApi.create(user);
    const site = new SitePage(page); const auth = new AuthPage(page);
    await site.openHome(); await site.goTo('Signup / Login'); await auth.login(user.email, user.password);
    await site.expectLoggedInAs(user.name); await page.getByRole('link', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/); await auth.expectAuthPage();
  });

  test('TC05 - Register User with existing email', async ({ page, accountApi, trackAccount }) => {
    const user = createUser('tc05'); trackAccount(user); await accountApi.create(user);
    const site = new SitePage(page); const auth = new AuthPage(page);
    await site.openHome(); await site.goTo('Signup / Login');
    await auth.submitSignupIdentity(user.name, user.email);
    await expect(page.getByText('Email Address already exist!')).toBeVisible();
  });
});
