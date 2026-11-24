import { LOC, eventsData, img, splitLines, arrow, esc, when } from "../lib.mjs";

const CATS = { music: "Live Music", sports: "Sports", trivia: "Trivia & Games", special: "Specials & Nights", seasonal: "Seasonal & Annual" };

export default {
  path: "/events/",
  title: "Events & Live Music",
  description: "What's on at Molly Malone's: bluegrass Mondays, live Irish music, team trivia, trad sessions, karaoke, happy hour, NFL Sunday Ticket and European soccer in Louisville and Covington.",
  preload: ["/assets/img/trad-session-640.webp"],
  body: () => `
<section class="page-hero page-hero--short is-emerald">
  <div class="page-hero__media" data-parallax="0.15">${img("trad-session", "", { eager: true, sizes: "100vw" })}</div>
  <div class="wrap">
    <p class="breadcrumb"><a href="/">Home</a> / Events</p>
    <h1 data-reveal-lines>${splitLines(["What's <em>on.</em>"])}</h1>
    <p class="lede" data-reveal>Sessions, songs, quizzes and kick-offs. Here's the week at both pubs — with the next date for each, worked out for you.</p>
  </div>
</section>

<section class="section--tight" data-events-app>
  <div class="wrap">
    <div class="head-row" style="margin-bottom:1.5rem">
      <div class="seg" role="group" aria-label="Filter by location">
        <button type="button" data-ev-loc="all" aria-pressed="true">Both pubs</button>
        <button type="button" data-ev-loc="louisville" aria-pressed="false">Louisville</button>
        <button type="button" data-ev-loc="covington" aria-pressed="false">Covington</button>
      </div>
      <div class="filters" role="group" aria-label="Filter by type">
        <button class="chip" type="button" data-ev-cat="all" aria-pressed="true">All</button>
        ${Object.entries(CATS).map(([k, v]) => `<button class="chip" type="button" data-ev-cat="${k}" aria-pressed="false">${v}</button>`).join("")}
      </div>
    </div>
    <p class="small muted" data-ev-summary aria-live="polite"></p>
    <ul class="event-list" data-ev-list>
      ${eventsData.events.map((e) => `
      <li class="event" data-loc="${e.location}" data-cat="${e.category}" data-id="${e.id}"${e.date ? ` data-date="${e.date}"` : ""}>
        <div class="event__date" data-next><b>${e.date ? new Date(e.date + "T12:00:00").getDate() : "—"}</b><span>${esc(when(e))}</span></div>
        <div class="event__body">
          <span class="event__cat">${CATS[e.category]}</span>
          <h3>${esc(e.title)}</h3>
          ${e.subtitle ? `<p class="sub">${esc(e.subtitle)}</p>` : ""}
          <p>${esc(e.text)}</p>
        </div>
        <div class="event__meta">
          <span><i class="loc-dot loc-dot--${e.location}"></i><b>${LOC[e.location].name}</b></span>
          <span>${esc(when(e))}</span>
          ${e.time ? `<span>${esc(e.time)}</span>` : ""}
          <a class="link" href="/${e.location}/" style="justify-self:end">Visit ${arrow}</a>
        </div>
      </li>`).join("")}
    </ul>
    <div class="menu-empty" hidden data-ev-empty>
      <p class="h3">Nothing announced here just yet.</p>
      <p class="muted">Seasonal celebrations and one-off nights are announced first on our calendars and Instagram.</p>
    </div>
    <div class="callout-band mt-3">
      <h3>Never miss a <em>session.</em></h3>
      <div class="btn-row">
        <a class="btn" href="${LOC.louisville.social.Instagram}" target="_blank" rel="noopener">@mollyshighlands</a>
        <a class="btn btn--ghost" href="${LOC.covington.social.Instagram}" target="_blank" rel="noopener">@mollyscovington</a>
      </div>
    </div>
  </div>
</section>
<script type="application/json" id="events-data">${JSON.stringify(eventsData.events)}</script>
`,
};
