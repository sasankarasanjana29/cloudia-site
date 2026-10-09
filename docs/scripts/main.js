/**
 * Every page loads this one module. Each feature finds its own markup and
 * does nothing if the page does not have it, so the legal pages pay only
 * for the nav and the reveals.
 */
import { initNav, initThemeSwitch } from './nav.js?v=a93b57b2c8';
import { initReveal } from './reveal.js?v=a93b57b2c8';
import { initToday } from './today.js?v=a93b57b2c8';
import { initOrbit } from './orbit.js?v=a93b57b2c8';
import { initStory } from './story.js?v=a93b57b2c8';
import { initDemos } from './demos.js?v=a93b57b2c8';
import { initGather } from './gather.js?v=a93b57b2c8';

initNav();
initThemeSwitch();
initReveal();
initToday();
initOrbit();
initStory();
initDemos();
initGather();

window.cloudiaReady = true;
