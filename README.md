# Dollar prices in Iran

A buildless static website in Persian and English, with light/dark themes and sortable yearly prices in toman. Serve `dist/` using any static HTTP server; opening the HTML directly from disk does not support the JSON fetch.

Data source: https://github.com/m-ahmadi/dollar. Prices are already in toman. `node scripts/prepare-data.mjs` aggregates the downloaded `raw-dollar.json` into `dist/data.json`. The archive is a snapshot, not a live feed. It currently covers 1357 through 1405, with the latest observation on 2026-10-08. Single-observation years have null extrema. Other years use available open, high, low and close values; incomplete coverage cannot establish true yearly extremes.

Updated sources: TGJU daily OHLC (rial divided by 10) for 1391 onward; NetArz published yearly ranges for 1364–1390. NetArz's 1364–1379 ranges are extrema of monthly averages, not daily prices. The earlier annual-only rows retain unknown extrema. `node scripts/improve-data.mjs` builds the combined JSON from the stored TGJU and NetArz snapshots after `prepare-data.mjs`. Source and resolution are recorded per year in JSON. The latest observation remains 2026-10-08.

Font: Vazirmatn, https://github.com/rastikerdar/vazirmatn (SIL Open Font License), loaded through the version-pinned jsDelivr stylesheet.
