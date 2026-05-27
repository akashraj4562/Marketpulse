# Hypothesis Portfolio — Marketpulse

> The living master index of all hypotheses across all stages.
> hypothesis-validator owns and updates this after every validation cycle.
> hypothesis-generator and hypothesis-predictor add rows when new hypotheses are filed.

---

## Portfolio summary
*Updated daily after each cycle.*

| Metric | Count |
|---|---|
| **Active** (confidence ≥ 60%) | 4 |
| **Developing** (confidence < 60%) | 2 |
| **Predicted** (unvalidated, AI-generated) | 0 |
| **Retired** (disproven / expired) | 0 |
| **Total live** | 6 |
| **P1 hypotheses** (validate daily) | 3 |
| **P2 hypotheses** (validate every 48h) | 3 |
| **P3 hypotheses** (validate every 72h) | 0 |
| **Overdue for validation** | 0 |
| *Last updated* | 2026-05-27 |

---

## Priority queue — today's validation run
*hypothesis-validator populates this at the start of each daily cycle.*

| Priority | ID | Slug | Confidence | Last validated | Due | Reason for priority |
|---|---|---|---|---|---|---|
| P1 🔴 | H-0001 | nifty-vix-compression-momentum | 68% | 2026-05-27 | 2026-05-28 | ST; gap-up today; VIX/FII data changes daily |
| P1 🔴 | H-0002 | iran-deal-crude-india-relief | 52% | 2026-05-27 | 2026-05-28 | Deal timeline moving fast; crude/Iran signals change daily |
| P1 🔴 | H-0003 | nifty-it-ai-disruption-underperformance | 72% | 2026-05-27 | 2026-05-28 | Active selling; FII data; earnings narrative moves fast |
| P2 🟡 | H-0004 | fmcg-rural-demand-defensive-rotation | 65% | 2026-05-27 | 2026-05-29 | MT thesis; quarterly data dominant |
| P2 🟡 | H-0005 | india-it-structural-multiple-de-rating | 70% | 2026-05-27 | 2026-05-29 | LT thesis; earnings season is key event (July 2026) |
| P2 🟡 | H-0006 | india-crude-dependence-inr-pressure | 58% | 2026-05-27 | 2026-05-29 | LT macro; tracks inversely with H-0002 |

---

## Active hypotheses (confidence ≥ 60%)

| ID | Slug | Horizon | Confidence | Causality | Correlation | Severity | Instrument | Predicted direction | Sectors | P-tier | Last validated |
|---|---|---|---|---|---|---|---|---|---|---|---|
| H-0001 | nifty-vix-compression-momentum | ST | 68% | 45 | 55 | Medium | NIFTY 50 | Bullish +1.5–3.5% | Broad market | P1 | 2026-05-27 |
| H-0003 | nifty-it-ai-disruption-underperformance | MT | 72% | 72 | 28 | High | Nifty IT / TCS / INFY | Bearish (relative -5–10% vs Nifty 50) | India IT | P1 | 2026-05-27 |
| H-0004 | fmcg-rural-demand-defensive-rotation | MT | 65% | 68 | 32 | Medium | Nifty FMCG / HINDUNILVR / ITC | Bullish +5–10% vs Nifty 50 | India FMCG | P2 | 2026-05-27 |
| H-0005 | india-it-structural-multiple-de-rating | LT | 70% | 78 | 22 | High | TCS / INFY / Nifty IT | Bearish −20–35% relative, PE 22–25x → 14–18x | India IT | P2 | 2026-05-27 |

**Horizon key:** `ST` = Short-term (≤4 weeks, verifiable within days) / `MT` = Medium-term (1–3 months) / `LT` = Long-term structural (3–18+ months)

---

## Developing hypotheses (confidence < 60%)

| ID | Slug | Horizon | Confidence | Causality | Correlation | Severity | Instrument | Predicted direction | Sectors | P-tier | Last validated |
|---|---|---|---|---|---|---|---|---|---|---|---|
| H-0002 | iran-deal-crude-india-relief | MT | 52% | 80 | 20 | Critical (if deal closes) | BPCL / HPCL / IOC / NIFTY 50 | Bullish (conditional) +15–25% OMCs | India Energy / Broad | P1 | 2026-05-27 |
| H-0006 | india-crude-dependence-inr-pressure | LT | 58% | 82 | 18 | High | USD/INR / Nifty Auto | INR Bearish; Auto Bearish (rate-sensitive) | India Macro / Autos | P2 | 2026-05-27 |

---

## Predicted hypotheses (AI-generated, unvalidated)

| ID | Slug | Predicted by | Basis for prediction | Initial confidence | Severity | Sectors | Created |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — |

---

## Retired hypotheses

| ID | Slug | Final confidence | Retirement reason | Retired date | Key learning |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

---

## Sector index
*For rapid lookup — all live hypotheses grouped by primary sector.*

| Sector | Active | Developing | Predicted | Key hypotheses |
|---|---|---|---|---|
| India Pharma | 0 | 0 | 0 | — |
| India FMCG | 1 | 0 | 0 | H-0004 (bullish, MT) |
| India Energy | 0 | 1 | 0 | H-0002 (BPCL/HPCL/IOC, conditional bullish) |
| India IT | 2 | 0 | 0 | H-0003 (MT bearish), H-0005 (LT de-rating) |
| India Industrials | 0 | 0 | 0 | — |
| India Autos | 0 | 1 | 0 | H-0006 (bearish, rate-sensitive) |
| India Macro | 0 | 1 | 0 | H-0006 (INR bearish, LT) |
| US Technology | 0 | 0 | 0 | — |
| US Energy | 0 | 0 | 0 | — |
| Global Commodities | 0 | 0 | 0 | — |
| Global Shipping/Logistics | 0 | 0 | 0 | — |
| Rates / Macro | 0 | 0 | 0 | — |
| Broad India Market | 1 | 0 | 0 | H-0001 (NIFTY 50, ST bullish) |
| Other | 0 | 0 | 0 | — |

---

## Calibration tracker
*How accurate have our confidence scores been? Updated when hypotheses are retired.*

| Confidence band | Hypotheses retired | % that confirmed | Calibration status |
|---|---|---|---|
| 80–100% | 0 | — | Not enough data |
| 60–79% | 0 | — | Not enough data |
| 40–59% | 0 | — | Not enough data |
| 20–39% | 0 | — | Not enough data |
| 0–19% | 0 | — | Not enough data |

> Target: 80–100% band should confirm at ≥80%. 60–79% at ≥60%. If we're systematically off, the validator is miscalibrated.

---

## Next hypothesis ID
**H-0007** ← Use this for the next new hypothesis, then increment.
