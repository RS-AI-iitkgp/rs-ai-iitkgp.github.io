/* ==================================================================
   Event detail page (event.html?id=<event id>) — description and a
   photo gallery with a full-screen viewer. Data: data/events.js.
   ================================================================== */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^(https?:\/\/|#|[\w./-]+$)/i.test(String(u || "").trim()) ? String(u).trim() : "");
  const icon = (id, size = 16) => `<svg width="${size}" height="${size}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

  const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function longDate(d) {
    const m = String(d || "").trim().match(/^(?:(\d{1,2})\s+)?(?:([A-Za-z]{3})[a-z]*\.?\s+)?(\d{4})$/);
    if (!m) return "Date to be announced";
    const month = m[2] ? MONTHS_LONG[MONTHS.indexOf(m[2].toLowerCase())] : "";
    return [m[1], month, m[3]].filter(Boolean).join(" ");
  }

  const EVENTS = window.EVENTS || [];
  const id = new URLSearchParams(location.search).get("id");
  const ev = EVENTS.find((e) => e.id && e.id === id);

  // Same category colours as the events list (alphabetical order of categories).
  const cats = [...new Set(EVENTS.map((e) => String(e.category || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const hue = (c) => (cats.includes(c) ? `var(--a${(cats.indexOf(c) % 8) + 1})` : "var(--muted)");

  const head = $("#eventHead");
  const main = $("#eventMain");

  if (!ev) {
    document.title = "Event not found · Department of AI, IIT Kharagpur";
    head.innerHTML = `
      <a class="back-link" href="events.html">${icon("arrow-left", 16)} All events</a>
      <h1 class="ev-title">Event not found</h1>
      <p class="lede">This event page doesn't exist or has moved. Browse all events instead.</p>`;
    main.innerHTML = "";
  } else {
    document.title = `${ev.title} · Events · Department of AI, IIT Kharagpur`;
    const cat = String(ev.category || "").trim();
    const links = [].concat(ev.links || []).filter((l) => l && safeUrl(l.url));
    head.style.setProperty("--area", hue(cat));
    head.innerHTML = `
      <a class="back-link enter" style="--i:0" href="events.html">${icon("arrow-left", 16)} All events</a>
      ${cat ? `<span class="ev-tag enter" style="--i:0">${esc(cat)}</span>` : ""}
      <h1 class="ev-title enter" style="--i:1">${esc(ev.title)}</h1>
      <p class="ev-meta enter" style="--i:2">
        <span>${icon("calendar", 17)}${esc(longDate(ev.date))}</span>
        ${ev.venue ? `<span>${icon("pin", 17)}${esc(ev.venue)}</span>` : ""}
      </p>
      <div class="ev-body enter" style="--i:3">
        ${ev.summary ? `<p>${esc(ev.summary)}</p>` : ""}
        ${[].concat(ev.details || []).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join("")}
      </div>
      ${links.length ? `<div class="ev-links enter" style="--i:3">${links.map((l) => `<a class="c-pill" href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.label || "Link")} <span aria-hidden="true">↗</span></a>`).join("")}</div>` : ""}`;

    const photos = [].concat(ev.photos || [])
      .map((p) => (typeof p === "string" ? { src: p } : p))
      .filter((p) => p && safeUrl(p.src));

    main.innerHTML = `
      <div class="directory-head">
        <h2>Photos</h2>
        <p class="results">${photos.length ? `<span><b>${photos.length}</b> ${photos.length === 1 ? "photo" : "photos"}</span>` : "<span>Coming soon</span>"}</p>
      </div>
      ${photos.length
        ? `<div class="gallery">${photos.map((p, i) => `
            <button class="g-item" type="button" data-i="${i}" aria-label="Open photo ${i + 1} of ${photos.length}${p.caption ? `: ${esc(p.caption)}` : ""}">
              <img src="${esc(safeUrl(p.src))}" alt="${esc(p.caption || `${ev.title} — photo ${i + 1}`)}" loading="lazy" decoding="async"
                   onload="this.classList.add('loaded')" onerror="this.closest('.g-item').classList.add('broken')">
              ${p.caption ? `<span class="g-cap">${esc(p.caption)}</span>` : ""}
            </button>`).join("")}</div>`
        : `<div class="gallery is-empty" aria-label="Photos coming soon">${Array.from({ length: 6 }, (_, i) => `
            <div class="g-ph" aria-hidden="true">${icon("image", 28)}<span>Photo ${i + 1}</span></div>`).join("")}</div>
           <p class="g-note">Photos from this event will be added soon.</p>`}`;

    if (photos.length) setupLightbox(photos);
  }

  /* ---------- Full-screen photo viewer ---------- */
  function setupLightbox(photos) {
    const lb = $("#lightbox"), img = $("#lbImg"), cap = $("#lbCap"), count = $("#lbCount");
    let index = 0, lastFocus = null;

    function show(i) {
      index = (i + photos.length) % photos.length;
      const p = photos[index];
      img.classList.remove("ready");
      img.onload = () => img.classList.add("ready");
      img.src = safeUrl(p.src);
      img.alt = p.caption || `${ev.title} — photo ${index + 1}`;
      cap.textContent = p.caption || "";
      cap.hidden = !p.caption;
      count.textContent = `${index + 1} / ${photos.length}`;
      // Preload neighbours for instant next/previous.
      [index + 1, index - 1].forEach((j) => { const n = photos[(j + photos.length) % photos.length]; if (n) new Image().src = safeUrl(n.src); });
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.hidden = false;
      document.documentElement.classList.add("sheet-open");
      requestAnimationFrame(() => lb.classList.add("show"));
      $(".lb-close", lb).focus();
    }
    function close() {
      lb.classList.remove("show");
      document.documentElement.classList.remove("sheet-open");
      setTimeout(() => { lb.hidden = true; img.removeAttribute("src"); }, reduceMotion ? 0 : 220);
      lastFocus && lastFocus.focus();
    }

    main.addEventListener("click", (e) => {
      const b = e.target.closest(".g-item");
      if (b) open(Number(b.dataset.i));
    });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", () => show(index - 1));
    $(".lb-next", lb).addEventListener("click", () => show(index + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-stage")) close(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "Tab") { // keep focus inside the viewer
        const f = [...lb.querySelectorAll("button")];
        const k = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    // Swipe on touch screens.
    let x0 = null;
    lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    if (photos.length < 2) lb.classList.add("single");
  }

  /* ---------- Shared page chrome: theme, header, back-to-top, footer ---------- */
  let themeTimer;
  $("#themeBtn").addEventListener("click", () => {
    const root = document.documentElement;
    const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    if (!reduceMotion) {
      root.classList.add("theme-anim");
      clearTimeout(themeTimer);
      themeTimer = setTimeout(() => root.classList.remove("theme-anim"), 450);
    }
    root.dataset.theme = next;
    try { localStorage.setItem("doai-theme", next); } catch (e) {}
  });
  const header = $("#siteHeader"), toTop = $("#toTop");
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 8);
    toTop.classList.toggle("show", window.scrollY > 900);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  $("#yearNow").textContent = new Date().getFullYear();
  $("#lastUpdated").textContent = (window.EVENT_PAGE && window.EVENT_PAGE.lastUpdated) || "";
})();
