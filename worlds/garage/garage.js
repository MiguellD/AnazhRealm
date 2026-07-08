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

// ── Materialien (geteilt, nie disposen) ──
const M={
  hard : new THREE.MeshBasicMaterial({color:0x6fd0e8}),
  joint: new THREE.MeshBasicMaterial({color:0xffb24a}),
  clay : new THREE.MeshStandardMaterial({color:0x8d9499,roughness:0.88,metalness:0.02,envMapIntensity:0.7}),
  paint: new THREE.MeshPhysicalMaterial({color:0x26384a,metalness:0.85,roughness:0.22,clearcoat:1.0,clearcoatRoughness:0.04,envMapIntensity:2.6}),
  glass: new THREE.MeshPhysicalMaterial({color:0x0a0f18,metalness:0,roughness:0.02,transparent:true,opacity:0.42,clearcoat:1,envMapIntensity:3.0,side:THREE.DoubleSide}),
  tire : new THREE.MeshStandardMaterial({color:0x131519,roughness:0.85,metalness:0,side:THREE.DoubleSide}),
  rimM : new THREE.MeshStandardMaterial({color:0xb4c0cc,roughness:0.3,metalness:0.85,envMapIntensity:1.6}),
  rimD : new THREE.MeshStandardMaterial({color:0x788494,roughness:0.4,metalness:0.8,envMapIntensity:1.2}),
  cal  : new THREE.MeshStandardMaterial({color:0x962e22,roughness:0.5,metalness:0.3}),
  pillar:new THREE.MeshStandardMaterial({color:0x101418,roughness:0.4,metalness:0.4}),
  steel: new THREE.MeshStandardMaterial({color:0x55677a,roughness:0.45,metalness:0.85,envMapIntensity:1.2}),
  batt : new THREE.MeshStandardMaterial({color:0x1c2c44,roughness:0.5,metalness:0.6,envMapIntensity:0.8}),
  motor: new THREE.MeshStandardMaterial({color:0x3a536a,roughness:0.35,metalness:0.9,envMapIntensity:1.4}),
  seat : new THREE.MeshStandardMaterial({color:0x241f2e,roughness:0.7,metalness:0.05,envMapIntensity:0.5}),
  trim : new THREE.MeshStandardMaterial({color:0x14161e,roughness:0.6,metalness:0.2}),
  brake: new THREE.MeshStandardMaterial({color:0x6a4636,roughness:0.4,metalness:0.6}),
  door : new THREE.MeshStandardMaterial({color:0x969da3,roughness:0.85,metalness:0.05,envMapIntensity:0.7}),
  liner: new THREE.MeshStandardMaterial({color:0x2e323a,roughness:0.9,metalness:0.05}),
  neg  : new THREE.MeshBasicMaterial({color:0xff5a7a,transparent:true,opacity:0.13,side:THREE.DoubleSide,depthWrite:false}),
  // ── Lichtsignatur (emissiv → glüht im WebGL; Basisfarbe trägt auch ungelitt) ──
  drl  : new THREE.MeshStandardMaterial({color:0xe6f0ff,emissive:0xbcd8ff,emissiveIntensity:0.9,roughness:0.3,metalness:0.1}),
  lensW: new THREE.MeshStandardMaterial({color:0xeef5ff,emissive:0xcfe6ff,emissiveIntensity:1.1,roughness:0.25,metalness:0.0}),
  lensR: new THREE.MeshStandardMaterial({color:0xd0271a,emissive:0xff2616,emissiveIntensity:0.85,roughness:0.32,metalness:0.0}),
  lensA: new THREE.MeshStandardMaterial({color:0xff9a1f,emissive:0xff7400,emissiveIntensity:0.8,roughness:0.32,metalness:0.0}),
  housing:new THREE.MeshStandardMaterial({color:0x07090d,roughness:0.42,metalness:0.4,envMapIntensity:1.3}),
  grille:new THREE.MeshStandardMaterial({color:0x0a0c11,roughness:0.55,metalness:0.45,envMapIntensity:1.1}),
};
let bodyMat=M.clay; // umschaltbar Clay/Lack

// ── Geometrie-Helfer (wie s/c/b in der Körperbasis) ──
function ell(r,sc,m){const me=new THREE.Mesh(new THREE.SphereGeometry(r,40,28),m||bodyMat);if(sc)me.scale.set(sc[0],sc[1],sc[2]);me.castShadow=true;me.receiveShadow=true;return me;}
function box(w,h,d,m){const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);me.castShadow=true;me.receiveShadow=true;return me;}
function cyl(rt,rb,h,m,seg){const me=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||28),m);me.castShadow=true;me.receiveShadow=true;return me;}
// Baukörper-Helfer: Box über Mittelpunkt+Halbmaß (wie im Audit), Zylinder mit Achse
function B(cx,cy,cz,hw,hh,hd,m,rotZ){const me=box(hw*2,hh*2,hd*2,m);me.position.set(cx,cy,cz);if(rotZ)me.rotation.z=rotZ;return me;}
// ── Parametrische Licht-SIGNATUR ─────────────────────────────────────────────
// GESETZE (gelten für JEDEN Charakter): die Signatur ist ein STRICH-Graph in der Öffnung ·
//   konstante Strichstärke w (wie der Duktus einer Schrift) · alles proud auf EINER Ebene
//   (kein Z-Fight) · bilateral über sd. Der CHARAKTER kommt allein über 'sig'.
function lightStrokes(g,sig,sd,zI,zO,yB,yT,xF,w,mat){
  const dx=0.005, m=w;                                                          // dx=proud-Tiefe, m=Rand=eine Strichstärke
  const Hr=(yy,z0,z1)=>g.add(B(xF,yy,sd*(z0+z1)/2,dx,w/2,Math.abs(z1-z0)/2,mat)); // horizontaler Strich (z-Lauf)
  const Vr=(zz,y0,y1)=>g.add(B(xF,(y0+y1)/2,sd*zz,dx,Math.abs(y1-y0)/2,w/2,mat)); // vertikaler Strich (y-Lauf)
  const Dr=(y0,z0,y1,z1)=>{const my=(y0+y1)/2,mz=sd*(z0+z1)/2,len=Math.hypot(y1-y0,z1-z0)/2,ang=Math.atan2(sd*(z1-z0),y1-y0);const me=new THREE.Mesh(new THREE.BoxGeometry(dx*2,len*2,w*0.7),mat);me.position.set(xF,my,mz);me.rotation.x=ang;g.add(me);}; // diagonaler Strich (für scharfe Signaturen)
  const zi=zI+m, zo=zO-m, yt=yT-m, yb=yB+m;
  if(sig==='hook'){ Hr(yt,zi,zo); Vr(zo,yb,yt); }                               // L: oben + aussen runter — aggressiv
  else if(sig==='c'){ Hr(yt,zi,zo); Hr(yb,zi,zo); Vr(zo,yb,yt); }               // C: oben+unten+aussen — bold
  else if(sig==='split'){ Hr(yt,zi,zo); Hr((yb+yt)/2,zi,zo); }                  // zwei parallele — tech
  else if(sig==='brow'){ Hr(yt,zi,zo); Hr(yt-w*2.2,zi+w,zo); }                  // dicke Braue + dünne Linie — athletisch
  else if(sig==='l_single'){ g.add(B(xF,(yb+yt)/2,sd*(zi+zo)/2,dx,w*0.85,Math.abs(zo-zi)/2,mat)); } // Audi: durchgehender LED-Balken
  else if(sig==='l_oval'){ Hr(yt,zi,zo); Vr(zi,yb,yt); }                        // Ferrari: L — oben + innen runter, elegant
  else if(sig==='l_hex'){ const zc=(zi+zo)/2; Dr(yt,zo,yb,zc); Dr(yb,zc,yt,zi); } // Lambo: V/Pfeil nach unten — scharf
  else if(sig==='l_wide'){ Hr(yt,zi,zo); Hr(yb,zi,zo); }                        // Mercedes: zwei horizontale, breit ruhig
  else if(sig==='l_upright'){ Vr(zi,yb,yt); Vr(zo,yb,yt); }                     // Rolls: zwei vertikale, aufrecht
  else { Hr(yt,zi,zo); }                                                        // 'blade' (default): EINE Linie oben — minimal
}
function C(cx,cy,cz,axis,r,len,m,seg){const me=cyl(r,r,len,m,seg||20);
  if(axis==='z')me.rotation.x=Math.PI/2;else if(axis==='x')me.rotation.z=Math.PI/2;me.position.set(cx,cy,cz);return me;}
function dot(p,m,r){const me=new THREE.Mesh(new THREE.SphereGeometry(r||0.022,16,12),m);me.position.set(p[0],p[1],p[2]);return me;}
function seg(a,b,m){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);return new THREE.Line(g,m);}
function polyline(pts,m){const g=new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(...p)));return new THREE.Line(g,m);}
function ring(rad,m){const me=new THREE.Mesh(new THREE.TorusGeometry(rad,0.006,8,32),m);return me;}

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
// 1 · DIE LEHREN — Soll-Proportionen, die urteilen
//   Jede Lehre: misst aus P, vergleicht mit Toleranzband, gibt Zustand.
// ════════════════════════════════════════════════════════════════════
function derive(P){
  const fAx=P.radstand/2, rAx=-P.radstand/2;
  const noseX=fAx+P.ueberhangV, tailX=rAx-P.ueberhangH;
  const roofF=P.kabineMitte+P.kabineLaenge/2; let roofR=P.kabineMitte-P.kabineLaenge/2;
  const cowlX=roofF+(P.dach-P.guertel)*(P.windshieldRake!=null?P.windshieldRake:0.5);            // Windschutz-Fuß
  const dRk=P.dach-P.guertel; const heck=P.heck||'stufe'; let backX;
  if(heck==='steil'){ backX=tailX+0.06; roofR=backX+dRk*(P.backlightRake!=null?P.backlightRake:0.20); }   // 2-BOX: Dach bis nahe Heck, steile Klappe, KEIN Kofferraum
  else if(heck==='fliess'){ backX=roofR-dRk*(P.backlightRake!=null?P.backlightRake:0.62); }               // FASTBACK
  else { backX=roofR-dRk*(P.backlightRake!=null?P.backlightRake:0.45); }                                  // STUFENHECK (Kofferraum)
  const Ltot=P.radstand+P.ueberhangV+P.ueberhangH;
  const dta=fAx-cowlX;                                  // Dash-to-Axle (Vorderachse→A-Säule)
  return {fAx,rAx,noseX,tailX,roofF,roofR,cowlX,backX,Ltot,dta};
}
const LEHREN=[
  {id:'rl', lab:'Radstand / Länge', unit:'', dom:[.50,.70], band:[.585,.645],
   fn:(P,D)=>P.radstand/D.Ltot,
   hint:'Langer Radstand bei kurzem Auto = satter Stand. Kurz = nervös, billig.'},
  {id:'dta',lab:'Dash-to-Axle', unit:'', dom:[-.04,.40], band:[.16,.30],
   fn:(P,D)=>D.dta/P.radstand,
   hint:'Vorderachse→A-Säule. Lang = Längsmotor/Heck­antrieb-Eleganz. Kurz/negativ = Fronttriebler.'},
  {id:'ueb',lab:'Überhang-Balance V/H', unit:'', dom:[.4,1.7], band:[.72,1.04],
   fn:(P)=>P.ueberhangV/P.ueberhangH,
   hint:'Vorn etwas kürzer als hinten wirkt sportlich-ausgewogen. >1 = Front­triebler-Nase.'},
  {id:'bf', lab:'Bodenfreiheit / Rad-Ø', unit:'', dom:[.10,.80], band:[.28,.46],
   fn:(P)=>P.fahrhoehe/P.radR,
   hint:'Tief = sportlich, aber unter ~0.28 schrammt es. Hoch = SUV / robust.'},
  {id:'dlo',lab:'Greenhouse-Anteil (DLO)', unit:'', dom:[.20,.60], band:[.30,.42],
   fn:(P)=>(P.dach-P.guertel)/P.dach,
   hint:'Glasband ÷ Gesamthöhe. Niedrig = Coupé-aggressiv. Hoch = Van, praktisch.'},
  {id:'cab',lab:'Kabinen-Rücklage', unit:'', dom:[-.20,.40], band:[.05,.24],
   fn:(P)=>-P.kabineMitte/(P.radstand/2),
   hint:'Kabine nach hinten = lange Haube, Premium. Nach vorn = Raumwunder / FWD.'},
  {id:'tum',lab:'Tumblehome', unit:'', dom:[.0,.35], band:[.08,.20],
   fn:(P)=>P.tumblehome/(P.spur/2),
   hint:'Dachflanken-Einzug. Etwas = muskulöse Schulter. Zuviel = wackelig, Spielzeug.'},
];
function evalLehren(P){const D=derive(P);return LEHREN.map(L=>{
  const v=L.fn(P,D);const[lo,hi]=L.band;const bw=hi-lo;
  let st='pass';if(v<lo-bw*0.18||v>hi+bw*0.18)st='fail';else if(v<lo||v>hi)st='warn';
  return{L,v,st};});}

// ════════════════════════════════════════════════════════════════════
// 2 · DER RAHMEN — Skelett aus benannten Hardpoints + Gliedern
// ════════════════════════════════════════════════════════════════════
function hardpoints(P){const D=derive(P);const hz=P.spur/2;const rk=P.fahrhoehe;
  return {
    // Achs- & Radmitten (Radmitte = Gelenk)
    A_F:[D.fAx,0,0], A_R:[D.rAx,0,0],
    HUB_FL:[D.fAx,P.radR,-hz], HUB_FR:[D.fAx,P.radR,hz],
    HUB_RL:[D.rAx,P.radR,-hz], HUB_RR:[D.rAx,P.radR,hz],
    // Längs-Enden
    NOSE:[D.noseX,rk+0.06,0], TAIL:[D.tailX,rk+0.04,0],
    // Schweller / Boden
    ROCK_F:[D.fAx+0.1,rk,hz*0.92], ROCK_R:[D.rAx-0.1,rk,hz*0.92],
    // Greenhouse-Knochen
    COWL:[D.cowlX,P.guertel,0],            // A-Säulen-Fuß
    HDR_F:[D.roofF,P.dach,0],              // Dachvorderkante
    HDR_R:[D.roofR,P.dach,0],              // Dachhinterkante
    BACK:[D.backX,P.guertel,0],            // C-Säulen-Fuß
    // Schulter / Haube / Deckel
    SHO_F:[D.fAx,P.guertel,0], SHO_R:[D.rAx,P.guertel,0],
    HOOD:[(D.fAx+D.cowlX)/2,P.guertel-0.02,0],
    DECK:[(D.rAx+D.backX)/2,P.guertel-0.01,0],
  };}
function buildFrame(H,P){const g=new THREE.Group();const hz=P.spur/2;
  const lineM=new THREE.LineBasicMaterial({color:0x4f8fa6,transparent:true,opacity:0.75});
  const ghM  =new THREE.LineBasicMaterial({color:0x7aa0c0,transparent:true,opacity:0.85});
  // Hardpoint-Kugeln
  for(const k in H){if(k.startsWith('HUB'))continue;g.add(dot(H[k],M.hard));}
  // Längsträger (beide Seiten) + Quertraversen — das tragende Skelett
  for(const s of[-1,1]){
    g.add(seg([H.A_F[0],P.fahrhoehe+0.04,s*hz*0.78],[H.A_R[0],P.fahrhoehe+0.04,s*hz*0.78],lineM));
    g.add(seg([H.NOSE[0],H.NOSE[1],s*hz*0.5],[H.A_F[0],P.fahrhoehe+0.04,s*hz*0.78],lineM));
    g.add(seg([H.A_R[0],P.fahrhoehe+0.04,s*hz*0.78],[H.TAIL[0],H.TAIL[1],s*hz*0.5],lineM));
  }
  for(const x of[H.A_F[0],H.A_R[0],0]) g.add(seg([x,P.fahrhoehe+0.04,-hz*0.78],[x,P.fahrhoehe+0.04,hz*0.78],lineM));
  // Greenhouse-Rahmen (A-Säule, Dach, C-Säule) — die „Schädel"-Knochen
  g.add(polyline([H.COWL,H.HDR_F,H.HDR_R,H.BACK],ghM));
  for(const s of[-1,1]){
    g.add(seg([H.COWL[0],H.COWL[1],s*hz*0.62],[H.HDR_F[0],H.HDR_F[1],s*hz*0.5],ghM));
    g.add(seg([H.HDR_R[0],H.HDR_R[1],s*hz*0.5],[H.BACK[0],H.BACK[1],s*hz*0.62],ghM));
    g.add(seg([H.HDR_F[0],H.HDR_F[1],s*hz*0.5],[H.HDR_R[0],H.HDR_R[1],s*hz*0.5],ghM));
  }
  // Schulterlinie (Hüftlinie des Autos)
  for(const s of[-1,1]) g.add(seg([H.NOSE[0],P.guertel,s*hz*0.9],[H.TAIL[0],P.guertel,s*hz*0.9],lineM));
  return g;}

// ════════════════════════════════════════════════════════════════════
// 3 · DIE GELENKE — Hardpoints mit Freiheitsgraden
//   Vorn: Lenkung (Y) + Sturz, alle: Drehung (Z) + Federweg (Y)
// ════════════════════════════════════════════════════════════════════
const corners=[];        // {grp,wheelSpin,front,phase}
function makeWheel(P,os){const g=new THREE.Group();const w=0.22, r=P.radR;
  const rimLip=r*0.66, hubR=r*0.18, Rin=r*0.20, Rout=r*0.60;
  // Reifen: offene Lauffläche + zwei Flanken-Ringe (Felge sichtbar)
  g.add(crownedTread(r,w,0.12,M.tire));
  for(const s of[-1,1]){const sw=new THREE.Mesh(new THREE.RingGeometry(rimLip,r,36),M.tire);sw.position.z=s*w/2;g.add(sw);}
  // Felgenbett + Bremsscheibe (dreht mit)
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(rimLip,rimLip,w*0.84,36,1,true),M.rimM);barrel.rotation.x=Math.PI/2;g.add(barrel);
  const rotor=new THREE.Mesh(new THREE.CylinderGeometry(Rout*0.92,Rout*0.92,w*0.18,28),M.brake);rotor.rotation.x=Math.PI/2;rotor.position.z=-os*w*0.10;g.add(rotor);
  // 5 Speichen + Nabendeckel + Radbolzen, auf der Aussenseite
  const fz=os*w*0.30;
  // KULTUR-FELGE: Stil je Marke — oval/Ferrari 5 schlank · hex/Lambo Y-Speiche · wide/Merc 10 Multi · single/Audi 5 Doppel · upright/Rolls Scheibe
  {const cg=P.cGrille, nSp=cg==='wide'?10:cg==='hex'?5:5, spW=cg==='wide'?r*0.05:r*0.13;
   if(cg==='hex'){for(let i=0;i<5;i++){const a=i/5*Math.PI*2; for(const off of[-0.20,0.20]){const sp=box(Rout-Rin,r*0.06,w*0.15,M.rimM);sp.position.set(Math.cos(a+off)*(Rin+Rout)/2,Math.sin(a+off)*(Rin+Rout)/2,fz);sp.rotation.z=a+off;g.add(sp);}}} // Y-Speiche
   else if(cg==='single'){for(let i=0;i<5;i++){const a=i/5*Math.PI*2; for(const off of[-0.10,0.10]){const sp=box(Rout-Rin,r*0.055,w*0.15,M.rimM);sp.position.set(Math.cos(a+off)*(Rin+Rout)/2,Math.sin(a+off)*(Rin+Rout)/2,fz);sp.rotation.z=a+off;g.add(sp);}}} // Doppelspeiche
   else if(cg==='upright'){const disc=new THREE.Mesh(new THREE.CylinderGeometry(Rout*0.94,Rout*0.94,w*0.10,28),M.rimM);disc.rotation.x=Math.PI/2;disc.position.z=fz;g.add(disc); for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const sl=box(Rout*0.3,r*0.02,w*0.04,M.rimD);sl.position.set(Math.cos(a)*Rout*0.6,Math.sin(a)*Rout*0.6,fz+w*0.05);sl.rotation.z=a;g.add(sl);}} // Vollscheibe
   else{for(let i=0;i<nSp;i++){const a=i/nSp*Math.PI*2;const sp=box(Rout-Rin,spW,w*0.16,M.rimM);sp.position.set(Math.cos(a)*(Rin+Rout)/2,Math.sin(a)*(Rin+Rout)/2,fz);sp.rotation.z=a;g.add(sp);}}}
  // Felgenring (verbindet die Speichen außen) + Bremsabnutzungs-Ring auf der Scheibe
  const rimRing=new THREE.Mesh(new THREE.TorusGeometry(rimLip,0.016,8,36),M.rimM);rimRing.position.z=fz;g.add(rimRing);
  const wear=new THREE.Mesh(new THREE.TorusGeometry(Rout*0.74,0.006,6,28),M.rimD);wear.position.z=-os*w*0.10;g.add(wear);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(hubR,hubR,w*0.30,18),M.rimM);cap.rotation.x=Math.PI/2;cap.position.z=os*w*0.34;g.add(cap);
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2+0.3;const lb=cyl(r*0.025,r*0.025,w*0.12,M.rimD,8);lb.rotation.x=Math.PI/2;
    lb.position.set(Math.cos(a)*r*0.10,Math.sin(a)*r*0.10,os*w*0.40);g.add(lb);}
  return g;}
function buildWheels(H,P){const g=new THREE.Group();corners.length=0;
  const defs=[['HUB_FL',true],['HUB_FR',true],['HUB_RL',false],['HUB_RR',false]];
  for(const[k,front]of defs){const p=H[k];
    const hub=new THREE.Group();hub.position.set(p[0],p[1],p[2]);
    const spin=new THREE.Group();hub.add(spin);spin.add(makeWheel(P,Math.sign(p[2])));
    const cal=box(0.05,P.radR*0.24,0.085,M.cal);cal.position.set(0,P.radR*0.50,-Math.sign(p[2])*0.07);hub.add(cal); // Bremssattel (über Rotor, innerhalb Lauffläche)
    g.add(hub);corners.push({grp:hub,wheelSpin:spin,front,phase:k.endsWith('L')?0:Math.PI*0.5,baseY:p[1]});}
  return g;}
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

// ════════════════════════════════════════════════════════════════════
// 4 · KAROSSERIE = HAUT (Aussenpaneele, scharf) + BAUKÖRPER (Organe)
//   Beides aus denselben Hardpoints. Greenhouse sitzt auf dem Gürtel
//   (kein Schweben), Räder an den Ecken, alles koaxial.
// ════════════════════════════════════════════════════════════════════
function scal(H,P){return{
  fAx:H.A_F[0],rAx:H.A_R[0],noseX:H.NOSE[0],tailX:H.TAIL[0],cowlX:H.COWL[0],backX:H.BACK[0],
  roofF:H.HDR_F[0],roofR:H.HDR_R[0],hz:P.spur/2,bw:P.spur/2+0.13,cw:P.spur/2-0.06,
  yFloor:P.fahrhoehe,yBatt:P.fahrhoehe+0.12,ySill:P.fahrhoehe+0.18,yBelt:P.guertel,yRoof:P.dach,
  Awin:Math.atan2(P.dach-P.guertel,H.HDR_F[0]-H.COWL[0]),Cwin:Math.atan2(P.dach-P.guertel,H.HDR_R[0]-H.BACK[0])};}

// leanende Glasscheibe (Tumblehome): unten cwBelt, oben cwRoof → koplanar überm Türblatt
function glassPane(xF,xB,sd,yB,yT,cwB,cwR){const len=Math.abs(xB-xF),h=yT-yB;
  const ax=Math.asin(Math.max(-1,Math.min(1,sd*(cwR-cwB)/h)));
  const m=box(len,h/Math.cos(ax),0.004,M.glass);m.position.set((xF+xB)/2,(yB+yT)/2,sd*(cwB+cwR)/2);m.rotation.x=ax;return m;}
// Trapez-Quad (Front/Heck): unten breit, oben schmal → kein Dreieck-Überstand
function quad4(p0,p1,p2,p3,mat){const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array([...p0,...p1,...p2,...p0,...p2,...p3]),3));
  geo.computeVertexNormals();return new THREE.Mesh(geo,mat);}

// ── QUERSCHNITT: aus dem flachen Kasten eine echte Karosserie-Sektion ──
//   Breitester Punkt an der Gürtellinie (Schulter). Darunter Einzug (Taille),
//   darüber Dach-Einzug der Seitenscheibe (Tumblehome). Quadratisch → volle Schulter, Verjüngung erst zu den Enden.
function crossSection(y,x,S,P){const{ySill,yBelt,yRoof,bw,noseX,tailX,fAx,rAx}=S;
  // ── VERTIKAL zy ── Schulter am Gürtel = breitester Punkt; darunter Unterschnitt (Tuck), darüber Tumblehome.
  let zy;
  if(y>=yBelt){const f=Math.min(1,(y-yBelt)/Math.max(0.02,yRoof-yBelt)); zy=1-(P.tumblehome/bw)*f*f;}
  else{const g=Math.min(1,(yBelt-y)/Math.max(0.02,yBelt-ySill));
    const sig=Math.max(0.05,(fAx-rAx)/2)*0.42, hip=Math.max(0,1-Math.exp(-Math.pow((x-fAx)/sig,2))-Math.exp(-Math.pow((x-rAx)/sig,2)));  // Taille NUR an der Tür, →0 über den Achsen: Hüfte umschliesst das Rad (sonst zieht der Einzug die Flanke ins Reifen-Profil)
    zy=1-(P.taille/bw)*Math.pow(g,0.85)*hip;}                          // g^0.85: zieht direkt unter dem Gürtel ein → Schulter liest als Kante
  // ── GRUNDRISS zx ── Coke-Bottle: schmale Nase → volle Achse → Taille an der Tür → volle Achse → schmales Heck.
  const coke=P.coke||0; let zx=1;
  if(coke>0){const xF0=fAx+P.radR+0.05, xR0=rAx-P.radR-0.05;
    if(x>xF0){const f=Math.min(1,(x-xF0)/Math.max(0.05,noseX-xF0)); zx=1-coke*f*f;}              // Nase verjüngt
    else if(x<xR0){const f=Math.min(1,(xR0-x)/Math.max(0.05,xR0-tailX)); zx=1-coke*0.7*f*f;}      // Heck verjüngt
    else{const half=Math.max(0.05,(fAx-rAx)/2);
      const waistAmp=(P.waist!=null?P.waist:coke*0.8);                                            // Taillen-Pinch an der Tür → echter Hourglass (nicht 6 %)
      const haunchAmp=(P.haunch!=null?P.haunch:0);                                                // optionale Hüfte über den Achsen (default 0 → kein Stance-Verlust)
      const sig=half*0.42, bl=Math.exp(-Math.pow((x-fAx)/sig,2))+Math.exp(-Math.pow((x-rAx)/sig,2));
      zx=1+haunchAmp*bl-waistAmp*Math.max(0,1-Math.pow(x/half,2));}}                              // Taille mittig maximal, voll an den Achsen
  return zy*zx;}
// Verjüngt eine Aufbau-Gruppe: skaliert jeden Vertex in z nach seiner Höhe (im Gruppen-Frame, egal wo das Fahrzeug steht).
// Greift Meshes UND Linien (der Frame ist aus Liniensegmenten).
function taperBody(group,S,P){if(P.taille<=0&&P.tumblehome<=0&&!(P.coke>0))return; group.updateMatrixWorld(true);
  const gInv=new THREE.Matrix4().copy(group.matrixWorld).invert();
  const v=new THREE.Vector3(),toL=new THREE.Matrix4(),mInv=new THREE.Matrix4();
  group.traverse(o=>{const geo=o.geometry; if(!geo||!geo.attributes||!geo.attributes.position)return;
    const pos=geo.attributes.position; toL.multiplyMatrices(gInv,o.matrixWorld); mInv.copy(toL).invert();
    for(let i=0;i<pos.count;i++){v.set(pos.getX(i),pos.getY(i),pos.getZ(i)).applyMatrix4(toL);
      v.z*=crossSection(v.y,v.x,S,P); v.applyMatrix4(mInv); pos.setXYZ(i,v.x,v.y,v.z);}
    pos.needsUpdate=true; if(o.isMesh)geo.computeVertexNormals();});}

// schneidet [x0,x1] an den Radhaus-Lücken aus → saubere Wand-Segmente
function clipSegs(x0,x1,gaps){let segs=[[Math.min(x0,x1),Math.max(x0,x1)]];
  for(const[g0,g1]of gaps){const ng=[];for(const[a,b]of segs){
    if(g1<=a||g0>=b){ng.push([a,b]);continue;}
    if(g0>a)ng.push([a,g0]); if(g1<b)ng.push([g1,b]);}
    segs=ng;}
  return segs.filter(([a,b])=>b-a>0.02);}

// Gewölbtes Blech: unterteilte Box, Scheitel in der Mitte hochgezogen (Parabel über die Breite z), Normalen neu → liest sich rund statt flach.
function dome(cx,cy,cz, hw,hh,hd, m, crown, rotZ, xTaper){
  const segD=Math.max(14,Math.round(hd*30)), segW=Math.max(10,Math.round(hw*16));
  const geo=new THREE.BoxGeometry(hw*2,hh*2,hd*2,segW,1,segD);
  const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const X=p.getX(i),Z=p.getZ(i);
    const fx=xTaper?(1-Math.pow(Math.min(1,Math.abs(X)/hw),3)):1;   // Scheitel läuft an den x-Enden auf 0 → trifft Scheibe/Kante sauber (kein Spalt)
    p.setY(i, p.getY(i)+crown*(1-Math.pow(Z/hd,2))*fx);}            // Mitte rauf, Ränder bleiben
  geo.computeVertexNormals();
  const me=new THREE.Mesh(geo,m); me.position.set(cx,cy,cz); if(rotZ)me.rotation.z=rotZ;
  me.castShadow=true; me.receiveShadow=true; return me;}

// gewölbtes Glas-Quad: 3x3-Gitter, Mitte entlang Flächennormale nach aussen (konvex in der Draufsicht)
// unterteilte Box: viele Stützpunkte → taperBody/crossSection rendert die Schnitt-Form GLATT (Hüfte/Taille/Tuck) statt facettiert.
function Bsub(cx,cy,cz,hw,hh,hd,m,sx,sy){const me=new THREE.Mesh(new THREE.BoxGeometry(hw*2,hh*2,hd*2,sx||1,sy||1,1),m);me.position.set(cx,cy,cz);me.castShadow=me.receiveShadow=true;return me;}
// getonnte Lauffläche: Radius wölbt zur Mitte (Tonnenprofil), Schultern runden ab — echter Reifen statt gerader Zylinder.
function crownedTread(r,w,crown,m){const g=new THREE.CylinderGeometry(r,r,w,40,8,true);const pos=g.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);const f=1+crown*(1-Math.pow(2*y/w,2));pos.setX(i,x*f);pos.setZ(i,z*f);}
  g.computeVertexNormals();const me=new THREE.Mesh(g,m);me.rotation.x=Math.PI/2;me.castShadow=true;return me;}
// ── KULTUR: Grill-Signatur-Geometrie (Marken-DNA als Form). Rahmen aus Segment-Boxen entlang Polygon → Hexagon/Oval/aufrecht/Singleframe/breit. ──
function polyFill(cx,yc,pts,mat){const v=[cx,yc,0];const idx=[];
  for(const q of pts)v.push(cx,q[0],q[1]);
  for(let i=0;i<pts.length;i++)idx.push(0,1+i,1+((i+1)%pts.length));
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(v,3));ge.setIndex(idx);ge.computeVertexNormals();return new THREE.Mesh(ge,mat);}
function ringEdges(gr,cx,yc,sides,rw,rh,rot,th,mat){const pts=[];
  for(let i=0;i<sides;i++){const a=rot+i/sides*Math.PI*2;pts.push([yc+Math.cos(a)*rh,Math.sin(a)*rw]);}
  for(let i=0;i<sides;i++){const A=pts[i],Q=pts[(i+1)%sides];const my=(A[0]+Q[0])/2,mz=(A[1]+Q[1])/2,len=Math.hypot(Q[0]-A[0],Q[1]-A[1])/2,ang=Math.atan2(Q[1]-A[1],Q[0]-A[0]);
    const m=new THREE.Mesh(new THREE.BoxGeometry(th*2,len*2+th*1.6,th*1.6),mat);m.position.set(cx,my,mz);m.rotation.x=ang;m.castShadow=true;gr.add(m);}
  return pts;}
// ── KULTUR: geformte Scheinwerfer/Rückleuchten-Blende — maskiert die Rechteck-Öffnung in eine Markenform (Ring aus Segment-Boxen an (cx,yc,zc)). ──
// ── KULTUR: geformte LEUCHTFLÄCHE (gefüllte Markenform) — die Linse selbst ist oval/winklig/breit/hoch, parametrisch wie Türen/Sitze. ──
function shapedLens(g,type,cx,yc,zc,hw,hh,mat){let sides,rw,rh,rot;
  if(type==='l_oval'){sides=22;rw=hw;rh=hh*0.82;rot=0;}
  else if(type==='l_hex'){sides=6;rw=hw;rh=hh;rot=0;}
  else if(type==='l_upright'){sides=4;rw=hw*0.62;rh=hh;rot=Math.PI/4;}
  else if(type==='l_single'||type==='l_wide'){sides=4;rw=hw;rh=hh*0.60;rot=Math.PI/4;}
  else {sides=4;rw=hw;rh=hh;rot=Math.PI/4;}
  const v=[cx,yc,zc];const idx=[];
  for(let i=0;i<sides;i++){const a=rot+i/sides*Math.PI*2;v.push(cx,yc+Math.cos(a)*rh,zc+Math.sin(a)*rw);}
  for(let i=0;i<sides;i++)idx.push(0,1+i,1+((i+1)%sides));
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(v,3));ge.setIndex(idx);ge.computeVertexNormals();
  g.add(new THREE.Mesh(ge,mat));}
function headlightShape(g,type,cx,yc,zc,hw,hh,M){let sides,rw,rh,rot;
  if(type==='l_oval'){sides=22;rw=hw;rh=hh*0.82;rot=0;}                 // Ferrari: oval
  else if(type==='l_hex'){sides=6;rw=hw;rh=hh;rot=0;}                   // Lambo: winklig (Hexagon)
  else if(type==='l_upright'){sides=4;rw=hw*0.62;rh=hh;rot=Math.PI/4;}  // Rolls: hoch/schmal
  else if(type==='l_single'||type==='l_wide'){sides=4;rw=hw;rh=hh*0.60;rot=Math.PI/4;} // Audi/Merc: breit/flach
  else {sides=4;rw=hw;rh=hh;rot=Math.PI/4;}                             // Standard: gerundet-rechteckig
  for(let i=0;i<sides;i++){const a0=rot+i/sides*Math.PI*2,a1=rot+(i+1)/sides*Math.PI*2;
    const y0=yc+Math.cos(a0)*rh,z0=zc+Math.sin(a0)*rw,y1=yc+Math.cos(a1)*rh,z1=zc+Math.sin(a1)*rw;
    const my=(y0+y1)/2,mz=(z0+z1)/2,len=Math.hypot(y1-y0,z1-z0)/2,ang=Math.atan2(z1-z0,y1-y0);
    const m=new THREE.Mesh(new THREE.BoxGeometry(0.020,len*2+0.012,0.013),M.steel);m.position.set(cx,my,mz);m.rotation.x=ang;m.castShadow=true;g.add(m);}}
function grilleShape(gr,type,cx,yc,hw,hh,M){
  if(type==='hex'){const p=ringEdges(gr,cx+0.006,yc,6,hw,hh,Math.PI/6,0.013,M.steel);gr.add(polyFill(cx-0.05,yc,p,M.grille));
    for(let i=0;i<2;i++){const yy=yc-hh*0.33+hh*0.66*i;gr.add(B(cx-0.02,yy,0,0.010,0.005,hw*0.72,M.steel));}}
  else if(type==='oval'){const p=ringEdges(gr,cx+0.006,yc,28,hw,hh*0.94,0,0.012,M.steel);gr.add(polyFill(cx-0.05,yc,p,M.grille));
    for(let i=0;i<5;i++){const f=Math.sqrt(Math.max(0.1,1-Math.pow((i-2)/2.6,2)));const yy=yc-hh*0.6+hh*1.2*i/4;gr.add(B(cx-0.02,yy,0,0.011,0.004,hw*0.78*f,M.steel));}}
  else if(type==='upright'){const rw=hw*0.62,rh=hh*1.16;gr.add(B(cx-0.05,yc,0,0.03,rh,rw,M.grille));gr.add(B(cx-0.004,yc,0,0.012,rh+0.012,rw+0.012,M.steel));
    for(let i=0;i<7;i++){const zz=-rw*0.82+rw*1.64*i/6;gr.add(B(cx-0.02,yc,zz,0.015,rh*0.94,0.005,M.steel));}}
  else if(type==='single'){const rh=hh*1.45,cyy=yc+hh*0.30;const p=ringEdges(gr,cx+0.006,cyy,6,hw,rh,Math.PI/6,0.013,M.steel);gr.add(polyFill(cx-0.05,cyy,p,M.grille));
    for(let i=0;i<8;i++){const zz=-hw*0.82+hw*1.64*i/7;gr.add(B(cx-0.02,cyy,zz,0.013,rh*0.82,0.004,M.steel));}}
  else if(type==='wide'){const rw=hw*1.1,rh=hh*0.72;gr.add(B(cx-0.05,yc,0,0.03,rh,rw,M.grille));gr.add(B(cx-0.004,yc,0,0.012,rh+0.01,rw+0.012,M.steel));
    for(let i=0;i<3;i++){const yy=yc+(i-1)*rh*0.5;gr.add(B(cx-0.018,yy,0,0.012,0.010,rw*0.9,M.steel));}gr.add(B(cx+0.03,yc,0,0.035,rh*0.3,rh*0.3,M.steel));}
  else{gr.add(B(cx-0.06,yc,0,0.03,hh,hw-0.005,M.grille));
    for(let i=0;i<4;i++){const yy=yc-hh+0.015+(2*hh-0.03)*i/3;gr.add(B(cx-0.025,yy,0,0.018,0.006,hw-0.015,M.steel));}
    gr.add(B(cx-0.004,yc,0,0.012,hh+0.008,hw+0.008,M.housing));}}
function bowedQuad(p0,p1,p2,p3,bow,mat){const N=6;
  const lp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  const e1=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],e2=[p3[0]-p0[0],p3[1]-p0[1],p3[2]-p0[2]];
  let nx=e1[1]*e2[2]-e1[2]*e2[1],ny=e1[2]*e2[0]-e1[0]*e2[2],nz=e1[0]*e2[1]-e1[1]*e2[0];
  const nl=Math.hypot(nx,ny,nz)||1; nx/=nl;ny/=nl;nz/=nl;
  const Pt=(u,v)=>{const tp=lp(p0,p1,u),bt=lp(p3,p2,u),q=lp(tp,bt,v),b=bow*(1-Math.pow(2*u-1,2))*(1-Math.pow(2*v-1,2));return [q[0]+nx*b,q[1]+ny*b,q[2]+nz*b];};
  const arr=[]; for(let i=0;i<N;i++)for(let j=0;j<N;j++){const a=Pt(i/N,j/N),b=Pt((i+1)/N,j/N),c=Pt(i/N,(j+1)/N),d=Pt((i+1)/N,(j+1)/N); arr.push(...a,...c,...b,...b,...c,...d);}
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(arr,3)); geo.computeVertexNormals(); return new THREE.Mesh(geo,mat);}
// Plan-Konvexität an Nase/Heck: Mitte wölbt in x nach aussen, Ränder bleiben → Draufsicht konvex (Geschwister von taperBody).
// BIEGUNG: krümmt EINE Komponente entlang Achse u, versetzt Achse d — überlagerbar mit Wölbung (Deformer-Stack).
//   fn(t), t∈[-1,1] über die Mesh-Ausdehnung in u. Parabel (1-t²)=weich; (1-t⁴)/Tangenten-Tuck=Tension/progressiver Rand.
function bend(mesh,u,d,fn){const pos=mesh.geometry.attributes.position;const U=u.toUpperCase(),D=d.toUpperCase();
  let lo=Infinity,hi=-Infinity;for(let i=0;i<pos.count;i++){const uu=pos['get'+U](i);if(uu<lo)lo=uu;if(uu>hi)hi=uu;}
  const c=(lo+hi)/2,h=(hi-lo)/2||1;
  for(let i=0;i<pos.count;i++){const t=(pos['get'+U](i)-c)/h; pos['set'+D](i,pos['get'+D](i)+fn(t));}
  if(mesh.geometry.computeVertexNormals)mesh.geometry.computeVertexNormals();}
function bowEnds(group,S){const noseX=S.noseX,tailX=S.tailX,bw=S.bw;
  const zoneF=Math.max(0.2,(noseX-S.cowlX)*0.55), zoneR=Math.max(0.2,(S.backX-tailX)*0.55), amp=0.070, ampV=0.052, yMidF=(S.ySill+S.yBelt)/2, yHalfF=(S.yBelt-S.ySill)/2+0.08; // ampV/yf: vertikale Stirnflächen-Wölbung
  group.updateMatrixWorld(true);
  const gInv=new THREE.Matrix4().copy(group.matrixWorld).invert();
  const v=new THREE.Vector3(),toL=new THREE.Matrix4(),mInv=new THREE.Matrix4();
  group.traverse(o=>{const geo=o.geometry; if(!geo||!geo.attributes||!geo.attributes.position)return;
    const pos=geo.attributes.position; toL.multiplyMatrices(gInv,o.matrixWorld); mInv.copy(toL).invert();
    for(let i=0;i<pos.count;i++){v.set(pos.getX(i),pos.getY(i),pos.getZ(i)).applyMatrix4(toL);
      const zf=1-Math.min(1,Math.pow(v.z/bw,2)); const yf=Math.max(0,1-Math.pow((v.y-yMidF)/yHalfF,2)); let dx=0; // yf=vertikale Wölbung (Mitte-Fascia max)
      if(v.x>noseX-zoneF){const r=Math.min(1,(v.x-(noseX-zoneF))/zoneF); dx=(amp*zf+ampV*yf)*r*r;}
      else if(v.x<tailX+zoneR){const r=Math.min(1,((tailX+zoneR)-v.x)/zoneR); dx=-(amp*zf+ampV*yf)*r*r;}
      v.x+=dx; v.applyMatrix4(mInv); pos.setXYZ(i,v.x,v.y,v.z);}
    pos.needsUpdate=true; if(o.isMesh)geo.computeVertexNormals();});}
function buildSkin(H,P){const g=new THREE.Group();const S=scal(H,P);
  const cEdge=(P.cEdge!=null?P.cEdge:0.30), cTen=(P.cTension!=null?P.cTension:0.50), cSta=(P.cStance!=null?P.cStance:0.50);  // KULTUR-Achsen
  const cMul=(1-cEdge*0.40)*(0.82+cTen*0.40);  // Kante↔Fläche × Spannung → Crown-Multiplikator (Kante=flacher, Spannung=voller)
  const{fAx,rAx,noseX,tailX,cowlX,backX,roofF,roofR,bw,ySill,yBelt,yRoof}=S;
  const t=0.025, cwK=bw-0.015, archHalf=P.radR*1.18, hz=P.spur/2, clr=hz-0.135;
  const yC=(ySill+yBelt)/2, yH=(yBelt-ySill)/2, yU=(ySill+0.10+yBelt)/2, yUh=(yBelt-(ySill+0.10))/2;
  const Aw=S.Awin, Cw=S.Cwin, gB=yBelt+0.02, gT=yRoof-0.022;
  const gaps=[[fAx-archHalf,fAx+archHalf],[rAx-archHalf,rAx+archHalf]];
  const dFx=Math.min(cowlX-0.02, fAx-archHalf-0.04), dBx=P.kabineMitte;     // Türvorderkante: nie in der Radaussparung
  const hasVent=(cowlX-0.02-dFx)>0.05;                                       // FWD/SUV: Kabine weit vorn → Eckfenster nötig
  const tueren=P.tueren||2;                                                  // 2- oder 4-Türer
  const xAt=y=>cowlX+(y-yBelt)/(yRoof-yBelt)*(roofF-cowlX);                  // A-Säulen-Linie
  const xAtC=y=>backX+(y-yBelt)/(yRoof-yBelt)*(roofR-backX);                 // C-Säulen-Linie
  const dFxAt=y=>dFx+(y-yBelt)/(yRoof-yBelt)*(roofF-cowlX);                  // Türvorderkante (parallel A-Säule)
  const dRx=(tueren>=4)?Math.max(backX, rAx+archHalf+0.04):backX;           // Hintertür-Hinterkante: nie ins Hinterrad
  const hasRearQ=(tueren>=4)&&(dRx-backX>0.05);                             // dann festes hinteres Eckfenster (Sail)
  const archShoulderY=(xx)=>{                                               // Bogen-Hüllkurve (Radkasten-Scheitel) an xx — Struktur muss DRÜBER, nie schneiden (Bogen ist Master)
    let y=yBelt;
    for(const ax of[fAx,rAx]){const d=Math.abs(xx-ax); if(d<archHalf){
      const archTopV=Math.max(yBelt+0.015, 2*P.radR+wheelClearance(P,ax,ax===fAx).gap);   // Scheitel: Freigang aus LIVE-Nickphysik (deckt Bremstauchen+Squat)
      y=Math.max(y, yBelt+(archTopV-yBelt)*(1-Math.pow(d/archHalf,2)));}}
    return y;};
  // ── F · KAROSSERIE-SCHALE: Aussenpaneele auf z=±bw, Stirn auf x=nose/tail (saubere Ecken) ──
  const fenderSegs = tueren>=4 ? [[dFx,noseX],[dRx,backX],[backX,tailX]] : [[dFx,noseX],[dBx,backX],[backX,tailX]]; // 4-Türer: Türen frei, Quarter ab dRx
  for(const sd of[-1,1]){
    for(const[a,b] of clipSegs(tailX,noseX,gaps)) g.add(Bsub((a+b)/2,ySill+0.05,sd*bw,(b-a)/2,0.05,t,bodyMat,Math.max(2,Math.round((b-a)*8)),3));         // Schweller (an Rädern ausgespart)
    for(const[x0,x1] of fenderSegs)
      for(const[a,b] of clipSegs(x0,x1,gaps)) g.add(Bsub((a+b)/2,yU,sd*bw,(b-a)/2,yUh,t,bodyMat,Math.max(3,Math.round((b-a)*9)),6));                      // Kotflügel/Quarter (Türbereiche frei)
      {const ySh=yBelt-0.14, zSh=bw+0.006; for(const[x0,x1] of fenderSegs) for(const[a,b] of clipSegs(x0,x1,gaps)) g.add(B((a+b)/2,ySh,sd*zSh,(b-a)/2,0.013,0.013,bodyMat));}  // nur Karosserie-Paneele (Türzonen frei) // CHARAKTER-SICKE: Schulterlinie bricht die flache Flanke
    for(const x of[fAx,rAx]){const isFront=(x===fAx);                                                               // Radkasten: folgt dem Rad als hochgezogener Bogen
      // Freiraum GEMESSEN aus der LIVE-Fahrphysik: Nicktauchen+Squat (vertikal) · Einlenk-Schwenk+Wanken (inboard) — keine 1-g-Schaetzung
      const WC=wheelClearance(P,x,isFront);
      const archGap=WC.gap;                                                                                          // Spalt zum Rad = Bremstauchen+Squat+Reserve (aMax, ζ-Ueberschwingen)
      const archTopV=Math.max(yBelt+0.015, 2*P.radR+archGap), humpRise=archTopV-yBelt;                              // Bogenscheitel über dem Rad
      {const iwT=yBelt+humpRise+0.04, cy=(ySill+iwT)/2, nx=Math.max(16,Math.round(archHalf*50));
       const clrIn=hz-clr;                                                                                          // Schalen-Grund-Einzug ab Radmitte (=0.135)
       const bowReq=(WC.inb-clrIn)+P.radR*WC.roll+0.015;                                                            // noetiger Zusatz-Schwenk: gelenkter inboard-Rand + Wankversatz + 15 mm
       const bowMax=Math.min(clr*0.82, Math.max(Math.min(0.13,P.radR*0.34), bowReq));                              // nie kleiner als bisher, nie ueber die Mitte
       const iw=Bsub(x,cy,sd*clr,archHalf,(iwT-ySill)/2,t,bodyMat,nx,4); const pos=iw.geometry.attributes.position;
       for(let i=0;i<pos.count;i++){const lx=pos.getX(i), tgt=yBelt+humpRise*(1-Math.pow(lx/archHalf,2))+0.022, wy=cy+pos.getY(i), f=Math.min(1,Math.max(0,(wy-ySill)/(iwT-ySill)));
         pos.setY(i,(ySill+f*(tgt-ySill))-cy);
         const bow=bowMax*(1-Math.pow(lx/archHalf,2))*(1-f); pos.setZ(i,pos.getZ(i)-sd*bow);}   // Radmitte max einwaerts (gelenkter Reifen), oben 0 (clr, am Kotfluegel)
       iw.geometry.computeVertexNormals(); g.add(iw);}
      g.add(B(x+archHalf,(ySill+yBelt+0.022)/2,sd*(clr+bw)/2,t,(yBelt+0.022-ySill)/2,(bw-clr)/2,bodyMat));                                                //   Wand vorn
      g.add(B(x-archHalf,(ySill+yBelt+0.022)/2,sd*(clr+bw)/2,t,(yBelt+0.022-ySill)/2,(bw-clr)/2,bodyMat));                                                //   Wand hinten
      const tHalf=0.115, zTin=Math.max(clr+0.005,hz-tHalf), zTo=bw+0.024;                                          //   Reifenfenster (z) — voll (Bogen ist Master, wird NICHT geschrumpft)
      const wF=x+P.radR+0.01, wB=x-P.radR-0.01;                                                                   //   Reifen-Vorder-/Hinterkante
      const par=xx=>yBelt+humpRise*(1-Math.pow((xx-x)/archHalf,2));                                               //   Bogen-Parabel
      // ── RADLAUF-KOTFLÜGEL: gebogene Streifen entlang par (statt ~30 Box-Segmenten) ──
      const NA=Math.max(34,Math.round(archHalf*72)), yTop=yBelt+humpRise, parB=tt=>par(x+tt*archHalf)-yBelt;
      for(const seg of [[x-archHalf,wB,clr,zTo],[wF,x+archHalf,clr,zTo],[wB,wF,clr,zTin],[wB,wF,Math.min(hz+tHalf,zTo-0.005),zTo]]){   // Haunch-Fläche: beside-tire voll, over-tire inboard + OUTBOARD-Streifen (neben Reifen, sonst Durchblick ins Leere)
        const xa=seg[0],xb=seg[1],za=seg[2],zb=seg[3]; if(xb-xa<0.012||zb-za<0.008) continue;
        const xc=(xa+xb)/2,xh=(xb-xa)/2,ns=Math.max(6,Math.round(xh*64));
        const pan=Bsub(xc,(yBelt+yTop)/2,sd*(za+zb)/2,xh,(yTop-yBelt)/2,(zb-za)/2,bodyMat,ns,1); bend(pan,'x','y',tt=>par(xc+tt*xh)-yTop); g.add(pan);}  // Oberkante glatt auf par gebogen
      {const ob=Bsub(x,yBelt,sd*(zTin+zTo)/2,archHalf,t,(zTo-zTin)/2,bodyMat,NA,1); bend(ob,'x','y',parB); g.add(ob);}   // Aussen-Band über dem Reifen — EIN glatter Streifen
      g.add(B(wF,(yBelt+par(wF))/2,sd*(zTin+zTo)/2,t,(par(wF)-yBelt)/2+t,(zTo-zTin)/2,bodyMat));   // Kappe vorn
      g.add(B(wB,(yBelt+par(wB))/2,sd*(zTin+zTo)/2,t,(par(wB)-yBelt)/2+t,(zTo-zTin)/2,bodyMat));   // Kappe hinten
      {const zLip=zTo+0.014; const rim=Bsub(x,yBelt,sd*zLip,archHalf,0.014,0.014,bodyMat,NA,1); bend(rim,'x','y',parB); g.add(rim);}  // BOGENRAND: EIN gebogener Streifen, full arch → glatte Radlauf-Kontur
    }
    // Überhang-Innenwände: Front-/Heck-Überhang inboard schliessen → kein Durchblick im Eck Haube↔Lampe
    {const oxc=(fAx+archHalf+noseX)/2, oxh=(noseX-(fAx+archHalf))/2, oT=yBelt+0.04, cy=(ySill+oT)/2, nx=Math.max(10,Math.round(oxh*32)), HD=Math.min(0.18,(noseX-cowlX)*0.22);   // Front-Überhang: tan + gebogen, Oberkante folgt Haube-Kotflügel-Linie zur Nase → durchgehende Kontur Bogen→Nase
     const ow=Bsub(oxc,cy,sd*clr,oxh,(oT-ySill)/2,t,bodyMat,nx,1); const pos=ow.geometry.attributes.position;
     for(let i=0;i<pos.count;i++){const wx=oxc+pos.getX(i), tgt=Math.max(yBelt-(wx-cowlX)/(noseX-cowlX)*HD, yBelt-0.015)+0.008, wy=cy+pos.getY(i), f=(wy-ySill)/(oT-ySill); pos.setY(i,(ySill+f*(tgt-ySill))-cy);}
     ow.geometry.computeVertexNormals(); g.add(ow);}
    g.add(B(((rAx-archHalf)+tailX)/2,(ySill+yBelt)/2,sd*clr,((rAx-archHalf)-tailX)/2,(yBelt-ySill)/2,t,bodyMat));
  }
  const hoodDrop=Math.min(0.18,(noseX-cowlX)*0.22), yNose=yBelt-hoodDrop;                // Haubenkante fällt zur Nase → Keil/Stance
  // ── FRONT — Rahmen-Schürze (Eck-Loch zu) + vertiefter Grill + integrierte Scheinwerfer ──
  {const gH=bw*(P.grilleW||0.33), yGB=ySill+0.05, yGT=yBelt-(P.grilleDrop!=null?P.grilleDrop:0.18);                                          // Grill-Öffnung (Mitte)
   const zLi=clr+0.02, zLo=bw-0.03, yLc=yBelt-(P.lightDrop||0.115), yLh=(P.lightH||0.055), yLb=yLc-yLh, yLt=yLc+yLh;     // Scheinwerfer-Öffnung (aussen) — grösser
   g.add(B(noseX,(ySill+yGB)/2,0,t,(yGB-ySill)/2,clr,bodyMat));                               //   Rahmen: unter Grill
   g.add(B(noseX,(yGT+yNose)/2,0,t,(yNose-yGT)/2,clr,bodyMat));                               //   Rahmen: über Grill (bis Haubenkante)
   for(const sd of[-1,1]){
     g.add(B(noseX,(yGB+yGT)/2,sd*(gH+clr)/2,t,(yGT-yGB)/2,(clr-gH)/2,bodyMat));              //   neben Grill (innen)
     g.add(B(noseX,(ySill+yLb)/2,sd*(clr+bw)/2,t,(yLb-ySill)/2,(bw-clr)/2,bodyMat));          //   unter Licht (aussen)
     g.add(B(noseX,(yLt+yBelt)/2,sd*(clr+bw)/2,t,(yBelt-yLt)/2,(bw-clr)/2,bodyMat));          //   über Licht bis Gürtel → Eck-Loch zu
     g.add(B(noseX,(yLb+yLt)/2,sd*(clr+zLi)/2,t,(yLt-yLb)/2,(zLi-clr)/2,bodyMat));            //   innen neben Licht
     g.add(B(noseX,(yLb+yLt)/2,sd*(zLo+bw)/2,t,(yLt-yLb)/2,(bw-zLo)/2,bodyMat));              //   aussen neben Licht
   }
   grilleShape(g,P.cGrille||'rect',noseX,(yGB+yGT)/2,gH,(yGT-yGB)/2,M);                       //   KULTUR-SIGNATUR: Grill-Form je Marke
   if(cEdge>0.45){const prom=0.003+cEdge*0.010;                                                  //   KULTUR cEdge: Charakterlinien NUR auf Karosserie-Paneelen (Radhäuser+Türöffnung ausgespart → kein Schweben/Überlauf)
     for(const sd of[-1,1]) for(const[x0,x1] of fenderSegs) for(const[a,b] of clipSegs(x0,x1,gaps)){
       g.add(B((a+b)/2,yBelt-0.10,sd*bw,(b-a)/2,0.009,prom,bodyMat));                             //   Schulter-Linie
       g.add(B((a+b)/2,ySill+0.11,sd*bw,(b-a)/2,0.008,prom*0.85,bodyMat));}                       //   Rocker-Akzent
     if(cEdge>0.7) for(const sd of[-1,1]){const cf=0.60,cx2=cowlX+cf*(noseX-cowlX),chw=Math.abs(noseX-cowlX)*0.26,cy2=yBelt-cf*hoodDrop+0.010,dpu=hoodDrop*chw/(noseX-cowlX); const cr=Bsub(cx2,cy2,sd*clr*0.50,chw,0.006,prom*0.8,bodyMat,8,1); bend(cr,'x','y',u=>-dpu*u); g.add(cr);}} // Power-Dome-Grat SITZT auf der Haube (Höhe=Haubenfläche bei f, fällt linear mit hoodDrop)
   g.add(B(noseX-0.03,ySill+0.045,0,0.02,0.022,bw*0.46,M.grille));                            //   unterer Lufteinlass (Splitter-Schlund)
   g.add(B(noseX+0.015+cSta*0.022,ySill+0.028,0,0.018+cSta*0.012,0.010,bw*(0.56+cSta*0.24),bodyMat));   //   FRONT-SPLITTER: KULTUR Haltung skaliert Tiefe+Breite
   if(cSta>0.62) g.add(B(noseX+0.045,ySill+0.016,0,0.016,0.006,bw*0.5,M.housing));                   //   aggressive Frontlippe (Haltung)
   const wSig=(yLt-yLb)*0.17;                                                                  //   GESETZ: Strichstärke = Anteil der Öffnungshöhe (gleicher Duktus über alle Presets)
   for(const sd of[-1,1]){const zc=(zLi+zLo)/2, zhw=(zLo-zLi)/2;
     g.add(B(noseX-0.055,yLc,sd*zc,0.038,yLh,zhw,M.housing));                                   //   Wanne (dunkel, tief)
     g.add(B(noseX-0.012,yLc,sd*zc,0.008,yLh-0.012,zhw-0.012,M.steel));                         //   Reflektor (tief, klein)
     shapedLens(g,P.cLight||'rect',noseX-0.002,yLc,sd*zc,zhw*0.88,yLh*0.92,M.lensW);            //   KULTUR: geformte LEUCHTFLÄCHE (Linse als Markenform)
     headlightShape(g,P.cLight||'rect',noseX+0.006,yLc,sd*zc,zhw*0.92,yLh*0.98,M);              //   geformte Blende (Ring) um die Linse
     g.add(B(noseX+0.006,yLc-0.014,sd*(zc-zhw*0.35),0.008,0.014,0.024,M.lensW));                //   Projektor = Hauptlicht (hinter der Signatur)
     lightStrokes(g,P.cLight||P.sig||'blade',sd,zLi,zLo,yLb,yLt,noseX+0.028,wSig,M.drl);                  //   DRL-SIGNATUR — Charakter über P.sig
     g.add(B(noseX+0.026,yLb+wSig*0.7,sd*(zLi+0.06),0.006,wSig*0.45,0.05,M.lensA));             //   Blinker (amber, fester Slot: unten innen)
     g.add(B(noseX-0.075,yLt-0.010,sd*(bw+0.030),0.055,0.009,0.004,M.drl));                     //   DRL um die Ecke (proud Flanke)
   }}
  // ── HECK — Rahmen-Schürze + vertiefte Rückleuchten + definierter Diffusor ──
  {const dH=bw*0.40, yDB=ySill+0.04, yDT=ySill+0.16;                                          // Diffusor-Öffnung (unten Mitte)
   const zRi=bw*0.30, zRo=bw-0.03, yRc=yBelt-0.13, yRh=0.045, yRb=yRc-yRh, yRt=yRc+yRh;       // Rückleuchten-Band (breit, bis Mitte)
   g.add(B(tailX,(yRt+yBelt)/2,0,t,(yBelt-yRt)/2,bw,bodyMat));                                //   Rahmen: über Leuchten (volle Breite)
   g.add(B(tailX,(ySill+yRb)/2,0,t,(yRb-ySill)/2,zRi,bodyMat));                               //   Rahmen: unter Leuchten Mitte (über Diffusor)
   for(const sd of[-1,1]){
     g.add(B(tailX,(ySill+yRb)/2,sd*(zRi+bw)/2,t,(yRb-ySill)/2,(bw-zRi)/2,bodyMat));          //   unter Leuchten aussen
     g.add(B(tailX,(yRb+yRt)/2,sd*(zRo+bw)/2,t,(yRt-yRb)/2,(bw-zRo)/2,bodyMat));              //   aussen neben Leuchten
   }
   g.add(B(tailX,(yRb+yRt)/2,0,t,(yRt-yRb)/2,zRi,bodyMat));                                    //   Mittelsteg zwischen den Leuchten
   // Rückleuchten — Leuchtband (Signatur) + Eck-Cluster; ALLE Linsen stehen VOR der Heckfläche (tailX−t) → poke-through, durchgehend, keine Bugs
   const rs=tailX-t;                                                                            // echte Heckfläche (Paneele sind ±t dick)
   const wSigR=(yRt-yRb)*0.18;
   for(const sd of[-1,1]){const zc=(zRi+zRo)/2, zhw=(zRo-zRi)/2;
     g.add(B(tailX+0.03,yRc,sd*zc,0.035,yRh,zhw,M.housing));                                    //   Wanne (dunkel)
     g.add(B(rs+0.004,yRc,sd*zc,0.007,yRh-0.012,zhw-0.012,M.steel));                            //   Reflektor (tief, klein)
     shapedLens(g,P.cLight||'rect',rs+0.004,yRc,sd*zc,zhw*0.88,yRh*0.92,M.lensR);                //   KULTUR: geformte rote LEUCHTFLÄCHE
     headlightShape(g,P.cLight||'rect',rs+0.001,yRc,sd*zc,zhw*0.92,yRh*0.98,M);                  //   geformte Blende (Ring)
     lightStrokes(g,P.cLight||P.sig||'blade',sd,zRi,zRo,yRb,yRt,rs-0.006,wSigR,M.lensR);                  //   Rück-SIGNATUR (gleicher Charakter, rot)
     g.add(B(rs-0.004,yRb+wSigR*0.7,sd*(zRo-0.06),0.006,wSigR*0.45,0.05,M.lensA));              //   Blinker (amber)
   }
   if((P.cLight)==='l_single') g.add(B(rs-0.004,yRc,0,0.006,(yRt-yRb)*0.5*0.45,zRi*0.96,M.lensR)); //   KULTUR: durchgehendes Heck-Leuchtband (Audi)
   // Diffusor — vertiefte Rückwand + vertikale Finnen
   g.add(B(tailX+0.045,(yDB+yDT)/2,0,0.03,(yDT-yDB)/2,dH,M.grille));                           //   Rückwand (vertieft)
   g.add(B(tailX-0.016,ySill+0.030,0,0.018,0.010,bw*0.60,bodyMat));                              //   HECK-Schürzenlippe: Tiefe am Heck
   for(let i=0;i<5;i++){const zz=-dH+0.02+(2*dH-0.04)*i/4; g.add(B(tailX+0.02,(yDB+yDT)/2,zz,0.02,(yDT-yDB)/2-0.005,0.012,M.steel));} //   Finnen (vertikal)
   // ── KULTUR Auspuff (Marken-Signatur am Heck) ──
   {const ey=ySill+0.035, ex=tailX-0.012, gr=P.cGrille;
    if(gr==='oval'){for(const o of[-1,1])for(let i=0;i<2;i++) g.add(C(ex,ey,o*(bw*0.26+i*0.075),'x',0.027,0.05,M.steel));}        // Ferrari: vier runde Endrohre
    else if(gr==='hex'){g.add(B(ex-0.01,ey,0,0.022,0.034,bw*0.16,M.housing)); for(const o of[-1,1]) g.add(C(ex,ey,o*bw*0.20,'x',0.034,0.06,M.steel));} // Lambo: zentral-hexagonal, zwei grosse
    else if(gr==='single'){for(const o of[-1,1]) g.add(B(ex,ey,o*bw*0.52,0.02,0.024,0.055,M.steel));}                              // Audi: zwei Trapez-Endrohre aussen
    else if(gr==='wide'){for(const o of[-1,1]) g.add(C(ex,ey,o*bw*0.52,'x',0.026,0.05,M.steel));}                                  // Mercedes: zwei runde, weit aussen
    /* Monolith (upright): versteckt — kein sichtbares Endrohr */ }}
  // ── KULTUR Haltung: Heckflügel (aggressiv) + Seitenschweller ──
  {const aH=P.radR*1.18;  // Radhaus-Halbbreite (für saubere Skirt-Länge zwischen den Rädern)
   if((P.heck||'stufe')!=='steil'&&P.cGrille==='hex'&&cSta>0.70){const wy=yBelt+0.135,wx=tailX+0.05,sp=bw*0.76,ch=0.085;          // TORO/Lambo: hoher Heckflügel auf Stützen
     const bl=Bsub(wx,wy,0,ch,0.009,sp,M.housing,10,1); bend(bl,'x','y',u=>-0.014*(1-u*u)); g.add(bl); //   Airfoil-Wölbung (Mitte höher → Profil statt Brett)
     g.add(B(wx,wy+0.009,0,ch*0.7,0.004,sp*0.99,M.steel));                                            //   Oberkante (Glanzkante)
     for(const sd of[-1,1]) g.add(B(wx-0.005,(yBelt+0.015+wy)/2,sd*sp*0.80,0.010,(wy-0.015-yBelt)/2,0.012,M.steel,-0.16));} //   geneigte schlanke Stützen
   else if((P.heck||'stufe')!=='steil'&&P.cGrille==='oval'&&cSta>0.65){const dy=yBelt+0.030,dx2=tailX+0.045;                        // CAVALLO/Ferrari: dezenter Ducktail (Abrisskante statt Flügel)
     const dt=Bsub(dx2,dy,0,0.07,0.012,bw*0.80,M.housing,8,1); bend(dt,'x','y',u=>0.026*Math.max(0,-u)); g.add(dt); //   Hinterkante kickt hoch
     g.add(B(dx2-0.01,dy+0.012,0,0.05,0.004,bw*0.79,M.steel));}                                        //   Glanzkante
   if(cSta>0.62){const xc=(fAx+rAx)/2, xh=Math.abs(fAx-rAx)/2-aH-0.02;                                // Seitenschweller: NUR zwischen den Radhäusern, am Schweller, proud (kein Schweben/Überlauf)
     for(const sd of[-1,1]) g.add(B(xc,ySill+0.012,sd*bw,xh,0.020,0.026,M.housing));}}                //   sitzt auf der Schwellerlinie (z=bw → taperBody zieht ihn auf die Tuck-Fläche)
  g.add(B((noseX+tailX)/2,ySill,0,(noseX-tailX)/2,t,hz-0.16,bodyMat));  // Unterboden Mitte (auf echter Nase-Heck-Mitte, nicht Achs-Mitte)
  for(const sd of[-1,1]) for(const[a,b] of clipSegs(tailX,noseX,gaps)) g.add(B((a+b)/2,ySill,sd*((hz-0.16)+bw)/2,(b-a)/2,t,(bw-(hz-0.16))/2,bodyMat)); // äusserer Boden bis zur Flanke (an Rädern ausgespart) — keine Lücke mehr
  // ── KONTUR-LIPPEN: Rahmen überragt die Stirnflächen minimal (proud > ±t) → Schattenkante statt flaches Brett, kein Koplanar-Bug ──
  {const fpl=noseX+0.025, rpl=tailX-0.025;                                  // proud-Ebene vor Front/Heck-Fläche
   const yFb=ySill+0.32*(yNose-ySill), yRb=ySill+0.32*(yBelt-ySill);        // untere Lippen: ANTEILIG zur Fascia-Höhe → konsistente Kontur über alle Presets (nicht fix)
   g.add(B(fpl,yFb,0,0.012,0.013,bw*0.93,bodyMat));                         //   Front: untere Schürzenlippe (Schattenlinie) — proud, anteilig
   g.add(B(fpl,yNose-0.004,0,0.011,0.010,bw*0.97,bodyMat));                 //   Front: obere Haubenlippe
   g.add(B(rpl,yRb,0,0.012,0.013,bw*0.93,bodyMat));                         //   Heck: untere Schürzenlippe — anteilig
   g.add(B(rpl,yBelt-0.012,0,0.011,0.010,bw*0.97,bodyMat));}               //   Heck: obere Kante
  {const hoodLen=Math.hypot(noseX-cowlX,hoodDrop),hoodAng=-Math.atan2(hoodDrop,noseX-cowlX), hoodHalf=clr;  // Haube ZWISCHEN den Kotflügeln (Rad freigestellt)
   {const hd=dome((cowlX+noseX)/2,(yBelt+yNose)/2,0,hoodLen/2,t,hoodHalf,bodyMat,Math.min(0.10,hoodHalf*0.14)*cMul,hoodAng,false); bend(hd,'x','y',t=>{var u=Math.max(0,(t+1)/2),a=(P.hoodArc!=null?P.hoodArc:0.022); return a*0.35*Math.sin(Math.PI*u) - 0.045*Math.pow(u,5);}); /* Haube: Laengs-Krone (sin, an beiden Enden 0) skaliert mit hoodArc + progressiver Abfall zur Nase; Nasen-Endpunkt fix => Fascia-Anschluss bleibt. hoodArc war zuvor toter Parameter. */ g.add(hd);}  // Haube flacher: Nase ein paar ° hoch (endet auf Grillkante, nicht ins Loch getaucht)  // Hauben-Längsgrat //   Haubenblech gewölbt, fällt zur Nase
   {const aHd=(P.hoodArc!=null?P.hoodArc:0.022);
    const fyAt=xc=>{const uH=(xc-cowlX)/(noseX-cowlX),crownH=aHd*0.35*Math.sin(Math.PI*uH)-0.045*Math.pow(uH,5),fdesc=yBelt-uH*hoodDrop+crownH;return Math.max(fdesc,archShoulderY(xc)-0.015);};   // deckt Nase/Lampe (archShoulderY bleibt)
    for(const sd of[-1,1]) for(const[a,b] of clipSegs(cowlX,noseX,gaps)){ if(b-a<0.02) continue; const cc=(a+b)/2,hh2=(b-a)/2,nf=Math.max(8,Math.round((b-a)*22)); const strip=Bsub(cc,yBelt,sd*(hoodHalf+bw)/2,hh2,t,(bw-hoodHalf)/2,bodyMat,nf,1); bend(strip,'x','y',tt=>fyAt(cc+tt*hh2)-yBelt); g.add(strip);}}}  // Radloch ausgespart → Haunch macht den Bogen allein (kein 15mm-Doppel)
  {const deckHalf=clr;                                                                                      // Heckdeckel ZWISCHEN den Kotflügeln
   {const dk=dome((backX+tailX)/2,yBelt,0,Math.abs(backX-tailX)/2,t,deckHalf,bodyMat,Math.min(0.045,deckHalf*0.07),0,true); bend(dk,'x','y',u=>0.014*Math.max(0,u)-0.026*Math.pow(Math.max(0,-u),2)); g.add(dk);} //   Deckel: flach + echte S (Kabinen-Hügel → fällt zur Heckkante), NICHT gebläht
   {const dyAt=xc=>Math.max(yBelt-0.005,archShoulderY(xc)-0.015);
    for(const sd of[-1,1]) for(const[a,b] of clipSegs(tailX,backX,gaps)){ if(b-a<0.02) continue; const cc=(a+b)/2,hh2=(b-a)/2,nd=Math.max(8,Math.round((b-a)*22)); const strip=Bsub(cc,yBelt,sd*(deckHalf+bw)/2,hh2,t,(bw-deckHalf)/2,bodyMat,nd,1); bend(strip,'x','y',tt=>dyAt(cc+tt*hh2)-yBelt); g.add(strip);}}}  // Radloch ausgespart
  for(const ax of[fAx,rAx]){const isFront=(ax===fAx);                                                              // RADLAUF-BROW: EIN glatter Bogen je Seite (ersetzt 26 Facetten-Boxen → keine Treppe), folgt archShoulderY
    const humpRise=Math.max(0.015, 2*P.radR+wheelClearance(P,ax,isFront).gap-yBelt), NB=Math.max(34,Math.round(archHalf*72));
    for(const sd of[-1,1]){const brow=Bsub(ax,yBelt,sd*(bw+0.006),archHalf,0.016,0.022,bodyMat,NB,1); bend(brow,'x','y',tt=>humpRise*(1-tt*tt)); g.add(brow);}}
  {const roofZ=cwK+0.028; const rf=dome((roofF+roofR)/2,yRoof,0,(roofF-roofR)/2,t,roofZ,bodyMat,Math.min(0.06,roofZ*0.07)*cMul,0,true); bend(rf,'x','y',t=>(P.roofArc!=null?P.roofArc:0.022)*(1-Math.pow(t,4))); g.add(rf);}  // Dach DOPPELT gekrümmt: z-Crown × x-Bogen, Tension-Profil (1-t⁴, flach mittig, progressiv zum Rand)       // Dach gewölbt (±cwK)
  // ── G · GREENHOUSE-RAHMEN — Füsse auf der Schulter (Bogen-Hüllkurve), Säule passt sich dem Bogen an ──
  const footF=archShoulderY(cowlX), footR=archShoulderY(backX);                                                 // Schulter vorn/hinten (steigt übers Rad)
  const angA=Math.atan2(yRoof-footF,roofF-cowlX), lenA=Math.hypot(roofF-cowlX,yRoof-footF);                     // A-Säule/Windschutz ab Schulter
  const angC=Math.atan2(yRoof-footR,roofR-backX), lenC=Math.hypot(roofR-backX,yRoof-footR);                     // C-Säule/Heck ab Schulter
  const footRpil=footR+0.028, angCp=Math.atan2(yRoof-footRpil,roofR-backX), lenCp=Math.hypot(roofR-backX,yRoof-footRpil); // C-Säulen-Fuss höher → Unterkante sitzt auf der Bogenlinie, taucht nicht durch
  const xAtC2=y=>backX+(y-footR)/(yRoof-footR)*(roofR-backX)+0.034*Math.max(0,1-(y-footR)/0.13);  // + HOFMEISTER-KNICK (konkav am C-Säulen-Fuss)                                                   // C-Säulen-Linie ab Schulter (Quarter/Sail)
  for(const sd of[-1,1]){
    {const pA=B((cowlX+roofF)/2,(footF+yRoof)/2,sd*cwK,lenA/2,0.028,0.028,bodyMat,angA); g.add(pA);}  // A-Säule GEBOGEN: zieht zum Dach hin nach innen, progressiv (Tension)                           // A-Säule (Fuss auf Schulter)
    g.add(B(P.kabineMitte,(yBelt+yRoof)/2,sd*cwK,0.024,(yRoof-yBelt)/2,0.022,bodyMat));                         // B-Säule oben (Fenster-Teiler, schlank, Aussenkante ≈ Türlinie)
    if(tueren>=4) g.add(B(P.kabineMitte,(ySill+yBelt)/2,sd*(bw+0.014),0.024,(yBelt-ySill)/2,0.006,bodyMat));    // B-Säule unten: GLEICHE Breite/Material, echt proud (Rücken auf Türfront bw+0.008) → ein durchgehender Körper bis zum Boden, kein Durchdrücken
    {const pC=B((backX+roofR)/2,(footRpil+yRoof)/2,sd*cwK,lenCp/2,0.028,0.028,bodyMat,angCp); g.add(pC);}  // C-Säule GEBOGEN                       // C-Säule (Fuss höher → kein Bogen-Durchstoss; passt sich dem Bogen an)
    {const dh=Bsub((roofF+roofR)/2,yRoof-0.02,sd*(cwK+0.014),(roofF-roofR)/2,0.02,0.028,bodyMat,Math.max(6,Math.round((roofF-roofR)*10)),1); bend(dh,'x','y',t=>(P.roofArc!=null?P.roofArc:0.022)*(1-Math.pow(t,4))); g.add(dh);}  // Dachholm FOLGT der Dachhaut + Enden ziehen innen (zu den Säulenköpfen)
    {const qF=tueren>=4?dRx:dBx; if(Math.abs(qF-backX)>0.03){const xa=Math.min(qF,backX),xb=Math.max(qF,backX),xc=(xa+xb)/2,xh=(xb-xa)/2,NR=Math.max(16,Math.round(xh*70));
      const prof=xx=>Math.max(footR,archShoulderY(xx)+0.015), y0=prof(xc);   // Gürtelschiene am Quarter FOLGT dem Radbogen — EIN gebogener Streifen (ersetzt 12 Box-Segmente → keine Treppe), steigt übers Rad, schwebt nicht
      const rail=Bsub(xc,y0,sd*cwK,xh,0.02,0.03,bodyMat,NR,1); bend(rail,'x','y',t=>prof(xc+t*xh)-y0); g.add(rail);}}
  }
  // ── UNTERBODEN-BODENBLECH: schliesst die Kabinen-Unterseite (Package nicht mehr von schräg unten sichtbar). z=±bw → taperBody tuckt es auf die eingezogene Karosseriebreite. ──
  for(const[a,b] of clipSegs(Math.min(backX,cowlX),Math.max(backX,cowlX),gaps)) g.add(B((a+b)/2,ySill-0.004,0,(b-a)/2,t,bw,M.trim));
  g.add(B(cowlX,footF,0,0.022,0.022,cwK,bodyMat));   // Cowl-Querleiste (auf Schulter)
  g.add(B(backX,footR,0,0.022,0.022,cwK,bodyMat));   // Heck-Querleiste (auf Schulter → über dem Rad, streift es NICHT mehr)
  if(footF>yBelt+0.003) g.add(B(cowlX,(yBelt+footF)/2,0,0.024,(footF-yBelt)/2,cwK,bodyMat)); // Body-Band unter Windschutz (Gürtel→Schulter)
  if(footR>yBelt+0.003) g.add(B(backX,(yBelt+footR)/2,0,0.024,(footR-yBelt)/2,cwK,bodyMat)); // Body-Band unter Heckscheibe
  if(tueren<4){const sh=Math.max(footR,gB); if(sh>yBelt+0.004) for(const sd of[-1,1])       // 2-Türer: Schulter-Band hinter der Fahrtür (Gürtel→Schulter, Tür→Heckscheibe) → kein Spalt mehr
    g.add(B((dBx+0.02+backX)/2,(yBelt+sh)/2,sd*cwK,Math.abs(backX-(dBx+0.02))/2,(sh-yBelt)/2,t,bodyMat));}
  // ── H · GLAS — gewölbt (folgt der Dachwölbung in z), Fuss auf Schulter ──
  g.add(dome((cowlX+roofF)/2,(footF+yRoof)/2,0,lenA/2,0.005,cwK,M.glass,-Math.min(0.095,cwK*0.11),angA,true));  // Windschutz gewölbt — NEG: lokal+Y zeigt bei dieser Neigung nach innen, also minus = nach aussen (konvex)
  g.add(dome((backX+roofR)/2,(footR+yRoof)/2,0,lenC/2,0.005,cwK,M.glass,Math.min(0.085,cwK*0.10),angC,true));  // Heckscheibe gewölbt (konvex, dezenter)
  if(tueren<4) for(const sd of[-1,1]){const gBr=Math.max(gB,footR); g.add(bowedQuad([dBx+0.02,gBr,sd*cwK],[xAtC2(gBr),gBr,sd*cwK],[xAtC2(gT),gT,sd*cwK],[dBx+0.02,gT,sd*cwK],sd*0.026,M.glass));} // Quarter (Basis auf Schulter)
  if(hasRearQ) for(const sd of[-1,1]){const gBr=Math.max(gB,footR);
    g.add(quad4([dRx,gBr,sd*cwK],[xAtC2(gBr),gBr,sd*cwK],[xAtC2(gT),gT,sd*cwK],[dRx,gT,sd*cwK],M.glass));               // hinteres Eckfenster (Sail) — Basis auf Schulter
    g.add(B(dRx,(gBr+yRoof)/2,sd*cwK,0.024,(yRoof-gBr)/2,0.024,bodyMat));                                      // Säule zwischen Hintertür und Eckfenster
  }
  // ── G2 · TÜREN — Trapez-Glas (Kanten folgen den Säulen); Vorder-+Hintertür bei 4-Türern ──
  const ySillTop=ySill+0.10, pvY=(ySillTop+yBelt)/2;
  function makeDoor(xHinge,xLatch,feFn,beFn,mirror){
    for(const sd of[-1,1]){const doorLen=xHinge-xLatch, dz=sd*cwK-sd*bw;
      const pv=new THREE.Group();pv.position.set(xHinge,pvY,sd*bw);
      const skin=box(doorLen,yBelt-ySillTop,0.016,M.door);skin.position.set(-doorLen/2,0,0);pv.add(skin);              // Türblatt
      const fb=[feFn(gB)-xHinge,gB-pvY,dz],bb=[beFn(gB)-xHinge,gB-pvY,dz],bt=[beFn(gT)-xHinge,gT-pvY,dz],ft=[feFn(gT)-xHinge,gT-pvY,dz];
      pv.add(bowedQuad(fb,bb,bt,ft,sd*0.032,M.glass));   // Türglas gewölbt (konvex nach aussen)                                                                             // Türglas (Trapez)
      const topLen=Math.abs(bt[0]-ft[0]);const fr=box(topLen,0.028,0.028,M.pillar);fr.position.set((ft[0]+bt[0])/2,gT-pvY,dz);pv.add(fr); // Rahmen oben
      const belt=box(doorLen,0.05,0.05,bodyMat);belt.position.set(-doorLen/2,yBelt-pvY,0);pv.add(belt);              // Gürtel (fährt mit)
      {const ySh=yBelt-0.14;const sk=box(doorLen,0.026,0.026,bodyMat);sk.position.set(-doorLen/2,ySh-pvY,sd*0.006);pv.add(sk);} // CHARAKTER-SICKE auf der Tür → schwebt nicht mehr
      const handle=box(0.12,0.03,0.026,M.pillar);handle.position.set(-doorLen+0.20,(yBelt-0.12)-pvY,sd*0.025);pv.add(handle); // Griff
      if(mirror){const sail=box(0.05,0.05,0.03,bodyMat);sail.position.set(0.02,(yBelt+0.015)-pvY,sd*0.04);pv.add(sail);
        const mst=box(0.075,0.016,0.018,M.pillar);mst.position.set(-0.02,(yBelt-0.04)-pvY,sd*0.055);pv.add(mst);
        const mir=box(0.05,0.05,0.095,M.pillar);mir.position.set(-0.055,(yBelt-0.03)-pvY,sd*0.10);mir.rotation.y=sd*0.12;pv.add(mir);}          // Spiegel: an Gürtellinie (nicht über Haube)
      g.add(pv);doors.push({pv,sd});}
  }
  makeDoor(dFx,dBx,dFxAt,y=>dBx+0.02,true);                          // Vordertür (vorn raked A-Säule, hinten an B-Säule)
  if(tueren>=4) makeDoor(dBx,dRx,y=>dBx-0.02,hasRearQ?(y=>dRx):xAtC,false); // Hintertür (Hinterkante an dRx = vor dem Hinterrad; sonst an C-Säule)
  // Eckfenster (Vent) für cab-forward Presets: füllt A-Säule ↔ Türvorderkante, plus Türvorderkante-Säule
  if(hasVent) for(const sd of[-1,1]){
    g.add(quad4([xAt(gB),gB,sd*cwK],[dFxAt(gB),gB,sd*cwK],[dFxAt(gT),gT,sd*cwK],[xAt(gT),gT,sd*cwK],M.glass));      // Eckfenster
    g.add(B(dFx+0.5*(roofF-cowlX),(yBelt+yRoof)/2,sd*cwK,Math.hypot(roofF-cowlX,yRoof-yBelt)/2,0.024,0.024,bodyMat,Aw)); // Türvorderkante-Säule
  }
  return g;}

function buildPackage(H,P){const g=new THREE.Group();const S=scal(H,P);
  const{fAx,rAx,noseX,tailX,cowlX,backX,roofF,roofR,hz,bw,cw,yFloor,yBatt,ySill,yBelt,yRoof}=S;
  const cwK=bw-0.015, archHalf=P.radR*1.18, gaps=[[fAx-archHalf,fAx+archHalf],[rAx-archHalf,rAx+archHalf]];
  const cellY=(ySill+yBelt)/2+0.05;
  // Plattform — alle Querbauteile schmaler als die Reifen-Innenkante (hz-0.11≈0.70), damit nichts durch die Räder geht
  {const bBot=Math.max(yFloor,ySill),bTop=Math.max(yBatt,bBot+0.06); g.add(B(0,(bBot+bTop)/2,0,P.radstand/2-0.05,(bTop-bBot)/2,hz-0.18,M.batt));}    // Akku-Paket: Boden auf Schwellerlinie geklemmt (ragt NICHT unter die Türkante), schmal (frei von Rädern)
  g.add(B(fAx,0.20,0,0.22,0.06,hz-0.16,M.steel));g.add(B(rAx,0.20,0,0.24,0.06,hz-0.16,M.steel)); // Hilfsrahmen (schmal)
  for(const sd of[-1,1]){g.add(B((fAx+noseX)/2,0.32,sd*0.34,(noseX-fAx)/2,0.05,0.05,M.steel));
    g.add(B((rAx+tailX)/2,0.30,sd*0.34,Math.abs(tailX-rAx)/2,0.05,0.05,M.steel));}     // Längsträger
  g.add(B(noseX-0.05,0.34,0,0.04,0.06,hz*0.9,M.steel));g.add(B(tailX+0.05,0.32,0,0.04,0.06,hz*0.9,M.steel)); // Crashträger (vor/hinter Rädern)
  // Antrieb (Wellen liegen auf der Nabenlinie → koaxial)
  g.add(C(fAx,0.27,0,'z',0.13,0.34,M.motor,18));g.add(C(rAx,0.27,0,'z',0.14,0.40,M.motor,18));
  for(const sd of[-1,1]){g.add(C(fAx,P.radR,sd*0.49,'z',0.026,0.62,M.rimM,12));g.add(C(rAx,P.radR,sd*0.49,'z',0.028,0.62,M.rimM,12));}
  // Zelle (Ring bindet das Greenhouse an)
  g.add(B((cowlX+backX)/2,ySill+0.04,0,(cowlX-backX)/2,0.02,hz-0.16,M.trim));           // Bodenplatte (frei von Rädern)
  {const fwF=(Math.abs(cowlX-fAx)<archHalf+0.10)?hz-0.17:bw-0.05, fwR=(Math.abs((backX+0.05)-rAx)<archHalf+0.10)?hz-0.17:bw-0.05;
   g.add(B(cowlX,cellY,0,0.03,0.22,fwF,M.steel));g.add(B(backX+0.05,cellY,0,0.03,0.20,fwR,M.steel));} // Schott: vollbreit wenn frei, schmal (innen vom Radhaus) nahe Achse → kein Durchblick UND kein Radkasten-Durchstoss
  for(const sd of[-1,1]){
    {const wT=Math.min(cellY+0.19,yBelt-0.02); g.add(B((cowlX+fAx)/2,(cellY-0.19+wT)/2,sd*(hz-0.17),Math.abs(fAx-cowlX)/2,(wT-(cellY-0.19))/2,0.02,M.steel));}   // vordere Radhauswand: schliesst Kabinenseite vom Vorderrad/Motor (inboard → kein Durchstoss)
    {const wT=Math.min(cellY+0.17,yBelt-0.02); g.add(B((backX+rAx)/2,(cellY-0.17+wT)/2,sd*(hz-0.17),Math.abs(backX-rAx)/2,(wT-(cellY-0.17))/2,0.02,M.steel));}   // hintere Radhauswand
    for(const[a,b] of clipSegs((cowlX+backX)/2-((fAx-rAx)/2-0.1),(cowlX+backX)/2+((fAx-rAx)/2-0.1),gaps)) g.add(B((a+b)/2,ySill+0.075,sd*(bw-0.17),(b-a)/2,0.035,0.03,M.trim)); // Schweller höher+WEIT innen (innerhalb der eingezogenen Tuck-Flanke → ragt nicht raus/unter Tür)
    {const pa=B((cowlX+roofF)/2,(yBelt+yRoof)/2,sd*cwK,Math.hypot(roofF-cowlX,yRoof-yBelt)/2,0.022,0.022,M.steel,S.Awin); g.add(pa);} // A-Säule GEBOGEN wie Haut
    g.add(B(P.kabineMitte,(yBelt+yRoof)/2,sd*cwK,0.022,(yRoof-yBelt)/2,0.022,M.steel));    // B-Säule
    {const pc=B((backX+roofR)/2,(yBelt+yRoof)/2,sd*cwK,Math.hypot(roofR-backX,yRoof-yBelt)/2,0.022,0.022,M.steel,S.Cwin); g.add(pc);} // C-Säule GEBOGEN wie Haut
    {const dh=Bsub((roofF+roofR)/2,yRoof-0.02,sd*cwK,(roofF-roofR)/2,0.02,0.022,M.steel,Math.max(6,Math.round((roofF-roofR)*10)),1); bend(dh,'x','y',u=>(P.roofArc!=null?P.roofArc:0.022)*(1-Math.pow(u,4))); g.add(dh);}}      // Dachholm FOLGT der Haut-Dachkurve
  // Sitze — Reihen an der Kabine verankert (vorn an Cowl, hinten vorm Schott); Lenkrad fix am Brett
  const tueren=P.tueren||2;
  function seatRow(cx){for(const z of[-0.40,0.40]){g.add(B(cx,ySill+0.11,z,0.27,0.055,0.24,M.seat));        // Sitzfläche
    g.add(B(cx-0.28,ySill+0.37,z,0.055,0.26,0.23,M.seat,0.13));                                             // Lehne (lehnt nach hinten)
    g.add(B(cx-0.35,ySill+0.62,z,0.07,0.075,0.11,M.seat));}}                                                // Kopfstütze
  const frontCx=cowlX-0.72;
  seatRow(frontCx);                                                                     // vordere Reihe
  if(tueren>=4) seatRow(backX+0.58);                                                    // hintere Reihe (nur 4-Türer)
  {const tBot=Math.max(yFloor+0.10,ySill+0.01);g.add(B(frontCx+0.10,(tBot+yFloor+0.30)/2,0,0.32,(yFloor+0.30-tBot)/2,0.06,M.trim));}  // Mitteltunnel: Boden auf Schwellerlinie (ragt nicht unter die Karosserie)
  // Cockpit — Brett an Cowl, Säule verbindet Brett→Lenkrad (kein Schweben mehr)
  g.add(B(cowlX-0.12,yBelt-0.06,0,0.10,0.06,hz-0.14,M.trim));                           // Armaturenbrett
  g.add(B(cowlX-0.23,yBelt-0.05,-0.38,0.11,0.018,0.018,M.trim));                        // Lenksäule (Brett → Lenkrad)
  g.add(C(cowlX-0.34,yBelt-0.02,-0.38,'x',0.15,0.025,M.trim,16));                       // Lenkrad (am Säulenende)
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
const P={radstand:2.9,spur:1.62,ueberhangV:0.78,ueberhangH:0.92,radR:0.34,fahrhoehe:0.13,
  guertel:0.72,dach:1.20,kabineMitte:-0.28,kabineLaenge:1.70,tumblehome:0.13,taille:0.10,
  springRate:95,damping:12,grip:1.0};
// Schwerpunkthöhe ABGELEITET aus der Form: Bodenfreiheit + Masse sitzt tief (Chassis/Akku) + etwas Aufbau.
// → flacher Supersportler = tiefer SP = wenig Wanken · hoher SUV = hoher SP = mehr Wanken (automatisch).
function cgHeightOf(P){return P.fahrhoehe*0.7 + P.guertel*0.45 + (P.dach-P.guertel)*0.10;}
const A_PITCH_MAX=13, A_LAT_MAX=11;   // Laengs-/Quer-Beschl.-Klammern (g-equiv.) — EINZIGE Quelle: updateVehicle UND Radkasten-Huellkurve
// ── Rad-Bewegungshuellkurve: GEMESSEN aus der LIVE-Fahrphysik (gleiche Klammern/Federn wie updateVehicle), keine 1-g-Schaetzung ──
//    vert  = Nicktauchen am Achs-x (aMax + Feder-Ueberschwingen ζ) + Squat(Heave)  → vertikaler Freigang Bogenscheitel↔Reifen
//    inb   = inboard-Reichweite des (gelenkten) Reifens ab Radmitte · roll = Wank-Spitze  → Tiefe der inneren Radhausschale
function wheelClearance(P, axleX, front){
  const cgH=cgHeightOf(P), L=P.radstand, W=P.spur, k=P.springRate||95, c=P.damping||12, R=P.radR, hw=0.11;
  const steer=(typeof FAHR!=="undefined"?FAHR.maxSteer:0.52);                       // voller Lenkeinschlag (Worst Case: Schritttempo, sf≈1)
  const OS=(kk,cc)=>{const z=cc/(2*Math.sqrt(kk)); return 1+(z<1?Math.exp(-z*Math.PI/Math.sqrt(1-z*z)):0);};  // Ueberschwing-Faktor aus ζ=c/2√k
  const pitch=A_PITCH_MAX*(cgH/L)*2.6/k*OS(k,c);                                     // Nickwinkel-Spitze [rad]  (mPitch=aL·(cgH/L)·2.6, Feder k,c)
  const roll =A_LAT_MAX  *(cgH/W)*1.8/k*OS(k,c);                                     // Wankwinkel-Spitze [rad]  (mRoll=aQ·(cgH/W)·1.8)
  const heave=(A_PITCH_MAX*0.08+12*0.035)/(k*1.3)*OS(k*1.3,c*1.15);                  // Squat-Spitze [m]         (mHeave, Feder k·1.3,c·1.15; v≈12 m/s)
  const vert =Math.abs(axleX)*Math.sin(pitch)+heave;                                // vertikale Annaeherung Reifen→Bogenscheitel
  const inb  =(front?R*Math.sin(steer):0)+hw*Math.cos(front?steer:0);               // inboard-Rand des gelenkten Reifens ab Radmitte
  return {pitch, roll, heave, vert, inb, gap:Math.min(0.30,Math.max(0.045, vert+0.025))};  // +25 mm Reserve, gedeckelt
}
// Antriebsphysik AUS DER FORM abgeleitet:
//   Masse ∝ Länge·Breite·Höhe (Bounding-Volumen) → a = F/m: schwerer = träger.
//   Stirnfläche ∝ Breite·Höhe → Luftwiderstand → Tempo am Limit (Schub = Widerstand, Masse kürzt sich raus).
//   F0 (Motorschub) + Beiwert sind konstant (Antrieb, keine Geometrie); auf GT geeicht → a≈9, vmax≈16.
function carPhys(P){const len=P.radstand+P.ueberhangV+P.ueberhangH,mass=len*P.spur*P.dach,front=P.spur*P.dach,F0=80.5,dragC=0.1618;
  return {aEngine:F0/mass, dragK:dragC*front/mass, vmax:Math.sqrt(F0/(dragC*front)), mass:mass};}
const PARAMS=[
  {id:'radstand',lab:'Radstand',min:2.2,max:3.4,step:.01,grp:'RAHMEN',law:'Achsen ±radstand/2 → Radkasten-Mitte'},
  {id:'spur',lab:'Spur',min:1.3,max:1.9,step:.01,grp:'RAHMEN',law:'Karosseriebreite = spur/2 + 0.13 (deckt Räder)'},
  {id:'ueberhangV',lab:'Überhang vorn',min:.4,max:1.2,step:.01,grp:'RAHMEN',law:'Nase = Vorderachse + ÜH-V'},
  {id:'ueberhangH',lab:'Überhang hinten',min:.4,max:1.3,step:.01,grp:'RAHMEN',law:'Heck = Hinterachse − ÜH-H · Front unberührt'},
  {id:'taille',lab:'Taillierung',min:0,max:.2,step:.005,grp:'RAHMEN',law:'seitlicher Einzug der Flanke'},
  {id:'radR',lab:'Rad-Radius',min:.26,max:.42,step:.005,grp:'STANCE',law:'Radkasten-Radius = radR · 1.18'},
  {id:'fahrhoehe',lab:'Bodenfreiheit',min:.06,max:.30,step:.005,grp:'STANCE',law:'hebt Schweller/Boden → Stance'},
  {id:'guertel',lab:'Gürtellinie',min:.55,max:.95,step:.01,grp:'GREENHOUSE',law:'Gürtel = Fenster-Unterkante'},
  {id:'dach',lab:'Dachhöhe',min:1.05,max:1.75,step:.01,grp:'GREENHOUSE',law:'Scheiben-Neigung ∝ (Dach − Gürtel)'},
  {id:'kabineMitte',lab:'Kabinen-Mitte',min:-.6,max:.4,step:.01,grp:'GREENHOUSE',law:'Dach-Front/Heck = Mitte ± Länge/2'},
  {id:'kabineLaenge',lab:'Kabinen-Länge',min:1.2,max:2.4,step:.01,grp:'GREENHOUSE',law:'länger → mehr Glas, ab Schwelle 4-Türer'},
  {id:'tumblehome',lab:'Tumblehome',min:0,max:.30,step:.005,grp:'GREENHOUSE',law:'Dach-Einzug der Seitenscheibe'},
  {id:'springRate',lab:'Federrate',min:40,max:170,step:1,grp:'DYNAMIK · FAHRWERK',law:'Winkel = Moment/Steifigkeit · steifer = weniger Nicken · steifer = engerer Radbogen'},
  {id:'damping',lab:'Dämpfung',min:4,max:24,step:.5,grp:'DYNAMIK · FAHRWERK',dyn:true,law:'ζ = c/2√k · höher = kein Nachschwingen'},
  {id:'grip',lab:'Reifen-Grip',min:0.6,max:1.4,step:.02,grp:'DYNAMIK · FAHRWERK',dyn:true,law:'Reibkreis μ · weniger = früher Drift/Übersteuern'},
];
// ── KULTUREN: eingefrorener Kontroll-Vektor je Marke (orthogonal zum Typ). Achsen: cEdge Kante↔Fläche · cTension Spannung · cStance Haltung · cGrille Signatur. ──
const CULTURES={
  'Cavallo':  {cEdge:0.15,cTension:0.85,cStance:0.72,cGrille:'oval',cLight:'l_oval'},      // Ferrari: Fläche, gespannt, aggressiv-elegant
  'Toro':     {cEdge:0.90,cTension:0.45,cStance:0.95,cGrille:'hex',cLight:'l_hex'},        // Lamborghini: Keil/Kante, Hexagon
  'Stern':    {cEdge:0.25,cTension:0.38,cStance:0.32,cGrille:'wide',cLight:'l_wide'},      // Mercedes: ruhige Fläche, würdevoll
  'Vorsprung':{cEdge:0.62,cTension:0.32,cStance:0.50,cGrille:'single',cLight:'l_single'},  // Audi: geometrisch, Singleframe
  'Monolith': {cEdge:0.48,cTension:0.20,cStance:0.12,cGrille:'upright',cLight:'l_upright'}, // Rolls: aufrecht, monumental
};
const PRESETS={
  'GT':       {radstand:2.9,spur:1.62,ueberhangV:.78,ueberhangH:.92,radR:.34,fahrhoehe:.13,guertel:.72,dach:1.20,kabineMitte:-.28,kabineLaenge:1.70,tumblehome:.13,taille:.10,tueren:2,springRate:100,coke:0.18,sig:'hook',grilleW:0.36,grilleDrop:0.18,lightH:0.050,lightDrop:0.115,roofArc:0.030,pillarCurve:0.045,pillarProfile:0.024,haunch:0.035,hoodArc:0.028},
  'Supersport':{radstand:2.7,spur:1.66,ueberhangV:.60,ueberhangH:.70,radR:.36,fahrhoehe:.085,guertel:.74,dach:1.12,kabineMitte:-.34,kabineLaenge:1.55,tumblehome:.17,taille:.13,tueren:2,springRate:135,coke:0.22,sig:'split',grilleW:0.44,grilleDrop:0.24,lightH:0.040,lightDrop:0.10,roofArc:0.038,pillarCurve:0.055,pillarProfile:0.030,haunch:0.050,hoodArc:0.020},
  'Limousine':{radstand:3.05,spur:1.60,ueberhangV:.88,ueberhangH:1.0,radR:.34,fahrhoehe:.14,guertel:.84,dach:1.42,kabineMitte:-.34,kabineLaenge:2.05,tumblehome:.11,taille:.07,tueren:4,springRate:82,coke:0.11,sig:'blade',grilleW:0.45,grilleDrop:0.15,lightH:0.058,lightDrop:0.115,roofArc:0.022,pillarCurve:0.032,pillarProfile:0.014,haunch:0.020,hoodArc:0.016,windshieldRake:0.55},
  'Kompakt-FWD':{radstand:2.6,spur:1.55,ueberhangV:.72,ueberhangH:.52,radR:.32,fahrhoehe:.135,guertel:.84,dach:1.44,kabineMitte:-.10,kabineLaenge:1.95,tumblehome:.10,taille:.05,tueren:4,springRate:92,coke:0.10,sig:'c',grilleW:0.30,grilleDrop:0.20,lightH:0.052,lightDrop:0.12,roofArc:0.020,pillarCurve:0.028,pillarProfile:0.012,haunch:0.015,hoodArc:0.012,windshieldRake:0.52,heck:'steil'},
  'SUV':      {radstand:2.85,spur:1.64,ueberhangV:.82,ueberhangH:.86,radR:.41,fahrhoehe:.22,guertel:.88,dach:1.66,kabineMitte:-.22,kabineLaenge:2.0,tumblehome:.08,taille:.04,tueren:4,springRate:68,coke:0.07,sig:'brow',grilleW:0.40,grilleDrop:0.09,lightH:0.072,lightDrop:0.13,roofArc:0.013,pillarCurve:0.016,pillarProfile:0.008,haunch:0.026,hoodArc:0.012,windshieldRake:0.45,heck:'steil'},
};
const show={frame:false,joints:false,cal:true,pkg:false,wheels:true,body:true,neg:false};
let gFrame,gJoints,gBody,gCal,gNeg,gPackage,gWheels;const doors=[];
const vehicle=new THREE.Group();scene.add(vehicle);
const gSprung=new THREE.Group();vehicle.add(gSprung);   // gefederte Masse (Aufbau) — nickt/wankt/hebt auf den Federn

function clear(g){if(!g)return;if(g.parent)g.parent.remove(g);g.traverse(o=>{if(o.geometry)o.geometry.dispose();
  if(o.isSprite&&o.material){if(o.material.map)o.material.map.dispose();o.material.dispose();}});}
function rebuild(){
  clear(gFrame);clear(gJoints);clear(gBody);clear(gCal);clear(gNeg);clear(gPackage);clear(gWheels);doors.length=0;
  const H=hardpoints(P);const res=evalLehren(P);
  gPackage=buildPackage(H,P);gPackage.visible=show.pkg; gSprung.add(gPackage);
  gBody=buildSkin(H,P);   gBody.visible=show.body;     gSprung.add(gBody);
  gFrame=buildFrame(H,P); gFrame.visible=show.frame;   gSprung.add(gFrame);
  gJoints=buildJoints(H,P);gJoints.visible=show.joints;gSprung.add(gJoints);
  gCal=buildCalipers(H,P,res);gCal.visible=show.cal;   gSprung.add(gCal);
  gNeg=buildNeg(H,P);     gNeg.visible=show.neg;        gSprung.add(gNeg);
  gWheels=buildWheels(H,P);gWheels.visible=show.wheels;vehicle.add(gWheels);  // ungefedert → bleibt am Boden geerdet
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
    const p=pct(v,L.dom),lo=pct(L.band[0],L.dom),hi=pct(L.band[1],L.dom);
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
for(const name in PRESETS){const b=document.createElement('button');b.className='btn';b.textContent=name;
  if(name==='GT')b.classList.add('on');
  b.onclick=()=>{Object.assign(P,{heck:'stufe',windshieldRake:0.5},PRESETS[name]);[...pdiv.children].forEach(c=>c.classList.remove('on'));b.classList.add('on');
    syncSliders();rebuild();};pdiv.appendChild(b);}
// Kultur-Selektor (orthogonal zum Typ)
const cdiv=document.createElement('div');cdiv.style.cssText='margin-top:8px';pdiv.parentNode.insertBefore(cdiv,pdiv.nextSibling);
{const cl=document.createElement('div');cl.textContent='KULTUR';cl.style.cssText='font-size:10px;letter-spacing:1px;opacity:.55;margin:4px 0 2px';cdiv.appendChild(cl);}
for(const cn in CULTURES){const b=document.createElement('button');b.className='btn';b.textContent=cn;
  b.onclick=()=>{Object.assign(P,CULTURES[cn]);[...cdiv.querySelectorAll('button')].forEach(c=>c.classList.remove('on'));b.classList.add('on');rebuild();};cdiv.appendChild(b);}
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
const FAHR={maxSteer:0.52,brakeDecel:14,rollDecel:1.0,handDecel:9,G:9.8,CA_F:5.0,CA_R:5.6,maxGrip:1.0,izzK:1.4};
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
  const mPitch=aL*(cgH/L)*2.6, mRoll=aQ*(cgH/W)*1.8, mHeave=-Math.abs(aL)*0.08-Math.abs(car.vlong)*0.035; // physikalische Amplitude (~2–3°), nicht übertrieben
  spPitch.step(mPitch,k,cd,dt); spRoll.step(mRoll,k,cd,dt); spHeave.step(mHeave,k*1.3,cd*1.15,dt);
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
Object.assign(P,PRESETS.GT);rebuild();animate();
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
