/* Constellations — North Star Home (/c/northstar)
   Loaded from the Head code snippet as:
   <script defer src="https://joinconstellations.github.io/constellations-portal/northstar-home.js"></script>
   Mirrors the Constellations Home, written in North Star register: shorter
   sentences, one idea at a time, larger type. Runs only on /c/northstar.
   Every live-data block hides itself if its call fails. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- config */

  var VERSION = '1.0.1';

  var CFG = {
    path: '/c/northstar',
    root: 'cst-nshome',

    spaces: {
      gatherings: 2867669,   /* North Star Gatherings */
      articles:   2867665,   /* North Star Articles   */
      community:  2870142    /* North Star Community  */
    },

    urls: {
      calendar:    '/c/nsgatherings',
      allArticles: '/c/nsarticles/north-star-all-articles',
      discussions: '/c/nsdiscussions',
      community:   '/c/ns-community',
      nova:        '/c/nsnova',
      guides:      '/c/guides',          /* there is no nsguides space */
      coaching:    '/c/coaching',
      report:      '/c/report',
      profile:       '/account',
      notifications: '/account/notifications',
      /* null hides the row instead of leaving a dead link */
      yourProfile:         '/c/guides/your-portal-profile',
      addToHomeScreen:     '/c/guides/add-to-home-screen',
      notificationsGuide:  null,
      connectionRequests:  null,
      clarityIsKindness:   null,
      slowIsSafe:          '/c/guides/slow-is-safe',
      pressureIsPoison:    '/c/guides/pressure-is-poison'
    },

    /* Kate's approved North Star explainer. Do not reword without her. */
    what: [
      'North Star is a more structured part of Constellations designed for ' +
      'members who’d like more support, guidance, and moderation as they ' +
      'participate in our community.',
      'Look for the blue heading. Whenever you see it, you are in a North Star space.'
    ],

    /* Monthly theme, in North Star register. Mirrors the Constellations Home. */
    month: {
      label: 'September · This month’s theme',
      title: 'Transitions',
      body:  'A transition is an in-between time. You are waiting. You do not ' +
             'know yet how something will turn out. You are building something ' +
             'you cannot see the shape of yet. Our articles, discussions and ' +
             'gatherings are about this all month.',
      next:  'Next month · Masking'
    },

    /* Name up to three article slugs to override this week's rotation. */
    featuredArticles: [],

    /* Reading order runs from the earliest published date. Week 0 starts here. */
    rotationEpoch: '2026-08-31T00:00:00Z',

    memberLabels:  ['NEW MEMBER', 'FEATURED MEMBER'],
    featureLabels: ['PASSION PROJECTS', 'THREE QUESTIONS', 'GOOD COMPANY',
                    'A FEW MINUTES WITH', 'WORTH SHARING', 'QUOTE', 'MEMBER STORY'],

    featureLink: {},

    /* The six North Star doorways. Kept from the page they replace. */
    doors: [
      { title: 'Discussions', href: '/c/nsdiscussions',
        body: 'Chat with other members, react with emojis, or just read. You do not have to post.' },
      { title: 'Articles', href: '/c/nsarticles',
        body: 'Read and learn about social skills, friendship, dating, and more.' },
      { title: 'Community', href: '/c/ns-community',
        body: 'Meet and get to know other members — their stories, interests, and experiences.' },
      { title: 'Gatherings', href: '/c/nsgatherings',
        body: 'See and sign up for virtual and in-person meetups.' },
      { title: 'Nova', href: '/c/nsnova',
        body: 'Ask Nova a question. It can help with dating, friendship, messages, and how the portal works.' },
      { title: 'Guides', href: '/c/guides',
        body: 'Read our guides to learn how our community works and what we expect of our members.' }
    ]
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

  function nodeText(node) {
    if (!node) return '';
    if (node.text) return node.text;
    return (node.content || []).map(nodeText).join('');
  }

  function blocks(post) {
    var out = [];
    var body = post && post.tiptap_body && post.tiptap_body.body;

    if (body && body.content) {
      body.content.forEach(function (n) {
        var t = n.type;
        if (t === 'paragraph')        out.push({ type: 'p',   text: nodeText(n).trim(), node: n });
        else if (t === 'heading')     out.push({ type: 'h',   text: nodeText(n).trim(), node: n });
        else if (t === 'image')       out.push({ type: 'img', text: '',                 node: n });
        else if (t === 'bulletList')  out.push({ type: 'ul',  text: '',                 node: n });
        else if (t === 'orderedList') out.push({ type: 'ol',  text: '',                 node: n });
      });
      return out;
    }

    var html = (post && post.body && post.body.body) || post.truncated_content || '';
    if (!html) return out;
    var d = document.createElement('div');
    d.innerHTML = html;
    [].forEach.call(d.children, function (c) {
      var tag = c.tagName.toLowerCase();
      if (tag === 'p')               out.push({ type: 'p',   text: c.textContent.trim(), dom: c });
      else if (/^h[1-6]$/.test(tag)) out.push({ type: 'h',   text: c.textContent.trim(), dom: c });
      else if (tag === 'img')        out.push({ type: 'img', text: '',                   dom: c });
      else if (tag === 'ul')         out.push({ type: 'ul',  text: '',                   dom: c });
      else if (tag === 'ol')         out.push({ type: 'ol',  text: '',                   dom: c });
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

  /* ------------------------------------------------------------------- css */

  var CSS = [
    '#cst-nshome{--nv:#1A2238;--ik:#22231E;--mu:#5A5849;--gd:#7D6220;--sl:#CBBBA0;',
    '--sa:#F2EADF;--s2:#F5EDE1;--ha:#E6E3DC;background:#fff;border:1px solid var(--ha);',
    'color:var(--ik);font:19px/1.65 "EB Garamond",Georgia,serif;margin:0 0 20px}',
    '#cst-nshome *{box-sizing:border-box}',
    '#cst-nshome section{padding:48px 46px;border-top:1px solid var(--ha)}',
    '#cst-nshome .cst-mast{border-top:0;padding:72px 46px 56px;background:var(--nv)}',
    '#cst-nshome .cst-mast .ey{color:#CBBBA0}',
    '#cst-nshome .cst-mast .t1{color:#fff}',
    '#cst-nshome .cst-mast .tag{margin:14px 0 0;font:500 24px/1.35 "Cormorant Garamond",Georgia,serif;',
    'color:#E7D7C1}',
    '#cst-nshome .ey{font:600 12px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;',
    'text-transform:uppercase;color:var(--mu);margin:0 0 14px}',
    '#cst-nshome .ey.big{font-size:19px;letter-spacing:.18em;margin-bottom:30px}',
    '#cst-nshome .t1{display:block;font:600 64px/1.05 "Cormorant Garamond",Georgia,serif;',
    'color:var(--nv);',
    'letter-spacing:-.012em;margin:0}',
    '#cst-nshome h3{font:600 24px/1.2 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:0 0 6px}',
    '#cst-nshome .sh{font:500 34px/1.12 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:0 0 24px}',
    '#cst-nshome .sh b{font-weight:600}',
    '#cst-nshome a.go{display:inline-block;font:600 15px Inter,system-ui,sans-serif;',
    'color:var(--gd)!important;text-decoration:none}',
    '#cst-nshome .btn{display:inline-block;padding:10px 16px;border:1px solid var(--sl);',
    'color:var(--nv)!important;font:600 14px Inter,system-ui,sans-serif;text-decoration:none;white-space:nowrap}',
    /* what North Star is */
    '#cst-nshome .what{padding:40px 46px;border-top:1px solid var(--ha);background:#FAF8F4}',
    '#cst-nshome .what p{margin:0 0 16px;font-size:20px;line-height:1.65;max-width:760px}',
    '#cst-nshome .what p:last-child{margin-bottom:0}',
    '#cst-nshome .what b{font-weight:600}',
    /* month */
    '#cst-nshome .month{background:var(--s2);padding:34px 36px 30px;border-left:3px solid var(--gd)}',
    '#cst-nshome .mlab{margin:0 0 12px;font:600 12px Inter,system-ui,sans-serif;letter-spacing:.16em;',
    'text-transform:uppercase;color:var(--gd)}',
    '#cst-nshome .month h2{font:600 34px/1.1 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:0 0 16px}',
    '#cst-nshome .tp{margin:0;font-size:20px;line-height:1.65;max-width:680px}',
    '#cst-nshome .nextm{margin:22px 0 0;font:600 12px Inter,system-ui,sans-serif;letter-spacing:.16em;',
    'text-transform:uppercase;color:var(--mu)}',
    /* gatherings */
    '#cst-nshome .ev{display:flex;gap:20px;align-items:center;padding:16px 0;border-top:1px solid var(--ha)}',
    '#cst-nshome .ev:last-of-type{border-bottom:1px solid var(--ha)}',
    '#cst-nshome .date{width:92px;flex:none;text-align:center;border:1px solid var(--sl);padding:8px 0}',
    '#cst-nshome .date b{display:block;font:600 32px/1 "Cormorant Garamond",Georgia,serif;color:var(--nv)}',
    '#cst-nshome .date span{font:600 11px Inter,system-ui,sans-serif;letter-spacing:.14em;',
    'text-transform:uppercase;color:var(--gd)}',
    '#cst-nshome .where{font:500 14px Inter,system-ui,sans-serif;color:var(--mu)}',
    /* articles */
    '#cst-nshome .arts{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}',
    '#cst-nshome .ac{border:1px solid var(--ha);padding:20px 22px 22px;text-decoration:none;',
    'color:inherit!important;display:block}',
    '#cst-nshome .ac h3{margin:8px 0 8px}',
    '#cst-nshome .ac p{margin:0;font-size:18px;line-height:1.55;color:var(--mu);',
    'display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}',
    '#cst-nshome .lab2{font:600 11px Inter,system-ui,sans-serif;letter-spacing:.14em;',
    'text-transform:uppercase;color:var(--gd)}',
    /* members */
    '#cst-nshome .ppl{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}',
    '#cst-nshome .pc{border:1px solid var(--ha);padding:20px 20px 22px;display:flex;flex-direction:column}',
    '#cst-nshome .pc .who{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;min-height:66px}',
    '#cst-nshome .pc .who>div{padding-top:4px}',
    '#cst-nshome .pc .ph{width:64px;height:64px;border-radius:50%;background:var(--sa);',
    'border:1px solid var(--sl);flex:none;object-fit:cover;display:flex;align-items:center;',
    'justify-content:center;font:600 24px "Cormorant Garamond",Georgia,serif;color:var(--nv)}',
    '#cst-nshome .pc .meta{font:500 13px Inter,system-ui,sans-serif;letter-spacing:.06em;color:var(--mu)}',
    '#cst-nshome .pc p{margin:0 0 14px;font-size:18px;line-height:1.55;flex:1;',
    'display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}',
    /* features */
    '#cst-nshome .spot{display:flex;gap:30px;align-items:flex-start}',
    '#cst-nshome .spot+.spot{margin-top:34px;padding-top:34px;border-top:1px solid var(--ha)}',
    '#cst-nshome .spot img{width:200px;height:250px;object-fit:cover;object-position:50% 20%;',
    'border:1px solid var(--sl);box-shadow:10px 10px 0 var(--sa);flex:none}',
    '#cst-nshome .spot h2{font:600 32px/1.1 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:8px 0 4px}',
    '#cst-nshome .spot .role{margin:0 0 10px;font:italic 500 21px "Cormorant Garamond",Georgia,serif;color:var(--gd)}',
    '#cst-nshome .spot p{margin:0 0 12px}',
    '#cst-nshome .tq{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:4px 0 14px;font-size:18px}',
    '#cst-nshome .q2{display:block;margin:0 0 4px;font:600 11px Inter,system-ui,sans-serif;',
    'letter-spacing:.14em;text-transform:uppercase;color:var(--gd)}',
    /* start here + where to go */
    '#cst-nshome .lead{font-size:20px;line-height:1.65;color:var(--ik);margin:0 0 30px;max-width:800px}',
    '#cst-nshome .help{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--ha)}',
    '#cst-nshome .help.two{grid-template-columns:repeat(2,1fr)}',
    '#cst-nshome .hp{padding:24px 24px 26px;font-size:18px;line-height:1.55;display:flex;flex-direction:column}',
    '#cst-nshome .hp+.hp{border-left:1px solid var(--ha)}',
    '#cst-nshome .help.two .hp:nth-child(odd){border-left:0}',
    '#cst-nshome .help.two .hp:nth-child(n+3){border-top:1px solid var(--ha)}',
    '#cst-nshome .hp .not{color:var(--mu);font-size:17px;margin-top:10px}',
    '#cst-nshome .hp .go{margin-top:auto;padding-top:16px}',
    '#cst-nshome .stepn{display:block;font:500 28px/1 "Cormorant Garamond",Georgia,serif;',
    'color:var(--sl);margin:0 0 6px}',
    /* need help */
    '#cst-nshome .stuck{border:1px solid var(--sl);padding:26px 28px 28px;margin-top:24px}',
    '#cst-nshome .stuck h3{font:600 11px Inter,system-ui,sans-serif;letter-spacing:.14em;',
    'text-transform:uppercase;color:var(--gd);margin:0 0 8px}',
    '#cst-nshome .stuck p{font-size:18px;line-height:1.55;color:var(--ik);margin:0}',
    '#cst-nshome .stuck ul{list-style:none;margin:16px 0 0;padding:0}',
    '#cst-nshome .stuck li{margin:0 0 10px;line-height:1.45}',
    '#cst-nshome .stuck li a{font:500 19px "EB Garamond",Georgia,serif;color:var(--gd)!important;',
    'text-decoration:none;border-bottom:1px solid var(--sl)}',
    '#cst-nshome .stuck-f{margin-top:22px!important;font-size:17px;color:var(--mu)}',
    '#cst-nshome .stuck-f a{color:var(--mu)!important;text-decoration:underline}',
    /* footer */
    '#cst-nshome .foot{padding:30px 46px;border-top:1px solid var(--ha);background:#FAF8F4}',
    '#cst-nshome .pr{display:flex;gap:34px;flex-wrap:wrap}',
    '#cst-nshome .pr a,#cst-nshome .pr span{font:600 24px "Cormorant Garamond",Georgia,serif;',
    'color:var(--nv)!important;text-decoration:none;border-bottom:1px solid var(--sl)}',
    '#cst-nshome .pr span{color:var(--mu)!important;border-bottom:1px dashed var(--sl)}',
    '#cst-nshome .nb{white-space:nowrap}',
    /* phone */
    '@media (max-width:767px){',
    '#cst-nshome section,#cst-nshome .cst-mast,#cst-nshome .what,#cst-nshome .foot',
    '{padding-left:22px;padding-right:22px}',
    '#cst-nshome .t1{font-size:40px}',
    '#cst-nshome .sh{font-size:28px}',
    '#cst-nshome .arts,#cst-nshome .ppl,#cst-nshome .help,#cst-nshome .help.two,',
    '#cst-nshome .tq{grid-template-columns:1fr}',
    '#cst-nshome .hp+.hp{border-left:0;border-top:1px solid var(--ha)}',
    '#cst-nshome .help.two .hp:nth-child(odd){border-left:0}',
    '#cst-nshome .spot{flex-direction:column;gap:20px}',
    '#cst-nshome .spot img{width:150px;height:188px;box-shadow:8px 8px 0 var(--sa)}',
    '#cst-nshome .ev{flex-wrap:wrap;gap:14px}',
    '#cst-nshome .ev>div:nth-child(2){min-width:calc(100% - 106px)}',
    '#cst-nshome .ev .btn{flex-basis:100%;text-align:center}',
    '}'
  ].join('');

  /* -------------------------------------------------------------- sections */

  function mastheadHTML() {
    var m = CFG.month;
    return '' +
      '<section class="cst-mast">' +
        '<p class="ey big">Constellations · North Star</p>' +
        '<h2 class="t1">Welcome.<br>We’re glad you’re here.</h2>' +
        '<p class="tag">More Support. Same Independence.</p>' +
      '</section>' +
      '<div class="what">' +
        CFG.what.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
      '</div>' +
      '<section>' +
        '<div class="month">' +
          '<p class="mlab">' + esc(m.label) + '</p>' +
          '<h2>' + esc(m.title) + '</h2>' +
          '<p class="tp">' + esc(m.body) + '</p>' +
          '<p class="nextm">' + esc(m.next) + '</p>' +
        '</div>' +
      '</section>';
  }

  /* Start here. Same three steps as the Constellations Home, in North Star
     register, so the two never drift. */
  function stepsHTML() {
    var u = CFG.urls;
    var guides = [
      [u.yourProfile,        'How to fill in your profile and add your photograph'],
      [u.notificationsGuide, 'How to choose your notification settings'],
      [u.connectionRequests, 'How Connection Requests work'],
      [u.addToHomeScreen,    'How to save the Portal to your phone']
    ].filter(function (g) { return g[0]; });

    return '' +
      '<section>' +
        '<h2 class="sh">New to the Portal? <b>Start here</b></h2>' +
        '<p class="lead">These three steps will help you get settled in. You can ' +
          'do one step today and the next step another day. You do not have to ' +
          'look at everything now.</p>' +
        '<div class="help">' +
          '<div class="hp"><span class="stepn">1</span><h3>Fill in your profile</h3>' +
            'Write a little about yourself. Other members will read it. Then add the ' +
            'photograph our team emailed you. It is the one with the cream background.' +
            '<a class="go" href="' + esc(u.profile) + '">Go to my profile →</a></div>' +
          '<div class="hp"><span class="stepn">2</span><h3>Choose your emails</h3>' +
            'Choose which emails you want from the Portal. You can get an email about ' +
            'Connection Requests, Gatherings, and replies. You can change this later.' +
            '<a class="go" href="' + esc(u.notifications) + '">Choose my emails →</a></div>' +
          '<div class="hp"><span class="stepn">3</span><h3>Meet Nova</h3>' +
            'Nova answers questions. Ask Nova how the Portal works. Ask Nova where to ' +
            'find something. You can also practice what you want to say.' +
            '<span class="not">Nova is the Constellations AI assistant. Nova is not a ' +
            'person. Nova cannot tell our team about a problem.</span>' +
            '<a class="go" href="' + esc(u.nova) + '">Ask Nova →</a></div>' +
        '</div>' +
        (guides.length
          ? '<div class="stuck">' +
              '<h3>Feeling stuck?</h3>' +
              '<p>These short guides take you through one task at a time.</p>' +
              '<ul>' + guides.map(function (g) {
                return '<li><a href="' + esc(g[0]) + '">' + esc(g[1]) + ' →</a></li>';
              }).join('') + '</ul>' +
              '<p class="stuck-f">Do you still need help? <a href="' + esc(u.nova) +
                '">Ask Nova</a>.<br>Did someone break our Community Guidelines? Tell us on ' +
                '<a href="' + esc(u.report) + '">Report a Concern</a>.</p>' +
            '</div>'
          : '') +
      '</section>';
  }

  function doorsHTML() {
    var u = CFG.urls;
    return '' +
      /* the six North Star spaces */
      '<section>' +
        '<h2 class="sh">Where to <b>go</b> in North Star</h2>' +
        '<p class="lead">Every space below has the blue North Star heading. You can ' +
          'open any of them and look around. You do not have to post anything.</p>' +
        '<div class="help two">' +
          CFG.doors.map(function (d) {
            return '<div class="hp"><h3>' + esc(d.title) + '</h3>' + esc(d.body) +
                   '<a class="go" href="' + esc(d.href) + '">Go to ' + esc(d.title) +
                   ' →</a></div>';
          }).join('') +
        '</div>' +
      '</section>' +

      /* getting help from a person */
      '<section>' +
        '<h2 class="sh">Talking to a <b>person</b></h2>' +
        '<div class="help two">' +
          '<div class="hp"><h3>Report a concern</h3>' +
            'Use this if someone worries you. Use it if something does not feel right. ' +
            'A real person reads every report.' +
            '<span class="not">A person writes back within two business days. You do ' +
            'not have to give your name.</span>' +
            '<a class="go" href="' + esc(u.report) + '">Report a concern →</a></div>' +
          '<div class="hp"><h3>Book coaching</h3>' +
            'A coach is a real person. You meet one to one. You can talk about a first ' +
            'date, a message you are stuck on, or a plan you want to make.' +
            '<span class="not">Coaching costs extra. It is not part of your membership.</span>' +
            '<a class="go" href="' + esc(u.coaching) + '">See coaching →</a></div>' +
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
            '<a class="btn" href="' + esc(postUrl(e.p, 'nsgatherings')) + '">Details</a>' +
          '</div>';
      }).join('');

      mount.appendChild(el(
        '<section><h2 class="sh">The next <b>Gathering</b></h2>' + rows +
        '<p style="margin:16px 0 0"><a class="go" href="' + esc(CFG.urls.calendar) +
        '">See all the gatherings →</a></p></section>'));
    });
  }

  function fillArticles(mount) {
    return posts(CFG.spaces.articles, 80).then(function (rs) {
      var all = rs.filter(function (p) {
        return p.slug && p.slug !== 'north-star-all-articles' && p.published_at;
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
        if (!head && p.truncated_content) {
          var t = decode(String(p.truncated_content).replace(/<[^>]+>/g, '\n')).split('\n')
                    .map(function (x) { return x.trim(); }).filter(Boolean);
          head = t[0] || ''; lede = t[1] || '';
        }
        var bits = head.split(/\s*·\s*/);
        var headHTML = bits.length > 1
          ? esc(bits[0]) + ' · <span class="nb">' + esc(bits.slice(1).join(' · ')) + '</span>'
          : esc(head);
        return '<a class="ac" href="' + esc(postUrl(p, 'nsarticles')) + '">' +
            '<span class="lab2">' + headHTML + '</span>' +
            '<h3>' + esc(p.name) + '</h3>' +
            '<p>' + esc(lede) + '</p></a>';
      }).join('');

      mount.appendChild(el(
        '<section><h2 class="sh">Articles to <b>read</b></h2>' +
        '<div class="arts">' + cards + '</div>' +
        '<p style="margin:18px 0 0"><a class="go" href="' + esc(CFG.urls.allArticles) +
        '">See all the articles →</a></p></section>'));
    });
  }

  function fillCommunity(mount) {
    return posts(CFG.spaces.community, 30).then(function (rs) {
      var live = rs.filter(function (p) {
        return p.published_at && p.slug && (!p.status || p.status === 'published');
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
          var ps    = paragraphs(p);
          var meta  = ps[1] || '';
          /* prefer a "Say hello if" bullet; fall back to the opening description */
          var hello = (listItems(p, 'ul')[0] || {}).text || ps[2] || '';
          var src   = photo(p);
          var face  = src
            ? '<img class="ph" src="' + esc(src) + '" alt="">'
            : '<div class="ph">' + esc((p.name || '?').replace(/^Meet\s+/i, '').charAt(0)) + '</div>';
          var who = (p.name || '').replace(/^Meet\s+/i, '');
          return '<div class="pc"><div class="who">' + face +
              '<div><h3>' + esc(who) + '</h3>' +
              '<span class="meta">' + esc(meta) + '</span></div></div>' +
              '<p>' + esc(hello) + '</p>' +
              '<a class="go" href="' + esc(postUrl(p, 'ns-community')) + '">Meet ' +
              esc(who) + ' →</a></div>';
        }).join('');
        html += '<section><h2 class="sh">Our <b>Community</b></h2>' +
                '<p class="lead">These are some of the members of Constellations. ' +
                'You can read about them here.</p>' +
                '<div class="ppl">' + cards + '</div></section>';
      }

      if (features.length) {
        var spots = features.map(function (p) {
          var l    = label(p);
          var ps   = paragraphs(p).slice(1);
          var src  = photo(p);
          var cta  = CFG.featureLink[l] || 'Read this';
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
              '<a class="go" href="' + esc(postUrl(p, 'ns-community')) + '">' +
              esc(cta) + ' →</a></div></div>';
        }).join('');
        html += '<section style="border-top:0;padding-top:6px">' + spots + '</section>';
      }

      if (html) mount.appendChild(el('<div>' + html + '</div>'));
    });
  }

  /* ----------------------------------------------------------------- mount */

  function style() {
    if (document.getElementById('cst-nshome-css')) return;
    var s = document.createElement('style');
    s.id = 'cst-nshome-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function anchor() {
    var nvx = document.getElementById('nvx-space');
    if (nvx && nvx.parentElement) return nvx;
    var feed = document.querySelector('.react-page-space-show .flex.flex-col');
    return feed || null;
  }

  /* The portal's hideTitle() hides the parent of any <h1>, which is why the
     masthead title is a .t1, not an <h1>. This repairs it either way. */
  function hideOld() {
    var nvx = document.getElementById('nvx-space');
    if (nvx && nvx.style.display !== 'none') nvx.style.display = 'none';
    var mast = document.querySelector('#' + CFG.root + ' .cst-mast');
    if (mast && mast.style.display === 'none') mast.style.display = '';
  }

  function build() {
    if (!onHome()) return;
    if (document.getElementById(CFG.root)) { hideOld(); return; }

    var host = anchor();
    if (!host || !host.parentElement) return;

    style();

    var root = document.createElement('div');
    root.id = CFG.root;
    root.setAttribute('data-cst-nshome', VERSION);
    root.innerHTML = mastheadHTML() +
                     stepsHTML() +
                     '<div id="cst-nsev"></div>' +
                     '<div id="cst-nsar"></div>' +
                     '<div id="cst-nsco"></div>' +
                     doorsHTML();
    host.parentElement.insertBefore(root, host);
    hideOld();

    fillGatherings(root.querySelector('#cst-nsev')).catch(function () {});
    fillArticles(root.querySelector('#cst-nsar')).catch(function () {});
    fillCommunity(root.querySelector('#cst-nsco')).catch(function () {});
  }

  function teardown() {
    var r = document.getElementById(CFG.root);
    var nvx = document.getElementById('nvx-space');
    if (nvx) {
      nvx.style.display = '';
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
