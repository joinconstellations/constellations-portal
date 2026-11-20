/* Constellations — space notes
   Created 28 Sep 2026.  VERSION 1.5.1

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
   1.4.0 month headings on the Gatherings lists. See MONTHS below.
   1.5.0 North Star Gatherings masthead: a name, a gold rule and numbered
         sign-up steps (Kate chose Option B, 28 Sep). Shorter panel copy.
   1.5.1 loads Cormorant Garamond itself. On a fresh load of a Gatherings
         page nothing else had loaded it, so the headings fell back to Georgia.
         Numbers set in Cormorant use lining figures: its default old-style
         "1" reads as a capital I. */

(function () {
  'use strict';

  var VERSION = '1.7.1';

  var STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
             '<path d="M12 1l2.2 6.3L20.5 5l-3.1 5.9 6.6 1.1-6.6 1.1 3.1 5.9-6.3-2.3' +
             'L12 23l-2.2-6.3L3.5 19l3.1-5.9L0 12l6.6-1.1L3.5 5l6.3 2.3z"/></svg>';

  /* path -> note.

     eyebrow  small label at the top of the card
     name     the space name as the page's main heading, with a gold rule
              under it. Optional. When present, Circle's own title in the bar
              above is hidden (see CSS), so the page has one header.
     lead     one warm line in large type, outside the panel. Optional.
     heading  a real <h2>. Optional. Kate, 28 Sep: not wanted here — the space
              header already says Gatherings, and a second heading that only
              announced what was coming was in the way of the welcome.
     lines    paragraphs inside the pale panel
     steps    numbered steps under the panel. Optional. *word* sets bold. */
  var NOTES = {
    '/c/nsgatherings': {
      eyebrow: 'North Star',
      name: 'Gatherings',
      lead: 'This is where you’ll sign up for events.',
      lines: [
        'North Star events are for adults who prefer more hands-on support, ' +
        'shorter and more direct content, and clearer language and instructions.'
      ],
      steps: [
        'Find an event you want to go to.',
        'Press *RSVP*. It changes to *Going*.',
        'Open the event to see how to join. We also send you an email.'
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
    '#cst-space-note h1.cst-sn-name{font:600 52px/1 "Cormorant Garamond",Georgia,serif;',
    'color:var(--nv);margin:0 0 18px;letter-spacing:-.01em}',
    '#cst-space-note .cst-sn-rule{width:72px;height:4px;background:var(--gd);margin:0 0 22px}',
    '#cst-space-note ol.cst-sn-steps{list-style:none;margin:24px 0 0;padding:0;',
    'display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--ha)}',
    '#cst-space-note .cst-sn-steps li{padding:18px 20px 2px 0;font-size:21px;line-height:1.4}',
    '#cst-space-note .cst-sn-steps li+li{padding-left:20px;border-left:1px solid var(--ha)}',
    '#cst-space-note .cst-sn-num{display:block;font:600 40px/1 "Cormorant Garamond",Georgia,serif;',
    'color:var(--gd);margin:0 0 6px;font-variant-numeric:lining-nums}',
    '#cst-space-note .cst-sn-steps b{font-weight:600}',
    /* With a name, the card is the page header, so Circle's own title in the
       bar above is hidden. The New event and menu buttons in that bar stay. */
    'body:has(#cst-space-note.cst-sn-named) #circle-ai-workspace-body ',
    'div.rounded-b-2xl h1{display:none!important}',
    '#cst-space-note p{margin:0 0 12px;max-width:640px}',
    '#cst-space-note p:last-child{margin-bottom:0}',
    '@media (max-width:767px){',
    '#cst-space-note{padding:22px 20px;margin-bottom:16px}',
    '#cst-space-note h2{font-size:25px}',
    '#cst-space-note .cst-sn-lead{font-size:23px;margin-bottom:16px}',
    '#cst-space-note .cst-sn-panel{padding:16px 18px}',
    '#cst-space-note h1.cst-sn-name{font-size:40px}',
    '#cst-space-note ol.cst-sn-steps{grid-template-columns:1fr}',
    '#cst-space-note .cst-sn-steps li,#cst-space-note .cst-sn-steps li+li{',
    'padding:16px 0 4px;border-left:0}',
    '#cst-space-note .cst-sn-steps li+li{border-top:1px solid var(--ha)}}'
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

  /* Cormorant Garamond is not loaded site-wide. Other pages get it from the
     space-header template or home.js, and a fresh load of North Star
     Gatherings has neither. Loading it twice on a page is harmless. */
  var FONTS = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&display=swap';

  function fonts() {
    if (document.getElementById('cst-sn-fonts')) return;
    var l = document.createElement('link');
    l.id = 'cst-sn-fonts';
    l.rel = 'stylesheet';
    l.href = FONTS;
    (document.head || document.documentElement).appendChild(l);
    var st = document.createElement('style');
    st.id = 'cst-sn-figures';
    st.textContent = 'body:is(.view-space--2860065,.view-space--2867669) ' +
      '.infinite-scroll-component p{font-variant-numeric:lining-nums}';
    (document.head || document.documentElement).appendChild(st);
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
    if (note.name) el.className = 'cst-sn-named';
    el.innerHTML =
      (note.eyebrow ? '<p class="cst-sn-ey">' + STAR + esc(note.eyebrow) + '</p>' : '') +
      (note.name ? '<h1 class="cst-sn-name">' + esc(note.name) + '</h1>' +
                   '<div class="cst-sn-rule" aria-hidden="true"></div>' : '') +
      (note.lead ? '<p class="cst-sn-lead">' + esc(note.lead) + '</p>' : '') +
      (note.heading ? '<h2>' + esc(note.heading) + '</h2>' : '') +
      '<div class="cst-sn-panel">' +
      (note.lines || []).map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') +
      '</div>' +
      (note.steps ? '<ol class="cst-sn-steps">' + note.steps.map(function (t, i) {
        return '<li><span class="cst-sn-num" aria-hidden="true">' + (i + 1) + '</span>' +
               esc(t).replace(/\*([^*]+)\*/g, '<b>$1</b>') + '</li>';
      }).join('') + '</ol>' : '');
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
    fonts();
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

  /* ------------------------------------------------------------- CROSS-LIST

     1.6.0, Kate 5 Nov 2026: a North Star event shown at the top of the main
     Gatherings page too, with the North Star star. Its own card above
     Circle's list, never inside it. Disappears by itself when it ends. */

  var CROSS = [{
    on: '/c/events',
    until: '2026-11-06T00:30:00Z',
    title: 'The Art of Connection: An Evening with Artist Justin Valenti',
    when: 'Thursday, November 5 · 6:00 to 7:30 p.m. ET',
    where: 'Main Street, 50 Monroe Place, Rockville, Maryland',
    text: 'An interview with Justin, Constellations’ 2026 resident artist, followed by audience questions, crafts, light refreshments and an art raffle.',
    late: 'Want to join last-minute? Just email us at member@joinconstellations.com.',
    mail: 'mailto:member@joinconstellations.com?subject=Joining%20The%20Art%20of%20Connection',
    url: '/c/nsgatherings/north-star-art-advocacy-with-justin-valenti-in-person'
  }];

  var XCSS = [
    '#cst-gx{--nv:#1A2238;--gd:#7D6220;--ik:#22231E;--ha:#E6E3DC;background:#fff;',
    'border:2px solid var(--nv);padding:24px 28px;margin:0 0 20px;color:var(--ik);',
    'font:18px/1.55 "EB Garamond",Georgia,serif}',
    '#cst-gx .gx-ey{display:flex;align-items:center;gap:10px;margin:0 0 10px;',
    'font:600 12px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--nv)}',
    '#cst-gx .gx-ey svg{width:16px;height:16px;flex:none;display:block}',
    '#cst-gx h2{font:600 28px/1.15 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:0 0 8px}',
    '#cst-gx .gx-w{display:block;font:600 15px/1.5 Inter,system-ui,sans-serif;margin:0 0 10px}',
    '#cst-gx p{margin:0 0 10px;max-width:680px}',
    '#cst-gx .gx-late{font-weight:600}',
    '#cst-gx .gx-late a{color:var(--nv)!important;text-decoration:underline}',
    '#cst-gx a.gx-go{display:inline-block;margin-top:4px;text-decoration:none;',
    'font:600 15px Inter,system-ui,sans-serif;color:var(--nv)!important;border:1.5px solid var(--nv);padding:10px 18px}',
    '@media (max-width:767px){#cst-gx{padding:20px}#cst-gx h2{font-size:24px}#cst-gx a.gx-go{display:block;text-align:center}}'
  ].join('');

  function cross() {
    var c = null, now = Date.now();
    CROSS.forEach(function (x) { if (x.on === path() && now < Date.parse(x.until)) c = x; });
    var ex = document.getElementById('cst-gx');
    if (!c) { if (ex) ex.remove(); return; }
    if (ex) return;
    var mount = document.querySelector('.react-page-space-show');
    if (!mount || !mount.firstElementChild) return;
    if (!document.getElementById('cst-gx-css')) {
      var s = document.createElement('style');
      s.id = 'cst-gx-css';
      s.textContent = XCSS;
      (document.head || document.documentElement).appendChild(s);
    }
    fonts();
    var el = document.createElement('section');
    el.id = 'cst-gx';
    el.setAttribute('data-cst-gx', VERSION);
    var late = esc(c.late).replace('member@joinconstellations.com',
      '<a href="' + esc(c.mail) + '">member@joinconstellations.com</a>');
    el.innerHTML =
      '<p class="gx-ey">' + STAR + 'North Star gathering · In person</p>' +
      '<h2>' + esc(c.title) + '</h2>' +
      '<span class="gx-w">' + esc(c.when) + '<br>' + esc(c.where) + '</span>' +
      '<p>' + esc(c.text) + '</p>' +
      '<p class="gx-late">' + late + '</p>' +
      '<a class="gx-go" href="' + esc(c.url) + '">See details →</a>';
    mount.insertBefore(el, mount.firstElementChild);
  }

  /* Short descriptions under each event on the Gatherings lists (/c/events
     and /c/nsgatherings). Kate, 20 Nov 2026. Circle's event list shows only
     the title, time and place. BLURBS holds a line per event, keyed by
     space slug + event slug; North Star lines are shorter and more direct.
     An event without a line falls back to the first sentence of its own
     description when that sentence is short. */
  var BLURBS = {
    'events/low-key-singles-night-in-west-hartford-connecticut':
      'A small, low-pressure evening in West Hartford, Connecticut, for singles in their 20s and 30s.',
    'events/navigating-holiday-overwhelm':
      'Tips from a Maryland therapist on family, crowds, sensory overwhelm and changes to your routine.',
    'events/women-s-dating-friendship-discussion':
      'A moderated conversation for women about dating and friendship, focused on what to try next.',
    'events/men-s-dating-friendship-discussion':
      'A moderated conversation for men about dating and friendship, focused on what to try next.',
    'events/holiday-member-meetup-in-person':
      'A holiday afternoon in Bethesda with other members and light refreshments.',
    'events/new-year-kickoff-with-constellations':
      'An afternoon get-together in D.C. to start the new year with other members.',
    'nsgatherings/navigating-holiday-overwhelm':
      'Tips for the holidays from a therapist, on Zoom.',
    'nsgatherings/north-star-speed-connections-friends-dating':
      'Meet other members on Zoom for new friends, dating or both.',
    'nsgatherings/women-s-dating-friendship-discussion':
      'A group talk on Zoom for women about dating and making friends.',
    'nsgatherings/men-s-dating-friendship-discussion':
      'A group talk on Zoom for men about dating and making friends.',
    'nsgatherings/north-star-holiday-member-meetup-in-person':
      'A holiday party with other members in Bethesda.',
    'nsgatherings/north-star-new-year-kickoff-with-constellations-in-person':
      'An afternoon with other members in D.C. to start the new year.'
  };
  var BLURB_SPACES = { events: 2860065, nsgatherings: 2867669 };
  var blurbCache = {};

  function blurbSpace() {
    var m = location.pathname.match(/^\/c\/(events|nsgatherings)\/?$/);
    return m ? m[1] : null;
  }

  function firstSentence(html) {
    var d = document.createElement('div');
    d.innerHTML = html || '';
    var p = d.querySelector('p');
    var t = ((p || d).textContent || '').replace(/\s+/g, ' ').trim();
    var m = t.match(/^.*?[.!?](\s|$)/);
    t = (m ? m[0] : t).trim();
    return t.length && t.length <= 150 ? t : '';
  }

  function loadBlurbs(sp) {
    if (blurbCache[sp]) return;
    blurbCache[sp] = { ready: false, map: {} };
    fetch('/internal_api/spaces/' + BLURB_SPACES[sp] + '/posts?per_page=40&sort=latest',
          { credentials: 'same-origin', headers: { accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var rs = (j && (j.records || j)) || [];
        rs.forEach(function (p) {
          if (p && p.slug) blurbCache[sp].map[p.slug] = firstSentence(p.body_trix_content);
        });
        blurbCache[sp].ready = true;
        ping();
      })
      .catch(function () { blurbCache[sp].ready = true; });
  }

  function blurbs() {
    var sp = blurbSpace();
    if (!sp) return;
    if (!document.getElementById('cst-eb-css')) {
      var st = document.createElement('style');
      st.id = 'cst-eb-css';
      st.textContent = '.cst-eb{margin:6px 0 0;max-width:60ch;font:400 17px/1.45 "EB Garamond",Georgia,serif;' +
        'color:#45463D;white-space:normal}' +
        '@media (max-width:767px){.cst-eb{font-size:16px}}';
      (document.head || document.documentElement).appendChild(st);
    }
    var links = document.querySelectorAll('[data-testid="event-main-content"] a[href*="/c/' + sp + '/"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var col = a.querySelector('div.flex.flex-col.gap-2');
      if (!col || col.querySelector('.cst-eb')) continue;
      var slug = (a.getAttribute('href') || '').split('/c/' + sp + '/')[1] || '';
      slug = slug.split(/[?#\/]/)[0];
      var text = BLURBS[sp + '/' + slug];
      if (!text) {
        loadBlurbs(sp);
        if (!blurbCache[sp].ready) continue;
        text = blurbCache[sp].map[slug];
      }
      if (!text) continue;
      var p = document.createElement('p');
      p.className = 'cst-eb';
      p.textContent = text;
      col.appendChild(p);
    }
  }

  /* Circle is a single-page app: moving between spaces does not reload, so the
     note has to be removed on the way out as well as added on the way in. */
  function sync() {
    gate();
    gold();
    months();
    try { cross(); } catch (e) {}
    try { blurbs(); } catch (e) {}

    var note = noteFor();
    var existing = document.getElementById('cst-space-note');

    if (!note) { if (existing) existing.remove(); return; }
    if (existing) return;

    var mount = document.querySelector('.react-page-space-show');
    if (!mount || !mount.firstElementChild) return;

    css();
    fonts();
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
