// Curated overlay: the Corpo Aereo Italiano (CAI) raids on Britain, autumn 1940
// to winter 1941. Italy sent an expeditionary air corps to Belgium that attacked
// the Essex/Suffolk/Kent coast. The HO 203 ground reports almost certainly logged
// these as ordinary attacks WITHOUT identifying the attacker as Italian, so they
// cannot be filtered out of the main dataset. This overlay is therefore curated
// from histories of the CAI, and the match to individual dataset rows is
// approximate. This is our own writing.
//
// `date` (ISO) drives the timeline so a marker only appears once its raid has
// happened. Where a raid spans several nights, the date is the first night.

export const caiIntro =
  'From October 1940 the Corpo Aereo Italiano flew against the Essex, Suffolk and ' +
  'Kent coast from bases in Belgium, in Fiat BR.20 bombers escorted by Fiat CR.42 ' +
  'and G.50 fighters. The campaign was small and short-lived — the CAI was badly ' +
  'mauled by Hurricanes over Harwich on 11 November 1940 — and ended in early 1941. ' +
  'These ground reports did not record the attacker as Italian, so the points here ' +
  'are curated, and their match to individual records is approximate.'

const caiRaids = [
  {
    id: 'cai-1940-10-24',
    date: '1940-10-24',
    period: 'night',
    dateLabel: '24 October 1940 (night)',
    place: 'Felixstowe & Harwich',
    lat: 51.95,
    lon: 1.31,
    kind: 'First CAI raid',
    description: 'The first Corpo Aereo Italiano raid on Britain: a night attack on the Felixstowe and Harwich area by Fiat BR.20 bombers.',
  },
  {
    id: 'cai-1940-10-29',
    date: '1940-10-29',
    period: 'day',
    dateLabel: '29 October 1940 (daylight)',
    place: 'Ramsgate / Deal',
    lat: 51.33,
    lon: 1.42,
    kind: 'Daylight raid',
    description: 'A daylight raid on the Ramsgate and Deal area of the Kent coast.',
  },
  {
    id: 'cai-1940-11-01',
    date: '1940-11-01',
    period: 'day',
    dateLabel: '1 November 1940 (daylight)',
    place: 'Canterbury area',
    lat: 51.28,
    lon: 1.08,
    kind: 'Fighter sweep (no bombing)',
    description: 'A daylight fighter sweep over the Canterbury area by CR.42 and G.50 fighters; no bombing.',
  },
  {
    id: 'cai-1940-11-05',
    date: '1940-11-05',
    period: 'night',
    dateLabel: '5 November 1940 (night)',
    place: 'Harwich & Ipswich',
    lat: 52.0,
    lon: 1.21,
    kind: 'Night raid',
    description: 'A night raid against Harwich and Ipswich.',
  },
  {
    id: 'cai-1940-11-11',
    date: '1940-11-11',
    period: 'day',
    dateLabel: '11 November 1940 (daylight)',
    place: 'Harwich',
    lat: 51.9426,
    lon: 1.2873,
    kind: 'The major raid',
    description: 'The largest CAI raid: a daylight attack on Harwich in which the Italians were heavily mauled by RAF Hurricanes. Daylight raids on this scale were not repeated.',
  },
  {
    id: 'cai-1940-12-05',
    date: '1940-12-05',
    period: 'night',
    dateLabel: '5 December 1940 (night)',
    place: 'Ipswich',
    lat: 52.0567,
    lon: 1.1482,
    kind: 'Night raid',
    description: 'A small night raid on Ipswich.',
  },
  {
    id: 'cai-1940-12-x',
    date: '1940-12-13',
    period: 'night',
    dateLabel: '13 / 21 / 22 December 1940 (nights)',
    place: 'Harwich',
    lat: 51.9426,
    lon: 1.2873,
    kind: 'Night raids',
    description: 'A series of small night raids on Harwich through December 1940.',
  },
  {
    id: 'cai-1941-01-02',
    date: '1941-01-02',
    period: 'night',
    dateLabel: '2 January 1941 (night)',
    place: 'Harwich',
    lat: 51.9426,
    lon: 1.2873,
    kind: 'Night raid',
    description: 'A night raid on Harwich.',
  },
  {
    id: 'cai-1941-02',
    date: '1941-02-07',
    period: 'night',
    dateLabel: 'to ~7 February 1941 (nights)',
    place: 'Felixstowe / Lowestoft / Ipswich / Harwich',
    lat: 52.2,
    lon: 1.5,
    kind: 'Final small raids',
    description: 'Small night raids on the Suffolk and Essex coast continued into early February 1941, after which the CAI campaign against Britain wound down.',
  },
]

export default caiRaids
