/**
 * "How it works": the step crossing the middle of the screen lights up and
 * the pinned phone shows its screen (wide screens). The seal plays the first
 * time its screen comes into view, and the replay button runs it again.
 */
import { SealMoment } from './seal.js';

export function initStory() {
  const steps = [...document.querySelectorAll('.step')];
  if (!steps.length) return;
  const screens = [...document.querySelectorAll('.stage-screen')];
  const moments = [...document.querySelectorAll('[data-seal-page]')].map((p) => new SealMoment(p));
  const stageMoment = moments.find((m) => m.page.closest('.stage-screen'));
  const wide = window.matchMedia('(min-width: 960px)');

  const show = (i) => {
    steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
    screens.forEach((s, k) => s.classList.toggle('is-on', k === i));
    if (i === 2 && wide.matches && stageMoment && !stageMoment.played) setTimeout(() => stageMoment.play(), 450);
  };
  show(0);

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) show(Number(e.target.dataset.step));
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach((s) => io.observe(s));

  // narrow screens: each step has its own phone; play when it is in view
  for (const m of moments) {
    if (m === stageMoment) continue;
    const phone = m.page.closest('.step-phone');
    if (!phone) continue;
    const once = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !wide.matches) { once.disconnect(); setTimeout(() => m.play(), 300); }
    }, { threshold: 0.65 });
    once.observe(phone);
  }

  document.querySelector('[data-seal-replay]')?.addEventListener('click', () => {
    if (wide.matches) { show(2); stageMoment?.play(); }
    else moments.find((m) => m !== stageMoment)?.play();
  });
}
