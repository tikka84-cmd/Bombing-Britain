// 01_inspect — read the raw Bombing Britain dataset and report its real shape.
//
// Phase 1 goal: understand what is actually in the file before we design the
// cleaning step. The methodology in the project brief is a description, not a
// guarantee of the exact column layout, so this script reports what it finds
// rather than assuming. Dependency-free: handles CSV / TSV / semicolon-delimited
// text with a quote-aware parser.
//
// Usage:
//   node scripts/01_inspect.mjs [path-to-file]
// With no argument it looks for a single delimited file in data-pipeline/raw/.
// Writes a summary to data-pipeline/DATA_NOTES.md and prints it to the console.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pipelineDir = path.resolve(__dirname, '..')
const rawDir = path.join(pipelineDir, 'raw')
const notesPath = path.join(pipelineDir, 'DATA_NOTES.md')

// --- locate the input file -------------------------------------------------

function findRawFile() {
  const arg = process.argv[2]
  if (arg) return path.resolve(arg)

  if (!fs.existsSync(rawDir)) return null
  const entries = fs.readdirSync(rawDir).filter((f) => !f.startsWith('.'))
  const delimited = entries.filter((f) => /\.(csv|tsv|txt)$/i.test(f))
  const spreadsheets = entries.filter((f) => /\.(xlsx|xls)$/i.test(f))

  if (delimited.length === 1) return path.join(rawDir, delimited[0])
  if (delimited.length > 1) {
    console.error(
      `Multiple delimited files in raw/: ${delimited.join(', ')}.\n` +
        `Pass the one you want explicitly: node scripts/01_inspect.mjs raw/<file>`,
    )
    process.exit(1)
  }
  if (spreadsheets.length === 1) return path.join(rawDir, spreadsheets[0])
  if (spreadsheets.length > 1) {
    console.error(
      `Multiple spreadsheets in raw/: ${spreadsheets.join(', ')}.\n` +
        `Pass the one you want explicitly: node scripts/01_inspect.mjs raw/<file>`,
    )
    process.exit(1)
  }
  return null
}

// --- CSV parsing (quote-aware state machine) -------------------------------

function detectDelimiter(headerLine) {
  const counts = {
    ',': (headerLine.match(/,/g) || []).length,
    '\t': (headerLine.match(/\t/g) || []).length,
    ';': (headerLine.match(/;/g) || []).length,
  }
  let best = ','
  let bestCount = -1
  for (const [delim, count] of Object.entries(counts)) {
    if (count > bestCount) {
      best = delim
      bestCount = count
    }
  }
  return best
}

function parseDelimited(text, delimiter) {
  const rows = []
  let field = ''
  let row = []
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === delimiter) {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      field = ''
      row = []
    } else if (ch === '\r') {
      // swallow; \n will close the row
    } else {
      field += ch
    }
  }
  // last field / row if file does not end with newline
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

// --- column-name heuristics ------------------------------------------------

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '')

function findColumn(header, ...needles) {
  const normHeader = header.map(norm)
  // exact-ish first
  for (const needle of needles) {
    const n = norm(needle)
    const idx = normHeader.indexOf(n)
    if (idx !== -1) return idx
  }
  // then contains
  for (const needle of needles) {
    const n = norm(needle)
    const idx = normHeader.findIndex((h) => h.includes(n))
    if (idx !== -1) return idx
  }
  return -1
}

// --- small reporting helpers -----------------------------------------------

function valueCounts(values) {
  const m = new Map()
  for (const v of values) m.set(v, (m.get(v) || 0) + 1)
  return m
}

function topEntries(map, n) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n)
}

const isBlank = (v) => v == null || String(v).trim() === ''
const isNumeric = (v) => /^-?\d+(\.\d+)?$/.test(String(v).trim())

// --- main ------------------------------------------------------------------

const out = []
const log = (line = '') => {
  out.push(line)
  console.log(line)
}

const filePath = findRawFile()

if (!filePath || !fs.existsSync(filePath)) {
  console.error(
    'No dataset found.\n\n' +
      `Download the dataset and place it in:\n  ${rawDir}\n\n` +
      'Then run:  npm run inspect    (from the data-pipeline folder)\n' +
      'Or:        node scripts/01_inspect.mjs path/to/file.csv',
  )
  process.exit(1)
}

let matrix
let sourceDesc
const ext = path.extname(filePath).toLowerCase()

if (ext === '.xlsx' || ext === '.xls') {
  // Excel: Node cannot read xlsx natively, so use SheetJS (data-pipeline tooling
  // dependency only; never shipped in the app bundle).
  const mod = await import('xlsx')
  const XLSX = mod.default ?? mod
  const wb = XLSX.readFile(filePath, { cellDates: false })
  // pick the sheet with the most rows (the data sheet)
  let best = null
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name]
    const rows = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']).e.r + 1 : 0
    if (!best || rows > best.rows) best = { name, ws, rows }
  }
  matrix = XLSX.utils
    .sheet_to_json(best.ws, { header: 1, raw: false, defval: '' })
    .map((r) => r.map((c) => (c == null ? '' : String(c))))
  sourceDesc = `Excel workbook; sheets: [${wb.SheetNames.join(', ')}]; using "${best.name}"`
} else {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^﻿/, '') // strip BOM
  const firstLine = raw.slice(0, raw.indexOf('\n') === -1 ? raw.length : raw.indexOf('\n'))
  const delimiter = detectDelimiter(firstLine)
  sourceDesc = { ',': 'comma-delimited', '\t': 'tab-delimited', ';': 'semicolon-delimited' }[delimiter]
  matrix = parseDelimited(raw, delimiter)
}

if (!matrix || matrix.length === 0) {
  console.error('File parsed to zero rows — is it empty?')
  process.exit(1)
}

const header = matrix[0].map((h) => h.trim())
const dataRows = matrix.slice(1).filter((r) => r.some((c) => !isBlank(c)))

// build column accessor
const colIndex = (name) => header.indexOf(name)
const column = (idx) => (idx < 0 ? [] : dataRows.map((r) => (idx < r.length ? r[idx] : '')))

log('# DATA_NOTES')
log('')
log(`Generated by 01_inspect on ${new Date().toISOString().slice(0, 10)}.`)
log('Describes the raw dataset as actually parsed, not as the brief assumes.')
log('')
log('## File')
log('')
log(`- Path: \`${path.relative(pipelineDir, filePath).replace(/\\/g, '/')}\``)
log(`- Size: ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB`)
log(`- Source: ${sourceDesc}`)
log(`- Column count: ${header.length}`)
log(`- Data rows (non-blank): ${dataRows.length.toLocaleString('en-GB')}`)

// flag ragged rows
const ragged = dataRows.filter((r) => r.length !== header.length).length
if (ragged > 0) {
  log(`- WARNING: ${ragged} row(s) do not have exactly ${header.length} fields (ragged).`)
}
log('')

// --- columns overview ------------------------------------------------------

log('## Columns')
log('')
log('| # | Name | Filled | Distinct | Sample values |')
log('|---|------|--------|----------|---------------|')
header.forEach((name, idx) => {
  const vals = column(idx)
  const filled = vals.filter((v) => !isBlank(v)).length
  const distinct = new Set(vals.map((v) => String(v).trim())).size
  const samples = topEntries(valueCounts(vals.filter((v) => !isBlank(v)).map((v) => v.trim())), 3)
    .map(([v]) => (v.length > 28 ? v.slice(0, 25) + '...' : v))
    .join(' | ')
  const pct = dataRows.length ? Math.round((filled / dataRows.length) * 100) : 0
  log(`| ${idx} | ${name || '(unnamed)'} | ${filled} (${pct}%) | ${distinct} | ${samples} |`)
})
log('')

// --- detected key columns --------------------------------------------------

const cols = {
  date: findColumn(header, 'date'),
  location: findColumn(header, 'location', 'place', 'town', 'borough'),
  period: findColumn(header, 'time', 'period', 'daynight', 'day/night'),
  injured: findColumn(header, 'injured'),
  killed: findColumn(header, 'killed'),
  total: findColumn(header, 'total', 'totalcasualties', 'casualties'),
  attackType: findColumn(header, 'attacktype', 'type', 'natureofattack', 'attack'),
  notes: findColumn(header, 'additionalnotes', 'notes', 'comment'),
  volume: findColumn(header, 'volume', 'ho203', 'file', 'reference'),
  report: findColumn(header, 'report', 'reportnumber'),
}

log('## Detected key columns (heuristic, verify by eye)')
log('')
for (const [key, idx] of Object.entries(cols)) {
  log(`- ${key}: ${idx === -1 ? 'NOT FOUND' : `\`${header[idx]}\` (col ${idx})`}`)
}
log('')

// --- attack types ----------------------------------------------------------

if (cols.attackType !== -1) {
  const counts = valueCounts(column(cols.attackType).map((v) => v.trim()).filter((v) => v !== ''))
  log('## Distinct attack-type strings')
  log('')
  log(`Found ${counts.size} distinct values. Full list (value — count):`)
  log('')
  for (const [v, c] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
    log(`- ${v} — ${c}`)
  }
  log('')
} else {
  log('## Distinct attack-type strings')
  log('')
  log('Attack-type column not detected. Inspect the Columns table above by hand.')
  log('')
}

// --- casualty cells: numeric vs descriptor vs unspecified ------------------

function reportCasualtyColumn(label, idx) {
  if (idx === -1) {
    log(`### ${label}: column not detected`)
    log('')
    return
  }
  const vals = column(idx).map((v) => v.trim())
  const nonBlank = vals.filter((v) => v !== '')
  const numeric = nonBlank.filter(isNumeric).length
  const nonNumeric = nonBlank.filter((v) => !isNumeric(v))
  const distinctNonNumeric = topEntries(valueCounts(nonNumeric), 15)
  log(`### ${label} (\`${header[idx]}\`)`)
  log('')
  log(`- Non-blank: ${nonBlank.length} | numeric: ${numeric} | non-numeric: ${nonNumeric.length} | blank: ${vals.length - nonBlank.length}`)
  if (distinctNonNumeric.length) {
    log('- Non-numeric values (these carry "Unspecified" markers and vague descriptors):')
    for (const [v, c] of distinctNonNumeric) log(`  - ${JSON.stringify(v)} — ${c}`)
  }
  log('')
}

log('## Casualty columns')
log('')
reportCasualtyColumn('Injured', cols.injured)
reportCasualtyColumn('Killed', cols.killed)
reportCasualtyColumn('Total', cols.total)

// --- additional notes patterns --------------------------------------------

if (cols.notes !== -1) {
  const vals = column(cols.notes).map((v) => v.trim())
  const nonBlank = vals.filter((v) => v !== '')
  log('## Additional Notes')
  log('')
  log(`- Non-blank: ${nonBlank.length} of ${vals.length} (${Math.round((nonBlank.length / vals.length) * 100)}%)`)
  log(`- Distinct values: ${new Set(nonBlank).size}`)
  log('- Most common note values:')
  for (const [v, c] of topEntries(valueCounts(nonBlank), 20)) {
    log(`  - ${JSON.stringify(v.length > 80 ? v.slice(0, 77) + '...' : v)} — ${c}`)
  }
  log('')
} else {
  log('## Additional Notes')
  log('')
  log('Notes column not detected.')
  log('')
}

// --- dates: range, per-year counts, late-war (V-2) sample ------------------

function extractYear(s) {
  const m = String(s).match(/\b(19(?:39|4[0-5]))\b/)
  return m ? Number(m[1]) : null
}

log('## Dates')
log('')
if (cols.date !== -1) {
  const vals = column(cols.date).map((v) => v.trim())
  const sampleRaw = vals.filter((v) => v !== '').slice(0, 8)
  log('- Sample raw date values (confirm the format before parsing in 02_clean):')
  for (const v of sampleRaw) log(`  - ${JSON.stringify(v)}`)
  const years = vals.map(extractYear).filter((y) => y != null)
  const perYear = valueCounts(years)
  log('- Rows per year (by 4-digit year found in the date cell):')
  for (const y of [1939, 1940, 1941, 1942, 1943, 1944, 1945]) {
    log(`  - ${y}: ${perYear.get(y) || 0}`)
  }
  const unparsedYear = vals.filter((v) => v !== '' && extractYear(v) == null).length
  if (unparsedYear) log(`  - (no 1939-1945 year found in cell: ${unparsedYear})`)
  log('')

  // late-war rows (V-2 period under-recording check)
  log('## Late-war (1944-1945) sample rows')
  log('')
  log('The brief warns the V-2 period is under-recorded. Sample of late-war rows:')
  log('')
  const lateIdx = []
  for (let i = 0; i < dataRows.length && lateIdx.length < 8; i++) {
    const y = extractYear(dataRows[i][cols.date] || '')
    if (y === 1944 || y === 1945) lateIdx.push(i)
  }
  if (lateIdx.length === 0) {
    log('No 1944-1945 rows found (worth investigating).')
  } else {
    const showCols = [cols.date, cols.location, cols.attackType, cols.total, cols.notes].filter(
      (c) => c !== -1,
    )
    log('| ' + showCols.map((c) => header[c]).join(' | ') + ' |')
    log('|' + showCols.map(() => '---').join('|') + '|')
    for (const i of lateIdx) {
      log(
        '| ' +
          showCols
            .map((c) => {
              const v = (dataRows[i][c] || '').trim()
              return v.length > 40 ? v.slice(0, 37) + '...' : v
            })
            .join(' | ') +
          ' |',
      )
    }
  }
  log('')
} else {
  log('Date column not detected.')
  log('')
}

// --- provenance ------------------------------------------------------------

log('## Provenance columns (HO 203 volume / report)')
log('')
log(`- volume/file: ${cols.volume === -1 ? 'NOT FOUND' : `\`${header[cols.volume]}\``}`)
log(`- report: ${cols.report === -1 ? 'NOT FOUND' : `\`${header[cols.report]}\``}`)
log('')

// --- surprises / mismatches vs the brief -----------------------------------

log('## Notes for the human')
log('')
log('- The Columns table is the ground truth; the "detected key columns" above are guesses.')
log('- Before Phase 2 (clean), confirm: date format, the day/night column wording, how')
log('  "Unspecified" and vague casualty descriptors actually appear, and the full attack-type list.')
log('- Any column the heuristics marked NOT FOUND needs a manual look in the Columns table.')
log('')

// --- write notes file ------------------------------------------------------

fs.writeFileSync(notesPath, out.join('\n') + '\n', 'utf8')
console.log(`\nWrote ${path.relative(pipelineDir, notesPath).replace(/\\/g, '/')}`)
