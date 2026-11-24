import { LOC, media, img, splitLines, arrow, statusBadge, hoursTable, eventsData, when, esc } from "../lib.mjs";
const L = LOC.louisville;
const ev = eventsData.events.filter((e) => e.location === "louisville" && !e.date);

export default {
  path: "/louisville/",
  title: "Louisville — The Highlands",
  description: "Molly Malone's on Baxter Avenue in Louisville's Highlands: three levels, a garden under the neon, a full vegan menu, trivia Tuesdays, trad sessions and every match on the big screens.",
  preload: ["/assets/img/lou-exterior-1280.webp"],
  body: () => `
<section class="page-hero is-emerald">
  <div class="page-hero__media" data-parallax="0.15">${img("lou-exterior", "", { eager: true, sizes: "100vw" })}</div>
  <div class="wrap">
    <p class="breadcrumb"><a href="/">Home</a> / Louisville</p>
    <p class="eyebrow" data-reveal>${L.address} · The Highlands</p>
    <h1 data-reveal-lines>${splitLines(["Under the", "<em>neon,</em> on", "Baxter Ave."])}</h1>
    <p class="lede" data-reveal>A garden pub in the heart of the Highlands — three levels, one long bar, and a green sign that's guided Louisville home for years.</p>
    <div class="btn-row mt-2" data-reveal>
      <a class="btn" href="/menu/?loc=louisville">Louisville Menu ${arrow}</a>
      <a class="btn btn--ghost" href="tel:${L.tel}">Call ${L.phone}</a>
    </div>
  </div>
</section>

<section class="section is-emerald">
  <div class="wrap loc-intro">
    <div class="loc-intro__lead">
      <p class="eyebrow" data-reveal>The Highlands</p>
      <p class="big" data-reveal>Open seven days a week for lunch and dinner. Traditional Irish pub fare, a full vegan kitchen, and a crowd that's equal parts neighbourhood regulars and visiting supporters.</p>
      <div class="prose mt-2" data-reveal>
        <p>The story goes that Molly Malone's was built from the stones of a pub in Ireland — and once you've settled into a booth under the old pictures, it's easy to believe. The main floor is for pub fare and live sports on the big screens. Upstairs is looser: heat lamps, cornhole and a smoking area. Outside, the garden spreads out beneath the trees and the famous neon.</p>
        <p>Thursday brings bluegrass or Irish trad from 7pm, and on the third Sunday of every month the session players gather from 4pm.</p>
      </div>
    </div>
    <aside class="loc-intro__card" aria-label="Louisville details">
      <h2>Visit Louisville</h2>
      ${statusBadge("louisville")}
      <ul class="contact-list">
        <li><span>Address</span><span>${L.address}</span></li>
        <li><span>Phone</span><a href="tel:${L.tel}">${L.phone}</a></li>
        <li><span>Email</span><a href="mailto:${L.email}">${L.email}</a></li>
        <li><span>Brunch</span><span>${L.brunch}</span></li>
      </ul>
      ${hoursTable(L, "bar")}
      ${hoursTable(L, "kitchen")}
      <p class="small muted">${L.kitchenNote}</p>
      <a class="btn" href="${L.directions}" target="_blank" rel="noopener">Get directions ${arrow}</a>
      <a class="btn btn--ghost" href="mailto:${L.email}?subject=Table%20reservation%20%E2%80%94%20Louisville">Book a table</a>
    </aside>
  </div>
</section>

<section class="section--tight">
  <div class="wrap mosaic">
    ${media("lou-neon-night", "The Molly Malone's neon sign glowing over the string-lit garden at night", { reveal: true, sizes: "(max-width: 720px) 100vw, 42vw" })}
    ${media("lou-guinness-bar", "A pint of Guinness on the Louisville bar", { reveal: true, sizes: "(max-width: 720px) 50vw, 33vw", style: "--d:.1s" })}
    ${media("lou-patio-burger", "A burger and fries on the patio in the afternoon sun", { reveal: true, sizes: "(max-width: 720px) 50vw, 25vw", style: "--d:.2s" })}
    ${media("lou-backbar", "The carved wooden back bar lined with bottles", { reveal: true, sizes: "(max-width: 720px) 50vw, 58vw", style: "--d:.3s" })}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <p class="eyebrow" data-reveal>Three levels</p>
    <h2 class="h1" data-reveal-lines>${splitLines(["One pub,", "<em>three moods.</em>"])}</h2>
    <div class="floors mt-3">
      <article class="floor">
        ${media("lou-guinness-harp", "A pint of Guinness at the brass harp tap on the main floor", { sizes: "(max-width: 900px) 100vw, 50vw" })}
        <div class="floor__copy" data-reveal>
          <span class="floor__label">Main floor</span>
          <h3>The bar &amp; the big screens</h3>
          <p class="muted">Hearty pub fare while you watch live sport on the big screens — international football, rugby and hurling, plus the latest Cards and UK games.</p>
          <ul class="floor__specs"><li>Full kitchen</li><li>Wide-screen HDTVs</li><li>Wireless internet</li></ul>
        </div>
      </article>
      <article class="floor">
        ${media("lou-garden", "The tree-shaded garden and hedged patio outside the pub", { sizes: "(max-width: 900px) 100vw, 50vw" })}
        <div class="floor__copy" data-reveal>
          <span class="floor__label">Second floor &amp; garden</span>
          <h3>Heat lamps &amp; cornhole</h3>
          <p class="muted">A relaxed vibe upstairs with a smoking area, heat lamps and cornhole. The outside area offers seating, brews and some of the best outdoor dining in Louisville.</p>
          <ul class="floor__specs"><li>Smoking area</li><li>Cornhole</li><li>Outdoor seating</li></ul>
        </div>
      </article>
      <article class="floor">
        ${media("lou-exterior", "The Baxter Avenue frontage with its green awning and covered upper deck", { sizes: "(max-width: 900px) 100vw, 50vw" })}
        <div class="floor__copy" data-reveal>
          <span class="floor__label">Upstairs · private</span>
          <h3>The Upper Deck &amp; The Shebeen</h3>
          <p class="muted">A covered, heated Upper Deck with its own private bar for up to 100 — or The Shebeen, a separate dining room for up to 35, with no room rental fee.</p>
          <a class="link mt-1" href="/private-events/?loc=louisville">Plan an event ${arrow}</a>
        </div>
      </article>
    </div>
  </div>
</section>

<section class="section is-light">
  <div class="wrap split">
    <div>
      <p class="eyebrow" data-reveal>Plant-based, properly</p>
      <h2 class="h1" data-reveal-lines>${splitLines(["A full vegan", "<em>pub menu.</em>"])}</h2>
      <p class="lede mt-2" data-reveal>Fish &amp; chips made with beer-battered tofu from a dedicated vegan fryer. A black-bean shepherd's pie. A Reuben with vegan cheese. Served every day — and every Thursday is Vegan Happy Hour.</p>
      <a class="btn mt-2" href="/menu/?loc=louisville&amp;menu=vegan" data-reveal>See the vegan menu ${arrow}</a>
    </div>
    <div>${media("lou-full-irish", "Molly's famous Full Irish breakfast with beans, eggs, black pudding and home fries", { reveal: true, sizes: "(max-width: 900px) 100vw, 50vw", style: "aspect-ratio:4/3" })}<p class="caption">Molly's famous Full Irish — weekend brunch until 3pm</p></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="head-row">
      <div>
        <p class="eyebrow" data-reveal>Every week on Baxter</p>
        <h2 class="h1" data-reveal-lines>${splitLines(["The Louisville", "<em>calendar.</em>"])}</h2>
      </div>
      <a class="link" href="/events/?loc=louisville">All Louisville events ${arrow}</a>
    </div>
    <ul class="agenda">
      ${ev.map((e) => `<li data-reveal><span class="agenda__when">${when(e)}</span><span class="agenda__what"><b>${esc(e.title)}</b><span>${esc(e.subtitle || e.text)}</span></span><span class="agenda__time">${esc(e.time)}</span></li>`).join("")}
      <li data-reveal><span class="agenda__when">Fri &amp; Sat</span><span class="agenda__what"><b>DJ Nights</b><span>Dance music from the area's best DJs, from 11pm into the early hours.</span></span><span class="agenda__time">11pm – late</span></li>
    </ul>
  </div>
</section>

<section class="section--tight">
  <div class="wrap">
    <div class="callout-band" data-reveal>
      <h3>Birthdays, engagements, holiday parties — <em>upstairs.</em></h3>
      <div class="btn-row"><a class="btn" href="/private-events/?loc=louisville#enquire">Enquire now ${arrow}</a><a class="btn btn--ghost" href="tel:${L.tel}">Call a manager</a></div>
    </div>
  </div>
</section>
`,
};
