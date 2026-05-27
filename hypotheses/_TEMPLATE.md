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
[Final impact D — valuation / corporate behavior / capital flows]
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

## Impact profile
| Field | Value |
|---|---|
| **Sectors affected** | [e.g., Indian pharma, US cloud infrastructure] |
| **Company types affected** | [e.g., protein supplement brands, contract manufacturers] |
| **Impact direction** | Positive / Negative / Bifurcated (winners and losers) |
| **Impact severity** | `Critical` / `High` / `Medium` / `Low` |
| **Timeframe** | [When should the effect materialise?] |

**Priority tier rationale:** [Why P1/P2/P3? What drives this prioritization?]

---

## Falsifiable watch-items
- **CONFIRMS:** [Specific observable event that would increase confidence]
- **CONFIRMS:** [Another confirmation signal]
- **KILLS:** [Specific observable event that would falsify or sharply reduce confidence]
- **KILLS:** [Another falsification signal]

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
