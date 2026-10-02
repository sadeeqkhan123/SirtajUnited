(function(){
"use strict";
/* Contact details used for every generated WhatsApp and email link.
   WhatsApp: +93 711 66 66 64. Phones +93 766 22 20 20 and +93 766 28 28 85 are tel: only.
   The visible numbers and fallback hrefs in index.html must be updated too. */
const WA1="93711666664",EMAIL="info@sartajunited.com";
const LANGS={en:{tag:"en",dir:"ltr"},fa:{tag:"fa-AF",dir:"rtl"},ps:{tag:"ps-AF",dir:"rtl"}};
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const store={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}}};

/* reusable blocks: CTA band and quick-quote aside */
const tplCta=$("#tplCta"),tplQuick=$("#tplQuick");
$$("[data-cta]").forEach(el=>el.appendChild(tplCta.content.cloneNode(true)));
$$("[data-quickquote]").forEach(el=>{
  const p=el.dataset.quickquote,q=p==="food"?"pkg":p;
  el.innerHTML=tplQuick.innerHTML.replace(/__P__/g,p).replace(/__Q__/g,q);
});

/* i18n: English lives in the markup, Dari and Pashto in I18N */
const EN={};
$$("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(!(k in EN))EN[k]=el.innerHTML.trim();});
$$("[data-i18n-attr]").forEach(el=>{el.dataset.i18nAttr.split(";").forEach(p=>{const [a,k]=p.split(":");if(!(k in EN))EN[k]=el.getAttribute(a)||"";});});
let LANG="en";
const T=k=>{const d=window.I18N&&I18N[LANG];if(d&&d[k]!=null)return d[k];if(JSD[LANG]&&JSD[LANG][k]!=null)return JSD[LANG][k];if(EN[k]!=null)return EN[k];if(JSD.en[k]!=null)return JSD.en[k];return k;};
const TT=k=>{const v=T(k);if(typeof v!=="string")return v;const d=document.createElement("div");d.innerHTML=v;return d.textContent;};
const JSD=window.JSD||{en:{}};

/* WhatsApp and email links with prefilled messages in the active language */
const waURL=(text,num)=>"https://wa.me/"+(num||WA1)+"?text="+encodeURIComponent(text);
const mailURL=(s,b)=>"mailto:"+EMAIL+"?subject="+encodeURIComponent(s)+"&body="+encodeURIComponent(b);
const prodLabel=p=>TT("opt."+p);
function quickMsg(p){
  const L=[TT("msg.greet")];
  if(p&&p!=="generic"&&p!=="rfq"){L.push(TT("msg.ask"),"",TT("f.product")+": "+prodLabel(p),TT("f.qty")+": ",TT("f.province")+": ");}
  else L.push(TT("msg.req"));
  L.push("",TT("msg.thanks"));return L.join("\n");
}
function refreshLinks(){
  $$("[data-wa]").forEach(a=>{a.href=waURL(quickMsg(a.dataset.wa));});
  $$("[data-mail]").forEach(a=>{const p=a.dataset.mail;
    if(p==="rfq")a.href=mailURL(TT("mail.rfq.s")+" | "+TT("brand.name"),TT("mail.rfq.b"));
    else a.href=mailURL(TT("email.subject")+(p!=="generic"?" | "+prodLabel(p):"")+" | "+TT("brand.name"),quickMsg(p));});
}

/* provinces */
const PROV=window.PROV;
const provSel=$("#qprov");
function buildProvinces(){
  const cur=provSel.value,names=PROV[LANG]||PROV.en,idx=PROV.en.map((_,i)=>i);
  const coll=new Intl.Collator(LANGS[LANG].tag);idx.sort((a,b)=>coll.compare(names[a],names[b]));
  provSel.innerHTML="";
  const o0=document.createElement("option");o0.value="";o0.textContent=TT("prov.choose");provSel.appendChild(o0);
  idx.forEach(i=>{const o=document.createElement("option");o.value=PROV.en[i];o.textContent=names[i];provSel.appendChild(o);});
  const om=document.createElement("option");om.value="multi";om.textContent=TT("prov.multi");provSel.appendChild(om);
  provSel.value=cur;
  const chips=$("#provChips");if(chips){chips.innerHTML="";idx.forEach(i=>{const li=document.createElement("li");li.textContent=names[i];chips.appendChild(li);});}
}
const provName=v=>{if(v==="multi")return TT("prov.multi");const i=PROV.en.indexOf(v);return i<0?v:(PROV[LANG]||PROV.en)[i];};

/* quote builder */
const Q={product:$("#qproduct"),qty:$("#qqty"),unit:$("#qunit"),prov:provSel,date:$("#qdate"),org:$("#qorg"),name:$("#qname"),notes:$("#qnotes")};
const qdata=()=>({product:Q.product.value,qty:Q.qty.value.trim(),unit:Q.unit.value,prov:Q.prov.value,date:Q.date.value,org:Q.org.value.trim(),name:Q.name.value.trim(),notes:Q.notes.value.trim()});
function qmsg(d){
  const L=[TT("msg.greet"),TT("msg.ask"),""];
  L.push(TT("f.product")+": "+(d.product?prodLabel(d.product):"…"));
  L.push(TT("f.qty")+": "+(d.qty?d.qty+" "+TT("u."+d.unit):"…"));
  if(d.prov)L.push(TT("f.province")+": "+provName(d.prov));
  if(d.date)L.push(TT("f.date")+": "+d.date);
  if(d.org)L.push(TT("f.org")+": "+d.org);
  if(d.name)L.push(TT("f.name")+": "+d.name);
  if(d.notes)L.push(TT("f.notes")+": "+d.notes);
  L.push("",TT("msg.thanks"));return L.join("\n");
}
function qupdate(){const d=qdata(),m=qmsg(d);$("#qprev").textContent=m;$("#qwa").href=waURL(m);$("#qmail").href=mailURL(TT("email.subject")+(d.product?" | "+prodLabel(d.product):"")+" | "+TT("brand.name"),m);}
function qvalid(){
  const d=qdata(),bad=[];if(!d.product)bad.push(Q.product);if(!(parseFloat(d.qty)>0))bad.push(Q.qty);
  [Q.product,Q.qty].forEach(el=>el.removeAttribute("aria-invalid"));bad.forEach(el=>el.setAttribute("aria-invalid","true"));
  $("#qerr").textContent=bad.length?TT("quote.err"):"";if(bad.length)bad[0].focus();return !bad.length;
}
["#qwa","#qmail"].forEach(s=>$(s).addEventListener("click",e=>{if(!qvalid())e.preventDefault();}));
Object.values(Q).forEach(el=>el.addEventListener("input",()=>{if(el.hasAttribute("aria-invalid")){el.removeAttribute("aria-invalid");if(!$("[aria-invalid]"))$("#qerr").textContent="";}qupdate();}));
const UNIT={dap:"mt",urea:"mt",flour:"mt",rice:"mt",pulses:"mt",sugar:"mt",salt:"mt",oil:"l",pkg:"pkg",other:"mt"};
function pickProduct(p){if(!UNIT[p])return;Q.product.value=p;Q.unit.value=UNIT[p];qupdate();}
Q.product.addEventListener("change",()=>{if(UNIT[Q.product.value])Q.unit.value=UNIT[Q.product.value];qupdate();});
$("#qform").addEventListener("submit",e=>e.preventDefault());
try{Q.date.min=new Date().toISOString().slice(0,10);}catch(e){}

/* season calendar */
function buildCal(){
  const c=$("#cal");if(!c)return;const M=T("cal.m");
  const rows=[["wheat","cal.r1",[9,10,11]],["dap","cal.r2",[3,4,5,9,10,11]],["urea","cal.r3",[2,3,4,5,6,7]]];
  let h='<div class="cal-row cal-head"><span></span>'+M.map(m=>'<span class="cal-m">'+m+"</span>").join("")+"</div>";
  rows.forEach(([cls,k,on])=>{h+='<div class="cal-row '+cls+'"><span>'+TT(k)+"</span>"+M.map((m,i)=>'<span class="cal-m'+(on.includes(i+1)?" on":"")+'" title="'+m+'"></span>').join("")+"</div>";});
  c.innerHTML=h;
}

/* grain directory (Food items page) */
const GRAINS=window.GRAINS||[];
const gdGrid=$("#gdGrid"),gdSearch=$("#gdSearch"),gdFilters=$("#gdFilters"),gdCount=$("#gdCount"),gdEmpty=$("#gdEmpty");
let gdCat="all";
const fmtNum=n=>new Intl.NumberFormat(LANGS[LANG].tag).format(n);
/* strip zero-width joiners and Arabic diacritics so a search matches loosely typed names */
const gdNorm=s=>(s||"").toLowerCase().replace(/[‌ً-ٰٟ]/g,"");
function buildGrains(){
  if(!gdGrid)return;
  const q=gdNorm(gdSearch.value.trim()),sec=LANG==="en"?"fa":"en";
  let shown=0,h="";
  GRAINS.forEach(g=>{
    if(gdCat!=="all"&&g.cat!==gdCat)return;
    if(q&&!["en","fa","ps"].some(l=>gdNorm(g.name[l]).includes(q))&&!gdNorm(g.note[LANG]).includes(q))return;
    shown++;
    const msg=[TT("msg.greet"),TT("msg.ask"),"",TT("f.product")+": "+g.name[LANG],TT("f.qty")+": ",TT("f.province")+": ","",TT("msg.thanks")].join("\n");
    h+='<li class="gd-item"><div class="gd-top"><h3>'+g.name[LANG]+'</h3><span class="gd-tag">'+TT("gd."+g.cat)+'</span></div>'
      +'<span class="gd-local" lang="'+(sec==="fa"?"fa":"en")+'">'+g.name[sec]+'</span>'
      +'<p>'+g.note[LANG]+'</p>'
      +'<a class="gd-quote" href="'+waURL(msg)+'" target="_blank" rel="noopener"><svg class="i fill"><use href="#ic-wa"/></svg><span>'+TT("cm.quotewa")+'</span></a></li>';
  });
  gdGrid.innerHTML=h;
  gdEmpty.hidden=shown>0;
  gdCount.textContent=TT("gd.count").replace("{n}",fmtNum(shown)).replace("{m}",fmtNum(GRAINS.length));
}
if(gdGrid){
  gdSearch.addEventListener("input",buildGrains);
  $$("button",gdFilters).forEach(b=>b.addEventListener("click",()=>{
    gdCat=b.dataset.cat;
    $$("button",gdFilters).forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
    buildGrains();
  }));
}

/* manifesto stats: count up on first reveal */
const counts=$$("[data-count]");
function runCount(el){
  const end=parseInt(el.dataset.count,10);if(!isFinite(end))return;el.dataset.done="1";
  if(matchMedia("(prefers-reduced-motion:reduce)").matches){el.textContent=fmtNum(end);return;}
  const t0=performance.now(),dur=900;
  (function tick(t){const p=Math.min(1,(t-t0)/dur);el.textContent=fmtNum(Math.round(end*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(tick);})(t0);
}
const cio="IntersectionObserver" in window?new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){runCount(e.target);cio.unobserve(e.target);}});},{threshold:.5}):null;
counts.forEach(el=>cio?cio.observe(el):runCount(el));
function refreshCounts(){counts.forEach(el=>{if(el.dataset.done)el.textContent=fmtNum(parseInt(el.dataset.count,10));});}

/* language */
function setLang(l,save){
  if(!LANGS[l])l="en";LANG=l;
  const h=document.documentElement;h.lang=LANGS[l].tag;h.dir=LANGS[l].dir;
  $$("[data-i18n]").forEach(el=>{el.innerHTML=T(el.dataset.i18n);});
  $$("[data-i18n-attr]").forEach(el=>{el.dataset.i18nAttr.split(";").forEach(p=>{const [a,k]=p.split(":");el.setAttribute(a,TT(k));});});
  $$("[data-lang]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.lang===l)));
  buildProvinces();buildCal();buildGrains();refreshCounts();refreshLinks();qupdate();setTitle();
  if(window.Globe)Globe.setLang(TT("g.kabul"),LANGS[l].dir==="rtl");
  if(save)store.set("sutc-lang",l);
}
$$("[data-lang]").forEach(b=>b.addEventListener("click",()=>setLang(b.dataset.lang,true)));

/* router: one page per header item */
const pages=$$(".page");let curPage=null;
function parseHash(){
  let h=decodeURIComponent(location.hash.replace(/^#/,""));const qi=h.indexOf("?");
  let p=qi<0?h:h.slice(0,qi);const q=new URLSearchParams(qi<0?"":h.slice(qi+1));
  if(!p.startsWith("/"))p="/"+p;if(p.length>1)p=p.replace(/\/$/,"");
  const legacy={"/top":"/","/dap":"/products/dap","/urea":"/products/urea","/food":"/products/food"};
  return{path:legacy[p]||p,q};
}
function setTitle(){if(curPage)document.title=TT(curPage.dataset.title)+" | "+TT("brand.name");}
function route(){
  const {path,q}=parseHash();
  const pg=pages.find(p=>p.dataset.page===path)||pages[0];
  const changed=pg!==curPage;
  pages.forEach(p=>p.classList.toggle("active",p===pg));curPage=pg;
  const ap=pg.dataset.page;
  $$("[data-route-link]").forEach(a=>{a.dataset.routeLink===ap?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current");});
  $("#ddProducts").classList.toggle("cur",ap.startsWith("/products"));
  closeMenus();setTitle();
  if(changed){scrollTo({top:0,behavior:"instant"});armReveal(pg);}
  if(ap==="/quote"&&q.get("p"))pickProduct(q.get("p"));
  if(window.Globe)Globe.setActive(ap==="/");
  requestAnimationFrame(onScroll);
}
addEventListener("hashchange",route);

/* reveal + card spotlight */
const io="IntersectionObserver" in window?new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){const el=e.target;el.classList.add("in");io.unobserve(el);setTimeout(()=>el.classList.add("done"),1300);}});},{threshold:.12,rootMargin:"0px 0px -6% 0px"}):null;
function armReveal(pg){$$(".rv",pg).forEach(el=>{el.classList.remove("in","done");io?io.observe(el):el.classList.add("in");});}
document.addEventListener("pointermove",e=>{const c=e.target.closest&&e.target.closest(".card");if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty("--mx",(e.clientX-r.left)+"px");c.style.setProperty("--my",(e.clientY-r.top)+"px");},{passive:true});

/* header, dropdown, drawer */
const hdr=$("#hdr"),dd=$("#ddProducts"),ddBtn=$("button",dd),drawer=$("#drawer"),menuBtn=$("#menuBtn");
function setDD(open){dd.classList.toggle("open",open);ddBtn.setAttribute("aria-expanded",String(open));}
ddBtn.addEventListener("click",e=>{e.stopPropagation();setDD(!dd.classList.contains("open"));});
if(matchMedia("(hover:hover)").matches){let tmr;dd.addEventListener("mouseenter",()=>{clearTimeout(tmr);setDD(true);});dd.addEventListener("mouseleave",()=>{tmr=setTimeout(()=>setDD(false),180);});}
function setDrawer(open){drawer.hidden=!open;menuBtn.setAttribute("aria-expanded",String(open));$("use",menuBtn).setAttribute("href",open?"#ic-close":"#ic-menu");}
menuBtn.addEventListener("click",e=>{e.stopPropagation();setDrawer(drawer.hidden);});
function closeMenus(){setDD(false);setDrawer(false);setFab(false);}
document.addEventListener("click",e=>{if(!dd.contains(e.target))setDD(false);if(!drawer.hidden&&!drawer.contains(e.target)&&!menuBtn.contains(e.target))setDrawer(false);if(!$("#fab").contains(e.target))setFab(false);});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenus();});
matchMedia("(min-width:1201px)").addEventListener("change",e=>{if(e.matches)setDrawer(false);});
const tl=$("#timeline");
function onScroll(){
  hdr.classList.toggle("scrolled",scrollY>20);
  if(tl&&tl.offsetParent){const r=tl.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight*.62-r.top)/r.height));tl.style.setProperty("--prog",(p*100).toFixed(1)+"%");}
}
addEventListener("scroll",onScroll,{passive:true});

/* theme */
const root=document.documentElement,mq=matchMedia("(prefers-color-scheme: dark)");
const saved=store.get("sutc-theme");if(saved)root.dataset.theme=saved;
$$("[data-theme-toggle]").forEach(b=>b.addEventListener("click",()=>{
  const dark=root.dataset.theme?root.dataset.theme==="dark":mq.matches;root.dataset.theme=dark?"light":"dark";store.set("sutc-theme",root.dataset.theme);
}));

/* floating WhatsApp */
const fabBtn=$("#fabBtn"),fabPop=$("#fabPop");
function setFab(open){fabPop.setAttribute("aria-hidden",String(!open));fabBtn.setAttribute("aria-expanded",String(open));}
fabBtn.addEventListener("click",e=>{e.stopPropagation();setFab(fabPop.getAttribute("aria-hidden")==="true");});

/* copy email */
const toast=$("#toast");let tt;
function showToast(m){toast.textContent=m;toast.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove("show"),2000);}
$("#copyEmail").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(EMAIL);showToast(TT("c.copied"));}catch(e){showToast(EMAIL);}});
$("#yr").textContent=new Date().getFullYear();

/* product swatches (legacy canvas renderer, kept for any remaining data-swatch canvases) */
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function drawSwatch(cv){
  const kind=cv.dataset.swatch,dpr=Math.min(window.devicePixelRatio||1,2);
  const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);
  const c=cv.getContext("2d");c.setTransform(dpr,0,0,dpr,0,0);
  const R=rng(kind==="dap"?11:kind==="urea"?23:37);
  const bg=c.createLinearGradient(0,0,w,h);
  const items=[];
  if(kind==="dap"){
    bg.addColorStop(0,"#23150B");bg.addColorStop(1,"#3A2515");c.fillStyle=bg;c.fillRect(0,0,w,h);
    const n=Math.round(w*h/150);
    for(let i=0;i<n;i++){const r=5+R()*6.5;items.push({x:R()*w,y:R()*(h+10)-5,rx:r,ry:r*(.78+R()*.22),a:R()*3.14,hue:22+R()*12,l:R()*10-5});}
    items.sort((a,b)=>a.y-b.y).forEach(g=>{
      c.save();c.translate(g.x,g.y);c.rotate(g.a);
      c.fillStyle="rgba(0,0,0,.45)";c.beginPath();c.ellipse(1.6,2.6,g.rx,g.ry,0,0,6.283);c.fill();
      const gr=c.createRadialGradient(-g.rx*.35,-g.ry*.4,g.rx*.08,0,0,g.rx*1.05);
      gr.addColorStop(0,"hsl("+g.hue+",42%,"+(64+g.l)+"%)");gr.addColorStop(.45,"hsl("+g.hue+",46%,"+(38+g.l)+"%)");gr.addColorStop(1,"hsl("+(g.hue-4)+",50%,"+(17+g.l*.5)+"%)");
      c.fillStyle=gr;c.beginPath();c.ellipse(0,0,g.rx,g.ry,0,0,6.283);c.fill();c.restore();
    });
  }else if(kind==="urea"){
    bg.addColorStop(0,"#AEB6CB");bg.addColorStop(1,"#D9DEEA");c.fillStyle=bg;c.fillRect(0,0,w,h);
    const n=Math.round(w*h/80);
    for(let i=0;i<n;i++){items.push({x:R()*w,y:R()*(h+8)-4,r:3.6+R()*3.6});}
    items.sort((a,b)=>a.y-b.y).forEach(g=>{
      c.fillStyle="rgba(40,50,90,.32)";c.beginPath();c.arc(g.x+1.2,g.y+2,g.r,0,6.283);c.fill();
      const gr=c.createRadialGradient(g.x-g.r*.38,g.y-g.r*.42,g.r*.05,g.x,g.y,g.r);
      gr.addColorStop(0,"#FFFFFF");gr.addColorStop(.5,"#EEF1F7");gr.addColorStop(1,"#97A0B9");
      c.fillStyle=gr;c.beginPath();c.arc(g.x,g.y,g.r,0,6.283);c.fill();
    });
  }else{
    bg.addColorStop(0,"#C99A4A");bg.addColorStop(1,"#E2BF7A");c.fillStyle=bg;c.fillRect(0,0,w,h);
    const n=Math.round(w*h/120);
    for(let i=0;i<n;i++){const t=R();items.push({k:t<.58?"w":t<.82?"r":"l",x:R()*w,y:R()*(h+12)-6,a:R()*3.14,s:.85+R()*.3});}
    items.sort((a,b)=>a.y-b.y).forEach(g=>{
      c.save();c.translate(g.x,g.y);c.rotate(g.a);c.scale(g.s,g.s);
      if(g.k==="w"){
        c.fillStyle="rgba(70,40,10,.35)";c.beginPath();c.ellipse(1.4,2,11,6,0,0,6.283);c.fill();
        const gr=c.createRadialGradient(-3,-2.5,1,0,0,11);gr.addColorStop(0,"#F6D38C");gr.addColorStop(.6,"#D9A246");gr.addColorStop(1,"#9C6A22");
        c.fillStyle=gr;c.beginPath();c.ellipse(0,0,11,6,0,0,6.283);c.fill();
        c.strokeStyle="rgba(110,64,18,.55)";c.lineWidth=1.1;c.beginPath();c.moveTo(-7.5,.6);c.quadraticCurveTo(0,1.6,7.5,.6);c.stroke();
      }else if(g.k==="r"){
        c.fillStyle="rgba(70,40,10,.28)";c.beginPath();c.ellipse(1,1.6,9,3.2,0,0,6.283);c.fill();
        const gr=c.createLinearGradient(0,-3,0,3);gr.addColorStop(0,"#FFFDF5");gr.addColorStop(1,"#D8D1BC");
        c.fillStyle=gr;c.beginPath();c.ellipse(0,0,9,3,0,0,6.283);c.fill();
      }else{
        c.fillStyle="rgba(70,30,10,.32)";c.beginPath();c.arc(1,1.6,4.6,0,6.283);c.fill();
        const gr=c.createRadialGradient(-1.5,-1.5,.5,0,0,4.6);gr.addColorStop(0,"#F7A060");gr.addColorStop(1,"#B4511B");
        c.fillStyle=gr;c.beginPath();c.arc(0,0,4.6,0,6.283);c.fill();
      }
      c.restore();
    });
  }
  const sh=c.createLinearGradient(0,h*.55,0,h);sh.addColorStop(0,"rgba(0,0,0,0)");sh.addColorStop(1,"rgba(0,0,0,.22)");c.fillStyle=sh;c.fillRect(0,0,w,h);
}
const swatches=$$("canvas.swatch");
if("ResizeObserver" in window){const ro=new ResizeObserver(es=>es.forEach(e=>drawSwatch(e.target)));swatches.forEach(s=>ro.observe(s));}
else addEventListener("resize",()=>swatches.forEach(drawSwatch));

/* start */
let start=null;
try{const sp=new URLSearchParams(location.search).get("lang")||parseHash().q.get("lang");if(sp)start=sp;}catch(e){}
start=start||store.get("sutc-lang");
if(!start){const nl=(navigator.languages||[navigator.language||"en"]).map(x=>(x||"").toLowerCase());start=nl.some(x=>x.startsWith("ps"))?"ps":nl.some(x=>x.startsWith("fa")||x.startsWith("prs"))?"fa":"en";}
route();
setLang(start,false);
swatches.forEach(drawSwatch);
})();
