// Load .env before anything reads process.env
try { require('dotenv').config(); } catch(e) { /* dotenv optional */ }

const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3737;

// ─── Anthropic (TX generation) ────────────────────────────────────────────────
let anthropic = null;
try {
  const Anthropic = require('@anthropic-ai/sdk');
  if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    console.log('  AI TX generation: enabled (claude-haiku-4-5)');
  } else {
    console.log('  AI TX generation: disabled (set ANTHROPIC_API_KEY to enable)');
  }
} catch (e) {
  console.log('  AI TX generation: disabled (@anthropic-ai/sdk not found)');
}

const TX_CACHE_FILE = path.join(__dirname, 'tx-cache.json');
function readTxCache()  { try { return JSON.parse(fs.readFileSync(TX_CACHE_FILE, 'utf-8')); } catch { return {}; } }
function writeTxCache(d) { try { fs.writeFileSync(TX_CACHE_FILE, JSON.stringify(d, null, 2)); } catch {} }

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
  'BPCL': 'BPCL.NS', 'HPCL': 'HINDPETRO.NS', 'HINDPETRO': 'HINDPETRO.NS', 'IOC': 'IOC.NS',
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

// ─── Company parser ───────────────────────────────────────────────────────────
// Extracts all named companies / instruments from the instrument field.
// Returns [{label, ticker}] for use in the company selector UI.

function parseCompaniesFromInstrument(instrumentStr, market) {
  if (!instrumentStr) return [];
  const results = [];
  const seenTickers = new Set();

  // Pass 1: exchange-qualified codes "(NSE: CODE)" or "(NASDAQ: CODE)"
  const exchRe = /([^;,\n(]+?)\s*\((?:NSE|BSE|NASDAQ|NYSE)\s*:\s*([A-Z0-9.\-]{1,12})\)/gi;
  let m;
  while ((m = exchRe.exec(instrumentStr)) !== null) {
    const rawName = m[1].trim().replace(/^[\s—\-.:,/]+/, '').replace(/[\s—\-.:,/]+$/, '');
    const code    = m[2].toUpperCase();
    const ticker  = TICKER_MAP[code] || (market === 'India' ? code + '.NS' : code);
    if (!seenTickers.has(ticker)) {
      seenTickers.add(ticker);
      // Use the exchange code as the chip label (short & unambiguous)
      results.push({ label: code, ticker });
    }
  }

  // Pass 2: Yahoo Finance index codes "(^CODE)"
  const yahooRe = /([^;,\n(]+?)\s*\(\^([A-Z0-9]{2,10})\)/gi;
  while ((m = yahooRe.exec(instrumentStr)) !== null) {
    const code = '^' + m[2].toUpperCase();
    if (!seenTickers.has(code)) {
      seenTickers.add(code);
      const rawName = m[1].trim().replace(/^[\s—\-.:,/]+/, '').split(/\s+/).slice(0, 2).join(' ');
      results.push({ label: rawName || code, ticker: code });
    }
  }

  // Pass 3: simple ETF/stock lists without exchange codes: "IYR, XLU, IWM, KRE"
  if (results.length === 0) {
    const clean  = instrumentStr.replace(/\([^)]*\)/g, '').toUpperCase();
    const tokens = clean.split(/[;,/\s]+/).filter(t => /^[A-Z]{2,6}$/.test(t));
    for (const tok of tokens) {
      const ticker = TICKER_MAP[tok] || (market === 'India' ? tok + '.NS' : tok);
      if (!seenTickers.has(ticker)) {
        seenTickers.add(ticker);
        results.push({ label: tok, ticker });
      }
    }
  }

  return results.slice(0, 7); // cap at 7 to keep UI clean
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

    const companies = parseCompaniesFromInstrument(cmp.instrument, market);

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
      companies,
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
  const hyps     = loadAllHypotheses();
  const holdings = readHoldings();
  hyps.forEach(h => {
    // Collect all tickers this hypothesis touches (primary + company selector chips)
    const tickers = [
      getPrimaryTicker(h),
      ...((h.companies || []).map(c => c.ticker)),
    ].filter(Boolean);
    const weights = tickers.map(t => computePersonalWeight(t, holdings));
    h.personalWeight = weights.length ? Math.max(...weights) : 0;
    // isHeld = at least one ticker in this hypothesis is a current holding (netQty > 0)
    h.isHeld = tickers.some(t => (holdings[t]?.netQty || 0) > 0);
  });
  res.json(hyps);
});

// ─── API: chart data ──────────────────────────────────────────────────────────

app.get('/api/chart-data/:id', async (req, res) => {
  const id = req.params.id.toUpperCase();
  const histDays = Math.min(Math.max(parseInt(req.query.days) || 30, 7), 365);

  const hyps = loadAllHypotheses();
  const hyp = hyps.find(h => h.id === id);
  if (!hyp) return res.status(404).json({ error: 'Hypothesis not found' });

  // Allow ?ticker= override so the UI can chart any impacted company
  // Route override through TICKER_MAP so HPCL.NS → HINDPETRO.NS, etc.
  const tickerOverride = req.query.ticker ? req.query.ticker.toUpperCase() : null;
  let ticker;
  if (tickerOverride) {
    const stripped = tickerOverride.replace(/\.(NS|BO)$/i, '');
    ticker = TICKER_MAP[stripped] || TICKER_MAP[tickerOverride] || tickerOverride;
  } else {
    ticker = getPrimaryTicker(hyp);
  }
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

// ─── Ratings & Feedback file helpers ─────────────────────────────────────────

const RATINGS_FILE  = path.join(__dirname, 'ratings.json');
const FEEDBACK_FILE = path.join(__dirname, 'feedback.json');

function readRatings()  { try { return JSON.parse(fs.readFileSync(RATINGS_FILE,  'utf-8')); } catch { return {}; } }
function writeRatings(d)  { fs.writeFileSync(RATINGS_FILE,  JSON.stringify(d, null, 2)); }
function readFeedback() { try { return JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8')); } catch { return []; } }
function writeFeedback(d) { fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(d, null, 2)); }

function classifyFeedback(text) {
  const t = text.toLowerCase();
  if (/broken|doesn.t work|error|wrong|bug|fix\b|issue|problem|crash|fail|not working|404|blank/.test(t)) return 'bug';
  if (/add|would be nice|wish|could you|should|feature|request|want|need|missing|also show|also add|can you add/.test(t)) return 'feature';
  return 'general';
}

app.use(express.json());

// ─── API: ratings ─────────────────────────────────────────────────────────────

app.get('/api/ratings', (req, res) => res.json(readRatings()));

app.post('/api/ratings', (req, res) => {
  const { id, date, rating } = req.body;
  if (!id || !date || !['up', 'down'].includes(rating)) return res.status(400).json({ error: 'id, date, rating required' });
  const data = readRatings();
  if (!data[id]) data[id] = {};
  // Toggle off if same rating clicked again
  if (data[id][date]?.rating === rating) {
    delete data[id][date];
    writeRatings(data);
    return res.json({ ok: true, toggled: 'off' });
  }
  data[id][date] = { rating, timestamp: new Date().toISOString() };
  writeRatings(data);
  res.json({ ok: true });
});

// ─── API: feedback ────────────────────────────────────────────────────────────

app.get('/api/feedback', (req, res) => res.json(readFeedback()));

app.post('/api/feedback', (req, res) => {
  const { hypId, date, text } = req.body;
  if (!text || text.trim().length < 3) return res.status(400).json({ error: 'text required' });
  const type     = classifyFeedback(text);
  const priority = type === 'bug' ? 'P0' : type === 'feature' ? 'P2' : 'N/A';
  const entry = {
    id:             'fb-' + Date.now(),
    hypId:          hypId || null,
    date:           date  || new Date().toISOString().slice(0, 10),
    text:           text.trim(),
    type,
    priority,
    timestamp:      new Date().toISOString(),
    backlogStatus:  type === 'bug' ? 'P0-immediate' : 'new',
  };
  const list = readFeedback();
  list.push(entry);
  writeFeedback(list);
  res.json({ ok: true, type, priority, message: type === 'bug' ? '🔴 Bug logged as P0 — will be addressed immediately.' : type === 'feature' ? '💡 Feature request logged.' : '✅ Feedback logged.' });
});

// ─── API: corroborate — did the market agree with the prediction on a date? ───

app.get('/api/corroborate/:id', async (req, res) => {
  const id   = req.params.id.toUpperCase();
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const hyps = loadAllHypotheses();
  const hyp  = hyps.find(h => h.id === id);
  if (!hyp) return res.status(404).json({ error: 'Not found' });
  const ticker = getPrimaryTicker(hyp);
  if (!ticker) return res.json({ hasData: false, reason: 'No ticker mapped' });
  try {
    const target = new Date(date);
    const start  = new Date(target); start.setDate(start.getDate() - 8);
    const end    = new Date(target); end.setDate(end.getDate() + 2);
    const result = await getYF().chart(ticker, { period1: start, period2: end, interval: '1d' }, { validateResult: false });
    const quotes = (result?.quotes || []).filter(r => r.close != null)
      .map(r => ({ date: (r.date instanceof Date ? r.date : new Date(r.date)).toISOString().slice(0,10), close: r.close }));
    if (quotes.length < 2) return res.json({ hasData: false, reason: 'Insufficient price history for this date' });
    // Find the bar on or just after the target date
    let idx = quotes.findIndex(q => q.date >= date);
    if (idx < 1) idx = quotes.length - 1;
    const prev  = quotes[idx - 1];
    const curr  = quotes[idx];
    const pct   = ((curr.close - prev.close) / prev.close) * 100;
    const predBull  = (hyp.direction || '').toLowerCase().includes('bull');
    const actualUp  = pct > 0;
    const matches   = predBull === actualUp;
    return res.json({
      hasData: true, ticker,
      date: curr.date, prevDate: prev.date,
      prevClose: Math.round(prev.close * 100) / 100,
      close:     Math.round(curr.close  * 100) / 100,
      pctChange: Math.round(pct * 100) / 100,
      predictedDirection: predBull ? 'Bullish ↑' : 'Bearish ↓',
      actualDirection:    actualUp ? 'Up ↑' : 'Down ↓',
      matches,
      verdict: matches
        ? `✅ Market moved ${actualUp ? 'up' : 'down'} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%) — consistent with the ${predBull ? 'Bullish' : 'Bearish'} prediction`
        : `⚠️ Market moved ${actualUp ? 'up' : 'down'} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%) — opposite to the ${predBull ? 'Bullish' : 'Bearish'} prediction`,
    });
  } catch (e) {
    return res.json({ hasData: false, reason: e.message });
  }
});

// ─── Portfolio / Holdings ─────────────────────────────────────────────────────
//
// BL-003: Portfolio-aware hypothesis prioritisation
// Weights each hypothesis by how relevant it is to the owner's actual positions.
// Weight model: 1.0 = currently held  |  decays exponentially after sale (λ=0.003)
// Half-life ≈ 231 days — a position sold 8 months ago retains ~50% relevance weight.
//
// Data pipeline (now): test data via POST /api/holdings-load-test
// Data pipeline (next): Gmail Apps Script → POST /api/holdings-sync (BL-003 phase 2)

const HOLDINGS_FILE = path.join(__dirname, 'holdings.json');

// ISIN → Yahoo Finance ticker.  Extend as ISINs appear in Gmail transaction emails.
const ISIN_TO_TICKER = {
  'INE009A01021': 'INFY.NS',       // Infosys
  'INE467B01029': 'TCS.NS',        // Tata Consultancy Services
  'INE002A01018': 'RELIANCE.NS',   // Reliance Industries
  'INE030A01027': 'HDFCBANK.NS',   // HDFC Bank
  'INE090A01021': 'ICICIBANK.NS',  // ICICI Bank
  'INE040A01034': 'HCLTECH.NS',    // HCL Technologies
  'INE238A01034': 'AXISBANK.NS',   // Axis Bank
  'INE062A01020': 'SBIN.NS',       // State Bank of India
  'INE044A01036': 'SUNPHARMA.NS',  // Sun Pharma
  'INE585B01010': 'BHARTIARTL.NS', // Bharti Airtel
  'INE066A01021': 'BPCL.NS',       // BPCL
  'INE094A01015': 'HINDPETRO.NS',  // HPCL (Yahoo ticker: HINDPETRO)
  'INE211A01028': 'WIPRO.NS',      // Wipro
  'INE256A01028': 'ITC.NS',        // ITC
  'INE118A01012': 'HINDUNILVR.NS', // HUL
  'INE117A01022': 'MARUTI.NS',     // Maruti Suzuki
  'INE245A01021': 'NTPC.NS',       // NTPC
  'INE742F01042': 'LT.NS',         // Larsen & Toubro
  'INE148A01002': 'ONGC.NS',       // ONGC
  'INE216A01030': 'DABUR.NS',      // Dabur
  'INE860A01027': 'BAJFINANCE.NS', // Bajaj Finance
};

// Fuzzy company name → Yahoo ticker (for INDMoney / Groww email parsing)
function nameToTicker(name) {
  if (!name) return null;
  const n = name.toUpperCase().replace(/[\s.\-&]+/g, '');
  const map = {
    'TCS':'TCS.NS', 'TATACONSULTANCYSERVICES':'TCS.NS', 'TATACONSULTANCY':'TCS.NS',
    'INFOSYS':'INFY.NS', 'INFY':'INFY.NS',
    'RELIANCE':'RELIANCE.NS', 'RELIANCEINDUSTRIES':'RELIANCE.NS',
    'HDFCBANK':'HDFCBANK.NS', 'HDFC':'HDFCBANK.NS',
    'ICICIBANK':'ICICIBANK.NS', 'ICICI':'ICICIBANK.NS',
    'WIPRO':'WIPRO.NS',
    'ITC':'ITC.NS',
    'BPCL':'BPCL.NS',
    'MARUTI':'MARUTI.NS', 'MARUTISUZUKI':'MARUTI.NS',
    'AXISBANK':'AXISBANK.NS', 'AXIS':'AXISBANK.NS',
    'SBIN':'SBIN.NS', 'STATEBANKOFINDIA':'SBIN.NS', 'STATEBANK':'SBIN.NS',
    'ONGC':'ONGC.NS',
    'HINDUNILVR':'HINDUNILVR.NS', 'HUL':'HINDUNILVR.NS', 'HINDUSTANUNILEVER':'HINDUNILVR.NS',
    'BHARTIAIRTEL':'BHARTIARTL.NS', 'AIRTEL':'BHARTIARTL.NS',
    'MU':'MU', 'MICRON':'MU', 'MICRONTECHNOLOGY':'MU',
    'CRWD':'CRWD', 'CROWDSTRIKE':'CRWD',
    'AAPL':'AAPL', 'APPLE':'AAPL',
    'NVDA':'NVDA', 'NVIDIA':'NVDA',
    'MSFT':'MSFT', 'MICROSOFT':'MSFT',
    'GOOGL':'GOOGL', 'GOOGLE':'GOOGL', 'ALPHABET':'GOOGL',
    'AMZN':'AMZN', 'AMAZON':'AMZN',
    'META':'META', 'FACEBOOK':'META',
    'IWM':'IWM',
  };
  if (map[n]) return map[n];
  // Try first token only
  const first = n.match(/^[A-Z]+/)?.[0];
  return (first && map[first]) ? map[first] : null;
}

// Core weight formula.
// Currently held (netQty > 0) → 1.0
// Sold positions decay: w = e^(−λ·days)  λ=0.003 → half-life 231 days
function computePersonalWeight(ticker, holdings) {
  if (!holdings || !ticker) return 0;
  const pos = holdings[ticker];
  if (!pos) return 0;
  if ((pos.netQty || 0) > 0) return 1.0;
  if (!pos.lastTxDate) return 0;
  const daysSince = (Date.now() - new Date(pos.lastTxDate).getTime()) / 86400000;
  return Math.max(0, parseFloat(Math.exp(-0.003 * daysSince).toFixed(3)));
}

function readHoldings()    { try { return JSON.parse(fs.readFileSync(HOLDINGS_FILE, 'utf-8')); } catch { return {}; } }
function writeHoldings(d)  { fs.writeFileSync(HOLDINGS_FILE, JSON.stringify(d, null, 2)); }

// GET /api/holdings — current positions with live-computed weights
app.get('/api/holdings', (req, res) => {
  const h = readHoldings();
  const out = {};
  for (const [k, v] of Object.entries(h)) {
    if (k.startsWith('_')) { out[k] = v; continue; }
    out[k] = { ...v, personalWeight: computePersonalWeight(k, h) };
  }
  res.json(out);
});

// POST /api/holdings-sync — receives parsed transactions from Gmail Apps Script (BL-003 phase 2)
// Body: { transactions: [{date, direction, qty, name, isin?, ticker?}], syncedAt }
app.post('/api/holdings-sync', (req, res) => {
  const { transactions, syncedAt } = req.body || {};
  if (!Array.isArray(transactions)) return res.status(400).json({ error: 'transactions array required' });
  let holdings = readHoldings();
  transactions.forEach(tx => {
    const ticker = (tx.isin && ISIN_TO_TICKER[tx.isin]) || tx.ticker || nameToTicker(tx.name);
    if (!ticker) return;
    if (!holdings[ticker]) holdings[ticker] = { ticker, name: tx.name || ticker, netQty: 0, lastTxDate: tx.date, lastTxDirection: null };
    const qty = tx.direction === 'BUY' ? (tx.qty || 0) : -(tx.qty || 0);
    holdings[ticker].netQty = Math.max(0, (holdings[ticker].netQty || 0) + qty);
    if (!holdings[ticker].lastTxDate || tx.date >= holdings[ticker].lastTxDate) {
      holdings[ticker].lastTxDate      = tx.date;
      holdings[ticker].lastTxDirection = tx.direction;
    }
  });
  holdings._syncedAt = syncedAt || new Date().toISOString();
  holdings._source   = 'gmail-sync';
  writeHoldings(holdings);
  const n = Object.keys(holdings).filter(k => !k.startsWith('_')).length;
  res.json({ ok: true, positions: n, syncedAt: holdings._syncedAt });
});

// POST /api/holdings-load-test — seeds holdings.json with synthetic test data
// Maps to existing hypotheses so portfolio mode effects are immediately visible:
//   TCS.NS  (H-0005) → held 50 shares         → weight 1.0
//   MU      (H-0007) → held 100 shares         → weight 1.0
//   CRWD    (H-0008) → sold 60 days ago        → weight ~0.835
//   AAPL    (H-0010) → sold 198 days ago       → weight ~0.552
//   BPCL.NS (H-0002) → sold 377 days ago       → weight ~0.323
//   RELIANCE.NS      → sold 540 days ago       → weight ~0.198  (no current hypothesis)
app.post('/api/holdings-load-test', (req, res) => {
  const daysAgo = n => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
  const test = {
    'TCS.NS':      { ticker:'TCS.NS',      name:'Tata Consultancy Services', netQty:50,  lastTxDate:daysAgo(42),  lastTxDirection:'BUY'  },
    'MU':          { ticker:'MU',          name:'Micron Technology',          netQty:100, lastTxDate:daysAgo(68),  lastTxDirection:'BUY'  },
    'CRWD':        { ticker:'CRWD',        name:'CrowdStrike',                netQty:0,   lastTxDate:daysAgo(60),  lastTxDirection:'SELL' },
    'AAPL':        { ticker:'AAPL',        name:'Apple Inc.',                 netQty:0,   lastTxDate:daysAgo(198), lastTxDirection:'SELL' },
    'BPCL.NS':     { ticker:'BPCL.NS',     name:'BPCL',                      netQty:0,   lastTxDate:daysAgo(377), lastTxDirection:'SELL' },
    'RELIANCE.NS': { ticker:'RELIANCE.NS', name:'Reliance Industries',        netQty:0,   lastTxDate:daysAgo(540), lastTxDirection:'SELL' },
    _syncedAt: new Date().toISOString(),
    _source: 'test-data',
  };
  writeHoldings(test);
  // Return computed weights so the caller can verify the math
  const report = {};
  for (const [k, v] of Object.entries(test)) {
    if (k.startsWith('_')) continue;
    const days = Math.round((Date.now() - new Date(v.lastTxDate).getTime()) / 86400000);
    report[k] = { netQty: v.netQty, daysSinceTx: days, personalWeight: computePersonalWeight(k, test) };
  }
  res.json({ ok: true, loaded: Object.keys(report).length, weights: report });
});

// POST /api/holdings-clear — wipes holdings back to empty (resets to feature-off state)
app.post('/api/holdings-clear', (req, res) => {
  writeHoldings({ _clearedAt: new Date().toISOString(), _source: 'manual-clear' });
  res.json({ ok: true, message: 'Holdings cleared. Portfolio mode will show no weights.' });
});

// ─── Server-side TX generator (mirrors the client-side version in the HTML template) ──
function generateTX(h) {
  const lines = [];
  if (h.oneliner) {
    lines.push("🔍 <strong>The short version:</strong> " + h.oneliner);
  }
  const d = (h.direction || '').toLowerCase();
  const isBull = d.includes('bull');
  const isBear = d.includes('bear');
  const arrow  = isBull ? '📈' : isBear ? '📉' : '📊';
  const verb   = isBull ? 'expected to go <strong>UP</strong>' : isBear ? 'expected to go <strong>DOWN</strong>' : 'being watched';
  const mag    = h.magnitude ? ' by about <strong>' + h.magnitude.replace(/^[+\-]/, '') + '</strong>' : '';
  const tf     = h.timeframe ? ' over <strong>' + h.timeframe + '</strong>' : '';
  const instShort = (h.instrument || '').split(/[;(—]/)[0].replace(/[,\/].+/, '').trim().slice(0, 40);
  lines.push(arrow + ' <strong>The bet:</strong> ' + (instShort || 'The instrument') + ' is ' + verb + mag + tf);
  const conf = h.confidence;
  let confDesc = '';
  if (conf >= 75) confDesc = 'We are pretty sure — strong evidence from multiple sources points the same way.';
  else if (conf >= 60) confDesc = 'More likely than not — there is real evidence behind this, but it could still go either way.';
  else if (conf >= 40) confDesc = 'Still early — something is there, but we need more data before betting on it.';
  else confDesc = 'Just watching for now — too soon to have a real view.';
  lines.push('🎯 <strong>' + (conf || '?') + '% sure</strong> — ' + confDesc);
  const c = (h.confirms || [])[0];
  const k = (h.kills || [])[0];
  if (c) lines.push('✅ <strong>We know it is working if:</strong> ' + c.slice(0, 130));
  else if (k) lines.push('❌ <strong>We know it is wrong if:</strong> ' + k.slice(0, 130));
  return lines;
}

// ─── AI plain-language TX endpoint ────────────────────────────────────────────

app.get('/api/tx/:id', async (req, res) => {
  const id = req.params.id;
  const hyps = loadAllHypotheses();
  const h = hyps.find(x => x.id === id);
  if (!h) return res.status(404).json({ error: 'Hypothesis not found' });

  // Cache key: id + confidence (if confidence changes, regenerate)
  const cacheKey = id + '_' + (h.confidence || 0);
  const cache = readTxCache();
  if (cache[cacheKey]) return res.json({ lines: cache[cacheKey], source: 'cache' });

  // No API key or SDK — fall back to static template
  if (!anthropic) {
    return res.json({ lines: generateTX(h), source: 'static' });
  }

  try {
    const d = (h.direction || '').toLowerCase();
    const isBull = d.includes('bull');
    const isBear = d.includes('bear');
    const arrow  = isBull ? '📈' : isBear ? '📉' : '📊';
    const conf   = h.confidence || 0;

    const prompt = `You are explaining a financial market prediction to a curious 16-year-old who has never studied finance.

Here is the prediction:
- Title: ${h.title}
- One-liner: ${h.oneliner || ''}
- Instrument: ${(h.instrument || '').split(';')[0].trim()}
- Direction: ${h.direction || ''}
- Magnitude: ${h.magnitude || ''}
- Timeframe: ${h.timeframe || ''}
- Confidence: ${conf}%
- First confirmation signal: ${(h.confirms || [])[0] || ''}
- First kill signal: ${(h.kills || [])[0] || ''}

Write exactly 4 short lines. Each line starts with an emoji and a bold label.
Use simple everyday words. No finance jargon. No words like: bullish, bearish, instrument, conviction, thesis, signal, equity, valuation, catalyst, macro, correlation.
Think of how you'd explain it to a friend, not a client.

Line 1 — emoji 🔍, bold label "The short version:", then one plain sentence summarising what is going on in the world.
Line 2 — emoji ${arrow}, bold label "The bet:", then say what the stock/index is expected to do, by how much, and by when. Use "go up" or "go down" not "bullish/bearish".
Line 3 — emoji 🎯, bold label "${conf}% sure —", then in one sentence say how confident we are and why (use plain words like "pretty confident", "still early days", "just a hunch we're watching").
Line 4 — emoji ✅ or ❌, bold label "We'll know it's ${isBull ? 'working' : isBear ? 'wrong' : 'playing out'} if:", then the single clearest thing to watch for.

Format each line as HTML with <strong> tags around the label only. No bullet points, no numbering, no extra lines.`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim();
    // Split on newlines, filter empty lines
    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Cache it
    cache[cacheKey] = lines;
    writeTxCache(cache);

    res.json({ lines, source: 'ai' });
  } catch (e) {
    console.error('TX AI error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── Single-page app ──────────────────────────────────────────────────────────

app.get('/', (req, res) => res.send(HTML));
app.get('/history', (req, res) => res.send(HISTORY_HTML));

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
<script defer src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"><\/script>
<style>
  :root {
    --bg: #f4f5f9;
    --surface: #ffffff;
    --surface2: #edf0f8;
    --border: #dce0ef;
    --text: #1a1d2e;
    --muted: #6b7090;
    --green: #16a34a;
    --yellow: #b45309;
    --orange: #c2410c;
    --red: #dc2626;
    --blue: #2563eb;
    --purple: #7c3aed;
    --radius: 12px;
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  html, body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif; min-height: 100vh; }

  /* Header */
  .header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(244,245,249,0.95); backdrop-filter: blur(16px);
    padding: calc(var(--safe-top) + 12px) 16px 12px;
    border-bottom: 1px solid var(--border);
    box-shadow: 0 1px 8px rgba(0,0,0,0.06);
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

  /* ── TX (Translation) section ─────────────────────────────────────── */
  .tx-section {
    background: rgba(59,130,246,0.06);
    border: 1px solid rgba(59,130,246,0.2);
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 14px;
  }
  .tx-header { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: var(--blue); font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
  .tx-source-badge { font-size: 9px; font-weight: 600; padding: 1px 6px; border-radius: 4px; text-transform: none; letter-spacing: 0; cursor: pointer; transition: opacity 0.15s; }
  .tx-source-badge.ai { background: rgba(99,102,241,0.15); color: var(--blue); border: 1px solid rgba(99,102,241,0.3); }
  .tx-source-badge.static { background: rgba(148,163,184,0.15); color: var(--muted); border: 1px solid rgba(148,163,184,0.25); }
  .tx-retry-btn { font-size: 11px; background: none; border: none; cursor: pointer; color: var(--muted); padding: 0; line-height: 1; margin-left: auto; opacity: 0.7; }
  .tx-retry-btn:hover { opacity: 1; color: var(--blue); }
  .tx-retry-btn.spinning { animation: spin 1s linear infinite; display: inline-block; }
  .tx-bullets { list-style: none; display: flex; flex-direction: column; gap: 5px; }
  .tx-bullets li { font-size: 12px; line-height: 1.5; color: var(--text); }

  /* ── Companies section ─────────────────────────────────────────────── */
  .company-selector { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px; }
  .company-btn {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 6px;
    padding: 4px 10px; font-size: 11px; font-weight: 700; color: var(--muted);
    cursor: pointer; transition: all 0.12s; font-family: 'SF Mono', monospace;
  }
  .company-btn.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.6); color: #c7d2fe; }
  .company-btn:hover:not(.active) { border-color: var(--blue); color: var(--blue); }

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

  /* ── Rating row ────────────────────────────────────────────────────── */
  .rating-row { display: flex; align-items: center; gap: 6px; padding: 6px 14px 8px; }
  .rating-btn {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; padding: 4px 10px; font-size: 14px; cursor: pointer;
    transition: all 0.15s; line-height: 1; color: var(--muted);
  }
  .rating-btn.active-up   { background: rgba(22,163,74,0.12);  border-color: var(--green); }
  .rating-btn.active-down { background: rgba(220,38,38,0.10);  border-color: var(--red); }
  .rating-label { font-size: 11px; color: var(--muted); }

  /* ── Feedback section ───────────────────────────────────────────────── */
  .feedback-section { margin-top: 14px; border-top: 1px solid var(--border); padding-top: 12px; }
  .feedback-input {
    width: 100%; min-height: 64px; background: var(--surface2);
    border: 1px solid var(--border); border-radius: 8px; padding: 8px 10px;
    font-size: 12px; color: var(--text); resize: vertical; font-family: inherit;
    line-height: 1.5; margin-top: 6px;
  }
  .feedback-input::placeholder { color: var(--muted); }
  .feedback-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
  .feedback-submit {
    background: var(--blue); color: #fff; border: none; border-radius: 8px;
    padding: 6px 16px; font-size: 12px; font-weight: 600; cursor: pointer;
    transition: opacity 0.15s;
  }
  .feedback-submit:hover { opacity: 0.88; }
  .feedback-status { font-size: 11px; }
  .feedback-status.bug     { color: var(--red); }
  .feedback-status.feature { color: var(--blue); }
  .feedback-status.general { color: var(--green); }

  /* ── Portfolio mode toggle button ───────────────────────────────────── */
  .portfolio-toggle-btn {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 8px;
    padding: 5px 10px; font-size: 12px; font-weight: 600; cursor: pointer;
    color: var(--muted); transition: all 0.15s; white-space: nowrap;
    display: inline-flex; align-items: center; gap: 5px; line-height: 1;
  }
  .portfolio-toggle-btn.active {
    background: var(--blue); border-color: var(--blue); color: #fff;
    box-shadow: 0 2px 8px rgba(37,99,235,0.3);
  }
  .portfolio-toggle-btn .ptog-dot {
    width: 6px; height: 6px; border-radius: 50%; background: currentColor;
  }

  /* ── Portfolio mode banner (shown below filters when mode is on) ─────── */
  .portfolio-banner {
    display: none; background: #eff6ff; border-bottom: 1px solid #bfdbfe;
    padding: 8px 16px; font-size: 12px; color: #1d4ed8;
    align-items: center; gap: 8px; flex-wrap: wrap;
  }
  .portfolio-banner.visible { display: flex; }
  .portfolio-banner strong { font-weight: 700; }
  .portfolio-banner .pban-meta { color: #3b82f6; flex: 1; }
  .portfolio-banner .pban-close {
    background: none; border: 1px solid #93c5fd; border-radius: 6px;
    color: #1d4ed8; cursor: pointer; font-size: 11px; font-weight: 600;
    padding: 3px 8px; transition: all 0.15s;
  }
  .portfolio-banner .pban-close:hover { background: #dbeafe; }

  /* ── Portfolio weight badges on cards ────────────────────────────────── */
  .held-badge {
    display: inline-flex; align-items: center; gap: 3px;
    background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;
    border-radius: 20px; padding: 2px 8px; font-size: 11px; font-weight: 700;
    letter-spacing: 0.01em;
  }
  .history-badge {
    display: inline-flex; align-items: center; gap: 3px;
    background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa;
    border-radius: 20px; padding: 2px 8px; font-size: 11px; font-weight: 600;
  }

  /* ── Portfolio relevance bar (visible in portfolio mode only) ─────────── */
  .weight-bar-wrap {
    display: flex; align-items: center; gap: 6px; margin-top: 5px;
    padding: 4px 0; border-top: 1px solid var(--border);
  }
  .weight-bar-label { font-size: 10px; color: var(--muted); white-space: nowrap; }
  .weight-bar-track {
    flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden;
  }
  .weight-bar-fill { height: 100%; border-radius: 2px; transition: width 0.4s ease; }
  .weight-bar-pct  { font-size: 10px; font-weight: 700; color: var(--muted); min-width: 28px; text-align: right; }

  /* ── History icon in header ─────────────────────────────────────────── */
  .history-btn {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 8px;
    padding: 5px 10px; font-size: 16px; cursor: pointer; color: var(--muted);
    text-decoration: none; line-height: 1; display: inline-flex; align-items: center;
    transition: all 0.15s;
  }
  .history-btn:hover { border-color: var(--blue); color: var(--blue); }

  /* Empty / loading */
  .empty { text-align: center; padding: 60px 24px; color: var(--muted); }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .loading { text-align: center; padding: 60px 24px; color: var(--muted); font-size: 14px; }

  /* Refresh FAB */
  .refresh-btn {
    position: fixed; bottom: calc(20px + var(--safe-bottom)); right: 16px;
    background: var(--blue); color: #fff; border: none; border-radius: 50%;
    width: 52px; height: 52px; font-size: 20px; cursor: pointer;
    box-shadow: 0 4px 16px rgba(37,99,235,0.3);
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
    <div style="display:flex;align-items:center;gap:8px;">
      <button class="portfolio-toggle-btn" id="portfolioToggleBtn" onclick="togglePortfolioMode()" title="Sort by your holdings — currently held stocks float to top">
        <span class="ptog-dot"></span>Portfolio
      </button>
      <a href="/history" class="history-btn" title="View history &amp; rate predictions">🕐</a>
      <div class="last-updated" id="lastUpdated">Loading…</div>
    </div>
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

<div class="portfolio-banner" id="portfolioBanner">
  <strong>🎯 Portfolio mode ON</strong>
  <span class="pban-meta" id="portfolioBannerMeta"></span>
  <button class="pban-close" onclick="togglePortfolioMode()">✕ Turn off</button>
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

// Selected ticker per hypothesis (for company selector)
const selectedTickers = {};

// Ratings keyed by hypId → date → {rating}
let allRatings = {};
const todayStr  = new Date().toISOString().slice(0, 10);

// ─── Portfolio mode state ──────────────────────────────────────────────────────
// Persisted to localStorage so it survives page reloads.
let portfolioMode = localStorage.getItem('mp_portfolio_mode') === '1';
let allHoldings   = {};  // loaded from /api/holdings

async function loadHoldings() {
  try { allHoldings = await fetch('/api/holdings').then(function(r) { return r.json(); }); } catch(err) { allHoldings = {}; }
}

function togglePortfolioMode() {
  portfolioMode = !portfolioMode;
  localStorage.setItem('mp_portfolio_mode', portfolioMode ? '1' : '0');
  applyPortfolioModeUI();
  renderCards();
}

function applyPortfolioModeUI() {
  const btn    = document.getElementById('portfolioToggleBtn');
  const banner = document.getElementById('portfolioBanner');
  const meta   = document.getElementById('portfolioBannerMeta');
  if (btn)    btn.classList.toggle('active', portfolioMode);
  if (banner) banner.classList.toggle('visible', portfolioMode);
  if (meta && portfolioMode) {
    const held    = allHypotheses.filter(h => h.isHeld).length;
    const relevant = allHypotheses.filter(h => (h.personalWeight || 0) > 0).length;
    meta.textContent = held
      ? \`\${held} held · \${relevant} with transaction history — sorted by relevance\`
      : 'No holdings loaded — load test data or sync Gmail to see weights';
  }
}

// personalRelevanceScore: weight (0–1) × confidence (0–100) → 0–100 scale
function personalRelevanceScore(h) {
  return (h.personalWeight || 0) * (h.confidence || 0);
}

// ─── Rating helpers ────────────────────────────────────────────────────────────

async function loadRatings() {
  try { allRatings = await fetch('/api/ratings').then(function(r) { return r.json(); }); } catch(err) { allRatings = {}; }
}

function getRating(id, date) {
  return allRatings[id]?.[date]?.rating || null;
}

function updateRatingUI(id, date) {
  const r = getRating(id, date || todayStr);
  ['up','down'].forEach(v => {
    document.querySelectorAll(\`.rating-btn-\${v}[data-id="\${id}"]\`).forEach(btn => {
      btn.classList.toggle('active-' + v, r === v);
    });
  });
}

async function rate(e, id, ratingVal) {
  e.stopPropagation();
  const resp = await fetch('/api/ratings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, date: todayStr, rating: ratingVal }),
  });
  const data = await resp.json();
  if (data.toggled === 'off') {
    if (allRatings[id]) delete allRatings[id][todayStr];
  } else {
    if (!allRatings[id]) allRatings[id] = {};
    allRatings[id][todayStr] = { rating: ratingVal };
  }
  updateRatingUI(id, todayStr);
}

async function submitFeedback(id) {
  const ta  = document.getElementById('fb-' + id);
  const sta = document.getElementById('fb-status-' + id);
  if (!ta || !ta.value.trim()) return;
  const resp = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hypId: id, date: todayStr, text: ta.value }),
  });
  const data = await resp.json();
  if (data.ok) {
    sta.textContent = data.message;
    sta.className   = 'feedback-status ' + data.type;
    ta.value = '';
    setTimeout(() => { sta.textContent = ''; }, 4000);
  }
}

// ─── TX (Plain English Translation) ───────────────────────────────────────────

function generateTX(h) {
  const lines = [];

  // Line 1 — the story in one sentence
  if (h.oneliner) {
    lines.push("🔍 <strong>The short version:</strong> " + h.oneliner);
  }

  // Line 2 — the bet in plain English
  const d = (h.direction || '').toLowerCase();
  const isBull = d.includes('bull');
  const isBear = d.includes('bear');
  const arrow  = isBull ? '📈' : isBear ? '📉' : '📊';
  const verb   = isBull ? 'expected to go <strong>UP</strong>' : isBear ? 'expected to go <strong>DOWN</strong>' : 'being watched';
  // Clean magnitude: "+20–35%" → "20–35%"; "-8–15%" → "8–15%"
  const mag    = h.magnitude ? ' by about <strong>' + h.magnitude.replace(/^[+\-]/, '') + '</strong>' : '';
  const tf     = h.timeframe ? ' over <strong>' + h.timeframe + '</strong>' : '';
  // Shorten instrument to first meaningful segment
  const instShort = (h.instrument || '').split(/[;(—]/)[0].replace(/[,\/].+/, '').trim().slice(0, 40);
  lines.push(arrow + ' <strong>The bet:</strong> ' + (instShort || 'The instrument') + ' is ' + verb + mag + tf);

  // Line 3 — how sure are we, in plain language
  const conf = h.confidence;
  let confDesc = '';
  if (conf >= 75) confDesc = 'We are pretty sure — strong evidence from multiple sources points the same way.';
  else if (conf >= 60) confDesc = 'More likely than not — there is real evidence behind this, but it could still go either way.';
  else if (conf >= 40) confDesc = 'Still early — something is there, but we need more data before betting on it.';
  else confDesc = 'Just watching for now — too soon to have a real view.';
  lines.push('🎯 <strong>' + (conf || '?') + '% sure</strong> — ' + confDesc);

  // Line 4 — the one thing that would prove it right or wrong
  const c = (h.confirms || [])[0];
  const k = (h.kills || [])[0];
  if (c) lines.push('✅ <strong>We know it is working if:</strong> ' + c.slice(0, 130));
  else if (k) lines.push('❌ <strong>We know it is wrong if:</strong> ' + k.slice(0, 130));

  return lines;
}

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

// ─── TX (TL;DR) helpers ────────────────────────────────────────────────────

// Stored AI lines per hypothesis (keyed by id) so toggle can switch back
var txAiLines = {};

function loadTxAI(id) {
  var txBody = document.getElementById('tx-body-' + id);
  var badge  = document.getElementById('tx-badge-' + id);
  var retryBtn = document.getElementById('tx-retry-' + id);
  if (!txBody) return;
  fetch('/api/tx/' + id)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.lines && data.lines.length > 0 && (data.source === 'ai' || data.source === 'cache')) {
        txAiLines[id] = data.lines;
        txBody.innerHTML = data.lines.map(function(l) { return '<li>' + l + '</li>'; }).join('');
        if (badge) {
          badge.textContent = data.source === 'cache' ? '✨ AI (cached)' : '✨ AI';
          badge.className = 'tx-source-badge ai';
          badge.title = 'Showing AI version — tap to switch to template';
        }
      }
      // source === 'static' means no API key or fallback — badge stays as Template
    })
    .catch(function() {
      // Silent fail — badge stays as Template, retry button still available
    });
}

function onTxRetry(e, id) {
  e.stopPropagation();
  var retryBtn = document.getElementById('tx-retry-' + id);
  var badge    = document.getElementById('tx-badge-' + id);
  if (retryBtn) retryBtn.classList.add('spinning');
  // Clear cache hint by adding ?nocache= so server re-fetches (cache still used server-side for speed)
  fetch('/api/tx/' + id + '?t=' + Date.now())
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (retryBtn) retryBtn.classList.remove('spinning');
      if (data.lines && data.lines.length > 0 && (data.source === 'ai' || data.source === 'cache')) {
        txAiLines[id] = data.lines;
        var txBody = document.getElementById('tx-body-' + id);
        if (txBody) txBody.innerHTML = data.lines.map(function(l) { return '<li>' + l + '</li>'; }).join('');
        if (badge) { badge.textContent = '✨ AI'; badge.className = 'tx-source-badge ai'; }
      } else {
        if (badge) { badge.textContent = '⚠️ Retry'; badge.className = 'tx-source-badge static'; }
      }
    })
    .catch(function() {
      if (retryBtn) retryBtn.classList.remove('spinning');
      var badge = document.getElementById('tx-badge-' + id);
      if (badge) { badge.textContent = '⚠️ Failed'; badge.className = 'tx-source-badge static'; }
    });
}

function onTxToggle(id) {
  var txBody = document.getElementById('tx-body-' + id);
  var badge  = document.getElementById('tx-badge-' + id);
  var section = document.getElementById('tx-' + id);
  if (!txBody || !section) return;
  var staticLines = [];
  try { staticLines = JSON.parse(decodeURIComponent(section.dataset.static || '[]')); } catch(e) {}
  var isShowingAI = badge && badge.classList.contains('ai');
  if (isShowingAI && staticLines.length > 0) {
    // Switch to template
    txBody.innerHTML = staticLines.map(function(l) { return '<li>' + l + '</li>'; }).join('');
    if (badge) { badge.textContent = '📝 Template'; badge.className = 'tx-source-badge static'; badge.title = 'Showing template — tap to switch to AI'; }
  } else if (!isShowingAI && txAiLines[id] && txAiLines[id].length > 0) {
    // Switch back to AI
    txBody.innerHTML = txAiLines[id].map(function(l) { return '<li>' + l + '</li>'; }).join('');
    if (badge) { badge.textContent = '✨ AI'; badge.className = 'tx-source-badge ai'; badge.title = 'Showing AI version — tap to switch to template'; }
  }
  // If AI not loaded yet and badge clicked, trigger load
  if (!isShowingAI && !txAiLines[id]) loadTxAI(id);
}

function isBullish(direction) {
  return (direction || '').toLowerCase().includes('bull');
}

// ─── Company selector click ────────────────────────────────────────────────

function onCompanyClick(e, id, ticker) {
  e.stopPropagation();
  const btn = e.target;
  btn.closest('.company-selector').querySelectorAll('.company-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedTickers[id] = ticker;
  // Get currently active day selection
  const daysSel = document.getElementById('chart-days-' + id);
  const activeDay = daysSel ? daysSel.querySelector('.day-btn.active') : null;
  const days = activeDay ? parseInt(activeDay.dataset.days) : 30;
  const hyp = allHypotheses.find(h => h.id === id);
  if (hyp) renderChart(id, days, hyp, ticker);
}

// ─── Chart rendering ───────────────────────────────────────────────────────

// ticker: optional override (from company selector). null = use primary ticker.
async function renderChart(id, days, hyp, ticker) {
  const wrap    = document.getElementById('chart-wrap-' + id);
  const canvas  = document.getElementById('chart-canvas-' + id);
  if (!wrap || !canvas) return;

  // Show spinner
  wrap.innerHTML = '<div class="chart-loading"><div class="chart-spinner"></div><span>Fetching prices…</span></div>';

  let data;
  try {
    const tickerParam = ticker ? '&ticker=' + encodeURIComponent(ticker) : '';
    const resp = await fetch('/api/chart-data/' + id + '?days=' + days + tickerParam);
    data = await resp.json();
  } catch (e) {
    wrap.innerHTML = '<div class="chart-error">⚠️ Network error</div>';
    return;
  }

  // Always update the ticker label to reflect what's actually being charted
  var labelEl = document.getElementById('ticker-label-' + id);
  if (labelEl && data.ticker) labelEl.textContent = data.ticker;

  if (data.noTicker) {
    wrap.innerHTML = '<div class="chart-no-ticker">📊 No exchange ticker mapped<br><small style="opacity:0.6">Charts available for listed instruments</small></div>';
    if (labelEl) labelEl.textContent = '—';
    return;
  }
  if (data.error && !data.historical) {
    wrap.innerHTML = '<div class="chart-error">⚠️ ' + (data.error || 'Could not load prices') + '</div>';
    if (labelEl) labelEl.textContent = '—';
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
      ctx.strokeStyle = 'rgba(100,110,150,0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, scales.y.top);
      ctx.lineTo(x, scales.y.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(100,110,150,0.55)';
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
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderColor: 'rgba(220,224,239,0.9)',
          borderWidth: 1,
          titleColor: '#1a1d2e',
          bodyColor: '#6b7090',
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
            color: '#6b7090',
            maxTicksLimit: 6,
            font: { size: 9 },
            maxRotation: 0,
          },
          grid: { color: 'rgba(156,163,175,0.22)' },
        },
        y: {
          position: 'right',
          ticks: {
            color: '#6b7090',
            font: { size: 9 },
            maxTicksLimit: 5,
            callback: (v) => {
              if (v >= 1000) return (v / 1000).toFixed(1) + 'k';
              return v.toFixed(v < 10 ? 2 : 0);
            },
          },
          grid: { color: 'rgba(156,163,175,0.22)' },
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

  // TX section — plain English (static fallback; AI version loaded on card open)
  const txLines = generateTX(h);
  const txHtml = txLines.length > 0 ? \`
    <div class="tx-section" id="tx-\${h.id}" data-static="\${encodeURIComponent(JSON.stringify(txLines))}">
      <div class="tx-header">
        🗣 TL;DR — Plain English
        <span class="tx-source-badge static" id="tx-badge-\${h.id}" onclick="onTxToggle('\${h.id}')" title="Tap to toggle AI / Template view">📝 Template</span>
        <button class="tx-retry-btn" id="tx-retry-\${h.id}" onclick="onTxRetry(event,'\${h.id}')" title="Reload AI version">🔄</button>
      </div>
      <ul class="tx-bullets" id="tx-body-\${h.id}">
        \${txLines.map(l => \`<li>\${l}</li>\`).join('')}
      </ul>
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

  // Company selector — pills for each impacted instrument
  const companies = h.companies || [];
  const primaryTicker = companies[0] ? companies[0].ticker : null;
  const companySelectorHtml = companies.length > 1 ? \`
    <div style="margin-bottom:6px;">
      <div class="section-label" style="margin-bottom:4px;">Select instrument to chart</div>
      <div class="company-selector" id="company-sel-\${h.id}">\${
        companies.map((c, i) =>
          \`<button class="company-btn\${i === 0 ? ' active' : ''}" onclick="onCompanyClick(event,'\${h.id}','\${c.ticker}')">\${c.label}</button>\`
        ).join('')
      }</div>
    </div>\` : '';

  const bull = isBullish(h.direction);
  const dirColor = bull ? 'var(--green)' : 'var(--red)';

  const chartSection = \`
    <div class="chart-section">
      <div class="chart-top-row">
        <div>
          <span class="chart-title">Price chart</span>
          <span class="chart-ticker" id="ticker-label-\${h.id}" style="margin-left:6px;">—</span>
        </div>
        <div class="day-selector" id="chart-days-\${h.id}">\${daySelectorHtml}</div>
      </div>
      \${companySelectorHtml}
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

  // Rating row (shared between brief and expanded view)
  const ratingRowHtml = \`
    <div class="rating-row">
      <button class="rating-btn rating-btn-up"   data-id="\${h.id}" onclick="rate(event,'\${h.id}','up')"   title="This played out — prediction was correct">👍</button>
      <button class="rating-btn rating-btn-down" data-id="\${h.id}" onclick="rate(event,'\${h.id}','down')" title="This did NOT play out — prediction was wrong">👎</button>
      <span class="rating-label">Did this play out?</span>
    </div>\`;

  // Feedback section (in expanded view)
  const feedbackHtml = \`
    <div class="feedback-section">
      <div class="section-label">Your feedback</div>
      <textarea class="feedback-input" id="fb-\${h.id}" placeholder="Add a note — prediction accuracy, missed factor, feature idea, or bug report…"></textarea>
      <div class="feedback-footer">
        <span class="feedback-status" id="fb-status-\${h.id}"></span>
        <button class="feedback-submit" onclick="submitFeedback('\${h.id}')">Submit</button>
      </div>
    </div>\`;

  // Portfolio badges — shown whenever a hypothesis has weight, regardless of mode
  const pw = h.personalWeight || 0;
  const portfolioBadgeHtml = pw > 0 ? (
    h.isHeld
      ? \`<span class="held-badge">🎯 Held</span>\`
      : \`<span class="history-badge">\${pw >= 0.7 ? '📋 Recent' : '🕐 Past'} · \${Math.round(pw * 100)}%</span>\`
  ) : '';

  // Weight bar — only in portfolio mode, gives quick visual of relative relevance
  const weightBarHtml = portfolioMode && pw > 0 ? \`
    <div class="weight-bar-wrap" title="Portfolio relevance: \${Math.round(pw * 100)}%">
      <span class="weight-bar-label">Relevance</span>
      <div class="weight-bar-track">
        <div class="weight-bar-fill" style="width:\${Math.round(pw * 100)}%;background:\${h.isHeld ? 'var(--green)' : 'var(--orange)'}"></div>
      </div>
      <span class="weight-bar-pct">\${Math.round(pw * 100)}%</span>
    </div>\` : '';

  return \`
    <div class="card" data-id="\${h.id}" data-status="\${h.status||''}" data-horizon="\${h.horizon||''}" data-direction="\${h.direction||''}">
      <div class="card-header">
        <div class="card-top">
          <div class="card-id">\${h.id}</div>
          <div style="display:flex;align-items:center;gap:6px;">
            \${portfolioBadgeHtml}
            <div class="confidence-badge \${cClass}">\${h.confidence != null ? h.confidence + '%' : '?'}</div>
          </div>
        </div>
        <div class="card-title">\${h.title}</div>
        \${weightBarHtml}
        <div class="tags">\${tags}</div>
      </div>
      \${ratingRowHtml}
      \${instrumentHtml}
      <div class="card-expanded">
        \${txHtml}
        \${pricedHtml}
        \${thesisHtml}
        \${watchHtml}
        \${timeframeHtml}
        \${causalHtml}
        <div class="causal-note">Last validated: \${h.lastValidated || '—'}</div>
        \${chartSection}
        \${feedbackHtml}
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
  const hyp  = allHypotheses.find(h => h.id === id);
  if (hyp) renderChart(id, days, hyp, selectedTickers[id] || null);
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
  if (filter !== 'all') {
    base = base.filter(h => {
      if (['Active','Developing','Predicted'].includes(filter))
        return (h.status || '').toLowerCase() === filter.toLowerCase();
      if (['ST','MT','LT'].includes(filter))
        return (h.horizon || '').toUpperCase().startsWith(filter);
      if (filter === 'Bullish') return (h.direction || '').toLowerCase().includes('bull');
      if (filter === 'Bearish') return (h.direction || '').toLowerCase().includes('bear');
      return true;
    });
  }
  // Portfolio mode: sort by personalRelevanceScore desc (weight × confidence)
  // Hypotheses with zero weight stay at natural order but sink below weighted ones
  if (portfolioMode) {
    return [...base].sort((a, b) => personalRelevanceScore(b) - personalRelevanceScore(a));
  }
  return base;
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
  // Restore rating state on re-render
  filtered.forEach(h => updateRatingUI(h.id, todayStr));

  // Card click: toggle expand + load chart on first open
  container.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Ignore clicks inside the expanded section (day buttons etc.)
      if (e.target.closest('.card-expanded')) return;
      const wasOpen = card.classList.contains('open');
      card.classList.toggle('open');
      if (!wasOpen) {
        // First time opening: load chart + AI plain-language TX
        const id = card.dataset.id;
        const hyp = allHypotheses.find(function(h) { return h.id === id; });
        if (hyp) {
          const defaultDays = (hyp.horizon || '').toUpperCase().startsWith('ST') ? 14 : 30;
          const ticker = selectedTickers[id] || null;
          renderChart(id, defaultDays, hyp, ticker);
          // Eagerly show ticker label
          const tickerParam = ticker ? '&ticker=' + encodeURIComponent(ticker) : '';
          fetch('/api/chart-data/' + id + '?days=1' + tickerParam).then(function(r) { return r.json(); }).then(function(d) {
            const el = document.getElementById('ticker-label-' + id);
            if (el && d.ticker) el.textContent = d.ticker;
          }).catch(function() {});

          // Load AI plain-language TX (replaces static version if API key is set)
          loadTxAI(id);
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
  var btn = document.getElementById('refreshBtn');
  var container = document.getElementById('cardsContainer');
  btn.classList.add('spinning');
  try {
    var hypsRes = await fetch('/api/hypotheses');
    if (!hypsRes.ok) throw new Error('HTTP ' + hypsRes.status);
    allHypotheses = await hypsRes.json();
    await Promise.all([loadRatings(), loadHoldings()]);
    updateStats(allHypotheses);
    applyPortfolioModeUI();
    renderCards();
    allHypotheses.forEach(function(h) { updateRatingUI(h.id, todayStr); });
  } catch (e) {
    container.innerHTML =
      '<div class="empty"><div class="empty-icon">⚠️</div><div>Could not load data — ' + ((e && e.message) ? e.message : 'check connection') + '</div></div>';
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

// ─── History page ─────────────────────────────────────────────────────────────

const HISTORY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>Marketpulse — History</title>
<style>
  :root {
    --bg:#f4f5f9; --surface:#ffffff; --surface2:#edf0f8; --border:#dce0ef;
    --text:#1a1d2e; --muted:#6b7090;
    --green:#16a34a; --yellow:#b45309; --orange:#c2410c; --red:#dc2626;
    --blue:#2563eb; --purple:#7c3aed; --radius:12px;
    --safe-top:env(safe-area-inset-top,0px); --safe-bottom:env(safe-area-inset-bottom,0px);
  }
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
  html,body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif;min-height:100vh}

  .header{position:sticky;top:0;z-index:100;background:rgba(244,245,249,.96);backdrop-filter:blur(16px);
    padding:calc(var(--safe-top)+12px) 16px 12px;border-bottom:1px solid var(--border);box-shadow:0 1px 8px rgba(0,0,0,.06)}
  .header-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
  .back-btn{text-decoration:none;color:var(--blue);font-size:14px;font-weight:600;padding:4px 0}
  .logo{font-size:17px;font-weight:700;letter-spacing:-.5px}.logo span{color:var(--blue)}

  /* Date navigator */
  .date-nav{display:flex;align-items:center;gap:8px}
  .nav-btn{background:var(--surface2);border:1px solid var(--border);border-radius:8px;
    width:36px;height:36px;font-size:18px;cursor:pointer;color:var(--muted);
    display:flex;align-items:center;justify-content:center;transition:all .15s}
  .nav-btn:hover{border-color:var(--blue);color:var(--blue)}
  .date-picker{background:var(--surface);border:1px solid var(--border);border-radius:8px;
    padding:6px 12px;font-size:14px;color:var(--text);font-family:inherit;cursor:pointer;flex:1}
  .date-caption{font-size:11px;color:var(--muted);text-align:center;margin-top:6px}

  /* Cards */
  .cards{padding:12px 12px 100px;display:flex;flex-direction:column;gap:10px}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
  .card-header{padding:12px 14px 8px}
  .card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
  .card-id{font-size:11px;font-weight:700;color:var(--blue);letter-spacing:.5px;font-family:'SF Mono',monospace}
  .confidence-badge{font-size:14px;font-weight:800;padding:2px 8px;border-radius:8px;flex-shrink:0}
  .conf-green{background:rgba(22,163,74,.12);color:var(--green)}
  .conf-yellow{background:rgba(180,83,9,.12);color:var(--yellow)}
  .conf-orange{background:rgba(194,65,12,.12);color:var(--orange)}
  .conf-red{background:rgba(220,38,38,.10);color:var(--red)}
  .card-title{font-size:14px;font-weight:600;margin-top:5px;line-height:1.3}

  .tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px}
  .tag{font-size:11px;padding:3px 8px;border-radius:6px;font-weight:600}
  .tag-st{background:rgba(37,99,235,.12);color:var(--blue)}
  .tag-mt{background:rgba(124,58,237,.12);color:var(--purple)}
  .tag-lt{background:rgba(180,83,9,.12);color:var(--yellow)}
  .tag-active{background:rgba(22,163,74,.10);color:var(--green)}
  .tag-developing{background:rgba(194,65,12,.10);color:var(--orange)}
  .tag-india{background:rgba(255,153,0,.12);color:#b45309}
  .tag-us{background:rgba(37,99,235,.12);color:var(--blue)}

  .instrument-row{padding:8px 14px;background:var(--surface2);border-top:1px solid var(--border);
    display:flex;align-items:center;gap:10px}
  .direction-icon{font-size:16px;flex-shrink:0}
  .instrument-name{font-size:12px;font-weight:700;font-family:'SF Mono',monospace;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .magnitude{font-size:11px;color:var(--muted);margin-top:1px}

  /* Rating row */
  .rating-row{display:flex;align-items:center;gap:6px;padding:6px 14px}
  .rating-btn{background:var(--surface2);border:1px solid var(--border);border-radius:8px;
    padding:4px 10px;font-size:14px;cursor:pointer;transition:all .15s;color:var(--muted)}
  .rating-btn.active-up{background:rgba(22,163,74,.12);border-color:var(--green)}
  .rating-btn.active-down{background:rgba(220,38,38,.10);border-color:var(--red)}
  .rating-label{font-size:11px;color:var(--muted)}

  /* Corroboration */
  .corroboration{margin:0 14px 10px;padding:8px 12px;border-radius:8px;font-size:12px;line-height:1.5;
    border:1px solid var(--border);background:var(--surface2)}
  .corr-loading{color:var(--muted);font-style:italic}
  .corr-match{border-color:rgba(22,163,74,.35);background:rgba(22,163,74,.07);color:#15803d}
  .corr-miss{border-color:rgba(220,38,38,.3);background:rgba(220,38,38,.06);color:#b91c1c}
  .corr-nodata{color:var(--muted)}

  /* Feedback */
  .feedback-section{padding:10px 14px 12px;border-top:1px solid var(--border)}
  .section-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);font-weight:700;margin-bottom:5px}
  .feedback-input{width:100%;min-height:52px;background:var(--surface2);border:1px solid var(--border);
    border-radius:8px;padding:7px 10px;font-size:12px;color:var(--text);resize:vertical;font-family:inherit}
  .feedback-input::placeholder{color:var(--muted)}
  .feedback-footer{display:flex;align-items:center;justify-content:space-between;margin-top:5px}
  .feedback-submit{background:var(--blue);color:#fff;border:none;border-radius:8px;
    padding:5px 14px;font-size:12px;font-weight:600;cursor:pointer}
  .feedback-status{font-size:11px}
  .feedback-status.bug{color:var(--red)}.feedback-status.feature{color:var(--blue)}.feedback-status.general{color:var(--green)}

  .empty{text-align:center;padding:60px 24px;color:var(--muted)}
  .empty-icon{font-size:40px;margin-bottom:12px}
  .loading{text-align:center;padding:60px 24px;color:var(--muted);font-size:14px}
</style>
</head>
<body>

<div class="header">
  <div class="header-row">
    <a href="/" class="back-btn">← Back to Marketpulse</a>
    <div class="logo">Market<span>pulse</span></div>
  </div>
  <div class="date-nav">
    <button class="nav-btn" id="prevDay" title="Previous day">‹</button>
    <input type="date" class="date-picker" id="datePicker">
    <button class="nav-btn" id="nextDay" title="Next day">›</button>
  </div>
  <div class="date-caption" id="dateCaption">Rate predictions based on your memory of what happened. Market data appears after you vote.</div>
</div>

<div class="cards" id="cardsContainer"><div class="loading">Loading…</div></div>

<script>
let allHyps = [];
let allRatings = {};
const todayStr = new Date().toISOString().slice(0,10);
let selectedDate = (() => {
  const p = new URLSearchParams(location.search).get('date');
  return p || todayStr;
})();

const dp = document.getElementById('datePicker');
dp.value = selectedDate;
dp.max   = todayStr;

function confClass(c) {
  if (c==null) return 'conf-red';
  if (c>=75) return 'conf-green';
  if (c>=60) return 'conf-yellow';
  if (c>=40) return 'conf-orange';
  return 'conf-red';
}
function horizonClass(h) {
  if (!h) return '';
  const t=h.toUpperCase();
  if (t.startsWith('ST')) return 'tag-st';
  if (t.startsWith('MT')) return 'tag-mt';
  if (t.startsWith('LT')) return 'tag-lt';
  return '';
}
function isBull(d) { return (d||'').toLowerCase().includes('bull'); }
function dirIcon(d) {
  if (!d) return '◈';
  const t=d.toLowerCase();
  if (t.includes('bull')) return '📈';
  if (t.includes('bear')) return '📉';
  return '↔️';
}

function getRating(id) { return allRatings[id]?.[selectedDate]?.rating || null; }

function applyRatings() {
  allHyps.forEach(h => {
    const r = getRating(h.id);
    ['up','down'].forEach(v => {
      document.querySelectorAll(\`.rating-btn-\${v}[data-id="\${h.id}"]\`).forEach(btn => {
        btn.classList.toggle('active-'+v, r===v);
      });
    });
  });
}

async function rateHist(e, id, val) {
  e.stopPropagation();
  const resp = await fetch('/api/ratings', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({id, date:selectedDate, rating:val}),
  });
  const data = await resp.json();
  if (data.toggled==='off') {
    if (allRatings[id]) delete allRatings[id][selectedDate];
  } else {
    if (!allRatings[id]) allRatings[id]={};
    allRatings[id][selectedDate]={rating:val};
  }
  applyRatings();
  // Reveal corroboration after rating
  loadCorroboration(id);
}

async function loadCorroboration(id) {
  const el = document.getElementById('corr-'+id);
  if (!el) return;
  el.innerHTML = '<span class="corr-loading">Checking market data…</span>';
  try {
    const d = await fetch('/api/corroborate/'+id+'?date='+selectedDate).then(r=>r.json());
    if (!d.hasData) {
      el.innerHTML = '<span class="corr-nodata">📊 No market data available for this date</span>';
      el.className = 'corroboration corr-nodata';
    } else {
      el.className = 'corroboration ' + (d.matches ? 'corr-match' : 'corr-miss');
      el.innerHTML = '<strong>' + d.verdict + '</strong><br>'
        + '<small style="opacity:.75">' + d.ticker + ': ' + d.prevDate + ' close ' + d.prevClose + ' → ' + d.date + ' close ' + d.close + '</small>';
    }
  } catch(err) {
    el.innerHTML = '<span class="corr-nodata">Could not fetch market data</span>';
  }
}

async function submitFeedback(id) {
  const ta  = document.getElementById('fb-'+id);
  const sta = document.getElementById('fb-status-'+id);
  if (!ta || !ta.value.trim()) return;
  const resp = await fetch('/api/feedback', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({hypId:id, date:selectedDate, text:ta.value}),
  });
  const data = await resp.json();
  if (data.ok) {
    sta.textContent = data.message;
    sta.className = 'feedback-status '+data.type;
    ta.value='';
    setTimeout(()=>{ sta.textContent=''; }, 4000);
  }
}

function renderHistCard(h) {
  const cClass = confClass(h.confidence);
  const hClass = horizonClass(h.horizon);
  const mktClass = h.market==='India' ? 'tag-india' : 'tag-us';
  const mktIcon  = h.market==='India' ? '🇮🇳' : '🇺🇸';
  const sClass   = (h.status||'').toLowerCase()==='active' ? 'tag-active' : 'tag-developing';
  const tags = [
    h.market   ? \`<span class="tag \${mktClass}">\${mktIcon} \${h.market}</span>\` : '',
    h.horizon  ? \`<span class="tag \${hClass}">\${h.horizon?.split(' ')[0]}</span>\` : '',
    h.status   ? \`<span class="tag \${sClass}">\${h.status}</span>\` : '',
  ].filter(Boolean).join('');

  return \`
    <div class="card" data-id="\${h.id}">
      <div class="card-header">
        <div class="card-top">
          <div class="card-id">\${h.id}</div>
          <div class="confidence-badge \${cClass}">\${h.confidence != null ? h.confidence+'%' : '?'}</div>
        </div>
        <div class="card-title">\${h.title}</div>
        <div class="tags">\${tags}</div>
      </div>
      <div class="rating-row">
        <button class="rating-btn rating-btn-up"   data-id="\${h.id}" onclick="rateHist(event,'\${h.id}','up')"   title="Prediction was correct">👍</button>
        <button class="rating-btn rating-btn-down" data-id="\${h.id}" onclick="rateHist(event,'\${h.id}','down')" title="Prediction was wrong">👎</button>
        <span class="rating-label">Rate from memory — market data reveals after you vote</span>
      </div>
      <div class="corroboration corr-nodata" id="corr-\${h.id}">
        <span class="corr-nodata">Vote above to reveal what the market actually did on this date</span>
      </div>
      <div class="instrument-row">
        <div class="direction-icon">\${dirIcon(h.direction)}</div>
        <div>
          <div class="instrument-name">\${h.instrument||'—'}</div>
          <div class="magnitude">\${h.direction||''}\${h.magnitude ? ' · '+h.magnitude : ''}\${h.timeframe ? ' · '+h.timeframe : ''}</div>
        </div>
      </div>
      <div class="feedback-section">
        <div class="section-label">Add a note</div>
        <textarea class="feedback-input" id="fb-\${h.id}" placeholder="Prediction accuracy, missed factors, feature idea, or bug…"></textarea>
        <div class="feedback-footer">
          <span class="feedback-status" id="fb-status-\${h.id}"></span>
          <button class="feedback-submit" onclick="submitFeedback('\${h.id}')">Submit</button>
        </div>
      </div>
    </div>\`;
}

function renderCards() {
  const el = document.getElementById('cardsContainer');
  if (!allHyps.length) { el.innerHTML='<div class="empty"><div class="empty-icon">🔭</div><div>No hypotheses found.</div></div>'; return; }
  el.innerHTML = allHyps.map(renderHistCard).join('');
  applyRatings();
  // Show corroboration immediately if already rated
  allHyps.forEach(h => { if (getRating(h.id)) loadCorroboration(h.id); });
}

async function loadPage() {
  document.getElementById('cardsContainer').innerHTML = '<div class="loading">Loading…</div>';
  // Update date caption
  const d = new Date(selectedDate + 'T12:00:00');
  const isToday = selectedDate === todayStr;
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  document.getElementById('dateCaption').textContent =
    (isToday ? 'Today — ' : '') + d.toLocaleDateString('en-IN', opts)
    + (isToday ? " · Rate today's predictions based on market direction" : " · Rate predictions from your memory of this date");

  const [hypsRes, ratingsRes] = await Promise.all([
    fetch('/api/hypotheses'),
    fetch('/api/ratings'),
  ]);
  allHyps    = await hypsRes.json();
  allRatings = await ratingsRes.json();
  // Only show Active + Developing hypotheses in history
  allHyps = allHyps.filter(h => ['Active','Developing'].includes(h.status));
  renderCards();
}

// Date navigation
dp.addEventListener('change', () => {
  selectedDate = dp.value;
  history.replaceState(null,'','/history?date='+selectedDate);
  loadPage();
});
document.getElementById('prevDay').addEventListener('click', () => {
  const d = new Date(selectedDate + 'T12:00:00');
  d.setDate(d.getDate()-1);
  selectedDate = d.toISOString().slice(0,10);
  dp.value = selectedDate;
  history.replaceState(null,'','/history?date='+selectedDate);
  loadPage();
});
document.getElementById('nextDay').addEventListener('click', () => {
  const d = new Date(selectedDate + 'T12:00:00');
  d.setDate(d.getDate()+1);
  if (d.toISOString().slice(0,10) <= todayStr) {
    selectedDate = d.toISOString().slice(0,10);
    dp.value = selectedDate;
    history.replaceState(null,'','/history?date='+selectedDate);
    loadPage();
  }
});

loadPage();
<\/script>
</body>
</html>`;
