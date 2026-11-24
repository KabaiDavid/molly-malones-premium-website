/*
 * The Pour — scroll-linked controller.
 *
 * Scroll position through the pinned section is the single source of truth.
 * It is damped (critically, both directions) and mapped through pourState()
 * to the liquid level, head, surge and light. Two renderers consume it:
 *   1. pour-gl.js — the full WebGL scene (lazy-loaded, ~170KB gz incl. three.js)
 *   2. an SVG pint built here — instant, used while WebGL loads and as the
 *      permanent fallback (no WebGL, Save-Data, low memory, or a slow GPU).
 */
import { H, BASE, R, ri, clamp, pourState } from "./pour-shape.js";

const section = document.querySelector("[data-pour]");
if (section) init();

function init() {
  const stage = section.querySelector("[data-pour-stage]");
  const steps = [...section.querySelectorAll("[data-step]")];
  const gaugeFill = section.querySelector("[data-pour-gauge]");
  const pct = section.querySelector("[data-pour-pct]");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svg = buildSvg(stage.querySelector("[data-pour-svg]"));

  const st = { target: 0, p: 0, visible: false, gl: null, step: -1 };

  const read = () => {
    const r = section.getBoundingClientRect();
    const span = r.height - innerHeight;
    st.target = span > 0 ? clamp(-r.top / span, 0, 1) : 1;
  };

  /* ---------------- frame loop: runs only while the section is on screen ---------------- */
  let raf = 0, last = 0, perf = { n: 0, sum: 0, strikes: 0 };
  const kick = () => { if (!raf && st.visible) { last = performance.now(); raf = requestAnimationFrame(tick); } };

  function tick(now) {
    raf = 0;
    const elapsed = Math.min(0.25, (now - last) / 1000), dt = Math.min(0.05, elapsed); last = now;
    // Critically damped follow: silky on trackpads and wheels, honest in both directions.
    // Uses real elapsed time so slower devices still land on the exact scroll position.
    st.p += (st.target - st.p) * (1 - Math.exp(-elapsed * 9));
    if (Math.abs(st.target - st.p) < 0.0003) st.p = st.target;
    const s = pourState(st.p);
    ui(s);
    if (st.gl) { st.gl.frame(s, dt, now / 1000); watchPerf(dt); }
    else svg.update(s);
    const moving = st.p !== st.target;
    if (st.visible && (moving || (st.gl && !reduce))) raf = requestAnimationFrame(tick);
  }

  function ui(s) {
    const i = s.p < 0.2 ? 0 : s.p < 0.5 ? 1 : s.p < 0.8 ? 2 : 3;
    if (i !== st.step) {
      st.step = i;
      steps.forEach((el, k) => { el.classList.toggle("is-active", k === i); el.classList.toggle("is-past", k < i); el.toggleAttribute("inert", k !== i); });
    }
    gaugeFill.style.transform = `scaleY(${s.fill.toFixed(4)})`;
    pct.textContent = `${Math.round(s.fill * 100)}%`;
  }

  /* Adaptive quality: if the GPU can't hold ~30fps, drop resolution; if it still can't, fall back to SVG. */
  function watchPerf(dt) {
    if (perf.strikes > 1) return;
    perf.n++; perf.sum += dt;
    if (perf.n < 75) return;
    const avg = perf.sum / perf.n; perf.n = perf.sum = 0;
    if (avg > 1 / 30) {
      perf.strikes++;
      if (!st.gl.lowerQuality() || perf.strikes > 1) { st.gl.dispose(); st.gl = null; stage.classList.remove("is-3d"); }
    }
  }

  new IntersectionObserver(([e]) => { st.visible = e.isIntersecting; if (st.visible) { read(); kick(); } }, { rootMargin: "100px 0px" }).observe(section);
  addEventListener("scroll", () => { read(); kick(); }, { passive: true });
  addEventListener("resize", () => { read(); st.gl?.resize(); kick(); });
  read(); st.p = st.target; ui(pourState(st.p)); svg.update(pourState(st.p));

  /* ---------------- lazy WebGL ---------------- */
  if (!canRunGL()) return;
  const io = new IntersectionObserver(async ([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    try {
      const { createGL } = await import("./pour-gl.js");
      const gl = createGL(stage, { reduce });
      gl.compile();
      gl.canvas.addEventListener("webglcontextlost", (ev) => { ev.preventDefault(); st.gl = null; stage.classList.remove("is-3d"); svg.update(pourState(st.p)); });
      st.gl = gl;
      gl.frame(pourState(st.p), 0, performance.now() / 1000);
      requestAnimationFrame(() => stage.classList.add("is-3d"));
      kick();
    } catch (err) {
      console.warn("The Pour: WebGL scene unavailable, using the illustrated pint.", err);
    }
  }, { rootMargin: "1200px 0px" });
  io.observe(section);
}

function canRunGL() {
  if (/[?&]pour=2d\b/.test(location.search)) return false;   // QA switch: force the illustrated pint
  const c = navigator.connection;
  if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ""))) return false;
  if (navigator.deviceMemory && navigator.deviceMemory < 3) return false;
  try { return !!document.createElement("canvas").getContext("webgl2"); } catch (_) { return false; }
}

/* ================================================================ SVG pint (fallback) */

function buildSvg(svg) {
  const S = 100, Y = (h) => (H - h) * S;
  const side = (fn, h0, h1, n = 80) => {
    const L = [], Rr = [];
    for (let i = 0; i <= n; i++) { const h = h0 + (h1 - h0) * (i / n), r = fn(h) * S; L.push(`${(-r).toFixed(2)},${Y(h).toFixed(2)}`); Rr.unshift(`${r.toFixed(2)},${Y(h).toFixed(2)}`); }
    return `M${L.join(" L")} L${Rr.join(" L")} Z`;
  };
  const outer = side(R, 0, H), inner = side(ri, BASE, H);
  svg.setAttribute("viewBox", `-110 -30 220 ${H * S + 70}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.innerHTML = `
  <defs>
    <clipPath id="pg-in"><path d="${inner}"/></clipPath>
    <clipPath id="pg-out"><path d="${outer}"/></clipPath>
    <linearGradient id="pg-stout" x1="0" x2="1"><stop offset="0" stop-color="#3b0f06"/><stop offset=".16" stop-color="#120604"/><stop offset=".5" stop-color="#060302"/><stop offset=".84" stop-color="#0e0503"/><stop offset="1" stop-color="#4a1307"/></linearGradient>
    <linearGradient id="pg-surge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d5f3a"/><stop offset=".55" stop-color="#5c3a21" stop-opacity=".7"/><stop offset="1" stop-color="#2a170c" stop-opacity="0"/></linearGradient>
    <linearGradient id="pg-foam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4ead3"/><stop offset=".7" stop-color="#e4d1ad"/><stop offset="1" stop-color="#b48d62"/></linearGradient>
    <radialGradient id="pg-cap" cx=".45" cy=".4"><stop offset="0" stop-color="#fbf4e3"/><stop offset=".7" stop-color="#eadbbb"/><stop offset="1" stop-color="#cdb48a"/></radialGradient>
    <linearGradient id="pg-glass" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".08" stop-color="#fff" stop-opacity=".05"/><stop offset=".5" stop-color="#fff" stop-opacity=".015"/><stop offset=".9" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient>
    <linearGradient id="pg-hl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".25" stop-color="#fff" stop-opacity=".55"/><stop offset=".8" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <radialGradient id="pg-shadow"><stop offset="0" stop-color="#000" stop-opacity=".85"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <radialGradient id="pg-glow"><stop offset="0" stop-color="#c2421c" stop-opacity=".6"/><stop offset="1" stop-color="#c2421c" stop-opacity="0"/></radialGradient>
    <filter id="pg-soft"><feGaussianBlur stdDeviation="1.2"/></filter>
  </defs>
  <ellipse cx="0" cy="${Y(0)}" rx="120" ry="15" fill="url(#pg-shadow)"/>
  <ellipse data-glow cx="0" cy="${Y(0) + 12}" rx="96" ry="16" fill="url(#pg-glow)" opacity="0"/>
  <g clip-path="url(#pg-in)">
    <rect data-beer x="-100" width="200" fill="url(#pg-stout)"/>
    <rect data-surge x="-100" width="200" fill="url(#pg-surge)"/>
    <rect data-foam x="-100" width="200" fill="url(#pg-foam)"/>
  </g>
  <ellipse data-cap fill="url(#pg-cap)"/>
  <path d="${outer}" fill="url(#pg-glass)" stroke="rgba(255,236,210,.32)" stroke-width=".7"/>
  <path d="${inner}" fill="none" stroke="rgba(255,236,210,.14)" stroke-width=".6"/>
  <g clip-path="url(#pg-out)" filter="url(#pg-soft)">
    <rect x="-61" y="-5" width="8" height="${H * S}" fill="url(#pg-hl)"/>
    <rect x="-48" y="40" width="2.2" height="${H * S - 80}" fill="url(#pg-hl)" opacity=".6"/>
    <rect x="50" y="20" width="3.2" height="${H * S - 60}" fill="url(#pg-hl)" opacity=".5"/>
  </g>
  <ellipse cx="0" cy="${Y(H)}" rx="${(R(H) * S).toFixed(2)}" ry="${(R(H) * S * 0.12).toFixed(2)}" fill="none" stroke="rgba(255,236,210,.4)" stroke-width=".8"/>
  <ellipse cx="0" cy="${Y(BASE)}" rx="${(ri(BASE + 0.05) * S).toFixed(2)}" ry="${(ri(BASE + 0.05) * S * 0.12).toFixed(2)}" fill="none" stroke="rgba(255,236,210,.12)" stroke-width=".6"/>`;
  const q = (s) => svg.querySelector(s);
  const beer = q("[data-beer]"), surge = q("[data-surge]"), foam = q("[data-foam]"), cap = q("[data-cap]"), glow = q("[data-glow]");
  const set = (el, o) => { for (const k in o) el.setAttribute(k, typeof o[k] === "number" ? o[k].toFixed(2) : o[k]); };
  return {
    update(s) {
      const show = s.empty ? "none" : "inline";
      [beer, surge, foam, cap].forEach((el) => (el.style.display = show));
      if (s.empty) { glow.setAttribute("opacity", 0); return; }
      set(beer, { y: Y(s.level), height: Y(BASE) - Y(s.level) + 4 });
      set(surge, { y: Y(s.level), height: (0.3 + 1.9 * s.surge) * S, opacity: s.surge * 0.85 });
      set(foam, { y: Y(s.total), height: s.head * S + 1 });
      const rx = ri(s.total) * S;
      set(cap, { cx: 0, cy: Y(s.total) - s.dome * S * 0.4, rx, ry: rx * 0.13 + s.dome * S * 0.25 });
      glow.setAttribute("opacity", (s.fill * 0.9 * (1 - s.surge * 0.5)).toFixed(3));
    },
  };
}
