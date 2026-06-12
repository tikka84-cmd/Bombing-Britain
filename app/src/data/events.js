// Curated timeline events: a few turning points that explain the patterns you
// see on the map. Shown as markers (and one shaded band) on the timeline; a
// short caption flashes as the playhead passes, and you can click to read more.
// Facts verified against standard sources. Our own writing.
//
// kind: 'moment' (single date) or 'phase' (from/to band).
// Optional lat/lon/place make a "Show on map" (fly-to) button.

const events = [
  {
    id: 'first-raids',
    kind: 'moment',
    date: '1939-10-16',
    title: 'The first raids',
    blurb:
      'On 16 October 1939, six weeks into the war, twelve Junkers Ju 88s attacked Royal Navy warships in the Firth of Forth — the first German air raid on Britain. The opening months brought only scattered attacks on naval and coastal targets, which is why the map stays nearly empty until the summer of 1940.',
    lat: 56.0,
    lon: -3.38,
    place: 'the Firth of Forth, near Edinburgh',
  },
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
    id: 'baedeker',
    kind: 'phase',
    from: '1942-04-23',
    to: '1942-06-06',
    title: 'The Baedeker raids',
    blurb:
      'From 23 April 1942, in reprisal for the RAF\'s bombing of Lübeck, the Luftwaffe attacked historic English cities chosen for their cultural value — said to be picked from the three-star sights in the Baedeker tourist guide: Exeter, Bath, Norwich, York and others. It explains the 1942 cluster of raids on cathedral cities away from the usual industrial targets.',
  },
  {
    id: 'baby-blitz',
    kind: 'phase',
    from: '1944-01-21',
    to: '1944-05-29',
    title: 'The "Baby Blitz"',
    blurb:
      'Operation Steinbock, 21 January to 29 May 1944: the Luftwaffe\'s last sustained bomber offensive against Britain, mostly night raids on London and the south, partly in reprisal for the Allied bombing of Germany. It cost the Luftwaffe heavily and achieved little, leaving it badly weakened before D-Day.',
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
  {
    id: 'last-rocket',
    kind: 'moment',
    date: '1945-03-27',
    title: 'The last rocket',
    blurb:
      'On 27 March 1945 one of the last two V-2 rockets fired at Britain struck Orpington, killing Ivy Millichamp, 34 — the last civilian killed by enemy action in Britain during the war. Within weeks the launch sites were overrun and the bombing ended. (Bear in mind this late-war period is badly under-recorded in the data.)',
    lat: 51.358,
    lon: 0.099,
    place: 'Orpington, Kent',
  },
]

export default events
