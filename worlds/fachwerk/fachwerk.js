// ════════════════════════════════════════════════════════════════════
// worlds/fachwerk/fachwerk.js — DIE LAB-SHELL (W-A5b Portal-Umzug, das
// W-A4c-Muster von worlds/schmiede/schmiede.js): byte-treu aus den zwei
// Inline-Skripten von index.html extrahiert (die Portal-CSP verlangt
// script-src 'self' — kein Inline-Skript, kein CDN). Der STUDIO-KERN
// (../../fachwerk-core.js, __fachwerkCore) lädt VOR dieser Datei — die
// Shell LIEST die eine Quelle (G2.1). Die W12-Brücke sitzt am Datei-Ende.
// ════════════════════════════════════════════════════════════════════
/* eslint-disable */
// ══════════════════════════════════════════════════════════════════════════
//  PARAMETRISCHES FACHWERKHAUS  ·  AnazhRealm — LAB-SHELL (W-A5a Kern-Split).
//  Die generative Substanz (HAUS-Fabrik · Textur-Bäcker · Materialien ·
//  KULTUREN · Bake-Vokabular der Dorf-Pipeline) lebt im STUDIO-KERN
//  ../../fachwerk-core.js (__fachwerkCore, VOR diesem Skript geladen) — EINE
//  Quelle für Lab-Shell, Foundry-Worker und AnazhRealm (G2.1, kein Nachbau).
//  Hier bleiben: Szene/Renderer · UI/Regler (applyKultur/readParams/metaParams) ·
//  DORF (Layout · Straßen · Epochen · Jahresringe · Streaming — die W-A5b-
//  Quelle, KEIN W-A5a-Kanal) · Begehen/Kollision · LOD-Sonde · Selbsttest.
// ══════════════════════════════════════════════════════════════════════════
const FC=window.__fachwerkCore;
const HAUS=FC.HAUS;                                                          // die parametrische Haus-Fabrik — EINE Quelle
const M=FC.materials(), _MM=FC._MM;                                          // geteilte Materialien (nie disposen) + VC-Zwillinge (setZeit zündet das Glas stadtweit)
const _mmFor=FC._mmFor, mLay=FC.mLay, mat=FC.mat;                            // Rollen-Materialien (Bake · Layout · Fabrik)
const tintM=FC.tintM, DEFCOL=FC.DEFCOL, KULTUR=FC.KULTUR, KULTNAMES=FC.KULTNAMES;
const kulturFromSeed=FC.kulturFromSeed, kulturParams=FC.kulturParams;        // die reine Kultur-Ableitung (Dorf + Regler teilen sie)
const KULLVOL=FC.KULLVOL, DESTNUR=FC.DESTNUR, TURMNUR=FC.TURMNUR, MASSNUR=FC.MASSNUR, LOD1F=FC.LOD1F;
const bakeHaus=FC.bakeHaus, bakeLOD=FC.bakeLOD, wandTonAus=FC.wandTonAus, stapelBau=FC.stapelBau;
const bandFassade=FC.bandFassade, fpVon=FC.fpVon, lod2Koerper=FC.lod2Koerper;
const mischeGeoms=FC.mischeGeoms, hofFuer=FC.hofFuer, fragFuer=FC.fragFuer;  // die EINE Stufen-Quelle (Sonde ≡ Dorf ≡ Vertrag)
// ════════════════ Lab-Shell — Szene · UI · DORF (W-A5b-Quelle) ════════════════
function applyKultur(name, seed){                                                               // setzt Regler + Farben als kohärentes Bündel — QUELLE ist kulturParams (Dorf nutzt dieselbe)
  if(name==='manuell'){ tintM(DEFCOL); return; }
  if(name==='samen') name=kulturFromSeed(seed);
  const kp=kulturParams(name, seed); if(!kp){ tintM(DEFCOL); return; }
  $('pP').value=kp.pitchDeg; $('pW').value=kp.W; $('pD').value=kp.D; $('pS').value=kp.storeys;
  $('pB').value=kp.brace; $('pStil').value=kp.stil;
  if($('pH')) $('pH').value=Math.round(kp.hip*100);
  if($('pCurve')) $('pCurve').value=Math.round(kp.roofCurve*100);
  if($('vS')) $('vS').textContent=$('pS').value;
  tintM(kp.col);
  const ck=(id,v)=>{ if($(id)) $(id).checked=!!v; }, vl=(id,v)=>{ if($(id)) $(id).value=v; };
  ck('pTreppgiebel',kp.treppgiebel); ck('pKuppel',kp.kuppel); ck('pPortikus',kp.portikus); ck('pArkade',kp.arkade); ck('pTurm',kp.turm);
  ck('pZinnen',kp.zinnen); ck('pVeranda',kp.veranda); ck('pVorkragung',kp.vorkragung); ck('pPilotis',kp.pilotis); ck('pTerrasse',kp.terrasse);
  vl('pDachTyp',kp.dachTyp); vl('pBogenTyp',kp.bogenTyp); vl('pG',kp.grundriss);
}
// ═══ DORF-QUELLE — lebt seit W-A5b im Kern __fachwerkCore (byte-treu verschoben, sha256-Paritäts-Beleg im Wellen-Bericht; exportSettlement exportiert sie als Slot-DATEN an den Host). Die Shell LIEST die eine Quelle: ═══
const DORF=FC.DORF, dorfLayout=FC.dorfLayout, strassengraph=FC.strassengraph, lodPlan=FC.lodPlan, PROXYHAUS=FC.PROXYHAUS;
const rotAABB=FC.rotAABB, obbR=FC.obbR, obbSep=FC.obbSep, distPunktOBB=FC.distPunktOBB, ORTSNAME=FC.ORTSNAME;
const DORF_NORM=FC.DORF_NORM, EPOCHEN=FC.EPOCHEN, REGION_HIST=FC.REGION_HIST, LOD1SKIP=FC.LOD1SKIP;
// ════════════ DORF-BAU (Browser): misst reale Fußabdrücke, packt per dorfLayout, VERSCHMILZT statisch ════════════
// VERSCHMELZUNGS-GESETZ: alle statischen Prims werden pro ROLLE in EIN indiziertes Mesh gebacken (Weltmatrix + Kulturfarbe×Patina in Vertexfarben)
// → Draw-Calls fallen von ~Zehntausenden auf ~20. Tür-/Fensterflügel-Teilbäume bleiben LEBENDIG (Raycast + Mechanik unangetastet).
let dorf=null, dorfGroup=null, dorfCellars=[];
function proxyGroup(hp){ const pr=PROXYHAUS(hp), g=new THREE.Group();
  pr.B.forEach(q=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(q.b[3],q.b[4],q.b[5]),M[q.r]||M.holz); m.position.set(q.b[0],q.b[1],q.b[2]); g.add(m); });
  pr.T2.forEach(q=>{ const bg=new THREE.BufferGeometry(), v=[]; q.verts.forEach(p2=>v.push(p2[0],p2[1],p2[2]));
    bg.setAttribute('position',new THREE.Float32BufferAttribute(v,3)); bg.computeVertexNormals(); g.add(new THREE.Mesh(bg,M[q.r]||M.holz)); });
  return {g, bb:pr.bb, prims:pr.B.length+pr.T2.length}; }
let dorfB=null, dorfChunks=null, lastLOD=0, promoPend=null;                                   // promoPend: Bau aus Phase 1, wartet auf Einbau im nächsten Tick
const dorfRauch={quellen:[], teilchen:[]};
function proxyGroup(hp){ const pr=PROXYHAUS(hp), g=new THREE.Group();
  pr.B.forEach(q=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(q.b[3],q.b[4],q.b[5]),M[q.r]||M.holz); m.position.set(q.b[0],q.b[1],q.b[2]); g.add(m); });
  pr.T2.forEach(q=>{ const bg=new THREE.BufferGeometry(), v=[]; q.verts.forEach(p2=>v.push(p2[0],p2[1],p2[2]));
    bg.setAttribute('position',new THREE.Float32BufferAttribute(v,3)); bg.computeVertexNormals(); g.add(new THREE.Mesh(bg,M[q.r]||M.holz)); });
  return {g, bb:pr.bb, prims:pr.B.length+pr.T2.length}; }
const dorfBlend=[]; const dorfSterben=[];
function finalizeGeoms(geoms, sofort){ const out=[];                                          // sofort=true: ATOMARER TAUSCH (geteiltes Material, ein Frame) — für Rebakes gleicher Stufe, wo identische Flächen NIE doppelt leben dürfen
  for(const role in geoms){ const G=geoms[role]; if(!G.vo) continue;
    const bg=new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.Float32BufferAttribute(G.pos,3));
    bg.setAttribute('normal',   new THREE.Float32BufferAttribute(G.nrm,3));
    bg.setAttribute('color',    new THREE.Float32BufferAttribute(G.col,3));
    if(G.uv&&G.uv.length===(G.pos.length/3)*2) bg.setAttribute('uv', new THREE.Float32BufferAttribute(G.uv,2));
    bg.setIndex(G.idx);
    if(sofort){ const mm=new THREE.Mesh(bg,_mmFor(role)); mm.castShadow=true; mm.receiveShadow=true; dorfGroup.add(mm); out.push(mm); continue; }
    const shared=_mmFor(role), fmat=shared.clone(); fmat.transparent=false; fmat.opacity=0;   // DITHER-BLENDE: opake Pipeline, Tiefe schreibt, NICHTS wird sortiert — Alpha-Blenden ganzer Stadtteile waren das Sortierchaos
    fmat.polygonOffset=true; fmat.polygonOffsetFactor=-1; fmat.polygonOffsetUnits=-1;         // BLEND-TIEFEN-GESETZ: das Neue gewinnt den Tiefen-Gleichstand — kein Z-Fight-Schimmern während der Blende
    fmat.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <alphatest_fragment>',
      'float ign=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715)))); if(diffuseColor.a<ign) discard; diffuseColor.a=1.0;\n#include <alphatest_fragment>'); };   // IGN-DISSOLVE (Jimenez): opacity treibt weiter die Blende — nur per Pixel-Sieb statt Mischung. Fehlt der Chunk-Anker je, degradiert es sanft zum Sofort-Tausch
    fmat.customProgramCacheKey=()=>'ign_dissolve';                                            // EIN Shader-Programm für ALLE Blenden — kein Compile-Hitch je Mesh
    const mm=new THREE.Mesh(bg,fmat); mm.castShadow=true; mm.receiveShadow=true; dorfGroup.add(mm); out.push(mm);
    dorfBlend.push({m:mm,t0:performance.now(),shared});                                        // CROSS-FADE-GESETZ: neues LOD blendet ein, kein Versinken
  }
  return out; }
function chunkKey(x,z){ return (Math.floor((x+3000)/48))+'_'+(Math.floor((z+3000)/48)); }
function rebakeChunk(ck, wechsel){ const C=dorfChunks&&dorfChunks[ck]; if(!C) return;         // STREAMING-ZELLE · wechsel=true: Stufen-Wechsel (fern) blendet; sonst ATOMARER TAUSCH — identische Flächen leben NIE doppelt
  const alt=C.meshes; C.meshes=[];
  const geoms={};
  for(const bi of C.list){ const B=dorfB[bi]; if(B.lod!=='chunk') continue; mischeGeoms(geoms, fragFuer(B, C.stufe)); }
  if(C.stufe<=2) for(const bi of C.list){ mischeGeoms(geoms, hofFuer(dorfB[bi])); }           // HOF für ALLE (auch promovierte — der Hof überlebt die Promotion); fern (Vogel) trägt kein Hof-Detail
  C.meshes=finalizeGeoms(geoms, !wechsel);
  if(C.sicht===false) C.meshes.forEach(m=>{ m.visible=false; });                              // Nebel-Zustand überlebt den Rebake
  if(alt.length){ if(wechsel) dorfSterben.push({meshes:alt, t:performance.now()+300});        // Blende: das Alte lebt bis zum Ende der Blende
    else alt.forEach(m=>{ m.geometry.dispose(); dorfGroup.remove(m); }); } }                  // Tausch: das Alte stirbt im selben Frame
function bauSolidsUndTueren(B, H, bi){
  H.solids.forEach(s=>solids.push({min:s.min,max:s.max, th:B.q.phi, tx:B.q.x, tz:B.q.z, bi}));
  if(H.cellar){ const c=H.cellar; dorfCellars.push({x0:c.x0,x1:c.x1,z0:c.z0,z1:c.z1,floorY:c.floorY, th:B.q.phi, tx:B.q.x, tz:B.q.z, bi}); }
  ['innenwaende','tueren','anbau','fluegel','balkon','fenster','moebel'].forEach(k=>H.subsystems[k]&&H.subsystems[k].traverse(o=>{
    if(o.userData&&(o.userData.door||o.userData.window)){
      doorList.push({leaf:o, openA:o.userData.openA, axis:o.userData.axis||'y', block:o.userData.block||null, th:B.q.phi, tx:B.q.x, tz:B.q.z, open:(o.userData.open!==undefined)?o.userData.open:true, blockObj:null, bi}); } })); }
function promoteBauen(bi){ const B=dorfB[bi]; if(!B||B.lod!=='chunk') return null;             // PHASE 1 (schwer, abbrechbar): NUR bauen — kein Szenen-Effekt, kein Zustand
  const sN=(B.p.storeys||1), turm2=sN>=6;
  const hp2=Object.assign({},B.p,{nur: turm2? {moebel:false,innenwaende:false} : (B.p.arm? {moebel:false} : {})});   // RING-A-WÜRDE: Armut spart Möbel, aber INNENWÄNDE baut die Nahstufe immer — sonst schaut man DURCH das Haus (max 9 Gebäude, der Preis ist es wert; Türme behalten den Schacht: Glasetagen zeigen Böden)
  const st=(sN>11)? stapelBau(hp2, {gelaende:false})
    : (()=>{ const H=HAUS(THREE,mat,hp2); return {g:H.build({gelaende:false}), H}; })();
  return {bi, st}; }
function promoteFertig(pend){ const bi=pend.bi, B=dorfB[bi], st=pend.st;                      // PHASE 2: Bake + Szene + Solids/Türen — die vordefinierte Feinstufe
  if(!B||B.lod!=='chunk'){ st.g.traverse(o=>{ if(o.geometry)o.geometry.dispose(); }); return; }   // Welt hat sich gedreht (demotiert/neu gebaut) → Bau verwerfen, kein Leck
  const wrap=new THREE.Group(); wrap.rotation.y=B.q.phi; wrap.position.set(B.q.x,0,B.q.z); wrap.add(st.g); wrap.updateMatrixWorld(true);
  const geoms={}; bakeLOD(st.g, B.p.col, geoms, 0); B.meshes=finalizeGeoms(geoms, true);      // EIN Bake-Pfad · ATOMAR: Vollbau erscheint im selben Frame, in dem die Hülle fällt — nie Lücke, nie Doppelbild
  wrap.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });            // FLÜGEL-GESETZ: was bakeLOD lebend ließ (Türen/Fenster), muss auch GERENDERT werden
  dorfGroup.add(wrap); B.liveWrap=wrap;                                                      // FIX: wrap hing nie in der Szene → promovierte Häuser hatten unsichtbare Türen/Fenster (Loch-Fassade)
  B.lod='voll'; B.dyn=true; B.H=st.H; bauSolidsUndTueren(B,st.H,bi);
  if(st.H.chimney){ const mc=st.H.chimney, mcx=(mc.min[0]+mc.max[0])/2, mcz=(mc.min[2]+mc.max[2])/2, c2=Math.cos(B.q.phi), s3=Math.sin(B.q.phi);
    dorfRauch.quellen.push({bi, x:B.q.x+mcx*c2+mcz*s3, y:mc.max[1]+0.2, z:B.q.z-mcx*s3+mcz*c2});          // RAUCH folgt der Promotion
    if(dorfRauch.quellen.length===1) fire.position.set(dorfRauch.quellen[0].x, dorfRauch.quellen[0].y+0.3, dorfRauch.quellen[0].z); }
  rebakeChunk(B.chunk, false); }
function promoteB(bi){ const p=promoteBauen(bi); if(p) promoteFertig(p); }                    // SYNCHRON-Pfad (Selbsttest & Direktaufrufe) — identisches Ergebnis, ein Tick
function demoteB(bi){ const B=dorfB[bi]; if(!B||!B.dyn) return;                               // DEMOTION: hinter dem Rücken wieder Fassade — ATOMAR: Vollbau fällt im selben Frame, in dem die (gecachte) Hülle zurückkehrt
  B.meshes.forEach(m=>{ m.geometry.dispose(); dorfGroup.remove(m); });
  B.meshes=[];
  if(B.liveWrap){ dorfGroup.remove(B.liveWrap); B.liveWrap.traverse(o=>{ if(o.geometry)o.geometry.dispose(); }); B.liveWrap=null; }   // Flügel rückstandslos (Materialien sind geteilt — nie disposen)
  for(let k=solids.length-1;k>=0;k--) if(solids[k].bi===bi) solids.splice(k,1);
  for(let k=dorfCellars.length-1;k>=0;k--) if(dorfCellars[k].bi===bi) dorfCellars.splice(k,1);
  for(let k=doorList.length-1;k>=0;k--) if(doorList[k].bi===bi){
    if(doorList[k].blockObj){ const ix=solids.indexOf(doorList[k].blockObj); if(ix>=0)solids.splice(ix,1); }
    doorList.splice(k,1); }
  for(let k=dorfRauch.quellen.length-1;k>=0;k--) if(dorfRauch.quellen[k].bi===bi) dorfRauch.quellen.splice(k,1);
  B.lod='chunk'; B.dyn=false; B.H=null; rebakeChunk(B.chunk, false); }
function lodTick(now){ if(!dorf||!dorfB) return; if(now-lastLOD<240) return; lastLOD=now;     // DREI-RING-STREAMING, ZEITGESCHNITTEN: Bau und Einbau in getrennten Ticks — der schwerste Frame halbiert
  const T0=performance.now();
  const px=camera.position.x, pz=camera.position.z;
  const fw=new THREE.Vector3(); camera.getWorldDirection(fw); const fl=Math.hypot(fw.x,fw.z)||1, fx=fw.x/fl, fz=fw.z/fl;   // BLICK-GESETZ: was der Spieler ANSIEHT, lädt zuerst — Rücken wartet
  const vprio=(dx,dz,d)=>{ if(d<0.001)return 0; return d*(1.12-0.5*((dx*fx+dz*fz)/d)); };    // vorn ≈ 0.62·d, hinten ≈ 1.62·d — nur Reihenfolge, nie Ring-Grenzen
  const list=dorfB.map((B,i)=>{ const dx=B.q.obb.cx-px, dz=B.q.obb.cz-pz, d=Math.hypot(dx,dz);
    return {i, dist:d, pr:vprio(dx,dz,d), lod:(B.lod==='voll'?'voll':'proxy'), dyn:B.dyn, kern:B.kern}; });
  const act=lodPlan(list, (dorf&&dorf.maxDyn)||5, 38, 60);
  for(const i of act.demote) demoteB(i);
  if(promoPend){ const B=dorfB[promoPend.bi];                                                 // PHASE 2: fertigen Bau einbauen — oder verwerfen, wenn der Spieler weiterzog
    const weg=!B||B.lod!=='chunk'||Math.hypot(px-B.q.obb.cx, pz-B.q.obb.cz)>60;
    if(weg){ promoPend.st.g.traverse(o=>{ if(o.geometry)o.geometry.dispose(); }); } else promoteFertig(promoPend);
    promoPend=null; }
  else if(act.promote.length) promoPend=promoteBauen(act.promote[0]);                         // PHASE 1: nur bauen — Einbau folgt im nächsten Tick
  if(performance.now()-T0>8){ return; }                                                       // FRAME-BUDGET-GESETZ: war der Tick schon schwer, wartet der Chunk-Wechsel — nie zwei Lasten in einem Frame
  let best=null,bd=1e9,bs=3;
  for(const ck in dorfChunks){ const C=dorfChunks[ck]; const dx=C.cx-px, dz=C.cz-pz, d2=Math.hypot(dx,dz);
    const sicht=(d2-36)<scene.fog.far+10;                                                      // NEBEL-CULLING: was der Nebel verschluckt, kostet keinen Draw — reiner Sichtbarkeits-Schalter, kein Rebake
    if(sicht!==C.sicht){ C.sicht=sicht; C.meshes.forEach(m=>{ m.visible=sicht; }); }
    let soll=C.stufe;                                                                          // HYSTERESE gegen Flattern · RANDNÄHE-GESETZ: Distanz zur ZELLE (−34 Halbdiagonale), nicht zum Zentrum — Gebäude am Chunk-Rand standen dem Spieler grob vor der Nase
    const dc=Math.max(0,d2-34);
    if(dc<100)soll=1; else if(dc>135&&C.stufe===1)soll=2;
    if(soll!==1){ if(dc<220&&C.stufe===3)soll=2; else if(dc>275&&C.stufe===2)soll=3; }
    if(soll!==C.stufe){ const p2=(soll<C.stufe)?vprio(dx,dz,d2):d2+800;                        // Aufwertungen VOR Abwertungen, vorn vor hinten
      if(p2<bd){ bd=p2; best=ck; bs=soll; } } }
  if(best){ dorfChunks[best].stufe=bs; rebakeChunk(best, true); } }                          // Stufen-Wechsel in der Ferne: Blende verdeckt den Silhouetten-Sprung
function buildDorf(dp){
  if(houseGroup){ houseGroup.traverse(o=>{if(o.geometry)o.geometry.dispose();}); scene.remove(houseGroup); houseGroup=null; haus=null; }
  if(dorfGroup){ dorfGroup.traverse(o=>{if(o.geometry)o.geometry.dispose();}); scene.remove(dorfGroup); }
  tintM(DEFCOL);
  const plan=DORF(dp); dorfGroup=new THREE.Group(); dorfCellars=[]; doorList.length=0; solids=[];
  if(promoPend){ promoPend.st.g.traverse(o=>{ if(o.geometry)o.geometry.dispose(); }); promoPend=null; }   // hängender Phase-1-Bau überlebt keinen Weltwechsel
  dorfB=[]; dorfChunks={};
  if(typeof ground!=='undefined') ground.visible=false;                                       // Szenen-Sheet weg: der Chunk-Boden regiert
  const maxDyn=Math.max(3,Math.min(9,(plan.norm.budget/42000)|0));                          // VOGEL-GESETZ: nichts initial voll — der Budget-Regler ist die Ring-Tiefe
  let prims=0, nVoll=0, nProxy=0;
  for(const hp of plan.houses){
    { const st=stapelBau(Object.assign({},hp,{nur:MASSNUR}), LOD1F);                          // MASS-BUILD: Systemmaß in ~½ Zeit, Δext=0 bewiesen
      const bx=new THREE.Box3().setFromObject(st.g);
      const eB={x0:bx.min.x,x1:bx.max.x,z0:bx.min.z,z1:bx.max.z,y1:bx.max.y};
      st.g.traverse(o=>{ if(o.geometry)o.geometry.dispose(); });
      let c=0; st.g.traverse(o=>{if(o.isMesh)c++;}); prims+=Math.max(60,(c*0.3)|0); nProxy++;
      dorfB.push({p:hp, lod:'chunk', dyn:false, kern:false, ext:eB, dims:st.H.dims, fp:fpVon(st.H),
        spawnL:{x:st.H.spawn.x, z:st.H.spawn.z}, hofGap:plan.norm.gap, meshes:[]}); } }       // HOF-GESETZ: Tür-Punkt + Parzellen-Spielraum wandern mit — das Haus-Wissen formt gleich den Hof
  const ext=dorfB.map(B=>{ if(B.lod!=='voll') return B.ext;
    const bx=new THREE.Box3().setFromObject(B.g); return {x0:bx.min.x,x1:bx.max.x,z0:bx.min.z,z1:bx.max.z,y1:bx.max.y}; });
  const lay=dorfLayout(plan, ext, plan.seed);
  let ymax=0;
  { const N=plan.norm;                                                                        // REIHEN-SNAP-GESETZ wohnt im Kern (U6c, __fachwerkCore.reihenSnap) — buildDorf UND exportSettlement rufen DIESELBE Funktion; läuft VOR der Platzierung, damit Solids/OBB konsistent fließen
    const snaps=FC.reihenSnap(dorfB, lay.pl, N.gap);
    if(snaps) console.log('REIHEN-SNAP: '+snaps+' Paare angedockt (Fuge → '+N.gap+'m)'); }
  dorfB.forEach((B,i)=>{ const q=lay.pl[i]; B.q=q; ymax=Math.max(ymax, ext[i].y1||0);
    if(B.lod==='voll'){ const wrap=new THREE.Group();
      wrap.rotation.y=q.phi; wrap.position.set(q.x,0,q.z); wrap.add(B.g); dorfGroup.add(wrap); wrap.updateMatrixWorld(true);
      const geoms={}; bakeHaus(B.g, B.p.col, geoms); B.meshes=finalizeGeoms(geoms);
      bauSolidsUndTueren(B, B.H, i); }
    else { B.ext=ext[i];
      const e=ext[i]; solids.push({min:[e.x0,0,e.z0],max:[e.x1,e.y1,e.z1], th:q.phi, tx:q.x, tz:q.z, bi:i});
      B.chunk=chunkKey(q.obb.cx,q.obb.cz);
      (dorfChunks[B.chunk]=dorfChunks[B.chunk]||{list:[],meshes:[],stufe:3,cx:0,cz:0,n:0}).list.push(i); } });
  for(const ck in dorfChunks){ const C=dorfChunks[ck]; C.cx=0; C.cz=0;
    C.list.forEach(bi=>{ C.cx+=dorfB[bi].q.obb.cx; C.cz+=dorfB[bi].q.obb.cz; }); C.cx/=C.list.length; C.cz/=C.list.length; }
  { const bwN=FC.brandwand(dorfB, plan.norm.gap);                                             // BRANDWAND-GESETZ wohnt im Kern (U6c, __fachwerkCore.brandwand) — parallele Nachbarn mit anliegender Fuge werden fensterlose Brandmauern, der Same erfährt es via hp.brandwand
    if(bwN) console.log('BRANDWAND: '+bwN+' anliegende Seiten erkannt'); }
  for(const ck in dorfChunks){ const C=dorfChunks[ck];                                        // WARMSTART-GESETZ: Chunks starten in ihrer DISTANZ-Stufe zum Spawn — der Spieler steht ab Sekunde 0 in Stufe-1-Umgebung statt sekundenlang im Vogel-Schwarm (Michis Nah-Destillat-Fotos)
    const dc=Math.max(0, Math.hypot(C.cx-lay.spawn.x, C.cz-lay.spawn.z)-34);
    const bs=Math.max(0.55, Math.min(1.35, Math.sqrt((parseInt(document.getElementById('pBudget').value)||170000)/170000)));   /*Quelle: der REGLER selbst — norm.budget war Epochen-Konstante (GEMESSEN 100%)*/         /*BUDGET-WARMSTART-GESETZ: die Startlast FOLGT dem Prim-Regler — Radien skalieren mit sqrt(Budget), der Teller-Vollausbau war reglertaub*/
    C.stufe = dc<100*bs? 1 : (dc<220*bs? 2 : 3);
    rebakeChunk(ck, true); }
  const W2=lay.welt, gnd=new THREE.Mesh(new THREE.BoxGeometry(W2.x1-W2.x0,0.3,W2.z1-W2.z0),M.gras);
  gnd.position.set((W2.x0+W2.x1)/2,-0.17,(W2.z0+W2.z1)/2); gnd.receiveShadow=true; dorfGroup.add(gnd);
  const glatt=(P)=>{ if(!P||P.length<3) return P;                                            // SPLINE-GESETZ: Catmull-Rom-Verdichtung (~2.2m) NUR am Band — der Graph bleibt unberührt; th aus der Spline selbst
    const gp=i=>P[Math.max(0,Math.min(P.length-1,i))], out=[];
    for(let i=0;i<P.length-1;i++){ const p0=gp(i-1),p1=gp(i),p2=gp(i+1),p3=gp(i+2);
      const L=Math.hypot(p2.x-p1.x,p2.z-p1.z), n2=Math.max(1,Math.min(12,Math.round(L/2.2)));
      for(let k=0;k<n2;k++){ const t=k/n2, t2=t*t, t3=t2*t;
        out.push({x:0.5*((2*p1.x)+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),
                  z:0.5*((2*p1.z)+(-p0.z+p2.z)*t+(2*p0.z-5*p1.z+4*p2.z-p3.z)*t2+(-p0.z+3*p1.z-3*p2.z+p3.z)*t3)}); } }
    out.push({x:P[P.length-1].x, z:P[P.length-1].z});
    for(let i=0;i<out.length;i++){ const a=out[Math.max(0,i-1)], b=out[Math.min(out.length-1,i+1)];
      out[i].th=Math.atan2(b.z-a.z, b.x-a.x); }
    return out; };
  const rib=(pts,w,y,prof)=>{ const v=[]; pts=glatt(pts);                                     /*QUERPROFIL-GESETZ: rib lernt Ingenieurs-Querschnitte — prof=[[offAnteil,dy],...]; ohne prof: flach wie eh (alle Alt-Aufrufe unberuehrt)*/
    const P5=prof||[[-1,0],[1,0]];
    for(let k=0;k+1<pts.length;k++){ const A=pts[k],B2=pts[k+1];
      const na=[-Math.sin(A.th),Math.cos(A.th)], nb=[-Math.sin(B2.th),Math.cos(B2.th)], h=w/2;
      for(let s6=0;s6+1<P5.length;s6++){ const o0=P5[s6][0]*h, o1=P5[s6+1][0]*h, y0=y+P5[s6][1], y1=y+P5[s6+1][1];
        v.push(A.x+na[0]*o1,y1,A.z+na[1]*o1, B2.x+nb[0]*o0,y0,B2.z+nb[1]*o0, A.x+na[0]*o0,y0,A.z+na[1]*o0);
        v.push(A.x+na[0]*o1,y1,A.z+na[1]*o1, B2.x+nb[0]*o1,y1,B2.z+nb[1]*o1, B2.x+nb[0]*o0,y0,B2.z+nb[1]*o0); } }
    const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(v,3)); bg.computeVertexNormals(); return bg; };
  const modernS=plan.jahr>1880&&plan.staedtisch;                                              // EPOCHEN-BELAG-GESETZ: Erde → Pflaster → Asphalt, Gehweg-Material je Zeit getrennt (Michis Raumplanung)
  const pflasterS=!modernS&&plan.staedtisch&&plan.jahr>=1640;                                 // Barock pflastert (1719 fiel durch die alte 1720-Grenze — GEMESSEN)                                 // Barock/Gründerzeit: gepflasterte Stadt
  const asMat= modernS? new THREE.MeshLambertMaterial({color:0x43464c, side:THREE.DoubleSide})
             : pflasterS? new THREE.MeshLambertMaterial({color:0x8f8a82, side:THREE.DoubleSide}) : M.weg;
  const gwMat= modernS? new THREE.MeshLambertMaterial({color:0x9aa0a6, side:THREE.DoubleSide})
             : pflasterS? new THREE.MeshLambertMaterial({color:0xb5b0a5, side:THREE.DoubleSide}) : null;
  const fuzMat=(modernS||pflasterS)? new THREE.MeshLambertMaterial({color:0xa9a49a, side:THREE.DoubleSide}) : null;   // FUSSGÄNGERZONEN-GESETZ: um den Platz herrscht der Mensch — ein Belag, kein Bordstein, keine Fahrspur-DNA
  const pzk=lay.platz? {x:lay.platz.cx, z:lay.platz.cz, r:Math.max(lay.platz.ex,lay.platz.ez)+11} : null;
  const offPts=(pts,off)=>pts.map(q=>({x:q.x-Math.sin(q.th)*off, z:q.z+Math.cos(q.th)*off, th:q.th}));
  const wMat=new THREE.MeshLambertMaterial({color:0xd9dbdd, side:THREE.DoubleSide});
  const bordMat=new THREE.MeshLambertMaterial({color:0x84898f, side:THREE.DoubleSide});
  lay.roads.forEach(rd=>{
    const fuz=!!(fuzMat&&pzk&&rd.pts.some(p2=>Math.hypot(p2.x-pzk.x,p2.z-pzk.z)<pzk.r));
    if(!fuz&&gwMat&&rd.gen<2){                                                                       /*BORDSTEIN-GLIEDER-GESETZ: die alten VOLLBREITEN Deckplatten (w+2.5@0.115 / w+2.2@0.13) lagen ZENTRIERT UEBER der Fahrbahn — Asphalt+Mittellinie waren seit je UNSICHTBAR (Michis Grau). Jetzt: je Seite EIN Randstein mit FLANKE bis in die Rinne + EIN Gehwegstreifen — der Querschnitt besteht aus Gliedern, nicht Decken.*/
      const profBi=[[-1,-0.082],[-0.82,-0.082],[-0.45,-0.012],[1,0]];                           /*Strassenflanke faellt 0.115→0.033 (Rinne 0.025+Anschlag)*/
      const profBa=[[-1,0],[0.45,-0.012],[0.82,-0.082],[1,-0.082]];
      for(const sg7 of [-1,1]){ const kp7=offPts(rd.pts, sg7*(rd.w/2+0.175));
        const km=new THREE.Mesh(rib(kp7,0.35,0.115, sg7>0?profBi:profBa),bordMat); km.receiveShadow=true; dorfGroup.add(km);
        const gp7=offPts(rd.pts, sg7*(rd.w/2+0.35+0.55));
        const gm=new THREE.Mesh(rib(gp7,1.1,0.13),gwMat); gm.receiveShadow=true; dorfGroup.add(gm); }
      for(let k=0;k+2<rd.pts.length;k+=2){ const A=rd.pts[k],B2=rd.pts[k+2];
        const dx=B2.x-A.x, dz=B2.z-A.z, len=Math.hypot(dx,dz)+0.3, ang=Math.atan2(-dz,dx), mx=(A.x+B2.x)/2, mz=(A.z+B2.z)/2;
        for(const sg of [-1,1]){ const ox=-Math.sin(A.th)*sg*(rd.w/2+0.6), oz=Math.cos(A.th)*sg*(rd.w/2+0.6);
          solids.push({min:[-len/2,0,-0.62],max:[len/2,0.13,0.62], th:ang, tx:mx+ox, tz:mz+oz, gw:1}); } } }
    const kr=Math.min(0.075, rd.w*0.0125);                                                    /*STRASSEN-QUERPROFIL-GESETZ: die Fahrbahn ist ein BAUWERK — modern/pflaster: Bombierung 2.5% zur Mitte + Rinnstein-Mulde beidseits (Wasser laeuft AUSSEN); Erde-Gasse: MITTELRINNE wie das Mittelalter baute (Wasser laeuft INNEN)*/
    const prof = fuz? null
      : (modernS||pflasterS)? [[-1,-0.010],[-0.86,-0.020],[-0.78,0],[0,kr],[0.78,0],[0.86,-0.020],[1,-0.010]]
      : [[-1,0.004],[-0.16,0.004],[0,-0.026],[0.16,0.004],[1,0.004]];
    const m=new THREE.Mesh(rib(rd.pts,rd.w,0.045,prof),fuz?fuzMat:asMat); m.receiveShadow=true; dorfGroup.add(m);
    if((modernS||pflasterS)&&!fuz&&rd.gen===0){ for(let gk=1;gk<rd.pts.length;gk+=3){ const q5=rd.pts[gk];   /*GULLY sitzt IN der Rinnstein-Tieflinie (off 0.86, y Krone−Mulde) — Entwaesserung folgt der Physik, nicht dem Zufall*/
      const gu=new THREE.Mesh(new THREE.BoxGeometry(0.52,0.018,0.52), M.dunkel);
      gu.position.set(q5.x-Math.sin(q5.th)*(rd.w/2*0.86), 0.045-0.020+0.011, q5.z+Math.cos(q5.th)*(rd.w/2*0.86)); gu.rotation.y=-q5.th; dorfGroup.add(gu); } }
    if(!fuz&&modernS&&rd.gen===0){ for(let k=0;k+1<rd.pts.length;k+=2){                              // MITTELLINIEN-GESETZ: gestrichelt entlang der Kurve
        const seg=[rd.pts[k],rd.pts[k+1]]; const lm=new THREE.Mesh(rib(seg,0.15,0.045+kr+0.005),wMat); dorfGroup.add(lm); } }   /*MITTELLINIE AUF DER KRONE: 0.055 lag unter der Bombierung — Markierungen reiten das Profil*/
    if(!fuz&&modernS&&rd.gen===1&&rd.pts.length>3){ const q=rd.pts[1], ang=-q.th;                    // ZEBRA-GESETZ an der Einmündung
      const krZ=Math.min(0.075, rd.w*0.0125);                                                /*ZEBRA-PROFILFOLGE: drei Segmente je Streifen reiten die Bombierung — Rand/Krone/Rand*/
      for(let z2=0;z2<5;z2++){ const u=1.2+z2*0.62, px=q.x+Math.cos(q.th)*u, pz=q.z+Math.sin(q.th)*u, nx=-Math.sin(q.th), nz=Math.cos(q.th);
        for(const [oA,yA] of [[-rd.w*0.30, 0.045+krZ*0.45+0.008],[0, 0.045+krZ+0.008],[rd.w*0.30, 0.045+krZ*0.45+0.008]]){
          const zb=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.012,rd.w*0.30),wMat);
          zb.position.set(px+nx*oA, yA, pz+nz*oA); zb.rotation.y=ang; dorfGroup.add(zb); } } }
    if(!modernS&&!pflasterS&&!fuz&&rd.gen===0){ for(const sg of [-0.78,0.78]){                 // SPURRILLEN nur in ERDE — Karren graben sich nicht in Pflaster                                    // SPURRILLEN-GESETZ: Karren gruben sich ein
        const sp=new THREE.Mesh(rib(offPts(rd.pts,sg),0.32,0.048),mLay('boden')); sp.receiveShadow=true; dorfGroup.add(sp); } } });
  lay.feldwege.forEach(fw=>{ const m=new THREE.Mesh(rib(fw.pts,fw.w,0.03),M.weg); m.receiveShadow=true; dorfGroup.add(m); });
  if(lay.platz){ const pz=lay.platz, pm=new THREE.Mesh(new THREE.BoxGeometry(pz.ex*2,0.09,pz.ez*2),(pz.typ==='gras')?M.gras:((modernS||pflasterS)?new THREE.MeshLambertMaterial({color:0xa9a49a, side:THREE.DoubleSide}):M.weg));   // MARKT trägt den Zonen-Belag
    pm.position.set(pz.cx,0.045,pz.cz); pm.receiveShadow=true; dorfGroup.add(pm); }
  if(lay.mauer){                                                                              // STADTMAUER: Segmente, Türme, Tore
    lay.mauer.segs.forEach(sg=>{ const dx=sg.x1-sg.x0, dz=sg.z1-sg.z0, len=Math.hypot(dx,dz)+0.6;
      const ang=Math.atan2(-dz,dx), mx=(sg.x0+sg.x1)/2, mz=(sg.z0+sg.z1)/2;
      const w=new THREE.Mesh(new THREE.BoxGeometry(len,5.6,1.6),mLay('stein')); w.position.set(mx,2.8,mz); w.rotation.y=ang;
      w.castShadow=true; w.receiveShadow=true; dorfGroup.add(w);
      const zi=new THREE.Mesh(new THREE.BoxGeometry(len,0.7,2.0),mLay('stein')); zi.position.set(mx,5.9,mz); zi.rotation.y=ang; zi.castShadow=true; dorfGroup.add(zi);
      solids.push({min:[-len/2,0,-0.8],max:[len/2,5.6,0.8], th:ang, tx:mx, tz:mz}); });
    lay.mauer.towers.forEach(tw=>{ const tm=new THREE.Mesh(new THREE.BoxGeometry(3.6,8.4,3.6),mLay('stein')); tm.position.set(tw.x,4.2,tw.z); tm.castShadow=true; tm.receiveShadow=true; dorfGroup.add(tm);
      const td=new THREE.Mesh(new THREE.BoxGeometry(4.2,1.5,4.2),M.ziegel); td.position.set(tw.x,9.1,tw.z); td.castShadow=true; dorfGroup.add(td);
      solids.push({min:[tw.x-1.8,0,tw.z-1.8],max:[tw.x+1.8,8.4,tw.z+1.8]}); }); }
  if(lay.fluss){ const wm=new THREE.MeshLambertMaterial({color:0x3d6d9c, side:THREE.DoubleSide});                   // FLUSS: Wasserband + Ufer
    if(pflasterS||modernS){ const fp2=lay.fluss.pts, fw2=lay.fluss.w;                          // KAIMAUER-GESETZ: die Stadt fasst ihren Fluss in Stein — Uferkante 0.42 hoch entlang beider Seiten
      for(const sg2 of [-1,1]){ for(let k2=0;k2+1<fp2.length;k2++){ const A2=fp2[k2], B3=fp2[k2+1];
        const mx2=(A2.x+B3.x)/2 - Math.sin(A2.th)*sg2*(fw2/2+0.62), mz2=(A2.z+B3.z)/2 + Math.cos(A2.th)*sg2*(fw2/2+0.62);
        let anBk=false; for(const bk2 of lay.bruecken){ const dx3=mx2-bk2.x, dz3=mz2-bk2.z;    // KAI-LÜCKE: kein Steinblock quer über der Brückenzufahrt
          const lp=dx3*Math.cos(bk2.th)+dz3*Math.sin(bk2.th), lq=-dx3*Math.sin(bk2.th)+dz3*Math.cos(bk2.th);
          if(Math.abs(lp)<bk2.len/2+0.9&&Math.abs(lq)<bk2.w/2+1.1){ anBk=true; break; } }
        if(anBk) continue;
        const ln2=Math.hypot(B3.x-A2.x,B3.z-A2.z)+0.25;
        const km2=new THREE.Mesh(new THREE.BoxGeometry(ln2,1.02,0.4), mLay('stein'));                                  // FLUSS-TAL-GESETZ: die Kaimauer STÜTZT — Oberkante 0.34 bleibt, Fuß gründet unter dem Wasserspiegel
        km2.position.set(mx2,-0.17,mz2); km2.rotation.y=-A2.th; km2.receiveShadow=true; km2.castShadow=true; dorfGroup.add(km2); } } }
    if(!(pflasterS||modernS)){ const fp4=lay.fluss.pts, fw4=lay.fluss.w, neig=Math.atan2(0.55,1.6);   // LÄNDLICH: geneigte BÖSCHUNGEN — der Fluss gräbt sein Bett, das Ufer fällt ihm zu
      for(const sg4 of [-1,1]){ for(let k4=0;k4+1<fp4.length;k4++){ const A4=fp4[k4], B4=fp4[k4+1];
        const ln4=Math.hypot(B4.x-A4.x,B4.z-A4.z)+0.3;
        const bx4=new THREE.Mesh(new THREE.BoxGeometry(ln4,0.14,1.75), mLay('lehm'));
        bx4.position.set((A4.x+B4.x)/2 - Math.sin(A4.th)*sg4*(fw4/2+0.72), -0.24, (A4.z+B4.z)/2 + Math.cos(A4.th)*sg4*(fw4/2+0.72));
        bx4.rotation.order='YXZ'; bx4.rotation.y=-A4.th; bx4.rotation.x=-neig*sg4; /*EULER-ORDER-GESETZ: erst ausrichten (Y), dann quer kippen (X) — bei XYZ kippte X um die WELTachse, 52/226*/ bx4.receiveShadow=true; dorfGroup.add(bx4); } } }
    const m=new THREE.Mesh(rib(lay.fluss.pts, lay.fluss.w, -0.53), wm); m.receiveShadow=true; dorfGroup.add(m);   // WASSERSPIEGEL −0.53: Brücken bekommen LICHTE HÖHE, Pfeiler gründen echt
    for(const q of lay.fluss.pts){ solids.push({min:[q.x-1.2,-.1,q.z-1.2],max:[q.x+1.2,0.02,q.z+1.2]}); } }
  lay.bruecken.forEach(bk=>{ const ang=-bk.th;                                               // BRÜCKE: Deck + Geländer über dem Band
    const deck=new THREE.Mesh(new THREE.BoxGeometry(bk.len,0.26,bk.w),mLay('stein'));
    deck.position.set(bk.x,0.16,bk.z); deck.rotation.y=ang; deck.castShadow=true; deck.receiveShadow=true; dorfGroup.add(deck);
    const tx2=Math.cos(bk.th), tz2=Math.sin(bk.th);                                           // BRÜCKEN-WÜRDE-GESETZ: sichtbare WAND-PFEILER + steinerne BOGENBLENDEN (alte Zeit) + WIDERLAGER — das Deck von R2 las sich als Brett, die 3cm-Pylonen verschwanden GESEHEN unsichtbar
    const spannT=(bk.len>16)? [-0.25,0,0.25] : (bk.len>9? [-0.22,0.22] : []);
    for(const t of spannT){ const py=new THREE.Mesh(new THREE.BoxGeometry(0.55,1.7,Math.max(1.2,bk.w-1.4)), mLay('stein'));
      py.position.set(bk.x+tx2*bk.len*t, -0.68, bk.z+tz2*bk.len*t); py.rotation.y=ang; dorfGroup.add(py); }
    for(const e2 of [-0.5,0.5]){ const wl=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.55,bk.w+0.5), mLay('stein'));  // WIDERLAGER an beiden Enden
      wl.position.set(bk.x+tx2*bk.len*e2*0.96, -0.14, bk.z+tz2*bk.len*e2*0.96); wl.rotation.y=ang; dorfGroup.add(wl); }
    if(!modernS){ const felder2=spannT.length? spannT.concat([-0.5,0.5]).sort((q1,q2)=>q1-q2) : [-0.5,0.5];          // BOGENBLENDEN: je Feld ein flacher Bogen aus 5 hängenden Fascia-Steinen — von der Seite eine Steinbrücke
      for(let f2=0;f2+1<felder2.length;f2++){ const m0=felder2[f2], m1=felder2[f2+1];
        for(const sz2 of [-1,1]){ for(let k2=0;k2<5;k2++){ const u=(k2+0.5)/5, tm=m0+(m1-m0)*u;
          const hb=0.42-0.34*Math.sin(u*Math.PI);                                             // tief am Pfeiler, flach im Scheitel
          const fa=new THREE.Mesh(new THREE.BoxGeometry((m1-m0)*bk.len/5+0.06, hb, 0.12), mLay('stein'));
          fa.position.set(bk.x+tx2*bk.len*tm - Math.sin(bk.th)*sz2*(bk.w/2-0.06), 0.03-hb/2, bk.z+tz2*bk.len*tm + Math.cos(bk.th)*sz2*(bk.w/2-0.06));
          fa.rotation.y=ang; dorfGroup.add(fa); } } } }
    for(const sz of [-1,1]){ const ra=new THREE.Mesh(new THREE.BoxGeometry(bk.len,0.85,0.14),mLay('stein'));
      const ox=-Math.sin(bk.th)*sz*(bk.w/2-0.1), oz=Math.cos(bk.th)*sz*(bk.w/2-0.1);
      ra.position.set(bk.x+ox,0.7,bk.z+oz); ra.rotation.y=ang; ra.castShadow=true; dorfGroup.add(ra);
      solids.push({min:[-bk.len/2,0,-0.1],max:[bk.len/2,1.1,0.1], th:ang, tx:bk.x+ox, tz:bk.z+oz}); } });
  lay.brunnen.forEach(b3=>{ const bg2=new THREE.Group(); bg2.position.set(b3.x,0,b3.z);
    for(let a2=0;a2<8;a2++){ const w=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.7,0.28),mLay('stein'));
      w.position.set(Math.cos(a2/8*2*Math.PI)*1.05,0.35,Math.sin(a2/8*2*Math.PI)*1.05); w.rotation.y=-a2/8*2*Math.PI; bg2.add(w); }
    const wa=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.06,1.7),M.dunkel); wa.position.y=0.55; bg2.add(wa);
    [-1,1].forEach(sx=>{ const p2=new THREE.Mesh(new THREE.BoxGeometry(0.12,2.0,0.12),mLay('holz')); p2.position.set(sx*1.0,1.0,0); bg2.add(p2); });
    const rf=new THREE.Mesh(new THREE.BoxGeometry(2.6,0.1,1.6),M.ziegel); rf.position.y=2.05; rf.rotation.z=0.12; bg2.add(rf);
    bg2.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); dorfGroup.add(bg2);
    solids.push({min:[b3.x-1.35,0,b3.z-1.35],max:[b3.x+1.35,0.75,b3.z+1.35]}); });
  lay.fences.forEach(f=>{ const dx=f.x1-f.x0, dz=f.z1-f.z0, len=Math.hypot(dx,dz); if(len<0.8)return;
    const ang=Math.atan2(-dz,dx), mx=(f.x0+f.x1)/2, mz=(f.z0+f.z1)/2, np=Math.max(2,Math.round(len/1.6)+1);
    for(let q2=0;q2<np;q2++){ const fpo=new THREE.Mesh(new THREE.BoxGeometry(0.09,1.0,0.09),mLay('holz'));
      fpo.position.set(f.x0+dx*q2/(np-1),0.5,f.z0+dz*q2/(np-1)); fpo.castShadow=true; dorfGroup.add(fpo); }
    for(const ry of [0.55,0.9]){ const ra=new THREE.Mesh(new THREE.BoxGeometry(len,0.07,0.06),M.lattung);
      ra.position.set(mx,ry,mz); ra.rotation.y=ang; ra.castShadow=true; dorfGroup.add(ra); }
    solids.push({min:[-len/2,0,-0.08],max:[len/2,0.95,0.08], th:ang, tx:mx, tz:mz}); });
  lay.felder.forEach(f=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(f.ex*2,0.1,f.ez*2),mLay('lehm'));
    m.position.set(f.cx,0.05,f.cz); m.rotation.y=f.phi; m.receiveShadow=true; dorfGroup.add(m);
    const nfu=Math.max(2,(f.ez*2/1.6)|0); for(let q2=1;q2<nfu;q2++){ const fu=new THREE.Mesh(new THREE.BoxGeometry(f.ex*2-0.8,0.05,0.28),mLay('boden'));
      const lz=-f.ez+q2*2*f.ez/nfu, c2=Math.cos(f.phi), s3=Math.sin(f.phi);
      fu.position.set(f.cx+lz*s3,0.11,f.cz+lz*c2); fu.rotation.y=f.phi; fu.receiveShadow=true; dorfGroup.add(fu); } });
  lay.staende.forEach(st=>{ const g2=new THREE.Group(); g2.position.set(st.x,0,st.z);
    [[-0.9,-0.6],[0.9,-0.6],[-0.9,0.6],[0.9,0.6]].forEach(q2=>{ const po=new THREE.Mesh(new THREE.BoxGeometry(0.1,2.0,0.1),mLay('holz')); po.position.set(q2[0],1.0,q2[1]); g2.add(po); });
    const da=new THREE.Mesh(new THREE.BoxGeometry(2.3,0.08,1.7),M.ziegel2); da.position.y=2.05; da.rotation.x=0.1; g2.add(da);
    const th2=new THREE.Mesh(new THREE.BoxGeometry(2.0,0.08,1.0),mLay('holz')); th2.position.y=0.95; g2.add(th2);
    const mk3=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.05,0.9), new THREE.MeshLambertMaterial({color:[0xb0533a,0x8a6d3b,0x5f7a4a,0x9c8f5f][(st.x*7+st.z*3&3+0)>>>0&3]}));   // MARKISEN-GESETZ: Tuch überm Stand — Marktfarbe aus der Position gewürfelt
    mk3.position.set(0,2.14,-0.85); mk3.rotation.x=0.42; g2.add(mk3);
    for(const wx of [-0.55,0.15,0.7]){ const korb=new THREE.Mesh(new THREE.BoxGeometry(0.42,0.3,0.42), mLay('lattung')); korb.position.set(wx,1.14,(wx*13&1)?0.18:-0.15); g2.add(korb); }   // WAREN auf dem Tisch
    g2.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}}); dorfGroup.add(g2);
    solids.push({min:[st.x-1.0,0,st.z-0.7],max:[st.x+1.0,1.0,st.z+0.7]}); });
  { let dh=((plan.seed||7)*1103515245+12345)>>>0; const dr=()=>{ dh^=dh<<13; dh^=dh>>>17; dh^=dh<<5; dh>>>=0; return (dh&0xffff)/0x10000; };   /*AUSSTATTUNGS-DNA + PLATZIERUNGS-BEDINGUNGS-GESETZ: jedes Ding hat REALITAETS-Bedingungen — frei() prueft Fahrbahn+Fluss, setzFrei() streut bis erfuellt*/
    const frei=(x,z,r)=>{
      for(const rd2 of lay.roads){ for(let i2=0;i2+1<rd2.pts.length;i2++){ const A2=rd2.pts[i2],B3=rd2.pts[i2+1];
        const dx2=B3.x-A2.x,dz2=B3.z-A2.z,L3=dx2*dx2+dz2*dz2||1; let t2=((x-A2.x)*dx2+(z-A2.z)*dz2)/L3; t2=Math.max(0,Math.min(1,t2));
        if(Math.hypot(x-(A2.x+dx2*t2), z-(A2.z+dz2*t2)) < rd2.w/2+r) return false; } }
      if(lay.fluss){ for(const q2 of lay.fluss.pts){ if(Math.hypot(x-q2.x,z-q2.z)<lay.fluss.w/2+r+0.8) return false; } }
      return true; };
    const setzFrei=(fn,x,z,r,streu)=>{ for(let v2=0;v2<7;v2++){ const ax=x+(v2?(dr()*2-1)*streu:0), az=z+(v2?(dr()*2-1)*streu:0);
      if(frei(ax,az,r)){ fn(ax,az); return true; } } return false; };
    const fass=(x,z)=>{ const g3=new THREE.Group(); g3.position.set(x,0,z); g3.rotation.y=dr()*3.14;   /*FASS-SAME: die Form WÄCHST aus Böttcher-Regeln — Daubenzahl=⌈Umfang/Daubenbreite⌉, Bauchung als Neigung, Reifenzahl aus der Höhe*/
      const rF=0.26, hF=0.66, dB=0.088, nD=Math.ceil(2*Math.PI*rF/dB);
      for(let d3=0;d3<nD;d3++){ const a3=d3/nD*2*Math.PI;
        const st5=new THREE.Mesh(new THREE.BoxGeometry(dB*0.96, hF, 0.03), mLay('holz'));
        st5.position.set(Math.cos(a3)*rF, hF/2, Math.sin(a3)*rF);
        st5.rotation.order='YXZ'; st5.rotation.y=-a3+Math.PI/2; st5.rotation.x=0.0;
        g3.add(st5); }
      const nR=Math.max(2, Math.round(hF/0.3));
      for(let r3=0;r3<nR;r3++){ const hy=0.1+r3*(hF-0.2)/(nR-1);
        for(const ay of [0,Math.PI/4]){ const rg=new THREE.Mesh(new THREE.BoxGeometry(rF*2+0.05,0.045,rF*2+0.05), M.dunkel); rg.position.y=hy; rg.rotation.y=ay; g3.add(rg); } }
      dorfGroup.add(g3); };
    const bank=(x,z,th)=>{ const g3=new THREE.Group(); g3.position.set(x,0,z); g3.rotation.y=th;   /*BANK-SAME: Tischler-Regeln — Sitzhöhe 0.45 (Norm), Tiefe 0.42, Länge=Plätze×0.62, Lehne=Sitz+0.32 bei 8° Neigung, Bein=Sitz/10*/
      const nP=2, sH=0.45, sT=0.42, L4=nP*0.62, bQ=sH/10;
      const si=new THREE.Mesh(new THREE.BoxGeometry(L4,0.07,sT), mLay('holz')); si.position.y=sH+0.035; g3.add(si);
      for(const lx of [-(L4/2-bQ),(L4/2-bQ)]){ const be=new THREE.Mesh(new THREE.BoxGeometry(bQ,sH,sT-0.06), mLay('holz')); be.position.set(lx,sH/2,0); g3.add(be); }
      const le=new THREE.Mesh(new THREE.BoxGeometry(L4,0.32,0.055), mLay('holz')); le.position.set(0,sH+0.30,-(sT/2-0.03)); le.rotation.x=-0.14; g3.add(le);
      dorfGroup.add(g3); };
    const heu=(x,z)=>{ const g3=new THREE.Group(); g3.position.set(x,0,z); g3.rotation.y=dr()*3.14;
      const h1=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.9,1.5), mLay('stroh')); h1.position.y=0.45; g3.add(h1);
      const h2=new THREE.Mesh(new THREE.BoxGeometry(1.05,0.6,1.05), mLay('stroh')); h2.position.y=1.13; h2.rotation.y=Math.PI/4; g3.add(h2);
      const st3=new THREE.Mesh(new THREE.BoxGeometry(0.09,2.0,0.09), mLay('holz')); st3.position.y=1.0; g3.add(st3);
      dorfGroup.add(g3); };
    const karren=(x,z,th)=>{ const g3=new THREE.Group(); g3.position.set(x,0,z); g3.rotation.y=th;   /*KARREN-SAME: Stellmacher-Regeln — Rad-Ø=Bettbreite×0.72 (Spurstabilität), Achshöhe=Rad/2, Bettboden=Achse+0.14, Deichsel=Bettlänge×0.8*/
      const bB=0.95, bL=1.7, radD=bB*0.72, achsH=radD/2, bettY=achsH+0.14+0.15;
      const bett=new THREE.Mesh(new THREE.BoxGeometry(bL,0.3,bB), mLay('holz')); bett.position.y=bettY; g3.add(bett);
      for(const dz3 of [-(bB/2+0.06),(bB/2+0.06)]){ const w1=new THREE.Mesh(new THREE.BoxGeometry(radD,radD,0.07), mLay('holz')); w1.position.set(-bL*0.2,achsH,dz3);
        const w2=w1.clone(); w2.rotation.z=Math.PI/4; g3.add(w1); g3.add(w2); }
      for(const dz3 of [-0.3,0.3]){ const gr=new THREE.Mesh(new THREE.BoxGeometry(bL*0.8,0.06,0.07), mLay('holz')); gr.position.set(bL*0.55+bL*0.4,bettY-0.06,dz3); gr.rotation.z=-0.12; g3.add(gr); }
      dorfGroup.add(g3); };
    if(lay.platz&&lay.platz.typ!=='gras'){ const pz3=lay.platz;                                // PLATZ → BÄNKE an den Kanten, Blick zur Mitte
      for(const [bx,bz,bth] of [[pz3.cx-pz3.ex+1.1,pz3.cz,Math.PI/2],[pz3.cx+pz3.ex-1.1,pz3.cz,-Math.PI/2],[pz3.cx,pz3.cz-pz3.ez+1.1,0]]) bank(bx,bz,bth);
      setzFrei((ax,az)=>karren(ax,az,dr()*3.14), pz3.cx+pz3.ex*0.55, pz3.cz+pz3.ez*0.62, 0.9, 2.4);
      for(let f3=0;f3<3;f3++) setzFrei(fass, pz3.cx-pz3.ex*0.7+dr()*0.8, pz3.cz+pz3.ez*0.7-dr()*0.8, 0.5, 1.8); }
    lay.felder.forEach(f3=>{ const nH2=1+((dr()*3)|0);                                        /*VORGEWENDE-GESETZ: Heuballen am Wendestreifen der Schmalseiten — nie ueber den Furchen*/
      for(let k3=0;k3<nH2;k3++){ const sk=(dr()<0.5)?-1:1;
        heu(f3.cx + sk*f3.ex*0.82, f3.cz - f3.ez*0.7 + dr()*f3.ez*1.4); } });
    if((pflasterS||modernS)&&lay.fluss){ const fp3=lay.fluss.pts, fw3=lay.fluss.w;             // KAI → POLLER alle ~9m + Fass-Gruppen an Brückenköpfen (Handelsufer)
      for(const sg3 of [-1,1]){ for(let k3=0;k3<fp3.length;k3+=3){ const A3=fp3[k3];
        const px3=A3.x-Math.sin(A3.th)*sg3*(fw3/2+1.15), pz4=A3.z+Math.cos(A3.th)*sg3*(fw3/2+1.15);
        const po3=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.5,0.22), M.dunkel); po3.position.set(px3,0.25,pz4); dorfGroup.add(po3); } }
      lay.bruecken.forEach(bk3=>{ for(let k3=0;k3<2+((dr()*2)|0);k3++) fass(bk3.x+Math.cos(bk3.th)*(bk3.len/2+1.2)+dr()*1.4, bk3.z+Math.sin(bk3.th)*(bk3.len/2+1.2)+dr()*1.4); }); }
    if(fuzMat&&pzk&&lay.laternen.length>1){ const nahL=lay.laternen.filter(l3=>Math.hypot(l3.x-pzk.x,l3.z-pzk.z)<pzk.r+6);   // SCHICHT-4: WIMPELKETTEN über der Fußgängerzone — der Markt feiert
      for(let k3=0;k3+1<nahL.length&&k3<6;k3+=2){ const A5=nahL[k3], B5=nahL[k3+1];
        const dx5=B5.x-A5.x, dz5=B5.z-A5.z, L5=Math.hypot(dx5,dz5); if(L5<3||L5>26) continue;
        const lH5=Math.max(2.7,Math.min(4.6,0.55*plan.norm.strasseW+1.6))-0.35;
        for(let s5=0;s5<14;s5++){ const t6=(s5+0.5)/14, sag6=Math.sin(t6*Math.PI)*0.55;       /*WIMPEL-SEIL: die Kette braucht ihr Seil — sonst schwebt Konfetti (Michis Bild)*/
          const sl=new THREE.Mesh(new THREE.BoxGeometry(L5/14+0.04,0.025,0.025), M.dunkel);
          sl.position.set(A5.x+dx5*t6, lH5-sag6, A5.z+dz5*t6); sl.rotation.y=Math.atan2(dz5,dx5); dorfGroup.add(sl); }
        for(let w5=1;w5<=6;w5++){ const t5=w5/7, sag=Math.sin(t5*Math.PI)*0.55;
          const wp=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.3,0.03), new THREE.MeshLambertMaterial({color:[0xb0533a,0xd0a94a,0x5f7a4a,0x7a5fa0][w5&3], side:THREE.DoubleSide}));
          wp.position.set(A5.x+dx5*t5, lH5-sag-0.17, A5.z+dz5*t5); wp.rotation.y=Math.atan2(dz5,dx5); dorfGroup.add(wp); } } }
    if(lay.brunnen.length){ const b6=lay.brunnen[0];                                          // SCHICHT-4: TAUBEN am Brunnen — kleines Leben, große Wirkung
      for(let k3=0;k3<4+((dr()*3)|0);k3++){ const a6=dr()*6.28, r6=0.6+dr()*2.2;
        const tx6=b6.x+Math.cos(a6)*r6, tz6=b6.z+Math.sin(a6)*r6; if(!frei(tx6,tz6,0.12)) continue;
        const tb=new THREE.Group(); tb.position.set(tx6, 0.72*((dr()<0.4)?1:0)+0.06, tz6); tb.rotation.y=dr()*6.28;
        const k6=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.11,0.1), mLay('stein')); k6.position.y=0.055; tb.add(k6);
        const h6=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.07,0.06), mLay('stein')); h6.position.set(0.09,0.12,0); tb.add(h6);
        dorfGroup.add(tb); } }
    if(plan.staedtisch&&plan.jahr<600){                                                       /*ANTIKE-AUSSTATTUNG: Amphoren, Trog, Meilensteine, Zisterne — die 222er-Strasse hoert auf leer zu sein*/
      const amph=(x,z)=>{ const g3=new THREE.Group(); g3.position.set(x,0,z); g3.rotation.y=dr()*3.14;
        const b1=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.62,0.34), mLay('lehm')); b1.position.y=0.31; g3.add(b1);
        const b2=b1.clone(); b2.rotation.y=Math.PI/4; g3.add(b2);
        const hals=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.18,0.16), mLay('lehm')); hals.position.y=0.71; g3.add(hals);
        dorfGroup.add(g3); };
      if(lay.platz){ for(let a7=0;a7<5;a7++) setzFrei(amph, lay.platz.cx-lay.platz.ex*0.6+dr()*lay.platz.ex*1.2, lay.platz.cz-lay.platz.ez*0.72, 0.4, 1.6);
        const zi7=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.07,1.5), mLay('stein')); zi7.position.set(lay.platz.cx+lay.platz.ex*0.35, 0.045, lay.platz.cz+lay.platz.ez*0.3); zi7.rotation.y=0.4; dorfGroup.add(zi7);
        const zi8=zi7.clone(); zi8.rotation.y=0.4+Math.PI/4; dorfGroup.add(zi8); }
      if(lay.brunnen.length){ const b7=lay.brunnen[0];
        const tr7=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.42,0.62), mLay('stein')); tr7.position.set(b7.x+1.9,0.21,b7.z+0.4); dorfGroup.add(tr7);
        const wa7=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.05,0.46), wm||new THREE.MeshLambertMaterial({color:0x5f88a8})); wa7.position.set(b7.x+1.9,0.40,b7.z+0.4); dorfGroup.add(wa7); }
      const lang7=lay.roads.filter(r7=>r7.gen<2).sort((a7,b7)=>(b7.len||0)-(a7.len||0))[0];
      if(lang7){ for(const u7 of [10, (lang7.len||30)*0.6]){ const k7=Math.min(lang7.pts.length-1,(u7/2.2)|0), q7=lang7.pts[k7];
        const ms=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.95,0.3), mLay('stein')); ms.position.set(q7.x-Math.sin(q7.th)*(lang7.w/2+0.9),0.475,q7.z+Math.cos(q7.th)*(lang7.w/2+0.9)); dorfGroup.add(ms);
        const mk7=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.1,0.34), mLay('stein')); mk7.position.set(ms.position.x,0.99,ms.position.z); dorfGroup.add(mk7); } } }
    { const nB=plan.staedtisch? Math.min(44, 12+((plan.houses&&plan.houses.length)||20)/2|0) : 8;   /*BEWOHNER-SILHOUETTEN: die Stadt hat Menschen — zwei Kutten-Gruppen, instanziert, am Gehwegrand und Platz*/
      const posB=[]; let vers=0;
      while(posB.length<nB && vers<nB*9){ vers++;
        const rd7=lay.roads[(dr()*lay.roads.length)|0]; if(!rd7||rd7.pts.length<4) continue;
        const q7=rd7.pts[1+((dr()*(rd7.pts.length-2))|0)], sg7=dr()<0.5?-1:1;
        const bx7=q7.x-Math.sin(q7.th)*sg7*(rd7.w/2+0.9+dr()*0.8), bz7=q7.z+Math.cos(q7.th)*sg7*(rd7.w/2+0.9+dr()*0.8);
        if(lay.fluss&&(()=>{for(const qf of lay.fluss.pts){if(Math.hypot(bx7-qf.x,bz7-qf.z)<lay.fluss.w/2+1.4)return true;}return false;})()) continue;
        posB.push({x:bx7,z:bz7,th:dr()*6.28}); }
      if(lay.platz) for(let p7=0;p7<Math.min(8,nB/3|0);p7++) posB.push({x:lay.platz.cx+(dr()-0.5)*lay.platz.ex*1.4, z:lay.platz.cz+(dr()-0.5)*lay.platz.ez*1.4, th:dr()*6.28});
      const mtxB=new THREE.Matrix4();
      for(const [tint7, teil7] of [[0x6b5a48, posB.filter((_,i7)=>i7%2===0)],[0x8a8378, posB.filter((_,i7)=>i7%2===1)]]){ if(!teil7.length) continue;
        const kk=new THREE.InstancedMesh(new THREE.BoxGeometry(0.36,1.06,0.24), new THREE.MeshLambertMaterial({color:tint7}), teil7.length);
        const kf=new THREE.InstancedMesh(new THREE.BoxGeometry(0.17,0.19,0.17), new THREE.MeshLambertMaterial({color:0xc9a583}), teil7.length);
        teil7.forEach((p7,i7)=>{ kk.setMatrixAt(i7, mtxB.makeRotationY(p7.th).setPosition(p7.x,0.53,p7.z));
          kf.setMatrixAt(i7, mtxB.makeRotationY(p7.th).setPosition(p7.x,1.16,p7.z)); });
        kk.name='inst_bewohner'; kk.castShadow=true;
        [kk,kf].forEach(im=>{ im.instanceMatrix.needsUpdate=true; dorfGroup.add(im); }); } }
    if(plan.jahr<1905){ for(const rd7 of lay.roads){ if(!rd7.quer||(rd7.len||0)<16) continue;   /*GASSEN-WAESCHE: Leinen quer ueber die Binnengasse — das Gassenbild schlechthin*/
      const k7=(rd7.pts.length/2)|0, q7=rd7.pts[k7], nx7=-Math.sin(q7.th), nz7=Math.cos(q7.th), sp7=rd7.w/2+1.1;
      const seg7=10; for(let s7=0;s7<seg7;s7++){ const t7=(s7+0.5)/seg7, sag7=Math.sin(t7*Math.PI)*0.35;
        const sl7=new THREE.Mesh(new THREE.BoxGeometry(sp7*2/seg7+0.03,0.02,0.02), M.dunkel);
        sl7.position.set(q7.x+nx7*(t7*2-1)*sp7, 3.05-sag7, q7.z+nz7*(t7*2-1)*sp7); sl7.rotation.y=Math.atan2(nz7,nx7); dorfGroup.add(sl7); }
      for(const tw of [-0.35,0.15,0.55]){ const tu=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.42,0.02), new THREE.MeshLambertMaterial({color:[0xd8d2c4,0x9db3c8,0xc4a58f][((tw*10+9)|0)%3], side:THREE.DoubleSide}));
        tu.position.set(q7.x+nx7*tw*sp7, 2.83-Math.sin((tw/2+0.5)*Math.PI)*0.3, q7.z+nz7*tw*sp7); tu.rotation.y=Math.atan2(nz7,nx7); dorfGroup.add(tu); } } }
    if(plan.staedtisch&&plan.jahr<1935){ let gp7=0;                                            /*STRASSEN-LEBEN: geparkte Karren an Nebenstrassen — die Wirtschaft steht am Rand*/
      for(const rd7 of lay.roads){ if(rd7.gen!==1||gp7>=4) continue; const L7=rd7.len||((rd7.pts.length-1)*2.2);
        for(let u7=14; u7<L7-8 && gp7<4; u7+=26+dr()*18){ const k7=Math.min(rd7.pts.length-1,(u7/2.2)|0), q7=rd7.pts[k7], sg7=dr()<0.5?-1:1;
          const kx7=q7.x-Math.sin(q7.th)*sg7*(rd7.w/2+1.7), kz7=q7.z+Math.cos(q7.th)*sg7*(rd7.w/2+1.7);
          if(frei(kx7,kz7,0.8)){ karren(kx7,kz7,q7.th+(dr()<0.5?0:Math.PI)); gp7++; } } } }
    if(!plan.staedtisch&&lay.feldwege.length){ const fw4=lay.feldwege[0].pts;                  // DORFAUSGANG → BILDSTOCK am ersten Feldweg
      if(fw4&&fw4.length>1){ const A4=fw4[1]; const g4=new THREE.Group(); g4.position.set(A4.x+1.3,0,A4.z+1.3);
        const p4=new THREE.Mesh(new THREE.BoxGeometry(0.24,1.7,0.24), mLay('stein')); p4.position.y=0.85; g4.add(p4);
        const n4=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.34), mLay('stein')); n4.position.y=1.85; g4.add(n4);
        const d4=new THREE.Mesh(new THREE.BoxGeometry(0.68,0.09,0.5), M.ziegel); d4.position.y=2.16; g4.add(d4);
        dorfGroup.add(g4); } } }
  if(lay.laternen.length){ const mtx=new THREE.Matrix4();                                     /*LATERNEN-ZEITREISE: ZWEI Bauart-Gruppen je Ring-Jahr — Gas (warm, haengend) im Altkern, Elektro (kuehl, sitzend) am Saum; je Gruppe drei Instanz-Draws*/
    const lichtH=Math.max(2.7, Math.min(4.6, 0.55*plan.norm.strasseW+1.6));
    const pfD=lichtH/26, ausl=Math.min(0.9,(plan.norm.gehweg||1.2)*0.55);
    const stdGas=plan.jahr<1895;
    for(const istGas of [true,false]){ const liste=lay.laternen.filter(l9=>(l9.gas===undefined? stdGas : l9.gas)===istGas); if(!liste.length) continue;
      const n=liste.length, gas=istGas, kW=gas?0.24:0.34, kH=gas?0.46:0.22;
      const pf=new THREE.InstancedMesh(new THREE.BoxGeometry(pfD,lichtH,pfD),M.metall,n);
      const arm2=new THREE.InstancedMesh(new THREE.BoxGeometry(ausl,pfD*0.7,pfD*0.7),M.metall,n);
      const kopf=new THREE.InstancedMesh(new THREE.BoxGeometry(kW,kH,kW), new THREE.MeshLambertMaterial({color:gas?0xffd9a0:0xfff2cc, emissive:gas?0xcf8f2e:0xb8a86a}), n);
      liste.forEach((la,i)=>{ const lth=la.th||0, ax=Math.cos(lth), az=Math.sin(lth);
        pf.setMatrixAt(i, mtx.makeRotationY(-lth).setPosition(la.x,lichtH/2,la.z));
        arm2.setMatrixAt(i, mtx.makeRotationY(-lth).setPosition(la.x+ax*ausl/2, lichtH-pfD, la.z+az*ausl/2));
        const ky=gas? lichtH-pfD-kH/2-0.02 : lichtH-pfD+kH/2+0.02;
        kopf.setMatrixAt(i, mtx.makeRotationY(-lth).setPosition(la.x+ax*(ausl-kW*0.4), ky, la.z+az*(ausl-kW*0.4)));
        solids.push({min:[la.x-0.1,0,la.z-0.1],max:[la.x+0.1,lichtH,la.z+0.1]}); });
      pf.castShadow=true; pf.name='inst_laternen_'+(gas?'gas':'e');
      [pf,arm2,kopf].forEach(im=>{ im.instanceMatrix.needsUpdate=true; dorfGroup.add(im); }); }
    if(modernS){ lay.laternen.forEach((la,i)=>{ if(i%2) return;                                /*MUELLEIMER hinter dem Mast: Gehwegseite = GEGEN die Arm-Richtung — nie zur Fahrbahn*/
      const bx7=la.x-Math.cos(la.th||0)*0.5, bz7=la.z-Math.sin(la.th||0)*0.5;
      const mu=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.55,0.34), M.dunkel); mu.position.set(bx7,0.275,bz7); dorfGroup.add(mu);
      const mr=new THREE.Mesh(new THREE.BoxGeometry(0.38,0.05,0.38), M.metall); mr.position.set(bx7,0.56,bz7); dorfGroup.add(mr); }); }
    }
  if(plan.staedtisch&&plan.jahr>1700){                                                        /*ALTSTADT-BODEN-GESETZ: im Kern liegt PFLASTER zwischen den Haeusern, nicht Wiese — das Quartier ist Gewebe, kein Rasen mit Bauten*/
    let zx=0,zz=0,zn=0,rmx=20; for(const rd9 of lay.roads) for(const q9 of rd9.pts){ zx+=q9.x; zz+=q9.z; zn++; }
    zx/=Math.max(1,zn); zz/=Math.max(1,zn);
    for(const rd9 of lay.roads) for(const q9 of rd9.pts){ const d9=Math.hypot(q9.x-zx,q9.z-zz); if(d9>rmx)rmx=d9; }
    const rK=rmx*0.40, seg9=52, pos9=[];
    for(let s9=0;s9<seg9;s9++){ const a0=s9/seg9*6.2832, a1=(s9+1)/seg9*6.2832;
      pos9.push(zx,0.012,zz, zx+Math.cos(a1)*rK,0.012,zz+Math.sin(a1)*rK, zx+Math.cos(a0)*rK,0.012,zz+Math.sin(a0)*rK); }
    const bgA=new THREE.BufferGeometry(); bgA.setAttribute('position', new THREE.Float32BufferAttribute(pos9,3)); bgA.computeVertexNormals();
    const mA=new THREE.Mesh(bgA, new THREE.MeshLambertMaterial({color:0xb3ac9c, side:THREE.DoubleSide})); mA.receiveShadow=true; dorfGroup.add(mA);
    lay.altstadtR={x:zx,z:zz,r:rK}; }
  { let wh=((plan.seed||5)*2246822519+101)>>>0; const wr=()=>{ wh^=wh<<13; wh^=wh>>>17; wh^=wh<<5; wh>>>=0; return (wh&0xffff)/0x10000; };   /*WALD-GESETZ: das Umland ist nicht NICHTS — Blob-Noise-Waldmassen im Ring um die Stadt + Ufergehoelz am Fluss; dieselbe Instanz-Fabrik traegt alles*/
    let R9=20; for(const rd9 of lay.roads) for(const q9 of rd9.pts){ const d9=Math.hypot(q9.x-lay.spawn.x,q9.z-lay.spawn.z); if(d9>R9)R9=d9; }
    const strFrei=(x,z,r)=>{ for(const rd9 of lay.roads){ for(let i9=0;i9+1<rd9.pts.length;i9++){ const A9=rd9.pts[i9],B9=rd9.pts[i9+1];
        const dx9=B9.x-A9.x,dz9=B9.z-A9.z,L9=dx9*dx9+dz9*dz9||1; let t9=((x-A9.x)*dx9+(z-A9.z)*dz9)/L9; t9=Math.max(0,Math.min(1,t9));
        if(Math.hypot(x-(A9.x+dx9*t9), z-(A9.z+dz9*t9)) < rd9.w/2+r) return false; } }
      if(lay.fluss){ for(const q9 of lay.fluss.pts){ if(Math.hypot(x-q9.x,z-q9.z)<lay.fluss.w/2+r) return false; } } return true; };
    const blob=(x,z)=>{ const h9=Math.sin(x*0.061+7.3)*Math.cos(z*0.053-2.1)+Math.sin((x+z)*0.031); return h9>0.55; };
    let nW=0; for(let v9=0; v9<5200 && nW<2100; v9++){ const a9=wr()*6.283, rr9=R9*(1.04+wr()*0.85);
      const wx9=lay.spawn.x+Math.cos(a9)*rr9, wz9=lay.spawn.z+Math.sin(a9)*rr9;
      if(!blob(wx9,wz9)) continue; if(!strFrei(wx9,wz9,2.2)) continue;
      lay.trees.push({x:wx9+wr()*3-1.5, z:wz9+wr()*3-1.5, h:2.1+wr()*2.7}); nW++; }
    if(lay.fluss){ for(let k9=0;k9<lay.fluss.pts.length;k9+=2){ const q9=lay.fluss.pts[k9]; if(wr()<0.45) continue;
      for(const sg9 of [-1,1]){ const ux9=q9.x-Math.sin(q9.th)*sg9*(lay.fluss.w/2+2.4+wr()*2.2), uz9=q9.z+Math.cos(q9.th)*sg9*(lay.fluss.w/2+2.4+wr()*2.2);
        if(strFrei(ux9,uz9,1.6)) lay.trees.push({x:ux9, z:uz9, h:2.4+wr()*2.2}); } } } }
  if(lay.trees.length){ const n=lay.trees.length, mtx=new THREE.Matrix4(), _p=new THREE.Vector3(), _q=new THREE.Quaternion(), _s=new THREE.Vector3();
    const stI=M.stamm.clone(); stI.vertexColors=false;                                        // Instanz-Box trägt keine Vertexfarben — geerbtes vertexColors hätte SCHWARZ multipliziert
    const st2=new THREE.InstancedMesh(new THREE.BoxGeometry(0.3,1,0.3), stI, n);              // Einheits-Stamm: Höhe je Instanz über die Skalenmatrix
    const lb=new THREE.InstancedMesh(new THREE.BoxGeometry(1.9,1.7,1.9), M.laub, n);
    lay.trees.forEach((tr,i)=>{ st2.setMatrixAt(i, mtx.compose(_p.set(tr.x,tr.h/2,tr.z), _q, _s.set(1,tr.h,1)));
      lb.setMatrixAt(i, mtx.makeTranslation(tr.x,tr.h+0.6,tr.z));
      solids.push({min:[tr.x-0.18,0,tr.z-0.18],max:[tr.x+0.18,tr.h,tr.z+0.18]}); });
    st2.castShadow=true; lb.castShadow=true; st2.name='inst_baeume';
    [st2,lb].forEach(im=>{ im.instanceMatrix.needsUpdate=true; dorfGroup.add(im); }); }
  scene.add(dorfGroup);
  const R2=Math.max(W2.x1-W2.x0,W2.z1-W2.z0)/2;
  sun.shadow.camera.left=-R2-6; sun.shadow.camera.right=R2+6; sun.shadow.camera.top=R2+6; sun.shadow.camera.bottom=-R2-6; sun.shadow.camera.far=R2*2.8+120; sun.shadow.camera.updateProjectionMatrix();   // FAR-GESETZ: Schatten enden nicht mehr bei 140m — die ferne Stadt lag schattenlos
  scene.fog.near=R2*1.6+30; scene.fog.far=R2*3.2+140;
  const mk=lay.pl[0], mc=false&&dorfB[0].H&&dorfB[0].H.chimney;
  if(mc){ const mcx=(mc.min[0]+mc.max[0])/2, mcz=(mc.min[2]+mc.max[2])/2, c2=Math.cos(mk.phi), s3=Math.sin(mk.phi);
    fire.position.set(mk.x+mcx*c2+mcz*s3, dorfB[0].H.dims.baseY+0.6, mk.z-mcx*s3+mcz*c2); } else fire.position.set(0,-60,0);
  dorfRauch.quellen=[]; dorfRauch.teilchen.forEach(T2=>{scene.remove(T2.m);}); dorfRauch.teilchen.length=0;   // Quellen entstehen mit der Promotion
  { const gi=plan.houses.findIndex(h2=>h2.rolle==='gasthaus');                                 // AUSLEGER am Gasthaus
    if(gi>=0&&dorfB[gi]&&dorfB[gi].lod==='voll'){ const q=lay.pl[gi], e=ext[gi], c2=Math.cos(q.phi), s3=Math.sin(q.phi);
      const fx=q.x+((e.x0+e.x1)/2*0.4)*c2+(e.z0-0.35)*s3, fz=q.z-((e.x0+e.x1)/2*0.4)*s3+(e.z0-0.35)*c2;
      const ba=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,1.1),mLay('holz')); ba.position.set(fx,3.3,fz); ba.rotation.y=q.phi; dorfGroup.add(ba);
      const br=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.55,0.06),M.ziegel2); br.position.set(fx-0.45*s3*0+fx*0+fx- (0.0), 2.85, fz); br.position.set(fx,2.85,fz); br.rotation.y=q.phi; dorfGroup.add(br); } }
  const chd=document.getElementById('chronik')||(()=>{ const d2=document.createElement('div'); d2.id='chronik';
    d2.style.cssText='position:fixed;left:12px;bottom:10px;padding:7px 12px;background:rgba(12,15,20,.82);border:1px solid #2a3442;border-radius:8px;color:#dce6f5;font:12px ui-sans-serif;z-index:30;pointer-events:none';
    document.body.appendChild(d2); return d2; })();
  chd.textContent=plan.name+' · gegr. '+plan.jahr+' · '+plan.groesse+' · '+plan.houses.length+' Gebäude'+(lay.fluss?' · am Fluss ('+lay.bruecken.length+' Brücken)':'')+(lay.mauer?' · ummauert':'')+(lay.laternen.length?' · '+lay.laternen.length+' Laternen':'');
  chd.style.display='block';
  dorf={plan, lay, spawn:{x:lay.spawn.x, z:lay.spawn.z}, prims, R:R2, ymax, maxDyn};          // BUDGET-ADER-FIX: maxDyn wurde seit Ära 8 berechnet, aber NIE angeschlossen — lodTick las immer den Fallback 5, der Budget-Regler war tot
  D={W:R2*2, D:R2*2, ridgeY:Math.max(8,ymax), baseY:0}; P=dorfB[0].lod==='voll'?dorfB[0].H.P:P;
  console.log('DORF:',plan.region,plan.groesse,plan.kernel,'ab',plan.jahr,'+'+plan.spanne+'J ·',nVoll,'voll +',nProxy,'im Strom (Hülle/Destillat) ·',prims,'Prims · Graph V='+lay.graph.nV,'E='+lay.graph.nE,'Zyklen='+lay.graph.zyklen,(lay.mauer?'· MAUER R'+lay.mauer.R.toFixed(0)+' Tore:'+lay.mauer.gates.length:''),(lay.fluss?'· FLUSS+'+lay.bruecken.length+'Brücken':''),'· R='+R2.toFixed(0)+'m');
}
function frameDorf(){ orb.r=Math.min(90,(dorf?dorf.R:30)*2.0+12); orb.ty=6; applyOrbit(); }
// ════════════ META-GESETZ ════════════ wohnt im Kern (U6c, __fachwerkCore.metaParams) — eine Quelle für Browser + Sweep
// Aus Zeit · Klima · Personen · Wohlstand emergiert die ganze Form — nach der Ordnung der Stil-Epochen.
const metaParams=FC.metaParams;

function applyMeta(){
  const jahr=+$('pJahr').value, klima=+$('pKlima').value/100, leute=+$('pLeute').value, wohl=+$('pWohl').value/100;
  const m=metaParams(jahr,klima,leute,wohl);
  $('pP').value=m.pitch; $('pW').value=m.W; $('pD').value=m.D; $('pS').value=m.storeys; $('pStil').value=m.stil; $('pB').value=(m.stil==='alt')?'andreas':'none';
  if($('pBogenTyp'))$('pBogenTyp').value=m.bogen; if($('pDachTyp'))$('pDachTyp').value='sattel'; if($('pG'))$('pG').value=m.grund;
  const ck=(id,v)=>{ if($(id)) $(id).checked=!!v; };
  ck('pTreppgiebel',m.F.treppgiebel); ck('pKuppel',m.F.kuppel); ck('pPortikus',m.F.portikus); ck('pArkade',m.F.arkade); ck('pTurm',m.F.turm); ck('pZinnen',m.F.zinnen); ck('pVeranda',m.F.veranda); ck('pVorkragung',m.F.vorkragung); ck('pPilotis',m.F.pilotis); ck('pTerrasse',m.F.terrasse);
  tintM(Object.assign({},DEFCOL,m.col));
  if($('vJahr'))$('vJahr').textContent=jahr; if($('vKlima'))$('vKlima').textContent=(klima<0.3?'Nord':klima>0.72?'Süd':'gemäßigt'); if($('vLeute'))$('vLeute').textContent=leute; if($('vWohl'))$('vWohl').textContent=(wohl<0.33?'arm':wohl>0.66?'reich':'mittel');
  if(typeof labels==='function')labels();
}
// mat lebt im Kern (__fachwerkCore, oben aliast) — eine Quelle für Fabrik + Bake + Layout.

// ════════════════ Szene (statisch) ════════════════
const app=document.getElementById('app');
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputEncoding=THREE.sRGBEncoding; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12; renderer.localClippingEnabled=true; app.appendChild(renderer.domElement);
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x9fb2c4); scene.fog=new THREE.Fog(0x9fb2c4,55,150);
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,0.05,800);
const sun=new THREE.DirectionalLight(0xfff1dc,2.1); sun.position.set(24,34,16); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.near=1; sun.shadow.camera.far=140; sun.shadow.bias=-0.00045; sun.shadow.normalBias=0.02;
sun.shadow.camera.left=-26;sun.shadow.camera.right=26;sun.shadow.camera.top=26;sun.shadow.camera.bottom=-26; sun.shadow.bias=-0.0004;
scene.add(sun); const hemi=new THREE.HemisphereLight(0xbcd2f0,0x4d4636,0.62); const amb=new THREE.AmbientLight(0xffffff,0.22); scene.add(hemi); scene.add(amb);
// ════ Tageszeiten ════
const ZEIT={ mittag:{p:[24,34,16],c:0xfff1dc,i:2.1,h:0.62,a:0.22,bg:0x9fb2c4},
  morgen:{p:[34,14,20],c:0xffd9a8,i:1.7,h:0.55,a:0.26,bg:0xc8baa0},
  abend:{p:[-32,12,-14],c:0xff9a55,i:1.45,h:0.48,a:0.22,bg:0xb0876a},
  nacht:{p:[-16,22,-10],c:0x9fb6e0,i:0.32,h:0.16,a:0.12,bg:0x161d2c} };
function setZeit(t){ const z=ZEIT[t]||ZEIT.mittag; sun.position.set(z.p[0],z.p[1],z.p[2]); sun.color.set(z.c); sun.intensity=z.i; hemi.intensity=z.h; amb.intensity=z.a; scene.background.set(z.bg); scene.fog.color.set(z.bg); fire.intensity=(t==='nacht'?3.0:t==='abend'?2.2:1.6);
  const glut=(t==='nacht')?0.85:(t==='abend')?0.42:0;                                        // NACHTLICHT-GESETZ: die Stadt zündet ihre Fenster — GETEILTE Glas-Materialien tragen das Glühen stadtweit, NULL Rebake
  for(const gm of [M.glas, M.glasfern, (typeof _MM!=='undefined')&&_MM.glas, (typeof _MM!=='undefined')&&_MM.glasfern]){ if(!gm) continue;
    gm.emissive=gm.emissive||new THREE.Color(0); gm.emissive.set(glut?0xffb45e:0x000000); gm.emissiveIntensity=glut; } }
const ground=new THREE.Mesh(new THREE.CircleGeometry(130,48),new THREE.MeshStandardMaterial({color:0x4a5238,roughness:1}));
ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const fire=new THREE.PointLight(0xff7a35,1.6,9,2); scene.add(fire);

// ════════════════ Subsystem-UI (einmal angelegt) ════════════════
const ORDER=['fundament','geruest','riegel','streben','zimmermann','gefache','giebel','dachwerk','dachdeckung','boeden','innenwaende','herd','treppe','tueren','fenster','moebel','anbau','balkon','kuppel','portikus','hof','dachAlt','arkade','turm','zinnen','veranda','vorkragung','pilotis','terrasse','rundbau'];
const LABEL={fundament:'Fundament · Sockel · Schwelle',geruest:'Gerüst (Ständer · Rähm · Balken)',riegel:'Riegel (Felderteilung)',streben:'Streben (Figuren)',zimmermann:'Holzverbindungen (Zapfen · Nägel)',gefache:'Ausfachung (Backstein)',giebel:'Giebel',dachwerk:'Dachwerk (Sparren · Pfetten)',dachdeckung:'Eindeckung (Lattung · Ziegel)',boeden:'Böden (Dielung)',innenwaende:'Innenwände (Räume)',herd:'Herd · Kamin',treppe:'Treppe',tueren:'Haustür',fenster:'Fenster (öffenbar)',moebel:'Möbel',anbau:'Anbau · Garage',balkon:'Balkon (Laube)'};
const EXPL={fundament:-1.2,geruest:0,riegel:0.15,streben:0.3,zimmermann:0.3,gefache:0.55,giebel:1.6,dachwerk:3.0,dachdeckung:4.4,boeden:0.9,innenwaende:0.5,herd:0.25,treppe:0.35,tueren:0.15,fenster:0.35,moebel:0.7,anbau:0.0,balkon:0.6,kuppel:4.4,portikus:0.2,hof:0.1,dachAlt:4.4,arkade:0.3,turm:0.0,zinnen:5.0,veranda:0.4,vorkragung:0.7,pilotis:-1.5,terrasse:5.5,rundbau:0.0};
const subsDiv=document.getElementById('subs'); const checks={};
ORDER.forEach(k=>{const r=document.createElement('div');r.className='row';
  const cb=document.createElement('input');cb.type='checkbox';cb.checked=true;cb.id='cb_'+k;
  const lb=document.createElement('label');lb.htmlFor=cb.id;lb.textContent=LABEL[k]||k;
  cb.onchange=()=>{if(haus&&haus.subsystems[k])haus.subsystems[k].visible=cb.checked;}; checks[k]=cb;
  r.appendChild(cb);r.appendChild(lb);subsDiv.appendChild(r);});
document.getElementById('alle').onclick=()=>{if(!haus)return;ORDER.forEach(k=>{checks[k].checked=true;haus.subsystems[k].visible=true;});};
document.getElementById('roh').onclick=()=>{if(!haus)return;const roh=['fundament','geruest','riegel','streben','dachwerk'];
  ORDER.forEach(k=>{const on=roh.includes(k);checks[k].checked=on;haus.subsystems[k].visible=on;});};

// ════════════════ HAUS — mutierbar, live regenerierbar ════════════════
let haus, houseGroup, D, P;       // werden in buildHouse() gesetzt/getauscht
let lodSpawn=null;                 // Begeh-Spawn der LOD-Sonde (haus ist dort null)
let solids=[], doorList=[];        // Kollision + Türen (von Closures referenziert)
let explode=0;

function buildHouse(params){
  if(dorfGroup){ dorfGroup.traverse(o=>{if(o.geometry)o.geometry.dispose();}); scene.remove(dorfGroup); dorfGroup=null; dorf=null; dorfCellars=[];
    if(promoPend){ promoPend.st.g.traverse(o=>{ if(o.geometry)o.geometry.dispose(); }); promoPend=null; }
    sun.shadow.camera.left=-26;sun.shadow.camera.right=26;sun.shadow.camera.top=26;sun.shadow.camera.bottom=-26;sun.shadow.camera.updateProjectionMatrix(); scene.fog.near=55; scene.fog.far=150; tintM(DEFCOL); if($('pK'))applyKultur($('pK').value,SEED); }
  if(houseGroup){ houseGroup.traverse(o=>{if(o.geometry)o.geometry.dispose();}); scene.remove(houseGroup); }
  if(typeof ground!=='undefined') ground.visible=true; const _ch=document.getElementById('chronik'); if(_ch)_ch.style.display='none'; dorfRauch.teilchen.forEach(T2=>{scene.remove(T2.m);}); dorfRauch.teilchen.length=0; dorfRauch.quellen.length=0;
  const lodSt=(document.getElementById('pLOD'))?(+document.getElementById('pLOD').value|0):0;   // LOD-SONDE: >0 = Dorf-Bake-Pfad statt Editor-Haus
  if(lodSt>0){ buildHausLOD(params, lodSt); return; }
  { const inf=document.getElementById('lodInfo'); if(inf)inf.style.display='none'; }
  haus=HAUS(THREE,mat,params); houseGroup=haus.build(); scene.add(houseGroup);
  houseGroup.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  D=haus.dims; P=haus.P;
  solids=haus.solids;                                  // neue Kollisions-Liste
  doorList.length=0;                                   // Türen neu sammeln (Array-Identität halten)
  ['innenwaende','tueren','anbau','fluegel','balkon','fenster','moebel'].forEach(k=>haus.subsystems[k] && haus.subsystems[k].traverse(o=>{
    if(o.userData&&(o.userData.door||o.userData.window)){ doorList.push({leaf:o, openA:o.userData.openA, axis:o.userData.axis||'y', block:o.userData.block||null, open:(o.userData.open!==undefined)?o.userData.open:true, blockObj:null}); }}));
  if(haus.chimney){const c=haus.chimney; fire.position.set((c.min[0]+c.max[0])/2, D.baseY+0.6, (c.min[2]+c.max[2])/2);}
  // Checkbox-Zustände + Explosion auf neues Haus anwenden
  ORDER.forEach(k=>{ if(haus.subsystems[k]){ haus.subsystems[k].visible=checks[k].checked; haus.subsystems[k].position.y=explode*(EXPL[k]||0); } });
}

// ════════════════ LOD-SONDE (Einzelhaus) ════════════════
// SONDEN-GESETZ: exakt die Dorf-Pfade (promoteB / rebakeChunk Stufe 1·2·3), 1 Haus am Ursprung, KEIN Cross-Fade.
// Was die Sonde zeigt, zeigt das Dorf — Fehler hier ≡ Fehler dort. Subsysteme/Explosion/Schnitt greifen nicht (gebakt).
const LODNAME=['Editor · voll (live)','Ring A · Promotion (gebakt)','Chunk Stufe 1 · nah','Chunk Stufe 2 · Destillat','Chunk Stufe 3 · Vogel'];
function buildHausLOD(params, stufe){
  haus=null; solids=[]; doorList.length=0;
  const mass=stapelBau(Object.assign({},params,{nur:MASSNUR}), LOD1F);                       // MASS-BUILD liefert ext/dims — identisch zu buildDorf
  const bx=new THREE.Box3().setFromObject(mass.g);
  const B={p:params, q:{phi:0,x:0,z:0,obb:{cx:0,cz:0}}, lod:'chunk', dyn:false,
           ext:{x0:bx.min.x,x1:bx.max.x,z0:bx.min.z,z1:bx.max.z,y1:bx.max.y}, dims:mass.H.dims, fp:fpVon(mass.H),
           spawnL:{x:mass.H.spawn.x, z:mass.H.spawn.z}, hofGap:2.5, meshes:[]};              // Sonde zeigt den LÄNDLICHEN Hof (gap 2.5) — Stadt-gap 0.06 wäre korrekt hofleer
  D=mass.H.dims; P=mass.H.P; lodSpawn=mass.H.spawn;
  mass.g.traverse(o=>{ if(o.geometry)o.geometry.dispose(); });
  const geoms={}, turm=(params.storeys||1)>=6; let pfad='', liveG=null;
  if(stufe>=3&&!turm){ fragFuer(B,1); B.frag=null; B.fragStufe=undefined; }                   // WARM-PFAD: wandTon wie im Dorf beim Abstieg aus Stufe 1 gemessen (Fragment verworfen, Ton bleibt)
  if(stufe===1){                                                                             // ≡ promoteB (ohne Solids/Türen-Registrierung)
    const hp2=Object.assign({},params,{nur: turm? {moebel:false,innenwaende:false} : (params.arm? {moebel:false} : {})});
    const st=((params.storeys||1)>11)? stapelBau(hp2,{gelaende:false})
      : (()=>{ const H=HAUS(THREE,mat,hp2); return {g:H.build({gelaende:false}), H}; })();
    bakeLOD(st.g, params.col, geoms, 0);
    liveG=st.g;                                                                              // was lebend blieb (Türen/Fenster) wird gerendert — wie promoteB seit dem liveWrap-Fix
    pfad='build{gelaende:false} → bakeLOD(0) + liveWrap · RING-A-WÜRDE: Innenwände immer'+(turm?' · Turm-Schacht (Glasetagen zeigen Böden)':'');
  } else if(stufe===2){                                                                      // ≡ rebakeChunk C.stufe===1 — EINE QUELLE: fragFuer selbst
    mischeGeoms(geoms, fragFuer(B,1)); mischeGeoms(geoms, hofFuer(B)); B.frag=null; B.fragStufe=undefined;
    pfad='HOF + fragFuer(1): stapelBau+LOD1F'+(turm?'+TURMNUR':'')+' → bakeLOD(0, alles) + INNENDUNKEL-Liner'+(turm?' + lod2Koerper + bandFassade':'');
  } else if(stufe===3){                                                                      // ≡ rebakeChunk C.stufe===2 — EINE QUELLE
    mischeGeoms(geoms, fragFuer(B,2)); mischeGeoms(geoms, hofFuer(B)); B.frag=null; B.fragStufe=undefined;
    pfad= turm ? 'fragFuer(2): Turm fern — nur lod2Koerper (wandTon-Körper)'
               : 'fragFuer(2): DESTNUR → bakeLOD(KULLVOL, alles) + lod2Koerper(wandTon) + bandFassade';
  } else {                                                                                   // ≡ rebakeChunk C.stufe===3 (VOGEL) — EINE QUELLE
    mischeGeoms(geoms, fragFuer(B,3)); B.frag=null; B.fragStufe=undefined;
    pfad='fragFuer(3): NUR lod2Koerper — GRUNDRISS-TREU: '+(B.fp?B.fp.length:1)+' Körper · wandTon warm · glas ⇒ glasfern';
  }
  houseGroup=new THREE.Group(); let tris=0, dc=0;
  for(const role in geoms){ const G=geoms[role]; if(!G.vo) continue;
    const bg=new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.Float32BufferAttribute(G.pos,3));
    bg.setAttribute('normal',   new THREE.Float32BufferAttribute(G.nrm,3));
    bg.setAttribute('color',    new THREE.Float32BufferAttribute(G.col,3));
    bg.setIndex(G.idx);
    const mm=new THREE.Mesh(bg,_mmFor(role)); mm.castShadow=true; mm.receiveShadow=true;    // KEIN Blend: die Sonde zeigt den Endzustand
    houseGroup.add(mm); tris+=G.idx.length/3; dc++; }
  if(liveG){ liveG.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); houseGroup.add(liveG); }
  scene.add(houseGroup);
  const inf=document.getElementById('lodInfo'); if(inf){ inf.style.display='block';
    inf.textContent=LODNAME[stufe]+(turm?' · TURM-Pfad (≥6 Geschosse)':'')+'\n'+dc+' Draw-Calls · '+(tris|0).toLocaleString('de-DE')+' Dreiecke\n'+pfad; }
}

// ════════════════ Form-Regler ════════════════
const $=id=>document.getElementById(id);
const hipName=h=>h<0.02?'Satteldach':(h>0.98?'Walmdach':'Krüppelwalm');
function readParams(){ const h=(+$('pH').value)/100;
  return { W:+$('pW').value, D:+$('pD').value, pitchDeg:+$('pP').value, hip:h,
           storeys:+$('pS').value, brace:$('pB').value, grundriss:$('pG').value, stil:$('pStil').value,
           doppel:$('pDoppel').checked?1:0, terrain:$('pTerrain').checked?1:0,
           annex:$('pAnnex').checked?1:0, annexN:(($('pAnnex')&&$('pAnnex').checked)?((($('pAnnex2')&&$('pAnnex2').checked))?2:1):0), balcony:$('pBalcony').checked?1:0, roofCurve:(+($('pCurve')?$('pCurve').value:0))/100, treppgiebel:($('pTreppgiebel')&&$('pTreppgiebel').checked)?1:0, kuppel:($('pKuppel')&&$('pKuppel').checked)?1:0, portikus:($('pPortikus')&&$('pPortikus').checked)?1:0, dachTyp:($('pDachTyp')?$('pDachTyp').value:'sattel'), bogenTyp:($('pBogenTyp')?$('pBogenTyp').value:'none'), arkade:($('pArkade')&&$('pArkade').checked)?1:0, turm:($('pTurm')&&$('pTurm').checked)?1:0, zinnen:($('pZinnen')&&$('pZinnen').checked)?1:0, veranda:($('pVeranda')&&$('pVeranda').checked)?1:0, vorkragung:($('pVorkragung')&&$('pVorkragung').checked)?1:0, pilotis:($('pPilotis')&&$('pPilotis').checked)?1:0, terrAsym:(($('pTerrAsym')?+$('pTerrAsym').value:0))/100, terrasse:($('pTerrasse')&&$('pTerrasse').checked)?1:0, bend:(+($('pBend')?$('pBend').value:0))/100, seed:SEED }; }
function labels(){ $('vW').textContent=(+$('pW').value).toFixed(1)+' m'; $('vD').textContent=(+$('pD').value).toFixed(1)+' m';
  $('vP').textContent=$('pP').value+'°'; $('vH').textContent=hipName((+$('pH').value)/100); if($('vCurve'))$('vCurve').textContent=($('pCurve')?$('pCurve').value:0)+'%'; if($('vBend'))$('vBend').textContent=($('pBend')?$('pBend').value:0)+'%'; if($('vS'))$('vS').textContent=$('pS').value; }
let SEED=3;
function regen(keepCam){ labels(); if($('pDorf')&&$('pDorf').checked){ buildDorf({epoche:$('pEpoche').value, nH:+$('pNH').value, seed:SEED, budget:+($('pBudget')?$('pBudget').value:170000)}); if(!keepCam) frameDorf(); else applyOrbit(); } else { buildHouse(readParams()); if(!keepCam) frameHouse(); else applyOrbit(); } }
['pW','pD','pP','pH','pS','pCurve','pBend'].forEach(id=>{ $(id).addEventListener('input',labels); $(id).addEventListener('change',()=>regen(true)); });
['pS','pB','pG','pStil','pDachTyp','pBogenTyp'].forEach(id=>$(id).addEventListener('change',()=>regen(true)));
['pJahr','pKlima','pLeute','pWohl'].forEach(id=>$(id)&&$(id).addEventListener('input',()=>{ applyMeta(); regen(true); }));   // META-GESETZ treibt alle Regler
$('pK').addEventListener('change',()=>{ applyKultur($('pK').value, SEED); $('vK').textContent=($('pK').value==='samen'?'Samen→'+kulturFromSeed(SEED):$('pK').value); regen(true); });
$('pZeit').addEventListener('change',()=>setZeit($('pZeit').value));
$('pSeed').onclick=()=>{ SEED=(Math.random()*1e6|0)+1; if($('pK').value!=='manuell'){ applyKultur($('pK').value, SEED); $('vK').textContent=($('pK').value==='samen'?'Samen→'+kulturFromSeed(SEED):$('pK').value); } regen(true); };
['pAnnex','pBalcony','pDoppel','pTerrain','pTreppgiebel','pKuppel','pPortikus','pArkade','pTurm','pZinnen','pVeranda','pVorkragung','pPilotis','pTerrasse'].forEach(id=>$(id).addEventListener('change',()=>regen(true)));
if($('pLOD')){ const lodLbl=()=>{ $('vLOD').textContent=LODNAME[+$('pLOD').value|0]; };     // LOD-SONDE: Kamera bleibt stehen → Stufen direkt vergleichbar
  $('pLOD').addEventListener('input',()=>{ lodLbl(); if(!($('pDorf')&&$('pDorf').checked)) regen(true); });
  lodLbl(); }
$('pTest').onclick=()=>{ const R=[];
  const ok=(nm,c)=>R.push((c?'✓ ':'✗ ')+nm);
  try{
    if($('pDorf')&&!$('pDorf').checked){ $('pDorf').checked=true; }
    SEED=4242; if($('pNH'))$('pNH').value=30; if($('pEpoche'))$('pEpoche').value='moderne'; regen(false);
    ok('Bau: Solids '+solids.length, solids.length>40);
    ok('Bau: Türen (initial 0, kommen mit Ring A) '+doorList.length, true);
    const nCh=Object.keys(dorfChunks).length; ok('Streaming: Chunks '+nCh, nCh>0);
    ok('Licht: Laternen '+dorf.lay.laternen.length, dorf.lay.laternen.length>0);
    { const li=dorfGroup.children.find(o=>o.name&&o.name.indexOf('inst_laternen')===0), bi5=dorfGroup.children.find(o=>o.name==='inst_baeume');   /*Zeitreise: gas/e-Gruppen — Praefix statt Exaktname*/
      const liSum=dorfGroup.children.filter(o=>o.name&&o.name.indexOf('inst_laternen')===0).reduce((s9,o)=>s9+o.count,0);   /*Zeitreise: SUMME beider Bauart-Gruppen*/
      ok('Instancing: Laternen als InstancedMesh ('+liSum+'× in Gruppen, statt '+(dorf.lay.laternen.length*3)+' Draws)', !!li&&liSum===dorf.lay.laternen.length);
      ok('Instancing: Bäume als InstancedMesh', !dorf.lay.trees.length||(!!bi5&&bi5.count===dorf.lay.trees.length)); }
    ok('Straße: Bordstein-Solids '+solids.filter(s=>s.gw).length, solids.filter(s=>s.gw).length>0);
    ok('Name: '+dorf.plan.name, !!dorf.plan.name&&dorf.plan.name.length>3);
    const bi=dorfB.findIndex(B=>B.lod==='chunk');
    if(bi>=0){ const s0=solids.length; promoteB(bi);
      ok('Promotion: Meshes '+dorfB[bi].meshes.length+' · Solids +'+(solids.length-s0), dorfB[bi].meshes.length>0&&solids.length>s0&&dorfB[bi].lod==='voll');
      ok('Promotion: Türen/Fenster in Szene (liveWrap)', !!dorfB[bi].liveWrap&&dorfB[bi].liveWrap.parent===dorfGroup);
      ok('Leben: Rauch folgt Kamin ('+dorfRauch.quellen.length+' Quellen · Kamin: '+(!!(dorfB[bi].H&&dorfB[bi].H.chimney))+')', (dorfRauch.quellen.length>0)===!!(dorfB[bi].H&&dorfB[bi].H.chimney));   // INVARIANTE: Rauch ⟺ Kamin — ein kaminloses Haus DARF nicht rauchen
      demoteB(bi);
      ok('Demotion: rückstandslos', dorfB[bi].meshes.length===0&&dorfB[bi].lod==='chunk'&&!dorfB[bi].liveWrap&&!solids.some(s=>s.bi===bi)); }
    const ti=dorfB.findIndex(B=>B.lod==='chunk'&&(B.p.storeys||1)>=6);
    if(ti>=0){ const d0=doorList.length; promoteB(ti);
      ok('Turm-Feinstufe: Meshes '+dorfB[ti].meshes.length+' · Türen +'+(doorList.length-d0), dorfB[ti].meshes.length>0&&dorfB[ti].lod==='voll'&&doorList.length>d0);
      demoteB(ti); }
    { const b2=dorfB.findIndex(B=>B.lod==='chunk');
      if(b2>=0){ const p=promoteBauen(b2);
        ok('Zeitschnitt: Phase 1 baut OHNE Zustandsänderung', !!p&&dorfB[b2].lod==='chunk'&&!dorfB[b2].dyn);
        promoteFertig(p);
        ok('Zeitschnitt: Phase 2 vollendet (voll + liveWrap)', dorfB[b2].lod==='voll'&&!!dorfB[b2].liveWrap);
        demoteB(b2);
        const p2=promoteBauen(b2); if(p2){ dorfB[b2].lod='voll';                              // Welt dreht sich unter dem Bau weg …
          promoteFertig(p2);                                                                  // … Phase 2 muss verwerfen, nicht doppeln
          ok('Zeitschnitt: Abbruch verwirft rückstandslos', !dorfB[b2].liveWrap);
          dorfB[b2].lod='chunk'; } } }
    ok('Grundriss-Fluss: fp an jedem Gebäude', dorfB.every(B=>Array.isArray(B.fp)&&B.fp.length>=1));
    { let hofN=0, hofErr=0; for(const B of dorfB){ try{ const g3=hofFuer(B); for(const r3 in g3){ if(g3[r3].vo){hofN++; break;} } }catch(e2){ hofErr++; } }
      ok('Hof-Gesetz: kompiliert für alle · belebte Parzellen '+hofN+'/'+dorfB.length+' (Stadt-gap 0.06 ⇒ korrekt karg)', hofErr===0); }
    { const ck3=Object.keys(dorfChunks).find(k=>dorfChunks[k].list.some(bi4=>dorfB[bi4].lod==='chunk'));
      if(ck3){ const C3=dorfChunks[ck3], b4=C3.list.find(bi4=>dorfB[bi4].lod==='chunk');
        const f1=fragFuer(dorfB[b4], C3.stufe), f2=fragFuer(dorfB[b4], C3.stufe);
        ok('Fragment-Cache: warmer Treffer (kein Neubau)', f1===f2&&dorfB[b4].fragStufe===C3.stufe);
        const t3=performance.now(); rebakeChunk(ck3, false); const dt3=performance.now()-t3;
        ok('Atomarer Rebake aus Cache: '+dt3.toFixed(1)+'ms', C3.meshes.length>0); } }
    { const cks=Object.keys(dorfChunks).filter(k=>dorfChunks[k].list.some(bi2=>dorfB[bi2].lod==='chunk'));
      if(cks.length){ const ck=cks[0], C=dorfChunks[ck], alt=C.stufe; C.stufe=1; rebakeChunk(ck);
        let ortOk=false; if(C.meshes.length){ const bb=new THREE.Box3().setFromObject(C.meshes[0]);
          const mx2=(bb.min.x+bb.max.x)/2, mz2=(bb.min.z+bb.max.z)/2;
          ortOk=Math.hypot(mx2-C.cx,mz2-C.cz)<70 && Math.hypot(mx2,mz2)>0.001===Math.hypot(C.cx,C.cz)>0.001; }
        ok('Orts-Sonde: Stufe-1-Rebake am Chunk-Zentrum', ortOk&&C.meshes.length>0);
        C.stufe=alt; rebakeChunk(ck); } }
    let lp=0; for(let tr2=0;tr2<10;tr2++){ const L2=[]; for(let i2=0;i2<40;i2++)L2.push({i:i2,dist:Math.random()*120,lod:Math.random()<0.6?'proxy':'voll',dyn:Math.random()<0.2,kern:Math.random()<0.2});
      const a2=lodPlan(L2,5,38,60); for(const i2 of a2.promote){ const b2=L2.find(x=>x.i===i2); if(b2.lod!=='proxy'||b2.kern||b2.dist>=38)lp++; } }
    ok('LOD-Ring-Invarianten', lp===0);
  }catch(e){ R.push('✗ AUSNAHME: '+e.message); }
  const fails=R.filter(r2=>r2[0]==='✗').length;
  console.log('%cSELBSTTEST','font-weight:bold', R);
  const chd=document.getElementById('chronik'); if(chd){ chd.textContent='SELBSTTEST '+(R.length-fails)+'/'+R.length+(fails?' — FEHLER (Konsole!)':' GRÜN — ')+' '+(fails?'':chd.textContent); }
  alert('SELBSTTEST '+(R.length-fails)+'/'+R.length+(fails?' — Details in der Konsole':' GRÜN')+'\n\n'+R.join('\n')); };
$('pRand').onclick=()=>{ if($('pDorf')&&$('pDorf').checked){ SEED=(Math.random()*1e6|0)+1; $('pNH').value=Math.round(Math.exp(Math.log(5)+Math.random()*(Math.log(320)-Math.log(5)))); regen(false); return; } const G=['I','L','U','T','kreuz'];
  SEED=(Math.random()*1e6|0)+1;
  $('pK').value = KULTNAMES[Math.floor(Math.random()*KULTNAMES.length)]; $('vK').textContent=$('pK').value;
  applyKultur($('pK').value, SEED);                                                  // Kultur setzt Neigung·Proportion·Figur·Stil·Farben kohärent
  $('pG').value=G[Math.floor(Math.random()*G.length)];                               // Grundriss frei dazu
  $('pH').value=Math.round(Math.random()*100/2)*2;                                  // FIX Issue3: KEIN pS-Override mehr — applyKultur setzt die Geschosse je Kultur (Türme bleiben Türme)
  $('pAnnex').checked=Math.random()<0.4; $('pBalcony').checked=(Math.random()<0.45 && +$('pS').value>=2);
  regen(false); };
if($('pDorf')){ $('pDorf').addEventListener('change',()=>regen(false));
  $('pEpoche').addEventListener('change',()=>{ if($('pDorf').checked) regen(false); });
  $('pNH').addEventListener('input',()=>{ $('vNH').textContent=$('pNH').value; });
  $('pNH').addEventListener('change',()=>{ if($('pDorf').checked) regen(true); }); }
  $('pBudget').addEventListener('input',()=>{ $('vBud').textContent=Math.round($('pBudget').value/1000)+'k'; });
  $('pBudget').addEventListener('change',()=>{ if($('pDorf').checked) regen(true); });

// Explosion / Schnitt
const expS=$('exp'),expV=$('expv');
expS.oninput=()=>{explode=expS.value/100;expV.textContent=expS.value+' %';
  if(haus)ORDER.forEach(k=>{if(haus.subsystems[k])haus.subsystems[k].position.y=explode*(EXPL[k]||0);});};
const clip=new THREE.Plane(new THREE.Vector3(-1,0,0),0.0);
$('cut').onchange=e=>{renderer.clippingPlanes=e.target.checked?[clip]:[];};

// ════════════════ Kamera: Orbit & Begehung ════════════════
let mode='orbit';
const orb={az:0.85,el:0.30,r:30,tx:0,ty:5,tz:0};
function frameHouse(){ orb.r=Math.max(D.W,D.D)*1.7+7; orb.ty=D.ridgeY*0.42; applyOrbit(); }
function applyOrbit(){const ce=Math.cos(orb.el);
  camera.position.set(orb.tx+Math.sin(orb.az)*ce*orb.r, orb.ty+Math.sin(orb.el)*orb.r, orb.tz+Math.cos(orb.az)*ce*orb.r);
  camera.up.set(0,1,0); camera.lookAt(orb.tx,orb.ty,orb.tz);}

let drag=false,px=0,py=0; const cv=renderer.domElement;
cv.addEventListener('pointerdown',e=>{if(mode!=='orbit')return;drag=true;px=e.clientX;py=e.clientY;});
addEventListener('pointerup',()=>drag=false);
addEventListener('pointermove',e=>{if(mode!=='orbit'||!drag)return;orb.az-=(e.clientX-px)*0.008;orb.el+=(e.clientY-py)*0.008;orb.el=Math.max(-0.2,Math.min(1.45,orb.el));px=e.clientX;py=e.clientY;applyOrbit();});
cv.addEventListener('wheel',e=>{if(mode!=='orbit')return;e.preventDefault();orb.r*=(1+Math.sign(e.deltaY)*0.08);orb.r=Math.max(6,Math.min(90,orb.r));applyOrbit();},{passive:false});

// ── Begehung (Ego) ──
const player={pos:new THREE.Vector3(0,0,0),vy:0,onGround:false,groundY:0};
let yaw=Math.PI, pitch=0; const keys={};
const R=0.3, PH=1.7, EYE=1.62, STEP=0.46, G=20;
const raycaster=new THREE.Raycaster();
function toggleDoor(d){ d.open=!d.open;
  if(!d.open && d.block){ d.blockObj={min:[d.block[0],d.block[1],d.block[2]],max:[d.block[3],d.block[4],d.block[5]], th:d.th, tx:d.tx, tz:d.tz}; solids.push(d.blockObj); }
  else if(d.blockObj){ const i=solids.indexOf(d.blockObj); if(i>=0)solids.splice(i,1); d.blockObj=null; } }
function targetedDoor(){ if(mode!=='walk')return null;
  raycaster.set(camera.position, new THREE.Vector3(-Math.sin(yaw)*Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw)*Math.cos(pitch)));
  let best=null,bd=2.6;
  for(const d of doorList){ const h=raycaster.intersectObject(d.leaf,true); if(h.length&&h[0].distance<bd){bd=h[0].distance;best=d;} }
  return best; }
const dhint=document.createElement('div');
dhint.style.cssText='position:fixed;left:50%;top:56%;transform:translateX(-50%);color:#fff;font:13px system-ui;background:rgba(0,0,0,.5);padding:4px 9px;border-radius:5px;display:none;pointer-events:none;z-index:30';
document.body.appendChild(dhint);
function overlap(p,s){ let px=p.x, pz=p.z;   // KREIS-KOLLISIONS-GESETZ: Spieler in den lokalen Rahmen gedrehter Solids transformieren — exakt, da Kreis rotationsinvariant
  if(s.th!=null){ const c=Math.cos(s.th), si=Math.sin(s.th), dx=px-s.tx, dz=pz-s.tz; px=dx*c-dz*si; pz=dx*si+dz*c; }
  return px-R<s.max[0]&&px+R>s.min[0] && p.y<s.max[1]&&p.y+PH>s.min[1] && pz-R<s.max[2]&&pz+R>s.min[2];}
function moveAxis(ax,d){if(!d)return;const i=ax==='x'?0:2;const p=player.pos;const oldA=p[ax],oldY=p.y;p[ax]+=d;
  let climb=p.y;
  for(const s of solids){if(overlap(p,s)){const top=s.max[1];
    if(top-p.y<=STEP){ if(top>climb)climb=top; }              // besteigbar (Stufe/Schwelle/Boden): höchste merken
    else { p[ax]=oldA; p.y=oldY; return; }}}                  // echte Wand: GANZE Achsbewegung zurück → nie penetrieren, nie quer rauswerfen
  p.y=climb;}                                                  // erst wenn keine Wand blockierte: Stufe besteigen
function gravity(dt){const p=player.pos;player.vy-=G*dt;p.y+=player.vy*dt;player.onGround=false;
  let gf=0; const kcl=dorf?dorfCellars:((haus&&haus.cellar)?[haus.cellar]:[]);   // Dorf: JEDES Kellerhaus fällt auf seine Tiefe
  for(const kc of kcl){ let px=p.x, pz=p.z; if(kc.th!=null){ const c=Math.cos(kc.th), si=Math.sin(kc.th), dx=px-kc.tx, dz=pz-kc.tz; px=dx*c-dz*si; pz=dx*si+dz*c; }
    if(px>kc.x0&&px<kc.x1&&pz>kc.z0&&pz<kc.z1){ gf=kc.floorY; break; } }
  if(p.y<gf){p.y=gf;player.vy=0;player.onGround=true;}
  for(const s of solids){if(overlap(p,s)){
    if(player.vy<=0 && p.y>=s.max[1]-STEP-0.35){p.y=s.max[1];player.vy=0;player.onGround=true;}
    else if(player.vy>0 && p.y+PH>s.min[1]){p.y=Math.max(s.min[1]-PH,player.groundY);player.vy=0;}}}   // Kopfstoß NIE unter den Stand-Boden → kein Rauswerfen
  if(player.onGround)player.groundY=p.y;}
function enterWalk(){mode='walk';$('ui').style.display='none';
  $('hud').style.display='block';$('esc').style.display='block';
  if(haus)ORDER.forEach(k=>{if(haus.subsystems[k]){haus.subsystems[k].visible=true;haus.subsystems[k].position.y=0;}checks[k].checked=true;});
  renderer.clippingPlanes=[];$('cut').checked=false;expS.value=0;expV.textContent='0 %';explode=0;
  const sp=dorf?dorf.spawn:(haus?haus.spawn:(lodSpawn||{x:0,z:-8}));                        // LOD-SONDE: begehbar ohne Kollision (durchlaufen = inspizieren)
  player.pos.set(sp.x,0,sp.z);player.vy=0;player.groundY=0;yaw=Math.PI;pitch=0;
  cv.requestPointerLock();}
function exitWalk(){mode='orbit';$('ui').style.display='';
  $('hud').style.display='none';$('esc').style.display='none';dhint.style.display='none';
  if(document.pointerLockElement)document.exitPointerLock();applyOrbit();}
$('begehen').onclick=enterWalk;
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Escape'&&mode==='walk')exitWalk();
  if(e.code==='KeyE'&&mode==='walk'){const d=targetedDoor();if(d)toggleDoor(d);}
  if(['KeyW','KeyA','KeyS','KeyD','Space'].includes(e.code)&&mode==='walk')e.preventDefault();});
addEventListener('keyup',e=>{keys[e.code]=false;});
document.addEventListener('mousemove',e=>{if(mode!=='walk'||document.pointerLockElement!==cv)return;
  yaw-=e.movementX*0.0024;pitch-=e.movementY*0.0024;pitch=Math.max(-1.45,Math.min(1.45,pitch));});
cv.addEventListener('click',()=>{if(mode==='walk'&&document.pointerLockElement!==cv)cv.requestPointerLock();});

function walkUpdate(dt){
  const sp=(keys['ShiftLeft']?5.0:2.8)*dt;
  const f=(keys['KeyW']?1:0)-(keys['KeyS']?1:0);
  const s=(keys['KeyD']?1:0)-(keys['KeyA']?1:0);
  if(f||s){const sy=Math.sin(yaw),cy=Math.cos(yaw);
    let dx=(-sy*f + cy*s), dz=(-cy*f - sy*s); const l=Math.hypot(dx,dz)||1;
    moveAxis('x',dx/l*sp); moveAxis('z',dz/l*sp);}
  if(keys['Space']&&player.onGround){player.vy=6.0;player.onGround=false;}
  gravity(dt);
  const cp=Math.cos(pitch);
  camera.position.set(player.pos.x,player.pos.y+EYE,player.pos.z);
  camera.lookAt(player.pos.x - Math.sin(yaw)*cp, player.pos.y+EYE+Math.sin(pitch), player.pos.z - Math.cos(yaw)*cp);
  for(const d of doorList){ const ax=d.axis||'y'; if(d.base==null)d.base=d.leaf.rotation[ax]-(d.preOpen?(d.openA||0):0); const tgt=d.base+(d.open?d.openA:0); d.leaf.rotation[ax] += (tgt-d.leaf.rotation[ax])*Math.min(1,dt*10); }   // TÜR-BASIS-GESETZ: Ziel = Bau-Basis (inkl. bend) + openA — kein Schwingen in die Zarge
  const td=targetedDoor();
  if(td){ dhint.textContent='E — Tür '+(td.open?'schliessen':'öffnen'); dhint.style.display='block'; } else dhint.style.display='none';
}

// ════════════════ Loop ════════════════
let last=performance.now();
function frame(now){const dt=Math.min(0.05,(now-last)/1000);last=now;
  if(mode==='walk')walkUpdate(dt);
  fire.intensity=1.4+Math.sin(now*0.008)*0.25+Math.random()*0.1;
  { const nw=performance.now();
  for(let k=dorfBlend.length-1;k>=0;k--){ const B3=dorfBlend[k], f=Math.min(1,(nw-B3.t0)/240);
    B3.m.material.opacity=f; if(f>=1){ B3.m.material.dispose(); B3.m.material=B3.shared; dorfBlend.splice(k,1); } }
  for(let k=dorfSterben.length-1;k>=0;k--){ const S3=dorfSterben[k];
    if(nw>=S3.t){ S3.meshes.forEach(m=>{ m.geometry.dispose(); dorfGroup.remove(m); }); dorfSterben.splice(k,1); } } }
if(dorf&&dorfB){ lodTick(performance.now());
  if(dorfRauch.quellen.length){ if(dorfRauch.teilchen.length<26&&Math.random()<0.3){
      const qq=dorfRauch.quellen[(Math.random()*dorfRauch.quellen.length)|0];
      const pm=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.34,0.34), new THREE.MeshLambertMaterial({color:0xb9bec6, transparent:true, opacity:0.55}));
      pm.position.set(qq.x,qq.y,qq.z); scene.add(pm); dorfRauch.teilchen.push({m:pm, vy:0.014+Math.random()*0.012, dx:(Math.random()-0.5)*0.006, a:0.55}); }
    for(let k=dorfRauch.teilchen.length-1;k>=0;k--){ const T2=dorfRauch.teilchen[k];
      T2.m.position.y+=T2.vy; T2.m.position.x+=T2.dx; T2.a-=0.0035; T2.m.material.opacity=T2.a; T2.m.scale.multiplyScalar(1.006);
      if(T2.a<=0.03){ scene.remove(T2.m); T2.m.geometry.dispose(); T2.m.material.dispose(); dorfRauch.teilchen.splice(k,1); } } } }
renderer.render(scene,camera);requestAnimationFrame(frame);}

// ── Start ──
labels(); setZeit($('pZeit').value); applyKultur($('pK').value, SEED); buildHouse(readParams()); frameHouse(); requestAnimationFrame(frame);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});

/* ==================== W12-PORTAL-BRÜCKE (AnazhRealm-Heimat) ==================== */
/* Dasselbe Muster wie worlds/schmiede: enter/ready-Handshake, die DSL spricht die
   ECHTEN UI-Pfade — die 32 Kulturen leben im <select id="pK"> (Wert setzen +
   change-Event = exakt der Nutzer-Pfad, applyKultur + regen laufen), "dorf"/"haus"
   schalten die Dorf-Checkbox (#pDorf, change-Event). Kultur-Namen sind schon
   ASCII (KULTNAMES). Esc meldet die Heimkehr — im Begeh-Modus gehört Esc dem
   Pointer-Lock-Release (exitWalk, eigener Handler oben), die Brücke schweigt dort. */
(function () {
    if (typeof window === "undefined" || !window.parent || window.parent === window) return;
    function post(m) {
        try {
            window.parent.postMessage(m, "*");
        } catch (_e) {}
    }
    var DSL = FC.KULTNAMES.concat(["dorf", "haus"]);
    function setSelect(id, value) {
        var el = document.getElementById(id);
        if (!el) return false;
        var ok = false;
        for (var i = 0; i < el.options.length; i++) if (el.options[i].value === value) ok = true;
        if (!ok) return false;
        el.value = value;
        el.dispatchEvent(new Event("change"));
        return true;
    }
    function setCheck(id, on) {
        var el = document.getElementById(id);
        if (!el) return false;
        if (!!el.checked !== !!on) {
            el.checked = !!on;
            el.dispatchEvent(new Event("change"));
        }
        return true;
    }
    window.addEventListener("message", function (ev) {
        if (ev.source !== window.parent) return;
        var msg = ev.data;
        if (!msg || typeof msg !== "object") return;
        if (msg.type === "enter") {
            post({ type: "ready", world: "fachwerk", label: "Fachwerkhaus — parametrisch, begehbar", dsl: DSL });
        } else if (msg.type === "dsl" && Array.isArray(msg.program)) {
            for (var i = 0; i < msg.program.length; i++) {
                var op = msg.program[i];
                var word = String((op && op[0]) || op || "").toLowerCase().trim();
                if (word === "dorf") setCheck("pDorf", true);
                else if (word === "haus") setCheck("pDorf", false);
                else setSelect("pK", word);
            }
        }
    });
    window.addEventListener("keydown", function (ev) {
        if (ev.key !== "Escape") return;
        if (typeof mode !== "undefined" && mode === "walk") return; /* Esc = Pointer-Lock im Begeh-Modus */
        post({ type: "exit", world: "fachwerk" });
    });
    post({ type: "ready", world: "fachwerk", label: "Fachwerkhaus — parametrisch, begehbar", dsl: DSL });
})();
