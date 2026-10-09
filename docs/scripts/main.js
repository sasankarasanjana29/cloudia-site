/**
 * Every page loads this one module. Each feature finds its own markup and
 * does nothing if the page does not have it, so the legal pages pay only
 * for the nav and the reveals.
 */
import { initNav, initThemeSwitch } from './nav.js?v=8128b6d62a';
import { initReveal } from './reveal.js?v=8128b6d62a';
import { initToday } from './today.js?v=8128b6d62a';
import { initOrbit } from './orbit.js?v=8128b6d62a';
import { initStory } from './story.js?v=8128b6d62a';
import { initDemos } from './demos.js?v=8128b6d62a';
import { initGather } from './gather.js?v=8128b6d62a';

initNav();
initThemeSwitch();
initReveal();
initToday();
initOrbit();
initStory();
initDemos();
initGather();

window.cloudiaReady = true;
