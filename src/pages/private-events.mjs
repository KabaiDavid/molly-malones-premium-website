import { LOC, media, img, splitLines, arrow } from "../lib.mjs";
const C = LOC.covington, L = LOC.louisville;

const rooms = [
  { loc: "covington", key: "pub", name: "The Pub", floor: "Covington · Second floor", img: "cov-pub-pool", alt: "The second-floor Pub with pool table and handcrafted bar", seated: 64, standing: 100,
    text: "Our most characterful room: a beautiful handcrafted bar imported from Ireland, timber floors and its own entrance to the night.",
    feats: ["Private bar imported from Ireland", "Pool table, darts & five TVs", "Updated AV system", "About 1,400 sq ft", "Elevator access & private restrooms"] },
  { loc: "covington", key: "ballroom", name: "The Emerald Ballroom", floor: "Covington · Third floor", img: "cov-ballroom", alt: "The Emerald Ballroom set with round tables in black linen", seated: 80, standing: 125,
    text: "Made for dinners, receptions and big announcements — with large 6-foot round tables dressed in black linen and a 10-foot projection screen.",
    feats: ["Private bar", "10-foot projection screen", "6-foot round tables, black linens", "About 1,400 sq ft", "Elevator access & private restrooms"] },
  { loc: "louisville", key: "upper-deck", name: "The Upper Deck", floor: "Louisville · Outdoor, covered & heated", img: "lou-exterior", alt: "The Baxter Avenue building and garden in Louisville", seated: 100, standing: null,
    text: "An outdoor, covered and heated deck above the garden, with its own private bar — open-air atmosphere in any season.",
    feats: ["Private bar", "Covered & heated", "$1,000 minimum spend", "DirecTV / Insight Digital televisions", "Wireless internet"] },
  { loc: "louisville", key: "shebeen", name: "The Shebeen", floor: "Louisville · Private dining room", img: "lou-backbar", alt: "Dark timber and warm light in the Louisville pub", seated: 35, standing: null,
    text: "A separate dining area named for the old Irish house-pub — intimate, warm and yours for the evening.",
    feats: ["No room rental fee", "Seats up to 35", "Ideal for rehearsal dinners & birthdays", "Music through the house system"] },
];

export default {
  path: "/private-events/",
  title: "Private Events & Parties",
  description: "Host your event at Molly Malone's: private floors with their own bars in Covington (up to 125 guests) and Louisville's Upper Deck and Shebeen. Birthdays, rehearsal dinners, corporate events, wakes and watch parties.",
  preload: ["/assets/img/cov-2nd-floor-dinner-640.webp"],
  body: () => `
<section class="page-hero">
  <div class="page-hero__media" data-parallax="0.15">${img("cov-2nd-floor-dinner", "", { eager: true, sizes: "100vw" })}</div>
  <div class="wrap">
    <p class="breadcrumb"><a href="/">Home</a> / Private Events</p>
    <h1 data-reveal-lines>${splitLines(["Gather", "<em>your people.</em>"])}</h1>
    <p class="lede" data-reveal>Private rooms with their own bars, a kitchen that knows how to feed a crowd, and a team that's hosted it all — from first birthdays to final farewells.</p>
    <div class="btn-row mt-2" data-reveal>
      <a class="btn" href="#enquire">Enquire now ${arrow}</a>
      <a class="btn btn--ghost" href="#rooms">Explore the rooms</a>
    </div>
  </div>
</section>

<section class="section--tight">
  <div class="wrap">
    <p class="eyebrow" data-reveal>Made for</p>
    <div class="occasions" data-reveal>
      ${["Birthdays", "Rehearsal dinners", "Wedding receptions", "Engagement parties", "Corporate events", "Holiday parties", "Retirements", "Family gatherings", "Watch parties", "Wakes"].map((o) => `<span>${o}</span>`).join("")}
    </div>
  </div>
</section>

<section class="section" id="rooms" data-rooms-app>
  <div class="wrap">
    <div class="head-row">
      <div>
        <p class="eyebrow" data-reveal>The rooms</p>
        <h2 class="h1" data-reveal-lines>${splitLines(["Four rooms.", "<em>Two cities.</em>"])}</h2>
      </div>
      <div class="seg rooms-switch" role="group" aria-label="Filter rooms by location">
        <button type="button" data-room-loc="all" aria-pressed="true">All</button>
        <button type="button" data-room-loc="covington" aria-pressed="false">Covington</button>
        <button type="button" data-room-loc="louisville" aria-pressed="false">Louisville</button>
      </div>
    </div>
    ${rooms.map((r) => `
    <article class="room" data-loc="${r.loc}" id="room-${r.key}">
      ${media(r.img, r.alt, { reveal: true, sizes: "(max-width: 900px) 100vw, 58vw" })}
      <div class="room__copy">
        <span class="floor__label">${r.floor}</span>
        <h3>${r.name}</h3>
        <p class="muted">${r.text}</p>
        <div class="room__nums">
          <div><b>${r.seated}</b><span>Seated</span></div>
          ${r.standing ? `<div><b>${r.standing}</b><span>Cocktail</span></div>` : ""}
        </div>
        <ul>${r.feats.map((f) => `<li>${f}</li>`).join("")}</ul>
        <button class="btn btn--ghost mt-1" type="button" data-pick-room="${r.loc}|${r.name}">Enquire about ${r.name} ${arrow}</button>
      </div>
    </article>`).join("")}
  </div>
</section>

<section class="section is-light">
  <div class="wrap">
    <div class="head-row">
      <div>
        <p class="eyebrow" data-reveal>Good to know</p>
        <h2 class="h1" data-reveal-lines>${splitLines(["Simple terms,", "<em>no surprises.</em>"])}</h2>
      </div>
    </div>
    <div class="terms">
      <div data-reveal>
        <h3>Covington</h3>
        <ul>
          <li>No room hire fee — a $500 food minimum and a $100 refundable deposit</li>
          <li>Both private floors together: $1,000 charge</li>
          <li>Reservations up to four hours</li>
          <li>Our event coordinator can hold a date for a week on request</li>
          <li>Deposit refundable with 21 days' notice of cancellation</li>
          <li>6% sales tax and 20% gratuity on food and beverage</li>
          <li>Buffet packages for groups of 15 – 125 — half orders serve about 15, full orders about 30</li>
          <li>Bring your own music, a band, karaoke or a DJ — or enjoy ambient background music</li>
        </ul>
      </div>
      <div data-reveal style="--d:.1s">
        <h3>Louisville</h3>
        <ul>
          <li>No room rental fee for The Shebeen</li>
          <li>$1,000 minimum spend for the Upper Deck</li>
          <li>Party food prices include non-alcoholic beverages</li>
          <li>18% service charge added to all party checks</li>
          <li>Appetizer buffet for 30+ guests (three-item minimum), prix fixe dinner or limited menu for up to 25</li>
          <li>All party music runs through the house system</li>
          <li>Televisions by DirecTV and/or Insight Digital; wireless internet throughout</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section" id="enquire">
  <div class="wrap split">
    <div>
      <p class="eyebrow" data-reveal>Enquire</p>
      <h2 class="h1" data-reveal-lines>${splitLines(["Tell us about", "<em>the occasion.</em>"])}</h2>
      <p class="lede mt-2" data-reveal>Share a few details and the right pub's event team will come back to you with availability and menus.</p>
      <ul class="contact-list mt-2" data-reveal>
        <li><span>Covington</span><a href="tel:${C.tel}">${C.phone}</a></li>
        <li><span></span><a href="mailto:${C.email}">${C.email}</a></li>
        <li><span>Louisville</span><a href="tel:${L.tel}">${L.phone}</a></li>
        <li><span></span><a href="mailto:${L.email}">${L.email}</a></li>
      </ul>
      <div class="media mt-2" style="aspect-ratio:16/10" data-reveal="mask">${img("cov-buffet", "A private event buffet on the second floor in Covington", { sizes: "(max-width: 900px) 100vw, 40vw" })}</div>
    </div>
    <form class="form" name="private-event" method="POST" action="/thanks/" data-netlify="true" netlify-honeypot="company" data-enquiry-form novalidate>
      <input type="hidden" name="form-name" value="private-event">
      <p class="hp"><label>Leave this empty <input name="company" tabindex="-1" autocomplete="off"></label></p>
      <div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" required autocomplete="name"><span class="err" aria-live="polite"></span></div>
      <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" required autocomplete="email"><span class="err" aria-live="polite"></span></div>
      <div class="field"><label for="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" autocomplete="tel"><span class="err"></span></div>
      <div class="field"><label for="f-loc">Location</label>
        <select id="f-loc" name="location" required><option value="">Choose a pub</option><option value="covington">Covington</option><option value="louisville">Louisville</option></select><span class="err" aria-live="polite"></span></div>
      <div class="field"><label for="f-room">Preferred room</label>
        <select id="f-room" name="room"><option value="">Not sure yet</option>${rooms.map((r) => `<option value="${r.name}" data-loc="${r.loc}">${r.name}</option>`).join("")}</select><span class="err"></span></div>
      <div class="field"><label for="f-type">Occasion</label>
        <select id="f-type" name="occasion"><option value="">Choose</option>${["Birthday", "Rehearsal dinner", "Wedding reception", "Engagement party", "Corporate event", "Holiday party", "Retirement", "Family gathering", "Watch party", "Wake", "Other"].map((o) => `<option>${o}</option>`).join("")}</select><span class="err"></span></div>
      <div class="field"><label for="f-date">Preferred date</label><input id="f-date" name="date" type="date" required><span class="err" aria-live="polite"></span></div>
      <div class="field"><label for="f-guests">Guests</label><input id="f-guests" name="guests" type="number" min="1" max="200" inputmode="numeric" required><span class="err" aria-live="polite"></span></div>
      <div class="field full"><label for="f-msg">Anything else?</label><textarea id="f-msg" name="message" placeholder="Timings, food ideas, music, accessibility needs…"></textarea></div>
      <div class="full btn-row" style="align-items:center"><button class="btn" type="submit">Send enquiry ${arrow}</button><span class="form__note">We'll reply by email or phone. Nothing is booked until confirmed by our team.</span></div>
      <div class="form-status" role="status" data-form-status></div>
    </form>
  </div>
</section>
`,
};
