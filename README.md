# Molly Malone's Irish Pub & Restaurant — Website

A fast, static site for Molly Malone's in Louisville (933 Baxter Ave) and Covington (112 E 4th St).
It has no framework and no runtime dependencies. A small Node script renders every page to plain HTML.

## Build & preview

```bash
node build.mjs            # renders everything into dist/
cd dist && python3 -m http.server 4173   # or any static server
```

Netlify works out of the box (`netlify.toml`: build `node build.mjs`, publish `dist`). The forms use Netlify Forms. On any other host, the forms open the visitor's email app, addressed to the right pub.

## Updating content (no code needed beyond editing JSON)

| What | File | Notes |
| --- | --- | --- |
| Hours, phone, email, social, links | `src/data/site.json` | `bar` / `kitchen` give minutes from midnight per weekday (0 = Sun) and drive the live "Open until…" badges. `barHours` / `kitchenHours` are the display text. |
| Menus & prices | `src/data/menu.json` | Location → menu → sections → items. `tags`: `"v"` vegetarian/vegan, `"sig"` house signature. |
| Events & live music | `src/data/events.json` | `weekly` (days 0–6), `monthly` (`nth` + `day`), or one-off `date` (YYYY-MM-DD). Past one-offs hide automatically. The homepage "week ahead" and the Events page work out the next dates themselves. |

Run `node build.mjs` after editing.

## Structure

```
build.mjs              page renderer → dist/
src/lib.mjs            layout, header/footer, responsive <img> helper, schema.org data
src/pages/*.mjs        one module per page
src/data/*.json        business content (verified against mollymalonesirishpub.com, Nov 2026)
assets/css/main.css    design system (oak · emerald · burgundy · brass · ivory)
assets/js/main.js      interactions: reveals, parallax, menus, events, forms, open-now
assets/js/pour.js      The Pour: scroll-linked controller + illustrated SVG pint fallback
assets/js/pour-gl.js   The Pour: WebGL scene (three.js, lazy-loaded)
assets/js/pour-shape.js  shared glass profile and the scroll → pour timeline
assets/img/            WebP at 640 / 1280 / 1920 widths
```

## Caching (important)

`build.mjs` gives every CSS and JS file a content-hashed name, for example `main.26f054e53f.css`. It also rewrites the HTML and the module imports to match. Because a changed file always gets a new name, `_headers` can safely mark `/assets/css/*` and `/assets/js/*` as `immutable` for a year, and a deploy can never be served with a stale stylesheet. Images keep their names, so they are cached for a week. Never hand-edit files in `dist/`: always run `node build.mjs`.

> An earlier deploy cached unhashed `main.css` as immutable. Browsers that kept that copy rendered the new homepage without the new styles. The canvas showed at its raw pixel size, nothing was pinned, and the no-JS fallback photo appeared. Hashed names make that impossible.

## Performance notes

- Every image is WebP with `srcset`/`sizes`, explicit dimensions and lazy loading. Only the hero image is preloaded.
- **The Pour** (homepage, section 03): the stout's level is set directly by scroll position. Progress runs across the pinned part of the section, which is 1.4 screen-heights of scrolling. At 10% the pour begins, and the glass is 30% full at 25%, 50% at 40%, 70% at 55% and 90% at 70%. It is full under a creamy head at 80%, and the final composition then holds. Scrolling back up drains it. The camera is fixed: one framing (`composition()` in `pour-shape.js`), with the glass at about 37% of the viewport height, shared by the WebGL and SVG renderers. The keyframes live in `pourState()` in `assets/js/pour-shape.js`.
  - WebGL scene: transmissive glass with refraction, thickness, dispersion and handling smudges; stout with a tan nitrogen cascade that settles to black and a ruby backlit edge; micro-bubble foam that tilts, clings to the glass and domes; studio softbox reflections; a warm pool of back light on a polished oak bar.
  - three.js loads only when the section is within ~1200px. It is skipped for Save-Data, 2G, devices with under 3GB of memory, or no WebGL2. If the device can't hold ~30fps, it drops to 1× resolution once. It never swaps renderers or tears down mid-scroll, so the glass never changes. It renders only while on screen.
  - The SVG pint fills from the same timeline. It shows instantly while WebGL loads, and it is the permanent fallback. Add `?pour=2d` to the URL to preview it. `?pour-debug` exposes `window.__pour` (progress and the glass's on-screen bounds) for QA.
  - Reduced motion: the fill still follows scroll, but the slosh, cascade and bokeh flicker are frozen.
- Google Maps loads only when the visitor asks for it.
- Pages use cross-document View Transitions, and the site respects `prefers-reduced-motion`.

## Hero video

The hero is a cinematic slideshow of real pub photography. To use film footage, put an optimized clip at `assets/video/hero.webm` (with an `.mp4` fallback). Target ~1920px wide, 8–15s, no audio, under 4 MB. Then replace the slides in `src/pages/home.mjs` with the `<video>` tag that is commented there.

## Content flagged for the owners to confirm

These came from the current site, which disagrees with itself in places:

- Covington dinner hours: the menu block says 4:30–10pm, but the kitchen hours say from 11am. The site uses the kitchen hours.
- Covington late night: the menu block says "Fri–Sat 11:00am–1:00am", which is probably a typo for 11pm. The site uses 11pm–1am.
- Louisville DJ nights (Fri & Sat, 11pm–4am) come from the Louisville About page. Please confirm they still run.
- Louisville fish & chips is listed as "13 / 18" with no size labels.
- No Louisville drinks list is published, so the Louisville drinks tab points guests to the bar and to the Covington list.
- Guest testimonials: only press recognition is shown. No guest reviews were invented. Add real, attributable reviews when available.
