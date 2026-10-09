/**
 * Makes self-contained copies of the site: each page is one HTML file with
 * its styles, script and every image inside it, so it opens on a phone from
 * the Files app (or AirDrop, or email) with no server and no hosting.
 *
 *   node standalone.mjs [outDir]     (default: standalone/)
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(process.argv[2] ?? join(ROOT, 'standalone'));
const BUILD = join(tmpdir(), `cloudia-standalone-${process.pid}`);
execFileSync(process.execPath, [join(ROOT, 'build.mjs'), BUILD], { stdio: 'ignore' });

const MIME = { webp: 'image/webp', png: 'image/png', svg: 'image/svg+xml' };
const cache = new Map();
const dataUri = (path) => {
  if (!cache.has(path)) {
    const ext = path.split('.').pop();
    cache.set(path, `data:${MIME[ext]};base64,${readFileSync(join(BUILD, path)).toString('base64')}`);
  }
  return cache.get(path);
};

// one classic script from the modules, dependencies first
const ORDER = ['motion', 'nav', 'reveal', 'today', 'seal', 'howto', 'story', 'orbit', 'demos', 'gather', 'main'];
let js = ORDER.map((m) => readFileSync(join(ROOT, 'src', 'scripts', `${m}.js`), 'utf8')
  .replace(/^import .*$/gm, '')
  .replace(/^export /gm, '')).join('\n');
// images the script creates: point them at the inlined copies
const art = Object.fromEntries(readdirSync(join(BUILD, 'assets', 'art'))
  .filter((f) => f.startsWith('orbit-') || f.startsWith('mascot-') || ['answer-bill-due.webp', 'answer-refunds-and-returns.webp'].includes(f))
  .map((f) => [f.replace('.webp', ''), dataUri(`assets/art/${f}`)]));
js = js
  .replace("'assets/art/orbit-bead.webp'", "ART['orbit-bead']")
  .replace('`assets/art/orbit-${i.key}.webp`', "ART['orbit-' + i.key]")
  .replace('`assets/art/mascot-${MASCOT[phase]}.webp`', "ART['mascot-' + MASCOT[phase]]")
  // the day views (howto.js) build their card images from a name
  .replace('assets/art/answer-${l.art}.webp', "${ART['answer-' + l.art]}");
js = `(function () {\nconst ART = ${JSON.stringify(art)};\n${js}\n})();`;

// the phone frame and any other image the styles point at, inlined too
const css = readFileSync(join(BUILD, 'site.css'), 'utf8')
  .replace(/url\("(assets\/[^"]+\.(?:svg|webp|png))"\)/g, (_, p) => `url("${dataUri(p)}")`);
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const page of readdirSync(BUILD).filter((f) => f.endsWith('.html') && !f.startsWith('_'))) {
  let html = readFileSync(join(BUILD, page), 'utf8');
  html = html
    .replace(/<link rel="stylesheet" href="site\.css[^"]*">/, () => `<style>${css}</style>`)
    .replace(/<script type="module" src="scripts\/main\.js[^"]*"><\/script>/, '')
    .replace('</body>', () => `<script>${js}</script>\n</body>`)
    .replace(/(src|href|content)="(assets\/[^"$]+\.(?:webp|png))"/g, (_, attr, p) => `${attr}="${dataUri(p)}"`);
  writeFileSync(join(OUT, page), html);
}
rmSync(BUILD, { recursive: true, force: true });
console.log(`standalone pages in ${OUT}`);
