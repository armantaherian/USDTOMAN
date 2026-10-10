# AI agent instructions

## Permissions and delivery

- Only commit or push when the developer explicitly asks you to do so. Otherwise, leave changes uncommitted and do not push. Authorization to commit does not imply authorization to push.

## Application development

### Source and framework

- Use Tailwind CSS conventions for UI styling and Alpine.js conventions for interactive logic and state.
- Edit source files, not generated `dist/` files. Run `npm run build` when updating the preview.

### Local resources

- Prefer local resources whenever available. Store images, fonts, data, and other assets in the project, and bundle dependencies locally; do not load runtime resources from external URLs or CDNs when a local option is feasible. Use online resources only when needed to obtain missing assets, install dependencies, or verify facts, then save required runtime resources locally.

### Language and number formatting

- Provide Persian and English versions of all user-facing text, including labels, tooltips, accessibility text, and new pages. Respect the selected language and RTL/LTR direction.
- Format all displayed numbers and dates using the selected language: Persian digits in Persian and English digits in English.

### Design and interaction

- Keep the cream, sage, and muted green design consistent across components and both themes. Use the same thin themed scrollbar for every scrolling component, including tables and modals.
- Keep the government column compact with one representative portrait per year and a circular tree button. Choose the leader serving longest in that Persian year; explain transitions and other officeholders in the bilingual cabinet modal with source links.
- Keep portrait rows left-aligned and left-to-right while the surrounding table follows the selected language. Tooltips and modals must appear above other layers.
- Present government and Central Bank officeholders as simple lists. Selecting a name shows that person's role, term, and sources in a detail panel on the left. Keep the desktop panel placement consistent in both languages, with RTL Persian and LTR English text; stack panels on mobile. Keep transition summaries expandable.

## Testing

- Use test-first development: write or update a unit test for the requested behavior, run it, then implement the change.
- Use unit tests only; do not add or run integration, browser, or end-to-end tests.
- Keep tests focused on meaningful behavior and regressions. Do not test instruction wording, CSS classes, layout dimensions, or source-text snippets.
- Always run `npm test` after changes and fix failures before finishing.

## Data maintenance

### Price data

- Read `scripts/update-data.mjs` and `src/data.json` before changing prices. Work on the local snapshot; do not make the website fetch remote market data at runtime.
- Run `npm run update-data` to retrieve TGJU history and update existing rows from Persian year 1391 onward. The script converts rial to toman, calculates daily minimum/maximum prices, and updates `latestDate`, `retrievedAt`, and source metadata. It preserves older historical rows, including 1390.
- When a complete TGJU response has already been saved locally, prefer `npm run update-data -- path/to/snapshot.json`. The file must contain the original TGJU response structure (`data` and record counts), not the website's `src/data.json` structure.
- The updater does not create new year rows. For a new Persian year, first add a row to `src/data.json` with the same schema as its neighbors, including bilingual government names and verified source/resolution metadata, then run the updater.
- Update earlier historical prices only after verifying their cited sources. Preserve distinctions between daily extrema, monthly-average ranges, and repeated annual reference rates; do not present reference rates as measured extrema.
- Review the diff for plausible ranges, complete coverage, toman units, and correct dates. If retrieval fails or the response is incomplete, retain the existing snapshot; never invent replacement prices.
- Run `npm test`, then `npm run build`. Do not commit or push unless explicitly requested.

### Government data

- Government data is maintained manually; there is currently no automatic government updater. Read `src/government.json`, `src/leadership.json`, `src/data.json`, and `src/portraits.json` together before changing it.
- Verify appointments, departures, acting appointments, and historical transitions against reliable sources, preferring official announcements. Existing `source` links are starting points. Save verified facts locally and retain source URLs for attribution; do not scrape or fetch them when a user opens the modal.
- In `src/government.json`, update `records` with the Persian role key, Persian/English names, inclusive Persian `startYear`/`endYear`, Persian term-date strings (`start`/`end`), and a supporting `source` URL. Add an English label in `roles` for any new role key. Set `updatedAt` to the verification date.
- Close an outgoing officeholder's term and add the successor as a separate record. Keep both in transition years, including acting officeholders. Ongoing terms use `در حال تصدی` as the displayed end date; extend their numeric `endYear` to the latest year actually covered and verified by the dataset. Do not invent exact dates when a source provides only a month or year.
- In `src/leadership.json`, maintain leaders' exact Gregorian ISO term dates (`YYYY-MM-DD`), using `null` for an ongoing term. These dates determine which leader served longest within each Persian year and therefore which single portrait appears in the table. Preserve or update `termSource` and individual sources as needed.
- Update each affected row's `government` array in `src/data.json` with every relevant leader who served that year, in chronological order, using matching Persian/English names. Keep name keys consistent with leadership terms and portraits.
- For leadership transitions, add or revise the year's `events` entry in `src/leadership.json` with concise Persian and English summaries and supporting source URLs. Explain the succession and relevant events without speculation or unsupported causal claims about prices.
- For a new leader, save the portrait under `src/assets/portraits/` and add its local path and original-source/credit metadata to `src/portraits.json`. Keep runtime images local and render credit metadata as plain text, never raw external HTML.
- Write or update meaningful unit tests first when changing selection, date handling, or other behavior. After data edits, run `npm test` to check coverage, bilingual names, local portraits, and transitions, then run `npm run build`. Review the diff and do not commit or push unless explicitly requested.
