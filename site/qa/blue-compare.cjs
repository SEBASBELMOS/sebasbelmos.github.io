// LAST-PASS §10: the hero strike and the Preply underline at 1440, in the
// previous blue (#2230C4) and the candidate (#30439E), side by side.
// Usage: node qa/blue-compare.cjs  → qa/shots/blue-compare.png
const path = require('path');
const { chromium } = require('/Users/sebasbelmos/Downloads/SM/node_modules/playwright');

const BASE = process.env.QA_BASE || 'http://127.0.0.1:5320';
const BLUES = [['Current #2230C4', '#2230C4'], ['Candidate #30439E', '#30439E']];
const PAD = 16;

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: '.site-header{position:relative!important}' });
  const box = (sel) => page.$eval(sel, (e, pad) => {
    const r = e.getBoundingClientRect();
    return { x: Math.max(0, r.left - pad), y: r.top + scrollY - pad, width: Math.min(innerWidth, r.width + pad * 2), height: r.height + pad * 2 };
  }, PAD);
  const clips = { strike: await box('.hero-struck .marked--strike'), under: await box('.why-quote blockquote') };
  const shots = [];
  for (const [label, hex] of BLUES) {
    await page.evaluate((hex) => document.documentElement.style.setProperty('--blue', hex), hex);
    await page.waitForTimeout(100);
    const row = { label };
    for (const [k, clip] of Object.entries(clips)) {
      row[k] = (await page.screenshot({ fullPage: true, clip })).toString('base64');
    }
    shots.push(row);
  }
  const cell = (b64) => `<img src="data:image/png;base64,${b64}">`;
  await page.setContent(`<!doctype html><style>
    body{margin:0;padding:32px;background:#fff;font:600 15px/1.4 system-ui,sans-serif;color:#111114}
    .grid{display:inline-grid;grid-template-columns:repeat(3,auto);gap:16px 24px;align-items:center;justify-content:start;padding:24px;background:#fff}
    h2{margin:0;font-size:15px} img{display:block;border:1px solid #CFCBC2}
  </style><div class="grid">
    ${shots.map((s) => `<h2>${s.label}</h2>${cell(s.strike)}${cell(s.under)}`).join('')}
  </div>`);
  await page.setViewportSize({ width: 2000, height: 900 });
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
  await page.waitForTimeout(200);
  // Images are 2x captures; show them at their CSS size.
  await page.$$eval('img', (imgs) => imgs.forEach((i) => { i.style.width = i.naturalWidth / 2 + 'px'; }));
  await page.locator('.grid').screenshot({ path: path.join(__dirname, 'shots', 'blue-compare.png') });
  await browser.close();
  console.log('qa/shots/blue-compare.png written');
})();
