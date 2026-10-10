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
