---
name: signal-to-thesis
description: The core workup pipeline for CausalDesk. Takes one verified signal and produces a complete, falsifiable thesis — running signal-scout verification, causal chain building, sector grounding, financial translation, strategic implications, red-team attack, and research-director synthesis. Outputs a filed thesis and a LEDGER row.
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

## Stage 3 — Sector mechanics (sector-specialist)

**Deliverable:** grounded industry mechanics that confirm, correct, or qualify the chain.

For the industry/industries the chain passes through:
- Map the cost structure: where does the shock enter the P&L?
- Assess pass-through timeline: what buffers exist (inventory, contracts, hedges)?
- Name substitution options and their speed
- Identify value chain winner and loser at the mechanics level
- Correct any chain links that don't match real industry dynamics

Flag where the chain needs correction before Stage 4 proceeds.

---

## Stage 4 — Financial impact (capital-markets-analyst)

**Deliverable:** named winners and losers, P&L/valuation impact, already-priced-in assessment.

Running in parallel with or immediately after Stage 3:
- Map P&L impact: which line items change, by how much, for which company types?
- Assess valuation/multiple effect
- Name winners and losers specifically (business model archetypes, not just "the sector")
- Run the already-priced-in test: what does consensus currently believe? Where does this thesis diverge?
- Identify capital flow implication
- Flag credit angle if relevant

Output: financial impact note with explicit assumptions and confidence level.

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

Resolve tensions from the crew. Synthesize into the final thesis using the standard format from CLAUDE.md §7:

```
# Thesis: [Short title]
Signal / Date initiated / Status

## Causal Chain
[Link by link, labeled Strong/Plausible/Speculative]

## Confidence & Timeframe

## Key Assumptions

## Falsifiable Watch-Items
- CONFIRM: [specific observable event]
- KILL: [specific observable event that falsifies]

## Red-Team Notes [verdict + any override log]

## Financial Impact & Winners/Losers

## Strategic Implications

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
