# PROGRESS

State of play for resuming. Read alongside CLAUDE.md (project overview, data
findings, decisions, guardrails). Last updated end of the polish sessions.

## Status: COMPLETE, stable, and DEPLOYED (live)

All phases 0–8 plus polish rounds are done. Build clean, ESLint clean, app
`npm audit` 0 vulns. **Live at https://bombing-britain.netlify.app/**

- Licence: user chose the "transformed derivative + prominent attribution" path
  for now (share with friends); will email the project for permission only if it
  warrants wider sharing.
- Hosting: GitHub repo **github.com/tikka84-cmd/Bombing-Britain** (branch
  `master`), Netlify connected for **auto-deploy on push**. The built map data
  (app/public/raids.geojson, ~14 MB) is committed so the Netlify build has it.
  netlify.toml drives the build (base app, npm run build, publish dist, Node 22).

## Updating the live site (the workflow now)

1. I make changes locally and commit (and, if data changed, re-run the pipeline +
   05_build so app/public/raids.geojson is refreshed and committed).
2. User clicks **Push origin** in GitHub Desktop.
3. Netlify auto-builds and redeploys (~1–3 min).

## Possible next steps (optional, not blocking)

- Email the project for reuse permission if it takes off.
- og:image social preview (drop 1200x630 at app/public/og-image.png, uncomment
  og:image in index.html).
- Trim raids.geojson size if first-load feels slow.

## How to run / rebuild (Windows)

- Node is a PORTABLE install; add it to PATH per command:
  `$env:Path = "$env:Path;$env:LOCALAPPDATA\nodejs-portable\node-v22.17.0-win-x64"`
- Run the app: `cd app; npm install; npm run dev` (or the Claude Preview launch
  config "app" in the Desktop workspace's .claude/launch.json — it points node at
  the app's vite bin; npm isn't on the preview process PATH).
- The app reads `app/public/raids.geojson` (already built locally; gitignored).
- To rebuild data you need two gitignored downloads present:
  `data-pipeline/raw/Bombing-Britain-data.xlsx` (the dataset, recovered from the
  Internet Archive — live source is paywalled) and
  `data-pipeline/gazetteer/GB.txt` (GeoNames GB dump). Then, in `data-pipeline/`:
  `npm install; npm run inspect; npm run clean; npm run test; npm run geocode;
  npm run build` (05_build writes app/public/raids.geojson).

## Current feature set (all working)

Timeline scrubber + play/pause (Slow/Normal/Fast, day-step buttons, arrow keys,
space). `All | Recent` mode toggle in the player (All default; Recent = rolling
~30-day window). National MapLibre map (light CARTO Positron), 31,287 located
attacks coloured/sized by total casualties. Filters: Reset-all, date range
(year shortcuts + From/To pickers, single day works), country, time of day,
recorded attack type (where noted), casualty band, attacking force (Germany /
Italy). Click a point for a detail card (honest casualty wording, combined/area
flag, "Look this up" link, HO 203 link). 9 curated deep-dive cards (toggle +
chips, off by default). Italian (CAI) overlay (on by default, subtle). 9 narrated
timeline events (flags + phase bands + pass-by flash; click for a card; V-1/V-2/
last-rocket fly-to). About & data caveats panel. Esc / click-empty-map to close.
Mobile: filters collapse behind a toggle. Sharing meta tags + on-theme favicon.

## Done this session (latest commits at HEAD)

- 89ea0fd Promote All/Recent to a prominent toggle in the timeline player
- bd70dbe Revert paint-based reveal; restore previous setFilter approach
- 03b62e1 (reverted) paint-based reveal attempt — DO NOT redo (see CLAUDE.md guardrails)
- 3abd696 Revert dark theme (user disliked; place names unreadable)
- earlier: reset button; Italy on-by-default + subtler; aggregate flag + "Look
  this up" link; Newcastle geocode override; recent-only mode; meta/favicon/UX.

## Known issues (accepted, not blocking)

- Minor: at Fast speed + fully zoomed out, dots can keep appearing for ~a second
  after pause (MapLibre setFilter worker re-layout backlog). ACCEPTED. Do not fix
  by re-architecting to paint (tried, broke it). If revisited: throttle updates.
- raids.geojson is ~13 MB (Netlify serves it gzipped, ~2–3 MB). Could trim fields
  later; not urgent.
- SheetJS advisory exists in data-pipeline tooling only (never shipped).

## Open questions for the user

- Licence decision (above) — the one real blocker to publishing.
- GitHub: not set up yet (user parked it). gh CLI not installed; no git remote.
- Optional, parked: og:image (drop a 1200x630 screenshot at app/public/og-image.png
  and uncomment the og:image meta), Baby Blitz already added, more events welcome.

## Key files

- app/src/App.jsx — the whole front end (map, timeline, filters, cards, events).
  Note: editors may flag it "binary" (multibyte glyphs ◀ ▶ × ❚❚ –); it's fine.
- app/src/data/{deepDives,cai,events}.js — curated content (committed).
- app/src/format.js, app/src/index.css.
- data-pipeline/scripts/{01_inspect,02_clean,02_clean.test,03_geocode,05_build}.mjs
- CLAUDE.md (overview/decisions/guardrails), WISHLIST.md (feature log), README.md.
