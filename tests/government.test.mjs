import test from "node:test";
import assert from "node:assert/strict";
import { governmentForYear, primaryGovernmentPerson, organizationNodes } from "../src/government.js";
import fs from "node:fs";

test("government tree includes both officeholders in a transition year", () => {
  const records = [
    { role: "finance", fa: "الف", en: "A", startYear: 1400, endYear: 1403 },
    { role: "finance", fa: "ب", en: "B", startYear: 1403, endYear: 1404 },
    { role: "finance", fa: "ج", en: "C", startYear: 1404, endYear: 1405 },
  ];
  assert.deepEqual(governmentForYear(1403, records)[0].members.map(p => p.en), ["A", "B"]);
  assert.deepEqual(governmentForYear(1402, records)[0].members.map(p => p.en), ["A"]);
  assert.deepEqual(governmentForYear(1399, records), []);
});

test("repeated cabinet entries do not duplicate a person in the same role", () => {
  const record = { role: "finance", fa: "الف", en: "A", startYear: 1400, endYear: 1403 };
  assert.equal(governmentForYear(1403, [record, record])[0].members.length, 1);
});

test("cabinet snapshot covers every displayed year with finance and Central Bank roles", () => {
  const snapshot = JSON.parse(fs.readFileSync("src/government.json", "utf8"));
  const prices = JSON.parse(fs.readFileSync("src/data.json", "utf8"));
  for (const { year } of prices.years) {
    const tree = governmentForYear(year, snapshot.records);
    assert.ok(tree.some(node => node.role === "رئیس کل بانک مرکزی"), String(year));
    assert.ok(tree.some(node => node.role === "وزیر امور اقتصادی و دارایی"), String(year));
  }
  for (const record of snapshot.records) {
    assert.ok(record.startYear <= record.endYear);
    assert.ok(record.fa && record.en && snapshot.roles[record.role]);
  }
});

test("one portrait represents the leader serving longest during the Persian year", () => {
  const rows = JSON.parse(fs.readFileSync("src/data.json", "utf8")).years;
  const leaders = JSON.parse(fs.readFileSync("src/leadership.json", "utf8")).terms;
  const expected = {
    1358: "Mehdi Bazargan (interim)",
    1360: "Ali Khamenei",
    1368: "Akbar Hashemi Rafsanjani",
    1376: "Mohammad Khatami",
    1384: "Mahmoud Ahmadinejad",
    1392: "Hassan Rouhani",
    1400: "Ebrahim Raisi",
    1403: "Masoud Pezeshkian",
  };
  for (const [year, en] of Object.entries(expected)) {
    assert.equal(primaryGovernmentPerson(rows.find(row => row.year === Number(year)), leaders).en, en);
  }
  assert.equal(primaryGovernmentPerson(rows.find(row => row.year === 1402), leaders).en, "Ebrahim Raisi");
});

test("organization-chart nodes connect all ministries directly to one root", () => {
  const root = { label: "President", names: "A" };
  const groups = [{ role: "finance", label: "Finance", members: [{ en: "B" }] }, { role: "health", label: "Health", members: [{ en: "C" }] }];
  const nodes = organizationNodes(root, groups, "en");
  assert.equal(nodes[0].parentId, null);
  assert.equal(nodes.length, 3);
  assert.ok(nodes.slice(1).every(node => node.parentId === nodes[0].id));
  assert.equal(nodes[1].names, "B");
});
