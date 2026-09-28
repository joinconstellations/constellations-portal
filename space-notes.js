/* Constellations — space notes
   Created 28 Sep 2026.  VERSION 1.4.0

   Puts a short explanatory note at the top of a space page, above whatever
   Circle renders there.

   Why this file exists: Circle event spaces have no description field, and the
   space-header template that draws mastheads elsewhere lives in Circle's
   JavaScript snippet, which sits at roughly 64,300 of its 65,536 characters.
   There is no safe room there. The Head snippet, by contrast, has about 56,000
   characters free, so one more script tag costs nothing.

   To add a note for another space, add one entry to NOTES. The key is the
   space path. Nothing else needs changing.

   The text is real DOM text in real paragraphs — not CSS generated content —
   so screen readers and text zoom treat it as content.

   1.1.0 gates the Gatherings door. See GATES below.
   1.2.0 adds an optional lead line and makes the heading optional.
   1.3.0 puts a gold rule under the space header on North Star pages.
   1.3.1 Kate's copy edits to the North Star Gatherings note.
   1.4.0 month headings on the Gatherings lists. See MONTHS below. */

(function () {
  'use strict';

  var VERSION = '1.4.0';

  var STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
             '<path d="M12 1l2.2 6.3L20.5 5l-3.1 5.9 6.6 1.1-6.6 1.1 3.1 5.9-6.3-2.3' +
             'L12 23l-2.2-6.3L3.5 19l3.1-5.9L0 12l6.6-1.1L3.5 5l6.3 2.3z"/></svg>';

  /* path -> note.

     eyebrow  small label at the top of the card
     lead     one warm line in large type, outside the panel. Optional.
     heading  a real <h2>. Optional. Kate, 28 Sep: not wanted here — the space
              header already says Gatherings, and a second heading that only
              announced what was coming was in the way of the welcome.
     lines    paragraphs inside the pale panel */
  var NOTES = {
    '/c/nsgatherings': {
      eyebrow: 'North Star',
      lead: 'This is where you’ll sign up for events.',
      lines: [
        'North Star events are for adults who prefer more support, structure, ' +
        'clearer language and instructions, and someone from our team who stays ' +
        'for the whole gathering and takes an active part.'
      ]
    }
  };

  var CSS = [
    '#cst-space-note{--nv:#1A2238;--gd:#7D6220;--ik:#22231E;--nb:#EEF2F7;--ha:#E6E3DC;',
    'background:#fff;border:1px solid var(--ha);border-top:5px solid var(--gd);',
    'padding:30px 32px 28px;margin:0 0 20px;color:var(--ik);',
    'font:19px/1.6 "EB Garamond",Georgia,serif}',
    '#cst-space-note *{box-sizing:border-box}',
    '#cst-space-note .cst-sn-ey{display:flex;align-items:center;gap:10px;',
    'font:600 12px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;',
    'text-transform:uppercase;color:var(--nv);margin:0 0 14px}',
    '#cst-space-note .cst-sn-ey svg{width:16px;height:16px;flex:none;display:block}',
    '#cst-space-note h2{font:600 30px/1.15 "Cormorant Garamond",Georgia,serif;',
    'color:var(--nv);margin:0 0 16px;letter-spacing:-.01em}',
    '#cst-space-note .cst-sn-lead{font:500 26px/1.3 "Cormorant Garamond",Georgia,serif;',
    'color:var(--nv);margin:0 0 20px;max-width:640px;letter-spacing:-.01em}',
    '#cst-space-note .cst-sn-panel{background:var(--nb);padding:20px 22px;margin:0}',
    '#cst-space-note p{margin:0 0 12px;max-width:640px}',
    '#cst-space-note p:last-child{margin-bottom:0}',
    '@media (max-width:767px){',
    '#cst-space-note{padding:22px 20px;margin-bottom:16px}',
    '#cst-space-note h2{font-size:25px}',
    '#cst-space-note .cst-sn-lead{font-size:23px;margin-bottom:16px}',
    '#cst-space-note .cst-sn-panel{padding:16px 18px}}'
  ].join('');

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s == null ? '' : s);
    return d.innerHTML;
  }

  function css() {
    if (document.getElementById('cst-space-note-css')) return;
    var s = document.createElement('style');
    s.id = 'cst-space-note-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function path() {
    return location.pathname.replace(/\/+$/, '');
  }

  function noteFor() {
    return NOTES[path()] || null;
  }

  function build(note) {
    var el = document.createElement('section');
    el.id = 'cst-space-note';
    el.setAttribute('data-cst-space-note', VERSION);
    el.innerHTML =
      (note.eyebrow ? '<p class="cst-sn-ey">' + STAR + esc(note.eyebrow) + '</p>' : '') +
      (note.lead ? '<p class="cst-sn-lead">' + esc(note.lead) + '</p>' : '') +
      (note.heading ? '<h2>' + esc(note.heading) + '</h2>' : '') +
      '<div class="cst-sn-panel">' +
      (note.lines || []).map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') +
      '</div>';
    return el;
  }

  /* ------------------------------------------------------------ NORTH STAR GOLD

     Kate, 28 Sep: the North Star pages looked plain next to North Star Home,
     which has a gold cap across the top of its masthead box. Same idea here:
     a gold rule along the bottom of Circle's own space header, so the gold
     sits at the top of the page content on every North Star space.

     Not on /c/northstar, which already has its gold cap, and not on
     /c/nsgatherings, whose note card carries one directly below the header —
     two gold lines an inch apart is a stripe, not an accent.

     /c/nsdiscussions is a chat space and Circle draws no header bar there, so
     there is nothing to put a rule on. It is left out on purpose.

     The header is found by structure rather than by name: Circle's utility
     classes change, and a selector that stops matching should quietly do
     nothing rather than paint the wrong element. */

  var GOLD_PATHS = ['/c/nsarticles', '/c/ns-community', '/c/nsnova'];

  function gold() {
    var head = document.querySelector('#circle-ai-workspace-body div.rounded-b-2xl');
    var marked = document.querySelector('.cst-ns-gold');
    if (marked && marked !== head) marked.classList.remove('cst-ns-gold');
    if (!head) return;
    if (GOLD_PATHS.indexOf(path()) > -1) head.classList.add('cst-ns-gold');
    else head.classList.remove('cst-ns-gold');
  }

  /* ------------------------------------------------------------------ GATES

     The two calendars are split: members who use North Star gatherings were
     taken out of the main Gatherings space (2860065), and that space is now
     hidden from non-members in Circle, so their sidebar is already correct.

     What Circle does not gate is the door to it drawn by the space-header
     template in Circle's JavaScript snippet, which is static HTML and shows
     the same links to everyone. A member without access would see a door that
     leads nowhere.

     So: ask the space for one post. A member gets 200. A non-member gets an
     error, and we mark the document, which lets overrides.css hide the door.
     One cheap request, made only on a page that actually has the door, and
     only once per page load. If the request fails for any other reason the
     door is hidden too — a missing door is a smaller fault than a dead one. */

  var GATE_SPACE = 2860065;
  var gateAsked = false;

  function gate() {
    if (gateAsked) return;
    if (!document.querySelector('a.nvx-door[href="/c/events"]')) return;
    gateAsked = true;
    fetch('/internal_api/spaces/' + GATE_SPACE + '/posts?per_page=1',
          { credentials: 'same-origin', headers: { accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); })
      .catch(function () {
        document.documentElement.classList.add('cst-no-gatherings');
      });
  }

  /* ----------------------------------------------------------------- MONTHS

     Kate, 28 Sep, approved Option A for the Gatherings pages: the event list
     restyled to match Articles, with a month heading and a count above each
     month. The restyle is CSS in overrides.css. Circle's list has no month
     grouping, so this marks the first date of each month with two attributes
     and overrides.css draws the heading from them.

     Attributes only. No elements are inserted into Circle's list, because
     React owns that list and a foreign node inside it can break its updates.
     The month is also in every date line ("October 8"), so the heading adds
     nothing a screen reader would miss.

     Re-runs on every change, so it keeps up when Circle loads more events or
     the member switches between Upcoming and Past. */

  var MONTH_PATHS = { '/c/events': ['gathering', 'gatherings'],
                      '/c/nsgatherings': ['event', 'events'] };

  function months() {
    var noun = MONTH_PATHS[path()];
    if (!noun) return;
    var list = document.querySelector('.infinite-scroll-component > .flex.flex-col');
    if (!list) return;
    var rows = [], totals = {};
    Array.prototype.forEach.call(list.children, function (g) {
      var n = g.querySelectorAll('[data-testid="event-main-content"]').length;
      if (!n) return;
      var p = g.querySelector('.flex-1 > div:first-child > p');
      var m = p ? p.textContent.trim().split(/\s+/)[0] : '';
      rows.push({ g: g, m: m });
      totals[m] = (totals[m] || 0) + n;
    });
    var prev = null;
    rows.forEach(function (r) {
      if (r.m && r.m !== prev) {
        var t = totals[r.m];
        var label = t + ' ' + (t === 1 ? noun[0] : noun[1]);
        if (r.g.getAttribute('data-cst-month') !== r.m) r.g.setAttribute('data-cst-month', r.m);
        if (r.g.getAttribute('data-cst-count') !== label) r.g.setAttribute('data-cst-count', label);
      } else if (r.g.hasAttribute('data-cst-month')) {
        r.g.removeAttribute('data-cst-month');
        r.g.removeAttribute('data-cst-count');
      }
      prev = r.m;
    });
  }

  /* Circle is a single-page app: moving between spaces does not reload, so the
     note has to be removed on the way out as well as added on the way in. */
  function sync() {
    gate();
    gold();
    months();

    var note = noteFor();
    var existing = document.getElementById('cst-space-note');

    if (!note) { if (existing) existing.remove(); return; }
    if (existing) return;

    var mount = document.querySelector('.react-page-space-show');
    if (!mount || !mount.firstElementChild) return;

    css();
    mount.insertBefore(build(note), mount.firstElementChild);
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
