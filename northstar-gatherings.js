/* Constellations — North Star Home: gatherings (/c/northstar)
   Created 28 Sep 2026.  VERSION 1.0.0

   Kate, 28 Sep: show gatherings on each home page again, two or three of them.
   The Constellations Home already has that section, drawn by home.js. North
   Star Home never had one — northstar-home.js has no gatherings block and no
   calendar in its CFG.urls.

   This file adds one. It is a separate file on purpose: northstar-home.js is
   50KB and every edit to it means re-committing the whole thing, while this is
   a few lines that can be removed by deleting one script tag. If the section
   ever becomes permanent, fold it into northstar-home.js and delete this file.

   The calendar is the NORTH STAR one (2867669), never the Constellations one.
   Seven members were taken out of the main Gatherings space and would see a
   door to a space they cannot open.

   North Star register: short lines, the date first, a real button rather than
   a small link. If the call fails or nothing is coming up, nothing is drawn —
   no heading is left stranded. */

(function () {
  'use strict';

  var VERSION = '1.0.0';
  var SPACE   = 2867669;            /* North Star Gatherings */
  var CAL     = '/c/nsgatherings';
  var HOME    = '/c/northstar';
  var MAX     = 3;

  var CSS = [
    '#cst-nsev{padding:48px 46px;border-top:1px solid var(--ha)}',
    '#cst-nsev .nsevi{margin:0 0 6px;font-size:19px;max-width:700px}',
    '#cst-nsev .nsev{display:flex;gap:22px;align-items:center;padding:18px 0;',
    'border-top:1px solid var(--ha)}',
    '#cst-nsev .nsev:last-of-type{border-bottom:1px solid var(--ha)}',
    '#cst-nsev .nsevd{width:96px;flex:none;text-align:center;',
    'border:1px solid var(--sl);padding:10px 0}',
    '#cst-nsev .nsevd b{display:block;color:var(--nv);',
    'font:600 34px/1 "Cormorant Garamond",Georgia,serif}',
    '#cst-nsev .nsevd span{font:600 11px Inter,system-ui,sans-serif;',
    'letter-spacing:.14em;text-transform:uppercase;color:var(--mu)}',
    '#cst-nsev .nsevt{flex:1;min-width:0}',
    '#cst-nsev .nsevt h3{margin:0 0 4px;color:var(--nv);',
    'font:600 24px/1.2 "Cormorant Garamond",Georgia,serif}',
    '#cst-nsev .nsevw{display:block;color:var(--mu);',
    'font:500 17px/1.5 Inter,system-ui,sans-serif}',
    '#cst-nsev a.nsevgo{flex:none;display:inline-block;text-decoration:none;',
    'font:600 15px Inter,system-ui,sans-serif;color:var(--nv)!important;',
    'border:1.5px solid var(--nv);padding:11px 20px}',
    '#cst-nsev .nsevm{margin:22px 0 0}',
    '#cst-nsev a.go{display:inline-block;text-decoration:none;',
    'font:600 15px Inter,system-ui,sans-serif;color:var(--gd)!important}',
    '@media (max-width:767px){',
    '#cst-nsev{padding-left:22px;padding-right:22px}',
    '#cst-nsev .sh{font-size:28px}',
    '#cst-nsev .nsev{flex-wrap:wrap;gap:16px}',
    '#cst-nsev .nsevt{flex:1 1 calc(100% - 118px)}',
    '#cst-nsev a.nsevgo{flex-basis:100%;text-align:center}',
    '}'
  ].join('');

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = String(s == null ? '' : s);
    return d.innerHTML;
  }

  function css() {
    if (document.getElementById('cst-nsev-css')) return;
    var s = document.createElement('style');
    s.id = 'cst-nsev-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* The event's own time zone, not the reader's. A gathering announced for
     7 p.m. Eastern should read 7 p.m. Eastern wherever the member is. */
  function when(iso, tz) {
    var d = new Date(iso);
    if (isNaN(d)) return null;
    var o = tz ? { timeZone: tz } : {};
    function f(opts) {
      var x = {}, k;
      for (k in o) x[k] = o[k];
      for (k in opts) x[k] = opts[k];
      try { return new Intl.DateTimeFormat('en-US', x).format(d); }
      catch (e) { return ''; }
    }
    return {
      mon:  f({ month: 'short' }),
      day:  f({ day: 'numeric' }),
      wday: f({ weekday: 'long' }),
      time: f({ hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
              .replace(/\bAM\b/, 'a.m.').replace(/\bPM\b/, 'p.m.')
    };
  }

  function postUrl(p) {
    if (p.url) {
      try { return new URL(p.url, location.origin).pathname; } catch (e) {}
    }
    return '/c/' + (p.space_slug || 'nsgatherings') + '/' + p.slug;
  }

  function rowsFrom(list) {
    var now = Date.now();
    var evs = list.map(function (p) {
      var st = p.event_setting_attributes || p.event_setting || {};
      return { p: p, starts: st.starts_at, tz: st.time_zone,
               kind: st.location_type, place: st.in_person_location };
    }).filter(function (e) {
      return e.starts && new Date(e.starts).getTime() > now;
    }).sort(function (a, b) {
      return new Date(a.starts) - new Date(b.starts);
    }).slice(0, MAX);

    return evs.map(function (e) {
      var w = when(e.starts, e.tz);
      if (!w) return '';
      var place = /person/i.test(e.kind || '') ? (e.place || 'In person') : 'Online';
      return '<div class="nsev">' +
          '<div class="nsevd"><span>' + esc(w.mon) + '</span>' +
            '<b>' + esc(w.day) + '</b></div>' +
          '<div class="nsevt"><h3>' + esc(e.p.name) + '</h3>' +
            '<span class="nsevw">' + esc(w.wday) + ' · ' + esc(w.time) +
            ' · ' + esc(place) + '</span></div>' +
          '<a class="nsevgo" href="' + esc(postUrl(e.p)) + '">Details →</a>' +
        '</div>';
    }).join('');
  }

  var cached = null;   /* rows html, '' means nothing to show */
  var asked  = false;

  function load() {
    if (asked) return;
    asked = true;
    fetch('/internal_api/spaces/' + SPACE + '/posts?per_page=30&sort=latest',
          { credentials: 'same-origin', headers: { accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { cached = rowsFrom(j.records || j.posts || j.events || []); })
      .catch(function () { cached = ''; });
  }

  function build(rows) {
    var sec = document.createElement('section');
    sec.id = 'cst-nsev';
    sec.setAttribute('data-cst-nsev', VERSION);
    sec.innerHTML =
      '<h2 class="sh">Gatherings <b>Coming Up</b></h2>' +
      '<p class="nsevi">These are the next North Star gatherings. ' +
      'Click Details to read about one and sign up.</p>' +
      rows +
      '<p class="nsevm"><a class="go" href="' + esc(CAL) +
        '">See all North Star gatherings →</a></p>';
    return sec;
  }

  /* northstar-home.js tears its root down when you leave the page and rebuilds
     it when you come back, so this has to be re-inserted rather than inserted
     once. The fetch happens only on the first pass. */
  function sync() {
    if (location.pathname.replace(/\/+$/, '') !== HOME) return;

    var root = document.getElementById('cst-nshome');
    if (!root) return;
    if (root.querySelector('#cst-nsev')) return;

    if (cached === null) { load(); return; }
    if (!cached) return;

    css();
    var anchor = root.querySelector('#cst-nsco');
    if (anchor) root.insertBefore(build(cached), anchor);
    else root.appendChild(build(cached));
  }

  function tick() { try { sync(); } catch (e) {} }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  } else {
    tick();
  }
  setInterval(tick, 500);
  window.addEventListener('popstate', tick);
})();
