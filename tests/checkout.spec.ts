import { stat } from 'node:fs/promises';
import { AccountFlow } from '../flows/account.flow';
import { OrderFlow } from '../flows/order.flow';
import { AuthPage } from '../pages/auth.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { ProductsPage } from '../pages/products.page';
import { SitePage } from '../pages/site.page';
import { createUser, paymentData } from '../support/data-factory';
import { expect, test } from '../support/test';
import type { CartItem, UserData } from '../support/types';

async function addOrderProducts(site: SitePage, products: ProductsPage): Promise<CartItem[]> {
  await site.goTo('Products');
  const first = await products.addProduct(0, 'continue');
  const second = await products.addProduct(1, 'cart');
  return [first, second];
}

async function registerFromCheckout(page: import('@playwright/test').Page, user: UserData): Promise<void> {
  await page.locator('#checkoutModal').getByRole('link', { name: 'Register / Login' }).click();
  const auth = new AuthPage(page);
  await auth.submitSignupIdentity(user.name, user.email);
  await auth.completeRegistration(user);
}

test.describe('Checkout and orders', () => {
  test('TC14 - Place Order: Register while Checkout', async ({ page, trackAccount }) => {
    const user = createUser('tc14'); trackAccount(user);
    const site = new SitePage(page); const products = new ProductsPage(page); const cart = new CartPage(page);
    await site.openHome(); const items = await addOrderProducts(site, products); await cart.expectItems(items);
    await cart.proceedToCheckout(); await registerFromCheckout(page, user);
    await site.goTo('Cart'); await cart.proceedToCheckout();
    await new OrderFlow(page).verifyAndPlace(items, user, paymentData); await site.deleteAccountThroughUi();
  });

  test('TC15 - Place Order: Register before Checkout', async ({ page, trackAccount }) => {
    const user = createUser('tc15'); trackAccount(user);
    const site = new SitePage(page); const products = new ProductsPage(page); const cart = new CartPage(page);
    await site.openHome(); await new AccountFlow(page).register(user);
    const items = await addOrderProducts(site, products); await cart.expectItems(items); await cart.proceedToCheckout();
    await new OrderFlow(page).verifyAndPlace(items, user, paymentData); await site.deleteAccountThroughUi();
  });

  test('TC16 - Place Order: Login before Checkout', async ({ page, accountApi, trackAccount }) => {
    const user = createUser('tc16'); trackAccount(user); await accountApi.create(user);
    const site = new SitePage(page); const products = new ProductsPage(page); const cart = new CartPage(page);
    await site.openHome(); await new AccountFlow(page).login(user);
    const items = await addOrderProducts(site, products); await cart.expectItems(items); await cart.proceedToCheckout();
    await new OrderFlow(page).verifyAndPlace(items, user, paymentData); await site.deleteAccountThroughUi();
  });

  test('TC23 - Verify address details in checkout page', async ({ page, trackAccount }) => {
    const user = createUser('tc23'); trackAccount(user);
    const site = new SitePage(page); const products = new ProductsPage(page); const cart = new CartPage(page);
    await site.openHome(); await new AccountFlow(page).register(user);
    const items = await addOrderProducts(site, products); await cart.expectItems(items); await cart.proceedToCheckout();
    const checkout = new CheckoutPage(page); await checkout.expectAddresses(user); await checkout.expectReview(items);
    await site.deleteAccountThroughUi();
  });

  test('TC24 - Download Invoice after purchase order', async ({ page, trackAccount }) => {
    const user = createUser('tc24'); trackAccount(user);
    const site = new SitePage(page); const products = new ProductsPage(page); const cart = new CartPage(page);
    await site.openHome(); const items = await addOrderProducts(site, products); await cart.proceedToCheckout();
    await registerFromCheckout(page, user); await site.goTo('Cart'); await cart.proceedToCheckout();
    const checkout = new CheckoutPage(page);
    await checkout.expectAddresses(user); await checkout.expectReview(items);
    await checkout.placeOrder('Invoice download verification.', paymentData);
    const download = await checkout.downloadInvoice();
    expect(download.suggestedFilename()).toMatch(/invoice.*\.txt$/i);
    const savedPath = await download.path(); expect(savedPath).not.toBeNull();
    expect((await stat(savedPath!)).size).toBeGreaterThan(0);
    await page.getByRole('link', { name: 'Continue' }).click(); await site.deleteAccountThroughUi();
  });
});
