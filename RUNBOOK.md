# RUNBOOK.md — Running Marketpulse

You are the owner and board. The desk reasons; you direct and train. This file tells you exactly what to do and say.

---

## The two systems at a glance

| | Thesis pipeline | Hypothesis portfolio |
|---|---|---|
| **What it is** | Deep point-in-time workup on one signal | Living portfolio of scored cause-effect claims |
| **Cadence** | On-demand | Daily |
| **Output** | Filed thesis in `theses/` | Updated `hypotheses/PORTFOLIO.md` |
| **Prompt** | `research-director: new signal — [X]. Run a full workup.` | `research-director: run the daily hypothesis cycle.` |

---

## DAILY — The hypothesis cycle (most important habit)

**Run every day with:**
```
research-director: run the daily hypothesis cycle.
```

**Run weekly (add on Fridays) with:**
```
research-director: run the daily hypothesis cycle with prediction pass.
```

**What you receive:** a daily summary with new hypotheses filed, significant confidence movements (≥15%), threshold crossings (developing → active = something is forming), and tomorrow's P1 queue.

**Your decision after the summary:**
- Any hypothesis that crossed 60% → worth monitoring closely
- Any hypothesis where confidence moved ≥20% in a single day → consider a full thesis workup
- Any hypothesis the validator flagged as needing red-team review → route to red-team-skeptic

**Hypothesis portfolio prompts:**
```
# See the full portfolio
research-director: summarise the current hypothesis portfolio by sector.

# Deep-dive one hypothesis
hypothesis-validator: run a deep validation on H-NNNN. Pull all available evidence.

# Attack a high-confidence hypothesis
red-team-skeptic: attack hypothesis H-NNNN. No politeness.

# Promote a hypothesis to a full thesis
research-director: H-NNNN has reached 75% confidence. 
Run a full signal-to-thesis workup using this hypothesis as the signal.

# Monthly health check
research-director: run the monthly portfolio health check.
```

---

## PHASE 1 — Running a signal workup

### When to use
You've spotted a signal — a news item, data release, regulatory move, weather event, supply shock, geopolitical development — and you want the desk to build a full causal-chain thesis.

**Rule:** the signal should be real, recent, and verifiable. Don't work up rumors. Let the signal-scout do the verification before the chain is built.

### How to run it

**Prompt to use:**
```
research-director: new signal — [describe the signal in 1–3 sentences: what happened, 
where, when, what the initial obvious effect is]. Run a full signal-to-thesis workup.
```

**Example:**
```
research-director: new signal — India's BIS has issued a mandatory quality certification 
order for 371 product categories, effective [date], requiring certification before import. 
This affects a wide range of consumer goods currently imported from China. 
Run a full signal-to-thesis workup.
```

### What happens next
The research-director sequences the crew through the `signal-to-thesis` skill:
1. Signal-scout verifies and frames
2. Causal-chain-analyst builds chains (first/second/third order)
3. Sector-specialist grounds the mechanics
4. Capital-markets-analyst quantifies financial impact
5. Strategy-consultant draws strategic implications
6. Red-team-skeptic attacks and calibrates
7. Research-director synthesizes the final thesis
8. Thesis saved to `theses/<slug>.md` and a row added to `theses/LEDGER.md`

### If the red-team returns UNSUPPORTED
The research-director will surface this to you with the reasons. Your options: (a) drop the signal, (b) ask the chain-analyst to re-examine with the red-team's objections in scope, or (c) log it as UNSUPPORTED in the LEDGER for calibration purposes (weak signals are calibration data too).

---

## PHASE 2 — Running a training drill

### When to use
Regularly — at least once a week. The desk's theses compound in value over time; so does your judgment, but only if you practice. The training drill is where you build the muscle.

**Prompt to use:**
```
socratic-coach: run a training drill.
```

Or, to target a specific domain:
```
socratic-coach: run a training drill on [commodities / India regulation / 
energy / supply chains / rates / geopolitics / sector of your choice].
```

### What happens next
1. The coach presents a real signal (or uses one from the pending LEDGER)
2. **You build the chain first** — write out your full causal chain, link by link
3. Coach probes your reasoning with questions. You answer.
4. Only after you've committed does the desk reveal its own workup
5. Coach compares your chain to the desk's, names where you added insight, where you missed a link, where you short-circuited to conclusion
6. Coach scores you and records patterns in `docs/blind-spots/`

**Critical rule:** do not look at the desk's thesis first. The entire value of the drill comes from committing to your own chain before seeing the answer. Treat this like a closed-book exam.

### Scoring rubric (the coach uses this)
- **Signal identification:** did you correctly frame what the signal actually is?
- **Mechanism quality:** did you name mechanisms, or just assert outcomes?
- **Second-order reach:** did you get past the obvious first effect?
- **Link strength labeling:** did you distinguish what you know from what you assumed?
- **Falsifiability:** did you propose any watch-items?
- **Sector grounding:** did you know how this industry actually works?
- **Already-priced-in awareness:** did you ask whether this is novel?

---

## PHASE 3 — Monitoring live theses

### Weekly cadence (10 minutes)
```
research-director: do a quick pass on live theses in the LEDGER. 
For each: has anything confirmed or killed a watch-item this week? 
Flag anything that needs a deeper review.
```

### When a watch-item fires
```
research-director: watch-item "[describe]" has fired on thesis [slug]. 
Update the thesis and score it.
```

### When a thesis resolves (timeframe expires or thesis is clearly confirmed/falsified)
```
research-director: score thesis [slug]. The timeframe has passed / 
the outcome is now visible. What did the chain get right, what did it miss, 
and what does that tell us about our methodology?
```

The scored outcome goes into `theses/<slug>.md` under "Outcome" and the LEDGER row is updated. **This is the calibration data that makes the desk get better over time.**

---

## PHASE 4 — Deepening a thesis

### Drill down on a specific link
```
causal-chain-analyst: the link "[link]" in thesis [slug] feels weak. 
Re-examine it. What mechanism makes it hold or break?
```

### Get the skeptic to attack harder
```
red-team-skeptic: give thesis [slug] your hardest attack. 
Assume the chain is wrong. What's the most likely reason?
```

### Update after new information
```
research-director: new information — [describe]. 
Update thesis [slug] accordingly. Has our confidence changed?
```

---

## PHASE 5 — Building calibration over time

Every 3 months, run:
```
research-director: calibration review. Look at all scored theses in LEDGER.md. 
Where were we systematically overconfident? Where did we miss second-order effects? 
What types of signals consistently fool us? 
What should we adjust in our methodology?
```

And:
```
socratic-coach: review docs/blind-spots/. What are the owner's persistent gaps? 
Design the next 4 training drills to target those specific patterns.
```

---

## Signal sources — where to hunt

The signal-scout can search; you can also bring signals from these domains:

| Domain | Why it matters |
|---|---|
| **Commodities** | Input cost shocks propagate through supply chains for years |
| **India regulation** | Policy changes in India often create asymmetric impacts on local vs global businesses |
| **US Fed / rates** | Capital cost changes affect every levered business and EM currency |
| **Weather / climate events** | Supply disruptions with long tails (Thai floods, Fukushima) |
| **China industrial policy** | Overproduction → global commodity price → margin destruction in other geographies |
| **Tech adoption curves** | Platform shifts that move cost structures (cloud, AI, electric) |
| **Labor market changes** | Wage changes ripple through services, consumption, and corporate margins |
| **Energy markets** | Input to almost every supply chain; underpriced in most analyses |
| **Shipping / logistics** | The transmission belt; disruptions surface everywhere, quickly |
| **Geopolitics / trade policy** | Create sudden substitution dynamics, supply reconfigurations |

**Rule of thumb:** the best signals look economically irrelevant when they first appear. If it's already in the FT headline, the market knows. Hunt for the footnote that becomes the headline.

---

## Quick reference — all prompts

### Hypothesis portfolio (daily system)
| Task | Prompt |
|---|---|
| **Daily cycle** | `research-director: run the daily hypothesis cycle.` |
| **Daily cycle + weekly predictions** | `research-director: run the daily hypothesis cycle with prediction pass.` |
| Portfolio overview | `research-director: summarise the current hypothesis portfolio by sector.` |
| Deep-validate one hypothesis | `hypothesis-validator: run a deep validation on H-NNNN. Pull all available evidence.` |
| Attack a hypothesis | `red-team-skeptic: attack hypothesis H-NNNN. No politeness.` |
| Promote to full thesis | `research-director: H-NNNN has reached [X]% confidence. Run a full signal-to-thesis workup.` |
| Generate predictions now | `hypothesis-predictor: run a prediction pass on the current portfolio.` |
| Monthly health check | `research-director: run the monthly portfolio health check.` |

### Thesis pipeline (on-demand)
| Task | Prompt |
|---|---|
| New signal workup | `research-director: new signal — [signal]. Run a full signal-to-thesis workup.` |
| Weekly thesis review | `research-director: quick pass on live theses. Anything firing?` |
| Score a resolved thesis | `research-director: score thesis [slug].` |
| Attack a thesis chain | `red-team-skeptic: attack thesis [slug]. No politeness.` |
| Deepen a link | `causal-chain-analyst: re-examine the link [link] in [slug].` |
| Quarterly calibration | `research-director: calibration review of all scored theses.` |

### Behavioral psychology
| Task | Prompt |
|---|---|
| Behavioral audit on a thesis | `behavioral-psychologist: run a behavioral audit on thesis [slug]. What psychological mechanisms are in this chain and what behavioral signals should we be watching?` |
| Behavioral signals check | `behavioral-psychologist: scan current behavioral signals — Google Trends, sentiment, fund flows — for any active fear or panic patterns. What's forming?` |
| Behavioral hypothesis | `behavioral-psychologist + hypothesis-generator: file a behavioral hypothesis for [current trigger]. Apply the [panic/mortality salience/trust collapse/narrative inflation/herding] template.` |
| Behavioral reversal check | `behavioral-psychologist: hypothesis H-NNNN predicts a behavioral overshoot. What does the reversal look like and when?` |

### Training
| Task | Prompt |
|---|---|
| Training drill | `socratic-coach: run a training drill.` |
| Targeted drill | `socratic-coach: run a training drill on [domain].` |
| Behavioral training drill | `socratic-coach: run a training drill with the behavioral-psychologist scoring the behavioral reasoning dimension.` |
| Blind-spot targeting | `socratic-coach: review blind-spots and design targeted drills.` |
