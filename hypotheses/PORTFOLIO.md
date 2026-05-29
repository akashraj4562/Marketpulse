# Hypothesis Portfolio — Marketpulse

> The living master index of all hypotheses across all stages.
> hypothesis-validator owns and updates this after every validation cycle.
> hypothesis-generator and hypothesis-predictor add rows when new hypotheses are filed.

---

## Portfolio summary
*Updated daily after each cycle.*

| Metric | Count |
|---|---|
| **Active** (confidence ≥ 60%) | 6 |
| **Developing** (confidence < 60%) | 13 |
| **Predicted** (unvalidated, AI-generated) | 0 |
| **Retired** (disproven / expired) | 1 |
| **Total live** | 19 |
| **P1 hypotheses** (validate daily) | 6 |
| **P2 hypotheses** (validate every 48h) | 13 |
| **P3 hypotheses** (validate every 72h) | 0 |
| **Overdue for validation** | 0 |
| *Markets covered* | 🇮🇳 India (10), 🇺🇸 US (7), 🌐 Global macro (2) |
| *Last updated* | 2026-05-29 (red-team applied: H-0007 82%→65%, H-0003 78%→62%; Active avg now 66.5% — G8 breach resolved) |

---

## Priority queue — today's validation run
*hypothesis-validator populates this at the start of each daily cycle.*

| Priority | ID | Slug | Confidence | Market | Last validated | Due | Reason for priority |
|---|---|---|---|---|---|---|---|
| ~~P1~~ RETIRED | ~~H-0001~~ | ~~nifty-vix-compression-momentum~~ | ~~35%~~ | 🇮🇳 India | 2026-05-29 | N/A | Kill condition confirmed; ST thesis expired. See Retired section. |
| P1 🔴 | H-0002 | iran-deal-crude-india-relief | **50%** | 🇮🇳 India | 2026-05-29 | 2026-05-30 | −2% — CNBC "hope fades" (May 28); military escalation; nuclear enrichment + Hormuz unresolved; deal timeline extending |
| P1 🔴 | H-0003 | nifty-it-ai-disruption-underperformance | **62%** | 🇮🇳 India | 2026-05-29 | 2026-05-30 | −16% red-team: FII seller base depleted; -40% valuation reset largely done; MT leg largely played out |
| P1 🔴 | H-0007 | micron-hbm-ai-memory-supercycle | **65%** | 🇺🇸 US | 2026-05-29 | 2026-05-30 | −17% red-team: crowded trade (46 BUYs); Samsung HBM yield fix unmodeled; 168% YTD = mostly priced |
| P1 🔴 | H-0008 | zscaler-miss-cybersec-divergence | **63%** | 🇺🇸 US | 2026-05-29 | 2026-05-30 | +1% — CRWD +41.7% YTD near 52-wk high; ZS bounce leg permanently retired; thesis is now CRWD-only |
| P1 🔴 | H-0011 | crude-100-india-fiscal-rbi-hold | **49%** | 🇮🇳 India | 2026-05-29 | 2026-05-30 | +2% — US strikes pushed Brent +3% toward $97–99; primary catalyst re-activating; kill zone receding |
| P1 🔴 | H-0014 | us-nuclear-power-data-center-renaissance | **74%** | 🇺🇸 US | 2026-05-29 | 2026-05-30 | +2% — Meta 1,121 MW PPA confirmed (Constellation IR); deal cadence accelerating; narrative shifting utility→tech infra |
| P2 🟡 | H-0004 | fmcg-rural-demand-defensive-rotation | 65% | 🇮🇳 India | 2026-05-28 | 2026-05-30 | MT thesis; no new data; unchanged |
| P2 🟡 | H-0005 | india-it-structural-multiple-de-rating | 70% | 🇮🇳 India | 2026-05-28 | 2026-05-30 | LT thesis; Nifty IT −40% from highs strongly confirming; earnings season July 2026 is next key test |
| P2 🟡 | H-0006 | india-crude-dependence-inr-pressure | 58% | 🇮🇳 India | 2026-05-28 | 2026-05-30 | LT macro; crude falling = mild KILL pressure; structural thesis intact |
| P2 🟡 | H-0009 | fed-rate-hold-rate-sensitive-sectors | 58% | 🇺🇸 US | 2026-05-28 | 2026-05-30 | LT; next FOMC June 16-17 is key event — no change |
| P2 🟡 | H-0010 | bigtech-ai-capex-margin-then-revenue | 55% | 🇺🇸 US | 2026-05-28 | 2026-05-30 | MT; Q3 2026 earnings next test — no change |

---

## Active hypotheses (confidence ≥ 60%)

| ID | Slug | Market | Horizon | Confidence | Causality | Correlation | Instrument | Predicted direction | P-tier | Last validated |
|---|---|---|---|---|---|---|---|---|---|---|
| H-0003 | nifty-it-ai-disruption-underperformance | 🇮🇳 India | MT | **62%** | 72 | 28 | Nifty IT / TCS / INFY | Bearish relative -5–10% vs Nifty 50 | P1 | 2026-05-29 |
| H-0004 | fmcg-rural-demand-defensive-rotation | 🇮🇳 India | MT | 65% | 68 | 32 | Nifty FMCG / HINDUNILVR / ITC | Bullish +5–10% vs Nifty 50 | P2 | 2026-05-28 |
| H-0005 | india-it-structural-multiple-de-rating | 🇮🇳 India | LT | 70% | 78 | 22 | TCS / INFY / Nifty IT | Bearish PE 22–25x → 14–18x | P2 | 2026-05-28 |
| H-0007 | micron-hbm-ai-memory-supercycle | 🇺🇸 US | MT | **65%** | 85 | 15 | NASDAQ: MU / SOXX | Bullish +20–35% over 2 quarters | P1 | 2026-05-29 |
| H-0008 | zscaler-miss-cybersec-divergence | 🇺🇸 US | ST | **63%** | 65 | 35 | NASDAQ: CRWD / PANW | Bullish CRWD (ZS bounce leg retired) | P1 | 2026-05-29 |
| H-0014 | us-nuclear-power-data-center-renaissance | 🇺🇸 US | MT/LT | 74% | 88 | 12 | NYSE: CEG / VST / NLR | Bullish CEG +40–70% / VST +35–55% | P1 | 2026-05-29 |

**Horizon key:** `ST` = Short-term (≤4 weeks) / `MT` = Medium-term (1–3 months) / `LT` = Long-term structural (3–18+ months)

---

## Developing hypotheses (confidence < 60%)

| ID | Slug | Market | Horizon | Confidence | Causality | Correlation | Instrument | Predicted direction | P-tier | Last validated |
|---|---|---|---|---|---|---|---|---|---|---|
| H-0002 | iran-deal-crude-india-relief | 🇮🇳 India | MT | **50%** | 80 | 20 | BPCL / HPCL / IOC / NIFTY 50 | Bullish conditional +15–25% OMCs | P1 | 2026-05-29 |
| H-0011 | crude-100-india-fiscal-rbi-hold | 🇮🇳 India | MT | **49%** | 78 | 22 | USD/INR / Nifty Auto / Nifty Bank | INR Bearish; Auto/Bank -8–15% relative | P1 | 2026-05-29 |
| H-0006 | india-crude-dependence-inr-pressure | 🇮🇳 India | LT | 58% | 82 | 18 | USD/INR / Nifty Auto | INR Bearish; Auto Bearish | P2 | 2026-05-29 |
| H-0009 | fed-rate-hold-rate-sensitive-sectors | 🇺🇸 US | LT | 58% | 78 | 22 | IYR / XLU / IWM / KRE | Bearish relative -8–15% vs SPY | P2 | 2026-05-29 |
| H-0010 | bigtech-ai-capex-margin-then-revenue | 🇺🇸 US | MT | 55% | 72 | 28 | AAPL / GOOGL / META | Phase 1: AAPL bullish vs GOOGL/META; Phase 2 reverse | P2 | 2026-05-29 |
| H-0012 | india-defense-indigenization-supercycle | 🇮🇳 India | LT | 58% | 82 | 18 | NSE: HAL / BEL / BDL | Bullish HAL +30–50% / BEL +25–40% | P2 | 2026-05-28 |
| H-0013 | india-private-bank-nim-compression | 🇮🇳 India | MT | 52% | 80 | 20 | NSE: HDFCBANK / KOTAKBANK | Bearish relative -10–18% vs Nifty 50 | P2 | 2026-05-28 |
| H-0015 | india-pharma-us-export-rerating | 🇮🇳 India | MT | 55% | 72 | 28 | NSE: SUNPHARMA / DRREDDY | Bullish +15–25% over 2–4 quarters | P2 | 2026-05-28 |
| H-0016 | nvidia-custom-silicon-displacement-risk | 🇺🇸 US | LT | 45% | 68 | 32 | NASDAQ: NVDA / SOXX | Bearish -20–35% from peak | P2 | 2026-05-28 |
| H-0017 | india-real-estate-premiumization-upcycle | 🇮🇳 India | LT | 57% | 74 | 26 | NSE: DLF / GODREJPROP / PRESTIGE | Bullish DLF +25–35% / GPL +30–40% | P2 | 2026-05-28 |
| H-0018 | usd-structural-weakness-em-outperformance | 🌐 Global | LT | 50% | 65 | 35 | DXY / GLD / EEM / Nifty | DXY Bearish; Gold/EM Bullish | P2 | 2026-05-28 |
| H-0019 | india-ev-ecosystem-tata-mahindra | 🇮🇳 India | MT | 53% | 75 | 25 | NSE: TATAMOTORS / M&M | Bullish Tata +20–35% / M&M +15–25% | P2 | 2026-05-28 |
| H-0020 | us-consumer-staples-margin-recovery | 🇺🇸 US | MT | 55% | 76 | 24 | NYSE: PG / CL / XLP | Bullish XLP +12–18% / PG +15–20% | P2 | 2026-05-28 |

---

## Predicted hypotheses (AI-generated, unvalidated)

| ID | Slug | Predicted by | Basis for prediction | Initial confidence | Severity | Sectors | Created |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — |

---

## Retired hypotheses

| ID | Slug | Final confidence | Retirement reason | Retired date | Key learning |
|---|---|---|---|---|---|
| H-0001 | nifty-vix-compression-momentum | 35% | Kill condition triggered: Nifty 23,649.95 < 23,800 on May 28 close. ST horizon (1–2 weeks from May 27) expired. FII structural outflow −₹33,815Cr MTD overrode VIX compression signal. | 2026-05-29 | VIX compression is a necessary but insufficient momentum catalyst. Multi-force confluence hypothesis fails when the flow premise (FII return) reverses within 2 days. Confidence degraded from 68% at creation to 35% at retirement in 2 sessions — the speed of confidence decay is itself a quality signal. |

---

## Sector index
*For rapid lookup — all live hypotheses grouped by primary sector.*

| Sector | Active | Developing | Predicted | Key hypotheses |
|---|---|---|---|---|
| India Pharma | 0 | 1 | 0 | H-0015 (SUNPHARMA/DRREDDY, bullish MT) |
| India FMCG | 1 | 0 | 0 | H-0004 (HINDUNILVR/ITC, bullish MT) |
| India Energy / OMCs | 0 | 1 | 0 | H-0002 (BPCL/HPCL/IOC, conditional bullish MT) |
| India IT | 2 | 0 | 0 | H-0003 (MT bearish relative), H-0005 (LT PE de-rating) |
| India Defense | 0 | 1 | 0 | H-0012 (HAL/BEL/BDL, bullish LT) |
| India Banking (Private) | 0 | 1 | 0 | H-0013 (HDFCBANK/KOTAKBANK, bearish MT) |
| India Real Estate | 0 | 1 | 0 | H-0017 (DLF/GPL/PRESTIGE, bullish LT) |
| India Autos / EV | 0 | 2 | 0 | H-0006 (INR/crude macro), H-0019 (TATAMOTORS/M&M, bullish MT) |
| Broad India Market | 0 | 2 | 0 | H-0011 (crude/fiscal MT), H-0018 (partial — EM outperformance) |
| US Semiconductors | 1 | 1 | 0 | H-0007 (MU/SOXX, bullish MT), H-0016 (NVDA bearish LT) |
| US Nuclear / Power | 1 | 0 | 0 | H-0014 (CEG/VST, bullish MT/LT) |
| US Cybersecurity | 1 | 0 | 0 | H-0008 (CRWD/PANW/ZS, rotation ST) |
| US Big Tech | 0 | 1 | 0 | H-0010 (AAPL/GOOGL/META, 2-phase MT) |
| US Consumer Staples | 0 | 1 | 0 | H-0020 (PG/CL/XLP, bullish MT margin recovery) |
| US Rates / Rate-sensitive | 0 | 1 | 0 | H-0009 (IYR/XLU/IWM/KRE, bearish LT) |
| Global Macro / FX | 0 | 1 | 0 | H-0018 (DXY bearish / EM/gold bullish LT) |
| Global Commodities / Crude | 0 | 1 | 0 | H-0006 (INR/crude LT) |

---

## Calibration tracker
*How accurate have our confidence scores been? Updated when hypotheses are retired.*

| Confidence band | Hypotheses retired | % that confirmed | Calibration status |
|---|---|---|---|
| 80–100% | 0 | — | Not enough data |
| 60–79% | 0 | — | Not enough data |
| 40–59% | 0 | — | Not enough data |
| 20–39% | 1 | 0% | H-0001 retired (killed — thesis failed; started at 68%, decayed to 35%) |
| 0–19% | 0 | — | Not enough data |

> Target: 80–100% band should confirm at ≥80%. 60–79% at ≥60%. If we're systematically off, the validator is miscalibrated.

---

## Next hypothesis ID
**H-0021** ← Use this for the next new hypothesis, then increment.
