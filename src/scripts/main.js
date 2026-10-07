/**
 * Every page loads this one module. Each feature finds its own markup and
 * does nothing if the page does not have it, so the legal pages pay only
 * for the nav and the reveals.
 */
import { initNav, initThemeSwitch } from './nav.js';
import { initReveal } from './reveal.js';
import { initToday } from './today.js';
import { initOrbit } from './orbit.js';
import { initStory } from './story.js';
import { initDemos } from './demos.js';

initNav();
initThemeSwitch();
initReveal();
initToday();
initOrbit();
initStory();
initDemos();

window.cloudiaReady = true;
