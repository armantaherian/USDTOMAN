import fs from 'node:fs';
const file='dist/app.js';
let source=fs.readFileSync(file,'utf8');
source=source.replace("$('language').textContent=lang==='fa'?'English':'فارسی';", "$('language').textContent='◎';$('language').setAttribute('aria-label',lang==='fa'?'English':'فارسی');$('language').title=lang==='fa'?'English':'فارسی';");
source=source.replace("$('theme').textContent=t[theme==='dark'?'light':'dark'];", "$('theme').textContent=theme==='dark'?'☀':'☾';$('theme').setAttribute('aria-label',t[theme==='dark'?'light':'dark']);$('theme').title=t[theme==='dark'?'light':'dark'];");
fs.writeFileSync(file,source);
