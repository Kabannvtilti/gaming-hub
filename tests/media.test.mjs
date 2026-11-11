import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../js/media.js', import.meta.url), 'utf8');
function setup({ reduced = false, missing = [] } = {}) {
  const listeners = new Map();
  const make = () => ({ disabled: true, hidden: true, textContent: '', attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    addEventListener(k, fn) { this.events ??= {}; this.events[k] = fn; } });
  const toggle = make(), status = make(), text = make(), slider = make();
  slider.querySelector = () => ({});
  slider.contains = (el) => el === slider;
  const motion = { matches: reduced, addEventListener: (_, fn) => listeners.set('motion', fn) };
  const document = { hidden: false, activeElement: null,
    getElementById: (id) => ({ 'motion-toggle': toggle, 'media-status': status, 'typed-text': text }[id]),
    querySelector: () => slider,
    addEventListener: (name, fn) => listeners.set(name, fn) };
  const instances = {};
  class Swiper {
    constructor(_, options) { this.params = options; this.autoplay = {
      running: true, start() { this.running = true; }, stop() { this.running = false; },
    }; instances.swiper = this; }
  }
  class Typed {
    constructor(_, options) { this.options = options; this.running = true; instances.typed = this; }
    stop() { this.running = false; }
    start() { this.running = true; }
    destroy() { this.destroyed = true; this.running = false; }
  }
  const Fancybox = { bind(_, options) { instances.fancybox = options; }, getInstance: () => null };
  const context = { document, window: { matchMedia: () => motion }, queueMicrotask: fn => fn() };
  for (const [key, value] of Object.entries({ Swiper, Typed, Fancybox })) if (!missing.includes(key)) context[key] = value;
  vm.runInNewContext(source, context);
  listeners.get('DOMContentLoaded')();
  return { toggle, status, text, slider, motion, document, listeners, instances };
}

test('CDN components use required breakpoints, loop and a 3500 ms interval', () => {
  const { instances } = setup(); const p = instances.swiper.params;
  assert.equal(p.loop, true); assert.equal(p.autoplay.delay, 3500);
  assert.equal(p.autoplay.pauseOnMouseEnter, true);
  assert.equal(p.breakpoints[320].slidesPerView, 1);
  assert.equal(p.breakpoints[768].slidesPerView, 2);
  assert.equal(p.breakpoints[1024].slidesPerView, 3);
  assert.equal(instances.fancybox.Carousel.transition, 'fade');
  assert.equal(instances.fancybox.Images.Panzoom.maxScale, 3);
});
test('one control pauses both animations and resumes them', () => {
  const { toggle, instances } = setup(); toggle.events.click();
  assert.equal(instances.swiper.autoplay.running, false); assert.equal(instances.typed.running, false);
  assert.equal(toggle.attrs['aria-pressed'], 'true'); toggle.events.click();
  assert.equal(instances.swiper.autoplay.running, true); assert.equal(instances.typed.running, true);
});
test('leaving slider hover cannot undo a manual pause', () => {
  const { slider, toggle, instances } = setup();
  slider.events.mouseenter(); assert.equal(instances.swiper.autoplay.running, false);
  toggle.events.click(); slider.events.mouseleave(); assert.equal(instances.swiper.autoplay.running, false);
});
test('keyboard focus pauses slider until focus leaves it', () => {
  const { slider, document, instances } = setup(); slider.events.focusin();
  assert.equal(instances.swiper.autoplay.running, false);
  document.activeElement = null; slider.events.focusout(); assert.equal(instances.swiper.autoplay.running, true);
});
test('hidden page pauses autoplay and typing', () => {
  const { document, listeners, instances } = setup(); document.hidden = true; listeners.get('visibilitychange')();
  assert.equal(instances.swiper.autoplay.running, false); assert.equal(instances.typed.running, false);
  document.hidden = false; listeners.get('visibilitychange')(); assert.equal(instances.swiper.autoplay.running, true);
});
test('reduced motion starts with no typing or autoplay', () => {
  const { instances, toggle } = setup({ reduced: true });
  assert.equal(instances.typed, undefined); assert.equal(instances.swiper.autoplay.running, false);
  assert.equal(instances.swiper.params.speed, 0); assert.equal(toggle.disabled, true);
});
test('changing reduced motion destroys typing and restores stable text', () => {
  const { motion, listeners, instances, text } = setup();
  motion.matches = true; listeners.get('motion')();
  assert.equal(instances.typed.destroyed, true); assert.equal(text.textContent, 'Знаходь команду.');
});
test('all unavailable CDNs leave readable fallback instead of throwing', () => {
  const { status, toggle } = setup({ missing: ['Swiper', 'Fancybox', 'Typed'] });
  assert.equal(status.hidden, false); assert.match(status.textContent, /Відгуки доступні як картки/);
  assert.equal(toggle.disabled, true);
});
for (const library of ['Swiper', 'Fancybox', 'Typed']) test(`missing ${library} does not block the other components`, () => {
  const { instances, status } = setup({ missing: [library] }); assert.equal(status.hidden, false);
  if (library !== 'Swiper') assert.ok(instances.swiper);
  if (library !== 'Typed') assert.ok(instances.typed);
  if (library !== 'Fancybox') assert.ok(instances.fancybox);
});
