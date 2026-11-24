/*
 * The Pour — shared glass geometry and the scroll → pour timeline.
 * Used by both the WebGL scene (pour-gl.js) and the SVG fallback (pour.js),
 * so the two always agree on where the liquid is.
 *
 * Units: 1 = roughly 5cm. The glass is a 20oz tulip pint, 3.2 units tall.
 */
export const H = 3.2;        // glass height
export const WALL = 0.03;    // wall thickness
export const BASE = 0.34;    // top of the heavy glass base (inner floor)
export const TOP = H - 0.04; // highest the liquid + foam column reaches (dome sits above)

/* Outer radius profile of a tulip pint: narrow heavy foot, swelling belly,
   a gentle waist under the lip and a slight flare at the rim. */
const K = [[0, 0.56], [0.08, 0.575], [0.6, 0.6], [1.6, 0.69], [2.25, 0.765], [2.55, 0.776], [2.88, 0.757], [3.2, 0.772]];

// Monotone cubic Hermite (Fritsch–Carlson): smooth, no overshoot between keys.
const xs = K.map((k) => k[0]), ys = K.map((k) => k[1]), n = K.length;
const d = [], m = [];
for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
m[0] = d[0]; m[n - 1] = d[n - 2];
for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
for (let i = 0; i < n - 1; i++) {
  if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
  const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
  if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Outer radius at height h. */
export function R(h) {
  h = clamp(h, 0, H);
  let i = 0;
  while (i < n - 2 && h > xs[i + 1]) i++;
  const hh = xs[i + 1] - xs[i], t = (h - xs[i]) / hh, t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * hh * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * hh * m[i + 1];
}

/** Inner radius at height h, including the rounded fillet where wall meets floor. */
export const FILLET = 0.045;
export function ri(h) {
  const r = R(h) - WALL;
  if (h >= BASE + FILLET) return r;
  const top = R(BASE + FILLET) - WALL, dy = BASE + FILLET - Math.max(h, BASE);
  return top - FILLET + Math.sqrt(Math.max(0, FILLET * FILLET - dy * dy));
}

/**
 * Where the glass sits on screen — shared by the WebGL camera and the SVG pint,
 * so both renderers frame the glass identically.
 *   cx, cy  centre of the glass, as fractions of the stage
 *   frac    glass height (rim to foot) as a fraction of the stage height
 */
export function composition(w, h) {
  const portrait = w / h < 0.9;
  if (!portrait) return { portrait, cx: w < 1100 ? 0.36 : 0.37, cy: 0.48, frac: 0.37 };
  return { portrait, cx: 0.5, cy: w >= 600 ? 0.36 : 0.31, frac: 0.36 };
}

/* Piecewise-linear keyframes. */
const pw = (pts, x) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + (y1 - y0) * ((x - x0) / (x1 - x0)); }
  }
  return pts[pts.length - 1][1];
};

/**
 * Scroll progress (0–1) → physical state of the pint.
 *   0%  empty            40%  50% full
 *   10% pour begins      55%  70% full
 *   25% 30% full         70%  90% full, head forming
 *   80% full under a creamy head → 100% hold (the stout finishes settling)
 */
export function pourState(p) {
  p = clamp(p, 0, 1);
  const fill = pw([[0, 0], [0.04, 0], [0.1, 0.06], [0.25, 0.3], [0.4, 0.5], [0.55, 0.7], [0.7, 0.9], [0.8, 1], [1, 1]], p);
  const total = BASE + fill * (TOP - BASE);
  // Early in the pour, most of what's in the glass is foam; the head then thickens to ~16mm.
  let head = pw([[0, 0.03], [0.4, 0.06], [0.55, 0.09], [0.7, 0.18], [0.8, 0.3], [1, 0.31]], p);
  head = Math.min(head, (total - BASE) * 0.6);
  return {
    p,
    fill,
    total,                 // top of the foam column
    head,                  // foam thickness
    level: total - head,   // stout / foam interface
    surge: pw([[0, 0], [0.06, 0.9], [0.4, 1], [0.7, 0.75], [0.88, 0.12], [1, 0.06]], p), // tan cascade → settled black
    dome: pw([[0, 0], [0.7, 0], [0.82, 0.05]], p),
    light: 1, // lighting is constant: the composition never changes, only the pint does
    empty: fill <= 0.0008,
  };
}
