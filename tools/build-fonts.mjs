#!/usr/bin/env node
/**
 * 重新產生 assets/fonts/ 底下的子集字型。
 *
 * 什麼時候要跑：改過 index.html 的「顯示文字」之後。
 * 沒跑也不會壞 —— 子集裡沒有的字會用系統字型顯示，只是字體略有差異。
 *
 * 需要先安裝（只要裝一次）：
 *   pip install fonttools brotli
 *
 * 執行：
 *   node tools/build-fonts.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets', 'fonts');
const CACHE = join(ROOT, 'tools', '.cache');

/** 要打包進字型的字重，與 site.css 第 0 節的 @font-face 對應。 */
const FACES = [
  { family: 'Noto Sans TC', weight: 400, out: 'noto-sans-tc-400' },
  { family: 'Noto Sans TC', weight: 700, out: 'noto-sans-tc-700' },
  { family: 'Noto Sans TC', weight: 900, out: 'noto-sans-tc-900' },
];
/** Space Grotesk 只用在數字與英文，直接收整個 Latin 範圍，不必跟著文字重算。 */
const LATIN_FACE = {
  family: 'Space Grotesk',
  weight: 700,
  out: 'space-grotesk-700',
  unicodes: 'U+0020-007E,U+00A0,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2192',
};

/** 除了頁面現有文字之外，多收這些字元當作日後小幅修改的緩衝。 */
const HEADROOM =
  ' !"#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]_' +
  'abcdefghijklmnopqrstuvwxyz{}|~' +
  '「」『』（）〈〉《》【】、。，；：？！…—～·％＄＃＆＊＋－／＝＠✓✕→←↑↓｜';

/** 從 index.html 取出「使用者看得到」的文字（去掉標籤、script、style、註解）。 */
function visibleText() {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  return html
    .slice(html.indexOf('<body'))
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '');
}

/**
 * 抓 Google Fonts 的完整字型檔。用舊版瀏覽器的 User-Agent 請求，
 * Google 才會回傳「未分段」的完整 woff，而不是切成上百塊的 unicode-range 版本。
 */
async function fetchFullFont(family, weight) {
  const cached = join(CACHE, `${family.replace(/\s/g, '')}-${weight}.woff`);
  if (existsSync(cached) && statSync(cached).size > 0) return cached;

  const OLD_UA = 'Mozilla/5.0 (X11; U; Linux i686) AppleWebKit/533 Chrome/5 Safari/533';
  const api = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;
  const css = await (await fetch(api, { headers: { 'user-agent': OLD_UA } })).text();
  const url = css.match(/url\((https:[^)]+)\)/)?.[1];
  if (!url) throw new Error(`找不到 ${family} ${weight} 的字型網址`);

  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  mkdirSync(CACHE, { recursive: true });
  writeFileSync(cached, buf);
  return cached;
}

function subset(src, outName, args) {
  const dest = join(OUT, `${outName}.woff2`);
  execFileSync(
    'python',
    ['-m', 'fontTools.subset', src, `--output-file=${dest}`, '--flavor=woff2',
     '--no-hinting', '--desubroutinize', ...args],
    { stdio: ['ignore', 'ignore', 'inherit'] }
  );
  return { dest, size: statSync(dest).size };
}

const text = visibleText();
const chars = [...new Set((text.replace(/\s/g, '') + HEADROOM).split(''))].sort().join('');
console.log(`頁面文字共 ${chars.length} 個不重複字元（含緩衝字集）`);

mkdirSync(OUT, { recursive: true });
mkdirSync(CACHE, { recursive: true });

const charFile = join(CACHE, 'chars.txt');
writeFileSync(charFile, chars, 'utf8');

let total = 0;
for (const face of FACES) {
  const src = await fetchFullFont(face.family, face.weight);
  const { size } = subset(src, face.out, [`--text-file=${charFile}`, '--layout-features=']);
  total += size;
  console.log(`  ${face.out}.woff2  ${(size / 1024).toFixed(1)} KiB`);
}
{
  const src = await fetchFullFont(LATIN_FACE.family, LATIN_FACE.weight);
  const { size } = subset(src, LATIN_FACE.out, [`--unicodes=${LATIN_FACE.unicodes}`, '--layout-features=kern']);
  total += size;
  console.log(`  ${LATIN_FACE.out}.woff2  ${(size / 1024).toFixed(1)} KiB`);
}
console.log(`合計 ${(total / 1024).toFixed(1)} KiB`);
