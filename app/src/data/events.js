// Curated timeline events: a few turning points that explain the patterns you
// see on the map. Shown as markers (and one shaded band) on the timeline; a
// short caption flashes as the playhead passes, and you can click to read more.
// Facts verified against standard sources. Our own writing.
//
// kind: 'moment' (single date) or 'phase' (from/to band).
// Optional lat/lon/place make a "Show on map" (fly-to) button.

const events = [
  {
    id: 'battle-of-britain',
    kind: 'phase',
    from: '1940-07-10',
    to: '1940-10-31',
    title: 'The Battle of Britain',
    blurb:
      'Through the summer of 1940 the Luftwaffe fought for control of the air: first attacking Channel shipping (the "Kanalkampf"), then coastal airfields and radar stations in the South East, largely by day. Look for daytime raids clustered near the south and east coasts.',
  },
  {
    id: 'blitz-begins',
    kind: 'moment',
    date: '1940-09-07',
    title: 'The Blitz begins',
    blurb:
      'On "Black Saturday", 7 September 1940, the Luftwaffe switched to the mass bombing of cities, above all London, and mostly at night. From here the pattern changes: the daytime coastal and airfield raids give way to night raids on London and, soon, industrial cities across the whole country.',
  },
  {
    id: 'blitz-eases',
    kind: 'moment',
    date: '1941-05-11',
    title: 'The Blitz eases',
    blurb:
      'After a devastating raid on London on the night of 10–11 May 1941, the main Blitz ended. The Luftwaffe was redeployed east for the invasion of the Soviet Union that June, and raids on Britain thin sharply from this point.',
  },
  {
    id: 'first-v1',
    kind: 'moment',
    date: '1944-06-13',
    title: 'First V-1 flying bomb',
    blurb:
      'A week after D-Day, at about 4:25am on 13 June 1944, the first V-1 flying bomb ("doodlebug") to reach London fell on Grove Road, Bow, wrecking a railway bridge and killing six people. The pilotless flying-bomb campaign against London and the South East had begun.',
    lat: 51.5298,
    lon: -0.027,
    place: 'Grove Road, Bow, London',
  },
  {
    id: 'first-v2',
    kind: 'moment',
    date: '1944-09-08',
    title: 'First V-2 rocket',
    blurb:
      'At about 6:40pm on 8 September 1944 the first V-2 rocket to hit London struck Staveley Road, Chiswick, killing three people. Faster than sound and impossible to intercept, the V-2 marked the final phase of the bombing. Note that this late-war period is badly under-recorded in the data.',
    lat: 51.4916,
    lon: -0.2645,
    place: 'Staveley Road, Chiswick, London',
  },
]

export default events
