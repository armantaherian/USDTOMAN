import fs from 'node:fs';
const file='dist/data.json';
const data=JSON.parse(fs.readFileSync(file,'utf8'));
for(const row of data.years){if(row.referencePrice!==undefined){row.minimum=row.referencePrice;row.maximum=row.referencePrice;row.resolution='annual-reference-repeated';}}
data.method+=' Per user preference, annual-only reference rates are repeated in both minimum and maximum columns; these are not independently measured extrema.';
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
let js=fs.readFileSync('dist/app.js','utf8');
js=js.replace("'sortLabel','yearHeading','minHeading','maxHeading','sourceLabel'","'sortLabel','yearHeading','sourceLabel'");
js=js.replace("$('language').textContent=", "for(const [id,key] of [['minHeading','minimum'],['maxHeading','maximum']]){const unit=document.createElement('small');unit.textContent=lang==='fa'?' (تومان)':' (toman)';$(id).replaceChildren(document.createTextNode(lang==='fa'?(key==='minimum'?'کمترین':'بیشترین'):(key==='minimum'?'Minimum':'Maximum')),unit);}$('language').textContent=");
fs.writeFileSync('dist/app.js',js);
