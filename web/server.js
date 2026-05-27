const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3737;

// Resolve hypothesis directory relative to this file (../hypotheses/)
const HYPOTHESES_DIR = path.resolve(__dirname, '..', 'hypotheses');

// ─── Markdown parser ────────────────────────────────────────────────────────

function extractField(content, fieldName) {
  // Matches: | **FieldName** | value |
  const re = new RegExp(`\\|\\s*\\*\\*${fieldName}\\*\\*\\s*\\|\\s*(.+?)\\s*\\|`, 'i');
  const m = content.match(re);
  return m ? m[1].trim().replace(/`/g, '') : null;
}

function extractConfidence(content) {
  // Matches: | **Confidence** | 68% | ...
  const m = content.match(/\|\s*\*\*Confidence\*\*\s*\|\s*([\d]+)%\s*\|/i);
  return m ? parseInt(m[1], 10) : null;
}

function extractSection(content, heading) {
  // Extract content under a heading until the next ## heading
  const re = new RegExp(`##[#]?\\s*(?:★\\s*)?${heading}[\\s\\S]*?\\n([\\s\\S]*?)(?=\\n##|$)`, 'i');
  const m = content.match(re);
  return m ? m[1].trim() : null;
}

function extractCapitalMarketPrediction(content) {
  const fields = {};
  const cmpSection = (() => {
    const m = content.match(/##[#]?\s*(?:★\s*)?Capital Market Prediction[\s\S]*?\n([\s\S]*?)(?=\n##|$)/i);
    return m ? m[1] : '';
  })();

  fields.instrument = extractField(cmpSection, 'Instrument') || extractField(content, 'Instrument');
  fields.direction   = extractField(cmpSection, 'Predicted direction') || extractField(content, 'Predicted direction');
  fields.magnitude   = extractField(cmpSection, 'Predicted magnitude') || extractField(content, 'Predicted magnitude');
  fields.timeframe   = extractField(cmpSection, 'Timeframe') || null;
  fields.pricedIn    = extractField(cmpSection, 'Already priced in\\?') || extractField(content, 'Already priced in\\?');

  // Extract the capital market thesis paragraph (the block after "Capital market thesis")
  const thesisMatch = cmpSection.match(/Capital market thesis[^:]*:\s*\n([^\n#][^\n]*(?:\n(?!\n##)[^\n]+)*)/i);
  fields.thesis = thesisMatch ? thesisMatch[1].replace(/\*\*/g, '').trim().slice(0, 280) + '…' : null;

  return fields;
}

function extractWatchItems(content) {
  const confirms = [];
  const kills = [];
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

    // Sector from Supporting Fundamental Thesis or Sectors affected
    const sectors = extractField(content, 'Sectors affected') || extractField(content, 'Primary sector');

    const cmp = extractCapitalMarketPrediction(content);
    const watch = extractWatchItems(content);
    const oneliner = extractStatement(content);

    // Title: first # heading
    const titleMatch = content.match(/^#\s+Hypothesis:\s*(.+)/m);
    const title = titleMatch ? titleMatch[1].trim() : slug;

    return {
      id,
      slug,
      title,
      status: status || extractField(content, 'Status') || 'Unknown',
      confidence,
      horizon: horizon ? horizon.replace(/\s*\(.*?\)/, '').trim() : null,
      horizonFull: horizon,
      lastValidated: lastVal,
      priorityTier: ptier ? ptier.replace(/\(.*?\)/g, '').trim() : null,
      sectors,
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
  // Sort: Active first, then Developing, then by confidence desc
  const statusOrder = { Active: 0, Developing: 1, Predicted: 2, Retired: 3 };
  all.sort((a, b) => {
    const so = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
    if (so !== 0) return so;
    return (b.confidence ?? 0) - (a.confidence ?? 0);
  });
  return all;
}

// ─── API endpoint ────────────────────────────────────────────────────────────

app.get('/api/hypotheses', (req, res) => {
  res.json(loadAllHypotheses());
});

// ─── Single-page app ─────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.send(HTML);
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  const localIPs = Object.values(interfaces)
    .flat()
    .filter(i => i.family === 'IPv4' && !i.internal)
    .map(i => i.address);

  console.log('\n🚀 Marketpulse web view running\n');
  console.log(`  Local:   http://localhost:${PORT}`);
  localIPs.forEach(ip => console.log(`  Network: http://${ip}:${PORT}  ← open this on your iPhone`));
  console.log('\n  For a public URL: npx ngrok http ' + PORT);
  console.log('');
});

// ─── HTML (inline) ───────────────────────────────────────────────────────────

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<title>Marketpulse</title>
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

  /* Filters */
  .filters { padding: 12px 16px; display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
  .filter-btn {
    background: var(--surface); border: 1px solid var(--border); border-radius: 20px;
    padding: 6px 14px; font-size: 13px; color: var(--muted); cursor: pointer;
    white-space: nowrap; flex-shrink: 0; transition: all 0.15s;
  }
  .filter-btn.active { background: var(--blue); border-color: var(--blue); color: #fff; font-weight: 600; }

  /* Cards list */
  .cards { padding: 0 12px 100px; display: flex; flex-direction: column; gap: 10px; }

  /* Card */
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

  /* Tags row */
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
  .causal-scores { display: flex; gap: 12px; margin-top: 6px; }
  .score-item { display: flex; flex-direction: column; align-items: center; }
  .score-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
  .score-value { font-size: 16px; font-weight: 700; color: var(--text); }
  .priced-in { margin-top: 10px; font-size: 12px; }
  .priced-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-weight: 600; font-size: 11px; }
  .priced-no  { background: rgba(34,197,94,0.15); color: var(--green); }
  .priced-yes { background: rgba(239,68,68,0.12); color: var(--red); }
  .priced-partial { background: rgba(234,179,8,0.12); color: var(--yellow); }

  /* Empty state */
  .empty { text-align: center; padding: 60px 24px; color: var(--muted); }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }

  /* Loading */
  .loading { text-align: center; padding: 60px 24px; color: var(--muted); font-size: 14px; }

  /* Refresh */
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
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
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

function confClass(c) {
  if (c === null || c === undefined) return 'conf-red';
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
  if (t.includes('inr') && t.includes('bear')) return '💸';
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

function renderCard(h) {
  const cClass = confClass(h.confidence);
  const hClass = horizonClass(h.horizon);
  const sClass = statusClass(h.status);
  const tClass = tierClass(h.priorityTier);

  const tags = [
    h.horizon ? \`<span class="tag \${hClass}">\${h.horizon?.split(' ')[0] || ''}</span>\` : '',
    h.status  ? \`<span class="tag \${sClass}">\${h.status}</span>\` : '',
    h.priorityTier ? \`<span class="tag \${tClass}">\${h.priorityTier.split(' ')[0]}</span>\` : '',
  ].filter(Boolean).join('');

  const instrumentHtml = (h.instrument || h.direction) ? \`
    <div class="instrument-row">
      <div class="direction-icon">\${directionIcon(h.direction)}</div>
      <div class="instrument-info">
        <div class="instrument-name">\${h.instrument || '—'}</div>
        <div class="magnitude">\${h.magnitude || h.direction || ''}</div>
      </div>
    </div>
  \` : '';

  const confirms = (h.confirms || []).map(c =>
    \`<div class="watch-item"><div class="watch-icon">✅</div><div class="watch-text">\${c}</div></div>\`
  ).join('');
  const kills = (h.kills || []).map(k =>
    \`<div class="watch-item"><div class="watch-icon">❌</div><div class="watch-text">\${k}</div></div>\`
  ).join('');

  const pricedHtml = h.pricedIn ? \`
    <div class="priced-in">
      <span class="priced-badge \${pricedClass(h.pricedIn)}">\${pricedLabel(h.pricedIn)}</span>
    </div>
  \` : '';

  const thesisHtml = h.thesis ? \`
    <div class="section-label">Capital Market Thesis</div>
    <div class="thesis-text">\${h.thesis}</div>
  \` : (h.oneliner ? \`
    <div class="section-label">Signal</div>
    <div class="thesis-text">\${h.oneliner}</div>
  \` : '');

  const watchHtml = (confirms || kills) ? \`
    <div class="watch-items">
      <div class="section-label">Watch Items</div>
      \${confirms}\${kills}
    </div>
  \` : '';

  const timeframeHtml = h.timeframe ? \`
    <div class="causal-note">⏱ \${h.timeframe}</div>
  \` : '';

  return \`
    <div class="card" data-id="\${h.id}" data-status="\${h.status || ''}" data-horizon="\${h.horizon || ''}" data-direction="\${h.direction || ''}">
      <div class="card-header">
        <div class="card-top">
          <div>
            <div class="card-id">\${h.id}</div>
          </div>
          <div class="confidence-badge \${cClass}">\${h.confidence !== null && h.confidence !== undefined ? h.confidence + '%' : '?'}</div>
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
        <div class="causal-note">Last validated: \${h.lastValidated || '—'}</div>
      </div>
    </div>
  \`;
}

function applyFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === filter);
  });
  renderCards();
}

function filterHypotheses(hyps, filter) {
  if (filter === 'all') return hyps;
  return hyps.filter(h => {
    if (filter === 'Active' || filter === 'Developing' || filter === 'Predicted') {
      return (h.status || '').toLowerCase() === filter.toLowerCase();
    }
    if (filter === 'ST' || filter === 'MT' || filter === 'LT') {
      return (h.horizon || '').toUpperCase().startsWith(filter);
    }
    if (filter === 'Bullish') return (h.direction || '').toLowerCase().includes('bull');
    if (filter === 'Bearish') return (h.direction || '').toLowerCase().includes('bear');
    return true;
  });
}

function renderCards() {
  const container = document.getElementById('cardsContainer');
  const filtered = filterHypotheses(allHypotheses, activeFilter);
  if (filtered.length === 0) {
    container.innerHTML = '<div class="empty"><div class="empty-icon">🔭</div><div>No hypotheses match this filter.</div></div>';
    return;
  }
  container.innerHTML = filtered.map(renderCard).join('');

  // Attach expand/collapse handlers
  container.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('open'));
  });
}

function updateStats(hyps) {
  const active = hyps.filter(h => (h.status || '').toLowerCase() === 'active').length;
  const dev    = hyps.filter(h => (h.status || '').toLowerCase() === 'developing').length;
  document.getElementById('statActive').textContent = active;
  document.getElementById('statDev').textContent = dev;
  document.getElementById('statTotal').textContent = hyps.length;
  document.getElementById('lastUpdated').textContent = 'Updated ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

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

// Filter buttons
document.getElementById('filterBar').addEventListener('click', e => {
  if (e.target.classList.contains('filter-btn')) {
    applyFilter(e.target.dataset.filter);
  }
});

// Refresh button
document.getElementById('refreshBtn').addEventListener('click', loadData);

// Initial load
loadData();
</script>
</body>
</html>`;
