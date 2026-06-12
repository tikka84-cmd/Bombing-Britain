# Wishlist & plan

Plain-English list of improvements. Status: [ ] planned · [~] in progress · [x] done.

## Batch 0 — tone pass (let the map show, don't tell) — DONE

- [x] Remove self-referential / "this map sets out to…" lines (Hull, London),
  soften "told not shown" lines (Clydebank, Swansea), and make the header, intro
  and About descriptive rather than stating the thesis. Users discover it.

## Batch 1 — quick wins (timeline feel + honest framing) — DONE

- [x] 1. Bug: Italian raids show from the start. Now appear only on/after their date.
- [x] 2. Play speed: slower default (Normal) + Slow / Normal / Fast control.
- [x] 3. Manual step: back/forward day buttons + arrow keys (space toggles play).
- [x] 4. Intro overlay: Italy mention removed (discovery).
- [x] 5. Vichy France note removed.
- [x] (mine) Dropped "and Italian" from the header; About stays accurate.

## Batch 2 — running casualty counter — DONE (resolved honestly)

- [x] 6. A live total can't be done honestly (the data repeats running/area
  totals; naive sum ~540k vs true ~60–70k). Resolved via option (a): no derived
  total; per-record figures stay in the detail card, and About now carries the
  sourced historical scale (~43k Blitz deaths; ~60–70k across the war; ~9k from
  V-weapons) with an explanation of why the figures aren't summed.

## Batch 3 — focus the view (time + severity) — DONE

- [x] 7. Year focus (All / 1939 … 1945): the map shows only the chosen year and the
  timeline shrinks to it (verified: 1944 -> 7,500 attacks, Jan–Dec 1944).
- [x] 7b. Casualty-band filter (None / 1–9 / 10–49 / 50–199 / 200+ / Not usable):
  filter to the worst events (200+ -> 167 records clustered on the major cities).
  Hint notes that some high-band entries are area/running totals; London city-wide
  figures show as "not usable".
- [x] 7c. Custom date range: From/To date pickers (down to a single day, e.g.
  14 Nov 1940 -> 102 attacks), with the year buttons as shortcuts. Renamed the
  control "Date range".
- [x] 7d. Italian raids now obey the casualty filter (sit in the "No figure"
  band); empty-state caption only when nothing matches on any date; major-raid
  markers off by default; count denominator excludes the 2 undated records.
- [ ] (optional, deferred) "recent only" rolling-window mode for watching waves.

## Batch 5 — data accuracy & honesty

- [x] Geocoding: "Place, Qualifier" names now anchor on the qualifier and pick the
  nearest namesake (Garston, Watford -> Hertfordshire, not the Mersey). If the
  nearest namesake is far from a town qualifier, it falls back to the town itself
  (low confidence), so e.g. "Langley, Norwich" sits at Norwich, not 100km away.
- [x] Non-raid incidents: DONE. About now caveats that a few entries are not
  enemy action; the Freckleton point's detail card carries a curated note
  explaining it was a US aircraft accident, not a German raid. Data shown
  faithfully (not deleted). Mechanism (INCIDENT_NOTES) is reusable if we find more.
- [ ] NB for Batch 4: the "deadliest" single row may be Freckleton (an accident)
  or a London city-wide total — so do not blindly label it the "deadliest raid".

## Tuning notes

- Play speeds retuned slower (Slow ~4 min, Normal ~2.5 min, Fast ~75s full run),
  one day per tick.

## Batch 4 — narrated timeline events — DONE

- [x] 8. Implemented as clickable timeline flags + one shaded phase band (NOT a
  forced pause, per discussion): a caption flashes for ~5s as the playhead passes,
  and you can click a flag any time to read the card. Five verified turning points:
  Battle of Britain (phase band), the Blitz begins (7 Sep 1940), the Blitz eases
  (10-11 May 1941), first V-1 (13 Jun 1944, Bow), first V-2 (8 Sep 1944, Chiswick).
  V-1/V-2 cards have a "Show on map" fly-to. Deadliest raid deliberately left to
  the deep-dive cards (data can't give an honest single "deadliest").
- [ ] (optional, later) Baby Blitz (Steinbock, early 1944) phase band — deferred;
  add if it looks worthwhile.
- Also fixed: responsive @media block now sits last so cards stop overlapping the
  controls at narrow widths.

## Decisions / caveats to keep us honest

- Casualty totals are approximate by necessity; vague and "unspecified" values are
  excluded and London figures handled to avoid double counting.
- Deep-dive (major raid) markers are currently always visible as reference points.
  We could also tie them to the timeline if preferred — open question.
