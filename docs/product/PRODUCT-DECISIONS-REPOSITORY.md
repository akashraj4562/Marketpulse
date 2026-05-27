# Product Decisions Repository
> A reference library of real product decisions made under ambiguity — by renowned PMs and companies.
> Used by the product-manager agent when facing an ambiguous fork without clear data.
> Format: Situation → Known facts → Unknowns → Problem → Decision → Outcome → Lesson
> Append-only. Mark entries GOOD / BAD / MIXED to distinguish learning type.

---

## How to use this repository

When facing an ambiguous decision:
1. **Pattern-match the situation**: is this a "defend the moat" problem? A "pivot vs. persist" problem? A "copy the competitor" problem? A "platform bet" problem?
2. **Find the closest analog** in this repository
3. **Extract the lesson** for the specific Marketpulse context
4. **Take the call** — document your reasoning and move. Do not wait for perfect data.

---

## DEC-PS-001 — Steve Jobs removes Flash from iPhone [GOOD]
**Date:** 2010 | **Company:** Apple | **PM:** Steve Jobs

**Situation:** Flash was the dominant web multimedia format. 75%+ of web video used Flash. Developers were furious at the removal. Android planned to ship Flash.

**Known facts:** Flash had documented battery drain and crash rates on mobile. Apple had a working HTML5 implementation. Major web publishers were willing to build alternatives if Apple forced it.

**Unknowns:** Would the web migrate to HTML5? Would Android's Flash advantage kill iPhone adoption? Would developer anger translate to consumer revolt?

**Problem:** Ship iPhone with Flash (own battery/crash problems) OR remove Flash (bet the open web would follow Apple's lead).

**Decision:** Remove Flash entirely. Publish an open letter explaining the reasoning: performance, battery, security, open web.

**Outcome:** Flash dead by 2017. HTML5 became universal. iPhone adoption accelerated. Jobs was right.

**Lesson for Marketpulse:** When you see a clearly inferior pattern in use (T3/T4 sources in hypotheses; markdown when DB is needed), make the platform call clearly and early. Don't maintain backward compatibility indefinitely to avoid short-term pain.

---

## DEC-PS-002 — Slack pivots from gaming to enterprise messaging [GOOD]
**Date:** 2013 | **Company:** Tiny Speck → Slack | **PM:** Stewart Butterfield

**Situation:** The game (Glitch) had zero growth. The internal communication tool built for the distributed team was used daily and loved. 2 years of runway remaining.

**Known facts:** Game had 0 growth trajectory. Internal tool worked and people loved using it. Enterprise email (Outlook) was universally disliked.

**Unknowns:** Was the tool good because they built it for themselves (insider bias)? Was there an enterprise market? Would buyers pay for a chat tool?

**Problem:** Pivot to the internal tool (lose original vision, bet on unproven market) OR double down on the game (keep vision, likely die).

**Decision:** Pivot. Ship publicly. Give to beta users free. Ask for brutal honest feedback.

**Outcome:** $7B acquisition by Salesforce. Slack redefined enterprise communication.

**Lesson for Marketpulse:** If the tool you built for yourself is something you personally open daily — that is stronger validation than any user research. The owner opening Marketpulse to check hypotheses is the signal. Don't wait for external validation.

---

## DEC-PS-003 — Instagram copies Snapchat Stories [GOOD]
**Date:** 2016 | **Company:** Instagram/Facebook | **PM:** Kevin Systrom

**Situation:** Snapchat Stories was growing fast with younger users. Instagram's identity was "beautiful, permanent photos." Stories are ephemeral — the opposite of Instagram's identity.

**Known facts:** Instagram had 400M MAU. Snapchat had 100M DAU but faster growth. The Stories format was genuinely loved by Snapchat's users.

**Unknowns:** Would copying harm Instagram's brand? Would existing users revolt? Would Snapchat keep growing anyway?

**Problem:** Copy Snapchat (risk being called unoriginal, dilute identity) OR protect identity (watch Snapchat take the next generation).

**Decision:** Launch Instagram Stories. Publicly acknowledged inspiration from Snapchat. Shipped fast.

**Outcome:** Instagram Stories hit 500M DAU. 5× Snapchat's entire user base within 2 years. Snapchat never recovered.

**Lesson for Marketpulse:** Don't protect a product identity so fiercely that you miss what users actually want. If a simpler "just show me today's top 2 calls" format works better for the owner than the full card view, ship the simpler format even if it contradicts the "research desk" positioning.

---

## DEC-PS-004 — Amazon Prime's flat-fee loyalty bet [GOOD]
**Date:** 2005 | **Company:** Amazon | **PM:** Jeff Bezos

**Situation:** Shipping costs were cited as the top cart abandonment reason. Free shipping offers worked but were one-off, not loyalty-building.

**Known facts:** Frequent buyers were dramatically more valuable. Flat annual fee for unlimited shipping had never been tried at scale. Internal teams modeled it as a money-loser.

**Unknowns:** Would customers pay $79/year upfront? Would members order enough more to offset the cost? Would the commitment mechanism actually change behavior?

**Problem:** Free shipping as loss-leader (erodes margin, no loyalty) OR annual fee (builds commitment but requires customers to bet on their own behavior).

**Decision:** Launch Amazon Prime at $79/year. Absorb the short-term loss.

**Outcome:** Prime became Amazon's most powerful moat. 200M+ subscribers. Prime members spend 2× non-Prime.

**Lesson for Marketpulse:** Commitment mechanisms work. The effort of entering portfolio holdings for BL-003 personalization is not friction — it is the commitment that makes the feature valuable. Don't remove the upfront work to lower the barrier; lower the perceived cost of the work instead.

---

## DEC-PS-005 — Google Maps acquires Waze instead of building [GOOD]
**Date:** 2013 | **Company:** Google | **PM:** Sundar Pichai / Maps team

**Situation:** Google Maps was dominant. Waze had crowd-sourced real-time traffic data that Google lacked. Waze had 50M users vs. Google Maps' 1B+.

**Known facts:** Waze's real-time data was genuinely better for routing. The data advantage came from the community, not engineering. Facebook was also bidding.

**Unknowns:** Could Google replicate the Waze community? Would Waze users keep contributing under Google ownership?

**Problem:** Build from scratch (3–5 years, uncertain community density) OR acquire Waze ($1.1B, preserve community, own the moat).

**Decision:** Acquire Waze for $1.1B. Keep the app separate. Let the community continue.

**Outcome:** Waze data significantly upgraded Google Maps routing. Community kept contributing. Facebook/Apple blocked from owning real-time traffic data.

**Lesson for Marketpulse:** Some capabilities cannot be built — they must be accumulated. The desk's "hypothesis quality moat" builds through the owner using the tool, validating predictions, and seeing calibration improve. Do not try to shortcut the learning velocity with features. The features are the scaffold; the owner's judgment development is the moat.

---

## DEC-PS-006 — BlackBerry refuses to launch a touchscreen [BAD]
**Date:** 2007–2009 | **Company:** Research In Motion | **PM:** Mike Lazaridis / Jim Balsillie

**Situation:** iPhone launched June 2007. BlackBerry had 47% US smartphone market. The physical keyboard was seen as a core enterprise advantage. Early iPhone had no 3G, no copy-paste, no push email.

**Known facts:** BB had massive enterprise contracts. Physical keyboard was objectively faster for email. iPhone had real technical weaknesses in v1.

**Unknowns:** Would the touchscreen get good enough to match physical keyboard speed? Would enterprise buyers follow consumer preferences or lead them?

**Problem:** Build a touchscreen competitor (cannibalize the keyboard identity) OR defend the keyboard (bet that enterprise would be stickier than consumers).

**Decision:** Defend the keyboard. Dismiss the touchscreen as a consumer toy. Delayed touchscreen entry until 2013 (BB Storm — widely considered too late, poorly executed).

**Outcome:** BlackBerry from 47% US market share (2007) to <1% by 2016. Enterprise buyers followed consumers.

**Lesson for Marketpulse:** Do not mistake current user behavior for permanent user preference. If the owner reads hypotheses on a desktop today, that does not mean they wouldn't prefer a better mobile experience — it means they've adapted to the current constraint. Always test the constraint, not just the behavior.

---

## DEC-PS-007 — Netflix burns the DVD boats (gradually) [MIXED]
**Date:** 2011–2013 | **Company:** Netflix | **PM:** Reed Hastings

**Situation:** 24M DVD subscribers generating $400M free cash flow. Streaming had 12M subscribers growing fast. Qwikster (DVD spinoff) announced → consumer outcry → plan reversed. Then gradual transition happened anyway.

**Known facts:** DVD was more profitable per user. Streaming library was inferior. Brand was "Netflix = DVDs" for most.

**Unknowns:** How fast would streaming content licensing mature? Would DVD business slow streaming investment by competing for capital?

**Problem:** Split the company (Qwikster) OR transition gradually while keeping the brand unified.

**Decision (first attempt — BAD):** Announce Qwikster as a DVD spinoff. Massive consumer revolt. Reversed within weeks. Lost 800,000 subscribers.
**Decision (second attempt — GOOD):** De-prioritize DVD quietly. Invest aggressively in streaming originals. Let DVD atrophy naturally without drama.

**Outcome:** Netflix became the dominant streaming service. DVD subscribers declined gracefully. Originals (House of Cards, Stranger Things) created the content moat.

**Lesson for Marketpulse:** The way to transition from "current working state" to "better future state" is not to split the product — it is to de-prioritize the old and invest in the new without drama. For the desk: when migrating from markdown to a database, don't announce a new system. Simply build the DB layer while markdown keeps working. Migrate quietly.

---

## DEC-PS-008 — Spotify kills social sharing, bets on algorithmic curation [GOOD]
**Date:** 2015 | **Company:** Spotify | **PM:** Gustav Söderström

**Situation:** Spotify had launched with a heavy Facebook social integration. Users could share what they were listening to. The feature had low engagement and was creating "listen anxiety" (people changing what they listened to because others could see).

**Known facts:** Social listening was built on the assumption that "what your friends listen to" is useful signal. Actual usage data showed most users turned off the social feature. Discover Weekly (algorithmic) was being tested internally with excellent early signals.

**Unknowns:** Would algorithmic curation scale to 100M+ users? Would removing social sharing anger the "power sharers"? Would Discover Weekly cannibalize playlist creation?

**Problem:** Double down on social (defend the original thesis, risk "listen anxiety") OR bet on algorithmic curation (break from Facebook-era social music assumption).

**Decision:** Prioritize Discover Weekly. De-emphasize social sharing. Launch Discover Weekly publicly in 2015.

**Outcome:** Discover Weekly hit 40M listeners in its first 10 weeks. Became one of the most-loved Spotify features. Social sharing quietly faded.

**Lesson for Marketpulse:** Usage data > stated preferences. If the owner says they want more features but the actual behavior shows they primarily use 2–3 core features (confidence scores, watch items, market direction), optimize those 3 rather than building breadth. Run a Discover Weekly equivalent: find the one "magic moment" in Marketpulse and make it happen automatically.

---

## DEC-PS-009 — Twitter's 140-character limit as product identity [GOOD → EVOLVED]
**Date:** 2006–2017 | **Company:** Twitter | **PM:** Jack Dorsey → later product teams

**Situation:** 140-character limit was originally an SMS constraint. As Twitter grew, users wanted longer posts. Internal pressure to increase the limit. The constraint was seen as both limiting and defining.

**Known facts:** SMS had a 160-character limit (Twitter took 140 to allow for usernames). Many users worked around the limit with screenshots of text. The constraint forced brevity and shareability.

**Unknowns:** Would removing the constraint break Twitter's identity? Would longer posts reduce engagement? Would the constraint eventually become irrelevant?

**Decision 1 (Dorsey era):** Defend the 140-character limit as core identity. The constraint IS the product.
**Decision 2 (2017):** Increase to 280 characters. Carefully. Not infinite.

**Outcome:** The 280-character increase had no negative effect on engagement. Long-form threads (tweetstorms) were already happening via workarounds. The constraint-as-product-identity lasted longer than the actual technical reason for it.

**Lesson for Marketpulse:** Some constraints become product features (the 140-character discipline of hypothesis writing: one-liner, falsifiable, specific instrument). Protect constraints that create quality. Relax constraints that are historical accidents. The hypothesis template's mandatory CONFIRMS/KILLS and Causality/Correlation fields are constraints that create quality — protect them. The requirement that every hypothesis be a markdown file is a historical accident — relax it when the DB migration happens.

---

## DEC-PS-010 — Figma's collaborative editor vs. Adobe's acquisition [GOOD]
**Date:** 2012–2022 | **Company:** Figma | **PM:** Dylan Field

**Situation:** Design tools (Sketch, Photoshop, Illustrator) were all single-player, desktop-only. Collaboration required exporting files, sharing via email, using separate tools for handoff. The pain was universal and well-documented.

**Known facts:** Google Docs had proven browser-based collaborative editing worked at scale. No design tool had successfully moved to browser-first. Adobe had tried and failed.

**Unknowns:** Would designers give up Sketch's feature depth for browser-based collaboration? Would browser performance be adequate for design work? Would enterprise design teams trust cloud-based tools with IP?

**Problem:** Build a feature-complete design tool first (then add collaboration), OR build collaboration-first and grow feature completeness over time.

**Decision:** Build collaboration-first. Accept a lower feature ceiling at launch. Bet that the collaboration problem was so painful that teams would tolerate less functionality.

**Outcome:** Figma captured design market from Sketch. Adobe acquired Figma for $20B in 2022 (deal blocked by regulators). Collaboration was the moat, not the feature count.

**Lesson for Marketpulse:** The most painful problem in the owner's current workflow is: hypotheses are not being validated consistently because the daily cycle requires manual triggering. The solution is not more features — it is making validation happen automatically (BL-004 cron). Solve the collaboration problem (automatic + consistent) before solving the feature problem (more filters, more chart types). The automatic validation is the Figma moment for Marketpulse.

---

## Adding new entries

When a relevant product decision is observed (from PM reading, podcasts, case studies), add it here using the format:

```
## DEC-PS-[NUMBER] — [Decision title] [GOOD / BAD / MIXED]
**Date:** | **Company:** | **PM:**

**Situation:** [1–2 sentences]
**Known facts:** [what was knowable at the time]
**Unknowns:** [what could not be known]
**Problem:** [the decision fork]
**Decision:** [what was chosen]
**Outcome:** [what actually happened]
**Lesson for Marketpulse:** [specific applicability]
```

The repository grows through use. When the PM uses an analog to justify a decision, cite the DEC-PS number in the feature triage output.
