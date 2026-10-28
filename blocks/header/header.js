// media query match that indicates the full desktop nav (source collapses below 1200px)
const isDesktop = window.matchMedia('(min-width: 1200px)');

const SEARCH_URL = 'https://www.nxp.com/search';

/**
 * Fetches the nav fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<Element|null>} wrapper element holding the nav sections
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  // resolve relative image paths against the fragment location, not the current page
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  return wrapper;
}

/**
 * Creates an element with optional class names.
 * @param {string} tag tag name
 * @param {string} [className] space-separated classes
 * @returns {Element}
 */
function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/**
 * Builds a close (x) button.
 * @param {string} label accessible label
 * @returns {HTMLButtonElement}
 */
function closeButton(label) {
  const btn = el('button', 'nav-close');
  btn.type = 'button';
  btn.setAttribute('aria-label', label);
  return btn;
}

/**
 * Closes every open dropdown, panel and the search overlay in the header.
 * @param {Element} nav the nav element
 */
function closeAll(nav) {
  nav.querySelectorAll('[aria-expanded="true"]').forEach((btn) => {
    if (!btn.closest('.nav-hamburger')) btn.setAttribute('aria-expanded', 'false');
  });
  nav.classList.remove('panel-open', 'search-open');
}

/**
 * Turns one column list item into a megamenu column.
 * A column with more lists than headings spans two grid columns (one list each).
 * @param {Element} li column list item from the fragment
 * @returns {Element}
 */
function buildColumn(li) {
  const col = el('div', 'nav-panel-col');
  const headings = li.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > p');
  const lists = li.querySelectorAll(':scope > ul');
  if (lists.length > headings.length && headings.length) col.classList.add('nav-panel-col-wide');
  [...li.children].forEach((child) => {
    if (child.tagName === 'UL') child.classList.add('nav-panel-list');
    else child.classList.add('nav-panel-heading');
    col.append(child);
  });
  col.querySelectorAll('ul ul').forEach((ul) => ul.classList.add('nav-panel-sublist'));
  col.querySelectorAll('strong > a').forEach((a) => a.classList.add('nav-panel-cta'));
  col.querySelectorAll('.nav-panel-list').forEach((ul) => {
    if (ul.querySelector(':scope > li > ul')) ul.classList.add('nav-panel-list-tree');
  });
  return col;
}

/**
 * Decorates the primary navigation: megamenu triggers, panels and plain links.
 * @param {Element} section nav sections element
 * @param {Element} nav the nav element
 */
function decorateSections(section, nav) {
  const list = section.querySelector(':scope > ul');
  if (!list) return;
  list.classList.add('nav-primary');
  [...list.children].forEach((li, i) => {
    const sub = li.querySelector(':scope > ul');
    if (!sub) {
      li.classList.add('nav-primary-link');
      if (li.querySelector('strong > a')) li.classList.add('nav-primary-pill');
      return;
    }
    li.classList.add('nav-drop');
    const label = li.querySelector(':scope > p, :scope > a, :scope > strong');
    const trigger = el('button', 'nav-drop-trigger');
    trigger.type = 'button';
    trigger.textContent = label ? label.textContent.trim() : '';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', `nav-panel-${i}`);
    if (label) label.remove();

    const panel = el('div', 'nav-panel');
    panel.id = `nav-panel-${i}`;
    const grid = el('div', 'nav-panel-grid');
    [...sub.children].forEach((colLi) => grid.append(buildColumn(colLi)));
    sub.remove();
    const close = closeButton('Close menu');
    close.addEventListener('click', () => closeAll(nav));
    panel.append(grid, close);
    li.prepend(trigger);
    li.append(panel);

    trigger.addEventListener('click', () => {
      if (!isDesktop.matches) {
        // mobile: expand in place
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        return;
      }
      // desktop: clicking a trigger opens its panel (re-clicking keeps it open, like the source)
      list.querySelectorAll('.nav-drop-trigger').forEach((t) => {
        if (t !== trigger) t.setAttribute('aria-expanded', 'false');
      });
      nav.classList.remove('search-open');
      trigger.setAttribute('aria-expanded', 'true');
      nav.classList.add('panel-open');
    });
  });
}

/**
 * Builds the language dropdown from a list item: label paragraph, link list, note.
 * @param {Element} li list item holding the language selector content
 * @param {Element} nav the nav element
 * @returns {Element}
 */
function buildLanguage(li, nav) {
  const wrap = el('div', 'nav-language');
  const label = li.querySelector(':scope > p');
  const btn = el('button', 'nav-language-trigger');
  btn.type = 'button';
  btn.textContent = label ? label.textContent.trim() : '';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-haspopup', 'true');
  const menu = el('div', 'nav-language-menu');
  const links = li.querySelector(':scope > ul');
  if (links) {
    links.classList.add('nav-language-list');
    menu.append(links);
  }
  const notes = [...li.querySelectorAll(':scope > p')].filter((p) => p !== label);
  notes.forEach((p) => {
    p.classList.add('nav-language-note');
    menu.append(p);
  });
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    nav.querySelectorAll('.nav-drop-trigger').forEach((t) => t.setAttribute('aria-expanded', 'false'));
    nav.classList.remove('panel-open', 'search-open');
    btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
  wrap.append(btn, menu);
  return wrap;
}

/**
 * Builds the search overlay panel from its fragment section.
 * Expected order: heading, mode list, placeholder paragraph, disclaimer,
 * "Suggested" label, suggestion list, sign-in note.
 * @param {Element} section search section from the fragment
 * @param {Element} nav the nav element
 * @returns {Element}
 */
function buildSearchPanel(section, nav) {
  const panel = el('div', 'nav-search-panel');
  panel.id = 'nav-search-panel';
  const inner = el('div', 'nav-search-inner');
  const heading = section.querySelector('h1, h2, h3');
  const [modes, suggestions] = section.querySelectorAll(':scope > ul');
  const paras = [...section.querySelectorAll(':scope > p')];
  const [placeholder, disclaimer, suggestedLabel, ...rest] = paras;
  const signInNote = rest.pop();

  if (heading) inner.append(heading);

  const form = el('form', 'nav-search-form');
  form.action = SEARCH_URL;
  form.method = 'get';
  if (modes) {
    const toggle = el('div', 'nav-search-modes');
    toggle.setAttribute('role', 'tablist');
    [...modes.children].forEach((li, i) => {
      const b = el('button', 'nav-search-mode');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.textContent = li.textContent.trim();
      b.addEventListener('click', () => {
        toggle.querySelectorAll('button').forEach((x) => x.setAttribute('aria-selected', x === b ? 'true' : 'false'));
      });
      toggle.append(b);
    });
    inner.append(toggle);
  }
  const field = el('div', 'nav-search-field');
  const input = el('textarea', 'nav-search-input');
  input.name = 'keyword';
  input.rows = 1;
  input.maxLength = 1024;
  input.placeholder = placeholder ? placeholder.textContent.trim() : '';
  input.setAttribute('aria-label', input.placeholder || 'Search');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.value.trim()) form.requestSubmit();
    }
  });
  const submit = el('button', 'nav-search-submit');
  submit.type = 'submit';
  submit.setAttribute('aria-label', 'Submit');
  field.append(input, submit);
  form.append(field);
  inner.append(form);
  if (disclaimer) {
    disclaimer.classList.add('nav-search-disclaimer');
    inner.append(disclaimer);
  }
  if (suggestions) {
    const sugg = el('div', 'nav-search-suggested');
    if (suggestedLabel) {
      suggestedLabel.classList.add('nav-search-suggested-label');
      sugg.append(suggestedLabel);
    }
    const chips = el('div', 'nav-search-chips');
    [...suggestions.children].forEach((li) => {
      const chip = el('button', 'nav-search-chip');
      chip.type = 'button';
      chip.textContent = li.textContent.trim();
      chip.addEventListener('click', () => {
        input.value = chip.textContent;
        input.focus();
      });
      chips.append(chip);
    });
    sugg.append(chips);
    inner.append(sugg);
  }
  const close = closeButton('Close search');
  close.addEventListener('click', () => closeAll(nav));
  panel.append(close, inner);
  if (signInNote) {
    const strip = el('div', 'nav-search-signin');
    strip.append(signInNote);
    panel.append(strip);
  }
  return panel;
}

/**
 * Decorates the tools row: search pill, sign-in link, language selector, cart.
 * @param {Element} section tools section
 * @param {Element} nav the nav element
 */
function decorateTools(section, nav) {
  const paras = [...section.querySelectorAll(':scope > p')];
  const searchP = paras.find((p) => p.querySelector('a[href*="search"]'));
  if (searchP) {
    const a = searchP.querySelector('a');
    const btn = el('button', 'nav-search-trigger');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'nav-search-panel');
    const icon = a.querySelector('img');
    if (icon) {
      icon.alt = '';
      icon.classList.add('nav-search-icon');
      btn.append(icon);
    }
    const text = el('span', 'nav-search-label');
    text.textContent = a.textContent.trim();
    btn.append(text);
    btn.addEventListener('click', () => {
      closeAll(nav);
      btn.setAttribute('aria-expanded', 'true');
      nav.classList.add('search-open');
      const input = nav.querySelector('.nav-search-input');
      if (input) input.focus();
    });
    searchP.replaceWith(btn);
  }
  paras.forEach((p) => {
    if (p === searchP) return;
    const a = p.querySelector('a');
    if (!a) return;
    if (a.querySelector('img')) {
      p.classList.add('nav-cart');
      // text next to the icon is a mobile-only label (e.g. "Orders")
      [...a.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          const label = el('span', 'nav-cart-label');
          label.textContent = node.textContent.trim();
          node.replaceWith(label);
        }
      });
    } else {
      p.classList.add('nav-signin');
    }
  });
  const langList = section.querySelector(':scope > ul');
  if (langList && langList.firstElementChild) {
    langList.replaceWith(buildLanguage(langList.firstElementChild, nav));
  }
  // order: search, sign-in, language, cart
  const order = ['.nav-search-trigger', '.nav-signin', '.nav-language', '.nav-cart'];
  order.forEach((sel) => {
    const node = section.querySelector(sel);
    if (node) section.append(node);
  });
}

/**
 * Toggles the mobile menu.
 * @param {Element} nav the nav element
 * @param {boolean|null} force optional forced state (true = open)
 */
function toggleMenu(nav, force = null) {
  const open = force !== null ? force : nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  const btn = nav.querySelector('.nav-hamburger button');
  if (btn) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const nav = el('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  const sections = [...fragment.children];
  const [brand, primary, tools, search] = sections;
  if (brand) {
    brand.className = 'nav-brand';
    nav.append(brand);
  }
  if (primary) {
    primary.className = 'nav-sections';
    decorateSections(primary, nav);
    nav.append(primary);
  }
  if (tools) {
    tools.className = 'nav-tools';
    decorateTools(tools, nav);
    nav.append(tools);
  }
  if (search) nav.append(buildSearchPanel(search, nav));

  const backdrop = el('div', 'nav-backdrop');
  backdrop.addEventListener('click', () => closeAll(nav));
  nav.append(backdrop);

  const hamburger = el('div', 'nav-hamburger');
  hamburger.innerHTML = '<button type="button" aria-controls="nav" aria-expanded="false" aria-label="Open navigation"><span class="nav-hamburger-icon"></span></button>';
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // close dropdowns on outside click and Escape
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-language')) {
      nav.querySelectorAll('.nav-language-trigger[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    }
    if (!nav.contains(e.target)) closeAll(nav);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll(nav);
  });

  // reset state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    closeAll(nav);
    toggleMenu(nav, false);
  });

  const navWrapper = el('div', 'nav-wrapper');
  navWrapper.append(nav);
  block.append(navWrapper);
}
