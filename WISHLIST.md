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

## Batch 2 — running casualty counter

- [ ] 6. Live totals that tick up as the timeline runs: killed, injured, and total.
  Honesty notes: can only sum the numeric figures (vague/"unspecified" can't be
  added); London city-wide figures need careful handling to avoid double-counting.
  Will be labelled as approximate / "at least".

## Batch 3 — focus the view by time

- [ ] 7. Year focus (All / 1939 … 1945) so the map shows only the chosen year and
  isn't clogged by earlier years. Optional "recent only" rolling-window mode to
  watch waves arrive (e.g. V-weapons in 1944).

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
