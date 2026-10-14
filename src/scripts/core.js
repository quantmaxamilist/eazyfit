// EazyFit core: smooth scroll, reveals, cursor, magnetics, page transitions, menu, ticker pause.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
// Mobile URL-bar show/hide must not re-measure every trigger; 'load' is dropped so a late refresh never jumps.
ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,DOMContentLoaded,resize' });

const html = document.documentElement;
const mq = (q) => matchMedia(q).matches;
export const reduced = mq('(prefers-reduced-motion: reduce)');
const fine = mq('(hover: hover) and (pointer: fine)');

// ---- Lenis ---------------------------------------------------------------------
export const lenis = reduced ? null : new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
if (import.meta.env.DEV) window.__ez = { lenis, gsap, ScrollTrigger };

const scrollToEl = (el) => {
  if (lenis) lenis.scrollTo(el, { duration: 1.1, offset: 0 });
  else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
};
let closeMenu = null;
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const url = new URL(a.href, location.href);
  if (url.pathname === location.pathname && url.search === location.search && url.hash.length > 1) {
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    closeMenu?.();
    scrollToEl(el);
    history.replaceState(null, '', url.hash);
  }
});

// ---- Cursor (24px ring / 6px dot, 40px on links; fine pointers only) -------------
const cursor = document.getElementById('cursor');
if (fine && !reduced && cursor) {
  html.classList.add('has-cursor');
  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'none' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'none' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3.out' });
  cursor.classList.add('is-off');
  let last = null;
  const update = (t) => {
    if (t === last) return;
    last = t;
    let state = '';
    if (t?.closest?.('a, button, label, [role="button"], summary, [data-cursor]')) state = 'link';
    if (t?.closest?.('input:not([type="checkbox"]), textarea, select')) state = 'hide';
    cursor.dataset.state = state;
    const th = t?.closest?.('[data-cursor-theme], .light, .dark');
    cursor.dataset.theme = th?.dataset?.cursorTheme || (th?.classList.contains('light') ? 'light' : 'dark');
  };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    cursor.classList.remove('is-off');
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    update(e.target);
  }, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.add('is-off'));
  addEventListener('scroll', () => { last = null; }, { passive: true });
}

// ---- Magnetic buttons -------------------------------------------------------------
if (fine && !reduced) {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const xT = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yT = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    let r = null;
    el.addEventListener('pointerenter', () => { r = el.getBoundingClientRect(); });
    el.addEventListener('pointermove', (e) => {
      if (!r) r = el.getBoundingClientRect();
      xT((e.clientX - (r.left + r.width / 2)) * 0.25);
      yT((e.clientY - (r.top + r.height / 2)) * 0.3);
    });
    el.addEventListener('pointerleave', () => { r = null; gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)', overwrite: true }); });
  });
}

// ---- Page transitions (out ≤0.3s, in ≤0.38s; never wait on fonts, images or WebGL) ----
const pt = document.getElementById('pt');
const ptMark = pt?.querySelector('img');
try { sessionStorage.removeItem('ez:pt'); } catch { /* ignore */ }
const arrive = () => new Promise((res) => {
  if (!pt || !html.classList.contains('pt-arrive')) return res();
  const done = () => { html.classList.remove('pt-arrive'); gsap.set([pt, ptMark], { clearProps: 'all' }); res(); };
  if (reduced) return gsap.to(pt, { opacity: 0, duration: 0.12, onComplete: done });
  gsap.timeline({ onComplete: done })
    .call(res, null, 0.14)
    .to(ptMark, { opacity: 0, duration: 0.15 }, 0)
    .fromTo(pt, { clipPath: 'inset(0% 0 0% 0)' }, { clipPath: 'inset(0% 0 100% 0)', duration: 0.38, ease: 'power3.inOut' }, 0);
});
export const arrived = arrive();

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || !pt || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.dataset.noTransition !== undefined) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || !/^https?:/.test(url.protocol)) return;
  if (url.pathname === location.pathname && url.search === location.search) return;
  e.preventDefault();
  const go = () => {
    try { sessionStorage.setItem('ez:pt', '1'); } catch { /* ignore */ }
    location.href = url.href;
  };
  pt.style.visibility = 'visible';
  if (reduced) return gsap.fromTo(pt, { clipPath: 'inset(0)', opacity: 0 }, { opacity: 1, duration: 0.12, onComplete: go });
  gsap.set(ptMark, { opacity: 0, scale: 0.9 });
  gsap.timeline({ onComplete: go })
    .fromTo(pt, { clipPath: 'inset(100% 0 0% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 0.3, ease: 'power3.inOut' })
    .to(ptMark, { opacity: 1, scale: 1, duration: 0.15 }, 0.12);
});
addEventListener('pageshow', (e) => {
  if (e.persisted && pt) { html.classList.remove('pt-arrive'); gsap.killTweensOf(pt); gsap.set([pt, ptMark], { clearProps: 'all' }); }
});

// ---- Mobile menu ------------------------------------------------------------------
const menu = document.getElementById('menu');
const openBtn = document.querySelector('[data-menu-open]');
if (menu && openBtn) {
  const focusables = () => [...menu.querySelectorAll('a[href], button:not([disabled])')];
  const rows = [...menu.querySelectorAll('.menu__nav li')];
  const open = () => {
    menu.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    lenis?.stop();
    document.body.style.overflow = 'hidden';
    if (!reduced) {
      gsap.fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, ease: 'power3.inOut' });
      gsap.fromTo(rows, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.04, delay: 0.2 });
    }
    requestAnimationFrame(() => focusables()[0]?.focus());
  };
  closeMenu = () => {
    if (menu.hidden) return;
    openBtn.setAttribute('aria-expanded', 'false');
    lenis?.start();
    document.body.style.overflow = '';
    const done = () => { menu.hidden = true; gsap.set(menu, { clearProps: 'clipPath' }); };
    if (reduced) done();
    else gsap.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.35, ease: 'power3.inOut', onComplete: done });
    openBtn.focus();
  };
  openBtn.addEventListener('click', open);
  menu.querySelector('[data-menu-close]')?.addEventListener('click', () => closeMenu());
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
    if (e.key !== 'Tab') return;
    const f = focusables(); const first = f[0]; const lastEl = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
    else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
  });
  addEventListener('resize', () => { if (innerWidth >= 1200) closeMenu(); });
  addEventListener('pageshow', (e) => {
    if (!e.persisted || menu.hidden) return;
    menu.hidden = true; gsap.set(menu, { clearProps: 'clipPath' });
    openBtn.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; lenis?.start();
  });
}

// ---- Ticker: pause when off screen ---------------------------------------------------
const tio = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-paused', !e.isIntersecting)));
document.querySelectorAll('[data-ticker]').forEach((t) => tio.observe(t));

// ---- Reveals (transform + opacity only, ≤0.8s, start at top 92%) ----------------------
const revealOne = (el) => {
  if (el.dataset.revealed) return;
  el.dataset.revealed = '1';
  const delay = +(el.dataset.delay || 0);
  if (el.dataset.reveal === 'lines') {
    gsap.to(el.querySelectorAll('.line > span'), { y: 0, yPercent: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07, delay });
  } else {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', delay });
  }
};
const initReveals = () => {
  const els = [...document.querySelectorAll('[data-reveal]')];
  if (reduced) return;
  els.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) revealOne(el);
    else ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => revealOne(el) });
  });
  // Sweep: a fast scroll or a jump link never leaves anything above the fold hidden.
  const sweep = () => { for (const el of els) if (!el.dataset.revealed && el.getBoundingClientRect().top < innerHeight) revealOne(el); };
  if (lenis) lenis.on('scroll', sweep); else addEventListener('scroll', sweep, { passive: true });
};
arrived.then(() => { initReveals(); document.dispatchEvent(new CustomEvent('ez:ready')); });

let measuredH = 0;
ScrollTrigger.addEventListener('refresh', () => { measuredH = document.documentElement.scrollHeight; });
const refreshIfChanged = () => { if (document.documentElement.scrollHeight !== measuredH) ScrollTrigger.refresh(); };
document.fonts?.ready.then(refreshIfChanged);
if (document.readyState === 'complete') refreshIfChanged(); else addEventListener('load', refreshIfChanged, { once: true });
