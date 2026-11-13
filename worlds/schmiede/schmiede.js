// ════════════════════════════════════════════════════════════════════
// ANATOMIE · KLINGE & KOLBEN
//   1. LEHREN    — Soll-Eigenschaften der Dynamik, die urteilen (Metrologie)
//   2. RÜCKGRAT  — Mittellinie + benannte Stationen (Knauf→Griff→Parier→Spitze)
//   3. GELENKE   — die dynamischen Punkte: Hand(Drehpunkt) · Balance · Stoßmittelpunkt
//   4. STAHL     — die Haut, ABGELEITET aus Rückgrat × Schnittprofil
// Kernsatz: EIN Schnittpolygon → Loft-Mesh UND Massenintegral. Eine Wahrheit.
// ════════════════════════════════════════════════════════════════════
// DIE BÜHNE DER WELT (w12-studio-buehne, studios.K4 — Studio = Modus der Welt-Engine): die Schmiede zeichnet ihre Waffe auf der
// Engine der Welt (three r184 WebGPU) im Licht der Welt (welt-licht.js `buehne`: Himmel, Sonne, Umgebung, Belichtung, Tonkurve
// am Mittag). Es fielen: r128 mit ACES 1,06, die gemalte Esse-Umgebung (Leinwand-Verlauf als PMREM), Hemi + Key + Rim + Fill +
// Punkt-Licht, der dunkle Grund 0x0a0807 mit Nebel und der Composer (UnrealBloom · FXAA · Vignette/Korn) — die Waffe stand unter
// einem Licht, das die Welt nie zeigt (Radeon: Bild-Differenz Labor ↔ Welt 99,4 %).
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(33,innerWidth/innerHeight,0.05,100);cam.position.set(0.16,0.74,1.78);
// DIE EINE BÜHNE (w28-studio-welt): Renderer, Sonne, das Licht der Welt an ihrer Uhr, Vorbau und Treue trägt die Bühne der Hülle
// (`AnazhHuelle.buehne`) — dieselbe unter jedem Studio
const BUEHNE=AnazhHuelle.buehne({szene:scene,sonnenWeite:4});
const R=BUEHNE.renderer;

// ── Werkbank + Raster ── DER BODEN IST DER BODEN DER ATMOSPHÄRE (die gemessene Welt-Albedo `ATMO_BODEN`, matt), die Waffe wirft
// ihren Schatten der Sonne auf ihn
const FLOOR_Y=-0.26, LIFT=0.30;   // Waffe schwebt auf Augenhöhe, Boden als dezente Referenz darunter (verdeckt nichts)
const bench=new THREE.Mesh(new THREE.PlaneGeometry(5,5),
  new THREE.MeshStandardMaterial({color:new THREE.Color().setRGB(...__weltLicht.ATMO_BODEN,THREE.LinearSRGBColorSpace),roughness:1,metalness:0}));
bench.rotation.x=-Math.PI/2;bench.position.y=FLOOR_Y;bench.receiveShadow=true;scene.add(bench);
const grid=new THREE.GridHelper(4.5,18,0x241b10,0x130d07);grid.position.y=FLOOR_Y+0.001;grid.material.opacity=0.26;grid.material.transparent=true;scene.add(grid);

// ── Licht ── DIE SONNE DER WELT: EIN Richtlicht, Farbe und Stärke setzt die Bühne der Welt, seine Richtung die der Sonne; es wirft
// den Schatten (die Karte rahmt die Waffe über der Werkbank)
const sonne=BUEHNE.sonne;
sonne.shadow.mapSize.set(2048,2048);sonne.shadow.bias=-0.00018;Object.assign(sonne.shadow.camera,{left:-1.3,right:1.3,top:1.3,bottom:-1.3,near:0.5,far:9});
BUEHNE.sonneUeber(0,LIFT,0);

// DIE KUGEL DES BLICKS (die Hülle, `AnazhHuelle.kugel` — dieselbe Gestalt wie die OrbitControls der terrain-Familie)
const controls=AnazhHuelle.kugel(cam,R.domElement);controls.enableDamping=true;controls.dampingFactor=0.08;
controls.target.set(0,0.30,0);controls.minDistance=0.5;controls.maxDistance=4.5;controls.maxPolarAngle=Math.PI*0.95;controls.update();
// ════════════════════════════════════════════════════════════════════
// DER KERN-ANSCHLUSS (W-A4a, Studio-Vertrag §7): die generative Substanz (Schnitt-
// Gesetz · Haut/Loft · Ausstattung · Schlagköpfe · Bogen · Rückgrat · Lehren ·
// Gattungen/Traditionen · Aufgaben-Gesetze · Materialien) lebt in
// ../../schmiede-core.js (__schmiedeCore, VOR diesem Skript geladen) — EINE Quelle
// für Shell UND AnazhRealm-Foundry (kein Nachbau; Split-Parität 21/21 hash-bewiesen).
// Die Shell behält Szene/UI/Overlays/Harmonik/Prüfstand und LIEST den Kern.
// ════════════════════════════════════════════════════════════════════
const SC=window.__schmiedeCore;
const M=SC.materials();   // die geteilten Materialien (byte-treu im Kern; nie disposen)
const {box,cyl,B,sectionAt,sectionMoments,curveY,RHO,MAT,metallRho,hnoise,
       buildPommel,buildGuard,buildGrip,buildHaft,buildHead,buildBogen,
       stations,measure,evalLehren,befund,
       PARAMS_BLADE,PARAMS_IMPACT,GATTUNGEN,TRADITIONEN,snapBases,shapeByTradition,
       ZIELMAT,tradWerkstoff,applyTask,griffD,intentControl}=SC;
const buildWeaponModel=(name)=>SC.buildWeaponModel(name);   // Kern-Tradition folgt via SC.setTradition
const loftBlade=(P,S)=>SC.loftBlade(P,S,bladeMat);          // NAHT: der Stahl/Roh-Umschalter bleibt Shell-Zustand
let bladeMat=M.steel; // umschaltbar Stahl/Roh

// ── Geometrie-Helfer (wie B/C in der Karosseriebasis) ──
// box/cyl/B leben im Kern (__schmiedeCore, oben aliast) — dot/seg/polyline/ringMesh/tube/label/caliper bleiben Shell (Overlays).
function dot(p,m,r){const e=new THREE.Mesh(new THREE.SphereGeometry(r||0.008,16,12),m);e.position.set(p[0],p[1],p[2]);return e;}
function seg(a,b,m){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);return new THREE.Line(g,m);}
function polyline(pts,m){const g=new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(...p)));return new THREE.Line(g,m);}
function ringMesh(rad,tube,m){const e=new THREE.Mesh(new THREE.TorusGeometry(rad,tube||0.004,10,32),m);return e;}
// Achs-Zylinder (a→b), beliebige Richtung
function tube(a,b,r,m,seg){const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b);const d=new THREE.Vector3().subVectors(Bv,A);const len=d.length();
  const e=cyl(r,r,len,m,seg||16);e.position.copy(A).addScaledVector(d,0.5);e.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());return e;}

// ── Text-Label als Sprite (für Maßlinien & Stationen) ──
function label(text,hex,scale){scale=scale||0.05;
  const fs=44,pad=10;const cv=document.createElement('canvas');const cx=cv.getContext('2d');
  cx.font='600 '+fs+'px ui-monospace,Menlo,monospace';const w=cx.measureText(text).width;
  cv.width=w+pad*2;cv.height=fs+pad*2;cx.font='600 '+fs+'px ui-monospace,Menlo,monospace';
  cx.fillStyle='rgba(10,7,5,.80)';const rr=11;cx.beginPath();
  cx.moveTo(rr,0);cx.arcTo(cv.width,0,cv.width,cv.height,rr);cx.arcTo(cv.width,cv.height,0,cv.height,rr);
  cx.arcTo(0,cv.height,0,0,rr);cx.arcTo(0,0,cv.width,0,rr);cx.fill();
  cx.fillStyle=hex;cx.textBaseline='middle';cx.fillText(text,pad,cv.height/2+2);
  const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));
  sp.scale.set(cv.width/cv.height*scale,scale,1);sp.renderOrder=999;return sp;}
// Maßlinie (Caliper): Linie a→b mit End-Häkchen + Label  (analog buildCalipers)
function caliper(a,b,hex,text){const g=new THREE.Group();
  const lm=new THREE.LineBasicMaterial({color:hex,transparent:true,opacity:0.85});
  g.add(seg(a,b,lm));
  const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),up=new THREE.Vector3(0,0.012,0);
  g.add(seg([a[0],a[1]-0.012,a[2]],[a[0],a[1]+0.012,a[2]],lm));
  g.add(seg([b[0],b[1]-0.012,b[2]],[b[0],b[1]+0.012,b[2]],lm));
  const mid=A.clone().add(Bv).multiplyScalar(0.5);
  const lb=label(text,'#'+hex.toString(16).padStart(6,'0'),0.046);lb.position.set(mid.x,mid.y+0.045,mid.z);g.add(lb);
  return g;}

// DAS GESETZ · DER QUERSCHNITT (halfH/sectionAt/sectionMoments/curveY/RHO) — lebt im Kern (__schmiedeCore).

// LOFT + DIE HAUT (hnoise/pbrHaut/stahlHaut/loftBlade) — lebt im Kern (__schmiedeCore; loftBlade oben als
// Alias mit dem Shell-bladeMat verdrahtet).

// AUSSTATTUNG (latheX/accentMat/wrapMat/buildPommel/buildGuard/buildGrip) — lebt im Kern (__schmiedeCore).

// SCHLAGKÖPFE-Basis (holzHaut/woodColors/buildHaft/latheZ/spikeZ) — lebt im Kern (__schmiedeCore).

// GESCHMIEDETES BLATT (bitField/forgeBit/leafFlange) + BOGEN (buildBogen) — leben im Kern (__schmiedeCore).

// ════════════════════════════════════════════════════════════════════
// PRÜFSTAND — die Gestalten der Arena (Pell, Ziele, Geräte, Hof) leben im Kern (__schmiedeCore, w4-arena-welt: ARENA_ARTEN ·
// buildInstance), der Pfeil ebenso; die Shell trägt nur die Stoffe ihrer Lehr-Ebenen und Treffer-Male (matCol).
// ════════════════════════════════════════════════════════════════════
function matCol(hex,rough,metal){const m=new THREE.MeshStandardMaterial({color:hex,roughness:rough!=null?rough:0.8,metalness:metal||0});if(m.color)m.color._metal=metal||0;return m;}
// — Pfeil: lebt im Kern (__schmiedeCore.buildPfeil, Welle LF 09.10.) — DIESELBE Gestalt fliegt in der Welt; die Albedo
//   trägt der Vertex (FARB-GESETZ), der eigene Bau der Shell (matCol-Farben) fiel. —
const buildPfeil=()=>SC.buildPfeil();
// chiselZ · grabeBlatt · buildHead (Axt/Hammer/Sledge/Kolben/Pick/Grabeblatt/Keule) — leben im Kern (__schmiedeCore).

// 2 · DAS RÜCKGRAT — stations(P) lebt im Kern (__schmiedeCore).

// 1 · DIE LEHREN — bladeBeta · headModel · measure (alles INTEGRIERT aus der Geometrie) — leben im Kern (__schmiedeCore).

// BANDS (Bänder je Absicht) · bandFor · LEHREN-Tafel · evalLehren · befund — leben im Kern (__schmiedeCore).

// ════════════════════════════════════════════════════════════════════
// RÜCKGRAT-Zeichnung (Mittellinie + Stationen)
// ════════════════════════════════════════════════════════════════════
function buildSpine(P){const g=new THREE.Group();const S=stations(P);
  const lm=new THREE.LineBasicMaterial({color:0xe7c887,transparent:true,opacity:0.8});
  // Mittellinie (folgt Krümmung im Klingenteil)
  const pts=[[S.xButt,0,0]];
  if(!S.impact){for(let i=0;i<=24;i++){const s=i/24;pts.push([S.xBlade0+s*P.klinge,curveY(s,P),0]);}}
  else pts.push([S.xTip,0,0]);
  g.add(polyline(pts,lm));
  const stns = S.impact
    ? [['KNAUF',S.xButt],['GRIFF',S.xGripEnd*0.5],['KOPF',S.xHead0],['SPITZE',S.xTip]]
    : [['KNAUF',S.xButt],['GRIFF',S.xGripEnd*0.5],['PARIER',S.xGuard],['KLINGE',(S.xBlade0+S.xPoint)/2],['SPITZE',S.xPoint]];
  for(const [nm,xx] of stns){const yy=(!S.impact&&xx>=S.xBlade0)?curveY((xx-S.xBlade0)/P.klinge,P):0;
    g.add(dot([xx,yy,0],M.bone,0.009));
    const lb=label(nm,'#cdb38a',0.04);lb.position.set(xx,yy+0.05,0);g.add(lb);}
  return g;}

// ════════════════════════════════════════════════════════════════════
// 3 · GELENKE / dynamische Lehren — Hand · Balance · Schlagpunkt(Knoten)
//   Maßlinien (Caliper) machen die Zahlen am Körper sichtbar (analog Karosserie).
// ════════════════════════════════════════════════════════════════════
function buildLehrenOverlay(P,m){const g=new THREE.Group();const S=m.S;const yb=0.075;
  const yAt=x=>(!S.impact&&x>=S.xBlade0)?curveY((x-S.xBlade0)/P.klinge,P):0;
  // Hand (Drehpunkt) — Ring um den Griff
  const hand=new THREE.Mesh(new THREE.TorusGeometry(0.02,0.0035,10,28),M.hand);hand.rotation.y=Math.PI/2;hand.position.set(S.pivot,0,0);g.add(hand);
  g.add(label('HAND · Drehpunkt','#66a8ff',0.044).translateX(0));const hl=label('HAND · Drehpunkt','#66a8ff',0.042);hl.position.set(S.pivot,-0.055,0);g.add(hl);
  // Balance-Punkt
  g.add(dot([m.xcm,yAt(m.xcm),0],M.bal,0.013));
  const bl=label('BALANCE','#7fc98a',0.044);bl.position.set(m.xcm,yAt(m.xcm)+0.06,0);g.add(bl);
  g.add(caliper([S.pivot,yb,0.02],[m.xcm,yb,0.02],0x7fc98a,(Math.abs(m.xcm-S.pivot)*1000|0)+' mm  PoB'));
  // Schlagpunkt / harmonischer Knoten (CoP) — falls auf der Klinge
  if(m.xcop>S.xBlade0 && m.xcop<S.xTip+0.05){
    g.add(dot([Math.min(m.xcop,S.xTip),yAt(Math.min(m.xcop,S.xTip)),0],M.node,0.013));
    const nl=label('SCHLAGPUNKT · Knoten','#ff9a3c',0.044);nl.position.set(Math.min(m.xcop,S.xTip),yAt(Math.min(m.xcop,S.xTip))+0.06,0);g.add(nl);
    g.add(caliper([S.pivot,-yb,-0.02],[Math.min(m.xcop,S.xTip),-yb,-0.02],0xff9a3c,(Math.abs(m.xcop-S.pivot)*1000|0)+' mm  Stoßzentrum'));
  }
  return g;}

// ════════════════════════════════════════════════════════════════════
// SCHNITT-KARTE (das Organ) — reales Profil an der Fehlschärfe (forte),
//   vergrößert über der Klinge, mit neutralen Achsen + I-Träger-Beschriftung.
// ════════════════════════════════════════════════════════════════════
function buildSectionCard(P){const g=new THREE.Group();const S=stations(P);if(S.impact)return g;
  const t=0.18, poly=sectionAt(t,P), sc=4.2;                 // forte
  const shape=new THREE.Shape();poly.forEach((p,i)=>{const z=p[0]*sc,y=p[1]*sc;i?shape.lineTo(z,y):shape.moveTo(z,y);});shape.closePath();
  const geo=new THREE.ShapeGeometry(shape);const face=new THREE.Mesh(geo,M.cardFill);
  const px=S.xBlade0+0.12, py=0.30, pz=0;
  face.position.set(px,py,pz);face.castShadow=false;g.add(face);
  // Kontur (Glanz)
  const ept=poly.map(p=>new THREE.Vector3(px+p[0]*sc,py+p[1]*sc,pz+0.001));ept.push(ept[0].clone());
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ept),new THREE.LineBasicMaterial({color:0xe7c887})));
  // neutrale Achsen
  const hw=P.w0/2*sc, ht=P.th0/2*sc;
  g.add(seg([px-hw*1.1,py,pz+0.002],[px+hw*1.1,py,pz+0.002],new THREE.LineBasicMaterial({color:0x66a8ff,transparent:true,opacity:0.7})));
  g.add(seg([px,py-ht*2.6,pz+0.002],[px,py+ht*2.6,pz+0.002],new THREE.LineBasicMaterial({color:0x66a8ff,transparent:true,opacity:0.5})));
  const cap=label('SCHNITT @ forte  ·  '+(P.fuller>0?'Hohlkehle = I-Träger':'voll'),'#cdb38a',0.05);cap.position.set(px,py+ht*2.8+0.02,pz);g.add(cap);
  const cap2=label((P.w0*1000|0)+'×'+(P.th0*1000|0)+' mm  ·  '+P.fam,'#8c7d6b',0.04);cap2.position.set(px,py-ht*2.8-0.02,pz);g.add(cap2);
  if(P.fuller>0){const fl=label('Steg (Hohlkehle)','#ff9a3c',0.034);fl.position.set(px,py+0.005,pz+0.01);g.add(fl);
    for(const sx of[-1,1]){const efl=label('Flansch','#7fc98a',0.032);efl.position.set(px+sx*hw*0.8,py,pz);g.add(efl);}}
  return g;}

// ════════════════════════════════════════════════════════════════════
// MASSE-STREIFEN (die verborgene Wahrheit) — λ(x) als Linie unter der Waffe
// ════════════════════════════════════════════════════════════════════
function buildMassStrip(P){const g=new THREE.Group();const S=stations(P);const y0=-0.16, sc=0.9, rhoM=metallRho(P);
  // λ(x) abtasten
  const N=120, xs=[], lam=[];let lmax=1e-9;
  function lambdaAt(x){
    if(!S.impact){
      if(x>=S.xBlade0 && x<=S.xPoint){const t=(x-S.xBlade0)/P.klinge;return rhoM*sectionMoments(sectionAt(t,P)).A;}
      if(x>=S.xGuard-S.gThk && x<=S.xGuard+S.gThk)return rhoM*(P.parier*2*0.010*0.016)/(2*S.gThk);
      if(x>=S.xGrip0 && x<=S.xGripEnd)return RHO.griff*Math.PI*0.013*0.013;
      if(x<S.xGrip0+0.01)return MAT.bronze.rho*(4/3)*Math.PI*Math.pow(P.knaufR,3)*0.72/0.04;
      return 0;
    } else {
      if(x>=S.xHead0)return (P.kopfTyp==='keule'?RHO.holz:rhoM)*Math.PI*P.socketR*P.socketR*0.55;
      if(x>=S.xGrip0)return RHO.holz*Math.PI*P.schaftR*P.schaftR;
      return 0;
    }}
  for(let i=0;i<=N;i++){const x=S.xButt+i/N*S.L;const l=lambdaAt(x);xs.push(x);lam.push(l);if(l>lmax)lmax=l;}
  const top=[];for(let i=0;i<=N;i++)top.push(new THREE.Vector3(xs[i],y0-lam[i]/lmax*0.09*sc,0));
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(top),new THREE.LineBasicMaterial({color:0x8a93a0})));
  // Füllung (Dreiecksband zur Grundlinie)
  const verts=[],idx=[];for(let i=0;i<=N;i++){verts.push(xs[i],y0,0, xs[i],y0-lam[i]/lmax*0.09*sc,0);}
  for(let i=0;i<N;i++){const a=i*2;idx.push(a,a+1,a+2,a+2,a+1,a+3);}
  const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));fg.setIndex(idx);
  g.add(new THREE.Mesh(fg,M.mass));
  // Schwerpunkt-Marke auf der Grundlinie
  const m=measure(P);g.add(dot([m.xcm,y0,0],M.bal,0.008));
  const lb=label('λ(x) · Schwerpunkt','#8a93a0',0.04);lb.position.set(m.xcm,y0-0.105,0);g.add(lb);
  return g;}

// ════════════════════════════════════════════════════════════════════
// ZUSTAND · GATTUNGEN · TRADITIONEN · REGLER
// ════════════════════════════════════════════════════════════════════
const P={
  modus:'klinge', intent:'hieb',
  klinge:0.95, w0:0.045, wTip:0.30, th0:0.0065, thTip:0.40, fam:'sechs', flat:0.42, single:false,
  fuller:0.55, fullerW:0.6, kruemmung:0.0, _kBase:0.0,
  griff:0.24, knaufR:0.021, knaufFill:0.72, parier:0.11,
  // Schaft & Kopf (Wucht)
  schaft:0.58, schaftR:0.016, kopfTyp:'kolben', kopfLen:0.12, socketR:0.022, beta:30, reach:0.052, edgeLen:0.10, flangeN:6, flangeLen:0.085, backSpike:false, beak:false, kopfAccent:'schwarzstahl',
};
// — Regler-Tabellen (PARAMS_BLADE/PARAMS_IMPACT, mit Gesetz) — leben im Kern (__schmiedeCore; B4 PARAMS mit def).
// GATTUNGEN · TRADITIONEN · snapBases · shapeByTradition — leben im Kern (__schmiedeCore).

// DIE AUFGABEN-GESETZE (ZIELMAT/WERKSTOFF/MAT/ANTHROPOS · betaFromMechanik · ableitenKeil/
// Pick/Graben/Klinge/Bogen · applyTask · hamonGesetz/edgeBeta/kantenLast) — leben im Kern (__schmiedeCore).
let currentTrad=TRADITIONEN.Frank, currentGattung='Langschwert';
SC.setTradition(currentTrad);   // Kern-Zustand spiegeln (measure liest die Tradition für die Gehilz-Masse)

// DIE BÜHNE STEHT IM STAHL (studios.K4, Labor = Welt — wie die Garage seit 02.11.): die Wurzel `weapon` zeigt das Werk, das „In der
// Welt ansehen" trägt; Schnitt-Karte, Lehren-Marken, Rückgrat und Maß-Streifen sind die Anatomie-Ansicht auf Knopfdruck (die Welt
// trägt keine). Bis hier standen Schnitt-Karte und Lehren-Marken als Meshes IN der Wurzel: ihre Box 0,433 m hoch gegen die Klinge
// der Welt 0,244 m (Tafel K4, Langschwert) — die Bühne rahmte ein anderes Ding als die Welt.
const show={spine:false,section:false,lehren:false,mass:false,steel:true};
let gSpine,gSection,gLehren,gMass,gWeapon,gBladeMesh;
const weapon=new THREE.Group();weapon.position.y=0.30;scene.add(weapon);

// Ein Sprite besitzt nur Stoff und Bild — seine Geometrie ist das EINE Quad, das three allen Sprites teilt (Garage 19.10.: r184
// behält den zerstörten Puffer am InterleavedBuffer, jedes spätere Schild zeichnete aus ihm).
function clear(g){if(!g)return;if(g.parent)g.parent.remove(g);g.traverse(o=>{if(o.geometry&&!o.isSprite)o.geometry.dispose();
  if(o.isSprite&&o.material){if(o.material.map)o.material.map.dispose();o.material.dispose();}});}

function rebuild(){
  clear(gSpine);clear(gSection);clear(gLehren);clear(gMass);clear(gWeapon);
  if(P.modus==='wucht') P.schaftR=griffD(intentControl(P))*0.5;          // Schaftradius aus dem Greifer-Kontakt abgeleitet
  if(P.modus==='bogen'){
    gWeapon=new THREE.Group(); gWeapon.add(buildBogen(P,M.wood)); gWeapon.visible=show.steel; weapon.add(gWeapon);
    gSpine=new THREE.Group();gSection=new THREE.Group();gLehren=new THREE.Group();gMass=new THREE.Group();
    weapon.position.set(-((P.riserLen||0.13)+2*(P.limbLen||0.6))/2, 0.30, 0);
    renderBogenTafel(P); kostenLeiste.neu(); return;
  }
  const S=stations(P), m=measure(P), res=evalLehren(P);
  // — STAHL (die Haut) —
  gWeapon=new THREE.Group();gBladeMesh=null;
  if(!S.impact){
    gBladeMesh=loftBlade(P,S);gWeapon.add(gBladeMesh);
    gWeapon.add(buildGuard(P,S,currentTrad));
    gWeapon.add(buildGrip(P,S,currentTrad));
    gWeapon.add(buildPommel(P,S,currentTrad));
  } else {
    gWeapon.add(buildHaft(P,S));
    gWeapon.add(buildHead(P,S));
  }
  gWeapon.visible=show.steel;weapon.add(gWeapon);
  // — Hilfs-Ebenen —
  gSpine=buildSpine(P);gSpine.visible=show.spine;weapon.add(gSpine);
  gSection=buildSectionCard(P);gSection.visible=show.section&&!S.impact;weapon.add(gSection);
  gLehren=buildLehrenOverlay(P,m);gLehren.visible=show.lehren;weapon.add(gLehren);
  gMass=buildMassStrip(P);gMass.visible=show.mass;weapon.add(gMass);
  // — zentrieren & auf Augenhöhe heben —
  weapon.position.set(-S.L/2,0.30,0);
  renderTafel(res,m);
  kostenLeiste.neu();
}
// — Lehren-Tafel rendern —
function pct(v,band){const lo=band[0],hi=band[1],pad=(hi-lo)*0.8;const a=lo-pad,b=hi+pad;return Math.max(2,Math.min(98,(v-a)/(b-a)*100));}
const INTENT_LAB={hieb:'HIEB',stich:'STICH',schlag:'SCHLAG',spalten:'SPALTEN',nutz:'NUTZ'};
function renderTafel(res,m){const list=document.getElementById('lrlist');let html='',ok=0,tot=0;
  for(const{L,v,st,band}of res){
    if(st==='na'){html+='<div class="lr na"><div class="lr-h"><span class="lr-lab">'+L.lab+'</span><span class="lr-val">—</span></div><div class="lr-hint">'+L.hint+'</div></div>';continue;}
    tot++;if(st==='pass')ok++;
    const p=pct(v,band),lo=pct(band[0],band),hi=pct(band[1],band);
    const vtxt=(L.id==='Inorm'||L.id==='mEff')?v.toFixed(3):v.toFixed(2);
    html+='<div class="lr '+st+'"><div class="lr-h"><span class="lr-lab">'+L.lab+'</span><span class="lr-val">'+vtxt+L.unit+'</span></div>'
      +'<div class="lr-bar"><div class="lr-band" style="left:'+lo+'%;width:'+(hi-lo)+'%"></div><div class="lr-mark" style="left:'+p+'%"></div></div>'
      +'<div class="lr-hint">'+L.hint+'</div></div>';}
  list.innerHTML=html;
  document.getElementById('score').innerHTML='<b>'+ok+'</b> / '+tot+' in Toleranz';
  const f=m.f1>0?(' · Grundton ~'+(m.f1|0)+' Hz (flach)'):'';
  const bf=befund(P,m);const bc=bf.v==='KRIEGSWAFFE'?'#e0664a':(bf.v==='WERKZEUG'?'#7fc98a':'#e8b54a');
  document.getElementById('intentline').innerHTML=
    '<span style="color:'+bc+';font-weight:700;letter-spacing:.04em">BEFUND · '+bf.v+'</span>'
    +'<span style="opacity:.65"> — Absicht '+INTENT_LAB[P.intent]+' · '+m.M.toFixed(2)+' kg'+f+'</span>'
    +'<div style="font-size:9px;color:#8a7a5a;margin-top:4px;line-height:1.45">'+bf.reg.join(' · ')+'</div>';
}
function renderBogenTafel(P){
  document.getElementById('intentline').innerHTML=
    '<span style="color:#8ab4e8;font-weight:700;letter-spacing:.04em">BEFUND · BOGEN</span>'
    +'<span style="opacity:.65"> — Zugkraft '+Math.round(P.zugN)+' N · Pfeilenergie '+Math.round(P.energie)+' J</span>'
    +'<div style="font-size:9px;color:#8a7a5a;margin-top:4px;line-height:1.45">Wurfarm '+((P.limbLen*100)|0)+' cm · Recurve '+(P.recurve||0).toFixed(2)+' · '+(P.bogenMat||'holz')+' · Breite '+((P.wBase*1000)|0)+' mm</div>';
  document.getElementById('lrlist').innerHTML=
    '<div class="lr na"><div class="lr-h"><span class="lr-lab">ZUGKRAFT (Ziel)</span><span class="lr-val">'+Math.round(P.zugN)+' N</span></div><div class="lr-hint">Breite des Wurfarms aus Zugkraft ÷ Steifigkeit gewählt</div></div>'
    +'<div class="lr na"><div class="lr-h"><span class="lr-lab">GESPEICHERT → PFEIL</span><span class="lr-val">'+Math.round(P.stored||0)+' → '+Math.round(P.energie)+' J</span></div><div class="lr-hint">½·F·Auszug·Kurve, dann ×η='+((P.eta||0).toFixed(2))+' — echte SI-Joule, gegen 114 J geeicht</div></div>'
    +'<div class="lr na"><div class="lr-h"><span class="lr-lab">RECURVE</span><span class="lr-val">'+(P.recurve||0).toFixed(2)+'</span></div><div class="lr-hint">emergiert: kurzer Auszug / dehnbares Material speichert Energie früh</div></div>';
  document.getElementById('score').innerHTML='<b>Bogen</b> · Balkentheorie';
}

// ════════════════════════════════════════════════════════════════════
// UI
// ════════════════════════════════════════════════════════════════════
// Die Hülle (K41): die Sitzung trägt jede Tat (Regler-Zug, Gattung, Tradition, Zurücksetzen) als EINEN Rückgängig-
// Schritt über P samt Gattung und Tradition; der Regler-Generator liest PARAMS_BLADE bzw. PARAMS_IMPACT (je modus) und
// schreibt P in place, ein Aufbau je Bild.
const tradName=T=>Object.keys(TRADITIONEN).find(k=>TRADITIONEN[k]===T)||'Frank';
let basisP=null;   // P nach dem letzten Gattungs-/Traditions-Zug — das Ziel von „Zurücksetzen“
// (markiert: ob die Gattung noch leuchtet — ein Regler-Zug löscht die Marke, sein Rückgängig stellt sie wieder her)
const sitz=AnazhHuelle.sitzung({werte:P,zustand:()=>({gattung:currentGattung,trad:tradName(currentTrad),markiert:!!pdiv.querySelector('button.on')}),
  zustandSetzen:z=>{currentGattung=z.gattung;currentTrad=TRADITIONEN[z.trad]||currentTrad;SC.setTradition(currentTrad);
    [...pdiv.querySelectorAll('button')].forEach(c=>c.classList.toggle('on',z.markiert&&c.textContent===currentGattung));
    [...tdiv.children].forEach(c=>c.classList.toggle('on',c.textContent===z.trad));},
  anwenden:()=>{buildSliders();rebuild();}});
sitz.leiste(document.getElementById('sitzung'),{seed:false});
const sdiv=document.getElementById('sliders');let regler=null;
function buildSliders(){
  regler=AnazhHuelle.regler(sdiv,(P.modus==='wucht')?PARAMS_IMPACT:PARAMS_BLADE,{werte:P,ruheMs:0,sitzung:sitz,
    basis:()=>basisP,
    bei:()=>[...pdiv.querySelectorAll('button')].forEach(c=>c.classList.remove('on')),
    nachRuhe:(ids,bau)=>{if(bau)rebuild();}});
}
// Die Kosten-Leiste: die WELT-Gestalt (buildInstance des Kerns: Gattung × Tradition + die B4-Regler als ov) gegen die
// Budget-Zeile je Stufe.
const rezeptDerGattung=()=>Object.keys(SC.PRESETS).find(id=>SC.PRESETS[id].lab===currentGattung);
const kostenLeiste=AnazhHuelle.kosten(document.getElementById('kosten'),{budget:SC.PORTAL_RENDER_CONFIG.lod.budget.weapon,
  stufen:SC.PORTAL_RENDER_CONFIG.lod.kindStages.weapon,renderer:R,
  bauen:s=>{const ov={__tradition:tradName(currentTrad)};(regler?regler.zeilen:[]).forEach(z=>{ov[z.id]=P[z.id];});
    return SC.buildInstance(rezeptDerGattung(),1,s,ov);},
  quelle:'gemessen an der Welt-Gestalt (schmiede-core buildInstance: Gattung × Tradition + Regler als ov)'});
// Gattungen
const pdiv=document.getElementById('presets');
function gattLabel(t){const d=document.createElement('div');d.className='sec-t';d.style.cssText='flex:1 1 100%;margin-top:4px';d.textContent=t;return d;}
{let lastTool=null;const names=Object.keys(GATTUNGEN).sort((a,b)=>(GATTUNGEN[a].tool?1:0)-(GATTUNGEN[b].tool?1:0));
 for(const name of names){const isTool=!!GATTUNGEN[name].tool;
   if(isTool!==lastTool){pdiv.appendChild(gattLabel(isTool?'WERKZEUGE':'WAFFEN'));lastTool=isTool;}
   const b=document.createElement('button');b.className='btn'+(isTool?' tool':'');b.textContent=name;
   if(name===currentGattung)b.classList.add('on');
   b.onclick=()=>sitz.schritt(()=>{gattungWaehlen(name);
     [...pdiv.querySelectorAll('button')].forEach(c=>c.classList.remove('on'));b.classList.add('on');
     buildSliders();rebuild();});
   pdiv.appendChild(b);}}
// DIE GATTUNGS-WAHL (halten.K1 Staffel 2, EIN Weg für Knopf, Arena und Start): P aus dem Gesetz der Gattung (GATTUNGEN, die Aufgabe ×
// Kultur-Metall der Tradition) — derselbe Weg wie die Welt (schmiede-core prepP → kampfMasze). Vorher begann das Labor auf einem
// Hand-Literal P, das nie durch die Gattung ging: das Langschwert des Start-Bilds wog 1,3802 statt 1,3869 kg, Fase 19,64° statt 18,72°.
function gattungWaehlen(name){delete P.guardOverride;P.backSpike=false;P.beak=false;delete P.task;delete P.cheekMul;delete P.pickLen;
  Object.assign(P,GATTUNGEN[name]);if(!P.task)snapBases(P);currentGattung=name;applyTrad(currentTrad,false);}
// Traditionen
const tdiv=document.getElementById('trads');
function applyTrad(T,doRebuild){currentTrad=T;SC.setTradition(T);
  if(P.task){ P.task.werkstoff=tradWerkstoff(T); applyTask(P); snapBases(P); }   // Kopf neu aus Aufgabe × Kultur-Metall ableiten (β/Wange/Masse)
  shapeByTradition(P,T);basisP=Object.assign({},P);
  if(doRebuild)rebuild();}
for(const tn in TRADITIONEN){const b=document.createElement('button');b.className='btn';b.textContent=tn;
  if(TRADITIONEN[tn]===currentTrad)b.classList.add('on');
  b.onclick=()=>{[...tdiv.children].forEach(c=>c.classList.remove('on'));b.classList.add('on');sitz.schritt(()=>applyTrad(TRADITIONEN[tn],true));};
  tdiv.appendChild(b);}
// Ebenen
const ldiv=document.getElementById('layers');
const LY=[['spine','Rückgrat'],['section','Schnitt'],['lehren','Lehren'],['mass','Masse'],['steel','Stahl']];
LY.forEach(([key,lab])=>{const b=document.createElement('button');b.className='btn'+(show[key]?' on':'');b.textContent=lab;
  b.onclick=()=>{show[key]=!show[key];b.classList.toggle('on');applyVis();};ldiv.appendChild(b);});
function applyVis(){const imp=P.modus==='wucht';
  if(gSpine)gSpine.visible=show.spine;if(gSection)gSection.visible=show.section&&!imp;
  if(gLehren)gLehren.visible=show.lehren;if(gMass)gMass.visible=show.mass;if(gWeapon)gWeapon.visible=show.steel;}
// Stahl/Roh + Schnitt-Karte
document.getElementById('finish').onclick=function(){bladeMat=(bladeMat===M.steel)?M.steelRaw:M.steel;this.classList.toggle('on');rebuild();};
const schliffB=document.getElementById('schliff');schliffB.onclick=()=>{show.section=!show.section;schliffB.classList.toggle('on',show.section);applyVis();};

// ════════════════════════════════════════════════════════════════════
// HARMONIK — die Klinge anschlagen: Grundmodus mit Knoten an Hand & Schlagpunkt
//   y(x,t)=A·φ(x)·sin(ωt)·e^{-t/τ}, φ kubisch mit Nullstellen bei x1=Hand, x2=CoP.
//   Der Knoten bleibt STILL → man SIEHT den Sweet-Spot (wie beim Anschlagen).
// ════════════════════════════════════════════════════════════════════
let ring={active:false,t0:0,phiMax:1,x1:0,x2:0,xTip:1,f1:0};
function modeRaw(x){const x3=ring.xTip+(ring.xTip-ring.x2)*0.6;return (x-ring.x1)*(x-ring.x2)*(x-x3);}
document.getElementById('ring').onclick=triggerRing;
function triggerRing(){if(P.modus!=='klinge'||!gBladeMesh)return;const m=measure(P),S=m.S;
  ring.x1=S.pivot;ring.x2=Math.min(m.xcop,S.xPoint*0.98);ring.xTip=S.xPoint;ring.f1=m.f1;
  let mx=1e-9;for(let s=0;s<=40;s++){const x=S.xBlade0+s/40*P.klinge;mx=Math.max(mx,Math.abs(modeRaw(x)));}ring.phiMax=mx;
  ring.active=true;ring.t0=clock.getElapsedTime();
  const info=document.getElementById('ring-info');info.style.display='block';
  document.getElementById('ring-txt').innerHTML='Grundton <b>~'+(m.f1|0)+' Hz</b> (flach) · der <b>Knoten</b> steht still — das ist der Schlagpunkt. <span style="opacity:.6">(verlangsamt dargestellt)</span>';}

// ════════════════════════════════════════════════════════════════════
// PRÜFSTAND — EGO, ANATOMISCH GEFÜHRT.
//   Kopf–Schulter–Arm als echte Kette: Schulter ~16cm unter dem Auge & ~18cm seitlich,
//   gebeugter Arm (~45cm) trägt die Hand → das Schwert sitzt, wo deine Hand wäre.
//   NAHKAMPF: linke Maus HALTEN = die Maus führt den Arm (Schwung um die SCHULTER, gemessene Trägheit) = Schnitt.
//             rechte Maus = Stich (Arm stößt vor). BOGEN: linke Maus = ans Auge heben, rechte = spannen, loslassen = Schuss.
//   H = Hand. Pfeile stecken & sammeln sich. Klinge zieht Spuren.
// ════════════════════════════════════════════════════════════════════
// die Bogen-Physik (Masse des Pfeils) und die Schwere lesen den Kern (SC.ARENA.bogen · SC.GERAET_GESETZ) — ein Wert, eine Stelle
const ARENA={ mArrow:SC.ARENA.bogen.mArrow, g:SC.GERAET_GESETZ.schwere, sens:0.0022, eyeY:1.62, walk:2.8 };
// Anthropometrie im Kamera-Raum (Auge=0, vorne=−Z, rechts=+X, hoch=+Y) — durchschnittlicher Erwachsener
const ANTHRO={ shoulder:[0.19,-0.16,-0.02], elbow:[0.21,-0.42,-0.18], grip:[0.10,-0.40,-0.48] };
const arena={ active:false, kind:null, group:null, vm:null, arm:null, vmWeapon:null, dummy:null, target:null,
  arrows:[], stuck:[], drawFrac:0, drawing:false, _builtFrac:-1, raise:0, holdT:0, sway:0, recoil:0, locked:false, right:true,
  player:new THREE.Vector3(0,0,0), yaw:0, pitch:0, bob:0, keys:{w:0,a:0,s:0,d:0},
  swinging:false, thrusting:false, holdView:false, ready:0, twoH:false, gripLen:0.2, sw:{yaw:0,pitch:0,reach:0}, cooldown:0, prevTip:null, bladeL:0.9,
  baseQuat:new THREE.Quaternion(), trail:{pts:[],mesh:null}, _mdx:0, _mdy:0, lastHit:null, lastShot:null, score:{shots:0,sum:0} };
const fx={ shake:0, kick:new THREE.Vector3(), kickV:new THREE.Vector3(), fov:75, fovT:75, freeze:0 };
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
const _AX=new THREE.Vector3(1,0,0), _Y=new THREE.Vector3(0,1,0), _X=new THREE.Vector3(1,0,0), _RC=new THREE.Raycaster();
const V=(a)=>new THREE.Vector3(a[0],a[1],a[2]);

// DER BODEN DES HOFS: Sand (der Belag der Welt, `belagO` sand) als Bühne des Labors — die Tönung aus dem Rausch des Kerns
// (hnoise), nie gewürfelt; die Streu-Kosmetik (Steine und Büschel aus dem Würfel des Browsers) und die Hof-Ringe fielen.
function buildGround(){const g=new THREE.Group();
  const geo=new THREE.PlaneGeometry(72,72,64,64),pa=geo.attributes.position,col=[];
  const lin=(h)=>new THREE.Color().setHex(h,THREE.LinearSRGBColorSpace);   // der Stoff der Bühne liest das Hex linear (wie r128; r184 dekodierte es: Sand Y 0,02–0,06 statt 0,16–0,26)
  const cD=lin(0x30281a),cM=lin(0x3e3424),cL=lin(0x4c412e);
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i);
    const n=hnoise(x*0.21,0,y*0.21)*0.45+hnoise(x*0.055,0,y*0.055)*0.55,t=clamp(n*0.5+0.5,0,1);
    const c=t<0.5?cD.clone().lerp(cM,t*2):cM.clone().lerp(cL,(t-0.5)*2);col.push(c.r,c.g,c.b);}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const disk=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.98,metalness:0}));
  disk.rotation.x=-Math.PI/2;disk.receiveShadow=true;g.add(disk);
  return g;}
function buildArenaWeapon(){const g=new THREE.Group();const S=stations(P);
  if(!S.impact){g.add(loftBlade(P,S));g.add(buildGuard(P,S,currentTrad));g.add(buildGrip(P,S,currentTrad));g.add(buildPommel(P,S,currentTrad));}
  else{if(P.modus==='wucht')P.schaftR=griffD(intentControl(P))*0.5;g.add(buildHaft(P,S));g.add(buildHead(P,S));}
  g.userData.S=S;return g;}
function orientBone(mesh,A,B){const dir=B.clone().sub(A);const len=Math.max(0.02,dir.length());dir.normalize();
  mesh.position.copy(A).addScaledVector(dir,len/2);mesh.quaternion.setFromUnitVectors(_Y,dir);mesh.scale.set(1,len,1);}

// — View-Model = die Arm-Kette, im Weltraum an die Kamera gerechnet, Drehpunkt SCHULTER —
function buildViewModel(){ if(arena.vm){clear(arena.vm);} arena.vm=new THREE.Group(); arena.group.add(arena.vm);
  const metal=matCol(0x6e4a2c,0.7,0),skin=matCol(0x7a5436,0.75,0);
  const mk=()=>{const h=new THREE.Mesh(new THREE.SphereGeometry(0.052,12,10),metal);h.scale.set(1.1,0.85,1.3);
    return {up:new THREE.Mesh(new THREE.CylinderGeometry(0.036,0.044,1,12),skin),el:new THREE.Mesh(new THREE.SphereGeometry(0.05,14,10),skin),fo:new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.04,1,12),skin),ha:h};};
  const Ah=mk(),Oh=mk();arena.vm.add(Ah.up,Ah.el,Ah.fo,Ah.ha,Oh.up,Oh.el,Oh.fo,Oh.ha);
  if(arena.kind==='bow'){P.drawFrac=arena.drawFrac;arena.vmWeapon=buildBogen(P,M.wood);arena.twoH=false;arena._mass=FEEL.massRef;}
  else{const S=stations(P);arena._stations=S;
    try{const mm=measure(P);arena._mass=mm.M;
      const IS=Math.max(0.02,(mm.Inorm||0.1)*mm.M*S.L*S.L),drag=1+Math.pow(IS/0.16,0.45)*0.45;         // DIESELBE Trägheit wie im Schwung (ein Modell)
      arena._windF=clamp((drag-1)/0.5,0.3,1);                                                          // Ausholbedarf ~ Drehimpuls-Ladung ~ Trägheit
    }catch(e){arena._mass=FEEL.massRef;arena._windF=1;}
    const gx=S.impact?(S.xGripEnd*0.55):(S.xGuard-0.03);                          // Führhand ans Gehilz (unteres Drittel bei Wucht)
    arena._gripXdom=gx;arena._gripXoff=(S.xGrip0||0)+0.05;arena._impact=S.impact;
    arena.bladeL=S.L-gx;                                                          // Hand->Spitze (NICHT Gesamtlänge!)
    arena._edge0=(S.impact?S.xHead0:S.xBlade0)-gx;                                // Schneide-Beginn relativ zur Hand
    arena._edge1=S.xPoint-gx;                                                     // Spitze relativ zur Hand
    arena.gripLen=Math.max(0.10,(S.xGrip0!=null&&S.xGripEnd!=null)?(S.xGripEnd-S.xGrip0):0.2);arena.twoH=arena.gripLen>0.17;arena.vmWeapon=buildArenaWeapon();}
  arena.vm.add(arena.vmWeapon);arena.arm=Ah;arena.armO=Oh;computeBaseQuat();
}
function computeBaseQuat(){const s=arena.right?1:-1;
  if(arena.kind==='bow'){const fwd=new THREE.Quaternion().setFromUnitVectors(_AX,new THREE.Vector3(0,0.02,-1).normalize());
    const cant=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-s*0.55);arena.baseQuat=fwd.multiply(cant);}      // Bogen leicht gekantet → Krümmung sichtbar
  else{ arena.idleQuat=new THREE.Quaternion().setFromUnitVectors(_AX,new THREE.Vector3(-s*0.20,0.48,-0.85).normalize());           // Ruhe: vorn-hoch
        arena.guardQuat=new THREE.Quaternion().setFromUnitVectors(_AX,new THREE.Vector3(-s*0.10,0.97,0.15).normalize());          // Hut (vom Tag): Klinge vertikal-hoch
        arena.baseQuat=arena.idleQuat.clone(); }
}
function camBasis(){const cy=Math.cos(arena.yaw),sy=Math.sin(arena.yaw),cp=Math.cos(arena.pitch),sp=Math.sin(arena.pitch);
  return {fwd:new THREE.Vector3(cy*cp,sp,sy*cp), fwdG:new THREE.Vector3(cy,0,sy), right:new THREE.Vector3(-sy,0,cy)};}          // FIX: rechts = (−sy,0,cy)

function mirX(a,s){return new THREE.Vector3(a[0]*s,a[1],a[2]);}
function placeViewModel(dt){if(!arena.vm)return;const s=arena.right?1:-1;cam.updateMatrixWorld(true);const A=arena.arm,S0z=new THREE.Vector3(0,0,0);
  if(arena.kind==='melee'){
    const rd=arena.ready;
    const yawQuat=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(S0z,new THREE.Vector3(Math.cos(arena.yaw),0,Math.sin(arena.yaw)),_Y));   // stabile Schulter (nur Yaw)
    const shL=mirX(ANTHRO.shoulder,s), shO=shL.clone().applyQuaternion(yawQuat);
    arena.vm.position.set(arena.player.x+shO.x,ARENA.eyeY-(arena._crouchY||0)+shO.y,arena.player.z+shO.z);
    if((arena.sw.reach||0)>0.001){const lf=new THREE.Vector3(Math.cos(arena.yaw)*Math.cos(arena.pitch),Math.sin(arena.pitch),Math.sin(arena.yaw)*Math.cos(arena.pitch));arena.vm.position.addScaledVector(lf,arena.sw.reach*0.72);}
    const lookPitch=arena.pitch*rd;                                                                   // FADEN: Klinge folgt dem Blick, sobald in Hut/Schwung -> reale Lage zum Ziel
    const cpL=Math.cos(lookPitch),spL=Math.sin(lookPitch);
    const lookFrame=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(S0z,new THREE.Vector3(Math.cos(arena.yaw)*cpL,spL,Math.sin(arena.yaw)*cpL),_Y));
    const layPitch=-(arena.swLay||0)*1.18;                                                            // vom Tag (auf) -> waagrecht durch die Schwungdrehung
    const reach=arena.sw.reach||0, thrustExt=clamp(reach/0.30,0,1);                                     // Stich-Streckung (vorgezogen)
    arena.vm.quaternion.copy(lookFrame).multiply(new THREE.Quaternion().setFromAxisAngle(_Y,arena.sw.yaw)).multiply(new THREE.Quaternion().setFromAxisAngle(_X,arena.sw.pitch));   // KEIN Fliehkraft-Pitch mehr → Schwenk bleibt waagrecht (kein U)
    arena.baseQuat=arena.idleQuat.clone().slerp(arena.guardQuat,rd);                                  // Ruhe->Hut
    const idleGrip=mirX(ANTHRO.grip,s).sub(shL), guardGrip=new THREE.Vector3(-s*0.05,-0.06,-0.34);     // Heft auf Brusthöhe
    let gripR=idleGrip.clone().lerp(guardGrip,rd);
    const idleElb=mirX(ANTHRO.elbow,s).sub(shL), guardElb=new THREE.Vector3(s*0.05,-0.22,-0.18);
    let elbowR=idleElb.clone().lerp(guardElb,rd);
    const _prF=Math.max(arena._aimF||0, rd*(1-(arena._windF||1)))*(1-thrustExt);                      // Streckung: Bereitschaft ODER leichte-Waffen-Führung (armgeführt) — der Stich übersteuert
    if(_prF>0.001){gripR.lerp(new THREE.Vector3(-s*0.03,-0.07,-0.47),_prF);elbowR.lerp(new THREE.Vector3(s*0.10,-0.19,-0.27),_prF);}
    if(thrustExt>0.001){gripR.lerp(new THREE.Vector3(-s*0.02,-0.10,-0.58),thrustExt);elbowR.lerp(new THREE.Vector3(s*0.13,-0.16,-0.34),thrustExt);}   // Hand fährt vor, Ellbogen weitet — Arm streckt, dreht nicht runter
    orientBone(A.up,S0z,elbowR);A.el.position.copy(elbowR);orientBone(A.fo,elbowR,gripR);A.ha.position.copy(gripR);
    let weaponQ=arena.baseQuat.clone();const aimW01=Math.max(thrustExt,arena._aimF||0);
    if(aimW01>0.001){arena.vm.updateMatrixWorld(true);
      const _eye=cam.position, _ld=new THREE.Vector3(Math.cos(arena.yaw)*Math.cos(arena.pitch),Math.sin(arena.pitch),Math.sin(arena.yaw)*Math.cos(arena.pitch));
      const _gW=arena.vm.localToWorld(gripR.clone()), _bL=arena.bladeL||1.0, _d=_gW.clone().sub(_eye), _aa=_ld.dot(_d), _disc=_aa*_aa-_d.lengthSq()+_bL*_bL;
      let _aimW;if(_disc>=0)_aimW=_ld.clone().multiplyScalar(_aa+Math.sqrt(_disc)).sub(_d).normalize();else _aimW=_ld.clone().multiplyScalar(Math.max(_aa,0.25)).sub(_d).normalize();   // Spitze auf dem Blickstrahl; unlösbar (kurze Klinge) -> nächster Punkt der Linie (GEMESSEN, Linienabstand: Dolch 31.1 -> 1.9 cm)
      const _bdVM=new THREE.Vector3(1,0,0).applyQuaternion(arena.baseQuat), _aimVM=_aimW.clone().applyQuaternion(arena.vm.quaternion.clone().invert());
      const _aimedQ=new THREE.Quaternion().setFromUnitVectors(_bdVM,_aimVM).multiply(arena.baseQuat);
      weaponQ=arena.baseQuat.clone().slerp(_aimedQ,aimW01);}                                          // Spitze auf das Fadenkreuz — beim Stich UND in Bereitschaft, egal wie lang die Klinge
    if(arena._rollRend&&!arena._impact)weaponQ.multiply(new THREE.Quaternion().setFromAxisAngle(_AX,arena._rollRend));   // wahre Schneide: Roll um die Klingenachse — Spitze bleibt, Schneidenebene und Krümmung drehen (Treffer folgt via _curveDir/bladeCurve)
    const bladeDir=new THREE.Vector3(1,0,0).applyQuaternion(weaponQ);
    const gXd=arena._gripXdom||0.2, gXo=arena._gripXoff||0.04;
    arena.vmWeapon.position.copy(gripR).addScaledVector(bladeDir,-gXd);                                 // 0-Punkt: Knauf-Ursprung unter die Hand -> Führhand ans Gehilz
    arena.vmWeapon.quaternion.copy(weaponQ);arena._gripR=gripR;arena._weaponQ=weaponQ;
    const O=arena.armO,vis=!!arena.twoH;[O.up,O.el,O.fo,O.ha].forEach(o=>o.visible=vis);                // zweite Hand ans untere Heft
    if(vis){const offHand=gripR.clone().addScaledVector(bladeDir,-(gXd-gXo));
      const offSh=new THREE.Vector3(-s*0.30,-0.05,-0.05), offElb=offSh.clone().lerp(offHand,0.5).add(new THREE.Vector3(0,-0.10,-0.04));
      orientBone(O.up,offSh,offElb);O.el.position.copy(offElb);orientBone(O.fo,offElb,offHand);O.ha.position.copy(offHand);}
  }else{
    arena.vm.position.copy(cam.position);
    const q=cam.quaternion.clone();const lift=lerp(-0.5,0,arena.raise);q.multiply(new THREE.Quaternion().setFromAxisAngle(_X,lift));arena.vm.quaternion.copy(q);
    const bx=arena.right?-1:1;                                                            // Bogenhand = Gegenhand
    const gripR=new THREE.Vector3(bx*0.16,-0.42,-0.34).lerp(new THREE.Vector3(bx*0.06,-0.05,-0.55),arena.raise);
    const elbowR=new THREE.Vector3(bx*0.20,-0.34,-0.22).lerp(new THREE.Vector3(bx*0.12,-0.22,-0.30),arena.raise);
    const Sb=new THREE.Vector3(bx*0.22,-0.20,-0.05);
    orientBone(A.up,Sb,elbowR);A.el.position.copy(elbowR);orientBone(A.fo,elbowR,gripR);A.ha.position.copy(gripR);
    arena.vmWeapon.position.copy(gripR);arena.vmWeapon.quaternion.copy(arena.baseQuat);arena._gripR=gripR;
  }
}

// ═══════════ DIE ARENA AUS DEM KERN (w4-arena-welt) ═══════════
// Jede Art des Hofs ist eine Gestalt des Schmiede-Kerns (SC.ARENA_HOF · SC.ARENA_SATZ · SC.buildInstance): das Labor zeigt den
// Körper, den der Ofen der Welt baut. Jedes bewegte Glied antwortet dem EINEN Stoß nach dem Gesetz des Kerns (SC.stossImpuls ·
// SC.geraetMasse · SC.geraetStoss · SC.geraetSchritt · SC.geraetPose) — wie in der Welt (stamm/kampf.js). Die Spiele des
// Prüfstands (Wertung, Folge, Ritter, Streitpuppe, Wurfscheibe) bleiben Labor; ihre Würfe ziehen aus dem Strom des Kerns.
const ZU={};                                                                                    // die Ströme des Prüfstands, je Zweck einer
function zufall(k){return ZU[k]();}
const _SV1=new THREE.Vector3(),_SV2=new THREE.Vector3(),_SV3=new THREE.Vector3(),_KA=new THREE.Vector3(),_KB=new THREE.Vector3(),_PQ=new THREE.Quaternion(),_PV=new THREE.Vector3();
// Ein Teil der Arena: die Gestalt des Kerns (Stufe 0, ihr Same) in einer Hülle an ihrer Lage; ihr Zustand nach dem Gesetz, ihre Kapseln.
function arenaTeil(id,x,y,z,yaw,ov,seed,eltern){
  const g=SC.buildInstance(id,seed||1,0,ov||undefined),h=new THREE.Group();h.position.set(x,y,z);h.rotation.y=yaw||0;h.add(g);(eltern||arena.group).add(h);
  const T={id,h,g,ov:ov||null,basis:h.position.clone(),yaw:yaw||0,z:SC.geraetZustand(id,ov,seed),kaps:SC.geraetTreffer(id,ov,seed),ton:null,eigen:false,pfeilEigen:false,halt:false};
  arena.teile.push(T);return T;}
function arenaWeg(T){if(T.h.parent)T.h.parent.remove(T.h);clear(T.h);const i=arena.teile.indexOf(T);if(i>=0)arena.teile.splice(i,1);}
// Der Satz einer Art an ihrem Ort (x, z, Gier): je Gestalt ein Teil — die Glieder stehen an ihrem Gelenk.
function arenaArt(art,x,z,yaw,ov){const out=[],c=Math.cos(yaw||0),s=Math.sin(yaw||0);
  for(const [id,lx,ly,lz,ly2,o2,sd] of SC.ARENA_SATZ[art])out.push(arenaTeil(id,x+lx*c+lz*s,ly,z-lx*s+lz*c,(yaw||0)+(ly2||0),id===art?ov:o2,sd));
  return out;}
// Die Pose des Gesetzes an die Hülle: die Gier der Lage · die Drehung um das Gelenk (der Ursprung) · der Gang des Leibs.
function arenaPose(T){const P=SC.geraetPose(T.z);_PQ.set(P.q[0],P.q[1],P.q[2],P.q[3]);T.h.quaternion.setFromAxisAngle(_Y,T.yaw).multiply(_PQ);
  _PV.set(P.versatz[0],0,P.versatz[2]).applyAxisAngle(_Y,T.yaw);T.h.position.copy(T.basis).add(_PV);T.h.updateMatrixWorld(true);}
// Der Takt des Gesetzes: nur was nachschwingt, rechnet (wie die Welt — ein ruhendes Gerät kostet nichts).
function arenaTakt(dt){for(const T of arena.teile){if(!T.z||T.z.ruht||T.halt)continue;SC.geraetSchritt(T.z,dt,SC.GERAET_GESETZ.schwere);arenaPose(T);}}
function _segDist(p,a,b){const ab=_SV1.subVectors(b,a),ap=_SV2.subVectors(p,a),l=ab.lengthSq(),t=l>1e-12?clamp(ap.dot(ab)/l,0,1):0;return _SV3.copy(a).addScaledVector(ab,t).distanceTo(p);}
function kapselNah(T,p,spiel){T.h.updateMatrixWorld(true);
  for(const k of T.kaps){const A=T.h.localToWorld(_KA.set(k.a[0],k.a[1],k.a[2])),B=T.h.localToWorld(_KB.set(k.b[0],k.b[1],k.b[2]));if(_segDist(p,A,B)<k.r+spiel)return true;}return false;}
// DER KONTAKT der Klinge mit einem Teil: die Schneide (gekrümmt, e0 → e1 vor der Hand) gegen seine Kapseln — der erste Punkt.
function arenaKontakt(T,handW,bladeDir){const e0=arena._edge0,e1=arena._edge1,eLen=Math.max(0.02,e1-e0),N=Math.max(6,Math.ceil(eLen/0.09));
  for(let i=0;i<=N;i++){const s=i/N,pt=handW.clone().addScaledVector(bladeDir,e0+s*eLen).add(bladeCurve(s));if(kapselNah(T,pt,0.04))return pt;}return null;}
// DER STOSS am Teil (die Welt: stamm/kampf.js `_geraetStoss`, dasselbe Gesetz): die wirksame Masse am Kontakt, das EINE Impuls-Gesetz
// mit dem Impuls des Urteils (verstärkt um ARENA.gefuehl.wucht), der Drall ins Glied. ort und dir in der Welt. Rückgabe J (N·s).
function arenaStoss(T,ort,dir,u){if(!T.z||!u||!(u.mEff>0)||!(dir.lengthSq()>1e-9))return 0;T.h.updateMatrixWorld(true);
  const pL=T.h.worldToLocal(ort.clone()),nL=dir.clone().normalize().applyQuaternion(T.h.getWorldQuaternion(new THREE.Quaternion()).invert());
  const p=[pL.x,pL.y,pL.z],n=[nL.x,nL.y,nL.z],J=SC.stossImpuls(u.mEff,SC.geraetMasse(T.z,p,n),SC.ARENA.gefuehl.wucht*u.p/u.mEff,T.z.e);
  SC.geraetStoss(T.z,J,p,n);return J;}
// Der Hieb gegen ein Teil: Kontakt, das Urteil des Kerns (Schnitt · Stich · Schlag), der Stoß längs des Schlags. null: kein Kontakt.
function arenaHieb(T,handW,bladeDir,vel,zone){const ort=arenaKontakt(T,handW,bladeDir);if(!ort)return null;
  const vAx=Math.abs(vel.dot(bladeDir)),vLat=vel.clone().addScaledVector(bladeDir,-vel.dot(bladeDir)).length();
  const u=SC.trefferUrteil(arena._m||measure(P),{vLat,vAx,edgeQ:arena._edgeAlign,zone:zone||null,P});
  return {ort,u,J:arenaStoss(T,ort,vel,u)};}
// Der Pfeil im Gesetz der Welt: die Masse des Pfeils, sein Tempo längs (trefferUrteil wie `_pfeilSehne`).
function pfeilUrteil(a){return SC.trefferUrteil({M:SC.ARENA.bogen.mArrow,mEffFrac:1},{vLat:0,vAx:a.vel.length()});}
function pfeilStoss(T,a){return arenaStoss(T,a.pos,a.vel,pfeilUrteil(a));}
// DIE TÖNUNG des Labors (Blitz, Funke, das leuchtende Ziel): die Stoffe des Teils als eigene Kopie, ihre Farbe als Faktor auf die
// Vertex-Albedo — Rückmeldung im Labor, die Gestalt bleibt die der Welt.
function arenaTon(T,r,g,b){if(!T.ton){T.ton=[];T.g.traverse(o=>{if(o.isMesh){o.material=o.material.clone();T.ton.push(o.material);arena.tonStoffe.push(o.material);}});}for(const m of T.ton)m.color.setRGB(r,g,b);}

// — der Waffentisch: die Gattungen des Kerns an der Schiene (buildWeaponModel, der Waffenständer des Labors) —
function buildTable(T){arena.rack=[];const names=Object.keys(GATTUNGEN);
  names.forEach((name,i)=>{const z=(i-(names.length-1)/2)*0.55;
    const wm=buildWeaponModel(name);wm.position.set(0,0.9,z);wm.rotation.z=Math.PI/2;wm.rotation.x=-0.12;T.h.add(wm);
    arena.rack.push({name,pos:T.basis.clone().add(new THREE.Vector3(0,0,z)),mesh:wm});});}
function equipWeapon(name){if(!GATTUNGEN[name])return;
  gattungWaehlen(name);
  arena.kind=(P.modus==='bogen')?'bow':'melee';
  arena.swinging=arena.thrusting=false;arena.holdView=false;arena.ready=0;arena.sw={yaw:0,pitch:0,reach:0};arena.swRoll=0;arena._rollRend=0;arena._aimF=0;arena._edgeAlign=1;
  arena.drawFrac=0;arena.drawing=false;arena._wantAim=false;arena.raise=0;arena.prevTip=null;arena._builtFrac=-1;arena.swP=0;arena.swY=0;arena._prevSwY=0;arena._prevSwP=0;arena._restT=0;arena.swLay=0;
  buildViewModel();placeViewModel(0);hudHint();updateHUD();}
function pickupCheck(){if(!arena.rack)return;let best=null,bd=1.7;
  for(const r of arena.rack){const d=Math.hypot(arena.player.x-r.pos.x,arena.player.z-r.pos.z);if(d<bd){bd=d;best=r;}}
  arena._near=best;const pe=document.getElementById('pickup');if(!pe)return;
  if(best&&best.name!==currentGattung){pe.style.display='block';pe.innerHTML='<b>E</b> — '+best.name+' nehmen';}else pe.style.display='none';}
const FEEL={massRef:1.4,massMin:0.42,massMax:2.30};                                   // Waffenmasse→Wucht (kg) · Median≈1.4 · Messer 0.25 / Vorschlaghammer 5.4
function wMass(){return clamp((arena._mass||FEEL.massRef)/FEEL.massRef,FEEL.massMin,FEEL.massMax);}   // 1.0 = mittlere Waffe, <1 leicht, >1 schwer

// ── DIE HARNISCH-PUPPE: der Schnitt gleitet ab — Stich in die Fuge oder stumpfe Wucht ──
function updateArmored(dt){const A=arena.armored;if(!A)return;
  if(A.hitCD>0)A.hitCD-=dt;const f0=A.flash+A.spark;
  if(A.flash>0)A.flash=Math.max(0,A.flash-dt*3.2);
  if(A.spark>0)A.spark=Math.max(0,A.spark-dt*4.5);
  if(f0>0)arenaTon(A.T,1+0.8*A.flash+0.9*A.spark,1+0.67*A.flash-0.33*A.spark,1+0.29*A.flash-0.35*A.spark);}   // Blitz gold (Treffer), Funke rot (abgeglitten)
function tryHitArmored(handW,bladeDir,vel){const A=arena.armored;if(!A||A.hitCD>0.28)return false;
  A.T.h.updateMatrixWorld(true);const hitPt=bladeHitsColumn(handW,bladeDir,A.T.h.position,0.42,0.7,2.18);if(!hitPt)return false;
  A.hitCD=0.28;const mm=arena._m||measure(P),M=mm.M;
  const vAx=Math.abs(vel.dot(bladeDir)),vLat=vel.clone().addScaledVector(bladeDir,-vel.dot(bladeDir)).length();
  const thrust=vAx>vLat*0.9,sharp=(mm.edgeWinkel!=null&&mm.edgeWinkel<32),pointy=(mm.betaDeg!=null&&mm.betaDeg<30);
  const u=SC.trefferUrteil(mm,{vLat,vAx,edgeQ:arena._edgeAlign,P});arenaStoss(A.T,hitPt,vel,u);
  if(thrust){
    if(pointy){A.breach++;A.flash=1;popText('➤ in die Harnisch-Fuge gestochen — '+u.KE.toFixed(0)+' J','#8fe39a',0,-0.04);fx.shake=Math.max(fx.shake,0.10);fx.freeze=Math.max(fx.freeze,0.06);arena.cooldown=0.30;}
    else{A.spark=1;A.deflect++;popText('✗ am Plattenrand abgewiesen — kein spitzer Ort','#d96a4a',0,0);bladeRecoil(0.70);}
  }else if(sharp){A.spark=1;A.deflect++;popText('✗ vom Harnisch abgeglitten — Schnitt prallt von der Platte','#d96a4a',0,0);bladeRecoil(0.85);
  }else{const mom=M*vLat;A.dent++;A.flash=1;popText('✹ Wucht durch den Harnisch — '+u.KE.toFixed(0)+' J Erschütterung','#ffd24a',0,-0.04);
    fx.shake=Math.max(fx.shake,0.16+clamp(mom*0.02,0,0.20));fx.freeze=Math.max(fx.freeze,0.08);const B=camBasis();fx.kickV.addScaledVector(B.fwd,-1.1);arena.cooldown=0.32;}
  return true;}

// ── DER FEDERPFAHL: die Stange federt nach dem Gesetz zurück ──
function updateSpringPell(dt){const S=arena.springPell;if(!S)return;if(S.hitCD>0)S.hitCD-=dt;if(S.combo>0&&clock.getElapsedTime()-S.lastHitT>2.2)S.combo=0;}
function tryHitSpringPell(handW,bladeDir,vel){const S=arena.springPell;if(!S||S.hitCD>0.16)return false;
  const h=arenaHieb(S.T,handW,bladeDir,vel);if(!h)return false;S.hitCD=0.14;const sp=Math.hypot(vel.x,vel.z)*wMass();
  if(sp>2.5){S.combo++;S.lastHitT=clock.getElapsedTime();popText('Treffer'+(S.combo>1?' x'+S.combo:'')+' — Pfahl federt zurück','#6fcf73',0,-0.04);fx.shake=Math.max(fx.shake,0.07);fx.freeze=Math.max(fx.freeze,0.035);arena.cooldown=0.12;}
  else{popText('zu zaghaft','#d4a843',0,0);bladeRecoil(0.4);}
  return true;}

// ── DIE TREFFERFOLGE: das leuchtende Brett zählt, das nächste wählt der Strom ──
function updateSequence(dt){const S=arena.sequence;if(!S)return;
  for(const p of S.pads)if(p.ton!==p.lit){p.ton=p.lit;if(p.lit)arenaTon(p.T,1.9,1.6,0.55);else arenaTon(p.T,1,1,1);}
  if(S.hitCD>0)S.hitCD-=dt;
  if(S.combo>0&&clock.getElapsedTime()-S.lastT>3.5){if(S.combo>S.best)S.best=S.combo;S.combo=0;}}
function tryHitSequence(handW,bladeDir,vel){const S=arena.sequence;if(!S||S.hitCD>0.18)return false;
  for(let pi=0;pi<S.pads.length;pi++){const p=S.pads[pi],ort=arenaKontakt(p.T,handW,bladeDir);
    if(!ort||p.T.h.worldToLocal(ort.clone()).y<1.15)continue;                                  // das Brett, nicht der Pfosten
    arenaHieb(p.T,handW,bladeDir,vel);
    if(p.lit){p.lit=false;let nx;do{nx=Math.floor(zufall('folge')*S.pads.length);}while(nx===pi);S.pads[nx].lit=true;S.active=nx;S.combo++;S.lastT=clock.getElapsedTime();popText('Folge '+S.combo+(S.combo>S.best&&S.combo>2?' — Bestwert!':''),'#6fcf73',0,-0.04);fx.shake=Math.max(fx.shake,0.05);fx.freeze=Math.max(fx.freeze,0.03);arena.cooldown=0.18;}
    else{popText('falsches Ziel — Folge bricht','#d96a4a',0,0);if(S.combo>S.best)S.best=S.combo;S.combo=0;arena.cooldown=0.2;}
    S.hitCD=0.2;return true;}
  return false;}

// ═══ RITTER-ARENA: zwei Felder (gepanzert / ungepanzert), echter Schwertkampf — die Leiber, Arme und Banner aus dem Kern ═══
function buildKnightField(art,x,z){const armored=art==='ritter',maxHp=armored?3:2;
  const F={center:new THREE.Vector3(x,0,z),active:false,won:false,deckung:3,armored,knights:[],_nearShown:false};
  for(const [id,lx,ly,lz,,,sd] of SC.ARENA_SATZ[art]){
    if(id==='kampfbanner'){arenaTeil(id,x+lx,ly,z+lz,0,null,sd);continue;}
    if(id!==art)continue;                                                                        // der Arm hängt an seinem Leib (unten)
    const T=arenaTeil(id,x+lx,0,z+lz,0,null,sd),A=arenaTeil(armored?'ritterarm':'kaempferarm',0.30,1.60,0.08,0,null,1,T.h);
    A.halt=true;const pips=[];
    for(let i=0;i<maxHp;i++){const pip=new THREE.Sprite(new THREE.SpriteMaterial({color:0x40e060}));pip.scale.set(0.11,0.11,1);pip.position.set((i-(maxHp-1)/2)*0.17,2.40,0.05);pip.visible=false;T.h.add(pip);pips.push(pip);}
    F.knights.push({T,A,pips,armored,field:F,home:T.basis.clone(),maxHp,hp:maxHp,state:'dormant',windT:0,actCD:0,stagT:0,downT:0,flash:0,spark:0,knockSpeed:1.5,_lunge:0,_dealt:false,_ton:0});}
  if(!arena.knightArenas)arena.knightArenas=[];arena.knightArenas.push(F);}
function knightPose(K){const T=K.T;if(K.state==='down'){T.halt=true;T.h.quaternion.setFromAxisAngle(_Y,T.yaw).multiply(_PQ.setFromAxisAngle(_X,Math.PI*0.42));T.h.position.copy(T.basis).setY(0.10);}else{T.halt=false;arenaPose(T);}}
function knightFieldReset(F){
  for(const K of F.knights){K.T.basis.copy(K.home);K.T.yaw=0;K.T.z.a[0]=K.T.z.a[1]=K.T.z.w[0]=K.T.z.w[1]=0;K.T.z.ruht=true;K.state='dormant';K.hp=K.maxHp;K.windT=0;K.actCD=0;K.stagT=0;K._lunge=0;K._dealt=false;K.A.h.rotation.x=0;knightPose(K);}
  F.active=false;F.won=false;F.deckung=3;}
function updateKnights(dt){if(!arena.knightArenas)return;arena._nearKnightField=null;
  for(const F of arena.knightArenas){
    const pdx=arena.player.x-F.center.x,pdz=arena.player.z-F.center.z,pDist=Math.hypot(pdx,pdz);
    if(!F.active){if(pDist<5.5){arena._nearKnightField=F;if(!F._nearShown){F._nearShown=true;popText('drücke [E] — '+(F.armored?'die Ritter herausfordern':'die Kämpfer herausfordern'),'#cfe0a0',0,-0.16);}}else F._nearShown=false;}
    if(F.won&&pDist>10){knightFieldReset(F);continue;}
    for(const K of F.knights){const T=K.T;
      const showPips=F.active&&K.state!=='down';
      for(let i=0;i<K.pips.length;i++){K.pips[i].visible=showPips;if(showPips){const lost=i>=K.hp;K.pips[i].material.color.setHex(lost?0x3a1a1a:(K.hp===1?0xff4040:K.hp===2&&K.maxHp>2?0xe0a040:0x40e060));}}
      if(K.state==='down'){if(K.downT>0)K.downT-=dt;continue;}
      if(K.actCD>0)K.actCD-=dt; if(K.flash>0)K.flash=Math.max(0,K.flash-dt*3.2); if(K.spark>0)K.spark=Math.max(0,K.spark-dt*4.5);
      const tel=(K.state==='wind')?(0.5*Math.sin(clock.getElapsedTime()*16)+0.5):0,ton=K.flash+K.spark+tel;
      if(ton>0||K._ton>0){K._ton=ton;arenaTon(T,1+0.8*K.flash+0.9*K.spark+0.7*tel,1+0.67*K.flash-0.33*K.spark+0.17*tel,1+0.29*K.flash-0.35*K.spark-0.29*tel);}
      if(!F.active){knightPose(K);continue;}
      const kw=T.basis,dx=arena.player.x-kw.x,dz=arena.player.z-kw.z,dist=Math.hypot(dx,dz)||1e-4;
      T.yaw=Math.atan2(dx,dz);
      if(K.state==='stagger'){K.stagT-=dt;kw.x-=(dx/dist)*K.knockSpeed*dt;kw.z-=(dz/dist)*K.knockSpeed*dt;if(K.stagT<=0)K.state='approach';knightPose(K);continue;}
      if(K.state==='approach'){
        if(dist>2.05){const sp=1.4*dt;kw.x+=(dx/dist)*sp;kw.z+=(dz/dist)*sp;kw.y=Math.abs(Math.sin(clock.getElapsedTime()*5+kw.x))*0.025;}
        else{kw.y=0;if(K.actCD<=0){K.state='wind';K.windT=0.95;}}
      } else if(K.state==='wind'){
        K.windT-=dt;const u=clamp(1-K.windT/0.95,0,1);K.A.h.rotation.x=-2.1*u;
        if(K.windT<=0){K.state='strike';K._lunge=0;K._dealt=false;}
      } else if(K.state==='strike'){
        K._lunge+=dt;const u=clamp(K._lunge/0.18,0,1);K.A.h.rotation.x=-2.1*(1-u)+0.55*u;
        if(u>=0.5&&!K._dealt){K._dealt=true;
          if(dist<2.45){F.deckung=Math.max(0,F.deckung-1);
            fx.shake=Math.max(fx.shake,0.40);fx.freeze=Math.max(fx.freeze,0.10);const B=camBasis();fx.kickV.addScaledVector(B.fwd,-2.4);fx.kickV.y-=1.0;
            if(F.deckung>0){popText('✖ HIEB DURCH DEINE DECKUNG','#ff6a4a',0,0);popText('Deckung '+F.deckung+'/3','#ffae6a',0.12,0.07);}
            else{popText('✖ DEINE DECKUNG ZERBRICHT','#ff5a4a',0,0);knightFieldReset(F);}}
          else popText('— Hieb verfehlt, ausgewichen','#9fb3c8',0,-0.04);}
        if(K._lunge>=0.28){K.state='approach';K.actCD=0.60;K._dealt=false;K.A.h.rotation.x=0;}
      }
      knightPose(K);
    }
    if(F.active&&!F.won){let down=0;for(const K of F.knights)if(K.state==='down')down++;
      if(down>=F.knights.length){F.won=true;popText('⚔ '+(F.armored?'ALLE RITTER GEFALLEN':'DAS FELD IST GERÄUMT')+' — verlasse den Ring','#7fe0a0',0,-0.06);}}
  }
}
function tryHitKnight(handW,bladeDir,vel){if(!arena.knightArenas)return false;
  let best=null,bestPt=null,bestD=1e9,bestF=null,bestHead=false;
  for(const F of arena.knightArenas){if(!F.active)continue;for(const K of F.knights){if(K.state==='down')continue;
    const ow=K.T.h.position;                                                                       // Fuß-Ursprung am Boden
    const headC=new THREE.Vector3(ow.x,ow.y+1.95,ow.z),torsoC=new THREE.Vector3(ow.x,ow.y+1.28,ow.z);
    const hpt=bladeHitsColumn(handW,bladeDir,headC,0.22,1.78,2.18);                          // Kopf: eng, hoch (Visier)
    const tpt=hpt?null:bladeHitsColumn(handW,bladeDir,torsoC,0.40,0.55,1.74);                // Rumpf: breit (Fugen)
    const pt=hpt||tpt;if(pt){const d=pt.distanceTo(handW);if(d<bestD){bestD=d;best=K;bestPt=pt;bestF=F;bestHead=!!hpt;}}}}
  if(!best)return false;const K=best,F=bestF;
  const mm=arena._m||measure(P);
  const vAx=Math.abs(vel.dot(bladeDir)),vLat=vel.clone().addScaledVector(bladeDir,-vel.dot(bladeDir)).length();
  const thrust=vAx>vLat*0.9,sharp=(mm.edgeWinkel!=null&&mm.edgeWinkel<32),pointy=(mm.betaDeg!=null&&mm.betaDeg<42);
  const u=SC.trefferUrteil(mm,{vLat,vAx,edgeQ:arena._edgeAlign,zone:bestHead?'kopf':'brust',P}),KE=u.KE;
  const J=arenaStoss(K.T,bestPt,vel,u);                                                         // der EINE Stoß: der Leib wankt
  let dmg=0,msg='',col='#d96a4a';
  if(F.armored){
    if(thrust&&bestHead&&mm.betaDeg!=null){dmg=2;msg='➤ Stich in den Augenschlitz! — '+KE.toFixed(0)+' J';col='#9fe0a0';}   // GEMESSEN: Streitkolben/Kriegshammer betaDeg=null — ein Wuchtkopf passt in keinen Schlitz
    else if(thrust&&pointy){dmg=1;msg='➤ Stich in die Fuge (Achsel/Leiste) — '+KE.toFixed(0)+' J';col='#8fe39a';}
    else if(!thrust&&!sharp){dmg=1;msg='✹ Wucht durch den Harnisch — '+KE.toFixed(0)+' J';col='#ffd24a';}
    else if(thrust){K.spark=1;msg='✗ am Plattenrand abgewiesen — kein spitzer Ort';bladeRecoil(0.70);}
    else{K.spark=1;msg='✗ Schnitt prallt von der Platte ab';bladeRecoil(0.85);}
  } else {
    if(thrust){dmg=bestHead?2:1;msg=bestHead?'➤ Stich in die Kehle! — '+KE.toFixed(0)+' J':'➤ Stich trifft — '+KE.toFixed(0)+' J';col='#9fe0a0';}
    else if(sharp){dmg=bestHead?2:1;msg=(bestHead?'⚔ Schnitt zum Kopf — ':'⚔ Schnitt trifft tief — ')+KE.toFixed(0)+' J'+((u.edgeQ||1)<=0.75?' · Schneide quer':'');col='#9fe0a0';}
    else{dmg=1;msg='✹ Schlag trifft — '+KE.toFixed(0)+' J';col='#ffd24a';}
  }
  if(dmg>0){K.flash=1;
    K.knockSpeed=clamp(J*0.12,0.9,4.5);K.stagT=clamp(0.40+J*0.012,0.45,0.9);                    // der Rückstoß folgt dem Impuls des Stoßes
    if(K.state==='wind'||K.state==='strike')K.A.h.rotation.x=0;K.state='stagger';K._dealt=false;
    K.hp-=dmg;fx.shake=Math.max(fx.shake,0.10);fx.freeze=Math.max(fx.freeze,0.05);arena.cooldown=0.28;
    if(K.hp<=0){K.state='down';K.downT=600;knightPose(K);msg+=(F.armored?' — RITTER FÄLLT':' — GESTRECKT');col='#7fe0a0';}
    popText(msg,col,0,-0.04);}
  else popText(msg,col,0,0);
  return true;}

// ── DIE STREITPUPPE: ein Leib auf Kufen — sie schläft, mit [E] geweckt greift sie an; der Stoß lässt sie wanken und gleiten ──
function updateCharger(dt){const C=arena.charger;if(!C)return;const T=C.T,dummyW=T.h.position;
  const dx=arena.player.x-dummyW.x,dz=arena.player.z-dummyW.z,dist=Math.hypot(dx,dz)||1e-4;
  if(C.hitCD>0)C.hitCD-=dt;
  const near=(C.state==='dormant'&&dist<6.5);arena._nearCharger=near;
  if(near&&!C._wasNear)popText('drücke [E] — Streitpuppe wecken','#cfe0a0',0,-0.16);C._wasNear=(dist<8);
  if(C.state==='dormant'){T.yaw=Math.atan2(dx,dz);}                                             // wartet, schaut dich an
  else if(C.state==='charge'){const step=C.speed*dt;T.basis.x+=(dx/dist)*step;T.basis.z+=(dz/dist)*step;T.yaw=Math.atan2(dx,dz);
    if(dist<1.7&&C.hitCD<=0){fx.shake=Math.max(fx.shake,0.42);fx.freeze=Math.max(fx.freeze,0.12);const B=camBasis();fx.kickV.addScaledVector(B.fwd,-3.2);fx.kickV.y-=1.5;popText('✖ DIE STREITPUPPE RAMMT DICH','#ff6a4a',0,0);popText('rechtzeitig treffen!','#d96a4a',0.12,0.07);C.state='retreat';C.hitCD=1.0;}}
  else if(C.state==='retreat'){const hx=C.home.x-dummyW.x,hz=C.home.z-dummyW.z,hd=Math.hypot(hx,hz);
    if(hd<0.25){T.basis.copy(C.home);T.z.x[0]=T.z.x[1]=0;T.yaw=0;C.state='dormant';C._wasNear=true;}else{const step=C.speed*1.5*dt;T.basis.x+=(hx/hd)*step;T.basis.z+=(hz/hd)*step;}}
  arenaPose(T);}
function tryArrowCharger(a){const C=arena.charger;if(!C||C.state==='retreat')return false;
  if(!kapselNah(C.T,a.pos,0.05))return false;pfeilStoss(C.T,a);
  C.state='retreat';C.hitCD=0.8;fx.shake=Math.max(fx.shake,0.1);popText('Pfeil stoppt die Streitpuppe!','#6fcf73',0,0);popText('+15','#6fcf73',0.12,0.06);
  arena.score.shots++;arena.score.sum+=15;arena.score.last={ring:15,pen:a.KE*0.18,v0:a.v0,KE:a.KE,dist:Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z)};updateHUD();return true;}
function tryHitCharger(handW,bladeDir,vel){const C=arena.charger;if(!C||C.hitCD>0.4)return false;
  if(C.state!=='charge'){if(!arenaHieb(C.T,handW,bladeDir,vel))return false;C.hitCD=0.3;popText('Streitpuppe getroffen — sie wankt','#cdbf9a',0,-0.04);arena.cooldown=0.18;return true;}
  const h=arenaHieb(C.T,handW,bladeDir,vel);if(!h)return false;
  const dummyW=C.T.h.position,ms=wMass(),sp=vel.length()*ms;C.hitCD=0.5;
  const _dist=Math.hypot(dummyW.x-arena.player.x,dummyW.z-arena.player.z),_reach=Math.max(0.3,arena._edge1),_jam=clamp((_dist-_reach*0.15)/(_reach*0.45),0.15,1),spEff=sp*_jam;
  if(spEff>3.5){C.state='retreat';C.hitCD=0.8;popText('Streitpuppe zurückgeschlagen!','#6fcf73',0,-0.04);fx.shake=Math.max(fx.shake,0.13);fx.freeze=Math.max(fx.freeze,0.06);arena.cooldown=0.25;}
  else if(sp>3.5&&_jam<0.6){popText('zu nah — '+currentGattung+' kommt nicht zur Geltung!','#d4a843',0,0);bladeRecoil(0.5);}
  else{popText('zu schwach — sie drängt weiter','#d4a843',0,0);bladeRecoil(0.6);}
  return true;}

// ── DIE PENDEL: Kugel, Gasse, Pendelziel — der Kern schwingt sie; die schnelle Kugel trifft den, der im Weg steht ──
function pendelTrifftSpieler(T,L,msg,stark){if(T.z.ruht||T.hitCD>0)return;const bw=T.h.localToWorld(_KA.set(0,-L,0));
  const spd=L*Math.hypot(T.z.w[0],T.z.w[1]),dh=Math.hypot(bw.x-arena.player.x,bw.z-arena.player.z);
  if(spd>1.6&&dh<0.62&&bw.y<1.85){fx.shake=Math.max(fx.shake,stark);fx.freeze=Math.max(fx.freeze,0.1);popText(msg,'#ff6a6a',0,0);T.hitCD=1.0;}}
function updatePendulum(dt){const T=arena.pendulum;if(!T)return;if(T.hitCD>0)T.hitCD-=dt;pendelTrifftSpieler(T,1.26,'✖ DIE KUGEL TRIFFT DICH',0.4);}
function tryHitPendulum(handW,bladeDir,vel){const T=arena.pendulum;if(!T||T.hitCD>0.55)return false;
  if(!arenaHieb(T,handW,bladeDir,vel))return false;fx.shake=Math.max(fx.shake,0.08);fx.freeze=Math.max(fx.freeze,0.05);popText('Kugel getroffen — sie schwingt!','#cdbf9a',0,-0.04);arena.cooldown=0.18;return true;}
function updateGauntlet(dt){if(!arena.gauntlet)return;for(const T of arena.gauntlet){if(T.hitCD>0)T.hitCD-=dt;pendelTrifftSpieler(T,1.35,'✖ Pendel erwischt dich',0.35);}}
function tryHitGauntlet(handW,bladeDir,vel){if(!arena.gauntlet)return false;
  for(const T of arena.gauntlet){if(T.hitCD>0.55)continue;if(!arenaHieb(T,handW,bladeDir,vel))continue;
    fx.shake=Math.max(fx.shake,0.07);fx.freeze=Math.max(fx.freeze,0.04);popText('Pendel getroffen','#cdbf9a',0,-0.04);arena.cooldown=0.16;return true;}
  return false;}
// das Pendelziel ruht nie lange: der Ziel-Wart stößt es an, wenn es steht (ein Stoß nach dem Gesetz, quer zur Bahn)
function updateSwingTarget(dt){const S=arena.swingTgt;if(!S)return;
  if(S.T.z.ruht&&clock.getElapsedTime()>S.anstossAb){S.seite=-S.seite;SC.geraetStoss(S.T.z,S.T.z.m*2.0,[0,-1.55,0],[0,0,S.seite]);S.anstossAb=clock.getElapsedTime()+1.0;}
  if(S.struck&&clock.getElapsedTime()>S.respawnAt)S.struck=false;}
function tryArrowSwing(a){const S=arena.swingTgt;if(!S||S.struck)return false;
  const T=S.T;T.h.updateMatrixWorld(true);const c=T.h.localToWorld(_KA.set(0,-1.55,0)),nx=_KB.set(1,0,0).transformDirection(T.h.matrixWorld);
  const d=a.pos.clone().sub(c),dn=d.dot(nx),r=d.addScaledVector(nx,-dn).length();
  if(Math.abs(dn)<0.22&&r<S.R){const ring=clamp(Math.ceil(4*(1-r/S.R)),1,4);
    S.struck=true;S.respawnAt=clock.getElapsedTime()+2.5;pfeilStoss(T,a);T.h.attach(a.mesh);
    fx.shake=Math.max(fx.shake,0.08);popText('PENDELZIEL getroffen — vorgehalten! · '+ring,'#ffe07a',0,0);popText('+'+(ring*5),'#6fcf73',0.12,0.06);arena.score.shots++;arena.score.sum+=ring*5;arena.score.last={ring:ring*5,pen:a.KE*0.18,v0:a.v0,KE:a.KE,dist:Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z)};updateHUD();return true;}
  return false;}

// ── DIE WURFSCHEIBE: die Tontaube (eine Gestalt des Kerns) steigt — triff sie in der Luft; der Wurf stößt den Arm zurück ──
function updateClay(dt){const C=arena.clay;if(!C)return;const t=clock.getElapsedTime();
  if(!C.active){if(t>C.nextT&&Math.hypot(arena.player.x-C.thrower.x,arena.player.z-C.thrower.z)<30){C.pos.copy(C.thrower);C.pos.y+=0.95;C.vel.set((zufall('ton')-0.5)*3,7.5+zufall('ton')*2.5,(zufall('ton')<0.5?1:-1)*(4+zufall('ton')*4));C.active=true;C.disc.visible=true;
      SC.geraetStoss(C.arm.z,C.mTon*C.vel.length(),[0,0.65,0.22],[0,0,-1]);popText('PULL! — Wurfscheibe steigt','#d8c050',0,-0.22);}return;}
  C.vel.y-=SC.GERAET_GESETZ.schwere*dt;C.pos.addScaledVector(C.vel,dt);
  C.disc.position.copy(C.pos);C.disc.rotation.x+=dt*7;C.disc.rotation.z+=dt*4;
  if(C.pos.y<0.12){C.active=false;C.disc.visible=false;C.nextT=t+2.0+zufall('ton')*2.2;}}
function tryArrowClay(a){const C=arena.clay;if(!C||!C.active)return false;
  if(a.pos.distanceTo(C.pos)<0.45){C.active=false;C.disc.visible=false;C.nextT=clock.getElapsedTime()+1.6+zufall('ton')*1.5;C.broke++;
    fx.shake=Math.max(fx.shake,0.1);popText('SCHEIBE ZERSPLITTERT — in der Luft getroffen!','#ffe07a',0,0);popText('+25','#6fcf73',0.12,0.06);arena.score.shots++;arena.score.sum+=25;arena.score.last={ring:25,pen:a.KE*0.18,v0:a.v0,KE:a.KE,dist:Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z)};updateHUD();return true;}
  return false;}

// ── DER DREHBAUM und DIE QUINTANE: das Kreuz und der Arm drehen nach dem Gesetz; der schnelle Arm erwischt den, der steht ──
function updateSpinTree(dt){const T=arena.spintree;if(!T)return;if(T.hitCD>0)T.hitCD-=dt;
  if(Math.abs(T.z.om)>2.6&&T.hitCD<=0){for(let i=0;i<4;i++){const a=i/4*Math.PI*2,pw=T.h.localToWorld(_KA.set(Math.cos(a)*0.92,0,Math.sin(a)*0.92));
    if(Math.hypot(pw.x-arena.player.x,pw.z-arena.player.z)<0.6&&pw.y<1.85){fx.shake=Math.max(fx.shake,0.34);fx.freeze=Math.max(fx.freeze,0.09);popText('✖ der Drehbaum erwischt dich','#ff8a6a',0,0);T.hitCD=0.9;break;}}}}
function tryHitSpinTree(handW,bladeDir,vel){const T=arena.spintree;if(!T)return false;
  if(!arenaHieb(T,handW,bladeDir,vel))return false;fx.shake=Math.max(fx.shake,0.07);fx.freeze=Math.max(fx.freeze,0.05);popText('Drehbaum getroffen!','#cd9a6a',0,-0.04);arena.cooldown=0.18;return true;}
function tryHitQuintain(handW,bladeDir,vel){const T=arena.quintain;if(!T)return false;
  const h=arenaHieb(T,handW,bladeDir,vel);if(!h)return false;const bag=T.h.worldToLocal(h.ort.clone()).x<0;
  fx.shake=Math.max(fx.shake,0.06);fx.freeze=Math.max(fx.freeze,0.05);
  popText(bag?'Sandsack getroffen — er schwingt herum!':'Schild getroffen — weiche dem Sandsack!',bag?'#d8c089':'#ffd479',0,-0.04);arena.cooldown=0.2;return true;}
function updateQuintain(dt){const T=arena.quintain;if(!T)return;if(T.hitCD>0)T.hitCD-=dt;
  const bp=T.h.localToWorld(_KA.set(-1.0,-0.2,0)),dh=Math.hypot(bp.x-arena.player.x,bp.z-arena.player.z);   // erwischt der Sack den Spieler?
  if(dh<0.75&&Math.abs(T.z.om)>0.6&&T.hitCD<=0){T.hitCD=1.3;fx.shake=Math.max(fx.shake,0.42);fx.freeze=Math.max(fx.freeze,0.12);const B=camBasis();fx.kickV.addScaledVector(B.fwd,-3.2);fx.kickV.y-=1.5;popText('✖ DER SANDSACK ERWISCHT DICH','#ff6a4a',0,0);popText('schneller ausweichen!','#d96a4a',0.12,0.08);}}

// ── DIE STECHRINGE: durchstechen — ein Treffer am Rand stößt den Ring an seinem Faden fort ──
function tryThrustRing(tip,prev,dt){if(!arena.thrustRings||!prev)return;
  for(const r of arena.thrustRings){if(r.scored)continue;r.T.h.updateMatrixWorld(true);
    const c=r.T.h.localToWorld(_KA.set(0,-0.94,0)).clone(),ax=_KB.set(0,0,1).transformDirection(r.T.h.matrixWorld).clone();
    const d0=prev.clone().sub(c).dot(ax),d1=tip.clone().sub(c).dot(ax);
    if(d0*d1<=0&&Math.abs(d1-d0)>1e-5){const t=d0/(d0-d1),cr=prev.clone().lerp(tip,t);const rad=cr.clone().sub(c).addScaledVector(ax,-cr.clone().sub(c).dot(ax)).length();
      if(rad<r.R-0.035){r.scored=true;r.scoreUntil=clock.getElapsedTime()+1.4;r.flash=1;popText('◎ RING DURCHSTOCHEN — sauber durch die Mitte!','#6fcf73',0,-0.04);fx.freeze=Math.max(fx.freeze,0.06);}
      else if(rad<r.R*1.7){const v=tip.clone().sub(prev).divideScalar(Math.max(1e-3,dt));
        arenaStoss(r.T,cr,v,SC.trefferUrteil(arena._m||measure(P),{vLat:0,vAx:v.length(),P}));
        popText('Rand erwischt — der Ring schwingt fort!','#d4a843',0,-0.04);fx.shake=Math.max(fx.shake,0.16);fx.freeze=Math.max(fx.freeze,0.05);}
      else if(rad<r.R*2.8){popText('knapp — '+(rad*100).toFixed(0)+' cm daneben','#d4a843',0,-0.04);}}}}
function updateRings(dt){if(!arena.thrustRings)return;for(const r of arena.thrustRings){
  if(r.scored&&r.scoreUntil&&clock.getElapsedTime()>r.scoreUntil){r.scored=false;r.scoreUntil=0;}
  if(r.flash>0||r._ton){r.flash=Math.max(0,r.flash-dt*0.8);r._ton=r.flash>0;arenaTon(r.T,1-0.5*r.flash,1+0.4*r.flash,1);}}}

// ── DAS PAPAGEIEN-FELD, DIE WEIDENRUTE: das Ziel wankt nach dem Gesetz, die Wertung ruht kurz ──
function updatePopinjay(dt){if(!arena.popinjays)return;for(const P2 of arena.popinjays)if(P2.struck&&clock.getElapsedTime()>P2.respawnAt)P2.struck=false;}
function updateWand(){const W=arena.wand;if(W&&W.struck&&clock.getElapsedTime()>W.respawnAt)W.struck=false;}

// ── JEDES ÜBRIGE TEIL (Ziel, Ente, Fahne, Wurf-Arm, Gestell …): der EINE Stoß am getroffenen Teil ──
function tryHitTeil(handW,bladeDir,vel){for(const T of arena.teile){if(T.eigen||!T.z||T.z.art==='fest')continue;
  if(arenaHieb(T,handW,bladeDir,vel)){fx.shake=Math.max(fx.shake,0.05);fx.freeze=Math.max(fx.freeze,0.04);popText(SC.ARENA_ARTEN[T.id].lab+' getroffen','#cdbf9a',0,-0.04);arena.cooldown=0.18;return true;}}
  return false;}
function tryArrowTeil(a){for(const T of arena.teile){if(T.eigen||T.pfeilEigen||!T.z||T.z.art==='fest'||!kapselNah(T,a.pos,0.05))continue;
  pfeilStoss(T,a);popText(SC.ARENA_ARTEN[T.id].lab+' getroffen','#cdbf9a',0,0);stickArrow(a);T.h.attach(a.mesh);return true;}
  return false;}

// — die Kirmes-Enten: sie fahren auf ihrer Leiste (das Spiel des Labors), der Treffer klappt sie nach dem Gesetz zurück —
function carnivalUpdate(t){if(!arena.movers)return;
  for(const mv of arena.movers){if(mv.hit&&t-mv.hitAt>2.8)mv.hit=false;
    mv.T.basis.z=mv.z0+mv.amp*Math.sin(mv.w*t+mv.phase);mv.worldZ=mv.T.basis.z;arenaPose(mv.T);}}
function hitMover(a){if(!arena.movers)return false;const t=clock.getElapsedTime();
  for(const mv of arena.movers){if(mv.hit)continue;
    if(a.pos.x>=mv.baseX-0.22&&a.pos.x<mv.baseX+0.3&&Math.abs(a.pos.z-mv.worldZ)<0.28&&Math.abs(a.pos.y-mv.baseY)<0.26){
      mv.hit=true;mv.hitAt=t;pfeilStoss(mv.T,a);fx.shake+=0.06;arena.score.shots++;arena.score.sum+=10;arena.score.last={ring:10,pen:a.KE*0.18,v0:a.v0,KE:a.KE,dist:Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z)};
      popText('ENTE GETROFFEN!','#ffe07a',0,0);popText('+10','#6fcf73',0.12,0.06);stickArrow(a);mv.T.h.attach(a.mesh);updateHUD();return true;}}
  return false;}

// — der Bambus: das Rohr ist eine Gestalt des Kerns (Höhe als Regler); der saubere Schnitt teilt es, der Rest federt —
function bambusRohr(b,h){if(b.T)arenaWeg(b.T);b.T=arenaTeil('bambusrohr',b.wx,b.baseY,b.wz,0,{hoeheM:h});b.T.eigen=true;}
function updateFalling(dt){if(!arena.fallingBamboo)return;
  for(let i=arena.fallingBamboo.length-1;i>=0;i--){const f=arena.fallingBamboo[i];f.vel.y-=SC.GERAET_GESETZ.schwere*dt;
    f.mesh.position.addScaledVector(f.vel,dt);f.mesh.rotation.x+=f.ang.x*dt;f.mesh.rotation.z+=f.ang.z*dt;f.life+=dt;
    if(f.mesh.position.y<0.06){f.mesh.position.y=0.06;f.vel.x*=0.4;f.vel.z*=0.4;f.vel.y=Math.abs(f.vel.y)*0.25;f.ang.multiplyScalar(0.5);}
    if(f.life>6){clear(f.mesh);arena.fallingBamboo.splice(i,1);}}}
function fallendesStueck(id,ov,pos,quat,vel,spin){const g=SC.buildInstance(id,1,0,ov);g.position.copy(pos);if(quat)g.quaternion.copy(quat);arena.group.add(g);
  arena.fallingBamboo.push({mesh:g,vel,ang:new THREE.Vector3((zufall('fall')-0.5)*spin,0,(zufall('fall')-0.5)*spin),life:0});}
function bladeRecoil(strength){const s=clamp(strength,0,1.2),B=camBasis(),ms=wMass();
  fx.shake=Math.max(fx.shake,0.18+0.24*s*ms);
  fx.freeze=Math.max(fx.freeze,0.08+0.07*s);                                                   // Hitstop — der Schlag „steht" kurz
  fx.kickV.addScaledVector(B.fwd,-1.6*s*Math.min(1.5,ms));fx.kickV.y+=1.2*s*Math.min(1.5,ms);                                     // Sicht ruckt zurück/hoch (Rückstoss)
  arena._mdx=0;arena._mdy=0;                                                                    // Schwung gestoppt — Klinge prallt ab statt durchzugehen
  arena.swP=clamp((arena.swP||0)+0.30*s,-1.95,0.7);                                             // Klinge springt zurück hoch (Rückschlag)
  arena.swY=(arena.swY||0)*0.5;                                                                 // seitlicher Schwung gebremst
  arena.cooldown=Math.max(arena.cooldown,0.14+0.05*s);}
function tryCutBamboo(handW,bladeDir,vel){if(!arena.bamboo)return;const m=measure(P),S=m.S;
  const sharp=(m.edgeWinkel!=null&&m.edgeWinkel<32);   // EIN sharp-Prädikat im ganzen System (harmonisiert von 30)
  const e0=arena._edge0,e1=arena._edge1,gXd=arena._gripXdom||0,eLen=Math.max(0.02,e1-e0),xcop=(m.xcop!=null?m.xcop:S.xBlade0+0.65*(S.xPoint-S.xBlade0));
  const vAxT=Math.abs(vel.dot(bladeDir)),vLatT=vel.clone().addScaledVector(bladeDir,-vel.dot(bladeDir)).length();
  for(const b of arena.bamboo){if(b.cut)continue;
    let best=null;const NS=8;                                                                 // ganze Schneide gegen das Rohr prüfen
    for(let i=0;i<=NS;i++){const p=e0+(i/NS)*eLen,pt=handW.clone().addScaledVector(bladeDir,p).add(bladeCurve(i/NS)),dH=Math.hypot(pt.x-b.wx,pt.z-b.wz);
      if(dH<0.14&&pt.y>b.baseY+0.06&&pt.y<b.baseY+b.h-0.03&&(!best||dH<best.dH))best={p:p,pt:pt,dH:dH};}
    if(!best)continue;
    const xLoc=gXd+best.p, velFac=clamp(best.p/Math.max(0.05,e1),0.12,1.0), eff=clamp(1-1.4*Math.abs(xLoc-xcop)/S.L,0.25,1.0); // Tempo ~ Abstand vom Handgelenk, Effizienz ~ Nähe zum Stoßmittelpunkt
    const vAx=vAxT*velFac, vLat=vLatT*velFac, mEff=Math.max(0.02,(m.mEffFrac||0.2)*m.M);
    const edgeQ=clamp(arena._edgeAlign!=null?arena._edgeAlign:1,0.15,1), KE=0.5*mEff*vLat*vLat*eff*(0.25+0.75*edgeQ);   // wahre Schneide: EIN Faktor überall
    const where=Math.abs(xLoc-xcop)/S.L<0.12?'Sweetspot':best.p>e1*0.85?'Spitze':best.p<e1*0.4?'gehilznah':'Mitte';
    const federt=()=>arenaStoss(b.T,best.pt,vel,SC.trefferUrteil(m,{vLat,vAx,edgeQ,P}));        // was nicht schneidet, stößt: das Rohr federt
    if(!sharp){federt();popText('stumpf — keine Schneide','#d96a4a',0,0);bladeRecoil(0.7);b.cut='miss';setTimeout(()=>{if(b.cut==='miss')b.cut=false;},350);return;}
    if(vLat<vAx*0.8){federt();popText('Stich — Bambus splittert nicht, kein Schnitt','#d96a4a',0,0);bladeRecoil(0.95);return;}
    if(edgeQ<0.45){federt();popText('flach — die Schneide liegt quer','#d96a4a',0,0);bladeRecoil(0.8);return;}
    if(KE<10){federt();popText('zu schwach — die Klinge prallt ab ('+KE.toFixed(0)+' J · '+where+')','#d4a843',0,0);bladeRecoil(0.85);b.cut='miss';setTimeout(()=>{if(b.cut==='miss')b.cut=false;},350);return;}
    const cutDir=vel.clone().setY(0);if(cutDir.lengthSq()<1e-4)cutDir.set(0,0,1);cutDir.normalize();
    cutBambooPole(b,best.pt.y,cutDir,KE);if(where==='Sweetspot')popText('Schwingungsknoten — voll','#6fcf73',0.14,-0.12);arena.cooldown=0.25;return;}}
function cutBambooPole(b,yCut,cutDir,KE){b.cut=true;if(!arena.fallingBamboo)arena.fallingBamboo=[];
  const bottomH=Math.max(0.05,yCut-b.baseY),topH=Math.max(0.05,(b.baseY+b.h)-yCut);
  bambusRohr(b,bottomH);                                                                        // der Stumpf bleibt (er federt weiter)
  fallendesStueck('bambusrohr',{hoeheM:topH},new THREE.Vector3(b.wx,yCut,b.wz),null,cutDir.clone().multiplyScalar(0.6+Math.min(2.5,KE*0.006)).add(new THREE.Vector3(0,0.4,0)),5);
  b.respawnAt=clock.getElapsedTime()+(b.lane?0.9:1.6);
  fx.shake=Math.max(fx.shake,0.05);fx.freeze=Math.max(fx.freeze,0.05);
  popText('✁ SAUBERER SCHNITT — '+KE.toFixed(0)+' J','#ffe07a',0,-0.04);popText('die Spitze fällt','#9fb3c8',0.12,0.05);}
function regrowBamboo(){if(!arena.bamboo)return;const t=clock.getElapsedTime();
  for(const b of arena.bamboo){if(b.cut===true&&b.respawnAt&&t>b.respawnAt){bambusRohr(b,b.h);b.cut=false;b.respawnAt=0;}}}
function tryThrustBamboo(tip,prev,dt){if(!arena.bamboo)return false;
  for(const b of arena.bamboo){if(b.cut)continue;
    const dH=Math.hypot(tip.x-b.wx,tip.z-b.wz);
    if(dH<0.13&&tip.y>b.baseY+0.06&&tip.y<b.baseY+b.h-0.03){const v=prev?tip.clone().sub(prev).divideScalar(Math.max(1e-3,dt)):new THREE.Vector3();
      arenaStoss(b.T,tip,v,SC.trefferUrteil(arena._m||measure(P),{vLat:0,vAx:v.length(),P}));
      popText('Bambus — die Spitze dringt nicht durch','#d96a4a',0,0);bladeRecoil(1.0);arena.thrusting=false;return true;}}
  return false;}

// — die Tatami: die Rolle hängt am Seil (eine Gestalt des Kerns, Länge als Regler); der Schnitt teilt sie, der Rest schwingt weiter —
function tatamiRolle(R){const T=arena.tatami,alt=T.T;T.T=arenaTeil('tatamirolle',T.pivot.x,T.pivot.y,T.pivot.z,0,{rolleM:R});T.T.eigen=true;T.rollLen=R;
  if(alt){T.T.z.a=alt.z.a.slice();T.T.z.w=alt.z.w.slice();T.T.z.ruht=alt.z.ruht;arenaPose(T.T);arenaWeg(alt);}T.cut=false;}
function tryCutTatami(handW,bladeDir,vel){const T=arena.tatami;if(!T||!T.T||T.cut)return;const m=measure(P),S=m.S;
  const sharp=(m.edgeWinkel!=null&&m.edgeWinkel<32);   // harmonisiert (war 30)
  const R=T.rollLen;T.T.h.updateMatrixWorld(true);
  const c=T.T.h.localToWorld(new THREE.Vector3(0,-0.55-R/2,0)),ax=new THREE.Vector3(0,1,0).transformDirection(T.T.h.matrixWorld);
  const e0=arena._edge0,e1=arena._edge1,gXd=arena._gripXdom||0,eLen=Math.max(0.02,e1-e0),xcop=(m.xcop!=null?m.xcop:S.xBlade0+0.65*(S.xPoint-S.xBlade0));
  const vAxT=Math.abs(vel.dot(bladeDir)),vLatT=vel.clone().addScaledVector(bladeDir,-vel.dot(bladeDir)).length();
  let best=null;const NS=8;
  for(let i=0;i<=NS;i++){const p=e0+(i/NS)*eLen,pt=handW.clone().addScaledVector(bladeDir,p).add(bladeCurve(i/NS)),dv=pt.clone().sub(c),along=dv.dot(ax),dH=dv.addScaledVector(ax,-along).length();
    if(dH<0.17&&Math.abs(along)<R*0.5+0.06&&(!best||dH<best.dH))best={p,pt,dH,along};}
  if(!best)return;
  const xLoc=gXd+best.p, velFac=clamp(best.p/Math.max(0.05,e1),0.12,1.0), eff=clamp(1-1.4*Math.abs(xLoc-xcop)/S.L,0.25,1.0);
  const vAx=vAxT*velFac, vLat=vLatT*velFac, mEff=Math.max(0.02,(m.mEffFrac||0.2)*m.M);
  const edgeQ=clamp(arena._edgeAlign!=null?arena._edgeAlign:1,0.15,1), KE=0.5*mEff*vLat*vLat*eff*(0.25+0.75*edgeQ);   // wahre Schneide: EIN Faktor überall
  const schwingt=()=>arenaStoss(T.T,best.pt,vel,SC.trefferUrteil(m,{vLat,vAx,edgeQ,P}));      // was nicht schneidet, stößt: die Rolle schwingt
  if(!sharp){schwingt();popText('stumpf — Matte schwingt nur','#d96a4a',0,0);arena.cooldown=0.3;return;}
  if(vLat<vAx*0.8){schwingt();popText('zu flach — kein Schnitt','#d96a4a',0,0);arena.cooldown=0.3;return;}
  if(edgeQ<0.45){schwingt();popText('flach — die Schneide liegt quer','#d96a4a',0,0);bladeRecoil(0.6);return;}
  if(KE<12){schwingt();popText('zu schwach — Klinge prallt ab ('+KE.toFixed(0)+' J)','#d4a843',0,0);bladeRecoil(0.55);return;}
  const cutDir=vel.clone().setY(0);if(cutDir.lengthSq()<1e-4)cutDir.set(0,0,1);cutDir.normalize();
  const topLen=clamp(R*0.5-best.along,0.04,R-0.04),botLen=R-topLen;                             // die Rolle am KONTAKTPUNKT teilen
  if(!arena.fallingBamboo)arena.fallingBamboo=[];
  if(botLen>0.04){const q=T.T.h.getWorldQuaternion(new THREE.Quaternion()),pos=T.T.h.localToWorld(new THREE.Vector3(0,-0.55-topLen,0));
    fallendesStueck('tatamirolle',{rolleM:botLen,seilM:0},pos,q,cutDir.clone().multiplyScalar(0.6+Math.min(2,KE*0.005)).add(new THREE.Vector3(0,0.15,0)),4);}
  if(topLen>0.30)tatamiRolle(topLen);                                                            // das obere Stück bleibt am Seil → weiter schneidbar
  else{arenaWeg(T.T);T.T=null;T.cut=true;T.respawnAt=clock.getElapsedTime()+2.2;}
  fx.shake=Math.max(fx.shake,0.05);fx.freeze=Math.max(fx.freeze,0.05);
  popText('✁ DURCHTRENNT — '+KE.toFixed(0)+' J'+(topLen>0.30?' · weiter!':''),eff>0.7?'#ffe07a':'#d4a843',0,-0.04);arena.cooldown=0.22;return;}
function regrowTatami(){const T=arena.tatami;if(T&&T.cut&&T.respawnAt&&clock.getElapsedTime()>T.respawnAt&&!T.T)tatamiRolle(1.0);}

function scoreArrowOn(a,T,r){const R=T.R;let ring=0;if(r<=R)ring=clamp(Math.ceil(10*(1-r/R)),1,10);const pen=a.KE*0.18;
  const dist=Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z);arena.score.shots++;arena.score.sum+=ring;arena.score.last={ring,pen,v0:a.v0,KE:a.KE,dist};
  pfeilStoss(T.T,a);                                                                             // die Scheibe wankt im Gesetz
  if(ring>0){fx.shake+=0.04;popText(ring+'! · '+dist.toFixed(0)+' m',ring>=9?'#ffe07a':ring>=6?'#9fb3c8':'#d96a4a',0,0);if(ring>=10)popText('GOLD!','#ffe07a',0.14,0.06);}else popText('Scheibe verfehlt','#7a7f8c',0,0);
  stickArrow(a);T.T.h.attach(a.mesh);updateHUD();}

function orientToNormal(z,x){z=z.clone().normalize();let xx=x.clone().sub(z.clone().multiplyScalar(x.dot(z)));
  if(xx.lengthSq()<1e-6){xx=new THREE.Vector3(0,1,0).sub(z.clone().multiplyScalar(z.y));if(xx.lengthSq()<1e-6)xx=new THREE.Vector3(1,0,0);}
  xx.normalize();const yy=z.clone().cross(xx).normalize();return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xx,yy,z));}
function addDummyScar(point,normal,cutDir,hit){if(!arena.dummy||!point)return;arena.scars=arena.scars||[];
  arena.dummy.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(arena.dummy.matrixWorld).invert();
  const lp=point.clone().applyMatrix4(inv), ln=normal.clone().transformDirection(inv).normalize(), ld=cutDir.clone().transformDirection(inv).normalize();
  const art=hit?hit.art:'SCHNITT', clean=hit?hit.clean:true; let mesh;
  if(art==='STICH'){mesh=new THREE.Mesh(new THREE.CircleGeometry(0.022,8),matCol(0x100704,0.45,0));}
  else if(art==='SCHLAG'){mesh=new THREE.Mesh(new THREE.CircleGeometry(0.058,12),matCol(0x351d12,0.4,0));}
  else{mesh=new THREE.Mesh(new THREE.PlaneGeometry(0.15,0.014),matCol(clean?0x0e0604:0x281610,0.5,0));}              // Schnitt: Strich entlang Klingenbahn
  mesh.quaternion.copy(orientToNormal(ln,ld));mesh.position.copy(lp).addScaledVector(ln,0.006);
  arena.dummy.add(mesh);arena.scars.push(mesh);
  if(arena.scars.length>30){const o=arena.scars.shift();if(o.parent)o.parent.remove(o);}}

const _ZEROV=new THREE.Vector3();
function bladeCurve(s){if(arena._impact||!arena._curveDir)return _ZEROV;return arena._curveDir.clone().multiplyScalar(curveY(s,P));}   // seitlicher Klingen-Versatz im Weltraum
function bladeHitsColumn(handW,bladeDir,c,R,yLo,yHi){const e0=arena._edge0,e1=arena._edge1,eLen=Math.max(0.02,e1-e0),N=Math.max(6,Math.ceil(eLen/0.09));  // Schneide (gekrümmt) gegen Säulenziel
  for(let i=0;i<=N;i++){const s=i/N,pt=handW.clone().addScaledVector(bladeDir,e0+s*eLen).add(bladeCurve(s));if(Math.hypot(pt.x-c.x,pt.z-c.z)<R&&pt.y>yLo&&pt.y<yHi)return pt;}return null;}

function arenaEnter(){if(arena.active)return;arena.active=true;arena.besuch=(arena.besuch||0)+1;
  weapon.visible=false;controls.enabled=false;
  arena.group=new THREE.Group();scene.add(arena.group);arena.group.add(buildGround());arena.teile=[];arena.tonStoffe=[];
  for(const k of ['folge','ton','fall','bogen','kamera'])ZU[k]=SC.arenaStrom(arena.besuch,k.charCodeAt(0)*131+k.length);   // je Besuch eigene, feste Würfe
  arena.camSaved={pos:cam.position.clone(),tgt:controls.target.clone(),fov:cam.fov};
  arena.player.set(0,0,0);arena.yaw=0;arena.pitch=0;fx.fov=fx.fovT=75;cam.fov=75;arena.arrows.length=0;arena.stuck.length=0;arena.fallingBamboo=[];
  arena.swinging=arena.thrusting=false;arena.holdView=false;arena.ready=0;arena.sw={yaw:0,pitch:0,reach:0};arena.swRoll=0;arena._rollRend=0;arena._aimF=0;arena._edgeAlign=1;arena.drawFrac=0;arena.drawing=false;arena._wantAim=false;arena.raise=0;arena.prevTip=null;arena.swP=0;arena.swY=0;arena.swLay=0;arena._prevSwY=0;arena._pressing=false;arena._dragMag=0;arena.lungeT=0;arena.mStats={hits:0,dmg:0};arena.scars=[];arena.stam=1;arena._prevSwP=0;arena._restT=0;
  arena.trail.mesh=null;arena.trail.pts=[];
  arena.popinjays=[];arena.targets=[];arena.bamboo=[];arena.movers=[];arena.thrustRings=[];arena.gauntlet=[];arena.knightArenas=null;
  // DER HOF DES KERNS: jede Art an ihrem Ort, ihr Satz aus Gestalten — Waffenhof (+z), Schnitthof (−z), Schießbahn (+x)
  for(const [art,x,z,yaw,ov] of SC.ARENA_HOF){
    if(art==='ritter'||art==='kaempfer'){buildKnightField(art,x,z);continue;}
    const S=arenaArt(art,x,z,yaw,ov),T0=S[0];
    if(art==='waffentisch')buildTable(T0);
    else if(art==='pell'){arena.pell=T0;arena.dummy=T0.h;T0.eigen=true;}
    else if(art==='stechringe')for(const T of S.slice(1)){T.eigen=true;arena.thrustRings.push({T,R:0.16,scored:false,flash:0});}
    else if(art==='quintane'){arena.quintain=S[1];S[1].eigen=true;S[1].hitCD=0;}
    else if(art==='pendelkugel'){arena.pendulum=S[1];S[1].eigen=true;S[1].hitCD=0;}
    else if(art==='drehbaum'){arena.spintree=S[1];S[1].eigen=true;S[1].hitCD=0;}
    else if(art==='federpfahl'){arena.springPell={T:S[1],hitCD:0,combo:0,lastHitT:-9};S[1].eigen=true;}
    else if(art==='trefferfolge'){arena.sequence={pads:S.map(T=>(T.eigen=true,{T,lit:false,ton:null})),active:2,hitCD:0,combo:0,best:0,lastT:-9};arena.sequence.pads[2].lit=true;}
    else if(art==='streitpuppe'){arena.charger={T:T0,home:T0.basis.clone(),speed:3.0,state:'dormant',hitCD:0,_wasNear:false};T0.eigen=T0.pfeilEigen=true;}
    else if(art==='pendelgasse')S.slice(1).forEach((T,i)=>{T.eigen=true;T.hitCD=0;arena.gauntlet.push(T);SC.geraetStoss(T.z,T.z.m*0.7,[0,-1.35,0],[i%2?1:-1,0,0]);});   // der Anstoß der Gasse: wechselnd
    else if(art==='bambus'||art==='schnittgasse')S.slice(1).forEach(T=>{T.eigen=true;arena.bamboo.push({T,wx:T.basis.x,wz:T.basis.z,baseY:T.basis.y,h:T.ov.hoeheM,cut:false,lane:art==='schnittgasse'});});
    else if(art==='tatami'){S[1].eigen=true;arena.tatami={T:S[1],pivot:S[1].basis.clone(),rollLen:1.0,cut:false,respawnAt:0};}
    else if(art==='harnisch'){arena.armored={T:T0,flash:0,spark:0,hitCD:0,dent:0,breach:0,deflect:0};T0.eigen=true;}
    else if(art==='zielscheibe'){const R=(ov&&ov.radiusM)||0.4,H=(ov&&ov.hoeheM)||1.42;T0.pfeilEigen=true;arena.targets.push({T:T0,pos:new THREE.Vector3(x,H,z),R});}
    else if(art==='kirmes')S.slice(1).forEach((T,i)=>{T.pfeilEigen=true;arena.movers.push({T,baseX:T.basis.x,baseY:T.basis.y+0.18,z0:T.basis.z,amp:2.7,w:0.55+i*0.18,phase:i*2.0,worldZ:T.basis.z,hit:false,hitAt:0});});
    else if(art==='papagei'){S[1].pfeilEigen=true;arena.popinjays.push({T:S[1],base:S[1].basis.clone().add(new THREE.Vector3(0,0.13,0)),struck:false,respawnAt:0});}
    else if(art==='weidenrute'){T0.pfeilEigen=true;arena.wand={T:T0,x,z,R:0.22,y0:0.90,y1:1.92,struck:false,respawnAt:0};}
    else if(art==='clout'){arena.clout={x,z,R:1.5,fahne:S[1]};}
    else if(art==='wurfscheibe'){const disc=SC.buildInstance('tontaube',1,0);disc.visible=false;arena.group.add(disc);
      arena.clay={thrower:new THREE.Vector3(x,0,z),disc,arm:S[1],mTon:SC.geraetZustand('tontaube').m,active:false,nextT:1.5,vel:new THREE.Vector3(),pos:new THREE.Vector3(),broke:0};}
    else if(art==='pendelziel'){S[1].pfeilEigen=true;arena.swingTgt={T:S[1],R:0.36,struck:false,respawnAt:0,anstossAb:0,seite:1};}
  }
  // ── Geräte-Register: eine Wahrheit für Update + Nahkampf + Pfeil. Neues Gerät = eine Zeile. ──
  arena.devices=[
    {update:updateQuintain, melee:tryHitQuintain},
    {update:updatePendulum, melee:tryHitPendulum},
    {update:updateSpinTree, melee:tryHitSpinTree},
    {update:updateCharger,  melee:tryHitCharger,  arrow:tryArrowCharger},
    {update:updateSpringPell,melee:tryHitSpringPell},
    {update:updateSequence, melee:tryHitSequence},
    {update:updateGauntlet, melee:tryHitGauntlet},
    {update:updateArmored,  melee:tryHitArmored},
    {update:updateKnights,  melee:tryHitKnight},
    {update:updateRings},
    {update:updatePopinjay},
    {update:updateWand},
    {update:updateClay,     arrow:tryArrowClay},
    {update:updateSwingTarget,arrow:tryArrowSwing},
    {melee:tryHitTeil,      arrow:tryArrowTeil},
  ];
  equipWeapon(currentGattung);ensureTrailMesh();placeViewModel(0);
  document.getElementById('arena-ui').style.display='block';
  ['lehren','ctl','leg','hint','ring-info'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none';});
  document.getElementById('arena-toggle').textContent='← Werkstatt';hudHint();updateHUD();}
function arenaExit(){if(!arena.active)return;arena.active=false;controls.enabled=true;weapon.visible=true;
  if(document.pointerLockElement)document.exitPointerLock();
  if(arena.group){clear(arena.group);arena.group=null;}arena.arrows.length=0;arena.stuck.length=0;arena.trail.mesh=null;arena.trail.pts=[];
  for(const m of arena.tonStoffe||[])m.dispose();arena.tonStoffe=[];arena.teile=[];
  arena.vm=arena.dummy=arena.pell=arena.target=arena.vmWeapon=arena.arm=null;arena.swinging=arena.thrusting=false;arena.drawing=false;
  if(arena.camSaved){cam.position.copy(arena.camSaved.pos);controls.target.copy(arena.camSaved.tgt);cam.fov=arena.camSaved.fov;cam.updateProjectionMatrix();}
  ['lehren','ctl','leg','hint'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='';});
  document.getElementById('arena-ui').style.display='none';document.getElementById('arena-toggle').textContent='Prüfstand ⚔';}
function arenaToggle(){arena.active?arenaExit():arenaEnter();}
function toggleHand(){arena.right=!arena.right;computeBaseQuat();popText(arena.right?'rechtshändig':'linkshändig','#9fb3c8',0,-0.1);}

function updateMovement(dt){const k=arena.keys,B=camBasis();let f=0,r=0;
  if(k.w)f+=1;if(k.s)f-=1;if(k.d)r+=1;if(k.a)r-=1;
  arena._vel=arena._vel||new THREE.Vector3();
  arena._crouchY=lerp(arena._crouchY||0,k.ctrl?0.42:0,clamp(dt*10,0,1));                                  // STRG: weich ducken
  const want=new THREE.Vector3();if(f||r){want.copy(B.fwdG).multiplyScalar(f).addScaledVector(B.right,r);if(want.lengthSq()>0)want.normalize();}
  const spd=k.ctrl?0.5:(k.shift?1.7:1.0);arena._sprinting=(spd>1.1&&want.lengthSq()>0.5);                 // Sprint in JEDE Richtung, geduckt langsamer
  const target=want.lengthSq()>0?want.clone().multiplyScalar(ARENA.walk*spd):new THREE.Vector3();
  arena._vel.lerp(target,clamp(dt*(want.lengthSq()>0?9:13),0,1));                                         // Trägheit: anlaufen / abbremsen
  if(arena._vel.length()<0.03&&want.lengthSq()===0){arena._vel.set(0,0,0);arena.bob*=0.9;return;}
  arena.player.addScaledVector(arena._vel,dt);
  const R=Math.hypot(arena.player.x,arena.player.z);if(R>30)arena.player.multiplyScalar(30/R);
  if(arena.dummy){const dp=arena.dummy.position,d=arena.player.clone().setY(0).sub(dp.clone().setY(0));if(d.length()<0.55){d.setLength(0.55);arena.player.x=dp.x+d.x;arena.player.z=dp.z+d.z;}}
  arena.bob=Math.min(1,arena.bob+dt*4*(arena._sprinting?1.6:1)*(k.ctrl?0.6:1));}

// — NAHKAMPF: Schwung (links, Maus führt) ODER Stich (rechts, Arm stößt vor) —
// DER SCHWUNG-KEGEL (K13): trifft der Strahl des Fadenkreuzes die Puppe nicht, waehlt der Hieb sie im Sektor der Klinge —
// Gier +-arcHalfRad um den Blick, Neigung bis zielKegelUntenRad UNTER dem Fadenkreuz (SC.ARENA.schwung: dieselbe Zeile, die die Welt liest).
function kegelZiel(obj){const K=SC.ARENA.schwung,bb=new THREE.Box3().setFromObject(obj),c=bb.getCenter(new THREE.Vector3()),d=cam.getWorldDirection(new THREE.Vector3()),o=cam.position;
  const nF=Math.asin(clamp(d.y,-1,1));let dg=Math.atan2(c.x-o.x,c.z-o.z)-Math.atan2(d.x,d.z);dg=Math.atan2(Math.sin(dg),Math.cos(dg));if(Math.abs(dg)>K.arcHalfRad)return null;
  const h=Math.hypot(c.x-o.x,c.z-o.z),yS=o.y+Math.tan(nF)*h,yLo=o.y+Math.tan(nF-K.zielKegelUntenRad)*h,y=Math.min(bb.max.y,yS);   // der Punkt der Puppe am naechsten unter dem Fadenkreuz
  return (y<yLo||y<bb.min.y)?null:new THREE.Vector3(c.x,y,c.z);}
function aimDummy(){if(!arena.dummy)return null;_RC.setFromCamera({x:0,y:0},cam);let hits=_RC.intersectObject(arena.dummy,true);
  if(!hits.length){const P=kegelZiel(arena.dummy);if(P){_RC.set(cam.position,P.sub(cam.position).normalize());hits=_RC.intersectObject(arena.dummy,true);}}
  if(!hits.length)return null;const d=hits[0].distance;if(d>1.9)return null;const y=hits[0].point.y;
  const ZN=SC.ARENA.zonen,zk=SC.geraetZone('pell',arena.dummy.worldToLocal(hits[0].point.clone()).y),z={n:ZN[zk].n,m:ZN[zk].mul,k:zk};   // Zonen-Tafel und Zone des Leibs leben im Kern (Puppe, Welt-Tier, die Leiber der Arena)
  const nrm=hits[0].face?hits[0].face.normal.clone().transformDirection(hits[0].object.matrixWorld).normalize():new THREE.Vector3(1,0,0);
  return {zone:z,dist:d,y,point:hits[0].point.clone(),normal:nrm};}
function startThrust(){arena.thrusting=true;arena.lungeT=0;arena.swP=0;arena.swY=0;arena.swLay=0;arena.prevTip=null;arena.ready=Math.max(arena.ready,0.6);}  // Stich aus dem Klick-Impuls (Arm engagiert)
function meleeSwingUpdate(realDt,dt){const m=measure(P),S=m.S;arena._m=m;
  // Bereitschaft (Auftrag): Halten = zielen; der Schwung startet NUR noch aus dem Zug (>12px, mousemove) — kein Zeit-Auto-Schwung mehr, der die Klinge an den Bauch legte
  if(arena.thrusting){arena.lungeT=(arena.lungeT||0)+realDt;const TL=0.34;if(arena.lungeT>=TL){arena.thrusting=false;arena.cooldown=Math.max(arena.cooldown,0.10);}
    const u=clamp((arena.lungeT||0)/TL,0,1);arena.sw.reach=Math.sin(u*Math.PI)*0.55;}                                              // Ausfall: 0→0.55→0 (vor + zurück)
  else arena.sw.reach=lerp(arena.sw.reach||0,0,clamp(realDt*12,0,1));
  arena._aimF=lerp(arena._aimF||0,(arena._pressing&&!arena.swinging&&!arena.thrusting)?1:0,clamp(realDt*((arena._pressing&&!arena.swinging)?10:14),0,1));   // Bereitschaft: Spitze zur Blicklinie (zielen), fällt beim Schwung schnell ab
  const IS=Math.max(0.02,(m.Inorm||0.1)*m.M*S.L*S.L),drag=1+Math.pow(IS/0.16,0.45)*0.45,sw=arena.sw;const stamF=clamp((arena.stam!=null?arena.stam:1)*1.5,0.35,1);   // Trägheit: I/0.16 normiert (Schwert≈1), drag 1.0 leicht → 2.5 Vorschlaghammer
  const gain=(arena.holdView?0.0140:0.0090)/Math.sqrt(drag)*stamF;               // Blick halten = aus dem Körper schlagen: voller Klingenweg trotz fixiertem Auge
  if(arena.swinging){ arena.swP=(arena.swP||0)+(-arena._mdy*gain); arena.swY=(arena.swY||0)+(-arena._mdx*gain);
    arena.swP=clamp(arena.swP,-1.95,0.7); arena.swY=clamp(arena.swY,-1.6,1.6); }
  else if(!arena.holdView){ arena.swP=lerp(arena.swP||0,0,clamp(realDt*9,0,1)); arena.swY=lerp(arena.swY||0,0,clamp(realDt*9,0,1)); }   // Blick halten → Klinge hält ihre Lage (driftet nicht in die Vertikale)
  arena._mdx=0;arena._mdy=0;
  const yawRate=Math.abs(arena.swY-(arena._prevSwY||0))/Math.max(1e-3,realDt);
  const _angM=Math.abs(arena.swP-(arena._prevSwP||0))+Math.abs(arena.swY-(arena._prevSwY||0));arena._prevSwP=arena.swP;
  if(_angM>0.03)arena._restT=0;else arena._restT=(arena._restT||0)+realDt;
  arena.stam=clamp((arena.stam!=null?arena.stam:1)-_angM*(m.M/1.4)*0.011+(arena._restT>0.25?0.25*realDt:0),0,1);
  arena._prevSwY=arena.swY;
  const layT=clamp(yawRate*0.50,0,1)*(arena.swinging?1:0);                                // Fliehkraft + Angriffsabsicht: horizontaler Schwung legt die Klinge waagrecht (max Reichweite)
  arena.swLay=lerp(arena.swLay||0,layT,clamp(realDt*(layT>(arena.swLay||0)?13:(arena.swinging?2:8)),0,1));   // gelegte Klinge verharrt beim Führen
  const rate=clamp(realDt*18/Math.sqrt(drag),0,1);                          // Trägheit: Klinge folgt verzögert (durchgezogen, federt nicht zurück)
  sw.pitch=lerp(sw.pitch,arena.swP,rate); sw.yaw=lerp(sw.yaw,arena.swY,rate);
  cam.updateMatrixWorld(true);arena.vm.updateMatrixWorld(true);
  const bladeDir=new THREE.Vector3(1,0,0).applyQuaternion(arena._weaponQ||arena.baseQuat).applyQuaternion(arena.vm.quaternion);arena._curveDir=new THREE.Vector3(0,1,0).applyQuaternion(arena._weaponQ||arena.baseQuat).applyQuaternion(arena.vm.quaternion);   // gezielte Klinge (Spitze auf Fadenkreuz)
  const gripW=arena.vm.localToWorld(arena._gripR.clone()), tip=gripW.clone().addScaledVector(bladeDir,arena.bladeL).add(bladeCurve(1));
  if(arena.prevTip&&arena.swinging&&!arena._impact){const _tv=tip.clone().sub(arena.prevTip);            // wahre Schneide (a): Ziel-Rolle aus der ECHTEN Spitzenbahn
    const _tvL=_tv.clone().addScaledVector(bladeDir,-_tv.dot(bladeDir));
    if(_tvL.length()/Math.max(1e-4,realDt)>1.2){const _f=new THREE.Vector3().crossVectors(bladeDir,arena._curveDir);
      arena.swRoll=(arena._rollRend||0)+Math.atan2(_tvL.dot(_f),_tvL.dot(arena._curveDir));}}            // kürzeste Drehung der Schneidenebene in die Bahn (um die Klingenachse)
  arena._rollRend=lerp(arena._rollRend||0,arena.swRoll||0,arena.swinging?rate:clamp(realDt*6,0,1));      // DIESELBE Trägheit wie Pitch/Yaw: schwere Klinge dreht die Schneide träger ein
  if(!arena.swinging&&!arena.thrusting){const _home=Math.round((arena._rollRend||0)/6.283185307)*6.283185307;arena.swRoll=lerp(arena.swRoll||0,_home,clamp(realDt*6,0,1));}   // Ruhe: Schneide kehrt in die natürliche Trage-Lage zurück
  if(arena.cooldown>0)arena.cooldown-=realDt;
  const aim=aimDummy();                                                                  // Blick → Zone (wohin du schaust)
  if(arena.prevTip&&(arena.swinging||arena.thrusting)){const vel=tip.clone().sub(arena.prevTip).divideScalar(Math.max(1e-4,realDt));   // reale Uhr: im Hit-Freeze läuft dt auf 5%, die Klinge aber real -> sonst ×20 Tempo / ×400 KE
    if(arena.thrusting){tryThrustRing(tip,arena.prevTip,realDt);tryThrustBamboo(tip,arena.prevTip,realDt);}
    if(arena.cooldown<=0&&vel.length()>1.8/Math.max(1,Math.pow(drag,0.7))){const _vlv=vel.clone().addScaledVector(bladeDir,-vel.dot(bladeDir));const vAx=Math.abs(vel.dot(bladeDir)),vLat=_vlv.length();
      arena._edgeAlign=(!arena._impact&&vLat>1e-3)?Math.abs(_vlv.multiplyScalar(1/vLat).dot(arena._curveDir)):1;   // GEMESSEN am Treffer: |v̂_lat · Schneidenrichtung_Welt| — beide Vektoren real
      if(aim){landMelee(aim.zone,vLat,vAx,aim.point,vel);addDummyScar(aim.point,aim.normal,bladeDir,arena.lastHit);arena.cooldown=0.30;}else{let _mh=false;for(const d of (arena.devices||[])){if(d.melee&&d.melee(gripW,bladeDir,vel)){_mh=true;break;}}if(!_mh){tryCutBamboo(gripW,bladeDir,vel);tryCutTatami(gripW,bladeDir,vel);}}}}
  arena.prevTip=tip.clone();
  if(arena.swinging)pushTrail(tip);else if(arena.trail.pts.length)arena.trail.pts.shift();
  buildTrailGeom();}
function landMelee(z,vLat,vAx,ort,vel){const u=SC.trefferUrteil(measure(P),{vLat,vAx,edgeQ:arena._edgeAlign,zone:z.k,P});   // DAS TREFFER-URTEIL lebt im Kern (schmiede trefferUrteil, Welle L) — die Shell zeigt es, die Welt richtet damit
  const KE=u.KE,art=u.art,clean=u.clean,verdict=u.verdict;arena.lastHit=art==='STICH'?{art,KE,v:u.v,pen:u.pen,clean,zone:z,verdict}:{art,KE,v:u.v,clean,zone:z,edgeQ:u.edgeQ,verdict};
  const e=KE*z.m;arena.mStats=arena.mStats||{hits:0,dmg:0};arena.mStats.hits++;arena.mStats.dmg+=e;fx.freeze=clamp(e*0.0011+(clean?0.05:0),0.04,0.20)*(art==='SCHLAG'?1.25:1);
  fx.shake=clamp(e*0.004*(art==='SCHLAG'?1.5:0.9),0.02,0.42);const B=camBasis();fx.kickV.copy(B.fwd).multiplyScalar(-e*0.012);fx.kickV.y-=e*0.005;
  if(arena.pell&&ort&&vel)arenaStoss(arena.pell,ort,vel,u);                                      // der EINE Stoß: das Pell wankt nach dem Gesetz des Kerns
  popText((art==='STICH'?'➤ ':art==='SCHNITT'?'✂ ':'✹ ')+KE.toFixed(0)+' J',clean?'#ffe07a':'#d96a4a',0,-0.04);
  popText(z.n+(clean?'':' · '+verdict),clean?'#9fb3c8':'#d96a4a',0.1,0.05);updateHUD();}

function ensureTrailMesh(){if(arena.trail.mesh||!arena.group)return;const mat=new THREE.MeshBasicMaterial({transparent:true,opacity:0.72,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true});
  arena.trail.mesh=new THREE.Mesh(new THREE.BufferGeometry(),mat);arena.trail.mesh.frustumCulled=false;arena.group.add(arena.trail.mesh);}
function pushTrail(tip){if(!arena.vm)return;const mid=arena.vm.localToWorld(arena._gripR.clone().addScaledVector(new THREE.Vector3(1,0,0).applyQuaternion(arena.baseQuat),arena.bladeL*0.4));
  arena.trail.pts.push({tip:tip.clone(),mid});if(arena.trail.pts.length>12)arena.trail.pts.shift();}
function buildTrailGeom(){ensureTrailMesh();if(!arena.trail.mesh)return;const pts=arena.trail.pts;if(pts.length<2){arena.trail.mesh.visible=false;return;}arena.trail.mesh.visible=true;
  const pos=[],col=[],n=pts.length;
  for(let i=0;i<n-1;i++){const a=pts[i],b=pts[i+1],fa=(i/(n-1))*0.9,fb=((i+1)/(n-1))*0.9,ca=[fa*0.7,fa*0.85,fa],cb=[fb*0.7,fb*0.85,fb];
    pos.push(a.tip.x,a.tip.y,a.tip.z,a.mid.x,a.mid.y,a.mid.z,b.mid.x,b.mid.y,b.mid.z, a.tip.x,a.tip.y,a.tip.z,b.mid.x,b.mid.y,b.mid.z,b.tip.x,b.tip.y,b.tip.z);
    col.push(...ca,...ca,...cb,...ca,...cb,...cb);}
  const g=arena.trail.mesh.geometry;g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));}

// — BOGEN: links = ans Auge, rechts = spannen & halten, rechts loslassen = Schuss —
function doRelease(){if(arena.kind!=='bow')return;if(arena.drawFrac<0.25){arena.drawing=false;arena.drawFrac=0;arena._builtFrac=-1;return;}
  arena.drawing=false;fx.fovT=75;const E=Math.max(1,P.energie||40),v0=Math.sqrt(2*E/ARENA.mArrow)*arena.drawFrac,B=camBasis();
  const fwd=B.fwd.clone();fwd.x+=(zufall('bogen')-0.5)*arena.sway*0.04;fwd.y+=(zufall('bogen')-0.5)*arena.sway*0.04;fwd.normalize();
  cam.updateMatrixWorld(true);const start=arena.vm.localToWorld(arena._gripR.clone().addScaledVector(new THREE.Vector3(1,0,0).applyQuaternion(arena.baseQuat),0.2));
  const arr=buildPfeil();arena.group.add(arr);arr.position.copy(start);const KE=0.5*ARENA.mArrow*v0*v0;
  arena.arrows.push({mesh:arr,pos:start.clone(),vel:fwd.clone().multiplyScalar(v0),v0,KE,scored:false,life:0,trail:[start.clone()],line:null});
  arena.drawFrac=0;arena._builtFrac=-1;arena.holdT=0;arena.sway=0;fx.kickV.copy(B.fwd).multiplyScalar(-5);fx.kickV.y+=1.5;fx.shake=0.04;arena.lastShot={v0,KE};updateHUD();}
function stickArrow(a){a.stuck=true;a.vel.set(0,0,0);arena.stuck.push(a.mesh);if(arena.stuck.length>40){const o=arena.stuck.shift();if(o.parent)o.parent.remove(o);}if(a.line&&a.line.parent)a.line.parent.remove(a.line);}


function arenaUpdate(realDt){if(!arena.active)return;const now=clock.getElapsedTime();
  if(fx.freeze>0)fx.freeze-=realDt;const dt=fx.freeze>0?realDt*0.05:realDt;updateMovement(realDt);pickupCheck();updateFalling(realDt);regrowBamboo();regrowTatami();carnivalUpdate(now);for(const d of (arena.devices||[])){if(d.update)d.update(realDt);}arenaTakt(realDt);
  if(arena.kind==='bow'){arena.raise=lerp(arena.raise,(arena.drawing||arena._wantAim)?1:0,clamp(realDt*8,0,1));
    if(arena.drawing){arena.drawFrac=Math.min(1,arena.drawFrac+dt/0.9);fx.fovT=lerp(75,54,arena.drawFrac);if(arena.drawFrac>=1){arena.holdT+=dt;arena.sway=clamp((arena.holdT-0.7)*0.5,0,1);}}
    else if(arena.drawFrac>0){arena.drawFrac=Math.max(0,arena.drawFrac-realDt*2);}
    if(Math.abs(arena.drawFrac-arena._builtFrac)>0.05){const keep=arena.vmWeapon;arena.vm.remove(keep);P.drawFrac=arena.drawFrac;arena.vmWeapon=buildBogen(P,M.wood);arena.vm.add(arena.vmWeapon);arena._builtFrac=arena.drawFrac;}
    for(const a of arena.arrows){if(a.stuck)continue;a.vel.y-=ARENA.g*dt;const sp=a.vel.length();a.vel.multiplyScalar(Math.max(0,1-0.0016*sp*dt));
      a.pos.addScaledVector(a.vel,dt);a.mesh.position.copy(a.pos);if(sp>0.01)a.mesh.quaternion.setFromUnitVectors(_AX,a.vel.clone().normalize());a.life+=dt;
      if(!a.scored)hitMover(a);
      if(!a.scored&&arena.popinjays){for(const P2 of arena.popinjays){if(P2.struck)continue;const bp=P2.base;if(Math.hypot(a.pos.x-bp.x,a.pos.y-bp.y,a.pos.z-bp.z)<0.36){P2.struck=true;P2.respawnAt=clock.getElapsedTime()+3.5;pfeilStoss(P2.T,a);popText('Papagei getroffen!','#ffe07a',0,0);popText('+15','#6fcf73',0.12,0.06);a.scored=true;stickArrow(a);P2.T.h.attach(a.mesh);break;}}}
      if(!a.scored&&arena.dummy){const dp=arena.dummy.position;if(Math.hypot(a.pos.x-dp.x,a.pos.z-dp.z)<0.36&&a.pos.y>0.55&&a.pos.y<1.9){fx.shake+=0.05;pfeilStoss(arena.pell,a);popText('Pell getroffen','#d8b46a',0,0);popText('+8','#6fcf73',0.12,0.06);arena.score.shots++;arena.score.sum+=8;arena.score.last={ring:8,pen:a.KE*0.18,v0:a.v0,KE:a.KE,dist:Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z)};a.scored=true;stickArrow(a);arena.dummy.attach(a.mesh);updateHUD();}}
      if(!a.scored&&arena.wand&&!arena.wand.struck){const W=arena.wand;if(Math.hypot(a.pos.x-W.x,a.pos.z-W.z)<W.R&&a.pos.y>W.y0&&a.pos.y<W.y1){W.struck=true;W.respawnAt=clock.getElapsedTime()+3.0;pfeilStoss(W.T,a);fx.shake+=0.05;popText('WEIDENRUTE GETROFFEN — reine Präzision','#ffe07a',0,0);popText('+20','#6fcf73',0.12,0.06);arena.score.shots++;arena.score.sum+=20;arena.score.last={ring:20,pen:a.KE*0.18,v0:a.v0,KE:a.KE,dist:Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z)};a.scored=true;stickArrow(a);W.T.h.attach(a.mesh);updateHUD();}}
      if(!a.scored&&arena.clout){const C=arena.clout,hd=Math.hypot(a.pos.x-C.x,a.pos.z-C.z);if(a.pos.y<0.35&&a.vel.y<0&&hd<C.R){const ring=clamp(Math.ceil(6*(1-hd/C.R)),1,6);fx.shake+=0.05;popText('CLOUT — die Parabel sitzt · '+ring,'#ffe07a',0,0);popText('+'+(ring*3),'#6fcf73',0.12,0.06);arena.score.shots++;arena.score.sum+=ring*3;arena.score.last={ring:ring*3,pen:a.KE*0.18,v0:a.v0,KE:a.KE,dist:Math.hypot(a.pos.x-arena.player.x,a.pos.z-arena.player.z)};a.scored=true;stickArrow(a);updateHUD();}}
      for(const d of (arena.devices||[])){if(!a.scored&&d.arrow&&d.arrow(a))a.scored=true;}
      if(!a.scored){for(const T of arena.targets){if(a.pos.x>=T.pos.x-0.05&&a.pos.x<T.pos.x+0.35){const rr=Math.hypot(a.pos.y-T.pos.y,a.pos.z-T.pos.z);if(rr<=T.R+0.12){scoreArrowOn(a,T,rr);break;}}}}
      // was nichts traf, steckt im Boden oder endet hinter der Bahn (bis hier hing der Zweig am Ziel: kein Fehlschuss steckte, x > 30 hielt jeden vor dem Clout)
      if(a.stuck)continue;
      if(a.pos.y<=0.02){a.pos.y=0.02;a.mesh.position.copy(a.pos);stickArrow(a);popText('im Boden','#7a7f8c',0,0);}
      else if(a.life>9||a.pos.x>45){stickArrow(a);}}
  }else{arena.ready=lerp(arena.ready,(arena.swinging||arena.thrusting||arena._pressing)?1:0,clamp(realDt*16,0,1));meleeSwingUpdate(realDt,dt);
}
  applyCamera(realDt);placeViewModel(realDt);updateReticle();}

function applyCamera(dt){fx.fov=lerp(fx.fov,fx.fovT,clamp(dt*9,0,1));cam.fov=fx.fov;
  fx.kick.addScaledVector(fx.kickV,dt);fx.kickV.multiplyScalar(Math.pow(0.0003,dt));fx.kick.multiplyScalar(Math.pow(0.015,dt));
  const sh=fx.shake;fx.shake*=Math.pow(0.0006,dt);if(fx.shake<0.0008)fx.shake=0;
  const bob=Math.sin(clock.getElapsedTime()*9)*arena.bob*0.012,B=camBasis();
  cam.position.set(arena.player.x+(zufall('kamera')-0.5)*sh,ARENA.eyeY-(arena._crouchY||0)+bob+(zufall('kamera')-0.5)*sh+fx.kick.y,arena.player.z+(zufall('kamera')-0.5)*sh);
  cam.lookAt(cam.position.clone().add(B.fwd));cam.updateProjectionMatrix();}

function appendArenaUI(){
  const btn=document.createElement('button');btn.id='arena-toggle';btn.textContent='Prüfstand ⚔';
  btn.style.cssText='position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:50;background:#1c1c26;color:#d4a843;border:1px solid #3a3a48;border-radius:8px;padding:9px 18px;font:600 13px system-ui;cursor:pointer';
  btn.onclick=arenaToggle;document.body.appendChild(btn);
  const ui=document.createElement('div');ui.id='arena-ui';ui.style.cssText='position:fixed;inset:0;z-index:45;display:none;pointer-events:none;font:13px system-ui;color:#e8e6e0';
  ui.innerHTML='<div id="reticle" style="position:absolute;left:50%;top:50%;width:22px;height:22px;transform:translate(-50%,-50%)"><div style="position:absolute;inset:0;border:1.5px solid rgba(255,255,255,.5);border-radius:50%"></div><div style="position:absolute;left:50%;top:50%;width:3px;height:3px;background:#ffe07a;border-radius:50%;transform:translate(-50%,-50%)"></div></div>'
    +'<div id="drawmeter" style="position:absolute;left:50%;bottom:86px;transform:translateX(-50%);width:200px;height:8px;background:rgba(0,0,0,.45);border-radius:4px;overflow:hidden;display:none"><div id="drawfill" style="height:100%;width:0%;background:linear-gradient(90deg,#6fcf73,#d4a843,#d96a4a)"></div></div>'
    +'<div id="popups" style="position:absolute;left:50%;top:42%;width:0;text-align:center"></div>'
    +'<div id="arena-readout" style="position:absolute;left:18px;bottom:18px;background:rgba(18,18,26,.82);border:1px solid #2a2a38;border-radius:9px;padding:10px 13px;min-width:260px;line-height:1.5;backdrop-filter:blur(5px)"></div>'
    +'<div id="arena-hint" style="position:absolute;left:50%;bottom:18px;transform:translateX(-50%);color:#9fb3c8;font-size:11.5px;background:rgba(18,18,26,.7);padding:6px 12px;border-radius:7px"></div>'
    +'<div id="lockhint" style="position:absolute;left:50%;top:50%;transform:translate(-50%,44px);color:#d4a843;font-size:13px;background:rgba(18,18,26,.85);padding:8px 16px;border-radius:8px">Klick = Maus & Steuerung übernehmen</div>'+'<div id="pickup" style="position:absolute;left:50%;top:60%;transform:translateX(-50%);display:none;color:#1a1408;font-weight:700;font-size:14px;background:#d4a843;padding:7px 16px;border-radius:8px">E nehmen</div>';
  document.body.appendChild(ui);
  const cv=R.domElement;
  cv.addEventListener('click',()=>{if(arena.active&&!arena.locked)AnazhHuelle.zeiger(cv);});
  cv.addEventListener('contextmenu',e=>{if(arena.active)e.preventDefault();});
  document.addEventListener('pointerlockchange',()=>{arena.locked=(document.pointerLockElement===cv);const lh=document.getElementById('lockhint');if(lh)lh.style.display=arena.locked?'none':'block';});
  document.addEventListener('mousemove',e=>{if(!arena.active||!arena.locked)return;
    if(arena.kind==='melee'&&(arena.swinging||arena._pressing)){
      if(arena._pressing&&!arena.swinging){arena._dragMag=(arena._dragMag||0)+Math.abs(e.movementX)+Math.abs(e.movementY);if(arena._dragMag>12){arena.swinging=true;arena.swP=-1.20*(arena._windF||1);arena.swY=0;}}  // Zug → Schwung: leichte Klinge holt flach aus (Reichweite bleibt), schwere lädt voll
      if(arena.swinging){arena._mdx+=e.movementX;arena._mdy+=e.movementY;}
      if(!arena.holdView){arena.yaw+=e.movementX*ARENA.sens*0.5;arena.pitch=clamp(arena.pitch-e.movementY*ARENA.sens*0.5,-1.2,1.2);}}
    else{arena.yaw+=e.movementX*ARENA.sens;arena.pitch=clamp(arena.pitch-e.movementY*ARENA.sens,-1.2,1.2);}});
  document.addEventListener('mousedown',e=>{if(!arena.active||!arena.locked)return;
    if(arena.kind==='bow'){if(e.button===0)arena._wantAim=true;else if(e.button===2)arena.drawing=true;}
    else{if(e.button===0){arena._pressing=true;arena._downT=clock.getElapsedTime();arena._dragMag=0;arena.swP=0;arena.swY=0;arena.trail.pts=[];}else if(e.button===2){arena.holdView=true;}}});  // links: Klick-Impuls=Stich, Halten/Ziehen=Ausgangsstellung
  document.addEventListener('mouseup',e=>{if(!arena.active||!arena.locked)return;
    if(arena.kind==='bow'){if(e.button===2)doRelease();else if(e.button===0){arena._wantAim=false;}}
    else{if(e.button===0){if(arena._pressing&&!arena.swinging&&(arena._dragMag||0)<12&&arena.cooldown<=0)startThrust();arena.swinging=false;arena._pressing=false;}else if(e.button===2)arena.holdView=false;}});
  document.addEventListener('keydown',e=>{if(!arena.active)return;const k=e.key.toLowerCase();
    if(k==='w')arena.keys.w=1;else if(k==='s')arena.keys.s=1;else if(k==='a')arena.keys.a=1;else if(k==='d')arena.keys.d=1;else if(k==='shift')arena.keys.shift=1;else if(k==='control')arena.keys.ctrl=1;else if(k==='h')toggleHand();else if(k==='e'){if(arena._nearKnightField){const F=arena._nearKnightField;F.active=true;for(const KK of F.knights)if(KK.state==='dormant')KK.state='approach';popText(F.armored?'⚔ DIE RITTER ERHEBEN SICH':'⚔ DIE KÄMPFER STELLEN SICH','#ffce6a',0,-0.10);popText(F.armored?'Schnitt prallt ab — Stich ins Visier (Auge) oder stumpfe Wucht':'ungepanzert — jeder Hieb sitzt','#cfe0a0',0,0.06);}else if(arena._nearCharger&&arena.charger&&arena.charger.state==='dormant'){arena.charger.state='charge';arena.charger.hitCD=0;popText('Streitpuppe greift an!','#ff8a4a',0,0);}else if(arena._near)equipWeapon(arena._near.name);}});
  document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='w')arena.keys.w=0;else if(k==='s')arena.keys.s=0;else if(k==='a')arena.keys.a=0;else if(k==='d')arena.keys.d=0;else if(k==='shift')arena.keys.shift=0;else if(k==='control')arena.keys.ctrl=0;});
}
function hudHint(){document.getElementById('arena-hint').textContent=arena.kind==='bow'
  ?'WASD = laufen · Maus = zielen · LINKE Maus = ans Auge heben · RECHTE Maus = spannen & halten, loslassen = Schuss · H = Hand'
  :'WASD = laufen · SHIFT = sprinten · STRG = ducken · Maus = blicken · LINKE Maus halten = Schwung · kurz klicken = Stich · RECHTE Maus = Blick halten (Klinge führen) · H = Hand';
  document.getElementById('drawmeter').style.display=arena.kind==='bow'?'block':'none';}
function updateReticle(){const ret=document.getElementById('reticle');if(!ret)return;let s=22;if(arena.kind==='bow')s=lerp(40,14,arena.drawFrac)+arena.sway*40;else if(arena.swinging)s=30;ret.style.width=ret.style.height=s.toFixed(0)+'px';if(arena.kind==='bow')document.getElementById('drawfill').style.width=(arena.drawFrac*100).toFixed(0)+'%';}
function popText(txt,color,ox,oy){const c=document.getElementById('popups');if(!c)return;const d=document.createElement('div');
  d.textContent=txt;d.style.cssText='position:absolute;left:'+(ox*innerWidth*0.3)+'px;top:'+(oy*innerHeight)+'px;transform:translate(-50%,0);color:'+color+';font:800 25px system-ui;letter-spacing:.3px;text-shadow:0 1px 2px #000,0 0 7px rgba(0,0,0,.85);background:rgba(9,7,5,.46);padding:6px 15px;border-radius:8px;border:1px solid rgba(255,255,255,.09);box-shadow:0 4px 14px rgba(0,0,0,.4);opacity:1;transition:all .9s ease-out;white-space:nowrap';
  c.appendChild(d);requestAnimationFrame(()=>{d.style.top=(oy*innerHeight-60)+'px';d.style.opacity='0';});setTimeout(()=>d.remove(),950);}
function updateHUD(){const ro=document.getElementById('arena-readout');if(!ro)return;
  if(arena.kind==='bow'){const E=Math.max(1,P.energie||40),v=Math.sqrt(2*E/ARENA.mArrow)*arena.drawFrac;let dist=999;if(arena.targets)for(const T of arena.targets)dist=Math.min(dist,Math.hypot(T.pos.x-arena.player.x,T.pos.z-arena.player.z));
    let s='<b style="color:#d4a843">BOGEN</b> · Distanz '+dist.toFixed(0)+' m'+(arena.right?' · rechts':' · links')+'<br>Zug '+(arena.drawFrac*100|0)+'%  ·  v '+v.toFixed(0)+' m/s  ·  '+(0.5*ARENA.mArrow*v*v).toFixed(0)+' J';
    if(arena.score.last){const L=arena.score.last;s+='<br><span style="color:'+(L.ring>=9?'#ffe07a':L.ring>=6?'#9fb3c8':'#d96a4a')+'">'+(L.ring>0?'Letzter: '+L.ring+' Ringe ('+L.dist.toFixed(0)+' m) · '+L.pen.toFixed(0)+' cm':'daneben')+'</span>';}
    if(arena.score.shots)s+='<br><span style="opacity:.6">Schnitt '+(arena.score.sum/arena.score.shots).toFixed(1)+' über '+arena.score.shots+' · '+arena.stuck.length+' Pfeile stecken</span>';
    ro.innerHTML=s;
  }else{let s='<b style="color:#d4a843">NAHKAMPF</b> · '+currentGattung+(arena.right?' · rechts':' · links');const h=arena.lastHit;
    if(h)s+='<br><b>'+h.art+'</b> '+h.KE.toFixed(0)+' J · '+h.v.toFixed(1)+' m/s'+(h.pen?' · '+h.pen.toFixed(0)+' cm':'')+'<br><span style="color:'+(h.clean?'#6fcf73':'#d96a4a')+'">'+h.verdict+'</span> · '+h.zone.n;
    else s+='<br><span style="opacity:.6">linke Maus halten = Schwung (trifft wohin du schaust) · rechte Maus = Blick halten</span>';
    if(arena.mStats)s+='<br><span style="opacity:.7">Treffer '+arena.mStats.hits+' · Schaden gesamt '+arena.mStats.dmg.toFixed(0)+' J</span>';{const _st=(arena.stam!=null?arena.stam:1),_sb=Math.round(_st*10),_bc=_st>0.5?'#6fcf73':_st>0.25?'#d4a843':'#d96a4a';s+='<br><span style="opacity:.85">Ausdauer <span style="color:'+_bc+'">'+'\u2588'.repeat(_sb)+'<span style="opacity:.25">'+'\u2588'.repeat(10-_sb)+'</span></span>'+(_st<0.25?'  <span style="color:#d96a4a">erschöpft</span>':'')+'</span>';}
    ro.innerHTML=s;}}


// ════════════════════════════════════════════════════════════════════
// ANIMATION
// ════════════════════════════════════════════════════════════════════
const clock=new THREE.Clock();
let _lastT=0;
// — DAS SEIL (physik.K4) — EIN Löser für Labor und Welt: der Kern rechnet Zustand, Schritt und die Pose jedes Teils (SC.seilZustand ·
//   seilSchritt · seilPosen — die Hand der Welt ruft dieselben, `_seilTakt`). Je Gerät mit Seil-Teilen (userData.__seil, die Gestalt
//   des Kerns) sein Zustand aus dem Seil des Geräts (SC.seilGesetz: Eintrag der Gattung, Anker am Ende des Schafts, Werkstoff); der Anker folgt dem Gerät, die Schwere der Szene treibt; ein
//   ruhendes Seil rechnet nicht. Ein neuer Bau (Regler, Gattung) ist ein neues Gerät, sein Seil beginnt in Ruhe. —
const _seilZ=new WeakMap(),_sv={a:new THREE.Vector3(),s:new THREE.Vector3(),q:new THREE.Quaternion(),inv:new THREE.Matrix4(),W:new THREE.Matrix4()};
function seilTakt(g,dt){if(!g||!g.parent||!P.seil||P.modus!=='wucht')return;let e=_seilZ.get(g);
  if(!e){const teile=[];g.traverse(m=>{if(m.isMesh&&Number.isInteger(m.userData.__seil))teile[m.userData.__seil]=m;});
    e={seil:SC.seilGesetz(P,stations(P)),teile,z:null,posen:null};_seilZ.set(g,e);}
  if(e.teile.length!==e.seil.glieder+1||!e.teile.every(Boolean))return;
  g.updateWorldMatrix(true,true);const A=_sv.a.fromArray(e.seil.anker).applyMatrix4(g.matrixWorld),anker=[A.x,A.y,A.z];
  if(!e.z){g.getWorldScale(_sv.s);e.skala=(Math.abs(_sv.s.x)+Math.abs(_sv.s.y)+Math.abs(_sv.s.z))/3;e.z=SC.seilZustand(e.seil,anker,[0,-1,0],e.skala);for(const m of e.teile)m.matrixAutoUpdate=false;}
  else if(!SC.seilSchritt(e.z,anker,dt,[0,-SC.SEIL_GESETZ.schwere*e.skala,0]))return;
  g.getWorldQuaternion(_sv.q);e.posen=SC.seilPosen(e.z,e.seil,[_sv.q.x,_sv.q.y,_sv.q.z,_sv.q.w],e.posen);
  e.teile.forEach((m,i)=>{_sv.inv.copy(m.parent.matrixWorld).invert();m.matrix.multiplyMatrices(_sv.inv,_sv.W.fromArray(e.posen,16*i));m.matrixWorldNeedsUpdate=true;});}
function animate(){const t=clock.getElapsedTime();const dt=Math.min(0.05,t-_lastT);_lastT=t;
  if(!arena.active)controls.update();
  if(arena.active)arenaUpdate(dt);
  seilTakt(gWeapon,dt);if(arena.active)seilTakt(arena.vmWeapon,dt);                                 // das Seil nach der Haltung dieses Bilds
  // Harmonik-Welle auf der Klinge (verlangsamt zur Sichtbarkeit)
  if(ring.active&&gBladeMesh){const dt=t-ring.t0, decay=Math.exp(-dt/1.7), w=2*Math.PI*5.5;
    if(decay<0.04){ring.active=false;document.getElementById('ring-info').style.display='none';}
    const pos=gBladeMesh.geometry.attributes.position, bx=gBladeMesh.userData.bladeX, bz=gBladeMesh.userData.baseZ;
    const A=0.013;
    for(let i=0;i<pos.count;i++){const phi=modeRaw(bx[i])/ring.phiMax;
      pos.setZ(i, bz[i]+A*phi*Math.sin(w*dt)*decay);}
    pos.needsUpdate=true;gBladeMesh.geometry.computeVertexNormals();
  } else if(gBladeMesh){const pos=gBladeMesh.geometry.attributes.position,bz=gBladeMesh.userData.baseZ;
    let dirty=false;for(let i=0;i<pos.count;i++){if(pos.getZ(i)!==bz[i]){pos.setZ(i,bz[i]);dirty=true;}}
    if(dirty){pos.needsUpdate=true;gBladeMesh.geometry.computeVertexNormals();}}
  BUEHNE.bild(cam);}   // die Bühne zeichnet erst und allein im Licht der Welt (sonst bricht sie laut)

addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();
  R.setSize(innerWidth,innerHeight);});
addEventListener('keydown',e=>{if(arena.active)return;const k=e.key.toLowerCase();
  if('12345'.includes(k)){const i=+k-1;if(LY[i]){show[LY[i][0]]=!show[LY[i][0]];ldiv.children[i].classList.toggle('on');applyVis();}}
  else if(k===' '){e.preventDefault();triggerRing();}
  else if(k==='g'){const ks=Object.keys(GATTUNGEN);const ni=(ks.indexOf(currentGattung)+1)%ks.length;pdiv.children[ni].click();}
  else if(k==='t'){const ks=Object.keys(TRADITIONEN);const cur=Object.keys(TRADITIONEN).find(n=>TRADITIONEN[n]===currentTrad);const ni=(ks.indexOf(cur)+1)%ks.length;tdiv.children[ni].click();}});

// — Start —
gattungWaehlen(currentGattung);buildSliders();rebuild();appendArenaUI();
// DIE BÜHNE DER WELT steht, sobald der Renderer steht (Tafeln, Umgebung, Sonne, Tonkurve; die Belichtung, sobald die Bestrahlungs-
// Tafel zurückkam); der Takt läuft an der Bild-Uhr des Renderers (r184 wartet mit ihm auf `init`)
BUEHNE.leiste(document.getElementById('buehneOrt'));
R.setAnimationLoop(animate);

/* ==================== DIE BRÜCKE ZUR HEIMAT (die Hülle, K41) ==================== */
/* EINE Brücke (../huelle/huelle.js): die DSL spricht über die ECHTEN UI-Pfade (Button-click = eine Quelle) — die 21
   Gattungen (#presets) + 4 Traditionen (#trads) + die Gesten "anschlagen" (#ring, die Harmonik-Probe) und "stahl"
   (#finish, der Stahl/Roh-Umschalter). Umlaut-Namen reisen ASCII-gefaltet (saebel/grossschwert/faellaxt — die
   terrain-Konvention "fruehling"); dieselbe Faltung liegt auf dem Button-Text. Esc meldet die Heimkehr — im Prüfstand
   gehört Esc dem Pointer-Lock-Release, die Brücke schweigt dort. */
(function () {
    /* ASCII-Faltung — EINE Normalisierung für DSL-Wort UND Button-Text. */
    function norm(s) {
        return String(s || "")
            .toLowerCase()
            .replace(/ä/g, "ae")
            .replace(/ö/g, "oe")
            .replace(/ü/g, "ue")
            .replace(/ß/g, "ss")
            .trim();
    }
    /* Gattungen leben in #presets, Traditionen in #trads — NUR dort matchen: die Ebenen-Buttons (#layers) tragen
       "Stahl" als Label, ein Match über alle #ctl-Buttons kollidierte. */
    function clickIn(id, word) {
        var div = document.getElementById(id);
        if (!div) return false;
        var kids = div.querySelectorAll("button");
        for (var i = 0; i < kids.length; i++) {
            if (norm(kids[i].textContent) === word) {
                kids[i].click();
                return true;
            }
        }
        return false;
    }
    AnazhHuelle.bruecke({
        welt: "schmiede",
        // DER HIMMEL DER HEIMAT (w27-studio-mesh, wie die Garage): die Bühne steht unter dem Himmel, den die Welt beim Betreten reicht
        enter: function (_a, m) {
            if (!m.himmel) return;
            BUEHNE.himmel(m.himmel);
        },
        // DAS ZIEL-BILD (D8): die Hülle rendert diese Welt als Panorama aus dem Blick ihrer Kamera — die Tor-Membran der Heimat zeigt es
        panorama: function () {
            return { THREE: THREE, renderer: R, scene: scene, kamera: cam };
        },
        label: "Anatomie · Klinge",
        dsl: [
            "langschwert", "saebel", "degen", "grossschwert", "dolch", "messer",
            "langbogen", "kriegsbogen", "reiterbogen", "recurvebogen",
            "streitkolben", "kriegsaxt", "kriegshammer", "keule",
            "faellaxt", "spaltmaul", "vorschlaghammer", "beil", "spitzhacke", "spaten", "schaufel",
            "frank", "nihon", "pars", "urvolk",
            "anschlagen", "stahl",
        ],
        wort: function (w) {
            var word = norm(w);
            if (word === "anschlagen") {
                var rg = document.getElementById("ring");
                if (rg) rg.click();
            } else if (word === "stahl") {
                var fi = document.getElementById("finish");
                if (fi) fi.click();
            } else if (!clickIn("presets", word)) clickIn("trads", word);
        },
        esc: function () {
            return !(typeof arena !== "undefined" && arena && arena.active); /* Esc = Pointer-Lock im Prüfstand */
        },
        /* DAS WERK DER BÜHNE (der EINE Übergabe-Kanal der Hülle): die Gattung mit Same 1, den Werten ihrer Regler-Zeilen und
           der Tradition (die Welt-Gestalt der Kosten-Leiste) — das nächste gesetzte Werk der Gattung trägt es. */
        werk: function () {
            var ov = { __tradition: tradName(currentTrad) };
            SC.PARAMS_BY_KIND.weapon.forEach(function (z) {
                if (typeof P[z.id] === "number") ov[z.id] = P[z.id];
            });
            return { kind: "weapon", preset: rezeptDerGattung(), seed: 1, ov: ov };
        },
        wurzel: function () {
            return weapon;
        },
    });
})();
