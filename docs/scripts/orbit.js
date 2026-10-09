/**
 * Onboarding's orbit (src/components/OrbitHero.tsx): the bell, the check,
 * the heart and the hourglass ride a tilted ring around Cloudia, passing
 * behind her over the top and in front round the bottom. Numbers are in the
 * art's 480px space. Runs only while on screen; still under reduced motion.
 */
import { reducedMotion, whenVisible } from './motion.js?v=8e3b931cd6';

const SRC = 480;
const RING = { cx: 245, cy: 249, rx: 214, ry: 142, tilt: 2.5 };
const ICONS = [
  { key: 'bell', w: 138, h: 130, at: 222 },
  { key: 'check', w: 113, h: 110, at: 305 },
  { key: 'hourglass', w: 115, h: 131, at: 50 },
  { key: 'heart', w: 120, h: 103, at: 140 },
];
const BEADS = [178, 265, 0, 95];
const BEAD = 30;
const LAP = 26000;

function onRing(deg) {
  const a = (deg * Math.PI) / 180;
  const t = (RING.tilt * Math.PI) / 180;
  const x = RING.rx * Math.cos(a);
  const y = RING.ry * Math.sin(a);
  return { x: RING.cx + x * Math.cos(t) - y * Math.sin(t), y: RING.cy + x * Math.sin(t) + y * Math.cos(t), near: Math.sin(a) };
}

export function initOrbit() {
  const root = document.querySelector('[data-orbit]');
  if (!root) return;
  const items = [
    ...BEADS.map((at) => {
      const img = Object.assign(document.createElement('img'), { className: 'orbit-item', src: 'assets/art/orbit-bead.webp', alt: '' });
      img.width = BEAD; img.height = BEAD;
      return { at, w: BEAD, h: BEAD, el: img };
    }),
    ...ICONS.map((i) => {
      const img = Object.assign(document.createElement('img'), { className: 'orbit-item', src: `assets/art/orbit-${i.key}.webp`, alt: '' });
      img.width = i.w; img.height = i.h;
      return { ...i, el: img };
    }),
  ];
  items.forEach((it) => root.append(it.el));

  let k = root.clientWidth / SRC;
  new ResizeObserver(() => { k = root.clientWidth / SRC; place(last); }).observe(root);

  let last = 0;
  function place(turn) {
    last = turn;
    for (const it of items) {
      const p = onRing(it.at + turn);
      const s = 0.9 + 0.1 * p.near;
      it.el.style.width = `${it.w * k}px`;
      it.el.style.height = `${it.h * k}px`;
      it.el.style.zIndex = p.near >= 0 ? '3' : '1';
      it.el.style.transform = `translate(${((p.x - it.w / 2) * k).toFixed(1)}px, ${((p.y - it.h / 2) * k).toFixed(1)}px) scale(${s.toFixed(3)})`;
    }
  }
  place(0);
  if (reducedMotion()) return;

  let raf = 0; let t0 = 0; let base = 0;
  const loop = (now) => {
    if (!t0) t0 = now;
    place(base + ((now - t0) / LAP) * 360);
    raf = requestAnimationFrame(loop);
  };
  whenVisible(root, (on) => {
    if (on && !raf) { t0 = 0; raf = requestAnimationFrame(loop); }
    else if (!on && raf) { cancelAnimationFrame(raf); raf = 0; base = last; }
  });
}
