// AnazhRealm — porta-core.js: DER TOR-STUDIO-KERN (Studio-Vertrag Phase 2, der ε-BEWEIS).
// Die generative Substanz des Porta-Labors (worlds/portale/porta.js — PORTA ·
// ORDNUNGEN + FRAKTAL): die sieben Tor-Ordnungen · die Stich→Schub→Dicke-Lehre
// (deriveGate) · der EINE Builder (Strategien Mauerwerk/Geflecht/Monolith/Filigran
// × zurückweichende Ordnungen) · Türen E/R · Fundament-Vokabular. Byte-treu aus
// dem Schöpfer-Werk extrahiert (Zeilen-Slices, Paritäts-Hash-bewiesen) — die
// Shell UND AnazhRealm lesen DIESE eine Quelle (G2.1), ein Nachbau ist verboten.
//
// FORM (Vertrag v1.1 §7 N7.2): namespaced IIFE __portaCore — jeder WEITERE Kern
// einer Laufzeit trägt keine Top-Level-Globals (const-Kollision mit foundry-core
// STUDIO_VERTRAG/PORTAL_RENDER_CONFIG/PRESETS im selben Worker). Die Manifest-
// Blöcke (B1 PRESETS · B2 buildInstance+kindStages · B4 PARAMS · STUDIO_VERTRAG)
// leben unter dem Namensraum, namens- und formgleich zu §3; der Validator
// (gate:studio-vertrag) mappt per Manifest-ns — exakt die vehicle-core-Form.
//
// DETERMINISMUS (G2.3): der Bau zieht seine Zufälligkeit aus dem LAB-FESTEN
// Strom mulberry32(0x50FA) (Verwitterungs-Jitter · Ruinen-Schutt — byte-treu zur
// Vorlage). Das seed-Argument reist mit (Vertrags-Signatur) und ist RESERVIERT
// wie beim Fahrzeug-Kern: buildInstance(id, 7, …) == buildInstance(id, 12345, …)
// byte-gleich — eingefroren in spec/asset-contract/v4 (cv:4). Eine künftige
// Seed-Variation ist ein bewusster Golden-Re-Mint, kein Drift.
//
// SCHNITT-GRENZE (bewusst): der Kern trägt die STRUKTUR des Tors (Rahmen-
// Ordnungen · Türen · Fundament · Apertur-Glut-Kante). Die PASSAGE-Membran
// (Raymarch-ShaderMaterial) + der volumetrische Bodennebel bleiben in der
// Lab-Shell — sie sind Renderer-gebundene Portal-FX (depthRT/Kamera/Composer),
// keine Mesh-Substanz; in der Hauptwelt ist der Welt-Übergang das Host-Verb
// `portal` (Nervensystem-Plan §2.3), der benannte ε-Folge-Anschluss.
//
// B5-STAND (benannte Schuld, kein Verstecken): das Lab trägt seine Lehre
// (Stich→Schub→Dicke) als FORMEL (deriveGate → updateLaw-Anzeige), nicht als
// pass/warn-BÄNDER — darum exportiert der Kern `messen(P)` (dieselbe Formel,
// M3 Ableitungs-Pflicht), aber KEIN LEHREN-Array (B5 ist SOLL; die Bänder
// kommen mit einer künftigen Schöpfer-Edition, nie erfunden).
//
// THREE ist zur Laufzeit global (Browser/Worker: worlds/terrain/lib/
// three-r128.min.js VOR diesem Skript; Node-Gate: global.THREE vor require).
// Der Manifest-Teil (Daten + Funktions-Definitionen) läuft THREE-frei
// (Validator-vm mit Stub) — kein THREE-Aufruf auf Top-Level.
(function (root) {
    "use strict";

    var VERSION = "1.0.0";
    var STUDIO_VERTRAG = 1; // G4.3 — EINE Versions-Semantik (v1.1 ist Adressierungs-Norm, kein Block-Bruch)

    // ── B2-Daten: die Stufen-Wahrheit der Domäne (kindStages-Vertrag) ──
    // Tore zeigen NUR Stufe 0 (fein) und werfen aus der NUR-WURF-Stufe 3 (1110-9); L1=L0-Grade + L2-Auto-Impostor
    // sind Sache des Wirts (docs/studio-vertrag.md B2 / N7.5-Merge am EINEN Ingest).
    // B2c-Daten (W8, rein additiv): DAS BUDGET der einen Stufe (docs/studio-vertrag.md B2c) — tris = die gebaute
    // Hülle über alle Tore (gate:asset-contract, die Ratsche fällt nur), band = das Profi-Band-Ziel
    // (Haushalt, offen solange tris darüber liegt), draws = Draws je Tor und Pass nach der Wirts-Regel: das
    // Budget-Gesetz am Studio-Ausgang (phyto-core budgetErzwingen) faltet die Flügel-Teile je Flügel × Stoff (das
    // Scharnier reist mit, `_tickTorFluegel` dreht je Flügel und Stoff EINE Matrix), nur innerhalb EINER Seh-Klasse;
    // Glut faltet nie — 13 war das gemessene Minimum über alle 112 Fälle (Flügel × Stoff × Seh-Klasse); seit 1310-4 zeichnet
    // der Wirt den Hinterflügel einer Seite als Instanz des Vorderflügels (gleiche Gestalt, nur verschoben — phyto-core
    // `budgetGestaltVersatz`, `_foundryFluegelInstanz`), das Gesetz zählt in seiner Einheit: 9 (dieselbe Faltung). gestalten =
    // Individuen je Tor (gefüllt je Rezept unten bei PRESETS): EINE — der Bau liest den Samen nicht (seed reserviert,
    // Kopf; Same 1 ≡ 2 byte-gleich), 16 Gestalten waren 16 byte-gleiche Zwillinge als eigene Leaves (Genesis: zwei
    // Drachentore, zwei Leaves, 43 Befehle). Eine Seed-Achse ist ein Re-Mint-Akt, nie eine Zahl hier (S3 08.10.,
    // gate:asset-contract Gestalten-Wand).
    var GESTALTEN_JE_REZEPT = 1;
    var PORTAL_RENDER_CONFIG = {
        lod: {
            kindStages: { gate: [0, 1, 2, 3] },
            budget: {
                // fernform (B2c, Pflicht je Budget-Art): jenseits der Nah-Grenze trägt der Box-Satz im Welt-March (_archBoxFit)
                // 1110-9 (das Detail-Gesetz der Röhren und Ringe): tris ist die Hülle der Rezepte UND des Rands jedes Reglers
                // (gate:regler-wirkt, Ratsche reglerBudget Soll 0) — gemessen 75 608 an ruine wBraid=1 (vorher 256 284 an
                // maurentor orders=9, über der alten Zeile 184 000); die sieben Rezepte selbst tragen ≤ 51 096 und liegen auf
                // dem Band, der Rand der Regler noch darüber
                // 1110-9 (der Wurf aus der gröberen Stufe, Nordstern M4): die Stufe 0 wirft nicht mehr selbst — ihr Wurf ist
                // die NUR-WURF-Stufe 3, die Hüllen-Liste des Tors (huelle, N5) als EIN Gitter; dieselbe Liste ist die Fernform.
                // tris der Stufe 3 = die Regler-Hülle (Rezepte × Regler × Rand, gate:regler-wirkt fährt auch die Stufe 3).
                // K43 (DIE STUFE 1, Kosten ins Asset): derselbe Bau unter TOR_DETAIL_1, die Flügel fest im Körper; die Grenze
                // im Kern — ab 9,5 m × Welt-Skala trägt die Stufe 1 das Bild (hyst 0,1: hinein ab 10,45 m, zurück unter 8,55 m;
                // der Genesis-Ring steht 11 m um seine Mitte). tris = die Regler-Hülle der Stufe 1 (gemessen 33 890 an ruine
                // wBraid=1; die Rezepte 4 608–23 276), draws 6 = das Minimum über die Rezepte (maschine: vier Metalle
                // verschiedener Glut, Leucht-Linien, die Licht-Scheibe — die Faltung kreuzt keine Glut-Grenze).
                // K64 (DIE STUFE 2, Kosten ins Asset): derselbe Bau unter TOR_DETAIL_2 ab 12 m × Welt-Skala (hinein ab 13,2 m,
                // zurück unter 10,8 m — die Ring-Tore bei 11 m liegen im Band: wer aus der Mitte kommt, sieht die Stufe 1, wer
                // von außen kommt, die Stufe 2 bis 10,8 m; die Third-Sicht und die Vorschauen fallen hinein). tris = die
                // Regler-Hülle der Stufe 2 (gemessen 11 974 an verkalkt orders=9, die Zeile 12 500 streng über der Stufe 3 —
                // Studio-Vertrag B2c; die Rezepte 2 394–7 810, die Stufe 1 trug 4 608–23 276), band = das Nordstern-Soll L2
                // (offen, solange ein Rezept darüber liegt).
                gate: {
                    0: { tris: 76000, band: 60000, draws: 9, schatten: 3 },
                    1: { tris: 34000, draws: 6, schatten: 3, ab: 9.5 },
                    2: { tris: 12500, band: 6000, draws: 6, schatten: 3, ab: 12 },
                    3: { tris: 12000, draws: 1, schatten: 3, nurWurf: true },
                    fernform: "huelle",
                    hyst: 0.1,
                },
                gestalten: {},
            },
        },
    };

    // ── B4-Quelle: die Regler des Schöpfer-Labs (byte-treu aus worlds/portale/porta.js;
    //    Zeile = [id, lab, min, max, step, default, law, grp-Farbklasse] · ['X','h'] = Gruppen-Kopf) ──
    // prettier-ignore
    var SLIDERS=[
      ['VOK','h'],
      ['wMason','Mauerwerk',0,1,0.01,0.0,'',1],['wBraid','Geflecht',0,1,0.01,1.0,'',1],['wMono','Monolith',0,1,0.01,0.0,'',1],['wLace','Filigran',0,1,0.01,0.25,'',1],
      ['DEP','h'],
      ['orders','Ordnungen',1,9,1,3,'Staffel-Ebenen (Türfreiheit autom.)',2],['depth','Tiefe',0,1,0.01,0.45,'z-Staffelung Rahmen',2],['wave','Welle',0,1,0.01,0.45,'Oberflächen-Verformung (z)',2],['tunnel','Innentiefe',0,1,0.01,0.6,'Tiefe des Ziels (Stellvertreter-Kugel)',2],['fractal','Fraktal',0,1,0.01,0.6,'Selbstähnlichkeit der Welle',2],['twist','Drall',0,1,0.01,0.4,'Drall der Welle',2],
      ['realm','Innenwelt',0,1,0.01,0.0,'Wurmloch↔Kristall',2],['swirl','Sog',0,1,0.01,0.3,'Gravitationslinse',2],['reflect','Spiegel',0,1,0.01,0.5,'Glanz des Films',2],
      ['FORM','h'],
      ['k','Spitze',1.0,3.4,0.01,2.6,''],['rise','Stich',0.55,1.25,0.01,1.0,''],['ogee','Ogee',0,1,0.01,0,''],['horse','Hufeisen',0,1,0.01,0,''],['aspect','Schlank',1.4,2.8,0.01,2.4,''],['mass','Dicke',0,1,0.01,0.7,''],
      ['MAT','h'],
      ['metal','Metall',0,1,0.01,0.5,''],['glow','Glut',0,1,0.01,0.4,''],['hue','Farbe',0,1,0.01,0.45,''],['weather','Alter',0,1,0.01,0.1,''],['ruin','Ruine',0,1,0.01,0,''],['temp','Schwelle°',0,1,0.01,0.5,''],['energy','Energie',0,1,0.01,0.6,'']
    ];

    // Slider-id → Bau-Parameter-Schlüssel (byte-treu; Shell-readParams UND gateParams teilen sie).
    // prettier-ignore
    function pk(id){return id==='k'?'k':id==='rise'?'riseScale':id==='horse'?'horseshoe':id;}

    // ── B4 PARAMS (Vertrags-Form) — ABGELEITET aus SLIDERS (eine Quelle, zwei Sichten:
    //    das Lab baut seine Regler-Reihen aus SLIDERS, der Vertrag liest PARAMS) ──
    var PARAMS = (function () {
        var GRP = { VOK: "VOKABULAR", DEP: "TIEFE / PASSAGE", FORM: "FORM", MAT: "MATERIAL / SCHWELLE" };
        // DIE GESETZ-WERTE (Vertrag §3 B4 `uniform`, studios.K2): die Membran-Zeilen bewegen kein Bau-Byte (gate:regler-wirkt,
        // spec/vertraege/ratsche.json reglerTot) — die Welt liest sie im Membran-Gesetz, das Labor als Uniform (membranUniforms).
        var GESETZ_WERT = { wave: 1, tunnel: 1, fractal: 1, twist: 1, swirl: 1, reflect: 1, temp: 1, energy: 1 };
        var out = [];
        var grp = "";
        for (var i = 0; i < SLIDERS.length; i++) {
            var s = SLIDERS[i];
            if (s[1] === "h") {
                grp = GRP[s[0]] || s[0];
                continue;
            }
            out.push({
                id: s[0],
                lab: s[1],
                min: s[2],
                max: s[3],
                step: s[4],
                def: s[5],
                law: s[6] || undefined,
                grp: grp,
            });
            if (GESETZ_WERT[s[0]]) out[out.length - 1].uniform = true;
        }
        return out;
    })();

    // ── B1 REZEPTE: die sieben Tor-Ordnungen (Dial-Vektoren byte-treu aus dem Lab;
    //    ids im Vertrags-Namensraum [a-z0-9_-]+, `lab` = der Schöpfer-Wortlaut der Buttons).
    //    fx.place (N5.6, Wörterbuch v1 §2.4): das Platzierungs-GESETZ reist als DATEN —
    //    mode "site" + siteTag "tor" (die Welt-Nische Schrein/Tor); der Host-Dispatch
    //    hält site heute bewusst ohne Worldgen-Kanal (streut NICHT, gate:place-policy d). ──
    // prettier-ignore
    var PRESETS = {
        drachentor: { kind: "gate", lab: "Drachentor", fx: { place: { mode: "site", siteTag: "tor" } },
            s: {wMason:0,wBraid:1,wMono:0,wLace:0.25,orders:2,depth:0.45,wave:0.5,tunnel:0.65,fractal:0.6,twist:0.5,realm:0.25,swirl:0.5,reflect:0.55,k:2.6,rise:1,ogee:0,horse:0,aspect:2.4,mass:0.7,metal:0.55,glow:0.45,hue:0.5,weather:0.1,ruin:0,temp:0.5,energy:0.6} },
        kathedrale: { kind: "gate", lab: "Kathedrale", fx: { place: { mode: "site", siteTag: "tor" } },
            s: {wMason:0.95,wBraid:0,wMono:0.15,wLace:0.8,orders:4,depth:0.75,wave:0.3,tunnel:0.5,fractal:0.4,twist:0.2,realm:0.7,swirl:0.2,reflect:0.35,k:2.6,rise:1,ogee:0,horse:0,aspect:2.45,mass:0.8,metal:0.1,glow:0.15,hue:0.1,weather:0.3,ruin:0,temp:0.85,energy:0.3} },
        maschine: { kind: "gate", lab: "Maschine", fx: { place: { mode: "site", siteTag: "tor" } },
            s: {wMason:0,wBraid:0.25,wMono:0.95,wLace:0.1,orders:3,depth:0.55,wave:0.4,tunnel:0.85,fractal:0.7,twist:0.6,realm:0.55,swirl:0.35,reflect:0.8,k:2,rise:1,ogee:0,horse:0,aspect:2.1,mass:0.6,metal:0.95,glow:0.5,hue:0.5,weather:0.05,ruin:0,temp:0.12,energy:0.78} },
        geisttor: { kind: "gate", lab: "Geisttor", fx: { place: { mode: "site", siteTag: "tor" } },
            s: {wMason:0,wBraid:0,wMono:0.05,wLace:1,orders:2,depth:0.3,wave:0.75,tunnel:0.95,fractal:1,twist:0.85,realm:0.85,swirl:0.7,reflect:0.3,k:2.4,rise:1.1,ogee:0.5,horse:0,aspect:2.3,mass:0.5,metal:0.4,glow:1,hue:0.6,weather:0,ruin:0,temp:0.6,energy:0.85} },
        verkalkt: { kind: "gate", lab: "Verkalkt", fx: { place: { mode: "site", siteTag: "tor" } },
            s: {wMason:0.55,wBraid:0.55,wMono:0.1,wLace:0.3,orders:3,depth:0.55,wave:0.45,tunnel:0.6,fractal:0.5,twist:0.4,realm:0.45,swirl:0.4,reflect:0.5,k:2.4,rise:1,ogee:0,horse:0,aspect:2.2,mass:0.75,metal:0.4,glow:0.3,hue:0.3,weather:0.4,ruin:0,temp:0.6,energy:0.4} },
        ruine: { kind: "gate", lab: "Ruine", fx: { place: { mode: "site", siteTag: "tor" } },
            s: {wMason:0.85,wBraid:0,wMono:0.1,wLace:0.2,orders:2,depth:0.6,wave:0.3,tunnel:0.45,fractal:0.3,twist:0.2,realm:0.2,swirl:0.15,reflect:0.25,k:1,rise:1,ogee:0,horse:0,aspect:1.55,mass:0.8,metal:0.1,glow:0.1,hue:0.2,weather:0.85,ruin:0.6,temp:0.5,energy:0.2} },
        maurentor: { kind: "gate", lab: "Maurentor", fx: { place: { mode: "site", siteTag: "tor" } },
            s: {wMason:0.7,wBraid:0.3,wMono:0.1,wLace:0.45,orders:3,depth:0.5,wave:0.4,tunnel:0.6,fractal:0.5,twist:0.3,realm:0.6,swirl:0.3,reflect:0.45,k:1.2,rise:1,ogee:0,horse:0.8,aspect:1.95,mass:0.7,metal:0.25,glow:0.3,hue:0.35,weather:0.3,ruin:0,temp:0.78,energy:0.35} },
    };

    // ── Der Parameter-Merge — reproduziert das Lab (setParams(preset) → readParams():
    //    Preset-Werte wo definiert, Slider-DEFAULTS sonst, M fest 1.4; pk mappt die
    //    Slider-ids auf die Bau-Schlüssel). ov reist als Override NACH s+fx (die
    //    vehicle-Merge-Ordnung); unbekannte Schlüssel sind harmlos (der Bau liest
    //    nur seine Dial-Namen — fx.place quert als Daten-Passagier). ──
    function gateParams(pre, ov) {
        var P = { M: 1.4 };
        var i;
        var s;
        for (i = 0; i < SLIDERS.length; i++) {
            s = SLIDERS[i];
            if (s[1] === "h") continue;
            P[pk(s[0])] = s[5];
        }
        var srcs = [pre && pre.s, pre && pre.fx, ov];
        for (i = 0; i < srcs.length; i++) {
            var src = srcs[i];
            if (!src || typeof src !== "object") continue;
            for (var key in src) {
                if (!Object.prototype.hasOwnProperty.call(src, key)) continue;
                P[pk(key)] = src[key];
            }
        }
        return P;
    }

    // ═══ die geteilten Helfer (byte-treu, worlds/portale/porta.js Z.24–25) ═══
    // prettier-ignore
    function lerp(a,b,t){return a+(b-a)*t;}
    // prettier-ignore
    function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
    // prettier-ignore
    function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

    // ═══ die Lehre: Bogen-Profil + Stich→Schub→Dicke (byte-treu, Z.27–43) ═══
    // prettier-ignore
    function archProfile(p,steps){
      steps=steps||56;var M=p.M,k=Math.max(1.0,p.k),R=k*M,cx=(k-1)*M,i,x,y;var P=[];
      for(i=0;i<=steps;i++){x=-M+2*M*i/steps;var c=(x<=0)?cx:-cx;y=Math.sqrt(Math.max(0,R*R-(x-c)*(x-c)));P.push([x,y]);}
      for(i=0;i<P.length;i++)P[i][1]*=p.riseScale;
      if(p.ogee>0)for(i=0;i<P.length;i++){var f=Math.abs(P[i][0]/M);P[i][1]+=p.ogee*M*0.20*Math.sin(f*Math.PI)*(1-f);if(f<0.25)P[i][1]+=p.ogee*M*0.24*(1-f/0.25);}
      if(p.horseshoe>0)for(i=0;i<P.length;i++){var xr=Math.abs(P[i][0]/M);P[i][1]+=p.horseshoe*M*0.26*(1-Math.min(1,xr));P[i][0]*=(1-p.horseshoe*0.12*xr);}
      var rise=0;for(i=0;i<P.length;i++)rise=Math.max(rise,P[i][1]);
      var Q=[P[0]];for(i=1;i<P.length;i++)if(P[i][0]>Q[Q.length-1][0]+1e-5)Q.push(P[i]);
      return {pts:Q,rise:rise};
    }
    // prettier-ignore
    function interpTop(prof,x){var p=prof.pts;if(x<=p[0][0])return p[0][1];if(x>=p[p.length-1][0])return p[p.length-1][1];for(var i=1;i<p.length;i++)if(p[i][0]>=x){var t=(x-p[i-1][0])/(p[i][0]-p[i-1][0]);return p[i-1][1]+t*(p[i][1]-p[i-1][1]);}return 0;}
    // prettier-ignore
    function deriveGate(p){
      var M=p.M,span=2*M,baseY=0,prof=archProfile(p,56),rise=prof.rise;
      var jambH=clamp(p.aspect*span-rise,span*0.4,span*3.2),springY=baseY+jambH,apexY=springY+rise;
      var thrustNorm=(M*Math.sqrt(3))/Math.max(0.25,rise),jambW=clamp(M*0.5*thrustNorm*p.mass,0.02,M*1.7);
      return {M:M,span:span,baseY:baseY,prof:prof,rise:rise,jambH:jambH,springY:springY,apexY:apexY,aspect:(apexY-baseY)/span,thrustNorm:thrustNorm,jambW:jambW,p:p,leftSpringX:prof.pts[0][0],rightSpringX:prof.pts[prof.pts.length-1][0],centerY:baseY+jambH*0.58};
    }

    // ── B5-Mess-Funktion (M3: der Export der SELBEN Formel, die das Lab anzeigt —
    //    updateLaw: Stich→Schub→Dicke; pass/warn-Bänder trägt das Lab nicht, s. Kopf) ──
    function messen(P) {
        var d = deriveGate(gateParams({ s: P || {} }));
        return { stich: d.rise, schub: d.thrustNorm, dicke: d.jambW, streckung: d.aspect };
    }

    // ═══ DAS DETAIL-GESETZ der Röhren und Ringe (1110-9, das Tor-L0 auf seiner Band-Zeile) ═══
    // Röhren und Ringe tragen 95 % der Dreiecke eines Tors (die Strähnen allein 28 × 240 × 6 × 2 = 80 640). Ihre Teilung
    // folgt EINEM Sehnen-Fehler `TOR_DETAIL.sehneM`: längs so viele Segmente, wie die Krümmung der Kurve braucht (∫ √(κ / 8ε) ds,
    // verteilt nach der Krümmung — gerade Läufe tragen wenige, enge Bögen viele), um den Umfang so viele, wie der Radius
    // braucht (π / acos(1 − ε / r)); die Zahl des Aufrufers ist die Höchst-Teilung. Gemessen 12.10. (OMEN, die sieben Tore
    // in Node): bei ε = 1 cm trägt das schwerste Tor 51 096 statt 150 200 Dreiecke (drachentor), alle ≤ 60 000 (Band-Zeile).
    var TOR_DETAIL = { sehneM: 0.01, laengsM: 1, umfangMin: 3, ringMin: 8, proben: 256, zylinder: 10 };
    // DIE STUFE 1 DES TORS (K43, Kosten ins Asset): dieselbe Gestalt aus demselben Bau (buildGate), ihr Detail-Gesetz auf
    // ihrer Distanz — jenseits `lod.budget.gate[1].ab` (8 m, Hysterese `hyst`) liegt ein Pixel bei ≥ 0,97 cm (1920 × 1080,
    // 75°): der Sehnen-Fehler 2 cm trägt ≤ 2 px am nächsten Punkt der Stufe, 1,3 px am Genesis-Ring (11 m). Jede Röhre, jeder
    // Ring und jedes Scharnier behält die mittlere Breite der Stufe 0 (`breiteTreu`: weniger Seiten, der Radius wächst um das
    // Verhältnis der mittleren Kaliber-Breiten n · sin(π / n)) — die Silhouette bleibt, die Seiten fallen. Die Flügel stehen
    // in der Fern-Pose und sind Teil des Körpers (`tuerFest`: kein Scharnier-Datum, der Wirt dreht nur die Flügel der Stufe 0 —
    // die Tür lebt in der Nähe und öffnet aus derselben Pose, `TUER_GESETZ.fern`).
    // pipeline.K3 (das FEINE der Stufe 1, aus ihrer Größe wie die Stufe 2): ab 9,5 m liegt ein Szenen-Pixel bei 1,54 cm (0,97 cm × 9,5 / 8 / 0,75) — was
    // dünner ist als 1,5 Szenen-Pixel (`feinM` 2,3 cm: die Fase der Steine 1,5 cm, die Pässe und Dreipässe 1,6–2,2 cm) fällt wie in der Stufe 2.
    // `anteil` = DAS ANTEIL-GESETZ der Stufe (unten, `baueStufe`): höchstens dieser Teil der L0-Dreiecke an derselben Stelle.
    var TOR_DETAIL_1 = { sehneM: 0.025, laengsM: 2, umfangMin: 3, ringMin: 6, proben: 256, zylinder: 6, tuerFest: true, feinM: 0.023, anteil: 0.5 };
    // DIE STUFE 2 DES TORS (K64, Kosten ins Asset): derselbe Bau jenseits `lod.budget.gate[2].ab` (12 m), gerechnet im Pixel der
    // SZENE (TAAU-Skala 0,75: 0,97 cm / 8 m / 0,75 = 1,94 cm je Szenen-Pixel bei 12 m). Drei Teile des EINEN Gesetzes: der
    // Sehnen-Fehler 5 cm (≤ 2,6 px, der Fehler der Stufe 1 an ihrer Grenze), das FEINE fällt — eine Röhre oder ein Ring mit
    // Durchmesser ≤ `feinM` (1,5 Szenen-Pixel bei 12 m = 2,9 cm: das Filigran der Pässe, die Dreipässe, die Gitter-Sprossen
    // unter 3 cm; sie flimmerten dort unter der Zeit-Auflösung nur, K64-n1: die Klasse an Genesis Third 126 772 > 120 000) —,
    // und das Geflecht trägt jeden `straehnen`-ten Strang mit der Deckung aller (Breite × straehnen, dieselbe Phase, derselbe
    // Zufalls-Strom: die Strähnen-Lücke 16 cm bleibt ≥ 8 px, das Band behält Fläche und Farbe).
    // pipeline.K3 (DAS STEIN-BAND): die Fuge zweier Steine (Fase 1,5 cm, Versatz ≤ 1 cm) liegt unter dem Szenen-Pixel der Stufe — die Kette der
    // Steine einer Ordnung ist dort EIN Band (`steinband`), seine Teilung folgt dem Sehnen-Fehler der Stufe wie jede Röhre.
    var TOR_DETAIL_2 = { sehneM: 0.05, laengsM: 3, umfangMin: 3, ringMin: 5, proben: 256, zylinder: 4, tuerFest: true, feinM: 0.0291, straehnen: 2, steinband: true, anteil: 0.15 };
    var _detail = TOR_DETAIL; // das Gesetz des laufenden Baus (buildInstance setzt es je Stufe, synchron)
    // Das FEINE der Stufe (`feinM`): ein Teil dieser Dicke (Röhre und Ring am Durchmesser, Fase, Stab und Beschlag an ihrer kleinsten Kante,
    // Scharnier und Juwel am Durchmesser — pipeline.K3: die Klasse ganz, vorher entkamen Kästen und Zylinder dem Gesetz) fällt — an seiner Stelle eine
    // leere Gruppe (kein Draw, kein Dreieck; der Bau-Strom läuft unverändert weiter). Die Stufe 0 trägt kein `feinM`.
    function fein(m) {
        return _detail.feinM > 0 && m <= _detail.feinM;
    }
    function umfangMit(D, r, hoechst) {
        var n = Math.ceil(Math.PI / Math.acos(Math.max(-1, 1 - D.sehneM / r)));
        return Math.max(D.umfangMin, Math.min(hoechst, n));
    }
    function umfangTeilung(r, hoechst) {
        return umfangMit(_detail, r, hoechst);
    }
    // Der Radius einer Röhre mit n Seiten, deren mittlere Breite die der Stufe 0 trägt (n0 Seiten): die mittlere Kaliber-Breite
    // eines regelmäßigen n-Ecks mit Umkreis r ist 2 n r sin(π / n) / π. In der Stufe 0 ist der Radius der gerufene, unverändert.
    function breiteTreu(r, n0, n) {
        if (_detail === TOR_DETAIL || n0 === n) return r;
        return (r * n0 * Math.sin(Math.PI / n0)) / (n * Math.sin(Math.PI / n));
    }
    // Die Kurve, umparametrisiert nach der Krümmungs-Dichte: TubeGeometry tastet gleichmäßig in u (getPointAt,
    // getTangentAt) und trifft so im Raum dort dicht, wo die Kurve sich biegt.
    // DAS ABTASTEN EINER KURVE (N Proben): je Probe ihre Krümmung (der Winkel zweier Tangenten über ds) — sie hängt an der Kurve, nie am
    // Gesetz der Teilung. Die Versuche des Anteil-Gesetzes (`baueStufe`) bauen dieselben Kurven neu: `_abtast` hält ihre Proben über die
    // Versuche EINER Stufe (Schlüssel: die Punkte der Kurve), danach fällt es.
    var _abtast = null;
    var _f64 = new Float64Array(1), _u32 = new Uint32Array(_f64.buffer);
    function kurvenSchluessel(kurve, N) {
        var a = 0x811c9dc5 | 0, b = 0x2f0a1c3d | 0, P = kurve.points;
        var ein = function (x) {
            _f64[0] = x;
            a = Math.imul(a ^ _u32[0], 16777619) ^ _u32[1];
            b = Math.imul(b ^ _u32[1], 16777619) ^ _u32[0];
        };
        ein(N);
        ein(P.length);
        for (var i = 0; i < P.length; i++) { ein(P[i].x); ein(P[i].y); ein(P[i].z); }
        return (a >>> 0) + ":" + (b >>> 0);
    }
    function abtasten(kurve, N) {
        var schl = _abtast ? kurvenSchluessel(kurve, N) : null, hat = schl && _abtast.get(schl);
        if (hat) return hat;
        var L = kurve.getLength(), ds = L / N, k = new Float64Array(N + 1), t0 = kurve.getTangentAt(0), kreuz = new THREE.Vector3(), i;
        for (i = 1; i <= N; i++) {
            var t1 = kurve.getTangentAt(i / N);
            // der Winkel gut konditioniert (atan2 aus Kreuz und Skalar; acos des Skalars nahe 1 verstärkte das ULP-Rauschen der
            // Kurve, die Wurzel darüber kippte die Teilung — die Plattform-Probe: 7 Fälle), unter 1e-9 gerade
            var w = Math.atan2(kreuz.crossVectors(t0, t1).length(), t0.dot(t1));
            k[i] = (w < 1e-9 ? 0 : w) / ds;
            t0 = t1;
        }
        var A = { ds: ds, k: k };
        if (schl) _abtast.set(schl, A);
        return A;
    }
    // D: das Gesetz der Teilung (Standard: das laufende); D0: ein zweites, im SELBEN Abtasten gezählt (`n0` — das Kosten-Buch zählt die L0 mit).
    function sehnenKurve(kurve, hoechst, D, D0) {
        D = D || _detail;
        var N = D.proben, A = abtasten(kurve, N), ds = A.ds, eps = D.sehneM;
        var dichte = [0], summe = 0, summe0 = 0, i;
        for (i = 1; i <= N; i++) {
            var k = A.k[i];
            // höchstens `laengsM` je Segment auch im geraden Lauf: die Pfosten tragen Ringe (die gemintete Tor-Hülle misst die
            // Ecken — ohne sie sah sie einen Pfosten 37 cm schmaler als gezeichnet, maschine)
            summe += Math.max(Math.sqrt(k / (8 * eps)), 1 / D.laengsM) * ds;
            if (D0) summe0 += Math.max(Math.sqrt(k / (8 * D0.sehneM)), 1 / D0.laengsM) * ds;
            dichte.push(summe);
        }
        var n = Math.max(2, Math.min(hoechst, Math.ceil(summe) + 1));
        var bogen = function (u) {
            var z = u * summe, lo = 0, hi = N;
            while (hi - lo > 1) {
                var mi = (lo + hi) >> 1;
                if (dichte[mi] <= z) lo = mi;
                else hi = mi;
            }
            var d = dichte[hi] - dichte[lo];
            return Math.min(1, (lo + (d > 0 ? (z - dichte[lo]) / d : 0)) / N);
        };
        var c = new THREE.Curve();
        c.getPoint = function (u, ziel) { return kurve.getPointAt(bogen(u), ziel); };
        c.getPointAt = c.getPoint;
        c.getTangentAt = function (u, ziel) { return kurve.getTangentAt(bogen(u), ziel); };
        c.getTangent = c.getTangentAt;
        return { kurve: c, n: n, n0: D0 ? Math.max(2, Math.min(hoechst, Math.ceil(summe0) + 1)) : 0 };
    }
    // Ein Ring: der Kreis R trägt die Krümmung 1 / R (∫ = 2π √(R / 8ε)), mindestens `ringMin` Seiten (die Rosette bleibt rund).
    function ringGeometrie(R, r, umfangHoechst, laengsHoechst) {
        var laengs = Math.ceil(2 * Math.PI * Math.sqrt(R / (8 * _detail.sehneM))), n = umfangTeilung(r, umfangHoechst);
        return new THREE.TorusGeometry(R, breiteTreu(r, umfangMit(TOR_DETAIL, r, umfangHoechst), n), n, Math.max(_detail.ringMin, Math.min(laengsHoechst, laengs)));
    }
    // Die Scheibe des Leucht-Rings: die L0 trägt 40 Seiten, jede Stufe die Teilung ihres Sehnen-Fehlers (π / acos(1 − ε / R)).
    function kreisTeilung(R) {
        if (_detail === TOR_DETAIL) return 40;
        return Math.max(_detail.ringMin, Math.min(40, Math.ceil(Math.PI / Math.acos(Math.max(-1, 1 - _detail.sehneM / R)))));
    }
    // ═══ DAS ANTEIL-GESETZ (pipeline.K3, Kosten am Asset — die Karte: L1 ≤ 50 %, L2 ≤ 15 % der L0-Dreiecke, je Rezept und an jedem Rand) ═══
    // DAS KOSTEN-BUCH der laufenden Stufe: jedes Teil, das die Stufe anders legt als die L0 (Röhre, Ring, Stein, Scharnier, Scheibe, eine
    // fallende Strähne), bucht die Dreiecke, die die L0 an seiner Stelle trägt (`l0`, gerechnet aus TOR_DETAIL, ohne die L0 zu bauen), und
    // die es selbst trägt (`stufe`); was die Stufe gleich legt (Kästen, Juwel), zählt in beiden gleich. `baueStufe` richtet die Summe.
    var _buch = null;
    function dreieckeVon(geo) {
        return (geo.index ? geo.index.count : geo.attributes.position.count) / 3;
    }
    function buche(l0, me) {
        if (_buch) {
            _buch.l0 += l0;
            if (me && me.isMesh) _buch.stufe += dreieckeVon(me.geometry);
        }
        return me;
    }
    function ringL0(R, r, umfangHoechst, laengsHoechst) {
        var laengs = Math.ceil(2 * Math.PI * Math.sqrt(R / (8 * TOR_DETAIL.sehneM)));
        return 2 * umfangMit(TOR_DETAIL, r, umfangHoechst) * Math.max(TOR_DETAIL.ringMin, Math.min(laengsHoechst, laengs));
    }
    function roehreL0(kurve, r, laengsHoechst, umfangHoechst) {
        return 2 * sehnenKurve(kurve, laengsHoechst, TOR_DETAIL).n * umfangMit(TOR_DETAIL, r, umfangHoechst);
    }
    // der Stein der L0 (`quadBlock` mit Fase): ein Viereck, gefast, EINE Zahl für jeden Stein
    var _steinL0 = 0;
    function steinL0() {
        if (!_steinL0) {
            var sh = new THREE.Shape();
            sh.moveTo(0, 0); sh.lineTo(1, 0); sh.lineTo(1, 1); sh.lineTo(0, 1); sh.lineTo(0, 0);
            _steinL0 = dreieckeVon(new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1 }));
        }
        return _steinL0;
    }
    // DAS STEIN-BAND (TOR_DETAIL_2 `steinband`): die Kette der Steine einer Ordnung (`lauf`: je Stein [innen-Anfang, innen-Ende, außen-Anfang,
    // außen-Ende] in Reihe, null = der Stein fehlt — die Ruine) als EIN Band je ununterbrochenem Lauf: Vorder- und Rückseite, Laibung und Rücken,
    // zwei Stirnen; die Teilung behält eine Fuge nur, wo die Kette um mehr als den Sehnen-Fehler der Stufe vom Band abwiche. Dieselbe Tiefe wie
    // der ungefaste Stein (+3 cm, `quadBlock`), derselbe Stoff, dieselben Attribute (Lage, Normale, uv).
    function steinBaender(gate, lauf, depth, mat, zO) {
        var runs = [], cur = [];
        for (var i = 0; i <= lauf.length; i++) {
            if (i < lauf.length && lauf[i]) cur.push(lauf[i]);
            else if (cur.length) { runs.push(cur); cur = []; }
        }
        var eps = _detail.sehneM, hz = (depth + 0.03) / 2;
        var abw = function (p, a, b) {
            var dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy, t = l2 > 0 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
            return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
        };
        for (var r = 0; r < runs.length; r++) {
            var L = runs[r], I = [L[0][0]], O = [L[0][2]], k;
            for (k = 0; k < L.length; k++) { I.push(L[k][1]); O.push(L[k][3]); }
            var keep = [0], s0 = 0;
            for (var e = s0 + 2; e <= I.length; e++) {
                var ok = e < I.length;
                for (k = s0 + 1; ok && k < e; k++) if (abw(I[k], I[s0], I[e]) > eps || abw(O[k], O[s0], O[e]) > eps) ok = false;
                if (!ok) { keep.push(e - 1); s0 = e - 1; }
            }
            var pos = [], nrm = [], uv = [], idx = [];
            var quad = function (A, B, C, Dd, n) {
                var v0 = pos.length / 3, Q = [A, B, C, Dd];
                for (var q = 0; q < 4; q++) { pos.push(Q[q][0], Q[q][1], Q[q][2]); nrm.push(n[0], n[1], n[2]); uv.push(0, 0); }
                var ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], wx = C[0] - A[0], wy = C[1] - A[1], wz = C[2] - A[2];
                var cx = uy * wz - uz * wy, cy = uz * wx - ux * wz, cz = ux * wy - uy * wx;
                idx.push.apply(idx, cx * n[0] + cy * n[1] + cz * n[2] > 0 ? [v0, v0 + 1, v0 + 2, v0, v0 + 2, v0 + 3] : [v0, v0 + 2, v0 + 1, v0, v0 + 3, v0 + 2]);
            };
            var P3 = function (v, z) { return [v.x, v.y, z]; };
            var richt = function (a, b) { var dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l, 0]; };
            for (k = 0; k < keep.length - 1; k++) {
                var a = keep[k], b = keep[k + 1], zf = zO + hz, zb = zO - hz;
                quad(P3(I[a], zf), P3(I[b], zf), P3(O[b], zf), P3(O[a], zf), [0, 0, 1]);
                quad(P3(I[a], zb), P3(I[b], zb), P3(O[b], zb), P3(O[a], zb), [0, 0, -1]);
                var mi = { x: (I[a].x + I[b].x) / 2, y: (I[a].y + I[b].y) / 2 }, mo = { x: (O[a].x + O[b].x) / 2, y: (O[a].y + O[b].y) / 2 };
                quad(P3(I[a], zf), P3(I[b], zf), P3(I[b], zb), P3(I[a], zb), richt(mo, mi));
                quad(P3(O[a], zf), P3(O[b], zf), P3(O[b], zb), P3(O[a], zb), richt(mi, mo));
            }
            var n0 = keep[0], n1 = keep[keep.length - 1];
            quad(P3(I[n0], zO + hz), P3(O[n0], zO + hz), P3(O[n0], zO - hz), P3(I[n0], zO - hz), richt(I[keep[1]], I[n0]));
            quad(P3(I[n1], zO + hz), P3(O[n1], zO + hz), P3(O[n1], zO - hz), P3(I[n1], zO - hz), richt(I[keep[keep.length - 2]], I[n1]));
            var g = new THREE.BufferGeometry();
            g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
            g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
            g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
            g.setIndex(idx);
            var me = new THREE.Mesh(g, mat);
            me.castShadow = me.receiveShadow = true;
            gate.add(buche(_buch ? L.length * steinL0() : 0, me));
        }
    }
    // ═══ DIE HÜLLE DES TORS (1110-9, N5 — docs/studio-vertrag.md: EINE Liste für Wurf und Fernform) ═══
    // buildGate sammelt im SELBEN Lauf, der die Meshes baut, je WERFENDEM Bauteil seine Primitive (`box` · `kapsel`) — nur, was in
    // der L0 wirft (castShadow: Steine, Stränge, Monolith, Schlussstein, Scharniere, Stufen, Wurzeln, Podest, Schutt; die leuchtenden
    // Türen, der Bogen-Saum und der Leucht-Ring warfen nie und tragen nichts bei): das Geflecht
    // als EINE Kapsel-Kette entlang seiner Achse mit dem Hüllen-Radius der Stränge (einzeln liegt jeder Strang unter dem
    // Texel der nahen Kaskade, zusammen werfen sie EIN Band; die Enden, wo die Stränge über 12 % auf × 1,7 spreizen, in vier
    // Stücken je mit dem Radius ihres Abschnitts — drachentor Wurf-IoU 0,841 → 0,864), Monolith und Wurzeln als Ketten auf
    // dem Polygonzug ihrer Röhre mit ihrem Röhren-Radius (`hRoehrenKette`, Sehne ≤ `roehreR` × r neben dem Gezeichneten —
    // geisttor 0,767 → 0,887; r/4 kostete die kathedrale +216 Dreiecke ohne Gewinn, r riss geisttor 0,837), die
    // Scharniere als Kapsel, Stufen und Podest als Kasten, die gedrehten Steine (Bogen, Schutt) als einbeschriebene Kapseln. Teile dünner als `dickeM` fallen (der Texel der nahen Kaskade
    // am Genesis-Ring: 6,4 × 17 cm, OMEN 12.10.). Jede Zahl liegt auf dem Raster 2^-12; Kapsel und Kasten sitzen `einzugM`
    // innerhalb des Gezeichneten (der Werfer bleibt unter der Haut: keine Akne, kein Peter-Panning). Die Stufe 3 IST diese
    // Liste als Gitter (`huelleGruppe`), die Fernform liest dieselbe Liste (`__fern`).
    // DIE ROLLEN (N5): jedes feine Teil trägt "wurf" — es wirft nur (die NUR-WURF-Stufe ist die GANZE Liste); die Fernform
    // des Welt-March liest nur "sicht": EIN Rahmen-Strang entlang der innersten Ordnung mit dem Radius ihres stärksten
    // Stoffs (Mauer, Geflecht-Hülle oder Monolith — im werfenden Körper; höchstens `sichtGlieder` Kapseln) und der
    // Sockel, EINBESCHRIEBEN: die kleinste Standfläche aus Stufen und Podest über ihre größte Tiefe (die Hüllbox der Stufen
    // lag über den unteren Tritten und beschattete sie — in EINER Welt auf 2,6 m 26k → 69k px Schatten) — ≤ 24 Teile, die Kosten-Grenze des March (je Pixel 40 Schritte × alle Teile des Eintrags).
    var HUELLE_GESETZ = { dickeM: 0.03, sehneM: 0.06, laengsM: 2.5, einzugM: 0, seiten: 6, sichtGlieder: 22, sichtMinM: 0.03, kastenM: 0.032, roehreR: 0.75 };
    function hRaster(v) {
        return Math.round(v * 4096) / 4096 + 0;
    }
    function hFarbe(m) {
        var c = m && m.color ? m.color : null;
        return c ? [hRaster(c.r), hRaster(c.g), hRaster(c.b)] : [0.5, 0.5, 0.5];
    }
    function hKapsel(H, a, b, r, m, rolle) {
        if (!H || !(rolle === "sicht" || 2 * r >= HUELLE_GESETZ.dickeM - 1e-9)) return;
        H.push({ art: "kapsel", a: [hRaster(a.x), hRaster(a.y), hRaster(a.z)], b: [hRaster(b.x), hRaster(b.y), hRaster(b.z)], r: hRaster(r - HUELLE_GESETZ.einzugM), farbe: hFarbe(m), rolle: rolle || "wurf" });
    }
    // Die Kette entlang derselben Kurve, die die Röhre trägt (CatmullRom centripetal durch `pts`), geteilt nach dem Sehnen-
    // Fehler der Hülle (∫ √(κ / 8ε) ds, höchstens `laengsM` je Glied; der Winkel per atan2 wie das Detail-Gesetz).
    // Trägt die Kette eine GEZEICHNETE Röhre (`roehre`, ihre TubeGeometry), folgt sie deren Polygonzug — denselben Punkten,
    // die die Röhre trägt (`path.getPointAt(i / tubularSegments)`) — und lässt einen Punkt nur aus, solange die Sehne höchstens
    // `roehreR` × r neben ihm liegt (Douglas-Peucker). Vorher teilte die Kette nach eigener Sehne (≤ r) und lief neben der
    // Röhre, die selbst nach dem Detail-Gesetz (≤ 1 cm) geteilt ist: geisttor-Monolith r 1,7 cm, Wurf-IoU 0,747.
    function hRoehrenKette(H, roehre, r, m, dz) {
        var P = roehre.parameters.path, n = roehre.parameters.tubularSegments, pts = [], i;
        for (i = 0; i <= n; i++) pts.push(P.getPointAt(i / n));
        // Die Abstände auf dem Raster 2^-20 m, bei Gleichstand gewinnt der erste: ein symmetrischer Bogen trägt zwei gleich ferne
        // Punkte, und ±1 ULP einer Transzendenten (pow der Kurve, hypot der Normalen) wählte den anderen (Plattform-Probe v4: maschine).
        var Q = 1048576, tol = Math.round(Math.min(HUELLE_GESETZ.sehneM, HUELLE_GESETZ.roehreR * r) * Q), halte = [0, n], stapel = [[0, n]];
        while (stapel.length) {
            var ab = stapel.pop(), a = pts[ab[0]], b = pts[ab[1]], best = -1, wo = -1;
            var ba = new THREE.Vector3().subVectors(b, a), l2 = Math.max(1e-12, ba.lengthSq());
            for (i = ab[0] + 1; i < ab[1]; i++) {
                var t = Math.max(0, Math.min(1, new THREE.Vector3().subVectors(pts[i], a).dot(ba) / l2));
                var dd = Math.round(pts[i].distanceTo(new THREE.Vector3().copy(a).addScaledVector(ba, t)) * Q);
                if (dd > best) { best = dd; wo = i; }
            }
            if (wo >= 0 && best > tol) { halte.push(wo); stapel.push([ab[0], wo], [wo, ab[1]]); }
        }
        halte.sort(function (x, y) { return x - y; });
        for (i = 1; i < halte.length; i++) {
            var u = pts[halte[i - 1]], v = pts[halte[i]];
            hKapsel(H, new THREE.Vector3(u.x, u.y, u.z + (dz || 0)), new THREE.Vector3(v.x, v.y, v.z + (dz || 0)), r, m);
        }
    }
    function hKette(H, pts, r, m, dz, roehre) {
        if (!H || !(2 * r >= HUELLE_GESETZ.dickeM - 1e-9) || pts.length < 2) return;
        if (roehre) return hRoehrenKette(H, roehre, r, m, dz);
        var kurve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
        // die Sehne nie weiter als der Radius (eine dünne Röhre: die Kette liefe neben ihr — geisttor-Monolith r 1,7 cm)
        var N = 64, L = kurve.getLength(), ds = L / N, eps = Math.min(HUELLE_GESETZ.sehneM, Math.max(r, 0.01));
        var dichte = [0], summe = 0, t0 = kurve.getTangentAt(0), kreuz = new THREE.Vector3(), i;
        for (i = 1; i <= N; i++) {
            var t1 = kurve.getTangentAt(i / N);
            var w = Math.atan2(kreuz.crossVectors(t0, t1).length(), t0.dot(t1));
            summe += Math.max(Math.sqrt((w < 1e-9 ? 0 : w) / ds / (8 * eps)), 1 / HUELLE_GESETZ.laengsM) * ds;
            dichte.push(summe);
            t0 = t1;
        }
        var n = Math.max(1, Math.ceil(hRaster(summe))), j = 0, vor = kurve.getPointAt(0);
        for (var q = 1; q <= n; q++) {
            var z = (q / n) * summe;
            while (j < N - 1 && dichte[j + 1] < z) j++;
            var d = dichte[j + 1] - dichte[j], u = (j + (d > 0 ? Math.min(1, (z - dichte[j]) / d) : 1)) / N;
            var pt = kurve.getPointAt(Math.min(1, u));
            hKapsel(H, new THREE.Vector3(vor.x, vor.y, vor.z + (dz || 0)), new THREE.Vector3(pt.x, pt.y, pt.z + (dz || 0)), r, m);
            vor = pt;
        }
    }
    function hKasten(H, x0, y0, z0, x1, y1, z1, m, rolle) {
        if (!H) return;
        var e = HUELLE_GESETZ.einzugM, hx = (x1 - x0) / 2 - e, hy = (y1 - y0) / 2 - e, hz = (z1 - z0) / 2 - e;
        // ein Kasten fällt erst als Stab (zwei Maße unter dickeM): eine Platte wirft mit ihrer Breite (die 1,8-cm-Hölzer der
        // Tür sind 10 cm tief — unter tiefer Sonne trägt die Tiefe den Wurf, geisttor 1 006 ungedeckte Wurf-Pixel bei 25°)
        var mass3 = [x1 - x0, y1 - y0, z1 - z0].sort(function (p, q) { return p - q; });
        if (rolle !== "sicht" && !(mass3[1] >= HUELLE_GESETZ.dickeM - 1e-9)) return;
        H.push({ art: "box", c: [hRaster((x0 + x1) / 2), hRaster((y0 + y1) / 2), hRaster((z0 + z1) / 2)], h: [hRaster(hx), hRaster(hy), hRaster(hz)], farbe: hFarbe(m), rolle: rolle || "wurf" });
    }
    // Der Fern-Strang (rolle "sicht"): die Kurve nach ihrer Krümmung geteilt (∫ √(κ / 8ε) ds mit ε = r / 2, dicht am Bogen,
    // weit am Pfosten), höchstens `sichtGlieder` Glieder. Ein sicht-Teil wirft auch (das Gitter der NUR-WURF-Stufe ist die
    // ganze Liste, wie beim Haus): der Strang bleibt IM werfenden Körper — sein Radius verliert die größte Abweichung der
    // Sehnen von der Kurve; was dann dünner als `sichtMinM` bliebe, fällt (jenseits 64 m unter einem Pixel).
    function hSichtStrang(H, pts, r, m, dz) {
        if (!H || pts.length < 2) return;
        var kurve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
        var N = 64, L = kurve.getLength(), ds = L / N, eps = Math.max(0.01, r * 0.5);
        var dichte = [0], summe = 0, t0 = kurve.getTangentAt(0), kreuz = new THREE.Vector3(), i, q;
        for (i = 1; i <= N; i++) {
            var t1 = kurve.getTangentAt(i / N);
            var w = Math.atan2(kreuz.crossVectors(t0, t1).length(), t0.dot(t1));
            summe += Math.max(Math.sqrt((w < 1e-9 ? 0 : w) / ds / (8 * eps)), 1 / HUELLE_GESETZ.laengsM) * ds;
            dichte.push(summe);
            t0 = t1;
        }
        var n = Math.max(2, Math.min(HUELLE_GESETZ.sichtGlieder, Math.ceil(hRaster(summe)))), j = 0, U = [0];
        for (q = 1; q <= n; q++) {
            var z = (q / n) * summe;
            while (j < N - 1 && dichte[j + 1] < z) j++;
            var d = dichte[j + 1] - dichte[j];
            U.push(Math.min(1, (j + (d > 0 ? Math.min(1, (z - dichte[j]) / d) : 1)) / N));
        }
        var P = U.map(function (u) { return kurve.getPointAt(u); }), dev = 0;
        for (q = 0; q < n; q++)
            for (var k = 1; k < 8; k++) {
                var c = kurve.getPointAt(U[q] + ((U[q + 1] - U[q]) * k) / 8), ab = P[q + 1].clone().sub(P[q]);
                var t = Math.max(0, Math.min(1, c.clone().sub(P[q]).dot(ab) / Math.max(1e-12, ab.lengthSq())));
                dev = Math.max(dev, c.distanceTo(P[q].clone().addScaledVector(ab, t)));
            }
        var rs = r - dev;
        if (!(rs >= HUELLE_GESETZ.sichtMinM)) return;
        for (q = 0; q < n; q++) hKapsel(H, new THREE.Vector3(P[q].x, P[q].y, P[q].z + (dz || 0)), new THREE.Vector3(P[q + 1].x, P[q + 1].y, P[q + 1].z + (dz || 0)), rs, m, "sicht");
    }
    // Der Kasten um ein gebautes, ACHSGLEICHES Mesh (Stufe, Podest, Schlussstein): seine Ecken in der Lage des Tors.
    function hUm(H, me, m) {
        if (!H) return;
        me.updateMatrix();
        var g = me.geometry;
        g.computeBoundingBox();
        var b = g.boundingBox, v = new THREE.Vector3(), lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
        for (var k = 0; k < 8; k++) {
            v.set(k & 1 ? b.max.x : b.min.x, k & 2 ? b.max.y : b.min.y, k & 4 ? b.max.z : b.min.z).applyMatrix4(me.matrix);
            lo = [Math.min(lo[0], v.x), Math.min(lo[1], v.y), Math.min(lo[2], v.z)];
            hi = [Math.max(hi[0], v.x), Math.max(hi[1], v.y), Math.max(hi[2], v.z)];
        }
        hKasten(H, lo[0], lo[1], lo[2], hi[0], hi[1], hi[2], m);
    }
    // Der Abstand eines Punkts (x, y) zum konvexen Viereck `q` in xy (0 = drinnen).
    function hAussen(q, x, y) {
        var drin = false, best = Infinity, i, j;
        for (i = 0, j = 3; i < 4; j = i++) {
            var A = q[i], B = q[j];
            if (A.y > y !== B.y > y && x < ((B.x - A.x) * (y - A.y)) / (B.y - A.y) + A.x) drin = !drin;
            var ex = B.x - A.x, ey = B.y - A.y, t = Math.max(0, Math.min(1, ((x - A.x) * ex + (y - A.y) * ey) / Math.max(1e-12, ex * ex + ey * ey)));
            best = Math.min(best, Math.hypot(x - (A.x + t * ex), y - (A.y + t * ey)));
        }
        return drin ? 0 : best;
    }
    // Die Steine EINER Seite einer Ordnung (die Vierecke `steine` = [innen A, innen B, außen B, außen A] in xy, Fuge an Fuge in
    // Kettenfolge, um `z` `d` tief): steht der achsparallele Kasten eines Steins höchstens `kastenM` (der halbe Texel der nahen
    // Kaskade) aus ihm, IST er sein Kasten; die übrigen tragen EINBESCHRIEBENE Kapseln von Fuge zu Fuge. Liegt die Achse in xy,
    // trägt der Ring seine Ecken quer (z) und seine Flächen radial (0,866 r): r = min(w / √3, d / 2), breiter radial nebeneinander
    // (Abstand ≤ √3 r), tiefer übereinander (Abstand ≤ r). Je Kachel EIN Lauf über die Kette: Nachbarn teilen die Fuge, die
    // Kappe dazwischen fällt (`huelleGeometrie`); ein Kasten oder ein fehlender Stein bricht den Lauf. (Die Hüllbox eines
    // gedrehten Steins stand an der Schulter bis 81 cm aus ihm; Kapseln je Stein trugen 20 Dreiecke je Kachel.)
    function hSteinKette(H, steine, z, d, m) {
        if (!H || !steine.length) return;
        var S3 = Math.sqrt(3), lauf = [], s0, q;
        for (s0 = 0; s0 < steine.length; s0++) {
            q = steine[s0];
            var x0 = Math.min(q[0].x, q[1].x, q[2].x, q[3].x), x1 = Math.max(q[0].x, q[1].x, q[2].x, q[3].x);
            var y0 = Math.min(q[0].y, q[1].y, q[2].y, q[3].y), y1 = Math.max(q[0].y, q[1].y, q[2].y, q[3].y);
            var ue = Math.max(hAussen(q, x0, y0), hAussen(q, x1, y0), hAussen(q, x0, y1), hAussen(q, x1, y1));
            if (ue <= HUELLE_GESETZ.kastenM) {
                hKasten(H, x0, y0, z - d / 2, x1, y1, z + d / 2, m);
                lauf.push(null);
            } else lauf.push(q);
        }
        var erst = null;
        for (s0 = 0; s0 < lauf.length && !erst; s0++) erst = lauf[s0];
        if (!erst) return;
        var w = (erst[3].distanceTo(erst[0]) + erst[2].distanceTo(erst[1])) / 2, r = Math.min(w / S3, d / 2);
        var nW = Math.max(1, Math.ceil((w - S3 * r) / (S3 * r) - 1e-9) + 1), nZ = Math.max(1, Math.ceil((d - 2 * r) / r - 1e-9) + 1);
        for (var i = 0; i < nW; i++)
            for (var k = 0; k < nZ; k++) {
                var f = nW > 1 ? ((S3 / 2) * r + (i * (w - S3 * r)) / (nW - 1)) / w : 0.5;
                var zz = nZ > 1 ? z - d / 2 + r + (k * (d - 2 * r)) / (nZ - 1) : z;
                for (s0 = 0; s0 < lauf.length; s0++) {
                    q = lauf[s0];
                    if (!q) continue;
                    var A = q[0].clone().lerp(q[3], f), B = q[1].clone().lerp(q[2], f);
                    hKapsel(H, new THREE.Vector3(A.x, A.y, zz), new THREE.Vector3(B.x, B.y, zz), r, m);
                }
            }
    }
    // Ein gedrehter Kasten (Schutt; Kanten `sx · sy · sz` in seinem Raum, Lage `me.matrix`): einbeschriebene Kapseln entlang der
    // längsten Kante, r = halbe kürzeste, quer nebeneinander (Abstand ≤ √3 r; der Ring liegt in jeder Drehung im Kreis r).
    function hDrehKasten(H, me, sx, sy, sz, m) {
        if (!H) return;
        me.updateMatrix();
        var L = [[sx, new THREE.Vector3(1, 0, 0)], [sy, new THREE.Vector3(0, 1, 0)], [sz, new THREE.Vector3(0, 0, 1)]].sort(function (u, v) { return v[0] - u[0]; });
        var r = L[2][0] / 2, n = Math.max(1, Math.ceil((L[1][0] - 2 * r) / (Math.sqrt(3) * r) - 1e-9) + 1);
        for (var i = 0; i < n; i++) {
            var t = n > 1 ? -L[1][0] / 2 + r + (i * (L[1][0] - 2 * r)) / (n - 1) : 0;
            var a = L[0][1].clone().multiplyScalar(-L[0][0] / 2).addScaledVector(L[1][1], t).applyMatrix4(me.matrix);
            var b = L[0][1].clone().multiplyScalar(L[0][0] / 2).addScaledVector(L[1][1], t).applyMatrix4(me.matrix);
            hKapsel(H, a, b, r, m);
        }
    }
    // DAS GITTER DER LISTE (die Stufe 3): Kasten 12 Dreiecke, Kapsel ein `seiten`-Prisma mit flachen Kappen (es endet an a und b
    // wie die Röhre, deren Wurf es trägt; die Spitzen standen r über jedes Röhren-Ende hinaus) — EIN Mesh, INDIZIERT: je Teil
    // seine Ecken einmal (Kasten 8, Kapsel 2·seiten), die Dreiecke in derselben Reihenfolge über den Index. Die Suppe trug je
    // Kapsel 60 Ecken statt 12 in den Speicher und in jede Kaskade (1310-3, Genesis: die L3-Puffer der Tore ~2,3 MB); das Gitter
    // wirft nur, seine Normalen liest kein Bild.
    function huelleGeometrie(teile) {
        var pos = [], idx = [], ecke = 0;
        var V0 = function (p) {
            pos.push(p[0], p[1], p[2]);
            return ecke++;
        };
        var tri = function (a, b, c) {
            idx.push(a, b, c);
        };
        for (var i = 0; i < teile.length; i++) {
            var t = teile[i];
            if (t.art === "box") {
                var c = t.c, h = t.h, F = [[0, 2, 3, 1], [4, 5, 7, 6], [0, 4, 6, 2], [1, 3, 7, 5], [0, 1, 5, 4], [2, 6, 7, 3]];
                var V = [];
                for (var k = 0; k < 8; k++) V.push(V0([c[0] + (k & 1 ? h[0] : -h[0]), c[1] + (k & 2 ? h[1] : -h[1]), c[2] + (k & 4 ? h[2] : -h[2])]));
                for (var f = 0; f < 6; f++) {
                    tri(V[F[f][0]], V[F[f][1]], V[F[f][2]]);
                    tri(V[F[f][0]], V[F[f][2]], V[F[f][3]]);
                }
            } else {
                var A = new THREE.Vector3(t.a[0], t.a[1], t.a[2]), B = new THREE.Vector3(t.b[0], t.b[1], t.b[2]), ax = B.clone().sub(A);
                var len = ax.length();
                if (len < 1e-6) ax.set(0, 1, 0);
                else ax.divideScalar(len);
                var u = Math.abs(ax.y) < 0.9 ? new THREE.Vector3(0, 1, 0).cross(ax).normalize() : new THREE.Vector3(1, 0, 0).cross(ax).normalize();
                var w = ax.clone().cross(u), n = HUELLE_GESETZ.seiten, RA = [], RB = [];
                for (var s = 0; s < n; s++) {
                    var a = (s / n) * Math.PI * 2, cs = Math.cos(a) * t.r, sn = Math.sin(a) * t.r;
                    RA.push(V0([A.x + u.x * cs + w.x * sn, A.y + u.y * cs + w.y * sn, A.z + u.z * cs + w.z * sn]));
                    RB.push(V0([B.x + u.x * cs + w.x * sn, B.y + u.y * cs + w.y * sn, B.z + u.z * cs + w.z * sn]));
                }
                // die Kappen nur an den Enden einer Kette: ein Glied, dessen Nachbar am selben Punkt anschließt, trägt dort keine
                // (die Kappe läge im Nachbar-Glied) — die Liste trägt die Ketten in ihrer Reihenfolge
                var vorG = teile[i - 1], nachG = teile[i + 1];
                var kA = !(vorG && vorG.art === "kapsel" && vorG.b[0] === t.a[0] && vorG.b[1] === t.a[1] && vorG.b[2] === t.a[2]);
                var kB = !(nachG && nachG.art === "kapsel" && nachG.a[0] === t.b[0] && nachG.a[1] === t.b[1] && nachG.a[2] === t.b[2]);
                for (var q = 0; q < n; q++) {
                    var r2 = (q + 1) % n;
                    tri(RA[q], RB[q], RB[r2]);
                    tri(RA[q], RB[r2], RA[r2]);
                    // die flache Kappe als Fächer aus der ersten Ecke (n − 2 Dreiecke)
                    if (q > 0 && q < n - 1) {
                        if (kA) tri(RA[0], RA[q + 1], RA[q]);
                        if (kB) tri(RB[0], RB[q], RB[q + 1]);
                    }
                }
            }
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        return geo;
    }
    // Der EINE Schatten-Stoff (das Muster fachwerk-core `wurfStoff`): unsichtbar, beidseitig, alphaTest 0,5, gestempelt
    // `__stoff` "schatten" (die Brücke reicht ihn als kind "schatten"), Seh-Klasse stoff; jede Ecke deckt (`aDeckt` 1).
    var _torWurfStoff = null;
    function torWurfStoff() {
        if (!_torWurfStoff) {
            _torWurfStoff = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide, alphaTest: 0.5 });
            _torWurfStoff.userData.__stoff = "schatten";
            _torWurfStoff.userData.__seh = "stoff";
        }
        return _torWurfStoff;
    }
    function huelleGruppe(teile) {
        var geo = huelleGeometrie(teile), n = geo.attributes.position.count;
        geo.setAttribute("aDeckt", new THREE.Float32BufferAttribute(new Float32Array(n).fill(1), 1));
        geo.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
        var me = new THREE.Mesh(geo, torWurfStoff());
        me.castShadow = true;
        var g = new THREE.Group();
        g.add(me);
        return g;
    }
    // ═══ Geometrie-Hilfen (byte-treu, Z.46–51; Röhren und Ringe teilen nach dem Detail-Gesetz) ═══
    // prettier-ignore
    function tubeMesh(pts,r,m,seg,rad,r0){var kv=new THREE.CatmullRomCurve3(pts,false,'centripetal');if(fein(2*r))return buche(_buch?roehreL0(kv,r0||r,seg||140,rad||8):0,new THREE.Group());var sk=sehnenKurve(kv,seg||140,null,_buch?TOR_DETAIL:null),n=umfangTeilung(r,rad||8);return buche(_buch?2*sk.n0*umfangMit(TOR_DETAIL,r0||r,rad||8):0,new THREE.Mesh(new THREE.TubeGeometry(sk.kurve,sk.n,breiteTreu(r,umfangMit(TOR_DETAIL,r,rad||8),n),n,false),m));}
    // prettier-ignore
    function torusMesh(R,r,m,x,y,z){var l0=_buch?ringL0(R,r,8,20):0;if(fein(2*r))return buche(l0,new THREE.Group());var me=buche(l0,new THREE.Mesh(ringGeometrie(R,r,8,20),m));me.position.set(x,y,z);return me;}
    // prettier-ignore
    function barBetween(x0,y0,x1,y1,m,z,th){if(fein(th||0.04))return buche(12,new THREE.Group());var dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy)||0.01;var b=new THREE.Mesh(new THREE.BoxGeometry(len,th||0.04,0.1),m);b.position.set((x0+x1)/2,(y0+y1)/2,z);b.rotation.z=Math.atan2(dy,dx);return buche(12,b);}
    // prettier-ignore
    function quadBlock(c,depth,mat,zOff,jit){var cx=(c[0].x+c[1].x+c[2].x+c[3].x)/4,cy=(c[0].y+c[1].y+c[2].y+c[3].y)/4;var sh=new THREE.Shape();sh.moveTo(c[0].x-cx,c[0].y-cy);sh.lineTo(c[1].x-cx,c[1].y-cy);sh.lineTo(c[2].x-cx,c[2].y-cy);sh.lineTo(c[3].x-cx,c[3].y-cy);sh.lineTo(c[0].x-cx,c[0].y-cy);var bv=!fein(0.015),dz=bv?depth:depth+0.03;var g=new THREE.ExtrudeGeometry(sh,{depth:dz,bevelEnabled:bv,bevelThickness:0.015,bevelSize:0.015,bevelSegments:1});g.translate(0,0,-dz/2);var me=new THREE.Mesh(g,mat);me.position.set(cx,cy,zOff+jit);me.castShadow=me.receiveShadow=true;return buche(_buch?steinL0():0,me);}
    // in-plane Normalen entlang Pfad (auswaerts vom Aperturzentrum)
    // prettier-ignore
    function normalsAlong(pts,refY){var N=pts.length,F=[];for(var i=0;i<N;i++){var a=pts[Math.max(0,i-1)],b=pts[Math.min(N-1,i+1)];var tx=b.x-a.x,ty=b.y-a.y,L=Math.hypot(tx,ty)||1;tx/=L;ty/=L;var nx=-ty,ny=tx;if((pts[i].x)*nx+(pts[i].y-refY)*ny<0){nx=-nx;ny=-ny;}F.push([nx,ny]);}return F;}

    // ============================================================
    //  EIN BUILDER — Strategien × ORDNUNGEN (gestaffelt, zurueckweichend).
    //  Byte-treu aus worlds/portale/porta.js Z.56–184 extrahiert; die Naht:
    //  Szene-Glue (scene.add/remove · Membran · Nebel · Kamera · UI) blieb in
    //  der Shell — hier nur die STRUKTUR-Substanz. doorAngles {front,back}
    //  (Radiant, Default 0=zu) ersetzt die Shell-Globals doorAngle/doorAngleB;
    //  Rückgabe: {gate, D, leafL, leafR, leafLB, leafRB, rimMat} — die Shell
    //  verdrahtet daraus ihre Animations-Referenzen.
    // ============================================================
    // ── die RAHMEN-STAFFELUNG als reine Ableitung (V18.464, extrahiert byte-treu
    //    aus buildGate — der Beweis ist gate:porta-contract; membranUniforms +
    //    der Welt-Leser [Kollisions-Hülle] lesen DIESELBE Formel, kein Nachbau). ──
    // prettier-ignore
    function deriveFrame(p,D){
      var M=D.M;
      var frameDepth=Math.max(0.4,M*0.7);
      var depthStep=(frameDepth*0.6)*(0.4+p.depth);
      var ordersUser=Math.max(1,Math.round(p.orders));
      var orders=(p.wLace>0.03)?Math.max(ordersUser,1+Math.ceil(1.0/Math.max(0.18,depthStep))):ordersUser;   // Türfreiheit als Funktion der Tiefe, nicht fix 5
      return {frameDepth:frameDepth,depthStep:depthStep,orders:orders,zFace:(orders-1)*depthStep+0.06};
    }

    // prettier-ignore
    function buildGate(p,doorAngles,HU){
      var doorAngle=doorAngles&&typeof doorAngles.front==="number"?doorAngles.front:0;
      var doorAngleB=doorAngles&&typeof doorAngles.back==="number"?doorAngles.back:0;
      var leafL=null,leafR=null,leafLB=null,leafRB=null,rimMat=null;
      var D=deriveGate(p);var rng=mulberry32(0x50FA);
      var M=D.M,baseY=D.baseY,springY=D.springY,apexY=D.apexY,jambW=D.jambW,prof=D.prof;
      var FR=deriveFrame(p,D);
      var frameDepth=FR.frameDepth,refY=baseY+D.jambH*0.5;
      var depthStep=FR.depthStep;
      var orders=FR.orders;
      D.orders=orders;D.depthStep=depthStep;D.zFace=FR.zFace;
      var gate=new THREE.Group();
      // DAS FARB-GESETZ (Architektur-Welle 05.10.): der STEIN mischt LINEAR zwischen Granit (sRGB-Absicht 0x8e939a, linear
      // Y 0,29) und Sandstein (0xb59a74, Y 0,34) — die Welt liest den linearen Wert. Bis 05.10. las sie den HSL-Ton roh
      // (Hellwert 0,40 → Albedo 0,37–0,44, das Tor stand kalkweiß), und der Ton wanderte über Grün (hue 0,3–0,6: türkiser
      // Stein, sobald man ihn linear liest). Ein Metall-Rahmen (metal ≥ 0,5) trägt seine Spiegelfarbe F0 wie bisher.
      var stone=p.metal<0.5?new THREE.Color(0x8e939a).convertSRGBToLinear().lerp(new THREE.Color(0xb59a74).convertSRGBToLinear(),p.hue):new THREE.Color().setHSL(0.62-(0.62-0.07)*p.hue,0.16+0.14*p.hue,0.40);
      var fmat=new THREE.MeshStandardMaterial({color:stone,roughness:lerp(0.88,0.16,p.metal),metalness:lerp(0.05,0.97,p.metal),emissive:new THREE.Color().setHSL(0.09,0.7,0.5),emissiveIntensity:lerp(0.04,0.55,p.glow)});
      var amat=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(0.11,0.6,0.55),roughness:0.28,metalness:1.0,emissive:0x2a1c06,emissiveIntensity:0.3+0.6*p.glow});
      var bmatG=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(0.11,0.7,0.55),roughness:0.2,metalness:1.0,emissive:new THREE.Color().setHSL(0.09,0.8,0.4),emissiveIntensity:0.4+0.6*p.glow});
      var bmatB=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(0.6,0.7,0.5),roughness:0.28,metalness:0.92,emissive:new THREE.Color().setHSL(0.62,0.8,0.35),emissiveIntensity:0.4+0.5*p.glow});
      var laceMat=new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(0.11,0.7,0.6).multiplyScalar(0.55+1.05*Math.max(p.glow,0.25))});
      rimMat=new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(0.11,0.6,0.55).multiplyScalar(0.55+1.5*Math.max(p.glow,0.25))});
      // DIE SEH-KLASSE je Stoff (Integration W8, rein additiv — docs/studio-vertrag.md B2c): was der Stoff dem AUGE ist (phyto-core
      // BUDGET_GESETZ.seh); das Budget-Gesetz faltet nur innerhalb EINER. Der Rahmen ist Metall, sobald seine Metallizität ≥ 0,5,
      // sonst Stein (stoff); Bogen und Bänder sind Metall; die ungelitten Leucht-Linien (Spitze, Saum) und die Licht-Scheibe glühen.
      fmat.userData.__seh=fmat.metalness>=0.5?"metall":"stoff";amat.userData.__seh="metall";bmatG.userData.__seh="metall";bmatB.userData.__seh="metall";laceMat.userData.__seh="glut";rimMat.userData.__seh="glut";

      // ---- symmetrische Halbkante (Basis->Scheitel) + Normalen, einmal ----
      var nJ=7,j,half=[];
      for(j=0;j<=nJ;j++)half.push(new THREE.Vector3(D.leftSpringX,baseY+(springY-baseY)*j/nJ,0));
      for(var i=0;i<prof.pts.length;i++)if(prof.pts[i][0]<=1e-6)half.push(new THREE.Vector3(prof.pts[i][0],springY+prof.pts[i][1],0));
      var H=[half[0]];for(i=1;i<half.length;i++)if(half[i].distanceToSquared(H[H.length-1])>1e-6)H.push(half[i]);
      var hc=new THREE.CatmullRomCurve3(H,false,'centripetal'),hLen=hc.getLength();
      var Nh=Math.max(5,Math.round(hLen/(M*0.42)));var sp=hc.getSpacedPoints(Nh),nrm=normalsAlong(sp,refY);
      // volle Kante (Pfosten-Bogen-Pfosten) fuer Geflecht/Monolith
      var full=[];for(j=0;j<=nJ;j++)full.push(new THREE.Vector3(D.leftSpringX,baseY+(springY-baseY)*j/nJ,0));
      for(i=0;i<prof.pts.length;i++)full.push(new THREE.Vector3(prof.pts[i][0],springY+prof.pts[i][1],0));
      for(j=0;j<=nJ;j++)full.push(new THREE.Vector3(D.rightSpringX,springY-(springY-baseY)*j/nJ,0));
      var FU=[full[0]];for(i=1;i<full.length;i++)if(full[i].distanceToSquared(FU[FU.length-1])>1e-6)FU.push(full[i]);
      var fnrm=normalsAlong(FU,refY);

      function offsetFull(off){var o=[];for(var i=0;i<FU.length;i++)o.push(new THREE.Vector3(FU[i].x+fnrm[i][0]*off,FU[i].y+fnrm[i][1]*off,0));return o;}

      // ======== Pro ORDNUNG: zurueckweichend in z, nach aussen versetzt ========
      for(var o=0;o<orders;o++){
        var outOff=o*jambW, dep=frameDepth*(1+o*0.18), dens=(o===0?1:(o===1?0.7:0.5));
        var zoffs=(o===0)?[0]:[o*depthStep,-o*depthStep];                       // symmetrisch um z=0 → beidseitig durchgehbar
        for(var zi=0;zi<zoffs.length;zi++){var zO=zoffs[zi];
          if(p.wMason>0.03){var rad=jambW*p.wMason,steinL=[],steinR=[],bandL=[],bandR=[],SB=!!_detail.steinband;   // SB: das Stein-Band der Stufe (der Würfel jedes Steins fällt wie gebaut — der Strom bleibt)
            for(i=0;i<Nh-1;i++){
              var inA=new THREE.Vector3(sp[i].x+nrm[i][0]*outOff,sp[i].y+nrm[i][1]*outOff,0);
              var inB=new THREE.Vector3(sp[i+1].x+nrm[i+1][0]*outOff,sp[i+1].y+nrm[i+1][1]*outOff,0);
              var ouA=new THREE.Vector3(sp[i].x+nrm[i][0]*(outOff+rad),sp[i].y+nrm[i][1]*(outOff+rad),0);
              var ouB=new THREE.Vector3(sp[i+1].x+nrm[i+1][0]*(outOff+rad),sp[i+1].y+nrm[i+1][1]*(outOff+rad),0);
              if(!(p.ruin>0&&rng()<p.ruin*0.4)){if(SB){rng();bandL.push([inA,inB,ouA,ouB]);}else{var qb=quadBlock([inA,inB,ouB,ouA],dep,fmat,zO,(rng()-0.5)*p.weather*0.02);gate.add(qb);steinL.push([inA,inB,ouB,ouA]);}}else if(SB)bandL.push(null);
              if(!(p.ruin>0&&rng()<p.ruin*0.4)){var mA=inA.clone();mA.x*=-1;var mB=inB.clone();mB.x*=-1;var oA=ouA.clone();oA.x*=-1;var oB=ouB.clone();oB.x*=-1;if(SB){rng();bandR.push([mA,mB,oA,oB]);}else{var qm=quadBlock([mB,mA,oA,oB],dep,fmat,zO,(rng()-0.5)*p.weather*0.02);gate.add(qm);steinR.push([mB,mA,oA,oB]);}}else if(SB)bandR.push(null);
            }
            if(SB){steinBaender(gate,bandL,dep,fmat,zO);steinBaender(gate,bandR,dep,fmat,zO);}
            if(HU){hSteinKette(HU,steinL,zO,dep,fmat);hSteinKette(HU,steinR.reverse(),zO,dep,fmat);}
          }
          if(p.wBraid>0.03&&(o<2||orders<3)){
            var oc=offsetFull(outOff+jambW*0.5),Fb=new THREE.CatmullRomCurve3(oc,false,'centripetal').getSpacedPoints(280);
            var fn=normalsAlong(Fb,refY),rho=jambW*0.5*p.wBraid,fib=lerp(0.02,0.05,p.wBraid)*dens,turns=14,zoBr=zO;
            var strands=function(cnt,rh,hd,ph0,mat){for(var c=0;c<cnt;c++){var ph=ph0+c*(Math.PI*2/cnt)+rng()*0.1;var faellt=c%(_detail.straehnen||1);if(faellt&&!_buch)continue;var pts=[];for(var q=0;q<Fb.length;q++){var s=q/(Fb.length-1),er=Math.min(s,1-s),ramp=Math.max(0,1-er/0.12),rE=rh*(1+0.7*ramp),ang=ph+hd*turns*2*Math.PI*s;var off=Math.cos(ang)*rE,zz=Math.sin(ang)*rE;pts.push(new THREE.Vector3(Fb[q].x+fn[q][0]*off,Fb[q].y+fn[q][1]*off-ramp*0.18,zoBr+zz));}if(faellt){buche(roehreL0(new THREE.CatmullRomCurve3(pts,false,'centripetal'),fib,240,6));continue;}var t=tubeMesh(pts,fib*(_detail.straehnen||1),mat,240,6,fib);t.castShadow=true;gate.add(t);}};
            var ns=Math.round(6*dens);strands(ns,rho*1.05,1,0,bmatG);strands(ns,rho*0.8,-1,Math.PI/6,bmatB);if(HU){var bSt=4,bK=[];for(var bj=0;bj<2*bSt+1;bj++)bK.push([]);for(var bq=0;bq<Fb.length;bq++){var bs=bq/(Fb.length-1),ber=Math.min(bs,1-bs),bramp=Math.max(0,1-ber/0.12),bp=new THREE.Vector3(Fb[bq].x,Fb[bq].y-bramp*0.18,0);for(var bj=0;bj<2*bSt+1;bj++){var b0=bj<bSt?bj*0.12/bSt:bj===bSt?0.12:0.88+(bj-bSt-1)*0.12/bSt,b1=bj<bSt?(bj+1)*0.12/bSt:bj===bSt?0.88:0.88+(bj-bSt)*0.12/bSt;if(bs>=b0-1e-9&&bs<=b1+1e-9)bK[bj].push(bp);}}for(var bj=0;bj<2*bSt+1;bj++){var bE0=bj<bSt?bj*0.12/bSt:bj===bSt?0.12:1-(0.88+(bj-bSt)*0.12/bSt);hKette(HU,bK[bj],rho*1.05*(1+0.7*Math.max(0,1-bE0/0.12))+fib,bmatG,zoBr);}}
          }
          if(p.wMono>0.03){var oc2=offsetFull(outOff+jambW*0.5),mt=tubeMesh(oc2,jambW*0.5*p.wMono+0.01,fmat,170,12);mt.position.z=zO;hKette(HU,oc2,jambW*0.5*p.wMono+0.01,fmat,zO,mt.geometry);mt.castShadow=true;gate.add(mt);}
          if(o===0&&p.wMason>0.03){var rad2=jambW*p.wMason,ay=springY+D.rise;                       // Schlussstein zentral (von beiden Seiten sichtbar)
            var kb=new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.12,M*0.28),rad2*1.25,dep*1.15),fmat);kb.position.set(0,ay+rad2*0.12,0);kb.castShadow=true;gate.add(kb);hUm(HU,kb,fmat);
            var jw=buche(8,fein(rad2*0.68)?new THREE.Group():new THREE.Mesh(new THREE.OctahedronGeometry(rad2*0.34,0),amat));jw.position.set(0,ay+rad2*0.12,0);gate.add(jw);}
        }
      }
      // --- TÜREN: vordere (E) + hintere (R) Flügel, beide an der vordersten Maueröffnung gelagert ---
      if(p.wLace>0.03){
        var zFace=D.zFace, nMull=Math.round(lerp(1,5,p.wLace));
        var frontOff=(orders-1)*jambW, FB=offsetFull(frontOff), apexIdx=0;        // vorderste Öffnung (= innere Kante des vordersten Ordens)
        for(var ii=0;ii<FB.length;ii++)if(FB[ii].y>FB[apexIdx].y)apexIdx=ii;
        var lxg=FB[0].x, rxg=FB[FB.length-1].x;
        var makeLeaf=function(side,zf){                                            // ein Flügel = halbe Maueröffnung, gelagert an der Außenkante
          var grp=new THREE.Group();
          var seg=side<0?FB.slice(0,apexIdx+1):FB.slice(apexIdx).reverse();        // von Außenkante(unten) → Scheitel(Mitte)
          var hingeX=seg[0].x, apexX=seg[seg.length-1].x, apY=seg[seg.length-1].y;
          grp.add(tubeMesh(seg,0.05,laceMat,Math.max(48,seg.length*4),6));         // Außenstiel + Bogen folgen dem Stein
          // (kein mittiger Schlagstiel — er stand als Balken vor dem Sheet; die Flügel treffen sich am Maßwerk-Rand & Bogenscheitel)
          grp.add(barBetween(hingeX,baseY+0.02,apexX,baseY+0.02,laceMat,0,0.05));  // unteres Holz auf der Schwelle
          grp.add(barBetween(hingeX,springY,apexX,springY,laceMat,0,0.05));        // Kämpferholz
          if(D.jambH>2.0)grp.add(barBetween(hingeX,baseY+D.jambH*0.5,apexX,baseY+D.jambH*0.5,laceMat,0,0.045));
          var segTopY=function(x){var best=baseY;for(var si=0;si<seg.length-1;si++){var pa=seg[si],pb=seg[si+1];if((pa.x-x)*(pb.x-x)<=0.0&&Math.abs(pb.x-pa.x)>1e-5){var tt=(x-pa.x)/(pb.x-pa.x),yy=pa.y+tt*(pb.y-pa.y);if(yy>best)best=yy;}}return best;};
          var nM2=Math.max(2,Math.round(2+nMull*0.6)),innerXs=[];                  // Pfosten bis zur BOGENLINIE (füllt das Feld)
          for(var k=1;k<=nM2;k++){var fx=hingeX+(apexX-hingeX)*k/(nM2+1);innerXs.push(fx);grp.add(barBetween(fx,baseY+0.02,fx,segTopY(fx)-0.03,laceMat,0,0.04));}
          var edgesX=[hingeX].concat(innerXs,[apexX]);
          for(var bj=0;bj<edgesX.length-1;bj++){                                   // je Feld: Haupt-Spitzbogen + verschachtelte Sub-Tracery (Tiefe)
            var a0=edgesX[bj],a1=edgesX[bj+1],am=(a0+a1)/2,ww=Math.abs(a1-a0);if(Math.abs(am)<0.42)continue;  // nur innerstes Feld frei → Mittelnaht sauber (volle Tracery sonst)
            var topF=Math.min(segTopY(am)-0.04, springY+ww*1.15);
            var Lp=[],Rp=[];for(var s=0;s<=8;s++){var tt=s/8;Lp.push(new THREE.Vector3(lerp(a0,am,tt),lerp(springY,topF,tt*tt),0));Rp.push(new THREE.Vector3(lerp(a1,am,tt),lerp(springY,topF,tt*tt),0));}
            grp.add(tubeMesh(Lp,0.022,laceMat,20,5));grp.add(tubeMesh(Rp,0.022,laceMat,20,5));
            if(ww>0.46){                                                           // NESTED Sub-Tracery auf ALLEN Feldern (volle gotische Tiefe — nicht abtragen)
              var subTop=springY+(topF-springY)*0.60, qL=(a0+am)/2, qR=(am+a1)/2;
              grp.add(barBetween(am,springY,am,subTop+0.03,laceMat,0,0.018));
              var sA=[],sB=[],sC=[],sD=[];for(var s2=0;s2<=6;s2++){var u=s2/6;
                sA.push(new THREE.Vector3(lerp(a0,qL,u),lerp(springY,subTop,u*u),0));sB.push(new THREE.Vector3(lerp(am,qL,u),lerp(springY,subTop,u*u),0));
                sC.push(new THREE.Vector3(lerp(am,qR,u),lerp(springY,subTop,u*u),0));sD.push(new THREE.Vector3(lerp(a1,qR,u),lerp(springY,subTop,u*u),0));}
              grp.add(tubeMesh(sA,0.012,laceMat,14,4));grp.add(tubeMesh(sB,0.012,laceMat,14,4));grp.add(tubeMesh(sC,0.012,laceMat,14,4));grp.add(tubeMesh(sD,0.012,laceMat,14,4));
              var foilR=Math.min(ww*0.15,0.12),foilY=subTop+(topF-subTop)*0.55,nFoil=4+Math.floor((p.realm*3.0+Math.abs(am)*1.7)%3.0);grp.add(torusMesh(foilR*0.5,0.010,laceMat,am,foilY,0));for(var pf=0;pf<nFoil;pf++){var pfa=pf/nFoil*6.2831+p.realm*1.5;grp.add(torusMesh(foilR*0.42,0.009,(p.wBraid>0.25&&pf%2)?bmatB:laceMat,am+Math.cos(pfa)*foilR*0.6,foilY+Math.sin(pfa)*foilR*0.6,0));}  // Mehrpass: Blattzahl aus realm+Feld (symmetrisch); Geflecht>0.25 → blaue Akzente = Verschmelzung Braid×Lace
              grp.add(torusMesh(ww*0.07,0.008,laceMat,qL,subTop*0.5+springY*0.5+0.05,0));                 // Dreipass in Sub-Zwickeln
              grp.add(torusMesh(ww*0.07,0.008,laceMat,qR,subTop*0.5+springY*0.5+0.05,0));
            }
            var zw=segTopY(am)-topF;if(zw>0.09)grp.add(torusMesh(Math.min(ww*0.17,zw*0.42),0.013,laceMat,am,topF+zw*0.5,0));
          }
          var oRos=Math.min(0.15,Math.abs(apexX-hingeX)*0.16);                     // Halb-Rose am Scheitel (zwei Flügel → volle Rose) — Math.abs: auch rechter Flügel
          if(oRos>0.05){var oy=apY-oRos*1.7;grp.add(torusMesh(oRos,0.016,laceMat,apexX,oy,0));var nf=5;for(var fi=0;fi<nf;fi++){var fa=fi/nf*6.2831;grp.add(torusMesh(oRos*0.33,0.011,laceMat,apexX+Math.cos(fa)*oRos*0.62,oy+Math.sin(fa)*oRos*0.62,0));}}
          // (kein mittiger Griff — E/R öffnet; nichts soll vor dem Sheet stehen)
          grp.children.forEach(function(c){c.position.x-=hingeX;});grp.position.set(hingeX,0,zf);if(!_detail.tuerFest)grp.userData.side=side;return grp;
        };
        leafL=makeLeaf(-1,zFace);leafR=makeLeaf(1,zFace);leafLB=makeLeaf(-1,-zFace);leafRB=makeLeaf(1,-zFace);
        leafL.rotation.y=-doorAngle;leafR.rotation.y=doorAngle;leafLB.rotation.y=doorAngleB;leafRB.rotation.y=-doorAngleB;  // vorne→+z, hinten→-z
        gate.add(leafL);gate.add(leafR);gate.add(leafLB);gate.add(leafRB);
        var hxA=[lxg,rxg];                                                          // Scharniere an beiden Maueröffnungen → am Stein, Bügel zur Tür
        for(var zfi=0;zfi<2;zfi++){var zf=zfi===0?zFace:-zFace;for(var hsI=0;hsI<2;hsI++){var hx=hxA[hsI],hsg=hsI===0?-1:1;for(var hk=0;hk<5;hk++){var hy=baseY+0.2+hk*((springY-baseY-0.35)/4);var zr=breiteTreu(0.055,TOR_DETAIL.zylinder,_detail.zylinder),cyl=buche(4*TOR_DETAIL.zylinder,fein(2*zr)?new THREE.Group():new THREE.Mesh(new THREE.CylinderGeometry(zr,zr,0.26,_detail.zylinder),amat));cyl.position.set(hx,hy,zf);cyl.castShadow=true;gate.add(cyl);var br=buche(12,fein(0.045)?new THREE.Group():new THREE.Mesh(new THREE.BoxGeometry(0.16,0.045,0.06),amat));br.position.set(hx-hsg*0.08,hy,zf);gate.add(br);hKapsel(HU,new THREE.Vector3(hx,hy-0.13,zf),new THREE.Vector3(hx,hy+0.13,zf),0.055,amat);}}}
      }
      // --- FUNDAMENT: parametrisches Vokabular (abgeleitet aus Strategie × Masse × Ruine) ---
      var fullW=2*(M+jambW*orders),baseDepth=frameDepth+0.6+depthStep*2*orders,baseZ=0;
      if(p.wMason*p.mass>0.05){var nStep=1+Math.round(p.wMason*2),sH=0.12+0.32*p.mass;          // 1) Stylobat: zurueckspringende Stufen
        for(var st=0;st<nStep;st++){var sw=fullW+0.4+st*0.7,sd2=baseDepth+st*0.7;var me=new THREE.Mesh(new THREE.BoxGeometry(sw,sH,sd2),fmat);me.position.set(0,baseY-sH/2-st*sH,baseZ);me.castShadow=me.receiveShadow=true;gate.add(me);hUm(HU,me,fmat);}}
      if(p.wBraid*p.mass>0.05){var nR=Math.round(lerp(3,7,p.wBraid)),jx=Math.abs(D.leftSpringX)+jambW*0.5;   // 2) Wurzeln am PFOSTENFUSS (außen), tauchen schräg in den Boden — nie in Öffnung/Sheet-Ebene
        for(var sdb=-1;sdb<=1;sdb+=2)for(var rr2=0;rr2<nR;rr2++){var spread=0.16+rr2*0.13,zr=(rr2-(nR-1)*0.5)*0.16;
          var pts=[new THREE.Vector3(sdb*jx,baseY+0.05,zr*0.5),new THREE.Vector3(sdb*(jx+spread*0.6),baseY-0.18,zr*0.9),new THREE.Vector3(sdb*(jx+spread),baseY-0.50-rr2*0.05,zr*1.3)];
          var tb=tubeMesh(pts,0.05+0.03*(1-rr2/nR),(rr2%2)?bmatB:bmatG,36,5);hKette(HU,pts,0.05+0.03*(1-rr2/nR),(rr2%2)?bmatB:bmatG,0,tb.geometry);tb.castShadow=true;gate.add(tb);}}
      if(p.wMono*p.mass>0.05){var pw=fullW+0.5,ph=0.2+0.3*p.mass;                                // 3) Tech-Podest mit Leuchtnaht
        var pl=new THREE.Mesh(new THREE.BoxGeometry(pw,ph,baseDepth+0.3),fmat);pl.position.set(0,baseY-ph/2,baseZ);pl.castShadow=pl.receiveShadow=true;gate.add(pl);hUm(HU,pl,fmat);
        var seam=buche(12,fein(0.03)?new THREE.Group():new THREE.Mesh(new THREE.BoxGeometry(pw*0.9,0.03,baseDepth*0.25),rimMat));seam.position.set(0,baseY-ph+0.05,baseZ+baseDepth*0.25);gate.add(seam);}
      if(p.glow>0.3||(p.wLace>0.4&&p.mass<0.4)){var rg=buche(_buch?ringL0(M+jambW*0.5+0.3,0.05+0.05*p.glow,10,48):0,new THREE.Mesh(ringGeometrie(M+jambW*0.5+0.3,0.05+0.05*p.glow,10,48),rimMat));rg.rotation.x=Math.PI/2;rg.position.set(0,baseY+0.02,baseZ);gate.add(rg);  // 4) Leuchtende Dais
        var disc=buche(40,new THREE.Mesh(new THREE.CircleGeometry(M+jambW*0.5,kreisTeilung(M+jambW*0.5)),new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(0.11,0.5,0.5).multiplyScalar(0.3+p.glow),transparent:true,opacity:0.2+0.4*p.glow,side:THREE.DoubleSide})));disc.material.userData.__seh="glut";disc.rotation.x=-Math.PI/2;disc.position.set(0,baseY+0.012,baseZ);gate.add(disc);}
      if(p.ruin>0.2){var nRub=Math.round(p.ruin*8);for(var rbk=0;rbk<nRub;rbk++){var rsz=0.15+rng()*0.38;var rk=new THREE.Mesh(new THREE.BoxGeometry(rsz,rsz*0.7,rsz),fmat);rk.position.set((rng()-0.5)*fullW*1.3,baseY+rsz*0.3,baseZ+(rng()-0.5)*baseDepth*0.6);rk.rotation.set(rng()*1.5,rng()*3,rng()*1.5);rk.castShadow=true;gate.add(rk);hDrehKasten(HU,rk,rsz,rsz*0.7,rsz,fmat);}}  // 5) Schutt

      // --- gluehende Apertur-Kante (Trichter) ---
      var rimPts=[];for(i=0;i<prof.pts.length;i++)rimPts.push(new THREE.Vector3(prof.pts[i][0],springY+prof.pts[i][1],0.0));gate.add(tubeMesh(rimPts,0.04,rimMat,170,8));

      if(HU){var sK=[];if(p.wMason>0.03)sK.push([jambW*p.wMason*0.5,jambW*p.wMason*0.5,fmat]);if(p.wBraid>0.03)sK.push([jambW*0.5,jambW*0.5*p.wBraid*1.05+lerp(0.02,0.05,p.wBraid),bmatG]);if(p.wMono>0.03)sK.push([jambW*0.5,jambW*0.5*p.wMono+0.01,fmat]);sK.sort(function(u,v){return v[1]-u[1];});if(sK.length)hSichtStrang(HU,offsetFull(sK[0][0]),Math.min(sK[0][1],frameDepth*0.5),sK[0][2],0);var sx=Infinity,sy0=baseY,sz=Infinity;if(p.wMason*p.mass>0.05){var sN=1+Math.round(p.wMason*2),sHh=0.12+0.32*p.mass;sx=Math.min(sx,(fullW+0.4)/2);sy0=Math.min(sy0,baseY-sN*sHh);sz=Math.min(sz,baseDepth/2);}if(p.wMono*p.mass>0.05){var sPh=0.2+0.3*p.mass;sx=Math.min(sx,(fullW+0.5)/2);sy0=Math.min(sy0,baseY-sPh);sz=Math.min(sz,(baseDepth+0.3)/2);}if(sx<Infinity)hKasten(HU,-sx,sy0,baseZ-sz,sx,baseY,baseZ+sz,fmat,"sicht");}
      return {gate:gate,D:D,leafL:leafL,leafR:leafR,leafLB:leafLB,leafRB:leafRB,rimMat:rimMat};
    }

    // ── DAS BYTE-RASTER AM AUSGANG (S1 Wände, 07.10.; das Muster fachwerk-core ausRaster) ──
    // Befund: die v4-Goldens standen am Kopf 516e704a unter Node 24 (V8 13.6) grün und unter Node 22 (V8 12.4, die CI)
    // rot, 16 von 16 Fällen: three r128 CatmullRomCurve3 'centripetal' (pow(d², 0,25)) und convertSRGBToLinear
    // (pow(c, 2,4)) runden je V8 im letzten Bit anders (2405 von 40148 verschiedenen Aufrufen), und jede Zahl des Tors
    // hängt an ihnen — die Plattform-Probe (scripts/lib/plattform-probe.cjs) kippt jeden Fall auch mit sin, cos, hypot
    // und atan2 ±1 ULP. Das Raster legt jede Zahl des Ausgangs auf ein Gitter, das kein letztes Bit erreicht:
    // Attribute 2^-12, Normalen 2^-14, Lage und Maß 2^-16, Drehung 2^-20, Stoff-Zahlen 2^-16; −0 → 0.
    function rasterZahl(x, q) {
        return Math.round(x * q) / q + 0;
    }
    function rasterStoff(m) {
        if (!m) return;
        if (m.color) m.color.setRGB(rasterZahl(m.color.r, 65536), rasterZahl(m.color.g, 65536), rasterZahl(m.color.b, 65536));
        if (m.emissive) m.emissive.setRGB(rasterZahl(m.emissive.r, 65536), rasterZahl(m.emissive.g, 65536), rasterZahl(m.emissive.b, 65536));
        var z = ["roughness", "metalness", "opacity", "emissiveIntensity"];
        for (var i = 0; i < z.length; i++) if (typeof m[z[i]] === "number") m[z[i]] = rasterZahl(m[z[i]], 65536);
    }
    function ausRaster(g) {
        g.traverse(function (o) {
            o.position.set(rasterZahl(o.position.x, 65536), rasterZahl(o.position.y, 65536), rasterZahl(o.position.z, 65536));
            o.scale.set(rasterZahl(o.scale.x, 65536), rasterZahl(o.scale.y, 65536), rasterZahl(o.scale.z, 65536));
            var q = o.quaternion;
            q.set(rasterZahl(q.x, 1048576), rasterZahl(q.y, 1048576), rasterZahl(q.z, 1048576), rasterZahl(q.w, 1048576));
            if (o.geometry && o.geometry.attributes) {
                var A = o.geometry.attributes;
                for (var name in A) {
                    var s = name === "normal" ? 16384 : 4096,
                        arr = A[name].array;
                    for (var k = 0; k < arr.length; k++) arr[k] = rasterZahl(arr[k], s);
                }
                // JEDES GITTER TRÄGT SEINEN INDEX (K43): der Bau-Satz legt Gruppen nur indiziert in seinen Pool (`_satzBlock`,
                // fail-closed) — Stein (ExtrudeGeometry) und Schlussstein-Juwel (Octahedron) kamen ohne; sie tragen den
                // Index der Ecken in ihrer Reihenfolge (dieselben Ecken, dieselben Dreiecke).
                if (!o.geometry.index && A.position) {
                    var nE = A.position.count, idx = nE > 65535 ? new Uint32Array(nE) : new Uint16Array(nE);
                    for (var e = 0; e < nE; e++) idx[e] = e;
                    o.geometry.setIndex(new THREE.BufferAttribute(idx, 1));
                }
            }
            if (Array.isArray(o.material)) for (var j = 0; j < o.material.length; j++) rasterStoff(o.material[j]);
            else rasterStoff(o.material);
        });
    }

    // ── B2: buildInstance(rezeptId, seed, lod, ov?) — die EINE Bau-Funktion ──
    // Deterministisch (Lab-fester rng-Strom, s. Kopf: seed reserviert, Goldens
    // cv:4 frieren die Seed-Invarianz ein); lod klemmt auf die größte deklarierte
    // Stufe ≤ lod (kindStages.gate = [0, 1, 2, 3]: jede Stufe ist eine eigene, ab 3 → 3
    // — K43 die Stufe 1, K64 die Stufe 2). ov reist als Parameter-Override. Ausgang: EINE THREE.Group
    // (Türen geschlossen, doorAngles 0/0), Welt-Matrizen aktualisiert — die Naht
    // sind die Float32-Attribute ihrer Meshes (G2.2). Die Stufe 3 (NUR-WURF, 1110-9):
    // die Hüllen-Liste des Tors als EIN Gitter im Schatten-Stoff, die Liste reist als
    // Beipack `__fern` (fernform "huelle": jenseits der Mesh-Zone der Welt-March).
    function torStufe(lod) {
        var S = PORTAL_RENDER_CONFIG.lod.kindStages.gate, st = S[0], L = lod | 0;
        for (var i = 0; i < S.length; i++) if (S[i] <= L) st = S[i];
        return st;
    }
    // DAS ANTEIL-GESETZ richtet die gezeigte Stufe: trägt ihr Bau mehr als `anteil` × die L0 an denselben Stellen (das Kosten-Buch), legt
    // sie ihr Gesetz gröber — Sehnen-Fehler, Längs-Schritt und das Feine wachsen um die Wurzel des Überschusses (mindestens × 1,15: das Feine
    // fällt ganz, die Dreiecke sinken schneller als der Schritt; die Mindest-Teilung von Ring und Scharnier sinkt bis 3, das Geflecht trägt
    // jeden weiteren Strang) — und baut neu, höchstens achtmal. Alles wächst aus
    // derselben Größe (der Fehler im Pixel der Stufe), nie aus einem Regler-Wert; ein Tor auf seinem Anteil baut EINMAL.
    function vergroebert(D, f) {
        var V = {};
        for (var k in D) V[k] = D[k];
        V.sehneM = D.sehneM * f;
        V.laengsM = D.laengsM * f;
        V.feinM = D.feinM * f;
        V.ringMin = Math.max(3, Math.round(D.ringMin / f));
        V.zylinder = Math.max(3, Math.round(D.zylinder / f));
        if (D.straehnen) V.straehnen = Math.round(D.straehnen * f);
        return V;
    }
    // Der Bau einer GEZEIGTEN Stufe: die Stufe 0 unter ihrem Detail-Gesetz (TOR_DETAIL), die Stufen 1 und 2 unter TOR_DETAIL_1 / _2 und
    // ihrem Anteil — derselbe Bau, nur das Gesetz wechselt (synchron gesetzt und zurückgesetzt).
    function baueStufe(p, st) {
        var D = st === 2 ? TOR_DETAIL_2 : st === 1 ? TOR_DETAIL_1 : TOR_DETAIL;
        var fern = TUER_GESETZ.fern * TUER_GESETZ.offen;
        _abtast = D.anteil ? new Map() : null;
        try {
            for (var f = 1, versuch = 0, ziel = 0; ; versuch++) {
                _detail = f > 1 ? vergroebert(D, f) : D;
                _buch = D.anteil && !versuch ? { l0: 0, stufe: 0 } : null; // die L0 an denselben Stellen: einmal gezählt, sie hängt an keinem Gesetz der Stufe
                var R = buildGate(p, st === 1 || st === 2 ? { front: fern, back: fern } : null);
                if (!D.anteil) return R;
                var alle = 0;
                R.gate.traverse(function (o) {
                    if (o.isMesh) alle += dreieckeVon(o.geometry);
                });
                if (_buch) ziel = D.anteil * (alle - _buch.stufe + _buch.l0);
                if (alle <= ziel || versuch >= 8) return R;
                f *= Math.max(1.15, Math.sqrt(alle / ziel));
            }
        } finally {
            _detail = TOR_DETAIL;
            _buch = null;
            _abtast = null;
        }
    }
    // Die EINE Quelle der Hülle (N5): buildGate sammelt sie im selben Lauf, der die Meshes baut.
    function huelle(rezeptId, seed, ov) {
        var pre = PRESETS[rezeptId];
        if (!pre) return null;
        var H = [];
        buildGate(gateParams(pre, ov || null), null, H);
        return { stufe: 3, teile: H };
    }
    function buildInstance(rezeptId, seed, lod, ov) {
        var pre = PRESETS[rezeptId];
        if (!pre) return null;
        if (torStufe(lod) === 3) {
            var hl = huelle(rezeptId, seed, ov);
            var g3 = huelleGruppe(hl.teile);
            ausRaster(g3);
            g3.userData = { kind: "gate", rezeptId: rezeptId, seed: seed, lod: 3, __fern: hl };
            g3.updateMatrixWorld(true);
            return g3;
        }
        var p = gateParams(pre, ov || null);
        var st = torStufe(lod);
        var R = baueStufe(p, st);
        var g = R.gate;
        ausRaster(g);
        g.userData = { kind: "gate", rezeptId: rezeptId, seed: seed, lod: st };
        g.updateMatrixWorld(true);
        return g;
    }

    // ── Der Namensraum (Vertrag v1.1 §7): Manifest-Blöcke + Bau-Vokabular ──

    // ULTRAGUSS U6 — DAS MEMBRAN-FARB-GESETZ (verbatim aus der Lab-Shell):
    // Kern-Farbe warm/kalt aus temp; saturierte IQ-Kosinus-Palette
    // a+b·cos(2π(c·t+d)) — Familie aus temp, Sättigung aus energy,
    // Verschiebung aus realm. Reine Zahlen (MESHFREI-artig; die Shell/der
    // Ofen machen daraus Uniforms).
    function membranPalette(p) {
        var lerp = function (a, b, t) { return a + (b - a) * t; };
        var warm = [1.95, 1.45, 0.85], cold = [0.4, 0.6, 1.5];
        var core = [lerp(cold[0], warm[0], p.temp), lerp(cold[1], warm[1], p.temp), lerp(cold[2], warm[2], p.temp)];
        var dWarm = [0.0, 0.12, 0.2], dCool = [0.6, 0.5, 0.42], dCryst = [0.3, 0.55, 0.85];
        var dd = [lerp(dCool[0], dWarm[0], p.temp), lerp(dCool[1], dWarm[1], p.temp), lerp(dCool[2], dWarm[2], p.temp)];
        dd = [lerp(dd[0], dCryst[0], p.realm * 0.5), lerp(dd[1], dCryst[1], p.realm * 0.5), lerp(dd[2], dCryst[2], p.realm * 0.5)];
        var sat = 0.42 + 0.34 * p.energy;
        return {
            core: core,
            PA: [0.5, 0.5, 0.5],
            PB: [sat, sat, sat],
            PC: [1.0 + p.realm * 0.8, 1.0 + p.realm * 0.4, 1.0],
            PD: dd,
        };
    }

    // ── DIE MEMBRAN ALS GESETZ (V18.464, rein additiv — W9-Muster): die
    // PASSAGE-Zahlen der Lab-Shell (worlds/portale/porta.js buildMembrane)
    // als EINE Tabelle. Die Shell INJIZIERT diese Zahlen in ihr GLSL
    // (semantischer Beweis alt==neu, diag-membran-gesetz), die Welt (TSL)
    // LIEST dieselbe Tabelle für ihr Portal-Passage-Material. Die TECHNIK
    // (GLSL-Raymarch vs TSL-Knoten) bleibt Leser-Sache; hier wohnen NUR
    // Zahlen + reine Ableitungen (THREE-frei, MESHFREI-artig). Arrays sind
    // POSITIONAL — die Shell-GLSL-Zeilen sind die Lesart-Referenz.
    var MEMBRAN_GESETZ = {
        profilW: 64, // Bogen-Oberkante: Sample-Breite der Top-Textur/Tabelle
        seg: 45, // Plane-Unterteilung (Vertex-Welle braucht Dichte; 1310-3 OMEN: 45 trägt die Welle bildgleich, Genesis −47k Dreiecke, −1,0 ms GPU)
        eps: 0.06, // Normalen-Differenzschritt e (Vertex-Shader)
        om: 3.0, // Wellen-Kreisfrequenz om = t*3.0
        kk: 13.8, // Wellenzahl (radiale Tropfenwelle)
        refl: 0.72, // reflektierte Welle (Pfad 2-rr) Gewicht
        damp: 0.7, // exp(-rr*0.7) Randverdichtung
        twistK: 2.0, // twist = a*2.0 + swirl/(r+0.25)
        swirlR0: 0.25,
        pierce: [2.2, 6.0, 1.5], // sin(t*2.2)*exp(-rr²*6)*1.5
        micro: [3.0, 0.3, 0.1], // fbm(c*3 - t*0.3)*0.10
        hGain: [0.55, 0.62], // h = clamp((wave*0.55+pierce+micro)*0.62,-1,1)
        waveDepthK: [0.65, 0.35], // * uWaveDepth*(0.65+0.35*wave)
        waveDepthMin: 0.05,
        waveDepthZ: 0.1, // uWaveDepth = max(0.05, zFace*0.10)
        // DIE REGLER DER PASSAGE IM GESETZ (studios.K1, die Membran-Zeilen seit D8 ohne Leser): Drall und Fraktal tragen die Welle,
        // Innentiefe und Spiegel den Film (`film.tiefe`, `film.spiegel`) — je Faktor = k[0] + k[1] · Regler, die Mitte 0,5 ist 1
        drall: [0.5, 1.0], // twist = a·twistK·(drall[0] + drall[1]·twist) + swirl/(r + swirlR0)
        fraktal: [0.5, 1.0], // micro · (fraktal[0] + fraktal[1]·fractal): die Selbstähnlichkeit der Oberfläche
        rimAyK: 0.52, // uRimAy = (apexY-baseY)*0.52
        swirlK: 0.5, // uSwirl = swirl*0.5
        openK: [0.4, 0.6], // uOpen = clamp(0.4+energy*0.6, 0, 1)
        centerK: 0.55, // Zentrum-Y = baseY + jambH*0.55
        // DER FILM ÜBER DEM ZIEL (D8, Vertrags-Akt 15.10.: der 12-Schritt-March, die vier Innenwelt-Modi und der Look-Block
        // fallen — die Öffnung zeigt das Ziel). Die Öffnung liest das Ziel-Panorama (Equirekt, das Studio rendert es in seiner
        // Welt, AnazhHuelle.panorama) über eine Stellvertreter-Kugel um die Tor-Mitte: Radius = Tor-Höhe × kugel (Lagarde &
        // Zanuttini 2012), der Strahl trifft die Kugel, die Richtung von der Mitte zum Treffer liest das Panorama; die Wellen-
        // Normale bricht den Blick um brechung. Darüber der Seifenfilm (Dünnschicht-Interferenz, Brechzahl n: Gangunterschied
        // 2·d·cos θt, die Bänder aus membranPalette): Dicke d = dicke[0] + dicke[1]·rr + dicke[2]·Welle/Tiefe +
        // dicke[3]·sin(t·dicke[4] + y·dicke[5]) (rr = Rand-Abstand in der Öffnungs-Ellipse); Gewicht = min(F0 + (1 − F0)·
        // (1 − cos θ)^fresnel[1] + rand[2]·smoothstep(rand[0], rand[1], rr) + basis, gewichtMax) · (act[0] + act[1]·act) —
        // der Rand gezähmt (Spanne der Dicke 0,45 statt 0,85, Rand-Gewicht 0,3 statt 0,5, Deckel 0,55: bei streifendem Blick
        // bleibt das Ziel sichtbar); der Glanz: Film · Spiegel · glanz[0] · (glanz[1] + glanz[2]·Puls), der Film mit der Dispersion
        // welle je Farbe und der Buntheit farbe um seine Helligkeit (D8: der Film tönt ein blasses Ziel, statt es zu Milch zu waschen).
        film: {
            kugel: 4.0,
            n: 1.33,
            brechung: 0.12,
            dicke: [0.3, 0.45, 0.22, 0.06, 0.37, 0.9],
            fresnel: [0.04, 5.0],
            rand: [0.6, 1.0, 0.3],
            basis: 0.24,
            gewichtMax: 0.55,
            act: [0.65, 0.35],
            glanz: [0.8, 0.9, 0.15],
            // die Innentiefe (tunnel): der Radius der Stellvertreter-Kugel × (tiefe[0] + tiefe[1]·tunnel) — das Ziel liegt tiefer
            tiefe: [0.5, 1.0],
            // der Spiegel (reflect): der Glanz des Films × (spiegel[0] + spiegel[1]·reflect)
            spiegel: [0.5, 1.0],
            // die Dispersion: der Gangunterschied in Wellenlängen je Farbe, λ_R / λ (650 / 650, 650 / 532, 650 / 450 nm)
            welle: [1.0, 1.22, 1.44],
            // die Buntheit der Bänder um ihre Helligkeit (1 = die Palette, mehr = Farbe statt Licht)
            farbe: 2.6,
        },
        puls: 1.25, // uPulse = 0.5+0.5*sin(t*1.25)
        aktivDepth: [0.1, 0.85], // Atem: uWaveDepth = zFace*(0.10+0.85*open)
    };

    // SPIEGEL-ZENSUS 17.07. — DAS TUER-GESETZ (rein additive DATEN-Zeile):
    // der Fluegel-Oeffnungswinkel (rad). Shell (DOOR_OPEN, porta.js) UND
    // Wirt (TOR_FLUEGEL_OFFEN, Stamm) trugen dieselbe 1.95 als
    // Zahlen-Zwilling — jetzt lesen BEIDE diese eine Quelle (fail-soft
    // byte-gleich: kalter Kern -> das alte Literal).
    // DIE FERN-POSE (K43-2, rein additiv): der Anteil von `offen`, in dem die Flügel jenseits der Tür-Nähe stehen — die Stufe 1
    // trägt sie fest im Körper (`baueStufe`), die Stufe 0 öffnet von ihr bis `offen` (der Wirt, `_tickTorFluegel`). Vorher
    // standen die Flügel der Stufe 1 zu: von der Genesis-Mitte (11 m) war jedes Tor geschlossen, die Stufe 0 öffnete erst
    // unter 8,55 m — der Stufen-Wechsel war eine Tür, die aufspringt.
    var TUER_GESETZ = { offen: 1.95, fern: 0.5 };

    // DIE TOR-HUELLE (Leben-Schau 2, Nachbesserung 10.10. — rein additive DATEN, wie die Fels-Huellen fx.huellen im
    // terrain-Kern): je Rezept die Masse der gezeichneten Gestalt (buildInstance LOD 0, seed-invariant), mit denen der
    // Wirt das Tor stossen laesst. Je Seite (0: x < 0, 1: x > 0) [pfostenX, pfostenZ, obenX, obenZ]: die Aussenkante der
    // Pfosten ausserhalb der Oeffnung (±rimAx, 0,1 m bis zur Kaempferlinie) und ihre Tiefe, darueber Aussenkante und
    // Tiefe des Rahmens; dazu die Oberkante — auf den cm nach aussen gerundet. Bis dahin baute der Wirt die Gestalt beim
    // ersten Spawn jeder Gestalt synchron auf dem Haupt-Thread nach. Gemintet und gemessen von gate:porta-contract
    // (scripts/lib/tor-huelle.cjs, Mint-Treue je Zahl); der Bau liest sie nie. 1110-9 (das Detail-Gesetz der Röhren und
    // Ringe): zehn Zahlen neu geprägt, je 1–2 cm nach innen (drachentor/geisttor obenX, maschine pfostenX, vier Oberkanten).
    // prettier-ignore
    var TOR_HUELLE = {
        drachentor: { seiten: [[2.7, 1.62, 2.67, 1.61], [2.7, 1.62, 2.67, 1.61]], oberkante: 8.01 },
        kathedrale: { seiten: [[3.29, 2.81, 3.27, 2.81], [3.29, 2.81, 3.27, 2.8]], oberkante: 8.56 },
        maschine: { seiten: [[2.66, 1.33, 2.66, 1.33], [2.66, 1.33, 2.66, 1.33]], oberkante: 7.13 },
        geisttor: { seiten: [[2.36, 1.35, 2.34, 1.35], [2.36, 1.35, 2.34, 1.35]], oberkante: 7.4 },
        verkalkt: { seiten: [[2.61, 1.81, 2.6, 1.81], [2.61, 1.81, 2.6, 1.81]], oberkante: 7.35 },
        ruine: { seiten: [[5.78, 1.87, 4.18, 1.87], [5.29, 1.87, 4.18, 1.86]], oberkante: 6.81 },
        maurentor: { seiten: [[2.93, 1.75, 2.92, 1.75], [2.93, 1.75, 2.92, 1.75]], oberkante: 7.03 },
    };

    // GLUT_GESETZ — Lab+Host portal PointLight (·126). Same numbers as porta.js / _tickPortalLicht.
    var GLUT_GESETZ = {
        color: 0xffd9a0,
        dist: 14,
        decay: 2,
        i0: 0.3,
        iOpen: 3.4,
        pulseBase: 0.8,
        pulseAmp: 0.28,
        ySpring: 0.55,
    };
    function glutIntensity(openM, pulse) {
        var G = GLUT_GESETZ;
        var o = isFinite(openM) ? openM : 0;
        var p = isFinite(pulse) ? pulse : 1;
        return (G.i0 + o * G.iOpen) * (G.pulseBase + G.pulseAmp * p);
    }

    // membranUniforms(p) — die REINE Ableitung der Membran-Uniform-Zahlen aus
    // einem vollen Parametersatz (gateParams-Ausgang). Byte-treu zur Shell
    // (buildMembrane Z.36–51): Geometrie-Rahmen aus deriveGate, Bogen-Oberkante
    // als 64er-Sample-Tabelle (0..1 normiert — die Shell macht daraus ihre
    // DataTexture, die Welt ihre eigene), Palette aus membranPalette. Kein
    // THREE, keine Technik — nur Zahlen.
    function membranUniforms(p) {
        var MG = MEMBRAN_GESETZ;
        var D = deriveGate(p);
        var FR = deriveFrame(p, D);
        D.orders = FR.orders;
        D.depthStep = FR.depthStep;
        D.zFace = FR.zFace;
        var left = D.leftSpringX,
            right = D.rightSpringX;
        var spanW = right - left;
        var height = D.apexY - D.baseY;
        var midY = (D.baseY + D.apexY) / 2;
        var W = MG.profilW;
        var profil = [];
        for (var i = 0; i < W; i++) {
            var xx = left + (spanW * i) / (W - 1);
            var ty = interpTop(D.prof, xx) + D.springY;
            profil.push(clamp((ty - D.baseY) / Math.max(0.001, height), 0, 1));
        }
        return {
            left: left,
            right: right,
            spanW: spanW,
            height: height,
            midY: midY,
            baseY: D.baseY,
            springY: D.springY,
            apexY: D.apexY,
            jambH: D.jambH,
            jambW: D.jambW,
            M: D.M,
            zFace: D.zFace,
            orders: FR.orders,
            frameDepth: FR.frameDepth,
            depthStep: FR.depthStep,
            centerY: D.baseY + D.jambH * MG.centerK,
            springX: Math.max(Math.abs(left), Math.abs(right)),
            rimAx: Math.abs(D.leftSpringX),
            rimAy: (D.apexY - D.baseY) * MG.rimAyK,
            tiefe: MG.film.tiefe[0] + p.tunnel * MG.film.tiefe[1],
            drall: MG.drall[0] + p.twist * MG.drall[1],
            fraktal: MG.fraktal[0] + p.fractal * MG.fraktal[1],
            spiegel: MG.film.spiegel[0] + p.reflect * MG.film.spiegel[1],
            waveDepth: Math.max(MG.waveDepthMin, D.zFace * MG.waveDepthZ),
            swirl: p.swirl * MG.swirlK,
            open: clamp(MG.openK[0] + p.energy * MG.openK[1], 0, 1),
            wave: clamp(p.wave, 0, 1),
            energy: p.energy,
            realm: p.realm,
            glow: p.glow,
            profil: profil,
            pal: membranPalette(p),
        };
    }

    // MESSEN_VIS — intentional dual Lehre surface (Feel-Entscheid .132). Do NOT merge.
    // lab:"law-ui" = porta.js updateLaw Stich→Schub→Dicke display.
    // host:"chat-metrologie" = `_portaMessenZeile` / g.messen via core.messen (.87).
    // Like AUGEN_VIS .131 / TILT_VIS .129: naming the Feel, not Fake-zu.
    // Werkstatt-Stats-Row = UI-Welle later. messen() formula stays the one source.
    var MESSEN_VIS = {
        lab: "law-ui",
        host: "chat-metrologie",
    };

    // W8 — die Gestalten je Rezept (B2c): JEDES Tor trägt GESTALTEN_JE_REZEPT Individuen (ein neues Tor zählt mit).
    for (var _gid in PRESETS) PORTAL_RENDER_CONFIG.lod.budget.gestalten[_gid] = GESTALTEN_JE_REZEPT;

    root.__portaCore = {
        VERSION: VERSION,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        PORTAL_RENDER_CONFIG: PORTAL_RENDER_CONFIG,
        PRESETS: PRESETS,
        PARAMS_BY_KIND: { gate: PARAMS },
        SLIDERS: SLIDERS,
        pk: pk,
        gateParams: gateParams,
        buildInstance: buildInstance,
        huelle: huelle,
        huelleGruppe: huelleGruppe,
        // Mess- & Lehren-Fläche (Shell + Wirt lesen dieselben Gesetze)
        messen: messen,
        MESSEN_VIS: MESSEN_VIS,
        deriveGate: deriveGate,
        deriveFrame: deriveFrame,
        membranPalette: membranPalette,
        MEMBRAN_GESETZ: MEMBRAN_GESETZ,
        TUER_GESETZ: TUER_GESETZ,
        TOR_HUELLE: TOR_HUELLE,
        GLUT_GESETZ: GLUT_GESETZ,
        glutIntensity: glutIntensity,
        membranUniforms: membranUniforms,
        archProfile: archProfile,
        interpTop: interpTop,
        // Bau-Fläche (die Shell baut ihre Struktur aus DIESER Quelle)
        buildGate: buildGate,
        // Geometrie-Vokabular + Helfer
        lerp: lerp,
        clamp: clamp,
        mulberry32: mulberry32,
        tubeMesh: tubeMesh,
        torusMesh: torusMesh,
        barBetween: barBetween,
        quadBlock: quadBlock,
        normalsAlong: normalsAlong,
    };
})(typeof self !== "undefined" ? self : globalThis);
