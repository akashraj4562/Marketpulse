# Marketpulse — Test Log
> The running record of all quality checks, guardrail sweeps, and test cycle results.
> Maintained by the product-manager agent.
> Format: most recent entry first within each section.

---

## Guardrail status dashboard

*Updated at every weekly test cycle (WT-01). All 8 guardrails must show PASS before any new feature work proceeds.*

| Guardrail | Last checked | Status | Notes |
|---|---|---|---|
| **G1** Confidence integrity | 2026-05-27 | ✅ PASS | No confidence changes yet — portfolio just filed |
| **G2** Direction accuracy floor | 2026-05-27 | ✅ PASS | No resolved hypotheses yet (floor not yet testable) |
| **G3** Source quality | 2026-05-27 | ✅ PASS | All 10 hypotheses include source quality notes; all numbers from T1/T2 |
| **G4** Staleness cap | 2026-05-28 | ✅ PASS | All 11 hypotheses validated within cadence (P1: 0 days, P2: 1 day) |
| **G5** Causality floor | 2026-05-27 | ✅ PASS | Lowest Causality in portfolio: 45 (H-0001). All ≥45. |
| **G6** Watch-item specificity | 2026-05-27 | ✅ PASS | Spot-checked H-0007, H-0008, H-0003. Watch items are event-specific and checkable. |
| **G7** Chart data freshness | 2026-05-27 | ✅ PASS | All 10 hypotheses returning real data. Last bar 2026-05-27 (today). |
| **G8** Overconfidence cap | 2026-05-28 | ❌ **BREACH** | Active-tier avg = **72.4%** (cap: 70%). Top 3: H-0007 82%, H-0003 75%, H-0005/H-0008 70%. Red-team review required. |

---

## Daily test cycle log

### DT — 2026-05-28

**D-01 G4 Staleness:** ✅ PASS — All 11 hypotheses within cadence.
| ID | Tier | Last validated | Days ago | Limit | Result |
|---|---|---|---|---|---|
| H-0003 | P1 | 2026-05-28 | 0 | 3d | ✅ |
| H-0007 | P1 | 2026-05-28 | 0 | 3d | ✅ |
| H-0008 | P1 | 2026-05-28 | 0 | 3d | ✅ |
| H-0001 | P1 | 2026-05-28 | 0 | 3d | ✅ |
| H-0002 | P1 | 2026-05-28 | 0 | 3d | ✅ |
| H-0011 | P1 | 2026-05-28 | 0 | 3d | ✅ |
| H-0004 | P2 | 2026-05-27 | 1 | 6d | ✅ |
| H-0005 | P2 | 2026-05-27 | 1 | 6d | ✅ |
| H-0006 | P2 | 2026-05-27 | 1 | 6d | ✅ |
| H-0009 | P2 | 2026-05-27 | 1 | 6d | ✅ |
| H-0010 | P2 | 2026-05-27 | 1 | 6d | ✅ |

**D-02 G8 Overconfidence:** ❌ **BREACH** — Active-tier average = **72.4%** (cap: 70%).
- H-0007: 82% · H-0003: 75% · H-0005: 70% · H-0008: 70% · H-0004: 65%
- Average: (82+75+70+70+65) / 5 = **72.4%**
- For reference — all-hypotheses average (Active + Developing): (82+75+70+70+65+58+58+56+55+52+42) / 11 = 62.1% ✅
- **Required action:** Red-team review of top 3 by confidence — H-0007 (82%), H-0003 (75%), H-0005 (70%). Downgrade at least one if evidence does not support current score. Freeze new hypothesis filings until review complete.
- **Context note:** H-0007 at 82% is supported by MU Q2 revenue +196% YoY, HBM sold out through 2026, guidance raised — score appears individually defensible. H-0003 at 75% confirmed by ongoing FII selling + AI disruption narrative. H-0005 at 70% is a LT structural thesis still early-stage. Red-team to decide if any should be trimmed.

**D-03 ST Momentum:** ✅ PASS — 2 ST hypotheses checked (H-0001, H-0008), both validated today (0 days). Confidence already updated this cycle. No stale momentum flags.

**Overall:** ❌ **1 BREACH — G8.** No G4 breach. No ST staleness. PushNotification sent.

---

## Weekly test cycle log

### WT — 2026-05-27 (initial state)

**WT-01 Guardrail sweep:** PASS — all 8 guardrails passing. See dashboard above.

**WT-02 Random hypothesis audit:**
- H-0003 (Nifty IT bearish): One-liner clear ✅. Confirmed source: Motley Fool citing earnings (T1) for HCL Tech AI costs ✅. CONFIRMS item "Nifty IT Q1 FY27 results show revenue growth <5% vs Nifty 50 EPS growth >10%" — checkable via NSE announcement in ~6 weeks ✅.
- H-0008 (ZS rotation): One-liner clear ✅. ZS -29% confirmed by CNBC (T1) ✅. CONFIRMS "CRWD outperforms PANW+ZS combined on any 5-day rolling basis" — checkable daily on Yahoo Finance ✅. KILLS "PANW or CRWD also issues negative guidance within 30 days" — specific, checkable ✅.

**WT-03 Chart data freshness:**
```
H-0001: ^NSEI   hist=30  last=2026-05-27 ✅
H-0002: BPCL.NS hist=30  last=2026-05-27 ✅
H-0003: ^CNXIT  hist=30  last=2026-05-27 ✅
H-0004: ^CNXFMCG hist=30 last=2026-05-27 ✅
H-0005: TCS.NS  hist=30  last=2026-05-27 ✅
H-0006: USDINR=X hist=30 last=2026-05-27 ✅
H-0007: MU      hist=30  last=2026-05-27 ✅
H-0008: CRWD    hist=30  last=2026-05-27 ✅
H-0009: IWM     hist=30  last=2026-05-27 ✅
H-0010: AAPL    hist=30  last=2026-05-27 ✅
```

**WT-04 Prediction momentum check:**
Too early for all hypotheses (all filed today). Flagged for re-check: H-0008 (ST, ZS rotation, check in 5 trading days for CRWD/PANW movement).

**WT-05 New hypothesis quality gate:** All 10 passed quality gate at time of filing. Portfolio launched clean.

**Overall test result:** ✅ PASS — Portfolio launched in good standing. No breaches. Trust ledger at baseline (10 predictions, 0 resolved, 0 trust events).

---

## Monthly calibration log

| Date | Hypotheses resolved | Direction accuracy | Calibration verdict | Actions taken |
|---|---|---|---|---|
| — | — | — | First review pending | Due when ≥5 resolve |

---

## Known issues / tech debt

| ID | Issue | Severity | Detected | Status |
|---|---|---|---|---|
| TL-001 | USD/INR (USDINR=X) prediction magnitude is stated in % terms but the instrument is a currency rate. A "bearish INR" prediction needs a price level target (e.g., "USD/INR > 87") not just "INR weaker." | Medium | 2026-05-27 | Open — needs update in H-0006 on next validation |
| TL-002 | H-0010 (Big Tech capex) is a two-phase prediction. PREDICTION-LEDGER only tracks single outcomes. The Phase 1 and Phase 2 outcomes need separate tracking rows. | Low | 2026-05-27 | Open — add two rows when Phase 1 resolves |
| TL-003 | PORTFOLIO.md average confidence calculation is manual. Should be automated in weekly test cycle. | Low | 2026-05-27 | Open — future automation |

---

## Trust events log

*High-trust-impact events (positive or negative) are recorded here separately from the full ledger.*

| Date | Event | Type | Trust impact | Response |
|---|---|---|---|---|
| — | — | — | — | — |

*No trust events yet. First expected: H-0008 resolution (CRWD/ZS rotation, 1–3 weeks).*

---

## Quarterly retrospectives

| Quarter | Date | CPA (Active tier) | Key finding | Action taken |
|---|---|---|---|---|
| Q2 2026 | Due ~2026-09-01 | — | — | — |

---
*This file records the desk's quality discipline. A desk that tests is a desk the owner can trust. A desk that doesn't test is a desk that will eventually fail publicly.*
