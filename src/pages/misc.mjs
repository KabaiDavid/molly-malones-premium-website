import { splitLines, arrow } from "../lib.mjs";
const simple = (path, title, h, p, desc) => ({
  path, title, description: desc,
  body: () => `
<section class="section" style="min-height:80svh;display:flex;align-items:center;padding-top:calc(var(--header-h) + 3rem)">
  <div class="wrap">
    <p class="eyebrow">${title}</p>
    <h1 class="display" data-reveal-lines>${splitLines(h)}</h1>
    <p class="lede mt-2">${p}</p>
    <div class="btn-row mt-2"><a class="btn" href="/">Back to Molly's ${arrow}</a><a class="btn btn--ghost" href="/menu/">View the menu</a></div>
  </div>
</section>`,
});
export const thanks = simple("/thanks/", "Thank you", ["Sláinte —", "<em>we'll be in touch.</em>"], "Your message is with the team. We'll reply by email or phone shortly.", "Thanks for getting in touch with Molly Malone's.");
export const notFound = simple("/404.html", "Page not found", ["Wrong turn", "<em>off Baxter.</em>"], "That page has wandered off. Let's get you back to the bar.", "Page not found.");
