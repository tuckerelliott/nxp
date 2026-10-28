/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-overlap.
 * Source: https://www.nxp.com/ corporate cards (div.market-card.band-absolute).
 * Block: one row per card; cell 1 = image, cell 2 = H3 title, paragraph, 1-2 CTA links.
 */
export default function parse(element, { document }) {
  const cells = [];
  const items = [...element.querySelectorAll('section.product-list-item')];

  items.forEach((item) => {
    const imageCell = [];
    const media = item.querySelector('.product-list-media') || item;
    const imgs = [...media.querySelectorAll('img')];
    const img = imgs.find((i) => {
      const src = i.getAttribute('src') || '';
      return src && !src.startsWith('data:');
    }) || imgs[0];
    if (img) {
      const ds = img.getAttribute('data-src');
      if (ds && !ds.startsWith('data:')) img.setAttribute('src', ds);
      // source uses the placeholder alt "img"; it carries no meaning
      if ((img.getAttribute('alt') || '').trim().toLowerCase() === 'img') img.setAttribute('alt', '');
      imageCell.push(img);
    }

    const content = [];
    const title = item.querySelector('.product-list-title, h3');
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title.textContent.trim();
      content.push(h3);
    }
    const desc = item.querySelector('.product-list-description');
    if (desc) {
      desc.querySelectorAll(':scope > p').forEach((p) => {
        if (p.textContent.trim()) content.push(p);
      });
      desc.querySelectorAll('ul a[href]').forEach((a) => {
        const p = document.createElement('p');
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = a.textContent.trim();
        p.append(link);
        content.push(p);
      });
    }

    cells.push([imageCell, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-overlap', cells });
  element.replaceWith(block);
}
