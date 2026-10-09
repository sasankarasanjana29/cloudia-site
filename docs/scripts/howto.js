/**
 * The other two steps of "How it works", played the way the app behaves:
 *
 * AddMoment (add.tsx), in two parts. By voice: tap Just say it, the voice
 * screen rises, the sentence arrives a word at a time and each card fills as
 * its part is heard, Add to Cloudia, and the loop lands in Today. Then by
 * hand: the + opens the sheet, tap My turn, the sheet grows into the form, the title
 * and the person are typed, an amount is added, Today is picked, View all
 * opens the category picker and Bills is chosen there, Add to Cloudia is
 * pressed, the sheet drops away and the new loop arrives in Today. Paced
 * like a calm first-time user, so each tap can be followed.
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
    this.amount = canvas.querySelector('[data-in="amount"]');
    this.addAmount = canvas.querySelector('.add-amount');
    this.viewAll = canvas.querySelector('[data-view-all]');
    this.pick = canvas.querySelector('[data-pick]');
    this.done = canvas.querySelector('[data-done]');
    this.add = canvas.querySelector('[data-add-btn]');
    this.p1 = canvas.querySelector('.list-pill.p1 b');
    this.p2 = canvas.querySelector('.list-pill.p2 b');
    this.headline = canvas.querySelector('.sky-title');
    this.fab = canvas.querySelector('.fab');
    this.voiceRow = canvas.querySelector('[data-type-row="voice"]');
    this.voice = canvas.querySelector('[data-voice]');
    this.heard = this.voice.querySelector('[data-voice-heard]');
    this.vAdd = this.voice.querySelector('[data-voice-add]');
    this.cards = Object.fromEntries([...this.voice.querySelectorAll('[data-card]')].map((el) => [el.dataset.card, el]));
    /* the list as it stands, top to bottom; new cards step the rest down */
    this.rows = () => [...canvas.querySelectorAll('[data-list] .list-card, [data-list] .list-pill')];
    this.sheet.classList.add('has-form');
    this.setWhen();
    this.reset();
  }

  /** "by Friday": the visitor's own Friday, as the app's reader would take it */
  setWhen() {
    const now = new Date();
    this.vDays = (5 - now.getDay() + 7) % 7;
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + this.vDays);
    const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    this.voice.querySelector('[data-voice-mon]').textContent = MONTHS[day.getMonth()];
    this.voice.querySelector('[data-voice-day]').textContent = String(day.getDate());
    this.vWhen = this.vDays === 0 ? 'Today' : this.vDays === 1 ? 'Tomorrow' : 'Friday';
    this.voice.querySelector('[data-voice-when]').textContent = this.vWhen;
  }

  /** Needs you today's count, and the headline that spells it, as Home does */
  needs(n) {
    this.p1.textContent = String(n);
    const WORDS = ['Nothing', 'One', 'Two', 'Three', 'Four', 'Five'];
    this.headline.textContent = `${WORDS[n] ?? n} thing${n === 1 ? '' : 's'} need${n === 1 ? 's' : ''} you`;
  }

  /** a new card at `top` (canvas points); every row at or below it steps down */
  land(top, html, mine) {
    this.rows().forEach((el) => {
      if (el.offsetTop + (el._dy || 0) < top) return;
      el._dy = (el._dy || 0) + 98;
      el.style.transform = `translateY(${el._dy}px)`;
    });
    const card = document.createElement('div');
    card.className = `loop${mine ? ' mine' : ''} list-card k-new`;
    card.style.top = `${top}px`;
    // CardCheer.tsx: a small thumbs-up Cloudia perches on the new card, holds a beat, and goes
    card.innerHTML = `${html}<img class="cheer" src="assets/art/mascot-thumbs-up.webp" alt="" width="50" height="34">`;
    this.canvas.querySelector('[data-list]').append(card);
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
    c.classList.remove('is-closed', 'on-picker');
    this.sheet.classList.remove('on-form', 'has-amount');
    this.pick.classList.remove('is-on');
    this.sheet.style.transform = `translateY(${this.low()}px)`;
    this.row.classList.remove('pick');
    [this.what, this.who, this.amount].forEach((f) => { f.classList.remove('is-on'); f.querySelector('[data-text]').textContent = ''; });
    this.when.classList.remove('is-on');
    this.cat.classList.remove('is-on');
    this.add.classList.add('is-off');
    this.add.classList.remove('is-down');
    c.querySelectorAll('.k-new').forEach((el) => el.remove());
    this.rows().forEach((el) => { el._dy = 0; el.style.transform = ''; });
    this.needs(2);
    this.p2.textContent = '3';
    c.classList.remove('on-voice');
    this.voiceRow.classList.remove('pick');
    this.voice.classList.remove('is-theirs', 'is-done');
    Object.values(this.cards).forEach((el) => el.classList.remove('is-on'));
    this.heard.textContent = '';
    this.vAdd.classList.add('is-off');
    this.vAdd.classList.remove('is-down');
    this.onPhase?.('voice');
    void c.offsetWidth;
    c.classList.remove('no-anim');
  }

  async typeInto(field, text, run) {
    field.classList.add('is-on');
    const out = field.querySelector('[data-text]');
    for (const ch of text) {
      await wait(ch === ' ' ? 70 : 95, run);
      out.textContent += ch;
    }
  }

  /** Just say it: the voice screen fills as she hears, and one tap adds it */
  async byVoice(run) {
    const c = this.canvas;
    await wait(1000, run);
    tapAt(c, this.voiceRow);
    this.voiceRow.classList.add('pick');
    await wait(380, run);
    c.classList.add('on-voice');
    await wait(900, run);
    const WORDS = [
      ['Anna', 'who'], ['owes'], ['me', 'kind'], ['$60', 'amount cat'], ['for'], ['the'],
      ['concert'], ['tickets', 'what'], ['by'], ['Friday', 'when'],
    ];
    for (const [w, keys] of WORDS) {
      this.heard.textContent = `${this.heard.textContent} ${w}`.trim();
      await wait(140, run);
      (keys || '').split(' ').filter(Boolean).forEach((k) => {
        if (k === 'kind') this.voice.classList.add('is-theirs');
        else this.cards[k].classList.add('is-on');
      });
      await wait(w === '$60' ? 420 : 140 + (w.length > 5 ? 60 : 0), run);
    }
    await wait(650, run);
    this.voice.classList.add('is-done');
    this.vAdd.classList.remove('is-off');
    await wait(2000, run);
    tapAt(c, this.vAdd);
    this.vAdd.classList.add('is-down');
    await wait(180, run);
    this.vAdd.classList.remove('is-down');
    // it goes straight to Today: the screen and the sheet leave together
    c.classList.add('is-closed');
    c.classList.remove('on-voice');
    await wait(520, run);
    const due = this.vDays === 0 ? '<span class="due today">Today</span>'
      : this.vDays === 1 ? '<span class="due soon">Tomorrow</span>' : '<span class="due">Fri</span>';
    const html = `<div class="loop-art"><img src="assets/art/answer-money-lent.webp" alt="" width="38" height="38"><span class="loop-badge"><svg><use href="#i-hourglass"/></svg></span></div><div class="loop-text"><div class="loop-top"><span class="loop-title">The concert tickets</span>${due}</div><div class="loop-meta">Anna · <b>$60</b></div></div>`;
    if (this.vDays === 0) { this.needs(3); this.land(512, html, false); }
    else { this.p2.textContent = '4'; this.land(754, html, false); }
  }

  /** by hand: My turn, the form, the category picker, Add */
  async byHand(run) {
    const c = this.canvas;
    await wait(2200, run);
    this.onPhase?.('hand');
    await wait(900, run);
    // the + opens the sheet again, on its first step
    tapAt(c, this.fab);
    c.classList.add('no-anim');
    this.voiceRow.classList.remove('pick');
    this.sheet.style.transform = `translateY(${this.low()}px)`;
    void c.offsetWidth;
    c.classList.remove('no-anim');
    await wait(120, run);
    c.classList.remove('is-closed');
    await wait(1100, run);
    tapAt(c, this.row);
    this.row.classList.add('pick');
    await wait(450, run);
    this.sheet.style.transform = 'translateY(0)';
    this.sheet.classList.add('on-form');
    await wait(800, run);
    await this.typeInto(this.what, 'Pay the electricity bill', run);
    this.add.classList.remove('is-off');
    await wait(600, run);
    this.what.classList.remove('is-on');
    await this.typeInto(this.who, 'Power company', run);
    await wait(700, run);
    this.who.classList.remove('is-on');
    // an amount: tap the link, the field appears, type it
    tapAt(c, this.addAmount);
    await wait(250, run);
    this.sheet.classList.add('has-amount');
    await wait(500, run);
    await this.typeInto(this.amount, '48', run);
    await wait(800, run);
    this.amount.classList.remove('is-on');
    tapAt(c, this.when);
    this.when.classList.add('is-on');
    await wait(1000, run);
    // the picker: View all opens it, Bills is chosen, Done closes it
    tapAt(c, this.viewAll);
    await wait(200, run);
    c.classList.add('on-picker');
    await wait(1300, run);
    tapAt(c, this.pick.querySelector('.cat-sq'));
    this.pick.classList.add('is-on');
    await wait(800, run);
    tapAt(c, this.done);
    await wait(200, run);
    c.classList.remove('on-picker');
    this.cat.classList.add('is-on');
    await wait(1200, run);
    tapAt(c, this.add);
    this.add.classList.add('is-down');
    await wait(180, run);
    this.add.classList.remove('is-down');
    c.classList.add('is-closed');
    await wait(450, run);
    // due today, so it heads Needs you today and the rest step down
    this.needs(Number(this.p1.textContent) + 1);
    this.land(512, '<div class="loop-art"><img src="assets/art/answer-bill-due.webp" alt="" width="38" height="38"><span class="loop-badge"><svg><use href="#i-hand"/></svg></span></div><div class="loop-text"><div class="loop-top"><span class="loop-title">Pay the electricity bill</span><span class="due today">Today</span></div><div class="loop-meta">Power company · <b>$48</b></div></div>', true);
  }

  async script(run) {
    await this.byVoice(run);
    await this.byHand(run);
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
