import { media, img, splitLines, arrow } from "../lib.mjs";

export default {
  path: "/our-story/",
  title: "Our Story",
  description: "From Joseph Hermes's 1888 saloon to an Irish-owned pub at the foot of the Roebling Bridge — the story of Molly Malone's in Covington and Louisville.",
  preload: ["/assets/img/cov-hermes-building-640.webp"],
  body: () => `
<section class="page-hero is-burgundy">
  <div class="page-hero__media" data-parallax="0.15">${img("cov-hermes-building", "", { eager: true, sizes: "100vw" })}</div>
  <div class="wrap">
    <p class="breadcrumb"><a href="/">Home</a> / Our Story</p>
    <h1 data-reveal-lines>${splitLines(["In Dublin's", "fair city —", "<em>and Kentucky.</em>"])}</h1>
    <p class="lede" data-reveal>Named for the most famous fishmonger in song. Built on a corner that's poured drinks since 1888.</p>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div>
      <p class="eyebrow" data-reveal>Who was Molly Malone?</p>
      <h2 class="h1" data-reveal-lines>${splitLines(["“Cockles and", "<em>mussels,</em>", "alive, alive-o.”"])}</h2>
    </div>
    <div class="prose" data-reveal>
      <p>Every Irish pub has a song that gets the whole room going, and for generations that song has been <em>Molly Malone</em> — the ballad of a Dublin girl wheeling her barrow through streets broad and narrow. Dublin's unofficial anthem. A name that means a warm welcome and a full voice.</p>
      <p>Our pubs carry that name and that spirit: great food and drink in a loose, friendly environment. Irish-owned and operated, with an open door to everyone. Come as a stranger, leave as a friend.</p>
    </div>
  </div>
</section>

<section class="section is-light">
  <div class="wrap">
    <p class="eyebrow" data-reveal>The Hermes Building, Covington</p>
    <h2 class="h1 mb-3" data-reveal-lines>${splitLines(["One corner,", "<em>five lives.</em>"])}</h2>
    <ol class="timeline" data-reveal>
      <li><b>1888</b><p>German immigrant Joseph Hermes builds the Hermes Building at 112 E 4th Street and operates it as a saloon.</p></li>
      <li><b>1899</b><p>The building serves as a temporary City Hall while the courthouse is constructed.</p></li>
      <li><b>1926</b><p>Alban Wolff buys the building: a print shop downstairs, apartments on the upper floors.</p></li>
      <li><b>1997</b><p>Jack Welles and Aidan Bowles buy and renovate the building, turning it into an Irish pub.</p></li>
      <li><b>2005</b><p>Quinn's closes its doors.</p></li>
      <li><b>2007</b><p>The current owners open Molly Malone's — Irish-owned and operated.</p></li>
    </ol>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div>${media("cov-corner", "The restored Hermes Building on the corner of East 4th Street", { reveal: true, sizes: "(max-width: 900px) 100vw, 42vw", style: "aspect-ratio:4/5" })}</div>
    <div>
      <p class="eyebrow" data-reveal>And the one who stayed</p>
      <h2 class="h2" data-reveal-lines>${splitLines(["Rumour has it a ghost", "still resides in the building.", "<em>Ask the late shift.</em>"])}</h2>
      <p class="lede mt-2" data-reveal>Over a century of saloon nights, civic business, printing presses and pints leaves its mark. Some say not everyone checked out.</p>
      <hr class="rule mt-3">
      <p class="eyebrow mt-3" data-reveal>Recognition</p>
      <p data-reveal>Named one of the best Irish pubs in the country by BuzzFeed's “The Best Irish Bar In Every State” (2016), and recognised by <em>Cincinnati Magazine</em> as a home for the region's soccer supporters.</p>
    </div>
  </div>
</section>

<section class="section is-emerald">
  <div class="wrap split">
    <div>
      <p class="eyebrow" data-reveal>Baxter Avenue, Louisville</p>
      <h2 class="h1" data-reveal-lines>${splitLines(["Built from", "the stones of", "<em>an Irish pub.</em>"])}</h2>
      <p class="lede mt-2" data-reveal>In Louisville's Highlands, the story goes that Molly Malone's was built from the stones of a pub in Ireland. Open seven days a week for lunch and dinner, with the garden, the neon and the session players carrying it on.</p>
      <a class="btn mt-2" href="/louisville/" data-reveal>Visit Louisville ${arrow}</a>
    </div>
    <div>${media("trad-session", "A traditional Irish music session, walls lined with framed pictures", { reveal: true, sizes: "(max-width: 900px) 100vw, 50vw", style: "aspect-ratio:1" })}</div>
  </div>
</section>
`,
};
