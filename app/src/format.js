// Display helpers — honest about vague / missing data.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDate(iso) {
  if (!iso) return 'date uncertain'
  const [y, m, d] = iso.split('-')
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`
}

export function formatDateRange(sd, ed) {
  if (!sd && !ed) return 'date uncertain'
  if (!ed || ed === sd) return formatDate(sd)
  return `${formatDate(sd)} – ${formatDate(ed)}`
}

export function formatPeriod(p) {
  if (p === 'day') return 'Day (06:00–18:00)'
  if (p === 'night') return 'Night (18:00–06:00)'
  return 'Time unspecified'
}

// casualty value -> honest string, given {value, basis, raw}
export function formatCasualty(value, basis, raw) {
  switch (basis) {
    case 'exact':
      return String(value)
    case 'plus':
      return `${value}+`
    case 'range_upper':
      return `up to ${value}`
    case 'uncertain':
      return `${value} (uncertain)`
    case 'descriptor':
      return raw // verbatim wording, e.g. "several casualties"
    case 'unspecified':
      return 'Unspecified'
    case 'illegible':
      return 'Illegible'
    default:
      return '—'
  }
}

export const TAG_LABELS = {
  unexploded: 'Unexploded bomb',
  aa_shell: 'AA shell (falling British fire)',
  mine: 'Mine',
  delay_action: 'Delay-action bomb',
  incendiary: 'Incendiary',
  oil_bomb: 'Oil bomb',
  cannon: 'Cannon fire',
  high_explosive: 'High explosive',
}

export function formatTags(tagsCsv) {
  if (!tagsCsv) return ''
  return tagsCsv
    .split(',')
    .filter(Boolean)
    .map((t) => TAG_LABELS[t] || t)
    .join(', ')
}
