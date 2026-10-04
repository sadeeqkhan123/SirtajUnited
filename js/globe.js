/* Hero globe: real world map (orthographic), Afghanistan highlighted, supply routes into Kabul */
window.Globe=(function(){
  const cv=document.getElementById("globe"),wrap=document.getElementById("globeWrap");
  if(!cv||!cv.getContext||!window.d3||!d3.geoOrthographic)return null;
  const ctx=cv.getContext("2d"),TAU=Math.PI*2;
  const reduce=matchMedia("(prefers-reduced-motion: reduce)");
  const proj=d3.geoOrthographic().clipAngle(90).precision(.6);
  const path=d3.geoPath(proj,ctx);
  const grat=d3.geoGraticule10(),SPHERE={type:"Sphere"};
  const ICON={plane:new Path2D("M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"),
    truck:new Path2D("M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"),
    ship:new Path2D("M3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z")};
  const VEH=[["plane",Math.PI/2],["truck",0],["ship",0]];
  const KABUL=[69.17,34.53];
  const ORIG=[[63.62,53.21],[69.24,41.3],[76.9,43.24],[61.83,37.6],[56.27,27.18],[55.06,25.01],[67.01,24.86],[49.6,27.0],[87.6,43.8],[37.8,44.7]];
  const DEST=[[62.2,34.35],[67.11,36.71],[65.71,31.61],[70.45,34.43],[67.83,34.82],[68.86,36.73],[70.58,37.12],[64.37,31.59],[68.42,33.55],[69.92,33.34]];
  function mkArc(a,b,lift,N){
    const ip=d3.geoInterpolate(a,b),d=d3.geoDistance(a,b),h=Math.min(.5,lift*d+.03),pts=[];
    for(let i=0;i<=N;i++){const t=i/N;pts.push([ip(t),h*Math.sin(Math.PI*t)]);}
    return pts;
  }
  const inArcs=ORIG.map((o,i)=>({p:mkArc(o,KABUL,.95,56),off:(i*.37)%1,spd:.06+(i%4)*.012}));
  const outArcs=DEST.map((o,i)=>({p:mkArc(KABUL,o,2.6,22),off:(i*.29)%1,spd:.14+(i%3)*.025}));
  let land=null,afg=null,label="Kabul",rtl=false;
  let W=0,H=0,R=0,cx=0,cy=0,dpr=1;
  const def={lon:64,lat:24},base={lon:def.lon,lat:def.lat};
  let phase=0,last=0,dragging=false,lastInput=-1e9,running=false,raf=0,inView=true,active=true;

  /* decode echarts world geometry (UTF-8 zigzag delta encoding) */
  function decRing(s,off,sc){const out=[];let px=off[0],py=off[1];
    for(let i=0;i+1<s.length;i+=2){let x=s.charCodeAt(i)-64,y=s.charCodeAt(i+1)-64;x=(x>>1)^(-(x&1));y=(y>>1)^(-(y&1));x+=px;y+=py;px=x;py=y;out.push([x/sc,y/sc]);}
    return out;}
  function simplify(r,step){if(r.length<5)return r;const o=[r[0]];let l=r[0];
    for(let i=1;i<r.length-1;i++){const p=r[i];if(Math.abs(p[0]-l[0])+Math.abs(p[1]-l[1])>=step){o.push(p);l=p;}}
    o.push(r[r.length-1]);return o;}
  function prep(json){
    const sc=json.UTF8Scale||1024,L=[],A=[];
    (json.features||[]).forEach(f=>{
      const g=f.geometry;if(!g||!g.coordinates)return;
      const isA=f.properties&&f.properties.name==="Afghanistan";
      const polys=g.type==="Polygon"?[[g.coordinates,g.encodeOffsets]]:g.coordinates.map((c,i)=>[c,g.encodeOffsets&&g.encodeOffsets[i]]);
      polys.forEach(([rings,offs])=>{
        if(!rings||!rings.length)return;
        let ring=rings[0];
        if(typeof ring==="string"){if(!offs||!offs[0])return;ring=decRing(ring,offs[0],sc);}
        ring=simplify(ring,isA?.06:.32);
        if(ring.length<4)return;
        const a=ring[0],b=ring[ring.length-1];if(a[0]!==b[0]||a[1]!==b[1])ring.push([a[0],a[1]]);
        if(d3.geoArea({type:"Polygon",coordinates:[ring]})>TAU)ring.reverse();
        L.push([ring]);if(isA)A.push([ring]);
      });
    });
    land={type:"MultiPolygon",coordinates:L};
    afg=A.length?{type:"MultiPolygon",coordinates:A}:null;
    if(!running)draw(performance.now());
  }
  function tryWorld(){if(window.__WORLD__&&!land){try{prep(window.__WORLD__);}catch(e){console.warn("world map",e);}}}
  addEventListener("sutc-world",tryWorld);tryWorld();

  function size(){
    const r=cv.getBoundingClientRect();if(!r.width)return false;
    dpr=Math.min(devicePixelRatio||1,2);W=r.width;H=r.height;
    cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    R=Math.min(W,H)*.4;cx=W/2;cy=H/2;proj.scale(R).translate([cx,cy]);return true;
  }
  const rotFn=()=>d3.geoRotation(proj.rotate());
  function scr(ll,e,rf){
    const p=proj(ll),q=rf(ll),lam=q[0]*Math.PI/180,phi=q[1]*Math.PI/180,z=Math.cos(phi)*Math.cos(lam);
    const X=cx+(p[0]-cx)*(1+e),Y=cy+(p[1]-cy)*(1+e);
    return [X,Y,z>0||Math.hypot(X-cx,Y-cy)>R*1.002];
  }
  function strokeArc(a,rf,style,w){
    ctx.beginPath();let pen=false;
    for(const [ll,e] of a.p){const s=scr(ll,e,rf);if(s[2]){pen?ctx.lineTo(s[0],s[1]):ctx.moveTo(s[0],s[1]);pen=true;}else pen=false;}
    ctx.strokeStyle=style;ctx.lineWidth=w;ctx.stroke();
  }
  function packet(a,t,rf,col,rad){
    const u=(t*a.spd+a.off)%1,n=a.p.length-1,f=u*n,i=Math.floor(f),k=f-i,p0=a.p[i],p1=a.p[Math.min(n,i+1)];
    const ll=d3.geoInterpolate(p0[0],p1[0])(k),e=p0[1]+(p1[1]-p0[1])*k,s=scr(ll,e,rf);if(!s[2])return;
    const fade=Math.sin(Math.PI*u),g=ctx.createRadialGradient(s[0],s[1],0,s[0],s[1],rad*4);
    g.addColorStop(0,"rgba("+col+","+(.9*fade).toFixed(2)+")");g.addColorStop(1,"rgba("+col+",0)");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(s[0],s[1],rad*4,0,TAU);ctx.fill();
    ctx.fillStyle="rgba(255,255,255,"+fade.toFixed(2)+")";ctx.beginPath();ctx.arc(s[0],s[1],rad*.8,0,TAU);ctx.fill();
  }
  function orbit(t,front){
    const rx=Math.min(R*1.3,W/2-20),ry=R*.3,ra=rtl?.32:-.32,cr=Math.cos(ra),sr=Math.sin(ra),a0=front?0:Math.PI;
    ctx.beginPath();
    for(let i=0;i<=64;i++){const th=a0+Math.PI*i/64,ex=rx*Math.cos(th),ey=ry*Math.sin(th),X=cx+ex*cr-ey*sr,Y=cy+ex*sr+ey*cr;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}
    ctx.strokeStyle=front?"rgba(25,25,23,.5)":"rgba(25,25,23,.15)";ctx.lineWidth=front?1.6:1.1;ctx.stroke();
    const sc=Math.max(.85,R/240);
    VEH.forEach((v,i)=>{
      const th=((t*.12+i*TAU/3)%TAU+TAU)%TAU,isF=Math.sin(th)>0;if(isF!==front)return;
      const ex=rx*Math.cos(th),ey=ry*Math.sin(th),X=cx+ex*cr-ey*sr,Y=cy+ex*sr+ey*cr;
      const dx=-rx*Math.sin(th),dy=ry*Math.cos(th);let ang=Math.atan2(dx*sr+dy*cr,dx*cr-dy*sr),fl=1;
      if(Math.cos(ang)<0){ang+=Math.PI;fl=-1;}
      ctx.save();ctx.translate(X,Y);ctx.rotate(ang);ctx.scale(fl*sc*(front?1:.8),sc*(front?1:.8));
      ctx.beginPath();ctx.arc(0,0,16,0,TAU);ctx.fillStyle=front?"rgba(255,255,255,.97)":"rgba(255,255,255,.45)";ctx.fill();
      ctx.rotate(v[1]);ctx.scale(.86,.86);ctx.translate(-12,-12);
      ctx.fillStyle=front?"#D2382B":"rgba(210,56,43,.5)";ctx.fill(ICON[v[0]]);ctx.restore();
    });
  }
  function draw(ms){
    if(!W&&!size())return;
    const t=ms/1000,dt=Math.min(.05,Math.max(0,t-last));last=t;
    if(!dragging&&!reduce.matches){
      phase+=dt;
      if(t-lastInput>3.5){base.lon+=(def.lon-base.lon)*.012;base.lat+=(def.lat-base.lat)*.012;}
    }
    const lon=base.lon+(reduce.matches?0:26*Math.sin(phase*TAU/34)),lat=base.lat+(reduce.matches?0:5*Math.sin(phase*TAU/47));
    proj.rotate([-lon,-lat]);
    const rf=rotFn();
    ctx.clearRect(0,0,W,H);
    // atmosphere
    let g=ctx.createRadialGradient(cx,cy,R*.92,cx,cy,R*1.32);
    g.addColorStop(0,"rgba(210,56,43,.16)");g.addColorStop(.35,"rgba(210,56,43,.05)");g.addColorStop(1,"rgba(210,56,43,0)");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R*1.32,0,TAU);ctx.fill();
    orbit(t,false);
    // ocean
    g=ctx.createRadialGradient(cx-R*.35,cy-R*.4,R*.05,cx,cy,R);
    g.addColorStop(0,"#FFFFFF");g.addColorStop(.6,"#F1EEE5");g.addColorStop(1,"#DDD8CA");
    ctx.beginPath();path(SPHERE);ctx.fillStyle=g;ctx.fill();
    ctx.beginPath();path(grat);ctx.strokeStyle="rgba(255,255,255,.12)";ctx.lineWidth=.8;ctx.stroke();
    // land
    if(land){
      g=ctx.createLinearGradient(cx-R,cy-R,cx+R,cy+R);g.addColorStop(0,"#CFC9BA");g.addColorStop(1,"#BBB4A2");
      ctx.beginPath();path(land);ctx.fillStyle=g;ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,.85)";ctx.lineWidth=.6;ctx.stroke();
    }
    if(afg){
      ctx.save();ctx.shadowColor="rgba(255,96,80,.9)";ctx.shadowBlur=18;
      ctx.beginPath();path(afg);ctx.fillStyle="#D2382B";ctx.fill();ctx.restore();
      ctx.beginPath();path(afg);ctx.strokeStyle="#fff";ctx.lineWidth=1.3;ctx.stroke();
    }
    // sphere shading
    g=ctx.createRadialGradient(cx-R*.38,cy-R*.42,0,cx,cy,R);
    g.addColorStop(0,"rgba(255,255,255,.5)");g.addColorStop(.55,"rgba(255,255,255,0)");g.addColorStop(1,"rgba(25,25,23,.14)");
    ctx.beginPath();path(SPHERE);ctx.fillStyle=g;ctx.fill();
    ctx.strokeStyle="rgba(25,25,23,.3)";ctx.lineWidth=1.2;ctx.stroke();
    // routes
    inArcs.forEach(a=>strokeArc(a,rf,"rgba(255,255,255,.75)",4.4));
    inArcs.forEach(a=>strokeArc(a,rf,"rgba(25,25,23,.8)",1.9));
    outArcs.forEach(a=>strokeArc(a,rf,"rgba(255,255,255,.75)",4));
    outArcs.forEach(a=>strokeArc(a,rf,"#D2382B",1.9));
    inArcs.forEach(a=>packet(a,t,rf,"25,25,23",3.1));
    outArcs.forEach(a=>packet(a,t,rf,"210,56,43",2.5));
    // destinations
    DEST.forEach(d=>{const s=scr(d,0,rf);if(!s[2])return;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(s[0],s[1],2.4,0,TAU);ctx.fill();ctx.strokeStyle="#D2382B";ctx.lineWidth=1.2;ctx.stroke();});
    // Kabul hub
    const k=scr(KABUL,0,rf);
    if(k[2]){
      const hx=k[0],hy=k[1];
      for(let i=0;i<3;i++){const ph=(t*.5+i/3)%1;ctx.strokeStyle="rgba(210,56,43,"+((1-ph)*.75).toFixed(2)+")";ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(hx,hy,5+ph*34,0,TAU);ctx.stroke();}
      ctx.fillStyle="#191917";ctx.beginPath();ctx.arc(hx,hy,6.5,0,TAU);ctx.fill();
      ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(hx,hy,3.4,0,TAU);ctx.fill();
      let side=rtl?-1:1;if(side>0&&hx+170>W)side=-1;if(side<0&&hx-170<0)side=1;
      ctx.font="800 14px "+(rtl?"Vazirmatn,'Noto Sans Arabic',Tahoma,sans-serif":"'Geist',system-ui,sans-serif");
      ctx.direction=rtl?"rtl":"ltr";
      const tw=ctx.measureText(label).width,bw=tw+46,bh=34,bx=side>0?hx+18:hx-18-bw,by=hy-bh-20;
      ctx.strokeStyle="rgba(25,25,23,.55)";ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(hx+side*5,hy-5);ctx.lineTo(side>0?bx+10:bx+bw-10,by+bh);ctx.stroke();
      ctx.fillStyle="rgba(255,255,255,.97)";ctx.beginPath();ctx.roundRect?ctx.roundRect(bx,by,bw,bh,11):ctx.rect(bx,by,bw,bh);ctx.fill();
      ctx.fillStyle="#D2382B";ctx.beginPath();ctx.arc(bx+(rtl?bw-17:17),by+bh/2,4.5,0,TAU);ctx.fill();
      ctx.fillStyle="#1B1B1E";ctx.textBaseline="middle";ctx.textAlign=rtl?"right":"left";
      ctx.fillText(label,rtl?bx+bw-30:bx+30,by+bh/2+1);
    }
    orbit(t,true);
  }
  function loop(ms){draw(ms);raf=requestAnimationFrame(loop);}
  function start(){if(running||!active||!inView||document.hidden)return;running=true;last=performance.now()/1000;raf=requestAnimationFrame(loop);}
  function stop(){running=false;cancelAnimationFrame(raf);}
  function refresh(){if(size())draw(performance.now());}
  if("ResizeObserver" in window)new ResizeObserver(refresh).observe(cv);else addEventListener("resize",refresh);
  if("IntersectionObserver" in window)new IntersectionObserver(es=>{inView=es[0].isIntersecting;inView?start():stop();}).observe(cv);
  document.addEventListener("visibilitychange",()=>{document.hidden?stop():start();});
  /* drag to rotate */
  let px=0,py=0;
  cv.addEventListener("pointerdown",e=>{dragging=true;px=e.clientX;py=e.clientY;cv.setPointerCapture(e.pointerId);cv.classList.add("drag");});
  cv.addEventListener("pointermove",e=>{if(!dragging)return;const k=90/R;base.lon-=(e.clientX-px)*k;base.lat+=(e.clientY-py)*k;base.lat=Math.max(-60,Math.min(75,base.lat));px=e.clientX;py=e.clientY;lastInput=performance.now()/1000;if(!running)draw(performance.now());});
  const end=()=>{dragging=false;lastInput=performance.now()/1000;cv.classList.remove("drag");};
  cv.addEventListener("pointerup",end);cv.addEventListener("pointercancel",end);
  return{
    setActive(on){active=on;on?(size(),start()):stop();},
    setLang(l,isRtl){label=l;rtl=isRtl;if(!running)refresh();},
    redraw:refresh
  };
})();
