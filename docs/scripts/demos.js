/**
 * The small live fragments in the features bento: the category marquee, the
 * skies, the search that types by itself, the swipe rows and the amount
 * keypad. Each one only moves while it is on screen, and holds still under
 * reduced motion.
 */
import { reducedMotion, whenVisible } from './motion.js?v=511cf98402';

function initMarquee() {
  const m = document.querySelector('.marquee');
  if (!m) return;
  // twice the tiles, so sliding by half the row loops without a seam
  m.querySelectorAll('.marquee-row').forEach((row) => row.append(...[...row.children].map((c) => c.cloneNode(true))));
  whenVisible(m, (on) => m.classList.toggle('is-paused', !on));
}

function initSkies() {
  const s = document.querySelector('.skies');
  if (s) whenVisible(s, (on) => s.classList.toggle('is-paused', !on));
}

/**
 * SwipeableLoopCard, one row at a time: the first opens and closes, then the
 * second, then the third is swiped all the way so Delete takes the row and
 * the card goes. Every number is the app's (78 tiles, 8 apart, 14 from the
 * card; tiles pop in over their last 56 of travel; past open, Delete widens
 * over the others), scaled down with the card on narrow screens.
 */
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const EASE = {
  drag: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  settle: (t) => 1 - (1 - t) ** 3,
  commit: (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
};
/** a row's position at time t from its keyframes [ms, x, ease] */
function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i += 1) {
    const [t1, x1, ease] = keys[i];
    const [t0, x0] = keys[i - 1];
    if (t <= t1) return x0 + (x1 - x0) * (ease ? EASE[ease] : (v) => v)((t - t0) / (t1 - t0));
  }
  return keys[keys.length - 1][1];
}

function initSwipe() {
  const root = document.querySelector('[data-swipes]');
  if (!root) return;
  const rows = [...root.querySelectorAll('.swipe-row')].map((row) => ({
    row, card: row.querySelector('.swipe-card'), tray: row.querySelector('.swipe-tray'), tiles: [...row.querySelectorAll('.act')],
  }));
  let s = 1; let W = 362;
  const measure = () => {
    W = rows[0].row.clientWidth || 362;
    s = Math.min(1, W / 362);
    root.style.setProperty('--tile', `${78 * s}px`);
    root.style.setProperty('--gap', `${8 * s}px`);
  };
  const dims = () => {
    const tile = 78 * s; const gap = 8 * s; const lead = 14 * s;
    return { tile, gap, lead, open: lead + tile * 3 + gap * 2 };
  };

  function render(r, x) {
    const { tile, gap, lead, open } = dims();
    const n = r.tiles.length;
    const travel = Math.max(0, -x);
    const extra = Math.max(0, travel - open);
    const leave = 1 - clamp01(extra / (80 * s * 0.85));
    const cover = (n - 1) * (tile + gap) * (1 - leave);
    r.card.style.transform = `translateX(${x.toFixed(1)}px)`;
    r.tiles.forEach((el, i) => {
      const at = lead + tile * (n - i) + gap * (n - 1 - i);
      const enter = clamp01((travel - (at - 56 * s)) / (56 * s));
      const last = i === n - 1;
      const out = last ? 1 : leave;
      el.style.opacity = (enter * out).toFixed(3);
      el.style.transform = `scale(${((0.6 + 0.4 * enter) * (0.6 + 0.4 * out)).toFixed(3)})`;
      if (last) {
        el.style.width = `${Math.min(W, tile + extra + cover).toFixed(1)}px`;
        el.style.marginLeft = `${(-cover).toFixed(1)}px`;
      }
    });
  }

  let last = 0;
  measure();
  new ResizeObserver(() => { measure(); frame(last); }).observe(root);
  const CYCLE = 10600;
  const plan = () => {
    const { open } = dims();
    const arm = -(open + 96 * s);
    const gone = -(W + 40);
    return [
      [[0, 0], [500, 0], [1250, -open, 'drag'], [2450, -open], [2900, 0, 'settle']],
      [[0, 0], [3100, 0], [3850, -open, 'drag'], [5050, -open], [5500, 0, 'settle']],
      [[0, 0], [5800, 0], [6900, arm, 'drag'], [7900, arm], [8100, gone, 'commit'], [9100, gone]],
    ];
  };

  function frame(t) {
    last = t;
    const keys = plan();
    rows.forEach((r, i) => {
      if (i < 2) { render(r, track(keys[i], t)); return; }
      // the deleted row: Delete fades, then the card comes back for the next lap
      if (t < 9100) { r.tray.style.opacity = '1'; r.card.style.opacity = '1'; render(r, track(keys[i], t)); }
      else if (t < 9400) { render(r, track(keys[i], t)); r.tray.style.opacity = (1 - (t - 9100) / 300).toFixed(3); }
      else {
        render(r, 0);
        const p = clamp01((t - 9400) / 420);
        r.tray.style.opacity = '1';
        r.card.style.opacity = EASE.settle(p).toFixed(3);
        r.card.style.transform = `scale(${(0.97 + 0.03 * EASE.settle(p)).toFixed(4)})`;
      }
    });
  }

  if (reducedMotion()) { frame(1800); return; }
  frame(0);
  let raf = 0; let t0 = 0; let base = 0;
  const loop = (now) => {
    if (!t0) t0 = now;
    frame((base + now - t0) % CYCLE);
    raf = requestAnimationFrame(loop);
  };
  whenVisible(root, (on) => {
    if (on && !raf) { t0 = 0; raf = requestAnimationFrame(loop); }
    else if (!on && raf) { cancelAnimationFrame(raf); raf = 0; base = last; }
  });
}

/**
 * The amount sheet (amount.tsx) typing by itself: each key answers with its
 * soft disc on touch-down and the digit lands on release, dropping in. Add
 * amount puts the price on the card beside it; then the delete key clears it.
 */
function initKeypad() {
  const root = document.querySelector('[data-keypad]');
  if (!root) return;
  const num = root.querySelector('[data-amount]');
  const add = root.querySelector('[data-add]');
  const out = document.querySelector('[data-amount-out]');
  const key = (k) => root.querySelector(`[data-key='${k}']`);
  const AMOUNT = '12.99';
  let text = '';
  const draw = (drop) => {
    if (!text) { num.innerHTML = '<span class="as-zero">0</span>'; add.classList.add('is-off'); return; }
    num.textContent = '';
    const head = document.createElement('span'); head.textContent = text.slice(0, -1);
    const tail = document.createElement('span'); tail.textContent = text.slice(-1);
    num.append(head, tail);
    add.classList.remove('is-off');
    if (drop) tail.animate([{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }], { duration: 140, easing: 'ease-out' });
  };
  if (reducedMotion()) { text = AMOUNT; draw(false); out?.classList.add('is-on'); return; }
  draw(false);

  // the script: [wait before, action]
  const steps = [
    ...[...AMOUNT].map((k, i) => [i ? 380 : 900, () => press(k)]),
    [700, () => tap(add, () => out?.classList.add('is-on'))],
    [2600, () => out?.classList.remove('is-on')],
    ...[...AMOUNT].map((_, i) => [i ? 200 : 500, () => press('del')]),
  ];
  const tap = (el, done) => { el.classList.add('is-down'); later(() => { el.classList.remove('is-down'); done(); }, 120); };
  const press = (k) => tap(key(k), () => { text = k === 'del' ? text.slice(0, -1) : text + k; draw(k !== 'del'); });

  const timers = new Set(); let at = 0; let on = false;
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); };
  const run = () => {
    if (!on) return;
    if (at >= steps.length) { at = 0; later(run, 1200); return; }
    const [wait, act] = steps[at];
    later(() => { if (!on) return; act(); at += 1; run(); }, wait);
  };
  whenVisible(root, (vis) => {
    if (vis && !on) { on = true; run(); }
    else if (!vis && on) {
      // start the next lap clean rather than mid-amount
      on = false; timers.forEach(clearTimeout); timers.clear();
      root.querySelectorAll('.is-down').forEach((el) => el.classList.remove('is-down'));
      text = ''; at = 0; draw(false); out?.classList.remove('is-on');
    }
  });
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
  initSkies();
  initSwipe();
  initSearch();
  initKeypad();
}
