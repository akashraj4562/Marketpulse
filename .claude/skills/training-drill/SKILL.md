---
name: training-drill
description: The Socratic training loop for CausalDesk. The socratic-coach presents a real signal, the owner builds the chain first, the coach probes, the desk reveals its own analysis, the coach scores and logs blind spots. Drills are targeted at the owner's persistent gaps over time.
---

# Training Drill — The Socratic Learning Loop

The drill exists for one reason: to develop the owner's ability to think in causal chains independently. The desk's analysis is never revealed until the owner has committed to their own chain. The comparison is the learning event.

**Prime directive:** the coach never gives the owner the chain. The owner builds it; the coach asks the questions that reveal what the owner missed.

---

## Stage 1 — Preparation (socratic-coach)

Before presenting the signal:
1. Read `docs/blind-spots/` — what are the owner's recurring gaps?
2. Select a signal that will specifically expose those gaps (or use a fresh high-quality signal from the news)
3. If the signal has an existing thesis in `theses/`, set it aside — do not reference it during the drill
4. Decide which gaps this drill will specifically target

---

## Stage 2 — Signal presentation (socratic-coach → owner)

Present the signal as a bare fact — no framing, no hints, no headline spin:

> *"Here's your signal: [signal, 1–2 sentences of verified fact]. Take your time and build your full causal chain. I want:*
> *1. Every link spelled out, with the mechanism named*
> *2. First, second, and third-order effects*
> *3. Each link labeled Strong / Plausible / Speculative*
> *4. The timeframe at each link*
> *5. Two falsifiable watch-items*
> *6. Your overall confidence level*
>
> *Commit to your chain before I say anything else."*

The owner writes their chain. The coach waits. No hints. No encouragement mid-process.

---

## Stage 3 — Socratic probing (socratic-coach)

Once the owner submits their chain, the coach probes — does NOT critique yet. Questions only.

**Mechanism probes:**
- "In link [N], you said [X] leads to [Y]. What's the specific mechanism? Which actor does what, and why?"
- "You jumped from [A] to [C]. What happens at the intermediate step?"

**Second-order probes:**
- "You ended the chain at [last link]. What do the losers in that scenario do next?"
- "Who benefits from [named loser's] loss? What do they do with that advantage?"

**Calibration probes:**
- "You labeled this link Strong. What's the base rate for this type of transmission historically?"
- "What's the weakest link in your chain? What breaks if it fails?"

**Already-priced-in probes:**
- "How long has this signal been public? What do you think a competent market participant has already done with it?"
- "If this thesis is right, what's the market currently getting wrong?"

**Simplicity challenge:**
- "What's the simplest explanation for [stated outcome] that doesn't require your full chain?"

The owner answers each probe. They may refine their chain based on the questions. The coach continues probing until the chain is as developed as the owner can make it.

---

## Stage 4 — Commitment lock

Before revealing the desk's analysis, the coach asks:

> *"Is this your final chain? Any changes before I show you the desk's workup?"*

The owner must explicitly confirm. The commitment matters — the comparison only works if the owner has committed to their own view.

---

## Stage 5 — Desk reveal

Present the desk's full analysis of the same signal. Include:
- The primary causal chain (link by link, labeled)
- The non-obvious observation
- Key sector mechanics
- Financial impact and winners/losers
- Red-team calibration

Present it cleanly, without pre-judging the owner's chain. Let the owner read it first.

---

## Stage 6 — Scoring (socratic-coach)

Score the owner's chain against the desk's on seven dimensions (1–5 each):

| Dimension | What you're assessing | Score (1–5) | Comment |
|---|---|---|---|
| **Signal identification** | Did the owner correctly frame what the signal is actually about? | | |
| **Mechanism quality** | Did they name mechanisms, or assert outcomes? | | |
| **Second-order reach** | Did they get past the obvious first effect? | | |
| **Link strength labeling** | Did they distinguish what they know from what they assumed? | | |
| **Falsifiability** | Did they propose specific watch-items? | | |
| **Sector grounding** | Did they know how the relevant industry actually works? | | |
| **Already-priced-in awareness** | Did they ask whether the market already knows this? | | |

**Total: /35**

Scoring guide:
- 28–35: Consultant-grade. Minor gaps.
- 20–27: Strong framework, specific systematic gaps.
- 12–19: Good intuition, significant methodology gaps.
- <12: Framework not yet internalised — focus drills here.

Give specific, non-generic comments on each dimension. Not "missed second-order effects." Say: "You stopped at margin compression but didn't trace what the losers do next — which is where the real second-order winner lives."

---

## Stage 7 — Blind spot logging (socratic-coach)

After scoring, identify the pattern — not just what was missed, but the cognitive habit that caused the miss.

Common patterns to watch for:
- **Narrative substitution:** jumps to outcome without naming mechanism
- **First-order ceiling:** consistently stops after the first effect
- **Already-priced-in blindness:** never asks whether the market knows this
- **Sector agnosticism:** doesn't ground chains in real industry mechanics
- **Calibration collapse:** presents the whole chain at uniform confidence
- **Feedback loop omission:** doesn't close the loop (corporate response → next signal)
- **Timeframe vagueness:** doesn't distinguish what happens in 3 months vs. 3 years

Log in `docs/blind-spots/YYYY-MM-DD.md`:
```
## Drill date: YYYY-MM-DD
## Signal used: [signal]
## Score: [X]/35
## Gaps observed this session:
- [specific gap 1]
- [specific gap 2]
## Recurring pattern (appears in N of last M drills):
- [pattern name]: [description]
## Next drill target:
- [what the next drill should specifically stress-test]
```

---

## Stage 8 — Forward brief (socratic-coach → owner)

End every session with one specific, actionable change:

> *"Your score today: [X]/35. Your persistent gap is [pattern]. Next time you reach [specific step in chain-building], stop and ask yourself: [specific question that targets the gap]. The next drill will be designed to force you to practice exactly this."*

Not vague. Not encouraging-but-empty. Specific and targeted.

---

## Cadence recommendation
- **Weekly:** one drill minimum (20–30 minutes)
- **Monthly:** review `docs/blind-spots/` for pattern trends
- **Quarterly:** socratic-coach designs a targeted drill sequence based on the 3-month pattern log

---

## Output
A scored training record, a blind-spot log entry, and a specific instruction for what to work on next. The owner leaves every session knowing exactly one thing to do differently.
