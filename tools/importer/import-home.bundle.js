/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    const items = [...element.querySelectorAll(".carousel-inner > .carousel-item")];
    if (!items.length) return;
    const labels = [...element.querySelectorAll("ol.carousel-indicators > li")].map((li) => (li.querySelector(".indicator-container span, span") || li).textContent.trim());
    const cells = [];
    items.forEach((item, idx) => {
      const hero = item.querySelector(".hero") || item;
      const imgs = [...hero.querySelectorAll("img")];
      let img = imgs.find((i) => {
        const src = i.getAttribute("src") || "";
        return src && !src.startsWith("data:");
      }) || imgs[0];
      const imageCell = [];
      if (img) {
        const realSrc = img.getAttribute("data-src") || img.getAttribute("src");
        if (realSrc && realSrc !== img.getAttribute("src")) img.setAttribute("src", realSrc);
        imageCell.push(img);
      }
      const body = hero.querySelector(".hero-body") || hero;
      const contentCell = [];
      const label = labels[idx];
      if (label) {
        const p = document.createElement("p");
        p.textContent = label;
        contentCell.push(p);
      }
      const signpost = body.querySelector(".signpost");
      if (signpost && signpost.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = signpost.textContent.trim();
        contentCell.push(p);
      }
      const titleEl = body.querySelector(".hero-title, h1, h2, h3");
      if (titleEl) {
        const h = document.createElement(idx === 0 ? "h1" : "h2");
        h.innerHTML = titleEl.innerHTML;
        contentCell.push(h);
      }
      const desc = body.querySelector(".hero-description");
      if (desc) {
        const ps = [...desc.querySelectorAll("p")];
        if (ps.length) contentCell.push(...ps);
        else if (desc.textContent.trim()) {
          const p = document.createElement("p");
          p.innerHTML = desc.innerHTML;
          contentCell.push(p);
        }
      }
      const ctas = [...body.querySelectorAll(".hero-action a[href], .btn-container a[href]")].filter((a, i, arr) => arr.indexOf(a) === i);
      ctas.forEach((a) => {
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = a.textContent.trim();
        p.append(link);
        contentCell.push(p);
      });
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-showcase.js
  function parse2(element, { document }) {
    const root = element.closest(".applications-tabs") || element.parentElement;
    const toggles = root ? [...root.querySelectorAll(":scope > .bd-header ul.bd-toggle > li > a")] : [];
    const labelById = {};
    const labelsInOrder = [];
    toggles.forEach((a) => {
      const text = a.textContent.replace(/\s+/g, " ").trim();
      labelsInOrder.push(text);
      const href = a.getAttribute("href") || "";
      if (href.startsWith("#")) labelById[href.slice(1)] = text;
    });
    const realImg = (scope) => {
      const imgs = [...scope.querySelectorAll("img")];
      const img = imgs.find((i) => {
        const src = i.getAttribute("src") || "";
        return src && !src.startsWith("data:");
      }) || imgs[0];
      if (img) {
        const ds = img.getAttribute("data-src");
        if (ds && !ds.startsWith("data:")) img.setAttribute("src", ds);
      }
      return img;
    };
    const linkP = (a) => {
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.trim();
      p.append(link);
      return p;
    };
    const panes = [...element.querySelectorAll(".tab-content > .tab-pane")];
    const cells = [];
    panes.forEach((pane, idx) => {
      const label = labelById[pane.id] || labelsInOrder[idx] || "";
      const content = [];
      const topic = pane.querySelector(".primary-topic-item") || pane.querySelector(".market-card");
      if (topic) {
        const titleEl = topic.querySelector(".product-list-title, h3");
        if (titleEl) {
          const h3 = document.createElement("h3");
          const a = titleEl.querySelector("a[href]");
          if (a) {
            const link = document.createElement("a");
            link.href = a.getAttribute("href");
            link.textContent = a.textContent.trim();
            h3.append(link);
          } else {
            h3.textContent = titleEl.textContent.trim();
          }
          content.push(h3);
        }
        const list = topic.querySelector(".primary-topic-text ul");
        if (list) content.push(list);
        topic.querySelectorAll(".primary-topic-link a[href]").forEach((a) => content.push(linkP(a)));
        const media = topic.querySelector(".primary-topic-media");
        const appImg = media && realImg(media);
        if (appImg) content.push(appImg);
      }
      const card = pane.querySelector(".card1-item");
      if (card) {
        const imgWrap = card.querySelector(".card1-image") || card;
        const pImg = realImg(imgWrap);
        if (pImg) content.push(pImg);
        const title = card.querySelector(".card1-title");
        if (title) {
          const h4 = document.createElement("h4");
          h4.textContent = title.textContent.trim();
          content.push(h4);
        }
        const status = card.querySelector(".product-status");
        if (status && status.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = status.textContent.trim();
          content.push(p);
        }
        const body = card.querySelector(".card1-body");
        if (body) {
          const ps = [...body.querySelectorAll("p")];
          if (ps.length) content.push(...ps);
          else if (body.textContent.trim()) {
            const p = document.createElement("p");
            p.textContent = body.textContent.trim();
            content.push(p);
          }
        }
        card.querySelectorAll(".card1-links a[href]").forEach((a) => content.push(linkP(a)));
      }
      cells.push([label, content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-showcase", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-spotlight.js
  function parse3(element, { document }) {
    const cells = [];
    const realImg = (scope) => {
      const imgs = [...scope.querySelectorAll("img")];
      const img = imgs.find((i) => {
        const src = i.getAttribute("src") || "";
        return src && !src.startsWith("data:");
      }) || imgs[0];
      if (img) {
        const ds = img.getAttribute("data-src");
        if (ds && !ds.startsWith("data:")) img.setAttribute("src", ds);
      }
      return img;
    };
    const textP = (text) => {
      const p = document.createElement("p");
      p.textContent = text.replace(/\s+/g, " ").trim();
      return p;
    };
    element.querySelectorAll(".card1-column.is-two .card1-item").forEach((item) => {
      const imageCell = [];
      const fig = item.querySelector(".card1-image") || item;
      const img = realImg(fig);
      if (img) imageCell.push(img);
      const content = [];
      const eyebrow = item.querySelector(".item-signpost");
      if (eyebrow && eyebrow.textContent.trim()) content.push(textP(eyebrow.textContent));
      const title = item.querySelector(".primary-card-title, .card1-title");
      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title.textContent.trim();
        content.push(h3);
      }
      const text = item.querySelector(".primary-card-text");
      if (text) {
        const ps = [...text.querySelectorAll("p")];
        if (ps.length) content.push(...ps);
        else if (text.textContent.trim()) content.push(textP(text.textContent));
      }
      item.querySelectorAll(".primary-card-link a[href]").forEach((a) => {
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = a.textContent.trim();
        p.append(link);
        content.push(p);
      });
      cells.push([imageCell, content]);
    });
    element.querySelectorAll(":scope > .card1-column:not(.is-two) .card1-item").forEach((item) => {
      var _a, _b;
      const href = item.tagName === "A" ? item.getAttribute("href") : (_b = (_a = item.querySelector("a[href]") || {}).getAttribute) == null ? void 0 : _b.call(_a, "href");
      const content = [];
      const eyebrow = item.querySelector(".item-signpost");
      if (eyebrow && eyebrow.textContent.trim()) content.push(textP(eyebrow.textContent));
      const title = item.querySelector(".card1-title, h3");
      if (title) {
        const h3 = document.createElement("h3");
        if (href) {
          const link = document.createElement("a");
          link.href = href;
          link.textContent = title.textContent.trim();
          h3.append(link);
        } else {
          h3.textContent = title.textContent.trim();
        }
        content.push(h3);
      }
      const meta = item.querySelector(".card1-header > p, p.text-muted");
      if (meta && meta.textContent.trim()) content.push(textP(meta.textContent));
      cells.push(["", content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-spotlight", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-link-lists.js
  function parse4(element, { document }) {
    const cols = [...element.querySelectorAll(":scope > .listed-col")];
    const row = cols.map((col) => {
      const cell = [];
      const cta = col.querySelector(":scope > a.cta[href]");
      if (cta) {
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.href = cta.getAttribute("href");
        link.textContent = cta.textContent.trim();
        p.append(link);
        cell.push(p);
      }
      const title = col.querySelector(".listed-title, h3");
      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title.textContent.trim();
        cell.push(h3);
      }
      const list = col.querySelector(".listed-description ul, .listed-description ol");
      if (list) {
        const ul = document.createElement("ul");
        list.querySelectorAll(":scope > li").forEach((li) => {
          const item = document.createElement("li");
          const a = li.querySelector("a[href]");
          if (a) {
            const link = document.createElement("a");
            link.href = a.getAttribute("href");
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
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-link-lists", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-banner.js
  function parse5(element, { document }) {
    const item = element.querySelector(".primary-topic-item") || element;
    const contentEl = item.querySelector(".primary-topic-content") || item;
    const mediaEl = item.querySelector(".primary-topic-media");
    const textCell = [];
    const heading = contentEl.querySelector("h1, h2, h3, h4, h5, h6");
    if (heading) {
      const h = document.createElement(heading.tagName.toLowerCase());
      h.textContent = heading.textContent.trim();
      textCell.push(h);
    }
    const textWrap = contentEl.querySelector(".primary-topic-text");
    if (textWrap) {
      textWrap.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim()) textCell.push(p);
      });
    }
    const ctas = [...contentEl.querySelectorAll(".primary-topic-link a[href], ul a.btn[href]")];
    ctas.forEach((a) => {
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.trim();
      p.append(link);
      textCell.push(p);
    });
    const imageCell = [];
    if (mediaEl) {
      const imgs = [...mediaEl.querySelectorAll("img")];
      const img = imgs.find((i) => {
        const src = i.getAttribute("src") || "";
        return src && !src.startsWith("data:");
      }) || imgs[0];
      if (img) {
        const ds = img.getAttribute("data-src");
        if (ds && !ds.startsWith("data:")) img.setAttribute("src", ds);
        imageCell.push(img);
      }
    }
    const imageFirst = item.classList && item.classList.contains("is-reversed");
    const cells = [imageFirst ? [imageCell, textCell] : [textCell, imageCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-overlap.js
  function parse6(element, { document }) {
    const cells = [];
    const items = [...element.querySelectorAll("section.product-list-item")];
    items.forEach((item) => {
      const imageCell = [];
      const media = item.querySelector(".product-list-media") || item;
      const imgs = [...media.querySelectorAll("img")];
      const img = imgs.find((i) => {
        const src = i.getAttribute("src") || "";
        return src && !src.startsWith("data:");
      }) || imgs[0];
      if (img) {
        const ds = img.getAttribute("data-src");
        if (ds && !ds.startsWith("data:")) img.setAttribute("src", ds);
        if ((img.getAttribute("alt") || "").trim().toLowerCase() === "img") img.setAttribute("alt", "");
        imageCell.push(img);
      }
      const content = [];
      const title = item.querySelector(".product-list-title, h3");
      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title.textContent.trim();
        content.push(h3);
      }
      const desc = item.querySelector(".product-list-description");
      if (desc) {
        desc.querySelectorAll(":scope > p").forEach((p) => {
          if (p.textContent.trim()) content.push(p);
        });
        desc.querySelectorAll("ul a[href]").forEach((a) => {
          const p = document.createElement("p");
          const link = document.createElement("a");
          link.href = a.getAttribute("href");
          link.textContent = a.textContent.trim();
          p.append(link);
          content.push(p);
        });
      }
      cells.push([imageCell, content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-overlap", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  function parse7(element, { document }) {
    const cells = [];
    const items = [...element.querySelectorAll(":scope > .whats-new-item")];
    items.forEach((item) => {
      const imageCell = [];
      const fig = item.querySelector(".whats-new-img");
      if (fig) {
        const candidates = [...fig.querySelectorAll("img")].filter((i) => !i.closest(".overlay-image"));
        const img = candidates.find((i) => i.classList.contains("img-responsive")) || candidates[candidates.length - 1];
        if (img) {
          const ds = img.getAttribute("data-src");
          if (ds && !ds.startsWith("data:")) img.setAttribute("src", ds);
          imageCell.push(img);
        }
      }
      const content = [];
      const body = item.querySelector(".whats-new-content") || item;
      const signpost = body.querySelector(".item-signpost");
      let eyebrow = signpost ? signpost.textContent.trim() : "";
      if (!eyebrow) {
        const label = body.querySelector(":scope > a.link-simple .impact-label, :scope > .impact-label");
        if (label) eyebrow = label.textContent.trim();
      }
      if (eyebrow) {
        const p = document.createElement("p");
        p.textContent = eyebrow;
        content.push(p);
      }
      const title = body.querySelector(".whats-new-title");
      if (title) {
        const h3 = document.createElement("h3");
        const a = title.querySelector("a[href]");
        const text = (a || title).textContent.replace(/\s+/g, " ").trim();
        if (a && a.getAttribute("href")) {
          const link = document.createElement("a");
          link.href = a.getAttribute("href");
          link.textContent = text;
          h3.append(link);
        } else {
          h3.textContent = text;
        }
        content.push(h3);
      }
      body.querySelectorAll(".whats-new-description ul.metadata > li").forEach((li) => {
        const p = document.createElement("p");
        const a = li.querySelector("a");
        if (a) {
          const prefix = [...li.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ").replace(/\s+/g, " ").trim();
          if (prefix) p.append(`${prefix} `);
          const name = a.textContent.trim();
          const href = a.getAttribute("href");
          if (href) {
            const link = document.createElement("a");
            link.href = href;
            link.textContent = name;
            p.append(link);
          } else {
            p.append(name);
          }
        } else {
          p.textContent = li.textContent.replace(/\s+/g, " ").trim();
        }
        if (p.textContent.trim()) content.push(p);
      });
      cells.push([imageCell, content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/nxp-cleanup.js
  function removeAll(root, selectors) {
    selectors.forEach((sel) => {
      let nodes = [];
      try {
        nodes = root.querySelectorAll(sel);
      } catch (e) {
        nodes = [];
      }
      nodes.forEach((el) => el.remove());
    });
  }
  var TRACKER_SRC = /(clickagy\.com|pixel\.gif|adsrvr\.org|doubleclick\.net|bat\.bing\.com|facebook\.com\/tr|google-analytics\.com|googletagmanager\.com|demdex\.net|everesttech\.net|linkedin\.com\/px|t\.co\/i\/adsct)/i;
  function isTrackingImage(img) {
    const src = img.getAttribute("src") || "";
    if (TRACKER_SRC.test(src)) return true;
    const w = img.getAttribute("width");
    const h = img.getAttribute("height");
    if ((w === "1" || w === "0") && (h === "1" || h === "0")) return true;
    const style = (img.getAttribute("style") || "").replace(/\s/g, "").toLowerCase();
    if (/width:[01]px/.test(style) && /height:[01]px/.test(style)) return true;
    return false;
  }
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      removeAll(element, [
        // global header / navigation
        "header.loadnav",
        "div.site-header",
        "#nxp-mobile-nav",
        "nav#primaryNav",
        "nav#sticky-nav",
        // global footer
        "footer.loadnav",
        "#sectionizbq9ojj",
        // cookie banner (OneTrust)
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        "#onetrust-pc-sdk",
        ".onetrust-pc-dark-filter",
        // Ask NXP chat widgets / Salesforce embedded messaging
        "#ask-nxp-chat-app",
        "#ask-nxp-chat-bubble-trigger",
        "#embedded-messaging",
        "#embeddedMessagingSiteContextFrame",
        // "Scroll down" indicator
        "#scrollElement",
        // secure-content / session-timeout alerts and share icons
        "#secureAlert",
        "#appSecureInfo",
        "#publicViewSecInfo",
        "#viewSecureInformation",
        "#persistentSecureInformation",
        "nav.share-icons",
        // hidden page-title H1 (the first hero slide carries the visible H1)
        "div.page-title",
        // other third-party widgets
        "#messaging_invite_button",
        "#ClickTaleDiv",
        // tracking iframes / pixels
        'iframe[id^="universal_pixel"]',
        'iframe[src*="adsrvr.org"]',
        'img[src*="clickagy.com"]',
        'img[src*="pixel.gif"]',
        // non-content elements
        "script",
        "style",
        "noscript",
        "link",
        'input[type="hidden"]',
        "body > input"
      ]);
      element.querySelectorAll("img").forEach((img) => {
        if (isTrackingImage(img)) img.remove();
      });
    }
    if (hookName === "afterTransform") {
      removeAll(element, [
        "div.applications-tabs > div.bd-header",
        "div.bd-header",
        // safety net for anything that survived
        "header.loadnav",
        "footer.loadnav",
        "#onetrust-consent-sdk",
        "#scrollElement",
        "iframe",
        "script",
        "style",
        "noscript",
        "link",
        "input"
      ]);
      element.querySelectorAll("img").forEach((img) => {
        if (isTrackingImage(img)) img.remove();
      });
      const ATTRS = ["data-dtmaction", "data-dtmsubaction", "data-spy", "onclick", "onload", "onerror"];
      element.querySelectorAll("*").forEach((el) => {
        ATTRS.forEach((a) => {
          if (el.hasAttribute(a)) el.removeAttribute(a);
        });
      });
    }
  }

  // tools/importer/transformers/nxp-sections.js
  var MARKER = "data-excat-section-id";
  var FIRST_MARKER = "data-excat-section-first";
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
  function transform2(hookName, element, payload) {
    const template = payload && payload.template;
    const sections = template && template.sections;
    if (!sections || sections.length < 2) return;
    const document = element.ownerDocument || payload.document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (!el) continue;
        if (i === 0 && !section.style) continue;
        const hr = document.createElement("hr");
        hr.setAttribute(MARKER, section.id);
        if (i === 0) hr.setAttribute(FIRST_MARKER, "true");
        el.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      const markerFor = (id) => element.querySelector(`hr[${MARKER}="${id}"]`);
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const start = markerFor(section.id);
        if (!start) continue;
        const meta = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        let end = null;
        for (let j = i + 1; j < sections.length && !end; j += 1) {
          end = markerFor(sections[j].id);
        }
        if (end) {
          end.before(meta);
        } else if (start.parentElement) {
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

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
    "name": "home",
    "urls": [
      "https://www.nxp.com/"
    ],
    "representativeUrl": "https://www.nxp.com/",
    "description": "NXP homepage: hero carousel, application tabs, spotlight cards, design resources, corporate cards, careers banner and news",
    "urlPattern": "/",
    "blocks": [
      {
        "name": "carousel-hero",
        "instances": [
          "#homepage_slider_v4"
        ]
      },
      {
        "name": "tabs-showcase",
        "instances": [
          "div.applications-tabs > div.bd-body"
        ]
      },
      {
        "name": "cards-spotlight",
        "instances": [
          "div.card1-list.has-three.is-tertiary"
        ]
      },
      {
        "name": "columns-link-lists",
        "instances": [
          "div.listed-columns > div.row"
        ]
      },
      {
        "name": "columns-banner",
        "instances": [
          "div.listed-columns + div.market-card",
          "div.market-card.mb3"
        ]
      },
      {
        "name": "cards-overlap",
        "instances": [
          "div.market-card.band-absolute"
        ]
      },
      {
        "name": "cards-news",
        "instances": [
          "div.whats-new-list"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "hero-carousel",
        "selector": [
          "div.homepage-content > div.homepage-slider.ts-slider",
          "div.homepage-slider"
        ],
        "style": null,
        "blocks": [
          "carousel-hero"
        ],
        "defaultContent": []
      },
      {
        "id": "section-2",
        "name": "applications-tabs",
        "selector": [
          "div.homepage-content > div.container > div.applications-tabs",
          "div.applications-tabs"
        ],
        "style": null,
        "blocks": [
          "tabs-showcase"
        ],
        "defaultContent": [
          "div.applications-tabs > div.section-lead"
        ]
      },
      {
        "id": "section-3",
        "name": "spotlight",
        "selector": [
          "div.homepage-content > div.container > div.band.component-container.cool-grey-xxlight"
        ],
        "style": "light-beige",
        "blocks": [
          "cards-spotlight"
        ],
        "defaultContent": [
          "div.band.component-container.cool-grey-xxlight > div.section-lead"
        ]
      },
      {
        "id": "section-4",
        "name": "start-designing",
        "selector": [
          "div.homepage-content > div.container > div.component-container.band:has(> div.listed-columns)"
        ],
        "style": null,
        "blocks": [
          "columns-link-lists",
          "columns-banner"
        ],
        "defaultContent": [
          "div.listed-columns > div.section-lead"
        ]
      },
      {
        "id": "section-5",
        "name": "we-are-nxp",
        "selector": [
          "div.homepage-content > div.container > div.block-topic",
          "div.block-topic"
        ],
        "style": "orange",
        "blocks": [
          "cards-overlap"
        ],
        "defaultContent": [
          "div.block-topic"
        ]
      },
      {
        "id": "section-6",
        "name": "careers-banner",
        "selector": [
          "div.homepage-content > div.container > div.market-card.mb3",
          "div.market-card.mb3"
        ],
        "style": null,
        "blocks": [
          "columns-banner"
        ],
        "defaultContent": []
      },
      {
        "id": "section-7",
        "name": "whats-new",
        "selector": [
          "div.homepage-content > div.container > div.band.cool-grey-xxlight:not(.component-container)"
        ],
        "style": "light-beige, centered",
        "blocks": [
          "cards-news"
        ],
        "defaultContent": [
          "div.band.cool-grey-xxlight > ul.list-inline"
        ]
      }
    ]
  };
  var parsers = {
    "carousel-hero": parse,
    "tabs-showcase": parse2,
    "cards-spotlight": parse3,
    "columns-link-lists": parse4,
    "columns-banner": parse5,
    "cards-overlap": parse6,
    "cards-news": parse7
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
