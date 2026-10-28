const AUTOPLAY_MS = 7000;
let carouselId = 0;

function isPictureOnly(el) {
  if (!el || !el.querySelector('picture')) return false;
  return el.textContent.trim() === '';
}

function updateActiveSlide(block, slideIndex) {
  block.dataset.activeSlide = slideIndex;
  block.querySelectorAll('.carousel-hero-slide').forEach((slide, idx) => {
    const active = idx === slideIndex;
    slide.setAttribute('aria-hidden', !active);
    slide.classList.toggle('carousel-hero-slide-active', active);
    slide.querySelectorAll('a').forEach((link) => {
      if (active) link.removeAttribute('tabindex');
      else link.setAttribute('tabindex', '-1');
    });
  });
  block.querySelectorAll('.carousel-hero-slide-indicator').forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    if (!button) return;
    if (idx === slideIndex) {
      button.setAttribute('aria-current', 'true');
      indicator.classList.add('carousel-hero-slide-indicator-active');
    } else {
      button.removeAttribute('aria-current');
      indicator.classList.remove('carousel-hero-slide-indicator-active');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  if (!slides.length) return;
  let realIndex = slideIndex;
  if (slideIndex < 0) realIndex = slides.length - 1;
  if (slideIndex >= slides.length) realIndex = 0;
  const target = slides[realIndex];
  block.querySelector('.carousel-hero-slides').scrollTo({
    top: 0,
    left: target.offsetLeft,
    behavior: 'smooth',
  });
  updateActiveSlide(block, realIndex);
}

function startAutoplay(block) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let timer;
  const stop = () => {
    clearInterval(timer);
    timer = undefined;
  };
  const start = () => {
    stop();
    timer = setInterval(() => {
      showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
    }, AUTOPLAY_MS);
  };
  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);
  block.addEventListener('focusin', stop);
  block.addEventListener('focusout', start);
  start();
}

function bindEvents(block) {
  block.querySelectorAll('.carousel-hero-slide-indicator button').forEach((button) => {
    button.addEventListener('click', () => {
      showSlide(block, parseInt(button.parentElement.dataset.targetSlide, 10));
    });
  });
  block.querySelector('.carousel-hero-prev')?.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) - 1);
  });
  block.querySelector('.carousel-hero-next')?.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
  });

  // keep state in sync when the user swipes/scrolls the track
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveSlide(block, parseInt(entry.target.dataset.slideIndex, 10));
      }
    });
  }, { root: block.querySelector('.carousel-hero-slides'), threshold: 0.6 });
  block.querySelectorAll('.carousel-hero-slide').forEach((slide) => observer.observe(slide));
}

/**
 * Builds one slide from an authored row: image cell + content cell.
 * Content: [indicator label p] [eyebrow p] heading, description, CTA.
 * Returns the slide and the indicator label text.
 */
function createSlide(row, slideIndex, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-hero-slide';
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-hero-${id}-slide-${slideIndex}`;

  const cells = [...row.children];
  let imageCell = cells.find((cell) => isPictureOnly(cell));
  let contentCell = cells.find((cell) => cell !== imageCell && cell.textContent.trim() !== '');
  if (!imageCell) {
    // picture may be authored inside the content cell
    const pic = contentCell?.querySelector('picture');
    if (pic) {
      imageCell = document.createElement('div');
      const holder = pic.closest('p') && pic.closest('p').textContent.trim() === '' ? pic.closest('p') : pic;
      imageCell.append(holder);
    }
  }
  if (!contentCell) contentCell = document.createElement('div');

  if (imageCell) {
    imageCell.className = 'carousel-hero-slide-image';
    slide.append(imageCell);
  }
  contentCell.className = 'carousel-hero-slide-content';

  // paragraphs before the first heading: label (optional) then eyebrow
  const heading = contentCell.querySelector('h1, h2, h3, h4, h5, h6');
  const leading = [];
  if (heading) {
    let el = contentCell.firstElementChild;
    while (el && el !== heading) {
      if (el.tagName === 'P' && !el.querySelector('a, picture')) leading.push(el);
      el = el.nextElementSibling;
    }
  }
  let label = '';
  if (leading.length >= 2) {
    label = leading[0].textContent.trim();
    leading[0].remove();
    leading[1].classList.add('carousel-hero-slide-eyebrow');
  } else if (leading.length === 1) {
    leading[0].classList.add('carousel-hero-slide-eyebrow');
  }
  if (!label) label = heading ? heading.textContent.trim() : `${slideIndex + 1}`;

  // paragraphs after the heading: CTA (link-only) or description
  if (heading) {
    let el = heading.nextElementSibling;
    while (el) {
      if (el.tagName === 'P') {
        const link = el.querySelector('a');
        const linkOnly = link && el.textContent.trim() === link.textContent.trim();
        el.classList.add(linkOnly ? 'carousel-hero-slide-cta' : 'carousel-hero-slide-description');
      }
      el = el.nextElementSibling;
    }
  }

  if (heading) {
    if (!heading.id) heading.id = `${slide.id}-title`;
    slide.setAttribute('aria-labelledby', heading.id);
  }
  slide.append(contentCell);
  return { slide, label };
}

export default function decorate(block) {
  carouselId += 1;
  const id = carouselId;
  block.id = block.id || `carousel-hero-${id}`;
  const rows = [...block.children].filter((row) => row.textContent.trim() !== '' || row.querySelector('picture'));
  const isSingle = rows.length < 2;

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const container = document.createElement('div');
  container.className = 'carousel-hero-slides-container';
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-hero-slides';
  container.append(slidesWrapper);

  let indicators;
  if (!isSingle) {
    const nav = document.createElement('nav');
    nav.className = 'carousel-hero-indicators-nav';
    nav.setAttribute('aria-label', 'Carousel slide controls');
    indicators = document.createElement('ol');
    indicators.className = 'carousel-hero-slide-indicators';
    nav.append(indicators);

    const navButtons = document.createElement('div');
    navButtons.className = 'carousel-hero-navigation-buttons';
    navButtons.innerHTML = `
      <button type="button" class="carousel-hero-prev" aria-label="Previous slide"></button>
      <button type="button" class="carousel-hero-next" aria-label="Next slide"></button>
    `;
    container.append(navButtons, nav);
  }

  rows.forEach((row, idx) => {
    const { slide, label } = createSlide(row, idx, id);
    slidesWrapper.append(slide);
    if (indicators) {
      const indicator = document.createElement('li');
      indicator.className = 'carousel-hero-slide-indicator';
      indicator.dataset.targetSlide = idx;
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-controls', slide.id);
      button.setAttribute('aria-label', `Show slide ${idx + 1} of ${rows.length}: ${label}`);
      const span = document.createElement('span');
      span.className = 'carousel-hero-slide-indicator-label';
      span.textContent = label;
      button.append(span);
      indicator.append(button);
      indicators.append(indicator);
    }
  });

  block.replaceChildren(container);
  updateActiveSlide(block, 0);

  if (!isSingle) {
    bindEvents(block);
    startAutoplay(block);
  }
}
