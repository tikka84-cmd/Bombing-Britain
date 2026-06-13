# Bombing Britain

## Standing rules (always apply)

- Use UK English in all output.
- Never use em dashes.
- Commit to git after each completed phase.
- Never proceed past a phase boundary without checking with me first.

## What we are building

An interactive, timeline-driven map of German (and Italian) air attacks on the
whole UK, September 1939 to March 1945. The primary axis is time; the primary
message is national geographic spread. The app exists to counter the myth that
"only London was bombed" by letting anyone watch attacks accumulate across the
country (Cardiff, Belfast, Clydebank, Hull, Plymouth, Coventry, Liverpool and
dozens of smaller places). National scope throughout, never Merseyside-focused.

Core interactions:

- Timeline scrubber along the bottom (Oct 1939 to Mar 1945) with play/pause that
  advances the war; points appear and fade as their date passes.
- National map showing each attack as a point, sized or coloured by casualties.
- Layer toggles by attack type.
- Click a point for a detail card (place, date, day/night, casualties, type, notes).
- Curated deep-dive cards for major named raids, with attacker-side detail added
  by hand from secondary histories (the raw data lacks it).
- A curated "Italy bombed Britain too" overlay for the Corpo Aereo Italiano raids
  of Oct 1940 to Feb 1941.

## The data

Source: "Bombing Britain: an air raid map", University of York / Taylor & Francis
/ National Archives (Dr Laura Blomvall, funded by AHRC). ~32,000 German attacks,
transcribed from Ministry of Home Security Daily Intelligence Reports, National
Archives series HO 203. Free download: http://www.warstateandsociety.com/Bombing-Britain

Fields: location (municipal level nationally, borough level for London), date,
time (recorded only as day 06:00-18:00 or night 18:00-06:00), casualties
(injured/killed/total, with "Unspecified" markers and vague descriptors preserved
verbatim in quotes), attack type, free-text Additional Notes, and HO 203
volume/report provenance.

Known limitations to surface honestly in the UI:

- Records thin out from volume 14 on, so the V-2 period (late 1944-45) is
  under-recorded. Do not let the map imply the V-2 campaign was minor.
- ~190 unconfirmed locations still being geocoded. Flag them; never silently guess.
- Casualty figures were sometimes revised; the dataset uses the later figure.

## Phase 1 findings: the real dataset (authoritative, overrides assumptions above)

Recovered from the Internet Archive Wayback Machine (the live source is now
paywalled): `data-pipeline/raw/Bombing-Britain-data.xlsx`, 32,869 rows, one
sheet, kept gitignored. Inspector: `data-pipeline/scripts/01_inspect.mjs`
(Node + SheetJS, pipeline-only dependency, never shipped in the app). Full
machine summary in `data-pipeline/DATA_NOTES.md`.

Real columns (13): Volume Reference, Intelligence Summary Number, Start Date,
End Date, Time, Civil Defence Region, Location, Country, Killed, Injured,
Total Casualties, Additional Notes, Link to Page.

Deltas from the brief, and decisions:

- NO attack-type column. Decision: layers/filters use Civil Defence Region and
  Country as the primary dimension, PLUS a best-effort attack-type layer derived
  from Additional Notes keywords, labelled "where recorded" (~20% coverage).
- Date is a range (Start/End Date), UK DD/MM/YYYY. Two rows are "Uncertain"/
  "Unspecified" and must be flagged, not parsed.
- Time enum values: Night, Day, Unspecified (plus a typo "NIght" to fix).
- Country: England, Wales, Scotland, Northern Ireland, Channel Islands.
- Civil Defence Region: 13 numbered regions, plus "N/A" and a typo
  "3: North Midland" (vs "North Midlands") to normalise.
- London casualties are city-wide aggregates ("Casualty figure for entire
  London" x3056), NOT per-location. Do not size/colour London points by
  casualties naively; surface this caveat in the UI.
- Casualty non-numeric forms to normalise: Unspecified (any case), quoted vague
  descriptors, "N+", "N or more", "?", "Illegible".
- V-2 under-recording confirmed by the data: 1944 = 7,700 rows but 1945 = 211.
- No coordinates in the data; geocoding (Phase 3) still required. Country and
  Civil Defence Region help. Link to Page = the paywalled HO 203 page links.

## Pipeline progress and setup (update as phases land)

- Runtime: Node (portable install on PATH; no Python). Pipeline scripts are ESM
  `.mjs`. npm scripts in `data-pipeline/`: `inspect`, `clean`, `geocode`, `test`.
- Done: ALL phases 0–8 (scaffold, inspect, clean, geocode, map, timeline,
  filters + caveats, curated deep dives + CAI overlay, polish). Curated data in
  app/src/data/ is committed; derived data artefacts stay gitignored.
- Geocoder needs `data-pipeline/gazetteer/GB.txt` (GeoNames GB dump, CC BY 4.0,
  gitignored). 95.2% of rows resolved; unmatched/Channel Islands go to
  out/unresolved.json, never guessed. Geocode confidence: high/medium/low.
- App: React + MapLibre GL + CARTO Positron basemap (no API key). `05_build.mjs`
  emits app/public/raids.geojson (gitignored). Run locally: `npm run dev` in
  app/ (or the Preview launch config). No public deploy until licence resolved.
- Open: resolve dataset licence before any public deploy; optionally email the
  project for reuse permission. Future ideas: optimise the 13 MB geojson.

## App behaviour & guardrails (decided in polish sessions)

- Visual: LIGHT theme (CARTO Positron). Dark theme was tried and reverted (place
  names unreadable); don't reintroduce dark mode / serif title without asking.
- Timeline reveal MUST stay `setFilter` with `['<=', t, cur]` (buildFilter /
  applyFilters in App.jsx). A paint-radius reveal broke rendering and was reverted.
- The "dots keep appearing after pause" backlog (bad on mobile) is FIXED by
  coalescing map updates: at most one setFilter in flight, next one fires on the
  map's `idle` event (500ms timeout backstop), always to the latest day, so the
  map self-clocks to the device and never trails. See pumpMapUpdate in App.jsx.
  Do NOT revert this to per-tick setFilter, and do NOT confuse it with the
  reverted paint refactor. The live-counter rescan is also throttled to ~4x/s
  while playing (countDay state) to keep the main thread free.
- Recent-only is a prominent `All | Recent` toggle in the player; keep `All`
  default (Recent at the end date shows a near-empty map).
- Italian (CAI): ON by default, subtle green dots, honour all filters (period/type/
  country; band = "No figure"); banner only on manual toggle.
- Casualties are NEVER summed (data repeats running/area totals); About cites
  historical figures (~43k Blitz, ~60–70k war, ~9k V-weapons). Cards auto-flag
  combined/area totals and add a "Look this up" search link.
- Ambiguous-name geocode fixes -> region-keyed OVERRIDES table in 03_geocode (then
  re-run geocode + 05_build); non-raid incidents -> INCIDENT_NOTES in App.jsx.
- Decided NOT to add more curated deep-dive cities. Curated data in app/src/data/
  is committed; raw/, out/, gazetteer/, app/public/raids.geojson gitignored.

## Licensing (resolve before rehosting the raw file)

The transcribed dataset is a derivative work; underlying HO 203 records are Crown
Copyright. The project page says the data is free but states no explicit reuse
licence. Default until we hear otherwise: do not rehost the raw file, attribute
prominently (project name, York, National Archives HO 203, AHRC), and link back.
Keep `data-pipeline/raw/` gitignored while the licence is unresolved.

## Italian (CAI) overlay

The CAI flew against Britain Oct 1940 to Feb 1941, hitting the Essex/Suffolk/Kent
coast. HO 203 logged these as ordinary attacks without naming the attacker, so
they are in the data but unlabelled. Implement as a hand-curated overlay keyed on
known CAI operations (Felixstowe/Harwich/Ramsgate/Ipswich etc.), aircraft Fiat
BR.20, CR.42, G.50. Present as a clearly-labelled curated layer, honest that exact
attribution to individual rows is approximate.

## Architecture

Static single-page app plus an offline data pipeline. No backend.

```
/data-pipeline       (run once / occasionally; Python or Node)
  raw/               (downloaded dataset, gitignored if licence unresolved)
  scripts/
    01_inspect.*     inspect raw columns, distributions, messy cells
    02_clean.*       normalise dates, casualties, attack types -> tidy records
    03_geocode.*     resolve place names -> lat/long via UK gazetteer
    04_curate/       hand-authored JSON: deep-dive cards, CAI overlay
    05_build.*       emit final app data artefacts
  out/
    raids.json, deep-dives.json, cai-overlay.json, unresolved.json
/app                 (React front end)
```

### Tech choices

- Front end: React, Tailwind for layout.
- Map: a no-API-key option, MapLibre GL with a free vector basemap, or Leaflet
  with OSM tiles. Avoid anything needing a paid token. For 32k points use
  clustering or a GPU/canvas layer (render via canvas/WebGL, never 32k DOM nodes).
- Timeline: custom React component; precompute a sorted, day/week-bucketed index
  so scrubbing is cheap.
- Geocoding: offline against a UK gazetteer (ONS Open Geography or a local
  Nominatim/OSM extract). Geocode once in the pipeline and ship coordinates; never
  call a live geocoding API 32k times at runtime. Review failures by hand.
- Hosting: Netlify, pure static deploy.

## Data-cleaning spec (the fiddly bits)

- Dates: output ISO YYYY-MM-DD. Flag anything outside 1939-09-01 to 1945-03-31.
- Day/night: a single enum `period` in {day, night, unknown}.
- Casualties: for each of injured/killed/total store {value: number|null, basis}
  where basis in {exact, unspecified, descriptor, range_upper}. Keep the original
  descriptor text verbatim. Never coerce "several" to a number.
- Attack type: map raw strings to a controlled set for toggles {high_explosive,
  incendiary, unexploded, mine, gunfire, shelling, v_weapon, troop_landing, other}.
  Keep the raw string too. If V-1 vs V-2 is not distinguishable, label "V-weapons".
- Notes: pass `additional_notes` through untouched.
- IDs: stable synthetic id per row for linking deep-dives/overlay to rows.
- Provenance: keep HO 203 volume/report numbers if present.

## Build plan — ALL PHASES COMPLETE (0–8)

Phases 0–8 are done and committed: scaffold, inspect, clean, geocode, map,
timeline, filters + caveats, curated deep dives + CAI overlay, and polish
(intro overlay, mobile layout, attacking-force toggle, README). The attacking
force can be filtered (hide Germany/unattributed to see only the curated Italian
raids); Vichy France is explained in About (it bombed Gibraltar, not the UK
mainland). Remaining open item: resolve the dataset licence before any public
deploy.

## Attribution block (use in app + README)

Data: *Bombing Britain: an air raid map*, Dr Laura Blomvall, University of York, in
collaboration with Routledge / Taylor & Francis Group and The National Archives,
funded by the AHRC. Underlying records: The National Archives series HO 203
(Ministry of Home Security: Daily Intelligence Reports), Crown Copyright. This
project is an independent visualisation and is not affiliated with or endorsed by
the above.
