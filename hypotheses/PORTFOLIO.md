# Hypothesis Portfolio — Marketpulse

> The living master index of all hypotheses across all stages.
> hypothesis-validator owns and updates this after every validation cycle.
> hypothesis-generator and hypothesis-predictor add rows when new hypotheses are filed.

---

## Portfolio summary
*Updated daily after each cycle.*

| Metric | Count |
|---|---|
| **Active** (confidence ≥ 60%) | 5 |
| **Developing** (confidence < 60%) | 6 |
| **Predicted** (unvalidated, AI-generated) | 0 |
| **Retired** (disproven / expired) | 0 |
| **Total live** | 11 |
| **P1 hypotheses** (validate daily) | 6 |
| **P2 hypotheses** (validate every 48h) | 5 |
| **P3 hypotheses** (validate every 72h) | 0 |
| **Overdue for validation** | 0 |
| *Markets covered* | 🇮🇳 India (7), 🇺🇸 US (4) |
| *Last updated* | 2026-05-28 (PM) |

---

## Priority queue — today's validation run
*hypothesis-validator populates this at the start of each daily cycle.*

| Priority | ID | Slug | Confidence | Market | Last validated | Due | Reason for priority |
|---|---|---|---|---|---|---|---|
| P1 🔴 | H-0001 | nifty-vix-compression-momentum | 42% | 🇮🇳 India | 2026-05-28 | 2026-05-29 | ⚠️ Kill condition triggered — Nifty closed 23,649 < 23,800. Moved to developing. |
| P1 🔴 | H-0002 | iran-deal-crude-india-relief | 52% | 🇮🇳 India | 2026-05-28 | 2026-05-29 | Reversal — deal progressing, WTI briefly below $90. Monitor closely. |
| P1 🔴 | H-0003 | nifty-it-ai-disruption-underperformance | 75% | 🇮🇳 India | 2026-05-28 | 2026-05-29 | Strong confirmation; monitor for tactical bounce risk |
| P1 🔴 | H-0007 | micron-hbm-ai-memory-supercycle | 82% | 🇺🇸 US | 2026-05-28 | 2026-05-29 | ⚠️ Crossed 80% — MU $928, $1,500 analyst target, SK Hynix $1T |
| P1 🔴 | H-0008 | zscaler-miss-cybersec-divergence | 70% | 🇺🇸 US | 2026-05-28 | 2026-05-29 | ST rotation confirmed; CRWD at 52-week high |
| P1 🔴 | H-0011 | crude-100-india-fiscal-rbi-hold | 56% | 🇮🇳 India | 2026-05-28 | 2026-05-29 | Moved to developing — crude falling on deal progress weakens catalyst |
| P2 🟡 | H-0004 | fmcg-rural-demand-defensive-rotation | 65% | 🇮🇳 India | 2026-05-27 | 2026-05-29 | MT thesis; quarterly data dominant |
| P2 🟡 | H-0005 | india-it-structural-multiple-de-rating | 70% | 🇮🇳 India | 2026-05-27 | 2026-05-29 | LT thesis; earnings season is key event (July 2026) |
| P2 🟡 | H-0006 | india-crude-dependence-inr-pressure | 58% | 🇮🇳 India | 2026-05-27 | 2026-05-29 | LT macro; tracks inversely with H-0002; amplified by H-0011 |
| P2 🟡 | H-0009 | fed-rate-hold-rate-sensitive-sectors | 58% | 🇺🇸 US | 2026-05-27 | 2026-05-29 | LT structural; next FOMC June 16-17 is key event |
| P2 🟡 | H-0010 | bigtech-ai-capex-margin-then-revenue | 55% | 🇺🇸 US | 2026-05-27 | 2026-05-29 | MT; Q3 2026 earnings are next Phase 1 test |

---

## Active hypotheses (confidence ≥ 60%)

| ID | Slug | Market | Horizon | Confidence | Causality | Correlation | Instrument | Predicted direction | P-tier | Last validated |
|---|---|---|---|---|---|---|---|---|---|---|
| H-0003 | nifty-it-ai-disruption-underperformance | 🇮🇳 India | MT | 75% | 72 | 28 | Nifty IT / TCS / INFY | Bearish relative -5–10% vs Nifty 50 | P1 | 2026-05-28 |
| H-0004 | fmcg-rural-demand-defensive-rotation | 🇮🇳 India | MT | 65% | 68 | 32 | Nifty FMCG / HINDUNILVR / ITC | Bullish +5–10% vs Nifty 50 | P2 | 2026-05-27 |
| H-0005 | india-it-structural-multiple-de-rating | 🇮🇳 India | LT | 70% | 78 | 22 | TCS / INFY / Nifty IT | Bearish PE 22–25x → 14–18x | P2 | 2026-05-27 |
| H-0007 | micron-hbm-ai-memory-supercycle | 🇺🇸 US | MT | 82% | 85 | 15 | NASDAQ: MU / SOXX | Bullish +20–35% over 2 quarters | P1 | 2026-05-28 |
| H-0008 | zscaler-miss-cybersec-divergence | 🇺🇸 US | ST | 70% | 65 | 35 | NASDAQ: CRWD / PANW / ZS | Bullish CRWD +5–10%; ZS bounce +15–20% | P1 | 2026-05-28 |

**Horizon key:** `ST` = Short-term (≤4 weeks) / `MT` = Medium-term (1–3 months) / `LT` = Long-term structural (3–18+ months)

---

## Developing hypotheses (confidence < 60%)

| ID | Slug | Market | Horizon | Confidence | Causality | Correlation | Instrument | Predicted direction | P-tier | Last validated |
|---|---|---|---|---|---|---|---|---|---|---|
| H-0001 | nifty-vix-compression-momentum | 🇮🇳 India | ST | 42% | 45 | 55 | NIFTY 50 | Bullish +1.5–3.5% | P1 | 2026-05-28 |
| H-0002 | iran-deal-crude-india-relief | 🇮🇳 India | MT | 52% | 80 | 20 | BPCL / HPCL / IOC / NIFTY 50 | Bullish conditional +15–25% OMCs | P1 | 2026-05-28 |
| H-0011 | crude-100-india-fiscal-rbi-hold | 🇮🇳 India | MT | 56% | 78 | 22 | USD/INR / Nifty Auto / Nifty Bank | INR Bearish; Auto/Bank -8–15% relative | P1 | 2026-05-28 |
| H-0006 | india-crude-dependence-inr-pressure | 🇮🇳 India | LT | 58% | 82 | 18 | USD/INR / Nifty Auto | INR Bearish; Auto Bearish | P2 | 2026-05-27 |
| H-0009 | fed-rate-hold-rate-sensitive-sectors | 🇺🇸 US | LT | 58% | 78 | 22 | IYR / XLU / IWM / KRE | Bearish relative -8–15% vs SPY | P2 | 2026-05-27 |
| H-0010 | bigtech-ai-capex-margin-then-revenue | 🇺🇸 US | MT | 55% | 72 | 28 | AAPL / GOOGL / META | Phase 1: AAPL bullish vs GOOGL/META; Phase 2 reverse | P2 | 2026-05-27 |

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
| India FMCG | 1 | 0 | 0 | H-0004 (HINDUNILVR/ITC, bullish MT) |
| India Energy | 0 | 1 | 0 | H-0002 (BPCL/HPCL/IOC, conditional bullish MT) |
| India IT | 2 | 0 | 0 | H-0003 (MT bearish relative), H-0005 (LT PE de-rating) |
| India Industrials | 0 | 0 | 0 | — |
| India Autos | 0 | 1 | 0 | H-0006 (bearish, rate-sensitive LT) |
| India Macro | 0 | 1 | 0 | H-0006 (INR bearish LT) |
| Broad India Market | 1 | 0 | 0 | H-0001 (NIFTY 50, ST bullish) |
| US Semiconductors | 1 | 0 | 0 | H-0007 (MU/SOXX, bullish MT) |
| US Cybersecurity | 1 | 0 | 0 | H-0008 (CRWD/PANW/ZS, rotation ST) |
| US Big Tech | 0 | 1 | 0 | H-0010 (AAPL/GOOGL/META, 2-phase MT) |
| US Rates / Rate-sensitive | 0 | 1 | 0 | H-0009 (IYR/XLU/IWM/KRE, bearish LT) |
| Global Commodities | 0 | 0 | 0 | — |
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
**H-0012** ← Use this for the next new hypothesis, then increment.
