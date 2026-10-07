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
      ${links.length ? `<div class="ev-links enter" style="--i:3">${links.map((l) => `<a class="c-pill" href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener">${esc(l.label || "Link")} <svg class="pill-arrow is-ext" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M7 17 17 7M9 7h8v8"/></svg></a>`).join("")}</div>` : ""}`;

    const photos = [].concat(ev.photos || [])
      .map((p) => (typeof p === "string" ? { src: p } : p))
      .filter((p) => p && safeUrl(p.src))
      // Small copy for tiles and the panel: images/events/<id>/thumbs/<same name> unless `thumb` is given.
      .map((p) => ({ ...p, src: safeUrl(p.src), thumb: safeUrl(p.thumb) || safeUrl(p.src).replace(/([^/]+)$/, "thumbs/$1"),
        ar: Number(p.ar) > 0.2 && Number(p.ar) < 6 ? Number(p.ar) : 0 }));

    main.innerHTML = `
      <div class="directory-head">
        <h2>Photos</h2>
        <p class="results">${photos.length ? `<span><b>${photos.length}</b> ${photos.length === 1 ? "photo" : "photos"}</span>` : "<span>Coming soon</span>"}</p>
      </div>
      ${photos.length
        // Justified rows, like Google Photos: each tile keeps its photo's shape (--ar = width / height).
        // Without `ar` in the data the tile starts at 3:2 and takes the real shape once the photo loads.
        ? `<div class="gallery">${photos.map((p, i) => `
            <button class="g-item" type="button" data-i="${i}" style="--ar: ${p.ar || 1.5}"${p.ar ? "" : " data-measure"} aria-label="Open photo ${i + 1} of ${photos.length}${p.caption ? `: ${esc(p.caption)}` : ""}">
              <img src="${esc(p.thumb)}" data-full="${esc(p.src)}" alt="${esc(p.caption || `${ev.title} — photo ${i + 1}`)}" loading="lazy" decoding="async"
                   onload="this.classList.add('loaded'); var t = this.closest('.g-item'); if (t.hasAttribute('data-measure')) t.style.setProperty('--ar', (this.naturalWidth / this.naturalHeight).toFixed(3));"onerror="if (this.dataset.full) { this.src = this.dataset.full; this.removeAttribute('data-full'); } else this.closest('.g-item').classList.add('broken');">
              ${p.caption ? `<span class="g-cap">${esc(p.caption)}</span>` : ""}
            </button>`).join("")}</div>`
        : `<div class="gallery is-empty" aria-label="Photos coming soon">${Array.from({ length: 6 }, (_, i) => `
            <div class="g-ph" aria-hidden="true">${icon("image", 28)}<span>Photo ${i + 1}</span></div>`).join("")}</div>
           <p class="g-note">Photos from this event will be added soon.</p>`}`;

    if (photos.length) setupLightbox(photos);
    const metaBits = [cat, /\d{4}/.test(ev.date || "") ? ev.date : "", photos.length ? `${photos.length} ${photos.length === 1 ? "photo" : "photos"}` : ""];
    setupHeaderTitle(ev.title, metaBits.filter(Boolean).join(" · "), hue(cat));
  }

  /* ---------- Event title in the header once the page title scrolls away ---------- */
  function setupHeaderTitle(title, meta, area) {
    const header = $("#siteHeader"), inner = $(".header-inner", header), btn = $("#hdrEvent"), bar = $("#hdrProgress");
    const h1 = $(".ev-title", head), nav = $(".nav", header), theme = $("#themeBtn");
    if (!btn || !h1) return;
    $("#hdrEventTitle").textContent = title;
    $("#hdrEventMeta").textContent = meta;
    btn.setAttribute("aria-label", `Back to top: ${title}`);
    btn.title = "Back to top";
    header.style.setProperty("--area", area);

    // Sit just right of the logo; run up to the nav, or (when that's too tight) up to the theme button,
    // in which case the nav steps aside while scrolling down.
    function layout() {
      const base = inner.getBoundingClientRect();
      const logo = [...header.querySelectorAll(".brand-logo")].find((i) => i.offsetWidth) || $(".brand", header);
      const left = logo.getBoundingClientRect().right + 12 - base.left;
      const beforeNav = nav.getBoundingClientRect().left - 24 - base.left;
      const compact = beforeNav - left < 280;
      const right = compact ? theme.getBoundingClientRect().left - 14 - base.left : beforeNav;
      header.classList.toggle("hdr-compact", compact);
      inner.style.setProperty("--hdr-left", `${Math.round(left)}px`);
      inner.style.setProperty("--hdr-width", `${Math.max(0, Math.round(right - left))}px`);
    }

    let lastY = scrollY, goingUp = false;
    function update() {
      const y = scrollY;
      if (Math.abs(y - lastY) > 6) { goingUp = y < lastY; lastY = y; }
      const past = h1.getBoundingClientRect().bottom < header.offsetHeight;
      // On narrow screens scrolling up brings the nav back.
      const show = past && !(goingUp && header.classList.contains("hdr-compact"));
      header.classList.toggle("show-event", show);
      btn.tabIndex = show ? 0 : -1;
      btn.setAttribute("aria-hidden", String(!show));
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty("--p", max > 0 ? Math.min(1, Math.max(0, y / max)).toFixed(4) : "0");
    }
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", () => { layout(); update(); });
    layout(); update();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout); // widths change once web fonts load
  }

  /* ---------- Full-screen photo viewer ---------- */
  // Extras: zoom & pan (double-click/tap, scroll, pinch, + / - / 0), slideshow (Space),
  // thumbnail panel on the right (G; bottom strip on phones), browser full screen (F).
  function setupLightbox(photos) {
    const lb = $("#lightbox"), img = $("#lbImg"), cap = $("#lbCap"), count = $("#lbCount");
    const panel = $("#lbPanel"), progress = $(".lb-progress", lb);
    const playBtn = $(".lb-play", lb), panelBtn = $(".lb-panel-btn", lb), fsBtn = $(".lb-fs", lb), zoomBtn = $(".lb-zoom", lb);
    const stage = $(".lb-stage", lb);
    const SLIDE_MS = 4000, PANEL_KEY = "doai-lb-panel";
    let index = 0, lastFocus = null, playing = false, slideTimer = 0, loadToken = 0;
    let ratio = 0, fullWidth = 0; // current photo's aspect ratio and full-size pixel width

    panel.innerHTML = photos.map((p, i) => `
      <button class="lb-thumb" type="button" data-i="${i}" aria-label="Photo ${i + 1}${p.caption ? `: ${esc(p.caption)}` : ""}">
        <img src="${esc(p.thumb)}" data-full="${esc(p.src)}" alt="" loading="lazy" decoding="async" onerror="if (this.dataset.full) { this.src = this.dataset.full; this.removeAttribute('data-full'); }">
      </button>`).join("");
    const thumbs = [...panel.querySelectorAll(".lb-thumb")];
    const panelOpen = () => lb.classList.contains("panel-open");
    const revealThumb = (smooth) => thumbs[index].scrollIntoView({ block: "center", inline: "center", behavior: smooth && !reduceMotion ? "smooth" : "auto" });

    function show(i) {
      index = (i + photos.length) % photos.length;
      const p = photos[index], token = ++loadToken;
      resetZoom();
      ratio = 0; fullWidth = 0;
      img.style.width = img.style.height = "";
      img.classList.remove("ready");
      img.onload = () => { ratio = img.naturalWidth / img.naturalHeight; fit(); img.classList.add("ready"); };
      img.onerror = () => { if (token === loadToken && img.getAttribute("src") !== p.src) img.src = p.src; };
      // The thumbnail is usually cached already: show it at once, then swap in the full photo when it arrives.
      img.src = p.thumb;
      const full = new Image();
      full.onload = () => { if (token === loadToken) { fullWidth = full.naturalWidth; img.src = p.src; } };
      full.src = p.src;
      img.alt = p.caption || `${ev.title} — photo ${index + 1}`;
      cap.textContent = p.caption || "";
      cap.hidden = !p.caption;
      count.textContent = `${index + 1} / ${photos.length}`;
      thumbs.forEach((t, k) => (k === index ? t.setAttribute("aria-current", "true") : t.removeAttribute("aria-current")));
      if (panelOpen()) revealThumb(true);
      if (playing) schedule(); // any move restarts the slideshow countdown
      // Preload neighbours for instant next/previous.
      [index + 1, index - 1].forEach((j) => { const n = photos[(j + photos.length) % photos.length]; if (n) new Image().src = n.src; });
    }

    // Size the photo to fit the stage (also while the smaller thumbnail is showing).
    function fit() {
      if (!ratio) return;
      const maxW = stage.clientWidth, maxH = parseFloat(getComputedStyle(img).maxHeight) || stage.clientHeight;
      const w = Math.min(maxW, maxH * ratio);
      img.style.width = `${Math.round(w)}px`;
      img.style.height = `${Math.round(w / ratio)}px`;
    }
    if ("ResizeObserver" in window) new ResizeObserver(() => { if (!lb.hidden) { fit(); resetZoom(); } }).observe(stage);

    /* Zoom & pan — so faces in big group photos can be seen at full resolution */
    let z = 1, tx = 0, ty = 0;
    const nativeZoom = () => (fullWidth && img.offsetWidth ? fullWidth / img.offsetWidth : 2);
    const maxZoom = () => Math.max(2, nativeZoom() * 1.5);
    function baseCenter() { // image centre without the zoom transform
      const r = stage.getBoundingClientRect();
      return { x: r.left + img.offsetLeft + img.offsetWidth / 2, y: r.top + img.offsetTop + img.offsetHeight / 2 };
    }
    function panArea() { // the visible part of the viewer (minus the open panel)
      const r = lb.getBoundingClientRect(), a = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
      if (lb.classList.contains("panel-open")) {
        const pr = panel.getBoundingClientRect();
        if (pr.top > r.top + 1) a.bottom = pr.top; else a.right = pr.left;
      }
      return a;
    }
    function clampPan() {
      if (z <= 1) { tx = ty = 0; return; }
      const b = baseCenter(), a = panArea(), w = img.offsetWidth * z, h = img.offsetHeight * z;
      const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
      // Keep the zoomed photo covering the view; on an axis where it's smaller than the view, keep it centred.
      tx = w <= a.right - a.left ? 0 : clamp(tx, a.right - b.x - w / 2, a.left - b.x + w / 2);
      ty = h <= a.bottom - a.top ? 0 : clamp(ty, a.bottom - b.y - h / 2, a.top - b.y + h / 2);
    }
    function applyZoom() {
      const on = z > 1.001;
      lb.classList.toggle("zoomed", on);
      zoomBtn.setAttribute("aria-pressed", String(on));
      zoomBtn.setAttribute("aria-label", on ? "Zoom out" : "Zoom in");
      img.style.transform = on ? `translate(${tx}px, ${ty}px) scale(${z})` : "";
      if (on && playing) setPlaying(false);
    }
    function zoomTo(nz, px, py) { // zoom, keeping the point (px, py) where it is
      nz = Math.min(maxZoom(), Math.max(1, nz));
      const b = baseCenter(), k = nz / z, cx = b.x + tx, cy = b.y + ty;
      tx = px - (px - cx) * k - b.x;
      ty = py - (py - cy) * k - b.y;
      z = nz;
      clampPan();
      applyZoom();
    }
    function resetZoom() { z = 1; tx = ty = 0; applyZoom(); }
    function toggleZoom(px, py) {
      if (z > 1.001) return resetZoom();
      const c = baseCenter();
      zoomTo(Math.max(2, nativeZoom()), px ?? c.x, py ?? c.y); // 1:1 pixels for large photos
    }
    const zoomBy = (f) => { const c = baseCenter(); zoomTo(z * f, c.x + tx, c.y + ty); };

    // Mouse drag, touch drag, pinch and double-tap — all through pointer events on the photo.
    const pts = new Map();
    let drag = null, pinch = null, moved = false, gestured = false, lastTap = 0, lastType = "mouse", wheelTimer = 0;
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    img.addEventListener("pointerdown", (e) => {
      lastType = e.pointerType;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      img.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      img.classList.add("dragging");
      if (pts.size === 1) moved = false;
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch = { d: dist(a, b), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
        drag = null; gestured = true;
      } else if (z > 1) drag = { x: e.clientX, y: e.clientY, tx, ty };
    });
    img.addEventListener("pointermove", (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pts.size >= 2) {
        const [a, b] = [...pts.values()], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, d = dist(a, b);
        tx += mx - pinch.mx; ty += my - pinch.my;
        zoomTo(z * d / pinch.d, mx, my);
        pinch = { d, mx, my };
        moved = true;
      } else if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
        tx = drag.tx + dx; ty = drag.ty + dy;
        clampPan(); applyZoom();
      }
    });
    function pointerEnd(e) {
      if (!pts.delete(e.pointerId)) return;
      if (pts.size < 2) pinch = null;
      if (pts.size === 1 && z > 1) { const [q] = [...pts.values()]; drag = { x: q.x, y: q.y, tx, ty }; } // keep panning with one finger
      if (!pts.size) { drag = null; img.classList.remove("dragging"); }
      if (e.type === "pointerup" && e.pointerType === "touch" && !moved && !pts.size) { // double-tap
        if (e.timeStamp - lastTap < 320) { toggleZoom(e.clientX, e.clientY); lastTap = 0; } else lastTap = e.timeStamp;
      }
    }
    img.addEventListener("pointerup", pointerEnd);
    img.addEventListener("pointercancel", pointerEnd);
    img.addEventListener("dblclick", (e) => { if (lastType !== "touch") toggleZoom(e.clientX, e.clientY); });
    img.addEventListener("dragstart", (e) => e.preventDefault());
    lb.addEventListener("wheel", (e) => {
      if (e.target.closest(".lb-panel")) return;
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 40 : 1);
      img.classList.add("dragging"); // no easing while scrolling
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { if (!pts.size) img.classList.remove("dragging"); }, 160);
      zoomTo(z * Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX, e.clientY);
    }, { passive: false });
    zoomBtn.addEventListener("click", () => toggleZoom());

    /* Slideshow */
    function schedule() {
      clearTimeout(slideTimer);
      progress.classList.remove("run");
      void progress.offsetWidth; // restart the progress bar animation
      progress.classList.add("run");
      slideTimer = setTimeout(() => show(index + 1), SLIDE_MS);
    }
    function setPlaying(on) {
      playing = on && photos.length > 1;
      lb.classList.toggle("playing", playing);
      playBtn.setAttribute("aria-pressed", String(playing));
      playBtn.setAttribute("aria-label", playing ? "Pause slideshow" : "Start slideshow");
      clearTimeout(slideTimer);
      progress.classList.remove("run");
      if (playing) schedule();
    }
    progress.style.setProperty("--slide", `${SLIDE_MS}ms`);

    /* Gallery panel (remembered between visits) */
    function setPanel(on) {
      lb.classList.toggle("panel-open", on);
      panel.inert = !on;
      panelBtn.setAttribute("aria-pressed", String(on));
      panelBtn.setAttribute("aria-label", on ? "Hide gallery panel" : "Show gallery panel");
      try { localStorage.setItem(PANEL_KEY, on ? "1" : "0"); } catch (e) {}
      if (on) revealThumb(false);
    }

    /* Browser full screen (button hidden where unsupported, e.g. iPhone Safari) */
    const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement;
    if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) fsBtn.hidden = true;
    function exitFs() { if (fsElement()) (document.exitFullscreen || document.webkitExitFullscreen).call(document); }
    function toggleFs() {
      if (fsElement()) return exitFs();
      const req = lb.requestFullscreen || lb.webkitRequestFullscreen;
      if (req) Promise.resolve(req.call(lb)).catch(() => {});
    }
    function onFsChange() {
      const on = fsElement() === lb;
      lb.classList.toggle("is-fs", on);
      fsBtn.setAttribute("aria-pressed", String(on));
      fsBtn.setAttribute("aria-label", on ? "Exit full screen" : "Full screen");
    }
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);

    function open(i) {
      lastFocus = document.activeElement;
      let pref = false;
      try { pref = localStorage.getItem(PANEL_KEY) === "1"; } catch (e) {}
      setPanel(pref);
      show(i);
      lb.hidden = false;
      document.documentElement.classList.add("sheet-open");
      requestAnimationFrame(() => { lb.classList.add("show"); if (panelOpen()) revealThumb(false); });
      $(".lb-close", lb).focus();
    }
    function close() {
      setPlaying(false);
      resetZoom();
      exitFs();
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
    playBtn.addEventListener("click", () => setPlaying(!playing));
    panelBtn.addEventListener("click", () => setPanel(!panelOpen()));
    fsBtn.addEventListener("click", toggleFs);
    panel.addEventListener("click", (e) => { const t = e.target.closest(".lb-thumb"); if (t) show(Number(t.dataset.i)); });
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-stage")) close(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (e.key === "Escape") { if (!fsElement()) close(); } // in full screen, Esc only leaves full screen
      else if (e.key === "+" || e.key === "=") zoomBy(1.5);
      else if (e.key === "-" || e.key === "_") zoomBy(1 / 1.5);
      else if (e.key === "0") resetZoom();
      else if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === " ") { e.preventDefault(); setPlaying(!playing); }
      else if (k === "g") setPanel(!panelOpen());
      else if (k === "f" && !fsBtn.hidden) toggleFs();
      else if (e.key === "Tab") { // keep focus inside the viewer
        const f = [...lb.querySelectorAll("button")].filter((b) => !b.closest("[inert]") && b.offsetParent !== null);
        const at = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    // Space toggles the slideshow, so it mustn't also press the focused button.
    document.addEventListener("keyup", (e) => { if (!lb.hidden && e.key === " ") e.preventDefault(); });
    // Swipe on touch screens (not on the thumbnail strip, which scrolls).
    let x0 = null;
    lb.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) gestured = false;
      x0 = e.target.closest(".lb-panel") || e.touches.length > 1 || z > 1 ? null : e.touches[0].clientX;
    }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (e.touches.length) return;
      if (x0 == null || gestured || z > 1) { x0 = null; return; }
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    if (photos.length < 2) { lb.classList.add("single"); playBtn.hidden = true; }
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
