import { SitePage } from '../pages/site.page';
import { expect, test } from '../support/test';

test.describe('Scrolling', () => {
  test.beforeEach(async ({ page }) => { await new SitePage(page).openHome(); });

  test('TC25 - Verify Scroll Up using Arrow button and Scroll Down functionality', async ({ page }) => {
    const subscription = page.getByRole('heading', { name: 'Subscription' });
    await subscription.scrollIntoViewIfNeeded(); await expect(subscription).toBeVisible();
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await page.locator('#scrollUp').click();
    const hero = page.getByText('Full-Fledged practice website for Automation Engineers').first();
    await expect(hero).toBeVisible(); await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(100);
  });

  test('TC26 - Verify Scroll Up without Arrow button and Scroll Down functionality', async ({ page }) => {
    const subscription = page.getByRole('heading', { name: 'Subscription' });
    await subscription.scrollIntoViewIfNeeded(); await expect(subscription).toBeVisible();
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await page.evaluate(() => scrollTo(0, 0));
    const hero = page.getByText('Full-Fledged practice website for Automation Engineers').first();
    await expect(hero).toBeVisible(); await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(100);
  });
});
