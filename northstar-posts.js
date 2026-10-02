/* Constellations — North Star post marker
   Created 2 Oct 2026.  VERSION 1.0.0

   Puts the North Star band — the star and the pale blue — on a North Star post
   that lives in a space shared with standard-register posts.

   Why this file exists: North Star spaces announce themselves. They carry the
   gold rule, the blue panel and the star, and North Star Home teaches members
   to look for them: "Look for the blue North Star. When you see it, you're in
   a North Star space." Guides is a Support space holding both registers, so a
   North Star guide sitting in it has none of that. Kate, 2 Oct: the North Star
   guides must be clearly marked with the icon and the blue.

   It is a separate file rather than another section of space-notes.js because
   space-notes.js works on space pages and this works on posts, and because one
   more script tag in the Head snippet costs nothing — there are about 56,000
   characters free there.

   How a post is recognised: the slug. Every North Star piece is
   north-star-something, which is already the convention in nsarticles. Nothing
   needs to be listed here when a new North Star guide is written.

   Attributes only, drawn by CSS. React owns these cards and a foreign node
   inside one can break its updates — the same reason MONTHS in space-notes.js
   sets attributes rather than inserting headings. The title says "North Star:"
   already, so the band adds nothing a screen reader would miss.

   To mark North Star posts in another shared space, add its path to SPACES. */

(function () {
  'use strict';

  var VERSION = '1.0.0';

  /* Spaces that hold both registers. North Star's own spaces are left out:
     they are already marked, and a second marker inside them is noise. */
  var SPACES = ['/c/guides'];

  /* The same star as the space notes and both home pages, as a background
     image so the band can be drawn in CSS. Navy (#1A2238) is baked in. */
  var STAR = "data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org" +
             "%2F2000%2Fsvg'%20viewBox%3D'0%200%2024%2024'%20fill%3D'%231A2238'%3E" +
             "%3Cpath%20d%3D'M12%201l2.2%206.3L20.5%205l-3.1%205.9%206.6%201.1-6.6" +
             "%201.1%203.1%205.9-6.3-2.3L12%2023l-2.2-6.3L3.5%2019l3.1-5.9L0%2012l6.6" +
             "-1.1L3.5%205l6.3%202.3z'%2F%3E%3C%2Fsvg%3E";

  var CSS = [
    '[data-cst-nsp]::before{content:"North Star";display:block;',
    'background:#EEF2F7 url("' + STAR + '") 16px center/15px 15px no-repeat;',
    'padding:11px 16px 11px 41px;margin:0 0 18px;',
    'font:600 12px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;',
    'text-transform:uppercase;color:#1A2238}',
    '@media (max-width:767px){[data-cst-nsp]::before{',
    'padding:10px 14px 10px 37px;background-position:14px center;',
    'margin-bottom:14px}}'
  ].join('');

  function css() {
    if (document.getElementById('cst-nsp-css')) return;
    var s = document.createElement('style');
    s.id = 'cst-nsp-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function path() {
    return location.pathname.replace(/\/+$/, '');
  }

  /* /c/guides and /c/guides/north-star-start-here both belong to /c/guides. */
  function space() {
    return path().split('/').slice(0, 3).join('/');
  }

  /* A card is Circle's post block. In a list each one carries its own link; on
     a post page there is no link to read, so the page's own path is used. */
  function sync() {
    if (SPACES.indexOf(space()) < 0) {
      var stale = document.querySelectorAll('[data-cst-nsp]');
      Array.prototype.forEach.call(stale, function (c) {
        c.removeAttribute('data-cst-nsp');
      });
      return;
    }

    var here = path();
    var cards = document.querySelectorAll('div.space-y-4.p-6');
    var any = false;

    Array.prototype.forEach.call(cards, function (c) {
      var a = c.querySelector('h1 a[href]');
      var href = a ? a.getAttribute('href') : (c.querySelector('h1') ? here : null);
      var isNS = !!href && /\/north-star-[^\/]+$/.test(href);
      if (isNS) {
        any = true;
        if (!c.hasAttribute('data-cst-nsp')) c.setAttribute('data-cst-nsp', VERSION);
      } else if (c.hasAttribute('data-cst-nsp')) {
        c.removeAttribute('data-cst-nsp');
      }
    });

    if (any) css();
  }

  var queued = false;
  function ping() {
    if (queued) return;
    queued = true;
    setTimeout(function () { queued = false; try { sync(); } catch (e) {} }, 60);
  }

  new MutationObserver(ping).observe(document.documentElement,
                                     { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', ping);
  ping();
})();
