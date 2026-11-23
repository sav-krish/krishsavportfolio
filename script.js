'use strict';

// Content is fully visible without JavaScript. Everything here is a progressive enhancement.
document.documentElement.classList.remove('no-js');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector('.site-header');
const nav = document.getElementById('site-nav');
const toggle = document.querySelector('.menu-toggle');
let revealObserver;

// Mobile menu
function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
document.addEventListener('click', event => { if (!header.contains(event.target)) setMenu(false); });
window.matchMedia('(min-width: 821px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

// Experience: alternate roles left and right of the spine on wide screens
const timeline = document.querySelector('.timeline');
if (timeline) {
  const left = timeline.querySelector('.tl-left');
  const right = timeline.querySelector('.tl-right');
  const roles = [...left.children];
  const wide = window.matchMedia('(min-width: 821px)');
  const arrange = () => {
    roles.forEach((role, index) => (wide.matches && index % 2 ? right : left).appendChild(role));
    timeline.classList.toggle('is-split', wide.matches);
  };
  // Keep the spine dots from touching when cards on both sides line up
  const MIN_GAP = 18;
  const spaceDots = () => {
    roles.forEach(role => role.style.removeProperty('--dot-shift'));
    if (!timeline.classList.contains('is-split')) return;
    const dots = roles.map(role => ({ role, y: role.getBoundingClientRect().top })).sort((a, b) => a.y - b.y);
    let previous = -Infinity;
    for (const dot of dots) {
      const placed = Math.max(dot.y, previous + MIN_GAP);
      if (placed !== dot.y) dot.role.style.setProperty('--dot-shift', `${Math.round(placed - dot.y)}px`);
      previous = placed;
    }
  };
  let spacing = 0;
  const scheduleSpacing = () => { cancelAnimationFrame(spacing); spacing = requestAnimationFrame(spaceDots); };
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleSpacing);
    roles.forEach(role => observer.observe(role));
  }
  wide.addEventListener('change', () => { arrange(); scheduleSpacing(); });
  arrange();
  scheduleSpacing();
}

// Header border once the page scrolls
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Gentle reveal on scroll
function revealAll() {
  revealObserver?.disconnect();
  document.querySelectorAll('.reveal-ready').forEach(element => element.classList.add('is-visible'));
}

function setupReveals() {
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;
  const elements = document.querySelectorAll('.xp, .edu, .certs li, .award, .research-paper, .projects li, .fun li');
  revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.06, rootMargin: '0px 0px 25px 0px' });
  for (const element of elements) {
    element.classList.add('reveal-ready');
    revealObserver.observe(element);
  }
}

motionPreference.addEventListener('change', event => { if (event.matches) revealAll(); });
window.addEventListener('beforeprint', () => {
  revealAll();
  document.querySelectorAll('details.xp-card').forEach(card => { card.open = true; });
});
document.getElementById('year').textContent = new Date().getFullYear();
setupReveals();

// Scroll companion: a soccer ball that rests on the top edge of the highest box on screen.
// Scroll past that box and the ball drops onto the next one; scroll back and it hops up.
// Opening a role makes it bounce onto that card. Clicking the ball returns to the top.
function setupBall() {
  const ball = document.querySelector('.ball-runner');
  if (!ball || motionPreference.matches) return;
  ball.hidden = false;
  const sprite = ball.querySelector('img');
  const hero = document.querySelector('.hero');
  const ledgeSelector = '.xp-card, .logo-ut, .chips li, .certs a, .award, .paper-art, .project, .fun-item';
  const GRAVITY = 2600;      // px/s²
  const RESTITUTION = 0.42;  // share of speed kept per bounce
  const INSET = 34;          // distance from a box's right edge

  let ledges = [];
  let target = null;
  let pinned = null;         // card the user just opened
  let pinnedAt = 0;
  let x = 0, y = 0, vx = 0, vy = 0, angle = 0, squash = 0;
  let flying = false, visible = false, frame = 0, last = 0, settleUntil = 0;

  const size = () => ball.offsetWidth;
  const collect = () => { ledges = [...document.querySelectorAll(ledgeSelector)]; };

  // Resting spot on top of a box, in document coordinates
  const spot = el => {
    const r = el.getBoundingClientRect();
    const s0 = size();
    const left = r.width > s0 + INSET * 2 ? r.right - INSET - s0 : r.left + (r.width - s0) / 2;
    return { x: left + window.scrollX, y: r.top + window.scrollY - s0 };
  };

  const pickTarget = () => {
    const headerBottom = header.getBoundingClientRect().bottom;
    if (pinned) {
      const r = pinned.getBoundingClientRect();
      if (Math.abs(window.scrollY - pinnedAt) < 220 && r.top > headerBottom && r.top < innerHeight) return pinned;
      pinned = null;
    }
    let best = null, bestTop = Infinity;
    for (const el of ledges) {
      const r = el.getBoundingClientRect();
      if (!r.width || r.top <= headerBottom + 12 || r.top > innerHeight - 40) continue;
      if (r.top < bestTop - 0.5) { best = el; bestTop = r.top; }
    }
    return best;
  };

  const launch = () => {
    const s = spot(target);
    const s0 = size();
    if (!visible || Math.abs(s.y - y) > innerHeight * 1.5) {
      x = s.x; y = Math.max(window.scrollY + header.offsetHeight - s0, s.y - 180); angle = 0;
    }
    const apex = Math.min(y, s.y) - (s.y < y ? 60 : 22);
    vy = -Math.sqrt(2 * GRAVITY * Math.max(1, y - apex));
    const tUp = -vy / GRAVITY;
    const tDown = Math.sqrt(2 * Math.max(1, s.y - apex) / GRAVITY);
    vx = (s.x - x) / (tUp + tDown);
    flying = true;
    if (!frame) { last = performance.now(); frame = requestAnimationFrame(step); }
  };

  const render = () => {
    ball.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    const k = 0.16 * squash;
    sprite.style.transform = `scale(${1 + k}, ${1 - k}) rotate(${angle.toFixed(3)}rad)`;
  };

  function step(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    const s = target ? spot(target) : { x, y };
    if (flying) {
      x += vx * dt;
      vy += GRAVITY * dt;
      y += vy * dt;
      angle += (vx * dt) / (size() / 2);
      if (vy > 0 && y >= s.y) {
        y = s.y;
        x = s.x;
        vy = -vy * RESTITUTION;
        vx = 0;
        squash = 1;
        if (Math.abs(vy) < 140) { flying = false; vy = 0; vx = 0; settleUntil = now + 900; }
      }
    } else {
      // Glued to its box, which can move when cards open or reveal
      const dx = s.x - x;
      x = s.x; y = s.y;
      angle += dx / (size() / 2);
    }
    squash = Math.max(0, squash - dt * 7);
    render();
    if (flying || squash > 0 || now < settleUntil) frame = requestAnimationFrame(step);
    else frame = 0;
  }

  const update = () => {
    const show = window.scrollY > hero.offsetTop + hero.offsetHeight * 0.55;
    if (!show) { visible = false; ball.classList.remove('is-on'); target = null; return; }
    const next = pickTarget();
    if (!next) return;
    if (next !== target || !visible) { target = next; launch(); }
    else if (!flying) { const s = spot(target); x = s.x; y = s.y; render(); }
    if (!visible) { visible = true; ball.classList.add('is-on'); }
  };

  let ticking = false;
  const onMove = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
  };

  collect();
  window.addEventListener('scroll', onMove, { passive: true });
  window.addEventListener('resize', () => { collect(); onMove(); });
  document.querySelectorAll('details.xp-card').forEach(card => {
    card.addEventListener('toggle', () => {
      if (!card.open) return;
      pinned = card; pinnedAt = window.scrollY;
      if (visible) { target = card; launch(); } else onMove();
    });
  });
  ball.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  onMove();
}
setupBall();
