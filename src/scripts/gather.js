/**
 * The dashed lines from each place into Cloudia's orbit, drawn from where
 * things actually are, so they meet at every screen size. Wide screens run
 * them sideways; a phone, where the places sit above and below, runs them
 * up and down.
 */
const NS = 'http://www.w3.org/2000/svg';

export function initGather() {
  const stage = document.querySelector('[data-gather]');
  if (!stage) return;
  const svg = stage.querySelector('[data-gather-lines]');
  const orbit = stage.querySelector('.orbit');
  const sources = [...stage.querySelectorAll('.source')];

  const draw = () => {
    const box = stage.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const o = orbit.getBoundingClientRect();
    // the ring's ellipse inside the orbit box (OrbitHero's numbers, of 480)
    const cx = o.left - box.left + o.width * (245 / 480);
    const cy = o.top - box.top + o.height * (249 / 480);
    const rx = o.width * (214 / 480);
    const ry = o.height * (142 / 480);
    const tall = box.height > box.width * 0.9;
    svg.replaceChildren();
    for (const el of sources) {
      // offsetLeft/Top ignore the cards' tilt and bob, so the line holds still
      const w = el.offsetWidth; const h = el.offsetHeight;
      const left = el.offsetLeft; const top = el.offsetTop;
      const isLeft = left + w / 2 < cx; const isTop = top + h / 2 < cy;
      const sx = tall ? left + w / 2 : (isLeft ? left + w : left);
      const sy = tall ? (isTop ? top + h : top) : top + h / 2;
      // aim at the ring, on the side facing the card
      const ang = Math.atan2((sy - cy) / ry, (sx - cx) / rx);
      const ex = cx + rx * Math.cos(ang);
      const ey = cy + ry * Math.sin(ang);
      const d = tall
        ? `M ${sx} ${sy} C ${sx} ${sy + (ey - sy) * 0.6}, ${ex} ${ey - (ey - sy) * 0.3}, ${ex} ${ey}`
        : `M ${sx} ${sy} C ${sx + (ex - sx) * 0.6} ${sy}, ${ex - (ex - sx) * 0.3} ${ey}, ${ex} ${ey}`;
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      svg.append(path);
    }
  };
  draw();
  new ResizeObserver(draw).observe(stage);
}
