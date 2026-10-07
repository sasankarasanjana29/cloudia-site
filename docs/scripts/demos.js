/**
 * The small live fragments in the features bento: the category marquee,
 * the search that types by itself, and the swipe card. Each one only moves
 * while it is on screen, and holds still under reduced motion.
 */
import { reducedMotion, whenVisible } from './motion.js?v=2e6058781b';

function initMarquee() {
  const m = document.querySelector('.marquee');
  if (!m) return;
  // twice the tiles, so sliding by half the row loops without a seam
  m.querySelectorAll('.marquee-row').forEach((row) => row.append(...[...row.children].map((c) => c.cloneNode(true))));
  whenVisible(m, (on) => m.classList.toggle('is-paused', !on));
}

function initSwipe() {
  const d = document.querySelector('.swipes');
  if (d) whenVisible(d, (on) => d.classList.toggle('is-paused', !on));
}

function initSearch() {
  const root = document.querySelector('[data-search]');
  if (!root) return;
  const text = root.querySelector('[data-search-text]');
  const items = [...root.querySelectorAll('[data-search-item]')];
  const QUERIES = ['Anna', 'refund', '18'];
  const filter = (q) => items.forEach((el) => el.classList.toggle('is-hidden', q !== '' && !el.dataset.searchItem.includes(q.toLowerCase())));
  filter(QUERIES[0]);
  if (reducedMotion()) return;

  let qi = 0; let typed = QUERIES[0].length; let deleting = true; let timer = 0; let on = false;
  const step = () => {
    const q = QUERIES[qi];
    if (deleting) {
      typed -= 1;
      if (typed <= 0) { deleting = false; qi = (qi + 1) % QUERIES.length; typed = 0; }
    } else {
      typed += 1;
      if (typed >= QUERIES[qi].length) { deleting = true; text.textContent = QUERIES[qi]; filter(QUERIES[qi]); timer = setTimeout(step, 2200); return; }
    }
    const shown = (deleting ? q : QUERIES[qi]).slice(0, Math.max(0, typed));
    text.textContent = shown;
    filter(shown);
    timer = setTimeout(step, deleting ? 70 : 120);
  };
  whenVisible(root, (vis) => {
    if (vis && !on) { on = true; timer = setTimeout(step, 1600); }
    else if (!vis && on) { on = false; clearTimeout(timer); }
  });
}

export function initDemos() {
  initMarquee();
  initSwipe();
  initSearch();
}
