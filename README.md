# PhD Scholars — Department of AI, IIT Kharagpur

A static website listing the department's current PhD scholars and alumni.

**Live site:** https://phdscholars-ai.github.io
It has no build step and no dependencies: plain HTML, CSS and JavaScript.

## Pages

- `index.html` — current PhD scholars
- `alumni.html` — PhD alumni and where they work now

Both pages offer typo-tolerant search, filters (research area / sector, year),
sorting, grid and list views, dark mode, and a mobile search button.

## Project layout

```
index.html, alumni.html   pages
assets/css/style.css      styles (shared)
assets/js/directory.js    search, filters, cards (shared)
data/scholars.js          ← scholar data — edit this
data/alumni.js            ← alumni data — edit this
images/scholars/          scholar photos (see README.txt inside)
images/alumni/            alumni photos
images/logo/              IIT Kharagpur emblem and favicon
```

## Updating the data

Edit `data/scholars.js` or `data/alumni.js`. Each person is one line, and the
comment at the top of each file explains every field. A few notes:

- **joined** — `"Jul 2024"` or `2024`. From the roll number: the first two
  digits are the year, `AI91R…` means July of that year, and `AI92R…` means
  January of the next year (e.g. `24AI92R01` → `"Jan 2025"`).
- **area** — drives the area filter and card colour; keep spellings consistent.
- **Links** — use full `https://…` URLs. `"#"` is a placeholder and `""` hides
  the icon.
- **Photos** — square JPGs named as in the `photo` field, e.g.
  `images/scholars/jane-doe.jpg`. A missing photo falls back to initials.
- Update `lastUpdated` near the bottom of each HTML page when you change data.

## Running locally

Open `index.html` in a browser. Or serve the folder:

```
python -m http.server 8000
```

Then visit http://localhost:8000.

## Deploying

The site is published with GitHub Pages from the `main` branch of
`PhDscholars-AI/phdscholars-ai.github.io`. Any push to `main` goes live within
a minute or two. It also works on any other static host (no server-side code).

## Licence

- **Code** (`index.html`, `alumni.html`, `assets/`): MIT.
- **Data and images** (`data/`, `images/`, and all personal information shown
  on the site): **all rights reserved, not licensed for reuse.** Do not copy,
  scrape, redistribute, or use it for datasets or model training.

See [LICENSE](LICENSE) for the full terms.
