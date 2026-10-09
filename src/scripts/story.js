/**
 * "How it works": the app's segmented control picks one of three screens.
 * One pill slides under the labels to the chosen step. The steps also move
 * on by themselves while the section is on screen; a tap or the arrow keys
 * take over, and the tour picks up again after a quiet spell. Hovering or
 * focusing the control holds it. The seal plays each time Seal is chosen.
 */
import { SealMoment } from './seal.js';
import { AddMoment, DayWalk } from './howto.js';
import { reducedMotion, whenVisible } from './motion.js';

/** how long each step stays up: long enough for its little story to finish */
const DWELL = [19500, 10200, 6800];
/** after a tap, wait this long before touring again */
const RESUME = 12000;

export function initStory() {
  const seg = document.querySelector('[data-how]');
  if (!seg) return;
  const tabs = [...seg.querySelectorAll('.seg-btn')];
  const pill = seg.querySelector('.seg-pill');
  const screens = [...document.querySelectorAll('.how-phone .stage-screen')];
  const caps = [...document.querySelectorAll('.how-cap .cap')];
  const panel = document.getElementById('how-panel');
  const page = document.querySelector('.how-phone [data-seal-page]');
  const seal = page ? new SealMoment(page) : null;
  const addCanvas = document.querySelector('.how-phone .add-screen');
  const dayCanvas = document.querySelector('.how-phone .today-screen');
  const players = [addCanvas && new AddMoment(addCanvas), dayCanvas && new DayWalk(dayCanvas)];
  let current = 0;
  let sealTimer = 0;

  const placePill = () => {
    if (!pill) return;
    const t = tabs[current];
    pill.style.width = `${t.offsetWidth}px`;
    pill.style.transform = `translateX(${t.offsetLeft}px)`;
  };

  const show = (i, focus = false) => {
    current = i;
    tabs.forEach((t, k) => {
      const on = k === i;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    placePill();
    screens.forEach((s, k) => s.classList.toggle('is-on', k === i));
    caps.forEach((c, k) => c.classList.toggle('is-on', k === i));
    panel?.setAttribute('aria-labelledby', tabs[i].id);
    if (focus) tabs[i].focus();
    clearTimeout(sealTimer);
    seal?.reset();
    players.forEach((p) => p?.reset());
    if (i === 2 && seal) sealTimer = setTimeout(() => seal.play(), 360);
    else if (players[i] && !reducedMotion()) sealTimer = setTimeout(() => players[i].play(), 360);
  };

  // the tour: only while on screen, held while a pointer or keyboard focus is on the control
  let tour = 0;
  let visible = false;
  let hover = false;
  let keys = false;
  let chosenAt = -Infinity;
  const stop = () => { clearTimeout(tour); tour = 0; };
  const next = () => {
    stop();
    if (reducedMotion() || !visible || hover || keys) return;
    const wait = Math.max(DWELL[current], chosenAt + RESUME - performance.now());
    tour = setTimeout(() => { show((current + 1) % tabs.length); next(); }, wait);
  };
  const choose = (i, focus) => { chosenAt = performance.now(); show(i, focus); next(); };

  tabs.forEach((t, i) => t.addEventListener('click', () => choose(i)));
  seg.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    choose((current + d + tabs.length) % tabs.length, true);
  });
  seg.addEventListener('pointerenter', () => { hover = true; stop(); });
  seg.addEventListener('pointerleave', () => { hover = false; next(); });
  seg.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) { keys = true; stop(); } });
  seg.addEventListener('focusout', (e) => { if (!seg.contains(e.relatedTarget)) { keys = false; next(); } });

  show(0);
  if (pill) {
    seg.classList.add('has-pill');
    // labels can reflow (fonts, rotation); keep the pill on its step
    new ResizeObserver(placePill).observe(seg);
    requestAnimationFrame(() => requestAnimationFrame(() => seg.classList.add('is-ready')));
  }
  whenVisible(seg, (on) => { visible = on; if (on) next(); else stop(); }, { threshold: 0.6 });
}
