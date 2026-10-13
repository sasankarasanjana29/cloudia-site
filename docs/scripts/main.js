/**
 * Every page loads this one module. Each feature finds its own markup and
 * does nothing if the page does not have it, so the legal pages pay only
 * for the nav and the reveals.
 */
import { initNav, initThemeSwitch } from './nav.js?v=42023f1b1c';
import { initReveal } from './reveal.js?v=42023f1b1c';
import { initToday } from './today.js?v=42023f1b1c';
import { initOrbit } from './orbit.js?v=42023f1b1c';
import { initStory } from './story.js?v=42023f1b1c';
import { initDemos } from './demos.js?v=42023f1b1c';
import { initGather } from './gather.js?v=42023f1b1c';
import { initSwap } from './swap.js?v=42023f1b1c';

initNav();
initThemeSwitch();
initReveal();
initToday();
initOrbit();
initStory();
initDemos();
initGather();
initSwap();

window.cloudiaReady = true;
