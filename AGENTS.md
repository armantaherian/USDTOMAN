# Project rules

- Only commit or push when the developer explicitly asks you to do so. Otherwise, leave changes uncommitted and do not push. Authorization to commit does not imply authorization to push.
- Use test-first development: write or update a unit test for the requested behavior, run it, then implement the change.
- Use unit tests only; do not add or run integration, browser, or end-to-end tests.
- Keep tests focused on meaningful behavior and regressions. Do not test instruction wording, CSS classes, layout dimensions, or source-text snippets.
- Always run `npm test` after changes and fix failures before finishing.
- Use Tailwind CSS conventions for UI styling and Alpine.js conventions for interactive logic and state.
- Provide Persian and English versions of all user-facing text, including labels, tooltips, accessibility text, and new pages. Respect the selected language and RTL/LTR direction.
- Format all displayed numbers and dates using the selected language: Persian digits in Persian and English digits in English.
- Keep the cream, sage, and muted green design consistent across components and both themes. Use the same thin themed scrollbar for every scrolling component, including tables and modals.
- Keep the government column compact with one representative portrait per year and a circular tree button. Choose the leader serving longest in that Persian year; explain transitions and other officeholders in the bilingual cabinet modal with source links.
- Keep portrait rows left-aligned and left-to-right while the surrounding table follows the selected language. Tooltips and modals must appear above other layers.
- Present the cabinet as a simple tree with the president at the root and ministries as compact leaves; show the Central Bank as a separate tree. Keep dates, sources, and transition summaries expandable so names are easy to scan.
- Edit source files, not generated `dist/` files. Run `npm run build` when updating the preview.
- Prefer local resources whenever available. Store images, fonts, data, and other assets in the project, and bundle dependencies locally; do not load runtime resources from external URLs or CDNs when a local option is feasible. Use online resources only when needed to obtain missing assets, install dependencies, or verify facts, then save required runtime resources locally.
