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

## Phased build plan

Each phase ends at a natural git commit. Run `git init` in phase 0.

- Phase 0 Scaffold: `git init`, repo structure, README stub, empty React app that
  builds and deploys a hello-world to Netlify early to de-risk hosting.
- Phase 1 Get and understand the data: download dataset to `raw/`, write
  `01_inspect` to print columns, row count, distinct attack-type strings, vague
  casualty cells, "Unspecified" markers, Notes patterns, late-war rows. Produce
  `DATA_NOTES.md`. Do not proceed until the real CSV shape is understood; the
  methodology above is a description, not a guarantee of the layout.
- Phase 2 Clean and normalise: write `02_clean` per the cleaning spec; emit tidy
  intermediate records; add assertions/tests.
- Phase 3 Geocode: write `03_geocode`, handle London boroughs, output
  `unresolved.json` for failures plus the 190 unconfirmed. Spot-check by hand.
- Phase 4 Map + points (no time yet): static map of all geocoded points,
  sized/coloured by casualties, click-for-detail. Get performance right here.
  Commit and deploy.
- Phase 5 Timeline: scrubber + play/pause, points appear/fade by date, precompute
  the bucketed index. Commit and deploy.
- Phase 6 Layers + caveats panel: attack-type toggles; about/limitations panel
  (V-2 under-recording, 190 unconfirmed, vague casualties, attribution).
- Phase 7 Curated content: author `deep-dives.json` (Coventry, Swansea, Belfast,
  Clydebank, Liverpool May Blitz, Hull, Plymouth, Bristol, London) and
  `cai-overlay.json`. Wire up the deep-dive panel and Italy overlay toggle.
  Commit and deploy.
- Phase 8 Polish: empty/loading states, mobile layout, intro overlay stating the
  "not just London" thesis, final attribution, written-up README.

## Attribution block (use in app + README)

Data: *Bombing Britain: an air raid map*, Dr Laura Blomvall, University of York, in
collaboration with Routledge / Taylor & Francis Group and The National Archives,
funded by the AHRC. Underlying records: The National Archives series HO 203
(Ministry of Home Security: Daily Intelligence Reports), Crown Copyright. This
project is an independent visualisation and is not affiliated with or endorsed by
the above.
