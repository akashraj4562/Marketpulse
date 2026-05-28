# Marketpulse Product Backlog

> Maintained by product-manager + engineering. Updated as feature requests and tech debt items come in.
> Priority tiers: **P0** (blocking — do now) / **P1** (high — next sprint) / **P2** (queue) / **P3** (later) / **Defer** / **Out of scope**
> Status: `Proposed` → `Scoped` → `In Progress` → `Done`
> **Two tracks: Feature Backlog (BL-) and Tech Backlog (TB-).** Same priority tiers. Tech items own engineering quality, stability, and velocity — not features. Neither track is optional.

---

## North Star Metric (NSM)

**Calibrated Prediction Accuracy (CPA)** — of all resolved hypotheses in the Active tier (≥60% confidence), what % confirmed, and does that match the stated confidence band?

| Band | Target | Alert |
|---|---|---|
| 75–100% | ≥75% confirm | <60% → over-confident |
| 60–74% | 60–74% confirm | <45% or >90% → miscalibrated |

**Leading proxy (short term):** Validation Freshness — % of due hypotheses validated on schedule.

---

## Roadmap themes

| Theme | This quarter | Next quarter |
|---|---|---|
| 🎯 Prediction Accuracy | Source quality gate, calibration visibility | Red-team threshold automation |
| ⚡ Validation Velocity | Scheduled cron, watch-item scanner | News feed integration (BL-017), push notifications |
| 🌍 Coverage Breadth | Europe/Asia hypotheses | Commodity sector |
| 📱 Output Clarity | Portfolio-aware sorting (BL-003) ✅ | Summary digest, share card |
| 🧠 Owner Intelligence | Blind-spot tracker | Calibration history |
| 🏗️ Platform Leverage | Schema freeze | SQLite migration |
| 🔧 Engineering Quality | **Mobile smoke test (TB-001), JS linting (TB-002)** | Server stability (TB-003), modularization (TB-004) |

---

## Tech Backlog

> Engineering quality, reliability, and platform items. Owned by the engineering + security-privacy-guardian agents. Reviewed by product-manager for priority.
> All TB items that affect user-visible stability are P1 or higher. A P0 on the feature side does not deprioritize P1 tech items that prevent regression.

---

### [TB-001] Mobile smoke test — automated regression gate
**Priority:** P1 ← **DIRECT RESULT OF TODAY'S P0 REGRESSION**
**Status:** Proposed
**Root cause it prevents:** BL-003 introduced `catch {}` (ES2019 bare catch) and was shipped to production (iPhone) without any mobile browser test. It broke silently — page shows "Loading hypotheses…" indefinitely. Was only caught because the owner opened the app on their phone.

**True need:** Every change to `server.js` must be smoke-tested on mobile before being considered "done." The testing gap meant a P0 regression shipped undetected.

**What to build:**
1. **`docs/product/SMOKE-TEST.md`** — a 2-minute manual smoke test checklist run after every `server.js` change:
   - [ ] Desktop: open `localhost:3737`, cards load within 3 seconds
   - [ ] iPhone: open `192.168.1.14:3737`, cards load within 5 seconds
   - [ ] Expand one card — chart renders (may take a few seconds on first load)
   - [ ] Rate a hypothesis (👍) — rating persists on refresh
   - [ ] Open History page — renders without error
   - [ ] Refresh button (↻) — spins and reloads cards
2. **Pre-commit hook** (`.git/hooks/pre-commit`) that runs a Node.js syntax check on `server.js`:
   ```bash
   node --check web/server.js && echo "✅ Syntax OK" || exit 1
   ```
3. **`auto-test` skill update** — add mobile smoke test step to the daily cron (currently only tests hypothesis quality guardrails, not app health)

**What this prevents:**
- JS syntax errors shipped to production
- ES version incompatibilities (bare catch, optional chaining, nullish coalescing) on older iOS
- Silent fetch hangs from server restart mid-session

**Extended RICE:** Reach 5 × Impact 5 × Confidence 0.95 / Effort 1 = **23.8** — highest ROI item in the backlog. Effort is 1 (30-minute write + hook setup).

**Proof of value:** Zero P0 mobile regressions in the next 30 days after smoke test is in place. Observable: owner can open app on iPhone after every session without reporting a bug.

---

### [TB-002] JS compatibility linting — ES version guard
**Priority:** P1
**Status:** Proposed
**Root cause it prevents:** Same regression as TB-001. `catch {}`, `?.`, `??` are ES2019/ES2020. Our target is iOS Safari 12+ which supports ES2019 but not always ES2020. No linter currently warns when incompatible syntax is added.

**What to build:**
- Add `eslint` to `web/package.json` with `"env": {"es2019": true}` and a rule that warns on ES2020+ features in the HTML template block (lines 741–end of server.js)
- Or a simpler custom check: `grep -n "catch {" web/server.js | grep -v "\/\/"` catches bare catches

**Effort:** 1 hour. **Impact:** Eliminates entire class of mobile JS compatibility bugs.

---

### [TB-003] Server stability — graceful restart + health endpoint
**Priority:** P2
**Status:** Proposed
**Root cause it prevents:** During this session the server was killed and restarted 4× while the phone had the page open. Mobile Safari kept connections to dead server processes, causing fetch hangs that look like app bugs but are infrastructure issues.

**What to build:**
1. **`GET /health`** endpoint: returns `{"status":"ok","uptime":N,"pid":N}` — lets the frontend detect server restarts and auto-reload
2. **Frontend heartbeat**: every 30s, the page fetches `/health`. If it fails 2× in a row (server restarted), silently re-run `loadData()`. If it succeeds but PID changed (new server process), show "Server updated — refreshing" toast and reload.
3. **Process manager**: document using `npx pm2 start server.js` for persistent server across terminal sessions — eliminates the "server is down because terminal closed" failure mode

**Effort:** 3 hours. **Impact:** Eliminates the "fetch hanging from dead server" class of bugs.

---

### [TB-004] Server.js modularization — split 2300-line file
**Priority:** P3
**Status:** Proposed
**True need:** `server.js` is ~2300 lines and contains: Express server, all API routes, hypothesis parser, holdings logic, ticker resolution, and the entire frontend app (HTML + CSS + ~800 lines of JS) as a template literal. Every change to any layer touches this one file, making diffs hard to review and increasing regression risk.

**Proposed split:**
- `server.js` — Express init, middleware, route mounting (~100 lines)
- `routes/hypotheses.js` — hypothesis loading/parsing, chart data, corroboration
- `routes/holdings.js` — holdings sync, weights, portfolio endpoints
- `routes/ratings.js` — ratings, feedback endpoints
- `client/app.js` — frontend JavaScript (extracted from template literal, served as static file)
- `client/index.html` — HTML template
- `client/style.css` — CSS

**Benefit:** Changes to frontend JS can be reviewed in isolation; no risk of touching hypothesis parser when updating CSS. Enables proper linting of client JS.

**Dependency:** Not urgent while the codebase is one developer. Reassess when the file hits 3000 lines or when a second contributor joins.

---

### [TB-005] Data persistence — migrate runtime JSON to SQLite
**Priority:** P3 (defer to Q4 2026)
**Status:** Proposed
**True need:** `holdings.json`, `ratings.json`, `feedback.json` are flat files read/written synchronously. This is fine for one user. It becomes a problem if:
- Two requests write simultaneously (race condition)
- File grows large (ratings for 100+ hypotheses × 365 days)
- Server restart loses in-flight writes

**Migration path:** `better-sqlite3` (synchronous, no additional process, no network). Single `marketpulse.db` file. Tables: `ratings`, `feedback`, `holdings_transactions`, `holdings_positions`.

**When to do it:** When the rating history grows beyond 500 rows OR when hosting publicly.

---

## Active backlog

---

### [BL-001] Mobile web view — hypothesis portfolio browser
**Priority:** P2
**Status:** Scoped
**Owner ask:** "Need mobile version of the webpage so I can see it on my phone. Decide on the UI and the UX (filters/cards etc.)"
**Interpreted intent:** A lightweight mobile-readable web interface that renders `PORTFOLIO.md` as browsable cards — filterable by sector, horizon (ST/MT/LT), confidence tier, and direction (bullish/bearish). No editing required on mobile; read-only with one-tap drill-down into individual hypothesis files.

**Assessment:** P2 — High value, medium effort. Requires building a thin web layer on top of the markdown-based file system. Not blocking the core research workflow; the portfolio currently works fine in Claude Code / markdown. Ship the core hypothesis system first; this is the UX enhancement layer.

**Recommended scope (v1):**
- Static HTML page (or Next.js app) that reads from `PORTFOLIO.md` and renders hypothesis cards
- Card shows: H-ID, slug, horizon badge (ST/MT/LT), confidence %, predicted direction (up/down arrow), instrument, last-validated date
- Filters: Sector / Horizon / Confidence tier / Direction (bullish/bearish)
- Tap card → expand to show capital market prediction + investor sentiment landscape (from the hypothesis file)
- Mobile-first, responsive. No auth needed for personal use.
- Color-coded by confidence: green ≥75%, yellow 50–74%, orange 30–49%, red <30%

**Dependencies:** Needs the hypothesis file format to be stable (it is — just completed). Needs a way to parse markdown tables from PORTFOLIO.md and individual hypothesis files. Could be a simple Python/Node script that builds a static page, or a hosted Next.js app.

**What's deferred to v2:** editing confidence from mobile, push notifications when hypotheses cross thresholds, live market data widgets.

---

### [BL-002] Manual confidence refresh button
**Priority:** P1
**Status:** Scoped
**Owner ask:** "Need a manual refresh confidence button/icon or some UX so I can manually click on it and the latest info and data around it is scoured from the internet in deep research mode and the confidence and other scores are updated. Fine if it takes a few minutes."
**Interpreted intent:** A one-click trigger that, for a specific hypothesis, runs the full hypothesis-validator deep validation pass (web searches + evidence log update + score recalculation) on demand, outside the daily cycle. The owner wants to be able to say "re-check this one right now" without running the full daily cycle.

**Assessment:** P1 — This is actually a workflow improvement, not a UI feature. The core mechanism already exists (hypothesis-validator can run on a single hypothesis), but there's no clean single-prompt interface for it. This is a RUNBOOK addition + optional UI button in BL-001.

**Recommended scope (v1 — immediate, no web UI needed):**
The prompt already exists in RUNBOOK.md: `hypothesis-validator: run a deep validation on H-NNNN. Pull all available evidence.`

Add this to RUNBOOK.md as the canonical "manual refresh" command with a clear heading. When BL-001's web UI is built, this becomes a tappable "Refresh" button that fires the above prompt.

**The deeper capability (v2):** a "deep research mode" flag where the validator does 2× the normal searches, checks primary sources (NSE actual data pages, company filings, Bloomberg/Reuters headlines), and explicitly labels the confidence update as "deep pass" vs. "routine pass" in the validation history. This is meaningful differentiation — routine passes are batch/efficient; deep passes are thorough.

**Dependencies:** None for the prompt-based version. BL-001 needed for the button UX.

---

---

### [BL-003] Portfolio-aware hypothesis prioritization
**Priority:** P1
**Status:** Scoped
**Owner ask:** "I will share my current investment details. Use that to manage the priority and UI/UX. Show me what's relevant to me first. If there is an expected drop in one of my held shares which is significant (drop + exposure), then that would be high priority."
**Interpreted intent:** The owner wants to share their portfolio (ticker + % weight or absolute amount). The system should compute a "personal impact score" for each hypothesis: **Impact Score = Confidence × |Predicted magnitude| × Exposure weight**. Hypotheses with high personal impact scores float to the top of the web view and the daily summary. A hypothesis about TCS falling 20% is more urgent if the owner holds 30% of their portfolio in TCS vs. 2%.

**Assessment:** P1 — This is the highest-value UX improvement after BL-001 (web view). It personalizes the desk's output to the owner's actual stake. Without this, the desk is useful but generic. With this, every hypothesis is ranked by: "how much does this matter to you specifically?"

**Recommended scope (v1):**
1. Create `docs/portfolio/HOLDINGS.md` — owner inputs their holdings:
   ```
   | Ticker | NSE Code | Shares | Avg cost | Current % of portfolio |
   | TCS    | TCS      | 50     | ₹3,600   | 28%                    |
   ```
2. The web view reads HOLDINGS.md and cross-references with hypotheses
3. Any hypothesis mentioning a held stock → add a "🎯 You hold this" badge on the card
4. Sort order: High personal impact first (confidence × magnitude × exposure weight)
5. Personal impact score displayed on the card

**Alert logic:**
- **Red alert 🚨:** Predicted drop × exposure > threshold (e.g., >10% expected loss on >15% portfolio weight)
- **Yellow watch ⚠️:** Either high exposure OR high predicted drop, but not both
- **Green upside 📈:** Predicted gain on held position

**Dependencies:** BL-001 web view (built). HOLDINGS.md format to be defined with owner input. Owner to share their current holdings.

**What's deferred to v2:** Push notifications when a hypothesis affecting a held stock changes confidence by >15%. Price alerts if predicted price target is breached.

---

---

### [BL-004] Scheduled validation cron — daily cycle automation
**Priority:** P1
**Status:** Proposed
**Theme:** ⚡ Validation Velocity
**True need:** Hypotheses should get validated even when the owner doesn't open the desk
**Extended RICE:** Reach 5 × Impact 4 × Confidence 0.8 / Effort 3 = 5.3 × **Foundation ×1.5** (enables: push notifications, auto calibration dashboard, watch-item scanner, confidence leaderboard) × NSM ×1.25 = **Score 9.9**
**Proof of value:** Owner will see validation timestamps stay current without manually triggering. Observable: Validation Freshness metric hits 100% P1 on days owner doesn't open Claude. Assumption: server runs continuously (reasonable — it's been up for days).

---

### [BL-005] Watch-item scanner — auto-flag CONFIRMS/KILLS
**Priority:** P2
**Status:** Proposed
**Theme:** ⚡ Validation Velocity
**True need:** When a CONFIRMS or KILLS event happens in the market, the owner should know same-day, not on the next manual check
**Extended RICE:** Reach 5 × Impact 5 × Confidence 0.7 / Effort 4 = 4.4 × Foundation ×1.0 × NSM ×1.25 = **Score 5.5**
**Dependency:** BL-004 (cron must run before scanner can be scheduled)
**Proof of value:** Owner is notified same-day when ZS misses guidance (H-0008 KILLS trigger), without manually checking. Observable: owner acknowledges notification within 24h. Assumption: signal-scout can detect a specific named event in news (reasonable — it already does event-driven scanning).

---

### [BL-006] Calibration dashboard
**Priority:** P2
**Status:** Proposed
**Theme:** 🎯 Prediction Accuracy
**True need:** The owner needs to see whether their confidence scores are well-calibrated — not just individual hypothesis outcomes but the pattern across time
**Extended RICE:** Reach 3 × Impact 5 × Confidence 0.7 / Effort 3 = 3.5 × Foundation ×1.5 (enables: recalibration prompts, blind-spot tracker, owner learning velocity reporting) × NSM ×1.25 = **Score 6.6**
**Dependency:** ≥10 hypotheses must have resolved to have meaningful calibration data
**Proof of value:** Owner identifies that they are systematically over-confident in MT theses. Observable: owner explicitly recalibrates a hypothesis after seeing the dashboard. Assumption: enough hypotheses resolve in the next 3 months to populate meaningful data (reasonable — 10 hypotheses, 4–12 week horizons).

---

---

### [BL-007] Owner ratings + feedback → hypothesis training signal
**Priority:** P1
**Status:** Done (2026-05-27)
**Theme:** 🎯 Prediction Accuracy / 🧠 Owner Intelligence
**True need:** The owner's memory-based thumbs up/down ratings on past hypotheses — combined with market corroboration data — should feed back into how the desk generates and validates future hypotheses. Text feedback should be mined for coverage gaps and product issues.

**What was built:**
- `ratings.json` — per-hypothesis, per-date thumbs up/down, toggle-off behavior, stored persistently
- `feedback.json` — natural language feedback auto-classified as `bug` (P0), `feature` (P2), or `general` (P3)
- `/api/corroborate/:id?date=YYYY-MM-DD` — Yahoo Finance comparison between predicted direction and actual price movement on any historical date
- History page (`/history`) — owner can navigate to any past date, see that day's hypotheses, rate from memory, then reveal corroboration verdict after voting (preserving memory-based integrity)
- `hypothesis-generator.md` updated with full owner feedback integration section — reads both files before daily scan
- `hypothesis-validator.md` updated with owner ratings integration section — corroboration-gated soft evidence weighting (+3% when both owner and market confirm, −5% when both contradict)

**Key design decisions:**
1. Corroboration reveals AFTER the rating (not before) — preserves memory-based rating integrity
2. Owner ratings alone are +1–3% max; corroborated ratings are +3–5% or −5%; never override hard evidence
3. Bug feedback is always P0 — stops all feature work

**Extended RICE:** Reach 4 × Impact 4 × Confidence 0.9 / Effort 3 = 4.8 × Foundation ×1.5 (enables: calibration history, blind-spot auto-detection, owner learning velocity tracking, confidence accuracy by hypothesis type) × NSM ×1.25 = **Score 9.0**

---

---

### [BL-013] Gmail holdings sync — read-only email integration
**Priority:** P1
**Status:** Proposed
**Theme:** 📱 Output Clarity / 🎯 Prediction Accuracy
**Dependency:** BL-003 (portfolio mode logic — ✅ Done). This is the data source that feeds it.

**True need:** The owner's actual portfolio positions (current holdings + historical transactions) live in their Gmail inbox as emails from INDMoney, CDSL, Groww, and Motilal Oswal. Manually entering holdings into a file is friction that will never happen consistently. The sync should be automatic, read-only, and zero-privacy-risk.

**Configured senders (read-only, no reply, no action):**
| Sender | Content | What to extract |
|---|---|---|
| `transactions@transactions.indmoney.com` | Buy/sell confirmations | Ticker, direction (BUY/SELL), qty, date |
| `services@cdslindia.co.in` | CDSL demat CAS + confirmations | ISIN, company name, qty held |
| `noreply@motilaloswal.com` | Trade confirmations | Ticker, direction, qty, date |
| `noreply@daily.digest.groww.in` | Portfolio digest | Holdings snapshot (sanity check) |

**Architecture (designed in Session 4):**
- **Google Apps Script** (runs as owner's Google account — zero OAuth complexity on server side)
  - Searches Gmail for the 4 configured senders, 3-year lookback
  - Parses transaction emails with regex (buy/sell/qty/ticker or ISIN)
  - POSTs structured JSON to `POST /api/holdings-sync` on the Express server
  - Triggered on schedule (every 6 hours) via Apps Script time trigger
- **Server side** (already built in BL-003):
  - `/api/holdings-sync` receives the payload, builds position ledger, writes `holdings.json`
  - `ISIN_TO_TICKER` map (20 entries, expandable) resolves ISINs to Yahoo tickers
  - `nameToTicker()` fuzzy-matches company names as fallback

**Key design decisions:**
1. Read-only — the script only calls `GmailApp.search()` and reads message bodies. No labels, marks, replies, or modifications.
2. Runs as the owner's Google account inside Apps Script — no server-side OAuth tokens or credentials stored.
3. Regex tuning required: spend ~20 min looking at real emails from each sender and adjusting patterns before enabling the trigger. The 4 senders have different formats.
4. ISIN→ticker map grows organically — each new email that contains an ISIN that isn't in the map yet is logged and the owner adds the entry.
5. Network: the script POSTs to `http://192.168.1.14:3737/api/holdings-sync` (local IP). For public hosting, update to the hosted URL.

**What to build:**
- [ ] Google Apps Script file (`.clause/scripts/gmail-holdings-sync.gs`) with `syncHoldings()`, `parseTransactionEmail()`, regex patterns, time trigger setup instructions
- [ ] Regex tuning guide: how to open Gmail, find a sample email from each sender, extract the pattern
- [ ] ISIN→ticker expansion guide: where to look up ISIN→NSE code mappings
- [ ] Test: run Apps Script manually once, verify `holdings.json` updates, verify portfolio mode shows correct badges in web view

**Extended RICE:** Reach 5 × Impact 4 × Confidence 0.8 / Effort 2 = 8.0 × Foundation ×1.0 × NSM ×1.0 = **Score 8.0**
(Effort is low — server side is already built; only the Apps Script + regex tuning remains)

**Proof of value:** Owner opens portfolio mode and sees "🎯 Held" badges on hypotheses about stocks they currently hold, without manually entering any data. Observable: holdings.json updates automatically within 6 hours of a new transaction email arriving. Assumption: INDMoney/CDSL emails are structured enough for regex extraction (reasonable — confirmed format exists; 20 min tuning is sufficient).

---

### [BL-014] Mobile-triggered daily hypothesis cycle
**Priority:** P2
**Status:** Proposed
**Theme:** ⚡ Validation Velocity

**True need:** Owner wants to trigger the daily hypothesis cycle from iPhone without touching the Mac or Claude Code. Currently the cycle requires a manual Claude Code session prompt.

**Designed approach (Option B — review-then-apply):**
- **Trigger:** "▶ Run Cycle" button in web app header
- **Flow:** Phone → POST `/api/run-cycle` → server calls claude-opus-4-7 via Anthropic API (with web_search tool) → Claude runs SKILL.md cycle instructions → server stores daily summary + proposed confidence deltas → phone shows results with "Apply updates" button → user taps Apply → files written
- **Why Option B over full-auto:** Auto-write risks file corruption if Claude misformats structured output. Review step keeps owner in control and matches the current human-in-the-loop validation philosophy.

**Key design decisions to lock before build:**
1. Model: claude-opus-4-7 (most capable) or claude-sonnet-4-6 (cheaper, faster — ~$0.30/run vs $1–3). Recommend Sonnet with Opus fallback.
2. Show cost estimate before run (e.g. "~$0.80 estimated"). User confirms.
3. Streaming progress shown on mobile ("Searching for Iran signals… ✓", "Validating H-0007… ✓")
4. Structured output schema: Claude returns JSON with `{ summary, hypotheses: [{id, newConfidence, evidenceNote}], newHypotheses: [...] }` — server parses and applies
5. Rate limit: 1 run per 6 hours max (prevent accidental double-runs)

**Dependencies:** ANTHROPIC_API_KEY (✅ set), Express server running, hypothesis files accessible

**What's NOT in scope for v1:** Auto-scheduling (that's BL-004), push notifications (BL-004 extended), editing hypothesis content from mobile (separate feature)

**RICE:** Reach 2 × Impact 4 × Confidence 0.7 / Effort 3 = **1.87**
(Low reach — owner is the only user; high impact for daily workflow; medium-high effort for streaming + structured output parsing)

---

### [BL-016] Portfolio-aware decision support — "what does this mean for my position?"
**Priority:** P1
**Status:** Proposed
**Theme:** 🧠 Owner Intelligence / 🎯 Prediction Accuracy

**The insight that motivated this item:**
Owner is looking at H-0003 (India IT underperformance thesis). The card tells them the sector will continue underperforming until new revenue reports land. They want to ask: *"When is the Infosys earnings report?"* — and based on that answer, decide whether to hold or trim their current INFY exposure. That question requires three things the system already has but doesn't combine: (1) the hypothesis, (2) the owner's holdings, (3) upcoming real-world catalysts. No current UI surface brings all three together into a decision.

**This is different from BL-015 (general chatbot):** BL-015 answers questions *about* the hypothesis. BL-016 answers questions *about what to do given the hypothesis and your position*. The output is action-oriented, not just informational. The distinction: "what's the bear case?" (BL-015) vs "I hold 200 shares of INFY — should I hold through earnings?" (BL-016).

**The three inputs that power it:**
| Input | Source | Status |
|---|---|---|
| Hypothesis thesis, confidence, kills/confirms | Hypothesis `.md` file | ✅ Available |
| Owner's current holdings + exposure | `holdings.json` (BL-003) | ✅ Built, off by default |
| Upcoming catalysts (earnings dates, policy dates, events) | Real-time lookup via web search or earnings calendar API | ❌ Not built |

**The missing piece is catalyst awareness.** The chatbot in BL-015 can already answer "what's the bear case?" but can't answer "when is the Infosys earnings report?" without a live lookup. This item adds that lookup layer and combines it with holdings context.

**What to build:**

*Phase 1 — Catalyst-aware card (standalone, no chatbot required):*
- Add an "Upcoming catalysts" section to each expanded card
- Auto-populated by querying a free earnings calendar API (e.g. Yahoo Finance earnings, or a web search for "[company] earnings date Q1 FY27")
- Shows: company name, event type (earnings / policy meeting / index rebalance), date, expected impact on hypothesis confidence
- Example: on H-0003 → "📅 TCS Q1FY27 earnings: July 10, 2026 · Infosys Q1FY27: July 17, 2026 · Could update confidence ±10%"

*Phase 2 — Holdings-aware decision framing (requires BL-003 active + BL-015 chatbot):*
- When portfolio mode is on and the card involves a held stock, the chatbot (BL-015) gets a holdings context block injected:
  - "Owner holds 200 INFY. Average cost: ₹1,340. Current exposure: ₹2.68L."
- System prompt shifts to decision-support framing: "Given the owner's position and this hypothesis, help them think through the hold/trim/add decision."
- Chatbot answers questions like:
  - "When is the Infosys earnings report?" → looks up + answers
  - "Should I hold through earnings?" → reasons from hypothesis confidence + upcoming catalyst + position size
  - "What would make you change the thesis?" → answers from kills watch-items

*Phase 3 — Insight capture (same as BL-015):*
- Decision questions logged to `chat-log.json` with holdings context stripped
- PM agent reviews weekly: recurring decision questions → new card sections or automated alerts

**Guardrail:** This is not investment advice. The chatbot frames outputs as "here's how to think about it" not "here's what to do." The disclaimer in every response: *Analytical output for training purposes. Not investment advice.*

**Strategic dependency on BL-015 — epistemic, not just technical:**
Phase 2 requires BL-015 technically (chatbot modal). The more important dependency is epistemic: BL-015's chat logs must show the owner asking decision-support questions before Phase 2's scope is locked. Building Phase 2 without that evidence is a large bet on an unvalidated behavioral assumption. The logs are the validation gate. If they show informational questions only, Phase 2 should be redesigned before any build work starts.

**Dependencies:** BL-003 (✅ built), BL-015 chat logs (4-week validation gate), BL-015 modal (Phase 2 technical dependency), earnings calendar data source (to be selected at build time)

**RICE:** Reach 2 × Impact 5 × Confidence 0.75 / Effort 4 = **1.88**
(Single user but extremely high decision-making impact; effort is higher than BL-015 due to catalyst lookup + holdings integration)

**Proof of value:** Owner opens H-0003, sees "📅 Infosys earnings: July 17" in the card, asks "I hold INFY — is it worth holding through this?" and gets a structured answer grounded in the thesis confidence, the kill conditions, and their position size. They make a more informed hold/trim decision in under 60 seconds without leaving the app.

---

### [BL-015] Per-card chatbot — natural language Q&A with hypothesis context
**Priority:** P1
**Status:** ⚠️ Shipped without SOP — retroactive gates open
**Note:** Implemented 2026-05-28 before the Implementation Gate SOP existed. Feature is live and working. Retroactive obligations outstanding: Gate 2 (PRD review by Product Staff), Gate 3 (full test plan — 8 items unchecked), Gate 5 (tech proposal review). PRD at `product-staff/prds/marketpulse/BL-015-chat-interface.md`.
**Theme:** 🧠 Owner Intelligence / 📱 Output Clarity

**Strategic role — de-risking probe for BL-016:**
BL-015 is not just a simpler feature that precedes BL-016. It is the experiment that validates whether BL-016 is worth building at all. BL-016 (decision support) rests on a behavioral assumption: the owner will ask decision-making questions ("should I hold INFY through earnings?") rather than pure informational ones ("why is this bearish?"). If that assumption is wrong, the full BL-016 system — catalyst lookup + holdings integration + decision-framing prompts — is solving the wrong problem.

BL-015's `chat-log.json` answers that assumption cheaply, before BL-016 is built. The chat logs are not a side benefit — they are the primary validation gate.

**Validation gate:** After 4 weeks of BL-015 live, review `chat-log.json`. If >30% of questions are decision-oriented (position sizing, hold/trim reasoning, catalyst timing), proceed with BL-016 Phase 2 as designed. If not, revisit BL-016's premise before building — do not build a decision-support system for an owner who hasn't asked decision questions.

**True need:** The owner wants to interrogate a hypothesis in real time — ask "why is this bearish?", "what would change your mind?", "how does this relate to what I read about the Fed today?" — without having to context-switch to a separate tool. The card already contains all the data; the chatbot just needs to know it.

**User story:** Owner opens a card, taps 💬 icon → small modal opens with a chat input. They type a question in plain English. Claude answers with full awareness of that hypothesis's thesis, confidence, evidence log, confirms/kills, and market actuals. Each follow-up stays in the same context. Owner closes modal and continues browsing.

**Architecture:**
- **Trigger:** 💬 icon button in each card footer (next to 👍/👎 rating buttons)
- **Modal:** Bottom sheet on mobile, floating panel on desktop. Input box at bottom. Scrollable message history above.
- **Context injected into every request:**
  - Hypothesis title, one-liner, direction, magnitude, timeframe, confidence
  - Last 3 evidence log entries
  - Confirms + kills watch-items
  - Latest market actuals row
  - Current TX (TL;DR) lines
- **API:** New `POST /api/chat/:id` endpoint — receives `{ message, history[] }`, calls **claude-opus-4-7** (owner-specified; deeper reasoning on complex finance questions) with hypothesis context as system prompt, returns streaming response
- **Conversation memory:** Chat history stored in-memory per card per session (JS array). Not persisted — each new card open starts fresh. Acceptable for v1.
- **Insight capture:** Every chat session is appended to `web/chat-log.json` (keyed by hypothesis ID + timestamp). Reviewed by product-manager agent to surface new backlog items, recurring user questions, and feature signals.

**Key design decisions to lock before build:**
1. Model: **claude-opus-4-7** (owner decision — deeper reasoning on complex finance questions; ~$0.80–1.50/session vs Sonnet's ~$0.15; justified by the decision-quality requirement)
2. Streaming vs single response — streaming strongly recommended for perceived speed on mobile
3. Max context per message: cap evidence log at last 5 entries to keep token cost low (~600 input tokens per turn)
4. Chat log privacy: `chat-log.json` added to `.gitignore` (may contain owner's questions about positions)
5. System prompt tone: same "plain English, no jargon" tone as TX section — not a Bloomberg terminal, a smart friend who knows the thesis

**Insight loop (the second-order value):**
The chat logs are the most valuable output — they reveal what the owner actually wants to know that the current UI doesn't show. The product-manager agent reviews `chat-log.json` weekly and:
- Surfaces recurring questions → new card fields or UI sections
- Flags requests for data not currently tracked → new hypothesis fields or API integrations
- Identifies hypotheses the owner engages with most → confidence calibration signal

**What's NOT in scope for v1:** Persistent chat history across sessions, multi-card comparisons ("compare H-0003 and H-0005"), chat-driven hypothesis editing, sharing chat transcripts

**Dependencies:** ANTHROPIC_API_KEY (✅ set), streaming support in Express (✅ native), hypothesis file format stable (✅)

**RICE:** Reach 2 × Impact 5 × Confidence 0.8 / Effort 3 = **2.67**
(Low reach — single user; very high impact — transforms passive reading into active interrogation; medium effort — streaming endpoint + modal UI)

**Proof of value:** Owner opens H-0007 (Micron HBM) and asks "what's the bear case here?" — gets a direct answer grounded in the hypothesis's red-team notes and kill conditions, not a generic AI response. Observable: chat-log.json shows 5+ questions per week that weren't answerable from the card UI alone → each one is a backlog signal.

---

---

### [BL-017] News source integration — live signal feed from financial media
**Priority:** P2
**Status:** Proposed
**Theme:** 🎯 Prediction Accuracy / ⚡ Validation Velocity

**True need:** The desk's signal-scout currently relies on web search (via Claude's tool use) to find evidence for hypothesis validation. This means signal quality depends on what surfaces in a generic search — not what the best financial media has published. Integrating directly with structured news feeds (ET Markets, Financial Times, NY Times, Bloomberg wire) gives the desk access to higher-quality, more timely signals without needing to run a full Claude search session.

**Use cases this unlocks:**
1. **Automatic signal detection**: when ET Markets publishes a story mentioning "Infosys" or "crude oil", the desk can flag it against active hypotheses as a potential CONFIRMS/KILLS event — even without running the daily cycle
2. **Real-time validation triggers**: a Fed statement or Iran deal update surfaces in FT within minutes; without an integration the desk only picks this up at the next manual cycle
3. **Source quality tier enforcement**: T1 sources (FT, NYT, Bloomberg) can be distinguished from T3 (blogs) automatically if the feed has known source metadata

**Candidate integrations (in order of quality/cost):**
| Source | API / Access method | Cost | Coverage |
|---|---|---|---|
| **Financial Times** | FT Developer API (paid, ~$500/mo for commercial) | High | Excellent — global macro, EM, India |
| **NY Times** | Developer API (free for non-commercial, 500 req/day) | Free | Good — macro, Fed, US market |
| **ET Money / Economic Times** | No official API; scraping or RSS | Free / fragile | Best India coverage |
| **NewsAPI.org** | Aggregator — indexes 150+ sources incl. FT, Reuters | Free tier: 100 req/day; paid: $449/mo | Good breadth, variable depth |
| **RSS feeds** | FT free RSS, ET Markets RSS, Bloomberg free tier | Free | Limited articles; no paywall content |

**Recommended v1 approach (lowest effort, usable signal quality):**
- **NewsAPI.org free tier** for US sources (FT headlines, Reuters, Bloomberg wire summaries)
- **ET Markets RSS** for India (free, reliable, covers all major Nifty sectors)
- Parse feeds every 4 hours; store last 24h of headlines in memory; during validation cycle, filter by ticker or hypothesis keywords before passing to signal-scout
- No paywall bypass — headline + lede only (sufficient to flag "this is relevant, investigate further")

**What this does NOT do (v1):**
- No full article extraction (paywall constraint)
- No real-time push (polling every 4h is sufficient for non-ST hypotheses)
- No automatic confidence updates from headlines (headline is a flag, not evidence — still requires signal-scout to verify)

**Extended RICE:** Reach 5 × Impact 4 × Confidence 0.8 / Effort 2 = **8.0** × Foundation ×1.5 (enables: automatic CONFIRMS/KILLS trigger detection, BL-005 watch-item scanner, BL-004 richer daily cycle) × NSM ×1.25 = **Score 15.0**
(Foundation bonus because this becomes the data layer for BL-004, BL-005, and future real-time alert features)

**Proof of value:** The next time a major India market story breaks (RBI rate decision, budget announcement, earnings surprise), the desk surfaces it as a signal against the relevant hypothesis within 4 hours — without the owner needing to prompt Claude Code. Observable: signal-scout cites a news feed URL (not just a Yahoo Finance price) in at least 2 validation runs per week within 30 days of launch.

**Dependency:** None blocking. ANTHROPIC_API_KEY (✅ set) needed if signals are processed by Claude. RSS/NewsAPI access is server-side.

---

## Done

| ID | Feature | Shipped | Theme |
|---|---|---|---|
| BL-001 | Mobile web view — card layout, dark mode, responsive | 2026-05-27 | 📱 Output Clarity |
| BL-002 | Manual refresh button (↻) in web view | 2026-05-27 | ⚡ Validation Velocity |
| BL-003 | Portfolio mode — personalWeight, isHeld, sort, badges, weight bar | 2026-05-28 | 📱 Output Clarity |
| BL-007 | Owner ratings + feedback → hypothesis training signal | 2026-05-27 | 🎯 Prediction Accuracy / 🧠 Owner Intelligence |
| BL-008 | TX (Plain English) section in every card | 2026-05-27 | 📱 Output Clarity |
| BL-009 | Company selector + company list in expanded card | 2026-05-27 | 📱 Output Clarity |
| BL-010 | Light theme | 2026-05-27 | 📱 Output Clarity |
| BL-011 | History page with date navigation + corroboration reveal | 2026-05-27 | 🧠 Owner Intelligence |
| BL-012 | Natural language feedback with auto-classification (bug P0 / feature P2) | 2026-05-27 | 🎯 Prediction Accuracy |

---

## Deferred / Out of scope

| ID | Feature | Reason |
|---|---|---|
| — | Public hosting (Vercel/ngrok) | User decision: "host on website later" |
| — | DB migration (SQLite) | Foundation layer — after schema stabilizes, Q4 2026 |
| — | REST API layer | Platform leverage — after DB migration |

---

## Product Staff cross-project review — 2026-05-28

**Verdict: PASS — backlog is comprehensive and well-structured.**

The review found the Marketpulse backlog to be the most mature across all three projects. The theme framework (🎯 Prediction Accuracy, ⚡ Validation Velocity, 🌍 Coverage Breadth, 📱 Output Clarity, 🧠 Owner Intelligence, 🏗️ Platform Leverage, 🔧 Engineering Quality) is well-designed and complete.

**One open action requiring immediate attention:**
- **G8 breach** (Active-tier average confidence = 72.4%, cap = 70%) — red-team-skeptic must challenge H-0007 (82%), H-0003 (75%), H-0005 (70%). No new hypothesis filings until at least one is downgraded or the scores are defended with evidence. Logged in TEST-LOG.md.

**Structural observation:** BL-015 chatbot (Opus 4.7) → BL-016 decision support de-risk chain is correctly modelled. The probe-first pattern is working as designed. No changes recommended.

---

## PM notes

**Current product state (as of 2026-05-27):**
Web view live at port 3737 with real price charts. 10 active hypotheses. NSM (CPA) not yet measurable — insufficient resolved hypotheses. Leading proxy (Validation Freshness) depends on daily cycle running, which is currently manual.

**Immediate priority sequence:**
1. **BL-003** — portfolio-aware prioritization (owner shares holdings; this personalizes the entire web view)
2. **BL-004** — scheduled cron (unblocks BL-005 and long-term NSM measurement)
3. **BL-005** — watch-item scanner (first real-time capability)
4. **BL-006** — calibration dashboard (NSM visibility, requires resolved hypotheses first)

**Quality guardrail:** Any UI that makes it easier to file low-quality hypotheses is a regression. The proof-of-value gate applies to the desk's output features (hypotheses) as much as to the software features.

