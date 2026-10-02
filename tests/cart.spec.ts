import { AccountFlow } from '../flows/account.flow';
import { CartPage } from '../pages/cart.page';
import { ProductDetailsPage } from '../pages/product-details.page';
import { ProductsPage } from '../pages/products.page';
import { SitePage } from '../pages/site.page';
import { createUser } from '../support/data-factory';
import { expect, test } from '../support/test';

test.describe('Cart behavior', () => {
  test.beforeEach(async ({ page }) => { await new SitePage(page).openHome(); });

  test('TC12 - Add Products in Cart', async ({ page }) => {
    const site = new SitePage(page); const products = new ProductsPage(page); const cart = new CartPage(page);
    await site.goTo('Products'); const first = await products.addProduct(0, 'continue'); const second = await products.addProduct(1, 'cart');
    await cart.expectDisplayed(); await cart.expectItems([first, second]);
  });

  test('TC13 - Verify Product quantity in Cart', async ({ page }) => {
    const products = new ProductsPage(page); await products.openProduct();
    const expected = await new ProductDetailsPage(page).addToCart(4);
    await new CartPage(page).expectItems([expected]);
  });

  test('TC17 - Remove Products From Cart', async ({ page }) => {
    const site = new SitePage(page); const products = new ProductsPage(page); const cart = new CartPage(page);
    await site.goTo('Products'); const first = await products.addProduct(0, 'continue'); const second = await products.addProduct(1, 'cart');
    await cart.expectItems([first, second]); await cart.remove(first.name); await cart.expectItems([second]);
  });

  test('TC20 - Search Products and Verify Cart After Login', async ({ page, accountApi, trackAccount }) => {
    const user = createUser('tc20'); trackAccount(user); await accountApi.create(user);
    const site = new SitePage(page); const products = new ProductsPage(page); const cart = new CartPage(page);
    await site.goTo('Products'); await products.search('Blue Top');
    const expected = await products.addProduct(0, 'cart'); await cart.expectItems([expected]);
    await new AccountFlow(page).login(user); await site.goTo('Cart'); await cart.expectItems([expected]);
  });

  test('TC22 - Add to cart from Recommended items', async ({ page }) => {
    const recommended = page.locator('#recommended-item-carousel');
    await recommended.scrollIntoViewIfNeeded(); await expect(page.getByRole('heading', { name: 'Recommended Items' })).toBeVisible();
    const activeProduct = recommended.locator('.active .single-products').first();
    const name = (await activeProduct.locator('p').innerText()).trim();
    const price = Number((await activeProduct.locator('h2').innerText()).replace(/[^0-9]/g, ''));
    await activeProduct.locator('a.add-to-cart').click();
    await page.locator('#cartModal').getByRole('link', { name: 'View Cart' }).click();
    await new CartPage(page).expectItems([{ name, unitPrice: price, quantity: 1, total: price }]);
  });
});
