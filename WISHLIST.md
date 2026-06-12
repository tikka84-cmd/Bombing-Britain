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

## Batch 2 — running casualty counter — BLOCKED (data can't support it honestly)

- [!] 6. Tried a live killed/injured tally. The dataset CANNOT be summed into a
  credible total: the "entire London" rows repeat the running city-wide total
  across 4,435 reports (495,650 "killed"), and other cities do the same (e.g.
  Liverpool's 1,232 deaths appear on 7 consecutive rows). Naive sum = ~540,000
  killed vs the true ~60,000–70,000. Reverted the live tally.
  Honest alternatives to choose from:
  (a) No derived total; keep per-event figures in the detail card, and add the
      accepted historical estimate (~60–70k UK civilian deaths; ~43k in the
      1940–41 Blitz) as a sourced, static line in About. [recommended]
  (b) A ticking counter that excludes area-wide running totals — but it would
      undercount badly (loses London/Liverpool), still misleading.
  (c) Drop the idea.

## Batch 3 — focus the view (time + severity)

- [ ] 7. Year focus (All / 1939 … 1945) so the map shows only the chosen year and
  isn't clogged by earlier years. Optional "recent only" rolling-window mode to
  watch waves arrive (e.g. V-weapons in 1944).
- [ ] 7b. Casualty-band filter (matching the legend: none / 1–9 / 10–49 / 50–199 /
  200+ / figure not usable) so you can show only the worst events and see where
  they cluster. Caveat: London/region-wide figures attached to a single row will
  appear in the high bands — note this in the filter.

## Batch 5 — data accuracy & honesty

- [ ] Geocoding: handle "Place, Qualifier" names (e.g. "Garston, Watford") by
  anchoring on the qualifier so the right one is chosen. Currently "Garston,
  Watford" lands on the Liverpool Garston (in the Mersey). Re-run pipeline after.
- [ ] Non-raid incidents: the source logged civil-defence incidents, so a few
  entries are not German air raids — notably the Freckleton air disaster (24 Aug
  1944, a US aircraft crashed into a school; 57 killed in the data). These are not
  flagged in the source. Plan: add an honest caveat in About, and consider a
  curated annotation on the Freckleton point so the map doesn't imply it was a
  German raid. Display the data faithfully; do not silently delete.
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
