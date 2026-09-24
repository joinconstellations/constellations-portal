/* Constellations portal scripts
   Extracted from the Circle Head code snippet, 23 Sep 2026.
   Source order preserved exactly. Block numbers refer to the original snippet.
   Not included here: the form-handler script (holds a private endpoint, stays in Circle)
   and the home.js / features.css loader tags. */

/* ---- block 4 ---- */
(function(){function m(){document.documentElement.classList.toggle('cn-guides',/^\/c\/guides(\/|$)/.test(location.pathname));}m();setInterval(m,500);})();
;

/* ---- block 7 ---- */
if(location.pathname=="/leaderboard"||location.pathname=="/leaderboard/"){location.replace("/c/welcome/");}
;

/* ---- block 9 ---- */
(function(){var HIDE=[["/c/report","member-safety-and-concern-reports"]];
function s(){var p=location.pathname.replace(/\/$/,"");HIDE.forEach(function(pair){if(p!==pair[0])return;document.querySelectorAll('a[href*="'+pair[1]+'"]').forEach(function(a){var card=a.closest('div.rounded-xl');if(card)card.style.display='none';});});}
document.addEventListener("DOMContentLoaded",s);setInterval(s,600);})();
;

/* ---- block 10 ---- */
(function(){function s(){document.querySelectorAll('span').forEach(function(el){if(el.children.length)return;var t=(el.textContent||'').trim();if(/^Member since\b/.test(t)||/^Last seen\b/.test(t)){var r=el.closest('div.flex.items-center');(r||el).style.display='none';}});}
document.addEventListener('DOMContentLoaded',s);setInterval(s,600);})();
;

/* ---- block 12 ---- */
(function(){
  var CSS = "#nvx-cl-head{padding:22px 20px 0}#nvx-cl-head h2{font-family:'EB Garamond',Georgia,serif;font-size:27px;line-height:1.22;font-weight:500;color:#22231E;margin:0}#nvx-cl-head p{font-size:14px;line-height:1.55;color:#5A5849;margin:8px 0 0}[data-nvx-cl] header h5{display:none}[data-nvx-cl] header{padding-top:10px;padding-bottom:0;border:0 !important}[data-nvx-cl] .rounded-xl{border:0 !important;border-bottom:1px solid #E2E2DB !important;border-radius:0 !important}[data-nvx-cl] .flex.flex-col.gap-2{gap:0 !important}[data-nvx-cl] button.flex.w-full svg.icon-secondary{display:none}[data-nvx-cl] button.flex.w-full{padding-bottom:6px !important;cursor:default}[data-nvx-cl] button.flex.w-full + div{height:auto !important;max-height:none !important;opacity:1 !important;visibility:visible !important;overflow:visible !important;transition:none !important}[data-nvx-cl] span.text-label-sm{font-size:15px;font-weight:600;color:#22231E}[data-nvx-cl] .pl-11 p{font-size:14px;line-height:1.55;color:#5A5849}[data-nvx-cl] .pl-11 a,[data-nvx-cl] .pl-11 button{background:none !important;border:0 !important;padding:0 !important;color:#2E4057 !important;font-weight:500 !important;box-shadow:none !important;min-height:0 !important}[data-nvx-cl] .pl-11 a::after,[data-nvx-cl] .pl-11 button::after{content:\" \\2192\";color:#5A5849}";
  function inject(){
    if(!document.getElementById("nvx-cl-font")){var l=document.createElement("link");l.id="nvx-cl-font";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600&display=swap";document.head.appendChild(l);}
    if(!document.getElementById("nvx-cl-css")){var s=document.createElement("style");s.id="nvx-cl-css";s.textContent=CSS;document.head.appendChild(s);}
  }
  function tick(){
    var hs=document.querySelectorAll("h5"), h5=null, i;
    for(i=0;i<hs.length;i++){ if((hs[i].textContent||"").trim()==="Get started checklist"){ h5=hs[i]; break; } }
    if(!h5) return;
    var hdr=h5.closest("header"); if(!hdr) return;
    var root=hdr.parentElement; if(!root) return;
    inject();
    if(root.getAttribute("data-nvx-cl")!=="1"){
      root.setAttribute("data-nvx-cl","1");
      var d=document.createElement("div"); d.id="nvx-cl-head";
      d.innerHTML="<h2>Welcome!<br>We’re glad you’re here.</h2><p>Here are a few steps to help you settle in before you start exploring.</p>";
      root.insertBefore(d, root.children[1]);
    }
    var all=root.querySelectorAll("*");
    for(i=0;i<all.length;i++){
      var e=all[i];
      if(e.children.length===0 && /^\d+ of \d+ done$/.test((e.textContent||"").trim())){ e.textContent=e.textContent.replace(" done"," complete"); }
    }
    var cards=root.querySelectorAll("div.rounded-xl");
    for(i=0;i<cards.length;i++){
      var b=cards[i].querySelector("button"), p=b&&b.nextElementSibling;
      if(b&&p){ p.style.height="auto"; p.style.maxHeight="none"; p.removeAttribute("hidden"); if(p.clientHeight<12){ b.click(); } }
    }
  }
  setInterval(tick,600); tick();
})();

;

/* ---- block 15 ---- */
      (function(){function t(){var b=document.getElementsByTagName("button");for(var i=0;i<b.length;i++){if(/^Joined\s/.test((b[i].textContent||"").trim())){b[i].style.display="none";}}}setInterval(t,600);t();})();

;

/* ---- block 16 ---- */
  (function(){
      var COLOR="#2E4057";
      var BLANK="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      function tick(){
            var m=document.querySelectorAll('img[src*="emoji-picker-v3/icons/"]');
            for(var i=0;i<m.length;i++){
                    var im=m[i], u=im.currentSrc||im.src;
                    if(!u||u.indexOf("emoji-picker-v3/icons/")<0) continue;
                    im.style.backgroundColor=COLOR;
                    im.style.webkitMaskImage='url("'+u+'")';
                    im.style.maskImage='url("'+u+'")';
                    im.style.webkitMaskSize="contain";
                    im.style.maskSize="contain";
                    im.style.webkitMaskRepeat="no-repeat";
                    im.style.maskRepeat="no-repeat";
                    im.style.webkitMaskPosition="center";
                    im.style.maskPosition="center";
                    im.src=BLANK;
            }
      }
      setInterval(tick,600); tick();
  })();

;

/* ---- block 18 ---- */
 if(location.pathname=="/feed"||location.pathname=="/feed/"){location.replace("/c/welcome/");}
;

/* ---- block 23 ---- */
(function(){
var MARK='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12.00 0.00 Q12.82 10.01 20.49 3.51 Q13.99 11.18 24.00 12.00 Q13.99 12.82 20.49 20.49 Q12.82 13.99 12.00 24.00 Q11.18 13.99 3.51 20.49 Q10.01 12.82 0.00 12.00 Q10.01 11.18 3.51 3.51 Q11.18 10.01 12.00 0.00 Z"/></svg>';
function railLabel(){var a=document.querySelector('aside[data-testid="circle-ai-shell-rail-panel"]');if(!a)return null;var h=a.querySelector("h1,h2,h3,h4,h5,h6");return h?h.textContent.trim():null;}
function go(){
 if(!document.body)return;
 var on=document.body.classList.contains("view-space--2867080");
 var ex=document.querySelector(".nsd-hero");
 if(!on){document.documentElement.removeAttribute("data-nsd-rail");if(ex)ex.remove();return;}
 if(!document.getElementById("nsd-font")){var fl=document.createElement("link");fl.id="nsd-font";fl.rel="stylesheet";fl.href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&family=Inter:wght@400;600&display=swap";document.head.appendChild(fl);}
 if(railLabel()==="Details"){document.documentElement.setAttribute("data-nsd-rail","hide");}else{document.documentElement.removeAttribute("data-nsd-rail");}
 if(!ex){
  var sw=document.getElementById("scrollWrapper");
  var host=sw?sw.parentElement:null;
  if(host){
   var d=document.createElement("div");d.className="nsd-hero";d.style.flex="0 0 auto";
   d.innerHTML='<div class="nsd-eyebrow">North Star</div><h2>'+MARK+'Discussions</h2><div class="nsd-rule"></div>';
   host.insertBefore(d,host.firstChild);
  }
 }
 var stream=document.getElementById("scrollWrapper");
 if(stream){[].forEach.call(stream.querySelectorAll("h6"),function(h){
  if((h.textContent||"").trim()!=="Constellations")return;
  var p=h;for(var i=0;i<6&&p;i++){p=p.parentElement;}
  if(p&&!p.classList.contains("nsd-prompt"))p.classList.add("nsd-prompt");
 });}
}
function start(){go();new MutationObserver(go).observe(document.documentElement,{childList:true,subtree:true});}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",start);}else{start();}
})();

;

/* ---- block 26 ---- */
(function(){
  var SPACE = "2870142|2862303|2860066|2860046";
  var WORDS = { "NEW MEMBER": 1, "FEATURED MEMBER": 1, "MEMBER STORY": 2, "CONSTELLATIONS COUPLES": 2, "GUIDING PRINCIPLE": 2, "GOOD COMPANY": 2, "THREE QUESTIONS": 2, "PASSION PROJECTS": 2, "A FEW MINUTES WITH": 2, "WORTH SHARING": 2, "QUOTE": 2 };
  function norm(t) { return (t || "").replace(/\s+/g, " ").trim().toUpperCase(); }
  function inSpace() { return new RegExp("view-space--(?:" + SPACE + ")" + "(?:\\s|$)").test(document.body.className); }
  function labelled(el) { return (!!el && el.tagName === "P") ? (WORDS[norm(el.textContent)] || 0) : 0; }
  function tip(post) { return post.querySelector('[data-circle="post-body"] .tiptap'); }
  function tidy(post) {
    var w = post.querySelector('[data-nsm="tags"]'), t = tip(post);
    if (w) {
      while (w.firstChild) {
        var n = w.lastChild;
        if (n.getAttribute && n.getAttribute("data-nsm-auto")) { w.removeChild(n); continue; }
        if (n.removeAttribute) { n.removeAttribute("data-nsm"); n.removeAttribute("data-nsm-fm"); }
        if (t) t.insertBefore(n, t.firstChild); else w.parentNode.insertBefore(n, w);
      }
      if (w.parentNode) w.parentNode.removeChild(w);
    }
    if (post.hasAttribute("data-nsm")) post.removeAttribute("data-nsm");
  }
  function scan() {
    var here = inSpace(), posts = document.querySelectorAll('[data-circle="post"]');
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      var w = post.querySelector('[data-nsm="tags"]'), t = tip(post);
      var src = w ? w.firstElementChild : (t ? t.firstElementChild : null);
      var mode = labelled(src);
      if (!here || !mode) { tidy(post); continue; }
      var kind = (mode === 2) ? "story" : "card";
      if (post.getAttribute("data-nsm") !== kind) post.setAttribute("data-nsm", kind);
var lab = norm(src.textContent);
if (post.getAttribute("data-nsm-label") !== lab) post.setAttribute("data-nsm-label", lab);
      if (!document.getElementById("nsm-font")) { var fl = document.createElement("link"); fl.id = "nsm-font"; fl.rel = "stylesheet"; fl.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&display=swap"; document.head.appendChild(fl); }
      if (!w) {
        var h1 = post.querySelector('[data-circle="post-title"]');
        var row = h1 && h1.parentElement, head = row && row.parentElement;
        if (!head || !t) continue;
        var p1 = t.firstElementChild, p2 = p1 && p1.nextElementSibling;
        w = document.createElement("div");
        w.setAttribute("data-nsm", "tags");
        p1.setAttribute("data-nsm", "tag");
        w.appendChild(p1);
        if (mode === 1 && p2 && p2.tagName === "P") { p2.setAttribute("data-nsm", "tag"); w.appendChild(p2); }
        head.insertBefore(w, row);
      }
    }
  }
  var queued = false;
  function ping() {
    if (queued) return;
    queued = true;
    setTimeout(function () { queued = false; try { scan(); } catch (e) {} }, 0);
  }
  new MutationObserver(ping).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", ping);
  ping();
})();
;

/* ---- block 31 ---- */
(function () {
  var SPACE = "2870142|2860066";
  function inSpace() { return new RegExp("view-space--(?:" + SPACE + ")(?:\\s|$)").test(document.body.className); }
  document.addEventListener("click", function (e) {
    if (!inSpace()) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('button,[role="menuitem"],[role="menu"],input,textarea')) return;
    var card = t.closest('[data-nsm="card"],[data-nsm="story"],[data-circle="post"],[data-testid="post-container"]');
    var a = t.closest('a[href]');
    if (a) {
      var href = a.getAttribute("href") || "";
      /* A real link inside a card is still a link. Without this every entry on
         a contents page (All Guides, All Articles) is swallowed here, and no
         guide opens. Fixed 24 Sep 2026. */
      if (href && href.charAt(0) !== "#") return;
      if (!card) return;
    } else if (!card) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  }, true);
})();

;

/* ---- block 35 ---- */
(function(){
var MARK="<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.750-3.970 9.750-9s-4.428-9-9.750-9-9.750 3.970-9.750 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223z\"/></svg>";
var HTML='<div class="csd-lockup">'+MARK+'<h2>Discussions</h2></div>'
+'<div class="csd-lede">Common Ground</div>'
+'<div class="csd-rule"></div>'
+'<div class="csd-sub">This space is for connection, reflection, and exploring this month’s theme: Transitions.</div>';
function railLabel(){var a=document.querySelector('aside[data-testid="circle-ai-shell-rail-panel"]');if(!a)return null;var h=a.querySelector("h1,h2,h3,h4,h5,h6");return h?h.textContent.trim():null;}
function go(){
if(!document.body)return;
var on=document.body.classList.contains("view-space--2867079");
var ex=document.querySelector(".csd-hero");
if(!on){if(ex){ex.remove();document.documentElement.removeAttribute("data-nsd-rail");}return;}
if(!document.getElementById("nsd-font")){var fl=document.createElement("link");fl.id="nsd-font";fl.rel="stylesheet";fl.href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=EB+Garamond:wght@400;500&display=swap";document.head.appendChild(fl);}
if(railLabel()==="Details"){document.documentElement.setAttribute("data-nsd-rail","hide");}else{document.documentElement.removeAttribute("data-nsd-rail");}
if(!ex){
var sw=document.getElementById("scrollWrapper");
var host=sw?sw.parentElement:null;
if(host){
var d=document.createElement("div");d.className="csd-hero";d.style.flex="0 0 auto";
d.innerHTML=HTML;
host.insertBefore(d,host.firstChild);
}
}
var stream=document.getElementById("scrollWrapper");
if(stream){[].forEach.call(stream.querySelectorAll("h6"),function(h){
if((h.textContent||"").trim()!=="Constellations")return;
var p=h;for(var i=0;i<6&&p;i++){p=p.parentElement;}
if(p&&!p.classList.contains("csd-prompt"))p.classList.add("csd-prompt");
});}
}
function start(){go();new MutationObserver(go).observe(document.documentElement,{childList:true,subtree:true});}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",start);}else{start();}
})();

;

/* ---- block 39 ---- */
  (function(){var A="<i>→<\/i>";
  function b(){if(!document.body.classList.contains("view-space--2860046"))return;
   var sp=document.querySelector(".nvx-space");if(!sp||sp.querySelector(".ch-wrap"))return;
   var w=document.createElement("div");w.className="ch-wrap";w.innerHTML=
   '<section class="ch"><div class="ch-card"><p class="ch-lab">This month · Transitions</p>'
  +'<p class="ch-p" style="margin-top:0">This month’s theme is Transitions — the in-between. The waiting, the not knowing, and the building of something you can’t see the shape of yet. It runs through the articles, the discussions and the gatherings all month.</p>'
  +'<blockquote style="margin:24px 0 0;padding-left:22px;border-left:3px solid #CBBBA0"><p class="ch-p" style="margin:0;font-style:italic;font-size:20px;color:#1A2238">“Be patient toward all that is unsolved in your heart, and try to love the questions themselves.”</p>'
  +'<p class="ch-p ch-mut" style="margin-top:12px;font-size:14px">— Rainer Maria Rilke, Letters to a Young Poet, 1903</p></blockquote>'
  +'<p class="ch-p ch-mut" style="margin-top:26px;font-size:14px"><strong style="font-weight:600">Next month:</strong> Masking</p>'
  +'</div></section>'
  +'<section class="ch"><div class="ch-card ch-sand"><p class="ch-lab">From Kate · September</p>'
  +'<p class="ch-p" style="margin-top:0">I have been thinking about the stretch between leaving one thing and arriving at the next.</p>'
  +'<p class="ch-p">Most advice about it is about getting through it faster. I do not think that is right.</p>'
  +'<p class="ch-p">Some of the most honest conversations I have had here happened in the middle, when the person did not yet know how it turned out.</p></div></section>'
  +'<section class="ch"><div class="ch-two"><div class="ch-card"><p class="ch-lab">Something to try</p>'
  +'<h2 class="ch-h">Tell one person you are in the middle of something.</h2>'
  +'<p class="ch-p">Not the whole story. One sentence, to one person who does not already know.</p>'
  +'<p class="ch-p ch-mut">Saying it out loud once makes the second time easier. You do not have to want advice, and you are allowed to say that too.</p></div>'
  +'<div class="ch-card"><p class="ch-lab">This month’s question</p>'
  +'<h2 class="ch-h">What helped you most, the last time you were between things?</h2>'
  +'<p class="ch-p ch-mut">Answer in a sentence or in a paragraph. There is no right length, and you are welcome to read without replying.</p>'
  +'<a class="ch-a" href="/c/community-discussions">Answer in Discussions '+A+'</a></div></div></section>'
  +'<section class="ch"><div class="ch-card"><p class="ch-lab">New this month</p>'
  +'<h2 class="ch-h">Amy, Evan, Luke and Lucy have introduced themselves.</h2>'
  +'<p class="ch-p ch-mut">Four new members, in their own words.</p>'
  +'<a class="ch-a" href="/c/community">Read their introductions '+A+'</a></div></section>'
  +'<div class="ch-foot"><div class="ch-pr">Clarity is kindness &nbsp;·&nbsp; Slow is safe &nbsp;·&nbsp; Pressure is poison</div>'
  +'<div class="ch-help"><a href="/c/nova">Ask Nova</a><a href="/c/report">Report a concern</a></div></div>';
   sp.appendChild(w);}
  new MutationObserver(b).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener("DOMContentLoaded",b);b();})();
  
;

/* ---- block 49 ---- */
/* Label row on member features: the format label, then FEATURED MEMBER, then one
   short line such as "30s · NEW JERSEY". FEATURED MEMBER is added automatically
   when the post does not include it, and is always set in the light outlined style. */
(function(){
var FEAT={"MEMBER STORY":1,"GOOD COMPANY":1,"THREE QUESTIONS":1,"PASSION PROJECTS":1,"A FEW MINUTES WITH":1,"WORTH SHARING":1,"QUOTE":1};
function up(s){return (s||'').replace(/\s+/g,' ').trim().toUpperCase();}
function isFM(el){return up(el.textContent)==='FEATURED MEMBER';}
function fix(){
var ps=document.querySelectorAll('[data-nsm="story"],[data-nsm="card"]');
for(var i=0;i<ps.length;i++){
var w=ps[i].querySelector('[data-nsm="tags"]');
if(!w||!w.firstElementChild) continue;
if(ps[i].getAttribute('data-nsm')==='story'){
var t=ps[i].querySelector('.tiptap');
for(var g=0;t&&g<2;g++){
var p=t.firstElementChild;
if(!p||p.tagName!=='P') break;
var x=p.textContent.trim();
if(!x||x.length>60) break;
if(x===w.firstElementChild.textContent.trim()) break;
var extra=0;
for(var c=w.firstElementChild.nextElementSibling;c;c=c.nextElementSibling){if(!isFM(c))extra++;}
if(!isFM(p)&&extra>0) break;
p.setAttribute('data-nsm','tag'); w.appendChild(p);
}
var fm=null;
for(var d=w.firstElementChild;d;d=d.nextElementSibling){if(isFM(d)){fm=d;break;}}
if(!fm&&FEAT[up(w.firstElementChild.textContent)]&&!/FROM (KATE|THE TEAM)/.test(up(w.textContent))){
fm=document.createElement('p');fm.textContent='FEATURED MEMBER';
fm.setAttribute('data-nsm','tag');fm.setAttribute('data-nsm-auto','1');
}
if(fm&&fm!==w.firstElementChild&&fm.previousElementSibling!==w.firstElementChild){
w.insertBefore(fm,w.firstElementChild.nextSibling);
}
}
for(var e=w.firstElementChild;e;e=e.nextElementSibling){
if(isFM(e)){if(!e.hasAttribute('data-nsm-fm'))e.setAttribute('data-nsm-fm','1');}
else if(e.hasAttribute('data-nsm-fm'))e.removeAttribute('data-nsm-fm');
}
}
}
var q=false;
function ping(){if(q)return;q=true;setTimeout(function(){q=false;try{fix()}catch(e){}},60);}
new MutationObserver(ping).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',ping);ping();
})();

;
/* ---- block 50 (added 24 Sep 2026) ----
   STOPGAP. Copy corrections to the space-header template, which still lives in
   Circle's JavaScript snippet field (64,323 of 65,536 characters — no safe room
   to edit there). Fold both into the template when it moves to space-header.js,
   then delete this block. */
(function () {
  var ARTICLES = 'If you’d prefer articles that are shorter, or more direct, ' +
                 'check out the articles in our North Star space. Use whichever ' +
                 'space works best for you.';
  function fix() {
    if (!document.body) return;
    /* Articles (2860047) — Kate's rewritten quote. */
    if (document.body.classList.contains('view-space--2860047')) {
      var p = document.querySelector('.nvx-quote .nvx-qbody p');
      if (p && p.getAttribute('data-cst-copy') !== '1') {
        var o = p.querySelector('.nvx-qm-o'), c = p.querySelector('.nvx-qm-c');
        while (p.firstChild) p.removeChild(p.firstChild);
        if (o) p.appendChild(o);
        p.appendChild(document.createTextNode(ARTICLES));
        if (c) p.appendChild(c);
        p.setAttribute('data-cst-copy', '1');
      }
    }
    /* Nova (2860067) — coaching is temporarily off the portal, so the link in
       the quote is unwrapped to plain text rather than left pointing at it. */
    if (document.body.classList.contains('view-space--2860067')) {
      var a = document.querySelector('.nvx-quote .nvx-qbody a[href*="coaching"]');
      if (a && a.parentNode) {
        a.parentNode.replaceChild(document.createTextNode(a.textContent), a);
      }
    }
  }
  setInterval(fix, 600); fix();
})();

;