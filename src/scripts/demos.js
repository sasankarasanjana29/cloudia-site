/**
 * The small live fragments in the features bento: the category marquee, the
 * skies, the search that types by itself, and the swipe rows. Each one
 * only moves while it is on screen, and holds still under reduced motion.
 */
import { reducedMotion, whenVisible } from './motion.js';

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

/**
 * "Just say it" (listen.tsx): the sentence arrives a word at a time, and each
 * card fills the moment Cloudia has heard its part, in the order the app's
 * reader would know it. "owes me" makes it a Waiting loop; once every card is
 * filled she holds up her ticked note and Add to Cloudia wakes up. The day is
 * the visitor's own next Friday, worked out as the app would.
 */
const VOICE_WORDS = [
  ['Anna', 'who'], ['owes'], ['me', 'kind'], ['$60', 'amount cat'], ['for'], ['the'],
  ['concert'], ['tickets', 'what'], ['by'], ['Friday', 'when'],
];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function initVoice() {
  const root = document.querySelector('[data-voice]');
  if (!root) return;
  const heard = root.querySelector('[data-voice-heard]');
  const add = root.querySelector('.vd-add');
  const cards = Object.fromEntries([...root.querySelectorAll('[data-card]')].map((c) => [c.dataset.card, c]));

  // "by Friday": this Friday, or today if it is Friday (VoiceCards' whenWords)
  const now = new Date();
  const days = (5 - now.getDay() + 7) % 7;
  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  root.querySelector('[data-voice-mon]').textContent = MONTHS[day.getMonth()];
  root.querySelector('[data-voice-day]').textContent = String(day.getDate());
  root.querySelector('[data-voice-when]').textContent = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : 'Friday';

  const fill = (keys) => keys.split(' ').forEach((k) => {
    if (k === 'kind') root.classList.add('is-theirs');
    else cards[k]?.classList.add('is-on');
  });
  const reset = () => {
    root.classList.remove('is-theirs', 'is-done');
    Object.values(cards).forEach((c) => c.classList.remove('is-on'));
    heard.textContent = '';
    add.classList.add('is-off');
  };
  const done = () => { root.classList.add('is-done'); add.classList.remove('is-off'); };
  const finished = () => {
    reset();
    VOICE_WORDS.forEach(([, k]) => k && fill(k));
    heard.textContent = VOICE_WORDS.map(([w]) => w).join(' ');
    done();
  };
  if (reducedMotion()) { finished(); return; }

  reset();
  let timer = 0; let on = false; let i = 0;
  const step = () => {
    if (i < VOICE_WORDS.length) {
      const [w, k] = VOICE_WORDS[i];
      heard.textContent = `${heard.textContent} ${w}`.trim();
      // a beat after the word, as the reader catches up with it
      if (k) setTimeout(() => on && fill(k), 140);
      i += 1;
      timer = setTimeout(step, i === 4 ? 520 : 260 + (w.length > 5 ? 60 : 0));
      return;
    }
    if (i === VOICE_WORDS.length) { i += 1; timer = setTimeout(() => { done(); step(); }, 700); return; }
    // hold the finished screen, then listen again
    timer = setTimeout(() => { reset(); i = 0; timer = setTimeout(step, 900); }, 3600);
  };
  whenVisible(root, (vis) => {
    if (vis && !on) { on = true; reset(); i = 0; timer = setTimeout(step, 700); }
    else if (!vis && on) { on = false; clearTimeout(timer); }
  });
}

export function initDemos() {
  initMarquee();
  initSkies();
  initSwipe();
  initSearch();
  initVoice();
}
