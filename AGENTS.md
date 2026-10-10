# Project rules

- Only commit or push when the developer explicitly asks you to do so. Otherwise, leave changes uncommitted and do not push. Authorization to commit does not imply authorization to push.
- Use test-first development: write or update a unit test for the requested behavior, run it, then implement the change.
- Use unit tests only; do not add or run integration, browser, or end-to-end tests.
- Keep tests focused on meaningful behavior and regressions. Do not test instruction wording, CSS classes, layout dimensions, or source-text snippets.
- Always run `npm test` after changes and fix failures before finishing.
- Use Tailwind CSS conventions for UI styling and Alpine.js conventions for interactive logic and state.
- Provide Persian and English versions of all user-facing text, including labels, tooltips, accessibility text, and new pages. Respect the selected language and RTL/LTR direction.
- Edit source files, not generated `dist/` files. Run `npm run build` when updating the preview.
