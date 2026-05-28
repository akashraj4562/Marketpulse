#!/usr/bin/env python3
"""
TB-001 — Inline JS syntax checker for server.js
================================================
Extracts every <script>...</script> block from the rendered HTML page
and runs `node --check` on each one.

WHY THIS EXISTS
---------------
server.js serves an inline HTML page built from a template literal.
`node --check server.js` validates the Node.js server code — but the
browser-side JavaScript INSIDE the HTML template is opaque to it.

This test was created after BL-015 introduced a bug: `buffer.split('\\n')`
inside a template literal rendered as a literal newline in the browser,
causing a JavaScript SyntaxError that prevented the entire page from loading
("Loading hypotheses..." indefinitely).

`node --check server.js` passed.  This test catches what it misses.

ROOT CAUSE OF THAT BUG:
  Inside a JS template literal, `\\n` is the newline escape.
  Writing buffer.split('\\n') in the source → browser receives:
    buffer.split('
    ')   ← unterminated string = SyntaxError
  Fix: write buffer.split('\\\\n') so the template outputs buffer.split('\\n').

HOW IT WORKS
------------
1. Runs tests/extract-html.js (Node.js) to get the fully rendered HTML.
   This is the same HTML the browser receives — all template-literal
   escapes processed by the JS engine itself.
2. Extracts every <script>...</script> block.
3. Writes each block to a temp file and runs `node --check` on it.
4. Reports PASS / FAIL with the error message and approximate line context.

USAGE
-----
  python3 tests/check-inline-js.py          # from web/ directory
  npm test                                    # wired into package.json

EXIT CODES
----------
  0 — all inline JS blocks pass syntax check
  1 — one or more blocks fail
  2 — setup error (node not found, extractor failed, no blocks found)
"""

import os
import re
import sys
import subprocess
import tempfile

WEB_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTRACTOR = os.path.join(WEB_DIR, 'tests', 'extract-html.js')


def find_node():
    """Find the node binary, trying PATH then common install locations."""
    candidates = ['node']
    nvm_dir = os.path.expanduser('~/.nvm/versions/node')
    if os.path.isdir(nvm_dir):
        for version in sorted(os.listdir(nvm_dir), reverse=True):
            candidates.append(os.path.join(nvm_dir, version, 'bin', 'node'))
    candidates += [
        '/opt/homebrew/bin/node',
        '/usr/local/bin/node',
        os.path.expanduser('~/node-v24.16.0-darwin-arm64/bin/node'),
        os.path.expanduser('~/node-v22*/bin/node'),
        os.path.expanduser('~/node-v20*/bin/node'),
    ]
    for c in candidates:
        if '*' in c:
            import glob
            expanded = glob.glob(c)
            if expanded:
                candidates.extend(expanded)
            continue
        try:
            result = subprocess.run([c, '--version'], capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                return c
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue
    return None


def render_html(node_bin: str) -> str:
    """Run extract-html.js and return the rendered HTML string."""
    result = subprocess.run(
        [node_bin, EXTRACTOR],
        capture_output=True, text=True, timeout=15,
        cwd=WEB_DIR,
    )
    if result.returncode != 0:
        raise RuntimeError(f'extract-html.js failed:\n{result.stderr}')
    return result.stdout


def extract_script_blocks(html: str):
    """Return list of (block_index, script_content) for all non-empty inline <script> blocks."""
    # Match <script> or <script type="text/javascript"> (no src attr) with content
    pattern = re.compile(
        r'<script(?:\s+(?!src)[a-zA-Z][^>]*)?>(?P<content>.*?)</script>',
        re.DOTALL | re.IGNORECASE
    )
    blocks = []
    for i, m in enumerate(pattern.finditer(html)):
        content = m.group('content').strip()
        if content:
            blocks.append((i + 1, content))
    return blocks


def check_js_syntax(node_bin: str, js_content: str, block_index: int):
    """Write js_content to a temp file and run node --check. Returns (ok, error_msg)."""
    with tempfile.NamedTemporaryFile(
        mode='w', suffix='.js', prefix=f'mp-inline-{block_index}-',
        delete=False, dir='/tmp'
    ) as f:
        f.write(js_content)
        tmp_path = f.name
    try:
        result = subprocess.run(
            [node_bin, '--check', tmp_path],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            return True, None
        err = result.stderr.strip()
        err = err.replace(tmp_path, f'<inline script block {block_index}>')
        return False, err
    except subprocess.TimeoutExpired:
        return False, f'node --check timed out for block {block_index}'
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


def main():
    print('TB-001: Inline JS syntax check')
    print('=' * 50)

    node_bin = find_node()
    if not node_bin:
        print('ERROR: node binary not found. Add node to PATH and retry.')
        sys.exit(2)
    print(f'  node:      {node_bin}')
    print(f'  extractor: {EXTRACTOR}')

    if not os.path.exists(EXTRACTOR):
        print(f'ERROR: extract-html.js not found at {EXTRACTOR}')
        sys.exit(2)

    # Step 1: Render the HTML (same as what the browser receives)
    try:
        html = render_html(node_bin)
    except RuntimeError as e:
        print(f'ERROR: {e}')
        sys.exit(2)
    print(f'  rendered HTML: {len(html):,} chars')

    # Step 2: Extract script blocks
    blocks = extract_script_blocks(html)
    if not blocks:
        print('ERROR: No inline <script> blocks found in rendered HTML.')
        print('  If server.js structure changed, update the extractor pattern.')
        sys.exit(2)
    print(f'  script blocks: {len(blocks)}')
    print()

    # Step 3: Check each block
    failures = []
    for idx, content in blocks:
        lines = content.count('\n') + 1
        ok, err = check_js_syntax(node_bin, content, idx)
        status = 'PASS' if ok else 'FAIL'
        print(f'  [{status}] Block {idx}: {lines} lines')
        if not ok:
            print(f'         {err}')
            failures.append((idx, err))

    print()
    if failures:
        print(f'RESULT: FAIL — {len(failures)} of {len(blocks)} block(s) have syntax errors')
        print()
        print('Common cause: escape sequences in template literals.')
        print("  If error is 'Invalid or unexpected token' in a string,")
        print("  check for \\n, \\t, \\r inside the HTML template literal in server.js.")
        print("  Use '\\\\n' (4 chars in source) to output '\\n' (2 chars) to the browser.")
        sys.exit(1)
    else:
        print(f'RESULT: PASS — all {len(blocks)} inline JS block(s) are syntactically valid')
        sys.exit(0)


if __name__ == '__main__':
    main()
