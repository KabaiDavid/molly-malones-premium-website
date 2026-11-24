import { LOC, media, img, splitLines, arrow } from "../lib.mjs";
const C = LOC.covington, L = LOC.louisville;

export default {
  path: "/sports/",
  title: "Sports & Game Day",
  description: "Watch it at Molly's: European soccer from early on weekends, Six Nations rugby, hurling, NFL Sunday Ticket, Cards and UK games — plus a free shuttle to every Bengals game from Covington.",
  preload: ["/assets/img/cov-world-cup-1280.webp"],
  body: () => `
<section class="page-hero is-emerald">
  <div class="page-hero__media" data-parallax="0.15">${img("cov-world-cup", "", { eager: true, sizes: "100vw" })}</div>
  <div class="wrap">
    <p class="breadcrumb"><a href="/">Home</a> / Sports</p>
    <h1 data-reveal-lines>${splitLines(["Every match.", "<em>One roar.</em>"])}</h1>
    <p class="lede" data-reveal>Kick-offs in Europe, scrums in Dublin, touchdowns in Cincinnati. If it's on, we'll have it — and the room will be loud.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <p class="eyebrow" data-reveal>On the screens</p>
    <h2 class="h1 mb-3" data-reveal-lines>${splitLines(["What we <em>show.</em>"])}</h2>
    <ul class="agenda">
      <li data-reveal><span class="agenda__when">Soccer</span><span class="agenda__what"><b>European &amp; international football</b><span>International football on the wide screens in Louisville; Covington opens early on weekends for European soccer.</span></span><span class="agenda__time">Both pubs</span></li>
      <li data-reveal><span class="agenda__when">Rugby</span><span class="agenda__what"><b>Six Nations</b><span>Covington always shows the Six Nations; Louisville shows rugby on its wide-screen HDTVs.</span></span><span class="agenda__time">Both pubs</span></li>
      <li data-reveal><span class="agenda__when">NFL</span><span class="agenda__what"><b>NFL Sunday Ticket</b><span>Every NFL game, live, on lots of large flat screens.</span></span><span class="agenda__time">Covington</span></li>
      <li data-reveal><span class="agenda__when">Gaelic games</span><span class="agenda__what"><b>Hurling</b><span>The fastest game on grass, on our wide-screen HDTVs.</span></span><span class="agenda__time">Louisville</span></li>
      <li data-reveal><span class="agenda__when">College</span><span class="agenda__what"><b>Cards &amp; UK</b><span>The latest Louisville and Kentucky games.</span></span><span class="agenda__time">Louisville</span></li>
    </ul>
  </div>
</section>

<section class="section is-burgundy">
  <div class="wrap split">
    <div>${media("cov-soccer-fans", "Two supporters in their club shirts at the Covington bar", { reveal: true, sizes: "(max-width: 900px) 100vw, 42vw", style: "aspect-ratio:4/5" })}</div>
    <div>
      <p class="eyebrow" data-reveal>Covington game day</p>
      <h2 class="h1" data-reveal-lines>${splitLines(["The free", "<em>Bengals shuttle.</em>"])}</h2>
      <p class="lede mt-2" data-reveal>We run a free shuttle to all the Bengals games. We drop you off, we pick you up — and the post-game is downstairs.</p>
      <div class="capacity" data-reveal>
        <div><b>Free</b><span>Shuttle to every Bengals game</span></div>
        <div><b>3–6pm</b><span>Weekday happy hour</span></div>
        <div><b>2:30am</b><span>Bar open nightly</span></div>
        <div><b>5 TVs</b><span>In the private Pub room</span></div>
      </div>
      <div class="btn-row" data-reveal>
        <a class="btn" href="tel:${C.tel}">Call Covington ${arrow}</a>
        <a class="btn btn--ghost" href="/private-events/?loc=covington#enquire">Book a watch party</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div>
      <p class="eyebrow" data-reveal>Louisville game day</p>
      <h2 class="h1" data-reveal-lines>${splitLines(["Main floor for the match.", "<em>Garden for after.</em>"])}</h2>
      <p class="lede mt-2" data-reveal>Pub fare and live sport on the big screens downstairs; heat lamps and cornhole upstairs; the garden when the whistle blows.</p>
      <div class="btn-row mt-2" data-reveal>
        <a class="btn" href="mailto:${L.email}?subject=Game%20day%20table%20%E2%80%94%20Louisville">Reserve for the game ${arrow}</a>
        <a class="btn btn--ghost" href="/louisville/">Explore Louisville</a>
      </div>
    </div>
    <div>${media("lou-guinness-bar", "A pint of Guinness on the bar at Louisville", { reveal: true, sizes: "(max-width: 900px) 100vw, 50vw", style: "aspect-ratio:1" })}</div>
  </div>
</section>

<section class="section--tight">
  <div class="wrap">
    <div class="callout-band" data-reveal>
      <h3>Bringing the whole supporters' club? <em>Take a floor.</em></h3>
      <a class="btn" href="/private-events/#enquire">Plan a watch party ${arrow}</a>
    </div>
  </div>
</section>
`,
};
