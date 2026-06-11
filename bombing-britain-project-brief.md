# Bombing Britain: a national WW2 air-raid timeline — Claude Code project brief

A single, self-contained brief to feed Claude Code. It covers the concept, the data,
the architecture, a phased build plan sized for a few weeks of evenings, the data-cleaning
spec, and a starter prompt for phase one.

---

## 1. The concept

An interactive, timeline-driven map of German (and Italian) air attacks on the United Kingdom,
September 1939 to March 1945. The primary axis is **time**; the primary message is
**geographic spread**. The app exists to counter the popular belief that "only London was bombed"
by letting anyone watch the attacks accumulate across the whole country: Cardiff, Swansea, Belfast,
Clydebank, Hull, Plymouth, Coventry, Liverpool and dozens of smaller places, not just the South East.

Core interactions:

- A **timeline scrubber** along the bottom running Oct 1939 to Mar 1945. Dragging it plays the
  war forward; attacks appear and fade on the map as their date passes. A play/pause control
  auto-advances.
- A **national map** showing each attack as a point, sized or coloured by casualties.
- **Layer toggles** by attack type (high-explosive, incendiary, V-1, V-2, mines, machine-gun/strafing).
- **Click a point** for a detail card: place, date, day/night, casualties (with honest handling of
  vague figures), attack type, and any additional notes.
- **Curated "deep-dive" cards** for major named raids (Coventry, Swansea, Belfast, Clydebank,
  Liverpool May Blitz, etc.) where the attacker-side detail that the raw data lacks — Luftwaffe unit,
  aircraft types, bomb tonnage, target rationale — is added by hand from secondary histories.
- A curated **"Italy bombed Britain too"** overlay for the known Corpo Aereo Italiano raids of
  Oct 1940–Feb 1941 (see §4).

Explicitly NOT a Merseyside-focused tool. National scope throughout.

---

## 2. The data source

**Bombing Britain: an air raid map**, a University of York / Routledge–Taylor & Francis /
National Archives project (lead researcher Dr Laura Blomvall), funded by the AHRC.

- Single downloadable dataset: **32,000+ German air attacks**, Sep 1939–Mar 1945.
- Transcribed from the Ministry of Home Security **Daily Intelligence Reports**, National Archives
  series **HO 203**.
- Project + dataset download page: `http://www.warstateandsociety.com/Bombing-Britain`
- Underlying records are Crown Copyright (HO 203).

### Fields (per the project's published methodology)

- **Location** — municipal level nationally (town/village/city); **borough level for London**.
  Vaguer-than-municipal entries (e.g. "some bombs fell in Berkshire") were deliberately excluded.
- **Date**.
- **Time** — recorded only as **day** (06:00–18:00) or **night** (18:00–06:00), not exact times.
  One row represents all attacks on a single location across one 12-hour period.
- **Casualties** — three columns: **injured**, **killed**, **total**. Where a number is unknown it is
  marked "Unspecified". Where the original used vague descriptors ("several casualties", "a few
  casualties") the **exact wording is preserved in double quotes** instead of a number. Where a range
  was given, the **higher** figure is used and the range noted.
- **Attack type** — high-explosive bombs, incendiary bombs, unexploded bombs, parachute mines,
  naval mines, magnetic mines, machine-gun fire, cannon fire, long-range shelling, V-weapons
  (and, for the Channel Islands, troop landings).
- **Additional Notes** — free text (e.g. "unexploded bomb", "naval mine", casualties "due to shock",
  range details, bomb-disposal casualties).
- **File metadata** — HO 203 volume/report numbers and hyperlinks (hyperlinks only resolve for users
  whose institution has bought the paywalled *War, State and Society* resource; the dataset is free).

### Known data limitations (surface these honestly in the UI)

- **Records thin out from volume 14 onward**, so the **V-2 period (late 1944–45) is under-recorded**
  despite heavy casualties. Do not let the map imply the V-2 campaign was minor.
- **190 unconfirmed locations** the project is still geocoding. Flag these; never silently guess.
- Casualty figures were sometimes revised between reports; the dataset uses the later figure.

---

## 3. Licensing — RESOLVE BEFORE REHOSTING THE RAW FILE

The transcribed dataset is a derivative work; the underlying HO 203 records are Crown Copyright
(normally reusable under the Open Government Licence with attribution). The project page says the data
is "free to download" and "free to the public" but does **not** state an explicit reuse licence
(CC BY / OGL / etc.).

Safe path for a public portfolio piece:

1. Email the project (contact address on the page) and ask what licence the dataset is released under;
   **or**
2. Avoid redistributing the raw file: load/transform it at build or runtime, keep the cleaned
   derivative in your own repo, and **attribute prominently** (project name, York, National Archives
   HO 203, AHRC) with a link back.

Default until you hear otherwise: attribute clearly, link back, do not rehost the raw file.

---

## 4. The Italian (Corpo Aereo Italiano) overlay — curated, not data-driven

The CAI flew against Britain Oct 1940–Feb 1941 from bases in Belgium, hitting the Essex/Suffolk/Kent
coast. The HO 203 reports almost certainly logged these as ordinary attacks **without identifying the
attacker as Italian** (ground officers recorded what fell, not whose air force). So these raids are in
the dataset but **unlabelled and not auto-filterable**.

Implement as a **hand-curated overlay** keyed on known CAI operations:

- 24 Oct 1940 — night — Felixstowe & Harwich (first CAI raid)
- 29 Oct 1940 — daylight — Ramsgate / Deal
- 1 Nov 1940 — fighter sweep — Canterbury area (no bombing)
- 5 Nov 1940 — night — Harwich & Ipswich
- 11 Nov 1940 — daylight — Harwich (the major raid; CAI heavily mauled by Hurricanes, not repeated)
- 5 Dec 1940 — night — Ipswich
- 13 / 21 / 22 Dec 1940 — night — Harwich
- 2 Jan 1941 — night — Harwich
- (small night raids on Felixstowe/Lowestoft/Ipswich/Harwich continued to ~7 Feb 1941)

Aircraft: Fiat BR.20 bombers, Fiat CR.42 / G.50 fighters. Present this as a surprising sidebar:
most people don't know Italy bombed England. Treat it as a small, clearly-labelled curated layer,
honest that exact attribution to individual HO 203 rows is approximate.

---

## 5. Architecture

A static single-page app plus an offline data pipeline. No backend required.

```
/data-pipeline        (run once / occasionally; Python or Node)
  raw/                (the downloaded dataset — gitignored if licence unresolved)
  scripts/
    01_inspect.*      inspect raw columns, value distributions, the messy cells
    02_clean.*        normalise dates, casualties, attack types -> tidy records
    03_geocode.*      resolve place names -> lat/long via a UK gazetteer
    04_curate/        hand-authored JSON: deep-dive cards, CAI overlay
    05_build.*        emit final app data artefacts
  out/
    raids.json        (or a compact binary/columnar format if large)
    deep-dives.json
    cai-overlay.json
    unresolved.json   (the 190 + any geocode failures, surfaced in-app)

/app                  (the front end — React)
  timeline scrubber + play/pause
  map (points by date, sized/coloured by casualties)
  layer toggles by attack type
  detail card on click
  deep-dive panel for named raids
  CAI overlay toggle
  "data caveats" / about panel (limitations from §2, attribution from §3)
```

### Tech choices (suggested, let Claude Code confirm)

- **Front end:** React. Tailwind for layout if you like (you've used it before).
- **Map:** an open, no-API-key option — **MapLibre GL** with a free vector basemap, or **Leaflet**
  with OpenStreetMap tiles. Avoid anything needing a paid token. For 32k points, use clustering or a
  GPU/canvas layer (MapLibre handles this well; Leaflet needs a canvas/cluster plugin).
- **Timeline:** custom React component over the date range; precompute a sorted index so scrubbing is
  cheap. Consider bucketing by day or week for performance.
- **Geocoding:** offline, against a UK gazetteer — ONS Open Geography place names, or a local
  Nominatim/OpenStreetMap extract. Do NOT call a live geocoding API 32k times at runtime; geocode
  once in the pipeline and ship coordinates. Cache results; review failures by hand.
- **Hosting:** Netlify (you already use it). Pure static deploy.

### Performance notes

- 32k points is fine if you don't put 32k DOM nodes on screen. Render via canvas/WebGL, or
  cluster, or only draw points within the current timeline window.
- Precompute per-day or per-week aggregates for the timeline so the scrubber is smooth.

---

## 6. Phased build plan

Each phase ends at a natural **git commit** point, so credit/usage limits never cost you work —
worst case you resume from the last commit. Run `git init` in phase 0.

**Phase 0 — Scaffold (short)**
`git init`. Set up the repo structure above, a README stub, an empty React app that builds and
deploys to Netlify (deploy a "hello world" early to de-risk hosting). Commit.

**Phase 1 — Get and understand the data**
Download the dataset to `data-pipeline/raw/`. Write `01_inspect` to print: column names, row count,
the distinct attack-type strings, examples of vague-casualty cells, the "Unspecified" markers, the
Additional Notes patterns, and a few rows from the thin late-war volumes. Produce a short
`DATA_NOTES.md` describing what's actually in the file. Commit. **Do not proceed until the real shape
is understood — the methodology in §2 is the project's description, not a guarantee of the exact CSV
layout.**

**Phase 2 — Clean and normalise**
Write `02_clean`: parse dates to ISO; split casualties into numeric value + a flag
(`exact` / `unspecified` / `descriptor:"several"` / `range`); map raw attack-type strings to a small
controlled vocabulary for the layer toggles; carry Additional Notes through. Emit tidy intermediate
records. Add a few assertions/tests (row counts, no dates outside 1939–1945, casualty flags valid).
Commit.

**Phase 3 — Geocode**
Write `03_geocode`: resolve place names to lat/long offline against the chosen gazetteer.
Handle London boroughs explicitly. Output `unresolved.json` for failures + the known 190 unconfirmed.
Spot-check a sample by hand (does "Granton" land in Edinburgh, not elsewhere?). Commit.

**Phase 4 — Map + points (no time yet)**
Static map rendering all geocoded points, sized/coloured by total casualties, with click-for-detail.
Get performance right here (canvas/cluster). This alone already shows the national spread —
a satisfying, demoable milestone. Commit and deploy.

**Phase 5 — Timeline**
Add the scrubber + play/pause. Points appear/fade by date. Precompute the sorted/bucketed index.
This is the heart of the app. Commit and deploy.

**Phase 6 — Layers + caveats panel**
Attack-type toggles. The about/limitations panel (V-2 under-recording, 190 unconfirmed, vague
casualties, attribution). Commit.

**Phase 7 — Curated content**
Author `deep-dives.json` (Coventry, Swansea/the Three Nights, Belfast, Clydebank, Liverpool May Blitz,
Hull, Plymouth, Bristol, London) with attacker-side detail from secondary histories, and
`cai-overlay.json` from §4. Wire up the deep-dive panel and the Italy overlay toggle. Commit and deploy.

**Phase 8 — Polish**
Empty/loading states, mobile layout, a short intro overlay stating the "not just London" thesis,
final attribution, and a written-up README. Optional: a blog post. Commit and deploy.

---

## 7. Data-cleaning spec (the fiddly bits)

- **Dates:** output ISO `YYYY-MM-DD`. Reject/flag anything outside 1939-09-01 … 1945-03-31.
- **Day/night:** a single enum field `period` ∈ {`day`, `night`, `unknown`}.
- **Casualties:** for each of injured/killed/total, store `{value: number|null, basis: enum}` where
  `basis` ∈ {`exact`, `unspecified`, `descriptor`, `range_upper`}. Keep the original descriptor text
  (e.g. `"several"`) so the tooltip can show it verbatim. Never coerce "several" to a number.
- **Attack type:** map the many raw strings to a controlled set for toggles, e.g.
  {`high_explosive`, `incendiary`, `unexploded`, `mine` (parachute/naval/magnetic), `gunfire`
  (machine-gun/cannon), `shelling`, `v_weapon`, `troop_landing`, `other`}. Keep the raw string too.
  If V-1 vs V-2 isn't distinguishable in the data, label the layer "V-weapons" rather than guessing.
- **Notes:** pass `additional_notes` through untouched; it carries the human texture.
- **IDs:** stable synthetic id per row for linking deep-dives/overlay to underlying rows.
- **Provenance:** keep HO 203 volume/report numbers if present, for credibility, even though the
  hyperlinks won't resolve for most users.

---

## 8. Starter prompt for Claude Code (paste this to begin phase 0–1)

> I'm building an interactive, timeline-driven map of WW2 air attacks on the whole UK
> (Sep 1939–Mar 1945). The point of the project is to show the **national geographic spread** of
> bombing and counter the myth that only London was hit. Primary axis is time (a scrubber that plays
> the war forward); points appear on a national map by date, sized by casualties; layer toggles by
> attack type; click for a detail card; plus hand-curated deep-dive cards for major named raids and a
> small curated overlay for the Italian (Corpo Aereo Italiano) raids of 1940–41.
>
> The data source is the "Bombing Britain: an air raid map" dataset (University of York / Taylor &
> Francis / National Archives HO 203), ~32,000 attacks, free to download from
> http://www.warstateandsociety.com/Bombing-Britain . Fields: location (municipal level; London by
> borough), date, day/night, casualties (injured/killed/total, with some vague/"unspecified" values
> preserved as text), attack type, and free-text notes. Two known caveats to respect: the V-2 period
> in late 1944–45 is under-recorded, and ~190 locations are unconfirmed.
>
> Tech: React front end; an offline data pipeline for cleaning + geocoding; a no-API-key map
> (MapLibre GL or Leaflet+OSM); static deploy to Netlify. 32k points must render via canvas/WebGL or
> clustering, not 32k DOM nodes.
>
> Please start with **Phase 0 and Phase 1 only**:
> 1. `git init` and scaffold the repo: `/data-pipeline` (raw, scripts, out) and `/app` (React app
>    that builds). Add a README stub and a `.gitignore` that excludes `data-pipeline/raw/`.
> 2. Get the empty React app building locally and tell me the exact commands to run it and to deploy
>    a hello-world to Netlify.
> 3. Write an inspection script (`data-pipeline/scripts/01_inspect`) that I can run against the
>    downloaded dataset to print: column names, row count, distinct attack-type strings, examples of
>    vague/"Unspecified" casualty cells, Additional Notes patterns, and a few rows from the late-war
>    (V-2) period. Have it write a `DATA_NOTES.md` summary.
>
> Don't build the map or timeline yet. Stop after Phase 1 so I can download the data, run the
> inspector, and confirm the real column layout before we design the cleaning step. Commit at the end
> of each phase. Use UK English in all output, and avoid em dashes.

---

## 9. Credits / usage-limit safety

- Claude Code writes to your local disk as it goes; hitting a usage limit pauses the current turn but
  **destroys nothing**. When the limit resets, reopen the session in the **same directory** and continue.
- `git init` early and **commit after every phase** (the plan is built around this). Worst case you
  resume from the last green commit.
- Confirm the current Claude Fable usage-limit and top-up behaviour in Claude Code via Anthropic's
  docs before a long session, since that detail changes over time.

---

## 10. Attribution block (use in the app + README)

> Data: *Bombing Britain: an air raid map*, Dr Laura Blomvall, University of York, in collaboration
> with Routledge / Taylor & Francis Group and The National Archives, funded by the AHRC. Underlying
> records: The National Archives series HO 203 (Ministry of Home Security: Daily Intelligence Reports),
> Crown Copyright. This project is an independent visualisation and is not affiliated with or endorsed
> by the above.
