# Automation Exercise — Playwright Test Suite

Playwright + TypeScript implementation of all 26 scenarios in [`TEST_CASES.md`](./TEST_CASES.md). The suite targets the public `https://automationexercise.com` site using bundled Chromium, isolated test data and API-assisted account cleanup.

## Requirements

- Node.js 20 or newer
- npm

## Install

```bash
npm install
npx playwright install chromium
```

## Run

```bash
# all 26 tests
npm test

# list the mapped cases without running them
npm run test:list

# run one feature or one case
npx playwright test tests/cart.spec.ts
npx playwright test --grep TC12

# interactive modes
npm run test:headed
npm run test:ui

# TypeScript validation
npm run typecheck
```

The HTML report is written to `playwright-report/`. Failure screenshots, videos and traces are written to `test-results/`; both paths are gitignored.

## Design

- Six specs group the cases by business capability while retaining `TC01`–`TC26` in test titles.
- Small page objects expose page-level behavior. `AccountFlow` and `OrderFlow` contain only genuinely repeated multi-page actions.
- Each account is generated uniquely. Tests use the documented account API for setup only when registration is not under test, and always for failure-safe cleanup.
- Cart and checkout checks compare captured product names, unit prices, quantities and totals. Address checks derive expected values from the same generated user used for registration.
- The suite blocks only known third-party ad-network requests because vignette ads otherwise intercept first-party navigation. No application requests are mocked.

## Reliability notes

The target is public and occasionally slow, so the suite uses one worker, web-first assertions and no fixed sleeps. TC06 waits for the site's late-bound submit handler before exercising its real confirmation dialog. Downloads use Playwright's download event and the invoice is checked for a reasonable filename and non-zero saved size.

See [`STRATEGY.md`](./STRATEGY.md) and [`DECISIONS.md`](./DECISIONS.md) for trade-offs and assumptions.
