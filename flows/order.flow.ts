import type { Page } from '@playwright/test';
import { CheckoutPage } from '../pages/checkout.page';
import type { CartItem, PaymentData, UserData } from '../support/types';

export class OrderFlow {
  private readonly checkout: CheckoutPage;
  constructor(page: Page) { this.checkout = new CheckoutPage(page); }

  async verifyAndPlace(items: CartItem[], user: UserData, payment: PaymentData): Promise<void> {
    await this.checkout.expectAddresses(user);
    await this.checkout.expectReview(items);
    await this.checkout.placeOrder('Please deliver this automation test order.', payment);
  }
}
