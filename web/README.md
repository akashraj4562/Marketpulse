# Marketpulse Web View

Mobile-optimized web interface for the hypothesis portfolio. Works on iPhone 14 (and any browser).

---

## Start the server

```bash
cd web/
npm start
```

Output:
```
🚀 Marketpulse web view running

  Local:   http://localhost:3737
  Network: http://192.168.1.xx:3737  ← open this on your iPhone
```

**On your iPhone (same WiFi):** Open the Network URL in Safari. Add to Home Screen for an app-like experience.

---

## Get a public link (from anywhere, not just home WiFi)

Install ngrok (one-time):
```bash
brew install ngrok
```

Then, while the server is running:
```bash
npx ngrok http 3737
```

ngrok will print a URL like `https://abc123.ngrok.io` — open that on any device, anywhere.

---

## What the web view shows

- **All hypotheses** as cards sorted by confidence (highest first)
- Each card shows: **H-ID**, title, confidence %, horizon badge (ST/MT/LT), status, priority tier
- Instrument name + predicted direction (📈/📉) inline
- **Tap any card** to expand: capital market thesis, watch items (✅ confirms, ❌ kills), timeframe, last validated
- **Filter bar** at top: All / Active / Developing / Short-term / Medium-term / Long-term / Bullish / Bearish
- **Refresh button** (↻) bottom-right: re-reads all markdown files live

---

## Notes

- Data is read live from `../hypotheses/` each time you refresh — no build step needed
- No login or auth (personal use)
- Port 3737 can be changed via `PORT=XXXX npm start`
