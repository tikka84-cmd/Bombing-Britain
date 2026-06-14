// 02_clean — normalise the raw Bombing Britain dataset into tidy records.
//
// Reads data-pipeline/raw/<dataset>.xlsx and emits data-pipeline/out/02_clean.json.
// Parsing rules are grounded in what 01_inspect found in the real file, not in
// the brief's assumed methodology. The functions are exported so 02_clean.test.mjs
// can unit-test the tricky parsers.
//
// Usage:  node scripts/02_clean.mjs [path-to-file]

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pipelineDir = path.resolve(__dirname, '..')
const rawDir = path.join(pipelineDir, 'raw')
const outDir = path.join(pipelineDir, 'out')

// Valid date window for the campaign (brief: Sep 1939 - Mar 1945).
export const DATE_MIN = '1939-09-01'
export const DATE_MAX = '1945-03-31'

// --- date parsing (real format is UK DD/MM/YYYY) ---------------------------

export function parseUKDate(input) {
  const s = String(input ?? '').trim()
  if (s === '') return { iso: null, basis: 'unknown', raw: s }
  if (/^(uncertain|unspecified|illegible|unknown)$/i.test(s))
    return { iso: null, basis: 'uncertain', raw: s }

  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return { iso: null, basis: 'unparsed', raw: s }

  const day = Number(m[1])
  const month = Number(m[2])
  const year = Number(m[3])
  // validate it is a real calendar date
  const dt = new Date(Date.UTC(year, month - 1, day))
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) {
    return { iso: null, basis: 'unparsed', raw: s }
  }
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return { iso, basis: 'exact', raw: s }
}

export function isInRange(iso) {
  return iso != null && iso >= DATE_MIN && iso <= DATE_MAX
}

// --- casualty parsing ------------------------------------------------------
// basis values: exact | plus | range_upper | uncertain | descriptor |
//               unspecified | illegible | unknown

export function parseCasualty(input) {
  const raw = String(input ?? '').trim()
  if (raw === '') return { value: null, basis: 'unknown', raw }

  // plain integer
  if (/^\d+$/.test(raw)) return { value: Number(raw), basis: 'exact', raw }

  // "N+"  (at least N)
  let m = raw.match(/^(\d+)\s*\+$/)
  if (m) return { value: Number(m[1]), basis: 'plus', raw }

  // "N or more"
  m = raw.match(/^(\d+)\s*or\s*more$/i)
  if (m) return { value: Number(m[1]), basis: 'plus', raw }

  // "N-M" range -> use the higher figure
  m = raw.match(/^(\d+)\s*[-–]\s*(\d+)$/)
  if (m) return { value: Math.max(Number(m[1]), Number(m[2])), basis: 'range_upper', raw }

  // "N?"  (uncertain but a number was given)
  m = raw.match(/^(\d+)\s*\?$/)
  if (m) return { value: Number(m[1]), basis: 'uncertain', raw }

  // "Unspecified" (and the "Unspecifiec" typo, any case)
  if (/^unspecifie[dc]$/i.test(raw)) return { value: null, basis: 'unspecified', raw }

  // "Illegible"
  if (/^illegible$/i.test(raw)) return { value: null, basis: 'illegible', raw }

  // anything else is a free-text / quoted descriptor; keep the words verbatim
  return { value: null, basis: 'descriptor', raw }
}

// --- period (day / night) --------------------------------------------------

export function parsePeriod(input) {
  const s = String(input ?? '').trim().toLowerCase()
  if (s === 'night') return 'night'
  if (s === 'day') return 'day'
  return 'unknown'
}

// --- civil defence region --------------------------------------------------

export function normRegion(input) {
  const s = String(input ?? '').trim()
  if (s === '' || /^n\/a$/i.test(s)) return { code: null, name: null, raw: s }
  const m = s.match(/^(\d+)\s*:\s*(.+)$/)
  if (!m) return { code: null, name: s, raw: s }
  let name = m[2].trim()
  if (name === 'North Midland') name = 'North Midlands' // fix the one typo
  return { code: Number(m[1]), name, raw: s }
}

// --- notes-derived attack-type tags (partial, "where recorded") ------------
// The dataset has no attack-type column. These tags come only from Additional
// Notes keywords, so most rows will have an empty list. Honest by design.

export function deriveAttackTags(notes) {
  const t = String(notes ?? '').toLowerCase()
  if (t.trim() === '') return []
  const tags = new Set()
  if (/unexploded|\bu\.?x\.?b\b/.test(t)) tags.add('unexploded')
  if (/delay[-\s]?action|delay/.test(t)) tags.add('delay_action')
  if (/\bmines?\b/.test(t)) tags.add('mine')
  if (/a\.?a\.?\s*shell|anti[-\s]?aircraft|\bshells?\b/.test(t)) tags.add('aa_shell')
  if (/incendiary/.test(t)) tags.add('incendiary')
  if (/oil bomb/.test(t)) tags.add('oil_bomb')
  if (/\bcannon\b/.test(t)) tags.add('cannon')
  if (/high explosive|\bh\.?e\.?\b/.test(t)) tags.add('high_explosive')
  return [...tags]
}

// --- area / region / city-wide aggregate flag ------------------------------
// Many casualty figures are totals for a whole city, region or group of places
// (e.g. "Casualty figure for entire London", "Total casualty figure for Region
// 1", "Casualties for Liverpool air raids 2-8 May", "Bromley + Camberwell + …"),
// not for the named location. Flag these so the map never sizes or sums them
// per-point: such points are shown neutral and the figure is gathered into a
// single raid-night total marker instead.

export function isAreaAggregate(notes) {
  const t = String(notes ?? '').toLowerCase()
  if (!t.trim()) return false
  if (/\bentire\b/.test(t)) return true
  if (/\ball of\b/.test(t)) return true
  if (/\bcivil defence region\b/.test(t)) return true
  if (/\bfor\s+region\b/.test(t)) return true
  const totalish = /\b(casualt|casulty|total)\w*/.test(t)
  if (totalish && /\bfor\s+(the\s+)?attacks?\b/.test(t)) return true
  if (
    totalish &&
    /\bfor\b/.test(t) &&
    /\b(london|wales|scotland|england|glasgow|clydeside|merseyside|liverpool|manchester|birmingham|midlands|norfolk|essex|kent|sussex|portsmouth|southampton|county|borough|area|region|district|whole)\b/.test(
      t,
    )
  )
    return true
  if (/\+/.test(t) && totalish) return true
  return false
}

// Back-compat alias: the original narrower name, now widened. Existing callers
// and tests use isLondonAggregate.
export const isLondonAggregate = isAreaAggregate

// --- spreadsheet reader ----------------------------------------------------

async function readSheet(filePath) {
  const mod = await import('xlsx')
  const XLSX = mod.default ?? mod
  const wb = XLSX.readFile(filePath, { cellDates: false })
  let best = null
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name]
    const rows = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']).e.r + 1 : 0
    if (!best || rows > best.rows) best = { name, ws, rows }
  }
  const matrix = XLSX.utils
    .sheet_to_json(best.ws, { header: 1, raw: false, defval: '' })
    .map((r) => r.map((c) => (c == null ? '' : String(c))))
  const header = matrix[0].map((h) => h.trim())
  const rows = matrix.slice(1).filter((r) => r.some((c) => String(c).trim() !== ''))
  return { header, rows }
}

// --- main transform --------------------------------------------------------

export function cleanRows(header, rows) {
  const idx = (name) => header.indexOf(name)
  const c = {
    volume: idx('Volume Reference'),
    summary: idx('Intelligence Summary Number'),
    start: idx('Start Date'),
    end: idx('End Date'),
    time: idx('Time'),
    region: idx('Civil Defence Region'),
    location: idx('Location'),
    country: idx('Country'),
    killed: idx('Killed'),
    injured: idx('Injured'),
    total: idx('Total Casualties'),
    notes: idx('Additional Notes'),
    link: idx('Link to Page'),
  }
  const get = (r, i) => (i >= 0 && i < r.length ? String(r[i]).trim() : '')

  return rows.map((r, n) => {
    const startDate = parseUKDate(get(r, c.start))
    const endDate = parseUKDate(get(r, c.end))
    const notes = get(r, c.notes)
    return {
      id: 'r' + String(n + 1).padStart(5, '0'),
      volume: get(r, c.volume),
      summaryNumber: get(r, c.summary),
      startDate: startDate.iso,
      endDate: endDate.iso,
      dateBasis: startDate.basis,
      dateInRange: isInRange(startDate.iso),
      rawStartDate: startDate.raw,
      rawEndDate: endDate.raw,
      period: parsePeriod(get(r, c.time)),
      region: normRegion(get(r, c.region)),
      location: get(r, c.location),
      country: get(r, c.country),
      killed: parseCasualty(get(r, c.killed)),
      injured: parseCasualty(get(r, c.injured)),
      total: parseCasualty(get(r, c.total)),
      londonAggregate: isLondonAggregate(notes),
      attackTags: deriveAttackTags(notes),
      notes,
      link: get(r, c.link),
    }
  })
}

// --- summary for the console ----------------------------------------------

function summarise(records) {
  const tally = (fn) => {
    const m = new Map()
    for (const r of records) {
      const k = fn(r)
      const keys = Array.isArray(k) ? k : [k]
      for (const key of keys) m.set(key, (m.get(key) || 0) + 1)
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }
  const fmt = (entries) => entries.map(([k, v]) => `${k}=${v}`).join('  ')
  console.log(`Records: ${records.length.toLocaleString('en-GB')}`)
  console.log(`Period: ${fmt(tally((r) => r.period))}`)
  console.log(`Date basis: ${fmt(tally((r) => r.dateBasis))}`)
  console.log(`Dates out of range (flagged, kept): ${records.filter((r) => r.startDate && !r.dateInRange).length}`)
  console.log(`Total-casualty basis: ${fmt(tally((r) => r.total.basis))}`)
  console.log(`London-aggregate rows: ${records.filter((r) => r.londonAggregate).length}`)
  console.log(`Rows with >=1 attack tag: ${records.filter((r) => r.attackTags.length).length}`)
  console.log(`Attack tags: ${fmt(tally((r) => r.attackTags))}`)
  console.log(`Country: ${fmt(tally((r) => r.country))}`)
}

async function main() {
  const arg = process.argv[2]
  let filePath = arg ? path.resolve(arg) : null
  if (!filePath) {
    const entries = fs.existsSync(rawDir) ? fs.readdirSync(rawDir).filter((f) => !f.startsWith('.')) : []
    const file = entries.find((f) => /\.(xlsx|xls)$/i.test(f))
    if (!file) {
      console.error(`No .xlsx found in ${rawDir}. Run 01_inspect first, or pass a path.`)
      process.exit(1)
    }
    filePath = path.join(rawDir, file)
  }

  const { header, rows } = await readSheet(filePath)
  const records = cleanRows(header, rows)

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, '02_clean.json')
  fs.writeFileSync(outPath, JSON.stringify(records), 'utf8')

  summarise(records)
  console.log(`\nWrote ${path.relative(pipelineDir, outPath).replace(/\\/g, '/')} (${records.length} records)`)
}

// run only when invoked directly, not when imported by the test
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
