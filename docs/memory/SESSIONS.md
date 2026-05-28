# Marketpulse — Session Log
> Append-only rolling log. One entry per session. Most recent at top.
> Each entry: what was accomplished, what decisions were made, what's unfinished, and what to pick up next.

---

## Session: 2026-05-28 — Checkpoint 21 (BL-015 syntax bug + TB-001 regression test)

**Focus:** Fix "Loading hypotheses..." regression introduced by BL-015; add regression test

### Done
- **Root cause identified**: `buffer.split('\n')` in `sendChat()` was inside the HTML template literal — JS processed `\n` as a newline escape, producing an unterminated string literal in the browser. `node --check server.js` passed silently because it only validates the Node.js layer, not template literal content.
- **Fix applied** (`web/server.js` line 2532): changed `'\n'` → `'\\n'` so template outputs a proper escape to the browser.
- **TB-001 built** (`web/tests/check-inline-js.py` + `web/tests/extract-html.js`): uses Node.js `vm` to render the HTML as the browser sees it, extracts `<script>` blocks, runs `node --check` on each. Confirmed detects the bug (FAIL) and passes the fix (PASS). Wired into `npm test`.
- **PRD + tech proposal reviewed**: BL-015 retroactive PRD and all 21 review comments walked through on request. Gate 7 still has 8 open tests.

### Still open
- Start server: `~/node-v24.16.0-darwin-arm64/bin/node server.js` from `web/`
- Gate 7 BL-015: T-04 through T-11 (8 remaining)
- G8 red-team: H-0007 (82%), H-0003 (75%), H-0005 (70%)

---

## Session: 2026-05-28 — Checkpoint 20 (BL-015 chat interface built)

**Focus:** BL-015 — per-card AI chat interface

### Done
- **`POST /api/chat/:id`** streaming SSE endpoint — claude-opus-4-7, full hypothesis context injected (title, oneliner, direction, magnitude, timeframe, confidence, confirms/kills, last 3 evidence entries, latest market actual). In-memory session history per card.
- **Chat modal** — bottom-sheet slide-up, streaming bubbles (user right/blue, assistant left/gray), backdrop-close, restore history on reopen.
- **💬 Ask button** — added to every card's rating row alongside 👍 👎.
- **`chat-log.json`** — every turn persisted; added to `.gitignore`.
- Tested live: H-0007 + H-0001 both streaming correctly. `done` event fires. Log writing confirmed (2 entries).

### Still open
- G8 red-team: H-0007 (82%), H-0003 (75%), H-0005 (70%)
- Crons expire ~2026-06-04

---

## Session: 2026-05-29 — Checkpoint 19

**Focus:** Memory checkpoint post-hypothesis cycle

No new work since pre-open cycle. State as of cycle: H-0002 55%, H-0011 53%, all others unchanged. G8 breach open.

---

## Session: 2026-05-29 — Pre-US-open hypothesis cycle

**Focus:** Full P1+P2 validation cycle ahead of US market open

### Done
- **P1 updated (6 hypotheses):** H-0001, H-0002, H-0003, H-0007, H-0008, H-0011
- **P2 date-stamped (5 hypotheses):** H-0004, H-0005, H-0006, H-0009, H-0010
- **Confidence changes:** H-0002 +3% (52→55%); H-0011 -3% (56→53%). All others unchanged.
- **G8 breach:** Continues at 72.4% Active avg. H-0007 evidence extremely positive (UBS PT $1,625, MU pre-mkt $961.92) — confidence held at 82% per guardrail. **Red-team review still required.**
- Key market signals: Brent $94–96 (Iran deal "largely negotiated"); Nifty 50 opened 23,902 (flat); CRWD near 52-week high; ZS FY27 guidance cut to 16–17%.

### Still open
- G8 red-team: H-0007 (82%), H-0003 (75%), H-0005 (70%)
- Crons expire ~2026-06-04

---

## Session: 2026-05-28 (Session 7 — checkpoint 18)
No new work. G8 breach + cron expiry (~Jun 4) still open.

---

## Session: 2026-05-28 (Session 7 — checkpoint 17)

**Focus:** No new work since checkpoint 16. State unchanged.

### Still open
- G8 breach: red-team H-0007/H-0003/H-0005 pending
- Crons expire ~2026-06-04

---

## Session: 2026-05-28 (Session 7 — checkpoint 16)

**Focus:** No new work since checkpoint 15. State unchanged.

### Still open
- G8 breach: red-team H-0007/H-0003/H-0005 pending
- Crons expire ~2026-06-04

---

## Session: 2026-05-28 (Session 7 — checkpoint 15)

**Focus:** No new work since checkpoint 14. State unchanged.

### Still open
- G8 breach: red-team H-0007/H-0003/H-0005 pending
- Crons expire ~2026-06-04

---

## Session: 2026-05-28 (Session 7 — checkpoint 14)

**Focus:** No new work since checkpoint 13. State unchanged.

### Still open
- G8 breach: red-team H-0007/H-0003/H-0005 pending
- Crons expire ~2026-06-04

---

## Session: 2026-05-28 (Session 7 — checkpoint 13)

**Focus:** No new work since checkpoint 12. State unchanged.

### Still open
- G8 breach: red-team H-0007/H-0003/H-0005 pending
- Crons expire ~2026-06-04

---

## Session: 2026-05-28 (Session 7 — checkpoint 12)

**Focus:** No new work since checkpoint 11. State unchanged.

### Still open
- G8 breach: red-team H-0007/H-0003/H-0005 pending
- Crons expire ~2026-06-04

---

## Session: 2026-05-28 (Session 7 — checkpoint 11)

**Focus:** No new work since checkpoint 10

### Still open
- G8 breach: red-team review of H-0007/H-0003/H-0005 pending
- Cron jobs expire ~2026-06-04

---

## Session: 2026-05-28 (Session 7 — checkpoint 10)

**Focus:** No new work since checkpoint 9

### Still open
- G8 breach: red-team review of H-0007/H-0003/H-0005 pending. No new filings until resolved.
- Cron jobs expire ~2026-06-04 — recreation prompts in `product-staff/docs/CRON-REGISTRY.md`

---

## Session: 2026-05-28 (Session 7 — checkpoint 9, context continuation)

**Focus:** Cross-project review + systems thinking infrastructure

### Done
- Product Staff cross-project review completed: backlogs written for ClearCart (13 items) and MicroManga (11 items); Marketpulse review PASS
- Systems Thinking Framework created (`/Users/priyanka/Desktop/Akash Claude/SYSTEMS-THINKING.md`) — reinforcing loops, cross-project learning matrix, self-healing protocol
- CRON-REGISTRY.md created in product-staff/docs — all 5 jobs documented, expire ~2026-06-04
- All project memory files updated; MEMORY.md index complete

### Still open
- G8 breach: red-team review of H-0007/H-0003/H-0005 pending before next hypothesis filings

---

## Session: 2026-05-28 (Session 7 — checkpoint 8)

**Focus:** No new work — cron checkpoint

### Still open
- G8 breach: red-team review of H-0007/H-0003/H-0005 pending before next hypothesis filings

---

## Session: 2026-05-28 (Session 7 — checkpoint 7)

**Focus:** Holding pattern — no new work since checkpoint 6

### Open action
- G8 breach: red-team review of H-0007 (82%), H-0003 (75%), H-0005 (70%) pending. No new hypothesis filings until complete.

---

## Session: 2026-05-28 (Session 7 — checkpoint 6)

**Focus:** Daily auto-test cycle; G8 breach detected

### Done
- Daily test run: D-01 G4 ✅ PASS, D-02 G8 ❌ BREACH (Active avg 72.4% > 70% cap), D-03 ST ✅ PASS
- TEST-LOG.md updated: G8 dashboard → BREACH; DT-2026-05-28 entry added with full staleness table
- BL-015 chatbot model set to claude-opus-4-7 (owner decision)
- Committed 89d0c11

### Required next action
- Red-team review of H-0007 (82%), H-0003 (75%), H-0005 (70%) — downgrade at least one if evidence doesn't support current score. No new hypothesis filings until complete.

---

### Daily auto-test — 2026-05-28

- **D-01 G4 staleness:** ✅ PASS — all 11 hypotheses within cadence (P1: 0 days, P2: 1 day)
- **D-02 G8 overconfidence:** ❌ **BREACH** — Active-tier avg = 72.4% (cap: 70%). Top 3: H-0007 82%, H-0003 75%, H-0005/H-0008 70%. Red-team review of these 3 required before new hypothesis filings.
- **D-03 ST momentum:** ✅ PASS — H-0001 + H-0008 both validated today; no stale momentum
- **Actions taken:** TEST-LOG.md updated (G8 dashboard + DT entry). PushNotification triggered. BL-015 model updated to Opus 4.7.

---

## Session: 2026-05-28 (Session 7 — checkpoint 5)

**Focus:** Product Staff project created; news integration backlog item added

### Done
- Product Staff project built at `/Users/priyanka/Desktop/Akash Claude/product-staff/` — 6 agents (PM, Data, UX, Tech, DevOps, Market Researcher), CLAUDE.md, RUNBOOK.md, 16-section PRD template, decisions repository (DEC-PS-001–008). First commit d4ad5b7.
- BL-017 (news source integration — NewsAPI + ET RSS, P2) added to Marketpulse backlog; RICE 15.0 — foundation layer for BL-004/005
- De-risk philosophy (Step 11, Principle 11, DEC-PS-008) added to Marketpulse PM profile; committed ab4e230

---

## Session: 2026-05-28 (Session 7 — checkpoint 4)

**Focus:** De-risk philosophy added to PM profile; BL-015/016 reframed as probe → bet sequence

### Done
- PM profile: Step 11 (staged probes before full commitment) + Principle #11 (build to learn) + DEC-PS-008 (Amazon threshold test analog) added
- BL-015: "strategic de-risking role" section added — chatbot is the probe, not a lesser version of BL-016
- BL-016: explicit strategic dependency on BL-015 logs before scope lock added
- Key principle encoded: high-level vision and strategy = fine to define; steps toward it must be small, calculative, precise; roadmap is the de-risk instrument

---

## Session: 2026-05-28 (Session 7 — checkpoint 3)

**Focus:** PM hypothesis cycle, portfolio moves, memory save

### Done
- PM cycle run: H-0001 kill condition (Nifty 23,649 < 23,800) → developing (42%); H-0002 reversed up to 52% on Iran deal progress; H-0007 → 82%; H-0011 → developing (56%)
- 2 folder moves: H-0001 + H-0011 active → developing; PORTFOLIO.md updated (5 Active, 6 Developing)
- Key watch tomorrow: Iran deal closure → H-0002 back to active or H-0002 retires

---

## Session: 2026-05-28 (Session 7 — checkpoint 2)

**Focus:** P0 bug fixes, AI TX activation, daily cycle, mobile retry toggle (in-flight)

### Done
- Fixed 3 P0s: `generateTX` crash, HPCL ticker override, ticker label staleness — committed + pushed
- AI TX live: `web/.env` + dotenv, Haiku generating plain-English TL;DRs, tested on iPhone ✅
- Daily cycle run: 5 P1s validated, H-0011 filed, PORTFOLIO.md updated, pushed to GitHub
- BL-014 added to backlog (mobile-triggered cycle, P2)

### Also done
- TX toggle + manual retry (P0): `📝 Template` / `✨ AI` badge, 🔄 retry button, tap-to-toggle — committed + pushed (1c17bc2)

---

## Session: 2026-05-28 (Session 6 — checkpoint)

**Focus:** Security hardening, mobile P0 fix, Tech Backlog

### Done so far
- **Mobile P0 fixed**: Chart.js CDN was a blocking `<script>` in `<head>` — page froze on "Loading hypotheses…" on iPhone. Added `defer`. Also fixed bare `catch{}` → `catch(err){}` for iOS Safari compat. npm reinstall required (express was missing from node_modules).
- **Security gate**: root `.gitignore` added; `web/holdings.json`, `feedback.json`, `ratings.json`, `node_modules/` removed from tracking AND scrubbed from git history via `filter-branch + gc`. `security-privacy-guardian.md` agent created with 5-section pre-publication checklist. Security gate: CLEAR TO PUSH ✅
- **Tech Backlog created**: TB-001 (mobile smoke test, P1), TB-002 (JS linting), TB-003 (server stability), TB-004 (modularisation), TB-005 (SQLite). `docs/product/SMOKE-TEST.md` written. Pre-commit hook installed (blocks commits with JS syntax errors, warns on bare catch).
- **5 commits on main**. Push still pending — user to create GitHub repo at github.com/new.

### Next
- User to push: `git remote add origin git@github.com:akashraj4562/marketpulse.git && git push -u origin main`
- Implement TB-001 smoke test as part of next deployment
- Daily hypothesis validation cycle not run this session

---

## Session: 2026-05-28 (Session 5 — checkpoint 2)

**Focus:** BL-003 Portfolio mode build — paused mid-implementation

### State of server.js edits so far
- ✅ Backend: ISIN_TO_TICKER, nameToTicker(), computePersonalWeight() (λ=0.003 decay), readHoldings/writeHoldings helpers
- ✅ Backend: /api/holdings GET, /api/holdings-sync POST, /api/holdings-load-test POST, /api/holdings-clear POST
- ✅ Backend: /api/hypotheses now injects personalWeight + isHeld per hypothesis
- ✅ Frontend CSS: portfolio toggle button, banner, held-badge, history-badge, weight-bar styles
- ✅ Frontend HTML: Portfolio toggle btn in header, portfolio-banner div below filters
- ✅ Frontend JS: portfolioMode state (localStorage), allHoldings, loadHoldings(), togglePortfolioMode(), applyPortfolioModeUI(), personalRelevanceScore()
- ❌ Still needed: filterHypotheses portfolio sort, renderCard badge/weight-bar HTML, loadData wiring (loadHoldings + applyPortfolioModeUI on init)
- ❌ Not yet: server restart, test with holdings-load-test, verify weights, switch off, commit/push, README

### Next actions to resume
1. Complete remaining 3 frontend edits (filterHypotheses, renderCard, loadData)
2. Kill + restart server
3. `curl -X POST localhost:3737/api/holdings-load-test` → verify weight math
4. Open browser, toggle Portfolio mode on, verify sort + badges
5. `curl -X POST localhost:3737/api/holdings-clear` → switch off
6. `git add -A && git commit` then push + write README

---

## Session: 2026-05-28 (Session 5 — checkpoint)

**Focus:** BL-003 Portfolio mode — build, test, deploy, switch off

### Done so far
- Backend: all holdings endpoints added to server.js (sync, load-test, clear, GET holdings)
- /api/hypotheses enriched with personalWeight + isHeld per hypothesis
- Frontend CSS (toggle btn, banner, held-badge, history-badge, weight-bar) added
- Frontend HTML (portfolio toggle in header, portfolio-banner div) added
- Frontend JS state + functions (portfolioMode, loadHoldings, togglePortfolioMode, applyPortfolioModeUI, personalRelevanceScore) added
- "link not working" reported mid-edit — pending investigation

### In-flight
- Still need: filterHypotheses sort, renderCard badge HTML, loadData wiring, then server restart + test sequence
- After test: switch off (holdings-clear), commit, push to git, write README

---

## Session: 2026-05-27 (Session 4 — checkpoint)

**Focus:** Bug P0 protocol, feedback→hypothesis loop, email→portfolio pipeline design

### Accomplished so far
- Bug P0 escalation protocol added to all 3 PM agents (Marketpulse, ClearCart, MicroManga)
- `hypothesis-generator.md` + `hypothesis-validator.md` updated to read `ratings.json` / `feedback.json` as soft calibration signals (corroboration-gated: +3%/−5%)
- BACKLOG.md: BL-007–012 marked Done
- BL-003 (portfolio-aware) fully designed: Gmail Apps Script → `/api/holdings-sync` → `holdings.json` → `personalWeight` on cards; recency decay formula e^(−0.003×days); "Portfolio" sort tab; spec ready to build

### In-flight / next
- Build BL-003 in server.js (owner confirmed email sources: INDMoney, CDSL, Groww, Motilal)
- Owner needs to tune regex on actual email samples before Apps Script goes live
- Daily hypothesis cycle not run this session

---

## Session: 2026-05-27 (Session 4)

### Accomplished

- **Bug escalation protocol (NON-NEGOTIABLE)** added to all three PM agents:
  - `marketpulse/.claude/agents/product-manager.md` — added before Testing Philosophy section
  - `clearcart/.claude/agents/product-manager.md` — added before Trust Ledger section
  - `micromanga/.claude/agents/product-manager.md` — added before Themes & Roadmap section
  - Rule: production bugs are always P0, no P1 bugs, all feature work stops until fixed
  - User-reported bugs always assumed real until proven otherwise
  - ClearCart protocol includes privacy violations and page breaks as automatic P0
  - MicroManga protocol covers content bugs: continuity errors, cross-world bleed, broken panel flow

- **Owner ratings → hypothesis training signal** (both generation and validation agents updated):
  - `hypothesis-generator.md` — reads `web/ratings.json` + `web/feedback.json` before daily scan; uses ratings to spot coverage gaps in text feedback; mines feature requests for new hypothesis domains
  - `hypothesis-validator.md` — corroboration-gated soft evidence weighting: +3% when both owner and market confirm, −5% when both contradict; solo ratings +1% max; never overrides hard evidence
  - Key principle: corroboration from `/api/corroborate/:id` is required before a rating changes confidence

- **BACKLOG.md** updated:
  - BL-007: Owner ratings + feedback → hypothesis training signal (Done)
  - BL-008–012: TX, company selector, light theme, history page, feedback (Done)
  - All session 3 work formally logged in backlog

### Key decisions
- Owner `👍`/`👎` ratings are soft evidence, not hard evidence — they need corroboration from Yahoo Finance to meaningfully shift confidence scores
- Corroboration reveals AFTER the user rates (history page design) to preserve memory-based rating integrity
- Bug P0 escalation is a cultural norm encoded in PM agents — no feature work until bugs fixed

### What's unfinished
- BL-003 Portfolio-aware prioritization (owner still needs to share holdings in `docs/portfolio/HOLDINGS.md`)
- Product Staff project (standalone PM-focused workspace with Product, Data, UI/UX, DevOps, Tech agents)
- Daily validation cycle has not been run this session (no hypothesis confidence updates today)

### What to do next session
1. If owner has holdings ready → build BL-003 portfolio-aware prioritization
2. Run daily hypothesis cycle: `research-director: run the daily hypothesis cycle.`
3. Product Staff workspace: create new project directory with 5 specialist agents

---

## Session: 2026-05-27 (Session 2)

**Duration:** ~3 hours  
**Focus:** Price charts in cards + memory system setup  
**Owner actions:** Requested charts showing historical + predicted price with confidence degradation

### Accomplished
- **Price chart feature** (server.js)
  - New `/api/chart-data/:id?days=N` endpoint
  - Yahoo Finance integration via yahoo-finance2 v3 (`new YFClass()`, `validateResult: false`)
  - Ticker resolution with 5-step priority (exchange code → first segment → TICKER_MAP)
  - All 10 hypotheses charting: ^NSEI, BPCL.NS, ^CNXIT, ^CNXFMCG, TCS.NS, USDINR=X, MU, CRWD, IWM, AAPL
  - Chart.js CDN for rendering (no build step)
  - Historical (indigo solid) + Forecast (direction-coloured dashed) + Confidence band (fading fill)
  - Confidence degradation: from hypothesis confidence → 45% noise floor across Y days
  - Band widens 3.5× by end of window (uncertainty grows)
  - X selector: 7d/14d/30d/90d; Y auto-calculated by horizon class
  - Tooltip shows date, price, live confidence% at hover point
  - Today marker vertical line

- **PORTFOLIO.md** updated with all 10 hypotheses (was only showing India 6)
- **Next hypothesis ID**: H-0011
- **Memory system** created: PROJECT-STATE.md, DECISIONS.md, SESSIONS.md (this file)
- **Procedural skills**: dev-workflow/SKILL.md, hypothesis-ops/SKILL.md

### Key decisions
- See DECISIONS.md: DEC-006 (45% noise floor), DEC-005 (ticker priority), DEC-004 (Y bounds)
- DEC-T005: yahoo-finance2 v3 API pattern

### Unfinished / carry forward
- BL-003: Portfolio-aware prioritization (user needs to share holdings)
- Hosting (user said "host on website later")
- Push notifications when watch items trigger (BL-004, not filed yet)
- H-0011+ (next hypothesis when new signal arrives)

### What to do in next session
1. Ask if user has their portfolio holdings to share → build BL-003
2. Check if any watch items have triggered for H-0007 (CRWD/PANW rotation, 1–3 weeks) or H-0008 (ZS bounce)
3. File H-0011 if there's a new signal
4. Run daily hypothesis validation cycle

---

## Session: 2026-05-27 (Session 1)

**Duration:** ~4 hours  
**Focus:** Capital market pivot + India/US hypothesis generation + web view

### Accomplished
- Capital market prediction as primary output across all templates and agents
- India hypotheses H-0001–H-0006 filed (Nifty momentum, Iran deal, IT underperformance, FMCG defensive, IT structural de-rating, crude/INR)
- US hypotheses H-0007–H-0010 filed (Micron HBM, ZS rotation, Fed rate hold, Big Tech capex)
- Web view: Express.js server, dark mode, card layout, market switcher, filter pills, mobile-responsive
- Product manager agent with 20-point PM mental model
- Source quality tiers (T1–T4) in signal-scout
- Feature backlog: BL-001 (mobile ✓), BL-002 (refresh ✓), BL-003 (portfolio, pending)
- ngrok failed → local network (192.168.1.14:3737) for iPhone

### Key decisions  
- See DECISIONS.md: DEC-001 through DEC-T003
- Capital market prediction is the product, not business analysis

---
*To add a new session entry, append above this line with the same format.*
