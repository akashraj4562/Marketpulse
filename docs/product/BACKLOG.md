# Marketpulse Product Backlog

> Maintained by product-manager. Updated as feature requests come in.
> Priority tiers: **P0** (blocking — do now) / **P1** (high — next sprint) / **P2** (queue) / **P3** (later) / **Defer** / **Out of scope**
> Status: `Proposed` → `Scoped` → `In Progress` → `Done`

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
| ⚡ Validation Velocity | Scheduled cron, watch-item scanner | Push notifications |
| 🌍 Coverage Breadth | Europe/Asia hypotheses | Commodity sector |
| 📱 Output Clarity | Portfolio-aware sorting (BL-003) | Summary digest, share card |
| 🧠 Owner Intelligence | Blind-spot tracker | Calibration history |
| 🏗️ Platform Leverage | Schema freeze | SQLite migration |

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

## Done

| ID | Feature | Shipped | Theme |
|---|---|---|---|
| BL-001 | Mobile web view — card layout, dark mode, responsive | 2026-05-27 | 📱 Output Clarity |
| BL-002 | Manual refresh button (↻) in web view | 2026-05-27 | ⚡ Validation Velocity |

---

## Deferred / Out of scope

| ID | Feature | Reason |
|---|---|---|
| — | Public hosting (Vercel/ngrok) | User decision: "host on website later" |
| — | DB migration (SQLite) | Foundation layer — after schema stabilizes, Q4 2026 |
| — | REST API layer | Platform leverage — after DB migration |

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

