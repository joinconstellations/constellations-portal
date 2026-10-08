/* month-discussion.js — 1.4.0
 * Adds "This Month's Discussion" to the monthly-theme box on both home pages,
 * directly under the theme text (before Suggested Reading).
 * Content lives in month.json: home.discussion and northstar.discussion.
 * Set a discussion to null to remove it. It also hides itself once `ends` has passed.
 * Uses the home pages' own classes (thsec, thh, tharts, thart, lab2, go), so it
 * inherits their styling. Home pages are not modified.
 *
 * 1.1.0: optional `layout` in month.json per page:
 *   readHeading  renames the Suggested Reading heading
 *   askHeading   renames the Ask Nova heading
 *   plainAsk     removes the Nova explanation and the tinted box around Ask
 * 1.2.0:
 *   excerpts     { article-slug: text } replaces an article's excerpt in Read
 * 1.3.0:
 *   askNote      with plainAsk, keeps one short line (this text) instead of the Nova explanation
 * 1.4.0:
 *   notes        { heading, label, title, text, cta, url } adds its own section after Join
 *                (or under the theme text once Join has expired). Set to null to remove.
 */
(function () {
  'use strict';
  var VERSION = '1.4.0';
  var SRC = 'https://joinconstellations.github.io/constellations-portal/month.json';
  var PAGES = { '/c/welcome': 'home', '/c/northstar': 'northstar' };
  var ID = 'cst-month-disc';
  var NID = 'cst-month-notes';
  var NICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"></path><path d="M14 3v5h5M9 13h6M9 17h6"></path></svg>';
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


  function setHeading(h, text) {
    if (!h || !text) return;
    var nodes = [].filter.call(h.childNodes, function (n) { return n.nodeType === 3; });
    var tn = nodes[nodes.length - 1];
    if (tn) { if (tn.nodeValue !== text) tn.nodeValue = text; }
    else h.appendChild(document.createTextNode(text));
  }

  function tidy(box, key) {
    var L = data && data[key] && data[key].layout;
    if (!L) return;
    if (L.readHeading) {
      var secs = box.querySelectorAll('.thsec');
      for (var i = 0; i < secs.length; i++) {
        if (secs[i].id !== ID && secs[i].id !== NID && secs[i].querySelector('.tharts')) setHeading(secs[i].querySelector('.thh'), L.readHeading);
      }
    }
    if (L.excerpts) {
      var cards = box.querySelectorAll('.thsec:not(#' + ID + '):not(#' + NID + ') .thart');
      for (var j = 0; j < cards.length; j++) {
        var href = cards[j].getAttribute('href') || '';
        var slug = href.replace(/[?#].*$/, '').replace(/\/$/, '').split('/').pop();
        var text = L.excerpts[slug], p = cards[j].querySelector('p');
        if (text && p && p.textContent !== text) p.textContent = text;
      }
    }
    var nova = box.querySelector('.thnova');
    if (!nova) return;
    if (L.askHeading) setHeading(nova.querySelector('.thh'), L.askHeading);
    if (L.plainAsk) {
      var g = nova.querySelector('.thnovagrid');
      var first = g && g.firstElementChild;
      if (first && first.tagName === 'P') {
        if (L.askNote) { if (first.textContent !== L.askNote) first.textContent = L.askNote; }
        else g.removeChild(first);
      }
      if (g) g.style.gridTemplateColumns = '1fr';
      nova.style.background = 'transparent';
      nova.style.padding = '30px 0 0';
      nova.style.marginTop = '34px';
      nova.style.borderTop = '1px solid rgb(230, 227, 220)';
    }
  }

  function notesData() {
    var key = PAGES[location.pathname.replace(/\/$/, '')];
    var n = key && data && data[key] && data[key].notes;
    var list = (Array.isArray(n) ? n : [n]).filter(function (x) { return x && x.title && x.url; });
    return list.length ? list : null;
  }

  function buildNotes(list) {
    var sec = document.createElement('div');
    sec.className = 'thsec';
    sec.id = NID;
    var cards = list.map(function (n) {
      return '<a class="thart" href="' + esc(n.url) + '">' +
          (n.label ? '<span class="lab2">' + esc(n.label) + '</span>' : '') +
          '<h4>' + esc(n.title) + '</h4>' +
          '<p>' + esc(n.text) + '</p>' +
          '<span class="go">' + esc(n.cta || 'Open the notes →') + '</span>' +
        '</a>';
    }).join('');
    sec.innerHTML =
      '<h3 class="thh">' + NICON + esc(list[0].heading || 'Discussion Notes') + '</h3>' +
      '<div><div class="tharts" style="grid-template-columns:' + (list.length > 1 ? 'repeat(auto-fit,minmax(240px,1fr))' : '1fr') + '">' +
        cards +
      '</div></div>';
    return sec;
  }

  function placeNotes(box) {
    var n = notesData();
    var have = document.getElementById(NID);
    if (!n || !box) { if (have) have.remove(); return; }
    var disc = document.getElementById(ID);
    var anchor = (disc && box.contains(disc)) ? disc : box.querySelector('.thhead');
    if (have && box.contains(have) && have.previousElementSibling === anchor) return;
    if (have) have.remove();
    var node = buildNotes(n);
    if (anchor && anchor.nextSibling) box.insertBefore(node, anchor.nextSibling);
    else box.appendChild(node);
  }

  function place() {
    var d = current();
    var box = document.querySelector('.thbox');
    var have = document.getElementById(ID);
    var key = PAGES[location.pathname.replace(/\/$/, '')];
    if (box && key) tidy(box, key);
    if (!d || !box) { if (have && !d) have.remove(); placeNotes(box); return; }
    if (!(have && box.contains(have))) {
      if (have) have.remove();
      var head = box.querySelector('.thhead');
      var node = build(d);
      if (head && head.nextSibling) box.insertBefore(node, head.nextSibling);
      else box.appendChild(node);
    }
    placeNotes(box);
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
