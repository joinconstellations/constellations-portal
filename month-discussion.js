/* month-discussion.js — 1.0.0
 * Adds "This Month's Discussion" to the monthly-theme box on both home pages,
 * directly under the theme text (before Suggested Reading).
 * Content lives in month.json: home.discussion and northstar.discussion.
 * Set a discussion to null to remove it. It also hides itself once `ends` has passed.
 * Uses the home pages' own classes (thsec, thh, tharts, thart, lab2, go), so it
 * inherits their styling. Home pages are not modified.
 */
(function () {
  'use strict';
  var VERSION = '1.0.0';
  var SRC = 'https://joinconstellations.github.io/constellations-portal/month.json';
  var PAGES = { '/c/welcome': 'home', '/c/northstar': 'northstar' };
  var ID = 'cst-month-disc';
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3.5" y="5" width="17" height="15" rx="2"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path></svg>';
  var data = null, loading = false;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function current() {
    var key = PAGES[location.pathname.replace(/\/$/, '')];
    if (!key || !data || !data[key]) return null;
    var d = data[key].discussion;
    if (!d || !d.title || !d.url) return null;
    if (d.ends && new Date(d.ends).getTime() < Date.now()) return null;
    return d;
  }

  function build(d) {
    var sec = document.createElement('div');
    sec.className = 'thsec';
    sec.id = ID;
    sec.innerHTML =
      '<h3 class="thh">' + ICON + esc(d.heading || 'This Month’s Discussion') + '</h3>' +
      '<div><div class="tharts" style="grid-template-columns:1fr">' +
        '<a class="thart" href="' + esc(d.url) + '">' +
          '<span class="lab2">' + esc(d.label) + '</span>' +
          '<h4>' + esc(d.title) + '</h4>' +
          (d.when ? '<p style="margin-bottom:4px"><b>' + esc(d.when) + '</b></p>' : '') +
          '<p>' + esc(d.text) + '</p>' +
          '<span class="go">' + esc(d.cta || 'See details and RSVP →') + '</span>' +
        '</a>' +
      '</div></div>';
    return sec;
  }

  function place() {
    var d = current();
    var box = document.querySelector('.thbox');
    var have = document.getElementById(ID);
    if (!d || !box) { if (have && !d) have.remove(); return; }
    if (have && box.contains(have)) return;
    if (have) have.remove();
    var head = box.querySelector('.thhead');
    var node = build(d);
    if (head && head.nextSibling) box.insertBefore(node, head.nextSibling);
    else box.appendChild(node);
  }

  function load() {
    if (loading || data) return;
    loading = true;
    fetch(SRC + '?v=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { data = j || {}; place(); })
      .catch(function () { data = {}; });
  }

  var t = null;
  new MutationObserver(function () {
    if (!PAGES[location.pathname.replace(/\/$/, '')]) return;
    clearTimeout(t);
    t = setTimeout(function () { if (data) place(); else load(); }, 150);
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.cstMonthDiscussion = { version: VERSION, refresh: place };
  load();
})();
