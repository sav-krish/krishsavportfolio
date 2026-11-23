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
  wide.addEventListener('change', arrange);
  arrange();
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
  const elements = document.querySelectorAll('.xp, .edu, .certs li, .award, .research-paper, .fun li');
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
