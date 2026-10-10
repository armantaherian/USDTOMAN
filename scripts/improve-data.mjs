import fs from 'node:fs';
const file='dist/data.json';
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const html=fs.readFileSync('netarz-history.html','utf8');
const normalize=s=>s.replace(/<[^>]*>/g,'').replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[,٬،\s]/g,'');
let updated=0;
for(const match of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)){
 const cells=[...match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g)].map(m=>normalize(m[1]));
 const year=Number(cells[0]);
 if(year>=1364&&year<=1390&&cells.length>=5){const row=data.years.find(r=>r.year===year);row.minimum=Number(cells[3]);row.maximum=Number(cells[4]);row.source='netarz';row.resolution=year<=1379?'monthly-average':'daily';delete row.observations;updated++}
}
if(updated!==27)throw Error(`Expected 27 NetArz years, found ${updated}`);
const tgju=JSON.parse(fs.readFileSync('tgju-data.json','utf8'));
if(tgju.data.length!==tgju.recordsTotal)throw Error('Incomplete TGJU download');
const groups=Map.groupBy(tgju.data.filter(r=>r[6]<='2026/10/10'),r=>Number(r[7].slice(0,4)));
for(const [year,entries] of groups){if(year<1391)continue;const values=entries.flatMap(r=>r.slice(0,4).map(v=>Number(v.replaceAll(',',''))/10));if(values.some(v=>!Number.isFinite(v)||v<=0))throw Error('Invalid TGJU price');Object.assign(data.years.find(r=>r.year===year),{minimum:Math.min(...values),maximum:Math.max(...values),observations:entries.length,source:'tgju',resolution:'daily'});}
for(const row of data.years){if(row.year<1364){row.source='legacy';row.resolution='annual-only'}if(row.minimum!==null&&row.minimum>row.maximum)throw Error('Invalid extrema');}
data.latestDate=tgju.data.at(-1)[6].replaceAll('/','-');
data.sources={tgju:{name:'TGJU',url:'https://www.tgju.org/profile/price_dollar_rl/history',originalUnit:'rial',conversion:'Divide by 10 to convert rial to toman',coverage:'1391 onward; 1390 excluded because TGJU begins partway through the year'},netarz:{name:'NetArz',url:'https://netarz.ir/wiki/dollar-price-by-year',originalUnit:'toman',coverage:'1364–1390; monthly averages through 1379, daily records from 1380'},legacy:{name:'m-ahmadi/dollar',url:'https://github.com/m-ahmadi/dollar',coverage:'1357–1363; annual-only observations, extrema unavailable'}};
delete data.source;data.method='TGJU daily OHLC extrema for full covered years; NetArz published annual ranges for earlier years. Monthly-average ranges are not daily extremes. Current year is year-to-date. Annual-only extrema are null.';
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');console.log(`Updated ${updated} earlier years and ${groups.size-1} TGJU years; latest ${data.latestDate}`);
