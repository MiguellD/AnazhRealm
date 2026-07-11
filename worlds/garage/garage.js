// ════════════════════════════════════════════════════════════════════
// ANATOMIE · FAHRZEUG
// Vier Schichten, exakt analog zur Körperbasis:
//   1. LEHREN      — Soll-Proportionen, die urteilen (die Metrologie)
//   2. RAHMEN      — Skelett aus benannten Hardpoints + Gliedern
//   3. GELENKE     — Hardpoints mit Freiheitsgraden (Lenkung/Sturz/Federung)
//   4. KAROSSERIE  — Haut, ABGELEITET aus dem Rahmen (Muskel-über-Gelenk)
// Kernsatz: ändere den Rahmen → Haut und Lehren folgen live.
// ════════════════════════════════════════════════════════════════════

const scene=new THREE.Scene();scene.background=new THREE.Color(0x070b10);scene.fog=new THREE.FogExp2(0x070b10,0.020);
const cam=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,0.1,200);cam.position.set(6.2,3.1,7.4);
const R=new THREE.WebGLRenderer({antialias:true});R.setSize(innerWidth,innerHeight);R.setPixelRatio(Math.min(devicePixelRatio,2));
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.04;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(R.domElement);

// ── leichte Studio-Env (wie mkEnv in der Körperbasis) ──
(function(){const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');
const g=x.createLinearGradient(0,0,0,512);g.addColorStop(0,'#8497a8');g.addColorStop(.45,'#3c4a58');g.addColorStop(1,'#080c12');
x.fillStyle=g;x.fillRect(0,0,1024,512);
x.fillStyle='rgba(255,255,255,.32)';x.fillRect(120,40,160,70);x.fillRect(620,30,150,64);
const t=new THREE.CanvasTexture(c);const p=new THREE.PMREMGenerator(R);scene.environment=p.fromEquirectangular(t).texture;t.dispose();})();

// ── Boden ──
const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),
  new THREE.MeshStandardMaterial({color:0x0a0f15,roughness:0.55,metalness:0.4,envMapIntensity:1.2}));
floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
const grid=new THREE.GridHelper(60,60,0x1c3340,0x0f1820);grid.position.y=0.001;grid.material.opacity=0.5;grid.material.transparent=true;scene.add(grid);

// ── Licht ──
scene.add(new THREE.HemisphereLight(0x7a8da0,0x0c1016,0.55));
const key=new THREE.DirectionalLight(0xffffff,2.6);key.position.set(5,9,4);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);key.shadow.bias=-0.0001;Object.assign(key.shadow.camera,{left:-6,right:6,top:5,bottom:-3,far:26});scene.add(key);
const fill=new THREE.DirectionalLight(0x4f8fa6,0.8);fill.position.set(-6,4,-4);scene.add(fill);
const rim=new THREE.DirectionalLight(0x6fd0e8,0.6);rim.position.set(-2,3,6);scene.add(rim);

/* ── DER KERN-ANSCHLUSS (W7a, Studio-Vertrag Phase 1 — docs/studio-vertrag.md §7):
   die generative Substanz (Lehren · Rahmen · Räder · Haut · Baukörper · Presets/
   Params/Kulturen) lebt in ../../vehicle-core.js (__vehicleCore, VOR diesem
   Skript geladen) — EINE Quelle für Shell UND AnazhRealm-Foundry (G2.1, kein
   Nachbau). Die Shell behält Szene/UI/Overlays/Fahrmodell und LIEST den Kern. ── */
const VC=window.__vehicleCore;
const M=VC.materials();            // dieselben geteilten Materialien (nie disposen); Lack-Wechsel mutiert M.paint
let bodyMat=M.clay; // umschaltbar Clay/Lack
const {box,cyl,dot,seg,ring,hardpoints,evalLehren,scal,taperBody,bowEnds,cgHeightOf,carPhys,A_PITCH_MAX,A_LAT_MAX,CULTURES,PRESETS}=VC;
const PARAMS=VC.PARAMS_BY_KIND.vehicle; // SYNERGIE-WELLE (Vertrag v1.2): die EINE B4-Form ist die Map — die Shell liest ihren kind-Eintrag

// ── Geometrie-Helfer (wie s/c/b in der Körperbasis) ──
function ell(r,sc,m){const me=new THREE.Mesh(new THREE.SphereGeometry(r,40,28),m||bodyMat);if(sc)me.scale.set(sc[0],sc[1],sc[2]);me.castShadow=true;me.receiveShadow=true;return me;}

// ── Text-Label als Sprite (für Maßlinien & Gelenke) ──
function label(text,hex,scale){scale=scale||0.42;
  const fs=46,pad=10;const cv=document.createElement('canvas');const cx=cv.getContext('2d');
  cx.font=`600 ${fs}px ui-monospace,Menlo,monospace`;const w=cx.measureText(text).width;
  cv.width=w+pad*2;cv.height=fs+pad*2;cx.font=`600 ${fs}px ui-monospace,Menlo,monospace`;
  cx.fillStyle='rgba(7,11,16,.78)';const rr=11;cx.beginPath();
  cx.moveTo(rr,0);cx.arcTo(cv.width,0,cv.width,cv.height,rr);cx.arcTo(cv.width,cv.height,0,cv.height,rr);
  cx.arcTo(0,cv.height,0,0,rr);cx.arcTo(0,0,cv.width,0,rr);cx.fill();
  cx.fillStyle=hex;cx.textBaseline='middle';cx.fillText(text,pad,cv.height/2+2);
  const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));
  sp.scale.set(cv.width/cv.height*scale,scale,1);sp.renderOrder=999;return sp;}

// ════════════════════════════════════════════════════════════════════
// 3 · DIE GELENKE — Hardpoints mit Freiheitsgraden
//   Vorn: Lenkung (Y) + Sturz, alle: Drehung (Z) + Federweg (Y)
// ════════════════════════════════════════════════════════════════════
const corners=[];        // {grp,wheelSpin,front,phase}
function buildJoints(H,P){const g=new THREE.Group();              // nur DOF-Hinweise (Hilfsgeometrie, ohne Rad)
  const dofM=new THREE.MeshBasicMaterial({color:0xffd27a,transparent:true,opacity:0.5});
  for(const k of['HUB_FL','HUB_FR','HUB_RL','HUB_RR']){const p=H[k];
    g.add(dot(p,M.joint,0.03));                                   // Gelenk-Marker
    const rSpin=ring(P.radR*0.5,dofM);rSpin.position.set(p[0],p[1],p[2]);g.add(rSpin);} // Drehung — EINE Ringmarkierung
  const l1=label('DOF: Lenkung + Sturz + Drehung + Federweg','#ffd27a',0.34);
  l1.position.set(H.HUB_FR[0],P.radR+0.55,H.HUB_FR[2]+0.1);g.add(l1);
  const l2=label('DOF: Drehung + Federweg','#ffd27a',0.34);
  l2.position.set(H.HUB_RR[0],P.radR+0.5,H.HUB_RR[2]+0.1);g.add(l2);
  return g;}

// ── Maßlinien (Lehren räumlich) — Farbe = Zustand der zugehörigen Lehre ──
function caliper(a,b,colHex,txt,perp){const m=new THREE.LineBasicMaterial({color:colHex});const g=new THREE.Group();
  g.add(seg(a,b,m));
  const t=perp||[0,0.05,0];                          // Endstrich-Richtung
  g.add(seg([a[0]-t[0],a[1]-t[1],a[2]-t[2]],[a[0]+t[0],a[1]+t[1],a[2]+t[2]],m));
  g.add(seg([b[0]-t[0],b[1]-t[1],b[2]-t[2]],[b[0]+t[0],b[1]+t[1],b[2]+t[2]],m));
  const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2+0.10,(a[2]+b[2])/2];
  const hex='#'+colHex.toString(16).padStart(6,'0');const lb=label(txt,hex,0.34);lb.position.set(...mid);g.add(lb);
  return g;}
const STc={pass:0x4ec98a,warn:0xe8b54a,fail:0xe0664a};
function buildCalipers(H,P,res){const g=new THREE.Group();const by=id=>res.find(r=>r.L.id===id).st;
  const cR=STc[by('rl')], cD=STc[by('dta')], cU=STc[by('ueb')], cB=STc[by('bf')];
  // Radstand (Boden)
  g.add(caliper([H.A_F[0],0.02,P.spur/2+0.45],[H.A_R[0],0.02,P.spur/2+0.45],cR,'RADSTAND '+(P.radstand*1000|0),[0,0.06,0]));
  // Dash-to-Axle (Höhe Gürtel)
  g.add(caliper([H.A_F[0],P.guertel+0.05,0],[H.COWL[0],P.guertel+0.05,0],cD,'DASH→ACHSE '+(((H.A_F[0]-H.COWL[0]))*1000|0),[0,0.05,0]));
  // Überhänge
  g.add(caliper([H.A_F[0],0.02,-(P.spur/2+0.45)],[H.NOSE[0],0.02,-(P.spur/2+0.45)],cU,'ÜH-V '+(P.ueberhangV*1000|0),[0,0.06,0]));
  g.add(caliper([H.A_R[0],0.02,-(P.spur/2+0.45)],[H.TAIL[0],0.02,-(P.spur/2+0.45)],cU,'ÜH-H '+(P.ueberhangH*1000|0),[0,0.06,0]));
  // Bodenfreiheit
  g.add(caliper([H.A_F[0]-0.35,0.0,P.spur/2+0.45],[H.A_F[0]-0.35,P.fahrhoehe,P.spur/2+0.45],cB,'FREI '+(P.fahrhoehe*1000|0),[0.06,0,0]));
  // Rad-Ø
  g.add(caliper([H.A_F[0],0,P.spur/2+0.18],[H.A_F[0],P.radR*2,P.spur/2+0.18],0x6fd0e8,'RAD-Ø '+(P.radR*2000|0),[0.06,0,0]));
  return g;}

// ── Negativraum — die Leere, die formt (subtraktive Lesart) ──
function buildNeg(H,P){const g=new THREE.Group();const hz=P.spur/2;const bw=hz+0.13;
  // Radhaus-Leere
  for(const k of['HUB_FL','HUB_FR','HUB_RL','HUB_RR']){const p=H[k];const sd=Math.sign(p[2]);
    const v=cyl(P.radR*1.15,P.radR*1.15,0.3,M.neg,24);v.rotation.x=Math.PI/2;v.position.set(p[0],P.radR,sd*bw);g.add(v);}
  // Tumblehome-Tuck (Greenhouse zieht sich ein)
  for(const s of[-1,1]){const t=box((H.HDR_F[0]-H.HDR_R[0]),(P.dach-P.guertel)*0.8,P.tumblehome+0.02,M.neg);
    t.position.set((H.HDR_F[0]+H.HDR_R[0])/2,(P.guertel+P.dach)/2+0.03,s*(bw-P.tumblehome*0.5));g.add(t);}
  // Unterschnitt / Diffusor-Leere
  const u=box(P.radstand*0.9,P.fahrhoehe*0.9,bw*1.6,M.neg);u.position.set(0,P.fahrhoehe*0.45,0);g.add(u);
  const lb=label('NEGATIVRAUM definiert mehr als Masse','#ff8aa0',0.36);lb.position.set(0,P.dach+0.35,0);g.add(lb);
  return g;}

// ════════════════════════════════════════════════════════════════════
// ZUSTAND + AUFBAU
// ════════════════════════════════════════════════════════════════════
const P=Object.assign({},VC.DEFAULT_P);   // Regler-Zustand — Grundwerte aus der EINEN Kern-Quelle
const show={frame:false,joints:false,cal:true,pkg:false,wheels:true,body:true,neg:false};
let gFrame,gJoints,gBody,gCal,gNeg,gPackage,gWheels;const doors=[];
const vehicle=new THREE.Group();scene.add(vehicle);
const gSprung=new THREE.Group();vehicle.add(gSprung);   // gefederte Masse (Aufbau) — nickt/wankt/hebt auf den Federn

function clear(g){if(!g)return;if(g.parent)g.parent.remove(g);g.traverse(o=>{if(o.geometry)o.geometry.dispose();
  if(o.isSprite&&o.material){if(o.material.map)o.material.map.dispose();o.material.dispose();}});}
function rebuild(){
  clear(gFrame);clear(gJoints);clear(gBody);clear(gCal);clear(gNeg);clear(gPackage);clear(gWheels);doors.length=0;
  const H=hardpoints(P);const res=evalLehren(P);
  const ctx={M:M,bodyMat:bodyMat,doors:doors,corners:corners};   // der Kern baut MIT den Shell-Objekten (Tür-/Rad-Animation bleibt verdrahtet)
  gPackage=VC.buildPackage(H,P,ctx);gPackage.visible=show.pkg; gSprung.add(gPackage);
  gBody=VC.buildSkin(H,P,ctx);   gBody.visible=show.body;     gSprung.add(gBody);
  gFrame=VC.buildFrame(H,P,ctx); gFrame.visible=show.frame;   gSprung.add(gFrame);
  gJoints=buildJoints(H,P);gJoints.visible=show.joints;gSprung.add(gJoints);
  gCal=buildCalipers(H,P,res);gCal.visible=show.cal;   gSprung.add(gCal);
  gNeg=buildNeg(H,P);     gNeg.visible=show.neg;        gSprung.add(gNeg);
  gWheels=VC.buildWheels(H,P,ctx);gWheels.visible=show.wheels;vehicle.add(gWheels);  // ungefedert → bleibt am Boden geerdet
  const S=scal(H,P);                                                          // Querschnitt-Verjüngung auf ALLE Aufbau-Gruppen:
  taperBody(gBody,S,P); taperBody(gPackage,S,P); taperBody(gFrame,S,P);
  bowEnds(gBody,S); bowEnds(gPackage,S);   // Plan-Konvexität Front/Heck       //   Karosserie + Bauraum + Frame folgen derselben Sektion
  gSprung.position.set(0,0,0);gSprung.rotation.set(0,0,0);
  renderTafel(res);
}

// ── Lehren-Tafel rendern ──
function pct(v,dom){return Math.max(0,Math.min(100,(v-dom[0])/(dom[1]-dom[0])*100));}
function renderTafel(res){
  const list=document.getElementById('lrlist');let html='';let ok=0;
  for(const{L,v,st}of res){if(st==='pass')ok++;
    const p=pct(v,L.dom),lo=pct(L.pass[0],L.dom),hi=pct(L.pass[1],L.dom);
    html+=`<div class="lr ${st}">
      <div class="lr-h"><span class="lr-lab">${L.lab}</span><span class="lr-val">${v.toFixed(3)}${L.unit}</span></div>
      <div class="lr-bar"><div class="lr-band" style="left:${lo}%;width:${hi-lo}%"></div><div class="lr-mark" style="left:${p}%"></div></div>
      <div class="lr-hint">${L.hint}</div></div>`;}
  list.innerHTML=html;
  document.getElementById('score').innerHTML=`<b>${ok}</b> / ${res.length} in Toleranz`;
}

// ════════════════════════════════════════════════════════════════════
// UI
// ════════════════════════════════════════════════════════════════════
// Presets
const pdiv=document.getElementById('presets');
for(const pid in PRESETS){const b=document.createElement('button');b.className='btn';b.textContent=PRESETS[pid].lab;
  if(pid==='gt')b.classList.add('on');
  b.onclick=()=>{Object.assign(P,VC.presetPatch(pid));[...pdiv.children].forEach(c=>c.classList.remove('on'));b.classList.add('on');
    syncSliders();rebuild();};pdiv.appendChild(b);}
// Kultur-Selektor (orthogonal zum Typ)
const cdiv=document.createElement('div');cdiv.style.cssText='margin-top:8px';pdiv.parentNode.insertBefore(cdiv,pdiv.nextSibling);
{const cl=document.createElement('div');cl.textContent='KULTUR';cl.style.cssText='font-size:10px;letter-spacing:1px;opacity:.55;margin:4px 0 2px';cdiv.appendChild(cl);}
for(const cid in CULTURES){const b=document.createElement('button');b.className='btn';b.textContent=CULTURES[cid].lab;
  b.onclick=()=>{Object.assign(P,CULTURES[cid].fx);[...cdiv.querySelectorAll('button')].forEach(c=>c.classList.remove('on'));b.classList.add('on');rebuild();};cdiv.appendChild(b);}
// Ebenen-Toggles
const ldiv=document.getElementById('layers');
const LY=[['frame','Rahmen','gFrame'],['joints','Gelenke','gJoints'],['cal','Lehren','gCal'],['pkg','Baukörper','gPackage'],['wheels','Räder','gWheels'],['body','Haut','gBody'],['neg','Negativ','gNeg']];
LY.forEach(([key,lab])=>{const b=document.createElement('button');b.className='btn'+(show[key]?' on':'');b.textContent=lab;
  b.onclick=()=>{show[key]=!show[key];b.classList.toggle('on');applyVis();};ldiv.appendChild(b);});
function applyVis(){if(gFrame)gFrame.visible=show.frame;if(gJoints)gJoints.visible=show.joints;
  if(gCal)gCal.visible=show.cal;if(gPackage)gPackage.visible=show.pkg;if(gWheels)gWheels.visible=show.wheels;if(gBody)gBody.visible=show.body;if(gNeg)gNeg.visible=show.neg;}
function syncLayerButtons(){LY.forEach(([key],i)=>ldiv.children[i].classList.toggle('on',!!show[key]));}
// Kinematik + Clay/Lack
let kin=false;const kinB=document.getElementById('kin');
kinB.onclick=()=>{kin=!kin;kinB.classList.toggle('on');};
const clayB=document.getElementById('clay');
clayB.onclick=()=>{bodyMat=(bodyMat===M.clay)?M.paint:M.clay;clayB.classList.toggle('on');rebuild();};
const PAINTS=[['Clay',0x8d9499,1],['Signalrot',0xc4181b,0],['Racing-Grün',0x1d4a30,0],['Silber',0xb6babf,0],['Tiefschwarz',0x111319,0],['Azurblau',0x1c5190,0],['Solargelb',0xe2b21e,0],['Kupfer-Orange',0xc8641a,0],['Perlweiss',0xe8eaee,0]];
const prow=document.getElementById('paintrow');
PAINTS.forEach(pt=>{const sw=document.createElement('button');sw.className='sw';sw.title=pt[0];
  sw.style.cssText='width:21px;height:21px;border-radius:50%;border:2px solid rgba(120,150,175,.32);background:#'+pt[1].toString(16).padStart(6,'0')+';cursor:pointer;padding:0;flex:none';
  sw.onclick=()=>{if(pt[2]){bodyMat=M.clay;}else{M.paint.color.setHex(pt[1]);bodyMat=M.paint;}
    document.querySelectorAll('#paintrow .sw').forEach(b=>b.style.boxShadow='');sw.style.boxShadow='0 0 0 2px var(--steel-bright)';clayB.classList.toggle('on',!pt[2]);rebuild();};
  prow.appendChild(sw);});
// Ergebnis: nur das fertige Fahrzeug (Haut + Räder + Zelle/Sitze), ohne Hilfsgeometrie & Notizen
const ergB=document.getElementById('ergebnis');let ergOn=false;
ergB.onclick=()=>{ergOn=!ergOn;ergB.classList.toggle('on',ergOn);
  if(ergOn)Object.assign(show,{frame:false,joints:false,cal:false,pkg:true,wheels:true,body:true,neg:false});
  else     Object.assign(show,{frame:false,joints:false,cal:true, pkg:false,wheels:true,body:true,neg:false});
  applyVis();syncLayerButtons();};
// Slider
const sdiv=document.getElementById('sliders');const sliderEls={};let lastGrp='';
const fmt=pp=>pp.step>=1?P[pp.id].toFixed(0):P[pp.id].toFixed(2);
PARAMS.forEach(pp=>{
  if(pp.grp!==lastGrp){const t=document.createElement('div');t.className='sec-t';t.textContent=pp.grp;sdiv.appendChild(t);lastGrp=pp.grp;}
  const wrap=document.createElement('div');wrap.className='sl';
  wrap.innerHTML=`<div class="sl-h"><span>${pp.lab}</span><span class="v" id="v_${pp.id}">${fmt(pp)}</span></div>`;
  const inp=document.createElement('input');inp.type='range';inp.min=pp.min;inp.max=pp.max;inp.step=pp.step;inp.value=P[pp.id];
  inp.oninput=()=>{P[pp.id]=parseFloat(inp.value);document.getElementById('v_'+pp.id).textContent=fmt(pp);
    if(!pp.dyn){[...pdiv.children].forEach(c=>c.classList.remove('on'));rebuild();}};   // Dynamik-Regler: kein Neubau, wirkt live
  wrap.appendChild(inp);
  if(pp.law){const lw=document.createElement('div');lw.className='law';lw.textContent='→ '+pp.law;wrap.appendChild(lw);}
  sdiv.appendChild(wrap);sliderEls[pp.id]=inp;});
function syncSliders(){PARAMS.forEach(pp=>{sliderEls[pp.id].value=P[pp.id];document.getElementById('v_'+pp.id).textContent=fmt(pp);});}

// ════════════════════════════════════════════════════════════════════
// FAHRMODELL — kinematisches Fahrradmodell (Sawicki/Monster, timestep-stabil):
//   Räder bewegen sich nur in ihre Blickrichtung → kein Heck-Rutschen.
//   Lastverlagerung aus ECHTER Beschleunigung treibt die PD-Federung.
//   Werkstatt = Studio + Overlay + Orbit · Fahren = Ebene + Verfolgerkamera + Tastatur.
// ════════════════════════════════════════════════════════════════════
// Forciertes Feder-Dämpfer-Modell je Freiheitsgrad:  x'' = (Moment − k·x − c·x')  →  Steady-State x = Moment/k.
// Steifigkeit k aus der Federrate, Dämpfung c aus dem Regler — beide wirken jetzt ECHT auf den Winkel, nicht nur aufs Tempo.
function Spring(){this.x=0;this.v=0;}
Spring.prototype.step=function(drive,k,c,dt){const a=drive-k*this.x-c*this.v;this.v+=a*dt;this.x+=this.v*dt;return this.x;};
const spPitch=new Spring(),spRoll=new Spring(),spHeave=new Spring();

// Boden + Raster (nur im Fahrmodus sichtbar)
const ground=new THREE.Group();ground.visible=false;scene.add(ground);scene.add(key.target);
{const gp=new THREE.Mesh(new THREE.PlaneGeometry(800,800),new THREE.MeshStandardMaterial({color:0x1c222a,roughness:1,metalness:0}));
 gp.rotation.x=-Math.PI/2;gp.position.y=-0.004;gp.receiveShadow=true;ground.add(gp);
 const grid=new THREE.GridHelper(800,400,0x33485a,0x192833);grid.material.transparent=true;grid.material.opacity=0.5;ground.add(grid);}
// ════════ FAHRSTRECKE: Pylonen-Slalom (umwerfbar) + echte Reifen-/Bremsspuren ════════
const track={cones:[],skidGeo:null,skidIdx:0,SKMAX:2600,wheel:[]};
function makeCone(sc){sc=sc||1;const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.135,0.40,16),new THREE.MeshStandardMaterial({color:0xff6a1a,roughness:0.5,metalness:0.08,emissive:0x301000,emissiveIntensity:0.45}));body.position.y=0.20;body.castShadow=true;g.add(body);
  const ring=new THREE.Mesh(new THREE.CylinderGeometry(0.103,0.122,0.06,16),new THREE.MeshStandardMaterial({color:0xedeff2,roughness:0.6}));ring.position.y=0.205;g.add(ring);
  const base=new THREE.Mesh(new THREE.BoxGeometry(0.30,0.03,0.30),new THREE.MeshStandardMaterial({color:0xc7440a,roughness:0.65}));base.position.y=0.015;base.castShadow=true;g.add(base);g.scale.setScalar(sc);return g;}
const CONE_POS=[];
for(let i=0;i<7;i++)CONE_POS.push([7+i*5.5,(i%2?1:-1)*3.0,1]);        // Slalom-Zickzack (Auto fährt +x)
CONE_POS.push([4,2.8,1]);CONE_POS.push([4,-2.8,1]);                    // Start-Tor
CONE_POS.push([16,7.5,1.9]);CONE_POS.push([28,-7.5,1.9]);             // 2 RIESEN-Pylonen seitlich (schwer, kaum schubsbar)
CONE_POS.push([11,6.2,0.5]);CONE_POS.push([12.4,6.6,0.5]);CONE_POS.push([10.6,7.0,0.5]); // Mini-Cluster (fliegen weit)
CONE_POS.push([33,7.2,0.55]);CONE_POS.push([34.5,6.8,0.55]);          // mehr Minis
CONE_POS.push([46,0,1]);CONE_POS.push([44,2.4,1]);CONE_POS.push([44,-2.4,1]);CONE_POS.push([48,1.5,1]);CONE_POS.push([48,-1.5,1]); // Ziel-Cluster
for(const cp of CONE_POS){const sc=cp[2]||1,c=makeCone(sc);c.position.set(cp[0],0,cp[1]);ground.add(c);track.cones.push({g:c,sc:sc,hx:cp[0],hz:cp[1],x:cp[0],z:cp[1],y:0,vx:0,vz:0,vy:0,ax:[1,0,0],q:new THREE.Quaternion(),live:false});}
// Start-Banner (Landmark)
{const pm=new THREE.MeshStandardMaterial({color:0x2a3038,roughness:0.6,metalness:0.35});
 for(const zz of[-3.4,3.4]){const pl=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.06,2.5,12),pm);pl.position.set(1.5,1.25,zz);pl.castShadow=true;ground.add(pl);}
 const bar=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.42,7.0),new THREE.MeshStandardMaterial({color:0x6fd0e8,roughness:0.4,metalness:0.3,emissive:0x12333d,emissiveIntensity:0.6}));bar.position.set(1.5,2.6,0);bar.castShadow=true;ground.add(bar);}
{const N=track.SKMAX,pos=new Float32Array(N*12),col=new Float32Array(N*12),idx=[];
 for(let i=0;i<N;i++){const b=i*4;idx.push(b,b+1,b+2,b,b+2,b+3);}
 const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(pos,3));ge.setAttribute('color',new THREE.BufferAttribute(col,3));ge.setIndex(idx);
 const ms=new THREE.Mesh(ge,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0.5,depthWrite:false,side:THREE.DoubleSide}));ms.renderOrder=2;ms.frustumCulled=false;ground.add(ms);track.skidGeo=ge;}
for(let i=0;i<4;i++)track.wheel.push({px:0,pz:0,had:false});
// ── REIFENRAUCH: weiche Sprite-Puffs an rutschenden Rädern ──
const smokeTex=(function(){const cv=document.createElement('canvas');cv.width=cv.height=64;const cx=cv.getContext('2d');
  const gr=cx.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,0.92)');gr.addColorStop(0.45,'rgba(228,233,240,0.42)');gr.addColorStop(1,'rgba(215,222,230,0)');
  cx.fillStyle=gr;cx.fillRect(0,0,64,64);const tx=new THREE.CanvasTexture(cv);return tx;})();
const smoke={pool:[],idx:0,N:140};
for(let i=0;i<smoke.N;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:smokeTex,transparent:true,opacity:0,depthWrite:false,color:0xe2e7ee}));sp.scale.set(0.01,0.01,1);sp.visible=false;sp.frustumCulled=false;ground.add(sp);smoke.pool.push({sp:sp,life:0,max:1,vx:0,vy:0,vz:0,s0:0.2});}
function puff(x,y,z,inten){const p=smoke.pool[smoke.idx];smoke.idx=(smoke.idx+1)%smoke.N;
  p.max=p.life=0.55+inten*0.55;p.vx=(Math.random()-0.5)*0.7;p.vz=(Math.random()-0.5)*0.7;p.vy=0.55+Math.random()*0.7;p.s0=0.18+inten*0.24;
  p.sp.position.set(x,y,z);p.sp.visible=true;p.sp.scale.set(p.s0,p.s0,1);p.sp.material.opacity=0.28+inten*0.4;}
function updateSmoke(dt){for(const p of smoke.pool){if(p.life<=0)continue;p.life-=dt;if(p.life<=0){p.sp.visible=false;continue;}
  const f=p.life/p.max;p.sp.position.x+=p.vx*dt;p.sp.position.y+=p.vy*dt;p.sp.position.z+=p.vz*dt;p.vy*=0.95;p.vx*=0.97;p.vz*=0.97;
  const sz=p.s0*(1+(1-f)*2.4);p.sp.scale.set(sz,sz,1);p.sp.material.opacity=(0.30+0.4*1)*f*0.8;}}
function emitSkid(ax,az,bx,bz,w,dark){const i=track.skidIdx;track.skidIdx=(i+1)%track.SKMAX;
  const dx=bx-ax,dz=bz-az,len=Math.hypot(dx,dz)||1e-4,nx=-dz/len*w,nz=dx/len*w,y=0.013,o=i*12;
  const P=track.skidGeo.attributes.position.array,C=track.skidGeo.attributes.color.array;
  const q=[ax+nx,y,az+nz, ax-nx,y,az-nz, bx-nx,y,bz-nz, bx+nx,y,bz+nz];
  for(let k=0;k<12;k++)P[o+k]=q[k];
  for(let k=0;k<4;k++){C[o+k*3]=dark;C[o+k*3+1]=dark;C[o+k*3+2]=dark;}
  track.skidGeo.attributes.position.needsUpdate=true;track.skidGeo.attributes.color.needsUpdate=true;}
function resetTrack(){for(const c of track.cones){c.x=c.hx;c.z=c.hz;c.y=0;c.vx=c.vz=c.vy=0;c.live=false;c.q.identity();c.g.position.set(c.hx,0,c.hz);c.g.quaternion.identity();}
  track.skidGeo.attributes.position.array.fill(0);track.skidGeo.attributes.position.needsUpdate=true;track.skidIdx=0;for(const w of track.wheel)w.had=false;for(const p of smoke.pool){p.life=0;p.sp.visible=false;}}
function updateTrack(dt){const cy=Math.cos(car.yaw),sy=Math.sin(car.yaw);
  corners.forEach((cc,wi)=>{const lx=cc.grp.position.x,lz=cc.grp.position.z, wx=car.x+lx*cy+lz*sy, wz=car.z-lx*sy+lz*cy;
    const slip=Math.abs(cc.front?(car.slipF||0):(car.slipR||0)); let inten=Math.max(0,(slip-0.11)/0.34);
    if(input.hand&&!cc.front)inten=Math.max(inten,0.85);
    if(input.brake>0&&car.speed>3.2)inten=Math.max(inten,(car.speed-3.2)/13);
    inten=Math.min(1,inten);const w=track.wheel[wi];
    if(inten>0.16&&car.speed>0.8){if(w.had)emitSkid(w.px,w.pz,wx,wz,0.085+inten*0.03,0.09-inten*0.045);w.px=wx;w.pz=wz;w.had=true;}else w.had=false;});
  for(const c of track.cones){
    {const dx=c.x-car.x,dz=c.z-car.z,d=Math.hypot(dx,dz),hitR=0.85+0.55*c.sc;
      if(d<hitR&&car.speed>1.0){const dl=d||1e-3,ux=dx/dl,uz=dz/dl,push=Math.min(9,2+car.speed*0.85)/c.sc;
        c.vx=ux*push;c.vz=uz*push;c.ax=[-uz,0,ux];if(!c.live){c.vy=(1.2+Math.random()*1.2)/Math.sqrt(c.sc);c.live=true;}}}  // auch umgeworfene Pylonen weiter schubsbar; Grösse = Radius+Trägheit
    if(c.live){c.vy-=12*dt;c.x+=c.vx*dt;c.z+=c.vz*dt;c.y+=c.vy*dt;
      const spin=Math.hypot(c.vx,c.vz)*1.5,dq=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(c.ax[0],c.ax[1],c.ax[2]),spin*dt);c.q.premultiply(dq);
      if(c.y<=0){c.y=0;if(c.vy<-0.2)c.vy*=-0.34;else c.vy=0;c.vx*=0.80;c.vz*=0.80;if(Math.hypot(c.vx,c.vz)<0.25&&Math.abs(c.vy)<0.2){c.vx=c.vz=c.vy=0;}}
      c.g.position.set(c.x,c.y,c.z);c.g.quaternion.copy(c.q);}}}


// Fahrzustand auf der Ebene — Körperframe-Geschwindigkeit (vlong/vlat) für echten Schlupf — + Eingaben
const car={x:0,z:0,yaw:0,vlong:0,vlat:0,yawRate:0,steer:0,wheelAng:0,speed:0,aLong:0};
const input={throttle:0,brake:0,steer:0,hand:0};
const FAHR=VC.FAHR;  // N6.1 — die Fahr-Konstanten leben im KERN (byte-gleich umgezogen): EINE Quelle fuer Probefahrt UND exportDrive
function updateVehicle(dt,t){
  const ph=carPhys(P),m=ph.mass,L=P.radstand,W=P.spur,b=L*0.5,c=L*0.5;   // CG mittig → b=c=radstand/2
  const Izz=m*(L*L+W*W)/12*FAHR.izzK, cgH=cgHeightOf(P), grip=P.grip;     // Gier-Trägheit aus Masse·Abmessungen
  // Lenkung: geschwindigkeitsabhängig (oben weniger), zentriert sich ohne Eingabe
  const sf=1/(1+car.speed*0.05), steerTgt=input.steer*FAHR.maxSteer*sf;
  car.steer+=(steerTgt-car.steer)*(input.steer!==0?0.18:0.30);
  // ── Schlupfwinkel je Achse (Tiefpass im Nenner → bei Schritttempo stabil) ──
  const vL=car.vlong, eps=1.4, dn=Math.abs(vL)+eps, sgn=vL>=0?1:-1;
  const slipF=Math.atan2(car.vlat+car.yawRate*b, dn) - car.steer*sgn;
  const slipR=Math.atan2(car.vlat-car.yawRate*c, dn); car.slipF=slipF;car.slipR=slipR;
  // ── Achslasten mit LÄNGS-Lastverlagerung (Beschl→hinten, Brems→vorn) — koppelt Last an Grip ──
  const Wt=m*FAHR.G, dW=car.aLong*cgH/L*m;
  const Wf=Math.max(0,Wt*(c/L)-dW), Wr=Math.max(0,Wt*(b/L)+dW);
  // ── Reifen-SEITENKRÄFTE: Schlupf×Steifigkeit, gesättigt durch Reibkreis×Achslast (Grip-Grenze entsteht hier) ──
  const cap=FAHR.maxGrip*grip;
  let FlatF=-Math.max(-cap,Math.min(cap,FAHR.CA_F*slipF))*Wf;    // Seitenkraft wirkt dem Schlupf ENTGEGEN (Rückstellung)
  let FlatR=-Math.max(-cap,Math.min(cap,FAHR.CA_R*slipR))*Wr;
  if(input.hand)FlatR*=0.32;                                    // HANDBREMSE: Heck-Seitenführung bricht weg → Übersteuern/Drift
  // ── Längskraft: Antrieb (massenabh.) − Bremse/Handbremse − Widerstände − Längsanteil der Lenk-Seitenkraft ──
  let aDrive=0;
  if(input.throttle>0)aDrive+=ph.aEngine*input.throttle;
  if(input.brake>0)aDrive-=(car.vlong>0.3?FAHR.brakeDecel:ph.aEngine*0.4);
  let Fx=aDrive*m;
  Fx-=ph.dragK*m*car.vlong*Math.abs(car.vlong);                 // Luftwiderstand (quadratisch) ∝ Stirnfläche/Masse
  if(Math.abs(car.vlong)>0.02)Fx-=FAHR.rollDecel*m*sgn;          // Rollwiderstand
  if(input.hand)Fx-=FAHR.handDecel*m*sgn;                        // Handbremse längs
  Fx-=FlatF*Math.sin(car.steer);
  const Fy=FlatF*Math.cos(car.steer)+FlatR;
  // ── Newton-Euler im Körperframe (mit Rotationskopplung vlat·ω / vlong·ω) ──
  const aLongB=Fx/m, aLatB=Fy/m; car.aLong=aLongB;
  car.vlong+=(aLongB+car.vlat*car.yawRate)*dt;
  car.vlat +=(aLatB -car.vlong*car.yawRate)*dt;
  // ── Gier aus Reifenmoment; bei Schritttempo auf kinematisch blenden (sonst instabil am Stand) ──
  const torque=b*FlatF*Math.cos(car.steer)-c*FlatR;
  car.yawRate+=(torque/Izz)*dt;
  const spd=Math.hypot(car.vlong,car.vlat), low=Math.max(0,Math.min(1,1-spd/2.4));
  car.yawRate=car.yawRate*(1-low)+(car.vlong*Math.tan(car.steer)/L)*low;
  car.vlat*=(1-low*0.6);
  if(input.throttle===0&&input.brake===0&&spd<0.08){car.vlong=0;car.vlat=0;car.yawRate*=0.5;}
  car.yaw+=car.yawRate*dt;
  if(car.vlong>ph.vmax)car.vlong=ph.vmax; if(car.vlong<-ph.vmax*0.32)car.vlong=-ph.vmax*0.32;
  // ── Weltposition aus Körpergeschwindigkeit (vorwärts=(cos,−sin), links=(−sin,−cos)) ──
  const cy=Math.cos(car.yaw),sy=Math.sin(car.yaw);
  car.x+=(car.vlong*cy-car.vlat*sy)*dt; car.z+=(-car.vlong*sy-car.vlat*cy)*dt;
  car.speed=spd;
  // ── Aufbau-Lastverlagerung: ECHTE Beschleunigung aus dem Reifenmodell → Feder-Dämpfer ──
  const aL=Math.max(-A_PITCH_MAX,Math.min(A_PITCH_MAX,aLongB)), aQ=Math.max(-A_LAT_MAX,Math.min(A_LAT_MAX,aLatB));
  const k=P.springRate, cd=P.damping;
  const FG=VC.FAHR; const mPitch=aL*(cgH/L)*FG.pitchGain, mRoll=aQ*(cgH/W)*FG.rollGain, mHeave=-Math.abs(aL)*FG.heaveA-Math.abs(car.vlong)*FG.heaveV; // physikalische Amplitude (~2–3°), nicht übertrieben
  spPitch.step(mPitch,k,cd,dt); spRoll.step(mRoll,k,cd,dt); spHeave.step(mHeave,k*FG.heaveKMul,cd*FG.heaveCMul,dt);
  const idle=(car.speed<0.05)?(Math.sin(t*42)*0.0014+Math.sin(t*26)*0.0009):0;
  gSprung.rotation.z=spPitch.x;
  gSprung.rotation.x=spRoll.x+((car.speed<0.05)?Math.sin(t*40)*0.0006:0);
  gSprung.position.y=spHeave.x+idle;
  // Auto auf der Ebene platzieren
  vehicle.position.x=car.x; vehicle.position.z=car.z; vehicle.rotation.y=car.yaw;
  // Räder: Abrollen ω=v/r + Vorderrad-Lenkung
  car.wheelAng+=car.vlong/Math.max(0.1,P.radR)*dt;
  corners.forEach(cc=>{cc.wheelSpin.rotation.z=-car.wheelAng;if(cc.front)cc.grp.rotation.y=car.steer;cc.grp.position.y=cc.baseY;});
  key.position.set(car.x+5,9,car.z+4);key.target.position.set(car.x,0,car.z);key.target.updateMatrixWorld(); // Schatten folgt
}

// Verfolgerkamera — schwingt sanft hinter das Auto, blickt voraus
// Verfolgerkamera als Kugel-Orbit ums Auto: folgt hinterher, lässt sich aber greifen (frei umsehen), schwingt beim Loslassen zurück
const _cf=new THREE.Vector3();
const camOrb={az:Math.PI,el:0.34,dist:9.6,follow:true};let dragging=false,_lpx=0,_lpy=0;
function lerpAngle(a,b,t){let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return a+d*t;}
function updateChaseCam(dt,snap){
  if(camOrb.follow){const azT=Math.atan2(Math.sin(car.yaw),-Math.cos(car.yaw));   // Soll-Azimut: hinter dem Auto
    camOrb.az=lerpAngle(camOrb.az,azT,snap?1:1-Math.pow(0.0016,dt));
    camOrb.el+=(0.34-camOrb.el)*(snap?1:1-Math.pow(0.02,dt));}
  const ce=Math.cos(camOrb.el),se=Math.sin(camOrb.el),d=camOrb.dist,lx=car.x,ly=0.78,lz=car.z;
  _cf.set(lx+Math.cos(camOrb.az)*ce*d, ly+se*d, lz+Math.sin(camOrb.az)*ce*d);
  if(snap)cam.position.copy(_cf); else cam.position.lerp(_cf,1-Math.pow(0.0016,dt));
  cam.lookAt(lx,ly,lz);
}

// Modus-Wechsel: Werkstatt ⇄ Fahren
let mode='werkstatt';const OVL='#brand,#lehren,#ctl,#leg,#hint';const hud=document.getElementById('hud');
const _savP=new THREE.Vector3(),_savT=new THREE.Vector3();
function enterDrive(){mode='fahren';
  document.querySelectorAll(OVL).forEach(el=>el.style.display='none');if(hud)hud.style.display='block';
  ground.visible=true;_savP.copy(cam.position);_savT.copy(oc.target);oc.enabled=false;
  car.x=0;car.z=0;car.yaw=0;car.vlong=0;car.vlat=0;car.yawRate=0;car.speed=0;car.steer=0;car.wheelAng=0;car.aLong=0;
  input.throttle=input.brake=input.steer=input.hand=0;
  vehicle.position.set(0,0,0);vehicle.rotation.y=0;camOrb.follow=true;dragging=false;resetTrack();updateChaseCam(0,true);}
function exitDrive(){mode='werkstatt';
  document.querySelectorAll(OVL).forEach(el=>el.style.display='');if(hud)hud.style.display='none';
  ground.visible=false;
  vehicle.position.set(0,0,0);vehicle.rotation.y=0;gSprung.position.set(0,0,0);gSprung.rotation.set(0,0,0);
  corners.forEach(c=>{if(c.front)c.grp.rotation.y=0;});car.vlong=car.vlat=car.yawRate=car.speed=0;car.steer=0;dragging=false;camOrb.follow=true;
  key.position.set(5,9,4);key.target.position.set(0,0,0);key.target.updateMatrixWorld();
  cam.position.copy(_savP);oc.target.copy(_savT);oc.enabled=true;oc.update();}

// Tastatur — Fahren liest Tasten kontinuierlich; Werkstatt-Hotkeys nur in der Werkstatt
const keys={};
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('keydown',e=>{keys[e.code]=true;
  if(mode==='fahren'&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if(e.code==='Escape'){if(mode==='fahren')exitDrive();return;}
  if(e.code==='KeyK'){kinB.click();return;}                          // Türen — in beiden Modi (auch beim Fahren)
  if(mode!=='werkstatt')return;
  const order=['frame','joints','cal','pkg','wheels','body','neg'];
  const map={Digit1:'frame',Digit2:'joints',Digit3:'cal',Digit4:'pkg',Digit5:'wheels',Digit6:'body',Digit7:'neg'};
  if(map[e.code]){show[map[e.code]]=!show[map[e.code]];applyVis();const i=order.indexOf(map[e.code]);ldiv.children[i].classList.toggle('on');}
  if(e.code==='KeyP'){const names=Object.keys(PRESETS);const cur=[...pdiv.children].findIndex(c=>c.classList.contains('on'));
    pdiv.children[(cur+1+names.length)%names.length].click();}
});
function readKeys(){
  input.throttle=(keys['KeyW']||keys['ArrowUp'])?1:0;
  input.brake=(keys['KeyS']||keys['ArrowDown'])?1:0;
  input.steer=((keys['KeyA']||keys['ArrowLeft'])?1:0)-((keys['KeyD']||keys['ArrowRight'])?1:0);
  input.hand=keys['Space']?1:0;}
const startB=document.getElementById('start');if(startB)startB.onclick=enterDrive;
// Maus/Touch greifen → frei umsehen; loslassen → sanft zurück hinter das Auto
R.domElement.style.touchAction='none';
R.domElement.addEventListener('pointerdown',e=>{if(mode!=='fahren')return;dragging=true;camOrb.follow=false;_lpx=e.clientX;_lpy=e.clientY;});
addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-_lpx,dy=e.clientY-_lpy;_lpx=e.clientX;_lpy=e.clientY;
  camOrb.az-=dx*0.006;camOrb.el=Math.max(0.06,Math.min(1.25,camOrb.el+dy*0.006));});
addEventListener('pointerup',()=>{if(dragging){dragging=false;camOrb.follow=true;}});

// ── Loop ──
const oc=new THREE.OrbitControls(cam,R.domElement);oc.enableDamping=true;oc.target.set(0,0.55,0);oc.minDistance=3.5;oc.maxDistance=16;oc.update();
const clock=new THREE.Clock();let simT=0;
function animate(){requestAnimationFrame(animate);const dt=Math.min(1/30,clock.getDelta());simT+=dt;const t=simT;
  if(mode==='fahren'){readKeys();updateVehicle(dt,t);updateTrack(dt);updateSmoke(dt);updateChaseCam(dt,false);
    if(hud){const sp=hud.querySelector('#spd');if(sp)sp.textContent=Math.round(Math.abs(car.speed)*12);}
  }else{oc.update();}
  const open=kin?0.62:0;                                            // Türen — in beiden Modi animiert
  doors.forEach(d=>{const tgt=(d.sd<0?-open:open);d.pv.rotation.y+=(tgt-d.pv.rotation.y)*0.08;});
  R.render(scene,cam);}
Object.assign(P,VC.presetPatch('gt'));rebuild();animate();
addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();R.setSize(innerWidth,innerHeight);});

/* ==================== W12-PORTAL-BRÜCKE (AnazhRealm-Heimat) ==================== */
/* Dasselbe Muster wie worlds/terrain + worlds/fluid: enter/ready-Handshake, die DSL
   spricht über die ECHTEN UI-Pfade (Button-click = eine Quelle), Esc meldet die
   Heimkehr — im Fahr-Modus gehört Esc dem Werkstatt-Exit (eigener Handler oben). */
(function () {
    if (typeof window === "undefined" || !window.parent || window.parent === window) return;
    function post(m) {
        try {
            window.parent.postMessage(m, "*");
        } catch (_e) {}
    }
    var DSL = ["cavallo", "toro", "stern", "vorsprung", "monolith", "gt", "supersport", "limousine", "kompakt-fwd", "suv", "probefahrt", "werkstatt"];
    function clickPreset(word) {
        /* Gattungs-PRESETS leben in #presets, die KULTUREN (Cavallo/Toro/…) in
           einem dynamisch eingefügten Geschwister-div — darum über ALLE
           #ctl-Buttons matchen (kein DSL-Wort kollidiert mit Ebenen-Labels). */
        var ctl = document.getElementById("ctl") || document;
        var kids = ctl.querySelectorAll("button");
        for (var i = 0; i < kids.length; i++) {
            if ((kids[i].textContent || "").toLowerCase() === word) {
                kids[i].click();
                return true;
            }
        }
        return false;
    }
    window.addEventListener("message", function (ev) {
        if (ev.source !== window.parent) return;
        var msg = ev.data;
        if (!msg || typeof msg !== "object") return;
        if (msg.type === "enter") {
            post({ type: "ready", world: "garage", label: "Anatomie · Fahrzeug", dsl: DSL });
        } else if (msg.type === "dsl" && Array.isArray(msg.program)) {
            for (var i = 0; i < msg.program.length; i++) {
                var op = msg.program[i];
                var word = String((op && op[0]) || op || "").toLowerCase();
                if (word === "probefahrt") {
                    var st = document.getElementById("start");
                    if (st) st.click();
                } else if (word === "werkstatt") {
                    if (typeof exitDrive === "function" && typeof mode !== "undefined" && mode === "fahren") exitDrive();
                } else clickPreset(word);
            }
        }
    });
    window.addEventListener("keydown", function (ev) {
        if (ev.key !== "Escape") return;
        if (typeof mode !== "undefined" && mode === "fahren") return; /* Esc = Fahr-Exit (oben) */
        post({ type: "exit", world: "garage" });
    });
    post({ type: "ready", world: "garage", label: "Anatomie · Fahrzeug", dsl: DSL });
})();
