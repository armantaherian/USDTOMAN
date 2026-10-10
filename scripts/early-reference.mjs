import fs from 'node:fs';
const file='dist/data.json';
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const url='https://www.khabaronline.ir/news/189536';
const values={1357:10,1358:14,1359:20,1360:27,1361:35,1362:45,1363:58};
for(const row of data.years){if(row.year<=1363){row.source='khabaronline';row.referencePrice=values[row.year];row.resolution='annual-reference';row.minimum=null;row.maximum=null;}}
delete data.sources.legacy;
data.sources.khabaronline={name:'KhabarOnline',url,coverage:'1357–1363 reference rates only; annual extrema are not reported',originalUnit:'toman',articleDate:'1390/09/24'};
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
let html=fs.readFileSync('dist/index.html','utf8');
html=html.replace('<a href="https://github.com/m-ahmadi/dollar" target="_blank" rel="noopener">m-ahmadi / dollar ↗</a>',`<a href="${url}" target="_blank" rel="noopener">KhabarOnline / خبرآنلاین ↗</a>`);
fs.writeFileSync('dist/index.html',html);
