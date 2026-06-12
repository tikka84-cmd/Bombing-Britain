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

## Batch 3 — focus the view (time + severity)

- [ ] 7. Year focus (All / 1939 … 1945) so the map shows only the chosen year and
  isn't clogged by earlier years. Optional "recent only" rolling-window mode to
  watch waves arrive (e.g. V-weapons in 1944).
- [ ] 7b. Casualty-band filter (matching the legend: none / 1–9 / 10–49 / 50–199 /
  200+ / figure not usable) so you can show only the worst events and see where
  they cluster. Caveat: London/region-wide figures attached to a single row will
  appear in the high bands — note this in the filter.

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

## Batch 4 — narrated timeline events (biggest piece)

- [ ] 8. Curated key moments marked on the timeline and shown as a card that
  pauses playback (with a Continue button); markers also clickable any time.
  Proposed events (each date/fact to be verified before use):
  - Start of the Blitz (7 Sep 1940)
  - Battle of Britain / Kanalkampf, and the shift from daylight coastal raids to
    night bombing of London
  - First Italian (CAI) raid (24–25 Oct 1940)
  - First V-1 (reported 13 Jun 1944, Grove Road, Bow, London) — link to a map dot
  - First V-2 (reported 8 Sep 1944, Chiswick, London) — link to a map dot
  - Deadliest raid in the data (to be computed, with care over London totals)
  - Open to more suggestions
- [ ] (mine) "Guided mode" toggle so the pause-on-event narration can be switched
  off on replays.

## Decisions / caveats to keep us honest

- Casualty totals are approximate by necessity; vague and "unspecified" values are
  excluded and London figures handled to avoid double counting.
- Deep-dive (major raid) markers are currently always visible as reference points.
  We could also tie them to the timeline if preferred — open question.
