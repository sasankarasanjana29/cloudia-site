# Cloudia website

The marketing site for Cloudia, the iPhone app for things still in motion.
Static HTML, CSS and JavaScript with no dependencies: nothing to install, and
nothing on the site comes from another company (no fonts, scripts, analytics
or cookies). The privacy policy says so, so keep it that way.

## Build

```bash
node build.mjs
```

Writes the finished site to `dist/` (pass a folder to build somewhere else).
Open `dist/index.html` through any static server, for example:

```bash
python3 -m http.server 4191 --directory dist
```

## Where things are

| Path | What it is |
| --- | --- |
| `src/pages/` | One file per page. Each starts with `<!--meta {"title", "description"} -->`. |
| `src/partials/` | Shared pieces pulled in with `<!-- include:name -->`: the layout, header, footer, icon sprite, and the three phone screens. |
| `src/styles/` | `tokens` (the app's colours, type, space and radius), `base`, `app-ui` (the phone screens), `layout`, `home`, `legal`. Joined into one `site.css` in that order. |
| `src/scripts/` | Plain ES modules. `main.js` starts each feature; each feature does nothing on a page without its markup. |
| `src/assets/art/` | Cloudia's artwork as WebP, made from the app by `scripts/sync-assets.py`. Never edited by hand. |
| `src/content/credits.json` | The app's open-source credits, copied from the app repo (`src/data/credits.json`). |
| `scripts/` | `sync-assets.py` (app art to WebP), `og-image.py` (the link preview image). |

## Rules

- **The app is the source of truth.** Colours, radii and every number in the phone screens come from the app (`src/theme/tokens.ts`, `LoopCard.tsx`, `DoneSeal.tsx`, `OrbitHero.tsx`). Change the app first, then the site.
- **Only claim what the app does today.** No reminders (notifications are off in the current build), no Pro features, no prices, no invented numbers or reviews.
- **No em or en dashes** in any copy.
- **Light by default.** Dark mode only when the visitor flips the switch; the choice stays in their browser (`localStorage`).
- **Buttons are the app's Button:** primary = 3px rim `#c0e5ff -> #0195ff` around a fill `#0195ff -> #96d3ff`, 60 tall, 16 semibold.
- **Motion** uses transform and opacity, runs only while on screen, and stops under Reduce Motion.
- **Contrast:** brand blue `#0195ff` is for large text and UI only; small brand text uses `#0069b8`.

## Updating from the app

```bash
python3 scripts/sync-assets.py ../test-designs-app
cp ../test-designs-app/src/data/credits.json src/content/credits.json
python3 scripts/og-image.py
node build.mjs
```

## Hosting

Any static host works. `dist/` includes `.nojekyll` for GitHub Pages, and a
`src/CNAME` file is copied across if a custom domain is added.

## Publishing

GitHub Pages serves the `docs/` folder of `main` at
https://sasankarasanjana29.github.io/cloudia-site/. After any change:

```bash
node build.mjs docs
git add -A && git commit -m "..." && git push
```
