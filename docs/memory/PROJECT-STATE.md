# Marketpulse — Project State
> Updated at the end of every session. Read this at the start of every session before doing anything else.
> Format: most recent state is always at the top of each section.

---

## Current system status

| Component | Status | Notes |
|---|---|---|
| **Web view** | ✅ Live on port 3737 | Started this session; syntax bug fixed and confirmed working |
| **Chat interface (BL-015)** | ✅ Live | Syntax bug fixed; `POST /api/chat/:id` SSE streaming intact |
| **Hypothesis portfolio** | ✅ 19 live hypotheses — 6 Active, 13 Developing, 1 Retired | India (10), US (7), Global (2). Next ID: H-0021 |
| **Price charts** | ✅ Live via Yahoo Finance (yahoo-finance2 v3) | Real data + forecast band |
| **TX (Plain English)** | ✅ Live — AI enabled | `web/.env` set; Haiku generates on card open; cached in `tx-cache.json` |
| **AI TX generation** | ✅ Enabled | ANTHROPIC_API_KEY loaded via dotenv from `web/.env` |
| **Company selector** | ✅ Live — P0 fixed | Ticker label updates on every company switch |
| **HPCL chart** | ✅ Fixed | `?ticker=HPCL.NS` routes through TICKER_MAP → `HINDPETRO.NS` |
| **Daily hypothesis cycle** | ✅ Cycle 4 complete; G8 resolved | H-0001 retired; H-0007 82%→65%, H-0003 78%→62% (red-team applied); Active avg = 66.5% — G8 PASS |
| **Auto-test crons** | ✅ Active (session-only) | Daily 9:17am, Weekly Mon 9:23am, Monthly 1st 9:41am |
| **Memory auto-save** | ✅ Active (every 45 min) | PROJECT-STATE.md + SESSIONS.md checkpoint |
| **Market switcher** | ✅ All/India/US/Global tabs | Auto-detected from instrument field |
| **Agent crew** | ✅ 17 agents configured | 14 Marketpulse + PM agents added to ClearCart & MicroManga |
| **Git** | ✅ Clean — pushed | Latest commit: 9a39a69 (H-0012–H-0020 + BL-015 fix + TB-001) |
| **Security hardening** | ✅ Done | .gitignore, history scrubbed, security-privacy-guardian agent |
| **Mobile fix** | ✅ Done | Chart.js `defer` + `catch(err){}` + apostrophe bug fixed |
| **BL-013 Gmail sync** | 📋 Backlog | Full spec in BACKLOG.md; server side already built |
| **BL-014 Mobile cycle trigger** | 📋 Backlog P2 | Designed (Option B review-then-apply); not yet built |

---

## What was built (most recent first)

### 2026-05-29 — Session 13 (red-team applied + Product Staff Learnings Engine)
- **Red-team revisions applied.** H-0007: 82%→65%; H-0003: 78%→62%. PORTFOLIO.md + TEST-LOG.md updated. G8 Active avg = 66.5% — breach resolved, G8 now PASS.
- **Product Staff upgraded (Cara integration).** Opus 4.7 integrated Cara Workshop insights: Learnings Engine (`docs/learnings/` — POSITIVE-PATTERNS.md + ANTI-PATTERNS.md + README), test-plan-template.md, PRD template upgraded (4-section floor, counter-metric rule, Defer-PRD variant), SOP Gates 0+8 added, PM + Tech Lead ⚡ Critical Rules blocks, CLAUDE.md self-learning protocol section.

### 2026-05-29 — Session 12 (Cara Workshop review)
- **Cara Workshop review complete.** Opus 4.7 did full read of all key files. Produced structured findings: 5 categories, 30+ learnings, top-5 priority list. Owner decided to integrate.

### 2026-05-29 — Session 11 (cycle 4 complete)
- **Hypothesis cycle 4 complete.** 7 P1s validated. H-0001 retired (kill condition triggered + ST horizon expired). H-0002: 52%→50%. H-0003: 78% held (G8). H-0007: 82% held (G8). H-0008: 62%→63%. H-0011: 47%→49%. H-0014: 72%→74%. PORTFOLIO.md updated: Active=6, Developing=13, Retired=1, Total=19. G8 Active avg = 72% — breach persists; red-team of H-0007 + H-0003 still required.

### 2026-05-29 — Session 10 (checkpoint 38)
- **No changes.** Memory checkpoint only. State identical to CP37.

### 2026-05-29 — Session 10 (checkpoint 37)
- **No changes.** Memory checkpoint only. State identical to CP36.

### 2026-05-29 — Session 10 (checkpoint 36)
- **No changes.** Memory checkpoint only. State identical to CP35.

### 2026-05-29 — Session 10 (checkpoint 35)
- **No changes.** Memory checkpoint only. State identical to CP34.

### 2026-05-29 — Session 10 (checkpoint 34)
- **No changes.** Memory checkpoint only. State identical to CP33.

### 2026-05-29 — Session 10 (checkpoint 33)
- **No changes.** Memory checkpoint only. State identical to CP32.

### 2026-05-29 — Session 10 (checkpoint 32)
- **No changes.** Memory checkpoint only. State identical to CP31.

### 2026-05-29 — Session 10 (checkpoint 31)
- **No changes.** Memory checkpoint only. State identical to CP30.

### 2026-05-29 — Session 10 (checkpoint 30)
- **No changes.** Memory checkpoint only. State identical to CP29.

### 2026-05-29 — Session 10 (checkpoint 29)
- **No Marketpulse code changes.** Cross-project session: Instagram teardown generated (claude-opus-4-8, $0.41, committed 6df0726 to product-staff). WizCommerce mock interview run — 5 founder-style questions with model answers and trainer verdicts. Server state unchanged; last confirmed live at CP28.

### 2026-05-28 — Session 10 (checkpoint 28)
- **Hypothesis cycle 3 completed**: all 7 P1 hypotheses validated with live web search data. H-0001 → 35% (near retirement; GIFT Nifty -246 pts, FII MTD -₹33,815Cr), H-0002 → 52% (held; Iran deal stalling, Brent ~$97), H-0003 → 78% ⚠️G8 (TCS 52-wk low, Nifty IT -40% from highs), H-0007 → 82% held (G8 guardrail), H-0008 → 62% (ZS bounce leg failed -31.5%), H-0011 → 47% (crude sub-$100, near kill), H-0014 → 72% held (Type 4 override; fundamentals intact). PORTFOLIO.md updated.
- **Chat model upgraded**: `server.js` line 960 → `claude-opus-4-8`. Committed c37d594, pushed.
- **Product Staff profile deep dive**: product-manager.md (session start protocol), devops-engineer.md (projects table), interview-trainer.md (ArisInfra/Flipkart differentiator, story bank), interview-raw-thoughts.md (3 new sections). All profiles assessed; 4 updated.
- **MicroManga tools-specialist**: new agent profile created at `micromanga/.claude/agents/tools-specialist.md`. Zero-budget Phase A stack ($0/mo) + minimum-spend Phase B upgrade ($7–10/mo post-greenlight).
- **Backlogs enhanced**: Marketpulse (BL-019 added, PM notes updated, opus-4-8 fixed), ClearCart (CC-007 demo script + critical path added), Product Staff (BACKLOG.md created from scratch — 18 items), MicroManga (already current).
- **G8 breach**: Active avg ~71.5% (cap 70%). Red-team of H-0007 + H-0003 still required before any upward revisions.

### 2026-05-28 — Session 9 (checkpoint 27)
- **Session end checkpoint. No Marketpulse changes.** All memory current. Web view live port 3737. 20 hypotheses, H-0021 next. G8 red-team still open.

### 2026-05-28 — Session 9 (checkpoint 26)
- **No Marketpulse changes.** WizCommerce ICP + 6 hero flows mapped (WizOrder/WizShop/Ella/Quote/WizStudio/Copilot). All memory updated across all projects.

### 2026-05-28 — Session 9 (checkpoint 25)
- **No Marketpulse changes.** Cross-project: WizCommerce 8-dimension teardown + Lead PM interview prep produced. product-staff pushed to GitHub (private). Job-applications move completed and server restarted cleanly on port 5001.

### 2026-05-28 — Session 9 (checkpoint 24)
- **No Marketpulse changes.** BL-018 added to backlog (IndMoney/Groww signal source investigation + integration). Job-application download fixed (two buttons, URL encoding). Marketpulse server unchanged — last confirmed live at CP22.

### 2026-05-28 — Session 9 (checkpoint 23)
- **No Marketpulse changes.** Cross-project session: PS-001 Daily Teardown shipped to product-staff (Gates 4–7 complete; first teardown `2026-05-28-spotify.md` generated). Job-applications sub-project merged into product-staff. Server last confirmed live at checkpoint 22; state unchanged.

### 2026-05-28 — Session 9 (checkpoint 22)
- **9 new hypotheses added** (H-0012 through H-0020): portfolio 11 → 20. Covers India Defense, Banking, Pharma, Real Estate, EV; US Nuclear (Active, 72%), NVIDIA bear, Consumer Staples; Global macro/USD. PORTFOLIO.md and sector index updated. Next ID: H-0021.
- **Server restarted and confirmed live**: port 3737, 20 cards loading, chat working.
- **Pushed to GitHub**: commit 9a39a69.

### 2026-05-28 — Session 9 (checkpoint 21)
- **BL-015 syntax bug fixed**: `buffer.split('\\n')` inside template literal was rendering as a literal newline → browser SyntaxError → "Loading hypotheses..." indefinitely. Fixed by escaping to `buffer.split('\\\\n')` in source so the template outputs a valid `\n` escape.
- **TB-001 regression test built**: `npm test` / `python3 tests/check-inline-js.py`. Uses a Node.js vm extractor (`tests/extract-html.js`) to render the HTML template the same way the browser sees it, extracts all `<script>` blocks, and runs `node --check` on each. Confirmed: catches the bug (FAIL), passes the fix (PASS).
- **SOP gates established** (previous session, documented here): 7-gate PRD→review→test plan→tech proposal→review→implement→tests sequence wired into all CLAUDE.md files. Retroactive BL-015 PRD at `product-staff/prds/marketpulse/BL-015-chat-interface.md`. Gate 7 still open (8 of 11 tests).
- **Server not yet restarted** — fix is on disk; needs `node server.js` to go live.

### 2026-05-28 — Session 8 (checkpoint 20)
- **BL-015 Chat Interface shipped**: `POST /api/chat/:id` SSE endpoint (claude-opus-4-7). Full hypothesis context injected as system prompt. In-memory session history. Bottom-sheet chat modal with streaming bubbles. 💬 Ask button on every card. `chat-log.json` persists all turns. Tested live on H-0007 + H-0001.
- server.js: +~150 lines. `.gitignore`: chat-log.json added.

### 2026-05-29 — Pre-US-open cycle (checkpoint 19)
- **Pre-open hypothesis cycle run**: all 11 hypotheses updated. H-0002 52→55% (+3%, Brent sub-$100/deal "largely negotiated"). H-0011 56→53% (-3%, crude eroding toward kill zone).
- **G8 breach continues**: 72.4% Active avg. H-0007 held at 82% (guardrail blocked UBS $1,625 PT / MU pre-mkt $961.92). Red-team review still required.
- PORTFOLIO.md, TEST-LOG.md, all 11 hypothesis files updated. SESSIONS.md updated.

### 2026-05-28 — Session 7 (checkpoint 18)
- No new work. State unchanged.

### 2026-05-28 — Session 7 (checkpoint 17)
- No new work since checkpoint 16. State unchanged.

### 2026-05-28 — Session 7 (checkpoint 16)
- No new work since checkpoint 15. State unchanged.

### 2026-05-28 — Session 7 (checkpoint 15)
- No new work since checkpoint 14. State unchanged.

### 2026-05-28 — Session 7 (checkpoint 14)
- No new work since checkpoint 13. State unchanged.

### 2026-05-28 — Session 7 (checkpoint 13)
- No new work since checkpoint 12. State unchanged.

### 2026-05-28 — Session 7 (checkpoint 12)
- No new work since checkpoint 11. State unchanged.

### 2026-05-28 — Session 7 (checkpoint 11)
- No new work since checkpoint 10. State unchanged.

### 2026-05-28 — Session 7 (checkpoint 10)
- No new work since checkpoint 9. State unchanged.

### 2026-05-28 — Session 7 (checkpoint 9 — context continuation)
- **Cross-project Product & Tech review completed**: ClearCart `docs/BACKLOG.md` created (13 items, P0: release gate + icons; P1: 6 orchestration/storage test gaps). MicroManga `docs/BACKLOG.md` created (11 items, P0: Instagram setup + signal collection). Marketpulse review: PASS — backlog comprehensive, G8 breach open action noted.
- **Systems Thinking Framework**: `/Users/priyanka/Desktop/Akash Claude/SYSTEMS-THINKING.md` created — reinforcing loops per project, cross-project learning matrix, self-healing protocol, loop inventory.
- **CRON-REGISTRY.md**: created in `product-staff/docs/` — all 5 active cron jobs documented with job IDs, expiry dates (~2026-06-04), and self-contained recreation prompts. Master recreation prompt added to product-staff RUNBOOK.md.
- **Memory**: All 4 project memory files created/updated (marketpulse, clearcart, micromanga, product_staff, systems_thinking_framework).

### 2026-05-28 — Session 7 (checkpoint 6)
- **Daily auto-test**: G4 ✅ PASS (all 11 in cadence), G8 ❌ BREACH (Active avg 72.4%), ST ✅ PASS. TEST-LOG.md updated. PushNotification sent.
- **G8 required action**: Red-team review of H-0007/H-0003/H-0005 before any new filings.
- **BL-015**: chatbot model → claude-opus-4-7.

### 2026-05-28 — Session 7 (checkpoint 5)
- **Product Staff project created**: `/Users/priyanka/Desktop/Akash Claude/product-staff/` — 6 agents (PM, Data, UX, Tech, DevOps, Market Researcher), CLAUDE.md, RUNBOOK.md, PRD template, cross-product decisions repository (DEC-PS-001–008). Commit d4ad5b7.
- **BL-017 added**: news source integration (NewsAPI + ET RSS, P2); RICE 15.0; foundation layer for future BL-004/005 real-time alerts.

### 2026-05-28 — Session 7 (checkpoint 4)
- **PM profile**: Step 11 (staged probes before full commitment), Principle #11 (build to learn before building to ship), and DEC-PS-008 (Amazon threshold test analog) added.
- **BL-015 reframed**: chatbot explicitly positioned as de-risking probe for BL-016 — chat logs validate behavioral assumption before decision-support system is built.
- **BL-016**: strategic dependency on BL-015 chat logs before scope lock added. Phase 2 build gated on log evidence.

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
| **⚠️ Open** | G8 red-team | `red-team-skeptic: attack H-0007. No politeness.` and `attack H-0003` — required before any upward confidence revisions |
| **⚠️ Open** | H-0001 retirement | Confidence 35%, ST thesis near expiry. Retire if Nifty closes below 23,800 |
| **P1** | BL-019 | Retroactive gates for BL-015: Gate 2 (PRD review), Gate 3 (full test plan), Gate 5 (tech proposal review) |
| **P1** | BL-013 Gmail holdings sync | Apps Script spec complete; needs 20-min regex tuning on real emails + trigger setup |
| **P1** | H-0012–H-0020 first validation | All due 2026-05-30/31; first full cycle for 9 hypotheses filed 2026-05-28 |
| **P2** | BL-004 Scheduled cron | Server-side daily cycle automation; unblocks BL-005 (watch-item scanner) |

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
