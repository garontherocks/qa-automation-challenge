import { expect, type Page } from '@playwright/test';
import { SitePage } from './site.page';

export class ContactPage extends SitePage {
  constructor(page: Page) { super(page); }

  async submit(details: { name: string; email: string; subject: string; message: string; file: string }): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Get In Touch' })).toBeVisible();
    const hasSubmitHandler = () => this.page.locator('#contact-us-form').evaluate((form) => {
      const jq = (globalThis as unknown as { jQuery?: { _data: (target: Element, key: string) => { submit?: unknown } } }).jQuery;
      return Boolean(jq?._data(form, 'events')?.submit);
    });
    await expect.poll(hasSubmitHandler).toBeTruthy();
    await this.page.getByPlaceholder('Name').fill(details.name);
    await this.page.getByPlaceholder('Email', { exact: true }).fill(details.email);
    await this.page.getByPlaceholder('Subject').fill(details.subject);
    await this.page.getByPlaceholder('Your Message Here').fill(details.message);
    await this.page.locator('input[type="file"]').setInputFiles(details.file);
    const dialogPromise = this.page.waitForEvent('dialog');
    const submitPromise = this.page.getByRole('button', { name: 'Submit' }).click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Press OK to proceed!');
    await dialog.accept();
    await submitPromise;
    await expect(this.page.locator('.status.alert-success')).toHaveText('Success! Your details have been submitted successfully.');
  }
}
