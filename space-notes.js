/* Constellations — space notes
   Created 28 Sep 2026.  VERSION 1.0.0

   Puts a short explanatory note at the top of a space page, above whatever
   Circle renders there.

   Why this file exists: Circle event spaces have no description field, and the
   space-header template that draws mastheads elsewhere lives in Circle's
   JavaScript snippet, which sits at roughly 64,300 of its 65,536 characters.
   There is no safe room there. The Head snippet, by contrast, has about 56,000
   characters free, so one more script tag costs nothing.

   To add a note for another space, add one entry to NOTES. The key is the
   space path. Nothing else needs changing.

   The text is real DOM text in a real heading and real paragraphs — not CSS
   generated content — so screen readers and text zoom treat it as content. */

(function () {
  'use strict';

  var VERSION = '1.0.0';

  var STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
             '<path d="M12 1l2.2 6.3L20.5 5l-3.1 5.9 6.6 1.1-6.6 1.1 3.1 5.9-6.3-2.3' +
             'L12 23l-2.2-6.3L3.5 19l3.1-5.9L0 12l6.6-1.1L3.5 5l6.3 2.3z"/></svg>';

  /* path -> note. eyebrow is the small label above the heading. */
  var NOTES = {
    '/c/nsgatherings': {
      eyebrow: 'North Star',
      heading: 'What these gatherings are like',
      lines: [
        'North Star gatherings are shorter.',
        'They have more structure. You will know what is happening and what comes next.',
        'Someone from our team is there the whole time and takes an active part.'
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
    '#cst-space-note .cst-sn-panel{background:var(--nb);padding:20px 22px;margin:0}',
    '#cst-space-note p{margin:0 0 12px;max-width:640px}',
    '#cst-space-note p:last-child{margin-bottom:0}',
    '@media (max-width:767px){',
    '#cst-space-note{padding:22px 20px;margin-bottom:16px}',
    '#cst-space-note h2{font-size:25px}',
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

  function noteFor() {
    return NOTES[location.pathname.replace(/\/+$/, '')] || null;
  }

  function build(note) {
    var el = document.createElement('section');
    el.id = 'cst-space-note';
    el.setAttribute('data-cst-space-note', VERSION);
    el.innerHTML =
      '<p class="cst-sn-ey">' + STAR + esc(note.eyebrow) + '</p>' +
      '<h2>' + esc(note.heading) + '</h2>' +
      '<div class="cst-sn-panel">' +
      note.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') +
      '</div>';
    return el;
  }

  /* Circle is a single-page app: moving between spaces does not reload, so the
     note has to be removed on the way out as well as added on the way in. */
  function sync() {
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
