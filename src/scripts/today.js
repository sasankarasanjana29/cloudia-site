/**
 * Makes every Today screen on the page show the visitor's own day, the way
 * the app does: today's date, this week around it, and the sky and Cloudia's
 * mood for the hour (src/lib/skyMood.ts: dawn 5 to 8, day 8 to 17, dusk 17
 * to 20, night otherwise).
 */
const MASCOT = { dawn: 'greeting', day: 'working', dusk: 'completed', night: 'all-clear' };
/* a believable week: done behind, one late yesterday, due ahead */
const DOTS = { '-3': ['done'], '-2': ['done', 'done'], '-1': ['late'], 0: ['due'], 1: ['due'], 2: [], 3: ['due'] };
/* the strip is a wheel: three days past the right edge, so it can glide */
const AHEAD = 6;

export function phaseAt(hour) {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

export function initToday() {
  const now = new Date();
  const phase = phaseAt(now.getHours());
  document.documentElement.dataset.phase = phase;

  const long = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  const month = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(now);
  const short = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });

  document.querySelectorAll('[data-date-long]').forEach((el) => { el.textContent = long; });
  document.querySelectorAll('[data-month]').forEach((el) => { el.textContent = month; });
  document.querySelectorAll('[data-sky-mascot]').forEach((img) => { img.src = `assets/art/mascot-${MASCOT[phase]}.webp`; });

  document.querySelectorAll('[data-week]').forEach((week) => {
    week.innerHTML = '';
    for (let i = -3; i <= AHEAD; i += 1) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const day = document.createElement('div');
      day.className = `day${i < 0 ? ' is-past' : ''}${i === 0 ? ' is-today' : ''}`;
      const dots = (DOTS[i] ?? []).map((k) => `<i class="d-${k}"></i>`).join('') || '<i></i>';
      day.innerHTML = `<span>${short.format(d)}</span><b>${d.getDate()}</b><span class="dots">${dots}</span>`;
      week.append(day);
    }
  });

  // the features tile marks the sky the visitor is under right now
  document.querySelector(`.mini-sky[data-phase="${phase}"]`)?.classList.add('is-now');
}
