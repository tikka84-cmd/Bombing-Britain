// Hand-authored deep-dive cards for major named raids. The underlying dataset
// records only what fell on the ground (place, date, casualties); the
// attacker-side detail below (Luftwaffe units, aircraft, tonnage, intent) is
// curated from standard secondary histories of the Blitz. Figures are those
// commonly cited and vary between sources; treat them as well-established
// approximations, not exact counts. This is our own writing.

const deepDives = [
  {
    id: 'coventry',
    title: 'Coventry',
    place: 'Coventry, West Midlands',
    lat: 52.4068,
    lon: -1.5197,
    dateLabel: '14–15 November 1940',
    strap: 'Operation Moonlight Sonata — the raid that gave the world the verb "to coventrate".',
    facts: [
      ['Attacker', 'Luftflotte 3, led by pathfinders of Kampfgruppe 100 using X-Gerät radio beams'],
      ['Aircraft', 'Around 450–515 bombers: He 111, Ju 88, Do 17'],
      ['Ordnance', 'About 500 tonnes of high explosive and ~36,000 incendiaries'],
      ['Target', 'Armaments, aero-engine and machine-tool industry; the medieval city centre'],
      ['Casualties', 'About 568 killed and over 850 injured'],
    ],
    body: [
      'On the night of 14 November 1940 the Luftwaffe concentrated a single overwhelming raid on Coventry, a compact city packed with war industry. Pathfinders dropped flares and incendiaries to start fires that guided the main force; high explosive and incendiaries then fell for around eleven hours.',
      'The 14th-century Cathedral of St Michael was gutted, and the dense medieval centre burned. German propaganda coined "coventrieren" — to coventrate — for the annihilation of a city from the air. The raid hardened British resolve and the cathedral ruins became a lasting symbol of reconciliation.',
    ],
    sources: ['Standard histories of the Coventry Blitz; Imperial War Museum.'],
  },
  {
    id: 'london',
    title: 'London',
    place: 'London',
    lat: 51.5074,
    lon: -0.1278,
    dateLabel: '7 September 1940 – 11 May 1941',
    strap: 'The Blitz proper: 57 consecutive nights, then eight months of raids on the capital.',
    facts: [
      ['Attacker', 'Luftflotte 2 and 3, flying from northern France and the Low Countries'],
      ['Opening', '"Black Saturday", 7 September 1940 — the East End docks set ablaze'],
      ['Firestorm', '29–30 December 1940, the "Second Great Fire of London" around St Paul\'s'],
      ['Worst night', '10–11 May 1941 — around 1,400 killed in the last great raid'],
      ['Casualties', 'Roughly 20,000+ Londoners killed across the campaign'],
    ],
    body: [
      'London was bombed on 57 consecutive nights from 7 September 1940 and repeatedly until May 1941. The docks and East End were hit hardest, but damage was city-wide. Note that in this dataset many London casualty figures are city-wide totals, not per-borough.',
      'The capital dominates any map of the bombing — but it was far from alone, which is the whole point of this project.',
    ],
    sources: ['Standard histories of the London Blitz; Imperial War Museum.'],
  },
  {
    id: 'liverpool',
    title: 'Liverpool & Merseyside',
    place: 'Liverpool, Merseyside',
    lat: 53.4084,
    lon: -2.9916,
    dateLabel: 'May Blitz, 1–7 May 1941',
    strap: 'The most heavily bombed British region outside London, because of its Atlantic docks.',
    facts: [
      ['Attacker', 'Luftflotte 2 and 3'],
      ['Peak', 'Seven consecutive nights, 1–7 May 1941'],
      ['Catastrophe', 'SS Malakand, loaded with munitions, exploded in Huskisson Dock'],
      ['Target', 'The docks — Britain\'s most important western port for Atlantic convoys'],
      ['Casualties', 'Around 1,700 killed across Merseyside in the May week alone'],
    ],
    body: [
      'Merseyside was vital to Britain\'s survival: the convoys that kept the country fed and supplied came in through Liverpool. The Germans bombed it accordingly, culminating in the seven-night May Blitz of 1941 that left much of the city centre and dockland in ruins.',
      'Wartime censorship often hid Merseyside\'s suffering from the public, referring vaguely to "a north-western town".',
    ],
    sources: ['Standard histories of the Liverpool/Merseyside Blitz.'],
  },
  {
    id: 'clydebank',
    title: 'Clydebank',
    place: 'Clydebank, West Dunbartonshire',
    lat: 55.9009,
    lon: -4.4015,
    dateLabel: '13–14 March 1941',
    strap: 'Two nights that left only a handful of the town\'s homes undamaged.',
    facts: [
      ['Attacker', 'Luftflotte 3'],
      ['Target', 'Clydeside shipbuilding (John Brown\'s), the Singer factory, oil and munitions'],
      ['Devastation', 'Of around 12,000 homes, only a handful were left undamaged'],
      ['Displacement', 'Tens of thousands made homeless almost overnight'],
      ['Casualties', 'About 528 killed and over 600 seriously injured'],
    ],
    body: [
      'Clydebank, a small shipbuilding town on the Clyde, was hit on two consecutive nights in March 1941. The destruction of housing was almost total: the population fell from around 50,000 to a few thousand as survivors fled.',
      'It remains one of the most concentrated instances of destruction of any British town in the war, and is far from the South East the bombing is popularly associated with.',
    ],
    sources: ['Standard histories of the Clydebank Blitz.'],
  },
  {
    id: 'belfast',
    title: 'Belfast',
    place: 'Belfast, Northern Ireland',
    lat: 54.5973,
    lon: -5.9301,
    dateLabel: 'Belfast Blitz, April–May 1941',
    strap: 'A city almost undefended; one of the highest single-night death tolls outside London.',
    facts: [
      ['Attacker', 'Luftwaffe bombers from occupied Europe'],
      ['Worst raid', 'Easter Tuesday, 15–16 April 1941 — around 900 killed'],
      ['Defences', 'Very few anti-aircraft guns; almost no searchlights or shelters'],
      ['Target', 'Harland & Wolff shipyard, Short Brothers aircraft works, the docks'],
      ['Aid', 'Fire crews crossed the border from neutral Éire to help'],
    ],
    body: [
      'Belfast was thought to be beyond comfortable bomber range and was left badly under-defended. The Easter Tuesday raid of April 1941 killed around 900 people in a single night, one of the worst tolls of the war outside London.',
      'Fire brigades from the neutral Irish state crossed the border to assist — a striking moment in the history of the Blitz.',
    ],
    sources: ['Standard histories of the Belfast Blitz.'],
  },
  {
    id: 'swansea',
    title: 'Swansea',
    place: 'Swansea, Wales',
    lat: 51.6214,
    lon: -3.9436,
    dateLabel: 'Three Nights\' Blitz, 19–21 February 1941',
    strap: 'Three consecutive nights that obliterated the centre of the Welsh port.',
    facts: [
      ['Attacker', 'Luftflotte 3'],
      ['Duration', 'Three consecutive nights, 19–21 February 1941'],
      ['Target', 'The docks of a major coal-exporting port in south-west Wales'],
      ['Casualties', 'Around 230 killed and over 400 injured'],
    ],
    body: [
      'Over three nights in February 1941 the Luftwaffe destroyed the commercial heart of Swansea. The town centre was largely flattened and burned, and the raids are remembered locally simply as the "Three Nights\' Blitz".',
      'Swansea is a reminder that Wales, too, was a front line of the bombing war.',
    ],
    sources: ['Standard histories of the Swansea Three Nights\' Blitz.'],
  },
  {
    id: 'plymouth',
    title: 'Plymouth',
    place: 'Plymouth, Devon',
    lat: 50.3755,
    lon: -4.1427,
    dateLabel: 'Plymouth Blitz, March–April 1941',
    strap: 'The naval city whose centre was destroyed almost completely.',
    facts: [
      ['Attacker', 'Luftflotte 3'],
      ['Peak', 'A series of heavy raids in March and April 1941'],
      ['Target', 'Devonport, the Royal Navy dockyard'],
      ['Casualties', 'Over 1,170 civilians killed across the raids'],
    ],
    body: [
      'As home to the Royal Navy\'s Devonport dockyard, Plymouth was a priority target. Successive raids in the spring of 1941 destroyed the city centre so thoroughly that it was almost entirely rebuilt to a new plan after the war.',
    ],
    sources: ['Standard histories of the Plymouth Blitz.'],
  },
  {
    id: 'bristol',
    title: 'Bristol',
    place: 'Bristol',
    lat: 51.4545,
    lon: -2.5879,
    dateLabel: 'Bristol Blitz, from 24 November 1940',
    strap: 'A great west-country port and aircraft-manufacturing city.',
    facts: [
      ['Attacker', 'Luftflotte 3'],
      ['Major raid', '24 November 1940 devastated the old city centre'],
      ['Target', 'The Bristol Aeroplane Company at Filton and the port at Avonmouth'],
      ['Casualties', 'Around 1,300 killed across the war'],
    ],
    body: [
      'Bristol combined a major port with one of Britain\'s largest aircraft factories, making it a repeated target. The raid of 24 November 1940 gutted the medieval centre around Castle Park, which was never rebuilt and survives as open ground.',
    ],
    sources: ['Standard histories of the Bristol Blitz.'],
  },
  {
    id: 'hull',
    title: 'Hull',
    place: 'Kingston upon Hull, East Yorkshire',
    lat: 53.7676,
    lon: -0.3274,
    dateLabel: 'Heavily bombed 1941, worst on 7–9 May 1941',
    strap: 'One of the most bombed British cities — and one the public was rarely told about.',
    facts: [
      ['Attacker', 'Luftwaffe bombers crossing the North Sea'],
      ['Exposure', 'An easily found coastal target on the route to and from other cities'],
      ['Target', 'The docks of a major North Sea port'],
      ['Casualties', 'Around 1,200 killed over the war; the May 1941 raids were the worst'],
    ],
    body: [
      'Hull was bombed throughout the war and suffered proportionally enormous damage, yet wartime reports usually called it only "a north-east coast town". A large majority of its houses were damaged at some point.',
      'Its obscurity in the popular memory of the Blitz is exactly the imbalance this map sets out to correct.',
    ],
    sources: ['Standard histories of the Hull Blitz.'],
  },
]

export default deepDives
