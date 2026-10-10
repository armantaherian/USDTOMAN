import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { build } from "esbuild";

function createApp(saved = {}) {
  let factory;
  const portraits = JSON.parse(fs.readFileSync("src/portraits.json", "utf8"));
  const root = { dataset: {} };
  const source = fs.readFileSync("src/app.js", "utf8").replace(/^import portraits.*\n/, "");
  vm.runInNewContext(source, {
    portraits,
    localStorage: { getItem: (key) => saved[key], setItem: (key, value) => (saved[key] = value) },
    window: { location: { search: "" } },
    URLSearchParams,
    document: { documentElement: root, addEventListener: (_, callback) => callback() },
    Alpine: { data: (_, callback) => (factory = callback) },
    navigator: {},
  });
  return { app: factory(), root };
}

test("multipliers use Persian digits, parentheses, and highest / lowest", () => {
  const { app } = createApp();
  assert.equal(app.priceMultiplier({ minimum: 100, maximum: 200 }), "(۲×)");
  assert.equal(app.priceMultiplier({ minimum: 100, maximum: 2200 }), "(۲۲×)");
  assert.equal(app.priceMultiplier({ minimum: 100, maximum: 225 }), "(۲٫۲۵×)");
  assert.equal(app.priceMultiplier({ minimum: 0, maximum: 200 }), "—");
  assert.equal(app.priceMultiplier({ minimum: null, maximum: 200 }), "—");
});

test("theme and language persist and restore page direction", () => {
  const saved = {};
  const { app } = createApp(saved);
  app.toggleLanguage();
  app.toggleTheme();
  const reopened = createApp(saved);
  reopened.app.syncPage();
  assert.equal(reopened.root.lang, "en");
  assert.equal(reopened.root.dir, "ltr");
  assert.equal(reopened.root.dataset.theme, "dark");
});

test("every government person has a local portrait and both names", () => {
  const { app } = createApp();
  const data = JSON.parse(fs.readFileSync("src/data.json", "utf8"));
  for (const person of data.years.flatMap((row) => row.government)) {
    assert.ok(person.fa && person.en);
    assert.ok(app.portrait(person), person.en);
    assert.ok(fs.existsSync("src/assets/" + app.portrait(person)), person.en);
  }
});

test("translations have matching Persian and English text", () => {
  const { app } = createApp();
  const persian = app.t;
  app.toggleLanguage();
  assert.deepEqual(Object.keys(app.t).sort(), Object.keys(persian).sort());
  for (const text of Object.values(app.t)) assert.ok(text.length);
});

test("portrait credits provide Persian and English headings", () => {
  const build = fs.readFileSync("scripts/build.mjs", "utf8");
  assert.ok(build.includes("منبع تصاویر"));
  assert.ok(build.includes("Portrait credits"));
});

test("price multipliers use smaller digits and a larger upward arrow", () => {
  for (const file of ["src/index.html", "scripts/build.mjs"]) {
    const source = fs.readFileSync(file, "utf8");
    assert.ok(source.includes("text-base sm:text-lg"));
    assert.ok(source.includes(">↑</span>"));
    assert.ok(source.includes("text-[10px] sm:text-xs"));
  }
});

test("portrait tooltips use the browser top layer outside the scroll clipping", () => {
  const html = fs.readFileSync("src/index.html", "utf8");
  assert.ok(html.includes('popover="manual"'));
  assert.ok(html.includes("showPopover()"));
  assert.ok(html.includes("hidePopover()"));
  assert.ok(html.includes("getBoundingClientRect()"));
});

test("table rows use compact vertical padding", () => {
  const html = fs.readFileSync("src/index.html", "utf8");
  const rows = html.slice(html.indexOf('<template x-for="(row, index)'));
  assert.ok(rows.includes("py-2"));
  assert.ok(rows.includes("sm:py-2.5"));
  assert.ok(!rows.includes("sm:py-3.5"));
});

test("multiple portraits overlap with a separating ring", () => {
  const css = fs.readFileSync("src/styles.css", "utf8");
  assert.match(css, /\.portrait-person\s*\+\s*\.portrait-person\s*\{[^}]*margin-left:\s*-10px/);
  assert.match(css, /\.portrait-person img\s*\{[^}]*box-shadow:\s*0 0 0 2px var\(--surface\)/);
});

test("portraits use a compact column and chronological left-to-right layout", () => {
  const html = fs.readFileSync("src/index.html", "utf8");
  const css = fs.readFileSync("src/styles.css", "utf8");
  assert.ok(html.includes("w-[20%] sm:w-[16%]"));
  assert.doesNotMatch(html, /<table\s+dir="ltr"/);
  assert.match(css, /\.government-portraits\s*\{[^}]*direction:\s*ltr/);
  assert.match(css, /\.government-portraits\s*\{[^}]*justify-content:\s*flex-start/);
  assert.match(css, /\.government-portraits\s*\{[^}]*flex-wrap:\s*nowrap/);
  assert.match(css, /@media \(max-width: 639px\)[\s\S]*\.portrait-person img\s*\{[^}]*width:\s*20px/);
  const data = JSON.parse(fs.readFileSync("src/data.json", "utf8"));
  assert.deepEqual(data.years.find(row => row.year === 1403).government.map(person => person.en), [
    "Ebrahim Raisi", "Mohammad Mokhber (acting)", "Masoud Pezeshkian",
  ]);
});

test("compiled app runs as a classic script and registers the Alpine component", async () => {
  const script = fs.readFileSync("scripts/build.mjs", "utf8");
  const options = vm.runInNewContext("(" + script.match(/await build\((\{[\s\S]*?\})\);/)[1] + ")");
  const result = await build({ ...options, write: false });
  let factory;
  vm.runInNewContext(result.outputFiles[0].text, {
    localStorage: { getItem: () => null },
    window: { location: { search: "" } },
    URLSearchParams,
    document: { addEventListener: (_, callback) => callback() },
    Alpine: { data: (_, callback) => (factory = callback) },
    navigator: {},
  });
  assert.equal(typeof factory, "function");
  assert.equal(factory().portrait({ en: "Hassan Rouhani" }), "portraits/hassan-rouhani.jpg");
});
