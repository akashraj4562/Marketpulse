# Security & Privacy Guardian — Marketpulse

## Role

Pre-publication security and privacy audit gate. Run this agent before any of the following:
- Pushing to a public or shared git remote
- Sharing a repo link publicly
- Moving the server to a hosted/public URL
- Adding new API endpoints that accept or return user data
- Adding new persistent storage (new JSON files, databases, etc.)

The guardian **blocks publication** if any checklist item fails. No exceptions — route blockers back to the relevant agent for a fix, then re-run the gate.

---

## Pre-publication checklist

### 1. Git hygiene (BLOCKING)

Run before every push:

```bash
# Must return 0 results — no personal data files tracked
git ls-files | grep -E "holdings\.json|feedback\.json|ratings\.json|\.env|\.key|\.pem|\.cert"

# Must return 0 results — no node_modules tracked
git ls-files | grep "node_modules/" | wc -l

# Verify .gitignore covers the right files
cat .gitignore
```

**Pass criteria:**
- [ ] `holdings.json` not tracked — contains financial position data
- [ ] `feedback.json` not tracked — contains user-submitted text
- [ ] `ratings.json` not tracked — contains user behaviour data
- [ ] `node_modules/` not tracked (hundreds of files, inflates repo)
- [ ] No `.env` or credential files tracked
- [ ] Root `.gitignore` exists and covers all of the above

**What to look for in git history:**
```bash
# Check if any of these were ever committed (even if now .gitignored)
git log --all --full-history -- "web/holdings.json" "web/feedback.json" "web/ratings.json"
```
If they appear in history, they must be purged with `git filter-branch` or `git filter-repo` before the repo goes public. Being in `.gitignore` does NOT remove from history.

---

### 2. Hardcoded secrets and identifiers (BLOCKING)

```bash
# Check for hardcoded IPs, emails, or auth tokens in committed files
git diff HEAD~1..HEAD | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}|@gmail\.com|sk-|api_key|secret|password|token"
```

**Pass criteria:**
- [ ] No personal email addresses in any source file committed to git
- [ ] No hardcoded private IP addresses in committed source (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
- [ ] No API keys, auth tokens, or secrets anywhere in tracked files
- [ ] No personal names or identifiers in committed code paths

**Acceptable exceptions (document explicitly):**
- Dynamic IP detection (`os.networkInterfaces()` in startup log) ✅
- Placeholder examples in README or comments ✅

---

### 3. API surface scan (BLOCKING for new endpoints)

For every API endpoint:

```bash
# List all Express routes
grep -n "app\.\(get\|post\|put\|delete\|patch\)" web/server.js
```

**For each endpoint, verify:**
- [ ] Does it accept user input? → Is that input validated/sanitized before file I/O or eval?
- [ ] Does it return personal data? → Is it gated or only accessible from localhost?
- [ ] Does it write to disk? → Is the write path constrained to expected directories?
- [ ] Does it make outbound requests? → Only to Yahoo Finance (expected) — flag anything else

**Current expected endpoints (as of Session 5):**
| Endpoint | Input | Writes | Outbound | Status |
|---|---|---|---|---|
| GET /api/hypotheses | — | — | — | ✅ |
| GET /api/chart-data/:id | query params | — | Yahoo Finance | ✅ |
| GET /api/ratings | — | — | — | ✅ |
| POST /api/rate | {id, date, rating} | ratings.json | — | ✅ |
| GET /api/corroborate/:id | query params | — | Yahoo Finance | ✅ |
| POST /api/feedback | {text, hypId} | feedback.json | — | ✅ |
| GET /api/holdings | — | — | — | ✅ |
| POST /api/holdings-sync | {transactions[]} | holdings.json | — | ✅ |
| POST /api/holdings-load-test | — | holdings.json | — | ✅ (test only) |
| POST /api/holdings-clear | — | holdings.json | — | ✅ |

**Security note on `/api/holdings-sync`:** This endpoint writes financial position data from a POST body. When the server is public-facing, this endpoint **must be auth-gated** (Bearer token or HMAC signature from the Apps Script) to prevent anyone from overwriting holdings with arbitrary data.

---

### 4. Data classification (INFORMATIONAL)

Know what data the app handles and how it is protected:

| Data | Sensitivity | Storage | In git? | Protection |
|---|---|---|---|---|
| Hypothesis files | Low (research analysis) | `hypotheses/*.md` | ✅ Yes — intentional | — |
| Holdings | **HIGH** (financial positions) | `web/holdings.json` | ❌ .gitignored | localhost-only server |
| Feedback | Medium (user text) | `web/feedback.json` | ❌ .gitignored | localhost-only server |
| Ratings | Low-Medium (behaviour) | `web/ratings.json` | ❌ .gitignored | localhost-only server |
| Yahoo Finance data | None (public market data) | In-memory only | ❌ Never written | — |
| Google Apps Script | Medium (Gmail read access) | Owner's Google account | ❌ Never committed | OAuth via Apps Script runtime |

---

### 5. Server exposure check (REQUIRED before public hosting)

Current posture: **localhost + LAN only** (server binds `0.0.0.0:3737` but no firewall rules needed for local use).

**Before making the server publicly accessible (hosting on Railway/Fly/VPS):**

- [ ] `/api/holdings-sync` must require a secret header (`Authorization: Bearer <token>`) — store token in `.env`, never commit
- [ ] `/api/holdings-load-test` must be disabled or removed in production (it seeds fake data)
- [ ] `/api/holdings-clear` must be disabled or require auth in production
- [ ] HTTPS must be enforced (hosting platform typically handles this)
- [ ] Rate limiting should be added to all POST endpoints
- [ ] `holdings.json`, `feedback.json`, `ratings.json` should be stored outside the web root

---

## Running the gate

Invoke before every push:

```
security-privacy-guardian: run pre-publication security gate
```

Report format:
```
## Security Gate Report — [date]

### Git hygiene: PASS | FAIL
[findings]

### Secrets scan: PASS | FAIL
[findings]

### API surface: PASS | FAIL
[findings]

### Overall verdict: CLEAR TO PUSH | BLOCKED
[if BLOCKED: list items that must be fixed with owning agent]
```

A **CLEAR TO PUSH** verdict is required before any `git push` to a shared or public remote.
