import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const CATEGORIES = ['內容精簡', '色彩整理', '視覺層次'];
export const DEMOS = ['text', 'color', 'hierarchy'];
const count = text => [...text].length;

export function validateGuide(g, filename, seen = { slugs: new Set(), orders: new Set() }) {
  const fail = message => { throw new Error(`${filename}: ${message}`); };
  const string = (value, label, min = 1, max = 300) => {
    if (typeof value !== 'string' || value.trim() !== value || count(value) < min || count(value) > max || /[<>]/.test(value)) fail(`${label} 必須為 ${min}–${max} 字的純文字`);
  };
  if (!g || typeof g !== 'object' || Array.isArray(g)) fail('教學必須為 JSON 物件');
  string(g.slug, 'slug');
  if (!/^[a-z]+(?:-[a-z0-9]+)*$/.test(g.slug) || filename !== `${g.slug}.json`) fail('slug 必須符合 kebab-case 並與檔名一致');
  if (seen.slugs.has(g.slug)) fail('slug 重複');
  if (!Number.isInteger(g.order) || g.order < 1 || seen.orders.has(g.order)) fail('order 必須為未使用的正整數');
  if (!CATEGORIES.includes(g.category)) fail('category 不在既有分類中');
  if (!DEMOS.includes(g.demoKind)) fail('demoKind 不在既有樣式中');
  if (!Number.isInteger(g.minutes) || g.minutes < 1 || g.minutes > 30) fail('minutes 必須介於 1–30');
  string(g.title, 'title', 3, 40);
  string(g.summary, 'summary', 35, 100);
  string(g.diagnosis, 'diagnosis', 60, 180);
  if (!Array.isArray(g.tags) || g.tags.length < 2 || g.tags.length > 4 || new Set(g.tags).size !== g.tags.length) fail('tags 必須含 2–4 個不同標籤');
  g.tags.forEach(tag => string(tag, 'tag', 1, 16));
  for (const state of ['before', 'after']) {
    const slide = g[state];
    if (!slide || typeof slide !== 'object') fail(`${state} 缺少簡報內容`);
    string(slide.eyebrow, `${state}.eyebrow`, 1, 40);
    string(slide.title, `${state}.title`, 1, 60);
    string(slide.note, `${state}.note`, 1, 120);
    if (!Array.isArray(slide.body) || slide.body.length < 1 || slide.body.length > 4) fail(`${state}.body 需要 1–4 段文字`);
    slide.body.forEach(value => string(value, `${state}.body`, 1, 240));
  }
  if (!Array.isArray(g.steps) || g.steps.length !== 3) fail('必須有三個步驟');
  g.steps.forEach((step, i) => { string(step.title, `steps[${i}].title`, 2, 36); string(step.body, `steps[${i}].body`, 60, 180); });
  if (!Array.isArray(g.checklist) || g.checklist.length !== 4 || new Set(g.checklist).size !== 4) fail('必須有四個不同的檢查條件');
  g.checklist.forEach(value => string(value, 'checklist', 4, 80));
  if (!g.practice) fail('缺少 practice');
  string(g.practice.title, 'practice.title', 2, 50);
  string(g.practice.body, 'practice.body', 15, 200);
  seen.slugs.add(g.slug); seen.orders.add(g.order);
  return g;
}

export async function loadGuides(directory = path.join(ROOT, 'content/guides')) {
  const files = (await readdir(directory)).filter(name => name.endsWith('.json')).sort();
  if (!files.length) throw new Error('至少需要一篇教學');
  const seen = { slugs: new Set(), orders: new Set() };
  const guides = [];
  for (const filename of files) {
    let g;
    try { g = JSON.parse((await readFile(path.join(directory, filename), 'utf8')).replace(/^\uFEFF/, '')); }
    catch (error) { throw new Error(`${filename}: JSON 讀取失敗：${error.message}`); }
    guides.push(validateGuide(g, filename, seen));
  }
  return guides.sort((a, b) => a.order - b.order);
}
