/* Constellations — North Star Home (/c/northstar)
   Loaded from the Head code snippet as:
   <script defer src="https://joinconstellations.github.io/constellations-portal/northstar-home.js"></script>
   The North Star sibling of home.js. Same welcome, same three steps, same
   monthly theme, written in North Star register: short sentences, one idea at
   a time, concrete words, larger type. White page throughout. Blue is used as
   an outline and a star, never as a filled block. No gatherings on this page.
   Every live-data block hides itself if its call fails. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- config */

  var VERSION = '2.3.2';

  var CFG = {
    path: '/c/northstar',
    root: 'cst-nshome',

    spaces: {
      articles:  2867665,   /* North Star Articles  */
      community: 2870142    /* North Star Community */
    },

    urls: {
      allArticles: '/c/nsarticles/north-star-all-articles',
      discussions: '/c/nsdiscussions',
      community:   '/c/ns-community',
      articles:    '/c/nsarticles',
      nova:        '/c/nsnova',
      guides:      '/c/guides',          /* there is no nsguides space */
      /* coaching is temporarily off both Home pages at Kate's direction */
      report:      '/c/report',
      profile:       '/account',
      notifications: '/account/notifications',
      walkthrough: 'https://joinconstellations.as.me/schedule/6aab1eb9/appointment/' +
                   '98669212/calendar/11037328?appointmentTypeIds[]=98669212',
      /* null shows muted text instead of a dead link */
      beFeatured:          '/c/guides/be-featured',
      connectionRequests:  null,
      clarityIsKindness:   '/c/guides/clarity-is-kindness',
      slowIsSafe:          '/c/guides/slow-is-safe',
      pressureIsPoison:    '/c/guides/pressure-is-poison'
    },

    /* Kate's approved North Star explainer, rewritten by her 24 Sep.
       Do not reword without her. */
    what: [
      'North Star is a part of the Constellations Portal for members who want ' +
      'more support and structure. North Star has shorter and more focused ' +
      'articles, clear steps, direct explanations, more examples, and more ' +
      'active help from our team.',
      'Look for the blue North Star. When you see it, you’re in a North Star space.'
    ],
    /* the caption beside the sample, in the welcome box */
    tagSample: 'This is what it looks like. It sits at the top of every North Star space.',

    /* This month. Mirrors the Constellations Home, in North Star register. */
    month: {
      stamp: 'September',
      label: 'This month’s theme',
      title: 'Transitions',
      body:  'A transition is an in-between time. Something in your life is ' +
             'changing. You are waiting to see how it turns out. This month our ' +
             'articles and our discussions are about transitions.',
      articles: ['north-star-when-a-friendship-fades',
                 'north-star-a-clear-ending-is-a-kindness'],
      questions: [ 'Are you in a transition right now?',
                   'How have your interests changed as you have gotten older? ' +
                   'What has stayed the same?' ],
      /* One member reply, shown under the questions. Named by message id and
         fetched live, so a reply the member edits or deletes changes here too. */
      replies: {
        room:     '4f8d094d-69bf-4f2a-bc82-6539c26aca90',
        parent:   2154691965,
        messages: [2154692292]
      },
      novaAsk: 'What are small steps I can take this month to meet my goals?',
      nextLabel: 'October’s theme?',
      nextTitle: 'Masking'
    },

    memberLabels:  ['NEW MEMBER', 'FEATURED MEMBER'],
    featureLabels: ['PASSION PROJECTS', 'THREE QUESTIONS', 'GOOD COMPANY',
                    'A FEW MINUTES WITH', 'WORTH SHARING', 'QUOTE', 'MEMBER STORY'],
    peopleCount: 12,
    featureCount: 10,
    quoteCount: 3,
    featureLink: {},

    principles: [
      { name: 'Clarity Is Kindness', url: 'clarityIsKindness',
        line: 'Say what you mean. Ask direct questions. Nobody has to guess.' },
      { name: 'Slow Is Safe', url: 'slowIsSafe',
        line: 'Take your time. Time helps you notice things and decide for yourself.' },
      { name: 'Pressure Is Poison', url: 'pressureIsPoison',
        line: 'If someone rushes you, you do not have to decide faster.' }
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

  /* Text of a tiptap node tree. */
  function nodeText(node) {
    if (!node) return '';
    if (node.text) return node.text;
    /* a mention has no text child; Circle keeps the readable form here */
    if (node.type === 'mention') return node.circle_ios_fallback_text || '';
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

  /* The second label line, when it names a member rather than a format. */
  function memberTag(post) {
    var p = paragraphs(post);
    var u = (p[1] || '').toUpperCase().replace(/\s+/g, ' ').trim();
    return CFG.memberLabels.indexOf(u) > -1 ? u : '';
  }

  /* Heading/paragraph pairs, for the interview formats where the question is
     a heading and the answer is the paragraph under it. Without this the
     answer shows on its own and reads like a fragment. */
  function qaPairs(post) {
    var b = blocks(post), out = [];
    for (var i = 0; i < b.length; i++) {
      if (b[i].type !== 'h' || !b[i].text) continue;
      for (var j = i + 1; j < b.length; j++) {
        if (b[j].type === 'h') break;
        if (b[j].type === 'p' && b[j].text) {
          out.push({ q: decode(b[i].text), a: decode(b[j].text) });
          break;
        }
      }
    }
    return out;
  }

  function postUrl(post, fallbackSpace) {
    if (post.url) {
      try { return new URL(post.url, location.origin).pathname; } catch (e) {}
    }
    return '/c/' + (post.space_slug || fallbackSpace) + '/' + post.slug;
  }

  /* ------------------------------------------------------------------- css */

  var CSS = [
    '#cst-nshome{--nv:#1A2238;--ik:#22231E;--mu:#5A5849;--gd:#7D6220;--sl:#CBBBA0;',
    '--sa:#F2EADF;--s2:#F5EDE1;--ha:#E6E3DC;--pl:#E7D7C1;--nb:#EEF2F7;',
    'background:#fff;border:1px solid var(--ha);',
    'color:var(--ik);font:19px/1.65 "EB Garamond",Georgia,serif;margin:0 0 20px}',
    '#cst-nshome *{box-sizing:border-box}',
    '#cst-nshome section{padding:48px 46px;border-top:1px solid var(--ha)}',
    '#cst-nshome .cst-mast{border-top:0;padding:46px 46px 52px;background:#fff}',
    /* the blue heading members are told to look for: an outline, not a block */
    '#cst-nshome .nsbox{border:2px solid var(--nv);padding:34px 36px 32px}',
    '#cst-nshome .nsbox .ey{display:flex;align-items:center;gap:11px;color:var(--nv)}',
    '#cst-nshome .nsstar{width:19px;height:19px;flex:none;color:var(--nv)}',
    '#cst-nshome .nsstar svg{width:19px;height:19px;display:block}',
    '#cst-nshome .ey{font:600 12px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;',
    'text-transform:uppercase;color:var(--mu);margin:0 0 16px}',
    '#cst-nshome .ey.big{font-size:17px;letter-spacing:.18em;margin-bottom:26px}',
    '#cst-nshome .t1{display:block;font:600 64px/1.05 "Cormorant Garamond",Georgia,serif;',
    'color:var(--nv);letter-spacing:-.012em;margin:0}',
    '#cst-nshome h3{font:600 24px/1.2 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:0 0 6px}',
    '#cst-nshome .sh{font:500 34px/1.12 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:0 0 24px}',
    '#cst-nshome .sh b{font-weight:600}',
    '#cst-nshome a.go{display:inline-block;font:600 15px Inter,system-ui,sans-serif;',
    'color:var(--gd)!important;text-decoration:none}',
    '#cst-nshome .cst-soon{display:inline-block;font:600 15px Inter,system-ui,sans-serif;color:var(--mu)}',
    /* what North Star is — inside the outlined heading box */
    '#cst-nshome .what{margin:30px 0 0;padding:24px 26px;background:var(--nb)}',
    '#cst-nshome .what p{margin:0 0 14px;font-size:19px;line-height:1.6;max-width:700px}',
    '#cst-nshome .what p:last-child{margin-bottom:0}',
    /* the sample North Star mark, so members know what to look for */
    '#cst-nshome .nsex{display:flex;align-items:center;gap:16px;flex-wrap:wrap;',
    'margin:20px 0 0;padding:16px 18px;background:#fff;border:1px solid var(--nv)}',
    '#cst-nshome .nstag{font:600 15px Inter,system-ui,sans-serif;letter-spacing:.2em;',
    'text-transform:uppercase;color:var(--nv)}',
    '#cst-nshome .nsexl{font-size:17px;line-height:1.5;color:var(--mu)}',
    /* start here — three rows, same shape as the Constellations Home */
    '#cst-nshome .lead{font-size:19px;line-height:1.65;color:var(--ik);margin:0 0 30px;max-width:800px}',
    '#cst-nshome .cst-mast .lead{margin:44px 0 0}',
    '#cst-nshome .steps{margin-top:34px}',
    '#cst-nshome .strow{display:flex;align-items:center;gap:22px;padding:26px 0;',
    'border-top:1px solid var(--ha)}',
    '#cst-nshome .strow .ico{flex:none;width:54px;height:54px;border-radius:50%;',
    'background:var(--nb);color:var(--nv);display:flex;align-items:center;justify-content:center}',
    '#cst-nshome .strow .ico svg{width:26px;height:26px;display:block}',
    '#cst-nshome .strow .sb{flex:1 1 auto;min-width:0}',
    '#cst-nshome .strow h3{margin:0 0 6px;font:600 27px/1.15 "Cormorant Garamond",Georgia,serif;',
    'color:var(--nv)}',
    '#cst-nshome .strow p{margin:0;font-size:18px;line-height:1.55;color:var(--mu)}',
    /* the Ask Nova launcher is fixed bottom-right and about 150px wide, so a
       right-aligned link keeps a gutter clear of it */
    '#cst-nshome .strow .go,#cst-nshome .strow .cst-soon{flex:none;margin:0 120px 0 0;white-space:nowrap}',
    /* this month — one blue outline around the theme and the three ways in */
    '#cst-nshome .thbox{border:2px solid var(--nv);padding:36px 38px 32px}',
    '#cst-nshome .thhead{display:grid;grid-template-columns:230px 1fr;gap:34px;align-items:start}',
    '#cst-nshome .thrule{display:block;width:86px;height:3px;background:var(--gd);margin:0 0 16px}',
    '#cst-nshome .thmo{margin:0;font:500 42px/1 "Cormorant Garamond",Georgia,serif;color:var(--gd)}',
    '#cst-nshome .thti{margin:0 0 14px;font:600 46px/1.02 "Cormorant Garamond",Georgia,serif;',
    'letter-spacing:-.01em;color:var(--nv)}',
    '#cst-nshome .thtx{margin:0;font-size:19px;line-height:1.6;max-width:580px}',
    '#cst-nshome .thnext{display:flex;align-items:baseline;gap:14px;margin:24px 0 0}',
    '#cst-nshome .thnext .ey{margin:0}',
    '#cst-nshome .thnext b{font:600 27px "Cormorant Garamond",Georgia,serif;color:var(--nv)}',
    '#cst-nshome .thsec{margin-top:34px;padding-top:30px;border-top:1px solid var(--ha)}',
    '#cst-nshome .thh{display:flex;align-items:center;gap:13px;margin:0 0 26px;',
    'font:600 34px/1.12 "Cormorant Garamond",Georgia,serif;color:var(--nv)}',
    '#cst-nshome .thh svg{width:27px;height:27px;flex:none;color:var(--nv)}',
    '#cst-nshome .tharts{display:grid;grid-template-columns:1fr 1fr;gap:30px}',
    '#cst-nshome .thart{display:block;text-decoration:none;color:inherit!important}',
    '#cst-nshome .thart h4{margin:6px 0 8px;',
    'font:600 28px/1.12 "Cormorant Garamond",Georgia,serif;color:var(--nv)}',
    '#cst-nshome .thart p{margin:0 0 12px;font-size:17px;line-height:1.55;color:var(--mu)}',
    '#cst-nshome .thart .go{font:600 14px Inter,system-ui,sans-serif;color:var(--gd)!important}',
    '#cst-nshome .thqs{display:grid;gap:18px;max-width:720px}',
    '#cst-nshome .thq{display:block;text-decoration:none;padding-left:16px;',
    'border-left:3px solid var(--nv);color:var(--gd)!important;',
    'font:500 24px/1.32 "Cormorant Garamond",Georgia,serif}',
    '#cst-nshome .thmore{margin:22px 0 0}',
    '#cst-nshome .thnova{margin-top:34px;background:var(--nb);padding:26px 28px 28px}',
    '#cst-nshome .thnovagrid{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}',
    '#cst-nshome .thnovagrid p{margin:0;font-size:18px;line-height:1.55}',
    '#cst-nshome .thask{margin:0 0 14px!important;color:var(--nv);',
    'font:500 23px/1.35 "Cormorant Garamond",Georgia,serif}',
    '#cst-nshome .lab2{display:inline-block;font:600 11px Inter,system-ui,sans-serif;',
    'letter-spacing:.14em;text-transform:uppercase;color:var(--gd)}',
    /* the member tag that rides beside the format tag */
    '#cst-nshome .lab3{display:inline-block;margin-left:8px;',
    'font:600 11px Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;',
    'color:var(--nv);background:var(--nb);padding:4px 10px 3px}',
    /* an interview answer, with the question above it */
    '#cst-nshome .fq{margin:14px 0 6px!important;font:600 11px Inter,system-ui,sans-serif;',
    'letter-spacing:.14em;text-transform:uppercase;color:var(--gd)}',
    '#cst-nshome .fa{margin:0 0 12px!important;font-size:19px;line-height:1.55;color:var(--ik)}',
    /* one help panel on its own row */
    '#cst-nshome .help.one{grid-template-columns:1fr}',
    /* members */
    '#cst-nshome .ppl{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}',
    '#cst-nshome .pc{border:1px solid var(--ha);padding:20px 20px 22px;display:flex;flex-direction:column}',
    '#cst-nshome .pc .lab2{background:var(--pl);color:var(--nv);padding:4px 10px 3px;margin:0 0 12px}',
    '#cst-nshome .pc .who{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;min-height:66px}',
    '#cst-nshome .pc .who>div{padding-top:4px}',
    '#cst-nshome .pc .ph{width:64px;height:64px;border-radius:50%;background:var(--sa);',
    'border:1px solid var(--sl);flex:none;object-fit:cover;display:flex;align-items:center;',
    'justify-content:center;font:600 24px "Cormorant Garamond",Georgia,serif;color:var(--nv)}',
    '#cst-nshome .pc .meta{font:500 13px Inter,system-ui,sans-serif;letter-spacing:.06em;color:var(--mu)}',
    '#cst-nshome .pc .lab{font:600 11px Inter,system-ui,sans-serif;letter-spacing:.14em;',
    'text-transform:uppercase;color:var(--gd);margin-bottom:4px}',
    '#cst-nshome .pc p{margin:0 0 14px;font-size:18px;line-height:1.55;flex:1;',
    'display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}',
    /* features, set the way the posts themselves are set in Community */
    '#cst-nshome .spot{display:flex;gap:30px;align-items:flex-start}',
    '#cst-nshome .spot+.spot{margin-top:34px;padding-top:34px;border-top:1px solid var(--ha)}',
    '#cst-nshome .spot.alt{flex-direction:row-reverse}',
    '#cst-nshome .spot img{width:200px;height:250px;object-fit:cover;object-position:50% 20%;',
    'box-shadow:10px 10px 0 var(--sa);flex:none}',
    '#cst-nshome .spot .lab2,#cst-nshome .qi .lab2{background:var(--pl);color:var(--nv);',
    'padding:4px 10px 3px;margin:0 0 12px}',
    '#cst-nshome .spot h2{font:600 34px/1.08 "Cormorant Garamond",Georgia,serif;color:var(--nv);margin:10px 0 0}',
    '#cst-nshome .spot h2::after{content:"";display:block;width:74px;height:3px;',
    'background:var(--pl);margin:14px 0 0}',
    '#cst-nshome .spot .role{margin:14px 0 10px;font:italic 500 21px "Cormorant Garamond",Georgia,serif;color:var(--gd)}',
    '#cst-nshome .spot p{margin:14px 0 12px;font-size:18px;line-height:1.55}',
    '#cst-nshome .tq{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:14px 0;font-size:17px}',
    '#cst-nshome .q2{display:block;margin:0 0 4px;font:600 11px Inter,system-ui,sans-serif;',
    'letter-spacing:.14em;text-transform:uppercase;color:var(--gd)}',
    /* a member quote, set the way the post is set in Community */
    '#cst-nshome .qa{display:grid;gap:40px;margin-top:38px;padding-top:34px;border-top:1px solid var(--ha)}',
    '#cst-nshome .qsec{padding:44px 46px;border-top:1px solid var(--ha)}',
    '#cst-nshome .qt{display:block;margin:0 0 16px}',
    '#cst-nshome .qi{display:flex;gap:30px;align-items:flex-start;max-width:860px;',
    'text-decoration:none!important;color:inherit!important}',
    '#cst-nshome .qi img{width:150px;height:188px;object-fit:cover;object-position:50% 20%;',
    'flex:none;box-shadow:10px 10px 0 var(--sa)}',
    '#cst-nshome .qi .qw{border-left:3px solid var(--sl);padding-left:26px;min-width:0}',
    '#cst-nshome .qi q{display:block;font:italic 500 23px/1.4 "Cormorant Garamond",Georgia,serif;color:var(--nv)}',
    '#cst-nshome .qi cite{display:block;margin-top:16px;font-style:normal;',
    'font:600 12px Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;',
    'color:var(--nv)}',
    '#cst-nshome .qi .qloc{display:block;margin-top:5px;font-weight:500;color:var(--mu)}',
    /* the member reply under this month's questions */
    '#cst-nshome .threply{display:flex;gap:16px;align-items:flex-start;max-width:680px;',
    'margin-top:28px;background:var(--nb);padding:20px 22px}',
    '#cst-nshome .threply img,#cst-nshome .threply .rini{width:46px;height:46px;flex:none;',
    'border-radius:50%;object-fit:cover;background:var(--sa);display:flex;',
    'align-items:center;justify-content:center;color:var(--nv);',
    'font:600 19px "Cormorant Garamond",Georgia,serif}',
    '#cst-nshome .rwho{margin:0 0 6px;font:600 11px Inter,system-ui,sans-serif;',
    'letter-spacing:.14em;text-transform:uppercase;color:var(--mu)}',
    '#cst-nshome .rtxt{margin:0;color:var(--nv);',
    'font:italic 500 19px/1.5 "Cormorant Garamond",Georgia,serif}',
    '#cst-nshome .rtxt+.rtxt{margin-top:10px}',
    /* doorways and help */
    '#cst-nshome .help{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--ha)}',
    '#cst-nshome .help.two{grid-template-columns:repeat(2,1fr)}',
    '#cst-nshome .hp{padding:24px 24px 26px;font-size:18px;line-height:1.55;display:flex;flex-direction:column}',
    '#cst-nshome .hp+.hp{border-left:1px solid var(--ha)}',
    '#cst-nshome .help.two .hp:nth-child(odd){border-left:0}',
    '#cst-nshome .help.two .hp:nth-child(n+3){border-top:1px solid var(--ha)}',
    '#cst-nshome .help .hp:nth-child(n+4){border-top:1px solid var(--ha)}',
    '#cst-nshome .hp .not{color:var(--mu);font-size:17px;margin-top:10px}',
    '#cst-nshome .hp .use{display:block;margin:12px 0 2px;font:600 10.5px Inter,system-ui,sans-serif;',
    'letter-spacing:.14em;text-transform:uppercase;color:var(--gd)}',
    '#cst-nshome .hp .go{margin-top:auto;padding-top:16px}',
    /* be featured */
    '#cst-nshome .featme{display:flex;gap:26px;align-items:center;justify-content:space-between;',
    'margin-top:38px;padding-top:28px;border-top:1px solid var(--ha)}',
    '#cst-nshome .featme p{margin:0;font-size:18px;line-height:1.55;max-width:660px}',
    '#cst-nshome .featme a{font:600 15px Inter,system-ui,sans-serif;color:var(--gd)!important;',
    'text-decoration:none;white-space:nowrap}',
    '#cst-nshome .featme .q{font:600 15px Inter,system-ui,sans-serif;color:var(--mu);white-space:nowrap}',
    /* footer */
    '#cst-nshome .foot{padding:40px 46px 44px;border-top:1px solid var(--ha)}',
    '#cst-nshome .prg{display:grid;grid-template-columns:repeat(3,1fr);gap:44px;margin-top:6px}',
    '#cst-nshome .prc .prm{display:block;width:34px;height:2px;background:var(--gd);margin:0 0 12px}',
    '#cst-nshome .prc h3{margin:0 0 6px;font:600 24px "Cormorant Garamond",Georgia,serif}',
    '#cst-nshome .prc h3 a{color:var(--nv)!important;text-decoration:none;',
    'border-bottom:1px solid var(--sl)}',
    '#cst-nshome .prc p{margin:0;font-size:17px;line-height:1.5;color:var(--mu)}',
    /* phone */
    '@media (max-width:767px){',
    '#cst-nshome section,#cst-nshome .cst-mast,#cst-nshome .foot,#cst-nshome .qsec',
    '{padding-left:22px;padding-right:22px}',
    '#cst-nshome .nsex{gap:10px}',
    '#cst-nshome .nsbox{padding:24px 22px 22px}',
    '#cst-nshome .t1{font-size:40px}',
    '#cst-nshome .sh{font-size:28px}',
    '#cst-nshome .ppl,#cst-nshome .help,#cst-nshome .help.two,',
    '#cst-nshome .tq,#cst-nshome .prg{grid-template-columns:1fr}',
    '#cst-nshome .prg{gap:22px}',
    '#cst-nshome .hp+.hp{border-left:0;border-top:1px solid var(--ha)}',
    '#cst-nshome .help.two .hp:nth-child(odd){border-left:0}',
    '#cst-nshome .spot,#cst-nshome .spot.alt{flex-direction:column;gap:20px}',
    '#cst-nshome .spot img{width:150px;height:188px;box-shadow:8px 8px 0 var(--sa)}',
    '#cst-nshome .qi{flex-direction:column;gap:20px}',
    '#cst-nshome .qi img{width:130px;height:163px;box-shadow:8px 8px 0 var(--sa)}',
    '#cst-nshome .qi q{font-size:21px}',
    '#cst-nshome .strow{flex-wrap:wrap;gap:16px;padding:22px 0}',
    '#cst-nshome .strow .sb{flex:1 1 180px}',
    '#cst-nshome .strow .go,#cst-nshome .strow .cst-soon{flex:1 1 100%;padding-left:76px;margin-right:0}',
    '#cst-nshome .thbox{padding:26px 22px 24px}',
    '#cst-nshome .thhead{grid-template-columns:1fr;gap:16px}',
    '#cst-nshome .thti{font-size:36px}',
    '#cst-nshome .thmo{font-size:34px}',
    '#cst-nshome .thq{font-size:21px}',
    '#cst-nshome .tharts,#cst-nshome .thnovagrid{grid-template-columns:1fr}',
    '#cst-nshome .featme{flex-direction:column;align-items:flex-start;gap:12px}',
    '}'
  ].join('');

  /* -------------------------------------------------------------- sections */

  /* Icons are inline so they load with the page and take their colour from
     the badge. Stroke only, 24-grid, decorative — the row title is the
     accessible label, so the SVG is hidden from screen readers. The star is
     the house mark and carries North Star, the way it does on the articles. */
  var ICON = {
    star:   '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" ' +
            'focusable="false"><path d="M12 0Q12.82 10.01 20.49 3.51Q13.99 11.18 ' +
            '24 12Q13.99 12.82 20.49 20.49Q12.82 13.99 12 24Q11.18 13.99 3.51 ' +
            '20.49Q10.01 12.82 0 12Q10.01 11.18 3.51 3.51Q11.18 10.01 12 0Z"/></svg>',
    person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
            'aria-hidden="true" focusable="false">' +
            '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/></svg>',
    bell:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
            'aria-hidden="true" focusable="false">' +
            '<path d="M18 9a6 6 0 1 0-12 0c0 4.8-2 6.2-2 6.2h16S18 13.8 18 9"/>' +
            '<path d="M10.2 18.6a2.1 2.1 0 0 0 3.6 0"/></svg>',
    video:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
            'aria-hidden="true" focusable="false">' +
            '<path d="M22 8.5 16 12l6 3.5v-7Z"/>' +
            '<rect x="2" y="6" width="14" height="12" rx="2.5"/></svg>',
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

  /* A step with no link yet shows muted text rather than a dead link. */
  function stepRow(icon, title, lines, href, label) {
    return '<div class="strow">' +
             '<span class="ico">' + icon + '</span>' +
             '<div class="sb"><h3>' + title + '</h3>' +
               '<p>' + lines + '</p></div>' +
             (href
               ? '<a class="go" href="' + esc(href) + '"' +
                 (/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '') +
                 '>' + label + ' →</a>'
               : '<span class="cst-soon">Coming soon</span>') +
           '</div>';
  }

  /* Welcome. The outlined blue box is the blue heading members are told to
     look for. The three steps are the same three as the Constellations Home,
     written plainly. */
  function welcomeHTML() {
    var u = CFG.urls;
    return '' +
      '<section class="cst-mast">' +
        '<div class="nsbox">' +
          '<p class="ey big"><span class="nsstar">' + ICON.star + '</span>' +
            'Constellations · North Star</p>' +
          '<h2 class="t1">Welcome.<br>We’re glad you’re here.</h2>' +
          '<div class="what">' +
            CFG.what.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
            '<div class="nsex"><span class="nstag">North Star</span>' +
              '<span class="nsexl">' + esc(CFG.tagSample) + '</span></div>' +
          '</div>' +
        '</div>' +
        '<p class="lead">New here? Start with these three steps.<br>' +
          'You can do one step today and the next step another day.</p>' +
        '<div class="steps">' +
          stepRow(ICON.person, 'Fill in your profile',
                  'Write a little about yourself. Other members will read it.<br>' +
                  'Then add the photograph we emailed you. It has a cream background.',
                  u.profile, 'Go to my profile') +
          stepRow(ICON.bell, 'Choose your emails',
                  'Pick which emails you want from the Portal.<br>' +
                  'You can change this any time.',
                  u.notifications, 'Choose my emails') +
          stepRow(ICON.video, 'Book a walkthrough call',
                  'This one is your choice. You do not have to.<br>' +
                  'It is 15 minutes on Zoom with our team. We show you how the ' +
                  'Portal works and what happens next.',
                  u.walkthrough, 'Book a walkthrough') +
        '</div>' +
      '</section>';
  }

  /* This month. One outlined box holds the theme and the three ways into it:
     what to read, what to talk about, and what to ask Nova. The two articles
     come from Circle, so #cst-nsar is a fixed slot inside the box. */
  function themeHTML() {
    var m = CFG.month, u = CFG.urls;

    var qs = (m.questions || []).map(function (q) {
      return '<a class="thq" href="' + esc(u.discussions) + '">' + esc(q) + '</a>';
    }).join('');

    return '' +
      '<section>' +
        '<div class="thbox">' +

          '<div class="thhead">' +
            '<div><span class="thrule"></span>' +
              '<p class="thmo">' + esc(m.stamp) + '</p></div>' +
            '<div>' +
              '<p class="ey">' + esc(m.label) + '</p>' +
              '<h2 class="thti">' + esc(m.title) + '</h2>' +
              '<p class="thtx">' + esc(m.body) + '</p>' +
              '<p class="thnext"><span class="ey">' + esc(m.nextLabel) + '</span>' +
                '<b>' + esc(m.nextTitle) + '</b></p>' +
            '</div>' +
          '</div>' +

          '<div class="thsec">' +
            '<h3 class="thh">' + ICON.book + 'Articles to read</h3>' +
            '<div id="cst-nsar"></div>' +
          '</div>' +

          '<div class="thsec">' +
            '<h3 class="thh">' + ICON.talk + 'Join the discussion</h3>' +
            '<div class="thqs">' + qs + '</div>' +
            '<div id="cst-nsre"></div>' +
            '<p class="thmore"><a class="go" href="' + esc(u.discussions) +
              '">Go to Discussions →</a></p>' +
          '</div>' +

          '<div class="thnova">' +
            '<h3 class="thh">' + ICON.spark + 'Ask Nova</h3>' +
            '<div class="thnovagrid">' +
              '<p>Nova is the Constellations AI assistant. Nova is a computer ' +
              'program. Nova is not a person. You can ask Nova about dating, ' +
              'friendship, what to say in a message, and how the Portal works. ' +
              'Nova cannot tell our team if something is wrong.</p>' +
              '<div><p class="thask">“' + esc(m.novaAsk) + '”</p>' +
                '<a class="go" href="' + esc(u.nova) + '">Ask Nova →</a></div>' +
            '</div>' +
          '</div>' +

        '</div>' +
      '</section>';
  }

  /* How to reach a person, then the principles. "Where to go" was removed at
     Kate's direction, and coaching is temporarily off both Home pages. */
  function supportHTML() {
    var u = CFG.urls;
    return '' +
      '<section>' +
        '<h2 class="sh">We’re <b>Here For You</b></h2>' +
        '<div class="help one">' +
          '<div class="hp"><h3>Report a concern</h3>' +
            'Tell us if something is wrong.' +
            '<span class="use">Use it for</span>Someone worries you. Someone is ' +
            'unkind to you. Something does not feel right.' +
            '<span class="use">Good to know</span>' +
            '<span class="not">A real person reads every report. A person writes ' +
            'back within two business days. You do not have to give your name.</span>' +
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

  /* The month's two articles, inside the theme box. Named by slug, so the
     copy always comes from the post itself. */
  function fillArticles(mount) {
    if (!mount) return Promise.resolve();
    return posts(CFG.spaces.articles, 80).then(function (rs) {
      var pick = (CFG.month.articles || []).map(function (s) {
        return rs.filter(function (p) { return p.slug === s; })[0];
      }).filter(Boolean);
      if (!pick.length) return;

      var cards = pick.map(function (p) {
        var ps = paragraphs(p);
        var head = ps[0] || '';
        var lede = ps[1] || '';
        if (!head && p.truncated_content) {
          var t = decode(String(p.truncated_content).replace(/<[^>]+>/g, '\n')).split('\n')
                    .map(function (x) { return x.trim(); }).filter(Boolean);
          head = t[0] || ''; lede = t[1] || '';
        }
        /* the topic tag is dropped here; only the read time is shown */
        var bits = head.split(/\s*·\s*/);
        var headHTML = esc(bits.length > 1 ? bits.slice(1).join(' · ') : head);
        return '<a class="thart" href="' + esc(postUrl(p, 'nsarticles')) + '">' +
            '<span class="lab2">' + headHTML + '</span>' +
            '<h4>' + esc(p.name) + '</h4>' +
            '<p>' + esc(lede) + '</p>' +
            '<span class="go">Read the article →</span></a>';
      }).join('');

      mount.appendChild(el('<div class="tharts">' + cards + '</div>'));
    });
  }

  /* The member reply under this month's questions. Named by message id, so
     nothing is copied into this file. */
  function fillReply(mount) {
    var c = CFG.month.replies;
    if (!mount || !c || !c.messages || !c.messages.length) return Promise.resolve();
    var base = '/internal_api/chat_rooms/' + c.room;
    return Promise.all([
      get(base + '/messages?parent_message_id=' + c.parent),
      get(base + '/participants')
    ]).then(function (res) {
      var msgs = records(res[0]), people = records(res[1]);
      var html = c.messages.map(function (id) {
        var msg = msgs.filter(function (x) { return x.id === id && !x.deleted_at; })[0];
        if (!msg) return '';
        var body  = msg.rich_text_body && msg.rich_text_body.body;
        var paras = ((body && body.content) || []).map(function (n) {
          return nodeText(n).trim();
        }).filter(Boolean);
        if (!paras.length) return '';
        var who = people.filter(function (p) {
          return p.id === msg.chat_room_participant_id;
        })[0] || {};
        var name = who.name || '';
        var face = who.avatar_url
          ? '<img src="' + esc(who.avatar_url) + '" alt="">'
          : '<span class="rini">' + esc(name.charAt(0)) + '</span>';
        var said = paras.map(function (t, i) {
          return '<p class="rtxt">' + (i ? '' : '“') + esc(t) +
                 (i === paras.length - 1 ? '”' : '') + '</p>';
        }).join('');
        return '<div class="threply">' + face +
                 '<div><p class="rwho">' + esc(name) + '</p>' + said + '</div></div>';
      }).join('');
      if (html) mount.appendChild(el('<div>' + html + '</div>'));
    });
  }

  /* `quoteMount` sits high on the page, between the welcome and the month, so
     a member's own words are the first thing after the three steps. */
  function fillCommunity(mount, quoteMount) {
    if (!mount) return Promise.resolve();
    return posts(CFG.spaces.community, 30).then(function (rs) {
      var u = CFG.urls;
      var live = rs.filter(function (p) {
        return p.published_at && p.slug && (!p.status || p.status === 'published');
      }).sort(function (a, b) {
        return new Date(b.published_at) - new Date(a.published_at);
      });

      var people = [], features = [], quotes = [];
      live.forEach(function (p) {
        var l = label(p);
        if (CFG.memberLabels.indexOf(l) > -1) { if (people.length < CFG.peopleCount) people.push(p); }
        else if (l === 'QUOTE') { if (quotes.length < CFG.quoteCount) quotes.push(p); }
        else if (CFG.featureLabels.indexOf(l) > -1) { if (features.length < CFG.featureCount) features.push(p); }
      });

      if (!people.length && !features.length && !quotes.length) return;

      var html = '<section>' +
                 '<h2 class="sh">From the <b>Community</b></h2>' +
                 '<p class="lead">These are some of the members of Constellations. ' +
                 'You can read about them here.</p>';

      if (people.length) {
        var cards = people.map(function (p) {
          var ps    = paragraphs(p);
          var meta  = ps[1] || '';
          var hello = (listItems(p, 'ul')[0] || {}).text || '';
          var src   = photo(p);
          var face  = src
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
              '<a class="go" href="' + esc(postUrl(p, 'ns-community')) + '">Meet ' +
              esc(who) + ' →</a></div>';
        }).join('');
        html += '<div class="ppl">' + cards + '</div>';
      }

      if (features.length) {
        var spots = features.map(function (p, idx) {
          var l    = label(p);
          var ps   = paragraphs(p).slice(1).filter(notLabel);
          /* Short all-caps lines (30s · MARYLAND) are tags, shown as chips on top, not as text. */
          var tagx = [];
          while (ps.length && ps[0].length <= 40 && !/[a-z]/.test(ps[0].replace(/(\d)s\b/g, '$1S'))) tagx.push(ps.shift());
          var src  = photo(p);
          var cta  = CFG.featureLink[l] || 'View Post';
          var role = '', body = '';

          if (ps.length && ps[0].length <= 90) { role = ps[0]; body = ps[1] || ''; }
          else { body = ps[0] || ''; }

          var mid;
          if (l === 'A FEW MINUTES WITH') {
            var pair = qaPairs(p)[0];
            mid = pair
              ? '<p class="fq">' + esc(pair.q) + '</p>' +
                '<p class="fa">“' + esc(pair.a) + '”</p>'
              : (body ? '<p>' + esc(body) + '</p>' : '');
          } else if (l === 'THREE QUESTIONS') {
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
              (memberTag(p) ? '<span class="lab3">' + esc(memberTag(p)) + '</span>' : '') +
              tagx.map(function (x) { return '<span class="lab3">' + esc(x) + '</span>'; }).join('') +
              '<h2>' + esc(p.name) + '</h2>' +
              (role ? '<p class="role">' + esc(role) + '</p>' : '') +
              mid +
              '<a class="go" href="' + esc(postUrl(p, 'ns-community')) + '">' +
              esc(cta) + ' →</a></div></div>';
        }).join('');
        html += '<div style="margin-top:38px;padding-top:38px;border-top:1px solid var(--ha)">' +
                spots + '</div>';
      }

      var asides = quotes.map(function (p) {
        var q = (blocks(p).filter(function (b) { return b.type === 'q'; })[0] || {}).text || '';
        if (!q) return '';
        var loc = paragraphs(p).slice(1).filter(notLabel).filter(function (t) {
          return t.length <= 60 && t !== p.name;
        })[0] || '';
        /* age and place go in a tag on top; the attribution is the name alone */
        var nm0 = (p.name || '').trim();
        if (nm0 && loc.toLowerCase().indexOf(nm0.toLowerCase() + ' · ') === 0) loc = loc.slice(nm0.length + 3).trim();
        var src = photo(p);
        return '<a class="qi" href="' + esc(postUrl(p, 'ns-community')) + '">' +
            (src ? '<img src="' + esc(src) + '" alt="">' : '') +
            '<span class="qw">' +
              '<span class="qt"><span class="lab2">' + esc(label(p)) + '</span>' +
              (memberTag(p) ? '<span class="lab3">' + esc(memberTag(p)) + '</span>' : '') +
              (loc ? '<span class="lab3">' + esc(loc) + '</span>' : '') +
              '</span>' +
              '<q>' + esc(decode(q)) + '</q>' +
              '<cite>' + esc(p.name || '') + '</cite></span></a>';
      }).join('');
      /* the quote rides high on the page, not down in Community */
      if (asides && quoteMount) {
        quoteMount.appendChild(el('<section class="qsec">' + asides + '</section>'));
      } else if (asides) {
        html += '<div class="qa">' + asides + '</div>';
      }

      html += '<div class="featme">' +
          '<p><b>Would you like to be in the Community space?</b> You can answer a ' +
          'few questions, show something you made, share a photograph of your pet, ' +
          'or tell us about a book you like. You see it first and you say yes ' +
          'before it goes up.</p>' +
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

  /* Two things keep undoing this page, so both are repaired continuously.

     1. Circle's React reconciles #nvx-space into our own root. portal.css
        hides everything that FOLLOWS .nvx-space on this space, so that node
        has to sit outside our root and after it, or the whole page vanishes.
     2. The portal's hideTitle() hides the parent of any <h1>, which is why
        the masthead title is a .t1 rather than an <h1>.

     reseat() runs on every tick and on every child change of our container,
     so neither one is ever visible to a member. */
  function reseat() {
    var root = document.getElementById(CFG.root);
    var nvx  = document.getElementById('nvx-space');
    if (!root || !root.parentElement) return;
    if (nvx) {
      if (root.contains(nvx) || nvx.nextElementSibling === root) {
        root.parentElement.insertBefore(nvx, root.nextSibling);
      }
      if (nvx.style.display !== 'none') nvx.style.display = 'none';
    }
    var mast = root.querySelector('.cst-mast');
    if (mast && mast.style.display === 'none') mast.style.display = '';
  }

  var watcher = null;

  function watch(parent) {
    if (!parent) return;
    if (!watcher) watcher = new MutationObserver(reseat);
    watcher.disconnect();
    watcher.observe(parent, { childList: true });
  }

  function build() {
    if (!onHome()) return;
    if (document.getElementById(CFG.root)) { reseat(); return; }

    var host = anchor();
    if (!host || !host.parentElement) return;

    style();

    var root = document.createElement('div');
    root.id = CFG.root;
    root.setAttribute('data-cst-nshome', VERSION);
    root.innerHTML = welcomeHTML() +
                     '<div id="cst-nsq"></div>' +
                     themeHTML() +
                     '<div id="cst-nsco"></div>' +
                     supportHTML();
    host.parentElement.insertBefore(root, host);
    watch(root.parentElement);
    reseat();

    fillArticles(root.querySelector('#cst-nsar')).catch(function () {});
    fillReply(root.querySelector('#cst-nsre')).catch(function () {});
    fillCommunity(root.querySelector('#cst-nsco'),
                  root.querySelector('#cst-nsq')).catch(function () {});
  }

  function teardown() {
    if (watcher) watcher.disconnect();
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
