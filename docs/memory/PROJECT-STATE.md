# Marketpulse — Project State
> Updated at the end of every session. Read this at the start of every session before doing anything else.
> Format: most recent state is always at the top of each section.

---

## Current system status

| Component | Status | Notes |
|---|---|---|
| **Web view** | ✅ Running on port 3737 | `cd web && node server.js` |
| **Hypothesis portfolio** | ✅ 11 live hypotheses (6 India, 5 US→4 US) — 5 Active, 6 Developing | Next ID: H-0012 |
| **Price charts** | ✅ Live via Yahoo Finance (yahoo-finance2 v3) | Real data + forecast band |
| **TX (Plain English)** | ✅ Live — AI enabled | `web/.env` set; Haiku generates on card open; cached in `tx-cache.json` |
| **AI TX generation** | ✅ Enabled | ANTHROPIC_API_KEY loaded via dotenv from `web/.env` |
| **Company selector** | ✅ Live — P0 fixed | Ticker label updates on every company switch |
| **HPCL chart** | ✅ Fixed | `?ticker=HPCL.NS` routes through TICKER_MAP → `HINDPETRO.NS` |
| **Daily hypothesis cycle** | ✅ Run twice 2026-05-28 | AM + PM runs; H-0001 kill condition triggered, H-0011 → developing, H-0002 reversed up |
| **Auto-test crons** | ✅ Active (session-only) | Daily 9:17am, Weekly Mon 9:23am, Monthly 1st 9:41am |
| **Memory auto-save** | ✅ Active (every 45 min) | PROJECT-STATE.md + SESSIONS.md checkpoint |
| **Market switcher** | ✅ All/India/US/Global tabs | Auto-detected from instrument field |
| **Agent crew** | ✅ 17 agents configured | 14 Marketpulse + PM agents added to ClearCart & MicroManga |
| **Git** | ✅ Clean — pushed | Latest commit: 0ac602e (PM cycle: H-0001 kill, H-0002 reversal) |
| **Security hardening** | ✅ Done | .gitignore, history scrubbed, security-privacy-guardian agent |
| **Mobile fix** | ✅ Done | Chart.js `defer` + `catch(err){}` + apostrophe bug fixed |
| **BL-013 Gmail sync** | 📋 Backlog | Full spec in BACKLOG.md; server side already built |
| **BL-014 Mobile cycle trigger** | 📋 Backlog P2 | Designed (Option B review-then-apply); not yet built |

---

## What was built (most recent first)

### 2026-05-28 — Session 7 (checkpoint 3)
- **PM cycle run**: Nifty 23,649 < 23,800 kill level → H-0001 → developing (42%); H-0002 reversed to 52% (WTI below $90, deal progressing); H-0007 → 82% (MU $928, SK Hynix $1T); H-0011 → developing (56%). Portfolio: 5 Active, 6 Developing. Pushed 0ac602e.
- **TX toggle + retry shipped**: 📝/✨ badge, 🔄 retry button, tap-to-toggle. Committed 1c17bc2.
- **AM cycle**: 5 P1s validated, H-0011 filed, AI TX + dotenv enabled. 3 P0 bugs fixed. BL-014 added to backlog.

### 2026-05-28 — Session 6
- **Security hardening**: root `.gitignore` added (covers node_modules, holdings.json, feedback.json, ratings.json, .env*); git history scrubbed via `filter-branch + gc`; `security-privacy-guardian.md` agent created with 5-section pre-publication gate checklist; security gate run — CLEAR TO PUSH verdict.
- **Mobile fix**: Chart.js CDN script was a blocking `<script>` in `<head>` — added `defer` so page renders immediately. Also fixed bare `catch{}` → `catch(err){}` for iOS compatibility (bare catch is ES2019, could fail on older Safari). Fixed `loadData` to show specific error messages.
- **npm reinstall**: node_modules/express was missing from disk; `npm install` restored it.
- **BL-003 Portfolio mode** fully built and tested (see Session 5 entry below)

### 2026-05-28 — Session 5
- **BL-003 Portfolio mode** fully built and tested: personalWeight decay (λ=0.003), 6 API endpoints, 🎯/📋/🕐 badges, weight bar, portfolio sort, toggle with localStorage persistence. Test verified correct weights. Holdings cleared — feature off cleanly.
- **README** written: full showcase with architecture, formula explanations, agent crew table, PM system, roadmap themes, run instructions.
- **BL-013 Gmail sync** specced in BACKLOG.md.
- **PM roadmap themes** defined for all 3 projects.

### 2026-05-27 — Session 4 (in progress)
- **Bug P0 escalation protocol** added to all three PM agents — production bugs are always P0, feature work stops until fixed
- **Feedback → hypothesis training loop**: `hypothesis-generator.md` + `hypothesis-validator.md` now read `ratings.json` + `feedback.json`; corroboration-gated soft evidence weighting
- **BACKLOG.md** updated: BL-007–012 all marked Done
- **Gmail → portfolio pipeline designed (BL-003 path)**: Google Apps Script reads INDMoney/CDSL/Groww/Motilal transaction emails → POST `/api/holdings-sync` → `holdings.json` → `personalWeight` per hypothesis card. Recency decay: e^(−0.003 × days). ISIN→ticker map + nameToTicker fallback. "Portfolio" sort tab in web view. Not yet built in server.js — full spec written in session.

### 2026-05-27 — Session 3
- **TX (Plain English) section** in every expanded card: 4 bullets translating the hypothesis into layman's terms (what's happening, the call, confidence, what to watch)
- **Company selector** above each chart: pill buttons for every company in the instrument field; click switches the chart to that company's price data
- **Chart API ticker override**: `/api/chart-data/:id?ticker=PANW` lets frontend swap any ticker
- **Auto-test skill** `.claude/skills/auto-test/SKILL.md` — procedural memory for daily/weekly/monthly quality checks
- **Three automatic crons**: daily (weekdays 9:17am), weekly Mondays 9:23am, monthly 1st 9:41am + memory save every 45 min
- **PM profile ported to all projects**: ClearCart `.claude/agents/product-manager.md`, MicroManga `.claude/agents/product-manager.md` — both MAANG-level with NSM, guardrails, trust ledger, roadmap themes, proof of value gate
- **RUNBOOK.md** updated with cron recreation recipe for session restarts

### 2026-05-27 — Session 2
- **Price charts in every hypothesis card**: real Yahoo Finance data + confidence-degrading prediction band
  - Historical line (indigo, solid) + Forecast line (green/red dashed) + Confidence band (fading fill)
  - X-day selector: 7d / 14d / 30d / 90d; Y prediction window auto-set by horizon (ST→21d, MT→90d, LT→180d)
  - Confidence degrades visually from hypothesis confidence (e.g. 65%) to noise floor (45%) across Y days
  - Ticker resolution: exchange-qualified codes first (NSE: NIFTYIT), then primary segment, then TICKER_MAP
  - All 10 hypotheses chart correctly: ^NSEI, BPCL.NS, ^CNXIT, ^CNXFMCG, TCS.NS, USDINR=X, MU, CRWD, IWM, AAPL
- **Memory system created**: this file, DECISIONS.md, SESSIONS.md, dev-workflow skill, hypothesis-ops skill

### 2026-05-27 — Session 1
- Capital market prediction pivot (primary output is now instrument + direction + magnitude)
- 10 hypotheses filed: H-0001–H-0006 (India), H-0007–H-0010 (US)
- Web view: Express.js server, vanilla HTML, dark mode, card layout, mobile-responsive
- Market switcher strip (All/India/US/Global)
- Filter pills (All/Active/Developing/ST/MT/LT/Bullish/Bearish)
- Manual refresh button (↻)
- Source quality tiers (T1–T4) embedded in signal-scout
- Product manager agent with 10-step PM mental model
- Feature backlog: BL-001 (mobile done), BL-002 (refresh done), BL-003 (portfolio-aware, pending)

---

## What's in flight / next

| Priority | Item | Description |
|---|---|---|
| **P1** | BL-003 Portfolio-aware prioritization | User shares holdings in `docs/portfolio/HOLDINGS.md`; web view cross-references hypotheses with holdings; Impact Score = confidence × magnitude × exposure |
| **P1** | Daily validation run | Run hypothesis-validator + market-signal-reader against today's closing prices |
| **P2** | Hosting | User wants this accessible publicly; ngrok failed; Vercel/Railway are options |
| **P2** | H-0011+ | Continue filing new hypotheses as market events unfold |
| **P3** | BL-004 (unplanned) | Push notifications / alerts when CONFIRMS/KILLS watch items trigger |

---

## Active hypotheses snapshot

| ID | Market | Horizon | Conf | Status | Instrument | Direction |
|---|---|---|---|---|---|---|
| H-0001 | 🇮🇳 India | ST | 68% | Active | ^NSEI | Bullish |
| H-0002 | 🇮🇳 India | MT | 52% | Developing | BPCL.NS | Bullish (conditional) |
| H-0003 | 🇮🇳 India | MT | 72% | Active | ^CNXIT | Bearish (relative) |
| H-0004 | 🇮🇳 India | MT | 65% | Active | ^CNXFMCG | Bullish (relative) |
| H-0005 | 🇮🇳 India | LT | 70% | Active | TCS.NS | Bearish (PE de-rating) |
| H-0006 | 🇮🇳 India | LT | 58% | Developing | USDINR=X | INR Bearish |
| H-0007 | 🇺🇸 US | MT | 65% | Active | MU | Bullish |
| H-0008 | 🇺🇸 US | ST | 62% | Active | CRWD | Bullish (rotation) |
| H-0009 | 🇺🇸 US | LT | 58% | Developing | IWM | Bearish (relative) |
| H-0010 | 🇺🇸 US | MT | 55% | Developing | AAPL | Phase 1 bullish, Phase 2 reverse |

---

## Server start instructions

```bash
# Start web view
cd "/Users/priyanka/Desktop/Akash Claude/marketpulse/web"
PATH="/Users/priyanka/node-v24.16.0-darwin-arm64/bin:$PATH" node server.js

# Runs on:
# http://localhost:3737
# http://192.168.1.14:3737  ← iPhone on same WiFi
```

---

## Key file map

| File | Purpose |
|---|---|
| `CLAUDE.md` | Desk constitution — read every session |
| `RUNBOOK.md` | Prompt reference for agents |
| `hypotheses/PORTFOLIO.md` | Master hypothesis index |
| `hypotheses/active/` | Live, confidence ≥ 60% |
| `hypotheses/developing/` | Forming, confidence < 60% |
| `web/server.js` | Express server + inline HTML app |
| `docs/memory/PROJECT-STATE.md` | This file — session state |
| `docs/memory/DECISIONS.md` | Architectural decisions |
| `docs/memory/SESSIONS.md` | Rolling session log |
| `docs/product/BACKLOG.md` | Feature backlog |
| `.claude/agents/` | 14 specialist agents |
| `.claude/skills/` | Invokable skills |

---
*This file is part of the Marketpulse memory system. Update it at the end of every session.*
