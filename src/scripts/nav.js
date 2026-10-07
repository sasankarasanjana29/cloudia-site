/** The small-screen menu: a disclosure button, closed by Escape, a link, or a tap outside. */
export function initNav() {
  const btn = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    links.classList.toggle('is-open', open);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav')) set(false); });
}

/** The light / dark switch. Light is the default; a choice is remembered in this browser only. */
export function initThemeSwitch() {
  const sw = document.querySelector('.theme-switch');
  if (!sw) return;
  const root = document.documentElement;
  const sync = () => sw.setAttribute('aria-checked', String(root.dataset.theme === 'dark'));
  sync();
  sw.addEventListener('click', () => {
    const dark = root.dataset.theme !== 'dark';
    if (dark) root.dataset.theme = 'dark'; else delete root.dataset.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#070d19' : '#ffffff');
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', dark ? 'dark' : 'light');
    try { localStorage.setItem('cloudia-theme', dark ? 'dark' : 'light'); } catch (e) { /* private mode: still switches */ }
    sync();
  });
}
