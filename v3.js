/* Arena site v3 · one script for every page. Each part runs only when its markup is on the page.
   Motion: A · Settle. Transform and opacity only. Reduced motion shows the finished state.
   Recipes adapted from the animated-site-modules plugin (cinematic-site-components, MIT, RoboNuggets). */
(function(){
  var H=document.documentElement,still=H.classList.contains('still');
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
  var wide=function(){return innerWidth>820};
  var ticks=[];

  /* menu */
  var mb=$('.menu3');
  if(mb){var mh=mb.closest('.hdr3'),setMenu=function(o){mh.classList.toggle('open',o);mb.setAttribute('aria-expanded',o);mb.textContent=o?'Close':'Menu'};
    mb.addEventListener('click',function(){setMenu(!mh.classList.contains('open'))});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&mh.classList.contains('open')){setMenu(false);mb.focus()}});
    document.addEventListener('click',function(e){if(mh.classList.contains('open')&&!mh.contains(e.target))setMenu(false)});
    addEventListener('resize',function(){if(innerWidth>900&&mh.classList.contains('open'))setMenu(false)})}

  /* words rise out of their own line */
  if(!still)$$('[data-split]').forEach(function(el){
    el.innerHTML=el.textContent.trim().split(/\s+/).map(function(w,i){return '<span class="w"><span style="transition-delay:'+(i*55)+'ms">'+w+'</span></span>'}).join(' ');
  });
  var rev=$$('[data-split],[data-r]');
  ticks.push(function(vh){if(still)return;rev.forEach(function(el){if(!el.classList.contains('in')&&(el.closest('.hold-in')||el.getBoundingClientRect().top<vh*.9))el.classList.add('in')})});

  /* date wheel */
  /* each reel's position follows the year itself, like an odometer: a later year always rolls the digits one way,
     an earlier year always rolls them back the other way, even when that is the long way round */
  function mkWheel(el,years){var lo=Math.min.apply(null,years),hi=Math.max.apply(null,years),reels=[];
    [1000,100,10,1].forEach(function(div){var r=document.createElement('span'),a=Math.floor(lo/div),b=Math.floor(hi/div);r.className='reel';
      for(var v=a;v<=b;v++){var x=document.createElement('i');x.textContent=v%10;r.appendChild(x)}el.appendChild(r);reels.push({r:r,a:a,div:div})});
    return function(y){reels.forEach(function(o){o.r.style.transform='translateY('+(-(Math.floor(+y/o.div)-o.a))+'em)'})}}

  /* Hero: scrolls away like any other section (no cover, no fade). */

  /* Statement band: the ink fills in word by word as you scroll, with a soft leading edge of about three words.
     Faint to full, so the sentence is whole and AA once filled. Reduced motion, or no script: plain full ink. */
  var fill=$('[data-fill]');
  if(fill&&!still){
    var words=fill.textContent.trim().split(/\s+/);fill.setAttribute('aria-label',fill.textContent.trim());
    fill.innerHTML=words.map(function(w){return '<span class="fw" aria-hidden="true">'+w+'</span>'}).join(' ');
    var fws=$$('.fw',fill),EDGE=3,FLOOR=.16;
    ticks.push(function(vh){var r=fill.getBoundingClientRect(),p=clamp((vh*.88-r.top)/(vh*.5+r.height*.35),0,1),n=fws.length;
      fws.forEach(function(el,i){var w=clamp((p*(n+EDGE)-i)/EDGE,0,1);el.style.opacity=(FLOOR+(1-FLOOR)*w).toFixed(3)})});
  }

  /* Photo curtain: the photograph slides up over the statement; the statement settles back (smaller, dimmer) as it is covered. */
  var cur=$('.cur'),curBack=cur&&$('.cur-back',cur),curFront=cur&&$('.spread',cur);
  if(cur&&curBack&&curFront&&!still)ticks.push(function(vh){var t=curFront.getBoundingClientRect().top,p=clamp((vh-t)/(vh*.9),0,1);
    curBack.style.transform='scale('+(1-.06*p).toFixed(4)+')';curBack.style.opacity=(1-.2*p).toFixed(3)});

  /* company rows: one open at a time. The name attribute does this in current browsers; this covers older ones.
     Only .cos-r rows take part, so the Leadership rows and anything else on the page are left alone. */
  var cosR=$$('.cos-r');
  /* Opening one row closes the others, and the page above it shrinks, which threw the reader a section down.
     On the click, remember where the row sits. For the next 40 ticks (about 0.7s), nudge the scroll so the row stays put; stop at once if the reader scrolls. */
  cosR.forEach(function(d){var s=d.querySelector('summary');s.addEventListener('click',function(){var t=s.getBoundingClientRect().top,n=0,stop=false,
      halt=function(){stop=true};
    addEventListener('wheel',halt,{once:true,passive:true});addEventListener('touchmove',halt,{once:true,passive:true});
    (function step(){if(stop||++n>40){removeEventListener('wheel',halt);removeEventListener('touchmove',halt);return}
      if(d.open){cosR.forEach(function(o){if(o!==d)o.open=false});var dy=s.getBoundingClientRect().top-t;if(Math.abs(dy)>1)scrollBy({top:dy,behavior:'instant'})}
      setTimeout(step,16)})()})});

  /* catering years: wheel beside the steps */
  var yw=$('.yrs .wheel');
  if(yw){var sts=$$('.yrs .st'),setY=mkWheel(yw,sts.map(function(s){return +s.dataset.y})),yc=-1;
    ticks.push(function(vh){var best=0,bd=1e9;sts.forEach(function(s,i){var r=s.getBoundingClientRect(),d=Math.abs((r.top+r.bottom)/2-vh*.5);if(d<bd){bd=d;best=i}});
      if(best!==yc){yc=best;sts.forEach(function(s,i){s.classList.toggle('on',i===best)});setY(sts[best].dataset.y)}})}

  /* G · history: one block on Home and Heritage. Desktop: the page scroll moves the years sideways.
     Phones: the wheel stays pinned and the years pass under it; the one nearest the middle of the screen is current. */
  var his=$('.his');
  if(his){var pin=$('.his-pin',his),trk=$('.trk',his),bars=$$('.his-bar b',his),hit=$$('li',trk),hcur=-1,hTop=$('.his-top',his),setH=mkWheel($('.wheel',his),hit.map(function(li){return +li.dataset.y}));
    his.style.setProperty('--n',hit.length);
    var setBar=function(q){bars.forEach(function(b){b.style.transform='scaleX('+q+')'})};
    var pinH=function(){return !still&&wide()};
    var step=function(){return hit[1].offsetLeft-hit[0].offsetLeft};
    var hAct=function(i){if(i===hcur)return;hcur=i;hit.forEach(function(li,j){li.classList.toggle('on',j===i)});setH(hit[i].dataset.y)};
    var hNative=function(){var m=trk.scrollWidth-trk.clientWidth,q=m>0?trk.scrollLeft/m:0;setBar(q);hAct(Math.round(trk.scrollLeft/step()))};
    var hToYear=function(i){var li=hit[clamp(i,0,hit.length-1)];scrollTo({top:scrollY+li.getBoundingClientRect().top-innerHeight*.42,behavior:still?'auto':'smooth'})};
    trk.addEventListener('scroll',function(){if(wide()&&!pinH()&&hcur>=0)hNative()},{passive:true});
    trk.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'||e.key==='ArrowDown'&&!wide()?1:e.key==='ArrowLeft'||e.key==='ArrowUp'&&!wide()?-1:0;if(!d)return;e.preventDefault();if(!wide()){hToYear(hcur+d);return}if(pinH()){scrollBy({top:d*(pin.offsetHeight-innerHeight)/(hit.length-1),behavior:'smooth'});return}trk.scrollBy({left:step()*d,behavior:still?'auto':'smooth'})});
    var hGoal=null,hClear;/* quick taps add up: each one moves the goal, not the position a moving list happens to be at */
    $$('.his-ctl button',his).forEach(function(b){b.addEventListener('click',function(){var from=hGoal===null?Math.round(trk.scrollLeft/step()):hGoal;hGoal=clamp(from+ +b.dataset.d,0,hit.length-1);
      trk.scrollTo({left:hGoal*step(),behavior:still?'auto':'smooth'});clearTimeout(hClear);hClear=setTimeout(function(){hGoal=null},900)})});
    ticks.push(function(vh){var on=pinH(),phone=!wide();his.classList.toggle('pin',on);
      if(phone){trk.style.transform='';var best=0,bd=1e9;hit.forEach(function(li,i){var r=li.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-vh*.5);if(d<bd){bd=d;best=i}});
        var a=hit[0].getBoundingClientRect().top,z=hit[hit.length-1].getBoundingClientRect().top;setBar(clamp((vh*.5-a)/(z-a||1),0,1));hAct(best)}
      else if(on){var r=pin.getBoundingClientRect(),run=pin.offsetHeight-vh,q=clamp(-r.top/run,0,1);
        trk.style.transform='translateX('+(-q*(hit[hit.length-1].offsetLeft-hit[0].offsetLeft))+'px)';setBar(q);
        if(r.top<vh*.6)hAct(Math.round(q*(hit.length-1)))}
      else{trk.style.transform='';if(hcur<0&&hTop.getBoundingClientRect().top<vh*.75)hNative()}})}

  /* R · project steps: the names are the controls; arrow keys too; never on a timer */
  $$('.pjs').forEach(function(box){
    var tabs=$$('.pj-tabs button',box),pf=$$('.pj-pics figure',box),pt=$$('.pj-t',box),cap=$('.pj-cap',box),cur=0;
    function go(n){n=clamp(n,0,tabs.length-1);cur=n;
      var tl=tabs[n].parentNode;tl.scrollLeft=tabs[n].offsetLeft-tl.offsetLeft;
      tabs.forEach(function(t,i){t.setAttribute('aria-selected',i===n);t.tabIndex=i===n?0:-1});
      pf.forEach(function(f,i){f.classList.toggle('on',i===n)});
      pt.forEach(function(t,i){t.classList.toggle('on',i===n);t.hidden=false;if(i===n)t.removeAttribute('aria-hidden');else t.setAttribute('aria-hidden','true')});
      if(cap)cap.textContent=pf[n].dataset.cap||''}
    tabs.forEach(function(t,i){t.addEventListener('click',function(){go(i)});
      t.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;e.preventDefault();go(cur+d);tabs[cur].focus()})});
    go(0)});

  /* S · one row open at a time */
  var rws=$$('.rw');
  rws.forEach(function(rw){$('button',rw).addEventListener('click',function(){var open=!rw.classList.contains('open');
    rws.forEach(function(o){o.classList.toggle('open',o===rw&&open);$('button',o).setAttribute('aria-expanded',o===rw&&open)})})});

  /* site and concept toggle */
  $$('.cmpbox').forEach(function(box){var fs=$$('.cmp figure',box),bs=$$('.cmp-b button',box);
    bs.forEach(function(b,i){b.addEventListener('click',function(){fs.forEach(function(f,j){f.classList.toggle('on',j===i)});bs.forEach(function(x,j){x.setAttribute('aria-pressed',j===i)})})})});

  /* viewer */
  var dlg=$('.kview');
  if(dlg){var dimg=$('img',dlg),dcap=$('figcaption',dlg),opener=null;
    $$('.kv').forEach(function(b){b.addEventListener('click',function(){var im=$('img',b);opener=b;dimg.src=im.currentSrc||im.src;dimg.alt=im.alt;dcap.textContent=b.dataset.cap;dlg.showModal()})});
    $('.kclose',dlg).addEventListener('click',function(){dlg.close()});
    dlg.addEventListener('click',function(e){if(e.target===dlg||e.target.tagName==='FIGURE')dlg.close()});
    dlg.addEventListener('close',function(){if(opener)opener.focus()})}

  /* home hero: one photograph seen through windows; the mouse moves the photograph behind them */
  if($('.aerial'))(function(){var h=document.querySelector('.aerial'),ps=[].slice.call(h.querySelectorAll('.pane')),R=12288/6907,W,H,m,mx=0,my=0,tx=0,ty=0,t0=performance.now(),still=document.documentElement.classList.contains('still'),run=true;
function size(){var w=h.clientWidth,hh=h.clientHeight;W=Math.max(w*1.14,hh*1.14*R);H=W/R;m=[(W-w)/2,(H-hh)/2];
  ps.forEach(function(p){var i=p.firstChild;i.style.width=W+'px';i.style.height=H+'px';p.L=p.offsetLeft;p.T=p.offsetTop});draw(0,0)}
function draw(x,y){ps.forEach(function(p){var d=+p.dataset.d,sx=x*d*m[0]*.82,sy=y*d*m[1]*.82;
  p.style.transform='translate3d('+(-sx*.1)+'px,'+(-sy*.1)+'px,0)';
  p.firstChild.style.transform='translate3d('+(-m[0]-p.L+sx)+'px,'+(-m[1]-p.T+sy)+'px,0)'})}
function tick(n){if(run){var s=(n-t0)/1000,ax=Math.sin(s*.11)*.28,ay=Math.cos(s*.083)*.28;tx+=(mx-tx)*.05;ty+=(my-ty)*.05;draw(Math.max(-1,Math.min(1,tx+ax)),Math.max(-1,Math.min(1,ty+ay)))}requestAnimationFrame(tick)}
addEventListener('resize',size);addEventListener('load',size);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(size);size();requestAnimationFrame(function(){h.classList.add('live')});
if(still)return;
addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;mx=-(e.clientX/innerWidth*2-1)*.72;my=-(e.clientY/innerHeight*2-1)*.72},{passive:true});
new IntersectionObserver(function(e){run=e[0].isIntersecting}).observe(h);document.addEventListener('visibilitychange',function(){run=!document.hidden&&h.getBoundingClientRect().bottom>0});
requestAnimationFrame(tick)})();

  function frame(){var vh=innerHeight;ticks.forEach(function(t){t(vh)})}
  addEventListener('scroll',frame,{passive:true});addEventListener('resize',frame);addEventListener('load',frame);frame();
})();
