---
name: daily-hypothesis-cycle
description: Orchestrates the three hypothesis functions into a single daily session — generator scans for new signals, validator runs the priority queue, predictor runs weekly. Produces an end-of-day portfolio summary. Designed to be token-efficient through smart prioritization and batch searching. Run once per day with a single prompt.
---

# Daily Hypothesis Cycle

One prompt triggers the full day's hypothesis work. The cycle runs in three phases: new signal intake, priority validation, and (weekly) prediction generation. It ends with a portfolio snapshot.

**Trigger prompt:**
```
research-director: run the daily hypothesis cycle.
```

Or on Fridays / once a week:
```
research-director: run the daily hypothesis cycle with prediction pass.
```

---

## Phase 0 — Cycle setup (research-director, 2 minutes)

1. Note today's date
2. Read `hypotheses/PORTFOLIO.md` — get the current portfolio state
3. Identify today's validation queue (from the Priority queue section, or rebuild it):
   - All P1s last validated ≥ 20h ago
   - All P2s last validated ≥ 36h ago
   - All P3s last validated ≥ 60h ago
   - Any overdue hypotheses (beyond their tier limit) — URGENT flag
4. Estimate the day's capacity: approximately 10–15 hypothesis validations is sustainable
5. If more are due than capacity allows: validate in order (Overdue → P1 → P2 → P3 by severity)

**Output:** Today's validated queue, stated explicitly before proceeding.

---

## Phase 1 — New signal intake (hypothesis-generator)

**Time allocation:** approximately 20–30% of the session

**Task:** Scan for new world events that imply cause-effect relationships not yet in the portfolio.

**Efficient scanning approach:**
1. Run 4–6 targeted web searches across different domains (commodities, India regulation, US policy, geopolitics, climate/weather, technology)
2. For each significant signal found: check PORTFOLIO.md for existing coverage
3. For genuinely new relationships: generate and file a new hypothesis
4. For events that confirm/disconfirm existing hypotheses: flag them for the validator (Phase 2) rather than creating new files

**Token efficiency rule:** batch your domain searches. One search for "India import regulation 2024" may yield signals relevant to 3–5 hypotheses.

**Expected output:** 0–3 new hypothesis files per day (quality over quantity). PORTFOLIO.md updated.

---

## Phase 2 — Priority validation (hypothesis-validator)

**Time allocation:** approximately 60–70% of the session

**Task:** Validate today's priority queue. Update confidence, causality, and correlation scores. Move hypotheses between folders as thresholds are crossed.

**Efficient validation approach:**

**Step 1 — Batch by sector/domain**
Group today's validation queue by sector (India pharma, global commodities, US rates, etc.). Run one targeted search per domain cluster that can yield evidence for multiple hypotheses simultaneously.

**Step 2 — Per-hypothesis update**
For each validated hypothesis:
- Append to evidence log
- Update validation history
- Update scores
- Check threshold crossings (60% up/down, retire trigger)
- Set next validation due date

**Step 3 — Folder moves**
Execute any folder moves triggered by threshold crossings. Update PORTFOLIO.md.

**Step 4 — Flag emerging shifts**
Flag any hypothesis where confidence moved ≥15% in either direction — these are significant and the research-director should be aware.

**Expected output:** Updated hypothesis files for all validated hypotheses. PORTFOLIO.md updated.

---

## Phase 3 — Prediction pass (hypothesis-predictor) — WEEKLY ONLY

**Run on:** Fridays, or the first session of the week, or when invoked explicitly.

**Task:** Generate 3–8 new predicted hypotheses from portfolio reasoning and structural analogs.

**Efficient prediction approach:**
1. Read all Active hypotheses (quick scan of PORTFOLIO.md table)
2. Run Method 1 (second-order consequences) on the 5 highest-confidence active hypotheses
3. Run Method 2 (cross-portfolio patterns) looking for sector overlaps
4. Run Method 3 (structural analogs) for one or two key current macro themes
5. File the strongest 3–8 predictions

**Expected output:** 3–8 new files in `hypotheses/predicted/`. PORTFOLIO.md updated.

---

## Phase 4 — End-of-day summary (research-director)

Produce a concise daily summary:

```
## Marketpulse Daily Summary — [DATE]

### Portfolio status
- Active (≥60%): [N] hypotheses
- Developing (<60%): [N] hypotheses  
- Predicted: [N] hypotheses
- Validated today: [N]
- New hypotheses filed: [N]

### Significant movements today
[List any hypothesis where confidence moved ≥15%]

### Threshold crossings
[Any hypothesis that moved from developing→active, active→developing, or was retired]

### New hypotheses filed
[List new H-IDs with one-line description]

### Overdue for validation (if any)
[List any hypotheses past their validation deadline]

### Tomorrow's P1 queue
[List the P1 hypotheses that will need validation tomorrow]

### Flag for research-director review
[Any hypothesis whose confidence shift is large enough to warrant a full thesis workup 
or a red-team attack]
```

---

## Token efficiency guidelines

The daily cycle is designed to be sustainable — not a token-burning exercise.

| Activity | Estimated searches | Expected coverage |
|---|---|---|
| New signal scan | 4–6 domain searches | Identifies 0–5 new signal areas |
| P1 validation (up to 5) | 5–8 targeted searches | Each P1 gets focused attention |
| P2/P3 validation (up to 10) | 4–6 batch searches by sector | Groups related hypotheses |
| Weekly prediction | 2–3 structural searches | Supplements portfolio reading |
| **Total daily** | **~15–20 searches** | **10–15 hypotheses validated** |

**When the queue is too large:**
- Prioritize strictly (Overdue → P1 → P2 → P3)
- Batch-search to cover multiple hypotheses with one search
- Defer P3 hypotheses to the next day if needed (within 72h limit)
- If consistently overwhelmed: escalate to research-director to trim the portfolio (retire low-relevance hypotheses)

---

## Portfolio health checks (run monthly)

Once a month, the research-director runs:
```
research-director: monthly portfolio health check.
```

This reviews:
- Hypotheses not validated in >7 days (validation discipline failure)
- Hypotheses stuck at the same confidence for >30 days (are we actually searching for evidence?)
- The calibration tracker in PORTFOLIO.md (are our high-confidence hypotheses confirming at the right rate?)
- Portfolio bloat: retire hypotheses with confidence <15% that have been developing for >60 days with no movement

---

## Output
A fully updated portfolio after each daily cycle, with a clear daily summary. The portfolio should be the single source of truth — if it's updated correctly after every cycle, a new session can pick up exactly where the last left off by reading `hypotheses/PORTFOLIO.md`.
