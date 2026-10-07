/**
 * "How it works": the app's segmented control picks one of three screens.
 * Tap or arrow keys; the seal plays each time Seal is chosen.
 */
import { SealMoment } from './seal.js?v=2e6058781b';

export function initStory() {
  const seg = document.querySelector('[data-how]');
  if (!seg) return;
  const tabs = [...seg.querySelectorAll('.seg-btn')];
  const screens = [...document.querySelectorAll('.how-phone .stage-screen')];
  const caps = [...document.querySelectorAll('.how-cap .cap')];
  const panel = document.getElementById('how-panel');
  const page = document.querySelector('.how-phone [data-seal-page]');
  const seal = page ? new SealMoment(page) : null;
  let current = 0;
  let timer = 0;

  const show = (i, focus = false) => {
    current = i;
    tabs.forEach((t, k) => {
      const on = k === i;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    screens.forEach((s, k) => s.classList.toggle('is-on', k === i));
    caps.forEach((c, k) => c.classList.toggle('is-on', k === i));
    panel?.setAttribute('aria-labelledby', tabs[i].id);
    if (focus) tabs[i].focus();
    clearTimeout(timer);
    seal?.reset();
    if (i === 2 && seal) timer = setTimeout(() => seal.play(), 360);
  };

  tabs.forEach((t, i) => t.addEventListener('click', () => show(i)));
  seg.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    show((current + d + tabs.length) % tabs.length, true);
  });
  show(0);
}
