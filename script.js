'use strict';

// Content is visible without JavaScript. Motion is a progressive enhancement.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let revealObserver;

function revealAll() {
  revealObserver?.disconnect();
  document.querySelectorAll('.reveal-ready').forEach(element => {
    element.classList.add('is-visible');
  });
}

function setupReveals() {
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;
  const elements = document.querySelectorAll('.experience-item, .research-paper, .awards-layout');
  revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px 25px 0px' });
  for (const element of elements) {
    element.classList.add('reveal-ready');
    revealObserver.observe(element);
  }
}

motionPreference.addEventListener('change', event => {
  if (event.matches) revealAll();
});
window.addEventListener('beforeprint', revealAll);
document.getElementById('year').textContent = new Date().getFullYear();
setupReveals();
