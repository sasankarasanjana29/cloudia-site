/**
 * "How it works": three steps beside one phone. The active step's bar fills
 * and the next step follows when it is full; any step can be chosen. It only
 * advances while on screen and not hovered, never under Reduce Motion, and
 * the seal plays each time the third step comes up.
 */
import { SealMoment } from './seal.js';
import { reducedMotion, whenVisible } from './motion.js';

export function initStory() {
  const list = document.querySelector('[data-how]');
  if (!list) return;
  const tabs = [...list.querySelectorAll('.how-step')];
  const screens = [...document.querySelectorAll('.stage-screen')];
  const stage = document.getElementById('how-stage');
  const page = document.querySelector('.how-stage [data-seal-page]');
  const seal = page ? new SealMoment(page) : null;
  const still = reducedMotion();
  let current = 0;
  let sealTimer = 0;
  if (still) list.classList.add('is-still');

  const show = (i, focus = false) => {
    current = i;
    tabs.forEach((t, k) => {
      const on = k === i;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      // restart the bar: a fresh animation each time the step comes up
      const bar = t.querySelector('.hs-bar i');
      if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    });
    screens.forEach((s, k) => s.classList.toggle('is-on', k === i));
    stage?.setAttribute('aria-labelledby', tabs[i].id);
    if (focus) tabs[i].focus();
    clearTimeout(sealTimer);
    if (i === 2 && seal) { seal.reset(); sealTimer = setTimeout(() => seal.play(), 420); }
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    // a full bar moves on to the next step
    t.querySelector('.hs-bar i')?.addEventListener('animationend', () => { if (!still && i === current) show((i + 1) % tabs.length); });
  });
  // arrow keys move between steps, as in any tab list
  list.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    show((current + d + tabs.length) % tabs.length, true);
  });

  const pause = (p) => list.classList.toggle('is-paused', p);
  let visible = false; let hovered = false;
  const sync = () => pause(!visible || hovered);
  whenVisible(list, (v) => { visible = v; sync(); }, { threshold: 0.3 });
  for (const el of [list, stage]) {
    el?.addEventListener('pointerenter', () => { hovered = true; sync(); });
    el?.addEventListener('pointerleave', () => { hovered = false; sync(); });
  }
  pause(true);
  show(0);
}
