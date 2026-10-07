/**
 * Every page loads this one module. Each feature finds its own markup and
 * does nothing if the page does not have it, so the legal pages pay only
 * for the nav and the reveals.
 */
import { initNav, initThemeSwitch } from './nav.js?v=511cf98402';
import { initReveal } from './reveal.js?v=511cf98402';
import { initToday } from './today.js?v=511cf98402';
import { initOrbit } from './orbit.js?v=511cf98402';
import { initStory } from './story.js?v=511cf98402';
import { initDemos } from './demos.js?v=511cf98402';
import { initGather } from './gather.js?v=511cf98402';

initNav();
initThemeSwitch();
initReveal();
initToday();
initOrbit();
initStory();
initDemos();
initGather();

window.cloudiaReady = true;
