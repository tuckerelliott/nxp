import { readBlockConfig, toCamelCase, toClassName } from '../../scripts/aem.js';

/**
 * Applies Section Metadata to the enclosing section, then removes itself.
 * "style" becomes section classes; any other key becomes a data attribute.
 * @param {Element} block The section-metadata block element
 */
export default function decorate(block) {
  const section = block.closest('.section');
  if (section) {
    const meta = readBlockConfig(block);
    Object.entries(meta).forEach(([key, value]) => {
      if (key === 'style') {
        String(value).split(',')
          .map((style) => toClassName(style.trim()))
          .filter(Boolean)
          .forEach((style) => section.classList.add(style));
      } else {
        section.dataset[toCamelCase(key)] = value;
      }
    });
    section.classList.remove('section-metadata-container');
  }
  const wrapper = block.parentElement;
  if (wrapper && wrapper.children.length === 1) wrapper.remove();
  else block.remove();
}
