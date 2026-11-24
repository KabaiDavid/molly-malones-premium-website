import { LOC, menu, media, img, splitLines, arrow, esc, icon } from "../lib.mjs";

const fmtPrice = (p) => esc(p);
const tags = (t = []) => t.map((x) => (x === "v" ? `<span class="tag tag--v" title="Vegetarian / vegan">V</span>` : `<span class="tag tag--sig" title="House signature">Signature</span>`)).join("");
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function panel(locKey, menuKey, m) {
  const L = LOC[locKey];
  const id = `${locKey}-${menuKey}`;
  const sections = m.sections.length
    ? m.sections.map((s) => `
    <section class="menu-section" id="${id}-${slug(s.name)}" data-section="${esc(s.name)}">
      <div class="menu-section__head"><h2>${esc(s.name)}</h2>${s.note ? `<p>${esc(s.note)}</p>` : ""}</div>
      <ul class="menu-items">
        ${s.items.map((it) => `
        <li class="menu-item" data-search="${esc((it.name + " " + (it.desc || "")).toLowerCase())}">
          <div class="menu-item__row"><span class="menu-item__name">${esc(it.name)}${tags(it.tags)}</span><span class="menu-item__dots" aria-hidden="true"></span><span class="menu-item__price">${fmtPrice(it.price)}</span></div>
          ${it.desc ? `<p class="menu-item__desc">${esc(it.desc)}</p>` : ""}
        </li>`).join("")}
      </ul>
    </section>`).join("")
    : `<div class="menu-section"><div class="menu-section__head"><h2>At the bar</h2></div><div class="menu-items" style="display:block"><p class="lede">${esc(m.note)}</p><p class="muted">Guinness, Harp, Smithwick's, Kilkenny and Magners are poured at both pubs. For today's full Louisville list, call <a href="tel:${L.tel}">${L.phone}</a> — or see Covington's live draft list below.</p><a class="btn mt-1" href="?loc=covington&amp;menu=drinks" data-goto="covington:drinks">Covington drinks list ${arrow}</a></div></div>`;
  return `
  <div class="menu-panel" id="panel-${id}" role="tabpanel" data-loc="${locKey}" data-menu="${menuKey}" data-label="${esc(m.label)}" aria-label="${L.name} ${esc(m.label)} menu" hidden>
    <div class="menu-panel__note"><p class="chapter" style="margin:0">${L.name} · ${esc(m.label)}</p><p class="small" style="margin:0">${m.sections.length ? esc(m.note) : ""}${locKey === "covington" && menuKey === "drinks" ? ` <a href="${LOC.covington.drinksMenu}" target="_blank" rel="noopener">Live list on BeerMenus ↗</a>` : ""}</p></div>
    ${sections}
    <p class="menu-empty" hidden data-empty>Nothing matches that search on this menu.</p>
  </div>`;
}

export default {
  path: "/menu/",
  title: "Food & Drink Menu",
  description: "The Molly Malone's menus for Louisville and Covington — fish & chips, bangers & mash, shepherd's pie, Reubens, burgers, weekend brunch, late night, vegan, Irish whiskey and beer.",
  preload: ["/assets/img/fish-chips-close-1280.webp"],
  body: () => `
<section class="page-hero page-hero--short">
  <div class="page-hero__media" data-parallax="0.15">${img("fish-chips-close", "", { eager: true, sizes: "100vw" })}</div>
  <div class="wrap">
    <p class="breadcrumb"><a href="/">Home</a> / Menu</p>
    <h1 data-reveal-lines>${splitLines(["Food &amp;", "<em>drink.</em>"])}</h1>
    <p class="lede" data-reveal>Each pub writes its own menu. Choose your Molly's, then your mood.</p>
  </div>
</section>

<div class="menu-controls" data-menu-app>
  <div class="wrap">
    <div class="seg" role="group" aria-label="Choose location">
      <button type="button" data-loc-btn="covington" aria-pressed="true">Covington</button>
      <button type="button" data-loc-btn="louisville" aria-pressed="false">Louisville</button>
    </div>
    <div class="tabs" role="tablist" aria-label="Menus" data-tabs></div>
    <label class="menu-search">${icon.search}<span class="sr-only">Search the menu</span><input type="search" placeholder="Search — e.g. Reuben" data-menu-search autocomplete="off"></label>
  </div>
</div>

<div class="wrap" data-menu-panels>
  ${Object.entries(menu).filter(([k]) => !k.startsWith("_")).map(([loc, menus]) => Object.entries(menus).map(([mk, m]) => panel(loc, mk, m)).join("")).join("")}
  <noscript><style>.menu-panel[hidden]{display:block}</style></noscript>
</div>

<section class="section is-light">
  <div class="wrap">
    <div class="head-row">
      <div><p class="eyebrow">From the pass</p><h2 class="h1">What we're <em>known for.</em></h2></div>
      <p class="muted" style="max-width:36ch">Prices and availability can change. Allergies or dietary needs? Tell your server — Louisville runs a dedicated vegan fryer.</p>
    </div>
    <div class="menu-feature">
      <figure>${media("fish-chips", "Fish and chips with coleslaw and tartar sauce", { reveal: true, sizes: "(max-width: 800px) 62vw, 25vw" })}<figcaption>Fish &amp; Chips</figcaption></figure>
      <figure>${media("reuben", "The Reuben on toasted rye", { reveal: true, sizes: "(max-width: 800px) 62vw, 25vw", style: "--d:.1s" })}<figcaption>The Reuben</figcaption></figure>
      <figure>${media("wings", "Molly's wings glazed in whiskey BBQ sauce", { reveal: true, sizes: "(max-width: 800px) 62vw, 25vw", style: "--d:.2s" })}<figcaption>Molly's Wings</figcaption></figure>
      <figure>${media("house-salad", "House salad with goat cheese and cherry tomatoes", { reveal: true, sizes: "(max-width: 800px) 62vw, 25vw", style: "--d:.3s" })}<figcaption>House Salad</figcaption></figure>
    </div>
    <div class="btn-row mt-3">
      <a class="btn" href="${LOC.covington.orderOnline}" target="_blank" rel="noopener">Order online — Covington ${arrow}</a>
      <a class="btn btn--ghost" href="tel:${LOC.louisville.tel}">Call Louisville</a>
    </div>
  </div>
</section>
`,
};
