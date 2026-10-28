/* eslint-disable */
/* global WebImporter */

/**
 * NXP cleanup transformer.
 * Removes non-authorable site chrome (header, footer, nav, cookie banner,
 * chat widgets, scroll indicator, secure-content alerts, tracking pixels)
 * from www.nxp.com pages. The tabs-showcase button strip (div.bd-header) is
 * removed in afterTransform so the parser can read the tab labels first.
 */

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

const TRACKER_SRC = /(clickagy\.com|pixel\.gif|adsrvr\.org|doubleclick\.net|bat\.bing\.com|facebook\.com\/tr|google-analytics\.com|googletagmanager\.com|demdex\.net|everesttech\.net|linkedin\.com\/px|t\.co\/i\/adsct)/i;

function isTrackingImage(img) {
  const src = img.getAttribute('src') || '';
  if (TRACKER_SRC.test(src)) return true;
  const w = img.getAttribute('width');
  const h = img.getAttribute('height');
  if ((w === '1' || w === '0') && (h === '1' || h === '0')) return true;
  const style = (img.getAttribute('style') || '').replace(/\s/g, '').toLowerCase();
  if (/width:[01]px/.test(style) && /height:[01]px/.test(style)) return true;
  return false;
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    removeAll(element, [
      // global header / navigation
      'header.loadnav',
      'div.site-header',
      '#nxp-mobile-nav',
      'nav#primaryNav',
      'nav#sticky-nav',
      // global footer
      'footer.loadnav',
      '#sectionizbq9ojj',
      // cookie banner (OneTrust)
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      '.onetrust-pc-dark-filter',
      // Ask NXP chat widgets / Salesforce embedded messaging
      '#ask-nxp-chat-app',
      '#ask-nxp-chat-bubble-trigger',
      '#embedded-messaging',
      '#embeddedMessagingSiteContextFrame',
      // "Scroll down" indicator
      '#scrollElement',
      // secure-content / session-timeout alerts and share icons
      '#secureAlert',
      '#appSecureInfo',
      '#publicViewSecInfo',
      '#viewSecureInformation',
      '#persistentSecureInformation',
      'nav.share-icons',
      // hidden page-title H1 (the first hero slide carries the visible H1)
      'div.page-title',
      // other third-party widgets
      '#messaging_invite_button',
      '#ClickTaleDiv',
      // tracking iframes / pixels
      'iframe[id^="universal_pixel"]',
      'iframe[src*="adsrvr.org"]',
      'img[src*="clickagy.com"]',
      'img[src*="pixel.gif"]',
      // non-content elements
      'script',
      'style',
      'noscript',
      'link',
      'input[type="hidden"]',
      'body > input',
    ]);

    element.querySelectorAll('img').forEach((img) => {
      if (isTrackingImage(img)) img.remove();
    });
  }

  if (hookName === 'afterTransform') {
    // Tab-button strip: removed only after the tabs-showcase parser has read its labels.
    removeAll(element, [
      'div.applications-tabs > div.bd-header',
      'div.bd-header',
      // safety net for anything that survived
      'header.loadnav',
      'footer.loadnav',
      '#onetrust-consent-sdk',
      '#scrollElement',
      'iframe',
      'script',
      'style',
      'noscript',
      'link',
      'input',
    ]);

    element.querySelectorAll('img').forEach((img) => {
      if (isTrackingImage(img)) img.remove();
    });

    // Strip tracking / analytics attributes
    const ATTRS = ['data-dtmaction', 'data-dtmsubaction', 'data-spy', 'onclick', 'onload', 'onerror'];
    element.querySelectorAll('*').forEach((el) => {
      ATTRS.forEach((a) => {
        if (el.hasAttribute(a)) el.removeAttribute(a);
      });
    });
  }
}
