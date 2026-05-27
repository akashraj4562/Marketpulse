---
name: signal-to-thesis
description: The core workup pipeline for Marketpulse. Takes one verified signal and produces a complete, falsifiable thesis — running signal-scout verification, causal chain building, parallel behavioral audit + sector grounding, financial translation, strategic implications, red-team attack, and research-director synthesis. Outputs a filed thesis and a LEDGER row.
---

# Signal-to-Thesis — Full Workup Pipeline

A signal enters; a falsifiable, calibrated thesis comes out — or the chain is declared UNSUPPORTED. There is no third outcome.

## Before you start
The research-director confirms: (a) the signal is described clearly, (b) `theses/LEDGER.md` has been checked for prior work on similar signals, (c) there is no active thesis that would be contradicted without explicit acknowledgment.

---

## Stage 1 — Signal verification (signal-scout)

**Deliverable:** a clean signal package before any chain-building begins.

Run the verification checklist:
- **Source:** what is the primary source? Name it.
- **Date:** when did this occur? When was it reported? Is there a reporting lag?
- **Magnitude:** what are the numbers? How big is this?
- **Unknowns:** what is not yet established?
- **Novelty:** is this genuinely new, or is it a restatement of existing knowledge?
- **Correct framing:** what is this signal actually about at the mechanistic level?

**Gate:** if the signal cannot be verified from a credible primary source, the workup stops here. Unverified signals are not worked up.

Output format:
```
SIGNAL: [one sentence]
SOURCE: [primary source + URL]
DATE: [event date + report date]
MAGNITUDE: [quantitative where possible]
UNKNOWNS: [what is not established]
NOVELTY: [new / partially known / widely known]
FRAMING: [what domain/mechanism is this about?]
```

---

## Stage 2 — Causal chain building (causal-chain-analyst)

**Deliverable:** a structured chain with labeled links, candidate branches, and a non-obvious observation.

Build the chain link by link through the framework:
```
Signal → Incentive change → System response → Capital flow change 
→ Valuation effect → Corporate behavior change → Economic feedback
```

For each link:
- Name the **mechanism** (the specific actor, action, and consequence)
- Label the **strength**: Strong / Plausible / Speculative
- Estimate the **timeframe**: Immediate / Near-term / Medium-term / Long-term

Produce:
1. Primary chain (most likely sequence)
2. 1–2 alternative branches
3. The non-obvious observation (what does the desk see that a standard analyst would miss?)
4. The weakest links (flagged for red-team priority)

---

## Stage 3 — Parallel specialist passes (run simultaneously)

### Stage 3a — Sector mechanics (sector-specialist)

**Deliverable:** grounded industry mechanics that confirm, correct, or qualify the chain.

For the industry/industries the chain passes through:
- Map the cost structure: where does the shock enter the P&L?
- Assess pass-through timeline: what buffers exist (inventory, contracts, hedges)?
- Name substitution options and their speed
- Identify value chain winner and loser at the mechanics level
- Correct any chain links that don't match real industry dynamics

Flag where the chain needs correction before Stage 4 proceeds.

### Stage 3b — Behavioral audit (behavioral-psychologist)

**Deliverable:** the psychological mechanisms in the chain, behavioral signals confirming or contradicting it, and behavioral adjustments to timeframe and magnitude.

**Trigger:** this stage is mandatory when the signal involves a population-scale shock (epidemic, war, financial crisis, natural disaster, major regulatory shock, supply panic). It is optional but recommended for all other signals.

Run the behavioral audit:

1. **Psychological mechanism identification**
   Which links in the chain pass through human psychology? Name the specific mechanism:
   - Loss aversion / panic → hoarding → artificial demand
   - Mortality salience (TMT) → nesting / avoidance behavior shift
   - Social proof / herding → amplified herd move beyond fundamentals
   - Narrative contagion → self-fulfilling expectation
   - Trust collapse → contagion beyond fundamental damage
   - Availability heuristic → demand persists after threat resolves

2. **Behavioral signal check**
   Are behavioral leading indicators already moving?
   - Google Trends: search intent spikes for relevant terms?
   - Social media sentiment: fear/panic language volume rising?
   - Fund flows: flight-to-safety moves in gold, USD, bonds?
   - Consumer confidence: survey data showing expectation shift?
   - Options skew: institutional hedging behavior elevated?

3. **Timeframe adjustment**
   Behavioral effects often lead economic data by 2–8 weeks. Does the behavioral signal suggest the chain is ahead of or behind where fundamentals currently indicate?

4. **Magnitude adjustment**
   Will behavioral amplification (herding, panic) make this chain larger than the fundamental mechanism alone? Or will behavioral inertia (status quo bias, information avoidance) delay or dampen it?

5. **Behavioral winners and losers**
   Beyond the sector-specialist's structural winners/losers: which companies benefit specifically from the behavioral response (safety categories, hoarding beneficiaries, trust refugees)?

6. **Behavioral reversal prediction**
   Every behavioral overshoot contains a reversal. Identify: what does the second-order behavioral reversal look like, and what is its economic consequence?

**Output:** a behavioral audit note flagging: psychological mechanisms present, behavioral signals observed (with sources), timeframe/magnitude adjustments, behavioral winners/losers, and reversal prediction.

---

## Stage 4 — Capital markets translation (capital-markets-analyst)

**Primary deliverable:** a specific, testable capital market prediction. Supporting deliverable: fundamental P&L/valuation mechanics that justify the prediction.

Running in parallel with or immediately after Stage 3:

**Step 1 — Classify time horizon (mandatory first)**
Is this thesis Short-term (ST: ≤4 weeks), Medium-term (MT: 1–3 months), or Structural long-term (LT: 3–18+ months)? This governs how historical data is weighted throughout the thesis.

**Step 2 — Capital market prediction**
- Name the specific instrument (ticker, index, sector ETF, bond, currency)
- State predicted direction, magnitude range, and timeframe
- Identify the investor-type driver: which investor type (FII / DII / retail / HNI / hedge fund) is expected to move this, and why?
- Run the already-priced-in test: what does consensus currently believe? Where does this thesis diverge from that belief?

**Step 3 — Investor sentiment landscape**
- Pull FII/DII net data (NSE India data) for Indian instruments
- Check India VIX level and trend
- Check F&O open interest for directional positioning signals
- Assess whether the predicted investor-type driver is currently positioned consistently with the prediction

**Step 4 — Supporting fundamental analysis**
- Map P&L impact: which line items change, by how much, for which company types?
- Assess valuation/multiple effect
- Name winners and losers specifically (business model archetypes, not just "the sector")
- Identify capital flow implication
- Flag credit angle if relevant

Output: capital market prediction note with investor sentiment landscape, plus fundamental supporting evidence. Both sections included; capital market prediction section comes first.

---

## Stage 5 — Strategic implications (strategy-consultant)

**Deliverable:** what rational companies will do, how competitive dynamics shift, how the response feeds back.

- Define the strategic problem facing companies in the impact zone
- Map realistic options (absorb / pass through / substitute / invest / exit / lobby)
- Assess which option market leaders vs. weaker players will likely choose
- Name the competitive dynamic shifts and moat changes
- Close the loop: how does the aggregate corporate response become the next signal?
- Add India-specific or US-specific strategic nuances

---

## Stage 6 — Red-team attack (red-team-skeptic)

**Deliverable:** a genuine attack on the chain, per-link probabilities, and a verdict.

Deploy all eight attacks:
1. Weakest link
2. Simpler explanation
3. Base rates
4. Already priced in
5. Disconfirming evidence
6. Behavioral assumption scrutiny
7. Timing arbitrage
8. Magnitude reality check

Assign:
- Per-link probability
- Overall chain probability
- Thesis confidence: High / Medium / Low / Speculative
- Verdict: **SUPPORTED** / **CONDITIONALLY SUPPORTED** (with named conditions) / **UNSUPPORTED**

If UNSUPPORTED: state specific reasons and what would change the verdict. Workup pauses; research-director decides whether to continue.

---

## Stage 7 — Synthesis (research-director)

**Deliverable:** a complete, ready thesis or an explicit UNSUPPORTED log.

Resolve tensions from the crew — including any conflicts between the sector-specialist's structural timeline and the behavioral-psychologist's behavioral-lead timeline. Synthesize into the final thesis using the standard format from CLAUDE.md §7:

*Note: if the behavioral audit identified significant psychological mechanisms, the thesis must include a "Behavioral dimension" section stating: (a) the psychological mechanism(s) at work, (b) any observed behavioral signals, (c) the behavioral timeframe adjustment, and (d) the behavioral reversal to watch for.*

*Note: the Capital Market Prediction section leads the thesis — it is the primary testable claim. The fundamental analysis is supporting evidence for that claim.*

```
# Thesis: [Short title]
Signal / Date initiated / Status / Horizon: [ST / MT / LT]

## Capital Market Prediction
[Instrument | Direction | Magnitude | Timeframe | Investor-type driver]
[Investor sentiment landscape: FII/DII/retail posture]
[Already-priced-in assessment + market divergence statement]

## Causal Chain
[Link by link, labeled Strong/Plausible/Speculative]

## Confidence & Timeframe

## Key Assumptions

## Falsifiable Watch-Items
- CONFIRM (market): [specific price/flow event]
- CONFIRM (fundamental): [business-level confirmation]
- KILL (market): [price/flow that falsifies]
- KILL (fundamental): [business event that falsifies]

## Red-Team Notes [verdict + any override log]

## Supporting Fundamental Analysis
[P&L/valuation mechanics — named winners and losers]

## Strategic Implications

## Market Actuals Log [append-only — market-signal-reader updates]

## Outcome [blank — filled when resolved]

---
*Not investment advice. Analytical output for training purposes only.*
```

Check against the definition of ready in CLAUDE.md §6 before filing.

---

## Stage 8 — Filing and logging

1. Save thesis to `theses/<slug>.md`
2. Add a row to `theses/LEDGER.md`:

| # | Date | Slug | Signal (1 line) | Chain summary | Confidence | Timeframe | Status | Outcome |
|---|---|---|---|---|---|---|---|---|
| N | YYYY-MM-DD | slug | signal | A→B→C→D | H/M/L/Spec | X months | Live | — |

3. Record any significant desk decisions in `docs/decisions/<date>-<slug>.md`

---

## Output
A complete, filed thesis with a LEDGER entry — or an explicit UNSUPPORTED entry in the LEDGER with reasons logged. Both outcomes are valid. The UNSUPPORTED entries are calibration data.
