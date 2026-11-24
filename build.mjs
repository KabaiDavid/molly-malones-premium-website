// Static site build: renders src/pages/* through the shared layout into dist/.
// Usage: node build.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
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

/* ---------------------------------------------------------------------------
   Assets. Images are copied as-is. CSS and JS get content-hashed file names
   (main.3f9c1a2b7e.css) so they can be cached "immutable" for a year, and a
   new deploy can never be served alongside a stale stylesheet or script.
   JS modules are hashed leaf-first so import specifiers point at hashed files.
   ------------------------------------------------------------------------- */
const assetMap = {};                       // "/assets/js/pour.js" -> "/assets/js/pour.<hash>.js"
const hash = (buf) => crypto.createHash("sha256").update(buf).digest("hex").slice(0, 10);
fs.cpSync(path.join(root, "assets/img"), path.join(out, "assets/img"), { recursive: true });
function emit(rel, transform = (x) => x) {
  let src = transform(fs.readFileSync(path.join(root, rel), "utf8"));
  const ext = path.extname(rel), hashed = rel.slice(0, -ext.length) + "." + hash(src) + ext;
  fs.mkdirSync(path.dirname(path.join(out, hashed)), { recursive: true });
  fs.writeFileSync(path.join(out, hashed), src);
  assetMap["/" + rel] = "/" + hashed;
}
const relinkImports = (src) => src.replace(/(["'])\.\/([\w-]+\.js)\1/g, (m, q, f) => {
  const mapped = assetMap["/assets/js/" + f];
  if (!mapped) throw new Error(`Import ./${f} must be emitted before its importers`);
  return q + "./" + path.basename(mapped) + q;
});
for (const f of ["pour-shape.js", "pour-gl.js", "pour.js", "main.js"]) emit("assets/js/" + f, relinkImports);
emit("assets/css/main.css");
const unknown = fs.readdirSync(path.join(root, "assets/js")).filter((f) => !assetMap["/assets/js/" + f]);
if (unknown.length) throw new Error("Unhashed JS (add to the emit list): " + unknown.join(", "));

const relinkHtml = (html) => html.replace(/\/assets\/(?:css|js)\/[\w.-]+\.(?:css|js)/g, (u) => {
  if (!assetMap[u]) throw new Error("No hashed asset for " + u);
  return assetMap[u];
});
for (const p of pages) {
  const html = relinkHtml(layout({ ...p, body: p.body() }));
  const file = p.path.endsWith(".html") ? path.join(out, p.path) : path.join(out, p.path, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log("✓", p.path.padEnd(18), (html.length / 1024).toFixed(1) + " KB");
}
for (const f of ["robots.txt", "_headers"]) if (fs.existsSync(path.join(root, f))) fs.copyFileSync(path.join(root, f), path.join(out, f));
console.log("Assets:", Object.values(assetMap).map((x) => path.basename(x)).join(", "));

const urls = pages.filter((p) => !p.path.endsWith(".html") && p.path !== "/thanks/").map((p) => `<url><loc>https://mollymalonesirishpub.com${p.path}</loc></url>`).join("");
fs.writeFileSync(path.join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
console.log("Built", pages.length, "pages → dist/");
