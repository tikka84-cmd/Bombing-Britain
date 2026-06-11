// Tests for 02_clean. Unit-tests the tricky parsers, then runs aggregate
// assertions against out/02_clean.json if it exists (run 02_clean first).
//
// Usage:  node scripts/02_clean.test.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  parseUKDate,
  parseCasualty,
  parsePeriod,
  normRegion,
  deriveAttackTags,
  isLondonAggregate,
  isInRange,
  DATE_MIN,
  DATE_MAX,
} from './02_clean.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, '..', 'out', '02_clean.json')

let passed = 0
let failed = 0

function eq(actual, expected, label) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a === e) {
    passed++
  } else {
    failed++
    console.error(`FAIL: ${label}\n      expected ${e}\n      got      ${a}`)
  }
}
function ok(cond, label) {
  if (cond) passed++
  else {
    failed++
    console.error(`FAIL: ${label}`)
  }
}

// --- dates ---
eq(parseUKDate('06/09/1939').iso, '1939-09-06', 'date: leading-zero day')
eq(parseUKDate('21/01/1944').basis, 'exact', 'date: exact basis')
eq(parseUKDate('Uncertain').basis, 'uncertain', 'date: Uncertain -> uncertain')
eq(parseUKDate('Unspecified').iso, null, 'date: Unspecified -> null iso')
eq(parseUKDate('').basis, 'unknown', 'date: empty -> unknown')
eq(parseUKDate('31/02/1941').basis, 'unparsed', 'date: impossible date -> unparsed')
ok(isInRange('1940-05-10'), 'range: in-window date')
ok(!isInRange('1945-06-01'), 'range: after window')
ok(!isInRange('1939-08-01'), 'range: before window')
eq([DATE_MIN, DATE_MAX], ['1939-09-01', '1945-03-31'], 'range: window bounds')

// --- casualties ---
eq(parseCasualty('5'), { value: 5, basis: 'exact', raw: '5' }, 'cas: exact int')
eq(parseCasualty('0'), { value: 0, basis: 'exact', raw: '0' }, 'cas: zero')
eq(parseCasualty('3+').basis, 'plus', 'cas: N+ -> plus')
eq(parseCasualty('3+').value, 3, 'cas: N+ value')
eq(parseCasualty('2 or more').basis, 'plus', 'cas: N or more -> plus')
eq(parseCasualty('80-100'), { value: 100, basis: 'range_upper', raw: '80-100' }, 'cas: range -> upper')
eq(parseCasualty('1?'), { value: 1, basis: 'uncertain', raw: '1?' }, 'cas: N? -> uncertain')
eq(parseCasualty('Unspecified').basis, 'unspecified', 'cas: Unspecified')
eq(parseCasualty('unspecified').basis, 'unspecified', 'cas: lowercase unspecified')
eq(parseCasualty('Unspecifiec').basis, 'unspecified', 'cas: Unspecifiec typo')
eq(parseCasualty('Illegible').basis, 'illegible', 'cas: Illegible')
eq(parseCasualty('"several casualties"'), { value: null, basis: 'descriptor', raw: '"several casualties"' }, 'cas: descriptor')
eq(parseCasualty('').basis, 'unknown', 'cas: blank -> unknown')

// --- period ---
eq(parsePeriod('Night'), 'night', 'period: Night')
eq(parsePeriod('NIght'), 'night', 'period: NIght typo')
eq(parsePeriod('Day'), 'day', 'period: Day')
eq(parsePeriod('Unspecified'), 'unknown', 'period: Unspecified -> unknown')

// --- region ---
eq(normRegion('12: South Eastern'), { code: 12, name: 'South Eastern', raw: '12: South Eastern' }, 'region: parse')
eq(normRegion('3: North Midland').name, 'North Midlands', 'region: typo fixed')
eq(normRegion('N/A'), { code: null, name: null, raw: 'N/A' }, 'region: N/A')

// --- attack tags ---
ok(deriveAttackTags('Naval mine').includes('mine'), 'tags: naval mine -> mine')
ok(deriveAttackTags('Unexploded bomb').includes('unexploded'), 'tags: unexploded')
ok(deriveAttackTags('Delay-action bomb').includes('delay_action'), 'tags: delay action')
ok(deriveAttackTags('A.A. shell').includes('aa_shell'), 'tags: AA shell')
eq(deriveAttackTags(''), [], 'tags: empty notes -> []')
ok(deriveAttackTags('Naval mine, unexploded').length === 2, 'tags: multiple')

// --- london aggregate ---
ok(isLondonAggregate('Casualty figure for entire London'), 'london: entire London')
ok(isLondonAggregate('total casualties for London'), 'london: for London')
ok(!isLondonAggregate('Unexploded bomb'), 'london: unrelated note')

// --- aggregate assertions against the generated output ---
if (fs.existsSync(outPath)) {
  const records = JSON.parse(fs.readFileSync(outPath, 'utf8'))
  console.log(`\nAggregate checks on ${records.length} records:`)
  ok(records.length > 32000 && records.length < 33500, `row count plausible (${records.length})`)

  const validBasis = new Set(['exact', 'plus', 'range_upper', 'uncertain', 'descriptor', 'unspecified', 'illegible', 'unknown'])
  const badBasis = records.filter(
    (r) => !validBasis.has(r.killed.basis) || !validBasis.has(r.injured.basis) || !validBasis.has(r.total.basis),
  )
  ok(badBasis.length === 0, `all casualty bases valid (${badBasis.length} bad)`)

  const validPeriod = new Set(['day', 'night', 'unknown'])
  ok(records.every((r) => validPeriod.has(r.period)), 'all periods valid')

  const badDate = records.filter((r) => r.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(r.startDate))
  ok(badDate.length === 0, `all parsed start dates are ISO (${badDate.length} bad)`)

  const outOfRange = records.filter((r) => r.startDate && !r.dateInRange)
  console.log(`  (info) dates parsed but out of campaign window: ${outOfRange.length}`)

  const idsUnique = new Set(records.map((r) => r.id)).size === records.length
  ok(idsUnique, 'ids are unique')

  ok(records.some((r) => r.attackTags.length > 0), 'at least some attack tags derived')
  ok(records.some((r) => r.londonAggregate), 'at least some london-aggregate rows flagged')
} else {
  console.log(`\n(skipping aggregate checks: ${path.relative(process.cwd(), outPath)} not found — run 02_clean first)`)
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed > 0 ? 1 : 0)
