import fs from "node:fs";
import path from "node:path";

export const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
export const site = read("src/data/site.json");
export const menu = read("src/data/menu.json");
export const eventsData = read("src/data/events.json");
export const LOC = site.locations;

export const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* ---------- Responsive images ---------- */
const IMG_DIR = path.join(root, "assets/img");
const WIDTHS = [640, 1280, 1920];
const dims = JSON.parse(fs.readFileSync(path.join(root, "src/data/image-dims.json"), "utf8"));

/**
 * Picture helper — emits a WebP srcset from the pre-generated widths.
 * @param {string} name   base name in assets/img (without -width.webp)
 * @param {string} alt    descriptive alt text ("" for decorative)
 * @param {object} o      { sizes, eager, cls, attrs }
 */
export function img(name, alt, o = {}) {
  const avail = WIDTHS.filter((w) => fs.existsSync(path.join(IMG_DIR, `${name}-${w}.webp`)));
  if (!avail.length) throw new Error(`Missing image ${name}`);
  const srcset = avail.map((w) => `/assets/img/${name}-${w}.webp ${Math.min(w, dims[name]?.w ?? w)}w`).join(", ");
  const d = dims[name] || { w: 1280, h: 960 };
  const fallback = avail.includes(1280) ? 1280 : avail[avail.length - 1];
  return `<img src="/assets/img/${name}-${fallback}.webp" srcset="${srcset}" sizes="${o.sizes || "100vw"}" width="${d.w}" height="${d.h}" alt="${esc(alt)}"${o.eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${o.cls ? ` class="${o.cls}"` : ""}${o.attrs ? " " + o.attrs : ""}>`;
}
export const media = (name, alt, o = {}) =>
  `<div class="media${o.grade ? " media--grade" : ""}${o.mcls ? " " + o.mcls : ""}"${o.reveal ? ` data-reveal="mask"` : ""}${o.style ? ` style="${o.style}"` : ""}>${img(name, alt, o)}</div>`;

/* ---------- Small helpers ---------- */
export const splitLines = (lines, delayStart = 0, step = 0.08) =>
  lines.map((l, i) => `<span class="split-line"><span style="--d:${(delayStart + i * step).toFixed(2)}s">${l}</span></span>`).join("");

export const arrow = `<svg class="arrow" width="18" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" stroke-width="1.2"/></svg>`;

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ORD = { 1: "First", 2: "Second", 3: "Third", 4: "Fourth" };
export function when(e) {
  if (e.repeat === "weekly") {
    const d = e.days;
    if (d.length === 7) return "Daily";
    if (d.length === 5 && d.join() === "1,2,3,4,5") return "Mon – Fri";
    return d.map((x) => DAY_NAMES[x] + "s").join(" & ");
  }
  if (e.repeat === "monthly") return `${ORD[e.nth]} ${DAY_NAMES[e.day]}, monthly`;
  if (e.repeat === "gameday") return "Game days";
  if (e.repeat === "always") return "Whenever it's on";
  if (e.date) return new Date(e.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  return "";
}

export function hoursTable(loc, kind = "bar", caption) {
  const rows = loc[kind === "bar" ? "barHours" : "kitchenHours"];
  return `<table class="hours"><caption>${esc(caption || (kind === "bar" ? "Bar" : "Kitchen"))}</caption><tbody>${rows
    .map(([d, h]) => `<tr><th scope="row">${esc(d)}</th><td>${esc(h)}</td></tr>`)
    .join("")}</tbody></table>`;
}

export const statusBadge = (slug) => `<span class="status" data-status="${slug}" aria-live="polite">Hours</span>`;

/* ---------- Icons ---------- */
export const icon = {
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M6 3v18M4 3v5a2 2 0 0 0 4 0V3M17 3c-2 0-3 2-3 6s1 5 3 5v7"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`,
};

/* ---------- Layout ---------- */
const NAV = [
  ["/louisville/", "Louisville"],
  ["/covington/", "Covington"],
  ["/menu/", "Menu"],
  ["/events/", "Events"],
  ["/sports/", "Sports"],
  ["/private-events/", "Private Events"],
  ["/our-story/", "Our Story"],
  ["/contact/", "Contact"],
];

function header(current) {
  const links = NAV.map(([href, label]) => `<a href="${href}"${current === href ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const drawer = [["/", "Home"], ...NAV].map(([href, label]) => `<li><a href="${href}"${current === href ? ' aria-current="page"' : ""}>${label}</a></li>`).join("");
  return `
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header" data-header>
  <div class="wrap">
    <a class="wordmark" href="/" aria-label="Molly Malone's — home"><b>Molly Malone's</b><small>Irish Pub &amp; Restaurant</small></a>
    <nav class="nav" aria-label="Primary">${links}</nav>
    <div class="header-cta">
      <a class="btn btn--ghost" href="/private-events/#enquire">Book an Event</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="drawer" data-menu-toggle><span></span><span></span><b class="sr-only">Menu</b></button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" aria-label="Site menu" inert>
  <nav aria-label="Mobile"><ol>${drawer}</ol></nav>
  <div class="drawer-foot">
    ${["louisville", "covington"].map((k) => `<div><strong>${LOC[k].name}</strong><a href="tel:${LOC[k].tel}">${LOC[k].phone}</a><a href="${LOC[k].directions}" rel="noopener" target="_blank">${LOC[k].address}</a></div>`).join("")}
  </div>
</div>`;
}

function footer() {
  const L = LOC.louisville, C = LOC.covington;
  const soc = (loc) => Object.entries(loc.social).map(([n, u]) => `<li><a href="${u}" rel="noopener" target="_blank">${n}</a></li>`).join("");
  return `
<footer class="site-footer" aria-labelledby="footer-title">
  <div class="wrap">
    <p class="footer__big" aria-hidden="true">Sláinte.</p>
    <h2 id="footer-title" class="sr-only">Molly Malone's — locations and links</h2>
    <div class="footer__grid">
      <div>
        <img class="footer__logo" src="/assets/img/logo-white.svg" width="150" height="122" alt="Molly Malone's Irish Pub &amp; Restaurant" loading="lazy">
        <p class="muted" style="max-width:32ch">${esc(site.tagline)}</p>
      </div>
      <div>
        <h4>Louisville</h4>
        <address>${L.address}<br>${L.city}<br><a href="tel:${L.tel}">${L.phone}</a><br><a href="mailto:${L.email}">${L.email}</a></address>
        <ul class="mt-1">${soc(L)}</ul>
      </div>
      <div>
        <h4>Covington</h4>
        <address>${C.address}<br>${C.city}<br><a href="tel:${C.tel}">${C.phone}</a><br><a href="mailto:${C.email}">${C.email}</a></address>
        <ul class="mt-1">${soc(C)}</ul>
      </div>
      <div>
        <h4>Explore</h4>
        <ul>${NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}
          <li><a href="${C.orderOnline}" rel="noopener" target="_blank">Order Online (Covington)</a></li>
          <li><a href="${C.giftCards}" rel="noopener" target="_blank">Gift Cards</a></li>
          <li><a href="https://mollymalonesirishpub.com/join-our-team/" rel="noopener" target="_blank">Join Our Team</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__legal">
      <span>© <span data-year>2026</span> Molly Malone's Irish Pub &amp; Restaurant · Louisville &amp; Covington, Kentucky</span>
      <span>Please drink responsibly. 21+ for alcohol.</span>
    </div>
  </div>
</footer>
<nav class="actionbar" aria-label="Quick actions" data-actionbar>
  <a href="/menu/">${icon.menu}Menu</a>
  <a href="/contact/#find">${icon.pin}Find Us</a>
  <a href="/contact/#call">${icon.phone}Call</a>
</nav>
<dialog class="chooser" id="chooser" aria-labelledby="chooser-title">
  <div class="chooser__inner">
    <div class="chooser__head"><h2 id="chooser-title" class="h3">Find your pub</h2><button class="chooser__close" type="button" data-close aria-label="Close">×</button></div>
    ${["louisville", "covington"].map((k) => `<a class="chooser__opt" href="/${k}/">${media(k === "louisville" ? "lou-neon-night" : "cov-corner", "", { sizes: "(max-width: 640px) 100vw, 480px" })}<b>${LOC[k].name}</b><span class="muted">${LOC[k].address}, ${LOC[k].city}</span><br>${statusBadge(k)}</a>`).join("")}
  </div>
</dialog>`;
}

export function layout({ title, description, path: pagePath, body, preload = [], scripts = [], jsonld }) {
  const fullTitle = pagePath === "/" ? `Molly Malone's Irish Pub & Restaurant — Louisville & Covington, KY` : `${title} — Molly Malone's Irish Pub`;
  const canonical = site.siteUrl.replace(/\/$/, "") + pagePath;
  const ld = jsonld || defaultLd();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#15100c">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="/assets/img/bar-interior-dark-1280.webp">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Manrope:wght@400;500;600;700&display=swap">
${preload.map((p) => `<link rel="preload" as="image" type="image/webp" href="${p}" fetchpriority="high">`).join("\n")}
<link rel="stylesheet" href="/assets/css/main.css">
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
${header(pagePath)}
<main id="main">
${body}
</main>
${footer()}
<script>window.__HOURS__=${JSON.stringify(Object.fromEntries(Object.entries(LOC).map(([k, v]) => [k, { bar: v.bar, kitchen: v.kitchen }])))}</script>
<script src="/assets/js/main.js" defer></script>
${scripts.join("\n")}
</body>
</html>`;
}

function defaultLd() {
  const toSpec = (loc) =>
    Object.entries(loc.bar).map(([d, [o, c]]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "https://schema.org/" + DAY_NAMES[d],
      opens: mins(o),
      closes: mins(c % 1440),
    }));
  return {
    "@context": "https://schema.org",
    "@graph": Object.values(LOC).map((loc) => ({
      "@type": "BarOrPub",
      name: `Molly Malone's Irish Pub & Restaurant — ${loc.name}`,
      servesCuisine: "Irish",
      telephone: loc.tel,
      email: loc.email,
      url: `${site.siteUrl}/${loc.slug}/`,
      address: { "@type": "PostalAddress", streetAddress: loc.address, addressLocality: loc.name, addressRegion: "KY", addressCountry: "US" },
      openingHoursSpecification: toSpec(loc),
    })),
  };
}
const mins = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
