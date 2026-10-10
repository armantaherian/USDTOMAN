import fs from "node:fs/promises";

const endpoint = new URL(
  "https://api.tgju.org/v1/market/indicator/summary-table-data/price_dollar_rl",
);
endpoint.search = new URLSearchParams({
  lang: "fa",
  order_col: "timestamp",
  order_dir: "asc",
  start: "0",
  length: "20000",
});

const snapshotPath = process.argv[2];
let history;
if (snapshotPath) {
  history = JSON.parse(await fs.readFile(snapshotPath, "utf8"));
} else {
  const response = await fetch(endpoint, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`TGJU returned HTTP ${response.status}`);
  history = await response.json();
}

if (!Array.isArray(history.data) || !history.data.length) {
  throw new Error(
    "TGJU returned no historical records; existing data is unchanged.",
  );
}
if (
  history.data.length !==
  Number(history.recordsFiltered ?? history.recordsTotal)
) {
  throw new Error("Incomplete TGJU response; existing data is unchanged.");
}

const dataset = JSON.parse(await fs.readFile("src/data.json", "utf8"));
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tehran",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})
  .format(new Date())
  .replaceAll("-", "/");
const rows = history.data.filter((row) => row[6] <= today);
const groups = Map.groupBy(rows, (row) => Number(row[7].slice(0, 4)));
const price = (value) => {
  const result = Number(String(value).replaceAll(",", "")) / 10;
  if (!Number.isFinite(result) || result <= 0)
    throw new Error("Invalid TGJU price");
  return result;
};

let updated = 0;
for (const year of dataset.years) {
  // TGJU starts partway through 1390; preserve the earlier source for that year.
  if (year.year < 1391) continue;
  const records = groups.get(year.year);
  if (!records?.length) throw new Error(`Missing records for ${year.year}`);
  year.minimum = Math.min(...records.map((row) => price(row[1])));
  year.maximum = Math.max(...records.map((row) => price(row[2])));
  if (year.minimum > year.maximum) throw new Error("Invalid yearly range");
  year.observations = records.length;
  year.source = "tgju";
  year.resolution = "daily";
  updated++;
}
dataset.latestDate = rows
  .map((row) => row[6])
  .sort()
  .at(-1)
  .replaceAll("/", "-");
dataset.retrievedAt = today.replaceAll("/", "-");
dataset.sources.tgju.dataUrl = endpoint.toString();
await fs.writeFile("src/data.json", JSON.stringify(dataset, null, 2) + "\n");
console.log(
  `Updated ${updated} years through ${dataset.latestDate}; prices converted from rial to toman.`,
);
