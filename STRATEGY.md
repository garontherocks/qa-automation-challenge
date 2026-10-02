# Test Strategy

## Stack and architecture

- Playwright, TypeScript in strict mode, Node.js and one bundled Chromium project.
- Six feature specs retain explicit `TC01`–`TC26` mapping.
- Cohesive page objects encapsulate UI interaction and DOM-specific parsing. `AccountFlow` and `OrderFlow` reuse repeated account and checkout behavior without hiding the different entry conditions of TC14–TC16.
- A small custom fixture exposes the account API, tracks generated users for failure-safe cleanup and blocks only known third-party advertising hosts.
- Test data is generated per test. Cart expectations are captured from the UI rather than duplicated as fragile static prices.

## Reliability

- One worker limits load on the shared public environment. Tests remain independent and require no execution order. A two-worker full run produced three navigation/add-to-cart failures although all affected specs passed independently, so serial execution is the evidence-based reliability setting.
- One test retry is enabled because the application was observed returning a full-page `heavy load (queue full)` response during normal UI navigation. Assertions and cleanup still run normally on each attempt.
- Playwright web-first assertions replace fixed sleeps. Dialog and download events are observed before their triggering action.
- Known ad-network requests are blocked because Google vignette ads were observed changing the URL to `#google_vignette` and intercepting navigation. First-party application traffic is never mocked.
- Accounts use unique emails. TC02, TC04, TC05, TC16 and TC20 use the documented API for setup; cases that test registration use the UI. API cleanup runs even after test failure and tolerates an account already deleted through the UI.
- Account cleanup retries only transient unsuccessful responses within a bounded window; this addresses the observed public API `heavy load (queue full)` response without masking business failures.
- Failure diagnostics use trace on retry, screenshots and retained video. No third-party reporter is required.

## Assertions

- TC08 checks all required product fields; TC09 and TC20 require results and verify every returned name is relevant.
- TC12/13/17/20/22 compare exact cart names, integer rupee prices, quantities and calculated totals. TC20 compares the same captured cart after login.
- Checkout tests compare the complete product state. TC23 independently checks delivery and billing addresses against generated registration data.
- Order cases verify the real confirmation. TC24 observes the download event before clicking, validates the suggested invoice filename and verifies the saved file is non-empty.
- TC25/26 validate both target content and the resulting scroll position.

## Redundancy and gaps

- TC10/11 test the same subscription component on different pages; TC25/26 differ only in scroll mechanism. TC14/15/16/24 share most order steps. Shared page methods and flows keep this overlap visible but inexpensive.
- The published set is mostly happy-path. Highest-value additions would be registration/payment validation, cart boundary quantities, authentication edge cases and basic accessibility checks, followed by cross-browser coverage.
- Security, accessibility, visual and performance testing are deliberately outside this timed functional challenge.

## Assumptions and trade-offs

- Bundled Chromium coverage is sufficient; Firefox/WebKit and CI were deferred until the mandatory suite was stable.
- Catalog order is used only where the published case explicitly asks for the first/second product. Tests capture current names and prices before asserting the cart.
- Product prices are integer rupee values on the current site. Parsing strips punctuation in the `Rs.` prefix, which otherwise resembles a decimal point.
- TC18 uses Women/Dress and Men/Tshirts so selected links and expected headings are internally consistent despite the published example mixing Dress with a Tops expectation.
- Invoice content parsing was not added: the challenge prioritizes the real completed download, sensible filename and non-empty file, and a parser dependency was not justified.

## Observed oddities

- Google vignette ads intermittently changed the current URL and prevented intended navigation.
- The contact form attaches its submit/confirmation handler after the visible form is available; TC06 waits for this actual handler rather than using a time delay.
- Several accessibility names are ambiguous or include icon-font characters. Semantic locators are used where reliable, with stable IDs/names scoped to their component where necessary.
