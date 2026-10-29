import { createOptimizedPicture } from '../../scripts/aem.js';

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

/**
 * Collects link-only paragraphs of a card body into one CTA row.
 * Source styling: first CTA is the outlined gradient-border pill (global `button secondary`),
 * any further CTA is the black pill (global `button accent`).
 * Links an author already formatted as buttons keep their classes.
 * @param {Element} body card body cell
 */
function decorateActions(body) {
  const linkParas = [...body.children].filter((el) => {
    if (el.tagName !== 'P') return false;
    const links = el.querySelectorAll('a[href]');
    return links.length === 1 && el.textContent.trim() === links[0].textContent.trim();
  });
  if (!linkParas.length) return;

  const actions = document.createElement('div');
  actions.className = 'cards-overlap-card-actions';
  linkParas[0].before(actions);
  linkParas.forEach((p, i) => {
    const a = p.querySelector('a[href]');
    if (!a.classList.contains('button')) {
      a.className = `button ${i === 0 ? 'secondary' : 'accent'}`;
    }
    actions.append(a);
    p.remove();
  });
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture')) return;
    const li = document.createElement('li');
    li.className = 'cards-overlap-card';
    [...row.children].forEach((cell) => {
      const hasPicture = !!cell.querySelector('picture');
      if (!hasPicture && !cell.textContent.trim()) return;
      if (hasPicture && cell.textContent.trim() === '') {
        cell.className = 'cards-overlap-card-image';
      } else {
        cell.className = 'cards-overlap-card-body';
        decorateActions(cell);
      }
      li.append(cell);
    });
    ul.append(li);
  });
  optimizeImages(ul);
  block.replaceChildren(ul);
}
