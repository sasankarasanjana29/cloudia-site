/**
 * The seal moment, ported from the app (src/components/DoneSeal.tsx) beat for
 * beat: same timings, same positions in the card's own points, same squash
 * and stretch, same pose swaps. The phone canvas is laid out in iPhone
 * points, so the numbers carry over unchanged.
 */
import { interpolate, reducedMotion } from './motion.js?v=4f51bcf839';

const MS = { up: 300, crouch: 380, takeoff: 440, apex: 600, hit: 760, lift: 960, top: 1060, stand: 1140, leave: 1480, over: 1620, end: 1820 };
const BOX = { w: 96, h: 92 };
const SEAL = { cx: 156, cy: 58, size: 84 };
const CORNER_X = 48;
const STAMP_X = SEAL.cx;
const HIDDEN_Y = 88;
const EDGE_Y = 11;
const APEX_Y = -12;
const PRESS_Y = SEAL.cy + 6;
const BOUNCE_Y = -14;
const STAND_Y = 2;
const STAMP_FACE = 19;
const ROOM = 48;

const rising = (ms, a, b) => { const u = Math.min(1, Math.max(0, (ms - a) / (b - a))); return 1 - (1 - u) * (1 - u); };
const falling = (ms, a, b) => { const u = Math.min(1, Math.max(0, (ms - a) / (b - a))); return u * u; };

/** where Cloudia's feet are, how squashed she is and how tilted, at `ms` */
function body(ms) {
  const x = interpolate(ms, [MS.takeoff, MS.hit, MS.leave, MS.over + 60], [CORNER_X, STAMP_X, STAMP_X, CORNER_X]);
  let y;
  if (ms < MS.up) { const u = ms / MS.up; y = HIDDEN_Y + (EDGE_Y - HIDDEN_Y) * (1 - (1 - u) ** 3); }
  else if (ms < MS.takeoff) y = EDGE_Y + interpolate(ms, [MS.crouch, MS.takeoff - 20, MS.takeoff], [0, 3, 0]);
  else if (ms < MS.apex) y = EDGE_Y + (APEX_Y - EDGE_Y) * rising(ms, MS.takeoff, MS.apex);
  else if (ms < MS.hit) y = APEX_Y + (PRESS_Y - APEX_Y) * falling(ms, MS.apex, MS.hit);
  else if (ms < MS.lift) y = PRESS_Y;
  else if (ms < MS.top) y = PRESS_Y + (BOUNCE_Y - PRESS_Y) * rising(ms, MS.lift, MS.top);
  else if (ms < MS.stand) y = BOUNCE_Y + (STAND_Y - BOUNCE_Y) * falling(ms, MS.top, MS.stand);
  else if (ms < MS.leave) y = STAND_Y;
  else if (ms < MS.over) y = STAND_Y + (APEX_Y - STAND_Y) * rising(ms, MS.leave, MS.over);
  else y = APEX_Y + (HIDDEN_Y - APEX_Y) * falling(ms, MS.over, MS.end);
  const sy = interpolate(ms,
    [MS.crouch, MS.takeoff - 10, MS.takeoff + 30, MS.apex, MS.hit - 20, MS.hit, MS.hit + 40, MS.hit + 100,
      MS.lift, MS.lift + 30, MS.top, MS.stand, MS.stand + 50, MS.stand + 110, MS.leave, MS.leave + 30, MS.over],
    [1, 0.93, 1.06, 1, 1.04, 0.88, 1.03, 1, 1, 1.05, 1, 0.9, 1.03, 1, 1, 1.05, 1]);
  const tilt = interpolate(ms, [MS.takeoff, MS.apex, MS.hit, MS.leave, MS.over, MS.end], [0, 8, 0, 0, -8, 0]);
  return { x, y, sy, sx: 2 - sy, tilt, front: ms >= MS.apex && ms < MS.over };
}

function pose(ms) {
  if (ms < MS.takeoff) return 'climb';
  if (ms < MS.hit) return 'jump';
  if (ms < MS.lift) return 'press';
  return 'proud';
}

/** the wax seal's wobbly outline: the app's numbers, so it is the same seal */
const SEAL_EDGE = (() => {
  const n = 72; const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const r = 42 * (1 + 0.065 * Math.sin(5 * a + 0.6) + 0.04 * Math.sin(3 * a + 2.1) + 0.015 * Math.sin(9 * a + 1));
    pts.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]);
  }
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const m0 = mid(pts[n - 1], pts[0]);
  let d = `M${m0[0].toFixed(2)} ${m0[1].toFixed(2)}`;
  for (let i = 0; i < n; i += 1) {
    const m = mid(pts[i], pts[(i + 1) % n]);
    d += ` Q${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)} ${m[0].toFixed(2)} ${m[1].toFixed(2)}`;
  }
  return `${d}Z`;
})();
const CHECK = 'M37 51 L46.5 60 L64 41';
let uid = 0;

function waxSvg() {
  uid += 1;
  const o = `wo${uid}`; const i = `wi${uid}`;
  return `<defs>
    <radialGradient id="${o}" cx="36%" cy="30%" r="75%"><stop offset="0" stop-color="#DDF98A"/><stop offset="0.42" stop-color="#A2DB40"/><stop offset="0.78" stop-color="#74B520"/><stop offset="1" stop-color="#4F8E12"/></radialGradient>
    <linearGradient id="${i}" x1="0.15" y1="0.1" x2="0.85" y2="0.95"><stop offset="0" stop-color="#6AAA1C"/><stop offset="1" stop-color="#B4E658"/></linearGradient>
  </defs>
  <path d="${SEAL_EDGE}" fill="url(#${o})"/>
  <circle cx="51.2" cy="51.6" r="32.5" fill="none" stroke="#3F7A0C" stroke-width="4" stroke-opacity="0.55"/>
  <circle cx="48.9" cy="48.6" r="32.5" fill="none" stroke="#EEFFC0" stroke-width="2" stroke-opacity="0.75"/>
  <circle cx="50" cy="50" r="30" fill="url(#${i})"/>
  <g stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="${CHECK}" stroke="#3B720B" stroke-opacity="0.55" stroke-width="7" transform="translate(1.3 1.7)"/>
    <path d="${CHECK}" stroke="#C9F070" stroke-width="6.5"/>
    <path d="${CHECK}" stroke="#F6FFDA" stroke-width="2" stroke-opacity="0.9" transform="translate(-0.7 -0.9)"/>
  </g>
  <ellipse cx="30" cy="23" rx="11" ry="4.5" fill="#fff" opacity="0.5" transform="rotate(-32 30 23)"/>
  <circle cx="74" cy="77" r="2" fill="#fff" opacity="0.35"/>`;
}

const CONFETTI = ['#0195ff', '#4bcd00', '#ff9029', '#48d5bf', '#ff6073', '#96d3ff'];

/** one seal moment on one loop page */
export class SealMoment {
  constructor(page) {
    this.page = page;
    this.canvas = page.closest('.canvas');
    this.card = page.querySelector('[data-seal-card]');
    this.wax = page.querySelector('[data-seal-wax]');
    this.ring = page.querySelector('[data-seal-ring]');
    this.spot = page.querySelector('[data-seal-spot]');
    this.back = this.canvas?.querySelector('[data-seal-back]');
    this.label = page.querySelector('[data-seal-label]');
    this.layers = [...page.querySelectorAll('[data-seal-layer]')];
    this.wax.innerHTML = waxSvg();
    this.raf = 0;
    this.played = false;
    page.querySelector('[data-seal-go]')?.addEventListener('click', () => this.play());
  }

  reset() {
    cancelAnimationFrame(this.raf);
    this.page.classList.remove('is-sealed');
    this.page.style.transform = '';
    this.card.style.transform = '';
    this.wax.style.cssText = '';
    this.ring.style.cssText = '';
    if (this.back) this.back.style.opacity = '';
    if (this.label) this.label.textContent = 'It arrived';
    for (const l of this.layers) l.style.opacity = '0';
  }

  sealed() {
    this.page.classList.add('is-sealed');
    if (this.label) this.label.textContent = 'Back to your loops';
  }

  play() {
    this.reset();
    this.played = true;
    if (reducedMotion()) { this.sealed(); return; }
    let start = 0;
    let hit = false;
    const tick = (now) => {
      if (!start) start = now;
      const ms = Math.min(MS.end, now - start);
      this.frame(ms);
      if (!hit && ms >= MS.hit) { hit = true; this.sealed(); this.confetti(); }
      if (ms < MS.end) this.raf = requestAnimationFrame(tick);
      else this.done();
    };
    this.raf = requestAnimationFrame(tick);
  }

  frame(ms) {
    const b = body(ms);
    const p = pose(ms);
    for (const layer of this.layers) {
      const isFront = layer.dataset.sealLayer === 'front';
      layer.style.opacity = isFront === b.front ? '1' : '0';
      layer.style.transform = `translate(${(b.x - BOX.w / 2).toFixed(2)}px, ${(b.y - BOX.h).toFixed(2)}px) rotate(${b.tilt.toFixed(2)}deg) scale(${b.sx.toFixed(3)}, ${b.sy.toFixed(3)})`;
      for (const img of layer.children) img.classList.toggle('on', img.dataset.pose === p);
    }
    // the wax spreads out from under the stamp's face, then settles
    if (ms >= MS.hit) {
      this.wax.style.opacity = '1';
      this.wax.style.transform = `rotate(${interpolate(ms, [MS.hit, MS.hit + 180], [-18, -10]).toFixed(2)}deg) scale(${interpolate(ms, [MS.hit, MS.hit + 90, MS.hit + 200], [STAMP_FACE / SEAL.size, 1.08, 1]).toFixed(3)})`;
    } else this.wax.style.opacity = '0';
    this.ring.style.opacity = interpolate(ms, [MS.hit, MS.hit + 40, MS.hit + 290], [0, 0.5, 0]).toFixed(3);
    this.ring.style.transform = `scale(${interpolate(ms, [MS.hit, MS.hit + 290], [0.9, 1.6]).toFixed(3)})`;
    this.card.style.transform = `translateY(${interpolate(ms, [MS.hit - 10, MS.hit + 30, MS.hit + 150], [0, 3, 0]).toFixed(2)}px)`;
    // the page makes room for her, then rises back (useMakeRoom)
    let u;
    if (ms < 280) { const v = ms / 280; u = 1 - (1 - v) ** 3; }
    else if (ms < MS.over) u = 1;
    else { const v = Math.min(1, (ms - MS.over) / (MS.end - MS.over)); u = 1 - v * v * (3 - 2 * v); }
    this.page.style.transform = `translateY(${(ROOM * u).toFixed(2)}px)`;
    if (this.back) this.back.style.opacity = interpolate(ms, [0, 90, MS.end - 140, MS.end], [1, 0, 0, 1]).toFixed(3);
  }

  confetti() {
    for (let i = 0; i < 14; i += 1) {
      const bit = document.createElement('i');
      const a = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
      const dist = 50 + Math.random() * 40;
      bit.style.cssText = `position:absolute;left:${SEAL.size / 2 - 3}px;top:${SEAL.size / 2 - 5}px;width:6px;height:10px;border-radius:2px;background:${CONFETTI[i % CONFETTI.length]};pointer-events:none;`;
      this.spot.append(bit);
      bit.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist + 30}px) rotate(${180 + Math.random() * 360}deg)`, opacity: 0 },
      ], { duration: 900 + Math.random() * 300, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }).onfinish = () => bit.remove();
    }
  }

  done() {
    for (const l of this.layers) l.style.opacity = '0';
    this.page.style.transform = '';
    if (this.back) this.back.style.opacity = '';
  }
}
