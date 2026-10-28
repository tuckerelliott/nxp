import { createOptimizedPicture } from '../../scripts/aem.js';

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

function markEyebrow(body) {
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) return;
  const first = body.firstElementChild;
  if (first && first !== heading && first.tagName === 'P' && !first.querySelector('a, picture')) {
    first.classList.add('cards-spotlight-eyebrow');
  }
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-spotlight-card';
    [...row.children].forEach((cell) => {
      const hasPicture = !!cell.querySelector('picture');
      if (!hasPicture && !cell.textContent.trim()) return; // empty image cell on list cards
      if (hasPicture && cell.textContent.trim() === '') {
        cell.className = 'cards-spotlight-card-image';
      } else {
        cell.className = 'cards-spotlight-card-body';
        markEyebrow(cell);
      }
      li.append(cell);
    });
    if (li.querySelector('.cards-spotlight-card-image')) li.classList.add('cards-spotlight-featured');
    else li.classList.add('cards-spotlight-item');
    ul.append(li);
  });

  // featured card(s) first, list items stacked beside them
  if (ul.querySelector('.cards-spotlight-featured')) block.classList.add('cards-spotlight-has-featured');
  optimizeImages(ul);
  block.replaceChildren(ul);
}
