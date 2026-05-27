# Skill: auto-test
> Automated quality testing for Marketpulse — runs on schedule to catch regressions before they destroy owner trust.
> Invoke: `auto-test: [cycle]`
> Cycles: daily | weekly | monthly | guardrail-sweep

---

## OVERVIEW — why this exists

The PM's standing obligation is to continuously test the product's outputs. This skill operationalises that obligation as a runnable procedure. It must execute on schedule without the owner manually triggering it. The desk cannot rely on the owner to notice quality degradation — quality is caught systematically or not at all.

**Trust principle:** Every undetected breach costs more in trust than detecting and fixing it. A desk that tests is a desk the owner can trust. A desk that doesn't test will eventually fail publicly.

---

## DAILY cycle (weekdays ~9am)

Estimated time: 5–10 minutes. Run automatically via cron.

### D-01 — G4 Staleness audit
For every Active (P1 or P2) hypothesis in PORTFOLIO.md:
1. Read `Last validated` date from each hypothesis file
2. Check against today's date:
   - P1: if >3 days since last validation → **G4 BREACH**
   - P2: if >6 days since last validation → **G4 BREACH**
3. For any stale hypothesis: add a note in TEST-LOG.md and trigger re-validation immediately

### D-02 — G8 Overconfidence check
Read PORTFOLIO.md. Calculate average confidence across all Active hypotheses.
- If average > 70% → **G8 BREACH**
- If average > 65% (warning zone) → log a warning in TEST-LOG.md, no breach yet

### D-03 — ST prediction momentum check
For each ST hypothesis (horizon label contains "ST"):
1. Note the predicted direction (Bullish/Bearish/Bearish relative)
2. Check current price direction from the chart API or Yahoo Finance
3. If the instrument has moved >5% in the opposite direction from the prediction since filing AND confidence has not been updated in the last 3 days → flag for immediate re-validation
4. Log in TEST-LOG.md: hypothesis ID, predicted direction, actual movement, action taken

### D-04 — Log daily summary
Append to `docs/memory/SESSIONS.md`:
```
### Daily auto-test — [YYYY-MM-DD]
- G4 staleness: [PASS / N hypotheses flagged]
- G8 overconfidence: [PASS / average = X%, BREACH if >70%]
- ST momentum: [N hypotheses checked, N flagged for re-validation]
- Actions taken: [list any hypothesis files updated]
```

**If any breach detected → send PushNotification immediately (do not wait for daily summary).**

---

## WEEKLY cycle (Mondays ~9am)

Estimated time: 20–30 minutes. Runs the full WT-01 through WT-05 sweep.

### WT-01 — Full guardrail sweep (all 8)

Run each guardrail check and record PASS / BREACH / WARNING:

| # | Guardrail | Check procedure | Level |
|---|---|---|---|
| G1 | Confidence integrity | For each hypothesis updated in the last 7 days: verify confidence delta ≤5% OR evidence log entry exists on the same day | `>5% delta, no evidence = BREACH` |
| G2 | Direction accuracy floor | Open PREDICTION-LEDGER.md. Of all resolved Active-tier hypotheses: calculate direction accuracy. | `Accuracy <50% over last 10 resolved = BREACH` |
| G3 | Source quality | Spot-check 3 random Active hypotheses: verify every specific % number has a T1/T2 source annotation | `Any T3/T4 number cited = BREACH` |
| G4 | Staleness cap | As in D-01 above, but check all hypotheses (not just P1/P2) | `P1 >3 days or P2 >6 days = BREACH` |
| G5 | Causality floor | Read Causality score from each Active hypothesis | `Any Active hypothesis with Causality <40 = BREACH` |
| G6 | Watch-item specificity | For 2 random Active hypotheses: read each CONFIRMS/KILLS item. Can it be checked in <5 min using one public URL? | `Any uncheckable watch-item = BREACH` |
| G7 | Chart data freshness | Run check: for each Active hypothesis, verify the ticker resolves and last historical bar is within 5 trading days | `Any chart with last bar >5 trading days old = BREACH` |
| G8 | Overconfidence cap | Calculate portfolio average confidence | `Average >70% = BREACH` |

Record each result in `docs/product/TEST-LOG.md` under a new `### WT — [date]` entry.

### WT-02 — Random hypothesis audit (2 samples)

Pick 2 Active hypotheses at random (use the last digit of the date to seed: date mod hypothesis_count).
For each:
1. Read the one-liner. Is the prediction unambiguous (instrument, direction, magnitude)?
2. Can you find the T1/T2 source for every specific number in the hypothesis?
3. Are the CONFIRMS and KILLS items checkable in under 5 minutes?
4. Is the confidence score defensible given the evidence log?

Record: hypothesis IDs audited, pass/fail for each question, any fixes made.

### WT-03 — Chart data freshness check

For each Active hypothesis:
1. Extract the primary ticker from the instrument field (using the 5-step resolution in dev-workflow skill)
2. Check that historical data is loading (hist count > 0)
3. Verify the last date is within 5 trading days of today

Record: `H-XXXX: [ticker] hist=[N] last=[date] [✅/❌]`

Any failure = G7 breach. Fix the ticker map or Yahoo Finance connection immediately.

### WT-04 — Prediction momentum check

For each ST hypothesis:
- Has the instrument moved significantly in the opposite direction since filing?
- Has confidence been updated accordingly?

For each MT hypothesis active for >3 weeks:
- What has actually happened since filing? Is the hypothesis still plausible?

Flag any hypothesis where the market has moved >8% against the prediction with no confidence update.

### WT-05 — New hypothesis quality gate (if any filed this week)

For each hypothesis filed since the last weekly cycle:
- [ ] Source quality note present with tier labels
- [ ] Causality ≥ 40 (G5)
- [ ] At least 2 CONFIRMS + 1 KILLS, all checkable in <5 min (G6)
- [ ] Capital market prediction has: instrument, direction, magnitude, timeframe, investor-type driver
- [ ] Already-priced-in assessment completed
- [ ] One-liner is self-contained

### WT-XX — Weekly summary in TEST-LOG.md

Append a full weekly test cycle entry:
```markdown
### WT — [YYYY-MM-DD]
**WT-01 Guardrail sweep:** [PASS / BREACH: G[N] — description]
**WT-02 Random audit:** [H-XXXX, H-XXXX — findings]
**WT-03 Chart freshness:** [all tickers listed with status]
**WT-04 Momentum:** [N hypotheses checked, N flagged]
**WT-05 Quality gate:** [N new hypotheses, all passed / issues found]
**Overall:** [✅ PASS / ❌ BREACH(ES) — list P0 actions]
```

**If any guardrail breaches → PushNotification immediately with: "Marketpulse: Guardrail breach [G-N]. Check TEST-LOG.md."**

---

## MONTHLY cycle (1st of each month)

Estimated time: 60–90 minutes. Runs MT-01 through MT-05.

### MT-01 — Prediction outcome review

Open `docs/product/PREDICTION-LEDGER.md`.
For hypotheses past their timeframe:
- ST (≤4 weeks): all hypotheses filed >4 weeks ago
- MT (1–3 months): all hypotheses filed >6 weeks ago
- LT (3–18 months): all hypotheses filed >4 months ago

For each eligible hypothesis:
1. Look up what actually happened to the instrument since filing
2. Assign: ✅ Confirmed / 🟡 Partial / ❌ Falsified / ⏳ Too early
3. For confirmed: note which CONFIRMS items triggered
4. For falsified: assign override type (1–7) and write a 1-sentence lesson
5. Update PREDICTION-LEDGER.md with outcome row
6. If falsified: trigger hypothesis retirement (move to hypotheses/retired/)

### MT-02 — Calibration accuracy check (G2)

Open PREDICTION-LEDGER.md. Count resolved hypotheses by confidence band:
- 75–100% band: what % confirmed?
- 60–74% band: what % confirmed?
- <60% band: what % confirmed?

Compare to calibration targets (from PORTFOLIO.md Calibration tracker).

If systematically off by >15% from target → write a recalibration note:
1. What type of hypothesis is over/under-confident? (Market? Region? Horizon?)
2. What does the hypothesis-validator need to adjust?
3. Record in DECISIONS.md under a DEC-CAL-XXX entry

### MT-03 — Causal chain integrity audit (3 random hypotheses)

For 3 random Active/Developing hypotheses:
1. Read the causal chain link by link
2. For each link: is it labeled Strong/Plausible/Speculative?
3. Is the label still accurate given what has happened since filing?
4. Does every link name a mechanism (specific actors doing specific actions)?
5. Any link that reads "X therefore Y" without HOW → either add the mechanism OR downgrade causality score

### MT-04 — Coverage gap audit

List major market events from the last 30 days (Fed meetings, earnings surprises, commodity moves, geopolitical events, policy announcements).
For each: is there an Active hypothesis covering it?

Coverage gap = a major event with no hypothesis. For each gap:
1. Is this a deliberate omission (out of scope for the desk)?
2. Or a missed signal? → file a new hypothesis or note in PORTFOLIO.md as a documented gap

### MT-05 — Trust ledger review

Open PREDICTION-LEDGER.md. For every wrong prediction (❌ Falsified) in the last 30 days:
1. Was it acknowledged in the Market Actuals table?
2. Was an override type assigned?
3. Was the causal chain updated to reflect what we learned?

Any wrong prediction without an acknowledgment → retroactively add the entry. Never leave a miss unmarked.

### MT-XX — Monthly summary in TEST-LOG.md

Append a monthly cycle entry with findings and any calibration insights.

---

## GUARDRAIL-SWEEP (standalone, on-demand)

Run only WT-01. Use this for a quick health check without the full weekly procedure.

Triggers:
- Before filing any new hypothesis
- After any significant confidence update (>10% delta)
- After a market dislocation (index move >3% in a day)
- When the owner asks "how confident should I be in the portfolio right now?"

---

## PushNotification triggers

Send a push notification **immediately** (do not wait for end of cycle) when:
1. Any guardrail breach is detected (G1–G8)
2. ST hypothesis confidence drops >15% in one cycle
3. A KILLS watch-item appears to have triggered for a high-confidence (≥70%) hypothesis
4. Portfolio average confidence breaches 70% (G8)

Message format: `"Marketpulse: [brief description]. Check TEST-LOG.md."` (max 200 chars)

---

## Files updated by this skill

| Action | File |
|---|---|
| All test results | `docs/product/TEST-LOG.md` |
| Prediction outcomes | `docs/product/PREDICTION-LEDGER.md` |
| Daily summary | `docs/memory/SESSIONS.md` |
| Calibration decisions | `docs/memory/DECISIONS.md` |
| Retired hypotheses | `hypotheses/retired/` |
| Portfolio state | `hypotheses/PORTFOLIO.md` |

---

## Cron schedule reference

| Cycle | Cron expression | What it runs |
|---|---|---|
| Daily | `17 9 * * 1-5` | D-01 + D-02 + D-03 + D-04 |
| Weekly | `23 9 * * 1` | WT-01 through WT-05 (runs on Monday, same day as daily — weekly runs first) |
| Monthly | `41 9 1 * *` | MT-01 through MT-05 |

**Note:** CronCreate jobs auto-expire after 7 days. Recreate on the next session after expiry. The cron schedule is documented here so re-creation is frictionless — just run the CronCreate calls in RUNBOOK.md.

---
*This skill is the desk's immune system. A desk that tests is a desk the owner can trust.*
