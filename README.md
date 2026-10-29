# PhD Scholars - Department of AI, IIT Kharagpur

A static website listing the department's research scholars (PhD and MS by Research), alumni and events.

**Live site:** https://rs-ai-iitkgp.github.io

## Pages

- `index.html` - current research scholars (PhD and MS by Research)
- `alumni.html` - PhD alumni and where they work now
- `events.html` - events and activities (Research Scholars' Day, IdoAI talks, celebrations)
- `update.html` - form where scholars and alumni send corrections, new details and a photo

All pages offer typo-tolerant search, filters, sorting, grid and list views,
dark mode, and a mobile search button.

## Project layout

```
index.html, alumni.html,
events.html, update.html  pages
assets/css/style.css      styles
assets/js/directory.js    search, filters, cards
assets/js/update.js       update form (set ENDPOINT here)
apps-script/update-form.gs  receiver for the update form (runs in Google Apps Script)
data/scholars.js          research scholar data
data/alumni.js            alumni data
data/events.js            events data
data/supervisors.js       supervisor websites
images/                   photos and logo
```

## Update form

`update.html` sends each submission to a Google Apps Script web app, which adds
a row to a Google Sheet and saves the photo in Google Drive. Set-up steps are at
the top of `apps-script/update-form.gs`; then put the web app URL in `ENDPOINT`
at the top of `assets/js/update.js`. Until then the form asks people to email.

## Licence

- **Code** (`index.html`, `alumni.html`, `events.html`, `assets/`): MIT.
- **Data and images** (`data/`, `images/`, and all personal information shown
  on the site): **all rights reserved, not licensed for reuse.** Do not copy,
  scrape, redistribute, or use it for datasets or model training.

See [LICENSE](LICENSE) for the full terms.
