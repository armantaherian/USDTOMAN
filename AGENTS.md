# AI agent guidelines

## Development

- Commit or push only when the developer explicitly requests that action.
- Edit source files, not generated `dist/` files. Use Alpine.js for interaction and Tailwind CSS for UI.
- For behavior changes, write a meaningful unit test first, then implement. Use unit tests only; avoid tests of documentation wording, CSS classes, or layout details.
- Run `npm test` after changes. Run `npm run build` for application or data changes.
- Prefer local resources. Keep runtime assets and dependencies local; use the internet only when necessary to obtain resources or verify facts.

## UI

- Provide Persian and English text, digits, and dates, with correct RTL/LTR direction. Persist theme and language preferences.
- Keep the existing palette, compact layout, and shared scrollbar styling consistent. Tooltips and modals must appear above other layers.
- Show one representative leader portrait per year. Use compact government lists, desktop details on the left, and lists only on mobile.

## Data

- Prices: use `npm run update-data`, or pass a complete local TGJU snapshot with `npm run update-data -- path/to/snapshot.json`. This updates existing rows from 1391 onward; add new year rows manually and preserve older source distinctions and toman units.
- Government: update `src/government.json`, `src/leadership.json`, and affected `government` entries in `src/data.json` together. Verify terms and transitions, retain source links, and keep bilingual names consistent.
- Keep portraits local in `src/assets/portraits/` with metadata in `src/portraits.json`. Preserve source credits as plain text.
- Never invent missing facts or prices. Review data diffs and keep the existing snapshot when retrieval fails.
