import fs from 'node:fs';
const raw = JSON.parse(fs.readFileSync('raw-dollar.json', 'utf8')).slice(1);
const rows = raw.filter(r => r[1] <= '20261010');
const groups = Map.groupBy(rows, r => Number(r[0].slice(0,4)));
const years = [...groups].map(([year, entries]) => {
  const prices = entries.flatMap(r => r.slice(2).filter(v => typeof v === 'number' && v > 0));
  return {year, minimum: entries.length > 1 ? Math.min(...prices) : null, maximum: entries.length > 1 ? Math.max(...prices) : null, observations: entries.length};
});
const last = rows.at(-1);
fs.writeFileSync('dist/data.json', JSON.stringify({currency:'USD',unit:'toman',calendar:'persian',retrievedAt:'2026-10-10',latestDate:last[1].replace(/(\d{4})(\d{2})(\d{2})/,'$1-$2-$3'),source:{name:'m-ahmadi/dollar',url:'https://github.com/m-ahmadi/dollar',dataUrl:'https://m-ahmadi.github.io/dollar/data/dollar.json'},method:'Minimum and maximum across available open/high/low/close observations. Single-observation years have unknown extrema. Coverage varies by year.',years},null,2)+'\n');
console.log(`${years.length} years; latest ${last[1]}; ${rows.length} observations`);
