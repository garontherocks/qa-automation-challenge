import { expect, type Locator, type Page } from '@playwright/test';
import type { CartItem } from '../support/types';
import { SitePage } from './site.page';

export class ProductsPage extends SitePage {
  constructor(page: Page) { super(page); }

  async expectAllProducts(): Promise<void> {
    await expect(this.page).toHaveURL(/\/products/);
    await expect(this.page.getByRole('heading', { name: 'All Products' })).toBeVisible();
    await expect(this.cards.first()).toBeVisible();
  }

  get cards(): Locator { return this.page.locator('.features_items .product-image-wrapper'); }

  private card(index: number): Locator { return this.cards.nth(index); }

  private async expectClickHandler(locator: Locator): Promise<void> {
    await expect.poll(() => locator.evaluate((element) => {
      const jq = (globalThis as unknown as { jQuery?: { _data: (target: Element, key: string) => { click?: unknown } } }).jQuery;
      return Boolean(jq?._data(element, 'events')?.click);
    })).toBeTruthy();
  }

  async productFromCard(index: number): Promise<CartItem> {
    const card = this.card(index).locator('.productinfo');
    const name = (await card.locator('p').innerText()).trim();
    const priceText = await card.getByRole('heading', { level: 2 }).innerText();
    const unitPrice = Number(priceText.replace(/[^0-9]/g, ''));
    return { name, unitPrice, quantity: 1, total: unitPrice };
  }

  async addProduct(index: number, modalAction: 'continue' | 'cart'): Promise<CartItem> {
    const product = await this.productFromCard(index);
    const addButton = this.card(index).locator('.productinfo a.add-to-cart');
    await this.expectClickHandler(addButton);
    await addButton.click();
    const modal = this.page.locator('#cartModal');
    await expect(modal).toBeVisible();
    if (modalAction === 'continue') await modal.getByRole('button', { name: 'Continue Shopping' }).click();
    else await modal.getByRole('link', { name: 'View Cart' }).click();
    return product;
  }

  async search(term: string): Promise<string[]> {
    await this.page.getByPlaceholder('Search Product').fill(term);
    await this.page.locator('#submit_search').click();
    await expect(this.page.getByRole('heading', { name: 'Searched Products' })).toBeVisible();
    const names = await this.cards.locator('.productinfo p').allInnerTexts();
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect(name.toLowerCase()).toContain(term.toLowerCase());
    return names;
  }

  async openProduct(index = 0): Promise<void> {
    await this.card(index).getByRole('link', { name: 'View Product' }).click();
    await expect(this.page).toHaveURL(/\/product_details\/\d+/);
  }
}
