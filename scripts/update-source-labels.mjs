import fs from 'node:fs';
let js=fs.readFileSync('dist/app.js','utf8');
js=js.replace(/note:'— یعنی[^']*'/,"note:'۱۳۶۴ تا ۱۳۷۹: کمترین و بیشترین میانگین ماهانه، نه نوسان روزانه. از ۱۳۸۰: داده‌های روزانه. — یعنی فقط دادهٔ سالانه موجود است. سال جاری تا آخرین دادهٔ موجود محاسبه شده است.'");
js=js.replace(/note:'— means[^']*'/,"note:'1364–1379: ranges of monthly averages, not daily extremes. From 1380: daily records. — means only an annual observation is available. The current year covers available data to date.'");
fs.writeFileSync('dist/app.js',js);
let html=fs.readFileSync('dist/index.html','utf8');
html=html.replace('<a href="https://github.com/m-ahmadi/dollar" target="_blank" rel="noopener">m-ahmadi / dollar ↗</a>','<a href="https://www.tgju.org/profile/price_dollar_rl/history" target="_blank" rel="noopener">TGJU ↗</a> · <a href="https://netarz.ir/wiki/dollar-price-by-year" target="_blank" rel="noopener">NetArz / نِت اَرز ↗</a> · <a href="https://github.com/m-ahmadi/dollar" target="_blank" rel="noopener">m-ahmadi / dollar ↗</a>');
fs.writeFileSync('dist/index.html',html);
