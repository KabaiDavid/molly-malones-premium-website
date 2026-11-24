import { LOC, media, splitLines, arrow, hoursTable, statusBadge } from "../lib.mjs";

export default {
  path: "/contact/",
  title: "Contact & Locations",
  description: "Find Molly Malone's: 933 Baxter Ave, Louisville (502.473.1222) and 112 E 4th St, Covington (859.491.6659). Opening hours, directions, phone and email.",
  body: () => `
<section class="section" style="padding-top:calc(var(--header-h) + 4rem)">
  <div class="wrap">
    <p class="breadcrumb"><a href="/">Home</a> / Contact</p>
    <h1 class="display" data-reveal-lines>${splitLines(["Find", "<em>your Molly's.</em>"])}</h1>
  </div>
</section>

<section class="section--tight" id="find">
  <div class="wrap">
    ${["louisville", "covington"].map((k, i) => {
      const L = LOC[k];
      return `
    <article class="split split--even ${i ? "mt-3" : ""}" id="${i ? "" : "call"}" style="padding-top:2.5rem;border-top:1px solid var(--line)">
      <div>
        <p class="eyebrow">${L.nickname}</p>
        <h2 class="h1">${L.name}</h2>
        <div class="mt-1">${statusBadge(k)}</div>
        <ul class="contact-list">
          <li><span>Address</span><span>${L.address}, ${L.city}</span></li>
          <li><span>Phone</span><a href="tel:${L.tel}">${L.phone}</a></li>
          <li><span>Email</span><a href="mailto:${L.email}">${L.email}</a></li>
          <li><span>Brunch</span><span>${L.brunch}</span></li>
          ${L.happyHour ? `<li><span>Happy hour</span><span>${L.happyHour}</span></li>` : ""}
        </ul>
        <div class="split split--even">${hoursTable(L, "bar")}${hoursTable(L, "kitchen")}</div>
        <div class="btn-row">
          <a class="btn" href="${L.directions}" target="_blank" rel="noopener">Directions ${arrow}</a>
          <a class="btn btn--ghost" href="tel:${L.tel}">Call</a>
          <a class="btn btn--ghost" href="/${k}/">Explore ${L.name}</a>
        </div>
      </div>
      <div>
        <div class="map" data-map="${encodeURIComponent(L.mapQuery)}">
          <div class="map__load">
            <div>
              <p class="chapter">${L.address}</p>
              <button class="btn btn--ghost" type="button" data-load-map>Load interactive map</button>
              <p class="small muted mt-1">Loads Google Maps.</p>
            </div>
          </div>
        </div>
      </div>
    </article>`;
    }).join("")}
  </div>
</section>

<section class="section is-light">
  <div class="wrap split">
    <div>
      <p class="eyebrow">Say hello</p>
      <h2 class="h1">General <em>enquiries.</em></h2>
      <p class="lede mt-2">For reservations, feedback or press, send a note to the right pub. Planning a party? Use the <a href="/private-events/#enquire">private events form</a>.</p>
      <ul class="contact-list mt-2">
        <li><span>Gift cards</span><a href="${LOC.covington.giftCards}" target="_blank" rel="noopener">Buy online ↗</a></li>
        <li><span>Careers</span><a href="https://mollymalonesirishpub.com/join-our-team/" target="_blank" rel="noopener">Join our team ↗</a></li>
        <li><span>Order online</span><a href="${LOC.covington.orderOnline}" target="_blank" rel="noopener">Covington ↗</a></li>
      </ul>
    </div>
    <form class="form" name="contact" method="POST" action="/thanks/" data-netlify="true" netlify-honeypot="company" data-enquiry-form novalidate>
      <input type="hidden" name="form-name" value="contact">
      <p class="hp"><label>Leave this empty <input name="company" tabindex="-1" autocomplete="off"></label></p>
      <div class="field"><label for="c-name">Your name</label><input id="c-name" name="name" required autocomplete="name"><span class="err" aria-live="polite"></span></div>
      <div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" required autocomplete="email"><span class="err" aria-live="polite"></span></div>
      <div class="field full"><label for="c-loc">Location</label><select id="c-loc" name="location" required><option value="">Choose a pub</option><option value="louisville">Louisville</option><option value="covington">Covington</option></select><span class="err" aria-live="polite"></span></div>
      <div class="field full"><label for="c-msg">Message</label><textarea id="c-msg" name="message" required></textarea><span class="err" aria-live="polite"></span></div>
      <div class="full"><button class="btn" type="submit">Send message ${arrow}</button></div>
      <div class="form-status" role="status" data-form-status></div>
    </form>
  </div>
</section>
`,
};
