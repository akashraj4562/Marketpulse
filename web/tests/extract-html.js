/**
 * TB-001 helper — extract and emit the inline HTML from server.js
 * without starting the Express server.
 *
 * Usage: node tests/extract-html.js > /tmp/mp-rendered.html
 *
 * How it works:
 *   We monkey-patch the modules that server.js requires (express, dotenv, fs,
 *   anthropic, yahoo-finance2) to no-ops, then eval the source in a vm
 *   context that captures the `HTML` const after the template literal
 *   has been evaluated by the JS engine (so all \n, \/, etc. are correctly
 *   resolved). We never start an HTTP server.
 */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const SERVER_JS = path.join(__dirname, '..', 'server.js');
let source = fs.readFileSync(SERVER_JS, 'utf8');

// ── Stub out every require() call so nothing actually runs ──────────────────
const fakeExpress = () => {
  const app = { use: () => app, get: () => app, post: () => app, listen: () => app };
  app.Router = () => app;
  return app;
};
fakeExpress.static = () => {};
fakeExpress.json   = () => {};

const stubs = {
  express:          fakeExpress,
  dotenv:           { config: () => {} },
  fs:               { ...fs, writeFileSync: () => {}, readFileSync: (p, ...a) => (p.endsWith('.env') ? '' : fs.readFileSync(p, ...a)) },
  path:             path,
  '@anthropic-ai/sdk': class { constructor() {} },
  'yahoo-finance2': { quote: async () => ({}) },
  crypto:           require('crypto'),
};

// Build a context where require() returns our stubs
const ctx = vm.createContext({
  require: (mod) => {
    if (stubs[mod]) return stubs[mod];
    // Allow built-ins
    try { return require(mod); } catch { return {}; }
  },
  module:  { exports: {} },
  exports: {},
  __dirname:  path.dirname(SERVER_JS),
  __filename: SERVER_JS,
  console,
  process,
  setTimeout, setInterval, clearTimeout, clearInterval,
  Buffer, URL,
});

// Remove the app.listen call so the server never starts
source = source.replace(/app\.listen\s*\([\s\S]*?\}\s*\)\s*;/, '// listen removed');

// In vm contexts, `const` declarations are NOT exposed on the context object.
// Rewrite `const HTML = ` to `__HTML__ = ` so we can capture it.
source = source.replace(/^const HTML\s*=/m, '__HTML__ =');
ctx.__HTML__ = undefined;

// Evaluate; the JS engine processes all template literal escapes for us
try {
  vm.runInContext(source, ctx, { filename: SERVER_JS, timeout: 5000 });
} catch (e) {
  // Ignore runtime errors (missing env vars, etc.) — we only need HTML to be set
}

const html = ctx.__HTML__;
if (!html) {
  process.stderr.write('ERROR: HTML const not found after eval\n');
  process.exit(2);
}

process.stdout.write(html);
