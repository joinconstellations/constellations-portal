/* Constellations — Home page (/c/welcome)
   Loaded from the Head code snippet as:
   <script defer src="https://joinconstellations.github.io/constellations-portal/home.js"></script>
   Runs only on Home. Every live-data block hides itself if its call fails. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- config */

  var VERSION = '1.5.1';

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
      pressureIsPoison:    '/c/guides/pressure-is-poison',
      yourProfile:         '/c/guides/your-portal-profile',
      addToHomeScreen:     '/c/guides/add-to-home-screen',
      notificationsGuide:  null    /* guide not written yet                   */
    },

    /* Monthly theme. Everything the theme box shows is named here, so a new
       month is one edit: the stamp, the title, the body, the two articles by
       slug, the two discussion questions, the Nova prompt, next month. */
    month: {
      stamp: 'September',
      title: 'Transitions',
      body:  'Moving through change, waiting for what comes next, and finding a ' +
             'way forward when you feel stuck. Explore the theme through reading, ' +
             'conversation, and Nova.',
      articles: ['when-a-friendship-fades', 'become-a-regular'],
      reading:  'Two pieces from the Constellations Library about change, ' +
                'belonging, and what comes next.',
      questions: [
        'What’s something you believed about relationships when you were younger ' +
          'that you see differently now?',
        'Are you leaving something behind, adjusting to where you are now, or ' +
          'wondering what might come next?'
      ],
      novaAsk:   'What are small steps I can take this month to meet my goals?',
      nextLabel: 'October’s theme?',
      nextTitle: 'Masking'
    },

    /* Drawn from the Guiding Principles document, not written here. */
    principles: [
      { name: 'Clarity Is Kindness', url: 'clarityIsKindness',
        line: 'Say what you mean. Ask direct questions. Nobody should have to guess.' },
      { name: 'Slow Is Safe', url: 'slowIsSafe',
        line: 'Time lets you notice patterns and make a decision that is yours.' },
      { name: 'Pressure Is Poison', url: 'pressureIsPoison',
        line: 'When pressure rises, the answer is not to decide faster.' }
    ],

    /* How many member features Home shows, and how many short quotes run
       below them as small asides. */
    featureCount: 4,
    quoteCount:   2,

    memberLabels:  ['NEW MEMBER', 'FEATURED MEMBER'],
    featureLabels: ['PASSION PROJECTS', 'THREE QUESTIONS', 'GOOD COMPANY',
                    'A FEW MINUTES WITH', 'WORTH SHARING', 'QUOTE', 'MEMBER STORY'],

    /* Card link text. The card already shows the content, so the link only
       needs to say where it goes. Name a format here to override it. */
    featureLink: {}
  };

  /* ------------------------------------------- portal-wide: Nova in chat --

     home.js is loaded on every page, which is why this lives here. It belongs
     in portal.css block 24 and should move there at the next edit of that file.

     The Chatbase launcher lands on top of the chat composer's send button, the
     primary action of a chat space. It cannot be moved: its containing block
     shifts, so `bottom`, `top` and margins are all either ignored or clamped
     back. `display` is the one property that holds, so the floating launcher
     is hidden on chat spaces only. Nova stays in the sidebar on every page.

     `data-nvx-chat` is set on <html> by the portal's own script on chat
     spaces, so this affects nothing else. */
  (function novaChat() {
    if (document.getElementById('cst-nova-chat')) return;
    var s = document.createElement('style');
    s.id = 'cst-nova-chat';
    s.textContent =
      'html[data-nvx-chat] #chatbase-bubble-button,' +
      'html[data-nvx-chat] #chatbase-message-bubbles{display:none !important}';
    (document.head || document.documentElement).appendChild(s);
  })();

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
        else if (t === 'blockquote')  out.push({ type: 'q',    text: nodeText(n).trim(), node: n });
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
      else if (tag === 'blockquote')        out.push({ type: 'q',   text: c.textContent.trim(), dom: c });
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

  /* False for a label line such as FEATURED MEMBER, so it is never shown as text. */
  function notLabel(t) {
    var u = t.toUpperCase().replace(/\s+/g, ' ').trim();
    return CFG.memberLabels.indexOf(u) < 0 && CFG.featureLabels.indexOf(u) < 0;
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

  /* ------------------------------------------------------------------- css */

  var CSS = [
    '#cst-home{--nv:#1A2238;--ik:#22231E;--mu:#5A5849;--gd:#7D6220;--sl:#CBBBA0;',
    '--sa:#F2EADF;--s2:#F5EDE1;--ha:#E6E3DC;background:#fff;border:1px solid var(--ha);',
    'color:var(--ik);font:17px/1.55 "EB Garamond",Georgia,serif;margin:0 0 20px}',
    '#cst-home *{box-sizing:border-box}',
    '#cst-home section{padding:48px 46px;border-top:1px solid var(--ha)}',
    '#cst-home .cst-mast{border-top:0;padding:76px 46px 60px}',
    '#cst-home .ey{font:600 11px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;',
    'text-transform:uppercase;color:var(--mu);margin:0 0 14px}',
    '#cst-home .ey.big{font-size:19px;letter-spacing:.18em;margin-bottom:38px}',
    '#cst-home .t1{display:block;font:600 74px/1.03 "Cormorant Garamond",Georgia,serif;',
    'color:var(--nv);',
    'letter-spacing:-.012em;margin:0}',
    '#cst-home h3{font:600 21px/1.2 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:0 0 4px}',
    '#cst-home .sh{font:500 32px/1.1 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:0 0 24px}',
    '#cst-home .sh b{font-weight:600}',
    '#cst-home .bar{width:86px;height:4px;background:var(--sl);margin:42px 0 48px}',
    '#cst-home a.go{display:inline-block;font:600 14px Inter,system-ui,sans-serif;',
    'color:var(--gd)!important;text-decoration:none}',
    '#cst-home .btn{display:inline-block;padding:9px 14px;border:1px solid var(--sl);',
    'color:var(--nv)!important;font:600 13px Inter,system-ui,sans-serif;text-decoration:none;white-space:nowrap}',
    '#cst-home .cst-soon{color:var(--mu);font:600 14px Inter,system-ui,sans-serif}',
    /* month */
    '#cst-home .month{background:var(--s2);padding:34px 36px 30px;border-left:3px solid var(--gd)}',
    '#cst-home .mlab{margin:0 0 12px;font:600 11px Inter,system-ui,sans-serif;letter-spacing:.16em;',
    'text-transform:uppercase;color:var(--gd)}',
    '#cst-home .month h2{font:600 32px/1.1 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:0 0 16px}',
    '#cst-home .tp{margin:0;font-size:18px;line-height:1.6;max-width:640px}',
    '#cst-home .nextm{margin:22px 0 0;font:600 11px Inter,system-ui,sans-serif;letter-spacing:.16em;',
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
    '#cst-home .lead{font-size:17px;line-height:1.6;color:var(--ik);margin:0 0 30px;max-width:780px}',
    /* where to go */
    '#cst-home .help{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--ha)}',
    '#cst-home .help.two{grid-template-columns:repeat(2,1fr)}',
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
    /* 1.2.0 — alternating grounds and section shapes */
    /* Circle's own feed sits below our build on Home and has no other rule
       hiding it. If home.js ever fails to load, nothing matches and the
       normal Circle page comes back. */
    'body.view-space--2860046 #cst-home ~ *{display:none !important}',
    '#cst-home .sand{background:#FAF8F4}',
    /* this month */
    '#cst-home .mo{padding-top:34px}',
    '#cst-home .mo .ey{margin-bottom:8px}',
    /* getting started, merged help */
    '#cst-home .hp h3{margin-bottom:12px}',
    /* community */
    '#cst-home .pc .lab2{display:block;margin:0 0 10px}',
    '#cst-home .featme{display:flex;justify-content:space-between;align-items:center;',
    'gap:24px;background:var(--s2);border-left:3px solid var(--gd);padding:16px 20px;',
    'margin-top:30px;font-size:16px;line-height:1.5}',
    '#cst-home .featme p{margin:0}',
    '#cst-home .featme b{font-weight:600;color:var(--nv)}',
    '#cst-home .featme a,#cst-home .featme span.q{flex:none;font:600 13px Inter,system-ui,sans-serif;',
    'color:var(--gd)!important;text-decoration:none;white-space:nowrap}',
    '#cst-home .featme span.q{color:var(--mu)!important}',
    '#cst-home .spot.alt{flex-direction:row-reverse}',
    /* 1.4.0 — quotes as small asides below the features */
    '#cst-home .qa{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:26px 40px;',
    'margin-top:34px;padding-top:30px;border-top:1px solid var(--ha)}',
    '#cst-home .qi{display:flex;gap:18px;align-items:flex-start;max-width:720px;text-decoration:none!important;color:inherit!important}',
    '#cst-home .qi img{width:64px;height:64px;object-fit:cover;object-position:50% 25%;border:1px solid var(--sl);flex:none}',
    '#cst-home .qi q{display:block;font:italic 500 18px/1.45 "Cormorant Garamond",Georgia,serif;color:var(--nv)}',
    '#cst-home .qi cite{display:block;margin-top:8px;font:600 10.5px Inter,system-ui,sans-serif;font-style:normal;',
    'letter-spacing:.14em;text-transform:uppercase;color:var(--mu)}',
    /* footer principles */
    '#cst-home .prg{display:grid;grid-template-columns:repeat(3,1fr);gap:30px;margin-top:6px}',
    '#cst-home .prc .prm{display:block;width:34px;height:2px;background:var(--gd);margin:0 0 12px}',
    '#cst-home .prc h3{margin:0 0 6px;font:600 22px "Cormorant Garamond",Georgia,serif}',
    '#cst-home .prc h3 a{color:var(--nv)!important;text-decoration:none;',
    'border-bottom:1px solid var(--sl)}',
    '#cst-home .prc p{margin:0;font-size:15px;line-height:1.5;color:var(--mu)}',
    /* 1.3.0 — welcome opening: two steps as hairline-separated rows */
    '#cst-home .cst-mast .lead{margin:22px 0 0}',
    '#cst-home .steps{margin-top:26px}',
    '#cst-home .strow{display:flex;align-items:center;gap:22px;padding:24px 0;',
    'border-top:1px solid var(--ha)}',
    '#cst-home .strow .ico{flex:none;width:54px;height:54px;border-radius:50%;',
    'background:var(--sa);color:var(--gd);display:flex;align-items:center;justify-content:center}',
    '#cst-home .strow .ico svg{width:26px;height:26px;display:block}',
    '#cst-home .strow .sb{flex:1 1 auto;min-width:0}',
    '#cst-home .strow h3{margin:0 0 6px;font:600 25px/1.15 "Cormorant Garamond",Georgia,serif;',
    'color:var(--nv)}',
    '#cst-home .strow p{margin:0;font-size:16px;line-height:1.5;color:var(--mu)}',
    /* The Ask Nova launcher is fixed to the bottom-right of the viewport and
       is about 150px wide. Anything flush right passes under it as the page
       scrolls, so right-aligned links keep a gutter clear of it. */
    '#cst-home .strow .go{flex:none;margin:0 120px 0 0;white-space:nowrap}',
    /* 1.5.0 — the theme box: one outline around the month, the reading,
       the conversation and Nova, so the three routes read as one idea. */
    '#cst-home .thbox{border:1px solid var(--sl);padding:36px 38px 30px}',
    '#cst-home .thhead{display:grid;grid-template-columns:230px 1fr;gap:34px;align-items:start}',
    '#cst-home .thleaf{display:block;color:var(--gd);margin:0 0 12px}',
    '#cst-home .thleaf svg{width:36px;height:36px;display:block}',
    '#cst-home .thmo{margin:0;font:500 42px/1 "Cormorant Garamond",Georgia,serif;color:var(--gd)}',
    '#cst-home .thti{margin:0 0 14px;font:600 52px/1 "Cormorant Garamond",Georgia,serif;',
    'letter-spacing:-.01em;color:var(--nv)}',
    '#cst-home .thtx{margin:0;font-size:18px;line-height:1.6;max-width:560px}',
    '#cst-home .thsec{margin-top:34px;padding-top:30px;border-top:1px solid var(--ha)}',
    '#cst-home .thh{display:flex;align-items:center;gap:11px;margin:0 0 6px;',
    'font:600 27px/1.15 "Cormorant Garamond",Georgia,serif;color:var(--nv)}',
    '#cst-home .thh svg{width:22px;height:22px;flex:none;color:var(--gd)}',
    '#cst-home .thnote{margin:0 0 22px;font-size:16px;color:var(--mu);max-width:620px}',
    '#cst-home .tharts{display:grid;grid-template-columns:1fr 1fr;gap:30px}',
    '#cst-home .thart{display:block;text-decoration:none;color:inherit!important}',
    '#cst-home .thart h4{margin:6px 0 8px;',
    'font:600 27px/1.12 "Cormorant Garamond",Georgia,serif;color:var(--nv)}',
    '#cst-home .thart p{margin:0 0 12px;font-size:16px;line-height:1.5;color:var(--mu)}',
    '#cst-home .thart .go{font:600 14px Inter,system-ui,sans-serif;color:var(--gd)!important}',
    '#cst-home .thqs{display:grid;gap:18px;max-width:720px}',
    '#cst-home .thq{display:block;text-decoration:none;padding-left:16px;',
    'border-left:2px solid var(--sl);color:var(--gd)!important;',
    'font:500 23px/1.32 "Cormorant Garamond",Georgia,serif}',
    '#cst-home .thmore{margin:20px 0 0}',
    '#cst-home .thnova{margin-top:34px;background:var(--s2);padding:26px 28px 28px}',
    '#cst-home .thnovagrid{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}',
    '#cst-home .thnovagrid p{margin:0;font-size:16px;line-height:1.55}',
    '#cst-home .thask{margin:0 0 14px!important;color:var(--nv);',
    'font:500 22px/1.35 "Cormorant Garamond",Georgia,serif}',
    '#cst-home .thnext{display:flex;align-items:baseline;justify-content:flex-end;',
    'gap:14px;margin:30px 120px 0 0}',
    '#cst-home .thnext .ey{margin:0}',
    '#cst-home .thnext b{font:600 30px "Cormorant Garamond",Georgia,serif;color:var(--nv)}',
    /* phone */
    '@media (max-width:767px){',
    '#cst-home section,#cst-home .cst-mast,#cst-home .foot{padding-left:22px;padding-right:22px}',
    '#cst-home .t1{font-size:42px}',
    '#cst-home .sh{font-size:26px}',
    '#cst-home .arts,#cst-home .ppl,#cst-home .help,#cst-home .tq,#cst-home .msg{grid-template-columns:1fr}',
    '#cst-home .hp+.hp{border-left:0;border-top:1px solid var(--ha)}',
    '#cst-home .spot{flex-direction:column;gap:20px}',
    '#cst-home .spot img{width:150px;height:188px;box-shadow:8px 8px 0 var(--sa)}',
    '#cst-home .feat-me,#cst-home .disc{flex-direction:column;align-items:flex-start;gap:18px}',
    '#cst-home .ev{flex-wrap:wrap;gap:14px}',
    '#cst-home .ev>div:nth-child(2){min-width:calc(100% - 100px)}',
    '#cst-home .ev .btn{flex-basis:100%;text-align:center}',
    '#cst-home .prg{grid-template-columns:1fr;gap:22px}',
    '#cst-home .strow{flex-wrap:wrap;gap:16px;padding:22px 0}',
    '#cst-home .strow .sb{flex:1 1 180px}',
    '#cst-home .strow .go{flex:1 1 100%;padding-left:76px;margin-right:0}',
    '#cst-home .featme{flex-direction:column;align-items:flex-start;gap:12px}',
    '#cst-home .spot.alt{flex-direction:column}',
    '#cst-home .thbox{padding:26px 22px 24px}',
    '#cst-home .thhead{grid-template-columns:1fr;gap:16px}',
    '#cst-home .thti{font-size:36px}',
    '#cst-home .thmo{font-size:34px}',
    '#cst-home .thq{font-size:21px}',
    '#cst-home .tharts,#cst-home .thnovagrid{grid-template-columns:1fr}',
    '#cst-home .thnext{justify-content:flex-start;margin-right:0}',
    '}'
  ].join('');

  /* -------------------------------------------------------------- sections */

  /* Icons are inline so they load with the page and take their colour from
     the badge. Stroke only, 24-grid, decorative — the row title is the
     accessible label, so the SVG is hidden from screen readers. */
  var ICON = {
    person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
            'aria-hidden="true" focusable="false">' +
            '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/></svg>',
    bell:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
            'aria-hidden="true" focusable="false">' +
            '<path d="M18 9a6 6 0 1 0-12 0c0 4.8-2 6.2-2 6.2h16S18 13.8 18 9"/>' +
            '<path d="M10.2 18.6a2.1 2.1 0 0 0 3.6 0"/></svg>',
    leaves: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" ' +
            'aria-hidden="true" focusable="false">' +
            '<g transform="translate(-1,-2) scale(.62)">' +
            '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/>' +
            '<path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/></g>' +
            '<g transform="translate(9,8) scale(.62)">' +
            '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/>' +
            '<path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/></g></svg>',
    book:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
            'aria-hidden="true" focusable="false">' +
            '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>' +
            '<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    talk:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
            'aria-hidden="true" focusable="false">' +
            '<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/>' +
            '<path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>',
    spark:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
            'aria-hidden="true" focusable="false">' +
            '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>' +
            '<path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>'
  };

  function stepRow(icon, title, lines, href, label) {
    return '<div class="strow">' +
             '<span class="ico">' + icon + '</span>' +
             '<div class="sb"><h3>' + title + '</h3>' +
               '<p>' + lines + '</p></div>' +
             '<a class="go" href="' + esc(href) + '">' + label + ' →</a>' +
           '</div>';
  }

  /* Welcome. Masthead and the two first steps are one block: a member opening
     the Portal sees the greeting and what to do next without scrolling. */
  function welcomeHTML() {
    var u = CFG.urls;
    return '' +
      '<section class="cst-mast">' +
        '<p class="ey big">Constellations Member Portal</p>' +
        '<h2 class="t1">Welcome.<br>We’re glad you’re here.</h2>' +
        '<p class="lead">Start with these two steps.</p>' +
        '<div class="steps">' +
          stepRow(ICON.person, 'Complete your profile',
                  'Share a bit about yourself.<br>Add the cream-background ' +
                  'photograph we emailed you.',
                  u.profile, 'Edit my profile') +
          stepRow(ICON.bell, 'Customize notifications',
                  'Choose which updates you receive by email.<br>' +
                  'You can change this anytime.',
                  u.notifications, 'Customize notifications') +
        '</div>' +
      '</section>';
  }

  /* This month. One outlined box holds the theme and the three ways into it:
     what to read, what to talk about, and what to ask Nova. The two articles
     come from Circle, so #cst-ar is a fixed slot inside the box. */
  function themeHTML() {
    var m = CFG.month, u = CFG.urls;

    var qs = (m.questions || []).map(function (q) {
      return '<a class="thq" href="' + esc(u.discussions) + '">' + esc(q) + '</a>';
    }).join('');

    return '' +
      '<section class="mo">' +
        '<div class="thbox">' +

          '<div class="thhead">' +
            '<div><span class="thleaf">' + ICON.leaves + '</span>' +
              '<p class="ey">This month</p>' +
              '<p class="thmo">' + esc(m.stamp) + '</p></div>' +
            '<div><h2 class="thti">' + esc(m.title) + '</h2>' +
              '<p class="thtx">' + esc(m.body) + '</p></div>' +
          '</div>' +

          '<div class="thsec">' +
            '<h3 class="thh">' + ICON.book + 'Suggested Reading</h3>' +
            '<p class="thnote">' + esc(m.reading) + '</p>' +
            '<div id="cst-ar"></div>' +
            '<p class="thmore"><a class="go" href="' + esc(u.allArticles) +
              '">Browse all articles →</a></p>' +
          '</div>' +

          '<div class="thsec">' +
            '<h3 class="thh">' + ICON.talk + 'Join the Conversation</h3>' +
            '<p class="thnote">Answer a question, or read what other members ' +
              'have shared.</p>' +
            '<div class="thqs">' + qs + '</div>' +
            '<p class="thmore"><a class="go" href="' + esc(u.discussions) +
              '">Go to Discussions →</a></p>' +
          '</div>' +

          '<div class="thnova">' +
            '<h3 class="thh">' + ICON.spark + 'Ask Nova</h3>' +
            '<div class="thnovagrid">' +
              '<p>Nova is the Constellations AI assistant. It can answer ' +
              'questions about dating, friendship, communication, and finding ' +
              'your way around the Portal. Nova is not a coach or a counselor.</p>' +
              '<div><p class="thask">“' + esc(m.novaAsk) + '”</p>' +
                '<a class="go" href="' + esc(u.nova) + '">Ask Nova →</a></div>' +
            '</div>' +
          '</div>' +

          '<p class="thnext"><span class="ey">' + esc(m.nextLabel) + '</span>' +
            '<b>' + esc(m.nextTitle) + '</b></p>' +

        '</div>' +
      '</section>';
  }

  function supportHTML() {
    var u = CFG.urls;
    return '' +
      '<section class="sand">' +
        '<h2 class="sh">Talk to a <b>person</b></h2>' +
        '<div class="help two">' +
          '<div class="hp"><h3>Book coaching</h3>One-to-one time with a coach.' +
            '<span class="use">Use it for</span>Working through something specific, like a ' +
            'first date, a message you’re stuck on, or a plan.' +
            '<span class="use">Good to know</span>' +
            '<span class="not">Booked and paid for separately from membership.</span>' +
            '<a class="go" href="' + esc(u.coaching) + '">See coaching →</a></div>' +
          '<div class="hp"><h3>Report a concern</h3>A private route to our team.' +
            '<span class="use">Use it for</span>When someone’s behavior worries you, or ' +
            'something doesn’t feel right.' +
            '<span class="use">Good to know</span>' +
            '<span class="not">A person acknowledges it within two business days. You don’t ' +
            'have to give your name.</span>' +
            '<a class="go" href="' + esc(u.report) + '">Report a concern →</a></div>' +
        '</div>' +
      '</section>' +

      '<div class="foot">' +
        '<p class="ey">Our Guiding Principles</p>' +
        '<div class="prg">' +
          CFG.principles.map(function (pr) {
            var href = u[pr.url];
            return '<div class="prc"><span class="prm"></span>' +
              '<h3>' + (href ? '<a href="' + esc(href) + '">' + esc(pr.name) + '</a>'
                             : esc(pr.name)) + '</h3>' +
              '<p>' + esc(pr.line) + '</p></div>';
          }).join('') +
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
        '<section><h2 class="sh">The next <b>Gathering</b></h2>' + rows +
        '<p style="margin:14px 0 0"><a class="go" href="' + esc(CFG.urls.calendar) +
        '">See the full calendar →</a></p></section>'));
    });
  }

  /* The two articles named in CFG.month.articles, in that order. A slug that
     no longer resolves is left out rather than shown broken. */
  function fillArticles(mount) {
    if (!mount) return Promise.resolve();
    return posts(CFG.spaces.articles, 60).then(function (rs) {
      var pick = (CFG.month.articles || []).map(function (s) {
        return rs.filter(function (p) { return p.slug === s; })[0];
      }).filter(Boolean);
      if (!pick.length) return;

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
        return '<a class="thart" href="' + esc(postUrl(p, 'articles')) + '">' +
            '<span class="lab2">' + headHTML + '</span>' +
            '<h4>' + esc(p.name) + '</h4>' +
            '<p>' + esc(lede) + '</p>' +
            '<span class="go">Read the article →</span></a>';
      }).join('');

      mount.appendChild(el('<div class="tharts">' + cards + '</div>'));
    });
  }

  function fillCommunity(mount) {
    return posts(CFG.spaces.community, 30).then(function (rs) {
      var u = CFG.urls;
      var live = rs.filter(function (p) {
        return p.published_at && p.slug &&
               (!p.status || p.status === 'published');
      }).sort(function (a, b) {
        return new Date(b.published_at) - new Date(a.published_at);
      });

      var people = [], features = [], quotes = [];
      live.forEach(function (p) {
        var l = label(p);
        if (CFG.memberLabels.indexOf(l) > -1) { if (people.length < 3) people.push(p); }
        else if (l === 'QUOTE') { if (quotes.length < CFG.quoteCount) quotes.push(p); }
        else if (CFG.featureLabels.indexOf(l) > -1) { if (features.length < CFG.featureCount) features.push(p); }
      });

      if (!people.length && !features.length && !quotes.length) return;

      var html = '<section class="sand">' +
                 '<h2 class="sh">Meet the <b>Community</b></h2>';

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
          return '<div class="pc">' +
              '<span class="lab2">' + esc(label(p)) + '</span>' +
              '<div class="who">' + face +
              '<div><h3>' + esc(who) + '</h3>' +
              '<span class="meta">' + esc(meta) + '</span></div></div>' +
              (hello ? '<div class="lab">Say hello if</div><p>' + esc(hello) + '</p>'
                     : '<p></p>') +
              '<a class="go" href="' + esc(postUrl(p, 'community')) + '">Meet ' +
              esc(who) + ' →</a></div>';
        }).join('');
        /* No Connection Request prompt here: a featured member may not have
           joined the Portal yet, so there may be no profile to connect from.
           The mechanic is explained in the Guides instead. */
        html += '<div class="ppl">' + cards + '</div>';
      }

      if (features.length) {
        var spots = features.map(function (p, idx) {
          var l    = label(p);
          var ps   = paragraphs(p).slice(1).filter(notLabel);
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

          /* alternate the photograph side so two features do not mirror */
          return '<div class="spot' + (idx % 2 ? ' alt' : '') + '">' +
              (src ? '<img src="' + esc(src) + '" alt="">' : '') +
              '<div><span class="lab2">' + esc(l) + '</span>' +
              '<h2>' + esc(p.name) + '</h2>' +
              (role ? '<p class="role">' + esc(role) + '</p>' : '') +
              mid +
              '<a class="go" href="' + esc(postUrl(p, 'community')) + '">' +
              esc(cta) + ' →</a></div></div>';
        }).join('');
        html += '<div style="margin-top:38px;padding-top:38px;border-top:1px solid var(--ha)">' +
                spots + '</div>';
      }

      /* Quotes: short, in the member's own words, set as small asides. */
      var asides = quotes.map(function (p) {
        var q = (blocks(p).filter(function (b) { return b.type === 'q'; })[0] || {}).text || '';
        if (!q) return '';
        var loc = paragraphs(p).slice(1).filter(notLabel).filter(function (t) {
          return t.length <= 60 && t !== p.name;
        })[0] || '';
        var who = (p.name || '') + (loc ? ' · ' + loc : '');
        var src = photo(p);
        return '<a class="qi" href="' + esc(postUrl(p, 'community')) + '">' +
            (src ? '<img src="' + esc(src) + '" alt="">' : '') +
            '<span><q>' + esc(decode(q)) + '</q><cite>' + esc(who) + '</cite></span></a>';
      }).join('');
      if (asides) html += '<div class="qa">' + asides + '</div>';

      /* Be featured — a slim strip, not a section of its own. */
      html += '<div class="featme">' +
          '<p><b>Would you like to be featured?</b> Share a few answers, something ' +
          'you made, a pet, or a recommendation. You approve everything before it ' +
          'goes up.</p>' +
          (u.beFeatured
            ? '<a href="' + esc(u.beFeatured) + '">See the ways →</a>'
            : '<span class="q">Coming soon</span>') +
        '</div>';

      html += '</section>';
      mount.appendChild(el('<div>' + html + '</div>'));
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

  /* Two repairs, run on every tick.

     1. Circle's React reconciles #nvx-space into our own root. It has to stay
        outside and after our root, so the feed-hiding rule above keeps working.
     2. The portal's hideTitle() hides the parent of any <h1>, which is why the
        masthead title is a .t1 rather than an <h1>. */
  function hideOld() {
    var root = document.getElementById(CFG.root);
    var nvx  = document.getElementById('nvx-space');
    if (nvx) {
      if (root && root.parentElement &&
          (root.contains(nvx) || nvx.nextElementSibling === root)) {
        root.parentElement.insertBefore(nvx, root.nextSibling);
      }
      if (nvx.style.display !== 'none') nvx.style.display = 'none';
    }
    var mast = root && root.querySelector('.cst-mast');
    if (mast && mast.style.display === 'none') mast.style.display = '';
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
    /* Orientation, then people, then this month's theme with the three ways
       into it, then what is happening, then where to get help. Each live slot
       is a fixed div so the running order never depends on which request
       answers first. #cst-ar sits inside the theme box. */
    root.innerHTML = welcomeHTML() +
                     '<div id="cst-co"></div>' +
                     themeHTML() +
                     '<div id="cst-ev"></div>' +
                     supportHTML();
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
