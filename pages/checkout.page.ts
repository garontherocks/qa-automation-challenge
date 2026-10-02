import { expect, type Download, type Page } from '@playwright/test';
import type { CartItem, PaymentData, UserData } from '../support/types';
import { SitePage } from './site.page';

export class CheckoutPage extends SitePage {
  constructor(page: Page) { super(page); }

  async expectReview(expected: CartItem[]): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Address Details' })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Review Your Order' })).toBeVisible();
    const rows = this.page.locator('#cart_info tbody tr').filter({ has: this.page.locator('.cart_description') });
    await expect(rows).toHaveCount(expected.length);
    const actual = await rows.evaluateAll((elements) => elements.map((row) => {
      const text = (selector: string) => row.querySelector(selector)?.textContent?.trim() ?? '';
      const money = (value: string) => Number(value.replace(/[^0-9]/g, ''));
      const unitPrice = money(text('.cart_price'));
      const quantity = Number(text('.cart_quantity'));
      return { name: text('.cart_description h4'), unitPrice, quantity, total: money(text('.cart_total')) };
    }));
    expect(actual).toEqual(expected);
  }

  private expectedAddress(user: UserData): string[] {
    return [
      `${user.title}. ${user.firstName} ${user.lastName}`,
      user.company, user.address1, user.address2,
      `${user.city} ${user.state} ${user.zipcode}`,
      user.country, user.mobileNumber,
    ];
  }

  async expectAddresses(user: UserData): Promise<void> {
    for (const selector of ['#address_delivery', '#address_invoice']) {
      const address = this.page.locator(selector);
      await expect(address).toBeVisible();
      const content = (await address.innerText()).replace(/\s+/g, ' ');
      for (const line of this.expectedAddress(user)) expect(content).toContain(line);
    }
  }

  async placeOrder(comment: string, payment: PaymentData): Promise<void> {
    await this.page.locator('textarea[name="message"]').fill(comment);
    await this.page.getByRole('link', { name: 'Place Order' }).click();
    await expect(this.page).toHaveURL(/\/payment/);
    await this.page.locator('input[name="name_on_card"]').fill(payment.nameOnCard);
    await this.page.locator('input[name="card_number"]').fill(payment.cardNumber);
    await this.page.getByPlaceholder('ex. 311').fill(payment.cvc);
    await this.page.getByPlaceholder('MM').fill(payment.expiryMonth);
    await this.page.getByPlaceholder('YYYY').fill(payment.expiryYear);
    await this.page.getByRole('button', { name: 'Pay and Confirm Order' }).click();
    await expect(this.page.getByText('Order Placed!', { exact: true })).toBeVisible();
  }

  async downloadInvoice(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByRole('link', { name: 'Download Invoice' }).click();
    return downloadPromise;
  }
}
