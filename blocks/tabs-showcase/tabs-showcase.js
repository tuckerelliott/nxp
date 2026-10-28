import { toClassName } from '../../scripts/aem.js';

let tabsId = 0;

function isPictureOnly(el) {
  return !!el && !!el.querySelector('picture') && el.textContent.trim() === '';
}

/**
 * Splits panel content into an application card and an optional product card.
 * The product card starts at the first H4 (or the picture-only element right before it).
 */
function buildPanelContent(content) {
  const children = [...content.children];
  const h4Index = children.findIndex((el) => el.tagName === 'H4');
  let splitIndex = -1;
  if (h4Index > 0) {
    splitIndex = isPictureOnly(children[h4Index - 1]) ? h4Index - 1 : h4Index;
  } else if (h4Index === 0) {
    splitIndex = 0;
  }

  const appEls = splitIndex === -1 ? children : children.slice(0, splitIndex);
  const productEls = splitIndex === -1 ? [] : children.slice(splitIndex);
  const wrapper = document.createElement('div');
  wrapper.className = 'tabs-showcase-panel-content';

  if (appEls.length) {
    const app = document.createElement('div');
    app.className = 'tabs-showcase-app';
    const body = document.createElement('div');
    body.className = 'tabs-showcase-app-body';
    const media = document.createElement('div');
    media.className = 'tabs-showcase-app-image';
    appEls.forEach((el) => (isPictureOnly(el) ? media : body).append(el));
    app.append(body);
    if (media.children.length) app.append(media);
    wrapper.append(app);
  }

  if (productEls.length) {
    const product = document.createElement('div');
    product.className = 'tabs-showcase-product';
    const body = document.createElement('div');
    body.className = 'tabs-showcase-product-body';
    productEls.forEach((el) => {
      if (isPictureOnly(el) && !product.querySelector('.tabs-showcase-product-image')) {
        el.classList.add('tabs-showcase-product-image');
        product.append(el);
      } else {
        body.append(el);
      }
    });
    // first short paragraph right after the H4 is the status line
    const status = body.querySelector('h4 + p');
    if (status && !status.querySelector('a') && status.textContent.trim().length <= 40) {
      status.classList.add('tabs-showcase-product-status');
      status.dataset.status = toClassName(status.textContent);
    }
    product.append(body);
    wrapper.append(product);
  }

  // standalone "Learn more" links render as outlined pill buttons (global a.button.secondary)
  wrapper.querySelectorAll('.tabs-showcase-app-body > p, .tabs-showcase-product-body > p').forEach((p) => {
    const a = p.querySelector(':scope > a:only-child');
    if (!a || a.querySelector('img') || p.textContent.trim() !== a.textContent.trim()) return;
    p.classList.add('tabs-showcase-cta');
    a.classList.add('button', 'secondary');
  });

  return wrapper;
}

function activate(block, tablist, button, panel, focus = false) {
  block.querySelectorAll('.tabs-showcase-panel').forEach((p) => p.setAttribute('aria-hidden', true));
  tablist.querySelectorAll('button').forEach((b) => {
    b.setAttribute('aria-selected', false);
    b.setAttribute('tabindex', '-1');
  });
  panel.setAttribute('aria-hidden', false);
  button.setAttribute('aria-selected', true);
  button.removeAttribute('tabindex');
  if (focus) button.focus();
}

export default function decorate(block) {
  tabsId += 1;
  const tablist = document.createElement('div');
  tablist.className = 'tabs-showcase-list';
  tablist.setAttribute('role', 'tablist');

  const rows = [...block.children].filter((row) => row.children.length && row.textContent.trim() !== '');
  const panels = [];

  rows.forEach((row, i) => {
    const [tabCell, ...rest] = [...row.children];
    const labelText = tabCell.textContent.trim() || `Tab ${i + 1}`;
    const id = `${tabsId}-${toClassName(labelText) || i}`;

    const panel = document.createElement('div');
    panel.className = 'tabs-showcase-panel';
    panel.id = `tabpanel-${id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    panel.setAttribute('aria-hidden', i !== 0);

    const content = document.createElement('div');
    rest.forEach((cell) => content.append(...cell.childNodes));
    panel.append(buildPanelContent(content));

    const button = document.createElement('button');
    button.className = 'tabs-showcase-tab';
    button.id = `tab-${id}`;
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    button.setAttribute('aria-selected', i === 0);
    if (i !== 0) button.setAttribute('tabindex', '-1');
    // keep authored icons/markup, unwrap single paragraph
    const p = tabCell.children.length === 1 && tabCell.firstElementChild.tagName === 'P'
      ? tabCell.firstElementChild : tabCell;
    button.append(...p.childNodes);
    if (!button.textContent.trim()) button.textContent = labelText;
    button.addEventListener('click', () => activate(block, tablist, button, panel));

    tablist.append(button);
    panels.push(panel);
  });

  tablist.addEventListener('keydown', (e) => {
    const buttons = [...tablist.querySelectorAll('button')];
    const current = buttons.indexOf(document.activeElement);
    if (current < 0) return;
    let next;
    if (e.key === 'ArrowRight') next = (current + 1) % buttons.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = buttons.length - 1;
    else return;
    e.preventDefault();
    activate(block, tablist, buttons[next], panels[next], true);
  });

  block.replaceChildren(tablist, ...panels);
}
