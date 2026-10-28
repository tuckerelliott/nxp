import { createOptimizedPicture } from '../../scripts/aem.js';

const DATE_RE = /^([A-Z][a-z]{2,8}\.? \d{1,2}, \d{4})\s+(.+)$/;

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

/* link-only paragraphs become a row of pill buttons: first primary, rest outlined */
function decorateActions(body) {
  const ctas = [...body.querySelectorAll(':scope > p')].filter((p) => {
    const a = p.querySelector('a[href]');
    return a && !p.querySelector('picture') && p.textContent.trim() === a.textContent.trim();
  });
  if (!ctas.length) return;
  const actions = document.createElement('div');
  actions.className = 'cards-spotlight-actions';
  ctas[0].before(actions);
  ctas.forEach((p, i) => {
    const a = p.querySelector('a[href]');
    if (!a.classList.contains('button')) {
      a.className = `button ${i === 0 ? 'primary' : 'secondary'}`;
    }
    p.className = 'button-wrapper';
    actions.append(p);
  });
}

/* "Aug 27, 2026 14 min" -> "Aug 27, 2026 &nbsp; 14 min", spaced like the source */
function decorateMeta(body) {
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading || !heading.querySelector('a')) return; // only on linked list cards
  const meta = heading.nextElementSibling;
  if (!meta || meta.tagName !== 'P' || meta.classList.contains('button-wrapper')) return;
  meta.classList.add('cards-spotlight-meta');
  if (meta.children.length) return;
  const match = meta.textContent.trim().match(DATE_RE);
  if (match) meta.textContent = `${match[1]} \u00a0 ${match[2]}`;
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
        decorateActions(cell);
        decorateMeta(cell);
      }
      li.append(cell);
    });
    if (li.querySelector('.cards-spotlight-card-image')) li.classList.add('cards-spotlight-featured');
    else li.classList.add('cards-spotlight-item');
    ul.append(li);
  });

  // featured card(s) first, list items stacked beside them
  if (ul.querySelector('.cards-spotlight-featured')) {
    block.classList.add('cards-spotlight-has-featured');
    // list items pack at the top of the side column; the last row absorbs any slack
    const items = ul.querySelectorAll('.cards-spotlight-item').length;
    block.style.setProperty('--cards-spotlight-rows', items > 1 ? `repeat(${items - 1}, auto) 1fr` : '1fr');
  }
  optimizeImages(ul);
  block.replaceChildren(ul);
}
