import { mkdir, writeFile, readFile, copyFile, readdir, unlink, rmdir } from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadGuides } from './content.mjs';
import { renderHome, renderGuide } from '../src/render.mjs';

// Only generated files below this project's dist directory are removed.
const out = path.join(ROOT, 'dist');
async function cleanGenerated(dir) {
  if (!path.resolve(dir).startsWith(`${path.resolve(out)}${path.sep}`) && path.resolve(dir) !== path.resolve(out)) throw new Error('Unsafe output path');
  for (const entry of await readdir(dir, { withFileTypes: true }).catch(error => error.code === 'ENOENT' ? [] : Promise.reject(error))) {
    const target = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error('dist 不可包含符號連結');
    if (entry.isDirectory()) { await cleanGenerated(target); await rmdir(target); }
    else await unlink(target);
  }
}
export async function build() {
  const guides = await loadGuides();
  await cleanGenerated(out);
  await mkdir(path.join(out, 'assets'), { recursive: true });
  for (const [from, to] of [['src/styles.css','assets/styles.css'],['src/app.js','assets/app.js'],['src/favicon.svg','assets/favicon.svg'],['AGENTS.md','AGENTS.md']]) await copyFile(path.join(ROOT, from), path.join(out, to));
  await writeFile(path.join(out, '.nojekyll'), '');
  await writeFile(path.join(out, 'index.html'), renderHome(guides), 'utf8');
  for (const [index, guide] of guides.entries()) {
    const directory = path.join(out, 'guides', guide.slug);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'index.html'), renderGuide(guide, guides, index), 'utf8');
  }
  await writeFile(path.join(out, '404.html'), '<!doctype html><html lang="zh-Hant"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>找不到這一頁｜簡報急救站</title><body style="font:18px/1.8 sans-serif;max-width:40rem;margin:15vh auto;padding:24px;background:#f7f5ef;color:#153f38"><h1>這張簡報，還沒準備好。</h1><p>找不到你要的頁面，請使用瀏覽器返回上一頁，或從原本的網站首頁重新開始。</p></body></html>', 'utf8');
  console.log(`已建置首頁與 ${guides.length} 篇教學 → dist/`);
  return guides;
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.join(ROOT, 'scripts/build.mjs')) await build();
