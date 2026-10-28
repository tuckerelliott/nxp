function isPictureOnly(el) {
  return !!el && !!el.querySelector('picture') && el.textContent.trim() === '';
}

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-banner-${cols.length}-cols`);

  [...block.children].forEach((row, rowIdx) => {
    row.classList.add('columns-banner-row');
    [...row.children].forEach((col, colIdx) => {
      if (isPictureOnly(col)) {
        col.classList.add('columns-banner-img-col');
        if (rowIdx === 0 && colIdx === 0) block.classList.add('columns-banner-image-first');
      } else {
        col.classList.add('columns-banner-text-col');
      }
    });
  });
}
