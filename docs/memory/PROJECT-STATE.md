# Marketpulse — Project State
> Updated at the end of every session. Read this at the start of every session before doing anything else.
> Format: most recent state is always at the top of each section.

---

## Current system status

| Component | Status | Notes |
|---|---|---|
| **Web view** | ✅ Running on port 3737 | `cd web && node server.js` |
| **Hypothesis portfolio** | ✅ 10 live hypotheses (6 India, 4 US) | Next ID: H-0011 |
| **Price charts** | ✅ Live via Yahoo Finance (yahoo-finance2 v3) | Real data + forecast band |
| **Market switcher** | ✅ All/India/US/Global tabs | Auto-detected from instrument field |
| **Agent crew** | ✅ 14 agents configured | In `.claude/agents/` |
| **Skills** | ✅ signal-to-thesis, daily-hypothesis-cycle, training-drill | In `.claude/skills/` |

---

## What was built (most recent first)

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
