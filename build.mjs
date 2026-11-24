// Static site build: renders src/pages/* through the shared layout into dist/.
// Usage: node build.mjs
import fs from "node:fs";
import path from "node:path";
import { layout, root } from "./src/lib.mjs";
import home from "./src/pages/home.mjs";
import louisville from "./src/pages/louisville.mjs";
import covington from "./src/pages/covington.mjs";
import menu from "./src/pages/menu.mjs";
import events from "./src/pages/events.mjs";
import sports from "./src/pages/sports.mjs";
import privateEvents from "./src/pages/private-events.mjs";
import story from "./src/pages/story.mjs";
import contact from "./src/pages/contact.mjs";
import { thanks, notFound } from "./src/pages/misc.mjs";

const out = path.join(root, "dist");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const pages = [home, louisville, covington, menu, events, sports, privateEvents, story, contact, thanks, notFound];
for (const p of pages) {
  const html = layout({ ...p, body: p.body() });
  const file = p.path.endsWith(".html") ? path.join(out, p.path) : path.join(out, p.path, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log("✓", p.path.padEnd(18), (html.length / 1024).toFixed(1) + " KB");
}
fs.cpSync(path.join(root, "assets"), path.join(out, "assets"), { recursive: true });
for (const f of ["robots.txt", "_headers"]) if (fs.existsSync(path.join(root, f))) fs.copyFileSync(path.join(root, f), path.join(out, f));

const urls = pages.filter((p) => !p.path.endsWith(".html") && p.path !== "/thanks/").map((p) => `<url><loc>https://mollymalonesirishpub.com${p.path}</loc></url>`).join("");
fs.writeFileSync(path.join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
console.log("Built", pages.length, "pages → dist/");
