# Marketpulse — Session Log
> Append-only rolling log. One entry per session. Most recent at top.
> Each entry: what was accomplished, what decisions were made, what's unfinished, and what to pick up next.

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
