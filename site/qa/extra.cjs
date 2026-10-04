// Supplementary QA: contrast, keyboard focus, clipboard, links, language
// switch and basic performance. Run against the preview on :5320.
const { chromium } = require('/Users/sebasbelmos/Downloads/SM/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');

const BASE = 'http://127.0.0.1:5320';
const out = [];
const check = (name, ok, detail) => {
  out.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  ${detail ? JSON.stringify(detail) : ''}`);
};

// WCAG relative luminance and contrast ratio.
const lum = (hex) => {
  const c = hex.replace('#', '').match(/../g).map((h) => parseInt(h, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100;
};

(async () => {
  // 1. Token contrast (text pairs actually used on the page).
  const tokens = fs.readFileSync(path.join(__dirname, '../src/styles/tokens.css'), 'utf8');
  const v = (n) => (tokens.match(new RegExp(`--${n}:\\s*(#[0-9A-Fa-f]{6})`)) || [])[1];
  const pairs = [
    ['ink on paper', v('ink'), v('paper'), 4.5],
    ['ink on grey', v('ink'), v('grey'), 4.5],
    ['ink-2 on paper', v('ink-2'), v('paper'), 4.5],
    ['ink-2 on grey', v('ink-2'), v('grey'), 4.5],
    ['blue on paper (marks, hover underline, focus ring)', v('blue'), v('paper'), 3],
    ['blue on grey (focus ring)', v('blue'), v('grey'), 3],
    ['white on ink (GeoVision, contact)', v('white'), v('ink'), 4.5],
    ['on-ink-2 on ink (contact sub, footer)', v('on-ink-2'), v('ink'), 4.5],
    ['gold on ink (copied feedback, email underline)', v('gold'), v('ink'), 4.5],
    ['paper on ink (archive row hover/focus text and focus ring)', v('paper'), v('ink'), 4.5],
  ];
  for (const [name, fg, bg, min] of pairs) {
    if (!fg || !bg) { check(`contrast: ${name}`, false, { fg, bg, note: 'token missing' }); continue; }
    const r = ratio(fg, bg);
    check(`contrast: ${name}`, r >= min, { fg, bg, ratio: r, min });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  for (const lang of ['es', 'en']) {
    const url = `${BASE}/${lang === 'en' ? 'en/' : ''}`;
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    // 2. Keyboard: the first focusables show a visible focus indicator.
    const focus = [];
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab');
      focus.push(await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el);
        const visible = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2) || s.boxShadow !== 'none';
        return { tag: el.tagName, text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 32), visible };
      }));
    }
    const first = focus[0];
    check(`${lang}: first Tab lands on the skip link`, !!first && /saltar|skip/i.test(first.text), first);
    const missing = focus.filter((f) => f && !f.visible);
    check(`${lang}: focus ring visible on the first 14 stops`, missing.length === 0, missing);

    // 3. mailto and copy-to-clipboard.
    const mail = await page.getAttribute('a.email', 'href');
    check(`${lang}: email link is mailto`, mail === 'mailto:sebasbelmosdev@gmail.com', { mail });
    await page.click('.copy-btn');
    await page.waitForTimeout(300);
    const clip = await page.evaluate(() => navigator.clipboard.readText().catch((e) => `ERR ${e.message}`));
    const status = await page.textContent('[data-copy-status]');
    const statusColor = await page.$eval('[data-copy-status]', (el) => getComputedStyle(el).color);
    const live = await page.$eval('[data-copy-status]', (el) => el.getAttribute('aria-live'));
    check(`${lang}: copy button copies the address and announces "${lang === 'es' ? 'copiado ✓' : 'copied ✓'}" in gold`,
      clip === 'sebasbelmosdev@gmail.com' && status.trim() === (lang === 'es' ? 'copiado ✓' : 'copied ✓') && statusColor === 'rgb(201, 162, 75)' && live === 'polite', { clip, status, statusColor, live });
    await page.waitForTimeout(2200);
    const cleared = await page.textContent('[data-copy-status]');
    check(`${lang}: copied feedback clears after 2s`, cleared.trim() === '', { cleared });
    const btn = await page.$eval('.copy-btn', (b) => { const r = b.getBoundingClientRect(); const i = b.querySelector('svg').getBoundingClientRect(); return { w: r.width, h: r.height, icon: i.width }; });
    check(`${lang}: copy button 44×44 with an 18px icon`, btn.w === 44 && btn.h === 44 && btn.icon === 18, btn);

    // Socials: three monochrome 18px icons with text labels, no boxes.
    const social = await page.$$eval('.contact-social a', (as) => as.map((a) => {
      const cs = getComputedStyle(a); const svg = a.querySelector('svg'); const r = svg.getBoundingClientRect();
      return { label: a.querySelector('.social-label').textContent, icon: [r.width, r.height], fill: svg.querySelector('path').getAttribute('fill'),
        boxed: cs.borderTopStyle !== 'none' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.borderRadius !== '0px', rel: a.rel, size: cs.fontSize };
    }));
    check(`${lang}: socials are LinkedIn, YouTube, GitHub with 18px currentColor icons, unboxed, noopener`,
      social.map((x) => x.label).join() === 'LinkedIn,YouTube,GitHub' && social.every((x) => x.icon[0] === 18 && x.icon[1] === 18 && x.fill === 'currentColor' && !x.boxed && /noopener/.test(x.rel) && x.size === '17px'), social);

    // Underlines are ink at rest and blue on hover.
    const cta = await page.$eval('.hero-cta', (a) => getComputedStyle(a).textDecorationColor);
    await page.hover('.hero-cta');
    await page.waitForTimeout(250);
    const ctaHover = await page.$eval('.hero-cta', (a) => getComputedStyle(a).textDecorationColor);
    const write = await page.$eval('.header-write', (a) => [getComputedStyle(a).color, getComputedStyle(a).textDecorationColor]);
    check(`${lang}: CTA and header link underlines are ink at rest, CTA blue on hover`,
      cta === 'rgb(17, 17, 20)' && ctaHover === 'rgb(48, 67, 158)' && write.every((c) => c === 'rgb(17, 17, 20)'), { cta, ctaHover, write });
    await page.mouse.move(0, 0);

    // Archive row: one link, reachable by Tab, visibly focused, inverted on hover.
    const rowState = () => page.$eval('a.archive-row', (a) => {
      const cs = getComputedStyle(a); const r = a.getBoundingClientRect();
      return { focused: document.activeElement === a, bg: cs.backgroundColor, color: cs.color, outline: [cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.outlineOffset], transition: cs.transitionDuration, h: Math.round(r.height), w: Math.round(r.width), ariaLabel: a.getAttribute('aria-label'), text: a.innerText.replace(/\u2060/g, '').trim(), tag: a.tagName, href: a.getAttribute('href') };
    });
    const rest = await rowState();
    await page.focus('.geo-links a:last-child');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(50);
    const focused = await rowState();
    check(`${lang}: archive row is the next Tab stop after GeoVision, with a paper ring inset on ink`,
      focused.focused && focused.bg === 'rgb(17, 17, 20)' && focused.color === 'rgb(244, 241, 234)' && focused.outline[0] === 'solid' && parseFloat(focused.outline[1]) >= 2 && focused.outline[2] === 'rgb(244, 241, 234)' && parseFloat(focused.outline[3]) < 0, focused);
    // CLOSING-PASS: the accessible name is the visible text (no aria-label).
    const rowName = lang === 'es' ? 'Ver los 11 proyectos' : 'See all 11 projects';
    const byName = await page.getByRole('link', { name: rowName, exact: true }).count();
    check(`${lang}: archive row link: accessible name "${rowName}" from its visible text, href to /work/, target ≥ 64px`,
      rest.tag === 'A' && byName === 1 && rest.ariaLabel === null && rest.text === rowName && rest.href === (lang === 'es' ? '/work/' : '/en/work/') && rest.h >= 64 && rest.w >= 320 && rest.bg === 'rgba(0, 0, 0, 0)', { ...rest, byName });
    await page.keyboard.press('Tab');
    await page.hover('a.archive-row');
    await page.waitForTimeout(50);
    const hovered = await rowState();
    // Reduced motion: no transition, but the state still changes.
    check(`${lang}: archive row turns ink with paper text on hover (reduced motion: instant)`,
      hovered.bg === 'rgb(17, 17, 20)' && hovered.color === 'rgb(244, 241, 234)' && hovered.transition.split(',').every((d) => parseFloat(d) === 0), hovered);
    await page.mouse.move(0, 0);

    // 4. Real links: external targets and the language switch.
    const links = await page.$$eval('a[href]', (as) => as.map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim().slice(0, 40), target: a.target, rel: a.rel })));
    const ext = links.filter((l) => /^https?:/.test(l.href));
    const unsafe = ext.filter((l) => l.target === '_blank' && !/noopener/.test(l.rel));
    check(`${lang}: external links open safely`, unsafe.length === 0, unsafe);
    const required = ['linkedin.com/in/sebasbelmos', 'youtube.com/channel/UCeYaQhjA-N6YVd6RNTdhBeA', 'github.com/SEBASBELMOS', 'geovision-cali-frontend.hf.space', 'GeoVision-CLIP-Cali', 'preply.com'];
    const absent = required.filter((r) => !ext.some((l) => l.href.includes(r)));
    check(`${lang}: real profile and project links present`, absent.length === 0, { absent, external: [...new Set(ext.map((l) => l.href))] });
    const other = lang === 'es' ? '/en/' : '/';
    check(`${lang}: language switch points to ${other}`, links.some((l) => l.href === other), null);
    const hreflang = await page.$$eval('link[rel=alternate][hreflang]', (ls) => ls.map((l) => l.hreflang));
    check(`${lang}: hreflang alternates`, hreflang.includes('es') && hreflang.includes('en'), hreflang);
    const work = links.find((l) => /work\/$/.test(l.href));
    check(`${lang}: archive link present`, !!work, work);

    await ctx.close();
  }

  // 5. Performance on a cold load (local, not field data).
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  let bytes = 0, js = 0;
  page.on('response', async (r) => {
    try {
      const b = (await r.body()).length; bytes += b;
      if (/javascript/.test(r.headers()['content-type'] || '')) js += b;
    } catch {}
  });
  await page.addInitScript(() => {
    window.__lcp = 0; window.__cls = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const perf = await page.evaluate(() => ({ lcp: Math.round(window.__lcp), cls: Math.round(window.__cls * 1000) / 1000, inlineScriptBytes: [...document.scripts].reduce((s, x) => s + (x.src ? 0 : x.textContent.length), 0) }));
  check('mobile cold load: LCP under 2500ms (local)', perf.lcp < 2500, perf);
  check('mobile cold load: CLS under 0.1', perf.cls < 0.1, perf);
  check('initial transfer under 1.5 MB', bytes < 1.5e6, { kb: Math.round(bytes / 1024), externalJsKb: Math.round(js / 1024), inlineScriptKb: Math.round(perf.inlineScriptBytes / 1024) });
  await browser.close();

  fs.writeFileSync(path.join(__dirname, 'extra-results.json'), JSON.stringify(out, null, 2));
  const failed = out.filter((c) => !c.ok).length;
  console.log(`\n${out.length - failed}/${out.length} extra checks passed`);
})();
