# USD / Toman

A simple static website showing yearly US dollar prices in Iran, in toman.

- Persian and English
- Light and dark themes
- Sortable column headers
- Government names for each year
- Responsive layout with Vazirmatn font
- Local JSON data in `dist/data.json`

## Run locally

```sh
npm ci
npm run build
npm run dev
```

Open http://127.0.0.1:4173/. Deploy the `dist/` folder to any static host.

For GitHub Pages, select **Deploy from a branch → main → / (root)**. The build generates a root `index.html` that displays the website directly and loads assets from `dist/`, keeping the root URL. No GitHub Actions workflow is needed.

## Built with

Alpine.js and Tailwind CSS. Edit `dist/index.html`, `dist/app.js`, and `src/styles.css`, then run `npm run build`.

`scripts/` contains only the build script and local preview server. Update prices directly in `dist/data.json`; no downloaded source pages or raw data copies are required. `.openai/hosting.json` configures the existing hosted website.

## Data

Prices are a stored snapshot, not a live feed. Sources: [TGJU](https://www.tgju.org/profile/price_dollar_rl/history), [NetArz](https://netarz.ir/wiki/dollar-price-by-year), and [KhabarOnline](https://www.khabaronline.ir/news/189536).

Early annual reference prices are repeated in both minimum and maximum columns. Some older ranges use monthly averages. The JSON records each year's source and resolution.

Font: [Vazirmatn](https://github.com/rastikerdar/vazirmatn).
