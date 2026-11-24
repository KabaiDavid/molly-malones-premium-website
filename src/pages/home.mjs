import { LOC, media, img, splitLines, arrow, statusBadge, hoursTable, esc, eventsData, site } from "../lib.mjs";

const plates = [
  ["fish-chips", "Fish & Chips", "Beer-battered cod, seasoned fries, coleslaw and tartar sauce. The dish we're known for.", "Beer-battered fish and chips with coleslaw, tartar sauce and lemon"],
  ["reuben", "The Reuben", "Corned beef, sauerkraut, thousand island and Swiss on toasted rye.", "A Reuben sandwich stacked with corned beef and sauerkraut on toasted rye"],
  ["shepherds-pie", "Shepherd's Pie", "Under a golden crown of mash — with a pint of Smithwick's alongside.", "Shepherd's pie topped with mashed potato beside crispy Brussels sprouts"],
  ["irish-breakfast", "The Full Irish", "Rasher, banger, white and black pudding, beans, egg and grilled tomato.", "A full Irish breakfast with rashers, sausage, black and white pudding and beans"],
  ["mollys-burger", "Molly's Burger", "Irish cheddar, caramelized onion, rasher bacon and whiskey mayo.", "Molly's burger with melted Irish cheddar on a toasted brioche bun"],
  ["key-lime-pie", "Key Lime Pie", "Fresh cream and lime zest. Hard to beat, and we've tried.", "A slice of key lime pie with fresh cream"],
];

const whiskeys = ["Redbreast 12 · 15 · 18 · 21", "Midleton Very Rare", "Green Spot", "Red Spot 15", "Jameson 18", "Teeling Small Batch", "Powers Gold", "Slane Triple Casked", "Bushmills Original", "Blanton's", "E.H. Taylor", "King of Kentucky"];

export default {
  path: "/",
  title: "Home",
  description: "Irish-owned pubs in Louisville's Highlands and Covington's historic 1888 Hermes Building. Fish & chips, Reubens, perfect pints of Guinness, live trad and bluegrass, every match on the big screens.",
  preload: ["/assets/img/bar-interior-dark-1280.webp"],
  scripts: [`<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/"}}</script>`, `<script type="module" src="/assets/js/pour.js"></script>`],
  body: () => `
<section class="hero grain" aria-label="Welcome to Molly Malone's" data-hero>
  <div class="hero__media" aria-hidden="true">
    <!-- To use film footage, add: <video autoplay muted loop playsinline poster="..."><source src="/assets/video/hero.webm" type="video/webm"></video> -->
    <div class="hero__slide is-active">${img("bar-interior-dark", "", { eager: true, sizes: "100vw" })}</div>
    <div class="hero__slide">${img("trad-session", "", { sizes: "100vw" })}</div>
    <div class="hero__slide">${img("cov-irish-bar", "", { sizes: "100vw" })}</div>
    <div class="hero__slide">${img("lou-neon-night", "", { sizes: "100vw" })}</div>
  </div>
  <div class="hero__shade"></div>
  <p class="hero__meta" aria-hidden="true">Irish Pub &amp; Restaurant<br><span>Louisville</span> · <span>Covington</span><br>Kentucky</p>
  <div class="wrap hero__inner">
    <p class="eyebrow" data-reveal>Come as a stranger, leave as a friend</p>
    <h1 class="hero__title" data-reveal-lines>
      ${splitLines(["Good people.", "Great <em>pours.</em>", "No ordinary nights."], 0.15, 0.12)}
    </h1>
    <div class="hero__foot">
      <div>
        <p data-reveal style="--d:.6s">Two Irish pubs, one open door. Proper pints, honest food, live music and every match that matters — in Louisville's Highlands and Covington's 1888 Hermes Building.</p>
        <div class="btn-row mt-2" data-reveal style="--d:.75s">
          <a class="btn" href="#experience">Explore Molly's ${arrow}</a>
          <a class="btn btn--ghost" href="/menu/">View Menu</a>
          <button class="btn btn--ghost" type="button" data-open-chooser>Find Your Pub</button>
        </div>
        <div class="hero__progress" role="group" aria-label="Hero images" data-hero-dots></div>
      </div>
      <a class="scroll-cue" href="#experience" aria-label="Scroll to explore"><i></i>Scroll</a>
    </div>
  </div>
</section>

<section class="section" id="experience" aria-labelledby="exp-title">
  <div class="wrap experience">
    <div class="experience__intro">
      <p class="eyebrow" data-reveal>No. 01 — The Welcome</p>
      <h2 id="exp-title" class="experience__quote" data-reveal-lines>${splitLines(["A loose, friendly", "room. A <em>proper</em>", "pint. And nobody", "stays a stranger."])}</h2>
      <p class="lede" data-reveal>Molly Malone's is Irish-owned and operated. Great food and drink in a loose, friendly environment — the kind of place where the bartender knows your order by the second visit and the session players wave you over by the third.</p>
      <div class="facts" data-reveal>
        <div class="fact"><b>1888</b><span>Hermes Building</span></div>
        <div class="fact"><b>2007</b><span>Doors opened</span></div>
        <div class="fact"><b>2</b><span>Kentucky homes</span></div>
      </div>
    </div>
    <div class="experience__images">
      <figure>${media("lou-guinness-harp", "A freshly poured pint of Guinness beside the brass harp tap", { reveal: true, sizes: "(max-width: 900px) 50vw, 40vw", attrs: 'data-parallax="0.06"' })}<figcaption class="caption">The perfect pour, Baxter Avenue</figcaption></figure>
      <figure>${media("trad-session", "Musicians playing a traditional Irish session in the pub, fiddles and bodhrán", { reveal: true, sizes: "(max-width: 900px) 50vw, 36vw" })}<figcaption class="caption">Session night</figcaption></figure>
    </div>
  </div>
</section>

<section class="plates is-light" aria-labelledby="plates-title" data-plates>
  <div class="plates__pin">
    <div class="plates__sticky">
      <div class="wrap plates__head">
        <div>
          <p class="eyebrow">No. 02 — The Kitchen</p>
          <h2 id="plates-title" class="h1">Irish classics,<br><em>done properly.</em></h2>
        </div>
        <div>
          <p class="plates__count" aria-hidden="true"><span data-plate-index>01</span> / 0${plates.length}</p>
          <a class="link" href="/menu/">See the full menu ${arrow}</a>
        </div>
      </div>
      <div class="plates__track" data-plates-track>
        ${plates.map(([im, name, txt, alt], i) => `
        <a class="plate" href="/menu/">
          ${media(im, alt, { sizes: "(max-width: 900px) 78vw, 30vw" })}
          <span class="plate__no">0${i + 1}</span>
          <h3>${name}</h3>
          <p>${txt}</p>
        </a>`).join("")}
      </div>
    </div>
  </div>
</section>

<section class="pour" aria-labelledby="pour-title" data-pour>
  <div class="pour__sticky">
    <div class="pour__stage" data-pour-stage aria-hidden="true">
      <svg class="pour__svg" data-pour-svg role="presentation" focusable="false"></svg>
    </div>
    <div class="pour__poster">${media("lou-guinness-bar", "A pint of Guinness settling on the bar", { sizes: "(max-width: 900px) 100vw, 50vw" })}</div>
    <div class="pour__veil" aria-hidden="true"></div>
    <div class="pour__gauge" aria-hidden="true">
      <span class="pour__track"><i data-pour-gauge></i></span>
      <b data-pour-pct>0%</b>
      <small>The pour</small>
    </div>
    <div class="pour__copy">
      <div class="pour__step is-active" data-step="0">
        <p class="eyebrow">No. 03 — The Bar</p>
        <h2 id="pour-title" class="h1">It begins with<br><em>a clean glass.</em></h2>
        <p class="lede">Rinsed, cold, held at forty-five degrees beneath the tap. Scroll to pour.</p>
        <span class="pour__hint" aria-hidden="true"><i></i>Scroll</span>
      </div>
      <div class="pour__step" data-step="1" inert>
        <p class="eyebrow">The first pour</p>
        <p class="h1 pour__title">Steady, down<br><em>the side.</em></p>
        <p class="lede">Three-quarters full, nice and slow. Guinness on draft at both pubs — alongside Harp, Smithwick's, Kilkenny and Magners.</p>
      </div>
      <div class="pour__step" data-step="2" inert>
        <p class="eyebrow">The surge</p>
        <p class="h1 pour__title">Tan to black,<br><em>bottom to top.</em></p>
        <p class="lede">Watch the cascade roll down the glass as the stout settles. Good things take a little time — every bartender here will tell you.</p>
      </div>
      <div class="pour__step" data-step="3" inert>
        <p class="eyebrow">The top-up</p>
        <p class="h1 pour__title">Poured with<br><em>patience.</em></p>
        <ul class="taps">
          <li>Guinness <small>Draught</small></li>
          <li>Harp <small>Lager</small></li>
          <li>Smithwick's <small>Ale</small></li>
          <li>Kilkenny <small>Cream Ale</small></li>
          <li>Magners <small>Cider</small></li>
          <li>Jameson <small>On draft</small></li>
        </ul>
        <a class="link" href="/menu/?menu=drinks">Explore drinks ${arrow}</a>
      </div>
    </div>
  </div>
</section>

<section class="section--tight whiskey-band" aria-labelledby="shelf-title">
  <div class="wrap whiskey-shelf">
    <h3 id="shelf-title" data-reveal>And from the top shelf</h3>
    <ul data-reveal>${whiskeys.map((w) => `<li>${w}</li>`).join("")}</ul>
  </div>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee__inner">${Array(2).fill(["Bluegrass Mondays", "Irish music Tuesdays", "Team Trivia", "Missy Werner Thursdays", "Third-Sunday Trad Session", "NFL Sunday Ticket", "Six Nations Rugby", "European Soccer"].map((t) => `<span>${t}</span>`).join("")).join("")}</div></div>

<section class="section" aria-labelledby="week-title">
  <div class="wrap">
    <div class="head-row">
      <div>
        <p class="eyebrow" data-reveal>No. 04 — The Week Ahead</p>
        <h2 id="week-title" class="h1" data-reveal-lines>${splitLines(["Something on,", "<em>every night.</em>"])}</h2>
      </div>
      <div class="stack">
        <div class="week-legend"><span><i class="loc-dot loc-dot--louisville"></i>Louisville</span><span><i class="loc-dot loc-dot--covington"></i>Covington</span></div>
        <a class="link" href="/events/">All events &amp; live music ${arrow}</a>
      </div>
    </div>
    <div class="week" data-week aria-live="polite"></div>
    <noscript><p class="muted">See <a href="/events/">all events</a>.</p></noscript>
  </div>
</section>

<section class="fullbleed is-emerald" aria-labelledby="sports-title">
  <div class="fullbleed__media" data-parallax="-0.12">${img("cov-world-cup", "A packed main floor of fans watching the World Cup at Molly Malone's Covington", { sizes: "100vw" })}</div>
  <div class="wrap">
    <div class="fullbleed__copy">
      <p class="eyebrow" data-reveal>No. 05 — Game Day</p>
      <h2 id="sports-title" class="h1" data-reveal-lines>${splitLines(["If it's on,", "<em>we'll have it.</em>"])}</h2>
      <ul class="ticker" data-reveal>
        <li><b>Soccer</b><span>Open early on weekends for Europe</span></li>
        <li><b>Rugby</b><span>Six Nations, always</span></li>
        <li><b>NFL Sunday Ticket</b><span>Every game, Covington</span></li>
        <li><b>Hurling</b><span>Plus Cards &amp; UK, Louisville</span></li>
      </ul>
      <p class="muted" data-reveal>Covington runs a <strong>free shuttle to every Bengals game</strong> — dropped off, picked up, first round back at Molly's.</p>
      <a class="btn mt-2" href="/sports/" data-reveal>The sports experience ${arrow}</a>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="private-title">
  <div class="wrap private">
    <div class="private__media">
      ${media("cov-ballroom", "The third-floor ballroom set for a dinner with round tables dressed in black linen", { reveal: true, sizes: "(max-width: 900px) 60vw, 35vw" })}
      ${media("cov-irish-bar", "The handcrafted bar imported from Ireland on the second floor", { reveal: true, sizes: "(max-width: 900px) 40vw, 22vw", style: "--d:.15s" })}
      ${media("cov-buffet", "A private event buffet laid out on the second floor", { reveal: true, sizes: "(max-width: 900px) 40vw, 22vw", style: "--d:.3s" })}
    </div>
    <div class="private__copy">
      <p class="eyebrow" data-reveal>No. 06 — Private Events</p>
      <h2 id="private-title" class="h2" data-reveal-lines>${splitLines(["Your own floor.", "Your own bar.", "<em>Your night.</em>"])}</h2>
      <p class="muted mt-2" data-reveal>Birthdays, rehearsal dinners, corporate evenings, wakes and watch parties — hosted in private rooms with their own bars, from an intimate snug to a ballroom.</p>
      <div class="capacity" data-reveal>
        <div><b>125</b><span>Ballroom · cocktail</span></div>
        <div><b>100</b><span>The Pub · cocktail</span></div>
        <div><b>100</b><span>Upper Deck · seated</span></div>
        <div><b>35</b><span>The Shebeen</span></div>
      </div>
      <div class="btn-row" data-reveal>
        <a class="btn" href="/private-events/#enquire">Start planning ${arrow}</a>
        <a class="btn btn--ghost" href="/private-events/">See the rooms</a>
      </div>
    </div>
  </div>
</section>

<section aria-labelledby="loc-title">
  <h2 id="loc-title" class="sr-only">Our two locations</h2>
  <div class="locsplit">
    ${["louisville", "covington"].map((k) => {
      const L = LOC[k];
      const im = k === "louisville" ? ["lou-neon-night", "The glowing Molly Malone's sign above the Baxter Avenue garden at night"] : ["cov-corner", "The red-brick 1888 Hermes Building on the corner of 4th Street, Covington"];
      return `
    <a class="locpanel locpanel--${k}" href="/${k}/">
      ${media(im[0], im[1], { sizes: "(max-width: 800px) 100vw, 50vw" })}
      <div>
        <p class="locpanel__sub">${esc(L.nickname)}</p>
        <h3 class="locpanel__name">${L.name}</h3>
        <div class="locpanel__meta"><span>${L.address}</span><span>${L.phone}</span>${statusBadge(k)}</div>
        <span class="link">Enter ${L.name} ${arrow}</span>
      </div>
    </a>`;
    }).join("")}
  </div>
</section>

<section class="section is-light" aria-labelledby="story-title">
  <div class="wrap">
    <div class="split mb-3">
      <div>
        <p class="eyebrow" data-reveal>No. 07 — Our Story</p>
        <h2 id="story-title" class="h1" data-reveal-lines>${splitLines(["A saloon in 1888.", "<em>A local ever since.</em>"])}</h2>
      </div>
      <div>
        <p class="lede" data-reveal>At the foot of the Roebling Suspension Bridge, the Hermes Building has been a saloon, a temporary City Hall, a print shop and an Irish pub. In 2007, Molly Malone's opened its doors — and a few say one old regular never left.</p>
        <a class="link mt-1" href="/our-story/" data-reveal>Read the full story ${arrow}</a>
      </div>
    </div>
    <ol class="timeline" data-reveal>
      <li><b>1888</b><p>German immigrant Joseph Hermes builds the Hermes Building and runs it as a saloon.</p></li>
      <li><b>1899</b><p>The building serves as a temporary City Hall while the courthouse is built.</p></li>
      <li><b>1926</b><p>Alban Wolff buys the building — a print shop below, apartments above.</p></li>
      <li><b>1997</b><p>Jack Welles and Aidan Bowles restore it and open an Irish pub.</p></li>
      <li><b>2007</b><p>Molly Malone's opens in Covington, Irish-owned and operated.</p></li>
      <li><b>Today</b><p>Two homes in Kentucky — Covington and Louisville's Highlands.</p></li>
    </ol>
  </div>
</section>

<section class="section is-burgundy" aria-labelledby="press-title">
  <div class="wrap press">
    <h2 id="press-title" class="sr-only">Recognition</h2>
    <blockquote data-reveal>Named one of the best Irish pubs in the country.<cite>BuzzFeed — “The Best Irish Bar In Every State,” 2016</cite></blockquote>
    <aside data-reveal>
      <p class="eyebrow eyebrow--plain">Also noted</p>
      <p>Named by <em>Cincinnati Magazine</em> as a home for the region's soccer supporters.</p>
    </aside>
  </div>
</section>

<section class="section" aria-labelledby="visit-title">
  <div class="wrap">
    <div class="head-row">
      <div>
        <p class="eyebrow" data-reveal>No. 08 — Visit</p>
        <h2 id="visit-title" class="h1" data-reveal-lines>${splitLines(["The door's open.", "<em>Come in.</em>"])}</h2>
      </div>
    </div>
    <div class="visit">
      ${["louisville", "covington"].map((k) => {
        const L = LOC[k];
        return `
      <div class="visit__col" data-reveal>
        <h3>${L.name} ${statusBadge(k)}</h3>
        <p class="muted">${L.address}, ${L.city}<br><a href="tel:${L.tel}">${L.phone}</a> · <a href="mailto:${L.email}">${L.email}</a></p>
        ${hoursTable(L, "bar")}
        <div class="btn-row">
          <a class="btn" href="${L.directions}" target="_blank" rel="noopener">Directions ${arrow}</a>
          <a class="btn btn--ghost" href="/${k}/">Explore</a>
        </div>
      </div>`;
      }).join("")}
    </div>
  </div>
</section>
<script type="application/json" id="events-data">${JSON.stringify(eventsData.events)}</script>
`,
};
