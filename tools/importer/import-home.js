/* eslint-disable */
/* global WebImporter */

import carouselHeroParser from './parsers/carousel-hero.js';
import tabsShowcaseParser from './parsers/tabs-showcase.js';
import cardsSpotlightParser from './parsers/cards-spotlight.js';
import columnsLinkListsParser from './parsers/columns-link-lists.js';
import columnsBannerParser from './parsers/columns-banner.js';
import cardsOverlapParser from './parsers/cards-overlap.js';
import cardsNewsParser from './parsers/cards-news.js';
import nxpCleanupTransformer from './transformers/nxp-cleanup.js';
import nxpSectionsTransformer from './transformers/nxp-sections.js';

const PAGE_TEMPLATE = {
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

const parsers = {
  'carousel-hero': carouselHeroParser,
  'tabs-showcase': tabsShowcaseParser,
  'cards-spotlight': cardsSpotlightParser,
  'columns-link-lists': columnsLinkListsParser,
  'columns-banner': columnsBannerParser,
  'cards-overlap': cardsOverlapParser,
  'cards-news': cardsNewsParser,
};

const transformers = [nxpCleanupTransformer, nxpSectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
