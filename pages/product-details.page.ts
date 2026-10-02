import { expect, type Page } from '@playwright/test';
import type { CartItem } from '../support/types';
import { SitePage } from './site.page';

export class ProductDetailsPage extends SitePage {
  constructor(page: Page) { super(page); }

  private get details() { return this.page.locator('.product-information'); }

  async expectCompleteDetails(): Promise<void> {
    await expect(this.details.locator('h2')).not.toBeEmpty();
    await expect(this.details.getByText(/^Category:/)).toBeVisible();
    await expect(this.details.getByText(/^Rs\. \d+/)).toBeVisible();
    await expect(this.details.locator('p').filter({ hasText: 'Availability:' })).toContainText('In Stock');
    await expect(this.details.locator('p').filter({ hasText: 'Condition:' })).toContainText('New');
    await expect(this.details.locator('p').filter({ hasText: 'Brand:' })).not.toHaveText('Brand:');
  }

  async currentProduct(quantity = 1): Promise<CartItem> {
    const name = (await this.details.locator('h2').innerText()).trim();
    const price = Number((await this.details.getByText(/^Rs\. \d+/).innerText()).replace(/[^0-9]/g, ''));
    return { name, unitPrice: price, quantity, total: price * quantity };
  }

  async addToCart(quantity: number): Promise<CartItem> {
    const product = await this.currentProduct(quantity);
    await this.page.locator('#quantity').fill(String(quantity));
    await this.page.getByRole('button', { name: 'Add to cart' }).click();
    const modal = this.page.locator('#cartModal');
    await expect(modal).toBeVisible();
    await modal.getByRole('link', { name: 'View Cart' }).click();
    return product;
  }

  async submitReview(name: string, email: string, review: string): Promise<void> {
    await expect(this.page.getByText('Write Your Review')).toBeVisible();
    await this.page.getByPlaceholder('Your Name').fill(name);
    await this.page.getByPlaceholder('Email Address', { exact: true }).fill(email);
    await this.page.getByPlaceholder('Add Review Here!').fill(review);
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await expect(this.page.getByText('Thank you for your review.')).toBeVisible();
  }
}
