/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-link-lists.
 * Source: https://www.nxp.com/ link lists (div.listed-columns > div.row).
 * Block: one row; each cell = CTA link p, H3 heading, bulleted list of links.
 */
export default function parse(element, { document }) {
  const cols = [...element.querySelectorAll(':scope > .listed-col')];
  const row = cols.map((col) => {
    const cell = [];
    const cta = col.querySelector(':scope > a.cta[href]');
    if (cta) {
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = cta.getAttribute('href');
      link.textContent = cta.textContent.trim();
      p.append(link);
      cell.push(p);
    }
    const title = col.querySelector('.listed-title, h3');
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title.textContent.trim();
      cell.push(h3);
    }
    const list = col.querySelector('.listed-description ul, .listed-description ol');
    if (list) {
      const ul = document.createElement('ul');
      list.querySelectorAll(':scope > li').forEach((li) => {
        const item = document.createElement('li');
        const a = li.querySelector('a[href]');
        if (a) {
          const link = document.createElement('a');
          link.href = a.getAttribute('href');
          link.textContent = a.textContent.trim();
          item.append(link);
        } else {
          item.textContent = li.textContent.trim();
        }
        ul.append(item);
      });
      cell.push(ul);
    }
    return cell;
  });

  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-link-lists', cells });
  element.replaceWith(block);
}
