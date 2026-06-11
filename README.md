# Bombing Britain

An interactive, timeline-driven map of German (and Italian) air attacks on the
**whole** United Kingdom, September 1939 to March 1945. The point is to show the
national geographic spread of the bombing and counter the myth that only London
was hit: drag the timeline and watch the attacks accumulate across Cardiff,
Swansea, Belfast, Clydebank, Hull, Plymouth, Coventry, Liverpool and dozens of
smaller towns, not just the South East.

> Status: complete local build. Not deployed publicly while the dataset's reuse
> licence is unresolved (see "Licence & deployment").

## Features

- **Timeline scrubber + play/pause** — points are revealed cumulatively by date,
  with recent attacks highlighted; a running count shows how many had occurred by
  each date.
- **National map** of ~31,000 located attacks, sized and coloured by total
  casualties (rendered on the GPU via MapLibre GL).
- **Click any point** for a detail card: place, region, country, date, day/night,
  casualties (vague wording shown verbatim), notes, and the HO 203 source link.
- **Filters** — country, time of day, recorded attack type (where noted), and an
  **attacking-force** toggle (hide the German/unattributed set to see only the
  curated Italian raids).
- **Deep-dive cards** for major named raids (Coventry, London, Liverpool,
  Clydebank, Belfast, Swansea, Plymouth, Bristol, Hull) with attacker-side detail
  the raw data lacks, curated from secondary histories.
- **"Italy bombed Britain too"** overlay for the Corpo Aereo Italiano raids of
  1940–41.
- **About & data caveats** panel surfacing the dataset's honest limitations.

## Repository layout

```
/data-pipeline      offline data cleaning + geocoding (run occasionally; Node, ESM)
  raw/              the downloaded dataset .xlsx (gitignored; licence unresolved)
  gazetteer/        GeoNames GB.txt (gitignored; downloaded, CC BY 4.0)
  scripts/
    01_inspect.mjs  report the real shape of the raw file -> DATA_NOTES.md
    02_clean.mjs    normalise dates/casualties/geography -> out/02_clean.json
    02_clean.test.mjs   unit + aggregate assertions
    03_geocode.mjs  resolve place names offline -> out/03_geocoded.json, unresolved.json
    05_build.mjs    emit the app artefact -> app/public/raids.geojson
  out/              emitted intermediate artefacts (gitignored)
/app                React + Vite front end
  src/data/         hand-authored deep-dives + CAI overlay (committed; our own writing)
  public/raids.geojson   built map data (gitignored)
```

## Prerequisites

- **Node.js** (LTS). On the original build machine a portable Node was used and
  added to PATH; any recent Node works.
- Two external files, both **downloaded by hand** and kept out of git:
  1. **The dataset.** "Bombing Britain: an air raid map" (HO 203 transcription,
     ~32,000 rows). The live source is now paywalled; a copy of the original free
     2019–2020 release is preserved on the Internet Archive Wayback Machine. Save
     it as `data-pipeline/raw/Bombing-Britain-data.xlsx`.
  2. **The gazetteer.** GeoNames `GB.zip` from
     `https://download.geonames.org/export/dump/GB.zip`; unzip `GB.txt` into
     `data-pipeline/gazetteer/`.

## Building the data (run once, in order)

```
cd data-pipeline
npm install
npm run inspect    # describe the raw file (writes DATA_NOTES.md)
npm run clean      # -> out/02_clean.json
npm run test       # parser + aggregate assertions
npm run geocode    # -> out/03_geocoded.json, out/unresolved.json
npm run build      # -> app/public/raids.geojson
```

## Running the app

```
cd app
npm install
npm run dev        # local dev server
npm run build      # production build to app/dist
npm run preview    # serve the production build locally
```

## Data caveats (the honest bits)

The full list is in the in-app **About & data caveats** panel. In short:

- **The V-2 period is under-recorded** — the source thins out in late 1944–45, so
  the map understates the late war. Do not read the sparse end as a quiet end.
- **~1,600 rows are not mapped** (docks, landmarks, marine areas, and roughly 190
  locations the source itself lists as unconfirmed). They are flagged in
  `out/unresolved.json`, never guessed.
- **London casualty figures are often city-wide totals**, not for the named place;
  those points are shown neutral and flagged, never sized by casualties.
- **Attack type is only "where recorded"** in free-text notes (~4% of rows).
- **Nationality is not in the source.** The main set is "attacker unidentified"
  (overwhelmingly German). Italy is a curated overlay (its raids sit unlabelled in
  the data). **Vichy France** bombed *Gibraltar*, not the UK mainland, so it is
  out of scope for this dataset and not plotted.

## Licence & deployment

The transcribed dataset has no explicit reuse licence, so the raw file and the
derived artefacts (`out/`, `app/public/raids.geojson`) are gitignored and the app
is **not deployed publicly**. To publish, first resolve reuse permission with the
project, then either ship only the transformed derivative with prominent
attribution or host per whatever licence is granted.

The curated text in `app/src/data/` is our own writing and is committed.

## Attribution

Data: *Bombing Britain: an air raid map*, Dr Laura Blomvall, University of York,
in collaboration with Routledge / Taylor & Francis Group and The National
Archives, funded by the AHRC. Underlying records: The National Archives series
HO 203 (Ministry of Home Security: Daily Intelligence Reports), Crown Copyright.
Geocoding: GeoNames (CC BY 4.0). Basemap: © OpenStreetMap contributors © CARTO.
This project is an independent visualisation and is not affiliated with or
endorsed by the above.
