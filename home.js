/* Constellations — Home page (/c/welcome)
   Loaded from the Head code snippet as:
   <script defer src="https://joinconstellations.github.io/constellations-portal/home.js"></script>
   Runs only on Home. Every live-data block hides itself if its call fails. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- config */

  var VERSION = '1.0.5';

  var CFG = {
    path: '/c/welcome',
    root: 'cst-home',

    spaces: {
      gatherings: 2860065,
      articles:   2860047,
      community:  2862303
    },

    urls: {
      calendar:    '/c/events',
      allArticles: '/c/articles/all-articles',
      discussions: '/c/discussion',
      coaching:    '/c/coaching',
      nova:        '/c/nova',
      profile:       '/account',
      notifications: '/account/notifications',
      report:      '/c/report',
      /* null renders as muted text instead of a dead link */
      beFeatured:          null,   /* '/c/guides/be-featured' once published  */
      connectionRequests:  null,   /* guide not written yet                   */
      clarityIsKindness:   null,   /* guide not written yet                   */
      slowIsSafe:          '/c/guides/slow-is-safe',
      pressureIsPoison:    '/c/guides/pressure-is-poison'
    },

    /* Monthly theme. Placeholder design, approved as interim. */
    month: {
      label: 'September · This month’s theme',
      title: 'Transitions',
      body:  'The in-between. The waiting, the not knowing, and the building of ' +
             'something you can’t see the shape of yet. It runs through the ' +
             'articles, the discussions and the gatherings all month.',
      next:  'Next month · Masking'
    },

    /* Name up to three article slugs to override this week's rotation. */
    featuredArticles: [],

    /* Reading order runs from the earliest published date. Week 0 starts here. */
    rotationEpoch: '2026-08-31T00:00:00Z',

    memberLabels:  ['NEW MEMBER', 'FEATURED MEMBER'],
    featureLabels: ['PASSION PROJECTS', 'THREE QUESTIONS', 'GOOD COMPANY',
                    'A FEW MINUTES WITH', 'WORTH SHARING', 'QUOTE', 'MEMBER STORY'],

    /* Must be quoted from the Community Guidelines Agreement, never written
       here. While this is empty the reminders panel is hidden and the block
       runs full width. */
    reminders: [],

    /* Card link text. The card already shows the content, so the link only
       needs to say where it goes. Name a format here to override it. */
    featureLink: {}
  };

  /* --------------------------------------------------------------- helpers */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function decode(s) {
    var d = document.createElement('textarea');
    d.innerHTML = String(s == null ? '' : s);
    return d.value;
  }

  function el(html) {
    var t = document.createElement('div');
    t.innerHTML = html;
    return t.firstElementChild;
  }

  function onHome() {
    return location.pathname.replace(/\/+$/, '') === CFG.path;
  }

  function get(url) {
    return fetch(url, {
      credentials: 'same-origin',
      headers: { accept: 'application/json' }
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  function records(json) {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    return json.records || json.posts || json.events || [];
  }

  function posts(spaceId, perPage) {
    return get('/internal_api/spaces/' + spaceId + '/posts?per_page=' +
               (perPage || 30) + '&sort=latest').then(records);
  }

  /* Text of a tiptap node tree. */
  function nodeText(node) {
    if (!node) return '';
    if (node.text) return node.text;
    return (node.content || []).map(nodeText).join('');
  }

  /* Ordered list of {type, text, node} blocks, from tiptap or from body HTML. */
  function blocks(post) {
    var out = [];
    var body = post && post.tiptap_body && post.tiptap_body.body;

    if (body && body.content) {
      body.content.forEach(function (n) {
        var t = n.type;
        if (t === 'paragraph')        out.push({ type: 'p',    text: nodeText(n).trim(), node: n });
        else if (t === 'heading')     out.push({ type: 'h',    text: nodeText(n).trim(), node: n });
        else if (t === 'image')       out.push({ type: 'img',  text: '',                 node: n });
        else if (t === 'bulletList')  out.push({ type: 'ul',   text: '',                 node: n });
        else if (t === 'orderedList') out.push({ type: 'ol',   text: '',                 node: n });
      });
      return out;
    }

    var html = (post && post.body && post.body.body) || post.truncated_content || '';
    if (!html) return out;
    var d = document.createElement('div');
    d.innerHTML = html;
    [].forEach.call(d.children, function (c) {
      var tag = c.tagName.toLowerCase();
      if (tag === 'p')                      out.push({ type: 'p',   text: c.textContent.trim(), dom: c });
      else if (/^h[1-6]$/.test(tag))        out.push({ type: 'h',   text: c.textContent.trim(), dom: c });
      else if (tag === 'img')               out.push({ type: 'img', text: '',                   dom: c });
      else if (tag === 'ul')                out.push({ type: 'ul',  text: '',                   dom: c });
      else if (tag === 'ol')                out.push({ type: 'ol',  text: '',                   dom: c });
    });
    return out;
  }

  function paragraphs(post) {
    return blocks(post).filter(function (b) { return b.type === 'p' && b.text; })
                       .map(function (b) { return decode(b.text); });
  }

  function label(post) {
    var p = paragraphs(post);
    return p.length ? p[0].toUpperCase().replace(/\s+/g, ' ').trim() : '';
  }

  function photo(post) {
    var att = post && post.tiptap_body && post.tiptap_body.inline_attachments;
    if (att && att.length) {
      for (var i = 0; i < att.length; i++) {
        var a = att[i];
        if (a.content_type && a.content_type.indexOf('image') !== 0) continue;
        var v = a.image_variants || {};
        return v.medium || v.large || v.original || a.url || '';
      }
    }
    var b = blocks(post);
    for (var j = 0; j < b.length; j++) {
      if (b[j].type !== 'img') continue;
      if (b[j].node && b[j].node.attrs && b[j].node.attrs.url) return b[j].node.attrs.url;
      if (b[j].dom) return b[j].dom.getAttribute('src') || '';
    }
    return '';
  }

  /* Items of the first list of the given type. */
  function listItems(post, kind) {
    var b = blocks(post);
    for (var i = 0; i < b.length; i++) {
      if (b[i].type !== kind) continue;
      if (b[i].node) {
        return (b[i].node.content || []).map(function (li) {
          var lead = '';
          var para = (li.content || [])[0];
          if (para && para.content && para.content[0]) {
            var first = para.content[0];
            if (first.marks && first.marks.some(function (m) { return m.type === 'bold'; })) {
              lead = first.text || '';
            }
          }
          return { lead: lead, text: nodeText(li).trim() };
        });
      }
      if (b[i].dom) {
        return [].map.call(b[i].dom.children, function (li) {
          var strong = li.querySelector('strong');
          return { lead: strong ? strong.textContent : '', text: li.textContent.trim() };
        });
      }
    }
    return [];
  }

  function postUrl(post, fallbackSpace) {
    if (post.url) {
      try { return new URL(post.url, location.origin).pathname; } catch (e) {}
    }
    return '/c/' + (post.space_slug || fallbackSpace) + '/' + post.slug;
  }

  function when(iso, tz) {
    var d = new Date(iso);
    if (isNaN(d)) return null;
    var o = tz ? { timeZone: tz } : {};
    function f(opts) {
      var x = {}; for (var k in o) x[k] = o[k]; for (var k2 in opts) x[k2] = opts[k2];
      try { return new Intl.DateTimeFormat('en-US', x).format(d); } catch (e) { return ''; }
    }
    return {
      mon:  f({ month: 'short' }),
      day:  f({ day: 'numeric' }),
      wday: f({ weekday: 'long' }),
      time: f({ hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
               .replace(/\bAM\b/, 'a.m.').replace(/\bPM\b/, 'p.m.')
    };
  }

  function linkOr(href, text, cls) {
    return href
      ? '<a class="' + cls + '" href="' + esc(href) + '">' + esc(text) + ' →</a>'
      : '<span class="' + cls + ' cst-soon">' + esc(text) + '</span>';
  }

  /* ------------------------------------------------------------------- css */

  var CSS = [
    '#cst-home{--nv:#1A2238;--ik:#22231E;--mu:#5A5849;--gd:#7D6220;--sl:#CBBBA0;',
    '--sa:#F2EADF;--s2:#F5EDE1;--ha:#E6E3DC;background:#fff;border:1px solid var(--ha);',
    'color:var(--ik);font:17px/1.55 "EB Garamond",Georgia,serif;margin:0 0 20px}',
    '#cst-home *{box-sizing:border-box}',
    '#cst-home section{padding:38px 46px;border-top:1px solid var(--ha)}',
    '#cst-home .cst-mast{border-top:0;padding:46px 46px 38px}',
    '#cst-home .ey{font:600 11px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;',
    'text-transform:uppercase;color:var(--mu);margin:0 0 14px}',
    '#cst-home .ey.big{font-size:19px;letter-spacing:.18em;margin-bottom:20px}',
    '#cst-home h1{font:600 58px/1.05 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:0}',
    '#cst-home h3{font:600 21px/1.2 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:0 0 4px}',
    '#cst-home .sh{font:500 32px/1.1 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:0 0 18px}',
    '#cst-home .sh b{font-weight:600}',
    '#cst-home .bar{width:72px;height:4px;background:var(--sl);margin:18px 0 30px}',
    '#cst-home a.go{display:inline-block;font:600 14px Inter,system-ui,sans-serif;',
    'color:var(--gd)!important;text-decoration:none}',
    '#cst-home .btn{display:inline-block;padding:9px 14px;border:1px solid var(--sl);',
    'color:var(--nv)!important;font:600 13px Inter,system-ui,sans-serif;text-decoration:none;white-space:nowrap}',
    '#cst-home .cst-soon{color:var(--mu);font:600 14px Inter,system-ui,sans-serif}',
    /* month */
    '#cst-home .month{background:var(--s2);padding:26px 30px 22px;border-left:3px solid var(--gd)}',
    '#cst-home .mlab{margin:0 0 6px;font:600 11px Inter,system-ui,sans-serif;letter-spacing:.16em;',
    'text-transform:uppercase;color:var(--gd)}',
    '#cst-home .month h2{font:600 32px/1.1 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:0 0 10px}',
    '#cst-home .tp{margin:0;font-size:18px;line-height:1.6;max-width:640px}',
    '#cst-home .nextm{margin:16px 0 0;font:600 11px Inter,system-ui,sans-serif;letter-spacing:.16em;',
    'text-transform:uppercase;color:var(--mu)}',
    /* gatherings */
    '#cst-home .ev{display:flex;gap:20px;align-items:center;padding:14px 0;border-top:1px solid var(--ha)}',
    '#cst-home .ev:last-of-type{border-bottom:1px solid var(--ha)}',
    '#cst-home .date{width:86px;flex:none;text-align:center;border:1px solid var(--sl);padding:8px 0}',
    '#cst-home .date b{display:block;font:600 30px/1 "Cormorant Garamond",Georgia,serif;color:var(--nv)}',
    '#cst-home .date span{font:600 10.5px Inter,system-ui,sans-serif;letter-spacing:.14em;',
    'text-transform:uppercase;color:var(--gd)}',
    '#cst-home .where{font:500 13px Inter,system-ui,sans-serif;color:var(--mu)}',
    /* articles */
    '#cst-home .arts{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}',
    '#cst-home .ac{border:1px solid var(--ha);padding:18px 20px 20px;text-decoration:none;',
    'color:inherit!important;display:block}',
    '#cst-home .ac h3{margin:8px 0 6px}',
    '#cst-home .ac p{margin:0;font-size:16px;color:var(--mu)}',
    '#cst-home .lab2{font:600 10.5px Inter,system-ui,sans-serif;letter-spacing:.14em;',
    'text-transform:uppercase;color:var(--gd)}',
    /* members */
    '#cst-home .ppl{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}',
    '#cst-home .pc{border:1px solid var(--ha);padding:18px 18px 20px;display:flex;flex-direction:column}',
    '#cst-home .pc .who{display:flex;gap:12px;align-items:center;margin-bottom:12px}',
    '#cst-home .pc .ph{width:60px;height:60px;border-radius:50%;background:var(--sa);',
    'border:1px solid var(--sl);flex:none;object-fit:cover;display:flex;align-items:center;',
    'justify-content:center;font:600 22px "Cormorant Garamond",Georgia,serif;color:var(--nv)}',
    '#cst-home .pc .meta{font:500 12px Inter,system-ui,sans-serif;letter-spacing:.06em;color:var(--mu)}',
    '#cst-home .pc .lab{font:600 10.5px Inter,system-ui,sans-serif;letter-spacing:.14em;',
    'text-transform:uppercase;color:var(--gd);margin-bottom:4px}',
    '#cst-home .pc p{margin:0 0 14px;font-size:16px;flex:1}',
    /* features */
    '#cst-home .spot{display:flex;gap:30px;align-items:flex-start}',
    '#cst-home .spot+.spot{margin-top:34px;padding-top:34px;border-top:1px solid var(--ha)}',
    '#cst-home .spot img{width:200px;height:250px;object-fit:cover;object-position:50% 20%;',
    'border:1px solid var(--sl);box-shadow:10px 10px 0 var(--sa);flex:none}',
    '#cst-home .spot h2{font:600 30px/1.1 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:8px 0 4px}',
    '#cst-home .spot .role{margin:0 0 10px;font:italic 500 19px "Cormorant Garamond",Georgia,serif;color:var(--gd)}',
    '#cst-home .spot p{margin:0 0 12px}',
    '#cst-home .tq{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:4px 0 14px;font-size:16px}',
    '#cst-home .q2{display:block;margin:0 0 4px;font:600 10.5px Inter,system-ui,sans-serif;',
    'letter-spacing:.14em;text-transform:uppercase;color:var(--gd)}',
    /* be featured / discussions / messages */
    '#cst-home .feat-me{display:flex;justify-content:space-between;align-items:center;gap:30px;',
    'background:var(--s2);padding:26px 28px;border-left:3px solid var(--gd)}',
    '#cst-home .feat-me .btn{background:#fff}',
    '#cst-home .disc{display:flex;justify-content:space-between;align-items:center;gap:30px}',
    '#cst-home .msg{display:grid;grid-template-columns:1.3fr 1fr;gap:28px;align-items:start}',
    '#cst-home .msg h2{font:600 30px/1.1 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:0 0 6px}',
    '#cst-home .msg .panel{background:var(--s2);padding:22px 24px}',
    '#cst-home .msg ul{margin:8px 0 0;padding-left:18px;font-size:16px}',
    '#cst-home .msg li{margin:4px 0}',
    /* first steps */
    '#cst-home .lead{font-size:17px;line-height:1.6;color:var(--ik);margin:0 0 22px;max-width:780px}',
    '#cst-home .stepn{display:block;font:500 26px/1 "Cormorant Garamond",Georgia,serif;',
    'color:var(--sl);margin:0 0 6px}',
    /* where to go */
    '#cst-home .help{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--ha)}',
    '#cst-home .hp{padding:22px 22px 24px;font-size:16px;line-height:1.45;display:flex;flex-direction:column}',
    '#cst-home .hp+.hp{border-left:1px solid var(--ha)}',
    '#cst-home .hp .use{font:600 10.5px Inter,system-ui,sans-serif;letter-spacing:.14em;',
    'text-transform:uppercase;color:var(--gd);margin:12px 0 4px}',
    '#cst-home .hp .not{color:var(--mu);font-size:15px}',
    '#cst-home .hp .go{margin-top:auto;padding-top:14px}',
    /* footer */
    '#cst-home .foot{padding:28px 46px;border-top:1px solid var(--ha);background:#FAF8F4}',
    '#cst-home .pr{display:flex;gap:34px;flex-wrap:wrap}',
    '#cst-home .pr a,#cst-home .pr span{font:600 22px "Cormorant Garamond",Georgia,serif;',
    'color:var(--nv)!important;text-decoration:none;border-bottom:1px solid var(--sl)}',
    '#cst-home .pr span{color:var(--mu)!important;border-bottom:1px dashed var(--sl)}',
    '#cst-home .nb{white-space:nowrap}',
    '#cst-home .ac p{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}',
    '#cst-home .pc .who{min-height:62px;align-items:flex-start}',
    '#cst-home .pc .who>div{padding-top:4px}',
    '#cst-home .msg.cst-one{grid-template-columns:1fr}',
    '#cst-home .btn.cst-quiet{color:var(--mu)!important;border-style:dashed;background:transparent}',
    /* phone */
    '@media (max-width:767px){',
    '#cst-home section,#cst-home .cst-mast,#cst-home .foot{padding-left:22px;padding-right:22px}',
    '#cst-home h1{font-size:40px}',
    '#cst-home .sh{font-size:26px}',
    '#cst-home .arts,#cst-home .ppl,#cst-home .help,#cst-home .tq,#cst-home .msg{grid-template-columns:1fr}',
    '#cst-home .hp+.hp{border-left:0;border-top:1px solid var(--ha)}',
    '#cst-home .spot{flex-direction:column;gap:20px}',
    '#cst-home .spot img{width:150px;height:188px;box-shadow:8px 8px 0 var(--sa)}',
    '#cst-home .feat-me,#cst-home .disc{flex-direction:column;align-items:flex-start;gap:18px}',
    '#cst-home .ev{flex-wrap:wrap;gap:14px}',
    '#cst-home .ev>div:nth-child(2){min-width:calc(100% - 100px)}',
    '#cst-home .ev .btn{flex-basis:100%;text-align:center}',
    '}'
  ].join('');

  /* -------------------------------------------------------------- sections */

  function mastheadHTML() {
    var m = CFG.month;
    return '' +
      '<section class="cst-mast">' +
        '<p class="ey big">Constellations Member Portal</p>' +
        '<h1>Welcome. We’re glad you’re here.</h1>' +
        '<div class="bar"></div>' +
        '<div class="month">' +
          '<p class="mlab">' + esc(m.label) + '</p>' +
          '<h2>' + esc(m.title) + '</h2>' +
          '<p class="tp">' + esc(m.body) + '</p>' +
          '<p class="nextm">' + esc(m.next) + '</p>' +
        '</div>' +
      '</section>';
  }

  /* First steps. Mirrors the Get started checklist so the two never drift:
     Portal Profile, Notifications, Nova, in that order. */
  function stepsHTML() {
    var u = CFG.urls;
    return '' +
      '<section>' +
        '<h2 class="sh">First <b>steps</b></h2>' +
        '<p class="lead">These three take a few minutes each, and they shape the rest of ' +
          'your time here \u2014 how people find you, what reaches you, and where to turn ' +
          'when you\u2019re not sure.</p>' +
        '<div class="help">' +
          '<div class="hp"><span class="stepn">1</span><h3>Complete your profile</h3>' +
            'Share a little about yourself so other members can get to know you.' +
            '<span class="use">Your photograph</span>' +
            'Use the one our team emailed you, with the cream background. It keeps every ' +
            'profile in the portal looking like part of the same place.' +
            '<a class="go" href="' + esc(u.profile) + '">Complete profile \u2192</a></div>' +
          '<div class="hp"><span class="stepn">2</span><h3>Customize your notifications</h3>' +
            'You decide what reaches you, and how often.' +
            '<span class="use">Keeps you posted on</span>' +
            'Connection requests, upcoming gatherings, new articles, and replies to your posts.' +
            '<a class="go" href="' + esc(u.notifications) + '">Customize notifications \u2192</a></div>' +
          '<div class="hp"><span class="stepn">3</span><h3>Meet Nova</h3>' +
            'The Constellations assistant, available at any hour.' +
            '<span class="use">Good for</span>' +
            'Questions about how the portal works, or practicing what you want to say ' +
            'before you say it.' +
            '<span class="not">Nova is not a person. For a concern about someone, use ' +
            'Report a Concern.</span>' +
            '<a class="go" href="' + esc(u.nova) + '">Open Nova \u2192</a></div>' +
        '</div>' +
      '</section>';
  }

  function staticHTML() {
    var u = CFG.urls;
    return '' +
      /* be featured */
      '<section>' +
        '<div class="feat-me">' +
          '<div>' +
            '<h2 class="sh" style="margin-bottom:6px">Would you like to be <b>featured</b>?</h2>' +
            '<p style="margin:0">Share a few answers, something you made, a pet, or a ' +
            'recommendation. You approve everything before it goes up.</p>' +
          '</div>' +
          (u.beFeatured
            ? '<a class="btn" href="' + esc(u.beFeatured) + '">See the ways to be featured →</a>'
            : '<span class="btn cst-quiet">See the ways to be featured</span>') +
        '</div>' +
      '</section>' +

      /* discussions */
      '<section>' +
        '<h2 class="sh">Have you joined a <b>discussion</b> yet?</h2>' +
        '<div class="disc">' +
          '<p style="margin:0">Open conversations across the community. You’re welcome to ' +
          'read without posting for as long as you like.</p>' +
          '<a class="btn" href="' + esc(u.discussions) + '">Go to Discussions →</a>' +
        '</div>' +
      '</section>' +

      /* direct messages */
      '<section>' +
        '<h2 class="sh"><b>Direct Messages</b> &amp; Connection Requests</h2>' +
        '<div class="msg' + (CFG.reminders.length ? '' : ' cst-one') + '">' +
          '<div>' +
            '<h2>Reaching out to another member</h2>' +
            '<p style="margin:6px 0 14px">Every conversation here starts with a Connection ' +
            'Request. Our short guide covers how to send one, what happens next, and how to ' +
            'keep it comfortable for both of you.</p>' +
            linkOr(u.connectionRequests, 'How Connection Requests Work', 'go') +
          '</div>' +
          (CFG.reminders.length
            ? '<div class="panel">' +
                '<p class="ey" style="margin-bottom:8px">Friendly reminders</p>' +
                '<ul>' + CFG.reminders.map(function (r) {
                  return '<li>' + esc(r) + '</li>';
                }).join('') + '</ul>' +
              '</div>'
            : '') +
        '</div>' +
      '</section>' +

      /* where to go */
      '<section>' +
        '<h2 class="sh">Where to <b>go</b></h2>' +
        '<div class="help">' +
          '<div class="hp"><h3>Book coaching</h3>One-to-one time with a coach.' +
            '<span class="use">Use it for</span>Working through something specific, like a ' +
            'first date, a message you’re stuck on, or a plan.' +
            '<span class="use">Good to know</span>' +
            '<span class="not">Booked and paid for separately from membership.</span>' +
            '<a class="go" href="' + esc(u.coaching) + '">See coaching →</a></div>' +
          '<div class="hp"><h3>Ask Nova</h3>The Constellations assistant.' +
            '<span class="use">Use it for</span>Quick questions about the portal, how things ' +
            'work here, or practicing what to say.' +
            '<span class="use">Good to know</span>' +
            '<span class="not">Nova is not a person. For a concern about someone, use ' +
            'Report a Concern.</span>' +
            '<a class="go" href="' + esc(u.nova) + '">Open Nova →</a></div>' +
          '<div class="hp"><h3>Report a concern</h3>A private route to our team.' +
            '<span class="use">Use it for</span>When someone’s behavior worries you, or ' +
            'something doesn’t feel right.' +
            '<span class="use">Good to know</span>' +
            '<span class="not">A person acknowledges it within two business days. You don’t ' +
            'have to give your name.</span>' +
            '<a class="go" href="' + esc(u.report) + '">Report a concern →</a></div>' +
        '</div>' +
      '</section>' +

      /* footer */
      '<div class="foot">' +
        '<p class="ey">Our Guiding Principles</p>' +
        '<div class="pr">' +
          (u.clarityIsKindness
            ? '<a href="' + esc(u.clarityIsKindness) + '">Clarity Is Kindness</a>'
            : '<span>Clarity Is Kindness</span>') +
          '<a href="' + esc(u.slowIsSafe) + '">Slow Is Safe</a>' +
          '<a href="' + esc(u.pressureIsPoison) + '">Pressure Is Poison</a>' +
        '</div>' +
      '</div>';
  }

  /* --------------------------------------------------------- live sections */

  function fillGatherings(mount) {
    return posts(CFG.spaces.gatherings, 20).then(function (rs) {
      var now = Date.now();
      var evs = rs.map(function (p) {
        var s = p.event_setting_attributes || p.event_setting || {};
        return { p: p, starts: s.starts_at, tz: s.time_zone,
                 kind: s.location_type, place: s.in_person_location };
      }).filter(function (e) {
        return e.starts && new Date(e.starts).getTime() > now;
      }).sort(function (a, b) {
        var pa = a.p.pinned_at ? 0 : 1, pb = b.p.pinned_at ? 0 : 1;
        if (pa !== pb) return pa - pb;
        return new Date(a.starts) - new Date(b.starts);
      }).slice(0, 2);

      if (!evs.length) return;

      var rows = evs.map(function (e) {
        var w = when(e.starts, e.tz);
        if (!w) return '';
        var place = /person|in_person/i.test(e.kind || '')
          ? (e.place || 'In person') : 'Online';
        return '<div class="ev">' +
            '<div class="date"><span>' + esc(w.mon) + '</span><b>' + esc(w.day) + '</b></div>' +
            '<div style="flex:1"><h3>' + esc(e.p.name) + '</h3>' +
              '<span class="where">' + esc(w.wday) + ' · ' + esc(w.time) + ' · ' +
              esc(place) + '</span></div>' +
            '<a class="btn" href="' + esc(postUrl(e.p, 'events')) + '">Details</a>' +
          '</div>';
      }).join('');

      mount.appendChild(el(
        '<section><h2 class="sh">Featured <b>Gathering</b></h2>' + rows +
        '<p style="margin:14px 0 0"><a class="go" href="' + esc(CFG.urls.calendar) +
        '">See the full calendar →</a></p></section>'));
    });
  }

  function fillArticles(mount) {
    return posts(CFG.spaces.articles, 60).then(function (rs) {
      var all = rs.filter(function (p) {
        return p.slug && p.slug !== 'all-articles' && p.published_at;
      }).sort(function (a, b) {
        return new Date(a.published_at) - new Date(b.published_at);
      });
      if (!all.length) return;

      var pick;
      if (CFG.featuredArticles.length) {
        pick = CFG.featuredArticles.map(function (s) {
          return all.filter(function (p) { return p.slug === s; })[0];
        }).filter(Boolean);
      }
      if (!pick || pick.length !== 3) {
        var week = Math.floor(
          (Date.now() - new Date(CFG.rotationEpoch).getTime()) / 6048e5);
        if (week < 0) week = 0;
        pick = [0, 1, 2].map(function (i) {
          return all[((week * 3 + i) % all.length + all.length) % all.length];
        });
      }

      var cards = pick.map(function (p) {
        var ps = paragraphs(p);
        var head = ps[0] || '';
        var lede = ps[1] || '';
        /* fall back to truncated_content when the body is not in the payload */
        if (!head && p.truncated_content) {
          var t = decode(String(p.truncated_content).replace(/<[^>]+>/g, '\n')).split('\n')
                    .map(function (x) { return x.trim(); }).filter(Boolean);
          head = t[0] || ''; lede = t[1] || '';
        }
        var bits = head.split(/\s*·\s*/);
        var headHTML = bits.length > 1
          ? esc(bits[0]) + ' · <span class="nb">' + esc(bits.slice(1).join(' · ')) + '</span>'
          : esc(head);
        return '<a class="ac" href="' + esc(postUrl(p, 'articles')) + '">' +
            '<span class="lab2">' + headHTML + '</span>' +
            '<h3>' + esc(p.name) + '</h3>' +
            '<p>' + esc(lede) + '</p></a>';
      }).join('');

      mount.appendChild(el(
        '<section><h2 class="sh">Featured <b>Articles</b></h2>' +
        '<div class="arts">' + cards + '</div>' +
        '<p style="margin:16px 0 0"><a class="go" href="' + esc(CFG.urls.allArticles) +
        '">All articles →</a></p></section>'));
    });
  }

  function fillCommunity(mount) {
    return posts(CFG.spaces.community, 30).then(function (rs) {
      var live = rs.filter(function (p) {
        return p.published_at && p.slug &&
               (!p.status || p.status === 'published');
      }).sort(function (a, b) {
        return new Date(b.published_at) - new Date(a.published_at);
      });

      var people = [], features = [];
      live.forEach(function (p) {
        var l = label(p);
        if (CFG.memberLabels.indexOf(l) > -1) { if (people.length < 3) people.push(p); }
        else if (CFG.featureLabels.indexOf(l) > -1) { if (features.length < 2) features.push(p); }
      });

      var html = '';

      if (people.length) {
        var cards = people.map(function (p) {
          var ps = paragraphs(p);
          var meta = ps[1] || '';
          var hello = (listItems(p, 'ul')[0] || {}).text || '';
          var src = photo(p);
          var face = src
            ? '<img class="ph" src="' + esc(src) + '" alt="">'
            : '<div class="ph">' + esc((p.name || '?').replace(/^Meet\s+/i, '').charAt(0)) + '</div>';
          var who = (p.name || '').replace(/^Meet\s+/i, '');
          return '<div class="pc"><div class="who">' + face +
              '<div><h3>' + esc(who) + '</h3>' +
              '<span class="meta">' + esc(meta) + '</span></div></div>' +
              (hello ? '<div class="lab">Say hello if</div><p>' + esc(hello) + '</p>'
                     : '<p></p>') +
              '<a class="go" href="' + esc(postUrl(p, 'community')) + '">Meet ' +
              esc(who) + ' →</a></div>';
        }).join('');
        html += '<section><h2 class="sh">Our <b>Community</b></h2>' +
                '<div class="ppl">' + cards + '</div></section>';
      }

      if (features.length) {
        var spots = features.map(function (p) {
          var l    = label(p);
          var ps   = paragraphs(p).slice(1);
          var src  = photo(p);
          var cta  = CFG.featureLink[l] || 'View Post';
          var role = '', body = '';

          if (ps.length && ps[0].length <= 90) { role = ps[0]; body = ps[1] || ''; }
          else { body = ps[0] || ''; }

          var mid;
          if (l === 'THREE QUESTIONS') {
            var qs = listItems(p, 'ol').slice(0, 3);
            mid = qs.length
              ? '<div class="tq">' + qs.map(function (q) {
                  var ans = q.lead ? q.text.slice(q.lead.length).trim() : q.text;
                  return '<div>' + (q.lead ? '<span class="q2">' + esc(q.lead) + '</span>' : '') +
                         esc(ans) + '</div>';
                }).join('') + '</div>'
              : '';
          } else {
            mid = body ? '<p>' + esc(body) + '</p>' : '';
          }

          return '<div class="spot">' +
              (src ? '<img src="' + esc(src) + '" alt="">' : '') +
              '<div><span class="lab2">' + esc(l) + '</span>' +
              '<h2>' + esc(p.name) + '</h2>' +
              (role ? '<p class="role">' + esc(role) + '</p>' : '') +
              mid +
              '<a class="go" href="' + esc(postUrl(p, 'community')) + '">' +
              esc(cta) + ' →</a></div></div>';
        }).join('');
        html += '<section style="border-top:0;padding-top:6px">' + spots + '</section>';
      }

      if (html) mount.appendChild(el('<div>' + html + '</div>'));
    });
  }

  /* ----------------------------------------------------------------- mount */

  function style() {
    if (document.getElementById('cst-home-css')) return;
    var s = document.createElement('style');
    s.id = 'cst-home-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function anchor() {
    var nvx = document.getElementById('nvx-space');
    if (nvx && nvx.parentElement) return nvx;
    var feed = document.querySelector('.react-page-space-show .flex.flex-col');
    return feed || null;
  }

  function hideOld() {
    var nvx = document.getElementById('nvx-space');
    if (nvx && nvx.style.display !== 'none') nvx.style.display = 'none';
  }

  function build() {
    if (!onHome()) return;
    /* Circle re-renders its own nodes, so re-assert the hide every tick. */
    if (document.getElementById(CFG.root)) { hideOld(); return; }

    var host = anchor();
    if (!host || !host.parentElement) return;

    style();

    var root = document.createElement('div');
    root.id = CFG.root;
    root.setAttribute('data-cst-home', VERSION);
    /* Three fixed slots keep the running order steady no matter which
       request answers first. */
    root.innerHTML = mastheadHTML() +
                     stepsHTML() +
                     '<div id="cst-ev"></div>' +
                     '<div id="cst-ar"></div>' +
                     '<div id="cst-co"></div>' +
                     staticHTML();
    host.parentElement.insertBefore(root, host);
    hideOld();

    /* Each block is independent and silent on failure. */
    fillGatherings(root.querySelector('#cst-ev')).catch(function () {});
    fillArticles(root.querySelector('#cst-ar')).catch(function () {});
    fillCommunity(root.querySelector('#cst-co')).catch(function () {});
  }

  function teardown() {
    var r = document.getElementById(CFG.root);
    var nvx = document.getElementById('nvx-space');
    if (nvx) {
      nvx.style.display = '';
      /* React sometimes reconciles Circle's own node inside ours; put it back
         before removing ours, so nothing of Circle's goes with it. */
      if (r && r.contains(nvx) && r.parentElement) {
        r.parentElement.insertBefore(nvx, r);
      }
    }
    if (r) r.remove();
  }

  var lastPath = null;

  function tick() {
    var p = location.pathname;
    if (p !== lastPath) {
      lastPath = p;
      if (!onHome()) teardown();
    }
    if (onHome()) build();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tick);
  } else {
    tick();
  }
  setInterval(tick, 500);
  window.addEventListener('popstate', tick);
})();
