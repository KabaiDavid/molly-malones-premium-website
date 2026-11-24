/* Molly Malone's — interaction layer. No dependencies. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const LOCNAME = { louisville: "Louisville", covington: "Covington" };

  /* ---------- Time in Kentucky (America/New_York) ---------- */
  function nowET() {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23", weekday: "short" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    const date = new Date(+p.year, +p.month - 1, +p.day);
    return { date, dow: date.getDay(), mins: +p.hour * 60 + +p.minute };
  }
  const fmt = (m) => { m %= 1440; const h = Math.floor(m / 60), mm = m % 60; const ap = h >= 12 ? "pm" : "am"; const hh = h % 12 || 12; return mm ? `${hh}:${String(mm).padStart(2, "0")}${ap}` : `${hh}${ap}`; };

  /* ---------- Open now ---------- */
  function openState(slug) {
    const H = (window.__HOURS__ || {})[slug];
    if (!H) return null;
    const { dow, mins } = nowET();
    const yday = (dow + 6) % 7;
    const [yo, yc] = H.bar[yday];
    if (yc > 1440 && mins < yc - 1440) return { open: true, text: `Open until ${fmt(yc)}` };
    const [o, c] = H.bar[dow];
    if (mins >= o && mins < c) return { open: true, text: `Open until ${fmt(c)}` };
    if (mins < o) return { open: false, text: `Opens ${fmt(o)} today` };
    const [no] = H.bar[(dow + 1) % 7];
    return { open: false, text: `Opens ${fmt(no)} tomorrow` };
  }
  function paintStatus() {
    $$("[data-status]").forEach((el) => {
      const s = openState(el.dataset.status);
      if (!s) return;
      el.textContent = s.text;
      el.classList.toggle("is-open", s.open);
    });
  }
  paintStatus();
  setInterval(paintStatus, 60000);

  /* ---------- Header: solid on scroll, hide on scroll down ---------- */
  const header = $("[data-header]");
  const actionbar = $("[data-actionbar]");
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle("is-solid", y > 40);
    const hide = y > lastY && y > 400 && !document.body.classList.contains("menu-open");
    header.classList.toggle("is-hidden", hide);
    document.body.classList.toggle("header-hidden", hide);
    if (actionbar) actionbar.classList.toggle("is-visible", y > innerHeight * 0.6);
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Drawer ---------- */
  const toggle = $("[data-menu-toggle]");
  const drawer = $("#drawer");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    drawer.inert = !open;
    if (open) header.classList.remove("is-hidden");
    if (open) setTimeout(() => $("a", drawer)?.focus(), 300);
  };
  toggle?.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("menu-open")) { setMenu(false); toggle.focus(); } });
  $$("a", drawer).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Location chooser ---------- */
  const chooser = $("#chooser");
  $$("[data-open-chooser]").forEach((b) => b.addEventListener("click", () => chooser?.showModal()));
  chooser?.addEventListener("click", (e) => { if (e.target === chooser || e.target.closest("[data-close]")) chooser.close(); });

  /* ---------- Reveal on scroll ---------- */
  $$("[data-reveal-lines]").forEach((el) => el.setAttribute("data-reveal-wrap", ""));
  // Clip-path masked elements report zero intersection, so masks are observed via a proxy (their parent).
  const proxies = new Map();
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    (proxies.get(e.target) || [e.target]).forEach((el) => el.classList.add("is-in"));
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
  $$("[data-reveal], [data-reveal-lines]").forEach((el) => {
    if (el.dataset.reveal !== "mask") return io.observe(el);
    const host = el.parentElement;
    if (!proxies.has(host)) { proxies.set(host, []); io.observe(host); }
    proxies.get(host).push(el);
  });

  /* ---------- Parallax ---------- */
  const px = $$("[data-parallax]");
  if (px.length && !reduce) {
    let ticking = false;
    const run = () => {
      const vh = innerHeight;
      px.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const k = parseFloat(el.dataset.parallax) || 0.1;
        const center = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translate3d(0, ${(-center * k).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ---------- Hero slideshow ---------- */
  const hero = $("[data-hero]");
  if (hero) {
    const slides = $$(".hero__slide", hero);
    const dots = $("[data-hero-dots]", hero);
    let i = 0, timer;
    const go = (n) => {
      slides[i].classList.remove("is-active"); dots.children[i]?.classList.remove("is-active"); dots.children[i]?.removeAttribute("aria-current");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("is-active"); dots.children[i]?.classList.add("is-active"); dots.children[i]?.setAttribute("aria-current", "true");
    };
    slides.forEach((_, n) => { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", `Show image ${n + 1}`); b.addEventListener("click", () => { go(n); restart(); }); dots.append(b); });
    const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(i + 1), 7000); };
    go(0); restart();
    document.addEventListener("visibilitychange", () => (document.hidden ? clearInterval(timer) : restart()));
  }

  /* ---------- Signature plates: scroll-driven horizontal track ---------- */
  const plates = $("[data-plates]");
  if (plates) {
    const pin = $(".plates__pin", plates), track = $("[data-plates-track]", plates), idx = $("[data-plate-index]", plates);
    const mq = matchMedia("(min-width: 901px) and (prefers-reduced-motion: no-preference)");
    let dist = 0;
    const measure = () => {
      if (!mq.matches) { pin.style.removeProperty("--pin-h"); track.style.transform = ""; return; }
      dist = Math.max(0, track.scrollWidth - innerWidth);
      pin.style.setProperty("--pin-h", `${innerHeight + dist}px`);
    };
    const update = () => {
      if (!mq.matches) return;
      const r = pin.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight || 1)));
      track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
      if (idx) idx.textContent = String(Math.min(track.children.length, 1 + Math.floor(p * track.children.length * 0.999))).padStart(2, "0");
    };
    measure(); update();
    addEventListener("resize", () => { measure(); update(); });
    addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    mq.addEventListener("change", () => { measure(); update(); });
    addEventListener("load", () => { measure(); update(); });
  }

  /* ---------- Events: next occurrence engine ---------- */
  const evData = $("#events-data");
  const EVENTS = evData ? JSON.parse(evData.textContent) : [];
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  function occursOn(e, d) {
    if (e.date) return e.date === ymd(d);
    if (e.repeat === "weekly") return e.days.includes(d.getDay());
    if (e.repeat === "monthly") return d.getDay() === e.day && Math.ceil(d.getDate() / 7) === e.nth;
    return false;
  }
  function nextDate(e, from) {
    for (let k = 0; k < 62; k++) { const d = new Date(from); d.setDate(d.getDate() + k); if (occursOn(e, d)) return d; }
    return null;
  }

  // Home: the week ahead
  const week = $("[data-week]");
  if (week && EVENTS.length) {
    const today = nowET().date;
    const html = [];
    for (let k = 0; k < 7; k++) {
      const d = new Date(today); d.setDate(d.getDate() + k);
      const items = EVENTS.filter((e) => occursOn(e, d) && !["cov-happy-hour", "cov-late-night"].includes(e.id));
      html.push(`<div class="week__day${k === 0 ? " is-today" : ""}"><div class="week__dname">${k === 0 ? "Today" : DAYS[d.getDay()]}</div><div class="week__date">${d.getDate()}</div>${items.map((e) => `<a class="week__item" href="/events/#${e.id}"><b><i class="loc-dot loc-dot--${e.location}" aria-hidden="true"></i>${e.title}</b><span>${LOCNAME[e.location]}${e.time ? " · " + e.time : ""}</span></a>`).join("") || `<span class="week__item"><span>Pints, food &amp; good company</span></span>`}</div>`);
    }
    week.innerHTML = html.join("");
  }

  // Events page
  const evApp = $("[data-events-app]");
  if (evApp) {
    const today = nowET().date;
    const list = $("[data-ev-list]", evApp);
    const rows = $$(".event", list);
    rows.forEach((row) => {
      const e = EVENTS.find((x) => x.id === row.dataset.id);
      row.id = e.id;
      const nd = e.date || e.repeat === "weekly" || e.repeat === "monthly" ? nextDate(e, today) : null;
      if (e.date && !nd) { row.dataset.past = "1"; row.hidden = true; return; }
      row.dataset.sort = nd ? nd.getTime() : 9e15;
      const box = $("[data-next]", row);
      if (nd) {
        const diff = Math.round((nd - today) / 864e5);
        box.innerHTML = `<b>${nd.getDate()}</b><span>${diff === 0 ? "Tonight" : diff === 1 ? "Tomorrow" : DAYS[nd.getDay()] + " · " + nd.toLocaleDateString("en-US", { month: "short" })}</span>`;
      }
    });
    rows.sort((a, b) => a.dataset.sort - b.dataset.sort).forEach((r) => list.append(r));
    const params = new URLSearchParams(location.search);
    const state = { loc: params.get("loc") || "all", cat: params.get("cat") || "all" };
    const apply = () => {
      let n = 0;
      rows.forEach((r) => {
        if (r.dataset.past) return;
        const show = (state.loc === "all" || r.dataset.loc === state.loc) && (state.cat === "all" || r.dataset.cat === state.cat);
        r.hidden = !show; if (show) n++;
      });
      $$("[data-ev-loc]", evApp).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.evLoc === state.loc)));
      $$("[data-ev-cat]", evApp).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.evCat === state.cat)));
      $("[data-ev-empty]", evApp).hidden = n > 0;
      $("[data-ev-summary]", evApp).textContent = `${n} ${n === 1 ? "listing" : "listings"} · sorted by next date`;
      const u = new URL(location.href);
      state.loc === "all" ? u.searchParams.delete("loc") : u.searchParams.set("loc", state.loc);
      state.cat === "all" ? u.searchParams.delete("cat") : u.searchParams.set("cat", state.cat);
      history.replaceState(null, "", u);
    };
    evApp.addEventListener("click", (e) => {
      const l = e.target.closest("[data-ev-loc]"), c = e.target.closest("[data-ev-cat]");
      if (l) state.loc = l.dataset.evLoc;
      if (c) state.cat = c.dataset.evCat;
      if (l || c) apply();
    });
    apply();
    if (location.hash) $(location.hash)?.scrollIntoView();
  }

  /* ---------- Menu app ---------- */
  const menuApp = $("[data-menu-app]");
  if (menuApp) {
    const panels = $$(".menu-panel");
    const tabs = $("[data-tabs]", menuApp);
    const search = $("[data-menu-search]", menuApp);
    const params = new URLSearchParams(location.search);
    let stored = null;
    try { stored = localStorage.getItem("mm-loc"); } catch (_) {}
    const state = { loc: params.get("loc") || stored || "covington", menu: params.get("menu") || "dinner" };
    const render = (focusTab) => {
      if (!panels.some((p) => p.dataset.loc === state.loc && p.dataset.menu === state.menu)) state.menu = "dinner";
      $$("[data-loc-btn]", menuApp).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.locBtn === state.loc)));
      const mine = panels.filter((p) => p.dataset.loc === state.loc);
      tabs.innerHTML = mine.map((p) => `<button type="button" role="tab" id="tab-${p.id}" aria-controls="${p.id}" aria-selected="${p.dataset.menu === state.menu}" tabindex="${p.dataset.menu === state.menu ? 0 : -1}" data-menu-tab="${p.dataset.menu}">${p.dataset.label}</button>`).join("");
      panels.forEach((p) => { const on = p.dataset.loc === state.loc && p.dataset.menu === state.menu; p.hidden = !on; if (on) p.setAttribute("aria-labelledby", `tab-${p.id}`); });
      if (focusTab) $(`[data-menu-tab="${state.menu}"]`, tabs)?.focus();
      filter();
      try { localStorage.setItem("mm-loc", state.loc); } catch (_) {}
      const u = new URL(location.href); u.searchParams.set("loc", state.loc); u.searchParams.set("menu", state.menu); history.replaceState(null, "", u);
    };
    const filter = () => {
      const q = search.value.trim().toLowerCase();
      const panel = panels.find((p) => !p.hidden);
      if (!panel) return;
      let any = false;
      $$(".menu-section[data-section]", panel).forEach((s) => {
        let n = 0;
        $$(".menu-item", s).forEach((it) => { const ok = !q || it.dataset.search.includes(q) || s.dataset.section.toLowerCase().includes(q); it.hidden = !ok; if (ok) n++; });
        s.hidden = n === 0; if (n) any = true;
      });
      const empty = $("[data-empty]", panel); if (empty) empty.hidden = any || !q;
    };
    menuApp.addEventListener("click", (e) => {
      const l = e.target.closest("[data-loc-btn]"), t = e.target.closest("[data-menu-tab]");
      if (l) { state.loc = l.dataset.locBtn; render(); }
      if (t) { state.menu = t.dataset.menuTab; render(); }
    });
    tabs.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      const bs = $$("[data-menu-tab]", tabs); let k = bs.findIndex((b) => b.dataset.menuTab === state.menu);
      k = e.key === "Home" ? 0 : e.key === "End" ? bs.length - 1 : (k + (e.key === "ArrowRight" ? 1 : -1) + bs.length) % bs.length;
      state.menu = bs[k].dataset.menuTab; render(true); e.preventDefault();
    });
    document.addEventListener("click", (e) => {
      const g = e.target.closest("[data-goto]"); if (!g) return;
      e.preventDefault(); [state.loc, state.menu] = g.dataset.goto.split(":"); render(); menuApp.scrollIntoView();
    });
    search.addEventListener("input", filter);
    render();
  }

  /* ---------- Private events: room filter + prefill ---------- */
  const rooms = $("[data-rooms-app]");
  if (rooms) {
    const set = (loc) => {
      $$("[data-room-loc]", rooms).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.roomLoc === loc)));
      $$(".room", rooms).forEach((r) => (r.hidden = loc !== "all" && r.dataset.loc !== loc));
    };
    rooms.addEventListener("click", (e) => { const b = e.target.closest("[data-room-loc]"); if (b) set(b.dataset.roomLoc); });
    const pl = new URLSearchParams(location.search).get("loc");
    if (pl) { set(pl); const sel = $("#f-loc"); if (sel) sel.value = pl; }
    $$("[data-pick-room]").forEach((b) => b.addEventListener("click", () => {
      const [loc, room] = b.dataset.pickRoom.split("|");
      $("#f-loc").value = loc; syncRooms(); $("#f-room").value = room;
      $("#enquire").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      setTimeout(() => $("#f-name").focus({ preventScroll: true }), 600);
    }));
    const syncRooms = () => {
      const loc = $("#f-loc").value;
      $$("#f-room option[data-loc]").forEach((o) => { o.hidden = !!loc && o.dataset.loc !== loc; o.disabled = o.hidden; });
      const cur = $("#f-room").selectedOptions[0]; if (cur?.disabled) $("#f-room").value = "";
    };
    $("#f-loc")?.addEventListener("change", syncRooms);
    syncRooms();
    const d = $("#f-date"); if (d) d.min = ymd(nowET().date);
  }

  /* ---------- Forms: validation + Netlify submit with email fallback ---------- */
  const EMAIL = { louisville: "event.mollys@gmail.com", covington: "info@mollymalonesirishpub.com" };
  $$("[data-enquiry-form]").forEach((form) => {
    const status = $("[data-form-status]", form);
    const msg = (el) => {
      const v = el.validity; const lbl = form.querySelector(`label[for="${el.id}"]`)?.textContent || "This field";
      if (v.valueMissing) return `${lbl} is required.`;
      if (v.typeMismatch) return "Please enter a valid email address.";
      if (v.rangeUnderflow || v.rangeOverflow) return `Please enter between ${el.min} and ${el.max}.`;
      if (v.badInput) return "Please check this value.";
      return "";
    };
    const check = (el) => { const m = msg(el); const err = el.parentElement.querySelector(".err"); if (err) err.textContent = m; el.setAttribute("aria-invalid", String(!!m)); return !m; };
    $$("input, select, textarea", form).forEach((el) => el.addEventListener("blur", () => el.required && check(el)));
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fields = $$("[required]", form);
      const bad = fields.filter((el) => !check(el));
      if (bad.length) { bad[0].focus(); return; }
      const data = new FormData(form);
      const btn = $("button[type=submit]", form); btn.disabled = true;
      const show = (html) => { status.innerHTML = html; status.classList.add("is-visible"); status.focus?.(); };
      try {
        const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(data).toString() });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        show(`<strong>Thank you — your note is with the ${LOCNAME[data.get("location")] || ""} team.</strong> We'll be in touch shortly.`);
      } catch (_) {
        const to = EMAIL[data.get("location")] || EMAIL.covington;
        const body = [...data.entries()].filter(([k]) => !["form-name", "company"].includes(k)).map(([k, v]) => `${k[0].toUpperCase() + k.slice(1)}: ${v}`).join("\n");
        const href = `mailto:${to}?subject=${encodeURIComponent((form.name === "private-event" ? "Private event enquiry" : "Website enquiry") + " — " + (data.get("name") || ""))}&body=${encodeURIComponent(body)}`;
        show(`We couldn't send that automatically. <a href="${href}">Open it in your email app</a> or call us — ${data.get("location") === "louisville" ? '<a href="tel:+15024731222">502.473.1222</a>' : '<a href="tel:+18594916659">859.491.6659</a>'}.`);
        location.href = href;
      } finally { btn.disabled = false; }
    });
  });

  /* ---------- Click-to-load maps (keeps Google off the critical path) ---------- */
  $$("[data-load-map]").forEach((b) => b.addEventListener("click", () => {
    const box = b.closest("[data-map]");
    box.innerHTML = `<iframe title="Map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${box.dataset.map}&output=embed"></iframe>`;
  }));

  $$("[data-year]").forEach((y) => (y.textContent = new Date().getFullYear()));
})();
