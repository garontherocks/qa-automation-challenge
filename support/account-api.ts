import { expect, type APIRequestContext } from '@playwright/test';
import type { UserData } from './types';

interface AccountResponse { responseCode: number; message: string }

export class AccountApi {
  constructor(private readonly request: APIRequestContext) {}

  async create(user: UserData): Promise<void> {
    const response = await this.request.post('/api/createAccount', {
      form: {
        name: user.name, email: user.email, password: user.password,
        title: user.title, birth_date: user.birthDay, birth_month: user.birthMonth,
        birth_year: user.birthYear, firstname: user.firstName, lastname: user.lastName,
        company: user.company, address1: user.address1, address2: user.address2,
        country: user.country, zipcode: user.zipcode, state: user.state,
        city: user.city, mobile_number: user.mobileNumber,
      },
    });
    expect(response.ok(), await response.text()).toBeTruthy();
    const body = await response.json() as AccountResponse;
    expect(body.responseCode, body.message).toBe(201);
  }

  async delete(email: string, password: string): Promise<void> {
    let evidence = 'No response received';
    await expect.poll(async () => {
      const response = await this.request.delete('/api/deleteAccount', { form: { email, password } });
      const text = await response.text();
      evidence = `HTTP ${response.status()}: ${text}`;
      if (!response.ok()) return false;
      try {
        const body = JSON.parse(text) as AccountResponse;
        evidence = body.message;
        return [200, 404].includes(body.responseCode);
      } catch { return false; }
    }, {
      message: `Account cleanup did not succeed: ${evidence}`,
      timeout: 20_000,
      intervals: [500, 1_000, 2_000, 4_000],
    }).toBeTruthy();
  }
}
