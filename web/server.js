const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3737;

// Resolve hypothesis directory relative to this file (../hypotheses/)
const HYPOTHESES_DIR = path.resolve(__dirname, '..', 'hypotheses');

// ─── Ticker map ──────────────────────────────────────────────────────────────

const TICKER_MAP = {
  // India indices — Yahoo Finance symbols (^ prefix = index)
  'NIFTY 50': '^NSEI', 'NIFTY50': '^NSEI', 'NIFTY': '^NSEI',
  'NIFTY IT': '^CNXIT',  'CNXIT': '^CNXIT',  'NIFTYIT': '^CNXIT',
  'NIFTY FMCG': '^CNXFMCG', 'CNXFMCG': '^CNXFMCG', 'NIFTYFMCG': '^CNXFMCG',
  'NIFTY AUTO': '^CNXAUTO', 'CNXAUTO': '^CNXAUTO', 'NIFTYAUTO': '^CNXAUTO',
  'NIFTY BANK': '^NSEBANK', 'CNXBANK': '^NSEBANK', 'NIFTYBANK': '^NSEBANK',
  'SENSEX': '^BSESN',
  // India stocks (NSE)
  'BPCL': 'BPCL.NS', 'HPCL': 'HPCL.NS', 'IOC': 'IOC.NS',
  'TCS': 'TCS.NS', 'INFY': 'INFY.NS', 'WIPRO': 'WIPRO.NS',
  'HINDUNILVR': 'HINDUNILVR.NS', 'ITC': 'ITC.NS',
  'RELIANCE': 'RELIANCE.NS', 'ONGC': 'ONGC.NS',
  'HDFCBANK': 'HDFCBANK.NS', 'ICICIBANK': 'ICICIBANK.NS',
  'DABUR': 'DABUR.NS', 'NESTLEIND': 'NESTLEIND.NS',
  'MARUTI': 'MARUTI.NS', 'BAJAJ-AUTO': 'BAJAJ-AUTO.NS',
  // Forex
  'USD/INR': 'USDINR=X', 'USDINR': 'USDINR=X',
  // US ETFs
  'IWM': 'IWM', 'SPY': 'SPY', 'QQQ': 'QQQ',
  'IYR': 'IYR', 'XLU': 'XLU', 'KRE': 'KRE',
  'SOXX': 'SOXX', 'SMH': 'SMH', 'GDX': 'GDX',
  // US stocks
  'MU': 'MU', 'NVDA': 'NVDA', 'AMD': 'AMD', 'INTC': 'INTC',
  'CRWD': 'CRWD', 'PANW': 'PANW', 'ZS': 'ZS', 'S': 'S',
  'AAPL': 'AAPL', 'GOOGL': 'GOOGL', 'META': 'META',
  'MSFT': 'MSFT', 'AMZN': 'AMZN', 'TSLA': 'TSLA', 'NFLX': 'NFLX',
};

function getPrimaryTicker(hyp) {
  const instrument = (hyp.instrument || '').toUpperCase();

  // Step 1: Primary group = before first ';' (separates primary instrument from proxies)
  const primaryGroup = instrument.split(/;/)[0].trim();

  // Step 2: Exchange-qualified code within primary group: "(NSE: NIFTYIT)" or "NASDAQ: MU"
  const exchMatch = primaryGroup.match(/(?:NASDAQ|NYSE|NSE|BSE)\s*:\s*([A-Z0-9.\-]{1,12})/);
  if (exchMatch) {
    const t = exchMatch[1];
    if (TICKER_MAP[t]) return TICKER_MAP[t];
    if (hyp.market === 'India') return t + '.NS';
    return t;
  }

  // Step 3: First slash-separated token in the primary group
  const firstToken = primaryGroup.split('/')[0].trim();

  // Step 4: TICKER_MAP scan — narrowest scope first, widening progressively
  const sorted = Object.keys(TICKER_MAP).sort((a, b) => b.length - a.length);
  for (const scope of [firstToken, primaryGroup, instrument]) {
    for (const key of sorted) {
      const escaped = key.replace(/[+*?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`\\b${escaped}\\b`, 'i').test(scope)) {
        return TICKER_MAP[key];
      }
    }
  }

  // Step 5: Fallback — first 2–5-char ALL-CAPS token in firstToken
  const m = firstToken.match(/\b([A-Z]{2,5})\b/);
  if (m) {
    const c = m[1];
    if (TICKER_MAP[c]) return TICKER_MAP[c];
    if (hyp.market === 'India') return c + '.NS';
    return c;
  }
  return null;
}

// ─── Prediction helpers ───────────────────────────────────────────────────────

function parseMagnitude(magnitude, direction) {
  if (!magnitude) return { midPct: 5, halfRange: 2.5 };
  const isBear = (direction || '').toLowerCase().includes('bear')
              || magnitude.includes('-');

  // Range like "+20–35%" or "-8–12%" or "5–10%"
  const rangeM = magnitude.match(/(\d+)[–\-](\d+)%/);
  if (rangeM) {
    const lo = parseFloat(rangeM[1]);
    const hi = parseFloat(rangeM[2]);
    const mid = (lo + hi) / 2;
    return { midPct: isBear ? -mid : mid, halfRange: (hi - lo) / 2 };
  }
  // Single like "+15%"
  const singleM = magnitude.match(/([\d.]+)%/);
  if (singleM) {
    const v = parseFloat(singleM[1]);
    return { midPct: isBear ? -v : v, halfRange: v * 0.25 };
  }
  return { midPct: isBear ? -5 : 5, halfRange: 2.5 };
}

function calcPredictionDays(horizon, histDays) {
  const h = (horizon || 'MT').toUpperCase();
  if (h.startsWith('ST')) return Math.min(21, Math.ceil(histDays * 0.75));
  if (h.startsWith('LT')) return Math.min(180, Math.ceil(histDays * 2));
  return Math.min(90, Math.ceil(histDays * 1.5)); // MT
}

function addTradingDays(fromDate, numDays) {
  const dates = [];
  const d = new Date(fromDate);
  while (dates.length < numDays) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.push(d.toISOString().slice(0, 10));
    }
  }
  return dates;
}

function buildPrediction(lastPrice, lastDate, hyp, predDays) {
  const { midPct, halfRange } = parseMagnitude(hyp.magnitude, hyp.direction);
  const conf0 = (hyp.confidence || 50) / 100; // e.g. 0.65
  const dates = addTradingDays(new Date(lastDate), predDays);

  const targetCentral = lastPrice * (1 + midPct / 100);
  const targetUpper   = lastPrice * (1 + (midPct + halfRange) / 100);
  const targetLower   = lastPrice * (1 + (midPct - halfRange) / 100);

  return dates.map((date, i) => {
    const t = (i + 1) / predDays;           // 0→1 across prediction window
    const conf = conf0 * (1 - t) + 0.45 * t; // degrades to 45% (noise floor)
    const spreadMult = 1 + t * 2.5;          // band widens 3.5× by end

    const central = lastPrice + (targetCentral - lastPrice) * t;
    const rawUpper = lastPrice + (targetUpper - lastPrice) * t;
    const rawLower = lastPrice + (targetLower - lastPrice) * t;

    // Widen the band symmetrically around central as confidence degrades
    const halfW = Math.abs(rawUpper - central) * spreadMult;
    return {
      date,
      central,
      upper: central + halfW,
      lower: central - halfW,
      conf, // used by front-end to colour fill
    };
  });
}

// ─── Yahoo Finance fetch ──────────────────────────────────────────────────────

// Singleton instance (suppress deprecation notices)
let _yfInstance = null;
function getYF() {
  if (!_yfInstance) {
    const YFClass = require('yahoo-finance2').default;
    _yfInstance = new YFClass({ suppressNotices: ['ripHistorical'] });
  }
  return _yfInstance;
}

async function fetchHistoricalPrices(ticker, requestedTradingDays) {
  try {
    const yf = getYF();

    // Request ~1.5× calendar days to cover weekends / holidays
    const calDays = Math.ceil(requestedTradingDays * 1.5) + 10;
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - calDays);

    // Use chart() — historical() is deprecated in v3
    // validateResult:false suppresses schema warnings for Indian indices
    // (Yahoo returns valid OHLC but null currency for some NSE symbols)
    const result = await yf.chart(ticker, {
      period1: start,
      period2: end,
      interval: '1d',
    }, { validateResult: false });

    const quotes = result?.quotes || [];
    const prices = quotes
      .filter(r => r.close != null)
      .map(r => ({
        date: (r.date instanceof Date ? r.date : new Date(r.date))
                .toISOString().slice(0, 10),
        close: Math.round(r.close * 100) / 100,
      }));

    // Return only the last N trading days requested
    return prices.slice(-requestedTradingDays);
  } catch (e) {
    console.error('[chart] Yahoo Finance error:', ticker, e.message);
    return null;
  }
}

// ─── Markdown parser ──────────────────────────────────────────────────────────

function extractField(content, fieldName) {
  const re = new RegExp(`\\|\\s*\\*\\*${fieldName}\\*\\*\\s*\\|\\s*(.+?)\\s*\\|`, 'i');
  const m = content.match(re);
  return m ? m[1].trim().replace(/`/g, '') : null;
}

function extractConfidence(content) {
  const m = content.match(/\|\s*\*\*Confidence\*\*\s*\|\s*([\d]+)%\s*\|/i);
  return m ? parseInt(m[1], 10) : null;
}

function extractCapitalMarketPrediction(content) {
  const fields = {};
  const cmpSection = (() => {
    const m = content.match(/##[#]?\s*(?:★\s*)?Capital Market Prediction[\s\S]*?\n([\s\S]*?)(?=\n##|$)/i);
    return m ? m[1] : '';
  })();

  fields.instrument = extractField(cmpSection, 'Instrument') || extractField(content, 'Instrument');
  fields.direction  = extractField(cmpSection, 'Predicted direction') || extractField(content, 'Predicted direction');
  fields.magnitude  = extractField(cmpSection, 'Predicted magnitude') || extractField(content, 'Predicted magnitude');
  fields.timeframe  = extractField(cmpSection, 'Timeframe') || null;
  fields.pricedIn   = extractField(cmpSection, 'Already priced in\\?') || extractField(content, 'Already priced in\\?');

  const thesisMatch = cmpSection.match(/Capital market thesis[^:]*:\s*\n([^\n#][^\n]*(?:\n(?!\n##)[^\n]+)*)/i);
  fields.thesis = thesisMatch
    ? thesisMatch[1].replace(/\*\*/g, '').trim().slice(0, 280) + '…'
    : null;

  return fields;
}

function extractWatchItems(content) {
  const confirms = [], kills = [];
  const re = /- \*\*(CONFIRMS|KILLS)[^*]*\*\*:?\s*(.+)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    if (m[1] === 'CONFIRMS') confirms.push(m[2].trim());
    else kills.push(m[2].trim());
  }
  return { confirms: confirms.slice(0, 2), kills: kills.slice(0, 2) };
}

function extractStatement(content) {
  const m = content.match(/\*\*One-line:\*\*\s*(.+)/i);
  return m ? m[1].trim() : null;
}

function parseHypothesisFile(filePath, status) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath, '.md');
    const id = fileName.match(/^(H-\d+)/)?.[1] || fileName;

    const confidence = extractConfidence(content);
    const horizon    = extractField(content, 'Time horizon');
    const lastVal    = extractField(content, 'Last validated');
    const ptier      = extractField(content, 'Priority tier');
    const slug       = extractField(content, 'Slug') || id;

    const marketField = extractField(content, 'Market');
    const instrument  = (extractField(content, 'Instrument') || '').toUpperCase();
    let market = 'Global';
    if (marketField) {
      const mf = marketField.toUpperCase();
      if (mf.includes('NSE') || mf.includes('BSE') || mf.includes('INDIA')) market = 'India';
      else if (mf.includes('NYSE') || mf.includes('NASDAQ') || mf.includes('US')) market = 'US';
      else market = marketField.split('/')[0].trim();
    } else if (instrument.match(/NSE|BSE|NIFTY|SENSEX|BPCL|HPCL|HINDUNILVR|TCS\b|INFY|WIPRO|HCLTECH|DABUR|ITC\b|NESTLEIND|MARUTI|ONGC|ICICIBANK|HDFCBANK/)) {
      market = 'India';
    } else if (instrument.match(/NASDAQ|NYSE|S&P|DOW|MICRON|NVDA|NVIDIA|MSFT|AAPL|GOOGL|META|AMZN|CRWD|ZS\b|PANW|AMD|SPY|QQQ|IWM|XLU|IYR/)) {
      market = 'US';
    }

    const cmp    = extractCapitalMarketPrediction(content);
    const watch  = extractWatchItems(content);
    const oneliner = extractStatement(content);
    const titleMatch = content.match(/^#\s+Hypothesis:\s*(.+)/m);
    const title = titleMatch ? titleMatch[1].trim() : slug;

    // Causal / correlation scores
    const causM = content.match(/\|\s*\*\*Causality\*\*\s*\|\s*([\d]+)\s*[/\s]/i);
    const corrM = content.match(/\|\s*\*\*Correlation\*\*\s*\|\s*([\d]+)\s*[/\s]/i);

    return {
      id, slug, title,
      status: status || extractField(content, 'Status') || 'Unknown',
      confidence,
      causality: causM ? parseInt(causM[1], 10) : null,
      correlation: corrM ? parseInt(corrM[1], 10) : null,
      horizon: horizon ? horizon.replace(/\s*\(.*?\)/, '').trim() : null,
      horizonFull: horizon,
      lastValidated: lastVal,
      priorityTier: ptier ? ptier.replace(/\(.*?\)/g, '').trim() : null,
      market,
      instrument: cmp.instrument,
      direction: cmp.direction,
      magnitude: cmp.magnitude,
      timeframe: cmp.timeframe,
      pricedIn: cmp.pricedIn,
      thesis: cmp.thesis,
      oneliner,
      confirms: watch.confirms,
      kills: watch.kills,
      filePath,
    };
  } catch (e) {
    return null;
  }
}

function loadAllHypotheses() {
  const folders = [
    { dir: 'active',     status: 'Active' },
    { dir: 'developing', status: 'Developing' },
    { dir: 'predicted',  status: 'Predicted' },
    { dir: 'retired',    status: 'Retired' },
  ];
  const all = [];
  for (const { dir, status } of folders) {
    const folder = path.join(HYPOTHESES_DIR, dir);
    if (!fs.existsSync(folder)) continue;
    const files = fs.readdirSync(folder).filter(f => f.endsWith('.md') && f.startsWith('H-'));
    for (const f of files) {
      const h = parseHypothesisFile(path.join(folder, f), status);
      if (h) all.push(h);
    }
  }
  const statusOrder = { Active: 0, Developing: 1, Predicted: 2, Retired: 3 };
  all.sort((a, b) => {
    const so = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
    return so !== 0 ? so : (b.confidence ?? 0) - (a.confidence ?? 0);
  });
  return all;
}

// ─── API: hypotheses list ─────────────────────────────────────────────────────

app.get('/api/hypotheses', (req, res) => {
  res.json(loadAllHypotheses());
});

// ─── API: chart data ──────────────────────────────────────────────────────────

app.get('/api/chart-data/:id', async (req, res) => {
  const id = req.params.id.toUpperCase();
  const histDays = Math.min(Math.max(parseInt(req.query.days) || 30, 7), 365);

  const hyps = loadAllHypotheses();
  const hyp = hyps.find(h => h.id === id);
  if (!hyp) return res.status(404).json({ error: 'Hypothesis not found' });

  const ticker = getPrimaryTicker(hyp);
  if (!ticker) return res.json({ error: 'No ticker mapped', noTicker: true });

  const historical = await fetchHistoricalPrices(ticker, histDays);
  if (!historical || historical.length === 0) {
    return res.json({ error: 'Could not fetch price data', ticker });
  }

  const lastBar   = historical[historical.length - 1];
  const predDays  = calcPredictionDays(hyp.horizon, histDays);
  const prediction = buildPrediction(lastBar.close, lastBar.date, hyp, predDays);

  return res.json({
    ticker,
    historical,
    prediction,
    meta: {
      histDays: historical.length,
      predDays,
      confidence: hyp.confidence,
      direction: hyp.direction,
      magnitude: hyp.magnitude,
      horizon: hyp.horizon,
    },
  });
});

// ─── Single-page app ──────────────────────────────────────────────────────────

app.get('/', (req, res) => res.send(HTML));

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  const localIPs = Object.values(interfaces)
    .flat()
    .filter(i => i.family === 'IPv4' && !i.internal)
    .map(i => i.address);

  console.log('\n🚀 Marketpulse web view running\n');
  console.log(`  Local:   http://localhost:${PORT}`);
  localIPs.forEach(ip => console.log(`  Network: http://${ip}:${PORT}  ← open this on your iPhone`));
  console.log('');
});

// ─── HTML (inline) ────────────────────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>Marketpulse</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"><\/script>
<style>
  :root {
    --bg: #0f1117;
    --surface: #1a1d2e;
    --surface2: #242840;
    --border: #2d3158;
    --text: #e8e9f0;
    --muted: #8b8fa8;
    --green: #22c55e;
    --yellow: #eab308;
    --orange: #f97316;
    --red: #ef4444;
    --blue: #3b82f6;
    --purple: #a855f7;
    --radius: 12px;
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  html, body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif; min-height: 100vh; }

  /* Header */
  .header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(15,17,23,0.92); backdrop-filter: blur(16px);
    padding: calc(var(--safe-top) + 12px) 16px 12px;
    border-bottom: 1px solid var(--border);
  }
  .header-row { display: flex; align-items: center; justify-content: space-between; }
  .logo { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; }
  .logo span { color: var(--blue); }
  .last-updated { font-size: 11px; color: var(--muted); }
  .stats-row { display: flex; gap: 12px; margin-top: 10px; overflow-x: auto; padding-bottom: 2px; }
  .stat-chip { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 4px 12px; font-size: 12px; white-space: nowrap; flex-shrink: 0; }
  .stat-chip strong { font-weight: 700; }
  .stat-chip.green strong { color: var(--green); }
  .stat-chip.yellow strong { color: var(--yellow); }
  .stat-chip.orange strong { color: var(--orange); }

  /* Market strip */
  .market-strip {
    display: flex; gap: 0; border-bottom: 2px solid var(--border);
    padding: 0 16px; background: var(--bg);
  }
  .market-btn {
    flex: 1; text-align: center; padding: 10px 0; font-size: 13px; font-weight: 600;
    color: var(--muted); cursor: pointer; border-bottom: 2px solid transparent;
    margin-bottom: -2px; transition: all 0.15s; background: none;
    border-top: none; border-left: none; border-right: none;
  }
  .market-btn.active { color: var(--text); border-bottom-color: var(--blue); }
  .market-btn .count { font-size: 11px; margin-left: 4px; opacity: 0.7; }

  /* Filters */
  .filters { padding: 12px 16px; display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
  .filter-btn {
    background: var(--surface); border: 1px solid var(--border); border-radius: 20px;
    padding: 6px 14px; font-size: 13px; color: var(--muted); cursor: pointer;
    white-space: nowrap; flex-shrink: 0; transition: all 0.15s;
  }
  .filter-btn.active { background: var(--blue); border-color: var(--blue); color: #fff; font-weight: 600; }

  /* Cards */
  .cards { padding: 0 12px 100px; display: flex; flex-direction: column; gap: 10px; }

  .card {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
    overflow: hidden; cursor: pointer; transition: transform 0.1s;
  }
  .card:active { transform: scale(0.98); }
  .card-header { padding: 14px 14px 10px; }
  .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
  .card-id { font-size: 11px; font-weight: 700; color: var(--blue); letter-spacing: 0.5px; font-family: 'SF Mono', monospace; }
  .confidence-badge {
    font-size: 15px; font-weight: 800; letter-spacing: -0.5px;
    padding: 2px 8px; border-radius: 8px; flex-shrink: 0;
  }
  .conf-green  { background: rgba(34,197,94,0.15);  color: var(--green); }
  .conf-yellow { background: rgba(234,179,8,0.15);  color: var(--yellow); }
  .conf-orange { background: rgba(249,115,22,0.15); color: var(--orange); }
  .conf-red    { background: rgba(239,68,68,0.15);  color: var(--red); }
  .card-title { font-size: 15px; font-weight: 600; margin-top: 6px; line-height: 1.3; }

  .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .tag { font-size: 11px; padding: 3px 8px; border-radius: 6px; font-weight: 600; }
  .tag-st     { background: rgba(59,130,246,0.15); color: var(--blue); }
  .tag-mt     { background: rgba(168,85,247,0.15); color: var(--purple); }
  .tag-lt     { background: rgba(234,179,8,0.15);  color: var(--yellow); }
  .tag-active { background: rgba(34,197,94,0.12); color: var(--green); }
  .tag-developing { background: rgba(249,115,22,0.12); color: var(--orange); }
  .tag-predicted  { background: rgba(139,143,168,0.12); color: var(--muted); }
  .tag-p1 { background: rgba(239,68,68,0.12); color: var(--red); }
  .tag-p2 { background: rgba(234,179,8,0.12); color: var(--yellow); }
  .tag-india { background: rgba(255,153,0,0.15); color: #ff9900; }
  .tag-us    { background: rgba(59,130,246,0.15); color: var(--blue); }
  .tag-global{ background: rgba(139,143,168,0.15); color: var(--muted); }

  /* Instrument row */
  .instrument-row { padding: 10px 14px; background: var(--surface2); border-top: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
  .direction-icon { font-size: 18px; flex-shrink: 0; }
  .instrument-info { flex: 1; min-width: 0; }
  .instrument-name { font-size: 12px; font-weight: 700; color: var(--text); font-family: 'SF Mono', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .magnitude { font-size: 12px; color: var(--muted); margin-top: 1px; }

  /* Expanded section */
  .card-expanded { display: none; border-top: 1px solid var(--border); padding: 14px; }
  .card.open .card-expanded { display: block; }
  .section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 6px; font-weight: 700; }
  .thesis-text { font-size: 13px; line-height: 1.55; color: var(--text); }
  .watch-items { margin-top: 12px; }
  .watch-item { display: flex; gap: 8px; margin-bottom: 6px; font-size: 12px; line-height: 1.45; }
  .watch-icon { flex-shrink: 0; font-size: 13px; margin-top: 1px; }
  .watch-text { color: var(--muted); }
  .causal-note { margin-top: 12px; font-size: 12px; color: var(--muted); }
  .causal-scores { display: flex; gap: 16px; margin-top: 6px; }
  .score-item { display: flex; flex-direction: column; align-items: center; }
  .score-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .score-value { font-size: 16px; font-weight: 700; }
  .priced-in { margin-top: 10px; font-size: 12px; }
  .priced-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; }
  .priced-no      { background: rgba(34,197,94,0.15); color: var(--green); }
  .priced-yes     { background: rgba(239,68,68,0.12); color: var(--red); }
  .priced-partial { background: rgba(234,179,8,0.12); color: var(--yellow); }

  /* ── Chart section ─────────────────────────────────────────────────── */
  .chart-section {
    margin-top: 16px;
    border-top: 1px solid var(--border);
    padding-top: 14px;
  }
  .chart-top-row {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
  }
  .chart-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); font-weight: 700; }
  .chart-ticker { font-size: 11px; font-family: 'SF Mono', monospace; color: var(--blue); font-weight: 700; }

  /* X-day selector */
  .day-selector { display: flex; gap: 4px; }
  .day-btn {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 6px;
    padding: 4px 9px; font-size: 11px; font-weight: 600; color: var(--muted);
    cursor: pointer; transition: all 0.12s;
  }
  .day-btn.active { background: var(--blue); border-color: var(--blue); color: #fff; }

  /* Chart legend row */
  .chart-legend {
    display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;
  }
  .legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--muted); }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .legend-dash { width: 16px; height: 2px; flex-shrink: 0; }
  .legend-band { width: 16px; height: 8px; border-radius: 3px; flex-shrink: 0; opacity: 0.5; }

  /* Chart container */
  .chart-wrap {
    position: relative;
    height: 180px;
    background: var(--surface2);
    border-radius: 8px;
    overflow: hidden;
  }
  .chart-wrap canvas { display: block; }

  /* Chart loading / error states */
  .chart-loading, .chart-error, .chart-no-ticker {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: var(--muted); flex-direction: column; gap: 6px; text-align: center;
  }
  .chart-spinner {
    width: 20px; height: 20px; border: 2px solid var(--border);
    border-top-color: var(--blue); border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Confidence degradation legend */
  .conf-decay-bar {
    margin-top: 6px;
    height: 4px; border-radius: 2px;
    background: linear-gradient(to right, rgba(255,255,255,0.4), rgba(255,255,255,0.04));
  }
  .conf-decay-labels {
    display: flex; justify-content: space-between; margin-top: 3px;
    font-size: 10px; color: var(--muted);
  }

  /* Empty / loading */
  .empty { text-align: center; padding: 60px 24px; color: var(--muted); }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .loading { text-align: center; padding: 60px 24px; color: var(--muted); font-size: 14px; }

  /* Refresh FAB */
  .refresh-btn {
    position: fixed; bottom: calc(20px + var(--safe-bottom)); right: 16px;
    background: var(--blue); color: #fff; border: none; border-radius: 50%;
    width: 52px; height: 52px; font-size: 20px; cursor: pointer;
    box-shadow: 0 4px 16px rgba(59,130,246,0.4);
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.2s;
  }
  .refresh-btn:active { transform: scale(0.92); }
  .refresh-btn.spinning { animation: spin 0.8s linear infinite; }
</style>
</head>
<body>

<div class="header">
  <div class="header-row">
    <div class="logo">Market<span>pulse</span></div>
    <div class="last-updated" id="lastUpdated">Loading…</div>
  </div>
  <div class="stats-row" id="statsRow">
    <div class="stat-chip green"><strong id="statActive">—</strong> Active</div>
    <div class="stat-chip orange"><strong id="statDev">—</strong> Developing</div>
    <div class="stat-chip yellow"><strong id="statTotal">—</strong> Total</div>
  </div>
</div>

<div class="market-strip" id="marketStrip">
  <button class="market-btn active" data-market="all">🌍 All<span class="count" id="countAll"></span></button>
  <button class="market-btn" data-market="India">🇮🇳 India<span class="count" id="countIndia"></span></button>
  <button class="market-btn" data-market="US">🇺🇸 US<span class="count" id="countUS"></span></button>
  <button class="market-btn" data-market="Global">🌐 Global<span class="count" id="countGlobal"></span></button>
</div>

<div class="filters" id="filterBar">
  <button class="filter-btn active" data-filter="all">All</button>
  <button class="filter-btn" data-filter="Active">Active</button>
  <button class="filter-btn" data-filter="Developing">Developing</button>
  <button class="filter-btn" data-filter="ST">Short-term</button>
  <button class="filter-btn" data-filter="MT">Medium-term</button>
  <button class="filter-btn" data-filter="LT">Long-term</button>
  <button class="filter-btn" data-filter="Bullish">📈 Bullish</button>
  <button class="filter-btn" data-filter="Bearish">📉 Bearish</button>
</div>

<div class="cards" id="cardsContainer">
  <div class="loading">Loading hypotheses…</div>
</div>

<button class="refresh-btn" id="refreshBtn" title="Refresh data">↻</button>

<script>
let allHypotheses = [];
let activeFilter = 'all';
let activeMarket = 'all';

// Chart instances keyed by hypothesis id
const chartInstances = {};

// ─── Helpers ───────────────────────────────────────────────────────────────

function confClass(c) {
  if (c == null) return 'conf-red';
  if (c >= 75) return 'conf-green';
  if (c >= 60) return 'conf-yellow';
  if (c >= 40) return 'conf-orange';
  return 'conf-red';
}

function horizonClass(h) {
  if (!h) return '';
  const t = h.toUpperCase();
  if (t.startsWith('ST')) return 'tag-st';
  if (t.startsWith('MT')) return 'tag-mt';
  if (t.startsWith('LT')) return 'tag-lt';
  return '';
}

function statusClass(s) {
  if (!s) return '';
  const t = s.toLowerCase();
  if (t === 'active') return 'tag-active';
  if (t === 'developing') return 'tag-developing';
  return 'tag-predicted';
}

function tierClass(t) {
  if (!t) return '';
  if (t.includes('P1')) return 'tag-p1';
  if (t.includes('P2')) return 'tag-p2';
  return '';
}

function directionIcon(d) {
  if (!d) return '◈';
  const t = d.toLowerCase();
  if (t.includes('bullish') || t.includes('bull')) return '📈';
  if (t.includes('bearish') || t.includes('bear')) return '📉';
  if (t.includes('volatile') || t.includes('range')) return '↔️';
  return '◈';
}

function pricedClass(p) {
  if (!p) return '';
  const t = p.toLowerCase();
  if (t.startsWith('no')) return 'priced-no';
  if (t.startsWith('yes')) return 'priced-yes';
  return 'priced-partial';
}

function pricedLabel(p) {
  if (!p) return 'Unknown';
  if (p.toLowerCase().startsWith('no')) return 'NOT PRICED ✓';
  if (p.toLowerCase().startsWith('yes')) return 'ALREADY PRICED';
  return 'PARTIALLY PRICED';
}

function isBullish(direction) {
  return (direction || '').toLowerCase().includes('bull');
}

// ─── Chart rendering ───────────────────────────────────────────────────────

async function renderChart(id, days, hyp) {
  const wrap    = document.getElementById('chart-wrap-' + id);
  const canvas  = document.getElementById('chart-canvas-' + id);
  if (!wrap || !canvas) return;

  // Show spinner
  wrap.innerHTML = '<div class="chart-loading"><div class="chart-spinner"></div><span>Fetching prices…</span></div>';

  let data;
  try {
    const resp = await fetch('/api/chart-data/' + id + '?days=' + days);
    data = await resp.json();
  } catch (e) {
    wrap.innerHTML = '<div class="chart-error">⚠️ Network error</div>';
    return;
  }

  if (data.noTicker) {
    wrap.innerHTML = '<div class="chart-no-ticker">📊 No exchange ticker mapped<br><small style="opacity:0.6">Charts available for listed instruments</small></div>';
    return;
  }
  if (data.error && !data.historical) {
    wrap.innerHTML = '<div class="chart-error">⚠️ ' + (data.error || 'Could not load prices') + '</div>';
    return;
  }

  // Rebuild canvas (destroy old chart instance if any)
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
  wrap.innerHTML = '<canvas id="chart-canvas-' + id + '"></canvas>';
  const ctx = document.getElementById('chart-canvas-' + id).getContext('2d');

  const hist = data.historical;   // [{date, close}]
  const pred = data.prediction;   // [{date, central, upper, lower, conf}]

  const histDates   = hist.map(p => p.date);
  const histPrices  = hist.map(p => p.close);
  const predDates   = pred.map(p => p.date);
  const predCentral = pred.map(p => p.central);
  const predUpper   = pred.map(p => p.upper);
  const predLower   = pred.map(p => p.lower);

  const allLabels = [...histDates, ...predDates];
  const todayIdx  = hist.length - 1;  // index of last historical point

  const bull    = isBullish(hyp.direction);
  const dirRGB  = bull ? '34,197,94' : '239,68,68';    // green / red
  const histRGB = '99,102,241';                          // indigo always

  // Null-pad prediction arrays to align with full label set
  const pad = (arr, front) => [...Array(front).fill(null), ...arr];

  // Gradient fill for confidence band (left=solid, right=ghost)
  function makeGradient(color) {
    const totalW = ctx.canvas.width;
    const predStart = (hist.length / allLabels.length) * totalW;
    const g = ctx.createLinearGradient(predStart, 0, totalW, 0);
    const a0 = Math.round((data.meta.confidence / 100) * 0.5 * 255).toString(16).padStart(2, '0');
    g.addColorStop(0, 'rgba(' + color + ',' + (data.meta.confidence / 100) * 0.5 + ')');
    g.addColorStop(1, 'rgba(' + color + ',0.03)');
    return g;
  }

  const datasets = [
    // ── Historical (solid line) ─────────────────────────────────────
    {
      label: 'Price',
      data: [...histPrices, ...Array(pred.length).fill(null)],
      borderColor: 'rgba(' + histRGB + ',0.9)',
      borderWidth: 2,
      fill: false,
      pointRadius: 0,
      tension: 0.3,
    },
    // ── Bridge: connect last hist point to first pred point ─────────
    {
      label: '_bridge',
      data: [...Array(hist.length - 1).fill(null), histPrices[hist.length - 1], predCentral[0], ...Array(pred.length - 1).fill(null)],
      borderColor: 'rgba(' + dirRGB + ',0.5)',
      borderWidth: 1,
      borderDash: [4, 4],
      fill: false,
      pointRadius: 0,
      tension: 0,
    },
    // ── Predicted central (dashed) ──────────────────────────────────
    {
      label: 'Forecast',
      data: pad(predCentral, hist.length),
      borderColor: 'rgba(' + dirRGB + ',0.85)',
      borderWidth: 2,
      borderDash: [6, 4],
      fill: false,
      pointRadius: 0,
      tension: 0.3,
    },
    // ── Upper bound (fills down to lower — confidence band) ─────────
    {
      label: '_upper',
      data: pad(predUpper, hist.length),
      borderColor: 'transparent',
      fill: '+1',  // fill to next dataset (lower)
      backgroundColor: makeGradient(dirRGB),
      pointRadius: 0,
      tension: 0.3,
    },
    // ── Lower bound ─────────────────────────────────────────────────
    {
      label: '_lower',
      data: pad(predLower, hist.length),
      borderColor: 'transparent',
      fill: false,
      pointRadius: 0,
      tension: 0.3,
    },
  ];

  // Vertical "Today" annotation via custom plugin
  const todayPlugin = {
    id: 'todayLine',
    afterDatasetsDraw(chart) {
      const { ctx, scales } = chart;
      const x = scales.x.getPixelForValue(todayIdx);
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, scales.y.top);
      ctx.lineTo(x, scales.y.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '9px -apple-system, sans-serif';
      ctx.fillText('Today', x + 3, scales.y.top + 10);
      ctx.restore();
    }
  };

  chartInstances[id] = new Chart(ctx, {
    type: 'line',
    data: { labels: allLabels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,17,23,0.95)',
          borderColor: 'rgba(45,49,88,0.8)',
          borderWidth: 1,
          titleColor: '#e8e9f0',
          bodyColor: '#8b8fa8',
          padding: 8,
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => {
              if (item.dataset.label.startsWith('_')) return null;
              const v = item.raw;
              if (v == null) return null;
              return ' ' + item.dataset.label + ': ' + v.toLocaleString('en', { maximumFractionDigits: 2 });
            },
            afterBody: (items) => {
              const idx = items[0].dataIndex;
              if (idx >= hist.length) {
                const predIdx = idx - hist.length;
                const conf = pred[predIdx]?.conf;
                if (conf != null) {
                  return ['', ' Confidence: ' + Math.round(conf * 100) + '%'];
                }
              }
              return [];
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#8b8fa8',
            maxTicksLimit: 6,
            font: { size: 9 },
            maxRotation: 0,
          },
          grid: { color: 'rgba(45,49,88,0.4)' },
        },
        y: {
          position: 'right',
          ticks: {
            color: '#8b8fa8',
            font: { size: 9 },
            maxTicksLimit: 5,
            callback: (v) => {
              if (v >= 1000) return (v / 1000).toFixed(1) + 'k';
              return v.toFixed(v < 10 ? 2 : 0);
            },
          },
          grid: { color: 'rgba(45,49,88,0.4)' },
        },
      },
    },
    plugins: [todayPlugin],
  });

  // Update the confidence decay bar gradient colour
  const decayBar = document.getElementById('conf-decay-' + id);
  if (decayBar) {
    const col = bull ? '34,197,94' : '239,68,68';
    decayBar.style.background =
      'linear-gradient(to right, rgba(' + col + ',0.6), rgba(' + col + ',0.05))';
  }
}

// ─── Card rendering ────────────────────────────────────────────────────────

function renderCard(h) {
  const cClass = confClass(h.confidence);
  const hClass = horizonClass(h.horizon);
  const sClass = statusClass(h.status);
  const tClass = tierClass(h.priorityTier);
  const mktClass = h.market === 'India' ? 'tag-india' : h.market === 'US' ? 'tag-us' : 'tag-global';
  const mktIcon  = h.market === 'India' ? '🇮🇳' : h.market === 'US' ? '🇺🇸' : '🌐';

  const tags = [
    h.market      ? \`<span class="tag \${mktClass}">\${mktIcon} \${h.market}</span>\` : '',
    h.horizon     ? \`<span class="tag \${hClass}">\${h.horizon?.split(' ')[0] || ''}</span>\` : '',
    h.status      ? \`<span class="tag \${sClass}">\${h.status}</span>\` : '',
    h.priorityTier? \`<span class="tag \${tClass}">\${h.priorityTier.split(' ')[0]}</span>\` : '',
  ].filter(Boolean).join('');

  const instrumentHtml = (h.instrument || h.direction) ? \`
    <div class="instrument-row">
      <div class="direction-icon">\${directionIcon(h.direction)}</div>
      <div class="instrument-info">
        <div class="instrument-name">\${h.instrument || '—'}</div>
        <div class="magnitude">\${h.magnitude || h.direction || ''}</div>
      </div>
    </div>\` : '';

  const confirms = (h.confirms || []).map(c =>
    \`<div class="watch-item"><div class="watch-icon">✅</div><div class="watch-text">\${c}</div></div>\`).join('');
  const kills = (h.kills || []).map(k =>
    \`<div class="watch-item"><div class="watch-icon">❌</div><div class="watch-text">\${k}</div></div>\`).join('');

  const pricedHtml = h.pricedIn ? \`
    <div class="priced-in">
      <span class="priced-badge \${pricedClass(h.pricedIn)}">\${pricedLabel(h.pricedIn)}</span>
    </div>\` : '';

  const thesisHtml = h.thesis ? \`
    <div class="section-label">Capital Market Thesis</div>
    <div class="thesis-text">\${h.thesis}</div>\`
    : h.oneliner ? \`
    <div class="section-label">Signal</div>
    <div class="thesis-text">\${h.oneliner}</div>\` : '';

  const watchHtml = (confirms || kills) ? \`
    <div class="watch-items">
      <div class="section-label">Watch Items</div>
      \${confirms}\${kills}
    </div>\` : '';

  const timeframeHtml = h.timeframe ? \`<div class="causal-note">⏱ \${h.timeframe}</div>\` : '';

  const causalHtml = (h.causality != null) ? \`
    <div class="causal-note" style="margin-top:10px;">
      <div class="section-label">Signal quality</div>
      <div class="causal-scores">
        <div class="score-item">
          <span class="score-value" style="color:var(--blue)">\${h.causality}</span>
          <span class="score-label">Causality</span>
        </div>
        <div class="score-item">
          <span class="score-value" style="color:var(--muted)">\${h.correlation ?? (100 - h.causality)}</span>
          <span class="score-label">Correlation</span>
        </div>
      </div>
    </div>\` : '';

  // Day selector default: 30 for MT/LT, 14 for ST
  const defaultDays = (h.horizon || '').toUpperCase().startsWith('ST') ? 14 : 30;
  const dayOptions = [7, 14, 30, 90];

  const daySelectorHtml = dayOptions.map(d =>
    \`<button class="day-btn\${d === defaultDays ? ' active' : ''}" data-days="\${d}" onclick="onDayClick(event,'\${h.id}')">\${d}d</button>\`
  ).join('');

  const bull = isBullish(h.direction);
  const dirColor = bull ? 'var(--green)' : 'var(--red)';

  const chartSection = \`
    <div class="chart-section">
      <div class="chart-top-row">
        <div>
          <span class="chart-title">Price chart</span>
          <span class="chart-ticker" id="ticker-label-\${h.id}" style="margin-left:6px;">—</span>
        </div>
        <div class="day-selector">\${daySelectorHtml}</div>
      </div>
      <div class="chart-legend">
        <div class="legend-item"><div class="legend-dot" style="background:rgba(99,102,241,0.9)"></div> Historical</div>
        <div class="legend-item"><div class="legend-dash" style="background:\${dirColor};opacity:0.85"></div> Forecast</div>
        <div class="legend-item"><div class="legend-band" style="background:\${dirColor}"></div> Confidence band</div>
      </div>
      <div class="chart-wrap" id="chart-wrap-\${h.id}">
        <canvas id="chart-canvas-\${h.id}"></canvas>
      </div>
      <div style="margin-top:6px;">
        <div class="conf-decay-bar" id="conf-decay-\${h.id}"></div>
        <div class="conf-decay-labels">
          <span>High confidence (\${h.confidence}%)</span>
          <span>Degrades →</span>
          <span>Noise floor</span>
        </div>
      </div>
    </div>\`;

  return \`
    <div class="card" data-id="\${h.id}" data-status="\${h.status||''}" data-horizon="\${h.horizon||''}" data-direction="\${h.direction||''}">
      <div class="card-header">
        <div class="card-top">
          <div class="card-id">\${h.id}</div>
          <div class="confidence-badge \${cClass}">\${h.confidence != null ? h.confidence + '%' : '?'}</div>
        </div>
        <div class="card-title">\${h.title}</div>
        <div class="tags">\${tags}</div>
      </div>
      \${instrumentHtml}
      <div class="card-expanded">
        \${pricedHtml}
        \${thesisHtml}
        \${watchHtml}
        \${timeframeHtml}
        \${causalHtml}
        <div class="causal-note">Last validated: \${h.lastValidated || '—'}</div>
        \${chartSection}
      </div>
    </div>\`;
}

// ─── Day selector click (stops propagation so card doesn't toggle) ──────────

function onDayClick(e, id) {
  e.stopPropagation();
  const btn = e.target;
  btn.closest('.day-selector').querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const days = parseInt(btn.dataset.days);
  const hyp = allHypotheses.find(h => h.id === id);
  if (hyp) renderChart(id, days, hyp);
}

// ─── Filter / market logic ─────────────────────────────────────────────────

function applyFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === filter));
  renderCards();
}

function applyMarket(market) {
  activeMarket = market;
  document.querySelectorAll('.market-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.market === market));
  activeFilter = 'all';
  document.querySelectorAll('.filter-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === 'all'));
  renderCards();
}

function filterHypotheses(hyps, filter) {
  let base = activeMarket === 'all' ? hyps : hyps.filter(h => (h.market || '') === activeMarket);
  if (filter === 'all') return base;
  return base.filter(h => {
    if (['Active','Developing','Predicted'].includes(filter))
      return (h.status || '').toLowerCase() === filter.toLowerCase();
    if (['ST','MT','LT'].includes(filter))
      return (h.horizon || '').toUpperCase().startsWith(filter);
    if (filter === 'Bullish') return (h.direction || '').toLowerCase().includes('bull');
    if (filter === 'Bearish') return (h.direction || '').toLowerCase().includes('bear');
    return true;
  });
}

// ─── Render cards ──────────────────────────────────────────────────────────

function renderCards() {
  // Destroy all chart instances before re-render
  Object.keys(chartInstances).forEach(id => {
    try { chartInstances[id].destroy(); } catch(_) {}
    delete chartInstances[id];
  });

  const container = document.getElementById('cardsContainer');
  const filtered = filterHypotheses(allHypotheses, activeFilter);
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty"><div class="empty-icon">🔭</div><div>No hypotheses match this filter.</div></div>';
    return;
  }
  container.innerHTML = filtered.map(renderCard).join('');

  // Card click: toggle expand + load chart on first open
  container.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Ignore clicks inside the expanded section (day buttons etc.)
      if (e.target.closest('.card-expanded')) return;
      const wasOpen = card.classList.contains('open');
      card.classList.toggle('open');
      if (!wasOpen) {
        // First time opening: load chart with default days
        const id = card.dataset.id;
        const hyp = allHypotheses.find(h => h.id === id);
        if (hyp) {
          const defaultDays = (hyp.horizon || '').toUpperCase().startsWith('ST') ? 14 : 30;
          // Update ticker label once data arrives (handled inside renderChart)
          renderChart(id, defaultDays, hyp).then(() => {
            const label = document.getElementById('ticker-label-' + id);
            if (label && chartInstances[id]) {
              // ticker is shown from the API response below
            }
          });
          // Eagerly show ticker from API
          fetch('/api/chart-data/' + id + '?days=1').then(r => r.json()).then(d => {
            const el = document.getElementById('ticker-label-' + id);
            if (el && d.ticker) el.textContent = d.ticker;
          }).catch(() => {});
        }
      }
    });
  });
}

// ─── Stats ─────────────────────────────────────────────────────────────────

function updateStats(hyps) {
  const active = hyps.filter(h => (h.status || '').toLowerCase() === 'active').length;
  const dev    = hyps.filter(h => (h.status || '').toLowerCase() === 'developing').length;
  document.getElementById('statActive').textContent = active;
  document.getElementById('statDev').textContent    = dev;
  document.getElementById('statTotal').textContent  = hyps.length;
  document.getElementById('lastUpdated').textContent =
    'Updated ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('countAll').textContent    = ' ' + hyps.length;
  document.getElementById('countIndia').textContent  = ' ' + hyps.filter(h => h.market === 'India').length;
  document.getElementById('countUS').textContent     = ' ' + hyps.filter(h => h.market === 'US').length;
  document.getElementById('countGlobal').textContent = ' ' + hyps.filter(h => h.market === 'Global').length;
}

// ─── Load data ─────────────────────────────────────────────────────────────

async function loadData() {
  const btn = document.getElementById('refreshBtn');
  btn.classList.add('spinning');
  try {
    const res = await fetch('/api/hypotheses');
    allHypotheses = await res.json();
    updateStats(allHypotheses);
    renderCards();
  } catch (e) {
    document.getElementById('cardsContainer').innerHTML =
      '<div class="empty"><div class="empty-icon">⚠️</div><div>Could not load data. Is the server running?</div></div>';
  } finally {
    btn.classList.remove('spinning');
  }
}

// ─── Event listeners ───────────────────────────────────────────────────────

document.getElementById('marketStrip').addEventListener('click', e => {
  const btn = e.target.closest('.market-btn');
  if (btn) applyMarket(btn.dataset.market);
});
document.getElementById('filterBar').addEventListener('click', e => {
  if (e.target.classList.contains('filter-btn')) applyFilter(e.target.dataset.filter);
});
document.getElementById('refreshBtn').addEventListener('click', loadData);

loadData();
<\/script>
</body>
</html>`;
