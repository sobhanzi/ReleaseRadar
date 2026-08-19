# ReleaseRadar

A premium, dark, cinematic entertainment release tracker for games, movies, TV series, and animation. Pure HTML/CSS/JS — no build step, no backend, fully static.

## Run locally

Just serve the folder (needed because it uses `fetch`-free relative paths but still benefits from a local server for clean routing):

```bash
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

Opening `index.html` directly via `file://` also works.

## Deploy to GitHub Pages

1. Push this folder's contents to the root of a repo (or `/docs`).
2. In the repo settings, enable GitHub Pages for that branch/folder.
3. Done — no build step required.

## Project structure

```
index.html          Home page: hero radar, filters, curated sections
detail.html          Per-title detail page (reads ?id= from the URL)
css/styles.css        All styling — design tokens live at the top as CSS variables
js/data.js            Sample dataset + ReleaseRadarAPI (the data access layer)
js/countdown.js        Date/countdown math, shared by home + detail
js/art.js              Procedural poster/backdrop art (no image hosting needed)
js/app.js               Home page controller
js/detail.js             Detail page controller
```

## Swapping in a real API

Every screen talks to `ReleaseRadarAPI` in `js/data.js` — nothing else in the app
touches the raw data array. To connect a real backend, edit only `fetchItems()`:

```js
function fetchItems() {
  return fetch('/api/items').then(r => r.json());
}
```

As long as the response resolves to an array of objects matching the shape
documented at the top of `js/data.js`, the rest of the app (rendering, search,
filters, sort, countdowns, related items) works unchanged.

## Notes

- All poster/backdrop art is generated with CSS gradients + inline SVG icons,
  keyed off each item's id and category — no external image requests, so the
  site stays fast and works fully offline.
- The trailer panel is a styled placeholder ready to be wired to a real
  video URL or embed (add a `trailerUrl` field to an item and swap the click
  handler in `js/detail.js`).
- Countdown timers update every second on the detail page and every 30
  seconds on list badges (per-second precision isn't visible at list scale,
  which keeps things efficient with 40+ cards on screen).
