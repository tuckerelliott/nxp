/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero.
 * Source: https://www.nxp.com/ homepage slider (#homepage_slider_v4, wrapped by div.homepage-slider).
 * Block: one row per slide; cell 1 = image, cell 2 = indicator label p, eyebrow p,
 * H1 (first slide) / H2 (others) title, description, CTA link.
 */
export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.carousel-inner > .carousel-item')];
  // The wrapper and the inner carousel are both instance selectors; if the
  // inner one was already converted there is nothing left to parse here.
  if (!items.length) return;

  const labels = [...element.querySelectorAll('ol.carousel-indicators > li')]
    .map((li) => (li.querySelector('.indicator-container span, span') || li).textContent.trim());

  const cells = [];
  items.forEach((item, idx) => {
    const hero = item.querySelector('.hero') || item;

    // image: first real image (skip lazy/placeholder data URIs)
    const imgs = [...hero.querySelectorAll('img')];
    let img = imgs.find((i) => {
      const src = i.getAttribute('src') || '';
      return src && !src.startsWith('data:');
    }) || imgs[0];
    const imageCell = [];
    if (img) {
      const realSrc = img.getAttribute('data-src') || img.getAttribute('src');
      if (realSrc && realSrc !== img.getAttribute('src')) img.setAttribute('src', realSrc);
      imageCell.push(img);
    }

    const body = hero.querySelector('.hero-body') || hero;
    const contentCell = [];

    const label = labels[idx];
    if (label) {
      const p = document.createElement('p');
      p.textContent = label;
      contentCell.push(p);
    }

    const signpost = body.querySelector('.signpost');
    if (signpost && signpost.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = signpost.textContent.trim();
      contentCell.push(p);
    }

    const titleEl = body.querySelector('.hero-title, h1, h2, h3');
    if (titleEl) {
      const h = document.createElement(idx === 0 ? 'h1' : 'h2');
      h.innerHTML = titleEl.innerHTML;
      contentCell.push(h);
    }

    const desc = body.querySelector('.hero-description');
    if (desc) {
      const ps = [...desc.querySelectorAll('p')];
      if (ps.length) contentCell.push(...ps);
      else if (desc.textContent.trim()) {
        const p = document.createElement('p');
        p.innerHTML = desc.innerHTML;
        contentCell.push(p);
      }
    }

    const ctas = [...body.querySelectorAll('.hero-action a[href], .btn-container a[href]')]
      .filter((a, i, arr) => arr.indexOf(a) === i);
    ctas.forEach((a) => {
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent.trim();
      p.append(link);
      contentCell.push(p);
    });

    cells.push([imageCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
