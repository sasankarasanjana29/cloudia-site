/** Shared motion helpers, a direct port of the app's interpolate(). */

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** piecewise-linear, clamped at both ends (Reanimated's Extrapolation.CLAMP) */
export function interpolate(x, xs, ys) {
  if (x <= xs[0]) return ys[0];
  for (let i = 0; i < xs.length - 1; i += 1) {
    if (x <= xs[i + 1]) return ys[i] + ((ys[i + 1] - ys[i]) * (x - xs[i])) / (xs[i + 1] - xs[i]);
  }
  return ys[ys.length - 1];
}

/** runs `cb(visible)` whenever the element enters or leaves the viewport */
export function whenVisible(el, cb, options = {}) {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => cb(e.isIntersecting)), options);
  io.observe(el);
  return io;
}
