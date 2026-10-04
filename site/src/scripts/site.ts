// Pen marks, GeoVision tabs and copy email.
// Everything is visible without this script; it only adds motion and controls.

const root = document.documentElement;
const motion = root.classList.contains('motion');
const $$ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) =>
  Array.from(el.querySelectorAll<T>(sel));
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---- Pen marks: drawn once on entering view ----
const EASE_PEN = 'cubic-bezier(.65,0,.35,1)';
const durations: Record<string, number> = { strike: 1000 };

const finishMark = (svg: Element) => {
  // Every render of the gesture (the phone strike has one per line) is marked drawn.
  $$(`.mark[data-mark="${svg.getAttribute('data-mark')}"]`).forEach((m) => m.classList.add('is-drawn'));
};

const drawing = new Set<string>();
const draw = async (svg: Element) => {
  const name = svg.getAttribute('data-mark') || '';
  if (svg.classList.contains('is-drawn') || drawing.has(name)) return;
  // Every displayed render of the gesture plays, in reading order (the phone
  // strike has one render per line); hidden variants are skipped.
  const renders = $$(`.mark[data-mark="${name}"]`).filter((m) => m.getClientRects().length);
  const paths = renders.flatMap((r) => $$<SVGPathElement>('.mark-reveal', r));
  if (!paths.length) return;
  drawing.add(name);
  if (name === 'strike') {
    await document.fonts.ready;
    await wait(350);
  }
  // Strokes play in order; each gets a share of the time by its length, and
  // a short lift of the pen sits between them.
  const total = (durations[name] || 600) * (1 + 0.4 * (renders.length - 1));
  const anims: Animation[] = [];
  for (const path of paths) {
    const share = Number(path.dataset.weight || 1) / renders.length;
    const anim = path.animate(
      [{ strokeDashoffset: 1.05 }, { strokeDashoffset: 0 }],
      { duration: Math.max(140, total * share), easing: paths.length > 1 ? 'cubic-bezier(.45,0,.3,1)' : EASE_PEN, fill: 'forwards' },
    );
    anims.push(anim);
    await anim.finished.catch(() => undefined);
    if (paths.length > 1) await wait(70);
  }
  finishMark(svg);
  anims.forEach((a) => a.cancel());
};

if (motion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        draw(e.target);
      });
    },
    { threshold: 0.6 },
  );
  $$('.mark').forEach((m) => io.observe(m));
} else {
  $$('.mark').forEach((m) => m.classList.add('is-drawn'));
}
root.classList.add('ready');

// ---- GeoVision tabs ----
const geo = document.querySelector<HTMLElement>('[data-geo]');
if (geo) {
  const list = geo.querySelector<HTMLElement>('[role="tablist"]')!;
  const tabs = $$<HTMLButtonElement>('[role="tab"]', geo);
  const caption = geo.querySelector<HTMLElement>('[data-geo-caption]')!;
  list.hidden = false;
  const select = (i: number, focus = false) => {
    tabs.forEach((tab, j) => {
      const on = i === j;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls')!)!;
      panel.classList.toggle('is-active', on);
      if (on) panel.removeAttribute('aria-hidden');
      else panel.setAttribute('aria-hidden', 'true');
    });
    const tab = tabs[i];
    caption.innerHTML = '';
    const strong = document.createElement('span');
    strong.className = 'geo-caption-title';
    strong.textContent = `${tab.textContent}.`;
    caption.append(strong, ` ${tab.dataset.caption}`);
    if (focus) {
      tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      const n = tabs.length;
      const k: Record<string, number> = {
        ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1,
      };
      if (e.key in k) {
        e.preventDefault();
        select(k[e.key], true);
      }
    });
  });
}

// ---- Copy email ----
$$<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  const status = btn.parentElement!.querySelector<HTMLElement>('[data-copy-status]')!;
  const email = btn.parentElement!.querySelector<HTMLElement>('[data-email]')!;
  let timer = 0;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy!);
      status.textContent = btn.dataset.ok!;
    } catch {
      getSelection()?.selectAllChildren(email);
      status.textContent = btn.dataset.fail!;
    }
    clearTimeout(timer);
    timer = window.setTimeout(() => (status.textContent = ''), 2000);
  });
});
