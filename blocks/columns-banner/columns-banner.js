function isPictureOnly(el) {
  return !!el && !!el.querySelector('picture') && el.textContent.trim() === '';
}

/**
 * Standalone links (the only content of their paragraph) become pill CTAs.
 * Authored bold/italic formatting (already decorated by scripts.js) wins;
 * otherwise text-first banners get the orange primary pill and image-first
 * banners the gradient-outlined secondary pill, as on the source.
 */
function decorateCta(col, imageFirst) {
  col.querySelectorAll(':scope > p').forEach((p) => {
    const a = p.querySelector('a[href]');
    if (!a || a.querySelector('img') || p.textContent.trim() !== a.textContent.trim()) return;
    p.classList.add('columns-banner-cta');
    if (!a.classList.contains('button')) {
      a.classList.add('button', imageFirst ? 'secondary' : 'primary');
    }
  });
}

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-banner-${cols.length}-cols`);

  const imageFirst = isPictureOnly(cols[0]);
  if (imageFirst) block.classList.add('columns-banner-image-first');

  [...block.children].forEach((row) => {
    row.classList.add('columns-banner-row');
    [...row.children].forEach((col) => {
      if (isPictureOnly(col)) {
        col.classList.add('columns-banner-img-col');
      } else {
        col.classList.add('columns-banner-text-col');
        decorateCta(col, imageFirst);
      }
    });
  });
}
