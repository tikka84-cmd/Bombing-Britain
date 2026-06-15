// 03_geocode — resolve place names to lat/long offline against the GeoNames GB
// gazetteer (CC BY 4.0). No live geocoding API; everything is local.
//
// Input:   data-pipeline/out/02_clean.json  (from 02_clean)
//          data-pipeline/gazetteer/GB.txt    (GeoNames GB dump)
// Output:  data-pipeline/out/03_geocoded.json  (records + lat/lon + geocode meta)
//          data-pipeline/out/unresolved.json   (places we could not place)
//
// Usage:  node scripts/03_geocode.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pipelineDir = path.resolve(__dirname, '..')
const outDir = path.join(pipelineDir, 'out')
const gazPath = path.join(pipelineDir, 'gazetteer', 'GB.txt')
const inPath = path.join(outDir, '02_clean.json')

const UK_ADMIN1 = new Set(['ENG', 'SCT', 'WLS', 'NIR'])
const COUNTRY_TO_ADMIN1 = {
  England: 'ENG',
  Scotland: 'SCT',
  Wales: 'WLS',
  'Northern Ireland': 'NIR',
}
// Greater London bounding box, used to disambiguate London-region rows.
const LONDON_BBOX = { latMin: 51.28, latMax: 51.7, lonMin: -0.52, lonMax: 0.34 }
const inLondon = (lat, lon) =>
  lat >= LONDON_BBOX.latMin && lat <= LONDON_BBOX.latMax && lon >= LONDON_BBOX.lonMin && lon <= LONDON_BBOX.lonMax

// Isle of Wight: the qualifier "Isle of Wight" resolves badly in the gazetteer
// and dragged every island town to one wrong mainland point. Resolve such towns
// within the island's bounding box, falling back to Newport (island centre).
const IOW_BBOX = { latMin: 50.55, latMax: 50.8, lonMin: -1.62, lonMax: -1.04 }
const IOW_CENTRE = { lat: 50.7006, lon: -1.292, name: 'Newport, Isle of Wight' }
const inIoW = (lat, lon) =>
  lat >= IOW_BBOX.latMin && lat <= IOW_BBOX.latMax && lon >= IOW_BBOX.lonMin && lon <= IOW_BBOX.lonMax

// Approximate centre and radius (km) of each WW2 Civil Defence Region. Used only
// as a tie-breaker: when an ambiguous name has several candidates, prefer the one
// within its record's region, which fixes wrong-namesake placements (e.g. a
// "Berwick" in the Northern region -> Berwick-upon-Tweed, not Berwick in Sussex).
// Never invents a placement: if no candidate falls in range, the normal ranking
// applies. Radii are generous to keep legitimately remote places (Shetland etc.).
const REGION_CENTRES = {
  Northern: { lat: 54.9, lon: -1.8, r: 150 },
  'North Eastern': { lat: 53.9, lon: -1.2, r: 130 },
  'North Western': { lat: 53.9, lon: -2.7, r: 180 },
  'North Midlands': { lat: 53.0, lon: -0.9, r: 130 },
  Midlands: { lat: 52.5, lon: -1.9, r: 120 },
  Eastern: { lat: 52.2, lon: 0.4, r: 150 },
  London: { lat: 51.5, lon: -0.1, r: 45 },
  Southern: { lat: 51.0, lon: -1.2, r: 130 },
  'South Eastern': { lat: 51.1, lon: 0.4, r: 110 },
  'South Western': { lat: 50.7, lon: -3.8, r: 300 }, // wide: includes Isles of Scilly
  Wales: { lat: 52.3, lon: -3.7, r: 170 },
  Scotland: { lat: 56.5, lon: -4.0, r: 480 },
  'Northern Ireland': { lat: 54.6, lon: -6.5, r: 130 },
}

// --- name normalisation ----------------------------------------------------

export function normName(input) {
  let s = String(input ?? '').toLowerCase()
  s = s.normalize('NFD').replace(/\p{Diacritic}/gu, '') // strip diacritics
  s = s.replace(/\(.*?\)/g, ' ') // drop parenthetical qualifiers
  s = s.replace(/&/g, ' and ')
  s = s.replace(/'/g, '')
  s = s.replace(/\bsaint\b/g, 'st').replace(/\bst\.?\b/g, 'st') // saint/st -> st
  s = s.replace(/[^a-z0-9]+/g, ' ') // punctuation -> space
  return s.trim().replace(/\s+/g, ' ')
}

// --- load gazetteer --------------------------------------------------------

function loadGazetteer() {
  const text = fs.readFileSync(gazPath, 'utf8')
  const primary = new Map() // normName -> candidates[]
  const alt = new Map() // normalised alternate name -> candidates[]
  let kept = 0
  for (const line of text.split('\n')) {
    if (!line) continue
    const f = line.split('\t')
    const admin1 = f[10]
    const fclass = f[6]
    if (!UK_ADMIN1.has(admin1)) continue
    if (fclass !== 'P' && fclass !== 'A') continue
    const cand = {
      name: f[1],
      lat: Number(f[4]),
      lon: Number(f[5]),
      pop: Number(f[14]) || 0,
      fclass,
      fcode: f[7],
      admin1,
    }
    if (!Number.isFinite(cand.lat) || !Number.isFinite(cand.lon)) continue
    kept++
    for (const nm of [cand.name, f[2]]) {
      const key = normName(nm)
      if (!key) continue
      if (!primary.has(key)) primary.set(key, [])
      primary.get(key).push(cand)
    }
    if (f[3]) {
      for (const a of f[3].split(',')) {
        const key = normName(a)
        if (!key) continue
        if (!alt.has(key)) alt.set(key, [])
        alt.get(key).push(cand)
      }
    }
  }
  return { primary, alt, kept }
}

// --- ranking ---------------------------------------------------------------

function rank(pool) {
  // settlements (class P) before administrative areas (A); then population.
  return [...pool].sort((a, b) => {
    if (a.fclass !== b.fclass) return a.fclass === 'P' ? -1 : 1
    return b.pop - a.pop
  })
}

// --- candidate lookup (layered fallbacks) ----------------------------------

const GENERIC_SUFFIX = new Set([
  'island', 'point', 'common', 'heath', 'park', 'docks', 'dock', 'estuary',
  'marshes', 'marsh', 'green', 'hill', 'bridge', 'bay', 'sands', 'aerodrome',
  'airfield', 'airport', 'area', 'district',
])

function lookup(gaz, name) {
  const exact = gaz.primary.get(normName(name))
  if (exact && exact.length) return { pool: exact, method: 'exact' }

  // first segment before a comma or slash
  const seg = name.split(/[,/]/)[0]
  if (normName(seg) !== normName(name)) {
    const p = gaz.primary.get(normName(seg))
    if (p && p.length) return { pool: p, method: 'segment' }
  }

  // compound pairs: "A + B", "A & B", "A and B" -> take the first part that resolves
  const parts = name.split(/\s*[+&]\s*|\s+and\s+/i)
  if (parts.length > 1) {
    for (const part of parts) {
      const p = gaz.primary.get(normName(part))
      if (p && p.length) return { pool: p, method: 'compound' }
    }
  }

  // "Isle of X" -> X
  const isle = name.match(/^isle of (.+)/i)
  if (isle) {
    const p = gaz.primary.get(normName(isle[1]))
    if (p && p.length) return { pool: p, method: 'isle' }
  }

  // strip a trailing generic word: "Foulness Island" -> "Foulness"
  const toks = normName(name).split(' ')
  if (toks.length > 1 && GENERIC_SUFFIX.has(toks[toks.length - 1])) {
    const p = gaz.primary.get(toks.slice(0, -1).join(' '))
    if (p && p.length) return { pool: p, method: 'generic' }
  }

  // alternate names
  const alt = gaz.alt.get(normName(name))
  if (alt && alt.length) return { pool: alt, method: 'alt' }

  // forward prefix: gazetteer name starts with the query
  // ("Purfleet" -> "Purfleet-on-Thames", "Beddington" -> "Beddington Corner")
  const q = normName(name)
  if (q.length >= 4) {
    const collected = []
    for (const [key, cands] of gaz.primary) {
      if (key.startsWith(q + ' ')) collected.push(...cands)
    }
    if (collected.length) return { pool: collected, method: 'prefix' }
  }

  return null
}

// great-circle distance in km
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

// Tie-breaker: keep only candidates within the record's region (if any are);
// otherwise leave the pool untouched. Never reduces a pool to nothing.
function nearRegion(pool, rc) {
  if (!rc || pool.length <= 1) return pool
  const near = pool.filter((c) => haversine(c.lat, c.lon, rc.lat, rc.lon) <= rc.r)
  return near.length ? near : pool
}

// --- geocode one place -----------------------------------------------------

export function geocodePlace(gaz, name, country, isLondonRegion, rc) {
  const admin1 = COUNTRY_TO_ADMIN1[country] || null

  // known non-GB country (Channel Islands): the GB gazetteer cannot place it
  if (country && !admin1) return null

  const segs = name.split(',').map((s) => s.trim()).filter(Boolean)

  // Isle of Wight: resolve the town within the island, not via the mis-placed
  // "Isle of Wight" qualifier. Take the most specific segment that is a real
  // island place; otherwise put it at Newport (island centre), flagged low.
  if (admin1 === 'ENG' && segs.some((s) => normName(s) === 'isle of wight')) {
    const townSeg = segs.find((s) => normName(s) && normName(s) !== 'isle of wight')
    if (townSeg) {
      const tn = normName(townSeg)
      const pool = [...(gaz.primary.get(tn) || []), ...(gaz.alt.get(tn) || [])].filter(
        (c) => c.admin1 === 'ENG' && inIoW(c.lat, c.lon),
      )
      if (pool.length) {
        const best = rank(pool)[0]
        return {
          lat: best.lat, lon: best.lon, matchedName: best.name, fcode: best.fcode,
          admin1: best.admin1, method: 'iow', confidence: 'high',
        }
      }
    }
    return {
      lat: IOW_CENTRE.lat, lon: IOW_CENTRE.lon, matchedName: IOW_CENTRE.name, fcode: 'PPLA2',
      admin1: 'ENG', method: 'iow-centre', confidence: 'low',
    }
  }

  // "Place, Qualifier" (e.g. "Garston, Watford"): if the first part is ambiguous,
  // anchor on the qualifier and pick the candidate nearest to it.
  if (segs.length >= 2) {
    let cands = gaz.primary.get(normName(segs[0])) || []
    if (admin1) {
      const m = cands.filter((c) => c.admin1 === admin1)
      if (m.length) cands = m
    }
    cands = nearRegion(cands, rc)
    if (cands.length > 1) {
      const anchor = geocodePlace(gaz, segs.slice(1).join(', '), country, false, rc)
      if (anchor) {
        let best = null
        let bestD = Infinity
        for (const c of cands) {
          const d = haversine(c.lat, c.lon, anchor.lat, anchor.lon)
          if (d < bestD) {
            bestD = d
            best = c
          }
        }
        // if the nearest match is an admin-area centroid (which can sit in odd
        // spots, e.g. offshore), snap to a same-named settlement right next to it.
        // Only a short hop, so it never jumps to a different county's namesake.
        if (best && best.fclass === 'A') {
          let pBest = null
          let pD = Infinity
          for (const c of cands) {
            if (c.fclass !== 'P') continue
            const d = haversine(c.lat, c.lon, best.lat, best.lon)
            if (d <= 15 && d < pD) {
              pD = d
              pBest = c
            }
          }
          if (pBest) best = pBest
        }
        if (best) {
          if (bestD <= 40) {
            return {
              lat: best.lat,
              lon: best.lon,
              matchedName: best.name,
              fcode: best.fcode,
              admin1: best.admin1,
              method: 'anchor',
              confidence: 'high',
            }
          }
          // nearest same-named place is far from the qualifier (the real one is
          // probably not in the gazetteer). If the qualifier is itself a town,
          // place at the town rather than a distant namesake.
          if (/^PPL/.test(anchor.fcode || '')) {
            return {
              lat: anchor.lat,
              lon: anchor.lon,
              matchedName: anchor.matchedName,
              fcode: anchor.fcode,
              admin1: anchor.admin1,
              method: 'anchor-town',
              confidence: 'low',
            }
          }
          // qualifier is a region/county: keep the nearest namesake, medium.
          return {
            lat: best.lat,
            lon: best.lon,
            matchedName: best.name,
            fcode: best.fcode,
            admin1: best.admin1,
            method: 'anchor',
            confidence: 'medium',
          }
        }
      }
    }
  }

  const found = lookup(gaz, name)
  if (!found) return null
  let { pool, method } = found

  // enforce the correct country; never place a wrong-country guess
  if (admin1) {
    let m = pool.filter((c) => c.admin1 === admin1)
    if (!m.length) {
      // last try: alternate-name candidates in the right country
      // (e.g. GeoNames stores "Derry" with "Londonderry" as an alternate name)
      const altPool = gaz.alt.get(normName(name)) || []
      m = altPool.filter((c) => c.admin1 === admin1)
      if (m.length) method = 'alt'
    }
    if (!m.length) return null
    pool = m
  }
  pool = nearRegion(pool, rc)
  // London disambiguation
  if (isLondonRegion) {
    const m = pool.filter((c) => inLondon(c.lat, c.lon))
    if (m.length) {
      pool = m
      method += '+london'
    }
  }

  const best = rank(pool)[0]
  const base = method.split('+')[0]
  let confidence = base === 'exact' || base === 'segment' ? 'high' : base === 'prefix' ? 'low' : 'medium'
  if (method.includes('countrymismatch')) confidence = 'low'
  return {
    lat: best.lat,
    lon: best.lon,
    matchedName: best.name,
    fcode: best.fcode,
    admin1: best.admin1,
    method,
    confidence,
  }
}

// --- manual overrides ------------------------------------------------------
// For ambiguous place names the gazetteer resolves wrongly. Keyed on the place
// plus (optionally) an exact Civil Defence Region and/or country, so only the
// intended rows are redirected. Extend as errors are spotted.
const OVERRIDES = [
  // "Newcastle" in the Northern region is Newcastle upon Tyne, not under-Lyme.
  { loc: 'Newcastle', region: 'Northern', lat: 54.9783, lon: -1.6178, name: 'Newcastle upon Tyne' },
  // GeoNames' "Garston" point sits ~2km south, out in the Mersey estuary; nudge
  // it onto the Garston district itself.
  { loc: 'Garston, Liverpool', region: 'North Western', lat: 53.3505, lon: -2.9039, name: 'Garston, Liverpool' },
]
function overrideFor(r) {
  return OVERRIDES.find(
    (o) =>
      normName(o.loc) === normName(r.location) &&
      (!o.region || (r.region && r.region.name === o.region)) &&
      (!o.country || o.country === r.country),
  )
}

// Region-aware name aliases for ambiguous bare names, applied before geocoding
// (the original location is kept for display). In the North-East ("Northern")
// civil-defence region a bare "Newcastle" means Newcastle upon Tyne, but the
// gazetteer's exact "Newcastle" is a Shropshire/Welsh-border village, so qualify
// it (covers "Gosforth, Newcastle", "Newcastle + Gateshead", "Heaton, Newcastle"
// etc.). Forms already saying "upon"/"under" are left alone.
function aliasName(location, regionName) {
  let s = location
  if (regionName === 'Northern') {
    s = s.replace(/\bNewcastle\b(?![\s-]*(?:upon|under))/gi, 'Newcastle upon Tyne')
    s = s.replace(/\bBerwick\b(?![\s-]*(?:upon|on))/gi, 'Berwick-upon-Tweed')
  }
  if (regionName === 'North Western') {
    // "Crosby" in the North-West is Great Crosby (Merseyside); the bare name only
    // matches a Cumbrian hamlet. Leave Great/Little Crosby and Crosby Ravensworth/
    // Garrett/Villa (genuine distinct places) untouched.
    s = s.replace(
      /(?<!Great )(?<!Little )\bCrosby\b(?!\s+(?:Ravensworth|Garrett|Villa))/gi,
      'Great Crosby',
    )
  }
  return s
}

// --- main ------------------------------------------------------------------

function main() {
  if (!fs.existsSync(gazPath)) {
    console.error(`Gazetteer missing: ${gazPath}\nDownload GeoNames GB.zip into data-pipeline/gazetteer/ and unzip.`)
    process.exit(1)
  }
  if (!fs.existsSync(inPath)) {
    console.error(`Missing ${inPath}. Run 02_clean first.`)
    process.exit(1)
  }

  const gaz = loadGazetteer()
  console.log(`Gazetteer: ${gaz.kept.toLocaleString('en-GB')} UK place/admin entries indexed.`)

  const records = JSON.parse(fs.readFileSync(inPath, 'utf8'))

  // cache by name|country|londonFlag
  const cache = new Map()
  const methodCounts = new Map()
  let resolved = 0
  const unresolved = new Map() // "name|country" -> count

  for (const r of records) {
    const ov = overrideFor(r)
    if (ov) {
      r.lat = ov.lat
      r.lon = ov.lon
      r.geocode = { matchedName: ov.name, method: 'override', confidence: 'high', fcode: null }
      resolved++
      methodCounts.set('override', (methodCounts.get('override') || 0) + 1)
      continue
    }
    const regionName = r.region && r.region.name
    const isLondonRegion = regionName === 'London'
    const rc = REGION_CENTRES[regionName] || null
    const geoName = aliasName(r.location, regionName)
    const key = `${geoName}|${r.country}|${isLondonRegion ? 'L' : ''}|${regionName || ''}`
    let g
    if (cache.has(key)) g = cache.get(key)
    else {
      g = geocodePlace(gaz, geoName, r.country, isLondonRegion, rc)
      cache.set(key, g)
    }
    if (g) {
      r.lat = g.lat
      r.lon = g.lon
      r.geocode = { matchedName: g.matchedName, method: g.method, confidence: g.confidence, fcode: g.fcode }
      resolved++
      methodCounts.set(g.method, (methodCounts.get(g.method) || 0) + 1)
    } else {
      r.lat = null
      r.lon = null
      r.geocode = null
      const uk = `${r.location}|${r.country}`
      unresolved.set(uk, (unresolved.get(uk) || 0) + 1)
    }
  }

  // write outputs
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, '03_geocoded.json'), JSON.stringify(records), 'utf8')

  const unresolvedList = [...unresolved.entries()]
    .map(([k, rows]) => {
      const [location, country] = k.split('|')
      return { location, country, rows }
    })
    .sort((a, b) => b.rows - a.rows)
  fs.writeFileSync(
    path.join(outDir, 'unresolved.json'),
    JSON.stringify(
      {
        note:
          'Place names not matched to the GeoNames GB gazetteer, plus rows whose ' +
          'country is outside GB (e.g. Channel Islands). Flag in-app; do not guess. ' +
          'The project also lists ~190 unconfirmed locations not separately marked here.',
        distinctUnresolved: unresolvedList.length,
        rowsUnresolved: records.length - resolved,
        places: unresolvedList,
      },
      null,
      2,
    ),
    'utf8',
  )

  // report
  const distinctTotal = new Set(records.map((r) => `${r.location}|${r.country}`)).size
  const distinctResolved = distinctTotal - unresolvedList.length
  console.log(`\nRows resolved:    ${resolved.toLocaleString('en-GB')} / ${records.length.toLocaleString('en-GB')} (${((resolved / records.length) * 100).toFixed(1)}%)`)
  console.log(`Distinct places:  ${distinctResolved.toLocaleString('en-GB')} / ${distinctTotal.toLocaleString('en-GB')} (${((distinctResolved / distinctTotal) * 100).toFixed(1)}%)`)
  console.log('Methods: ' + [...methodCounts.entries()].sort((a, b) => b[1] - a[1]).map(([m, n]) => `${m}=${n}`).join('  '))
  console.log('\nTop unresolved (by rows):')
  for (const u of unresolvedList.slice(0, 15)) console.log(`  ${u.location} (${u.country}) — ${u.rows}`)

  // hand spot-check
  console.log('\nSpot-check (eyeball these):')
  for (const [name, country, london] of [
    ['Granton', 'Scotland', false],
    ['Coventry', 'England', false],
    ['Croydon', 'England', true],
    ['Clydebank', 'Scotland', false],
    ['Swansea', 'Wales', false],
    ['City of London', 'England', true],
    ['Hull', 'England', false],
  ]) {
    const g = geocodePlace(gaz, name, country, london)
    console.log(`  ${name} -> ${g ? `${g.lat.toFixed(4)},${g.lon.toFixed(4)} (${g.matchedName}, ${g.method})` : 'UNRESOLVED'}`)
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
