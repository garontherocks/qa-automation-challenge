import { expect, type Locator, type Page } from '@playwright/test';
import type { CartItem } from '../support/types';
import { SitePage } from './site.page';

export class CartPage extends SitePage {
  constructor(page: Page) { super(page); }

  get rows(): Locator { return this.page.locator('#cart_info_table tbody tr'); }

  async expectDisplayed(): Promise<void> {
    await expect(this.page).toHaveURL(/\/view_cart/);
    await expect(this.page.locator('.cart_info')).toBeVisible();
  }

  async items(): Promise<CartItem[]> {
    return this.rows.evaluateAll((rows) => rows.map((row) => {
      const text = (selector: string) => row.querySelector(selector)?.textContent?.trim() ?? '';
      const money = (value: string) => Number(value.replace(/[^0-9]/g, ''));
      const unitPrice = money(text('.cart_price'));
      const quantity = Number(text('.cart_quantity'));
      return { name: text('.cart_description h4'), unitPrice, quantity, total: money(text('.cart_total')) };
    }));
  }

  async expectItems(expected: CartItem[]): Promise<void> {
    await expect(this.rows).toHaveCount(expected.length);
    const actual = await this.items();
    expect(actual).toEqual(expected);
    for (const item of actual) expect(item.total).toBe(item.unitPrice * item.quantity);
  }

  async remove(name: string): Promise<void> {
    const row = this.rows.filter({ hasText: name });
    await row.locator('.cart_quantity_delete').click();
    await expect(row).toHaveCount(0);
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.getByText('Proceed To Checkout', { exact: true }).click();
  }
}
