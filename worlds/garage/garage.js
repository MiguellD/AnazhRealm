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
const CAM_FOV=34,cam=new THREE.PerspectiveCamera(CAM_FOV,innerWidth/innerHeight,0.1,200);cam.position.set(6.2,3.1,7.4);
// DIE EINE ENGINE (18.10.): die Werkstatt rendert auf der Engine der Welt — three r184 WebGPU (vendor/three-bootstrap.js),
// Ausgabe sRGB mit der Tonkurve der Welt (BELICHTUNG.kurve, Khronos PBR Neutral); die Farben sind sRGB-Absichten
// (ColorManagement an, Lehre 21), die Lichter physikalisch: r128 trug π im Legacy-Modus selbst, jetzt tragen es die Stärken.
const R=new THREE.WebGPURenderer({antialias:true});R.setSize(innerWidth,innerHeight);R.setPixelRatio(Math.min(devicePixelRatio,2));
R.toneMapping=THREE.NeutralToneMapping;R.toneMappingExposure=1.04;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(R.domElement);

// KEINE STUDIO-UMGEBUNG (01.11.): die gemalte Grauverlauf-Env lag als PMREM in jedem PBR-Stoff — unter swiftshader die Hälfte
// des Bildes (Isometrie 1280×720: 262 → 86 ms mit der Abtastung unten), im Bild kaum sichtbar (Bildpaar v2-iso ↔ v2env0-iso).
// Den Lack zeichnen die drei Lichter und der Himmel (HemisphereLight); der Spiegel-Himmel gehört der Welt (Lehre 21).

// ── DIE BÜHNE (Boden · Raster · Zifferblatt · Kontaktschatten) — das Möbel der Werkstatt, die Probefahrt fährt auf ihrem Gelände ──
// DER BODEN IST UNBELEUCHTET (01.11., gemessen unter swiftshader, Isometrie 1280×720): der metallische PBR-Boden spiegelte die
// Umgebung über die halbe Fläche und kostete 813 → 505 ms je Bild; die Bronze-Kante färbte ihn sandfarben. Er ist jetzt Grund
// der Matrix (ein Ton, kein Licht), der Wagen steht auf seinem Kontaktschatten (EIN Bild, EIN Befehl, aus der Hülle des Baus).
const PI=Math.PI;
const buehne=new THREE.Group();scene.add(buehne);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshBasicMaterial({color:0x080c11}));
floor.rotation.x=-PI/2;buehne.add(floor);
const kontakt=(function(){const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');
  x.filter='blur(14px)';x.fillStyle='rgba(0,0,0,0.92)';x.beginPath();x.roundRect(34,30,188,68,30);x.fill();
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,color:0x000000}));
  m.rotation.x=-PI/2;m.position.y=0.002;m.renderOrder=1;return m;})();
buehne.add(kontakt);
// DAS RASTER DER MATRIX (Stahl-Cyan): ein feines Halbmeter-Netz und darüber das Fünfmeter-Netz — zwei Linien-Befehle
const grid=new THREE.GridHelper(60,120,0x1e3c4a,0x0d1a22);grid.position.y=0.001;grid.material.opacity=0.55;grid.material.transparent=true;buehne.add(grid);
const gridGrob=new THREE.GridHelper(60,12,0x2f6476,0x1d4352);gridGrob.position.y=0.0015;gridGrob.material.opacity=0.6;gridGrob.material.transparent=true;buehne.add(gridGrob);
// DAS ZIFFERBLATT DER ANTIKE (Bronze, ein Linien-Befehl): der Drehteller unter dem Wagen trägt seine Grade wie ein Astrolab —
// zwei Ringe, je 5° ein Strich, je 15° ein langer, je 90° der Zeiger nach innen. Dreht der Teller, wandert der Blick über die Grade.
const zifferblatt=(function(){const v=[],R0=3.35,R1=3.48,N=144;
  for(const r of[R0,R1,2.2])for(let i=0;i<N;i++){const a=i/N*2*PI,b=(i+1)/N*2*PI;v.push(Math.cos(a)*r,0,Math.sin(a)*r,Math.cos(b)*r,0,Math.sin(b)*r);}
  for(let g=0;g<360;g+=5){const a=g*PI/180,l=g%90===0?0.62:g%15===0?0.22:0.09,c=Math.cos(a),s=Math.sin(a);v.push(c*R0,0,s*R0,c*(R0-l),0,s*(R0-l));}
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(v,3));
  const ls=new THREE.LineSegments(ge,new THREE.LineBasicMaterial({color:0xb98a52,transparent:true,opacity:0.7}));ls.position.y=0.003;return ls;})();
buehne.add(zifferblatt);

// ── Licht ── (die Studio-Lichter sind unter r128 roh, also linear, eingestellt: `_lin` hält ihren Ton — als sRGB dekodiert
// sättigten Füll-, Rand- und Himmelslicht den Lack cyan; der Lack selbst bleibt FARB-GESETZ des Kerns, sRGB → linear)
// ZUKUNFT MIT DER WÄRME DER ANTIKE (01.11.): das Hauptlicht warm wie Lampenlicht (Leuchtdichte gehalten: 2,6 / 0,887), die
// Kante von hinten Bronze, die Füllung bleibt Stahl — drei Richtungen und der Himmel, kein Post.
const _lin=h=>new THREE.Color().setHex(h,THREE.LinearSRGBColorSpace);
scene.add(new THREE.HemisphereLight(_lin(0x7a8da0),_lin(0x0c1016),0.55*PI));
const key=new THREE.DirectionalLight(0xfff0dc,2.93*PI);key.position.set(5,9,4);key.castShadow=true;
key.shadow.mapSize.set(1024,1024);key.shadow.bias=-0.0002;Object.assign(key.shadow.camera,{left:-6,right:6,top:5,bottom:-3,far:26});scene.add(key);
const fill=new THREE.DirectionalLight(_lin(0x4f8fa6),0.6*PI);fill.position.set(-2,3,6);scene.add(fill);
const rim=new THREE.DirectionalLight(_lin(0xffa65a),0.9*PI);rim.position.set(-6,4.5,-4);scene.add(rim);

/* ── DER KERN-ANSCHLUSS (W7a, Studio-Vertrag Phase 1 — docs/studio-vertrag.md §7):
   die generative Substanz (Lehren · Rahmen · Räder · Haut · Baukörper · Presets/
   Params/Kulturen) lebt in ../../vehicle-core.js (__vehicleCore, VOR diesem
   Skript geladen) — EINE Quelle für Shell UND AnazhRealm-Foundry (G2.1, kein
   Nachbau). Die Shell behält Szene/UI/Overlays/Fahrmodell und LIEST den Kern. ── */
const VC=window.__vehicleCore;
const M=VC.materials();            // dieselben geteilten Materialien (nie disposen); der Lack-Wechsel wählt VC.lackStoff (W5)
// DIE BÜHNE STEHT IM LACK (studios.K4, Labor = Welt): sie zeigt die Gestalt, die „In der Welt ansehen" trägt (`werkSame`) —
// das Ton-Modell (Clay) ist die Anatomie-Ansicht auf Zuruf, die Welt kennt keins (LACK_VIS host).
let lackMat=VC.lackStoff(5), bodyMat=lackMat; // Start Azurblau; umschaltbar Clay/Lack
const {box,cyl,dot,seg,ring,hardpoints,evalLehren,scal,taperBody,CULTURES,PRESETS}=VC;
const PARAMS=VC.PARAMS_BY_KIND.vehicle; // SYNERGIE-WELLE (Vertrag v1.2): die EINE B4-Form ist die Map — die Shell liest ihren kind-Eintrag

// ── Geometrie-Helfer (wie s/c/b in der Körperbasis) ──
function ell(r,sc,m){const me=new THREE.Mesh(new THREE.SphereGeometry(r,40,28),m||bodyMat);if(sc)me.scale.set(sc[0],sc[1],sc[2]);me.castShadow=true;me.receiveShadow=true;return me;}

// ── Text-Label als Sprite (für Maßlinien & Gelenke) ──
// Die Schrift der Maße ist Pergament auf dunklem Grund mit Bronze-Rand; `pip` (die Farbe des Urteils) steht als Punkt davor —
// das Urteil der Lehre bleibt lesbar, die Zeichnung bleibt warm.
function label(text,hex,scale,pip){scale=scale||0.42;
  const fs=46,pad=10,pw=pip?fs*0.7:0;const cv=document.createElement('canvas');const cx=cv.getContext('2d');
  cx.font=`600 ${fs}px ui-monospace,Menlo,monospace`;const w=cx.measureText(text).width;
  cv.width=w+pad*2+pw;cv.height=fs+pad*2;cx.font=`600 ${fs}px ui-monospace,Menlo,monospace`;
  cx.fillStyle='rgba(12,11,10,.80)';const rr=11;cx.beginPath();
  cx.moveTo(rr,0);cx.arcTo(cv.width,0,cv.width,cv.height,rr);cx.arcTo(cv.width,cv.height,0,cv.height,rr);
  cx.arcTo(0,cv.height,0,0,rr);cx.arcTo(0,0,cv.width,0,rr);cx.closePath();cx.fill();
  cx.strokeStyle='rgba(196,150,92,.55)';cx.lineWidth=2;cx.stroke();
  if(pip){cx.fillStyle=pip;cx.beginPath();cx.arc(pad+pw*0.4,cv.height/2,fs*0.19,0,2*Math.PI);cx.fill();}
  cx.fillStyle=hex;cx.textBaseline='middle';cx.fillText(text,pad+pw,cv.height/2+2);
  const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;t.colorSpace=THREE.SRGBColorSpace;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));
  sp.scale.set(cv.width/cv.height*scale,scale,1);sp.renderOrder=999;sp.name=text;return sp;}

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
  const l1=label('DOF: Lenkung + Sturz + Drehung + Federweg','#ffd27a',0.24);
  l1.position.set(H.HUB_FR[0],P.radR+0.55,H.HUB_FR[2]+0.1);g.add(l1);
  const l2=label('DOF: Drehung + Federweg','#ffd27a',0.24);
  l2.position.set(H.HUB_RR[0],P.radR+0.5,H.HUB_RR[2]+0.1);g.add(l2);
  return g;}

// ── Maßlinien (Lehren räumlich) — Farbe = Zustand der zugehörigen Lehre ──
// Die Maßlinie in Pergament, die Endstriche und der Punkt des Schilds in der Farbe des Urteils (colHex).
// EIN Linien-Befehl je Maß (Linie + zwei Endstriche als Segmente mit Ecken-Farbe; vorher drei Linien, drei Befehle).
const PERGAMENT=0xe6d6b0,PERGAMENT_HEX='#efe3c4',_massStoff=new THREE.LineBasicMaterial({vertexColors:true});
function caliper(a,b,colHex,txt,perp,schild){const g=new THREE.Group();
  const t=perp||[0,0.05,0];                          // Endstrich-Richtung
  const pg=new THREE.Color(PERGAMENT),ur=new THREE.Color(colHex),pos=[],col=[];
  const strich=(p,q,c)=>{pos.push(...p,...q);col.push(c.r,c.g,c.b,c.r,c.g,c.b);};
  strich(a,b,pg);
  strich([a[0]-t[0],a[1]-t[1],a[2]-t[2]],[a[0]+t[0],a[1]+t[1],a[2]+t[2]],ur);
  strich([b[0]-t[0],b[1]-t[1],b[2]-t[2]],[b[0]+t[0],b[1]+t[1],b[2]+t[2]],ur);
  const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.add(new THREE.LineSegments(ge,_massStoff));
  const mid=schild&&schild.at||[(a[0]+b[0])/2,(a[1]+b[1])/2+0.10,(a[2]+b[2])/2];
  const hex='#'+colHex.toString(16).padStart(6,'0');const lb=label(txt,PERGAMENT_HEX,0.2,hex);lb.position.set(...mid);
  if(schild&&schild.anker)lb.center.set(...schild.anker);g.add(lb);
  return g;}
/* V18.491.265 — Lab caliper status colors ← PRUEF_GESETZ fail-soft; Host none (PRUEF_VIS). ≠ LACK. */
const PRUEF_FALLBACK={pass:0x4ec98a,warn:0xe8b54a,fail:0xe0664a};
const _PG=(typeof VC!=='undefined'&&VC&&VC.PRUEF_GESETZ)||(window.__vehicleCore&&window.__vehicleCore.PRUEF_GESETZ)||null;
const STc=(_PG&&Number.isFinite(_PG.pass)&&Number.isFinite(_PG.warn)&&Number.isFinite(_PG.fail))
  ? {pass:_PG.pass,warn:_PG.warn,fail:_PG.fail}
  : Object.assign({}, PRUEF_FALLBACK);
function buildCalipers(H,P,res,riss){const g=new THREE.Group();const by=id=>res.find(r=>r.L.id===id).st;
  const cR=STc[by('rl')], cD=STc[by('dta')], cU=STc[by('ueb')], cB=STc[by('bf')];
  const tR=(P.radstand*1000|0),tD=(((H.A_F[0]-H.COWL[0]))*1000|0),tV=(P.ueberhangV*1000|0),tH=(P.ueberhangH*1000|0),tF=(P.fahrhoehe*1000|0),tO=(P.radR*2000|0);
  if(riss){
    // DER RISS (Seitenansicht, orthografisch): die Maße liegen in der Bildebene vor dem Wagen (z außen) wie in einer Zeichnung —
    // unter dem Boden die Maßkette Überhang · Radstand · Überhang und darunter die Länge, über dem Dach Dash→Achse, die Höhe
    // vor dem Bug, Bodenfreiheit und Rad-Ø mit dem Schild in der Kette darunter (der Boden steht in der Seite auf Kante).
    const z=P.spur/2+0.9,k1=-0.34,k2=-0.78,v=[0,0.07,0],h=[0.07,0,0],unter=y=>y-0.15;
    g.add(caliper([H.TAIL[0],k1,z],[H.A_R[0],k1,z],cU,'ÜH-H '+tH,v,{at:[(H.TAIL[0]+H.A_R[0])/2,unter(k1),z]}));
    g.add(caliper([H.A_R[0],k1,z],[H.A_F[0],k1,z],cR,'RADSTAND '+tR,v,{at:[(H.A_R[0]+H.A_F[0])/2,unter(k1),z]}));
    g.add(caliper([H.A_F[0],k1,z],[H.NOSE[0],k1,z],cU,'ÜH-V '+tV,v,{at:[(H.A_F[0]+H.NOSE[0])/2,unter(k1),z]}));
    g.add(caliper([H.TAIL[0],k2,z],[H.NOSE[0],k2,z],0x6fd0e8,'LÄNGE '+(((H.NOSE[0]-H.TAIL[0]))*1000|0),v,{at:[(H.TAIL[0]+H.NOSE[0])/2,unter(k2),z]}));
    g.add(caliper([H.COWL[0],P.dach+0.24,z],[H.A_F[0],P.dach+0.24,z],cD,'DASH→ACHSE '+tD,v,{at:[(H.COWL[0]+H.A_F[0])/2,P.dach+0.39,z]}));
    g.add(caliper([H.NOSE[0]+0.26,0,z],[H.NOSE[0]+0.26,P.dach,z],0x6fd0e8,'HÖHE '+(P.dach*1000|0),h,{at:[H.NOSE[0]+0.3,P.dach+0.16,z],anker:[1,0.5]}));
    const xf=(H.A_F[0]+H.A_R[0])/2;
    g.add(caliper([xf,0,z],[xf,P.fahrhoehe,z],cB,'FREI '+tF,h,{at:[xf,-0.13,z]}));
    g.add(caliper([H.A_F[0],0,z],[H.A_F[0],P.radR*2,z],0x6fd0e8,'RAD-Ø '+tO,h,{at:[H.A_F[0]+0.12,-0.13,z],anker:[0,0.5]}));
    return g;}
  // Radstand (Boden)
  g.add(caliper([H.A_F[0],0.02,P.spur/2+0.45],[H.A_R[0],0.02,P.spur/2+0.45],cR,'RADSTAND '+tR,[0,0.06,0]));
  // Dash-to-Axle (Höhe Gürtel)
  g.add(caliper([H.A_F[0],P.guertel+0.05,0],[H.COWL[0],P.guertel+0.05,0],cD,'DASH→ACHSE '+tD,[0,0.05,0]));
  // Überhänge
  g.add(caliper([H.A_F[0],0.02,-(P.spur/2+0.45)],[H.NOSE[0],0.02,-(P.spur/2+0.45)],cU,'ÜH-V '+tV,[0,0.06,0]));
  g.add(caliper([H.A_R[0],0.02,-(P.spur/2+0.45)],[H.TAIL[0],0.02,-(P.spur/2+0.45)],cU,'ÜH-H '+tH,[0,0.06,0]));
  // Bodenfreiheit an der Hinterachse, der Rad-Ø mit dem Schild über dem Vorderrad: die drei Schilder der Nahseite stehen
  // getrennt (Hinterachse · Mitte · Vorderrad) — in der Isometrie lagen FREI, RAD-Ø und RADSTAND übereinander am Vorderrad
  g.add(caliper([H.A_R[0]+0.35,0.0,P.spur/2+0.45],[H.A_R[0]+0.35,P.fahrhoehe,P.spur/2+0.45],cB,'FREI '+tF,[0.06,0,0]));
  g.add(caliper([H.A_F[0],0,P.spur/2+0.18],[H.A_F[0],P.radR*2,P.spur/2+0.18],0x6fd0e8,'RAD-Ø '+tO,[0.06,0,0],{at:[H.A_F[0],P.radR*2+0.16,P.spur/2+0.18]}));
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
  const lb=label('NEGATIVRAUM definiert mehr als Masse','#ff8aa0',0.26);lb.position.set(0,P.dach+0.35,0);g.add(lb);
  return g;}

// ════════════════════════════════════════════════════════════════════
// ZUSTAND + AUFBAU
// ════════════════════════════════════════════════════════════════════
const P=Object.assign({},VC.DEFAULT_P);   // Regler-Zustand — Grundwerte aus der EINEN Kern-Quelle
const show={frame:false,joints:false,cal:true,pkg:false,wheels:true,body:true,neg:false};
// Die EINE Sicht des gebauten Wagens (Haut + Räder + Zelle/Sitze, ohne Hilfsgeometrie und Notizen): der Ergebnis-Knopf zeigt
// sie, die Probefahrt fährt in ihr — Lehren, Gelenke und Negativraum gehören der Werkstatt (Befund 0710-2: RADSTAND, ÜH-H …
// lagen in der Fahrt über dem Wagen, die Probefahrt erbte die Werkstatt-Ebenen).
const ERGEBNIS={frame:false,joints:false,cal:false,pkg:true,wheels:true,body:true,neg:false};
let fahrSicht=false;
function sicht(){return fahrSicht?ERGEBNIS:show;}
let gFrame,gJoints,gBody,gCal,gNeg,gPackage,gWheels;const doors=[];
const vehicle=new THREE.Group();scene.add(vehicle);
const gSprung=new THREE.Group();vehicle.add(gSprung);   // gefederte Masse (Aufbau) — nickt/wankt/hebt auf den Federn

// Ein Sprite besitzt nur Stoff und Bild: seine Geometrie ist das EINE Quad, das three allen Sprites teilt (verschränkt) —
// r184 zerstört beim dispose den Puffer, behält ihn aber am InterleavedBuffer, und jedes spätere Schild zeichnet aus dem
// zerstörten Puffer ("used in submit while destroyed", der Submit fällt, das Bild steht).
function clear(g){if(!g)return;if(g.parent)g.parent.remove(g);g.traverse(o=>{if(o.geometry&&!o.isSprite)o.geometry.dispose();
  if(o.isSprite&&o.material){if(o.material.map)o.material.map.dispose();o.material.dispose();}});}
function rebuild(){_wecke();
  clear(gFrame);clear(gJoints);clear(gBody);clear(gCal);clear(gNeg);clear(gPackage);clear(gWheels);doors.length=0;
  const PE=VC.epocheForm(P);   // die Zeit-Achse (vehicle-core EPOCHE_GESETZ): EIN geformtes P für den Bau UND die Ebenen
  const H=hardpoints(PE);const res=evalLehren(PE);
  const ctx={M:M,bodyMat:bodyMat,doors:doors,corners:corners};   // der Kern baut MIT den Shell-Objekten (Tür-/Rad-Animation bleibt verdrahtet)
  const V=sicht();
  // LABOR = WELT (18.10.): der Wagen kommt vom Bauer der Welt (vehicle-core buildInstance — derselbe Bau wie der Foundry-Worker,
  // Baukörper · Haut · Räder, verjüngt und plan-konvex), mit den Hörern der Werkstatt (Lack, Türen, Rad-Ecken); die Ebenen
  // Rahmen · Gelenke · Lehren · Negativ legt die Werkstatt darüber.
  [gPackage,gBody,gWheels]=VC.buildInstance(presetId,1,0,PE,ctx).children.slice();
  gPackage.visible=V.pkg;gSprung.add(gPackage);gBody.visible=V.body;gSprung.add(gBody);
  gWheels.visible=V.wheels;vehicle.add(gWheels);  // ungefedert → bleibt am Boden geerdet
  gFrame=VC.buildFrame(H,PE,ctx); gFrame.visible=V.frame;   gSprung.add(gFrame);
  gJoints=buildJoints(H,PE);gJoints.visible=V.joints;gSprung.add(gJoints);
  gCal=buildCalipers(H,PE,res,proj==='seite');gCal.visible=V.cal;   gSprung.add(gCal);
  kontakt.scale.set((H.NOSE[0]-H.TAIL[0])/0.70,(PE.spur+0.3)/0.5,1);kontakt.position.x=(H.NOSE[0]+H.TAIL[0])/2;   // der Kontaktschatten trägt die Hülle des Baus
  gNeg=buildNeg(H,PE);     gNeg.visible=V.neg;        gSprung.add(gNeg);
  taperBody(gFrame,scal(H,PE),PE);   // der Rahmen folgt derselben Sektion wie Karosserie und Bauraum
  gSprung.position.set(0,0,0);gSprung.rotation.set(0,0,0);
  explosionsPlan(PE);   // die Achsen der Explosion stehen am neuen Bau; die Ansicht legt sie im selben Bild an
  if(mode!=='fahren'&&proj!=='persp')einpassen();   // orthografisch füllt jeder Bau (Schlitten 3 m bis Zukunft 5 m) das Bild
  renderTafel(res);
  kostenLeiste.neu();
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
// Presets — Welle L: Gattung und Kultur setzen P in der Merge-Ordnung von buildInstance (DEFAULT_P + Preset + Kultur als
// ov); vorher mergte der Klick nur den Preset-Patch: Supersport → GT ließ grip 0,85 stehen, eine Kultur blieb für immer.
let presetId='gt',kulturId=null;
// Die Sitzung der Hülle: jede Tat (Regler-Zug, Gattung, Kultur, Zurücksetzen) ist EIN Rückgängig-Schritt über P samt
// Gattung und Kultur (Strg+Z · Strg+Umschalt+Z); der Rückweg baut wie der Hinweg.
// (markiert: ob die Gattung noch leuchtet — ein Regler-Zug löscht die Marke, sein Rückgängig stellt sie wieder her)
const sitz=AnazhHuelle.sitzung({werte:P,zustand:()=>({presetId,kulturId,markiert:[...pdiv.children].some(c=>c.classList.contains('on'))}),
  zustandSetzen:z=>{presetId=z.presetId;kulturId=z.kulturId;const ids=Object.keys(PRESETS);
    [...pdiv.children].forEach((c,i)=>c.classList.toggle('on',z.markiert&&ids[i]===presetId));
    const cids=Object.keys(CULTURES);[...cdiv.querySelectorAll('button')].forEach((c,i)=>c.classList.toggle('on',cids[i]===kulturId));},
  anwenden:()=>rebuild()});
sitz.leiste(document.getElementById('sitzung'),{seed:false});
function presetSetzen(pid){presetId=pid;const ep=P.epoche;for(const k in P)delete P[k];   // die Gattung wählt die Form, nie die Zeit: die Epoche bleibt
  Object.assign(P,VC.DEFAULT_P,VC.presetPatch(pid),kulturId?CULTURES[kulturId].fx:{});if(ep!=null)P.epoche=ep;syncSliders();rebuild();}
function kulturSetzen(kid){const alt=kulturId?CULTURES[kulturId].fx:{};const basis=Object.assign({},VC.DEFAULT_P,VC.presetPatch(presetId));
  for(const k in alt){if(k in basis)P[k]=basis[k];else delete P[k];}   // die alte Kultur fällt ganz, die Regler bleiben
  kulturId=kid;if(kid)Object.assign(P,CULTURES[kid].fx);rebuild();}
const pdiv=document.getElementById('presets');
for(const pid in PRESETS){const b=document.createElement('button');b.className='btn';b.textContent=PRESETS[pid].lab;
  if(pid==='gt')b.classList.add('on');
  b.onclick=()=>{[...pdiv.children].forEach(c=>c.classList.remove('on'));b.classList.add('on');sitz.schritt(()=>presetSetzen(pid));};pdiv.appendChild(b);}
// Kultur-Selektor (orthogonal zum Typ)
const cdiv=document.createElement('div');cdiv.style.cssText='margin-top:8px';pdiv.parentNode.insertBefore(cdiv,pdiv.nextSibling);
{const cl=document.createElement('div');cl.textContent='KULTUR';cl.style.cssText='font-size:10px;letter-spacing:1px;opacity:.55;margin:4px 0 2px';cdiv.appendChild(cl);}
for(const cid in CULTURES){const b=document.createElement('button');b.className='btn';b.textContent=CULTURES[cid].lab;
  b.onclick=()=>{const ab=kulturId===cid;[...cdiv.querySelectorAll('button')].forEach(c=>c.classList.remove('on'));if(!ab)b.classList.add('on');
    sitz.schritt(()=>kulturSetzen(ab?null:cid));};cdiv.appendChild(b);}   // zweiter Klick auf die gewählte Kultur wählt sie ab
// Ebenen-Toggles
const ldiv=document.getElementById('layers');
const LY=[['frame','Rahmen','gFrame'],['joints','Gelenke','gJoints'],['cal','Lehren','gCal'],['pkg','Baukörper','gPackage'],['wheels','Räder','gWheels'],['body','Haut','gBody'],['neg','Negativ','gNeg']];
LY.forEach(([key,lab])=>{const b=document.createElement('button');b.className='btn'+(show[key]?' on':'');b.textContent=lab;
  b.onclick=()=>{show[key]=!show[key];b.classList.toggle('on');applyVis();};ldiv.appendChild(b);});
function applyVis(){const V=sicht();if(gFrame)gFrame.visible=V.frame;if(gJoints)gJoints.visible=V.joints;
  if(gCal)gCal.visible=V.cal;if(gPackage)gPackage.visible=V.pkg;if(gWheels)gWheels.visible=V.wheels;if(gBody)gBody.visible=V.body;if(gNeg)gNeg.visible=V.neg;}
function syncLayerButtons(){LY.forEach(([key],i)=>ldiv.children[i].classList.toggle('on',!!show[key]));}
// Kinematik + Clay/Lack
let kin=false;const kinB=document.getElementById('kin');
kinB.onclick=()=>{kin=!kin;kinB.classList.toggle('on');};
const clayB=document.getElementById('clay');clayB.classList.toggle('on',bodyMat!==M.clay);   // W5: der Lack der Leiste ist der Lack der Welt (vehicle-core `lackStoff`: Farbe + Lack-Art + Klarlack)
clayB.onclick=()=>{bodyMat=(bodyMat===M.clay)?lackMat:M.clay;clayB.classList.toggle('on');rebuild();};
// V18.491.230 — Lab Lack-Swatches = das LACK_GESETZ des Kerns (W5: der Zwilling PAINTS_FALLBACK fiel — VC ist Pflicht, M kommt schon aus VC.materials()).
const PAINTS=VC.LACK_GESETZ;
// DER SAME DES WERKS (studios.K4): die Gestalt der Welt, die den Lack der Leiste trägt — der Kern wählt je Gestalt einen Lack
// (`lackIndex`), die Welt stellt ein Werk in die Gestalt, die die Bühne zeigte (`_foundryGestaltFor` liest den Samen als
// `__gestalt`); Übergabe und Kosten-Leiste bauen sie. null, wenn keine Gestalt den Lack trägt (die Hülle sagt es).
function werkSame(){const li=PAINTS.findIndex(pt=>pt[0]===lackMat.userData.__lack);for(let s=1;s<PAINTS.length;s++)if(VC.lackIndex(s)===li)return s;return null;}
const prow=document.getElementById('paintrow');
PAINTS.forEach((pt,li)=>{const sw=document.createElement('button');sw.className='sw';sw.title=pt[0];
  sw.style.cssText='width:21px;height:21px;border-radius:50%;border:2px solid rgba(120,150,175,.32);background:#'+pt[1].toString(16).padStart(6,'0')+';cursor:pointer;padding:0;flex:none';
  if(pt[0]===lackMat.userData.__lack)sw.style.boxShadow='0 0 0 2px var(--steel-bright)';
  sw.onclick=()=>{if(pt[2]){bodyMat=M.clay;}else{lackMat=VC.lackStoff(li);bodyMat=lackMat;}   // W5: das Farbfeld IST der Lack der Welt (FARB-GESETZ + Lack-Art, derselbe Stoff je Lack)
    document.querySelectorAll('#paintrow .sw').forEach(b=>b.style.boxShadow='');sw.style.boxShadow='0 0 0 2px var(--steel-bright)';clayB.classList.toggle('on',!pt[2]);rebuild();};
  prow.appendChild(sw);});
// Ergebnis: nur das fertige Fahrzeug (Haut + Räder + Zelle/Sitze), ohne Hilfsgeometrie & Notizen
const ergB=document.getElementById('ergebnis');let ergOn=false;
ergB.onclick=()=>{ergOn=!ergOn;ergB.classList.toggle('on',ergOn);
  if(ergOn)Object.assign(show,ERGEBNIS);
  else     Object.assign(show,{frame:false,joints:false,cal:true, pkg:false,wheels:true,body:true,neg:false});
  applyVis();syncLayerButtons();};
// Regler — die Hülle (K41): der EINE Generator aus PARAMS_BY_KIND.vehicle schreibt P in place; ein Aufbau je Bild
// (ruheMs 0, der Zug bleibt flüssig), die Dynamik-Regler (dyn) wirken live ohne Neubau.
const regler=AnazhHuelle.regler(document.getElementById('sliders'),PARAMS,{werte:P,ruheMs:0,sitzung:sitz,
  basis:()=>Object.assign({},VC.DEFAULT_P,VC.presetPatch(presetId),kulturId?CULTURES[kulturId].fx:{}),
  bei:(id,v,pp)=>{if(!pp.dyn)[...pdiv.children].forEach(c=>c.classList.remove('on'));},
  format:(z,v)=>{const E=z.id==='epoche'&&VC.EPOCHE_GESETZ[Math.round(+v)];return E?(+v).toFixed(2)+' · '+E.lab:null;},   // ohne Stufe die blanke Zahl (NaN bleibt sichtbar)
  nachRuhe:(ids,bau)=>{if(bau)rebuild();}});
// DIE ZEIT IN DER ANSICHT: die Zeile `epoche` des EINEN Generators (dieselbe Sitzung, derselbe Rückgängig-Weg) steht über
// den Regeln der Ansicht — Isometrie, Seite und Explosion zeigen jede Stufe des EPOCHE_GESETZ am selben Bau.
{const z=document.querySelector('#sliders [data-regler="epoche"]'),ort=document.getElementById('epocheOrt');
 if(z&&ort){const h=z.previousElementSibling;if(h&&h.classList.contains('h-gruppe')&&(!z.nextElementSibling||!z.nextElementSibling.matches('[data-regler]')))h.remove();ort.appendChild(z);}}
function syncSliders(){regler.sync();}
// Die Kosten-Leiste der Hülle: die WELT-Gestalt (buildInstance des Kerns mit P als ov — derselbe Bau wie der Foundry-Worker)
// gegen die Budget-Zeile je Stufe; neu gemessen, wenn der Regler-Zug ruht.
const kostenLeiste=AnazhHuelle.kosten(document.getElementById('kosten'),{budget:VC.PORTAL_RENDER_CONFIG.lod.budget.vehicle,
  stufen:VC.PORTAL_RENDER_CONFIG.lod.kindStages.vehicle,bauen:s=>VC.buildInstance(presetId,werkSame(),s,P),renderer:R,
  quelle:'gemessen an der Welt-Gestalt (vehicle-core buildInstance, die Gestalt des Lacks der Leiste); Befehle nach dem Budget-Gesetz ≤ Zeile'});

// ════════════════════════════════════════════════════════════════════
// DIE ANSICHT — ein Modus der Werkstatt (01.11.), kein zweites Studio: Projektion (Perspektive · Isometrie · Seite) ×
// Explosion (Regler 0..1, stetig) × Animation (das Fahr-Gesetz des Kerns) × Drehteller. Dieselbe Szene, derselbe Bau,
// dieselbe Werkstatt-Kugel (oc): die Isometrie ist die Kugel bei el = 35,264° und az = 45° + k·90° (Blickachse (1,1,1)),
// die Seite bei el = 0 und az = 90° + k·180° (links oder rechts, nie Bug oder Heck) — beide orthografisch, die Bildhöhe ist die der Perspektive im Ziel (dist·tan(fov/2)).
// Ein Zug dreht frei, losgelassen rastet die Kugel auf die nächste Achse.
// ════════════════════════════════════════════════════════════════════
const PROJ={persp:{lab:'Perspektive',taste:'8'},iso:{lab:'Isometrie',taste:'9',el:Math.asin(1/Math.sqrt(3)),az0:PI/4,schritt:PI/2},seite:{lab:'Seite',taste:'0',el:0,az0:PI/2,schritt:PI}};
let proj='persp';
const camO=new THREE.OrthographicCamera(-1,1,1,-1,-60,120);   // die Nahebene hinter der Kamera: kein Teil der Explosion fällt aus dem Bild
function kamera(){return mode!=='fahren'&&proj!=='persp'?camO:cam;}
function rast(az,Q){return Q.az0+Math.round((az-Q.az0)/Q.schritt-1e-6)*Q.schritt;}   // ein Gleichstand rastet zur kleineren Achse
const adiv=document.getElementById('ansicht');
for(const p in PROJ){const b=document.createElement('button');b.className='btn'+(p===proj?' on':'');b.dataset.ansicht=p;
  b.textContent=PROJ[p].lab;b.title='Taste '+PROJ[p].taste;b.onclick=()=>projSetzen(p);adiv.appendChild(b);}
// die Lehren legen sich in die Ebene der Ansicht (Riss in der Seite, am Boden sonst) — nur die Maße bauen neu, nie der Wagen
function lehrenNeu(){const PE=VC.epocheForm(P),H=hardpoints(PE);clear(gCal);gCal=buildCalipers(H,PE,evalLehren(PE),proj==='seite');gCal.visible=sicht().cal;gSprung.add(gCal);}
function projSetzen(p){const riss=proj==='seite';proj=p;if(riss!==(p==='seite')&&gCal)lehrenNeu();[...adiv.children].forEach(b=>b.classList.toggle('on',b.dataset.ansicht===p));
  const Q=PROJ[p];if(Q.el!==undefined){oc.az=rast(oc.az,Q);oc.el=Q.el;oc.vAz=oc.vEl=0;einpassen();}_wecke();}
// EINPASSEN: die Hülle des Wagens (ohne Explosion, ohne Schilder) in die Achsen des Blicks gelegt — die Bildhöhe, in der er
// den freien Raum zwischen den Tafeln füllt (42 % der Breite, 62 % der Höhe); das Ziel ist seine Mitte.
const _box=new THREE.Box3(),_v=new THREE.Vector3();
function einpassen(){explosionAnwenden(0);vehicle.updateMatrixWorld(true);_box.makeEmpty();
  vehicle.traverseVisible(o=>{if(o.isMesh&&o.geometry){o.geometry.boundingBox||o.geometry.computeBoundingBox();
    _box.union(new THREE.Box3().copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld));}});
  explosionAnwenden(eZeig);if(_box.isEmpty())return;
  const c=_box.getCenter(new THREE.Vector3()),ce=Math.cos(oc.el);
  const f=new THREE.Vector3(-Math.cos(oc.az)*ce,-Math.sin(oc.el),-Math.sin(oc.az)*ce),re=new THREE.Vector3().crossVectors(f,new THREE.Vector3(0,1,0)).normalize(),up=new THREE.Vector3().crossVectors(re,f);
  let hx=0,hy=0;for(let i=0;i<8;i++){_v.set(i&1?_box.max.x:_box.min.x,i&2?_box.max.y:_box.min.y,i&4?_box.max.z:_box.min.z).sub(c);
    hx=Math.max(hx,Math.abs(_v.dot(re)));hy=Math.max(hy,Math.abs(_v.dot(up)));}
  const h=Math.max(hy/0.62,hx/(cam.aspect*0.42));oc.ziel.copy(c);oc.dist=Math.max(3.5,Math.min(16,h/Math.tan(CAM_FOV*PI/360)));}

// DIE EXPLOSION: die Schichten der Anatomie steigen entlang der Hochachse (Rahmen und Gelenke bleiben die Basis, der Baukörper
// hebt sich um 0,55 · Dachhöhe, die Haut um 1,15 · Dachhöhe), die Baugruppen jeder Schicht gleiten entlang ihrer Achse aus der Mitte
// der Schicht (quer am weitesten — die Flanken öffnen sich), die Räder entlang ihrer Achse nach außen; die Lehren bleiben der
// Grund, auf dem gemessen wird. Der Plan entsteht am Bau (rebuild), der Regler setzt nur den Anteil e.
const EXPL=[];let explLift=1.3,eZeig=0;
function explosionsPlan(P){EXPL.length=0;explLift=P.dach||1.3;vehicle.updateMatrixWorld(true);
  const schicht=(g,dy,k)=>{if(!g)return;const bc=new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3());
    EXPL.push({o:g,basis:g.position.clone(),d:new THREE.Vector3(0,dy,0)});
    for(const c of g.children){if(c.isSprite)continue;const bb=new THREE.Box3().setFromObject(c);if(bb.isEmpty())continue;
      const m=bb.getCenter(new THREE.Vector3()).sub(bc);EXPL.push({o:c,basis:c.position.clone(),d:new THREE.Vector3(m.x*k[0],m.y*k[1],m.z*k[2])});}};
  schicht(gPackage,0.55*explLift,[0.35,0.2,0.9]);
  schicht(gBody,1.15*explLift,[0.22,0.3,1.1]);
  for(const cc of corners)EXPL.push({o:cc.grp,basis:cc.grp.position.clone(),d:new THREE.Vector3(0,0,Math.sign(cc.grp.position.z)*0.55*P.spur)});
  explosionAnwenden(mode==='fahren'?0:eZeig);}
function explosionAnwenden(e){for(const x of EXPL)x.o.position.copy(x.basis).addScaledVector(x.d,e);}

// DIE ANIMATION AUS DEM GESETZ: ein Fahrer-Programm (Gas 3 s · Bremse 1,4 s · Rollen, das Lenkrad pendelt) gibt Eingaben,
// alles Weitere rechnet der EINE Fahr-Schritt des Kerns (VC.fahrSchritt, derselbe wie Probefahrt und Welt-Ritt) — die Räder
// rollen mit ω = v/r, die Lenkung schlägt mit ihrer Rate ein, die Aufbau-Federn nicken, wanken und heben. Der Wagen bleibt
// auf dem Teller stehen: gezeigt wird die Antwort des Gesetzes, nicht der Weg.
const carA=VC.fahrZustand(0,0,0),inA={throttle:0,brake:0,steer:0,hand:0},_eben=()=>0;
function animSetzen(an){if(an){Object.assign(carA,VC.fahrZustand(0,0,0));VC.fahrStand(carA,fahrGesetzLab(),_eben,0);return;}
  gSprung.position.set(0,0,0);gSprung.rotation.set(0,0,0);corners.forEach(c=>{c.wheelSpin.rotation.z=0;if(c.front)c.grp.rotation.y=0;});}
function animSchritt(dt,t){const z=t%7;inA.throttle=z<3?1:0;inA.brake=z>=3&&z<4.4?1:0;inA.steer=Math.sin(t*0.9);
  VC.fahrSchritt(carA,inA,fahrGesetzLab(),_eben,dt);
  if(Math.abs(carA.x)>4e3||Math.abs(carA.z)>4e3){carA.x=0;carA.z=0;}
  gSprung.rotation.z=carA.fNick;gSprung.rotation.x=carA.fWank;gSprung.position.y=carA.fHub;
  corners.forEach(cc=>{cc.wheelSpin.rotation.z=-carA.wheelAng;if(cc.front)cc.grp.rotation.y=carA.steer;});}

// Die Regler der Ansicht trägt die Hülle (derselbe Generator wie die Gesetz-Regler, ohne Sitzung: die Ansicht ist kein Bau).
const ANS={explode:0,anim:0,dreh:0};
const ansichtRegler=AnazhHuelle.regler(document.getElementById('ansichtRegler'),[
  {id:'explode',lab:'Explosion',min:0,max:1,step:0.01,def:0,law:'Haut ↑ 1,15 · Baukörper ↑ 0,55 · Dachhöhe, Baugruppen und Räder entlang ihrer Achsen'},
  {id:'anim',lab:'Animation',min:0,max:1,step:1,def:0,law:'VC.fahrSchritt — Räder rollen, Federn arbeiten, Lenkung schlägt ein'},
  {id:'dreh',lab:'Drehteller',min:0,max:1,step:1,def:0,law:'20°/s um die Hochachse über dem Zifferblatt'}],
  {werte:ANS,ruheMs:0,zuruecksetzen:false,gruppen:false,
   bei:(id,v)=>{_wecke();if(id==='anim'&&mode!=='fahren')animSetzen(!!v);
     if(id==='explode'&&v>0&&!explGezeigt){explGezeigt=true;Object.assign(show,{frame:true,pkg:true});applyVis();syncLayerButtons();}}});
let explGezeigt=false;   // die erste Explosion legt die Anatomie frei (Rahmen · Baukörper), danach gehören die Ebenen dem Schöpfer
function ansichtLebt(){return ANS.anim||ANS.dreh||Math.abs(eZeig-ANS.explode)>1e-4;}
function ansichtSchritt(dt,t){
  if(Math.abs(eZeig-ANS.explode)>1e-4){eZeig+=(ANS.explode-eZeig)*(1-Math.exp(-dt*7));if(Math.abs(eZeig-ANS.explode)<2e-3)eZeig=ANS.explode;explosionAnwenden(eZeig);}
  if(ANS.anim)animSchritt(dt,t);}

// ════════════════════════════════════════════════════════════════════
// FAHRMODELL — kinematisches Fahrradmodell (Sawicki/Monster, timestep-stabil):
//   Räder bewegen sich nur in ihre Blickrichtung → kein Heck-Rutschen.
//   Lastverlagerung aus ECHTER Beschleunigung treibt die PD-Federung.
//   Werkstatt = Studio + Overlay + Orbit · Fahren = Ebene + Verfolgerkamera + Tastatur.
// ════════════════════════════════════════════════════════════════════
// Forciertes Feder-Dämpfer-Modell je Freiheitsgrad:  x'' = (Moment − k·x − c·x')  →  Steady-State x = Moment/k.
// Steifigkeit k aus der Federrate, Dämpfung c aus dem Regler — beide wirken jetzt ECHT auf den Winkel, nicht nur aufs Tempo.

// Boden + Raster (nur im Fahrmodus sichtbar)
const ground=new THREE.Group();ground.visible=false;scene.add(ground);scene.add(key.target);
{const gp=new THREE.Mesh(new THREE.PlaneGeometry(800,800),new THREE.MeshStandardMaterial({color:0x1c222a,roughness:1,metalness:0}));
 gp.rotation.x=-Math.PI/2;gp.position.y=-0.004;gp.receiveShadow=true;ground.add(gp);
 const grid=new THREE.GridHelper(800,400,0x33485a,0x192833);grid.material.transparent=true;grid.material.opacity=0.5;ground.add(grid);}
// ════════ STEIGUNGS-HÜGEL (17.07. — die Strecke war Glas): ein cos²-Hügel HINTER dem
// Ziel-Cluster (x≈70, r 22, h 3.5) macht Steigung sicht- und tunbar; die EBENE bleibt
// byte-alt (bodenY=0 überall sonst — Slalom/Tor/Cluster enden bei x≈48). DIESELBE
// Funktion trägt Hügel-Mesh UND Fahrt (updateVehicle liest sie: Höhe·Hangabtrieb·Nick).
function bodenY(x,z){const dx=x-70,dz=z,r=Math.hypot(dx,dz);if(r>=22)return 0;const u=Math.cos((r/22)*Math.PI*0.5);return 3.5*u*u;}
{const hg=new THREE.PlaneGeometry(46,46,46,46);hg.rotateX(-Math.PI/2);
 const hp=hg.attributes.position;for(let i=0;i<hp.count;i++){hp.setY(i,bodenY(hp.getX(i)+70,hp.getZ(i)));}
 hg.computeVertexNormals();
 const hm=new THREE.Mesh(hg,new THREE.MeshStandardMaterial({color:0x24303c,roughness:0.95,metalness:0}));
 hm.position.set(70,0.002,0);hm.receiveShadow=true;ground.add(hm);}
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
  cx.fillStyle=gr;cx.fillRect(0,0,64,64);const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;return tx;})();
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


// Fahrzustand — Welle L: der Zustand des EINEN Fahr-Schritts im Kern (VC.fahrSchritt: Schlupf, Reibkreis, Hang längs UND
// quer, ballistische Vertikale, Aufbau-Federn). Die Probefahrt integriert nichts mehr selbst — der Welt-Ritt ruft denselben
// Schritt (vorher zwei Kopien, die auseinanderliefen: Stillstand GT Labor 54,7° gegen Welt 66,6°).
const car=VC.fahrZustand(0,0,0);
const input={throttle:0,brake:0,steer:0,hand:0};
const FAHR=VC.FAHR;  // N6.1 — die Fahr-Konstanten leben im KERN: EINE Quelle fuer Probefahrt UND exportDrive
function fahrGesetzLab(){return VC.fahrGesetz(VC.exportDrive(P));}   // die Regler wirken live (P je Frame)
function updateVehicle(dt,t){
  VC.fahrSchritt(car,input,fahrGesetzLab(),bodenY,dt);
  const idle=(car.speed<0.05)?(Math.sin(t*42)*0.0014+Math.sin(t*26)*0.0009):0;
  // Die Federn drehen den AUFBAU (gSprung); die Ebene der Räder trägt Aufbau UND Räder (vorher kippte nur der Aufbau in
  // den Hang, die Räder standen waagrecht, und der Gelände-Wank drehte gegen den Hang).
  gSprung.rotation.z=car.fNick;
  gSprung.rotation.x=car.fWank+((car.speed<0.05)?Math.sin(t*40)*0.0006:0);
  gSprung.position.y=car.fHub+idle;
  vehicle.position.set(car.x,car.y,car.z);vehicle.rotation.set(car.wank,car.yaw,car.steig,'YZX');
  // STEER_VIS.compound = "hub-yaw" — Feel .124 Lab-parity (front hub yaw). Räder: Abrollen ω=v/r (der Kern zählt wheelAng).
  corners.forEach(cc=>{cc.wheelSpin.rotation.z=-car.wheelAng;if(cc.front)cc.grp.rotation.y=car.steer;cc.grp.position.y=cc.baseY;});
  key.position.set(car.x+5,car.y+9,car.z+4);key.target.position.set(car.x,car.y,car.z);key.target.updateMatrixWorld(); // Schatten folgt
}

// Verfolgerkamera als Kugel-Orbit ums Auto: folgt hinterher, lässt sich aber greifen (frei umsehen), schwingt beim Loslassen zurück.
// F1 (18.10.) — DIE CHASE-CAM IST DAS GESETZ DES KERNS (VC.chaseKamera; der Welt-Ritt liest dasselbe): der Azimut folgt der Gier,
// die Elevation steht über der FAHRBAHN als Feder mit Dämpfer. Vorher federte das Labor einstufig auf FAHR.kamera.el zur Welt und
// zog die Lage nach (posEase) — bergab am Hügel stand die Kamera 4,3° über der Fahrbahn, in der Welt 19,5° (das Gesetz misst gate:fahr-leben T4).
const camOrb={az:0,el:FAHR.kamera.el,elF:FAHR.kamera.el,follow:true};  // der Zustand des Gesetzes (az: Gier des Kerns, Bug +x)
// Welle L: der Zug-Zustand der Maus steht im CODE (er stand im Kommentar hinter camOrb — jede Mausbewegung warf ReferenceError)
let dragging=false,_lpx=0,_lpy=0;
// H3 (20.10.) — DIE KAMERA ATMET DAS TEMPO wie im Welt-Ritt: das Gesetz liest den Fahr-Zustand und vmax des Lab-Gesetzes (Arm,
// FOV, Azimut auf den Fahrtvektor); der Zug der Maus greift über chaseGreif, losgelassen kehrt sie in rueckS zurück. Das FOV
// schreibt EINER (camFov): die Ruhe CAM_FOV, in der Fahrt dazu fovPlus.
function camFov(plus){const f=CAM_FOV+plus;if(cam.fov!==f){cam.fov=f;cam.updateProjectionMatrix();}}
function updateChaseCam(dt,snap){
  const v=VC.chaseKamera(camOrb,camOrb.follow?car.yaw:NaN,car.steig,snap?0:dt,FAHR.kamera,car,fahrGesetzLab().vmax);
  camFov(v.fovPlus);
  const by=Number.isFinite(car.y)?car.y:bodenY(car.x,car.z);
  cam.position.set(car.x+v.x,by+v.y,car.z+v.z);
  cam.lookAt(car.x,by+FAHR.kamera.blickHoehe,car.z);
}

// Modus-Wechsel: Werkstatt ⇄ Fahren
let mode='werkstatt';const OVL='#brand,#lehren,#ctl,#leg,#hint';const hud=document.getElementById('hud');
function enterDrive(){mode='fahren';fahrSicht=true;applyVis();   // die Probefahrt fährt den gebauten Wagen (ERGEBNIS), nie die Lehren
  document.querySelectorAll(OVL).forEach(el=>el.style.display='none');if(hud)hud.style.display='flex';  // Welle L: der HUD ist ein Flex-Band (block klebte die Einheit an die Tastenhilfe)
  ground.visible=true;oc.zug=-1;oc.vAz=oc.vEl=0;   // die Werkstatt-Kugel ruht, solange die Fahrt-Kamera führt
  buehne.visible=false;explosionAnwenden(0);   // gefahren wird der ganze Wagen auf dem Gelände — die Ansicht (Explosion, Teller) wartet in der Werkstatt
  Object.assign(car,VC.fahrZustand(0,0,0));VC.fahrStand(car,fahrGesetzLab(),bodenY,0);   // frischer Fahrzustand auf dem Boden
  input.throttle=input.brake=input.steer=input.hand=0;
  vehicle.position.set(0,0,0);vehicle.rotation.set(0,0,0);camOrb.follow=true;dragging=false;resetTrack();updateChaseCam(0,true);}
function exitDrive(){mode='werkstatt';fahrSicht=false;applyVis();
  document.querySelectorAll(OVL).forEach(el=>el.style.display='');if(hud)hud.style.display='none';
  ground.visible=false;
  vehicle.position.set(0,0,0);vehicle.rotation.set(0,0,0);gSprung.position.set(0,0,0);gSprung.rotation.set(0,0,0);
  corners.forEach(c=>{if(c.front)c.grp.rotation.y=0;});Object.assign(car,VC.fahrZustand(0,0,0));dragging=false;camOrb.follow=true;
  key.position.set(5,9,4);key.target.position.set(0,0,0);key.target.updateMatrixWorld();
  buehne.visible=true;explosionAnwenden(eZeig);if(ANS.anim)animSetzen(true);
  camFov(0);werkOrbit();}   // der Blick kehrt auf die Werkstatt-Kugel zurück, wie er sie verließ

// Tastatur — Fahren liest Tasten kontinuierlich; Werkstatt-Hotkeys nur in der Werkstatt
const keys={};
addEventListener('keyup',e=>{keys[e.code]=false;});
addEventListener('keydown',e=>{keys[e.code]=true;
  if(mode==='fahren'&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if(e.code==='Escape'){if(mode==='fahren'){exitDrive();e.stopImmediatePropagation();}return;}   // der Fahr-Exit hält Esc an: die Brücke dahinter sieht ihn nicht (vorher stand mode schon auf werkstatt — die Heimkehr folgte)
  if(e.code==='KeyK'){kinB.click();return;}                          // Türen — in beiden Modi (auch beim Fahren)
  if(mode!=='werkstatt')return;
  const order=['frame','joints','cal','pkg','wheels','body','neg'];
  const map={Digit1:'frame',Digit2:'joints',Digit3:'cal',Digit4:'pkg',Digit5:'wheels',Digit6:'body',Digit7:'neg'};
  if(map[e.code]){show[map[e.code]]=!show[map[e.code]];applyVis();const i=order.indexOf(map[e.code]);ldiv.children[i].classList.toggle('on');}
  const pk={Digit8:'persp',Digit9:'iso',Digit0:'seite'}[e.code];if(pk)projSetzen(pk);
  const ak={KeyX:'explode',KeyN:'anim',KeyT:'dreh'}[e.code];   // X Explosion ganz/zu · N Animation · T Drehteller — über den Regler der Hülle
  if(ak){const inp=ansichtRegler.eingabe(ak);if(inp.type==='checkbox')inp.click();else{inp.value=String(ANS.explode>0.5?0:1);inp.dispatchEvent(new Event('input',{bubbles:true}));}}
  if(e.code==='KeyP'){const names=Object.keys(PRESETS);const cur=[...pdiv.children].findIndex(c=>c.classList.contains('on'));
    pdiv.children[(cur+1+names.length)%names.length].click();}
});
function readKeys(){
  input.throttle=(keys['KeyW']||keys['ArrowUp'])?1:0;
  input.brake=(keys['KeyS']||keys['ArrowDown'])?1:0;
  input.steer=((keys['KeyA']||keys['ArrowLeft'])?1:0)-((keys['KeyD']||keys['ArrowRight'])?1:0);
  input.hand=keys['Space']?1:0;}
const startB=document.getElementById('start');if(startB)startB.onclick=enterDrive;
// DIE WERKSTATT-KUGEL (18.10., r184): az · el · dist um ein Ziel wie die Fahrt-Kamera camOrb, gedämpft wie der alte Orbit
// (Zug 2π je Bildhöhe, 5 % je Bild, Rad ×0,95 in 3,5–16 m, rechts schieben) — vendor/ trägt die Engine, kein Addon
const oc={ziel:new THREE.Vector3(0,0.55,0),az:0,el:0,dist:1,vAz:0,vEl:0,zug:-1},_cr=new THREE.Vector3();
{const d=cam.position.clone().sub(oc.ziel);oc.dist=d.length();oc.el=Math.asin(d.y/oc.dist);oc.az=Math.atan2(d.z,d.x);}
// DIE ANSICHT AUF DER KUGEL: der Drehteller dreht az (20°/s); in Isometrie und Seite rastet die Kugel ohne Zug auf die nächste
// Achse (az0 + k·Schritt: Isometrie 90°, Seite 180°; el der Projektion); das Ziel hebt sich mit der Explosion, die orthografische Bildhöhe ist die der
// Perspektive im Ziel und wächst mit ihr — die gehobene Haut bleibt im Bild.
const _ziel=new THREE.Vector3();
function werkOrbit(dt){dt=dt||0;if(ANS.dreh)oc.az+=0.349*dt;
  oc.az+=oc.vAz*0.05;oc.el=Math.max(-1.55,Math.min(1.55,oc.el+oc.vEl*0.05));oc.vAz*=0.95;oc.vEl*=0.95;
  const Q=PROJ[proj];
  if(Q.el!==undefined&&oc.zug<0){const k=1-Math.exp(-dt*9);oc.vAz*=0.5;oc.vEl*=0.5;
    if(!ANS.dreh){const z=rast(oc.az,Q);oc.az=Math.abs(z-oc.az)<1e-4?z:oc.az+(z-oc.az)*k;}
    oc.el=Math.abs(Q.el-oc.el)<1e-4?Q.el:oc.el+(Q.el-oc.el)*k;}
  if(gCal)gCal.scale.z=proj==='seite'&&Math.sin(oc.az)<0?-1:1;   // der Riss liegt immer auf der Seite des Blicks
  _ziel.copy(oc.ziel);_ziel.y+=eZeig*explLift*0.42;
  const ce=Math.cos(oc.el),dx=Math.cos(oc.az)*ce,dy=Math.sin(oc.el),dz=Math.sin(oc.az)*ce;
  cam.position.set(_ziel.x+dx*oc.dist,_ziel.y+dy*oc.dist,_ziel.z+dz*oc.dist);cam.lookAt(_ziel);
  const h=oc.dist*Math.tan(CAM_FOV*PI/360)*(1+0.45*eZeig),w=h*cam.aspect;
  if(camO.top!==h||camO.right!==w){camO.left=-w;camO.right=w;camO.top=h;camO.bottom=-h;camO.updateProjectionMatrix();}
  camO.position.copy(cam.position);camO.lookAt(_ziel);}   // derselbe Ort wie die Perspektive: der Nebel liest dieselbe Tiefe
// Maus/Touch: in der Werkstatt die Kugel (links drehen, rechts schieben, Rad zoomen); in der Fahrt greifen → frei umsehen,
// loslassen → sanft zurück hinter das Auto
R.domElement.style.touchAction='none';
R.domElement.addEventListener('contextmenu',e=>e.preventDefault());
// Touch wie der alte Orbit: ein Finger dreht, zwei kneifen (zoomen) und schieben — der Zug folgt ihrer Mitte, nie einem Finger
const finger=new Map(),_mitte=()=>{const [a,b]=[...finger.values()];return b?{x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.hypot(a.x-b.x,a.y-b.y)}:a;};
R.domElement.addEventListener('pointerdown',e=>{finger.set(e.pointerId,{x:e.clientX,y:e.clientY});const m=_mitte();_lpx=m.x;_lpy=m.y;oc.kneif=m.d;
  if(mode==='fahren'){dragging=true;camOrb.follow=false;}else oc.zug=finger.size>1?2:e.button;});
addEventListener('pointermove',e=>{if(finger.has(e.pointerId))finger.set(e.pointerId,{x:e.clientX,y:e.clientY});const m=finger.size?_mitte():{x:e.clientX,y:e.clientY};
  const dx=m.x-_lpx,dy=m.y-_lpy;_lpx=m.x;_lpy=m.y;
  if(m.d&&oc.kneif&&mode==='werkstatt')oc.dist=Math.max(3.5,Math.min(16,oc.dist*oc.kneif/m.d));oc.kneif=m.d;
  if(dragging)VC.chaseGreif(camOrb,dx*0.006,dy*0.006,FAHR.kamera);
  else if(oc.zug===0){const k=2*Math.PI/R.domElement.clientHeight;oc.vAz+=dx*k;oc.vEl+=dy*k;}
  else if(oc.zug===2){const k=2*oc.dist*Math.tan(cam.fov*Math.PI/360)/R.domElement.clientHeight;   // ein Pixel am Schirm = ein Pixel am Ziel
    oc.ziel.addScaledVector(_cr.setFromMatrixColumn(cam.matrix,0),-dx*k).addScaledVector(_cr.setFromMatrixColumn(cam.matrix,1),dy*k);}});
const _los=e=>{finger.delete(e.pointerId);if(finger.size){const m=_mitte();_lpx=m.x;_lpy=m.y;oc.kneif=m.d;oc.zug=0;return;}
  oc.zug=-1;if(dragging){dragging=false;camOrb.follow=true;}};
addEventListener('pointerup',_los);addEventListener('pointercancel',_los);
R.domElement.addEventListener('wheel',e=>{if(mode!=='werkstatt')return;e.preventDefault();
  oc.dist=Math.max(3.5,Math.min(16,oc.dist*(e.deltaY>0?1/0.95:0.95)));},{passive:false});

// ── Loop (r184: setAnimationLoop wartet auf renderer.init(), die Zeit reicht der Takt herein) ──
// DIE WERKSTATT ZEICHNET NUR BEI BEDARF (19.10.): wie ein Asset-Editor — nach einer Eingabe, einem Umbau, solange die Kugel
// ausläuft oder eine Tür zieht, und in der Fahrt; in Ruhe staut die Seite keine Bilder vor der GPU (Befund garage-r184: unter
// swiftshader hielt das Dauer-Zeichnen den geteilten Haupt-Faden 22–171 s fest, Portal-Konformanz Gruppe 8).
var wachBis=0;function _wecke(){wachBis=performance.now()+600;}
['pointerdown','pointermove','pointerup','wheel','keydown','keyup','input','change','click'].forEach(t=>addEventListener(t,_wecke,{capture:true,passive:true}));
// gleich = dieselbe Kamera mit derselben Lage UND derselben Projektion (die orthografische Höhe wächst mit der Explosion)
const _camAlt=new THREE.Matrix4(),_projAlt=new THREE.Matrix4();let _kamAlt=null;
const _camGleich=K=>{if(K!==_kamAlt)return false;const a=_camAlt.elements,b=K.matrixWorld.elements,c=_projAlt.elements,d=K.projectionMatrix.elements;
  for(let i=0;i<16;i++)if(Math.abs(a[i]-b[i])>1e-6||Math.abs(c[i]-d[i])>1e-6)return false;return true;};
let simT=0,tAlt=0;wachBis=performance.now()+2000;                  // die ersten Bilder nach dem Laden (Stoffe, Panorama)
function animate(zeit){const dt=tAlt?Math.min(1/30,(zeit-tAlt)/1000):0;tAlt=zeit;simT+=dt;const t=simT;
  if(mode==='fahren'){readKeys();updateVehicle(dt,t);updateTrack(dt);updateSmoke(dt);updateChaseCam(dt,false);
    if(hud){const sp=hud.querySelector('#spd');if(sp)sp.textContent=Math.round(Math.abs(car.speed)*FAHR.kmh);}  // Welle L: km/h aus der EINEN Kern-Zeile (×12 zeigte 3,33-fach)
  }else{ansichtSchritt(dt,t);werkOrbit(dt);}
  const open=kin?0.62:0;let tuerZieht=false;                        // Türen — in beiden Modi animiert
  doors.forEach(d=>{const tgt=(d.sd<0?-open:open);d.pv.rotation.y+=(tgt-d.pv.rotation.y)*0.08;if(Math.abs(tgt-d.pv.rotation.y)>1e-3)tuerZieht=true;});
  const K=kamera();K.updateMatrixWorld();
  if(mode!=='fahren'&&!tuerZieht&&!ansichtLebt()&&performance.now()>wachBis&&_camGleich(K))return;
  _kamAlt=K;_camAlt.copy(K.matrixWorld);_projAlt.copy(K.projectionMatrix);R.render(scene,K);}
// DAS CPU-RASTER ZEICHNET OHNE VIELFACH-ABTASTUNG: liefert der Adapter Software (swiftshader, llvmpipe, lavapipe), fällt das
// MSAA vor dem ersten Bild — wie three es im Kompatibilitäts-Modus selbst tut (backend.init: _samples = 0); die Karte behält es.
// Gemessen (Isometrie 1280×720, swiftshader): 196 → 86 ms je Bild.
const _softwareRaster=i=>!!i&&/swiftshader|llvmpipe|lavapipe|software|subzero/i.test([i.vendor,i.architecture,i.device,i.description].join(' '));
R.init().then(()=>{const d=R.backend&&R.backend.device;if(d&&_softwareRaster(d.adapterInfo))R._samples=0;});
presetSetzen('gt');werkOrbit();R.setAnimationLoop(animate);   // Welle L: das erste Laden geht denselben Weg (der Federraten-Regler zeigte 95 bei Zustand 100)
addEventListener('resize',()=>{_wecke();cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();R.setSize(innerWidth,innerHeight);if(mode!=='fahren')werkOrbit();});

/* ==================== DIE BRÜCKE ZUR HEIMAT (die Hülle, K41) ==================== */
/* EINE Brücke für alle Welten (../huelle/huelle.js): ready einmal, die DSL spricht über die ECHTEN UI-Pfade (Button-click
   = eine Quelle), das Einzelwort der Heimat ganz (["gt"] → „gt", nie „g"); Esc meldet die Heimkehr — im Fahr-Modus
   gehört Esc dem Werkstatt-Exit (der Tasten-Hörer oben hält ihn an). */
AnazhHuelle.bruecke({
    welt: "garage",
    // DAS ZIEL-BILD (D8): die Hülle rendert diese Welt als Panorama aus dem Blick ihrer Kamera — die Tor-Membran der Heimat zeigt es
    panorama: function () {
        return { THREE: THREE, renderer: R, scene: scene, kamera: cam };
    },
    label: "Anatomie · Fahrzeug",
    dsl: ["cavallo", "toro", "stern", "vorsprung", "monolith", "gt", "supersport", "limousine", "kompakt-fwd", "suv", "probefahrt", "werkstatt"],
    wort: function (w) {
        if (w === "probefahrt") {
            if (startB) startB.click();
        } else if (w === "werkstatt") {
            if (mode === "fahren") exitDrive();
        } else AnazhHuelle.knopfMitText(document.getElementById("ctl"), w); /* Gattungen (#presets) UND Kulturen */
    },
    esc: function () {
        return mode !== "fahren";
    },
    // DAS WERK DER BÜHNE (der EINE Übergabe-Kanal der Hülle, 18.10. „In der Welt ansehen"): der Wagen des Bauers der Welt —
    // Gattung, die Gestalt des Lacks der Leiste (`werkSame`), die Werte der Regler-Zeilen aus P und die Kultur; der nächste
    // gesetzte Wagen der Gattung trägt ihn. Bis 30.10. reiste Same 1: jeder Wagen stand in der Welt Racing-Grün.
    werk: function () {
        const seed = werkSame();
        if (seed === null) return null;
        const ov = Object.assign({}, kulturId && VC.CULTURES[kulturId] ? VC.CULTURES[kulturId].fx : {});
        PARAMS.forEach((z) => (ov[z.id] = P[z.id]));
        return { kind: "vehicle", preset: presetId, seed, ov };
    },
    werkOrt: document.getElementById("werkOrt"),
});
