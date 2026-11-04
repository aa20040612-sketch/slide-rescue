import { readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { ROOT, validateGuide } from './content.mjs';
import { build } from './build.mjs';

const guides = await build();
const template = JSON.parse((await readFile(path.join(ROOT, 'templates/guide.json'), 'utf8')).replace(/^\uFEFF/, ''));
validateGuide(template, `${template.slug}.json`);
const out = path.resolve(ROOT, 'dist');
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name.endsWith('.html')) files.push(file);
  }
}
await walk(out);
const documents = new Map(await Promise.all(files.map(async file => [file, await readFile(file, 'utf8')])));
let linkCount = 0;
for (const [file, html] of documents) {
  if (!html.includes('lang="zh-Hant"') || !html.includes('name="viewport"')) throw new Error(`${file}: 缺少語言或響應式設定`);
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) throw new Error(`${file}: 必須恰好有一個 h1`);
  if (file.includes(`${path.sep}guides${path.sep}`)) {
    for (const id of ['problem','before','steps','after','checklist']) if (!html.includes(`id="${id}"`)) throw new Error(`${file}: 缺少 ${id} 區段`);
    if ((html.match(/data-check="/g) || []).length !== 4) throw new Error(`${file}: 檢查清單數量錯誤`);
  }
  for (const [, reference] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:)/.test(reference)) continue;
    if (/^[a-z]+:/i.test(reference) || reference.startsWith('/')) throw new Error(`${file}: 不支援的非相對連結 ${reference}`);
    const [pathname, fragment] = reference.split('#');
    let target = pathname ? path.resolve(path.dirname(file), decodeURIComponent(pathname)) : file;
    if (pathname?.endsWith('/')) target = path.join(target, 'index.html');
    if (target !== out && !target.startsWith(`${out}${path.sep}`)) throw new Error(`${file}: 連結超出網站目錄`);
    let targetBody;
    try { targetBody = documents.get(target) ?? await readFile(target, 'utf8'); }
    catch { throw new Error(`${file}: 失效連結 ${reference}`); }
    if (fragment && !targetBody.includes(`id="${fragment}"`)) throw new Error(`${file}: 找不到錨點 ${reference}`);
    linkCount++;
  }
}
for (const script of ['src/app.js','src/render.mjs','scripts/content.mjs','scripts/build.mjs','scripts/serve.mjs']) {
  const check = spawnSync(process.execPath, ['--check', path.join(ROOT, script)], { encoding:'utf8' });
  if (check.status !== 0) throw new Error(check.stderr);
}
console.log(`檢查通過：${guides.length} 篇教學、${documents.size} 個 HTML 頁面、${linkCount} 個站內連結與資源；新增範本及 JavaScript 語法有效。`);
