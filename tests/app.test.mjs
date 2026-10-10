import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { build } from "esbuild";
import { governmentForYear, primaryGovernmentPerson } from "../src/government.js";

function createApp(saved = {}, intl = Intl) {
  let factory;
  const portraits = JSON.parse(fs.readFileSync("src/portraits.json", "utf8"));
  const governmentData = JSON.parse(fs.readFileSync("src/government.json", "utf8"));
  const leadership = JSON.parse(fs.readFileSync("src/leadership.json", "utf8"));
  const root = { dataset: {} };
  const source = fs.readFileSync("src/app.js", "utf8").replace(/^import .*;\r?\n/gm, "");
  vm.runInNewContext(source, {
    Intl: intl,
    portraits,
    governmentData,
    governmentForYear,
    primaryGovernmentPerson,
    leadership,
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

test("English mode uses English digits for years, prices, conversions, multipliers, and dates", () => {
  const { app } = createApp({ language: "en" });
  assert.equal(app.formatYear(1405), "1405");
  assert.equal(app.formatPrice(146980), "146,980");
  assert.equal(app.tomanValue(100), "10,000");
  assert.equal(app.priceMultiplier({ minimum: 100, maximum: 225 }), "(2.25×)");
  assert.ok(!/[۰-۹٠-٩]/.test(app.formatDate("2026-10-08")));
});

test("data age uses Tehran calendar days and localized digits", () => {
  const { app } = createApp();
  assert.equal(app.daysAgo("2026-10-08", new Date("2026-10-10T12:00:00Z")), "۲ روز پیش");
  app.toggleLanguage();
  assert.equal(app.daysAgo("2026-10-08", new Date("2026-10-10T12:00:00Z")), "2 days ago");
  assert.equal(app.daysAgo("2026-10-09", new Date("2026-10-09T21:00:00Z")), "1 day ago");
  assert.equal(app.daysAgo("2026-10-10", new Date("2026-10-10T12:00:00Z")), "0 days ago");
});

test("formatting repeated prices reuses formatters while supporting language changes", () => {
  let created = 0;
  const { app } = createApp({}, {
    NumberFormat: function (...args) { created++; return new Intl.NumberFormat(...args); },
    DateTimeFormat: Intl.DateTimeFormat,
  });
  for (let i = 0; i < 100; i++) app.formatPrice(1000);
  app.toggleLanguage();
  for (let i = 0; i < 100; i++) assert.equal(app.formatPrice(1000), "1,000");
  assert.equal(created, 2);
});

test("government tree shows finance transitions and the Central Bank governor for the selected year", () => {
  const { app } = createApp({ language: "en" });
  app.governmentYear = 1403;
  const finance = app.governmentTree.find(node => node.role === "وزیر امور اقتصادی و دارایی");
  assert.ok(finance.members.some(person => person.en === "Ehsan Khandozi"));
  assert.ok(finance.members.some(person => person.en === "Abdolnaser Hemmati"));
  const bank = app.governmentTree.find(node => node.role === "رئیس کل بانک مرکزی");
  assert.equal(bank.members[0].en, "Mohammad Reza Farzin");
  assert.ok(!app.governmentMinisters.some(node => node.role === "رئیس کل بانک مرکزی"));
  assert.equal(app.centralBankTree.members[0].en, "Mohammad Reza Farzin");
  assert.equal(app.formatTermDate("۳۱ مرداد ۱۴۰۳"), "31 Mordad 1403");
});

test("selecting a person updates their detail panel and localizes the role", () => {
  const { app } = createApp({ language: "en" });
  app.governmentYear = 1403;
  const bank = app.centralBankTree.members[0];
  app.selectGovernmentPerson(bank);
  assert.equal(app.selectedGovernmentPerson.en, "Mohammad Reza Farzin");
  assert.equal(app.selectedPersonRole, "Central Bank Governor");
  app.toggleLanguage();
  assert.equal(app.selectedPersonRole, "رئیس کل بانک مرکزی");
  const finance = app.governmentMinisters.find(node => node.role === "وزیر امور اقتصادی و دارایی").members[0];
  app.selectGovernmentPerson(finance);
  assert.equal(app.selectedGovernmentPerson.en, finance.en);
  assert.equal(app.selectedGovernmentPerson.source, finance.source);
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
  assert.equal(factory().portrait({ en: "Hassan Rouhani" }), "portraits/hassan-rouhani-illustrated.webp");
});
