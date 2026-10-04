// QA for Round 3 "La pluma" (closing pass). Serve dist first (astro preview --port 5320).
// Usage: node qa/run.cjs [round]   → screenshots in qa/shots/, results in qa/results.json
const fs = require('fs');
const path = require('path');
const { chromium } = require('/Users/sebasbelmos/Downloads/SM/node_modules/playwright');

const BASE = process.env.QA_BASE || 'http://127.0.0.1:5320';
const OUT = path.join(__dirname, 'shots');
// Section captures: [file name, selector]. #casos is now the heading that opens Bilbao2.
// A pair [from, to] clips from the top of the first to the bottom of the second.
const SECTIONS = [['inicio', '#inicio'], ['realidad', '#realidad'], ['tesis', '#tesis'], ['bilbao2', 'section.bilbao'], ['betterlife', '#betterlife'], ['geovision', '#geovision'], ['archivo', '#archivo'], ['proceso', '#proceso'], ['sobre-mi', '#sobre-mi'], ['ensenanza', '.why-teach'], ['proceso-sobre-mi', ['#proceso', '#sobre-mi']], ['contacto', '#contacto'], ['contacto-footer', ['#contacto', '.site-footer']], ['footer', '.site-footer']];
// CLOSING-PASS strings that must be visible (innerText; curly apostrophes as in i18n.ts).
const NEW_STRINGS = {
  es: ['Demasiadas cosas pasan por ti.', 'Ayudo a fundadores de negocios digitales a conectar herramientas, datos y procesos para reducir trabajo manual y ordenar la operación.', 'Educación online · coaching · mentorías · productos digitales', 'Si todo vuelve a ti, la operación depende demasiado de ti.', 'Primero entiendo dónde se rompe el flujo. Después vemos si hace falta automatizar, integrar herramientas, mejorar reportes o construir una herramienta interna.', 'De contenido a producto y datos.', 'Ver los 11 proyectos', 'Después decidimos por dónde empezar.', 'Antes de tocar una herramienta, definimos qué está quitando tiempo, qué debería cambiar y cómo sabremos si mejoró.', 'Conecto la parte técnica con la forma en que trabaja el equipo.', 'Entiendo cómo trabaja el equipo, cómo se mueve la información y dónde tiene sentido automatizar, conectar datos o construir una herramienta. Así puedo entender el problema completo sin perder el contexto entre una parte y otra.', 'También llevo años enseñando.', 'Dar clases me entrenó para escuchar, adaptarme a la persona que tengo delante y explicar temas complejos con claridad.'],
  en: ['Too much still has to go through you.', 'I help founders of digital businesses connect tools, data and workflows to reduce manual work and make the business easier to run.', 'Online education · coaching · mentoring · digital products', 'If everything comes back to you, the business still depends too heavily on you.', 'First I work out where the workflow breaks. Then we decide whether it needs automation, better integrations, clearer reporting or an internal tool.', 'From content to product and data.', 'See all 11 projects', 'Then we decide where to start.', 'Before we touch any tools, we work out what is taking up time, what should change and how we’ll know the change worked.', 'I connect the technical side with the way the team actually works.', 'I look at how the team works, how information moves and where it makes sense to automate, connect data or build a tool. That lets me see the whole problem without losing context between the pieces.', 'I’ve also been teaching for years.', 'Teaching trained me to listen, adapt to the person in front of me and explain complex topics clearly.'],
};
// Retired copy: none of it may appear in the visible text of either language
// (case-insensitive, since labels render uppercase). The thesis no longer says
// "vale la pena construir"; "Cali, Colombia" is checked in About only.
const RETIRED = [/todo pasaba/i, /everything went/i, /con foco en/i, /más trabajo/i, /more work/i, /un problema rara vez/i, /explicar también es parte/i,
  /último semestre/i, /final semester/i, /data & ai engineering/i, /decidimos qué construir/i, /vale la pena construir/i, /worth building/i, /1 flujo/i,
  /todo pasa por ti/i, /everything goes through you/i, /trabajo entre la operación/i, /i work between operations/i,
  /esa misma habilidad/i, /the same skill matters/i,
  /write to me/i, /escríbeme/i, /personal-finance/i, /project-based/i, /cliente por proyecto/i, /too many things go/i, /743/, /750\+/];
// Guardrail #24: no pricing, packages, commitments, rates or service bundles.
const PRICING = /\b(precios?|paquetes?|tarifas?|planes de|pricing|prices?|packages?|rates?|bundles?)\b|[$€]\s?\d/i;
// Exactly two gestures remain on the homepage. The strike has one render per
// wrapped line on phones; renders of one gesture count as one mark.
const MARKS = ['strike', 'under'];
// Section grounds in order (FINAL-PASS colour table).
const PAPER = 'rgb(244, 241, 234)', GREY = 'rgb(236, 235, 231)', INK = 'rgb(17, 17, 20)';
const GROUNDS = [['inicio', PAPER], ['realidad', GREY], ['tesis', PAPER], ['bilbao2', PAPER], ['betterlife', GREY], ['geovision', INK], ['archivo', PAPER], ['proceso', GREY], ['sobre-mi', PAPER], ['contacto', INK], ['footer', INK]];
// Visible-text and surface checks shared by every page (runs in the page).
const PAGE_AUDIT = () => {
  // Pen blue, current candidate (#30439E) and previous (#2230C4): never a surface.
  const BLUES = ['rgb(48, 67, 158)', 'rgb(34, 48, 196)'], GOLD = 'rgb(201, 162, 75)';
  const all = [...document.querySelectorAll('body, body *')];
  const bg = (...c) => all.filter((el) => c.includes(getComputedStyle(el).backgroundColor)).map((el) => el.id || el.className || el.tagName);
  const footer = document.querySelector('.site-footer');
  const fLinks = [...footer.querySelectorAll('a')];
  return {
    emDash: (document.body.innerText.match(/.{0,30}\u2014.{0,30}/g) || []),
    cobalt: bg(...BLUES),
    gold: bg(GOLD),
    footer: {
      text: footer.innerText.trim(),
      links: fLinks.length,
      labelled: fLinks.every((a) => a.getAttribute('aria-label') && a.querySelector('svg') && !a.textContent.trim() && /noopener/.test(a.rel)),
      lang: footer.querySelectorAll('[hreflang], .lang-switch, .footer-lang').length,
      bg: getComputedStyle(footer).backgroundColor,
    },
  };
};
const LANGS = { es: '/', en: '/en/' };
fs.mkdirSync(OUT, { recursive: true });

const results = { base: BASE, date: new Date().toISOString(), checks: [], pages: [] };
const check = (name, pass, detail) => {
  results.checks.push({ name, pass: !!pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + JSON.stringify(detail) : ''}`);
};

async function launch() {
  try { return await chromium.launch({ channel: 'chrome', headless: true }); }
  catch { return chromium.launch({ headless: true }); }
}

function watch(page, bucket) {
  page.on('console', (m) => { if (m.type() === 'error') bucket.console.push(m.text()); });
  page.on('pageerror', (e) => bucket.console.push(String(e)));
  page.on('requestfailed', (r) => bucket.failed.push(`${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => { if (r.status() >= 400) bucket.failed.push(`${r.url()} ${r.status()}`); });
}

async function settle(page, motion) {
  await page.evaluate(() => document.fonts.ready);
  if (motion) {
    // Walk the page so every on-view mark draws, then return to the top.
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    const vh = page.viewportSize().height;
    for (let y = 0; y < h; y += Math.round(vh * 0.6)) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
      await page.waitForTimeout(220);
    }
    await page.waitForTimeout(1400);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForTimeout(1300);
  } else {
    await page.waitForTimeout(300);
  }
}

// Lazy images: walk the page in steps, return to the top, then wait until
// every rendered image has decoded.
async function loadImages(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = page.viewportSize().height;
  for (let y = 0; y < h; y += Math.round(vh * 0.8)) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForFunction(() => [...document.images]
    .filter((i) => i.getClientRects().length)
    .every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 15000 }).catch(() => {});
  return page.evaluate(() => [...document.images].filter((i) => i.getClientRects().length && !(i.complete && i.naturalWidth > 0)).map((i) => i.src));
}

const overflow = (page) => page.evaluate(() => ({
  scrollWidth: document.scrollingElement.scrollWidth,
  innerWidth: window.innerWidth,
}));

async function homeRun(browser, motionMode) {
  const motion = motionMode === 'no-preference';
  const tag = motion ? 'motion' : 'reduced';
  for (const [lang, url] of Object.entries(LANGS)) {
    for (const vp of [
      { width: 1440, height: 900, sections: true },
      { width: 390, height: 844, sections: true },
      { width: 360, height: 800 },
      { width: 1024, height: 768 },
      { width: 1280, height: 800, noShot: true },
      { width: 1600, height: 900, noShot: true },
    ]) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: motionMode, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const bucket = { console: [], failed: [] };
      watch(page, bucket);
      await page.goto(BASE + url, { waitUntil: 'networkidle' });
      const label = `${tag} ${lang} ${vp.width}`;

      // First-viewport checks before any scrolling.
      if (vp.width === 390) {
        await page.evaluate(() => document.fonts.ready);
        const fold = await page.evaluate(() => {
          const r = (s) => document.querySelector(s).getBoundingClientRect();
          return { support: Math.round(r('.hero-support').bottom), cta: Math.round(r('.hero-cta').bottom), vh: innerHeight };
        });
        check(`${label}: supporting copy + CTA above 844px`, fold.support <= fold.vh && fold.cta <= fold.vh, fold);
      }
      if (vp.width === 1440) {
        await page.evaluate(() => document.fonts.ready);
        const fold = await page.evaluate(() => {
          const r = (s) => document.querySelector(s).getBoundingClientRect();
          const struck = document.querySelector('.hero-struck-line');
          const cs = getComputedStyle(struck);
          const before = getComputedStyle(document.querySelector('.hero-before'));
          // Stem of the struck text: the ink width of an "l" in its font.
          const c = document.createElement('canvas').getContext('2d');
          c.font = `${cs.fontWeight} ${cs.fontSize} "Mona Sans"`;
          c.fontStretch = 'expanded';
          const m = c.measureText('l');
          const strike = document.querySelector('.mark--strike.strike-whole');
          const scale = strike.getBoundingClientRect().height / strike.viewBox.baseVal.height;
          return {
            struckLines: Math.round(r('.hero-struck-line').height / parseFloat(cs.fontSize) / parseFloat(cs.lineHeight) * parseFloat(cs.fontSize)),
            struckSize: parseFloat(cs.fontSize),
            struckWeight: cs.fontWeight,
            h1Size: parseFloat(getComputedStyle(document.querySelector('.hero-title')).fontSize),
            before: document.querySelector('.hero-before').innerText.trim(),
            beforeStyle: [before.fontSize, before.textTransform, before.letterSpacing],
            stem: +(m.actualBoundingBoxLeft + m.actualBoundingBoxRight).toFixed(2),
            nib: +Math.max(...[...strike.querySelectorAll('.mark-ink')].map((p) => +p.dataset.nib * scale)).toFixed(2),
            strokes: strike.querySelectorAll('.mark-ink').length,
            cta: Math.round(r('.hero-cta').bottom), vh: innerHeight,
            heroMinHeight: getComputedStyle(document.querySelector('.hero-grid')).minHeight,
          };
        });
        check(`${label}: "EL PROBLEMA/THE PROBLEM" label 14px uppercase, struck line on 1 line, promise and CTA in first 900px`,
          /^(EL PROBLEMA|THE PROBLEM)$/.test(fold.before) && fold.beforeStyle[0] === '14px' && fold.beforeStyle[1] === 'uppercase' && fold.struckLines === 1 && fold.cta <= fold.vh, fold);
        check(`${label}: promise 96–116px, struck line 52–66px at weight 760 (about 40% smaller)`,
          fold.h1Size >= 96 && fold.h1Size <= 116 && fold.struckSize >= 52 && fold.struckSize <= 66 && fold.struckWeight === '760' && fold.struckSize / fold.h1Size >= .5 && fold.struckSize / fold.h1Size <= .65,
          { h1: fold.h1Size, struck: fold.struckSize, ratio: +(fold.struckSize / fold.h1Size).toFixed(2), weight: fold.struckWeight });
        check(`${label}: strike is 1–2 strokes, no thicker than the struck stem (≤ 75%)`,
          fold.strokes >= 1 && fold.strokes <= 2 && fold.nib <= fold.stem * .75, { nib: fold.nib, stem: fold.stem, pct: Math.round(fold.nib / fold.stem * 100), strokes: fold.strokes });
        check(`${label}: hero not forced to the viewport height`, fold.heroMinHeight === 'auto' || fold.heroMinHeight === '0px', { minHeight: fold.heroMinHeight });
      }
      await settle(page, motion);
      const unloaded = await loadImages(page);
      check(`${label}: every rendered image loaded`, unloaded.length === 0, unloaded);

      const ov = await overflow(page);
      check(`${label}: no horizontal overflow`, ov.scrollWidth <= ov.innerWidth, ov);

      const geo = await page.evaluate(() => {
        const hdr = document.querySelector('.header-row');
        const last = hdr.lastElementChild.getBoundingClientRect();
        const h1 = document.querySelector('.hero-title');
        const lines = [...h1.querySelectorAll('.line')].map((l) => { const r = document.createRange(); r.selectNodeContents(l); return Math.round(r.getBoundingClientRect().right); });
        const content = h1.getBoundingClientRect().right;
        const small = [...document.querySelectorAll('body *')].filter((el) => {
          if (!el.childNodes.length || el.closest('.sr-only, svg')) return false;
          const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          if (!hasText) return false;
          const cs = getComputedStyle(el);
          return cs.display !== 'none' && cs.visibility !== 'hidden' && el.getClientRects().length && parseFloat(cs.fontSize) < 14;
        }).map((el) => `${el.tagName}.${el.className} ${getComputedStyle(el).fontSize}`);
        const marks = [...document.querySelectorAll('.mark')]
          .filter((m) => m.getClientRects().length && getComputedStyle(m).display !== 'none')
          .map((m) => {
            const r = m.getBoundingClientRect();
            // The ink's own box, which may overflow the svg box.
            const ink = [...m.querySelectorAll('.mark-ink')].map((p) => p.getBoundingClientRect());
            const left = Math.min(...ink.map((b) => b.left)), right = Math.max(...ink.map((b) => b.right));
            const variant = [...m.classList].find((c) => c.startsWith('mark--')).slice(6);
            return { name: m.dataset.mark, variant, top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), w: Math.round(r.width), h: Math.round(r.height), inkLeft: Math.round(left), inkRight: Math.round(right), aspect: +(r.width / r.height).toFixed(2), vb: +(m.viewBox.baseVal.width / m.viewBox.baseVal.height).toFixed(2) };
          });
        const email = document.querySelector('.email').getBoundingClientRect();
        const emailSize = parseFloat(getComputedStyle(document.querySelector('.email')).fontSize);
        // Typed arrows are gone: every arrow is the authored SVG.
        const arrowText = [...document.querySelectorAll('a, button')].map((a) => a.innerText).filter((t) => /[←→↓↗]/.test(t));
        const bodyArrows = /[←→↓↗]/.test(document.body.innerText);
        const copyBtn = document.querySelector('.copy-btn').getBoundingClientRect();
        const strike = [...document.querySelectorAll('.mark--strike')].filter((m) => m.getClientRects().length).map((m) => Math.round(Math.min(...[...m.querySelectorAll('.mark-ink')].map((p) => p.getBoundingClientRect().left))));
        const inDom = [...new Set([...document.querySelectorAll('.mark')].map((m) => m.dataset.mark))];
        const drawn = [...document.querySelectorAll('.mark')].filter((m) => m.getClientRects().length).map((m) => {
          const p = m.querySelector('.mark-reveal');
          const cs = getComputedStyle(p);
          return { name: m.dataset.mark, dash: cs.strokeDasharray, off: cs.strokeDashoffset };
        });
        // Final-pass checks (constants inlined: this runs in the page).
        const ground = (el) => {
          for (let e = el; e; e = e.parentElement) {
            const c = getComputedStyle(e).backgroundColor;
            if (c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
          }
          return 'none';
        };
        const grounds = Object.fromEntries([
          ['inicio', '#inicio'], ['realidad', '#realidad'], ['tesis', '#tesis'], ['bilbao2', 'section.bilbao'], ['betterlife', '#betterlife'], ['geovision', '#geovision'],
          ['archivo', '#archivo'], ['proceso', '#proceso'], ['sobre-mi', '#sobre-mi'], ['contacto', '#contacto'], ['footer', '.site-footer'],
        ].map(([k, sel]) => [k, ground(document.querySelector(sel))]));
        const size = (sel) => [...document.querySelectorAll(sel)].map((el) => parseFloat(getComputedStyle(el).fontSize));
        const caps = {
          h1: size('.hero-title'),
          h2: [...document.querySelectorAll('main h2')].filter((h) => !h.closest('#contacto')).map((h) => parseFloat(getComputedStyle(h).fontSize)),
          caseTitle: size('.case-title'),
          contact: size('.contact-title'),
        };
        const heroLinks = [...document.querySelectorAll('#inicio a')].map((a) => a.className);
        const arch = document.querySelector('#archivo');
        const row = arch.querySelector('a.archive-row');
        const rowCs = row && getComputedStyle(row);
        const rowBox = row && row.getBoundingClientRect();
        const rowInner = arch.querySelector('.archive-row-inner');
        const contentW = rowInner ? rowInner.clientWidth - parseFloat(getComputedStyle(rowInner).paddingLeft) - parseFloat(getComputedStyle(rowInner).paddingRight) : 0;
        // The one link covers the row: one line of text plus the arrow, no label or count.
        const rowTitle = row && row.querySelector('.archive-row-title');
        const archive = row ? {
          links: arch.querySelectorAll('a').length,
          covers: !!rowTitle && !!rowTitle.querySelector('.arrow-icon') && !row.querySelector('.archive-row-label, .archive-row-count, .t-label'),
          ariaLabel: row.getAttribute('aria-label'),
          text: row.innerText.replace(/\u2060/g, '').replace(/\s+/g, ' ').trim(),
          ruled: [rowCs.borderTopWidth, rowCs.borderBottomWidth],
          h: Math.round(rowBox.height), w: Math.round(rowBox.width), contentW: Math.round(contentW),
          cursor: rowCs.cursor, radius: rowCs.borderRadius, bg: rowCs.backgroundColor,
          titleSize: parseFloat(getComputedStyle(rowTitle).fontSize),
          titleWeight: getComputedStyle(rowTitle).fontWeight,
          titleLines: Math.round(rowTitle.getBoundingClientRect().height / (parseFloat(getComputedStyle(rowTitle).fontSize) * 1.15)),
          // Left-aligned: the text starts on the content edge.
          titleLeft: Math.round(rowTitle.getBoundingClientRect().left - (rowInner.getBoundingClientRect().left + parseFloat(getComputedStyle(rowInner).paddingLeft))),
          textAlign: getComputedStyle(rowTitle).textAlign,
        } : { links: arch.querySelectorAll('a').length };
        const bilbao = document.querySelector('#bilbao2');
        const bilbaoParts = { flows: bilbao.querySelectorAll('.flow').length, heads: [...bilbao.querySelectorAll('.flow-head')].map((h) => h.innerText.replace(/\s+/g, ' ')), extra: bilbao.querySelectorAll('figure, figcaption, dl, .mark, .route-legend').length, sentences: bilbao.querySelectorAll('.flow-did').length };
        const clock = document.querySelectorAll('[class*="clock"], [data-clock], [data-clock-wrap], time').length;
        const hero = document.querySelector('#inicio');
        const filled = [...hero.querySelectorAll('a, button')].filter((a) => {
          const bg = getComputedStyle(a).backgroundColor;
          return a.classList.contains('btn') || !(bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent');
        }).map((a) => a.textContent.trim());
        const proofList = hero.querySelectorAll('.hero-proof, .proof').length;
        const rows = document.querySelector('#realidad');
        const realityText = rows.innerText;
        const dialogue = rows.querySelectorAll('q, blockquote, .ledger-quote, .ledger-owner').length + (/[«»“”]/.test(realityText) ? 1 : 0);
        const youTags = /→\s*(tú|you)\b/i.test(document.body.innerText) || rows.querySelectorAll('.arrow-icon').length;
        const nicheEl = document.querySelector('.hero-niche'), nicheCs = getComputedStyle(nicheEl);
        const about = document.querySelector('#sobre-mi');
        const teach = getComputedStyle(about.querySelector('.teach-title')), lead = getComputedStyle(about.querySelector('.why-lead'));
        const lastPass = {
          niche: parseFloat(nicheCs.fontSize),
          nicheColor: nicheCs.color,
          nicheLines: Math.round(nicheEl.getBoundingClientRect().height / parseFloat(nicheCs.lineHeight)),
          aboutText: about.innerText,
          caption: about.querySelector('.why-portrait figcaption').innerText.split('\n').map((l) => l.trim()).filter(Boolean),
          teach: { size: parseFloat(teach.fontSize), weight: teach.fontWeight, color: teach.color, leadSize: parseFloat(lead.fontSize) },
          process: parseFloat(getComputedStyle(document.querySelector('.process-title')).fontSize),
          geoSide: Math.round(document.querySelector('.geo-side').getBoundingClientRect().width),
          geoFrame: (() => { const r = document.querySelector('.geo-frame').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; })(),
          majorH2: [...document.querySelectorAll('main h2')].filter((h) => !h.closest('#contacto')).map((h) => [h.id, parseFloat(getComputedStyle(h).fontSize)]),
          bodyText: document.body.innerText,
        };
        return { headerRight: Math.round(last.right), vw: innerWidth, lines, content: Math.round(content), small, marks, inDom, drawn, lastPass,
          grounds, caps, heroLinks, archive, bilbaoParts, clock, filled, proofList, dialogue, youTags,
          pageHeight: document.documentElement.scrollHeight,
          emailRow: { emailTop: Math.round(email.top), btnTop: Math.round(copyBtn.top), sameRow: copyBtn.top < email.bottom && copyBtn.bottom > email.top, right: Math.round(copyBtn.right) },
          strikeStart: Math.min(...strike), emailSize, arrowText, bodyArrows };
      });
      check(`${label}: header fits`, geo.headerRight <= geo.vw, { right: geo.headerRight, vw: geo.vw });
      if (vp.width >= 1024) check(`${label}: H1 lines inside content box`, geo.lines.every((r) => r <= geo.content + 1), { lines: geo.lines, content: geo.content });
      check(`${label}: no text under 14px`, geo.small.length === 0, geo.small.slice(0, 8));
      check(`${label}: exactly 2 marks on the page (strike, under)`, geo.inDom.length === 2 && MARKS.every((m) => geo.inDom.includes(m)), geo.inDom);
      // One gesture each; for gestures with a phone variant, exactly one variant shows.
      const shown = MARKS.map((g) => [g, [...new Set(geo.marks.filter((m) => m.name === g).map((m) => m.variant))]]);
      check(`${label}: each gesture shown, one variant only`, shown.every(([g, v]) => v.length === 1), Object.fromEntries(shown));
      const outside = geo.marks.filter((m) => m.inkLeft < 0 || m.inkRight > geo.vw);
      check(`${label}: no mark ink crosses the viewport edge`, outside.length === 0, outside.map((m) => `${m.variant} ${m.inkLeft}..${m.inkRight}`));
      check(`${label}: email and copy button share one row`, geo.emailRow.sameRow && geo.emailRow.right <= geo.vw, geo.emailRow);
      if (vp.width === 1440) check(`${label}: email between 36px and 42px`, geo.emailSize >= 36 && geo.emailSize <= 42, { emailSize: geo.emailSize });
      if (vp.width === 1440) {
        const c = geo.caps, max = (a) => Math.max(...a);
        check(`${label}: type caps (H1 ≤ 116, section H2 ≤ 68, case headline ≤ 56, contact ≤ 84)`,
          max(c.h1) <= 116 && max(c.h2) <= 68 && max(c.caseTitle) <= 56 && max(c.contact) <= 84,
          { h1: max(c.h1), h2: max(c.h2), caseTitle: max(c.caseTitle), contact: max(c.contact) });
      }
      const wrong = GROUNDS.filter(([k, c]) => geo.grounds[k] !== c);
      check(`${label}: section grounds follow the colour table (contact and footer on one ink)`, wrong.length === 0, wrong.length ? geo.grounds : null);
      check(`${label}: hero has exactly one editorial CTA`, geo.heroLinks.length === 1 && /cta-link/.test(geo.heroLinks[0]), geo.heroLinks);
      const a = geo.archive;
      const rowText = lang === 'es' ? 'Ver los 11 proyectos' : 'See all 11 projects';
      check(`${label}: projects row is one <a> with one line of text plus the arrow, no label or count, between two 1px rules`,
        a.links === 1 && a.covers && a.ruled.every((w) => w === '1px') && a.w >= a.contentW && a.cursor === 'pointer' && a.radius === '0px' && a.bg === 'rgba(0, 0, 0, 0)'
          && a.text === rowText && a.titleLines === 1 && Math.abs(a.titleLeft) <= 1 && /^(start|left)$/.test(a.textAlign), a);
      const byName = await page.getByRole('link', { name: rowText, exact: true }).count();
      check(`${label}: projects row at least 64px tall, accessible name is the visible text "${rowText}"`, a.h >= 64 && a.ariaLabel === null && byName === 1, { h: a.h, ariaLabel: a.ariaLabel, byName });
      if (vp.width === 1440) check(`${label}: projects row text 28–32px at weight 700`, a.titleSize >= 28 && a.titleSize <= 32 && a.titleWeight === '700', { size: a.titleSize, weight: a.titleWeight });
      const lp = geo.lastPass;
      // Whitespace-normalised: on phones the struck line wraps in two blocks.
      const flat = lp.bodyText.replace(/\s+/g, ' ');
      const missing = NEW_STRINGS[lang].filter((s) => !flat.includes(s));
      check(`${label}: CLOSING-PASS strings present`, missing.length === 0, missing);
      const retired = RETIRED.filter((r) => r.test(lp.bodyText)).map(String);
      check(`${label}: no retired copy in visible text`, retired.length === 0, retired);
      check(`${label}: About shows "AI Systems Engineer", no "Cali, Colombia"; caption is name / role`,
        lp.aboutText.includes('AI Systems Engineer') && !lp.aboutText.includes('Cali, Colombia') && lp.caption.join(' / ') === 'Sebastian Belalcazar / AI Systems Engineer', { caption: lp.caption });
      check(`${label}: teaching intro about 20px, weight 650, ink, smaller than the About H3`,
        lp.teach.size >= 19 && lp.teach.size <= 21 && lp.teach.weight === '650' && lp.teach.color === INK && lp.teach.size < lp.teach.leadSize, lp.teach);
      const pricing = lp.bodyText.match(PRICING);
      check(`${label}: no pricing, packages, rates or bundles`, !pricing, pricing && pricing[0]);
      if (vp.width === 1440) check(`${label}: niche metadata ≤ 15px, one line`, lp.niche <= 15 && lp.nicheLines === 1, { size: lp.niche, lines: lp.nicheLines });
      if (vp.width <= 390) check(`${label}: niche metadata at most 2 lines`, lp.nicheLines <= 2, { size: lp.niche, lines: lp.nicheLines });
      if (vp.width === 1440) {
        check(`${label}: niche line 14–15px in ink-2`, lp.niche >= 14 && lp.niche <= 15 && lp.nicheColor === 'rgb(85, 84, 79)', { size: lp.niche, color: lp.nicheColor });
        check(`${label}: process H2 52–56px`, lp.process >= 52 && lp.process <= 56, { size: lp.process });
        check(`${label}: GeoVision side column 360–400px`, lp.geoSide >= 360 && lp.geoSide <= 400, { side: lp.geoSide, frame: lp.geoFrame });
        check(`${label}: major section H2s 52–68px`, lp.majorH2.every(([, s]) => s >= 52 && s <= 68), lp.majorH2);
      }
      if (vp.width === 390) check(`${label}: GeoVision image stays full-bleed`, lp.geoFrame[0] >= 390, { frame: lp.geoFrame });
      check(`${label}: Bilbao2 is two blocks plus one sentence, no diagram, legend or caption`,
        geo.bilbaoParts.flows === 2 && geo.bilbaoParts.extra === 0 && geo.bilbaoParts.sentences === 1, geo.bilbaoParts);
      if (vp.width === 1024) check(`${label}: email at least 28px`, geo.emailSize >= 28, { emailSize: geo.emailSize });
      const audit = await page.evaluate(PAGE_AUDIT);
      check(`${label}: no cobalt background and no gold surface anywhere`, audit.cobalt.length === 0 && audit.gold.length === 0, { cobalt: audit.cobalt, gold: audit.gold });
      check(`${label}: no em dash in visible text`, audit.emDash.length === 0, audit.emDash);
      check(`${label}: footer is 3 labelled icons plus "SEBASBELMOS © 2026", no language switch`,
        audit.footer.text === 'SEBASBELMOS © 2026' && audit.footer.links === 3 && audit.footer.labelled && audit.footer.lang === 0 && audit.footer.bg === INK, audit.footer);
      check(`${label}: no clock element`, geo.clock === 0, { clock: geo.clock });
      check(`${label}: no filled CTA buttons or proof records in the hero`, geo.filled.length === 0 && geo.proofList === 0, { filled: geo.filled, proof: geo.proofList });
      check(`${label}: reality rows have no quote dialogue and no "→ tú" tags`, geo.dialogue === 0 && !geo.youTags, { dialogue: geo.dialogue, youTags: geo.youTags });
      if (vp.width === 390) check(`${label}: page height${lang === 'es' ? ' ≤ 9500px' : ' (reported)'}`, lang !== 'es' || geo.pageHeight <= 9500, { pageHeight: geo.pageHeight });
      check(`${label}: no Unicode arrows in link text or visible copy`, geo.arrowText.length === 0 && !geo.bodyArrows, geo.arrowText);
      if (vp.width <= 390) check(`${label}: hero strike starts on the content edge`, geo.strikeStart >= 16, { strikeStart: geo.strikeStart });
      const undrawn = geo.drawn.filter((d) => d.dash !== 'none' && d.off !== '0px' && d.off !== '0');
      check(`${label}: every mark fully drawn after settle`, undrawn.length === 0, undrawn);
      if (vp.width === 1440) {
        // Group the renders of one gesture into one box, then check the gaps.
        const boxes = MARKS.map((g) => {
          const r = geo.marks.filter((m) => m.name === g);
          return { name: g, top: Math.min(...r.map((m) => m.top)), bottom: Math.max(...r.map((m) => m.bottom)) };
        }).sort((a, b) => a.top - b.top);
        const gaps = boxes.slice(1).map((m, i) => ({ pair: `${boxes[i].name}→${m.name}`, gap: m.top - boxes[i].bottom }));
        check(`${label}: never two marks in one 900px viewport`, gaps.every((g) => g.gap >= vp.height), gaps);
      }
      results.pages.push({ label, marks: geo.marks });

      if (!vp.noShot && !process.env.QA_NOSHOT) {
        const name = `${tag}-${lang}-${vp.width}`;
        await page.screenshot({ path: path.join(OUT, `${name}-full.png`), fullPage: true });
        if (vp.sections) {
          await page.addStyleTag({ content: '.site-header{position:relative!important}' });
          for (const [id, sel] of SECTIONS) {
            const el = page.locator(Array.isArray(sel) ? sel[0] : sel).first();
            await el.scrollIntoViewIfNeeded();
            await page.waitForTimeout(motion ? 150 : 40);
            // Clip from a full-page render: an element taller than what is left
            // of the viewport otherwise loses its bottom strip to the page ground.
            const to = Array.isArray(sel) ? sel[1] : null;
            const clip = await el.evaluate((e, to) => {
              const r = e.getBoundingClientRect();
              const bottom = to ? document.querySelector(to).getBoundingClientRect().bottom : r.bottom;
              return { x: 0, y: r.top + scrollY, width: innerWidth, height: bottom - r.top };
            }, to);
            await page.screenshot({ path: path.join(OUT, `${name}-${id}.png`), fullPage: true, clip });
          }
          // Archive row states at 1440 (reduced run): hover, then keyboard focus.
          if (vp.width === 1440 && !motion) {
            const row = page.locator('a.archive-row');
            const box = await page.locator('#archivo').evaluate((e) => { const r = e.getBoundingClientRect(); return { x: 0, y: r.top + scrollY, width: innerWidth, height: r.height }; });
            await row.hover();
            await page.waitForTimeout(250);
            await page.screenshot({ path: path.join(OUT, `${name}-archivo-hover.png`), fullPage: true, clip: box });
            await page.mouse.move(0, 0);
            await page.focus('.geo-links a:last-child');
            await page.keyboard.press('Tab');
            await page.waitForTimeout(250);
            await page.screenshot({ path: path.join(OUT, `${name}-archivo-focus.png`), fullPage: true, clip: box });
          }
        }
      }
      check(`${label}: no console errors`, bucket.console.length === 0, bucket.console);
      check(`${label}: no failed requests`, bucket.failed.length === 0, bucket.failed);
      await ctx.close();
    }
  }
}

async function extraRuns(browser) {
  // Technical archive pages, with one record open.
  for (const [lang, url] of Object.entries({ es: '/work/', en: '/en/work/' })) {
    for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 360, height: 800 }]) {
      const ctx = await browser.newContext({ viewport: vp, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      const bucket = { console: [], failed: [] };
      watch(page, bucket);
      await page.goto(BASE + url, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.querySelectorAll('details.record').forEach((d) => { d.open = true; }));
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => document.fonts.ready);
      const info = await page.evaluate(() => ({
        records: document.querySelectorAll('details.record').length,
        juris: document.querySelector('#jurisintel .record-context').textContent,
        arrows: /[←→↓↗]/.test(document.body.innerText),
        marks: document.querySelectorAll('.mark').length,
        clock: document.querySelectorAll('[class*="clock"], time').length,
        filled: [...document.querySelectorAll('main a, main button')].filter((a) => a.classList.contains('btn') || !['rgba(0, 0, 0, 0)', 'transparent'].includes(getComputedStyle(a).backgroundColor)).length,
        cta: !!document.querySelector('.archive-foot .cta-link'),
        h1: document.querySelector('h1').innerText.trim(),
        title: document.title,
        back: document.querySelector('.archive-back').innerText.replace(/\u2060/g, '').trim(),
        oldName: /Archivo técnico|Technical archive/i.test(document.body.innerText + document.title),
      }));
      const ov = await overflow(page);
      const label = `work ${lang} ${vp.width}`;
      const audit = await page.evaluate(PAGE_AUDIT);
      check(`${label}: no em dash in visible text (records open)`, audit.emDash.length === 0, audit.emDash);
      check(`${label}: no cobalt or gold surfaces; ink footer with 3 icons and the brand line only`,
        !audit.cobalt.length && !audit.gold.length && audit.footer.text === 'SEBASBELMOS © 2026' && audit.footer.links === 3 && audit.footer.lang === 0 && audit.footer.bg === INK, audit);
      check(`${label}: 11 records`, info.records === 11, info);
      check(`${label}: h1 and title read "${lang === 'es' ? 'Todos los proyectos' : 'All projects'}", no "technical archive" wording`,
        info.h1 === (lang === 'es' ? 'Todos los proyectos' : 'All projects') && info.title.startsWith(info.h1 + ' · ') && !info.oldName && info.back === (lang === 'es' ? 'Volver a los casos' : 'Back to the case studies'),
        { h1: info.h1, title: info.title, back: info.back, oldName: info.oldName });
      check(`${label}: no Unicode arrows`, !info.arrows, info.arrows);
      check(`${label}: no pen marks, no clock, no filled buttons; editorial contact link`, info.marks === 0 && info.clock === 0 && info.filled === 0 && info.cta, info);
      check(`${label}: no horizontal overflow`, ov.scrollWidth <= ov.innerWidth, ov);
      check(`${label}: no console errors / failed requests`, !bucket.console.length && !bucket.failed.length, [...bucket.console, ...bucket.failed]);
      if (vp.width !== 360 && !process.env.QA_NOSHOT) await page.screenshot({ path: path.join(OUT, `work-${lang}-${vp.width}-full.png`), fullPage: true });
      await ctx.close();
    }
  }
  // No-JS baseline: marks drawn, first GeoVision image plus links.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const nojs = await page.evaluate(() => ({
    hiddenMarks: [...document.querySelectorAll('.mark')].filter((m) => m.getClientRects().length && getComputedStyle(m.querySelector('.mark-reveal')).strokeDasharray !== 'none').length,
    geoLayersShown: [...document.querySelectorAll('.geo-layer')].filter((l) => getComputedStyle(l).display !== 'none').length,
    geoLinks: document.querySelectorAll('.geo-nojs a').length,
    tablistHidden: document.querySelector('[role="tablist"]').hidden,
    emDash: /\u2014/.test(document.body.innerText),
  }));
  check('no-JS: marks drawn, one GeoVision image, four links, no em dash', nojs.hiddenMarks === 0 && nojs.geoLayersShown === 1 && nojs.geoLinks === 4 && nojs.tablistHidden && !nojs.emDash, nojs);
  if (!process.env.QA_NOSHOT) await page.locator('#geovision').screenshot({ path: path.join(OUT, 'nojs-es-1440-geovision.png') });
  for (const url of ['/en/', '/work/', '/en/work/']) {
    await page.goto(BASE + url, { waitUntil: 'networkidle' });
    const dash = await page.evaluate(() => { document.querySelectorAll('details').forEach((d) => { d.open = true; }); return document.body.innerText.match(/.{0,30}\u2014.{0,30}/g) || []; });
    check(`no-JS ${url}: no em dash in visible text`, dash.length === 0, dash);
  }
  await ctx.close();

  // GeoVision tabs: keyboard switch works.
  const c2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p2 = await c2.newPage();
  await p2.goto(BASE + '/en/', { waitUntil: 'networkidle' });
  await p2.focus('#geo-tab-0');
  await p2.keyboard.press('ArrowRight');
  await p2.keyboard.press('End');
  const tabs = await p2.evaluate(() => ({
    selected: document.querySelector('[role="tab"][aria-selected="true"]').id,
    focused: document.activeElement.id,
    active: document.querySelector('.geo-layer.is-active').id,
    caption: document.querySelector('[data-geo-caption]').textContent,
  }));
  check('GeoVision tabs: End selects last tab and panel', tabs.selected === 'geo-tab-4' && tabs.focused === 'geo-tab-4' && tabs.active === 'geo-panel-4', tabs);
  await c2.close();
}

(async () => {
  const browser = await launch();
  results.browser = browser.version();
  await homeRun(browser, 'reduce');
  await homeRun(browser, 'no-preference');
  await extraRuns(browser);
  await browser.close();
  const failed = results.checks.filter((c) => !c.pass);
  results.summary = { total: results.checks.length, failed: failed.length };
  fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(results, null, 2));
  console.log(`\n${results.checks.length - failed.length}/${results.checks.length} checks passed`);
})();
