# Project rules

- Do not commit or push changes.
- Use test-first development: write or update a unit test for the requested behavior, run it, then implement the change.
- Use unit tests only; do not add or run integration, browser, or end-to-end tests.
- Always run `npm test` after changes and fix failures before finishing.
- Use Tailwind CSS conventions for UI styling and Alpine.js conventions for interactive logic and state.
- Provide Persian and English versions of all user-facing text, including labels, tooltips, accessibility text, and new pages. Respect the selected language and RTL/LTR direction.
- Edit source files, not generated `dist/` files. Run `npm run build` when updating the preview.
