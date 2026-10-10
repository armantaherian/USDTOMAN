import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { build } from "esbuild";
import sharp from "sharp";

// Keep editable source separate from the files served to visitors.
fs.mkdirSync("dist", { recursive: true });
const data = JSON.parse(fs.readFileSync("src/data.json", "utf8"));
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
const priceFormatter = new Intl.NumberFormat("fa", {
  maximumFractionDigits: 0,
});
const yearFormatter = new Intl.NumberFormat("fa", { useGrouping: false });
const staticRows = [...data.years]
  .sort((first, second) => second.year - first.year)
  .map((row) => {
    const government = row.government.map((person) => person.fa).join("، ");
    const price = (value) =>
      value == null ? "—" : priceFormatter.format(value);
    return `<tr class="table-row"><td class="px-2 py-3 sm:px-4">${yearFormatter.format(row.year)}</td><td class="px-2 py-3 text-muted sm:px-4">${escapeHtml(government)}</td><td class="px-2 py-3 sm:px-4">${price(row.minimum)}</td><td class="px-2 py-3 text-accent sm:px-4">${price(row.maximum)}</td><td class="px-2 py-3 text-xs">کمترین: ${row.maximum > 0 ? new Intl.NumberFormat("fa", { maximumFractionDigits: 2 }).format(1000000 / row.maximum) : "—"} $<br>بیشترین: ${row.minimum > 0 ? new Intl.NumberFormat("fa", { maximumFractionDigits: 2 }).format(1000000 / row.minimum) : "—"} $</td></tr>`;
  })
  .join("\n");
const html = fs
  .readFileSync("src/index.html", "utf8")
  .replace("<!-- STATIC_TABLE_ROWS -->", staticRows);
fs.writeFileSync("dist/index.html", html);
fs.copyFileSync("src/data.json", "dist/data.json");
fs.copyFileSync("src/assets/favicon.svg", "dist/favicon.svg");
fs.copyFileSync("src/robots.txt", "dist/robots.txt");
fs.copyFileSync("src/sitemap.xml", "dist/sitemap.xml");
await sharp("src/assets/favicon-franklin.png")
  .resize(32, 32)
  .png()
  .toFile("dist/favicon-32.png");
await sharp("src/assets/favicon-franklin.png")
  .resize(180, 180)
  .png()
  .toFile("dist/apple-touch-icon.png");
await sharp("src/assets/og-image.svg").png().toFile("dist/og-image.png");
await sharp("src/assets/og-image-2.png")
  .resize(1200, 630)
  .png()
  .toFile("dist/og-image-2.png");
fs.copyFileSync("node_modules/alpinejs/dist/cdn.min.js", "dist/alpine.min.js");

await build({
  entryPoints: ["src/app.js"],
  outfile: "dist/app.js",
  minify: true,
  target: "es2020",
});

const result = spawnSync(
  process.execPath,
  [
    "node_modules/@tailwindcss/cli/dist/index.mjs",
    "-i",
    "src/styles.css",
    "-o",
    "dist/style.css",
    "--minify",
  ],
  { stdio: "inherit" },
);

process.exit(result.status ?? 1);
