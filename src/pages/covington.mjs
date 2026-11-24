import { LOC, media, img, splitLines, arrow, statusBadge, hoursTable, eventsData, when, esc } from "../lib.mjs";
const C = LOC.covington;
const ev = eventsData.events.filter((e) => e.location === "covington" && !e.date);

export default {
  path: "/covington/",
  title: "Covington — The Hermes Building",
  description: "Molly Malone's Covington, in the restored 1888 Hermes Building at the foot of the Roebling Suspension Bridge. Bluegrass Mondays, Irish music Tuesdays, NFL Sunday Ticket, a free Bengals shuttle and two private floors.",
  preload: ["/assets/img/cov-street-1280.webp"],
  body: () => `
<section class="page-hero is-burgundy">
  <div class="page-hero__media" data-parallax="0.15">${img("cov-street", "", { eager: true, sizes: "100vw" })}</div>
  <div class="wrap">
    <p class="breadcrumb"><a href="/">Home</a> / Covington</p>
    <p class="eyebrow" data-reveal>${C.address} · Est. 2007</p>
    <h1 data-reveal-lines>${splitLines(["At the foot", "of the <em>bridge.</em>"])}</h1>
    <p class="lede" data-reveal>A beautifully restored 1888 building beneath the Roebling Suspension Bridge — three floors, a bar imported from Ireland, and Cincinnati's skyline from the patio.</p>
    <div class="btn-row mt-2" data-reveal>
      <a class="btn" href="/menu/?loc=covington">Covington Menu ${arrow}</a>
      <a class="btn btn--ghost" href="${C.orderOnline}" target="_blank" rel="noopener">Order Online</a>
    </div>
  </div>
</section>

<section class="section is-burgundy">
  <div class="wrap loc-intro">
    <div class="loc-intro__lead">
      <p class="eyebrow" data-reveal>The Hermes Building</p>
      <p class="big" data-reveal>Irish-owned and part of Covington's dining and nightlife since 2007 — known for our fish &amp; chips and Reubens, and a Key Lime pie that's hard to beat.</p>
      <div class="prose mt-2" data-reveal>
        <p>Joseph Hermes built this corner as a saloon in 1888. Since then it's been a temporary City Hall, a print shop and apartments, an Irish pub — and — if you believe the rumours — home to a ghost who never left. Today the main floor pours Guinness, Harp, Smithwick's, Kilkenny, Magners and our own Molly's Stout, with Jameson on draft.</p>
        <p>The patio looks out on the Roebling Bridge and the Cincinnati skyline. Downtown Cincinnati is a walk across the river.</p>
      </div>
    </div>
    <aside class="loc-intro__card" aria-label="Covington details">
      <h2>Visit Covington</h2>
      ${statusBadge("covington")}
      <ul class="contact-list">
        <li><span>Address</span><span>${C.address}</span></li>
        <li><span>Phone</span><a href="tel:${C.tel}">${C.phone}</a></li>
        <li><span>Email</span><a href="mailto:${C.email}">${C.email}</a></li>
        <li><span>Brunch</span><span>${C.brunch}</span></li>
        <li><span>Happy hour</span><span>${C.happyHour}</span></li>
      </ul>
      ${hoursTable(C, "bar")}
      ${hoursTable(C, "kitchen")}
      <p class="small muted">${C.kitchenNote}</p>
      <a class="btn" href="${C.directions}" target="_blank" rel="noopener">Get directions ${arrow}</a>
      <a class="btn btn--ghost" href="${C.orderOnline}" target="_blank" rel="noopener">Order online</a>
    </aside>
  </div>
</section>

<section class="section--tight">
  <div class="wrap mosaic">
    ${media("cov-corner", "The red-brick Hermes Building with its teal arched windows", { reveal: true, sizes: "(max-width: 720px) 100vw, 42vw" })}
    ${media("cov-bartender", "A bartender pouring coffee at the carved wooden bar", { reveal: true, sizes: "(max-width: 720px) 50vw, 33vw", style: "--d:.1s" })}
    ${media("irish-coffee", "An Irish coffee on the patio at dusk", { reveal: true, sizes: "(max-width: 720px) 50vw, 25vw", style: "--d:.2s" })}
    ${media("cov-soccer-fans", "Soccer supporters in their kits at the bar", { reveal: true, sizes: "(max-width: 720px) 50vw, 58vw", style: "--d:.3s" })}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <p class="eyebrow" data-reveal>Three floors</p>
    <h2 class="h1" data-reveal-lines>${splitLines(["Climb the stairs,", "<em>change the night.</em>"])}</h2>
    <div class="floors mt-3">
      <article class="floor">
        ${media("cov-world-cup", "The main floor packed for a World Cup match", { sizes: "(max-width: 900px) 100vw, 50vw" })}
        <div class="floor__copy" data-reveal>
          <span class="floor__label">First floor</span>
          <h3>The main bar</h3>
          <p class="muted">Hearty pub fare and a wide variety of beers and spirits, with great live music or live sport on the big screens — and the patio outside.</p>
          <ul class="floor__specs"><li>Live music</li><li>NFL Sunday Ticket</li><li>Patio with skyline views</li></ul>
        </div>
      </article>
      <article class="floor">
        ${media("cov-pub-pool", "The second-floor Pub with its pool table, timber floors and private bar", { sizes: "(max-width: 900px) 100vw, 50vw" })}
        <div class="floor__copy" data-reveal>
          <span class="floor__label">Second floor · private</span>
          <h3>The Pub</h3>
          <p class="muted">A handcrafted bar imported from Ireland, a pool table, darts and five TVs. Up to 64 seated or 100 cocktail-style.</p>
          <ul class="floor__specs"><li>Private bar</li><li>Pool &amp; darts</li><li>Elevator access</li></ul>
        </div>
      </article>
      <article class="floor">
        ${media("cov-ballroom", "The third-floor ballroom dressed for dinner", { sizes: "(max-width: 900px) 100vw, 50vw" })}
        <div class="floor__copy" data-reveal>
          <span class="floor__label">Third floor · private</span>
          <h3>The Emerald Ballroom</h3>
          <p class="muted">Up to 80 for dinner or 125 cocktail-style, with a 10-foot projection screen and its own bar.</p>
          <a class="link mt-1" href="/private-events/?loc=covington">Plan an event ${arrow}</a>
        </div>
      </article>
    </div>
  </div>
</section>

<section class="section is-light">
  <div class="wrap split">
    <div>${media("bluegrass-player", "A banjo player mid-song at the Monday bluegrass session", { reveal: true, sizes: "(max-width: 900px) 100vw, 40vw", style: "aspect-ratio:4/5" })}</div>
    <div>
      <p class="eyebrow" data-reveal>The music</p>
      <h2 class="h1" data-reveal-lines>${splitLines(["The longest-running", "bluegrass session", "in <em>greater Cincinnati.</em>"])}</h2>
      <p class="lede mt-2" data-reveal>Monday night belongs to the pickers. Tuesday, Scott Keirs plays traditional and contemporary Irish music. Thursday, the Missy Werner Band takes the floor.</p>
      <ul class="agenda mt-2">
        ${ev.filter((e) => e.category === "music").map((e) => `<li data-reveal><span class="agenda__when">${when(e)}</span><span class="agenda__what"><b>${esc(e.title)}</b><span>${esc(e.subtitle || "")}</span></span><span class="agenda__time">${esc(e.time)}</span></li>`).join("")}
      </ul>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="head-row">
      <div>
        <p class="eyebrow" data-reveal>Game days &amp; good deals</p>
        <h2 class="h1" data-reveal-lines>${splitLines(["Beyond the", "<em>music.</em>"])}</h2>
      </div>
      <a class="link" href="/events/?loc=covington">All Covington events ${arrow}</a>
    </div>
    <ul class="agenda">
      ${ev.filter((e) => e.category !== "music").map((e) => `<li data-reveal><span class="agenda__when">${when(e)}</span><span class="agenda__what"><b>${esc(e.title)}</b><span>${esc(e.subtitle || e.text)}</span></span><span class="agenda__time">${esc(e.time)}</span></li>`).join("")}
    </ul>
  </div>
</section>

<section class="section--tight">
  <div class="wrap">
    <div class="callout-band" data-reveal>
      <h3>No room hire fee. Two private floors. <em>Your call.</em></h3>
      <div class="btn-row"><a class="btn" href="/private-events/?loc=covington#enquire">Enquire now ${arrow}</a><a class="btn btn--ghost" href="${C.giftCards}" target="_blank" rel="noopener">Gift cards</a></div>
    </div>
  </div>
</section>
`,
};
