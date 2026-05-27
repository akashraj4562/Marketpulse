# Marketpulse

> A personal capital markets research desk that generates, scores, and validates causal hypotheses about market events — and surfaces them as a live, portfolio-aware web view.

Built by a product manager, for a product manager. Every engineering decision was made with the same rigor applied to product decisions: explicit tradeoffs, proof-of-value gates, guardrail metrics, and a trust ledger.

---

## What it does

Marketpulse is two systems running in parallel:

**1. Hypothesis engine** — a crew of 14 specialist AI agents that continuously scan world events, trace causal chains to capital market outcomes, and maintain a scored portfolio of falsifiable predictions. Every hypothesis carries: a specific instrument + direction + magnitude + timeframe, a causality/correlation split, confidence calibrated against real evidence, and at minimum two falsifiable watch-items (one that confirms, one that kills).

**2. Research web view** — a live Express.js server that parses the hypothesis markdown files and renders them as a mobile-first card dashboard at `localhost:3737`. Cards expand to show price charts (real Yahoo Finance data), plain-English translations, company selectors, confidence decay curves, and a rating/feedback system that feeds back into the hypothesis engine.

---

## Technical depth

### Hypothesis data model

Each hypothesis is a structured markdown file with fields parsed by a custom regex engine in `web/server.js`. The parser extracts:
- Confidence, causality, correlation scores
- Capital market prediction block (instrument, direction, magnitude, timeframe)
- Watch-items (CONFIRMS / KILLS)
- Exchange-qualified instrument codes parsed via a 3-pass regex: exchange codes `(NSE: TCS)`, Yahoo Finance index codes `(^CNXIT)`, then plain token fallback

Files live in `hypotheses/active/`, `hypotheses/developing/`, `hypotheses/predicted/`, `hypotheses/retired/` — the folder is the status. The parser reads all four and assembles the portfolio on every API call, so edits to hypothesis files are reflected instantly on refresh.

### Price charts

Every expanded hypothesis card shows a real-time price chart built on Chart.js 4.4.3 with three layers:

- **Historical** (indigo solid line) — real OHLC data from Yahoo Finance via `yahoo-finance2` v3, using the `chart()` API with `validateResult: false` to handle NSE index null-currency fields
- **Forecast** (coloured dashed line) — directional prediction extrapolated from the last historical close toward the hypothesis's stated magnitude range
- **Confidence band** (fading fill) — starts at the hypothesis's stated confidence (e.g. 65%), degrades linearly to a 45% noise floor across the prediction window, while the band width widens 3.5× by end of window

Prediction window auto-scales by horizon class: ST → 21 days, MT → 90 days, LT → 180 days. Users can override the historical window with a 7d/14d/30d/90d selector. A company selector above the chart lets users switch the chart to any impacted company in the instrument field.

Ticker resolution is a 5-step priority chain: exchange-qualified code → primary segment first token → TICKER_MAP scan (longest key first, regex word-boundary match) → bare NSE fallback → Yahoo index fallback.

### Portfolio-aware prioritisation (BL-003)

The most architecturally interesting feature. Every hypothesis is assigned a `personalWeight` (0–1) based on the owner's actual positions:

- **Currently held stocks**: weight = **1.0**
- **Sold positions**: weight decays exponentially — `w = e^(−λ·t)` where λ = 0.003 and t = days since last transaction. Half-life ≈ 231 days (a position sold 8 months ago still carries ~50% relevance)
- **Never transacted**: weight = 0

The `personalRelevanceScore = personalWeight × confidence` is used to sort hypotheses when "Portfolio mode" is active. A hypothesis about TCS falling 20% that the owner holds rises above a higher-confidence hypothesis about an instrument they've never touched.

**Data pipeline** (two phases):
- Phase 1 (built): synthetic test data via `POST /api/holdings-load-test`; manual sync via `POST /api/holdings-sync`
- Phase 2 (specced as BL-013): Google Apps Script reads Gmail from 4 configured senders (INDMoney, CDSL, Motilal Oswal, Groww) → parses transaction emails with per-broker regex → POSTs to `/api/holdings-sync` every 6 hours

Holdings are persisted in `holdings.json`. The `/api/hypotheses` endpoint joins holdings at query time — `computePersonalWeight()` runs against all tickers extracted from each hypothesis's instrument field (primary + company selector chips), taking the maximum weight across all matched instruments. The UI shows `🎯 Held` / `📋 Recent` / `🕐 Past` badges; a weight bar appears in portfolio mode only.

Portfolio mode state persists to `localStorage` so it survives page reloads. The feature switches cleanly off via `POST /api/holdings-clear`.

### Owner feedback loop

**Ratings** — every hypothesis card has a 👍/👎 for today's date (toggle-off if same rating clicked again). Ratings are stored in `ratings.json` keyed by `hypId → date → {rating, timestamp}`.

**Corroboration** — the `/api/corroborate/:id?date=YYYY-MM-DD` endpoint fetches Yahoo Finance price data for any historical date and compares actual direction against predicted direction. This is exposed on the History page (see below) but also consumed by the `hypothesis-validator` agent as a soft evidence signal.

**Feedback integration into the research engine** — the `hypothesis-generator` agent reads both `ratings.json` and `feedback.json` at the start of every daily scan. Corroborated 👍 ratings (owner memory + market data agree) add +3% confidence. Corroborated 👎 ratings subtract −5%. Feature request text is mined for coverage gaps; general feedback is evaluated as potential new signal.

### History page

A standalone page at `/history` that lets the owner navigate to any past date (left/right arrows or calendar picker), see that day's hypothesis cards, and rate from memory. The critical UX decision: **corroboration reveals only after the user rates** — not before — so the owner's rating reflects genuine memory, not anchoring to market data. After voting, the Yahoo Finance verdict appears automatically.

### Feedback classification

Free-text feedback is auto-classified on submission using a keyword regex classifier:
- `bug` keywords → P0, stops all feature work (per Bug Escalation Protocol in the PM agent)
- `feature` keywords → P2, queued in backlog
- `general` → P3, logged

All entries persist to `feedback.json` with type, priority, timestamp, and hypothesis reference.

### Automatic quality testing

Three scheduled crons (daily/weekly/monthly) run guardrail sweeps against the hypothesis portfolio:
- **Daily** (weekdays 9:17am): G4 staleness check, G8 overconfidence cap, ST momentum check
- **Weekly** (Mondays 9:23am): Full WT-01–WT-05 guardrail sweep
- **Monthly** (1st of month 9:41am): MT-01–MT-05 calibration review

Crons are session-only (7-day expiry); a recreation recipe lives in `RUNBOOK.md`.

---

## Agent crew (14 specialists)

| Agent | Role |
|---|---|
| `research-director` | Orchestrates the full thesis pipeline and daily hypothesis cycle |
| `signal-scout` | Verifies signals, enforces T1/T2 source quality |
| `causal-chain-analyst` | Builds mechanism-explicit causal chains, link by link |
| `sector-specialist` | Grounds chains in real industry mechanics and cost structures |
| `capital-markets-analyst` | Quantifies financial impact, names winners/losers |
| `strategy-consultant` | Draws strategic implications for affected companies |
| `red-team-skeptic` | Attacks every chain — "chain unsupported" verdict cannot be overridden without logged rationale |
| `behavioral-psychologist` | Surfaces psychological mechanisms and behavioral leading indicators |
| `market-signal-reader` | Compares predictions to actual price action; diagnoses override types |
| `hypothesis-generator` | Continuous hypothesis factory; reads owner ratings as coverage gap signals |
| `hypothesis-validator` | Daily evidence engine; uses corroboration-gated owner ratings as soft calibration |
| `hypothesis-predictor` | Weekly speculative prediction pass |
| `socratic-coach` | Socratic training drills with blind-spot tracking |
| `product-manager` | Product quality, feature prioritisation, guardrail monitoring |

---

## Product management system

The desk runs a full PM system alongside the research engine:

**North Star Metric:** Calibrated Prediction Accuracy (CPA) — of all resolved Active-tier hypotheses, does the confirmation rate match the stated confidence band? (75%+ confidence should confirm ≥75% of the time.)

**8 guardrail metrics** enforced automatically:
- G1: No confidence delta >5% without a same-day evidence log entry
- G2: Active-tier directional accuracy must not fall below 50% over any rolling 10-hypothesis window
- G3: Zero T3/T4 sources cited as specific numbers
- G4: No P1 hypothesis unvalidated for >3 days
- G5: No Active hypothesis with Causality < 40
- G6: Every Active hypothesis must have checkable CONFIRMS and KILLS items
- G7: Chart data must be within 5 trading days of current
- G8: Portfolio-wide average confidence must not exceed 70%

**Bug escalation protocol (non-negotiable):** Production bugs are always P0. There are no P1 bugs. All feature work stops until the P0 is resolved.

**Extended RICE prioritisation:** `(Reach × Impact × Confidence / Effort) × Foundation Multiplier × NSM Multiplier` — where foundation-layer features that enable 3+ future capabilities get ×1.5, and features that directly move CPA get ×1.25.

---

## Roadmap themes

| Theme | Status |
|---|---|
| 🎯 Prediction Accuracy | Active — source quality gates, calibration feedback loop via owner ratings |
| ⚡ Validation Velocity | Partial — daily cycle built; cron automation pending (BL-004) |
| 🌍 Coverage Breadth | Active — 10 hypotheses across India + US; Europe/Asia next |
| 📱 Output Clarity | Active — charts, TX section, portfolio mode, history page all shipped |
| 🧠 Owner Intelligence | Structural — ratings loop, history page, socratic coach; calibration dashboard next |
| 🏗️ Platform Leverage | Future — SQLite migration, REST API (Q4 2026) |

---

## Backlog highlights

| ID | Feature | Priority | Status |
|---|---|---|---|
| BL-003 | Portfolio mode (personalWeight sort + badges) | P1 | ✅ Done |
| BL-004 | Scheduled daily validation cron | P1 | Proposed |
| BL-005 | Watch-item scanner (auto-flag CONFIRMS/KILLS) | P2 | Proposed |
| BL-006 | Calibration dashboard | P2 | Proposed |
| BL-013 | Gmail holdings sync (read-only, 4 senders) | P1 | Specced |

---

## Running locally

```bash
# Prerequisites: Node.js 20+
cd web
npm install
node server.js
# Open: http://localhost:3737
# iPhone (same WiFi): http://192.168.1.14:3737
```

### Test portfolio mode with synthetic data
```bash
# Load 6-position test dataset
curl -X POST http://localhost:3737/api/holdings-load-test

# Returns weight calculations:
# TCS.NS  → held 50 shares   → weight 1.0
# MU      → held 100 shares  → weight 1.0
# CRWD    → sold 60d ago      → weight 0.833
# AAPL    → sold 198d ago     → weight 0.551
# BPCL.NS → sold 377d ago     → weight 0.322

# Then open http://localhost:3737, click "Portfolio" toggle in header
# Cards sort by weight × confidence — held stocks float to top

# Clear test data when done
curl -X POST http://localhost:3737/api/holdings-clear
```

### Gmail sync (when ready)
```bash
# Accept a sync payload from Google Apps Script
curl -X POST http://localhost:3737/api/holdings-sync \
  -H "Content-Type: application/json" \
  -d '{"transactions":[{"date":"2026-05-01","direction":"BUY","qty":50,"name":"TCS","isin":"INE467B01029"}],"syncedAt":"2026-05-28T10:00:00Z"}'
```

---

## File structure

```
marketpulse/
├── CLAUDE.md                      ← Desk constitution
├── RUNBOOK.md                     ← All prompts + cron recreation recipe
├── README.md                      ← This file
├── hypotheses/
│   ├── PORTFOLIO.md               ← Master index (10 live hypotheses)
│   ├── active/                    ← Confidence ≥ 60%
│   ├── developing/                ← Confidence < 60%
│   ├── predicted/                 ← AI-generated, unvalidated
│   └── retired/                   ← Closed hypotheses
├── web/
│   ├── server.js                  ← Entire application (Express + inline HTML, ~2100 lines)
│   ├── holdings.json              ← Position data (auto-managed)
│   ├── ratings.json               ← Owner hypothesis ratings
│   ├── feedback.json              ← Classified feedback log
│   └── package.json
├── docs/
│   ├── memory/
│   │   ├── PROJECT-STATE.md       ← Session state (read at session start)
│   │   ├── DECISIONS.md           ← Architectural decisions (append-only)
│   │   └── SESSIONS.md            ← Rolling session log
│   └── product/
│       └── BACKLOG.md             ← PM-quality feature backlog with RICE scores
└── .claude/
    ├── agents/                    ← 14 specialist agent definitions
    └── skills/                    ← signal-to-thesis, daily-hypothesis-cycle,
                                      training-drill, auto-test, dev-workflow,
                                      hypothesis-ops
```

---

*Not investment advice. Analytical output for research and training purposes only.*
