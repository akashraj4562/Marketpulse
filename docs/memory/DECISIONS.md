# Marketpulse — Architectural Decisions
> Append-only. Never delete a decision — mark it SUPERSEDED if overridden.
> Format: newest first within each section.

---

## Product / output decisions

### DEC-006 — Confidence band degrades visually to 45% noise floor (2026-05-27)
**Decision:** Prediction confidence degrades linearly from hypothesis confidence to 45% (not 0%) over the forecast window. Band width widens by 3.5× by end of Y.
**Why:** 45% represents the random walk baseline for daily stock movements. Below that the chart gives false precision. The band widening visually communicates "don't trade off day Y+30 of a 30-day prediction."
**How it works:** `conf = conf0 * (1-t) + 0.45 * t` where t goes 0→1 across Y days.

### DEC-005 — Yahoo Finance ticker resolution priority order (2026-05-27)
**Decision:** Ticker extracted in this order: (1) exchange-qualified code in primary segment e.g. `NSE: NIFTYIT`, (2) TICKER_MAP scan on first `/`-token, (3) TICKER_MAP scan on full primary group, (4) TICKER_MAP scan on full instrument string, (5) first ALL-CAPS fallback.
**Why:** Instrument fields have multiple tickers ("MU; SOXX as proxy") — primary instrument always comes before semicolons. Exchange codes are most authoritative.
**Edge cases known:** USD/INR has no exchange code but `USD/INR` is in TICKER_MAP. Phase-1/Phase-2 hypotheses (H-0010) use exchange codes in the first sentence.

### DEC-004 — Forecast Y is bounded by horizon class (2026-05-27)
**Decision:** ST max 21 trading days, MT max 90, LT max 180. Y = min(max, histDays × multiplier).
**Why:** Showing a 1-year prediction for an ST hypothesis (meant to resolve in 4 weeks) erodes the chart's usefulness. The timeframe stated in the hypothesis is the trust boundary.

### DEC-003 — Market auto-detection from instrument field (2026-05-27)
**Decision:** Market (India/US/Global) is auto-detected via regex on instrument names rather than requiring a `Market: India` field in every hypothesis.
**Why:** Backward-compatible with the 6 India hypotheses already filed without an explicit Market field. If the field exists, it wins; otherwise regex detects.
**Regex logic:** NSE|BSE|NIFTY|BPCL|... → India; NASDAQ|NYSE|S&P|MU|CRWD|... → US; else Global.

### DEC-002 — Capital market prediction is the PRIMARY output (2026-05-27)
**Decision:** Every hypothesis must have an instrument, direction, magnitude, timeframe, and investor-type driver. Business P&L analysis is the supporting scaffolding, not the product.
**Why:** "Margins compress" is not testable daily. "BPCL +15–25% if Iran deal closes" is. The desk produces testable predictions, not commentary.

### DEC-001 — Causality + Correlation always sum to 100 (2026-05-27)
**Decision:** Every hypothesis has Causality score (mechanism tightness) and Correlation score (noise/common factor). They always sum to 100.
**Why:** Forces the analyst to explicitly allocate between "I have a mechanism" and "I'm pattern-matching." A Causality of 30 with Correlation of 70 is a very different thesis than 80/20 — it should be visible.

---

## Technical decisions

### DEC-T005 — yahoo-finance2 v3 instantiation with suppressNotices (2026-05-27)
**Decision:** Use singleton `new YFClass({ suppressNotices: ['ripHistorical'] })` + `validateResult: false` on chart() calls.
**Why:** v3 changed API from `require().default` singleton to `new YFClass()`. `validateResult: false` needed for Indian indices (NSE symbols return null currency field which fails schema but data is valid).

### DEC-T004 — Chart.js via CDN, no build step (2026-05-27)
**Decision:** `<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/...">` in the HTML. No npm install for front-end.
**Why:** Server is a single server.js file with inline HTML. No webpack, no build step. CDN keeps it simple.

### DEC-T003 — Express + inline HTML, no framework (2026-05-27)
**Decision:** Entire web app is one `server.js` file — Express routes, API endpoints, and the HTML page are all inline.
**Why:** Zero build tooling. Works on any machine with Node. No React/Next.js overhead for what is essentially a markdown reader + chart renderer.

### DEC-T002 — Node.js path: `/Users/priyanka/node-v24.16.0-darwin-arm64/bin` (2026-05-27)
**Decision:** npm/node are not on the default PATH in Claude Code shells. Must prefix commands with `PATH="/Users/priyanka/node-v24.16.0-darwin-arm64/bin:$PATH"`.
**Why:** Node installed as a standalone binary, not via nvm or Homebrew. Claude shells don't inherit .zshrc.
**SUPERSEDED BY:** Nothing yet — still needed.

### DEC-T001 — Port 3737 (2026-05-27)
**Decision:** Web view runs on port 3737 (not 3000 or 8080) to avoid conflicts with other dev servers.
**Why:** User has other projects (ClearCart, TrueRating) that may use 3000.

---

## Agent / workflow decisions

### DEC-A003 — Source quality tiers T1–T4 with iron rule (2026-05-27)
**Decision:** Any specific number cited in a hypothesis must be sourced from T1 (government/wire/company filings) or T2 (institutional research). T3 = directional only. T4 = zero weight.
**Why:** "Confident, plausible-sounding causal fiction" is the primary failure mode of the desk. Explicit tier tagging forces quality consciousness.

### DEC-A002 — Time horizon classification (ST/MT/LT) with data weighting (2026-05-27)
**Decision:** ST (≤4 weeks): last 3–6 months data dominant, older = context only. MT (1–3 months): last 6–18 months primary. LT (3–18+ months): last 1–2 years primary, 3–5+ years valid for cycle analysis.
**Why:** Applying 5-year historical analogs to a 1-week sentiment-driven thesis is a calibration error. The desk explicitly adjusts data weight by horizon.

### DEC-A001 — 7 override types for when prediction ≠ actual (2026-05-27)
**Decision:** When a predicted direction doesn't match actual market movement, the validator must diagnose using one of: Macro override, Investor-type mismatch, Already priced, Sentiment override, Factor rotation, Timing error, Thesis error.
**Why:** "The market didn't move as predicted" is not a complete answer. The override type is the learning event — it reveals whether the thesis mechanism was wrong or just the timing.
