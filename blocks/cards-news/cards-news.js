import { createOptimizedPicture } from '../../scripts/aem.js';

// NXP "Step Forward" series teasers render as dark impact cards on the source
const IMPACT_EYEBROW = /^step forward$/i;

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

function decorateBody(body, card) {
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) return;
  heading.classList.add('cards-news-title');
  // paragraph before the heading is the optional type eyebrow
  const prev = heading.previousElementSibling;
  if (prev && prev.tagName === 'P' && !prev.querySelector('picture')) {
    prev.classList.add('cards-news-eyebrow');
    if (IMPACT_EYEBROW.test(prev.textContent.trim())) card.classList.add('cards-news-card-impact');
  }
  // paragraphs after the heading are meta lines (date, author), flowed inline like the source list
  const metas = [];
  let el = heading.nextElementSibling;
  while (el) {
    if (el.tagName === 'P') {
      el.classList.add('cards-news-meta');
      metas.push(el);
    }
    el = el.nextElementSibling;
  }
  if (metas.length) {
    const list = document.createElement('div');
    list.className = 'cards-news-meta-list';
    metas[0].before(list);
    list.append(...metas);
  }
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-news-card';
    [...row.children].forEach((cell) => {
      const hasPicture = !!cell.querySelector('picture');
      if (!hasPicture && !cell.textContent.trim()) return;
      if (hasPicture && cell.textContent.trim() === '') {
        cell.className = 'cards-news-card-image';
      } else {
        cell.className = 'cards-news-card-body';
        decorateBody(cell, li);
      }
      li.append(cell);
    });
    ul.append(li);
  });
  optimizeImages(ul);
  block.replaceChildren(ul);
}
