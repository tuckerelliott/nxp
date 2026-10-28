/* eslint-disable */
/* global WebImporter */

/**
 * NXP sections transformer.
 * Inserts section breaks (<hr>) and Section Metadata blocks based on
 * payload.template.sections from page-templates.json.
 *
 * beforeTransform: insert marked <hr> before every non-first section (and a
 *   temporary marked <hr> before a styled first section) while the original
 *   section elements still exist.
 * afterTransform: add Section Metadata at the end of each styled section
 *   (just before the next section break, or at the end of the last section's
 *   container), then remove the temporary markers.
 */

const MARKER = 'data-excat-section-id';
const FIRST_MARKER = 'data-excat-section-first';

// Fallback for engines without :has() support: handles "A:has(> B)".
function queryWithHasFallback(root, selector) {
  const m = selector.match(/^(.*):has\(\s*>\s*([^)]+)\)\s*$/);
  if (!m) return null;
  const [, outer, child] = m;
  let candidates = [];
  try {
    candidates = [...root.querySelectorAll(outer)];
  } catch (e) {
    return null;
  }
  return candidates.find((c) => [...c.children].some((ch) => {
    try {
      return ch.matches(child.trim());
    } catch (e) {
      return false;
    }
  })) || null;
}

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    let el = null;
    try {
      el = root.querySelector(sel);
    } catch (e) {
      el = queryWithHasFallback(root, sel);
    }
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = template && template.sections;
  if (!sections || sections.length < 2) return;
  const document = element.ownerDocument || payload.document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el) continue;
      if (i === 0 && !section.style) continue;
      const hr = document.createElement('hr');
      hr.setAttribute(MARKER, section.id);
      if (i === 0) hr.setAttribute(FIRST_MARKER, 'true');
      el.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    const markerFor = (id) => element.querySelector(`hr[${MARKER}="${id}"]`);

    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const start = markerFor(section.id);
      if (!start) continue;

      const meta = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      // End of this section = the next section break that survived.
      let end = null;
      for (let j = i + 1; j < sections.length && !end; j += 1) {
        end = markerFor(sections[j].id);
      }

      if (end) {
        end.before(meta);
      } else if (start.parentElement) {
        // Last section: content runs to the end of its container.
        start.parentElement.append(meta);
      } else {
        start.after(meta);
      }
    }

    element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => {
      if (hr.hasAttribute(FIRST_MARKER)) {
        hr.remove();
      } else {
        hr.removeAttribute(MARKER);
      }
    });
  }
}
