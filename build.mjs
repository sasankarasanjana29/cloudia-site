/**
 * Builds the site into dist/ (or the folder given as the first argument).
 *
 *   node build.mjs            -> dist/
 *   node build.mjs /tmp/out   -> /tmp/out
 *
 * No dependencies. Each page in src/pages starts with a meta comment:
 *   <!--meta {"title": "...", "description": "..."} -->
 * and is wrapped in src/partials/layout.html. Partials are pulled in with
 * <!-- include:name -->. CSS files are joined in the order of STYLES, and
 * every asset URL gets a content hash so a deploy never serves stale files.
 */
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const OUT = resolve(process.argv[2] ?? join(ROOT, 'dist'));

/** the stylesheet, in cascade order */
const STYLES = ['tokens', 'base', 'app-ui', 'layout', 'home', 'legal'];

const read = (p) => readFileSync(p, 'utf8');
const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 10);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function includes(html, depth = 0) {
  if (depth > 5) throw new Error('include nesting too deep');
  return html.replace(/<!--\s*include:([\w-]+)\s*-->/g, (_, name) => includes(read(join(SRC, 'partials', `${name}.html`)), depth + 1));
}

/** the open-source credits table, from the app's generated list */
function credits() {
  const list = JSON.parse(read(join(SRC, 'content', 'credits.json')));
  const byLicence = {};
  for (const p of list) byLicence[p.license] = (byLicence[p.license] ?? 0) + 1;
  const summary = Object.entries(byLicence).sort((a, b) => b[1] - a[1])
    .map(([l, n]) => `<li><span>${esc(l)}</span><span>${n}</span></li>`).join('');
  const rows = list.map((p) => `<li><p class="credit-name">${esc(p.name)} <span>${esc(p.version)}</span></p>`
    + `<p class="credit-meta">${esc(p.license)}${p.copyright ? ` · ${esc(p.copyright)}` : ''}</p></li>`).join('');
  return { count: list.length, summary, rows };
}

function build() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  // assets as they are
  cpSync(join(SRC, 'assets'), join(OUT, 'assets'), { recursive: true });

  // one stylesheet
  const css = STYLES.map((n) => `/* ${n}.css */\n${read(join(SRC, 'styles', `${n}.css`))}`).join('\n');
  writeFileSync(join(OUT, 'site.css'), css);
  const v = { css: hash(css), js: hash(readdirSync(join(SRC, 'scripts')).map((f) => read(join(SRC, 'scripts', f))).join('')) };

  // scripts, with every module import stamped too, so a deploy never mixes
  // a fresh main.js with a cached older module
  mkdirSync(join(OUT, 'scripts'), { recursive: true });
  for (const f of readdirSync(join(SRC, 'scripts'))) {
    const js = read(join(SRC, 'scripts', f)).replace(/from '(\.\/[\w-]+\.js)'/g, `from '$1?v=${v.js}'`);
    writeFileSync(join(OUT, 'scripts', f), js);
  }

  const layout = includes(read(join(SRC, 'partials', 'layout.html')));
  const cr = credits();
  const pages = readdirSync(join(SRC, 'pages')).filter((f) => f.endsWith('.html'));
  for (const file of pages) {
    const raw = read(join(SRC, 'pages', file));
    const m = raw.match(/^<!--meta\s+(\{[\s\S]*?\})\s*-->/);
    if (!m) throw new Error(`${file}: missing <!--meta {...} --> header`);
    const meta = JSON.parse(m[1]);
    let body = includes(raw.slice(m[0].length));
    body = body.replace('<!-- credits:summary -->', cr.summary).replace('<!-- credits:rows -->', cr.rows)
      .replaceAll('{{creditCount}}', String(cr.count));
    const html = layout
      .replace('{{content}}', body)
      .replaceAll('{{title}}', esc(meta.title))
      .replaceAll('{{description}}', esc(meta.description))
      .replaceAll('{{page}}', file.replace('.html', ''))
      .replaceAll('{{cssv}}', v.css)
      .replaceAll('{{jsv}}', v.js);
    if (html.includes('{{')) throw new Error(`${file}: unfilled placeholder`);
    writeFileSync(join(OUT, file), html);
  }

  writeFileSync(join(OUT, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  // GitHub Pages: serve files as they are
  writeFileSync(join(OUT, '.nojekyll'), '');
  if (existsSync(join(SRC, 'CNAME'))) cpSync(join(SRC, 'CNAME'), join(OUT, 'CNAME'));
  console.log(`built ${pages.length} pages into ${OUT}`);
}

build();
