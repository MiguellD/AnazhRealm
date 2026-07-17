// AnazhRealm — fachwerk-core.js: DER HAUS-STUDIO-KERN (Katalysator-Bogen W-A5a, ε-Checkliste).
// Die generative Substanz des Fachwerk-Labors (worlds/fachwerk/index.html — Fachwerkhaus,
// parametrisch, begehbar): die parametrische HAUS-Fabrik (Tragwerk-ehrlich: Fundament ·
// Gerüst · Riegel · Streben · Gefache · Giebel · Dachwerk · Eindeckung · Böden · Innenwände ·
// Herd · Treppe · Türen · Fenster · Möbel · Anbau/Flügel/Balkon · Kuppel/Portikus/Hof/Arkade/
// Turm/Zinnen/Veranda/Vorkragung/Pilotis/Terrasse/Rundbau) · die KULTUR-Archetypen (32
// klickbare Haus-Typen, `kulturParams` = die reine Ableitung) · das Bake-Vokabular der
// Dorf-Pipeline (bakeHaus/bakeLOD · stapelBau · fragFuer · lod2Koerper · bandFassade ·
// mischeGeoms · hofFuer · wandTonAus). Byte-treu aus dem Schöpfer-Werk extrahiert
// (Zeilen-Slices, Paritäts-Hash-bewiesen) — die Shell UND AnazhRealm lesen DIESE eine
// Quelle (G2.1), ein Nachbau ist verboten.
//
// FORM (Vertrag v1.1 §7 N7.2): namespaced IIFE __fachwerkCore — jeder WEITERE Kern einer
// Laufzeit trägt keine Top-Level-Globals (const-Kollision mit foundry-core im selben
// Worker). Die Manifest-Blöcke (B1 PRESETS · B2 buildInstance+kindStages · B4 PARAMS ·
// STUDIO_VERTRAG) leben unter dem Namensraum, namens- und formgleich zu §3; der Validator
// (gate:studio-vertrag) mappt per Manifest-ns — die porta-/schmiede-core-Form.
//
// DETERMINISMUS (G2.3): der Haus-Bau ist SEED-GETRIEBEN (anders als Fahrzeug/Tor/Klinge):
// HAUS zieht aus dem P.seed-LCG (Fenstertakt · OG-Material · Giebel-Verband · Gauben-Lage),
// fragFuer Stufe 1 würfelt den FENSTER-SCHLAF aus demselben Samen. buildInstance(id, 7, …)
// != buildInstance(id, 12345, …) — jede Instanz eine ANDERE gewachsene Variante; die
// WAHRHEIT ist eingefroren in spec/asset-contract/v6 (cv:6, seed-getrieben). Die REZEPT-
// Dials selbst (PRESETS.s) sind am LAB-STARTZUSTAND eingefroren (kulturParams(name, 3) —
// `let SEED=3` ist der Boot-Samen des Labs); das seed-Argument variiert die INSTANZ.
//
// DIE STUFEN-WAHRHEIT (B2, die erste Mehr-Stufen-Domäne außerhalb der Bäume): das Lab trägt
// FÜNF Detail-Ebenen (LOD-Sonde: Editor·voll [live] · Ring A·Promotion [gebakt] · Chunk
// Stufe 1·nah · Chunk Stufe 2·Destillat · Chunk Stufe 3·Vogel). Der Host kennt drei
// Distanz-Stufen (LOD_DISTANCES 20/40 m) — kindStages.haus = [0,1,2] deklariert die drei,
// die das Lab dafür EHRLICH baut:
//   0 ≙ „Ring A · Promotion":    der promoteBauen-Pfad (Vollbau inkl. Innenleben,
//       RING-A-WÜRDE) → bakeLOD(0) — mit alles=true (LÜCKENLOS: der Host kennt keine
//       lebenden Tür-/Fensterflügel; die Tür-Interaktion ist ein benannter Folge-Anschluss).
//   1 ≙ „Chunk Stufe 1 · nah":   fragFuer(B,1) — die System-Hülle (LOD1F: kein Innenleben)
//       + FENSTER-SCHLAF + INNENDÄMMER-Liner, bakeLOD(0, alles).
//   2 ≙ „Chunk Stufe 2 · Destillat": Warm-Pfad fragFuer(B,1) für den wandTon (exakt die
//       LOD-Sonde), dann fragFuer(B,2) — DESTNUR + KULLVOL + lod2Koerper + bandFassade.
//   „Editor · voll (live)" bleibt Lab-UI (Regler-Editor); „Chunk Stufe 3 · Vogel" bleibt
//   die DORF-Fernstufe (Siedlungs-Streaming) — sie dockt mit N5.7 settlement an (W-A5b).
//
// SCHNITT-GRENZEN (bewusst, je dokumentiert):
//   (a) DER HOF (hofFuer) lebt im Kern (die LOD-Sonde + das Dorf lesen ihn), reist aber
//       NICHT in buildInstance: die Parzelle (Rinnen · Weg · Beete · Holzstapel) ist
//       SIEDLUNGS-Kontext — der Host platziert das HAUS; der Hof kommt mit dem
//       settlement-Kanal (W-A5b) als Parzellen-Gesetz.
//   (b) DAS DORF (DORF/dorfLayout/strassengraph/buildDorf/PROXYHAUS/lodPlan) bleibt in der
//       Lab-Shell — es ist die W-A5b-Quelle (Straßen · Parzellen · Epochen · Jahresringe),
//       KEIN W-A5a-Kanal.
//   (c) P.terrain = 0 im Vertrags-Bau (der DORF-Weg `p.terrain=0`): die WELT trägt den
//       Boden/Garten, nicht das Asset (das Lab-Editor-Default `Gelände & Garten: an`
//       bleibt Shell-UI).
//   (d) DIE KARTEN-GRUND-REGEL (geomsZuGruppe): die Rollen backstein/ziegel/ziegel2 tragen
//       ihren Ton im Lab über CANVAS-KARTEN (texZiegelwand/texDach) und backen darum
//       textur-weiß (_MAPPED, DOPPEL-TÖNUNGS-FIX). Durchs Portal reist keine Karte — ohne
//       Kultur-Farbe trägt der Vertrags-Mesh den GRUND-Farbton der Karte (DEFCOL: exakt
//       die Zahl, aus der texDach/texZiegelwand wachsen) als mat.color; mit Kultur-Farbe
//       bleibt weiß (die Vertex-Farben tragen sie schon).
//
// THREE ist zur Laufzeit global (Browser: CDN r128 VOR diesem Skript; Worker:
// worlds/terrain/lib/three-r128.min.js via importScripts; Node-Gate: global.THREE vor
// require). Der Manifest-Teil (Daten + Funktions-Definitionen) läuft THREE-frei
// (Validator-vm mit Stub) — kein THREE-Aufruf auf Top-Level (Materialien lazy, die
// Textur-Bäcker sind document-gegated [try/catch → null: Worker/Node bauen kartenlos,
// die Vertex-Farben tragen den Look]).
(function (root) {
    "use strict";

    var VERSION = "1.0.0";
    var STUDIO_VERTRAG = 1; // G4.3 — EINE Versions-Semantik (v1.1 ist Adressierungs-Norm, kein Block-Bruch)

    // ── B2-Daten: die Stufen-Wahrheit der Domäne (kindStages-Vertrag, Herleitung im Kopf) ──
    var PORTAL_RENDER_CONFIG = {
        lod: { kindStages: { haus: [0, 1, 2] } },
    };
    var HOST_STUFEN = PORTAL_RENDER_CONFIG.lod.kindStages.haus;

    // ═══════════════════════════════════════════════════════════════════════
    //  DIE HAUS-FABRIK — byte-treu worlds/fachwerk/index.html (Zeilen-Slice,
    //  sha256-bewiesen im Wellen-Bericht). HAUS(THREE, mat, PARAMS) →
    //  { P, subsystems, order, solids, build, spawn, floors, windows,
    //    annexDoors, cellar, wings, grundriss, dims, furniture, chimney, roofY }
    // ═══════════════════════════════════════════════════════════════════════
    // prettier-ignore
    function HAUS(THREE, mat, PARAMS){
  const D2R=Math.PI/180, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const P=Object.assign({
    W:9.0, D:7.0, storeys:2, pitchDeg:50, jetty:0.0,
    hip:0.0,                 // 0 = Satteldach · 0<..<1 = Krüppelwalm · 1 = Walmdach
    brace:'andreas',         // 'andreas' | 'k' | 'mann' | 'wild'
    annex:0,                 // Anbau (Schleppdach-Flügel mit Garagentor) an +x
    wing:1,                  // L-Flügel (Quergiebel) an +x über TEIL der Tiefe → nicht-rechteckiger Grundriss
    balcony:0,               // Balkon (Laube) an der Rückseite, OG
    seed:3,
    foundH:0.55, egH:2.55, ogH:2.35,
    post:0.16, sill:0.18, raehm:0.16, balkenB:0.15, balkenH:0.21,
    spar:0.10, sparH:0.15, pfetteB:0.14, pfetteH:0.18,
    bayMax:1.7, ovEave:0.42, ovRake:0.32, doorW:1.1, doorH:2.05
  }, PARAMS||{});
  P.storeys=clamp(Math.round(P.storeys),1,12); P.hip=clamp(P.hip,0,1);                                    // Deckel auf 12 angehoben → Hochhäuser möglich
  P.doppel = P.doppel?1:0; if(P.doppel){ P.wing=0; P.annex=0; }                                          // DOPPELHAUS: +x ist die geteilte Brandwand → kein Flügel/Anbau dort; 2. Einheit wird gespiegelt drangebaut
  P.annexN=(P.annexN!=null)?+P.annexN:(P.annex?1:0); if(P.doppel)P.annexN=0; P.annex=P.annexN?1:0;   // MEHRFACH-ANBAU: annexN=0/1/2 Zellen, rückwärtskompatibel
  if(P.treppgiebel) P.hip=0;                                            // GIEBEL-GESETZ: Krähenstufen erzwingen den VOLLEN Giebel — Hanse/Holland bauten nie Walm über Treppengiebeln
  // ════ STIL/EPOCHE — EIN Profil dreht Material-Hülle + Parameter (keine neue Geometrie). alt=Fachwerk · modern=Putz · huette=Blockholz · stein=Putz/Stein (FR/IT) · glas=Glasfassade (Hochhaus) ════
  P.stil = ['alt','modern','huette','stein','glas','klinker','stroh'].includes(P.stil) ? P.stil : 'alt';
  if((P.portikus||P.zinnen||P.kuppel||P.arkade) && (P.stil==='alt'||P.stil==='huette'||P.stil==='stroh')) P.stil='stein';   // FEATURE→MATERIAL (Parametererweiterung wie STILMODE): Tempel/Burg/Kuppel/Riad implizieren monumentale Fassade — kein Fachwerk am Monument
  const STILMODE={
    modern:{ RM:{holz:'putz',backstein:'putz',gefach:'putz',lehm:'putz',ziegel:'dachmod',ziegel2:'dachmod'}, brace:'none', flat:1, pMin:14 },   // glatt verputzt, flaches Dach
    huette:{ RM:{gefach:'blockholz',lehm:'blockholz',backstein:'blockholz',stein:'blockholz',ziegel:'stamm',ziegel2:'stamm'},      brace:null,   flat:0, pMin:30 },   // Blockhütte: Holzwände + Holzschindeln, Sichtbalken bleiben
    stein: { RM:{holz:'putz',gefach:'putz',lehm:'putz',backstein:'putz'},                                      brace:'none', flat:0, pMin:18 },   // glatt verputzt (FR/IT), Ziegeldach bleibt
    glas:  { RM:{gefach:'metall',lehm:'metall',backstein:'metall',holz:'metall',ziegel:'dachmod',ziegel2:'dachmod'}, brace:'none', flat:1, pMin:4  },   // Glas-Vorhangfassade + Stahl, (fast) flaches Dach (Hochhaus/Moderne)
    klinker:{ RM:{holz:'backstein',gefach:'backstein',lehm:'backstein',stein:'backstein'},                         brace:'none', flat:0, pMin:22 },   // Sichtmauerwerk: Vollziegelwand + Tonziegeldach (NL/Hanse/England) — KEINE Sichtbalken, massiver Klinker
    stroh:  { RM:{gefach:'blockholz',lehm:'blockholz',backstein:'blockholz',stein:'blockholz',ziegel:'stroh',ziegel2:'stroh'},          brace:null,   flat:0, pMin:38 },   // Reet/Stroh: Holzwände + dickes Strohdach (angelsächsisch/afrikanisch/neolith)
  };
  const sm=STILMODE[P.stil], modern = (P.stil==='modern'||P.stil==='glas');
  const TRIMR=(P.stil==='modern'||P.stil==='glas')?'metall':'lattung';   // TRIM-STIL-GESETZ: Dachabschlussprofile folgen der Stilistik (modern = Metall, sonst Holzton)
  if(sm){
    if(sm.brace!=null && !(PARAMS&&PARAMS.brace!=null)) P.brace=sm.brace;
    if(sm.flat && !(PARAMS&&PARAMS.hip!=null)) P.hip=0;
    const _m=mat, RM=sm.RM;
    mat = r => { const m=_m(RM[r]||r); return (m && typeof m==='object' && '__role' in m) ? {__role:r} : m; };  // Material tauschen, im Mess-Harness aber ORIGINAL-Rolle behalten (sonst sieht das Gate falsche Rollen)
  }
  const pitch=clamp(P.pitchDeg, sm?sm.pMin:28, 62)*D2R;
  let _s=(P.seed*2654435761>>>0)||1; const rnd=()=>((_s=(_s*1664525+1013904223)>>>0)/4294967296);

  const baseY=P.foundH+(P.pilotis?2.6:0);   // PILOTIS: das ganze Haus steigt → alles relativ zu baseY folgt automatisch (Synergie)
  P.keller = (P.keller===0)?0:1;                                                 // Keller default an (abschaltbar via {keller:0}); echtes Untergeschoss unter Grade
  const kellerH=2.40, kellerY=-kellerH;                                          // Kellerboden unter Grade; Decke = Fundamentunterseite (y=0) → lichte Höhe = kellerH
  const levels=[]; { let y=baseY; for(let k=0;k<P.storeys;k++){const h=k===0?P.egH:P.ogH; levels.push({y, h, top:y+h}); y+=h;} }
  const eaveY=levels[levels.length-1].top;
  const ridgeY=eaveY+(P.D/2)*Math.tan(pitch);
  const ROOFMODE = (P.grundriss==='rund')?'rund' : P.kuppel?'dome' : P.terrasse?'stepped' : (P.zinnen||P.arkade)?'flat' : (P.dachTyp&&P.dachTyp!=='sattel')?'alt' : 'sattel';   // EINE Dach-Quelle: welches Dach traegt der Bau — jeder Dach-Ersetzer fliesst hierdurch
  const mS = (ridgeY-eaveY)/(P.D/2);                                             // ░ EINE Dachneigung (Steigung) ░ Quelle für Hauptdach · beide Flügel · Notch · Fenster-Occlusion — ersetzt das alte 0.62-Duplikat
  const STACK_W = 0.84;                                                          // ░ EINE Kaminbreite ░ Stack-AABB UND fensterfreier Korridor leiten sich hieraus ab
  const W=P.W, Dp=P.D, doorW=P.doorW, doorH=P.doorH, doorX=0, ps=P.post/2;
  // ════ METAGESETZ · DACHUNTERKANTE: gibt die Höhe der HAUPTdach-Ziegelhaut an jedem (x,z). JEDE Vertikale (Treppengeländer, Ständer, …) duckt sich darunter — eine Quelle, kein Subsystem rät selbst. Außerhalb der Traufwände (|x|>W/2) → ∞ (Wing/Garage tragen eigene Dächer). ════
  const roofSkinY=(x,z)=>{ if(Math.abs(x)>W/2+0.01) return Infinity;
    const hz=Math.max(0.3,Dp/2), dY=ridgeY-eaveY, zP=ridgeY-dY*Math.min(1,Math.abs(z)/hz);          // Sattel-Ebene (Längsseiten)
    if(P.hip>0.001){ const eaveZ=Dp/2, rH=Math.max(0.25,W/2-P.hip*eaveZ), hipStartY=eaveY+(1-P.hip)*dY;   // GESETZ: jenseits der Firstlänge rH die ECHTE Walmfläche (Krüppelwalm setzt erst bei hipStartY an, Vollwalm bei eaveY)
      if(Math.abs(x)>rH){ const hipFace=hipStartY+(ridgeY-hipStartY)*(W/2-Math.abs(x))/Math.max(0.1,W/2-rH); return Math.min(zP,hipFace); } }
    return zP; };
  const roofUnderY=(x,z)=> { if(ROOFMODE==='dome')return eaveY+0.35; if(ROOFMODE==='flat')return eaveY+0.05; const s=roofSkinY(x,z); return s===Infinity?Infinity:s-0.05; };   // knapp unter die Ziegel
  // ════ METAGESETZ · EINDECKEN einer Dachfläche (EINE Schräge): Lattung + Ziegelreihen, parametrisch über First(rY)/Traufabwurf(eaveDropY)/Spanne(eZ)/First-z(zMid)/Ortgang(xRangeAt). EINE Quelle für Haupt- UND Wing-Sattel­dach — kein paralleler Deckungscode mehr. ════
  function eindeckenFlaeche(g,o){ const slope=(o.rY-o.eaveDropY)/o.eZ, th=Math.atan(slope), lift=(o.lift==null?0.08:o.lift), tw=0.26, tl=0.34, tt=0.03, cs=0.205; const ax=o.axis||'z';
    const _cv=(typeof P!=='undefined'&&P&&P.roofCurve>0)?P.roofCurve:0, _cA=0;   // SCHWUNG global im deform-Feld   // SCHWUNG IM GESETZ: jede Fläche (Haupt/Flügel/Gaube/Balkon) konkav, relativ zur EIGENEN Traufe — keine Liste, nichts vergessen
    const nC=Math.max(4,Math.round(o.eZ/(cs*Math.cos(th)))+1);
    for(let i=0;i<nC;i++){ const dd=o.eZ-i*cs*Math.cos(th); if(dd<-0.06)break; const y=o.rY-slope*dd+(_cA>0?_cA*Math.pow(Math.max(0,dd)/Math.max(0.1,o.eZ),2.2):0), alo=o.zMid+o.sign*dd;   // alo = Position auf der Schräg-Achse (z fürs Hauptdach, x fürs Querdach)
      const rg=o.xRangeAt(y), pa=rg[0], pb=rg[1], span=pb-pa; if(span<0.05)continue; const pc=(pa+pb)/2, ox=(i%2)*tw*0.5, n=Math.ceil(span/tw)+1;   // pa..pb = Quer-Achse
      if(i%2===0){ const _st=tw*0.5; let _rs=null;   // Lattung als SEGMENTE — spart die Kehle aus (o.skip galt nur fuer Ziegel → Staebe ragten frei ins entziegelte Notch)
        const _fl=(a,bq)=>{ if(bq-a<0.10)return; const _cc=(a+bq)/2, _ll=Math.max(0.1,bq-a-0.05); if(ax==='z')beam(g,_cc,y+lift-0.05,alo,_ll,0.03,0.045,'lattung'); else beam(g,alo,y+lift-0.05,_cc,0.045,0.03,_ll,'lattung'); };
        for(let _p=pa; _p<=pb+1e-6; _p+=_st){ const _sk=o.skip&&o.skip(ax==='z'?_p:alo, ax==='z'?alo:_p); if(!_sk){ if(_rs==null)_rs=_p; } else if(_rs!=null){ _fl(_rs,_p-_st); _rs=null; } }
        if(_rs!=null)_fl(_rs,pb); }   // Lattung
      for(let p=Math.floor((pa-ox-tw/2)/tw)*tw+ox+tw/2; p<pb+tw; p+=tw){ const inner=p-tw*0.46, outer=p+tw*0.46;   // VERBAND-GESETZ: Fugenraster WELTFEST + ox-Halbverband — ein Muster für Haupt UND Flügel (vorher pa-verankert → Fugen fluchteten am Flügel zu Streifen) if(inner>pb-0.02||outer<pa+0.02)continue;
        let ww=tw*0.92, pcc=p; if(o.trim){ const vb=0.05; if(outer>pb-vb){ ww=Math.max(0.05,(pb-vb)-inner); pcc=inner+ww/2; } else if(inner<pa+vb){ ww=Math.max(0.05,outer-(pa+vb)); pcc=outer-ww/2; } }   // 5cm Verge-Inset: Endkante unter dem Windbrett, kein Sägezahn
        if(o.skip && o.skip(ax==='z'?pcc:alo, ax==='z'?alo:pcc))continue;                                  // Kehltal-Notch
        if(ax==='z')beam(g,pcc,y+lift,alo,ww,tt,tl,'ziegel',[o.sign*th,0,0]); else beam(g,alo,y+lift,pcc,tl,tt,ww,'ziegel',[0,0,-o.sign*th]); } } }
  // ════ NORM · Wohnbau (SIA 500 / DIN 18065) — öffentliche Mindestwerte, GESETZT, nicht verhandelbar ════
  const NORM={flur:1.00, treppe:0.90, auftritt:0.26, steigung:0.19, steigungSpar:0.21, schritt:0.62, podest:0.90, kopf:2.00, kopfSpar:1.90, eingang:1.30};
  const hasAttic = (ridgeY - eaveY) > NORM.kopfSpar;          // GESETZ: nutzbarer Dachraum nur wenn First ≥1.9 m über Traufe — FRÜH gezogen, denn der Schacht hängt davon ab
  const DORMER = (hasAttic && !modern && P.hip<0.45 && Dp>5.5) ? (()=>{ const gx=clamp(((P.seed%5)-2)*0.5, -W/2+1.5, W/2-1.5), gW=clamp(W*0.16,1.15,1.6), zBack=-Dp*0.22, zFront=zBack-1.0; const yBack=roofSkinY(gx,zBack), baseY2=roofSkinY(gx,zFront)+0.02, frontTop=yBack-0.08; return (frontTop-baseY2>0.85)?{gx,gW,zBack,zFront,yBack,baseY2,frontTop}:null; })() : null;   // EINE Gauben-Quelle: Struktur (dachwerk) UND Dachhaut-Aussparung (dachdeckung) lesen sie
  const stW = NORM.treppe;                                    // Haupttreppe-Breite = Norm
  const mainW = ((levels.length>=2)||(levels.length===1&&hasAttic)) ? stW : 0;   // LINKE Spur: Haupt-/Estrichtreppe — nur wenn nach oben gegangen wird
  const loftW = ((levels.length>=2&&hasAttic)||P.keller) ? 0.90 : 0;             // FIX Issue5: RECHTE Spur trägt Speicher- ODER Kellertreppe — Keller koppelt nicht mehr parasitär an den Speicher
  const shaftHalf = (mainW+loftW)/2;                          // GESETZ: Schacht hält beide (ggf. nur eine) Spur nebeneinander, Breite daraus abgeleitet
  const fw  = Math.max(W*0.15, NORM.flur + shaftHalf + 0.06); // Flur-Halbbreite ABGELEITET: Lane = fw−Schacht/2 ≥ NORM.flur

  const grp=()=>new THREE.Group();
  let SHIFT=0;                                                                  // x-Versatz NUR für Collision (addSolid). Das Visuelle der 2. Einheit kommt über eine Gruppen-Transform → öffenbare Blätter bleiben am Scharnier
  const WOODSET={holz:1,blockholz:1,boden:1,moebel:1,lattung:1,stamm:1,nagel:1};   // reine Box-Rollen → Vertex-Tint sicher (Ziegel/Lehm nutzen poly(), bleiben aussen vor)
  function woodTint(x,y,z){ let h=(((x*131.7+y*57.2+z*97.3)*1000)|0); h=(h^(h>>>13))>>>0; h=(Math.imul(h,2246822519))>>>0; h=(h^(h>>>15))>>>0;   // deterministisches Patina-Feld je Brett — kein Zufall pro Frame
    const r1=(h&255)/255, r2=((h>>>8)&255)/255; const Lum=0.86+0.22*r1, warm=(r2-0.5)*0.12; return [Math.min(1.15,Lum+warm), Lum, Math.max(0.78,Lum-warm*0.6)]; }   // Helligkeit ±, Kern=wärmer / verwittert=kühler
  function tintWood(m,role,x,y,z){ const g=m.geometry; if(m.material&&m.material.vertexColors&&g&&g.attributes&&g.attributes.position){ const n=g.attributes.position.count, t=woodTint(x,y,z), c=new Float32Array(n*3); for(let i=0;i<n;i++){c[i*3]=t[0];c[i*3+1]=t[1];c[i*3+2]=t[2];} g.setAttribute('color',new THREE.Float32BufferAttribute(c,3)); } return m; }   // MATERIAL-basiert statt rollenbasiert: jedes vertexColors-Material kriegt Vertexfarben, auch wenn die Rolle via RM gemappt wurde (ziegel->stamm, backstein->blockholz) -> sonst schwarz. Vertexzahl aus Geometrie -> korrekt auch bei unterteilten/gebogenen Meshes.
  const NOSHADOW={ziegel:1,ziegel2:1,lattung:1,backstein:1,nagel:1};   // PERF: tausende Deko-Prims werfen redundante Schatten → aus (Unterhaut/Wand trägt den Schatten); Geometrie unverändert
  // ════ EIN VERFORMUNGS-FELD · jeder Punkt jedes Bauteils läuft hindurch (Schwung + Biegung) — kein Subsystem kann vergessen werden ════
  const DEF_bk=(P.bend>0)?P.bend*2.0/Math.max(8,W):0, DEF_R=DEF_bk>0?1/DEF_bk:0;
  const DEF_cv=(P.roofCurve>0)?P.roofCurve:0, DEF_cA=DEF_cv*1.35;
  function deform(x,y,z){ let X=x,Y=y,Z=z;
    if(DEF_cv>0 && Y>eaveY){ const f=Math.min(1,Math.abs(Z)/Math.max(0.1,Dp/2)); Y+=DEF_cA*Math.pow(f,2.2); }
    if(DEF_bk>0){ const th=X*DEF_bk, r=DEF_R+Z; X=r*Math.sin(th); Z=-DEF_R+r*Math.cos(th); }
    return [X,Y,Z]; }
  function rotE(vx,vy,vz,rx,ry,rz){ const a=Math.cos(rx),b=Math.sin(rx),c=Math.cos(ry),d=Math.sin(ry),e=Math.cos(rz),f=Math.sin(rz);
    return [ c*e*vx-c*f*vy+d*vz, (a*f+b*e*d)*vx+(a*e-b*f*d)*vy-b*c*vz, (b*f-a*e*d)*vx+(b*e+a*f*d)*vy+a*c*vz ]; }
  // ════ EINHEITLICHES PRIMITIV · jeder Eckpunkt durch deform — die Box biegt wie der Ziegel, kein Sonderfall ════
  const _BF=[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,7,3],[0,4,7],[1,2,6],[1,6,5],[0,1,5],[0,5,4],[3,7,6],[3,6,2]];
  function beam(g,cx,cy,cz,lx,ly,lz,role,rot){ const rx=(rot&&rot[0])||0, ry=(rot&&rot[1])||0, rz=(rot&&rot[2])||0;
    if((DEF_bk===0 && DEF_cv===0)||(g&&g.noDeform)){ const m=new THREE.Mesh(new THREE.BoxGeometry(lx,ly,lz),mat(role)); m.position.set(cx,cy,cz); if(rx||ry||rz)m.rotation.set(rx,ry,rz); m.castShadow=!NOSHADOW[role]; m.receiveShadow=true; g.add(m); return tintWood(m,role,cx,cy,cz); }
    const hx=lx/2,hy=ly/2,hz=lz/2, useX=lx>=lz, Ln=useX?lx:lz, N=Ln>0.9?Math.min(32,Math.ceil(Ln/0.4)):1, P=[];
    const wc=(x,y,z)=>{ const r=rotE(x,y,z,rx,ry,rz); return deform(cx+r[0],cy+r[1],cz+r[2]); };
    for(let i=0;i<N;i++){ let c; if(useX){ const a=-hx+i*lx/N, q=-hx+(i+1)*lx/N; c=[wc(a,-hy,-hz),wc(q,-hy,-hz),wc(q,hy,-hz),wc(a,hy,-hz),wc(a,-hy,hz),wc(q,-hy,hz),wc(q,hy,hz),wc(a,hy,hz)]; } else { const a=-hz+i*lz/N, q=-hz+(i+1)*lz/N; c=[wc(-hx,-hy,a),wc(hx,-hy,a),wc(hx,hy,a),wc(-hx,hy,a),wc(-hx,-hy,q),wc(hx,-hy,q),wc(hx,hy,q),wc(-hx,hy,q)]; }
      for(let k=0;k<12;k++){ const A=c[_BF[k][0]],B=c[_BF[k][1]],C=c[_BF[k][2]]; P.push(A[0],A[1],A[2],B[0],B[1],B[2],C[0],C[1],C[2]); } }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,mat(role)); m.castShadow=!NOSHADOW[role]; m.receiveShadow=true; g.add(m); return tintWood(m,role,cx,cy,cz); }
  const Vc=(x,y,z)=>new THREE.Vector3(x,y,z);
  function strut(g,x0,y0,z0,x1,y1,z1,th,role){ const dx=x1-x0,dy=y1-y0,dz=z1-z0, len=Math.hypot(dx,dy,dz); if(len<1e-4)return;
    if((DEF_bk===0 && DEF_cv===0)||(g&&g.noDeform)){ const a=Vc(x0,y0,z0),b=Vc(x1,y1,z1); const m=new THREE.Mesh(new THREE.BoxGeometry(th,len,th),mat(role)); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(Vc(0,1,0),b.clone().sub(a).normalize()); m.castShadow=!NOSHADOW[role]; m.receiveShadow=true; g.add(m); return tintWood(m,role,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2); }
    const N=Math.max(1,Math.min(32,Math.ceil(len/0.4))), h=th/2, P=[], ux=dx/len,uy=dy/len,uz=dz/len;
    let px=-uy,py=ux,pz=0, pl=Math.hypot(px,py,pz); if(pl<0.01){px=1;py=0;pz=0;pl=1;} px/=pl;py/=pl;pz/=pl;
    const qx=uy*pz-uz*py, qy=uz*px-ux*pz, qz=ux*py-uy*px;
    const cor=(t,sp,sq)=>{ const nx=x0+dx*t,ny=y0+dy*t,nz=z0+dz*t; return deform(nx+(px*sp+qx*sq)*h, ny+(py*sp+qy*sq)*h, nz+(pz*sp+qz*sq)*h); };
    for(let i=0;i<N;i++){ const t0=i/N,t1=(i+1)/N, c=[cor(t0,-1,-1),cor(t0,1,-1),cor(t0,1,1),cor(t0,-1,1),cor(t1,-1,-1),cor(t1,1,-1),cor(t1,1,1),cor(t1,-1,1)];
      for(let k=0;k<12;k++){ const A=c[_BF[k][0]],B=c[_BF[k][1]],C=c[_BF[k][2]]; P.push(A[0],A[1],A[2],B[0],B[1],B[2],C[0],C[1],C[2]); } }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,mat(role)); m.castShadow=!NOSHADOW[role]; m.receiveShadow=true; g.add(m); return tintWood(m,role,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2); }
  function tri(g,a,b,c,role){
    if((DEF_bk===0 && DEF_cv===0)||(g&&g.noDeform)){ const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute([a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]],3)); geo.computeVertexNormals(); const m=new THREE.Mesh(geo,mat(role)); m.castShadow=m.receiveShadow=true; g.add(m); return tintWood(m,role,(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3); }
    const e1=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]), e2=Math.hypot(c[0]-a[0],c[1]-a[1],c[2]-a[2]), e3=Math.hypot(c[0]-b[0],c[1]-b[1],c[2]-b[2]), em=Math.max(e1,e2,e3);
    const n=em>0.9?Math.min(16,Math.ceil(em/0.45)):1, P=[];   // FLÄCHE unterteilt → jeder Punkt durch deform, folgt dem Bogen wie der Frame
    const pt=(i,j)=>{ const u=i/n, v=j/n; return deform(a[0]+(b[0]-a[0])*u+(c[0]-a[0])*v, a[1]+(b[1]-a[1])*u+(c[1]-a[1])*v, a[2]+(b[2]-a[2])*u+(c[2]-a[2])*v); };
    for(let i=0;i<n;i++)for(let j=0;j<n-i;j++){ const A=pt(i,j),B=pt(i+1,j),C=pt(i,j+1); P.push(A[0],A[1],A[2],B[0],B[1],B[2],C[0],C[1],C[2]); if(i+j<n-1){ const D=pt(i+1,j+1); P.push(B[0],B[1],B[2],D[0],D[1],D[2],C[0],C[1],C[2]); } }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.computeVertexNormals(); const m=new THREE.Mesh(geo,mat(role)); m.castShadow=m.receiveShadow=true; g.add(m); return tintWood(m,role,(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3); }
  function poly(g,pts,role){for(let i=1;i<pts.length-1;i++)tri(g,pts[0],pts[i],pts[i+1],role);}

  const solids=[]; const furniture=[]; let chimney=null;
  // ════ WELTMODELL · geteilte Quelle: Öffnungen · Erschließung · Kraftfluss ════
  const circR=[];
  function addSolid(cx,cy,cz,lx,ly,lz,tag){solids.push({min:[cx+SHIFT-lx/2,cy-ly/2,cz-lz/2],max:[cx+SHIFT+lx/2,cy+ly/2,cz+lz/2],tag});}
  // ════ GESETZ (geteilt über ALLE Außentüren): jede Tür mit Schwelle auf einer Sockelhöhe bekommt EINE Eingangstreppe — Stufenzahl + Höhe FOLGEN dem Sockel, Richtung = Außennormale (nx,nz). EINE Quelle für Haus-/Hinter-/Flügeltür/Garage. Sockel auf Grund → 0 Stufen (Garage). ════
  function aussentreppe(g, cx, cz, nx, nz, wDoor, baseH){ const h=(baseH==null?baseY:baseH); if(h<0.10)return;
    const n=Math.max(1,Math.round((h+0.02)/0.19)), sh=h/n, tr=0.30, w=wDoor+0.7;
    for(let i=0;i<n;i++){ const topY=(i+1)*sh, depth=(n-i)*tr, dc=depth/2, ccx=cx+nx*dc, ccz=cz+nz*dc;
      const lx=(Math.abs(nx)>0.5)?depth:w, lz=(Math.abs(nx)>0.5)?w:depth;
      beam(g,ccx,topY/2,ccz,lx,topY,lz,'stein'); addSolid(ccx,topY/2,ccz,lx,topY,lz); } }
  const aabb=(cx,cy,cz,lx,ly,lz)=>({min:[cx-lx/2,cy-ly/2,cz-lz/2],max:[cx+lx/2,cy+ly/2,cz+lz/2]});
  const boxOverlap=(a,b)=>a.min[0]<b.max[0]&&a.max[0]>b.min[0]&&a.min[2]<b.max[2]&&a.max[2]>b.min[2];
  function addCircR(x0,z0,x1,z1,floor,tag){circR.push({x0:Math.min(x0,x1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),z1:Math.max(z0,z1),floor,tag});}
  // Balken entlang z an x=cx, mit ausgesparten z-Bereichen (Treppenschacht etc.)
  function clipSpanZ(g,cx,cy,lx,ly,zA,zB,role,cuts){ let segs=[[zA,zB]];
    (cuts||[]).forEach(([c0,c1])=>{ const out=[]; segs.forEach(([a,b])=>{ if(c1<=a||c0>=b)out.push([a,b]); else { if(a<c0-0.02)out.push([a,c0]); if(c1+0.02<b)out.push([c1,b]); } }); segs=out; });
    segs.forEach(([a,b])=>{ if(b-a>0.06) beam(g,cx,cy,(a+b)/2,lx,ly,b-a,role); }); }
  // ── Treppe & Schacht ABGELEITET aus NORM (Schrittmaßregel) — die Maße FOLGEN der Norm, werden nicht gewählt ──
  const stFloorH = levels[0].h;
  const availRun = Dp - 1.9;                                            // GESETZ: max Lauflänge, die MIT Antritts-/Austrittspodest in die Haustiefe passt
  let stN   = Math.max(3, Math.ceil(stFloorH / NORM.steigung));         // Stufenzahl aus Steigung ≤ Norm
  let stRise= stFloorH/stN;                                             // ≤ 0.19
  let stGo  = clamp(NORM.schritt - 2*stRise, NORM.auftritt, 0.32);      // Auftritt aus Schrittmaß 2·S+A
  let stRun = stN*stGo;
  if(stRun > availRun){                                                 // GESETZ: passt der bequeme Lauf nicht in die Tiefe → Raumspartreppe (steiler ≤0.21, kürzerer Lauf) statt Wand-Crash
    stN=Math.max(3,Math.ceil(stFloorH/NORM.steigungSpar)); stRise=stFloorH/stN; stGo=clamp(NORM.schritt-2*stRise,0.22,0.30); stRun=stN*stGo; }
  const shaftRange = Math.max(0, fw - shaftHalf - 0.85);                // GESETZ Massstab: Versatz nur soweit beide Gehwege ≥0.85m (begehbar) bleiben — der Schacht aus der Mitte darf — beide Gehwege bleiben begehbar
  const shaftCX = clamp(((((P.seed*2246822519+13)>>>0)%2000)/1000 - 1) * shaftRange, -shaftRange, shaftRange);   // GESETZ: Treppe NICHT stur mittig — plan-/seed-abhängiger Versatz im Flur (reale Häuser variieren), alles leitet aus wx0/wx1 ab → kohärent
  const wx0=shaftCX-shaftHalf, wx1=shaftCX+shaftHalf;                   // Schacht (beide Treppen nebeneinander), aus der Mitte versetzt
  const mxL=wx0, mxR=wx0+mainW;                                         // Haupttreppe-Zone (links) — Breite = mainW
  const lxL=wx1-loftW, lxR=wx1;                                         // Speichertreppe-Zone (rechts)
  const DiF = Dp/2-0.08;                                                // innere Haustiefe
  const hasLoft = levels.length>=2 && hasAttic;
  let lW=0,lN=0,lRise=0,lGo=0,lRun=0;
  if(hasLoft){ const lH=eaveY-levels[levels.length-1].y;
    lN  = Math.max(3, Math.ceil(lH / NORM.steigungSpar));               // Speichertreppe: Raumspar-Steigung ≤0.21 (DIN-Trick) — KEINE 0.42-Leiter
    lRise=lH/lN; lGo=clamp(NORM.schritt-2*lRise, 0.24, 0.30); lRun=lN*lGo;
    if(lRun>availRun){ lGo=clamp(availRun/lN, 0.20, lGo); lRun=lN*lGo; } // passt der Speicherlauf nicht in die Tiefe → Auftritt kürzen (steiler), bleibt im Haus
    lW=loftW; }
  const zBandTop = (Dp/2)*(1 - NORM.kopfSpar/Math.max(0.6,ridgeY-eaveY));         // wo das Dach 1.9 m über Estrich liegt
  // GESETZ Austritt-Podest: Haupttreppe mündet so weit hinten, dass HINTER ihr ein freier OG-Boden ≥ NORM.podest bleibt → man kommt in den ersten Stock. Loft (RECHTS daneben) kehrt -z zum First zurück.
  let stZ0  = hasLoft ? clamp(DiF-NORM.podest, -Dp/2+NORM.eingang+stRun, DiF-0.4) - stRun
                      : clamp(Math.min(zBandTop-0.45, 1.3) - stRun, -Dp/2+NORM.eingang, -0.6);
  stZ0 = clamp(stZ0, -DiF+0.35, DiF-0.35-stRun);                        // GESETZ: Antritt UND Austritt bleiben im Innenraum → kein Lauf endet in der Wand
  const wz1 = stZ0+stRun;
  const STAIR = { x0:wx0-0.05, x1:wx1+0.05, z0:stZ0-0.22, z1:wz1+0.30 };   // Schacht-Grundriss (Boden-/Deckenloch)
  const KELLERRAUM = P.keller ? {x0:-(W/2-0.08), x1:(W/2-0.08), z0:-(Dp/2-0.08), z1:(Dp/2-0.08), floorY:kellerY+0.12, holeX0:lxL-0.04, holeX1:lxR+0.04, holeZ0:stZ0-0.06, holeZ1:wz1+0.10} : null;   // EIN Kellerraum-Modell: Boden + Treppenloch — Inventar liest dieselbe Quelle wie das Haus
  const stairTopY = levels[0].top;
  for(let k=0;k<levels.length;k++) addCircR(wx0-0.1, stZ0-0.1, wx1+0.1, wz1+0.3, k, 'treppe');
  // ── MEHRGESCHOSSIGER WENDELKERN: ein Lauf je Geschoss-Sprung; Spur (links/rechts = bestehende Zonen) + Richtung wechseln → Podest-Kehre an jedem Geschoss. N=2 = exakt wie bisher. ──
  const TRACK={L:[mxL,mxR], R:[lxL,lxR]};
  const flights=[];
  for(let k=0;k<levels.length-1;k++){ const h=levels[k+1].y-levels[k].y;                  // Zwischenlauf levels[k]→levels[k+1]
    const tr=(k%2===0)?'L':'R', dir=(k%2===0)?1:-1, Ns=Math.max(3,Math.ceil(h/NORM.steigung)), go=stRun/Ns, rise=h/Ns;
    flights.push({base:levels[k].y, tr, x0:TRACK[tr][0], x1:TRACK[tr][1], zFoot:(dir>0)?stZ0:wz1, dir, N:Ns, rise, go, isLoft:false, atLevel:k+1, topEdge:(dir>0)?'back':'front', footEdge:(dir>0)?'front':'back'}); }
  if(levels.length===1 && hasAttic){                                                        // GESETZ: kein Zwischengeschoss, aber ein NUTZBARER Estrich → es MUSS eine Treppe dorthin geben; bei flachem Dach KEINE Treppe (sonst sticht sie raus)
    flights.push({base:levels[0].y, tr:'L', x0:TRACK.L[0], x1:TRACK.L[1], zFoot:stZ0, dir:1, N:stN, rise:stRise, go:stGo, isLoft:false, atLevel:'attic', topEdge:'back', footEdge:'front'}); }
  let LOFT=null;
  if(hasLoft){ const i=levels.length-1, tr=(i%2===0)?'L':'R', dir=(i%2===0)?1:-1;          // Speicherlauf top→Dachboden (Raumspar)
    const zFoot=(dir>0)?stZ0:wz1, zTop=zFoot+dir*lRun, z0=Math.min(zFoot,zTop), z1=Math.max(zFoot,zTop);
    LOFT={x0:TRACK[tr][0],x1:TRACK[tr][1],z0,z1,xc:(TRACK[tr][0]+TRACK[tr][1])/2,base:levels[i].y,top:eaveY,N:lN,rise:lRise,go:lGo,dir,zFoot};
    flights.push({base:levels[i].y, tr, x0:TRACK[tr][0], x1:TRACK[tr][1], zFoot, dir, N:lN, rise:lRise, go:lGo, isLoft:true, atLevel:'attic', topEdge:(dir>0)?'back':'front', footEdge:(dir>0)?'front':'back'});
    addCircR(LOFT.x0-0.1, LOFT.z0-0.1, LOFT.x1+0.1, LOFT.z1+0.3, i, 'speichertreppe'); }
  const levelOpen=levels.map(()=>({front:false,back:false}));                              // offene Geländerkante je Geschoss (wo ein Lauf an-/austritt)
  flights.forEach(f=>{ if(typeof f.atLevel==='number') levelOpen[f.atLevel][f.topEdge]=true;
    const lvF=levels.findIndex(L=>Math.abs(L.y-f.base)<0.01); if(lvF>=0) levelOpen[lvF][f.footEdge]=true; });
  // ════ KELLERTREPPE — GETEILTES Treppengesetz statt Parallelcode: als AUFSTEIGENDER Lauf kellerY→baseY (deckungsgleich mit absteigend), rechte Schachtspur. Wangen/Handlauf/Pfosten kommen aus flight(). ════
  if(P.keller){ const kDrop=baseY-kellerY, kN=Math.max(8,Math.ceil(kDrop/0.21)), kRun=wz1-stZ0, kGo=kRun/kN, kRise=kDrop/kN;
    flights.push({base:kellerY, tr:'R', x0:lxL, x1:lxR, zFoot:stZ0, dir:1, N:kN, rise:kRise, go:kGo, isLoft:false, atLevel:'keller', topEdge:'back', footEdge:'front'}); }


  function axis(half,special){ let pts=[-half,...special,half].filter(v=>Math.abs(v)<=half+1e-6);
    pts=[...new Set(pts.map(v=>+v.toFixed(3)))].sort((a,b)=>a-b); const out=[pts[0]];
    for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],n=Math.max(1,Math.ceil((b-a)/P.bayMax-1e-6));
      for(let k=1;k<=n;k++)out.push(+(a+(b-a)*k/n).toFixed(3));} return out; }
  const bx     = axis(W/2,[-fw,fw]);
  const bxFront = axis(W/2,[-fw,fw,-doorW/2-ps,doorW/2+ps]);
  const bz     = axis(Dp/2,[0]);

  function fundament(){const g=grp(); if(P.pilotis) return g; const kWi=W/2-0.08, kDi=Dp/2-0.08;
    const ks={x0:lxL-0.04,x1:lxR+0.04,z0:stZ0-0.06,z1:wz1+0.10};                              // Kellertreppen-Loch (rechte Schachtspur)
    if(P.keller){
      const FX=(W+0.5)/2, FZ=(Dp+0.5)/2, fy=baseY-P.foundH/2;                                  // Fundamentplatte MIT Loch über der Kellertreppe (4 Streifen)
      [[-FX,ks.x0,-FZ,FZ],[ks.x1,FX,-FZ,FZ],[ks.x0,ks.x1,-FZ,ks.z0],[ks.x0,ks.x1,ks.z1,FZ]].forEach(([x0,x1,z0,z1])=>{ if(x1-x0<0.03||z1-z0<0.03)return; const cx=(x0+x1)/2,cz=(z0+z1)/2; beam(g,cx,fy,cz,x1-x0,P.foundH,z1-z0,'stein'); addSolid(cx,fy,cz,x1-x0,P.foundH,z1-z0); });
      beam(g,0,kellerY+0.06,0,2*kWi,0.12,2*kDi,'stein'); addSolid(0,kellerY+0.06,0,2*kWi,0.12,2*kDi);   // Kellerboden
      const kh=0-kellerY, kwT=0.30;                                                            // Umfassungswände kellerY..Grade (Decke = Fundament)
      [-kWi,kWi].forEach(xw=>{ beam(g,xw,kellerY+kh/2,0,kwT,kh,2*kDi+kwT,'stein'); addSolid(xw,kellerY+kh/2,0,kwT,kh,2*kDi+kwT); });
      [-kDi,kDi].forEach(zw=>{ beam(g,0,kellerY+kh/2,zw,2*kWi,kh,kwT,'stein'); addSolid(0,kellerY+kh/2,zw,2*kWi,kh,kwT); });
      // Kellertreppe läuft jetzt über das GETEILTE flight()-Gesetz (flights.push oben) — kein Parallelcode, keine invertierten Stufen mehr
    } else {
      beam(g,0,baseY-P.foundH/2,0, W+0.5,P.foundH,Dp+0.5,'stein'); addSolid(0,baseY-P.foundH/2,0,W+0.5,P.foundH,Dp+0.5);
    }
    wings.forEach(w=>{ const m=0.25, fx0=w.x0-m, fx1=w.x1+m, fz0=w.z0-m, fz1=w.z1+m, cx=(fx0+fx1)/2, cz=(fz0+fz1)/2;   // GESETZ (selbe foundH/Material wie das Haus): jeder Flügel WÄCHST aus dem Sockel — kein aufgesetzter Klotz, kein Schweben über der Grasnarbe. Der Sockel verdeckt zugleich die Wiese unter dem Flügel.
      beam(g,cx,baseY-P.foundH/2,cz, fx1-fx0,P.foundH,fz1-fz0,'stein'); addSolid(cx,baseY-P.foundH/2,cz, fx1-fx0,P.foundH,fz1-fz0);
      const sy=baseY+P.sill/2, oEdge=w.outIsX?(Math.abs(w.x1)>Math.abs(w.x0)?w.x1:w.x0):(Math.abs(w.z1)>Math.abs(w.z0)?w.z1:w.z0);   // Schwelle: Stirn an der Aussenkante + zwei Längsseiten (vierte stösst ans Haus)
      if(w.outIsX){ beam(g,oEdge,sy,cz,P.sill,P.sill,fz1-fz0,'holz'); [w.z0,w.z1].forEach(zw=>beam(g,cx,sy,zw,fx1-fx0,P.sill,P.sill,'holz')); }
      else        { beam(g,cx,sy,oEdge,fx1-fx0,P.sill,P.sill,'holz'); [w.x0,w.x1].forEach(xw=>beam(g,xw,sy,cz,P.sill,P.sill,fz1-fz0,'holz')); } });
    [[0,Dp/2],[0,-Dp/2]].forEach(([x,z])=>beam(g,x,baseY+P.sill/2,z,W,P.sill,P.sill,'holz'));
    [[W/2,0],[-W/2,0]].forEach(([x,z])=>beam(g,x,baseY+P.sill/2,z,P.sill,P.sill,Dp,'holz')); return g; }

  function postsRing(g,y0,h){ const zf=Dp/2-0.02, xf=W/2-0.02;
    bx.forEach(x=>{[zf,-zf].forEach(z=>{ if(Math.abs(z-(-Dp/2))<0.4 && Math.abs(x-doorX)<doorW/2+0.2) return; beam(g,x,y0+h/2,z,P.post,h,P.post,'holz'); }); });
    bz.forEach(z=>{ if(Math.abs(z)<Dp/2-0.1) [xf,-xf].forEach(x=>beam(g,x,y0+h/2,z,P.post,h,P.post,'holz')); });
    [doorX-doorW/2-ps,doorX+doorW/2+ps].forEach(x=>beam(g,x,y0+h/2,-zf,P.post,h,P.post,'holz')); }
  function plateRing(g,y){ const zf=Dp/2-0.02, xf=W/2-0.02;
    [[0,zf,W,P.raehm,P.raehm],[0,-zf,W,P.raehm,P.raehm]].forEach(([x,z,lx,ly,lz])=>beam(g,x,y,z,lx,ly,lz,'holz'));
    [[xf,0,P.raehm,P.raehm,Dp-0.04],[-xf,0,P.raehm,P.raehm,Dp-0.04]].forEach(([x,z,lx,ly,lz])=>beam(g,x,y,z,lx,ly,lz,'holz')); }
  function geruest(){const g=grp(); if(ROUND)return g;
    // Bodenlöcher, über denen KEIN Deckenbalken laufen darf: Haupttreppe (bei storeys=1 = Estrich) + ggf. Speichertreppe
    const voids=[];                                                                              // GESETZ: ÜBER JEDER Treppen-Durchdringung wird die Deckenbalkenlage ausgespart — sonst läuft ein horizontaler Träger durch die Treppe. Im Hochhaus an JEDER Zwischendecke, nicht nur über dem EG.
    if(!(levels.length===1 && !hasAttic)){
      for(let k=0;k<levels.length-1;k++) voids.push({y:levels[k].top, x0:STAIR.x0, x1:STAIR.x1, z0:STAIR.z0, z1:STAIR.z1});   // jede Zwischendecke (EG .. vorletztes OG) über dem Schacht
      if(levels.length===1 && hasAttic) voids.push({y:eaveY, x0:STAIR.x0, x1:STAIR.x1, z0:STAIR.z0, z1:STAIR.z1});             // Estrichloch bei 1 Geschoss + nutzbarem Dachraum
    }
    if(LOFT) voids.push({y:eaveY, x0:LOFT.x0-0.05, x1:LOFT.x1+0.05, z0:LOFT.z0-0.05, z1:LOFT.z1+0.05});
    const layJoists=(y)=>{ const vs=voids.filter(v=>Math.abs(v.y-y)<0.05);
      bx.forEach(x=>{ const v=vs.find(v=>x>v.x0 && x<v.x1);
        if(v) clipSpanZ(g,x,y-P.balkenH/2,P.balkenB,P.balkenH,-Dp/2+0.02,Dp/2-0.02,'holz',[[v.z0,v.z1]]);   // über dem Loch ausgespart
        else  beam(g,x,y-P.balkenH/2,0,P.balkenB,P.balkenH,Dp-0.04,'holz'); }); };
    levels.forEach((L,k)=>{ postsRing(g,L.y,L.h); plateRing(g,L.top-P.raehm/2);
      if(k<levels.length-1) plateRing(g,L.top+P.raehm/2);
      layJoists(L.top); });                                                  // levels[last].top == eaveY → Dachbalkenlage inklusive, keine Doppellage
    return g; }

  const winEG = modern?{off:1.18,ch:1.55}:{off:0.95,ch:0.95}, winOG = modern?{off:1.02,ch:1.45}:{off:0.80,ch:0.92};   // modern: grosse Fensterbänder
  function wallSpec(){const S=[];
    const isAxis=c=>Math.abs(Math.abs(c)-fw)<0.28||Math.abs(c)<0.28;        // ±fw und Mitte: Ständer/Treppe → dort kein Fenster
    const takt=modern?1:((rnd()<0.5)?1:2);                                             // Fenstertakt pro GEBÄUDE: jedes / jedes zweite geeignete Feld
    const ogPlaster=rnd()<0.6;                                             // OG-Material pro Gebäude (konsistent)
    const patternFor=(ax,wantDoor)=>{ const n=ax.length-1, flds=[];        // symmetrisches Rollen-Muster nach Feldindex (gilt für ALLE Geschosse → Fenster fluchten)
      for(let i=0;i<n;i++){const lo=ax[i]+ps,hi=ax[i+1]-ps; flds.push({i,lo,hi,c:(lo+hi)/2,wdt:hi-lo});}
      const role=new Array(n).fill('pier'); if(n>=2){role[0]='corner';role[n-1]='corner';}
      for(let i=1;i<=Math.floor((n-1)/2);i++){ if(role[i]==='corner')continue; const f=flds[i],fm=flds[n-1-i];
        if(((i-1)%takt===0) && f.wdt>0.98 && fm.wdt>0.98 && !isAxis(f.c) && !isAxis(fm.c)){ role[i]='window'; role[n-1-i]='window'; } }   // symmetrisch gesetzt
      if(wantDoor){ let dc=-1,best=1e9; flds.forEach(f=>{ if(f.wdt>doorW-0.05 && Math.abs(f.c)<best){best=Math.abs(f.c);dc=f.i;} }); if(dc>=0)role[dc]='door'; }
      return {flds,role}; };
    [ {h:true,f:-(Dp/2)+0.02,ax:bxFront,door:true}, {h:true,f:(Dp/2)-0.02,ax:bx,door:false},
      {h:false,f:-(W/2)+0.02,ax:bz,door:false},     {h:false,f:(W/2)-0.02,ax:bz,door:false} ].forEach(F=>{
      const {flds,role}=patternFor(F.ax,F.door); const ne=flds.length-1;
      levels.forEach((L,k)=>{ const ground=k===0, yLo=L.y+(ground?P.sill:P.raehm), yHi=L.top-P.raehm, wp=ground?winEG:winOG;
        const brick=ground?true:!ogPlaster, sillY=yLo+wp.off-wp.ch/2, lintelY=yLo+wp.off+wp.ch/2;
        flds.forEach(f=>{ if(f.wdt<0.12)return; let t=role[f.i]; if(t==='door'&&!ground)t='pier';
          const corner = (t==='corner') ? (f.i===0?'lo':'hi') : null;       // an welcher Seite der Eckständer steht
          let win=null; if(t==='window'){ const wd=Math.min(modern?1.7:1.05,f.wdt-0.34); win={cy:yLo+wp.off,ch:wp.ch,wd}; }
          S.push({horiz:F.h,fixed:F.f,lo:f.lo,hi:f.hi,c:f.c,yLo,yHi,type:t,corner,brick,win,sillY,lintelY}); }); }); });
    return S; }
  const WALLS=wallSpec();
  if(P.brandwand){ WALLS.forEach(w=>{                                                        // BRANDWAND-GESETZ: anliegende Seiten sind fensterlose Brandmauern — dasselbe Feld→Wand-Prinzip wie die Fenster-Okklusion
    const seite = w.horiz ? (w.fixed>0?'z1':'z0') : (w.fixed>0?'x1':'x0');
    if(P.brandwand[seite]){ w.type='wand'; w.win=null; w.brand=1; } }); }
  let backDoor=null;                                              // Hintertür (zweiter Zugang, EG-Rückwand +z)
  // ── L-FLÜGEL (Quergiebel an +x über TEIL der Tiefe) → nicht-rechteckiger Grundriss. Eigenes niedriges Dach, Hauptdach unberührt. ──
  // ════ GRUNDRISS — Flügel wachsen als EIN Gesetz auf beliebigen Seiten. (along u, hinaus v)→Welt über die Seiten-Achse. I/L/U/T/Kreuz EMERGIERT aus der Seitenmenge — kein +x-Hardcode, kein gespiegelter Klon. ════
  const SIDES={ E:{o:[1,0],a:[0,1]}, W:{o:[-1,0],a:[0,1]}, N:{o:[0,1],a:[1,0]}, S:{o:[0,-1],a:[1,0]} };
  const GRUND={ I:[], L:['N'], U:['N','W'], T:['N','E'], kreuz:['N','E','W'], hof:[], rund:[] };
  P.grundriss = (P.grundriss && GRUND[P.grundriss]) ? P.grundriss : ((P.wing && !P.annex && !P.doppel) ? 'L' : 'I');
  const ROUND = P.grundriss==='rund';   // RUNDBAU: Zylinder-Gesetz ersetzt die rechteckige Hülle
  const mkWing = side => { const S=SIDES[side]; const [ox,oz]=S.o; const [ax,az]=S.a; const outIsX=ox!==0;
    const houseAlong = outIsX ? Dp : W, depth = clamp((outIsX?W:Dp)*0.42, 2.8, 4.2);
    const room=3.3, maxR=Math.max(1,Math.min(2,Math.floor((houseAlong-1.0)/room)));
    const nR=clamp(Math.round(houseAlong/room*0.6),1,maxR), breadth=clamp(nR*room,3.4,houseAlong-0.8);   // GESETZ: Flügelbreite EMERGIERT in ganzen Raum-Modulen aus der Wandlänge — keine feste 60%-Fraktion
    const ucRange=Math.max(0,houseAlong/2-breadth/2-0.45), uc=clamp(((((P.seed*131+side.charCodeAt(0)*17)>>>0)%1000)/1000*2-1)*ucRange,-ucRange,ucRange);   // GESETZ: Lage aus dem Grundriss VERSETZT (reale L-Höfe sitzen nicht mittig), beschränkt damit der Flügel ganz auf der Wand bleibt
    const bx=ox*W/2, bz=oz*Dp/2;
    const loc=(u,v)=>[bx+ox*v+ax*u, bz+oz*v+az*u];                                       // Flügel-Frame → Weltkoordinaten
    const u0=uc-breadth/2, u1=uc+breadth/2, v0=0, v1=depth, cs=[loc(u0,v0),loc(u1,v0),loc(u0,v1),loc(u1,v1)];
    const x0=Math.min(...cs.map(c=>c[0])), x1=Math.max(...cs.map(c=>c[0])), z0=Math.min(...cs.map(c=>c[1])), z1=Math.max(...cs.map(c=>c[1]));
    const eY=Math.min(baseY+P.egH*0.86, eaveY-0.8), half=breadth/2, rY=Math.min(eY+half*mS, eaveY-0.3), pit=(rY-eY)/half, alongC=outIsX?(z0+z1)/2:(x0+x1)/2;
    const roofAt = c => Math.max(eY, rY - Math.abs(c-alongC)*pit);                        // ECHTE Dachoberkante an Längsposition c: bis hierher verdeckt der Flügel die Hauswand
    return { side,ox,oz,ax,az,outIsX,depth,breadth,uc,loc,u0,u1,v0,v1,x0,x1,z0,z1,xc:(x0+x1)/2,zc:(z0+z1)/2, eY,rY,pit,alongC,roofAt }; };
  const _bwDrop={E:'x1',W:'x0',N:'z1',S:'z0'};
  const wings = (P.doppel) ? [] : (GRUND[P.grundriss]||[]).filter(sd=>!(P.brandwand&&P.brandwand[_bwDrop[sd]])).map(mkWing);   // ANBAU KOEXISTIERT mit Flügeln — BRANDWAND: kein Flügel wächst in den Nachbarn
  const FOOTPRINT=[{x0:-W/2,x1:W/2,z0:-Dp/2,z1:Dp/2,h:eaveY}].concat(wings.map(w=>({x0:w.x0,x1:w.x1,z0:w.z0,z1:w.z1,h:w.rY})));   // GETEILTER GRUNDRISS-FLUSS: Umriss = Hauptkörper + Flügel
  function eachFootEdge(cb){ FOOTPRINT.forEach(r=>{ cb(r.x0,r.x1,r.z0,r.z0,'z',-1,r); cb(r.x0,r.x1,r.z1,r.z1,'z',1,r); cb(r.x0,r.x0,r.z0,r.z1,'x',-1,r); cb(r.x1,r.x1,r.z0,r.z1,'x',1,r); }); }   // jede Hülle folgt diesem Umriss
  const wing = wings.find(w=>w.side==='E') || wings[0] || null;                           // Legacy-Alias (Giebel-Logik unten)
  { const rearWing = wings.find(w=>w.oz>0);                                                          // GESETZ: Hintertür FOLGT dem Grundriss — neben den Rückwand-Flügel, nie dahinter
    let tgt; if(rearWing){ const lf=rearWing.x0-(-W/2), rf=(W/2)-rearWing.x1; tgt=(rf>=lf)?rearWing.x1+rf/2:rearWing.x0-lf/2; tgt=clamp(tgt,-W/2+0.7,W/2-0.7); } else tgt=-W*0.24;
    let best=null,bd=1e9;
    WALLS.forEach(w=>{ if(w.horiz && w.fixed>0 && !w.brand && w.yLo<baseY+0.6 && (w.hi-w.lo)>0.95 && w.type!=='balkdoor' && w.type!=='wingdoor'){ const d=Math.abs(w.c-tgt); if(d<bd){bd=d;best=w;} } });   // BRANDWAND: keine Hintertür in die Nachbarwand
    if(best){ best.type='door2'; best.win=null; backDoor={cx:best.c, lo:best.lo, hi:best.hi, yHi:best.yHi};
      addCircR(best.c-0.6, Dp/2-1.05, best.c+0.6, Dp/2-0.08, 0, 'hintertür'); } }
  // ── GARAGE (Schleppdach/Pultdach an +x) → Maße aus der STELLPLATZ-FUNKTION, nicht aus W/Dp. Niedriger + kürzer als das Haus, Tor zur Strasse (−z). ──
  const _wE=wings.some(w=>w.outIsX&&w.ox>0), _wW=wings.some(w=>w.outIsX&&w.ox<0);
  const _freeX=[]; if(!_wE)_freeX.push(1); if(!_wW)_freeX.push(-1);                                 // freie x-Seiten (Flügel haben Vorrang)
  const GAs=[]; for(let _ai=0; _ai<Math.min(P.annexN||0,_freeX.length); _ai++){ const sx=_freeX[_ai], gw=clamp(3.0+((P.seed*37+_ai*29)%7)*0.1, 2.9, 3.7);   // ANBAU-ZELLEN-GESETZ: je freie Seite eine Zelle
    let gd=clamp(Dp*0.82, 5.2, 6.0); gd=Math.min(gd, Dp-0.25);
    const z0=-Dp/2, z1=z0+gd, xin=sx*W/2, xout=xin+sx*gw, x0=Math.min(xin,xout), x1=Math.max(xin,xout); let yLow=baseY+2.18;
    let yHigh=yLow+gw*0.20; yHigh=Math.min(yHigh, eaveY-0.25);
    if(ROOFMODE==='flat'){ yHigh=Math.min(baseY+2.75, eaveY-0.45); yLow=yHigh; }
    GAs.push({ gw, gd, sx, xin, xout, x0, x1, z0, z1, zc:(z0+z1)/2, xc:(x0+x1)/2, yLow, yHigh, slope:(yHigh-yLow)/gw }); }
  const GA=GAs[0]||null;                                                                            // Legacy-Alias
  GAs.forEach(A=>FOOTPRINT.push({x0:A.x0,x1:A.x1,z0:A.z0,z1:A.z1,h:A.yHigh+0.06,a:1}));           // JEDE Zelle wird Grundriss-Bürger
  GAs.forEach(A=>WALLS.forEach(w=>{ if(!w.horiz && w.fixed*A.sx>0 && w.win && w.c>A.z0-0.3 && w.c<A.z1+0.3 && w.yLo<A.yHigh-0.05){ w.type='wand'; w.win=null; } }));   // FENSTER-OKKLUSION je Zelle
  const OCC=new Set(['S']); wings.forEach(w=>OCC.add(w.oz>0?'N':w.oz<0?'S':w.ox>0?'E':'W')); GAs.forEach(A=>OCC.add(A.sx>0?'E':'W'));   // BELEGUNGS-QUELLE (top-level): speist Balkontür-Wahl UND Turm-Standort

  // ── Balkontür-Seite erst HIER entscheiden (Flügel & Garage sind jetzt bekannt) ──
  let balcDoor=null;                                              // Balkontür-Öffnung — GESETZ: auf einer FREIEN Wand (kein Flügel/Garage, nicht der Eingang Süd)
  if(P.balcony && levels.length>=2){ const yT=levels[0].top;
    const occ=new Set(['S']); wings.forEach(w=>occ.add(w.oz>0?'N':w.oz<0?'S':w.ox>0?'E':'W')); GAs.forEach(A=>occ.add(A.sx>0?'E':'W'));   // Süd=Eingang gesperrt; Flügel/Garage belegen ihre Seite
    const side=['N','E','W'].find(s=>!occ.has(s));                                                     // Vorzug: Rückwand, dann rechts, dann links
    if(side){ const horizW=(side==='N'), onWall=w=>(w.horiz===horizW) && (side==='W'?w.fixed<0:w.fixed>0) && w.yLo>yT && (w.hi-w.lo)>0.85;
      let best=null;
      if(side==='N'){ const swH=Math.min(0.92,2*fw-0.5), xLim=-(swH/2+0.5); let bc=-1e9;              // Rückwand: Feld klar links am Treppengeländer vorbei
        WALLS.forEach(w=>{ if(onWall(w) && w.c<=xLim && w.c>bc){bc=w.c;best=w;} });
        if(!best){ let bd=1e9; WALLS.forEach(w=>{ if(onWall(w) && w.c<0){ const d=Math.abs(w.c-xLim); if(d<bd){bd=d;best=w;} } }); } }
      else { let bd=1e9; WALLS.forEach(w=>{ if(onWall(w)){ const d=Math.abs(w.c); if(d<bd){bd=d;best=w;} } }); }   // Seitenwand: mittigstes Feld
      if(best){ best.type='balkdoor'; best.win=null; balcDoor={cx:best.c,yHi:best.yHi,side};
        if(side==='N') addCircR(best.c-0.6, Dp/2-1.05, best.c+0.6, Dp/2-0.08, levels.length-1, 'balkontür');
        else if(side==='E') addCircR(W/2-1.05, best.c-0.6, W/2-0.08, best.c+0.6, levels.length-1, 'balkontür');
        else addCircR(-W/2+0.08, best.c-0.6, -W/2+1.05, best.c+0.6, levels.length-1, 'balkontür');
        if(levels.length>=3) WALLS.forEach(w=>{ if(onWall(w) && w.win && Math.abs(w.c-balcDoor.cx)<0.65){ w.type='balkdoor'; w.win=null; } }); }   // Hochhaus: Türkorridor je OG freihalten
    }
  }
  wings.forEach(w=>{ const outIsX=w.outIsX, wallSign = outIsX? w.ox : w.oz, wantHoriz = !outIsX;   // E/W → x-Wände (!horiz); N/S → z-Wände (horiz)
    const alo = outIsX? w.z0 : w.x0, ahi = outIsX? w.z1 : w.x1;                                     // Flügelspanne in der Wandachse
    let best=null,bc=1e9;
    WALLS.forEach(wl=>{ if(wl.horiz===wantHoriz && Math.sign(wl.fixed)===wallSign && !wl.brand && Math.abs(Math.abs(wl.fixed)-(outIsX?W/2:Dp/2))<0.25 && wl.yLo<baseY+0.3 && (wl.hi-wl.lo)>0.75 && wl.type!=='balkdoor' && wl.type!=='wingdoor'){
      const c=(wl.lo+wl.hi)/2; if(c>alo+0.35 && c<ahi-0.35){ const d=Math.abs(c-(alo+ahi)/2); if(d<bc){bc=d;best=wl;} } } });
    if(best){ const c=(best.lo+best.hi)/2, dw=Math.min(0.55,(best.hi-best.lo)/2-0.12); best.type='wingdoor'; best.win=null; best.gap=[c-dw,c+dw]; w.door={c,lo:c-dw,hi:c+dw,fixed:best.fixed}; }
    else    { const c=clamp((alo+ahi)/2, alo+0.7, ahi-0.7); w.door={c,lo:c-0.5,hi:c+0.5,fixed:(outIsX?w.ox*W/2:w.oz*Dp/2)}; }   // GESETZ: jeder bewohnbare Flügel ist IMMER angebunden
    if(outIsX){ const xw=w.ox*W/2; addCircR(xw-w.ox*0.6, w.door.c-0.6, xw, w.door.c+0.6, 0, 'flügeltür'); }
    else      { const zw=w.oz*Dp/2; addCircR(w.door.c-0.6, zw-w.oz*0.6, w.door.c+0.6, zw, 0, 'flügeltür'); } });
  const wingDoor = wing ? wing.door : null;                                                          // Legacy-Alias
  // ── GESETZ (geteilt Anbau ⇄ Flügel): wo ein Nebenbau an die +x-Wand stößt, werden die DORT liegenden Haupthaus-Fenster zu Pfosten — kein Fenster öffnet je in einen Anbau. EINE Quelle, kein Parallelcode. ──
  const sealWallWindows=(side,zLo,zHi,yMax)=>{ WALLS.forEach(w=>{
    if(!w.horiz && Math.sign(w.fixed)===Math.sign(side) && Math.abs(w.fixed)>W/2-0.2 && w.win){
      const c=(w.lo+w.hi)/2; if(c>zLo-0.1 && c<zHi+0.1 && w.win.cy<yMax){ w.type='pier'; w.win=null; } } }); };
  GAs.forEach(A=>sealWallWindows(A.sx, A.z0, A.z1, A.yHigh+0.2));                                    // Haupthaus-Fenster unter JEDEM Garagendach versiegelt — seitenrichtig (war hart +1)
  wings.forEach(w=>{ const outIsX=w.outIsX, wantHoriz=!outIsX, wallSign=outIsX?w.ox:w.oz, alo=outIsX?w.z0:w.x0, ahi=outIsX?w.z1:w.x1;
    WALLS.forEach(wl=>{ if(wl.horiz===wantHoriz && Math.sign(wl.fixed)===wallSign && Math.abs(Math.abs(wl.fixed)-(outIsX?W/2:Dp/2))<0.2 && wl.win){
      const c=(wl.lo+wl.hi)/2; if(c>alo-0.1 && c<ahi+0.1 && (wl.win.cy-(wl.win.ch||0.95)/2) < w.roofAt(c)){ wl.type='pier'; wl.win=null; } } }); });   // GESETZ: nur Fenster, deren Unterkante hinter die echte Flügel-Dachfläche taucht, werden Pfosten — höhere bleiben sichtbar (echte L-Höfe)
  // ── Innenraum-Generierung (eigener Seed, damit die Fassade gleich bleibt) ──
  let _ch=(P.seed*2654435761+0x9E3779B9)>>>0; _ch=((_ch^(_ch>>>16))*2246822519)>>>0; _ch=(_ch^(_ch>>>13))>>>0; const _chS=_ch/4294967296;  // gut gestreuter Kamin-Strom
  const _pw=wings.find(w=>!w.outIsX);                                                                  // senkrechter (verschmelzender) Flügel: sein Dach-Tent liegt auf seiner Seite über dem Hauptdach
  // ════ HERD-PLATZIERUNG · EINE HÜLLE: Körper 1.5(x)×1.1(z) bleibt VOLLSTÄNDIG hinter den Innenflächen der Traufe-/Giebelwände → Stack tritt first-nah aus, Feuer-Öffnung weist nach innen, Küche folgt dem Herd (nearest-room), NICHT der Herd der Küche. Ersetzt die alte fw+1.0-Schranke, die bei schmalen Häusern den Körper nach draussen drückte. ════
  const bodyHX=0.75, bodyHZ=0.55;                                                                     // halbe Herd-Grundfläche (Körper 1.5×1.1)
  const xLim=Math.max(0, W/2-0.10-bodyHX), zLim=Math.max(0, Dp/2-0.10-bodyHZ);                        // GESETZ: max. |hearthX|/|hearthZ|, damit keine Kante die Wandinnenfläche überschreitet
  let hearthZ=clamp((_chS-0.5)*1.7, -zLim, zLim);                                                     // First-nah (z≈0) für Zug + Verwahrung; Seed-Streuung soweit die Hülle reicht
  const hearthSX=(_chS<0.5?-1:1), hearthBD=1.05, hearthBW=1.5, hearthNX=-hearthSX; let hearthX=hearthSX*(W/2-0.12-hearthBD/2);   // GIEBELWAND-GESETZ: der Kamin lehnt an der x-Wand, das Feuer öffnet in den Raum (Normale hearthNX)
  let hearthOZ=(hearthZ>=0?-1:1);                                                                    // Feuer-Öffnungs-Richtung — Default zur Mitte, wird unten auf die KÜCHE ausgerichtet
  if(_pw){ const _hf=(_pw.x1-_pw.x0)/2, _rYp=Math.min((eaveY-0.06)+_hf*mS,ridgeY-0.2), _zRp=(ridgeY-_rYp)/mS;
    if(Math.abs(hearthX-(_pw.x0+_pw.x1)/2)<_hf+0.45 && hearthZ*_pw.oz>_zRp-0.55) hearthZ=-Math.abs(hearthZ)*_pw.oz; }   // NUR wenn der Kamin sonst IN den Flügel-Tent ragen würde → auf die freie First-Seite spiegeln; sonst Seed-frei
  if(!modern) WALLS.forEach(w=>{ if(!w.win) return; const wc=(w.lo+w.hi)/2, wx=w.horiz?wc:w.fixed, wz=w.horiz?w.fixed:wc;
    if(Math.abs(wx-hearthX)<STACK_W/2+P.doorW/2 && Math.abs(wz-hearthZ)<STACK_W/2+P.doorW/2){ w.type='pier'; w.win=null; } });                          // GESETZ: kein Fenster im Kaminrohr-Korridor (hearthX,hearthZ) — Öffnung wird Pfosten, der Stack durchstösst nie ein Fenster
  let _si=(Math.round(P.seed*97+41)*2654435761+12345)>>>0; const rndI=()=>{ _si=(_si*1664525+1013904223)>>>0; return _si/4294967296; };
  const zMinI=-Dp/2+0.12, zMaxI=Dp/2-0.12;
  // RAUMPROGRAMM: ein Haus hat Räume mit GRÖSSENVERHÄLTNISSEN, nicht gleich große Zellen. Schnitte aus Gewichten abgeleitet.
  const prog=(k,isServ)=>{ const r=rndI();                                       // Gewichts-Folge je Streifen/Geschoss
    if(k===0){ return isServ ? (r<0.5?[1.6,1.0]:[1.7,1.0,0.8])                    // Wirtschaftsseite: Küche groß + Bad/Vorrat klein
                             : (r<0.40?[2.3,1.3]:[1]); }                          // Wohnseite: Wohnen GROSS (evtl. + Esszimmer)
    return isServ ? (r<0.5?[1.7,1.0]:[1.6,1.0,0.8])                               // OG Wirtschaftsseite: Schlafzimmer + Bad
                  : (r<0.6?[1.8,1.2]:[2.2]); };                                   // OG Wohnseite: 1–2 Schlafzimmer
  const layout=levels.map((L,k)=>{ const mk=(x0,x1,pr)=>{
      const stripW=x1-x0, minD=Math.max(1.75, 3.7/Math.max(1.2,stripW));         // Mindest-Zellentiefe → keine Mini-Räume
      const hasCh=hearthX>=x0 && hearthX<=x1;
      const inner=bz.filter(z=>z>zMinI+minD && z<zMaxI-minD && (!hasCh||Math.abs(z-hearthZ)>1.35));  // GESETZ: Schnitt nicht am Ende UND ≥1.35 m vom Herd weg → Feuerraum bleibt offen (nie Abstellkammer, Wärme nutzbar)
      const tot=pr.reduce((a,b)=>a+b,0); let cuts=[],cum=0;
      for(let i=0;i<pr.length-1;i++){ cum+=pr[i]; const wantZ=zMinI+(cum/tot)*(zMaxI-zMinI);          // Schnittlage = kumuliertes Gewicht
        const cand=inner.filter(z=>cuts.every(c=>Math.abs(z-c)>=minD));                                // Mindesttiefe zu bestehenden Schnitten
        if(cand.length) cuts.push(cand.reduce((a,z)=>Math.abs(z-wantZ)<Math.abs(a-wantZ)?z:a,cand[0])); } // auf nächste Ständerachse gerundet
      cuts=[...new Set(cuts)].sort((a,b)=>a-b);
      return {x0,x1,cuts}; };
    const isServ=(x0,x1)=>hearthX>=x0 && hearthX<=x1;                              // Streifen mit Herd = Wirtschaftsseite (Küche)
    const Lp=prog(k,isServ(-W/2+0.12,-fw)), Rp=prog(k,isServ(fw,W/2-0.12));
    return { L:mk(-W/2+0.12,-fw,Lp), R:mk(fw,W/2-0.12,Rp) }; });
  const rooms=[];
  layout.forEach((lay,k)=>{ const y=levels[k].y,h=levels[k].h; [['L',lay.L],['R',lay.R]].forEach(([side,s])=>{ const zs=[zMinI,...s.cuts,zMaxI];
      for(let i=0;i<zs.length-1;i++){ const z0=zs[i],z1=zs[i+1]; if(z1-z0<1.2)continue; rooms.push({side,x0:s.x0,x1:s.x1,z0,z1,floor:k,y,h,cx:(s.x0+s.x1)/2,cz:(z0+z1)/2,func:null}); } }); });
  // Raumfunktionen vergeben
  { const eg=rooms.filter(r=>r.floor===0); let kueche=null,kd=1e9;
    eg.forEach(r=>{ const d=Math.hypot(r.cx-hearthX,r.cz-hearthZ); if(d<kd){kd=d;kueche=r;} });
    if(kueche)kueche.func='kueche';
    if(kueche) hearthOZ = Math.sign(kueche.cz - hearthZ) || hearthOZ;                                 // GESETZ: Feuer öffnet in den Raum, dem der Herd dient (nächste Küche), nicht stur Richtung z=0
    const rest=eg.filter(r=>r!==kueche).sort((a,b)=>(b.x1-b.x0)*(b.z1-b.z0)-(a.x1-a.x0)*(a.z1-a.z0));
    if(rest[0])rest[0].func='stube'; rest.slice(1).forEach(r=>r.func='vorrat');                          // EG: genau EINE Stube (größter Nicht-Küchenraum), Rest Vorrat
    { const og=rooms.filter(r=>r.floor>0).sort((a,b)=>(b.x1-b.x0)*(b.z1-b.z0)-(a.x1-a.x0)*(a.z1-a.z0));   // OG: Kammern (Schlafräume), kleinster = Vorrat/Bad — KEINE Stube oben
      og.forEach((r,i)=>{ r.func = (i===og.length-1 && og.length>=3)?'vorrat':'kammer'; }); } }
  const winW=w=>(w.win&&w.win.wd)?w.win.wd:Math.min(w.hi-w.lo-0.3,1.1);
  // Außenfenster freihalten: Möbel nicht vor/unter ein Fenster (Belichtung). Zone = Fensterbreite × 0.4 m in den Raum.
  WALLS.forEach(w=>{ if(!w.win) return; let k=0; for(let i=0;i<levels.length;i++){ if(w.yLo>=levels[i].y-0.25 && w.yLo<levels[i].top){k=i;break;} }
    const wd=winW(w), c=(w.lo+w.hi)/2, a0=c-wd/2-0.1, a1=c+wd/2+0.1, d=0.40;
    if(w.horiz){ const z=w.fixed, zi=z>0?z-d:z+d; addCircR(a0,Math.min(z,zi),a1,Math.max(z,zi),k,'fenster'); }
    else { const x=w.fixed, xi=x>0?x-d:x+d; addCircR(Math.min(x,xi),a0,Math.max(x,xi),a1,k,'fenster'); } });
  // Giebelfenster vs. Innenwand: durch die Raster-Kopplung gelöst — Schnitte liegen auf bz-Ständerachsen,
  // Querwände treffen den Giebel daher am Pfosten ZWISCHEN den Fensterfeldern. Kein Veto nötig, kein Fenster blockiert.
  function infill(g,a0,a1,y0,y1,fixed,horiz,brick){ if(a1-a0<0.04||y1-y0<0.04)return; const ac=(a0+a1)/2,yc=(y0+y1)/2,al=a1-a0,yl=y1-y0;
    if(brick===false){ if(horiz)beam(g,ac,yc,fixed,al,yl,0.09,'lehm'); else beam(g,fixed,yc,ac,0.09,yl,al,'lehm'); return; }  // glattes Putzfeld
    if(horiz)beam(g,ac,yc,fixed,al,yl,0.06,'lehm'); else beam(g,fixed,yc,ac,0.06,yl,al,'lehm');   // zurückgesetzte Hinterfüllung (Holz steht vor)
    const bw=0.32,bh=0.15,m=0.025,bt=0.085; const nr=Math.max(1,Math.round(yl/bh)),rh=yl/nr;       // Backstein-Ausfachung, versetzte Lagen
    for(let r=0;r<nr;r++){ const by=y0+(r+0.5)*rh, ox=(r%2)*bw*0.5;
      for(let bx0=Math.floor((a0-ox)/bw)*bw+ox; bx0<a1-0.02; bx0+=bw){ const cl=Math.max(a0,bx0), cr=Math.min(a1,bx0+bw), w=cr-cl-m; if(w<0.05)continue; const cc=(cl+cr)/2;   // FIX: Backstein auf GLOBALES Raster (Ursprung 0) statt Feldkante a0 → Wandfelder UND Giebel teilen EIN Raster, Stossfugen fluchten durchgehend
        if(horiz)beam(g,cc,by,fixed,w,rh-m,bt,'backstein'); else beam(g,fixed,by,cc,bt,rh-m,w,'backstein'); } } }

  function riegel(){const g=grp(); if(ROUND)return g; if(modern) return g;                                                 // STIL modern: keine Riegel → glatte Putzwand
    const rail=(lo,hi,y,f,h)=>{const c=(lo+hi)/2,l=hi-lo; if(l<0.05)return; if(h)beam(g,c,y,f,l,0.1,0.13,'holz'); else beam(g,f,y,c,0.13,0.1,l,'holz');};
    const postV=(a,y0,y1,f,h)=>{const yc=(y0+y1)/2,yl=y1-y0; if(yl<0.05)return; if(h)beam(g,a,yc,f,0.1,yl,0.13,'holz'); else beam(g,f,yc,a,0.13,yl,0.1,'holz');};
    WALLS.forEach(w=>{ if(w.type==='door'||w.type==='door2'||w.type==='balkdoor'||w.type==='wingdoor')return;          // alle Türöffnungen frei: keine Riegel quer
      rail(w.lo,w.hi,w.sillY,w.fixed,w.horiz); rail(w.lo,w.hi,w.lintelY,w.fixed,w.horiz);          // Brüstungs- + Sturzriegel (fluchtendes Band)
      if(w.type==='window'){ const wd=winW(w); postV(w.c-wd/2,w.sillY,w.lintelY,w.fixed,w.horiz); postV(w.c+wd/2,w.sillY,w.lintelY,w.fixed,w.horiz); } }); return g; }

  function streben(){const g=grp(); if(ROUND)return g; if(modern) return g;                                                // STIL modern: keine Streben → glatte Putzwand (kein Fachwerk-Relief)
    const seg=(fixed,horiz,x0,y0,x1,y1,no)=>{ const f=fixed+(no||0); if(horiz)strut(g,x0,y0,f,x1,y1,f,0.1,'holz'); else strut(g,f,y0,x0,f,y1,x1,0.1,'holz'); };
    const motif=(a0,a1,y0,y1,fixed,horiz)=>{ const cx=(a0+a1)/2,cy=(y0+y1)/2;                       // Strebenfigur in EINEM Feld (Brüstung)
      if(P.brace==='andreas'){ seg(fixed,horiz,a0,y0,a1,y1,+0.022); seg(fixed,horiz,a1,y0,a0,y1,-0.022); }
      else if(P.brace==='k'){ seg(fixed,horiz,cx,y0,a0,y1); seg(fixed,horiz,cx,y0,a1,y1); }
      else if(P.brace==='mann'){ seg(fixed,horiz,cx,y0,cx,y1,-0.02); seg(fixed,horiz,a0,y0,cx,cy,+0.022); seg(fixed,horiz,a1,y0,cx,cy,+0.022); }
      else { seg(fixed,horiz,a0,y0,a1,y1,+0.022); seg(fixed,horiz,a1,y0,a0,y1,-0.022); } };
    const corner=(w)=>{ const a0=w.lo-ps,a1=w.hi+ps, oc=w.corner==='lo'?a0:a1, ic=w.corner==='lo'?a1:a0, H=w.yHi-w.yLo;  // Fuß- + Kopfband am Eckständer
      seg(w.fixed,w.horiz, oc,w.yLo, ic,w.yLo+H*0.5, +0.022); seg(w.fixed,w.horiz, oc,w.yHi, ic,w.yHi-H*0.5, -0.022); };
    WALLS.forEach(w=>{ if(w.type==='door'||w.type==='door2'||w.type==='balkdoor'||w.type==='wingdoor')return;          // alle Türöffnungen frei: kein Brüstungsmotiv quer
      motif(w.lo-ps,w.hi+ps, w.yLo, w.sillY, w.fixed, w.horiz);                                      // Brüstungsmotiv (durchgehendes Band, fluchtet)
      if(w.type==='corner') corner(w); });                                                            // + Eckstreben
    return g; }

  function gefache(){const g=grp(); if(ROUND)return g;
    WALLS.forEach(w=>{ if(w.type==='door'){ return; }                       // Türfeld bleibt offen (Haustür+Oberlicht baut tueren())
      if(w.type==='door2'){ const dh=baseY+P.doorH, cx=backDoor?backDoor.cx:w.c, oL=cx-0.62, oR=cx+0.62;   // Hintertür: Öffnung nur türbreit — daneben + oben Gefach (sauberer Schnitt)
        if(w.yHi>dh+0.05) infill(g,w.lo,w.hi,dh,w.yHi,w.fixed,w.horiz,w.brick);
        infill(g,w.lo,oL,w.yLo,dh,w.fixed,w.horiz,w.brick); infill(g,oR,w.hi,w.yLo,dh,w.fixed,w.horiz,w.brick); return; }
      if(w.type==='wingdoor'){ const dh=baseY+P.doorH, gp=w.gap||(wingDoor?[wingDoor.lo,wingDoor.hi]:[w.c-0.5,w.c+0.5]), oL=gp[0], oR=gp[1];   // Flügel-Durchgang: Gefach um DIESE Öffnung (eigene Lücke der Wand), Tür frei
        if(w.yHi>dh+0.05) infill(g,w.lo,w.hi,dh,w.yHi,w.fixed,w.horiz,w.brick);
        infill(g,w.lo,oL,w.yLo,dh,w.fixed,w.horiz,w.brick); infill(g,oR,w.hi,w.yLo,dh,w.fixed,w.horiz,w.brick); return; }
      if(w.type==='balkdoor'){ const dh=levels[1].y+2.06, cx=balcDoor?balcDoor.cx:w.c, oL=cx-0.52, oR=cx+0.52; // Balkontür: dito
        infill(g,w.lo,w.hi,dh,w.yHi,w.fixed,w.horiz,w.brick);
        infill(g,w.lo,oL,w.yLo,dh,w.fixed,w.horiz,w.brick); infill(g,oR,w.hi,w.yLo,dh,w.fixed,w.horiz,w.brick); return; }
      if(w.type==='window'){ const cy=w.win.cy,ch=w.win.ch,wd=winW(w),L=w.c-wd/2,R=w.c+wd/2,b=cy-ch/2,t=cy+ch/2;
        infill(g,w.lo,L,w.yLo,w.yHi,w.fixed,w.horiz,w.brick); infill(g,R,w.hi,w.yLo,w.yHi,w.fixed,w.horiz,w.brick);
        infill(g,L,R,w.yLo,b,w.fixed,w.horiz,w.brick); infill(g,L,R,t,w.yHi,w.fixed,w.horiz,w.brick);
      } else infill(g,w.lo,w.hi,w.yLo,w.yHi,w.fixed,w.horiz,w.brick); }); return g; }

  const eaveZ=Dp/2, ovZ=P.ovEave, ovX=P.ovRake, dY=ridgeY-eaveY, tanP=mS;
  const rH=Math.max(0.25, W/2 - P.hip*eaveZ);
  const hipStartY=eaveY+(1-P.hip)*dY;
  const gzTop=eaveZ*P.hip;
  // Giebel-Spitzfenster (nur Sattel/Krüppelwalm, wenn Giebeldreieck hoch & breit genug) — Lage GETEILT: Ausfachung spart aus, Fenster sitzt bündig
  let gableWin=null;
  if(P.hip<0.6 && (hipStartY-eaveY)>1.25){ const cy=eaveY+Math.min(0.95,(hipStartY-eaveY)*0.42), wz=0.8, hy=0.66;
    const halfAtCy=eaveZ*(hipStartY-cy)/(hipStartY-eaveY); if(halfAtCy>wz/2+0.3) gableWin={cy,wz,hy,z0:-wz/2,z1:wz/2,y0:cy-hy/2,y1:cy+hy/2}; }
  const RL=[-rH,ridgeY,0], RR=[rH,ridgeY,0];
  const dEZ=ovZ, dEY=ovZ*tanP;
  const FL=[-W/2-ovX,eaveY-dEY,eaveZ+dEZ], FR=[W/2+ovX,eaveY-dEY,eaveZ+dEZ];
  const BL=[-W/2-ovX,eaveY-dEY,-eaveZ-dEZ], BR=[W/2+ovX,eaveY-dEY,-eaveZ-dEZ];
  const GTLf=[-W/2,hipStartY,gzTop], GTRf=[W/2,hipStartY,gzTop], GTLb=[-W/2,hipStartY,-gzTop], GTRb=[W/2,hipStartY,-gzTop];
  // ── Kehltal-Notch: jeder senkrechte (verschmelzende) Flügel schneidet ein Dreieck aus dem Hauptdach (Tal-Linie) → kein Z-Fighting, echtes Kehltal ──
  const _mSn=mS;
  const NOTCH=(P.doppel)?[]:wings.filter(w=>!w.outIsX).map(w=>{ const hf=(w.x1-w.x0)/2, rYw=Math.min((eaveY-0.06)+hf*_mSn,ridgeY-0.2); return {sg:w.oz, xc:(w.x0+w.x1)/2, hf, zR:(ridgeY-rYw)/_mSn, rYw}; });   // ANBAU KOEXISTIERT mit Flügeln — nur Doppelhaus bleibt exklusiv
  const notchCut=(x,zSigned)=>NOTCH.some(N=>{ if(zSigned*N.sg<=0)return false; const z=Math.abs(zSigned); if(z<N.zR-0.02)return false; const nh=N.hf*Math.min(1,(z-N.zR)/Math.max(0.1,eaveZ-N.zR)); return Math.abs(x-N.xc)<nh-0.03; });
  function roofY(x,z){ const off=0.13, hw=W/2+ovX, hz=eaveZ+ovZ; if(Math.abs(x)>hw+0.05||Math.abs(z)>hz+0.05)return Infinity;
    return (eaveY-ovZ*tanP+off) + ((ridgeY+off)-(eaveY-ovZ*tanP+off))*(hz-Math.abs(z))/hz; }

  function giebel(){const g=grp(); if(ROOFMODE!=='sattel'||P.hip>0.985) return g;
    [1,-1].forEach(sx=>{ const gw = wings.some(w=>(sx>0?w.side==='E':w.side==='W')) ? null : gableWin;       // Giebel trägt einen Flügel davor → KEIN Estrichfenster dort (nur auf der Seite, wo wirklich ein E/W-Flügel steht)
      const xf=sx*(W/2-0.02), apexY=hipStartY, half=gzTop;
      beam(g,xf,eaveY-P.raehm/2,0,0.12,P.raehm,Dp-0.04,'holz');                                          // Schwellrähm
      const gbrick=rnd()>0.5, bw=0.32,bh=0.15,m=0.025,bt=0.075;
      const zHalf=y=>eaveZ+(half-eaveZ)*(y-eaveY)/Math.max(0.1,apexY-eaveY);
      { const topY = half>0.02?apexY:ridgeY, nh=Math.max(3,Math.round((topY-eaveY)/0.24)), rh=(topY-eaveY)/nh;   // Hinterfüllung als Streifen — Fensteröffnung ECHT ausgespart (nicht nur Backstein)
        for(let r=0;r<nh;r++){ const by=eaveY+(r+0.5)*rh, zh=(half>0.02)?zHalf(by):eaveZ*(ridgeY-by)/Math.max(0.1,ridgeY-eaveY);
          if(zh<0.05)continue;
          if(gw && by+rh/2>gw.y0 && by-rh/2<gw.y1){                                                  // Zeile überlappt Glas → Loch EXAKT auf Glashöhe geklippt, Rahmen deckt den Rand
            const yb0=by-rh/2, yb1=by+rh/2, L=gw.z0-0.02, R=gw.z1+0.02;
            if(yb1>gw.y1) beam(g,xf,(gw.y1+yb1)/2,0,0.05,yb1-gw.y1,2*zh,'lehm');                      // volle Hinterfüllung ÜBER dem Glas → kein Spalt über dem Sturz
            if(yb0<gw.y0) beam(g,xf,(yb0+gw.y0)/2,0,0.05,gw.y0-yb0,2*zh,'lehm');                      // volle Hinterfüllung UNTER dem Glas
            const yLo=Math.max(yb0,gw.y0), yH=Math.min(yb1,gw.y1)-yLo, yMid=yLo+yH/2;
            if(yH>0.01){ if(L>-zh+0.02){ const w=L-(-zh); beam(g,xf,yMid,(-zh+L)/2,0.05,yH,w,'lehm'); }
              if(zh>R+0.02){ const w=zh-R; beam(g,xf,yMid,(R+zh)/2,0.05,yH,w,'lehm'); } }
          } else beam(g,xf,by,0,0.05,rh,2*zh,'lehm'); } }
      if(gbrick){ const nr=Math.max(1,Math.round((apexY-eaveY)/bh)),rh=(apexY-eaveY)/nr;                  // Backstein im Dreieck (geklippt, Fensteröffnung ausgespart)
        for(let r=0;r<nr;r++){ const by=eaveY+(r+0.5)*rh, zh=zHalf(by), ox=(r%2)*bw*0.5;
          for(let z0=Math.floor((-zh-ox)/bw)*bw+ox; z0<zh-0.02; z0+=bw){ const cl=Math.max(-zh,z0),cr=Math.min(zh,z0+bw),wz=cr-cl-m; if(wz<0.06)continue;   // FIX: Backstein-Spalten auf festem z-Raster (Ursprung 0, Phase ox) → senkrechte Stossfugen wie die Hauptwand, an der Schräge geschnitten (vorher: Ursprung −zh wanderte je Zeile → seitliche Drift)
            if(gw && cr>gw.z0-0.05 && cl<gw.z1+0.05 && by+rh/2>gw.y0-0.05 && by-rh/2<gw.y1+0.05) continue;     // Öffnung frei
            beam(g,xf,by,(cl+cr)/2,bt,rh-m,wz,'backstein'); } } }
      const nn=Math.max(2,Math.round(eaveZ/0.85));                                                        // Ständer (vorstehend), ums Fenster geklippt
      for(let i=-nn;i<=nn;i++){ const z=i*eaveZ/nn; const t=Math.min(apexY,(Math.abs(z)<=half)?apexY:ridgeY-Math.abs(z)*dY/eaveZ); if(t<=eaveY+0.3)continue;
        if(gw && Math.abs(z)<gw.z1+0.07){ if(gw.y0-0.05>eaveY+0.12) beam(g,xf,(eaveY+gw.y0-0.05)/2,z,0.1,gw.y0-0.05-eaveY,0.12,'holz');
          if(t>gw.y1+0.05) beam(g,xf,(gw.y1+0.05+t)/2,z,0.1,t-(gw.y1+0.05),0.12,'holz'); }
        else beam(g,xf,(eaveY+t)/2,z,0.1,t-eaveY,0.12,'holz'); }
      const ry=eaveY+(apexY-eaveY)*0.5, zr=zHalf(ry);                                                     // Brustriegel, um Fenster geteilt
      if(gw && ry>gw.y0-0.12 && ry<gw.y1+0.12){ const lenL=(gw.z0-0.06)-(-zr); if(lenL>0.1)beam(g,xf,ry,(-zr+gw.z0-0.06)/2,0.1,0.1,lenL,'holz');
        const lenR=zr-(gw.z1+0.06); if(lenR>0.1)beam(g,xf,ry,(gw.z1+0.06+zr)/2,0.1,0.1,lenR,'holz'); }
      else beam(g,xf,ry,0,0.1,0.1,2*zr,'holz');
      strut(g,xf,eaveY,eaveZ, xf,apexY,half,0.1,'holz'); strut(g,xf,eaveY,-eaveZ, xf,apexY,-half,0.1,'holz'); // Ortgang-Streben
      if(gw) fensterAt(g, xf, gw.cy, 0, gw.wz, gw.hy, false);                                              // Estrich-Fenster: GLEICHER Bauer wie EG/OG (Rahmen+öffenbarer Flügel), kein Sonderfall
    });
    if(P.treppgiebel && P.hip<0.5){ const sH=0.42, ledge=0.13;   // TREPPENGIEBEL (flämisch/schottisch/kapholländisch) — Kraehenstufen statt Schraege
      [1,-1].forEach(sx=>{ const xf=sx*(W/2), nS=Math.max(3,Math.floor((ridgeY-eaveY)/sH));
        for(let s=0;s<=nS;s++){ const y=eaveY+s*sH, fr=1-s/nS, zEx=eaveZ*fr;
          beam(g,xf+sx*ledge*0.5,y,0,0.30+ledge,0.16,2*zEx+0.12,'stein');
          if(s<nS) [1,-1].forEach(zs=>beam(g,xf+sx*ledge*0.5,y+sH/2,zs*zEx,0.30,sH,0.34,'stein')); } }); }
    return g; }

  function dachwerk(){const g=grp(); if(ROOFMODE!=='sattel') return g; const footY=eaveY-ovZ*tanP, footZ=eaveZ+ovZ;
    const rafterTop=z=>footY+(ridgeY-footY)*(footZ-Math.abs(z))/footZ;
    const fpY=rafterTop(0)-P.pfetteH;                                            // Firstpfette Unterkante
    beam(g,0,rafterTop(0)-P.pfetteH/2,0,2*rH+0.2,P.pfetteH,P.pfetteB,'holz');     // Firstpfette
    [1,-1].forEach(s=>beam(g,0,rafterTop(eaveZ)-P.pfetteH/2,s*eaveZ,W+0.2,P.pfetteH,P.pfetteB,'holz')); // Fußpfetten
    const nS=Math.max(3,Math.round(W/0.85));
    for(let i=0;i<=nS;i++){ const x=-W/2+i*W/nS; if(x<-rH-0.05||x>rH+0.05)continue;
      if(!NOTCH.some(N=>N.sg>0&&Math.abs(x-N.xc)<N.hf-0.12)) strut(g,x,footY,footZ, x,ridgeY,0,P.spar,'holz');
      if(!NOTCH.some(N=>N.sg<0&&Math.abs(x-N.xc)<N.hf-0.12)) strut(g,x,footY,-footZ, x,ridgeY,0,P.spar,'holz'); }
    // ── Kehlbalken (Kollar) ÜBER Kopfhöhe → Queraussteifung; Estrichboden bleibt FREI begehbar ──
    const colY=Math.max((footY+ridgeY)/2, eaveY+1.98);                          // über dem Spieler (PH=1.7) — kein Bauteil steht im Stehraum
    const colHalfZ=footZ*(ridgeY-colY)/Math.max(0.1,ridgeY-footY);
    const colX=[];                                                             // GESETZ: ein Firstständer darf NUR über einem Kehlbalken stehen → beide Lagen teilen sich EIN x-Raster (sonst schwebt der Stiel)
    if(colHalfZ>0.3 && colY<ridgeY-0.35) for(let i=0;i<=nS;i+=2){ const x=-W/2+i*W/nS; if(x<-rH-0.05||x>rH+0.05)continue;
      beam(g,x,colY,0,P.spar,0.12,2*colHalfZ,'holz'); colX.push(x); }           // Kehlbalken (nicht solid, über Kopf) — Lage merken
    // ── Firststuhl-Stiele: stehen AUF dem Kehlbalken (Oberkante colY+0.06) und tragen die Firstpfette → KEIN Schweben ──
    const colTop=colY+0.06;
    if(fpY-colTop>0.30 && colX.length){
      const inner=colX.filter(x=>Math.abs(x)<rH-0.5);                           // Giebelenden ausgenommen: dort trägt die Giebelwand die Pfette
      const pick=inner.filter((x,i)=>i%2===0);                                  // jeder zweite Kehlbalken bekommt einen Stiel (authentischer Stuhl-Abstand)
      (pick.length?pick:inner).forEach(x=>{ if(Math.abs(x-hearthX)<0.5 && Math.abs(hearthZ)<0.4)return;
        beam(g,x,(colTop+fpY)/2,0,0.14,fpY-colTop,0.16,'holz'); }); }           // Stiel sitzt bündig auf dem Kehlbalken, reicht bis Pfette — KEIN Solid
    if(P.hip>0.02){ [[-W/2,-rH],[W/2,rH]].forEach(([xe,xr])=>{ [eaveZ,-eaveZ].forEach(ze=>{ strut(g,xe,eaveY,ze, xr,ridgeY,0,P.spar*1.1,'holz'); }); }); }
    if(DORMER){ const {gx,gW,zBack,zFront,yBack,baseY2,frontTop}=DORMER;   // ════ DACHGAUBE — Geometrie aus geteilter Quelle; die Dachhaut spart denselben Footprint aus (echter Durchbruch) ════
      [-1,1].forEach(s=>{ const cx=gx+s*gW/2; poly(g,[[cx,baseY2-0.05,zFront],[cx,frontTop+0.05,zFront],[cx,yBack+0.05,zBack],[cx,roofSkinY(cx,zBack)-0.05,zBack]],'gefach'); beam(g,cx,(baseY2+frontTop)/2,zFront,0.08,frontTop-baseY2+0.25,0.08,'holz'); });
      beam(g,gx,baseY2,zFront,gW,0.14,0.12,'gefach'); beam(g,gx,frontTop+0.03,zFront,gW+0.18,0.12,0.13,'holz');
      fensterAt(g,gx,(baseY2+frontTop)/2+0.05,zFront+0.02,gW-0.30,(frontTop-baseY2)-0.25,true);
      poly(g,[[gx-gW/2-0.13,frontTop+0.05,zFront-0.04],[gx+gW/2+0.13,frontTop+0.05,zFront-0.04],[gx+gW/2+0.13,yBack+0.06,zBack+0.1],[gx-gW/2-0.13,yBack+0.06,zBack+0.1]],'ziegel2');
      eindeckenFlaeche(g,{rY:yBack+0.06,eaveDropY:frontTop+0.05,eZ:Math.abs(zBack-zFront)+0.10,zMid:zBack+0.05,sign:-1,xRangeAt:function(){return [gx-gW/2-0.10,gx+gW/2+0.10];},trim:true,lift:0.05,axis:'z'});   // GAUBE durch DASSELBE Dach-Gesetz gedeckt (Lattung+Ziegel) — nicht mehr drangeklebt
      beam(g,gx,yBack+0.13,zBack+0.05,gW+0.34,0.06,0.11,'ziegel'); }
    return g; }

  function dachdeckung(){const g=grp(); if(ROOFMODE==='flat'){ FOOTPRINT.forEach(rr=>beam(g,(rr.x0+rr.x1)/2, (rr.a?rr.h:eaveY+0.06), (rr.z0+rr.z1)/2, rr.x1-rr.x0, 0.12, rr.z1-rr.z0, 'stein')); return g; } if(ROOFMODE!=='sattel') return g; const off=0.055; const up=p=>[p[0],p[1]+off,p[2]];
    // Unterdach (geschlossene Fläche unter den Ziegeln)
    const Fl=up(FL),Fr=up(FR),Bl=up(BL),Br=up(BR),Rl=[RL[0],RL[1]+off,RL[2]],Rr=[RR[0],RR[1]+off,RR[2]];
    const Gtlf=up(GTLf),Gtrf=up(GTRf),Gtlb=up(GTLb),Gtrb=up(GTRb);
    const dachUnter=(g2,sgn)=>{ const Ec=sgn>0?Fr:Br, nz=16;                                             // feste Dachfläche als Streifen mit echtem Kehltal-Loch (kein zweites Sheet mehr im Flügel-Fußabdruck)
      for(let i=0;i<nz;i++){ const t0=i/nz, t1=(i+1)/nz;
        const P0={x:Ec[0]+(Rr[0]-Ec[0])*t0, y:Ec[1]+(Rr[1]-Ec[1])*t0, z:Ec[2]+(Rr[2]-Ec[2])*t0};
        const P1={x:Ec[0]+(Rr[0]-Ec[0])*t1, y:Ec[1]+(Rr[1]-Ec[1])*t1, z:Ec[2]+(Rr[2]-Ec[2])*t1};
        const nhAt=(z)=>{ let m=0,mxc=0; NOTCH.forEach(N=>{ if(N.sg===sgn){ const az=Math.abs(z); if(az>=N.zR-0.05){ const _h=N.hf*Math.min(1,(az-N.zR)/Math.max(0.1,eaveZ-N.zR)); if(_h>m){m=_h;mxc=N.xc;} } } }); return {h:m,xc:mxc}; };
        const c0=nhAt(P0.z), c1=nhAt(P1.z);   // EIN DURCHBRUCH-GESETZ: dieselben Oeffnungen (Fluegel-Notch + Gaube) schneiden Unterdach UND Ziegel — nicht nur Ziegel
        const holes=[];
        if(c0.h>0.03||c1.h>0.03) holes.push({a0:c0.xc-c0.h,b0:c0.xc+c0.h,a1:c1.xc-c1.h,b1:c1.xc+c1.h,c:(c0.xc+c1.xc)/2});
        const _zm=(P0.z+P1.z)/2;
        if(DORMER && _zm<DORMER.zBack+0.05 && _zm>DORMER.zFront-0.02){ const _da=DORMER.gx-DORMER.gW/2-0.10, _db=DORMER.gx+DORMER.gW/2+0.10; holes.push({a0:_da,b0:_db,a1:_da,b1:_db,c:DORMER.gx}); }
        holes.sort((p,q)=>p.c-q.c);
        let _xL0=-P0.x, _xL1=-P1.x;
        for(const H of holes){ const _a0=Math.max(_xL0,Math.min(H.a0,P0.x)), _a1=Math.max(_xL1,Math.min(H.a1,P1.x));
          if(_a0>_xL0+0.02||_a1>_xL1+0.02) poly(g2,[[_xL0,P0.y,P0.z],[_a0,P0.y,P0.z],[_a1,P1.y,P1.z],[_xL1,P1.y,P1.z]],'ziegel2');
          _xL0=Math.max(_xL0,Math.min(H.b0,P0.x)); _xL1=Math.max(_xL1,Math.min(H.b1,P1.x)); }
        if(P0.x>_xL0+0.02||P1.x>_xL1+0.02) poly(g2,[[_xL0,P0.y,P0.z],[P0.x,P0.y,P0.z],[P1.x,P1.y,P1.z],[_xL1,P1.y,P1.z]],'ziegel2'); } };
    dachUnter(g,1); dachUnter(g,-1);
    if(P.hip>0.02){ poly(g,[Gtlf,Gtlb,Rl],'ziegel2'); poly(g,[Gtrb,Gtrf,Rr],'ziegel2'); }
    // Lattung + Ziegelreihen (Doppeldeckung) auf den Hauptflächen — GETEILTES Gesetz eindeckenFlaeche (gleiche Quelle wie Wing)
    const eZ=eaveZ+ovZ, tanPm=tanP, eaveDropY=eaveY-ovZ*tanP, spanH=ridgeY-hipStartY;
    const xhAt=y=>{ const xh=(spanH<0.02||y<=hipStartY+0.01)?(W/2+ovX):Math.max(rH+0.05,W/2+(rH-W/2)*(y-hipStartY)/spanH); return [-xh,xh]; };  // Ortgang/Walm pro Reihe
      { const bx2=W/2+ovX+0.02, yB0=eaveY-ovZ*tanP+0.14, zB0=eaveZ+ovZ, yB1=Math.min(hipStartY,ridgeY)+0.14, zB1=gzTop;   // ORTGANG-GESETZ: Windbrett je Rake schließt die Ziegel-Sägezähne (voll & Krüppelwalm — folgt hipStartY)
        [1,-1].forEach(sx2=>[1,-1].forEach(sz3=>{ if(zB0-Math.abs(zB1)>0.3) strut(g,sx2*bx2,yB0,sz3*zB0, sx2*bx2,yB1,sz3*zB1, 0.24,TRIMR); })); }
      [1,-1].forEach(sz3=>beam(g,0,eaveY-ovZ*tanP+0.02,sz3*(eaveZ+ovZ+0.09), W+2*ovX+0.2,0.11,0.13,'dunkel'));   // TRAUFRINNEN-GESETZ Hauptdach: beidseitig, dunkel — synergetisch zum Ziegel
    const roofSkip=(x,z)=> (notchCut(x,z)&&notchCut(x, z+Math.sign(z||1)*0.30)) || (DORMER && z<DORMER.zBack+0.05 && z>DORMER.zFront-0.02 && x>DORMER.gx-DORMER.gW/2-0.10 && x<DORMER.gx+DORMER.gW/2+0.10);   // RANDBAND 0.30: Hauptreihen überlappen in den Notch (kein nacktes Unterdach am Stoß) · CONSTRAINT: Skip nur INNERHALB der Gauben-Deckung (z[zFront,zBack], vom Gaubendach verdeckt) — nicht VOR der Front, sonst liegt Unterdach frei   // Ziegel über dem Gauben-Footprint ausgespart
    eindeckenFlaeche(g,{rY:ridgeY,eaveDropY,eZ,zMid:0,sign:1,xRangeAt:xhAt,trim:true,lift:0.10,skip:roofSkip});
    eindeckenFlaeche(g,{rY:ridgeY,eaveDropY,eZ,zMid:0,sign:-1,xRangeAt:xhAt,trim:true,lift:0.10,skip:roofSkip});
    const th=Math.atan((dY+ovZ*tanP)/eZ), cs=0.205, tw=0.26, tl=0.34, tt=0.03, lift=0.10;             // (für Walmgrat-Deckung unten weiterverwendet)
    if(P.hip>0.04){ const csH=cs*0.76; const layHip=sx=>{ const span=ridgeY-hipStartY; const nH=Math.max(2,Math.round(span/Math.sin(th)/csH)+2);
      for(let i=0;i<nH;i++){ const y=hipStartY+0.02+ i*csH*Math.sin(th); if(y>ridgeY+0.05)break;
        const x=sx*(W/2+(rH-W/2)*Math.min(1,(y-hipStartY)/span)), zw=gzTop*Math.max(0,(ridgeY-y))/span;
        const n=Math.ceil(2*zw/tw)+2, ox=(i%2)*tw*0.5;
        for(let j=0;j<n;j++){ const z=-zw-tw*0.5+ox+tw*0.5+j*tw; if(Math.abs(z)>zw+0.06)continue; beam(g,x,y+lift,z,tl+0.07,tt,tw*0.97,'ziegel',[0,0,-sx*th]); } } };
      layHip(-1); layHip(1); }
    beam(g,0,ridgeY+0.15,0,2*rH+2*ovX*(1-P.hip)+0.25,0.16,0.24,'ziegel');                            // Firstziegel
    if(P.hip>0.04){ const lift=0.15; const footY2=eaveY-ovZ*tanP;                                        // Gratziegel auf der ECHTEN Faltkante (nicht Traufecke→First)
      [1,-1].forEach(sx=>[1,-1].forEach(sz=>{ const end=[sx*rH, ridgeY+lift, 0];
        const start = (P.hip>0.96) ? [sx*(W/2+ovX), footY2+lift, sz*(eaveZ+ovZ)]                          // Vollwalm: Grat bis zur überstehenden Traufecke
                                    : [sx*(W/2),      hipStartY+lift, sz*gzTop];                            // Krüppelwalm: Grat ab Walm-Knick GTLf
        strut(g, start[0],start[1],start[2], end[0],end[1],end[2], 0.21, 'ziegel'); })); }                 // breit genug, deckt die Tiegel-Kehle
    [1,-1].forEach(sx=>{ if(P.hip>0.96)return; const xo=sx*(W/2+ovX); [1,-1].forEach(sz=>strut(g,xo,eaveY-dEY+0.05,sz*(eaveZ+ovZ),xo,hipStartY+0.05,sz*gzTop,0.13,'holz')); }); // Windbrett (Ortgang)
    return g; }

  const Wi=W/2-0.08, Di=Dp/2-0.08;  // Treppe (stW/wx0/wx1/wz1/STAIR) im Weltmodell oben definiert
  function boeden(){const g=grp(); if(ROUND)return g; let levelTop;
    const rect=(y,x0,x1,z0,z1,role,sol)=>{ if(x1-x0<0.08||z1-z0<0.08)return; const w=x1-x0,d=z1-z0,nb=Math.max(1,Math.round(d/0.28)),cx=(x0+x1)/2;
      for(let i=0;i<nb;i++){const z=z0+(i+0.5)*d/nb; beam(g,cx,y,z,w,0.06,d/nb*0.98,role);} if(sol!==false)addSolid(cx,y,(z0+z1)/2,w,0.12,d); };
    const railSeg=(x0,z0,x1,z1,hcx,hcz)=>{ const hh=0.95,dx=x1-x0,dz=z1-z0,len=Math.hypot(dx,dz),h=Math.abs(dx)>=Math.abs(dz),cx=(x0+x1)/2,cz=(z0+z1)/2;
      beam(g,cx,levelTop+hh,cz,h?len:0.07,0.08,h?0.07:len,'holz');
      for(let t=0;t<=Math.max(2,Math.round(len/0.5));t++){const f=t/Math.max(2,Math.round(len/0.5));beam(g,x0+dx*f,levelTop+hh/2,z0+dz*f,0.06,hh,0.06,'holz');}
      const sx=(hcx!==undefined&&!h)?cx+Math.sign(hcx-cx)*0.06:cx, sz=(hcz!==undefined&&h)?cz+Math.sign(hcz-cz)*0.06:cz; addSolid(sx,levelTop+hh/2,sz,h?len:0.12,hh,h?0.12:len); };  // Solid auf Loch-Seite → ragt nicht in die Lane
    if(P.keller){ const ks={x0:lxL-0.04,x1:lxR+0.04,z0:stZ0-0.06,z1:wz1+0.10};                // EG-Boden mit Kellertreppen-Loch (rechte Spur)
      [[-Wi,ks.x0,-Di,Di],[ks.x1,Wi,-Di,Di],[ks.x0,ks.x1,-Di,ks.z0],[ks.x0,ks.x1,ks.z1,Di]].forEach(([x0,x1,z0,z1])=>{ if(x1-x0<0.05||z1-z0<0.05)return; rect(baseY+0.03,x0,x1,z0,z1,'stein'); });
      levelTop=baseY; bruestungSeg(g,'z',ks.x0,ks.x1,ks.z1,ks.z1,baseY+0.06,'holz'); bruestungSeg(g,'x',ks.x0,ks.x0,ks.z0,ks.z1,baseY+0.06,'holz'); bruestungSeg(g,'x',ks.x1,ks.x1,ks.z0,ks.z1,baseY+0.06,'holz'); }   // SIA-BRÜSTUNGS-GESETZ ums Kellermaul — EIN Gesetz statt Ad-hoc-railSeg, Antritt vorn frei
    else rect(baseY+0.03,-Wi,Wi,-Di,Di,'stein');                                  // EG-Boden (voll)
    // Geschossboden mit Treppenloch + 3-seitiger Brüstung (Austritt nach +z offen)
    const floorWithStair=(yT,op)=>{ levelTop=yT;
      rect(yT+0.02,-Wi,wx0,-Di,Di,'boden'); rect(yT+0.02,wx1,Wi,-Di,Di,'boden');
      rect(yT+0.02,wx0,wx1,-Di,stZ0,'boden'); rect(yT+0.02,wx0,wx1,wz1,Di,'boden');     // Loch = Lauflinie, vorderes + hinteres Podest
      const hcz=(stZ0+wz1)/2;
      if(!op.front) railSeg(wx0,stZ0,wx1,stZ0,0,hcz);                                   // Brüstung nur wo KEIN Lauf an-/austritt
      if(!op.back)  railSeg(wx0,wz1,wx1,wz1,0,hcz);
      railSeg(wx0,stZ0,wx0,wz1,0,hcz); railSeg(wx1,stZ0,wx1,wz1,0,hcz); };               // Seiten immer gesichert (Schacht→Lane)
    for(let k=1;k<levels.length;k++) floorWithStair(levels[k].y, levelOpen[k]);          // jedes OG mit Podest-Kehre
    // ── Dachboden (Estrich) auf eaveY: VOLL begehbar; niedriger Traufkopfraum = real ──
    if(levels.length===1){ if(hasAttic) floorWithStair(eaveY,{front:false,back:true}); else rect(eaveY-0.05,-Wi,Wi,-Di,Di,'boden'); }   // Estrich nur bei nutzbarem Dachraum; flaches Dach → geschlossene Decke
    else if(!LOFT){ rect(eaveY-0.05,-Wi,Wi,-Di,Di,'boden'); }                                          // flaches Dach, ≥2 Geschosse: geschlossene Estrich-Decke, kein Speicherloch/Kniestock
    else { levelTop=eaveY; const L=LOFT;                                     // Estrich voll minus Loch der Speichertreppe (LOFT)
      rect(eaveY-0.05,-Wi,L.x0,-Di,Di,'boden'); rect(eaveY-0.05,L.x1,Wi,-Di,Di,'boden');
      rect(eaveY-0.05,L.x0,L.x1,-Di,L.z0,'boden'); rect(eaveY-0.05,L.x0,L.x1,L.z1,Di,'boden');
      const hclx=(L.x0+L.x1)/2,hclz=(L.z0+L.z1)/2; railSeg(L.x0,L.z1,L.x1,L.z1,hclx,hclz); railSeg(L.x0,L.z0,L.x0,L.z1,undefined,hclz); railSeg(L.x1,L.z0,L.x1,L.z1,undefined,hclz);
      // ── KNIESTOCK (Drempelwand) bei ±zBandTop: Barriere zum niedrigen Traufkopfraum → Spieler bleibt im Stehraum ≥1.9 m (schliesst den Trauf-Anstoss); Lücke an der Speichertreppenspur ──
      [-zBandTop,zBandTop].forEach(zc=>{ if(!(Math.abs(zc)>0.6&&Math.abs(zc)<Di-0.3))return; const kH=1.15,y0=eaveY,yc=y0+kH/2, crosses=(zc>L.z0-0.3&&zc<L.z1+0.3);
        (crosses?[[-Wi,L.x0-0.1],[L.x1+0.1,Wi]]:[[-Wi,Wi]]).forEach(([x0,x1])=>{ if(x1-x0<0.3)return; const xc=(x0+x1)/2,len=x1-x0;
          beam(g,xc,y0+0.05,zc,len,0.08,0.12,'holz'); beam(g,xc,y0+kH,zc,len,0.10,0.12,'holz'); beam(g,xc,yc,zc,len,kH-0.22,0.06,'lehm');
          for(let x=x0+0.12;x<=x1-0.1;x+=1.0)beam(g,x,yc,zc,0.10,kH,0.10,'holz'); addSolid(xc,yc,zc,len,kH,0.14,'kniestock'); }); }); }   // 3-seitig; Seiten-Brüstung OHNE Innenversatz → Austritt (-z) bleibt frei für Körper
    return g; }

  function bohle(g,cx,cy,cz,w,h,horiz,role){ const nb=Math.max(3,Math.round(w/0.22));
    for(let i=0;i<nb;i++){const u=-w/2+(i+0.5)*w/nb; if(horiz)beam(g,cx+u,cy,cz,w/nb*0.92,h,0.05,role); else beam(g,cx,cy,cz+u,0.05,h,w/nb*0.92,role);}
    if(horiz){beam(g,cx,cy+h*0.32,cz,w,0.12,0.06,role);beam(g,cx,cy-h*0.32,cz,w,0.12,0.06,role);} else {beam(g,cx,cy+h*0.32,cz,0.06,0.12,w,role);beam(g,cx,cy-h*0.32,cz,0.06,0.12,w,role);} }

  function innenwaende(){const g=grp(); if(ROUND)return g; const t=0.12,dW=1.0,dH=2.0; let curK=0;
    const seg=(h,f,a0,a1,hh,y0)=>{ if(a1-a0<0.05)return; const ac=(a0+a1)/2,al=a1-a0; if(h){beam(g,ac,y0+hh/2,f,al,hh,t,'gefach');addSolid(ac,y0+hh/2,f,al,hh,t);} else {beam(g,f,y0+hh/2,ac,t,hh,al,'gefach');addSolid(f,y0+hh/2,ac,t,hh,al);} };
    const door=(h,f,c,y0,hh)=>{ const lw=dW-0.08,lh=dH-0.08,openA=h?1.4:1.4*Math.sign(f||1),yT=y0+dH+0.12,yB=y0+hh,yc=(yT+yB)/2,yh=yB-yT; let lg,block;
      if(h){ beam(g,c-dW/2,y0+dH/2,f,0.1,dH,t+0.02,'holz');beam(g,c+dW/2,y0+dH/2,f,0.1,dH,t+0.02,'holz');beam(g,c,y0+dH+0.06,f,dW+0.2,0.12,t+0.02,'holz');
        if(yh>0.05){beam(g,c,yc,f,dW+0.2,yh,t,'gefach');addSolid(c,yc,f,dW+0.2,yh,t);} lg=grp(); bohle(lg,lw/2,y0+dH/2,0,lw,lh,true,'holz'); lg.position.set(...deform(c-dW/2+0.04,0,f)); block=[c-dW/2,y0,f-0.08,c+dW/2,y0+dH,f+0.08]; }
      else { beam(g,f,y0+dH/2,c-dW/2,t+0.02,dH,0.1,'holz');beam(g,f,y0+dH/2,c+dW/2,t+0.02,dH,0.1,'holz');beam(g,f,y0+dH+0.06,c,t+0.02,0.12,dW+0.2,'holz');
        if(yh>0.05){beam(g,f,yc,c,t,yh,dW+0.2,'gefach');addSolid(f,yc,c,t,yh,dW+0.2);} lg=grp(); bohle(lg,0,y0+dH/2,lw/2,lw,lh,false,'holz'); lg.position.set(...deform(f,0,c-dW/2+0.04)); block=[f-0.08,y0,c-dW/2,f+0.08,y0+dH,c+dW/2]; }
      lg.rotation.y=openA; lg.userData={door:true,preOpen:true,openA,block}; g.add(lg);
      if(h) addCircR(c-dW/2, f-0.8, c+dW/2, f+0.8, curK,'tür'); else addCircR(f-0.8, c-dW/2, f+0.8, c+dW/2, curK,'tür'); };   // Türschwung = volle Blattlänge ~0.8 m → kein Möbel im Schwenkbereich
    const wallZ=(x,z0,z1,ds,hh,y0)=>{ const cz=(!modern && Math.abs(x-hearthX)<0.85)?[hearthZ-0.65,hearthZ+0.65]:null;   // GESETZ (Synergie): Kaminfeld = Wandlücke (der Stein steht dort), keine Tür hinein — Innenwand liest dieselbe Kamin-Quelle wie die Fenster
      const ops=[]; ds.forEach(d=>{ if(cz && d>=cz[0]-dW/2 && d<=cz[1]+dW/2)return; ops.push({a:d-dW/2,b:d+dW/2,c:d,door:true}); });
      if(cz)ops.push({a:cz[0],b:cz[1],door:false}); ops.sort((p,q)=>p.a-q.a); let z=z0;
      ops.forEach(o=>{ seg(false,x,z,Math.max(z,o.a),hh,y0); if(o.door)door(false,x,o.c,y0,hh); z=Math.max(z,o.b); }); seg(false,x,z,z1,hh,y0); };
    const wallX=(z,x0,x1,ds,hh,y0)=>{ const cs=ds.map(d=>[d-dW/2,d+dW/2]).sort((a,b)=>a[0]-b[0]); let x=x0; cs.forEach(([a,b])=>{seg(true,z,x,a,hh,y0);door(true,z,(a+b)/2,y0,hh);x=b;}); seg(true,z,x,x1,hh,y0); };
    levels.forEach((L,k)=>{ curK=k; const hh=L.h-0.05, y0=L.y; const lay=layout[k];
      [['L',-fw,lay.L,-W/2+0.1],['R',fw,lay.R,W/2-0.1]].forEach(([side,xf,s,xOut])=>{
        const zs=[zMinI,...s.cuts,zMaxI]; const centers=[];
        for(let i=0;i<zs.length-1;i++){ if(zs[i+1]-zs[i]>=1.2) centers.push((zs[i]+zs[i+1])/2); }
        wallZ(xf,-Dp/2+0.1,Dp/2-0.1,centers,hh,y0);                              // Flurwand: je Raum eine Tür
        s.cuts.forEach(zc=>wallX(zc,Math.min(xf,xOut),Math.max(xf,xOut),[],hh,y0)); }); }); // Querwände (Vollwand)
    return g; }

  function herd(){const g=grp(); if(ROUND||P.kuppel){chimney=null;return g;} if(modern){ chimney=null; return g; }   // KAMIN-GESETZ (Realität): Rücken an der Giebelwand · Feuerraum mit Wangen+Sturz · SIMS · verjüngter Rauchsammler · VERWAHRUNG am Dachdurchgang · Kopfplatte
    const hx=hearthX, hz=hearthZ, nx=hearthNX, bD=hearthBD, bW=hearthBW, bH=1.0, fO=hx+nx*(bD/2);
    beam(g,hx,baseY+bH/2,hz,bD,bH,bW,'stein'); addSolid(hx,baseY+bH/2,hz,bD,bH,bW);
    [-1,1].forEach(s5=>beam(g,fO-nx*0.10,baseY+0.40,hz+s5*(bW/2-0.14),0.20,0.80,0.24,'stein'));
    beam(g,fO-nx*0.10,baseY+0.86,hz,0.20,0.16,bW-0.20,'stein');
    beam(g,fO-nx*0.05,baseY+0.42,hz,0.10,0.66,bW-0.62,'dunkel'); beam(g,fO-nx*0.16,baseY+0.14,hz,0.30,0.22,0.7,'feuer');
    beam(g,hx+nx*0.10,baseY+bH+0.05,hz,bD+0.26,0.10,bW+0.30,'holz');
    beam(g,hx,baseY+bH+0.45,hz,bD*0.78,0.80,bW*0.72,'stein'); beam(g,hx,baseY+bH+1.05,hz,bD*0.62,0.55,bW*0.5,'stein');
    const top=ridgeY+0.9; beam(g,hx,(baseY+bH+1.3+top)/2,hz,STACK_W*0.83,top-(baseY+bH+1.3),STACK_W*0.83,'stein'); addSolid(hx,(baseY+bH+1.3+top)/2,hz,STACK_W*0.83,top-(baseY+bH+1.3),STACK_W*0.83);
    { const sk=roofSkinY(hx,hz); beam(g,hx,sk+0.10,hz,STACK_W*0.83+0.22,0.16,STACK_W*0.83+0.22,'dunkel'); }
    beam(g,hx,top,hz,STACK_W,0.12,STACK_W,'stein'); beam(g,hx,top+0.10,hz,STACK_W+0.14,0.08,STACK_W+0.14,'stein');
    [-1,1].forEach(s5=>beam(g,hx+s5*(STACK_W/2+0.02),top+0.20,hz,0.10,0.12,STACK_W*0.9,'ziegel'));
    chimney=aabb(hx,(levels[0].top+top)/2,hz,STACK_W,top-levels[0].top,STACK_W); return g; }
  function treppe(){const g=grp(); if(ROUND)return g;
    const flight=(y0,xL,xR,zStart,dir,N,rise,go,w,wandS)=>{ const xc=(xL+xR)/2;
      for(let i=0;i<N;i++){ const z=zStart+dir*(i+0.5)*go, y=y0+(i+1)*rise;
        beam(g,xc,y-0.03,z,w,0.06,go*1.02,'boden');                        // Trittstufe (Auftritt = go)
        beam(g,xc,y-rise/2,z-dir*go/2,w,rise,0.04,'boden');                // Setzstufe (Steigung = rise)
        addSolid(xc,y-0.06,z,w,0.12,go*1.02,'stufe'); }
      const zA=zStart, zB=zStart+dir*N*go, yB=y0+N*rise;
      [xL,xR].forEach(xo=>{ const isW=(wandS===-1&&xo===xL)||(wandS===1&&xo===xR), sgn=(xo===xL?-1:1);   // TREPPENSEITEN-GESETZ: Spur-Innenkante = Wandseite (Handlauf), Lane-Kante = Absturz (Geländer)
        strut(g,xo,y0-0.08,zA, xo,yB-0.08,zB,0.1,'holz');                              // Wange (beidseitig, tragend — Statik kennt keine Seiten)
        const ha=Math.max(y0+0.15,Math.min(y0+0.95,roofUnderY(xo,zA)-0.06)), hb=Math.max(yB+0.15,Math.min(yB+0.95,roofUnderY(xo,zB)-0.06));   // METAGESETZ + Puffer: Handlauf nie durch die Haut, nie invertiert
        if(ha>y0+0.10&&hb>y0+0.10){ strut(g,xo,ha,zA, xo,hb,zB,0.06,'holz');           // Handlauf — METAGESETZ: unter die Dachhaut gekappt
          if(isW){ for(let i=0;i<N;i+=3){ const z=zStart+dir*(i+0.5)*go, hy=ha+(hb-ha)*((z-zA)/((zB-zA)||1));   // WAND-HANDLAUF: Konsolen alle 3 Tritte statt Stab-Batterie
              beam(g,xo,hy-0.10,z,0.03,0.14,0.03,'dunkel'); beam(g,xo+sgn*0.035,hy-0.155,z,0.07,0.03,0.03,'dunkel'); }
            [[zA,ha,-1],[zB,hb,1]].forEach(([ze,he,s])=>{ if(he<roofUnderY(xo,ze+s*dir*0.25)-0.06){   // SIA-AUSLAUF: Handlauf läuft 25 cm horizontal über Antritt/Austritt hinaus
              beam(g,xo,he,ze+s*dir*0.125,0.06,0.06,0.25,'holz'); beam(g,xo,he-0.10,ze+s*dir*0.25,0.03,0.14,0.03,'dunkel'); } }); } } });
      for(let i=0;i<N;i++){ const z=zStart+dir*(i+0.5)*go, y=y0+(i+1)*rise;
        [xL,xR].forEach(xo=>{ if((wandS===-1&&xo===xL)||(wandS===1&&xo===xR))return;   // Wandseite: keine Stab-Batterie (TREPPENSEITEN-GESETZ)
          const top=Math.min(y+0.91,roofUnderY(xo,z)), h=Math.max(0.05,Math.min(top,roofUnderY(xo,z)-0.06)-(y-0.01));
          if(h>0.12) beam(g,xo,(y-0.01+top)/2,z,0.04,h,0.04,'holz'); }); }            // Geländerstäbe — nur Absturzseite, gekappt
      [[zA,y0],[zB,yB]].forEach(([z,yb])=>[xL,xR].forEach(xo=>{ if((wandS===-1&&xo===xL)||(wandS===1&&xo===xR))return;   // Pfosten gehören zum Geländer → nur Absturzseite
        const top=Math.min(yb+1.0,roofUnderY(xo,z)-0.06), h=Math.max(0.05,top-yb);
        if(h>0.15) beam(g,xo,yb+h/2,z,0.07,h,0.07,'holz'); })); };                     // Antritts-/Austrittspfosten — gekappt
    const beideSpuren=new Set(flights.map(f=>f.tr)).size>1;                           // TREPPENSEITEN-GESETZ: erst wenn BEIDE Spuren belegt sind, existiert eine Spindel-/Wandseite — Einzelspur bleibt beidseitig gesichert
    flights.forEach(f=>{ const w=(f.x1-f.x0)-(f.isLoft?0.10:0.06), xl=f.x0+(f.isLoft?0.04:0.03), xr=f.x1-(f.isLoft?0.04:0.03);
      flight(f.base, xl, xr, f.zFoot, f.dir, f.N, f.rise, f.go, w, beideSpuren?(f.tr==='L'?1:-1):0); });   // Wandseite = Spur-Innenkante (L-Spur→x1, R-Spur→x0)
    return g; }

  // Kassetten-Türflügel (zentriert am Ursprung) — für die Haustür
  function leafFrame(w,h,role,extSign){ const lf=grp(); const sw=0.12,t=0.05; const e=extSign||1;   // e = welche lokale z-Seite die SCHAUSEITE (Kassetten) trägt (+1 = +z, −1 = −z)
    beam(lf,0,0,0,w,h,0.05,role);                                                             // massiver Kern (kein Durchblick), zentriert
    beam(lf,-w/2+sw/2,0,e*0.018,sw,h,t,role); beam(lf,w/2-sw/2,0,e*0.018,sw,h,t,role);        // Stiele (auf der Schauseite vorstehend)
    beam(lf,0,h/2-sw/2,e*0.018,w,sw,t,role); beam(lf,0,-h/2+sw/2,e*0.018,w,sw,t,role); beam(lf,0,h*0.06,e*0.018,w,sw,t,role); // Riegel
    const piw=w-2*sw, upH=h*0.40, loH=h*0.30;
    beam(lf,0,h*0.27,e*0.030,piw*0.82,upH*0.84,0.028,role); beam(lf,0,-h*0.30,e*0.030,piw*0.82,loH*0.84,0.028,role);        // erhabene Kassetten (Schauseite)
    return lf; }
  function tueren(){const g=grp(); if(ROUND)return g; const z=-Dp/2+0.07, lw=doorW/2-0.03, lh=doorH-0.08, cy=baseY+doorH/2, openA=1.15, openB=1.05;
    beam(g,-doorW/2-0.06,cy,-Dp/2,0.14,doorH+0.12,0.26,'holz'); beam(g,doorW/2+0.06,cy,-Dp/2,0.14,doorH+0.12,0.26,'holz'); // Türstock
    beam(g,0,baseY+doorH+0.05,-Dp/2,doorW+0.36,0.16,0.26,'holz'); if(P.bogenTyp&&P.bogenTyp!=='none')bogenRahmen(g,0,baseY+doorH+0.13,-Dp/2,doorW*0.62,true,P.bogenTyp,'holz');                                                          // Sturz
    const olY0=baseY+doorH+0.13, olY1=Math.min(baseY+P.egH-P.raehm-0.02,olY0+0.42), olH=olY1-olY0;                            // Oberlicht
    if(olH>0.12){ beam(g,0,olY0,-Dp/2,doorW+0.22,0.08,0.24,'holz');
      beam(g,0,(olY0+olY1)/2,-Dp/2+0.03,doorW,olH,0.035,'glas');
      for(let i=-1;i<=1;i++)beam(g,i*doorW/3,(olY0+olY1)/2,-Dp/2+0.01,0.04,olH,0.07,'holz');
      beam(g,0,olY1,-Dp/2,doorW+0.22,0.07,0.24,'holz'); }
    const yHiEG=baseY+P.egH-P.raehm; if(yHiEG-(olY0+0.42)>0.05) beam(g,0,(Math.min(olY0+0.42,yHiEG)+yHiEG)/2,-Dp/2,doorW+0.22,Math.max(0,yHiEG-Math.min(olY0+0.42,yHiEG)),0.07,'gefach'); // Brüstung über Oberlicht
    [[-1,-doorW/2+0.03],[1,doorW/2-0.03]].forEach(([sgn,hx])=>{ const L=grp(); const inner=leafFrame(lw,lh,'holz',-1); inner.position.x=-sgn*lw/2; L.add(inner);  // Schauseite −z = STRASSE (aussen)
      const hex=-sgn*(lw-0.14);                                                                                          // Beschlag an der Schlagkante (gegenüber dem Band)
      beam(L,hex,-lh*0.02,-0.05,0.09,0.09,0.05,'metall');                                                                // AUSSEN: Knauf, bündig auf der Schauseite (−z)
      beam(L,hex,-lh*0.02,0.05,0.04,0.30,0.045,'metall'); beam(L,hex+0.02,-lh*0.10,0.062,0.11,0.045,0.045,'metall');     // INNEN: Drücker-Stange + Griff, bündig (+z)
      L.position.set(...deform(hx,cy,z)); L.rotation.y=(P.doorClosed?0:-sgn*openA)+(DEF_bk>0?hx*DEF_bk:0);                                                  // GESETZ: Haustür schwingt nach AUSSEN (über die Eingangstreppe) → Innenflur zur Treppe bleibt frei
      L.userData={door:true,preOpen:(!P.doorClosed),openA:-sgn*openA,block:sgn<0?[-doorW/2,baseY,-Dp/2-0.1,0,baseY+doorH,-Dp/2+0.1]:[0,baseY,-Dp/2-0.1,doorW/2,baseY+doorH,-Dp/2+0.1]}; g.add(L); });
    beam(g,0,baseY-0.02,-Dp/2+0.04,doorW+0.2,0.06,0.32,'stein');                                                            // Schwelle
    if(!P.veranda&&!P.portikus)aussentreppe(g,0,-Dp/2,0,-1,doorW);                                                                                     // Haustür-Treppe (vorne) — geteiltes Gesetz
    if(backDoor){ const bw2=Math.min(1.0,backDoor.hi-backDoor.lo-0.2), bcx=backDoor.cx, blh=doorH-0.12, bcy=baseY+blh/2, bz=Dp/2-0.07;  // Hintertür
      beam(g,bcx-bw2/2-0.06,bcy,Dp/2,0.13,doorH+0.06,0.24,'holz'); beam(g,bcx+bw2/2+0.06,bcy,Dp/2,0.13,doorH+0.06,0.24,'holz');     // Stock
      beam(g,bcx,baseY+doorH+0.0,Dp/2,bw2+0.32,0.14,0.24,'holz');                                                                  // Sturz
      const L=grp(); const inner=leafFrame(bw2-0.04,blh,'holz',+1); inner.position.x=(bw2-0.04)/2; L.add(inner);   // Schauseite +z = aussen (Rückseite Haus)
      beam(L,bw2-0.18,0,0.07,0.05,0.05,0.06,'metall'); beam(L,bw2-0.18,blh*0.10,-0.05,0.04,0.26,0.045,'metall');   // aussen Knauf bündig am Blatt (+z) · innen Drücker (−z) — kein schwebender Würfel mehr
      L.position.set(...deform(bcx-(bw2-0.04)/2,bcy,bz)); L.rotation.y=(P.doorClosed?0:-openB)+(DEF_bk>0?(bcx-(bw2-0.04)/2)*DEF_bk:0);
      L.userData={door:true,preOpen:(!P.doorClosed),openA:-openB,block:[bcx-bw2/2,baseY,Dp/2-0.1,bcx+bw2/2,baseY+doorH,Dp/2+0.1]}; g.add(L);
      beam(g,bcx,baseY-0.02,Dp/2-0.04,bw2+0.2,0.06,0.3,'stein');                                                                   // Schwelle
      aussentreppe(g,bcx,Dp/2,0,1,bw2); }                                                                                          // Hintertür-Treppe — GLEICHES Gesetz wie vorne
    addCircR(-doorW/2-0.1,-Dp/2+0.05,doorW/2+0.1,-Dp/2+1.05,0,'haustür');                                                          // Haustür-Schwung (Flur)
    if(backDoor) addCircR(backDoor.cx-0.55,Dp/2-1.05,backDoor.cx+0.55,Dp/2-0.05,0,'hintertür');                                     // Hintertür-Schwung
    return g; }

  function windowSash(w,h,horiz,role){ const sg=grp(); const sw=0.06,t=0.05;
    if(horiz){ beam(sg,-w/2+sw/2,0,0,sw,h,t,role); beam(sg,w/2-sw/2,0,0,sw,h,t,role);
      beam(sg,0,h/2-sw/2,0,w,sw,t,role); beam(sg,0,-h/2+sw/2,0,w,sw,t,role);
      beam(sg,0,0,0,0.04,h,0.045,role); beam(sg,0,0,0,w,0.04,0.045,role); beam(sg,0,0,-0.012,w-2*sw,h-2*sw,0.025,'glas');
    } else { beam(sg,0,0,-w/2+sw/2,t,h,sw,role); beam(sg,0,0,w/2-sw/2,t,h,sw,role);
      beam(sg,0,h/2-sw/2,0,t,sw,w,role); beam(sg,0,-h/2+sw/2,0,t,sw,w,role);
      beam(sg,0,0,0,0.045,h,0.04,role); beam(sg,0,0,0,0.045,0.04,w,role); beam(sg,-0.012,0,0,0.025,h-2*sw,w-2*sw,'glas'); }
    return sg; }
  function bogenRahmen(g,cx,yS,cz,R,horiz,typ,role){   // BOGEN-GESETZ über jeder Öffnung (rund/spitz/hufeisen) — dieselbe Kurve wie die Arkade, ein Vektor
    const N=10, dp=0.42, deeper=0.14; for(let i=0;i<N;i++){ const t=i/(N-1), a=Math.PI*t; let lat=-R*Math.cos(a), off=R*Math.sin(a);
      if(typ==='spitz'){ off=R*Math.sin(a)+0.62*R*Math.sin(a)*(1-Math.abs(Math.cos(a))); lat=-R*Math.cos(a)*(1-0.16*Math.sin(a)); }
      if(typ==='hufeisen'){ if(t<0.14||t>0.86) lat+=(t<0.5?1:-1)*0.2*R; }
      const rot=a-Math.PI/2, oz=(cz<0?-deeper:deeper), ox=(cx<0?-deeper:deeper); if(horiz) beam(g,cx+lat,yS+off,cz+oz,0.30,0.19,dp,role,[0,0,rot]); else beam(g,cx+ox,yS+off,cz+lat,dp,0.19,0.30,role,[rot,0,0]); } }
  function fensterAt(g,cx,cy,cz,w,h,horiz,capY){ const fr='holz', _cap=(capY!=null?capY:Math.min(roofUnderY(cx,cz),roofUnderY(cx+(horiz?0.22:0),cz+(horiz?0.22:0))));   // BOGEN-DECKEL-GESETZ: lokale Dachgrenze schlägt Hauptdach; Doppel-Sample gegen Randfälle
    if(horiz){ beam(g,cx,cy+h/2+0.05,cz,w+0.2,0.1,0.18,fr); if(P.bogenTyp&&P.bogenTyp!=='none' && (cy+h/2+0.12+w*0.58)<_cap-0.10)bogenRahmen(g,cx,cy+h/2+0.12,cz,w*0.58,true,P.bogenTyp,fr); beam(g,cx,cy-h/2-0.05,cz,w+0.22,0.1,0.24,fr);     // Sturz + Fensterbank
      beam(g,cx-w/2-0.05,cy,cz,0.1,h+0.1,0.18,fr); beam(g,cx+w/2+0.05,cy,cz,0.1,h+0.1,0.18,fr);              // Pfosten
      const L=grp(); const inner=windowSash(w,h,true,fr); inner.position.x=w/2; L.add(inner);
      L.position.set(...deform(cx-w/2,cy,cz)); L.rotation.y=(cz<0?0.62:-0.62)+(DEF_bk>0?(cx-w/2)*DEF_bk:0); L.userData={window:true,openA:L.rotation.y}; g.add(L);
    } else { beam(g,cx,cy+h/2+0.05,cz,0.18,0.1,w+0.2,fr); if(P.bogenTyp&&P.bogenTyp!=='none' && (cy+h/2+0.12+w*0.58)<_cap-0.10)bogenRahmen(g,cx,cy+h/2+0.12,cz,w*0.58,false,P.bogenTyp,fr); beam(g,cx,cy-h/2-0.05,cz,0.24,0.1,w+0.22,fr);
      beam(g,cx,cy,cz-w/2-0.05,0.18,h+0.1,0.1,fr); beam(g,cx,cy,cz+w/2+0.05,0.18,h+0.1,0.1,fr);
      const L=grp(); const inner=windowSash(w,h,false,fr); inner.position.z=w/2; L.add(inner);
      L.position.set(...deform(cx,cy,cz-w/2)); L.rotation.y=(cx<0?-0.62:0.62)+(DEF_bk>0?cx*DEF_bk:0); L.userData={window:true,openA:L.rotation.y}; g.add(L); } }
  function fenster(){const g=grp(); if(ROUND)return g; WALLS.forEach(w=>{ if(!w.win)return; const wd=winW(w),c=(w.lo+w.hi)/2; fensterAt(g,w.horiz?c:w.fixed,w.win.cy,w.horiz?w.fixed:c,wd,w.win.ch,w.horiz); });
    if(P.stil==='stein' && P.pitchDeg>=45){ WALLS.forEach(w=>{ if(!w.win||!w.horiz||w.fixed>0)return; if(w.win.cy < levels[0].top+0.3)return;   // ════ FRANZÖSISCHER BALKON (Juliette): schmiedeeiserne Brüstung vor OG-Vorderfenstern (Putz/Stein FR/IT) ════
      const c=(w.lo+w.hi)/2, wd=winW(w), zf=w.fixed, y0=w.win.cy-w.win.ch/2-0.05, rH=1.0, zr=zf-0.20, rW=wd+0.5;
      beam(g,c,y0+rH,zr,rW,0.06,0.05,'metall'); beam(g,c,y0+0.10,zr,rW,0.05,0.05,'metall');   // Handlauf + Fussschiene
      const nb=Math.max(3,Math.round(rW/0.16)); for(let i=0;i<=nb;i++)beam(g,c-rW/2+i*rW/nb,y0+rH/2,zr,0.025,rH,0.025,'metall');
      [-1,1].forEach(s=>beam(g,c+s*rW/2,y0+rH/2,zf-0.10,0.05,rH,0.20,'metall')); }); }   // seitliche Konsolen an die Wand
    return g; }   // Giebel-Spitzfenster wird bündig in giebel() gebaut (mit echter Backstein-Aussparung)

  function moebel(){const g=grp(); if(ROUND)return g;
    const jit=(v,f)=>v*(1+(rndI()-0.5)*2*(f==null?0.12:f));                                          // Seed-Jitter ±f
    const pick=arr=>arr[(rndI()*arr.length)|0];                                                      // Seed-Form-Wahl
    const B=(r,x,y,z,lx,ly,lz,rot)=>beam(g,x,y,z,lx,ly,lz,r,rot);
    // ── Kleinkram auf Flächen (rein dekorativ, keine Kollision) ──
    const clutterOn=(cx,topY,cz,hw,hd,n)=>{ const used=[];
      for(let i=0;i<n;i++){ const k=(rndI()*6)|0; let ox,oz,t=0;
        do{ ox=(rndI()-0.5)*2*hw*0.72; oz=(rndI()-0.5)*2*hd*0.64; t++; }while(used.some(u=>Math.hypot(u[0]-ox,u[1]-oz)<0.17)&&t<6); used.push([ox,oz]);
        const x=cx+ox, z=cz+oz;
        if(k===0){ B('dunkel',x,topY+0.08,z,0.085,0.16,0.085); B('dunkel',x,topY+0.17,z,0.05,0.035,0.05); }              // Krug
        else if(k===1){ B('dunkel',x,topY+0.03,z,0.17,0.05,0.17); }                                                     // Schale
        else if(k===2){ const bn=1+((rndI()*3)|0); for(let b=0;b<bn;b++)B(rndI()<0.5?'moebel':'dunkel',x,topY+0.024+b*0.042,z,0.13+rndI()*0.05,0.038,0.18,[0,rndI()*0.4-0.2,0]); }
        else if(k===3){ B('dunkel',x,topY+0.055,z,0.05,0.11,0.05); B('feuer',x,topY+0.125,z,0.022,0.04,0.022); }        // Kerze
        else if(k===4){ B('moebel',x,topY+0.065,z,0.135,0.13,0.135); B('dunkel',x,topY+0.135,z,0.10,0.02,0.10); }       // Topf
        else { B('holz',x,topY+0.085,z,0.17,0.17,0.17); } } };                                                          // Korb
    // ── gemeinsame Bauteile: gedrechseltes Bein, Zarge, Rahmen-Füllung-Tür, Schublade ──
    const legAt=(x,y,z,h,r,role)=>{ role=role||'moebel'; B(role,x,y+h/2,z,r,h,r); B('dunkel',x,y+h*0.16,z,r*1.25,r*0.5,r*1.25); B('dunkel',x,y+h*0.84,z,r*1.2,r*0.45,r*1.2); }; // Bein mit zwei Drechselringen
    const apron=(cx,y,cz,w,d,role)=>{ role=role||'moebel'; const t=0.05,h=0.10;                       // Zarge (Schürze) unter der Platte — verbindet die Beine, das fehlte
      B(role,cx,y,cz-d/2,w,h,t); B(role,cx,y,cz+d/2,w,h,t); B(role,cx-w/2,y,cz,t,h,d); B(role,cx+w/2,y,cz,t,h,d); };
    const panelDoor=(g2,w,h,role)=>{ role=role||'moebel'; const fr=0.06,t=0.04;                       // Rahmen-Füllungs-Tür (nicht flach): umlaufender Rahmen + vertiefte Füllung
      B(role,0,0,0,w,fr,t); B(role,0,h-fr,0,w,fr,t); B(role,fr/2,h/2,0,fr,h,t); B(role,w-fr/2,h/2,0,fr,h,t); B(role,w/2,h/2,-t*0.4,w-2*fr,h-2*fr,t*0.6); };
    // ════ MATERIALGESETZ — Form EMERGIERT aus Material × Funktion × Proportion (kein Form-pick mehr) ════
    const HOLZ={ weich:{spanMax:0.78, legK:1.20, slim:0, acc:'dunkel'},   // Weichholz (Fichte/Kiefer): geringere Festigkeit → dickere Beine, kürzere freie Spannweite, flache Brettlehnen
                 hart :{spanMax:1.12, legK:0.84, slim:1, acc:'dunkel'} };  // Hartholz (Eiche/Buche): höhere Festigkeit → schlanke Beine, weite Spannweite, gedrechselte Sprossen, Pfosten
    const woodFor=(x,z)=> ((Math.abs(Math.round((x*5.7+z*3.1)))%2)===0 ? HOLZ.hart : HOLZ.weich);   // deterministisch je Standort → beide Hölzer im Haus
    const F={
      // ════ TISCH — drei echte Formen: Bock · Vierbein-mit-Zarge · Säule ════
      // ════ TISCH — Form EMERGIERT: klein&gedrungen→Säule · lang&schmal→Bock · sonst Vierbein (Beinzahl aus Spannweite, Steg aus Schlankheit) ════
      tisch:(x,y,z,vert,nx,nz,S)=>{ S=S||{}; const len=S.L||1.4, dep=S.W||0.85, w=vert?dep:len, d=vert?len:dep, topY=y+0.74;
        const M=woodFor(x,z), aspect=Math.max(len,dep)/Math.min(len,dep), area=len*dep, legR=0.056*M.legK*(1+area*0.14);   // Beinquerschnitt aus Last(Fläche)+Material
        B('moebel',x,topY,z,w,0.055,d); B(M.acc,x,topY-0.035,z,w*0.99,0.02,d*0.99);                                        // Platte + Schattenfuge
        if(len<1.04 && dep<0.94){                                                                                          // PROPORTION klein&gedrungen → Säulentisch (Kreuzfuss trägt kleine Fläche)
          B('moebel',x,y+0.38,z,legR*2.4,0.70,legR*2.4); B(M.acc,x,y+0.20,z,legR*3.2,0.10,legR*3.2);
          [[-1,0],[1,0],[0,-1],[0,1]].forEach(([sx,sz])=>B('moebel',x+sx*w*0.22,y+0.05,z+sz*d*0.22,sx?w*0.5:0.10,0.09,sz?d*0.5:0.10)); }
        else if(aspect>=2.0){                                                                                              // PROPORTION lang&schmal → Bock (Wangen + durchgehender Steg)
          const along=(w>=d), hw=along?w:d;
          [-1,1].forEach(s=>{ const c=s*(hw/2-0.13); if(along){ B('moebel',x+c,y+0.36,z,0.07,0.72,d*0.82); B('moebel',x+c,y+0.06,z,0.10,0.08,d*0.92); } else { B('moebel',x,y+0.36,z+c,w*0.82,0.72,0.07); B('moebel',x,y+0.06,z+c,w*0.92,0.08,0.10); } });
          if(along)B('moebel',x,y+0.30,z,w-0.30,0.07,0.10); else B('moebel',x,y+0.30,z,0.10,0.07,d-0.30); }
        else {                                                                                                             // Mittelfeld → Vierbein; Stützstellen WACHSEN mit Spannweite/Material, Steg nur bei schlanken Beinen
          const npx=Math.max(2,Math.ceil((w-0.2)/M.spanMax)), npz=Math.max(2,Math.ceil((d-0.2)/M.spanMax));
          const xs=[],zs=[]; for(let i=0;i<npx;i++)xs.push(-w/2+0.1+i*(w-0.2)/(npx-1)); for(let j=0;j<npz;j++)zs.push(-d/2+0.1+j*(d-0.2)/(npz-1));
          xs.forEach(ox=>zs.forEach(oz=>{ if(npx>2&&npz>2 && ox!==xs[0]&&ox!==xs[npx-1] && oz!==zs[0]&&oz!==zs[npz-1])return; legAt(x+ox,y,z+oz,0.70,legR); }));   // Perimeter (+Mittelbeine nur wenn beide Achsen teilen)
          apron(x,y+0.62,z,w-0.16,d-0.16);                                                                                 // Zarge versteift die Platte
          const slender=0.70/legR; if(slender>11.3){ const xL=xs[0],xR=xs[xs.length-1],zo=zs[zs.length-1];   // MATERIAL: H-Steg nur bei schlanken (Hart-)Beinen — Längsholme AN den Beinreihen + Mittelholm verbindet sie (kein schwebendes Kreuz)
            [xL,xR].forEach(ox=>B('moebel',x+ox,y+0.17,z,0.05,0.045,2*zo)); B('moebel',x,y+0.17,z,xR-xL,0.045,0.05); } }
        clutterOn(x,topY+0.03,z,w*0.42,d*0.42,2+((rndI()*3)|0));
        furniture.push(aabb(x,y+0.4,z,w,0.8,d)); return {w,d,topY}; },
      // ════ STUHL — Leiter- oder Sprossenlehne, mit Beinverstrebung ════
      // ════ STUHL — Lehnentyp EMERGIERT aus dem MATERIAL: Hartholz→gedrechselte Sprossen (dünn, tragfähig) · Weichholz→flache Leitersprossen ════
      stuhl:(x,y,z,bx,bz)=>{ const seatY=0.45, M=woodFor(x,z), legR=0.045*M.legK;
        B('moebel',x,seatY,z,0.42,0.05,0.42); B(M.acc,x,seatY-0.03,z,0.40,0.015,0.40);
        [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>B('moebel',x+sx*0.17,seatY/2,z+sz*0.17,legR,seatY,legR));
        B('moebel',x,seatY*0.45,z,0.34,0.038,0.038); B('moebel',x,seatY*0.45,z,0.038,0.038,0.34);                          // H-Strebe (Stabilität)
        const bH=0.42, byc=seatY+bH/2, post=s=>B('moebel',x+bx*0.18+(bz?s*0.17:0),byc,z+bz*0.18+(bx?s*0.17:0),legR,bH,legR); [-1,1].forEach(post);
        if(M.slim>0.5){ const ns=4; for(let i=0;i<ns;i++){ const o=-0.15+i*0.30/(ns-1); B('moebel',x+bx*0.18+(bz?o:0),byc,z+bz*0.18+(bx?o:0),0.026,bH,0.026); } }   // Hartholz: gedrechselte Sprossen
        else { for(let i=0;i<3;i++)B('moebel',x+bx*0.18,seatY+0.10+i*0.14,z+bz*0.18, bx?0.05:0.34,0.05,bz?0.05:0.34); }                                            // Weichholz: flache Leitersprossen
        furniture.push(aabb(x,seatY,z,0.45,0.9,0.45)); },
      hocker:(x,y,z)=>{ B('moebel',x,0.44,z,0.34,0.05,0.34); B('dunkel',x,0.40,z,0.30,0.02,0.30); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{B('moebel',x+sx*0.12,0.22,z+sz*0.12,0.045,0.44,0.045);}); B('moebel',x,0.16,z,0.26,0.03,0.03); B('moebel',x,0.16,z,0.03,0.03,0.26); furniture.push(aabb(x,0.24,z,0.36,0.5,0.36)); },
      // ════ BETT — Pfostenbett oder schlicht, echtes Gestell ════
      bett:(x,y,z,vert,nx,nz,S)=>{ S=S||{}; const len=S.L||1.95, dep=S.W||1.0, w=vert?dep:len, d=vert?len:dep, M=woodFor(x,z);   // MATERIAL bestimmt die Form
        const railY=y+0.30, hEnd=vert?(z-d/2):(x-w/2), fEnd=vert?(z+d/2):(x+w/2);                                          // Kopf-/Fussende   // BODEN-GESETZ: y-relativ (lag absolut 0.30 → 25cm im Boden)
        B('moebel',x,railY,z,w,0.12,d);                                                                                  // Bettkasten/Rahmen
        if(vert){ B('moebel',x,railY,z-d/2,w,0.16,0.07); B('moebel',x,railY,z+d/2,w,0.14,0.07); [-1,1].forEach(s=>B('moebel',x+s*w/2,railY,z,0.07,0.16,d)); }
        else    { B('moebel',x-w/2,railY,z,0.07,0.16,d); B('moebel',x+w/2,railY,z,0.07,0.14,d); [-1,1].forEach(s=>B('moebel',x,railY,z+s*d/2,w,0.16,0.07)); }
        B('gefach',x,railY+0.16,z,w*0.94,0.14,d*0.92);                                                                   // Matratze
        // Kissen + Decke (am Kopfende)
        if(vert){ B('gefach',x,railY+0.27,z-d*0.34,w*0.6,0.10,0.30); B('dunkel',x,railY+0.20,z+d*0.12,w*0.92,0.05,d*0.52); }
        else    { B('gefach',x-w*0.34,railY+0.27,z,0.30,0.10,d*0.6); B('dunkel',x+w*0.12,railY+0.20,z,w*0.52,0.05,d*0.92); }
        const posts=(M.slim>0.5);   // Hartholz → schlanke hohe Pfosten; Weichholz → schlichter niedriger Rahmen
        const corner=(cx,cz,head)=>{ const ph=head?(railY+0.95):(railY+0.45); B('moebel',cx,ph/2,cz,0.09,ph,0.09); if(posts)B('dunkel',cx,ph-0.04,cz,0.12,0.06,0.12); };
        if(vert){ corner(x-w/2,z-d/2,true); corner(x+w/2,z-d/2,true); corner(x-w/2,z+d/2,false); corner(x+w/2,z+d/2,false);
          B('moebel',x,railY+(posts?0.78:0.55),z-d/2,w,posts?0.34:0.30,0.06); if(posts)B('moebel',x,railY+0.40,z+d/2,w,0.22,0.06); }     // Kopf-/Fussbrett
        else    { corner(x-w/2,z-d/2,true); corner(x-w/2,z+d/2,true); corner(x+w/2,z-d/2,false); corner(x+w/2,z+d/2,false);
          B('moebel',x-w/2,railY+(posts?0.78:0.55),z,0.06,posts?0.34:0.30,d); if(posts)B('moebel',x+w/2,railY+0.40,z,0.06,0.22,d); }
        furniture.push(aabb(x,railY+0.2,z,w,0.95,d)); },
      // ════ SCHRANK — Korpus, Sockel, Gesims, ZWEI Rahmen-Füllungs-Türen (öffenbar) ════
      schrank:(x,y,z,vert,nx,nz,S)=>{ S=S||{}; nx=nx||0; nz=nz||0; if(!nx&&!nz)nz=-1; const ax=nx!==0; const H=(S.H||1.85),t=0.05;
        const len=S.L||1.1, dep=S.W||0.52, bw=ax?dep:len, bd=ax?len:dep;
        B('moebel',x,y+H/2,z,bw,H,bd); B('dunkel',x,y+H-0.05,z,bw*1.05,0.08,bd*1.05); B('moebel',x,y+0.06,z,bw*1.04,0.12,bd*1.04);   // Korpus + Gesims + Sockel
        const leafW=(ax?bd:bw)/2-0.012, frontN=ax?nx:nz;                                            // zwei Blätter, treffen sich mittig (keine Lücke mehr)
        for(const s of [-1,1]){ const L=grp(); const dl=grp(); panelDoor(dl,leafW,H*0.82,'moebel');
          if(ax){ dl.rotation.y=Math.PI/2; dl.position.set(0,0,-s*leafW/2); L.position.set(...deform(x+nx*(bw/2)+nx*0.012, y+H*0.55, z+s*(bd/2))); }   // ±x-Front: Blatt in y-z-Ebene, Angel an der Aussenkante z±bd/2, läuft nach innen
          else  { dl.position.set(-s*leafW/2,0,0); L.position.set(...deform(x+s*(bw/2), y+H*0.55, z+nz*(bd/2)+nz*0.012)); }                            // ±z-Front: Angel an x±bw/2
          L.add(dl); L.userData={door:true,axis:'y',openA:frontN*s*1.15,open:false};
          if(ax) beam(L,nx*0.03,0,-s*leafW*0.86,0.045,0.14,0.05,'dunkel'); else beam(L,-s*leafW*0.86,0,nz*0.03,0.05,0.14,0.045,'dunkel');   // Griff an der Schlagkante (Mitte)
          g.add(L); }
        furniture.push(aabb(x,y+H/2,z,bw,H,bd)); },
      // ════ KOMMODE — drei Schubladen mit Rahmen + je zwei Knäufen ════
      kommode:(x,y,z,vert,nx,nz,S)=>{ S=S||{}; const len=S.L||1.05, dep=S.W||0.5, w=vert?dep:len, d=vert?len:dep, H=(S.H||0.82); B('moebel',x,y+H/2,z,w,H,d); B('moebel',x,y+H+0.015,z,w*1.05,0.04,d*1.05);  // Korpus + Deckplatte
        for(let i=0;i<3;i++){ const yy=y+0.16+i*0.235; const fz=vert?(z):(z-d/2-0.012), fx=vert?(x-w/2-0.012):x, dwd=vert?d*0.84:w*0.84, dht=0.19;
          if(vert){ B('dunkel',fx,yy,fz,0.024,dht,dwd); B('dunkel',fx-0.015,yy,fz-dwd*0.22,0.03,0.05,0.05); B('dunkel',fx-0.015,yy,fz+dwd*0.22,0.03,0.05,0.05); }
          else    { B('dunkel',fx,yy,fz,dwd,dht,0.024); B('dunkel',fx-dwd*0.22,yy,fz-0.015,0.05,0.05,0.03); B('dunkel',fx+dwd*0.22,yy,fz-0.015,0.05,0.05,0.03); } }
        [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>B('moebel',x+sx*(w/2-0.05),y+0.05,z+sz*(d/2-0.05),0.06,0.10,0.06));   // kurze Füsse
        if(rndI()<0.7)clutterOn(x,y+H,z,w*0.42,d*0.42,1+((rndI()*2)|0)); furniture.push(aabb(x,y+H/2,z,w,H,d)); },
      // ════ REGAL — Seitenwangen, Rückwand, Böden mit Stützleisten ════
      regal:(x,y,z,vert,nx,nz,S)=>{ S=S||{}; const len=S.L||1.0, dep=S.W||0.34, w=vert?dep:len, d=vert?len:dep, H=(S.H||1.6), nsh=Math.max(3,Math.round(H/0.34));
        if(vert){ [-1,1].forEach(s=>B('moebel',x,y+H/2,z+s*d/2,0.04,H,d*0+0.04)); B('moebel',x,y+H/2,z,0.04,H,d); B('moebel',x-w/2+0.018,y+H/2,z,0.03,H,d); }
        else    { [-1,1].forEach(s=>B('moebel',x+s*w/2,y+H/2,z,0.04,H,d*0+0.04)); B('moebel',x,y+H/2,z,w,H,0.04); B('moebel',x,y+H/2,z-d/2+0.018,w,H,0.03); }   // Wangen + Rückwand
        for(let i=0;i<=nsh;i++){ const sy=y+i*(H/nsh); B('moebel',x,sy,z,vert?0.04:w*0.97,0.035,vert?d*0.97:0.04); if(i>0&&i<nsh&&rndI()<0.6)clutterOn(x,sy+0.018,z,(vert?dep:len)*0.42,(vert?len:dep)*0.42,1); }
        furniture.push(aabb(x,y+H/2,z,w,H,d)); },
      // ════ BANK — mit Lehne + Wangen ════
      bank:(x,y,z,vert,nx,nz,S)=>{ S=S||{}; const len=S.L||1.2, dep=S.W||0.36, w=vert?dep:len, d=vert?len:dep;
        B('moebel',x,0.44,z,w,0.06,d); [-1,1].forEach(s=>B('moebel',x+(vert?0:s*(w/2-0.06)),0.22,z+(vert?s*(d/2-0.06):0),vert?w*0.9:0.08,0.44,vert?0.08:d*0.9));
        if(vert)B('moebel',x-w/2+0.04,0.70,z,0.05,0.46,d*0.92); else B('moebel',x,0.70,z-d/2+0.04,w*0.92,0.46,0.05);
        furniture.push(aabb(x,0.25,z,w,0.5,d)); },
      // ════ TRUHE — Korpus, Eckbeschläge, öffenbarer Deckel mit Schlossüberfall ════
      truhe:(x,y,z,vert,nx,nz,S)=>{ S=S||{}; nx=nx||0; nz=nz||0; if(!nx&&!nz)nz=-1; const ax=nx!==0;
        const len=S.L||1.1, dep=S.W||0.55, w=ax?dep:len, d=ax?len:dep, bH=(S.H||0.44), lidT=0.08, topY=y+bH;
        B('moebel',x,y+bH/2,z,w,bH,d); B('dunkel',x,y+bH*0.30,z,w*1.02,0.035,d*1.02); B('dunkel',x,y+bH*0.70,z,w*1.02,0.035,d*1.02);   // Korpus + zwei Eisenbänder
        [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>B('dunkel',x+sx*w/2*0.97,y+bH/2,z+sz*d/2*0.97,0.04,bH*0.96,0.04));            // Eckbeschläge
        const L=grp();
        if(ax){ const backX=x-nx*w/2; beam(L,nx*w/2,0,0,w,lidT,d,'moebel'); beam(L,nx*w*0.42,0,0,0.10,0.05,d*0.5,'dunkel'); L.position.set(...deform(backX,topY,z)); L.userData={door:true,axis:'z',openA:nx*1.1,open:false}; }
        else   { const backZ=z-nz*d/2; beam(L,0,0,nz*d/2,w,lidT,d,'moebel'); beam(L,0,0,nz*d*0.42,w*0.5,0.05,0.10,'dunkel'); L.position.set(...deform(x,topY,backZ)); L.userData={door:true,axis:'x',openA:-nz*1.1,open:false}; }
        g.add(L); if(rndI()<0.45)clutterOn(x,topY+lidT,z,w*0.4,d*0.4,1); furniture.push(aabb(x,y+bH*0.7,z,w,bH*1.4,d)); },
      // ════ FASS — Dauben (leicht gewölbt) + drei Reifen ════
      fass:(x,y,z,vert,nx,nz,S)=>{ S=S||{}; const r=(S.L?S.L/2:0.27)*jit(1,0.10),H=(S.H||0.78)*jit(1,0.08),n=11; for(let i=0;i<n;i++){const a=i/n*Math.PI*2; B('moebel',x+Math.cos(a)*r,y+H/2,z+Math.sin(a)*r,0.085,H,0.085,[0,a,0]);}
        [0.16,0.5,0.84].forEach(f=>B('dunkel',x,y+H*f,z,r*2.08,0.045,r*2.08)); B('moebel',x,y+H-0.01,z,r*1.7,0.03,r*1.7); if(rndI()<0.4)clutterOn(x,y+H,z,r*0.55,r*0.55,1); furniture.push(aabb(x,y+H/2,z,r*2.1,H,r*2.1)); },
    };
    const hearthBox=[hearthX-0.9,hearthZ-0.7,hearthX+0.9,hearthZ+0.7];
    const tryWall=(room,wall,W_,D_)=>{ const ins=0.16;   // INNENFLÄCHEN-GESETZ: Korpus samt Gesims steht VOR der Wand
      if(wall==='outer'){ const at=room.side==='L'?room.x0:room.x1, dir=room.side==='L'?1:-1, cx=at+dir*(D_/2+ins), lo=room.z0+ins+W_/2, hi=room.z1-ins-W_/2; if(hi<lo)return null; const cz=lo+rndI()*(hi-lo); return {cx,cz,vert:true,nx:dir,nz:0,fp:[cx-D_/2,cz-W_/2,cx+D_/2,cz+W_/2]}; }
      const at=wall==='z0'?room.z0:room.z1, dir=wall==='z0'?1:-1, cz=at+dir*(D_/2+ins), lo=room.x0+ins+W_/2, hi=room.x1-ins-W_/2; if(hi<lo)return null; const cx=lo+rndI()*(hi-lo); return {cx,cz,vert:false,nx:0,nz:dir,fp:[cx-W_/2,cz-D_/2,cx+W_/2,cz+D_/2]}; };
    const furnish=room=>{ const {floor,y}=room; const local=[];
      const fits=fp=>{ if(fp[0]<room.x0+0.05||fp[2]>room.x1-0.05||fp[1]<room.z0+0.05||fp[3]>room.z1-0.05)return false;
        for(const p of local)if(fp[0]<p[2]&&fp[2]>p[0]&&fp[1]<p[3]&&fp[3]>p[1])return false;
        for(const q of GBLK) if((q.f===-1||q.f===floor) && fp[0]<q.fp[2]&&fp[2]>q.fp[0]&&fp[1]<q.fp[3]&&fp[3]>q.fp[1]) return false;
        if(floor===0 && fp[0]<hearthBox[2]&&fp[2]>hearthBox[0]&&fp[1]<hearthBox[3]&&fp[3]>hearthBox[1])return false;
        if(chimney && fp[0]<chimney.max[0]&&fp[2]>chimney.min[0]&&fp[1]<chimney.max[2]&&fp[3]>chimney.min[2])return false;
        for(const c of circR){ if(c.floor===floor && fp[0]<c.x1&&fp[2]>c.x0&&fp[1]<c.z1&&fp[3]>c.z0)return false; }
        return true; };
      const put=(piece,L_,S_,walls,fr)=>{ const Lj=jit(L_,fr==null?0.12:fr), Sj=jit(S_,fr==null?0.10:fr);
        for(const wl of walls)for(let t=0;t<5;t++){ const pl=tryWall(room,wl,Lj,Sj); if(pl&&fits(pl.fp)){ const ret=piece(pl.cx,y,pl.cz,pl.vert,pl.nx,pl.nz,{L:Lj,W:Sj}); local.push(pl.fp); return ret||true; } } return false; };
      const putCenter=(piece,w_,d_)=>{ const wj=jit(w_,0.12), dj=jit(d_,0.10); const cx=(room.x0+room.x1)/2,cz=(room.z0+room.z1)/2,fp=[cx-wj/2,cz-dj/2,cx+wj/2,cz+dj/2]; if(fits(fp)){const ret=piece(cx,y,cz,false,0,0,{L:wj,W:dj});local.push(fp);return {cx,cz,ret};} return null; };
      const chairsAround=(cx,cz,tw,td)=>{ [[0,-1],[0,1],[-1,0],[1,0]].forEach(([ox,oz])=>{ if(rndI()<0.30)return;
          const sx=cx+ox*(tw/2+0.27), sz=cz+oz*(td/2+0.27), fp=[sx-0.24,sz-0.24,sx+0.24,sz+0.24]; if(fits(fp)){ F.stuhl(sx,y,sz,ox,oz); local.push(fp); } }); };
      if(room.func==='kammer'){ put(F.bett,1.95,1.0,['outer','z1','z0']); put(F.truhe,1.1,0.55,['z1','z0','outer']); if(rndI()<0.78)put(F.schrank,1.1,0.55,['z0','z1','outer']); if(rndI()<0.55)put(F.kommode,1.05,0.5,['z1','z0','outer']); if(rndI()<0.4)put(F.hocker,0.36,0.36,['z0','z1']); if(rndI()<0.45)put(F.regal,1.0,0.34,['z1','z0']); }
      else if(room.func==='stube'){ const tc=putCenter(F.tisch,1.4,0.85); if(tc&&tc.ret&&tc.ret.w){ chairsAround(tc.cx,tc.cz,tc.ret.w,tc.ret.d);
          const bz1=[tc.cx-tc.ret.w/2,tc.cz+tc.ret.d/2,tc.cx+tc.ret.w/2,tc.cz+tc.ret.d/2+0.36]; if(fits(bz1)){F.bank(tc.cx,y,tc.cz+tc.ret.d/2+0.2,false);local.push(bz1);} }
        put(F.schrank,1.1,0.55,['outer','z0','z1']); if(rndI()<0.65)put(F.regal,1.0,0.34,['z1','z0']); if(rndI()<0.55)put(F.truhe,1.1,0.55,['z0','z1']); if(rndI()<0.5)put(F.kommode,1.05,0.5,['outer','z1']); }
      else if(room.func==='kueche'){ put(F.tisch,1.25,0.8,['z1','z0','outer']);
        put(F.regal,1.0,0.34,['z0','z1','outer']); put(F.fass,0.55,0.55,['z0','z1']); if(rndI()<0.6)put(F.fass,0.55,0.55,['z1','z0']); if(rndI()<0.6)put(F.bank,1.0,0.36,['outer']); if(rndI()<0.55)put(F.kommode,1.0,0.5,['z0','z1']); if(rndI()<0.5)put(F.hocker,0.36,0.36,['z1','z0']); }
      else { put(F.truhe,1.1,0.55,['outer','z0','z1']); put(F.fass,0.55,0.55,['z0']); put(F.fass,0.55,0.55,['z1']); put(F.regal,1.0,0.34,['outer','z0']); if(rndI()<0.65)put(F.truhe,1.05,0.5,['z1','outer']); if(rndI()<0.5)put(F.kommode,1.0,0.5,['z0','z1']); }
      if(local.length===0){ put(F.regal,1.0,0.34,['outer','z0','z1']) || put(F.kommode,1.0,0.5,['outer','z0','z1']) || put(F.hocker,0.36,0.36,['outer','z0','z1']) || put(F.truhe,0.9,0.5,['outer','z0','z1']); } };
    const GBLK=[];   // BEWEGUNGSFLÄCHEN-GESETZ (Realität: DIN-Bewegungsflächen): vor jeder Tür, vor dem Feuer, am Treppen-Antritt bleibt Stellfläche frei
    WALLS.forEach(w=>{ if(w.type==='door'||w.type==='wingdoor'||w.type==='balkdoor'){ const wc=(w.lo+w.hi)/2, dw=Math.max(1.0,(w.hi-w.lo)*0.6), fl=(w.type==='balkdoor')?1:0; GBLK.push({f:fl, fp: w.horiz?[wc-dw/2,w.fixed-1.05,wc+dw/2,w.fixed+1.05]:[w.fixed-1.05,wc-dw/2,w.fixed+1.05,wc+dw/2]}); } });
    { const fO=hearthX+hearthNX*(hearthBD/2); GBLK.push({f:0, fp:[Math.min(fO,fO+hearthNX*1.0), hearthZ-hearthBW/2-0.15, Math.max(fO,fO+hearthNX*1.0), hearthZ+hearthBW/2+0.15]}); }   // HERD-BEDIENFLÄCHE — vor der Feueröffnung (x-Normale)
    GBLK.push({f:-1, fp:[wx0-0.10, stZ0-1.10, wx1+0.10, wz1+0.10]});                                  // TREPPEN-Antritt + Lauf — SCHACHT-GESETZ: über ALLE Geschosse frei (f:-1)
    if(P.keller) GBLK.push({f:-1, fp:[lxL-0.10, stZ0-1.10, lxR+0.10, wz1+0.20]});                     // Keller-Zustieg — geschossübergreifend
    if(backDoor) GBLK.push({f:0, fp:[backDoor.cx-0.70, Dp/2-1.05, backDoor.cx+0.70, Dp/2+0.12]});     // HINTERTÜR-Bewegungsfläche (eigener Mechanismus, nicht in WALLS-type)
    rooms.forEach(r=>{ const b=furniture.length; furnish(r); for(let i=b;i<furniture.length;i++) furniture[i].floor=r.floor; });
    // ════ KELLER liest DASSELBE F.*-System (kein hardcoded Parallel-Inventar mehr) ════
    if(P.keller && KELLERRAUM){ const kr=KELLERRAUM, ky=kr.floorY; const kl=[];
      const kfits=fp=> fp[0]>kr.x0+0.16&&fp[2]<kr.x1-0.16&&fp[1]>kr.z0+0.16&&fp[3]<kr.z1-0.16 && !kl.some(p=>fp[0]<p[2]&&fp[2]>p[0]&&fp[1]<p[3]&&fp[3]>p[1]) && !(fp[0]<kr.holeX1&&fp[2]>kr.holeX0&&fp[1]<kr.holeZ1&&fp[3]>kr.holeZ0);
      const kput=(piece,wd,dp,side)=>{ for(let t=0;t<8;t++){ const vert=side==='x'; const cx=vert?(rndI()<0.5?kr.x0+0.26+dp/2:kr.x1-0.26-dp/2):(kr.x0+0.5+rndI()*(kr.x1-kr.x0-1)); const cz=vert?(kr.z0+0.5+rndI()*(kr.z1-kr.z0-1)):(rndI()<0.5?kr.z0+0.20+dp/2:kr.z1-0.20-dp/2);
          const w=vert?dp:wd, d=vert?wd:dp, fp=[cx-w/2,cz-d/2,cx+w/2,cz+d/2]; if(kfits(fp)){ piece(cx,ky,cz,vert,vert?(cx<0?1:-1):0,vert?0:(cz<0?1:-1),{}); kl.push(fp); return true; } } return false; };
      kput(F.regal,1.2,0.34,'x'); kput(F.regal,1.0,0.34,'x'); kput(F.tisch,1.35,0.62,'x'); kput(F.fass,0.6,0.6,'z'); kput(F.fass,0.6,0.6,'z'); kput(F.fass,0.55,0.55,'x'); kput(F.truhe,1.1,0.55,'z'); kput(F.kommode,1.0,0.5,'x'); if(rndI()<0.7)kput(F.fass,0.55,0.55,'z'); if(rndI()<0.6)kput(F.regal,1.0,0.34,'z'); if(rndI()<0.6)kput(F.truhe,0.95,0.5,'x'); }   // VORRATS-GESETZ: Werkbank, Regale, Fassreihe — der Keller arbeitet
    return g; }

  // ════════ ZIMMERMANN (Holzverbindungen: Zapfen · Holznägel · Balkenköpfe) ════════
  function zimmermann(){const g=grp(); if(ROUND)return g; const zf=Dp/2-0.02, xf=W/2-0.02;
    const peg=(x,y,z,face)=>{ const d=0.035,L=0.135;                                // Holznagel: klein, bündig eingetrieben
      if(face==='z') beam(g,x,y,z,d,d,L,'nagel',[0,0,Math.PI/4]); else beam(g,x,y,z,L,d,d,'nagel',[Math.PI/4,0,0]); };
    const kopf=(x,y,zc,len)=>beam(g,x,y,zc,0.13,P.balkenH+0.02,len,'holz');         // Balkenkopf (Zapfennase über Rähm)
    levels.forEach(L=>{ const y0=L.y,h=L.h;                                          // 1) Ständer↔Schwelle/Rähm verstiftet (auf dem Ständer)
      bx.forEach(x=>{[zf,-zf].forEach(z=>{ if(z<0&&Math.abs(x-doorX)<doorW/2+0.2)return;          // Haustür-Öffnung (vorne −z) → kein Ständer, kein Nagel
        if(backDoor&&z>0&&x>backDoor.lo-0.2&&x<backDoor.hi+0.2)return;                              // Hintertür-Öffnung (hinten +z) → GLEICHE Regel, kein schwebender Nagel
        peg(x,y0+0.20,z,'z'); peg(x,y0+h-0.20,z,'z'); });});
      bz.forEach(z=>{ if(Math.abs(z)<Dp/2-0.1)[xf,-xf].forEach(x=>{ peg(x,y0+0.20,z,'x'); peg(x,y0+h-0.20,z,'x'); }); });
      [doorX-doorW/2-ps,doorX+doorW/2+ps].forEach(x=>{ peg(x,y0+0.20,-zf,'z'); peg(x,y0+h-0.20,-zf,'z'); }); });
    WALLS.forEach(w=>{ if(w.type==='door'||w.type==='door2'||w.type==='balkdoor'||w.type==='wingdoor'||w.win)return;   // 2) Kreuzungsnagel NUR in geschlossenen Brüstungsfeldern — alle Öffnungen (Türen, Fenster) frei (war inkonsistent: nur 'door' übersprungen → schwebender Nagel in Hintertür)
      const a=(w.lo+w.hi)/2, y=(w.yLo+w.sillY)/2, f=w.fixed;
      if(P.brace==='andreas'||P.brace==='wild'){ if(w.horiz)peg(a,y,f,'z'); else peg(f,y,a,'x'); } });
    const rows=levels.map(L=>L.top-P.balkenH/2).concat([eaveY-P.balkenH/2]);          // 3) Deckenbalkenköpfe über Rähm + Nagel
    rows.forEach(yc=>{ bx.forEach(x=>{ [1,-1].forEach(s=>{ kopf(x,yc,s*(Dp/2+0.05),0.2); peg(x,yc,s*(Dp/2-0.02),'z'); }); }); });
    return g; }

  // ════════ GARAGE (Pultdach/Schleppdach an +x; Tor zur Strasse −z) — Maße + Dach aus GA (Stellplatz-Funktion) ════════
  function anbau(){const g=grp(); if(!GAs.length) return g; GAs.forEach(GA=>{
    const {gw,gd,sx,xin,xout,x0,x1,z0,z1,zc,xc,yLow,yHigh,slope}=GA, wy0=0.06;
    const yR=x=>yHigh-Math.abs(x-xin)*slope, th=Math.atan(slope);                   // Pult: hoch an der Hauswand (xin), tief außen (xout) — SEITEN-GENERISCH via sx
    const ovZ=0.30, ovX=0.30, yOut=yLow-ovX*slope, xoO=xout+sx*ovX;
    beam(g,xc,wy0/2,zc,gw+0.14,wy0+0.05,gd+0.14,'stein');
    beam(g,xc,wy0+0.02,zc,gw,0.06,gd,'boden'); addSolid(xc,wy0,zc,gw,0.12,gd);
    [[xin,z0],[xin,z1],[xout,z0],[xout,z1]].forEach(([x,z])=>{ const yt=yR(x); beam(g,x,(wy0+yt)/2,z,0.14,yt-wy0,0.14,'holz'); });
    beam(g,xin,yHigh-0.07,zc,0.14,0.14,gd,'holz'); beam(g,xout,yLow-0.07,zc,0.14,0.14,gd,'holz');
    const plankX=(za,zb,y0,y1,x)=>{ if(zb-za<0.05||y1-y0<0.05)return; const n=Math.max(1,Math.round((zb-za)/0.26)),bw=(zb-za)/n;
      for(let i=0;i<n;i++)beam(g,x,(y0+y1)/2,za+(i+0.5)*bw,0.05,y1-y0,bw*0.99,'holz'); };
    const stripTrap=(a,b,z,yb)=>{ if(b-a<0.04)return; const n=Math.max(1,Math.round((b-a)/0.26)),bw=(b-a)/n;
      for(let i=0;i<n;i++){ const x=a+(i+0.5)*bw, yt=yR(x); if(yt-yb>0.05)beam(g,x,(yb+yt)/2,z,bw*0.99,yt-yb,0.05,'holz'); }
      const yc=yR((a+b)/2); if(yc-yb>0.05)addSolid((a+b)/2,(yb+yc)/2,z,b-a,yc-yb,0.12); };
    { const wy=wy0+1.2, wH=0.55, w0=zc-0.4,w1=zc+0.4;                              // Außenwand (niedrig) + kleines Fenster
      plankX(z0,w0,wy0,yLow,xout); plankX(w1,z1,wy0,yLow,xout); plankX(w0,w1,wy0,wy-wH/2-0.04,xout); plankX(w0,w1,wy+wH/2+0.04,yLow,xout);
      addSolid(xout,wy0+(yLow-wy0)/2,zc,0.12,yLow-wy0,gd); fensterAt(g,xout,wy,zc,0.8,wH,false, yLow-0.06); }   // BOGEN-DECKEL lokal: Pult-Traufe schlägt Hauptdach
    const pdw=0.85, pd0=xin+sx*0.35, plo=Math.min(pd0,pd0+sx*pdw), phi=Math.max(pd0,pd0+sx*pdw), pdH=2.0, pdY=wy0+pdH;   // Personentür an der HOHEN Seite
    stripTrap(x0,plo,z1,wy0); stripTrap(phi,x1,z1,wy0); stripTrap(plo,phi,z1,pdY);
    beam(g,(plo+phi)/2,pdY+0.07,z1,pdw+0.24,0.13,0.16,'holz'); [plo,phi].forEach(d=>beam(g,d,(wy0+pdY)/2,z1,0.12,pdH,0.14,'holz'));
    { const L=grp(); const inner=grp(); const w=pdw-0.04,h=pdH-0.04; beam(inner,0,0,0.014,w,h,0.04,'holz');
      const nb=Math.max(2,Math.round(w/0.2)); for(let i=0;i<nb;i++)beam(inner,-w/2+(i+0.5)*w/nb,0,-0.014,w/nb,h,0.03,'holz');
      beam(inner,0,h/2-0.07,-0.03,w,0.09,0.04,'holz'); strut(inner,-w/2+0.06,-h/2+0.08,-0.04,w/2-0.06,h/2-0.08,-0.04,0.06,'holz');
      inner.position.x=w/2; L.add(inner); beam(L,w-0.12,0,0.07,0.05,0.2,0.06,'metall');
      L.position.set(...deform(plo,wy0+pdH/2,z1)); L.rotation.y=(P.doorClosed?0:sx*1.0)+(DEF_bk>0?plo*DEF_bk:0);
      L.userData={door:true,preOpen:(!P.doorClosed),openA:sx*1.0, block:[plo,wy0,z1-0.12,phi,pdY,z1+0.12]}; g.add(L); }
    const tw=Math.min(2.45, gw-0.55), t0=xin+sx*0.30, tlo=Math.min(t0,t0+sx*tw), thi=Math.max(t0,t0+sx*tw), toH=2.0, toY=wy0+toH;   // TOR am hohen Ende, Einfahrt −z
    stripTrap(x0,tlo,z0,wy0); stripTrap(thi,x1,z0,wy0); stripTrap(tlo,thi,z0,toY);
    beam(g,(tlo+thi)/2,toY+0.08,z0,tw+0.3,0.16,0.18,'holz'); [tlo,thi].forEach(d=>beam(g,d,(wy0+toY)/2,z0,0.14,toH,0.14,'holz'));
    beam(g,(tlo+thi)/2,wy0-0.02,z0+0.03,tw+0.2,0.06,0.34,'stein');
    const tlw=tw/2;
    const torLeaf=(L,w,h,sec)=>{ beam(L,0,0,0.014,w,h,0.04,sec?'metall':'holz'); const nb=Math.max(3,Math.round(w/0.24));
      if(sec){ const nl=Math.max(3,Math.round(h/0.42)); for(let j=0;j<nl;j++)beam(L,0,-h/2+(j+0.5)*h/nl,-0.022,w*0.98,h/nl*0.86,0.05,'metall'); for(let j=1;j<nl;j++)beam(L,0,-h/2+j*h/nl,-0.04,w,0.025,0.06,'dunkel'); }
      else { for(let i=0;i<nb;i++)beam(L,-w/2+(i+0.5)*w/nb,0,-0.014,w/nb,h,0.03,'holz'); beam(L,0,h/2-0.07,-0.03,w,0.1,0.04,'holz'); beam(L,0,-h/2+0.07,-0.03,w,0.1,0.04,'holz'); strut(L,-w/2+0.08,-h/2+0.1,-0.04,w/2-0.08,h/2-0.1,-0.04,0.08,'holz'); } };
    if(modern){ const L=grp(); const inner=grp(); torLeaf(inner,tw-0.06,toH,true); inner.position.y=-toH/2+0.02; L.add(inner);
      L.position.set(...deform((tlo+thi)/2, toY-0.05, z0+0.02)); L.rotation.x=P.doorClosed?0:1.5; L.rotation.y=(DEF_bk>0?((tlo+thi)/2)*DEF_bk:0);
      L.userData={door:true,preOpen:(!P.doorClosed),axis:'x',openA:1.5, block:[tlo,wy0,z0-0.12,thi,toY,z0+0.12]}; g.add(L); }
    else [[-1,tlo],[1,thi]].forEach(([sgn,hx])=>{ const L=grp(); const inner=grp(); torLeaf(inner,tlw,toH,false); inner.position.x=-sgn*tlw/2; L.add(inner);
      beam(L,-sgn*(tlw-0.16),0,-0.07,0.05,0.24,0.06,'metall'); if(sgn<0)beam(L,tlw-0.01,0,-0.02,0.14,toH,0.05,'holz');
      L.position.set(...deform(hx,wy0+toH/2,z0)); L.rotation.y=(P.doorClosed?0:-sgn*1.0)+(DEF_bk>0?hx*DEF_bk:0);
      L.userData={door:true,preOpen:(!P.doorClosed),openA:-sgn*1.0, block:sgn<0?[tlo,wy0,z0-0.12,(tlo+thi)/2,toY,z0+0.12]:[(tlo+thi)/2,wy0,z0-0.12,thi,toY,z0+0.12]}; g.add(L); });
    if(ROOFMODE!=='flat'){   // FESTUNG: kein Pult — Deck aus der EINEN flachen Quelle, Krone aus dem MERLON-GESETZ
    poly(g,[[xin,yHigh+0.04,z0-ovZ],[xoO,yOut+0.04,z0-ovZ],[xoO,yOut+0.04,z1+ovZ],[xin,yHigh+0.04,z1+ovZ]],'ziegel2');
    { const nS=Math.max(2,Math.round(gd/0.7)); for(let i=0;i<=nS;i++){ const z=z0+gd*i/nS; strut(g,xoO,yOut,z, xin,yHigh,z, P.spar,'holz'); } }
    { const z0e=z0-ovZ, z1e=z1+ovZ, lift=0.07, tcw=0.26, tcl=0.34, stp=0.205*Math.cos(th);
      for(let i=0;i<200;i++){ const x=xin + sx*i*stp; if(sx*(x-xoO)>0.02)break; const y=yR(x);
        if(i%2===0)beam(g,x,y+lift-0.04,zc,0.05,0.03,z1e-z0e,'lattung');
        const off=(i%2)*tcw*0.5, nz=Math.ceil((z1e-z0e)/tcw)+1;
        for(let j=0;j<nz;j++){ const z=z0e+off+j*tcw+tcw/2; if(z>z1e+0.02)continue; beam(g,x,y+lift,z,tcl,0.03,tcw*0.92,'ziegel',[0,0,-sx*th]); } } }
    beam(g,xin+sx*0.06,yHigh+0.07,zc,0.18,0.12,gd+0.1,'ziegel');                    // Anschlussziegel an der Hauswand
    [z0-ovZ,z1+ovZ].forEach(zz=>strut(g,xoO,yOut+0.05,zz,xin,yHigh+0.05,zz,0.09,'holz'));
    }
    }); return g; }
  // ════════ BALKON (Laube an der Rückseite, OG) ════════
  function fluegel(){ const g=grp(); if(ROUND)return g; if(!wings.length) return g;
    const post=0.14;
    const panel=(horiz,fixed,a0,a1,yB,yT,opt)=>{ opt=opt||{}; const sw=0.13, brick=opt.brick!==false;
      const open=[]; if(opt.door)open.push(opt.door); if(opt.win){const{c,wd}=opt.win;open.push([c-wd/2,c+wd/2]);}
      const inOpen=a=>open.some(([o0,o1])=>a>o0-0.06 && a<o1+0.06);
      if(horiz){ beam(g,(a0+a1)/2,yB+sw/2,fixed,a1-a0,sw,0.14,'holz'); beam(g,(a0+a1)/2,yT-sw/2,fixed,a1-a0,sw,0.14,'holz'); }
      else     { beam(g,fixed,yB+sw/2,(a0+a1)/2,0.14,sw,a1-a0,'holz'); beam(g,fixed,yT-sw/2,(a0+a1)/2,0.14,sw,a1-a0,'holz'); }
      axis((a1-a0)/2,[]).map(v=>v+(a0+a1)/2).forEach(a=>{ if(inOpen(a))return;
        if(horiz)beam(g,a,(yB+yT)/2,fixed,post,yT-yB,0.13,'holz'); else beam(g,fixed,(yB+yT)/2,a,0.13,yT-yB,post,'holz'); });
      const yI0=yB+sw, yI1=yT-sw, fill=(b0,b1,c0,c1)=>infill(g,b0,b1,c0,c1,fixed,horiz,brick);
      if(opt.door){ const [dL,dR]=opt.door, dh=yB+P.doorH;
        fill(a0,dL,yI0,yI1); fill(dR,a1,yI0,yI1); if(yI1>dh+0.05)fill(dL,dR,dh,yI1);
        if(horiz){ beam(g,(dL+dR)/2,dh+0.06,fixed,dR-dL+0.26,0.13,0.15,'holz'); [dL,dR].forEach(d=>beam(g,d,(yB+dh)/2,fixed,0.13,dh-yB,0.14,'holz')); }
        else      { beam(g,fixed,dh+0.06,(dL+dR)/2,0.15,0.13,dR-dL+0.26,'holz'); [dL,dR].forEach(d=>beam(g,fixed,(yB+dh)/2,d,0.14,dh-yB,0.13,'holz')); }
        if(horiz){ addSolid((a0+dL)/2,(yB+yT)/2,fixed,dL-a0,yT-yB,0.13); addSolid((dR+a1)/2,(yB+yT)/2,fixed,a1-dR,yT-yB,0.13); if(yT>dh+0.05)addSolid((dL+dR)/2,(dh+yT)/2,fixed,dR-dL,yT-dh,0.13); }
        else     { addSolid(fixed,(yB+yT)/2,(a0+dL)/2,0.13,yT-yB,dL-a0); addSolid(fixed,(yB+yT)/2,(dR+a1)/2,0.13,yT-yB,a1-dR); if(yT>dh+0.05)addSolid(fixed,(dh+yT)/2,(dL+dR)/2,0.13,yT-dh,dR-dL); }
      } else if(opt.win){ const {c,wd,cy,ch}=opt.win, L=c-wd/2,R=c+wd/2,wb=cy-ch/2,wt=cy+ch/2;
        fill(a0,L,yI0,yI1); fill(R,a1,yI0,yI1); fill(L,R,yI0,wb); fill(L,R,wt,yI1);
        if(horiz){ beam(g,(L+R)/2,wb,fixed,R-L,0.1,0.13,'holz'); beam(g,(L+R)/2,wt,fixed,R-L,0.1,0.13,'holz'); }
        else     { beam(g,fixed,wb,(L+R)/2,0.13,0.1,R-L,'holz'); beam(g,fixed,wt,(L+R)/2,0.13,0.1,R-L,'holz'); }
        fensterAt(g, horiz?c:fixed, cy, horiz?fixed:c, wd, ch, horiz);
        if(horiz)addSolid((a0+a1)/2,(yB+yT)/2,fixed,a1-a0,yT-yB,0.13); else addSolid(fixed,(yB+yT)/2,(a0+a1)/2,0.13,yT-yB,a1-a0);
      } else { fill(a0,a1,yI0,yI1); if(horiz)addSolid((a0+a1)/2,(yB+yT)/2,fixed,a1-a0,yT-yB,0.13); else addSolid(fixed,(yB+yT)/2,(a0+a1)/2,0.13,yT-yB,a1-a0); }
    };
    const buildOne=(w)=>{ const {ox,oz,ax,az,outIsX,depth,breadth,uc,loc,u0,u1,v0,v1,x0,x1,z0,z1,xc,zc}=w;
      const merge=!outIsX, eT=levels[0].top, twoSt=merge&&levels.length>1;                              // N/S = senkrecht → echtes Kreuzdach, 2 Geschosse, verschmolzener Raum
      const eY = merge ? eaveY-0.06 : Math.min(baseY+P.egH*0.86, eaveY-0.8), h=eY-baseY, half=breadth/2, sX=x1-x0, sZ=z1-z0;
      // Plinth: vom FUNDAMENT-Subsystem getragen (ein Fundament-System, kein Parallel-Sockel im Flügel)
      levels.forEach((lv,k)=>{ if(merge ? (lv.y < eY-0.3) : k===0){ beam(g,xc,lv.y+0.04,zc,sX,0.08,sZ,'boden'); addSolid(xc,lv.y,zc,sX,0.16,sZ); } });   // GESETZ: Geschossboden auf JEDER Ebene (merge-Flügel = volle Höhe → kein Liftschacht); E/W-Flügel nur EG
      if(merge){ beam(g,xc,eaveY-0.05,zc,sX,0.08,sZ,'boden'); addSolid(xc,eaveY,zc,sX,0.16,sZ); }   // Estrich-Boden im Flügel → an den Haupt-Dachboden angebunden (man läuft nicht ins Leere)
      [[u0,v0],[u1,v0],[u0,v1],[u1,v1]].forEach(([u,v])=>{const p=loc(u,v); beam(g,p[0],baseY+h/2,p[1],post,h,post,'holz');});   // Eckständer
      [u0,u1].forEach(u=>{ const A=loc(u,v0),B=loc(u,v1), eh=outIsX, fx=eh?A[1]:A[0], c0=eh?A[0]:A[1], c1=eh?B[0]:B[1], lo=Math.min(c0,c1), hi=Math.max(c0,c1), wd=clamp(breadth-1.4,0.85,1.2);
        if(merge){ levels.forEach((lv,k)=>{ const yB=lv.y, yT=(k<levels.length-1)?lv.top:eY; if(yT-yB<0.5)return; panel(eh,fx,lo+post/2,hi-post/2,yB,yT,{win:{c:(lo+hi)/2,wd,cy:yB+(k===0?1.25:1.0),ch:k===0?0.95:0.9}}); }); }   // Traufwand + Fenster JE Geschoss
        else panel(eh,fx,lo+post/2,hi-post/2,baseY,eY,{win:{c:(lo+hi)/2,wd,cy:baseY+1.25,ch:0.95}}); });
      const G0=loc(u0,v1),G1=loc(u1,v1), gh=!outIsX, gfx=gh?G0[1]:G0[0], gc0=gh?G0[0]:G0[1], gc1=gh?G1[0]:G1[1], glo=Math.min(gc0,gc1), ghi=Math.max(gc0,gc1), gdc=(glo+ghi)/2, dL=gdc-0.49, dR=gdc+0.49;
      if(merge){ levels.forEach((lv,k)=>{ const yB=lv.y, yT=(k<levels.length-1)?lv.top:eY; if(yT-yB<0.5)return;
        if(k===0) panel(gh,gfx,glo+post/2,ghi-post/2,yB,yT,{door:[dL,dR]});
        else panel(gh,gfx,glo+post/2,ghi-post/2,yB,yT,{win:{c:gdc,wd:clamp(breadth-1.6,0.8,1.1),cy:yB+1.0,ch:0.9}}); }); }   // Giebelwand: Tür im EG, Fenster JE OG
      else panel(gh,gfx,glo+post/2,ghi-post/2,baseY,eY,{door:[dL,dR]});
      { const dd=loc(uc,v1), dx=dd[0], dz=dd[1], dh=P.doorH, dwid=dR-dL, lw=dwid-0.06, lh=dh-0.06, dcy=baseY+dh/2, oA=0.95;   // SCHWINGTÜR (öffenbar) — generisch über die Außennormale
        const base=Math.atan2(-az,ax), sgn=(ox+oz>0?1:-1), hx=dx-ax*dwid/2, hz=dz-az*dwid/2;               // Scharnier an einer Türkante, schwingt nach aussen
        const L=grp(); const inner=leafFrame(lw,lh,'holz',+1); inner.position.x=lw/2; L.add(inner); beam(L,lw-0.13,0,0.05,0.07,0.07,0.06,'metall');
        L.position.set(...deform(hx,dcy,hz)); L.rotation.y=base+(P.doorClosed?0:oA*sgn)+(DEF_bk>0?hx*DEF_bk:0);
        L.userData={door:true,preOpen:(!P.doorClosed),openA:base+oA*sgn,block:[dx-0.45,baseY,dz-0.45,dx+0.45,baseY+dh,dz+0.45]}; g.add(L);
        beam(g,dx,baseY-0.02,dz, outIsX?0.30:dwid+0.2, 0.06, outIsX?dwid+0.2:0.30, 'stein');
        aussentreppe(g,dx,dz,ox,oz,dwid); }
      if(w.door){ const ii=loc(uc,v0), ix=ii[0], iz=ii[1], dh=baseY+P.doorH, c=w.door.c;                  // Innendurchgang: bei merge BREITE Öffnung (Raum fließt), sonst Türbreite
        const owid = merge ? Math.min(breadth-1.0,(outIsX?sZ:sX)-1.0) : (w.door.hi-w.door.lo);
        if(outIsX){ beam(g,ix,dh+0.06,c,0.18,0.13,owid+0.3,'holz'); [c-owid/2,c+owid/2].forEach(zz=>beam(g,ix,baseY+P.doorH/2,zz,0.14,P.doorH,0.13,'holz')); beam(g,ix,baseY+0.03,c,0.42,0.06,owid,'boden'); addSolid(ix,baseY,c,0.46,0.12,owid); }
        else      { beam(g,c,dh+0.06,iz,owid+0.3,0.13,0.18,'holz'); [c-owid/2,c+owid/2].forEach(xx=>beam(g,xx,baseY+P.doorH/2,iz,0.13,P.doorH,0.14,'holz')); beam(g,c,baseY+0.03,iz,owid,0.06,0.42,'boden'); addSolid(c,baseY,iz,owid,0.12,0.46); } }
      if(merge && ROOFMODE!=='flat'){ // ════ echtes KREUZDACH mit Kehltälern (senkrechter Flügel verschmilzt mit dem Hauptdach) ════
        const eYw=eaveY-0.06, rYw=Math.min(eYw+half*mS, ridgeY-0.2), sz=oz, wPit=mS;   // GLEICHE Neigung wie das Hauptdach → Kehltal = saubere Diagonale
        const zEaveV=sz*Dp/2, zOuter=sz*(Dp/2+depth+0.3), zRidge=sz*(ridgeY-rYw)/mS;                      // Kehltal-Eckpunkte: Firstanstoß innen, Trauf am Hauptdach
        const A=[uc,rYw,zRidge], B=[uc,rYw,zOuter];                                                        // FIX: echtes [x,y,z] — y=rYw (Höhe), z=zRidge/zOuter. Vorher war y/z vertauscht → Unterdach hing im falschen Winkel
        [+1,-1].forEach(sx=>{ const C=[uc+sx*half,eYw,zOuter], D=[uc+sx*half,eYw,zEaveV];
          poly(g,[[uc,rYw-0.03,zEaveV],[uc,rYw-0.03,zOuter],[C[0],C[1]-0.03,C[2]],[D[0],D[1]-0.03,D[2]]],'ziegel2');   // UNTERDACH PLANAR (−0.03): das alte Quad lief über die Kehle und wölbte sich ÜBER die Ziegel                                                                    // Unterdach — jetzt deckungsgleich mit den Ziegeln
          eindeckenFlaeche(g,{rY:rYw,eaveDropY:eYw,eZ:half,zMid:uc,sign:sx,axis:'x',trim:true,lift:0.09,    // ECHTE Ziegelreihen — GETEILTES Gesetz, nur x-Achse statt z
            xRangeAt:(y)=>{ let vz=sz*(Dp/2-(y-eaveY)/mS)-sz*0.35; vz=sz>0?Math.max(zRidge,Math.min(vz,zOuter)):Math.min(zRidge,Math.max(vz,zOuter)); return [Math.min(vz,zOuter),Math.max(vz,zOuter)]; }});   // TAL-Inverse − 0.35 ÜBERLAPP: Kehlziegel laufen aufs Blech / füllen den Haupt-NOTCH (Realität: beide Felder überlappen die Kehle)
          strut(g,A[0],A[1]-0.14,A[2], D[0],D[1]-0.14,D[2], 0.14,'holz');                                         // KEHLSPARREN — Struktur UNTER der Haut (war 'ziegel' auf Hauthöhe = die helle Linie)
          strut(g,uc+sx*half,eYw,zEaveV, uc+sx*half,eYw,zOuter, 0.12,'holz');
          beam(g,uc+sx*(half+0.11),eYw+0.02,(zEaveV+zOuter)/2, 0.13,0.11,(Math.abs(zOuter-zEaveV))+0.12,'dunkel'); });   // TRAUFRINNEN-GESETZ: dunkle Rinne vor der ersten Reihe — Farbe zum Dach, kein sichtbares Unterdach                               // Fußpfette
        strut(g,A[0],A[1],A[2], B[0],B[1],B[2], 0.13,'holz');                                             // Firstpfette — korrekt am First
        strut(g,A[0],rYw+0.08,A[2], B[0],rYw+0.08,B[2], 0.20,'ziegel');                                   // Firstziegel — A[2]/B[2] = z
        const zWall=sz*(Dp/2+depth);                                                                      // FIX Issue1: Giebel-Ebene = Flügelwand (Dp/2+depth), NICHT der 0.3-Dachüberstand zOuter
        poly(g,[[uc-half,eYw,zWall],[uc+half,eYw,zWall],[uc,rYw,zWall]],'gefach');                               // Außengiebel (glatt) — bündig mit der Flügelwand
        { const bw2=0.32,bh2=0.15,mm=0.025,bt2=0.07, nr=Math.max(1,Math.round((rYw-eYw)/bh2)); for(let r=0;r<nr;r++){ const by=eYw+(r+0.5)*(rYw-eYw)/nr, xh=half*(rYw-by)/Math.max(0.1,rYw-eYw), ox=(r%2)*bw2*0.5; for(let x0b=Math.floor((-xh-ox)/bw2)*bw2+ox; x0b<xh-0.02; x0b+=bw2){ const cl=Math.max(-xh,x0b),cr=Math.min(xh,x0b+bw2),wx=cr-cl-mm; if(wx<0.06)continue; beam(g,uc+(cl+cr)/2,by,zWall+sz*0.03,wx,(rYw-eYw)/nr-mm,bt2,'backstein'); } } }   // Giebel-Backstein wie die Hauswand (festes x-Raster, an der Schräge geschnitten) — Flügelgiebel keine kahle weisse Fläche mehr
        { const ns=Math.max(2,Math.round(breadth/0.95)); for(let i=0;i<=ns;i++){ const xx=uc-half+breadth*i/ns, top=Math.min(rYw-Math.abs(xx-uc)*wPit, roofUnderY(xx,zWall+sz*0.02)-0.06); if(top>eYw+0.28)beam(g,xx,(eYw+top)/2,zWall+sz*0.02,0.1,top-eYw,0.1,'holz'); } }   // Giebel-Ständer — in der Wandebene, Außenfläche bündig mit den Wandständern
        [-1,1].forEach(s3=>strut(g,uc+s3*half,eYw+0.05,zOuter+sz*0.02, uc,rYw+0.05,zOuter+sz*0.02, 0.09,TRIMR));   // ORTGANG-GESETZ: die RAKE ist die Außengiebel-Kante (konstant zOuter) — vorher D→B = Flächendiagonale (dein Foto)
        [-1,1].forEach(s3=>{ const zF2=sz*(Dp/2-(eYw-eaveY)/mS); strut(g,uc+s3*half,eYw+0.03,zF2, uc,rYw+0.03,zRidge, 0.26,'dunkel'); });   // KEHLBLECH-GESETZ: breite dunkle Rinne exakt AUF der Talformel (Feld-Schnitt + Blech = echte Kehle)
        poly(g,[[uc-half,eaveY-0.30,zEaveV],[uc+half,eaveY-0.30,zEaveV],[uc,rYw,zEaveV]],'gefach');             // INNENGIEBEL (glatt): schließt die senkrechte Fuge zum Hauptdach
      } else if(ROOFMODE!=='flat'){ // ── E/W (parallel zum First): geduckte Quergiebel ──
        const rY=Math.min(eY+half*mS, eaveY-0.3), pit=(rY-eY)/half, eOv=0.32, vOv=0.30, vE=v1+vOv, rA=loc(uc,v0), rB=loc(uc,vE);
        strut(g,rA[0],rY-0.07,rA[1], rB[0],rY-0.07,rB[1], 0.13,'holz');
        [-1,1].forEach(s=>{ const fA=loc(uc+s*(half+eOv),v0), fB=loc(uc+s*(half+eOv),vE);
          strut(g,fA[0],eY,fA[1], fB[0],eY,fB[1], 0.12,'holz'); { const gA=loc(uc+s*(half+eOv+0.11),v0), gB=loc(uc+s*(half+eOv+0.11),vE); strut(g,gA[0],eY+0.02,gA[1], gB[0],eY+0.02,gB[1], 0.12,'dunkel'); }   // TRAUFRINNE E/W
          const nR=Math.max(3,Math.round((vE-v0)/0.8)); for(let i=0;i<=nR;i++){ const vv=v0+(vE-v0)*i/nR, rd=loc(uc,vv), ev=loc(uc+s*(half+eOv),vv); strut(g,ev[0],eY-0.17,ev[1], rd[0],rY-0.12,rd[1], P.spar,'holz'); }
          poly(g,[[fA[0],eY-0.04,fA[1]],[fB[0],eY-0.04,fB[1]],[rB[0],rY+0.02,rB[1]],[rA[0],rY+0.02,rA[1]]],'ziegel2');   // Unterdach
          eindeckenFlaeche(g,{rY:rY, eaveDropY:eY-eOv*pit, eZ:half+eOv, zMid:uc, sign:s, axis:'z', trim:true, lift:0.08,    // ECHTE Ziegel — GETEILTES Gesetz (z-Achse), deckt jetzt auch den E/W-Flügel
            xRangeAt:(yy)=>[Math.min(rA[0],rB[0]), Math.max(rA[0],rB[0])]}); });
        strut(g,rA[0],rY+0.07,rA[1], rB[0],rY+0.07,rB[1], 0.20,'ziegel');
        { const n=Math.max(3,Math.round(breadth/0.46)); for(let i=0;i<n;i++){ const u=u0+breadth*(i+0.5)/n, top=rY-Math.abs(u-uc)*pit, p=loc(u,v1+0.05); if(top>eY+0.05)beam(g,p[0],(eY+top)/2,p[1], 0.06, top-eY, breadth/n*0.97,'gefach'); }
          const ns=Math.max(2,Math.round(breadth/0.95)); for(let i=0;i<=ns;i++){ const u=u0+breadth*i/ns, top=rY-Math.abs(u-uc)*pit, p=loc(u,v1+0.03); if(top>eY+0.28)beam(g,p[0],(eY+top)/2,p[1], 0.1, top-eY, 0.1,'holz'); } }
        { const a0=loc(u0,v0), a1=loc(u1,v0); strut(g,a0[0],(eY+rY)/2,a0[1], a1[0],(eY+rY)/2,a1[1], 0.12,'holz'); }   // Anschlussschürze
        [-1,1].forEach(s3=>{ const pA=loc(uc+s3*(half+eOv),vE+0.03), pB=loc(uc,vE+0.03); strut(g,pA[0],eY-eOv*pit+0.05,pA[1], pB[0],rY+0.05,pB[1], 0.09,TRIMR); });   // ORTGANG-GESETZ am Quergiebel
      }
    };
    wings.forEach(buildOne);
    return g; }
  function balkon(){const g=grp(); if(!P.balcony || levels.length<2 || !balcDoor) return g;
    const side=balcDoor.side, isX=(side==='N');                                                       // Längsachse: x bei N, z bei E/W
    const base = side==='N'?[0,Dp/2] : side==='E'?[W/2,0] : [-W/2,0];                                  // Wandmittelpunkt (Längs-Ursprung auf der Wandebene)
    const outv = side==='N'?[0,1] : side==='E'?[1,0] : [-1,0];                                         // Aussennormale
    const alongHalf = isX? W/2 : Dp/2, bw=clamp((isX?W:Dp)*0.16,1.1,1.7), bd=1.45;
    let aB=clamp(balcDoor.cx, -alongHalf+bw+0.1, alongHalf-bw-0.1);                                    // Längsposition (von der Tür), aus den Ecken geklemmt
    const loc=(al,out,y)=>[ base[0]+(isX?al:0)+outv[0]*out, y, base[1]+(isX?0:al)+outv[1]*out ];       // (längs,aussen,y) → Welt
    const bm=(al,out,y,la,lo,ly,role,rot)=>{ const P=loc(al,out,y); if(isX)beam(g,P[0],y,P[2],la,ly,lo,role,rot); else beam(g,P[0],y,P[2],lo,ly,la,role,rot); };   // Balkenmaße: la=längs, lo=auswärts(Tiefe)
    const sol=(al,out,y,la,lo,ly)=>{ const P=loc(al,out,y); if(isX)addSolid(P[0],y,P[2],la,ly,lo); else addSolid(P[0],y,P[2],lo,ly,la); };
    const _floors = levels.length>=3 ? levels.slice(1).map(L=>L.y) : [levels[1].y];                    // Hochhaus: Balkon je OG; sonst nur OG
    _floors.forEach((yF,_fi)=>{ const _isTop=(_fi===_floors.length-1);
      for(let a=aB-bw;a<=aB+bw+0.01;a+=bw){ bm(a,bd/2,yF-0.12,0.12,bd+0.1,0.16,'holz'); const c0=loc(a,0.02,yF-0.5),c1=loc(a,bd-0.2,yF-0.12); strut(g,c0[0],yF-0.5,c0[2],c1[0],yF-0.12,c1[2],0.1,'holz'); }   // Stichbalken + Konsolen
      bm(aB,bd/2,yF-0.12,2*bw,bd+0.1,0.16,'holz');
      const nb=Math.max(2,Math.round((2*bw)/0.28));                                                    // Boden (begehbar)
      for(let i=0;i<nb;i++){const a=aB-bw+(i+0.5)*2*bw/nb; bm(a,bd/2,yF+0.0,2*bw/nb*0.92,bd,0.06,'boden');}
      sol(aB,bd/2,yF+0.0,2*bw,bd,0.12);
      const railA=(a0,a1,o0,o1)=>{ const h=1.0,la=Math.abs(a1-a0),lo=Math.abs(o1-o0),hor=la>=lo,am=(a0+a1)/2,om=(o0+o1)/2;   // Brüstung als Segment im Frame
        bm(am,om,yF+h, hor?la:0.08, hor?0.08:lo, 0.08,'holz'); bm(am,om,yF+0.5, hor?la:0.06, hor?0.06:lo,0.04,'holz');
        const n=Math.max(2,Math.round(Math.hypot(la,lo)/0.28)); for(let t=0;t<=n;t++){ const f=t/n; bm(a0+(a1-a0)*f,o0+(o1-o0)*f,yF+0.5, 0.05,0.05,1.0,'holz'); }
        sol(am,om,yF+0.5, hor?la:0.12, hor?0.12:lo,1.0); };
      railA(aB-bw,aB+bw, bd,bd); railA(aB-bw,aB-bw, 0,bd); railA(aB+bw,aB+bw, 0,bd);                    // Brüstung 3 Seiten
      if(_isTop && !modern){ const ry=yF+2.05; bm(aB,0.1,ry,2*bw+0.5,0.16,0.1,'holz');                 // Pultdächlein nur auf dem obersten Balkon
        const p0=loc(aB-bw-0.25,0,ry+0.05),p1=loc(aB+bw+0.25,0,ry+0.05),p2=loc(aB+bw+0.25,bd+0.1,ry-0.35),p3=loc(aB-bw-0.25,bd+0.1,ry-0.35); poly(g,[p0,p1,p2,p3],'ziegel2');
        const _co=(isX?base[0]:base[1]); eindeckenFlaeche(g,{rY:ry+0.05,eaveDropY:ry-0.35,eZ:bd+0.1,zMid:(isX?base[1]:base[0]),sign:outv[isX?1:0],xRangeAt:function(){return [_co+aB-bw-0.25,_co+aB+bw+0.25];},trim:true,lift:0.05,axis:(isX?'z':'x')});   // GESETZ: Balkon-Pultdach durch DASSELBE Deckungs-Gesetz geschnitten (Lattung+Ziegel, WINKEL ABGELEITET) — kein hand-gesetztes Sheet im falschen Winkel mehr
        for(let a=aB-bw;a<=aB+bw+0.01;a+=bw){ const s0=loc(a,0,ry+0.05),s1=loc(a,bd+0.05,ry-0.32); strut(g,s0[0],ry+0.05,s0[2],s1[0],ry-0.32,s1[2],0.07,'holz'); } }
      const dw=0.85,dh=2.0,dcy=yF+dh/2, lw=dw/2-0.02,lh=dh-0.06;                                        // Balkontür (Doppelflügel) je Etage
      bm(aB-dw/2-0.05,0,dcy,0.1,0.16,dh+0.1,'holz'); bm(aB+dw/2+0.05,0,dcy,0.1,0.16,dh+0.1,'holz'); bm(aB,0,yF+dh+0.06,dw+0.3,0.16,0.12,'holz');
      const faceY = isX?0:(Math.PI/2);
      [[-1,aB-dw/2+0.02],[1,aB+dw/2-0.02]].forEach(([sgn,ha])=>{ const LL=grp(); const inner=leafFrame(lw,lh,'holz'); inner.position.x=-sgn*lw/2; LL.add(inner);
        const hp=loc(ha,-0.04,dcy); LL.position.set(...deform(hp[0],dcy,hp[2])); LL.rotation.y=faceY+sgn*1.1+(DEF_bk>0?hp[0]*DEF_bk:0);
        const q0=loc(sgn<0?aB-dw/2:aB,0,yF), q1=loc(sgn<0?aB:aB+dw/2,0,yF+dh);
        const bx0=Math.min(q0[0],q1[0])-0.12,bx1=Math.max(q0[0],q1[0])+0.12,bz0=Math.min(q0[2],q1[2])-0.12,bz1=Math.max(q0[2],q1[2])+0.12;
        LL.userData={door:true,preOpen:(!P.doorClosed),openA:sgn*1.1, block:[bx0,yF,bz0,bx1,yF+dh,bz1]}; g.add(LL); });
    });
    return g; }

  // ════ UMFASSUNGSWAND-KOLLISION — generisch: jede der 4 Seiten als Segmente, Lücken für Türen UND Flügeldurchgänge auf DIESER Seite (kein +x-Hardcode) ════
  const Htot=eaveY-baseY, eT=levels[0].top, dpH=baseY+P.doorH;
  const perimWall=(fixed,horiz,alo,ahi,yB,yT,ops)=>{ const seg=(s,e,y0,y1)=>{ if(e-s<0.04||y1-y0<0.03)return; if(horiz)addSolid((s+e)/2,(y0+y1)/2,fixed,e-s,y1-y0,0.3); else addSolid(fixed,(y0+y1)/2,(s+e)/2,0.3,y1-y0,e-s); };
    if(!ops.length){ seg(alo,ahi,yB,yT); return; }
    const yb=Math.max(yB,Math.min(...ops.map(o=>o.y0))), yt=Math.min(yT,Math.max(...ops.map(o=>o.y1))); if(yb>yB+0.02)seg(alo,ahi,yB,yb);
    const gaps=ops.map(o=>[o.a0,o.a1]).sort((a,b)=>a[0]-b[0]); let p=alo; gaps.forEach(([g0,g1])=>{ seg(p,g0,yb,yt); p=Math.max(p,g1); }); seg(p,ahi,yb,yt);
    if(yT>yt+0.02)seg(alo,ahi,yt,yT); };
  const wingOp=sd=>{ const w=wings.find(x=>x.side===sd); if(!(w&&w.door))return [];
    if(!w.outIsX) return [{a0:w.x0+0.2,a1:w.x1-0.2,y0:baseY,y1:eaveY}];                                  // senkrechter (verschmelzender) Flügel: Hauswand über ALLE Geschosse offen → ein Raum
    return [{a0:w.door.lo,a1:w.door.hi,y0:baseY,y1:dpH}]; };
  perimWall(-W/2,false,-Dp/2,Dp/2,baseY,eaveY, (balcDoor&&balcDoor.side==='W')?[...wingOp('W'),{a0:balcDoor.cx-0.5,a1:balcDoor.cx+0.5,y0:eT,y1:eaveY}]:wingOp('W'));   // +Balkontür-OG falls Balkon hier                                            // −x Seitenwand (W-Durchgang)
  perimWall( W/2,false,-Dp/2,Dp/2,baseY,eaveY, (balcDoor&&balcDoor.side==='E')?[...wingOp('E'),{a0:balcDoor.cx-0.5,a1:balcDoor.cx+0.5,y0:eT,y1:eaveY}]:wingOp('E'));   // +Balkontür-OG falls Balkon hier                                            // +x Seitenwand (E-Durchgang)
  { const ops=wingOp('N'); if(backDoor)ops.push({a0:backDoor.cx-0.55,a1:backDoor.cx+0.55,y0:baseY,y1:dpH});
    perimWall(Dp/2,true,-W/2,W/2,baseY,eT, ops);                                                        // +z Rückwand EG (Hintertür + N-Durchgang)
    if(eaveY-eT>0.1) perimWall(Dp/2,true,-W/2,W/2,eT,eaveY, (balcDoor&&balcDoor.side==='N')?[{a0:balcDoor.cx-0.5,a1:balcDoor.cx+0.5,y0:eT,y1:eaveY}]:[]); }   // OG Balkontür
  { const ops=wingOp('S'); ops.push({a0:-doorW/2,a1:doorW/2,y0:baseY,y1:eaveY});
    perimWall(-Dp/2,true,-W/2,W/2,baseY,eaveY, ops); }                                                  // −z Vorderwand (Haustür + S-Durchgang)

  function gelaende(){ const g=grp(); g.noDeform=true; if(P.terrain===0) return g;
    const HX=Math.max(W,Dp)/2+11, HZ=HX;
    if(P.keller){ const FX=(W+0.5)/2, FZ=(Dp+0.5)/2, gx0=-FX,gx1=FX,gz0=-FZ,gz1=FZ;                  // GESETZ (SELBER VEKTOR wie die Fundamentplatte): die Wiese ist die Welt MINUS dem Haus-Sockel. Nicht nur das Treppen-Maul aufgraben — sonst schneidet die Grasnarbe (y=-0.14) quer durch den ausgehobenen Keller (grüne Decke unten) und man läuft beim Abstieg hindurch.
        [[-HX,gx0,-HZ,HZ],[gx1,HX,-HZ,HZ],[gx0,gx1,-HZ,gz0],[gx0,gx1,gz1,HZ]].forEach(([x0,x1,z0,z1])=>{ if(x1-x0<0.06||z1-z0<0.06)return; beam(g,(x0+x1)/2,-0.14,(z0+z1)/2,x1-x0,0.3,z1-z0,'gras'); }); }
    else beam(g,0,-0.14,0,2*HX,0.3,2*HZ,'gras');                                                          // Wiese-Slab (Oberkante ≈ Geländeniveau)
    const pwz0=-Dp/2-0.15, pwz1=-HZ+1.6, wlen=Math.abs(pwz1-pwz0);
    beam(g,0,0.02,(pwz0+pwz1)/2,1.55,0.06,wlen,'weg');                                                   // Vorderweg von der Haustür nach aussen
    for(let z=pwz0-0.5; z>pwz1+0.4; z-=1.0) beam(g,0,0.05,z,1.25,0.05,0.66,'stein');                     // Trittplatten-Rhythmus
    const hzF=-HZ+1.2, hh=0.9;                                                                            // Hecke entlang der Grenze (Toröffnung am Weg)
    [[-HX+0.6,-1.05],[1.05,HX-0.6]].forEach(([a,b])=>{ const n=Math.max(2,Math.round((b-a)/0.9)); for(let i=0;i<n;i++){ const x=a+(b-a)*(i+0.5)/n; beam(g,x,hh/2,hzF,(b-a)/n*0.95,hh,0.5,'laub'); } });
    const baum=(bx,bz)=>{ beam(g,bx,1.1,bz,0.32,2.2,0.32,'stamm'); [[0,2.5,0,1.7],[0.55,3.0,0.35,1.15],[-0.45,3.05,-0.3,1.05],[0.25,3.5,-0.25,0.85]].forEach(([dx,dy,dz,s])=>beam(g,bx+dx,dy,bz+dz,s,s,s,'laub')); };
    baum(HX-2.6,HZ-2.6); baum(-HX+2.6,HZ-3.6); baum(-HX+3.0,-HZ+3.2);                                     // Bäume an den hinteren Ecken
    return g; }
  function hof(){ const g=grp(); if(P.grundriss!=='hof') return g;   // INNENHOF (siheyuan/riad/cour d'honneur) — ADDITIV: zwei Arme + Torriegel um den offenen Hof, der Hof ist die Luft im Ring
    const armW=clamp(W*0.30,2.6,3.6), courtD=clamp(W*1.0,5,9), gateW=2.8, zF=-Dp/2, zC=zF-courtD;
    const wH=Math.min(eaveY-baseY-0.5, P.egH*0.92), wr=(P.stil==='stein'||P.stil==='klinker'||P.stil==='modern')?'putz':((P.stil==='huette'||P.stil==='stroh')?'holz':'gefach');
    const bar=(x0,x1,z0,z1,alongZ,gate)=>{ const cx=(x0+x1)/2,cz=(z0+z1)/2,lx=x1-x0,lz=z1-z0, rY=baseY+wH+(alongZ?lx:lz)/2*0.7;
      beam(g,cx,baseY+0.04,cz,lx,0.08,lz,'boden');
      const xWall=(zz)=>{ if(!gate){ beam(g,cx,baseY+wH/2,zz,lx,wH,0.22,wr); return; }   // ohne Korridor: volle Querwand
        const gw2=gate.w/2, lh=Math.min(wH-0.25, gate.h), L=(gate.x-gw2)-x0, R=x1-(gate.x+gw2);   // EINGANGS-KORRIDOR (Sperrflaeche der Haustuer) bleibt frei → das Tor emergiert auf der Tuer-Achse, nicht hart gesetzt
        if(L>0.05) beam(g,x0+L/2,baseY+wH/2,zz,L,wH,0.22,wr); if(R>0.05) beam(g,x1-R/2,baseY+wH/2,zz,R,wH,0.22,wr);   // Wandstuecke links/rechts vom Tor
        if(wH>lh+0.05) beam(g,gate.x,baseY+(lh+wH)/2,zz,gate.w,wH-lh,0.22,wr); };   // Sturz: die niedrige Wand bestimmt die Torform (flach, kein Bogen)
      xWall(z0); xWall(z1);
      { const nzW=Math.max(1,Math.round(lz/2.2)), wcy=baseY+Math.min(wH-0.55,1.5), wfw=Math.min(0.8,lz/nzW*0.4), wfh=0.9, zh=[];   // HOF-FENSTER-GESETZ: Arme schauen in den Hof UND zur Strasse — LOCHWAND
        for(let i2=0;i2<nzW;i2++){ const pz=z0+lz*(i2+0.5)/nzW; zh.push({c:pz,w:wfw+0.12,b:wcy-wfh/2-0.03,t:wcy+wfh/2+0.03}); }
        lochWand(g,false,x0,z0,z1,baseY,baseY+wH,zh,wr,0.22); lochWand(g,false,x1,z0,z1,baseY,baseY+wH,zh,wr,0.22);
        for(let i2=0;i2<nzW;i2++){ const pz=z0+lz*(i2+0.5)/nzW; fensterAt(g,x0,wcy,pz,wfw,wfh,false); fensterAt(g,x1,wcy,pz,wfw,wfh,false); } }
      if(ROOFMODE==='flat'){ beam(g,cx,baseY+wH+0.06,cz,lx,0.12,lz,'putz'); }   // flaches Hof-Arm-Dach (Mediterran) statt Pultdach
      else { const half=(alongZ?lx:lz)/2, dy=rY-(baseY+wH), ang=Math.atan2(dy,half), len=Math.hypot(half,dy);
      [1,-1].forEach(s=>{ if(alongZ) beam(g,cx+s*half/2,(baseY+wH+rY)/2,cz,len,0.10,lz+0.3,'ziegel',[0,0,-s*ang]);
                          else beam(g,cx,(baseY+wH+rY)/2,cz+s*half/2,lx+0.3,0.10,len,'ziegel',[s*ang,0,0]); }); } };
    bar(-W/2,-W/2+armW,zC+gateW,zF,true);            // linker Arm (First entlang z)   // Arm stößt an den Torriegel — kein Dach-Kreuz
    bar(W/2-armW,W/2,zC+gateW,zF,true);              // rechter Arm
    bar(-W/2,W/2,zC,zC+gateW,false,{x:doorX, w:doorW+0.9, h:P.doorH+0.3});           // Torriegel vorne (First entlang x)
    beam(g,0,baseY+0.03,(zF+zC+gateW)/2,W-2*armW+0.3,0.06,courtD-gateW,'weg');   // Hofpflaster
    const wz=(zF+zC+gateW)/2; beam(g,0,baseY+0.45,wz,1.1,0.9,1.1,'stein'); beam(g,0,baseY+0.92,wz,1.3,0.1,1.3,'stein');   // Brunnen in der Mitte
    return g; }
  // LOCHWAND-GESETZ — EINE Wand-mit-Öffnungen-Quelle: Vollsegmente zwischen den Löchern, Brüstungs- und Sturzband je Loch. Türen UND Fenster sind dieselbe Öffnungs-Art.
  function lochWand(g,horiz,fix,a0,a1,y0,y1,holes,role,tk){ tk=tk||0.24; const B=(c,cy,len,hh)=>{ if(len<0.03||hh<0.03)return; horiz?beam(g,c,cy,fix,len,hh,tk,role):beam(g,fix,cy,c,tk,hh,len,role); };
    const hs=(holes||[]).filter(h=>h.c-h.w/2>a0-0.01&&h.c+h.w/2<a1+0.01).sort((p,q)=>p.c-q.c); let cur=a0;
    for(const h of hs){ const Lh=h.c-h.w/2,Rh=h.c+h.w/2; B((cur+Lh)/2,(y0+y1)/2,Lh-cur,y1-y0); if(h.b>y0+0.04)B(h.c,(y0+h.b)/2,h.w,h.b-y0); if(y1>h.t+0.04)B(h.c,(h.t+y1)/2,h.w,y1-h.t); cur=Rh; }
    B((cur+a1)/2,(y0+y1)/2,a1-cur,y1-y0); }
  // ════ BRÜSTUNGS-GESETZ (SIA 358) — EINE Absturzsicherung für ALLE Kanten (Terrassen-Decks, Turm-Galerie): Handlauf-Oberkante ≥1.00m über Deck, vertikale Stäbe lichte Öffnung ≤0.12m, Fußriegel gegen Bodenspalt — hohl statt massiv ════
  function bruestungSeg(g,axis,x0,x1,z0,z1,deckY,role){ const hor=(axis==='z'), a0=hor?x0:z0, a1=hor?x1:z1, fix=hor?z0:x0, len=a1-a0; if(len<0.14)return;
    const hTop=deckY+1.05, B=(c,y,w,h,t2)=>hor?beam(g,c,y,fix,w,h,t2,role):beam(g,fix,y,c,t2,h,w,role);
    B((a0+a1)/2,hTop-0.035,len,0.07,0.09); B((a0+a1)/2,deckY+0.10,len,0.06,0.07);                                    // Handlauf (OK 1.05) + Fußriegel
    const nP=Math.max(1,Math.round(len/1.5)); for(let i=0;i<=nP;i++)B(a0+len*i/nP,(deckY+hTop)/2,0.07,hTop-deckY,0.07);   // Pfosten
    const nS=Math.max(2,Math.ceil(len/0.16)); for(let i=1;i<nS;i++)B(a0+len*i/nS,(deckY+hTop)/2,0.045,hTop-deckY-0.16,0.045); }   // Stäbe: Pitch ≤0.16 → licht ≤0.115
  function bruestungRect(g,xa,xb,za,zb,deckY,role){ bruestungSeg(g,'z',xa,xb,za,za,deckY,role); bruestungSeg(g,'z',xa,xb,zb,zb,deckY,role); bruestungSeg(g,'x',xa,xa,za,zb,deckY,role); bruestungSeg(g,'x',xb,xb,za,zb,deckY,role); }
  // MERLON-GESETZ (Burgenbau) — Brustwehr mannshoch (Sims ≥1.0 über Deck, man fällt nicht durchs Crenel), Merlon:Crenel ≈ 3:2 — GETEILT von Ringmauer UND Turm
  function merlonSeg(g,axis,x0,x1,z0,z1,deckY,role,dpt){ const hor=(axis==='z'), a0=hor?x0:z0, a1=hor?x1:z1, fix=hor?z0:x0, len=a1-a0; if(len<0.4)return; dpt=dpt||0.42;
    const bw=1.00, sill=deckY+bw, mh=0.75, mw=0.6, n=Math.max(1,Math.floor(len/1.0));
    const B=(c,y,w,h,t2)=>hor?beam(g,c,y,fix,w,h,t2,role):beam(g,fix,y,c,t2,h,w,role);
    B((a0+a1)/2,deckY+bw/2,len+0.3,bw,dpt); B((a0+a1)/2,sill+0.05,len+0.34,0.10,dpt+0.06);                            // Brustwehr + Sims
    for(let i=0;i<n;i++)B(a0+(i+0.5)*len/n,sill+0.10+mh/2,mw,mh,dpt-0.04); }                                          // Merlonen
  function zinnen(){ const g=grp(); if(!P.zinnen||ROUND) return g;   // ZINNEN (Burg) — Wehrgang-Deck aus dachdeckung (EINE flache-Dach-Quelle); Brustwehr+Merlonen = MERLON-GESETZ (geteilt mit dem Turm)
    eachFootEdge((x0,x1,z0,z1,axis,side,r)=>{ merlonSeg(g,axis,x0,x1,z0,z1,(r.a?r.h+0.06:eaveY+0.1),'stein'); });
    return g; }
  function veranda(){ const g=grp(); if(!P.veranda||ROUND) return g;   // VERANDA (Südstaaten/Kolonial/Queenslander) — umlaufender Pfostengang
    const d=1.5, pH=Math.min(2.6,P.egH*0.9), plT=baseY+pH, wT=baseY+pH+0.45, wr='holz';
    const rise=wT-plT, ll=Math.sqrt(d*d+rise*rise), ang=Math.atan2(rise,d);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx2,sz2])=>{ if(GAs.some(A=>A.sx===sx2)) return;   // ECK-GESETZ: Deck-Eckstück + geteilter Pfosten + WALM-Hüfte + GRAT — die Ecken sind verbunden
      const cX=sx2*W/2, cZ=sz2*Dp/2, oX=sx2*(W/2+d), oZ=sz2*(Dp/2+d);
      beam(g,oX-sx2*d/2,baseY+0.05,oZ-sz2*d/2,d,0.1,d,'boden'); beam(g,oX-sx2*d/2,baseY/2,oZ-sz2*d/2,d,baseY,d,'stein'); beam(g,oX,baseY+pH/2,oZ,0.16,pH,0.16,wr);
      poly(g,[[cX,wT+0.06,cZ],[oX,plT+0.06,cZ],[oX,plT+0.06,oZ]],'ziegel'); poly(g,[[cX,wT+0.06,cZ],[oX,plT+0.06,oZ],[cX,plT+0.06,oZ]],'ziegel');
      strut(g,cX,wT+0.08,cZ, oX,plT+0.08,oZ, 0.09,TRIMR); });
    eachFootEdge((x0,x1,z0,z1,axis,side,r)=>{ if(r.a && axis==='z' && side<0) return; if(r.a && axis==='x' && Math.abs(Math.abs(x0)-W/2)<0.12) return;   // INNENKANTE: kein Pult in die Haus-Fuge   // EINFAHRT-GESETZ: die Zufahrt bleibt frei (dasselbe Prinzip wie der Haupteingang)
      const front = axis==='z'&&side<0&&Math.abs(z0+Dp/2)<0.3, gap=front?1.4:0;   // Haupteingang offen lassen
      if(axis==='z'){ const len=x1-x0, zf=z0+side*d, cx=(x0+x1)/2, n=Math.max(2,Math.round(len/2.0));
        beam(g,cx,baseY+0.05,z0+side*d/2,len,0.1,d,'boden');                                              // Deck am Boden
        const _bf=(bx0,bx1)=>{ if(bx1-bx0>0.15) beam(g,(bx0+bx1)/2,baseY/2,z0+side*d/2,bx1-bx0,baseY,d,'stein'); };   // FUNDAMENT unterm Deck → kein Schweben
        if(gap>0){ _bf(x0,-gap); _bf(gap,x1); aussentreppe(g,0,zf,0,side,doorW); }   // Eingang offen → Stufen Grund→Deck (Plattform trifft Grade)
        else _bf(x0,x1);
        for(let i=0;i<=n;i++){ const px=x0+len*i/n; if(gap>0&&Math.abs(px)<gap)continue; beam(g,px,baseY+pH/2,zf,0.16,pH,0.16,wr); }   // Pfosten VOM Boden
        beam(g,cx,plT,zf,len,0.12,0.16,wr);                                                                // Pfette AUF den Pfosten
        beam(g,cx,(plT+wT)/2+0.06,z0+side*(d/2),len,0.08,ll,'ziegel',[side*ang,0,0]);                      // Pultdach: Wand→Pfette
        for(let i=0;i<=n;i++){ const px=x0+len*i/n; if(gap>0&&Math.abs(px)<gap)continue; if(!front)beam(g,px,baseY+0.95,zf,0.06,1.0,0.06,wr); }
      } else { const segs=(r.a?[[z0,z1]]:(()=>{ let S2=[[z0,z1]]; GAs.forEach(A=>{ if(A.sx===Math.sign(side)){ const a=A.z0-0.03,b2=A.z1+0.03, O=[]; S2.forEach(([s0,s1])=>{ if(b2<=s0||a>=s1)O.push([s0,s1]); else { if(a-s0>0.4)O.push([s0,a]); if(s1-b2>0.4)O.push([b2,s1]); } }); S2=O; } }); return S2; })());   // SPLIT-GESETZ: Veranda weicht der Anbau-Zelle — kein Dach durch die Garage
        segs.forEach(([s0,s1])=>{ const len=s1-s0, xf=x0+side*d, cz=(s0+s1)/2, n=Math.max(2,Math.round(len/2.0));
        beam(g,x0+side*d/2,baseY+0.05,cz,d,0.1,len,'boden');
        beam(g,x0+side*d/2,baseY/2,cz,d,baseY,len,'stein');
        for(let i=0;i<=n;i++)beam(g,xf,baseY+pH/2,s0+len*i/n,0.16,pH,0.16,wr);
        beam(g,xf,plT,cz,0.16,0.12,len,wr);
        beam(g,x0+side*(d/2),(plT+wT)/2+0.06,cz,ll,0.08,len,'ziegel',[0,0,-side*ang]);
        for(let i=0;i<=n;i++)beam(g,xf,baseY+0.95,s0+len*i/n,0.06,1.0,0.06,wr); }); }
    });
    return g; }
  function vorkragung(){ const g=grp(); if(!P.vorkragung||levels.length<2||ROUND) return g;   // VORKRAGUNG/JETTY (mittelalterl. Fachwerk) — Obergeschoss kragt vor
    const ov=0.45,y=levels[0].top,wr=(P.stil==='huette'||P.stil==='stroh'||P.stil==='alt')?'holz':'gefach';
    eachFootEdge((x0,x1,z0,z1,axis,side,r)=>{ if(r.a)return;   // Jetty braucht ein Obergeschoss — nicht auf dem flachen Anbau
      if(axis==='z'){ const len=x1-x0,zo=z0+side*ov; beam(g,(x0+x1)/2,y+0.55,zo,len+2*ov,1.05,0.24,wr); beam(g,(x0+x1)/2,y-0.04,z0+side*ov/2,len+2*ov,0.22,ov,'holz'); for(let x=x0+0.3;x<=x1-0.2;x+=0.7)beam(g,x,y-0.2,z0+side*ov*0.7,0.1,0.18,ov*1.25,'holz'); }
      else { const len=z1-z0,xo=x0+side*ov; beam(g,xo,y+0.55,(z0+z1)/2,0.24,1.05,len+2*ov,wr); beam(g,x0+side*ov/2,y-0.04,(z0+z1)/2,ov,0.22,len+2*ov,'holz'); for(let z=z0+0.3;z<=z1-0.2;z+=0.7)beam(g,x0+side*ov*0.7,y-0.2,z,ov*1.25,0.18,0.1,'holz'); } });
    return g; }
  function pilotis(){ const g=grp(); if(!P.pilotis) return g;   // PILOTIS/PFAHLBAU (Le Corbusier/Queenslander/Stelzen) — Stützen unter dem Haus
    const gy=-0.1, h=baseY-gy, wr=(P.stil==='huette'||P.stil==='stroh')?'holz':'putz', nx=Math.max(2,Math.round(W/2.4)), nz=Math.max(2,Math.round(Dp/2.4));
    beam(g,0,baseY-0.12,0,W,0.24,Dp,'boden');   // angehobene Bodenplatte
    for(let ix=0;ix<=nx;ix++)for(let iz=0;iz<=nz;iz++){ const x=-W/2+W*ix/nx, z=-Dp/2+Dp*iz/nz; if(ix>0&&ix<nx&&iz>0&&iz<nz)continue; beam(g,x,gy+h/2,z,0.34,h,0.34,wr); }   // Stützenraster am Rand
    beam(g,0,gy+h/2,0,0.4,h,0.4,wr); return g; }
  function terrasse(){ const g=grp(); if(!P.terrasse) return g;   // TERRASSIERUNG — SETBACK-GESETZ (NYC 1916) + LOCHWAND-GESETZ: ECHTE Fenster-/Tür-Öffnungen in hohlen Tiers; Absturzkanten → BRÜSTUNGS-GESETZ
    const nT=Math.min(4, 2+((P.seed*13)%3)+(P.storeys>2?1:0)), _ir=0.095+((P.seed*7)%4)*0.014, role=(P.stil==='stein'||P.stil==='klinker')?'putz':'stein', grl=(P.stil==='modern'||P.stil==='glas')?'metall':'holz', tH=Math.max(2.2,P.ogH*0.8), fwd=(ww)=>Math.min(0.85,ww), asym=Math.max(-1,Math.min(1,P.terrAsym||0)), wT=0.24; let y=eaveY-0.15, pw=W, pd=Dp, pcx=0, pcz=0;
    for(let t=0;t<nT;t++){ const ins=t*W*_ir, w=Math.max(1.4,W-2*ins), dd=Math.max(1.4,Dp-2*ins), cx=asym*ins, cz=-(Dp-dd)/2;
      if(t===0&&LOFT){ const hx0=LOFT.x0-0.05,hx1=LOFT.x1+0.05,hz0=LOFT.z0-0.05,hz1=LOFT.z1+0.05;   // TREPPENAUGE-GESETZ: von innen erschlossen — der Speicherlauf mündet in Tier 0, SIA-Ring ums Auge
        [[pcx-pw/2,hx0,pcz-pd/2,pcz+pd/2],[hx1,pcx+pw/2,pcz-pd/2,pcz+pd/2],[hx0,hx1,pcz-pd/2,hz0],[hx0,hx1,hz1,pcz+pd/2]].forEach(([a,b2,c2,d2])=>{ if(b2-a>0.06&&d2-c2>0.06) beam(g,(a+b2)/2,y+0.07,(c2+d2)/2,b2-a,0.14,d2-c2,'boden'); });
        bruestungRect(g,hx0,hx1,hz0,hz1,y+0.14,grl); }
      else beam(g,pcx,y+0.07,pcz,pw,0.14,pd,'boden');                                                // GESCHOSSPLATTE über den VORHERIGEN Footprint
      const wy=y+tH*0.5, wh=1.0, nx=Math.max(1,Math.round(w/2.8)), nz=Math.max(1,Math.round(dd/2.8));
      const fx=[],bx=[],sz2=[];
      for(let i=0;i<nx;i++){ const px=cx-w/2+w*(i+0.5)/nx, ww2=fwd(w/nx*0.5); fx.push({c:px,w:ww2+0.14,b:wy-wh/2-0.06,t:wy+wh/2+0.08}); if(!(t>0&&Math.abs(px-cx)<0.8)) bx.push({c:px,w:ww2+0.14,b:wy-wh/2-0.06,t:wy+wh/2+0.08}); }
      for(let i=0;i<nz;i++){ const pz=cz-dd/2+dd*(i+0.5)/nz, ww2=fwd(dd/nz*0.5); sz2.push({c:pz,w:ww2+0.14,b:wy-wh/2-0.06,t:wy+wh/2+0.08}); }
      lochWand(g,true, cz-dd/2+wT/2, cx-w/2, cx+w/2, y, y+tH, fx, role);                                                // Front: echte Fensteröffnungen
      lochWand(g,false, cx-w/2+wT/2, cz-dd/2+wT, cz+dd/2-wT, y, y+tH, sz2, role);
      lochWand(g,false, cx+w/2-wT/2, cz-dd/2+wT, cz+dd/2-wT, y, y+tH, sz2, role);
      if(t===0) lochWand(g,true, cz+dd/2-wT/2, cx-w/2, cx+w/2, y, y+tH, bx, role);
      else { const dwB=0.95, dhB=Math.min(2.05,tH-0.18), zb=cz+dd/2-wT/2;
        lochWand(g,true, zb, cx-w/2, cx+w/2, y, y+tH, bx.concat([{c:cx,w:dwB+0.10,b:y-0.02,t:y+dhB}]), role);           // Rückwand: Fenster UND Terrassentür aus derselben Loch-Quelle
        beam(g,cx,y+0.14+(dhB-0.14)/2,zb+0.10,dwB-0.10,dhB-0.20,0.06,'holz'); beam(g,cx,y+0.17,zb+0.16,dwB+0.2,0.06,0.34,'stein');   // Türblatt + Schwelle auf dem Deck
        const rw={z1:(pcz+pd/2)-(cz+dd/2), x0:(cx-w/2)-(pcx-pw/2), x1:(pcx+pw/2)-(cx+w/2)};
        if(rw.z1>0.15) bruestungSeg(g,'z',pcx-pw/2,pcx+pw/2,pcz+pd/2,pcz+pd/2,y+0.14,grl);
        if(rw.x0>0.15) bruestungSeg(g,'x',pcx-pw/2,pcx-pw/2,pcz-pd/2,pcz+pd/2,y+0.14,grl);
        if(rw.x1>0.15) bruestungSeg(g,'x',pcx+pw/2,pcx+pw/2,pcz-pd/2,pcz+pd/2,y+0.14,grl); }
      for(let i=0;i<nx;i++){ const px=cx-w/2+w*(i+0.5)/nx; fensterAt(g,px,wy,cz-dd/2-0.02,fwd(w/nx*0.5),wh,true); if(t>0&&Math.abs(px-cx)<0.8)continue; fensterAt(g,px,wy,cz+dd/2+0.02,fwd(w/nx*0.5),wh,true); }
      for(let i=0;i<nz;i++){ const pz=cz-dd/2+dd*(i+0.5)/nz; fensterAt(g,cx-w/2-0.02,wy,pz,fwd(dd/nz*0.5),wh,false); fensterAt(g,cx+w/2+0.02,wy,pz,fwd(dd/nz*0.5),wh,false); }
      pw=w; pd=dd; pcx=cx; pcz=cz; y+=tH; }
    beam(g,pcx,y+0.07,pcz,pw,0.14,pd,'boden');                                                                          // Dachplatte des obersten Tiers
    bruestungRect(g,pcx-pw/2,pcx+pw/2,pcz-pd/2,pcz+pd/2,y+0.14,grl);                                                    // oberstes Deck: voller SIA-Ring ab Gehfläche
    beam(g,pcx,y+0.55,pcz,Math.max(1.2,W*0.22),1.1,Math.max(1.2,Dp*0.22),role); const ax=W*0.13,az=Dp*0.13,c=[[-ax,-az],[ax,-az],[ax,az],[-ax,az]]; c.forEach((p,k)=>{const q=c[(k+1)%4]; tri(g,[pcx+p[0],y+1.1,pcz+p[1]],[pcx+q[0],y+1.1,pcz+q[1]],[pcx,y+1.9,pcz],'ziegel');}); return g; }
  function rundbau(){ const g=grp(); if(!ROUND) return g;   // ZYLINDER-GESETZ — runde Wand aus Segmenten, Geschoss-Böden, Kegel/Zwiebel-Dach
    const rad=Math.min(W,Dp)/2, seg=Math.max(18,Math.round(rad*3.5)), nLev=Math.max(1,P.storeys), wallTop=baseY+nLev*P.egH;
    const wr=(P.stil==='huette'||P.stil==='stroh')?'holz':((P.stil==='stein'||P.stil==='klinker'||P.stil==='modern')?'putz':'gefach');
    for(let s=0;s<seg;s++){ const a=(s+0.5)/seg*2*Math.PI; beam(g,(rad+0.05)*Math.cos(a),baseY-0.15,(rad+0.05)*Math.sin(a),2*Math.PI*rad/seg+0.1,0.4,0.45,'stein',[0,Math.PI/2-a,0]); }
    for(let lv=0;lv<=nLev;lv++){ const y=baseY+lv*P.egH; for(let s=0;s<seg;s++){ const a0=s/seg*2*Math.PI,a1=(s+1)/seg*2*Math.PI; tri(g,[0,y,0],[rad*Math.cos(a0),y,rad*Math.sin(a0)],[rad*Math.cos(a1),y,rad*Math.sin(a1)],'boden'); } }
    const doorA=-Math.PI/2; for(let s=0;s<seg;s++){ const a=(s+0.5)/seg*2*Math.PI, x=rad*Math.cos(a), z=rad*Math.sin(a), chord=2*Math.PI*rad/seg+0.06, isDoor=Math.abs(((a-doorA+Math.PI)%(2*Math.PI))-Math.PI)<(1.2/rad);
      for(let lv=0;lv<nLev;lv++){ const y0=baseY+lv*P.egH, wH=P.egH;
        if(isDoor&&lv===0){ beam(g,x,y0+wH-0.4,z,chord,0.8,0.3,wr,[0,Math.PI/2-a,0]); continue; }
        if(s%2===0){ beam(g,x,y0+0.5,z,chord,1.0,0.3,wr,[0,Math.PI/2-a,0]); beam(g,x,y0+wH-0.5,z,chord,1.0,0.3,wr,[0,Math.PI/2-a,0]);
          const ww=chord*0.5,wh=Math.max(0.5,wH-1.9),wy=y0+wH/2,rr=[0,Math.PI/2-a,0]; beam(g,x,wy,z,ww*0.9,wh,0.1,'glas',rr);
          beam(g,x,wy+wh/2+0.07,z,ww+0.18,0.1,0.16,'holz',rr); beam(g,x,wy-wh/2-0.07,z,ww+0.2,0.1,0.18,'holz',rr); beam(g,x,wy,z,0.06,wh,0.13,'holz',rr); beam(g,x,wy,z,ww,0.06,0.13,'holz',rr); }
        else beam(g,x,y0+wH/2,z,chord,wH,0.3,wr,[0,Math.PI/2-a,0]); } }
    { const dHalf=Math.min(1.1,Math.max(0.7,2*Math.PI*rad/seg)), bt=(P.bogenTyp&&P.bogenTyp!=='none')?P.bogenTyp:'rund'; bogenRahmen(g,0,baseY+P.egH-0.6,-rad-0.04,dHalf,true,bt,wr); beam(g,0,baseY-0.02,-rad-0.02,2*dHalf+0.3,0.06,0.35,'stein'); for(let st=0;st<4;st++)beam(g,0,baseY-0.12-st*0.16,-rad-0.35-st*0.32,2*dHalf+0.1,0.16,0.4,'stein'); }   // RUNDBAU-TÜR: der Bogen fliesst auch hier durch + Eingangsstufen
    { const iwr=(P.stil==='huette'||P.stil==='stroh')?'holz':'putz', tIW=0.18, gap=0.55, ri=rad-0.45;   // ECHTE INNENWAENDE: der Zylinder bekommt Raeume statt leerer Roehre
      for(let lv=0; lv<nLev; lv++){ const y0=baseY+lv*P.egH, wh=P.egH, ym=y0+wh/2;
        beam(g, 0, ym, -(ri+gap)/2, tIW, wh, ri-gap, iwr); beam(g, 0, ym, (ri+gap)/2, tIW, wh, ri-gap, iwr);   // Spine entlang z, mittige Tuerluecke
        beam(g, (gap+ri)/2, ym, 0, ri-gap, wh, tIW, iwr); } }   // Querwand +x-Seite, Tuerluecke an der Spine
    const dt=P.dachTyp;
    if(dt==='zwiebel'||P.kuppel){ const base=wallTop,bands=16,prof=t=>[rad*Math.pow(Math.cos(t*Math.PI*0.5),0.6)*(1+0.3*Math.sin(t*Math.PI)),base+rad*1.7*t]; for(let bd=0;bd<bands;bd++){const A=prof(bd/bands),B=prof((bd+1)/bands); for(let s=0;s<seg;s++){const a0=s/seg*2*Math.PI,a1=(s+1)/seg*2*Math.PI; tri(g,[A[0]*Math.cos(a0),A[1],A[0]*Math.sin(a0)],[B[0]*Math.cos(a0),B[1],B[0]*Math.sin(a0)],[B[0]*Math.cos(a1),B[1],B[0]*Math.sin(a1)],'kupfer'); tri(g,[A[0]*Math.cos(a0),A[1],A[0]*Math.sin(a0)],[B[0]*Math.cos(a1),B[1],B[0]*Math.sin(a1)],[A[0]*Math.cos(a1),A[1],A[0]*Math.sin(a1)],'kupfer');}} }
    else { const apexY=wallTop+rad*1.3; for(let s=0;s<seg;s++){ const a0=s/seg*2*Math.PI,a1=(s+1)/seg*2*Math.PI; tri(g,[rad*Math.cos(a0),wallTop,rad*Math.sin(a0)],[rad*Math.cos(a1),wallTop,rad*Math.sin(a1)],[0,apexY,0],'ziegel'); } beam(g,0,apexY+0.2,0,0.1,0.5,0.1,'metall'); }
    return g; }
  function bogenAuf(g,cx,y0,cz,halfW,pierH,depthB,role,typ,horiz){ horiz=(horiz!==false);   // DAS BOGEN-GESETZ: Rund/Spitz/Hufeisen — Pfeiler + Archivolte aus Keilsteinen. Daraus wachsen Arkade, Gewölbe, echte Kuppel
    const yS=y0+pierH, R=halfW; if(horiz){ beam(g,cx-halfW-0.16,(y0+yS)/2,cz,0.32,pierH,depthB,role); beam(g,cx+halfW+0.16,(y0+yS)/2,cz,0.32,pierH,depthB,role); } else { beam(g,cx,(y0+yS)/2,cz-halfW-0.16,depthB,pierH,0.32,role); beam(g,cx,(y0+yS)/2,cz+halfW+0.16,depthB,pierH,0.32,role); }
    bogenRahmen(g,cx,yS,cz,R,horiz,typ,role); }   // EINE Bogenkurve: Arkade nutzt jetzt dasselbe Gesetz wie die Fenster/Tür-Öffnungen
  function arkade(){ const g=grp(); if(!P.arkade) return g;   // ARKADE/KREUZGANG (Rom/Romanik/Islam/Gotik) — folgt jetzt dem GETEILTEN Grundriss-Umriss (eachFootEdge) wie zinnen/vorkragung/veranda; Orientierung via bogenAuf-horiz
    const typ=P.bogenTyp==='none'?'rund':P.bogenTyp, pierH=Math.min(3.4,Math.max(2.4,eaveY-baseY-0.5)), d=1.8, rH=pierH+0.9, tilt=Math.PI*0.14;
    eachFootEdge((x0,x1,z0,z1,axis,side,r)=>{
      if(axis==='z'){ const len=x1-x0, zf=z0+side*d, n=Math.max(2,Math.round(len/2.6));
        for(let i=0;i<n;i++){ const x=x0+(i+0.5)*len/n; bogenAuf(g,x,baseY,zf,len/n/2-0.18,pierH,0.5,'stein',typ,true); }
        beam(g,(x0+x1)/2,baseY+0.05,z0+side*d/2,len+0.4,0.1,d,'weg');
        beam(g,(x0+x1)/2,baseY+(pierH+rH)/2,z0+side*d*0.5,len+0.6,0.12,d+0.5,'ziegel',[side*tilt,0,0]); }
      else { const len=z1-z0, xf=x0+side*d, n=Math.max(2,Math.round(len/2.6));
        for(let i=0;i<n;i++){ const z=z0+(i+0.5)*len/n; bogenAuf(g,xf,baseY,z,len/n/2-0.18,pierH,0.5,'stein',typ,false); }
        beam(g,x0+side*d/2,baseY+0.05,(z0+z1)/2,d,0.1,len+0.4,'weg');
        beam(g,x0+side*d*0.5,baseY+(pierH+rH)/2,(z0+z1)/2,d+0.5,0.12,len+0.6,'ziegel',[0,0,-side*tilt]); }
    });
    return g; }
  function turm(){ const g=grp(); if(!P.turm) return g;   // TURM — HOHL (LOCHWAND-GESETZ: echte Fenster + echtes Portal + Geschossböden), an die Ringmauer gebunden, Standort aus der BELEGUNGS-QUELLE, bei Burg ZINNENKRANZ
    const tw=Math.min(2.2,Math.max(1.4,W*0.22)), _oE=OCC.has('E'),_oW=OCC.has('W'),_oN=OCC.has('N'), sx=!_oE?1:(!_oW?-1:0), szT=(!_oE||!_oW)?-1:1, tx=(sx===0)?0:sx*(W/2+tw/2-0.18), tz=szT<0?(-Dp/2+tw/2-0.18):(Dp/2+tw/2-0.18), h=ridgeY-baseY+Math.max(4.5,P.storeys*2.0), wr=(P.stil==='huette'||P.stil==='stroh')?'holz':'stein', twT=0.26;
    if(_oE&&_oW&&_oN) return g;                                                                     // TURM-VERZICHTS-GESETZ: kein freier Platz an der Hülle — ehrlich statt Kollision (E→W→Heck-Mitte)
    const fw2=Math.min(0.85,tw*0.5), fh=1.05, nLv=Math.max(1,Math.floor(h*0.72/2.4)), pw2=Math.min(0.6,tw*0.36), pH=1.55;
    const zF=tz-tw/2+twT/2, zB=tz+tw/2-twT/2, xL=tx-tw/2+twT/2, xR=tx+tw/2-twT/2, zP=(szT<0?zF:zB), zQ=(szT<0?zB:zF), lvH=2.4, nB=Math.ceil(h/lvH);   // GESCHOSS-BAND-GESETZ: jede Fassade bandweise — lochWand je Ebene (Löcher übereinander sauber getrennt)
    for(let s=0;s<nB;s++){ const y0=baseY+s*lvH, y1=Math.min(baseY+h, y0+lvH), cy=baseY+1.8+s*2.4, hasW=(s>=1&&s<nLv);
      const wHole=hasW?[{c:tx,w:fw2+0.12,b:cy-fh/2-0.03,t:cy+fh/2+0.03}]:[], sHole=hasW?[{c:tz,w:fw2+0.12,b:cy-fh/2-0.03,t:cy+fh/2+0.03}]:[];
      lochWand(g,true, zP, tx-tw/2, tx+tw/2, y0, y1, (s===0?[{c:tx,w:pw2*2-0.02,b:y0-0.02,t:baseY+pH}]:wHole), wr, twT);   // Front: EG=Portal, darüber Fenster
      lochWand(g,true, zQ, tx-tw/2, tx+tw/2, y0, y1, wHole, wr, twT);
      lochWand(g,false, xL, tz-tw/2+twT, tz+tw/2-twT, y0, y1, sHole, wr, twT);
      lochWand(g,false, xR, tz-tw/2+twT, tz+tw/2-twT, y0, y1, sHole, wr, twT); }
    for(let s=1;s<=nLv;s++){ const fy=baseY+Math.min(h-0.35, s*2.4); beam(g,tx,fy+0.06,tz,tw-2*twT+0.06,0.12,tw-2*twT+0.06,'boden'); }   // GESCHOSSBÖDEN — der Schaft ist bewohnbar
    bogenRahmen(g,tx,baseY+pH,tz+szT*(tw/2+0.03),pw2,true,(P.bogenTyp&&P.bogenTyp!=='none')?P.bogenTyp:'rund',wr); beam(g,tx,baseY+0.75,tz+szT*(tw/2-0.06),pw2*2-0.14,1.5,0.09,'holz'); aussentreppe(g,tx,tz+szT*(tw/2+0.08),0,szT,pw2*2);   // Blendbogen + Torblatt in der Laibung + Stufen
    { for(let s=1;s<nLv;s++){ const cy=baseY+1.8+s*2.4;
      fensterAt(g,tx,cy,tz-tw/2-0.02,fw2,fh,true); fensterAt(g,tx,cy,tz+tw/2+0.02,fw2,fh,true);
      fensterAt(g,tx-tw/2-0.02,cy,tz,fw2,fh,false); fensterAt(g,tx+tw/2+0.02,cy,tz,fw2,fh,false); } }
    if(P.zinnen){ const dy=baseY+h, e2=tw/2+0.25; beam(g,tx,dy+0.06,tz,tw+0.5,0.12,tw+0.5,'stein');   // WEHRPLATTFORM + Zinnenkranz
      merlonSeg(g,'z',tx-e2,tx+e2,tz-e2,tz-e2,dy+0.12,'stein',0.30); merlonSeg(g,'z',tx-e2,tx+e2,tz+e2,tz+e2,dy+0.12,'stein',0.30);
      merlonSeg(g,'x',tx-e2,tx-e2,tz-e2,tz+e2,dy+0.12,'stein',0.30); merlonSeg(g,'x',tx+e2,tx+e2,tz-e2,tz+e2,dy+0.12,'stein',0.30);
      beam(g,tx,dy+0.95,tz,0.08,1.7,0.08,'metall'); }
    else { const gy=baseY+h*0.82, gw=tw+0.6; beam(g,tx,gy,tz,gw,0.18,gw,'stein'); bruestungRect(g,tx-gw/2,tx+gw/2,tz-gw/2,tz+gw/2,gy+0.09,'stein');
      const sh=tw*2.4, ty=baseY+h, cor=[[-1,-1],[1,-1],[1,1],[-1,1]]; cor.forEach((c2,k)=>{ const q=cor[(k+1)%4]; tri(g,[tx+c2[0]*tw/2,ty,tz+c2[1]*tw/2],[tx+q[0]*tw/2,ty,tz+q[1]*tw/2],[tx,ty+sh,tz],'ziegel'); });
      beam(g,tx,ty+sh+0.3,tz,0.1,0.6,0.1,'metall'); } return g; }
  function dachAlt(){ const g=grp(); const dt=P.dachTyp; if(ROOFMODE!=='alt') return g;   // DACHTYPEN-ZOO — eine Auswahl swappt die Silhouette
    const ez=Dp/2, ex=W/2, eY=eaveY, top=ridgeY, role='ziegel';
    if(dt==='pyramide'){ const ap=[0,eY+Math.max(2,W*0.42),0],c=[[-ex,-ez],[ex,-ez],[ex,ez],[-ex,ez]]; c.forEach((p,k)=>{const q=c[(k+1)%4]; tri(g,[p[0],eY,p[1]],[q[0],eY,q[1]],ap,role);}); }
    else if(dt==='mansard'){ const knee=eY+(top-eY)*0.55, kz=ez*0.45; [1,-1].forEach(s=>{ poly(g,[[-ex,eY,s*ez],[ex,eY,s*ez],[ex,knee,s*kz],[-ex,knee,s*kz]],role); poly(g,[[-ex,knee,s*kz],[ex,knee,s*kz],[ex,top,0],[-ex,top,0]],role); }); [1,-1].forEach(sx=>{ poly(g,[[sx*ex,eY,ez],[sx*ex,eY,-ez],[sx*ex,knee,-kz],[sx*ex,knee,kz]],'gefach'); poly(g,[[sx*ex,knee,kz],[sx*ex,knee,-kz],[sx*ex,top,0]],'gefach'); }); }
    else if(dt==='kegel'){ const rad=Math.min(ex,ez), ay=eY+rad*1.8, seg=22; for(let s=0;s<seg;s++){ const a0=s/seg*2*Math.PI,a1=(s+1)/seg*2*Math.PI; tri(g,[rad*Math.cos(a0),eY,rad*Math.sin(a0)],[rad*Math.cos(a1),eY,rad*Math.sin(a1)],[0,ay,0],role); } }
    else if(dt==='pult'){ poly(g,[[-ex,eY,-ez],[ex,eY,-ez],[ex,top,ez],[-ex,top,ez]],role); [1,-1].forEach(sx=>poly(g,[[sx*ex,eY,-ez],[sx*ex,top,ez],[sx*ex,eY,ez]],'gefach')); }
    else if(dt==='tonne'){ const seg=16,rad=ez; for(let s=0;s<seg;s++){ const a0=Math.PI*s/seg,a1=Math.PI*(s+1)/seg, z0=-rad*Math.cos(a0),y0=eY+rad*Math.sin(a0),z1=-rad*Math.cos(a1),y1=eY+rad*Math.sin(a1); poly(g,[[-ex,y0,z0],[ex,y0,z0],[ex,y1,z1],[-ex,y1,z1]],role); [1,-1].forEach(sx=>tri(g,[sx*ex,eY,0],[sx*ex,y0,z0],[sx*ex,y1,z1],'gefach')); } }
    else if(dt==='schmetterling'){ const valY=eY-0.3; [1,-1].forEach(s=>poly(g,[[-ex,top,s*ez],[ex,top,s*ez],[ex,valY,0],[-ex,valY,0]],role)); }
    else if(dt==='zwiebel'){ const rad=Math.min(ex,ez),base=eY,seg=18,bands=12,prof=t=>[rad*Math.pow(Math.cos(t*Math.PI*0.5),0.6)*(1+0.3*Math.sin(t*Math.PI)),base+rad*1.7*t]; for(let bd=0;bd<bands;bd++){const A=prof(bd/bands),B=prof((bd+1)/bands); for(let s=0;s<seg;s++){const a0=s/seg*2*Math.PI,a1=(s+1)/seg*2*Math.PI; tri(g,[A[0]*Math.cos(a0),A[1],A[0]*Math.sin(a0)],[B[0]*Math.cos(a0),B[1],B[0]*Math.sin(a0)],[B[0]*Math.cos(a1),B[1],B[0]*Math.sin(a1)],'kupfer'); tri(g,[A[0]*Math.cos(a0),A[1],A[0]*Math.sin(a0)],[B[0]*Math.cos(a1),B[1],B[0]*Math.sin(a1)],[A[0]*Math.cos(a1),A[1],A[0]*Math.sin(a1)],'kupfer');}} }
    return g; }
  function portikus(){ const g=grp(); if(!P.portikus) return g;   // SÄULEN/PORTIKUS (griech. Tempel / Antebellum) — Kolonnade + Gebälk + Tympanon vor der Eingangsfront
    const ez=Dp/2, depth=2.4, nC=Math.max(4,Math.round(W/2.6)), colH=Math.max(2.0,eaveY-baseY-0.25), x0=-W/2+0.5, x1=W/2-0.5, zc=-ez-depth+0.45, bT=baseY+0.02;
    beam(g,0,baseY/2,zc,(x1-x0)+1.0,baseY,depth+0.3,'stein');   // KREPIDOMA-Basis bis Grade → kein Schweben
    beam(g,0,bT+0.1,zc,(x1-x0)+1.0,0.22,depth+0.3,'stein'); aussentreppe(g,0,zc-(depth+0.3)/2,0,-1,(x1-x0)*0.55);   // Stylobat + Tempelstufen Grund→Stylobat
    { const zSB=zc+(depth+0.3)/2; beam(g,0,bT+0.1,(zSB+(-ez))/2,(x1-x0)+1.4,0.22,(-ez)-zSB+0.15,'stein'); }   // VORPLATZ-GESETZ: gepflasterter Vorplatz in voller Portikus-Breite — die Anschlussfuge ist ZU, niemand fällt
    for(let i2=0;i2<nC;i2++){ const x=x0+(x1-x0)*i2/(nC-1), cy0=bT+0.21;
      beam(g,x,cy0+0.1,zc,0.5,0.2,0.5,'stein');
      const sg=7; for(let s=0;s<sg;s++){ const t=(s+0.5)/sg, r=0.20*(1-0.12*Math.sin(t*Math.PI)); beam(g,x,cy0+0.2+(s+0.5)*colH/sg,zc,r*2,colH/sg*0.99,r*2,'putz'); }   // Schaft + Entasis
      beam(g,x,cy0+0.2+colH+0.08,zc,0.46,0.16,0.46,'stein'); }   // Kapitell
    const arY=bT+0.21+0.2+colH+0.16; beam(g,0,arY+0.18,zc,(x1-x0)+0.7,0.36,depth*0.7,'putz');   // Gebälk
    beam(g,0,arY+0.42,zc,(x1-x0)+0.95,0.09,depth*0.78,'stein');   // GEISON-Leiste über dem Gebälk — das Dach LIEGT sichtbar auf, nicht rangebastelt
    const pY=arY+0.36, apex=pY+Math.max(0.9,W*0.12), zf=zc-depth*0.22, zb=zc+depth*0.22;
    poly(g,[[x0-0.35,pY,zf],[x1+0.35,pY,zf],[0,apex,zf]],'putz'); poly(g,[[x0-0.35,pY,zb],[0,apex,zb],[x1+0.35,pY,zb]],'putz');   // Tympanon vorn+hinten
    [-1,1].forEach(sd=>{ eindeckenFlaeche(g,{rY:apex, eaveDropY:pY, eZ:(x1+0.35), zMid:0, sign:sd, axis:'x', trim:true, lift:0.07, xRangeAt:(yy)=>[zf,zb]});   // PORTIKUS-DACH nach DACH-RICHTLINIEN: dieselbe Reihen-Deckung wie das Haus
      strut(g,sd*(x1+0.35),pY+0.05,zf, 0,apex+0.05,zf, 0.08,TRIMR); strut(g,sd*(x1+0.35),pY+0.05,zb, 0,apex+0.05,zb, 0.08,TRIMR);   // ORTGANG beidseitig, stilkonform
      beam(g,sd*(x1+0.40),pY+0.02,zc, 0.11,0.10,(zb-zf)+0.10,'dunkel'); });   // TRAUFRINNE je Seite
    strut(g,0,apex+0.10,zf, 0,apex+0.10,zb, 0.16,'ziegel');   // Firstkappe
    { const zW=-ez, zP=zc+depth*0.10, run=Math.abs(zW-zP), hW=arY+0.55, hP=arY+0.16, hyp=Math.hypot(run,hW-hP);   // VERBINDUNGSDACH GENEIGT: fällt von der Wand zum Gebälk (kein Flachbrett)
      beam(g,0,(hW+hP)/2+0.04,(zW+zP)/2,(x1-x0)+0.7,0.09,hyp,'ziegel',[Math.atan2(hW-hP, zW-zP),0,0]);
      beam(g,0,hW+0.05,zW+0.03,(x1-x0)+0.8,0.09,0.12,'dunkel'); }   // WANDANSCHLUSS-Schürze
    return g; }
  function kuppel(){ const g=grp(); if(!P.kuppel||ROUND) return g;   // KUPPEL auf PENDENTIFS (Byzanz/Osmanen) — sphärische Zwickel tragen Quadrat→Kreis, dann Tambour-Trommel, dann Dom
    const rad=Math.min(W,Dp)/2-0.05, base=eaveY-0.1, springY=base+rad*0.55, seg=24, bands=18;
    const prof=t=>{ const y=springY+rad*1.4*t, r=rad*Math.pow(Math.cos(t*Math.PI*0.5),0.62)*(1+0.30*Math.sin(t*Math.PI)); return [Math.max(0.02,r),y]; };   // ab Springlinie: breit → Zwiebelbauch → Spitze
    { const seg2=8; [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sz])=>{ const cxp=sx*(W/2-0.04), czp=sz*(Dp/2-0.04), cd=Math.atan2(czp,cxp); for(let k=0;k<seg2;k++){ const a0=cd-Math.PI/4+(k/seg2)*Math.PI/2, a1=cd-Math.PI/4+((k+1)/seg2)*Math.PI/2; tri(g,[cxp,base,czp],[rad*Math.cos(a0),springY,rad*Math.sin(a0)],[rad*Math.cos(a1),springY,rad*Math.sin(a1)],'putz'); } }); }   // PENDENTIFS: vier sphärische Eckzwickel
    [-Dp/2,Dp/2].forEach(zf=>beam(g,0,base+0.12,zf,W,0.35,0.2,'putz')); [-W/2,W/2].forEach(xf=>beam(g,xf,base+0.12,0,0.2,0.35,Dp,'putz'));   // Gesims-Ring auf der Wandkrone
    beam(g,0,eaveY+0.05,0,W,0.12,Dp,'putz');   // ZWISCHENBODEN: fertige Decke auf der Wandkrone schliesst die Kuppelkammer -> die nackten Geschossbalken verschwinden, der Dom sitzt auf einer Flaeche statt auf Luft
    [-Dp/2,Dp/2].forEach(zf=>beam(g,0,(base+springY)/2,zf,W,springY-base,0.22,'putz'));   // TAMBOUR-KASTEN: schliesst Wandkrone→Springlinie an den Seiten (Pendentifs bleiben innen) → kein Durchblick mehr
    [-W/2,W/2].forEach(xf=>beam(g,xf,(base+springY)/2,0,0.22,springY-base,Dp,'putz'));
    beam(g,0,springY-0.04,0,W,0.1,Dp,'putz');   // Deck auf dem Kasten → der Dom sitzt auf einer Flaeche
    [-Dp/2,Dp/2].forEach(zf=>{ for(let i=-1;i<=1;i++) beam(g,i*W*0.27,base+(springY-base)*0.55,zf,W*0.13,(springY-base)*0.42,0.05,'glas'); }); [-W/2,W/2].forEach(xf=>{ for(let i=-1;i<=1;i++) beam(g,xf,base+(springY-base)*0.55,i*Dp*0.27,0.05,(springY-base)*0.42,Dp*0.13,'glas'); });   // Fenster im Tambour-Kasten (ersetzt die innen verdeckte Rundtrommel)
    for(let bd=0;bd<bands;bd++){ const a=prof(bd/bands),bb=prof((bd+1)/bands),r0=a[0],y0=a[1],r1=bb[0],y1=bb[1];
      for(let s=0;s<seg;s++){ const a0=s/seg*2*Math.PI,a1=(s+1)/seg*2*Math.PI,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);
        const P00=[r0*c0,y0,r0*s0],P01=[r0*c1,y0,r0*s1],P10=[r1*c0,y1,r1*s0],P11=[r1*c1,y1,r1*s1];
        tri(g,P00,P10,P11,'kupfer'); tri(g,P00,P11,P01,'kupfer'); } }
    const tp=prof(1)[1]; beam(g,0,tp+0.3,0,0.16,0.7,0.16,'metall'); beam(g,0,tp+0.78,0,0.34,0.1,0.06,'metall'); beam(g,0,tp+0.78,0,0.06,0.1,0.34,'metall');   // Spitze + Kreuz/Mond
    return g; }
  const MK=(k,f)=>(P.nur&&P.nur[k]===false)?grp():f();   // LAZY-KERN: Mass-Modus baut Verdichter gar nicht erst
  const _mkSubs=()=>({ fundament:MK('fundament',fundament), gelaende:MK('gelaende',gelaende), geruest:MK('geruest',geruest), riegel:MK('riegel',riegel), streben:MK('streben',streben), zimmermann:MK('zimmermann',zimmermann),
    gefache:MK('gefache',gefache), giebel:MK('giebel',giebel), dachwerk:MK('dachwerk',dachwerk), dachdeckung:MK('dachdeckung',dachdeckung),
    boeden:MK('boeden',boeden), innenwaende:MK('innenwaende',innenwaende), herd:MK('herd',herd), treppe:MK('treppe',treppe), tueren:MK('tueren',tueren), fenster:MK('fenster',fenster), moebel:MK('moebel',moebel),
    anbau:MK('anbau',anbau), fluegel:MK('fluegel',()=>{ try{ return fluegel(); }catch(e){ console.warn('Flügel übersprungen:',e.message); return grp(); } }), balkon:MK('balkon',balkon), kuppel:MK('kuppel',kuppel), portikus:MK('portikus',portikus), hof:MK('hof',hof), dachAlt:MK('dachAlt',dachAlt), arkade:MK('arkade',arkade), turm:MK('turm',turm), zinnen:MK('zinnen',zinnen), veranda:MK('veranda',veranda), vorkragung:MK('vorkragung',vorkragung), pilotis:MK('pilotis',pilotis), terrasse:MK('terrasse',terrasse), rundbau:MK('rundbau',rundbau) });   // NUR-VOLLGATTER-GESETZ: JEDE Fabrik durch MK — 16 von 30 liefen am nur-Gate vorbei, DESTNUR/Aufsatz-Schlüssel waren drei Runden lang TOT (Eigendach- und Giebel-Fix griffen nie)
  const _s0=_s;                                                                                          // RNG-Schnappschuss vor Einheit A
  const subsystems=_mkSubs();                                                                            // Einheit A
  if(P.doppel){ _s=_s0; SHIFT=W; const B=_mkSubs(); SHIFT=0;                                             // Einheit B: identisch, Collision um +W (SHIFT), Geometrie um +W über Gruppen-Transform
    for(const k in B){ if(k==='gelaende')continue; if(subsystems[k]){ B[k].position.x=W; subsystems[k].add(B[k]); } }
    beam(subsystems.geruest, W/2, baseY+(eaveY-baseY)/2, 0, 0.34, eaveY-baseY, Dp-0.1, 'stein'); }       // BRANDWAND: massive geteilte Wand zwischen den Einheiten
  function bendPlan(){ if(!(P.bend>0) || typeof THREE==='undefined' || !THREE.Matrix4 || !THREE.Vector3) return;
    try{ const k=P.bend*2.0/Math.max(8,W), R=1/k;   // GESETZ: EINE Verformung biegt den GANZEN Grundriss zum Bogen — I→U aus demselben Frame, kein neuer Code
      const warp=g=>{ if(!g||!g.traverse)return; g.traverse(m=>{ if(!m.isMesh||!m.geometry||!m.geometry.attributes||!m.geometry.attributes.position)return;
        if(m.updateWorldMatrix)m.updateWorldMatrix(true,false); const mw=m.matrixWorld; if(!mw||!mw.elements)return; const inv=new THREE.Matrix4(); inv.copy(mw); inv.invert();
        const pos=m.geometry.attributes.position, V=THREE.Vector3;
        for(let i=0;i<pos.count;i++){ const v=new V(pos.getX(i),pos.getY(i),pos.getZ(i)); v.applyMatrix4(mw);
          const th=v.x*k, dz=v.z; v.x=(R+dz)*Math.sin(th); v.z=-R+(R+dz)*Math.cos(th);   // ECHTER Bogen: Querschnitte ROTIEREN um Zentrum (0,-R) → I→U, nicht verschieben
          v.applyMatrix4(inv); pos.setX(i,v.x); pos.setY(i,v.y); pos.setZ(i,v.z); }
        pos.needsUpdate=true; if(m.geometry.computeVertexNormals)m.geometry.computeVertexNormals(); }); };
      for(const key in subsystems){ if(key==='gelaende')continue; warp(subsystems[key]); }
    }catch(e){ /* Headless-Stub → reine Render-Verformung */ } }
  /* bendPlan() ENTFERNT — Biegung im deform-Feld */
  const order=['fundament','gelaende','geruest','riegel','streben','zimmermann','gefache','giebel','dachwerk','dachdeckung','boeden','innenwaende','herd','treppe','tueren','fenster','moebel','anbau','fluegel','balkon','kuppel','portikus','hof','dachAlt','arkade','turm','zinnen','veranda','vorkragung','pilotis','terrasse','rundbau'];
  function build(enabled){const root=grp(); order.forEach(k=>{ if(!enabled||enabled[k]!==false){ subsystems[k].position.y=0; root.add(subsystems[k]); } }); return root; }
  const spawn={x:0,y:baseY+1.6,z:-Dp/2-2.0};
  const windowOpenings=[];
  WALLS.forEach(w=>{ if(!w.win)return; const wd=winW(w),c=(w.lo+w.hi)/2; windowOpenings.push({cx:w.horiz?c:w.fixed, cy:w.win.cy, cz:w.horiz?w.fixed:c, w:wd, h:w.win.ch, perp:w.horiz?'z':'x', kind:'stockwerk'}); });
  if(gableWin){ [1,-1].forEach(sx=>windowOpenings.push({cx:sx*(W/2-0.02), cy:gableWin.cy, cz:0, w:gableWin.wz, h:gableWin.hy, perp:'x', kind:'giebel'})); }
  GAs.forEach(A=>windowOpenings.push({cx:A.xout, cy:0.06+1.2, cz:A.zc, w:0.8, h:0.55, perp:'x', kind:'anbau'}));   // Anbau-Fenster außen — seitenrichtig (war x1)
  const annexDoors = GAs.length ? GAs.flatMap(A=>{ const tw=Math.min(2.45,A.gw-0.55), t0=A.xin+A.sx*0.30, tlo=Math.min(t0,t0+A.sx*tw), thi=Math.max(t0,t0+A.sx*tw), p0=A.xin+A.sx*0.35;
    return [ {x0:tlo, x1:thi, y0:0.06, y1:0.06+2.0, z:A.z0, kind:'tor'},
             {x0:Math.min(p0,p0+A.sx*0.85), x1:Math.max(p0,p0+A.sx*0.85), y0:0.06, y1:0.06+2.0, z:A.z1, kind:'personentuer'} ]; }) : [];
  return { P, subsystems, order, solids, build, spawn, floors:levels.map(L=>L.y), windows:windowOpenings, annexDoors,
    cellar: P.keller?{x0:-(W/2-0.08),x1:(W/2-0.08),z0:-(Dp/2-0.08),z1:(Dp/2-0.08),floorY:kellerY+0.12}:null,
    wings: wings.map(w=>({side:w.side,outIsX:w.outIsX,ox:w.ox,oz:w.oz,x0:w.x0,x1:w.x1,z0:w.z0,z1:w.z1,eY:w.eY,rY:w.rY,roofAt:w.roofAt,door:w.door})),
    grundriss: P.grundriss,
    dims:{W,D:Dp,eaveY,ridgeY,baseY,egTop:levels[0].top, storeys:P.storeys, hip:P.hip, brace:P.brace, fw, balcDoorX:balcDoor?balcDoor.cx:null, backDoorX:backDoor?backDoor.cx:null,
      rooms:rooms.map(r=>({side:r.side,cx:r.cx,cz:r.cz,floor:r.floor,x0:r.x0,x1:r.x1,z0:r.z0,z1:r.z1,y:r.y,func:r.func})), stairX0:wx0, stairX1:wx1, stairZ0:stZ0, stairZ1:wz1,
      flights:flights.map(f=>({base:f.base,x0:f.x0,x1:f.x1,zFoot:f.zFoot,dir:f.dir,N:f.N,rise:f.rise,go:f.go,isLoft:f.isLoft,atLevel:f.atLevel,tr:f.tr})), levelsY:levels.map(L=>L.y),
      loft:LOFT?{x0:LOFT.x0,x1:LOFT.x1,z0:LOFT.z0,z1:LOFT.z1,xc:LOFT.xc,base:LOFT.base,top:LOFT.top,N:LOFT.N,rise:LOFT.rise,go:LOFT.go}:null}, furniture, chimney, roofY };
}

    // ═══════════════════════════════════════════════════════════════════════
    //  DIE TEXTUR-BÄCKER — byte-treu (Läuferverband · Biberschwanz · Kellenwurf ·
    //  Quaderverband). document-gegated (try/catch → null): Worker/Node backen
    //  kartenlos, die Vertex-Farben + die KARTEN-GRUND-REGEL tragen den Ton.
    // ═══════════════════════════════════════════════════════════════════════
    // prettier-ignore
    function texZiegelwand(grund,seed2){ try{                                                     // TEXTUR-SAME MAUERWERK: Läuferverband aus NF-Regeln (24×7.1cm, Fuge 1.1cm, Halbstein-Versatz, Brandton je Stein) — wächst aus demselben Wissen wie die Stein-für-Stein-Geometrie
  const cv=document.createElement('canvas'); cv.width=256; cv.height=256; const cx=cv.getContext&&cv.getContext('2d'); if(!cx) return null;
  const M1=128, sw=0.24*M1, sh=0.071*M1, fu=0.011*M1;
  let hh=(seed2*2654435761)>>>0; const r2=()=>{hh^=hh<<13;hh^=hh>>>17;hh^=hh<<5;hh>>>=0;return (hh&0xffff)/0x10000;};
  const gr=grund>>16&255, gg=grund>>8&255, gb=grund&255;
  cx.fillStyle='#b7b0a2'; cx.fillRect(0,0,256,256);
  for(let y=0,reihe=0;y<256;y+=sh+fu,reihe++){ const off=(reihe%2)*(sw+fu)/2;
    for(let x=-sw;x<256+sw;x+=sw+fu){ const t=0.84+r2()*0.3;
      cx.fillStyle='rgb('+Math.min(255,gr*t|0)+','+Math.min(255,gg*t|0)+','+Math.min(255,gb*t|0)+')';
      cx.fillRect(x+off,y,sw,sh); } }
  const tx=new THREE.CanvasTexture(cv); tx.wrapS=tx.wrapT=THREE.RepeatWrapping; return tx; }catch(e){ return null; } }
    // prettier-ignore
    function texDach(grund,seed2){ try{                                                           // TEXTUR-SAME DECKUNG: Biberschwanz (Deckmaß 0.32m, Breite 0.18, Halbversatz, Schattenfuge = Reihenüberdeckung)
  const cv=document.createElement('canvas'); cv.width=256; cv.height=256; const cx=cv.getContext&&cv.getContext('2d'); if(!cx) return null;
  const M1=128, rw=0.32*M1, zb=0.18*M1;
  let hh=(seed2*40503)>>>0; const r2=()=>{hh^=hh<<13;hh^=hh>>>17;hh^=hh<<5;hh>>>=0;return (hh&0xffff)/0x10000;};
  const gr=grund>>16&255, gg=grund>>8&255, gb=grund&255;
  for(let y=256,reihe=0;y>-rw;y-=rw,reihe++){ const off=(reihe%2)*zb/2;
    for(let x=-zb;x<256+zb;x+=zb){ const t=0.82+r2()*0.32;
      cx.fillStyle='rgb('+Math.min(255,gr*t|0)+','+Math.min(255,gg*t|0)+','+Math.min(255,gb*t|0)+')';
      cx.fillRect(x+off,y-rw,zb-2,rw-1);
      cx.fillStyle='rgba(0,0,0,0.27)'; cx.fillRect(x+off,y-3,zb-2,3); } }
  const tx=new THREE.CanvasTexture(cv); tx.wrapS=tx.wrapT=THREE.RepeatWrapping; return tx; }catch(e){ return null; } }
    // prettier-ignore
    function texPutz(seed2){ try{                                                                /*TEXTUR-SAME PUTZ: Kellenwurf — koernige Sprenkel + horizontale Kellenzuege, deterministisch*/
  const cv=document.createElement('canvas'); cv.width=256; cv.height=256; const cx=cv.getContext&&cv.getContext('2d'); if(!cx) return null;
  let hh=(seed2*747796405)>>>0; const r2=()=>{hh^=hh<<13;hh^=hh>>>17;hh^=hh<<5;hh>>>=0;return (hh&0xffff)/0x10000;};
  cx.fillStyle='#ffffff'; cx.fillRect(0,0,256,256);
  for(let k=0;k<5200;k++){ const t=0.86+r2()*0.20; cx.fillStyle='rgba('+(255*t|0)+','+(255*t|0)+','+(252*t|0)+',0.5)';
    cx.fillRect((r2()*256)|0,(r2()*256)|0, 1+((r2()*2)|0), 1+((r2()*2)|0)); }
  for(let y=0;y<256;y+=9+((r2()*7)|0)){ cx.fillStyle='rgba(120,116,108,0.10)'; cx.fillRect(0,y,256,1); }
  const tx=new THREE.CanvasTexture(cv); tx.wrapS=tx.wrapT=THREE.RepeatWrapping; return tx; }catch(e){ return null; } }
    // prettier-ignore
    function texStein(seed2){ try{                                                                /*TEXTUR-SAME NATURSTEIN: Quaderverband 46×28cm, Fuge 1.6, Halbversatz, Bruchton je Stein*/
  const cv=document.createElement('canvas'); cv.width=256; cv.height=256; const cx=cv.getContext&&cv.getContext('2d'); if(!cx) return null;
  const M1=128, sw=0.46*M1, sh=0.28*M1, fu=0.016*M1;
  let hh=(seed2*2654435761)>>>0; const r2=()=>{hh^=hh<<13;hh^=hh>>>17;hh^=hh<<5;hh>>>=0;return (hh&0xffff)/0x10000;};
  cx.fillStyle='#6f6a60'; cx.fillRect(0,0,256,256);
  for(let y=0,reihe=0;y<256;y+=sh+fu,reihe++){ const off=(reihe%2)*(sw+fu)/2;
    for(let x=-sw;x<256+sw;x+=sw+fu){ const t=0.88+r2()*0.24;
      cx.fillStyle='rgb('+(255*t*0.92|0)+','+(255*t*0.90|0)+','+(255*t*0.86|0)+')';
      cx.fillRect(x+off,y,sw,sh); } }
  const tx=new THREE.CanvasTexture(cv); tx.wrapS=tx.wrapT=THREE.RepeatWrapping; return tx; }catch(e){ return null; } }

    // ═══════════════════════════════════════════════════════════════════════
    //  MATERIALIEN (Rollen → Three-Material) — LAZY (vehicle-/schmiede-Muster):
    //  der Validator-vm lädt ohne THREE/document, erst der erste Bau ruft sie.
    //  Der M-Block + die Textur-Konstanten + der _roleByMat-Aufbau sind byte-treu
    //  (Lab Z.1562–1591 + Z.2172) — NUR der Ort wandert (Top-Level → materials()).
    //  Vorbedingung der Bau-Fläche: materials() ist gerufen, BEVOR ein Builder
    //  läuft (buildInstance ruft sie selbst; die Shell ruft sie beim Start).
    // ═══════════════════════════════════════════════════════════════════════
    var _texBk = null;
    var _texZi = null;
    var _texZi2 = null;
    var _texPu = null;
    var _texSt = null;
    var M = null;
    var _roleByMat = new Map();
    // prettier-ignore
    function materials(){ if(M) return M;
      _texBk=texZiegelwand(0x964e3e,7); _texZi=texDach(0x9c4a35,11); _texZi2=texDach(0x803a28,13); _texPu=texPutz(17); _texSt=texStein(23);
      M={
  holz:   new THREE.MeshStandardMaterial({color:0x5a4632,roughness:.88,metalness:0,vertexColors:true,side:THREE.DoubleSide}),
  blockholz: new THREE.MeshStandardMaterial({color:0x8a6a3e,roughness:.9,metalness:0,vertexColors:true,side:THREE.DoubleSide}),   // Blockholz-Wand: warmes Braun, vertexColors + material-basiertes tintWood = Patina wie holz, Kontrast zum Rahmen
  gefach: new THREE.MeshStandardMaterial({vertexColors:true,color:0xd9d0c1,roughness:.97,metalness:0,side:THREE.DoubleSide}),
  stein:  new THREE.MeshStandardMaterial({vertexColors:true,color:0x8d857a,map:_texSt||null,roughness:.96,metalness:0,side:THREE.DoubleSide}),   /*Quaderverband-Karte*/
  ziegel: new THREE.MeshStandardMaterial({color:_texZi?0xffffff:0x9c4a35,map:_texZi||null,roughness:.82,metalness:0,side:THREE.DoubleSide}),
  boden:  new THREE.MeshStandardMaterial({color:0x7d5c39,roughness:.8,metalness:0,vertexColors:true}),
  glas:   new THREE.MeshStandardMaterial({color:0x33576a,roughness:.15,metalness:0,transparent:true,opacity:.42}),
  dunkel: new THREE.MeshStandardMaterial({color:0x14161a,roughness:1,metalness:0}),
  feuer:  new THREE.MeshStandardMaterial({color:0xff8636,emissive:0xff5212,emissiveIntensity:1.5,roughness:.7}),
  moebel: new THREE.MeshStandardMaterial({color:0x6a4a2c,roughness:.86,metalness:0,vertexColors:true}),
  metall: new THREE.MeshStandardMaterial({color:0x6b6b73,roughness:.5,metalness:.55}),
  nagel:  new THREE.MeshStandardMaterial({color:0x402c1c,roughness:.9,metalness:0,vertexColors:true}),
  lattung:new THREE.MeshStandardMaterial({color:0x967852,roughness:.9,metalness:0,vertexColors:true,side:THREE.DoubleSide}),
  ziegel2:new THREE.MeshStandardMaterial({color:_texZi2?0xffffff:0x803a28,map:_texZi2||null,roughness:.85,metalness:0,side:THREE.DoubleSide}),
  backstein:new THREE.MeshStandardMaterial({vertexColors:true,color:_texBk?0xffffff:0x964e3e,map:_texBk||null,roughness:.92,metalness:0,side:THREE.DoubleSide}),
  lehm:   new THREE.MeshStandardMaterial({vertexColors:true,color:0xbfb09a,roughness:.98,metalness:0,side:THREE.DoubleSide}),
  putz:   new THREE.MeshStandardMaterial({vertexColors:true,color:0xe7e3da,map:_texPu||null,roughness:.94,metalness:0,side:THREE.DoubleSide}),   /*Kellenwurf-Karte × wandTon-Vertex — Putz atmet*/
  dachmod:new THREE.MeshStandardMaterial({color:0x3b3e44,roughness:.62,metalness:.08,side:THREE.DoubleSide}), // STIL modern: anthrazit Dach
  gras:   new THREE.MeshStandardMaterial({color:0x5b7a3a,roughness:1,metalness:0}),
  weg:    new THREE.MeshStandardMaterial({color:0xb7ab8e,roughness:.98,metalness:0}),
  laub:   new THREE.MeshStandardMaterial({color:0x4f6f33,roughness:.97,metalness:0}),
  stamm:  new THREE.MeshStandardMaterial({color:0x5b4327,roughness:.95,metalness:0,vertexColors:true}),
  stroh:  new THREE.MeshStandardMaterial({color:0xcaa44e,roughness:1,metalness:0,side:THREE.DoubleSide}),
  kupfer: new THREE.MeshStandardMaterial({color:0x5a917c,roughness:.55,metalness:.35,side:THREE.DoubleSide}),
  glasdunkel: new THREE.MeshStandardMaterial({color:0x2b4457,roughness:.25,metalness:.1,transparent:true,opacity:0.92}),   // SCHLAF-GLAS: Fenster, die nachts dunkel bleiben — nicht jedes Haus wacht
  glasfern: new THREE.MeshStandardMaterial({color:0x46687e,roughness:.22,metalness:.45}),   // FERN-GLAS-GESETZ: Glas trägt fern als OPAKER Spiegelkörper — Transparenz ohne Innenleben liest sich als Geist
      };
      for(const _k in M) _roleByMat.set(M[_k],_k);
      return M; }
    // mat — die Rollen-Auflösung (byte-treu Lab Z.2996 `const mat=r=>M[r]||M.holz;` + Lazy-Guard).
    // prettier-ignore
    function mat(r){ const MM=materials(); return MM[r]||MM.holz; }

    // ═══════════════════════════════════════════════════════════════════════
    //  KULTUREN — regionale Archetypen, aus dem Samen erwachsend (byte-treu;
    //  die B1-Rezept-Quelle: KULTUR × kulturParams). applyKultur (DOM/Slider)
    //  bleibt Shell-Glue — sie liest kulturParams aus DIESER Quelle.
    // ═══════════════════════════════════════════════════════════════════════
    // prettier-ignore
    const DEFCOL={holz:0x5a4632, gefach:0xd9d0c1, ziegel:0x9c4a35, ziegel2:0x803a28, putz:0xe7e3da, dachmod:0x3b3e44, stamm:0x5b4327, glas:0x33576a, glasfern:0x46687e, metall:0x6b6b73, backstein:0x964e3e, lehm:0xbfb09a, stein:0x8d857a, stroh:0xcaa44e, kupfer:0x5a917c}; // alle kultur-tragenden Materialien
    // prettier-ignore
    const KULTUR={
  alemannisch:     { label:'Alemannisch · steil, hell',   pitch:55, W:8,  D:9,  st:2, brace:'andreas', stil:'alt',    col:{holz:0x6e4f30, gefach:0xe9e3d6, ziegel:0x9c4a35, ziegel2:0x7e3826} },
  fraenkisch:      { label:'Fränkisch · Zierfachwerk',     pitch:50, W:10, D:7,  st:2, brace:'wild',    stil:'alt',    col:{holz:0x6b4a2e, gefach:0xd6b885, ziegel:0xb05a30, ziegel2:0x8f4424} },
  niedersaechsisch:{ label:'Niedersächsisch · breit',      pitch:45, W:13, D:7,  st:2, brace:'k',       stil:'alt',    col:{holz:0x624628, gefach:0x9c5440, ziegel:0x86402c, ziegel2:0x6e3420} },
  mittelalterlich: { label:'Mittelalterlich · ganz alt',   pitch:58, W:7,  D:6,  st:2, brace:'mann',    stil:'alt',    col:{holz:0x5e4226, gefach:0xcabfa4, ziegel:0x7a4a38, ziegel2:0x5f3526} },   // dunkel, steil, eng, kleine Fenster
  holzhuette:      { label:'Holzhütte · Block',            pitch:48, W:6,  D:5,  st:1, brace:'k',       stil:'huette', col:{holz:0x82602f, stamm:0x664a2e, ziegel:0x664a2e} },                       // klein, Blockholz, 1 Geschoss
  franzoesisch:    { label:'Französisch · Schiefer, hoch', pitch:57, W:8,  D:8,  st:2, brace:'none',    stil:'stein',  col:{putz:0xeae3d4, ziegel:0x59555f, ziegel2:0x47434c} },                       // hell verputzt, hoch+steil, grauer Schiefer
  italienisch:     { label:'Italienisch · Terrakotta',     pitch:23, W:11, D:8,  st:2, brace:'none',    stil:'stein',  col:{putz:0xe9d4ab, ziegel:0xc06a3a, ziegel2:0x9c5430} },                       // warm verputzt, flach+breit, Terrakotta
  modern:          { label:'Modern · Putz',                pitch:16, W:10, D:8,  st:2, brace:'none',    stil:'modern', col:{putz:0xe7e3da, dachmod:0x3b3e44} },
  volle_moderne:   { label:'Volle Moderne · Glas',         pitch:11, W:11, D:9,  st:3, brace:'none',    stil:'glas',   col:{glas:0x9fb8c4, metall:0x8a8a92, dachmod:0x2f3238} },                       // Glasfassade, flach, höher
  hochhaus:        { label:'Hochhaus · Glasturm',          pitch:8,  W:9,  D:9,  st:7, brace:'none',    stil:'glas',   col:{glas:0x80a1b6, metall:0x9a9aa2, dachmod:0x2f3238} },                       // Glas-Turm, viele Geschosse
  roemisch:        { label:'Römisch · Domus',              pitch:17, W:13, D:10, st:1, brace:'none',    stil:'stein',  col:{putz:0xe3d3b0, ziegel:0xb5623a, ziegel2:0x8e4a2c} },                       // flach+breit, Stuck, Terrakotta-Ziegel (Antike)
  tudor:           { label:'Tudor · Sichtfachwerk',        pitch:60, W:7,  D:6,  st:2, brace:'mann',    stil:'alt',    col:{holz:0x5a3e26, gefach:0xeae3d2, ziegel:0x6e4636, ziegel2:0x553326} },        // sehr steil, dunkles Holz, weiße Füllung
  alpenchalet:     { label:'Alpenchalet · Holz, breit',    pitch:32, W:11, D:8,  st:2, brace:'k',       stil:'huette', col:{holz:0x8a6638, stamm:0x6e5030, ziegel:0x6e5030} },                       // breit, flacher, weite Dachüberstände, warmes Holz
  japanisch:       { label:'Japanisch · Minka, geschwungen',pitch:34, W:12, D:8,  st:1, brace:'k',       stil:'huette',  hip:0.7,  curve:0.5,  col:{holz:0x6e5030, stamm:0x6b655e} },
  chinesisch:      { label:'Chinesisch · Schwungdach',       pitch:30, W:12, D:9,  st:1, brace:'none',    stil:'stein',   hip:0.85, curve:0.95, col:{putz:0xe8dcc8, ziegel:0x4a5560, ziegel2:0x3a444e} },
  hollaendisch:    { label:'Holländisch · Klinker',     pitch:54, W:7,  D:9,  st:3, brace:'none', stil:'klinker', treppgiebel:1, col:{backstein:0x9a4f3a, ziegel:0x7a3f2c, ziegel2:0x60301f} },
  hanseatisch:     { label:'Hanseatisch · Backstein',   pitch:50, W:8,  D:10, st:3, brace:'none', stil:'klinker', treppgiebel:1, col:{backstein:0x8c4636, ziegel:0x6e3828, ziegel2:0x552a1d} },
  georgian:        { label:'Georgianisch · symm.',      pitch:30, W:11, D:8,  st:2, brace:'none', stil:'klinker', portikus:1, col:{backstein:0x9c5a44, putz:0xece4d4, ziegel:0x6e3a2a} },
  viktorianisch:   { label:'Viktorianisch · steil',     pitch:52, W:9,  D:8,  st:2, brace:'none', stil:'klinker', veranda:1, col:{backstein:0x7e4636, ziegel:0x5e3326, ziegel2:0x472418} },
  griechisch:      { label:'Griechisch · Kykladen',     pitch:12, W:8,  D:7,  st:2, brace:'none', stil:'stein', col:{putz:0xf2f0ea, ziegel:0x5a7f9a, ziegel2:0x46637a} },
  spanisch:        { label:'Spanisch · Terrakotta',     pitch:24, W:10, D:8,  st:2, brace:'none', stil:'stein', col:{putz:0xecdcc0, ziegel:0xb5673c, ziegel2:0x8c4a2a} },
  andalusisch:     { label:'Andalusisch · weiß',        pitch:18, W:9,  D:9,  st:2, brace:'none', stil:'stein', bogenTyp:'hufeisen', col:{putz:0xf4f1ea, ziegel:0xb05f38, ziegel2:0x884526} },
  provenzalisch:   { label:'Provenzalisch · Stein',     pitch:28, W:10, D:8,  st:2, brace:'none', stil:'stein', col:{putz:0xe4d8bc, ziegel:0xab6840, ziegel2:0x824c2c} },
  pueblo:          { label:'Pueblo · Adobe',            pitch:8,  W:11, D:9,  st:2, brace:'none', stil:'stein', terrasse:1, col:{putz:0xc89270, stein:0xb07e58, ziegel:0x9a6644} },
  marokkanisch:    { label:'Marokkanisch · Lehm',       pitch:14, W:10, D:10, st:2, brace:'none', stil:'stein', bogenTyp:'hufeisen', grundriss:'hof', col:{putz:0xd9b48a, stein:0xc49a6e, ziegel:0xa9694a} },
  skandinavisch:   { label:'Skandinavisch · Falunrot',  pitch:38, W:9,  D:7,  st:2, brace:'k',    stil:'huette', col:{holz:0x9a3b2a, stamm:0x6e4530, ziegel:0x5a3826} },
  norwegisch:      { label:'Norwegisch · dunkel',       pitch:45, W:8,  D:7,  st:2, brace:'k',    stil:'huette', col:{holz:0x6e5030, stamm:0x6b655e, ziegel:0x6e4f30} },
  russisch:        { label:'Russisch · Isba',           pitch:42, W:8,  D:7,  st:1, brace:'k',    stil:'huette', col:{holz:0x7d5a38, stamm:0x55402a, ziegel:0x55402a} },
  schwarzwald:     { label:'Schwarzwald · breit',       pitch:48, W:12, D:9,  st:2, brace:'k',    stil:'huette', col:{holz:0x5a4530, stamm:0x6b655e, ziegel:0x6e4f30} },
  gotisch:         { label:'Gotisch · steil',           pitch:60, W:8,  D:11, st:2, brace:'none', stil:'stein', bogenTyp:'spitz', col:{putz:0xd6cbb6, ziegel:0x7a4030, ziegel2:0x5e2f22} },
  barock:          { label:'Barock · Stuck',            pitch:28, W:12, D:10, st:2, brace:'none', stil:'stein', kuppel:1, col:{putz:0xede2cc, ziegel:0xb5673c, ziegel2:0x8c4a2a} },
  renaissance:     { label:'Renaissance · symm.',       pitch:26, W:11, D:9,  st:2, brace:'none', stil:'stein', bogenTyp:'rund', col:{putz:0xe6dcc6, ziegel:0xa9694a, ziegel2:0x824c2c} },
};
    // prettier-ignore
    const KULTNAMES=['alemannisch','fraenkisch','niedersaechsisch','mittelalterlich','holzhuette','franzoesisch','italienisch','modern','volle_moderne','hochhaus','roemisch','tudor','alpenchalet','hollaendisch','hanseatisch','georgian','viktorianisch','griechisch','spanisch','andalusisch','provenzalisch','pueblo','marokkanisch','skandinavisch','norwegisch','russisch','schwarzwald','japanisch','gotisch','barock','renaissance','chinesisch'];
    // tintM — byte-treu Lab Z.1629; EINE dokumentierte Naht: materials() vorweg (M ist im Kern lazy).
    // prettier-ignore
    function tintM(col){ materials(); for(const k in DEFCOL){ if(M[k]) M[k].color.setHex((col&&col[k]!=null)?col[k]:DEFCOL[k]); } if(M.blockholz){ const _lh=(c,f)=>{const r=Math.min(255,((c>>16&255)*f)|0),g=Math.min(255,((c>>8&255)*f)|0),b=Math.min(255,((c&255)*f)|0);return (r<<16)|(g<<8)|b;}; const _hz=(col&&col.holz!=null)?col.holz:DEFCOL.holz; M.blockholz.color.setHex((col&&col.blockholz!=null)?col.blockholz:_lh(_hz,1.4)); } }
    // prettier-ignore
    function kulturFromSeed(seed){ const idx=((Math.round(seed*131+7)*2654435761)>>>0)%KULTNAMES.length; return KULTNAMES[idx]; }
    // ── kulturParams — REINE Kultur-Ableitung (identische Streu-Sequenz wie früher applyKultur: pitch→W→D→st) ──
    // prettier-ignore
    function kulturParams(name, seed){
  const k=KULTUR[name]; if(!k) return null;
  let s=((Math.round(seed*977+13)*2654435761)>>>0); const rnd=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
  return {
    pitchDeg: Math.max(8,  Math.min(62, Math.round(k.pitch + (rnd()-0.5)*5))),
    W:        Math.max(5,  Math.min(15, Math.round((k.W + (rnd()-0.5)*2.2)*2)/2)),
    D:        Math.max(4,  Math.min(11, Math.round((k.D + (rnd()-0.5)*1.8)*2)/2)),
    storeys:  Math.max(1,  Math.min(12, Math.round(k.st + (k.st>=4?(rnd()-0.5)*3:0)))),
    brace:k.brace, stil:k.stil, hip:(k.hip!=null?k.hip:0), roofCurve:(k.curve!=null?k.curve:0),
    treppgiebel:k.treppgiebel?1:0, kuppel:k.kuppel?1:0, portikus:k.portikus?1:0, arkade:k.arkade?1:0, turm:k.turm?1:0,
    zinnen:k.zinnen?1:0, veranda:k.veranda?1:0, vorkragung:k.vorkragung?1:0, pilotis:k.pilotis?1:0, terrasse:k.terrasse?1:0,
    dachTyp:k.dachTyp||'sattel', bogenTyp:k.bogenTyp||'none', grundriss:k.grundriss||'I',
    col:k.col||null };
}

    // ═══════════════════════════════════════════════════════════════════════
    //  DAS BAKE-VOKABULAR der Dorf-Pipeline — byte-treu: Stufen-Filter
    //  (KULLVOL/DESTNUR/TURMNUR/MASSNUR/LOD1F) · Rollen-Materialien
    //  (_mmFor/mLay) · der Rollen-Bake (bakeHaus/bakeLOD, Kontakt-AO +
    //  MATERIAL-ILLUSION + WELT-UV) · wandTonAus · stapelBau (Turm-Stapel) ·
    //  bandFassade · fpVon · lod2Koerper (grundriss-treuer Fernkörper) ·
    //  mischeGeoms · hofFuer (Parzelle — Kern-Export für Sonde/Dorf, reist
    //  NICHT in buildInstance, s. Kopf (a)) · fragFuer (die EINE Stufen-Quelle).
    //  LOD1SKIP (Lab Z.1697) bleibt als ruhende Saat in der Shell (0 Leser).
    // ═══════════════════════════════════════════════════════════════════════
    // prettier-ignore
    const KULLVOL=0.012;
    // prettier-ignore
    const DESTNUR={dachdeckung:false,dachwerk:false,fenster:false,gefache:false,boeden:false,innenwaende:false,treppe:false,moebel:false,geruest:false,zimmermann:false,tueren:false,anbau:false,balkon:false,portikus:false,veranda:false,terrasse:false,arkade:false,giebel:false,dachAlt:false}; // GIEBEL-KOPLANAR-FIX: DESTNUR-Giebelwände lagen EXAKT auf den dachPrisma-Gabeln (GEMESSEN: barock 21.7k / antike 13.5k Z-Fight-Paare auf Traufhöhe) — fern IST der Körper der Giebel   // Stufe 2: 6.7x — Kull-Opfer entstehen gar nicht erst. dachwerk AUS: nackte Sparren über dem dims-Körper lasen sich als Ruine — der Körper trägt das Dach
    // prettier-ignore
    const TURMNUR={gefache:false,riegel:false,streben:false,zimmermann:false,fenster:false,geruest:false,boeden:false,innenwaende:false,treppe:false,moebel:false}; // Turm-Fassade: Paneele x 11 Geschosse waren die Masse
    // prettier-ignore
    const MASSNUR={geruest:false,riegel:false,streben:false,zimmermann:false,gefache:false,boeden:false,innenwaende:false,treppe:false,moebel:false}; // MASS-BUILD: 9 Verdichter aus, 4 Maß-Träger (dachdeckung/tueren/fenster/herd) eager — Δext=0 über 96 Kombos bewiesen                                                              // Destillat: Kleinst-Prims (Einzelziegel, Latten) fallen
    // prettier-ignore
    const _MM={};
    // prettier-ignore
    function _mmFor(role){ if(!_MM[role]){ const m=M[role].clone(); m.vertexColors=true; m.color=new THREE.Color(0xffffff); _MM[role]=m; } return _MM[role]; }
    // prettier-ignore
    const _ML={};
    // prettier-ignore
    function mLay(role){ if(!_ML[role]){ const m=M[role].clone(); m.vertexColors=false; _ML[role]=m; _roleByMat.set(m,role); } return _ML[role]; } // SCHWARZ-TOD-GESETZ: vertexColors-Material auf farbloser Geometrie = (0,0,0) im Browser — Layout-Bauten (Mauer/Brücke/Zaun/Spur/Stand/Hof) bauen mit VC-freien Zwillingen; Rolle bleibt registriert (Bake korrekt)
    // prettier-ignore
    const NOISEAMP={putz:0.07,stein:0.08,lehm:0.07,backstein:0.055,gefach:0.055,ziegel:0.045,ziegel2:0.045,stroh:0.08,boden:0.06,holz:0.035,stamm:0.05,blockholz:0.04,lattung:0.03,dachmod:0.025,kupfer:0.02,weg:0.05,gras:0.05,moebel:0.02}; // MATERIAL-ILLUSIONS-GESETZ: rollenklassige Rausch-Amplitude — Mineral atmet, Holz fein, Glas/Metall/dunkel NIE
    // prettier-ignore
    function _noise01(x,y,z){ const h=Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453; return h-Math.floor(h); }
    // prettier-ignore
    const _MAPPED={backstein:1,ziegel:2,ziegel2:3}; // Rollen, deren FARBE die Textur-Karte trägt
    // prettier-ignore
    function _colFor(role,kol){ if(_MAPPED[role]&&!(kol&&kol[role]!=null)) return [0.985,0.985,0.985];   // DOPPEL-TÖNUNGS-FIX: Karte×Vertex — der Bake bleibt weiß, sonst multipliziert der Browser DEFCOL-Rot AUF die Ziegel-Karte
  const hx=(kol&&kol[role]!=null)?kol[role]:((DEFCOL[role]!=null)?DEFCOL[role]:M[role].color.getHex());
  let r=((hx>>16)&255)/255, g=((hx>>8)&255)/255, b=(hx&255)/255;
  if(role==='holz'||role==='stamm'||role==='blockholz'){ const lum=(r+g+b)/3;                 // BALKEN-LICHT-GESETZ: dunkle Holz-Paletten saufen unter Beleuchtung×ACES ins Schwarz ab (Michis „schwarze Balken auf weißer Fassade"); Luminanz-Boden 0.14 hebt sanft, Farbton bleibt, Kultur-Hierarchie bleibt (dunkel-Rolle unberührt)
    if(lum<0.14&&lum>0.001){ const f=0.14/lum; r=Math.min(1,r*f); g=Math.min(1,g*f); b=Math.min(1,b*f); } }
  return [r,g,b]; }
    // prettier-ignore
    function bakeHaus(g,kol,geoms){
  const live=new Set(); g.traverse(o=>{ if(o.userData&&(o.userData.door||o.userData.window)) o.traverse(d=>live.add(d)); });
  g.updateMatrixWorld(true);
  const kill=[];
  g.traverse(o=>{ if(!o.isMesh||live.has(o)||!o.geometry||!o.geometry.attributes||!o.geometry.attributes.position) return;
    const role=_roleByMat.get(o.material)||'holz', G=geoms[role]||(geoms[role]={pos:[],nrm:[],col:[],idx:[],uv:[],vo:0});
    const pa=o.geometry.attributes.position, na=o.geometry.attributes.normal, ca=o.geometry.attributes.color;
    const e=o.matrixWorld.elements, base=_colFor(role,kol), nv=pa.count;
    let wy0=1e9,wy1=-1e9; for(let v=0;v<nv;v++){ const q=e[1]*pa.getX(v)+e[5]*pa.getY(v)+e[9]*pa.getZ(v)+e[13]; if(q<wy0)wy0=q; if(q>wy1)wy1=q; }
    const aoAn=(wy1-wy0)<=4.2;                                                                // AO-PANEEL-GATE — EIN Bake-Gesetz, beide Pfade identisch
    for(let v=0;v<nv;v++){ const x=pa.getX(v),y=pa.getY(v),z=pa.getZ(v);
      const wy=e[1]*x+e[5]*y+e[9]*z+e[13], ao=aoAn? (0.76+0.24*Math.min(1,Math.max(0,wy)/2.6)) : 1;   // EIN-BAKE-GESETZ: dieselbe Kontakt-AO wie bakeLOD (vorher: ao UNDEFINIERT → latenter Crash)
      G.pos.push(e[0]*x+e[4]*y+e[8]*z+e[12], wy, e[2]*x+e[6]*y+e[10]*z+e[14]);
      if(na){ const a=na.getX(v),b=na.getY(v),c=na.getZ(v); G.nrm.push(e[0]*a+e[4]*b+e[8]*c, e[1]*a+e[5]*b+e[9]*c, e[2]*a+e[6]*b+e[10]*c); } else G.nrm.push(0,1,0);
      const tr=ca?ca.getX(v):1, tg=ca?ca.getY(v):1, tb=ca?ca.getZ(v):1;
      const namp=NOISEAMP[role]||0, nz=namp? (1+namp*(_noise01(G.pos[G.pos.length-3]*1.7, wy*1.7, G.pos[G.pos.length-1]*1.7)*2-1)) : 1;
      G.col.push(base[0]*tr*ao*nz, base[1]*tg*ao*nz, base[2]*tb*ao*nz);
      const wx3=G.pos[G.pos.length-3], wz3=G.pos[G.pos.length-1], nay=na?Math.abs(na.getY(v)):1;
      if(nay>0.6) G.uv.push(wx3*0.5, wz3*0.5); else { const nax=na?Math.abs(na.getX(v)):0; G.uv.push((nax>0.5?wz3:wx3)*0.5, wy*0.5); } }
    const ix=o.geometry.index; if(ix){ for(let v=0;v<ix.count;v++) G.idx.push(G.vo+ix.getX(v)); } else { for(let v=0;v<nv;v++) G.idx.push(G.vo+v); }
    G.vo+=nv; kill.push(o); });
  kill.forEach(o=>{ if(o.parent)o.parent.remove(o); o.geometry.dispose(); });
  return kill.length;
}
    // prettier-ignore
    const LOD1F={gelaende:false,geruest:false,boeden:false,innenwaende:false,herd:false,treppe:false,moebel:false};
    // prettier-ignore
    function bakeLOD(g,kol,geoms,minVol,alles){                                                  // wie bakeHaus, aber Kleinst-Prims fallen (Destillat). alles=true: Türen/Fenster MITBAKEN (Chunk-Stufen — LÜCKENLOS-GESETZ: kein Live-Mesh darf fern fehlen)
  const live=new Set(); if(!alles) g.traverse(o=>{ if(o.userData&&(o.userData.door||o.userData.window)) o.traverse(d=>live.add(d)); });
  g.updateMatrixWorld(true);
  const kill=[];
  g.traverse(o=>{ if(!o.isMesh||live.has(o)||!o.geometry||!o.geometry.attributes||!o.geometry.attributes.position) return;
    if(minVol>0){ let vol=0; const pr=o.geometry.parameters;
      if(pr&&pr.width!=null) vol=Math.abs(pr.width*pr.height*pr.depth*(o.scale.x*o.scale.y*o.scale.z||1));
      else { if(!o.geometry.boundingBox)o.geometry.computeBoundingBox(); const bb=o.geometry.boundingBox;
        vol=Math.abs((bb.max.x-bb.min.x)*(bb.max.y-bb.min.y)*(bb.max.z-bb.min.z)); }
      if(vol<minVol){ kill.push(o); return; } }
    const role=_roleByMat.get(o.material)||'holz', G=geoms[role]||(geoms[role]={pos:[],nrm:[],col:[],idx:[],uv:[],vo:0});
    const pa=o.geometry.attributes.position, na=o.geometry.attributes.normal, ca=o.geometry.attributes.color;
    const e=o.matrixWorld.elements, base=_colFor(role,kol), nv=pa.count;
    let wy0=1e9,wy1=-1e9; for(let v=0;v<nv;v++){ const q=e[1]*pa.getX(v)+e[5]*pa.getY(v)+e[9]*pa.getZ(v)+e[13]; if(q<wy0)wy0=q; if(q>wy1)wy1=q; }
    const aoAn=(wy1-wy0)<=4.2;                                                                // AO-PANEEL-GATE: Kontakt-AO nur auf kleinen, geerdeten Meshes — auf vollhohen Wandpaneelen malt die Vertex-Interpolation SÄGEZÄHNE über die Quad-Diagonalen (GESEHEN in nah_voll)
    for(let v=0;v<nv;v++){ const x=pa.getX(v),y=pa.getY(v),z=pa.getZ(v);
      const wy=e[1]*x+e[5]*y+e[9]*z+e[13], ao=aoAn? (0.76+0.24*Math.min(1,Math.max(0,wy)/2.6)) : 1;   // KONTAKT-AO: zum Sockel dunkelnd — nichts wirkt aufgelegt
      G.pos.push(e[0]*x+e[4]*y+e[8]*z+e[12], wy, e[2]*x+e[6]*y+e[10]*z+e[14]);
      if(na){ const a=na.getX(v),b=na.getY(v),c=na.getZ(v); G.nrm.push(e[0]*a+e[4]*b+e[8]*c, e[1]*a+e[5]*b+e[9]*c, e[2]*a+e[6]*b+e[10]*c); } else G.nrm.push(0,1,0);
      const tr=ca?ca.getX(v):1, tg=ca?ca.getY(v):1, tb=ca?ca.getZ(v):1;
      const namp=NOISEAMP[role]||0, nz=namp? (1+namp*(_noise01(G.pos[G.pos.length-3]*1.7, wy*1.7, G.pos[G.pos.length-1]*1.7)*2-1)) : 1;   // MATERIAL-ILLUSION: Welt-Hash → jede Fläche atmet, deterministisch über Rebakes
      G.col.push(base[0]*tr*ao*nz, base[1]*tg*ao*nz, base[2]*tb*ao*nz);                       // AO-REAKTIVIERUNG: ao war GEMESSEN tot (berechnet, nie multipliziert) — das Kontakt-AO-Gesetz war stadtweit stumm
      const wx3=G.pos[G.pos.length-3], wz3=G.pos[G.pos.length-1], nay=na?Math.abs(na.getY(v)):1;   // WELT-UV-GESETZ: Kachelung aus der Weltlage (0.5/m) — Texturen laufen stetig über Bauteilgrenzen
      if(nay>0.6) G.uv.push(wx3*0.5, wz3*0.5); else { const nax=na?Math.abs(na.getX(v)):0; G.uv.push((nax>0.5?wz3:wx3)*0.5, wy*0.5); } }
    const ix=o.geometry.index; if(ix){ for(let v=0;v<ix.count;v++) G.idx.push(G.vo+ix.getX(v)); } else { for(let v=0;v<nv;v++) G.idx.push(G.vo+v); }
    G.vo+=nv; kill.push(o); });
  kill.forEach(o=>{ if(o.parent)o.parent.remove(o); o.geometry.dispose(); });
  return kill.length;
}
    // prettier-ignore
    function wandTonAus(geoms, y0, y1){                                                          // WANDTON-GESETZ: flächengewichtete Farbe der Vertikalflächen im AO-freien Fenster — GEMESSEN am eigenen Stufe-1-Fragment, keine Stil-Vermutung
  let s0=0,s1=0,s2=0,w=0;
  for(const role in geoms){ const G=geoms[role]; if(!G.vo)continue; const P2=G.pos,C2=G.col,I2=G.idx;
    for(let i=0;i<I2.length;i+=3){ const a=I2[i]*3,b=I2[i+1]*3,c=I2[i+2]*3;
      const e1x=P2[b]-P2[a],e1y=P2[b+1]-P2[a+1],e1z=P2[b+2]-P2[a+2], e2x=P2[c]-P2[a],e2y=P2[c+1]-P2[a+1],e2z=P2[c+2]-P2[a+2];
      const nx=e1y*e2z-e1z*e2y, ny=e1z*e2x-e1x*e2z, nz=e1x*e2y-e1y*e2x;
      const l=Math.hypot(nx,ny,nz); if(l<0.04) continue;
      if(Math.abs(ny/l)>0.25) continue;                                                       // nur Wände
      const ym=(P2[a+1]+P2[b+1]+P2[c+1])/3; if(ym<y0||ym>y1) continue;
      const ar=l/2;
      s0+=(C2[a]+C2[b]+C2[c])/3*ar; s1+=(C2[a+1]+C2[b+1]+C2[c+1])/3*ar; s2+=(C2[a+2]+C2[b+2]+C2[c+2])/3*ar; w+=ar; } }
  return w>1.5? [s0/w,s1/w,s2/w] : null;
}
    // prettier-ignore
    function stapelBau(hp, flags, extraNur){
  if(extraNur) hp=Object.assign({},hp,{nur:Object.assign({},hp.nur||{},extraNur)});                                                               // TURM-STAPEL-GESETZ: Türme sind gestapelte ECHTE builds
  const st=Math.max(1,hp.storeys||1);
  if(st<=11){ const H=HAUS(THREE,mat,hp); return {g:H.build(flags), H, off:0, topH:null}; }
  const pB=Object.assign({},hp,{storeys:11, dachTyp:'flach'});                                // STAPEL-NAHT-GESETZ: die Basis wird FLACH gedeckelt — ihr Dach ragte in den Aufsatz („kein sauberes Dach"); die KRONE (hp.dachTyp) trägt der Aufsatz oben
  const pT=Object.assign({},hp,{storeys:st-11, turm:0, portikus:0, arkade:0,
    nur:Object.assign({},hp.nur||{}, {tueren:false, veranda:false, anbau:false, terrasse:false, pilotis:false, hof:false})});   // der Aufsatz ist KEIN Erdgeschoss: Türen/Veranden/Anbauten schwebten auf Nahthöhe („fliegende Eingänge")
  const base=HAUS(THREE,mat,pB), gB=base.build(flags);
  const bb=new THREE.Box3().setFromObject(gB), off=bb.max.y-0.12;
  const top=HAUS(THREE,mat,pT), gT=top.build(Object.assign({},flags,{fundament:false}));
  const wrapT=new THREE.Group(); wrapT.position.y=off; wrapT.add(gT);
  const g=new THREE.Group(); g.add(gB); g.add(wrapT);
  return {g, H:base, off, topH:top};
}
    // prettier-ignore
    function bandFassade(H, B, geoms){                                                          // BAND-FASSADEN-GESETZ: Fensterreihen aus SYSTEMDATEN (h.windows) als Bänder
  if(!H||!H.windows||!H.windows.length) return;
  const gr={}; H.windows.forEach(o=>{ if(o.kind!=='stockwerk')return;
    const key=o.perp+'_'+(o.perp==='z'?(o.cz>0?1:0):(o.cx>0?1:0))+'_'+Math.round(o.cy*2);
    (gr[key]=gr[key]||[]).push(o); });
  const grp2=new THREE.Group();
  const mat2=(B.p.stil==='glas')?M.metall:M.dunkel;                                          // Glas-Turm: helle Geschossbänder auf glasfern-Körper — Glas-auf-Glas war unsichtbar
  for(const k in gr){ const os=gr[k], o0=os[0];
    if(o0.perp==='z'){ let lo=1e9,hi=-1e9; os.forEach(o=>{lo=Math.min(lo,o.cx-o.w/2);hi=Math.max(hi,o.cx+o.w/2);});
      const m=new THREE.Mesh(new THREE.BoxGeometry(hi-lo,o0.h,0.1),mat2); m.position.set((lo+hi)/2,o0.cy,o0.cz+(o0.cz>0?0.05:-0.05)); grp2.add(m); }
    else { let lo=1e9,hi=-1e9; os.forEach(o=>{lo=Math.min(lo,o.cz-o.w/2);hi=Math.max(hi,o.cz+o.w/2);});
      const m=new THREE.Mesh(new THREE.BoxGeometry(0.1,o0.h,hi-lo),mat2); m.position.set(o0.cx+(o0.cx>0?0.05:-0.05),o0.cy,(lo+hi)/2); grp2.add(m); } }
  const wrap=new THREE.Group(); wrap.rotation.y=B.q.phi; wrap.position.set(B.q.x,0,B.q.z); wrap.add(grp2); wrap.updateMatrixWorld(true);
  bakeLOD(grp2, B.p.col, geoms, 0);
}
    // prettier-ignore
    function fpVon(H){ const d=H.dims;                                                          // GRUNDRISS-QUELLE: Hauptkörper + Flügel-Rechtecke (lokal) — speist den silhouetten-treuen Fernkörper
  return [{x0:-d.W/2,x1:d.W/2,z0:-d.D/2,z1:d.D/2,eY:d.eaveY,rY:d.ridgeY}]
    .concat((H.wings||[]).map(w=>({x0:w.x0,x1:w.x1,z0:w.z0,z1:w.z1,eY:w.eY,rY:w.rY}))); }
    // prettier-ignore
    function lod2Koerper(B, geoms){                                                              // Fern-Körper AUS SYSTEMMASSEN — GRUNDRISS-TREU: je Flügel ein Körper (L/U/T/kreuz behalten fern ihre Silhouette; Hof bleibt Hof)
  const e=B.ext, d=B.dims||{}, W=e.x1-e.x0, D=e.z1-e.z0, cx=(e.x0+e.x1)/2, cz=(e.z0+e.z1)/2, sN=(B.p.storeys||1);
  const eave=Math.min(d.eaveY||e.y1*0.62, e.y1), ridge=Math.max(eave+0.4, Math.min(d.ridgeY||e.y1, e.y1));
  const wr= B.p.stil==='klinker'?'backstein': B.p.stil==='huette'?'holz': B.p.stil==='glas'?'glasfern': B.p.stil==='alt'?'gefach':'putz';
  const grp2=new THREE.Group();
  const dachPrisma=(X0,X1,Z0,Z1,eY,rY)=>{ const v=[];                                        // First folgt der LANGEN Achse · WINDING-GESETZ: CCW-auswärts, Traufnormalen zeigen NACH OBEN (der geerbte Zweig war invertiert — DoubleSide verschwieg es)
    if(X1-X0>=Z1-Z0){ const zm=(Z0+Z1)/2;
      v.push(X1,eY,Z0, X0,eY,Z0, X0,rY,zm,  X1,eY,Z0, X0,rY,zm, X1,rY,zm);                    // Nordschräge → (0,+y,−z)
      v.push(X0,eY,Z1, X1,eY,Z1, X1,rY,zm,  X0,eY,Z1, X1,rY,zm, X0,rY,zm);                    // Südschräge → (0,+y,+z)
      v.push(X0,eY,Z0, X0,eY,Z1, X0,rY,zm);                                                   // Westgiebel → (−x)
      v.push(X1,eY,Z1, X1,eY,Z0, X1,rY,zm); }                                                 // Ostgiebel → (+x)
    else { const xm=(X0+X1)/2;
      v.push(X0,eY,Z0, X0,eY,Z1, xm,rY,Z1,  X0,eY,Z0, xm,rY,Z1, xm,rY,Z0);                    // Westschräge → (−x,+y)
      v.push(X1,eY,Z1, X1,eY,Z0, xm,rY,Z0,  X1,eY,Z1, xm,rY,Z0, xm,rY,Z1);                    // Ostschräge → (+x,+y)
      v.push(X1,eY,Z0, X0,eY,Z0, xm,rY,Z0);                                                   // Nordgiebel → (−z)
      v.push(X0,eY,Z1, X1,eY,Z1, xm,rY,Z1); }                                                 // Südgiebel → (+z)
    const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(v,3)); bg.computeVertexNormals();
    grp2.add(new THREE.Mesh(bg,M.ziegel)); };
  const koerper=(X0,X1,Z0,Z1,eY,rY,adj)=>{ adj=adj||{};                                       // adj: Seiten, an denen ein Nachbar-Teil anliegt → dorthin WACHSEN statt schrumpfen (koplanare Fugen-Flächen = Z-Fight, jetzt 0.35 im Nachbarn vergraben)
    const ix0=X0+(adj.x0?-0.35:0.015), ix1=X1+(adj.x1?0.35:-0.015), iz0=Z0+(adj.z0?-0.35:0.015), iz1=Z1+(adj.z1?0.35:-0.015);   // BÜNDIGKEITS-FIX: Körper 1.5cm statt 6cm hinter dem Frame — Destillat-Zellen lesen sich als GEFACH, nicht als Loch (Michis Bild)
    const Wp=Math.max(0.4,ix1-ix0), Dp2=Math.max(0.4,iz1-iz0), mx=(ix0+ix1)/2, mz=(iz0+iz1)/2;
    const wg=new THREE.BoxGeometry(Wp,eY,Dp2);
    if(B.wandTon){ const base=_colFor(wr,B.p.col), att=new Float32Array(24*3);                // WANDTON: gemessene Fassadenfarbe / Rollen-Basis = Vertex-Faktor (bakeLOD multipliziert)
      const fx=Math.min(1.7,Math.max(0.25,B.wandTon[0]/(base[0]||0.01))), fy=Math.min(1.7,Math.max(0.25,B.wandTon[1]/(base[1]||0.01))), fz=Math.min(1.7,Math.max(0.25,B.wandTon[2]/(base[2]||0.01)));
      for(let i=0;i<24;i++){ att[i*3]=fx; att[i*3+1]=fy; att[i*3+2]=fz; }
      wg.setAttribute('color', new THREE.Float32BufferAttribute(att,3)); }
    const wand=new THREE.Mesh(wg,M[wr]||M.putz); wand.position.set(mx,eY/2,mz); grp2.add(wand);
    if(rY>eY+0.45&&B.p.dachTyp!=='flach'&&sN<6) dachPrisma(X0,X1,Z0,Z1,eY,rY);
    if(sN>=2&&sN<6&&eY>3.5){ const gy=Math.min(2.8,eY-0.7);                                   // GURTBAND-KLAMMER: nie an der Traufe niedriger Flügel kleben
      const gb=new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.3,Wp-0.08),0.14,Math.max(0.3,Dp2-0.08)),M.dunkel); gb.position.set(mx,gy,mz); grp2.add(gb); } };   // Gurtband JE TEIL — nie quer über den Innenhof
  const beruehrt=(f,g2)=>({                                                                   // Seiten-Adjazenz zweier Grundriss-Rechtecke (mit 0.12 Toleranz)
    x1:(Math.abs(g2.x0-f.x1)<0.12&&g2.z0<f.z1-0.05&&g2.z1>f.z0+0.05), x0:(Math.abs(g2.x1-f.x0)<0.12&&g2.z0<f.z1-0.05&&g2.z1>f.z0+0.05),
    z1:(Math.abs(g2.z0-f.z1)<0.12&&g2.x0<f.x1-0.05&&g2.x1>f.x0+0.05), z0:(Math.abs(g2.z1-f.z0)<0.12&&g2.x0<f.x1-0.05&&g2.x1>f.x0+0.05) });
  if(B.fp&&B.fp.length>1){ for(const f of B.fp){                                             // FLÜGEL-MODUS: jedes Grundriss-Rechteck trägt Wand+Dach+Band selbst
      const fe=Math.min(f.eY||eave, e.y1), fr=Math.max(fe+0.3, Math.min(f.rY||ridge, e.y1));
      const adj={x0:false,x1:false,z0:false,z1:false};
      for(const g2 of B.fp){ if(g2===f)continue; const t=beruehrt(f,g2); adj.x0=adj.x0||t.x0; adj.x1=adj.x1||t.x1; adj.z0=adj.z0||t.z0; adj.z1=adj.z1||t.z1; }
      koerper(f.x0,f.x1,f.z0,f.z1,fe,fr,adj); } }
  else koerper(e.x0,e.x1,e.z0,e.z1,eave,ridge);                                              // EIN-QUADER-MODUS: I-Grundriss, Doppelhaus, Türme
  if(B.p.turm) { const tm=new THREE.Mesh(new THREE.BoxGeometry(1.6,3.2,1.6),M[wr]||M.putz); tm.position.set(e.x0+1.2,eave+1.4,cz); grp2.add(tm); }   // SIGNATUREN: das System bleibt fern erkennbar
  if(B.p.kuppel){ const ku=new THREE.Mesh(new THREE.BoxGeometry(W*0.5,W*0.22,D*0.5),M.kupfer||M.metall); ku.position.set(cx,eave+W*0.11,cz); grp2.add(ku); }
  if(sN>=10){ const an=new THREE.Mesh(new THREE.BoxGeometry(0.14,3.0,0.14),M.metall); an.position.set(cx-W*0.2,eave+1.6,cz+D*0.14); grp2.add(an); }
  const wrap=new THREE.Group(); wrap.rotation.y=B.q.phi; wrap.position.set(B.q.x,0,B.q.z); wrap.add(grp2); wrap.updateMatrixWorld(true);
  bakeLOD(grp2, B.p.col, geoms, 0);
}
    // prettier-ignore
    function mischeGeoms(ziel, teil){ for(const role in teil){ const S=teil[role]; if(!S.vo) continue;   // FRAGMENT-MISCHUNG: fertige Bakes verketten — kein Neubau, nur Index-Versatz
  const G=ziel[role]||(ziel[role]={pos:[],nrm:[],col:[],idx:[],uv:[],vo:0}), off=G.vo;
  const P=S.pos,N=S.nrm,C2=S.col,I=S.idx,U=S.uv||[];
  for(let i=0;i<P.length;i++){ G.pos.push(P[i]); G.nrm.push(N[i]); G.col.push(C2[i]); }
  if(U.length===S.vo*2 && (G.vo===0 || G.uv.length===G.vo*2)){ for(let i=0;i<U.length;i++) G.uv.push(U[i]); }   // WELT-UV mischen (2er-Takt!) — KONSISTENZ-WÄCHTER: passt eine Quelle nicht, verliert die Rolle ihr uv ganz (finalize-Guard schützt), nie halbe Arrays
  else G.uv.length=0;
  for(let i=0;i<I.length;i++) G.idx.push(I[i]+off);
  G.vo+=S.vo; } }
    // prettier-ignore
    function hofFuer(B){                                                                         // HOF-GESETZ: die Parzelle EMERGIERT aus dem Haus-Wissen — Tür→Weg, Armut→Holzstapel, Land→Beete+Leine, Rolle→Kisten/Trog. Keine Deko-Streuung: jede Setzung hat eine System-Wurzel.
  if(B.hofFrag) return B.hofFrag;
  const geoms={}; B.hofFrag=geoms;
  const gap=B.hofGap||0, sp=B.spawnL, e=B.ext, rolle=(B.p&&B.p.rolle)||'wohnhaus';
  if(!sp||!e||rolle==='turm'||rolle==='halle'||rolle==='kirche') return geoms;
  let hh=((B.p.seed||7)*2654435761)>>>0; const rnd=()=>{ hh^=hh<<13; hh^=hh>>>17; hh^=hh<<5; hh>>>=0; return (hh&0xffff)/0x10000; };
  const grp=new THREE.Group();
  const box=(x,y,z,lx,ly,lz,mtl)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(lx,ly,lz), mtl); m.position.set(x,y,z); grp.add(m); };
  { const eave=Math.max(2.4, Math.min(((B.dims&&B.dims.eaveY)||5.4), 11));                    /*ENTWAESSERUNGS-KETTE v2 — WURZEL-FIX: die Traufen des HAUPTKOERPERS (dims.W/D um den Tuer-Punkt), NICHT die Anbau-Huelle e — Michis schwebende Rinnen am Giebel/vor Fluegeln*/
    const hW=(B.dims&&B.dims.W)||(e.x1-e.x0), hD=(B.dims&&B.dims.D)||(e.z1-e.z0);
    const hx=sp.x, hz0=sp.z-0.02, hz1=sp.z+hD;
    box(hx, eave+0.045, hz0-0.055, hW+0.16, 0.09, 0.12, M.metall);
    box(hx, eave+0.045, hz1+0.075, hW+0.16, 0.09, 0.12, M.metall);
    const front0=!(B.p&&(B.p.arkade||B.p.portikus||B.p.vorkragung));
    const ecken0=front0? [[hx-hW/2+0.14, hz0-0.055],[hx+hW/2-0.14, hz1+0.075]] : [[hx-hW/2+0.14, hz1+0.075],[hx+hW/2-0.14, hz1+0.075]];
    for(const [fx,fz] of ecken0){
      box(fx, eave/2, fz, 0.085, eave, 0.085, M.metall);
      box(fx, 0.09, fz + (fz<sp.z? -0.16: 0.16), 0.085, 0.09, 0.3, M.metall); } }
  const laendlich=gap>=0.6;
  if(!laendlich&&rnd()<0.38){ const fs7=sp.x+((rnd()<0.5)?-1.15:1.15);                       /*FRONTLEBEN: Kiste+Sack neben der Tuer — der Stadtblock arbeitet*/
    box(fs7, 0.26, e.z0-0.42, 0.5,0.52,0.5, mLay('holz'));
    box(fs7+0.42, 0.19, e.z0-0.38, 0.32,0.38,0.32, mLay('lattung')); }
  if(!laendlich){ const hw=(e.x1-e.x0)+0.5, ht=Math.min(gap*2+2.6, 4.6);                       /*STADTHOF-GESETZ: hinter dem Stadthaus liegt der GEPFLASTERTE HOF (Blockinneres) — Platte + Gerät, kein Rasenrest*/
    box((e.x0+e.x1)/2, 0.012, e.z1+ht/2+0.06, hw, 0.024, ht, mLay('stein'));
    box(e.x0+0.7, 0.30, e.z1+0.62, 0.55,0.55,0.55, mLay('holz'));
    if((B.p.baujahr||1900)>1930) box(e.x1-0.55, 0.33, e.z1+0.55, 0.4,0.66,0.4, M.dunkel); }
  // WEG-SYNAPSE: von der Tür zur Straße — im Stadtblock (gap 0.06) öffnet die Tür direkt aufs Trottoir, korrekt weglos
  if(gap>0.4){ const z0=e.z0-0.12, zi=Math.min(gap+0.9, 3.4); let z=z0-0.25;
    while(z> z0-zi){ box(sp.x+(rnd()-0.5)*0.07, 0.028, z, 0.56,0.05,0.42, mLay('stein')); z-=0.62; } }
  if(laendlich){
    if((B.p.arm||((B.p.baujahr||1900)<1890))&&rolle==='wohnhaus'){                            // ARMUT/ALTER → HOLZSTAPEL an der Wetterseite
      const hx=e.x1+0.55, hz=e.z0+ (e.z1-e.z0)*0.68;
      for(let r=0;r<2;r++) for(let k2=0;k2<3+((rnd()*3)|0);k2++)
        box(hx+(rnd()-0.5)*0.06, 0.14+r*0.26, hz-0.7+k2*0.30, 1.25+rnd()*0.5, 0.24, 0.24, mLay('stamm')); }
    if(rolle==='wohnhaus'&&rnd()<0.62){                                                       // GARTEN → BEETE hinterm Haus (Baum-Gesetz-Nachbarschaft)
      for(let b2=0;b2<2;b2++){ const bx=e.x0+0.9+b2*2.1, bz=e.z1+1.1;
        box(bx, 0.10, bz, 1.8,0.18,0.95, mLay('holz')); box(bx, 0.155, bz, 1.62,0.10,0.78, mLay('lehm'));
        for(let rr=0;rr<3;rr++) box(bx-0.5+rr*0.5, 0.26, bz, 0.16,0.14,0.68, M.laub); } }
    if(rolle==='wohnhaus'&&rnd()<0.45){                                                       // WÄSCHELEINE seitlich
      const lx=e.x0-0.7, za=e.z0+0.8, zb=za+2.6;
      box(lx,0.8,za, 0.07,1.6,0.07, mLay('holz')); box(lx,0.8,zb, 0.07,1.6,0.07, mLay('holz'));
      box(lx,1.52,(za+zb)/2, 0.025,0.025, zb-za, M.dunkel); } }
  if(rolle==='gasthaus'){ for(let k2=0;k2<3;k2++) box(e.x0+0.5+((k2%2)*0.6), 0.28+((k2/2)|0)*0.56, e.z0-0.55, 0.55,0.55,0.55, mLay('holz')); }   // ROLLE → KISTEN am Eingang
  if(rolle==='gasthaus'||rolle==='schmiede'){ const wx3=sp.x+1.1;                             // SCHICHT-2: WANDLATERNE neben der Tür — der Kopf ist GLAS und zündet nachts mit den Fenstern
    box(wx3, 2.3, e.z0+0.06, 0.07,0.07,0.34, M.dunkel);
    const kopf3=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.28,0.2), M.glas); kopf3.position.set(wx3,2.16,e.z0-0.26); grp.add(kopf3); }
  if((B.p.baujahr||1900)<1800 && rnd()<0.35){ const ex3=(rnd()<0.5)?e.x0-0.03:e.x1+0.03;      // SCHICHT-2: EFEU — das Alter begrünt die Wetterecke
    for(let k3=0;k3<3;k3++) box(ex3, 0.7+k3*1.05+rnd()*0.3, e.z1-0.5-k3*0.4-rnd()*0.5, 0.1, 0.9+rnd()*0.5, 0.5+rnd()*0.4, M.laub); }
  if(rolle==='schmiede'){ box(e.x1+0.7, 0.24, e.z0+0.6, 1.35,0.42,0.5, mLay('stein')); }            // ROLLE → TRÄNKTROG
  const wrap=new THREE.Group(); wrap.rotation.y=B.q.phi; wrap.position.set(B.q.x,0,B.q.z); wrap.add(grp); wrap.updateMatrixWorld(true);
  bakeLOD(grp, B.p.col, geoms, 0, true);
  return geoms; }
    // prettier-ignore
    function fragFuer(B, stufe){                                                                 // GEBÄUDE-FRAGMENT-GESETZ: jedes Gebäude bakt seine Stufe EINMAL — der Chunk mischt nur noch.
  if(B.frag&&B.fragStufe===stufe) return B.frag;                                             // Ein Slot je Gebäude: Stufenwechsel verdrängt, Demotion trifft den warmen Cache
  const geoms={};
  if(stufe===3||(stufe===2&&(B.p.storeys||1)>=6)){ lod2Koerper(B, geoms); }                  // VOGEL / ferner Turm: reiner dims-Körper, KEIN build
  else { const turm=(B.p.storeys||1)>=6;
    const st=stapelBau(B.p, LOD1F, (stufe===2)?DESTNUR:(turm?TURMNUR:null));                 // Stufe 2 = DESTNUR (6.7x); Turm-Stufe 1 ohne Paneel-Masse
    if(stufe===1&&!turm){ let wseed=((B.p.seed||3)*2246822519)>>>0; const wr2=()=>{ wseed^=wseed<<13; wseed^=wseed>>>17; wseed^=wseed<<5; wseed>>>=0; return (wseed&0xffff)/0x10000; };
      st.g.traverse(o=>{ if(o.userData&&o.userData.window){ const schlaf=wr2()<0.45;          // FENSTER-SCHLAF-GESETZ: die Nacht hat Rhythmus — je Fenster gewürfelt, im Bake versiegelt
        if(schlaf) o.traverse(c2=>{ if(c2.isMesh&&c2.material===M.glas) c2.material=M.glasdunkel; }); } });
      const fpx=(B.fp&&B.fp.length)?B.fp:[{x0:-((B.dims&&B.dims.W)||8)/2,x1:((B.dims&&B.dims.W)||8)/2,z0:-((B.dims&&B.dims.D)||8)/2,z1:((B.dims&&B.dims.D)||8)/2,eY:(B.dims&&B.dims.eaveY)||6}];
      for(const f2 of fpx){ const lw=f2.x1-f2.x0-0.55, ld=f2.z1-f2.z0-0.55, lh=Math.max(2,(f2.eY||6)-0.25);   // INNENDÄMMER-GESETZ: der Innenkörper ist GEDIMMTER RAUM (putz×0.34), nicht Void-Schwarz — durch Laibungen und Geschoss-Schlitze las sich Schwarz, promoviert wurde es weiß (Michis Sprung); jetzt verschatteter Raum, der Promotions-Wechsel flüstert
        if(lw>0.7&&ld>0.7){ const lg=new THREE.BoxGeometry(lw,lh,ld), att=new Float32Array(24*3);
          for(let i2=0;i2<72;i2++) att[i2]=0.92;                                              // KALIBRIERT auf die GEMESSENE Voll-Interieur-Leuchtdichte (176 vs 60 bei 0.34): der Stufen-Sprung an Fenstern fällt von 51.8k Pixeln auf ~0
          lg.setAttribute('color', new THREE.Float32BufferAttribute(att,3));
          const li=new THREE.Mesh(lg, M.putz); li.position.set((f2.x0+f2.x1)/2, lh/2+0.05, (f2.z0+f2.z1)/2); st.g.add(li); } } }
    const wrap=new THREE.Group(); wrap.rotation.y=B.q.phi; wrap.position.set(B.q.x,0,B.q.z); wrap.add(st.g);
    wrap.updateMatrixWorld(true);                                                             // WELTMATRIX-GESETZ: ohne Update bakt der Wrapper bei (0,0)
    bakeLOD(st.g, B.p.col, geoms, stufe===2?KULLVOL:0, true);                                // LÜCKENLOS: Türen/Fenster werden Teil des Bakes
    if(stufe===2||turm){ lod2Koerper(B, geoms); bandFassade(st.H, B, geoms); if(st.topH) bandFassade(st.topH, B, geoms); }
    st.g.traverse(o=>{ if(o.geometry)o.geometry.dispose(); });
    if(stufe===1&&!turm&&!B.wandTon){ const eY=(B.dims&&B.dims.eaveY)||6;                     // WANDTON einmalig aus der ECHTEN Fassade messen (AO-freies Fenster 2.6..eY)
      B.wandTon=wandTonAus(geoms, 2.6, Math.max(3.4,eY)); } }
  B.frag=geoms; B.fragStufe=stufe; return B.frag; }

    // ═══════════════════════════════════════════════════════════════════════
    //  DIE DORF-QUELLE (W-A5b, N5.7 settlement) — byte-treu aus der Lab-Shell
    //  verschoben (worlds/fachwerk/index.html, Marker DORF-QUELLE-START/ENDE;
    //  sha256-Paritäts-Beleg im Wellen-Bericht). REIN: kein DOM, kein THREE —
    //  DORF (Region·Epoche·Rollen·Jahresringe) · dorfLayout (Straßengraph ·
    //  SAT-Parzellen · Mauer/Fluss/Laternen) · lodPlan · PROXYHAUS · die
    //  OBB-Fundamentalgesetze. Die Shell LIEST diese eine Quelle (Aliasse),
    //  exportSettlement (unten) exportiert sie als reine Slot-DATEN an den
    //  Host (das exportDrive-Muster, N6.2). LOD1SKIP wanderte als Teil des
    //  Blocks mit (ruhende Saat, 0 Leser — der Kopf-Kommentar oben gilt).
    // ═══════════════════════════════════════════════════════════════════════
    // ════════════ DORF v2 — GEWACHSEN, nicht platziert ════════════
    // GRÜNDUNGS-GESETZ: Siedlung entsteht an einem GRUND (Brunnen/Kreuzung/Anger/Markt).
    // REGION-GESETZ: ein Ort = eine Region; ihre Kulturen lösen sich über die HISTORIE ab (Zeitbänder).
    // ZEIT-GESETZ: jedes Gebäude trägt ein Baujahr; Kern=alt, Rand=jung — der Gradient EMERGIERT aus dem Wachstum.
    // WOHLSTANDS-GESETZ: Nähe zum Kern = Wohlstand → Breite/Geschosse/Balkon. SONDERBAU-GESETZ: ab Schwellen
    // weiß das Dorf, was es braucht (Kirche·Gasthaus·Schmiede·Brunnen). HOF-GESETZ: Agrarparzellen tragen Scheunen.
    // prettier-ignore
    const REGION_HIST={
  mitteleuropa:[[0,['mittelalterlich']],[1250,['mittelalterlich','tudor','alemannisch','fraenkisch']],[1500,['alemannisch','fraenkisch','niedersaechsisch','tudor']],[1650,['barock','renaissance','franzoesisch']],[1800,['hanseatisch','georgian','viktorianisch','hollaendisch']],[1900,['modern']],[1965,['modern','volle_moderne']]],
  alpin:       [[0,['holzhuette']],[1350,['holzhuette','russisch']],[1550,['alpenchalet','schwarzwald']],[1800,['schwarzwald','alpenchalet','skandinavisch']],[1930,['modern']]],
  mediterran:  [[-800,['griechisch','roemisch']],[500,['provenzalisch','italienisch']],[1400,['italienisch','spanisch','provenzalisch']],[1650,['barock','andalusisch','spanisch']],[1900,['modern']]],
  nordisch:    [[0,['russisch','norwegisch']],[1550,['skandinavisch','norwegisch']],[1880,['skandinavisch','modern']],[1945,['modern']]],
  fernost:     [[0,['japanisch','chinesisch']],[1900,['japanisch','chinesisch','modern']],[1955,['modern','volle_moderne']]],
  antik:       [[-800,['griechisch','roemisch']],[0,['roemisch','griechisch']]],
};
    // prettier-ignore
    const EPOCHEN={   // Legacy-Wahl → fixiert Region+Zeit (Pool-Override); 'gewuerfelt' überlässt ALLES dem Samen
  antike:      {region:'antik',        jahr:80,   spanne:70,  groesse:'markt'},
  mittelalter: {region:'mitteleuropa', jahr:1320, spanne:90,  groesse:'dorf'},
  hanse:       {region:'mitteleuropa', jahr:1560, spanne:140, groesse:'markt', pool:['hanseatisch','hollaendisch','niedersaechsisch'], mark:{k:'hanseatisch',set:{turm:1,storeys:4}}},
  barock:      {region:'mitteleuropa', jahr:1700, spanne:80,  groesse:'dorf',  pool:['barock','renaissance','franzoesisch'], mark:{k:'barock',set:{kuppel:1,W:14,D:11}}},
  gruenderzeit:{region:'mitteleuropa', jahr:1860, spanne:60,  groesse:'markt', pool:['viktorianisch','georgian','hanseatisch'], mark:{k:'viktorianisch',set:{turm:1,storeys:3}}},
  alpin:       {region:'alpin',        jahr:1620, spanne:220, groesse:'dorf'},
  mediterran:  {region:'mediterran',   jahr:1520, spanne:260, groesse:'dorf'},
  fernost:     {region:'fernost',      jahr:1250, spanne:300, groesse:'dorf'},
  moderne:     {region:'mitteleuropa', jahr:1935, spanne:70,  groesse:'stadt', pool:['modern','volle_moderne'], mark:{k:'hochhaus',set:{}}},
};
    // prettier-ignore
    const NAMEN={
  mitteleuropa:{v:['Alden','Rot','Stein','Wolfen','Linden','Eber','Grün','Falken','Hohen','Wester'],n:['burg','heim','hausen','dorf','feld','bach','stadt','brück']},
  alpin:{v:['Ober','Unter','Gams','Brand','Alp','Kar','Firn','Stein'],n:['egg','wald','tal','eck','berg','au','moos','stein']},
  mediterran:{v:['Monte','Porto','Villa','Castel','San','Terra','Bella','Roc'],n:['bello','mare','nova','forte','luna','verde','alto','sole']},
  nordisch:{v:['Björn','Ravn','Ulv','Sten','Vind','Hav','Skog','Ny'],n:['vik','fjord','stad','berg','dal','holm','nes','by']},
  fernost:{v:['Shan','Hai','Long','Mei','Yun','Feng','Jin','Tian'],n:['zhou','jing','shan','he','lin','men','chuan','xi']},
  antik:{v:['Aqua','Nova','Alta','Porta','Castra','Colonia','Ara','Via'],n:['rium','num','polis','dunum','ium','ata','ona','ensis']}};
    // prettier-ignore
    function ORTSNAME(region, seed){ let s=((Math.round(seed*911+37)*2654435761)>>>0);
  const r=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
  const T=NAMEN[region]||NAMEN.mitteleuropa;
  return T.v[(r()*T.v.length)|0]+T.n[(r()*T.n.length)|0]; }
    // prettier-ignore
    const LOD1SKIP={geruest:1,boeden:1,innenwaende:1,herd:1,treppe:1,moebel:1}; // System-Hülle: Haut+Türen+Fenster, kein Innenleben
    // prettier-ignore
    const DORF_NORM={ gap:2.5, gapStadt:1.0, strasseW:5.0, laneW:3.2, gehweg:1.2, budget:170000, laneiv:17 };
    // ── SPIEGEL-ZENSUS 17.07. — DAS SIEDLUNGS-EXISTENZ-GESETZ (rein additive
    // DATEN-Zeile): WO/WIEVIEL Doerfer die Welt traegt ist Siedlungs-Wissen
    // (Praezedenzfall: die Wald-Dichte lebt in phyto-core forestStandDensity).
    // cellM = Welt-Zellen-Raster (m) · rarity = 1 von N Zellen traegt ein Dorf
    // (~7 Doerfer/km² effektiv) · nHMin/nHSpan = Dorf-Groesse nHMin..nHMin+
    // nHSpan-1 Haeuser (deterministisch aus dem Zell-Hash) · slopeMax =
    // Site-Wand (|grad h| m/m — flach genug zum Siedeln) · fundamentMaxDh =
    // Klippen-Wand je Haus-Slot (m, max. Hoehendifferenz ueber die vier
    // obb-Footprint-Ecken; darunter traegt ein Sockel-Podest das Haus in den
    // Hang). Reist im Buch-Umschlag (get-book, Feld `siedlung`); der Wirt
    // liest memoisiert + fail-soft byte-gleich (_siedlungGesetz). Seine
    // Streaming-Regler (nearM/perTick/spawnClearM/siteProbeR/startRadiusM)
    // bleiben ehrlich Wirts-Infrastruktur (AUTO_SETTLEMENT). ──
    const SIEDLUNG = { cellM: 256, rarity: 2, nHMin: 8, nHSpan: 10, slopeMax: 0.35, fundamentMaxDh: 9 };
    // prettier-ignore
    function DORF(DP){
  let s=((Math.round((DP.seed||1)*613+29)*2654435761)>>>0); const rnd=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
  const nZiel=Math.max(4,Math.min(500,DP.nH||24));                                          // ZIEL-GESETZ: der Regler IST die Stadt
  const leg=(DP.epoche&&DP.epoche!=='gewuerfelt')?EPOCHEN[DP.epoche]:null;
  let region,jahr,spanne;
  if(leg){ region=leg.region; jahr=leg.jahr+(((rnd()-0.5)*50)|0); spanne=leg.spanne; }
  else{ const r=rnd(); region= r<.30?'mitteleuropa': r<.46?'alpin': r<.64?'mediterran': r<.76?'nordisch': r<.88?'fernost':'antik';
    if(region==='antik'){ jahr=-150+((rnd()*400)|0); spanne=40+((rnd()*90)|0); }
    else{ jahr=880+((rnd()*680)|0); const sp=rnd(); spanne= sp<.35?(20+((rnd()*60)|0)):(sp<.75?(180+((rnd()*300)|0)):(500+((rnd()*420)|0)));
      if(region==='fernost'&&jahr>1500) jahr=1050+((rnd()*450)|0); } }
  const n=nZiel;
  const groesse= n<8?'weiler': n<17?'dorf': n<27?'markt': n<49?'stadt': n<141?'grossstadt':'metropole';
  const staedtisch=(groesse==='markt'||groesse==='stadt'||groesse==='grossstadt'||groesse==='metropole');
  const kr=rnd(); const kernel= staedtisch?'markt':(kr<.45?'brunnen':(kr<.78?'anger':'kreuzung'));
  const poolAt=(y,hist)=>{ if(!hist&&leg&&leg.pool)return leg.pool; const H=REGION_HIST[region]; let P=H[0][1]; for(const q of H){ if(y>=q[0])P=q[1]; } return P; };   /*hist=true: die HISTORIE gewinnt ueber die Legende — Jahresringe brauchen die Architektur ihrer Zeit*/
  const geb=[];
  const ringe=staedtisch&&jahr>1700;                                                          /*JAHRESRING-GESETZ: die Stadt ist geronnene ZEIT — der Radius wird zur Zeitachse. Kern=Gruendung (Altstadt), Rand=Gegenwart; Kultur+Baujahr je PARZELLE aus ihrem Ring; die Regions-HISTORIE (poolAt) liefert die Architektur jener Zeit*/
  const gr0=ringe? Math.min(jahr-150, 1150+((rnd()*260)|0)) : jahr; globalThis.__ring={gr0:gr0, ringe:ringe};   /*Zeitachse global — DORF wuerfelt, dorfLayout liest (getrennte Funktionen)*/
  for(let i=0;i<n;i++){
    const t9r=i/Math.max(1,n-1);
    let by; if(ringe){ by=Math.round(gr0 + (jahr+spanne-gr0)*Math.pow(t9r,0.82)*(0.88+0.24*rnd()));
      const mix=rnd(); if(mix<0.12) by=Math.round(by+(jahr+spanne-by)*(0.45+0.5*rnd()));      /*ERSATZBAU: die Luecke im Ring, spaeter gefuellt*/
      else if(mix>0.93) by=Math.round(gr0+(by-gr0)*rnd()*0.45);                                /*UEBERLEBENDER: das alte Haus zwischen den Juengeren*/
      by=Math.max(gr0, Math.min(jahr+spanne, by)); }
    else by=jahr+Math.round(spanne*t9r*(0.55+0.45*rnd()));
    const pool=poolAt(by, ringe), kn=pool[(rnd()*pool.length)|0], hs=1+((rnd()*1e6)|0);
    const p=kulturParams(kn,hs); p.seed=hs; p.kultur=kn; p.terrain=0; p.baujahr=by; p.rolle='wohnhaus';
    if(ringe) p.W=Math.max(4.5, Math.min(15, Math.round(p.W*(0.80+0.38*t9r)*2)/2));         /*PARZELLEN-GEDAECHTNIS: schmale Buergerhaeuser im Kern, breite Lose am Saum*/
    const w=(1.22-0.5*(i/Math.max(1,n-1)))*(0.78+0.44*rnd()); p.wohl=Math.round(w*100)/100;
    p.W=Math.max(5,Math.min(15,Math.round(p.W*(0.84+0.30*w)*2)/2));
    if(staedtisch&&jahr>1880){ const t9=i/Math.max(1,n-1);                                     /*STADTKOERPER: in RING-Staedten macht die ZEIT den Gradient selbst (alt=niedrig innen); der Turm-Boost wandert an die MODERNE-KANTE — die europaeische Wahrheit (Altkern flach, Tuerme aussen)*/
      if(!ringe){ p.storeys=Math.max(1, Math.min(12, Math.round(p.storeys*(1.85-1.45*t9))));
        if(t9<0.16&&jahr>1920&&rnd()<0.6) p.storeys=Math.max(p.storeys, 7+((rnd()*5)|0)); }
      else if(t9>0.74&&p.baujahr>1915&&rnd()<0.55) p.storeys=Math.max(p.storeys, 6+((rnd()*5)|0)); }
    if(staedtisch&&w>0.9&&p.storeys<4)p.storeys++; p.turmbau=0;
    p.keller=(rnd()<0.35)?1:0; p.annexN=(rnd()<0.25)?1:0;
    p.arm=(n>=16&&w<0.72)?1:0;
    p.balcony=(w>0.95&&p.storeys>=2&&rnd()<0.5)?1:0;
    if(i>0){ const g2=rnd(); p.grundriss=(g2<(staedtisch?0.85:0.68))?'I':((g2<0.9)?'L':p.grundriss); }
    geb.push(p); }
  const modern=(jahr>=1905&&staedtisch), gewerbe=(jahr>=1850&&staedtisch&&n>=20), gwA=rnd()*Math.PI*2;
  if(modern){ for(let i=0;i<n;i++){ if(i>0&&i<n*0.22&&rnd()<0.72){ const p=geb[i];      // DOWNTOWN-GESETZ: der Kern wächst in den Himmel
    p.stil=(rnd()<0.62)?'glas':'klinker'; p.storeys=8+((rnd()*16)|0); p.W=12+((rnd()*6)|0); p.D=10+((rnd()*5)|0);
    p.dachTyp='flach'; p.grundriss='I'; p.balcony=0; p.keller=0; p.annexN=0; p.arm=0; p.turmbau=1; p.rolle='turm'; } } }
  if(gewerbe){ for(let i=(n*0.78)|0;i<n;i++){ if(rnd()<0.6){ const p=geb[i];             // GEWERBE-GESETZ: Hallen-Viertel am Rand
    p.rolle='halle'; p.stil='klinker'; p.W=12+((rnd()*4)|0); p.D=9+((rnd()*4)|0); p.storeys=1;
    p.pitchDeg=14; p.grundriss='I'; p.balcony=0; p.annexN=0; p.arm=1; p.sektor=gwA; p.turmbau=0; } } }
  if(n>=8){ const p=geb[0];
    const mk=(leg&&leg.mark)?leg.mark:(region==='mediterran'?{k:'barock',set:{kuppel:1,W:14,D:11}}:region==='fernost'?{k:'chinesisch',set:{W:15,D:11}}:region==='antik'?{k:'roemisch',set:{arkade:1,W:15,D:11}}:region==='nordisch'?{k:'norwegisch',set:{turm:1,D:10}}:region==='alpin'?{k:'gotisch',set:{turm:1,D:9,W:7}}:(jahr>1880?{k:'hochhaus',set:{}}:jahr>1620?{k:'barock',set:{kuppel:1,W:13,D:11}}:{k:'gotisch',set:{turm:1,D:11}}));
    Object.assign(p,kulturParams(mk.k,p.seed),{kultur:mk.k},mk.set||{}); p.rolle='kirche'; p.mark=1; p.keller=0; p.baujahr=jahr; }
  if(n>=8){ const p=geb[1]; p.rolle='gasthaus'; p.W=Math.min(15,p.W+2.5); p.D=Math.min(11,p.D+1);
    if(p.storeys<2)p.storeys=2; if(region==='mitteleuropa'||region==='mediterran')p.arkade=1; }
  if(n>=10){ const p=geb[Math.max(2,(n*0.62)|0)]; p.rolle='schmiede'; p.W=5.5; p.D=5; p.storeys=1; p.balcony=0; p.annexN=0; p.grundriss='I'; p.turm=0; p.kuppel=0; }
  if(staedtisch&&jahr<1700&&n>=16&&rnd()<0.5){                                            // BURG-GESETZ: die Stadt hat einen Herrn
    const bk=(region==='nordisch')?'norwegisch':'gotisch', bs=1+((rnd()*1e6)|0);
    const bp=kulturParams(bk,bs); Object.assign(bp,{seed:bs,kultur:bk,terrain:0,baujahr:jahr-((rnd()*80)|0),rolle:'burg',wohl:1.2,
      W:13+((rnd()*2)|0), D:11, storeys:3, turm:1, zinnen:1, keller:0, annexN:0, balcony:0, grundriss:'I', arm:0});
    geb.push(bp); }
  const alle=[], schQ={weiler:.75,dorf:.55,markt:.28,stadt:.06,grossstadt:.04,metropole:.03}[groesse];
  geb.forEach(p=>{ const pi=alle.length; alle.push(p);
    if(p.rolle==='wohnhaus'&&Math.min(p.W,p.D)>=6.5&&rnd()<schQ){
      const cap2=Math.min(7,Math.min(p.W,p.D)-2), sn=1+((rnd()*1e6)|0);
      alle.push({W:Math.max(4,Math.round((cap2-rnd()*1.5)*2)/2), D:Math.max(4,Math.round((cap2-0.5-rnd()*1.5)*2)/2), storeys:1,
        pitchDeg:Math.max(28,p.pitchDeg-6), brace:'k', stil:(region==='mediterran'||region==='antik')?'stein':'huette',
        hip:0, roofCurve:0, grundriss:'I', dachTyp:'sattel', bogenTyp:'none', seed:sn, kultur:p.kultur, col:p.col,
        keller:0, terrain:0, annexN:0, balcony:0, rolle:'scheune', parent:pi, baujahr:p.baujahr, wohl:p.wohl,
        treppgiebel:0,kuppel:0,portikus:0,arkade:0,turm:0,zinnen:0,veranda:0,vorkragung:0,pilotis:0,terrasse:0}); } });
  return {seed:DP.seed||1, name:ORTSNAME(region, DP.seed||1), region, groesse, kernel, jahr, spanne, staedtisch, houses:alle,
          norm:Object.assign({},DORF_NORM,{budget:Math.max(80000,Math.min(400000,DP.budget||DORF_NORM.budget)), gap:(groesse==='stadt'||groesse==='grossstadt'||groesse==='metropole')?0.06:(staedtisch?0.6:DORF_NORM.gap)})};
}
    // prettier-ignore
    function rotAABB(bb,k){ let b={x0:bb.x0,x1:bb.x1,z0:bb.z0,z1:bb.z1};
  for(let i=0;i<(((k%4)+4)%4);i++) b={x0:b.z0,x1:b.z1,z0:-b.x1,z1:-b.x0}; return b; }
    // ════════════ OBB-FUNDAMENTALGESETZ ════════════ R(φ) auf (x,z): wx=x·c+z·s, wz=−x·s+z·c (deckt k·90° ab)
    // prettier-ignore
    function obbR(o,A){ const c=Math.cos(o.phi),s2=Math.sin(o.phi), u0=c,u1=-s2, v0=s2,v1=c;   // Weltachsen der Boxachsen
  return o.ex*Math.abs(A[0]*u0+A[1]*u1)+o.ez*Math.abs(A[0]*v0+A[1]*v1); }
    // prettier-ignore
    function obbSep(a,b){ const cA=Math.cos(a.phi),sA=Math.sin(a.phi),cB=Math.cos(b.phi),sB=Math.sin(b.phi);
  const axes=[[cA,-sA],[sA,cA],[cB,-sB],[sB,cB]], d=[b.cx-a.cx,b.cz-a.cz]; let mx=-1e9;
  for(const A of axes){ const sep=Math.abs(A[0]*d[0]+A[1]*d[1])-obbR(a,A)-obbR(b,A); if(sep>mx)mx=sep; }
  return mx; } // SAT: >0 ⇒ Abstand ≥ sep (untere Schranke); ≤0 ⇒ Überlappung
    // prettier-ignore
    function distPunktOBB(px,pz,o){ const c=Math.cos(o.phi),s2=Math.sin(o.phi), dx=px-o.cx, dz=pz-o.cz;
  const lx=dx*c-dz*s2, lz=dx*s2+dz*c;             // Welt→lokal = R(−φ)
  const ex=Math.max(Math.abs(lx)-o.ex,0), ez=Math.max(Math.abs(lz)-o.ez,0); return Math.hypot(ex,ez); }
    // ════════════ PROXY-GESETZ ════════════ ferne Gebäude als Massivkörper (~30 Prims): Korpus·Fensterraster·Tür·Satteldach·Giebel·Kamin
    // prettier-ignore
    function PROXYHAUS(p){ const W=p.W, D=p.D, st=Math.max(1,p.storeys), sh=2.75, H=st*sh;
  const wr= p.stil==='klinker'?'backstein': p.stil==='huette'?'holz': p.stil==='glas'?'glas': p.stil==='alt'?'gefach':'putz';
  const B=[], T2=[];
  B.push({b:[0,H/2,0, W,H,D], r:wr});
  if(st>=6||p.dachTyp==='flach'){                                                            // TURM-PROXY: Bänder, Attika, Dachkasten, Antenne
    for(let g=1; g<st; g++) B.push({b:[0,g*sh,0, W+0.08,0.42,D+0.08], r:(p.stil==='glas')?'dunkel':'putz'});
    B.push({b:[0,H+0.25,0, W+0.3,0.5,D+0.3], r:'dunkel'});
    B.push({b:[W*0.18,H+1.1,0, Math.min(3.5,W*0.4),1.7,Math.min(3.2,D*0.35)], r:'metall'});
    B.push({b:[0,1.25,-D/2-0.07, 2.2,2.5,0.14], r:'dunkel'});
    if(st>=10) B.push({b:[-W*0.2,H+2.6,D*0.14, 0.16,3.4,0.16], r:'metall'});
    return {B, T2, bb:{x0:-W/2-0.3,x1:W/2+0.3,z0:-D/2-0.3,z1:D/2+0.3,y1:H+(st>=10?4.4:2.0)}}; }
  const nw=Math.max(1,Math.round(W/2.4));
  for(let g=0; g<st; g++){ const y=g*sh+1.55;
    for(let k=0;k<nw;k++){ const fx=-W/2+(k+0.5)*W/nw;
      B.push({b:[fx,y,-D/2-0.05, 0.85,1.2,0.1], r:(p.stil==='glas'?'metall':'dunkel')});
      B.push({b:[fx,y, D/2+0.05, 0.85,1.2,0.1], r:(p.stil==='glas'?'metall':'dunkel')}); } }
  B.push({b:[0,1.05,-D/2-0.06, 1.0,2.1,0.12], r:'dunkel'});
  const ov=0.45, rise=Math.max(0.5,Math.tan((p.pitchDeg||30)*Math.PI/180)*(D/2)), y1=H+rise;
  const X=W/2+ov, Z=D/2+ov;
  T2.push({r:'ziegel', verts:[[-X,H,-Z],[X,H,-Z],[X,y1,0]]}); T2.push({r:'ziegel', verts:[[-X,H,-Z],[X,y1,0],[-X,y1,0]]});
  T2.push({r:'ziegel', verts:[[X,H,Z],[-X,H,Z],[-X,y1,0]]}); T2.push({r:'ziegel', verts:[[X,H,Z],[-X,y1,0],[X,y1,0]]});
  T2.push({r:wr, verts:[[-W/2,H,-D/2],[-W/2,H,D/2],[-W/2,H+rise*(D/(D+2*ov)),0]]});
  T2.push({r:wr, verts:[[ W/2,H,D/2],[ W/2,H,-D/2],[ W/2,H+rise*(D/(D+2*ov)),0]]});
  if(p.rolle!=='scheune') B.push({b:[W*0.24,H+rise*0.55,0, 0.55,rise*1.1+0.8,0.55], r:'ziegel2'});
  return {B, T2, bb:{x0:-X,x1:X,z0:-Z,z1:Z,y1:y1}};
}
    // ════════════ dorfLayout v4 — KURVEN-WACHSTUM ════════════
    // KURVEN-GESETZ: Straßen = Heading-Random-Walk mit Rückstellfeder (Epoche steuert Krümmung: <1500 stark, modern gerade).
    // Häuser stehen TANGENTIAL zu ihrem Straßenpunkt; Parzellen-Packing per SAT gegen ALLE Nachbarn — ersetzt Knick-/Ecken-/Streifen-Sondergesetze.
    // ════════════ LOD-RING (rein) ════════════ fern=Proxy, nah=real: wer im Ring rin liegt wird befördert (Budget maxDyn),
    // wer jenseits rout liegt degradiert (Hysterese). list=[{i,dist,lod,dyn,kern,pr?}] → {promote:[],demote:[]} · pr = BLICK-PRIORITÄT (vorne zuerst), Ring-Zugehörigkeit bleibt bei dist
    // prettier-ignore
    function lodPlan(list, maxDyn, rin, rout){
  const metr=b=>(b.pr!==undefined?b.pr:b.dist);                                              // METRIK-EINHEITS-GESETZ: Kandidaten-Rang UND Tausch-Demote sprechen DIESELBE Sprache — pr(Blick) vs dist erzeugte Promotions-Ping-Pong (bi rein/raus im Wechsel, GEMESSEN)
  const promote=[], demote=[];
  const dyn=list.filter(b=>b.dyn).sort((a,b)=>metr(a)-metr(b));
  for(const b of dyn) if(b.dist>rout) demote.push(b.i);                                      // Ring-AUSTRITT bleibt echte Distanz (rout ist eine Ringgrenze, keine Blickfrage)
  let nDyn=dyn.length-demote.length;
  const cand=list.filter(b=>b.lod==='proxy'&&!b.kern&&b.dist<rin).sort((a,b)=>metr(a)-metr(b));
  for(const c of cand){
    if(nDyn<maxDyn){ promote.push(c.i); nDyn++; }
    else { const far=dyn.filter(d=>!demote.includes(d.i)).pop();
      if(far&&metr(far)>metr(c)+10){ demote.push(far.i); promote.push(c.i); } else break; } }
  return {promote, demote};
}
    // ════════════ STRASSENGRAPH-GESETZ ════════════ Straßen wachsen als Graph: Kurvensegmente von Knoten zu Knoten;
    // SNAP: endet ein Trieb nahe Bestand, VERBINDET er sich (Knoten/Kantensplit) → ZYKLEN → BLÖCKE. Das ist der Unterschied Stadt/Straßendorf.
    // prettier-ignore
    function strassengraph(rnd, plan, sW, lw, Rw, fluss){
  const staedt=plan.staedtisch, jahr=plan.jahr, DS=3;
  const kruemm= staedt?0.006:(jahr<1500?0.016:jahr<1800?0.010:0.003);
  const grid=(plan.region==='antik')||(staedt&&jahr>=1800);
  const nodes=[{x:0,z:0}], edges=[];
  const deg=k=>{ let d=0; for(const e of edges){ if(e.a===k||e.b===k)d++; } return d; };
  const dFluss=(x,z)=>{ if(!fluss)return 1e9; let m=1e9; for(const q of fluss.pts){ const d=Math.hypot(x-q.x,z-q.z); if(d<m)m=d; } return m; };
  function walk(x0,z0,th0,len,gen){ const pts=[]; let x=x0,z=z0,dev=0;
    for(let u=0;u<=len;u+=DS){ const th=th0+dev; pts.push({x,z,th});
      if(Rw&&Math.hypot(x,z)>Rw-8){ break; }
      if(fluss&&gen>0&&dFluss(x+Math.cos(th)*DS, z+Math.sin(th)*DS)<fluss.w/2+2){ break; }   // FLUSS-GESETZ: nur Arterien queren
      dev+=(rnd()-0.5)*2*kruemm*DS - dev*0.028*DS; x+=Math.cos(th0+dev)*DS; z+=Math.sin(th0+dev)*DS; }
    return pts; }
  const nT= staedt? ((plan.groesse==='grossstadt'||plan.groesse==='metropole')?4:(rnd()<0.5?4:3)) : 2;
  const tips=[];
  for(let a2=0;a2<nT;a2++){ const th= grid? a2*Math.PI*2/nT : (a2*2*Math.PI/nT+(rnd()-0.5)*0.5);
    tips.push({node:0, th, gen:0, steps: staedt?(plan.groesse==='metropole'?16: plan.groesse==='grossstadt'?7:4)+((rnd()*2)|0) : 6+((rnd()*3)|0)}); }
  const maxE= staedt? (plan.groesse==='metropole'?Math.min(150,40+((plan.houses.length*0.36)|0)): plan.groesse==='grossstadt'?54:24) : 8, gates=[];
  while(tips.length&&edges.length<maxE){
    const t=tips.shift(); if(t.steps<=0) continue;
    const nd=nodes[t.node];
    if(Rw&&Math.hypot(nd.x,nd.z)>Rw-14){ if(t.gen===0)gates.push({th:Math.atan2(nd.z,nd.x)}); continue; }
    const pts=walk(nd.x,nd.z,t.th, (staedt?34:26)+rnd()*(staedt?30:26), t.gen);
    if(pts.length<4) { if(t.gen===0)gates.push({th:Math.atan2(nd.x?nd.x:Math.cos(t.th),0)*0+Math.atan2(Math.sin(t.th),Math.cos(t.th))}); continue; }
    const ex=pts[pts.length-1]; let endNode=-1, dead=false;
    let bi=-1,bd=1e9; nodes.forEach((q,i2)=>{ if(i2===t.node)return; const d=Math.hypot(ex.x-q.x,ex.z-q.z); if(d<bd){bd=d;bi=i2;} });
    if(bd<(staedt?16:13)){ endNode=bi; dead=true;                                                        // SNAP an Knoten → Zyklus
      const P=nodes[bi], pv=pts[pts.length-2]; pts[pts.length-1]={x:P.x,z:P.z,th:Math.atan2(P.z-pv.z,P.x-pv.x)}; }
    else { let be=-1,bk=0,ed=1e9;
      edges.forEach((e,ei)=>{ e.pts.forEach((q,k)=>{ const d=Math.hypot(ex.x-q.x,ex.z-q.z); if(d<ed){ed=d;be=ei;bk=k;} }); });
      if(ed<(staedt?12:9)&&edges.length){ const q=edges[be].pts[bk]; nodes.push({x:q.x,z:q.z}); endNode=nodes.length-1; dead=true;  // SNAP an Kante
        const pv=pts[pts.length-2]; pts[pts.length-1]={x:q.x,z:q.z,th:Math.atan2(q.z-pv.z,q.x-pv.x)}; }
      else { nodes.push({x:ex.x,z:ex.z}); endNode=nodes.length-1; } }
    edges.push({a:t.node,b:endNode,pts,w:(t.gen===0)?sW:(t.gen===1)?sW*0.78:lw,gen:t.gen});
    if(!dead){
      tips.push({node:endNode, th:ex.th+(grid?0:(rnd()-0.5)*0.18), gen:t.gen, steps:t.steps-1});
      if(rnd()<(staedt?(plan.groesse==='metropole'?0.72:0.6):0.28)&&t.gen<2&&edges.length>1){ const sg=(rnd()<0.5)?1:-1;
        tips.push({node:endNode, th:ex.th+sg*Math.PI/2+(grid?0:(rnd()-0.5)*0.3), gen:t.gen+1, steps:(t.gen===0)?2+((rnd()*3)|0):1+((rnd()*2)|0)}); } }
  }
  if(staedt){                                                                              // VERBINDUNGS-PASS: Sackgassen schließen → garantierte Blöcke
    const degF=k=>{ let d=0; for(const e of edges){ if(e.a===k||e.b===k)d++; } return d; };
    const maxAdd= plan.groesse==='metropole'?8: plan.groesse==='grossstadt'?4: plan.groesse==='stadt'?3:1; let added=0;
    const zyk=()=>Math.max(0,edges.length-(nodes.length-1));
    for(const RUNDE of [{dm:55,fr:8,dg:2},{dm:80,fr:5,dg:3}]){ if(RUNDE.fr<8&&zyk()>0)break;
    for(let i2=1;i2<nodes.length&&added<maxAdd;i2++){ if(degF(i2)>RUNDE.dg)continue;
      for(let j2=i2+1;j2<nodes.length&&added<maxAdd;j2++){ if(degF(j2)>RUNDE.dg)continue;
        if(edges.some(e=>(e.a===i2&&e.b===j2)||(e.a===j2&&e.b===i2)))continue;
        const A=nodes[i2],B=nodes[j2], d=Math.hypot(B.x-A.x,B.z-A.z);
        if(d<24||d>RUNDE.dm)continue;
        const th=Math.atan2(B.z-A.z,B.x-A.x), np2=Math.max(3,(d/DS)|0), pts=[];
        for(let k2=0;k2<=np2;k2++){ const f=k2/np2, bow=Math.sin(f*Math.PI)*(rnd()-0.5)*3;
          pts.push({x:A.x+(B.x-A.x)*f-Math.sin(th)*bow, z:A.z+(B.z-A.z)*f+Math.cos(th)*bow, th}); }
        for(let k2=0;k2<pts.length-1;k2++) pts[k2].th=Math.atan2(pts[k2+1].z-pts[k2].z, pts[k2+1].x-pts[k2].x);   // th = echte Ableitung, nicht Sehne
        pts[pts.length-1].th=pts[pts.length-2].th;
        let frei=true;
        for(let k2=2;k2<pts.length-2&&frei;k2++){ for(const e of edges){ for(const q of e.pts){
          if(Math.hypot(pts[k2].x-q.x,pts[k2].z-q.z)<RUNDE.fr){frei=false;break;} } if(!frei)break; } }
        if(!frei)continue;
        edges.push({a:i2,b:j2,pts,w:sW*0.78,gen:1}); added++; } } } }
  const bruecken=[];
  if(fluss){ for(const e of edges){ if(e.gen!==0) continue;
    let i0=-1,i1=-1;
    e.pts.forEach((q,k)=>{ if(dFluss(q.x,q.z)<fluss.w/2+0.5){ if(i0<0)i0=k; i1=k; } });
    if(i0>=0){ const A=e.pts[Math.max(0,i0-1)], B=e.pts[Math.min(e.pts.length-1,i1+1)];
      bruecken.push({x:(A.x+B.x)/2, z:(A.z+B.z)/2, th:Math.atan2(B.z-A.z,B.x-A.x), len:Math.hypot(B.x-A.x,B.z-A.z)+3, w:e.w+1.2}); } } }
  return {nodes, edges, gates, bruecken};
}
    // ════════════ dorfLayout v5 — GRAPH-WACHSTUM + MAUER ════════════
    // prettier-ignore
    function dorfLayout(plan, ext, seed){
  const N=plan.norm, gap=N.gap, sW=N.strasseW, lw=N.laneW, gw=N.gehweg, n=ext.length;
  let s=((Math.round((seed||1)*389+71)*2654435761)>>>0); const rnd=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
  const staedt=plan.staedtisch;
  const jitAmp= staedt?0.05 : (plan.jahr<1500?0.9 : plan.jahr<1780?0.45 : 0.2);
  const DS=3;
  const walled= staedt&&plan.jahr<1750;                                                     // STADTMAUER-GESETZ: die Mauer erzwingt die Dichte
  const Rw= walled? Math.min(195, 26+Math.sqrt(n)*8.4) : 0;
  let fluss=null;                                                                            // FLUSS-GESETZ: der große Städtebauer
  if(rnd()<(staedt?0.45:0.30)){ const fth=rnd()*Math.PI, off=(16+rnd()*26)*(rnd()<0.5?1:-1), fw=8+rnd()*6;
    const fpts=[]; let dev=0; const R0=Math.max(340, Rw*2+120);
    for(let u=-R0;u<=R0;u+=6){ const th=fth+dev;
      fpts.push({x:Math.cos(fth)*u - Math.sin(fth)*off + Math.sin(fth)*dev*0, z:Math.sin(fth)*u + Math.cos(fth)*off, th});
      dev+=(rnd()-0.5)*0.05; }
    for(let k2=0;k2<fpts.length;k2++){ const b2=(rnd()-0.5); fpts[k2].x+=-Math.sin(fth)*b2; fpts[k2].z+=Math.cos(fth)*b2;
      if(k2>0) fpts[k2-1].th=Math.atan2(fpts[k2].z-fpts[k2-1].z, fpts[k2].x-fpts[k2-1].x); }
    fluss={pts:fpts, w:fw}; }
  const dFl=(x,z)=>{ if(!fluss)return 1e9; let m=1e9; for(const q of fluss.pts){ const d=Math.hypot(x-q.x,z-q.z); if(d<m)m=d; } return m; };
  const G=strassengraph(rnd, plan, sW, lw, Rw, fluss);
  const roads=G.edges;
  const at=(rd,u)=>{ const k=Math.max(0,Math.min(rd.pts.length-2,(u/DS)|0)), f=(u-k*DS)/DS, A=rd.pts[k], B=rd.pts[Math.min(rd.pts.length-1,k+1)];
    const x=A.x+(B.x-A.x)*f, z=A.z+(B.z-A.z)*f, th=A.th; return {x,z,th,nx:-Math.sin(th),nz:Math.cos(th)}; };
  const edepth=new Array(roads.length).fill(99);                                            // BFS-Tiefe → radiales Wachstum = Zeit-Gradient
  { const nd=new Array(G.nodes.length).fill(99); nd[0]=0; let ch=true;
    while(ch){ ch=false; roads.forEach((e,ei)=>{ const d=Math.min(nd[e.a],nd[e.b])+1;
      if(d<nd[e.a]){nd[e.a]=d;ch=true;} if(d<nd[e.b]){nd[e.b]=d;ch=true;}
      const dd=Math.min(nd[e.a],nd[e.b]); if(dd<edepth[ei]){edepth[ei]=dd;ch=true;} }); } }
  { const qMax=(plan.groesse==='metropole')?8:(plan.groesse==='grossstadt')?6:(plan.groesse==='stadt')?4:2;   /*QUERGASSEN-GESETZ: aus dem Strassen-BAUM wird GEWEBE — kernnahe Aeste (edepth≤3) werden quer verbunden, es entstehen GESCHLOSSENE BLOECKE (Zyklen = Block-Beweis)*/
    let qN=0; const paar=new Set(); const qMax2=qMax+2;
    const punktAuf=(rd,x,z)=>{ let bd=1e9,bx=0,bz=0,bth=0; for(let k2=0;k2+1<rd.pts.length;k2++){ const A2=rd.pts[k2],B2=rd.pts[k2+1];
      const dx=B2.x-A2.x,dz=B2.z-A2.z,L2=dx*dx+dz*dz||1; let t2=((x-A2.x)*dx+(z-A2.z)*dz)/L2; t2=Math.max(0,Math.min(1,t2));
      const px=A2.x+dx*t2, pz=A2.z+dz*t2, dd=Math.hypot(x-px,z-pz); if(dd<bd){bd=dd;bx=px;bz=pz;bth=A2.th;} } return {d:bd,x:bx,z:bz,th:bth}; };
    for(let i=0;i<roads.length&&qN<qMax;i++){ if(roads[i].gen>1||edepth[i]>3) continue;
      const li=(roads[i].pts.length-1)*DS;
      for(let j=i+1;j<roads.length&&qN<qMax2;j++){ if(roads[j].gen>1||edepth[j]>3||paar.has(i+'_'+j)) continue;
        for(const fu of [0.35,0.6]){ const P=at(roads[i], li*fu), Q=punktAuf(roads[j], P.x, P.z);
          if(Q.d<13||Q.d>48) continue;
          const qth=Math.atan2(Q.z-P.z, Q.x-P.x);
          if(Math.abs(Math.sin(qth-P.th))<0.55) continue;                                      /*quer, nicht parallel*/
          let frei9=true;
          for(let u9=3;u9<Q.d-3&&frei9;u9+=3){ const wx=P.x+Math.cos(qth)*u9, wz=P.z+Math.sin(qth)*u9;
            if(dFl(wx,wz)<(fluss?fluss.w/2:0)+3.5){frei9=false;break;}
            for(let m9=0;m9<roads.length;m9++){ if(m9===i||m9===j)continue; if(punktAuf(roads[m9],wx,wz).d<5.5){frei9=false;break;} } }
          if(!frei9) continue;
          const gp=[]; const gl=Q.d; for(let u9=0;u9<=gl;u9+=DS) gp.push({x:P.x+Math.cos(qth)*Math.min(u9,gl), z:P.z+Math.sin(qth)*Math.min(u9,gl), th:qth});
          gp.push({x:Q.x,z:Q.z,th:qth});
          roads.push({a:-1,b:-1,pts:gp,w:Math.max(2.6, lw*0.72),gen:2,len:gl,quer:true}); edepth.push(Math.min(edepth[i],edepth[j])+1);   /*quer-Flag: BINNENGASSE, nicht Vorstadt*/   /*len fehlte — (rd.len||0)=0 liess den Setzer die Gasse ueberspringen: WURZEL der Unbesaeumtheit (#1)*/
          paar.add(i+'_'+j); qN++;
          const P2=at(roads[i], li*(fu+0.28)); if(fu<0.5&&qN<qMax2){ const Q2=punktAuf(roads[j], P2.x, P2.z);   /*PAARUNG: zweite Parallelgasse je Block — erst zwei Schnitte machen QUARTIERE*/
            if(Q2.d>=13&&Q2.d<=48){ const th2=Math.atan2(Q2.z-P2.z,Q2.x-P2.x);
              if(Math.abs(Math.sin(th2-P2.th))>=0.55){ let fr2=true;
                for(let u9=3;u9<Q2.d-3&&fr2;u9+=3){ const wx=P2.x+Math.cos(th2)*u9, wz=P2.z+Math.sin(th2)*u9;
                  if(dFl(wx,wz)<(fluss?fluss.w/2:0)+3.5){fr2=false;break;}
                  for(let m9=0;m9<roads.length;m9++){ if(m9===i||m9===j)continue; if(punktAuf(roads[m9],wx,wz).d<5.5){fr2=false;break;} } }
                if(fr2){ const gp2=[]; for(let u9=0;u9<=Q2.d;u9+=DS) gp2.push({x:P2.x+Math.cos(th2)*Math.min(u9,Q2.d), z:P2.z+Math.sin(th2)*Math.min(u9,Q2.d), th:th2});
                  gp2.push({x:Q2.x,z:Q2.z,th:th2});
                  roads.push({a:-1,b:-1,pts:gp2,w:Math.max(2.6, lw*0.72),gen:2,len:Q2.d,quer:true}); edepth.push(Math.min(edepth[i],edepth[j])+1); qN++; } } } }
          break; } } }
    plan._quergassen=qN; }
  if(staedt&&plan.jahr>1700){ let zqx=0,zqz=0,zqn=0;                                          /*STRASSEN-GEDAECHTNIS (#2): Kern-Gassen SCHMAL, Saum breit — die Breite erinnert die Zeit; gen0-Arterien bleiben*/
    for(const rd9 of roads) for(const q9 of rd9.pts){ zqx+=q9.x; zqz+=q9.z; zqn++; } zqx/=zqn; zqz/=zqn;
    let rq=30; for(const rd9 of roads) for(const q9 of rd9.pts){ const d=Math.hypot(q9.x-zqx,q9.z-zqz); if(d>rq)rq=d; }
    for(const rd9 of roads){ if(rd9.gen===0) continue; const qm=rd9.pts[Math.floor(rd9.pts.length/2)];
      const dN=Math.min(1, Math.hypot(qm.x-zqx,qm.z-zqz)/(rq*0.85));
      rd9.w=Math.max(2.2, rd9.w*(0.72+0.42*dN)); } }
  const gatePts=[];
  if(walled){                                                                                // VORSTADT-GESETZ: Ausfallstraßen ab Tor tragen den Überlauf
    const dg0=new Array(G.nodes.length).fill(0); roads.forEach(e=>{dg0[e.a]++;dg0[e.b]++;});
    let gts=G.gates.slice();
    roads.forEach(e=>{ if(e.gen===0&&dg0[e.b]===1){ const q=e.pts[e.pts.length-1];
      if(Math.hypot(q.x,q.z)>Rw-20) gts.push({th:Math.atan2(q.z,q.x)}); } });
    if(gts.length<2) gts.push({th:(gts[0]?gts[0].th:0)+Math.PI});
    const seen=[];
    for(const g2 of gts){ if(seen.some(a2=>Math.abs(Math.atan2(Math.sin(a2-g2.th),Math.cos(a2-g2.th)))<0.5))continue; seen.push(g2.th);
      const gx=Math.cos(g2.th)*Rw, gz=Math.sin(g2.th)*Rw; gatePts.push({x:gx,z:gz,th:g2.th});
      const flen=(plan.groesse==='metropole')?230:(plan.groesse==='grossstadt')?110:70;
      const fp=[]; for(let u=0;u<=flen;u+=DS){ fp.push({x:gx+Math.cos(g2.th)*(u+1), z:gz+Math.sin(g2.th)*(u+1), th:g2.th}); }
      roads.push({a:-1,b:-1,pts:fp,w:sW*0.6,gen:2}); edepth.push(7);
      if(plan.groesse==='metropole'||plan.groesse==='grossstadt'){                            // FAUBOURG-GESETZ: die Vorstadt ist selbst ein Netz
        const nq=(plan.groesse==='metropole')?5:2;
        for(let qk=0;qk<nq;qk++){ const uq=26+qk*(flen-40)/Math.max(1,nq-1)+rnd()*10, sg=(rnd()<0.5?1:-1);
          const qx=gx+Math.cos(g2.th)*uq, qz=gz+Math.sin(g2.th)*uq, qth=g2.th+sg*Math.PI/2+(rnd()-0.5)*0.25;
          const qp=[]; for(let u=0;u<=40+rnd()*22;u+=DS){ qp.push({x:qx+Math.cos(qth)*u, z:qz+Math.sin(qth)*u, th:qth}); }
          roads.push({a:-1,b:-1,pts:qp,w:lw,gen:2}); edepth.push(8); } } } }
  const pl=new Array(n), obbs=[], brunnen=[], fences=[], felder=[], staende=[];
  let platz=null;
  if(!staedt||plan.kernel==='markt'){ const PW=Math.max(7,5+Math.min(n,40)*0.30), PD=Math.max(6,PW*0.55);
    platz={cx:0,cz:sW/2+PD/2, phi:0, ex:PW, ez:PD/2, typ:(plan.kernel==='anger'||(staedt&&plan.jahr>1840))?'gras':'weg'};   // PARK-GESETZ der Moderne brunnen.push({x:0,z:sW/2+PD/2});
    if(platz.typ==='weg'){ staende.push({x:-PW*0.45,z:sW/2+PD*0.45}); staende.push({x:PW*0.45,z:sW/2+PD*0.55}); if(n>18)staende.push({x:0,z:sW/2+PD*0.82}); } }
  else brunnen.push({x:sW/2+2.4,z:sW/2+2.4});
  const platzObb= platz? {cx:platz.cx,cz:platz.cz,phi:0,ex:platz.ex,ez:platz.ez} : null;
  const curs=[];
  const ordn=[...roads.keys()].sort((a,b)=>{ const qa=(roads[a].gen===2&&(roads[a].len||99)<=44)?0:1, qb=(roads[b].gen===2&&(roads[b].len||99)<=44)?0:1; return qa-qb; });   /*QUERGASSEN-VORRANG (#1): Kurzgassen setzen ZUERST — sonst frisst das Hauptstrassen-Hinterland ihr Bauland (GEMESSEN 0 Saeumer trotz len)*/
  for(const r of ordn){ const st0= (edepth[r]===0&&platz)? platz.ex*0.7 : (roads[r].gen===2&&(roads[r].len||99)<=44? 1.6 : 2.5);
    curs.push({rd:r, side: 1, cur:st0}); curs.push({rd:r, side:-1, cur:st0}); }
  const parentCu={};
  const tryPlace=(i, cu, skipPair)=>{                                                       // SAT + STRASSEN-FREIHALTUNG + MAUER
    const rd=roads[cu.rd], e=ext[i], exH=(e.x1-e.x0)/2, ezH=(e.z1-e.z0)/2, lcx=(e.x0+e.x1)/2, lcz=(e.z0+e.z1)/2;
    const QD=(globalThis.__qd=globalThis.__qd||{t:0,mauer:0,obb:0,laen:0,ok:0}); if(rd.quer)QD.t++;
    for(let tr=0;tr<26;tr++){
      const sc=cu.cur+exH; if(sc>rd.pts.length*DS-(rd.quer?2.8:6)){ if(rd.quer)QD.laen++; return null; }   /*quer nutzt die volle Laenge*/
      const q=at(rd,sc), jit=(rnd()-0.5)*2*jitAmp;
      const phi=Math.atan2(cu.side*q.nx, cu.side*q.nz);
      const c=Math.cos(phi), s2=Math.sin(phi);
      const ccx=q.x+cu.side*q.nx*(rd.w/2+gw+jit+ezH), ccz=q.z+cu.side*q.nz*(rd.w/2+gw+jit+ezH);
      const o={cx:ccx,cz:ccz,phi,ex:exH,ez:ezH};
      let ok=true;
      if(Rw){ const rc=Math.hypot(ccx,ccz), rq=Math.hypot(exH,ezH);                          // MAUER: Stadt innen, Vorstadt außen, Mauerband tabu
        if(rd.gen!==2&&rc>Rw-2.2-rq) ok=false;
        if(rd.gen===2&&!rd.quer&&rc<Rw+1.2+rq) ok=false; if(!ok&&rd.quer)QD.mauer++;
        if(Math.abs(rc-Rw)<2.0+rq) ok=false; }
      if(ok) for(let j2=0;j2<obbs.length;j2++){ if(skipPair===obbs[j2].i)continue;
        if(obbSep(o,obbs[j2].o)<gap-1e-6){ ok=false; if(rd.quer)QD.obb++; break; } }
      if(ok&&platzObb&&obbSep(o,platzObb)<0.5) ok=false;
      if(ok&&fluss&&dFl(ccx,ccz)<fluss.w/2+2+Math.hypot(exH,ezH)) ok=false;                 // UFER-FREIHALTUNG
      if(ok){ const k0=(sc/DS)|0, kw=(((exH+rd.w/2+gw+4)/DS)|0)+1;
        for(let r2=0;r2<roads.length&&ok;r2++){ const rr=roads[r2], own=(r2===cu.rd);
          for(let k5=0;k5<rr.pts.length;k5++){ const q2=rr.pts[k5], thr=(own&&Math.abs(k5-k0)<=kw)?(rr.w/2+0.02):(rr.w/2+0.25);
            if(distPunktOBB(q2.x,q2.z,o)<thr){ ok=false; break; } } } }
      if(ok){ const tx=ccx-(lcx*c+lcz*s2), tz=ccz-(-lcx*s2+lcz*c);
        const fmx=q.x+cu.side*q.nx*(rd.w/2+gw+jit), fmz=q.z+cu.side*q.nz*(rd.w/2+gw+jit);
        pl[i]={x:tx,z:tz,phi,obb:o,fm:[fmx,fmz],rd:cu.rd,fr:rd.w/2+gw,jit};
        obbs.push({i,o}); parentCu[i]=cu;
        const prevEnd=cu.lastEnd;
        if(!staedt&&prevEnd!=null&&(sc-exH)-prevEnd<=7.5&&(sc-exH)-prevEnd>=1.2){
          const a0=at(rd,prevEnd+0.35), a1=at(rd,sc-exH-0.35), off=rd.w/2+gw;
          fences.push({x0:a0.x+cu.side*a0.nx*off, z0:a0.z+cu.side*a0.nz*off, x1:a1.x+cu.side*a1.nx*off, z1:a1.z+cu.side*a1.nz*off}); }
        if(rd.quer){QD.ok++; (QD.pos=QD.pos||[]).push([Math.round(o.cx),Math.round(o.cz)]);}
        cu.lastEnd=sc+exH;
        const dN9=(staedt&&plan.jahr>1700)? Math.min(1, Math.hypot(q.x,q.z)/(Rw*0.82)) : 1;   /*SETZER-VERDICHTUNG: die Fuge waechst mit dem Radius — der KERN rueckt in die Snap-Zone und fusioniert zur geschlossenen STRASSENWAND, der Saum atmet*/
        cu.cur=sc+exH+gap*(0.22+0.78*dN9)+(staedt?rnd()*0.15*dN9:rnd()*1.2);
        return pl[i]; }
      cu.cur+=1.1; }
    return null; };
  for(let i=0;i<n;i++){
    const g=plan.houses[i];
    if(g.rolle==='scheune'){
      const j=g.parent, P0=pl[j]; if(!P0||Math.abs(P0.obb.cz)>5000){ pl[i]={x:0,z:-9999-i*20,phi:0,obb:{cx:0,cz:-9999-i*20,phi:0,ex:1,ez:1}}; continue; }
      const e=ext[i]; let exS=(e.x1-e.x0)/2, ezS=(e.z1-e.z0)/2, phi=P0.phi;
      if(rnd()<0.55&&exS<=P0.obb.ez-0.05&&ezS<=P0.obb.ex+3){ phi=P0.phi+Math.PI/2; const t2=exS; exS=ezS; ezS=t2; }
      const c=Math.cos(P0.phi), s2=Math.sin(P0.phi), ox=s2, oz=c;
      let done=false;
      for(let k2=0;k2<5&&!done;k2++){
        const sh=(k2===0)?Math.max(-1,Math.min(1,(rnd()-0.5)*2))*Math.max(0,P0.obb.ex-exS-0.15):0;
        const ux=c, uz=-s2;
        const ccx=P0.obb.cx+ox*(P0.obb.ez+1.4+k2*0.8+ezS)+ux*sh, ccz=P0.obb.cz+oz*(P0.obb.ez+1.4+k2*0.8+ezS)+uz*sh;
        const o={cx:ccx,cz:ccz,phi,ex:exS,ez:ezS};
        let ok=true;
        if(Rw){ const rc=Math.hypot(ccx,ccz), rq=Math.hypot(exS,ezS), rp=Math.hypot(P0.obb.cx,P0.obb.cz);
          if(rp<Rw&&rc>Rw-2.2-rq) ok=false; if(rp>Rw&&rc<Rw+1.2+rq) ok=false; if(Math.abs(rc-Rw)<2.0+rq) ok=false; }
        if(ok) for(const q2 of obbs){ if(q2.i===j){ if(obbSep(o,q2.o)<0.9)ok=false; }
          else if(obbSep(o,q2.o)<gap-1e-6)ok=false; if(!ok)break; }
        if(ok&&platzObb&&obbSep(o,platzObb)<0.5)ok=false;
        if(ok&&fluss&&dFl(ccx,ccz)<fluss.w/2+2+Math.hypot(exS,ezS))ok=false;
        if(ok){ for(const rr of roads){ for(const q3 of rr.pts){ if(distPunktOBB(q3.x,q3.z,o)<rr.w/2+0.25){ok=false;break;} } if(!ok)break; } }
        if(ok){ const lcx=(e.x0+e.x1)/2, lcz=(e.z0+e.z1)/2, cc=Math.cos(phi), ss=Math.sin(phi);
          pl[i]={x:ccx-(lcx*cc+lcz*ss), z:ccz-(-lcx*ss+lcz*cc), phi, obb:o, parent:j};
          obbs.push({i,o}); done=true; } }
      if(!done) pl[i]={x:0,z:-9999-i*20,phi:0,obb:{cx:0,cz:-9999-i*20,phi:0,ex:1,ez:1}};
      continue; }
    if(g.rolle==='burg'){                                                                    // BURG-GESETZ: Bergfried innen an der Mauer, Front zur Stadt
      const e=ext[i], exB=(e.x1-e.x0)/2, ezB=(e.z1-e.z0)/2, rq=Math.hypot(exB,ezB);
      let done=false;
      const a0=rnd()*Math.PI*2, rB=(Rw?Rw-4.5-rq:34+rq);
      for(let k2=0;k2<10&&!done;k2++){ const a2=a0+k2*0.63;
        const ccx=Math.cos(a2)*rB, ccz=Math.sin(a2)*rB, phi=Math.atan2(-Math.sin(a2),-Math.cos(a2))*0+Math.atan2(-Math.cos(a2)*0-Math.sin(a2), -Math.cos(a2));
        const o={cx:ccx,cz:ccz,phi,ex:exB,ez:ezB};
        let ok=true;
        for(const q2 of obbs) if(obbSep(o,q2.o)<gap-1e-6){ok=false;break;}
        if(ok&&platzObb&&obbSep(o,platzObb)<0.5)ok=false;
        if(ok&&fluss&&dFl(ccx,ccz)<fluss.w/2+2+rq)ok=false;
        if(ok){ for(const rr of roads){ for(const q3 of rr.pts){ if(distPunktOBB(q3.x,q3.z,o)<rr.w/2+0.25){ok=false;break;} } if(!ok)break; } }
        if(ok&&Rw&&Math.abs(Math.hypot(ccx,ccz)-Rw)<2.0+rq)ok=false;
        if(ok){ const lcx=(e.x0+e.x1)/2, lcz=(e.z0+e.z1)/2, cc=Math.cos(phi), ss=Math.sin(phi);
          pl[i]={x:ccx-(lcx*cc+lcz*ss), z:ccz-(-lcx*ss+lcz*cc), phi, obb:o};
          obbs.push({i,o}); done=true; } }
      if(!done) pl[i]={x:0,z:-9999-i*20,phi:0,obb:{cx:0,cz:-9999-i*20,phi:0,ex:1,ez:1}};
      continue; }
    const curMetric=(cu)=>{ let m=edepth[cu.rd]*34+cu.cur;                                  // radiales Wachstum: BFS-Tiefe zuerst
      if(g.sektor!=null){ const rp=roads[cu.rd].pts, qm=rp[(rp.length/2)|0];
        const da=Math.atan2(Math.sin(Math.atan2(qm.z,qm.x)-g.sektor),Math.cos(Math.atan2(qm.z,qm.x)-g.sektor));
        const rM=Math.hypot(qm.x,qm.z);
        m=(Math.abs(da)<1.0&&rM>20)? (cu.cur+edepth[cu.rd]*4) : (900+rM*2+cu.cur); }           // GEWERBE-ZWANG: randige Sektor-Kanten — auch im Fallback
      return m; };
    let best=null,bs=1e9;
    for(const cu of curs){ const m=curMetric(cu)+rnd()*2-(roads[cu.rd].quer?12:0); if(m<bs){bs=m;best=cu;} }   /*QUER-BONUS (#1): die Metrik (edepth·4) liess Binnengassen NIE gewinnen — jetzt bauen sie zuerst ihre Haeuser*/
    let placedP=tryPlace(i,best,-1);
    if(!placedP){ const so=curs.slice().sort((a,b2)=>curMetric(a)-curMetric(b2));
      for(const cu of so){ if(cu!==best&&(placedP=tryPlace(i,cu,-1)))break; } }
    if(!placedP){ pl[i]={x:0,z:9999+i*20,phi:0,obb:{cx:0,cz:9999+i*20,phi:0,ex:1,ez:1}}; continue; }
    const cu=parentCu[i];
    if(g.rolle!=='kirche'&&i>0&&i%8===0){ const q=at(roads[cu.rd],Math.max(2,cu.cur-2));
      brunnen.push({x:q.x+cu.side*q.nx*(roads[cu.rd].w/2+0.6), z:q.z+cu.side*q.nz*(roads[cu.rd].w/2+0.6)}); }
  }
  for(let r=0;r<roads.length;r++){ let mx=8;
    for(const cu of curs) if(cu.rd===r) mx=Math.max(mx,cu.cur+4);
    roads[r].len=Math.min(mx, roads[r].pts.length*DS-3); }
  const deg=new Array(G.nodes.length).fill(0); roads.forEach(e=>{ if(e.a>=0){deg[e.a]++;deg[e.b]++;} });
  const feldwege=[];
  if(walled){ roads.forEach(rd=>{ if(rd.gen!==2)return; const q=at(rd,(rd.len||8)-2);
      const fp=[]; for(let u=0;u<=20;u+=DS){ fp.push({x:q.x+Math.cos(q.th)*u, z:q.z+Math.sin(q.th)*u, th:q.th}); }
      feldwege.push({pts:fp, w:rd.w}); }); }
  else { roads.forEach(e=>{ if(e.gen!==0||deg[e.b]!==1)return; const q=e.pts[e.pts.length-1];
    const fp=[]; for(let u=0;u<=22;u+=DS){ fp.push({x:q.x+Math.cos(q.th)*u, z:q.z+Math.sin(q.th)*u, th:q.th}); }
    feldwege.push({pts:fp, w:sW*0.6}); }); }
  for(const fw of feldwege){ const q=fw.pts[Math.min(2,fw.pts.length-1)];
    for(let k2=0;k2<(n>14?2:1);k2++){ const sgn=k2===0?1:-1, fwd=12+rnd()*9, fd=8+rnd()*7;
      const nx2=-Math.sin(q.th), nz2=Math.cos(q.th);
      const fcx=q.x+Math.cos(q.th)*(6+fwd/2)+sgn*nx2*(sW/2+2+fd/2), fcz=q.z+Math.sin(q.th)*(6+fwd/2)+sgn*nz2*(sW/2+2+fd/2);
      const fo={cx:fcx,cz:fcz,phi:q.th,ex:fwd/2,ez:fd/2};
      let ok=true; for(const q2 of obbs) if(obbSep(fo,q2.o)<0.5){ok=false;break;}
      if(ok&&fluss){ for(const qf of fluss.pts){ if(distPunktOBB(qf.x,qf.z,fo)<fluss.w/2+0.5){ok=false;break;} } }
      if(ok&&Rw){ let mn=1e9; for(let a2=0;a2<12;a2++){ const wx=Math.cos(a2/12*2*Math.PI)*Rw, wz=Math.sin(a2/12*2*Math.PI)*Rw;
        mn=Math.min(mn,distPunktOBB(wx,wz,fo)); } if(Math.hypot(fcx,fcz)<Rw+3&&mn<1.5)ok=false; }
      if(ok) felder.push(fo); } }
  let mauer=null;
  if(walled){ const NV=30, segs=[], towers=[], vr=[];
    for(let k2=0;k2<NV;k2++) vr.push(Rw*(0.985+rnd()*0.03));
    const gA=0.30;
    for(let k2=0;k2<NV;k2++){ const a0=k2/NV*2*Math.PI, a1=(k2+1)/NV*2*Math.PI, am=(a0+a1)/2;
      const nearGate=gatePts.some(g2=>Math.abs(Math.atan2(Math.sin(am-g2.th),Math.cos(am-g2.th)))<gA);
      if(nearGate) continue;
      segs.push({x0:Math.cos(a0)*vr[k2], z0:Math.sin(a0)*vr[k2], x1:Math.cos(a1)*vr[(k2+1)%NV], z1:Math.sin(a1)*vr[(k2+1)%NV]});
      if(k2%5===0) towers.push({x:Math.cos(a0)*vr[k2], z:Math.sin(a0)*vr[k2]}); }
    mauer={segs, towers, R:Rw, gates:gatePts}; }
  let X0=1e9,X1=-1e9,Z0=1e9,Z1=-1e9;
  obbs.forEach(q2=>{ const o=q2.o, rr=Math.hypot(o.ex,o.ez); X0=Math.min(X0,o.cx-rr);X1=Math.max(X1,o.cx+rr);Z0=Math.min(Z0,o.cz-rr);Z1=Math.max(Z1,o.cz+rr); });
  roads.forEach(rd=>{ for(let u=0;u<=(rd.len||0);u+=DS){ const q=at(rd,u); X0=Math.min(X0,q.x-rd.w);X1=Math.max(X1,q.x+rd.w);Z0=Math.min(Z0,q.z-rd.w);Z1=Math.max(Z1,q.z+rd.w); } });
  if(mauer){ X0=Math.min(X0,-Rw-8);X1=Math.max(X1,Rw+8);Z0=Math.min(Z0,-Rw-8);Z1=Math.max(Z1,Rw+8); }
  feldwege.forEach(fw=>fw.pts.forEach(q=>{ X0=Math.min(X0,q.x-4);X1=Math.max(X1,q.x+4);Z0=Math.min(Z0,q.z-4);Z1=Math.max(Z1,q.z+4); }));
  const trees=[]; let tries=0;
  while(trees.length<Math.min(30,6+n)&&tries<520){ tries++;
    let tx,tz;
    if(rnd()<0.58&&obbs.length){ const q2=obbs[(rnd()*obbs.length)|0].o;
      tx=q2.cx+Math.sin(q2.phi)*(q2.ez+2.5+rnd()*5)+(rnd()-0.5)*7; tz=q2.cz+Math.cos(q2.phi)*(q2.ez+2.5+rnd()*5)+(rnd()-0.5)*7; }
    else { tx=X0-6+rnd()*(X1-X0+12); tz=Z0-6+rnd()*(Z1-Z0+12); }
    let ok=true;
    for(const q2 of obbs) if(distPunktOBB(tx,tz,q2.o)<1.2){ok=false;break;}
    if(ok) for(const rd of roads){ for(let u=0;u<=(rd.len||0);u+=DS){ const q=at(rd,u); if(Math.hypot(tx-q.x,tz-q.z)<rd.w/2+0.9){ok=false;break;} } if(!ok)break; }
    if(ok&&platzObb&&distPunktOBB(tx,tz,platzObb)<(platz&&platz.typ==='weg'?0.8:-1))ok=false;
    if(ok&&felder.some(f=>distPunktOBB(tx,tz,f)<0.8))ok=false;
    if(ok&&fluss&&dFl(tx,tz)<fluss.w/2+0.8)ok=false;
    if(ok&&brunnen.some(b2=>Math.hypot(tx-b2.x,tz-b2.z)<3.5))ok=false;
    if(ok&&mauer&&Math.abs(Math.hypot(tx,tz)-Rw)<2.6)ok=false;
    if(ok&&trees.some(q2=>Math.hypot(tx-q2.x,tz-q2.z)<3.0))ok=false;
    if(ok) trees.push({x:tx,z:tz,h:2.6+rnd()*1.8}); }
  const laternen=[];                                                                          // LATERNEN-GESETZ: die moderne Stadt leuchtet
  let R9L=30; for(const rd9 of roads) for(const q9 of rd9.pts){ const d9=Math.hypot(q9.x,q9.z); if(d9>R9L)R9L=d9; }   /*ZEITREISE-Referenz: der ECHTE Stadtradius (Strassen-Max), nicht Mauer-Rw — GEMESSEN 0 Gas*/
  if(staedt&&plan.jahr>1850){ for(const rd of roads){ if(rd.gen>=2)continue;
    for(let u=6, fl=1; u<(rd.len||0)-4; u+=13+((u*7)%5), fl=-fl){ const q=at(rd,u);
      const lx2=q.x+fl*q.nx*(rd.w/2+gw+0.35), lz2=q.z+fl*q.nz*(rd.w/2+gw+0.35);
      let ok=true;
      for(const q2 of obbs){ if(distPunktOBB(lx2,lz2,q2.o)<0.45){ok=false;break;} }
      if(ok&&fluss&&dFl(lx2,lz2)<fluss.w/2+0.6)ok=false;
      if(ok&&laternen.some(l=>Math.hypot(lx2-l.x,lz2-l.z)<9))ok=false;
      if(ok){ const dL=Math.min(1, Math.hypot(lx2,lz2)/(R9L*0.80));                          /*LATERNEN-ZEITREISE: jede Laterne liest das JAHR ihres Rings — Gas im Altkern, Elektro am Saum*/
        const R0=globalThis.__ring; const rj=(R0&&R0.ringe)? (R0.gr0+(plan.jahr-R0.gr0)*Math.pow(dL,0.82)) : plan.jahr;
        const gasB=(rj<1895) && (plan.jahr<1930 || dL<0.45);                                /*NACHRUEST-WELLE: ab 1930 elektrifiziert die Moderne von AUSSEN herein — der Altkern behaelt sein Gaslicht (Berlin-Wahrheit)*/
        laternen.push({x:lx2,z:lz2,th:Math.atan2(-fl*q.nz,-fl*q.nx),gas:gasB}); } } } }
  const sp=at(roads[0],Math.min(roads[0].len||8,8));
  const nzyk=roads.length-(G.nodes.length-1);                                                // Zyklen = E − V + 1 (zusammenhängend)
  return {pl, roads:roads.map(rd=>({pts:rd.pts.filter((_,k2)=>k2*DS<=(rd.len||0)+DS), w:rd.w, gen:rd.gen, len:rd.len||0, quer:rd.quer||false})),   /*Whitelist +quer — das Flag starb an dieser Kopie (#1-Sonde: 0 Gassen im lay)*/
          feldwege, platz, brunnen, fences, felder, staende, spawn:{x:sp.x,z:sp.z}, trees, jitAmp, DS, mauer,
          fluss, bruecken:G.bruecken||[], laternen,
          graph:{nV:G.nodes.length, nE:roads.length, zyklen:Math.max(0,nzyk)},
          welt:{x0:X0-9,x1:X1+9,z0:Z0-9,z1:Z1+9}};
}

    // ═══════════════════════════════════════════════════════════════════════
    //  B4 PARAMS (Vertrags-Form {id,lab,min,max,step,def,law,grp}) — ABGELEITET
    //  aus den klickbaren Form-Reglern des Labs (worlds/fachwerk/index.html
    //  Z.51–79: die <input>-Zeilen tragen min/max/step/value; readParams mappt
    //  sie auf die Bau-Schlüssel und teilt Prozent-Regler durch 100 — hip =
    //  pH/100 · roofCurve = pCurve/100 · bend = pBend/100 · terrAsym =
    //  pTerrAsym/100; die Checkbox-Regler sind 0/1-Dials, Anbau ×2 faltet zu
    //  annexN 0..2). `def` = der Lab-Startzustand (die value-Attribute) — das
    //  Lab trägt keine eigene Regler-Tabelle, die HTML-Regler SIND die eine
    //  dokumentierte Quelle. Die String-Wahlen (Kultur · Fachwerk-Figur ·
    //  Grundriss · Stil · Dachtyp · Bogen) sind KEINE B4-Zeilen (B4 ist
    //  numerisch) — sie reisen je Rezept als fx-Daten. Die Meta-Regler
    //  (Jahr/Klima/Personen/Wohlstand → metaParams) und die Dorf-Regler
    //  bleiben Lab-UI (Ableitungs-Schicht bzw. W-A5b). Die Werkstatt rendert
    //  ihre Slider AUS diesen Daten (W-A1-Generik), der ov-Kanal von
    //  buildInstance liest dieselben ids.
    // ═══════════════════════════════════════════════════════════════════════
    // prettier-ignore
    var PARAMS = [
        { id: "W",           lab: "Breite",              min: 6,  max: 14, step: 0.5,  def: 9,  law: "Hausbreite in Metern",                                        grp: "FORM" },
        { id: "D",           lab: "Tiefe",               min: 5,  max: 10, step: 0.5,  def: 7,  law: "Haustiefe in Metern",                                         grp: "FORM" },
        { id: "storeys",     lab: "Geschosse",           min: 1,  max: 12, step: 1,    def: 2,  law: "Deckel 12 (Hochhäuser via Turm-Stapel-Gesetz)",               grp: "FORM" },
        { id: "bend",        lab: "Grundriss-Bogen",     min: 0,  max: 1,  step: 0.05, def: 0,  law: "EIN Verformungs-Feld biegt den ganzen Grundriss (I→U)",       grp: "FORM" },
        { id: "terrAsym",    lab: "Terr.-Versatz",       min: -1, max: 1,  step: 0.01, def: 0,  law: "Terrassierungs-Versatz (SETBACK-Gesetz)",                     grp: "FORM" },
        { id: "doppel",      lab: "Doppelhaus",          min: 0,  max: 1,  step: 1,    def: 0,  law: "geteilte Brandwand an +x (kein Flügel/Anbau dort)",           grp: "FORM" },
        { id: "pitchDeg",    lab: "Dachneigung",         min: 8,  max: 60, step: 1,    def: 50, law: "Grad; der Stil klemmt sein pMin (STILMODE)",                  grp: "DACH" },
        { id: "hip",         lab: "Dachform",            min: 0,  max: 1,  step: 0.02, def: 0,  law: "0 Satteldach · 0<..<1 Krüppelwalm · 1 Walmdach (stufenlos)",  grp: "DACH" },
        { id: "roofCurve",   lab: "Dachschwung",         min: 0,  max: 1,  step: 0.05, def: 0,  law: "konkaver Schwung, relativ zur eigenen Traufe (Minka)",        grp: "DACH" },
        { id: "treppgiebel", lab: "Treppengiebel",       min: 0,  max: 1,  step: 1,    def: 0,  law: "Krähenstufen erzwingen den vollen Giebel (hip=0)",            grp: "DACH" },
        { id: "kuppel",      lab: "Kuppel",              min: 0,  max: 1,  step: 1,    def: 0,  law: "Kuppel auf Pendentifs (Byzanz/Osmanen)",                      grp: "DACH" },
        { id: "annexN",      lab: "Anbau · Garage",      min: 0,  max: 2,  step: 1,    def: 0,  law: "0/1/2 Anbau-Zellen (Schleppdach-Flügel)",                     grp: "AUSSTATTUNG" },
        { id: "balcony",     lab: "Balkon (Laube)",      min: 0,  max: 1,  step: 1,    def: 0,  law: "Laube an der Rückseite, OG",                                  grp: "AUSSTATTUNG" },
        { id: "portikus",    lab: "Portikus · Säulen",   min: 0,  max: 1,  step: 1,    def: 0,  law: "Kolonnade + Gebälk + Tympanon (Feature→Material)",            grp: "AUSSTATTUNG" },
        { id: "arkade",      lab: "Arkade · Kreuzgang",  min: 0,  max: 1,  step: 1,    def: 0,  law: "Bogen-Gang folgt dem Grundriss-Umriss",                       grp: "AUSSTATTUNG" },
        { id: "turm",        lab: "Turm",                min: 0,  max: 1,  step: 1,    def: 0,  law: "hohler Turm an der Ringmauer (LOCHWAND-Gesetz)",              grp: "AUSSTATTUNG" },
        { id: "zinnen",      lab: "Zinnen · Burg",       min: 0,  max: 1,  step: 1,    def: 0,  law: "Wehrgang + Brustwehr + Merlonen (MERLON-Gesetz)",             grp: "AUSSTATTUNG" },
        { id: "veranda",     lab: "Veranda",             min: 0,  max: 1,  step: 1,    def: 0,  law: "umlaufender Pfostengang (Kolonial)",                          grp: "AUSSTATTUNG" },
        { id: "vorkragung",  lab: "Vorkragung (Jetty)",  min: 0,  max: 1,  step: 1,    def: 0,  law: "Obergeschoss kragt vor (mittelalterl. Fachwerk)",             grp: "AUSSTATTUNG" },
        { id: "pilotis",     lab: "Pilotis (Stelzen)",   min: 0,  max: 1,  step: 1,    def: 0,  law: "Stützen unter dem Haus, alles folgt baseY",                   grp: "AUSSTATTUNG" },
        { id: "terrasse",    lab: "Terrassierung",       min: 0,  max: 1,  step: 1,    def: 0,  law: "SETBACK-Gesetz (NYC 1916), hohle Tiers mit Lochwänden",       grp: "AUSSTATTUNG" },
    ];

    // ═══════════════════════════════════════════════════════════════════════
    //  B1 REZEPTE — die 32 klickbaren Haus-Kulturen des Labs (die Kultur-Wahl
    //  minus die Meta-Einträge `manuell`/`samen`). `s` = die FLACHEN
    //  numerischen Dials aus kulturParams(name, LAB_SEED) — LAB_SEED 3 ist der
    //  Boot-Samen des Labs (`let SEED=3`), derselbe Zustand, den ein Klick auf
    //  die Kultur beim Lab-Start zeigt (applyKultur → Slider → readParams).
    //  Die String-/Farb-Anteile (brace · stil · dachTyp · bogenTyp · grundriss ·
    //  col) reisen in fx (JSON-klonbar, must-ignore). fx.place (N5.7, Wörterbuch
    //  v1 §2.4): mode "settlement" + siteTag "haus" — der Settlement-Kanal ist
    //  GEBAUT (W-A5b): exportSettlement liefert die Slots, der Host hebt die
    //  Häuser DELIBERATE in die Welt (spawnSettlement); Worldgen streut weiter
    //  NICHT automatisch (der Auto-Dorf-Anschluss ist der benannte Folge-
    //  Schritt am _placeDispatch-"settlement"-Kanal, kein Wald-Code-if).
    //  Ein Rezept = kind "haus"; ids sind die KULTNAMES (Vertrags-
    //  Namensraum [a-z0-9_-]+, kollisionfrei gegen Pflanzen/Fahrzeug/Tor/Klinge).
    // ═══════════════════════════════════════════════════════════════════════
    var LAB_SEED = 3;
    var PRESETS = (function () {
        var out = {};
        for (var i = 0; i < KULTNAMES.length; i++) {
            var name = KULTNAMES[i];
            var kp = kulturParams(name, LAB_SEED);
            if (!kp) continue;
            var s = {
                W: kp.W,
                D: kp.D,
                pitchDeg: kp.pitchDeg,
                storeys: kp.storeys,
                hip: kp.hip,
                roofCurve: kp.roofCurve,
                treppgiebel: kp.treppgiebel,
                kuppel: kp.kuppel,
                portikus: kp.portikus,
                arkade: kp.arkade,
                turm: kp.turm,
                zinnen: kp.zinnen,
                veranda: kp.veranda,
                vorkragung: kp.vorkragung,
                pilotis: kp.pilotis,
                terrasse: kp.terrasse,
            };
            var fx = {
                place: { mode: "settlement", siteTag: "haus" },
                brace: kp.brace,
                stil: kp.stil,
                dachTyp: kp.dachTyp,
                bogenTyp: kp.bogenTyp,
                grundriss: kp.grundriss,
            };
            if (kp.col) fx.col = Object.assign({}, kp.col);
            out[name] = { kind: "haus", lab: KULTUR[name].label, s: s, fx: fx };
        }
        return out;
    })();

    // ── Der Parameter-Merge — reproduziert das Lab (applyKultur → readParams):
    //    Basis = die B4-Defaults + terrain:0 (Schnitt-Grenze (c)) + seed LAB_SEED;
    //    dann Rezept-s, Rezept-fx (place/col queren als Daten-Passagiere — der Bau
    //    liest nur seine Dial-Namen, der Bake liest p.col), dann ov (die
    //    vehicle-/porta-Merge-Ordnung: der Regler-Kanal gewinnt). ──
    function hausParams(pre, ov) {
        var P = { terrain: 0, seed: LAB_SEED };
        var i;
        for (i = 0; i < PARAMS.length; i++) P[PARAMS[i].id] = PARAMS[i].def;
        var srcs = [pre && pre.s, pre && pre.fx, ov];
        for (i = 0; i < srcs.length; i++) {
            var src = srcs[i];
            if (!src || typeof src !== "object") continue;
            for (var key in src) {
                if (!Object.prototype.hasOwnProperty.call(src, key)) continue;
                P[key] = src[key];
            }
        }
        return P;
    }

    // ── Der MASS-BAU → B-Struct — byte-Anker: buildHausLOD (Lab, LOD-Sonde)
    //    Z.„MASS-BUILD liefert ext/dims — identisch zu buildDorf": stapelBau
    //    (MASSNUR, LOD1F) einmal bauen, Hülle vermessen, sofort entsorgen.
    //    B trägt die Sonden-Identität (q am Ursprung, hofGap 2.5). ──
    function massBau(p) {
        var mass = stapelBau(Object.assign({}, p, { nur: MASSNUR }), LOD1F);
        var bx = new THREE.Box3().setFromObject(mass.g);
        var B = {
            p: p,
            q: { phi: 0, x: 0, z: 0, obb: { cx: 0, cz: 0 } },
            lod: "chunk",
            dyn: false,
            ext: { x0: bx.min.x, x1: bx.max.x, z0: bx.min.z, z1: bx.max.z, y1: bx.max.y },
            dims: mass.H.dims,
            fp: fpVon(mass.H),
            spawnL: { x: mass.H.spawn.x, z: mass.H.spawn.z },
            hofGap: 2.5,
            meshes: [],
        };
        mass.g.traverse(function (o) {
            if (o.geometry) o.geometry.dispose();
        });
        return B;
    }

    // ── DIE EINE STUFEN-QUELLE des Vertrags — buildStufe(p, stufe) → geoms
    //    (Rollen-Fragmente). Jede Host-Stufe fährt EXAKT den Lab-Pfad (Kopf):
    //    0 = promoteBauen + bakeLOD(0, alles) · 1 = fragFuer(B,1) ·
    //    2 = Warm-Pfad fragFuer(B,1) [wandTon] → fragFuer(B,2). KEIN hofFuer
    //    (Schnitt-Grenze (a)). Der Paritäts-Gate komponiert dieselben
    //    Primitive Shell-wörtlich und vergleicht byte-exakt. ──
    function buildStufe(p, stufe) {
        materials();
        var geoms = {};
        var turm = (p.storeys || 1) >= 6;
        if (stufe === 0) {
            // ≡ promoteBauen (Lab): RING-A-WÜRDE — Türme sparen Möbel+Innenwände,
            // Armut (p.arm, Dorf-Daten) spart Möbel; sonst der VOLLE Bau.
            var hp2 = Object.assign({}, p, {
                nur: turm ? { moebel: false, innenwaende: false } : p.arm ? { moebel: false } : {},
            });
            var st =
                (p.storeys || 1) > 11
                    ? stapelBau(hp2, { gelaende: false })
                    : (function () {
                          var H = HAUS(THREE, mat, hp2);
                          return { g: H.build({ gelaende: false }), H: H };
                      })();
            bakeLOD(st.g, p.col, geoms, 0, true); // LÜCKENLOS: alles=true (Kopf, Stufen-Wahrheit 0)
            st.g.traverse(function (o) {
                if (o.geometry) o.geometry.dispose();
            });
        } else {
            var B = massBau(p);
            if (stufe === 2 && !turm) {
                // ≡ LOD-Sonde WARM-PFAD: wandTon wie im Dorf beim Abstieg aus Stufe 1
                // gemessen (Fragment verworfen, Ton bleibt — lod2Koerper liest ihn).
                fragFuer(B, 1);
                B.frag = null;
                B.fragStufe = undefined;
            }
            mischeGeoms(geoms, fragFuer(B, stufe === 1 ? 1 : 2));
            B.frag = null;
            B.fragStufe = undefined;
        }
        return geoms;
    }

    // ── Rollen-Fragmente → EINE THREE.Group — der sofort-Zweig von
    //    finalizeGeoms (Lab) OHNE Szene (dorfGroup/Blende bleiben Shell-Glue).
    //    KARTEN-GRUND-REGEL (Kopf, Schnitt-Grenze (d)): _MAPPED-Rollen ohne
    //    Kultur-Farbe tragen den DEFCOL-Grundton als mat.color. ──
    var _mmGrund = {};
    function _mmGrundFor(role) {
        if (!_mmGrund[role]) {
            var m = _mmFor(role).clone();
            m.map = null;
            m.color = new THREE.Color(DEFCOL[role] != null ? DEFCOL[role] : 0xffffff);
            _mmGrund[role] = m;
        }
        return _mmGrund[role];
    }
    function geomsZuGruppe(geoms, kol) {
        materials();
        var g = new THREE.Group();
        for (var role in geoms) {
            var G = geoms[role];
            if (!G.vo) continue;
            var bg = new THREE.BufferGeometry();
            bg.setAttribute("position", new THREE.Float32BufferAttribute(G.pos, 3));
            bg.setAttribute("normal", new THREE.Float32BufferAttribute(G.nrm, 3));
            bg.setAttribute("color", new THREE.Float32BufferAttribute(G.col, 3));
            if (G.uv && G.uv.length === (G.pos.length / 3) * 2)
                bg.setAttribute("uv", new THREE.Float32BufferAttribute(G.uv, 2));
            bg.setIndex(G.idx);
            var karteOhneKultur = _MAPPED[role] && !(kol && kol[role] != null);
            var mm = new THREE.Mesh(bg, karteOhneKultur ? _mmGrundFor(role) : _mmFor(role));
            mm.castShadow = true;
            mm.receiveShadow = true;
            g.add(mm);
        }
        return g;
    }

    // ── B2: buildInstance(rezeptId, seed, lod, ov?) — die EINE Bau-Funktion ──
    // SEED-GETRIEBEN (Kopf: Fenstertakt · OG-Material · Giebel-Verband · Gauben ·
    // Fenster-Schlaf ziehen aus P.seed) — cv:6 friert das ein. lod klemmt auf
    // die deklarierten Stufen (kindStages.haus [0,1,2]: die GRÖSSTE Stufe ≤ der
    // Wahl, sonst die kleinste — die Flatten-Chokepoint-Semantik, fail-closed).
    // ov ist der B4-Regler-Kanal (P-Override NACH s+fx, die Lab-Slider-Semantik;
    // ov.seed überstimmt bewusst das seed-Argument). Ausgang: EINE THREE.Group
    // (je Rolle EIN gebakter Mesh, Vertex-Farben tragen Kultur×AO×Illusion),
    // Welt-Matrizen aktualisiert — die Naht sind die Float32-Attribute (G2.2).
    function buildInstance(rezeptId, seed, lod, ov) {
        var pre = PRESETS[rezeptId];
        if (!pre) return null;
        materials();
        var p = hausParams(pre, ov || null);
        var sd = Number(seed);
        if (isFinite(sd) && !(ov && typeof ov === "object" && ov.seed != null)) p.seed = sd;
        var L = lod | 0;
        var stufe = HOST_STUFEN[0];
        for (var i = 0; i < HOST_STUFEN.length; i++) if (HOST_STUFEN[i] <= L) stufe = HOST_STUFEN[i];
        var g = geomsZuGruppe(buildStufe(p, stufe), p.col || null);
        g.userData = { kind: "haus", rezeptId: rezeptId, seed: seed, lod: stufe };
        g.updateMatrixWorld(true);
        return g;
    }

    // ═══ ULTRAGUSS U6c — die drei Lab-Gesetze wohnen im Gesetzbuch (verbatim
    //     aus worlds/fachwerk/fachwerk.js gewandert): REIHEN-SNAP · BRANDWAND ·
    //     META. KONSUM BEIDSEITIG: buildDorf (Lab-Shell) UND exportSettlement
    //     (unten) rufen DIESELBEN Funktionen — eine Wahrheit, zwei Leser. ═══
    // REIHEN-SNAP-GESETZ: verdichtetes Bauen — parallele Baulinien-Nachbarn mit
    // Fuge<1.8m docken auf Norm-gap an (die Stadtgeschichte baute Wand an Wand);
    // läuft VOR der Platzierung, damit Solids/OBB konsistent fließen.
    // dorfB: [{dims,kern}] · pl: die Layout-Plätze (lay.pl — wird MUTIERT:
    // x/z + obb.cx/cz rücken zusammen) · gap: plan.norm.gap. Rückgabe: Snap-Zahl.
    function reihenSnap(dorfB, pl, gap){
      const dicht=(gap<=0.6);
      let snaps=0;
      if(dicht){
      for(let i=0;i<dorfB.length;i++){ const A=dorfB[i]; if(!A.dims||A.kern) continue;
        const qi=pl[i]; if(!qi) continue; const ci=Math.cos(qi.phi), si=Math.sin(qi.phi);
        for(let j=i+1;j<dorfB.length;j++){ const Bj=dorfB[j]; if(!Bj.dims||Bj.kern) continue;
          const qj=pl[j]; if(!qj) continue;
          let dphi=Math.abs(qi.phi-qj.phi)%Math.PI; if(dphi>Math.PI/2)dphi=Math.PI-dphi;
          if(dphi>0.18) continue;
          const dx=qj.obb.cx-qi.obb.cx, dz=qj.obb.cz-qi.obb.cz;
          const lx=dx*ci-dz*si, lz=dx*si+dz*ci;
          const Wi=A.dims.W||8, Wj=Bj.dims.W||8, Di=A.dims.D||8, Dj=Bj.dims.D||8;
          const soll=(Wi+Wj)/2+gap, fuge=Math.abs(lx)-(Wi+Wj)/2;
          if(Math.abs(lz)>Math.min(Di,Dj)*0.45 || fuge<=gap+0.02 || fuge>1.8) continue;
          const zug=(Math.abs(lx)-soll)/2, s2=Math.sign(lx);                                  // beide je halbe Fuge aufeinander zu — Straßenfronten bleiben
          const mvx=s2*zug*ci, mvz=-s2*zug*si;                                                // lokal (±zug,0) → Welt via R(phi)
          qi.x+=mvx; qi.z+=mvz; qi.obb.cx+=mvx; qi.obb.cz+=mvz;
          qj.x-=mvx; qj.z-=mvz; qj.obb.cx-=mvx; qj.obb.cz-=mvz;
          snaps++; } }
      }
      return snaps;
    }
    // BRANDWAND-GESETZ: verdichtetes Bauen wie in der Stadtgeschichte — parallele
    // Nachbarn mit anliegender Fuge machen die anliegende Seite zur fensterlosen
    // Brandmauer (der Same erfährt es via hp.brandwand). dorfB: [{dims,q,p}] —
    // p wird MUTIERT (p.brandwand.{x0,x1,z0,z1}=1) · gap: plan.norm.gap.
    // Rückgabe: Zahl der markierten anliegenden Seiten.
    function brandwand(dorfB, gap){
      let bwN=0;
      for(let i=0;i<dorfB.length;i++){ const A=dorfB[i]; if(!A.dims) continue;
        const Wi=A.dims.W||8, Di=A.dims.D||8, ci=Math.cos(A.q.phi), si=Math.sin(A.q.phi);
        for(let j=0;j<dorfB.length;j++){ if(j===i) continue; const Bj=dorfB[j]; if(!Bj.dims) continue;
          let dphi=Math.abs(A.q.phi-Bj.q.phi)%Math.PI; if(dphi>Math.PI/2) dphi=Math.PI-dphi;
          if(dphi>0.26) continue;                                                             // nur parallele Reihen bilden Brandwände
          const dx=Bj.q.obb.cx-A.q.obb.cx, dz=Bj.q.obb.cz-A.q.obb.cz;
          const lx=dx*ci-dz*si, lz=dx*si+dz*ci;                                               // ins Haus-Lokal von A (R(-phi))
          const Wj=Bj.dims.W||8, Dj=Bj.dims.D||8;
          if(Math.abs(lz)<(Di+Dj)/2*0.6 && Math.abs(Math.abs(lx)-(Wi+Wj)/2)<((gap||0.06)+0.15)){   // Schwelle an die NORM gekoppelt — gedockte Marktgassen (0.6) werden ebenso Brandwände wie Metropol-Fugen (0.06)
            A.p.brandwand=A.p.brandwand||{}; A.p.brandwand[lx>0?'x1':'x0']=1; bwN++; }
          if(Math.abs(lx)<(Wi+Wj)/2*0.6 && Math.abs(Math.abs(lz)-(Di+Dj)/2)<((gap||0.06)+0.15)){
            A.p.brandwand=A.p.brandwand||{}; A.p.brandwand[lz>0?'z1':'z0']=1; bwN++; } } }
      return bwN;
    }
    // ════════════ META-GESETZ ════════════ eine Quelle für Browser + Sweep
    // Aus Zeit · Klima · Personen · Wohlstand emergiert die ganze Form — nach der Ordnung der Stil-Epochen.
    function metaParams(jahr, klima, leute, wohl){
      const kalt=klima<0.3, heiss=klima>0.72, nord=klima<0.5;
      const epoche = jahr<1150?'romanik' : jahr<1500?'gotik' : jahr<1650?'renaissance' : jahr<1770?'barock' : jahr<1900?'klassik' : jahr<1950?'gruender' : 'moderne';
      // PITCH — steil(kalt,früh) → flach(heiss,spät); heisse Zonen mediterran gekappt
      const eraP = jahr<1500?56 : jahr<1770?44 : jahr<1900?34 : jahr<1950?24 : 13;
      let pitch = Math.round(eraP + (0.5-klima)*34);
      if(heiss) pitch = Math.min(pitch, Math.round(22-(klima-0.72)*30));
      pitch = Math.max(7, Math.min(62, pitch));
      // MATERIAL — Klima × Wohlstand × Epoche (Vernakular ↔ Mauerwerk)
      let stil;
      if(epoche==='moderne') stil = wohl>0.55?'glas':'modern';
      else if(heiss) stil = 'stein';
      else if(jahr>=1850) stil = 'klinker';
      else if(wohl>0.62) stil = (jahr>=1450?'klinker':'stein');     // reich → Mauerwerk (Burg: früh Stein)
      else if(wohl>0.4 && jahr>=1500) stil = 'klinker';             // bürgerlich (Renaissance+) → Backstein-Stadthaus
      else stil = kalt?'huette':'alt';                              // Vernakular: Norden Holz, Mitte Fachwerk
      const massiv = (stil==='stein'||stil==='klinker');
      // BOGEN — Epoche × Mauerwerk
      let bogen='none';
      if(heiss && massiv && jahr<1800) bogen='hufeisen';
      else if(epoche==='gotik' && massiv) bogen='spitz';
      else if((epoche==='romanik'||epoche==='renaissance') && massiv) bogen='rund';
      // GRUNDRISS — Süden Hof (Kühlung), grosse Wohlhabende L
      const grund = heiss ? 'hof' : ((wohl>0.5&&leute>8)?'L':'I');
      // GRÖSSE — Personen × Wohlstand
      const storeys = Math.max(1, Math.min(8, Math.round(1 + leute/5 + (wohl>0.55?1:0) + (epoche==='moderne'&&wohl>0.7?Math.floor(leute/3):0))));
      const W = Math.max(6, Math.min(15, Math.round(6 + leute*0.4 + wohl*3)));
      const D = Math.max(5, Math.min(11, Math.round(5 + leute*0.3 + wohl*2)));
      // MONUMENT-VOKABULAR — Wohlstand schaltet die Hochform der Epoche
      const F={treppgiebel:0,vorkragung:0,portikus:0,kuppel:0,turm:0,zinnen:0,veranda:0,pilotis:0,terrasse:0,arkade:0};
      const reich = wohl>0.66, mittel = wohl>0.4&&wohl<=0.66;
      if(reich){
        if(epoche==='romanik'||epoche==='gotik'){ F.turm=1; if(jahr<1350) F.zinnen=1; }   // Burg / Dom
        else if(epoche==='renaissance') F.portikus=1;                                      // Palazzo
        else if(epoche==='barock') F.kuppel=1;                                             // Barock-Kuppel
        else if(epoche==='klassik') F.portikus=1;                                          // Tempel-Portikus
        else if(epoche==='gruender'){ F.turm=1; if(!kalt) F.veranda=1; }                   // Viktorianisch
        else if(epoche==='moderne') F.pilotis=1;                                           // Villa moderne
      }
      // Vernakular/bürgerliche Marker — regional, additiv
      if(nord && stil==='klinker' && jahr>=1400 && jahr<1700 && !reich) F.treppgiebel=1;   // Hanse / Holland (bürgerlich, nicht auf Monument)
      if(epoche==='gotik' && stil==='alt' && !reich) F.vorkragung=1;                       // Fachwerk-Jetty
      if(heiss && massiv && (mittel||reich) && jahr<1800) F.arkade=1;                      // Riad / Kreuzgang
      if(!heiss && !kalt && jahr>=1750 && jahr<1930 && mittel && grund!=='hof') F.veranda=1; // Kolonial
      // FARBEN — Stil × Klima
      let col;
      if(stil==='huette') col = kalt?{holz:0x6b5236,stamm:0x6b655e,ziegel:0x55402a}:{holz:0x82602f,stamm:0x664a2e,ziegel:0x664a2e};
      else if(stil==='stein') col = heiss?{putz:0xf2efe8,ziegel:0xc06a3a,ziegel2:0x9a5230}:{putz:0xe4d8bc,ziegel:0xab6840,ziegel2:0x824c2c};
      else if(stil==='klinker') col = nord?{backstein:0x8c4636,ziegel:0x6e3828,ziegel2:0x552a1d}:{backstein:0x9a5a44,ziegel:0x7a3f2c,ziegel2:0x60301f};
      else if(stil==='modern'||stil==='glas') col = {putz:0xe9e6df,glas:0x9fb8c4,metall:0x8a8a92,dachmod:0x33363c};
      else col = {holz:0x6a4c2e,gefach:0xe9e3d6,ziegel:0x9c4a35,ziegel2:0x7e3826};
      return {pitch,W,D,storeys,stil,bogen,grund,col,F,epoche};
    }

    // ── N5.7 SETTLEMENT-EXPORT — exportSettlement(dp) (das exportDrive-Muster,
    //    N6.2: die EINE Lab-Formel exportiert ABGELEITETE Daten, kein Duplikat).
    //    dp = { seed, nH, epoche?, budget? } → reine, structured-clone-sichere
    //    DATEN: name/region/groesse + slots[] (je Haus: Anker x/z/phi [exakt die
    //    Lab-wrap-Semantik: position.set(x,0,z) + rotation.y=phi], obb, kultur,
    //    seed, rolle, baujahr, ov = der volle Haus-P-Vektor als benannte Daten)
    //    + die BENANNTEN Siedlungs-Schichten (roads/platz/brunnen/mauer/fluss/
    //    laternen/… — dürfen v1 unkonsumiert bleiben, must-ignore). Der Fußab-
    //    druck je Haus kommt aus massBau (der MASS-BUILD, Δext=0-bewiesen) —
    //    exakt der buildDorf-Pfad der Shell. DETERMINISTISCH: DORF/dorfLayout
    //    ziehen aus ihren Seed-LCGs, massBau ist reiner Bau — derselbe dp ⇒
    //    byte-derselbe Export (gate:settlement friert das ein). Unplatzierte
    //    Häuser (die ±9999-Parkplätze des Layouts) reisen NICHT (fail-closed).
    function exportSettlement(dp) {
        dp = dp && typeof dp === "object" ? dp : {};
        var plan = DORF({
            seed: isFinite(dp.seed) ? Number(dp.seed) : 1,
            nH: isFinite(dp.nH) ? Number(dp.nH) : 18,
            epoche: typeof dp.epoche === "string" ? dp.epoche : undefined,
            budget: isFinite(dp.budget) ? Number(dp.budget) : undefined,
        });
        var ext = [];
        var Bs = [];
        var i;
        for (i = 0; i < plan.houses.length; i++) {
            var Bm = massBau(Object.assign({}, plan.houses[i]));
            Bm.p = plan.houses[i]; // brandwand schreibt in die EINE hp-Quelle — ov (unten) liest sie
            Bs.push(Bm);
            ext.push(Bm.ext);
        }
        var lay = dorfLayout(plan, ext, plan.seed);
        // U6c — KONSUM BEIDSEITIG: der Export wendet DIESELBE Snap-/Brandwand-
        // Wahrheit an wie buildDorf (Lab): reihenSnap rückt lay.pl zusammen
        // (Slot-x/z/obb), brandwand markiert hp.brandwand (reist als ov.brandwand).
        reihenSnap(Bs, lay.pl, plan.norm.gap);
        for (i = 0; i < Bs.length; i++) Bs[i].q = lay.pl[i];
        brandwand(
            Bs.filter(function (b) {
                return b.q;
            }),
            plan.norm.gap
        );
        var slots = [];
        for (i = 0; i < plan.houses.length; i++) {
            var q = lay.pl[i];
            if (!q || !q.obb || Math.abs(q.obb.cx) > 5000 || Math.abs(q.obb.cz) > 5000) continue;
            var hp = plan.houses[i];
            slots.push({
                x: q.x,
                z: q.z,
                phi: q.phi,
                obb: { cx: q.obb.cx, cz: q.obb.cz, phi: q.obb.phi, ex: q.obb.ex, ez: q.obb.ez },
                ext: ext[i],
                kultur: typeof hp.kultur === "string" ? hp.kultur : null,
                seed: hp.seed >>> 0,
                rolle: typeof hp.rolle === "string" ? hp.rolle : "wohnhaus",
                baujahr: isFinite(hp.baujahr) ? hp.baujahr | 0 : 0,
                ov: JSON.parse(JSON.stringify(hp)),
            });
        }
        return {
            seed: plan.seed,
            name: plan.name,
            region: plan.region,
            groesse: plan.groesse,
            kernel: plan.kernel,
            jahr: plan.jahr,
            spanne: plan.spanne,
            staedtisch: !!plan.staedtisch,
            spawn: lay.spawn,
            welt: lay.welt,
            slots: slots,
            // Benannte Siedlungs-Schichten (v1 unkonsumiert erlaubt, must-ignore):
            roads: lay.roads,
            feldwege: lay.feldwege,
            platz: lay.platz,
            brunnen: lay.brunnen,
            fences: lay.fences,
            felder: lay.felder,
            staende: lay.staende,
            trees: lay.trees,
            mauer: lay.mauer,
            fluss: lay.fluss,
            bruecken: lay.bruecken,
            laternen: lay.laternen,
            graph: lay.graph,
        };
    }

    // ── Der Namensraum (Vertrag v1.1 §7): Manifest-Blöcke + Bau-Vokabular ──
    root.__fachwerkCore = {
        VERSION: VERSION,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        PORTAL_RENDER_CONFIG: PORTAL_RENDER_CONFIG,
        PRESETS: PRESETS,
        PARAMS_BY_KIND: { haus: PARAMS },
        buildInstance: buildInstance,
        // N5.7 — der Settlement-Export + die Dorf-Quelle (Shell-Aliasse lesen sie)
        exportSettlement: exportSettlement,
        // U6c — die drei gewanderten Lab-Gesetze (buildDorf + exportSettlement rufen sie)
        reihenSnap: reihenSnap,
        brandwand: brandwand,
        metaParams: metaParams,
        DORF: DORF,
        dorfLayout: dorfLayout,
        strassengraph: strassengraph,
        lodPlan: lodPlan,
        PROXYHAUS: PROXYHAUS,
        rotAABB: rotAABB,
        obbR: obbR,
        obbSep: obbSep,
        distPunktOBB: distPunktOBB,
        ORTSNAME: ORTSNAME,
        DORF_NORM: DORF_NORM,
        SIEDLUNG: SIEDLUNG,
        EPOCHEN: EPOCHEN,
        REGION_HIST: REGION_HIST,
        LOD1SKIP: LOD1SKIP,
        // Vertrags-/Paritäts-Fläche (der Gate komponiert die Lab-Pfade selbst)
        LAB_SEED: LAB_SEED,
        hausParams: hausParams,
        massBau: massBau,
        buildStufe: buildStufe,
        geomsZuGruppe: geomsZuGruppe,
        // Die Haus-Fabrik + Kultur-Quellen (die Shell liest DIESE eine Quelle)
        HAUS: HAUS,
        DEFCOL: DEFCOL,
        KULTUR: KULTUR,
        KULTNAMES: KULTNAMES,
        tintM: tintM,
        kulturFromSeed: kulturFromSeed,
        kulturParams: kulturParams,
        // Material-Fläche
        materials: materials,
        mat: mat,
        _MM: _MM,
        _mmFor: _mmFor,
        mLay: mLay,
        texZiegelwand: texZiegelwand,
        texDach: texDach,
        texPutz: texPutz,
        texStein: texStein,
        // Bake-Vokabular (Sonde + Dorf der Shell bauen aus DIESER Quelle)
        KULLVOL: KULLVOL,
        DESTNUR: DESTNUR,
        TURMNUR: TURMNUR,
        MASSNUR: MASSNUR,
        LOD1F: LOD1F,
        NOISEAMP: NOISEAMP,
        _MAPPED: _MAPPED,
        _colFor: _colFor,
        _noise01: _noise01,
        bakeHaus: bakeHaus,
        bakeLOD: bakeLOD,
        wandTonAus: wandTonAus,
        stapelBau: stapelBau,
        bandFassade: bandFassade,
        fpVon: fpVon,
        lod2Koerper: lod2Koerper,
        mischeGeoms: mischeGeoms,
        hofFuer: hofFuer,
        fragFuer: fragFuer,
    };
})(typeof self !== "undefined" ? self : globalThis);
