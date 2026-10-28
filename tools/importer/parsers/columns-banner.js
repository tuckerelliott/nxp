/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-banner.
 * Source: https://www.nxp.com/ market-card banners.
 *  - registration banner (div.listed-columns + div.market-card): text | image
 *  - careers banner (div.market-card.mb3, .primary-topic-item.is-reversed): image | text
 * Block: one row, two cells in visual order; text cell = heading, paragraph(s), CTA link;
 * image cell = single image.
 */
export default function parse(element, { document }) {
  const item = element.querySelector('.primary-topic-item') || element;
  const contentEl = item.querySelector('.primary-topic-content') || item;
  const mediaEl = item.querySelector('.primary-topic-media');

  // text cell
  const textCell = [];
  const heading = contentEl.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    const h = document.createElement(heading.tagName.toLowerCase());
    h.textContent = heading.textContent.trim();
    textCell.push(h);
  }
  const textWrap = contentEl.querySelector('.primary-topic-text');
  if (textWrap) {
    textWrap.querySelectorAll('p').forEach((p) => {
      if (p.textContent.trim()) textCell.push(p);
    });
  }
  const ctas = [...contentEl.querySelectorAll('.primary-topic-link a[href], ul a.btn[href]')];
  ctas.forEach((a) => {
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    p.append(link);
    textCell.push(p);
  });

  // image cell
  const imageCell = [];
  if (mediaEl) {
    const imgs = [...mediaEl.querySelectorAll('img')];
    const img = imgs.find((i) => {
      const src = i.getAttribute('src') || '';
      return src && !src.startsWith('data:');
    }) || imgs[0];
    if (img) {
      const ds = img.getAttribute('data-src');
      if (ds && !ds.startsWith('data:')) img.setAttribute('src', ds);
      imageCell.push(img);
    }
  }

  // visual order: is-reversed renders the media column first
  const imageFirst = item.classList && item.classList.contains('is-reversed');
  const cells = [imageFirst ? [imageCell, textCell] : [textCell, imageCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-banner', cells });
  element.replaceWith(block);
}
