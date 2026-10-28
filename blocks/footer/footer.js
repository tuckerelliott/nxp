const ROTATE_MS = 5000;

/**
 * Fetches the footer fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<Element|null>} wrapper element holding the footer sections
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  return wrapper;
}

/**
 * Builds the rotating news strip: a label paragraph followed by a list of items.
 * @param {Element} section news section from the fragment
 */
function decorateNews(section) {
  section.className = 'footer-news';
  const label = section.querySelector(':scope > p');
  const list = section.querySelector(':scope > ul');
  if (!list) return;
  if (label) label.classList.add('footer-news-label');
  list.classList.add('footer-news-list');
  const items = [...list.children];
  items.forEach((li, i) => {
    li.classList.add('footer-news-item');
    if (label) li.prepend(label.cloneNode(true));
    if (i === 0) li.classList.add('active');
  });
  if (label) label.remove();

  if (items.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let current = 0;
  let paused = false;
  section.addEventListener('mouseenter', () => { paused = true; });
  section.addEventListener('mouseleave', () => { paused = false; });
  section.addEventListener('focusin', () => { paused = true; });
  section.addEventListener('focusout', () => { paused = false; });
  setInterval(() => {
    if (paused) return;
    items[current].classList.remove('active');
    current = (current + 1) % items.length;
    items[current].classList.add('active');
  }, ROTATE_MS);
}

/**
 * Decorates a links row: first list is the primary links, a list of image links is social.
 * @param {Element} section links section from the fragment
 */
function decorateLinks(section) {
  section.className = 'footer-links';
  section.querySelectorAll(':scope > ul').forEach((ul) => {
    const isSocial = [...ul.querySelectorAll('a')].every((a) => a.querySelector('img'));
    ul.classList.add(isSocial ? 'footer-social' : 'footer-primary');
    if (isSocial) {
      ul.querySelectorAll('a').forEach((a) => {
        const img = a.querySelector('img');
        a.setAttribute('aria-label', img.alt);
      });
    }
  });
}

/**
 * Decorates the legal row: link list plus copyright paragraph.
 * @param {Element} section legal section from the fragment
 */
function decorateLegal(section) {
  section.className = 'footer-bottom';
  const list = section.querySelector(':scope > ul');
  if (list) list.classList.add('footer-legal');
  section.querySelectorAll(':scope > p').forEach((p) => p.classList.add('footer-copyright'));
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  const [news, brand, links, legal] = [...fragment.children];
  if (news) {
    decorateNews(news);
    inner.append(news);
  }
  if (brand) {
    brand.className = 'footer-brand';
    inner.append(brand);
  }
  if (links) {
    decorateLinks(links);
    inner.append(links);
  }
  if (legal) {
    decorateLegal(legal);
    inner.append(legal);
  }
  block.append(inner);
}
