import fs from 'node:fs';
let html=fs.readFileSync('dist/index.html','utf8').replace('<span id="updated"></span>','');
fs.writeFileSync('dist/index.html',html);
let js=fs.readFileSync('dist/app.js','utf8').replace("$('updated').textContent=t.updated+' '+date(data.retrievedAt);",'');
fs.writeFileSync('dist/app.js',js);
