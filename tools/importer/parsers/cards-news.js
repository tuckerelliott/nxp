/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news.
 * Source: https://www.nxp.com/ "What's new" list (div.whats-new-list).
 * Block: one row per item; cell 1 = article image (placeholder and NXP logo overlay dropped),
 * cell 2 = optional eyebrow p, H3 linked title, date p, "By" author link p.
 */
export default function parse(element, { document }) {
  const cells = [];
  const items = [...element.querySelectorAll(':scope > .whats-new-item')];

  items.forEach((item) => {
    // image: the real article image is img.img-responsive; the first img is a shared
    // placeholder and .overlay-image holds a decorative logo overlay
    const imageCell = [];
    const fig = item.querySelector('.whats-new-img');
    if (fig) {
      const candidates = [...fig.querySelectorAll('img')].filter((i) => !i.closest('.overlay-image'));
      const img = candidates.find((i) => i.classList.contains('img-responsive'))
        || candidates[candidates.length - 1];
      if (img) {
        const ds = img.getAttribute('data-src');
        if (ds && !ds.startsWith('data:')) img.setAttribute('src', ds);
        imageCell.push(img);
      }
    }

    const content = [];
    const body = item.querySelector('.whats-new-content') || item;

    // eyebrow: signpost text, or the "Step Forward" impact label
    const signpost = body.querySelector('.item-signpost');
    let eyebrow = signpost ? signpost.textContent.trim() : '';
    if (!eyebrow) {
      const label = body.querySelector(':scope > a.link-simple .impact-label, :scope > .impact-label');
      if (label) eyebrow = label.textContent.trim();
    }
    if (eyebrow) {
      const p = document.createElement('p');
      p.textContent = eyebrow;
      content.push(p);
    }

    const title = body.querySelector('.whats-new-title');
    if (title) {
      const h3 = document.createElement('h3');
      const a = title.querySelector('a[href]');
      const text = (a || title).textContent.replace(/\s+/g, ' ').trim();
      if (a && a.getAttribute('href')) {
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = text;
        h3.append(link);
      } else {
        h3.textContent = text;
      }
      content.push(h3);
    }

    body.querySelectorAll('.whats-new-description ul.metadata > li').forEach((li) => {
      const p = document.createElement('p');
      const a = li.querySelector('a');
      if (a) {
        const prefix = [...li.childNodes]
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (prefix) p.append(`${prefix} `);
        const name = a.textContent.trim();
        const href = a.getAttribute('href');
        if (href) {
          const link = document.createElement('a');
          link.href = href;
          link.textContent = name;
          p.append(link);
        } else {
          p.append(name);
        }
      } else {
        p.textContent = li.textContent.replace(/\s+/g, ' ').trim();
      }
      if (p.textContent.trim()) content.push(p);
    });

    cells.push([imageCell, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
