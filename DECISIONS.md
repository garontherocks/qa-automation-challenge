# Engineering Decisions

- **Stack:** Playwright with strict TypeScript and Chromium only. This is the challenge's preferred stack and keeps the three-hour solution focused.
- **Concurrency:** One worker. A full two-worker run produced three transient navigation/cart failures while every affected spec passed independently; the public shared environment is demonstrably more reliable serially.
- **Isolation:** Every account is uniquely generated. UI registration is retained where it is under test; documented account APIs provide setup elsewhere and idempotent cleanup after every test.
- **Architecture:** Small page objects own page-level interactions; only repeated multi-page account and order behavior becomes a flow. No inheritance or general-purpose framework layer.
- **Diagnostics:** Playwright-native trace, screenshot, video and HTML report replace third-party reporting.
- **Third-party ads:** Ad-network requests are blocked while first-party application behavior remains untouched. During validation, Google vignette ads changed the URL to `#google_vignette` and intercepted navigation nondeterministically.
- **AI assistance:** AI helped evaluate the smallest reusable architecture and identify isolation risks. All generated code is validated through TypeScript and actual Playwright runs.
- **Money parsing:** Current prices are integer rupees rendered as `Rs. 500`; parsing removes non-digits so the punctuation in `Rs.` is not mistaken for a decimal point.
- **TC18 ambiguity:** The suite chooses Women/Dress and Men/Tshirts and asserts their matching headings; the published example inconsistently mentions Dress while expecting a Tops title.
- **Invoice scope:** The real download, `.txt` filename and non-empty saved file are verified. A new parser dependency was rejected as disproportionate.
- **Browser:** Standard Playwright bundled Chromium keeps fresh-clone setup self-contained. Installed Chrome was used only as a temporary local validation workaround; Firefox/WebKit are outside scope.
- **API overload:** Cleanup uses bounded assertion polling after the public endpoint returned an HTML `heavy load (queue full)` response. Business response codes remain strictly checked.
- **Retry:** One Playwright retry is enabled after the site returned the same `heavy load (queue full)` condition during first-party UI navigation. The retry addresses documented shared-environment availability, not synchronization defects.
