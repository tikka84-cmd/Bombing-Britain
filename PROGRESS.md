# PROGRESS

State of play for resuming. Read alongside CLAUDE.md (project overview, data
findings, decisions, guardrails). Last updated end of the polish sessions.

## Status: COMPLETE and stable, NOT yet deployed

All phases 0–8 are done and committed, plus several polish rounds. The app builds
clean, ESLint passes, app `npm audit` is 0 vulnerabilities. It runs locally only —
nothing is published, because the dataset licence is unresolved (see below).

## The single next step

**Resolve the dataset licence, then deploy.** It's the only thing gating going
live. Two paths (user's call):
1. Email the project (Dr Laura Blomvall / History Commons) for reuse permission, or
2. Accept the "transformed derivative + prominent attribution" path and publish.

Then deploy. Because `app/public/raids.geojson` is gitignored, a git-connected
Netlify build would omit the data, so deploy from a LOCAL build via the CLI:
`cd app && npm run build && netlify deploy --dir=dist --prod` (needs
`npm i -g netlify-cli` and a one-time `netlify login`). netlify.toml is in place.
If/when the data may be committed, flip the `.gitignore` line and use git-connected
auto-deploy instead. I can draft the permission email on request.

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
