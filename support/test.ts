import { test as base } from '@playwright/test';
import { AccountApi } from './account-api';
import type { UserData } from './types';

interface Fixtures {
  accountApi: AccountApi;
  trackAccount: (user: UserData) => void;
  blockThirdPartyAds: void;
}

export const test = base.extend<Fixtures>({
  blockThirdPartyAds: [async ({ context }, use) => {
    await context.route(/(googlesyndication|doubleclick|googleadservices|securepubads)/, (route) => route.abort());
    await use();
  }, { auto: true }],
  accountApi: async ({ request }, use) => { await use(new AccountApi(request)); },
  trackAccount: async ({ request }, use) => {
    const users: UserData[] = [];
    await use((user) => users.push(user));
    const api = new AccountApi(request);
    for (const user of users) await api.delete(user.email, user.password);
  },
});

export { expect } from '@playwright/test';
