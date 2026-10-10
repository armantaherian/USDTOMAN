import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
fs.copyFileSync('node_modules/alpinejs/dist/cdn.min.js','dist/alpine.min.js');
const result=spawnSync(process.execPath,['node_modules/@tailwindcss/cli/dist/index.mjs','-i','src/styles.css','-o','dist/style.css','--minify'],{stdio:'inherit'});
process.exit(result.status??1);
