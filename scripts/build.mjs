import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { build } from "esbuild";

// Keep editable source separate from the files served to visitors.
fs.mkdirSync("dist", { recursive: true });
fs.copyFileSync("src/index.html", "dist/index.html");
fs.copyFileSync("src/data.json", "dist/data.json");
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
