/**
 * The other two steps of "How it works", played the way the app behaves:
 *
 * AddMoment (add.tsx): tap My turn, the sheet grows into the form, the title
 * and the person are typed, Today and Bills are picked, Add to Cloudia is
 * pressed, the sheet drops away and the new loop arrives in Today.
 *
 * DayWalk (the date strip, a wheel with a fixed lens): tap tomorrow and the
 * days glide under the lens, showing that day; then the next two days, then
 * back to today by its own blue date.
 *
 * Each has play() and reset(), like SealMoment. reset() puts the screen back
 * to its still frame with no motion.
 */

const wait = (ms, run) => new Promise((done, fail) => {
  const t = setTimeout(() => (run.live ? done() : fail(new Error('stopped'))), ms);
  run.timers.push(t);
});

/** a soft ring where a finger lands, in the canvas' own points */
function tapAt(canvas, el) {
  const c = canvas.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const k = c.width / 402;
  const ring = document.createElement('i');
  ring.className = 'tap';
  ring.style.left = `${(r.left + r.width / 2 - c.left) / k}px`;
  ring.style.top = `${(r.top + r.height / 2 - c.top) / k}px`;
  canvas.append(ring);
  setTimeout(() => ring.remove(), 600);
}

class Player {
  constructor() { this.run = { live: false, timers: [] }; }
  stop() {
    this.run.live = false;
    this.run.timers.forEach(clearTimeout);
    this.run = { live: false, timers: [] };
  }
  play() {
    this.stop();
    this.reset();
    const run = { live: true, timers: [] };
    this.run = run;
    this.script(run).catch((e) => { if (e.message !== 'stopped') console.error(e); });
  }
}

export class AddMoment extends Player {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.sheet = canvas.querySelector('[data-sheet]');
    this.type = canvas.querySelector('.step-type');
    this.row = canvas.querySelector('[data-type-row="mine"]');
    this.what = canvas.querySelector('[data-in="what"]');
    this.who = canvas.querySelector('[data-in="who"]');
    this.when = canvas.querySelector('[data-when]');
    this.cat = canvas.querySelector('[data-cat]');
    this.add = canvas.querySelector('[data-add-btn]');
    this.p1 = canvas.querySelector('.list-pill.p1 b');
    /* everything under the top of Needs you today steps down for the new card */
    this.below = [...canvas.querySelectorAll('.list-card.k1, .list-card.k2, .list-pill.p2, .list-card.k3')];
    this.sheet.classList.add('has-form');
    this.reset();
  }

  /** the sheet is as tall as the form; on the first step it sits lower by the difference */
  low() {
    const steps = this.sheet.querySelector('.sheet-steps');
    return Math.max(0, steps.offsetHeight - this.type.offsetHeight);
  }

  reset() {
    this.stop();
    const c = this.canvas;
    c.classList.add('no-anim');
    c.classList.remove('is-closed');
    this.sheet.classList.remove('on-form');
    this.sheet.style.transform = `translateY(${this.low()}px)`;
    this.row.classList.remove('pick');
    [this.what, this.who].forEach((f) => { f.classList.remove('is-on'); f.querySelector('[data-text]').textContent = ''; });
    this.when.classList.remove('is-on');
    this.cat.classList.remove('is-on');
    this.add.classList.add('is-off');
    this.add.classList.remove('is-down');
    c.querySelector('.k-new')?.remove();
    this.below.forEach((el) => { el.style.transform = ''; });
    this.p1.textContent = '2';
    void c.offsetWidth;
    c.classList.remove('no-anim');
  }

  async typeInto(field, text, run) {
    field.classList.add('is-on');
    const out = field.querySelector('[data-text]');
    for (const ch of text) {
      await wait(ch === ' ' ? 40 : 58, run);
      out.textContent += ch;
    }
  }

  async script(run) {
    const c = this.canvas;
    await wait(700, run);
    tapAt(c, this.row);
    this.row.classList.add('pick');
    await wait(320, run);
    this.sheet.style.transform = 'translateY(0)';
    this.sheet.classList.add('on-form');
    await wait(520, run);
    await this.typeInto(this.what, 'Pay the electricity bill', run);
    this.add.classList.remove('is-off');
    await wait(260, run);
    this.what.classList.remove('is-on');
    await this.typeInto(this.who, 'Power company', run);
    await wait(380, run);
    this.who.classList.remove('is-on');
    tapAt(c, this.when);
    this.when.classList.add('is-on');
    await wait(520, run);
    tapAt(c, this.cat.querySelector('.cat-sq'));
    this.cat.classList.add('is-on');
    await wait(620, run);
    tapAt(c, this.add);
    this.add.classList.add('is-down');
    await wait(160, run);
    this.add.classList.remove('is-down');
    c.classList.add('is-closed');
    await wait(380, run);
    // due today, so it heads Needs you today and the rest step down
    this.p1.textContent = '3';
    this.below.forEach((el) => { el.style.transform = 'translateY(98px)'; });
    const card = document.createElement('div');
    card.className = 'loop mine list-card k-new';
    card.innerHTML = '<div class="loop-art"><img src="assets/art/answer-bill-due.webp" alt="" width="38" height="38"><span class="loop-badge"><svg><use href="#i-hand"/></svg></span></div><div class="loop-text"><div class="loop-top"><span class="loop-title">Pay the electricity bill</span><span class="due today">Today</span></div><div class="loop-meta">Power company</div></div>';
    c.querySelector('[data-list]').append(card);
  }
}

/* what each day ahead holds, kept in step with the strip's dots (today.js) */
const PLANS = {
  1: { due: [{ art: 'refunds-and-returns', title: 'Refund for the jacket', meta: 'Online store · <b>$129</b>', badge: 'hourglass', mine: false }] },
  2: { next: { day: 3, title: 'Pay the electricity bill' } },
  3: { due: [{ art: 'bill-due', title: 'Pay the electricity bill', meta: 'Power company · <b>$48</b>', badge: 'hand', mine: true }] },
};

export class DayWalk extends Player {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.week = canvas.querySelector('[data-week]');
    this.list = canvas.querySelector('[data-list]');
    this.layers = {};
    const now = new Date();
    const at = (n) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + n);
    const long = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' });
    const short = (d) => `${new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(d)} ${d.getDate()} ${new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(d)}`;
    const rel = (n) => (n === 1 ? 'Tomorrow' : `In ${n} days`);
    const card = (l) => `<div class="loop${l.mine ? ' mine' : ''}"><div class="loop-art"><img src="assets/art/answer-${l.art}.webp" alt="" width="38" height="38"><span class="loop-badge"><svg><use href="#i-${l.badge}"/></svg></span></div><div class="loop-text"><div class="loop-top"><span class="loop-title">${l.title}</span></div><div class="loop-meta">${l.meta}</div></div></div>`;
    const fade = canvas.querySelector('.scroll-fade');
    Object.entries(PLANS).forEach(([n, plan]) => {
      const d = at(+n);
      const el = document.createElement('div');
      el.className = 'day-layer';
      let html = `<div class="dh"><b>${long.format(d)}</b><span>${rel(+n)}</span></div>`;
      if (plan.due) html += `<span class="pill-head now">Due <b>${plan.due.length}</b></span>${plan.due.map(card).join('')}`;
      else html += `<div class="de"><span class="de-disc"><svg><use href="#i-check"/></svg></span><b>Nothing due on ${weekday.format(d)}</b><p>A free day, as far as Cloudia knows.</p><div class="de-next"><div><small>Next up · ${short(at(plan.next.day))}</small><strong>${plan.next.title}</strong></div><svg><use href="#i-chevron"/></svg></div></div>`;
      el.innerHTML = html;
      canvas.insertBefore(el, fade);
      this.layers[n] = el;
    });
    this.reset();
  }

  days() { return [...this.week.children]; }

  /** glide the strip so day n (0 = today) sits in the lens */
  go(n) {
    const cell = 362 / 7;
    this.days().forEach((d, i) => {
      d.style.transform = `translateX(${-n * cell}px)`;
      d.classList.toggle('is-picked', i === 3 + n);
    });
    this.list.classList.toggle('is-off', n !== 0);
    Object.entries(this.layers).forEach(([k, el]) => el.classList.toggle('is-on', +k === n));
  }

  reset() {
    this.stop();
    this.canvas.classList.add('no-anim');
    this.go(0);
    void this.canvas.offsetWidth;
    this.canvas.classList.remove('no-anim');
  }

  async script(run) {
    const c = this.canvas;
    for (const n of [1, 2, 3]) {
      await wait(n === 1 ? 900 : 1900, run);
      tapAt(c, this.days()[3 + n]);
      await wait(140, run);
      this.go(n);
    }
    await wait(2100, run);
    // back by today's own blue date, now at the strip's left
    tapAt(c, this.days()[3]);
    await wait(140, run);
    this.go(0);
  }
}
