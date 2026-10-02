import { ProductDetailsPage } from '../pages/product-details.page';
import { ProductsPage } from '../pages/products.page';
import { SitePage } from '../pages/site.page';
import { createUser } from '../support/data-factory';
import { expect, test } from '../support/test';

test.describe('Product discovery', () => {
  test.beforeEach(async ({ page }) => { await new SitePage(page).openHome(); });

  test('TC08 - Verify All Products and product detail page', async ({ page }) => {
    const site = new SitePage(page); const products = new ProductsPage(page);
    await site.goTo('Products'); await products.expectAllProducts(); await products.openProduct();
    await new ProductDetailsPage(page).expectCompleteDetails();
  });

  test('TC09 - Search Product', async ({ page }) => {
    const site = new SitePage(page); const products = new ProductsPage(page);
    await site.goTo('Products'); await products.expectAllProducts(); await products.search('Blue Top');
  });

  test('TC18 - View Category Products', async ({ page }) => {
    const categories = page.locator('.left-sidebar');
    await expect(categories.getByRole('heading', { name: 'Category' })).toBeVisible();
    await categories.locator('a[href="#Women"]').click();
    await categories.getByRole('link', { name: 'Dress' }).click();
    await expect(page.getByRole('heading', { name: 'Women - Dress Products' })).toBeVisible();
    await categories.locator('a[href="#Men"]').click();
    await categories.getByRole('link', { name: 'Tshirts' }).click();
    await expect(page.getByRole('heading', { name: 'Men - Tshirts Products' })).toBeVisible();
  });

  test('TC19 - View & Cart Brand Products', async ({ page }) => {
    const site = new SitePage(page); await site.goTo('Products');
    const brands = page.locator('.brands_products'); await expect(brands.getByRole('heading', { name: 'Brands' })).toBeVisible();
    await brands.getByRole('link', { name: /Polo/ }).click();
    await expect(page.getByRole('heading', { name: 'Brand - Polo Products' })).toBeVisible();
    await expect(page.locator('.features_items .product-image-wrapper').first()).toBeVisible();
    await brands.getByRole('link', { name: /H&M/ }).click();
    await expect(page.getByRole('heading', { name: 'Brand - H&M Products' })).toBeVisible();
    await expect(page.locator('.features_items .product-image-wrapper').first()).toBeVisible();
  });

  test('TC21 - Add review on product', async ({ page }) => {
    const user = createUser('tc21'); const site = new SitePage(page); const products = new ProductsPage(page);
    await site.goTo('Products'); await products.openProduct();
    await new ProductDetailsPage(page).submitReview(user.name, user.email, 'A useful and well-presented product.');
  });
});
