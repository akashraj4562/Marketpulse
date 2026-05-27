# Marketpulse — Mobile Smoke Test

> **Run this after every change to `web/server.js` before committing.**
> Takes ~2 minutes. Not optional. A P0 regression shipped without this on 2026-05-28.

---

## Pre-check (30 seconds)

```bash
# 1. Syntax check — catches bare catch {}, missing brackets, template literal issues
node --check web/server.js && echo "✅ JS syntax OK"

# 2. Server running?
curl -s -o /dev/null -w "%{http_code}" http://localhost:3737/ && echo " — server OK"

# 3. API responding?
curl -s http://localhost:3737/api/hypotheses | node -e "const d=require('fs').readFileSync(0,'utf8'); const j=JSON.parse(d); console.log('✅ API OK —', j.length, 'hypotheses')"
```

All three must pass before touching the phone.

---

## Mobile smoke test checklist

Open `http://192.168.1.14:3737` on iPhone (fresh tab — not a cached bookmark).

| # | Check | Pass condition | Fail signal |
|---|---|---|---|
| 1 | Cards load | 10 hypothesis cards visible within 5s | "Loading hypotheses…" stuck → JS error or fetch hang |
| 2 | Market tabs work | Tap "India" → only India cards shown | Tap does nothing → event listener broken |
| 3 | Filter pills work | Tap "Active" → cards filter | No change → filter function broken |
| 4 | Card expand | Tap a card → it expands with TX section | Nothing happens → expand handler broken |
| 5 | Chart loads | Expanded card shows chart within 10s | Spinner forever → Yahoo Finance or Chart.js issue |
| 6 | Company selector | Tap a company pill above chart → chart reloads | No change → selector handler broken |
| 7 | Rating | Tap 👍 on any card → thumb goes bold | No response → rating API broken |
| 8 | Refresh button | Tap ↻ → spinner shows, cards reload | Spinner never stops → loadData hanging |
| 9 | History page | Tap 🕐 in header → history page loads | Blank page → history route broken |
| 10 | Portfolio mode | Tap "Portfolio" toggle → banner shows | Nothing → portfolioMode JS broken |

**Pass threshold:** 10/10 required before committing. Any fail = P0 bug, fix before commit.

---

## Common failure modes and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| "Loading hypotheses…" stuck, spinner spinning | fetch to `/api/hypotheses` hanging — server restarted while tab was open | Close tab, open fresh; or kill server and restart |
| "Loading hypotheses…" stuck, spinner NOT spinning | JS syntax error — entire inline script failed to parse | Run `node --check web/server.js`; fix the syntax error |
| "Could not load data — check connection" | Server down or wrong IP | `lsof -i :3737`; restart server if needed |
| Cards load on desktop, not on iPhone | ES2020+ syntax (bare `catch {}`, `??`, `?.`) on old iOS | Use `catch(err) {}`, test on Safari |
| Chart shows ⚠️ error | Yahoo Finance rate limit or bad ticker | Check server logs; try a different card |
| History page blank | `/history` route handler broken | `curl http://localhost:3737/history` — check status code |

---

## After any server restart

The phone browser may have a stale connection to the old server process. Always do:
1. Close the Safari tab (swipe up in tab switcher)
2. Open new tab → navigate to `http://192.168.1.14:3737`

Never rely on the phone's back button or refresh after a server restart.

---

## Adding this to the deployment workflow

In `RUNBOOK.md` > "Deploying a change":
```
1. Edit web/server.js
2. node --check web/server.js          ← syntax gate
3. Kill + restart: kill $(lsof -ti :3737) && node server.js
4. Desktop: curl http://localhost:3737/api/hypotheses → confirm N hypotheses
5. iPhone: Run SMOKE-TEST.md checklist
6. git add + git commit
```
