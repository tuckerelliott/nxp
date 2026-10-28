/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-showcase.
 * Source: https://www.nxp.com/ applications tabs (div.applications-tabs > div.bd-body).
 * Tab labels come from the sibling div.bd-header (ul.bd-toggle li a); bd-header is
 * removed later by the cleanup transformer, not here.
 * Block: one row per tab; cell 1 = label, cell 2 = H3 title link, link list,
 * Learn more link, application image, product image, H4 product title, status,
 * description, Learn more link.
 */
export default function parse(element, { document }) {
  const root = element.closest('.applications-tabs') || element.parentElement;
  const toggles = root
    ? [...root.querySelectorAll(':scope > .bd-header ul.bd-toggle > li > a')]
    : [];
  const labelById = {};
  const labelsInOrder = [];
  toggles.forEach((a) => {
    const text = a.textContent.replace(/\s+/g, ' ').trim();
    labelsInOrder.push(text);
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#')) labelById[href.slice(1)] = text;
  });

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

  const linkP = (a) => {
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    p.append(link);
    return p;
  };

  const panes = [...element.querySelectorAll('.tab-content > .tab-pane')];
  const cells = [];

  panes.forEach((pane, idx) => {
    const label = labelById[pane.id] || labelsInOrder[idx] || '';
    const content = [];

    // application card
    const topic = pane.querySelector('.primary-topic-item') || pane.querySelector('.market-card');
    if (topic) {
      const titleEl = topic.querySelector('.product-list-title, h3');
      if (titleEl) {
        const h3 = document.createElement('h3');
        const a = titleEl.querySelector('a[href]');
        if (a) {
          const link = document.createElement('a');
          link.href = a.getAttribute('href');
          link.textContent = a.textContent.trim();
          h3.append(link);
        } else {
          h3.textContent = titleEl.textContent.trim();
        }
        content.push(h3);
      }
      const list = topic.querySelector('.primary-topic-text ul');
      if (list) content.push(list);
      topic.querySelectorAll('.primary-topic-link a[href]').forEach((a) => content.push(linkP(a)));
      const media = topic.querySelector('.primary-topic-media');
      const appImg = media && realImg(media);
      if (appImg) content.push(appImg);
    }

    // product card
    const card = pane.querySelector('.card1-item');
    if (card) {
      const imgWrap = card.querySelector('.card1-image') || card;
      const pImg = realImg(imgWrap);
      if (pImg) content.push(pImg);
      const title = card.querySelector('.card1-title');
      if (title) {
        const h4 = document.createElement('h4');
        h4.textContent = title.textContent.trim();
        content.push(h4);
      }
      const status = card.querySelector('.product-status');
      if (status && status.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = status.textContent.trim();
        content.push(p);
      }
      const body = card.querySelector('.card1-body');
      if (body) {
        const ps = [...body.querySelectorAll('p')];
        if (ps.length) content.push(...ps);
        else if (body.textContent.trim()) {
          const p = document.createElement('p');
          p.textContent = body.textContent.trim();
          content.push(p);
        }
      }
      card.querySelectorAll('.card1-links a[href]').forEach((a) => content.push(linkP(a)));
    }

    cells.push([label, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-showcase', cells });
  element.replaceWith(block);
}
