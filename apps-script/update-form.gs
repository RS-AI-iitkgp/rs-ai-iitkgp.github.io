/* ==================================================================
   Receiver for the "Update your entry" form (update.html).
   This is Google Apps Script code: it runs in your Google account,
   not on the website. Each submission becomes a row in a Google
   Sheet, and the photo is saved in a Google Drive folder, linked
   from the row.

   Set up once:
   1. Create a new Google Sheet, e.g. "Directory updates".
   2. In the Sheet: Extensions > Apps Script. Delete the sample code,
      paste this whole file, and click Save.
   3. In the function menu next to "Debug", pick "setup" and click Run.
      Allow access when Google asks. If it warns "Google hasn't
      verified this app", click Advanced > Go to ... (it is your own
      script). This creates the "Submissions" tab with its heading row,
      and the photo folder in My Drive (the script makes and uses its
      own folder - a folder you made by hand isn't used).
      setup never sends email.
   4. Deploy > New deployment > gear icon > Web app:
        Execute as:     Me
        Who has access: Anyone
      Click Deploy, allow access again if asked, and copy the Web app
      URL (it ends in /exec).
   5. Put that URL in ENDPOINT at the top of assets/js/update.js.

   After changing this script later: paste it, Save, run "setup" again
   (it only fixes the heading row and layout; rows stay as they are),
   then Deploy > Manage deployments > pencil icon > Version: New version
   > Deploy. The URL stays the same.

   Confirming by email: every update must be confirmed from an email
   address before you act on it.
     - Current scholars (incl. "thesis submitted") on the website: the
       institute email already on the website for them.
     - New current scholars: the email they typed, which must be an
       institute email.
     - Alumni: the email they typed.
   The link opens a page with a "Yes, confirm" button. The Sheet's
   "Confirmation" column shows Waiting / Confirmed / why none was sent,
   and you get the notification email once it is confirmed (or straight
   away if no confirmation email could be sent).

   TEST_MODE (below) is on to start with: confirmation emails then come
   to NOTIFY_EMAIL instead of the scholar, marked "Test mode", so
   nobody else gets an email while you set up and test. Set it to false
   and deploy a new version when you're ready.

   To see both emails, pick "testEmail" in the function menu and click
   Run: it sends a sample of each to NOTIFY_EMAIL only (nothing goes in
   the Sheet).

   Photo links open only in the Google account that owns this script.
   ================================================================== */

const NOTIFY_EMAIL = "";          // your address, for the notification emails; "" for none
const TEST_MODE = true;           // true: confirmation emails go to NOTIFY_EMAIL, not to the scholar
const SITE_URL = "https://rs-ai-iitkgp.github.io/";
const SHEET_NAME = "Submissions";
const FOLDER_NAME = "Directory update photos";
const MAX_PHOTO_BYTES = 40 * 1024 * 1024; // the form sends photos as chosen; larger than 25 MB it shrinks them first
const HEADER_COLOUR = "#8b1d2c";  // the website's accent colour
const CONFIRM_DAYS = 7;           // how long a confirmation link works
const MAX_CONFIRMS = 3;           // confirmation emails to one address per 6 hours
const INSTITUTE_EMAIL = /@(kgpian\.)?iitkgp\.ac\.in$/i;

// Sheet columns, left to right: [heading, field from the form, column width in px]
const COLUMNS = [
  ["Submitted", "_time", 135],
  ["Status", "_status", 90],                   // left empty for you, e.g. "done" once the site is updated
  ["Confirmation", "_confirm", 190],           // "Waiting", "Confirmed <date>", or why no email was sent
  ["Confirmation email", "_confirmTo", 230],   // where the confirmation link went
  ["Type", "type", 150],                       // "Current scholar", "Thesis submitted - move to alumni" or "Alumni"
  ["Existing entry", "existing", 210],         // the name they picked in "Find your name"; empty = new entry
  ["Name", "name", 180],
  ["Email", "email", 230],
  ["Programme", "program", 150],
  ["Joined", "joined", 85],
  ["PhD awarded", "graduated", 120],
  ["Supervisors", "supervisors", 220],
  ["Thesis title", "thesis", 300],
  ["Research interests", "topic", 260],
  ["Lab", "lab", 110],
  ["Position", "position", 170],
  ["Organisation", "organisation", 180],
  ["Sector", "sector", 100],
  ["LinkedIn", "linkedin", 200],
  ["GitHub", "github", 180],
  ["Google Scholar", "scholar", 200],
  ["Website", "website", 200],
  ["Photo", "_photo", 240],                    // the photo's file name, linked to it in Google Drive
  ["Notes", "notes", 320],
  ["Consent", "consent", 80],
  ["Code", "_token", 80],                      // ties the confirmation link to this row (hidden column)
];
const colOf_ = (key) => COLUMNS.findIndex((c) => c[1] === key) + 1;

// Run from the editor: asks for permissions, adds or fixes the heading row, makes the photo folder.
// Sends no email.
function setup() {
  ownerOnly_();
  formatSheet_(sheet_());
  folder_();
}

// "?confirm=<code>": the confirmation page. Without it, a quick check that the deployment works.
function doGet(e) {
  const token = e && e.parameter && e.parameter.confirm;
  if (!token) return json_({ ok: true, message: "The update form receiver is running." });
  const hit = findByToken_(token);
  const state = !hit ? "invalid" : /^Confirmed/.test(hit.confirm) ? "confirmed" : expired_(hit.time) ? "expired" : /^Waiting/.test(hit.confirm) ? "waiting" : "invalid";
  return confirmPage_(state, hit, token);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.company) return json_({ ok: true, confirm: "none" }); // spam trap filled in: pretend it worked
    if (!str_(d.name) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(str_(d.email))) return json_({ ok: false, error: "Name and a valid email are required." });
    if (d.consent !== "yes") return json_({ ok: false, error: "Consent is required." });

    const time = new Date();
    // A photo that can't be saved doesn't lose the rest of the update; the reason goes in the Photo column.
    // pic: { url, name, blob } when saved, { error } when not, null when none was sent.
    let photo = "", pic = null;
    if (d.photo) {
      try {
        const bytes = Utilities.base64Decode(String(d.photo));
        if (bytes.length > MAX_PHOTO_BYTES) throw new Error("photo is larger than 40 MB");
        const stamp = Utilities.formatDate(time, Session.getScriptTimeZone(), "yyyy-MM-dd_HHmm");
        // Saved as sent (JPG, PNG, HEIC...), with the extension of the original file.
        const ext = (str_(d.photoName).match(/\.([a-z0-9]{2,5})$/i) || [, "jpg"])[1].toLowerCase();
        const type = /^image\/[\w.+-]+$/.test(str_(d.photoType)) ? str_(d.photoType) : "application/octet-stream";
        const blob = Utilities.newBlob(bytes, type, stamp + "_" + slug_(d.name) + "." + ext);
        const file = folder_().createFile(blob);
        pic = { url: file.getUrl(), name: file.getName(), blob: blob };
        photo = '=HYPERLINK("' + pic.url + '", "' + pic.name + '")'; // file name is letters, digits, - and _ only
      } catch (err) {
        console.error(err);
        pic = { error: err.message };
        photo = "'Photo not saved: " + err.message;
      }
    }

    // Confirmation email: where it goes is decided here, from the website's own data where possible.
    const target = confirmTarget_(d);
    let confirm, token = "", result = { ok: true, confirm: "none" };
    if (target.to && !allowSend_(target.to)) {
      confirm = "Not sent: too many requests for this email";
      result.confirm = "limited";
    } else if (target.to) {
      token = Utilities.getUuid().replace(/-/g, "");
      try {
        sendConfirmation_(target.to, d, time, pic, token);
        confirm = "Waiting" + (TEST_MODE ? " (test mode: sent to you)" : "");
        result = { ok: true, confirm: "sent", to: mask_(target.to), kind: target.kind };
      } catch (err) {
        console.error(err);
        confirm = "Not sent: " + err.message;
        token = "";
      }
    } else {
      confirm = "Not sent: " + target.reason;
    }

    const row = COLUMNS.map(([, key]) =>
      key === "_time" ? time : key === "_status" ? "" : key === "_photo" ? photo
      : key === "_confirm" ? text_(confirm) : key === "_confirmTo" ? text_(target.to || "") : key === "_token" ? text_(token)
      : text_(d[key]));
    lock.waitLock(20000);
    sheet_().appendRow(row);
    lock.releaseLock();

    // No confirmation is coming, so tell you now. (Confirmed updates are reported when confirmed.)
    if (result.confirm === "none" && NOTIFY_EMAIL) {
      try {
        notify_(d, time, pic, { tone: "warn", text: "Not confirmed by email (" + confirm.replace(/^Not sent: /, "") + "). Check with them before changing the website." });
      } catch (err) { console.error("Email not sent: " + err); }
    }
    return json_(result);
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: "Something went wrong on the server." });
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------------------------------------------
   Confirmation
   ------------------------------------------------------------------ */

// Where the confirmation link goes: { to, kind } or { reason } when there's nowhere safe to send it.
// Anyone listed as a current scholar on the website - matched by the entry they picked or by the
// name they typed - confirms from the institute email on the website, whatever else the form says.
function confirmTarget_(d) {
  let onFile;
  try {
    onFile = scholarEmail_(d.existingName);
    if (onFile === null) onFile = scholarEmail_(d.name);
  } catch (err) {
    return { reason: err.message };
  }
  if (onFile !== null) return /@/.test(onFile) ? { to: onFile, kind: "institute" } : { reason: "no email on the website for this scholar" };
  const typed = str_(d.email);
  if (str_(d.type) === "Alumni") return { to: typed, kind: "entered" };
  return INSTITUTE_EMAIL.test(typed) ? { to: typed, kind: "institute" } : { reason: "new scholar without an institute email" };
}

// The email on the website for a current scholar: the address, "" if they have none,
// or null if the name isn't a current scholar. Read from the live site, kept for 10 minutes.
function scholarEmail_(name) {
  const key = nameKey_(name);
  if (!key) return null;
  const cache = CacheService.getScriptCache();
  let map = cache.get("scholarEmails");
  if (map) {
    map = JSON.parse(map);
  } else {
    const res = UrlFetchApp.fetch(SITE_URL + "data/scholars.js", { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) throw new Error("couldn't read the website's scholar list");
    map = {};
    res.getContentText().split("\n").forEach((line) => {
      if (/^\s*\/\//.test(line)) return; // commented out (e.g. temporary withdrawal)
      const n = line.match(/\bname:\s*"([^"]+)"/), m = line.match(/\bemail:\s*"([^"]*)"/);
      if (n && m) map[nameKey_(n[1])] = m[1].trim();
    });
    cache.put("scholarEmails", JSON.stringify(map), 600);
  }
  return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null;
}

// At most MAX_CONFIRMS confirmation emails to one address per 6 hours, and never past Gmail's daily limit.
function allowSend_(to) {
  if (MailApp.getRemainingDailyQuota() < 2) return false;
  const cache = CacheService.getScriptCache(), key = "sent:" + to.toLowerCase();
  const n = Number(cache.get(key) || 0);
  if (n >= MAX_CONFIRMS) return false;
  cache.put(key, String(n + 1), 6 * 60 * 60);
  return true;
}

function sendConfirmation_(to, d, time, pic, token) {
  const sendTo = TEST_MODE ? NOTIFY_EMAIL : to;
  if (!sendTo) throw new Error("test mode is on but NOTIFY_EMAIL is empty");
  const E = EMAIL, name = str_(d.name), url = webAppUrl_() + "?confirm=" + token;
  const inlineImages = {};
  const button = '<tr><td style="padding:0 0 20px;">' + pill_(url, "Yes, confirm my update", true) +
    '<div style="margin-top:4px;' + fontCss_(13, 400, E.muted) + '">The link works for ' + CONFIRM_DAYS + " days.</div></td></tr>";
  const html = page_({
    heading: 'Confirm your <span style="color:' + E.accent + ';">update</span>',
    intro: "Someone asked to " + (str_(d.existing) ? "update the entry for" : "add") + " <b style=\"color:" + E.ink + ';">' + esc_(name) +
      "</b> on the Department of AI research scholars website. If this was you, please confirm below. If it wasn't, ignore this email - nothing will change.",
    banner: TEST_MODE ? banner_("warn", "Test mode: this email would have gone to <b>" + esc_(to) + "</b>. It came to you instead.") : "",
    body: button + sectionTitle_("What was sent") + summaryCards_(d, pic, inlineImages),
    actions: pill_(url, "Yes, confirm my update", true),
    footer: "You're getting this because this email is on the Department of AI scholars website, or was entered on its update form. " +
      "If you didn't ask for this, you can ignore it.",
  });
  MailApp.sendEmail({
    to: sendTo,
    name: "Department of AI scholars website",
    subject: (TEST_MODE ? "[Test] " : "") + "Please confirm your update to the scholars directory",
    body: "Someone asked to update the entry for " + name + " on the Department of AI research scholars website.\n" +
      "If this was you, confirm here (the link works for " + CONFIRM_DAYS + " days):\n" + url + "\n\nIf it wasn't, ignore this email - nothing will change.",
    htmlBody: html,
    inlineImages: inlineImages,
  });
}

// Called by the "Yes, confirm" button on the confirmation page.
function confirmUpdate(token) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  let hit, now;
  try {
    hit = findByToken_(token);
    if (!hit) return { state: "invalid" };
    if (/^Confirmed/.test(hit.confirm)) return { state: "confirmed" };
    if (expired_(hit.time) || !/^Waiting/.test(hit.confirm)) return { state: "expired" };
    now = new Date();
    hit.sh.getRange(hit.row, colOf_("_confirm")).setValue("'Confirmed " + Utilities.formatDate(now, Session.getScriptTimeZone(), "d MMM yyyy, HH:mm"));
  } finally {
    lock.releaseLock();
  }
  if (NOTIFY_EMAIL) {
    try {
      notify_(hit.d, hit.time, hit.pic, { tone: "ok", text: "Confirmed by email from " + hit.confirmTo + " on " +
        Utilities.formatDate(now, Session.getScriptTimeZone(), "d MMM yyyy, HH:mm") + "." });
    } catch (err) { console.error("Email not sent: " + err); }
  }
  return { state: "done" };
}

// The row for a confirmation code, with what was submitted.
function findByToken_(token) {
  if (!/^[a-f0-9]{32}$/.test(String(token))) return null;
  const sh = sheet_(), last = sh.getLastRow();
  if (last < 2) return null;
  const cell = sh.getRange(2, colOf_("_token"), last - 1, 1).createTextFinder(String(token)).matchEntireCell(true).findNext();
  if (!cell) return null;
  const row = cell.getRow(), range = sh.getRange(row, 1, 1, COLUMNS.length);
  const values = range.getValues()[0], formulas = range.getFormulas()[0];
  const d = {};
  COLUMNS.forEach(([, key], i) => { if (key[0] !== "_" && String(values[i]) !== "") d[key] = String(values[i]); });
  let pic = null;
  const p = colOf_("_photo") - 1, link = String(formulas[p]).match(/HYPERLINK\("([^"]+)",\s*"([^"]+)"\)/);
  if (link) {
    pic = { url: link[1], name: link[2], blob: null };
    try { pic.blob = DriveApp.getFileById(link[1].match(/\/d\/([\w-]+)/)[1]).getBlob(); } catch (err) { /* link only */ }
  } else if (String(values[p])) {
    pic = { error: String(values[p]).replace(/^Photo not saved: /, "") };
  }
  return { sh, row, d, pic, time: values[0], confirm: String(values[colOf_("_confirm") - 1]), confirmTo: String(values[colOf_("_confirmTo") - 1]) };
}

const isDate_ = (v) => Object.prototype.toString.call(v) === "[object Date]";
const expired_ = (time) => !isDate_(time) || Date.now() - time.getTime() > CONFIRM_DAYS * 24 * 60 * 60 * 1000;

// The page the confirmation link opens, styled like the website.
function confirmPage_(state, hit, token) {
  const name = hit ? esc_(hit.d.name || "") : "";
  const when = hit && isDate_(hit.time) ? Utilities.formatDate(hit.time, Session.getScriptTimeZone(), "d MMM yyyy, HH:mm") : "";
  const views = {
    waiting: ["Confirm your <span>update</span>", "Update for <b>" + name + "</b>, sent on " + when + ". Please confirm that you asked for it."],
    confirmed: ["Already <span>confirmed</span>", "This update is confirmed. Thank you! We review every update before it goes on the website."],
    expired: ["Link <span>expired</span>", "This link worked for " + CONFIRM_DAYS + " days. Please send your update again from the website."],
    invalid: ["Link not <span>valid</span>", "This confirmation link doesn't match any update. Please send your update again from the website."],
  };
  const [title, text] = views[state];
  const html = '<!doctype html><html><head><meta charset="utf-8">' +
    '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..700&family=Figtree:wght@400;500;600&display=swap" rel="stylesheet">' +
    "<style>" +
    "body{margin:0;background:#f6f4ef;color:#16181d;font:400 16px/1.6 Figtree,'Segoe UI',system-ui,sans-serif}" +
    ".wrap{max-width:560px;margin:0 auto;padding:48px 20px}" +
    ".kicker{font-size:13px;color:#6a6f7a}" +
    "h1{margin:8px 0 0;font:700 clamp(34px,7vw,48px)/1.05 'Bricolage Grotesque','Segoe UI',sans-serif;letter-spacing:-.03em}" +
    "h1 span{color:#8b1d2c}" +
    ".card{margin-top:24px;padding:24px;background:#fff;border:1px solid #e5e1d8;border-radius:16px}" +
    "p{margin:0;color:#3b404a}" +
    ".btn{display:inline-flex;align-items:center;gap:8px;margin-top:20px;height:46px;padding:0 24px;border:0;border-radius:999px;background:#8b1d2c;color:#fff;font:600 15px Figtree,'Segoe UI',sans-serif;cursor:pointer;text-decoration:none}" +
    ".btn:disabled{opacity:.65;cursor:progress}" +
    ".ghost{background:#fff;color:#16181d;border:1px solid #e5e1d8}" +
    ".msg{margin-top:14px;color:#8b1d2c;font-size:14px}" +
    "</style></head><body><div class=\"wrap\">" +
    '<div class="kicker">Department of Artificial Intelligence &middot; IIT Kharagpur</div>' +
    "<h1 id=\"title\">" + title + "</h1>" +
    '<div class="card"><p id="text">' + text + "</p>" +
    (state === "waiting"
      ? '<button class="btn" id="go" type="button">Yes, confirm my update</button><p class="msg" id="msg"></p>'
      : '<a class="btn ghost" href="' + esc_(SITE_URL) + '" target="_top">Go to the website</a>') +
    "</div></div>" +
    (state === "waiting"
      ? "<script>" +
        "var go=document.getElementById('go');" +
        "go.onclick=function(){go.disabled=true;go.textContent='Confirming...';" +
        "google.script.run.withSuccessHandler(function(r){" +
        "var t={done:['Thank <span>you</span>','Your update is confirmed. We review every update before it goes on the website.']," +
        "confirmed:['Already <span>confirmed</span>','This update was already confirmed. Thank you!']," +
        "expired:['Link <span>expired</span>','This link has expired. Please send your update again from the website.']," +
        "invalid:['Link not <span>valid</span>','This confirmation link doesn\\'t match any update.']}[r&&r.state]||['Something went wrong','Please try again later.'];" +
        "document.getElementById('title').innerHTML=t[0];document.getElementById('text').innerHTML=t[1];" +
        "go.outerHTML='<a class=\"btn ghost\" href=\"" + esc_(SITE_URL) + "\" target=\"_top\">Go to the website</a>';document.getElementById('msg').remove();" +
        "}).withFailureHandler(function(){go.disabled=false;go.textContent='Yes, confirm my update';" +
        "document.getElementById('msg').textContent='That didn\\'t work. Please try again in a minute.';}).confirmUpdate(" + JSON.stringify(String(token)) + ");};" +
        "</script>"
      : "") +
    "</body></html>";
  return HtmlService.createHtmlOutput(html).setTitle("Confirm your update").addMetaTag("viewport", "width=device-width, initial-scale=1");
}

/* ------------------------------------------------------------------
   Emails - designed like the form: the same heading, colours and
   numbered cards. Email apps ignore most web styling, so they are
   built from tables with the styles written on each element.
   ------------------------------------------------------------------ */
const EMAIL = {
  accent: HEADER_COLOUR, accentSoft: "#f5e8e9", ink: "#16181d", ink2: "#3b404a", muted: "#6a6f7a",
  line: "#e5e1d8", bg: "#f6f4ef", surface: "#ffffff",
  sans: "Figtree, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  display: "'Bricolage Grotesque', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};
// Photos shown inside the email (larger files and formats like HEIC get a Drive link instead).
const INLINE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const INLINE_PHOTO_BYTES = 5 * 1024 * 1024;

// The form's sections and fields, in the form's order: [label, field, kind]
const EMAIL_SECTIONS = [
  ["Your details", [
    ["Full name", "name"], ["Programme", "program"], ["Joined", "joined"], ["PhD awarded", "graduated"],
    ["Supervisor(s)", "supervisors"], ["PhD thesis title", "thesis"], ["Research interests", "topic"],
    ["Research lab", "lab"], ["Current position", "position"], ["Organisation", "organisation"], ["Sector", "sector"],
  ]],
  ["Contact and links", [
    ["Email", "email", "email"], ["LinkedIn", "linkedin", "url"], ["GitHub", "github", "url"],
    ["Google Scholar", "scholar", "url"], ["Personal website", "website", "url"],
  ]],
];

// To you: what was sent. status: { tone: "ok" | "warn", text } shown under the heading.
function notify_(d, time, pic, status) {
  const E = EMAIL, name = str_(d.name), when = Utilities.formatDate(time, Session.getScriptTimeZone(), "d MMM yyyy, HH:mm");
  const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const inlineImages = {};
  const html = page_({
    heading: 'Directory <span style="color:' + E.accent + ';">update</span>',
    intro: '<b style="color:' + E.ink + ';">' + esc_(name) + "</b> sent an update on " + esc_(when) + ".",
    tag: str_(d.type) || "Update",
    banner: status ? banner_(status.tone, esc_(status.text)) : "",
    body: summaryCards_(d, pic, inlineImages),
    actions: pill_(sheetUrl, "Open all submissions", true) + pill_("mailto:" + str_(d.email), "Reply to " + name, false),
    footer: 'Sent by the "Update your entry" form on the scholars website. Nothing changes on the website until you update it.',
  });
  // Plain-text copy for email apps that don't show HTML.
  const text = (status ? [status.text, ""] : []).concat(
    COLUMNS.filter(([, key]) => key[0] !== "_" && str_(d[key])).map(([label, key]) => label + ": " + str_(d[key])),
    pic ? ["Photo: " + (pic.url || "not saved - " + pic.error)] : [], ["", "All submissions: " + sheetUrl]).join("\n");
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: str_(d.email),
    name: "Scholars directory",
    subject: (status && status.tone === "ok" ? "Confirmed: " : status ? "Not confirmed: " : "Directory update: ") + name + (str_(d.type) ? " (" + str_(d.type) + ")" : ""),
    body: text,
    htmlBody: html,
    inlineImages: inlineImages,
  });
}

// Run from the editor: sends a sample notification and a sample confirmation email to NOTIFY_EMAIL
// only (whatever TEST_MODE says). Nothing goes in the Sheet, and the sample link doesn't confirm anything.
function testEmail() {
  ownerOnly_();
  if (!NOTIFY_EMAIL) throw new Error("Set NOTIFY_EMAIL at the top first.");
  const sample = {
    type: "Current scholar", existing: "Sample Scholar (scholars page)", name: "Sample Scholar", program: "PhD", joined: "Jul 2024",
    supervisors: "Dr. Supervisor Name", topic: "LLM, NLP", lab: "", email: NOTIFY_EMAIL,
    linkedin: "https://www.linkedin.com/in/sample", github: "", scholar: "", website: "",
    notes: "This is a test email from the update form. No submission was made.", consent: "yes",
  };
  notify_(sample, new Date(), null, { tone: "ok", text: "Sample: this is how a confirmed update is reported to you." });
  sendConfirmation_(NOTIFY_EMAIL, sample, new Date(), null, "0".repeat(32));
}

const fontCss_ = (size, weight, colour, family) =>
  "font-family:" + (family || EMAIL.sans) + ";font-size:" + size + "px;font-weight:" + (weight || 400) + ";color:" + (colour || EMAIL.ink2) + ";";
const muted_ = (t) => '<span style="color:' + EMAIL.muted + ';">' + esc_(t) + "</span>";
const link_ = (href, t) => '<a href="' + esc_(href) + '" style="color:' + EMAIL.accent + ';text-decoration:none;word-break:break-all;">' + esc_(t) + "</a>";
const pill_ = (href, t, filled) =>
  '<a href="' + esc_(href) + '" style="display:inline-block;padding:10px 18px;margin:0 8px 8px 0;border-radius:999px;text-decoration:none;' +
  fontCss_(14, 600, filled ? "#ffffff" : EMAIL.ink) + "background:" + (filled ? EMAIL.accent : EMAIL.surface) + ";border:1px solid " + (filled ? EMAIL.accent : EMAIL.line) + ';">' + esc_(t) + "</a>";
const table_ = (inner) => '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">' + inner + "</table>";
const sectionTitle_ = (t) => '<tr><td style="padding:4px 4px 12px;' + fontCss_(13, 700, EMAIL.muted) + 'letter-spacing:1px;text-transform:uppercase;">' + esc_(t) + "</td></tr>";

// A coloured note under the heading (confirmed, not confirmed, test mode).
function banner_(tone, html) {
  const c = tone === "ok" ? ["#e8f3ee", "#b9dcc9", "#1f6b45"] : ["#fdf3e3", "#f0d9a8", "#7a4f08"];
  return '<tr><td style="padding:0 0 16px;"><div style="padding:12px 16px;border-radius:12px;background:' + c[0] + ";border:1px solid " + c[1] + ";line-height:1.5;" +
    fontCss_(14, 500, c[2]) + '">' + html + "</div></td></tr>";
}

// Label / value rows, like the form's fields. Fields the form didn't show (e.g. Lab for alumni) are left out.
function fieldRows_(d, fields) {
  return fields.filter(([, key]) => key in d).map(([label, key, kind]) => {
    const v = str_(d[key]);
    const value = !v ? muted_("Not given")
      : kind === "email" ? link_("mailto:" + v, v)
      : kind === "url" && /^https?:\/\//i.test(v) ? link_(v, v)
      : esc_(v).replace(/\n/g, "<br>");
    const cell = "padding:10px 0;border-top:1px solid " + EMAIL.line + ";vertical-align:top;";
    return '<tr><td style="' + cell + "width:150px;" + fontCss_(13, 600, EMAIL.ink) + '">' + esc_(label) + "</td>" +
      '<td style="' + cell + "padding-left:12px;line-height:1.5;" + fontCss_(15) + '">' + value + "</td></tr>";
  }).join("");
}

// A numbered white card, like each step of the form.
function card_(n, title, inner) {
  const E = EMAIL;
  return '<tr><td style="padding:0 0 16px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + E.surface + ";border:1px solid " + E.line + ';border-radius:16px;border-collapse:separate;">' +
    '<tr><td style="padding:22px 24px;">' +
    '<table role="presentation" cellpadding="0" cellspacing="0"><tr>' +
    '<td width="26" height="26" align="center" style="width:26px;height:26px;border-radius:13px;background:' + E.accentSoft + ";" + fontCss_(13, 700, E.accent) + '">' + n + "</td>" +
    '<td style="padding-left:10px;' + fontCss_(19, 600, E.ink, E.display) + '">' + title + "</td></tr></table>" +
    '<div style="height:12px;line-height:12px;">&nbsp;</div>' + inner + "</td></tr></table></td></tr>";
}

// The five cards of the form, filled in with what was sent. Adds the photo to inlineImages when it can be shown.
function summaryCards_(d, pic, inlineImages) {
  const E = EMAIL, name = str_(d.name), existing = str_(d.existing);
  const who = table_(fieldRows_(d, [["I am", "type"]]) +
    '<tr><td style="padding:10px 0;border-top:1px solid ' + E.line + ";width:150px;vertical-align:top;" + fontCss_(13, 600, E.ink) + '">Directory entry</td>' +
    '<td style="padding:10px 0 10px 12px;border-top:1px solid ' + E.line + ";vertical-align:top;" + fontCss_(15) + '">' +
    (existing ? esc_(existing) : muted_("New entry - not on the website yet")) + "</td></tr>");

  let photo;
  if (!pic) photo = '<p style="margin:0;' + fontCss_(15) + '">' + muted_("No new photo - keep the current one.") + "</p>";
  else if (pic.error) photo = '<p style="margin:0;' + fontCss_(15, 400, E.accent) + '">Photo not saved: ' + esc_(pic.error) + "</p>";
  else {
    const show = pic.blob && INLINE_PHOTO_TYPES.indexOf(pic.blob.getContentType()) >= 0 && pic.blob.getBytes().length <= INLINE_PHOTO_BYTES;
    if (show) inlineImages.photo = pic.blob;
    photo = (show
      ? '<img src="cid:photo" width="180" alt="Photo of ' + esc_(name) + '" style="display:block;width:180px;max-width:100%;height:auto;border-radius:18px;border:1px solid ' + E.line + ';margin:0 0 14px;">'
      : '<p style="margin:0 0 12px;' + fontCss_(14) + '">' + muted_("This photo can't be shown in the email.") + "</p>") +
      pill_(pic.url, "Open " + pic.name + " in Drive", false);
  }

  const notes = str_(d.notes);
  const extra = '<p style="margin:0 0 14px;line-height:1.6;' + fontCss_(15) + '">' + (notes ? esc_(notes).replace(/\n/g, "<br>") : muted_("No notes.")) + "</p>" +
    '<p style="margin:0;' + fontCss_(14) + '"><span style="color:' + E.accent + ';font-weight:700;">&#10003;</span>&nbsp; ' +
    (d.consent === "yes" ? "Agreed that these details and photo can be shown on the website." : "Did not agree to show these details.") + "</p>";

  return card_(1, "Who are you?", who) +
    card_(2, EMAIL_SECTIONS[0][0], table_(fieldRows_(d, EMAIL_SECTIONS[0][1]))) +
    card_(3, EMAIL_SECTIONS[1][0], table_(fieldRows_(d, EMAIL_SECTIONS[1][1]))) +
    card_(4, "Photo", photo) +
    card_(5, "Anything else?", extra);
}

// The whole email: heading like the form page's, then o.banner, o.body rows, o.actions and o.footer.
function page_(o) {
  const E = EMAIL;
  return '<!doctype html><html><body style="margin:0;padding:0;background:' + E.bg + ';">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + E.bg + ';"><tr><td align="center" style="padding:24px 12px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;">' +
    '<tr><td style="padding:8px 4px 22px;">' +
    '<div style="' + fontCss_(12.5, 500, E.muted) + '">Department of Artificial Intelligence &middot; IIT Kharagpur</div>' +
    '<div style="margin-top:8px;line-height:1.05;letter-spacing:-0.5px;' + fontCss_(36, 700, E.ink, E.display) + '">' + o.heading + "</div>" +
    '<div style="margin-top:12px;line-height:1.6;' + fontCss_(15.5) + '">' + o.intro + "</div>" +
    (o.tag ? '<div style="margin-top:12px;"><span style="display:inline-block;padding:5px 12px;border-radius:999px;background:' + E.accentSoft +
      ";border:1px solid #e3c4c8;" + fontCss_(12.5, 600, E.accent) + '">' + esc_(o.tag) + "</span></div>" : "") +
    "</td></tr>" +
    (o.banner || "") + o.body +
    (o.actions ? '<tr><td style="padding:4px 0 8px;">' + o.actions + "</td></tr>" : "") +
    '<tr><td style="padding:8px 4px 0;line-height:1.6;' + fontCss_(12.5, 400, E.muted) + '">' + o.footer + "</td></tr>" +
    "</table></td></tr></table></body></html>";
}

/* ------------------------------------------------------------------
   Sheet, folder and helpers
   ------------------------------------------------------------------ */

// The "Submissions" tab. If row 1 isn't the heading row (a new tab, or one made by hand),
// the heading row is put in above whatever is there.
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME, 0);
  if (sh.getRange(1, 1).getValue() !== COLUMNS[0][0]) {
    if (sh.getLastRow() > 0) sh.insertRowBefore(1);
    formatSheet_(sh);
  }
  return sh;
}

// Heading row (white on the site's red, frozen, with filter buttons), column widths and date format.
function formatSheet_(sh) {
  const n = COLUMNS.length;
  if (sh.getMaxColumns() < n) sh.insertColumnsAfter(sh.getMaxColumns(), n - sh.getMaxColumns());
  sh.getRange(1, 1, 1, n)
    .setValues([COLUMNS.map(([label]) => label)])
    .setFontWeight("bold").setFontColor("#ffffff").setBackground(HEADER_COLOUR)
    .setVerticalAlignment("middle").setWrap(false);
  sh.setRowHeight(1, 34);
  sh.setFrozenRows(1);
  COLUMNS.forEach(([, , width], i) => sh.setColumnWidth(i + 1, width));
  sh.hideColumns(colOf_("_token"));
  const rows = sh.getMaxRows() - 1;
  if (rows > 0) {
    sh.getRange(2, 1, rows, 1).setNumberFormat("yyyy-mm-dd hh:mm");
    sh.getRange(2, 1, rows, n).setVerticalAlignment("top");
  }
  if (!sh.getFilter()) sh.getRange(1, 1, sh.getMaxRows(), n).createFilter(); // whole tab, so new rows are included
}

// The photo folder in your Drive (made on first use; its id is remembered, so renaming or moving it is fine).
function folder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("FOLDER_ID");
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (err) { /* deleted: make a new one */ }
  }
  const folder = DriveApp.createFolder(FOLDER_NAME);
  props.setProperty("FOLDER_ID", folder.getId());
  return folder;
}

// setup and testEmail run only from the editor, by you - not by visitors of the confirmation page.
function ownerOnly_() {
  const you = Session.getActiveUser().getEmail();
  if (!you || you !== Session.getEffectiveUser().getEmail()) throw new Error("Run this from the script editor.");
}

function webAppUrl_() {
  try { return ScriptApp.getService().getUrl() || ""; } catch (err) { return ""; }
}

const str_ = (v) => String(v == null ? "" : v).trim().slice(0, 2000);
// The leading ' keeps every answer as plain text: "Jul 2024" doesn't turn into a date,
// and nothing starting with "=" can run as a formula. Sheets doesn't show the '.
const text_ = (v) => (str_(v) ? "'" + str_(v) : "");
const esc_ = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const slug_ = (v) => str_(v).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "photo";
const nameKey_ = (v) => String(v || "").toLowerCase().normalize("NFKD").replace(/[^a-z]/g, "");
// "as•••@kgpian.iitkgp.ac.in": enough to recognise, without showing the whole address.
const mask_ = (email) => { const [u, dom] = String(email).split("@"); return u.slice(0, 2) + "•••@" + dom; };

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
