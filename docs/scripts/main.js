/**
 * Every page loads this one module. Each feature finds its own markup and
 * does nothing if the page does not have it, so the legal pages pay only
 * for the nav and the reveals.
 */
import { initNav, initThemeSwitch } from './nav.js?v=322d01a3f3';
import { initReveal } from './reveal.js?v=322d01a3f3';
import { initToday } from './today.js?v=322d01a3f3';
import { initOrbit } from './orbit.js?v=322d01a3f3';
import { initStory } from './story.js?v=322d01a3f3';
import { initDemos } from './demos.js?v=322d01a3f3';
import { initGather } from './gather.js?v=322d01a3f3';

initNav();
initThemeSwitch();
initReveal();
initToday();
initOrbit();
initStory();
initDemos();
initGather();

window.cloudiaReady = true;
