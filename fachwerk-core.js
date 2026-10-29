// AnazhRealm — fachwerk-core.js: DER HAUS-STUDIO-KERN (Katalysator-Bogen W-A5a, ε-Checkliste).
// Die generative Substanz des Fachwerk-Labors (worlds/fachwerk/index.html — Fachwerkhaus,
// parametrisch, begehbar): die parametrische HAUS-Fabrik (Tragwerk-ehrlich: Fundament ·
// Gerüst · Riegel · Streben · Gefache · Giebel · Dachwerk · Eindeckung · Böden · Innenwände ·
// Herd · Treppe · Türen · Fenster · Möbel · Anbau/Flügel/Balkon · Kuppel/Portikus/Hof/Arkade/
// Turm/Zinnen/Veranda/Vorkragung/Pilotis/Terrasse/Rundbau) · die KULTUR-Archetypen (32
// klickbare Haus-Typen, `kulturParams` = die reine Ableitung) · das Bake-Vokabular der
// Dorf-Pipeline (bakeHaus/bakeLOD · stapelBau · fragFuer · lod2Koerper · fensterFern ·
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
// Distanz-Stufen (LOD_DISTANCES = die Studio-Distanzen d0/d1, 12/26 m) — kindStages.haus = [0,1,2] deklariert die drei,
// die das Lab dafür EHRLICH baut:
//   0 ≙ „Ring A · Promotion":    der promoteBauen-Pfad (Vollbau inkl. Innenleben,
//       RING-A-WÜRDE) → bakeLOD(0) — mit alles=true (LÜCKENLOS: der Host kennt keine
//       lebenden Tür-/Fensterflügel; die Tür-Interaktion ist ein benannter Folge-Anschluss).
//   1 ≙ „Chunk Stufe 1 · nah":   fragFuer(B,1) — die System-Hülle (LOD1F: kein Innenleben)
//       + FENSTER-SCHLAF + INNENDÄMMER-Liner, bakeLOD(0, alles).
//   2 ≙ „Chunk Stufe 2 · Destillat": Warm-Pfad fragFuer(B,1) für den wandTon (exakt die
//       LOD-Sonde), dann fragFuer(B,2) — DESTNUR + KULLVOL + lod2Koerper + fensterFern.
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
//   (d) DAS KARTEN-GESETZ (A6, `_karte`): eine Canvas-Karte des Labors (texZiegelwand/
//       texDach/texPutz/texStein) liegt linear und trägt nur ihr Relief — der Stoff teilt
//       durch ihr lineares Mittel (`_karteEins`, das Gesetz des Blatt-Atlas der Foundry).
//       Die Farbe steht EINMAL: im Vertex (Kultur oder DEFCOL, `_colFor` — im Labor wie
//       im Worker, die Welt liest nur ihn) bzw. in der Toenung des Stoffs (tintM). Durchs
//       Portal reist keine Karte; der Vertrags-Mesh trägt je Rolle den EINEN Stoff.
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
    // ── B2c-Daten (W8, rein additiv): DAS BUDGET je Stufe — was eine gelieferte Haus-Stufe kosten darf
    //    (docs/studio-vertrag.md B2c). tris = die gebaute Hülle über alle 32 Stile × 16 Gestalten (gate:asset-
    //    contract baut jede, die Zeile ist die Ratsche: sie darf nur fallen); band = das Profi-Band-Ziel der
    //    Stufe (Haushalt, artifacts/profiband/wellen-plan.md W1) — offen, solange tris darüber liegt; draws =
    //    Draws je Instanz und Pass nach der Wirts-Regel: das Budget-Gesetz am Studio-Ausgang (phyto-core
    //    budgetErzwingen) faltet die Stoffe darauf, nur innerhalb EINER Seh-Klasse (SEH_DER_ROLLE unten: Glas,
    //    Beschlag-Metall und Herdfeuer bleiben je eigene Stoffe — die Zeile ist das gemessene Minimum über alle 512
    //    Fälle je Stufe: L0 11 (gotisch), L2 3 (volle_moderne: Putz · Glas · Metall); die Farbe reist als
    //    Vertex-Farbe); schatten = die werfende Stufe (L2 wirft nicht). gestalten = wie viele
    //    Individuen (Samen 1..V) die Welt je Stil trägt — das bisherige Wirts-16 gehört dem Gesetzbuch
    //    (gefüllt je Rezept unten bei PRESETS, `GESTALTEN_JE_REZEPT`).
    var GESTALTEN_JE_REZEPT = 16;
    var PORTAL_RENDER_CONFIG = {
        lod: {
            kindStages: { haus: [0, 1, 2, 3], ausstattung: [0, 1, 3], bank: [0, 1, 3], leiter: [0, 1, 3], bruecke: [0, 1, 3] },
            budget: {
                // DAS EINE WURF-GESETZ (S3, E1): jede gezeigte Stufe wirft die Stufe 3 — der grundriss-treue Fernkörper,
                // nurWurf (nie gezeigt, ≤ 96 Dreiecke in EINEM Draw, gate:haus-fern); vorher warf die L0 sich selbst
                // (31 660–101 716 Dreiecke je Kaskade), die L1 ebenso, die L2 gar nicht (der Schatten sprang bei 26 m weg).
                // DAS FENSTER JEDER STUFE (K38, 13.10.): der Schlaf der Fenster würfelt in jeder Stufe gleich — die L0 trägt das
                // schlafende Glas als eigenen Stoff (gotisch 11 → 12); die L2 trägt das Glas der L0 (Stoff + Glas, 2 Befehle), der
                // Glas-Stil dazu seinen Fern-Körper und sein Metall (volle_moderne: Stoff · Metall · Fern-Glas · Glas, 3 → 4); das
                // Fern-Fenster kostet 14–16 Dreiecke (Rahmen-Kasten, Scheibe, Kreuz): L2 tris 7000 → 7250 (marokkanisch/1 7224, 31 Fenster).
                haus: {
                    0: { tris: 132000, band: 40000, draws: 12, schatten: 3 },
                    1: { tris: 44000, band: 10000, draws: 4, schatten: 3 },
                    2: { tris: 7250, band: 2000, draws: 4, schatten: 3 },
                    3: { tris: 96, draws: 1, schatten: 3, nurWurf: true },
                    // fernform (B2c, Pflicht je Budget-Art): jenseits der Mesh-Zone zeichnet der Welt-March die Hülle des
                    // Gesetzbuchs — die Liste der Stufe 3 (`huelle()`, Beipack `__fern`); der Wirts-Fit fiel
                    fernform: "huelle",
                },
                // DIE AUSSTATTUNG (Feuerstelle · Marktstand · Brunnen, unten): die Hülle der gebauten Gestalten (gemessen
                // 05.10.: nah höchstens 3338 Dreiecke — der Brunnen, mittel 595 — die Feuerstelle); je Stufe höchstens zwei
                // Draws — der Stoff und eine Seh-Klasse dazu (die Glut der Feuerstelle · das Wasser des Brunnens); jede
                // Stufe wirft selbst (die Glut nie — der Wirt liest ihre Seh-Klasse).
                // Die L0 wirft selbst (nah, höchstens drei im Bild), die L1 die Stufe 3 (nurWurf: Feuerstelle ≤ 32, Marktstand
                // und Brunnen ≤ 48 Dreiecke) — vorher warf jede L1 sich selbst (die Feuerstelle 440 je Kaskade).
                ausstattung: {
                    0: { tris: 3400, draws: 2, schatten: 0 },
                    1: { tris: 620, draws: 2, schatten: 3 },
                    3: { tris: 48, draws: 1, schatten: 3, nurWurf: true },
                    fernform: "huelle",
                },
                // DIE WERKE DES ZIMMERMANNS (bauen.K5, unten): Bank und Leiter aus gefasten Hölzern, nah mit Holznägeln in den
                // Zapfen (der Nagel faltet ins Holz: ein Draw), die L1 ohne Fase, die Stufe 3 wirft für die L1 (Bank 20, Leiter 30
                // Dreiecke, die Zeile dicht); gemessen am Rand jedes Reglers.
                bank: {
                    0: { tris: 900, draws: 1, schatten: 0 },
                    1: { tris: 240, draws: 1, schatten: 3 },
                    3: { tris: 20, draws: 1, schatten: 3, nurWurf: true },
                    fernform: "huelle",
                },
                leiter: {
                    0: { tris: 900, draws: 1, schatten: 0 },
                    1: { tris: 180, draws: 1, schatten: 3 },
                    3: { tris: 30, draws: 1, schatten: 3, nurWurf: true },
                    fernform: "huelle",
                },
                // DIE BRÜCKE (fahrzeug.K2, das Jochfeld unten): nah die Bohlen mit Fuge, gefaste Träger, Joch mit Kreuz und
                // Geländer mit Leisten und Nägeln (der Nagel faltet ins Holz: ein Draw), die L1 die Bahn als Platte ohne Fase und
                // Leisten, die Stufe 3 wirft für die L1 (18 Dreiecke); gemessen am Rand jedes Reglers: L0 1 416–1 724 (Bohle
                // 0,32–0,20 m), L1 144.
                bruecke: {
                    0: { tris: 1750, draws: 1, schatten: 0 },
                    1: { tris: 150, draws: 1, schatten: 3 },
                    3: { tris: 18, draws: 1, schatten: 3, nurWurf: true },
                    fernform: "huelle",
                },
                gestalten: {},
            },
        },
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
  // DIE RANGFOLGE DES VERZICHTS über der Zeile (P.__sehne, buildInstance streckt höchstens viermal; auf der Zeile bleibt jeder Bau byte-gleich): zuerst das GROSSFORMAT
  // jedes Verbands — Ziegel, Backstein (Gefach und Giebel), Diele und Keilstein werden weniger und größer, dieselbe Fläche, bis 1,6 —, und das Feine fällt (der Holznagel,
  // 3,5 cm); ÜBER dem Großformat trägt das Gefach seine Fläche (die Flächen-Stufe, der Fugen-Ton reist mit); in der fernen Stufe (ohne Ständer) fluchten die Riegel
  const GROSSFORMAT=()=>(P&&P.__sehne>1)?Math.min(1.6,Math.sqrt(P.__sehne)):1, UEBER_GROSSFORMAT=()=>P.__sehne>2.56;
  function eindeckenFlaeche(g,o){ const slope=(o.rY-o.eaveDropY)/o.eZ, th=Math.atan(slope), lift=(o.lift==null?0.08:o.lift), _zg=GROSSFORMAT(), tw=0.26*_zg, tl=0.34*_zg, tt=0.03, cs=0.205*_zg; const ax=o.axis||'z';   // über der Zeile (P.__sehne, buildInstance): das Großformat — weniger, größere Ziegel, dieselbe Fläche
    const _fl2=(typeof P!=='undefined'&&P&&P.flaechig);   // FLÄCHEN-STUFE (Stufe 1): je Reihe EIN Ziegel-Band (Kehl-/Gauben-Lücken bleiben Segmente), keine Lattung darunter
    const _cv=(typeof P!=='undefined'&&P&&P.roofCurve>0)?P.roofCurve:0, _cA=0;   // SCHWUNG global im deform-Feld   // SCHWUNG IM GESETZ: jede Fläche (Haupt/Flügel/Gaube/Balkon) konkav, relativ zur EIGENEN Traufe — keine Liste, nichts vergessen
    const nC=Math.max(4,Math.round(o.eZ/(cs*Math.cos(th)))+1);
    for(let i=0;i<nC;i++){ const dd=o.eZ-i*cs*Math.cos(th); if(dd<-0.06)break; const y=o.rY-slope*dd+(_cA>0?_cA*Math.pow(Math.max(0,dd)/Math.max(0.1,o.eZ),2.2):0), alo=o.zMid+o.sign*dd;   // alo = Position auf der Schräg-Achse (z fürs Hauptdach, x fürs Querdach)
      const rg=o.xRangeAt(y), pa=rg[0], pb=rg[1], span=pb-pa; if(span<0.05)continue; const pc=(pa+pb)/2, ox=(i%2)*tw*0.5, n=Math.ceil(span/tw)+1;   // pa..pb = Quer-Achse
      if(i%2===0&&!_fl2){ const _st=tw*0.5; let _rs=null;   // Lattung als SEGMENTE — spart die Kehle aus (o.skip galt nur fuer Ziegel → Staebe ragten frei ins entziegelte Notch)
        const _fl=(a,bq)=>{ if(bq-a<0.10)return; const _cc=(a+bq)/2, _ll=Math.max(0.1,bq-a-0.05); if(ax==='z')beam(g,_cc,y+lift-0.05,alo,_ll,0.03,0.045,'lattung'); else beam(g,alo,y+lift-0.05,_cc,0.045,0.03,_ll,'lattung'); };
        for(let _p=pa; _p<=pb+1e-6; _p+=_st){ const _sk=o.skip&&o.skip(ax==='z'?_p:alo, ax==='z'?alo:_p); if(!_sk){ if(_rs==null)_rs=_p; } else if(_rs!=null){ _fl(_rs,_p-_st); _rs=null; } }
        if(_rs!=null)_fl(_rs,pb); }   // Lattung
      const _hr=(_HG&&!_fl2)?new Map():null;
      let _rA=null,_rB=null; const _band=()=>{ if(_rA==null)return; const _w=_rB-_rA, _c=(_rA+_rB)/2; if(ax==='z')beam(g,_c,y+lift,alo,_w,tt,tl,'ziegel',[o.sign*th,0,0]); else beam(g,alo,y+lift,_c,tl,tt,_w,'ziegel',[0,0,-o.sign*th]); _rA=null; };
      for(let p=Math.floor((pa-ox-tw/2)/tw)*tw+ox+tw/2; p<pb+tw; p+=tw){ const inner=p-tw*0.46, outer=p+tw*0.46;   // VERBAND-GESETZ: Fugenraster WELTFEST + ox-Halbverband — ein Muster für Haupt UND Flügel (vorher pa-verankert → Fugen fluchteten am Flügel zu Streifen) if(inner>pb-0.02||outer<pa+0.02)continue;
        let ww=tw*0.92, pcc=p; if(o.trim){ const vb=0.05; if(outer>pb-vb){ ww=Math.max(0.05,(pb-vb)-inner); pcc=inner+ww/2; } else if(inner<pa+vb){ ww=Math.max(0.05,outer-(pa+vb)); pcc=outer-ww/2; } }   // 5cm Verge-Inset: Endkante unter dem Windbrett, kein Sägezahn
        if(o.skip && o.skip(ax==='z'?pcc:alo, ax==='z'?alo:pcc)){ if(_fl2)_band(); continue; }                                  // Kehltal-Notch
        if(_fl2){ if(_rA==null)_rA=pcc-ww/2; _rB=pcc+ww/2; continue; }
        if(_hr){ const _f=_hr.get(ww); if(!_f)_hr.set(ww,[pcc,pcc]); else _f[1]=pcc; continue; }   // MASS-HÜLLE: Ziegel gleichen Maßes einer Reihe sind EINE Box, längs verschoben — die Welt-Box ist monoton im Versatz, ihre Enden tragen die Hülle
        if(ax==='z')beam(g,pcc,y+lift,alo,ww,tt,tl,'ziegel',[o.sign*th,0,0]); else beam(g,alo,y+lift,pcc,tl,tt,ww,'ziegel',[0,0,-o.sign*th]); }
      if(_hr){ _hr.forEach((f,ww)=>{ for(const pcc of (f[0]===f[1]?[f[0]]:f)){ if(ax==='z')beam(g,pcc,y+lift,alo,ww,tt,tl,'ziegel',[o.sign*th,0,0]); else beam(g,alo,y+lift,pcc,tl,tt,ww,'ziegel',[0,0,-o.sign*th]); } }); _hr.clear(); }
      if(_fl2)_band(); } }
  // ════ NORM · Wohnbau (SIA 500 / DIN 18065) — öffentliche Mindestwerte, GESETZT, nicht verhandelbar ════
  const NORM={flur:1.00, treppe:0.90, auftritt:0.26, steigung:0.19, steigungSpar:0.21, schritt:0.62, podest:0.90, kopf:2.00, kopfSpar:1.90, eingang:1.30};
  const hasAttic = (ridgeY - eaveY) > NORM.kopfSpar;          // GESETZ: nutzbarer Dachraum nur wenn First ≥1.9 m über Traufe — FRÜH gezogen, denn der Schacht hängt davon ab
  const DORMER = (hasAttic && !modern && P.hip<0.45 && Dp>5.5) ? (()=>{ const gx=clamp(((P.seed%5)-2)*0.5, -W/2+1.5, W/2-1.5), gW=clamp(W*0.16,1.15,1.6), zBack=-Dp*0.22, zFront=zBack-1.0; const yBack=roofSkinY(gx,zBack), baseY2=roofSkinY(gx,zFront)+0.02, frontTop=yBack-0.08; return (frontTop-baseY2>0.85)?{gx,gW,zBack,zFront,yBack,baseY2,frontTop}:null; })() : null;   // EINE Gauben-Quelle: Struktur (dachwerk) UND Dachhaut-Aussparung (dachdeckung) lesen sie
  const stW = NORM.treppe;                                    // Haupttreppe-Breite = Norm
  const mainW = ((levels.length>=2)||(levels.length===1&&hasAttic)) ? stW : 0;   // LINKE Spur: Haupt-/Estrichtreppe — nur wenn nach oben gegangen wird
  const loftW = ((levels.length>=2&&hasAttic)||P.keller||levels.length>=3) ? 0.90 : 0;   // FIX Issue5: RECHTE Spur trägt Speicher- ODER Kellertreppe — Keller koppelt nicht mehr parasitär an den Speicher · SPUR-GESETZ (Welle L): ab drei Geschossen läuft der zweite Lauf (OG→2.OG) auf der RECHTEN Spur — sie hat Breite, auch ohne Speicher und Keller (vorher 0 m: die Treppe ins 2. OG war ein Null-Lauf, 44 von 270 Siedlungs-Häusern)
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
  // FELD-ACHSEN-GESETZ (V18.500): das Feld hängt ohne Biegung nur an (Y,Z) — entlang x ist es konstant, unter der Traufe die Identität. Die Segment-Schrittweite misst darum die (Y,Z)-Länge: gleicher maximaler Sehnenfehler (chinesisch 16,5/3,0 mm, japanisch 10,6/1,8 mm), 40 % weniger Dreiecke
  const defYZ=r=>Math.hypot(r[1],r[2]);
  // BIEGE-ACHSEN-GESETZ (pipeline.K3): die Biegung krümmt nur entlang x — für festes x ist das Feld in (y,z) linear (X=r·sin θ, Z=r·cos θ−R, r=R+z), die Teilung misst die x-Länge Lx; der Schwung darüber misst wie ohne Biegung die (Y,Z)-Länge (gleicher Sehnenfehler, die gerade Strebe entlang z bleibt EIN Segment)
  function defSeg(L,Lyz,min,step,cap,yTop,Lx){ if(P.__sehne>1) step*=P.__sehne; if(DEF_bk>0){ const nb=Lx>min?Math.min(cap,Math.ceil(Lx/step)):1; return (DEF_cv>0&&yTop>eaveY-1e-6&&Lyz>min)?Math.max(nb,Math.min(cap,Math.ceil(Lyz/step))):nb; } if(yTop<=eaveY-1e-6) return 1; return Lyz>min?Math.min(cap,Math.ceil(Lyz/step)):1; }
  function rotE(vx,vy,vz,rx,ry,rz){ const a=Math.cos(rx),b=Math.sin(rx),c=Math.cos(ry),d=Math.sin(ry),e=Math.cos(rz),f=Math.sin(rz);
    return [ c*e*vx-c*f*vy+d*vz, (a*f+b*e*d)*vx+(a*e-b*f*d)*vy-b*c*vz, (b*f-a*e*d)*vx+(b*e+a*f*d)*vy+a*c*vz ]; }
  // ════ EINHEITLICHES PRIMITIV · jeder Eckpunkt durch deform — die Box biegt wie der Ziegel, kein Sonderfall ════
  // ════ DIE MASS-HÜLLE (`__nurMass`, nur massBau): der Mass-Bau zählt nur seine Box (Box3.setFromObject = Vereinigung der Geometrie-Boxen unter der Welt-Matrix) — ungebogen teilt jede Box gleichen Maßes EINE Geometrie (gleiche Float32-Ecken ⇒ dieselbe Box), ohne Tint; die Ziegelreihe legt je Maß nur ihre Enden (eindeckenFlaeche). Der Export bleibt byte-gleich (gate:settlement), der Mass-Bau fällt ~6× ════
  const _HG=(P.__nurMass&&DEF_bk===0&&DEF_cv===0)?new Map():null;
  function _hgBox(lx,ly,lz){ let a=_HG.get(lx); if(!a)_HG.set(lx,a=new Map()); let b=a.get(ly); if(!b)a.set(ly,b=new Map()); let q=b.get(lz); if(!q)b.set(lz,q=new THREE.BoxGeometry(lx,ly,lz)); return q; }
  const _BF=[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,7,3],[0,4,7],[1,2,6],[1,6,5],[0,1,5],[0,5,4],[3,7,6],[3,6,2]];
  function beam(g,cx,cy,cz,lx,ly,lz,role,rot){ const rx=(rot&&rot[0])||0, ry=(rot&&rot[1])||0, rz=(rot&&rot[2])||0;
    if((DEF_bk===0 && DEF_cv===0)||(g&&g.noDeform)){ const m=new THREE.Mesh(_HG?_hgBox(lx,ly,lz):new THREE.BoxGeometry(lx,ly,lz),mat(role)); m.position.set(cx,cy,cz); if(rx||ry||rz)m.rotation.set(rx,ry,rz); m.castShadow=!NOSHADOW[role]; m.receiveShadow=true; g.add(m); return _HG?m:tintWood(m,role,cx,cy,cz); }
    const hx=lx/2,hy=ly/2,hz=lz/2, useX=lx>=lz, Ln=useX?lx:lz, N=defSeg(Ln, Ln*defYZ(rotE(useX?1:0,0,useX?0:1,rx,ry,rz)), 0.9, 0.4, 32, cy+Math.abs(rotE(1,0,0,rx,ry,rz)[1])*hx+Math.abs(rotE(0,1,0,rx,ry,rz)[1])*hy+Math.abs(rotE(0,0,1,rx,ry,rz)[1])*hz, Ln*Math.abs(rotE(useX?1:0,0,useX?0:1,rx,ry,rz)[0])), P=[];
    const wc=(x,y,z)=>{ const r=rotE(x,y,z,rx,ry,rz); return deform(cx+r[0],cy+r[1],cz+r[2]); };
    for(let i=0;i<N;i++){ let c; if(useX){ const a=-hx+i*lx/N, q=-hx+(i+1)*lx/N; c=[wc(a,-hy,-hz),wc(q,-hy,-hz),wc(q,hy,-hz),wc(a,hy,-hz),wc(a,-hy,hz),wc(q,-hy,hz),wc(q,hy,hz),wc(a,hy,hz)]; } else { const a=-hz+i*lz/N, q=-hz+(i+1)*lz/N; c=[wc(-hx,-hy,a),wc(hx,-hy,a),wc(hx,hy,a),wc(-hx,hy,a),wc(-hx,-hy,q),wc(hx,-hy,q),wc(hx,hy,q),wc(-hx,hy,q)]; }
      for(let k=0;k<12;k++){ const A=c[_BF[k][0]],B=c[_BF[k][1]],C=c[_BF[k][2]]; P.push(A[0],A[1],A[2],B[0],B[1],B[2],C[0],C[1],C[2]); } }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,mat(role)); m.castShadow=!NOSHADOW[role]; m.receiveShadow=true; g.add(m); return tintWood(m,role,cx,cy,cz); }
  const Vc=(x,y,z)=>new THREE.Vector3(x,y,z);
  function strut(g,x0,y0,z0,x1,y1,z1,th,role){ const dx=x1-x0,dy=y1-y0,dz=z1-z0, len=Math.hypot(dx,dy,dz); if(len<1e-4)return;
    if((DEF_bk===0 && DEF_cv===0)||(g&&g.noDeform)){ const a=Vc(x0,y0,z0),b=Vc(x1,y1,z1); const m=new THREE.Mesh(_HG?_hgBox(th,len,th):new THREE.BoxGeometry(th,len,th),mat(role)); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(Vc(0,1,0),b.clone().sub(a).normalize()); m.castShadow=!NOSHADOW[role]; m.receiveShadow=true; g.add(m); return _HG?m:tintWood(m,role,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2); }
    const N=defSeg(len, Math.hypot(dy,dz), 0, 0.4, 32, Math.max(y0,y1)+th, Math.abs(dx)), h=th/2, P=[], ux=dx/len,uy=dy/len,uz=dz/len;
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
    const n=defSeg(em, Math.max(Math.hypot(b[1]-a[1],b[2]-a[2]),Math.hypot(c[1]-a[1],c[2]-a[2]),Math.hypot(c[1]-b[1],c[2]-b[2])), 0.9, 0.45, 16, Math.max(a[1],b[1],c[1]), Math.max(Math.abs(b[0]-a[0]),Math.abs(c[0]-a[0]),Math.abs(c[0]-b[0]))), P=[];   // FLÄCHE unterteilt → jeder Punkt durch deform, folgt dem Bogen wie der Frame
    const pt=(i,j)=>{ const u=i/n, v=j/n; return deform(a[0]+(b[0]-a[0])*u+(c[0]-a[0])*v, a[1]+(b[1]-a[1])*u+(c[1]-a[1])*v, a[2]+(b[2]-a[2])*u+(c[2]-a[2])*v); };
    for(let i=0;i<n;i++)for(let j=0;j<n-i;j++){ const A=pt(i,j),B=pt(i+1,j),C=pt(i,j+1); P.push(A[0],A[1],A[2],B[0],B[1],B[2],C[0],C[1],C[2]); if(i+j<n-1){ const D=pt(i+1,j+1); P.push(B[0],B[1],B[2],D[0],D[1],D[2],C[0],C[1],C[2]); } }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.computeVertexNormals(); const m=new THREE.Mesh(geo,mat(role)); m.castShadow=m.receiveShadow=true; g.add(m); return tintWood(m,role,(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3); }
  function poly(g,pts,role){for(let i=1;i<pts.length-1;i++)tri(g,pts[0],pts[i],pts[i+1],role);}

  const solids=[]; const furniture=[]; let chimney=null;
  const masse=[];                                                                                       // DIE MASSEN DES BAUS (S3, additiv): je Teil des Grundrisses sein Körper — Rechteck, Höhen, Dach. Der Fernkörper des Gesetzbuchs (koerperListe) liest sie; kein Bau liest sie zurück
  function addMasse(m){ if(Number.isFinite(m.x0)){ m.x0+=SHIFT; m.x1+=SHIFT; } masse.push(m); return m; }   // die 2. Einheit des Doppelhauses um +W wie ihre Solids
  // ════ WELTMODELL · geteilte Quelle: Öffnungen · Erschließung · Kraftfluss ════
  const circR=[];
  function addSolid(cx,cy,cz,lx,ly,lz,tag){solids.push({min:[cx+SHIFT-lx/2,cy-ly/2,cz-lz/2],max:[cx+SHIFT+lx/2,cy+ly/2,cz+lz/2],tag});}
  // ════ GESETZ (geteilt über ALLE Außentüren): jede Tür mit Schwelle auf einer Sockelhöhe bekommt EINE Eingangstreppe — Stufenzahl + Höhe FOLGEN dem Sockel, Richtung = Außennormale (nx,nz). EINE Quelle für Haus-/Hinter-/Flügeltür/Garage. Sockel auf Grund → 0 Stufen (Garage). ════
  function aussentreppe(g, cx, cz, nx, nz, wDoor, baseH){ const h=(baseH==null?baseY:baseH); if(h<0.10)return;
    const n=Math.max(1,Math.round((h+0.02)/0.19)), sh=h/n, tr=0.30, w=wDoor+0.7;
    { const L=n*tr, ax=Math.abs(nx)>0.5; addMasse({art:'treppe',x0:ax?Math.min(cx,cx+nx*L):cx-w/2,x1:ax?Math.max(cx,cx+nx*L):cx+w/2,z0:ax?cz-w/2:Math.min(cz,cz+nz*L),z1:ax?cz+w/2:Math.max(cz,cz+nz*L),y0:0,y1:h,first:ax?(nx>0?'-x':'+x'):(nz>0?'-z':'+z')}); }   // die Treppe als Keil (hoch an der Tür)
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
  const KNIESTOCK = Math.abs(zBandTop)>0.6 && Math.abs(zBandTop)<(Dp/2-0.08)-0.3;                               // steht dort der Kniestock (die Drempelwand des Estrichs, boeden), oder liegt der Stehraum bis an die Wand
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
  if(hasLoft){ const i=levels.length-1, tr=(i%2===0)?'L':'R'; let dir=(i%2===0)?1:-1;          // Speicherlauf top→Dachboden (Raumspar)
    const austritt=(d)=>Math.abs(((d>0)?stZ0:wz1)+d*(lRun+(KNIESTOCK?NORM.podest:0.3)));                    // KOPFRAUM-GESETZ (Welle L): der Speicherlauf mündet im STEHRAUM (|z| ≤ zBandTop: Dach ≥ kopfSpar über dem Estrich) — vor dem Kniestock MIT seinem Austritt-Podest (NORM.podest, wie die Haupttreppe), ohne ihn 0,3 m Kopfraum — trüge die Kehre ihn unter die Schräge, läuft er vom anderen Schacht-Ende zum First (vorher bei drei Geschossen Kopfraum 1,2 m am Austritt: der Kopf stak im Dach; bis siedlung-k5-nah reichten 0,3 m: der Körper stand am Kniestock)
    if(austritt(dir)>zBandTop && austritt(-dir)<=zBandTop) dir=-dir;
    if(austritt(dir)<=zBandTop){                                                             // KEIN SPEICHERLAUF OHNE STEHRAUM AM AUSTRITT: trägt keine Richtung ihn samt Podest in den Stehraum, bleibt der Estrich geschlossen wie unter dem flachen Dach (bis siedlung-k5-nah endete er 0,46 m vor dem Kniestock: kein Körper kam vom Lauf)
    const zFoot=(dir>0)?stZ0:wz1, zTop=zFoot+dir*lRun, z0=Math.min(zFoot,zTop), z1=Math.max(zFoot,zTop);
    LOFT={x0:TRACK[tr][0],x1:TRACK[tr][1],z0,z1,xc:(TRACK[tr][0]+TRACK[tr][1])/2,base:levels[i].y,top:eaveY,N:lN,rise:lRise,go:lGo,dir,zFoot};
    flights.push({base:levels[i].y, tr, x0:TRACK[tr][0], x1:TRACK[tr][1], zFoot, dir, N:lN, rise:lRise, go:lGo, isLoft:true, atLevel:'attic', topEdge:(dir>0)?'back':'front', footEdge:(dir>0)?'front':'back'});
    addCircR(LOFT.x0-0.1, LOFT.z0-0.1, LOFT.x1+0.1, LOFT.z1+0.3, i, 'speichertreppe'); } }
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
    addMasse({art:'sockel',x0:-(W+0.5)/2,x1:(W+0.5)/2,z0:-(Dp+0.5)/2,z1:(Dp+0.5)/2,y0:baseY-P.foundH,y1:baseY});   // die Fundamentplatte steht 25 cm vor der Wand
    wings.forEach(w=>{ const m=0.25, fx0=w.x0-m, fx1=w.x1+m, fz0=w.z0-m, fz1=w.z1+m, cx=(fx0+fx1)/2, cz=(fz0+fz1)/2;   // GESETZ (selbe foundH/Material wie das Haus): jeder Flügel WÄCHST aus dem Sockel — kein aufgesetzter Klotz, kein Schweben über der Grasnarbe. Der Sockel verdeckt zugleich die Wiese unter dem Flügel.
      beam(g,cx,baseY-P.foundH/2,cz, fx1-fx0,P.foundH,fz1-fz0,'stein'); addSolid(cx,baseY-P.foundH/2,cz, fx1-fx0,P.foundH,fz1-fz0);
      addMasse({art:'sockel',x0:fx0,x1:fx1,z0:fz0,z1:fz1,y0:baseY-P.foundH,y1:baseY});
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
      if(!P.flaechig) layJoists(L.top); });                                  // levels[last].top == eaveY → Dachbalkenlage inklusive, keine Doppellage · FLÄCHEN-STUFE: die Balkenlage schläft im Innern, der Ständer-/Rähm-Ring bleibt die Fassade
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
  // DOPPELHAUS-INNEN: die geteilte Seite (Einheit A an +x, Einheit B unter SHIFT an −x) liegt in der EINEN Brandwand — ihre Fassade (Gefach, Riegel, Streben, Nägel, Fenster, Giebel) sieht kein Auge, der Bau legt sie nicht an
  const BRANDSEITE=x=>!!P.doppel&&(SHIFT?x<0:x>0), INNEN=w=>!w.horiz&&BRANDSEITE(w.fixed);
  const FERNFENSTER=[];   // DIE FERNE STUFE (Marke nur.fern: L2 und die Turm-L1 zeichnen den Körper der Liste und das Fern-Fenster): die Öffnungen der Teilbauten (Turm, Hof), die dort ihr Fern-Fenster tragen — `s` ist ihre Außenseite
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
    const _zg=GROSSFORMAT(), bw=0.32*_zg,bh=0.15*_zg,m=0.025,bt=0.085; const nr=Math.max(1,Math.round(yl/bh)),rh=yl/nr;       // Backstein-Ausfachung, versetzte Lagen (über der Zeile im Großformat)
    if(P.flaechig||UEBER_GROSSFORMAT()){ let _ab=0; for(let r=0;r<nr;r++){ const ox=(r%2)*bw*0.5; for(let bx0=Math.floor((a0-ox)/bw)*bw+ox; bx0<a1-0.02; bx0+=bw){ const w=Math.min(a1,bx0+bw)-Math.max(a0,bx0)-m; if(w>=0.05)_ab+=w*(rh-m); } }   // FLÄCHEN-STUFE (Stufe 1): das Gefach als EINE Backstein-Fläche; der Stein-Anteil des Verbands reist mit (__fuge), damit der kartenlose Bake den Fugen-Ton mischt
      const _s=horiz?beam(g,ac,yc,fixed,al,yl,bt,'backstein'):beam(g,fixed,yc,ac,bt,yl,al,'backstein'); _s.userData.__fuge={mat:mat('lehm'),anteil:_ab/(al*yl)}; return; }
    if(horiz)beam(g,ac,yc,fixed,al,yl,0.06,'lehm'); else beam(g,fixed,yc,ac,0.06,yl,al,'lehm');   // zurückgesetzte Hinterfüllung (Holz steht vor)
    for(let r=0;r<nr;r++){ const by=y0+(r+0.5)*rh, ox=(r%2)*bw*0.5;
      for(let bx0=Math.floor((a0-ox)/bw)*bw+ox; bx0<a1-0.02; bx0+=bw){ const cl=Math.max(a0,bx0), cr=Math.min(a1,bx0+bw), w=cr-cl-m; if(w<0.05)continue; const cc=(cl+cr)/2;   // FIX: Backstein auf GLOBALES Raster (Ursprung 0) statt Feldkante a0 → Wandfelder UND Giebel teilen EIN Raster, Stossfugen fluchten durchgehend
        if(horiz)beam(g,cc,by,fixed,w,rh-m,bt,'backstein'); else beam(g,fixed,by,cc,bt,rh-m,w,'backstein'); } } }

  function riegel(){const g=grp(); if(ROUND)return g; if(modern) return g;                                                 // STIL modern: keine Riegel → glatte Putzwand
    const _flucht=!!(P.nur&&P.nur.fern&&P.__sehne>1), _fl=new Map();   // FLUCHT (die ferne Stufe über der Zeile trägt keine Ständer, DESTNUR): die fluchtenden Riegel einer Wand sind EIN Balken über die Ständer-Lücken
    const rail=(lo,hi,y,f,h)=>{const c=(lo+hi)/2,l=hi-lo; if(l<0.05)return; if(_flucht){ const k=(h?1:0)+'|'+f+'|'+y; if(!_fl.has(k))_fl.set(k,[]); _fl.get(k).push([lo,hi]); return; } if(h)beam(g,c,y,f,l,0.1,0.13,'holz'); else beam(g,f,y,c,0.13,0.1,l,'holz');};
    const postV=(a,y0,y1,f,h)=>{const yc=(y0+y1)/2,yl=y1-y0; if(yl<0.05)return; if(h)beam(g,a,yc,f,0.1,yl,0.13,'holz'); else beam(g,f,yc,a,0.13,yl,0.1,'holz');};
    WALLS.forEach(w=>{ if(w.type==='door'||w.type==='door2'||w.type==='balkdoor'||w.type==='wingdoor'||INNEN(w))return;          // alle Türöffnungen frei: keine Riegel quer
      rail(w.lo,w.hi,w.sillY,w.fixed,w.horiz); rail(w.lo,w.hi,w.lintelY,w.fixed,w.horiz);          // Brüstungs- + Sturzriegel (fluchtendes Band)
      if(w.type==='window'){ const wd=winW(w); postV(w.c-wd/2,w.sillY,w.lintelY,w.fixed,w.horiz); postV(w.c+wd/2,w.sillY,w.lintelY,w.fixed,w.horiz); } });
    _fl.forEach((iv,k)=>{ const q=k.split('|'), h=q[0]==='1', f=+q[1], y=+q[2]; iv.sort((a,b)=>a[0]-b[0]); let a=iv[0][0], b=iv[0][1];   // die Lücke eines Ständers (2·ps) schließt der Balken
      for(let i=1;i<=iv.length;i++){ const n=iv[i]; if(n&&n[0]<=b+2*ps+0.01){ b=Math.max(b,n[1]); continue; } const c=(a+b)/2,l=b-a; if(h)beam(g,c,y,f,l,0.1,0.13,'holz'); else beam(g,f,y,c,0.13,0.1,l,'holz'); if(n){ a=n[0]; b=n[1]; } } });
    return g; }

  function streben(){const g=grp(); if(ROUND)return g; if(modern) return g;                                                // STIL modern: keine Streben → glatte Putzwand (kein Fachwerk-Relief)
    const seg=(fixed,horiz,x0,y0,x1,y1,no)=>{ const f=fixed+(no||0); if(horiz)strut(g,x0,y0,f,x1,y1,f,0.1,'holz'); else strut(g,f,y0,x0,f,y1,x1,0.1,'holz'); };
    const motif=(a0,a1,y0,y1,fixed,horiz)=>{ const cx=(a0+a1)/2,cy=(y0+y1)/2;                       // Strebenfigur in EINEM Feld (Brüstung)
      if(P.brace==='andreas'){ seg(fixed,horiz,a0,y0,a1,y1,+0.022); seg(fixed,horiz,a1,y0,a0,y1,-0.022); }
      else if(P.brace==='k'){ seg(fixed,horiz,cx,y0,a0,y1); seg(fixed,horiz,cx,y0,a1,y1); }
      else if(P.brace==='mann'){ seg(fixed,horiz,cx,y0,cx,y1,-0.02); seg(fixed,horiz,a0,y0,cx,cy,+0.022); seg(fixed,horiz,a1,y0,cx,cy,+0.022); }
      else { seg(fixed,horiz,a0,y0,a1,y1,+0.022); seg(fixed,horiz,a1,y0,a0,y1,-0.022); } };
    const corner=(w)=>{ const a0=w.lo-ps,a1=w.hi+ps, oc=w.corner==='lo'?a0:a1, ic=w.corner==='lo'?a1:a0, H=w.yHi-w.yLo;  // Fuß- + Kopfband am Eckständer
      seg(w.fixed,w.horiz, oc,w.yLo, ic,w.yLo+H*0.5, +0.022); seg(w.fixed,w.horiz, oc,w.yHi, ic,w.yHi-H*0.5, -0.022); };
    WALLS.forEach(w=>{ if(w.type==='door'||w.type==='door2'||w.type==='balkdoor'||w.type==='wingdoor'||INNEN(w))return;          // alle Türöffnungen frei: kein Brüstungsmotiv quer
      motif(w.lo-ps,w.hi+ps, w.yLo, w.sillY, w.fixed, w.horiz);                                      // Brüstungsmotiv (durchgehendes Band, fluchtet)
      if(w.type==='corner') corner(w); });                                                            // + Eckstreben
    return g; }

  function gefache(){const g=grp(); if(ROUND)return g;
    WALLS.forEach(w=>{ if(w.type==='door'||INNEN(w)){ return; }                       // Türfeld bleibt offen (Haustür+Oberlicht baut tueren())
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
    [1,-1].forEach(sx=>{ if(BRANDSEITE(sx)){ rnd(); return; }   // DOPPELHAUS-INNEN: der Giebel an der Brandwand liegt im gemeinsamen Dach (sein Würfel fällt wie gebaut — der Strom der Einheit bleibt)
      const gw = wings.some(w=>(sx>0?w.side==='E':w.side==='W')) ? null : gableWin;       // Giebel trägt einen Flügel davor → KEIN Estrichfenster dort (nur auf der Seite, wo wirklich ein E/W-Flügel steht)
      const xf=sx*(W/2-0.02), apexY=hipStartY, half=gzTop;
      beam(g,xf,eaveY-P.raehm/2,0,0.12,P.raehm,Dp-0.04,'holz');                                          // Schwellrähm
      const gbrick=rnd()>0.5, _zg=GROSSFORMAT(), bw=0.32*_zg,bh=0.15*_zg,m=0.025,bt=0.075;
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
          if(P.flaechig&&_zg>1){ const band=(a,b)=>{ if(b-a<0.06)return; beam(g,xf,by,(a+b)/2,bt,rh-m,b-a,'backstein').userData.__fuge={mat:mat('lehm'),anteil:(bw-m)/bw}; };   // FLÄCHEN-STUFE über der Zeile: der Giebel trägt je Lage EIN Band (die Stoßfugen reisen als Fugen-Ton), die Öffnung bleibt frei
            if(gw && by+rh/2>gw.y0-0.05 && by-rh/2<gw.y1+0.05){ band(-zh,Math.min(zh,gw.z0-0.05)); band(Math.max(-zh,gw.z1+0.05),zh); } else band(-zh,zh); continue; }
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
        if(P.flaechig&&P.__sehne>1){ if(zw>0.02) beam(g,x,y+lift,0,tl+0.07,tt,2*zw+tw*0.97,'ziegel',[0,0,-sx*th]); continue; }   // FLÄCHEN-STUFE über der Zeile: auch der Walm trägt je Reihe EIN Band
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
    const rect=(y,x0,x1,z0,z1,role,sol)=>{ if(x1-x0<0.08||z1-z0<0.08)return; const w=x1-x0,d=z1-z0,nb=P.flaechig?1:Math.max(1,Math.round(d/(0.28*GROSSFORMAT()))),cx=(x0+x1)/2;   // FLÄCHEN-STUFE: der Boden als EINE Platte — seine Kante schließt den Geschoss-Schlitz der Fassade
      for(let i=0;i<nb;i++){const z=z0+(i+0.5)*d/nb; beam(g,cx,y,z,w,0.06,d/nb*0.98,role);} if(sol!==false)addSolid(cx,y,(z0+z1)/2,w,0.12,d); };
    const railSeg=(x0,z0,x1,z1,hcx,hcz)=>{ if(P.flaechig)return; const hh=0.95,dx=x1-x0,dz=z1-z0,len=Math.hypot(dx,dz),h=Math.abs(dx)>=Math.abs(dz),cx=(x0+x1)/2,cz=(z0+z1)/2;
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
    else if(!LOFT){ rect(eaveY-0.05,-Wi,Wi,-Di,Di,'boden'); }                                          // ≥2 Geschosse ohne Speicherlauf (flaches Dach oder kein Stehraum am Austritt): geschlossene Estrich-Decke, kein Speicherloch/Kniestock
    else { levelTop=eaveY; const L=LOFT;                                     // Estrich voll minus Loch der Speichertreppe (LOFT)
      rect(eaveY-0.05,-Wi,L.x0,-Di,Di,'boden'); rect(eaveY-0.05,L.x1,Wi,-Di,Di,'boden');
      rect(eaveY-0.05,L.x0,L.x1,-Di,L.z0,'boden'); rect(eaveY-0.05,L.x0,L.x1,L.z1,Di,'boden');
      const hclx=(L.x0+L.x1)/2,hclz=(L.z0+L.z1)/2,zR=(L.dir>0)?L.z0:L.z1; railSeg(L.x0,zR,L.x1,zR,hclx,hclz); railSeg(L.x0,L.z0,L.x0,L.z1,undefined,hclz); railSeg(L.x1,L.z0,L.x1,L.z1,undefined,hclz);   // BRÜSTUNG NUR WO KEIN LAUF AUSTRITT (wie floorWithStair): der Speicherlauf mündet in seiner Laufrichtung (dir > 0 an z1) — bis siedlung-k5-nah stand die Brüstung immer an z1 und schloss jeden Lauf nach +z
      // ── KNIESTOCK (Drempelwand) bei ±zBandTop: Barriere zum niedrigen Traufkopfraum → Spieler bleibt im Stehraum ≥1.9 m (schliesst den Trauf-Anstoss); Lücke an der Speichertreppenspur ──
      [-zBandTop,zBandTop].forEach(zc=>{ if(!KNIESTOCK)return; const kH=1.15,y0=eaveY,yc=y0+kH/2, crosses=(zc>L.z0-0.3&&zc<L.z1+0.3);
        (crosses?[[-Wi,L.x0-0.1],[L.x1+0.1,Wi]]:[[-Wi,Wi]]).forEach(([x0,x1])=>{ if(x1-x0<0.3)return; const xc=(x0+x1)/2,len=x1-x0;
          beam(g,xc,y0+0.05,zc,len,0.08,0.12,'holz'); beam(g,xc,y0+kH,zc,len,0.10,0.12,'holz'); beam(g,xc,yc,zc,len,kH-0.22,0.06,'lehm');
          for(let x=x0+0.12;x<=x1-0.1;x+=1.0)beam(g,x,yc,zc,0.10,kH,0.10,'holz'); addSolid(xc,yc,zc,len,kH,0.14,'kniestock'); }); }); }   // 3-seitig; Seiten-Brüstung OHNE Innenversatz → der Austritt in Laufrichtung bleibt frei für Körper
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
    if(!P.flaechig){   // FLÄCHEN-STUFE (Stufe 1): der Feuerraum schläft im Innern — es bleibt der Schornstein über Dach
    beam(g,hx,baseY+bH/2,hz,bD,bH,bW,'stein'); addSolid(hx,baseY+bH/2,hz,bD,bH,bW);
    [-1,1].forEach(s5=>beam(g,fO-nx*0.10,baseY+0.40,hz+s5*(bW/2-0.14),0.20,0.80,0.24,'stein'));
    beam(g,fO-nx*0.10,baseY+0.86,hz,0.20,0.16,bW-0.20,'stein');
    beam(g,fO-nx*0.05,baseY+0.42,hz,0.10,0.66,bW-0.62,'dunkel'); beam(g,fO-nx*0.16,baseY+0.14,hz,0.30,0.22,0.7,'feuer');
    beam(g,hx+nx*0.10,baseY+bH+0.05,hz,bD+0.26,0.10,bW+0.30,'holz');
    beam(g,hx,baseY+bH+0.45,hz,bD*0.78,0.80,bW*0.72,'stein'); beam(g,hx,baseY+bH+1.05,hz,bD*0.62,0.55,bW*0.5,'stein'); }
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
    beam(g,0,baseY+doorH+0.05,-Dp/2,doorW+0.36,0.16,0.26,'holz'); if(P.bogenTyp&&P.bogenTyp!=='none')bogenRahmen(g,0,baseY+doorH+0.13,-Dp/2,doorW*0.62,true,P.bogenTyp,'holz',{art:'tuer',cap:roofUnderY(0,-Dp/2)});                                                          // Sturz
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
      L.userData={door:true,preOpen:(!P.doorClosed),openA:-sgn*openA,block:sgn<0?[-doorW/2,baseY,-Dp/2-0.1,0,baseY+doorH,-Dp/2+0.1]:[0,baseY,-Dp/2-0.1,doorW/2,baseY+doorH,-Dp/2+0.1],side:sgn,offen:(P.doorClosed?0:-sgn*openA)}; g.add(L); });   // DORF-ERLEBNIS: side+offen = die Flügel-DATEN für den Welt-Pfad (buildStufe separiert, __extractAssetMesh reicht sie als out.tuer — exakt das porta-Muster)
    beam(g,0,baseY-0.02,-Dp/2+0.04,doorW+0.2,0.06,0.32,'stein');                                                            // Schwelle
    if(!P.veranda&&!P.portikus)aussentreppe(g,0,-Dp/2,0,-1,doorW);                                                                                     // Haustür-Treppe (vorne) — geteiltes Gesetz
    if(backDoor){ const bw2=Math.min(1.0,backDoor.hi-backDoor.lo-0.2), bcx=backDoor.cx, blh=doorH-0.12, bcy=baseY+blh/2, bz=Dp/2-0.07;  // Hintertür
      beam(g,bcx-bw2/2-0.06,bcy,Dp/2,0.13,doorH+0.06,0.24,'holz'); beam(g,bcx+bw2/2+0.06,bcy,Dp/2,0.13,doorH+0.06,0.24,'holz');     // Stock
      beam(g,bcx,baseY+doorH+0.0,Dp/2,bw2+0.32,0.14,0.24,'holz');                                                                  // Sturz
      const L=grp(); const inner=leafFrame(bw2-0.04,blh,'holz',+1); inner.position.x=(bw2-0.04)/2; L.add(inner);   // Schauseite +z = aussen (Rückseite Haus)
      beam(L,bw2-0.18,0,0.07,0.05,0.05,0.06,'metall'); beam(L,bw2-0.18,blh*0.10,-0.05,0.04,0.26,0.045,'metall');   // aussen Knauf bündig am Blatt (+z) · innen Drücker (−z) — kein schwebender Würfel mehr
      L.position.set(...deform(bcx-(bw2-0.04)/2,bcy,bz)); L.rotation.y=(P.doorClosed?0:-openB)+(DEF_bk>0?(bcx-(bw2-0.04)/2)*DEF_bk:0);
      L.userData={door:true,preOpen:(!P.doorClosed),openA:-openB,block:[bcx-bw2/2,baseY,Dp/2-0.1,bcx+bw2/2,baseY+doorH,Dp/2+0.1],side:1,offen:(P.doorClosed?0:-openB)}; g.add(L);   // DORF-ERLEBNIS: Hintertür-Flügel-DATEN (ein Blatt, Hinge an der Bandseite)
      beam(g,bcx,baseY-0.02,Dp/2-0.04,bw2+0.2,0.06,0.3,'stein');                                                                   // Schwelle
      aussentreppe(g,bcx,Dp/2,0,1,bw2); }                                                                                          // Hintertür-Treppe — GLEICHES Gesetz wie vorne
    addCircR(-doorW/2-0.1,-Dp/2+0.05,doorW/2+0.1,-Dp/2+1.05,0,'haustür');                                                          // Haustür-Schwung (Flur)
    if(backDoor) addCircR(backDoor.cx-0.55,Dp/2-1.05,backDoor.cx+0.55,Dp/2-0.05,0,'hintertür');                                     // Hintertür-Schwung
    return g; }

  function windowSash(w,h,horiz,role,glasRolle){ const sg=grp(); const sw=0.06,t=0.05, gl=glasRolle||'glas';   // gl: das Glas des Fensters — wach oder schlafend (fensterSchlaeft, EIN Würfel für jede Stufe)
    if(horiz){ beam(sg,-w/2+sw/2,0,0,sw,h,t,role); beam(sg,w/2-sw/2,0,0,sw,h,t,role);
      beam(sg,0,h/2-sw/2,0,w,sw,t,role); beam(sg,0,-h/2+sw/2,0,w,sw,t,role);
      beam(sg,0,0,0,0.04,h,0.045,role); beam(sg,0,0,0,w,0.04,0.045,role); beam(sg,0,0,-0.012,w-2*sw,h-2*sw,0.025,gl);
    } else { beam(sg,0,0,-w/2+sw/2,t,h,sw,role); beam(sg,0,0,w/2-sw/2,t,h,sw,role);
      beam(sg,0,h/2-sw/2,0,t,sw,w,role); beam(sg,0,-h/2+sw/2,0,t,sw,w,role);
      beam(sg,0,0,0,0.045,h,0.04,role); beam(sg,0,0,0,0.045,0.04,w,role); beam(sg,-0.012,0,0,0.025,h-2*sw,w-2*sw,gl); }
    return sg; }
  // ════ DAS BOGEN-GESETZ (K66): Keilsteine im VERBAND — jede Stoßfuge radial zur Mitte ihrer Kurve, jeder Stein ein Keil zwischen zwei Fugen
  //    (gleiche Bogenlänge, N ungerade: der Schlussstein im Scheitel, 2 cm vorstehend), die Kämpfersteine mit ihrem Lager auf dem Kämpfer
  //    (Höhe yS); die Kurve rund · spitz (zwei Mittelpunkte ±spitzE·R) · hufeisen (Mitte R·tan α über dem Kämpfer, darunter der Kämpferstein)
  //    · stich (Segment mit dem Stich o.stich). Bis K66 lagen zehn gleiche Kästen AUF der Kurve, gedreht um a − π/2 statt π/2 − a (in jeder
  //    Wand längs x um bis zu 90° verdreht), ab R ≈ 0,9 m mit Lücken, die Kämpfersteine halb in der Öffnung, und kein Deckel prüfte den
  //    Scheitel (gate:fachwerk-contract BOGEN-VERBAND: 821 von 821 Bögen rot). o: { t die Bogenstärke, tiefe, versatz (die Lage in der
  //    Wandtiefe; Öffnungen 0,14 nach außen), cap (die Unterkante des Dachs darüber: reicht der Scheitel samt Stärke darüber, entsteht der
  //    Bogen nicht), stich, zwickel [uL, uR, vTop] (die Mauer über dem Bogen bis vTop, seitlich bis uL/uR — die Laube), art, pfeiler }.
  //    Rückgabe: die Marke des Bogens oder null. Jeder Keilstein trägt die Marke `keil`, jede Mauer `zwickel` (die Linse liest sie).
  function bogenSteig(kurve,R,f){ const BG=BOGEN_GESETZ; return kurve==='spitz'?R*Math.sqrt(1+2*BG.spitzE) : kurve==='hufeisen'?R*(Math.tan(BG.hufeisenAlpha)+1/Math.cos(BG.hufeisenAlpha)) : kurve==='stich'?f : R; }
  function bogenAussen(kurve,R){ return kurve==='hufeisen'?R/Math.cos(BOGEN_GESETZ.hufeisenAlpha):R; }   // die weiteste Laibung von der Achse
  function bogenKurve(kurve,R,f,s){ const BG=BOGEN_GESETZ;   // der Punkt der Laibung und seine Normale (nach außen) am Parameter s ∈ [0, 1] (hufeisen: nur über der Mitte)
    if(kurve==='spitz'){ const e=BG.spitzE*R, rho=R+e, ta=Math.acos(-e/rho), h=s<=0.5?s*2:(1-s)*2, th=Math.PI-(Math.PI-ta)*h, sg=s<=0.5?1:-1; return [sg*(e+rho*Math.cos(th)), rho*Math.sin(th), sg*Math.cos(th), Math.sin(th)]; }
    if(kurve==='hufeisen'){ const h0=R*Math.tan(BG.hufeisenAlpha), rho=R/Math.cos(BG.hufeisenAlpha), a=Math.PI*s; return [-rho*Math.cos(a), h0+rho*Math.sin(a), -Math.cos(a), Math.sin(a)]; }
    if(kurve==='stich'){ const rho=(R*R+f*f)/(2*f), be=Math.asin(Math.min(1,R/rho)), a=Math.PI/2+be-2*be*s; return [rho*Math.cos(a), f-rho+rho*Math.sin(a), Math.cos(a), Math.sin(a)]; }
    const a=Math.PI*s; return [-R*Math.cos(a), R*Math.sin(a), -Math.cos(a), Math.sin(a)]; }
  function prisma(g,polys,eb,role,merk){   // ebene Polygone (konvex oder sternförmig von der ersten Ecke, gegen den Uhrzeiger in u-v) um die Tiefe w0…w1 — EIN Mesh, jeder Punkt durch deform
    const W=(u,v,w)=>deform(eb.horiz?eb.cx+u:eb.cx+w, v, eb.horiz?eb.cz+w:eb.cz+u), P=[], sp=eb.horiz;   // x-y-Ebene: (u, v, w) rechtshändig; z-y-Ebene: gespiegelt — die Wicklung kehrt
    const push=(a,b,c)=>{ if(sp)P.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]); else P.push(a[0],a[1],a[2],c[0],c[1],c[2],b[0],b[1],b[2]); };
    let mu=0,mv=0,k=0;
    for(const q of polys){ const n=q.length, A=q.map(p=>W(p[0],p[1],eb.w0)), B=q.map(p=>W(p[0],p[1],eb.w1)); for(const p of q){ mu+=p[0]; mv+=p[1]; k++; }
      for(let i=1;i<n-1;i++){ push(A[0],A[i+1],A[i]); push(B[0],B[i],B[i+1]); }
      for(let i=0;i<n;i++){ const j=(i+1)%n; push(A[i],A[j],B[j]); push(A[i],B[j],B[i]); } }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,mat(role)); m.castShadow=!NOSHADOW[role]; m.receiveShadow=true; if(merk)Object.assign(m.userData,merk); g.add(m);
    const c=W(mu/k,mv/k,(eb.w0+eb.w1)/2); return tintWood(m,role,c[0],c[1],c[2]); }
  function bogenRahmen(g,cx,yS,cz,R,horiz,typ,role,o){   // BOGEN-GESETZ über jeder Öffnung (rund/spitz/hufeisen/stich) — dieselbe Kurve wie die Laube, ein Gesetz
    o=o||{}; const kurve=typ||'rund', f=kurve==='stich'?o.stich:0, t=(o.t!=null?o.t:0.19), steig=bogenSteig(kurve,R,f), cap=(o.cap!=null?o.cap:Infinity);
    if(!(R>0.05) || (kurve==='stich' && !(f>0.02)) || yS+steig+t*1.12>cap-0.02) return null;   // der Deckel: kein Scheitel durch das Dach
    const dp=(o.tiefe!=null?o.tiefe:0.42), vs=(o.versatz!=null?o.versatz:((horiz?cz:cx)<0?-0.14:0.14));
    const B={cx,cz,yS,R,t,horiz,kurve,stich:f,art:o.art||'oeffnung',cap,pfeiler:o.pfeiler||null,intrados:[]};   // DIE MARKE DES BOGENS (gate:fachwerk-contract BOGEN-VERBAND)
    const BG=BOGEN_GESETZ, h0=kurve==='hufeisen'?R*Math.tan(BG.hufeisenAlpha):0, rhoH=R/Math.cos(BG.hufeisenAlpha);
    if(kurve==='hufeisen'){ for(let k=0;k<=48;k++){ const a=-BG.hufeisenAlpha+(Math.PI+2*BG.hufeisenAlpha)*k/48; B.intrados.push([-rhoH*Math.cos(a),h0+rhoH*Math.sin(a)]); } }
    else for(let k=0;k<=48;k++){ const q=bogenKurve(kurve,R,f,k/48); B.intrados.push([q[0],q[1]]); }
    // die Bogenlänge der Laibung (dicht abgetastet) → N Keile gleicher Länge
    const M=96, tab=[], L=[0]; for(let k=0;k<=M;k++){ tab.push(bogenKurve(kurve,R,f,k/M)); if(k)L.push(L[k-1]+Math.hypot(tab[k][0]-tab[k-1][0],tab[k][1]-tab[k-1][1])); }
    const at=(l)=>{ let k=1; while(k<M && L[k]<l)k++; const a=tab[k-1], b=tab[k], q=(L[k]-L[k-1])>0?Math.max(0,Math.min(1,(l-L[k-1])/(L[k]-L[k-1]))):0, nu=a[2]+(b[2]-a[2])*q, nv=a[3]+(b[3]-a[3])*q, nl=Math.hypot(nu,nv)||1; return [a[0]+(b[0]-a[0])*q, a[1]+(b[1]-a[1])*q, nu/nl, nv/nl]; };
    const Lg=L[M], rM=Math.max(R,steig); let N=Math.max(5,Math.round(Lg*(1+t/(2*rM))/(0.34*GROSSFORMAT()))); if(N%2===0)N++;
    const eb=(d)=>({horiz,cx,cz,w0:vs-d/2,w1:vs+d/2}), ext=(q,tt)=>[q[0]+q[2]*tt, q[1]+q[3]*tt], vO=(q)=>[q[0],yS+q[1]];
    const Q=[]; for(let i=0;i<=N;i++){ const q=at(Lg*i/N); Q.push({p:[q[0],q[1]], n:q, r:ext(q,t)}); }
    for(let i=0;i<N;i++){ const sch=(i===(N-1)/2), tt=sch?t*1.12:t, a=Q[i], b=Q[i+1];
      prisma(g,[[vO(a.p),vO(b.p),vO(ext(b.n,tt)),vO(ext(a.n,tt))]],eb(sch?dp+0.04:dp),role,{keil:{bogen:B,i}}); }
    const zw=[];   // die Kämpfer-Stücke und die Mauer über dem Bogen (Zwickel)
    const fernStufe=!!(P.nur&&P.nur.kaempfer===false);   // die Stufe 2 (DESTNUR) trägt den Bogen als Keile ohne Kämpfer und Widerlager (K66: marokkanisch L2 7224 → 7280 > 7250)
    if(kurve==='hufeisen'&&!fernStufe) for(const sg of [-1,1]){ const pl=[[sg*(rhoH+t),yS],[sg*R,yS]];   // der Kämpferstein unter der Mitte: sein Lager auf yS, oben die Fuge durch die Mitte
      for(let k=1;k<=6;k++){ const a=-BG.hufeisenAlpha+BG.hufeisenAlpha*k/6; pl.push([sg*rhoH*Math.cos(a), yS+h0+rhoH*Math.sin(a)]); } pl.push([sg*(rhoH+t),yS+h0]); zw.push(sg<0?pl:pl.reverse()); }
    if(kurve==='stich'&&!fernStufe){ const q0=Q[0].r, qN=Q[N].r; zw.push([[q0[0],yS],[Q[0].p[0],yS],vO(q0)]); zw.push([[Q[N].p[0],yS],[qN[0],yS],vO(qN)]); }   // das Widerlager unter dem schrägen Lager
    if(o.zwickel){ const uL=o.zwickel[0], uR=o.zwickel[1], top=o.zwickel[2];
      if(Q[0].r[0]-uL>0.005) zw.push([[uL,yS],[Q[0].r[0],yS],[Q[0].r[0],top],[uL,top]]);
      if(uR-Q[N].r[0]>0.005) zw.push([[Q[N].r[0],yS],[uR,yS],[uR,top],[Q[N].r[0],top]]);
      for(let i=0;i<N;i++){ const a=Q[i].r, b=Q[i+1].r; if(b[0]-a[0]>1e-4 && top-yS-Math.max(a[1],b[1])>1e-4) zw.push([vO(a),vO(b),[b[0],top],[a[0],top]]); } }
    if(zw.length) prisma(g,zw,eb(dp-0.06),role,{zwickel:{bogen:B}});
    return B; }
  function fensterAt(g,cx,cy,cz,w,h,horiz,capY){ const fr='holz', gl=fensterSchlaeft(P.seed,horiz?'z':'x',horiz?cz:cx,horiz?cx:cz,cy)?'glasdunkel':'glas', _cap=(capY!=null?capY:Math.min(roofUnderY(cx,cz),roofUnderY(cx+(horiz?0.22:0),cz+(horiz?0.22:0))));   // BOGEN-DECKEL-GESETZ: lokale Dachgrenze schlägt Hauptdach; Doppel-Sample gegen Randfälle
    if(horiz){ beam(g,cx,cy+h/2+0.05,cz,w+0.2,0.1,0.18,fr); if(P.bogenTyp&&P.bogenTyp!=='none')bogenRahmen(g,cx,cy+h/2+0.12,cz,w*0.58,true,P.bogenTyp,fr,{art:'fenster',cap:_cap}); beam(g,cx,cy-h/2-0.05,cz,w+0.22,0.1,0.24,fr);     // Sturz + Fensterbank
      beam(g,cx-w/2-0.05,cy,cz,0.1,h+0.1,0.18,fr); beam(g,cx+w/2+0.05,cy,cz,0.1,h+0.1,0.18,fr);              // Pfosten
      const L=grp(); const inner=windowSash(w,h,true,fr,gl); inner.position.x=w/2; L.add(inner);
      L.position.set(...deform(cx-w/2,cy,cz)); L.rotation.y=(cz<0?0.62:-0.62)+(DEF_bk>0?(cx-w/2)*DEF_bk:0); L.userData={window:true,openA:L.rotation.y}; g.add(L);
    } else { beam(g,cx,cy+h/2+0.05,cz,0.18,0.1,w+0.2,fr); if(P.bogenTyp&&P.bogenTyp!=='none')bogenRahmen(g,cx,cy+h/2+0.12,cz,w*0.58,false,P.bogenTyp,fr,{art:'fenster',cap:_cap}); beam(g,cx,cy-h/2-0.05,cz,0.24,0.1,w+0.22,fr);
      beam(g,cx,cy,cz-w/2-0.05,0.18,h+0.1,0.1,fr); beam(g,cx,cy,cz+w/2+0.05,0.18,h+0.1,0.1,fr);
      const L=grp(); const inner=windowSash(w,h,false,fr,gl); inner.position.z=w/2; L.add(inner);
      L.position.set(...deform(cx,cy,cz-w/2)); L.rotation.y=(cx<0?-0.62:0.62)+(DEF_bk>0?cx*DEF_bk:0); L.userData={window:true,openA:L.rotation.y}; g.add(L); } }
  function fenster(){const g=grp(); if(ROUND)return g; WALLS.forEach(w=>{ if(!w.win||INNEN(w))return; const wd=winW(w),c=(w.lo+w.hi)/2; fensterAt(g,w.horiz?c:w.fixed,w.win.cy,w.horiz?w.fixed:c,wd,w.win.ch,w.horiz); });
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
    const peg=(x,y,z,face)=>{ if(P.__sehne>1)return; const d=0.035,L=0.135;                                // Holznagel: klein, bündig eingetrieben
      if(face==='z') beam(g,x,y,z,d,d,L,'nagel',[0,0,Math.PI/4]); else beam(g,x,y,z,L,d,d,'nagel',[Math.PI/4,0,0]); };
    const kopf=(x,y,zc,len)=>beam(g,x,y,zc,0.13,P.balkenH+0.02,len,'holz');         // Balkenkopf (Zapfennase über Rähm)
    levels.forEach(L=>{ const y0=L.y,h=L.h;                                          // 1) Ständer↔Schwelle/Rähm verstiftet (auf dem Ständer)
      bx.forEach(x=>{[zf,-zf].forEach(z=>{ if(z<0&&Math.abs(x-doorX)<doorW/2+0.2)return;          // Haustür-Öffnung (vorne −z) → kein Ständer, kein Nagel
        if(backDoor&&z>0&&x>backDoor.lo-0.2&&x<backDoor.hi+0.2)return;                              // Hintertür-Öffnung (hinten +z) → GLEICHE Regel, kein schwebender Nagel
        peg(x,y0+0.20,z,'z'); peg(x,y0+h-0.20,z,'z'); });});
      bz.forEach(z=>{ if(Math.abs(z)<Dp/2-0.1)[xf,-xf].forEach(x=>{ if(BRANDSEITE(x))return; peg(x,y0+0.20,z,'x'); peg(x,y0+h-0.20,z,'x'); }); });
      [doorX-doorW/2-ps,doorX+doorW/2+ps].forEach(x=>{ peg(x,y0+0.20,-zf,'z'); peg(x,y0+h-0.20,-zf,'z'); }); });
    WALLS.forEach(w=>{ if(w.type==='door'||w.type==='door2'||w.type==='balkdoor'||w.type==='wingdoor'||w.win||INNEN(w))return;   // 2) Kreuzungsnagel NUR in geschlossenen Brüstungsfeldern — alle Öffnungen (Türen, Fenster) frei (war inkonsistent: nur 'door' übersprungen → schwebender Nagel in Hintertür)
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
    addMasse({art:'anbau',x0,x1,z0,z1,sx,xin,xout,xoO,yLow,yHigh,yOut,flach:ROOFMODE==='flat'});
    beam(g,xc,wy0/2,zc,gw+0.14,wy0+0.05,gd+0.14,'stein');
    beam(g,xc,wy0+0.02,zc,gw,0.06,gd,'boden'); addSolid(xc,wy0,zc,gw,0.12,gd);
    [[xin,z0],[xin,z1],[xout,z0],[xout,z1]].forEach(([x,z])=>{ const yt=yR(x); beam(g,x,(wy0+yt)/2,z,0.14,yt-wy0,0.14,'holz'); });
    beam(g,xin,yHigh-0.07,zc,0.14,0.14,gd,'holz'); beam(g,xout,yLow-0.07,zc,0.14,0.14,gd,'holz');
    const plankX=(za,zb,y0,y1,x)=>{ if(zb-za<0.05||y1-y0<0.05)return; const n=P.flaechig?1:Math.max(1,Math.round((zb-za)/0.26)),bw=(zb-za)/n;   // FLÄCHEN-STUFE: die Bretterwand als EINE Fläche (die Fuge 1 % der Breite)
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
        if(P.flaechig){ beam(g,x,y+lift,zc,tcl,0.03,z1e-z0e,'ziegel',[0,0,-sx*th]); continue; }   // FLÄCHEN-STUFE: das Pultdach trägt je Reihe EIN Ziegel-Band wie das Hauptdach, keine Lattung (vorher trug die L1 des Anbaus seine L0: pueblo annexN=2 L1/L0 0,544)
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
      const fM=addMasse({art:'fluegel',x0,x1,z0,z1,eY,rY:null,first:outIsX?'x':'z',eOv:0});   // der First (rY) aus dem Dach-Zweig unten; flach ohne
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
        const eYw=eaveY-0.06, rYw=Math.min(eYw+half*mS, ridgeY-0.2), sz=oz, wPit=mS; fM.eY=eYw; fM.rY=rYw;   // GLEICHE Neigung wie das Hauptdach → Kehltal = saubere Diagonale
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
        fM.rY=rY; fM.eOv=eOv;
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
    // JEDE Öffnung in IHREM Höhenband (K10): zwischen den Öffnungs-Kanten trägt jeder überdeckte Abschnitt die Wand außerhalb der Bänder, die ihn überdecken — das EINE Band aller Öffnungen ließ die Vorderwand über der Haustür bis zur Traufe offen (im 2. OG ging der Körper hinaus und fiel 5,6 m)
    const ks=[...new Set([alo,ahi,...ops.flatMap(o=>[o.a0,o.a1])])].filter(a=>a>=alo&&a<=ahi).sort((a,b)=>a-b); let p=alo;
    for(let i=0;i+1<ks.length;i++){ const a=ks[i], e=ks[i+1], dk=ops.filter(o=>o.a0<=a&&o.a1>=e); if(!dk.length) continue;
      seg(p,a,yb,yt); p=e; let y=yb; dk.map(o=>[Math.max(yb,o.y0),Math.min(yt,o.y1)]).sort((u,v)=>u[0]-v[0]).forEach(([u,v])=>{ if(u>y) seg(a,e,y,u); y=Math.max(y,v); }); if(yt>y) seg(a,e,y,yt); }
    seg(p,ahi,yb,yt);
    if(yT>yt+0.02)seg(alo,ahi,yt,yT); };
  const wingOp=sd=>{ const w=wings.find(x=>x.side===sd); if(!(w&&w.door))return [];
    if(!w.outIsX) return [{a0:w.x0+0.2,a1:w.x1-0.2,y0:baseY,y1:eaveY}];                                  // senkrechter (verschmelzender) Flügel: Hauswand über ALLE Geschosse offen → ein Raum
    return [{a0:w.door.lo,a1:w.door.hi,y0:baseY,y1:dpH}]; };
  const balkOp=sd=>(balcDoor&&balcDoor.side===sd)?levels.slice(1).map(L=>({a0:balcDoor.cx-0.5,a1:balcDoor.cx+0.5,y0:L.y,y1:L.y+2.06})):[];   // die Balkontür je Balkon-Geschoss in IHRER Höhe (das Balkon-Gesetz: Hochhaus je OG, sonst das OG)
  perimWall(-W/2,false,-Dp/2,Dp/2,baseY,eaveY, [...wingOp('W'),...balkOp('W')]);   // −x Seitenwand (W-Durchgang + Balkontür)
  perimWall( W/2,false,-Dp/2,Dp/2,baseY,eaveY, [...wingOp('E'),...balkOp('E')]);   // +x Seitenwand (E-Durchgang + Balkontür)
  { const ops=wingOp('N'); if(backDoor)ops.push({a0:backDoor.cx-0.55,a1:backDoor.cx+0.55,y0:baseY,y1:dpH});
    perimWall(Dp/2,true,-W/2,W/2,baseY,eT, ops);                                                        // +z Rückwand EG (Hintertür + N-Durchgang)
    if(eaveY-eT>0.1) perimWall(Dp/2,true,-W/2,W/2,eT,eaveY, balkOp('N')); }   // OG Balkontür
  { const ops=wingOp('S'); ops.push({a0:-doorW/2,a1:doorW/2,y0:baseY,y1:dpH});
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
    // HOFMAUER-SOLIDS (Welle L, additiv — kein beam ändert sich, Kollision == Optik): Boden, Querwände mit Tor-Lücke und Sturz,
    // Lochwände der Arme, Pflaster und Brunnen tragen ihre Solids wie jede Wand des Hauses (vorher lief der Körper durch die
    // ganze Hofmauer, die Welt-Fernstufe sah sie nur als Bounding-Box 8,2 m vor den Haus-Solids)
    // DIE FERNE STUFE (Marke `fern`): die Arme trägt der Körper der Liste ('hofarm': Wand und Dach), ihre Fenster das Fern-Fenster — der Hof legt nur Pflaster
    // und Brunnen (vorher zeichnete die L2 jeden Arm zweimal: marokkanisch Hofbau 3528 Dreiecke über dem Körper); Massen und Solids bleiben
    const _fern=(P.nur||{}).fern===true, hb=(...a)=>_fern?null:beam(...a);
    const bar=(x0,x1,z0,z1,alongZ,gate)=>{ const cx=(x0+x1)/2,cz=(z0+z1)/2,lx=x1-x0,lz=z1-z0, rY=baseY+wH+(alongZ?lx:lz)/2*0.7;
      addMasse({art:'hofarm',x0,x1,z0,z1,eY:baseY+wH,rY:ROOFMODE==='flat'?null:rY,first:alongZ?'z':'x',eOv:0});
      hb(g,cx,baseY+0.04,cz,lx,0.08,lz,'boden'); addSolid(cx,baseY+0.04,cz,lx,0.08,lz);
      const xWall=(zz)=>{ if(!gate){ hb(g,cx,baseY+wH/2,zz,lx,wH,0.22,wr); addSolid(cx,baseY+wH/2,zz,lx,wH,0.22); return; }   // ohne Korridor: volle Querwand
        const gw2=gate.w/2, lh=Math.min(wH-0.25, gate.h), L=(gate.x-gw2)-x0, R=x1-(gate.x+gw2);   // EINGANGS-KORRIDOR (Sperrflaeche der Haustuer) bleibt frei → das Tor emergiert auf der Tuer-Achse, nicht hart gesetzt
        if(L>0.05){ hb(g,x0+L/2,baseY+wH/2,zz,L,wH,0.22,wr); addSolid(x0+L/2,baseY+wH/2,zz,L,wH,0.22); } if(R>0.05){ hb(g,x1-R/2,baseY+wH/2,zz,R,wH,0.22,wr); addSolid(x1-R/2,baseY+wH/2,zz,R,wH,0.22); }   // Wandstuecke links/rechts vom Tor
        if(wH>lh+0.05){ hb(g,gate.x,baseY+(lh+wH)/2,zz,gate.w,wH-lh,0.22,wr); addSolid(gate.x,baseY+(lh+wH)/2,zz,gate.w,wH-lh,0.22); } };   // Sturz: die niedrige Wand bestimmt die Torform (flach, kein Bogen)
      xWall(z0); xWall(z1);
      { const nzW=Math.max(1,Math.round(lz/2.2)), wcy=baseY+Math.min(wH-0.55,1.5), wfw=Math.min(0.8,lz/nzW*0.4), wfh=0.9, zh=[];   // HOF-FENSTER-GESETZ: Arme schauen in den Hof UND zur Strasse — LOCHWAND
        for(let i2=0;i2<nzW;i2++){ const pz=z0+lz*(i2+0.5)/nzW; zh.push({c:pz,w:wfw+0.12,b:wcy-wfh/2-0.03,t:wcy+wfh/2+0.03}); }
        if(_fern){ for(let i2=0;i2<nzW;i2++){ const pz=z0+lz*(i2+0.5)/nzW; for(const xw of [x0,x1]) FERNFENSTER.push({cx:SHIFT?xw+SHIFT:xw, cy:wcy, cz:pz, w:wfw, h:wfh, perp:'x', kind:'hof', s:xw<cx?-1:1, schlaf:fensterSchlaeft(P.seed,'x',xw,pz,wcy)}); } }
        else { lochWand(g,false,x0,z0,z1,baseY,baseY+wH,zh,wr,0.22,true); lochWand(g,false,x1,z0,z1,baseY,baseY+wH,zh,wr,0.22,true);
        for(let i2=0;i2<nzW;i2++){ const pz=z0+lz*(i2+0.5)/nzW; fensterAt(g,x0,wcy,pz,wfw,wfh,false); fensterAt(g,x1,wcy,pz,wfw,wfh,false); } } }
      if(ROOFMODE==='flat'){ hb(g,cx,baseY+wH+0.06,cz,lx,0.12,lz,'putz'); }   // flaches Hof-Arm-Dach (Mediterran) statt Pultdach
      else { const half=(alongZ?lx:lz)/2, dy=rY-(baseY+wH), ang=Math.atan2(dy,half), len=Math.hypot(half,dy);
      [1,-1].forEach(s=>{ if(alongZ) hb(g,cx+s*half/2,(baseY+wH+rY)/2,cz,len,0.10,lz+0.3,'ziegel',[0,0,-s*ang]);
                          else hb(g,cx,(baseY+wH+rY)/2,cz+s*half/2,lx+0.3,0.10,len,'ziegel',[s*ang,0,0]); }); } };
    bar(-W/2,-W/2+armW,zC+gateW,zF,true);            // linker Arm (First entlang z)   // Arm stößt an den Torriegel — kein Dach-Kreuz
    bar(W/2-armW,W/2,zC+gateW,zF,true);              // rechter Arm
    bar(-W/2,W/2,zC,zC+gateW,false,{x:doorX, w:doorW+0.9, h:P.doorH+0.3});           // Torriegel vorne (First entlang x)
    beam(g,0,baseY+0.03,(zF+zC+gateW)/2,W-2*armW+0.3,0.06,courtD-gateW,'weg'); addSolid(0,baseY+0.03,(zF+zC+gateW)/2,W-2*armW+0.3,0.06,courtD-gateW);   // Hofpflaster
    const wz=(zF+zC+gateW)/2; beam(g,0,baseY+0.45,wz,1.1,0.9,1.1,'stein'); beam(g,0,baseY+0.92,wz,1.3,0.1,1.3,'stein'); addSolid(0,baseY+0.45,wz,1.1,0.9,1.1); addSolid(0,baseY+0.92,wz,1.3,0.1,1.3);   // Brunnen in der Mitte
    return g; }
  // LOCHWAND-GESETZ — EINE Wand-mit-Öffnungen-Quelle: Vollsegmente zwischen den Löchern, Brüstungs- und Sturzband je Loch. Türen UND Fenster sind dieselbe Öffnungs-Art. sol (Welle L, additiv): jedes Segment trägt sein Solid (die Hofmauer); ohne sol bleibt die Wand ohne (die Aufrufer mit eigener Solid-Quelle).
  function lochWand(g,horiz,fix,a0,a1,y0,y1,holes,role,tk,sol){ tk=tk||0.24; const B=(c,cy,len,hh)=>{ if(len<0.03||hh<0.03)return; horiz?beam(g,c,cy,fix,len,hh,tk,role):beam(g,fix,cy,c,tk,hh,len,role); if(sol){ if(horiz)addSolid(c,cy,fix,len,hh,tk); else addSolid(fix,cy,c,tk,hh,len); } };
    const hs=(holes||[]).filter(h=>h.c-h.w/2>a0-0.01&&h.c+h.w/2<a1+0.01).sort((p,q)=>p.c-q.c); let cur=a0;
    for(const h of hs){ const Lh=h.c-h.w/2,Rh=h.c+h.w/2; B((cur+Lh)/2,(y0+y1)/2,Lh-cur,y1-y0); if(h.b>y0+0.04)B(h.c,(y0+h.b)/2,h.w,h.b-y0); if(y1>h.t+0.04)B(h.c,(h.t+y1)/2,h.w,y1-h.t); cur=Rh; }
    B((cur+a1)/2,(y0+y1)/2,a1-cur,y1-y0); }
  // ════ BRÜSTUNGS-GESETZ (SIA 358) — EINE Absturzsicherung für ALLE Kanten (Terrassen-Decks, Turm-Galerie): Handlauf-Oberkante ≥1.00m über Deck, vertikale Stäbe lichte Öffnung ≤0.12m, Fußriegel gegen Bodenspalt — hohl statt massiv ════
  function bruestungSeg(g,axis,x0,x1,z0,z1,deckY,role){ const hor=(axis==='z'), a0=hor?x0:z0, a1=hor?x1:z1, fix=hor?z0:x0, len=a1-a0; if(len<0.14)return;
    const hTop=deckY+1.05, B=(c,y,w,h,t2)=>hor?beam(g,c,y,fix,w,h,t2,role):beam(g,fix,y,c,t2,h,w,role);
    B((a0+a1)/2,hTop-0.035,len,0.07,0.09); B((a0+a1)/2,deckY+0.10,len,0.06,0.07);                                    // Handlauf (OK 1.05) + Fußriegel
    const nP=Math.max(1,Math.round(len/1.5)); for(let i=0;i<=nP;i++)B(a0+len*i/nP,(deckY+hTop)/2,0.07,hTop-deckY,0.07);   // Pfosten
    const _gf=P.flaechig?2:1, nS=Math.max(2,Math.ceil(len/(0.16*_gf))); if(!(P.nur&&P.nur.fern)) for(let i=1;i<nS;i++)B(a0+len*i/nS,(deckY+hTop)/2,0.045*_gf,hTop-deckY-0.16,0.045*_gf); }   // die Stufen des Stabs: die Flächen-Stufe im Großformat (halb so viele, doppelt so breit — derselbe Anteil Durchblick), die ferne Stufe ohne Stäbe (4,5 cm unter 1,5 Pixel: sie flimmerten nur)   // Stäbe: Pitch ≤0.16 → licht ≤0.115
  function bruestungRect(g,xa,xb,za,zb,deckY,role){ bruestungSeg(g,'z',xa,xb,za,za,deckY,role); bruestungSeg(g,'z',xa,xb,zb,zb,deckY,role); bruestungSeg(g,'x',xa,xa,za,zb,deckY,role); bruestungSeg(g,'x',xb,xb,za,zb,deckY,role); }
  // MERLON-GESETZ (Burgenbau) — Brustwehr mannshoch (Sims ≥1.0 über Deck, man fällt nicht durchs Crenel), Merlon:Crenel ≈ 3:2 — GETEILT von Ringmauer UND Turm
  function merlonSeg(g,axis,x0,x1,z0,z1,deckY,role,dpt){ const hor=(axis==='z'), a0=hor?x0:z0, a1=hor?x1:z1, fix=hor?z0:x0, len=a1-a0; if(len<0.4)return; dpt=dpt||0.42;
    const bw=1.00, sill=deckY+bw, mh=0.75, mw=0.6, n=Math.max(1,Math.floor(len/1.0));
    const B=(c,y,w,h,t2)=>hor?beam(g,c,y,fix,w,h,t2,role):beam(g,fix,y,c,t2,h,w,role);
    B((a0+a1)/2,deckY+bw/2,len+0.3,bw,dpt); B((a0+a1)/2,sill+0.05,len+0.34,0.10,dpt+0.06);                            // Brustwehr + Sims
    for(let i=0;i<n;i++)B(a0+(i+0.5)*len/n,sill+0.10+mh/2,mw,mh,dpt-0.04); }                                          // Merlonen
  function zinnen(){ const g=grp(); if(!P.zinnen||ROUND) return g; addMasse({art:'zinnen',y1:eaveY+0.1+1.0+0.1});   // ZINNEN (Burg) — Wehrgang-Deck aus dachdeckung (EINE flache-Dach-Quelle); Brustwehr+Merlonen = MERLON-GESETZ (geteilt mit dem Turm)
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
        addMasse({art:'vordach',x0,x1,z0:Math.min(z0,zf),z1:Math.max(z0,zf),yB:plT,yT:wT,first:side<0?'+z':'-z',deck:baseY+0.1});
        for(let i=0;i<=n;i++){ const px=x0+len*i/n; if(gap>0&&Math.abs(px)<gap)continue; if(!front)beam(g,px,baseY+0.95,zf,0.06,1.0,0.06,wr); }
      } else { const segs=(r.a?[[z0,z1]]:(()=>{ let S2=[[z0,z1]]; GAs.forEach(A=>{ if(A.sx===Math.sign(side)){ const a=A.z0-0.03,b2=A.z1+0.03, O=[]; S2.forEach(([s0,s1])=>{ if(b2<=s0||a>=s1)O.push([s0,s1]); else { if(a-s0>0.4)O.push([s0,a]); if(s1-b2>0.4)O.push([b2,s1]); } }); S2=O; } }); return S2; })());   // SPLIT-GESETZ: Veranda weicht der Anbau-Zelle — kein Dach durch die Garage
        segs.forEach(([s0,s1])=>{ const len=s1-s0, xf=x0+side*d, cz=(s0+s1)/2, n=Math.max(2,Math.round(len/2.0));
        beam(g,x0+side*d/2,baseY+0.05,cz,d,0.1,len,'boden');
        beam(g,x0+side*d/2,baseY/2,cz,d,baseY,len,'stein');
        for(let i=0;i<=n;i++)beam(g,xf,baseY+pH/2,s0+len*i/n,0.16,pH,0.16,wr);
        beam(g,xf,plT,cz,0.16,0.12,len,wr);
        beam(g,x0+side*(d/2),(plT+wT)/2+0.06,cz,ll,0.08,len,'ziegel',[0,0,-side*ang]);
        addMasse({art:'vordach',x0:Math.min(x0,xf),x1:Math.max(x0,xf),z0:s0,z1:s1,yB:plT,yT:wT,first:side<0?'+x':'-x',deck:baseY+0.1});
        for(let i=0;i<=n;i++)beam(g,xf,baseY+0.95,s0+len*i/n,0.06,1.0,0.06,wr); }); }
    });
    return g; }
  function vorkragung(){ const g=grp(); if(!P.vorkragung||levels.length<2||ROUND) return g;   // VORKRAGUNG/JETTY (mittelalterl. Fachwerk) — Obergeschoss kragt vor
    const ov=0.45,y=levels[0].top,wr=(P.stil==='huette'||P.stil==='stroh'||P.stil==='alt')?'holz':'gefach';
    addMasse({art:'vorkragung',ov,y0:y});
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
        const zA=(LOFT.dir>0)?hz0:hz1; bruestungSeg(g,'z',hx0,hx1,zA,zA,y+0.14,grl); bruestungSeg(g,'x',hx0,hx0,hz0,hz1,y+0.14,grl); bruestungSeg(g,'x',hx1,hx1,hz0,hz1,y+0.14,grl); }   // 3-seitig: der Austritt bleibt frei
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
      addMasse({art:'stufe',x0:cx-w/2,x1:cx+w/2,z0:cz-dd/2,z1:cz+dd/2,y0:y,y1:y+tH});
      pw=w; pd=dd; pcx=cx; pcz=cz; y+=tH; }
    beam(g,pcx,y+0.07,pcz,pw,0.14,pd,'boden');                                                                          // Dachplatte des obersten Tiers
    bruestungRect(g,pcx-pw/2,pcx+pw/2,pcz-pd/2,pcz+pd/2,y+0.14,grl);                                                    // oberstes Deck: voller SIA-Ring ab Gehfläche
    addMasse({art:'stufe',x0:pcx-Math.max(1.2,W*0.22)/2,x1:pcx+Math.max(1.2,W*0.22)/2,z0:pcz-Math.max(1.2,Dp*0.22)/2,z1:pcz+Math.max(1.2,Dp*0.22)/2,y0:y,y1:y+1.1});
    beam(g,pcx,y+0.55,pcz,Math.max(1.2,W*0.22),1.1,Math.max(1.2,Dp*0.22),role); const ax=W*0.13,az=Dp*0.13,c=[[-ax,-az],[ax,-az],[ax,az],[-ax,az]]; c.forEach((p,k)=>{const q=c[(k+1)%4]; tri(g,[pcx+p[0],y+1.1,pcz+p[1]],[pcx+q[0],y+1.1,pcz+q[1]],[pcx,y+1.9,pcz],'ziegel');}); return g; }
  function rundbau(){ const g=grp(); if(!ROUND) return g;   // ZYLINDER-GESETZ — runde Wand aus Segmenten, Geschoss-Böden, Kegel/Zwiebel-Dach
    const rad=Math.min(W,Dp)/2, seg=Math.max(18,Math.round(rad*3.5)), nLev=Math.max(1,P.storeys), wallTop=baseY+nLev*P.egH;
    addMasse({art:'rund',x0:-rad,x1:rad,z0:-rad,z1:rad,rad,y0:baseY-0.35,y1:wallTop,spitze:(P.dachTyp==='zwiebel'||P.kuppel)?wallTop+rad*1.7:wallTop+rad*1.3,zwiebel:(P.dachTyp==='zwiebel'||P.kuppel)?1:0});
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
  function arkade(){ const g=grp(); if(!P.arkade) return g;   // ARKADE/KREUZGANG (Rom/Romanik/Islam/Gotik) — folgt dem GETEILTEN Grundriss-Umriss (eachFootEdge) wie zinnen/vorkragung/veranda
    // DIE LAUBE UNTER DER TRAUFE (K66): ihr flaches Dach liegt bündig mit dem Dach des Hauses (einstöckig: auf der Traufe) bzw. auf dem Boden des
    // Obergeschosses; über den Bögen die Mauer (Zwickel) bis unter die Platte. Die Pfeiler stehen GETEILT in der Flucht (n + 1 für n Bögen; ein
    // Rechteck: die Flucht läuft bis in die Ecken, die Ecke trägt EIN Pfeiler), auf jedem der Kämpfer. Der Bogen folgt der Höhe, die ihm die
    // Traufe lässt: die Bogen-Art des Hauses, wo ihr Scheitel unter die Platte passt (lichte Höhe am Kämpfer ≥ lichtK), sonst der Stichbogen mit dem
    // Stich, der bleibt; ist der flacher als R/5, trägt ein Sturz (die Säulenhalle). Bis K66 stand je Bogen ein eigenes Pfeilerpaar (Doppelpfeiler
    // 4 cm versetzt), der Kämpfer auf 2,4–3,4 m, das Pultdach 0,9 m darüber — der Scheitel ragte bis 1,1 m über die Traufe.
    const typ=P.bogenTyp==='none'?'rund':P.bogenTyp, d=1.8, pd=0.5, kH=0.18, dachT=0.12, gesims=0.12, lichtK=1.9, ue=0.15;
    const yZ=(P.storeys>=2?levels[0].top:eaveY), eins=(FOOTPRINT.length===1);
    eachFootEdge((x0,x1,z0,z1,axis,side,r)=>{
      const horiz=(axis==='z'), wl=horiz?z0:x0, lf=wl+side*d, e0=horiz?x0:z0, e1=horiz?x1:z1;   // Wandflucht · Pfeilerflucht · die Kante
      const a0=e0-(eins?d:0), a1=e1+(eins?d:0), len=a1-a0, n=Math.max(2,Math.round(len/2.6)), b=len/n, pw=Math.min(0.6,Math.max(0.44,0.2*b)), R=b/2-pw/2;
      const P3=(u,v,lx,ly,lz,role)=>horiz?beam(g,u,v,lf,lx,ly,lz,role):beam(g,lf,v,u,lz,ly,lx,role);   // ein Kasten in der Flucht (lx längs, lz quer)
      const stueck=(u0,u1,q0,q1,y0,y1,role)=>{ const qa=Math.min(q0,q1), qb=Math.max(q0,q1); if(horiz) beam(g,(u0+u1)/2,(y0+y1)/2,(qa+qb)/2,u1-u0,y1-y0,qb-qa,role); else beam(g,(qa+qb)/2,(y0+y1)/2,(u0+u1)/2,qb-qa,y1-y0,u1-u0,role); };
      let kurve=typ, steig=bogenSteig(typ,R,0), stich=0;
      let t=Math.min(0.3,Math.max(0.2,0.22*R)); t=Math.min(t, pw/2-(bogenAussen(kurve,R)-R)-0.01);
      if(baseY+lichtK+steig+t*1.12+gesims>yZ){ kurve='stich'; t=Math.min(Math.min(0.3,Math.max(0.2,0.22*R)), pw/2-0.01); stich=Math.min(R, yZ-gesims-t*1.12-lichtK-baseY); steig=stich; }
      const sturz=(kurve==='stich' && stich<0.2*R), yS=sturz? yZ-0.3 : yZ-gesims-t*1.12-steig;   // der Kämpfer: so hoch, dass der Scheitel unter die Platte reicht
      for(let i=0;i<=n;i++){ if(eins && !horiz && (i===0||i===n)) continue;   // die Eck-Pfeiler trägt die Flucht längs x
        const u=a0+i*b; P3(u,(baseY+yS-kH)/2,pw,yS-kH-baseY,pd,'stein'); P3(u,yS-kH/2,pw+0.08,kH,pd+0.08,'stein'); }   // Pfeiler + Kämpfer
      const uA=(eins&&!horiz)?a0+pw/2:a0-pw/2, uB=(eins&&!horiz)?a1-pw/2:a1+pw/2;   // die Flucht der Mauer über den Bögen (die Ecke gehört der Flucht längs x)
      if(sturz) P3((uA+uB)/2,(yS+yZ)/2,uB-uA,yZ-yS,pd-0.04,'stein').userData.sturz=true;   // der Sturz der Säulenhalle
      else for(let i=0;i<n;i++){ const c=a0+(i+0.5)*b;
        bogenRahmen(g,horiz?c:lf,yS,horiz?lf:c,R,horiz,kurve,'stein',{art:'arkade',t,tiefe:pd-0.02,versatz:0,cap:yZ,stich,zwickel:[-b/2,b/2,yZ],pfeiler:[[-R-pw,-R],[R,R+pw]]}); }
      if(!sturz && eins && horiz) for(const [u0,u1] of [[a0-pw/2,a0],[a1,a1+pw/2]]) P3((u0+u1)/2,(yS+yZ)/2,u1-u0,yZ-yS,pd-0.06,'stein');   // die Mauer über der äußeren Hälfte der Eck-Pfeiler
      const fA=(eins&&!horiz)?e0:uA, fB=(eins&&!horiz)?e1:uB;   // der Boden und das Dach der Laube: längs x samt den Ecken, quer nur die Kante
      stueck(fA,fB,wl,lf+side*pd/2,baseY,baseY+0.1,'weg');
      const dA=(eins&&!horiz)?e0:uA-ue, dB=(eins&&!horiz)?e1:uB+ue, q1=lf+side*(pd/2+ue);
      stueck(dA,dB,wl-side*0.05,q1,yZ,yZ+dachT,'stein');
      if(horiz) addMasse({art:'vordach',x0:dA,x1:dB,z0:Math.min(wl,q1),z1:Math.max(wl,q1),yB:yZ,yT:yZ+dachT,first:side<0?'+z':'-z'});
      else addMasse({art:'vordach',x0:Math.min(wl,q1),x1:Math.max(wl,q1),z0:dA,z1:dB,yB:yZ,yT:yZ+dachT,first:side<0?'+x':'-x'});
    });
    return g; }
  function turm(){ const g=grp(); if(!P.turm) return g;   // TURM — HOHL (LOCHWAND-GESETZ: echte Fenster + echtes Portal + Geschossböden), an die Ringmauer gebunden, Standort aus der BELEGUNGS-QUELLE, bei Burg ZINNENKRANZ
    const tw=Math.min(2.2,Math.max(1.4,W*0.22)), _oE=OCC.has('E'),_oW=OCC.has('W'),_oN=OCC.has('N'), sx=!_oE?1:(!_oW?-1:0), szT=(!_oE||!_oW)?-1:1, tx=(sx===0)?0:sx*(W/2+tw/2-0.18), tz=szT<0?(-Dp/2+tw/2-0.18):(Dp/2+tw/2-0.18), h=ridgeY-baseY+Math.max(4.5,P.storeys*2.0), wr=(P.stil==='huette'||P.stil==='stroh')?'holz':'stein', twT=0.26;
    if(_oE&&_oW&&_oN) return g;
    addMasse({art:'turm',x0:tx-tw/2,x1:tx+tw/2,z0:tz-tw/2,z1:tz+tw/2,y0:baseY,y1:baseY+h,spitze:P.zinnen?0:tw*2.4,zinnen:P.zinnen?1:0});   // TURM-VERZICHTS-GESETZ: kein freier Platz an der Hülle — ehrlich statt Kollision (E→W→Heck-Mitte)
    const fw2=Math.min(0.85,tw*0.5), fh=1.05, nLv=Math.max(1,Math.floor(h*0.72/2.4)), pw2=Math.min(0.6,tw*0.36), pH=1.55;
    const zF=tz-tw/2+twT/2, zB=tz+tw/2-twT/2, xL=tx-tw/2+twT/2, xR=tx+tw/2-twT/2, zP=(szT<0?zF:zB), zQ=(szT<0?zB:zF), lvH=2.4, nB=Math.ceil(h/lvH);   // GESCHOSS-BAND-GESETZ: jede Fassade bandweise — lochWand je Ebene (Löcher übereinander sauber getrennt)
    const _tN=P.nur||{};   // DIE STUFEN-FLAGS GELTEN AUCH DEM TURM (pipeline.K3): die ferne Stufe (fenster/tueren/boeden false) trägt keine Löcher und keine Geschossböden — der Schaft steht geschlossen
    const _fern=_tN.fern===true;   // DIE FERNE STUFE (die Marke `fern` der Masken DESTNUR und TURMNUR: die Stufen, die den Körper der Liste und das Fern-Fenster zeichnen): Schaft und Helm trägt der Körper der Liste ('turm'), die Fenster das Fern-Fenster — der Turm legt nur, was der Körper nicht trägt (vorher zeichnete die L2 den Turm zweimal: marokkanisch turm=1 L2 7614 > 7250)
    const _nBand=_fern?0:nB, _bH=_nBand===1?h:lvH;   // ohne Löcher trägt EIN Band die ganze Höhe (die Bänder trennen nur Löcher)
    for(let s=0;s<_nBand;s++){ const y0=baseY+s*_bH, y1=Math.min(baseY+h, y0+_bH), cy=baseY+1.8+s*2.4, hasW=(s>=1&&s<nLv)&&_tN.fenster!==false;
      const wHole=hasW?[{c:tx,w:fw2+0.12,b:cy-fh/2-0.03,t:cy+fh/2+0.03}]:[], sHole=hasW?[{c:tz,w:fw2+0.12,b:cy-fh/2-0.03,t:cy+fh/2+0.03}]:[];
      lochWand(g,true, zP, tx-tw/2, tx+tw/2, y0, y1, (s===0&&_tN.tueren!==false?[{c:tx,w:pw2*2-0.02,b:y0-0.02,t:baseY+pH}]:wHole), wr, twT);   // Front: EG=Portal, darüber Fenster
      lochWand(g,true, zQ, tx-tw/2, tx+tw/2, y0, y1, wHole, wr, twT);
      lochWand(g,false, xL, tz-tw/2+twT, tz+tw/2-twT, y0, y1, sHole, wr, twT);
      lochWand(g,false, xR, tz-tw/2+twT, tz+tw/2-twT, y0, y1, sHole, wr, twT); }
    for(let s=1;s<=nLv&&_tN.boeden!==false;s++){ const fy=baseY+Math.min(h-0.35, s*2.4); beam(g,tx,fy+0.06,tz,tw-2*twT+0.06,0.12,tw-2*twT+0.06,'boden'); }   // GESCHOSSBÖDEN — der Schaft ist bewohnbar
    if(!(_fern&&_tN.tueren===false)){ bogenRahmen(g,tx,baseY+pH,tz+szT*(tw/2+0.03),pw2,true,(P.bogenTyp&&P.bogenTyp!=='none')?P.bogenTyp:'rund',wr); beam(g,tx,baseY+0.75,tz+szT*(tw/2-0.06),pw2*2-0.14,1.5,0.09,'holz'); aussentreppe(g,tx,tz+szT*(tw/2+0.08),0,szT,pw2*2); }   // Blendbogen + Torblatt in der Laibung + Stufen (die ferne Stufe ohne Türen: der Körper steht geschlossen)
    { for(let s=1;s<nLv;s++){ const cy=baseY+1.8+s*2.4;
      if(_fern){ const ff=(cx,cz,perp,sg,wand,u)=>FERNFENSTER.push({cx:SHIFT?cx+SHIFT:cx, cy, cz, w:fw2, h:fh, perp, kind:'turm', s:sg, schlaf:fensterSchlaeft(P.seed,perp,wand,u,cy)});   // der Würfel aus derselben Lage wie fensterAt der nahen Stufen
        ff(tx,tz-tw/2,'z',-1,tz-tw/2-0.02,tx); ff(tx,tz+tw/2,'z',1,tz+tw/2+0.02,tx); ff(tx-tw/2,tz,'x',-1,tx-tw/2-0.02,tz); ff(tx+tw/2,tz,'x',1,tx+tw/2+0.02,tz); continue; }
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
    addMasse({art:'portikus',x0:x0-0.35,x1:x1+0.35,z0:zf,z1:zb,yB:pY,yT:apex,gebaelk:{y0:arY,y1:pY,z0:zc-depth*0.35,z1:zc+depth*0.35},basis:{x0:-((x1-x0)+1.0)/2,x1:((x1-x0)+1.0)/2,z0:zc-(depth+0.3)/2,z1:-ez,y1:bT+0.21}});
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
    const _ks=P.__sehne>1?P.__sehne:1, rad=Math.min(W,Dp)/2-0.05, base=eaveY-0.1, springY=base+rad*0.55, seg=Math.max(8,Math.round(24/_ks)), bands=Math.max(6,Math.round(18/_ks));   // über der Zeile (P.__sehne, buildInstance): weniger Meridiane und Bänder, dieselbe Silhouette
    addMasse({art:'kuppel',x0:-W/2,x1:W/2,z0:-Dp/2,z1:Dp/2,rad,base,springY,y1:springY+rad*1.4});
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
  const _oeffnungenDerEinheit=()=>{ const dx=SHIFT;   // die Öffnungen EINER Einheit — das Doppelhaus trägt die der Einheit B um +W (vorher stand B in der L2 blind), keine an der Brandwand
    const auf=(o,wand,u)=>{ if(dx){ o.cx+=dx; o.schlaf=fensterSchlaeft(P.seed,o.perp,wand,u,o.cy); } windowOpenings.push(o); };   // der Würfel der Einheit B aus ihrer eigenen Lage (EIN Würfel je Fenster, wie ihr Bau)
    WALLS.forEach(w=>{ if(!w.win||INNEN(w))return; const wd=winW(w),c=(w.lo+w.hi)/2; auf({cx:w.horiz?c:w.fixed, cy:w.win.cy, cz:w.horiz?w.fixed:c, w:wd, h:w.win.ch, perp:w.horiz?'z':'x', kind:'stockwerk'}, w.fixed, c); });
    if(gableWin){ [1,-1].forEach(sx=>{ if(!BRANDSEITE(sx)) auf({cx:sx*(W/2-0.02), cy:gableWin.cy, cz:0, w:gableWin.wz, h:gableWin.hy, perp:'x', kind:'giebel'}, sx*(W/2-0.02), 0); }); } };
  _oeffnungenDerEinheit(); if(P.doppel){ SHIFT=W; _oeffnungenDerEinheit(); SHIFT=0; }
  GAs.forEach(A=>windowOpenings.push({cx:A.xout, cy:0.06+1.2, cz:A.zc, w:0.8, h:0.55, perp:'x', kind:'anbau'}));   // Anbau-Fenster außen — seitenrichtig (war x1)
  for(const f of FERNFENSTER) windowOpenings.push(f);   // die Teilbauten der fernen Stufe (Turm, Hof): ihr Fern-Fenster
  const annexDoors = GAs.length ? GAs.flatMap(A=>{ const tw=Math.min(2.45,A.gw-0.55), t0=A.xin+A.sx*0.30, tlo=Math.min(t0,t0+A.sx*tw), thi=Math.max(t0,t0+A.sx*tw), p0=A.xin+A.sx*0.35;
    return [ {x0:tlo, x1:thi, y0:0.06, y1:0.06+2.0, z:A.z0, kind:'tor'},
             {x0:Math.min(p0,p0+A.sx*0.85), x1:Math.max(p0,p0+A.sx*0.85), y0:0.06, y1:0.06+2.0, z:A.z1, kind:'personentuer'} ]; }) : [];
  { const hm={art:'haupt',x0:-W/2,x1:W/2,z0:-Dp/2,z1:Dp/2,y0:P.pilotis?baseY-0.24:0,eY:eaveY,rY:ridgeY,egTop:levels[0].top,dach:ROOFMODE==='alt'?'alt:'+P.dachTyp:ROOFMODE,hip:P.hip,ovZ:P.ovEave,ovX:P.ovRake,curve:DEF_cv,dachRolle:(sm&&sm.RM&&sm.RM.ziegel)||'ziegel'};
    addMasse(Object.assign({},hm)); if(P.doppel){ SHIFT=W; addMasse(Object.assign({},hm)); SHIFT=0; }
    if(DORMER) addMasse({art:'gaube',x0:DORMER.gx-DORMER.gW/2,x1:DORMER.gx+DORMER.gW/2,z0:DORMER.zFront,z1:DORMER.zBack,y0:DORMER.baseY2,y1:DORMER.frontTop}); }   // der Hauptkörper (das Doppelhaus: beide Einheiten)
  return { P, subsystems, order, solids, build, spawn, floors:levels.map(L=>L.y), windows:windowOpenings, annexDoors,
    cellar: P.keller?{x0:-(W/2-0.08),x1:(W/2-0.08),z0:-(Dp/2-0.08),z1:(Dp/2-0.08),floorY:kellerY+0.12}:null,
    wings: wings.map(w=>({side:w.side,outIsX:w.outIsX,ox:w.ox,oz:w.oz,x0:w.x0,x1:w.x1,z0:w.z0,z1:w.z1,eY:w.eY,rY:w.rY,roofAt:w.roofAt,door:w.door})),
    grundriss: P.grundriss,
    dims:{W,D:Dp,eaveY,ridgeY,baseY,egTop:levels[0].top, storeys:P.storeys, hip:P.hip, brace:P.brace, fw, balcDoorX:balcDoor?balcDoor.cx:null, backDoorX:backDoor?backDoor.cx:null,
      tuer:(ROUND?null:{x:0,z:-Dp/2,w:doorW,h:doorH,y:baseY, hinten:(backDoor?{x:backDoor.cx,z:Dp/2,w:Math.min(1.0,backDoor.hi-backDoor.lo-0.2)}:null)}),   // DORF-ERLEBNIS (17.07., additiv): die TÜR-ZEILE — Position/Maß der Haustür (Front −z, tueren()-Wahrheit) + Hintertür; exportSettlement reicht sie je Slot an den Host (Blocker-Tür-Lücke + Betreten). ROUND-Bauten tragen keine Haustür (tueren() baut dort nichts).
      rooms:rooms.map(r=>({side:r.side,cx:r.cx,cz:r.cz,floor:r.floor,x0:r.x0,x1:r.x1,z0:r.z0,z1:r.z1,y:r.y,func:r.func})), stairX0:wx0, stairX1:wx1, stairZ0:stZ0, stairZ1:wz1,
      flights:flights.map(f=>({base:f.base,x0:f.x0,x1:f.x1,zFoot:f.zFoot,dir:f.dir,N:f.N,rise:f.rise,go:f.go,isLoft:f.isLoft,atLevel:f.atLevel,tr:f.tr})), levelsY:levels.map(L=>L.y),
      loft:LOFT?{x0:LOFT.x0,x1:LOFT.x1,z0:LOFT.z0,z1:LOFT.z1,xc:LOFT.xc,base:LOFT.base,top:LOFT.top,N:LOFT.N,rise:LOFT.rise,go:LOFT.go}:null}, furniture, chimney, roofY, masse,
      rahmen:(function(){ const m=mat('holz'); return (m&&m.__role)||_roleByMat.get(m)||'holz'; })(),   // der Rahmen-Stoff des Stils (das Fern-Fenster liest ihn)
      raum:(function(){ const m=mat('gefach'); return (m&&m.__role)||_roleByMat.get(m)||'gefach'; })() };   // der Wand-Stoff, den die L0 hinter dem Glas zeigt (der Innenkörper der L1 und des Fern-Fensters liest ihn)
}

    // ═══════════════════════════════════════════════════════════════════════
    //  DIE TEXTUR-BÄCKER — byte-treu (Läuferverband · Biberschwanz · Kellenwurf ·
    //  Quaderverband). document-gegated (try/catch → null): Worker/Node backen
    //  kartenlos, die Vertex-Farben tragen den Ton (die Karte nur ihr Relief, Kopf (d)).
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
  return _karte(cv); }catch(e){ return null; } }
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
  return _karte(cv); }catch(e){ return null; } }
    // prettier-ignore
    function texPutz(seed2){ try{                                                                /*TEXTUR-SAME PUTZ: Kellenwurf — koernige Sprenkel + horizontale Kellenzuege, deterministisch*/
  const cv=document.createElement('canvas'); cv.width=256; cv.height=256; const cx=cv.getContext&&cv.getContext('2d'); if(!cx) return null;
  let hh=(seed2*747796405)>>>0; const r2=()=>{hh^=hh<<13;hh^=hh>>>17;hh^=hh<<5;hh>>>=0;return (hh&0xffff)/0x10000;};
  cx.fillStyle='#ffffff'; cx.fillRect(0,0,256,256);
  for(let k=0;k<5200;k++){ const t=0.86+r2()*0.20; cx.fillStyle='rgba('+(255*t|0)+','+(255*t|0)+','+(252*t|0)+',0.5)';
    cx.fillRect((r2()*256)|0,(r2()*256)|0, 1+((r2()*2)|0), 1+((r2()*2)|0)); }
  for(let y=0;y<256;y+=9+((r2()*7)|0)){ cx.fillStyle='rgba(120,116,108,0.10)'; cx.fillRect(0,y,256,1); }
  return _karte(cv); }catch(e){ return null; } }
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
  return _karte(cv); }catch(e){ return null; } }
    // DAS KARTEN-GESETZ (A6, Kopf (d)): eine Karte trägt nur ihr Relief, nie die Farbe. Der Maler malt sRGB; die Karte liegt
    // LINEAR (die EINE Kurve `_lin`, je Kanal auf ihr Maximum gelegt), so mitteln ihre Mips linear — r128 dekodiert sRGB erst
    // im Shader und mittelte die Stufen im Gamma-Raum: Mörtel und Fugen fielen fern um 15 % (G) bis 17 % (B). Ihr Kehrwert
    // `__eins` (Maximum / lineares Mittel) legt `_karteEins` auf die Stoff-Farbe — Karte × Stoff hat in jeder Stufe das Mittel
    // der Farbe, die EINMAL im Vertex bzw. in der Toenung steht (das Gesetz des Blatt-Atlas der Foundry). Bis A6 trugen
    // ziegel/ziegel2/backstein ihren Grundton in der Karte UND im Vertex (Kultur) bzw. Stoff (tintM): das Dach maß im Labor
    // R 0,099 gegen 0,333 des Gesetzes, die Welt 0,318.
    // prettier-ignore
    function _karte(cv){ const W=cv.width, H=cv.height, d=cv.getContext('2d').getImageData(0,0,W,H).data, L=new Float64Array(256); for(let i=0;i<256;i++) L[i]=_lin(i/255);
  const sm=[0,0,0], mx=[1e-6,1e-6,1e-6]; for(let i=0;i<d.length;i+=4) for(let k=0;k<3;k++){ const v=L[d[i+k]]; sm[k]+=v; if(v>mx[k]) mx[k]=v; }
  const lin=new Uint8Array(W*H*4); for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=(y*W+x)*4, o=((H-1-y)*W+x)*4; for(let k=0;k<3;k++) lin[o+k]=Math.round(L[d[i+k]]/mx[k]*255); lin[o+3]=255; }   // Zeile 0 = v 0 (die Lage der Leinwand-Karte mit flipY)
  const tx=new THREE.DataTexture(lin,W,H,THREE.RGBAFormat); tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.magFilter=THREE.LinearFilter; tx.minFilter=THREE.LinearMipmapLinearFilter; tx.generateMipmaps=true; tx.needsUpdate=true;
  const n=W*H; tx.__eins=new THREE.Color(mx[0]*n/sm[0], mx[1]*n/sm[1], mx[2]*n/sm[2]); return tx; }
    // prettier-ignore
    function _karteEins(m){ if(m.map&&m.map.__eins) m.color.multiply(m.map.__eins); return m; }

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
    // DAS FARB-GESETZ der Architektur (05.10.): je Rolle das Hex als sRGB-ABSICHT (der Wähler, die Palette) — der Bake
    // (`_colFor`) und die Stoffe des Labors zeigen seinen LINEAREN Wert. Bis 05.10. las die Welt das Hex roh als linear:
    // Putz 0,89 statt 0,77, Holz 0,30 statt 0,06, Ziegel 0,35 statt 0,12 — das weiße Haus mit blassem Fachwerk.
    var _HEX = {};
    var _roleByMat = new Map();
    // DIE SEH-KLASSE je Rolle (Integration W8, rein additiv — docs/studio-vertrag.md B2c): was der Stoff dem AUGE ist
    // (phyto-core BUDGET_GESETZ.seh); das Budget-Gesetz am Studio-Ausgang faltet nur innerhalb EINER Klasse — das Glas
    // nie in den Putz, das Metall nie ins Holz, das Herdfeuer nie. Metallizität ≥ 0,5 ist metall (Beschläge); jedes Glas
    // (auch das ferne Spiegel-Glas) ist glas. Eine Rolle ohne Zeile reist ohne Klasse — das Gesetz meldet den BRUCH.
    var SEH_DER_ROLLE = {
        holz: "stoff",
        blockholz: "stoff",
        gefach: "stoff",
        stein: "stoff",
        ziegel: "stoff",
        boden: "stoff",
        glas: "glas",
        dunkel: "stoff",
        feuer: "glut",
        moebel: "stoff",
        metall: "metall",
        nagel: "stoff",
        lattung: "stoff",
        ziegel2: "stoff",
        backstein: "stoff",
        lehm: "stoff",
        putz: "stoff",
        dachmod: "stoff",
        gras: "stoff",
        weg: "stoff",
        laub: "stoff",
        stamm: "stoff",
        stroh: "stoff",
        kupfer: "stoff",
        glasdunkel: "glas",
        laternenglas: "glas",
        glasfern: "glas",
    };
    // prettier-ignore
    function materials(){ if(M) return M;
      _texBk=texZiegelwand(0x964e3e,7); _texZi=texDach(0x9c4a35,11); _texZi2=texDach(0x803a28,13); _texPu=texPutz(17); _texSt=texStein(23);
      M={
  holz:   new THREE.MeshStandardMaterial({color:0x5a4632,roughness:.88,metalness:0,vertexColors:true,side:THREE.DoubleSide}),
  blockholz: new THREE.MeshStandardMaterial({color:0x8a6a3e,roughness:.9,metalness:0,vertexColors:true,side:THREE.DoubleSide}),   // Blockholz-Wand: warmes Braun, vertexColors + material-basiertes tintWood = Patina wie holz, Kontrast zum Rahmen
  gefach: new THREE.MeshStandardMaterial({vertexColors:true,color:0xd9d0c1,roughness:.97,metalness:0,side:THREE.DoubleSide}),
  stein:  new THREE.MeshStandardMaterial({vertexColors:true,color:0x8d857a,map:_texSt||null,roughness:.96,metalness:0,side:THREE.DoubleSide}),   /*Quaderverband-Karte*/
  ziegel: new THREE.MeshStandardMaterial({color:0x9c4a35,map:_texZi||null,roughness:.82,metalness:0,side:THREE.DoubleSide}),
  boden:  new THREE.MeshStandardMaterial({color:0x7d5c39,roughness:.8,metalness:0,vertexColors:true}),
  glas:   new THREE.MeshStandardMaterial({color:0x33576a,roughness:.15,metalness:0,transparent:true,opacity:.42}),
  dunkel: new THREE.MeshStandardMaterial({color:0x14161a,roughness:1,metalness:0}),
  feuer:  new THREE.MeshStandardMaterial({color:0xff8636,emissive:0xff5212,emissiveIntensity:1.5,roughness:.7}),
  moebel: new THREE.MeshStandardMaterial({color:0x6a4a2c,roughness:.86,metalness:0,vertexColors:true}),
  metall: new THREE.MeshStandardMaterial({color:0x6b6b73,roughness:.5,metalness:.55}),
  nagel:  new THREE.MeshStandardMaterial({color:0x402c1c,roughness:.9,metalness:0,vertexColors:true}),
  lattung:new THREE.MeshStandardMaterial({color:0x967852,roughness:.9,metalness:0,vertexColors:true,side:THREE.DoubleSide}),
  ziegel2:new THREE.MeshStandardMaterial({color:0x803a28,map:_texZi2||null,roughness:.85,metalness:0,side:THREE.DoubleSide}),
  backstein:new THREE.MeshStandardMaterial({vertexColors:true,color:0x964e3e,map:_texBk||null,roughness:.92,metalness:0,side:THREE.DoubleSide}),
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
  laternenglas: new THREE.MeshStandardMaterial({color:0x33576a,roughness:.15,metalness:0,transparent:true,opacity:.42}),   // DAS GLAS DES LATERNEN-KOPFS: der Stoff des Fensterglases, das Datum der Laterne (__licht laterne)
  glasfern: new THREE.MeshStandardMaterial({color:0x46687e,roughness:.22,metalness:.45}),   // FERN-GLAS-GESETZ: Glas trägt fern als OPAKER Spiegelkörper — Transparenz ohne Innenleben liest sich als Geist
      };
      for(const _k in M) _roleByMat.set(M[_k],_k);
      for(const _k in M) if(SEH_DER_ROLLE[_k]) M[_k].userData.__seh=SEH_DER_ROLLE[_k];
      for(const _k in M){ _HEX[_k]=M[_k].color.getHex(); M[_k].color.convertSRGBToLinear(); _karteEins(M[_k]); }   // FARB-GESETZ (Architektur-Welle 05.10.): das Hex ist eine sRGB-ABSICHT — der Stoff zeigt seinen linearen Wert (r128 läse es roh), _HEX hält die Absicht für den Bake (_colFor)
      M.laternenglas.userData.__licht='laterne';                                               // der Kopf der Laterne glüht nach SEINEM Datum (LICHT_GESETZ.laterne: 1900 K, Zeitplan abends 1) — dasselbe Datum wie ihr Licht-Pool, nie die Fenster-Glut
      M.glas.userData.__licht='fenster';                           // DAS LEUCHTQUELLEN-GESETZ (K11): die wachen Fenster glühen nach dem Zeitplan LICHT_GESETZ.fenster (reist als mat.licht; das Schlaf-Glas bleibt dunkel)
      M.feuer.userData.__leucht=LEUCHT_FEUER;                                                  // DAS LEUCHT-GESETZ (05.10.): die Glut leuchtet in ihrer Vertex-Farbe — heiße Mitte, kühler Rand, gelbe Flammen-Wurzel, rote Spitze (reist als mat.leucht, die Welt webt emissiveNode = Farbe × LEUCHT_FEUER)
      return M; }
    // Die Stärke des Leuchtens: Leuchtdichte = lineare Vertex-Farbe × 2,5 (die Flammen-Wurzel 0,55/0,30/0,08 leuchtet
    // 1,4/0,75/0,2, die Glut-Mitte 0,75/0,25/0,08, ihr Rand 0,15/0,10/0,08). Bis 05.10. leuchtete jede Glut-Fläche gleich
    // (0xff5212 × 1,5) — das Bett las sich als cremige Scheibe, die Flamme als gelber Kegel.
    // prettier-ignore
    const LEUCHT_FEUER=2.5;
    // Das Labor (r128) liest dasselbe Gesetz: sein Standard-Shader nimmt die Vertex-Farbe als Leuchten (Lab = Welt).
    // prettier-ignore
    function _leuchtLab(m){ const k=m.userData.__leucht; m.onBeforeCompile=function(s){ s.fragmentShader=s.fragmentShader.replace('vec3 totalEmissiveRadiance = emissive;','vec3 totalEmissiveRadiance = emissive;\n#ifdef USE_COLOR\n\ttotalEmissiveRadiance = vColor * '+k.toFixed(3)+';\n#endif'); }; }
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
    // tintM — byte-treu Lab Z.1629; EINE dokumentierte Naht: materials() vorweg (M ist im Kern lazy). Zweite Naht
    // (FARB-GESETZ 05.10.): _setzeHex hält die sRGB-Absicht in _HEX und zeigt den linearen Wert.
    // prettier-ignore
    function _setzeHex(k,hx){ _HEX[k]=hx; M[k].color.setHex(hx).convertSRGBToLinear(); _karteEins(M[k]); }   // die Karte trägt nur ihr Relief (`_karte`): die Toenung steht EINMAL
    // prettier-ignore
    function tintM(col){ materials(); for(const k in DEFCOL){ if(M[k]) _setzeHex(k,(col&&col[k]!=null)?col[k]:DEFCOL[k]); } if(M.blockholz){ const _lh=(c,f)=>{const r=Math.min(255,((c>>16&255)*f)|0),g=Math.min(255,((c>>8&255)*f)|0),b=Math.min(255,((c&255)*f)|0);return (r<<16)|(g<<8)|b;}; const _hz=(col&&col.holz!=null)?col.holz:DEFCOL.holz; _setzeHex('blockholz',(col&&col.blockholz!=null)?col.blockholz:_lh(_hz,1.4)); } }
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
    //  fensterFern · fpVon · lod2Koerper (grundriss-treuer Fernkörper) ·
    //  mischeGeoms · hofFuer (Parzelle — Kern-Export für Sonde/Dorf, reist
    //  NICHT in buildInstance, s. Kopf (a)) · fragFuer (die EINE Stufen-Quelle).
    //  LOD1SKIP (Lab Z.1697) bleibt als ruhende Saat in der Shell (0 Leser).
    // ═══════════════════════════════════════════════════════════════════════
    // prettier-ignore
    const KULLVOL=0.012;
    // prettier-ignore
    const DESTNUR={fern:true,kaempfer:false,dachdeckung:false,dachwerk:false,fenster:false,gefache:false,boeden:false,innenwaende:false,treppe:false,moebel:false,geruest:false,zimmermann:false,tueren:false,anbau:false,balkon:false,portikus:false,veranda:false,terrasse:false,arkade:false,giebel:false,dachAlt:false}; // GIEBEL-KOPLANAR-FIX: DESTNUR-Giebelwände lagen EXAKT auf den dachPrisma-Gabeln (GEMESSEN: barock 21.7k / antike 13.5k Z-Fight-Paare auf Traufhöhe) — fern IST der Körper der Giebel   // Stufe 2: 6.7x — Kull-Opfer entstehen gar nicht erst. dachwerk AUS: nackte Sparren über dem dims-Körper lasen sich als Ruine — der Körper trägt das Dach
    // prettier-ignore
    const TURMNUR={fern:true,gefache:false,riegel:false,streben:false,zimmermann:false,fenster:false,geruest:false,boeden:false,innenwaende:false,treppe:false,moebel:false}; // Turm-Fassade: Paneele x 11 Geschosse waren die Masse
    // prettier-ignore
    const MASSNUR={geruest:false,riegel:false,streben:false,zimmermann:false,gefache:false,boeden:false,innenwaende:false,treppe:false,moebel:false}; // MASS-BUILD: 9 Verdichter aus, 4 Maß-Träger (dachdeckung/tueren/fenster/herd) eager — Δext=0 über 96 Kombos bewiesen                                                              // Destillat: Kleinst-Prims (Einzelziegel, Latten) fallen
    // prettier-ignore
    const _MM={};
    // prettier-ignore
    function _mmFor(role){ if(!_MM[role]){ const m=M[role].clone(); m.vertexColors=true; m.color=new THREE.Color(0xffffff); _karteEins(m); if(m.userData.__leucht) _leuchtLab(m); _MM[role]=m; } return _MM[role]; }
    // prettier-ignore
    const _ML={};
    // prettier-ignore
    function mLay(role){ if(!_ML[role]){ const m=M[role].clone(); m.vertexColors=false; _ML[role]=m; _roleByMat.set(m,role); } return _ML[role]; } // SCHWARZ-TOD-GESETZ: vertexColors-Material auf farbloser Geometrie = (0,0,0) im Browser — Layout-Bauten (Mauer/Brücke/Zaun/Spur/Stand/Hof) bauen mit VC-freien Zwillingen; Rolle bleibt registriert (Bake korrekt)
    // prettier-ignore
    const NOISEAMP={putz:0.07,stein:0.08,lehm:0.07,backstein:0.055,gefach:0.055,ziegel:0.045,ziegel2:0.045,stroh:0.08,boden:0.06,holz:0.035,stamm:0.05,blockholz:0.04,lattung:0.03,dachmod:0.025,kupfer:0.02,weg:0.05,gras:0.05,moebel:0.02}; // MATERIAL-ILLUSIONS-GESETZ: rollenklassige Rausch-Amplitude — Mineral atmet, Holz fein, Glas/Metall/dunkel NIE
    // prettier-ignore
    function _noise01(x,y,z){ const h=Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453; return h-Math.floor(h); }
    // prettier-ignore
    function _colFor(role,kol){   // DAS KARTEN-GESETZ (A6, Kopf (d)): der Vertex trägt die Farbe IMMER — im Labor wie im Worker (die Welt liest nur ihn), die Karte nur ihr Relief (`_karte`)
  const hx=(kol&&kol[role]!=null)?kol[role]:((DEFCOL[role]!=null)?DEFCOL[role]:(_HEX[role]!=null?_HEX[role]:0xffffff));
  let r=((hx>>16)&255)/255, g=((hx>>8)&255)/255, b=(hx&255)/255;
  if(role==='holz'||role==='stamm'||role==='blockholz'){ const lum=(r+g+b)/3;                 // BALKEN-LICHT-GESETZ: dunkle Holz-Paletten saufen unter Beleuchtung×ACES ins Schwarz ab (Michis „schwarze Balken auf weißer Fassade"); Luminanz-Boden 0.14 hebt sanft, Farbton bleibt, Kultur-Hierarchie bleibt (dunkel-Rolle unberührt)
    if(lum<0.14&&lum>0.001){ const f=0.14/lum; r=Math.min(1,r*f); g=Math.min(1,g*f); b=Math.min(1,b*f); } }
  return [_lin(r),_lin(g),_lin(b)]; }                                                          // FARB-GESETZ: die Absicht (sRGB, oben samt Balken-Boden) wird ihr linearer Wert — die Welt liest den Vertex linear
    // DIE EINE sRGB→linear-Kurve des Gesetzbuchs (IEC 61966-2-1), auf das Raster 2^-16 gelegt: Math.pow darf zwischen
    // V8-Bauten in der letzten Stelle abweichen, die Bytes nicht.
    // prettier-ignore
    function _lin(c){ const v=c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4); return Math.round(v*65536)/65536; }
    // prettier-ignore
    function _linHex(hx){ return [_lin(((hx>>16)&255)/255), _lin(((hx>>8)&255)/255), _lin((hx&255)/255)]; }
    // prettier-ignore
    function _baseFor(o,role,kol){ const b=_colFor(role,kol), f=o.userData&&o.userData.__fuge; if(!f||(M[role]&&M[role].map)) return b;   // FUGEN-TON (Flächen-Stufe, kartenlos): Stein-Anteil × Stein-Ton + Rest × Fugen-Ton — der Mittelton, den der Verband aus der Ferne zeigt
  const m2=_colFor(_roleByMat.get(f.mat)||'lehm',kol), a=f.anteil; return [b[0]*a+m2[0]*(1-a), b[1]*a+m2[1]*(1-a), b[2]*a+m2[2]*(1-a)]; }
    // prettier-ignore
    function bakeHaus(g,kol,geoms){
  const live=new Set(); g.traverse(o=>{ if(o.userData&&(o.userData.door||o.userData.window)) o.traverse(d=>live.add(d)); });
  g.updateMatrixWorld(true);
  const kill=[];
  g.traverse(o=>{ if(!o.isMesh||live.has(o)||!o.geometry||!o.geometry.attributes||!o.geometry.attributes.position) return;
    const role=_roleByMat.get(o.material)||'holz', G=geoms[role]||(geoms[role]={pos:[],nrm:[],col:[],idx:[],uv:[],vo:0});
    const pa=o.geometry.attributes.position, na=o.geometry.attributes.normal, ca=o.geometry.attributes.color;
    const e=o.matrixWorld.elements, base=_baseFor(o,role,kol), nv=pa.count;
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
    const LOD1S=Object.assign({},LOD1F,{herd:true,boeden:true,geruest:true});   // FLÄCHEN-STUFE: Stufe 1 trägt Schornstein (herd baut unter flaechig nur den Teil über Dach), Boden-Platten und den Ständer-/Rähm-Ring (sie schließen die Geschoss-Schlitze, durch die sonst der Innenkörper leuchtet) — das Bild springt bei 20 m nicht
    // DIE STUFE 1 BAUT NUR, WAS SIE ZEIGT (B3e): die Teilsysteme, die LOD1S verwirft (Gelände, Innenwände, Treppe, Möbel),
    // baut der Kern gar nicht erst (`MK`, LAZY-KERN) — die Fassade, der Innenkörper und der Ton byte-gleich (gate:fachwerk-contract).
    // prettier-ignore
    const L1NUR={gelaende:false,innenwaende:false,treppe:false,moebel:false};
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
    const e=o.matrixWorld.elements, base=_baseFor(o,role,kol), nv=pa.count;
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
    // ═══════════════════════════════════════════════════════════════════════
    //  DER STUFEN-TON (S8, material.K3): jede ferne Stufe zeigt die Albedo der nahen — gemessen, nie aus Rollen-Tönen
    //  vermutet. `sichtTon` ist die EINE Rechnung: was ein Auge von außen sieht (Z-Puffer, orthografisch, 9 Blicke —
    //  8 Seiten im Wechsel 14° und 31° über dem Horizont, dazu von oben, je 64²), je Blick-Klasse (wand |n.y| < 0,25,
    //  flach sonst) die mittlere Vertex-Farbe der tragenden Stoffe (Stoff und Metall; Glas und Glut tragen keinen Ton),
    //  übertragen wird die Leuchtdichte je Klasse.
    //  Das Soll misst sich im Warm-Pfad (`B.sichtTon`, sollTon); die Stufe 2 und die Hülle (Stufe 3, Fernform
    //  `__fern`) messen sich selbst und tragen je Klasse den Faktor Soll/Ist (`tonUebertrag`). Bis S8 kam der Ton der L2
    //  aus Rollen-Farben × EINEM Wand-Ton (`wandTonAus`, Fenster 2,6..Traufe): der Giebel trug die Dach-Farbe, das
    //  Erdgeschoss den Ton des Obergeschosses — L2/L0 0,704 (gotisch) bis 1,108 (pueblo), 31 von 64 Häusern im Band.
    // ═══════════════════════════════════════════════════════════════════════
    var SICHT_N = 64;
    // Die Achsen stehen als Zahlen (cos/sin von 22,5° + k · 45°), normiert mit der Wurzel: plattformgleich (IEEE rundet
    // sqrt exakt, Transzendente nie — die Plattform-Probe des Vertrags kippt cos/sin/hypot um 1 ULP).
    var SICHT_BLICKE = (function () {
        var c = 0.923880, s = 0.382683, b = [], ring = [[c, s], [s, c], [-s, c], [-c, s], [-c, -s], [-s, -c], [s, -c], [c, -s]];
        for (var a = 0; a < 8; a++) {
            var d = [ring[a][0], a % 2 ? 0.25 : 0.6, ring[a][1]],
                l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
            b.push([d[0] / l, d[1] / l, d[2] / l]);
        }
        b.push([0, 1, 0]);
        return b;
    })();
    function _tonTraegt(rolle) {
        var m = materials()[rolle];
        var seh = m && m.userData && m.userData.__seh;
        return !!m && !m.transparent && (seh === "stoff" || seh === "metall");
    }
    function _sichtKlasse(ny, l) {
        return l > 0 && Math.abs(ny / l) < 0.25 ? 0 : 1;
    }
    // geoms (je Rolle { pos, nrm, col, idx }, Welt-Lage) → { k: [[r, g, b, n] wand, [r, g, b, n] flach], alle: [r, g, b, n] }
    function sichtTon(geoms) {
        var Gs = [],
            tri = [],
            lo = [Infinity, Infinity, Infinity],
            hi = [-Infinity, -Infinity, -Infinity];
        for (var rolle in geoms) {
            var G = geoms[rolle];
            if (!G || !G.idx || !G.idx.length || !_tonTraegt(rolle)) continue;
            for (var i = 0; i + 2 < G.idx.length; i += 3) tri.push(Gs.length, G.idx[i], G.idx[i + 1], G.idx[i + 2]);
            Gs.push(G);
            for (var v = 0; v < G.pos.length; v += 3)
                for (var c = 0; c < 3; c++) {
                    if (G.pos[v + c] < lo[c]) lo[c] = G.pos[v + c];
                    if (G.pos[v + c] > hi[c]) hi[c] = G.pos[v + c];
                }
        }
        var aus = { k: [[0, 0, 0, 0], [0, 0, 0, 0]], alle: [0, 0, 0, 0] };
        if (!tri.length) return aus;
        // die Blick-Klasse je Dreieck (aus seiner Fläche, nie aus dem Blick) — einmal, nicht je Pixel
        var kl = new Int8Array(tri.length / 4);
        for (var t0 = 0; t0 < tri.length; t0 += 4) {
            var P0 = Gs[tri[t0]].pos,
                a0 = tri[t0 + 1] * 3,
                a1 = tri[t0 + 2] * 3,
                a2 = tri[t0 + 3] * 3;
            var e1 = [P0[a1] - P0[a0], P0[a1 + 1] - P0[a0 + 1], P0[a1 + 2] - P0[a0 + 2]],
                e2 = [P0[a2] - P0[a0], P0[a2 + 1] - P0[a0 + 1], P0[a2 + 2] - P0[a0 + 2]];
            var nx = e1[1] * e2[2] - e1[2] * e2[1],
                ny = e1[2] * e2[0] - e1[0] * e2[2],
                nz = e1[0] * e2[1] - e1[1] * e2[0];
            kl[t0 / 4] = _sichtKlasse(ny, Math.sqrt(nx * nx + ny * ny + nz * nz));
        }
        var mx = (lo[0] + hi[0]) / 2,
            my = (lo[1] + hi[1]) / 2,
            mz = (lo[2] + hi[2]) / 2;
        var dx = hi[0] - lo[0],
            dy = hi[1] - lo[1],
            dz = hi[2] - lo[2];
        var rad = Math.max(0.5, Math.sqrt(dx * dx + dy * dy + dz * dz) / 2);
        var N = SICHT_N,
            zb = new Float64Array(N * N),
            ti = new Int32Array(N * N),
            wb = new Float64Array(N * N * 2);
        // die Lage jeder Ecke im Blick, je Rolle und Blick EINMAL (vorher je Dreiecks-Ecke — dieselbe Rechnung, dieselben Bits)
        var PX = Gs.map(function (g) {
                return new Float64Array(g.pos.length / 3);
            }),
            PY = Gs.map(function (g) {
                return new Float64Array(g.pos.length / 3);
            }),
            PZ = Gs.map(function (g) {
                return new Float64Array(g.pos.length / 3);
            });
        var X = [0, 0, 0],
            Y = [0, 0, 0],
            Z = [0, 0, 0];
        for (var b = 0; b < SICHT_BLICKE.length; b++) {
            var f = SICHT_BLICKE[b];
            // die Achsen des Blicks: f zeigt zum Auge, r nach rechts, u nach oben
            var r = Math.abs(f[1]) > 0.99 ? [1, 0, 0] : [f[2], 0, -f[0]];
            var rl = Math.sqrt(r[0] * r[0] + r[2] * r[2]);
            r = [r[0] / rl, r[1] / rl, r[2] / rl];
            var u = [f[1] * r[2] - f[2] * r[1], f[2] * r[0] - f[0] * r[2], f[0] * r[1] - f[1] * r[0]];
            for (var gi = 0; gi < Gs.length; gi++) {
                var P = Gs[gi].pos;
                for (var q = 0, w = 0; q < P.length; q += 3, w++) {
                    var px = P[q] - mx,
                        py = P[q + 1] - my,
                        pz = P[q + 2] - mz;
                    PX[gi][w] = ((px * r[0] + py * r[1] + pz * r[2]) / rad) * 0.5 * N + 0.5 * N;
                    PY[gi][w] = ((px * u[0] + py * u[1] + pz * u[2]) / rad) * 0.5 * N + 0.5 * N;
                    PZ[gi][w] = px * f[0] + py * f[1] + pz * f[2];
                }
            }
            zb.fill(-Infinity);
            ti.fill(-1);
            for (var t = 0; t < tri.length; t += 4) {
                var g3 = tri[t];
                for (var e = 0; e < 3; e++) {
                    var iv = tri[t + 1 + e];
                    X[e] = PX[g3][iv];
                    Y[e] = PY[g3][iv];
                    Z[e] = PZ[g3][iv];
                }
                var den = (Y[1] - Y[2]) * (X[0] - X[2]) + (X[2] - X[1]) * (Y[0] - Y[2]);
                if (Math.abs(den) < 1e-12) continue;
                var x0 = Math.max(0, Math.floor(Math.min(X[0], X[1], X[2]))),
                    x1 = Math.min(N - 1, Math.ceil(Math.max(X[0], X[1], X[2]))),
                    y0 = Math.max(0, Math.floor(Math.min(Y[0], Y[1], Y[2]))),
                    y1 = Math.min(N - 1, Math.ceil(Math.max(Y[0], Y[1], Y[2])));
                for (var yy = y0; yy <= y1; yy++)
                    for (var xx = x0; xx <= x1; xx++) {
                        var sx = xx + 0.5,
                            sy = yy + 0.5;
                        var w0 = ((Y[1] - Y[2]) * (sx - X[2]) + (X[2] - X[1]) * (sy - Y[2])) / den,
                            w1 = ((Y[2] - Y[0]) * (sx - X[2]) + (X[0] - X[2]) * (sy - Y[2])) / den,
                            w2 = 1 - w0 - w1;
                        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
                        var zz = w0 * Z[0] + w1 * Z[1] + w2 * Z[2],
                            k = yy * N + xx;
                        if (zz > zb[k]) {
                            zb[k] = zz;
                            ti[k] = t;
                            wb[k * 2] = w0;
                            wb[k * 2 + 1] = w1;
                        }
                    }
            }
            for (var k2 = 0; k2 < N * N; k2++) {
                var t2 = ti[k2];
                if (t2 < 0) continue;
                var C2 = Gs[tri[t2]].col,
                    c0 = tri[t2 + 1] * 3,
                    c1 = tri[t2 + 2] * 3,
                    c2 = tri[t2 + 3] * 3;
                var S = aus.k[kl[t2 / 4]],
                    v0 = wb[k2 * 2],
                    v1 = wb[k2 * 2 + 1],
                    v2 = 1 - v0 - v1;
                for (var ch = 0; ch < 3; ch++) {
                    var cv = v0 * C2[c0 + ch] + v1 * C2[c1 + ch] + v2 * C2[c2 + ch];
                    S[ch] += cv;
                    aus.alle[ch] += cv;
                }
                S[3]++;
                aus.alle[3]++;
            }
        }
        return aus;
    }
    // DER WARM-PFAD (der EINE, S8): das Soll jeder Körper-Stufe ist die gemessene Stufe, die die Fassade ganz baut — die
    // flächige Stufe 1, am Turm die Stufe 0 (seine Stufe 1 ist selbst ein Körper: TURMNUR + lod2Koerper + fensterFern; ihr
    // Soll war sie selbst, hochhaus L1/L0 0,777 im Sicht-Ton, material.K3). Gemessen erst, wenn eine Körper-Stufe sie braucht
    // (eine gezeigte Stufe misst nichts): am Fragment im Fach, sonst baut der Bau sie einmal (das Fragment fällt, Wand-Ton
    // und Sicht-Ton bleiben am Bau). Jeder Turm, jedes Haus, Labor und Welt gleich.
    function sollTon(B) {
        if (!B.sichtTon) {
            var g = B.frag && B.fragStufe === 1 && !turmBau(B) ? B.frag : null;
            if (turmBau(B)) {
                var st = stufe0Bau(stufe0Param(Object.assign({}, B.p, { __sehne: undefined }))),
                    wrap = bauOrtWrap(B);
                wrap.add(st.g);
                wrap.updateMatrixWorld(true);
                bakeLOD(st.g, B.p.col, (g = {}), 0, true);
                st.g.traverse(function (o) {
                    if (o.geometry) o.geometry.dispose();
                });
            } else if (!g) {
                g = fragFuer(B, 1);
                B.frag = null;
                B.fragStufe = undefined;
            }
            B.sichtTon = sichtTon(g);
        }
        return B.sichtTon;
    }
    function turmBau(B) {
        return (B.p.storeys || 1) >= 6;
    }
    // Der Faktor je Klasse: die Leuchtdichte Soll/Ist (Rec. 709 — der Farbton jeder Stufe bleibt ihr eigener: die Scheibe der L2
    // zeigt den Raum dahinter in seiner Farbe, gate:haus-fern G), eine Klasse unter 1 % der gesehenen Pixel trägt den Faktor
    // des Ganzen; auf dem Raster 2^-10 — eine Drift der Eingänge um 1 ULP kippt fast nie einen Faktor (Plattform-Probe).
    // DAS GANZE HÄLT (material.K3): sieht die Stufe ihre Klassen in anderen Anteilen als ihr Soll (die Glas-Fassade der L2
    // verdeckt die Wand, die das Metall-Raster der L0 trägt: volle_moderne Wand 48 % gegen 66 %), träfe jede Klasse ihren Ton
    // und das Ganze nicht (L2/L0 0,824) — beide Faktoren tragen darum das Verhältnis Soll/Ist des Ganzen nach der Klassen-Wahl:
    // die Wand bleibt im Verhältnis zum Dach, die Albedo der Stufe ist die ihres Solls.
    function tonFaktoren(soll, ist) {
        var Y = function (s) {
            return (0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2]) / s[3];
        };
        var roh = function (s, i) {
            return s[3] && i[3] && Y(i) > 0 ? Y(s) / Y(i) : 1;
        };
        var q = [0, 1].map(function (k) {
            return soll.k[k][3] >= 0.01 * soll.alle[3] && ist.k[k][3] >= 0.01 * ist.alle[3] ? roh(soll.k[k], ist.k[k]) : roh(soll.alle, ist.alle);
        });
        var nach = 0;
        for (var k = 0; k < 2; k++) if (ist.k[k][3]) nach += Y(ist.k[k]) * ist.k[k][3] * q[k];
        nach = ist.alle[3] ? nach / ist.alle[3] : 0;
        var ganz = soll.alle[3] && nach > 0 ? Y(soll.alle) / nach : 1;
        return q.map(function (x) {
            x = Math.round(Math.min(4, Math.max(0.25, x * ganz)) * 1024) / 1024;
            return [x, x, x];
        });
    }
    // Die Stufe trägt den Ton ihres Solls: jede Ecke der tragenden Stoffe × den Faktor ihrer Klasse (nach ihrer Normale).
    function tonUebertrag(geoms, soll) {
        if (!soll || !soll.alle[3]) return geoms;
        var F = tonFaktoren(soll, sichtTon(geoms));
        for (var rolle in geoms) {
            var G = geoms[rolle];
            if (!G || !G.col || !_tonTraegt(rolle)) continue;
            for (var v = 0; v < G.col.length; v += 3) {
                var n0 = G.nrm[v],
                    n1 = G.nrm[v + 1],
                    n2 = G.nrm[v + 2];
                var f = F[_sichtKlasse(n1, Math.sqrt(n0 * n0 + n1 * n1 + n2 * n2))];
                G.col[v] *= f[0];
                G.col[v + 1] *= f[1];
                G.col[v + 2] *= f[2];
            }
        }
        return geoms;
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
    // DAS FENSTER JEDER STUFE (K38, 13.10.) — die Stufe wechselt die Kosten, nie das Material. Befund (Auge 1310 Nr. 11,
    // gate:haus-fern G): die L2 (und die L1 der Türme) legte die Fensterreihen als Bänder im Stoff `dunkel` (0x14161a) über
    // den Fernkörper — kein Glas, keine Glut: tags und nachts schwarze Streifen; an den Fenster-Pixeln Glas-Anteil 0, Glut 0.
    // Und der Schlaf der Fenster würfelte nur die L1 (in Lauf-Reihenfolge): nah wachten alle, ab 20 m schlief fast die Hälfte.
    // DER EINE WÜRFEL je Fenster aus Samen und Lage (Wand-Achse, Seite, Lage längs der Wand und Höhe auf 0,25 m): der Bau
    // jeder Stufe (fensterAt nah und mittel, fensterFern fern) fragt ihn — dasselbe Fenster schläft in jeder Stufe.
    var FENSTER_SCHLAF = 0.45;
    function fensterSchlaeft(seed, perp, wand, u, cy) {
        var h = Math.imul(((seed == null ? 3 : seed) | 0) ^ 0x632be5ab, 0x9e3779b1) ^ (perp === "x" ? 0x68e31da4 : 0x1b56c4e9) ^ (wand < 0 ? 0x2c1b3c6d : 0);
        h = Math.imul(h ^ Math.round(u * 4), 0x85ebca6b);
        h ^= h >>> 13;
        h = Math.imul(h ^ Math.round(cy * 4), 0xc2b2ae35);
        h ^= h >>> 16;
        return ((h >>> 0) & 0xffff) / 0x10000 < FENSTER_SCHLAF;
    }
    // DER INNENKÖRPER hinter dem Glas (INNENDÄMMER-GESETZ der L1, kalibriert auf die gemessene Voll-Interieur-Leuchtdichte
    // 176 vs 60 bei 0,34): der Raum × 0,92 — die L1 (der Körper hinter den Laibungen) und die Fern-Stufe (die Fläche hinter
    // der Scheibe) lesen dieselbe Zahl. DER RAUM ist die Wand von innen: der GEMESSENE Wand-Ton der L1 (`B.wandTon`, Gefach
    // und Balken, Backstein, Blockholz — gegen den Raum, den der Strahl der L0 durchs Fenster trifft: hollaendisch
    // 0,295/0,076/0,042 zu 0,294/0,072/0,039, italienisch 0,703/0,565/0,351 zu 0,626/0,511/0,322); der Turm ohne Flächen-Stufe
    // trägt den Wand-Stoff seines Stils (`H.raum`), wie sein Körper (`_wandFaktor`). Vorher stand dort Putz für jeden Stil
    // (Farbe gegen die L0 bis 0,34, gate:haus-fern G). Der Körper bakt im Stoff des Putzes: sein Ton ist der Faktor auf den Putz.
    var INNEN_DAEMMER = 0.92;
    function _innenFaktor(B, raum) {
        var pu = _colFor("putz", B.p.col),
            ra = B.wandTon || _colFor(raum || "putz", B.p.col);
        return [0, 1, 2].map(function (i) {
            return (ra[i] * INNEN_DAEMMER) / Math.max(1e-4, pu[i]);
        });
    }
    // DAS FERN-FENSTER: je Öffnung des Gesetzbuchs (`H.windows`, jede Art: Stockwerk, Giebel, Anbau) das Fenster der L0 in
    // ihren Kosten — der RAHMEN als Kasten vor der Wand (`w + 0,2` × `h + 0,2`, RAHMEN_TIEFE: Pfosten und Sturz der L0 stehen
    // 0,09 vor der Wand, die Bank 0,12; Front und die Seiten längs der Wand, im Rahmen-Stoff des Hauses — ist er kein Stoff, das Metall des
    // Glas-Stils, trägt der Stoff seinen Ton: kein eigener Befehl), davor die SCHEIBE der L0 (`w − 2·SCHEIBE_RAND`: die Scheibe
    // liegt im Flügel-Rahmen, windowSash sw 0,06) — der Innenkörper (der Raum × INNEN_DAEMMER) und das Glas (`glas`,
    // durchsichtig 0,42, glüht nach LICHT_GESETZ.fenster). Ein schlafendes Fenster trägt fern seine Mischung opak im Stoff
    // (`glasdunkel` deckt 0,92 über dem Raum — der Ton derselbe, ohne den Glas-Befehl). Steht die Dachhaut der L2 vor der
    // Wand (der Ortgang über dem Giebel, `_hautKappen`), steht das Fenster vor ihr — vorher lagen die Giebel-Fenster der L2
    // hinter ihr (holzhuette Glut 0). Vor der Scheibe das FENSTERKREUZ der L0 (windowSash: Pfosten und Kämpfer 0,04 m, im
    // Rahmen-Stoff). Die Fern-Stufe kostet Stoff + Glas, zwei Befehle; 14 bis 16 Dreiecke je Fenster.
    var RAHMEN_TIEFE = 0.1,
        SCHEIBE_RAND = 0.06,
        KREUZ = 0.02;
    // prettier-ignore
    function fensterFern(fen, B, geoms){
  const liste=fen&&fen.liste; if(!liste||!liste.length) return;
  const kol=B.p.col, pu=_colFor('putz',kol), rr=fen.rahmen||'holz', rStoff=SEH_DER_ROLLE[rr]==='stoff';
  const rahmenM=rStoff?M[rr]:M.putz, rahmenF=rStoff?[1,1,1]:_colFor(rr,kol).map((c,i)=>c/Math.max(1e-4,pu[i]));
  const innen=_innenFaktor(B,fen.raum), gd=_colFor('glasdunkel',kol), da=M.glasdunkel.opacity;
  const schlafF=[0,1,2].map(i=>(da*gd[i]+(1-da)*innen[i]*pu[i])/Math.max(1e-4,pu[i]));   // die Mischung, als Faktor auf den Putz-Ton
  const kappen=_hautKappen(B), grp2=new THREE.Group(), eins=[1,1,1];
  // Flächen aus Ecken, ohne Drehung (kein sin/cos im Bau — die Plattform-Ratsche v6 zählt jede Drift); die Wicklung folgt der Normale
  const teile=(Qs,mat,f)=>{ const pos=[],nrm=[],col=[],idx=[];
    for(const [Q,n] of Qs){ const v0=pos.length/3; for(const q of Q){ pos.push(q[0],q[1],q[2]); nrm.push(n[0],n[1],n[2]); col.push(f[0],f[1],f[2]); }
      const a=Q[0],b=Q[1],c=Q[2], x=(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1]), y=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]), z=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
      idx.push(...(x*n[0]+y*n[1]+z*n[2]>0?[v0,v0+1,v0+2,v0,v0+2,v0+3]:[v0,v0+2,v0+1,v0,v0+3,v0+2])); }
    const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); pg.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3)); pg.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); pg.setIndex(idx);
    grp2.add(new THREE.Mesh(pg,mat)); };
  for(const o of liste){ const z=o.perp==='z', s=o.s||(z?(o.cz<0?-1:1):(o.cx<0?-1:1)), u=z?o.cx:o.cz, schlaf=o.schlaf!=null?o.schlaf:fensterSchlaeft(B.p.seed,o.perp,s,u,o.cy);
    const e0=_fernVorn(kappen,o,s), P=(uu,y,d)=>z?[uu,y,e0+s*d]:[e0+s*d,y,uu], aus=z?[0,0,s]:[s,0,0], uR=z?[1,0,0]:[0,0,1];
    const rw=(o.w+0.2)/2, rh=(o.h+0.2)/2, y0=o.cy-rh, y1=o.cy+rh, d0=-0.02, d1=RAHMEN_TIEFE;   // der Kasten greift 2 cm in die Wand: keine Fuge zum Körper (der liegt 1,5 cm innen)
    teile([[[P(u-rw,y0,d1),P(u+rw,y0,d1),P(u+rw,y1,d1),P(u-rw,y1,d1)],aus],                // Front und die Seiten längs der Wand (Ober- und Unterseite sieht von der Gasse kein Pixel: 0,4 px bei 30 m)
      [[P(u-rw,y0,d0),P(u-rw,y1,d0),P(u-rw,y1,d1),P(u-rw,y0,d1)],uR.map(c=>-c)], [[P(u+rw,y0,d0),P(u+rw,y1,d0),P(u+rw,y1,d1),P(u+rw,y0,d1)],uR]], rahmenM, rahmenF);
    const pw=Math.max(0.1,o.w/2-SCHEIBE_RAND), ph=Math.max(0.1,o.h/2-SCHEIBE_RAND), scheibe=(d)=>[[P(u-pw,o.cy-ph,d),P(u+pw,o.cy-ph,d),P(u+pw,o.cy+ph,d),P(u-pw,o.cy+ph,d)],aus];
    if(schlaf) teile([scheibe(d1+0.01)], M.putz, schlafF);
    else { teile([scheibe(d1+0.01)], M.putz, innen); teile([scheibe(d1+0.02)], M.glas, eins); }
    const k=d1+0.03, q=(ua,ub,ya,yb)=>[[P(ua,ya,k),P(ub,ya,k),P(ub,yb,k),P(ua,yb,k)],aus];   // das Kreuz: der Pfosten durchgehend, der Kämpfer links und rechts von ihm
    teile([q(u-KREUZ,u+KREUZ,o.cy-ph,o.cy+ph), q(u-pw,u-KREUZ,o.cy-KREUZ,o.cy+KREUZ), q(u+KREUZ,u+pw,o.cy-KREUZ,o.cy+KREUZ)], rahmenM, rahmenF); }
  const wrap=bauOrtWrap(B); wrap.add(grp2); wrap.updateMatrixWorld(true);
  bakeLOD(grp2, kol, geoms, 0);
}
    // DIE DACHHAUT DER L2 (`_mitHaut`, lod2Koerper): der Keil um die Ziegel-Lage gehoben, der Ortgang über die Giebel verlängert.
    // prettier-ignore
    function _mitHaut(x){ if(!x.haut||x.teil.art!=='keil') return x.teil; const t=Object.assign({},x.teil), amX=(t.first==='+z'||t.first==='-z');
  t.c=[t.c[0],t.c[1]+x.haut.lift,t.c[2]]; t.h=amX?[t.h[0]+x.haut.ende,t.h[1],t.h[2]]:[t.h[0],t.h[1],t.h[2]+x.haut.ende]; return t; }
    // Ihre senkrechten, achsparallelen Stirnflächen (je Achse und Seite, die Ecken in der Wand-Ebene (u, y)) — wo eine vor der
    // Wand eines Fensters steht, steht das Fern-Fenster vor ihr (`_fernVorn`).
    // prettier-ignore
    function _hautKappen(B){ const aus=[];
  for(const x of koerperListe(B)){ if(!x.haut||x.teil.art!=='keil') continue; const t=_mitHaut(x);
    for(const Q of _keilFlaechen(t,false)){ let nx=0,ny=0,nz=0;
      for(let k=0;k<Q.length;k++){ const a=Q[k], b=Q[(k+1)%Q.length]; nx+=(a[1]-b[1])*(a[2]+b[2]); ny+=(a[2]-b[2])*(a[0]+b[0]); nz+=(a[0]-b[0])*(a[1]+b[1]); }
      const l=Math.hypot(nx,ny,nz); if(!(l>1e-9)||Math.abs(ny)>0.02*l) continue;
      const perp=Math.abs(nx)>Math.abs(nz)?'x':'z', i=perp==='x'?0:2, d=Q[0][i]; if(Q.some(q=>Math.abs(q[i]-d)>1e-6)) continue;
      aus.push({perp, s:d>t.c[i]?1:-1, d, Q:Q.map(q=>[perp==='z'?q[0]:q[2], q[1]])}); } }
  return aus; }
    // prettier-ignore
    function _fernVorn(kappen, o, s){ const z=o.perp==='z', u=z?o.cx:o.cz; let e=z?o.cz:o.cx;
  const drin=(Q,uu,y)=>{ let w=false; for(let i=0,j=Q.length-1;i<Q.length;j=i++){ const a=Q[i], b=Q[j]; if((a[1]>y)!==(b[1]>y) && uu<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) w=!w; } return w; };
  for(const k of kappen) if(k.perp===o.perp&&k.s===s&&s*k.d>s*e&&(drin(k.Q,u-1e-3,o.cy)||drin(k.Q,u+1e-3,o.cy))) e=k.d;   // die Mitte auf der First-Kante zweier Keile: eine Seite trägt sie
  return e; }
    // Die Öffnungen eines Stapel-Baus (`stapelBau`: der Aufsatz eines Turms steht um `off` höher) — die Liste des Fern-Fensters.
    function fensterVon(st){ const a=(st.H&&st.H.windows)||[], rahmen=(st.H&&st.H.rahmen)||'holz', raum=(st.H&&st.H.raum)||'gefach'; if(!st.topH||!st.topH.windows) return {liste:a, rahmen, raum}; return {liste:a.concat(st.topH.windows.map(function(o){ return Object.assign({},o,{cy:o.cy+st.off}); })), rahmen, raum}; }
    // prettier-ignore
    function fpVon(H){ const d=H.dims;                                                          // GRUNDRISS-QUELLE: Hauptkörper + Flügel-Rechtecke (lokal) — speist den silhouetten-treuen Fernkörper
  return [{x0:-d.W/2,x1:d.W/2,z0:-d.D/2,z1:d.D/2,eY:d.eaveY,rY:d.ridgeY}]
    .concat((H.wings||[]).map(w=>({x0:w.x0,x1:w.x1,z0:w.z0,z1:w.z1,eY:w.eY,rY:w.rY}))); }
    // ═══════════════════════════════════════════════════════════════════════
    //  DER FERNKÖRPER DES GESETZBUCHS — DIE EINE HÜLLEN-FORM (S3 haus, Plan §3.3, Lehre 19: die Kosten wohnen im
    //  Asset). Befund (Kern 78d66a63, gate:haus-fern): der alte Fernkörper las die Massen-Hülle `B.ext` statt des
    //  Grundrisses (32/32 Kulturen ein Quader, Tiefe Median +1,8 m aufgebläht, max +10,0 m marokkanisch — die
    //  Hofmauer), legte den First auf die lange Achse (30/62 quer zum Haus-Gesetz) und warf nie; die L2 trug ihn
    //  über ihrem Destillat. Jetzt liest er die MASSEN DES BAUS (`H.masse`, je Teil des Grundrisses Rechteck, Höhen,
    //  Dach — Haupt, Flügel, Anbau, Kamin, Hof-Arme, Turm, Portikus, Vordach, Kuppel, Terrassen, Rundbau) und legt
    //  die EINE Liste (`koerperListe`):
    //    { stufe, teile: [{ art: "box", c, h | art: "keil", c, h, first, walm? | art: "kapsel", a, b, r;
    //                       farbe (linear), rolle: "fest" | "sicht" | "beide" }] }
    //  asset-lokal, jede Zahl auf dem Raster 2^-12 (docs/studio-vertrag.md N5). Ein KEIL ist der Halbkeil des
    //  Welt-March: der Kasten c ± h, oben geschnitten von der Ebene vom First (die Kante `first` ∈ +x · −x · +z · −z,
    //  volle Höhe) zur Gegenkante (Höhe 0); ein Satteldach sind zwei Keile, deren Firste sich treffen. `walm` (0..1,
    //  P.hip) schneidet die zwei Stirnseiten quer zum First mit derselben Neigung: von (1 − walm) der Höhe an der
    //  Stirn bis zum First, der um walm × Tiefe kürzer wird (walm 1 über einem Quadrat: die Pyramide).
    //  Der Körper liegt INNEN (`KOERPER_INNEN`): jede Wand 1,5 cm hinter ihrer Grundriss-Ebene, jedes Dach 3 cm unter
    //  der Dachhaut — er wirft für jede Stufe (Stufe 3, nurWurf) ohne Akne und ohne Peter-Panning (gate:haus-fern I).
    //  Drei Leser, EINE Liste: die L2 bakt sie mit den Rollen-Stoffen über ihr Destillat (`lod2Koerper`), die Stufe 3
    //  ist ihr Gitter in EINEM Stoff (`huelleGeoms`, Vertex-Farbe = Rollen-Ton × wandTon), und sie reist als Beipack
    //  `__fern` (`huelle()`) — jenseits der Mesh-Zone zeichnet der Welt-March sie (fernform "huelle").
    // ═══════════════════════════════════════════════════════════════════════
    var HUELLE_RASTER = 4096;
    var KOERPER_INNEN = { wand: 0.015, dach: 0.03 };
    function _hr(v) {
        return Math.round(v * HUELLE_RASTER) / HUELLE_RASTER + 0;
    }
    function _hr3(a) {
        return [_hr(a[0]), _hr(a[1]), _hr(a[2])];
    }
    // Ein Teil der EINEN Form (der Kasten aus Grenzen, gerastert) — null, wo er nichts trägt.
    function huelleTeil(art, x0, x1, y0, y1, z0, z1, farbe, extra) {
        if (!(x1 - x0 > 0.02 && y1 - y0 > 0.02 && z1 - z0 > 0.02)) return null;
        var t = { art: art, c: _hr3([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]), h: _hr3([(x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2]) };
        if (extra) for (var k in extra) t[k] = extra[k];
        if (farbe) t.farbe = _hr3(farbe);
        t.rolle = (extra && extra.rolle) || "sicht";
        return t;
    }
    function huelleKapsel(a, b, r, farbe) {
        return { art: "kapsel", a: _hr3(a), b: _hr3(b), r: _hr(r), farbe: _hr3(farbe), rolle: "sicht" };
    }
    // DAS GRUND-DATUM (S4): der Grund eines Baus ist sein KÖRPER-SATZ — je Masse, die auf dem Boden steht (Haupthaus, Anbau,
    // Flügel, Hof-Arm, Turm, Rund), ihre Box haus-lokal [x0, x1, z0, z1, boden] auf dem Hüllen-Raster; boden 1: das Haus
    // zeichnet dort seinen Boden (Diele, Anbau-Estrich, Hof- und Flügel-Boden), 0: der Grund ist sein Boden (der Turm — seine
    // Geschossböden beginnen im ersten Stock —, das Rund — ein Kreis, keine Box —, das Pfahlhaus über dem Grund). Dazu der
    // Keller-Raum [x0, x1, z0, z1, y0, y1] (vom Kellerboden bis zur Decke auf Grade) oder null; `arten` nennt je Box ihre Masse. Nur die Basis des Stapels
    // steht auf dem Grund. Leser: exportSettlement (der Slot), der Slot des gesetzten Hauses (`slotPlan`), ortPlan (der
    // Erdbau `grund`, gelaende-core) und gate:haus-welt W9. Vorher reiste EINE Box (obb) und die Tür-Zeile — der Anbau und der Turm lagen
    // außerhalb jedes Grundrisses (Büschel im Anbau), der Keller war voll Erde.
    var GRUND_BODEN = { haupt: 1, anbau: 1, fluegel: 1, hofarm: 1, turm: 0, rund: 0 };
    function grundVon(st) {
        var H = st && st.H;
        var M = (H && H.masse) || [];
        var boxen = [];
        var arten = [];
        for (var i = 0; i < M.length; i++) {
            var m = M[i];
            if (!Object.prototype.hasOwnProperty.call(GRUND_BODEN, m.art) || !isFinite(m.x0) || !(m.x1 > m.x0) || !(m.z1 > m.z0)) continue;
            var boden = GRUND_BODEN[m.art] && !(m.art === "haupt" && m.y0 > 0.05) ? 1 : 0; // das Pfahlhaus (y0 über Grade) steht über dem Grund
            boxen.push([_hr(m.x0), _hr(m.x1), _hr(m.z0), _hr(m.z1), boden]);
            arten.push(m.art);
        }
        var k = H && H.cellar;
        return { boxen: boxen, arten: arten, keller: k ? [_hr(k.x0), _hr(k.x1), _hr(k.z0), _hr(k.z1), _hr(k.floorY - 0.12), 0] : null };
    }
    // Die Massen eines Stufe-0-Baus (`stapelBau`): die des Hauses, beim Turm-Stapel die des Aufsatzes um `off` gehoben.
    // DER KAMIN (die Spitze des Stapels, `H.chimney` — dieselbe Quelle wie B.chimney des Rauchs) gehört zu den Massen: jeder
    // Leser der Massen (Welt, Labor-Dorf, LOD-Sonde, Vertrag) trägt ihn, ohne B.chimney zu kennen.
    function masseVon(st) {
        var m = ((st && st.H && st.H.masse) || []).slice();
        var hc = st && st.H && st.H.chimney;
        if (hc && hc.min && hc.max) m.push({ art: "kamin", x0: hc.min[0], x1: hc.max[0], y0: hc.min[1], y1: hc.max[1], z0: hc.min[2], z1: hc.max[2] });
        if (!st || !st.topH) return m;
        var off = st.off || 0;
        var Y = ["y0", "y1", "eY", "rY", "egTop", "yB", "yT", "yLow", "yHigh", "yOut", "base", "springY", "spitze"];
        return m.concat(
            (st.topH.masse || []).map(function (x) {
                var c = Object.assign({}, x);
                for (var i = 0; i < Y.length; i++) if (Number.isFinite(c[Y[i]])) c[Y[i]] += off;
                if (c.gebaelk) c.gebaelk = { y0: c.gebaelk.y0 + off, y1: c.gebaelk.y1 + off, z0: c.gebaelk.z0, z1: c.gebaelk.z1 };
                return c;
            })
        );
    }
    // Die Wand-Rolle des Fernkörpers (die Stil-Hülle) und ihre Farbe: der Rollen-Ton × der GEMESSENE Fassaden-Ton
    // (`B.wandTon`, aus der Stufe-1-Fassade — dieselbe Klemme 0,25..1,7 wie der Bake der L2).
    function _wandRolle(p) {
        return p.stil === "klinker" ? "backstein" : p.stil === "huette" ? "holz" : p.stil === "glas" ? "glasfern" : p.stil === "alt" ? "gefach" : "putz";
    }
    function _wandFaktor(B, wr) {
        if (!B.wandTon) return null;
        var base = _colFor(wr, B.p.col);
        return [0, 1, 2].map(function (i) {
            return Math.min(1.7, Math.max(0.25, B.wandTon[i] / (base[i] || 0.01)));
        });
    }
    // DIE EINE LISTE: je Masse des Baus ihre Teile — [{ teil, rolle, faktor }] (rolle = der Stoff des Gesetzbuchs, aus
    // dem die Farbe kommt; der L2-Bake zeichnet mit ihm, `faktor` = der Wand-Ton). Haus-lokal (B.q trägt die Lage).
    // DIE ZEILE IST DER BAU-REGLER (Lehre 19): die Teile stehen nach RANG (`KOERPER_RANG`: Hauptkörper und Dach zuerst, die
    // Treppe zuletzt), und die Liste nimmt ein Teil nur, solange ihr Gitter in der Budget-Zeile der Stufe 3 bleibt (tris)
    // und der Welt-March ihre Teile trägt (24) — ein Teil, das nicht mehr passt, fällt, ein kleineres danach darf noch.
    var KOERPER_RANG = { haupt: 0, rund: 0, fluegel: 1, hofarm: 1, kuppel: 1, stufe: 1, turm: 1, anbau: 2, portikus: 2, vordach: 2, kamin: 3, sockel: 4, gaube: 5, treppe: 6 };
    var KOERPER_TEILE_MAX = 24;
    function koerperListe(B) {
        var roh = _koerperRoh(B);
        roh.sort(function (a, b) {
            return a.rang - b.rang || a.i - b.i;
        });
        var zeile = PORTAL_RENDER_CONFIG.lod.budget.haus[3];
        var soll = zeile && zeile.tris > 0 ? zeile.tris : Infinity;
        var aus = [];
        for (var k = 0; k < roh.length && aus.length < KOERPER_TEILE_MAX; k++) {
            var probe = aus.concat([roh[k]]);
            var G = { pos: [], nrm: [], idx: [] },
                alle = probe.map(function (x) {
                    return x.teil;
                });
            for (var j = 0; j < alle.length; j++) _teilGitter(alle[j], alle, G);
            if (G.idx.length / 3 <= soll) aus = probe;
        }
        return aus;
    }
    function _koerperRoh(B) {
        var p = B.p || {};
        var col = p.col || null;
        var IW = KOERPER_INNEN.wand,
            ID = KOERPER_INNEN.dach;
        var MS = B.masse;
        if (!Array.isArray(MS) || !MS.length) throw new Error("koerperListe: der Bau trägt keine Massen (B.masse)");
        var wr = _wandRolle(p);
        var wf = _wandFaktor(B, wr);
        var farbe = function (rolle, faktor) {
            var b = _colFor(rolle, col);
            return faktor ? [b[0] * faktor[0], b[1] * faktor[1], b[2] * faktor[2]] : b;
        };
        var aus = [];
        var rang = 0;
        var dazu = function (teil, rolle, faktor, haut) {
            if (teil) aus.push({ teil: teil, rolle: rolle, faktor: faktor || null, rang: rang, i: aus.length, haut: haut || null });
        };
        var wand = function (x0, x1, y0, y1, z0, z1, rolle) {
            var r = rolle || wr,
                f = rolle ? null : wf;
            dazu(huelleTeil("box", x0 + IW, x1 - IW, y0, y1, z0 + IW, z1 - IW, farbe(r, f)), r, f);
        };
        var keil = function (x0, x1, y0, y1, z0, z1, first, walm, rolle, haut) {
            dazu(huelleTeil("keil", x0, x1, y0, y1, z0, z1, farbe(rolle), walm > 0 ? { first: first, walm: _hr(walm) } : { first: first }), rolle, null, haut);
        };
        // Satteldach über [x0,x1] × [z0,z1] (schon nach innen gerückt), der First in der Mitte längs `achse`, die Traufe
        // auf yFuss, der First auf yFirst; zwei Halbkeile. `haut` (nur der L2-Bake, `lod2Koerper`): die Dachhaut über dem
        // Körper — der Ortgang steht um `ende` über die Giebel, die Ziegel-Lage um `lift` über der Ebene.
        var sattel = function (x0, x1, z0, z1, yFuss, yFirst, achse, walm, rolle, haut) {
            if (!(yFirst > yFuss + 0.05)) return;
            if (achse === "x") {
                var zm = (z0 + z1) / 2;
                keil(x0, x1, yFuss, yFirst, z0, zm, "+z", walm, rolle, haut);
                keil(x0, x1, yFuss, yFirst, zm, z1, "-z", walm, rolle, haut);
            } else {
                var xm = (x0 + x1) / 2;
                keil(x0, xm, yFuss, yFirst, z0, z1, "+x", walm, rolle, haut);
                keil(xm, x1, yFuss, yFirst, z0, z1, "-x", walm, rolle, haut);
            }
        };
        // die Dachhaut des Gesetzbuchs: die Ziegel liegen 0,08 m über der Ebene (eindeckenFlaeche `lift`), 3 cm stark — mit den
        // 3 cm des Körpers 0,125 m; der Ortgang je Dach (Haupt `ovRake`, Flügel 0,30, Hof-Arm 0,15)
        var HAUT_LIFT = ID + 0.095;
        var finde = function (art) {
            return MS.filter(function (m) {
                return m.art === art;
            });
        };
        // DAS SCHWUNGDACH (`curve`, das Verformungs-Feld des Gesetzbuchs): über der Traufe hebt das Feld jede Ecke um
        // cA · f^2,2 (cA = 1,35 · curve, f = |z| / (D/2)) — die Traufe steht um cA über der Ebene (chinesisch 1,28 m), die
        // Fläche hängt durch (konvex von unten). Der Körper bleibt darunter: das Satteldach der Ebene bis an die Wand (ohne
        // Überstand — die echte Traufe schwebt höher), je Traufseite ein Kasten bis zum TIEFSTEN Punkt der Kurve zwischen
        // fa (wo die Ebene ihn erreicht) und der Wand, und der gehobene Überstand als Keil (die Ebenen-Neigung) vor der
        // Wand (beide um IW nach innen). An den Walm-Enden endet der Kasten, wo die Walmfläche (samt Hub bei fa) unter seinen
        // Deckel fiele.
        var schwung = function (m, dr) {
            var hz = (m.z1 - m.z0) / 2,
                hx = (m.x1 - m.x0) / 2,
                dY = m.rY - m.eY,
                cA = 1.35 * m.curve,
                ov = m.ovZ || 0,
                mS = dY / Math.max(0.1, hz);
            var kurve = function (f) {
                return m.rY - dY * f + cA * Math.pow(Math.min(1, f), 2.2);
            };
            var fs = Math.min(1, Math.pow(dY / (2.2 * cA), 1 / 1.2));
            var yMin = Math.min(kurve(fs), kurve(1));
            var fa = Math.max(0, Math.min(1, (m.rY - yMin) / dY));
            var xe = hx - IW;
            if (m.hip > 0.001) {
                var rH = Math.max(0.25, hx - m.hip * hz),
                    hs = m.eY + (1 - m.hip) * dY,
                    noetig = yMin - cA * Math.pow(fa, 2.2) - hs;
                if (noetig > 0) xe = Math.min(xe, hx - (noetig / Math.max(0.01, m.rY - hs)) * (hx - rH));
            }
            sattel(m.x0 + IW, m.x1 - IW, m.z0 + IW, m.z1 - IW, m.eY - ID, m.rY - ID, "x", m.hip || 0, dr, { ende: (m.ovX || 0) + IW, lift: HAUT_LIFT });
            var hautU = { ende: (m.ovX || 0) + IW, lift: HAUT_LIFT };
            for (var sz = -1; sz <= 1; sz += 2) {
                var zi = sz * (fa * hz + IW),
                    zw = sz * (hz - IW),
                    zo = sz * (hz + ov);
                // (wand rückt x und z um IW ein: die Grenzen um IW geweitet, der Kasten liegt auf ±xe und zwischen fa und der Wand)
                if (xe > 0.3 && yMin - ID > m.eY) wand(-xe - IW, xe + IW, m.eY - ID, yMin - ID, Math.min(zi, zw) - IW, Math.max(zi, zw) + IW, dr);
                // der Überstand beginnt an der Wand (f = 1 − IW/hz, dort liegt die Kurve um ihren Hub-Rest tiefer als bei f = 1)
                var yo = kurve((hz - IW) / hz) - ID;
                if (ov > 0.05) keil(m.x0 + IW, m.x1 - IW, yo - (ov + IW) * mS, yo, Math.min(zw, zo), Math.max(zw, zo), sz > 0 ? "-z" : "+z", 0, dr, hautU);
            }
        };
        var vork = finde("vorkragung")[0] || null;
        var zinnen = finde("zinnen")[0] || null;
        var kuppel = finde("kuppel")[0] || null;
        var rund = finde("rund")[0] || null;
        var hatStufen = finde("stufe").length > 0;
        var hauptM = finde("haupt")[0] || null;
        var dachR = (hauptM && hauptM.dachRolle) || "ziegel";
        for (var i = 0; i < MS.length; i++) {
            var m = MS[i];
            rang = KOERPER_RANG[m.art] != null ? KOERPER_RANG[m.art] : 9;
            if (m.art === "haupt" && !rund) {
                var dr = m.dachRolle || "ziegel";
                var dach = String(m.dach || "sattel");
                // die Wand bis unter das Dach (beim Dom bis zur Springlinie der Trommel, bei Zinnen bis zur Brustwehr)
                var top = dach === "sattel" ? m.eY - ID : dach === "dome" && kuppel ? kuppel.springY - ID : zinnen ? zinnen.y1 - ID : hatStufen ? m.eY - 0.15 : m.eY + 0.1 - ID;
                if (vork && vork.y0 < top) {
                    wand(m.x0, m.x1, m.y0, vork.y0, m.z0, m.z1);
                    wand(m.x0 - vork.ov, m.x1 + vork.ov, vork.y0, top, m.z0 - vork.ov, m.z1 + vork.ov);
                } else wand(m.x0, m.x1, m.y0, top, m.z0, m.z1);
                var mS = (m.rY - m.eY) / Math.max(0.1, (m.z1 - m.z0) / 2);
                if (dach === "sattel" && m.curve > 0) schwung(m, dr);
                else if (dach === "sattel") {
                    // der Überstand der Traufe (er wirft das Traufschatten-Band)
                    var ov = m.ovZ || 0;
                    sattel(m.x0 + IW, m.x1 - IW, m.z0 - ov, m.z1 + ov, m.eY - ov * mS - ID, m.rY - ID, "x", m.hip || 0, dr, { ende: (m.ovX || 0) + IW, lift: HAUT_LIFT });
                } else if (dach.indexOf("alt:") === 0) {
                    var dt = dach.slice(4),
                        ex = (m.x1 - m.x0) / 2,
                        ez = (m.z1 - m.z0) / 2;
                    if (dt === "pyramide") sattel(m.x0 + IW, m.x1 - IW, m.z0 + IW, m.z1 - IW, top, m.eY + Math.max(2, 2 * ex * 0.42) - ID, "x", 1, dr);
                    else if (dt === "kegel") sattel(m.x0 + IW, m.x1 - IW, m.z0 + IW, m.z1 - IW, top, m.eY + Math.min(ex, ez) * 1.8 - ID, "x", 1, dr);
                    else if (dt === "mansard" || dt === "tonne")
                        sattel(m.x0 + IW, m.x1 - IW, m.z0 + IW, m.z1 - IW, top, (dt === "tonne" ? m.eY + ez : m.rY) - ID, "x", 0, dr);
                    else if (dt === "pult") keil(m.x0 + IW, m.x1 - IW, top, m.rY - ID, m.z0 + IW, m.z1 - IW, "+z", 0, dr);
                    else if (dt === "zwiebel") {
                        var rz = Math.min(ex, ez) * 0.9;
                        dazu(huelleKapsel([0, m.eY + rz * 0.9, 0], [0, m.eY + Math.min(ex, ez) * 1.7 - rz, 0], rz, farbe("kupfer")), "kupfer");
                    }
                    // flach · schmetterling: die Wand trägt ihr Deck
                }
            } else if (m.art === "fluegel") {
                wand(m.x0, m.x1, 0, m.rY != null ? m.eY - ID : m.eY + 0.1 - ID, m.z0, m.z1);
                if (m.rY != null) {
                    var quer = m.first === "z" ? m.x1 - m.x0 : m.z1 - m.z0,
                        pit = (m.rY - m.eY) / Math.max(0.1, quer / 2),
                        e = m.eOv || 0;
                    var hautF = { ende: 0.3 + IW, lift: HAUT_LIFT };
                    if (m.first === "z") sattel(m.x0 - e + IW, m.x1 + e - IW, m.z0 + IW, m.z1 - IW, m.eY - e * pit - ID, m.rY - ID, "z", 0, dachR, hautF);
                    else sattel(m.x0 + IW, m.x1 - IW, m.z0 - e + IW, m.z1 + e - IW, m.eY - e * pit - ID, m.rY - ID, "x", 0, dachR, hautF);
                }
            } else if (m.art === "anbau") {
                wand(m.x0, m.x1, 0, (m.flach ? m.yHigh : m.yLow) - ID, m.z0, m.z1, "holz");
                if (!m.flach)
                    keil(Math.min(m.xin, m.xoO) + IW, Math.max(m.xin, m.xoO) - IW, m.yOut - ID, m.yHigh - ID, m.z0 + IW, m.z1 - IW, m.sx > 0 ? "-x" : "+x", 0, "ziegel2");
            } else if (m.art === "hofarm") {
                wand(m.x0, m.x1, 0, m.rY != null ? m.eY - ID : m.eY + 0.12 - ID, m.z0, m.z1);
                if (m.rY != null) sattel(m.x0 + IW, m.x1 - IW, m.z0 + IW, m.z1 - IW, m.eY - ID, m.rY - ID, m.first, 0, dachR, { ende: 0.15 + IW, lift: HAUT_LIFT });
            } else if (m.art === "turm") {
                wand(m.x0, m.x1, 0, m.y1 - ID + (m.zinnen ? 1.85 : 0), m.z0, m.z1, "stein");
                if (m.spitze > 0) sattel(m.x0 + IW, m.x1 - IW, m.z0 + IW, m.z1 - IW, m.y1 - ID, m.y1 + m.spitze - ID, "x", 1, "ziegel");
            } else if (m.art === "vordach") {
                keil(m.x0 + IW, m.x1 - IW, m.yB - ID, m.yT - ID, m.z0 + IW, m.z1 - IW, m.first, 0, "ziegel");
                if (m.deck > 0) wand(m.x0, m.x1, 0, m.deck, m.z0, m.z1, "stein"); // das Deck der Veranda steht auf seinem Sockel
            } else if (m.art === "portikus") {
                var gb = m.gebaelk,
                    bs = m.basis;
                if (gb) wand(m.x0, m.x1, gb.y0, gb.y1 - ID, gb.z0, gb.z1, "putz");
                if (bs) wand(bs.x0, bs.x1, 0, bs.y1, bs.z0, bs.z1, "stein"); // Krepidoma, Stylobat und Vorplatz bis an die Wand
                sattel(m.x0 + IW, m.x1 - IW, m.z0 + IW, m.z1 - IW, m.yB - ID, m.yT - ID, "z", 0, "ziegel");
            } else if (m.art === "kuppel") {
                var r0 = m.rad * 0.95,
                    ya = m.springY + m.rad * 0.35,
                    yb = Math.max(ya, m.y1 - r0 - ID);
                dazu(huelleKapsel([0, ya, 0], [0, yb, 0], r0, farbe("kupfer")), "kupfer");
            } else if (m.art === "stufe") {
                wand(m.x0, m.x1, m.y0, m.y1 - ID, m.z0, m.z1, p.stil === "stein" || p.stil === "klinker" ? "putz" : "stein");
            } else if (m.art === "sockel") {
                wand(m.x0, m.x1, m.y0, m.y1, m.z0, m.z1, "stein");
            } else if (m.art === "treppe") {
                keil(m.x0 + IW, m.x1 - IW, m.y0, m.y1 - ID, m.z0 + IW, m.z1 - IW, m.first, 0, "stein");
            } else if (m.art === "gaube") {
                wand(m.x0, m.x1, m.y0, m.y1 - ID, m.z0, m.z1);
            } else if (m.art === "rund") {
                var rr = m.rad - IW,
                    hoch = m.y1 - m.y0;
                if (hoch >= 2 * rr) dazu(huelleKapsel([0, m.y0 + rr, 0], [0, m.y1 - rr, 0], rr, farbe(wr, wf)), wr, wf);
                else wand(-rr * 0.7071, rr * 0.7071, m.y0, m.y1 - ID, -rr * 0.7071, rr * 0.7071);
                if (m.zwiebel) {
                    var rk = m.rad * 0.85;
                    dazu(huelleKapsel([0, m.y1 + rk * 0.8, 0], [0, Math.max(m.y1 + rk * 0.8, m.spitze - rk), 0], rk, farbe("kupfer")), "kupfer");
                } else sattel(-rr * 0.7071, rr * 0.7071, -rr * 0.7071, rr * 0.7071, m.y1 - ID, m.spitze - ID, "x", 1, "ziegel");
            }
        }
        // DER KAMIN (`B.chimney`, die Spitze des Stapels) — er wirft seinen Schlagschatten aufs Dach
        rang = KOERPER_RANG.kamin;
        var c = finde("kamin")[0];
        if (c) dazu(huelleTeil("box", c.x0 + IW, c.x1 - IW, c.y0, c.y1 - ID, c.z0 + IW, c.z1 - IW, farbe("stein")), "stein");
        return aus;
    }
    // Die Flächen eines Teils (Polygone, Ecken außen herum): der Kasten mit seinen Seiten (der Boden liegt auf dem Grund
    // oder einem Nachbarn) und seinem Deckel, wo kein Keil auf ihm sitzt; der Keil mit Schräge, Rücken, Stirnen und
    // Walm-Flächen; die Kapsel als Achteck-Prisma mit Kegel-Kappen. Gitter-Regel des Fernkörpers (L2, Stufe 3).
    function _keilFlaechen(t, boden) {
        var c = t.c,
            h = t.h,
            f = t.first,
            w = Math.max(0, Math.min(1, t.walm || 0));
        var amX = f === "+z" || f === "-z"; // der First liegt längs x
        var hU = amX ? h[0] : h[2],
            run = 2 * (amX ? h[2] : h[0]),
            yB = c[1] - h[1],
            yT = c[1] + h[1],
            H = 2 * h[1];
        // (U längs des Firsts, V vom First zur Traufe, y) → Welt
        var P = function (U, V, y) {
            if (f === "+z") return [c[0] + U, y, c[2] + h[2] - V];
            if (f === "-z") return [c[0] + U, y, c[2] - h[2] + V];
            if (f === "+x") return [c[0] + h[0] - V, y, c[2] + U];
            return [c[0] - h[0] + V, y, c[2] + U];
        };
        // der Boden (die Untersicht des Überstands) nur, wo der Keil gesehen wird (L2) — der Wurf braucht ihn nie
        var F = boden ? [[P(-hU, 0, yB), P(-hU, run, yB), P(hU, run, yB), P(hU, 0, yB)]] : [];
        if (!(w > 0)) {
            F.push([P(-hU, 0, yT), P(hU, 0, yT), P(hU, run, yB), P(-hU, run, yB)]);
            F.push([P(-hU, 0, yB), P(hU, 0, yB), P(hU, 0, yT), P(-hU, 0, yT)]);
            F.push([P(hU, 0, yB), P(hU, run, yB), P(hU, 0, yT)]);
            F.push([P(-hU, 0, yB), P(-hU, 0, yT), P(-hU, run, yB)]);
            return F;
        }
        var v1 = w * run,
            yW = yB + (1 - w) * H,
            rH = Math.max(0, hU - w * run);
        F.push([P(-rH, 0, yT), P(rH, 0, yT), P(hU, v1, yW), P(hU, run, yB), P(-hU, run, yB), P(-hU, v1, yW)]);
        F.push([P(-hU, 0, yB), P(hU, 0, yB), P(hU, 0, yW), P(rH, 0, yT), P(-rH, 0, yT), P(-hU, 0, yW)]);
        if (w < 1) {
            F.push([P(hU, 0, yB), P(hU, run, yB), P(hU, v1, yW), P(hU, 0, yW)]);
            F.push([P(-hU, 0, yB), P(-hU, 0, yW), P(-hU, v1, yW), P(-hU, run, yB)]);
        }
        F.push([P(hU, 0, yW), P(hU, v1, yW), P(rH, 0, yT)]);
        F.push([P(-hU, 0, yW), P(-rH, 0, yT), P(-hU, v1, yW)]);
        return F;
    }
    function _kapselFlaechen(t) {
        var a = t.a,
            b = t.b,
            r = t.r,
            n = 8;
        var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]],
            l = Math.hypot(d[0], d[1], d[2]);
        var ax = l > 1e-6 ? [d[0] / l, d[1] / l, d[2] / l] : [0, 1, 0];
        var u = Math.abs(ax[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        var e1 = [ax[1] * u[2] - ax[2] * u[1], ax[2] * u[0] - ax[0] * u[2], ax[0] * u[1] - ax[1] * u[0]],
            l1 = Math.hypot(e1[0], e1[1], e1[2]);
        e1 = [e1[0] / l1, e1[1] / l1, e1[2] / l1];
        var e2 = [ax[1] * e1[2] - ax[2] * e1[1], ax[2] * e1[0] - ax[0] * e1[2], ax[0] * e1[1] - ax[1] * e1[0]];
        var ring = function (o) {
            var R = [];
            for (var k = 0; k < n; k++) {
                var s = (2 * Math.PI * k) / n;
                R.push([o[0] + r * (Math.cos(s) * e1[0] + Math.sin(s) * e2[0]), o[1] + r * (Math.cos(s) * e1[1] + Math.sin(s) * e2[1]), o[2] + r * (Math.cos(s) * e1[2] + Math.sin(s) * e2[2])]);
            }
            return R;
        };
        var A = ring(a),
            B = ring(b),
            ta = [a[0] - ax[0] * r, a[1] - ax[1] * r, a[2] - ax[2] * r],
            tb = [b[0] + ax[0] * r, b[1] + ax[1] * r, b[2] + ax[2] * r];
        var F = [];
        for (var k = 0; k < n; k++) {
            var k2 = (k + 1) % n;
            if (l > 1e-6) F.push([A[k], A[k2], B[k2], B[k]]);
            F.push([ta, A[k2], A[k]]);
            F.push([tb, B[k], B[k2]]);
        }
        return F;
    }
    // Liegt der Deckel eines Kastens unter Keilen (der Dach-Fuß unter, der First über ihm, sein Rechteck von ihren
    // Grundrissen gedeckt)? Dann ist er innen und trägt kein Gitter.
    function _deckelGedeckt(t, alle) {
        var top = t.c[1] + t.h[1];
        var keile = alle.filter(function (k) {
            return k.art === "keil" && k.c[1] - k.h[1] <= top + 0.01 && k.c[1] + k.h[1] >= top;
        });
        if (!keile.length) return false;
        var ex = t.h[0] - 0.01,
            ez = t.h[2] - 0.01;
        for (var i = -1; i <= 1; i++)
            for (var j = -1; j <= 1; j++) {
                var x = t.c[0] + i * ex,
                    z = t.c[2] + j * ez;
                var drin = keile.some(function (k) {
                    return Math.abs(x - k.c[0]) <= k.h[0] + 0.02 && Math.abs(z - k.c[2]) <= k.h[2] + 0.02;
                });
                if (!drin) return false;
            }
        return true;
    }
    function teilFlaechen(t, alle, sicht) {
        if (t.art === "keil") return _keilFlaechen(t, sicht);
        if (t.art === "kapsel") return _kapselFlaechen(t);
        var c = t.c,
            h = t.h,
            x0 = c[0] - h[0],
            x1 = c[0] + h[0],
            y0 = c[1] - h[1],
            y1 = c[1] + h[1],
            z0 = c[2] - h[2],
            z1 = c[2] + h[2];
        var F = [
            [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]],
            [[x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1]],
            [[x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1]],
            [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]],
        ];
        if (!_deckelGedeckt(t, alle)) F.push([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]);
        return F;
    }
    // Ein Teil als Dreiecke (je Fläche eigene Ecken, harte Kanten): die Fläche zeigt von der Mitte des Teils weg (Newell).
    function _teilGitter(t, alle, out, sicht) {
        var mitte = t.art === "kapsel" ? [(t.a[0] + t.b[0]) / 2, (t.a[1] + t.b[1]) / 2, (t.a[2] + t.b[2]) / 2] : t.c;
        var F = teilFlaechen(t, alle, sicht);
        for (var i = 0; i < F.length; i++) {
            var Q = F[i].filter(function (q, k, A) {
                var v = A[(k + A.length - 1) % A.length];
                return Math.abs(q[0] - v[0]) + Math.abs(q[1] - v[1]) + Math.abs(q[2] - v[2]) > 1e-6;
            });
            if (Q.length < 3) continue;
            var nx = 0,
                ny = 0,
                nz = 0,
                cx = 0,
                cy = 0,
                cz = 0;
            for (var k = 0; k < Q.length; k++) {
                var a = Q[k],
                    b = Q[(k + 1) % Q.length];
                nx += (a[1] - b[1]) * (a[2] + b[2]);
                ny += (a[2] - b[2]) * (a[0] + b[0]);
                nz += (a[0] - b[0]) * (a[1] + b[1]);
                cx += a[0];
                cy += a[1];
                cz += a[2];
            }
            var l = Math.hypot(nx, ny, nz);
            if (!(l > 1e-9)) continue;
            nx /= l;
            ny /= l;
            nz /= l;
            if ((cx / Q.length - mitte[0]) * nx + (cy / Q.length - mitte[1]) * ny + (cz / Q.length - mitte[2]) * nz < 0) {
                Q = Q.slice().reverse();
                nx = -nx;
                ny = -ny;
                nz = -nz;
            }
            var v0 = out.pos.length / 3;
            for (k = 0; k < Q.length; k++) {
                out.pos.push(Q[k][0], Q[k][1], Q[k][2]);
                out.nrm.push(nx, ny, nz);
            }
            for (k = 1; k < Q.length - 1; k++) out.idx.push(v0, v0 + k, v0 + k + 1);
        }
    }
    // DIE STUFE 3 (nurWurf): die Liste als EIN Gitter in EINEM Stoff (Rolle putz, Vertex-Farbe = die Farbe des Teils),
    // in der Lage des Baus (`q` = B.q: Gier um y, dann Ort — der Labor-Dorf mischt die Stufe 3 vieler Häuser), auf dem
    // Raster 2^-12 (Normalen 2^-14) — die Rollen-Geoms der Stufe (eine Rolle).
    function huelleGeoms(teile, geoms, q) {
        var G = { pos: [], nrm: [], col: [], idx: [], uv: [], vo: 0 };
        for (var i = 0; i < teile.length; i++) {
            var t = teile[i],
                n0 = G.pos.length / 3;
            _teilGitter(t, teile, G);
            var f = t.farbe || [1, 1, 1];
            for (var v = n0; v < G.pos.length / 3; v++) G.col.push(f[0], f[1], f[2]);
        }
        if (q && (q.phi || q.x || q.z)) {
            var cs = Math.cos(q.phi || 0),
                sn = Math.sin(q.phi || 0);
            for (var j = 0; j < G.pos.length; j += 3) {
                var x = G.pos[j],
                    z = G.pos[j + 2],
                    nx = G.nrm[j],
                    nz = G.nrm[j + 2];
                G.pos[j] = x * cs + z * sn + (q.x || 0);
                G.pos[j + 2] = -x * sn + z * cs + (q.z || 0);
                G.nrm[j] = nx * cs + nz * sn;
                G.nrm[j + 2] = -nx * sn + nz * cs;
            }
        }
        for (var k = 0; k < G.pos.length; k++) {
            G.pos[k] = _hr(G.pos[k]);
            G.nrm[k] = Math.round(G.nrm[k] * 16384) / 16384 + 0;
            G.col[k] = _hr(G.col[k]);
        }
        G.vo = G.pos.length / 3;
        geoms = geoms || {};
        geoms.putz = G;
        return geoms;
    }
    // Der L2-Körper: dieselbe Liste mit den Rollen-Stoffen des Gesetzbuchs gebakt (Kontakt-AO, Material-Illusion, Welt-
    // UV — `bakeLOD`), in der Lage des Baus (B.q). Die Wand trägt den gemessenen Ton als Vertex-Faktor.
    // prettier-ignore
    function lod2Koerper(B, geoms){
  const liste=koerperListe(B), alle=liste.map(x=>x.teil), grp2=new THREE.Group();
  for(const x of liste){ const G={pos:[],nrm:[],idx:[]}; _teilGitter(_mitHaut(x), alle, G, true); if(!G.pos.length) continue;   // DIE DACHHAUT (nur sichtbar, die L2)
    const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(G.pos,3)); bg.setAttribute('normal',new THREE.Float32BufferAttribute(G.nrm,3)); bg.setIndex(G.idx);
    if(x.faktor){ const n=G.pos.length/3, att=new Float32Array(n*3); for(let i=0;i<n;i++){ att[i*3]=x.faktor[0]; att[i*3+1]=x.faktor[1]; att[i*3+2]=x.faktor[2]; } bg.setAttribute('color',new THREE.Float32BufferAttribute(att,3)); }
    grp2.add(new THREE.Mesh(bg, M[x.rolle]||M.putz)); }
  const wrap=bauOrtWrap(B); wrap.add(grp2); wrap.updateMatrixWorld(true);
  bakeLOD(grp2, B.p.col, geoms, 0);
}
    // Die Hülle eines Baus in der EINEN Form: die Liste des Fernkörpers (Stufe 3, rolle "sicht").
    function huelleVonBau(B) {
        return {
            stufe: 3,
            teile: koerperTeile(B),
        };
    }
    // DIE TEILE DER HÜLLE IM TON IHRES SOLLS (S8, `sollTon`): je Teil seine Farbe × den Faktor seiner Blick-Klassen (`tonFaktoren`
    // der Hülle gegen `B.sichtTon`), gewichtet nach den Flächen, die ein Auge an ihm sieht — der Kasten vier Wände und
    // den Deckel, Keil und Kapsel ihre Schräge. Gitter (Stufe 3) und Fernform (`__fern`, der Welt-March) lesen DIESE Liste.
    function koerperTeile(B) {
        if (B.koerperTeile) return B.koerperTeile;
        var soll = sollTon(B);
        var teile = koerperListe(B).map(function (x) {
            return x.teil;
        });
        if (soll.alle[3]) {
            var F = tonFaktoren(soll, sichtTon(huelleGeoms(teile, {}, B.q)));
            teile = teile.map(function (t) {
                if (!t.farbe) return t;
                var aw = t.art === "box" ? 4 * t.h[1] * (t.h[0] + t.h[2]) : 0,
                    af = t.art === "box" ? t.h[0] * t.h[2] : 1,
                    n = Object.assign({}, t);
                n.farbe = _hr3([0, 1, 2].map(function (c) {
                    return (t.farbe[c] * (aw * F[0][c] + af * F[1][c])) / (aw + af);
                }));
                return n;
            });
        }
        return (B.koerperTeile = teile);
    }
    // Die Solids eines Baus (Zahlen-Zeile [x0,y0,z0,x1,y1,z1]…, Welle L) in der EINEN Form: je Box ein Teil, rolle "fest".
    function huelleAusBoxen(stufe, boxen) {
        var teile = [];
        for (var i = 0; i + 5 < boxen.length; i += 6) {
            var t = huelleTeil("box", boxen[i], boxen[i + 3], boxen[i + 1], boxen[i + 4], boxen[i + 2], boxen[i + 5], null, { rolle: "fest" });
            if (t) teile.push(t);
        }
        return { stufe: stufe, teile: teile };
    }
    // DIE STUFE 3 WIRFT MIT DEM EINEN SCHATTEN-STOFF (das Wurf-Gesetz E1): jede Ecke deckt ganz (`aDeckt` 1 — der Stoff
    // des Wirts: Alpha = max(aDeckt, Atlas-Alpha)), und ihr Stoff IST der Schatten-Stoff — unsichtbar, beidseitig,
    // alphaTest 0,5, gestempelt `userData.__stoff = "schatten"` (die Brücke reicht ihn als kind "schatten": dieselbe
    // Material-Identität wie der Schatten-Teil der Baum-L1, EIN Programm in den Kaskaden). Beidseitig, weil die offenen
    // Flächen des Fernkörpers (der Keil ohne Boden, Plane, Dach) von beiden Seiten werfen müssen.
    var _wurfStoff = null;
    function wurfStoff() {
        if (!_wurfStoff) {
            _wurfStoff = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide, alphaTest: 0.5 });
            _wurfStoff.userData.__stoff = "schatten";
            // die Seh-Klasse (der Budget-Ausgang verlangt sie je Stoff): das Matte — der Stoff faltet mit nichts
            _wurfStoff.userData.__seh = "stoff";
        }
        return _wurfStoff;
    }
    function stufeWirft(g) {
        g.traverse(function (o) {
            if (!(o.isMesh && o.geometry && o.geometry.attributes.position)) return;
            var n = o.geometry.attributes.position.count;
            o.geometry.setAttribute("aDeckt", new THREE.Float32BufferAttribute(new Float32Array(n).fill(1), 1));
            // die Atlas-Lage des Schatten-Stoffs (er schneidet die Baum-Karte aus dem EINEN Atlas): die Stufe 3 trägt 0 — die
            // Deckung 1 gewinnt (max), und der Stoff liest dieselbe Attribut-Form wie der Schatten-Teil der Baum-L1
            if (!o.geometry.attributes.uv) o.geometry.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
            o.material = wurfStoff();
            o.castShadow = true;
        });
    }
    // B2 der Hülle: huelle(rezeptId, seed, ov?) → { stufe: 3, teile } — der Fernkörper jeder fachwerk-Art (das Haus aus den
    // Massen seines Baus, die Ausstattung aus ihrer Grundform): dieselbe Liste, die die Stufe 3 als Beipack `__fern` trägt
    // und aus der sie ihr Gitter baut. null: kein Rezept.
    function huelle(rezeptId, seed, ov) {
        var pre = PRESETS[rezeptId];
        if (!pre) return null;
        if (pre.kind === "ausstattung") return ausHuelleFuer(rezeptId, seed, ov);
        materials();
        var p = hausParams(pre, ov || null);
        var sd = Number(seed);
        if (isFinite(sd) && !(ov && typeof ov === "object" && ov.seed != null)) p.seed = sd;
        return huelleVonBau(planBau(p));
    }
    // prettier-ignore
    // DER BAU-ORT (K10): der Rahmen, in dem ein Haus der Siedlung bakt — Gier phi, Ort x/z und sein BODEN y (der Plan v2,
    // fachwerk `ortPlan`: das Labor setzt q.y = Slot-y − Bezug; die Einzel-Sonde und der Vertrag stehen auf y = 0). Fail-
    // closed: ein Bau-Ort ohne Höhe wirft (vorher stand jedes Haus auf y = 0, gleich wo sein Grund lag). Leser: fragFuer,
    // hofFuer und die Stufen-Bakes.
    function bauOrtWrap(B){
      if(!B||!B.q||!Number.isFinite(B.q.y)) throw new Error("fachwerk: der Bau-Ort q trägt keine Höhe y (der Boden des Hauses)");
      const w=new THREE.Group(); w.rotation.y=B.q.phi; w.position.set(B.q.x,B.q.y,B.q.z); return w; }
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
  /*SCHICHT-2: die WANDLATERNE neben der Tuer von Gasthaus und Schmiede reist seit K66-2 mit dem Dorf-Licht (wandLaternen: die Gestalt wandlaterne mit ihrem Licht an der Wand des Kerns) — bis K66-2 ein Glas-Kopf ohne Lichtquelle vor der Traufe*/
  if((B.p.baujahr||1900)<1800 && rnd()<0.35){ const ex3=(rnd()<0.5)?e.x0-0.03:e.x1+0.03;      // SCHICHT-2: EFEU — das Alter begrünt die Wetterecke
    for(let k3=0;k3<3;k3++) box(ex3, 0.7+k3*1.05+rnd()*0.3, e.z1-0.5-k3*0.4-rnd()*0.5, 0.1, 0.9+rnd()*0.5, 0.5+rnd()*0.4, M.laub); }
  if(rolle==='schmiede'){ box(e.x1+0.7, 0.24, e.z0+0.6, 1.35,0.42,0.5, mLay('stein')); }            // ROLLE → TRÄNKTROG
  const wrap=bauOrtWrap(B); wrap.add(grp); wrap.updateMatrixWorld(true);
  bakeLOD(grp, B.p.col, geoms, 0, true);
  return geoms; }
    // prettier-ignore
    function fragFuer(B, stufe){                                                                 // GEBÄUDE-FRAGMENT-GESETZ: jedes Gebäude bakt seine Stufe EINMAL — der Chunk mischt nur noch.
  if(B.frag&&B.fragStufe===stufe) return B.frag;                                             // Ein Slot je Gebäude: Stufenwechsel verdrängt, Demotion trifft den warmen Cache
  if(stufe>=2||(stufe===1&&turmBau(B))) sollTon(B);                                           // DER WARM-PFAD (S8): jede Körper-Stufe baut auf ihrem gemessenen Soll (Wand-Ton, Sicht-Ton)
  const geoms={};
  if(stufe===3){ huelleGeoms(koerperTeile(B), geoms, B.q); }                         // VOGEL = DIE STUFE 3 des Vertrags (nurWurf): die EINE Liste als EIN Gitter in EINEM Stoff
  else if(stufe===2&&(B.p.storeys||1)>=6){ lod2Koerper(B, geoms); fensterFern(B.fenster||fensterVon(stapelBau(Object.assign({},B.p,{nur:MASSNUR}),LOD1F)), B, geoms); }   // ferner Turm: der Körper der Liste + seine Fenster, KEIN build
  else { const turm=(B.p.storeys||1)>=6;
    const st=stapelBau(stufe===1?Object.assign({},B.p,{flaechig:1}):B.p, stufe===1?LOD1S:LOD1F, (stufe===2)?DESTNUR:(turm?TURMNUR:L1NUR));   // Stufe 2 = DESTNUR (6.7x); Turm-Stufe 1 ohne Paneel-Masse; Stufe 1 = FLÄCHEN-STUFE (Gefach-Fläche + Ziegel-Band je Reihe)
    const wrap=bauOrtWrap(B); wrap.add(st.g);
    wrap.updateMatrixWorld(true);                                                             // WELTMATRIX-GESETZ: ohne Update bakt der Wrapper bei (0,0)
    bakeLOD(st.g, B.p.col, geoms, stufe===2?KULLVOL:0, true);                                // LÜCKENLOS: Türen/Fenster werden Teil des Bakes
    if(stufe===1&&!turm){                                                                      // FENSTER-SCHLAF-GESETZ: die Nacht hat Rhythmus — der Würfel je Fenster lebt im Bau (fensterSchlaeft), jede Stufe gleich
      if(!B.wandTon){ const eY=(B.dims&&B.dims.eaveY)||6;                                     // WANDTON einmalig aus der ECHTEN Fassade messen (AO-freies Fenster 2.6..eY) — VOR dem Innenkörper: der Ton der Fassade, nie der des Raums (K38: er maß den Körper mit, hollaendisch 0,295/0,076/0,042 → 0,353/0,159/0,121)
        B.wandTon=wandTonAus(geoms, 2.6, Math.max(3.4,eY)); }
      const rf=_innenFaktor(B, st.H&&st.H.raum), innen=new THREE.Group();                     // INNENDÄMMER-GESETZ: der Innenkörper ist GEDIMMTER RAUM, nicht Void-Schwarz — durch Laibungen und Geschoss-Schlitze las sich Schwarz, promoviert wurde es weiß (Michis Sprung); jetzt verschatteter Raum, der Promotions-Wechsel flüstert
      const fpx=(B.fp&&B.fp.length)?B.fp:[{x0:-((B.dims&&B.dims.W)||8)/2,x1:((B.dims&&B.dims.W)||8)/2,z0:-((B.dims&&B.dims.D)||8)/2,z1:((B.dims&&B.dims.D)||8)/2,eY:(B.dims&&B.dims.eaveY)||6}];
      for(const f2 of fpx){ const lw=f2.x1-f2.x0-0.55, ld=f2.z1-f2.z0-0.55, lh=Math.max(2,(f2.eY||6)-0.25);
        if(lw>0.7&&ld>0.7){ const lg=new THREE.BoxGeometry(lw,lh,ld), att=new Float32Array(24*3);
          for(let i2=0;i2<72;i2+=3){ att[i2]=rf[0]; att[i2+1]=rf[1]; att[i2+2]=rf[2]; }       // der Raum × INNEN_DAEMMER (KALIBRIERT auf die GEMESSENE Voll-Interieur-Leuchtdichte, 176 vs 60 bei 0.34: der Stufen-Sprung an Fenstern fällt von 51.8k Pixeln auf ~0)
          lg.setAttribute('color', new THREE.Float32BufferAttribute(att,3));
          const li=new THREE.Mesh(lg, M.putz); li.position.set((f2.x0+f2.x1)/2, lh/2+0.05, (f2.z0+f2.z1)/2); innen.add(li); } }
      wrap.add(innen); wrap.updateMatrixWorld(true); bakeLOD(innen, B.p.col, geoms, 0, true); }
    if(stufe===2||turm){ lod2Koerper(B, geoms); fensterFern(fensterVon(st), B, geoms); }
    st.g.traverse(o=>{ if(o.geometry)o.geometry.dispose(); }); }
  if(stufe===2||(stufe===1&&turmBau(B))) tonUebertrag(geoms, B.sichtTon);                     // jede Körper-Stufe (die 2, die Turm-1) trägt den Ton ihres Solls
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
    // DIE TRACHT je Epoche (siedlung.K4): der Schnitt (top · bottom · shoes, die Wahlen des Mensch-Gesetzes koerper-core
    // `kleidZonen`) und die Farben (`CLOTH_COLORS`), in die der Genom-Roller der Bewohner fällt — der Export trägt sie als
    // `kleidung` (die Epoche seines Jahrs, `epocheBei`), der Leser ist der Wirt (`_bewohnerGestalten`).
    // prettier-ignore
    const EPOCHEN={   // Legacy-Wahl → fixiert Region+Zeit (Pool-Override); 'gewuerfelt' überlässt ALLES dem Samen
  antike:      {region:'antik',        jahr:80,   spanne:70,  groesse:'markt', tracht:{top:'poncho',bottom:'shorts',shoes:'none',farben:['white','sand','burgundy','red']}},
  mittelalter: {region:'mitteleuropa', jahr:1320, spanne:90,  groesse:'dorf',  tracht:{top:'poncho',bottom:'pants',shoes:'boot',farben:['sand','olive','grey','mustard','burgundy']}},
  hanse:       {region:'mitteleuropa', jahr:1560, spanne:140, groesse:'markt', pool:['hanseatisch','hollaendisch','niedersaechsisch'], mark:{k:'hanseatisch',set:{turm:1,storeys:4}}, tracht:{top:'pullover',bottom:'pants',shoes:'boot',farben:['black','navy','burgundy','sand','white']}},
  barock:      {region:'mitteleuropa', jahr:1700, spanne:80,  groesse:'markt', pool:['barock','renaissance','franzoesisch'], mark:{k:'barock',set:{kuppel:1,W:14,D:11}}, tracht:{top:'pullover',bottom:'pants',shoes:'boot',farben:['burgundy','navy','red','mustard','white']}},
  gruenderzeit:{region:'mitteleuropa', jahr:1860, spanne:60,  groesse:'markt', pool:['viktorianisch','georgian','hanseatisch'], mark:{k:'viktorianisch',set:{turm:1,storeys:3}}, tracht:{top:'pullover',bottom:'pants',shoes:'boot',farben:['black','charcoal','grey','navy','white']}},
  alpin:       {region:'alpin',        jahr:1620, spanne:220, groesse:'dorf',  tracht:{top:'pullover',bottom:'shorts',shoes:'boot',farben:['green','olive','grey','white','red']}},
  mediterran:  {region:'mediterran',   jahr:1520, spanne:260, groesse:'dorf',  tracht:{top:'poncho',bottom:'pants',shoes:'boot',farben:['white','sand','teal','red']}},
  fernost:     {region:'fernost',      jahr:1250, spanne:300, groesse:'dorf',  tracht:{top:'poncho',bottom:'pants',shoes:'none',farben:['navy','teal','red','white','black']}},
  moderne:     {region:'mitteleuropa', jahr:1935, spanne:70,  groesse:'stadt', pool:['modern','volle_moderne'], mark:{k:'hochhaus',set:{}}, tracht:{top:'tshirt',bottom:'pants',shoes:'sneaker',farben:['navy','blue','grey','white','charcoal','teal','red','black']}},
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
    // VERTRAGS-AKT 18.07.: LOD1SKIP ist GESTRICHEN (0 Leser — der tote LOD1F-Zwilling).
    // prettier-ignore
    const DORF_NORM={ gap:2.5, strasseW:5.0, laneW:3.2, gehweg:1.2, budget:170000, laneiv:17 };   // VERTRAGS-AKT 18.07.: gapStadt gestrichen (0 Leser, matchte kein lebendes Layout-Literal)
    // ── SPIEGEL-ZENSUS 17.07. — DAS SIEDLUNGS-EXISTENZ-GESETZ (rein additive
    // DATEN-Zeile): WO/WIEVIEL Doerfer die Welt traegt ist Siedlungs-Wissen
    // (Praezedenzfall: die Wald-Dichte lebt in phyto-core forestStandDensity).
    // cellM = Welt-Zellen-Raster (m) · rarity = 1 von N Zellen traegt ein Dorf
    // (~7 Doerfer/km² effektiv) · nHMin/nHSpan = Dorf-Groesse nHMin..nHMin+
    // nHSpan-1 Haeuser (deterministisch aus dem Zell-Hash). Die Klippen-Wand je
    // Haus-Slot fiel mit dem Erdbau des Orts (K10, ortPlan), die Site-Wand slopeMax
    // 0,35 mit dem Hang: die Steil-Wand ist die Boeschung des Erdbaus (gelaende-core
    // ERDBAU.boeschung, siedlung.K3). Reist im Buch-Umschlag (get-book, Feld `siedlung`); der Wirt
    // liest memoisiert + fail-soft byte-gleich (_siedlungGesetz). Seine
    // Streaming-Regler (nearM/perTick/spawnClearM/siteProbeR/startRadiusM)
    // bleiben ehrlich Wirts-Infrastruktur (AUTO_SETTLEMENT). ──
    const SIEDLUNG = { cellM: 256, rarity: 2, nHMin: 8, nHSpan: 10 };
    // ── DAS RANG-GESETZ (siedlung.K2, additiv): die Größen der Welt folgen dem Rang (Zipf, Exponent 1). Je Stufe L ein Raster
    // aus `zellen` × `zellen` Welt-Zellen; sein Sieger (die Dorf-Zelle mit dem höchsten Rang-Schlüssel) trägt die Stadt der
    // Stufe — der Sieger des groben Rasters siegt auch in seinem feinen, er steigt auf. Die Größe der Stufe ist Pareto(α = 1)
    // ab nH bis dorthin, wo die nächste beginnt (`stufeBis`); die oberste trägt den OFFENEN Schwanz bis zur Wand des DORF
    // (`GROESSE_WAND`): mit der Rasterseite × 2 je Stufe (Dichte / 4) gilt N(≥ s) ∝ 1/s über alle Stufen bis zur Wand
    // (`siedlungsGroesse`, gate:settlement Z3 ZIPF). Bis 27.10. endete auch die oberste bei 4·nH — N(≥ s) fiel vor 384 auf 0,
    // ζ 1,337 über 8 × 32 × 32 km.
    // Das Dorf (Stufe 0) bleibt nHMin … nHMin+nHSpan−1, byte-gleich. Ein Ort steht nur, wo kein höherer, der steht, in
    // Reichweite liegt (`reichM`: kern + jeWurzel·√nH m um den Anker — der Rang verdrängt, `siedlungsZelle`); bis K2 würfelte
    // jede Zelle 8–17 Häuser, die Welt trug nur Dörfer. Ohne Zahl nimmt eine Epoche die Größe ihrer Klasse (`GROESSE_N`,
    // EPOCHEN.groesse → nZiel im DORF). ──
    SIEDLUNG.rang = [
        { zellen: 8, nH: 24 },
        { zellen: 16, nH: 96 },
    ];
    SIEDLUNG.reichM = { kern: 30, jeWurzel: 22 };
    // je Größen-Klasse des DORF die Häuserzahl, die eine Epoche ohne Zahl verlangt (jede liegt in ihrer Klasse, gate:settlement Z)
    var GROESSE_N = { weiler: 6, dorf: 12, markt: 21, stadt: 36, grossstadt: 90, metropole: 220 };
    // die Wand des Ziel-Gesetzes: so viele Häuser verlangt eine Stadt höchstens (DORF nZiel, die oberste Rang-Stufe)
    var GROESSE_WAND = 500;
    // DIE STADTMAUER (siedlung.K2): die Maße, die das Labor (`worlds/fachwerk` buildDorf) und die Welt (`_stlMauerBuild`) aus der
    // Mauer des Plans (`dorfLayout`: Segmente, Türme, Tore) bauen — die Wand mit ihrer Krone (y = die Mitte über dem Fuß), der
    // Turm mit seinem Dach; die Stoffe stein und ziegel in den Farben von DEFCOL
    var STADTMAUER = {
        wand: { hoch: 5.6, dick: 1.6, ueber: 0.6 },
        krone: { y: 5.9, hoch: 0.7, dick: 2.0 },
        turm: { breit: 3.6, hoch: 8.4 },
        dach: { y: 9.1, breit: 4.2, hoch: 1.5 },
    };
    // der Rang-Schlüssel einer Zelle aus ihrem Hash (fmix32, eine Bijektion: zwei Hashes tragen nie denselben Schlüssel)
    function rangSchluessel(h) {
        var x = h >>> 0;
        x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0;
        x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
        return (x ^ (x >>> 16)) >>> 0;
    }
    // DIE EINE GRÖSSE einer Siedlung aus ihrem Zell-Hash h und ihrer Stufe (die Auto-Zelle, das Start-Dorf, der Akt ohne Zahl)
    function siedlungsGroesse(S, h, stufe) {
        var L = stufe | 0;
        if (L <= 0) return S.nHMin + ((h >>> 24) % S.nHSpan);
        var u = (rangSchluessel((h ^ 0x9e3779b9) >>> 0) >>> 8) / 16777216;
        var a = S.rang[L - 1].nH;
        var k = L < S.rang.length ? 1 - a / S.rang[L].nH : 1; // die oberste ist offen: was über der Wand läge, steht an ihr
        return Math.min(GROESSE_WAND, Math.floor(a / (1 - k * u)));
    }
    // die größte Größe der Stufe L: wo die nächste beginnt, über der obersten die Wand
    function stufeBis(S, L) {
        return L < S.rang.length ? S.rang[L].nH : GROESSE_WAND;
    }
    // die Reichweite eines Orts mit nH Häusern um seinen Anker (m)
    function siedlungsReich(S, nH) {
        return S.reichM.kern + S.reichM.jeWurzel * Math.sqrt(nH);
    }
    // DIE EPOCHEN-LEGENDE einer Siedlung aus ihrem Samen: jede dritte trägt eine Epoche der Tafel (DP.epoche fixiert Region und
    // Zeit), die übrigen würfelt der Same (undefined). Bis siedlung.K2 rechnete sie der Wirt (`_siedlungEpoche`), byte-gleich.
    function siedlungsEpoche(seed) {
        var namen = Object.keys(EPOCHEN);
        var h = (Math.imul(seed >>> 0 || 1, 2654435761) + 0x9e3779b9) >>> 0;
        h = (h ^ (h >>> 16)) >>> 0;
        if (h % 3 !== 0) return undefined;
        return namen[(h >>> 4) % namen.length];
    }
    // DIE ZELLE DER WELT (siedlung.K2): `zellHash(cx, cz)` reicht der Wirt (FNV-1a über „<Welt-Same>:dorf:cx,cz"), der Kern
    // entscheidet Existenz (1 von `rarity`), Anker (die Zell-Mitte ± ¼ Zelle aus den Bits >>>8 und >>>16), Stufe, Größe, Reichweite
    // und die Verdrängung. `memo` (eine Map je Welt-Same) hält Orte, Sieger und Urteile. Rückgabe {seed, nH, stufe, x, z, reichM}
    // oder null (kein Dorf, verdrängt).
    function siedlungsZelle(S, cx, cz, zellHash, memo) {
        var M = memo || new Map();
        var ort = function (x, z) {
            var k = "o" + x + "," + z;
            if (M.has(k)) return M.get(k);
            var h = zellHash(x, z) >>> 0;
            var o = null;
            if (h % S.rarity === 0) {
                var jx = (((h >>> 8) & 0xff) / 255 - 0.5) * S.cellM * 0.5;
                var jz = (((h >>> 16) & 0xff) / 255 - 0.5) * S.cellM * 0.5;
                o = { cx: x, cz: z, h: h, rang: rangSchluessel(h), x: (x + 0.5) * S.cellM + jx, z: (z + 0.5) * S.cellM + jz };
            }
            M.set(k, o);
            return o;
        };
        var sieger = function (L, bx, bz) {
            var k = "s" + L + ":" + bx + "," + bz;
            if (M.has(k)) return M.get(k);
            var n = S.rang[L - 1].zellen;
            var best = null;
            for (var i = 0; i < n; i++)
                for (var j = 0; j < n; j++) {
                    var o = ort(bx * n + i, bz * n + j);
                    if (o && (!best || o.rang > best.rang)) best = o;
                }
            M.set(k, best);
            return best;
        };
        var stufeVon = function (o) {
            var k = "t" + o.cx + "," + o.cz;
            if (M.has(k)) return M.get(k);
            var st = 0;
            for (var L = S.rang.length; L >= 1 && !st; L--) {
                var n = S.rang[L - 1].zellen;
                if (sieger(L, Math.floor(o.cx / n), Math.floor(o.cz / n)) === o) st = L;
            }
            M.set(k, st);
            return st;
        };
        var groesse = function (o) {
            return siedlungsGroesse(S, o.h, stufeVon(o));
        };
        var hoeher = function (w, o) {
            var a = stufeVon(w);
            var b = stufeVon(o);
            return a > b || (a === b && w.rang > o.rang);
        };
        // der Ort steht, wenn kein höherer, der steht, in Reichweite liegt (der Rang steigt in jeder Frage: die Kette endet)
        var steht = function (o) {
            var k = "l" + o.cx + "," + o.cz;
            if (M.has(k)) return M.get(k);
            var so = stufeVon(o);
            var ro = siedlungsReich(S, groesse(o));
            var ja = true;
            for (var L = S.rang.length; L >= Math.max(1, so) && ja; L--) {
                var n = S.rang[L - 1].zellen;
                var B = n * S.cellM;
                var D = ro + siedlungsReich(S, stufeBis(S, L));
                for (var bx = Math.floor((o.x - D) / B); bx <= Math.floor((o.x + D) / B) && ja; bx++)
                    for (var bz = Math.floor((o.z - D) / B); bz <= Math.floor((o.z + D) / B) && ja; bz++) {
                        var w = sieger(L, bx, bz);
                        if (!w || w === o || stufeVon(w) !== L || !hoeher(w, o)) continue;
                        if (Math.hypot(w.x - o.x, w.z - o.z) < ro + siedlungsReich(S, groesse(w)) && steht(w)) ja = false;
                    }
            }
            M.set(k, ja);
            return ja;
        };
        var o = ort(cx, cz);
        if (!o || !steht(o)) return null;
        var nH = groesse(o);
        return { seed: o.h || 1, nH: nH, stufe: stufeVon(o), x: o.x, z: o.z, reichM: siedlungsReich(S, nH) };
    }
    // ── DIE CHRONIK (siedlung.K4): das Jahr ist EIN Parameter des Plans. Der Ort wächst längs der ZEITACHSE seiner Region (ihre
    // Epochen der Tafel nach dem Jahr) aus EINER Saat: je Epoche E ein Anker am Ende ihrer Spanne (T = jahr + d + spanne, d die
    // Saat-Verschiebung des Plans), die Häuserzahl log-linear von der Klasse der ersten Epoche bis zur Gegenwart (nEnde am Ende
    // des Plans), in das Band der Klasse von E geklemmt (mit nEnde skaliert) und wachsend; davor die Gründung (gr0, 1 Haus).
    // Das Haus i ist gegründet im Jahr, in dem der Ort i+1 Häuser zählt (`chronikJahr`, Kern = alt): der Plan eines früheren
    // Jahrs ist der Anfang des jüngeren — seine Lose stehen dort, wo sie im jüngeren stehen (Jahresringe, gate:settlement J).
    // Bis K4 rechnete jede Epoche ihren eigenen Plan (dieselbe Saat, 1320 → 1560 → 1860 → 1935: 22–67 % der älteren
    // Grundrisse im jüngeren) und die Ring-Stadt würfelte das Baujahr je Haus (t^0,82, ein Turm von 1455 aus Glas).
    // die Größen-Klasse einer Häuserzahl (die Wände der Klassen: weiler < 8 ≤ dorf < 17 ≤ markt < 27 ≤ stadt < 49 ≤ grossstadt < 141)
    var GROESSE_BAND = [["weiler", 8], ["dorf", 17], ["markt", 27], ["stadt", 49], ["grossstadt", 141], ["metropole", Infinity]];
    function groesseVon(n) {
        for (var k = 0; ; k++) if (n < GROESSE_BAND[k][1]) return GROESSE_BAND[k][0];
    }
    function groesseBand(klasse) {
        for (var k = 0; k < GROESSE_BAND.length; k++)
            if (GROESSE_BAND[k][0] === klasse) return [k ? GROESSE_BAND[k - 1][1] : 4, Math.min(GROESSE_WAND, GROESSE_BAND[k][1] - 1)];
        throw new Error("fachwerk: keine Größen-Klasse " + klasse);
    }
    // die Zeitachse einer Region: ihre Epochen der Tafel nach dem Jahr
    function zeitachse(region) {
        return Object.keys(EPOCHEN)
            .filter(function (k) {
                return EPOCHEN[k].region === region;
            })
            .sort(function (a, b) {
                return EPOCHEN[a].jahr - EPOCHEN[b].jahr;
            });
    }
    // die Epoche eines Jahrs t (Saat-Verschiebung d): die jüngste der Achse, deren Spanne bis t endet, sonst die erste; eine
    // Region ohne Epoche liest die Achse aller
    function epocheBei(region, t, d) {
        var achse = zeitachse(region);
        if (!achse.length)
            achse = Object.keys(EPOCHEN).sort(function (a, b) {
                return EPOCHEN[a].jahr - EPOCHEN[b].jahr;
            });
        var e = achse[0];
        for (var k = 0; k < achse.length; k++) if (EPOCHEN[achse[k]].jahr + d + EPOCHEN[achse[k]].spanne <= t) e = achse[k];
        return e;
    }
    // DAS JAHR EINES SATZES (siedlung.K4, „dorf 7 300 1560"): die Epoche der Tafel, deren Zeitachse eine Chronik trägt (mehr als
    // eine Epoche ihrer Region), die bis zum Jahr j begann — die jüngste, vor der ersten die erste. Der Ort steht am Ende ihrer
    // Spanne (DORF), wie Teil J ihn misst; Leser: der Satz „dorf" und der Akt `spawn_village` des Wirts
    function epocheImJahr(j) {
        var E = Object.keys(EPOCHEN)
            .filter(function (k) {
                return zeitachse(EPOCHEN[k].region).length > 1;
            })
            .sort(function (a, b) {
                return EPOCHEN[a].jahr - EPOCHEN[b].jahr;
            });
        var e = E[0];
        for (var k = 0; k < E.length; k++) if (EPOCHEN[E[k]].jahr <= j) e = E[k];
        return e;
    }
    // die Anker [[jahr, häuser], …] eines Orts der Region mit nEnde Häusern am Jahr tEnde, dessen Gegenwart die Klasse
    // `klasse` trägt; `vor` = die Epochen der Achse vor seiner (ihre Anker), gr0 = die Gründung
    function chronikAnker(vor, d, gr0, tEnde, nEnde, klasse) {
        var s = nEnde / GROESSE_N[klasse];
        var A = [[gr0, 1]];
        var T = function (k) {
            return EPOCHEN[k].jahr + d + EPOCHEN[k].spanne;
        };
        var t1 = vor.length ? T(vor[0]) : tEnde;
        var n1 = Math.max(1, vor.length ? GROESSE_N[EPOCHEN[vor[0]].groesse] * s : nEnde);
        for (var k = 0; k < vor.length; k++) {
            var t = T(vor[k]);
            if (t <= A[A.length - 1][0] || t >= tEnde) continue;
            var band = groesseBand(EPOCHEN[vor[k]].groesse);
            var n = Math.round(n1 * Math.pow(nEnde / n1, (t - t1) / Math.max(1, tEnde - t1)));
            n = Math.max(Math.round(band[0] * s), Math.min(Math.round(band[1] * s), n));
            A.push([t, Math.min(nEnde, Math.max(n, A[A.length - 1][1] + 1))]);
        }
        A.push([Math.max(tEnde, gr0), nEnde]);
        return A;
    }
    // das Jahr, in dem der Ort der Anker A sein Haus i gründet (das erste ganze Jahr mit i+1 Häusern)
    function chronikJahr(A, i) {
        var m = i + 1;
        for (var k = 1; k < A.length; k++) {
            var a0 = A[k - 1][1],
                a1 = A[k][1];
            if (m > a1 || !(a1 > a0)) continue;
            if (m <= a0) return A[k - 1][0];
            return Math.ceil(A[k - 1][0] + ((A[k][0] - A[k - 1][0]) * Math.log(m / a0)) / Math.log(a1 / a0) - 1e-9);
        }
        return A[A.length - 1][0];
    }
    // DIE GESTALT EINER ZAHL (siedlung.K4): die kleinste Gegenwart nE (bis GROESSE_WAND), deren Schnitt am Jahr t mindestens nH
    // Häuser trägt (die Häuser i mit chronikJahr(A, i) ≤ t) — die Anker wachsen mit nE, die Suche halbiert
    function gestaltFuer(nH, vor, d, gr0, tEnde, klasse, t) {
        var zaehl = function (nE) {
            var A = chronikAnker(vor, d, gr0, tEnde, nE, klasse);
            for (var k = 0; k < nE && chronikJahr(A, k) <= t; ) k++;
            return k;
        };
        var a = nH,
            b = GROESSE_WAND;
        if (zaehl(b) < nH) return b;
        while (a < b) {
            var m = (a + b) >> 1;
            if (zaehl(m) >= nH) b = m;
            else a = m + 1;
        }
        return a;
    }
    // ── DAS WACHSTUM (siedlung.K4 Staffel 2): der Ort wächst in Spielzeit aus seinen Bewohnern. Je Sekunde der Welt-Uhr gründet
    // jeder Bewohner eines stehenden Loses `kraftJeS` × den Wohlstand seines Hauses (`wohl` des Plans) an Kraft, geteilt durch
    // die Furcht des Orts: die Erinnerung seiner Akten (die Gewalt, die seine Bewohner sahen) nach dem EINEN Furcht-Gesetz
    // (tetrapoda `furchtErinnert`, der Wirt reicht es als `furcht`), um `jeFurcht` je Einheit — derselbe Faktor, um den sie
    // den Raum vor dem Spieler weitet (`fluchtJeFurcht`). Das nächste Los der Chronik (die Lose seines Gründungsjahrs) steht,
    // wenn die Kraft seine Leute trägt: der Ort springt in sein Jahr, nach dem letzten in die Gegenwart (bis zu ihr die
    // Ersatzbauten). Ohne Bewohner oder ohne Wohlstand (wohl → 0) wächst nichts, in Furcht langsamer — ein Zeitplan, der
    // Häuser setzt, wäre kein Wachstum. Die Größe wächst mit den Leuten (Verdopplung ≈ 21 min Welt-Uhr bei Wohlstand 1).
    // C = die Chronik des Exports (`chronik`: gr0, ende, je Los jahre · leute · wohl), Z = {jahr, kraft, uhr} (uhr: die Welt-Uhr
    // `spielZeit` in s), akten = [{t, type}] nach t, t = jetzt. Rein und deterministisch: dieselben Akten, dieselbe Uhr, derselbe Ort.
    var WACHSTUM = { kraftJeS: 1 / 1800, aktenMax: 16 };
    function wachstum(C, Z, akten, t, furcht, jeFurcht) {
        var jahr = Z.jahr,
            kraft = Z.kraft || 0,
            a0 = Z.uhr;
        var n = C.jahre.length,
            m = 0,
            rate = 0;
        while (m < n && C.jahre[m] <= jahr) rate += C.leute[m] * C.wohl[m++];
        var ak = (akten || []).filter(function (a) {
            return a && a.t <= t;
        });
        // die Grenzen gleichen Wohls: jede Akte nach der letzten Rechnung, dann jetzt
        var grenzen = ak
            .filter(function (a) {
                return a.t > a0;
            })
            .map(function (a) {
                return a.t;
            })
            .concat([t]);
        for (var gi = 0; gi < grenzen.length && m < n; gi++) {
            var g = grenzen[gi];
            var f = furcht(
                ak.filter(function (a) {
                    return a.t <= a0;
                })
            );
            var w = 1 / (1 + Math.max(0, f) * jeFurcht);
            while (m < n) {
                var R = rate * WACHSTUM.kraftJeS * w;
                if (!(R > 0)) break; // ohne Kraft gründet niemand, auch kein Los ohne Leute (die Scheune folgt ihrem Hof)
                var e = m,
                    kost = 0;
                while (e < n && C.jahre[e] === C.jahre[m]) kost += C.leute[e++];
                if (kost > kraft) {
                    if (a0 + (kost - kraft) / R > g) break;
                    a0 += (kost - kraft) / R;
                    kraft = kost;
                }
                kraft -= kost;
                for (; m < e; m++) rate += C.leute[m] * C.wohl[m];
                jahr = m < n ? C.jahre[m - 1] : C.ende;
            }
            if (m < n) kraft += rate * WACHSTUM.kraftJeS * w * Math.max(0, g - a0);
            a0 = g;
        }
        return { jahr: jahr, kraft: m < n ? kraft : 0, uhr: Math.max(Z.uhr, t), lose: m };
    }
    // prettier-ignore
    function DORF(DP){
  let s=((Math.round((DP.seed||1)*613+29)*2654435761)>>>0); const rnd=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
  const leg0=(DP.epoche&&DP.epoche!=='gewuerfelt')?EPOCHEN[DP.epoche]:null, achse=leg0?zeitachse(leg0.region):[];
  const chronik=!!leg0&&achse.length>1;                                                 /*DIE CHRONIK (siedlung.K4): die Epoche lebt in der Gegenwart ihrer Region — der Plan ist der ihrer juengsten Epoche, das Jahr schneidet ihn (unten). Die ZAHL ist die Groesse der Gegenwart (die Gestalt); bis w3w schaltete sie die Chronik ab: jede Zelle der Welt (Rang-Gesetz), der Satz „dorf 7 300" und der Akt des DSL trugen eine Zahl und rechneten je Epoche einen eigenen Plan — die Mutante ohne Erbe (Teil J 0,222)*/
  const leg=chronik?EPOCHEN[achse[achse.length-1]]:leg0;
  let region,jahr,spanne,d=0;
  if(leg){ region=leg.region; d=((rnd()-0.5)*50)|0; jahr=leg.jahr+d; spanne=leg.spanne; }
  else{ const r=rnd(); region= r<.30?'mitteleuropa': r<.46?'alpin': r<.64?'mediterran': r<.76?'nordisch': r<.88?'fernost':'antik';
    if(region==='antik'){ jahr=-150+((rnd()*400)|0); spanne=40+((rnd()*90)|0); }
    else{ jahr=880+((rnd()*680)|0); const sp=rnd(); spanne= sp<.35?(20+((rnd()*60)|0)):(sp<.75?(180+((rnd()*300)|0)):(500+((rnd()*420)|0)));
      if(region==='fernost'&&jahr>1500) jahr=1050+((rnd()*450)|0); } }
  const nZiel=Math.max(4,Math.min(GROESSE_WAND,DP.nH||(leg&&GROESSE_N[leg.groesse])||18));         // ZIEL-GESETZ: der Regler IST die Stadt; ohne Regler die Klasse der Epoche (EPOCHEN.groesse, siedlung.K2), sonst 18 (bis K2 der Export-Zwilling 18 neben 24 hier)
  const staedtischVon=g=>(g==='markt'||g==='stadt'||g==='grossstadt'||g==='metropole'), kr=rnd(), vor=achse.filter(k=>leg&&EPOCHEN[k].jahr<leg.jahr);
  const ringe=(staedtischVon(groesseVon(nZiel))&&jahr>1700)||chronik;                                  /*JAHRESRING-GESETZ: die Stadt ist geronnene ZEIT — der Radius wird zur Zeitachse. Kern=Gruendung (Altstadt), Rand=Gegenwart; Kultur+Baujahr je PARZELLE aus ihrem Ring; die Regions-HISTORIE (poolAt) liefert die Architektur jener Zeit*/
  const gr0=ringe? Math.min(jahr-150, 1150+((rnd()*260)|0)) : jahr; globalThis.__ring={gr0:gr0, ringe:ringe};   /*Zeitachse global — DORF wuerfelt, dorfLayout liest (getrennte Funktionen)*/
  /*DIE ZAHL STEHT IM JAHR IHRER EPOCHE (siedlung.K4): mit Chronik traegt der Schnitt der verlangten Epoche die Zahl, die Gestalt ist die kleinste Gegenwart, deren Schnitt sie traegt (`gestaltFuer`) — die Zelle des Rang-Gesetzes zeigt ihre Groesse, „dorf 7 18 gruenderzeit" steht mit 18 Haeusern*/
  const n=chronik&&DP.nH&&leg0!==leg?gestaltFuer(nZiel, vor, d, gr0, jahr+spanne, leg.groesse, leg0.jahr+d+leg0.spanne):nZiel;
  const groesse=groesseVon(n);
  const staedtisch=staedtischVon(groesse);
  const kernel= staedtisch?'markt':(kr<.45?'brunnen':(kr<.78?'anger':'kreuzung'));
  const poolAt=(y,hist)=>{ if(!hist&&leg&&leg.pool)return leg.pool; const H=REGION_HIST[region]; let P=H[0][1]; for(const q of H){ if(y>=q[0])P=q[1]; } return P; };   /*hist=true: die HISTORIE gewinnt ueber die Legende — Jahresringe brauchen die Architektur ihrer Zeit*/
  const geb=[];
  const anker=ringe? chronikAnker(vor, d, gr0, jahr+spanne, n, leg?leg.groesse:groesse) : null;   /*die Ring-Stadt waechst laengs der Zeitachse (chronikJahr) — Kern=Gruendung, Rand=Gegenwart*/
  const gr=[], fr=[];                                                                         /*je Los: das Gruendungsjahr und die frueheren Bauten [{ab, v}] (der Schnitt der Chronik liest sie)*/
  for(let i=0;i<n;i++){
    const t9r=i/Math.max(1,n-1);
    let by; if(ringe){ by=chronikJahr(anker,i);
      if(rnd()<0.12) by=Math.round(by+(jahr+spanne-by)*(0.45+0.5*rnd()));                       /*ERSATZBAU: das Los wird spaeter neu bebaut — der fruehere Bau bleibt in fr*/
      by=Math.max(gr0, Math.min(jahr+spanne, by)); }
    else by=jahr+Math.round(spanne*t9r*(0.55+0.45*rnd()));
    gr.push(ringe?chronikJahr(anker,i):by); fr.push([]);
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
    if(by!==gr[i]){ const P0=poolAt(gr[i], ringe), k0=P0[hs%P0.length]; fr[i].push({ab:gr[i], v:Object.assign({}, p, kulturParams(k0,hs), {kultur:k0, baujahr:gr[i]})}); }
    geb.push(p); }
  const modern=(jahr>=1905&&staedtisch), gewerbe=(jahr>=1850&&staedtisch&&n>=20), gwA=rnd()*Math.PI*2;
  if(modern){ for(let i=0;i<n;i++){ if(i>0&&i<n*0.22&&rnd()<0.72){ const p=geb[i];      // DOWNTOWN-GESETZ: der Kern wächst in den Himmel — als NEUBAU des alten Loses im Jahrhundert der Moderne (der alte Bau bleibt in fr)
    const ty=Math.min(jahr+spanne, Math.max(1905+p.seed%Math.max(1,jahr+spanne-1904), p.baujahr+1)), PT=poolAt(ty, ringe);
    fr[i].push({ab:p.baujahr, v:Object.assign({}, p)}); p.baujahr=ty; p.kultur=PT[p.seed%PT.length];
    p.stil=(rnd()<0.62)?'glas':'klinker'; p.storeys=8+((rnd()*16)|0); p.W=12+((rnd()*6)|0); p.D=10+((rnd()*5)|0);
    p.dachTyp='flach'; p.grundriss='I'; p.balcony=0; p.keller=0; p.annexN=0; p.arm=0; p.turmbau=1; p.rolle='turm'; } } }
  if(gewerbe){ for(let i=(n*0.78)|0;i<n;i++){ if(rnd()<0.6&&gr[i]>=1850){ const p=geb[i];   // GEWERBE-GESETZ: Hallen-Viertel am Rand (ein Los, das vor 1850 gegruendet ist, traegt keine Halle)
    p.rolle='halle'; p.stil='klinker'; p.W=12+((rnd()*4)|0); p.D=9+((rnd()*4)|0); p.storeys=1;
    p.pitchDeg=14; p.grundriss='I'; p.balcony=0; p.annexN=0; p.arm=1; p.sektor=gwA; p.turmbau=0; } } }
  const markBei=(L,y)=>(L&&L.mark)?L.mark:(region==='mediterran'?{k:'barock',set:{kuppel:1,W:14,D:11}}:region==='fernost'?{k:'chinesisch',set:{W:15,D:11}}:region==='antik'?{k:'roemisch',set:{arkade:1,W:15,D:11}}:region==='nordisch'?{k:'norwegisch',set:{turm:1,D:10}}:region==='alpin'?{k:'gotisch',set:{turm:1,D:9,W:7}}:(y>1880?{k:'hochhaus',set:{}}:y>1620?{k:'barock',set:{kuppel:1,W:13,D:11}}:{k:'gotisch',set:{turm:1,D:11}}));
  const kirche=(p,mk,ab)=>Object.assign(p,kulturParams(mk.k,p.seed),{kultur:mk.k},mk.set||{},{rolle:'kirche',mark:1,keller:0,baujahr:ab});
  if(n>=8){ const p=geb[0];                                                                   /*DIE KIRCHE DER EPOCHE: je Epoche der Achse vor der Gegenwart ein Bau ihrer Marke (ab der Mitte ihrer Spanne, die erste ab der Gruendung)*/
    if(ringe) fr[0]=achse.filter(k=>leg&&EPOCHEN[k].jahr<leg.jahr).map((k,j)=>{ const E=EPOCHEN[k], ab=j?E.jahr+d+((E.spanne/2)|0):gr[0]; return {ab, v:kirche(Object.assign({},p),markBei(E,E.jahr+d),ab)}; }).filter(f=>f.ab<jahr);
    kirche(p,markBei(leg,jahr),jahr); }
  const losBauten=i=>[geb[i]].concat(fr[i].map(f=>f.v));                                      /*Gasthaus und Schmiede sind Rollen des LOSES: jeder seiner Bauten traegt sie*/
  if(n>=8) for(const p of losBauten(1)){ p.rolle='gasthaus'; p.W=Math.min(15,p.W+2.5); p.D=Math.min(11,p.D+1);
    if(p.storeys<2)p.storeys=2; if(region==='mitteleuropa'||region==='mediterran')p.arkade=1; }
  if(n>=10) for(const p of losBauten(Math.max(2,(n*0.62)|0))){ p.rolle='schmiede'; p.W=5.5; p.D=5; p.storeys=1; p.balcony=0; p.annexN=0; p.grundriss='I'; p.turm=0; p.kuppel=0; }
  if(staedtisch&&jahr<1700&&n>=16&&rnd()<0.5){                                            // BURG-GESETZ: die Stadt hat einen Herrn
    const bk=(region==='nordisch')?'norwegisch':'gotisch', bs=1+((rnd()*1e6)|0);
    const bp=kulturParams(bk,bs); Object.assign(bp,{seed:bs,kultur:bk,terrain:0,baujahr:jahr-((rnd()*80)|0),rolle:'burg',wohl:1.2,
      W:13+((rnd()*2)|0), D:11, storeys:3, turm:1, zinnen:1, keller:0, annexN:0, balcony:0, grundriss:'I', arm:0});
    geb.push(bp); }
  const alle=[], za=[], schQ={weiler:.75,dorf:.55,markt:.28,stadt:.06,grossstadt:.04,metropole:.03}[groesse];
  geb.forEach((p,gi)=>{ const pi=alle.length; alle.push(p); za.push({gr:gi<n?gr[gi]:p.baujahr, fr:(fr[gi]||[]).map(f=>(f.v.W=Math.min(f.v.W,p.W), f.v.D=Math.min(f.v.D,p.D), f))});   /*der fruehere Bau steht im Los des juengeren*/
    if(p.rolle==='wohnhaus'&&Math.min(p.W,p.D)>=6.5&&rnd()<schQ){
      const cap2=Math.min(7,Math.min(p.W,p.D)-2), sn=1+((rnd()*1e6)|0);
      alle.push({W:Math.max(4,Math.round((cap2-rnd()*1.5)*2)/2), D:Math.max(4,Math.round((cap2-0.5-rnd()*1.5)*2)/2), storeys:1,
        pitchDeg:Math.max(28,p.pitchDeg-6), brace:'k', stil:(region==='mediterran'||region==='antik')?'stein':'huette',
        hip:0, roofCurve:0, grundriss:'I', dachTyp:'sattel', bogenTyp:'none', seed:sn, kultur:p.kultur, col:p.col,
        keller:0, terrain:0, annexN:0, balcony:0, rolle:'scheune', parent:pi, baujahr:za[pi].gr, wohl:p.wohl,
        treppgiebel:0,kuppel:0,portikus:0,arkade:0,turm:0,zinnen:0,veranda:0,vorkragung:0,pilotis:0,terrasse:0}); za.push({gr:za[pi].gr, fr:[]}); } });
  // DER SCHNITT DER CHRONIK: das Jahr der Epoche (T = jahr + d + spanne) nimmt die Lose, die bis T gegruendet sind — der Anfang
  // der Liste (Kern = alt) —, je Los den Bau, der bei T steht; `lose` traegt das Los der Gegenwart, wo ein frueherer Bau steht
  // (das Layout packt die Lose: ein frueherer Plan liegt in der Gestalt des juengeren). Ohne Chronik ist der Plan sein Schnitt.
  // DAS JAHR DES ORTS (siedlung.K4 Staffel 2): `DP.jahr` schneidet statt des Endes der Epoche — das Jahr, bis zu dem der Ort in
  // Spielzeit gewachsen ist (`wachstum`), zwischen seiner Gruendung und der Gegenwart; die Epoche des Schnitts ist die seines Jahrs
  const T=chronik?(isFinite(DP.jahr)?Math.max(gr0,Math.min(jahr+spanne,Number(DP.jahr))):leg0.jahr+d+leg0.spanne):jahr+spanne, houses=[], lose=[];
  for(let a=0;a<alle.length&&za[a].gr<=T;a++){ let v=alle[a];
    if(v.baujahr>T) for(const f of za[a].fr) if(f.ab<=T) v=f.v;
    houses.push(v); lose.push(v===alle[a]?null:alle[a]); }
  const nS=houses.filter(h=>h.rolle!=='scheune').length, gS=chronik?groesseVon(nS):groesse;
  const eT=epocheBei(region,T,d), tracht=EPOCHEN[eT].tracht, j0=chronik?Math.min(T,EPOCHEN[eT].jahr+d):jahr;
  // DIE CHRONIK DER GESTALT (Staffel 2, der Leser ist `wachstum`): je Los sein Gruendungsjahr und die Leute und der Wohlstand seines
  // ersten Baus (`leuteVon`, `wohl`); das Ende ist die Gegenwart — ohne Chronik (keine Zeitachse) waechst der Ort nicht
  const C=chronik?{gr0, ende:jahr+spanne, jahre:[], leute:[], wohl:[]}:null;
  if(C) for(let a=0;a<alle.length;a++){ let v=alle[a];
    if(v.baujahr>za[a].gr) for(const f of za[a].fr) if(f.ab<=za[a].gr) v=f.v;
    C.jahre.push(za[a].gr); C.leute.push(leuteVon(v)); C.wohl.push(isFinite(v.wohl)?v.wohl:1); }
  return {seed:DP.seed||1, name:ORTSNAME(region, DP.seed||1), region, groesse, kernel, jahr, spanne, staedtisch, houses, lose, nGestalt:alle.length, chronik:C,
          schnitt:{jahr:j0, spanne:chronik?T-j0:spanne, groesse:gS, staedtisch:staedtischVon(gS)},
          kleidung:{top:tracht.top, bottom:tracht.bottom, shoes:tracht.shoes, farben:tracht.farben.slice()},
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
    // DIE VORAUSWAHL DER NÄHE (siedlung.K5): sicher fern, ohne Winkel zu rechnen — die Box liegt im Kreis ex+ez um ihre Mitte, ein Weg in
    // seinem Kasten; was weiter als thr (+1 µm für die Rundung) liegt, kann die genaue Probe nicht treffen, ihr Urteil bleibt bit-gleich.
    // Leser: dorfLayout (Bauplatz, Laterne) · brunnenWeicht · wandLaternen — bis K5 rechnete jede Probe Winkel und Abstand zu allem (nH 300: 4 s).
    function fernOBB(px,pz,o,thr){ const dx=px-o.cx, dz=pz-o.cz, R=thr+o.ex+o.ez+1e-6; return dx*dx+dz*dz>R*R; }
    function wegKasten(P){ const K={x0:Infinity,x1:-Infinity,z0:Infinity,z1:-Infinity}; for(const p of P){ if(p.x<K.x0)K.x0=p.x; if(p.x>K.x1)K.x1=p.x; if(p.z<K.z0)K.z0=p.z; if(p.z>K.z1)K.z1=p.z; } return K; }
    function fernKasten(x,z,K,thr){ const ax=Math.max(K.x0-x,0,x-K.x1), az=Math.max(K.z0-z,0,z-K.z1), R=thr+1e-6; return ax*ax+az*az>R*R; }
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
    // DIE TRASSE LIEST DAS GELÄNDE (siedlung.K3): H(x, z) ist die Höhe des Grunds PLAN-LOKAL (der Ort der Trasse im Ursprung,
    // `hoeheAusRaster`); ohne H liegt der Plan auf ebenem Grund — dasselbe Gesetz, byte-gleich mit dem Export vor K3. Ein Schritt
    // der Länge DS, der steiler als `ORT_GESETZ.trasse` steigt, dreht um die kleinste Abweichung (0,1 rad bis ±1,5 rad), die ihn
    // trägt: die Gasse folgt der Höhenlinie wie ein Saumpfad; trägt keine, nimmt sie die flachste. Bis K3 lief jede Gasse blind
    // über den Hang (Gefälle p95 22–36 % an zwei von vier Saaten), der Erdbau glättete danach.
    function trasseLenk(H, x, z, th, DS){
      if(!H) return th;
      const lim=ORT_GESETZ.trasse, h0=H(x,z), g=t=>Math.abs(H(x+Math.cos(t)*DS, z+Math.sin(t)*DS)-h0)/DS;
      let bg=g(th); if(bg<=lim) return th;
      let best=th;
      for(let k=1;k<=15;k++){ const d=k*0.1, a=g(th+d), b=g(th-d);
        if(a<=lim||b<=lim) return a<=b? th+d : th-d;
        if(a<bg){bg=a;best=th+d;} if(b<bg){bg=b;best=th-d;} }
      return best; }
    // eine GERADE Verbindung (Quergasse, Schluss-Gasse, der Fang an Knoten und Kante) baut H nur, wo kein Schritt steiler als
    // `ORT_GESETZ.trasse` steigt — sie kann nicht lenken
    function trasseSteil(H, pts){ if(!H) return false;
      for(let k=0;k+1<pts.length;k++){ const a=pts[k], b=pts[k+1], d=Math.hypot(b.x-a.x,b.z-a.z);
        if(d>1e-6&&Math.abs(H(b.x,b.z)-H(a.x,a.z))/d>ORT_GESETZ.trasse) return true; }
      return false; }
    // DAS HÖHEN-RASTER DER TRASSE: der Rahmen um den Ort eines Plans mit nH Häusern (plan-lokal, n × n Punkte im Abstand d: das
    // Anderthalbfache seiner Reichweite `siedlungsReich` und 60 m, höchstens ~160 Punkte je Seite) — der Wirt füllt ihn aus dem
    // EINEN Gelände-Kern (gelaende-core `hoehenRaster`, im Ort-Faden), das Studio aus seiner Lage; `hoeheAusRaster` liest ihn
    // bilinear. Ein Lese-Punkt außerhalb zählt (`mass.aussen`, im Export `trasse.aussen`; die Linse verlangt 0).
    function trasseRahmen(nH){ const R=1.5*siedlungsReich(SIEDLUNG, Math.max(1, isFinite(nH)?nH:SIEDLUNG.nHMin))+60, d=Math.max(4, Math.ceil(R/80)), m=Math.ceil(R/d);
      return {x0:-m*d, z0:-m*d, d, n:2*m+1}; }
    function hoeheAusRaster(r){
      if(!r||!isFinite(r.x0)||!isFinite(r.z0)||!(r.d>0)||!(r.n>=2)||!r.h||r.h.length!==r.n*r.n)
        throw new Error("fachwerk: das Höhen-Raster der Trasse ist keins (x0, z0, d, n, h[n·n])");
      const n=r.n, d=r.d, h=r.h, mass={aussen:0};
      const H=(x,z)=>{ let fx=(x-r.x0)/d, fz=(z-r.z0)/d;
        if(!(fx>=0&&fz>=0&&fx<=n-1&&fz<=n-1)){ mass.aussen++; fx=Math.max(0,Math.min(n-1,fx||0)); fz=Math.max(0,Math.min(n-1,fz||0)); }
        const i=Math.min(n-2,fx|0), j=Math.min(n-2,fz|0), u=fx-i, v=fz-j, k=i+j*n;
        return (h[k]*(1-u)+h[k+1]*u)*(1-v)+(h[k+n]*(1-u)+h[k+n+1]*u)*v; };
      H.mass=mass; return H; }
    // DER FELDWEG ZWISCHEN ORTEN (fahrzeug.K2): das Wegenetz der Welt verbindet je zwei benachbarte Orte über einen Feldweg, der
    // dem Grund folgt — der günstigste Lauf von einem Punkt der Wege des einen Orts (`A`) zu einem des anderen (`B`) über das
    // Höhen-Raster `r` um die Strecke (alle Punkte in seinen Koordinaten; er beginnt, wo das Netz ihm am günstigsten liegt — vom
    // Ende einer Gasse lief er sonst zurück an den Häusern vorbei, der Fahrer wendete im Dorf −3,−5 auf 3 m),
    // je Punkt zu 16 Nachbarn (Schritt und Rösselsprung: 26,6° Teilung), ein Schritt kostet seine Länge × (1 + 4 · (Steigung über
    // `ORT_GESETZ.trasse`, je trasse)²), steiler als `WEG_ZWISCHEN.steilMax` trägt keiner (der Saumpfad weicht dem Hang aus wie die
    // Gassen, `trasseLenk`, aber er sieht den ganzen Hang, nicht nur den nächsten Schritt: der Lauf von Schritt zu Schritt fand
    // zwischen −6,−6 und −5,−5 nach 172 m Luftlinie keinen Weg); kein Punkt liegt in `sperren` (`planSperren` der beiden Orte:
    // der Feldweg läuft nie durch ein Haus). `nass(x, z)` (optional, Raster-Koordinaten: das Wasser des Gesetzes) macht jeden
    // Schritt auf einen nassen Punkt `WEG_ZWISCHEN.furt`-mal so teuer: der Weg geht um den Bach, wo der Grund es trägt, und quert
    // ihn sonst auf dem kürzesten Stück (die Route Wiese → Wald → Dorf fuhr drei Bäche quer, 3–5 m/s im Wasser).
    // Rückgabe: die Punkte (geglättet, `glaetten`) oder null (kein Lauf). Leser: der Ort-Faden (voxel-worker `ort-weg`, Lehre 14)
    // für den Wirt (`_wegenetzLegen`).
    const WEG_ZWISCHEN = { steilMax: 0.3, hang: 4, glaett: 16, furt: 20 };
    // DIE BRÜCKE DES WEGS (fahrzeug.K2): wo ein Weg Welt-Wasser quert, trägt ihn eine hölzerne Jochbrücke (das Werk `jochfeld`)
    // von Widerlager zu Widerlager — den trockenen Punkten vor und nach dem nassen Lauf (`nasseLaeufe`, dieselbe Regel wie das
    // Brücken-Etikett der Gasse im Plan v2). Bis hier reiste das Etikett unkonsumiert, und der Feldweg kannte keins: der Wagen
    // fuhr durch die Furt (0,6 m Wasser, 2,3 m/s — die drei schwersten Täter der Fahrt auf dem Wegenetz). feldM = das Feld
    // zwischen zwei Jochen · lichtM = die Breite zwischen den Radabweisern (ein Wagen 1,9 m, ein Feldweg 3,4 m) · gelaenderM =
    // der Handlauf über der Bahn · pfahlM = so tief reichen die Pfähle unter die Bahn · einbindM = so weit liegt die Bahn am
    // Widerlager unter dem Grund (sie bindet in das Ufer ein: Rad und Fuß treten vom Grund auf die Bohlen, nie gegen sie).
    var BRUECKE_GESETZ = { feldM: 4, lichtM: 4, gelaenderM: 1.05, pfahlM: 3.5, einbindM: 0.05 };
    // DIE NASSEN LÄUFE eines Wegs: je zusammenhängendem Lauf nasser Punkte {k, e} (erster und letzter nasser Punkt) und seine
    // Widerlager {wa, wb} (der trockene Punkt davor und danach; am Ende des Wegs der Lauf selbst). Leser: das Brücken-Etikett
    // der Gasse (`ortPlan`) und der Feldweg (`brueckenAmWeg`).
    function nasseLaeufe(nass) {
        var aus = [],
            n = nass.length;
        for (var k = 0; k < n; k++) {
            if (!nass[k] || (k > 0 && nass[k - 1])) continue;
            var e = k;
            while (e + 1 < n && nass[e + 1]) e++;
            aus.push({ k: k, e: e, wa: k > 0 ? k - 1 : k, wb: e + 1 < n ? e + 1 : e });
            k = e;
        }
        return aus;
    }
    // DIE BRÜCKEN EINES WEGS: je nassem Lauf die Spanne zwischen den Widerlagern {a, b} = {x, z, y} (y die Höhe des Wegs dort,
    // `ys`) — für die Punkte `pts` [{x, z}], ihr Wasser `nass` und ihre Höhen `ys`. Ein Lauf ohne trockenes Widerlager (der
    // Weg beginnt oder endet im Wasser) trägt keine Brücke.
    function brueckenAmWeg(pts, nass, ys) {
        var aus = [];
        var L = nasseLaeufe(nass);
        for (var i = 0; i < L.length; i++) {
            var wa = L[i].wa,
                wb = L[i].wb;
            if (nass[wa] || nass[wb] || !isFinite(ys[wa]) || !isFinite(ys[wb])) continue;
            aus.push({ a: { x: pts[wa].x, z: pts[wa].z, y: ys[wa] }, b: { x: pts[wb].x, z: pts[wb].z, y: ys[wb] }, wa: wa, wb: wb });
        }
        return aus;
    }
    // DER WEG ÜBER DIE BRÜCKE: über dem Wasser IST die Brücke der Weg — die Punkte zwischen den Widerlagern [wa, wb] je Spanne
    // (`bruecken`: die Paare des Brücken-Etiketts) liegen auf ihrer Achse, nach dem Anteil ihres Laufs (der Feldweg über einen
    // 30-m-Bach bog 5 m neben die Sehne: der Fahrer folgte dem Bogen und stand am Geländer). Rückgabe die Punkte (eine Kopie,
    // ohne Spanne dieselbe Liste). Leser: das Wege-Netz eines Plans (`wegeNetz`) und der Feldweg zwischen zwei Orten (der Wirt).
    function wegUeberBruecken(pts, bruecken) {
        if (!bruecken || !bruecken.length) return pts;
        var P = pts.slice();
        for (var i = 0; i < bruecken.length; i++) {
            var wa = bruecken[i][0],
                wb = bruecken[i][1],
                A = pts[wa],
                B = pts[wb];
            if (!A || !B || !(wb - wa > 1)) continue;
            var lauf = [0];
            for (var k = wa + 1; k <= wb; k++) lauf.push(lauf[lauf.length - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].z - pts[k - 1].z));
            var L = lauf[lauf.length - 1] || 1;
            for (k = wa + 1; k < wb; k++) {
                var t = lauf[k - wa] / L;
                P[k] = Object.assign({}, pts[k], { x: A.x + (B.x - A.x) * t, z: A.z + (B.z - A.z) * t });
            }
        }
        return P;
    }
    // DIE FELDER EINER SPANNE a → b ({x, z, y}): so viele Jochfelder, wie die Spanne verlangt (feldM je Feld, die Reihe mittig
    // über ihr — sie reicht an beiden Enden gleich weit auf das Ufer), je Feld seine Mitte, die Oberkante seiner Bahn (linear
    // zwischen den Widerlagern, um einbindM unter ihnen; jenseits die Höhe des Widerlagers) und seine Gier (das Feld liegt längs
    // +x: R_y(phi) trägt +x auf die Spanne). Rückgabe [{x, z, y, phi}].
    function brueckenFelder(a, b) {
        var BG = BRUECKE_GESETZ,
            dx = b.x - a.x,
            dz = b.z - a.z,
            L = Math.sqrt(dx * dx + dz * dz);
        if (!(L > 1e-6)) return [];
        var n = Math.max(1, Math.ceil(L / BG.feldM)),
            ux = dx / L,
            uz = dz / L,
            s0 = (L - n * BG.feldM) / 2,
            phi = Math.atan2(-dz, dx),
            aus = [];
        for (var i = 0; i < n; i++) {
            var s = s0 + (i + 0.5) * BG.feldM,
                t = Math.max(0, Math.min(1, s / L));
            aus.push({ x: a.x + ux * s, z: a.z + uz * s, y: a.y + (b.y - a.y) * t - BG.einbindM, phi: phi });
        }
        return aus;
    }
    function wegZwischen(r, A, B, sperren, nass){
      const n=r.n, d=r.d, h=r.h, lim=ORT_GESETZ.trasse, W=WEG_ZWISCHEN;
      const zu=new Uint8Array(n*n), feucht=new Int8Array(n*n).fill(-1); if(sperren&&sperren.length) for(let k=0;k<n*n;k++) zu[k]=gesperrt(sperren,r.x0+(k%n)*d,r.z0+((k/n)|0)*d)?1:0;
      const knoten=(p)=>Math.max(0,Math.min(n-1,Math.round((p.x-r.x0)/d)))+n*Math.max(0,Math.min(n-1,Math.round((p.z-r.z0)/d)));
      const drin=(p)=>p.x>=r.x0&&p.z>=r.z0&&p.x<=r.x0+(n-1)*d&&p.z<=r.z0+(n-1)*d;
      const quelle=new Map(), ziel=new Map();
      for(const p of A) if(drin(p)) quelle.set(knoten(p),p); for(const p of B) if(drin(p)) ziel.set(knoten(p),p);
      if(!quelle.size||!ziel.size) return null;
      for(const k of quelle.keys()) zu[k]=0; for(const k of ziel.keys()) zu[k]=0;
      let gx=0, gz=0, gr=0; for(const k of ziel.keys()){ gx+=k%n/ziel.size; gz+=((k/n)|0)/ziel.size; }
      for(const k of ziel.keys()) gr=Math.max(gr,Math.hypot(k%n-gx,((k/n)|0)-gz));
      const NB=[]; for(let i=-2;i<=2;i++) for(let j=-2;j<=2;j++){ const g=Math.abs(i)===2&&Math.abs(j)===2||Math.abs(i)===2&&j===0||i===0&&Math.abs(j)===2; if((i||j)&&!g) NB.push([i,j,d*Math.hypot(i,j)]); }
      const kost=new Float64Array(n*n).fill(Infinity), von=new Int32Array(n*n).fill(-1), heap=[];
      const rest=(k)=>d*Math.max(0,Math.hypot(k%n-gx,((k/n)|0)-gz)-gr);
      const push=(f,k)=>{ heap.push([f,k]); let i=heap.length-1; while(i>0){ const p=(i-1)>>1; if(heap[p][0]<=heap[i][0]) break; [heap[p],heap[i]]=[heap[i],heap[p]]; i=p; } };
      const pop=()=>{ const top=heap[0], last=heap.pop(); if(heap.length){ heap[0]=last; let i=0; for(;;){ const l=2*i+1, q=l+1; let m=i;
        if(l<heap.length&&heap[l][0]<heap[m][0]) m=l; if(q<heap.length&&heap[q][0]<heap[m][0]) m=q; if(m===i) break; [heap[m],heap[i]]=[heap[i],heap[m]]; i=m; } } return top; };
      for(const k of quelle.keys()){ kost[k]=0; push(rest(k),k); }
      let fund=-1;
      while(heap.length){ const [f,k]=pop(); if(f-rest(k)>kost[k]+1e-9) continue; if(ziel.has(k)){ fund=k; break; }
        const x=k%n, z=(k/n)|0;
        for(const [i,j,L] of NB){ const x2=x+i, z2=z+j; if(x2<0||z2<0||x2>=n||z2>=n) continue; const k2=x2+z2*n, g=Math.abs(h[k2]-h[k])/L;
          if(g>W.steilMax||zu[k2]) continue; const u=Math.max(0,g-lim)/lim;
          if(feucht[k2]<0) feucht[k2]=nass&&nass(r.x0+x2*d,r.z0+z2*d)?1:0;
          const c=kost[k]+L*(1+W.hang*u*u)*(feucht[k2]?W.furt:1);
          if(c<kost[k2]){ kost[k2]=c; von[k2]=k; push(c+rest(k2),k2); } } }
      if(fund<0) return null;
      const pts=[ziel.get(fund)];
      let k=von[fund];
      for(;k>=0&&von[k]>=0;k=von[k]) pts.push({x:r.x0+(k%n)*d, z:r.z0+((k/n)|0)*d});
      pts.push(k>=0?quelle.get(k):quelle.get(fund));
      return glaetten(pts.reverse(), hoeheAusRaster(r), W.steilMax, sperren||[]); }
    // der Lauf über das Raster knickt in seiner Teilung (26,6°): `WEG_ZWISCHEN.glaett` Durchgänge ¼ · ½ · ¼ über die Nachbarn
    // glätten ihn (≈ ±13 m), die Enden bleiben — ein Feldweg schlägt keine Haken (der Fahrer fuhr seine Knicke mit 8–11 m/s);
    // geglättet wird nur, was nicht steiler wird (die Kehre bleibt) und in keinen Grundriss rückt
    function glaetten(pts, H, max, sperren){
      const g=(p,q)=>Math.abs(H(q.x,q.z)-H(p.x,p.z))/(Math.hypot(q.x-p.x,q.z-p.z)||1);
      for(let n=0;n<WEG_ZWISCHEN.glaett;n++)
        pts=pts.map((p,i)=>{ if(i===0||i===pts.length-1) return p;
          const q={x:(pts[i-1].x+2*p.x+pts[i+1].x)/4, z:(pts[i-1].z+2*p.z+pts[i+1].z)/4};
          return g(pts[i-1],q)<=Math.max(max,g(pts[i-1],p))&&g(q,pts[i+1])<=Math.max(max,g(p,pts[i+1]))&&!gesperrt(sperren,q.x,q.z)? q : p; });
      return pts; }
    // WAS EINEM WEG IM PLAN IM WEG STEHT (fahrzeug.K2): der Grundriss jedes Slots (seine obb) und der Tritt jeder Ausstattung
    // (Stand, Brunnen, Laterne, Hof-Baum: AUSSTATTUNG `tritt`, der Baum 0,8 m) — je eine gedrehte Box {cx, cz, phi, ex, ez}, um
    // `halbM` (die halbe Breite des Wagens) gewachsen, am Ursprung (ox, oz). Leser: die Nähte des Netzes (`wegeNetz`) und der
    // Feldweg zwischen zwei Orten (`wegZwischen`), beide über `gesperrt`.
    function planSperren(plan, ox, oz, halbM){
      const A=AUSSTATTUNG, box=(x,z,phi,ex,ez)=>({cx:ox+x, cz:oz+z, phi:phi||0, ex:ex+halbM, ez:ez+halbM});
      const kreis=(p,r)=>box(p.x,p.z,0,r,r);
      return [].concat((plan.slots||[]).filter(sl=>sl.obb).map(sl=>box(sl.obb.cx,sl.obb.cz,sl.obb.phi,sl.obb.ex,sl.obb.ez)),
        (plan.staende||[]).map(p=>box(p.x,p.z,0,A.marktstand.tritt.ex,A.marktstand.tritt.ez)), (plan.brunnen||[]).map(p=>kreis(p,A.brunnen.tritt.r)),
        (plan.laternen||[]).filter(p=>!p.wand).map(p=>kreis(p,A.laterne.tritt.r)), (plan.trees||[]).map(p=>kreis(p,0.8)))
        .filter(o=>isFinite(o.cx)&&isFinite(o.cz)); }
    function gesperrt(sperren, x, z){
      for(const o of sperren){ const c=Math.cos(o.phi), s=Math.sin(o.phi), dx=x-o.cx, dz=z-o.cz;
        if(Math.abs(dx*c-dz*s)<=o.ex&&Math.abs(dx*s+dz*c)<=o.ez) return true; }
      return false; }
    // DAS WEGE-NETZ EINES PLANS (fahrzeug.K2, plan-lokal): je Punkt der Straßen und Feldwege ein Knoten, die Folge eines Wegs
    // seine Kanten, Knoten zweier Wege näher als `kreuzM` verbunden (die Kreuzung). Der Export trägt jede Straße nur so weit,
    // wie Häuser an ihr stehen (`len`), den Feldweg aber am Ende der ganzen Straße: das Netz zerfiel in Teile (das Dorf −1,−5:
    // sechs, Lücken 21–41 m längs der Hauptstraße, der Feldweg 33 m vor dem letzten Stück im Wald). DIE NÄHTE schließen es: der
    // kürzeste freie gerade Schritt aus dem Teil des ersten Knotens zum Rest (bis `bisM`), frei, wo er keinen Grundriss (die
    // obb jedes Slots) und keinen Tritt der Ausstattung (Stand, Brunnen, Laterne, Hof-Baum) näher als `halbM` streift — bis
    // EIN Netz steht. Rückgabe {knoten, kanten (je Knoten die Paare j, Länge, die Nähte darin), naehte [[i, j]]}. Leser: der
    // Wirt (`_wegeNetzGrund`: die Bewohner gehen, der Fahrer fährt es, die Nähte liegen als Feldweg).
    function wegeNetz(plan, kreuzM, halbM, bisM){
      const kn=[], kan=[], zug=[], naehte=[];
      const kante=(i,j)=>{ const w=Math.hypot(kn[i].x-kn[j].x,kn[i].z-kn[j].z); kan[i].push(j,w); kan[j].push(i,w); };
      let wi=0;
      for(const rd of (plan.roads||[]).concat(plan.feldwege||[])){ let vor=-1;
        for(const q of wegUeberBruecken(rd.pts||[], rd.bruecken)){ if(!q||!isFinite(q.x)||!isFinite(q.z)) continue;   /*über dem Wasser die Achse der Brücke (`wegUeberBruecken`)*/
          kn.push({x:q.x,z:q.z}); kan.push([]); zug.push(wi); if(vor>=0) kante(vor,kn.length-1); vor=kn.length-1; }
        wi++; }
      for(let i=0;i<kn.length;i++) for(let j=i+1;j<kn.length;j++)
        if(zug[i]!==zug[j]&&(kn[i].x-kn[j].x)**2+(kn[i].z-kn[j].z)**2<kreuzM*kreuzM) kante(i,j);
      const sperren=planSperren(plan,0,0,halbM);
      const frei=(a,b)=>{ const L=Math.hypot(b.x-a.x,b.z-a.z);
        for(let u=0;u<=L;u+=0.5) if(gesperrt(sperren,a.x+(b.x-a.x)*u/(L||1),a.z+(b.z-a.z)*u/(L||1))) return false;
        return true; };
      const teil=new Int32Array(kn.length);
      for(;;){ teil.fill(-1); let n=0;
        for(let i=0;i<kn.length;i++){ if(teil[i]>=0) continue; const offen=[i]; teil[i]=n;
          while(offen.length){ const k=offen.pop(); for(let e=0;e<kan[k].length;e+=2){ const j=kan[k][e]; if(teil[j]<0){teil[j]=n;offen.push(j);} } }
          n++; }
        if(n<2) break;
        const paare=[];
        for(let i=0;i<kn.length;i++) if(teil[i]===0) for(let j=0;j<kn.length;j++) if(teil[j]!==0){ const d=(kn[i].x-kn[j].x)**2+(kn[i].z-kn[j].z)**2; if(d<=bisM*bisM) paare.push([d,i,j]); }
        paare.sort((p,q)=>p[0]-q[0]);
        const naht=paare.find(p=>frei(kn[p[1]],kn[p[2]]));
        if(!naht) break;
        kante(naht[1],naht[2]); naehte.push([naht[1],naht[2]]); }
      return {knoten:kn, kanten:kan, naehte}; }
    // ═══ DER VERKEHR (PFLICHT-OFFEN C, gesetzt 25.10.): Wagen mit Bewohnern am Steuer auf den Trassen der Stadt ═══
    // DIE MENGE (`verkehrVon`): je `hausJeWagen` Häuser einer städtischen Siedlung (Markt bis Metropole, `plan.staedtisch`) EIN
    // Wagen, sein Fahrer ein Bewohner des Hauses floor((w + ½) · Häuser / Wagen) — gleichmäßig über den Plan; ein Dorf fährt nicht.
    // DAS NETZ (`verkehrsNetz`, am Ursprung ox/oz): die Trassen, die zwei Wagen nebeneinander tragen (jede Straße ab `breiteM`:
    // die Hauptstraßen der Stadt; Punkte zweier Trassen näher als `naheM` treffen sich), ihr längster zusammenhängender Teil. Knoten mit drei und
    // mehr Nachbarn näher als `kreuzM` sind EINE Kreuzung (mit drei und mehr Ausgängen; zwei Stücke derselben Straße stoßen
    // nur aneinander), jedes Ende ein Knotenpunkt, dazwischen die Strecken. Jede Strecke trägt zwei Spuren (rechts der Fahrt um
    // `spurM`, an einer Kreuzung um ihren Radius gekürzt), jeder Punkt frei für den halben Wagen (`halbM`): wo ein Brunnen, eine
    // Laterne, ein Stand in die Spur ragt, weicht sie aus (nach außen bis `ausweichM`, nach innen bis `einweichM`), sonst trägt die Strecke
    // keinen Wagen (`frei`); wo die Spuren dabei näher rücken als zwei halbe Wagen, ist eine ENGE (einer zur Zeit). Durch die
    // Kreuzung fährt er geradeaus gerade, sonst im Bogen seines Wendekreises (`kurveR`), wo das einen Grundriss streift (der
    // Brunnen in ihrer Mitte), im Kreisel um sie; trägt keins, ist das Abbiegen verboten (`wege`, `verboten`). Ein Netz
    // ohne Wende fährt nicht: DIE WENDE am Ende jeder Trasse — ein Kreis von `wendeM` (frei um
    // `halbM` + `wendeRandM`) `wendeAbM` vom Ende in jeder Richtung, die Spur hinein, der Kreis den langen Weg herum (von der
    // Spur heraus fort), die Spur heraus (`bahn`), je Ende bis `wendeN` — und um ihn DER PLATZ: die Stellen eines Wagens
    // (`parkL` × `parkB`) längs des Kreises, frei von Grundriss, Tritt, der Mitte jedes Wegs (die Gasse bleibt dem Fuß) und der
    // Spur zur Wende. Der Plan v2 (`ortPlan`) wählt je Ende die erste, deren Kreis und Plätze Land tragen und nicht steiler als
    // `hangMax` liegen und deren Bahn auf jeder Fläche, die sie kreuzt, binnen `flaecheM` deren Höhe trägt, und legt sie als
    // Boden (`verkehrsBoden`).
    var VERKEHR_GESETZ = { hausJeWagen: 15, breiteM: 4.9, naheM: 2.5, spurM: 1.25, halbM: 1.2, ausweichM: 3, einweichM: 2.5, kreuzM: 6, kurveR: 5.5, abbiegRandM: 0.3, kreiselRandM: 1, wendeM: 6.5,
      wendeRandM: 1.2, wendeAbM: [7, 40], wendeN: 8, parkL: 5.4, parkB: 2.3, parkRandM: 0.6, zelleM: 8, hangMax: 0.3, ringRandM: 1, flaecheM: 0.1, kreuzSpurM: 3 };
    function verkehrVon(plan){
      const sl=(plan&&plan.slots)||[], N=plan&&plan.staedtisch?Math.ceil(sl.length/VERKEHR_GESETZ.hausJeWagen):0, slots=[];
      for(let w=0;w<N;w++) slots.push(Math.min(sl.length-1,Math.floor((w+0.5)*sl.length/N)));
      return {n:N, slots}; }
    // die Sperren im Raster von `zM` (je Zelle die Boxen, die sie berühren): die Frage `gesperrt` an (x, z) liest nur ihre Zelle;
    // mit `r` die Frage, ob eine Box näher als r liegt (der Abstand zur gedrehten Box, je Zelle im Umkreis)
    function sperrenRaster(sperren, zM){
      const R=new Map();
      for(const o of sperren){ const r=Math.hypot(o.ex,o.ez);
        for(let i=Math.floor((o.cx-r)/zM);i<=Math.floor((o.cx+r)/zM);i++) for(let j=Math.floor((o.cz-r)/zM);j<=Math.floor((o.cz+r)/zM);j++){
          const k=i*2097152+j; (R.get(k)||(R.set(k,[]),R.get(k))).push(o); } }
      return (x,z,r)=>{ if(!(r>0)) return gesperrt(R.get(Math.floor(x/zM)*2097152+Math.floor(z/zM))||[],x,z);
        for(let i=Math.floor((x-r)/zM);i<=Math.floor((x+r)/zM);i++) for(let j=Math.floor((z-r)/zM);j<=Math.floor((z+r)/zM);j++)
          for(const o of R.get(i*2097152+j)||[]){ const c=Math.cos(o.phi), s=Math.sin(o.phi), dx=x-o.cx, dz=z-o.cz;
            if(Math.hypot(Math.max(0,Math.abs(dx*c-dz*s)-o.ex),Math.max(0,Math.abs(dx*s+dz*c)-o.ez))<r) return true; }
        return false; }; }
    function verkehrsNetz(plan, ox, oz){
      const V=VERKEHR_GESETZ, zu=sperrenRaster(planSperren(plan,ox,oz,0),V.zelleM);
      const zuP=sperrenRaster(planSperren(plan,ox,oz,0.2),V.zelleM);
      const frei=(x,z,r)=>!zu(x,z,r);
      const gang=(p,q,r)=>{ const m=Math.max(1,Math.ceil(Math.hypot(q.x-p.x,q.z-p.z)/0.5)); for(let u=0;u<=m;u++) if(!frei(p.x+(q.x-p.x)*u/m,p.z+(q.z-p.z)*u/m,r)) return false; return true; };
      // DIE KNOTEN: je Punkt einer Trasse, die zwei Wagen trägt (über dem Wasser die Achse der Brücke, `wegUeberBruecken`), die
      // Folge ihre Kante, zwei Punkte zweier Trassen näher als `naheM` (sie treffen sich) verbunden; DIE LÄUFE aller Wege
      // (Straßen und Feldwege), an denen kein Platz liegt (`amWeg`)
      const kn=[], nb=[], laeufe=[], netz=new Map(), zN=V.naheM;
      (plan.roads||[]).concat(plan.feldwege||[]).forEach((rd,ri)=>{ let vor=null;
        for(const q of wegUeberBruecken(rd.pts||[], rd.bruecken)){ if(!q||!isFinite(q.x)||!isFinite(q.z)) continue; const P={x:ox+q.x, z:oz+q.z};
          if(vor) laeufe.push([vor,P]); vor=P;
          if((rd.w||0)<V.breiteM) continue; const i=kn.length; kn.push(P); nb.push([]);
          if(i>0&&kn[i-1].ri===ri){ nb[i].push(i-1); nb[i-1].push(i); } P.ri=ri;
          const ix=Math.floor(P.x/zN), iz=Math.floor(P.z/zN);
          for(let a=ix-1;a<=ix+1;a++) for(let b=iz-1;b<=iz+1;b++) for(const j of netz.get(a*2097152+b)||[])
            if(kn[j].ri!==ri&&(kn[j].x-P.x)**2+(kn[j].z-P.z)**2<zN*zN&&nb[i].indexOf(j)<0){ nb[i].push(j); nb[j].push(i); }
          (netz.get(ix*2097152+iz)||(netz.set(ix*2097152+iz,[]),netz.get(ix*2097152+iz))).push(i); } });
      const n=kn.length;
      const teil=new Int32Array(n).fill(-1); let best=-1, bestL=0;
      for(let r=0;r<n;r++){ if(teil[r]>=0||!nb[r].length) continue; const st=[r]; let L=0; teil[r]=r;
        while(st.length){ const i=st.pop(); for(const j of nb[i]){ if(j>i) L+=Math.hypot(kn[j].x-kn[i].x,kn[j].z-kn[i].z); if(teil[j]<0){ teil[j]=r; st.push(j); } } }
        if(L>bestL){ bestL=L; best=r; } }
      if(best<0) return {kreuzungen:[], strecken:[], laenge:0};
      // DIE STUMMEL: ein Ende, dessen Kette bis zur nächsten Gabel kürzer als kreuzM ist, ist ein Rest der Kreuzung (ein Stück der
      // Straße ragt über den Stoß hinaus) — er fällt, bis keiner mehr bleibt
      for(let weiter=true;weiter;){ weiter=false;
        for(let i=0;i<n;i++){ if(teil[i]!==best||nb[i].length!==1) continue;
          const kette=[i]; let [v,j]=[i,nb[i][0]], L=Math.hypot(kn[j].x-kn[i].x,kn[j].z-kn[i].z);
          while(nb[j].length===2&&L<V.kreuzM){ const w=nb[j][0]===v?nb[j][1]:nb[j][0]; kette.push(j); L+=Math.hypot(kn[w].x-kn[j].x,kn[w].z-kn[j].z); [v,j]=[j,w]; }
          if(nb[j].length<3||L>=V.kreuzM) continue;
          for(const k of kette){ for(const m of nb[k]) nb[m].splice(nb[m].indexOf(k),1); nb[k].length=0; teil[k]=-1; }
          weiter=true; } }
      // DIE GRUPPEN: Knoten mit drei und mehr Nachbarn, näher als kreuzM vereint; ein Knoten, dessen Nachbarn alle in EINER
      // Gruppe liegen, liegt in ihr (das Ende eines Wegs im Dreieck der Kreuzung — sonst hieße es ein Ende ohne Weg); jeder
      // andere Knoten ist seine eigene
      const wurzel=new Int32Array(n).map((_,i)=>i), finde=(i)=>{ while(wurzel[i]!==i) i=wurzel[i]=wurzel[wurzel[i]]; return i; };
      const viel=[]; for(let i=0;i<n;i++) if(teil[i]===best&&nb[i].length>=3) viel.push(i);
      for(let a=0;a<viel.length;a++) for(let b=a+1;b<viel.length;b++){ const p=kn[viel[a]], q=kn[viel[b]];
        if((p.x-q.x)**2+(p.z-q.z)**2<V.kreuzM*V.kreuzM) wurzel[finde(viel[a])]=finde(viel[b]); }
      const drin=new Uint8Array(n); for(const i of viel) drin[i]=1;
      for(let i=0;i<n;i++) if(teil[i]===best&&!drin[i]&&nb[i].length&&nb[i].every(j=>drin[j]&&finde(j)===finde(nb[i][0]))){ wurzel[i]=finde(nb[i][0]); drin[i]=2; }
      const gruppe=(i)=>drin[i]?finde(i):i, glieder=new Map(), nach=new Map();
      for(let i=0;i<n;i++) if(teil[i]===best){ const g=gruppe(i); (glieder.get(g)||(glieder.set(g,[]),glieder.get(g))).push(i);
        for(const j of nb[i]){ const h=gruppe(j); if(h!==g) (nach.get(g)||(nach.set(g,new Set()),nach.get(g))).add(h); } }
      const mitte=new Map(); for(const [g,L] of glieder){ let x=0, z=0; for(const i of L){ x+=kn[i].x/L.length; z+=kn[i].z/L.length; } mitte.set(g,{x,z}); }
      // DIE KNOTENPUNKTE: die Kreuzung (drei und mehr Ausgänge) und das Ende (einer); ihr Radius: das weiteste Glied, die Spur, der halbe Wagen
      const kreuzungen=[], kpVon=new Map();
      for(const [g,N] of nach) if(N.size!==2){ const c=mitte.get(g); let r=0; for(const i of glieder.get(g)) r=Math.max(r,Math.hypot(kn[i].x-c.x,kn[i].z-c.z));
        kpVon.set(g,kreuzungen.length); kreuzungen.push({x:c.x, z:c.z, r:N.size>1?r+V.spurM+V.halbM:0, ende:N.size===1, strecken:[], wenden:[]}); }
      // DIE STRECKEN: von jedem Knotenpunkt jeden Ausgang entlang, bis zum nächsten Knotenpunkt (jede einmal), je Meter (die Ecken
      // bleiben). DER STUMMEL: eine Strecke kürzer als kreuzM an ein Ende ist ein Rest der Kreuzung (zwei Stücke einer Straße
      // überlappen am Stoß) — sie fällt; ein Knotenpunkt, dem so nur zwei Strecken bleiben, ist keine Kreuzung: die Spuren laufen
      // ungekürzt durch ihn (Radius 0)
      const ketten=[], gegangen=new Set();
      for(const [g,K] of kpVon) for(const h0 of nach.get(g)){ if(gegangen.has(g+">"+h0)) continue;
        const P=[mitte.get(g)]; let [vor,jetzt]=[g,h0];
        while(!kpVon.has(jetzt)){ P.push(mitte.get(jetzt)); const N=[...nach.get(jetzt)].filter(h=>h!==vor); if(N.length!==1) break; [vor,jetzt]=[jetzt,N[0]]; }
        if(!kpVon.has(jetzt)) continue;
        P.push(mitte.get(jetzt)); gegangen.add(g+">"+h0); gegangen.add(jetzt+">"+vor);
        const M=[P[0]]; for(let i=1;i<P.length;i++){ const m=Math.max(1,Math.ceil(Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z))); for(let t=1;t<=m;t++) M.push({x:P[i-1].x+(P[i].x-P[i-1].x)*t/m, z:P[i-1].z+(P[i].z-P[i-1].z)*t/m}); }
        let L=0; for(let i=1;i<M.length;i++) L+=Math.hypot(M[i].x-M[i-1].x,M[i].z-M[i-1].z);
        const J=kpVon.get(jetzt);
        if(L<V.kreuzM&&(kreuzungen[K].ende||kreuzungen[J].ende)) continue;
        ketten.push({K, J, M, L}); }
      const zahl=kreuzungen.map(()=>0); for(const c of ketten){ zahl[c.K]++; zahl[c.J]++; }
      kreuzungen.forEach((K,ki)=>{ K.r=zahl[ki]<=2?0:Math.max(K.r,V.kurveR+V.spurM); });
      const strecken=[];
      const AUSWEICH=[0]; for(let d=0.25;d<=V.ausweichM+1e-9;d+=0.25) AUSWEICH.push(d,...(d<=V.einweichM+1e-9?[-d]:[]));
      for(const {K, J, M, L} of ketten){
        const id=strecken.length, A=kreuzungen[K], B=kreuzungen[J];
        let ok=true, stelle=null;
        // die Spur je Punkt der Mitte und ihr Abstand zu ihr (`off`, NaN: in der Kreuzung gekürzt)
        const spur=(Q,r0,r1)=>{ const S=[], off=new Float64Array(Q.length).fill(NaN);
          for(let i=0;i<Q.length;i++){ const a=Q[Math.max(0,i-1)], b=Q[Math.min(Q.length-1,i+1)], l=Math.hypot(b.x-a.x,b.z-a.z)||1, ux=(b.x-a.x)/l, uz=(b.z-a.z)/l;
            if(Math.hypot(Q[i].x-Q[0].x,Q[i].z-Q[0].z)<r0||Math.hypot(Q[i].x-Q[Q.length-1].x,Q[i].z-Q[Q.length-1].z)<r1) continue;
            let q=null; for(const d of AUSWEICH){ const o=V.spurM+d, x=Q[i].x-uz*o, z=Q[i].z+ux*o; if(frei(x,z,V.halbM)){ q={x,z}; off[i]=o; break; } }
            if(!q){ if(ok) stelle={x:Q[i].x, z:Q[i].z}; ok=false; q={x:Q[i].x-uz*V.spurM, z:Q[i].z+ux*V.spurM}; off[i]=V.spurM; }
            S.push(q); }
          return {S, off}; };
        const hin=spur(M,A.r,B.r), her=spur(M.slice().reverse(),B.r,A.r);
        // DIE ENGE: wo eine Spur nach innen weicht, bis zwei Wagen nicht mehr nebeneinander passen (die Spuren näher als zwei
        // halbe Wagen), fährt einer zur Zeit — je Lauf solcher Punkte EIN Ort (Mitte, Radius über seine Punkte samt Wagen)
        const engen=[]; let lauf=null;
        for(let i=0;i<=M.length;i++){ const eng=i<M.length&&hin.off[i]+her.off[M.length-1-i]<2*V.halbM;
          if(eng) (lauf||(lauf=[])).push(M[i]);
          else if(lauf){ const c={x:0,z:0}; for(const q of lauf){ c.x+=q.x/lauf.length; c.z+=q.z/lauf.length; }
            let r=0; for(const q of lauf) r=Math.max(r,Math.hypot(q.x-c.x,q.z-c.z)); engen.push({x:c.x, z:c.z, r:r+V.spurM+V.halbM}); lauf=null; } }
        strecken.push({a:K, b:J, laenge:L, mitte:M, spur:[hin.S,her.S], frei:ok&&hin.S.length>1&&her.S.length>1, stelle, engen});
        A.strecken.push(id); B.strecken.push(id); }
      // DIE WENDE an jedem Ende: der Kreis, die Bahn (Spur hinein, der lange Bogen, Spur heraus) und die Plätze an ihm
      const R2=new Map(), zM=V.zelleM, key=(x,z)=>Math.floor(x/zM)*2097152+Math.floor(z/zM);
      for(const [a,b] of laeufe){
        for(let x=Math.floor(Math.min(a.x,b.x)/zM)-1;x<=Math.floor(Math.max(a.x,b.x)/zM)+1;x++)
          for(let z=Math.floor(Math.min(a.z,b.z)/zM)-1;z<=Math.floor(Math.max(a.z,b.z)/zM)+1;z++){ const k=x*2097152+z; (R2.get(k)||(R2.set(k,[]),R2.get(k))).push([a,b]); } }
      const amWeg=(x,z,r)=>{ for(const [a,b] of R2.get(key(x,z))||[]){ const dx=b.x-a.x, dz=b.z-a.z, l2=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l2));
        if((x-a.x-dx*t)**2+(z-a.z-dz*t)**2<r*r) return true; } return false; };
      const nahStrecke=(x,z,Q,r)=>{ for(let i=1;i<Q.length;i++){ const a=Q[i-1], b=Q[i], dx=b.x-a.x, dz=b.z-a.z, l2=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l2));
        if((x-a.x-dx*t)**2+(z-a.z-dz*t)**2<r*r) return true; } return false; };
      const W=(a)=>Math.atan2(Math.sin(a),Math.cos(a));
      // DIE ABBIEGER (`wege`: „von>nach" der Strecken → die Punkte zwischen der Spur hinein und der Spur hinaus): geradeaus die
      // gerade Verbindung; jeder andere der BOGEN mit dem Wendekreis der Stadtwagen (`kurveR`), tangential an die Verlängerung
      // beider Spuren — die Spur endet an der Kreuzung um ihn gekürzt (ihr Radius mindestens kurveR samt Spur), er beginnt nie
      // vor ihrem Ende; frei, wo er keinen Grundriss und keinen Tritt näher als den halben Wagen samt `abbiegRandM` streift (der
      // Wagen schert im Bogen nach innen aus); sonst DER KREISEL um die Mitte (sie zur Linken, in der Ordnung der rechten Spur) auf
      // dem kleinsten freien Radius ab kurveR; sonst ist das Abbiegen verboten (`verboten`)
      const richtung=(Q,ende)=>{ const a=ende?Q[Math.max(0,Q.length-3)]:Q[0], b=ende?Q[Q.length-1]:Q[Math.min(Q.length-1,2)], l=Math.hypot(b.x-a.x,b.z-a.z)||1; return {x:(b.x-a.x)/l, z:(b.z-a.z)/l}; };
      const bogen=(p,u,q,w,R)=>{ const dt=u.x*w.x+u.z*w.z, cr=u.x*w.z-u.z*w.x;
        if(dt>0.995) return [];
        if(dt<-0.9||Math.abs(cr)<1e-6) return null;
        const t=((q.x-p.x)*w.z-(q.z-p.z)*w.x)/cr, X={x:p.x+u.x*t, z:p.z+u.z*t};
        const d=R*Math.tan(Math.acos(Math.max(-1,Math.min(1,dt)))/2), sq=(q.x-X.x)*w.x+(q.z-X.z)*w.z;
        if(t<d-0.5||sq<d-0.5) return null;
        const T1={x:X.x-u.x*d, z:X.z-u.z*d}, T2={x:X.x+w.x*d, z:X.z+w.z*d};
        const nx=w.x-u.x*dt, nz=w.z-u.z*dt, nl=Math.hypot(nx,nz), C={x:T1.x+nx/nl*R, z:T1.z+nz/nl*R};
        const a1=Math.atan2(T1.z-C.z,T1.x-C.x), da=Math.atan2(Math.sin(Math.atan2(T2.z-C.z,T2.x-C.x)-a1),Math.cos(Math.atan2(T2.z-C.z,T2.x-C.x)-a1));
        const A=[], m=Math.max(2,Math.ceil(Math.abs(da)*R)); for(let k=0;k<=m;k++) A.push({x:C.x+Math.cos(a1+da*k/m)*R, z:C.z+Math.sin(a1+da*k/m)*R});
        return A; };
      kreuzungen.forEach((K,ki)=>{ K.verboten=[]; K.wege={}; if(K.ende) return; const r0=V.halbM, rB=V.halbM+(K.r>0?V.abbiegRandM:0);
        for(const si of K.strecken) for(const so of K.strecken){ if(si===so) continue; const a=strecken[si], b=strecken[so];
          const rein=a.b===ki?a.spur[0]:a.spur[1], raus=b.a===ki?b.spur[0]:b.spur[1], wort=si+">"+so;
          if(rein.length<2||raus.length<2){ K.verboten.push(wort); continue; }
          const p=rein[rein.length-1], q=raus[0], frei=(A,r)=>{ const P=[p,...A,q]; for(let i=1;i<P.length;i++) if(!gang(P[i-1],P[i],r)) return false; return true; };
          // durch einen Stoß (keine Kreuzung, Radius 0) laufen die Spuren ungekürzt: die gerade Verbindung
          const B=K.r>0?bogen(p,richtung(rein,true),q,richtung(raus,false),V.kurveR):[];
          if(B&&frei(B,B.length?rB:r0)){ K.wege[wort]=B; continue; }
          let weg=null;
          if(K.r>0){ const ap=Math.atan2(p.z-K.z,p.x-K.x), aq=Math.atan2(q.z-K.z,q.x-K.x); let span=ap-aq; span-=Math.floor(span/(2*Math.PI))*2*Math.PI; if(span<0.3) span+=2*Math.PI;
            for(let rho=V.kurveR;rho<=K.r+V.kreiselRandM&&!weg;rho+=0.5){ const A=[], m=Math.max(2,Math.ceil(span*rho));
              for(let t=0;t<=m;t++){ const w=ap-span*t/m; A.push({x:K.x+Math.cos(w)*rho, z:K.z+Math.sin(w)*rho}); }
              if(frei(A,r0)) weg=A; } }
          if(weg) K.wege[wort]=weg; else K.verboten.push(wort); }
        // DIE VERTRÄGLICHKEIT (`konflikt`): zwei Wege durch die Kreuzung, die einander nirgends näher kommen als zwei halbe Wagen
        // (ein Bogen schert um (parkL/2)²/(2·kurveR) weiter aus) — samt `kreuzSpurM` ihrer Spuren davor und danach —, fahren
        // zugleich (geradeaus gegeneinander, rechts ab nebeneinander); jedes andere Paar einer nach dem anderen
        K.konflikt=[]; const zug=(wort)=>{ const [si,so]=wort.split(">").map(Number), a=strecken[si], b=strecken[so];
          const rein=a.b===ki?a.spur[0]:a.spur[1], raus=b.a===ki?b.spur[0]:b.spur[1], P=[];
          for(let i=rein.length-1, L=0;i>=0&&L<=V.kreuzSpurM;i--){ if(P.length) L+=Math.hypot(rein[i].x-P[0].x,rein[i].z-P[0].z); P.unshift(rein[i]); }
          P.push(...K.wege[wort]); for(let i=0, L=0;i<raus.length&&L<=V.kreuzSpurM;i++){ const q=P[P.length-1]; L+=Math.hypot(raus[i].x-q.x,raus[i].z-q.z); P.push(raus[i]); }
          return {P, krumm:K.wege[wort].length>0}; };
        const woerter=Object.keys(K.wege), Z=woerter.map(zug), aus=(V.parkL/2)**2/(2*V.kurveR);
        const abst=(A,B)=>{ let m=Infinity; for(const p of A) for(let j=1;j<B.length;j++){ const a=B[j-1], b=B[j], dx=b.x-a.x, dz=b.z-a.z, l2=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/l2)); m=Math.min(m,Math.hypot(p.x-a.x-dx*t,p.z-a.z-dz*t)); } return m; };
        for(let i=0;i<woerter.length;i++) for(let j=i+1;j<woerter.length;j++){ const g=2*V.halbM+(Z[i].krumm?aus:0)+(Z[j].krumm?aus:0);
          if(Math.min(abst(Z[i].P,Z[j].P),abst(Z[j].P,Z[i].P))<g) K.konflikt.push(woerter[i]+"|"+woerter[j], woerter[j]+"|"+woerter[i]); } });
      kreuzungen.forEach((K,ki)=>{ if(!K.ende||!K.strecken.length) return; const s=strecken[K.strecken[0]];
        const rein=s.b===ki?s.spur[0]:s.spur[1], raus=s.b===ki?s.spur[1]:s.spur[0], M=s.b===ki?s.mitte:s.mitte.slice().reverse();
        if(rein.length<2||raus.length<2) return;
        const pin=rein[rein.length-1], pout=raus[0], e=M[M.length-1], d0=M[Math.max(0,M.length-4)], l=Math.hypot(e.x-d0.x,e.z-d0.z)||1, ux=(e.x-d0.x)/l, uz=(e.z-d0.z)/l;
        for(let k=V.wendeAbM[0];k<=V.wendeAbM[1]&&K.wenden.length<V.wendeN;k++) for(const a of [0,0.5,-0.5,1,-1,1.5,-1.5,2,-2,2.5,-2.5]){ if(K.wenden.length>=V.wendeN) break;
          const cx=e.x+(ux*Math.cos(a)-uz*Math.sin(a))*k, cz=e.z+(uz*Math.cos(a)+ux*Math.sin(a))*k;
          if(K.wenden.some(w=>Math.hypot(w.x-cx,w.z-cz)<3)) continue;
          // der Kreis frei: keine Sperre näher als Rf an seiner Mitte (der Abstand zur gedrehten Box)
          const Rf=V.wendeM+V.halbM+V.wendeRandM; if(zu(cx,cz,Rf)) continue;
          // die Bahn hinein und heraus treffen den Ring mindestens zwei Spuren auseinander (die Sehne 2·spurM): bis hier liefen
          // beide zum Ring-Punkt Richtung Ende, bei fernem Kreis fast derselbe — zwei Wagen gegeneinander standen dort Bug an Bug
          let ain=Math.atan2(pin.z-cz,pin.x-cx), aout=Math.atan2(pout.z-cz,pout.x-cx); const dreh=W(ain-aout)>=0?1:-1;
          const dMin=2*Math.asin(Math.min(1,V.spurM/V.wendeM)), dA0=W(ain-aout)*dreh;
          if(dA0<dMin){ const mA=aout+dreh*dA0/2; [ain,aout]=[mA+dreh*dMin/2, mA-dreh*dMin/2]; }
          const e1={x:cx+Math.cos(ain)*V.wendeM, z:cz+Math.sin(ain)*V.wendeM}, e2={x:cx+Math.cos(aout)*V.wendeM, z:cz+Math.sin(aout)*V.wendeM};
          if(!gang(pin,e1,V.halbM)||!gang(e2,pout,V.halbM)) continue;
          let span=(aout-ain)*dreh; span-=Math.floor(span/(2*Math.PI))*2*Math.PI; if(span<Math.PI) span+=2*Math.PI;
          const bahn=[pin], m=Math.ceil(span*V.wendeM);
          for(let t=0;t<=m;t++){ const w=ain+dreh*span*t/m; bahn.push({x:cx+Math.cos(w)*V.wendeM, z:cz+Math.sin(w)*V.wendeM}); }
          bahn.push(pout);
          // die Plätze: tangential am Ring um den Kreis, in der Richtung des Bogens (er fährt vorwärts aus ihm heraus)
          const rP=V.wendeM+V.halbM+V.parkRandM+V.parkB/2, plaetze=[], dA=(V.parkL+V.parkRandM)/rP;
          for(let w=0;w<2*Math.PI-dA/2;w+=dA){ const b=ain+dreh*w, x=cx+Math.cos(b)*rP, z=cz+Math.sin(b)*rP, tx=-Math.sin(b)*dreh, tz=Math.cos(b)*dreh;
            let frei2=true;
            for(const u of [-0.5,-0.25,0,0.25,0.5]) for(const v of [-0.5,0,0.5]){ const lx=u*V.parkL, lz=v*V.parkB, px=x+tx*lx-tz*lz, pz=z+tz*lx+tx*lz;
              if(zuP(px,pz)||amWeg(px,pz,V.halbM)||nahStrecke(px,pz,[pin,e1],V.halbM)||nahStrecke(px,pz,[e2,pout],V.halbM)) frei2=false; }
            if(frei2) plaetze.push({x, z, beta:b, fahrt:Math.atan2(tx,tz)}); }
          K.wenden.push({x:cx, z:cz, r:V.wendeM, frei:Rf, dreh, ain, aout, bahn, plaetze}); } });
      let laenge=0; for(const s of strecken) if(s.frei) laenge+=s.laenge;
      return {kreuzungen, strecken, laenge}; }
    // DIE WENDE IST BODEN DER STADT (PFLICHT-OFFEN C, der Plan v2 `ortPlan`): je Ende des Netzes (`verkehrsNetz`) die erste Wende,
    // deren Kreis und Plätze Land tragen (ctx.wasserAt) und deren Grund (ctx.hoeheAt) nicht steiler als `hangMax` liegt (`wende`,
    // sonst null); ihr Ring (der Wagen samt `ringRandM`), die Spur hinein und heraus und ihre Plätze liegen als Erdbau auf der
    // Höhe der Fläche am Ende (`flaeche`: der Weg dort) — EINE Fläche mit dem Weg. Bis dahin lag die Wende auf dem Grund neben
    // der Trasse (die Böschung 60 %): Stufen über 0,2 m je 0,5 m an jeder Bahn, kein Ende trug eine Wende, kein Wagen fuhr.
    // Rückgabe {netz, erdbau}. Leser: der Wirt (`_verkehrAnlegen`: das Netz, die Wenden, ihr Bild über den Hebel der Dörfer).
    function verkehrsBoden(plan, ox, oz, ctx, flaeche){
      const V=VERKEHR_GESETZ, N=verkehrsNetz(plan,ox,oz), erdbau=[], r6=(v)=>Math.round(v*1e6)/1e6;
      const land=(x,z)=>!(ctx.wasserAt&&ctx.wasserAt(x,z)), h=(x,z)=>ctx.hoeheAt(x,z);
      const trasse=(a,b,y,w)=>erdbau.push({art:"trasse", x0:r6(a.x), z0:r6(a.z), y0:y, x1:r6(b.x), z1:r6(b.z), y1:y, w:r6(w)});
      for(const K of N.kreuzungen){ K.wende=null; if(!K.ende) continue;
        const y=flaeche(K.x,K.z); if(y===null||!isFinite(y)) continue;
        for(const w of K.wenden){ const h0=h(w.x,w.z); let ok=land(w.x,w.z)&&isFinite(h0);
          for(let a=0;a<12&&ok;a++){ const x=w.x+Math.cos(a*Math.PI/6)*w.r, z=w.z+Math.sin(a*Math.PI/6)*w.r; ok=land(x,z)&&Math.abs(h(x,z)-h0)<=V.hangMax*w.r; }
          if(!ok) continue;
          // die Bahn liegt, wo sie eine Fläche der Stadt kreuzt (das Ende des Wegs, ein Nachbar), auf deren Höhe: sonst wählte
          // der Plan einen Ring, der über den fallenden Weg läuft — eine Stufe in der Fläche
          for(let i=1;i<w.bahn.length&&ok;i++){ const a=w.bahn[i-1], b=w.bahn[i], m=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/0.5));
            for(let u=0;u<=m&&ok;u++){ const f=flaeche(a.x+(b.x-a.x)*u/m,a.z+(b.z-a.z)*u/m); if(f!==null&&Math.abs(f-y)>V.flaecheM) ok=false; } }
          if(!ok) continue;
          const plaetze=w.plaetze.filter(p=>{ const fx=Math.sin(p.fahrt), fz=Math.cos(p.fahrt), hs=[];
            for(const u of [-1,1]) for(const v of [-1,1]){ const x=p.x+fx*u*V.parkL*0.5-fz*v*V.parkB*0.5, z=p.z+fz*u*V.parkL*0.5+fx*v*V.parkB*0.5;
              if(!land(x,z)) return false; hs.push(h(x,z)); }
            return land(p.x,p.z)&&Math.max(...hs)-Math.min(...hs)<=V.hangMax*V.parkL; });
          K.wende=Object.assign({},w,{plaetze,y:r6(y)}); break; }
        const w=K.wende; if(!w) continue;
        const ring=[]; for(let a=0;a<=2*Math.PI+1e-9;a+=1/w.r) ring.push({x:w.x+Math.cos(a)*w.r, z:w.z+Math.sin(a)*w.r});
        for(let i=1;i<ring.length;i++) trasse(ring[i-1],ring[i],w.y,2*V.halbM+V.ringRandM);
        trasse(w.bahn[0],w.bahn[1],w.y,2*V.halbM); trasse(w.bahn[w.bahn.length-2],w.bahn[w.bahn.length-1],w.y,2*V.halbM);
        for(const p of w.plaetze){ const fx=Math.sin(p.fahrt)*V.parkL*0.5, fz=Math.cos(p.fahrt)*V.parkL*0.5;
          trasse({x:p.x-fx,z:p.z-fz},{x:p.x+fx,z:p.z+fz},w.y,V.parkB); } }
      return {netz:N, erdbau}; }
    function strassengraph(rnd, plan, sW, lw, Rw, H){
  const staedt=plan.staedtisch, jahr=plan.jahr, DS=3;
  const kruemm= staedt?0.006:(jahr<1500?0.016:jahr<1800?0.010:0.003);
  const grid=(plan.region==='antik')||(staedt&&jahr>=1800);
  const nodes=[{x:0,z:0}], edges=[];
  const deg=k=>{ let d=0; for(const e of edges){ if(e.a===k||e.b===k)d++; } return d; };
  function walk(x0,z0,th0,len,gen){ const pts=[]; let x=x0,z=z0,dev=0;
    if(H){ for(let u=0;u<=len;u+=DS){ const th=trasseLenk(H,x,z,th0+dev,DS); dev=th-th0; pts.push({x,z,th});   /*DIE TRASSE (K3): der Punkt traegt die Richtung seines Schritts*/
        if(Rw&&Math.hypot(x,z)>Rw-8){ break; }
        x+=Math.cos(th)*DS; z+=Math.sin(th)*DS; dev+=(rnd()-0.5)*2*kruemm*DS - dev*0.028*DS; }
      return pts; }
    for(let u=0;u<=len;u+=DS){ const th=th0+dev; pts.push({x,z,th});
      if(Rw&&Math.hypot(x,z)>Rw-8){ break; }
      dev+=(rnd()-0.5)*2*kruemm*DS - dev*0.028*DS; x+=Math.cos(th0+dev)*DS; z+=Math.sin(th0+dev)*DS; }
    return pts; }
  const nT= staedt? ((plan.groesse==='grossstadt'||plan.groesse==='metropole')?4:(rnd()<0.5?4:3)) : 2;
  const tips=[];
  for(let a2=0;a2<nT;a2++){ const th= grid? a2*Math.PI*2/nT : (a2*2*Math.PI/nT+(rnd()-0.5)*0.5);
    tips.push({node:0, th, gen:0, steps: staedt?(plan.groesse==='metropole'?16: plan.groesse==='grossstadt'?7:4)+((rnd()*2)|0) : 6+((rnd()*3)|0)}); }
  const maxE= staedt? (plan.groesse==='metropole'?Math.min(150,40+(((plan.nGestalt||plan.houses.length)*0.36)|0)): plan.groesse==='grossstadt'?54:24) : 8, gates=[];
  while(tips.length&&edges.length<maxE){
    const t=tips.shift(); if(t.steps<=0) continue;
    const nd=nodes[t.node];
    if(Rw&&Math.hypot(nd.x,nd.z)>Rw-14){ if(t.gen===0)gates.push({th:Math.atan2(nd.z,nd.x)}); continue; }
    const pts=walk(nd.x,nd.z,t.th, (staedt?34:26)+rnd()*(staedt?30:26), t.gen);
    if(pts.length<4) { if(t.gen===0)gates.push({th:Math.atan2(nd.x?nd.x:Math.cos(t.th),0)*0+Math.atan2(Math.sin(t.th),Math.cos(t.th))}); continue; }
    const ex=pts[pts.length-1]; let endNode=-1, dead=false;
    let bi=-1,bd=1e9; nodes.forEach((q,i2)=>{ if(i2===t.node)return; const d=Math.hypot(ex.x-q.x,ex.z-q.z); if(d<bd){bd=d;bi=i2;} });
    if(bd<(staedt?16:13)&&!trasseSteil(H,[pts[pts.length-2],nodes[bi]])){ endNode=bi; dead=true;                                                        // SNAP an Knoten → Zyklus
      const P=nodes[bi], pv=pts[pts.length-2]; pts[pts.length-1]={x:P.x,z:P.z,th:Math.atan2(P.z-pv.z,P.x-pv.x)}; }
    else { let be=-1,bk=0,ed=1e9;
      edges.forEach((e,ei)=>{ e.pts.forEach((q,k)=>{ const d=Math.hypot(ex.x-q.x,ex.z-q.z); if(d<ed){ed=d;be=ei;bk=k;} }); });
      if(ed<(staedt?12:9)&&edges.length&&!trasseSteil(H,[pts[pts.length-2],edges[be].pts[bk]])){ const q=edges[be].pts[bk]; nodes.push({x:q.x,z:q.z}); endNode=nodes.length-1; dead=true;  // SNAP an Kante
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
        if(!frei||trasseSteil(H,pts))continue;
        edges.push({a:i2,b:j2,pts,w:sW*0.78,gen:1}); added++; } } } }
  return {nodes, edges, gates};
}
    // DER RING DER MAUER (STADTMAUER-GESETZ, EIN Gesetz fuer das Layout und den Schnitt): NV Ecken auf dem Radius Rw (je ±1,5 %
    // aus rnd), offen auf gA rad um jedes Tor, je fuenfte Ecke ein Turm. Leser: dorfLayout (die ummauerte Gestalt) · schnittMauer.
    // prettier-ignore
    function mauerRing(Rw, gatePts, rnd){ const NV=30, segs=[], towers=[], vr=[];
    for(let k2=0;k2<NV;k2++) vr.push(Rw*(0.985+rnd()*0.03));
    const gA=0.30;
    for(let k2=0;k2<NV;k2++){ const a0=k2/NV*2*Math.PI, a1=(k2+1)/NV*2*Math.PI, am=(a0+a1)/2;
      const nearGate=gatePts.some(g2=>Math.abs(Math.atan2(Math.sin(am-g2.th),Math.cos(am-g2.th)))<gA);
      if(nearGate) continue;
      segs.push({x0:Math.cos(a0)*vr[k2], z0:Math.sin(a0)*vr[k2], x1:Math.cos(a1)*vr[(k2+1)%NV], z1:Math.sin(a1)*vr[(k2+1)%NV]});
      if(k2%5===0) towers.push({x:Math.cos(a0)*vr[k2], z:Math.sin(a0)*vr[k2]}); }
    return {segs, towers, R:Rw, gates:gatePts}; }
    // DIE MAUER DES SCHNITTS (siedlung.K4): die Gestalt einer Chronik ist die Gegenwart (unummauert, ihr Layout traegt keinen Ring);
    // steht ihr Schnitt staedtisch vor MAUER_BIS (das STADTMAUER-GESETZ an seiner Epoche), umschliesst ihn sein Ring — ueber dem
    // Layout, das er nicht beruehrt (die Jahresringe bleiben): der Radius traegt jeden Grundriss des Schnitts samt MAUER_SAUM, ein
    // Tor steht, wo eine Gasse den Ring kreuzt (je 0,5 rad eines). Bis w3w fiel die Mauer im Schnitt: die Hanse von 56 Haeusern
    // stand ohne sie. Leser: exportSettlement.
    var MAUER_BIS = 1750, MAUER_SAUM = 6;
    // prettier-ignore
    function schnittMauer(slots, roads, seed){
  let Rw=0; for(const q of slots){ const o=q.obb; if(o) Rw=Math.max(Rw, Math.hypot(o.cx,o.cz)+Math.hypot(o.ex,o.ez)); }
  if(!(Rw>0)) return null; Rw+=MAUER_SAUM;
  const th=[];
  for(const rd of roads||[]) for(let k=1;k<(rd.pts||[]).length;k++){ const A=rd.pts[k-1], B=rd.pts[k], ra=Math.hypot(A.x,A.z), rb=Math.hypot(B.x,B.z);
    if((ra-Rw)*(rb-Rw)>0||ra===rb) continue; const f=(Rw-ra)/(rb-ra); th.push(Math.atan2(A.z+(B.z-A.z)*f, A.x+(B.x-A.x)*f)); }
  const gatePts=[];
  for(const t of th){ if(gatePts.some(g=>Math.abs(Math.atan2(Math.sin(g.th-t),Math.cos(g.th-t)))<0.5)) continue; gatePts.push({x:Math.cos(t)*Rw, z:Math.sin(t)*Rw, th:t}); }
  if(gatePts.length<2){ const t=(gatePts[0]?gatePts[0].th:0)+Math.PI; gatePts.push({x:Math.cos(t)*Rw, z:Math.sin(t)*Rw, th:t}); }
  let s=((Math.round((seed||1)*577+13)*2654435761)>>>0); const rnd=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
  return mauerRing(Rw, gatePts, rnd); }
    // ════════════ dorfLayout v5 — GRAPH-WACHSTUM + MAUER ════════════
    // prettier-ignore
    function dorfLayout(plan, ext, seed, H){
  const N=plan.norm, gap=N.gap, sW=N.strasseW, lw=N.laneW, gw=N.gehweg, n=ext.length, nG=plan.nGestalt||n;   /*nG: die Lose der GESTALT (der Chronik) — Mauer, Platz und Staende stehen fuer jeden Schnitt gleich*/
  let s=((Math.round((seed||1)*389+71)*2654435761)>>>0); const rnd=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
  const staedt=plan.staedtisch;
  const jitAmp= staedt?0.05 : (plan.jahr<1500?0.9 : plan.jahr<1780?0.45 : 0.2);
  const DS=3;
  const walled= staedt&&plan.jahr<MAUER_BIS;                                                // STADTMAUER-GESETZ: die Mauer erzwingt die Dichte
  const Rw= walled? Math.min(195, 26+Math.sqrt(nG)*8.4) : 0;
  const G=strassengraph(rnd, plan, sW, lw, Rw, H||null);
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
            for(let m9=0;m9<roads.length;m9++){ if(m9===i||m9===j)continue; if(punktAuf(roads[m9],wx,wz).d<5.5){frei9=false;break;} } }
          if(!frei9) continue;
          const gp=[]; const gl=Q.d; for(let u9=0;u9<=gl;u9+=DS) gp.push({x:P.x+Math.cos(qth)*Math.min(u9,gl), z:P.z+Math.sin(qth)*Math.min(u9,gl), th:qth});
          gp.push({x:Q.x,z:Q.z,th:qth});
          if(trasseSteil(H,gp)) continue;                                                       /*DIE TRASSE (K3): die gerade Quergasse steigt nicht ueber das Gesetz*/
          roads.push({a:-1,b:-1,pts:gp,w:Math.max(2.6, lw*0.72),gen:2,len:gl,quer:true}); edepth.push(Math.min(edepth[i],edepth[j])+1);   /*quer-Flag: BINNENGASSE, nicht Vorstadt*/   /*len fehlte — (rd.len||0)=0 liess den Setzer die Gasse ueberspringen: WURZEL der Unbesaeumtheit (#1)*/
          paar.add(i+'_'+j); qN++;
          const P2=at(roads[i], li*(fu+0.28)); if(fu<0.5&&qN<qMax2){ const Q2=punktAuf(roads[j], P2.x, P2.z);   /*PAARUNG: zweite Parallelgasse je Block — erst zwei Schnitte machen QUARTIERE*/
            if(Q2.d>=13&&Q2.d<=48){ const th2=Math.atan2(Q2.z-P2.z,Q2.x-P2.x);
              if(Math.abs(Math.sin(th2-P2.th))>=0.55){ let fr2=true;
                for(let u9=3;u9<Q2.d-3&&fr2;u9+=3){ const wx=P2.x+Math.cos(th2)*u9, wz=P2.z+Math.sin(th2)*u9;
                  for(let m9=0;m9<roads.length;m9++){ if(m9===i||m9===j)continue; if(punktAuf(roads[m9],wx,wz).d<5.5){fr2=false;break;} } }
                if(fr2){ const gp2=[]; for(let u9=0;u9<=Q2.d;u9+=DS) gp2.push({x:P2.x+Math.cos(th2)*Math.min(u9,Q2.d), z:P2.z+Math.sin(th2)*Math.min(u9,Q2.d), th:th2});
                  gp2.push({x:Q2.x,z:Q2.z,th:th2});
                  if(!trasseSteil(H,gp2)){ roads.push({a:-1,b:-1,pts:gp2,w:Math.max(2.6, lw*0.72),gen:2,len:Q2.d,quer:true}); edepth.push(Math.min(edepth[i],edepth[j])+1); qN++; } } } } }
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
      const fp=[]; if(H){ let x=gx+Math.cos(g2.th), z=gz+Math.sin(g2.th), th=g2.th;          /*DIE TRASSE (K3): die Ausfallstrasse lenkt wie jede Gasse*/
        for(let u=0;u<=flen;u+=DS){ th=trasseLenk(H,x,z,th,DS); fp.push({x,z,th}); x+=Math.cos(th)*DS; z+=Math.sin(th)*DS; } }
      else for(let u=0;u<=flen;u+=DS){ fp.push({x:gx+Math.cos(g2.th)*(u+1), z:gz+Math.sin(g2.th)*(u+1), th:g2.th}); }
      roads.push({a:-1,b:-1,pts:fp,w:sW*0.6,gen:2}); edepth.push(7);
      if(plan.groesse==='metropole'||plan.groesse==='grossstadt'){                            // FAUBOURG-GESETZ: die Vorstadt ist selbst ein Netz
        const nq=(plan.groesse==='metropole')?5:2;
        for(let qk=0;qk<nq;qk++){ const uq=26+qk*(flen-40)/Math.max(1,nq-1)+rnd()*10, sg=(rnd()<0.5?1:-1);
          const qx=gx+Math.cos(g2.th)*uq, qz=gz+Math.sin(g2.th)*uq, qth=g2.th+sg*Math.PI/2+(rnd()-0.5)*0.25;
          const qp=[]; if(H){ let x=qx, z=qz, th=qth; for(let u=0;u<=40+rnd()*22;u+=DS){ th=trasseLenk(H,x,z,th,DS); qp.push({x,z,th}); x+=Math.cos(th)*DS; z+=Math.sin(th)*DS; } }
          else for(let u=0;u<=40+rnd()*22;u+=DS){ qp.push({x:qx+Math.cos(qth)*u, z:qz+Math.sin(qth)*u, th:qth}); }
          roads.push({a:-1,b:-1,pts:qp,w:lw,gen:2}); edepth.push(8); } } } }
  const pl=new Array(n), obbs=(plan.belegt||[]).map(o=>({i:'belegt',o})), brunnen=[], fences=[], felder=[], staende=[];   /*belegt: Grundrisse, die vor jedem Haus stehen (der Kern eines Rings, `ringUm`)*/
  let platz=null;
  if(!staedt||plan.kernel==='markt'){ const PW=Math.max(7,5+Math.min(nG,40)*0.30), PD=Math.max(6,PW*0.55);
    platz={cx:0,cz:sW/2+PD/2, phi:0, ex:PW, ez:PD/2, typ:(plan.kernel==='anger'||(staedt&&plan.jahr>1840))?'gras':'weg'};   // PARK-GESETZ der Moderne brunnen.push({x:0,z:sW/2+PD/2});
    if(platz.typ==='weg'){ staende.push({x:-PW*0.45,z:sW/2+PD*0.45}); staende.push({x:PW*0.45,z:sW/2+PD*0.55}); if(nG>18)staende.push({x:0,z:sW/2+PD*0.82}); } }
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
      if(ok){ const k0=(sc/DS)|0, kw=(((exH+rd.w/2+gw+4)/DS)|0)+1;
        for(let r2=0;r2<roads.length&&ok;r2++){ const rr=roads[r2], own=(r2===cu.rd);
          for(let k5=0;k5<rr.pts.length;k5++){ const q2=rr.pts[k5], thr=(own&&Math.abs(k5-k0)<=kw)?(rr.w/2+0.02):(rr.w/2+0.25);
            if(!fernOBB(q2.x,q2.z,o,thr)&&distPunktOBB(q2.x,q2.z,o)<thr){ ok=false; break; } } } }
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
        const o={cx:ccx,cz:ccz,phi,ex:(e.x1-e.x0)/2,ez:(e.z1-e.z0)/2};                              /*die obb im Rahmen der Scheune (phi): exS/ezS stehen im Rahmen des Hauses P0 — gedreht trug sie quer zur Scheune deren Masse vertauscht (siedlung-k3-heil: 23 von 27 Scheunen, das Fundament der Welt 0,1-0,5 m zu schmal)*/
        let ok=true;
        if(Rw){ const rc=Math.hypot(ccx,ccz), rq=Math.hypot(exS,ezS), rp=Math.hypot(P0.obb.cx,P0.obb.cz);
          if(rp<Rw&&rc>Rw-2.2-rq) ok=false; if(rp>Rw&&rc<Rw+1.2+rq) ok=false; if(Math.abs(rc-Rw)<2.0+rq) ok=false; }
        if(ok) for(const q2 of obbs){ if(q2.i===j){ if(obbSep(o,q2.o)<0.9)ok=false; }
          else if(obbSep(o,q2.o)<gap-1e-6)ok=false; if(!ok)break; }
        if(ok&&platzObb&&obbSep(o,platzObb)<0.5)ok=false;
        if(ok){ for(const rr of roads){ for(const q3 of rr.pts){ if(!fernOBB(q3.x,q3.z,o,rr.w/2+0.25)&&distPunktOBB(q3.x,q3.z,o)<rr.w/2+0.25){ok=false;break;} } if(!ok)break; } }
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
        if(ok){ for(const rr of roads){ for(const q3 of rr.pts){ if(!fernOBB(q3.x,q3.z,o,rr.w/2+0.25)&&distPunktOBB(q3.x,q3.z,o)<rr.w/2+0.25){ok=false;break;} } if(!ok)break; } }
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
      if(ok&&Rw){ let mn=1e9; for(let a2=0;a2<12;a2++){ const wx=Math.cos(a2/12*2*Math.PI)*Rw, wz=Math.sin(a2/12*2*Math.PI)*Rw;
        mn=Math.min(mn,distPunktOBB(wx,wz,fo)); } if(Math.hypot(fcx,fcz)<Rw+3&&mn<1.5)ok=false; }
      if(ok) felder.push(fo); } }
  const mauer=walled?mauerRing(Rw, gatePts, rnd):null;
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
    if(ok&&brunnen.some(b2=>Math.hypot(tx-b2.x,tz-b2.z)<3.5))ok=false;
    if(ok&&mauer&&Math.abs(Math.hypot(tx,tz)-Rw)<2.6)ok=false;
    if(ok&&trees.some(q2=>Math.hypot(tx-q2.x,tz-q2.z)<3.0))ok=false;
    if(ok) trees.push({x:tx,z:tz,h:2.6+rnd()*1.8}); }
  const laternen=[], marken=[];                                                               // LATERNEN-GESETZ: die moderne Stadt leuchtet; die Marken des Dorf-Lichts (jeder Meter Weg) liest die Wandlaterne (wandLaternen)
  const LG9=LICHT_GESETZ.laterne, LATERNE_WAND=Math.sqrt(Math.max(0,(LG9.hoeheM*LG9.hoeheM+LG9.kernM*LG9.kernM)/2-LG9.kernM*LG9.kernM));   /*DIE LATERNE VOR DER WAND (K66): ihr Licht trifft keine Wand mit mehr als dem Doppelten der Gasse unter ihr — (h²+k²)/(d²+k²) ≤ 2, d ≥ 2,55 m; bis K66 stand sie 0,45 m vor dem Grundriss, die Giebelwand trug nachts das Sechsfache*/
  const LATERNE_FUSS=AUSSTATTUNG.laterne.tritt.r, laterneWege=roads.map(rd=>({pts:rd.pts.filter((_,k2)=>k2*DS<=(rd.len||0)+DS), h:rd.w/2})).concat(feldwege.map(fw=>({pts:fw.pts, h:fw.w/2}))); for(const wl of laterneWege) wl.K=wegKasten(wl.pts);   /*DER FUSS DER LATERNE (K66, Pruefung 2): ihr Tritt aus dem Rezept (AUSSTATTUNG laterne, der Blocker der Welt) und die Wege, wie der Export sie traegt — Strasse und Feldweg*/
  const laterneImWeg=(x,z)=>laterneWege.some(wl=>{ const P=wl.pts, h=wl.h+LATERNE_FUSS; if(fernKasten(x,z,wl.K,h)) return false; for(let k=0;k+1<P.length;k++){ const A=P[k], B=P[k+1], dx=B.x-A.x, dz=B.z-A.z, L2=dx*dx+dz*dz; let t=L2>1e-9?((x-A.x)*dx+(z-A.z)*dz)/L2:0; t=t<0?0:t>1?1:t; if(Math.hypot(x-A.x-dx*t, z-A.z-dz*t)<h) return true; } return false; });
  const laterneFrei=(x,z)=>obbs.every(q2=>fernOBB(x,z,q2.o,LATERNE_WAND)||distPunktOBB(x,z,q2.o)>=LATERNE_WAND)&&!laterneImWeg(x,z);   /*DER EINE STAND DER LATERNE: vor der Wand (LATERNE_WAND) UND mit dem Fuss neben jedem Weg — Stadt, Platz, Knoten und Gasse fragen hier*/
  const laterneQuer=(rd,q,fl)=>{ const lo=rd.w/2+LATERNE_FUSS; for(let o=rd.w/2+gw+0.35; ; o=Math.max(lo,o-0.25)){ const x=q.x+fl*q.nx*o, z=q.z+fl*q.nz*o; if(laterneFrei(x,z)) return {x,z}; if(o<=lo) return null; } };   /*DER STAND QUER ZUR GASSE (K66): vom alten Stand 0,35 m hinter dem Gehweg in 0,25-m-Schritten bis an den Bordstein (der Fuss am Wegrand), nie in die Fahrbahn — bis K66-n4 rueckte er bis rd.w/4 an die Achse, 123/292 Laternen standen im Weg (der Spieler lief gegen den Mast); wo die Wand keinen Stand traegt, sucht der Weg weiter*/
  let R9L=30; for(const rd9 of roads) for(const q9 of rd9.pts){ const d9=Math.hypot(q9.x,q9.z); if(d9>R9L)R9L=d9; }   /*ZEITREISE-Referenz: der ECHTE Stadtradius (Strassen-Max), nicht Mauer-Rw — GEMESSEN 0 Gas*/
  const zeit=plan.schnitt||plan;                                                               /*das Licht gehoert dem Jahr des Schnitts: 1320 brennt keine Gaslaterne*/
  if(zeit.staedtisch&&zeit.jahr>1850){ for(const rd of roads){ if(rd.gen>=2)continue;
    for(let u=6, fl=1; u<(rd.len||0)-4; u+=DORF_NORM.laneiv-4+((u*7)%5), fl=-fl){ const q=at(rd,u);   /*laneiv KONSUMIERT: 13..17 byte-gleich (laneiv-4 == 13)*/
      const lq=laterneQuer(rd,q,fl), lx2=lq?lq.x:0, lz2=lq?lq.z:0;
      let ok=!!lq;
      if(ok&&laternen.some(l=>Math.hypot(lx2-l.x,lz2-l.z)<9))ok=false;
      if(ok){ const dL=Math.min(1, Math.hypot(lx2,lz2)/(R9L*0.80));                          /*LATERNEN-ZEITREISE: jede Laterne liest das JAHR ihres Rings — Gas im Altkern, Elektro am Saum*/
        const R0=globalThis.__ring; const rj=(R0&&R0.ringe)? (R0.gr0+(plan.jahr-R0.gr0)*Math.pow(dL,0.82)) : plan.jahr;
        const gasB=(rj<1895) && (plan.jahr<1930 || dL<0.45);                                /*NACHRUEST-WELLE: ab 1930 elektrifiziert die Moderne von AUSSEN herein — der Altkern behaelt sein Gaslicht (Berlin-Wahrheit)*/
        laternen.push({x:lx2,z:lz2,th:Math.atan2(-fl*q.nz,-fl*q.nx),gas:gasB}); } } } }
  else { /*DAS DORF-LICHT (K10, Auge 13.10.: das Start-Dorf trug 0 Laternen, die Nacht war ohne ein Licht): jede Laterne vor einer Wand wie in der Stadt (kein Grundriss, 9 m Abstand, nicht am Brunnen) — eine am Platz, eine an jedem Weg-Knoten (Grad ≥ 3), laengs jedes Wegs eine je DORF_LICHT_WEG m*/
    const DORF_LICHT_WEG=25;
    const setz=(x,z,th)=>{ if(!laterneFrei(x,z)) return false;
      if(laternen.some(l=>Math.hypot(x-l.x,z-l.z)<9)||brunnen.some(b2=>Math.hypot(x-b2.x,z-b2.z)<2)) return false; laternen.push({x,z,th,gas:true}); return true; };
    const amWeg=(rd,u,fl)=>{ const q=at(rd,u), lq=laterneQuer(rd,q,fl); return !!lq&&setz(lq.x, lq.z, Math.atan2(-fl*q.nz,-fl*q.nx)); };
    if(platz) [[0.25,0],[-0.25,0],[0,0.7],[0,-0.7]].some(([fx,fz])=>setz(platz.cx+fx*platz.ex, platz.cz+fz*platz.ez, 0));
    const grad=new Array(G.nodes.length).fill(0); for(const rd of roads){ grad[rd.a]++; grad[rd.b]++; }
    for(const rd of roads){ const L=rd.len||0; for(const [ende,k] of [[0,rd.a],[1,rd.b]]){ if(grad[k]<3) continue; for(let du=2; du<=Math.max(2,Math.min(8,L/2)); du+=1){ const u0=ende?Math.max(0,L-du):Math.min(L,du); if(amWeg(rd,u0,1)||amWeg(rd,u0,-1)) break; } } }   /*der Knoten sucht seinen Stand bis 8 m in den Weg hinein (K66: vor der Wand fand er ihn 2 m vom Knoten selten)*/
    for(const rd of roads){ const L=rd.len||0; for(let um=0; um<=L; um+=1){ const mq=at(rd,um); marken.push({x:mq.x,z:mq.z}); }   /*DIE MARKE (K66-2 N1): JEDER Meter des Wegs — wandLaternen haengt nach dem Snap eine Laterne an die naechste Hauswand, wo kein Licht in LICHT_MARKE_M brennt (die dichte Gasse: beidseits Wand naeher als LATERNE_WAND, nur der Bordstein frei, und die Luecke zwischen zwei Masten); bis N1 je 25 m eine Marke, zwischen ihnen blieb die Wand der Gasse schwarz (nacht-wand 69 %)*/
      for(let u=DORF_LICHT_WEG/2, fl=1; u<L; u+=DORF_LICHT_WEG, fl=-fl){
      for(let du=0; du<=DORF_LICHT_WEG/2-1; du+=1){ if((u+du<L&&(amWeg(rd,u+du,fl)||amWeg(rd,u+du,-fl)))||(du&&u-du>0&&(amWeg(rd,u-du,fl)||amWeg(rd,u-du,-fl)))) break; } } } }
  const sp=at(roads[0],Math.min(roads[0].len||8,8));
  const nzyk=roads.length-(G.nodes.length-1);                                                // Zyklen = E − V + 1 (zusammenhängend)
  return {pl, roads:roads.map(rd=>({pts:rd.pts.filter((_,k2)=>k2*DS<=(rd.len||0)+DS), w:rd.w, gen:rd.gen, len:rd.len||0, quer:rd.quer||false})),   /*Whitelist +quer — das Flag starb an dieser Kopie (#1-Sonde: 0 Gassen im lay)*/
          feldwege, platz, brunnen, fences, felder, staende, spawn:{x:sp.x,z:sp.z}, trees, jitAmp, DS, mauer,
          laternen, marken,
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
        var mass = stapelBau(Object.assign({}, p, { nur: MASSNUR, __nurMass: true }), LOD1F);
        var bx = new THREE.Box3().setFromObject(mass.g);
        var B = {
            p: p,
            q: { phi: 0, x: 0, y: 0, z: 0, obb: { cx: 0, cz: 0 } }, // das Einzel-Haus des Ofens steht im eigenen Rahmen (y = 0; der Wirt setzt es auf seinen Slot)
            lod: "chunk",
            dyn: false,
            ext: { x0: bx.min.x, x1: bx.max.x, z0: bx.min.z, z1: bx.max.z, y1: bx.max.y },
            dims: mass.H.dims,
            fp: fpVon(mass.H),
            masse: masseVon(mass), // DIE MASSEN DES BAUS (S3): der Fernkörper liest sie (koerperListe)
            grund: grundVon(mass), // DAS GRUND-DATUM (S4): der Slot trägt es
            wandX: wandXVon(mass.H.solids), // DIE AUSSENKANTE DER WÄNDE längs x (Solids des Mass-Baus): die Brandwand-obb liest sie
            fenster: fensterVon(mass), // DIE ÖFFNUNGEN (K38): das Fern-Fenster des fernen Turms liest sie
            spawnL: { x: mass.H.spawn.x, z: mass.H.spawn.z },
            hofGap: 2.5,
            meshes: [],
        };
        // KAMIN-RAUCH (.105): AABB reist auf B, bevor mass.g stirbt (H.chimney
        // sonst weg mit dem Dispose — exportSettlement + Host brauchen die Spitze).
        if (mass.H && mass.H.chimney) {
            var c = mass.H.chimney;
            B.chimney = {
                min: [c.min[0], c.min[1], c.min[2]],
                max: [c.max[0], c.max[1], c.max[2]],
            };
        }
        mass.g.traverse(function (o) {
            if (o.geometry) o.geometry.dispose();
        });
        return B;
    }

    // ── DER PLAN DES HAUSES (B3e) — die Massen ohne die Teile, die keine Masse tragen ──
    //    Der Fernkörper (Stufe 3, NUR-WURF, und seine Fernform `__fern`) liest vom Bau nur die MASSEN (`koerperListe`:
    //    Grundriss, Geschoss- und Traufhöhen, Dach-Form und -Neigung, Kamin) und für den Fassaden-Ton `dims` und `fp`. Bis B3e
    //    baute er dafür den Mass-Bau (Ziegel, Giebel, Dachwerk, Fenster — die Maß-Träger der Box `ext`, die er nie liest):
    //    0,30–0,39 s je Haus auf der GTX, so viel wie die L2 (OMEN 1610). Der Plan baut nur die Teilsysteme, die eine Masse
    //    setzen (`addMasse`: Fundament, Tür-Treppen, Anbau, Flügel, Hof, Turm, Portikus …, der Herd den Kamin) — Massen,
    //    `dims` und `fp` byte-gleich dem Mass-Bau (gate:fachwerk-contract, die Split-Parität der Stufe 3 komponiert ihn).
    //    Die Stapel-Naht (`stapelBau`, > 11 Geschosse) hebt den Aufsatz auf den Umriss der gebauten Basis, und den trägt im
    //    Mass-Bau das Fenster: dort baut der Plan es mit.
    var PLANNUR = Object.assign({}, MASSNUR, { gelaende: false, giebel: false, dachwerk: false, dachdeckung: false, fenster: false, balkon: false, dachAlt: false, pilotis: false });
    function planBau(p) {
        var nur = (p.storeys || 1) > 11 ? Object.assign({}, PLANNUR, { fenster: true }) : PLANNUR;
        var plan = stapelBau(Object.assign({}, p, { nur: nur }), LOD1F);
        var B = {
            p: p,
            q: { phi: 0, x: 0, y: 0, z: 0, obb: { cx: 0, cz: 0 } }, // der eigene Rahmen des Ofens (wie massBau)
            lod: "chunk",
            dyn: false,
            dims: plan.H.dims,
            fp: fpVon(plan.H),
            masse: masseVon(plan),
            grund: grundVon(plan), // das Grund-Datum (S4) — byte-gleich dem Mass-Bau wie die Massen
            hofGap: 2.5,
            meshes: [],
        };
        plan.g.traverse(function (o) {
            if (o.geometry) o.geometry.dispose();
        });
        return B;
    }
    // DER SLOT EINES HAUSES (bauen.K2): die EINE Zeile, die ein Haus in einen Plan trägt — der Mass-Bau `B` (Hülle `ext`, Tür
    // aus `dims`, Kamin, Grund-Datum), der Parameter-Vektor `hp` und der Rahmen `q` {x, z, phi} samt seiner Grundfläche `obb`.
    // Leser: der Export des Dorfs (`exportSettlement`, je Slot des Layouts) und das gesetzte Haus (`slotPlan`) — beide gehen
    // danach durch DENSELBEN Plan v2 (`ortPlan`: Platte, Grund, Vorplatz). `kultur`: das Rezept (ohne: hp.kultur).
    function hausSlot(B, hp, q, obb, kultur) {
        return {
            x: q.x,
            z: q.z,
            phi: q.phi,
            obb: obb,
            ext: B.ext,
            kultur: typeof kultur === "string" ? kultur : typeof hp.kultur === "string" ? hp.kultur : null,
            seed: hp.seed >>> 0,
            rolle: typeof hp.rolle === "string" ? hp.rolle : "wohnhaus",
            baujahr: isFinite(hp.baujahr) ? hp.baujahr | 0 : 0,
            ov: JSON.parse(JSON.stringify(hp)),
            // DORF-ERLEBNIS (17.07., additiv): die TÜR-ZEILE + der Kern-Footprint W/D je Slot (dims-Wahrheit aus massBau) — der
            // Host baut daraus die Blocker-Wände MIT Tür-Lücke (Betreten; Haus-lokal, vor slot.phi).
            tuer: tuerZeile(B.dims),
            // KAMIN-RAUCH (.105): Spitze haus-lokal (Lab dorfRauch-Formel) — null wenn massBau kein chimney (ROUND/modern/kuppel).
            chimney: kaminSpitze(B.chimney),
            // DAS GRUND-DATUM (S4, additiv): der Körper-Satz und der Keller (`grundVon`), haus-lokal vor slot.phi — ortPlan
            // legt daraus den Erdbau `grund` (gelaende-core)
            grund: B.grund,
        };
    }
    // DAS GESETZTE HAUS ALS SLOT (bauen.K2): ein Haus ohne Ort (gesetzt vom Spieler, der KI, der Vorschau am Tor) wird ein
    // Ein-Slot-Plan — derselbe Mass-Bau wie das Haus im Dorf (`massBauExport`, in der Merge-Ordnung von `buildInstance`:
    // Rezept, ov, Same), seine Grundfläche das Rechteck der Hülle um ihre Mitte in der Gier `phi` (die Formel des Layouts,
    // `dorfLayout`), am Ursprung des Plans. Der Wirt rechnet daraus im Ort-Faden den Plan v2 (`ortPlan`) und legt dessen Erdbau
    // — Platte, Grund und Vorplatz wie der Dorf-Slot derselben Gestalt. Bis bauen.K2 kam nur der Grund (`grundPlan`, der
    // Plan-Bau): der Vorplatz entstand nur im Dorf. null: kein Haus-Rezept.
    function slotPlan(rezeptId, seed, ov, phi) {
        var pre = PRESETS[rezeptId];
        if (!pre || pre.kind === "ausstattung") return null;
        var p = hausParams(pre, ov || null);
        var sd = Number(seed);
        if (isFinite(sd) && !(ov && typeof ov === "object" && ov.seed != null)) p.seed = sd;
        var B = massBauExport(p);
        var e = B.ext;
        var f = isFinite(phi) ? Number(phi) : 0;
        var c = Math.cos(f);
        var s = Math.sin(f);
        var lcx = (e.x0 + e.x1) / 2;
        var lcz = (e.z0 + e.z1) / 2;
        var obb = { cx: lcx * c + lcz * s, cz: -lcx * s + lcz * c, phi: f, ex: (e.x1 - e.x0) / 2, ez: (e.z1 - e.z0) / 2 };
        return hausSlot(B, p, { x: 0, z: 0, phi: f }, obb, rezeptId);
    }

    // DIE TÜR-ZEILE (DORF-ERLEBNIS, die EINE Formel): Haustür (Rechteck, Front −z) und Hintertür samt Kern-Footprint W/D,
    // haus-lokal — null ohne Haustür (ROUND). Leser: exportSettlement (je Slot) und die Hülle jeder Stufe (`buildInstance`:
    // `__huelle.tuer`, bauen.K5 — das gesetzte Haus öffnet seine Tür wie das Haus im Dorf).
    function tuerZeile(dm) {
        if (!dm || !dm.tuer) return null;
        var tz = { x: dm.tuer.x, z: dm.tuer.z, w: dm.tuer.w, h: dm.tuer.h, y: dm.tuer.y, W: dm.W, D: dm.D };
        if (dm.tuer.hinten) tz.hinten = { x: dm.tuer.hinten.x, z: dm.tuer.hinten.z, w: dm.tuer.hinten.w };
        return tz;
    }
    // DIE KAMIN-SPITZE (KAMIN-RAUCH .105, die EINE Formel): die Mitte über dem Stapel-AABB, 0,2 m darüber, haus-lokal —
    // null ohne Kamin (ROUND/modern/kuppel). Leser: exportSettlement (je Slot), chimneyTipFromParams und die Hülle des
    // Baus (`buildInstance`: `__huelle.kamin`, B3c — die Spitze reist mit dem Haus aus dem Worker).
    function kaminSpitze(c) {
        if (!c || !c.min || !c.max) return null;
        return {
            x: (c.min[0] + c.max[0]) / 2,
            y: c.max[1] + 0.2,
            z: (c.min[2] + c.max[2]) / 2,
        };
    }
    // KAMIN-RAUCH (.108): Solo-Haus-Spitze aus massBau-AABB (exportSettlement-Formel).
    // null wenn kein chimney (ROUND/modern/kuppel) — Host fail-closed.
    function chimneyTipFromParams(p) {
        return kaminSpitze(massBau(p || {}).chimney);
    }

    // ── DIE EINE STUFEN-QUELLE des Vertrags — buildStufe(p, stufe) → geoms
    //    (Rollen-Fragmente). Jede Host-Stufe fährt EXAKT den Lab-Pfad (Kopf):
    //    0 = promoteBauen + bakeLOD(0, alles) · 1 = fragFuer(B,1) ·
    //    2 = Warm-Pfad fragFuer(B,1) [wandTon] → fragFuer(B,2). KEIN hofFuer
    //    (Schnitt-Grenze (a)). Der Paritäts-Gate komponiert dieselben
    //    Primitive Shell-wörtlich und vergleicht byte-exakt. ──
    // ── DIE HÜLLE DES GESETZBUCHS (Welle L, additiv, must-ignore) — die Solids
    //    der Stufe 0, die JEDE Stufe trägt (Kollision == Optik in jeder Ferne:
    //    die Welt kollidiert nie mit einer Stufen-Bounding-Box — sie lag beim
    //    Hof-Haus 8,2 m vor den Solids, die Tür war von vorn unerreichbar).
    //    Die fernen Stufen bauen dafür den Stufe-0-Bau OHNE die Teilsysteme, die
    //    nie ein Solid setzen (SOLIDLOS: dieselben Solids byte-gleich, ~1/8 der
    //    Bauzeit) — gate:fachwerk-contract prüft die Gleichheit je Kultur. ──
    var SOLIDLOS = { gelaende: false, geruest: false, riegel: false, streben: false, zimmermann: false, gefache: false, giebel: false, dachwerk: false, dachdeckung: false, fenster: false, moebel: false, anbau: false, fluegel: false, balkon: false, kuppel: false, dachAlt: false, arkade: false, turm: false, zinnen: false, vorkragung: false, pilotis: false, terrasse: false, rundbau: false };
    function stufe0Param(p) {
        // ≡ promoteBauen (Lab): RING-A-WÜRDE — Türme sparen Möbel+Innenwände,
        // Armut (p.arm, Dorf-Daten) spart Möbel; sonst der VOLLE Bau.
        var turm = (p.storeys || 1) >= 6;
        return Object.assign({}, p, {
            nur: turm ? { moebel: false, innenwaende: false } : p.arm ? { moebel: false } : {},
        });
    }
    function stufe0Bau(hp2) {
        return (hp2.storeys || 1) > 11
            ? stapelBau(hp2, { gelaende: false })
            : (function () {
                  var H = HAUS(THREE, mat, hp2);
                  return { g: H.build({ gelaende: false }), H: H };
              })();
    }
    // Die Solids eines Stufe-0-Baus haus-lokal als Zahlen-Zeile [x0,y0,z0,x1,y1,z1]… (der Aufsatz des Stapels um st.off).
    function solidZeile(st) {
        var solL = [];
        var solAus = function (Hs, dy) {
            if (!Hs || !Hs.solids) return;
            for (var si = 0; si < Hs.solids.length; si++) {
                var so = Hs.solids[si];
                solL.push(so.min[0], so.min[1] + dy, so.min[2], so.max[0], so.max[1] + dy, so.max[2]);
            }
        };
        solAus(st.H, 0);
        if (st.topH) solAus(st.topH, st.off || 0);
        return solL;
    }
    function hausSolids(p) {
        var hp = stufe0Param(p);
        hp.nur = Object.assign({}, SOLIDLOS, hp.nur);
        var st = stufe0Bau(hp);
        var z = solidZeile(st);
        st.g.traverse(function (o) {
            if (o.geometry) o.geometry.dispose();
        });
        return z;
    }
    function buildStufe(p, stufe) {
        materials();
        var geoms = {};
        if (stufe === 0) {
            var hp2 = stufe0Param(p);
            var st = stufe0Bau(hp2);
            // ═══ DORF-ERLEBNIS (17.07., additiv) — DIE TÜR BLEIBT EIN FLÜGEL ═══
            // Haus-/Hintertür-Blätter (userData.side aus tueren()) werden NICHT in
            // die Rollen-Geoms verschmolzen, sondern JE Blatt eigen gebakt (haus-
            // lokal, gebackene Pose) und mit Scharnier-userData (side/offen, Hinge
            // = Gruppen-Position) an die Ausgangs-Gruppe gehängt — exakt der porta-
            // Flügel-Pfad: __extractAssetMesh liest side/position → out.tuer, der
            // Host dreht die Flügel nähe-aktiviert (_tickTorFluegel). Häuser ohne
            // Türblätter (ROUND / nur.tueren=false): leer — byte-alt.
            var fluegelL = [];
            st.g.updateMatrixWorld(true);
            st.g.traverse(function (o) {
                if (o.userData && o.userData.door && typeof o.userData.side === "number") fluegelL.push(o);
            });
            var tuerWraps = [];
            for (var fi = 0; fi < fluegelL.length; fi++) {
                var Lf = fluegelL[fi];
                var lg = {};
                bakeLOD(Lf, p.col, lg, 0, true); // dieselbe Bake-Wahrheit (AO/Illusion/Farben) wie der Rumpf
                // DAS BLATT SITZT AM SCHARNIER (K08, Auge 05): der Bake liegt haus-lokal, die Hülle steht AM Scharnier — das
                // Gitter rückt um das Scharnier zurück (Welt-UV und Illusion bleiben haus-lokal gerechnet), sonst stand das
                // Blatt um seine Scharnier-Lage noch einmal vor der Fassade (192 von 192 L0-Blättern 2,19–5,33 m,
                // gate:haus-fern T).
                var hxL = Lf.position.x,
                    hzL = Lf.position.z;
                for (var rk in lg) {
                    var lp = lg[rk] && lg[rk].pos;
                    if (lp)
                        for (var vi = 0; vi < lp.length; vi += 3) {
                            lp[vi] -= hxL;
                            lp[vi + 2] -= hzL;
                        }
                }
                var wg = geomsZuGruppe(lg);
                if (!wg.children.length) continue;
                wg.position.set(hxL, 0, hzL); // HINGE-Achse (Extraktor liest anc.position)
                wg.userData = { side: Lf.userData.side, offen: Lf.userData.offen || 0 };
                if (Lf.parent) Lf.parent.remove(Lf);
                tuerWraps.push(wg);
            }
            if (tuerWraps.length) geoms.__tuerFluegel = tuerWraps; // reist neben den Rollen-Geoms (vo-lose Zeile, geomsZuGruppe überspringt sie)
            // ═══ DIE HÜLLE REIST (Welle L, additiv, must-ignore) — Kollision == Optik ═══
            // Die Solids, die das Haus beim Bau sammelt (addSolid: Fundament, Böden mit Treppenloch, Tritte, Wände mit
            // Öffnungen, Brüstungen, Kniestock, Außentreppe), reisen haus-lokal als Zahlen-Zeile [x0,y0,z0,x1,y1,z1]…
            // — dieselbe Liste, die das Labor begeht (bauSolidsUndTueren). Die Welt stellte statt ihrer vier EG-Riegel
            // auf (gedrehte Häuser 18–35 % begehbar, die Treppe Luft, der Fuß 0,50 m unter der Diele).
            geoms.__solids = solidZeile(st);
            geoms.__kamin = { spitze: kaminSpitze(st.H && st.H.chimney) }; // die Spitze des Stapels (≡ massBau, die Hülle trägt sie)
            geoms.__tuer = tuerZeile(st.H && st.H.dims); // die Tür-Zeile des Baus (≡ exportSettlement, die Hülle trägt sie)
            bakeLOD(st.g, p.col, geoms, 0, true); // LÜCKENLOS: alles=true (Kopf, Stufen-Wahrheit 0)
            st.g.traverse(function (o) {
                if (o.geometry) o.geometry.dispose();
            });
        } else if (stufe === 3) {
            // DIE STUFE 3 (nurWurf, S3): der Fernkörper des Gesetzbuchs. Der Warm-Pfad misst den Fassaden-Ton (wie die L2),
            // die EINE Liste wird EIN Gitter (`fragFuer(B, 3)` — dieselbe Funktion wie das Vogel des Labors) und reist als
            // Beipack `__fern`; keine Solids (die Stufe wird nie gezeigt, die Kollision trägt die gezeigte Stufe). Ihre Massen
            // kommen aus dem PLAN (`planBau`, B3e), nie aus dem Mass-Bau der gezeigten Stufen.
            geoms = wurfVon(planBau(p));
        } else {
            var B = massBau(p);
            mischeGeoms(geoms, fragFuer(B, stufe === 1 ? 1 : 2));
            B.frag = null;
            B.fragStufe = undefined;
            geoms.__solids = hausSolids(p); // DIE HÜLLE DES GESETZBUCHS auch fern (nach dem Mesh: der Stufen-Bau bleibt byte-gleich)
            geoms.__kamin = { spitze: kaminSpitze(B.chimney) };
            geoms.__tuer = tuerZeile(B.dims);
        }
        return geoms;
    }
    // DER WURF EINES BAUS (Stufe 3, NUR-WURF): die EINE Liste als EIN Gitter (`fragFuer(B, 3)`) und ihre Fernform `__fern`
    // aus einem B, das Massen und Fassaden-Ton trägt (der Plan, `planBau`).
    function wurfVon(B) {
        var w = {};
        mischeGeoms(w, fragFuer(B, 3));
        B.frag = null;
        B.fragStufe = undefined;
        w.__fern = huelleVonBau(B);
        return w;
    }

    // ── Rollen-Fragmente → EINE THREE.Group — der sofort-Zweig von
    //    finalizeGeoms (Lab) OHNE Szene (dorfGroup/Blende bleiben Shell-Glue).
    //    DAS KARTEN-GESETZ (Kopf (d)): der Vertex trägt die Farbe, jede Rolle
    //    ihren EINEN Stoff `_mmFor` (die Karte nur ihr Relief). ──
    function geomsZuGruppe(geoms) {
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
            var mm = new THREE.Mesh(bg, _mmFor(role));
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
    function hausDreiecke(gm) {
        var n = 0;
        for (var r in gm) if (gm[r] && gm[r].idx) n += gm[r].idx.length / 3;
        (gm.__tuerFluegel || []).forEach(function (w) {
            w.traverse(function (o) {
                if (o.isMesh) n += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
            });
        });
        return n;
    }
    function buildInstance(rezeptId, seed, lod, ov) {
        var pre = PRESETS[rezeptId];
        if (!pre) return null;
        // DIE AUSSTATTUNG (unten) baut ihr eigenes Gesetz — dieselben Rollen, derselbe Bake, eigene Stufen; die Werke (Bank,
        // Leiter) bauen auf derselben Maschine.
        if (AUS_ARTEN[pre.kind]) return buildAusstattung(rezeptId, seed, lod, ov);
        materials();
        var p = hausParams(pre, ov || null);
        var sd = Number(seed);
        if (isFinite(sd) && !(ov && typeof ov === "object" && ov.seed != null)) p.seed = sd;
        var L = lod | 0;
        var stufe = HOST_STUFEN[0];
        for (var i = 0; i < HOST_STUFEN.length; i++) if (HOST_STUFEN[i] <= L) stufe = HOST_STUFEN[i];
        // DIE STUFE TRÄGT IHRE ZEILE (pipeline.K3, B2c — auch am Rand jedes Reglers): die Teilung des Verformungs-Felds
        // (Biegung, Schwung) misst die Sehne der Stufe — die gebogene Stufe 1 steht ab 12 m, die 2 ab 26 m, ihr Schritt
        // streckt sich um 2 bzw. 3 (gleicher Sehnenfehler im Bild); trägt der Bau mehr Dreiecke als die Zeile, streckt er
        // sich weiter (höchstens vier Mal). Ein Bau ohne Feld oder auf seiner Zeile bleibt byte-gleich.
        var zeile = (PORTAL_RENDER_CONFIG.lod.budget.haus[stufe] || {}).tris;
        if (p.bend > 0) p.__sehne = [1, 2, 3, 1][stufe];
        var gm = buildStufe(p, stufe);
        // der Schritt folgt dem Überschuss (n / Zeile, mindestens 1,5); bewegt ein Schritt weniger als 2 %, trägt die Stufe
        // kein Feld und keine Fläche, die sich streckt — der Bau bleibt, die Linse nennt ihn
        for (var versuch = 0, n = hausDreiecke(gm), vorher = Infinity; versuch < 4 && n > zeile && n < vorher * 0.98; versuch++) {
            p.__sehne = (p.__sehne || 1) * Math.max(1.5, n / zeile);
            gm = buildStufe(p, stufe);
            vorher = n;
            n = hausDreiecke(gm);
        }
        var g = geomsZuGruppe(gm);
        // DORF-ERLEBNIS — die separierten Tür-Flügel (nur Stufe 0) reisen als
        // eigene Kinder mit Scharnier-userData mit (der porta-Flügel-Pfad).
        if (gm.__tuerFluegel) for (var tf = 0; tf < gm.__tuerFluegel.length; tf++) g.add(gm.__tuerFluegel[tf]);
        g.updateMatrixWorld(true);
        // DIE HÜLLE (Welle L): JEDE Stufe trägt die Solids des Gesetzbuchs (die der Stufe 0 — begehbar, Tür offen, die
        // Hofmauer zu); die Welt kollidiert in jeder Ferne, wie das Haus nah gezeichnet ist, nie mit einer Stufen-Box.
        var huelle = gm.__solids && gm.__solids.length ? { stufe: stufe, boxen: gm.__solids } : null;
        // … in der EINEN Hüllen-Form (S3, N5: jede Solid-Box ein Teil, rolle "fest" — EIN Parser im Wirt, `_huelleVon`)
        g.userData = { kind: "haus", rezeptId: rezeptId, seed: seed, lod: stufe, __huelle: huelle ? huelleAusBoxen(huelle.stufe, huelle.boxen) : null };
        // DER KAMIN REIST MIT DER HÜLLE (B3c, additiv, must-ignore): die Spitze des gebauten Hauses, haus-lokal auf dem Raster
        // (`kamin` [x, y, z], null = kein Kamin) — der Wirt baut kein Haus im Haupt-Faden, um sie zu finden (`_hausHuelleSetzen`).
        // Ebenso die Tür-Zeile (`tuer`, bauen.K5, null = keine Haustür): was der Slot des Dorfs aus dem Export bringt.
        if (g.userData.__huelle && gm.__kamin) {
            var ks = gm.__kamin.spitze;
            g.userData.__huelle.kamin = ks ? _hr3([ks.x, ks.y, ks.z]) : null;
            g.userData.__huelle.tuer = gm.__tuer;
        }
        // DIE STUFE 3 (nurWurf): sie wirft mit dem EINEN Schatten-Stoff des Wirts — jede Ecke deckt (`aDeckt` 1, das Wurf-
        // Gesetz E1) —, ihre Liste reist als Beipack `__fern` (fernform "huelle": jenseits der Mesh-Zone der Welt-March)
        if (gm.__fern) {
            g.userData.__fern = gm.__fern;
            stufeWirft(g);
        }
        return g;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  DIE AUSSTATTUNG — Feuerstelle · Marktstand · Ziehbrunnen (Architektur-Welle 05.10.)
    //  Befund (Blick-Tour V18.530 „08-markt", Werkbank an der Mess-Wiese, echte GPU): der Wirt baute die drei aus
    //  eigenen Teilen — die Glut ein Zylinder mit Scheibe und Kegel (13 im 70-m-Kreis, 24 GPU-Befehle, 69k
    //  Dreiecke), der Marktstand sechs Bretter mit je einem Draw (Albedo 0,034), der Brunnen ein Zylinder. Das
    //  Gesetzbuch der Architektur trägt sie jetzt selbst, mit DERSELBEN Stoff-Wahrheit wie das Haus: die Rollen-
    //  Materialien, der Rollen-Bake (bakeLOD: Kontakt-AO · Material-Illusion · Welt-UV), die Farbe im Vertex
    //  (kartenlos) — das Labor-Dorf und die Welt bauen dieselben Bytes.
    //  DIE MASSE (Realität): Feuerstelle Ring-Innen-Ø 0,9–1,1 m aus Feldsteinen 17–27 cm, Scheite 40–55 cm × Ø
    //  9–12 cm im Stern, Glutbett Ø 0,76 m, Flammen 25–55 cm · Marktstand Tisch 2,0 × 0,9 m auf 0,86 m
    //  (Arbeitshöhe), Pfosten 9 cm, Plane vorn 2,25 / hinten 1,95 m (Gefälle nach hinten), Volant 18 cm ·
    //  Ziehbrunnen Kranz außen Ø 1,84 m, Brüstung 0,73 m, Wand 0,3 m aus Quadern in Lagen, Haspel auf 1,5 m,
    //  First 2,62 m, Schindeldach.
    //  DIE STUFEN: 0 = nah (Fasen an jeder Kante, Waren, Ruß, Moos, Schindeln, Eisen) · 1 = mittel (dieselbe
    //  Silhouette an denselben Orten — jeder Zufall zieht aus seinem eigenen Strom, die Stufe wählt nur die
    //  Feinheit; Kanten scharf, Kleinteile fallen). DAS VERWITTERUNGS-GESETZ (je Vertex, im Asset-Raum): Erdsaum
    //  unter 0,25 m (dunkler, ins Graugrüne), Moos auf liegenden Steinflächen, Ruß an der Glut zugewandten
    //  Steinen und an den Scheit-Enden, Sonnenbleiche auf Holz, das nach oben schaut; die Stärke ist der Regler
    //  `verwitterung`. DIE GLUT (Rollen feuer · flamme, Seh-Klasse glut) leuchtet und wirft nie.
    //  PLATTFORMGLEICH: jede Zahl, die den Kern verlässt, liegt auf dem Raster 2^-12 (Normalen 2^-14, −0 wird 0) —
    //  sin/cos dürfen zwischen V8-Bauten in der letzten Stelle abweichen, die Bytes nicht.
    // ═══════════════════════════════════════════════════════════════════════
    // Die drei Rezepte: Label, wie viele Individuen die Welt trägt (B2c gestalten), der Ort als Daten (site — der
    // Wirt setzt sie über seine Schichten: Glut-Feld · Dorfplatz).
    // DIE TRITTFLÄCHE (`tritt`, Asset-Raum, reist als fx-Daten): um eine Feuerstelle, einen Brunnen, einen Stand ist der
    // Boden getreten — der Wirt malt sie in seine Wege-Karte (Erde statt Wiese, kein Halm durch Glut und Kranz).
    // DAS LEUCHTQUELLEN-GESETZ (K11, rein additiv): EIN Emitter-Datum je Quelle — `kelvin` die Farbtemperatur (die EINE Größe
    // der Lichtfarbe, K11b: `lichtFarbe` rechnet sie über den Planck-Ort in lineares sRGB; bis K11b trug das Datum die
    // Glut-Palette 0xff7a35 als Lichtfarbe, die Welt las sie linear (1, 0,195, 0,036) und der Boden glühte lava-rot), der
    // Lichtstrom `staerke` × `zeit` (der Zeitplan je Tageszeit; fehlt er, brennt die Quelle immer) als Bestrahlung in 1 m
    // in der Zahl des Labors, `reichweiteM`, `abfall` und `kernM` des Punktlichts (K11b, `lichtAbfall`: 1/d^abfall mit dem
    // Kern der Quelle — eine Flamme ist keine Punkt-Singularität — und weichem Saum an der Reichweite), `flacker` das Atmen
    // der Flamme (relativ, zwei Sinus in 6–10 Hz, `lichtFlackern`), `hoeheM` die Höhe des Licht-Mittelpunkts über dem
    // Boden. `feuer` ist das Herdfeuer (ein Holzfeuer, 1 800–2 000 K: die gelben Flammen tragen das Licht, 2 000 K; der
    // Kern die Ausdehnung des Glutbetts, Ø 0,76 m wie klang bettRefM — nah an der Glut sieht ein Stein das ganze Bett, keinen
    // Punkt; 0,35 m über dem Bett; sein Tageszeit-Satz .228 mittag/morgen 1,6 · abend 2,2); die NACHT trägt das Feuer nach
    // dem Nordstern-Soll Fachwerk (nachts hebt warmes Licht den Platz auf 2–5 lx, der Rest im Mondlicht 0,1–0,3 lx; Vollmond
    // 0,26 lx ≙ der Nacht-Bestrahlung der Welt 0,224; ein echtes Lagerfeuer trägt in 2 m das Hundertfache): mit nacht 45
    // trägt es in 2 m das ≈ 80-Fache, der Boden 1–3 m um das Bett steht orange (K11b, echte GPU, Ausgabe-Pfad: Farbton
    // 29°; gate:pruefbuehne-licht) — bis K11b trug nacht 12 unter dem Legacy-Abfall das 33-Fache, schwach über mehrere Meter,
    // und der Fuß der ACES-Kurve kippt ein schwach beleuchtetes Orange ins Rot (Farbton 14,5°, lava-rot);
    // `fenster` das Nachtlicht der Glas-Stoffe (die Glut je Tageszeit; 2 800 K, der
    // Farbort, den das Auge V18.542 an den Fenstern richtig fand), `laterne` das Gaslicht der Gasse (1 900 K, Nordstern
    // Fachwerk-Soll: der Kopf auf der Lichthöhe des Labors bei 3,7 m Straße; unter ihr dieselbe Bestrahlung wie bis K11b,
    // zwischen zwei Laternen im Abstand 9 m 0,44 davon — das Band 2–5 lx). Leser: das Labor (Herdfeuer, Fenster) und die
    // Welt (`_leuchtTakt`: Feuerstelle, Glut, jeder Eintrag mit Datum — die Laternen eines Plans, K10; `_leuchtStoff`:
    // Fenster). Das Labor (r128, Legacy-Licht) zeichnet den Abfall als (1 − d/R)^abfall — r128 kennt 1/d² nur für die ganze
    // Szene (physicallyCorrectLights).
    // DAS BOGEN-GESETZ (K66): die Kurven der Bögen — hufeisen: der Mittelpunkt um R·tan(hufeisenAlpha) über dem Kämpfer, der Bogen
    // läuft um hufeisenAlpha unter die Mitte; spitz: zwei Mittelpunkte im Abstand spitzE·R von der Achse auf der Kämpferlinie
    // (Radius (1 + spitzE)·R, Scheitel 1,61 R). Leser: bogenRahmen (Keilsteine im Verband) und die Linse gate:fachwerk-contract BOGEN-VERBAND.
    var BOGEN_GESETZ = Object.freeze({ hufeisenAlpha: 0.35, spitzE: 0.8 });
    var LICHT_GESETZ = {
        feuer: { kelvin: 2000, staerke: 1, zeit: { mittag: 1.6, morgen: 1.6, abend: 2.2, nacht: 45 }, reichweiteM: 9, abfall: 2, kernM: 0.76, hoeheM: 0.35, flacker: { amp: 0.18, hz: [6.3, 9.7] } },
        fenster: { kelvin: 2800, zeit: { mittag: 0, morgen: 0, abend: 0.42, nacht: 0.85 } },
        laterne: { kelvin: 1900, staerke: 19, reichweiteM: 12, abfall: 2, kernM: 0.1, hoeheM: 3.6, zeit: { mittag: 0, morgen: 0, abend: 1, nacht: 1 } },
    };
    // DIE WANDLATERNE (K66-2): die Leuchte der dichten Gasse hängt an der Hauswand, wo kein Mast vor der Wand und neben dem Weg
    // steht — ihr Licht ist das der Laterne (Farbtemperatur, Zeitplan, Reichweite, Abfall), abgeleitet aus zwei Maßen ihres Leibs:
    // der Kopf `hoeheM` über der Gasse, `armM` vor der Wand. Der Kern folgt aus dem Wand-Gesetz der Laterne (K66: die Wand trägt
    // höchstens das Doppelte der Gasse unter ihr, ((h² + k²)/(a² + k²))^(abfall/2) ≤ 2 — mit dem Kern des Masts trug die Wand in
    // 0,4 m das Fünfzigfache, die Sättigung von K66), die Stärke aus der Gasse: unter ihr trägt der Boden, was er unter dem Mast
    // trägt. Leser: das Rezept der Wandlaterne (fx.licht), der Licht-Takt der Welt, gate:settlement DORF-LICHT.
    LICHT_GESETZ.wandlaterne = (function (L, h, a) {
        var q = Math.pow(2, 2 / L.abfall),
            k2 = Math.max(L.kernM * L.kernM, (h * h - q * a * a) / (q - 1)),
            boden = L.staerke * Math.pow((1 + L.kernM * L.kernM) / (L.hoeheM * L.hoeheM + L.kernM * L.kernM), L.abfall / 2),
            r3 = function (v) {
                return Math.round(v * 1000) / 1000;
            };
        return {
            kelvin: L.kelvin,
            staerke: r3(boden * Math.pow((h * h + k2) / (1 + k2), L.abfall / 2)),
            reichweiteM: L.reichweiteM,
            abfall: L.abfall,
            kernM: r3(Math.sqrt(k2)),
            hoeheM: h,
            armM: a,
            zeit: JSON.parse(JSON.stringify(L.zeit)),
        };
    })(LICHT_GESETZ.laterne, 2.8, 0.4);
    // DIE LICHTFARBE einer Farbtemperatur (K11b): der Planck-Ort (Kim, Kang et al. 2002, kubische Näherung 1 667–25 000 K)
    // als Farbort x, y → XYZ (Y = 1) → lineares sRGB (IEC 61966-2-1, Weiß D65), negativ außerhalb des Gamuts geklemmt, auf den
    // hellsten Kanal 1 normiert. Linear — das FARB-GESETZ (das Hex ist eine sRGB-Absicht) gilt so ohne Hex: 1 900 K ist
    // (1, 0,232, 0), sRGB #ff8400. Leser: der Licht-Takt der Welt (`_leuchtTakt`) und das Labor (Herdfeuer, Fenster).
    function lichtFarbe(kelvin) {
        var T = Math.min(25000, Math.max(1667, +kelvin)), T2 = T * T, T3 = T2 * T;
        var x = T <= 4000 ? -0.2661239e9 / T3 - 0.2343589e6 / T2 + 0.8776956e3 / T + 0.17991 : -3.0258469e9 / T3 + 2.1070379e6 / T2 + 0.2226347e3 / T + 0.24039;
        var x2 = x * x, x3 = x2 * x;
        var y = T <= 2222 ? -1.1063814 * x3 - 1.3481102 * x2 + 2.18555832 * x - 0.20219683 : T <= 4000 ? -0.9549476 * x3 - 1.37418593 * x2 + 2.09137015 * x - 0.16748867 : 3.081758 * x3 - 5.8733867 * x2 + 3.75112997 * x - 0.37001483;
        var X = x / y, Z = (1 - x - y) / y;
        var r = Math.max(0, 3.2404542 * X - 1.5371385 - 0.4985314 * Z);
        var g = Math.max(0, -0.969266 * X + 1.8760108 + 0.041556 * Z);
        var b = Math.max(0, 0.0556434 * X - 0.2040259 + 1.0572252 * Z);
        var m = Math.max(r, g, b);
        return [r / m, g / m, b / m];
    }
    // DER ABFALL eines Punktlichts im Abstand d (K11b, das EINE Punktlicht-Gesetz der Welt — `_lichtPoolTerm` rechnet es je
    // Fragment): 1/d^abfall mit dem Kern `kernM` der Quelle (die Fläche einer Flamme, eines Bogens: (1 + k²)/(d² + k²) — in
    // 1 m gilt die Stärke des Datums, weit draußen 1/d²) und dem weichen Saum an der Reichweite R ((1 − (d/R)⁴)², der Saum
    // von r184s Punktlicht). Bis K11b trug die Welt den Legacy-Abfall des r128-Labors (1 − d/R)^abfall: das Feuer trug in
    // 4 m noch 31 % seiner Stärke in 1 m (1/d²: 7 %) — der Boden glühte über mehrere Meter.
    function lichtAbfall(L, d) {
        var R = L.reichweiteM, k2 = L.kernM * L.kernM;
        if (!(d < R)) return 0;
        var q = (d / R) * (d / R), saum = (1 - q * q) * (1 - q * q);
        return saum * Math.pow((1 + k2) / (d * d + k2), (L.abfall || 0) / 2);
    }
    // Das Flackern einer Quelle zur Zeit t (s) mit der Phase `phase`: −1 … 1 aus zwei Sinus in `flacker.hz` (die Flamme atmet
    // in 6–10 Hz; die Schwebung beider bricht die Periode). Ohne `flacker` 0.
    function lichtFlackern(L, t, phase) {
        var F = L && L.flacker;
        if (!F || !F.hz) return 0;
        var p = phase || 0;
        return 0.6 * Math.sin(2 * Math.PI * F.hz[0] * t + p) + 0.4 * Math.sin(2 * Math.PI * F.hz[1] * t + 2.1 * p + 1.3);
    }
    var AUSSTATTUNG = {
        feuerstelle: { lab: "Feuerstelle · Steinring, Scheite, Glut", gestalten: 2, siteTag: "glut", salz: 0x1f3a, tritt: { typ: "kreis", r: 1.05 }, licht: "feuer" },
        marktstand: { lab: "Marktstand · Plane und Waren", gestalten: 3, siteTag: "platz", salz: 0x2b51, tritt: { typ: "kasten", ex: 1.45, ez: 1.05 } },
        brunnen: { lab: "Ziehbrunnen · Steinkranz, Haspel, Schindeldach", gestalten: 2, siteTag: "platz", salz: 0x3c77, tritt: { typ: "kreis", r: 1.75 } },
        // DIE LATERNE (K10 × K11, rein additiv): die Leuchte der Gasse als Gestalt — ihr Licht ist das Datum ihres Rezepts
        laterne: { lab: "Laterne · Eisenmast, Glas-Kopf, Haube", gestalten: 1, siteTag: "weg", salz: 0x4d93, tritt: { typ: "kreis", r: 0.45 }, licht: "laterne" },
        // DIE WANDLATERNE (K66-2): derselbe Kopf am Arm vor der Hauswand — die Leuchte der dichten Gasse und der Tür von Gasthaus
        // und Schmiede; ihr Licht LICHT_GESETZ.wandlaterne. Der Tritt ist der Kopf (sie hängt, kein Fuß steht im Weg).
        wandlaterne: { lab: "Wandlaterne · Arm, Glas-Kopf, Haube", gestalten: 1, siteTag: "wand", salz: 0x5ea7, tritt: { typ: "kreis", r: 0.15 }, licht: "wandlaterne" },
    };
    // B4 — die Regler der Ausstattung (die Werkstatt baut ihre Slider daraus, der ov-Kanal liest dieselben ids).
    var AUS_PARAMS = [
        { id: "groesse", lab: "Größe", min: 0.8, max: 1.25, step: 0.05, def: 1, law: "das Grundmaß (Ring · Tisch · Kranz); die Proportionen folgen", grp: "FORM" },
        { id: "fuelle", lab: "Fülle", min: 0, max: 1, step: 0.05, def: 0.6, law: "wie viel das Ding trägt — Scheite und Flamme · Waren · Seil und Eimer", grp: "AUSSTATTUNG" },
        { id: "verwitterung", lab: "Verwitterung", min: 0, max: 1, step: 0.05, def: 0.5, law: "das Alter der Fläche — Ruß, Erdsaum, Moos, Sonnenbleiche", grp: "MATERIAL" },
    ];
    for (var _aus in AUSSTATTUNG) {
        PRESETS[_aus] = {
            kind: "ausstattung",
            lab: AUSSTATTUNG[_aus].lab,
            s: { groesse: 1, fuelle: 0.6, verwitterung: 0.5 },
            fx: {
                place: { mode: "site", siteTag: AUSSTATTUNG[_aus].siteTag },
                tritt: Object.assign({}, AUSSTATTUNG[_aus].tritt),
            },
        };
        // das Emitter-Datum der Quelle reist als fx-Daten (JSON-klonbar, must-ignore; K11)
        if (AUSSTATTUNG[_aus].licht) PRESETS[_aus].fx.licht = JSON.parse(JSON.stringify(LICHT_GESETZ[AUSSTATTUNG[_aus].licht]));
    }

    // Die Stoffe, die das Haus nicht trägt (rein additiv, der Lab-Block oben bleibt wörtlich): die Plane (Tuch,
    // beidseitig) und die Ware (weiße Basis — die Farbe jeder Frucht reist im Vertex). Glutbett, glimmende Scheit-
    // Stirnen und Flammen sind EIN Stoff, das Herdfeuer des Hauses (`feuer`, Seh-Klasse glut): eine Glut, ein Draw —
    // die Flamme liest sich durch ihre hellere Vertex-Farbe und ihre Form.
    function ausMaterialien() {
        var MM = materials();
        if (MM.tuch) return MM;
        MM.tuch = new THREE.MeshStandardMaterial({ color: 0xb0533a, roughness: 0.93, metalness: 0, vertexColors: true, side: THREE.DoubleSide });
        MM.ware = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.78, metalness: 0, vertexColors: true });
        var neu = ["tuch", "ware"];
        for (var i = 0; i < neu.length; i++) {
            _roleByMat.set(MM[neu[i]], neu[i]);
            MM[neu[i]].userData.__seh = SEH_DER_ROLLE[neu[i]];
            _HEX[neu[i]] = MM[neu[i]].color.getHex(); // FARB-GESETZ: die Absicht für den Bake, der Stoff zeigt den linearen Wert
            MM[neu[i]].color.convertSRGBToLinear();
        }
        return MM;
    }
    SEH_DER_ROLLE.tuch = "stoff";
    SEH_DER_ROLLE.ware = "stoff";

    // Die Regler: Rezept-s, dann ov — nur die eigenen ids, geklemmt (fremde Schlüssel: must-ignore; `__`-Schlüssel
    // sind Steuer-Passagiere, nie Bau-Parameter). Die Tafel ist die der Art (`AUS_ARTEN`: die Ausstattung, die Bank, die Leiter).
    function ausParams(pre, ov) {
        var P = {},
            T = (pre && AUS_ARTEN[pre.kind]) || AUS_PARAMS;
        for (var i = 0; i < T.length; i++) {
            var d = T[i];
            var v = pre && pre.s && typeof pre.s[d.id] === "number" ? pre.s[d.id] : d.def;
            if (ov && typeof ov === "object" && typeof ov[d.id] === "number" && isFinite(ov[d.id])) v = ov[d.id];
            P[d.id] = Math.max(d.min, Math.min(d.max, v));
        }
        return P;
    }

    // Ein Zufalls-Strom je (Same, Teilsystem) — mulberry32, nur Ganzzahl-Arithmetik (plattformgleich). Eigene Ströme
    // je Teilsystem halten die Gestalt über die Stufen deckungsgleich (L1 zieht dieselben Zahlen, baut nur gröber).
    function ausZufall(seed, salz) {
        var h = (Math.imul((seed >>> 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(salz | 0, 0xc2b2ae35)) >>> 0;
        h = (h ^ (h >>> 16)) >>> 0 || 0x6d2b79f5;
        return function () {
            h = (h + 0x6d2b79f5) >>> 0;
            var t = h;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function ausGeo(pos, nrm, idx) {
        var g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        if (nrm) g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
        g.setIndex(idx);
        if (!nrm) g.computeVertexNormals();
        return g;
    }
    // Konvexe Vielecke, je Fläche eigene Ecken (harte Kanten); `mitte` richtet jede Fläche nach außen (Newell-Normale).
    function ausVielecke(polys, mitte) {
        var pos = [],
            nrm = [],
            idx = [],
            v = 0;
        for (var p = 0; p < polys.length; p++) {
            var P = polys[p],
                n = P.length,
                nx = 0,
                ny = 0,
                nz = 0,
                cx = 0,
                cy = 0,
                cz = 0,
                i;
            for (i = 0; i < n; i++) {
                var a = P[i],
                    b = P[(i + 1) % n];
                nx += (a[1] - b[1]) * (a[2] + b[2]);
                ny += (a[2] - b[2]) * (a[0] + b[0]);
                nz += (a[0] - b[0]) * (a[1] + b[1]);
                cx += a[0];
                cy += a[1];
                cz += a[2];
            }
            var l = Math.sqrt(nx * nx + ny * ny + nz * nz);
            if (!(l > 1e-12)) continue;
            nx /= l;
            ny /= l;
            nz /= l;
            var Q = P;
            if ((cx / n - mitte[0]) * nx + (cy / n - mitte[1]) * ny + (cz / n - mitte[2]) * nz < 0) {
                Q = P.slice().reverse();
                nx = -nx;
                ny = -ny;
                nz = -nz;
            }
            for (i = 0; i < n; i++) {
                pos.push(Q[i][0], Q[i][1], Q[i][2]);
                nrm.push(nx, ny, nz);
            }
            for (i = 1; i < n - 1; i++) idx.push(v, v + i, v + i + 1);
            v += n;
        }
        return ausGeo(pos, nrm, idx);
    }
    // DIE GEFASTE KISTE (Zimmermanns-Gesetz: keine Kante bleibt scharf — die Fase fängt das Licht): sechs Flächen,
    // zwölf Fasen, acht Eck-Dreiecke = 44 Dreiecke; f = 0 die scharfe Kiste (12).
    function ausKiste(lx, ly, lz, f) {
        var hx = lx / 2,
            hy = ly / 2,
            hz = lz / 2;
        f = Math.min(f || 0, hx * 0.45, hy * 0.45, hz * 0.45);
        var polys = [],
            S = [-1, 1],
            i,
            j,
            k;
        if (!(f > 1e-4)) {
            var C = function (sx, sy, sz) {
                return [sx * hx, sy * hy, sz * hz];
            };
            for (i = 0; i < 2; i++) {
                var s = S[i];
                polys.push([C(s, -1, -1), C(s, 1, -1), C(s, 1, 1), C(s, -1, 1)]);
                polys.push([C(-1, s, -1), C(1, s, -1), C(1, s, 1), C(-1, s, 1)]);
                polys.push([C(-1, -1, s), C(1, -1, s), C(1, 1, s), C(-1, 1, s)]);
            }
            return ausVielecke(polys, [0, 0, 0]);
        }
        // Ecke (sx,sy,sz) auf der Fläche der Achse a: die Fläche liegt voll außen, die zwei anderen Achsen um f eingerückt.
        var E = function (sx, sy, sz, a) {
            return [a === 0 ? sx * hx : sx * (hx - f), a === 1 ? sy * hy : sy * (hy - f), a === 2 ? sz * hz : sz * (hz - f)];
        };
        for (i = 0; i < 2; i++) {
            var t = S[i];
            polys.push([E(t, -1, -1, 0), E(t, 1, -1, 0), E(t, 1, 1, 0), E(t, -1, 1, 0)]);
            polys.push([E(-1, t, -1, 1), E(1, t, -1, 1), E(1, t, 1, 1), E(-1, t, 1, 1)]);
            polys.push([E(-1, -1, t, 2), E(1, -1, t, 2), E(1, 1, t, 2), E(-1, 1, t, 2)]);
        }
        for (i = 0; i < 2; i++)
            for (j = 0; j < 2; j++) {
                var sa = S[i],
                    sb = S[j];
                polys.push([E(sa, sb, -1, 0), E(sa, sb, 1, 0), E(sa, sb, 1, 1), E(sa, sb, -1, 1)]);
                polys.push([E(sa, -1, sb, 0), E(sa, 1, sb, 0), E(sa, 1, sb, 2), E(sa, -1, sb, 2)]);
                polys.push([E(-1, sa, sb, 1), E(1, sa, sb, 1), E(1, sa, sb, 2), E(-1, sa, sb, 2)]);
            }
        for (i = 0; i < 2; i++)
            for (j = 0; j < 2; j++)
                for (k = 0; k < 2; k++) polys.push([E(S[i], S[j], S[k], 0), E(S[i], S[j], S[k], 1), E(S[i], S[j], S[k], 2)]);
        return ausVielecke(polys, [0, 0, 0]);
    }
    // DER DREHKÖRPER: ein Profil [[r, y], …] (unten → oben) um die y-Achse, `seg` Teilungen ohne Naht-Duplikat (die
    // Seite bleibt glatt); r = 0 schließt spitz; `boden`/`deckel` schließen flach mit harter Kante. Ein Profil, das
    // nach innen zurückläuft (Korb, Eimer), dreht seine Normale selbst nach innen. `jitter(i, k)` darf je Ring-Punkt
    // den Radius verformen (Rinde, Glut).
    function ausDreh(profil, seg, boden, deckel, jitter) {
        if (_ausDetail < 1) seg = Math.max(Math.min(seg, 3), Math.round(seg * _ausDetail));
        var pos = [],
            idx = [],
            ring = [],
            n = profil.length,
            i,
            k;
        for (i = 0; i < n; i++) {
            var r = profil[i][0],
                y = profil[i][1];
            if (r <= 1e-6) {
                ring.push({ a: pos.length / 3, spitz: true });
                pos.push(0, y, 0);
                continue;
            }
            ring.push({ a: pos.length / 3, spitz: false });
            for (k = 0; k < seg; k++) {
                var w = (k / seg) * Math.PI * 2,
                    rj = jitter ? r * jitter(i, k) : r;
                pos.push(Math.cos(w) * rj, y, Math.sin(w) * rj);
            }
        }
        for (i = 0; i < n - 1; i++) {
            var A = ring[i],
                B = ring[i + 1];
            if (A.spitz && B.spitz) continue;
            for (k = 0; k < seg; k++) {
                var k1 = (k + 1) % seg;
                if (A.spitz) idx.push(A.a, B.a + k, B.a + k1);
                else if (B.spitz) idx.push(A.a + k, B.a, A.a + k1);
                else idx.push(A.a + k, B.a + k, B.a + k1, A.a + k, B.a + k1, A.a + k1);
            }
        }
        var g = ausGeo(pos, null, idx);
        if (!boden && !deckel) return g;
        var P2 = Array.prototype.slice.call(g.attributes.position.array),
            N2 = Array.prototype.slice.call(g.attributes.normal.array),
            I2 = Array.prototype.slice.call(g.index.array);
        var kappe = function (ri, unten) {
            var R0 = ring[ri];
            if (R0.spitz) return;
            var c = P2.length / 3,
                ny = unten ? -1 : 1;
            P2.push(0, profil[ri][1], 0);
            N2.push(0, ny, 0);
            for (var kk = 0; kk < seg; kk++) {
                P2.push(pos[(R0.a + kk) * 3], pos[(R0.a + kk) * 3 + 1], pos[(R0.a + kk) * 3 + 2]);
                N2.push(0, ny, 0);
            }
            for (kk = 0; kk < seg; kk++) {
                var a1 = c + 1 + kk,
                    b1 = c + 1 + ((kk + 1) % seg);
                if (unten) I2.push(c, a1, b1);
                else I2.push(c, b1, a1);
            }
        };
        if (boden) kappe(0, true);
        if (deckel) kappe(n - 1, false);
        g.dispose();
        return ausGeo(P2, N2, I2);
    }
    // DER FELDSTEIN: ein Ikosaeder (Stufe 0: 20 Flächen · 1: 80), je Richtung von drei Wellen-Lappen verbeult, an zwei
    // Bruchflächen gekappt, unten abgeplattet (er liegt, er balanciert nicht), glatt schattiert. `glatt`: ohne Bruch
    // (Frucht, Brot, Sack — dieselbe Knolle).
    function ausFeldstein(z, fein, lx, ly, lz, glatt) {
        var t = (1 + Math.sqrt(5)) / 2;
        var V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
        var F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
        var i, j;
        for (i = 0; i < V.length; i++) {
            var l0 = Math.sqrt(V[i][0] * V[i][0] + V[i][1] * V[i][1] + V[i][2] * V[i][2]);
            V[i] = [V[i][0] / l0, V[i][1] / l0, V[i][2] / l0];
        }
        if (fein) {
            var mitten = {},
                F2 = [];
            var mitte = function (a, b) {
                var key = a < b ? a + "_" + b : b + "_" + a;
                if (mitten[key] !== undefined) return mitten[key];
                var m = [(V[a][0] + V[b][0]) / 2, (V[a][1] + V[b][1]) / 2, (V[a][2] + V[b][2]) / 2];
                var lm = Math.sqrt(m[0] * m[0] + m[1] * m[1] + m[2] * m[2]);
                V.push([m[0] / lm, m[1] / lm, m[2] / lm]);
                mitten[key] = V.length - 1;
                return mitten[key];
            };
            for (i = 0; i < F.length; i++) {
                var f = F[i],
                    ab = mitte(f[0], f[1]),
                    bc = mitte(f[1], f[2]),
                    ca = mitte(f[2], f[0]);
                F2.push([f[0], ab, ca], [f[1], bc, ab], [f[2], ca, bc], [ab, bc, ca]);
            }
            F = F2;
        }
        // drei Lappen: Richtung, Frequenz, Phase, Höhe — und zwei BRUCHFLÄCHEN (ein Feldstein ist gebrochen, nie ein Ei):
        // Richtung + Abstand der Ebene. Zahlen in fester Folge (auch die grobe Stufe zieht alle).
        var L = [],
            B = [];
        for (j = 0; j < 3; j++) {
            var ux = z() * 2 - 1,
                uy = z() * 2 - 1,
                uz = z() * 2 - 1,
                lu = Math.sqrt(ux * ux + uy * uy + uz * uz) || 1;
            L.push([ux / lu, uy / lu, uz / lu, 2.2 + z() * 1.6, z() * 6.2832, 0.05 + z() * 0.07]);
        }
        for (j = 0; j < 2; j++) {
            var bw = z() * 6.2832,
                bh = (z() - 0.3) * 0.9;
            var bl = Math.sqrt(1 + bh * bh);
            B.push([Math.cos(bw) / bl, bh / bl, Math.sin(bw) / bl, 0.62 + z() * 0.22]);
        }
        var pos = [],
            idx = [];
        for (i = 0; i < V.length; i++) {
            var d = V[i],
                r = 1;
            for (j = 0; j < 3; j++) r += L[j][5] * Math.cos(L[j][3] * (d[0] * L[j][0] + d[1] * L[j][1] + d[2] * L[j][2]) + L[j][4]);
            for (j = 0; j < 2 && !glatt; j++) {
                var dn = d[0] * B[j][0] + d[1] * B[j][1] + d[2] * B[j][2];
                if (dn > 0.05 && r * dn > B[j][3]) r = B[j][3] / dn; // auf die Bruchfläche zurück
            }
            var y = d[1] * r;
            if (y < -0.45) y = -0.45 + (y + 0.45) * 0.25; // die Liegefläche
            pos.push((d[0] * r * lx) / 2, (y * ly) / 2, (d[2] * r * lz) / 2);
        }
        for (i = 0; i < F.length; i++) idx.push(F[i][0], F[i][1], F[i][2]);
        return ausGeo(pos, null, idx);
    }
    // Ein Teil an seinen Ort: Rotation (Euler XYZ) + Verschiebung direkt in die Geometrie (der Bake liest Asset-Raum).
    var _ausM = null,
        _ausE = null;
    function ausSetze(geo, x, y, z, rx, ry, rz) {
        if (!_ausM) {
            _ausM = new THREE.Matrix4();
            _ausE = new THREE.Euler();
        }
        _ausE.set(rx || 0, ry || 0, rz || 0);
        _ausM.makeRotationFromEuler(_ausE);
        _ausM.setPosition(x, y, z);
        geo.applyMatrix4(_ausM);
        return geo;
    }
    // Ein Teil entlang einer Strecke a → b (lokale y-Achse = Strecke, Ursprung = a).
    var _ausQ = null;
    function ausStrecke(geo, a, b) {
        if (!_ausQ) _ausQ = new THREE.Quaternion();
        var dx = b[0] - a[0],
            dy = b[1] - a[1],
            dz = b[2] - a[2],
            l = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        _ausQ.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx / l, dy / l, dz / l));
        var m = new THREE.Matrix4().makeRotationFromQuaternion(_ausQ);
        m.setPosition(a[0], a[1], a[2]);
        geo.applyMatrix4(m);
        return geo;
    }
    // DAS VERWITTERUNGS-GESETZ: der Ton-Faktor je Vertex aus Lage (Asset-Raum), Normale und Rolle. `fn` (optional)
    // liefert das Eigene des Teils: ton [r,g,b] (der Stein, das Brett) und russ (0..1).
    var AUS_ERDE = [0.62, 0.66, 0.55],
        AUS_MOOS = [0.6, 0.76, 0.45],
        AUS_BLEICHE = [1.12, 1.1, 1.06],
        AUS_RUSS = [0.2, 0.19, 0.18];
    function ausFaerbe(geo, rolle, w, fn) {
        var P = geo.attributes.position,
            N = geo.attributes.normal,
            n = P.count,
            c = new Float32Array(n * 3);
        var stein = rolle === "stein",
            holz = rolle === "holz" || rolle === "lattung" || rolle === "stamm";
        var glut = rolle === "feuer";
        for (var i = 0; i < n; i++) {
            var x = P.getX(i),
                y = P.getY(i),
                zz = P.getZ(i),
                nx = N.getX(i),
                ny = N.getY(i),
                nz = N.getZ(i);
            var r = 1,
                g = 1,
                b = 1,
                e = fn ? fn(x, y, zz, nx, ny, nz) : null;
            if (e && e.ton) {
                r = e.ton[0];
                g = e.ton[1];
                b = e.ton[2];
            }
            if (!glut) {
                var s = Math.max(0, Math.min(1, (0.25 - Math.max(y, -0.1)) / 0.35)) * w * 0.85;
                r *= 1 + (AUS_ERDE[0] - 1) * s;
                g *= 1 + (AUS_ERDE[1] - 1) * s;
                b *= 1 + (AUS_ERDE[2] - 1) * s;
                if (stein) {
                    var m = w * 0.55 * Math.max(0, Math.min(1, (ny - 0.4) / 0.6)) * Math.max(0, Math.min(1, (0.4 - y) / 0.4));
                    r *= 1 + (AUS_MOOS[0] - 1) * m;
                    g *= 1 + (AUS_MOOS[1] - 1) * m;
                    b *= 1 + (AUS_MOOS[2] - 1) * m;
                }
                if (holz) {
                    var bl = w * 0.4 * Math.max(0, Math.min(1, (ny - 0.6) / 0.4));
                    r *= 1 + (AUS_BLEICHE[0] - 1) * bl;
                    g *= 1 + (AUS_BLEICHE[1] - 1) * bl;
                    b *= 1 + (AUS_BLEICHE[2] - 1) * bl;
                }
                var ru = e && e.russ ? Math.max(0, Math.min(1, e.russ)) : 0;
                r *= 1 + (AUS_RUSS[0] - 1) * ru;
                g *= 1 + (AUS_RUSS[1] - 1) * ru;
                b *= 1 + (AUS_RUSS[2] - 1) * ru;
            }
            c[i * 3] = r;
            c[i * 3 + 1] = g;
            c[i * 3 + 2] = b;
        }
        geo.setAttribute("color", new THREE.Float32BufferAttribute(c, 3));
        return geo;
    }
    function ausTeil(g, geo, rolle) {
        var m = new THREE.Mesh(geo, mat(rolle));
        g.add(m);
        return m;
    }
    // Ein Ton-Faktor um 1 (Brett gegen Brett, Stein gegen Stein): Helligkeit ± spanne, warm/kalt ± warm.
    function ausTon(z, spanne, warm) {
        var l = 1 + (z() - 0.5) * 2 * spanne,
            w = (z() - 0.5) * 2 * warm;
        return [l + w, l, l - w];
    }
    // Ein ZIEL (lineare Albedo) auf einer Rolle: der Ton-Faktor, den der Bake auf ihren Grundton (`_colFor`, linear) legt.
    function ausAuf(ziel, rolle, kol) {
        var b = _colFor(rolle, kol || null);
        return [ziel[0] / b[0], ziel[1] / b[1], ziel[2] / b[2]];
    }

    // ── DIE FEUERSTELLE: Steinring · Aschebett · Glutbett · Scheite im Stern · Flammen · (nah) Holzvorrat ──
    function ausFeuerstelle(g, p, seed, stufe, kol) {
        var G = p.groesse,
            F = p.fuelle,
            W = p.verwitterung,
            fein = stufe === 0;
        var zR = ausZufall(seed, 0x51),
            zS = ausZufall(seed, 0x52),
            zF = ausZufall(seed, 0x53),
            zV = ausZufall(seed, 0x54);
        var R = 0.58 * G;
        // DER STEINRING — Feldsteine tangential gelegt, ein Drittel eingesunken; die der Glut zugewandte Seite trägt Ruß.
        var nStein = 11 + Math.round(F * 3 + zR() * 2),
            steinBreit = 1;
        // über der Zeile (buildAusstattung): die ferne Stufe legt weniger, breitere Steine — der Ring bleibt geschlossen
        if (_ausDetail < 1 && !fein) {
            steinBreit = nStein / Math.max(8, Math.round(nStein * _ausDetail));
            nStein = Math.round(nStein / steinBreit);
        }
        for (var i = 0; i < nStein; i++) {
            var w = ((i + 0.5 + (zR() - 0.5) * 0.4) / nStein) * Math.PI * 2;
            var rr = R + (zR() - 0.5) * 0.07 * G;
            var b = (0.17 + zR() * 0.1) * G * steinBreit,
                tq = b * (0.68 + zR() * 0.3),
                h = b * (0.52 + zR() * 0.26);
            var ton = ausTon(zR, 0.13, 0.04),
                kipp = (zR() - 0.5) * 0.3;
            var geo = ausFeldstein(zR, fein, b, h, tq);
            ausSetze(geo, Math.cos(w) * rr, h * 0.5 - 0.055 * G, Math.sin(w) * rr, kipp, -w - Math.PI / 2, 0);
            ausFaerbe(geo, "stein", W, function (x, y, zz, nx, ny, nz) {
                var lr = Math.sqrt(x * x + zz * zz) || 1;
                var innen = Math.max(0, -(x * nx + zz * nz) / lr) * Math.max(0, Math.min(1, (y + 0.03) / 0.1));
                return { ton: ton, russ: innen * (0.55 + 0.45 * W) };
            });
            ausTeil(g, geo, "stein");
        }
        // DAS ASCHEBETT — eine flache Grube: die Asche liegt auf Bodenhöhe, ihr Rand taucht 14 cm unter den Boden (am Hang
        // schneidet die Welt-Fläche sie, kein Spalt, keine Kante). Nah franst der Rand aus, die Asche geht nach außen in
        // getretene Erde über (Blick 05.10.: eine graue Achteck-Platte lag erhaben auf dem Gras).
        var ascheS = fein ? 14 : 8;
        var asche = ausDreh(
            [[R * 1.05, -0.14], [R * 0.85, -0.025], [R * 0.45, -0.004], [0, 0.002]],
            ascheS,
            false,
            false,
            fein
                ? function (pi, k) {
                      return pi < 2 ? 1 + ((((k * 7 + pi * 3) % 5) - 2) * 0.05) : 1;
                  }
                : null
        );
        var tonAsche = [0.5, 0.5, 0.52],
            tonErde = ausAuf([0.08, 0.065, 0.05], "lehm", kol);
        ausFaerbe(asche, "lehm", W, function (x, y, zz) {
            var d = Math.sqrt(x * x + zz * zz) / R;
            var e = Math.max(0, Math.min(1, (d - 0.75) / 0.27));
            return {
                ton: [tonAsche[0] + (tonErde[0] - tonAsche[0]) * e, tonAsche[1] + (tonErde[1] - tonAsche[1]) * e, tonAsche[2] + (tonErde[2] - tonAsche[2]) * e],
                russ: Math.max(0, Math.min(1, (0.55 - d) / 0.3)) * 0.8,
            };
        });
        ausTeil(g, asche, "lehm");
        // DAS GLUTBETT — ein flacher, knolliger Hügel, heiß in der Mitte.
        var glutR = 0.38 * G;
        var glut = ausDreh(
            [[glutR, -0.03], [glutR * 0.78, 0.03], [glutR * 0.42, 0.068], [0, 0.078]],
            fein ? 12 : 7,
            false,
            false,
            fein
                ? function (pi, k) {
                      return 1 + (((pi * 7 + k * 13) % 5) - 2) * 0.035;
                  }
                : null
        );
        // DIE GLUT LEUCHTET, SIE IST NICHT HELL: die Albedo der Kohle ist dunkel (Mitte 0,30/0,10/0,03 · Rand
        // 0,06/0,04/0,03 linear), das Leuchten trägt der Stoff (feuer: emissiv) — sonst bleicht die Sonne die Glut zu Creme.
        ausFaerbe(glut, "feuer", W, function (x, y, zz) {
            var d = Math.min(1, Math.sqrt(x * x + zz * zz) / glutR);
            return { ton: ausAuf([0.06 + 0.24 * (1 - d), 0.04 + 0.06 * (1 - d), 0.03], "feuer") };
        });
        ausTeil(g, glut, "feuer");
        // DIE SCHEITE IM STERN — das innere Ende liegt auf der Glut (verkohlt, glimmend), das äußere auf der Asche.
        var nScheit = 3 + Math.round(F * 3);
        for (i = 0; i < nScheit; i++) {
            var a = ((i + 0.5 + (zS() - 0.5) * 0.5) / nScheit) * Math.PI * 2;
            var rs = (0.045 + zS() * 0.016) * G,
                rIn = (0.08 + zS() * 0.05) * G,
                rAus = (0.44 + zS() * 0.08) * G;
            var pIn = [Math.cos(a) * rIn, 0.11 + zS() * 0.04, Math.sin(a) * rIn],
                pAus = [Math.cos(a) * rAus, 0.045, Math.sin(a) * rAus];
            var ddx = pIn[0] - pAus[0],
                ddy = pIn[1] - pAus[1],
                ddz = pIn[2] - pAus[2],
                len = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz);
            var rinde = ausTon(zS, 0.1, 0.03);
            var sj = Math.floor(zS() * 1000);
            var scheit = ausDreh(
                [[rs, 0], [rs * 0.96, len]],
                fein ? 7 : 5,
                true,
                true,
                fein
                    ? function (pi, k) {
                          return 1 + ((((sj + k * 7 + pi * 3) % 6) - 2.5) * 0.03);
                      }
                    : null
            );
            ausStrecke(scheit, pAus, pIn);
            ausFaerbe(scheit, "holz", W, function (x, y, zz, nx, ny, nz) {
                var d = Math.sqrt(x * x + zz * zz);
                var kohle = Math.max(0, Math.min(1, (0.3 * G - d) / (0.2 * G)));
                // die Schnittfläche außen ist hell (frisches Holz), innen verkohlt
                var dot = (nx * ddx + ny * ddy + nz * ddz) / len;
                var hirn = dot < -0.8 ? [1.55, 1.38, 1.12] : null;
                return { ton: hirn || rinde, russ: kohle * 0.95 };
            });
            ausTeil(g, scheit, "holz");
            if (fein) {
                // die glimmende Stirn am inneren Ende
                var stirn = ausDreh([[rs * 0.82, 0], [0, 0.012]], 7, true, false);
                ausStrecke(stirn, pIn, [pIn[0] + ddx / len, pIn[1] + ddy / len, pIn[2] + ddz / len]);
                ausFaerbe(stirn, "feuer", W, function () {
                    return { ton: ausAuf([0.3, 0.1, 0.03], "feuer") };
                });
                ausTeil(g, stirn, "feuer");
            }
        }
        // DIE FLAMMEN — schmale Zungen aus der Glut, jede in ihrem Zug gebogen (der Wind ist der Wirt, die Form das Gesetz);
        // die Fülle trägt Zahl und Höhe. Albedo dunkel-orange (unten 0,55/0,30/0,08 · Spitze 0,45/0,14/0,035), das Licht
        // ist der Stoff.
        var nFl = F < 0.15 ? 0 : 3 + Math.round(F * 2);
        var zunge = [[0, 0], [0.5, 0.06], [0.56, 0.2], [0.44, 0.42], [0.26, 0.64], [0.1, 0.86], [0, 1]];
        for (i = 0; i < nFl; i++) {
            var fh = (0.2 + zF() * 0.3) * (0.6 + 0.6 * F) * G * (i === 0 ? 1.25 : 1),
                fw = fh * (0.24 + zF() * 0.08),
                fa = zF() * Math.PI * 2,
                fd = (i === 0 ? 0 : 0.05 + zF() * 0.08) * G,
                zx = (zF() - 0.5) * 0.5,
                zzz = (zF() - 0.5) * 0.5,
                fdreh = zF() * Math.PI;
            var prof = [];
            for (var q = 0; q < zunge.length; q++) prof.push([zunge[q][0] * fw, zunge[q][1] * fh]);
            var fl = ausDreh(prof, fein ? 6 : 3, false, false); // fern dreikantig — dieselben Zungen, dieselbe Höhe
            // der Zug: die Zunge biegt sich quadratisch mit der Höhe (Spitze bis ±0,25·h aus dem Lot)
            var P3 = fl.attributes.position;
            for (var v3 = 0; v3 < P3.count; v3++) {
                var tt = P3.getY(v3) / fh;
                P3.setX(v3, P3.getX(v3) + zx * fh * tt * tt);
                P3.setZ(v3, P3.getZ(v3) + zzz * fh * tt * tt);
            }
            fl.computeVertexNormals();
            ausSetze(fl, Math.cos(fa) * fd, 0.045, Math.sin(fa) * fd, 0, fdreh, 0);
            ausFaerbe(fl, "feuer", W, function (x, y) {
                var t = Math.max(0, Math.min(1, (y - 0.045) / fh));
                return { ton: ausAuf([0.55 - 0.1 * t, 0.3 - 0.16 * t, 0.08 - 0.045 * t], "feuer") };
            });
            ausTeil(g, fl, "feuer");
        }
        // DER HOLZVORRAT (nach Gestalt): Scheite neben dem Ring, zwei Lagen — er gehört zur Silhouette, beide Stufen tragen ihn.
        var hatVorrat = zV() < 0.67 && F > 0.3,
            va = zV() * Math.PI * 2;
        if (hatVorrat) {
            var cxV = Math.cos(va) * (R + 0.42 * G),
                czV = Math.sin(va) * (R + 0.42 * G),
                tx = -Math.sin(va),
                tz = Math.cos(va);
            // Lagen im Stapel-Raum: [quer, hoch] — zwei unten, eins oder zwei oben in der Mulde
            var lagen = [[-0.055, 0.05], [0.055, 0.05], [0, 0.135], [0.11, 0.135]];
            var nV = 3 + (zV() < 0.5 ? 1 : 0);
            for (i = 0; i < nV; i++) {
                var lv = lagen[i],
                    rv = 0.05 * G,
                    lenV = (0.42 + zV() * 0.12) * G,
                    tv = ausTon(zV, 0.1, 0.03);
                var sv = ausDreh([[rv, 0], [rv, lenV]], fein ? 6 : 4, true, true);
                ausSetze(sv, lenV / 2, 0, 0, 0, 0, Math.PI / 2); // liegend, längs x, mittig
                ausSetze(sv, 0, lv[1] * G, lv[0] * G, 0, 0, 0); // seine Lage im Stapel
                ausSetze(sv, cxV, -0.01, czV, 0, -va - Math.PI / 2, 0); // der Stapel tangential am Ring
                ausFaerbe(sv, "holz", W, function (x, y, zz, nx, ny, nz) {
                    return { ton: Math.abs(nx * tx + nz * tz) > 0.8 ? [1.5, 1.34, 1.1] : tv };
                });
                ausTeil(g, sv, "holz");
            }
        }
    }

    // ── DER MARKTSTAND: vier Pfosten · Bretter-Tisch mit Zargen · Ablage · Pfetten und Sparren · gestreifte Plane mit
    //    Volant · (nah) Waren in Körben, Kisten, ein Fass, ein Sack ──
    function ausMarktstand(g, p, seed, stufe, kol) {
        var G = p.groesse,
            F = p.fuelle,
            W = p.verwitterung,
            fein = stufe === 0;
        var zH = ausZufall(seed, 0x61),
            zW = ausZufall(seed, 0x63);
        var fa = fein ? 0.011 : 0;
        var bx = 1.0 * G,
            bz = 0.45,
            hT = 0.86,
            hV = 2.25,
            hH = 1.95,
            tief = 0.35,
            pf = 0.09;
        var holz = function (geo, ton, rolle) {
            ausFaerbe(geo, rolle || "holz", W, function () {
                return { ton: ton };
            });
            ausTeil(g, geo, rolle || "holz");
        };
        var sx, sz, i;
        // DIE PFOSTEN — vorn hoch, hinten niedrig (die Plane wirft das Wasser nach hinten); 35 cm im Boden.
        for (sx = -1; sx <= 1; sx += 2)
            for (sz = -1; sz <= 1; sz += 2) {
                var hp = (sz < 0 ? hV : hH) + tief;
                holz(ausSetze(ausKiste(pf, hp, pf, fa), sx * (bx - 0.05), hp / 2 - tief, sz * (bz - 0.03), 0, 0, 0), ausTon(zH, 0.06, 0.02));
            }
        // DER TISCH — fünf Bretter mit Fuge, vier Zargen darunter.
        var nB = 5,
            bw = (2 * bz + 0.06) / nB;
        for (i = 0; i < nB; i++)
            holz(ausSetze(ausKiste(2 * bx + 0.12, 0.034, bw - 0.012, fa * 0.6), 0, hT - 0.017, -bz - 0.03 + bw * (i + 0.5), 0, 0, 0), ausTon(zH, 0.09, 0.03));
        for (sz = -1; sz <= 1; sz += 2) holz(ausSetze(ausKiste(2 * bx - 0.14, 0.1, 0.03, fa * 0.5), 0, hT - 0.085, sz * (bz - 0.07), 0, 0, 0), ausTon(zH, 0.05, 0.02));
        for (sx = -1; sx <= 1; sx += 2) holz(ausSetze(ausKiste(0.03, 0.1, 2 * bz - 0.16, fa * 0.5), sx * (bx - 0.1), hT - 0.085, 0, 0, 0, 0), ausTon(zH, 0.05, 0.02));
        // DIE ABLAGE auf 28 cm — drei Bretter auf zwei Riegeln.
        for (i = 0; i < 3; i++)
            holz(ausSetze(ausKiste(2 * bx - 0.06, 0.026, 0.25, fa * 0.5), 0, 0.28, -0.28 + i * 0.28, 0, 0, 0), ausTon(zH, 0.08, 0.03), "lattung");
        for (sx = -1; sx <= 1; sx += 2) holz(ausSetze(ausKiste(0.05, 0.05, 2 * bz, fa * 0.4), sx * (bx - 0.05), 0.24, 0, 0, 0, 0), ausTon(zH, 0.05, 0.02));
        // PFETTEN und SPARREN — der Dachrahmen auf den Pfostenköpfen.
        var yV = hV + 0.03,
            yH = hH + 0.03;
        holz(ausSetze(ausKiste(2 * bx + 0.34, 0.08, 0.07, fa), 0, yV - 0.04, -(bz - 0.03), 0, 0, 0), ausTon(zH, 0.05, 0.02));
        holz(ausSetze(ausKiste(2 * bx + 0.34, 0.08, 0.07, fa), 0, yH - 0.04, bz - 0.03, 0, 0, 0), ausTon(zH, 0.05, 0.02));
        var neig = Math.atan2(yV - yH, 2 * bz + 0.5);
        var zV0 = -bz - 0.28,
            zH0 = bz + 0.22,
            yAt = function (zz) {
                return yV + ((zz + bz) / (2 * bz)) * (yH - yV);
            };
        for (sx = -1; sx <= 1; sx += 2) {
            var lS = Math.sqrt((zH0 - zV0) * (zH0 - zV0) + (yAt(zH0) - yAt(zV0)) * (yAt(zH0) - yAt(zV0)));
            holz(ausSetze(ausKiste(0.05, 0.07, lS, fa * 0.7), sx * bx, (yAt(zV0) + yAt(zH0)) / 2 + 0.035, (zV0 + zH0) / 2, neig, 0, 0), ausTon(zH, 0.05, 0.02));
        }
        // DIE PLANE — sechs Bahnen im Wechsel Farbe/Naturtuch, zwischen den Sparren durchhängend; vorn der Volant.
        var hx = bx + 0.2,
            nBahn = 6,
            tuchB = kol.tuch,
            creme = AUS_NATURTUCH;
        var tonCreme = ausAuf(_linHex(creme), "tuch", { tuch: tuchB }); // die Naturbahn: das Leinen auf dem Grundton der Plane
        var nx0 = fein ? 3 : 1,
            nz0 = fein ? 4 : 1,
            sack = fein ? 0.045 : 0;
        for (var bi = 0; bi < nBahn; bi++) {
            var xa = -hx + (2 * hx * bi) / nBahn,
                xb = -hx + (2 * hx * (bi + 1)) / nBahn;
            var pos = [],
                idx = [];
            for (var iz = 0; iz <= nz0; iz++)
                for (var ix = 0; ix <= nx0; ix++) {
                    var x = xa + ((xb - xa) * ix) / nx0,
                        tz = iz / nz0,
                        zz = zV0 + (zH0 - zV0) * tz;
                    var tx = Math.abs(x) / hx;
                    pos.push(x, yAt(zz) + 0.06 - sack * (1 - tx * tx) * 4 * tz * (1 - tz), zz);
                }
            for (iz = 0; iz < nz0; iz++)
                for (ix = 0; ix < nx0; ix++) {
                    var a0 = iz * (nx0 + 1) + ix;
                    idx.push(a0, a0 + nx0 + 1, a0 + 1, a0 + 1, a0 + nx0 + 1, a0 + nx0 + 2);
                }
            var bahn = ausGeo(pos, null, idx);
            var bt = bi % 2 ? tonCreme : [1, 1, 1];
            ausFaerbe(bahn, "tuch", W * 0.5, function () {
                return { ton: bt };
            });
            ausTeil(g, bahn, "tuch");
            // der Volant: Bogen-Zacken unter der Vorderkante dieser Bahn
            var vp = [],
                vi = [],
                yk = yAt(zV0) + 0.06,
                nZ = fein ? 2 : 1;
            for (var zi = 0; zi < nZ; zi++) {
                var x0 = xa + ((xb - xa) * zi) / nZ,
                    x1 = xa + ((xb - xa) * (zi + 1)) / nZ,
                    xm = (x0 + x1) / 2,
                    v0 = vp.length / 3;
                vp.push(x0, yk, zV0, x1, yk, zV0, x1, yk - 0.1, zV0, xm, yk - 0.18, zV0, x0, yk - 0.1, zV0);
                vi.push(v0, v0 + 4, v0 + 3, v0, v0 + 3, v0 + 1, v0 + 1, v0 + 3, v0 + 2);
            }
            var vol = ausGeo(vp, null, vi);
            ausFaerbe(vol, "tuch", W * 0.5, function () {
                return { ton: bt };
            });
            ausTeil(g, vol, "tuch");
        }
        // DIE WAREN (nah) — Körbe mit Obst und Rüben, Brote, eine Kiste auf der Ablage, ein Fass, ein Sack.
        var nKorb = 1 + Math.round(F * 2),
            sorten = [[[0.55, 0.09, 0.06], [0.62, 0.14, 0.07], [0.45, 0.55, 0.12]], [[0.76, 0.62, 0.42], [0.7, 0.55, 0.36], [0.58, 0.2, 0.32]], [[0.38, 0.56, 0.24], [0.33, 0.5, 0.2], [0.42, 0.6, 0.28]]];
        var korbProfil = [[0, 0], [0.15, 0], [0.185, 0.13], [0.172, 0.135], [0.142, 0.022], [0, 0.022]];
        for (i = 0; i < nKorb; i++) {
            var kx = (-0.62 + (1.24 * (i + 0.5)) / nKorb) * G + (zW() - 0.5) * 0.1,
                kz = -0.08 + (zW() - 0.5) * 0.1,
                sorte = sorten[Math.floor(zW() * 3) % 3],
                nObst = 6 + Math.floor(zW() * 4);
            var obst = [];
            for (var o = 0; o < nObst; o++) obst.push([zW() * Math.PI * 2, zW() * 0.1, zW(), zW()]);
            if (!fein) {
                // fern: der Korb als Kegelstumpf, seine Füllung als Farbe der Kuppe (Ware ÷ Korb-Ton)
                var kl = ausDreh([[0.16, 0], [0.18, 0.15], [0, 0.17]], 6, true, false);
                ausSetze(kl, kx, hT, kz, 0, 0, 0);
                var kuppe = ausAuf(sorte[0], "lattung", kol);
                ausFaerbe(kl, "lattung", W, function (x, y) {
                    return { ton: y > hT + 0.13 ? kuppe : [1, 1, 1] };
                });
                ausTeil(g, kl, "lattung");
                continue;
            }
            var korb = ausDreh(korbProfil, 10, false, false);
            ausSetze(korb, kx, hT, kz, 0, 0, 0);
            ausFaerbe(korb, "lattung", W, function (x, y) {
                return { ton: [1.04 - (Math.floor((y - hT) * 60) % 2) * 0.12, 1.0 - (Math.floor((y - hT) * 60) % 2) * 0.12, 0.92] };
            });
            ausTeil(g, korb, "lattung");
            for (o = 0; o < obst.length; o++) {
                var ob = obst[o],
                    rr2 = 0.034 + ob[2] * 0.012,
                    farbe = sorte[Math.floor(ob[3] * 3) % 3];
                var frucht = ausFeldstein(ausZufall(seed + o * 31 + i * 7, 0x66), false, rr2 * 2, rr2 * 1.8, rr2 * 2, true);
                ausSetze(frucht, kx + Math.cos(ob[0]) * ob[1], hT + 0.1 + (o % 3) * 0.035, kz + Math.sin(ob[0]) * ob[1], 0, ob[0], 0);
                ausFaerbe(frucht, "ware", 0, function () {
                    return { ton: farbe };
                });
                ausTeil(g, frucht, "ware");
            }
        }
        // die Kiste auf der Ablage (Latten) und Brote darin
        var kiX = (zW() - 0.5) * 0.9,
            hatFass = zW() < 0.7,
            fassSeite = zW() < 0.5 ? -1 : 1,
            hatSack = zW() < 0.6;
        if (fein) {
            for (i = 0; i < 4; i++) {
                var lat = i < 2 ? ausKiste(0.56, 0.07, 0.02, 0.004) : ausKiste(0.02, 0.07, 0.34, 0.004);
                var lp = i === 0 ? [0, -0.16] : i === 1 ? [0, 0.16] : i === 2 ? [-0.27, 0] : [0.27, 0];
                for (var lagN = 0; lagN < 2; lagN++) holz(ausSetze(lat.clone(), kiX + lp[0], 0.33 + lagN * 0.085, lp[1], 0, 0, 0), ausTon(zW, 0.06, 0.03), "lattung");
                lat.dispose();
            }
            for (i = 0; i < 3; i++) {
                var brot = ausFeldstein(ausZufall(seed + i * 13, 0x67), false, 0.2, 0.09, 0.11, true);
                ausSetze(brot, kiX - 0.16 + i * 0.16, 0.33, 0, 0, 0.2 + i * 0.4, 0);
                ausFaerbe(brot, "ware", 0, function (x, y) {
                    return { ton: y > 0.36 ? [0.58, 0.36, 0.17] : [0.72, 0.52, 0.3] };
                });
                ausTeil(g, brot, "ware");
            }
            if (hatSack) {
                var sk = ausFeldstein(ausZufall(seed, 0x68), true, 0.36, 0.42, 0.3, true);
                ausSetze(sk, -kiX * 0.6 + (kiX > 0 ? -0.35 : 0.35), 0.29 + 0.2, 0.05, 0, 0.5, 0);
                ausFaerbe(sk, "stroh", W * 0.5, null);
                ausTeil(g, sk, "stroh");
            }
        }
        // das Fass neben dem Tisch (Dauben-Bauch, Reifen aus Eisen nah, Holz fern)
        if (hatFass) {
            var fx = fassSeite * (bx + 0.36),
                fz = -0.05;
            g.userData.fass = [fx, fz]; // die Wahl der Gestalt (die Stufe 3 liest sie, `ausWahl`)
            var fass = ausDreh([[0.2, 0], [0.235, 0.16], [0.245, 0.31], [0.235, 0.46], [0.2, 0.62], [0, 0.62]], fein ? 12 : 7, true, false);
            ausSetze(fass, fx, -0.02, fz, 0, 0, 0);
            ausFaerbe(fass, "holz", W, function (x, y, zz, nx, ny, nz) {
                var dauben = (Math.floor((Math.atan2(zz - fz, x - fx) + Math.PI) * 2.6) % 2) * 0.08;
                return { ton: ny > 0.9 ? [1.18, 1.08, 0.92] : [1.02 - dauben, 0.98 - dauben, 0.94 - dauben] };
            });
            ausTeil(g, fass, "holz");
            if (fein)
                for (i = 0; i < 2; i++) {
                    var yr = i ? 0.47 : 0.12;
                    var reif = ausDreh([[0.236, -0.018], [0.241, 0], [0.236, 0.018]], 12, false, false);
                    ausSetze(reif, fx, yr - 0.02, fz, 0, 0, 0);
                    ausFaerbe(reif, "holz", 0, function () {
                        return { ton: [0.42, 0.4, 0.38] }; // geschmiedetes Band, dunkel angelaufen
                    });
                    ausTeil(g, reif, "holz");
                }
        }
    }

    // ── DER ZIEHBRUNNEN: Steinkranz aus Quadern in drei Lagen (fern ein Drehkörper) · Deckplatten · dunkler Schacht ·
    //    Wasserspiegel · zwei Pfosten · Haspel mit Kurbel · Seil und Eimer · Satteldach aus Schindeln ──
    function ausBrunnen(g, p, seed, stufe) {
        var G = p.groesse,
            F = p.fuelle,
            W = p.verwitterung,
            fein = stufe === 0;
        var zK = ausZufall(seed, 0x71),
            zD = ausZufall(seed, 0x72),
            zH = ausZufall(seed, 0x73);
        var ri = 0.62 * G,
            ra = 0.92 * G,
            rm = (ri + ra) / 2,
            hK = 0.66,
            hD = 0.07,
            fa = fein ? 0.016 : 0;
        var i, k;
        // DER KRANZ — nah Quader im Verband (jede zweite Lage um einen halben Stein versetzt), fern der Ring.
        var nQ = 12,
            lagen = [[-0.24, 0.22], [0.22, 0.44], [0.44, hK]];
        for (var li = 0; li < lagen.length; li++)
            for (k = 0; k < nQ; k++) {
                var tonQ = ausTon(zK, 0.1, 0.04),
                    jit = (zK() - 0.5) * 0.08;
                if (!fein) continue;
                var w = ((k + (li % 2) * 0.5 + jit) / nQ) * Math.PI * 2,
                    hq = lagen[li][1] - lagen[li][0] - 0.008,
                    lq = (2 * Math.PI * rm) / nQ - 0.014;
                var q = ausKiste(lq, hq, ra - ri, fa);
                ausSetze(q, Math.cos(w) * rm, (lagen[li][0] + lagen[li][1]) / 2, Math.sin(w) * rm, 0, -w - Math.PI / 2, 0);
                ausFaerbe(q, "stein", W, function () {
                    return { ton: tonQ };
                });
                ausTeil(g, q, "stein");
            }
        if (!fein) {
            // fern der Ring mit dem Kragen der Deckplatten (dieselbe Hülle wie nah)
            var ring = ausDreh([[ra, -0.24], [ra, hK], [ra + 0.08, hK], [ra + 0.08, hK + hD], [ri, hK + hD], [ri, -0.24]], 12, false, false);
            ausFaerbe(ring, "stein", W, null);
            ausTeil(g, ring, "stein");
        }
        // DIE DECKPLATTEN — kragen nach außen über, die Fuge sitzt über der Lagenfuge versetzt.
        for (k = 0; k < nQ; k++) {
            var tonD = ausTon(zK, 0.08, 0.03);
            if (!fein) continue;
            var wd = ((k + 0.25) / nQ) * Math.PI * 2;
            var dp = ausKiste((2 * Math.PI * (rm + 0.03)) / nQ - 0.01, hD, ra - ri + 0.1, 0.014);
            ausSetze(dp, Math.cos(wd) * (rm + 0.03), hK + hD / 2, Math.sin(wd) * (rm + 0.03), 0, -wd - Math.PI / 2, 0);
            ausFaerbe(dp, "stein", W, function () {
                return { ton: [tonD[0] * 1.06, tonD[1] * 1.06, tonD[2] * 1.06] };
            });
            ausTeil(g, dp, "stein");
        }
        // DER SCHACHT — die Innenwand dunkelt mit der Tiefe; der Wasserspiegel liegt 0,55 m unter dem Boden.
        var schacht = ausDreh([[ri, hK], [ri, -1.2]], fein ? 16 : 10, false, false);
        ausFaerbe(schacht, "stein", W, function (x, y) {
            var t = Math.max(0, Math.min(1, (hK - y) / 1.4));
            var d = 1 - 0.85 * t;
            return { ton: [d, d, d * 1.02] };
        });
        ausTeil(g, schacht, "stein");
        var wasser = ausDreh([[ri, -0.55], [0, -0.55]], fein ? 16 : 10, false, false);
        ausFaerbe(wasser, "glas", 0, null);
        ausTeil(g, wasser, "glas");
        // DIE PFOSTEN — 14 cm, 30 cm im Boden, tragen den First.
        var px = ra + 0.13,
            yF = 2.62,
            hPf = yF + 0.3 - 0.05;
        var tonP = [ausTon(zH, 0.06, 0.02), ausTon(zH, 0.06, 0.02)];
        for (i = 0; i < 2; i++) {
            var pfo = ausKiste(0.14, hPf, 0.14, fa);
            ausSetze(pfo, (i ? 1 : -1) * px, hPf / 2 - 0.3, 0, 0, 0, 0);
            ausFaerbe(pfo, "holz", W, (function (t) {
                return function () {
                    return { ton: t };
                };
            })(tonP[i]));
            ausTeil(g, pfo, "holz");
        }
        // DIE HASPEL — Welle durch beide Pfosten, Trommel in der Mitte, Kurbel rechts.
        var yH = 1.5;
        var welle = ausDreh([[0.055, 0], [0.055, 2 * px + 0.34]], fein ? 8 : 5, true, true);
        ausSetze(welle, 0, 0, 0, 0, 0, Math.PI / 2);
        ausSetze(welle, px + 0.17, yH, 0, 0, 0, 0);
        ausFaerbe(welle, "holz", W, null);
        ausTeil(g, welle, "holz");
        var trommel = ausDreh([[0.11, 0], [0.115, 0.45], [0.11, 0.9]], fein ? 10 : 6, true, true);
        ausSetze(trommel, 0, 0, 0, 0, 0, Math.PI / 2);
        ausSetze(trommel, 0.45, yH, 0, 0, 0, 0);
        ausFaerbe(trommel, "lattung", W, null);
        ausTeil(g, trommel, "lattung");
        var arm = ausKiste(0.045, 0.34, 0.045, fa * 0.6);
        ausSetze(arm, px + 0.2, yH - 0.15, 0, 0, 0, 0);
        ausFaerbe(arm, "holz", W, null);
        ausTeil(g, arm, "holz");
        var griff = ausDreh([[0.024, 0], [0.024, 0.2]], fein ? 6 : 4, true, true);
        ausSetze(griff, 0, 0, 0, 0, 0, -Math.PI / 2);
        ausSetze(griff, px + 0.2, yH - 0.3, 0, 0, 0, 0);
        ausFaerbe(griff, "holz", W, null);
        ausTeil(g, griff, "holz");
        // SEIL und EIMER — die Fülle hebt den Eimer (leer am Kranz, voll am Seil hoch).
        var yE = 0.86 + F * 0.22;
        var seil = ausDreh([[0.013, 0], [0.013, yH - 0.11 - (yE + 0.3)]], fein ? 5 : 4, false, false);
        ausSetze(seil, 0.05, yE + 0.3, 0, 0, 0, 0);
        ausFaerbe(seil, "ware", 0, function () {
            return { ton: [0.42, 0.36, 0.25] }; // Hanf
        });
        ausTeil(g, seil, "ware");
        var eimer = ausDreh([[0, 0], [0.125, 0], [0.15, 0.24], [0.138, 0.245], [0.114, 0.02], [0, 0.02]], fein ? 10 : 6, false, false);
        ausSetze(eimer, 0.05, yE, 0, 0, 0, 0);
        ausFaerbe(eimer, "holz", W, function (x, y, zz) {
            var d = (Math.floor((Math.atan2(zz, x - 0.05) + Math.PI) * 2.2) % 2) * 0.07;
            return { ton: [1.08 - d, 1.02 - d, 0.95 - d] };
        });
        ausTeil(g, eimer, "holz");
        if (fein) {
            for (i = 0; i < 2; i++) {
                var er = ausDreh([[0.131 + i * 0.016, -0.012], [0.135 + i * 0.016, 0], [0.131 + i * 0.016, 0.012]], 10, false, false);
                ausSetze(er, 0.05, yE + 0.04 + i * 0.16, 0, 0, 0, 0);
                ausFaerbe(er, "holz", 0, function () {
                    return { ton: [0.42, 0.4, 0.38] }; // Eisenband, dunkel angelaufen
                });
                ausTeil(g, er, "holz");
            }
            var buegel = ausKiste(0.3, 0.012, 0.012, 0);
            ausSetze(buegel, 0.05, yE + 0.3, 0, 0, 0, 0);
            ausFaerbe(buegel, "holz", 0, function () {
                return { ton: [0.42, 0.4, 0.38] };
            });
            ausTeil(g, buegel, "holz");
        }
        // DAS DACH — First auf den Pfosten, Sparren-Paare, Schindeln in Reihen (fern zwei Flächen) mit Moos am Fuß.
        var hz = 0.86,
            yT = 2.16,
            lx = 2 * px + 0.5,
            dach = Math.atan2(yF - yT, hz),
            lS = Math.sqrt(hz * hz + (yF - yT) * (yF - yT)) + 0.08;
        var first = ausKiste(lx - 0.1, 0.12, 0.12, fa);
        ausSetze(first, 0, yF - 0.02, 0, 0, 0, 0);
        ausFaerbe(first, "holz", W, null);
        ausTeil(g, first, "holz");
        for (var sd = -1; sd <= 1; sd += 2) {
            // Rx(sd·dach): die Fläche fällt nach außen (z → ±hz) zur Traufe ab
            for (i = 0; i < 2; i++) {
                var sp = ausKiste(0.06, 0.08, lS, fa * 0.7);
                ausSetze(sp, (i ? 1 : -1) * px, (yF + yT) / 2 - 0.03, (sd * hz) / 2, sd * dach, 0, 0);
                ausFaerbe(sp, "holz", W, null);
                ausTeil(g, sp, "holz");
            }
            var nR = fein ? 6 : 1;
            for (var rI = 0; rI < nR; rI++) {
                var tonR = ausTon(zD, 0.12, 0.04);
                var tR = fein ? (rI + 0.5) / nR : 0.5,
                    bR = fein ? lS / nR + 0.06 : lS,
                    dR = fein ? 0.026 : 0.05;
                var yR = yF - (yF - yT) * tR + 0.06 + (fein ? (rI % 2) * 0.006 : 0),
                    zR = sd * hz * tR;
                var reihe = ausKiste(lx + 0.06, dR, bR, fein ? 0.006 : 0);
                ausSetze(reihe, 0, yR, zR, sd * dach, 0, 0);
                ausFaerbe(reihe, "stamm", W, function (x, y, zz, nx, ny) {
                    var moos = W * 0.45 * Math.max(0, Math.min(1, (0.5 - (yF - y) / (yF - yT)) * -2)) * Math.max(0, ny);
                    return { ton: [tonR[0] * (1 - 0.3 * moos), tonR[1] * (1 + 0.05 * moos), tonR[2] * (1 - 0.35 * moos)] };
                });
                ausTeil(g, reihe, "stamm");
            }
        }
    }

    // ── DIE LATERNE (K10 × K11): Fuß und Mast aus Guss-Eisen · Glas-Kopf im Eisen-Rahmen · Haube mit Knauf ──
    // DIE MASSE (die Gaslaterne der Gasse): der Fuß Ø 0,30 m bis 0,55 m, der Mast Ø 9 cm bis unter den Kopf, der Kopf ein
    // Glas-Kasten 0,26 × 0,40 m mit dem Licht-Mittelpunkt auf LICHT_GESETZ.laterne `hoeheM` (3,6 m), die Haube eine flache
    // Pyramide (0,40 m breit, 0,2 m hoch), nah mit Kranz und Knauf. ZWEI Rollen (das Budget der Ausstattung: der Stoff und
    // eine Seh-Klasse): metall und laternenglas — der Kopf ist Glas der Seh-Klasse glas mit dem Datum der Laterne (`__licht` laterne): sein
    // Glühen und das Licht auf Boden und Wand tragen EIN Datum (fx.licht = LICHT_GESETZ.laterne, 1900 K, Zeitplan) — der Kopf
    // im Stoff, das Licht im EINEN Licht-Pool der Welt. Stufe 1: dieselbe Silhouette, vier Seiten, ohne Rahmen und Knauf.
    function ausLaterne(g, p, seed, stufe) {
        var m = AUS_MASS.laterne(p.groesse),
            W = p.verwitterung,
            fein = stufe === 0,
            ton = ausTon(ausZufall(seed, 0x91), 0.06, 0.02);
        var eisen = function (geo) {
            ausFaerbe(geo, "metall", W, function () {
                return { ton: ton };
            });
            ausTeil(g, geo, "metall");
        };
        // der Fuß und der Mast als EIN Drehkörper (nah acht Seiten mit Wulst und Kragen unter dem Kopf)
        var profil = fein
            ? [[m.fr, -0.2], [m.fr, 0.1], [m.fr * 0.82, 0.16], [m.fr * 0.62, m.fh], [m.mr * 1.5, m.fh + 0.1], [m.mr, m.fh + 0.22], [m.mr, m.yK0 - 0.14], [m.mr * 1.7, m.yK0 - 0.04], [m.mr * 1.7, m.yK0], [0, m.yK0]]
            : [[m.fr, -0.2], [m.fr * 0.62, m.fh], [m.mr, m.fh + 0.22], [m.mr, m.yK0], [0, m.yK0]];
        eisen(ausDreh(profil, fein ? 8 : 4, false, false));
        ausLaterneKopf(g, m, eisen, fein);
    }
    // DER KOPF DER LATERNE (Mast und Wand tragen denselben, K66-2): der Boden, das Glas um die Licht-Höhe `yL`, nah die vier
    // Eck-Stäbe des Rahmens, die Haube.
    function ausLaterneKopf(g, m, eisen, fein) {
        eisen(ausSetze(ausKiste(m.kb + 0.04, 0.03, m.kb + 0.04, fein ? 0.008 : 0), 0, m.yK0 + 0.015, 0));
        var glas = ausSetze(ausKiste(m.kb, m.kh - 0.03, m.kb, 0), 0, m.yL + 0.015, 0);
        ausFaerbe(glas, "laternenglas", 0, null);
        ausTeil(g, glas, "laternenglas");
        var i, j;
        if (fein) for (i = -1; i <= 1; i += 2) for (j = -1; j <= 1; j += 2) eisen(ausSetze(ausKiste(0.022, m.kh, 0.022, 0), (i * m.kb) / 2, m.yL, (j * m.kb) / 2));
        // die Haube: nah ein Kranz unter der Pyramide und der Knauf auf ihr
        var y0 = m.yK1;
        if (fein) {
            eisen(ausSetze(ausKiste(2 * m.hb, 0.025, 2 * m.hb, 0.006), 0, m.yK1 + 0.0125, 0));
            y0 = m.yK1 + 0.025;
            eisen(ausSetze(ausKiste(0.035, 0.055, 0.035, 0), 0, m.yT + 0.0275, 0));
        }
        var h = m.hb,
            spitze = [0, m.yT, 0];
        eisen(ausVielecke([[[-h, y0, -h], [h, y0, -h], spitze], [[h, y0, -h], [h, y0, h], spitze], [[h, y0, h], [-h, y0, h], spitze], [[-h, y0, h], [-h, y0, -h], spitze], [[-h, y0, -h], [-h, y0, h], [h, y0, h], [h, y0, -h]]], [0, (y0 + m.yT) / 2, 0]));
    }
    // DIE WANDLATERNE (K66-2): der Ursprung liegt im Boden unter dem Licht, +x zeigt zur Wand (sie steht in x = armM). Die
    // Wandplatte, der Arm über dem Knauf der Haube, der Haken, an dem der Kopf hängt, nah die Strebe von der Platte zum Arm.
    function ausWandlaterne(g, p, seed, stufe) {
        var m = AUS_MASS.wandlaterne(p.groesse),
            W = p.verwitterung,
            fein = stufe === 0,
            ton = ausTon(ausZufall(seed, 0x91), 0.06, 0.02);
        var eisen = function (geo) {
            ausFaerbe(geo, "metall", W, function () {
                return { ton: ton };
            });
            ausTeil(g, geo, "metall");
        };
        eisen(ausSetze(ausKiste(0.03, m.pl, 0.14, fein ? 0.006 : 0), m.a - 0.015, m.yA - m.pl / 2 + 0.06, 0));
        eisen(ausSetze(ausKiste(m.a, 0.035, 0.035, fein ? 0.006 : 0), m.a / 2, m.yA, 0));
        eisen(ausSetze(ausKiste(0.02, m.yA - m.yT, 0.02, 0), 0, (m.yA + m.yT) / 2, 0));
        if (fein) eisen(ausStrecke(ausSetze(ausKiste(0.022, m.st, 0.022, 0), 0, m.st / 2, 0), m.sA, m.sB));
        ausLaterneKopf(g, m, eisen, fein);
    }

    // ═══ DIE WERKE DES ZIMMERMANNS (bauen.K5, rein additiv): die Sitzbank und die Podestleiter — eigene Arten (`bank` · `leiter`:
    //     eigene Regler, eigene Wirts-Zeile B7 unten), gebaut auf der Maschine der Ausstattung (Bake · Stufen · Wurf · Hülle ·
    //     Raster). Ihr Verb trägt die Form: die Bank ihre Sitzfläche auf Sitzhöhe (der Wirt liest sie als `sitzbar`, E setzt
    //     den Leib), die Leiter ihre Stufen bis zum Podest (der Leib steigt und klettert). Die Maße sind Norm, kein Regler rückt
    //     sie — die Substanz der Wirts-Zeile trägt dieselben (`AUS_MASS`), Kollision == Optik. ═══
    var WERKE = {
        sitzbank: { kind: "bank", art: "Bank", lab: "Sitzbank · Latten, Lehne, Wangen", gestalten: 2, siteTag: "platz", salz: 0x6fb3 },
        podestleiter: { kind: "leiter", art: "Leiter", lab: "Podestleiter · Holme, Stufen, Podest, Bügel", gestalten: 1, siteTag: "wand", salz: 0x71c5 },
        // DAS JOCHFELD (fahrzeug.K2, rein additiv): ein Feld der hölzernen Jochbrücke, die den Weg über das Wasser trägt — die
        // Gasse über den Bach (das Brücken-Etikett des Plans v2) und den Feldweg zwischen zwei Orten (`brueckenAmWeg`); die
        // Welt legt so viele Felder, wie die Spanne verlangt (`brueckenFelder`). Sein Verb trägt die Form: die Bohlen sind
        // Trittfläche für Rad und Fuß, das Geländer hält den Wagen auf der Bahn, unter ihm fließt das Wasser (`durchlass`).
        jochfeld: { kind: "bruecke", art: "Brücke", lab: "Jochbrücke · Bohlen, Träger, Geländer, Joch", gestalten: 2, siteTag: "weg", salz: 0x83d9 },
    };
    // B4 — die Regler der Werke: nur, was die Norm nicht verschiebt (Sitzhöhe, Steigmaß und Podest bleiben stehen).
    var BANK_PARAMS = [
        { id: "latten", lab: "Sitz-Latten", min: 2, max: 5, step: 1, def: 3, law: "das Sitzbrett aus Latten mit 12 mm Fuge — die Tiefe bleibt 0,42 m", grp: "FORM" },
        { id: "neigung", lab: "Lehne", min: 5, max: 20, step: 1, def: 12, law: "der Rücken lehnt 5–20° hinter die Senkrechte (100–110° zum Sitz)", grp: "FORM" },
        { id: "verwitterung", lab: "Verwitterung", min: 0, max: 1, step: 0.05, def: 0.5, law: "das Alter des Holzes — Sonnenbleiche oben, Erdsaum an den Füßen", grp: "MATERIAL" },
    ];
    // Die Fase beginnt bei der gebrochenen Kante (2 mm): eine scharfe Leiter bräche das Gesetz ihres eigenen Reglers, und
    // die Nah-Stufe verlöre mit der Fase fast drei Viertel ihrer Dreiecke — die L1 hielte die Hälfte nicht mehr (Quote L1/L0 ≤ 0,5).
    var LEITER_PARAMS = [
        { id: "holm", lab: "Holm", min: 0.06, max: 0.09, step: 0.005, def: 0.075, law: "die Tiefe der Holme und Schenkel — 60–90 mm Fichte tragen den Steigenden", grp: "FORM" },
        { id: "fase", lab: "Fase", min: 0.002, max: 0.012, step: 0.001, def: 0.008, law: "das Zimmermanns-Gesetz: keine Kante bleibt scharf (2 mm die gebrochene Kante), die Fase fängt das Licht", grp: "FORM" },
        { id: "verwitterung", lab: "Verwitterung", min: 0, max: 1, step: 0.05, def: 0.5, law: "das Alter des Holzes — Sonnenbleiche oben, Erdsaum an den Füßen", grp: "MATERIAL" },
    ];
    // Die Regler der Brücke: die Bohle und das Alter — Feld-Länge, lichte Breite und Geländer-Höhe sind Norm (sie tragen den Wagen).
    var BRUECKE_PARAMS = [
        { id: "bohle", lab: "Bohle", min: 0.2, max: 0.32, step: 0.02, def: 0.26, law: "die Breite einer Bohle — schmale Bohlen tragen mehr Fugen über das Feld", grp: "FORM" },
        { id: "verwitterung", lab: "Verwitterung", min: 0, max: 1, step: 0.05, def: 0.5, law: "das Alter des Holzes — Sonnenbleiche auf den Bohlen, das Nasse an Joch und Pfahl", grp: "MATERIAL" },
    ];
    var AUS_ARTEN = { ausstattung: AUS_PARAMS, bank: BANK_PARAMS, leiter: LEITER_PARAMS, bruecke: BRUECKE_PARAMS };
    for (var _wk in WERKE)
        PRESETS[_wk] = { kind: WERKE[_wk].kind, lab: WERKE[_wk].lab, s: ausParams({ kind: WERKE[_wk].kind }, null), fx: { place: { mode: "site", siteTag: WERKE[_wk].siteTag } } };
    // ── DIE SITZBANK (Front +z: der Sitzende blickt längs +z): zwei Wangen — Vorderbein, Hinterbein, der Lehnen-Pfosten um
    //    `neigung` nach hinten, die Sitz-Zarge, nah der Fuß-Riegel —, zwei Längs-Zargen, das Sitzbrett aus `latten` Latten mit
    //    Fuge (Oberkante = die Sitzhöhe), die Lehne aus zwei Latten auf den Pfosten; nah sichert je Bein ein Holznagel (`nagel`,
    //    wie im Fachwerk des Hauses) quer durch das Bein den Zapfen der Sitz-Zarge. ──
    function ausSitzbank(g, p, seed, stufe) {
        var m = AUS_MASS.sitzbank(0, p),
            W = p.verwitterung,
            fein = stufe === 0,
            fa = fein ? 0.008 : 0,
            zH = ausZufall(seed, 0xa1),
            zNg = ausZufall(seed, 0xa2);
        var holz = function (geo, ton) {
            ausFaerbe(geo, "holz", W, function () {
                return { ton: ton };
            });
            ausTeil(g, geo, "holz");
        };
        var c = Math.cos(m.phi),
            s = Math.sin(m.phi),
            i,
            ws;
        for (ws = -1; ws <= 1; ws += 2) {
            var x = ws * m.wx;
            holz(ausSetze(ausKiste(m.b, m.hZ, m.b, fa), x, m.hZ / 2, m.zV), ausTon(zH, 0.05, 0.02));
            holz(ausSetze(ausKiste(m.b, m.hZ, m.b, fa), x, m.hZ / 2, m.zH), ausTon(zH, 0.05, 0.02));
            holz(ausStrecke(ausSetze(ausKiste(m.b, m.lP, m.b * 0.8, fa), 0, m.lP / 2, 0), [x, m.pA[0], m.pA[1]], [x, m.pB[0], m.pB[1]]), ausTon(zH, 0.05, 0.02));
            holz(ausSetze(ausKiste(m.b * 0.8, 0.08, m.zV - m.zH + m.b, fa), x, m.hZ - 0.04, (m.zV + m.zH) / 2), ausTon(zH, 0.05, 0.02));
            if (fein) holz(ausSetze(ausKiste(m.b * 0.6, 0.05, m.zV - m.zH, fa), x, 0.12, (m.zV + m.zH) / 2), ausTon(zH, 0.05, 0.02));
            if (fein) for (i = 0; i < 2; i++) ausNagel(g, [x - m.b / 2 - 0.003, m.hZ - 0.04, i ? m.zH : m.zV], [x + m.b / 2 + 0.003, m.hZ - 0.04, i ? m.zH : m.zV], W, zNg);
        }
        for (ws = -1; ws <= 1; ws += 2) holz(ausSetze(ausKiste(2 * m.wx - m.b, 0.08, 0.025, fa * 0.5), 0, m.hZ - 0.04, ws * (m.T / 2 - 0.045)), ausTon(zH, 0.05, 0.02));
        for (i = 0; i < m.n; i++) holz(ausSetze(ausKiste(m.L, m.dL, m.bL, fa * 0.6), 0, m.H - m.dL / 2, -m.T / 2 + m.bL / 2 + i * (m.bL + m.fuge)), ausTon(zH, 0.08, 0.03));
        for (i = 0; i < 2; i++) {
            var t = m.lehneT[i];
            holz(ausSetze(ausKiste(m.L - 0.04, 0.09, 0.022, fa * 0.6), 0, m.pA[0] + t * c + m.o * s, m.pA[1] - t * s + m.o * c, -m.phi, 0, 0), ausTon(zH, 0.08, 0.03));
        }
    }
    // ── DIE PODESTLEITER (Steigseite −z): die Holme vom Fuß über das Podest hinaus zum Haltebügel, die Stützschenkel vom
    //    Podest zum Boden, fünf Stufen, das Podest (nah drei Bretter auf zwei Querhölzern), nah die Spreizsicherung und zwei
    //    Querstreben der Stützseite (fern eine); nah sichert je Holm ein Holznagel quer durch den Holm den Haltebügel. ──
    function ausPodestleiter(g, p, seed, stufe) {
        var m = AUS_MASS.podestleiter(0, p),
            W = p.verwitterung,
            fein = stufe === 0,
            fa = fein ? p.fase : 0,
            zH = ausZufall(seed, 0xa5),
            zNg = ausZufall(seed, 0xa6);
        var holz = function (geo, ton) {
            ausFaerbe(geo, "holz", W, function () {
                return { ton: ton };
            });
            ausTeil(g, geo, "holz");
        };
        // ein Holz entlang a → b (Querschnitt dx × dz)
        var lang = function (a, b, dx, dz) {
            var l = Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]) + (b[2] - a[2]) * (b[2] - a[2]));
            holz(ausStrecke(ausSetze(ausKiste(dx, l, dz, fa), 0, l / 2, 0), a, b), ausTon(zH, 0.05, 0.02));
        };
        var k, ws;
        for (ws = -1; ws <= 1; ws += 2) {
            var x = ws * m.hx;
            lang([x, 0, m.zF], [x, m.yB, m.zB], m.dx, m.h);
            lang([x, m.P - m.dP, m.zP], [x, 0, m.zS], m.dx, m.h * 0.85);
            if (fein) lang([x + ws * m.dx, 0.6, m.zF + 0.6 / m.ta], [x + ws * m.dx, 0.6, m.schenkelZ(0.6)], 0.012, 0.03);
            if (fein) {
                var yN = m.yB - 0.025,
                    zN = m.zF + (yN / m.yB) * (m.zB - m.zF),
                    lH = Math.hypot(m.yB, m.zB - m.zF),
                    nY = (-(m.zB - m.zF) / lH) * (m.h / 2 + 0.003),
                    nZ = (m.yB / lH) * (m.h / 2 + 0.003);
                ausNagel(g, [x, yN - nY, zN - nZ], [x, yN + nY, zN + nZ], W, zNg);
            }
        }
        for (k = 1; k <= m.n; k++) holz(ausSetze(ausKiste(m.wI, m.dS, m.tS, fa * 0.6), 0, k * m.r - m.dS / 2, m.stufeZ(k)), ausTon(zH, 0.08, 0.03));
        if (fein) {
            var bB = (2 * m.zP - 0.024) / 3;
            for (k = 0; k < 3; k++) holz(ausSetze(ausKiste(m.wP, m.dP, bB, fa * 0.6), 0, m.P - m.dP / 2, -m.zP + bB / 2 + k * (bB + 0.012)), ausTon(zH, 0.08, 0.03));
            for (ws = -1; ws <= 1; ws += 2) holz(ausSetze(ausKiste(m.wI, 0.06, 0.04, fa), 0, m.P - m.dP - 0.03, ws * (m.zP - 0.03)), ausTon(zH, 0.05, 0.02));
        } else holz(ausSetze(ausKiste(m.wP, m.dP, 2 * m.zP, 0), 0, m.P - m.dP / 2, 0), ausTon(zH, 0.08, 0.03));
        holz(ausSetze(ausKiste(2 * m.hx + m.dx, 0.05, 0.05, fa), 0, m.yB - 0.025, m.zB), ausTon(zH, 0.05, 0.02));
        for (k = 0; k < (fein ? 2 : 1); k++) holz(ausSetze(ausKiste(2 * m.hx - m.dx, 0.06, 0.025, fa * 0.5), 0, 0.5 + 0.55 * k, m.schenkelZ(0.5 + 0.55 * k) + 0.03), ausTon(zH, 0.05, 0.02));
    }

    // ── DAS JOCHFELD (längs +x, die Oberkante der Bohlen auf y = 0, quer z): die Bohlen quer zur Bahn mit Fuge, vier Längsträger
    //    darunter, am Anfang des Felds das Joch — der Holm quer unter den Trägern, drei Pfähle bis `pfahlM` unter die Bahn, nah das
    //    Andreaskreuz zwischen ihnen —, das Geländer je Seite (zwei Pfosten je Feld, der Handlauf durchgehend, nah die Knieleiste und
    //    der Radabweiser an der Bahnkante, die Pfosten mit Holznägeln am Handlauf). Die L1 ohne Fase: die Bahn EINE Platte, zwei
    //    Träger, das Joch ohne Kreuz, das Geländer ohne Leisten; Pfähle als Vierkant. ──
    function ausJochfeld(g, p, seed, stufe) {
        var m = AUS_MASS.jochfeld(0, p),
            W = p.verwitterung,
            fein = stufe === 0,
            fa = fein ? 0.008 : 0,
            zB = ausZufall(seed, 0xb1),
            zT = ausZufall(seed, 0xb2),
            zNg = ausZufall(seed, 0xb3);
        var holz = function (geo, ton) {
            ausFaerbe(geo, "holz", W, function () {
                return { ton: ton };
            });
            ausTeil(g, geo, "holz");
        };
        // das Nasse an Joch und Pfahl: dunkler und kühler, je tiefer (die Bahn bleicht, der Pfahl steht im Wasser)
        var nass = function (geo, ton) {
            ausFaerbe(geo, "holz", W, function (_x, y) {
                var t = Math.max(0, Math.min(1, -(y - m.yJ) / 1.2)) * (0.25 + 0.35 * W);
                return { ton: [ton[0] * (1 - t * 0.55), ton[1] * (1 - t * 0.5), ton[2] * (1 - t * 0.42)] };
            });
            ausTeil(g, geo, "holz");
        };
        var i, s;
        // die Bahn: nah die Bohlen mit Fuge (die Fugen gleich verteilt über das Feld), fern EINE Platte
        if (fein) {
            var n = Math.max(1, Math.floor((m.L + m.fuge) / (p.bohle + m.fuge))),
                w = (m.L - (n - 1) * m.fuge) / n;
            for (i = 0; i < n; i++) holz(ausSetze(ausKiste(w, m.d, m.Bd, fa * 0.6), -m.L / 2 + w / 2 + i * (w + m.fuge), -m.d / 2, 0), ausTon(zB, 0.08, 0.03));
        } else holz(ausSetze(ausKiste(m.L, m.d, m.Bd, 0), 0, -m.d / 2, 0), ausTon(zB, 0.08, 0.03));
        // die Längsträger (nah vier, fern die beiden äußeren)
        for (i = 0; i < m.zT.length; i++) {
            if (!fein && i % 3 !== 0) continue;
            holz(ausSetze(ausKiste(m.L, m.tH, m.tB, fa), 0, -m.d - m.tH / 2, m.zT[i]), ausTon(zT, 0.05, 0.02));
        }
        // das Joch: der Holm quer unter den Trägern, die Pfähle (nah acht Seiten, fern vier), nah das Andreaskreuz
        nass(ausSetze(ausKiste(m.hB, m.hH, m.Bd + 0.2, fa), m.xJ, m.yJ + m.hH / 2, 0), ausTon(zT, 0.05, 0.02));
        for (i = 0; i < m.zP.length; i++) nass(ausSetze(ausDreh([[m.pr, m.yP], [m.pr, m.yJ]], fein ? 8 : 4, false, false), m.xJ, 0, m.zP[i]), ausTon(zT, 0.05, 0.02));
        if (fein)
            for (i = 0; i + 1 < m.zP.length; i++)
                for (s = 0; s < 2; s++) {
                    var za = m.zP[i + s],
                        zb = m.zP[i + 1 - s],
                        lK = Math.hypot(m.yJ - 0.15 - m.yK, zb - za);
                    nass(ausStrecke(ausSetze(ausKiste(0.1, lK, 0.1, fa), 0, lK / 2, 0), [m.xJ, m.yJ - 0.15, za], [m.xJ, m.yK, zb]), ausTon(zT, 0.05, 0.02));
                }
        // das Geländer je Seite: zwei Pfosten (über dem Joch und in der Mitte des Felds), der Handlauf durch das ganze Feld; nah
        // die Knieleiste, der Radabweiser an der Bahnkante und je Pfosten ein Holznagel quer durch den Handlauf
        for (s = -1; s <= 1; s += 2) {
            var z = s * m.zG;
            var hP = m.gH - m.hlH - m.yG;
            for (i = 0; i < m.xG.length; i++) holz(ausSetze(ausKiste(m.gB, hP, m.gB, fa), m.xG[i], m.yG + hP / 2, z), ausTon(zT, 0.05, 0.02));
            holz(ausSetze(ausKiste(m.L, m.hlH, m.hlB, fa), 0, m.gH - m.hlH / 2, z), ausTon(zT, 0.06, 0.02));
            if (fein) {
                holz(ausSetze(ausKiste(m.L, 0.08, 0.05, fa * 0.6), 0, m.gH / 2, z - s * (m.gB / 2 + 0.025)), ausTon(zT, 0.06, 0.02));
                holz(ausSetze(ausKiste(m.L, m.rH, m.rB, fa), 0, m.rH / 2, s * (m.B / 2 + m.rB / 2)), ausTon(zT, 0.05, 0.02));
                for (i = 0; i < m.xG.length; i++) ausNagel(g, [m.xG[i], m.gH - m.hlH / 2, z - m.hlB / 2 - 0.003], [m.xG[i], m.gH - m.hlH / 2, z + m.hlB / 2 + 0.003], W, zNg);
            }
        }
    }

    // DER HOLZNAGEL (die Rolle `nagel` des Fachwerks, 14 mm vierkant über Eck): quer durch das Holz von a nach b, 3 mm über
    //    beide Flächen — er sichert den Zapfen; seine Seh-Klasse ist die des Holzes, die Faltung trägt ihn in dessen Draw.
    function ausNagel(g, a, b, W, z) {
        var l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]),
            geo = ausStrecke(ausSetze(ausKiste(0.014, l, 0.014, 0), 0, l / 2, 0, 0, Math.PI / 4, 0), a, b);
        ausFaerbe(geo, "nagel", W, function () {
            return { ton: ausTon(z, 0.06, 0.02) };
        });
        ausTeil(g, geo, "nagel");
    }
    var AUS_BAU = { feuerstelle: ausFeuerstelle, marktstand: ausMarktstand, brunnen: ausBrunnen, laterne: ausLaterne, wandlaterne: ausWandlaterne, sitzbank: ausSitzbank, podestleiter: ausPodestleiter, jochfeld: ausJochfeld };
    // DIE STUFE 3 DER AUSSTATTUNG (nurWurf, S3): die Grundform als EIN Gitter in EINEM Stoff (Rolle stein) — sie wirft für
    // die L1 (die L0 wirft selbst: nah, höchstens drei im Bild); ihre Hülle (`ausHuelle`) reist als Beipack `__fern`.
    // Dieselben Maße wie die Stufen 0/1 (Ring R + Steinbreite, Tisch und Plane, Kranz, Pfosten, First): Feuerstelle der
    // Steinring als Achteck-Stumpf mit der Scheit-Spitze (24 Dreiecke) · Marktstand Tisch und Plane (24) · Brunnen Kranz,
    // zwei Pfosten und Satteldach (44). Vorher warf jede L1 sich selbst (die Feuerstelle 440 Dreiecke je Kaskade).
    var AUS_MASS = {
        feuerstelle: function (G) {
            // der Ring: Steine auf 0,58 (Breite ~0,2, Kuppe 0,10–0,15) — das Achteck flächengleich zum Kreis 0,66 (Umkreis
            // 0,69), oben 0,58 auf 0,13; die Scheite in der Mitte bis 0,14 (die Flamme wirft nie, die Glut liegt im Boden)
            return { ra: 0.69 * G, rt: 0.58 * G, hR: 0.13 * G, hS: 0.14 * G };
        },
        marktstand: function (G) {
            var bx = 1.0 * G,
                bz = 0.45,
                yV = 2.25 + 0.03,
                yH = 1.95 + 0.03;
            var yAt = function (zz) {
                return yV + ((zz + bz) / (2 * bz)) * (yH - yV);
            };
            var zV = -bz - 0.28,
                zH = bz + 0.22;
            return { bx: bx, bz: bz, hT: 0.86, hx: bx + 0.2, zV: zV, zH: zH, yV: yAt(zV) + 0.06, yH: yAt(zH) + 0.06, px: bx - 0.05, pz: bz - 0.03, pV: 2.25, pH: 1.95 };
        },
        brunnen: function (G) {
            var ra = 0.92 * G,
                px = ra + 0.13;
            return { ra: ra, rk: ra + 0.08, hK: 0.66 + 0.07, px: px, yF: 2.62, yT: 2.16, hz: 0.86, lx: 2 * px + 0.5, wx: px + 0.17, yW: 1.5 };
        },
        laterne: function (G) {
            // der Licht-Mittelpunkt (LICHT_GESETZ.laterne hoeheM) ist die Mitte des Glas-Kopfs
            var kh = 0.4 * G,
                yL = LICHT_GESETZ.laterne.hoeheM * G;
            return { fr: 0.15 * G, fh: 0.55 * G, mr: 0.045 * G, kb: 0.26 * G, kh: kh, yL: yL, yK0: yL - kh / 2, yK1: yL + kh / 2, hb: 0.2 * G, yT: yL + kh / 2 + 0.2 * G };
        },
        wandlaterne: function (G) {
            // der Kopf der Laterne in 0,85 ihrer Maße um die Licht-Höhe LICHT_GESETZ.wandlaterne `hoeheM`; die Wand in `armM`
            // (das Gesetz des Plans, nie skaliert), der Arm 6 cm über dem Knauf, die Platte 0,34 m hoch, die Strebe unter dem Arm
            var L = LICHT_GESETZ.wandlaterne,
                kh = 0.34 * G,
                yL = L.hoeheM * G,
                yT = yL + kh / 2 + 0.17 * G,
                yA = yT + 0.06,
                a = L.armM,
                pl = 0.34,
                sA = [a - 0.03, yA - pl + 0.1, 0],
                sB = [a * 0.35, yA, 0];
            return { kb: 0.22 * G, kh: kh, yL: yL, yK0: yL - kh / 2, yK1: yL + kh / 2, hb: 0.17 * G, yT: yT, yA: yA, a: a, pl: pl, sA: sA, sB: sB, st: Math.hypot(sB[0] - sA[0], sB[1] - sA[1]) };
        },
        // DIE SITZBANK: Sitzhöhe 0,45 m, Tiefe 0,42 m, Länge 1,6 m (drei Plätze zu 0,53 m) — die Norm des Sitzens (DIN EN 581-2:
        // 0,40–0,48 m); die Wangen 0,12 m eingerückt, die Lehnen-Pfosten (0,5 m) stehen über den Hinterbeinen, die zwei
        // Lehnen-Latten 0,24 und 0,44 m den Pfosten hinauf auf seiner Front (Normale (0, sin, cos)).
        sitzbank: function (_G, p) {
            var H = 0.45,
                T = 0.42,
                dL = 0.035,
                fuge = 0.012,
                n = Math.round(p.latten),
                b = 0.065,
                lP = 0.5,
                phi = (p.neigung * Math.PI) / 180,
                hZ = H - dL,
                zH = -T / 2 + 0.05;
            var pA = [hZ - 0.02, zH];
            return { H: H, T: T, L: 1.6, dL: dL, fuge: fuge, n: n, bL: (T - (n - 1) * fuge) / n, b: b, hZ: hZ, wx: 0.68, zV: T / 2 - 0.05, zH: zH, phi: phi, lP: lP, pA: pA, pB: [pA[0] + lP * Math.cos(phi), pA[1] - lP * Math.sin(phi)], lehneT: [0.24, 0.44], o: b * 0.4 + 0.011 };
        },
        // DIE PODESTLEITER (DIN EN 131): Steigmaß 0,28 m, fünf Stufen (0,16 m tief) und das Podest auf 1,68 m (0,4 m tief), die
        // Steigseite 60° gegen den Boden, die Stützseite 75°, 0,5 m lichte Weite; die Holme laufen durch die Vorderkante des
        // Podests bis 0,6 m darüber und tragen dort den Haltebügel.
        podestleiter: function (_G, p) {
            var r = 0.28,
                n = 5,
                P = (n + 1) * r,
                ta = Math.tan(Math.PI / 3),
                tb = Math.tan((75 * Math.PI) / 180),
                zP = 0.2,
                dP = 0.045,
                wI = 0.5,
                dx = 0.035,
                zF = -zP - P / ta;
            return {
                r: r, n: n, P: P, ta: ta, zP: zP, dP: dP, wI: wI, wP: wI + 2 * dx, dx: dx, hx: wI / 2 + dx / 2, h: p.holm, tS: 0.16, dS: 0.04, zF: zF,
                yB: P + 0.6, zB: -zP + 0.6 / ta, zS: zP + (P - dP) / tb,
                stufeZ: function (k) {
                    return zF + (k * r) / ta + 0.06;
                },
                schenkelZ: function (y) {
                    return zP + (P - dP - y) / tb;
                },
            };
        },
        // DAS JOCHFELD (BRUECKE_GESETZ): das Feld L zwischen zwei Jochen, die lichte Breite B zwischen den Radabweisern, das
        // Geländer gH über der Bahn (DIN EN 1317 der Feldweg-Brücke: 1,0–1,1 m); die Bohle 7 cm, die Träger 0,2 × 0,3 m im Abstand
        // 1,1 m, der Holm 0,3 × 0,3 m quer unter ihnen 0,2 m hinter dem Anfang des Felds, drei Pfähle Ø 0,28 m bis `pfahlM` unter
        // die Bahn, das Kreuz zwischen ihnen bis 2 m unter den Holm; die Pfosten 0,14 m im Viertel des Felds, der Handlauf
        // 0,14 × 0,1 m, der Radabweiser 0,12 × 0,12 m an der Kante der lichten Breite.
        jochfeld: function (_G, p) {
            var BG = BRUECKE_GESETZ,
                L = BG.feldM,
                B = BG.lichtM,
                d = 0.07,
                tH = 0.3,
                hH = 0.3,
                gB = 0.14,
                zG = B / 2 + 0.12 + gB / 2,
                yJ = -d - tH - hH;
            return {
                L: L, B: B, d: d, Bd: 2 * zG + gB + 0.1, fuge: 0.015, bohle: p.bohle, tH: tH, tB: 0.2, zT: [-1.65, -0.55, 0.55, 1.65],
                hB: 0.3, hH: hH, xJ: -L / 2 + 0.2, yJ: yJ, zP: [-1.75, 0, 1.75], pr: 0.14, yP: -BG.pfahlM, yK: yJ - 2,
                zG: zG, xG: [-L / 2 + 0.2, 0.2], gB: gB, gH: BG.gelaenderM, yG: -d - 0.15, hlH: 0.1, hlB: 0.14, rH: 0.12, rB: 0.12,
            };
        },
    };
    // ── B7: DIE WIRTS-ZEILEN DER WERKE (docs/studio-vertrag.md B7) — je Art der Bauplan-Namensraum (`bank_`, `leiter_`) und die
    //    unsichtbare Substanz in der Teile-Form des Wirts, aus DERSELBEN Maß-Funktion wie die Gestalt (die Regler auf ihrem Grund):
    //    an ihr urteilt der Wirt Kollision, Kosten und Verb. Die Bank: das Sitzbrett (die oberste flache Fläche — dort sitzt der
    //    Leib), vier Beine, die Lehne im Winkel der Pfosten. Die Leiter: fünf Stufen, das Podest, die Stützschenkel, der
    //    Haltebügel — die Holme nicht (die Kapsel des Leibs ist breiter als die lichte Weite; sie stiege nie zwischen ihnen). ──
    function werkSubstanz(id) {
        var m = AUS_MASS[id](0, ausParams(PRESETS[id], null)),
            parts = [],
            a,
            k;
        var r = function (v) {
            return Math.round(v * 1000) / 1000;
        };
        var teil = function (x, y, z, sx, sy, sz, rx) {
            var t = { shape: "box", material: "holz", position: { x: r(x), y: r(y), z: r(z) }, size: { x: r(sx), y: r(sy), z: r(sz) } };
            if (rx) t.rotation = { x: r(rx), y: 0, z: 0 };
            return t;
        };
        if (id === "sitzbank") {
            var tm = (m.lehneT[0] + m.lehneT[1]) / 2,
                c = Math.cos(m.phi),
                s = Math.sin(m.phi);
            parts.push(teil(0, m.H - m.dL / 2, 0, m.L, m.dL, m.T));
            for (a = -1; a <= 1; a += 2) for (k = -1; k <= 1; k += 2) parts.push(teil(a * m.wx, m.hZ / 2, k < 0 ? m.zH : m.zV, m.b, m.hZ, m.b));
            parts.push(teil(0, m.pA[0] + tm * c + m.o * s, m.pA[1] - tm * s + m.o * c, m.L - 0.04, m.lehneT[1] - m.lehneT[0] + 0.09, 0.03, -m.phi));
        } else if (id === "jochfeld") {
            // DIE BRÜCKE: die Bahn samt Trägern ist TRITTFLÄCHE (`tritt`: Rad und Fuß stehen auf ihrer Oberkante, kein Gehender
            // stößt an sie), das Geländer je Seite vom Radabweiser bis zum Handlauf ist Wand, das Joch steht als Holm und Pfähle
            // unter ihr; sie staut kein Wasser (`durchlass` der Zeile unten)
            var yT = -m.d - m.tH;
            var bahn = teil(0, yT / 2, 0, m.L, -yT, m.Bd);
            bahn.tritt = true;
            parts.push(bahn);
            for (a = -1; a <= 1; a += 2) parts.push(teil(0, (m.gH + yT) / 2, a * (m.B / 2 + (m.rB + m.gB) / 2), m.L, m.gH - yT, m.rB + m.gB));
            parts.push(teil(m.xJ, m.yJ + m.hH / 2, 0, m.hB, m.hH, m.Bd + 0.2));
            for (k = 0; k < m.zP.length; k++) parts.push(teil(m.xJ, (m.yP + m.yJ) / 2, m.zP[k], 2 * m.pr, m.yJ - m.yP, 2 * m.pr));
        } else {
            var lS = Math.sqrt((m.zS - m.zP) * (m.zS - m.zP) + (m.P - m.dP) * (m.P - m.dP));
            for (k = 1; k <= m.n; k++) parts.push(teil(0, k * m.r - m.dS / 2, m.stufeZ(k), m.wI, m.dS, m.tS));
            parts.push(teil(0, m.P - m.dP / 2, 0, m.wP, m.dP, 2 * m.zP));
            for (a = -1; a <= 1; a += 2) parts.push(teil(a * m.hx, (m.P - m.dP) / 2, (m.zP + m.zS) / 2, m.dx, lS, m.h * 0.85, -Math.atan2(m.zS - m.zP, m.P - m.dP)));
            parts.push(teil(0, m.yB - 0.025, m.zB, 2 * m.hx + m.dx, 0.05, 0.05));
        }
        return id === "jochfeld" ? { label: WERKE[id].art, durchlass: true, parts: parts } : { label: WERKE[id].art, parts: parts };
    }
    var KIND_POLICY = {};
    for (var _wp in WERKE) KIND_POLICY[WERKE[_wp].kind] = { prefix: WERKE[_wp].kind + "_", substanz: werkSubstanz(_wp) };
    // Die Wahl einer Gestalt, die nur der Bau kennt (der Strom zieht sie zwischen den Waren): der Marktstand nennt sein Fass
    // (`userData.fass` = [x, z] oder fehlt) — die Stufe 3 liest sie aus der L1 derselben Gestalt (dieselbe Funktion,
    // derselbe Strom), nie aus einem zweiten Würfel.
    function ausWahl(rezeptId, p, sd, kol) {
        if (rezeptId !== "marktstand") return {};
        var tmp = new THREE.Group();
        AUS_BAU[rezeptId](tmp, p, sd, 1, kol);
        var w = { fass: tmp.userData.fass || null };
        tmp.traverse(function (o) {
            if (o.geometry) o.geometry.dispose();
        });
        return w;
    }
    function ausWurf(rezeptId, g, p, wahl) {
        var m = AUS_MASS[rezeptId](p.groesse, p);
        var teil = function (geo) {
            ausFaerbe(geo, "stein", 0, null);
            ausTeil(g, geo, "stein");
        };
        // Der Schatten-Stoff ist beidseitig (der Wirt rendert ihn in die Kaskaden von beiden Seiten): eine Fläche wirft, wie
        // sie steht — der Tisch, die Ablage, die Plane, der Volant, das Dach je EIN Viereck (2 Dreiecke), ein Pfosten als
        // Kreuz zweier senkrechter Flächen (4 Dreiecke: sein Strich aus jeder Richtung).
        var flaeche = function (polys) {
            teil(ausVielecke(polys, [0, -50, 0]));
        };
        var pfosten = function (x, z, y0, y1, b) {
            flaeche([[[x - b, y0, z], [x + b, y0, z], [x + b, y1, z], [x - b, y1, z]], [[x, y0, z - b], [x, y0, z + b], [x, y1, z + b], [x, y1, z - b]]]);
        };
        var platte = function (x0, x1, y, z0, z1) {
            flaeche([[[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]]);
        };
        if (rezeptId === "feuerstelle") {
            teil(ausDreh([[m.ra, -0.05], [m.rt, m.hR], [0, m.hS]], 8, false, false));
        } else if (rezeptId === "marktstand") {
            platte(-m.bx - 0.06, m.bx + 0.06, m.hT, -m.bz - 0.03, m.bz + 0.03); // der Tisch
            // die Zargen vorn und hinten (bis 0,135 unter die Platte) und die Waren-Reihe (Körbe auf 0,17 m, z ≈ −0,08)
            for (var zs = -1; zs <= 1; zs += 2)
                flaeche([[[-m.bx + 0.07, m.hT - 0.135, zs * (m.bz - 0.07)], [m.bx - 0.07, m.hT - 0.135, zs * (m.bz - 0.07)], [m.bx - 0.07, m.hT, zs * (m.bz - 0.07)], [-m.bx + 0.07, m.hT, zs * (m.bz - 0.07)]]]);
            flaeche([[[-0.72 * m.bx, m.hT, -0.08], [0.72 * m.bx, m.hT, -0.08], [0.72 * m.bx, m.hT + 0.17, -0.08], [-0.72 * m.bx, m.hT + 0.17, -0.08]]]);
            platte(-m.bx + 0.03, m.bx - 0.03, 0.29, -0.405, 0.405); // die Ablage
            // die Plane (die Ebene der Bahnen, 6 cm über den Sparren) und der Volant an ihrer Vorderkante
            flaeche([[[-m.hx, m.yV, m.zV], [m.hx, m.yV, m.zV], [m.hx, m.yH, m.zH], [-m.hx, m.yH, m.zH]]]);
            flaeche([[[-m.hx, m.yV, m.zV], [m.hx, m.yV, m.zV], [m.hx, m.yV - 0.14, m.zV], [-m.hx, m.yV - 0.14, m.zV]]]);
            for (var sx = -1; sx <= 1; sx += 2) for (var sz = -1; sz <= 1; sz += 2) pfosten(sx * m.px, sz * m.pz, 0, sz < 0 ? m.pV : m.pH, 0.045);
            // das Fass (wo die Gestalt es trägt): drei Flächen im Stern durch die Achse und der Deckel als Sechseck
            if (wahl && wahl.fass) {
                var fx = wahl.fass[0],
                    fz = wahl.fass[1],
                    fr = 0.235,
                    fh = 0.6,
                    stern = [],
                    deckel = [];
                for (var k = 0; k < 3; k++) {
                    var w = (k * Math.PI) / 3,
                        cx = Math.cos(w) * fr,
                        cz = Math.sin(w) * fr;
                    stern.push([[fx - cx, 0, fz - cz], [fx + cx, 0, fz + cz], [fx + cx, fh, fz + cz], [fx - cx, fh, fz - cz]]);
                }
                for (k = 0; k < 6; k++) deckel.push([fx + Math.cos((k * Math.PI) / 3) * fr, fh, fz + Math.sin((k * Math.PI) / 3) * fr]);
                flaeche(stern.concat([deckel]));
            }
        } else if (rezeptId === "laterne" || rezeptId === "wandlaterne") {
            // Was die L0 wirft, wirft die Stufe 3: das Glas wirft nicht (Glut), also der Kopf als sein Eisen — der Boden
            // als Platte, die vier Eck-Stäbe, darüber die Pyramide der Haube; Fuß und Mast als Vierkant nach dem Profil der
            // L1. Die Vierkante achsparallel wie der Kopf (je Halbweite b der Radius b·√2, um 45° gedreht), 46 Dreiecke.
            // Gekreuzte Flächen warfen den Kopf als Stern und die Haube als Strich (Wurf-IoU 0,587).
            var q = Math.SQRT2,
                kb = m.kb / 2 + 0.02,
                vier = function (profil) {
                    var geo = ausDreh(profil, 4, false, false);
                    geo.rotateY(Math.PI / 4);
                    teil(geo);
                };
            if (rezeptId === "laterne") vier([[0.84 * m.fr * q, -0.05], [0.84 * 0.62 * m.fr * q, m.fh], [0.84 * m.mr * q, m.fh + 0.22], [0.84 * m.mr * q, m.yK0]]);
            else {
                // die Wandlaterne (K66-2), gemessen an ihrer L0 (gate:haus-fern W, drei Sonnen): die Platte als Fläche in der Wand,
                // Arm und Strebe je als Kreuz zweier Flächen; der Kopf trägt statt der Eck-Kreuze je eine Diagonal-Fläche (Stab und
                // Glas-Kante, 9 cm), über der Haube die Seiten des Kranzes und den Knauf, der den Haken deckt — 44 Dreiecke
                var yP0 = m.yA - m.pl + 0.06,
                    yP1 = m.yA + 0.06,
                    xP = m.a - 0.015,
                    b = 0.0175,
                    sA = m.sA,
                    sB = m.sB,
                    sx = ((sB[1] - sA[1]) / m.st) * 0.011,
                    sy = (-(sB[0] - sA[0]) / m.st) * 0.011;
                flaeche([[[xP, yP0, -0.07], [xP, yP0, 0.07], [xP, yP1, 0.07], [xP, yP1, -0.07]]]);
                flaeche([[[0, m.yA - b, 0], [m.a, m.yA - b, 0], [m.a, m.yA + b, 0], [0, m.yA + b, 0]], [[0, m.yA, -b], [m.a, m.yA, -b], [m.a, m.yA, b], [0, m.yA, b]]]);
                flaeche([[[sA[0] - sx, sA[1] - sy, 0], [sB[0] - sx, sB[1] - sy, 0], [sB[0] + sx, sB[1] + sy, 0], [sA[0] + sx, sA[1] + sy, 0]], [[sA[0], sA[1], -0.011], [sB[0], sB[1], -0.011], [sB[0], sB[1], 0.011], [sA[0], sA[1], 0.011]]]);
            }
            platte(-kb, kb, m.yK0, -kb, kb);
            for (var ex = -1; ex <= 1; ex += 2)
                for (var ez = -1; ez <= 1; ez += 2) {
                    var px = (ex * m.kb) / 2,
                        pz = (ez * m.kb) / 2,
                        pd = 0.045;
                    if (rezeptId === "laterne") pfosten(px, pz, m.yK0, m.yK1, 0.011);
                    else flaeche([[[px - pd * ez, m.yK0, pz + pd * ex], [px + pd * ez, m.yK0, pz - pd * ex], [px + pd * ez, m.yK1, pz - pd * ex], [px - pd * ez, m.yK1, pz + pd * ex]]]);
                }
            vier([[m.hb * q, m.yK1], [0, m.yT]]);
            if (rezeptId === "wandlaterne") {
                var h = m.hb,
                    k0 = m.yK1,
                    k1 = m.yK1 + 0.025;
                flaeche([[[-h, k0, -h], [h, k0, -h], [h, k1, -h], [-h, k1, -h]], [[-h, k0, h], [h, k0, h], [h, k1, h], [-h, k1, h]], [[-h, k0, -h], [-h, k0, h], [-h, k1, h], [-h, k1, -h]], [[h, k0, -h], [h, k0, h], [h, k1, h], [h, k1, -h]]]);
                teil(ausSetze(ausKiste(0.035, 0.055, 0.035, 0), 0, m.yT + 0.0275, 0));
            }
        } else if (rezeptId === "jochfeld") {
            // DIE BRÜCKE (18 Dreiecke): die Bahn als Platte auf der Oberkante der Bohlen, je Seite das Geländer als EINE Fläche vom
            // Radabweiser bis zum Handlauf, die drei Pfähle des Jochs als Kreuze vom Holm bis an ihren Fuß
            platte(-m.L / 2, m.L / 2, 0, -m.Bd / 2, m.Bd / 2);
            for (var gs = -1; gs <= 1; gs += 2)
                flaeche([[[-m.L / 2, 0, gs * m.zG], [m.L / 2, 0, gs * m.zG], [m.L / 2, m.gH, gs * m.zG], [-m.L / 2, m.gH, gs * m.zG]]]);
            for (var pk = 0; pk < m.zP.length; pk++) pfosten(m.xJ, m.zP[pk], m.yP, m.yJ, m.pr);
        } else if (rezeptId === "sitzbank") {
            // DIE BANK (20 Dreiecke): das Sitzbrett, die Lehne als EIN Viereck im Winkel der Pfosten, die vier Beine als Kreuze
            var c = Math.cos(m.phi),
                s = Math.sin(m.phi),
                xl = m.L / 2 - 0.02,
                l0 = [m.pA[0] + 0.18 * c + m.o * s, m.pA[1] - 0.18 * s + m.o * c],
                l1 = [m.pA[0] + 0.49 * c + m.o * s, m.pA[1] - 0.49 * s + m.o * c];
            platte(-m.L / 2, m.L / 2, m.H, -m.T / 2, m.T / 2);
            flaeche([[[-xl, l0[0], l0[1]], [xl, l0[0], l0[1]], [xl, l1[0], l1[1]], [-xl, l1[0], l1[1]]]]);
            for (var bw = -1; bw <= 1; bw += 2) for (var bt = -1; bt <= 1; bt += 2) pfosten(bw * m.wx, bt < 0 ? m.zH : m.zV, 0, m.hZ, m.b / 2);
        } else if (rezeptId === "podestleiter") {
            // DIE LEITER (30 Dreiecke): fünf Stufen und das Podest je als Platte, Holme und Stützschenkel je als Kreuz zweier
            // Flächen längs ihrer Achse, der Bügel als Fläche
            var strebe = function (x, a, b, d) {
                flaeche([[[x - d, a[0], a[1]], [x + d, a[0], a[1]], [x + d, b[0], b[1]], [x - d, b[0], b[1]]], [[x, a[0], a[1] - d], [x, a[0], a[1] + d], [x, b[0], b[1] + d], [x, b[0], b[1] - d]]]);
            };
            for (var ks = 1; ks <= m.n; ks++) platte(-m.wI / 2, m.wI / 2, ks * m.r, m.stufeZ(ks) - m.tS / 2, m.stufeZ(ks) + m.tS / 2);
            platte(-m.wP / 2, m.wP / 2, m.P, -m.zP, m.zP);
            for (var ls = -1; ls <= 1; ls += 2) {
                strebe(ls * m.hx, [0, m.zF], [m.yB, m.zB], m.h / 2);
                strebe(ls * m.hx, [m.P - m.dP, m.zP], [0, m.zS], m.h / 2);
            }
            flaeche([[[-m.hx, m.yB - 0.05, m.zB], [m.hx, m.yB - 0.05, m.zB], [m.hx, m.yB, m.zB], [-m.hx, m.yB, m.zB]]]);
        } else {
            teil(ausDreh([[m.rk, -0.05], [m.rk, m.hK], [0, m.hK]], 8, false, false));
            for (var i = -1; i <= 1; i += 2) pfosten(i * m.px, 0, -0.05, m.yF, 0.07);
            // das Dach auf der Schindel-Lage (6 cm über den Sparren, 3 cm über die Giebel, 6 cm über die Traufe)
            var dx = m.lx / 2 + 0.03,
                dF = m.yF + 0.07,
                dT = m.yT + 0.07 - (0.06 * (m.yF - m.yT)) / m.hz,
                dz = m.hz + 0.06;
            flaeche([[[-dx, dF, 0], [dx, dF, 0], [dx, dT, -dz], [-dx, dT, -dz]], [[-dx, dF, 0], [dx, dF, 0], [dx, dT, dz], [-dx, dT, dz]]]);
            // die Haspel: die Welle durch beide Pfosten (liegend und stehend je eine Fläche)
            flaeche([[[-m.wx, m.yW, -0.07], [m.wx, m.yW, -0.07], [m.wx, m.yW, 0.07], [-m.wx, m.yW, 0.07]], [[-m.wx, m.yW - 0.11, 0], [m.wx, m.yW - 0.11, 0], [m.wx, m.yW + 0.11, 0], [-m.wx, m.yW + 0.11, 0]]]);
        }
    }
    // Die Hülle der Ausstattung in der EINEN Form (N5): dieselben Maße als Kästen und Keile, die Farben ihrer Stoffe.
    function ausHuelle(rezeptId, p, kol, wahl) {
        var m = AUS_MASS[rezeptId](p.groesse, p),
            IW = KOERPER_INNEN.wand;
        var F = function (r) {
            return _colFor(r, kol);
        };
        var teile = [];
        var dazu = function (t) {
            if (t) teile.push(t);
        };
        if (rezeptId === "feuerstelle") {
            dazu(huelleTeil("box", -m.rt, m.rt, -0.05, m.hR, -m.rt, m.rt, F("stein")));
            var rs = m.rt * 0.6;
            dazu(huelleTeil("keil", -rs, rs, m.hR, m.hS, -rs, 0, F("holz"), { first: "+z", walm: 1 }));
            dazu(huelleTeil("keil", -rs, rs, m.hR, m.hS, 0, rs, F("holz"), { first: "-z", walm: 1 }));
        } else if (rezeptId === "marktstand") {
            dazu(huelleTeil("box", -m.bx - 0.06, m.bx + 0.06, m.hT - 0.1, m.hT, -m.bz - 0.03, m.bz + 0.03, F("holz")));
            dazu(huelleTeil("box", -m.bx + 0.03, m.bx - 0.03, 0.26, 0.3, -0.405, 0.405, F("holz")));
            dazu(huelleTeil("keil", -m.hx, m.hx, m.yH - 0.04, m.yV, m.zV, m.zH, F("tuch"), { first: "-z" }));
            for (var sx = -1; sx <= 1; sx += 2)
                for (var sz = -1; sz <= 1; sz += 2) dazu(huelleTeil("box", sx * m.px - 0.045, sx * m.px + 0.045, 0, sz < 0 ? m.pV : m.pH, sz * m.pz - 0.045, sz * m.pz + 0.045, F("holz")));
            if (wahl && wahl.fass) dazu(huelleTeil("box", wahl.fass[0] - 0.21, wahl.fass[0] + 0.21, 0, 0.6, wahl.fass[1] - 0.21, wahl.fass[1] + 0.21, F("holz")));
        } else if (rezeptId === "laterne" || rezeptId === "wandlaterne") {
            if (rezeptId === "laterne") {
                var fr = m.fr * 0.8;
                dazu(huelleTeil("box", -fr, fr, -0.2, m.fh, -fr, fr, F("metall")));
                dazu(huelleTeil("box", -m.mr, m.mr, m.fh, m.yK0, -m.mr, m.mr, F("metall")));
            } else {
                dazu(huelleTeil("box", m.a - 0.03, m.a, m.yA - m.pl + 0.06, m.yA + 0.06, -0.07, 0.07, F("metall")));
                dazu(huelleTeil("box", 0, m.a, m.yA - 0.0175, m.yA + 0.0175, -0.0175, 0.0175, F("metall")));
            }
            dazu(huelleTeil("box", -m.kb / 2, m.kb / 2, m.yK0, m.yK1, -m.kb / 2, m.kb / 2, F("glas")));
            dazu(huelleTeil("keil", -m.hb, m.hb, m.yK1, m.yT, -m.hb, 0, F("metall"), { first: "+z", walm: 1 }));
            dazu(huelleTeil("keil", -m.hb, m.hb, m.yK1, m.yT, 0, m.hb, F("metall"), { first: "-z", walm: 1 }));
        } else if (rezeptId === "sitzbank") {
            dazu(huelleTeil("box", -m.L / 2, m.L / 2, 0, m.H, -m.T / 2, m.T / 2, F("holz")));
            dazu(huelleTeil("box", -m.L / 2 + 0.02, m.L / 2 - 0.02, m.H, m.pB[0], m.pB[1] - 0.04, m.zH + 0.04, F("holz")));
        } else if (rezeptId === "jochfeld") {
            // die Bahn samt Trägern, je Seite das Geländer, je Pfahl sein Stamm unter dem Holm
            dazu(huelleTeil("box", -m.L / 2, m.L / 2, -m.d - m.tH, 0, -m.Bd / 2, m.Bd / 2, F("holz")));
            for (var hs = -1; hs <= 1; hs += 2) dazu(huelleTeil("box", -m.L / 2, m.L / 2, 0, m.gH, hs * m.zG - m.gB / 2, hs * m.zG + m.gB / 2, F("holz")));
            for (var hk = 0; hk < m.zP.length; hk++) dazu(huelleTeil("box", m.xJ - m.pr, m.xJ + m.pr, m.yP, m.yJ, m.zP[hk] - m.pr, m.zP[hk] + m.pr, F("holz")));
        } else if (rezeptId === "podestleiter") {
            dazu(huelleTeil("keil", -m.hx, m.hx, 0, m.P, m.zF, -m.zP, F("holz"), { first: "+z" }));
            dazu(huelleTeil("box", -m.wP / 2, m.wP / 2, m.P - m.dP, m.P, -m.zP, m.zP, F("holz")));
            dazu(huelleTeil("keil", -m.hx, m.hx, 0, m.P - m.dP, m.zP, m.zS, F("holz"), { first: "-z" }));
        } else {
            dazu(huelleTeil("box", -m.rk + IW, m.rk - IW, -0.05, m.hK, -m.rk + IW, m.rk - IW, F("stein")));
            for (var i = -1; i <= 1; i += 2) dazu(huelleTeil("box", i * m.px - 0.07, i * m.px + 0.07, -0.3, m.yF, -0.07, 0.07, F("holz")));
            dazu(huelleTeil("keil", -m.lx / 2, m.lx / 2, m.yT, m.yF, -m.hz, 0, F("stamm"), { first: "+z" }));
            dazu(huelleTeil("keil", -m.lx / 2, m.lx / 2, m.yT, m.yF, 0, m.hz, F("stamm"), { first: "-z" }));
            dazu(huelleTeil("box", -m.wx, m.wx, m.yW - 0.11, m.yW + 0.11, -0.07, 0.07, F("holz")));
        }
        return { stufe: 3, teile: teile };
    }
    function ausHuelleFuer(rezeptId, seed, ov) {
        var pre = PRESETS[rezeptId];
        ausMaterialien();
        var p = ausParams(pre, ov || null);
        var sd = ov && typeof ov === "object" && ov.seed != null ? Number(ov.seed) : Number(seed);
        if (!isFinite(sd)) sd = 1;
        sd = (Math.round(sd) ^ (AUSSTATTUNG[rezeptId] || WERKE[rezeptId]).salz) >>> 0;
        var kol = ausFarben(rezeptId, sd);
        return ausHuelle(rezeptId, p, kol, ausWahl(rezeptId, p, sd, kol));
    }
    // Die Palette der Gestalt: verwittertes Holz, Feldstein, Plane — gewürfelt aus dem Samen (eigener Strom), die
    // Plane in den Färber-Farben des Markts (Krapp · Ocker · Salbei · Waid · Malve) und Naturleinen. Jedes Hex ist eine
    // sRGB-ABSICHT (das FARB-GESETZ, `_colFor` legt es linear in den Vertex); NACH Kontakt-AO und Erdsaum liegt jede
    // Gestalt × Seh-Klasse im Band der Natur 0,08–0,45, die Glut ≤ 0,30 (gate:fachwerk-contract, die Albedo-Linse misst
    // je Gestalt × Seh-Klasse den Höchstwert über die Fälle, nicht je Rolle).
    var AUS_PLANE = [0xa8483a, 0xb08a3e, 0x5e7d4c, 0x3f5f86, 0x7a5f8a];
    var AUS_NATURTUCH = 0xb8ae96;
    function ausFarben(rezeptId, seed) {
        var z = ausZufall(seed, 0x81);
        var pick = function (a) {
            return a[Math.floor(z() * a.length) % a.length];
        };
        if (rezeptId === "feuerstelle") return { stein: pick([0x9a958a, 0x928d83, 0xa19a8f]), holz: pick([0x8a745c, 0x84705a]), lehm: 0xb4afa6 };
        if (rezeptId === "marktstand") return { holz: pick([0x8e7860, 0x977f66, 0x84705c]), tuch: pick(AUS_PLANE), lattung: 0x9a8358, stroh: 0xb39b68 };
        if (rezeptId === "laterne" || rezeptId === "wandlaterne") return { metall: pick([0x6b706a, 0x6e6b66]) }; // gestrichenes Guss-Eisen, das Glas des Fensters
        if (WERKE[rezeptId]) return { holz: pick([0x8e7860, 0x977f66, 0x86705a]) }; // die Werke: ungestrichenes Holz, vergraut
        return { stein: pick([0xa29b8e, 0x9a9488, 0xaaa397]), holz: pick([0x7c6650, 0x86705a]), lattung: 0x8f7a56, stamm: pick([0x847866, 0x7a6e5e]) };
    }
    // Das Raster der Bytes (plattformgleich): 2^-12, Normalen 2^-14, −0 → 0.
    function ausRaster(g) {
        g.traverse(function (o) {
            if (!o.geometry) return;
            var A = o.geometry.attributes;
            for (var name in A) {
                var q = name === "normal" ? 16384 : 4096,
                    arr = A[name].array;
                for (var i = 0; i < arr.length; i++) arr[i] = Math.round(arr[i] * q) / q + 0;
            }
        });
    }
    // B2 der Ausstattung: buildInstance(id, seed, lod, ov) → EINE Gruppe, je Rolle EIN gebakter Mesh (die Glut wirft
    // nicht), Stufe = die größte deklarierte ≤ lod (sonst die kleinste). ov.seed überstimmt das seed-Argument.
    var _ausDetail = 1; // die Teilung der Drehkörper der Ausstattung (1 = das Lab-Maß; buildAusstattung senkt sie nur über der Zeile)
    // Die Werke des Zimmermanns (Bank, Leiter) bauen hier mit ihrer Art: deren Regler, Stufen und Zeile.
    function buildAusstattung(rezeptId, seed, lod, ov) {
        var pre = PRESETS[rezeptId];
        if (!pre || !AUS_ARTEN[pre.kind] || !AUS_BAU[rezeptId]) return null;
        ausMaterialien();
        var p = ausParams(pre, ov || null);
        var sd = ov && typeof ov === "object" && ov.seed != null ? Number(ov.seed) : Number(seed);
        if (!isFinite(sd)) sd = 1;
        sd = (Math.round(sd) ^ (AUSSTATTUNG[rezeptId] || WERKE[rezeptId]).salz) >>> 0;
        var stufen = PORTAL_RENDER_CONFIG.lod.kindStages[pre.kind],
            L = lod | 0,
            stufe = stufen[0];
        for (var i = 0; i < stufen.length; i++) if (stufen[i] <= L) stufe = stufen[i];
        var kol = ausFarben(rezeptId, sd);
        var wahl = stufe === 3 ? ausWahl(rezeptId, p, sd, kol) : null;
        // DIE STUFE TRÄGT IHRE ZEILE (pipeline.K3, B2c — auch am Rand jedes Reglers): die Fülle legt Steine und Scheite
        // zu, die Zeile der Stufe wächst nicht; trägt der Bau mehr Dreiecke, fällt die Teilung jedes Drehkörpers um das
        // Verhältnis und der Bau steht neu (höchstens vier Mal) — ein Bau auf seiner Zeile bleibt byte-gleich.
        var zeile = (PORTAL_RENDER_CONFIG.lod.budget[pre.kind][stufe] || {}).tris;
        try {
            for (var versuch = 0; ; versuch++) {
                var roh = new THREE.Group();
                if (stufe === 3) ausWurf(rezeptId, roh, p, wahl);
                else AUS_BAU[rezeptId](roh, p, sd, stufe, kol);
                roh.updateMatrixWorld(true);
                var geoms = {};
                bakeLOD(roh, kol, geoms, 0, true);
                var g = geomsZuGruppe(geoms);
                var n = 0;
                g.traverse(function (o) {
                    if (o.isMesh) n += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3;
                });
                if (!(n > zeile) || stufe === 3 || versuch === 4) break;
                g.traverse(function (o) {
                    if (o.geometry) o.geometry.dispose();
                });
                _ausDetail *= Math.min(0.97, zeile / n);
            }
        } finally {
            _ausDetail = 1;
        }
        g.traverse(function (o) {
            if (o.isMesh && o.material && o.material.emissive && o.material.emissive.getHex() !== 0) o.castShadow = false;
        });
        ausRaster(g);
        g.userData = { kind: pre.kind, rezeptId: rezeptId, seed: seed, lod: stufe };
        if (stufe === 3) {
            g.userData.__fern = ausHuelle(rezeptId, p, kol, wahl);
            stufeWirft(g);
        }
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
    // DIE WANDLATERNE IM DORF (K66-2) — KONSUM BEIDSEITIG wie reihenSnap: buildDorf (Lab) und exportSettlement rufen sie NACH
    // dem Snap (die Wand steht, wo das Haus steht). Zwei Stände der Gestalt wandlaterne (Kopf `armM` vor der Wand des Kerns
    // W × D, nie vor der Traufe der Hülle): (1) die Tür von Gasthaus und Schmiede trägt sie 1,1 m neben der Tür (bis K66-2 ein
    // Glas-Kopf des Hofs ohne Licht); (2) jede Marke des Dorf-Lichts (jeder Meter Weg, `lay.marken`), deren nächste Laterne weiter
    // als LICHT_MARKE_M liegt — die dichte Gasse, in der kein Mast vor der Wand und neben dem Weg steht, und die Lücke zwischen
    // zwei Masten —, trägt sie an der Hauswand, die ihr am nächsten liegt (der Stand ≥ 0,6 m von der Ecke, der Kopf in keiner
    // fremden Hülle); die Marken laufen den Weg entlang, jede neue Laterne deckt die folgenden. Bis K66-2 setzte `laterneNah`
    // die Laterne einer dunklen Marke an irgendeinen freien Stand des Dorfs; bis N1 lag je 25 m eine Marke, zwischen ihnen blieb
    // die Wand der Gasse schwarz (nacht-wand 69 %). Leser von LICHT_MARKE_M: gate:settlement DORF-LICHT (das Soll je Meter).
    // dorfB: [{p, dims}] · pl: lay.pl · lay: das Layout (laternen wird ERGÄNZT). Rückgabe: die Zahl der Wandlaternen.
    var LICHT_MARKE_M = 10;
    function wandLaternen(dorfB, pl, lay) {
        var a = LICHT_GESETZ.wandlaterne.armM,
            ecke = 0.6,
            n = 0,
            H = [];
        for (var i = 0; i < dorfB.length; i++) {
            var B = dorfB[i],
                q = pl[i];
            if (!B || !q || !B.dims || !(B.dims.W > 2 * ecke) || !(B.dims.D > 2 * ecke)) continue;
            H.push({ B: B, q: q, i: i, c: Math.cos(q.phi || 0), s: Math.sin(q.phi || 0), hw: B.dims.W / 2, hd: B.dims.D / 2 });
        }
        var welt = function (h, lx, lz) {
            return { x: h.q.x + lx * h.c + lz * h.s, z: h.q.z - lx * h.s + lz * h.c };
        };
        var fremd = function (x, z, h) {
            for (var j = 0; j < pl.length; j++) {
                var o = pl[j] && pl[j].obb;
                if (!o || pl[j] === h.q || fernOBB(x, z, o, 0)) continue;
                var c = Math.cos(o.phi || 0),
                    s = Math.sin(o.phi || 0);
                if (Math.abs((x - o.cx) * c - (z - o.cz) * s) < o.ex && Math.abs((x - o.cx) * s + (z - o.cz) * c) < o.ez) return true;
            }
            return false;
        };
        // der Stand an der Wand (lx, lz) mit der Normale (nx, nz) nach außen, lokal: der Kopf armM davor, +x der Gestalt zur Wand
        var stand = function (h, lx, lz, nx, nz) {
            var k = welt(h, lx + nx * a, lz + nz * a),
                w = welt(h, lx, lz);
            return fremd(k.x, k.z, h) ? null : { x: k.x, z: k.z, th: Math.atan2(w.z - k.z, w.x - k.x), gas: true, wand: true, haus: h.i };
        };
        var setze = function (l) {
            if (!l) return false;
            lay.laternen.push(l);
            n++;
            return true;
        };
        var k, t;
        for (k = 0; k < H.length; k++) {
            var r = H[k].B.p && H[k].B.p.rolle;
            t = H[k].B.dims.tuer;
            if ((r === "gasthaus" || r === "schmiede") && t) {
                var sz = t.z > 0 ? 1 : -1;
                setze(stand(H[k], Math.max(-H[k].hw + ecke, Math.min(H[k].hw - ecke, t.x + 1.1)), sz * H[k].hd, 0, sz));
            }
        }
        var M = lay.marken || [];
        for (var mi = 0; mi < M.length; mi++) {
            var m = M[mi],
                d0 = Infinity;
            for (t = 0; t < lay.laternen.length; t++) d0 = Math.min(d0, Math.hypot(lay.laternen[t].x - m.x, lay.laternen[t].z - m.z));
            if (!(d0 > LICHT_MARKE_M)) continue;
            var kand = [];
            for (k = 0; k < H.length; k++) {
                var h = H[k],
                    dx = m.x - h.q.x,
                    dz = m.z - h.q.z,
                    px = dx * h.c - dz * h.s,
                    pz = dx * h.s + dz * h.c;
                // die Wände, vor denen die Marke liegt: der Stand ihr gegenüber, auf der Wand gehalten
                if (Math.abs(px) > h.hw) kand.push([h, (px > 0 ? 1 : -1) * h.hw, Math.max(-h.hd + ecke, Math.min(h.hd - ecke, pz)), px > 0 ? 1 : -1, 0]);
                if (Math.abs(pz) > h.hd) kand.push([h, Math.max(-h.hw + ecke, Math.min(h.hw - ecke, px)), (pz > 0 ? 1 : -1) * h.hd, 0, pz > 0 ? 1 : -1]);
            }
            var best = null,
                bestD = d0;
            for (k = 0; k < kand.length; k++) {
                var l = stand(kand[k][0], kand[k][1], kand[k][2], kand[k][3], kand[k][4]);
                var d = l ? Math.hypot(l.x - m.x, l.z - m.z) : Infinity;
                if (d < bestD) {
                    bestD = d;
                    best = l;
                }
            }
            setze(best);
        }
        return n;
    }
    // DER BRUNNEN WEICHT DEM HAUS (S4-N4) — KONSUM BEIDSEITIG wie reihenSnap: buildDorf (Lab) und exportSettlement rufen ihn NACH
    // dem Snap, VOR den Wandlaternen. Der Brunnen „je 8 Häuser" (`dorfLayout`) steht 0,6 m hinter dem Wegrand vor dem Haus, nach
    // dem er gezogen wurde — geprüft gegen kein Haus, das später kam, und gegen keinen Gang: am Start-Dorf stand er vor der Tür
    // des Alpenchalets (die Welt warf das Haus, 17/18, oder ihn, 0/1). Seine Trittfläche (`AUSSTATTUNG.brunnen.tritt.r`) liegt in
    // keinem Grundriss und auf keinem Gang eines Hauses (Türbreite samt Saum vom Eingang bis an den Weg, `vorplatzFlaeche`), neben
    // jedem Weg, fern jeder Laterne (2 m), jedes Hof-Baums (3,5 m), jedes Stands und jedes Ackers — die Regeln, nach denen das
    // Layout sie um ihn stellte. Trifft er eins, rückt er zum nächsten freien Stand am Rand eines Wegs (wie gezogen: 0,6 m hinter
    // dem Rand, je 0,5 m jedes Wegs, beide Seiten); findet er keinen, fällt er aus dem Plan (gezählt, nie still).
    // dorfB: [{p, dims}] · pl: lay.pl · lay: das Layout (brunnen wird ERSETZT). Rückgabe { gerueckt, gestrichen }.
    function brunnenWeicht(dorfB, pl, lay) {
        var O = ORT_GESETZ,
            r = AUSSTATTUNG.brunnen.tritt.r,
            st = AUSSTATTUNG.marktstand.tritt,
            flaechen = [],
            neu = [],
            aus = { gerueckt: 0, gestrichen: 0 },
            wege = (lay.roads || []).filter(function (rd) {
                return rd.pts && rd.pts.length > 1;
            }),
            a,
            i,
            k;
        // der Fußpunkt auf der Mitte eines Wegs: Abstand d, Bogenlänge s, Seite (+1 links der Laufrichtung)
        var fuss = function (rd, x, z) {
            var f = { d: Infinity, s: 0, seite: 1 },
                s = 0;
            for (var j = 0; j + 1 < rd.pts.length; j++) {
                var A = rd.pts[j],
                    dx = rd.pts[j + 1].x - A.x,
                    dz = rd.pts[j + 1].z - A.z,
                    L = Math.hypot(dx, dz);
                if (!(L > 1e-9)) continue;
                var t = Math.max(0, Math.min(1, ((x - A.x) * dx + (z - A.z) * dz) / (L * L))),
                    d = Math.hypot(x - A.x - dx * t, z - A.z - dz * t);
                if (d < f.d) f = { d: d, s: s + t * L, seite: dx * (z - A.z) - dz * (x - A.x) >= 0 ? 1 : -1 };
                s += L;
            }
            return f;
        };
        // der Punkt der Bogenlänge s, um d quer zur Laufrichtung (links positiv); null jenseits der Enden
        var quer = function (rd, s, d) {
            if (s < 0) return null;
            for (var j = 0; j + 1 < rd.pts.length; j++) {
                var A = rd.pts[j],
                    dx = rd.pts[j + 1].x - A.x,
                    dz = rd.pts[j + 1].z - A.z,
                    L = Math.hypot(dx, dz);
                if (L > 1e-9 && s <= L) return { x: A.x + ((dx * s) / L) - (dz / L) * d, z: A.z + ((dz * s) / L) + (dx / L) * d };
                s -= L;
            }
            return null;
        };
        var kw = wege.map(function (rd) {
            return wegKasten(rd.pts);
        });
        var aufWeg = function (x, z, saum) {
            for (var j = 0; j < wege.length; j++) if (!fernKasten(x, z, kw[j], wege[j].w / 2 + saum) && fuss(wege[j], x, z).d < wege[j].w / 2 + saum) return true;
            return false;
        };
        // die Flächen der Häuser: der Grundriss und der Gang vom Eingang bis an den Weg (mindestens ORT_GESETZ.vorplatzM)
        for (i = 0; i < pl.length; i++) {
            var q = pl[i],
                B = dorfB[i];
            if (!q || !q.obb || Math.abs(q.obb.cx) > 5000 || Math.abs(q.obb.cz) > 5000) continue;
            flaechen.push(q.obb);
            var tu = B && B.dims && B.dims.tuer;
            if (!tu || !isFinite(tu.x) || !isFinite(tu.z) || !isFinite(tu.w)) continue;
            var sl = { x: q.x, z: q.z, phi: q.phi || 0, kultur: B.p && B.p.kultur, ov: B.p || null };
            sl.tuer = { x: tu.x, z: tu.z, w: tu.w, y: tu.y, W: B.dims.W, D: B.dims.D };
            var ez = eingangVon(sl).z,
                c = Math.cos(sl.phi),
                s2 = Math.sin(sl.phi),
                tief = O.vorplatzM;
            for (var t = 0; t <= O.vorplatzM + O.gasseM; t += 0.25)
                if (aufWeg(q.x + tu.x * c + (ez - t) * s2, q.z - tu.x * s2 + (ez - t) * c, 0)) {
                    tief = Math.max(O.vorplatzM, t);
                    break;
                }
            flaechen.push(vorplatzFlaeche(sl, tief));
        }
        var frei = function (x, z) {
            if (aufWeg(x, z, 0.35)) return false; // wie gezogen: die Mitte 0,6 m hinter dem Rand (der Kranz ragt 0,32 m hinein)
            for (var j = 0; j < flaechen.length; j++) if (!fernOBB(x, z, flaechen[j], r) && distPunktOBB(x, z, flaechen[j]) < r) return false;
            for (j = 0; j < (lay.felder || []).length; j++) if (!fernOBB(x, z, lay.felder[j], r) && distPunktOBB(x, z, lay.felder[j]) < r) return false;
            var nah = function (L, m) {
                for (var n = 0; n < (L || []).length; n++) if (Math.hypot(x - L[n].x, z - L[n].z) < m) return true;
                return false;
            };
            return !nah(lay.laternen, 2) && !nah(lay.trees, 3.5) && !nah(lay.staende, r + Math.hypot(st.ex, st.ez)) && !nah(neu, 2 * r);
        };
        // die Stände am Rand jedes Wegs (je 0,5 m, beide Seiten), der nächste zuerst
        var raender = [];
        for (a = 0; a < wege.length; a++)
            for (var u = 0, p = true; p; u += 0.5)
                for (var sk = -1; sk <= 1; sk += 2) if ((p = quer(wege[a], u, sk * (wege[a].w / 2 + 0.6)))) raender.push(p);
        for (k = 0; k < (lay.brunnen || []).length; k++) {
            var b = lay.brunnen[k],
                stand = frei(b.x, b.z) ? b : null;
            if (!stand) {
                var nach = raender
                    .map(function (p1) {
                        return [Math.hypot(p1.x - b.x, p1.z - b.z), p1];
                    })
                    .sort(function (e1, e2) {
                        return e1[0] - e2[0];
                    })
                    .map(function (e1) {
                        return e1[1];
                    });
                for (a = 0; !stand && a < nach.length; a++) if (frei(nach[a].x, nach[a].z)) stand = nach[a];
            }
            if (stand && stand !== b) aus.gerueckt++;
            if (stand) neu.push({ x: stand.x, z: stand.z });
            else aus.gestrichen++;
        }
        lay.brunnen = neu;
        return aus;
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
    // ── DIE LEUTE EINES HAUSES (Meisterkarte mensch.K1, additiv) — das META-GESETZ von der anderen Seite: dort emergiert die
    //    Größe eines Hauses aus Personen und Wohlstand, hier wohnen in einem gebauten Haus (die Zeile hp des Plans, `slot.ov`)
    //    so viele, wie seine Wohnfläche bei seinem Wohlstand trägt — je Geschoss die Grundfläche W·D, davon `nutz` bewohnbar
    //    (Wände, Stiege), je Person `flaeche` + `wohlFlaeche`·wohl m² (die Kammer der Armen, die Stube der Reichen), ganzzahlig,
    //    mindestens 1, höchstens `max`. Die Rollen ohne Haushalt tragen ihre Zahl (`rolle`): die Scheune und die Halle des
    //    Gewerbes niemanden, die Kirche ihren Pfarrer, die Schmiede Meister und Gesellen. REIN: dieselbe Zeile ⇒ dieselbe Zahl.
    //    Leser: der Wirt (die Bewohner je Haus) und gate:kreatur-takt bewohner.
    var LEUTE_GESETZ = { nutz: 0.7, flaeche: 20, wohlFlaeche: 20, max: 12, rolle: { scheune: 0, halle: 0, kirche: 1, schmiede: 2 } };
    function leuteVon(hp) {
        if (!hp || typeof hp !== "object") return 0;
        var rolle = typeof hp.rolle === "string" ? hp.rolle : "wohnhaus";
        if (Object.prototype.hasOwnProperty.call(LEUTE_GESETZ.rolle, rolle)) return LEUTE_GESETZ.rolle[rolle];
        var W = Number(hp.W), D = Number(hp.D), st = Number(hp.storeys);
        var wohl = isFinite(hp.wohl) ? Math.max(0, Number(hp.wohl)) : 1;
        if (!(W > 0 && D > 0)) return 1;
        var fl = W * D * (st >= 1 ? st : 1) * LEUTE_GESETZ.nutz;
        var jeP = LEUTE_GESETZ.flaeche + LEUTE_GESETZ.wohlFlaeche * wohl;
        return Math.max(1, Math.min(LEUTE_GESETZ.max, Math.round(fl / jeP)));
    }

    // ── N5.7 SETTLEMENT-EXPORT — exportSettlement(dp) (das exportDrive-Muster,
    //    N6.2: die EINE Lab-Formel exportiert ABGELEITETE Daten, kein Duplikat).
    //    dp = { seed, nH, epoche?, budget? } → reine, structured-clone-sichere
    //    DATEN: name/region/groesse + slots[] (je Haus: Anker x/z/phi [exakt die
    //    Lab-wrap-Semantik: position.set(x,0,z) + rotation.y=phi], obb, kultur,
    //    seed, rolle, baujahr, ov = der volle Haus-P-Vektor als benannte Daten)
    //    + die BENANNTEN Siedlungs-Schichten (roads/platz/brunnen/mauer/
    //    laternen/… — dürfen v1 unkonsumiert bleiben, must-ignore). Der Fußab-
    //    druck je Haus kommt aus massBau (der MASS-BUILD, Δext=0-bewiesen) —
    //    exakt der buildDorf-Pfad der Shell. DETERMINISTISCH: DORF/dorfLayout
    //    ziehen aus ihren Seed-LCGs, massBau ist reiner Bau — derselbe dp ⇒
    //    byte-derselbe Export (gate:settlement friert das ein). Unplatzierte
    //    Häuser (die ±9999-Parkplätze des Layouts) reisen NICHT (fail-closed).
    // die Außenkante der Wände längs x (die Solids des Mass-Baus, `massBau` → B.wandX)
    function wandXVon(solids) {
        var x0 = Infinity,
            x1 = -Infinity;
        for (var k = 0; solids && k < solids.length; k++) {
            x0 = Math.min(x0, solids[k].min[0]);
            x1 = Math.max(x1, solids[k].max[0]);
        }
        return x0 < x1 ? [x0, x1] : null;
    }
    // DIE BRANDWAND TRÄGT KEINE TRAUFE IN DEN NACHBARN: reihenSnap dockt dichte Reihen (gap ≤ 0,6) längs x an die Wand-Linie
    // `dims.W` — an einer gedockten Seite (`brandwand` x0/x1) endet die obb, das Fundament der Welt (`_grundrissVon`:
    // Bau-Wand, Grund, Natur-Wand), an der Außenkante der Wand (`wandX`), sonst an der Hülle `ext` samt Traufe. Bis
    // siedlung-k3-heil trug sie die Traufe 0,24–0,49 m in die Wand des Nachbarn, und die Bau-Wand der Welt warf ein Haus des
    // Paars (das Start-Dorf auf der Trasse: 16 von 17 Häusern nach dem Reload).
    function obbAnDerBrandwand(o, bw, e, wx) {
        var x0 = bw && bw.x0 && wx ? Math.max(e.x0, wx[0]) : e.x0,
            x1 = bw && bw.x1 && wx ? Math.min(e.x1, wx[1]) : e.x1,
            d = (x0 + x1 - e.x0 - e.x1) / 2;
        return { cx: o.cx + d * Math.cos(o.phi), cz: o.cz - d * Math.sin(o.phi), phi: o.phi, ex: (x1 - x0) / 2, ez: o.ez };
    }
    // DER MASS-BAU IM GEDÄCHTNIS (siedlung.K3): der Wirt rechnet den Export am Ort der Ort-Wahl neu (ein anderes `dp.hoehe`),
    // der Mass-Bau eines Hauses hängt nur an seinem P-Vektor — derselbe Vektor nimmt denselben Bau, frisch sind je Export nur
    // `p` (brandwand schreibt in sie) und der Rahmen `q`. Höchstens MASS_GEDAECHTNIS Häuser, dann fällt das Gedächtnis ganz.
    var MASS_GEDAECHTNIS = 1024;
    var massGedaechtnis = new Map();
    function massBauExport(hp) {
        var k = JSON.stringify(hp);
        var B = massGedaechtnis.get(k);
        if (!B) {
            if (massGedaechtnis.size >= MASS_GEDAECHTNIS) massGedaechtnis.clear();
            B = massBau(Object.assign({}, hp));
            massGedaechtnis.set(k, B);
        }
        return Object.assign({}, B, { p: hp, q: { phi: 0, x: 0, y: 0, z: 0, obb: { cx: 0, cz: 0 } }, meshes: [] });
    }
    var PASSUNG_LUFT = 0.02,
        PASSUNG_SCHRITTE = 4;
    // die obb des Baus mit der Hülle e im Rahmen q seines Loses (der Ursprung des Hauses bei q.x/q.z, gedreht um q.phi)
    // DER RING UM DEN KERN (siedlung.K4 Staffel 2, `exportSettlement`): die Lose des Rings (das Layout LB um den Kern K, ab der
    // Nummer nA) stehen um das Haus verschoben im Layout des Orts; wessen Grundriss das Haus oder einen Grundriss des Orts
    // berührt (Abstand < gap), steht nicht; ihre Gassen, Laternen und ihre Welt kommen dazu — ihr Platz, Brunnen und Acker
    // nicht: der Kern ist das Haus
    function ringUm(lay, LB, K, nA, gap) {
        var vs = function (q) {
            return Object.assign({}, q, { x: q.x + K.x, z: q.z + K.z });
        };
        var belegt = lay.pl
            .filter(Boolean)
            .map(function (q) {
                return q.obb;
            })
            .concat([{ cx: K.x, cz: K.z, phi: K.phi || 0, ex: K.ex || 4, ez: K.ez || 4 }]);
        LB.pl.forEach(function (q, j) {
            var o = q && q.obb ? Object.assign({}, q.obb, { cx: q.obb.cx + K.x, cz: q.obb.cz + K.z }) : null;
            var frei =
                !!o &&
                belegt.every(function (a) {
                    return obbSep(o, a) >= gap;
                });
            lay.pl[nA + j] = frei ? Object.assign(vs(q), { obb: o }) : null;
            if (frei) belegt.push(o);
        });
        lay.roads = lay.roads.concat(
            LB.roads.map(function (rd) {
                return Object.assign({}, rd, { pts: rd.pts.map(vs) });
            })
        );
        lay.laternen = lay.laternen.concat(
            LB.laternen.map(function (l) {
                return Object.assign(vs(l), l.wand ? { haus: nA + l.haus } : null);
            })
        );
        var w = LB.welt;
        lay.welt = {
            x0: Math.min(lay.welt.x0, w.x0 + K.x),
            x1: Math.max(lay.welt.x1, w.x1 + K.x),
            z0: Math.min(lay.welt.z0, w.z0 + K.z),
            z1: Math.max(lay.welt.z1, w.z1 + K.z),
        };
    }
    function obbImLos(q, e) {
        var lx = (e.x0 + e.x1) / 2,
            lz = (e.z0 + e.z1) / 2,
            c = Math.cos(q.phi),
            s = Math.sin(q.phi);
        return { cx: q.x + lx * c + lz * s, cz: q.z - lx * s + lz * c, phi: q.phi, ex: (e.x1 - e.x0) / 2, ez: (e.z1 - e.z0) / 2 };
    }
    function exportSettlement(dp) {
        dp = dp && typeof dp === "object" ? dp : {};
        var plan = DORF({
            seed: isFinite(dp.seed) ? Number(dp.seed) : 1,
            nH: isFinite(dp.nH) ? Number(dp.nH) : undefined, // ohne Zahl entscheidet DORF (die Epoche, sonst 18)
            epoche: typeof dp.epoche === "string" ? dp.epoche : undefined,
            budget: isFinite(dp.budget) ? Number(dp.budget) : undefined,
            jahr: isFinite(dp.jahr) ? Number(dp.jahr) : undefined, // das Jahr des Orts (Staffel 2, `wachstum`); ohne es das Ende der Epoche
        });
        var ext = [];
        var Bs = [];
        var i;
        // DIE JAHRESRINGE (siedlung.K4): das Layout packt die LOSE der Gestalt (`plan.lose`, wo im Schnitt ein früherer Bau steht),
        // der Slot trägt den Bau seines Jahrs — im Rahmen des Loses um denselben Ursprung
        // DIE PASSUNG: der frühere Bau steht in seinem Los — ragt seine Hülle über die des Loses (die Traufe und der Turm der
        // alten Kirche über dem flachen Los der Gegenwart), wird er um das Doppelte des Überstands schmaler oder kürzer, bis sie
        // liegt (höchstens PASSUNG_SCHRITTE; danach ROT beim Namen) — sonst warf die Bau-Wand der Welt seinen Nachbarn.
        for (i = 0; i < plan.houses.length; i++) {
            var hp0 = plan.houses[i],
                Bm = massBauExport(hp0), // brandwand schreibt in die EINE hp-Quelle — ov (unten) liest sie
                el = plan.lose[i] ? massBauExport(plan.lose[i]).ext : Bm.ext;
            for (var k = 0; ; k++) {
                var ax = Math.max(el.x0 - Bm.ext.x0, Bm.ext.x1 - el.x1),
                    az = Math.max(el.z0 - Bm.ext.z0, Bm.ext.z1 - el.z1);
                if (ax <= PASSUNG_LUFT && az <= PASSUNG_LUFT) break;
                if (k === PASSUNG_SCHRITTE)
                    throw new Error("fachwerk: der Bau von " + hp0.baujahr + " (" + hp0.kultur + ") passt nicht in sein Los (" + ax.toFixed(2) + "/" + az.toFixed(2) + " m)");
                hp0 = plan.houses[i] = Object.assign({}, hp0, {
                    W: ax > PASSUNG_LUFT ? hp0.W - 2 * ax - PASSUNG_LUFT : hp0.W,
                    D: az > PASSUNG_LUFT ? hp0.D - 2 * az - PASSUNG_LUFT : hp0.D,
                });
                Bm = massBauExport(hp0);
            }
            Bs.push(Bm);
            ext.push(el);
        }
        // DIE TRASSE LIEST DAS GELÄNDE (siedlung.K3): `dp.hoehe` ist das Höhen-Raster um den Ort (`trasseRahmen`, plan-lokal); ohne
        // es liegt der Plan auf ebenem Grund (der Akt ohne Ort, das Labor ohne Welt)
        var Htr = dp.hoehe ? hoeheAusRaster(dp.hoehe) : null;
        // DER KERN EINES RINGS (siedlung.K4 Staffel 2): ein gesetztes Haus im Ort (`dp.kern` {x, z, phi, ex, ez, ab}: seine Platte
        // plan-lokal, ab = das Jahr des Orts, als es stand) wird Kern der Lose, die danach gegründet sind — sie wachsen in ihrem
        // eigenen Layout um das Haus (`ringUm`), die älteren liegen, wie sie lagen (ihr Layout ist das des Schnitts bis ab)
        var K = dp.kern && plan.chronik && isFinite(dp.kern.x) && isFinite(dp.kern.z) ? dp.kern : null;
        var nA = plan.houses.length;
        if (K) for (nA = 0; nA < plan.houses.length && plan.chronik.jahre[nA] <= K.ab; ) nA++;
        // EIN Layout der Lose von…bis (um den Kern `kern`: die Kreuzung als Kern, ihr eigener Same, die Höhe am Haus) samt der
        // Wahrheit des Labors (buildDorf): U6c — reihenSnap rückt die Reihe zusammen (Slot-x/z/obb), brandwand markiert
        // hp.brandwand (reist als ov.brandwand); DER BRUNNEN WEICHT DEM HAUS (S4-N4) und DIE WANDLATERNE (K66-2) nach dem Snap
        var teil = function (von, bis, kern, ort) {
            var Bt = Bs.slice(von, bis),
                p = Object.assign({}, plan, { houses: plan.houses.slice(von, bis), lose: plan.lose.slice(von, bis) });
            var H =
                Htr && kern
                    ? function (x, z) {
                          return Htr(x + kern.x, z + kern.z);
                      }
                    : Htr;
            // der Ring trägt das Haus und die Grundrisse des Orts als belegt (in seinem Rahmen um das Haus)
            if (kern)
                Object.assign(p, {
                    kernel: "kreuzung",
                    nGestalt: bis - von,
                    belegt: [{ cx: kern.x, cz: kern.z, phi: kern.phi || 0, ex: kern.ex || 4, ez: kern.ez || 4 }]
                        .concat(ort.pl.filter(Boolean).map(function (q) { return q.obb; }))
                        .map(function (o) { return Object.assign({}, o, { cx: o.cx - kern.x, cz: o.cz - kern.z }); }),
                });
            var L = dorfLayout(p, ext.slice(von, bis), kern ? (plan.seed ^ 0x2545f491) >>> 0 : plan.seed, H);
            reihenSnap(Bt, L.pl, plan.norm.gap);
            for (var j = 0; j < Bt.length; j++) Bt[j].q = L.pl[j];
            brandwand(
                Bt.filter(function (b) {
                    return b.q;
                }),
                plan.norm.gap
            );
            brunnenWeicht(Bt, L.pl, L);
            wandLaternen(Bt, L.pl, L);
            return L;
        };
        var lay = teil(0, nA);
        if (nA < plan.houses.length) ringUm(lay, teil(nA, plan.houses.length, K, lay), K, nA, plan.norm.gap);
        var slots = [],
            slotVon = {};
        for (i = 0; i < plan.houses.length; i++) {
            var q = lay.pl[i];
            if (!q || !q.obb || Math.abs(q.obb.cx) > 5000 || Math.abs(q.obb.cz) > 5000) continue;
            var hp = plan.houses[i],
                ev = Bs[i].ext,
                o = plan.lose[i] ? obbImLos(q, ev) : q.obb;
            slotVon[i] = slots.length;
            slots.push(
                hausSlot(
                    Bs[i],
                    hp,
                    q,
                    plan.norm.gap <= 0.6 && hp.brandwand
                        ? obbAnDerBrandwand(o, hp.brandwand, ev, Bs[i].wandX)
                        : { cx: o.cx, cz: o.cz, phi: o.phi, ex: o.ex, ez: o.ez }
                )
            );
        }
        // die Mauer der Gestalt (das Layout) oder die des Schnitts (`schnittMauer`: der Schnitt einer Chronik vor MAUER_BIS, staedtisch)
        var mz =
            lay.mauer ||
            (plan.chronik && plan.schnitt.staedtisch && plan.schnitt.jahr < MAUER_BIS
                ? schnittMauer(slots, lay.roads, plan.seed)
                : null);
        var aus = {
            seed: plan.seed,
            name: plan.name,
            region: plan.region,
            groesse: plan.schnitt.groesse,
            kernel: plan.kernel,
            jahr: plan.schnitt.jahr,
            spanne: plan.schnitt.spanne,
            staedtisch: !!plan.schnitt.staedtisch,
            kleidung: plan.kleidung, // die Tracht der Epoche (siedlung.K4; Leser: der Wirt, `_bewohnerGestalten`)
            spawn: lay.spawn,
            welt: lay.welt,
            slots: slots,
            // SCHICHT-VOLLENDUNG (18.07., Vertrags-Akt): NUR gelebte Schichten
            // reisen — Wege/Platz/Zäune/Äcker (_stlWegeBuild), Brunnen + Stände
            // + Hof-Bäume (Architektur-Spawns) + Laternen, die Mauer der Stadt (`_stlMauerBuild`,
            // siedlung.K2: bis dahin aus dem Export gestrichen, die Stadt der Welt stand ohne sie) und
            // der Graph der Gassen (nV/nE/zyklen, der Leser gate:settlement Z). Einen Siedlungs-Fluss plant das
            // Layout nicht mehr (K10: der Deko-Fluss fiel, das EINE Wasser ist das
            // der Welt — der Plan v2 etikettiert, wo ein Weg es kreuzt).
            mauer: mz
                ? {
                      R: mz.R,
                      segs: mz.segs.map(function (s) {
                          return { x0: s.x0, z0: s.z0, x1: s.x1, z1: s.z1 };
                      }),
                      towers: mz.towers.map(function (t) {
                          return { x: t.x, z: t.z };
                      }),
                      gates: mz.gates.map(function (g) {
                          return { x: g.x, z: g.z, th: g.th };
                      }),
                  }
                : null,
            graph: { nV: lay.graph.nV, nE: lay.graph.nE, zyklen: lay.graph.zyklen },
            roads: lay.roads,
            feldwege: lay.feldwege,
            platz: lay.platz,
            brunnen: lay.brunnen,
            trees: lay.trees,
            fences: lay.fences,
            felder: lay.felder,
            staende: lay.staende,
            // DIE LATERNEN reisen (K10 × K11): ihr Leser ist das Leuchtquellen-Gesetz der Welt (`_laternenLesen`). Die
            // Wandlaterne (K66-2) trägt den Slot ihres Hauses (`slot`): die Welt hebt sie MIT ihm (`_spawnSettlementSlot`) —
            // vorher gehoben sperrte sie ihr eigenes Haus (Auto-Dorf 13/16 Häuser); ohne Slot hängt sie an keiner Wand.
            laternen: lay.laternen
                .filter(function (l) {
                    return !l.wand || slotVon[l.haus] !== undefined;
                })
                .map(function (l) {
                    return l.wand ? { x: l.x, z: l.z, th: l.th, gas: l.gas, wand: true, slot: slotVon[l.haus] } : l;
                }),
        };
        if (Htr) aus.trasse = { aussen: Htr.mass.aussen }; // der Rahmen trug jeden Lese-Punkt der Trasse (die Linse verlangt 0)
        // die Mauer des Schnitts liegt in der Welt des Plans wie die der Gestalt (dorfLayout: ihr Radius + 8 m, der Rand 9 m)
        if (mz && !lay.mauer)
            aus.welt = {
                x0: Math.min(lay.welt.x0, -mz.R - 17),
                x1: Math.max(lay.welt.x1, mz.R + 17),
                z0: Math.min(lay.welt.z0, -mz.R - 17),
                z1: Math.max(lay.welt.z1, mz.R + 17),
            };
        if (plan.chronik) aus.chronik = plan.chronik; // die Chronik der Gestalt (Staffel 2: ihr Leser ist `wachstum`)
        return aus;
    }

    // ── DER ORT AUF DEM GELÄNDE (K10, Plan v2) — ortPlan(plan, origin, ctx): der Export (2D, plan-lokal) auf der Gelände-
    //    Funktion der Welt-Zelle. ctx = { hoeheAt(x, z), flaeche(splats) }: hoeheAt liest die Höhe an einem WELT-Ort, flaeche
    //    reicht zu Erdbau-Splats den Leser (x, z) → Höhe auf einer ihrer Flächen oder null (gelaende-core `erdbauY`) — das
    //    ctx-Muster von phyto `planForestCell`: der Wirt reicht seine Lese-Funktionen, der Kern rechnet. Die Reihenfolge ist
    //    das Gesetz: der PLATZ
    //    liegt auf dem Median seines Grunds; jeder WEG trägt ein Höhen-Profil (geglättet über `glaettM`, am Platz und an den
    //    Knoten der früheren Wege gepinnt, das Gefälle gekappt auf `gefaelle`); jedes HAUS steht auf der Höhe seiner Gasse (die
    //    Fläche, die der Gang aus der Tür betritt; ein Hof-Haus auf dem Niveau seines Hofs, sonst der Median seines Grundrisses), sein Vorplatz trägt die halbe Diele (zwei Stufen statt
    //    einer Schwelle von 0,55 m). Ausgabe: der Plan mit `version: 2`, `ort` {x, z}, je Slot `y` (der Boden des Hauses,
    //    absolut) und `hang` (plattform · hanghaus · stelzen: die Spanne des Grunds unter dem Grundriss), die Wege mit `ys`, der
    //    Platz und die Laternen mit `y`, und `erdbau[]` — die Splats des ERDBAU-Terms (gelaende-core `erdbauNormal`): `platte`
    //    {cx, cz, phi, ex, ez, y} und `trasse` {x0, z0, y0, x1, z1, y1, w}, absolut in Welt-Koordinaten, in der Reihenfolge
    //    ihrer Auswertung (Wege, Platz, je Haus Grundriss und Vorplatz), zuletzt `frei` {cx, cz, phi, ex, ez} unter jeder
    //    Brücke. ctx.wasserAt(x, z) (optional) nennt das Welt-Wasser: ein Weg darüber trägt `bruecken` [[Widerlager a, b]]. REIN: derselbe Plan + derselbe Ort + dieselbe Höhe ⇒
    //    byte-derselbe Plan v2 (gate:settlement, Plan-Hash Studio = Welt). Leser: der Wirt (`_ortPlanSetzen`).
    var ORT_GESETZ = {
        glaettM: 6, // halbe Fensterbreite der Weg-Glättung (m)
        gefaelle: 0.12, // die Fuß-Gasse (Nordstern §6: Fuß ≤ 12 %)
        trasse: 0.09, // so steil darf der Lauf einer Gasse steigen (`trasseLenk`; die Marge zum Fuß trägt die Feinform zwischen den Raster-Punkten)
        saumM: 0.6, // so weit steht eine Platte über den Grundriss, eine Trasse über den Weg hinaus
        vorplatzM: 1.6, // Tiefe des Vorplatzes vor der Haustür (mindestens: er reicht bis zur Gasse des Hauses)
        gasseM: 5, // so weit vor der Tür (über die halbe Wegbreite hinaus) findet das Haus seine Gasse
        hangPlattform: 1.5, // Spanne des Grunds unter dem Grundriss bis zur Plattform (m)
        hangHanghaus: 4, // bis zum Hanghaus; darüber Stelzen
        brueckeM: 8, // so weit hält der FREI-Splat einer Brücke den Grund je Seite des Wegs unberührt (die Böschung staut nicht)
        umM: 0.25, // so weit über den Saum seiner Gasse läuft der Umweg um einen Fremd-Slot (`ortPlan`, ctx.fest)
        kreuzungM: 10, // so weit reicht die Scheibe einer Kreuzung höchstens (zwei Arme unter spitzem Winkel, `ortPlan`)
        kreuzSinus: 0.34, // flacher als ~20° treffen sich zwei Arme nicht (sie laufen fort: ein Weg, der den anderen fortsetzt)
    };
    // DER EINGANG eines Slots (K10-6 · K66, plan-lokal), den der Gang von der Gasse betritt: z haus-lokal, y seine Schwelle über dem
    // Boden des Hauses — die Haustür; beim HOF-Haus das Tor im Torriegel vor dem Hof (`hof`: zC = Front − Hof-Tiefe clamp(W, 5, 9),
    // sein Boden auf der Diele + 0,08 m; am Hof-Tor stand der Gang vor 0,63 m ohne Stufe, W6). EINE Regel: der Plan v2 (`ortPlan`),
    // der Vorplatz (`vorplatzFlaeche`) und der Wirt (die Stufe im Hof, `_stlWegeBuild`) lesen sie — bis K66 stand sie zweimal.
    function eingangVon(sl) {
        var tu = sl.tuer;
        var pre = PRESETS[sl.kultur];
        var hof = !!(pre && pre.kind !== "ausstattung" && hausParams(pre, sl.ov || null).grundriss === "hof" && isFinite(tu.W));
        var ty = isFinite(tu.y) ? tu.y : 0;
        return hof ? { z: tu.z - Math.min(9, Math.max(5, tu.W)), y: ty + 0.08, hof: true } : { z: tu.z, y: ty, hof: false };
    }
    // DER VORPLATZ EINES HAUSES (K10-6 · K66, plan-lokal): vor seinem Eingang (`eingangVon`) ein Rechteck der Türbreite samt Saum und der
    // Tiefe `tief` (ohne: ORT_GESETZ.vorplatzM) — die Erdbau-Platte des Vorplatzes (`ortPlan`, die Tiefe bis zur Gasse; ihr Boden:
    // `vorplatzBoden`). `tuer`: die Fläche vor der Haustür selbst (beim HOF-Haus die Stufe im Hof). null ohne Tür. Rückgabe {cx, cz,
    // phi, ex, ez} im Rahmen des Plans.
    function vorplatzFlaeche(sl, tief, tuer) {
        var tu = sl && sl.tuer;
        if (!tu || !isFinite(tu.x) || !isFinite(tu.z) || !isFinite(tu.w)) return null;
        var O = ORT_GESETZ;
        var ez0 = tuer ? tu.z : eingangVon(sl).z;
        var t = isFinite(tief) ? tief : O.vorplatzM;
        var c = Math.cos(sl.phi || 0);
        var s = Math.sin(sl.phi || 0);
        var lz = ez0 - t / 2;
        return { cx: sl.x + tu.x * c + lz * s, cz: sl.z - tu.x * s + lz * c, phi: sl.phi || 0, ex: tu.w / 2 + O.saumM, ez: t / 2 };
    }
    // DER BODEN DES VORPLATZES (K66, Augen-Runde 15.10.: Gras wuchs über die Türtreppe; die Prüfung fand den Boden 1,6 m tief, die Platte
    // bis zur Gasse): getretene Erde auf der Erdbau-Platte des Vorplatzes `p` (absolut, mit ihrer Marke `vorplatz` — dem Saum der Gasse,
    // den der Gang von der Platte bis an den Weg quert, in m) und über diesen Saum hinaus. EINE Quelle: der Erdbau des Orts trägt die
    // Platte in der Welt (Akt, Dorf-Zug und Wege-Rebuild aus dem Export lesen sie gleich). Rückgabe {cx, cz, phi, ex, ez} absolut.
    function vorplatzBoden(p) {
        var h = (isFinite(p.vorplatz) ? p.vorplatz : 0) / 2;
        var s = Math.sin(p.phi || 0);
        var c = Math.cos(p.phi || 0);
        return { cx: p.cx - s * h, cz: p.cz - c * h, phi: p.phi || 0, ex: p.ex, ez: p.ez + h };
    }
    // DAS WASSER EINES HAUSES (K10): ein Slot `sl` (plan-lokal), dessen Grund samt Saum oder dessen Vorplatz Welt-Wasser trägt
    // (`wasserAm(x, z)` plan-lokal: ctx.wasserAt, dasselbe Urteil wie das Brücken-Etikett; das Raster des Wirts,
    // `_fundamentRaster`: je Meter ein Punkt, höchstens 13 je Seite), fällt aus dem Plan, BEVOR sein Erdbau entsteht — keine
    // Platte im See, das Dorf ist, was steht. `ein` sein Eingang (`eingangVon`); `mitte`: nur der mittlere Punkt des Rasters
    // (der billige Beweis zuerst). Leser: `ortPlan` und `ortImWasser`.
    function slotImWasser(sl, wasserAm, ein, mitte) {
        var O = ORT_GESETZ;
        var ob = sl.obb;
        if (ob && isFinite(ob.ex) && isFinite(ob.ez)) {
            var c = Math.cos(ob.phi || 0);
            var s = Math.sin(ob.phi || 0);
            var ex = ob.ex + O.saumM;
            var ez = ob.ez + O.saumM;
            var nx = Math.min(12, Math.max(1, Math.ceil(ex)));
            var nz = Math.min(12, Math.max(1, Math.ceil(ez)));
            for (var i = mitte ? nx >> 1 : 0; i <= (mitte ? nx >> 1 : nx); i++)
                for (var j = mitte ? nz >> 1 : 0; j <= (mitte ? nz >> 1 : nz); j++) {
                    var lx = ex * ((2 * i) / nx - 1);
                    var lz = ez * ((2 * j) / nz - 1);
                    if (wasserAm(ob.cx + lx * c + lz * s, ob.cz - lx * s + lz * c)) return true;
                }
        } else if (wasserAm(sl.x, sl.z)) return true;
        var tu = sl.tuer;
        if (!mitte && tu && isFinite(tu.x) && isFinite(tu.z) && isFinite(tu.w)) {
            var ez0 = ein(sl).z;
            var cu = Math.cos(sl.phi || 0);
            var su = Math.sin(sl.phi || 0);
            for (var t = 0.25; t <= O.vorplatzM; t += 0.75)
                for (var u = -1; u <= 1; u++) {
                    var lt = ez0 - t;
                    var du = (u * tu.w) / 2;
                    if (wasserAm(sl.x + tu.x * cu + lt * su + du * cu, sl.z - tu.x * su + lt * cu - du * su)) return true;
                }
        }
        return false;
    }
    // NIMMT DAS WASSER AM ORT `origin` EIN HAUS des Exports `plan` (siedlung.K5)? Ein Slot, den `ortPlan` über `ctx` fallen ließe
    // (`slotImWasser`: erst die Mitte jedes Hauses, dann sein ganzes Raster), −1 ohne — ohne den Plan zu rechnen. Leser: die
    // Ort-Wahl der Welt (voxel-worker `ortWahl`: ein Ort, an dem das Wasser ein Haus nimmt, trägt den Plan nie ganz).
    function ortImWasser(plan, origin, ctx) {
        var ox = Number(origin.x);
        var oz = Number(origin.z);
        var am = function (x, z) {
            return !!(ctx.wasserAt && ctx.wasserAt(ox + x, oz + z));
        };
        for (var m = 1; m >= 0; m--)
            for (var i = 0; i < plan.slots.length; i++) if (slotImWasser(plan.slots[i], am, eingangVon, m)) return i;
        return -1;
    }
    // Liang–Barsky: das Stück [t0, t1] der Strecke a → b (im Rahmen eines Rechtecks) in |u| ≤ A, |v| ≤ B, null ohne
    function clipRechteck(a, b, A, B) {
        var t0 = 0;
        var t1 = 1;
        var p = [a[0] - b[0], b[0] - a[0], a[1] - b[1], b[1] - a[1]];
        var q = [a[0] + A, A - a[0], a[1] + B, B - a[1]];
        for (var i = 0; i < 4; i++) {
            if (p[i] === 0) {
                if (q[i] < 0) return null;
            } else if (p[i] < 0) t0 = Math.max(t0, q[i] / p[i]);
            else t1 = Math.min(t1, q[i] / p[i]);
        }
        return t0 <= t1 ? [t0, t1] : null;
    }
    // DER LAUF IM FREMD-SLOT (bauen.K2 Staffel 2): betritt der Lauf `pts` die Platte `f` {cx, cz, phi, ex, ez} (beide im Rahmen
    // des Plans) samt der halben Wegbreite `hw` und dem Saum der Gasse? {lok: der Lauf im Rahmen der Platte, ke/kx: die erste und
    // die letzte Strecke darin} oder null. Leser: `ortPlan` (der Umweg) und `festWeg`.
    function festLauf(pts, f, hw) {
        var c = Math.cos(f.phi || 0);
        var s = Math.sin(f.phi || 0);
        var lok = pts.map(function (p) {
            return [(p.x - f.cx) * c - (p.z - f.cz) * s, (p.x - f.cx) * s + (p.z - f.cz) * c];
        });
        var ke = -1;
        var kx = -1;
        for (var k = 1; k < lok.length; k++) {
            var tt = clipRechteck(lok[k - 1], lok[k], f.ex + hw + ORT_GESETZ.saumM, f.ez + hw + ORT_GESETZ.saumM);
            if (tt && tt[1] - tt[0] > 1e-9) kx = ke < 0 ? (ke = k) : k;
        }
        return ke < 0 ? null : { lok: lok, ke: ke, kx: kx };
    }
    // BETRITT EIN WEG DES PLANS v2 DEN FREMD-SLOT f (absolut, eine Platte wie ctx.fest)? Leser: der Wirt (`_ortFremdPruefen`: nur
    // der Ort, dessen Gasse oder Feldweg ein gesetztes Haus betritt, rechnet neu — nie jeder Ort, in dessen Radius es steht).
    function festWeg(v2, f) {
        var g = { cx: f.cx - v2.ort.x, cz: f.cz - v2.ort.z, phi: f.phi, ex: f.ex, ez: f.ez };
        return (v2.roads || []).concat(v2.feldwege || []).some(function (rd) {
            return !!festLauf(rd.pts || [], g, (isFinite(rd.w) ? rd.w : 3) / 2);
        });
    }
    function ortPlan(plan, origin, ctx) {
        if (
            !plan ||
            !Array.isArray(plan.slots) ||
            !origin ||
            !ctx ||
            typeof ctx.hoeheAt !== "function" ||
            typeof ctx.flaeche !== "function"
        )
            throw new Error("fachwerk ortPlan: Plan, Ort, ctx.hoeheAt und ctx.flaeche sind Pflicht");
        var O = ORT_GESETZ;
        var ox = Number(origin.x);
        var oz = Number(origin.z);
        if (!isFinite(ox) || !isFinite(oz)) throw new Error("fachwerk ortPlan: der Ort ist keine Zahl");
        var r6 = function (v) {
            return Math.round(v * 1e6) / 1e6;
        };
        var H = function (x, z) {
            var h = ctx.hoeheAt(ox + x, oz + z);
            if (!isFinite(h)) throw new Error("fachwerk ortPlan: keine Höhe an " + r6(ox + x) + "/" + r6(oz + z));
            return h;
        };
        var median = function (a) {
            var b = a.slice().sort(function (p, q) {
                return p - q;
            });
            var n = b.length;
            return n % 2 ? b[(n - 1) / 2] : 0.5 * (b[n / 2 - 1] + b[n / 2]);
        };
        // die Höhen eines gedrehten Rechtecks (plan-lokal, im Rahmen des Hauses: welt = mitte + (lx·c + lz·s, −lx·s + lz·c))
        var rechteck = function (cx, cz, phi, ex, ez) {
            var c = Math.cos(phi);
            var s = Math.sin(phi);
            var out = [];
            for (var i = 0; i < 5; i++)
                for (var j = 0; j < 5; j++) {
                    var lx = ex * (i / 2 - 1);
                    var lz = ez * (j / 2 - 1);
                    out.push(H(cx + lx * c + lz * s, cz - lx * s + lz * c));
                }
            return out;
        };
        var erdbau = [];
        var wegSaeume = [];
        var wegKerne = [];
        var freiSplats = [];
        // 1) DER PLATZ
        var pz = plan.platz;
        var platzY = null;
        if (pz && isFinite(pz.cx) && isFinite(pz.cz) && isFinite(pz.ex) && isFinite(pz.ez))
            platzY = r6(median(rechteck(pz.cx, pz.cz, pz.phi || 0, pz.ex, pz.ez)));
        // AM PLATZ liegt ein Weg-Punkt, dessen Weg (die halbe Breite `hw`) die Platte des Platzes samt Saum berührt — er trägt
        // die Höhe des Platzes (PFLICHT-OFFEN C: die Hauptstraße am Markt der Metropole lief 2,5 m neben ihm auf ihrer eigenen
        // Höhe, die Platte überdeckte ihren Kern um 0,6 m — eine Stufe von 0,74 m quer durch die Fahrbahn, an der jeder Wagen
        // stand); mindestens 1 m um den Platz (der Weg, der ihn quert)
        var imPlatz = function (x, z, hw) {
            if (platzY === null) return false;
            var c = Math.cos(pz.phi || 0);
            var s = Math.sin(pz.phi || 0);
            var dx = x - pz.cx;
            var dz = z - pz.cz;
            var rand = Math.max(1, hw + O.saumM);
            return Math.abs(dx * c - dz * s) <= pz.ex + rand && Math.abs(dx * s + dz * c) <= pz.ez + rand;
        };
        // 1b) DIE FREMD-SLOTS (bauen.K2 Staffel 2): ctx.fest nennt die Häuser, die ohne diesen Plan stehen — gesetzt vom Spieler,
        //    der KI, der Vorschau —, je die Platte ihres Grundrisses samt Saum aus ihrem EIGENEN Erdbau ({cx, cz, phi, ex, ez},
        //    absolut; der Wirt `_ortFest`, EIN Grund-Datum). Sie sind feste Slots des Plans: jede Gasse und jeder Feldweg, deren
        //    Lauf die Platte samt halber Breite und Saum betritt, weicht ihrem Rand um `umM` weiter, den Weg um die Ecken mit
        //    weniger Häusern des Plans, sonst den kürzeren; endet der Lauf darin, endet er an ihrem Rand — dieselben Wege, dasselbe
        //    Profil danach, kein zweiter Gassen-Bauer. Der Lauf des Exports bleibt am Weg (`lauf`): ein späterer Plan rechnet von
        //    ihm (fällt das Haus, liegt die Gasse wie vorher). Ohne ctx.fest ist der Plan byte-derselbe. Bis bauen.K2-2 lief die Gasse
        //    des Orts durch das gesetzte Haus — gemalt, getreten, das Netz der Bewohner führte hindurch.
        var fest = (Array.isArray(ctx.fest) ? ctx.fest : []).map(function (f) {
            return { cx: f.cx - ox, cz: f.cz - oz, phi: f.phi || 0, ex: f.ex, ez: f.ez, f: f };
        });
        var festGetroffen = [];
        var clip = clipRechteck;
        var umlegen = function (pts, hw) {
            for (var fi = 0; fi < fest.length; fi++) {
                var f = fest[fi];
                var im = festLauf(pts, f, hw);
                if (!im) continue;
                if (festGetroffen.indexOf(f.f) < 0) festGetroffen.push(f.f);
                var lok = im.lok;
                var ke = im.ke;
                var kx = im.kx;
                var c = Math.cos(f.phi);
                var s = Math.sin(f.phi);
                var welt = function (u, v) {
                    return { x: r6(f.cx + u * c + v * s), z: r6(f.cz - u * s + v * c) };
                };
                // Ein- und Austritt am um `umM` weiteren Rand (der Umweg läuft auf ihm, der Rand der Platte bleibt frei)
                var A = f.ex + hw + O.saumM + O.umM;
                var B = f.ez + hw + O.saumM + O.umM;
                var an = function (j, t) {
                    return [lok[j - 1][0] + (lok[j][0] - lok[j - 1][0]) * t, lok[j - 1][1] + (lok[j][1] - lok[j - 1][1]) * t];
                };
                var te = clip(lok[ke - 1], lok[ke], A, B);
                while (te[0] === 0 && ke > 1) te = clip(lok[--ke - 1], lok[ke], A, B);
                var tx = clip(lok[kx - 1], lok[kx], A, B);
                while (tx[1] === 1 && kx < lok.length - 1) tx = clip(lok[kx], lok[++kx], A, B);
                var ein = te[0] > 0 ? an(ke, te[0]) : null;
                var aus = tx[1] < 1 ? an(kx, tx[1]) : null;
                var vorn = ein ? pts.slice(0, ke).concat([welt(ein[0], ein[1])]) : [];
                var hinten = aus ? [welt(aus[0], aus[1])].concat(pts.slice(kx)) : [];
                if (!ein || !aus) {
                    pts = vorn.concat(hinten);
                    continue;
                }
                // die Stelle eines Rand-Punkts auf dem Umfang (gegen den Uhrzeiger ab der Ecke −A, −B), die Seite mit dem
                // kleinsten Abstand
                var P = 4 * (A + B);
                var um = function (q) {
                    var d = [Math.abs(q[1] + B), Math.abs(q[0] - A), Math.abs(q[1] - B), Math.abs(q[0] + A)];
                    var m = d.indexOf(Math.min.apply(null, d));
                    return [q[0] + A, 2 * A + q[1] + B, 3 * A + 2 * B - q[0], 4 * A + 3 * B - q[1]][m];
                };
                var ta = um(ein);
                var tb = um(aus);
                var ecken = [[-A, -B, 0], [A, -B, 2 * A], [A, B, 2 * A + 2 * B], [-A, B, 4 * A + 2 * B]];
                var wahl = [1, -1]
                    .map(function (dir) {
                        var mod = function (t) {
                            return (((t - ta) * dir) % P + P) % P;
                        };
                        var ecke = ecken
                            .filter(function (e) {
                                return mod(e[2]) > 0 && mod(e[2]) < mod(tb);
                            })
                            .sort(function (e, g) {
                                return mod(e[2]) - mod(g[2]);
                            });
                        var lauf = [ein].concat(ecke, [aus]);
                        var haeuser = 0;
                        for (var j = 1; j < lauf.length; j++)
                            for (var t = 0; t <= 1; t += 0.125) {
                                var w = welt(lauf[j - 1][0] + (lauf[j][0] - lauf[j - 1][0]) * t, lauf[j - 1][1] + (lauf[j][1] - lauf[j - 1][1]) * t);
                                for (var si = 0; si < plan.slots.length; si++)
                                    if (plan.slots[si].obb && distPunktOBB(w.x, w.z, plan.slots[si].obb) < hw) haeuser++;
                            }
                        return { ecke: ecke, haeuser: haeuser, lang: mod(tb) };
                    })
                    .sort(function (a, b) {
                        return a.haeuser - b.haeuser || a.lang - b.lang;
                    })[0];
                pts = vorn.concat(
                    wahl.ecke.map(function (e) {
                        return welt(e[0], e[1]);
                    }),
                    hinten
                );
            }
            return pts;
        };
        // je Weg der Lauf des Exports (`lauf`, sonst `pts`) um die Fremd-Slots gelegt: { pts, lauf? } — `lauf` nur, wo er weicht
        var gelegt = function (rd, hw) {
            var lauf = Array.isArray(rd.lauf) ? rd.lauf : Array.isArray(rd.pts) ? rd.pts : [];
            var pts = fest.length ? umlegen(lauf, hw) : lauf;
            return pts === lauf ? { pts: lauf } : { pts: pts, lauf: lauf };
        };
        // 2) DIE WEGE (die Straßen der Gassen; die Feldwege folgen dem Grund)
        var profil = []; // [x, z, y, halbe Breite] je profiliertem Weg-Punkt (plan-lokal)
        // DAS NETZ DES PROFILS (siedlung.K5): ein Weg-Punkt sucht seinen gepinnten Nachbarn nur in den Zellen, die seine größte
        // Reichweite (max 1,5 m | halbe Breite) trifft, in der Folge des Profils — dasselbe Urteil wie die Suche über alle
        // Punkte (gleicher Abstand, der erste gewinnt), ohne die quadratische Schleife (nH 300: 1 206 Punkte je Kandidat)
        var profilNetz = new Map();
        var profilR = 0;
        var profilL = 0; // das längste Stück eines profilierten Wegs (die Suche nach dem Lauf reicht über seine halbe Länge)
        var profilZ = function (ix, iz) {
            return (ix + 32768) * 65536 + (iz + 32768);
        };
        var profilSetzen = function (pt) {
            var key = profilZ(Math.floor(pt[0] / 4), Math.floor(pt[1] / 4));
            var lst = profilNetz.get(key);
            if (!lst) profilNetz.set(key, (lst = []));
            var vor = profil[profil.length - 1];
            if (vor && vor[4] === pt[4]) profilL = Math.max(profilL, Math.hypot(pt[0] - vor[0], pt[1] - vor[1]));
            lst.push(profil.length);
            profil.push(pt);
            profilR = Math.max(profilR, 1.5, pt[3]);
        };
        var profilNah = function (x, z, r) {
            var out = [];
            var rz = Math.ceil(r / 4) + 1; // eine Zelle Rand: die Rundung am Zellrand fällt nie aus der Suche
            var ix = Math.floor(x / 4);
            var iz = Math.floor(z / 4);
            for (var a = -rz; a <= rz; a++)
                for (var b = -rz; b <= rz; b++) {
                    var lst = profilNetz.get(profilZ(ix + a, iz + b));
                    if (lst) for (var li = 0; li < lst.length; li++) out.push(lst[li]);
                }
            return out.sort(function (p, q) {
                return p - q;
            });
        };
        var wege = [];
        var roads = Array.isArray(plan.roads) ? plan.roads : [];
        var k;
        var lagen = roads.map(function (r) {
            var b = (isFinite(r.w) ? r.w : 3) / 2;
            return { hw: b, lage: gelegt(r, b) };
        });
        // DIE KREUZUNG (PFLICHT-OFFEN C): wo das Ende eines Wegs auf einem anderen liegt (an dessen Lauf oder Ende binnen seiner
        // halben Breite samt Saum: Kreuzung, Einmündung, Knick), liegt EINE Fläche — jeder Weg-Punkt in ihrer Scheibe und der
        // erste dahinter tragen ihre Höhe. Bis dahin trug jeder Weg dort sein eigenes Profil, und der Erdbau (die letzte Trasse
        // gewinnt, ihr Ende ist rund) legte Stufen von 0,2–0,7 m quer durch die Fahrbahn, an denen jeder Wagen stand. Die Scheibe
        // deckt die Überdeckung der Arme samt Saum (die Ecke zweier Streifen a, b unter dem Winkel θ liegt √(a² + b² +
        // 2ab·|cos θ|) / sin θ fern; fast gerade fort: die halbe Breite), höchstens `kreuzungM`; Scheiben, die sich schneiden,
        // tragen EINE Höhe — die des Platzes, wo eine ihn berührt, sonst die des ersten Wegs durch sie (sein Profil, gekappt im
        // Gefälle: die Fläche liegt auf dem Weg, nie auf einem Grund, den kein Weg erreicht).
        var amLauf = function (P, x, z) {
            var best = { d: Infinity, s: 0, L: 0 };
            var s0 = 0;
            for (var j = 1; j < P.length; j++) {
                var ax = P[j - 1].x;
                var az = P[j - 1].z;
                var dx = P[j].x - ax;
                var dz = P[j].z - az;
                var L2 = dx * dx + dz * dz;
                var L = Math.sqrt(L2);
                var t = L2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)) : 0;
                var d = Math.hypot(x - ax - dx * t, z - az - dz * t);
                if (d < best.d) best = { d: d, s: s0 + t * L, ux: L ? dx / L : 1, uz: L ? dz / L : 0 };
                s0 += L;
            }
            best.L = s0;
            return best;
        };
        // die Stellen: jedes Ende eines Wegs und jeder Schnitt zweier Läufe (zwei Wege, die einander mitten kreuzen; gesucht
        // je Stück nur unter den Stücken späterer Wege in seinen Zellen)
        var huelle = lagen.map(function (l) {
            var P = l.lage.pts;
            var h = { x0: Infinity, z0: Infinity, x1: -Infinity, z1: -Infinity };
            for (var j = 0; j < P.length; j++) {
                h.x0 = Math.min(h.x0, P[j].x - l.hw);
                h.x1 = Math.max(h.x1, P[j].x + l.hw);
                h.z0 = Math.min(h.z0, P[j].z - l.hw);
                h.z1 = Math.max(h.z1, P[j].z + l.hw);
            }
            return h;
        });
        var stellen = [];
        var stuecke = [];
        var stueckNetz = new Map();
        var stueckZellen = function (A, B, f) {
            for (var ix = Math.floor(Math.min(A.x, B.x) / 8); ix <= Math.floor(Math.max(A.x, B.x) / 8); ix++)
                for (var iz = Math.floor(Math.min(A.z, B.z) / 8); iz <= Math.floor(Math.max(A.z, B.z) / 8); iz++) f(profilZ(ix, iz));
        };
        lagen.forEach(function (l, r) {
            var P = l.lage.pts;
            if (P.length < 2) return;
            stellen.push(P[0], P[P.length - 1]);
            for (var j = 1; j < P.length; j++) {
                var id = stuecke.length;
                stuecke.push({ r: r, A: P[j - 1], B: P[j] });
                stueckZellen(P[j - 1], P[j], function (key) {
                    if (!stueckNetz.has(key)) stueckNetz.set(key, []);
                    stueckNetz.get(key).push(id);
                });
            }
        });
        var stempel = new Int32Array(stuecke.length).fill(-1);
        stuecke.forEach(function (sa, ia) {
            stueckZellen(sa.A, sa.B, function (key) {
                var lst = stueckNetz.get(key);
                for (var li = 0; li < lst.length; li++) {
                    var ib = lst[li];
                    var sb = stuecke[ib];
                    if (sb.r <= sa.r || stempel[ib] === ia) continue;
                    stempel[ib] = ia;
                    var rx = sa.B.x - sa.A.x;
                    var rz = sa.B.z - sa.A.z;
                    var qx = sb.B.x - sb.A.x;
                    var qz = sb.B.z - sb.A.z;
                    var den = rx * qz - rz * qx;
                    if (Math.abs(den) < 1e-9) continue;
                    var wx = sb.A.x - sa.A.x;
                    var wz = sb.A.z - sa.A.z;
                    var ta = (wx * qz - wz * qx) / den;
                    var tb = (wx * rz - wz * rx) / den;
                    if (ta >= 0 && ta <= 1 && tb >= 0 && tb <= 1) stellen.push({ x: sa.A.x + rx * ta, z: sa.A.z + rz * ta });
                }
            });
        });
        var kreuzungen = [];
        for (var st = 0; st < stellen.length; st++) {
            var E = stellen[st];
            if (kreuzungen.some(function (q) { return Math.hypot(q.x - E.x, q.z - E.z) < 1; })) continue;
            var arme = [];
            for (var kb = 0; kb < roads.length; kb++) {
                var PB = lagen[kb].lage.pts;
                var hk = huelle[kb];
                if (PB.length < 2 || E.x < hk.x0 - O.saumM || E.x > hk.x1 + O.saumM || E.z < hk.z0 - O.saumM || E.z > hk.z1 + O.saumM) continue;
                var am = amLauf(PB, E.x, E.z);
                if (am.d > lagen[kb].hw + O.saumM) continue;
                var b0 = { ri: kb, hw: lagen[kb].hw, ux: am.ux, uz: am.uz };
                if (am.s > 0.5) arme.push(Object.assign({}, b0, { ux: -am.ux, uz: -am.uz }));
                if (am.s < am.L - 0.5) arme.push(b0);
            }
            if (!arme.some(function (q) { return q.ri !== arme[0].ri; })) continue;
            var R = 0;
            for (var i1 = 0; i1 < arme.length; i1++) {
                R = Math.max(R, arme[i1].hw);
                for (var i2 = i1 + 1; i2 < arme.length; i2++) {
                    if (arme[i1].ri === arme[i2].ri) continue;
                    var co = arme[i1].ux * arme[i2].ux + arme[i1].uz * arme[i2].uz;
                    var si = Math.sqrt(Math.max(0, 1 - co * co));
                    if (si < O.kreuzSinus) continue;
                    var a = arme[i1].hw + O.saumM;
                    var b = arme[i2].hw + O.saumM;
                    R = Math.max(R, Math.sqrt(a * a + b * b + 2 * a * b * Math.abs(co)) / si);
                }
            }
            kreuzungen.push({ x: E.x, z: E.z, R: Math.min(R, O.kreuzungM), g: kreuzungen.length });
        }
        // die Scheiben, die sich schneiden, sind EINE Fläche (die Gruppe `g`, ihre Höhe `kreuzungY[g]`)
        var gruppe = function (g) {
            while (kreuzungen[g].g !== g) g = kreuzungen[g].g;
            return g;
        };
        for (var kc = 0; kc < kreuzungen.length; kc++)
            for (var kd = kc + 1; kd < kreuzungen.length; kd++) {
                var qc = kreuzungen[kc];
                var qd = kreuzungen[kd];
                if (Math.hypot(qc.x - qd.x, qc.z - qd.z) < qc.R + qd.R) kreuzungen[gruppe(kd)].g = gruppe(kc);
            }
        var kreuzungY = {};
        kreuzungen.forEach(function (q) {
            q.g = gruppe(q.g);
            if (imPlatz(q.x, q.z, q.R)) kreuzungY[q.g] = platzY;
        });
        // die Kreuzung eines Weg-Punkts: die nächste Scheibe, in der er liegt — oder sein Nachbar (der erste Punkt dahinter
        // trägt ihre Höhe: die Fläche reicht bis an den Rand der Scheibe); -1 außerhalb
        var kreuzNetz = new Map();
        kreuzungen.forEach(function (q, j) {
            for (var ix = Math.floor((q.x - q.R) / O.kreuzungM); ix <= Math.floor((q.x + q.R) / O.kreuzungM); ix++)
                for (var iz = Math.floor((q.z - q.R) / O.kreuzungM); iz <= Math.floor((q.z + q.R) / O.kreuzungM); iz++) {
                    var key = profilZ(ix, iz);
                    if (!kreuzNetz.has(key)) kreuzNetz.set(key, []);
                    kreuzNetz.get(key).push(j);
                }
        });
        var inKreuzung = function (x, z) {
            var best = -1;
            var bd = Infinity;
            var lst = kreuzNetz.get(profilZ(Math.floor(x / O.kreuzungM), Math.floor(z / O.kreuzungM))) || [];
            for (var li = 0; li < lst.length; li++) {
                var j = lst[li];
                var d = Math.hypot(x - kreuzungen[j].x, z - kreuzungen[j].z);
                if (d <= kreuzungen[j].R && d < bd) {
                    bd = d;
                    best = j;
                }
            }
            return best;
        };
        for (var ri = 0; ri < roads.length; ri++) {
            var rd = roads[ri];
            var hw = lagen[ri].hw;
            var lage = lagen[ri].lage;
            var pts = lage.pts;
            var n = pts.length;
            var sw = [];
            var roh = [];
            var pin = [];
            var offen = []; // [Punkt, Kreuzung] der Kreuzungen ohne Höhe: dieser Weg gibt sie ihnen
            for (k = 0; k < n; k++) {
                sw.push(k ? sw[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].z - pts[k - 1].z) : 0);
                roh.push(H(pts[k].x, pts[k].z));
                pin.push(null);
                if (imPlatz(pts[k].x, pts[k].z, hw)) {
                    pin[k] = platzY;
                    continue;
                }
                var kz = inKreuzung(pts[k].x, pts[k].z);
                if (kz < 0 && k > 0) kz = inKreuzung(pts[k - 1].x, pts[k - 1].z);
                if (kz < 0 && k < n - 1) kz = inKreuzung(pts[k + 1].x, pts[k + 1].z);
                if (kz >= 0) {
                    if (kreuzungY[kreuzungen[kz].g] !== undefined) pin[k] = kreuzungY[kreuzungen[kz].g];
                    else offen.push([k, kz]);
                    continue;
                }
                // WO SICH DIE FLÄCHEN ZWEIER WEGE DECKEN (der Abstand seines Punkts zum Lauf eines früheren Wegs unter beiden
                // halben Breiten samt Säumen, mindestens 1,5 m), trägt der Punkt dessen Höhe — der Lauf zwischen seinen Punkten,
                // nie nur ein Punkt (zwei Wege, die 2–3 m nebeneinander laufen, trugen sonst je ihre Höhe, und der spätere legte
                // Stufen von 0,6 m längs der Fahrbahn)
                var best = Infinity;
                var nah = profilNah(pts[k].x, pts[k].z, profilR + hw + 2 * O.saumM + profilL / 2);
                for (var qi = 0; qi < nah.length; qi++) {
                    var q = nah[qi];
                    for (var qs = -1; qs <= 0; qs++) {
                        var A = profil[q + qs];
                        var B = profil[q + qs + 1];
                        if (!A || !B || A[4] !== B[4]) continue;
                        var bx = B[0] - A[0];
                        var bz = B[1] - A[1];
                        var bl = bx * bx + bz * bz;
                        var bt = bl > 0 ? Math.max(0, Math.min(1, ((pts[k].x - A[0]) * bx + (pts[k].z - A[1]) * bz) / bl)) : 0;
                        var d = Math.hypot(pts[k].x - A[0] - bx * bt, pts[k].z - A[1] - bz * bt);
                        if (d <= Math.max(1.5, A[3] + hw + 2 * O.saumM) && d < best) {
                            best = d;
                            pin[k] = r6(A[2] + (B[2] - A[2]) * bt);
                        }
                    }
                    var d0 = Math.hypot(pts[k].x - profil[q][0], pts[k].z - profil[q][1]);
                    if (d0 <= Math.max(1.5, profil[q][3]) && d0 < best) {
                        best = d0;
                        pin[k] = profil[q][2];
                    }
                }
            }
            // das Welt-Wasser unter dem Weg (ctx.wasserAt, das Brücken-Etikett unten): sein Grund ist das Bett, nie der Weg —
            // die Glättung liest nur trockene Punkte
            var nass = [];
            var trocken = 0;
            for (k = 0; k < n; k++) {
                nass.push(!!(ctx.wasserAt && ctx.wasserAt(ox + pts[k].x, oz + pts[k].z)));
                if (!nass[k]) trocken++;
            }
            var ys = [];
            for (k = 0; k < n; k++) {
                if (pin[k] !== null) {
                    ys.push(pin[k]);
                    continue;
                }
                var sum = 0;
                var cnt = 0;
                for (var m = 0; m < n; m++)
                    if (Math.abs(sw[m] - sw[k]) <= O.glaettM && (!nass[m] || !trocken)) {
                        sum += roh[m];
                        cnt++;
                    }
                // ein nasser Punkt, dessen Fenster nur Wasser sieht, hat noch keine Höhe: das Brücken-Deck unten gibt sie ihm
                ys.push(cnt ? sum / cnt : null);
            }
            // das Gefälle gekappt gegen den letzten Punkt MIT Höhe (eine Spanne ohne Höhe trägt die Brücke, nie ein NaN)
            var kappen = function () {
                var pv = -1;
                for (k = 0; k < n; k++) {
                    if (ys[k] === null) continue;
                    if (pin[k] === null && pv >= 0) {
                        var g = O.gefaelle * (sw[k] - sw[pv]);
                        ys[k] = Math.min(ys[pv] + g, Math.max(ys[pv] - g, ys[k]));
                    }
                    pv = k;
                }
                pv = -1;
                for (k = n - 1; k >= 0; k--) {
                    if (ys[k] === null) continue;
                    if (pin[k] === null && pv >= 0) {
                        var g2 = O.gefaelle * (sw[pv] - sw[k]);
                        ys[k] = Math.min(ys[pv] + g2, Math.max(ys[pv] - g2, ys[k]));
                    }
                    pv = k;
                }
            };
            kappen();
            // die Kreuzungen ohne Höhe (in der Folge des Wegs) tragen die dieses Wegs an seinem Punkt nächst ihrer Mitte —
            // gekappt in das Gefälle zu den festen Punkten davor und danach (die Fläche liegt, wo der Weg sie erreicht: bis
            // dahin hob die Scheibe am Ende eines Hangs den Weg vor ihr, und an der Platte des Platzes riss eine Stufe von 1,4 m);
            // dann trägt der Weg sie über die ganze Scheibe, gekappt wie jede Höhe
            if (offen.length) {
                var scheiben = [];
                offen.forEach(function (o) {
                    var q = kreuzungen[o[1]];
                    var d = Math.hypot(pts[o[0]].x - q.x, pts[o[0]].z - q.z);
                    var sch = scheiben.filter(function (c) {
                        return c.g === q.g;
                    })[0];
                    if (!sch) scheiben.push((sch = { g: q.g, k: [], d: Infinity, y: null }));
                    sch.k.push(o[0]);
                    if (ys[o[0]] !== null && d < sch.d) [sch.d, sch.y] = [d, ys[o[0]]];
                });
                scheiben.forEach(function (sch) {
                    if (sch.y === null) return;
                    var a = Math.min.apply(null, sch.k);
                    var b = Math.max.apply(null, sch.k);
                    var lo = -Infinity;
                    var hi = Infinity;
                    for (var ip = a - 1; ip >= 0; ip--)
                        if (pin[ip] !== null) {
                            lo = pin[ip] - O.gefaelle * (sw[a] - sw[ip]);
                            hi = pin[ip] + O.gefaelle * (sw[a] - sw[ip]);
                            break;
                        }
                    for (var iq = b + 1; iq < n; iq++)
                        if (pin[iq] !== null) {
                            lo = Math.max(lo, pin[iq] - O.gefaelle * (sw[iq] - sw[b]));
                            hi = Math.min(hi, pin[iq] + O.gefaelle * (sw[iq] - sw[b]));
                            break;
                        }
                    kreuzungY[sch.g] = r6(lo <= hi ? Math.min(hi, Math.max(lo, sch.y)) : (lo + hi) / 2);
                    sch.k.forEach(function (kk) {
                        pin[kk] = ys[kk] = kreuzungY[sch.g];
                    });
                });
                kappen();
            }
            // zwischen zwei festen Punkten, die das Gefälle nicht verbindet (zwei Flächen, deren Höhe andere Wege setzten),
            // steigt der Weg gleichmäßig — nie eine Stufe am Rand der einen
            for (var p0 = -1, p1 = 0; p1 < n; p1++) {
                if (pin[p1] === null) continue;
                if (p0 >= 0 && p1 > p0 + 1 && Math.abs(pin[p1] - pin[p0]) > O.gefaelle * (sw[p1] - sw[p0]))
                    for (var pm = p0 + 1; pm < p1; pm++)
                        if (ys[pm] !== null) ys[pm] = pin[p0] + ((pin[p1] - pin[p0]) * (sw[pm] - sw[p0])) / (sw[p1] - sw[p0]);
                p0 = p1;
            }
            // DAS BRÜCKEN-ETIKETT: wo der Weg Welt-Wasser kreuzt (ctx.wasserAt), trägt er eine Brücke — ihr Deck spannt gerade
            // von Widerlager zu Widerlager (den trockenen Punkten davor und danach), unter ihr legt der Erdbau keine Trasse, und
            // ein FREI-Splat hält den Grund unter der Spanne samt brueckeM je Seite unberührt (der Weg staut das Wasser nicht).
            var bruecken = [];
            var laeufe = nasseLaeufe(nass);
            for (var li = 0; li < laeufe.length; li++) {
                k = laeufe[li].k;
                var e = laeufe[li].e;
                var wa = laeufe[li].wa;
                var wb = laeufe[li].wb;
                var ya = nass[wa] ? ys[wb] : ys[wa];
                var yb = nass[wb] ? ya : ys[wb];
                for (var m2 = k; m2 <= e; m2++) ys[m2] = sw[wb] > sw[wa] ? ya + ((yb - ya) * (sw[m2] - sw[wa])) / (sw[wb] - sw[wa]) : ya;
                bruecken.push([wa, wb]);
                var mx = (pts[wa].x + pts[wb].x) / 2;
                var mz = (pts[wa].z + pts[wb].z) / 2;
                var phiB = Math.atan2(-(pts[wb].z - pts[wa].z), pts[wb].x - pts[wa].x);
                freiSplats.push({
                    art: "frei",
                    cx: r6(ox + mx),
                    cz: r6(oz + mz),
                    phi: r6(phiB),
                    ex: r6(Math.hypot(pts[wb].x - pts[wa].x, pts[wb].z - pts[wa].z) / 2),
                    ez: r6(hw + O.brueckeM),
                });
            }
            for (k = 0; k < n; k++) {
                ys[k] = r6(ys[k]);
                profilSetzen([pts[k].x, pts[k].z, ys[k], hw, ri]);
            }
            // je Strecke ZWEI Trassen derselben Höhe: der Saum (Weg + saumM je Seite) liegt unter den Grundrissen, der Weg selbst
            // über ihnen — kein Haus-Saum liegt auf der Gasse, kein Weg-Saum unter einer Wand; eine Strecke an der Brücke trägt keine
            for (k = 1; k < n; k++)
                if (!nass[k - 1] && !nass[k])
                for (var tier = 0; tier < 2; tier++)
                    (tier ? wegKerne : wegSaeume).push({
                        art: "trasse",
                        x0: r6(ox + pts[k - 1].x),
                        z0: r6(oz + pts[k - 1].z),
                        y0: ys[k - 1],
                        x1: r6(ox + pts[k].x),
                        z1: r6(oz + pts[k].z),
                        y1: ys[k],
                        w: r6(2 * (hw + (tier ? 0 : O.saumM))),
                        weg: 2 * ri + tier, // die Strecken EINES Wegs: unter ihnen trägt die nächste Mitte (gelaende-core erdbauY)
                    });
            var weg = Object.assign({}, rd, lage, bruecken.length ? { ys: ys, bruecken: bruecken } : { ys: ys });
            if (!lage.lauf) delete weg.lauf;
            wege.push(weg);
        }
        if (platzY !== null)
            erdbau.push({
                art: "platte",
                cx: r6(ox + pz.cx),
                cz: r6(oz + pz.cz),
                phi: r6(pz.phi || 0),
                ex: r6(pz.ex + O.saumM),
                ez: r6(pz.ez + O.saumM),
                y: platzY,
            });
        // DIE FLÄCHE der Wege und des Platzes, wie die Gelände-Funktion sie trägt (ctx.flaeche: der Erdbau-Term des Gesetzbuchs
        // über diesen Splats — auf einer Fläche ihre Höhe, sonst null): das Haus und die Laterne lesen die Höhe, auf die ein Fuß
        // tritt, nie eine eigene Rechnung des Erdbaus.
        var auf = ctx.flaeche(wegSaeume.concat(wegKerne, erdbau));
        // der Weg selbst (die Kerne und der Platz ohne Saum): bis an ihn reicht der Boden des Vorplatzes (`vorplatzBoden`)
        var platzKern = platzY === null ? [] : [{ art: "platte", cx: r6(ox + pz.cx), cz: r6(oz + pz.cz), phi: r6(pz.phi || 0), ex: r6(pz.ex), ez: r6(pz.ez), y: platzY }];
        var aufWeg = ctx.flaeche(wegKerne.concat(platzKern));
        var hausPlatten = [];
        var vorplaetze = [];
        var aufY = function (x, z) {
            var y = auf(ox + x, oz + z);
            return y !== null && isFinite(y) ? r6(y) : null;
        };
        // 3) DIE HÄUSER: zuerst jedes Haus an seiner Gasse (die Höhe der Fläche, wo der Gang aus der Tür sie betritt); dann die HOF-Häuser (die Scheune hinter
        //    dem Wohnhaus — vor ihrer Tür liegt kein Weg, sondern der Grund eines Nachbarn): sie stehen auf der Höhe der ersten
        //    gesetzten Fläche, die ihr Blick aus der Tür trifft (der Hof ist EIN Niveau), bis keines mehr dazukommt; der Rest
        //    auf dem Median seines Grundrisses.
        var vorne = function (sl, lz) {
            var c = Math.cos(sl.phi || 0);
            var s = Math.sin(sl.phi || 0);
            return [sl.x + sl.tuer.x * c + lz * s, sl.z - sl.tuer.x * s + lz * c];
        };
        var hatTuer = function (sl) {
            return !!(sl.tuer && isFinite(sl.tuer.x) && isFinite(sl.tuer.z));
        };
        // DER EINGANG, den der Gang von der Gasse betritt (`eingangVon`): vor ihm liegt der Vorplatz — je Slot EINMAL gerechnet
        // (die Parameter des Hauses, `hausParams`, mischte jeder Schritt der Vorplatz-, Gassen- und Hof-Suche neu: bis 80 je Slot)
        var eingaenge = new Map();
        var eingang = function (sl) {
            var e = eingaenge.get(sl);
            if (!e) eingaenge.set(sl, (e = eingangVon(sl)));
            return e;
        };
        var wasserAm = function (x, z) {
            return !!(ctx.wasserAt && ctx.wasserAt(ox + x, oz + z));
        };
        var ps = [];
        var wasserSlots = 0;
        // DIE NUMMER JEDES SLOTS IM ORTPLAN (K66-2 N1): was eine Nummer in plan.slots trägt (die Wandlaterne ihr Haus, `slot`),
        // folgt ihr hier — ein nasser Slot fällt, seine Nachfolger rücken auf (-1: das Wasser nahm ihn). Bis N1 reiste die
        // Nummer des v1-Plans ungerührt: die Welt hob die Wandlaterne mit einem fremden Haus 8–14 m weiter, die eines nassen
        // Hauses hing vor einer Wand, die es nicht gab.
        var neuSi = [];
        for (var si0 = 0; si0 < plan.slots.length; si0++)
            if (slotImWasser(plan.slots[si0], wasserAm, eingang)) {
                wasserSlots++;
                neuSi.push(-1);
            } else {
                neuSi.push(ps.length);
                ps.push(plan.slots[si0]);
            }
        var NS = ps.length;
        var hy = [];
        var gasseAb = []; // so weit vor dem Eingang beginnt die Fläche, die der Gang betritt (null: keine Gasse vor der Tür)
        var grunde = [];
        for (var si = 0; si < NS; si++) {
            var sl = ps[si];
            var ob = sl.obb;
            grunde.push(ob ? rechteck(ob.cx, ob.cz, ob.phi || 0, ob.ex, ob.ez) : [H(sl.x, sl.z)]);
            var y0 = null;
            if (hatTuer(sl)) {
                // der erste Meter der Fläche, die der Gang betritt (ihr Median: eine Naht zweier Wege gleich hinter dem Vorplatz
                // teilt sich in zwei kleine Stufen statt einer großen)
                var tritt = [];
                for (var t0 = O.vorplatzM; t0 <= O.vorplatzM + O.gasseM; t0 += 0.25) {
                    var va = vorne(sl, eingang(sl).z - t0);
                    var ya = aufY(va[0], va[1]);
                    if (ya !== null) tritt.push([t0, ya]);
                    if (tritt.length && t0 >= tritt[0][0] + 1) break;
                }
                if (tritt.length)
                    y0 = r6(
                        median(
                            tritt.map(function (p) {
                                return p[1];
                            })
                        )
                    );
            }
            hy.push(y0);
            gasseAb.push(y0 !== null ? tritt[0][0] : null);
        }
        var inPlatte = function (x, z, ob) {
            var c = Math.cos(ob.phi || 0);
            var s = Math.sin(ob.phi || 0);
            var dx = x - ob.cx;
            var dz = z - ob.cz;
            return Math.abs(dx * c - dz * s) <= ob.ex + O.saumM && Math.abs(dx * s + dz * c) <= ob.ez + O.saumM;
        };
        for (var neu = true; neu; ) {
            neu = false;
            for (si = 0; si < NS; si++) {
                if (hy[si] !== null || !hatTuer(ps[si])) continue;
                for (var t = O.vorplatzM; t <= O.vorplatzM + O.gasseM && hy[si] === null; t += 0.5) {
                    var v1 = vorne(ps[si], eingang(ps[si]).z - t);
                    for (var sj = 0; sj < NS; sj++)
                        if (sj !== si && hy[sj] !== null && ps[sj].obb && inPlatte(v1[0], v1[1], ps[sj].obb)) {
                            hy[si] = hy[sj];
                            neu = true;
                            break;
                        }
                }
            }
        }
        var slots = [];
        for (si = 0; si < NS; si++) {
            sl = ps[si];
            ob = sl.obb;
            var tu = sl.tuer;
            var grund = grunde[si];
            // DER BODEN DES HAUSES: die Höhe seiner Gasse, ohne Gasse der Median seines Grundrisses — das gesetzte Haus
            // (`slotPlan`) bringt seinen Boden mit (`sl.y`, wohin der Spieler es setzte; ein Slot des Exports trägt keinen)
            var y = isFinite(sl.y) ? r6(sl.y) : hy[si] !== null ? hy[si] : r6(median(grund));
            var spanne = 0;
            for (k = 0; k < grund.length; k++) spanne = Math.max(spanne, Math.abs(grund[k] - y));
            var hang = spanne <= O.hangPlattform ? "plattform" : spanne <= O.hangHanghaus ? "hanghaus" : "stelzen";
            // DIE PLATTE DES HAUSES (K10): seine obb mit Saum — der ganze Umriss (Dach, Treppe, Vordach) steht auf EINER Höhe
            if (ob)
                hausPlatten.push({
                    art: "platte",
                    cx: r6(ox + ob.cx),
                    cz: r6(oz + ob.cz),
                    phi: r6(ob.phi || 0),
                    ex: r6(ob.ex + O.saumM),
                    ez: r6(ob.ez + O.saumM),
                    y: y,
                });
            // DER GRUND DES HAUSES (S4): die Platten aus ALLEN Boxen seines Körper-Satzes samt Keller (`grundVon` im Slot), im
            // Rahmen des Hauses, auf derselben Höhe — der Erdbau `grund` (gelaende-core) schneidet den gezeichneten Boden, wo das
            // Haus seinen Boden zeichnet, hält den Keller hohl und nennt der Wiese den Grund; die Höhe trägt er unter der obb nur
            // mit (ein gesetztes Haus ohne obb trägt sie allein)
            var gd = sl.grund && sl.grund.boxen && sl.grund.boxen.length ? sl.grund : null;
            if (gd) {
                var gex = 0;
                var gez = 0;
                for (k = 0; k < gd.boxen.length; k++) {
                    gex = Math.max(gex, Math.abs(gd.boxen[k][0]), Math.abs(gd.boxen[k][1]));
                    gez = Math.max(gez, Math.abs(gd.boxen[k][2]), Math.abs(gd.boxen[k][3]));
                }
                hausPlatten.push({
                    art: "grund",
                    cx: r6(ox + sl.x),
                    cz: r6(oz + sl.z),
                    phi: r6(sl.phi || 0),
                    ex: r6(gex + O.saumM),
                    ez: r6(gez + O.saumM),
                    saum: O.saumM,
                    y: y,
                    boxen: gd.boxen,
                    keller: gd.keller || null,
                });
            }
            if (hatTuer(sl) && isFinite(tu.w)) {
                var ein = eingang(sl);
                // DER VORPLATZ REICHT BIS ZUR GASSE (K10-6): beginnt die Fläche, deren Höhe das Haus trägt, erst hinter dem
                // Vorplatz, lag dazwischen ein Streifen ohne Fläche — dort griff die Böschung eines höheren Nachbarn (Auto-Dorf
                // der Zelle −4,−4, ein Stelzen-Haus: Vorplatz 78,74 → 79,01 → Gasse 78,46, ein Absatz von 0,55 m vor der Tür)
                var tief = gasseAb[si] !== null ? Math.max(O.vorplatzM, gasseAb[si]) : O.vorplatzM;
                var vf = vorplatzFlaeche(sl, tief);
                // der Saum der Gasse, den der Gang von der Platte bis an den Weg quert (K66, die Marke `vorplatz`; 0 ohne Gasse)
                var saumG = 0;
                if (gasseAb[si] !== null)
                    for (var tq = tief; tq <= tief + O.gasseM; tq += 0.1) {
                        var vq = vorne(sl, ein.z - tq);
                        if (aufWeg(ox + vq[0], oz + vq[1]) !== null) {
                            saumG = tq - tief;
                            break;
                        }
                    }
                vorplaetze.push({
                    art: "platte",
                    cx: r6(ox + vf.cx),
                    cz: r6(oz + vf.cz),
                    phi: r6(vf.phi),
                    ex: r6(vf.ex),
                    ez: r6(vf.ez),
                    y: r6(y + ein.y / 2),
                    vorplatz: r6(saumG),
                });
            }
            slots.push(Object.assign({}, sl, { y: y, hang: hang }));
        }
        // 4) DIE LATERNEN stehen auf ihrem Weg (sonst auf dem Grund); die Wandlaterne hängt an ihrem Haus: sie trägt seine Nummer
        // im Ortplan (`neuSi`) und fällt mit ihm ins Wasser
        var laternen = (Array.isArray(plan.laternen) ? plan.laternen : [])
            .filter(function (l) {
                return !l.wand || neuSi[l.slot] >= 0;
            })
            .map(function (l) {
                var yl = aufY(l.x, l.z);
                var y1 = { y: yl === null ? r6(H(l.x, l.z)) : yl };
                return Object.assign({}, l, l.wand ? { slot: neuSi[l.slot], y: y1.y } : y1);
            });
        var v2 = Object.assign({}, plan, {
            version: 2,
            ort: { x: ox, z: oz },
            slots: slots,
            roads: wege,
            platz: platzY === null ? plan.platz : Object.assign({}, pz, { y: platzY }),
            laternen: laternen,
            // DIE REIHENFOLGE DER FLÄCHEN (die letzte gewinnt, wo sie sich decken): die Säume der Wege, die Grundrisse, die Wege
            // selbst und der Platz (der Gang bleibt durchgehend, kein Saum eines Nachbarn liegt auf der Gasse), zuletzt die
            // Vorplätze (die Stufe vor der Tür liegt auf allem)
            erdbau: wegSaeume.concat(hausPlatten, wegKerne, erdbau, vorplaetze, freiSplats),
        });
        // die Slots, die das Wasser nahm (der Leser zählt das Dorf ehrlich: geplant = stehend + im Wasser gefallen)
        if (wasserSlots) v2.wasserSlots = wasserSlots;
        // die Feldwege weichen den Fremd-Slots wie die Gassen (sie tragen kein Profil); `fest`: die Fremd-Slots, denen ein Weg wich
        var fw0 = Array.isArray(plan.feldwege) ? plan.feldwege : [];
        if (fest.length || fw0.some(function (fw) { return fw.lauf; }))
            v2.feldwege = fw0.map(function (fw) {
                var weg = Object.assign({}, fw, gelegt(fw, (isFinite(fw.w) ? fw.w : 3) / 2));
                if (!weg.lauf || weg.pts === weg.lauf) delete weg.lauf;
                return weg;
            });
        if (festGetroffen.length) v2.fest = festGetroffen;
        // DER VERKEHR DER STADT (`verkehrsBoden`): das Netz der Wagen und seine Wenden als Boden des Plans — zuletzt im Erdbau
        if (verkehrVon(v2).n) {
            var vb = verkehrsBoden(v2, ox, oz, ctx, auf);
            v2.verkehr = vb.netz;
            v2.erdbau = v2.erdbau.concat(vb.erdbau);
        }
        return v2;
    }

    // ── KAMIN-RAUCH (.105/.106) — Partikel-Feel als DATEN: Host + Lab lesen
    //    denselben Block (worlds/fachwerk frame fail-soft; residual = rich VFX).
    var RAUCH_GESETZ = {
        maxTeilchen: 26,
        spawnChance: 0.3,
        vyBase: 0.014,
        vyRange: 0.012,
        dxSpread: 0.006,
        fade: 0.0035,
        a0: 0.55,
        aKill: 0.03,
        size: 0.34,
        color: 0xb9bec6,
        scaleMul: 1.006,
    };

    // RAUCH_VIS — intentional box-feel (Feel-Entscheid .125). Do NOT Fake-full-VFX.
    // lab+host "box-lambert" = RAUCH_GESETZ BoxGeometry + MeshLambert. Sprites/noise/wind = Redesign.
    // Like STEER_VIS .124 / ZONE_PICK .117: naming the Feel, not Fake-zu.
    var RAUCH_VIS = {
        lab: "box-lambert",
        host: "box-lambert",
    };


    // ── BEGEHUNG (.166) — Lab Ego-Begehung (Fachwerk walk) als DATEN.
    //    G=20 is Lab arcade walk gravity — NOT ARENA.g 9.81 / FAHR.G 9.8 / Host state.gravity
    //    (named dual — do not Fake-align).
    // V18.491.166
    var BEGEH_GESETZ = {
        radius: 0.3,
        playerH: 1.7,
        eyeY: 1.62,
        step: 0.46,
        g: 20,
        jumpVy: 6.0,
    };

    // BEGEH_VIS — intentional Lab walk g dual (Feel-Entscheid .171). Do NOT Fake-align.
    // lab:"g-20" = BEGEH_GESETZ.g arcade Ego-Begehung. Not ARENA.g 9.81 / FAHR.G 9.8 / Host state.gravity.
    // Like FLUG_VIS .169 / G_VIS .150: naming the Feel, not Fake-zu.
    var BEGEH_VIS = { lab: "g-20", host: "world-g-dual" };

    // ── TAGESZEITEN (.228) — Lab Fachwerk dayparts als DATEN.
    // V18.491.228 Lab Fachwerk Tageszeiten; Host none (ZEIT_VIS).
    // Do NOT Fake-merge Host sky/fog / foundry HIMMEL_GESETZ.
    var ZEIT_GESETZ = {
        mittag: { p: [24, 34, 16], c: 0xfff1dc, i: 2.1, h: 0.62, a: 0.22, bg: 0x9fb2c4 },
        morgen: { p: [34, 14, 20], c: 0xffd9a8, i: 1.7, h: 0.55, a: 0.26, bg: 0xc8baa0 },
        abend:  { p: [-32, 12, -14], c: 0xff9a55, i: 1.45, h: 0.48, a: 0.22, bg: 0xb0876a },
        nacht:  { p: [-16, 22, -10], c: 0x9fb6e0, i: 0.32, h: 0.16, a: 0.12, bg: 0x161d2c },
    };

    // ZEIT_VIS — intentional Lab dayparts (Feel-Entscheid .228). Host: das Licht (K11).
    // lab:"dayparts-4" = ZEIT_GESETZ mittag/morgen/abend/nacht (Sonne, Himmel, Nebel bleiben Lab-lokal). Herdfeuer und
    // Fenster-Glut liest der Wirt aus LICHT_GESETZ (Zeitplan `zeit` auf der Tag-Achse der Welt, `_lichtZeitplan`).
    var ZEIT_VIS = { lab: "dayparts-4", host: "licht" };

    // ── EXPLODE-Y (.229) — Lab Fachwerk subsystem explode Y offsets als DATEN.
    // V18.491.229 Lab Fachwerk explode-Y offsets; Host none (EXPL_VIS).
    // Do NOT Fake-merge Host; ORDER/LABEL stay Lab UI-local.
    var EXPL_GESETZ = {
        fundament: -1.2,
        geruest: 0,
        riegel: 0.15,
        streben: 0.3,
        zimmermann: 0.3,
        gefache: 0.55,
        giebel: 1.6,
        dachwerk: 3.0,
        dachdeckung: 4.4,
        boeden: 0.9,
        innenwaende: 0.5,
        herd: 0.25,
        treppe: 0.35,
        tueren: 0.15,
        fenster: 0.35,
        moebel: 0.7,
        anbau: 0.0,
        balkon: 0.6,
        kuppel: 4.4,
        portikus: 0.2,
        hof: 0.1,
        dachAlt: 4.4,
        arkade: 0.3,
        turm: 0.0,
        zinnen: 5.0,
        veranda: 0.4,
        vorkragung: 0.7,
        pilotis: -1.5,
        terrasse: 5.5,
        rundbau: 0.0,
    };

    // EXPL_VIS — intentional Lab explode-Y table (Feel-Entscheid .229). Host none.
    // lab:"explode-y-30" = EXPL_GESETZ 30 subsystem Y offsets.
    var EXPL_VIS = { lab: "explode-y-30", host: "none" };



    // W8 — die Gestalten je Rezept (B2c): JEDER Stil trägt GESTALTEN_JE_REZEPT Individuen (ein neuer Stil zählt mit);
    // die Ausstattung zählt ihre eigenen (AUSSTATTUNG[id].gestalten — wenige, die Instanzen teilen sich die Draws).
    for (var _gid in PRESETS)
        PORTAL_RENDER_CONFIG.lod.budget.gestalten[_gid] = (AUSSTATTUNG[_gid] || WERKE[_gid] || {}).gestalten || GESTALTEN_JE_REZEPT;

    // ── Der Namensraum (Vertrag v1.1 §7): Manifest-Blöcke + Bau-Vokabular ──
    root.__fachwerkCore = {
        VERSION: VERSION,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        PORTAL_RENDER_CONFIG: PORTAL_RENDER_CONFIG,
        PRESETS: PRESETS,
        PARAMS_BY_KIND: { haus: PARAMS, ausstattung: AUS_PARAMS, bank: BANK_PARAMS, leiter: LEITER_PARAMS, bruecke: BRUECKE_PARAMS },
        buildInstance: buildInstance,
        // B7 — die Wirts-Zeilen der Werke (Bank, Leiter): Bauplan-Namensraum und Substanz in den Maßen der Gestalt
        KIND_POLICY: KIND_POLICY,
        WERKE: WERKE,
        // DIE AUSSTATTUNG (Feuerstelle · Marktstand · Brunnen) — das Labor-Dorf baut seine Brunnen und Stände hierüber
        AUSSTATTUNG: AUSSTATTUNG,
        // N5.7 — der Settlement-Export + die Dorf-Quelle (Shell-Aliasse lesen sie)
        exportSettlement: exportSettlement,
        ortPlan: ortPlan, // K10 — der Plan v2 auf der Gelände-Funktion (der Wirt reicht ctx.hoeheAt)
        ortImWasser: ortImWasser, // siedlung.K5 — nimmt das Wasser am Ort ein Haus? (die Ort-Wahl ohne den Plan)
        festWeg: festWeg, // bauen.K2 — betritt ein Weg des Plans v2 die Platte eines gesetzten Hauses? (der Wirt rechnet dann neu)
        ORT_GESETZ: ORT_GESETZ,
        RAUCH_GESETZ: RAUCH_GESETZ,
        RAUCH_VIS: RAUCH_VIS,
        BEGEH_GESETZ: BEGEH_GESETZ,
        BEGEH_VIS: BEGEH_VIS,
        ZEIT_GESETZ: ZEIT_GESETZ,
        ZEIT_VIS: ZEIT_VIS,
        // K11 — das Leuchtquellen-Gesetz (Labor und Welt lesen dasselbe Datum)
        LICHT_GESETZ: LICHT_GESETZ,
        BOGEN_GESETZ: BOGEN_GESETZ,
        vorplatzFlaeche: vorplatzFlaeche,
        vorplatzBoden: vorplatzBoden,
        eingangVon: eingangVon,
        lichtFlackern: lichtFlackern,
        // K11b — die Farbe aus der Farbtemperatur, der Abfall 1/d² mit Kern und Saum (die Welt rechnet ihn im Stoff)
        lichtFarbe: lichtFarbe,
        lichtAbfall: lichtAbfall,
        EXPL_GESETZ: EXPL_GESETZ,
        EXPL_VIS: EXPL_VIS,
        // U6c — die drei gewanderten Lab-Gesetze (buildDorf + exportSettlement rufen sie)
        reihenSnap: reihenSnap,
        wandLaternen: wandLaternen,
        brunnenWeicht: brunnenWeicht,
        LICHT_MARKE_M: LICHT_MARKE_M, // das Soll des Dorf-Lichts je Meter Weg (K66-2 N1; Leser gate:settlement DORF-LICHT)
        brandwand: brandwand,
        metaParams: metaParams,
        LEUTE_GESETZ: LEUTE_GESETZ, // die Leute eines Hauses (Meisterkarte mensch.K1; Leser: der Wirt, gate:kreatur-takt bewohner)
        leuteVon: leuteVon,
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
        // siedlung.K2 — das Rang-Gesetz (die Zelle, die Größe, die Reichweite), die Größe je Klasse und die Mauer der Stadt
        siedlungsZelle: siedlungsZelle,
        trasseRahmen: trasseRahmen, // siedlung.K3 — der Rahmen des Höhen-Rasters um einen Ort (der Wirt füllt ihn aus gelaende-core hoehenRaster)
        hoeheAusRaster: hoeheAusRaster, // siedlung.K3 — der EINE Leser des Rasters (Export, Labor, Linse)
        wegZwischen: wegZwischen, // fahrzeug.K2 — der Feldweg zwischen zwei Orten des Wegenetzes, dem Grund folgend (`trasseLenk`)
        wegeNetz: wegeNetz, // fahrzeug.K2 — das Wege-Netz eines Plans samt den Nähten, die es zu EINEM Netz schließen
        VERKEHR_GESETZ: VERKEHR_GESETZ, // PFLICHT-OFFEN C — der Verkehr der Stadt (Wagen je Häuser, halbe Breite, der Platz)
        verkehrVon: verkehrVon, // PFLICHT-OFFEN C — wie viele Wagen eine Siedlung fährt und aus welchen Häusern ihre Fahrer kommen
        verkehrsNetz: verkehrsNetz, // PFLICHT-OFFEN C — das Netz der Wagen: die zweispurigen Trassen, ihre Kreuzungen, Spuren, Wenden und Plätze
        planSperren: planSperren, // fahrzeug.K2 — was einem Weg im Plan im Weg steht (Grundrisse und Tritte, um die halbe Wagen-Breite)
        BRUECKE_GESETZ: BRUECKE_GESETZ, // fahrzeug.K2 — die Jochbrücke des Wegs (Feld, lichte Breite, Geländer, Pfahl, Einbindung)
        nasseLaeufe: nasseLaeufe, // fahrzeug.K2 — die nassen Läufe eines Wegs und ihre Widerlager (Gasse und Feldweg)
        brueckenAmWeg: brueckenAmWeg, // fahrzeug.K2 — die Spannen der Brücken eines Wegs (der Feldweg zwischen zwei Orten)
        brueckenFelder: brueckenFelder, // fahrzeug.K2 — die Jochfelder einer Spanne (der Wirt legt sie als Werke)
        wegUeberBruecken: wegUeberBruecken, // fahrzeug.K2 — der Weg über dem Wasser auf der Achse seiner Brücke (Netz und Feldweg)
        siedlungsGroesse: siedlungsGroesse,
        siedlungsReich: siedlungsReich,
        siedlungsEpoche: siedlungsEpoche,
        GROESSE_N: GROESSE_N,
        STADTMAUER: STADTMAUER,
        EPOCHEN: EPOCHEN,
        zeitachse: zeitachse, // die Epochen einer Region nach dem Jahr (siedlung.K4; Leser: DORF, gate:settlement J)
        epocheBei: epocheBei, // die Epoche eines Jahrs (Tracht, Kirche; Leser: DORF, gate:settlement J)
        epocheImJahr: epocheImJahr, // die Epoche des Jahrs eines Satzes (Leser: der Wirt, „dorf … 1560")
        MAUER_BIS: MAUER_BIS, // bis zu diesem Jahr steht die Mauer der Stadt (Leser: gate:settlement J)
        WACHSTUM: WACHSTUM, // das Wachstum in Spielzeit (Staffel 2; Leser: der Wirt, gate:settlement W)
        wachstum: wachstum,
        REGION_HIST: REGION_HIST,
        // Vertrags-/Paritäts-Fläche (der Gate komponiert die Lab-Pfade selbst)
        LAB_SEED: LAB_SEED,
        hausParams: hausParams,
        massBau: massBau,
        grundVon: grundVon, // das Grund-Datum (S4) — die Linse liest es wie die Welt
        slotPlan: slotPlan, // das gesetzte Haus als Ein-Slot-Plan (bauen.K2) — der Wirt rechnet daraus den Plan v2 und legt dessen Erdbau
        chimneyTipFromParams: chimneyTipFromParams,
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
        MASSNUR: MASSNUR,
        LOD1F: LOD1F,
        _colFor: _colFor,
        _noise01: _noise01,
        bakeHaus: bakeHaus,
        bakeLOD: bakeLOD,
        wandTonAus: wandTonAus,
        sichtTon: sichtTon,
        stapelBau: stapelBau,
        fensterFern: fensterFern,
        fensterSchlaeft: fensterSchlaeft,
        fpVon: fpVon,
        lod2Koerper: lod2Koerper,
        // DER FERNKÖRPER (S3): die EINE Hüllen-Form — die Liste, ihr Gitter (Stufe 3), die Massen, der Beipack
        huelle: huelle,
        koerperListe: koerperListe,
        huelleVonBau: huelleVonBau,
        stufeWirft: stufeWirft,
        huelleGeoms: huelleGeoms,
        masseVon: masseVon,
        KOERPER_INNEN: KOERPER_INNEN,
        mischeGeoms: mischeGeoms,
        hofFuer: hofFuer,
        fragFuer: fragFuer,
    };
})(typeof self !== "undefined" ? self : globalThis);
