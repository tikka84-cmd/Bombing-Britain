// 05_build — emit the app data artefact from the geocoded records.
//
// Input:   data-pipeline/out/03_geocoded.json
// Output:  app/public/raids.geojson   (per-location attack points)
//
// Only geocoded rows (with coordinates) go on the map. Casualty sizing is
// computed honestly: area/region/city-wide aggregate figures (e.g. "Casualty
// figure for entire London", "Total casualty figure for Region 1") are NOT used
// to size individual points, because the same total is repeated across every
// place hit that night and would make each look like its own large raid. Those
// points are shown neutral and flagged in the UI; the figure is still readable
// in the detail card.
//
// Usage:  node scripts/05_build.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isAreaAggregate } from './02_clean.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pipelineDir = path.resolve(__dirname, '..')
const repoRoot = path.resolve(pipelineDir, '..')
const inPath = path.join(pipelineDir, 'out', '03_geocoded.json')
const outPath = path.join(repoRoot, 'app', 'public', 'raids.geojson')

const SIZED_BASES = new Set(['exact', 'plus', 'range_upper'])
const round5 = (n) => Math.round(n * 1e5) / 1e5

// Timeline day index: whole days since 1939-09-01. Rows with no usable date get
// a sentinel far past the campaign so the timeline filter never reveals them.
const TIMELINE_BASE = Date.UTC(1939, 8, 1)
const NO_DATE = 9999999
function dayIndex(iso) {
  if (!iso) return NO_DATE
  const [y, m, d] = iso.split('-').map(Number)
  return Math.round((Date.UTC(y, m - 1, d) - TIMELINE_BASE) / 86400000)
}

function main() {
  if (!fs.existsSync(inPath)) {
    console.error(`Missing ${inPath}. Run 03_geocode first.`)
    process.exit(1)
  }
  const records = JSON.parse(fs.readFileSync(inPath, 'utf8'))
  const mapped = records.filter((r) => r.lat != null && r.lon != null)

  // An area/region/city-wide total is repeated across every place hit that night,
  // often with the explanatory note on only one of the rows. So group rows that
  // share a date and an identical non-zero casualty figure, and if ANY member's
  // note marks it an aggregate, treat the whole cluster as one (the blank-note
  // siblings get the same neutral treatment). Genuine coincidental matches are
  // tiny ("1 injured" across a few places) and carry no such note, so untouched.
  const groups = new Map()
  for (const r of mapped) {
    const tv = r.total.value
    if (tv == null || tv === 0) continue
    const key = [r.startDate, r.killed.value, r.injured.value, tv].join('|')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(r)
  }
  const areaMemberIds = new Set()
  for (const [, rs] of groups) {
    if (rs.some((r) => isAreaAggregate(r.notes))) for (const r of rs) areaMemberIds.add(r.id)
  }
  const isAreaPoint = (r) => areaMemberIds.has(r.id) || isAreaAggregate(r.notes)

  const features = []
  for (const r of mapped) {
    // an area/region/city-wide aggregate figure: don't size the point by it
    const area = isAreaPoint(r)
    let sizeValue = -1
    if (!area && r.total.value != null && SIZED_BASES.has(r.total.basis)) {
      sizeValue = r.total.value
    }

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [round5(r.lon), round5(r.lat)] },
      properties: {
        id: r.id,
        loc: r.location,
        ctry: r.country,
        reg: r.region ? r.region.name : null,
        sd: r.startDate,
        ed: r.endDate,
        per: r.period,
        // casualties: value / basis / raw for each
        kV: r.killed.value, kB: r.killed.basis, kR: r.killed.raw,
        iV: r.injured.value, iB: r.injured.basis, iR: r.injured.raw,
        tV: r.total.value, tB: r.total.basis, tR: r.total.raw,
        lon: area ? 1 : 0, // area/region/city-wide aggregate flag (was London-only)
        tags: r.attackTags.join(','),
        notes: r.notes || '',
        link: r.link || '',
        gc: r.geocode ? r.geocode.confidence : null,
        sz: sizeValue,
        t: dayIndex(r.startDate),
      },
    })
  }

  const fc = { type: 'FeatureCollection', features }
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(fc), 'utf8')

  const days = features.map((f) => f.properties.t).filter((t) => t !== NO_DATE)
  console.log(`Timeline day index range: ${Math.min(...days)} … ${Math.max(...days)} (0 = 1939-09-01)`)
  const sized = features.filter((f) => f.properties.sz >= 0).length
  const area = features.filter((f) => f.properties.lon === 1).length
  console.log(`Wrote ${path.relative(repoRoot, outPath).replace(/\\/g, '/')}`)
  console.log(`Features: ${features.length.toLocaleString('en-GB')} (mapped)`)
  console.log(`  with usable casualty size: ${sized.toLocaleString('en-GB')}`)
  console.log(`  neutral (area aggregate / non-numeric / zero): ${(features.length - sized).toLocaleString('en-GB')}`)
  console.log(`  flagged as area/region/city-wide aggregate: ${area.toLocaleString('en-GB')}`)
  console.log(`File size: ${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB`)
}

main()
