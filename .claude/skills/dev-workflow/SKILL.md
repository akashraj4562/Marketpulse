# Skill: dev-workflow
> Procedural memory for working on the Marketpulse codebase.
> Invoke: `dev-workflow: [task]`
> Purpose: provides step-by-step procedures for any development task on this project.

---

## How to start a new session on this project

1. **Read project state first**
   ```
   Read: docs/memory/PROJECT-STATE.md
   ```
   This tells you: what's built, what's running, what's in flight, what to do next. Do not proceed without reading it.

2. **Check if server is running**
   ```bash
   lsof -i :3737 | grep LISTEN
   ```
   If not running:
   ```bash
   cd "/Users/priyanka/Desktop/Akash Claude/marketpulse/web"
   PATH="/Users/priyanka/node-v24.16.0-darwin-arm64/bin:$PATH" node server.js &
   ```
   Local: http://localhost:3737  
   iPhone (same WiFi): http://192.168.1.14:3737

3. **Check pending tasks from last session**
   ```
   Read: docs/memory/SESSIONS.md  (first entry = last session's unfinished items)
   ```

4. **Recreate auto-test crons (if not running)**
   Paste into Claude Code to restore the four scheduled crons:
   ```
   Please recreate the Marketpulse auto-test crons per RUNBOOK.md — 
   daily weekdays 9:17am, weekly Mondays 9:23am, monthly 1st 9:41am, 
   and memory save every 45 minutes.
   ```

---

## How to add a new feature to the web view

All web view code lives in a single file: `web/server.js`. The file has three zones:
- **Lines 1–~250**: Node.js/Express backend (API endpoints, markdown parsers, Yahoo Finance)
- **Lines ~250–end**: `const HTML = \`...\`` — the entire front-end as an inline template literal

### Adding a new API endpoint
1. Add the route handler between the last `app.get(...)` and the `app.listen(...)` call
2. Pattern:
   ```javascript
   app.get('/api/my-endpoint', async (req, res) => {
     // ... logic
     res.json({ result });
   });
   ```

### Adding a new UI section to cards
1. Find `function renderCard(h)` in the HTML section
2. Add the new HTML as a template literal variable, then include it in the return string
3. Add any new CSS classes to the `<style>` block above the `<script>` block
4. Add any new JS logic in the `<script>` block at the bottom

### Restarting the server after changes
```bash
kill $(lsof -ti :3737) 2>/dev/null; sleep 1
cd "/Users/priyanka/Desktop/Akash Claude/marketpulse/web"
PATH="/Users/priyanka/node-v24.16.0-darwin-arm64/bin:$PATH" node server.js &
```

### Installing a new npm package
```bash
cd "/Users/priyanka/Desktop/Akash Claude/marketpulse/web"
PATH="/Users/priyanka/node-v24.16.0-darwin-arm64/bin:$PATH" npm install <package>
```
Then add to `.gitignore` (already has `node_modules/`).

---

## How to add a chart for a new instrument

1. **Check if the ticker is in TICKER_MAP** (in server.js, at the top)
   - If not, add it: `'TICKERCODE': 'YAHOO_SYMBOL'`
   - India indices: `'NIFTYIT': '^CNXIT'` (no `.NS` for indices)
   - India stocks: `'RELIANCE': 'RELIANCE.NS'`
   - US stocks/ETFs: `'NVDA': 'NVDA'`
   - Forex: `'EUR/USD': 'EURUSD=X'`

2. **Test the resolution**
   ```bash
   curl -s "http://localhost:3737/api/chart-data/H-XXXX?days=30" | python3 -m json.tool | head -20
   ```
   Check: `ticker` is correct, `hist` > 0.

3. **If Yahoo Finance returns schema validation errors for a valid symbol**
   - The `validateResult: false` option is already set globally — data will still come through
   - If `hist: 0` despite valid ticker, the symbol format might be wrong (try `.NS` suffix, or `^` prefix for indices)

---

## How to commit changes

```bash
cd "/Users/priyanka/Desktop/Akash Claude/marketpulse"
git add -A
git commit -m "Description of what was done

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## How to update session memory at end of session

1. Open `docs/memory/SESSIONS.md`
2. Prepend a new entry (newest first) with:
   - What was accomplished
   - Key decisions made (link to DECISIONS.md)
   - What's unfinished
   - What to do in next session

3. Update `docs/memory/PROJECT-STATE.md`:
   - Update "Current system status" table
   - Update "What was built" section (prepend)
   - Update "What's in flight / next" table
   - Update "Active hypotheses snapshot" if portfolio changed

4. If a new architectural decision was made, add to `docs/memory/DECISIONS.md`

---

## File structure reference

```
marketpulse/
├── CLAUDE.md                      ← Desk constitution (read every session)
├── RUNBOOK.md                     ← Prompt reference
├── hypotheses/
│   ├── PORTFOLIO.md               ← Master hypothesis index
│   ├── active/                    ← Confidence ≥ 60%
│   ├── developing/                ← Confidence < 60%
│   ├── predicted/                 ← AI-generated, unvalidated
│   └── retired/                   ← Closed hypotheses
├── web/
│   ├── server.js                  ← Entire web app (Express + inline HTML)
│   ├── package.json
│   ├── node_modules/              ← gitignored
│   └── .gitignore
├── docs/
│   ├── memory/
│   │   ├── PROJECT-STATE.md       ← Current state (read at session start)
│   │   ├── DECISIONS.md           ← Architectural decisions
│   │   └── SESSIONS.md            ← Rolling session log
│   ├── product/
│   │   └── BACKLOG.md             ← Feature backlog
│   └── portfolio/
│       └── HOLDINGS.md            ← (pending) User's investment holdings
└── .claude/
    ├── agents/                    ← 14 specialist agents
    └── skills/
        ├── signal-to-thesis/      ← 8-stage thesis workup
        ├── daily-hypothesis-cycle/← Daily validation workflow
        ├── training-drill/        ← Socratic training
        ├── dev-workflow/          ← This file
        └── hypothesis-ops/        ← Hypothesis lifecycle procedures
```

---

## Common error solutions

| Error | Cause | Fix |
|---|---|---|
| `npm: command not found` | Node not on PATH | Prefix: `PATH="/Users/priyanka/node-v24.16.0-darwin-arm64/bin:$PATH"` |
| `hist: 0` for Indian index | Wrong Yahoo symbol format | Use `^CNXIT` not `NIFTYIT.NS` for indices |
| Schema validation error but data exists | Yahoo null currency field for NSE | Already handled: `validateResult: false` |
| Chart doesn't appear | Old chart instance not destroyed | `chartInstances[id].destroy()` is called on re-render |
| Card doesn't expand | Click inside `.card-expanded` zone | Click handler skips events inside expanded section |
| `TypeError: YFClass is not a constructor` | Old API usage | Use `new (require('yahoo-finance2').default)()` |
