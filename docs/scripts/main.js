/**
 * Every page loads this one module. Each feature finds its own markup and
 * does nothing if the page does not have it, so the legal pages pay only
 * for the nav and the reveals.
 */
import { initNav, initThemeSwitch } from './nav.js?v=2e6058781b';
import { initReveal } from './reveal.js?v=2e6058781b';
import { initToday } from './today.js?v=2e6058781b';
import { initOrbit } from './orbit.js?v=2e6058781b';
import { initStory } from './story.js?v=2e6058781b';
import { initDemos } from './demos.js?v=2e6058781b';
import { initGather } from './gather.js?v=2e6058781b';

initNav();
initThemeSwitch();
initReveal();
initToday();
initOrbit();
initStory();
initDemos();
initGather();

window.cloudiaReady = true;
