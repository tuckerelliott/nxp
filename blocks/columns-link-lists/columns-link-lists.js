const MULTI_COLUMN_THRESHOLD = 6;

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-link-lists-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-link-lists-row');
    [...row.children].forEach((col) => {
      col.classList.add('columns-link-lists-col');

      // a paragraph holding only a link, before the heading, is the column CTA
      const heading = col.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) heading.classList.add('columns-link-lists-title');
      const children = [...col.children];
      const headingIdx = heading ? children.indexOf(heading) : -1;
      const leading = headingIdx >= 0 ? children.slice(0, headingIdx) : children;
      leading.forEach((el) => {
        const links = el.querySelectorAll('a');
        if (el.tagName === 'P' && links.length === 1 && el.textContent.trim() === links[0].textContent.trim()) {
          el.classList.add('columns-link-lists-cta');
        }
      });

      // long link lists render in two columns
      col.querySelectorAll('ul, ol').forEach((list) => {
        list.classList.add('columns-link-lists-list');
        if (list.children.length > MULTI_COLUMN_THRESHOLD) list.classList.add('columns-link-lists-list-multi');
      });
    });
  });
}
