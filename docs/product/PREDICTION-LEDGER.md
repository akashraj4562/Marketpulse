# Marketpulse — Prediction Ledger
> The permanent, append-only record of every capital market prediction made by the desk.
> No entry may be edited after the outcome is written. No prediction may be retroactively revised after its timeframe elapses.
> This ledger is the primary mechanism for building and demonstrating owner trust over time.
> Updated by: hypothesis-validator (outcome column), product-manager (trust impact + lesson)

---

## Running scorecard

| Metric | Value | Last updated |
|---|---|---|
| Total predictions logged | 10 | 2026-05-27 |
| Resolved (confirmed / falsified) | 0 | 2026-05-27 |
| Too early to judge | 10 | 2026-05-27 |
| Direction accuracy (all resolved) | — | — |
| Direction accuracy — Active tier (≥60% conf) | — | — |
| Direction accuracy — 75%+ confidence band | — | — |
| Direction accuracy — 60–74% confidence band | — | — |
| Portfolio average confidence at filing | 62% | 2026-05-27 |
| High-negative trust events (unacknowledged wrong) | 0 | 2026-05-27 |

**Calibration status:** Insufficient resolved predictions to assess. First calibration review due when ≥5 hypotheses resolve.

---

## Active predictions (outcome pending)

| ID | Filed | Market | Instrument | Direction | Magnitude | Timeframe | Conf at filing | Status |
|---|---|---|---|---|---|---|---|---|
| H-0001 | 2026-05-27 | 🇮🇳 India | NIFTY 50 (^NSEI) | Bullish | +1.5–3.5% | 1–4 weeks | 68% | ⏳ Too early |
| H-0002 | 2026-05-27 | 🇮🇳 India | BPCL / HPCL / IOC | Bullish (conditional) | +15–25% OMCs | 1–3 months | 52% | ⏳ Too early |
| H-0003 | 2026-05-27 | 🇮🇳 India | Nifty IT (^CNXIT) | Bearish relative | -5–10% vs Nifty 50 | 1–3 months | 72% | ⏳ Too early |
| H-0004 | 2026-05-27 | 🇮🇳 India | Nifty FMCG (^CNXFMCG) | Bullish relative | +5–10% vs Nifty 50 | 1–3 months | 65% | ⏳ Too early |
| H-0005 | 2026-05-27 | 🇮🇳 India | TCS / INFY (TCS.NS) | Bearish (PE de-rating) | PE 22–25x → 14–18x | 3–18 months | 70% | ⏳ Too early |
| H-0006 | 2026-05-27 | 🇮🇳 India | USD/INR (USDINR=X) | INR Bearish | INR weaker; Auto sector -10–15% | 6–18 months | 58% | ⏳ Too early |
| H-0007 | 2026-05-27 | 🇺🇸 US | Micron (MU) | Bullish | +20–35% from ~$895 | 2 quarters | 65% | ⏳ Too early |
| H-0008 | 2026-05-27 | 🇺🇸 US | CRWD / PANW / ZS | Bullish (rotation) | CRWD +5–10%; ZS bounce +15–20% | 1–3 weeks | 62% | ⏳ Too early |
| H-0009 | 2026-05-27 | 🇺🇸 US | IWM / IYR / XLU / KRE | Bearish relative | -8–15% vs SPY | 6–12 months | 58% | ⏳ Too early |
| H-0010 | 2026-05-27 | 🇺🇸 US | AAPL / GOOGL / META | Phase 1 AAPL bullish vs GOOGL/META; Phase 2 reverse | Phase 1: AAPL outperforms by 5–10%; Phase 2: GOOGL/META +10–20% | Phase 1: now–Q3 2026; Phase 2: Q4 2026–Q1 2027 | 55% | ⏳ Too early |

---

## Resolved predictions

*No resolved predictions yet. First resolution expected: H-0008 (ZS rotation, 1–3 weeks) and H-0001 (NIFTY momentum, 1–4 weeks).*

| ID | Filed | Resolved | Instrument | Predicted | Actual | Match | Trust impact | Override type | Lesson |
|---|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — | — | — |

---

## Match key

| Symbol | Meaning |
|---|---|
| ✅ **Confirmed** | Direction correct AND magnitude within stated range |
| 🟡 **Partial** | Direction correct but magnitude off by >50%, or timing off |
| ❌ **Falsified** | Direction wrong OR KILLS watch-item triggered |
| ⏳ **Too early** | Timeframe has not elapsed |

## Trust impact key

| Symbol | Meaning |
|---|---|
| 🟢🟢 **High positive** | ≥70% confidence, confirmed with correct magnitude |
| 🟢 **Positive** | Correct direction, confidence matched outcome rate |
| ⚪ **Neutral** | Partial match or wrong with full transparent acknowledgment |
| 🔴 **Negative** | Wrong direction, acknowledged but without clear lesson |
| 🔴🔴 **High negative** | ≥75% confidence, wrong direction, or wrong without acknowledgment |

## Override type key (7 types)

1. **Macro override** — A macro event (rate decision, geopolitical shock, index-level selloff) overrode the specific causal chain
2. **Investor-type mismatch** — The investor type driving the move was not the one identified (e.g., retail drove the move, not institutional)
3. **Already priced in** — The market had priced the thesis before the prediction was filed; no additional move materialized
4. **Sentiment override** — Overall market sentiment (risk-on/risk-off) overwhelmed the stock-specific mechanism
5. **Factor rotation** — A sector/factor rotation (e.g., value vs. growth, large vs. small cap) moved the instrument regardless of the thesis
6. **Timing error** — The thesis is directionally correct but the predicted timeframe was wrong (too early or too late)
7. **Thesis error** — The causal mechanism itself was wrong; the assumed relationship did not exist or operated in reverse

---

## Calibration review history

| Review date | Hypotheses resolved | Direction accuracy (Active tier) | Calibration verdict | Key finding |
|---|---|---|---|---|
| — | — | — | — | — |

*First review due when ≥5 hypotheses resolve.*

---
*This file is the desk's permanent accuracy record. Its integrity is the product's trustworthiness. Append only.*
