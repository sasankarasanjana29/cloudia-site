/**
 * The hero's rotating word: "You said you'd reply." walks once through a few
 * real loops (pay it back, call them, send it) and settles back on the first.
 * One cycle only, never a loop that keeps moving while someone reads.
 * Reduce Motion: nothing moves.
 */
import { reducedMotion } from './motion.js';

export function initSwap() {
  const slot = document.querySelector('[data-swap]');
  if (!slot || reducedMotion()) return;
  const words = [...slot.children];
  if (words.length < 2) return;
  const START = 1600;   // after the hero has risen in
  const STEP = 1500;    // each word holds long enough to read
  let i = 0;
  const show = (next) => {
    const prev = words[i];
    // pin the current width, then ease it to the next word's width
    slot.style.width = `${slot.offsetWidth}px`;
    void slot.offsetWidth;
    slot.style.width = `${words[next].offsetWidth}px`;
    prev.classList.remove('is-on');
    prev.classList.add('is-out');
    words[next].classList.remove('is-out');
    words[next].classList.add('is-on');
    setTimeout(() => prev.classList.remove('is-out'), 600);
    i = next;
  };
  words.forEach((_, k) => {
    setTimeout(() => show((k + 1) % words.length), START + k * STEP);
  });
  // back on the first word: let the slot size itself again
  setTimeout(() => { slot.style.width = ''; }, START + words.length * STEP + 700);
}
