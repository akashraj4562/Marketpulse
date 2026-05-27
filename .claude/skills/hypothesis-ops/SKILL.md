# Skill: hypothesis-ops
> Procedural memory for hypothesis lifecycle operations.
> Invoke: `hypothesis-ops: [operation]`
> Operations: create | validate | retire | graduate | daily-check

---

## CREATE — Filing a new hypothesis

### Step 1: Assign ID and check portfolio
```
Read: hypotheses/PORTFOLIO.md  → find "Next hypothesis ID"
```
Current next ID: **H-0011**

### Step 2: Classify before writing
Before creating the file, answer these four questions:
1. **Horizon**: ST (≤4 weeks), MT (1–3 months), or LT (3–18+ months)?
2. **Origin**: Event-Driven (specific news trigger) or Structural (long-term pattern)?
3. **Priority tier**: P1 (validate daily — ST or fast-moving event) or P2 (every 48h)?
4. **Primary instrument**: What specific ticker is the capital market prediction on?

### Step 3: Use the template
Copy `hypotheses/_TEMPLATE.md`. Fill every section.

**Non-negotiable fields:**
- `Capital Market Prediction` section with: Instrument, Market, Direction, Magnitude, Timeframe, Already priced in?, Unprice assessment
- `Investor Sentiment Landscape` table
- At least 2 CONFIRMS and 2 KILLS watch items
- Causality + Correlation = 100 always
- Source quality note (which tier is each number from?)

**Instrument field format for chart resolution:**
- Use exchange-qualified codes: `TCS (NSE: TCS)` or `NASDAQ: MU`
- NSE sector indices: `Nifty IT Index (NSE: NIFTYIT)` → resolves to `^CNXIT`
- Multiple instruments: use `;` to separate primary from proxies: `CRWD (NASDAQ: CRWD); PANW as secondary`
- The chart always uses the FIRST instrument before the first `;`

### Step 4: Save to correct folder
- Confidence ≥ 60%: `hypotheses/active/H-XXXX-slug.md`
- Confidence < 60%: `hypotheses/developing/H-XXXX-slug.md`

### Step 5: Update PORTFOLIO.md
1. Increment "Next hypothesis ID" (H-0011 → H-0012)
2. Add row to Active or Developing table
3. Add to Priority queue
4. Add to Sector index
5. Update summary counts

---

## VALIDATE — Running a validation check on a hypothesis

### Inputs needed
- Current market prices for the instrument (from market-signal-reader or Yahoo Finance)
- Any relevant news in the last 24–48h
- FII/DII data if India hypothesis (NSE daily bulletin)

### Validation process
1. **Check all CONFIRMS items**: has any occurred?
   - If yes: `confidence += 8–15%`, note in evidence log
2. **Check all KILLS items**: has any occurred?
   - If yes: `confidence -= 20–40%`, flag for potential retirement
3. **Compare predicted vs actual price movement**:
   - Record in Market Actuals table: `| date | instrument | predicted | actual | match | override_type | explanation | delta |`
   - If mismatch: diagnose override type (see DECISIONS.md DEC-A001)
4. **Guardrail check — MANDATORY before writing any confidence update:**
   - G1: Does this confidence delta have a corresponding evidence entry? If not, do NOT update the score.
   - G5: Does the Causality score stay ≥40? If new evidence weakens the mechanism, downgrade Causality first.
   - G4: Update `Last validated` and `Next validation due` immediately.
5. **Update scores**: revise Confidence, note any Causality/Correlation rethinks
6. **Update validation dates**: `Last validated` and `Next validation due`

### After validation
- Update hypothesis file (evidence log, validation history, market actuals)
- Update PORTFOLIO.md confidence column
- **Update PREDICTION-LEDGER.md**: if the hypothesis has now confirmed, falsified, or partially confirmed, add an outcome row immediately. Do not wait for "full resolution" — log partial outcomes as 🟡 Partial.
- **Update TEST-LOG.md**: if any guardrail was breached during this validation, record it.
- If confidence drops below 40%: move to `hypotheses/developing/` and set P2
- If confidence reaches 80%+: consider triggering a full thesis workup
- **Trust ledger principle**: if this validation reveals the prediction was wrong, add an explicit acknowledgment in the Market Actuals table with the override type and lesson. Never leave a mismatch undiagnosed.

### Confidence update discipline — non-negotiable rules

| Scenario | Correct response | Wrong response |
|---|---|---|
| New T1 evidence confirms a link | +8–12% | Do not inflate beyond what the evidence supports |
| CONFIRMS item triggers | +10–15% | Do not compound if multiple CONFIRMS trigger in one cycle |
| KILLS item triggers | -20–40% | Do not ignore it because you still believe the thesis |
| Market moved against prediction | Diagnose override type, update score -5–15% | Leave confidence unchanged "because it's a timing issue" |
| No new evidence this cycle | 0 change | Do not adjust confidence just to show the system is active |
| Evidence is T3/T4 | 0 change; note in evidence log as "directional only" | Do not update confidence based on T3/T4 alone |

---

## RETIRE — Closing a hypothesis

### When to retire
- KILLS item triggered and confidence dropped below 20%
- Timeframe has passed and outcome is clear (confirmed or falsified)
- Superseded by a more specific hypothesis

### Process
1. Set `Status: Retired` in the hypothesis file
2. Fill in `## Outcome` section: confirmed / falsified / expired
3. Move file from `active/` or `developing/` to `retired/`
4. Update PORTFOLIO.md: remove from active/developing, add to retired table
5. Add key learning to `docs/memory/DECISIONS.md` if there's a calibration insight

---

## GRADUATE — Elevating a developing hypothesis to active

Happens when confidence crosses 60% on a validation cycle.

1. Move file from `hypotheses/developing/` to `hypotheses/active/`
2. Update Status field to `Active`
3. Update PORTFOLIO.md tables accordingly
4. Check if a full thesis workup (signal-to-thesis skill) is warranted at this point

---

## DAILY-CHECK — The daily validation loop

1. Read PORTFOLIO.md → priority queue → today's P1 items
2. For each P1 hypothesis:
   a. Pull closing prices (market-signal-reader or Yahoo Finance)
   b. Scan headlines for CONFIRMS/KILLS triggers
   c. Run VALIDATE procedure above
3. For P2 items due today: same process
4. Update SESSIONS.md with what was validated and any confidence deltas
5. Flag to owner: any hypothesis with |delta| > 15% in one session

---

## Ticker → Yahoo Finance symbol reference

| Hypothesis type | NSE symbol format | Yahoo Finance symbol |
|---|---|---|
| Broad India market | NIFTY50 | `^NSEI` |
| India IT sector | NIFTYIT | `^CNXIT` |
| India FMCG sector | NIFTYFMCG | `^CNXFMCG` |
| India Auto sector | NIFTYAUTO | `^CNXAUTO` |
| India Bank sector | NIFTYBANK | `^NSEBANK` |
| India individual stock | TCS, INFY, BPCL | `TCS.NS`, `INFY.NS`, `BPCL.NS` |
| USD/INR forex | USD/INR | `USDINR=X` |
| US stock | MU, CRWD, AAPL | `MU`, `CRWD`, `AAPL` |
| US ETF | IWM, SPY, XLU | `IWM`, `SPY`, `XLU` |

---

## Source quality reminder (T1–T4)

Every number cited in a hypothesis must have a source tier attached:
- **T1** (full weight): Fed FOMC statements, BLS CPI, NSE/BSE official data, company earnings releases, Reuters/Bloomberg, RBI circulars, PPAC crude data
- **T2** (high weight): J.P. Morgan research, ICICI/Kotak/HDFC securities reports, ET/Mint/CNBC sourcing primary data, CRISIL/ICRA ratings, Gartner forecasts
- **T3** (directional only): Goodreturns, StockEdge blog, MoneyControl aggregated
- **T4** (zero weight for facts): Twitter/X, Reddit, WhatsApp, anonymous forums

**Iron rule**: Any specific % number or price target cited must be T1 or T2.

---

## Confidence calibration targets (long-term)

| Confidence band | Target hit rate |
|---|---|
| 80–100% | Should confirm ≥80% of the time |
| 60–79% | Should confirm ≥60% |
| 40–59% | Should confirm ~50% (informed coin flip) |
| 20–39% | Should confirm ≤40% |

Track in PORTFOLIO.md Calibration tracker. If consistently off → validator is miscalibrated.
