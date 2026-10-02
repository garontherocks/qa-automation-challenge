import path from 'node:path';
import { ContactPage } from '../pages/contact.page';
import { SitePage } from '../pages/site.page';
import { createUser } from '../support/data-factory';
import { expect, test } from '../support/test';

test.describe('Content and common site features', () => {
  test('TC06 - Contact Us Form', async ({ page }) => {
    const site = new SitePage(page); const contact = new ContactPage(page); const user = createUser('tc06');
    await site.openHome(); await site.goTo('Contact us');
    await contact.submit({ name: user.name, email: user.email, subject: 'QA automation feedback', message: 'Contact flow verification.', file: path.resolve('test-data/contact-upload.txt') });
    await page.locator('#form-section').getByRole('link', { name: 'Home' }).click(); await site.expectHome();
  });

  test('TC07 - Verify Test Cases Page', async ({ page }) => {
    const site = new SitePage(page); await site.openHome(); await site.goTo('Test Cases');
    await expect(page).toHaveURL(/\/test_cases/); await expect(page.getByRole('heading', { name: 'Test Cases', exact: true })).toBeVisible();
  });

  test('TC10 - Verify Subscription in home page', async ({ page }) => {
    const site = new SitePage(page); await site.openHome(); await site.subscribe(createUser('tc10').email);
  });

  test('TC11 - Verify Subscription in Cart page', async ({ page }) => {
    const site = new SitePage(page); await site.openHome(); await site.goTo('Cart');
    await site.subscribe(createUser('tc11').email);
  });
});
