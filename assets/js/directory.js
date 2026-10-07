/* ==================================================================
   Directory page logic — shared by index.html (scholars) and
   alumni.html. Each page sets window.DIRECTORY before loading this.
   ================================================================== */
(function () {
  "use strict";

  const cfg = window.DIRECTORY;
  const $ = (sel, root = document) => root.querySelector(sel);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canTransition = typeof document.startViewTransition === "function" && !reduceMotion;
  const withTransition = (fn) => (canTransition ? document.startViewTransition(fn) : fn());

  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^(https?:\/\/|#)/i.test(String(u || "").trim()) ? String(u).trim() : "");
  const initials = (name) => {
    const parts = String(name).replace(/^(dr|mr|ms|mrs)\.?\s+/i, "").split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
  };
  const byName = (a, b) => a.s.name.localeCompare(b.s.name, undefined, { sensitivity: "base" }) || a.i - b.i;
  // Entries without a real year (e.g. "YYYY") always go last.
  const byYear = (dir) => (a, b) => {
    const x = a.s.year == null ? null : a.s.year * 400 + a.s.month * 32 + a.s.day;
    const y = b.s.year == null ? null : b.s.year * 400 + b.s.month * 32 + b.s.day;
    if (x === y) return byName(a, b);
    if (x == null) return 1;
    if (y == null) return -1;
    return dir * (x - y) || byName(a, b);
  };

  /* ---------- Normalise data ---------- */
  const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const NONE = cfg.group.none;
  const ITEMS = (cfg.items || []).map((raw) => {
    const s = { ...raw };
    s.group = String(s[cfg.group.key] || "").trim() || NONE;
    s.yearLabel = String(s[cfg.year.key] ?? "").trim();
    // Accepts "2024", "Jul 2024" or "6 Oct 2026" (day and month are used for ordering).
    const when = s.yearLabel.match(/^(?:(\d{1,2})\s+)?(?:([A-Za-z]{3})[a-z]*\.?\s+)?(\d{4})$/);
    s.year = when ? Number(when[3]) : null;
    s.month = when && when[2] ? Math.max(0, MONTHS.indexOf(when[2].toLowerCase())) : 0;
    s.day = when && when[1] ? Number(when[1]) : 0;
    if (cfg.kind === "event") {
      // Map event fields onto the shared ones used by search and sorting.
      s.name = s.title || "";
      s.supervisors = [];
      s.people = [].concat(s.people || []).filter(Boolean);
      s.links = [].concat(s.links || []).filter((l) => l && l.url);
    } else {
      s.supervisors = (Array.isArray(s.supervisors) ? s.supervisors : [s.supervisors]).filter(Boolean);
    }
    return s;
  });

  const GROUPS = [...new Set(ITEMS.map((s) => s.group))]
    .sort((a, b) => (a === NONE) - (b === NONE) || a.localeCompare(b));
  const HUE = new Map(GROUPS.filter((g) => g !== NONE).map((g, i) => [g, `var(--a${(i % 8) + 1})`]));
  HUE.set(NONE, "var(--muted)");
  const YEARS = [...new Set(ITEMS.map((s) => s.year).filter(Boolean))].sort((a, b) => b - a);

  const SORTERS = { "year-desc": byYear(-1), "year-asc": byYear(1), "name-asc": byName, "name-desc": (a, b) => -byName(a, b) };
  const DEFAULT_SORT = YEARS.length ? "year-desc" : "name-asc";
  const state = { q: "", group: "all", year: "all", sort: DEFAULT_SORT, view: "grid" };

  /* ---------- Smart search: typo-tolerant, abbreviation-aware, ranked ---------- */
  const STOP = new Set(["a", "an", "and", "at", "by", "for", "in", "of", "on", "the", "to", "with", "prof", "dr", "mr", "ms", "mrs"]);
  const PLACEHOLDER = /^(yyyy|prof\.? supervisor name|prof\.? co-supervisor name|current position|organisation name|phd thesis title goes here)$/i;
  const norm = (t) => String(t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const words = (t) => norm(t).split(" ").filter((w) => w && !STOP.has(w));
  // Rough "sounds-like" key for common spelling variants (Bhowmik/Bhowmick, Sreenjoy/Srinjoy, Choudhury/Chowdhury).
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

  // Build a weighted word index for one person. Acronyms of multi-word phrases
  // ("Natural Language Processing" → "nlp") let abbreviations match.
  function buildIndex(s) {
    const map = new Map();
    const add = (w, weight, acr = false) => {
      const old = map.get(w);
      if (!old || old.weight < weight) map.set(w, { w, s: skel(w), weight, acr });
    };
    const field = (value, weight, acronyms = false) => {
      [].concat(value || []).forEach((v) => {
        if (!v || PLACEHOLDER.test(String(v).trim())) return;
        words(v).forEach((w) => add(w, weight));
        if (!acronyms) return;
        String(v).split(/[,;/+()&]|\band\b/i).forEach((seg) => {
          const ws = words(seg).filter((w) => /^[a-z]/.test(w));
          for (let i = 0; i < ws.length; i++)
            for (let len = 2; len <= Math.min(5, ws.length - i); len++)
              add(ws.slice(i, i + len).map((w) => w[0]).join(""), weight, true);
        });
      });
    };
    field(s.name, 3);
    field(s.supervisors, 2);
    field(s.position, 1.6, true);
    field(s.organisation, 1.6, true);
    field(s.group, 1.4, true);
    field(s.topic, 1.4, true);
    field(s.thesis, 1.4, true);
    field(s.people, 2);
    field(s.speaker, 2);
    field(s.affiliation, 1.4, true);
    field(s.summary, 1.2, true);
    field(s.venue, 1);
    if (s.year) field(s.yearLabel, 1);
    return [...map.values()];
  }

  function tokenScore(q, e) {
    const w = e.w;
    if (w === q) return 1;
    if (e.acr) return 0; // abbreviations only match exactly
    if (w.startsWith(q)) return q.length >= 2 ? 0.9 : 0.5;
    if (q.length >= 3 && w.includes(q)) return 0.72;
    if (/^[0-9]+$/.test(q)) return 0; // years and numbers: no typo tolerance
    const qs = skel(q);
    if (qs.length >= 2 && qs === e.s) return 0.85;
    if (qs.length >= 4 && e.s.startsWith(qs)) return 0.78;
    // Typos rarely change the first letter, so allow one edit fewer when it differs ("sanjay" ≠ "ranjan").
    const max = (q.length >= 9 ? 3 : q.length >= 6 ? 2 : q.length >= 4 ? 1 : 0) - (q[0] !== w[0] ? 1 : 0);
    if (max <= 0) return 0;
    const d = osa(q, w, max);
    if (d <= max) return 0.8 - 0.12 * d;
    if (q.length >= 5 && w.length > q.length) { // half-typed word with a typo: "reinfro" → "reinforcement"
      const dp = osa(q, w.slice(0, q.length), max);
      if (dp <= max) return 0.66 - 0.12 * dp;
    }
    return 0;
  }

  // Score a person against all query words: { all: every word matched, n: words matched, score }.
  function scoreCard(c, tokens) {
    let score = 0, n = 0;
    tokens.forEach((q) => {
      let best = 0, raw = 0;
      c.index.forEach((e) => {
        const t = tokenScore(q, e);
        if (t * e.weight > best) { best = t * e.weight; raw = t; }
      });
      if (raw >= 0.5) { n++; score += best; }
    });
    return { all: n === tokens.length, n, score };
  }

  /* ---------- Cards ---------- */
  const icon = (id, size = 16) => `<svg width="${size}" height="${size}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const linkIcon = (href, id, label, name) =>
    href ? `<a href="${esc(href)}" ${href.startsWith("#") ? "" : 'target="_blank" rel="noopener"'} title="${label}" aria-label="${label} — ${esc(name)}">${icon(id)}</a>` : "";

  // "Dr. Name", linked to the homepage in data/supervisors.js when known.
  const SUP_SITES = window.SUPERVISORS || {};
  function supervisorHTML(name) {
    if (PLACEHOLDER.test(name)) return esc(name);
    const label = /^(dr|prof)\.?\s/i.test(name) ? name : `Dr. ${name}`;
    const url = safeUrl(SUP_SITES[name]);
    return url && url !== "#"
      ? `<a class="sup-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`
      : esc(label);
  }

  function eventCardHTML(s) {
    const big = s.day ? s.day : s.year && s.month !== null && /[a-z]/i.test(s.yearLabel) ? MONTHS[s.month] : s.year ? s.year : "TBA";
    const small = s.day ? `${MONTHS[s.month]} ${s.year}` : s.year && /[a-z]/i.test(s.yearLabel) ? s.year : "";
    const meta = [s.speaker && `<b>${esc(s.speaker)}</b>${s.affiliation ? `, ${esc(s.affiliation)}` : ""}`, s.venue && esc(s.venue)]
      .filter(Boolean).join(" · ");
    const pills = s.links.map((l) => {
      const href = safeUrl(l.url);
      return href ? `<a class="c-pill" href="${esc(href)}" ${href.startsWith("#") ? "" : 'target="_blank" rel="noopener"'}>${esc(l.label || "Link")} <span aria-hidden="true">↗</span></a>` : "";
    }).join("");
    return `
      <div class="c-photo c-date" aria-hidden="true"><span class="d-big">${esc(big)}</span>${small ? `<span class="d-small">${esc(small)}</span>` : ""}</div>
      <span class="c-joined c-tag">${esc(s.group)}</span>
      <div class="c-id">
        <h3 class="c-name">${esc(s.title)}</h3>
        ${meta ? `<p class="c-pos">${icon(s.speaker ? "mic" : "pin", 15)}<span>${meta}</span></p>` : ""}
      </div>
      <p class="c-topic">${esc(s.summary || "")}</p>
      ${s.people.length ? `<div class="c-sup"><span class="c-label">${esc(s.peopleLabel || "People")}</span>${s.people.map(esc).join(", ")}</div>` : ""}
      <div class="c-links">${pills}</div>`;
  }

  function cardHTML(s) {
    if (cfg.kind === "event") return eventCardHTML(s);
    const alumni = cfg.kind === "alumni";
    const sups = s.supervisors;
    const text = alumni ? s.thesis : s.topic;
    const links = [
      s.email ? linkIcon(`mailto:${s.email}`, "mail", "Email", s.name) : "",
      linkIcon(safeUrl(s.linkedin), "linkedin", "LinkedIn", s.name),
      linkIcon(safeUrl(s.website), "globe", "Website", s.name),
      linkIcon(safeUrl(s.scholar), "scholar", "Google Scholar", s.name),
      linkIcon(safeUrl(s.github), "github", "GitHub", s.name),
    ].join("");
    const position = alumni && (s.position || s.organisation)
      ? `<p class="c-pos">${icon("briefcase", 15)}<span>${s.position ? `<b>${esc(s.position)}</b>` : ""}${s.position && s.organisation ? " at " : ""}${esc(s.organisation || "")}</span></p>`
      : "";
    return `
      <div class="c-photo" aria-hidden="true">${esc(initials(s.name))}${s.photo ? `<img src="${esc(s.photo)}" alt="" loading="lazy" decoding="async" onload="this.classList.add('loaded')" onerror="this.remove()">` : ""}</div>
      ${s.yearLabel ? `<span class="c-joined">${esc(cfg.year.label)} <b>${esc(s.yearLabel)}</b></span>` : ""}
      <div class="c-id">
        <h3 class="c-name">${esc(s.name)}</h3>
        ${position}
      </div>
      <p class="c-topic">${text ? `${alumni ? '<span class="c-label">Thesis</span>' : ""}${esc(text)}` : ""}</p>
      ${sups.length ? `<div class="c-sup"><span class="c-label">${sups.length > 1 ? "Supervisors" : "Supervisor"}</span>${sups.map(supervisorHTML).join(", ")}</div>` : ""}
      <div class="c-links">${links}</div>`;
  }

  const grid = $("#grid");
  const cards = ITEMS.map((s, i) => {
    const el = document.createElement("article");
    el.className = "card reveal" + (s.supervisors.length || (s.people && s.people.length) ? "" : " no-sup") + (cfg.kind === "event" ? " is-event" : "");
    el.style.setProperty("--area", HUE.get(s.group));
    el.style.viewTransitionName = `${cfg.kind}-${i}`;
    el.innerHTML = cardHTML(s);
    return { s, el, i, index: buildIndex(s), hit: null };
  });

  /* ---------- Scroll reveal (first appearance only) ---------- */
  let settled = false;
  const io = "IntersectionObserver" in window && !reduceMotion
    ? new IntersectionObserver((entries) => {
        let k = 0;
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.style.setProperty("--d", `${Math.min(k++, 8) * 60}ms`);
          e.target.classList.add("in");
          io.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -6% 0px" })
    : null;

  cards.forEach(({ el }) => {
    if (io) io.observe(el); else el.classList.remove("reveal");
    el.addEventListener("animationend", (e) => {
      if (e.animationName === "rise") el.classList.remove("reveal", "in");
    });
  });

  // Once the visitor starts filtering, view transitions take over from the reveal.
  function settle() {
    if (settled) return;
    settled = true;
    cards.forEach(({ el }) => {
      if (el.classList.contains("reveal") && !el.classList.contains("in")) {
        el.classList.remove("reveal");
        io && io.unobserve(el);
      }
    });
  }

  /* ---------- Dropdown (custom popup over a hidden native <select>) ---------- */
  const dropdowns = [];
  function closeDropdowns(except) { dropdowns.forEach((d) => d !== except && d.close(false)); }

  function Dropdown(select, { showCount = false } = {}) {
    const wrap = select.closest(".select");
    const label = select.getAttribute("aria-label") || "";
    const uid = `dd-${select.id}`;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dd-trigger";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", uid);
    btn.innerHTML = `<span class="dd-value"></span><span class="dd-count" hidden></span>${icon("chevron", 16)}`;
    const panel = document.createElement("div");
    panel.className = "dd-panel";
    panel.id = uid;
    panel.setAttribute("role", "listbox");
    panel.setAttribute("aria-label", label);
    wrap.append(btn, panel);

    const options = () => [...panel.querySelectorAll(".dd-option")];
    const isOpen = () => wrap.classList.contains("open");

    function sync() {
      const opts = [...select.options];
      panel.innerHTML = opts.map((o) => `
        <div class="dd-option" role="option" tabindex="-1" data-value="${esc(o.value)}" aria-selected="${o.value === select.value}">
          ${o.dataset.hue ? `<span class="dd-dot" style="--area:${o.dataset.hue}"></span>` : ""}
          <span class="dd-label">${esc(o.textContent)}</span>
          ${o.dataset.count != null ? `<span class="dd-n">${esc(o.dataset.count)}</span>` : ""}
          <svg class="dd-check" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m5 12.5 4.5 4.5L19 7.5"/></svg>
        </div>${o.value === "all" && opts.length > 1 ? '<div class="dd-sep" role="separator"></div>' : ""}`).join("");
      const cur = select.options[select.selectedIndex];
      btn.querySelector(".dd-value").textContent = cur ? cur.textContent : "";
      const count = btn.querySelector(".dd-count");
      count.hidden = !(showCount && cur && cur.dataset.count != null);
      if (!count.hidden) count.textContent = cur.dataset.count;
      btn.setAttribute("aria-label", `${label}: ${cur ? cur.textContent : ""}`);
      options().forEach((el) => el.classList.toggle("is-empty", el.querySelector(".dd-n")?.textContent === "0"));
    }

    function open() {
      closeDropdowns(api);
      wrap.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      // Keep the panel on screen: flip to right-aligned if it would overflow.
      panel.classList.remove("align-right", "drop-up");
      const r = panel.getBoundingClientRect();
      if (r.right > document.documentElement.clientWidth - 8) panel.classList.add("align-right");
      if (r.bottom > window.innerHeight - 8 && btn.getBoundingClientRect().top > r.height + 16) panel.classList.add("drop-up");
      const sel = panel.querySelector('[aria-selected="true"]') || options()[0];
      if (!sel) return;
      sel.scrollIntoView({ block: "nearest" });
      sel.focus({ preventScroll: true });
      // The panel may not be focusable until its opening styles apply.
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
          // Type-ahead: jump to the first option starting with the typed letter.
          if (e.key.length === 1) {
            const k = e.key.toLowerCase();
            const hit = list.find((o) => o.querySelector(".dd-label").textContent.trim().toLowerCase().startsWith(k));
            hit && hit.focus();
          }
      }
    });

    const api = { sync, close, wrap };
    dropdowns.push(api);
    return api;
  }

  document.addEventListener("pointerdown", (e) => {
    if (!(e.target instanceof Element && e.target.closest(".select"))) closeDropdowns();
  });

  /* ---------- Controls ---------- */
  const qInput = $("#q");
  const groupSel = $("#group");
  const yearSel = $("#year");
  const sortSel = $("#sort");

  groupSel.innerHTML = [`<option value="all">${esc(cfg.group.all)}</option>`, ...GROUPS.map((g) => `<option value="${esc(g)}" data-hue="${HUE.get(g)}">${esc(g)}</option>`)].join("");
  const groupOpts = [...groupSel.options];

  yearSel.innerHTML = `<option value="all">${esc(cfg.year.all)}</option>` +
    YEARS.map((y) => `<option value="${y}">${esc(`${cfg.year.label} ${y}`.trim())}</option>`).join("");
  if (!YEARS.length) yearSel.closest(".select").hidden = true;

  sortSel.innerHTML = cfg.sorts.map(([v, label]) => `<option value="${v}">${esc(label)}</option>`).join("");

  const groupDD = Dropdown(groupSel, { showCount: true });
  const yearDD = Dropdown(yearSel);
  const sortDD = Dropdown(sortSel);

  /* ---------- Apply state ---------- */
  let searchMode = "all"; // "all" words must match; falls back to "any" when nothing matches all
  let searching = false;

  function runSearch() {
    const tokens = words(state.q);
    searching = tokens.length > 0;
    cards.forEach((c) => { c.hit = searching ? scoreCard(c, tokens) : null; });
    searchMode = "all";
    if (searching && !cards.some((c) => c.hit.all && passesFilters(c))) searchMode = "any";
  }

  const passesFilters = (c, ignoreGroup = false) =>
    (ignoreGroup || state.group === "all" || c.s.group === state.group)
    && (state.year === "all" || String(c.s.year) === state.year);

  function matches(c, ignoreGroup = false) {
    if (!passesFilters(c, ignoreGroup)) return false;
    if (!c.hit) return true;
    return searchMode === "all" ? c.hit.all : c.hit.n > 0;
  }

  function update() {
    runSearch();
    const sorter = SORTERS[state.sort] || SORTERS[DEFAULT_SORT];
    // While searching, best matches come first; the chosen sort breaks ties.
    const ordered = [...cards].sort((a, b) =>
      (searching ? (b.hit.all - a.hit.all) || (b.hit.n - a.hit.n) || (b.hit.score - a.hit.score) : 0) || sorter(a, b));
    let shown = 0;
    ordered.forEach((c) => {
      const ok = matches(c);
      c.el.hidden = !ok;
      if (ok) shown++;
      grid.appendChild(c.el);
    });

    grid.classList.toggle("is-list", state.view === "list");
    grid.hidden = shown === 0;
    $("#empty").hidden = shown !== 0;

    // Option counts reflect the current search and year.
    groupOpts.forEach((o) => {
      const g = o.value;
      const n = cards.filter((c) => matches(c, true) && (g === "all" || c.s.group === g)).length;
      o.dataset.count = n;
    });
    groupSel.value = state.group;
    yearSel.value = state.year;
    sortSel.value = state.sort;
    [groupDD, yearDD, sortDD].forEach((d) => d.sync());
    groupSel.closest(".select").classList.toggle("is-active", state.group !== "all");
    yearSel.closest(".select").classList.toggle("is-active", state.year !== "all");
    document.querySelectorAll(".seg button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === state.view)));
    const vf = $("#viewFab");
    if (vf) {
      const next = state.view === "grid" ? "list" : "grid";
      vf.dataset.view = state.view;
      vf.setAttribute("aria-label", `Switch to ${next} view`);
      vf.title = `Switch to ${next} view`;
    }

    const [one, many] = cfg.noun;
    const filtered = state.q.trim() || state.group !== "all" || state.year !== "all";
    $("#resultText").innerHTML = searching && searchMode === "any" && shown
      ? `No exact match — showing <b>${shown}</b> close ${shown === 1 ? "match" : "matches"}`
      : filtered
        ? `Showing <b>${shown}</b> of ${cards.length} ${cards.length === 1 ? one : many}${searching && shown > 1 ? " · best matches first" : ""}`
        : `<b>${cards.length}</b> ${cards.length === 1 ? one : many}`;
    $("#clearBtn").hidden = !filtered;
    $("#sheetCount").textContent = filtered ? `${shown} of ${cards.length}` : `${cards.length} ${many}`;
    const active = [state.q.trim(), state.group !== "all", state.year !== "all"].filter(Boolean).length;
    const badge = $("#fabBadge");
    badge.hidden = !active;
    badge.textContent = active;

    syncUrl();
  }

  function apply(animate = true) {
    if (animate) settle();
    animate ? withTransition(update) : update();
  }

  function setState(patch, animate = true) {
    Object.assign(state, patch);
    if (qInput.value !== state.q) qInput.value = state.q;
    apply(animate);
  }

  /* ---------- URL state (shareable filtered links) ---------- */
  const P = cfg.group.param;
  function syncUrl() {
    const p = new URLSearchParams();
    if (state.q.trim()) p.set("q", state.q.trim());
    if (state.group !== "all") p.set(P, state.group);
    if (state.year !== "all") p.set("year", state.year);
    if (state.sort !== DEFAULT_SORT) p.set("sort", state.sort);
    if (state.view !== "grid") p.set("view", state.view);
    const qs = p.toString();
    try { history.replaceState(null, "", qs ? `?${qs}` : location.pathname); } catch (e) {}
  }

  function readUrl() {
    const p = new URLSearchParams(location.search);
    const group = p.get(P), year = p.get("year"), sort = p.get("sort"), view = p.get("view");
    if (group && GROUPS.includes(group)) state.group = group;
    if (year && YEARS.includes(Number(year))) state.year = year;
    if (sort && SORTERS[sort] && cfg.sorts.some(([v]) => v === sort)) state.sort = sort;
    if (view === "list" || view === "grid") state.view = view;
    else { try { const v = localStorage.getItem("doai-view"); if (v === "list" || v === "grid") state.view = v; } catch (e) {} }
    state.q = p.get("q") || "";
  }

  /* ---------- Events ---------- */
  groupSel.addEventListener("change", () => setState({ group: groupSel.value }));
  yearSel.addEventListener("change", () => setState({ year: yearSel.value }));
  sortSel.addEventListener("change", () => setState({ sort: sortSel.value }));

  let qTimer;
  qInput.addEventListener("input", () => {
    clearTimeout(qTimer);
    // Typing updates in place; a page-wide transition per keystroke feels laggy.
    qTimer = setTimeout(() => { settle(); setState({ q: qInput.value }, false); }, 120);
  });
  qInput.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (qInput.value) { e.stopPropagation(); qInput.value = ""; setState({ q: "" }, false); }
    else qInput.blur();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) {
      e.preventDefault();
      qInput.focus();
    }
  });

  document.querySelectorAll(".seg button").forEach((b) =>
    b.addEventListener("click", () => {
      try { localStorage.setItem("doai-view", b.dataset.view); } catch (e) {}
      setState({ view: b.dataset.view });
    })
  );

  const clearAll = () => setState({ q: "", group: "all", year: "all" });
  $("#clearBtn").addEventListener("click", clearAll);
  document.querySelector("[data-clear]").addEventListener("click", clearAll);

  /* ---------- Theme ---------- */
  $("#themeBtn").addEventListener("click", () => {
    const root = document.documentElement;
    const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    withTransition(() => { root.dataset.theme = next; });
    try { localStorage.setItem("doai-theme", next); } catch (e) {}
  });

  /* ---------- Phones: floating search button opens search as a panel ---------- */
  const phone = matchMedia("(max-width: 720px)");
  const toolbar = $("#toolbar");
  const spacer = $("#toolbarSpacer");
  const fab = $("#searchFab");
  const viewFab = $("#viewFab");
  const backdrop = $("#sheetBackdrop");
  let sheetOpen = false;
  let sheetSnapshot = "";

  function updateFab() {
    const headerH = $("#siteHeader").offsetHeight;
    const past = !sheetOpen && phone.matches && toolbar.getBoundingClientRect().bottom < headerH;
    fab.classList.toggle("show", past);
    viewFab.classList.toggle("show", past);
  }

  function openSheet() {
    if (sheetOpen) return;
    sheetOpen = true;
    sheetSnapshot = JSON.stringify([state.q, state.group, state.year, state.sort]);
    spacer.style.height = `${toolbar.offsetHeight + parseFloat(getComputedStyle(toolbar).marginBottom)}px`; // no layout jump
    toolbar.classList.add("as-sheet");
    toolbar.setAttribute("role", "dialog");
    toolbar.setAttribute("aria-modal", "true");
    document.documentElement.classList.add("sheet-open");
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add("show"));
    fab.setAttribute("aria-expanded", "true");
    updateFab();
    qInput.focus({ preventScroll: true });
  }

  function closeSheet(toResults = false) {
    if (!sheetOpen) return;
    closeDropdowns();
    toolbar.classList.add("closing");
    backdrop.classList.remove("show");
    fab.setAttribute("aria-expanded", "false");
    const changed = toResults || sheetSnapshot !== JSON.stringify([state.q, state.group, state.year, state.sort]);
    setTimeout(() => {
      toolbar.classList.remove("as-sheet", "closing");
      toolbar.removeAttribute("role");
      toolbar.removeAttribute("aria-modal");
      spacer.style.height = "";
      backdrop.hidden = true;
      document.documentElement.classList.remove("sheet-open");
      sheetOpen = false;
      // Show the updated results from the top of the list.
      if (changed) $("#directory").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      updateFab();
      if (!changed) fab.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 190);
  }

  fab.addEventListener("click", openSheet);

  // Switch grid/list while scrolled, keeping the card you were looking at in place.
  viewFab.addEventListener("click", () => {
    const top = $("#siteHeader").offsetHeight;
    const anchor = [...grid.children].find((el) => !el.hidden && el.getBoundingClientRect().bottom > top + 8); // first card on screen
    const before = anchor ? anchor.getBoundingClientRect().top : 0;
    const view = state.view === "grid" ? "list" : "grid";
    try { localStorage.setItem("doai-view", view); } catch (e) {}
    settle();
    setState({ view }, false);
    if (anchor) window.scrollBy({ top: anchor.getBoundingClientRect().top - before, behavior: "instant" });
    if (!reduceMotion) { grid.classList.remove("swap"); void grid.offsetWidth; grid.classList.add("swap"); }
  });
  $("#sheetDone").addEventListener("click", () => closeSheet());
  backdrop.addEventListener("click", () => closeSheet());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sheetOpen && !document.querySelector(".select.open")) closeSheet();
  });
  qInput.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    // Enter = "show me the results": apply the text now (skip the typing delay),
    // then close the panel / hide the phone keyboard and jump to the list.
    e.preventDefault();
    clearTimeout(qTimer);
    settle();
    if (qInput.value !== state.q) setState({ q: qInput.value }, false);
    qInput.blur();
    if (sheetOpen) closeSheet(true);
    else if (phone.matches) $("#directory").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
  phone.addEventListener("change", () => { if (!phone.matches) closeSheet(); updateFab(); });
  window.addEventListener("resize", updateFab, { passive: true });

  /* ---------- Header / toolbar / back-to-top ---------- */
  const header = $("#siteHeader");
  const toTop = $("#toTop");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 8);
    toTop.classList.toggle("show", y > 900);
    updateFab();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  if ("IntersectionObserver" in window) {
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h"), 10) || 64;
    new IntersectionObserver(([e]) => $("#toolbar").classList.toggle("stuck", !e.isIntersecting && e.boundingClientRect.top < headerH + 20), {
      rootMargin: `-${headerH + 9}px 0px 0px 0px`,
    }).observe($("#toolbarSentinel"));
  }

  /* ---------- Hero numbers ---------- */
  function countUp(el, to) {
    if (reduceMotion) { el.textContent = to; return; }
    const start = performance.now(), dur = 1100;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  const stats = cfg.stats({ items: ITEMS, groups: GROUPS.filter((g) => g !== NONE), years: YEARS });
  document.querySelectorAll("[data-count]").forEach((el) => {
    const v = stats[el.dataset.count];
    if (v == null) el.closest("li").hidden = true;
    else countUp(el, v);
  });
  const batchLabel = $("#batchLabel");
  if (batchLabel && YEARS.length > 1) batchLabel.textContent += ` · ${YEARS[YEARS.length - 1]}–${YEARS[0]}`;

  /* ---------- Footer ---------- */
  $("#yearNow").textContent = new Date().getFullYear();
  $("#lastUpdated").textContent = cfg.lastUpdated || "";

  /* ---------- Init ---------- */
  readUrl();
  qInput.value = state.q;
  apply(false);
})();
