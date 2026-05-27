# Hypothesis: [Short title]

> Copy to `hypotheses/[active|developing|predicted]/H-NNNN-[slug].md`
> hypothesis-generator or hypothesis-predictor creates; hypothesis-validator maintains all scores.

---

## Identity
| Field | Value |
|---|---|
| **ID** | H-NNNN |
| **Slug** | short-kebab-title |
| **Type** | `Causal-Chain` / `Correlation` / `Predicted` / `Mixed` |
| **Origin** | `Event-Driven` (from a real signal) / `Predicted` (AI-generated) / `Derived` (from existing hypothesis) |
| **Status** | `Active` (≥60%) / `Developing` (<60%) / `Predicted` (unvalidated) / `Retired` |
| **Created** | YYYY-MM-DD |
| **Created by** | hypothesis-generator / hypothesis-predictor |
| **Last validated** | YYYY-MM-DD |
| **Next validation due** | YYYY-MM-DD |
| **Priority tier** | `P1` (daily) / `P2` (48h) / `P3` (72h) |
| **Time horizon** | `ST` (≤4 weeks, verifiable in days) / `MT` (1–3 months) / `LT` (3–18+ months structural) |

---

## Statement
**Cause:** [What is the trigger / upstream event?]

**Effect:** [What is the predicted downstream impact?]

**One-line:** [Cause] → [Effect], affecting [sector/company type], over [timeframe].

---

## Causal chain summary
```
[Event A]
  ↓ [mechanism]
[First-order effect B]
  ↓ [mechanism]
[Second-order effect C]
  ↓ [mechanism]
[Capital market impact D — instrument, direction, magnitude, investor-type driver]
```

---

## Scores
| Metric | Score | Last updated |
|---|---|---|
| **Confidence** | XX% | YYYY-MM-DD |
| **Causality** | XX / 100 | YYYY-MM-DD |
| **Correlation** | XX / 100 | YYYY-MM-DD |
| Causality + Correlation check | 100 ✓ | — |

**Scoring rationale:**
- *Confidence:* [Why this number? What evidence supports or weakens it?]
- *Causality score:* [Is there a clear mechanism? Would the effect still occur if we intervened to break the correlation?]
- *Correlation score:* [Is this a statistical co-movement without clear mechanism? Could a common third factor explain both?]

---

## ★ Capital Market Prediction
*Primary output. This is the testable, market-facing claim. Everything else supports this.*

| Field | Value |
|---|---|
| **Instrument** | [Specific ticker / index / sector ETF / bond / currency pair] |
| **Market** | `NSE` / `BSE` / `NYSE` / `NASDAQ` / `Multi-market` |
| **Predicted direction** | `Bullish` / `Bearish` / `Range-bound` / `Volatile (non-directional)` |
| **Predicted magnitude** | [e.g., +5–8% / −200–400bps credit spread / INR depreciation 2–3%] |
| **Timeframe** | [e.g., 2–4 weeks / 1–2 quarters / 6–12 months] |
| **Already priced in?** | `No — market unaware` / `Partially` / `Yes — look for next link` |
| **Unprice assessment** | [What does current consensus believe? Where does this thesis diverge?] |

**Expected investor-type driver:**
> [Which investor type is expected to move this instrument and WHY?]
> e.g., "FII net selling — expected risk-off rotation on EM macro concern" or
> "DII accumulation — domestic mutual fund rebalancing into defensive" or
> "Institutional fundamental buyers — earnings upgrade cycle recognition" or
> "Retail panic exit — headline-driven fear before fundamentals confirm"

**Capital market thesis (one paragraph):**
[Lay out the complete market-facing argument: what moves, who moves it, why now, what the market currently has wrong. This is the paragraph a portfolio manager reads to decide if this is worth a position.]

---

## Investor Sentiment Landscape
*Current state of each investor type relative to this hypothesis. Updated by market-signal-reader during validation.*

| Investor type | Current posture | Signal / source | Last checked |
|---|---|---|---|
| **FII** | [Net buyer / Net seller / Neutral / Unknown] | [NSE FII data / NSDL tracker] | YYYY-MM-DD |
| **DII** | [Net buyer / Net seller / Neutral / Unknown] | [NSE DII data] | YYYY-MM-DD |
| **Retail** | [Accumulating / Exiting / Neutral / Unknown] | [Volume data / social sentiment] | YYYY-MM-DD |
| **HNI** | [Active / Inactive / Unknown] | [Bulk deal data / block trades] | YYYY-MM-DD |
| **Hedge funds / prop** | [Long / Short / Neutral / Unknown] | [F&O OI / positioning data] | YYYY-MM-DD |

**India VIX (latest):** [XX.X — Calm <15 / Elevated 15–20 / High 20–25 / Extreme >25]
**US VIX (latest):** [XX.X — if relevant]
**Market regime:** [Risk-on / Risk-off / Sector rotation / Neutral]

---

## Supporting Fundamental Thesis
*Secondary — explains WHY the capital market prediction should materialize.*

| Field | Value |
|---|---|
| **Sectors affected** | [e.g., Indian pharma, US cloud infrastructure] |
| **Company types affected** | [e.g., protein supplement brands, contract manufacturers] |
| **Business impact direction** | Positive / Negative / Bifurcated (winners and losers) |
| **Impact severity** | `Critical` / `High` / `Medium` / `Low` |
| **P&L impact estimate** | [e.g., 200–400bps gross margin compression for affected companies] |
| **Valuation/multiple effect** | [e.g., P/E de-rating risk if earnings certainty falls] |

**Named winners:** [business model archetypes that benefit, with mechanism]

**Named losers:** [business model archetypes that suffer, with mechanism]

**Priority tier rationale:** [Why P1/P2/P3? What drives this prioritization?]

---

## Falsifiable watch-items
- **CONFIRMS:** [Specific observable market event that would increase confidence — e.g., "FII net buy >₹500Cr in sector 3 consecutive days"]
- **CONFIRMS:** [Another confirmation signal — e.g., "Stock closes above prior resistance on volume +50% average"]
- **CONFIRMS (fundamental):** [Business-level confirmation — e.g., "Company X reports gross margin compression in Q results"]
- **KILLS:** [Specific observable event that would falsify — e.g., "Stock rallies >5% on high volume despite bearish thesis"]
- **KILLS:** [Another falsification signal — e.g., "FII becomes net buyer of sector >₹1,000Cr, signaling macro risk-on override"]

---

## Market Actuals
*Append-only. market-signal-reader logs each check here. The validation log for the capital market prediction.*

| Date | Instrument | Predicted | Actual (close) | Match | Override type | Explanation | Confidence delta |
|---|---|---|---|---|---|---|---|
| YYYY-MM-DD | [ticker] | [direction/magnitude] | [price/% change] | `Yes` / `Partial` / `No` / `Too early` | [Override 1–7 / None] | [1–2 sentence diagnosis] | +X% / −X% / 0 |

**Override type reference:**
1. Macro override — broad risk-on/risk-off overwhelmed fundamental signal
2. Investor-type mismatch — different investor type dominated than predicted
3. Already priced — market moved BEFORE confirmation; sell-the-news on event
4. Sentiment override — VIX/fear index dominated; fundamentals irrelevant short-term
5. Factor rotation — sector/country-level flows, unrelated to fundamental thesis
6. Timing error — thesis correct, causal chain not yet materialized; extend timeframe
7. Thesis error — fundamental chain was wrong; route to red-team review

---

## Evidence log
*Append-only. hypothesis-validator adds a row after each validation run.*

| Date | Source | Evidence type | Summary | Confidence delta | Validator note |
|---|---|---|---|---|---|
| YYYY-MM-DD | [URL/source] | Confirms / Disconfirms / Neutral / New link | [1-line summary] | +X% / -X% / 0 | [note] |

---

## Validation history
*Summary of how scores have moved over time.*

| Date | Confidence | Causality | Correlation | Key reason for change |
|---|---|---|---|---|
| YYYY-MM-DD (created) | XX% | XX | XX | Initial estimate |

---

## Related hypotheses
- **Parent:** [H-NNNN — slug] (this hypothesis derives from / depends on)
- **Children:** [H-NNNN — slug] (hypotheses that depend on this one)
- **Competing:** [H-NNNN — slug] (alternative explanations for the same effect)

---

## Notes
[Any additional context, analyst notes, edge cases]

---
*Not investment advice. Analytical output for research and training purposes only.*
