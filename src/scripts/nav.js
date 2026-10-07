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
