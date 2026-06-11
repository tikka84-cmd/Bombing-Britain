# Bombing Britain

An interactive, timeline-driven map of WW2 air attacks on the whole UK,
September 1939 to March 1945. The point is to show the national geographic
spread of the bombing and counter the myth that only London was hit.

This is a work in progress. See the project brief and `CLAUDE.md` for the full
concept, data notes, and the phased build plan.

## Repository layout

```
/data-pipeline   offline data cleaning + geocoding (run occasionally)
  raw/           the downloaded dataset (gitignored until licensing resolved)
  scripts/       01_inspect, 02_clean, 03_geocode, 04_curate, 05_build
  out/           emitted app data artefacts (gitignored)
/app             React front end (Vite)
```

## Running the app

Requires Node.js (LTS).

```
cd app
npm install
npm run dev      # local dev server
npm run build    # production build to app/dist
npm run preview  # serve the production build locally
```

## Deploying to Netlify

Static deploy, no backend. Two options:

1. Connect the repo in the Netlify dashboard with build command `npm run build`,
   publish directory `app/dist`, base directory `app`. The included
   `netlify.toml` sets these.
2. Or deploy manually from the CLI:

   ```
   npm install -g netlify-cli
   cd app
   npm run build
   netlify deploy --dir=dist --prod
   ```

## Data and attribution

Data: *Bombing Britain: an air raid map*, Dr Laura Blomvall, University of York,
in collaboration with Routledge / Taylor & Francis Group and The National
Archives, funded by the AHRC. Underlying records: The National Archives series
HO 203 (Ministry of Home Security: Daily Intelligence Reports), Crown Copyright.
This project is an independent visualisation and is not affiliated with or
endorsed by the above.

The raw dataset is not redistributed here while its reuse licence is unresolved.
