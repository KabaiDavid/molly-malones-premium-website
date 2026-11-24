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
assets/js/pint.js      Three.js stout pint (lazy-loaded, falls back to a photo)
assets/img/            WebP at 640 / 1280 / 1920 widths
```

## Performance notes

- Every image is WebP with `srcset`/`sizes`, explicit dimensions and lazy loading. Only the hero image is preloaded.
- Three.js is only requested when the bar section nears the viewport. It is skipped on low-power and Save-Data devices, and it pauses when off screen.
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
