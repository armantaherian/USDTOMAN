import fs from 'node:fs';
const html=fs.readFileSync('dist/index.html','utf8').replace('<label><span id="sortLabel">','<div class="sort-controls"><label><span id="sortLabel">').replace('<button id="direction" type="button"></button></div>','<button id="direction" type="button"></button></div></div>');
fs.writeFileSync('dist/index.html',html);
const js=fs.readFileSync('dist/app.js','utf8').replace("$('direction').textContent=t[ascending?'asc':'desc'];","$('direction').textContent=ascending?'↑':'↓';$('direction').setAttribute('aria-label',t[ascending?'asc':'desc']);$('direction').title=t[ascending?'asc':'desc'];");
fs.writeFileSync('dist/app.js',js);
