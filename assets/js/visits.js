/* ==================================================================
   Visitor counts - GoatCounter (goatcounter.com): free for
   non-commercial sites, no cookies, no personal data collected.

   Set up once:
   1. Sign up at goatcounter.com with the code below ("ranjan-iitkgp"
      → dashboard at https://ranjan-iitkgp.goatcounter.com).
   2. In the dashboard's Settings, tick "Allow adding visitor counts
      on your website", so the footer can show the total.
   Until then nothing is shown and nothing breaks.
   ================================================================== */
(function () {
  "use strict";

  const CODE = "ranjan-iitkgp";
  // Don't count local previews.
  if (!CODE || location.protocol === "file:" || /^(localhost|127\.|\[::1\])/.test(location.hostname)) return;

  // "/" and "/index.html" count as one page; each event page counts separately (event.html?id=…);
  // search and filter settings in the URL are ignored.
  const id = new URLSearchParams(location.search).get("id");
  const page = location.pathname.replace(/\/index\.html$/, "/");
  window.goatcounter = { path: page + (/event\.html$/.test(page) && id ? `?id=${encodeURIComponent(id)}` : "") };
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.dataset.goatcounter = `https://${CODE}.goatcounter.com/count`;
  document.head.appendChild(s);

  // Total visits to the whole site, in the footer. GoatCounter refreshes this public total
  // at most every few hours (the dashboard is live), and it stays hidden while it's 0.
  const out = document.getElementById("visitCount");
  if (!out || !window.fetch) return;
  fetch(`https://${CODE}.goatcounter.com/counter/TOTAL.json`)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!d || !d.count || !/[1-9]/.test(d.count)) return;
      out.textContent = `${d.count} visits`;
      out.hidden = false;
    })
    .catch(() => {});
})();
