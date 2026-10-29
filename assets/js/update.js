/* ==================================================================
   "Update your entry" form (update.html). Sends the details and a
   photo to a Google Apps Script web app, which adds a row to a Google
   Sheet and saves the photo in a Google Drive folder.
   Script and set-up steps: apps-script/update-form.gs.
   ================================================================== */
(function () {
  "use strict";

  // Web app URL from the Apps Script deployment (ends in /exec).
  // While it is "", the form explains that it isn't connected yet.
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbwaC_0vjZ0iXq8dgfzif8yvtuInD7cTcGdA30Xt8twy-DSCxJeMIclWZ6BCN1jKu_cm/exec";
  const CONTACT = "ranjan.sarkar.24@kgpian.iitkgp.ac.in";
  // Photos are sent exactly as chosen. Only a file too big for Google to take in one go
  // is re-saved as a large JPEG first (still far sharper than the site needs).
  const SEND_AS_IS = 25 * 1024 * 1024;
  const SHRINK_TO = 4000; // px, longest side, for such files

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (id, size = 16) => `<svg width="${size}" height="${size}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const form = $("#uf");
  const f = form.elements;

  // Template values in the data files count as empty.
  const PLACEHOLDERS = new Set(["#", "YYYY", "Current Position", "Organisation Name", "PhD thesis title goes here", "Prof. Supervisor Name"]);
  const clean = (v) => { const s = String(v ?? "").trim(); return PLACEHOLDERS.has(s) ? "" : s; };
  // "scholar", "moving" (thesis submitted, to be moved to the alumni page) or "alumni"
  const typeNow = () => form.querySelector('input[name="type"]:checked').value;
  const listFor = (type) => (type === "alumni" ? "alumni" : "scholar"); // which page they're on now
  const TYPE_LABELS = { scholar: "Current scholar", moving: "Thesis submitted - move to alumni", alumni: "Alumni" };
  function checkType(type) {
    form.querySelector(`input[name="type"][value="${type}"]`).checked = true;
    setType(type);
  }

  // ---- Month / year choices ----
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const thisYear = new Date().getFullYear();
  const addOptions = (select, values) => values.forEach((v) => select.add(new Option(v, v)));
  addOptions(f.joinedMonth, MONTHS);
  addOptions(f.joinedYear, Array.from({ length: thisYear + 2 - 2010 }, (_, i) => String(thisYear + 1 - i)));
  addOptions(f.graduated, Array.from({ length: thisYear + 1 - 2010 }, (_, i) => String(thisYear - i)));

  /* ---------- Dropdowns: the directory's popup menus over a hidden native <select> ---------- */
  const dropdowns = [];
  function closeAll(except) {
    dropdowns.forEach((d) => d !== except && d.close(false));
    if (except !== "finder") closeFinder();
  }

  function Dropdown(select) {
    const wrap = select.closest(".select");
    const labelEl = select.getAttribute("aria-labelledby") && document.getElementById(select.getAttribute("aria-labelledby"));
    const label = labelEl ? labelEl.textContent.trim() : select.getAttribute("aria-label") || "";
    const uid = `dd-${select.name}`;
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dd-trigger";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", uid);
    btn.innerHTML = `<span class="dd-value"></span>${icon("chevron", 16)}`;
    const panel = document.createElement("div");
    panel.className = "dd-panel";
    panel.id = uid;
    panel.setAttribute("role", "listbox");
    panel.setAttribute("aria-label", label);
    wrap.append(btn, panel);

    const options = () => $$(".dd-option", panel);
    const isOpen = () => wrap.classList.contains("open");

    function sync() {
      panel.innerHTML = [...select.options].map((o) => `
        <div class="dd-option" role="option" tabindex="-1" data-value="${esc(o.value)}" aria-selected="${o.value === select.value}">
          <span class="dd-label">${esc(o.textContent)}</span>
          <svg class="dd-check" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m5 12.5 4.5 4.5L19 7.5"/></svg>
        </div>`).join("");
      const cur = select.options[select.selectedIndex];
      $(".dd-value", btn).textContent = cur ? cur.textContent : "";
      wrap.classList.toggle("is-placeholder", !select.value);
      btn.setAttribute("aria-label", `${label}: ${select.value ? cur.textContent : "not chosen"}`);
    }

    function open() {
      closeAll(api);
      wrap.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      // Keep the panel on screen: flip to right-aligned or upwards if it would overflow.
      panel.classList.remove("align-right", "drop-up");
      const r = panel.getBoundingClientRect();
      if (r.right > document.documentElement.clientWidth - 8) panel.classList.add("align-right");
      if (r.bottom > window.innerHeight - 8 && btn.getBoundingClientRect().top > r.height + 16) panel.classList.add("drop-up");
      const sel = panel.querySelector('[aria-selected="true"]') || options()[0];
      if (!sel) return;
      sel.scrollIntoView({ block: "nearest" });
      sel.focus({ preventScroll: true });
      if (document.activeElement !== sel) requestAnimationFrame(() => isOpen() && sel.focus({ preventScroll: true }));
    }

    function close(returnFocus) {
      if (!isOpen()) return;
      wrap.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      if (returnFocus) btn.focus({ preventScroll: true });
    }

    function choose(value) {
      close(true);
      if (select.value !== value) {
        select.value = value;
        select.dispatchEvent(new Event("change"));
      }
    }

    function move(el, step) {
      const list = options();
      const i = list.indexOf(el);
      const next = list[Math.max(0, Math.min(list.length - 1, (i < 0 ? 0 : i) + step))];
      next && next.focus();
    }

    btn.addEventListener("click", () => (isOpen() ? close(true) : open()));
    btn.addEventListener("keydown", (e) => {
      if (["ArrowDown", "ArrowUp"].includes(e.key)) { e.preventDefault(); open(); }
    });
    panel.addEventListener("click", (e) => {
      const opt = e.target.closest(".dd-option");
      if (opt) choose(opt.dataset.value);
    });
    panel.addEventListener("mousemove", (e) => {
      const opt = e.target.closest(".dd-option");
      if (opt && document.activeElement !== opt) opt.focus({ preventScroll: true });
    });
    panel.addEventListener("keydown", (e) => {
      const el = document.activeElement;
      const list = options();
      switch (e.key) {
        case "ArrowDown": e.preventDefault(); move(el, 1); break;
        case "ArrowUp": e.preventDefault(); move(el, -1); break;
        case "Home": e.preventDefault(); list[0]?.focus(); break;
        case "End": e.preventDefault(); list[list.length - 1]?.focus(); break;
        case "Enter": case " ": e.preventDefault(); if (el.classList.contains("dd-option")) choose(el.dataset.value); break;
        case "Escape": e.preventDefault(); e.stopPropagation(); close(true); break;
        case "Tab": close(false); break;
        default:
          // Type-ahead: jump to the first option starting with the typed letter or digit.
          if (e.key.length === 1) {
            const k = e.key.toLowerCase();
            const hit = list.find((o) => o.textContent.trim().toLowerCase().startsWith(k));
            hit && hit.focus();
          }
      }
    });
    select.addEventListener("change", sync);

    const api = { sync, close, btn, select };
    dropdowns.push(api);
    sync();
    return api;
  }

  $$(".uf select").forEach(Dropdown);
  const syncSelects = () => dropdowns.forEach((d) => d.sync());

  document.addEventListener("pointerdown", (e) => {
    if (!(e.target instanceof Element && e.target.closest(".select"))) closeAll();
  });

  /* ---------- Scholar / alumni: show the fields that apply ---------- */
  function setType(type) {
    $$("[data-only]").forEach((el) => {
      const on = el.dataset.only.split(" ").includes(type);
      el.hidden = !on;
      $$("input, select, textarea", el).forEach((i) => { i.disabled = !on; }); // left out of the submission
    });
    if (type === "moving" && !f.graduated.value) { f.graduated.value = "Thesis submitted"; syncSelects(); }
    if (findBox.classList.contains("open")) renderFinder();
    checkEmail();
  }

  /* ---------- "Find your name": suggestions as you type ---------- */
  const norm = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const people = [
    ...(window.SCHOLARS || []).map((p) => ({ ...p, list: "scholar" })),
    ...(window.ALUMNI || []).map((p) => ({ ...p, list: "alumni" })),
  ].map((p) => ({ ...p, words: norm(p.name).split(" ") })).sort((a, b) => a.name.localeCompare(b.name));

  const find = $("#find"), findBox = $(".uf-find-box"), findList = $("#findList"), findNote = $("#findNote");
  const findHint = findNote.textContent;
  let results = [], active = -1, loaded = null;

  // Same idea as the directory search: typos and spelling variants still find a name.
  // Rough "sounds-like" key (Choudhury/Chowdhury, Bhowmik/Bhowmick, Sreenjoy/Srinjoy).
  const skel = (w) => w.replace(/(.)\1+/g, "$1").replace(/ph/g, "f").replace(/sh/g, "s").replace(/ck|q/g, "k")
    .replace(/w/g, "v").replace(/ou|ow/g, "u").replace(/ee|y/g, "i").replace(/([kgcjtdbp])h/g, "$1").replace(/(.)\1+/g, "$1");

  // Optimal-string-alignment distance (edits incl. swapped letters), with early exit above `max`.
  function osa(a, b, max) {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > max) return max + 1;
    let prev2 = null, prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      let rowMin = i;
      for (let j = 1; j <= n; j++) {
        let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
        cur[j] = v;
        if (v < rowMin) rowMin = v;
      }
      if (rowMin > max) return max + 1;
      prev2 = prev;
      prev = cur;
    }
    return prev[n];
  }

  // How well one typed word fits one word of a name: 1 = the start of it, lower = a near miss, 0 = no.
  function wordScore(q, w) {
    if (w.startsWith(q)) return 1;
    const qs = skel(q), ws = skel(w);
    if (qs.length >= 2 && (ws === qs || (qs.length >= 3 && ws.startsWith(qs)))) return 0.85;
    // Typos rarely change the first letter, so allow one edit fewer when it differs.
    const max = (q.length >= 9 ? 3 : q.length >= 6 ? 2 : q.length >= 4 ? 1 : 0) - (q[0] !== w[0] ? 1 : 0);
    if (max <= 0) return 0;
    const d = Math.min(osa(q, w, max), w.length > q.length ? osa(q, w.slice(0, q.length), max) : max + 1);
    return d <= max ? 0.8 - 0.12 * d : 0;
  }

  // { exact, similar } for a query. Exact: every typed word starts a word of the name
  // ("ran sar" finds Ranjan Sarkar). Similar: every word is close (all but one in longer
  // queries), and the words fit well on average.
  function search(q) {
    const qw = norm(q).split(" ").filter(Boolean);
    if (!qw.length) return { exact: people, similar: [] };
    const joined = qw.join("");
    const scored = people.map((p) => {
      const per = qw.map((w) => Math.max(0, ...p.words.map((n) => wordScore(w, n))));
      const whole = p.words.join("").startsWith(joined); // "subhojyoti" typed as "subho jyoti", or the other way
      const exact = whole || per.every((s) => s === 1);
      const hits = per.filter((s) => s > 0).length;
      const fit = per.reduce((a, b) => a + b, 0) / qw.length;
      const similar = !exact && joined.length >= 3 && fit >= 0.55 && (hits === qw.length || (qw.length >= 2 && hits >= qw.length - 1));
      const score = per.reduce((a, b) => a + b, 0) + (p.words[0].startsWith(qw[0]) ? 0.5 : 0);
      return { p, exact, similar, score };
    });
    const pick = (key) => scored.filter((r) => r[key]).sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name)).map((r) => r.p);
    return { exact: pick("exact"), similar: pick("similar").slice(0, 6) };
  }

  function highlight(name, q) {
    const qw = norm(q).split(" ").filter(Boolean);
    return name.split(" ").map((word) => {
      const w = qw.filter((x) => norm(word).startsWith(x)).sort((a, b) => b.length - a.length)[0];
      return w ? `<mark>${esc(word.slice(0, w.length))}</mark>${esc(word.slice(w.length))}` : esc(word);
    }).join(" ");
  }

  const initials = (name) => name.replace(/[^A-Za-z ]/g, " ").split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  function meta(p) {
    const sup = [].concat(p.supervisors || []).map(clean).filter(Boolean)[0];
    if (p.list === "alumni") return [p.status || (clean(p.graduated) ? `PhD ${p.graduated}` : "Alumni"), clean(p.organisation)].filter(Boolean).join(" · ");
    return [clean(p.joined) && `Joined ${p.joined}`, sup && `Dr. ${sup}`].filter(Boolean).join(" · ");
  }

  function renderFinder() {
    const q = find.value.trim(), list = listFor(typeNow());
    const { exact, similar } = search(q);
    const mine = exact.filter((p) => p.list === list);
    const close = similar.filter((p) => p.list === list);
    // The other page too (e.g. a scholar who has just submitted), once a name is taking shape.
    const other = norm(q).length >= 2 ? [...exact, ...similar].filter((p) => p.list !== list).slice(0, 5) : [];
    results = [...mine, ...close, ...other];
    let i = 0;
    const row = (p) => `
      <div class="dd-option uf-person" role="option" id="findOpt${i}" data-i="${i++}" aria-selected="false">
        <span class="uf-av" aria-hidden="true">${esc(initials(p.name))}${p.photo ? `<img src="${esc(p.photo)}" alt="" loading="lazy" />` : ""}</span>
        <span class="uf-person-text"><span class="uf-person-name">${highlight(p.name, q)}</span><small>${esc(meta(p))}</small></span>
      </div>`;
    const group = (title, ps) => (ps.length ? `<div class="uf-group">${title}</div>${ps.map(row).join("")}` : "");
    const pageName = list === "scholar" ? "current scholars" : "alumni";
    findList.innerHTML =
      mine.map(row).join("") +
      (mine.length || close.length ? "" : `<div class="uf-empty">No match in ${pageName}. If you are new, skip this and fill in the form below.</div>`) +
      group(mine.length ? "Similar names" : `No exact match. Did you mean`, close) +
      group(`Listed under ${list === "scholar" ? "alumni" : "current scholars"}`, other);
    $$("img", findList).forEach((img) => {
      img.onload = () => img.classList.add("loaded");
      img.onerror = () => img.remove();
    });
    active = -1;
    find.removeAttribute("aria-activedescendant");
  }

  function openFinder() {
    closeAll("finder");
    renderFinder();
    findBox.classList.add("open");
    find.setAttribute("aria-expanded", "true");
  }
  function closeFinder() {
    findBox.classList.remove("open");
    find.setAttribute("aria-expanded", "false");
    find.removeAttribute("aria-activedescendant");
    active = -1;
  }
  const finderOpen = () => findBox.classList.contains("open");

  function setActive(i) {
    const opts = $$(".uf-person", findList);
    if (!opts.length) return;
    active = (i + opts.length) % opts.length;
    opts.forEach((o, k) => o.classList.toggle("is-active", k === active));
    find.setAttribute("aria-activedescendant", opts[active].id);
    opts[active].scrollIntoView({ block: "nearest" });
  }

  function pick(i) {
    const p = results[i];
    if (!p) return;
    find.value = p.name;
    closeFinder();
    load(p);
  }

  find.addEventListener("focus", () => finderOpen() || openFinder());
  find.addEventListener("click", () => finderOpen() || openFinder());
  find.addEventListener("input", () => {
    if (loaded && find.value.trim() !== loaded.name) unlink();
    openFinder();
  });
  find.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); if (!finderOpen()) openFinder(); setActive(active + 1); break;
      case "ArrowUp": e.preventDefault(); if (finderOpen()) setActive(active - 1); break;
      case "Enter": // never sends the form from here
        e.preventDefault();
        if (finderOpen() && (active >= 0 || results.length === 1)) pick(Math.max(active, 0));
        break;
      case "Escape": if (finderOpen()) { e.preventDefault(); closeFinder(); } break;
      case "Tab": closeFinder(); break;
    }
  });
  findList.addEventListener("pointerdown", (e) => e.preventDefault()); // keep the cursor in the box
  findList.addEventListener("click", (e) => {
    const o = e.target.closest(".uf-person");
    if (o) pick(Number(o.dataset.i));
  });
  findList.addEventListener("mousemove", (e) => {
    const o = e.target.closest(".uf-person");
    if (o && Number(o.dataset.i) !== active) setActive(Number(o.dataset.i));
  });

  /* ---------- Email: where the confirmation link will go ---------- */
  // Current scholars on the website confirm from the institute email we have for them; new
  // current scholars must give an institute email; alumni confirm from the email they give.
  const INSTITUTE_EMAIL = /@(kgpian\.)?iitkgp\.ac\.in$/i;
  const emailHint = $("#emailHint");
  function checkEmail() {
    const type = typeNow(), v = f.email.value.trim();
    const needInstitute = type !== "alumni" && !(loaded && loaded.list === "scholar");
    f.email.setCustomValidity(needInstitute && v && !INSTITUTE_EMAIL.test(v) ? "Please use your institute email." : "");
    emailHint.textContent = type === "alumni"
      ? "Shown on your card. We'll send a link to this email to confirm your update."
      : loaded && loaded.list === "scholar"
        ? "Shown on your card. We'll send a link to confirm your update to the institute email we have for you."
        : "Use your institute email (…@kgpian.iitkgp.ac.in). We'll send a link to it to confirm your update.";
  }
  f.email.addEventListener("input", checkEmail);

  $$('input[name="type"]').forEach((r) => r.addEventListener("change", () => setType(r.value)));
  setType(typeNow());

  /* ---------- Load an existing entry into the form ---------- */
  function load(p) {
    loaded = p;
    f.existing.value = `${p.name} (${p.list === "scholar" ? "scholars" : "alumni"} page)`;
    // Someone on the alumni page is alumni; a current scholar who chose "Alumni" wants to be moved there.
    if (p.list === "alumni" && typeNow() !== "alumni") checkType("alumni");
    else if (p.list === "scholar" && typeNow() === "alumni") checkType("moving");
    findNote.textContent = typeNow() === "moving"
      ? "Loaded your current details. Add your thesis title, and we'll move your entry to the alumni page."
      : "Loaded your current details. Change whatever needs updating.";

    const set = (name, v) => { f[name].value = clean(v); };
    ["name", "topic", "lab", "email", "website", "scholar", "linkedin", "github", "position", "organisation", "thesis"].forEach((k) => set(k, p[k]));
    f.supervisors.value = [].concat(p.supervisors || []).map(clean).filter(Boolean)
      .map((s) => (/^(dr|prof)\b/i.test(s) ? s : `Dr. ${s}`)).join(", ");
    if (p.list === "scholar") f.program.value = p.program === "MS" ? "MS (by Research)" : p.program === "Working Professional" ? "PhD (Working Professional)" : "PhD";
    const m = String(p.joined || "").match(/([A-Za-z]{3})?[a-z]*\s*(\d{4})/);
    f.joinedMonth.value = m && m[1] ? m[1][0].toUpperCase() + m[1].slice(1, 3).toLowerCase() : "";
    f.joinedYear.value = m ? m[2] : "";
    f.graduated.value = p.status || (typeNow() === "moving" ? "Thesis submitted" : clean(p.graduated));
    f.sector.value = clean(p.sector);
    syncSelects();
    checkEmail();
    if (!photoFile) showCurrentPhoto(p.photo);
  }

  // The text no longer names the loaded person: keep what's typed, but it's no longer tied to that entry.
  function unlink() {
    loaded = null;
    f.existing.value = "";
    findNote.textContent = findHint;
    checkEmail();
    if (!photoFile) showCurrentPhoto("");
  }

  /* ---------- Photo: sent as chosen; click the preview to see it full size ---------- */
  const preview = $("#photoPreview"), fileInput = $("#photoFile"), photoNote = $("#photoNote");
  const photoClear = $("#photoClear"), photoBtnText = $("#photoBtnText");
  const viewer = $("#photoViewer"), viewerImg = $("img", viewer);
  const emptyPreview = preview.innerHTML, photoHint = photoNote.textContent;
  let photoFile = null, photoUrl = "", currentPhoto = "";

  function setPreview(src, alt) {
    if (!src) { preview.innerHTML = emptyPreview; preview.disabled = true; return; }
    const img = new Image();
    img.alt = alt;
    img.src = src;
    const zoom = document.createElement("span");
    zoom.className = "uf-photo-zoom";
    zoom.innerHTML = icon("search", 15);
    preview.replaceChildren(img, zoom);
    preview.disabled = false;
  }

  // The photo already on the site; picking another name first clears the previous person's.
  function showCurrentPhoto(src) {
    currentPhoto = src || "";
    setPreview("");
    photoNote.textContent = photoHint;
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      if (photoFile || currentPhoto !== src) return; // a new photo was chosen, or another name picked
      setPreview(src, "Your current photo");
      photoNote.textContent = "Your current photo. Click it to see it full size, or choose a new one.";
    };
    img.src = src;
  }

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    fileInput.value = "";
    if (!file) return;
    photoFile = file;
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = URL.createObjectURL(file);
    photoBtnText.textContent = "Choose another";
    photoClear.hidden = false;
    const img = new Image();
    img.src = photoUrl;
    try {
      await img.decode();
      if (photoFile !== file) return;
      setPreview(photoUrl, "Your new photo");
      photoNote.textContent = "Your new photo. Click it to see it full size.";
    } catch (e) {
      if (photoFile !== file) return;
      setPreview("");
      photoNote.textContent = `${file.name} will be sent. This browser can't show a preview of it.`;
    }
  });

  function clearPhoto() {
    photoFile = null;
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = "";
    photoBtnText.textContent = "Choose a photo";
    photoClear.hidden = true;
    showCurrentPhoto(loaded ? loaded.photo : "");
  }
  photoClear.addEventListener("click", clearPhoto);

  preview.addEventListener("click", () => {
    const img = $("img", preview);
    if (!img) return;
    viewerImg.src = img.src;
    viewerImg.alt = img.alt;
    viewer.showModal();
  });
  $(".uf-viewer-close", viewer).addEventListener("click", () => viewer.close());
  viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); }); // click outside the photo

  const toBase64 = (blob) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

  async function photoPayload(file) {
    if (file.size <= SEND_AS_IS) return { photo: await toBase64(file), photoType: file.type, photoName: file.name };
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      const k = Math.min(1, SHRINK_TO / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * k);
      canvas.height = Math.round(img.naturalHeight * k);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      return { photo: await toBase64(blob), photoType: "image/jpeg", photoName: file.name.replace(/\.[^.]*$/, "") + ".jpg" };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  /* ---------- Links: add "https://" when someone pastes "github.com/name" ---------- */
  $$('input[type="url"]').forEach((i) => i.addEventListener("blur", () => {
    const v = i.value.trim();
    i.value = v && !/^https?:\/\//i.test(v) ? `https://${v.replace(/^\/+/, "")}` : v;
  }));

  /* ---------- Send ---------- */
  const msg = $("#ufMsg"), submitBtn = $("#submitBtn"), done = $("#ufDone");
  const mailLink = `<a href="mailto:${CONTACT}?subject=Scholar%20directory%20update">${CONTACT}</a>`;
  const say = (html, isError) => { msg.innerHTML = html; msg.classList.toggle("is-error", !!isError); };

  function busy(text) {
    submitBtn.disabled = !!text;
    submitBtn.classList.toggle("is-busy", !!text);
    $(".btn-label", submitBtn).textContent = text || "Send update";
  }

  // The thank-you panel says where the confirmation email went (out: the Apps Script's reply).
  function finish(out, type) {
    const sent = out && out.confirm === "sent";
    $("#doneIcon").setAttribute("href", sent ? "#i-mail" : "#i-check");
    $("#doneTitle").textContent = sent ? "Thank you! Please confirm by email" : "Thank you!";
    $("#doneText").innerHTML = sent
      ? `We've sent a confirmation email to ${out.kind === "institute" ? "your official institute email" : "the email you entered"}, <b>${esc(out.to)}</b>. ` +
        "Please open it and confirm this request. We review your update only after you confirm. The link works for 7 days."
      : out && out.confirm === "limited"
        ? "We've already sent several confirmation emails for this address recently. Please use the link in the latest one, or try again later."
        : type === "scholar" || type === "moving"
          ? "Your update has been sent. We couldn't send a confirmation email to your institute email, so we'll check it with you before making any changes."
          : "Your update has been sent. We'll check it with you before making any changes.";
    form.hidden = true;
    done.hidden = false;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    done.focus({ preventScroll: true });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    say("");
    if (!form.checkValidity()) {
      form.classList.add("tried");
      const bad = form.querySelector(":invalid");
      const target = bad.tagName === "SELECT" ? dropdowns.find((d) => d.select === bad).btn : bad;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
      say(bad.name === "consent" ? "Please tick the box to agree before sending."
        : bad.name === "email" && bad.validity.customError ? "New current scholars need to use their institute email (…@kgpian.iitkgp.ac.in)."
        : "Please fill in the highlighted fields.", true);
      return;
    }
    const type = typeNow();
    if (f.company.value) { finish(null, type); return; } // spam trap

    if (!ENDPOINT) {
      say(`The form isn't connected yet. Please email your update to ${mailLink} for now.`, true);
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    data.type = TYPE_LABELS[data.type] || data.type;
    data.existingName = loaded ? loaded.name : ""; // the script looks up who confirms from this
    data.joined =[data.joinedMonth, data.joinedYear].filter(Boolean).join(" ");
    delete data.joinedMonth;
    delete data.joinedYear;
    delete data.company;

    busy(photoFile ? "Uploading..." : "Sending...");
    try {
      if (photoFile) {
        try {
          Object.assign(data, await photoPayload(photoFile));
        } catch (err) {
          say("This photo couldn't be sent. Please choose a smaller copy, or a JPG or PNG file.", true);
          return;
        }
      }
      // Sent as plain text, so the browser posts it straight to Google without a CORS pre-check.
      const res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) });
      const out = await res.json().catch(() => null);
      if (!res.ok || !out || !out.ok) throw new Error((out && out.error) || `HTTP ${res.status}`);
      finish(out, type);
    } catch (err) {
      say(`Sorry, that didn't go through. Please try again in a minute, or email ${mailLink}.`, true);
    } finally {
      busy("");
    }
  });

  $("#againBtn").addEventListener("click", () => {
    form.reset();
    form.classList.remove("tried");
    find.value = "";
    unlink();
    clearPhoto();
    setType("scholar");
    syncSelects();
    say("");
    done.hidden = true;
    form.hidden = false;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- Page chrome (as on the other pages) ---------- */
  const root = document.documentElement;
  let themeTimer;
  $("#themeBtn").addEventListener("click", () => {
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
  $("#lastUpdated").textContent = (window.UPDATE_PAGE && window.UPDATE_PAGE.lastUpdated) || "";
})();
