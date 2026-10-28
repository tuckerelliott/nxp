/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-spotlight.
 * Source: https://www.nxp.com/ spotlight (div.card1-list.has-three.is-tertiary).
 * Block: one row per card; cell 1 = image (featured card only, empty for list cards),
 * cell 2 = eyebrow p, H3 title (linked on list cards), description/meta, CTA links.
 */
export default function parse(element, { document }) {
  const cells = [];

  const realImg = (scope) => {
    const imgs = [...scope.querySelectorAll('img')];
    const img = imgs.find((i) => {
      const src = i.getAttribute('src') || '';
      return src && !src.startsWith('data:');
    }) || imgs[0];
    if (img) {
      const ds = img.getAttribute('data-src');
      if (ds && !ds.startsWith('data:')) img.setAttribute('src', ds);
    }
    return img;
  };

  const textP = (text) => {
    const p = document.createElement('p');
    p.textContent = text.replace(/\s+/g, ' ').trim();
    return p;
  };

  // featured card(s): div.card1-item inside the wide column
  element.querySelectorAll('.card1-column.is-two .card1-item').forEach((item) => {
    const imageCell = [];
    const fig = item.querySelector('.card1-image') || item;
    const img = realImg(fig);
    if (img) imageCell.push(img);

    const content = [];
    const eyebrow = item.querySelector('.item-signpost');
    if (eyebrow && eyebrow.textContent.trim()) content.push(textP(eyebrow.textContent));
    const title = item.querySelector('.primary-card-title, .card1-title');
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title.textContent.trim();
      content.push(h3);
    }
    const text = item.querySelector('.primary-card-text');
    if (text) {
      const ps = [...text.querySelectorAll('p')];
      if (ps.length) content.push(...ps);
      else if (text.textContent.trim()) content.push(textP(text.textContent));
    }
    item.querySelectorAll('.primary-card-link a[href]').forEach((a) => {
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent.trim();
      p.append(link);
      content.push(p);
    });

    cells.push([imageCell, content]);
  });

  // list cards: a.card1-item.card1-action in the narrow column
  element.querySelectorAll(':scope > .card1-column:not(.is-two) .card1-item').forEach((item) => {
    const href = item.tagName === 'A' ? item.getAttribute('href') : (item.querySelector('a[href]') || {}).getAttribute?.('href');
    const content = [];
    const eyebrow = item.querySelector('.item-signpost');
    if (eyebrow && eyebrow.textContent.trim()) content.push(textP(eyebrow.textContent));
    const title = item.querySelector('.card1-title, h3');
    if (title) {
      const h3 = document.createElement('h3');
      if (href) {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = title.textContent.trim();
        h3.append(link);
      } else {
        h3.textContent = title.textContent.trim();
      }
      content.push(h3);
    }
    const meta = item.querySelector('.card1-header > p, p.text-muted');
    if (meta && meta.textContent.trim()) content.push(textP(meta.textContent));

    cells.push(['', content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-spotlight', cells });
  element.replaceWith(block);
}
