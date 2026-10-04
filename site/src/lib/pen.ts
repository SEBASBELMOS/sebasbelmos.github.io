// Build-time generator for SEBASBELMOS pen marks.
// Every mark is made by the same felt-tip pen: a filled outline around a
// smoothed centreline, with a pressure profile (light landing, full body,
// thin lift-off). The centreline doubles as a reveal mask, so the page can
// "draw" the ink without animating its geometry. Marks are authored in their
// real aspect ratio so the ink never stretches.

type Pt = [number, number];

interface StrokeOptions {
  /** Body width in viewBox units. */
  width: number;
  /** Relative width where the pen lands. */
  land?: number;
  /** Relative width where the pen lifts. */
  lift?: number;
  /** Fraction of the stroke spent tapering out. */
  tail?: number;
  seed?: number;
  /** Low-frequency pressure drift, as a fraction of the width. */
  drift?: number;
  /** Edge asymmetry amplitude (felt-tip wobble). */
  skew?: number;
  samples?: number;
}

export interface Stroke {
  ink: string;
  line: string;
  maskWidth: number;
  /** Nib width in viewBox units (the stroke's full-pressure thickness). */
  width: number;
  /** Relative share of the mark's drawing time. */
  weight: number;
}

export interface PenMark {
  viewBox: string;
  strokes: Stroke[];
}

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

// Catmull-Rom through the control points.
function sample(points: Pt[], samples: number): Pt[] {
  const p = [points[0], ...points, points[points.length - 1]];
  const out: Pt[] = [];
  const segs = points.length - 1;
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * segs;
    const k = Math.min(Math.floor(t), segs - 1);
    const u = t - k;
    const [p0, p1, p2, p3] = [p[k], p[k + 1], p[k + 2], p[k + 3]];
    const u2 = u * u, u3 = u2 * u;
    const f = (a: number, b: number, c: number, d: number) =>
      0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
    out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
}

const fmt = (n: number) => Math.round(n * 10) / 10;

function smoothPath(pts: Pt[], close: boolean) {
  let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    d += `Q${fmt(x)} ${fmt(y)} ${fmt((x + nx) / 2)} ${fmt((y + ny) / 2)}`;
  }
  const last = pts[pts.length - 1];
  d += `L${fmt(last[0])} ${fmt(last[1])}`;
  return close ? d + 'Z' : d;
}

const length = (pts: Pt[]) =>
  pts.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

function stroke(points: Pt[], o: StrokeOptions): Stroke {
  const { width, land = 0.55, lift = 0.12, tail = 0.3, seed = 7, drift = 0.14, skew: skewAmp = 0.06, samples = 72 } = o;
  const rand = rng(seed);
  const line = sample(points, samples);
  const left: Pt[] = [];
  const right: Pt[] = [];
  // Two slow noise channels: pressure for the body, and a slight asymmetry
  // between the edges, which is what makes felt-tip ink look pressed.
  let pressure = 0, skew = 0;
  const ease = (x: number) => x * x * (3 - 2 * x);
  for (let i = 0; i < line.length; i++) {
    const t = i / (line.length - 1);
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(line.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const landing = t < 0.09 ? land + (1 - land) * ease(t / 0.09) : 1;
    const lifting = t > 1 - tail ? 1 - (1 - lift) * Math.pow((t - (1 - tail)) / tail, 1.25) : 1;
    pressure = pressure * 0.9 + (rand() - 0.5) * drift * 0.5;
    skew = skew * 0.85 + (rand() - 0.5) * skewAmp;
    const w = (width / 2) * landing * lifting * (1 + pressure);
    left.push([line[i][0] + nx * w * (1 + skew), line[i][1] + ny * w * (1 + skew)]);
    right.push([line[i][0] - nx * w * (1 - skew), line[i][1] - ny * w * (1 - skew)]);
  }
  // Small round caps sized by the local width, so a light landing never blobs.
  const cap = (c: Pt, from: Pt, toward: Pt, steps = 6): Pt[] => {
    const r = Math.hypot(from[0] - c[0], from[1] - c[1]);
    const a0 = Math.atan2(from[1] - c[1], from[0] - c[0]);
    const away = Math.atan2(c[1] - toward[1], c[0] - toward[0]);
    // Pick the half-turn whose midpoint faces away from the stroke.
    const mid = (dir: number) => a0 + (dir * Math.PI) / 2;
    const diff = (x: number) => Math.abs(Math.atan2(Math.sin(x - away), Math.cos(x - away)));
    const dir = diff(mid(1)) < diff(mid(-1)) ? 1 : -1;
    const pts: Pt[] = [];
    for (let s = 1; s < steps; s++) {
      const a = a0 + (dir * Math.PI * s) / steps;
      pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
    }
    return pts;
  };
  const n = line.length - 1;
  const outline = [
    ...left,
    ...cap(line[n], left[n], line[n - 1]),
    ...[...right].reverse(),
    ...cap(line[0], right[0], line[1]),
  ];
  return { ink: smoothPath(outline, true), line: smoothPath(line, false), maskWidth: width * 1.8, width, weight: length(line) };
}

function mark(viewBox: string, strokes: Stroke[]): PenMark {
  const total = strokes.reduce((s, k) => s + k.weight, 0);
  return { viewBox, strokes: strokes.map((k) => ({ ...k, weight: k.weight / total })) };
}

// One pen, two gestures. The strike is a clean, low-wobble double pass whose
// nib stays thinner than the struck text's stem; the underline is finer still.
export const marks = {
  // Hero: "Demasiadas cosas pasan por ti." struck out in two quick, nearly straight
  // passes. Box = the struck line's width × .8em, so 1 unit = .008em
  // vertically. The 760-weight stem is about .18em, so a 14-unit nib
  // (.11em, ≈ 6.5px at 58px) is about 60% of it; the return pass is finer.
  strike: mark('0 0 1000 100', [
    stroke([[-8, 56], [330, 52], [670, 48], [1008, 44]], { width: 14, seed: 11, tail: 0.16, lift: 0.4, land: 0.7, drift: 0.04, skew: 0.02 }),
    stroke([[930, 62], [620, 65], [310, 68], [60, 70]], { width: 11, seed: 12, tail: 0.3, lift: 0.2, land: 0.75, drift: 0.04, skew: 0.02 }),
  ]),
  // About: the phrase a student used about how he listens. Subtle.
  under: mark('0 0 300 24', [
    stroke([[-4, 10], [100, 12], [200, 11.5], [306, 11]], { width: 7, seed: 42, tail: 0.3, lift: 0.2, drift: 0.06, skew: 0.03 }),
  ]),
};

export type MarkName = keyof typeof marks;
