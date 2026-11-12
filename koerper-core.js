// AnazhRealm — koerper-core.js: DER KOERPER-STUDIO-KERN (Katalysator-Bogen W-A6, ε-Checkliste).
// Die GESTALT- + BEWEGUNGS-DATEN des Koerperstudios (worlds/koerperstudio/index.html —
// Da Vinci Studio: Living Human — Proportions-/Morph-Dials + Emotions-/Gang-Profile
// des PD-geregelten Rigs). Byte-treu aus dem Schoepfer-Werk extrahiert (Literal-
// Slices, sha256-Beleg im Wellen-Bericht) — die Shell UND AnazhRealm lesen DIESE
// eine Quelle (G2.1), ein Nachbau ist verboten.
//
// FORM (Vertrag v1.1 §7 N7.2 + §8): namespaced IIFE __koerperCore, MESHFREI = 1 —
// DER HOST BLEIBT DER OFEN (W-A6-Gesetz): bake-core-Isosurface + _humanoidSkeleton +
// _buildHumanoidRig bauen den Avatar-Koerper; dieser Kern liefert GESTALT-PARAMETER
// (die acht Morph-Dials + die String-Wahlen als fx.gestalt) + das benannte v1.1-Feld
// fx.motion (die zehn Emotions-/Gang-Profile als DATEN — der Host-Konsument ist der
// _animateCompoundMotion-/_animateHumanoidRig-Bogen, benannter Andock-Punkt im
// Wellen-Bericht). KEIN buildInstance (B2 N/A), kein Mesh-Kanal, kein Parallel-Sim.
//
// DETERMINISMUS (G2.3): reine Daten. THREE-frei, DOM-frei.
(function (root) {
    "use strict";

    var VERSION = "1.0.0";
    var STUDIO_VERTRAG = 1; // G4.3
    var MESHFREI = 1; // v1.1 §8 — components-only-Kern (keine Gestalt, nur Daten)
    // v1.2 §8.5 (V18.478, rein additiv) — DIE OFEN-STUFEN-ZEILE: ein MESHFREI-Kern
    // deklariert hiermit die LOD-Stufen, die der WIRTS-OFEN seiner Gestalt bäckt
    // (bakeMenschInstance: Stufe 0 = feiner Gelenk-Baum · Stufe 1 = gelenkige
    // Grobstufe, _gelenkStufe). B2 bleibt N/A (kein buildInstance) — die
    // Zeile ist die VERTRAGS-Wahrheit der Pipe-Bäckerei (BAKERS_BY_KIND).
    // B2c-Daten (W8, rein additiv): DAS BUDGET je Ofen-Stufe (docs/studio-vertrag.md B2c) — tris = die gebaute
    // Hülle (gate:asset-contract, die Ratsche fällt nur), band = das Profi-Band-Ziel (Haushalt, offen solange tris
    // darüber liegt), draws = Draws je Körper und Pass nach der Wirts-Regel: das Budget-Gesetz am Ausgang (Brücke
    // UND Sync-Guss des Wirts-Ofens, phyto-core budgetErzwingen) faltet die starren Stoffe und die Stoff-Hüllen
    // je Bindungs-Klasse (Haut bleibt Haut) und Seh-Klasse (MATERIAL_KLASSEN.seh: Auge · Haut · Haar · Stoff bleiben
    // getrennt — L1 6 ist das gemessene Minimum); schatten = die werfende Stufe. gestalten = Individuen je Rezept
    // (gefüllt je Rezept unten bei PRESETS): EINE — der Guss ist seed-invariant (Same 1 ≡ 2 byte-gleich, L0 und L1),
    // 16 Gestalten waren 16 byte-gleiche Zwillinge. Eine Seed-Achse ist ein Re-Mint-Akt, nie eine Zahl hier (S3 08.10.,
    // gate:asset-contract Gestalten-Wand).
    var GESTALTEN_JE_REZEPT = 1;
    var PORTAL_RENDER_CONFIG = {
        lod: {
            kindStages: { koerper: [0, 1, 2, 3] },
            budget: {
                koerper: {
                    // 1310-15 (Lehre 19, Re-Mint deklariert): die Stufe erreicht ihr Band, das Feld `band` fällt und `tris`
                    // IST das Band (B2c) — der Ofen trägt die Zeile: das Primitiv lebt in seiner Hülle, die Haut unter dem
                    // Stoff fällt, jede Hülle kollabiert auf den Anteil, der die Stufe auf die Zeile bringt (foundry-core
                    // bakeMenschInstance). L0 162 412 → 39 995, L1 38 444 → 13 994 Dreiecke; die Grobstufe trägt 35 % der
                    // feinen (das alte Ziel 8 000 ließ den Wurf-Zwilling den Umriss nur noch zu 0,92 decken).
                    0: { tris: 40000, draws: 8, schatten: 1 },
                    1: { tris: 14000, draws: 6, schatten: 1, ab: 40, wurf: { seh: ["haut", "stoff", "haar"] } },
                    // DIE MENGEN-STUFE (mensch.K1): die Bewohner einer Siedlung stehen jenseits der Armlänge als Instanz-Satz (der
                    // Wirt backt ihren Gang einmal, `_bewohnerSatz`). Re-Mint mensch.K4 (Lehre 19, Vertrags-Akt): DER LEIB DER MENGE
                    // ist EINE Hülle (foundry-core `__mengenLeib`: der SDF-Guss des ganzen Leibs wie die Tier-Haut, die Farbe der
                    // Kleider im Stoff geschnitten, mit der Naht kollabiert) — vorher Haut, Stoff und Kleid je für sich kollabiert,
                    // der Kopf eine Kugel-Traube: die Poncho-Tracht trug 2 474 statt 1 700 Dreiecke; EIN Draw, sie wirft über Stufe 3.
                    2: { tris: 1700, draws: 1, schatten: 3 },
                    // DIE NUR-WURF-STUFE (mensch.K1 Staffel 2, Studio-Vertrag B2; Re-Mint mensch.K4): nie gezeigt, sie IST der Wurf jedes
                    // Bewohners im Nah-Kreis (der Wurf-Satz seiner Gestalt) — derselbe Leib der Menge auf gröberem Raster. Der Wurf
                    // zeichnet in jede Kaskade (drei): er ist der größte Teil der Menge — 760 → 360 Dreiecke (vorher 1 297 an der
                    // Poncho-Tracht); 50 Bewohner tragen so ≤ 150k (Staffel mensch.K4).
                    3: { tris: 360, draws: 1, schatten: 3, nurWurf: true },
                    // S3 (rein additiv, Lehre 19): die Grobstufe trägt ab `ab` m das Bild und wirft für beide Stufen (die
                    // feine wirft über `schatten: 1` ihren Zwilling); `wurf.seh` wählt den werfenden Teil (Haut, Kleid,
                    // Haar — nie die Augen). `hyst` = die Hysterese der Stufen-Grenze (±10 %). 40 m ist eine KOSTEN-Grenze,
                    // keine Pixel-Grenze: die Beine spreizen in 38 m noch ~10 px bei 720 p (Leben-Prüfung N-D7, 06.10.; bis S3
                    // die Wirts-Konstante MENSCH_FERN_DIST_SQ).
                    hyst: 0.1,
                    // fernform (B2c, Pflicht je Budget-Art): jenseits der Nah-Grenze tragen die Glieder-Kapseln im Welt-March
                    fernform: "gesetz",
                },
                gestalten: {},
            },
        },
    };

    // ── Der Lab-Startzustand (byte-treu Lab Z.105) — Morph-Dials + String-Wahlen ──
    // prettier-ignore
    var START_PARAMS = {skinTone:'karamell',height:1.0,mass:0.35,tone:0.5,age:0.15,gender:1.0,hairLen:1.0,hairVol:1.0,arms:0.0,skinTone:'karamell',hairStyle:'mittel',hairColor:'darkbrown',top:'tshirt',topColor:'navy',bottom:'pants',bottomColor:'charcoal',shoes:'sneaker',shoeColor:'white'};
    // ── Die Emotions-/Gang-Profile (byte-treu Lab Z.118) — das motion-Feld ──
    // prettier-ignore
    var MOTION = {idle:{headY:0,headX:0,headZ:0,spineY:0,spineX:0,spineZ:0,bodyX:0,bodyZ:0,armL:0,armR:0,armLX:0,armRX:0,elbowL:0.14,elbowR:0.14,hipLX:0,hipRX:0,hipLZ:0,hipRZ:0,kneeL:0,kneeR:0,breath:0.042,sway:0.022,freq:1.25,kpMul:1.0,irisSpeed:0.3,blinkRate:0.5},joy:{headY:0,headX:-0.14,headZ:0.04,spineY:0,spineX:-0.08,spineZ:0,bodyX:-0.05,bodyZ:0,armL:0.6,armR:0.6,armLX:-0.2,armRX:-0.2,elbowL:0.55,elbowR:0.55,hipLX:0,hipRX:0,hipLZ:0,hipRZ:0,kneeL:0,kneeR:0,breath:0.07,sway:0.04,freq:3.2,kpMul:0.35,irisSpeed:1.0,blinkRate:0.8},sad:{headY:0,headX:0.18,headZ:0.04,spineY:0,spineX:0.07,spineZ:0.02,bodyX:0.05,bodyZ:0,armL:0.08,armR:0.08,armLX:0.05,armRX:0.05,elbowL:0.3,elbowR:0.3,hipLX:0,hipRX:0,hipLZ:0,hipRZ:0,kneeL:0,kneeR:0,breath:0.012,sway:0.003,freq:0.5,kpMul:2.2,irisSpeed:0.04,blinkRate:0.18},angry:{headY:0,headX:-0.08,headZ:0,spineY:0,spineX:-0.06,spineZ:0,bodyX:-0.06,bodyZ:0,armL:0.15,armR:0.15,armLX:-0.15,armRX:-0.15,elbowL:0.5,elbowR:0.5,hipLX:0,hipRX:0,hipLZ:-0.08,hipRZ:0.08,kneeL:0,kneeR:0,breath:0.048,sway:0.006,freq:2.5,kpMul:1.3,irisSpeed:0.03,blinkRate:0.5},fear:{headY:0,headX:-0.06,headZ:0,spineY:0,spineX:0.08,spineZ:0.02,bodyX:0.06,bodyZ:0,armL:-0.08,armR:-0.08,armLX:0.12,armRX:0.12,elbowL:0.6,elbowR:0.6,hipLX:0,hipRX:0,hipLZ:0,hipRZ:0,kneeL:0,kneeR:0,breath:0.06,sway:0.022,freq:4.5,kpMul:1.8,irisSpeed:1.5,blinkRate:0.25},run:{headY:0,headX:0,headZ:0,spineY:0,spineX:0,spineZ:0,bodyX:0,bodyZ:0,armL:0,armR:0,armLX:0,armRX:0,armLZ:0,armRZ:0,elbowL:0,elbowR:0,hipLX:0,hipRX:0,hipLZ:0,hipRZ:0,kneeL:0,kneeR:0,breath:0.06,sway:0.012,freq:2.0,kpMul:1.1,irisSpeed:0.12,blinkRate:0.35},pwalk:{headY:0,headX:-0.03,headZ:0,spineY:0,spineX:0.05,spineZ:0,bodyX:0.04,bodyZ:0,armL:0,armR:0,armLX:0,armRX:0,armLZ:0,armRZ:0,elbowL:0,elbowR:0,hipLX:0,hipRX:0,hipLZ:0,hipRZ:0,kneeL:0,kneeR:0,breath:0.05,sway:0.01,freq:1.6,kpMul:1.0,irisSpeed:0.2,blinkRate:0.45},slide:{headY:0,headX:-0.2,headZ:0,spineY:0,spineX:0.3,spineZ:0,bodyX:0.2,bodyZ:0,armL:0,armR:0,armLX:0,armRX:0,armLZ:0,armRZ:0,elbowL:0,elbowR:0,hipLX:0,hipRX:0,hipLZ:0,hipRZ:0,kneeL:0,kneeR:0,breath:0.05,sway:0,freq:2.0,kpMul:1.4,irisSpeed:0.1,blinkRate:0.3},fight:{headY:0,headX:-0.06,headZ:0,spineY:0,spineX:0.06,spineZ:0,bodyX:-0.04,bodyZ:0,armL:0.1,armR:0.1,armLX:-0.45,armRX:-0.45,elbowL:1.35,elbowR:1.35,hipLX:0,hipRX:0,hipLZ:-0.12,hipRZ:0.12,kneeL:0,kneeR:0,breath:0.04,sway:0.01,freq:2.8,kpMul:1.25,irisSpeed:0.08,blinkRate:0.35},showcase:{headY:0,headX:-0.03,headZ:0,spineY:0,spineX:-0.02,spineZ:0,bodyX:-0.02,bodyZ:0,armL:0.15,armR:0.15,armLX:0,armRX:0,elbowL:0.2,elbowR:0.2,hipLX:0,hipRX:0,hipLZ:0,hipRZ:0,kneeL:0,kneeR:0,breath:0.025,sway:0.015,freq:1.0,kpMul:1.0,irisSpeed:0.4,blinkRate:0.4}};

    // ═══════════════════════════════════════════════════════════════════════
    //  B4 PARAMS — die acht numerischen Lab-Slider als DATEN (worlds/
    //  koerperstudio/index.html Z.51–68: min/max/step/value; die String-
    //  Wahlen [skinTone/hairStyle/Kleidung] sind KEINE B4-Zeilen — sie
    //  reisen als fx.gestalt-Daten).
    // ═══════════════════════════════════════════════════════════════════════
    var PARAMS = [
        {
            id: "height",
            lab: "Groesse",
            min: 0.85,
            max: 1.15,
            step: 0.01,
            def: 1.0,
            law: "Koerpergroessen-Skala",
            grp: "KOERPER",
        },
        {
            id: "mass",
            lab: "Masse (Fett)",
            min: 0,
            max: 1,
            step: 0.01,
            def: 0.35,
            law: "Fettanteil — Taille/Bauch/Wangen folgen",
            grp: "KOERPER",
        },
        {
            id: "tone",
            lab: "Muskeltonus",
            min: 0,
            max: 1,
            step: 0.01,
            def: 0.5,
            law: "Muskelquerschnitt (effTone faellt mit Alter)",
            grp: "KOERPER",
        },
        {
            id: "age",
            lab: "Alter",
            min: 0,
            max: 1,
            step: 0.01,
            def: 0.15,
            law: "18–80 Jahre: Haltung/Kopfposition/Gesicht altern",
            grp: "KOERPER",
        },
        {
            id: "gender",
            lab: "Maennlichkeit",
            min: 0,
            max: 1,
            step: 0.01,
            def: 1.0,
            law: "Schulter/Huefte/Kiefer-Dimorphismus",
            grp: "KOERPER",
        },
        {
            id: "hairLen",
            lab: "Haarlaenge",
            min: 0.2,
            max: 2.0,
            step: 0.05,
            def: 1.0,
            law: "Straehnen-Laengen-Skala",
            grp: "HAAR",
        },
        {
            id: "hairVol",
            lab: "Haarvolumen",
            min: 0.5,
            max: 2.0,
            step: 0.05,
            def: 1.0,
            law: "Straehnen-Dicken-Skala",
            grp: "HAAR",
        },
        {
            id: "arms",
            lab: "Armhaltung",
            min: 0,
            max: 1,
            step: 0.01,
            def: 0.0,
            law: "Arm-Abspreizung (0 = anliegend)",
            grp: "POSE",
        },
    ];

    // ═══════════════════════════════════════════════════════════════════════
    //  LOOK ALS GESETZ (V18.461) — Stoff-Palette + Kleid-Zonen + Haar-Streu.
    //  Das Gesetz sagt WAS (welche Teile, welche Farbe, welche Verteilung),
    //  die Deck-Technik ist Leser-Sache (das Lab näht seine echten Schnitte +
    //  Frisuren, der Pipe-Bäcker hüllt/streut deterministisch). MESHFREI §8.
    // ═══════════════════════════════════════════════════════════════════════
    // Die Stoff-Palette (verbatim aus der Lab-Shell gewandert — Shell liest den Kern).
    // prettier-ignore
    var CLOTH_COLORS={white:{hex:0xe8e6e0,name:'Weiß'},charcoal:{hex:0x2a2c30,name:'Anthrazit'},grey:{hex:0x6b6e73,name:'Grau'},black:{hex:0x161618,name:'Schwarz'},navy:{hex:0x233047,name:'Navy'},blue:{hex:0x3a5a8a,name:'Blau'},red:{hex:0x8f3328,name:'Rot'},green:{hex:0x3a5a3a,name:'Grün'},olive:{hex:0x57592f,name:'Oliv'},mustard:{hex:0xb8893a,name:'Senf'},burgundy:{hex:0x5a2530,name:'Bordeaux'},sand:{hex:0xc9b487,name:'Sand'},teal:{hex:0x2a6a6a,name:'Petrol'}};
    // Die Kleid-ZONEN: welcher Schnitt welche Baum-Teile hüllt (inflate = Hüllen-
    // Abstand — das Lab-Prinzip „Kleidung wird AUS der Haut extrudiert" als Zeilen).
    function kleidZonen(d) {
        d = d || {};
        var farbe = function (key, fallback) {
            return (CLOTH_COLORS[key] || CLOTH_COLORS[fallback]).hex;
        };
        var zonen = [];
        var top = d.top || "tshirt";
        if (top !== "none") {
            // Die Lab-Teile-Liste (buildTop verbatim): Hals-Teile füllen den
            // Kragen, pelvis/glutes geben den untucked-Saum-Überlapp der Hose.
            var topTeile = [
                "ribcage", "chest", "waist", "upperBack",
                "pec1", "pec-1", "abs", "oblique1", "oblique-1",
                "lat1", "lat-1", "trap1", "trap-1", "breast1", "breast-1",
                // Welle 5: der Hals (neckMain, scm) gehört der Haut — die Welt-Hülle kann keinen Ausschnitt schneiden
                // und zog den Stoff bis unters Kinn (Rollkragen); der Kragen sitzt an der Hals-Wurzel und deckt die
                // Schlüsselbeine (sonst stachen sie als Haut-Flecken durch den Stoff).
                "neckBase", "clavicle1", "clavicle-1",
                "pelvis", "glute1", "glute-1",
            ];
            // Ärmel = die GANZE Oberarm-Muskelgruppe (deltoid+bicep+tricep+uarm
            // hängen alle am arm-Gelenk — eine Teil-Hülle allein ließe Haut ragen).
            if (top === "tshirt" || top === "pullover" || top === "poncho")
                topTeile = topTeile.concat([
                    "deltoid1", "deltoid-1", "bicep1", "bicep-1",
                    "tricep1", "tricep-1", "uarm1", "uarm-1",
                ]);
            // K45-2 (rein additiv): der Pullover trägt den LANGEN Ärmel des Labors (buildTop: Unterarm und Ellbogen dazu)
            if (top === "pullover") topTeile = topTeile.concat(["forearm1", "forearm-1", "elbow1", "elbow-1"]);
            // ... und der Kragen des Stoffs aus der Haut sitzt UNTER der Hals-Wurzel (Lab buildTop: neckBase ist ausgenommen —
            // die Haut-Region der Hals-Wurzel liegt als Ring um den Hals: ein Halsband statt eines Kragens; der Poncho hüllt)
            if (top !== "poncho") topTeile = topTeile.filter(function (t) { return t !== "neckBase"; });
            // STOFF-CHARAKTER (V18.464): die Lab-Material-Zeile je Schnitt
            // (getCloth-Aufrufe verbatim) — rough + Webungs-Art reisen mit,
            // damit Strick ≠ Baumwolle ≠ Denim ≠ Leder auch in der WELT liest.
            zonen.push({
                schnitt: top,
                teile: topTeile,
                hex: farbe(d.topColor, "navy"),
                inflate: 1.07,
                abstand: 0.12, // der Hüllen-Abstand aus der Haut (Körper-Einheiten, ~3,5 cm — der Bäcker liest ihn je Zone)
                rough: top === "pullover" ? 0.92 : top === "tank" ? 0.82 : top === "poncho" ? 0.88 : 0.85,
                webe: top === "pullover" ? "knit" : top === "poncho" ? "wool" : "cotton",
                // K45-2 (rein additiv): DER STOFF AUS DER HAUT (das Lab-Gesetz `_garmentFromSkin`, buildTop 0.032): die Haut-Region der
                // Teile, um die Dicke gehoben, mit den Gewichten der Haut — Säume statt Ballon, kein Durchstoß. Der Poncho
                // fällt weit (das Lab drapiert ihn): er bleibt eine Hülle über seinen Teilen und ERBT die Gewichte der Haut
                // darunter (das Lab-Gesetz „weight transfer").
                dicke: top === "poncho" ? 0 : 0.032,
                erbt: 1,
            });
        }
        var bottom = d.bottom || "pants";
        if (bottom !== "none") {
            var botTeile = [
                "pelvis", "glute1", "glute-1", "quad1", "quad-1", "vlat1", "vlat-1",
                "adduct1", "adduct-1", "hamstring1", "hamstring-1",
            ];
            if (bottom === "pants")
                botTeile = botTeile.concat(["kneecap1", "kneecap-1", "calf1", "calf-1", "shin1", "shin-1"]);
            zonen.push({
                schnitt: bottom,
                teile: botTeile,
                hex: farbe(d.bottomColor, "charcoal"),
                inflate: 1.06,
                abstand: 0.12,
                rough: bottom === "pants" ? 0.82 : 0.85,
                webe: bottom === "pants" ? "denim" : "cotton",
                dicke: 0.024, // K45-2: der Stoff aus der Haut (Lab buildBottom 0.024 — unter dem Oberteil, das 0.032 trägt)
            });
        } else {
            // K45-2 (rein additiv): ohne Hose trägt der Leib die Unterhose — die Haut-Region von Becken und Gesäß im Ton der
            // gemalten Shorts (MATERIAL_KLASSEN.shorts), dünn aus der Haut gehoben (vorher standen die Shorts-Kugeln frei)
            zonen.push({
                schnitt: "unterhose",
                teile: ["pelvis", "glute1", "glute-1"],
                hex: MATERIAL_KLASSEN.shorts.c,
                rough: MATERIAL_KLASSEN.shorts.r,
                webe: "cotton",
                dicke: 0.012,
            });
        }
        var shoes = d.shoes || "sneaker";
        if (shoes !== "none") {
            // Der Fuß ist im Baum eine ANONYME Gruppe unter dem ankle-Gelenk
            // (heel/mid/Zehen unregistriert) — die Schuh-Zone nennt das GELENK,
            // der Leser hüllt alle Meshes darunter (Gruppen-Hüllen-Regel).
            zonen.push({
                schnitt: shoes,
                teile: ["ankle1", "ankle-1"],
                hex: farbe(d.shoeColor, "white"),
                inflate: 1.12,
                // Welle 5: der Hüllen-Abstand des Schuhs (Körper-Einheiten, ~1,5 cm) — mit dem Stoff-Abstand 0,12 (3,5 cm
                // rundum) stand der Turnschuh als weißer Ballon am Fuß.
                abstand: 0.05,
                // Gelände H5: die Sohle liegt flach auf der Unterkante des Fußes (der Ofen schneidet die Hülle dort)
                sohle: true,
                rough: shoes === "boot" ? 0.45 : 0.55,
                webe: shoes === "boot" ? "leather" : "rubber",
            });
        }
        return zonen;
    }
    // ═══════════════════════════════════════════════════════════════════════
    //  DIE HÜLLEN-MASCHINE (V18.463) — Voxel-Ops + Surface-Nets, VERBATIM aus
    //  der Lab-Shell gewandert (worlds/koerperstudio, browser-portable, THREE-
    //  frei = MESHFREI §8): die EINE Maschine, mit der Haut- und Kleid-HÜLLEN
    //  über den Teil-Primitiven entstehen. ZWEI Leser: die Lab-Shell (nutzt sie
    //  mit ihren Schnitten/Säumen/Klammern = Studio-Erlebnis) und der Pipe-
    //  Bäcker (bakeMenschInstance: geschlossene Hüllen + Gelenk-Gewichte für
    //  die Welt). prettier-ignore: der Block ist eingefrorener Lab-Text.
    // ═══════════════════════════════════════════════════════════════════════
    // prettier-ignore
    function _vox_dilate(g,nx,ny,nz,iters){
      for(var it=0;it<iters;it++){var o=new Uint8Array(g.length);
        for(var k=0;k<nz;k++)for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){var id=i+nx*(j+ny*k);
          if(g[id]){o[id]=1;continue;}
          if((i>0&&g[id-1])||(i<nx-1&&g[id+1])||(j>0&&g[id-nx])||(j<ny-1&&g[id+nx])||(k>0&&g[id-nx*ny])||(k<nz-1&&g[id+nx*ny]))o[id]=1;}
        g=o;}
      return g;}
    function _vox_erode(g,nx,ny,nz,iters){
      for(var it=0;it<iters;it++){var o=new Uint8Array(g.length);
        for(var k=0;k<nz;k++)for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){var id=i+nx*(j+ny*k);
          if(!g[id])continue;
          var keep=1;
          if(i==0||!g[id-1])keep=0;else if(i==nx-1||!g[id+1])keep=0;
          else if(j==0||!g[id-nx])keep=0;else if(j==ny-1||!g[id+nx])keep=0;
          else if(k==0||!g[id-nx*ny])keep=0;else if(k==nz-1||!g[id+nx*ny])keep=0;
          o[id]=keep;}
        g=o;}
      return g;}
    function _vox_fill(g,nx,ny,nz){               // fill enclosed holes (flood bg from border)
      var reach=new Uint8Array(g.length),st=[];
      function push(id){if(!g[id]&&!reach[id]){reach[id]=1;st.push(id);}}
      for(var k=0;k<nz;k++)for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){
        if(i==0||i==nx-1||j==0||j==ny-1||k==0||k==nz-1)push(i+nx*(j+ny*k));}
      while(st.length){var id=st.pop();var i=id%nx,j=((id/nx)|0)%ny,k=(id/(nx*ny))|0;
        if(i>0)push(id-1);if(i<nx-1)push(id+1);if(j>0)push(id-nx);if(j<ny-1)push(id+nx);
        if(k>0)push(id-nx*ny);if(k<nz-1)push(id+nx*ny);}
      var o=new Uint8Array(g.length);
      for(var x=0;x<g.length;x++)o[x]=(g[x]||!reach[x])?1:0;
      return o;}
    function _gauss1d(sig){var r=Math.max(1,Math.ceil(sig*3)),w=[],s=0;
      for(var i=-r;i<=r;i++){var e=Math.exp(-(i*i)/(2*sig*sig));w.push(e);s+=e;}
      for(var i=0;i<w.length;i++)w[i]/=s;return {w:w,r:r};}
    function _blur3(f,nx,ny,nz,sig){var K=_gauss1d(sig),w=K.w,r=K.r,tmp=new Float32Array(f.length);
      // x
      for(var k=0;k<nz;k++)for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){var a=0;
        for(var t=-r;t<=r;t++){var ii=i+t;if(ii<0)ii=0;if(ii>=nx)ii=nx-1;a+=w[t+r]*f[ii+nx*(j+ny*k)];}
        tmp[i+nx*(j+ny*k)]=a;}
      var out=new Float32Array(f.length);
      // y
      for(var k=0;k<nz;k++)for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){var a=0;
        for(var t=-r;t<=r;t++){var jj=j+t;if(jj<0)jj=0;if(jj>=ny)jj=ny-1;a+=w[t+r]*tmp[i+nx*(jj+ny*k)];}
        out[i+nx*(j+ny*k)]=a;}
      // z
      for(var k=0;k<nz;k++)for(var j=0;j<ny;j++)for(var i=0;i<nx;i++){var a=0;
        for(var t=-r;t<=r;t++){var kk=k+t;if(kk<0)kk=0;if(kk>=nz)kk=nz-1;a+=w[t+r]*out[i+nx*(j+ny*kk)];}
        tmp[i+nx*(j+ny*k)]=a;}
      return tmp;}
    var _CPOS=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]];
    var _SNED=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
    function surfaceNets(F,nx,ny,nz,level,ox,oy,oz,vox){
      var cnx=nx-1,cny=ny-1,cnz=nz-1;
      var vid=new Int32Array(cnx*cny*cnz);for(var q=0;q<vid.length;q++)vid[q]=-1;
      var verts=[],faces=[],c=new Float32Array(8);
      function CID(i,j,k){return i+cnx*(j+cny*k);}
      for(var k=0;k<cnz;k++)for(var j=0;j<cny;j++)for(var i=0;i<cnx;i++){
        for(var e=0;e<8;e++)c[e]=F[(i+(e&1))+nx*((j+((e>>1)&1))+ny*(k+((e>>2)&1)))];
        var mask=0;for(var e=0;e<8;e++)if(c[e]<level)mask|=(1<<e);
        if(mask==0||mask==255)continue;
        var px=0,py=0,pz=0,cnt=0;
        for(var e=0;e<12;e++){var a=_SNED[e][0],b=_SNED[e][1];
          if((c[a]<level)!=(c[b]<level)){var t=(level-c[a])/(c[b]-c[a]+1e-12);
            px+=_CPOS[a][0]+t*(_CPOS[b][0]-_CPOS[a][0]);
            py+=_CPOS[a][1]+t*(_CPOS[b][1]-_CPOS[a][1]);
            pz+=_CPOS[a][2]+t*(_CPOS[b][2]-_CPOS[a][2]);cnt++;}}
        var vi=verts.length;verts.push([(px/cnt+i)*vox+ox,(py/cnt+j)*vox+oy,(pz/cnt+k)*vox+oz]);
        vid[CID(i,j,k)]=vi;
        var s0=(c[0]<level);
        for(var ax=0;ax<3;ax++){var corner=ax==0?1:ax==1?2:4;
          if((c[0]<level)==(c[corner]<level))continue;
          var iu=(ax+1)%3,iv=(ax+2)%3;
          var dux=iu==0?1:0,duy=iu==1?1:0,duz=iu==2?1:0;
          var dvx=iv==0?1:0,dvy=iv==1?1:0,dvz=iv==2?1:0;
          var a0=i,b0=j,c0=k;
          var a1=i-dux,b1=j-duy,c1=k-duz;
          var a2=i-dux-dvx,b2=j-duy-dvy,c2=k-duz-dvz;
          var a3=i-dvx,b3=j-dvy,c3=k-dvz;
          if(a1<0||b1<0||c1<0||a2<0||b2<0||c2<0||a3<0||b3<0||c3<0)continue;
          var A=vid[CID(a0,b0,c0)],B=vid[CID(a1,b1,c1)],C=vid[CID(a2,b2,c2)],D=vid[CID(a3,b3,c3)];
          if(A<0||B<0||C<0||D<0)continue;
          if(s0){faces.push([A,B,C]);faces.push([A,C,D]);}
          else {faces.push([A,C,B]);faces.push([A,D,C]);}}
      }
      return {verts:verts,faces:faces};}

    // Die Haar-STREU: der gewählte Stil als Streu-Zeilen (V18.462: ALLE 10
    // Lab-Stile als Silhouetten-Tabelle — die Stil-Tabelle wächst HIER, nie im
    // Leser; das Lab näht seine reiche Technik weiter mit eigenen Buildern).
    // GEMESSEN an labProportionen (headSeg 0.78, Kopf-LOKAL): Schädel-Ellipsoid
    // c=[0,0.39,0] · r=[0.402,0.450,0.402]; Kalotten-Äquator ÜBER der Braue
    // (browY 0.45) = Gesicht frei. Zeilen-Arten: Kalotten-Schale (Default,
    // radial:1 = Richtung aus der Schalen-Normale) · quaste (Punkt-Büschel,
    // Box-Streuung — Zopf) · knoten (Kugel-Schale radial — Dutt). lj = Längen-
    // Streuung. Dichte skaliert mit hairVol, Länge mit hairLen.
    function haarStreu(d) {
        d = d || {};
        var stil = d.hairStyle || "mittel";
        // K57: trägt der Stil eine Kappe (HAAR_KAPPE, das Volumen), sind die stehenden Strähnen ihr Rand — halbe Dichte; die
        // liegenden (HAAR_STRICH) SIND ihre Fläche — volle Dichte, je Strähne EIN Band (die Hälfte der Dreiecke einer Kreuz-Karte)
        var voll = Math.max(0.3, typeof d.hairVol === "number" ? d.hairVol : 1.0);
        var vol = voll * (HAAR_KAPPE[stil] ? 0.5 : 1);
        var len = Math.max(0.25, typeof d.hairLen === "number" ? d.hairLen : 1.0);
        // K57: die Kalotten-Schale IST die Haar-Kappe des Stils (die Strähnen wurzeln auf dem Volumen; vorher eine eigene
        // Schale, deren Vorderseite auf Stirnhöhe lag — die Strähnen stachen als Punkte aus der Stirn)
        var kap = haarKappe({ hairStyle: HAAR_KAPPE[stil] ? stil : "mittel", hairVol: voll })[0];
        var K = kap.c, // Kalotten-Schale (Zentrum · Radius · Skala)
            KR = kap.r,
            KS = kap.sc;
        var N = [0, 0.28, -0.16], // Nacken-Schale
            NR = 0.36,
            NS = [0.9, 0.75, 0.7];
        // die Schalen-Zeilen liegen (HAAR_STRICH, haar.K2): ihre Strähnen folgen dem Strich `d` auf der Kappe
        var HS = HAAR_STRICH;
        var liegend = { liegt: HS.liegt, streu: HS.streu, rund: HS.rund, faellt: HS.faellt, t: HS.t, locke: HS.locke };
        var zi = function (n, l, extra) {
            var z = { teil: "head", c: K, r: KR, sc: KS, d: [0, -0.12, -0.85], n: Math.round(n * voll), l: l * len, t: 0.01 };
            for (var k0 in liegend) z[k0] = liegend[k0];
            if (extra) for (var k in extra) z[k] = extra[k];
            return z;
        };
        var nacken = function (n, l, extra) {
            var z = { teil: "head", c: N, r: NR, sc: NS, d: [0, -0.55, -0.6], n: Math.round(n * voll), l: l * len, t: 0.01 };
            for (var k0 in liegend) z[k0] = liegend[k0];
            if (extra) for (var k in extra) z[k] = extra[k];
            return z;
        };
        // JEDE ZEILE AUF EINER SCHALE LIEGT (w28-mensch-samen, KOPF_SOLL haarStachel): das krause Haar (afro) liegt auf der Kappe
        // seines Stils und eine Lage darüber, sein Strich ist der Wurf allein (kein Kamm: `d` 0, die volle Streuung), die Spitze
        // hebt sich um 22° (die Krause); der Knoten (dutt) liegt um seine eigene Schale gewunden, das Deckhaar des Undercut zur
        // Seite gekämmt auf seiner Kappe. Bis hier standen diese Zeilen als Kreuz-Karten in der Normale der Schale (afro: jede
        // Strähne, der Knoten ein Igel) — am Ofen L0 standen 61,4 % (afro) und 13,5 % (dutt) der sichtbaren Strähnen steiler als
        // 30° über der Kopf-Haut. Frei hängen nur noch der Fall des langen Haars und die Quaste des Zopfs (unter der Kappe).
        var KRAUS = { d: [0, 0, 0], streu: 1, faellt: 0, liegt: [HS.liegt[0], 0.05], lj: 0.04 };
        // prettier-ignore
        var STILE = {
            glatze: [],
            buzz: [zi(840, 0.035)],
            kurz: [zi(1000, 0.09), nacken(400, 0.08)],
            mittel: [zi(1400, 0.16), nacken(630, 0.192)],
            lang: [
                zi(1200, 0.29), nacken(700, 0.35, { lj: 0.2 }),
                { teil: "head", c: [0, 0.3, -0.1], r: 0.4, sc: [0.95, 0.9, 0.85], d: [0, -0.8, -0.35], n: Math.round(700 * vol), l: 0.55 * len, lj: 0.25, t: 0.01 },
            ],
            locken: [
                zi(1100, 0.14, { r: 0.45 }), zi(550, 0.13, { r: 0.48, d: [0, 0.1, -0.5] }),
                nacken(400, 0.14, { r: 0.39 }),
            ],
            afro: [
                zi(1100, 0.1, KRAUS), zi(500, 0.1, { r: KR * 1.07, d: KRAUS.d, streu: KRAUS.streu, faellt: 0, liegt: KRAUS.liegt, lj: KRAUS.lj }),
            ],
            zopf: [
                zi(900, 0.1, { d: [0, -0.35, -0.92] }), nacken(300, 0.09, { d: [0, -0.35, -0.92] }),
                { teil: "head", art: "quaste", c: [0, 0.68, -0.38], box: [0.16, 0.06, 0.1], d: [0, -1, -0.22], n: Math.round(240 * vol), l: 0.7 * len, lj: 0.55, t: 0.02 },
            ],
            dutt: [
                zi(900, 0.1, { d: [0, -0.35, -0.92] }), nacken(300, 0.09, { d: [0, -0.35, -0.92] }),
                zi(420, 0.14, { c: [0, 0.81, -0.2], r: 0.2, sc: [1.1, 1.0, 0.9], d: [1, 0, 0.25], faellt: 0, lj: 0.04 }),
            ],
            undercut: [
                zi(420, 0.03), zi(550, 0.19, { d: [0.55, -0.5, -0.2], lj: 0.12 }),
            ],
        };
        // der Ton jeder Strähne (HAAR_STRICH): die Melanin-Streuung und die Wurzel — jede Zeile jedes Stils, EIN Anker für HAAR_LOOK
        var zeilen = STILE[stil] || STILE.mittel;
        for (var zz = 0; zz < zeilen.length; zz++) {
            zeilen[zz].ton = HS.ton;
            zeilen[zz].wurzel = HS.wurzel;
        }
        return zeilen;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  B1 REZEPTE (Vertrags-Form) — EIN Rezept "mensch" (das Lab ist ein
    //  Dial-Studio, kein Preset-Katalog: der Startzustand IST die Gattung):
    //  kind "koerper", s = die acht numerischen Dials, fx.gestalt = die
    //  String-Wahlen, fx.motion = das v1.1-Komponenten-Feld, fx.place
    //  {mode:"none"} (der Avatar spawnt nie per Worldgen).
    // ═══════════════════════════════════════════════════════════════════════
    var PRESETS = (function () {
        var s = {};
        var gestalt = {};
        for (var k in START_PARAMS) {
            if (!Object.prototype.hasOwnProperty.call(START_PARAMS, k)) continue;
            if (typeof START_PARAMS[k] === "number") s[k] = START_PARAMS[k];
            else gestalt[k] = START_PARAMS[k];
        }
        return {
            mensch: {
                kind: "koerper",
                lab: "Mensch (Da Vinci Studio)",
                s: s,
                fx: {
                    place: { mode: "none" },
                    gestalt: gestalt,
                    motion: { presets: JSON.parse(JSON.stringify(MOTION)) },
                    // PHYSIK-NAHT (rein additive DATEN-Zeile — Praezedenz: §8.5-Stufen-
                    // Zeile): DIE BEWEGUNGS-KOEFFIZIENTEN des Avatars als Gesetzbuch-
                    // Daten (byte-gleiche Zahlen des historischen Host-Satzes; Formel je
                    // Stat: base + (1 − dichte)·leicht + <zweite Achse>·mag — speed/jump
                    // lesen magieleitung, staminaMax liest waermeleitung). Der Wirt
                    // (STAT_FROM_TAGS) liest fail-soft: Kern kalt → seine Literale.
                    bewegung: {
                        // DIE REALITAETS-EICHUNG (Schoepfer-Wort 17.07.: "die
                        // Realitaet unser Spiegel") -- die Verben tragen
                        // MENSCHEN-Masse: Gehen ~1.5 m/s (dichte-Spanne 1.15-2.0),
                        // Sprint x4.5 ~6.8 m/s, Sprung ~0.53 m (bei g=9.81, faellt
                        // mit derselben Welle von 1.5x-Erde), Klettern 0.6 m/s,
                        // Schwimmen ~1.3 m/s. Die Arcade-Saetze (base 7 / Sprint x2
                        // / jump 8 / kletterV 3.2 / tauchV 3.2) fielen mit dem Wort.
                        speed: { base: 1.15, leicht: 0.6, mag: 0.25 },
                        // Der Sprint-Faktor reist als Gesetz (war Stamm-Literal x2):
                        // Gehen -> Sprint wie Mensch (1.5 -> ~6.8 = trainierter Lauf).
                        sprintMul: 4.5,
                        jumpPower: { base: 2.6, leicht: 1.0, mag: 0.5 },
                        staminaMax: { base: 100, leicht: 60, mag: 40 },
                        // SCHWIMM-HEIMAT (rein additive DATEN-Zeile — Praezedenz: die
                        // Bewegungs-Koeffizienten oben): DIE WASSER-BEWEGUNG des Avatars
                        // als Gesetzbuch-Daten (byte-gleiche Zahlen des historischen
                        // Host-Satzes). tauchV/aufV m/s (Shift/Space), lerp Glaettung,
                        // Neutral-Auftrieb min(hubCap, max(-hubCap, vy*hubK) + d*tiefeK)
                        // mit d = min(tiefeCap, Tiefe), drag Horizontal-Daempfer je
                        // Schritt, taktZug/taktTreten der Schwimm-Phasentakt, lean die
                        // Koerper-Lehne (rad), pose die Kraul-Winkel des Rigs (Kopf,
                        // Arm-Zug/-Treten/-Absenkung/-Spreizung, Bein-Zug/-Treten/-Takt),
                        // ausdauerProS die Ausdauer-Kosten aktiver Zuege. Der Wirt liest
                        // fail-soft (_schwimmGesetz): Kern kalt -> seine Literale.
                        schwimmen: {
                            // REALITAETS-EICHUNG 17.07.: Tauchen/Auftauchen ~1 m/s,
                            // Hub-/Sink-Kappen menschlich (1.2/2 m/s), Kraul-Takt
                            // ~1.6 Zuege/s (war 3.2/3.2/2.5/8/5.0/2.3 -- Arcade).
                            tauchV: 1.0,
                            aufV: 1.0,
                            lerp: 0.25,
                            hubK: 0.45,
                            tiefeK: 0.18,
                            hubCap: 1.2,
                            tiefeCap: 2,
                            drag: 0.7,
                            taktZug: 1.6,
                            taktTreten: 0.9,
                            // NEU (Zensus 17.07., zwei Stamm-Altlasten fallen):
                            // speedMul = horizontales Wasser-Tempo relativ zum Gehen
                            // (war hartkodiert 0.55 im Stamm; real: Kraul 1.3 von
                            // Gehen 1.5); leanSoul = die Schwimm-Lehne der Compound-/
                            // Nicht-Rig-Seelen (war Stamm-Konstante SOUL_SWIM_LEAN).
                            speedMul: 0.85,
                            leanSoul: { moving: 0.5, idle: 0.22 },
                            lean: { zug: 0.6, treten: 0.3 },
                            pose: {
                                kopf: -0.35,
                                armZug: 1.3,
                                armTreten: 0.6,
                                armAb: 0.3,
                                armSpreiz: 0.5,
                                beinZug: 0.4,
                                beinTreten: 0.16,
                                beinTakt: 1.6,
                            },
                            ausdauerProS: 6,
                        },
                        // PARKOUR-HEIMAT (rein additive DATEN-Zeile): die Ninja-Park-
                        // Verben des Labs als reisende Gesetze -- Doppelsprung (Anzahl
                        // + Anteil an jumpPower), Wandsprung (Anteil + horizontaler
                        // Abstoss m/s), Klettern (W gegen die Wand: Steigtempo m/s +
                        // Ausdauer-Kosten je s), Rutsch (Taste C: Tempo-Boost ueber
                        // den Sprint [Lab 21/18], Dauer, Mindest-Fahrt). Der Wirt
                        // liest fail-soft: Kern kalt -> KEIN Parkour (byte-alt).
                        parkour: {
                            doppelspruenge: 1,
                            doppelsprungMul: 0.9,
                            wandsprungMul: 1.0,
                            // REALITAETS-EICHUNG 17.07.: Wand-Abstoss ~3 m/s,
                            // Klettern 0.6 m/s (war 6/3.2 -- Arcade; real klettert
                            // ein Mensch 0.3-0.5, sportlich 0.6), Rutsch-Eintritt
                            // ab 4.5 m/s (nur aus dem Lauf, nie aus dem Gehen).
                            wandAbstoss: 3,
                            kletterV: 0.6,
                            kletterAusdauerProS: 12,
                            // WANDKONTAKT-FRISCHE (Zensus 17.07., rein additiv):
                            // EIN Verfalls-Fenster fuer den Kapsel-Wand-Kontakt.
                            // Wandsprung (0.18) und Klettern (0.15) lasen divergente
                            // Stamm-Zwillinge -- vereint auf 0.18 (das Klettern haelt
                            // den Kontakt ohnehin frame-frisch, solange W drueckt).
                            kontaktFrischeSec: 0.18,
                            slideTempoMul: 1.167,
                            slideDauerSec: 0.68,
                            slideMinTempo: 4.5,
                            // RUTSCH-POSE (V18.485, rein additiv): der Koerper legt
                            // sich in den Gleit -- Lehne zurueck (rad, Ganzkoerper),
                            // Beine voraus (Hueftbeuge + Knie-Knick), ein Arm
                            // stuetzt hinten, der freie Arm balanciert, der Kopf
                            // haelt den Blick voraus. Wirt liest fail-soft: Feld
                            // fehlt (alter Kern) -> keine Pose (byte-alt).
                            slidePose: {
                                lehne: -0.85,
                                beinVor: 1.15,
                                knieKnick: 0.45,
                                armStuetz: -0.9,
                                armFrei: 0.4,
                                kopf: 0.55,
                            },
                        },
                        // LUFTKONTROLLE (Zensus 17.07., rein additive DATEN-Zeile):
                        // die vier C5-Gefuehls-Hebel der Beschleunigungs-/Brems-
                        // Kurven als Gesetzbuch-Daten (exp-Lerp 1-e^(-k*dt):
                        // kAcc Boden-Beschleunigung 25 ms bis 63 %, 98 % des Tempos
                        // in 0,1 s (die Anfahr-Rampe der Spiele, Source/Quake;
                        // leib.K1: kAcc 14 brauchte ~31 ms Sim bis 1 cm Gang, die
                        // Taste bis zum bewegten Leib im Bild p95 > 50 ms),
                        // kAccLuft die schwaechere Luftkontrolle, kBrake der
                        // Boden-Schlitter ~110 ms, kBrakeLuft laesst den Sprung-
                        // Bogen ballistisch). Der Wirt liest fail-closed
                        // (_bewegungsBlock).
                        luft: { kAcc: 40, kAccLuft: 4.5, kBrake: 9, kBrakeLuft: 1.5 },
                        // SPRUNG-FENSTER (Zensus 17.07., rein additiv): die zwei
                        // Plattformer-Toleranzen -- coyoteSec (Sprung kurz NACH
                        // der Kante) + bufferSec (Space kurz VOR der Landung
                        // gemerkt, feuert beim Aufsetzen). Byte-gleich zum
                        // historischen Host-Satz (0.3 / 0.12).
                        sprung: { coyoteSec: 0.3, bufferSec: 0.12 },
                        // DIE GANG-ZEILE DES ZWEIBEINERS (K07, Vertrags-Akt): die
                        // Zahlen des EINEN Gang-Gesetzes (tetrapoda gangSchritt/
                        // gangFuss, dieselbe Formel wie die Tiere) fuer den Menschen
                        // -- Schrittlaenge je Zyklus L*(schrittBasis + schrittFroude*
                        // v/sqrt(g*L)) mit L = gebaute Beinlaenge, der Tastgrad vom
                        // Gehen (0.6) zum Laufen (0.39) um Fr = laufFroude (Alexander
                        // 2004), maxWinkel deckelt den Fussweg (2*L*tan: +-27 Grad
                        // Bein-Winkel: die Huefte sinkt im Lauf <= 0.25 L; im Lauf
                        // faellt der Tastgrad mit dem Tempo, Weyand 2000), hub*L hebt den Fuss im Schwung (laufend
                        // hubLauf*L), beckenHub*L hebt das Becken ueber der Mitte des
                        // Stands (Gard 2004: 4-5 cm; tetrapoda gangBecken). Geeicht
                        // auf 1.34 m/s ~ 1.9 Schritte/s bei 0.7 m und 6 m/s ~ 3
                        // Schritte/s (Weidmann 1993). Der Eich-Faktor des
                        // Schritt-Blocks (Schritt 3.4 m, 0.34 Schritte/s) faellt.
                        gang: {
                            schrittBasis: 0.78,
                            schrittFroude: 1.89,
                            tastgrad: 0.6,
                            tastgradLauf: 0.39,
                            laufFroude: 0.5,
                            maxWinkel: 0.47,
                            hub: 0.12,
                            hubLauf: 0.3,
                            hubForm: 0.5,
                            beckenHub: 0.05,
                            // DAS ABROLLEN (tetrapoda gangRolle/gangVersatz): ab
                            // der Mitte des Stands hebt die Ferse, der Fuss rollt
                            // bis 0.7 rad (40 Grad) ueber den Ballen; ballen und
                            // knoechel sind der gebaute Fuss je Reichweite der
                            // Kette (Ballen 0.46 E vor, Sohle 0.30 E unter dem
                            // Knoechel bei 2.946 E Bein). Die Senke des Gehens
                            // faellt so von 0.105 auf 0.047 R (Gard 2004: 4-5 cm).
                            rollWinkel: 0.7,
                            fersenAb: 0.5,
                            ballen: 0.16,
                            knoechel: 0.1,
                        },
                        // ZENSUS-REST (V18.488, rein additiv): taktCompound = die
                        // EINE Takt-Basis der zeit-getriebenen Compound-/Nicht-
                        // Rig-Gaenge (rad/s; war der divergente Stamm-Zwilling
                        // 5.5 lokal vs 5.0 Peer -- vereint auf 5.5, alle drei
                        // Leser haengen an derselben Emotions-Bruecke);
                        // klangTempoMin = die Schritt-Klang-Schwelle (m/s --
                        // darunter feuert kein Schritt; sein Klang ist das Gesetz
                        // SCHRITT im klang-Gesetzbuch aus der Stoff-Zeile).
                        schritt: { taktCompound: 5.5, klangTempoMin: 0.9 },
                        // AKTIONS-AUSDAUER (Zensus 17.07., rein additiv): die
                        // Ausdauer-Kosten EINER Maus-Arm-Aktion (Hieb/Abbau/
                        // Platzieren) im Pfad-Modus -- reist wie ausdauerProS/
                        // kletterAusdauerProS als Koerper-Kosten-Feld (war die
                        // Stamm-Konstante MOUSE_ACTION_STAMINA_COST). Byte-gleich 5.
                        aktionAusdauer: 5,
                        // STEILHANG-GESETZ (Zensus-Rest V18.488, rein additiv):
                        // was der Koerper BEGEHEN kann -- maxSlopeY = cos(max.
                        // Hangwinkel) der Boden-Normale (0.5 = 60 Grad; steiler
                        // => onSteepSlope: Input-Drossel + Hangabtrieb), malus =
                        // die Bewegungs-Drossel am Steilhang. Byte-gleich zu den
                        // historischen Stamm-Literalen (0.5 / 0.2).
                        hang: { maxSlopeY: 0.5, malus: 0.2 },
                        // LANDUNGS-GEFUEHL (Zensus-Rest V18.488, rein additiv):
                        // der Aufprall-Dip des Auges (View-Punch, Koerper faengt
                        // den Stoss) + die Kamera-Koerper-Glaettung -- dipProV m
                        // Dip je m/s Aufprall, dipMax der Deckel (harter Sturz),
                        // minTempo die Spuer-Schwelle (gate't auch den Landungs-
                        // Klang), erholK die Rueckfederung (~300 ms), kameraK
                        // die Auge-folgt-Koerper-Glaettung. Byte-gleich
                        // (0.022 / 0.32 / 2.5 / 8 / 14).
                        landung: { dipProV: 0.022, dipMax: 0.32, minTempo: 2.5, erholK: 8, kameraK: 14 },
                        // DER LEIB DER KAMERA (K06, rein additiv): die 3rd-Kamera ist
                        // eine Kugel vom Radius armRadiusM (m) -- sie haelt absolut so
                        // weit vor jeder Flaeche und ueber dem sichtbaren Boden (Wirt:
                        // _loopCamera, der Wurf _fieldRaycast radius; Lab: die Strecke
                        // Blickziel -> Kamera gegen die Park-Boxen, in Lab-Massen);
                        // armRuhe der Rest je Sekunde, den der Arm frei noch vor sich
                        // hat (Wirt: der gleitende Arm; Lab: die Kamera-Glaettung).
                        // Byte-gleich zum Wirt-Literal KAMERA_ARM_RUHE (0.0016).
                        kamera: { armRadiusM: 0.3, armRuhe: 0.0016 },
                    },
                    // KAMPF-QUARTETT (Spiegel-Zensus 17.07., rein additive DATEN-
                    // Zeile — Praezedenz: die Bewegungs-Koeffizienten oben): DIE
                    // KAMPF-STAT-KOEFFIZIENTEN des Koerpers als Gesetzbuch-Daten
                    // (byte-gleiche Zahlen des historischen Host-Satzes; Formel je
                    // Stat: base + dichte-Tag*dichte + haerte-Tag*haerte — Masse
                    // traegt HP/Stoss/Panzer, Haerte traegt Schaden/Panzer). Der
                    // Wirt (STAT_FROM_TAGS via _kampfKoeff) liest fail-soft:
                    // Kern kalt / Zeile fehlt -> seine byte-gleichen Literale.
                    kampf: {
                        hpMax: { base: 50, dichte: 60, haerte: 30 },
                        damage: { base: 5, dichte: 5, haerte: 15 },
                        knockback: { base: 1, dichte: 9, haerte: 2 },
                        defense: { base: 0, dichte: 8, haerte: 6 },
                        // EQUIP-FOLD-GEWICHTE (Zensus-Rest V18.488, rein
                        // additiv): wie stark das GEHALTENE Geraet (held),
                        // die Waffe/Ruestung/das Werkzeug einer KREATUR den
                        // Koerper-Compound praegen (Tag-Faltung vor
                        // STAT_FROM_TAGS) -- Koerper-Gesetz, kein Stamm-
                        // Literal. Byte-gleich (0.4 / 0.4 / 0.3 / 0.15).
                        fold: { held: 0.4, weapon: 0.4, armor: 0.3, tool: 0.15 },
                    },
                    // ANATOMIE-ANKER (Zensus-Rest V18.488, rein additiv): die
                    // SITZ-HUEFTE -- wie hoch das Koerper-ZENTRUM der sitzenden
                    // Pose ueber dem Sattelpunkt liegt (m; die M3-Sitz-Pose
                    // senkt die Huefte AUF den Sattel). Spieler-Anatomie,
                    // gefaehrt-skalen-unabhaengig; war die Stamm-Konstante
                    // SITZ_HIP_OFFSET. Byte-gleich 0.45.
                    anatomie: { sitzHipOffset: 0.45 },
                },
            },
        };
    })();


    // KONVERGENZ II — DIE FARB-WAHRHEITEN wohnen im Gesetzbuch (Schöpfer „es sind
    // noch immer nachbauten": die Stamm-KL-Tabelle und die Genom-Paletten waren
    // ZWILLINGE der Lab-Werte — gefallen; beide Leser lesen NUR noch hier):
    // MATERIAL_KLASSEN — die flachen Klassen-Farben der Lab-Materialien (Z.77,
    // verbatim: lips/eye/iris/cornea/socket/dark/joint/shadow); skin/hair reisen
    // als Genom/Wahl, shorts ist das Stamm-Würde-Band.
    // `seh` (Integration W8, additiv): die Seh-Klasse des Stoffs (phyto-core BUDGET_GESETZ.seh) — das Budget-Gesetz
    // faltet nur innerhalb EINER: das Auge (Augapfel · Iris · Pupille) nie in die Haut, die Haut-Akzente (Lippe ·
    // Augenhöhle · Furche · Gelenk · Schatten) nur in die Haut, die Hose nur in Stoff.
    var MATERIAL_KLASSEN = Object.freeze({
        lips: Object.freeze({ r: 0.4, seh: "haut" }), // K57: der Ton folgt der Haut (kopfToene), kein roter Fleck
        eye: Object.freeze({ c: 0xdcd5ca, r: 0.08, seh: "auge" }), // Welle 5: die Sklera (vorher 0xf5f5f0, linear 0,91 — Papier)
        iris: Object.freeze({ c: 0x2a4a6a, r: 0.15, seh: "auge" }),
        pupil: Object.freeze({ c: 0x000000, r: 0.2, seh: "auge" }),
        socket: Object.freeze({ r: 0.6, seh: "haut" }), // K57: ein Schatten der Haut (kopfToene), kein brauner Ring
        dark: Object.freeze({ c: 0x050000, r: 0.9, seh: "haut" }),
        joint: Object.freeze({ c: 0x806060, r: 0.6, seh: "haut" }),
        shadow: Object.freeze({ c: 0x8a5840, r: 0.7, seh: "haut" }),
        shorts: Object.freeze({ c: 0x4a5058, r: 0.8, seh: "stoff" }),
    });
    // SKIN_TONES / HAIR_COLORS — die Lab-Paletten (Z.63/Z.79, verbatim):
    // prettier-ignore
    var SKIN_TONES = {porzellan:{hex:0xe6c6ae,name:'Porzellan'},hell:{hex:0xe3b898,name:'Hell'},sand:{hex:0xd4a17e,name:'Sand'},karamell:{hex:0xc48566,name:'Karamell'},bronze:{hex:0xa86a4d,name:'Bronze'},umbra:{hex:0x7d4a33,name:'Umbra'},mahagoni:{hex:0x6a4230,name:'Mahagoni'},ebenholz:{hex:0x58392a,name:'Ebenholz'}};
    // prettier-ignore
    var HAIR_COLORS = {black:{base:0x141014,lt:0x2a2228,name:'Schwarz'},darkbrown:{base:0x2a1a10,lt:0x42291a,name:'Dunkelbraun'},brown:{base:0x472c18,lt:0x6b4226,name:'Braun'},chestnut:{base:0x6b3a1a,lt:0x8f5a2e,name:'Kastanie'},blond:{base:0xa9803f,lt:0xceac6a,name:'Blond'},platinum:{base:0xcfc097,lt:0xe8ddbf,name:'Platin'},ginger:{base:0x8a3b18,lt:0xb35e2a,name:'Rot'},grey:{base:0x6e6a66,lt:0x9a958f,name:'Grau'},white:{base:0xcecbc5,lt:0xeeece8,name:'Weiß'},blue:{base:0x244a8a,lt:0x4a78c0,name:'Blau'},pink:{base:0xb0497a,lt:0xd47aa6,name:'Pink'},teal:{base:0x1f6a66,lt:0x3a9a94,name:'Teal'}};

    // KONVERGENZ-WELLE: der 8-KH-Eigen-Atlas des Stamms (landmarks + humanSkeleton,
    // ~940 Z.) ist GEFALLEN — der EINE Mensch ist der Da-Vinci-Teile-Baum
    // (bauMensch + morphAuf, unten); beide Leser (Lab-Shell wie Stamm) bauen NUR
    // noch daraus. Kein zweites Anatomie-Gesetz mehr.

    // ════════════════════════════════════════════════════════════════════
    // DER HAUT-/HAAR-LOOK (Konsum-Tiefe, 19.07., rein additiv) — das SHADER-
    // Gesetz der Lab-Materialien als DATEN (verbatim-Zahlen aus
    // koerperstudio.js: matSkin [warmer SSS-Fresnel-Saum pow3 ×0.15,
    // Rauheit 0.62] und createDeepFurMat `deep_human_fur_v1` [Haar-Strähnen:
    // Spitzen-Rim pow3 + Spec pow8 ×0.3 über der Wurzel→Spitze-Achse]).
    // KONSUMENTEN: der Welt-Material-Resolver webt sie als Post-Licht-
    // Additive (dieselbe GLSL-Addition des Labs). MESHFREI §8: reine Zahlen.
    var HAUT_LOOK = Object.freeze({
        sssPow: 3,
        sssFarbe: Object.freeze([1.0, 0.4, 0.25]),
        // A4 (die Haut mit Tiefe): der Saum ist ein Additiv NACH dem Licht — er leuchtet im Schatten wie in der Sonne. Mit
        // 0,15 trug er auf der dunklen Haut im Schatten so viel Rot wie das Licht selbst: die Wange glühte, die Lippe ging
        // unter (Bild Δa* +1,2 ohne ihn), die Haut war flach. 0,05: Kontrast der Kopf-Haut im Bild 0,61 → 0,65 (Tafel mensch-kopf --echt).
        sssAmt: 0.05,
        // Vollendung (19.07.): der Clearcoat der Lab-Haut (matSkin: 0.12/0.6)
        // und das Atem-Noise-Displacement (snoise(pos·3 + t·0.1)·0.0035) —
        // verbatim aus koerperstudio matSkin.
        clearcoat: 0.12,
        clearcoatRoughness: 0.6,
        atem: Object.freeze({ freq: 3.0, amp: 0.0035, t: 0.1 }),
    });
    // DAS HAAR LIEGT (haar.K2 — die Strähnen-Kohärenz gegen die REF ref-haar; foundry-core `__streuGeo`): jede Strähne einer
    // Schalen-Zeile (`zi`, `nacken` in haarStreu) wurzelt auf der Kappe ihres Stils und LIEGT auf ihr, EIN Band dem Strich der
    // Zeile nach — sie SIND die Fläche des Haars (volle Dichte, je Strähne zwei Dreiecke statt vier der Kreuz-Karte), nur in der
    // Zone, in der die Kopf-Haut den Ton der Kappe trägt (der Ofen: `haarZone`, die Regel ihrer Farbe):
    //   liegt  [Höhe der Wurzel, Höhe der Spitze] über der Kappe (Kopf-Raum, 1 ≈ 0,21 m: 2,5 und 5,5 mm — die Lage der Strähnen,
    //          die Spitze über der nächsten Wurzel; tiefer begrub die Haut die Wurzeln an der Haarlinie)
    //   t      die Breite (Wurzel 1,8 t, Spitze 0,65 t je Seite: 9 und 3 mm)
    //   streu  die Streuung des Strichs (Anteil der Kreuz-Karten-Streuung) · faellt  die Schwere am Hinterkopf (dort
    //          liefe der Strich `d` sonst in die Normale: die Strähnen stünden in jede Richtung)
    //   rund   die Normale kippt zur Kante (rad): die Strähne ist rund, das Licht läuft quer über sie
    //   locke  [Locken je Umlauf, Ton ±]: Strähnen benachbarter Wurzel teilen den Ton ihrer Locke — auf 4 m (Third) ist die
    //          Strähne unter einem Pixel, die Locke 3 Pixel breit · ton  die Melanin-Streuung je Strähne (±)
    //   wurzel der Ton der Wurzel (die Lage darüber verdeckt sie; `haarAchse` liest an ihm die Ecken des Bands) — die Albedo
    //          des Haars bleibt sein Ton, wo man es sieht (Keratin mit Melanin, die Zeile haar der Albedo-Tafel).
    // Bis haar.K2 stand jede Strähne als Kreuz-Karte vom Kopf ab, die Wurzel bei 0,12 über die ganze Länge: das Bild zeigte das
    // Raster der Kappe statt Strähnen (Strich arm 0,28 / third 0,38 gegen die REF 0,44, Radeon 20d09a04), das Haar las dunkler als
    // Schwarz (Dunkelbraun: der Ton 0,0127, gerechnet über die Strähne im Mittel ≈ 0,006 — unter dem Band [0,01; 0,3]).
    var HAAR_STRICH = Object.freeze({
        liegt: Object.freeze([0.012, 0.026]),
        t: 0.012,
        streu: 0.5,
        faellt: 1,
        rund: 1.2,
        locke: Object.freeze([48, 0.3]),
        ton: 0.2,
        wurzel: 0.85,
    });
    // DAS LICHT DES HAARS (w26-haar-arm, Kajiya-Kay 1989 / Marschner 2003 / Scheuermann 2004; Leser: stamm `_haarLichtModell`, das
    // Labor `laborStoff`): an der Tangente der Strähne (koerper `haarAchse`) — wrap die Form N·L umwickelt, kd der Anteil sin(T, L) am
    // Diffusen, jit der Wurf je Strähne auf den Kipp der Lappen; R farblos (Keratin F0 0,046), TRT im Ton des Haars.
    // DER LAPPEN AM PIXEL (w27-haar-arm-2, `fuss` — Glanz-Antialiasing nach dem Fußabdruck: Toksvig 2005, Kaplanyan 2016,
    // Tokuyoshi & Kaplanyan 2019): deckt ein Pixel mehrere Strähnen, trägt es das MITTEL ihrer Lappen statt EINER gezogenen.
    //   breite  die mittlere Breite des Bands im Kopf-Raum ((1,8 + 0,65) × HAAR_STRICH.t je Seite: 9 mm an der Wurzel, 3 an der Spitze)
    //   px      [unter so vielen Pixeln je Strähne trägt das Pixel ihr Mittel ganz, über so vielen löst es sie auf]
    //   streu   die Streuung des Lappen-Arguments T'·H über die Strähnen EINES Pixels: der Wurf (jit/√3 = 0,115), die Rundung
    //           quer zur Strähne (|shift| × das Mittel von sin über ±rund ≈ 0,06) und die Streuung des Strichs (0,06–0,10 je
    //           Achse im Umkreis eines Pixels, gemessen an den 1215 Strähnen des Stils mittel) — √(0,115² + 0,06² + 0,10²) = 0,17
    //   flaeche der Anteil, um den das Licht des Haars unter dem Pixel (`unter` 1) zur Fläche geht — das Licht des Standard-Stoffs
    //           an der Normale der Kappe: die Tangente einer einzelnen Strähne trägt dort kein Licht mehr, das Mittel vieler ist die
    //           Fläche (die Ferne der Haar-Karten jeder Engine); aufgelöst (`unter` 0) trägt die Faser alles. Gemessen in DERSELBEN
    //           Welt (Radeon f8fa2154, Prüfplatz, das graue Haar des Ankers): das Licht der Fläche Kopf 0,4–1,4 %, Kajiya-Kay mit den
    //           geweiteten Lappen 1,7–2,5 %, ohne TRT 1,9 %, ohne beide Lappen 0,8 % — die Lappen flimmern, solange sie leben
    // Der Lappen weitet sich um sie (`haarLappen`): p' = p / (1 + p · streu² · unter), sein Band trägt dieselbe Energie, breiter
    // und flacher; der Wurf der einzelnen Strähne fällt mit `unter`, und mit `unter` geht das Licht zur Fläche (`flaeche`). Bis hier zog jedes Pixel EINE Strähne aus mehreren: der Lappen R (p 80, im Gipfel
    // 160-mal das Diffuse des dunkelbraunen Haars) flimmerte im Gang von Bild zu Bild (Radeon 890M, Prüfplatz Third,
    // gate:kamera-leib:echt K6: Kopf 9,6–10,6 % der Pixel über halb zum Grund; nur R 11,3 %; ohne R, nur TRT (p 20) und unter
    // dem Standard-Licht je 0,1 %).
    var HAAR_LOOK = Object.freeze({
        kk: Object.freeze({
            wrap: 0.5,
            kd: 1,
            jit: 0.2,
            fuss: Object.freeze({ breite: 2.45 * HAAR_STRICH.t, px: Object.freeze([1.5, 4]), streu: 0.17, flaeche: 1 }),
            R: Object.freeze({ farbe: Object.freeze([0.046, 0.046, 0.046]), shift: -0.1, p: 80 }),
            TRT: Object.freeze({ amt: 0.5, shift: 0.1, p: 20 }),
        }),
    });
    // DER RAHMEN DER STRÄHNE (w25-haar-albedo; Leser: der Welt-Stoff über stamm `_haarAchse`, das Labor `laborStoff`): das Gesetz
    // der Ecken des Bäckers (foundry-core `__streuGeo`: je Band vier Ecken — zwei an der Wurzel im Ton × HAAR_STRICH.wurzel, zwei
    // an der Spitze im Ton) rückwärts gelesen. Je Ecke [Achse, Länge]: die Achse 0 an der Wurzel, an der Spitze die Länge des Bands
    // (die Feder des Winds liest sie, haar.K3), die Länge an jeder Ecke (Achse ÷ Länge = der Anteil Wurzel → Spitze, den der Glanz
    // der Spitze liest). Die Farbe kann die Achse nicht tragen: jede Strähne trägt ihren eigenen Ton (HAAR_STRICH ton, locke) über einer
    // Wurzel von 0,85 — bis hier lasen Welt und Labor den Anteil als Ton ÷ Ton-Anker und maßen den Würfel des Tons (der Glanz
    // schaltete je Strähne ganz an oder aus: das dunkelbraune Haar stand weiß, haar.K2#1). Eingaben je Ecke: Lage und Farbe
    // (xyz hintereinander), Ton (`menschTon`). Ein Vierer im Ton des Haars, dessen Farben dem Gesetz nicht folgen, ist ein Bruch
    // (gezählt) — außer er ist eine Fläche in einem Ton (die Kappe der Grobstufe). Rückgabe { achse (Float32Array, 2 je Ecke), zahl,
    // bruch }. DIE TANGENTE (w26-haar-arm, Kajiya-Kay): je Ecke `tangente` [x, y, z, Wurf] — die Richtung Wurzel → Spitze (die Mitte der Spitze
    // − die Mitte der Wurzel, Einheit) und der Wurf der Strähne; das Licht des Haars läuft an ihr, nie an der Normale (`_haarLichtModell`).
    function haarAchse(lage, farbe, ton) {
        var n = ton.length,
            haarTon = menschTon("hair"),
            wz = HAAR_STRICH.wurzel,
            A = new Float32Array(n * 2),
            TA = new Float32Array(n * 4),
            zahl = 0,
            bruch = 0;
        var gleich = function (x, y) {
            return Math.abs(x - y) <= 1e-5 + 2e-3 * Math.abs(y);
        };
        for (var i = 0; i + 3 < n; i += 4) {
            var haar = true,
                k,
                f;
            for (k = 0; k < 4; k++) haar = haar && Math.round(ton[i + k]) === haarTon;
            if (!haar) continue;
            var gesetz = true,
                flach = true;
            for (f = 0; f < 3; f++) {
                var c0 = farbe[i * 3 + f],
                    c1 = farbe[(i + 1) * 3 + f],
                    c2 = farbe[(i + 2) * 3 + f],
                    c3 = farbe[(i + 3) * 3 + f];
                gesetz = gesetz && gleich(c0, c1) && gleich(c2, c3) && gleich(c0, wz * c2);
                flach = flach && gleich(c1, c0) && gleich(c2, c0) && gleich(c3, c0);
            }
            if (!gesetz && flach) continue;
            if (!gesetz) {
                bruch++;
                continue;
            }
            var d = [0, 0, 0];
            for (f = 0; f < 3; f++)
                d[f] = (lage[(i + 2) * 3 + f] + lage[(i + 3) * 3 + f] - lage[i * 3 + f] - lage[(i + 1) * 3 + f]) / 2;
            var l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
            // der Wurf der Strähne (−1 … 1, ein Hash ihrer Nummer — die Lage der Ecken bleibt): er kippt ihre Glanz-Lappen (HAAR_LOOK)
            var h = Math.sin((i >> 2) * 12.9898 + 78.233) * 43758.5453,
                wurf = 2 * (h - Math.floor(h)) - 1;
            for (k = 0; k < 4; k++) {
                A[(i + k) * 2] = k < 2 ? 0 : l;
                A[(i + k) * 2 + 1] = l;
                for (f = 0; f < 3; f++) TA[(i + k) * 4 + f] = l > 0 ? d[f] / l : 0;
                TA[(i + k) * 4 + 3] = wurf;
            }
            zahl++;
        }
        return { achse: A, tangente: TA, zahl: zahl, bruch: bruch };
    }
    // DER LAPPEN AM PIXEL ALS GESETZ (w27-haar-arm-2, HAAR_LOOK.kk.fuss; Leser: stamm `_haarLichtModell`, das Labor `laborStoff`):
    // die Zahlen eines Glanz-Lappens der Potenz p. Der Leser rechnet mit `unter` (0 das Pixel löst die Strähne auf … 1 es deckt
    // mehrere) die halbe Potenz h = halb / (1 + weite · unter) — der Lappen ist (1 − cos²)^h, sin^p' mit p' = 2h — und die Norm
    // norm · √((2h + 1,5) / fuss): das Band des Lappens über den Versatz trägt √(2π / (p + 1,5)), geweitet dieselbe Energie; mit
    // unter 0 steht genau sin^p · (p + 2) / 2π. Der Lappen
    // der Faser trägt den Anteil 1 − unter · flaeche (den Rest trägt die Fläche, `kk.fuss.flaeche`).
    function haarLappen(p, kk) {
        var F = (kk || HAAR_LOOK.kk).fuss;
        return {
            halb: p / 2,
            weite: F ? p * F.streu * F.streu : 0,
            flaeche: F ? F.flaeche : 0,
            norm: (p + 2) / (2 * Math.PI),
            fuss: p + 1.5,
        };
    }
    // DAS FLIMMERN DER LAPPEN (rein, w27-haar-arm-2; Leser: `haarGlanzSelbsttest`): EIN Pixel deckt viele Strähnen, jedes Bild
    // zieht EINE. Je Lappen entlang seines Glanz-Bands (der Versatz d des Arguments T'·H der Mittel-Strähne) das Mittel und die
    // Streuung seines Werts über die gezogene Strähne — ihr Strich streut um `strich` je Achse (gemessen 0,06–0,10), ihre Normale
    // kippt um ±HAAR_STRICH.rund quer zur Strähne, ihr Wurf ist ±1 × (1 − unter). Rückgabe je Lappen { flimmern: die größte
    // Streuung × sein Gewicht im Licht (R: die Luma seiner Farbe; TRT: amt × die Luma des Tons `ton`), energie: sein Band über den
    // Versatz, gipfel }. `rechne` (optional) ersetzt den Wert des Lappens (die Mutanten des Selbsttests).
    function haarFlimmern(kk, unter, ton, rechne) {
        var saat = 12345;
        var zieh = function () {
            saat = (Math.imul(saat, 1664525) + 1013904223) >>> 0;
            return saat / 4294967296;
        };
        var gauss = function () {
            return Math.sqrt(-2 * Math.log(zieh() + 1e-12)) * Math.cos(2 * Math.PI * zieh());
        };
        var wert =
            rechne ||
            function (G, u, cos2) {
                var h = G.halb / (1 + G.weite * u);
                return Math.pow(Math.max(1 - cos2, 0), h) * G.norm * Math.sqrt((2 * h + 1.5) / G.fuss) * (1 - u * G.flaeche);
            };
        var rund = HAAR_STRICH.rund,
            strich = 0.08,
            D = [0, 0.1, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9],
            aus = {};
        [
            ["R", kk.R, 0.2126 * kk.R.farbe[0] + 0.7152 * kk.R.farbe[1] + 0.0722 * kk.R.farbe[2]],
            ["TRT", kk.TRT, kk.TRT.amt * ton],
        ].forEach(function (z) {
            var L = z[1],
                G = haarLappen(L.p, kk),
                mittel = [],
                max = 0,
                energie = 0;
            // die Mittel-Strähne: T entlang y, um den mittleren Kipp zur Normale z; H senkrecht zu ihr, um d zu ihr geneigt
            var kz = (L.shift * Math.sin(rund)) / rund,
                kl = Math.sqrt(1 + kz * kz),
                Tm = [0, 1 / kl, kz / kl];
            var hx = 0.7,
                hy = -0.7 * Tm[1] * Tm[2],
                hz = 0.7 * (1 - Tm[2] * Tm[2]),
                hl = Math.sqrt(hx * hx + hy * hy + hz * hz);
            for (var di = 0; di < D.length; di++) {
                var d = D[di],
                    w = Math.sqrt(1 - d * d),
                    H = [(hx / hl) * w, (hy / hl) * w + d * Tm[1], (hz / hl) * w + d * Tm[2]],
                    m = 0,
                    q = 0,
                    n = 8000;
                for (var i = 0; i < n; i++) {
                    var a = (2 * zieh() - 1) * rund,
                        kipp = (2 * zieh() - 1) * (1 - unter) * kk.jit + L.shift,
                        tx = strich * gauss() + Math.sin(a) * kipp,
                        tz = strich * gauss() + Math.cos(a) * kipp,
                        tl = Math.sqrt(tx * tx + 1 + tz * tz),
                        th = (tx * H[0] + H[1] + tz * H[2]) / tl,
                        v = wert(G, unter, th * th);
                    m += v;
                    q += v * v;
                }
                m /= n;
                mittel.push(m);
                max = Math.max(max, z[2] * Math.sqrt(Math.max(q / n - m * m, 0)));
            }
            for (var e = 1; e < D.length; e++) energie += ((mittel[e] + mittel[e - 1]) / 2) * (D[e] - D[e - 1]);
            aus[z[0]] = { flimmern: max, energie: energie, gipfel: mittel[0] };
        });
        return aus;
    }
    // DER SELBSTTEST DES GLANZES UNTER DEM PIXEL (w27-haar-arm-2; Leser: diag-kamera-laub K5 über `lichtSelbsttest`): das Gesetz
    // HAAR_LOOK.kk hält, die Mutanten fallen beim Namen. Die Szene ist die von K6 (gate:kamera-leib:echt): der Prüfplatz, Third, die
    // Kappe 6,4 m vor dem Auge, 1280 × 720 in der Skala der Szene 0,75 — ein Pixel 1,8 cm, die Strähne 0,3 Pixel breit (unter 1);
    // das Haar in beiden Tönen der Welt: Dunkelbraun (das Rezept, 0,0127 — dort trägt R das Flimmern) und Hellgrau (der Anker des
    // Spielers am Prüfplatz, 0,6 — dort TRT, im Ton des Haars). Geeicht an K6 (Kopf je Probe, Soll ≤ 5 %): dunkel ohne Fußabdruck
    // R 0,197 — GTX 1050 bis 11,0 %; grau mit den geweiteten Lappen TRT 0,031 — Radeon bis 5,9 % (debea1a5, ROT; main dort bis
    // 2,7 %); die Fläche 0. HAAR_FLIMMERN_MAX liegt darunter.
    //   1 aufgelöst (unter 0) steht der Lappen des Vorgängers: sin^p · (p + 2) / 2π, bit-gleich
    //   2 am Prüfplatz flimmert kein Lappen über HAAR_FLIMMERN_MAX
    //   3 der geweitete Lappen selbst (ohne die Fläche) hält die Energie seines Bands (±10 %), sein Gipfel fällt
    //   Mutanten: ohne Fußabdruck (`fuss` fehlt: der Stand w26) · ohne die Fläche (flaeche 0: die Lappen leben am Prüfplatz) · ohne
    //   die Weitung (streu 0) · die Norm des geweiteten Lappens ohne die Wurzel ((p' + 2) / 2π: das Band verlöre Energie)
    var HAAR_FLIMMERN_MAX = 0.02;
    function haarGlanzSelbsttest() {
        var v = [],
            kk = HAAR_LOOK.kk,
            mit = function (f) {
                return Object.assign({}, kk, { fuss: Object.assign({}, kk.fuss, f) });
            },
            ton = 0.0127,
            grau = 0.6,
            pz = function (x) {
                return (+x).toFixed(4);
            };
        var G = haarLappen(kk.R.p, kk),
            c2 = 0.03;
        if (Math.pow(1 - c2, G.halb) * G.norm * Math.sqrt((2 * G.halb + 1.5) / G.fuss) !== Math.pow(1 - c2, kk.R.p / 2) * ((kk.R.p + 2) / (2 * Math.PI)))
            v.push("Haar: aufgelöst steht nicht der Lappen sin^p · (p + 2) / 2π");
        var d = haarFlimmern(kk, 1, ton),
            h = haarFlimmern(kk, 1, grau);
        ["R", "TRT"].forEach(function (l) {
            if (!(d[l].flimmern <= HAAR_FLIMMERN_MAX && h[l].flimmern <= HAAR_FLIMMERN_MAX))
                v.push("Haar: der Lappen " + l + " flimmert am Prüfplatz " + pz(d[l].flimmern) + " (dunkel) · " + pz(h[l].flimmern) + " (grau) > " + HAAR_FLIMMERN_MAX);
        });
        var frei = haarFlimmern(kk, 0, ton),
            weit = haarFlimmern(mit({ flaeche: 0 }), 1, ton);
        ["R", "TRT"].forEach(function (l) {
            if (!(Math.abs(weit[l].energie / frei[l].energie - 1) <= 0.1 && weit[l].gipfel < frei[l].gipfel))
                v.push("Haar: der geweitete Lappen " + l + " hält die Energie seines Bands nicht (" + pz(frei[l].energie) + " → " + pz(weit[l].energie) + ")");
        });
        // die Mutanten: jede fällt an ihrem Maß
        var ohne = haarFlimmern(Object.assign({}, kk, { fuss: null }), 1, ton);
        if (!(ohne.R.flimmern > HAAR_FLIMMERN_MAX)) v.push("Haar-Mutante: der Lappen R ohne Fußabdruck bleibt ungenannt (" + pz(ohne.R.flimmern) + ")");
        var leben = haarFlimmern(mit({ flaeche: 0 }), 1, grau);
        if (!(leben.TRT.flimmern > HAAR_FLIMMERN_MAX)) v.push("Haar-Mutante: die Lappen ohne die Fläche bleiben am Prüfplatz ungenannt (TRT grau " + pz(leben.TRT.flimmern) + ")");
        var schmal = haarFlimmern(mit({ flaeche: 0, streu: 0 }), 1, ton);
        if (!(schmal.R.flimmern > 1.5 * weit.R.flimmern))
            v.push("Haar-Mutante: der Lappen ohne die Weitung bleibt ungenannt (R " + pz(schmal.R.flimmern) + " gegen " + pz(weit.R.flimmern) + ")");
        var norm = haarFlimmern(mit({ flaeche: 0 }), 1, ton, function (g, u, cos2) {
            var hh = g.halb / (1 + g.weite * u);
            return (Math.pow(Math.max(1 - cos2, 0), hh) * (2 * hh + 2)) / (2 * Math.PI);
        });
        if (!(norm.R.energie / frei.R.energie < 0.9)) v.push("Haar-Mutante: die Norm ohne Wurzel bleibt ungenannt (Energie " + pz(norm.R.energie) + ")");
        return v;
    }
    // DER SELBSTTEST UNTER DEM LICHT (Leser: diag-kamera-laub K5): das Gesicht (`gesichtSelbsttest`) und der Glanz des Haars
    function lichtSelbsttest() {
        return gesichtSelbsttest().concat(haarGlanzSelbsttest());
    }

    // ════════════════════════════════════════════════════════════════════
    // DIE GESTALT DES MENSCHEN NAH (Welle 5, „der Mensch nah: Hände, Gesicht, Augen"): die Maße, mit denen bauMensch
    // Hand, Arm, Kopf, Gesicht und Hals-Rahmen baut, und die Raster, mit denen der Ofen Kopf und Hände zu EINER Haut
    // gießt — als DATEN (MESHFREI §8), gemessen an der Anthropometrie (erwachsener Mann 1,80 m). labProportionen,
    // labMorph und labLandmarks bleiben eingefroren (gate:koerper-kern); die Faktoren wirken im Bau.
    //   hand: mass skaliert jede Länge der Hand, breite zusätzlich Mittelhand, Finger-Abstand und -Dicke (vorher 1,45×
    //     zu lang und 1,8× zu breit — die Rechen-Hand der Tour) · unterarm: Querschnitt der Unterarm-Ellipse und die
    //     Lage ihres Bauchs (vorher 1,44× breiter als der Oberarm — die Popeye-Arme) · handgelenk: Querschnitt · fuss:
    //     Längen-Faktor (die Ferse-bis-Zeh-Kette war 0,167 Hk statt ~0,15).
    //   kopf: mass = die Kopf-Skala (vorher 0,92: ein Sechs-Kopf-Comic-Mensch, kopfH 0,16 Hk statt 0,13), breite = die
    //     Quer-Skala (der Schädel war 1,5× zu breit) · auge: mass = Augapfel-Skala in der Kopf-Gruppe (vorher 2,3× der
    //     natürliche — die Kulleraugen), abstand = Faktor auf eyeDist = headSeg/1,618 (vorher 1,8× der Pupillen-Abstand),
    //     pupille = Pupillen-Radius-Faktor (die Pupille war 0,7 der Iris statt ~0,35), hoehle = Augenhöhle über dem Ball.
    //   gesicht: lippe = Fülle der Lippen (vorher zwei Würste), lippeZurueck = Lippen, Philtrum, Mundwinkel hinter ihrer
    //     alten Lage (sie lagen fast in der Ebene der Nasenspitze), oberkiefer = Vorstand unter der Nase, wange = die
    //     Wangen-Polster, naseTiefer/brauHoch = die Gesichts-Drittel (die Nasen-Basis lag 0,18 headSeg zu hoch, die
    //     Braue zu tief), kiefer/kieferBreite/kieferTiefe = der Kiefer-Körper (er hing als Doppelkinn unter dem Kinn),
    //     kinnZurueck = das Kinn hinter die Unterlippe.
    //   rumpf: brustkorb/nacken = Höhen-Faktoren der Brustkorb-Ellipse und des oberen Rückens (beide reichten bis ans
    //     Kinn — jede Hülle über ihnen verschluckte den Hals).
    //   w21-leib-bau (DER LEIB IM KANON, Drillis & Contini 1966 nach Winter 2009 Abb. 4.1, `_kopfLage`): kopf.mass 0,75 → 0,70 —
    //     der Scheitel steht auf H, der Kopf misst 0,130 H (vorher 0,839 E über einem Kinn, das der Ofen auf der Höhe des Labors
    //     hielt: der Mensch maß 6,28 statt 6,07 E, 7,49 Köpfe). rumpf.brust = die Höhe der Brust-Ellipse (ihr Scheitel lag 0,18 E
    //     über der Drosselgrube, der Hals stand hinter einem Sims), pecTiefer = der Schlüsselbein-Teil des Brustmuskels unter das
    //     Schlüsselbein. hals = der Hals als EINE geneigte Röhre von der Hals-Wurzel (`unten` unter ihr) bis in den Kopf (`inKopf`
    //     über das Kinn), r (× der Hals-Dicke labMorph neckThick) und tief (Tiefe/Breite, Körper-Einheiten), `laenge` = die Röhre
    //     ragt über ihre Enden (das Ellipsoid des Zylinders spitzt dort zu), z = [unten, oben] (vorn +); scm = der Kopfnicker als
    //     Schrägzug [Brustbein-Kopf relativ zur Hals-Wurzel, Warzenfortsatz relativ zum Kinn, Radius] — vorher zwei senkrechte
    //     Stäbe vorn am Hals, die Kugel neckMain endete unter dem Kinn. schluesselbein = [innen] an der Drosselgrube, [aussen] an
    //     der Schulterhöhe (relativ zur Hals-Wurzel), Radius — der Zylinder des Labors stand fast senkrecht (seine Drehung kippte
    //     die Achse y nur 29°): zwei Pfähle neben dem Hals bis 0,13 E unter das Kinn. rumpf.trapTiefer = der Trapez-Muskel und der
    //     obere Rücken unter die Schulterhöhe, nacken 0,56 (vorher 0,6) — ihre Buckel stiegen über das Kinn und rissen die Naht in
    //     drei Ringe; schulter = der Deltamuskel je Seite (tiefer unter die Schulterhöhe, hoch × 1,1 seiner Höhe, breit und tief ×
    //     seiner Breite und Tiefe, aussen nach außen) — sein Scheitel stand 5,245 E hoch, über dem Kinn.
    //   leibHaut (w21-leib-bau, DIE HAUT IST EIN GUSS — foundry-core `__leibHaut`): die Haut des Leibs ist EIN glattes Feld über
    //     jedem Primitiv von Rumpf, Hals, Gliedern und Kopf (derselbe SDF-Guss wie das Gesicht, das Tier und die Menge). vox = das
    //     Raster des Leibs (Körper-Einheiten, 0,06 E ≈ 1,7 cm; die Grobstufe × 1,6), blend = die Verrundung der Nähte zwischen den
    //     Muskeln, dicke = die Haut über den Muskeln (Unterhaut: 0,06 E ≈ 1,7 cm — so weit lag die Punkt-Splat-Haut im Median über
    //     ihren Primitiven: Bein 0,068, Arm 0,066, Hals 0,054; das Gesicht IST die Haut und trägt keine), reich = wie weit ein
    //     Primitiv seine Ecken wiegt (× 1/0,3 seines Radius: die Gewichte der Haut). naht = wo das feine Raster des Gesichts (der
    //     Kopf-Raum, kopfHaut) das des Leibs trifft: eine Ebene `unterKinn` unter dem tiefsten Punkt des Kopfs (Kinn, Kiefer), um
    //     `neigung` rad nach hinten gekippt (vorn tiefer: der Ring folgt dem Unterkiefer zum Nacken, ein waagrechter schnitt den
    //     Nacken über der Haar-Kante); dort schließt ein Reißverschluss von Dreiecken die Ringe beider Raster zu EINER Haut —
    //     der Leib endet in genau einem Ring (`zylinder` × der Radius des Halses um seine Achse: was die Ebene außerhalb schneidet,
    //     die Arme der Spreiz-Pose, bleibt ganz); über `band` unter der Naht (die Hals-Wurzel) wächst das Gewicht des Kopfs bis 1
    //     an ihr (der Hals folgt dem Kopf), die Normalen am Ring trägt das Feld des Kopfs. Bis w21-leib-bau waren Kopf und Leib
    //     zwei Häute, die sich nie berührten (der Kopf schwebte: 31 von 36 Sektoren um den Hals ohne Berührung, die Fuge bis 9,5
    //     cm, kein Hals-Gewicht am Kopf); das Urteil `leibUrteil` (gate:mensch-anatomie LEIB).
    //   kopfHaut: Raster und Verrundung im Kopf-Raum (1 Einheit ≈ 0,21 m: 5,5 mm, 12 mm — das Budget koerper L0 hält),
    //     mundSpalt = halbe Breite der Mund-Linie als Anteil des Abstands der Lippen-Mitten · hoehleSaum = wie weit (in
    //     Halbachsen über ihrem Rand) die Haut um das Auge den Ton der Höhle trägt (A4: sie liegt unter der Haut) · brauSaum =
    //     [seitlich, Höhe] wie weit über ihre Haare hinaus die Haut den Ton der Braue trägt (mensch.K4) · brauBogen = der Bogen
    //     unter der Braue trägt keinen Ton der Höhle (die Haut zwischen Brauen-Haar und Lid-Falte, ~8 mm: auf 6 m ein Bildpunkt —
    //     vorher grenzte die dunkle Höhle an die helle Braue, und ihr Ring las im Bild die Braue) · verdeckung = was die
    //     Haut selbst verdeckt, empfängt weniger Licht (mensch.K4: die Falte unter der Nase, die Mund-Linie, der Winkel des Auges;
    //     das Feld der Haut entlang seines Gradienten und, um `oben` zur Hoch-Achse gekippt, unter dem, was über ihr hängt —
    //     der Brauen-Bogen über der Höhle, die Nase über der Oberlippe —, je in `stufen` Schritten von `schritt`, im Mittel der
    //     beiden Strahlen × `staerke` (2: jeder Strahl ganz), über `frei` der Ton genau; `kanal` = der Anteil der FALTE (der
    //     Gradient-Strahl) je Kanal R·G·B: die Haut streut das Licht unter ihrer Fläche in die Falte, Rot am weitesten (Jensen
    //     2001, Haut: mittlere freie Weglänge R 3,67 · G 1,37 · B 0,68 mm; Anteil = Weglänge G / Weglänge des Kanals, höchstens 1)
    //     — die Falte wird dunkel und rot, nie schwarz; der Überhang (der Strahl nach oben: die Nase über der Oberlippe) wirft
    //     Schatten und nimmt alle Kanäle ganz. Bis w4-mensch-gesicht nahm die Falte alle Kanäle ganz: die Mund-Linie trug Ecken
    //     (0, 0, 0), im Bild las nur der Saum des Lichts, grau — Rot und Dunkel des Munds tauschten gegeneinander) · handHaut: Raster und
    //     Verrundung im Körper-Raum (1 Einheit ≈ 0,29 m: 3,5 mm, 6 mm; die Welt bewegt die Finger nicht).
    //   K57 (KOPF_SOLL): kopf.mass 0,72 → 0,75 (8,05 → 7,6 Köpfe) · auge.abstand 0,7 → 0,8 (die Lücke eine Augenbreite) ·
    //     auge.zurueck = der Augapfel tiefer in der Höhle (er stand 0,056 kH vor der Haut) · schaedel.hoch = die Kalotte
    //     höher (das Hirn über den Augen) · gesicht.unten = das Untergesicht zur Nase gestaucht (Lippe, Kiefer, Kinn; der
    //     Kopf sinkt, das Kinn bleibt am Hals) — die Augen auf halber Kopfhöhe · ohr: mass/tiefer = das Ohr zwischen
    //     Augen- und Nasenlinie (es reichte 0,15 kH über die Augen) · augeRaster = das Raster der Augäpfel, Iris, Pupillen
    //     und Höhlen im Ofen (12×8: ein Auge von 24 mm trägt keine 520 Dreiecke).
    //   A4 (KOPF_SOLL augeFrei im BILD): auge.lid = [oben, unten], die Lid-Ränder an den Limbus (Augen-Raum, Augapfel 0,12) —
    //     das Oberlid (Mitte 0,07, Halbachse 0,049) schnitt die Iris (0,07) bei 0,048, das Unterlid bei −0,055: drei von
    //     neun Iris-Ringen oben, zwei unten lagen hinter den Lid-Wülsten (das Bild 0,48 frei); +0,045 / −0,035 legt die
    //     Ränder auf 0,085 / −0,085: die Iris samt Blick-Zittern ±0,002 UND der Kante eines Pixels (TAAU-Zittern, die Iris
    //     ~10 px im Gesicht-Bild; +0,035 / −0,025 maß 0,73–1,0 je Schuss) frei in der Lidspalte, das Lid deckt den Augapfel
    //     darüber und darunter. gesicht.mundTiefer = der Mund (Lippen, Philtrum, Mundwinkel, Oberkiefer-Mitte) tiefer:
    //     die Nasen-Basis saß AUF der Oberlippe (sn–sto 0,19 von sn–gn statt 0,31–0,33, Farkas) — die Oberlippe lag im
    //     Schatten unter der Nase und hinter ihr (im Bild Δa* 0,7).
    //   mensch.K4 (das Gesicht auf 6 m): auge.iris = die Iris kreisförmig (hoch 1 → 0,8 wie ihre Breite: sie stand als Oval 14,4 mm
    //     hoch über 11,6 mm breit, Farkas 11,7 mm rund) und um `vor` nach vorn, bis ihr freier Teil 11,4 mm misst (die Pupille
    //     folgt ihr) — auf 6 m reichte die Iris ±0,86 px um ihre Mitte bis an die Zeilen der Lider · auge.schatten = das Lid
    //     beschattet den Augapfel: Sklera und Iris tragen unter dem Lid `tief` ihres Tons, im Saum (Augen-Raum, über dem
    //     Lid-Rand) weich auf ihren Ton (die Verschattung durch Lid und Wimpern, die das Licht nie zeichnet: die Kaskade wirft im
    //     Gesicht keinen Millimeter) · auge.lidRand = der Rand des Lids am Augapfel (die Wimpern-Linie, die Falte zwischen Lid
    //     und Auge): die Haut des Lids trägt `tief` ihres Tons, wo sie den Augapfel berührt, im Saum weich auf ihn — vorher lag
    //     das Unterlid als heller Sims in der Mittags-Sonne (L* 30 über der Wange im Schatten, 8–13) und nahm der Iris ihre
    //     untere Zeile; der Saum 3 → 6 mm, `tief` 0,35 → 0,25 (die Haut des Unterlids unter der Wölbung des Augapfels: auf 6 m
    //     las sein Sims noch L* 25 und gewann den Bildpunkt unter der Iris) · auge.zurueck 0,04 → 0,03 (der Augapfel 2 mm vor,
    //     augenVorstand 0,024 → 0,032: auf 6 m deckte die Haut des inneren Augenwinkels zwei der sechs Bildpunkte der Iris,
    //     augeFrei 0,76) · kopfHaut.mundSpalt 0,35 → 0,45 (die Mund-Linie trägt auf 6 m einen Bildpunkt).
    //   w12-gesicht (das Gesicht im Bild misst unter seinem Licht, auf 6 m sind Lippe und Höhle unaufgelöst — kein Zug des Gesichts
    //     wird mehr für den Bildpunkt auf 6 m verzerrt): auge.lid [0,045, 0,035] → [0,03, 0,025] — das Oberlid liegt am oberen
    //     Rand der Iris, das Unterlid an ihrem unteren (vorher Sklera rings um die Iris: der Starr-Blick, Lid-Spalt 0,128 über
    //     einer Iris von 0,112); augeFrei am Strahl der Kamera bleibt 1 (0,7 m und die Kamera des Spiels, Radeon, 4 von 4 Schüssen;
    //     [0,02, 0,02] las an der Kamera des Spiels 1 von 7 Schüssen 0,754) · kopfHaut.mundSpalt 0,45 → 0,15: die Lippen sind
    //     geschlossen, die Mund-Linie ein Strich — die Spalte trug 45 % der Lippen-Ecken als dunkle Innenlippe, das Bild zeigte
    //     ein Loch (0,7 m lippeA 1,5–2,5 unter dem Licht des Gesichts).
    // prettier-ignore
    var MENSCH_GESTALT = Object.freeze({
        hand: Object.freeze({ mass: 0.67, breite: 0.8 }),
        unterarm: Object.freeze({ breite: 0.66, tiefe: 0.8, bauch: 0.42 }),
        handgelenk: Object.freeze({ breite: 0.72, tiefe: 0.52 }),
        fuss: Object.freeze({ laenge: 0.9 }),
        kopf: Object.freeze({ mass: 0.7, breite: 0.86 }),
        auge: Object.freeze({ mass: 0.5, abstand: 0.8, pupille: 0.55, hoehle: 1.15, zurueck: 0.03, lid: Object.freeze([0.03, 0.025]),
            iris: Object.freeze({ hoch: 0.8, vor: 0.09 }), schatten: Object.freeze({ saum: 0.015, tief: 0.15 }),
            lidRand: Object.freeze({ saum: 0.06, tief: 0.25 }) }),
        schaedel: Object.freeze({ hoch: 0.08 }),
        ohr: Object.freeze({ mass: 0.755, tiefer: 0.082 }),
        augeRaster: Object.freeze({ w: 12, h: 8 }),
        gesicht: Object.freeze({ lippe: 0.55, lippeZurueck: 0.03, oberkiefer: 0.78, wange: 0.82, naseTiefer: 0.05,
            brauHoch: 0.028, kiefer: 0.72, kieferBreite: 0.78, kieferTiefe: 0.85, kinnZurueck: 0.04, unten: 0.84,
            mundTiefer: 0.035 }),
        rumpf: Object.freeze({ brustkorb: 0.52, nacken: 0.56, brust: 0.82, pecTiefer: 0.25, trapTiefer: 0.16, tiefe: 0.65, breite: 0.65, taille: 1.35, flanke: 0.6 }),
        schulter: Object.freeze({ tiefer: 0.35, hoch: 0.9, breit: 0.7, tief: 1, aussen: 0.03, gelenk: 0.82 }),
        arm: Object.freeze({ dicke: 0.85 }),
        becken: Object.freeze({ breit: 0.72, hoch: 0.8 }),
        bein: Object.freeze({ abstand: 0.55, dicke: 0.9 }),
        hals: Object.freeze({ r: 0.13, tief: 0.92, unten: 0.08, inKopf: 0.12, laenge: 1.3, z: Object.freeze([-0.04, -0.01]),
            scm: Object.freeze([Object.freeze([0.04, -0.01, 0.12]), Object.freeze([0.17, 0.17, -0.05]), 0.035]) }),
        schluesselbein: Object.freeze({ innen: Object.freeze([0.07, -0.03, 0.17]), aussen: Object.freeze([0.68, -0.03, -0.03]), r: 0.035 }),
        leibHaut: Object.freeze({ vox: 0.06, blend: 0.06, dicke: 0.06, reich: 0.6, naht: Object.freeze({ unterKinn: 0.01, neigung: 0.25, band: 0.3, zylinder: 1.4 }) }),
        kopfHaut: Object.freeze({ vox: 0.026, blend: 0.055, mundSpalt: 0.15, hoehleSaum: 0.8, brauSaum: Object.freeze([0.05, 0.008]),
            brauBogen: 0.04, verdeckung: Object.freeze({ schritt: 0.05, stufen: 4, staerke: 2, frei: 0.97, oben: 1,
                kanal: Object.freeze([0.373, 1, 1]) }) }),
        handHaut: Object.freeze({ vox: 0.012, blend: 0.02 }),
    });
    // DAS FETT-DEPOT (studios.K1, der Regler mass „Masse (Fett)" — die Fülle des Leibs wie der Körper-Regler eines Character-
    // Creators): labMorph (eingefroren) wächst die Muskel-Primitive UNTER der Haut; die Hülle der Haut glättet ihr Wachsen weg
    // (am Bild 0,68 % für mass 0 → 1, die Hose schrumpfte sogar). Die Fülle ist das Unterhaut-Fett ÜBER ihnen: je Gelenk der Haut
    // seine Dicke in Körper-Einheiten (1 E ≈ 0,3 m) je Einheit Fett (totalFat aus labMorph) über dem Mittel der START_PARAMS —
    // Rumpf und Becken tragen das Depot, Oberschenkel und Oberarm weniger, Unterarm und Wade wenig, Kopf, Hand und Fuß keins;
    // `bauch` hebt die Vorderseite von Rumpf und Becken (das Bauch-Depot: × 1 + bauch · Normale vorn). Bei mass 1 trägt der
    // Bauch ~6 cm, die Flanke ~3,5 cm, der Oberschenkel ~3 cm; mass 0 nimmt ~3 cm vom Bauch. Der Ofen schiebt jede Ecke jeder
    // Hülle um Σ Gewicht × Dicke entlang ihrer Normale (foundry-core `__fettDepot`); das Mittel trägt kein Depot (Byte für Byte).
    // prettier-ignore
    var MENSCH_FETT = Object.freeze({
        gelenk: Object.freeze({ mensch: 0.2, torso: 0.18, hip1: 0.16, "hip-1": 0.16, arm1: 0.1, "arm-1": 0.1, elbow1: 0.05,
            "elbow-1": 0.05, knee1: 0.07, "knee-1": 0.07 }),
        bauch: 0.8,
        vorn: Object.freeze(["mensch", "torso"]),
    });
    // Das Depot eines Menschen: d = totalFat(dials) − totalFat(START_PARAMS) und die Tafel; null, wo d = 0 (das Mittel).
    function fettDepot(dials) {
        var d = labMorph(Object.assign({}, START_PARAMS, dials || {})).totalFat - labMorph(START_PARAMS).totalFat;
        return d ? { d: d, gelenk: MENSCH_FETT.gelenk, bauch: MENSCH_FETT.bauch, vorn: MENSCH_FETT.vorn } : null;
    }
    // DAS SOLL in Zahlen (gate:mensch-anatomie, normiert auf die Körperhöhe Hk; Bänder um den erwachsenen Mann):
    // handL = Hand-Länge (Handgelenk bis Fingerspitze, 0,108 Hk) · handB = Mittelhand-Breite ohne Daumen (0,047) ·
    // handgelenk = Breite am Handgelenk (0,033) · unterarm = Unterarm-Breite / Oberarm-Breite (0,8–1,0) · kopfH = Kinn bis
    // Scheitel (0,13) · kopfB = Kopf-Breite ohne Ohren (0,086) · augenAbstand = Pupillen-Abstand (0,035) · augapfel
    // (0,0135) · iris (0,0066) · mund = Mund-Breite (0,028) · fuss = Fuß, Ferse bis Zeh (0,15).
    // DER KANON DES LEIBS (w21-leib-bau): die Höhen der Gelenke über der Sohle — Drillis & Contini 1966, Body Segment Parameters
    // (New York University, Technical Report 1166.03), nach Winter, Biomechanics and Motor Control of Human Movement, 4. Aufl. 2009,
    // Abb. 4.1: Kopf 0,130 H (kopfH: 7,5–8 Köpfe, der Kanon der Zeichner; das Kinn steht damit auf 0,870 H), schulter 0,818 H,
    // huefte (Trochanter) 0,530 H, knie 0,285 H, je ± 0,012 H; hals = Kinn − Schulter (0,052 H). labProportionen baut den Leib aus
    // denselben Zahlen (H = 6); bis w21-leib-bau maß das Gesetz 7,49 Köpfe (kopfH 0,1335), Schulter 0,792, Hüfte 0,517, Hals 0,074
    // (der Scheitel stand 0,21 E über H). Offen außerhalb dieses Schnitts: die Oberschenkel tragen die Hüfte (Hüftbreite 0,248 H
    // gegen 0,191 H, Taille/Hüfte 0,81 gegen den Mann 0,85–0,95, WHO 2008) — die Beine.
    // prettier-ignore
    var MENSCH_SOLL = Object.freeze({
        handL: [0.1, 0.116], handB: [0.042, 0.053], handgelenk: [0.028, 0.04], unterarm: [0.78, 1.0],
        kopfH: [0.125, 0.1333], kopfB: [0.078, 0.096], augenAbstand: [0.031, 0.039], augapfel: [0.012, 0.016],
        iris: [0.0058, 0.0076], mund: [0.025, 0.033], fuss: [0.135, 0.165],
        schulter: [0.806, 0.83], huefte: [0.518, 0.542], knie: [0.273, 0.297], hals: [0.04, 0.064],
    });
    // DAS SOLL DES KOPFES (K57, gate:mensch-anatomie KOPF): die Verhältnisse des Gesichts, nicht nur seine Größen —
    // gemessen am GEBACKENEN Kopf (Ofen L0: die Haut, die Augen, das Haar, wie die Welt sie zeichnet), normiert auf die
    // Kopfhöhe kH (Kinn bis Scheitel, ohne Haar). Anthropometrie des erwachsenen Mannes (Farkas-Normen: v–gn 232 mm,
    // en–en 33 mm, ex–en 30 mm, ch–ch 54 mm, IPD 63 mm, sa–sba 62 mm) und Farbmetrik der Lippe gegen die Wange (CIELAB):
    //   (kH / Körperhöhe ist MENSCH_SOLL kopfH, der Kanon — bis w21-leib-bau stand er hier ein zweites Mal als kopfAnteil)
    //   augenLinie = Augenmitte über dem Kinn / kH (die Augen auf halber
    //   Kopfhöhe) · augenSpalt = Lücke zwischen den Augen / Augenbreite (der Abstand ist eine Augenbreite; die Breite
    //   ist die sichtbare Spalte: Augapfel samt Lidern) · mundZuPupille = Mundbreite / Pupillen-Abstand (die
    //   Mundwinkel unter den Pupillen) · ohrOben / ohrUnten = Ohr-Oberkante über der Augenlinie und Ohr-Unterkante über
    //   der Nasen-Basis, je / kH (das Ohr zwischen Augen- und Nasenlinie) · ohrLaenge = Ohr-Länge / kH ·
    //   augenVorstand = die Hornhaut vor dem Median der Haut ringsum / kH (Hertel: der seitliche Orbita-Rand 16–18 mm
    //   hinter der Hornhaut, die Braue ~5–10 mm davor, die Wange dahinter — der Median liegt 2–8 mm hinter dem Scheitel;
    //   0,056 = 13 mm war das aufgesetzte Auge, ≤ 0 das begrabene) · augeFrei = Anteil der Iris-Vorderseite, den keine
    //   Kopf-Haut verdeckt (Strahl nach vorn; die Lider sind das Rig, nicht der Guss) ·
    //   lippeL / lippeA = ΔL* / Δa* der Lippe gegen die Haut (dunkler und röter, nie ein roter Fleck: ΔL* −8…−12,
    //   Δa* +8…+13) · hoehleL / hoehleA = ΔL* / Δa* der Augenhöhle gegen die Haut (ein Schatten der Haut, kein
    //   brauner Ring) · hautAlbedo = die lineare Luma jedes Hauttons der Palette (Hautreflexion 550 nm, dunkel bis hell)
    //   · haarDeckung = Anteil der Kopf-Haut über der Haarlinie (0,80 kH über dem Kinn, das Trichion), die das Haar
    //   als VOLUMEN trägt (Stil mittel; die Strähnen sind sein Rand, nie der Fleck auf der Glatze) · kopfDreiecke =
    //   der Kopf-Anteil der L0-Zeile 40 000 (Haut, Höhlen, Augen, Lider, Haar).
    //   mensch.K4 (das Gesicht auf 6 m): brauKontrast = |ΔL*| des Brauen-Tons gegen die Haut (die Braue ist Fläche, nie fünf
    //   Striche unter einem Bildpunkt). Am Guss urteilt `kopfGussUrteil` augenVorstand, augeFrei, haarDeckung, kopfDreiecke und
    //   mundFalte = der Anteil der Ecken der Kopf-Haut neben dem Mund (seitlich über drei Viertel der Lippen-Breite von ihrer Mitte,
    //   von der Oberlippe bis anderthalb Lippen-Höhen unter die Unterlippe, vorn), deren Ton (Farbe × Verdeckung) unter 40 % des
    //   hellen Haut-Tons fällt — die harte Falte von den Mundwinkeln zum Kiefer, die Unterlippe wie ein abgesetzter Puppen-Kiefer
    //   (Nacharbeit w21-leib-bau: der Hals-Deckel lag im Kopf auf Höhe der Lippen; 0,110 → 0). haarRahmen = der Anteil der Bänder
    //   des Haars am Guss L0, deren Ecken der EINE Leser `haarAchse` als Strähne liest (w25-haar-albedo: Welt und Labor lesen Achse
    //   und Länge aus ihm — ein Band ohne Rahmen glänzte an seiner Spitze nie).
    // prettier-ignore
    var KOPF_SOLL = Object.freeze({
        augenLinie: [0.45, 0.53], augenSpalt: [0.9, 1.25], mundZuPupille: [0.78, 1.0],
        ohrOben: [-0.02, 0.1], ohrUnten: [-0.06, 0.03], ohrLaenge: [0.23, 0.3], augenVorstand: [0.01, 0.035], augeFrei: [0.9, 1.0],
        lippeL: [-14, -4], lippeA: [4, 14], hoehleL: [-12, 0], hoehleA: [-2, 6], hautAlbedo: [0.05, 0.62],
        haarDeckung: [0.9, 1.0], kopfDreiecke: [0, 12000], haarLinie: 0.8, mundFalte: [0, 0.02],
        brauKontrast: [8, 80], haarRahmen: [1, 1], haarStachel: [0, 0.01],
    });
    // DIE EINE HAUT IM GUSS (w21-leib-bau, gate:mensch-anatomie LEIB, gemessen von `leibUrteil`; foundry-core `__leibHaut`, Ofen L0): nahtRing = Anteil der
    // Rand-Ecken der Kopf-Haut, die auf der Haut des Leibs liegen (der gemeinsame Ring) · nahtSpalt / nahtPose = der weiteste Abstand
    // einer von ihnen zur Haut des Leibs (E) in der Ruhe und unter dem Kopf in Pose (nicken 0,18, drehen 0,3, neigen 0,05 rad — der
    // Hals folgt ihm) · nahtNormale = der größte Sprung der Normalen über den Ring (Grad) · saumUmlauf = je Saum eines Stoffs aus
    // der Haut die Summe seiner Abbiegungen in Umläufen (ein glatter Saum ~1–2; die Treppe der Dreiecke 5–8) · bauchKnick = der
    // größte Knick zwischen zwei Dreiecken der Haut des sichtbaren Bauchs (Grad; vorn, zwischen den Flanken, nackt) ·
    // bauchSplitter = Anteil der Dreiecke dort mit einem Winkel unter 10°. Bis w21-leib-bau: zwei Häute ohne Ring (der Kopf schwebte,
    // die Fuge bis 9,5 cm, kein Hals-Gewicht am Kopf), Bund und Hemd-Saum 5,8–7,8 Umläufe, Knick im Bauch des Hemds 54°.
    // hautMehrfach / hautUeberschlag (Nacharbeit w21-leib-bau, gate:kamera-leib:echt K6): an Kopf- und Leib-Haut des bekleideten Leibs
    // die Kanten mit mehr als zwei Dreiecken und die Nachbarn, deren Normalen mehr als 100° auseinander liegen (ein Überschlag: seine
    // Rückseite verwirft der Stoff, die Kamera sieht durch die Haut den Grund). Bis zur Nacharbeit trug die Dicke des Halses im Kopf
    // 5 und 7 (bis 151°, hinter dem Ohr und unter dem Mund), main 0.
    // prettier-ignore
    var LEIB_SOLL = Object.freeze({
        nahtRing: [1, 1], nahtSpalt: [0, 1e-5], nahtPose: [0, 1e-5], nahtNormale: [0, 1], saumUmlauf: [0, 3], bauchKnick: [0, 25],
        bauchSplitter: [0, 0.05], hautMehrfach: [0, 0], hautUeberschlag: [0, 0],
        // DER KANON (w28-leib-kanon, gemessen von `leibKanon` am Ofen L0, nackt): das Mittel des erwachsenen Mannes (gender 1) und der
        // Frau (gender 0) an den Start-Dials, je Maß als Anteil der Körperhöhe H, Band ± toleranz. QUELLE UNGEPRÜFT: vorläufige
        // Richtwerte nach der Anthropometrie-Reihe ANSUR II (US Army 2012, Mittel Mann / Frau), aus dem Gedächtnis des Koordinators —
        // die Bestätigung an der Quelle steht beim Schöpfer. Die Staturen (schlank, kräftig, beleibt) streuen aus dem Statur-Gesetz
        // UM dieses Mittel (labMorph), sie ersetzen es nicht.
        kanon: Object.freeze({
            toleranz: 0.08,
            mann: Object.freeze({ breiteDeltoid: 0.29, breiteAkromion: 0.237, brustT: 0.145, brustB: 0.165, tailleB: 0.186, huefteB: 0.197, schritt: 0.481, schulterHoehe: 0.822 }), // prettier-ignore
            frau: Object.freeze({ breiteDeltoid: 0.276, breiteAkromion: 0.224, brustT: 0.145, brustB: 0.172, tailleB: 0.181, huefteB: 0.211, schritt: 0.474, schulterHoehe: 0.818 }), // prettier-ignore
        }),
    });

    // DIE TÖNE DES GESICHTS (K57, KOPF_SOLL lippe/hoehle): Lippe und Augenhöhle sind die HAUT, in CIELAB verschoben
    // (ΔL*, Δa*, Δb*) — vorher zwei feste Klassen-Farben (0xaa5544 der rote Mund, 0x5a3320 der braune Ring um das Auge),
    // gleich für jeden Hautton. Der Ofen liest kopfToene(Haut-Hex) → { lips, socket } (Hex, sRGB). A4: die Lippe −11/+13 (vorher
    // −9/+9 — im Bild der Mahagoni-Haut im Schatten trägt das Licht rund ein Viertel des Albedo-Δa* (+10 → +0,7 bei
    // freigelegter Oberlippe +2,5, +13 → +3,6, ohne den Saum-Überschuss +5,2); im Band des Albedos [4; 14] bleibt sie).
    // mensch.K4: die Braue ist das Haar über der Haut (`brauTon`, Deckung linear) · die Höhle −6 → −8 (im Bild auf 6 m trug der
    // Ring um das Auge den Schimmer der Sklera: hoehleL −0,44 headless, +0,28 GTX gegen ≤ 0), Δa* +2 → +5 (die dünne Haut um das
    // Auge ist röter als die Wange; auf 6 m mischten Sklera und Iris ihr Rot weg, hoehleA −2,3 gegen ≥ −2) · die Mund-Linie ist
    // die dunkle ROTE Innenlippe (`mundLinie`, je Kanal ein Anteil der Lippe; vorher [0,25, 0,2, 0,2] — dunkel ohne Rot; 0,4 →
    // 0,6 im Rot: im Schatten der Nase trug der Mund auf 6 m nur Δa* 1,8 über der Wange, Soll ≥ 4; 0,75 hob Δa* auf 3,7 und
    // ΔL* auf −3,3 — Rot und Dunkel des Munds tauschen auf 6 m gegeneinander) · die Lippe
    // −11 → −13 (auf 6 m mischt jeder Bildpunkt des Munds die Wange hinein: −11 las −2,7 gegen die Wange, Soll ≤ −4).
    // w12-gesicht: die Lippe −13 → −7 (ΔL*): die dunkle Lippe der dunklen Haut trägt im Schatten weniger Licht als der neutrale
    // Glanz der Haut über ihr — ihr Rot ging unter (0,7 m unter dem Licht des Gesichts lippeA 3,45 bei −13 · 3,7–5,7 bei −9 ·
    // 6,5–7,2 bei −7, lippeL −6,4 bis −7,2; Radeon, Mahagoni) — dunkler und röter bleibt sie (Farkas ΔL* −8…−12 liegt im Bild)
    var KOPF_TON = Object.freeze({
        lippe: Object.freeze([-7, 13, 2]),
        hoehle: Object.freeze([-8, 5, 1]),
        braue: Object.freeze({ deckung: 0.75 }),
        mundLinie: Object.freeze([0.6, 0.2, 0.2]),
    });
    function _hexLab(hx) {
        return _linLab(_hexLin(hx));
    }
    // CIELAB (D65) eines linearen Tripels — die EINE Lab des Gesetzes (die Töne des Gesichts, ihr Maß im Bild)
    function _linLab(c) {
        var X = (0.4124 * c[0] + 0.3576 * c[1] + 0.1805 * c[2]) / 0.95047,
            Y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2],
            Z = (0.0193 * c[0] + 0.1192 * c[1] + 0.9505 * c[2]) / 1.08883;
        var f = function (t) {
            return t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116;
        };
        return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
    }
    function _labHex(L) {
        var fy = (L[0] + 16) / 116,
            fx = fy + L[1] / 500,
            fz = fy - L[2] / 200;
        var g = function (t) {
            return t * t * t > 216 / 24389 ? t * t * t : (116 * t - 16) / (24389 / 27);
        };
        var X = g(fx) * 0.95047,
            Y = g(fy),
            Z = g(fz) * 1.08883;
        var lin = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z];
        var h = 0;
        for (var i = 0; i < 3; i++) {
            var v = Math.min(1, Math.max(0, lin[i]));
            v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
            h = h * 256 + Math.round(v * 255);
        }
        return h;
    }
    function kopfToene(hautHex) {
        var h = _hexLab(hautHex);
        var zu = function (d) {
            return _labHex([h[0] + d[0], h[1] + d[1], h[2] + d[2]]);
        };
        return { lips: zu(KOPF_TON.lippe), socket: zu(KOPF_TON.hoehle) };
    }
    // DAS HAAR ALS VOLUMEN (K57, KOPF_SOLL haarDeckung): je Stil eine Kappe über der Kalotte, die der Ofen MIT der
    // Kopf-Haut gießt — über der Haarlinie trägt die Haut den Haar-Ton, die Strähnen (haarStreu) sind der Rand; vorher
    // standen 2 030 Strähnen als Fleck auf der kahlen Kalotte. [dicke, hoch, zurueck] in Kopf-Einheiten: die Kappe ist
    // das Schädel-Ellipsoid, um dicke dicker, um hoch gehoben und um zurueck nach hinten gesetzt (die Stirn bleibt frei).
    // prettier-ignore
    var HAAR_KAPPE = Object.freeze({
        buzz: [0.02, 0.07, 0.05], kurz: [0.05, 0.065, 0.06], mittel: [0.08, 0.06, 0.07], lang: [0.09, 0.06, 0.08],
        locken: [0.14, 0.05, 0.07], afro: [0.24, 0.04, 0.05], zopf: [0.05, 0.065, 0.06], dutt: [0.05, 0.065, 0.06],
        undercut: [0.07, 0.11, 0.04],
    });
    // DAS HAAR-VOLUMEN (studios.K1, der Regler hairVol): das Volumen ist die Dicke der Kappe über dem Schädel — je Einheit über
    // dem Mittel 1 trägt sie HAAR_VOLUMEN Schädel-Radien mehr (das flach gelegte Haar 0,5 liegt fast am Schädel, das volle 2
    // steht ~2,5 cm über dem Mittel), nie unter dem Schädel. Bei 1 ist die Kappe die des Stils, Byte für Byte; die Strähnen
    // (haarStreu) wurzeln auf DERSELBEN Kappe. Bis studios.K1 trug hairVol nur die Zahl der Strähnen (das Bild 0,45 %).
    var HAAR_VOLUMEN = 0.2;
    // DER LEIB-RAUM (w25-leib-raum, rein additiv, Steuer-Passagier `__kappe`): die Kappe eines Stils ist ihr Tripel [Dicke, Höhe,
    // Front] — der Ofen fragt die Kappe an einem Punkt ZWISCHEN den Stilen (die Achsen des Leib-Raums); ohne `__kappe` Byte für Byte
    // die des Stils.
    function haarKappe(d) {
        var t = (d && Array.isArray(d.__kappe) && d.__kappe.length === 3 && d.__kappe) || HAAR_KAPPE[(d && d.hairStyle) || "mittel"];
        if (!t) return []; // glatze
        var P = labProportionen(),
            r = P.skullBaseR * 1.03,
            SH = MENSCH_GESTALT.schaedel.hoch;
        var sy = 1.12 + SH / (2 * r);
        var voll = Math.max(0.3, d && typeof d.hairVol === "number" ? d.hairVol : 1.0);
        var dk = Math.max(0, t[0] + (voll - 1) * HAAR_VOLUMEN);
        var ansatz = gesichtWert(d, "haaransatz") || 0; // mensch.K4: der Haar-Ansatz aus dem Genom (GESICHT_GENOM)
        // DIE KAPPE STEHT NIE VOR DEM SCHÄDEL (mensch.K4, die Menge trägt jeden Stil): ihre Front r·(1 + dicke) − zurueck liegt
        // höchstens auf seiner Front r — afro (dicke 0,24, zurueck 0,05) stand 0,046 vor ihr, die Kopf-Haut wuchs über die Augen
        // (augeFrei 0,40); jeder andere Stil liegt dahinter und bleibt byte-gleich
        var z = Math.max(t[2], dk * r); // die Front aus der Dicke samt Fülle (studios.K1 hairVol)
        return [{ c: [0, P.skullCY + SH / 2 + t[1] + ansatz, -z], r: r, sc: [1 + dk, sy + dk, 1 + dk] }];
    }

    // DER LEIB-RAUM (w26-leib-raum, REFERENZ-ATLAS §4 — SMPL, Loper et al. 2015: ein Körper ist ein Punkt in EINEM Raum, rein
    // additiv): die Achsen, auf denen sich ein Mensch der Menge vom anderen unterscheidet, je Achse ihre Knoten. Der Ofen gießt je
    // Mengen-Stufe EINE Vorlage am Mittel-Knoten jeder Achse (`leibRaumVorlage`) und je Knoten den Weg jeder ihrer Ecken (die
    // Formziel-Tafel, foundry-core `__leibRaumTafel`); eine Person ist ihre Lage auf den Achsen (`leibRaumPunkt`: je Achse der Knoten-
    // Index samt Bruch) — Vorlage + je Achse der Weg zwischen ihren zwei Knoten. Die Kappe des Haars ist ihr Tripel (HAAR_KAPPE:
    // Dicke, Höhe, Front) als drei Achsen über die Spanne der Stile; die Höhe trägt die Skala des Leibs (charScale), die Farben die
    // Palette (`menschPalette`). Die Spannen sind die des Genoms (Alter, Fülle des Haars: der Roller der Welt liest sie hier).
    var LEIB_RAUM = (function () {
        var fuenf = function (a, b) {
            return Object.freeze([a, a + (b - a) / 4, a + (b - a) / 2, a + (3 * (b - a)) / 4, b]);
        };
        var stile = Object.keys(HAAR_KAPPE).map(function (k) {
            return HAAR_KAPPE[k];
        });
        var kappe = function (j) {
            var v = stile.map(function (t) {
                return t[j];
            });
            return fuenf(Math.min.apply(null, v), Math.max.apply(null, v));
        };
        return Object.freeze({
            achsen: Object.freeze([
                Object.freeze({ achse: "gender", knoten: fuenf(0, 1) }),
                Object.freeze({ achse: "mass", knoten: fuenf(0, 1) }),
                Object.freeze({ achse: "tone", knoten: fuenf(0, 1) }),
                Object.freeze({ achse: "age", knoten: fuenf(0.05, 0.5) }),
                Object.freeze({ achse: "hairVol", knoten: Object.freeze([0.8, 1.05, 1.3]) }),
                Object.freeze({ achse: "haaransatz", knoten: Object.freeze([0, 0.5, 1]) }),
                Object.freeze({ achse: "__kappe0", knoten: kappe(0) }),
                Object.freeze({ achse: "__kappe1", knoten: kappe(1) }),
                Object.freeze({ achse: "__kappe2", knoten: kappe(2) }),
            ]),
        });
    })();
    // der Wert einer Achse an den Dials d (die Kappe: das Tripel `__kappe` oder das des Stils)
    function leibRaumWert(d, achse) {
        var kj = /^__kappe([012])$/.exec(achse);
        if (kj) {
            var t = (d && Array.isArray(d.__kappe) && d.__kappe) || HAAR_KAPPE[(d && d.hairStyle) || "mittel"];
            if (!t) throw new Error("LEIB-RAUM: der Stil " + (d && d.hairStyle) + " trägt keine Kappe (fail-closed)");
            return t[+kj[1]];
        }
        var v = d ? d[achse] : undefined;
        if (typeof v !== "number" || !isFinite(v)) v = START_PARAMS[achse];
        if (typeof v !== "number" || !isFinite(v)) throw new Error("LEIB-RAUM: die Achse " + achse + " ohne Wert (fail-closed)");
        return v;
    }
    // Die Dials der Vorlage: d, jede Achse auf ihrem Mittel-Knoten (die Kappe als Tripel `__kappe`)
    function leibRaumVorlage(d) {
        var o = {},
            k;
        for (k in d) o[k] = d[k];
        var kap = [0, 0, 0];
        LEIB_RAUM.achsen.forEach(function (a) {
            var m = a.knoten[(a.knoten.length - 1) / 2];
            var kj = /^__kappe([012])$/.exec(a.achse);
            if (kj) kap[+kj[1]] = m;
            else o[a.achse] = m;
        });
        o.__kappe = kap;
        return o;
    }
    // Der Punkt einer Person im Leib-Raum: je Achse (Reihe von LEIB_RAUM.achsen) ihr Knoten-Index samt Bruch, in [0, Knoten − 1]
    function leibRaumPunkt(d) {
        return LEIB_RAUM.achsen.map(function (a) {
            var K = a.knoten,
                v = leibRaumWert(d, a.achse);
            if (v <= K[0]) return 0;
            for (var j = 0; j < K.length - 1; j++) if (v <= K[j + 1]) return j + (v - K[j]) / (K[j + 1] - K[j]);
            return K.length - 1;
        });
    }

    // DIE TÖNE DES MENSCHEN (mensch.K4, rein additiv) — DIE FARBE FOLGT DEM SAMEN. Jede Ecke eines gegossenen Menschen trägt
    // ihren TON (`aTon`, der Ofen stempelt ihn je Ecke): den Eintrag der Palette, aus dem ihre Farbe kommt — die Haut und ihre
    // Töne (Lippe, Höhle, Braue), das Haar, jede Kleid-Zone in der Reihe von kleidZonen, das Feste (Augapfel, Iris, Pupille).
    // DIE PALETTE eines Menschen (`menschPalette`, linear, 3 Werte je Ton) ist die EINE Quelle seiner Farben: der Ofen gießt
    // mit ihr, und wer eine Gestalt in den Farben eines anderen Samens zeichnet (die Bewohner einer Gestalt: Leib, Satz, Feld),
    // skaliert jede Ecke mit dem Verhältnis seiner Palette zu der der Gestalt — der Mund-Spalt und der Wurzel-Verlauf der
    // Strähnen sind Vielfache ihres Tons und bleiben es. Bis mensch.K4 trug jeder Bewohner die Farben seiner Gestalt: vier
    // Typen, vier Kleider, 17 von 1 225 Paaren unter 1 px.
    var MENSCH_TON = Object.freeze(["haut", "lippe", "hoehle", "braue", "haar", "kleid0", "kleid1", "kleid2", "fest"]);
    // der Ton einer Stoff-Klasse des Baums: skin · joint · shadow · dark · haut sind Haut, lips · socket ihre Töne, braue die Braue,
    // hair und die Haar-Kappe das Haar, die Kleid-Zone (`zone`, ihr Platz in kleidZonen) ihr Eintrag; das Auge (eye · iris ·
    // pupil) ist fest
    function menschTon(klasse, zone) {
        if (typeof zone === "number" && zone >= 0) return Math.min(2, zone) + 5;
        if (klasse === "lips") return 1;
        if (klasse === "socket") return 2;
        if (klasse === "braue") return 3;
        if (klasse === "hair" || klasse === "haarKappe") return 4;
        if (klasse === "eye" || klasse === "iris" || klasse === "pupil" || klasse === "cornea") return 8;
        return 0;
    }
    // DIE BRAUE (mensch.K4 Staffel 1, das Gesicht auf 6 m): die Haut unter den Brauen-Haaren trägt den Ton der Braue — von fern
    // ist die Braue das Mittel ihrer Haare über der Haut (Deckung `KOPF_TON.braue`, linear), nie fünf Striche unter einem
    // Bildpunkt. Hex (sRGB) wie kopfToene.
    function brauTon(hautHex, haarHex) {
        var a = _hexLin(hautHex),
            b = _hexLin(haarHex),
            k = KOPF_TON.braue.deckung;
        return _linHex([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]);
    }
    function _hexLin(hx) {
        return [(hx >> 16) & 255, (hx >> 8) & 255, hx & 255].map(_byteLin);
    }
    // ein sRGB-Byte (0–255) linear
    function _byteLin(v) {
        v /= 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    function _linHex(c) {
        var h = 0;
        for (var i = 0; i < 3; i++) {
            var v = Math.min(1, Math.max(0, c[i]));
            v = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
            h = h * 256 + Math.round(v * 255);
        }
        return h;
    }
    // DAS GESICHT IM BILD (K63-n2; seit w12-gesicht beim Gesetz: der Kern URTEILT, `werkbank bild --klasse …:kopf/` MISST — Leser
    // `K.gesichtMasse` in der Seite, die Soll-Tafel mensch-kopf): die Züge, die KOPF_SOLL nennt, wie die AUSGABE sie zeigt (Prüfer K63 R2: Augen, Mund und Haar-Fleck maß nichts). `proben` sind die Vertices des Kopfs,
    // projiziert: { z: iris|lippe|hoehle|haut|kappe, x, y, k (Teil der Teilung + 1), vorn, kalotte, a (die Albedo der Ecke, linear),
    // seite und frei (die Iris: ihr Auge, und ob der Strahl der Kamera sie ohne Haut, Lid, Braue und Haar erreicht) };
    // eine Probe ist SICHTBAR, wenn die Teilung an ihrem Pixel ihren eigenen Teil zeigt. `mit`: `gemischt` (je Pixel: mehr als eine
    // Klasse ändert es, klassenTeilung) und `spur` (je Teil k: das Fehlen von k ändert das Pixel über der Schwelle).
    // DAS GESICHT IST DAS GEZEICHNETE (w14-gesicht-fern): eine Probe zählt nur mit `bild` — die Kamera des Schusses zeichnet ihr
    // Teil. Der Wurf-Zwilling eines Leibs (die Grobstufe, die nur wirft) trägt dieselbe Klasse und liegt im selben Kopf; seine
    // Ecken zählten bis hier mit und legten eine zweite Zone in jeden Bildpunkt von Lippe und Höhle — an der Kamera des Spiels
    // (6 m) waren beide darum ungemessen (Radeon 341ad089: 198 von 198 Lippen-Proben in zwei Zonen, nur mit den gezeichneten
    // Ecken 8 reine Bildpunkte der Lippe, 9 der Höhle). Eine Probe ohne `bild` ist keine des Bilds (nie still mitgezählt).
    //   augeFrei     freie vordere Iris-Proben / vordere Iris-Proben: frei ist eine Probe, die der Strahl der Kamera erreicht (`frei`;
    //                ohne Strahl: an ihrem Pixel steht das Auge), und nur in einem Auge, das das BILD zeigt — mindestens eine seiner
    //                Proben trägt die Spur des Auges (sein Teil, oder sein Fehlen ändert das Pixel). Lider und Haut davor verdecken.
    //                Bis w12-gesicht entschied das Pixel allein: an der Kamera des Spiels (6 m) trägt die Iris 1,3 Bildpunkte, jedes
    //                Pixel der Lidspalte teilt Lid und Auge — dasselbe Gesicht las 0,06–0,71 je nach Phase des Bildpunkts und Licht
    //   lippeL/A     ΔL*, Δa* der Lippe gegen die Wange (Haut-Proben zwischen Augen- und Mund-Zeile, ohne ihre Ränder) · hoehleL/A
    //                dasselbe für die Augenhöhle. Je Fläche nur REINE Pixel — ihr Teil, keine zweite Klasse ändert sie (die Sklera
    //                im Saum der Höhle ist nicht die Haut der Höhle), keine zweite Zone liegt in ihnen (die Braue, der Lid-Rand) —
    //                und erst ab 2 × 2 von ihnen (darunter UNAUFGELÖST: ungemessen, nie GRÜN); an der Kamera des Spiels (der Kopf
    //                17 × 22 Bildpunkte) tragen Lippe und Höhle keinen solchen Block. In CIELAB unter dem LICHT DES GESICHTS: Weiß ist die Diffus-
    //                Fläche am Gesicht, Y_n = Y(Wange im Bild) / Y(Albedo der Wange) — die Farbe eines Körpers gegen einen anderen
    //                unter demselben Licht (KOPF_SOLL: Spektral-Normen der Lippe gegen die Haut). Bis w12-gesicht galt das Weiß des
    //                Schirms: im Schatten der Kamera des Spiels las die Wange L* 4,5, dort hat ΔL* ≤ −4 UND Δa* ≥ +4 keine Lösung
    //                (L* ≤ 0,5 trägt höchstens a* 2,2) — kein Gesicht konnte das Band halten
    //   haarDeckung  Anteil der vorderen Kalotten-Proben (über der Haarlinie KOPF_SOLL haarLinie), die als Haar lesen: dort zeigt
    //                die Teilung eine Strähne (`haarK`), oder die Haut zeigt einen Ton näher am Haar als an der Wange
    //   weiss        Y_n, das Licht des Gesichts als Anteil am Weiß des Schirms (die Probe, unter welchem Licht die Züge standen)
    function gesichtMasse(F, teil, W, H, alle, haarK, mit) {
        const proben = alle.filter((p) => p.bild === true);
        const lab = _linLab;
        const px = (x, y) => y * W + x;
        const gem = mit && mit.gemischt;
        const spur = (mit && mit.spur) || {};
        const sicht = (p) => teil[px(p.x, p.y)] === p.k;
        // DIE ZONE JE PIXEL: trägt ein Pixel vordere Proben zweier Zonen (Haut, Lippe, Höhle, Braue, Iris, Kappe), ist seine Farbe
        // keine EINER Fläche — auf 6 m liegt der Ring der Höhle (≈ 10 mm, 1,1 Bildpunkte) in jedem Pixel mit Braue, Lid oder Wange
        const zone = new Map();
        for (const p of proben) if (p.vorn) zone.set(px(p.x, p.y), zone.has(px(p.x, p.y)) && zone.get(px(p.x, p.y)) !== p.z ? "*" : p.z);
        const rein = (p) => sicht(p) && !(gem && gem[px(p.x, p.y)]) && zone.get(px(p.x, p.y)) === p.z;
        const zeigt = (p) => sicht(p) || !!(spur[p.k] && spur[p.k][px(p.x, p.y)]);
        const Y = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        // das Mittel der linearisierten Pixel (je Pixel einmal) und der Albedo der Proben
        const farbMittel = (liste) => {
            const seen = new Set(),
                c = [0, 0, 0],
                a = [0, 0, 0];
            let na = 0;
            for (const p of liste) {
                if (p.a) for (let ch = 0; ch < 3; ch++) a[ch] += p.a[ch];
                if (p.a) na++;
                const i = px(p.x, p.y);
                if (seen.has(i)) continue;
                seen.add(i);
                for (let ch = 0; ch < 3; ch++) c[ch] += _byteLin(F[i * 4 + ch]);
            }
            // AUFGELÖST ist eine Fläche ab einem Block von 2 × 2 reinen Pixeln — darunter trägt das Bild ihre Farbe nicht
            if (seen.size < 4) return null;
            const lin = c.map((v) => v / seen.size);
            return { lin, lab: lab(lin), n: seen.size, alb: na === liste.length ? a.map((v) => v / na) : null };
        };
        const von = (z, f) => proben.filter((p) => p.z === z && (!f || f(p)));
        const r = (x, d) => (x == null || !Number.isFinite(x) ? null : +x.toFixed(d));
        const irisV = von("iris", (p) => p.vorn);
        // DAS AUGE AUFGELÖST (w27-mensch-k4, dasselbe Gesetz wie Lippe und Höhle): je Auge (`seite`, der Knochen irisL/irisR)
        // urteilen steht und frei erst ab 2 × 2 REINEN Pixeln seiner Iris (ihr Teil, keine zweite Klasse, keine zweite Zone);
        // darunter ist augeFrei UNGEMESSEN beim Namen (`augeFreiGrund`), nie Zufall, nie GRÜN. An der Kamera des Spiels (6 m)
        // trägt die Iris ≈ 1 Bildpunkt: ob ein Auge „stand", entschied die Phase eines Pixels im Schatten des Gesichts — dieselbe
        // Pose las 0,667 und 0,5 (GTX 1050, 6,11 und 6,13 m; irisR auf 4 Pixeln der Haut, sein Fehlen änderte sie um 2–12).
        // Ein Auge, dessen vordere Iris-Proben der Strahl der Kamera ALLE verdeckt findet (`frei`: Lid, Haut, Braue, Haar), ist
        // nicht unaufgelöst, sondern verdeckt: es zählt als nicht frei (ROT beim Wert), wie viele Pixel es auch trägt
        const seiten = [...new Set(irisV.map((p) => p.seite))];
        const unaufgeloest = seiten
            .map((s) => {
                const l = irisV.filter((p) => p.seite === s);
                const rp = new Set(l.filter(rein).map((p) => px(p.x, p.y))).size;
                const verdeckt = l.some((p) => typeof p.frei === "boolean") && l.every((p) => p.frei === false);
                return rp < 4 && !verdeckt ? `${s} ${new Set(l.map((p) => px(p.x, p.y))).size} px, ${rp} rein < 2×2` : null;
            })
            .filter(Boolean);
        const steht = new Set(irisV.filter(zeigt).map((p) => p.seite));
        const irisS = irisV.filter((p) => steht.has(p.seite) && (typeof p.frei === "boolean" ? p.frei : zeigt(p)));
        const mittelY = (l) => (l.length ? l.reduce((a, p) => a + p.y, 0) / l.length : null);
        const yAuge = mittelY(irisV),
            lippeS = von("lippe", rein),
            yMund = mittelY(von("lippe", (p) => p.vorn));
        let wange = null;
        if (yAuge != null && yMund != null && yMund > yAuge) {
            const a = yAuge + 0.15 * (yMund - yAuge),
                b = yMund - 0.15 * (yMund - yAuge);
            wange = farbMittel(von("haut", (p) => p.vorn && rein(p) && p.y >= a && p.y <= b));
        }
        const lippe = farbMittel(lippeS),
            hoehle = farbMittel(von("hoehle", rein));
        // DAS LICHT DES GESICHTS: Y_n aus der Wange — ohne die Albedo ihrer Proben bleibt es ungemessen (nie das Weiß des Schirms)
        const weiss = wange && wange.alb && Y(wange.alb) > 0 && Y(wange.lin) > 0 ? Y(wange.lin) / Y(wange.alb) : null;
        const unterLicht = (m) => (m && weiss ? lab(m.lin.map((v) => v / weiss)) : null);
        const [wL, liL, hoL] = [wange, lippe, hoehle].map(unterLicht);
        const hk = new Set(haarK || []);
        const haarPx = [];
        for (let i = 0; i < W * H; i++) if (hk.has(teil[i])) haarPx.push({ x: i % W, y: Math.floor(i / W) });
        const haar = farbMittel(haarPx.length ? haarPx : von("kappe", sicht));
        let haarDeckung = null,
            kal = 0;
        if (wange && haar) {
            let h = 0;
            const d2 = (u, v) => (u[0] - v[0]) ** 2 + (u[1] - v[1]) ** 2 + (u[2] - v[2]) ** 2;
            for (const p of proben) {
                if (!p.kalotte || !p.vorn) continue;
                const t = teil[px(p.x, p.y)];
                if (hk.has(t)) {
                    kal++;
                    h++;
                } else if (t === p.k) {
                    kal++;
                    const i = px(p.x, p.y);
                    const c = lab([_byteLin(F[i * 4]), _byteLin(F[i * 4 + 1]), _byteLin(F[i * 4 + 2])]);
                    if (d2(c, haar.lab) < d2(c, wange.lab)) h++;
                }
            }
            haarDeckung = kal ? h / kal : null;
        }
        const d = (a, b, ch) => (a && b ? r(a[ch] - b[ch], 2) : null);
        return {
            augeFrei: irisV.length && !unaufgeloest.length ? r(irisS.length / irisV.length, 3) : null,
            augeFreiGrund: unaufgeloest.length ? unaufgeloest.join(", ") : null,
            lippeL: d(liL, wL, 0),
            lippeA: d(liL, wL, 1),
            hoehleL: d(hoL, wL, 0),
            hoehleA: d(hoL, wL, 1),
            haarDeckung: r(haarDeckung, 3),
            weiss: r(weiss, 4),
            proben: {
                iris: irisV.length,
                irisSicht: irisS.length,
                lippe: lippeS.length,
                hoehle: hoehle ? hoehle.n : 0,
                wange: wange ? wange.n : 0,
                kalotte: kal,
                haarPixel: haarPx.length,
            },
            zeilen: { auge: r(yAuge, 1), mund: r(yMund, 1) },
        };
    }
    // DAS GESICHT UNTER SEINEM LICHT (w12-gesicht, `gesichtMasse`): ein gemaltes Gesicht — Zeile 0 die Iris je Auge, 1 die Höhle,
    // 2–3 die Wange in der Albedo der Mahagoni-Haut, 4 die Lippe, jede Fläche mal EINEM Licht — liest die Verschiebung seiner Albedo
    // (Lippe ΔL* −10 Δa* +9, Höhle −6/+3) im Schatten der Kamera des Spiels (Y_n 0,07) wie in der Sonne (0,5); unter dem Weiß des
    // Schirms trug der Schatten nie ΔL* ≤ −4 UND Δa* ≥ +4 (der Bruch bis w12-gesicht). Die Mutanten fallen beim Namen: die Lippe im Ton
    // der Wange, die Sklera im Saum der Höhle (ohne `gemischt` läse sie hell), die Lider über der Iris (`frei`), das Auge ohne Spur im
    // Bild, die Wange ohne Albedo (ungemessen, nie das Weiß des Schirms), der Wurf-Zwilling in Lippe und Höhle (w14-gesicht-fern: die
    // Haut der Grobstufe, die nur wirft, liegt in jedem ihrer Bildpunkte — ohne `bild` misst das Gesicht wie ohne sie, mit ihr als
    // Probe des Bilds sind Lippe und Höhle ungemessen, der Stand bis hier an der Kamera des Spiels).
    function gesichtSelbsttest() {
        const v = [], W = 12; // prettier-ignore
        // die Albedo (linear): Wange, Lippe (ΔL* −10 Δa* +9 gegen sie), Höhle (−6/+3), die Sklera
        const [haut, lippe, hoehle, weiss] = [[0.144, 0.054, 0.029], [0.1043, 0.0176, 0.0091], [0.1127, 0.0318, 0.0154], [0.6, 0.6, 0.6]];
        // die Augen (w27-mensch-k4): je Auge 2 × 2 Bildpunkte in den Zeilen 0–1 (x 1–2 links, 8–9 rechts) — aufgelöst; `einPixel`
        // malt je Auge nur einen (unaufgelöst), `einLid` deckt das rechte mit dem Lid (`frei` falsch, sein Pixel zeigt die Haut)
        const fall = (licht, o = {}) => {
            const H = 7, F = new Uint8Array(W * H * 4), teil = new Uint8Array(W * H).fill(2), gemischt = new Uint8Array(W * H), spur = new Uint8Array(W * H); // prettier-ignore
            const proben = [];
            const male = (x, y, c, z, p) => {
                const h = _linHex(c.map((k) => k * licht));
                F.set([(h >> 16) & 255, (h >> 8) & 255, h & 255], (y * W + x) * 4);
                if (z) proben.push(Object.assign({ z, x, y, k: 2, vorn: true, bild: true }, p));
            };
            for (let x = 0; x < W; x++) {
                const sklera = (o.sklera || o.braue) && x === 5;
                for (const y of [0, 1]) {
                    const auge = o.einPixel ? y === 0 && (x === 2 || x === 9) : x === 1 || x === 2 || x === 8 || x === 9;
                    const lid = o.einLid && x > 6;
                    if (auge && !o.ohneSpur && !lid) (teil[y * W + x] = 1), (spur[y * W + x] = 1);
                    male(x, y, auge && !lid ? weiss : haut, auge && "iris", { k: 1, seite: x < 6 ? "irisL" : "irisR", frei: !o.lider && !lid }); // prettier-ignore
                }
                male(x, 2, sklera ? weiss : hoehle, "hoehle", { a: hoehle });
                gemischt[2 * W + x] = o.sklera && sklera && !o.ohneMisch ? 1 : 0;
                if (o.braue && sklera) proben.push({ z: "braue", x, y: 2, k: 2, vorn: !o.ohneZone, bild: true });
                for (const y of [3, 4]) male(x, y, haut, "haut", { a: o.ohneAlbedo ? null : haut });
                male(x, 5, o.lippeHaut ? haut : lippe, x < 3 || !o.schmal ? "lippe" : "haut", { a: lippe });
                male(x, 6, haut);
                // der Wurf-Zwilling: seine Haut in jedem Bildpunkt von Höhle und Lippe (dieselbe Klasse, die Kamera zeichnet ihn nie)
                if (o.zwilling) for (const y of [2, 5]) proben.push({ z: "haut", x, y, k: 2, vorn: true, a: haut, bild: o.zwilling === "bild" });
            }
            return gesichtMasse(F, teil, W, H, proben, [], { gemischt, spur: { 1: spur } });
        };
        const nahe = (g, l, h) => [g.lippeL + 10, g.lippeA - 9, g.hoehleL + 6, g.hoehleA - 3].every((d) => Math.abs(d) <= 1) && g.augeFrei === 1 && Math.abs(g.weiss - l) <= l * h; // prettier-ignore
        for (const l of [0.07, 0.5]) if (!nahe(fall(l), l, 0.1)) v.push(`Gesicht unter Licht ${l}: ${JSON.stringify(fall(l))}`);
        const schirm = (c) => _hexLab(_linHex(c.map((k) => k * 0.07)));
        if (schirm(lippe)[0] - schirm(haut)[0] <= -4 && schirm(lippe)[1] - schirm(haut)[1] >= 4) v.push("der Selbsttest zeigt den Bruch des Schirm-Weiß nicht");
        const m = (o) => fall(0.07, o);
        const faelle = [
            ["die Lippe im Ton der Wange", (g) => Math.abs(m({ lippeHaut: 1 }).lippeA) < 1],
            ["die Sklera im Saum der Höhle", () => m({ sklera: 1 }).hoehleL < -5 && m({ sklera: 1, ohneMisch: 1 }).hoehleL > -3],
            ["die Braue im Pixel der Höhle", () => m({ braue: 1 }).hoehleL < -5 && m({ braue: 1, ohneZone: 1 }).hoehleL > -3],
            ["die Lider über der Iris", () => m({ lider: 1 }).augeFrei === 0],
            // w27-mensch-k4: ein Auge ohne Spur im Bild trägt keinen reinen Pixel — ungemessen beim Namen, nie GRÜN
            ["das Auge ohne Spur im Bild", () => m({ ohneSpur: 1 }).augeFrei === null && /irisL 4 px, 0 rein < 2×2/.test(m({ ohneSpur: 1 }).augeFreiGrund)], // prettier-ignore
            ["das Auge auf einem Bildpunkt (unaufgelöst)", () => m({ einPixel: 1 }).augeFrei === null && /irisR 1 px, 1 rein < 2×2/.test(m({ einPixel: 1 }).augeFreiGrund)], // prettier-ignore
            ["ein Auge wirklich verdeckt (Lid, kein reiner Pixel)", () => m({ einLid: 1 }).augeFrei === 0.5 && m({ einLid: 1 }).augeFreiGrund === null], // prettier-ignore
            ["die Lippe auf drei Bildpunkten (unaufgelöst)", () => m({ schmal: 1 }).lippeA === null],
            ["die Wange ohne Albedo", () => m({ ohneAlbedo: 1 }).lippeL === null && m({ ohneAlbedo: 1 }).weiss === null],
            ["der Wurf-Zwilling in Lippe und Höhle", () => nahe(m({ zwilling: 1 }), 0.07, 0.1) && m({ zwilling: "bild" }).lippeA === null && m({ zwilling: "bild" }).hoehleL === null], // prettier-ignore
        ];
        for (const [n, ok] of faelle) if (!ok()) v.push(`Gesicht: Mutante „${n}" fällt nicht`);
        return v;
    }
    // die Palette (Float-Reihe, MENSCH_TON.length × 3, linear wie der Guss): Haut und Haar als Hex des Gusses (der Farb-Münzer des
    // Wirts reicht sie, sonst die Wahl der Dials), die Kleid-Zonen aus kleidZonen(dials); eine fehlende Zone und das Feste sind 1
    function menschPalette(dials, hautHex, haarHex) {
        var d = dials || {};
        var hs = typeof hautHex === "number" ? hautHex : (SKIN_TONES[d.skinTone] || SKIN_TONES[START_PARAMS.skinTone]).hex;
        var hh = typeof haarHex === "number" ? haarHex : (HAIR_COLORS[d.hairColor] || HAIR_COLORS[START_PARAMS.hairColor]).base;
        var kt = kopfToene(hs);
        var zonen = kleidZonen(d);
        var hexe = [hs, kt.lips, kt.socket, brauTon(hs, hh), hh];
        for (var z = 0; z < 3; z++) hexe.push(zonen[z] ? zonen[z].hex : null);
        hexe.push(null);
        var out = [];
        for (var i = 0; i < hexe.length; i++) {
            var c = hexe[i] === null ? [1, 1, 1] : _hexLin(hexe[i]);
            out.push(c[0], c[1], c[2]);
        }
        return out;
    }

    // Dial→Genom-Achsen des Menschen (die Lab-Slider-Semantik als DATEN —
    // verbatim aus dem Stamm gewandert; khMul skaliert die EINE Kopfhöhen-Einheit):
    var DIAL_MAP = Object.freeze([
        Object.freeze({ dial: "height", axis: "khMul", base: 0, mul: 1 }),
        Object.freeze({ dial: "mass", axis: "build", base: 0, mul: 1 }),
        Object.freeze({ dial: "tone", axis: "muscle", base: 0, mul: 1 }),
        Object.freeze({ dial: "gender", axis: "sex", base: 1, mul: -1 }),
    ]);

    // DIE BEVÖLKERUNG (w28-leib-kanon; der EINE Ort, an dem die Achsen eines Samens zu den Maßen eines Leibs werden — Leser: der
    // Genom-Roller der Welt, stamm `_rollHumanoidGenome`). Eine echte Bevölkerung ist im Körperbau ZWEIGIPFLIG: Mann und Frau, die
    // Mitte selten (`steil`: was der Achse zum Pol fehlt, hoch `steil`) — und sie streut UNABHÄNGIG in der Höhe (je Geschlecht ihr
    // Mittel in Einheiten der Welt-Höhe, die Summe zweier Achsen als Glocke: Standardabweichung `streu` × 0,408) und in der Statur,
    // der Masse bei gleicher Höhe (schief: die Leichten bis `mitte`, ein langer Ast zu den Schweren, `schief` sein Exponent) und
    // dem Muskel (die Summe dreier Achsen um `mitte`, mit der Masse leicht gebunden). Die Mitten sind die Start-Dials, an denen der
    // Kanon steht (LEIB_SOLL.kanon). Bis w28-leib-kanon lagen Geschlecht, Masse und Muskel gleich verteilt in [0, 1): jeder dritte
    // Leib androgyn, jeder vierte ein Athlet, die Höhe beider Geschlechter dieselbe.
    // QUELLE UNGEPRÜFT (aus dem Gedächtnis des Koordinators, Richtwerte nach ANSUR II): Höhe Frau ÷ Mann 0,927, Streuung der
    // Höhe 3,5–4 % je Geschlecht; `steil`, `schief` und die Streuung des Muskels sind gesetzt, nicht gemessen.
    var BEVOELKERUNG = Object.freeze({
        steil: 4,
        hoehe: Object.freeze({ mann: 1.05, frau: 0.9735, streu: 0.09 }),
        masse: Object.freeze({ mitte: 0.35, schief: 1.6 }),
        muskel: Object.freeze({ mitte: 0.5, streu: 0.42, mitMasse: 0.12 }),
    });
    // a = { sex, bau: [2], muskel: [3], hoehe: [2] }, jede Achse gleich verteilt in [0, 1) → { sex, build, muscle, khMul } (die
    // Achsen von DIAL_MAP: sex 1 ist die Frau)
    function bevoelkerung(a) {
        var BV = BEVOELKERUNG,
            d = a.sex - 0.5,
            sex = 0.5 + (d < 0 ? -0.5 : 0.5) * (1 - Math.pow(1 - 2 * Math.abs(d), BV.steil)),
            t = a.bau[0] + a.bau[1] - 1,
            build = t < 0 ? BV.masse.mitte * (1 + t) : BV.masse.mitte + (1 - BV.masse.mitte) * Math.pow(t, BV.masse.schief),
            u = (a.muskel[0] + a.muskel[1] + a.muskel[2] - 1.5) / 1.5,
            muscle = Math.max(0, Math.min(1, BV.muskel.mitte + BV.muskel.streu * u + BV.muskel.mitMasse * (build - BV.masse.mitte)));
        return {
            sex: sex,
            build: build,
            muscle: muscle,
            khMul: (BV.hoehe.mann + (BV.hoehe.frau - BV.hoehe.mann) * sex) * (1 + BV.hoehe.streu * (a.hoehe[0] + a.hoehe[1] - 1)),
        };
    }

    // ════════════════════════════════════════════════════════════════════
    // ULTRAGUSS U3 — DAS LAB-GESETZ WIRD DIE QUELLE (verbatim aus worlds/
    // koerperstudio/koerperstudio.js gewandert; der Schöpfer formte es, es
    // ist das SCHÖNE). Drei Kern-Funktionen, reine Mathe, THREE-/DOM-frei:
    // labProportionen() — die 6-Kopfhöhen-Loomis-Konstanten (Lab Z.99),
    // labMorph(dials)   — die ~30 Dial-Formeln (age/gender/mass/tone-Wirkung,
    //                     Lab morph() Z.1740; die shell-Closures nehmen die
    //                     BASE-Skala als {x,y,z} und geben die Ziel-Skala —
    //                     Ausdrucks-Reihenfolge byte-treu, kein Umbau),
    // labLandmarks(mess)— das Landmarken-Urteil (Lab _landmarks() Z.1388;
    //                     die Shell MISST am lebenden Rig, der Kern URTEILT).
    // Beweis: scripts/diag-koerper-kern.cjs (gate:koerper-kern) — Dial-Gitter
    // alt==neu, 0 Abweichungen. MESHFREI §8 bleibt: Zahlen, keine Meshes.
    // ════════════════════════════════════════════════════════════════════

    // Die Proportions-Zeile (Lab Z.99, verbatim): H=6.0 Gesamthöhe,
    // 6-Kopfhöhen-Loomis — Akromion 0.818H, Trochanter 0.530H, Schädel-Maße.
    function labProportionen() {
        var H = 6.0,
            headSeg = 0.130 * H,
            acromionY = 0.818 * H,
            nippleY = 0.720 * H,
            trochanterY = 0.530 * H;
        var shoulderHW = (0.259 * H) / 2,
            hipHW = (0.191 * H) / 2,
            baseArmX = shoulderHW * MENSCH_GESTALT.schulter.gelenk;
        var thighLen = 0.245 * H,
            calfLen = 0.246 * H,
            upperArmLen = 0.186 * H,
            forearmLen = 0.146 * H;
        var skullBaseR = headSeg / 2,
            skullCY = headSeg / 2,
            skullRX = skullBaseR * 1.03,
            skullRY = skullBaseR * 1.03 * 1.12,
            skullRZ = skullBaseR * 1.03;
        var eyeDist = headSeg / 1.618,
            jawW = headSeg * 0.56,
            chinW = headSeg * 0.22;
        var browY = headSeg * 0.58,
            eyeY = headSeg * 0.48,
            cheekY = headSeg * 0.33;
        var noseY = headSeg * 0.25,
            lipY = headSeg * 0.03,
            chinY = -headSeg * 0.20,
            jawY = -headSeg * 0.10,
            hairlineY = headSeg * 0.91;
        return {
            H: H,
            headSeg: headSeg,
            acromionY: acromionY,
            nippleY: nippleY,
            trochanterY: trochanterY,
            shoulderHW: shoulderHW,
            hipHW: hipHW,
            baseArmX: baseArmX,
            thighLen: thighLen,
            calfLen: calfLen,
            upperArmLen: upperArmLen,
            forearmLen: forearmLen,
            skullBaseR: skullBaseR,
            skullCY: skullCY,
            skullRX: skullRX,
            skullRY: skullRY,
            skullRZ: skullRZ,
            eyeDist: eyeDist,
            jawW: jawW,
            chinW: chinW,
            browY: browY,
            eyeY: eyeY,
            cheekY: cheekY,
            noseY: noseY,
            lipY: lipY,
            chinY: chinY,
            jawY: jawY,
            hairlineY: hairlineY,
            // V18.491.163 — Lab IK stand offsets (byte-alt)
            footBelowAnkle: 0.30,
            standYWalkMul: 0.997,
            standYRunMul: 0.83,
        };
    }

    // Die Dial→Gestalt-Mathe (Lab morph() Z.1740, verbatim): dials
    // {height,mass,tone,age,gender,arms} → abgeleitete Größen + shell-Closures
    // (base-Skala {x,y,z} → Ziel-Skala; lat setzt ABSOLUT — wie das Original).
    function labMorph(p) {
        var h = p.height;
        var effTone = (0.62 + p.tone * 0.53) * (1 - p.age * 0.35);
        var armM = effTone * (0.68 + p.gender * 0.32);
        var armMY = 1 + (armM - 1) * 0.1;
        var legM = effTone * (0.88 + p.gender * 0.12);
        var legMY = 1 + (legM - 1) * 0.1;
        var torsoM = effTone * (0.75 + p.gender * 0.25);
        var shMod = 0.80 + p.gender * 0.20;
        var hipMod = 1.18 - p.gender * 0.23;
        var waistMod = 0.86 + p.gender * 0.14;
        var totalFat = p.mass + p.age * 0.18;
        var fatScale = 1 + totalFat * 0.7;
        var neckThick = (1 + totalFat * 0.22) * (1 + effTone * 0.15) * (0.78 + p.gender * 0.22);
        var jawScale = (0.78 + p.gender * 0.22) * (1 + p.age * 0.12) * (1 + effTone * 0.04);
        return {
            effTone: effTone,
            armM: armM,
            armMY: armMY,
            legM: legM,
            legMY: legMY,
            torsoM: torsoM,
            shMod: shMod,
            hipMod: hipMod,
            waistMod: waistMod,
            totalFat: totalFat,
            fatScale: fatScale,
            neckThick: neckThick,
            jawScale: jawScale,
            charScale: { x: h * 0.93, y: h, z: h * 0.93 },
            armPose: {
                xMul: shMod,
                rotZ: 0.06 + p.gender * 0.05 + p.arms * 1.30,
                rotX: 0.05 - p.arms * 0.05,
            },
            headPose: { ageDrop: p.age * 0.08, fwd: p.age * 0.12 },
            // die Hüft-Gelenke (w28-leib-kanon, ANSUR: die Hüfte der Frau 0,211 H, des Mannes 0,197 H) — ihr Abstand je Geschlecht
            beinPose: { xMul: 0.94 + (1 - p.gender) * 0.14 },
            shell: {
                ribcage: function (b) {
                    return { x: b.x * (0.92 + p.gender * 0.08), y: b.y, z: b.z * (0.95 + p.gender * 0.05) };
                },
                pelvis: function (b) {
                    return { x: b.x * hipMod, y: b.y, z: b.z * (0.88 + p.gender * 0.12) };
                },
                waist: function (b) {
                    return { x: b.x * fatScale * waistMod, y: b.y, z: b.z * (1 + totalFat * 0.4) };
                },
                abs: function (b) {
                    return { x: b.x * (1 + totalFat * 0.45), y: b.y, z: b.z * (1 + totalFat * 0.3 - effTone * 0.08) };
                },
                oblique: function (b) {
                    return { x: b.x * (1 + totalFat * 0.35) * waistMod, y: b.y, z: b.z * (1 + totalFat * 0.2) };
                },
                glute: function (b) {
                    return {
                        x: b.x * (1 + totalFat * 0.3) * hipMod,
                        y: b.y * (1 + totalFat * 0.1) * (0.95 + (1 - p.gender) * 0.22),
                        z: b.z * (1 + totalFat * 0.2) * (1.0 + (1 - p.gender) * 0.32),
                    };
                },
                quad: function (b) {
                    return { x: b.x * legM * (1 + totalFat * 0.15), y: b.y * legMY, z: b.z * legM };
                },
                hamstring: function (b) {
                    return { x: b.x * legM, y: b.y, z: b.z * legM };
                },
                calf: function (b) {
                    return { x: b.x * legM, y: b.y * legMY, z: b.z * legM };
                },
                bicep: function (b) {
                    return { x: b.x * armM, y: b.y * armMY, z: b.z * armM };
                },
                tricep: function (b) {
                    return { x: b.x * armM, y: b.y * armMY, z: b.z * armM };
                },
                uarm: function (b) {
                    return { x: b.x * armM, y: b.y * armMY, z: b.z * armM };
                },
                forearm: function (b) {
                    var fm = (0.70 + p.gender * 0.30) * (0.92 + effTone * 0.12);
                    return { x: b.x * fm, y: b.y, z: b.z * fm };
                },
                deltoid: function (b) {
                    return { x: b.x * armM * shMod, y: b.y * armM, z: b.z * armM * shMod };
                },
                trap: function (b) {
                    return {
                        x: b.x * (1 + (torsoM - 1) * 0.4) * (0.82 + p.gender * 0.18),
                        y: b.y * (1 + (torsoM - 1) * 0.3) * (0.85 + p.gender * 0.15),
                        z: b.z,
                    };
                },
                lat: function () {
                    return { x: 1 + (torsoM - 1) * 0.5, y: 1, z: 1 + (torsoM - 1) * 0.3 };
                },
                upperBack: function (b) {
                    return {
                        x: b.x * (1 + (torsoM - 1) * 0.25) * shMod,
                        y: b.y,
                        z: b.z * (1 + (torsoM - 1) * 0.2) * (0.82 + p.gender * 0.18),
                    };
                },
                chest: function (b) {
                    return {
                        x: b.x * (0.74 + p.gender * 0.14) * (1 + (torsoM - 1) * 0.1),
                        y: b.y,
                        z: b.z * (0.85 + p.gender * 0.15),
                    };
                },
                pec: function (b) {
                    return {
                        x: b.x * (0.55 + p.gender * 0.45) * (1 + (torsoM - 1) * 0.15),
                        y: b.y * (1 + (torsoM - 1) * 0.04),
                        z: b.z * (0.70 + p.gender * 0.30),
                    };
                },
                breast: function (b) {
                    var bs = Math.max(0.02, (1 - p.gender) * (0.92 + totalFat * 0.5));
                    return { x: b.x * bs, y: b.y * bs * 1.05, z: b.z * bs };
                },
                neck: function (b) {
                    return { x: b.x * neckThick, y: b.y, z: b.z * neckThick };
                },
                jaw: function (b) {
                    return { x: b.x * jawScale, y: b.y, z: b.z };
                },
                chin: function (b) {
                    return { x: b.x * (0.82 + p.gender * 0.18), y: b.y, z: b.z };
                },
                buccal: function (b) {
                    return { x: b.x * (1 + totalFat * 0.4 + p.age * 0.1), y: b.y, z: b.z };
                },
                cheekbone: function (b) {
                    return { x: b.x * (0.80 + p.gender * 0.20), y: b.y, z: b.z };
                },
                masseter: function (b) {
                    return { x: b.x * torsoM, y: b.y, z: b.z };
                },
            },
        };
    }

    // ── EICHUNG Kern-landmarks() (8-KH-Stamm-Extrakt, Kopf 7.95) gegen das ──
    // Lab-Gesetz (6-KH-Loomis, H=6.0) an 5 Referenz-Gelenken, Default-Dials
    // (gender=1→sex=0 · mass=0.35→build · tone=0.5→muscle · height=1):
    // Stationen als Anteil der Gesamthöhe (y/7.95 bzw. y/6.0), Δrel = Kern−Lab.
    // | Gelenk     | Kern y | rel    | Lab y  | rel    | Δrel    | Δrel x  |
    // | Schulter   | 6.40   | 0.8050 | 4.9080 | 0.8180 | -0.0130 | +0.0114 |
    // | Hüfte      | 4.05   | 0.5094 | 3.1800 | 0.5300 | -0.0206 | -0.0076 |
    // | Knie       | 2.30   | 0.2893 | 1.7100 | 0.2850 | +0.0043 | -0.0261 |
    // | Handgelenk | 3.85   | 0.4843 | 2.9160 | 0.4860 | -0.0017 | +0.0850 |
    // | Kopf-Mitte | 7.20   | 0.9057 | 5.6100 | 0.9350 | -0.0293 |  0.0000 |
    // Die y-Stationen liegen ≤3 % auseinander (größte Lücke: Kopf/Hüfte);
    // seitlich klafft das Handgelenk (+8,5 % — der 8-KH-Extrakt spreizt die
    // Arme weiter). Die Stamm-Konvergenz (Rig übernimmt die Lab-Proportionen)
    // ist eine SICHT-Welle und bleibt bewusst offen — die Zahl liegt bereit.
    // Das Landmarken-Urteil (Lab _landmarks() Z.1388–1408, verbatim): die
    // Shell misst chin/neckBase/waist/knee1 + den neckBase-Radius am lebenden
    // Rig und reicht sie als mess her; der Kern trägt Offsets, Fallbacks und
    // den Handgelenks-VERTRAG (wristFrac/wristOverlap — hand-shell endet bei
    // wristFrac, Körperhaut reicht wristFrac+overlap darüber).
    function labLandmarks(mess) {
        mess = mess || {};
        var chin = mess.chin,
            nb = mess.neckBase,
            waist = mess.waist,
            knee = mess.knee;
        var neckBaseRad = mess.neckBaseRad != null ? mess.neckBaseRad : 0.13;
        return {
            chinY: chin ? chin.y : 5.44,
            neckTopY: (chin ? chin.y : 5.44) - 0.04,
            collarY: nb ? nb.y + 0.02 : 4.95,
            shoulderTopY: nb ? nb.y + 0.04 : 5.06,
            neckR: Math.max(0.12, neckBaseRad * 1.05),
            neckCX: nb ? nb.x : 0,
            neckCZ: nb ? nb.z : 0,
            waistY: waist ? waist.y : 3.9,
            wristFrac: 1.36,
            wristOverlap: 0.06,
            kneeY: knee ? knee.y : 1.86,
        };
    }

    // DIE LAGE DES KOPFS IM KANON (w21-leib-bau): der Scheitel steht auf H, der Kopf misst kopf.mass × die Schädel-Höhe — Drillis &
    // Contini 1966 (nach Winter, Biomechanics and Motor Control of Human Movement, 4. Aufl. 2009, Abb. 4.1): Kopf 0,130 H (Kinn bis
    // Scheitel), Kinn 0,870 H, Schulter 0,818 H, Hüfte 0,530 H — die Zahlen, aus denen labProportionen den Leib baut. Bis
    // w21-leib-bau hielt der Ofen das KINN auf der Höhe des Labors (5,45 E) und wuchs den Kopf darüber: der Scheitel stand 0,21 E
    // über H, der Mensch maß 6,28 statt 6,07 E (die Welt nimmt 6 E = 1,70 m an, LEIB.kopfM), der Kopf 0,839 E = 0,134 H — Schulter
    // 0,792 statt 0,818, Hüfte 0,517 statt 0,530 der Statur, der Hals 0,074 statt 0,052. Rückgabe { S, B (die Kopf-Skala hoch und
    // quer), posY (die Lage der Kopf-Gruppe, Leib-Raum), kinnY (der tiefste Punkt des Kinns), kinn (die Kinn-Mitte, Kopf-Raum) }.
    function _kopfLage() {
        var P = labProportionen(),
            MG = MENSCH_GESTALT;
        var S = MG.kopf.mass,
            SH = MG.schaedel.hoch;
        var nY = P.noseY - MG.gesicht.naseTiefer;
        var kinn = nY + (P.chinY - nY) * MG.gesicht.unten;
        // der Scheitel im Kopf-Raum: die Schädel-Kugel (bauMensch: Mitte skullCY + SH/2, Halbachse rS·1,12 + SH/2)
        var scheitel = P.skullCY + SH + P.skullBaseR * 1.03 * 1.12;
        var posY = P.H - scheitel * S;
        return { S: S, B: MG.kopf.breite, posY: posY, kinnY: posY + (kinn - (P.chinW / 2) * 0.9) * S, kinn: kinn };
    }
    // Die Drehung (Euler XYZ, wie die Gelenke) eines Zylinders, dessen Achse (lokal y) von a nach b zeigt — und Mitte und Länge
    function _zylinderZwischen(a, b) {
        var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        var L = Math.hypot(d[0], d[1], d[2]);
        var u = [d[0] / L, d[1] / L, d[2] / L];
        // Rx(θx)·Rz(θz)·(0, 1, 0) = (−sin θz, cos θz cos θx, cos θz sin θx)
        return { mitte: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], L: L, rot: [Math.atan2(u[2], u[1]), 0, -Math.asin(u[0])] };
    }

    // ════════════════════════════════════════════════════════════════════
    // KONVERGENZ-WELLE — DER EINE MENSCH: bauMensch(F) baut den kompletten
    // Da-Vinci-Teile-Baum (verbatim aus worlds/koerperstudio/koerperstudio.js
    // Z.100–158 gewandert; der Schöpfer formte ihn, es ist das SCHÖNE) über
    // FABRIK-HAKEN — MESHFREI §8 bleibt: der Kern kennt keine Meshes, F baut.
    //   F.gruppe()                  → Knoten (position/rotation/scale/add/userData)
    //   F.kugel(r, klasse, sc?)     → Kugel-Knoten (klasse: skin·joint·dark·eye·
    //   F.zylinder(rt,rb,h, klasse)   iris·cornea·socket·shadow·lips·hair·pupil)
    // Beide Leser bauen HIERAUS: die Lab-Shell (THREE-Meshes — byte-gleich zum
    // alten Inline-Bau, Beweis diag-koerper-kern --selftest Bau-Gitter) und der
    // Stamm (Daten-Knoten → Welt-Ellipsoide → Metaball-Haut, die Regler treffen
    // labMorph über DIESELBEN Teil-Namen). Rückgabe {character, parts, base,
    // augen}: augen = die 12 Gesichts-Refs (eyeL…lowerLipRef), base = Ruhe-
    // Skalen für labMorph (plain {x,y,z} — labMorph.shell liest nur .x/.y/.z).
    // DER KANON DES LEIBS (w28-leib-kanon, die Bänder LEIB_SOLL.kanon, gemessen von `leibKanon`): die Maße, die den Rumpf, den Arm und
    // das Becken des Gesetzes in ihre Anthropometrie stellen — EINE Stelle, die Welt, Labor, Menge und Kleid lesen (sie gießen aus
    // diesem Baum). rumpf.tiefe / rumpf.breite stauchen jedes Blatt des Rumpfs (ohne Hals, Kopf, Arm) in Tiefe und Quere um die
    // Mitte, rumpf.taille weitet darin Bauch und Flanken-Muskel, rumpf.flanke rückt den Latissimus unter den Arm; becken.breit
    // staucht Becken und Gesäß quer, becken.hoch hebt den Boden des Beckens bei festem Kamm (der Schritt); arm.dicke nimmt dem
    // Oberarm (Bizeps, Trizeps, Kern) die Quere, bein.dicke dem Oberschenkel; schulter.gelenk (labProportionen) rückt das
    // Schulter-Gelenk, bein.abstand das Hüft-Gelenk zur Mitte. Dazu im Statur-Gesetz (labMorph): der Brustkorb der Frau 0,92 statt
    // 0,8 der Breite des Mannes, ihre Taille 0,86 statt 0,76, der Brust-Muskel des Mannes 0,88 statt 1 (ANSUR: Brust und Taille
    // je H bei Frau und Mann fast gleich). Bis w28-leib-kanon maß der Mann am Ofen L0 Brust-Tiefe 0,214 H (Soll 0,145), Brust-
    // Breite 0,252 (0,165), Hüfte 0,256 (0,197), Schritt 0,412 (0,481), über die Deltoide 0,336 (0,290): der Rumpf ein Kissen,
    // die Hüfte eine Windel, die Schulter ein Ball.
    function _kanonAuf(parts, base, frei, kugeln) {
        var G = MENSCH_GESTALT,
            tz = G.rumpf.tiefe,
            name = new Map();
        Object.keys(parts).forEach(function (k) {
            name.set(parts[k], k);
        });
        var ohne = new Set(frei),
            // die kleinen Kugeln der Oberfläche (die Bauch-Felder, ≤ 0,12 E) rücken mit, behalten aber ihre Form: gestaucht
            // zeichneten sie Grate in die Haut des Bauchs (bauchKnick 32° gegen 25°)
            klein = new Set(
                kugeln
                    .filter(function (k) {
                        return k.r <= 0.12;
                    })
                    .map(function (k) {
                        return k.n;
                    })
            );
        ["arm1", "arm-1", "head", "neckBase", "neckMain", "scm1", "scm-1", "napeFill1", "napeFill2", "clavicle1", "clavicle-1", "tneck1", "tneck-1"].forEach(function (k) { ohne.add(parts[k]); }); // prettier-ignore
        var skala = function (n, x, y, z) {
            n.scale.set(n.scale.x * x, n.scale.y * y, n.scale.z * z);
            var k = name.get(n);
            if (k && base[k]) base[k] = { x: base[k].x * x, y: base[k].y * y, z: base[k].z * z };
        };
        // je Blatt (ein Teil ohne Kinder) die Quer- und die Tiefen-Achse um die Mitte des Leibs (Lage und Skala)
        var stauche = function (tx, tz) {
            return function blatt(n) {
                if (ohne.has(n)) return;
                if (n.children && n.children.length) return n.children.forEach(blatt);
                n.position.x *= tx;
                n.position.z *= tz;
                if (!klein.has(n)) skala(n, tx, 1, tz);
            };
        };
        parts.torso.children.forEach(stauche(G.rumpf.breite, tz));
        [parts.pelvis, parts.glute1, parts["glute-1"]].forEach(stauche(G.becken.breit, tz));
        // das Becken behält seinen Kamm (die Oberkante), sein Boden — der Schritt — steigt
        parts.pelvis.position.y += (1 - G.becken.hoch) * parts.pelvis.scale.y * 0.7;
        skala(parts.pelvis, 1, G.becken.hoch, 1);
        [parts.waist, parts.oblique1, parts["oblique-1"]].forEach(stauche(G.rumpf.taille, 1));
        [parts.lat1, parts["lat-1"]].forEach(stauche(G.rumpf.flanke, 1));
        ["1", "-1"].forEach(function (sd) {
            ["bicep", "tricep", "uarm", "forearm"].forEach(function (m) {
                skala(parts[m + sd], G.arm.dicke, 1, G.arm.dicke);
            });
            ["quad", "adduct", "hamstring", "vlat"].forEach(function (m) {
                skala(parts[m + sd], G.bein.dicke, 1, G.bein.dicke);
            });
        });
    }
    function bauMensch(F) {
        const {H,headSeg,acromionY,nippleY,trochanterY,shoulderHW,hipHW,baseArmX,thighLen,calfLen,upperArmLen,forearmLen,skullBaseR,skullCY,skullRX,skullRY,skullRZ,eyeDist,jawW,chinW,browY,eyeY,cheekY,noseY,lipY:lipY0,chinY:chinY0,jawY:jawY0,hairlineY} = labProportionen();
        const matSkin = "skin", matJoint = "joint", matDark = "dark", matEye = "eye", matIris = "iris",
            matCornea = "cornea", matSocket = "socket", matShadow = "shadow", matLips = "lips", matHair = "hair", matPupil = "pupil";
        const parts = {}, base = {}, kugeln = [];
        // jede Kugel trägt ihren Halbmesser und ihre Stoff-Klasse in die Liste des Baums (die Ruhe der Arme, `_armRuhe`, misst an ihnen)
        const s = (r, m, sc) => {
            const n = F.kugel(r, m, sc);
            kugeln.push({ n: n, r: r, k: m });
            return n;
        };
        const c = (rt, rb, h, m) => F.zylinder(rt, rb, h, m);
        const reg = (name, node) => {
            parts[name] = node;
            if (node && !node.name) node.name = name;
            if (node.scale) base[name] = { x: node.scale.x, y: node.scale.y, z: node.scale.z };
            return node;
        };
        const character=F.gruppe();var eyeL,eyeR,irisL,irisR,lidTL,lidTR,lidBL,lidBR,browL,browR,upperLipRef,lowerLipRef;
        const torsoG=F.gruppe();torsoG.position.set(0,trochanterY,0);character.add(torsoG);reg('torso',torsoG);
        const pelvis=reg('pelvis',s(0.7,matSkin,[1.15,1.0,0.7]));pelvis.position.set(0,trochanterY,0);character.add(pelvis);
        [-1,1].forEach(sd=>{const g=reg('glute'+(sd===1?'1':'-1'),s(0.40,matSkin,[0.82,0.8,0.82]));g.position.set(sd*0.26,trochanterY-0.1,-0.12);character.add(g);});
        [-1,1].forEach(sd=>{const hipG=F.gruppe();hipG.position.set(sd*hipHW*MENSCH_GESTALT.bein.abstand,trochanterY,0);reg('hip'+(sd===1?'1':'-1'),hipG);const qR=0.32;const quad=reg('quad'+(sd===1?'1':'-1'),s(qR,matSkin,[0.9,thighLen/(qR*2),0.9]));quad.position.set(0,-thighLen/2,0.1);hipG.add(quad);const vL=reg('vlat'+(sd===1?'1':'-1'),s(0.16,matSkin,[0.85,thighLen/0.41,0.9]));vL.position.set(sd*0.17,-thighLen/2,0.06);hipG.add(vL);const ad2=reg('adduct'+(sd===1?'1':'-1'),s(0.17,matSkin,[0.9,thighLen/0.6,0.85]));ad2.position.set(sd*-0.2,-thighLen/2,-0.02);hipG.add(ad2);const ham=reg('hamstring'+(sd===1?'1':'-1'),s(0.20,matSkin,[1,thighLen/0.40,0.9]));ham.position.set(0,-thighLen/2,-0.2);hipG.add(ham);const knee=reg('kneecap'+(sd===1?'1':'-1'),s(0.24,matJoint,[1.05,0.75,1.05]));knee.position.set(0,-thighLen,0.05);hipG.add(knee);const kneeG=F.gruppe();kneeG.position.set(0,-thighLen,0);hipG.add(kneeG);reg('knee'+(sd===1?'1':'-1'),kneeG);const cR=0.27;const calf=reg('calf'+(sd===1?'1':'-1'),s(cR,matSkin,[1,calfLen/(cR*2),0.8]));calf.position.set(0,-calfLen/2,-0.12);kneeG.add(calf);const shin=reg('shin'+(sd===1?'1':'-1'),s(0.16,matSkin,[1,calfLen/0.36,1]));shin.position.set(0,-calfLen/2,0.1);kneeG.add(shin);const aY=-calfLen;const ankleG=F.gruppe();ankleG.position.set(0,aY,0);kneeG.add(ankleG);reg('ankle'+(sd===1?'1':'-1'),ankleG);const ankleSphere=s(0.15,matJoint,[1.1,0.5,1]);ankleG.add(ankleSphere);const foot=F.gruppe();const heel=s(0.2,matSkin,[1.2,1,1.5]);heel.position.set(0,0,-0.15);foot.add(heel);const mid=s(0.25,matSkin,[0.8,0.6,1.5]);mid.position.set(0,-0.05,0.2);foot.add(mid);for(let i=0;i<5;i++){const tX=(i-2)*0.08,tZ=0.4+(i*0.02),tR=0.06-(i*0.005);const t1=s(tR,matSkin,[1.5,0.8,1.2]);t1.position.set(tX,-0.15,tZ);foot.add(t1);const t2=s(tR*0.8,matSkin,[1.5,0.8,1.2]);t2.position.set(tX,-0.15,tZ+0.15);foot.add(t2);}foot.position.set(0,-0.1,0.1);foot.scale.z=MENSCH_GESTALT.fuss.laenge;ankleG.add(foot);hipG.rotation.z=sd*0.05;character.add(hipG);});
        const ribcage=reg('ribcage',s(1.0,matSkin,[shoulderHW,1.2*MENSCH_GESTALT.rumpf.brustkorb,0.6]));ribcage.position.set(0,nippleY-trochanterY,0);torsoG.add(ribcage);
        const waist=reg('waist',s(0.5,matSkin,[1.14,1.0,0.5]));waist.position.set(0,(nippleY+trochanterY)/2-trochanterY,0);torsoG.add(waist);
        [-1,1].forEach(sd=>{const g=F.gruppe();const t1=s(0.5,matSkin,[0.8,0.6,0.3]);t1.position.set(sd*0.7,acromionY-0.5-trochanterY,-0.1);g.add(t1);const t2=s(0.4,matSkin,[0.6,0.6,0.3]);t2.position.set(sd*0.4,acromionY-1.0-trochanterY,-0.1);g.add(t2);const t3=s(0.3,matSkin,[0.4,0.6,0.3]);t3.position.set(sd*0.1,0.5,-0.1);g.add(t3);reg('lat'+(sd===1?'1':'-1'),g);torsoG.add(g);});
        const upperBack=reg('upperBack',s(0.8,matSkin,[1.15,0.8*MENSCH_GESTALT.rumpf.nacken,0.5]));upperBack.position.set(0,acromionY-0.2-trochanterY,-0.2);torsoG.add(upperBack);
        [-1,1].forEach(sd=>{const o=reg('oblique'+(sd===1?'1':'-1'),s(0.24,matSkin,[0.48,1.4,0.4]));o.position.set(sd*0.46,(nippleY+trochanterY)/2-trochanterY,0.08);torsoG.add(o);});
        const RB=MENSCH_GESTALT.rumpf;const chestCore=reg('chest',s(0.5,matSkin,[1.8,RB.brust,0.8]));chestCore.position.set(0,nippleY+0.2-0.5*(1-RB.brust)-trochanterY,0.3);torsoG.add(chestCore);   // w21-leib-bau: die brust endet unter der drosselgrube (ihr scheitel lag 0.18 E ueber ihr, der hals stand hinter einem sims)
        [-1,1].forEach(sd=>{const g=F.gruppe();const l=s(0.4,matSkin,[1.4,0.6,0.8]);l.position.set(sd*0.22,nippleY+0.2-trochanterY,0.35);l.rotation.z=sd*-0.2;g.add(l);const u=s(0.3,matSkin,[1.2,0.4,0.6]);u.position.set(sd*0.55,nippleY+0.6-RB.pecTiefer-trochanterY,0.32);u.rotation.set(0,sd*0.2,sd*0.4);g.add(u);reg('pec'+(sd===1?'1':'-1'),g);torsoG.add(g);});
        [-1,1].forEach(sd=>{const br=reg('breast'+(sd===1?'1':'-1'),s(0.32,matSkin,[1.0,1.05,1.0]));br.position.set(sd*0.27,nippleY+0.06-trochanterY,0.44);br.rotation.x=-0.12;torsoG.add(br);});
        const sternum=s(0.04,matDark,[0.4,2.5,0.5]);sternum.position.set(0,nippleY+0.1-trochanterY,0.38);torsoG.add(sternum);
        const absBase=reg('abs',s(0.5,matSkin,[0.8,1.6,0.4]));absBase.position.set(0,(nippleY+trochanterY)/2-trochanterY,0.3);torsoG.add(absBase);
        for(let i=0;i<4;i++){const y=(nippleY-0.1)-(i*0.2*headSeg)-trochanterY;const aL=s(0.11,matSkin,[1,1,0.8]);aL.position.set(-0.12,y-0.02,0.37);torsoG.add(aL);const aR=s(0.11,matSkin,[1,1,0.8]);aR.position.set(0.12,y-0.02,0.37);torsoG.add(aR);const tV=s(0.035,matDark,[0.22,0.6,0.5]);tV.position.set(0,y-0.04,0.4);torsoG.add(tV);const tH=s(0.03,matDark,[1.8,0.1,0.5]);tH.position.set(0,y+0.05,0.4);torsoG.add(tH);}
        [-1,1].forEach(sd=>{const t=reg('trap'+(sd===1?'1':'-1'),s(0.3,matSkin,[1.3,0.6,0.6]));t.position.set(sd*0.3,acromionY-MENSCH_GESTALT.rumpf.trapTiefer-trochanterY,-0.1);t.rotation.z=sd*0.2;torsoG.add(t);});   // w21-leib-bau: der trapez faellt vom hals zur schulterhoehe (sein scheitel lag 0.15 E darueber)
        const KL=_kopfLage(),HA=MENSCH_GESTALT.hals,SB=MENSCH_GESTALT.schluesselbein;const nSY=acromionY+0.02,nEY=KL.kinnY+HA.inKopf,nH=nEY-nSY;const neckBase=reg('neckBase',c(0.125,0.155,0.13,matSkin));neckBase.position.set(0,nSY+0.06-trochanterY,0);torsoG.add(neckBase);const hl=_zylinderZwischen([0,nSY-HA.unten,HA.z[0]],[0,nEY,HA.z[1]]);const nm0=c(HA.r,HA.r,hl.L*HA.laenge,matSkin);nm0.scale.set(1,1,HA.tief);const neckMain=reg('neckMain',nm0);neckMain.position.set(hl.mitte[0],hl.mitte[1]-trochanterY,hl.mitte[2]);neckMain.rotation.set(hl.rot[0],hl.rot[1],hl.rot[2]);torsoG.add(neckMain);const adamsApple=s(0.019,matSkin,[0.85,0.9,0.8]);adamsApple.position.set(0,nSY+0.16-trochanterY,0.06);torsoG.add(adamsApple);const nape=s(0.028,matSkin,[0.55,0.55,0.45]);nape.position.set(0,nSY+0.08-trochanterY,-0.04);torsoG.add(nape);   // w21-leib-bau: der hals ist eine geneigte roehre von der hals-wurzel bis unter den schaedel (die kugel neckMain endete unter dem kinn); ihr deckel neckTop fiel (er lag im kopf auf hoehe der lippen, sein rand lief um die haut-dicke geweitet als falte von den mundwinkeln zum kiefer)
        [-1,1].forEach(sd=>{const z=_zylinderZwischen([sd*HA.scm[0][0],nSY+HA.scm[0][1],HA.scm[0][2]],[sd*HA.scm[1][0],KL.kinnY+HA.scm[1][1],HA.scm[1][2]]);const scm=reg('scm'+(sd===1?'1':'-1'),c(HA.scm[2],HA.scm[2],z.L,matSkin));scm.position.set(z.mitte[0],z.mitte[1]-trochanterY,z.mitte[2]);scm.rotation.set(z.rot[0],z.rot[1],z.rot[2]);torsoG.add(scm);});   // sternocleidomastoideus: der schraegzug brustbein -> warzenfortsatz (w21-leib-bau: vorher zwei senkrechte staebe vorn am hals)
        [-1,1].forEach(sd=>{const tn=reg('tneck'+(sd===1?'1':'-1'),s(0.115,matSkin,[0.85,1.4,0.70]));tn.position.set(sd*0.17,nSY+0.06-0.5*MENSCH_GESTALT.rumpf.trapTiefer-trochanterY,-0.10);tn.rotation.z=sd*0.55;torsoG.add(tn);});   // nacken-trapez-bruecke: schliesst die harte hals->schulter-kante (w21-leib-bau: mit dem trapez gesenkt)
        const nf1=reg('napeFill1',s(0.10,matSkin,[0.9,1.3,1.0]));nf1.position.set(0,5.10-trochanterY,-0.14);torsoG.add(nf1);   // HINTERHAUPT-NACKEN-FUELLER: harness-befund -- schaedelbasis hing 0.39-0.43 HINTER dem hals,
        const nf2=reg('napeFill2',s(0.08,matSkin,[0.85,1.1,0.95]));nf2.position.set(0,5.24-trochanterY,-0.15);torsoG.add(nf2);   // man sah von hinten unter den offenen schaedel ins leere. koerperfeld waechst jetzt hoch dagegen.
        [-1,1].forEach(sd=>{const z=_zylinderZwischen([sd*SB.innen[0],nSY+SB.innen[1],SB.innen[2]],[sd*SB.aussen[0],nSY+SB.aussen[1],SB.aussen[2]]);const cl=reg('clavicle'+(sd===1?'1':'-1'),c(SB.r,SB.r*0.8,z.L,matSkin));cl.position.set(z.mitte[0],z.mitte[1]-trochanterY,z.mitte[2]);cl.rotation.set(z.rot[0],z.rot[1],z.rot[2]);torsoG.add(cl);});   // w21-leib-bau: das schluesselbein liegt von der drosselgrube zur schulterhoehe (die lab-drehung kippte den y-zylinder nur 29 grad: zwei pfaehle neben dem hals)
        [-1,1].forEach(sd=>{const armG=F.gruppe();armG.position.set(sd*baseArmX,acromionY-trochanterY,0);reg('arm'+(sd===1?'1':'-1'),armG);const delt=reg('deltoid'+(sd===1?'1':'-1'),s(0.30,matSkin,[1,1.1,1]));armG.add(delt);const bic=reg('bicep'+(sd===1?'1':'-1'),s(0.26,matSkin,[0.9,upperArmLen/0.52,1]));bic.position.set(0,-upperArmLen/2,0.1);armG.add(bic);const tri=reg('tricep'+(sd===1?'1':'-1'),s(0.27,matSkin,[0.9,upperArmLen/0.54,0.9]));tri.position.set(0,-upperArmLen/2,-0.15);armG.add(tri);const uarm=reg('uarm'+(sd===1?'1':'-1'),s(0.23,matSkin,[1.0,upperArmLen/0.46,0.96]));uarm.position.set(0,-upperArmLen/2,-0.02);armG.add(uarm);const el=s(0.165,matJoint,[1,0.75,1]);el.position.set(0,-upperArmLen,0);armG.add(el);const elbowG=F.gruppe();elbowG.position.set(0,-upperArmLen,0);armG.add(elbowG);reg('elbow'+(sd===1?'1':'-1'),elbowG);const UA=MENSCH_GESTALT.unterarm,HG=MENSCH_GESTALT.handgelenk;const fa=reg('forearm'+(sd===1?'1':'-1'),s(0.24,matSkin,[1.2*UA.breite,forearmLen/0.48,UA.tiefe]));fa.position.set(sd*0.05,-forearmLen*UA.bauch,0);elbowG.add(fa);const wY=-forearmLen;const wr=s(0.14,matSkin,[HG.breite,0.5,HG.tiefe]);wr.position.set(sd*0.05,wY,0);elbowG.add(wr);
        const hk=MENSCH_GESTALT.hand.mass,hb=MENSCH_GESTALT.hand.breite;const hand=F.gruppe();hand.userData.sd=sd;hand.userData.fingers=[];hand.userData.thumbs=[];
        const palmG=F.gruppe();hand.add(palmG);hand.userData.palmG=palmG;reg('palm'+(sd===1?'1':'-1'),palmG);
        const palm=s(0.25*hk,matSkin,[hb,1.2,0.5]);palmG.add(palm);
        for(let i=0;i<4;i++){const fX=(i-1.5)*0.12*hk*hb,fZ=(0.1-Math.abs(i-1.5)*0.05)*hk;const fG=F.gruppe();fG.position.set(fX,-0.28*hk,fZ);fG.rotation.z=(i-1.5)*0.13;reg('fA'+i+'_'+(sd===1?'1':'-1'),fG);fG.add(s(0.08*hk,matSkin,[0.9*hb,0.8,0.9]));const f1=c(0.06*hk*hb,0.05*hk*hb,0.18*hk,matSkin);f1.position.y=-0.09*hk;fG.add(f1);const jG1=F.gruppe();jG1.position.set(0,-0.18*hk,0);reg('fB'+i+'_'+(sd===1?'1':'-1'),jG1);jG1.add(s(0.05*hk*hb,matSkin,[1.0,0.8,1.0]));const f2=c(0.05*hk*hb,0.04*hk*hb,0.14*hk,matSkin);f2.position.set(0,-0.07*hk,-0.01*hk);jG1.add(f2);const jG2=F.gruppe();jG2.position.set(0,-0.14*hk,-0.02*hk);reg('fC'+i+'_'+(sd===1?'1':'-1'),jG2);jG2.add(s(0.04*hk*hb,matSkin,[1.0,0.8,1.0]));const f3=c(0.04*hk*hb,0.03*hk*hb,0.1*hk,matSkin);f3.position.set(0,-0.05*hk,-0.04*hk);jG2.add(f3);jG1.add(jG2);fG.add(jG1);palmG.add(fG);hand.userData.fingers.push({mcp:fG,pip:jG1,dip:jG2});}
        const thumbG=F.gruppe();thumbG.position.set(-sd*0.3*hk*hb,-0.15*hk,0.1*hk);thumbG.rotation.set(0,sd*0.5,sd*-1.2);reg('tA_'+(sd===1?'1':'-1'),thumbG);thumbG.add(s(0.1*hk,matSkin,[0.8,1.5,0.8]));const thumbF1=c(0.06*hk,0.05*hk,0.12*hk,matSkin);thumbF1.position.y=-0.06*hk;thumbG.add(thumbF1);const thumbJG=F.gruppe();thumbJG.position.set(0,-0.12*hk,0);reg('tB_'+(sd===1?'1':'-1'),thumbJG);thumbJG.add(s(0.06*hk,matSkin,[0.8,0.8,0.8]));const thumbTip=c(0.05*hk,0.04*hk,0.08*hk,matSkin);thumbTip.position.y=-0.04*hk;thumbJG.add(thumbTip);thumbG.add(thumbJG);palmG.add(thumbG);hand.userData.thumbs.push({mcp:thumbG,ip:thumbJG});
        hand.position.set(sd*0.05,wY-0.3*hk,0);elbowG.add(hand);reg('hand'+(sd===1?'1':'-1'),hand);
        armG.rotation.z=sd*0.2;armG.rotation.x=0.05;armG.userData.baseRotZ=sd*0.2;armG.userData.baseRotX=0.05;torsoG.add(armG);});
        [-1,1].forEach(sd=>{const n='deltoid'+(sd===1?'1':'-1'),d=parts[n],SU=MENSCH_GESTALT.schulter;d.position.set(sd*SU.aussen,-SU.tiefer,0);d.scale.set(SU.breit,1.1*SU.hoch,SU.tief);base[n]={x:d.scale.x,y:d.scale.y,z:d.scale.z};});   // w21-leib-bau: die schulter-kappe haengt unter der schulterhoehe (die kugel um das gelenk ragte 0.34 E darueber, ueber das kinn)
        const headGroup=F.gruppe();headGroup.position.y=KL.posY-trochanterY;reg('head',headGroup);var HEAD_S=KL.S,HEAD_B=KL.B;headGroup.scale.set(HEAD_S*HEAD_B,HEAD_S,HEAD_S);base.headPosY=KL.posY;const nY=noseY-MENSCH_GESTALT.gesicht.naseTiefer,bY=browY+MENSCH_GESTALT.gesicht.brauHoch;const UG=MENSCH_GESTALT.gesicht.unten,lipY=nY+(lipY0-nY)*UG-MENSCH_GESTALT.gesicht.mundTiefer,chinY=nY+(chinY0-nY)*UG,jawY=nY+(jawY0-nY)*UG;const SH=MENSCH_GESTALT.schaedel.hoch;   // w21-leib-bau: der scheitel steht auf H, der kopf misst den kanon (_kopfLage; vorher hielt die pivot-korrektur das KINN und der kopf wuchs ueber H)
        const skull=s(skullBaseR*1.03,matSkin,[1.0,1.12+SH/(2*skullBaseR*1.03),1.0]);skull.position.y=skullCY+SH/2;headGroup.add(skull);
        [-1,1].forEach(sd=>{const t=s(0.2,matSkin,[0.62,1.05,0.85]);t.position.set(sd*0.36,headSeg*0.48,0);headGroup.add(t);});
        const forehead=s(0.13,matSkin,[1.35,0.95,0.72]);forehead.position.set(0,(browY+hairlineY)/2,0.26);forehead.rotation.x=0.2;headGroup.add(forehead);
        const glabella=s(0.05,matSkin,[0.8,0.6,1.0]);glabella.position.set(0,bY+0.06,0.38);headGroup.add(glabella);
        const browRidge=s(0.15,matSkin,[2.0,0.42,0.72]);browRidge.position.set(0,bY,0.36);headGroup.add(browRidge);
        const AU=MENSCH_GESTALT.auge,aD=eyeDist*AU.abstand,aS=AU.mass*AU.hoehle;[-1,1].forEach(sd=>{const sock=s(0.145*aS,matSocket,[1.0/HEAD_B,0.88,0.50]);sock.position.set(sd*aD/2,eyeY,0.3+0.145*0.5*(1-aS)-AU.zurueck);headGroup.add(sock);});
        [-1,1].forEach(sd=>{const e=F.gruppe();e.add(s(0.12,matEye,[1,1.1,1]));const iris=s(0.07,matIris,[0.8,AU.iris.hoch,0.8]);iris.position.z=AU.iris.vor;e.add(iris);const pupil=s(0.04*AU.pupille,matPupil);pupil.position.z=AU.iris.vor+0.06-0.04*AU.pupille;e.add(pupil);e.add(s(0.13,matCornea,[1,1.1,1]));const lidT=s(0.14,matSkin,[1.15,0.35,0.9]);lidT.position.y=0.07+AU.lid[0];e.add(lidT);const lidB=s(0.14,matSkin,[1.15,0.45,0.95]);lidB.position.y=-0.09-AU.lid[1];e.add(lidB);e.scale.set(AU.mass/HEAD_B,AU.mass,AU.mass);e.position.set(sd*aD/2,eyeY,0.32+0.12*(1-AU.mass)*0.85-AU.zurueck);headGroup.add(e);if(sd<0){eyeL=reg('eyeL',e);irisL=reg('irisL',iris);lidTL=reg('lidTL',lidT);lidBL=reg('lidBL',lidB);}else{eyeR=reg('eyeR',e);irisR=reg('irisR',iris);lidTR=reg('lidTR',lidT);lidBR=reg('lidBR',lidB);}});
        [-1,1].forEach(sd=>{const g=F.gruppe();const bone=reg('cheekbone'+(sd===1?'1':'-1'),s(0.13,matSkin,[1.15,0.52,0.72]));bone.position.set(sd*0.22,eyeY-0.04,0.27);bone.rotation.y=sd*0.12;bone.rotation.z=sd*-0.05;g.add(bone);headGroup.add(g);});
        [-1,1].forEach(sd=>{const b=reg('buccal'+(sd===1?'1':'-1'),s(0.14,matSkin,[0.75*MENSCH_GESTALT.gesicht.wange,0.65*MENSCH_GESTALT.gesicht.wange,0.5*MENSCH_GESTALT.gesicht.wange]));b.position.set(sd*0.18,(cheekY+jawY)/2,0.22);headGroup.add(b);});
        const GS=MENSCH_GESTALT.gesicht;const maxilla=s(0.15,matSkin,[0.75,0.88,0.85*GS.oberkiefer]);maxilla.position.set(0,(lipY+nY)/2,0.325-0.15*0.85*(1-GS.oberkiefer));headGroup.add(maxilla);
        [-1,1].forEach(sd=>{const nl=c(0.008,0.005,0.12,matShadow);nl.position.set(sd*0.09,(lipY+nY)/2,0.38);nl.rotation.z=sd*-0.6;headGroup.add(nl);});
        const jawBody=reg('jaw',s(0.31,matSkin,[0.85*MENSCH_GESTALT.gesicht.kieferBreite,0.7*MENSCH_GESTALT.gesicht.kiefer,0.8*MENSCH_GESTALT.gesicht.kieferTiefe]));jawBody.position.set(0,jawY,0.15);headGroup.add(jawBody);
        [-1,1].forEach(sd=>{const g=reg('gonion'+(sd===1?'1':'-1'),s(0.1,matSkin,[0.7,0.85,0.8]));g.position.set(sd*jawW/2,jawY+0.02,0.03);headGroup.add(g);});
        [-1,1].forEach(sd=>{const r=c(0.05,0.06,0.2,matSkin);r.position.set(sd*jawW/2+0.03,cheekY+0.04,0.0);r.rotation.z=sd*0.08;headGroup.add(r);});
        [-1,1].forEach(sd=>{const m=reg('masseter'+(sd===1?'1':'-1'),s(0.08,matSkin,[0.4,1.1,0.6]));m.position.set(sd*0.2,(cheekY+jawY)/2,0.16);headGroup.add(m);});
        const chin=reg('chin',s(chinW/2,matSkin,[1.3,0.9,1.1]));chin.position.set(0,chinY,0.35-MENSCH_GESTALT.gesicht.kinnZurueck);headGroup.add(chin);
        const chinLine=s(0.03,matSkin,[0.6,2.0,0.8]);chinLine.position.set(0,chinY+0.04,0.38-MENSCH_GESTALT.gesicht.kinnZurueck);headGroup.add(chinLine);
        const noseBridge=reg('noseBr',c(0.04,0.06,(bY-nY)*1.1,matSkin));noseBridge.position.set(0,(bY+nY)/2,0.4);headGroup.add(noseBridge);
        const noseTip=reg('noseTip',s(0.055,matSkin,[1.2,1,1.2]));noseTip.position.set(0,nY,0.45);headGroup.add(noseTip);
        [-1,1].forEach(sd=>{const n2=reg('noseA'+(sd===1?'1':'-1'),s(0.035,matSkin,[1,0.5,1]));n2.position.set(sd*0.05,nY-0.04,0.43);headGroup.add(n2);});
        const upperLip=s(0.12,matLips,[1.22,0.42*GS.lippe,0.62*GS.lippe]);upperLip.position.set(0,lipY+0.02,0.415-GS.lippeZurueck);headGroup.add(upperLip);upperLipRef=upperLip;
        const lowerLip=s(0.14,matLips,[1.12,0.48*GS.lippe,0.64*GS.lippe]);lowerLip.position.set(0,lipY-0.052*GS.lippe,0.405-GS.lippeZurueck);headGroup.add(lowerLip);lowerLipRef=lowerLip;
        const philtrum=s(0.03,matShadow,[0.5,1.0,0.8]);philtrum.position.set(0,lipY+0.08,0.41-GS.lippeZurueck);headGroup.add(philtrum);
        [-1,1].forEach(sd=>{const mc=s(0.025,matSkin,[0.8,0.8,1.0]);mc.position.set(sd*0.095,lipY-0.01,0.39-GS.lippeZurueck);headGroup.add(mc);});
        [-1,1].forEach(sd=>{const e=F.gruppe();const helix=s(0.12,matSkin,[0.35,1.7,0.95]);e.add(helix);const concha=s(0.09,matSocket,[0.55,0.95,0.5]);concha.position.set(sd*-0.02,0.0,0.03);e.add(concha);const tragus=s(0.042,matSkin,[0.6,0.75,0.5]);tragus.position.set(sd*-0.065,-0.03,0.07);e.add(tragus);const lobe=s(0.055,matSkin,[0.5,0.75,1]);lobe.position.set(sd*-0.01,-0.17,0.02);e.add(lobe);e.position.set(sd*0.43,eyeY-0.04-MENSCH_GESTALT.ohr.tiefer,-0.03);e.scale.setScalar(MENSCH_GESTALT.ohr.mass);e.rotation.y=sd*-0.45;headGroup.add(e);});
        [-1,1].forEach(sd=>{const g=F.gruppe();for(let i=0;i<5;i++){const b=c(0.012,0.012,0.07,matHair);b.position.set((i-2)*0.032,-Math.abs(i-2)*0.008,0);b.rotation.z=sd*0.2;g.add(b);}g.position.set(sd*aD/2,bY+0.03,0.35);g.rotation.z=sd*-0.1;headGroup.add(g);if(sd<0)browL=g;else browR=g;});
        torsoG.add(headGroup);
        _kanonAuf(parts, base, [adamsApple, nape], kugeln);

        return {
            character,
            parts,
            base,
            kugeln,
            augen: { eyeL, eyeR, irisL, irisR, lidTL, lidTR, lidBL, lidBR, browL, browR, upperLipRef, lowerLipRef },
            // Zwei un-registrierte Teile, die die Shell nach dem Bau weiter anfasst
            // (Kehlkopf + Nacken — Anim/Outfit lesen sie direkt; der Hals-Deckel fiel mit w21-leib-bau):
            extra: { adamsApple: adamsApple, nape: nape },
        };
    }

    // KONVERGENZ-WELLE — DIE MORPH-ANWENDUNG ist Gesetz: morphAuf(B, dials) trägt
    // labMorph auf den bauMensch-Baum (WELCHER Teil WELCHE Formel — die Tabelle,
    // die vorher nur in der Shell lebte; verbatim aus morph() Z.1681 gewandert).
    // B = {character, parts, base} (bauMensch-Rückgabe, THREE- ODER Daten-Knoten —
    // es werden nur .scale.set/.position/.rotation/.userData berührt). Gibt M
    // (labMorph-Ergebnis) zurück. Beide Leser rufen DIES: die Shell (THREE) und
    // der Stamm (Daten-Knoten → Metaball-Haut).
    function morphAuf(B, dials) {
        const _P = labProportionen();
        const baseArmX = _P.baseArmX, trochanterY = _P.trochanterY;
        const character = B.character, parts = B.parts, base = B.base;
        const M = labMorph(dials);
        character.scale.set(M.charScale.x,M.charScale.y,M.charScale.z);const MU=M.shell;function aply(m,sc){m.scale.set(sc.x,sc.y,sc.z);return sc;}if(parts.ribcage)parts.ribcage.userData.baseScaleY=aply(parts.ribcage,MU.ribcage(base.ribcage)).y;if(parts.pelvis)aply(parts.pelvis,MU.pelvis(base.pelvis));if(parts.waist)aply(parts.waist,MU.waist(base.waist));function pair(name,fn){[-1,1].forEach(sd=>{const k=name+(sd===1?'1':'-1');if(parts[k])fn(parts[k],base[k],sd);});}if(parts.abs)parts.abs.userData.baseScaleY=aply(parts.abs,MU.abs(base.abs)).y;pair('oblique',(m,b)=>aply(m,MU.oblique(b)));pair('glute',(m,b)=>aply(m,MU.glute(b)));pair('quad',(m,b)=>{m.userData.baseScaleY=aply(m,MU.quad(b)).y;});pair('hamstring',(m,b)=>aply(m,MU.hamstring(b)));pair('calf',(m,b)=>{m.userData.baseScaleY=aply(m,MU.calf(b)).y;});pair('bicep',(m,b)=>{m.userData.baseScaleY=aply(m,MU.bicep(b)).y;});pair('tricep',(m,b)=>aply(m,MU.tricep(b)));pair('uarm',(m,b)=>aply(m,MU.uarm(b)));pair('forearm',(m,b)=>aply(m,MU.forearm(b)));pair('deltoid',(m,b)=>aply(m,MU.deltoid(b)));pair('trap',(m,b)=>aply(m,MU.trap(b)));pair('lat',(m,b)=>aply(m,MU.lat(b)));if(parts.upperBack)aply(parts.upperBack,MU.upperBack(base.upperBack));if(parts.chest){var csc=aply(parts.chest,MU.chest(base.chest));parts.chest.userData.baseScaleX=csc.x;parts.chest.userData.baseScaleY=csc.y;parts.chest.userData.baseScaleZ=csc.z;}pair('pec',(m,b)=>aply(m,MU.pec(b)));pair('breast',(m,b)=>aply(m,MU.breast(b)));if(parts.neckMain)aply(parts.neckMain,MU.neck(base.neckMain));if(parts.neckBase)aply(parts.neckBase,MU.neck(base.neckBase));pair('scm',(m,b)=>aply(m,MU.neck(b)));pair('tneck',(m,b)=>aply(m,MU.neck(b)));if(parts.jaw)aply(parts.jaw,MU.jaw(base.jaw));if(parts.chin)aply(parts.chin,MU.chin(base.chin));pair('buccal',(m,b)=>aply(m,MU.buccal(b)));pair('cheekbone',(m,b)=>aply(m,MU.cheekbone(b)));pair('masseter',(m,b)=>aply(m,MU.masseter(b)));[-1,1].forEach(sd=>{const k='arm'+(sd===1?'1':'-1');if(parts[k]){parts[k].position.x=sd*baseArmX*M.armPose.xMul;const bz=sd*M.armPose.rotZ;const bx=M.armPose.rotX;parts[k].rotation.z=bz;parts[k].rotation.x=bx;parts[k].userData.baseRotZ=bz;parts[k].userData.baseRotX=bx;}});[-1,1].forEach(sd=>{const k='hip'+(sd===1?'1':'-1');if(parts[k])parts[k].position.x=sd*_P.hipHW*MENSCH_GESTALT.bein.abstand*M.beinPose.xMul;});if(parts.head){parts.head.position.y=base.headPosY-trochanterY-M.headPose.ageDrop;parts.head.position.z=M.headPose.fwd;}
        _armRuhe(B);
        gesichtAuf(B, dials);
        return M;
    }

    // DIE RUHE DER ARME (w11-koerper — der Arm hängt außerhalb des Rumpfs, in jedem Körperbau). Jedes Glied hängt unter der
    // Schwere, bis es den Rumpf berührt: der Oberarm am Schulter-Gelenk (die kleinste Abspreizung ab dem Winkel des Labors,
    // labMorph armPose.rotZ), dann der Unterarm samt Hand am Ellbogen (der Tragewinkel, die kleinste Neigung nach außen bis
    // `ellbogenRad`; reicht sie nicht, spreizt die Schulter weiter) — je Glied, bis jede seiner Kugeln jenseits der Schulter-Naht
    // (`naht` des Oberarms, Gelenk → Ellbogen; der Deltamuskel IST die Naht) `luft` Abstand zu jeder Kugel von Becken, Bauch und
    // Brust hält. Das weiche Gewebe (`weicht`, je Teil seine Press-Grenze: der Muskel des Brustkorbs — Brustkorb, Brust, Rücken,
    // Latissimus, Trapez — bis 0,5 seiner Breite, das Fett von Bauch und Flanke bis 0,8; das Becken ist Knochen) gibt unter dem
    // Arm nach, bevor das Gelenk spreizt: die Winkel gelten dem gepressten Rumpf (der KERN) — der Latissimus reichte am
    // Labor-Kern 0,27 E über das Gelenk hinaus, der Brustkorb war so breit wie die Schultern: kein Winkel unter 60° zog den Arm
    // heraus, und der Bauch bei mass 1 spreizte ihn ungepresst auf 51°. Danach behält das Gewebe seine Breite: es weicht nur
    // dort, wo der Arm aufliegt (`armAnlage`, im Ofen) — bis w12-arme schmälerte die Ruhe jedes weiche Teil im Ganzen (scale.x),
    // der Bauch verlor vorn sein Volumen, die Kugeln darunter zeichneten sich ab. `luft` = die Hülle des ARMS (Haut und Stoff
    // aus der Haut über seinen Kugeln, am Guss jenseits des Saums gemessen: START p90 0,11 E, höchstens 0,13): der Arm ruht mit
    // seiner Hülle am Kern des Rumpfs. Was der Rumpf darüber trägt — Haut, Stoff, das Fett-Depot (studios.K1) — und das Depot
    // des Arms halten ihn nicht, sie weichen dem aufliegenden Arm: bis w12-arme hielt die Ruhe die Hüllen BEIDER Seiten (0,24) und
    // das Depot obendrauf — die muskulöse Frau bei mass 1 (tone 1, gender 0) spreizte 43° (ohne Depot) bis 54° (mit), am Gitter
    // mass × tone × age × gender höchstens 21° mit der Hülle des Arms allein. Der Abstand je Punkt ist die erste Ordnung des Ellipsoids (f/|∇f|). Leser: der
    // Ofen (bakeMenschInstance: Guss, Gelenke, Bind-Pose), das Labor, die Linse (gate:koerper-kern Teil R).
    var ARM_RUHE = Object.freeze({
        naht: 0.25,
        luft: 0.12,
        faelltAb: 0.1, // die Anlage: ein Stoff, dessen Lage so weit (E) über der Haut steht, fällt über den Arm (der Poncho 0,12; der Stoff aus der Haut ≤ 0,032)
        ueber: 0.3, // die Anlage: eine Ecke des fallenden Stoffs (der Poncho), von der aus die Mitte des Leibs um mehr als diesen Anteil IN den Arm zeigt, liegt über ihm und bleibt
        spalt: 0.02, // die Anlage: so weit (E, ~6 mm, zwei Luft-Breiten des Tuch-Gesetzes) liegt die gewichene Rumpf-Hülle über dem Arm
        rand: 0.3, // so weit (E, ~8,5 cm, längs der Fläche) entspannt sich das Gewebe um die gewichenen Ecken
        entspannen: 16, // Runden der Entspannung
        bisRad: 1.2, // höchstens so weit (rad) spreizt die Schulter
        ellbogenRad: 0.3, // der Tragewinkel des Ellbogens höchstens (rad, ~17°)
        stellen: 14, // Halbierungen je Winkel
        proben: 160, // Punkte je Kugel (Fibonacci-Kugel; der Oberarm ist ein langes Ellipsoid)
        // je Paar die rechte Seite (die linke folgt ihr): die Press-Grenze ihrer Breite
        weicht: Object.freeze({ ribcage: 0, chest: 0, upperBack: 0, lat1: 0, pec1: 0, trap1: 0, waist: 0.7, abs: 0.7, oblique1: 0.7, breast1: 0.5, pelvis: 0.7, glute1: 0.7 }),
        klassen: Object.freeze(["skin", "shorts", "joint"]),
        // das Urteil am Guss (`armRuheUrteil`): der Saum der Hülle an der Naht (Teil des Oberarms: der Deltamuskel fließt über
        // Feld-Unschärfe und Haut-Abstand ~0,06 E in den Rücken — dort ist die Hülle EINE Fläche) und die Körper, an denen es gilt
        saum: 0.05,
        // die Bänder des Urteils (gate:mensch-anatomie RUHE): keine Arm-Ecke im Rumpf, die Abspreizung der Ruhe höchstens 25°
        innen: Object.freeze([0, 0]),
        durch: Object.freeze([0, 0]), // keine Ecke der Rumpf-Haut liegt über dem Stoff des Rumpfs (`durchM` der Umkreis, `durchH` die Höhe, E)
        durchM: 0.06,
        durchH: 0.004,
        innenStand: Object.freeze([0, 0]), // dasselbe in der Stand-Pose der Welt (`leibGussGestellt`: L0 je Körper, die Vorlage der Menge)
        spreizGrad: Object.freeze([0, 25]),
        koerper: Object.freeze([{}, { mass: 1, tone: 1, age: 0, gender: 0 }, { mass: 1, tone: 0, age: 1, gender: 1 }, { mass: 0, tone: 1, age: 0, gender: 0 }, { mass: 0, tone: 0, age: 1, gender: 1 }]),
    });
    // Die affine Lage eines Knotens in seinem Eltern (3×4 spaltenweise: drei Achsen, dann die Lage; Euler XYZ wie die Gelenke)
    function _affin(n) {
        var q = _qEuler(n.rotation.x, n.rotation.y, n.rotation.z),
            x = q[0], y = q[1], z = q[2], w = q[3],
            sx = n.scale.x, sy = n.scale.y, sz = n.scale.z;
        return [
            (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx,
            2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy,
            2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz,
            n.position.x, n.position.y, n.position.z,
        ];
    }
    function _affMul(A, B) {
        var C = new Array(12);
        for (var c = 0; c < 4; c++)
            for (var r = 0; r < 3; r++) C[3 * c + r] = A[r] * B[3 * c] + A[3 + r] * B[3 * c + 1] + A[6 + r] * B[3 * c + 2] + (c === 3 ? A[9 + r] : 0);
        return C;
    }
    // die Lage im Raum der Gestalt (unter `wurzel`, ohne ihre eigene Lage)
    function _affVon(n, wurzel) {
        var M = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
        for (; n && n !== wurzel; n = n.parent) M = _affMul(_affin(n), M);
        return M;
    }
    var _ARM_RICHTUNG = null;
    function _armRuhe(B) {
        if (!B || !Array.isArray(B.kugeln)) throw new Error("morphAuf: der Baum trägt keine Kugeln (bauMensch) — die Ruhe der Arme folgt dem Gesetz");
        if (!B.kugeln.length) return; // ein Baum ohne Gestalt (die Morph-Probe der Linse): kein Kontakt
        var A = ARM_RUHE,
            P = B.parts,
            W = B.character,
            i;
        ["arm1", "arm-1", "elbow1", "elbow-1", "deltoid1"].forEach(function (nm) {
            if (!P[nm]) throw new Error("morphAuf: der Arm ohne " + nm + " — die Ruhe der Arme braucht Schulter, Ellbogen und Naht");
        });
        if (!_ARM_RICHTUNG) {
            _ARM_RICHTUNG = [];
            for (i = 0; i < A.proben; i++) {
                var th = Math.acos(1 - (2 * (i + 0.5)) / A.proben),
                    ph = i * 2.399963229728653;
                _ARM_RICHTUNG.push([Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)]);
            }
        }
        // wem gehört eine Kugel: dem Oberarm oder dem Unterarm samt Hand (rechts, ohne den Deltamuskel), dem weichen Gewebe (je
        // benannter Teil der rechten Seite), dem Rumpf; die linke Seite misst der linke Arm (gespiegelt: sie folgt der rechten)
        var unter = function (n, teil) {
            for (; n; n = n.parent) if (n === teil) return true;
            return false;
        };
        var paar = function (nm) {
            return /1$/.test(nm) && !/-1$/.test(nm) ? P[nm.slice(0, -1) + "-1"] : null;
        };
        var ober = [],
            unten = [],
            rumpf = [],
            weich = {};
        for (var wn in A.weicht) if (P[wn]) weich[wn] = [];
        B.kugeln.forEach(function (kg) {
            if (A.klassen.indexOf(kg.k) < 0) return;
            if (unter(kg.n, P.arm1)) {
                if (!unter(kg.n, P.deltoid1)) (unter(kg.n, P.elbow1) ? unten : ober).push(kg);
                return;
            }
            if (unter(kg.n, P["arm-1"]) || (P.head && unter(kg.n, P.head)) || (P.hip1 && unter(kg.n, P.hip1)) || (P["hip-1"] && unter(kg.n, P["hip-1"]))) return;
            for (var nm in weich) {
                if (unter(kg.n, P[nm])) return void weich[nm].push(kg);
                if (paar(nm) && unter(kg.n, paar(nm))) return;
            }
            rumpf.push(kg);
        });
        // ein Ellipsoid: die Inverse seiner Achsen (zeilenweise) und seine Lage; der Abstand eines Punkts in erster Ordnung
        var ellipsoid = function (kg) {
            var M = _affVon(kg.n, W),
                R = kg.r * Math.max(Math.hypot(M[0], M[1], M[2]), Math.hypot(M[3], M[4], M[5]), Math.hypot(M[6], M[7], M[8]));
            return { li: _m3inv(M, 0, new Float64Array(9)), t: [M[9], M[10], M[11]], r: kg.r, R2: (R + A.luft) * (R + A.luft) };
        };
        var abstand = function (e, x, y, z) {
            var dx = x - e.t[0], dy = y - e.t[1], dz = z - e.t[2], L = e.li;
            var qx = L[0] * dx + L[1] * dy + L[2] * dz, qy = L[3] * dx + L[4] * dy + L[5] * dz, qz = L[6] * dx + L[7] * dy + L[8] * dz;
            var l = Math.sqrt(qx * qx + qy * qy + qz * qz) || 1e-9;
            var gx = (L[0] * qx + L[3] * qy + L[6] * qz) / l, gy = (L[1] * qx + L[4] * qy + L[7] * qz) / l, gz = (L[2] * qx + L[5] * qy + L[8] * qz) / l;
            return (l - e.r) / (Math.sqrt(gx * gx + gy * gy + gz * gz) || 1e-9);
        };
        // die Punkte der Kugeln eines Glieds jenseits der Naht (in der Lage, die der Arm gerade trägt)
        var punkte = function (glied) {
            var S = _affVon(P.arm1, W), E = _affVon(P.elbow1, W),
                ax = E[9] - S[9], ay = E[10] - S[10], az = E[11] - S[11], l2 = ax * ax + ay * ay + az * az,
                out = [];
            glied.forEach(function (kg) {
                var M = _affVon(kg.n, W);
                for (var j = 0; j < _ARM_RICHTUNG.length; j++) {
                    var d = _ARM_RICHTUNG[j], ux = d[0] * kg.r, uy = d[1] * kg.r, uz = d[2] * kg.r,
                        x = M[0] * ux + M[3] * uy + M[6] * uz + M[9], y = M[1] * ux + M[4] * uy + M[7] * uz + M[10], z = M[2] * ux + M[5] * uy + M[8] * uz + M[11];
                    if (((x - S[9]) * ax + (y - S[10]) * ay + (z - S[11]) * az) / l2 >= A.naht) out.push(x, y, z);
                }
            });
            return out;
        };
        // hält jeder Punkt die Luft zu jedem Ellipsoid? (ein Punkt außerhalb der Hüllkugel + Luft hält sie ohne Rechnung)
        var haelt = function (pkt, E) {
            for (var k = 0; k < E.length; k++) {
                var e = E[k];
                for (var p = 0; p < pkt.length; p += 3) {
                    var dx = pkt[p] - e.t[0], dy = pkt[p + 1] - e.t[1], dz = pkt[p + 2] - e.t[2];
                    if (dx * dx + dy * dy + dz * dz < e.R2 && abstand(e, pkt[p], pkt[p + 1], pkt[p + 2]) < A.luft) return false;
                }
            }
            return true;
        };
        // das Gelenk eines Glieds: der kleinste Winkel in [von, bis], in dem das Glied die Luft hält (bis, wenn keiner)
        var gelenk = function (setze, von, bis, glied, E) {
            setze(von);
            if (haelt(punkte(glied), E)) return von;
            var lo = von,
                hi = bis;
            for (var k = 0; k < A.stellen; k++) {
                var mid = 0.5 * (lo + hi);
                setze(mid);
                if (haelt(punkte(glied), E)) hi = mid;
                else lo = mid;
            }
            setze(hi);
            return hi;
        };
        var schulter = function (th) {
            P.arm1.rotation.z = th;
            P.arm1.userData.baseRotZ = th;
            P["arm-1"].rotation.z = -th;
            P["arm-1"].userData.baseRotZ = -th;
        };
        var ellbogen = function (ph) {
            P.elbow1.rotation.z = ph;
            P["elbow-1"].rotation.z = -ph;
        };
        // die Breite eines weichen Teils als Anteil f seiner Breite aus labMorph (die linke Seite wie die rechte)
        var voll = {};
        for (var wn2 in weich) voll[wn2] = P[wn2].scale.x;
        var breite = function (nm, f) {
            [P[nm], paar(nm)].forEach(function (t) {
                if (!t) return;
                t.scale.x = voll[nm] * f;
                if (t.userData && t.userData.baseScaleX != null) t.userData.baseScaleX = t.scale.x;
            });
        };
        // 0) das Gewebe gepresst: die Winkel gelten dem Rumpf an seiner Press-Grenze (ein Teil, das ganz weicht, ist kein Hindernis)
        var hindernis = rumpf.slice();
        for (var pn in weich)
            if (A.weicht[pn] > 0) {
                breite(pn, A.weicht[pn]);
                hindernis = hindernis.concat(weich[pn]);
            }
        var rE = hindernis.map(ellipsoid),
            th0 = P.arm1.rotation.z;
        // 1) der Oberarm an der Schulter, 2) Unterarm und Hand am Ellbogen; reicht der Tragewinkel nicht, die Schulter weiter
        var ths = gelenk(schulter, th0, A.bisRad, ober, rE);
        var phe = gelenk(ellbogen, 0, A.ellbogenRad, unten, rE);
        if (!haelt(punkte(unten), rE)) {
            ellbogen(A.ellbogenRad);
            gelenk(schulter, ths, A.bisRad, ober.concat(unten), rE);
        } else ellbogen(phe);
        // 3) das Gewebe behält seine Breite: es weicht dem hängenden Arm nur dort, wo er aufliegt (die Anlage im Ofen, `armAnlage`)
        for (var nm in weich) breite(nm, 1);
    }

    // DAS URTEIL DER RUHE (gate:mensch-anatomie RUHE): am Guss (Ofen L0, die Bind-Pose, die Welt und Labor zeichnen) liegt keine
    // Arm-Ecke in der Rumpf-Hülle — gemessen mit dem Gesetz der Kleidung (`tuchDrapieren`: die Haut bleibt innen, eine Ecke unter
    // `luftM` über der Halb-Ebene der nächsten Haut-Ecken wird gehoben): der Arm ist das Tuch, der Rumpf die Haut. Arm-Ecke =
    // Gewicht an Schulter, Ellbogen oder Hand > 0,5, jenseits der Naht plus dem Saum der Hülle (ARM_RUHE.saum); Rumpf = Gewicht an Rumpf und Wurzel > 0,5
    // (Haut und Stoff aus der Haut). Antwort: { innen, arm } (Ecken) und `spreizGrad`, die Abspreizung der Ruhe (Schulter → Ellbogen
    // gegen das Lot, die größere Seite; Band ARM_RUHE.spreizGrad). Die Gelenke liegen im Raum der Gestalt (ohne die Wurzel).
    function armRuheUrteil(g) {
        var sk = g.userData.__skelett,
            J = {};
        sk.joints.forEach(function (j) {
            J[j.name] = j;
        });
        var lage = function (n) {
            var p = [0, 0, 0];
            for (var j = J[n]; j && j.name !== sk.root; j = J[j.parent]) p = _add(_qRot(j.quat, [p[0] * j.scale[0], p[1] * j.scale[1], p[2] * j.scale[2]]), j.pos);
            return p;
        };
        var arm = [],
            rumpf = [],
            nrm = [],
            hautR = [],
            stoffR = [];
        g.traverse(function (o) {
            var a = o.isMesh && o.geometry.attributes,
                kl = o.material && o.material.userData ? String(o.material.userData.__klasse || "") : "";
            for (var i = 0; a && a.skinIndex && i < a.position.count; i++) {
                var wa = 0,
                    wr = 0;
                for (var k = 4 * i; k < 4 * i + 4; k++) {
                    var nm = sk.skinJoints[a.skinIndex.array[k]];
                    if (/^(arm|elbow|hand)/.test(nm)) wa += a.skinWeight.array[k];
                    if (nm === "torso" || nm === sk.root) wr += a.skinWeight.array[k];
                }
                var p = [a.position.getX(i), a.position.getY(i), a.position.getZ(i)],
                    sd = p[0] > 0 ? "1" : "-1",
                    S = lage("arm" + sd),
                    E = _sub(lage("elbow" + sd), S);
                if (wa > 0.5 && _dot(_sub(p, S), E) / _dot(E, E) >= ARM_RUHE.naht + ARM_RUHE.saum) arm.push(p[0], p[1], p[2]);
                if (wr > 0.5) {
                    rumpf.push(p[0], p[1], p[2]);
                    nrm.push(a.normal.getX(i), a.normal.getY(i), a.normal.getZ(i));
                    if (kl === "haut" && p[1] < S[1] + ARM_RUHE.naht * E[1]) hautR.push(p[0], p[1], p[2]);
                    else if (kl.indexOf("stoff_") === 0) stoffR.push(p[0], p[1], p[2], a.normal.getX(i), a.normal.getY(i), a.normal.getZ(i));
                }
            }
        });
        // DIE HAUT DURCH DEN STOFF (w28-mensch-samen, ARM_RUHE.durch): die Ecken der Rumpf-Haut unter der Naht des Arms (der Kragen liegt darüber), die über der
        // nächsten Ecke eines Stoffs des Rumpfs liegen (näher als `durchM`, längs deren Normale höher als `durchH`) — die Lagen
        // des Rumpfs stehen in ihrer Folge (Stoff über Haut), auch in der Mulde unter dem Arm
        var Zd = ARM_RUHE.durchM,
            raster = {},
            durch = 0,
            zelle = function (x, y, z) {
                return Math.floor(x / Zd) + "," + Math.floor(y / Zd) + "," + Math.floor(z / Zd);
            };
        for (var c = 0; c < stoffR.length; c += 6) (raster[zelle(stoffR[c], stoffR[c + 1], stoffR[c + 2])] || (raster[zelle(stoffR[c], stoffR[c + 1], stoffR[c + 2])] = [])).push(c);
        for (var h = 0; h < hautR.length; h += 3) {
            var bd = Zd * Zd,
                bi = -1;
            for (var dx = -1; dx <= 1; dx++)
                for (var dy = -1; dy <= 1; dy++)
                    for (var dz = -1; dz <= 1; dz++) {
                        var L = raster[zelle(hautR[h] + dx * Zd, hautR[h + 1] + dy * Zd, hautR[h + 2] + dz * Zd)];
                        for (var e = 0; L && e < L.length; e++) {
                            var q = L[e],
                                d2 = (stoffR[q] - hautR[h]) * (stoffR[q] - hautR[h]) + (stoffR[q + 1] - hautR[h + 1]) * (stoffR[q + 1] - hautR[h + 1]) + (stoffR[q + 2] - hautR[h + 2]) * (stoffR[q + 2] - hautR[h + 2]);
                            if (d2 < bd) (bd = d2), (bi = q);
                        }
                    }
            if (bi >= 0 && (hautR[h] - stoffR[bi]) * stoffR[bi + 3] + (hautR[h + 1] - stoffR[bi + 1]) * stoffR[bi + 4] + (hautR[h + 2] - stoffR[bi + 2]) * stoffR[bi + 5] > ARM_RUHE.durchH) durch++;
        }
        var netz = function (P, N) {
            return { bindMatrix: { elements: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }, geometry: { attributes: { position: { array: Float64Array.from(P), count: P.length / 3 }, normal: { array: Float64Array.from(N) } } } };
        };
        var grad = Math.max.apply(null, ["1", "-1"].map(function (sd) {
            var d = _sub(lage("elbow" + sd), lage("arm" + sd));
            return (Math.atan2(Math.abs(d[0]), -d[1]) * 180) / Math.PI;
        }));
        return { innen: tuchDrapieren([netz(arm, arm)], [netz(rumpf, nrm)], leibMassstab()), arm: arm.length / 3, spreizGrad: Math.round(grad * 10) / 10, durch: durch };
    }

    // DER GUSS IN EINER POSE (w28-mensch-samen — das Urteil der Ruhe an der Stand-Zeile, gate:mensch-anatomie RUHE): die Gelenke
    // des Skeletts als Daten-Knoten in ihrer Ruhe, darauf das Rig der Welt (`leibRig`); `stelle(rig)` stellt es, wie der Wirt
    // seinen Leib stellt. Jede geskinnte Ecke folgt ihren Gelenken (die LBS-Formel des Ofens: Σ Gewicht × Pose × Ruhe⁻¹, im Raum
    // der Gestalt, ohne die Wurzel). Rückgabe: ein Guss derselben Form — Ecken, Normalen, Gewichte, das Skelett mit den
    // gestellten Gelenken —, den die Urteile am Guss lesen wie den des Ofens (`armRuheUrteil`). Bis hier urteilte die Ruhe nur an
    // der Bind-Pose: die Welt zeichnete sie in keinem Bild (die Pose stellte die Arme in den Rumpf, das Urteil blieb GRÜN).
    function leibGussGestellt(g, stelle) {
        var sk = g.userData.__skelett,
            kn = {};
        sk.joints.forEach(function (j) {
            var q = j.quat,
                m13 = 2 * (q[0] * q[2] + q[1] * q[3]),
                frei = Math.abs(m13) < 0.9999999;
            // die Ruhe als Euler XYZ (die Ordnung der Gelenke, `_qEuler` rückwärts)
            kn[j.name] = {
                name: j.name,
                parent: null,
                position: { x: j.pos[0], y: j.pos[1], z: j.pos[2] },
                scale: { x: j.scale[0], y: j.scale[1], z: j.scale[2] },
                rotation: {
                    x: frei ? Math.atan2(-2 * (q[1] * q[2] - q[0] * q[3]), 1 - 2 * (q[0] * q[0] + q[1] * q[1])) : Math.atan2(2 * (q[1] * q[2] + q[0] * q[3]), 1 - 2 * (q[0] * q[0] + q[2] * q[2])),
                    y: Math.asin(Math.max(-1, Math.min(1, m13))),
                    z: frei ? Math.atan2(-2 * (q[0] * q[1] - q[2] * q[3]), 1 - 2 * (q[1] * q[1] + q[2] * q[2])) : 0,
                    set: function (x, y, z) {
                        this.x = x;
                        this.y = y;
                        this.z = z;
                    },
                },
            };
        });
        var wurzel = kn[sk.root];
        sk.joints.forEach(function (j) {
            if (j.name !== sk.root) kn[j.name].parent = kn[j.parent] || wurzel;
        });
        var lagen = function () {
            return sk.skinJoints.map(function (nm) {
                return _affVon(kn[nm], wurzel);
            });
        };
        var ruhe = lagen().map(function (M) {
            return { li: _m3inv(M, 0, new Float64Array(9)), t: [M[9], M[10], M[11]] };
        });
        stelle(leibRig(kn));
        var pose = lagen(),
            netze = [];
        var puffer = function (arr) {
            return {
                array: arr,
                count: arr.length / 3,
                getX: function (i) {
                    return arr[3 * i];
                },
                getY: function (i) {
                    return arr[3 * i + 1];
                },
                getZ: function (i) {
                    return arr[3 * i + 2];
                },
            };
        };
        g.traverse(function (o) {
            var a = o.isMesh && o.geometry.attributes;
            if (!a || !a.skinIndex) return;
            var n = a.position.count,
                P = new Float32Array(3 * n),
                N = new Float32Array(3 * n);
            for (var i = 0; i < n; i++) {
                var v = [a.position.getX(i), a.position.getY(i), a.position.getZ(i)],
                    nv = [a.normal.getX(i), a.normal.getY(i), a.normal.getZ(i)];
                for (var k = 4 * i; k < 4 * i + 4; k++) {
                    var w = a.skinWeight.array[k];
                    if (!w) continue;
                    var b = a.skinIndex.array[k],
                        L = ruhe[b].li,
                        M = pose[b];
                    // die Ecke im Raum ihres Gelenks (Ruhe⁻¹), dann in seiner Pose; die Normale mit den Achsen allein
                    for (var art = 0; art < 2; art++) {
                        var d = art ? nv : [v[0] - ruhe[b].t[0], v[1] - ruhe[b].t[1], v[2] - ruhe[b].t[2]],
                            lx = L[0] * d[0] + L[1] * d[1] + L[2] * d[2],
                            ly = L[3] * d[0] + L[4] * d[1] + L[5] * d[2],
                            lz = L[6] * d[0] + L[7] * d[1] + L[8] * d[2],
                            Z = art ? N : P;
                        for (var c = 0; c < 3; c++) Z[3 * i + c] += w * (M[c] * lx + M[3 + c] * ly + M[6 + c] * lz + (art ? 0 : M[9 + c]));
                    }
                }
                var nl = Math.hypot(N[3 * i], N[3 * i + 1], N[3 * i + 2]) || 1;
                for (var c2 = 0; c2 < 3; c2++) N[3 * i + c2] /= nl;
            }
            netze.push({ isMesh: true, material: o.material, geometry: { attributes: { position: puffer(P), normal: puffer(N), skinIndex: a.skinIndex, skinWeight: a.skinWeight } } });
        });
        var gelenke = sk.joints.map(function (j) {
            var k = kn[j.name];
            return j.name === sk.root ? j : { name: j.name, parent: j.parent, pos: [k.position.x, k.position.y, k.position.z], quat: _qEuler(k.rotation.x, k.rotation.y, k.rotation.z), scale: j.scale };
        });
        var skelett = {};
        for (var f in sk) skelett[f] = sk[f];
        skelett.joints = gelenke;
        return {
            userData: { __skelett: skelett },
            traverse: function (fn) {
                netze.forEach(fn);
            },
        };
    }

    // DIE RAND-RINGE einer Fläche (w21-leib-bau; Leser: der Ofen an der Naht der EINEN Haut, foundry-core `__leibHaut`, und
    // `leibUrteil`): die Kanten mit EINEM Dreieck, je Ring die Ecken in Umlauf-Folge (die Richtung der Rand-Kante in ihrem Dreieck),
    // die Ringe ab ihrer kleinsten Ecke. `I`: der Index der Dreiecke, flach.
    function randRinge(I) {
        var zahl = new Map(),
            nach = new Map(),
            ringe = [],
            gesehen = new Set();
        var kante = function (t, e) {
            var a = I[t + e],
                b = I[t + ((e + 1) % 3)];
            return a < b ? a + ":" + b : b + ":" + a;
        };
        var t, e;
        for (t = 0; t < I.length; t += 3) for (e = 0; e < 3; e++) zahl.set(kante(t, e), (zahl.get(kante(t, e)) || 0) + 1);
        for (t = 0; t < I.length; t += 3) for (e = 0; e < 3; e++) if (zahl.get(kante(t, e)) === 1) nach.set(I[t + e], I[t + ((e + 1) % 3)]);
        Array.from(nach.keys())
            .sort(function (a, b) {
                return a - b;
            })
            .forEach(function (s) {
                if (gesehen.has(s)) return;
                var r = [];
                for (var v = s; !gesehen.has(v) && nach.has(v); v = nach.get(v)) {
                    gesehen.add(v);
                    r.push(v);
                }
                ringe.push(r);
            });
        return ringe;
    }

    // DIE NETZE DES GUSSES (w21-leib-bau; Leser: `leibUrteil`, gate:mensch-anatomie KOPF): je Mesh des Gusses `g` (Ofen) seine
    // Ecken und Normalen im Raum, in dem Welt und Labor ihn zeichnen (stamm `_ofenAssembleAsset`: jede Hülle hängt an ihrem Gelenk,
    // die geskinnte an der Wurzel — und die Wurzel trägt die Skala der Gestalt, x und z 0,93 am Start): eine geskinnte Hülle liegt
    // im Raum der Wurzel, eine starre trägt ihre Matrix in der Gruppe und ihr Gelenk (`__assetJoint`). `pose`: der Kopf in LEIB_POSE
    // (das Gelenk head um Euler XYZ gedreht); jede Ecke einer geskinnten Hülle folgt ihm mit ihrem Gewicht an ihm und seinen
    // Kindern, jede starre an ihnen ganz. Rückgabe [{ k: Klasse, j: Gelenk, haut: geskinnt, P, N, I (null ohne Index), o: das Mesh }]
    // mit `lage(n)`, der Lage des Gelenks n in Ruhe, und `wurzel`.
    var LEIB_POSE = [0.18, 0.3, 0.05];
    function gussNetze(g, pose) {
        var sk = g.userData.__skelett,
            J = {},
            qP = _qEuler(LEIB_POSE[0], LEIB_POSE[1], LEIB_POSE[2]),
            out = [];
        sk.joints.forEach(function (j) {
            J[j.name] = j;
        });
        // die Lage p (im Raum des Gelenks n) im Raum des Gusses; `richtung`: eine Normale (durch die Skala geteilt, ohne Lage)
        var welt = function (n, p, pz, richtung) {
            for (var j = J[n]; j; j = J[j.parent]) {
                var s = j.scale,
                    q = pz && j.name === "head" ? _qMul(j.quat, qP) : j.quat;
                p = _qRot(q, richtung ? [p[0] / s[0], p[1] / s[1], p[2] / s[2]] : [p[0] * s[0], p[1] * s[1], p[2] * s[2]]);
                if (!richtung) p = _add(p, j.pos);
            }
            return p;
        };
        // zurück: die Lage im Raum des Gusses im Raum des Gelenks n (Ruhe)
        var lokal = function (n, p) {
            var kette = [];
            for (var j = J[n]; j; j = J[j.parent]) kette.unshift(j);
            kette.forEach(function (j) {
                var r = _qRot(_qInv(j.quat), _sub(p, j.pos));
                p = [r[0] / j.scale[0], r[1] / j.scale[1], r[2] / j.scale[2]];
            });
            return p;
        };
        var amKopf = sk.skinJoints.map(function (n) {
            for (var j = J[n]; j; j = J[j.parent]) if (j.name === "head") return true;
            return false;
        });
        g.updateMatrixWorld(true);
        g.traverse(function (o) {
            var a = o.isMesh && o.geometry.attributes;
            if (!a) return;
            var jn = o.userData.__assetJoint || sk.root,
                e = o.matrixWorld.elements,
                n = a.position.count,
                P = new Float64Array(3 * n),
                N = new Float64Array(3 * n);
            // die Normalen-Matrix der Gruppe: die Kofaktoren ihrer 3×3 (die Kreuze der Spalten), im Vorzeichen der Determinante
            var c0 = [e[0], e[1], e[2]],
                c1 = [e[4], e[5], e[6]],
                c2 = [e[8], e[9], e[10]],
                k0 = _cross(c1, c2),
                k1 = _cross(c2, c0),
                k2 = _cross(c0, c1),
                sg = _dot(c0, k0) < 0 ? -1 : 1;
            for (var i = 0; i < n; i++) {
                var v = [a.position.getX(i), a.position.getY(i), a.position.getZ(i)],
                    w = a.normal ? [a.normal.getX(i), a.normal.getY(i), a.normal.getZ(i)] : [0, 0, 0];
                if (a.skinIndex) {
                    v = welt(sk.root, v, false);
                    w = welt(sk.root, w, false, true);
                    var wK = 0;
                    for (var k = 0; k < 4; k++) if (amKopf[a.skinIndex.getComponent(i, k)]) wK += a.skinWeight.getComponent(i, k);
                    if (pose && wK) v = _mix(v, welt("head", lokal("head", v), true), wK);
                } else {
                    v = welt(jn, [e[0] * v[0] + e[4] * v[1] + e[8] * v[2] + e[12], e[1] * v[0] + e[5] * v[1] + e[9] * v[2] + e[13], e[2] * v[0] + e[6] * v[1] + e[10] * v[2] + e[14]], pose);
                    w = welt(jn, _mul(_add(_add(_mul(k0, w[0]), _mul(k1, w[1])), _mul(k2, w[2])), sg), pose, true);
                }
                P.set(v, 3 * i);
                N.set(_norm(w), 3 * i);
            }
            out.push({ k: o.material.userData.__klasse, j: jn, haut: !!a.skinIndex, P: P, N: N, I: o.geometry.index ? o.geometry.index.array : null, o: o });
        });
        out.lage = function (n) {
            return welt(n, [0, 0, 0], false);
        };
        out.wurzel = sk.root;
        return out;
    }

    // DAS URTEIL DER EINEN HAUT (w21-leib-bau, gate:mensch-anatomie LEIB; die Bänder LEIB_SOLL): am Guss des Ofens L0 — `g` mit den
    // Start-Dials, `nackt` derselbe Leib ohne Kleider. (1) DIE NAHT: jede Rand-Ecke der Kopf-Haut (haut am Gelenk head, starr) gegen
    // die nächste Ecke der Haut des Leibs (geskinnt, an der Wurzel), in der Ruhe und unter dem Kopf in Pose (`gussNetze`); auf ihr
    // liegt sie unter 0,1 mm, dort der Winkel der Normalen. (2) DIE SÄUME: je Stoff aus der Haut (beide Güsse) jeder Rand-Ring ab 12
    // Ecken, die Summe seiner Abbiegungen in Umläufen. (3) DER BAUCH (nackt): die Dreiecke der Haut des Leibs vorn (z > 0,15),
    // zwischen den Flanken (|x| < 0,35), Hüfte + 0,25 … 0,6 der Höhe bis zur Schulter — ihr größter Knick zwischen zwei Nachbarn
    // (Grad) und der Anteil der Splitter (ein Winkel unter 10°). Was der Guss nicht trägt, ist NaN (nicht messbar = ROT).
    function leibUrteil(g, nackt) {
        var m = { nahtRing: NaN, nahtSpalt: NaN, nahtPose: NaN, nahtNormale: NaN, saumUmlauf: 0, bauchKnick: NaN, bauchSplitter: NaN, hautMehrfach: NaN, hautUeberschlag: NaN }; // prettier-ignore
        var ecke = function (P, i) {
            return [P[3 * i], P[3 * i + 1], P[3 * i + 2]];
        };
        var grad = function (u, w) {
            return (Math.acos(Math.max(-1, Math.min(1, _dot(u, w) / (_len(u) * _len(w) || 1e-30)))) * 180) / Math.PI;
        };
        var haut = function (L, kopf) {
            return L.filter(function (x) {
                return x.k === "haut" && x.I && (kopf ? x.j === "head" : x.haut && x.j === L.wurzel);
            })[0];
        };
        var ruhe = gussNetze(g, false),
            ohne = gussNetze(nackt, false);
        // (1) DIE NAHT — in Ruhe (der Ring, die Fuge, die Normalen) und in Pose (die Fuge)
        [ruhe, gussNetze(g, true)].forEach(function (L, pose) {
            var kopf = haut(L, true),
                leib = haut(L, false);
            if (!kopf || !leib) return;
            var rand = new Set(),
                auf = 0,
                weit = 0,
                knick = 0,
                Q = leib.P;
            randRinge(kopf.I).forEach(function (r) {
                r.forEach(function (i) {
                    rand.add(i);
                });
            });
            rand.forEach(function (i) {
                var p = ecke(kopf.P, i),
                    bd = Infinity,
                    bj = -1;
                for (var j = 0; j < Q.length; j += 3) {
                    var d = (Q[j] - p[0]) * (Q[j] - p[0]) + (Q[j + 1] - p[1]) * (Q[j + 1] - p[1]) + (Q[j + 2] - p[2]) * (Q[j + 2] - p[2]);
                    if (d < bd) (bd = d), (bj = j / 3);
                }
                weit = Math.max(weit, Math.sqrt(bd));
                if (Math.sqrt(bd) < 1e-4) {
                    auf++;
                    knick = Math.max(knick, grad(ecke(kopf.N, i), ecke(leib.N, bj)));
                }
            });
            if (!rand.size) return;
            if (pose) m.nahtPose = weit;
            else {
                m.nahtSpalt = weit;
                m.nahtRing = auf / rand.size;
                m.nahtNormale = auf ? knick : NaN;
            }
        });
        // (2) DIE SÄUME
        [ruhe, ohne].forEach(function (L) {
            L.forEach(function (x) {
                if (!/^stoff_/.test(x.k) || !x.I) return;
                randRinge(x.I).forEach(function (r) {
                    if (r.length < 12) return;
                    var dreh = 0;
                    for (var k = 0; k < r.length; k++) {
                        var b = ecke(x.P, r[k]);
                        dreh += grad(_sub(b, ecke(x.P, r[(k + r.length - 1) % r.length])), _sub(ecke(x.P, r[(k + 1) % r.length]), b));
                    }
                    m.saumUmlauf = Math.max(m.saumUmlauf, dreh / 360);
                });
            });
        });
        // (2b) DIE HAUT OHNE SPLITTER (bekleidet, Kopf und Leib): Kanten mit mehr als zwei Dreiecken, Nachbarn über 100° geknickt
        var kopfH = haut(ruhe, true),
            leibH = haut(ruhe, false);
        if (kopfH && leibH) {
            m.hautMehrfach = 0;
            m.hautUeberschlag = 0;
            [kopfH, leibH].forEach(function (x) {
                var P = x.P,
                    I = x.I,
                    kanten = new Map(),
                    nor = [];
                for (var t = 0; t < I.length; t += 3) {
                    var a = ecke(P, I[t]);
                    nor.push(_norm(_cross(_sub(ecke(P, I[t + 1]), a), _sub(ecke(P, I[t + 2]), a))));
                    for (var k = 0; k < 3; k++) {
                        var u = I[t + k],
                            v = I[t + ((k + 1) % 3)],
                            key = u < v ? u + ":" + v : v + ":" + u;
                        if (!kanten.has(key)) kanten.set(key, []);
                        kanten.get(key).push(t / 3);
                    }
                }
                kanten.forEach(function (ts) {
                    if (ts.length > 2) m.hautMehrfach++;
                    else if (ts.length === 2 && grad(nor[ts[0]], nor[ts[1]]) > 100) m.hautUeberschlag++;
                });
            });
        }
        // (3) DER BAUCH (nackt)
        var leib = haut(ohne, false);
        if (!leib) return m;
        var yH = ohne.lage("hip1")[1],
            yS = ohne.lage("arm1")[1],
            y0 = yH + 0.25 * (yS - yH),
            y1 = yH + 0.6 * (yS - yH),
            P = leib.P,
            I = leib.I;
        var drin = function (t) {
            for (var k = 0; k < 3; k++) {
                var q = ecke(P, I[t + k]);
                if (!(q[1] > y0 && q[1] < y1 && q[2] > 0.15 && Math.abs(q[0]) < 0.35)) return false;
            }
            return true;
        };
        var normale = function (t) {
            var a = ecke(P, I[t]);
            return _norm(_cross(_sub(ecke(P, I[t + 1]), a), _sub(ecke(P, I[t + 2]), a)));
        };
        var kanten = new Map(),
            n = 0,
            splitter = 0,
            knick = 0;
        for (var t = 0; t < I.length; t += 3) {
            if (!drin(t)) continue;
            n++;
            var spitz = Infinity;
            for (var k = 0; k < 3; k++) {
                var a = ecke(P, I[t + k]);
                spitz = Math.min(spitz, grad(_sub(ecke(P, I[t + ((k + 1) % 3)]), a), _sub(ecke(P, I[t + ((k + 2) % 3)]), a)));
                var u = I[t + k],
                    v = I[t + ((k + 1) % 3)],
                    key = u < v ? u + ":" + v : v + ":" + u;
                if (kanten.has(key)) knick = Math.max(knick, grad(normale(kanten.get(key)), normale(t)));
                else kanten.set(key, t);
            }
            if (spitz < 10) splitter++;
        }
        if (n) {
            m.bauchKnick = knick;
            m.bauchSplitter = splitter / n;
        }
        return m;
    }

    // DER KANON DES LEIBS IM GUSS (w28-leib-kanon, die Bänder LEIB_SOLL.kanon): am Guss `g` (Ofen L0, nackt, Ruhe) die Umrisse von vorn
    // (x, y) und von der Seite (z, y) als Raster (1 Bildpunkt = H / 500, H = Sohle bis Scheitel ohne Haar), je Bildpunkt die Klasse
    // seines Dreiecks — 1 Rumpf (Leib, Hals, Kopf, Stoff am Rumpf), 2 Arm, 3 Bein, 4 Hand (das Gelenk des stärksten Gewichts
    // jeder Ecke) —, und aus ihnen die Maße als Anteil von H: schulterHoehe = Oberkante des Umrisses 0,11 H neben der Mitte (das
    // Akromion) · breiteAkromion = die Breite zwischen den Ecken der Schulter (`ecke`) · breiteDeltoid = die größte Breite über die Arme bis zur Schulter ab
    // 0,72 H (ohne Hände) · brustT = die Tiefe des Rumpfs auf der Höhe der Brustwarze (0,72 H, labProportionen nippleY) · brustB
    // und tailleB = die Breite des Rumpfs (der Lauf um die Mitte) dort und die kleinste in 0,56–0,66 H — wie ANSUR sie misst, mit
    // vom Leib gelösten Armen: am Guss `gFrei` (derselbe Leib, die Arme gespreizt), sonst an `g` · huefteB = die größte Breite
    // ohne Arme in 0,45–0,56 H · schritt = die Höhe, ab der die Mitte von unten gefüllt ist · halsB / halsT auf 0,85 H ·
    // armLaenge = Schulter-Gelenk bis Handgelenk. Rückgabe { m, front, seite } (Raster { w, h, px } für das Bild der Linse).
    function leibKanon(g, gFrei) {
        var klasse = function (n) {
            return /^hand/.test(n) ? 4 : /^(arm|elbow)/.test(n) ? 2 : /^(hip|knee|ankle)/.test(n) ? 3 : 1;
        };
        // die Dreiecke eines Gusses im Raum des Leibs, je mit seiner Klasse
        var netz = function (g) {
        var L = gussNetze(g, false),
            sj = g.userData.__skelett.skinJoints,
            T = [],
            y0 = Infinity,
            y1 = -Infinity;
        L.forEach(function (x) {
            if (!x.I || /^(hair|eye|iris|pupil|cornea)$/.test(x.k)) return;
            var a = x.o.geometry.attributes,
                kl = function (i) {
                    if (!a.skinIndex) return klasse(x.j);
                    for (var k = 0, b = -1, bk = 0; k < 4; k++) if (a.skinWeight.getComponent(i, k) > b) (b = a.skinWeight.getComponent(i, k)), (bk = a.skinIndex.getComponent(i, k));
                    return klasse(sj[bk]);
                };
            for (var t = 0; t < x.I.length; t += 3) {
                var e = [x.I[t], x.I[t + 1], x.I[t + 2]],
                    k = e.map(kl);
                T.push({ p: e.map(function (i) { return [x.P[3 * i], x.P[3 * i + 1], x.P[3 * i + 2]]; }), k: k[0] === k[2] ? k[0] : k[1] }); // prettier-ignore
                for (var j = 0; j < 3; j++) (y0 =Math.min(y0, x.P[3 * e[j] + 1])), (y1 = Math.max(y1, x.P[3 * e[j] + 1])); // prettier-ignore
            }
        });
            return { L: L, T: T, y0: y0, H: y1 - y0 };
        };
        var N = netz(g),
            L = N.L,
            y0 = N.y0,
            H = N.H,
            n = 500;
        // das Raster einer Achse (0 vorn: x, 2 seitlich: z): Mitte bei w/2, Sohle in der untersten Zeile
        var raster = function (N, ax) {
            var w = 300,
                s = n / N.H,
                px = new Uint8Array(w * n);
            N.T.forEach(function (d) {
                var q = d.p.map(function (p) {
                    return [w / 2 + p[ax] * s, (p[1] - N.y0) * s];
                });
                var den = (q[1][0] - q[0][0]) * (q[2][1] - q[0][1]) - (q[1][1] - q[0][1]) * (q[2][0] - q[0][0]);
                if (!den) return;
                for (var r = Math.max(0, Math.floor(Math.min(q[0][1], q[1][1], q[2][1]))); r <= Math.min(n - 1, Math.ceil(Math.max(q[0][1], q[1][1], q[2][1]))); r++) // prettier-ignore
                    for (var c = Math.max(0, Math.floor(Math.min(q[0][0], q[1][0], q[2][0]))); c <= Math.min(w - 1, Math.ceil(Math.max(q[0][0], q[1][0], q[2][0]))); c++) { // prettier-ignore
                        var u = ((q[1][0] - c - 0.5) * (q[2][1] - r - 0.5) - (q[1][1] - r - 0.5) * (q[2][0] - c - 0.5)) / den,
                            v = ((q[2][0] - c - 0.5) * (q[0][1] - r - 0.5) - (q[2][1] - r - 0.5) * (q[0][0] - c - 0.5)) / den;
                        if (u >= 0 && v >= 0 && u + v <= 1 && (!px[r * w + c] || d.k === 1)) px[r * w + c] = d.k;
                    }
            });
            return { w: w, h: n, px: px };
        };
        var F = raster(N, 0),
            S = raster(N, 2),
            R = gFrei ? raster(netz(gFrei), 0) : F,
            zeile = function (R, yH, nur) {
                var r = Math.round(yH * n),
                    a = Infinity,
                    b = -Infinity;
                for (var c = 0; c < R.w; c++) if (nur(R.px[r * R.w + c])) (a = Math.min(a, c)), (b = Math.max(b, c));
                return b >= a ? (b - a + 1) / n : 0;
            },
            // die Breite des Laufs um die Mitte (der Rumpf zwischen den Armen)
            mitte = function (R, yH, nur) {
                var r = Math.round(yH * n),
                    a = R.w / 2,
                    b = R.w / 2;
                if (!nur(R.px[r * R.w + a])) return 0;
                while (a > 0 && nur(R.px[r * R.w + a - 1])) a--;
                while (b < R.w - 1 && nur(R.px[r * R.w + b + 1])) b++;
                return (b - a + 1) / n;
            },
            rumpf = function (k) {
                return k === 1;
            },
            ohneHand = function (k) {
                return k && k !== 4;
            },
            ohneArm = function (k) {
                return k === 1 || k === 3;
            },
            spanne = function (a, b, f, wahl) {
                for (var yH = a, best = null; yH <= b; yH += 1 / n) {
                    var x = f(yH);
                    if (best === null || wahl(x, best.x)) best = { yH: yH, x: x };
                }
                return best;
            };
        var oben = function (c) {
            for (var r = n - 1; r > 0; r--) if (ohneHand(F.px[r * F.w + c])) return r / n;
            return NaN;
        };
        var schulterHoehe = (oben(Math.round(F.w / 2 - 0.11 * n)) + oben(Math.round(F.w / 2 + 0.11 * n))) / 2;
        // die Ecke der Schulter: so weit hinaus trägt ihre Oberkante, ohne mehr als 0,01 H unter das Akromion zu fallen
        var ecke = function (sd) {
            for (var c = Math.round(F.w / 2 + sd * 0.11 * n); c > 0 && c < F.w - 1 && oben(c + sd) >= schulterHoehe - 0.01; c += sd);
            return c;
        };
        var brust = { yH: 0.72, x: zeile(S, 0.72, rumpf) };
        var schritt = NaN;
        for (var r = Math.round(0.3 * n); r < 0.6 * n; r++)
            if (ohneArm(F.px[r * F.w + F.w / 2])) {
                schritt = r / n;
                break;
            }
        var lage = function (j) {
            return (L.lage(j)[1] - y0) / H;
        };
        var gl = function (j) {
            return L.lage(j);
        };
        return {
            m: {
                schulterHoehe: schulterHoehe,
                breiteAkromion: (ecke(1) - ecke(-1) + 1) / n,
                breiteDeltoid: spanne(0.72, schulterHoehe, function (yH) { return zeile(F, yH, ohneHand); }, function (a, b) { return a > b; }).x, // prettier-ignore
                brustT: brust.x,
                brustB: mitte(R, brust.yH, rumpf),
                tailleB: spanne(0.56, 0.66, function (yH) { return mitte(R, yH, rumpf); }, function (a, b) { return a < b; }).x, // prettier-ignore
                huefteB: spanne(0.45, 0.56, function (yH) { return zeile(F, yH, ohneArm); }, function (a, b) { return a > b; }).x, // prettier-ignore
                schritt: schritt,
                halsB: mitte(F, 0.85, rumpf),
                halsT: mitte(S, 0.85, rumpf),
                schulterGelenk: lage("arm1"),
                armLaenge: _len(_sub(gl("hand1"), gl("arm1"))) / H,
            },
            front: F,
            seite: S,
        };
    }

    // DIE GESTALT ALS DATEN-GESETZ (w28-leib-kanon, Samen-Entscheid 12.11.: „Relief als Funktion in Glied-Koordinaten") — der Guss
    // trägt die Topologie, die FORM ist diese Liste: je Glied (Oberarm, Unterarm, Oberschenkel, Unterschenkel) ein Rundkegel mit
    // Bauch-Profil (`profil`: Stützstellen [s, Radius cm], s = 0 am oberen Gelenk, 1 am unteren) und die Anatomie als LAPPEN mit
    // Vorzeichen (`lappen`: [Glied, s, θ Grad, Breite s, Breite θ, Amplitude cm, Name] — ein Tal ist ein negativer Lappen; θ am
    // Glied 0 vorn · 90 außen · 180 hinten · −90 innen, am Rumpf 0 vorn · 180 hinten, beide Seiten gespiegelt, s am Rumpf 0 am
    // Hüft-Gelenk, 1 am Kopf-Gelenk). EINE Quelle für jede Stufe: der Ofen ruft `leibRelief` nach dem Guss jeder Hülle (Haut, Stoff
    // aus der Haut, der Leib der Menge). Bis hier trug eine Kette von Kugeln unter einer überall gleichen Haut-Dicke die Form: der
    // Oberarm maß 50,7 cm, das Knie 52,2, der Knöchel 38,5 (Verjüngung Arm 2,78 · Schenkel 1,14 · Wade 1,35), und ein feineres
    // Raster (8,6-mal die Dreiecke) schärfte nur die Kugeln. `regler`: wie die Dials die Liste skalieren — `muskel` der Anteil des
    // Muskel-Maßes (labMorph armM, legM gegen den Start) am Radius, die Muskel-Lappen im Quadrat; `fett` je Einheit Fett über dem
    // Start am Radius, `tal` wie schnell Fett die Täler und Knochenpunkte füllt (dünn über Knochenpunkten heißt: sie stehen am
    // schlanken Leib und schwinden am beleibten). QUELLE UNGEPRÜFT: Radien und Amplituden sind Richtwerte aus dem Gedächtnis
    // (ANSUR-II-nah: Oberarm 32 cm, Handgelenk 17,6, Oberschenkel 62,5 an der Gesäßfalte, Knie 39, Wade 39, Knöchel 22,5).
    // prettier-ignore
    var LEIB_RELIEF = Object.freeze({
        profil: Object.freeze({
            oberarm: [[0, 5.8], [0.18, 5.6], [0.32, 5.1], [0.5, 4.8], [0.8, 4.15], [1, 4.1]],
            unterarm: [[0, 4.1], [0.2, 4.5], [0.45, 4.0], [0.75, 3.1], [0.95, 2.75], [1, 2.75]],
            oberschenkel: [[0, 10.2], [0.25, 9.9], [0.5, 8.6], [0.8, 6.7], [1, 6.1]],
            unterschenkel: [[0, 6.1], [0.12, 5.6], [0.28, 5.9], [0.5, 5.0], [0.75, 3.9], [0.93, 3.45], [1, 3.5]],
        }),
        lappen: Object.freeze([
            ["oberarm", 0.18, 90, 0.12, 65, 0, "Delta-Kappe"], ["oberarm", 0.4, 80, 0.05, 30, -0.35, "Delta-Bizeps-Furche"],
            ["oberarm", 0.48, 10, 0.2, 50, 0.5, "Bizeps"], ["oberarm", 0.42, 180, 0.22, 55, 0.45, "Trizeps"],
            ["oberarm", 1.0, 180, 0.06, 28, 0.5, "Ellbogen-Spitze"], ["oberarm", 1.0, 0, 0.06, 30, -0.3, "Ellenbeuge"],
            ["unterarm", 0.0, 180, 0.06, 28, 0.5, "Ellbogen-Spitze"], ["unterarm", 0.0, 0, 0.06, 30, -0.3, "Ellenbeuge"],
            ["unterarm", 0.15, 60, 0.15, 40, 0.4, "Oberarmspeichenmuskel"],
            ["unterarm", 0.95, 90, 0.08, 35, 0.35, "Handgelenk außen"], ["unterarm", 0.95, -90, 0.08, 35, 0.35, "Handgelenk innen"],
            ["unterarm", 0.95, 0, 0.08, 40, -0.3, "Handgelenk flach vorn"], ["unterarm", 0.95, 180, 0.08, 40, -0.3, "Handgelenk flach hinten"],
            ["oberschenkel", 0.45, 10, 0.25, 50, 0.5, "Quadrizeps"], ["oberschenkel", 0.83, -50, 0.07, 28, 0.6, "Vastus medialis"],
            ["oberschenkel", 0.6, 70, 0.2, 35, 0.3, "Vastus lateralis"], ["oberschenkel", 0.45, 180, 0.25, 50, 0.4, "Beinbeuger"],
            ["oberschenkel", 0.2, -90, 0.15, 40, 0.5, "Adduktoren"], ["oberschenkel", 0.98, 0, 0.05, 26, 0.6, "Kniescheibe"],
            ["oberschenkel", 1.0, 180, 0.06, 30, -0.6, "Kniekehle"], ["oberschenkel", 0.9, 0, 0.04, 30, -0.25, "über der Kniescheibe"],
            ["unterschenkel", 0.0, 0, 0.05, 26, 0.6, "Kniescheibe"], ["unterschenkel", 0.0, 180, 0.06, 30, -0.6, "Kniekehle"],
            ["unterschenkel", 0.1, 0, 0.04, 20, 0.3, "Schienbein-Höcker"], ["unterschenkel", 0.27, 180, 0.15, 55, 1.0, "Wade"],
            ["unterschenkel", 0.3, -120, 0.1, 30, 0.3, "Wade innen"], ["unterschenkel", 0.5, 0, 0.3, 25, -0.3, "Schienbein-Kante"],
            ["unterschenkel", 0.88, 180, 0.1, 18, 0.3, "Achillessehne"], ["unterschenkel", 0.9, 130, 0.07, 20, -0.3, "Grube außen"],
            ["unterschenkel", 0.9, -130, 0.07, 20, -0.3, "Grube innen"], ["unterschenkel", 0.97, 90, 0.03, 22, 0.45, "Außenknöchel"],
            ["unterschenkel", 0.96, -90, 0.03, 22, 0.5, "Innenknöchel"],
            ["rumpf", 0.62, 28, 0.08, 22, 0.5, "Brustmuskel"], ["rumpf", 0.52, 26, 0.035, 24, -0.8, "Brustmuskel-Unterkante"],
            ["rumpf", 0.64, 0, 0.13, 9, -0.5, "Brustbein-Rinne"], ["rumpf", 0.835, 30, 0.028, 28, 0.6, "Schlüsselbein"],
            ["rumpf", 0.875, 32, 0.028, 20, -0.5, "Schlüsselbein-Grube"], ["rumpf", 0.83, 0, 0.022, 9, -0.5, "Drosselgrube"],
            ["rumpf", 0.43, 16, 0.03, 10, 0.45, "Rippenbogen oben"], ["rumpf", 0.37, 34, 0.032, 12, 0.45, "Rippenbogen unten"],
            ["rumpf", 0.41, 0, 0.05, 11, -0.35, "Magengrube"], ["rumpf", 0.22, 0, 0.16, 11, -0.3, "Bauch-Mittellinie"],
            ["rumpf", 0.25, 14, 0.15, 11, 0.2, "gerader Bauchmuskel"], ["rumpf", 0.25, 30, 0.14, 10, -0.2, "Bauch-Seitenlinie"],
            ["rumpf", 0.15, 72, 0.028, 30, 0.5, "Beckenkamm"], ["rumpf", 0.25, 88, 0.06, 25, -0.5, "Flanke"],
            ["rumpf", 0.03, 40, 0.03, 18, -0.3, "Leiste"],
            ["rumpf", 0.42, 180, 0.34, 9, -0.9, "Wirbel-Furche"], ["rumpf", 0.22, 165, 0.2, 8, 0.5, "Rückenstrecker"],
            ["rumpf", 0.68, 142, 0.09, 15, 0.9, "Schulterblatt"], ["rumpf", 0.68, 161, 0.08, 8, -0.35, "Schulterblatt-Innenrand"],
            ["rumpf", 0.5, 112, 0.12, 12, 0.7, "Latissimus-Kante"], ["rumpf", 0.9, 150, 0.05, 28, 0.6, "Trapez zum Hals"],
            ["rumpf", 0.93, 180, 0.022, 9, 0.4, "siebter Halswirbel"], ["rumpf", 0.08, 168, 0.022, 6, -0.4, "Kreuzbein-Grübchen"],
            ["rumpf", -0.06, 150, 0.09, 24, 1.0, "Gesäß"], ["rumpf", -0.19, 150, 0.04, 26, -0.8, "Gesäßfalte"],
            ["rumpf", -0.1, 180, 0.08, 6, -1.0, "Gesäß-Spalte"], ["rumpf", -0.03, 90, 0.05, 20, -0.3, "Hüft-Delle"],
        ]),
        glieder: Object.freeze([["oberarm", "arm", "elbow", ["arm"]], ["unterarm", "elbow", "hand", ["elbow", "hand"]], ["oberschenkel", "hip", "knee", ["hip"]], ["unterschenkel", "knee", "ankle", ["knee", "ankle"]]]),
        // `kappeFlach`: das Schulterdach über dem Gelenk als Anteil des Radius, der ihm fehlt (0,75: 1,55 cm über dem Gelenk), `spaltCm`: so nah tritt ein Bein an die Mitte (die
        // Schenkel liegen aneinander, nie ineinander), `hoeheCm` die Körperhöhe, an der die cm der Liste gelten. Die Delta-Kappe
        // trägt keine eigene Amplitude: sie reicht vom Gelenk bis zur halben Schulterbreite des Kanons (LEIB_SOLL.kanon breiteDeltoid).
        regler: Object.freeze({ muskel: 0.35, fett: 0.25, tal: 1.2, kappeFlach: 0.75, kappeMaxCm: 3.4, spaltCm: 0.4, hoeheCm: 173.4 }),
    });
    function _reliefProfil(kn, s) {
        s = Math.max(0, Math.min(1, s));
        var i = 0;
        while (i < kn.length - 2 && s > kn[i + 1][0]) i++;
        var m = function (j) {
            return j <= 0 ? (kn[1][1] - kn[0][1]) / (kn[1][0] - kn[0][0]) : j >= kn.length - 1 ? (kn[j][1] - kn[j - 1][1]) / (kn[j][0] - kn[j - 1][0]) : (kn[j + 1][1] - kn[j - 1][1]) / (kn[j + 1][0] - kn[j - 1][0]);
        };
        var h = kn[i + 1][0] - kn[i][0], t = (s - kn[i][0]) / h, t2 = t * t, t3 = t2 * t; // prettier-ignore
        return (2 * t3 - 3 * t2 + 1) * kn[i][1] + (t3 - 2 * t2 + t) * h * m(i) + (-2 * t3 + 3 * t2) * kn[i + 1][1] + (t3 - t2) * h * m(i + 1);
    }
    function _reliefStufe(a, b, x) {
        var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }
    // Die Glieder eines Leibs in Ruhe: `lage` = { Gelenk: [x, y, z] } im Raum der Ecken; je Glied Ursprung A, Achse u, Länge L und
    // der Rahmen quer (ef vorn, el außen)
    function _reliefGlieder(lage) {
        var G = [];
        [1, -1].forEach(function (sd) {
            var k = sd === 1 ? "1" : "-1";
            LEIB_RELIEF.glieder.forEach(function (z) {
                var A = lage[z[1] + k], B = lage[z[2] + k]; // prettier-ignore
                if (!A || !B) throw new Error("LEIB-RELIEF: das Gelenk " + z[1] + k + " oder " + z[2] + k + " fehlt (fail-closed)");
                var u = _norm(_sub(B, A)),
                    ef = _norm(_sub([0, 0, 1], _mul(u, u[2]))),
                    el = _sub([sd, 0, 0], _mul(u, u[0] * sd));
                el = _norm(_sub(el, _mul(ef, _dot(el, ef))));
                G.push({ name: z[0], sd: sd, A: A, u: u, L: _len(_sub(B, A)), ef: ef, el: el, gew: z[3].map(function (g) { return g + k; }) }); // prettier-ignore
            });
        });
        return G;
    }
    // DAS RELIEF (der EINE Leser der Liste): die Ecken einer Hülle in der Ruhe-Pose (`pos`, `nor` je Ecke 3, `si`/`sw` je Ecke 4,
    // `skinJoints` die Namen der Gewichte, `lage` die Gelenke im selben Raum, `dials` der Leib, `auf` die Lage der Hülle über der
    // Haut in Einheiten des Raums — der Stoff aus der Haut). Jede Ecke kennt aus ihren Gewichten ihr Glied, s und θ aus dessen
    // Achse: am Glied tritt ihr Abstand zur Achse auf das Profil samt Lappen (über dem Schulter-Gelenk die flache Kappe um das
    // Gelenk; der Schenkel blendet erst unter dem Schritt ein, jenseits von Hand- und Sprung-Gelenk bleibt der Guss: Hand und Fuß
    // sind keine Röhre), am Rumpf wandert sie um die Lappen entlang ihrer Normale — nie an der Naht des Kopfs (sein Gewicht
    // nimmt den Rumpf zurück). Schreibt `pos`; die Normalen rechnet der Rufer neu.
    function leibRelief(pos, nor, si, sw, skinJoints, lage, dials, auf) {
        var d = {}, k; // prettier-ignore
        for (k in START_PARAMS) d[k] = START_PARAMS[k];
        for (k in dials || {}) if (typeof dials[k] === "number" && isFinite(dials[k])) d[k] = dials[k];
        var M = labMorph(d), M0 = labMorph(START_PARAMS), R = LEIB_RELIEF.regler; // prettier-ignore
        var quer = d.height / (leibMassstab() * 100 * M.charScale.x); // Einheiten des Ecken-Raums je cm quer zur Körper-Achse
        var kFett = 1 + R.fett * (M.totalFat - M0.totalFat),
            kTal = Math.max(0.15, Math.min(1.3, 1 - R.tal * (M.totalFat - M0.totalFat))),
            kGlied = { arm: 1 + R.muskel * (M.armM / M0.armM - 1), bein: 1 + R.muskel * (M.legM / M0.legM - 1) };
        var G = _reliefGlieder(lage),
            ji = function (n) {
                return skinJoints.indexOf(n);
            };
        var KS = LEIB_SOLL.kanon,
            kappe = Math.min(R.kappeMaxCm, 0.5 * R.hoeheCm * (KS.frau.breiteDeltoid + (KS.mann.breiteDeltoid - KS.frau.breiteDeltoid) * d.gender) - Math.abs(lage.arm1[0]) / quer - LEIB_RELIEF.profil.oberarm[0][1]);
        var lappen = {};
        LEIB_RELIEF.lappen.forEach(function (L) {
            var kg = /arm$/.test(L[0]) ? kGlied.arm : L[0] === "rumpf" ? 1 : kGlied.bein;
            // ein Muskel wächst mit seinem Maß, ein Tal und ein Knochenpunkt des Rumpfs schwinden unter dem Fett
            var a = L[6] === "Delta-Kappe" ? kappe : L[5] > 0 && L[0] !== "rumpf" ? L[5] * kg * kg : L[5] * (L[6] === "Gesäß" ? 1 : kTal);
            // der Stoff liegt auf den Höhen und überspannt die schmalen Täler (eine Furche unter 0,09 s oder 20° zeichnet er nicht)
            if (auf > 0 && a < 0 && (L[3] < 0.09 || L[4] < 20)) return;
            (lappen[L[0]] || (lappen[L[0]] = [])).push([L[1], L[2], L[3], L[4], a]);
        });
        var summe = function (glied, s, th) {
            var a = 0, Ls = lappen[glied] || []; // prettier-ignore
            for (var i = 0; i < Ls.length; i++) {
                var dt = th - Ls[i][1];
                dt = ((((dt + 180) % 360) + 360) % 360) - 180;
                var e = ((s - Ls[i][0]) / Ls[i][2]) * ((s - Ls[i][0]) / Ls[i][2]) + (dt / Ls[i][3]) * (dt / Ls[i][3]);
                if (e < 12) a += Ls[i][4] * Math.exp(-e);
            }
            return a;
        };
        G.forEach(function (g) {
            g.km = /arm$/.test(g.name) ? kGlied.arm : kGlied.bein;
        });
        // der Radius an s: Muskel und Fett tragen den Bauch des Glieds, das Gelenk (Ellbogen, Handgelenk, Knie, Knöchel) ist
        // Knochen — dort wächst es nicht mit dem Muskel und nur zu 0,4 mit dem Fett
        var radius = function (g, s) {
            var b = g.name === "oberarm" ? _reliefStufe(0.1, 0.3, s) * (1 - _reliefStufe(0.75, 1, s)) : g.name === "oberschenkel" ? 1 - _reliefStufe(0.75, 1, s) : _reliefStufe(0, 0.12, s) * (1 - _reliefStufe(0.6, 0.95, s));
            return _reliefProfil(LEIB_RELIEF.profil[g.name], s) * (1 + (g.km - 1) * b) * (1 + (kFett - 1) * (0.4 + 0.6 * b));
        };
        // DIE ECKE GEHÖRT IHREM GLIED, wo dessen Kette (Arm: Schulter, Ellbogen, Hand · Bein: Hüfte, Knie, Sprung-Gelenk) sie führt:
        // die weichen Gewichte reichen weit (die Hüfte trägt 0,3 vom Unterarm, der neben ihr hängt) — linear gewogen zog das
        // Profil des Arms die Hüfte zu sich (ein Stachel im Saum). Das Gewicht der Kette schaltet weich um 0,5 (zwei Glieder an
        // einem Gelenk teilen sich die Ecke), im Bein zählt die Seite der Ecke (beide Schenkel tragen die Mitte des Schritts).
        var ix = function (namen) {
            var o = {};
            namen.forEach(function (nm) {
                o[ji(nm)] = 1;
            });
            return o;
        };
        var gew = function (i4, menge) {
            var w = 0;
            for (var kq = 0; kq < 4; kq++) if (menge[si[i4 + kq]]) w += sw[i4 + kq];
            return w;
        };
        G.forEach(function (g) {
            var bein = /schenkel$/.test(g.name), k = g.sd === 1 ? "1" : "-1"; // prettier-ignore
            g.bein = bein;
            g.eigen = ix(bein ? g.gew.concat(g.gew.map(function (nm) { return nm.replace(/-?1$/, g.sd === 1 ? "-1" : "1"); })) : g.gew); // prettier-ignore
            g.kette = ix(bein ? ["hip1", "knee1", "ankle1", "hip-1", "knee-1", "ankle-1"] : ["arm" + k, "elbow" + k, "hand" + k]);
        });
        var ketten = [ix(["arm1", "elbow1", "hand1"]), ix(["arm-1", "elbow-1", "hand-1"]), ix(["knee1", "ankle1", "knee-1", "ankle-1"])],
            kopf = ix(["head"]),
            beine = ix(["hip1", "knee1", "ankle1", "hip-1", "knee-1", "ankle-1"]);
        var yH = lage.hip1[1], yK = lage.head[1], n = pos.length / 3, neu = new Float64Array(pos.length), sp = R.spaltCm * quer; // prettier-ignore
        for (var i = 0; i < n; i++) {
            var p = [pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]],
                dx = 0,
                dy = 0,
                dz = 0,
                i4 = 4 * i,
                wRumpf = (1 - _reliefStufe(0.3, 0.7, gew(i4, ketten[0])) - _reliefStufe(0.3, 0.7, gew(i4, ketten[1])) - _reliefStufe(0.3, 0.7, gew(i4, ketten[2]))) * (1 - gew(i4, kopf));
            for (var gi = 0; gi < G.length; gi++) {
                var g = G[gi];
                if (g.bein && g.sd * p[0] < 0) continue;
                var wk = gew(i4, g.kette);
                if (wk < 0.3) continue;
                var w = (_reliefStufe(0.3, 0.7, wk) * gew(i4, g.eigen)) / wk;
                if (w < 1e-3) continue;
                var v = _sub(p, g.A), sl = _dot(v, g.u), s = sl / g.L; // prettier-ignore
                var q = _sub(v, _mul(g.u, sl)), r = _len(q) || 1e-6; // prettier-ignore
                var th = (Math.atan2(_dot(q, g.el), _dot(q, g.ef)) * 180) / Math.PI,
                    dd;
                if (g.name === "oberarm" && s < 0) {
                    var rv = _len(v) || 1e-6, hoch = -sl / rv; // prettier-ignore
                    // die Kappe ist ein Ellipsoid um das Gelenk: quer der Radius des Glieds samt Lappen, nach oben das Schulterdach
                    var rq = radius(g, 0) + summe(g.name, Math.max(-0.1, s), th), rb = radius(g, 0) * (1 - R.kappeFlach); // prettier-ignore
                    dd = w * (quer / Math.sqrt((1 - hoch * hoch) / (rq * rq) + (hoch * hoch) / (rb * rb)) + (auf || 0) - rv);
                    dx += (dd * v[0]) / rv;
                    dy += (dd * v[1]) / rv;
                    dz += (dd * v[2]) / rv;
                    continue;
                }
                var ein = g.name === "oberschenkel" ? _reliefStufe(0.08, 0.28, s) : g.name === "oberarm" ? 1 : 1 - _reliefStufe(1.0, 1.1, s);
                dd = w * (ein * (radius(g, s) * quer + (auf || 0) - r) + (g.name === "oberarm" ? 1 : ein) * summe(g.name, Math.max(-0.1, Math.min(1.1, s)), th) * quer);
                dx += (dd * q[0]) / r;
                dy += (dd * q[1]) / r;
                dz += (dd * q[2]) / r;
            }
            if (wRumpf > 1e-3) {
                var a = wRumpf * summe("rumpf", (p[1] - yH) / (yK - yH), Math.abs((Math.atan2(p[0], p[2]) * 180) / Math.PI)) * quer;
                dx += a * nor[3 * i];
                dy += a * nor[3 * i + 1];
                dz += a * nor[3 * i + 2];
            }
            // die Beine liegen aneinander, nie ineinander: keine Bein-Ecke tritt näher als der Spalt an die Mitte
            var wb = _reliefStufe(0.3, 0.7, gew(i4, beine));
            if (wb > 0 && p[1] < yH) {
                var sg = p[0] < 0 ? -1 : 1, xs = sg * (p[0] + dx); // prettier-ignore
                // (auf 2 % ihrer Tiefe gestaucht, nie eben gepresst: in EINER Ebene fände der Kollaps gleich teure Kanten, und ein ULP
                // von hypot wählte — die Plattform-Probe des Ofens nannte zwei Fälle, wie an der Sohle des Schuhs)
                if (xs < sp) dx += sg * wb * (sp - xs) * 0.98;
            }
            neu[3 * i] = p[0] + dx;
            neu[3 * i + 1] = p[1] + dy;
            neu[3 * i + 2] = p[2] + dz;
        }
        for (i = 0; i < pos.length; i++) pos[i] = neu[i];
    }

    // DAS URTEIL DER GESTALT AM GUSS (w28-leib-kanon, gate:mensch-anatomie FORM; die Bänder LEIB_FORM_SOLL): am Guss `g` (Ofen,
    // nackt, Ruhe), in cm. VERJÜNGUNG — der Umfang eines Glieds an s (ein Band längs der Achse, 36 Winkel-Fächer, je Fach der
    // mittlere Abstand der Ecken seiner Gelenk-Kette zur Achse): Oberarm (der größte in s 0,45–0,6) ÷ Handgelenk (der kleinste in
    // 0,85–0,97), Oberschenkel (0,38–0,5) ÷ Knie (s 1), Wade (0,15–0,45) ÷ Knöchel (0,82–0,96). LANDMARKEN — die Tiefe MIT
    // Vorzeichen in mm: der Abstand der Fläche zur Achse an einer benannten Stelle gegen das Mittel zweier Nachbar-Stellen (ein
    // Tal ist negativ, ein Knochenpunkt positiv; Gauß σ 1,2 cm über die Ecken): die Wirbel-Furche und die Brustbein-Rinne gegen
    // ihre Flanken, die Kniekehle, die Kniescheibe und die Ellbogen-Spitze gegen das Glied über und unter dem Gelenk. Ein RMS
    // gegen den Tiefpass belohnt Buckel (der Spike: ein feineres Raster gewann ihn mit schärferen Kugeln) — die Landmarke nennt
    // die Stelle und ihr Vorzeichen. Die Bänder der Verjüngung: QUELLE UNGEPRÜFT (Richtwerte aus dem Gedächtnis, ANSUR-II-nah:
    // 32 ÷ 17,6 · 62,5 an der Gesäßfalte bzw. ~57 in der Schenkel-Mitte ÷ 39 · 39 ÷ 22,5), die der Landmarken sind gesetzt.
    // prettier-ignore
    var LEIB_FORM_SOLL = Object.freeze({
        armZuHandgelenk: [1.65, 2.0], schenkelZuKnie: [1.38, 1.7], wadeZuKnoechel: [1.58, 1.9],
        wirbelFurche: [-12, -3.5], brustbeinRinne: [-12, -5], kniekehle: [-12, -1.5], kniescheibe: [1, 10], ellbogenSpitze: [1, 10],
    });
    function leibFormUrteil(g) {
        var N = gussNetze(g, false), sk = g.userData.__skelett, CM = leibMassstab() * 100, E = []; // prettier-ignore
        N.forEach(function (x) {
            if (!x.haut || !(x.k === "haut" || x.k === "leib" || /^stoff_/.test(x.k))) return;
            var a = x.o.geometry.attributes;
            for (var i = 0; i < x.P.length / 3; i++) {
                var gw = {};
                for (var k = 0; k < 4; k++) {
                    var nm = sk.skinJoints[a.skinIndex.array[4 * i + k]];
                    gw[nm] = (gw[nm] || 0) + a.skinWeight.array[4 * i + k];
                }
                E.push({ p: [x.P[3 * i] * CM, x.P[3 * i + 1] * CM, x.P[3 * i + 2] * CM], gw: gw });
            }
        });
        var lage = {};
        sk.skinJoints.forEach(function (n) {
            if (n !== sk.root) lage[n] = _mul(N.lage(n), CM);
        });
        var G = {};
        _reliefGlieder(lage).forEach(function (gl) {
            if (gl.sd === 1) G[gl.name] = gl;
        });
        var kette = { oberarm: ["arm1", "elbow1", "hand1"], unterarm: ["arm1", "elbow1", "hand1"], oberschenkel: ["hip1", "knee1", "ankle1"], unterschenkel: ["hip1", "knee1", "ankle1"] }; // prettier-ignore
        G.rumpf = { name: "rumpf", A: [0, lage.hip1[1], 0], u: [0, 1, 0], L: lage.head[1] - lage.hip1[1], ef: [0, 0, 1], el: [1, 0, 0] };
        var drin = function (e, glied) {
            var w = 0;
            if (glied === "rumpf") {
                for (var n in e.gw) if (/^(arm|elbow|hand|knee|ankle)/.test(n)) w += e.gw[n];
                return w < 0.5;
            }
            kette[glied].forEach(function (n) {
                w += e.gw[n] || 0;
            });
            return w >= 0.5;
        };
        // je Glied seine Ecken in Glied-Koordinaten [s·L cm, θ rad, r cm]
        var K = {};
        Object.keys(G).forEach(function (glied) {
            var g2 = G[glied];
            K[glied] = E.filter(function (e) { return drin(e, glied); }).map(function (e) { // prettier-ignore
                var v = _sub(e.p, g2.A), sl = _dot(v, g2.u), q = _sub(v, _mul(g2.u, sl)); // prettier-ignore
                return [sl, Math.atan2(_dot(q, g2.el), _dot(q, g2.ef)), _len(q)];
            });
        });
        var band = E.length < 2500 ? 4 : 1.5;
        var umfang = function (glied, s) {
            var F = [], i; // prettier-ignore
            for (i = 0; i < 36; i++) F.push([0, 0]);
            K[glied].forEach(function (c) {
                if (Math.abs(c[0] - s * G[glied].L) > band) return;
                var f = F[Math.floor((((c[1] / (2 * Math.PI)) % 1) + 1) * 36) % 36];
                f[0] += c[2];
                f[1]++;
            });
            var Rr = F.map(function (f) { return f[1] ? f[0] / f[1] : NaN; }); // prettier-ignore
            if (Rr.filter(isFinite).length < 12) return NaN;
            for (i = 0; i < 36; i++)
                if (!isFinite(Rr[i])) {
                    var a2 = i, b2 = i; // prettier-ignore
                    while (!isFinite(Rr[(a2 + 360) % 36])) a2--;
                    while (!isFinite(Rr[b2 % 36])) b2++;
                    Rr[i] = (Rr[(a2 + 360) % 36] + Rr[b2 % 36]) / 2;
                }
            var U = 0;
            for (i = 0; i < 36; i++) U += Math.sqrt(Rr[i] * Rr[i] + Rr[(i + 1) % 36] * Rr[(i + 1) % 36] - 2 * Rr[i] * Rr[(i + 1) % 36] * Math.cos(Math.PI / 18));
            return U;
        };
        var extrem = function (glied, s0, s1, gross) {
            var best = NaN;
            for (var s = s0; s <= s1 + 1e-9; s += 0.03) {
                var u = umfang(glied, s);
                if (isFinite(u) && (!isFinite(best) || (gross ? u > best : u < best))) best = u;
            }
            return best;
        };
        // der Abstand der Fläche zur Achse an (s, θ Grad): Gauß σ 1,2 cm über die Ecken des Glieds
        var radius = function (glied, s, thGrad) {
            var th = (thGrad * Math.PI) / 180, W = 0, S = 0; // prettier-ignore
            K[glied].forEach(function (c) {
                var ds = c[0] - s * G[glied].L, dt = c[1] - th; // prettier-ignore
                dt = Math.atan2(Math.sin(dt), Math.cos(dt));
                var e = (ds * ds + c[2] * dt * c[2] * dt) / (2 * 1.44);
                if (e > 6 || Math.abs(dt) > 1) return;
                var w = Math.exp(-e);
                W += w;
                S += w * c[2];
            });
            return W > 1e-6 ? S / W : NaN;
        };
        var tiefe = function (a, b, c) {
            return 10 * (radius.apply(null, a) - (radius.apply(null, b) + radius.apply(null, c)) / 2);
        };
        var U = { oberarm: extrem("oberarm", 0.45, 0.6, true), handgelenk: extrem("unterarm", 0.85, 0.97, false), oberschenkel: extrem("oberschenkel", 0.38, 0.5, true), knie: umfang("oberschenkel", 1.0), wade: extrem("unterschenkel", 0.15, 0.45, true), knoechel: extrem("unterschenkel", 0.82, 0.96, false) }; // prettier-ignore
        return {
            umfang: U,
            armZuHandgelenk: U.oberarm / U.handgelenk,
            schenkelZuKnie: U.oberschenkel / U.knie,
            wadeZuKnoechel: U.wade / U.knoechel,
            wirbelFurche: tiefe(["rumpf", 0.42, 180], ["rumpf", 0.42, 164], ["rumpf", 0.42, -164]),
            brustbeinRinne: tiefe(["rumpf", 0.64, 0], ["rumpf", 0.64, 15], ["rumpf", 0.64, -15]),
            kniekehle: tiefe(["oberschenkel", 1.0, 180], ["oberschenkel", 0.85, 180], ["unterschenkel", 0.16, 180]),
            kniescheibe: tiefe(["oberschenkel", 0.98, 0], ["oberschenkel", 0.85, 0], ["unterschenkel", 0.16, 0]),
            ellbogenSpitze: tiefe(["oberarm", 1.0, 180], ["oberarm", 0.84, 180], ["unterarm", 0.18, 180]),
        };
    }

    // DAS URTEIL DES KOPFS AM GUSS (K57, gate:mensch-anatomie KOPF; die Bänder KOPF_SOLL): am Guss `g` (Ofen L0, `gussNetze`) —
    // augenVorstand = je Augapfel sein Scheitel vor dem Median der Kopf-Haut im Ring 1,0–1,8 Augapfel-Radien um ihn (vor seinem
    // hintersten Punkt), / die Höhe der Kopf-Haut; augeFrei = der Anteil der Iris-Vorderseite, den kein Dreieck der Kopf-Haut nach
    // vorn (+z) verdeckt (beide Seiten der Dreiecke, das Gesetz von three `Ray.intersectTriangle`); haarDeckung = der Anteil der
    // Kopf-Haut über der Haarlinie (`haarH` Pupillen-Abstände über ihrem tiefsten Punkt — der Abstand im Guss: die Mitten der
    // Iris), der den Ton der Kappe trägt (`aTon`); kopfDreiecke = die Dreiecke an Kopf, Augen, Iris und Lidern.
    function kopfGussUrteil(g, haarH) {
        var L = gussNetze(g, false);
        var ecken = function (x) {
            var o = [];
            for (var i = 0; i < x.P.length; i += 3) o.push([x.P[i], x.P[i + 1], x.P[i + 2]]);
            return o;
        };
        var spanne = function (P, d) {
            var a = Infinity,
                b = -Infinity;
            P.forEach(function (p) {
                a = Math.min(a, p[d]);
                b = Math.max(b, p[d]);
            });
            return { a: a, b: b, l: b - a, m: (a + b) / 2 };
        };
        var von = function (k) {
            return L.filter(function (x) {
                return x.k === k;
            }).map(ecken);
        };
        var haut = L.filter(function (x) {
            return x.k === "haut" && x.j === "head" && x.I;
        })[0];
        var tris = 0;
        L.forEach(function (x) {
            if (/^(head|eye[LR]|iris[LR]|lid[TB][LR])$/.test(x.j)) tris += x.I ? x.I.length / 3 : x.P.length / 9;
        });
        // DER RAHMEN DER STRÄHNE (w25-haar-albedo, KOPF_SOLL haarRahmen): der Anteil der Bänder des Haars, die der EINE Leser
        // `haarAchse` als Strähne liest — ohne Band 0. DIE MUTANTE IM MASS (die Linse ist nie vakuös): dieselben Ecken mit der Wurzel
        // × 0,7 (das Gesetz der Ecken gebrochen) — bricht der Leser nicht jedes ihrer Bänder, ist das Maß 0
        var hz = [0, 0, 0];
        L.forEach(function (x) {
            var a = x.k === "hair" && x.o.geometry.attributes;
            if (!a || !a.color || !a.aTon) return;
            var r = haarAchse(a.position.array, a.color.array, a.aTon.array),
                m = Float32Array.from(a.color.array);
            for (var i = 0; i + 3 < a.aTon.count; i += 4) for (var c = 0; c < 6; c++) m[i * 3 + c] *= 0.7;
            hz[0] += r.zahl;
            hz[1] += r.bruch;
            hz[2] += haarAchse(a.position.array, m, a.aTon.array).bruch < r.zahl ? 1 : 0;
        });
        var rahmen = hz[0] && !hz[2] ? hz[0] / (hz[0] + hz[1]) : 0;
        if (!haut) return { augenVorstand: NaN, augeFrei: NaN, haarDeckung: NaN, kopfDreiecke: tris, mundFalte: NaN, haarRahmen: rahmen }; // prettier-ignore
        var hp = ecken(haut),
            hy = spanne(hp, 1),
            I = haut.I,
            vorstand = -Infinity;
        // DAS STACHELHAAR (w28-mensch-samen, KOPF_SOLL haarStachel): der Anteil der Strähnen des Haars, die näher als 60° an der
        // Normale des Kopfs stehen — die Spitze steht um mehr als die halbe Länge der Strähne (sin 30°) höher über der Kopf-Haut
        // als die Wurzel. Die Höhe eines Punkts: sein Abstand längs der Normale der nächsten Ecke der Kopf-Haut (samt der Kappe des
        // Haars, wie der Ofen sie goss); die Wurzel unter der Haut zählt ab der Haut, eine begrabene Strähne sieht niemand. Die
        // Strähne ist der Rahmen des EINEN Lesers `haarAchse`. Eine liegende Strähne (HAAR_STRICH) steht um 90° zur Normale, eine
        // Kreuz-Karte auf der Schale (afro bis w28-mensch-samen: 1,000) in ihr.
        var stachel = [0, 0];
        var hoehe = function (px, py, pz) {
            var bd = Infinity,
                bi = 0;
            for (var h = 0; h < haut.P.length; h += 3) {
                var d2 = (haut.P[h] - px) * (haut.P[h] - px) + (haut.P[h + 1] - py) * (haut.P[h + 1] - py) + (haut.P[h + 2] - pz) * (haut.P[h + 2] - pz);
                if (d2 < bd) (bd = d2), (bi = h);
            }
            return (px - haut.P[bi]) * haut.N[bi] + (py - haut.P[bi + 1]) * haut.N[bi + 1] + (pz - haut.P[bi + 2]) * haut.N[bi + 2];
        };
        L.forEach(function (x) {
            var at = x.k === "hair" && x.o.geometry.attributes;
            if (!at || !at.color || !at.aTon) return;
            var r = haarAchse(x.P, at.color.array, at.aTon.array),
                P = x.P;
            for (var i = 0; i + 3 < at.aTon.count; i += 4) {
                var l = r.achse[i * 2 + 1],
                    q = 3 * i;
                if (!(l > 0)) continue;
                stachel[0]++;
                if (hoehe((P[q + 6] + P[q + 9]) / 2, (P[q + 7] + P[q + 10]) / 2, (P[q + 8] + P[q + 11]) / 2) - Math.max(0, hoehe((P[q] + P[q + 3]) / 2, (P[q + 1] + P[q + 4]) / 2, (P[q + 2] + P[q + 5]) / 2)) > 0.5 * l) stachel[1]++;
            }
        });
        var haarStachel = stachel[0] ? stachel[1] / stachel[0] : 0;
        von("eye").forEach(function (bp) {
            var sx = spanne(bp, 0),
                sy = spanne(bp, 1),
                sz = spanne(bp, 2),
                rb = sx.l / 2;
            var zs = hp
                .filter(function (p) {
                    var d = Math.hypot(p[0] - sx.m, p[1] - sy.m);
                    return d >= rb && d <= 1.8 * rb && p[2] > sz.a;
                })
                .map(function (p) {
                    return p[2];
                })
                .sort(function (a, b) {
                    return a - b;
                });
            vorstand = Math.max(vorstand, (sz.b - (zs.length ? zs[zs.length >> 1] : NaN)) / hy.l);
        });
        // der Strahl nach +z aus o gegen das Dreieck abc: Möller–Trumbore mit der Richtung (0, 0, 1), beide Seiten
        var trifft = function (o) {
            for (var t = 0; t < I.length; t += 3) {
                var a = hp[I[t]],
                    e1 = _sub(hp[I[t + 1]], a),
                    e2 = _sub(hp[I[t + 2]], a),
                    n = _cross(e1, e2),
                    s = n[2] > 0 ? 1 : -1,
                    q = _sub(o, a);
                if (!n[2]) continue;
                var u = s * (q[0] * e2[1] - q[1] * e2[0]),
                    w = s * (e1[0] * q[1] - e1[1] * q[0]);
                if (u >= 0 && w >= 0 && u + w <= Math.abs(n[2]) && -s * _dot(q, n) >= 0) return true;
            }
            return false;
        };
        var irisN = 0,
            frei = 0;
        var iris = von("iris");
        iris.forEach(function (ip) {
            var zc = spanne(ip, 2).m;
            ip.forEach(function (p) {
                if (p[2] <= zc) return;
                irisN++;
                if (!trifft(p)) frei++;
            });
        });
        var ton = haut.o.geometry.attributes.aTon,
            yHaar = hy.a + haarH * (iris.length === 2 ? Math.abs(spanne(iris[0], 0).m - spanne(iris[1], 0).m) : NaN),
            kal = 0,
            bedeckt = 0;
        hp.forEach(function (p, i) {
            if (!(p[1] >= yHaar)) return;
            kal++;
            if (ton && ton.getX(i) === menschTon("haarKappe")) bedeckt++;
        });
        // DIE FALTE UNTER DEM MUND (KOPF_SOLL mundFalte): neben den Lippen (`aTon` lips), vorn — der Anteil der dunklen Ecken
        var farbe = haut.o.geometry.attributes.color,
            lippen = hp.filter(function (p, i) {
                return ton && ton.getX(i) === menschTon("lips");
            }),
            luma = function (i) {
                return 0.2126 * farbe.getX(i) + 0.7152 * farbe.getY(i) + 0.0722 * farbe.getZ(i);
            },
            // nur der Ton der Haut zählt (die Kappe des Haars, die Braue und die Lippe tragen ihren eigenen)
            istHaut = function (i) {
                return ton.getX(i) === menschTon("skin");
            },
            falte = NaN;
        if (farbe && lippen.length) {
            var lx = spanne(lippen, 0),
                ly = spanne(lippen, 1),
                lz = spanne(lippen, 2),
                toene = [],
                zone = 0,
                dunkel = 0;
            hp.forEach(function (p, i) {
                if (istHaut(i)) toene.push(luma(i));
            });
            toene.sort(function (a, b) {
                return a - b;
            });
            var hell = toene[Math.floor(0.9 * (toene.length - 1))];
            hp.forEach(function (p, i) {
                if (!istHaut(i) || !(Math.abs(p[0] - lx.m) > 0.75 * lx.l && p[1] > ly.a - 1.5 * ly.l && p[1] < ly.b && p[2] > lz.a - lx.l)) return;
                zone++;
                if (luma(i) < 0.4 * hell) dunkel++;
            });
            falte = zone ? dunkel / zone : NaN;
        }
        return { augenVorstand: vorstand, augeFrei: irisN ? frei / irisN : NaN, haarDeckung: kal ? bedeckt / kal : NaN, kopfDreiecke: tris, mundFalte: falte, haarRahmen: rahmen, haarStachel: haarStachel }; // prettier-ignore
    }

    // DIE ANLAGE (w11-koerper): die Hülle des Rumpfs weicht dem ruhenden Arm. Der Arm ruht mit SEINER Hülle am Kern des Rumpfs
    // (`_armRuhe`, ARM_RUHE.luft); was der Rumpf darüber trägt — Haut, Stoff, das Fett-Depot (studios.K1) — und das Depot des
    // Arms schiebt er beiseite, in drei Schritten an der Gestalt der Stufe (Rumpf-Ecke = Gewicht an Rumpf und Wurzel > 0,5):
    //   1) WEICHEN: je Seite die gezeichnete Hülle des Arms (die größte Höhe seiner Ecken jenseits des Saums über seinen Kugeln,
    //      erste Ordnung des Ellipsoids wie `_armRuhe`); jede Rumpf-Ecke, die tiefer liegt als diese Hülle plus `spalt`, weicht
    //      waagrecht zur Mitte des Leibs (nie durch den Arm hindurch), bis sie die Höhe hält — im Saum der Naht (naht ± saum)
    //      eingeblendet;
    //   2) ENTSPANNEN: `entspannen` Runden lang rückt jede Rumpf-Ecke im Umkreis `rand` (längs der Fläche) der gewichenen zur
    //      Mitte ihrer Rumpf-Nachbarn und weicht wieder — die Mulde läuft weich aus, eine gestauchte Falte glättet sich;
    //   3) DAS GESETZ DES STOFFS (TUCH_GESETZ, die Haut unter dem Tuch): keine Ecke des Arms jenseits des Saums liegt weniger als
    //      zwei Luft-Breiten über der Halb-Ebene ihrer nächsten Rumpf-Ecken (im Radius hautM über alle Hüllen, jede im Band
    //      bandM um die nächste) — sonst sinkt die verletzte längs ihrer Normale (frisch aus den Dreiecken), bis zu acht Runden.
    // `huellen`: je Hülle die Lagen (xyz im Raum der Gestalt, Ruhe-Pose — sie werden verschoben), skinIndex, skinWeight und der
    // Index der Dreiecke; `gelenke` die Namen der Gelenk-Indizes. Antwort: die Zahl der Verschiebungen. Leser: der Ofen
    // (bakeMenschInstance, nach dem Kollaps auf die Zeile); das Urteil `armRuheUrteil` (gate:mensch-anatomie RUHE).
    function armAnlage(B, huellen, gelenke) {
        var A = ARM_RUHE,
            P = B.parts,
            W = B.character,
            q = [0, 0, 0],
            seiten = [],
            bewegt = 0;
        var unter = function (n, t) {
            for (; n; n = n.parent) if (n === t) return true;
            return false;
        };
        // je Gelenk-Index seine Klasse (1 Rumpf · 2 rechter Arm · 3 linker Arm), je Hülle und Ecke die Klasse über 0,5 Gewicht
        var klasse = gelenke.map(function (g) {
            return g === "torso" || g === "mensch" ? 1 : /^(arm|elbow|hand)1$/.test(g) ? 2 : /^(arm|elbow|hand)-1$/.test(g) ? 3 : 0;
        });
        huellen.forEach(function (h) {
            h.kl = new Uint8Array(h.n);
            for (var i = 0; i < h.n; i++) {
                var w = [0, 0, 0, 0];
                for (var k = 4 * i; k < 4 * i + 4; k++) w[klasse[h.si[k]]] += h.sw[k];
                h.kl[i] = w[1] > 0.5 ? 1 : w[2] > 0.5 ? 2 : w[3] > 0.5 ? 3 : 0;
            }
        });
        var laenge = function (x, y, z) {
            return Math.sqrt(x * x + y * y + z * z);
        };
        // die Höhe eines Punkts über dem nächsten Ellipsoid (q: dessen Normale)
        var hoehe = function (E, x, y, z, R) {
            var best = Infinity;
            for (var k = 0; k < E.length; k++) {
                var e = E[k], dx = x - e.t[0], dy = y - e.t[1], dz = z - e.t[2], L = e.li;
                if (dx * dx + dy * dy + dz * dz > (e.R + R) * (e.R + R)) continue;
                var qx = L[0] * dx + L[1] * dy + L[2] * dz, qy = L[3] * dx + L[4] * dy + L[5] * dz, qz = L[6] * dx + L[7] * dy + L[8] * dz;
                var l = laenge(qx, qy, qz) || 1e-9;
                var gx = (L[0] * qx + L[3] * qy + L[6] * qz) / l, gy = (L[1] * qx + L[4] * qy + L[7] * qz) / l, gz = (L[2] * qx + L[5] * qy + L[8] * qz) / l;
                var g = laenge(gx, gy, gz) || 1e-9, d = (l - e.r) / g;
                if (d < best) {
                    best = d;
                    q[0] = gx / g;
                    q[1] = gy / g;
                    q[2] = gz / g;
                }
            }
            return best;
        };
        ["1", "-1"].forEach(function (sd, si) {
            var E = [];
            B.kugeln.forEach(function (kg) {
                if (A.klassen.indexOf(kg.k) < 0 || !unter(kg.n, P["arm" + sd]) || unter(kg.n, P["deltoid" + sd])) return;
                var M = _affVon(kg.n, W);
                E.push({ li: _m3inv(M, 0, new Float64Array(9)), t: [M[9], M[10], M[11]], r: kg.r, R: kg.r * Math.max(laenge(M[0], M[1], M[2]), laenge(M[3], M[4], M[5]), laenge(M[6], M[7], M[8])) });
            });
            var S = _affVon(P["arm" + sd], W), El = _affVon(P["elbow" + sd], W), H = _affVon(P["hand" + sd], W),
                ax = El[9] - S[9], ay = El[10] - S[10], az = El[11] - S[11], l2 = ax * ax + ay * ay + az * az;
            var Z = {
                E: E,
                kl: 2 + si,
                // die Mitte des Leibs von der Achse des Arms aus (Schulter → Ellbogen → Hand, ihr nächster Punkt), waagrecht
                mitte: function (x, y, z) {
                    var best = null, bd = Infinity;
                    [[S, El], [El, H]].forEach(function (g) {
                        var u = [g[1][9] - g[0][9], g[1][10] - g[0][10], g[1][11] - g[0][11]], uu = u[0] * u[0] + u[1] * u[1] + u[2] * u[2] || 1e-9,
                            s = Math.max(0, Math.min(1, ((x - g[0][9]) * u[0] + (y - g[0][10]) * u[1] + (z - g[0][11]) * u[2]) / uu)),
                            c = [g[0][9] + s * u[0], g[0][10] + s * u[1], g[0][11] + s * u[2]], d = (x - c[0]) * (x - c[0]) + (y - c[1]) * (y - c[1]) + (z - c[2]) * (z - c[2]);
                        if (d < bd) {
                            bd = d;
                            best = c;
                        }
                    });
                    return [-best[0], -best[2]];
                },
                // der Anteil im Saum: 0 über naht − saum, 1 ab naht + saum (die Arm-Ecken des Urteils)
                f: function (p, i) {
                    return Math.min(1, (((p[i] - S[9]) * ax + (p[i + 1] - S[10]) * ay + (p[i + 2] - S[11]) * az) / l2 - A.naht + A.saum) / (2 * A.saum));
                },
            };
            var huelle = 0;
            huellen.forEach(function (h) {
                for (var i = 0; i < h.n; i++) if (h.kl[i] === Z.kl && Z.f(h.pos, 3 * i) >= 1) huelle = Math.max(huelle, hoehe(E, h.pos[3 * i], h.pos[3 * i + 1], h.pos[3 * i + 2], 1));
            });
            Z.soll = huelle + A.spalt;
            seiten.push(Z);
        });
        // 1) eine Rumpf-Ecke weicht beiden Armen (bis zu vier Runden) waagrecht zur Mitte des Leibs, je Runde um das Fehlende durch
        // die Steigung der Höhe in dieser Richtung (mindestens 0,3), im Saum um den Anteil f; Antwort: ob sie wich
        // die Lage einer Hülle über der Haut (`h.lage`, w21-leib-bau: der Stoff aus der Haut trägt seine Dicke) — sie weicht bis ihre
        // Höhe über dem Arm um sie größer ist: Haut und Stoff fielen sonst am Bund neben der Hand auf DIESELBE Fläche, und die Haut
        // unter dem Saum stach als Sägezahn durch ihn
        // DIE FOLGE DER LAGEN (w28-mensch-samen, ARM_RUHE.durch): der Arm liegt AUSSEN — die äußerste Lage des Rumpfs liegt ihm am
        // nächsten, die Haut am tiefsten. Jede Hülle weicht, bis sie um die Lagen ÜBER ihr tiefer unter dem Arm liegt (`tief`): die
        // äußerste um ihre Lage (`lageMax`, wie bisher — der Stand der Welt hält den Arm frei), die Haut um zwei, der Stoff
        // dazwischen um seinen Rest zur äußersten mehr, ein Stoff, der über dem Leib fällt (der
        // Poncho: seine Lage steht `faelltAb` über der Haut), um nichts — er zählt nicht zu den Lagen unter dem Arm. Bis hier wich der Stoff um SEINE Lage tiefer als die Haut: in der Mulde unter
        // dem Arm lag die Haut ÜBER dem Hemd (Ofen L0, Ruhe: 52 / 36 Ecken der Rumpf-Haut über dem Stoff an den schweren Körpern
        // von ARM_RUHE.koerper) — die Welt zeigte den Streifen, sobald der Arm die Mulde freigab.
        // WAS ÜBER DEM ARM FÄLLT, WEICHT IHM NICHT (`ueber`, nur der fallende Stoff `h.faellt`): zeigt die Mitte des Leibs von der
        // Ecke aus IN den Arm (der Anteil seiner Normale an ihr unter −`ueber`), liegt die Ecke außen über ihm — der Poncho fällt
        // über den Arm; bis hier schob die Anlage ihn durch den Arm an den Rumpf (er lag wie eingeschweißt, der Arm stach aus ihm).
        var lageMax = 0;
        huellen.forEach(function (h) {
            var mt = h.m && h.m.material;
            h.haut = !!(mt && mt.userData && mt.userData.__klasse === "haut");
            h.faellt = !h.haut && h.lage >= A.faelltAb;
            h.rumpf = false;
            for (var i = 0; i < h.n && !h.rumpf; i++) h.rumpf = h.kl[i] === 1;
            if (h.rumpf && !h.faellt && h.lage > lageMax) lageMax = h.lage;
        });
        huellen.forEach(function (h) {
            h.tief = h.faellt ? 0 : lageMax + Math.max(0, lageMax - (h.haut ? 0 : h.lage || 0));
        });
        var weiche = function (h, o) {
            var hob = false;
            for (var s = 0; s < seiten.length; s++) {
                var Z = seiten[s], f = Z.f(h.pos, o), soll = Z.soll + h.tief;
                if (f <= 0) continue;
                for (var runde = 0; runde < 4; runde++) {
                    var d = hoehe(Z.E, h.pos[o], h.pos[o + 1], h.pos[o + 2], soll);
                    if (d >= soll) break;
                    var u = Z.mitte(h.pos[o], h.pos[o + 1], h.pos[o + 2]), ul = Math.sqrt(u[0] * u[0] + u[1] * u[1]) || 1e-9;
                    if (h.faellt && (u[0] * q[0] + u[1] * q[2]) / ul < -A.ueber) break;
                    var k = (f * (soll - d)) / ul / Math.max(0.3, (u[0] * q[0] + u[1] * q[2]) / ul);
                    h.pos[o] += k * u[0];
                    h.pos[o + 2] += k * u[1];
                    hob = true;
                    if (f < 1) break;
                }
            }
            return hob;
        };
        huellen.forEach(function (h) {
            var gewichen = [], i, c, k;
            for (i = 0; i < h.n; i++) if (h.kl[i] === 1 && weiche(h, 3 * i)) gewichen.push(i);
            if (!gewichen.length) return;
            bewegt += gewichen.length;
            // 2) die Nachbarn aus den Dreiecken, der Umkreis `rand` längs der Fläche (nur Rumpf-Ecken), die Entspannung
            var nb = [], kanten = new Map();
            for (i = 0; i < h.n; i++) nb.push([]);
            for (var t = 0; t < h.idx.length; t += 3)
                for (var e = 0; e < 3; e++) {
                    var a = h.idx[t + e], b = h.idx[t + ((e + 1) % 3)], key = a < b ? a * h.n + b : b * h.n + a;
                    kanten.set(key, (kanten.get(key) || 0) + 1);
                    if (nb[a].indexOf(b) < 0) nb[a].push(b);
                    if (nb[b].indexOf(a) < 0) nb[b].push(a);
                }
            // der Rand einer Hülle (der Saum des Stoffs, der Rand der Haut unter ihm) entspannt sich entlang SEINER Kanten (w21-leib-bau):
            // im Mittel mit seinen inneren Nachbarn zog er sich ungleich ein — der Bund neben der Hand stand als Sägezahn
            var rand = [];
            kanten.forEach(function (z, key) {
                if (z !== 1) return;
                var a = Math.floor(key / h.n), b = key % h.n;
                (rand[a] || (rand[a] = [])).push(b);
                (rand[b] || (rand[b] = [])).push(a);
            });
            var weit = new Float64Array(h.n).fill(Infinity), frei = gewichen.slice();
            for (i = 0; i < frei.length; i++) weit[frei[i]] = 0;
            for (var z = 0; z < frei.length; z++) {
                var v = frei[z];
                for (k = 0; k < nb[v].length; k++) {
                    var w = nb[v][k], dw = weit[v] + laenge(h.pos[3 * w] - h.pos[3 * v], h.pos[3 * w + 1] - h.pos[3 * v + 1], h.pos[3 * w + 2] - h.pos[3 * v + 2]);
                    if (h.kl[w] !== 1 || dw > A.rand || dw >= weit[w]) continue;
                    if (weit[w] === Infinity) frei.push(w);
                    weit[w] = dw;
                }
            }
            var neu = new Float64Array(3 * h.n);
            for (var r = 0; r < A.entspannen; r++) {
                for (z = 0; z < frei.length; z++) {
                    var m = [0, 0, 0], n = 0, L = rand[(v = frei[z])] || nb[v];
                    for (k = 0; k < L.length; k++) {
                        if (h.kl[L[k]] !== 1) continue;
                        n++;
                        for (c = 0; c < 3; c++) m[c] += h.pos[3 * L[k] + c];
                    }
                    for (c = 0; c < 3; c++) neu[3 * v + c] = n ? 0.5 * (h.pos[3 * v + c] + m[c] / n) : h.pos[3 * v + c];
                }
                for (z = 0; z < frei.length; z++) {
                    for (c = 0; c < 3; c++) h.pos[3 * frei[z] + c] = neu[3 * frei[z] + c];
                    weiche(h, 3 * frei[z]);
                }
            }
        });
        // 3) das Gesetz des Stoffs: je Runde die Normalen frisch, ein Gitter der Rumpf-Ecken (Kante hautM), je Arm-Ecke die Probe
        var me = leibMassstab(), luft = (2 * TUCH_GESETZ.luftM) / me, rad = TUCH_GESETZ.hautM / me, band = TUCH_GESETZ.bandM / me;
        var schluessel = function (x, y, z) {
            return (Math.floor(x / rad) + 512) * 1048576 + (Math.floor(y / rad) + 512) * 1024 + (Math.floor(z / rad) + 512);
        };
        for (var runde = 0; runde < 8; runde++) {
            var zellen = new Map(), verletzt = 0;
            huellen.forEach(function (h) {
                h.N = _flaechenNormalen(h.pos, h.idx, h.n);
                for (var i = 0; i < h.n; i++) {
                    if (h.kl[i] !== 1) continue;
                    var s = schluessel(h.pos[3 * i], h.pos[3 * i + 1], h.pos[3 * i + 2]);
                    if (!zellen.has(s)) zellen.set(s, []);
                    zellen.get(s).push(h, 3 * i);
                }
            });
            seiten.forEach(function (Z) {
                huellen.forEach(function (ha) {
                    for (var j = 0; j < ha.n; j++) {
                        var o = 3 * j;
                        if (ha.kl[j] !== Z.kl || Z.f(ha.pos, o) < 1) continue;
                        var x = ha.pos[o], y = ha.pos[o + 1], z = ha.pos[o + 2], bd = rad * rad, kand = [], s0 = schluessel(x, y, z);
                        for (var a = -1; a <= 1; a++)
                            for (var b = -1; b <= 1; b++)
                                for (var c = -1; c <= 1; c++) {
                                    var L = zellen.get(s0 + a * 1048576 + b * 1024 + c);
                                    for (var k = 0; L && k < L.length; k += 2) {
                                        var hh = L[k], ii = L[k + 1], d2 = (x - hh.pos[ii]) * (x - hh.pos[ii]) + (y - hh.pos[ii + 1]) * (y - hh.pos[ii + 1]) + (z - hh.pos[ii + 2]) * (z - hh.pos[ii + 2]);
                                        if (d2 >= rad * rad) continue;
                                        kand.push(hh, ii, d2);
                                        if (d2 < bd) bd = d2;
                                    }
                                }
                        var rb = (Math.sqrt(bd) + band) * (Math.sqrt(bd) + band);
                        for (k = 0; k < kand.length; k += 3) {
                            var bh = kand[k], bi = kand[k + 1];
                            if (kand[k + 2] > rb) continue;
                            var hoch = (x - bh.pos[bi]) * bh.N[bi] + (y - bh.pos[bi + 1]) * bh.N[bi + 1] + (z - bh.pos[bi + 2]) * bh.N[bi + 2];
                            if (hoch >= luft) continue;
                            for (c = 0; c < 3; c++) bh.pos[bi + c] -= (luft - hoch) * bh.N[bi + c];
                            verletzt++;
                        }
                    }
                });
            });
            bewegt += verletzt;
            if (!verletzt) break;
        }
        return bewegt;
    }
    // die Normalen einer Fläche je Ecke (die Summe der Dreiecks-Kreuzprodukte, flächengewichtet wie computeVertexNormals), Einheit
    function _flaechenNormalen(pos, idx, n) {
        var N = new Float64Array(3 * n);
        for (var t = 0; t < idx.length; t += 3) {
            var a = 3 * idx[t], b = 3 * idx[t + 1], c = 3 * idx[t + 2],
                ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2],
                vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2],
                nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
            for (var e = 0; e < 3; e++) {
                var v = 3 * idx[t + e];
                N[v] += nx;
                N[v + 1] += ny;
                N[v + 2] += nz;
            }
        }
        for (var i = 0; i < 3 * n; i += 3) {
            var l = Math.sqrt(N[i] * N[i] + N[i + 1] * N[i + 1] + N[i + 2] * N[i + 2]) || 1;
            N[i] /= l;
            N[i + 1] /= l;
            N[i + 2] /= l;
        }
        return N;
    }

    // DAS GESICHT AUS DEM GENOM (mensch.K4, rein additiv — ohne seine Dials bleibt jeder Guss byte-gleich): vier Achsen in [0, 1],
    // die der Genom-Roller des Wirts aus der Saat zieht (`_rollHumanoidGenome`), wie die Gesichts-Parameter eines MetaHuman — je
    // Achse ihr Bereich: `auge` die Größe des Auges samt Iris, Pupille und Lidern (der Augapfel tiefer um sein Mehr: die Hornhaut
    // bleibt, wo sie war, augenVorstand hält), `mund` die Breite der Lippen, `braue` die Höhe der Brauen über der Lidspalte (Kopf-
    // Einheiten; den Ton der Braue liest der Ofen an ihren Haaren), `haaransatz` die Höhe der Haar-Kappe (`haarKappe`: die Stirn
    // höher oder tiefer). Die Bereiche halten MENSCH_SOLL und KOPF_SOLL über jede Gestalt der Menge (augapfel, iris, mund ×
    // Breite ±3 %; mundZuPupille ≥ 0,78). Leser: morphAuf (Lab, Ofen, Linse), haarKappe (Ofen L0–L3).
    var GESICHT_GENOM = Object.freeze({
        auge: Object.freeze([0.98, 1.08]),
        mund: Object.freeze([0.97, 1.06]),
        braue: Object.freeze([-0.012, 0.012]),
        haaransatz: Object.freeze([-0.012, 0.008]),
    });
    function gesichtWert(dials, k) {
        var v = dials ? dials[k] : null,
            b = GESICHT_GENOM[k];
        return typeof v === "number" && isFinite(v) ? b[0] + (b[1] - b[0]) * Math.max(0, Math.min(1, v)) : null;
    }
    // die Achsen am Baum (idempotent: jede Größe gegen ihre Basis, gemerkt beim ersten Ruf — die Regler des Labors rufen oft)
    function gesichtAuf(B, dials) {
        var A = B && B.augen;
        if (!A) return;
        var basis = function (n) {
            return n.userData.__gesichtBasis || (n.userData.__gesichtBasis = { s: n.scale.clone(), p: n.position.clone() });
        };
        var fa = gesichtWert(dials, "auge"),
            fm = gesichtWert(dials, "mund"),
            db = gesichtWert(dials, "braue");
        if (fa !== null)
            [A.eyeL, A.eyeR].forEach(function (e) {
                var b = basis(e);
                e.scale.copy(b.s).multiplyScalar(fa);
                e.position.z = b.p.z - 0.12 * b.s.z * (fa - 1);
            });
        if (fm !== null)
            [A.upperLipRef, A.lowerLipRef].forEach(function (l) {
                l.scale.x = basis(l).s.x * fm;
            });
        if (db !== null)
            [A.browL, A.browR].forEach(function (g) {
                g.position.y = basis(g).p.y + db;
            });
    }

    // AUGEN_VIS — intentional dual iris (Feel-Entscheid .131). Do NOT merge.
    // lab:"gaze-iris" = koerperstudio gaze `_gz` + irisSpeed noise + blinkRate lids.
    // host:"noise-iris" = `_animateHumanoidAugen` irisSpeed sin-noise + blinkRate lids (no gaze).
    // Like TILT_VIS .129 / NEBEL_VIS .128 / STEER_VIS .124: naming the Feel, not Fake-zu.
    // Gaze look-at on Host = Redesign later. MOTION irisSpeed/blinkRate stay the numbers.
    var AUGEN_VIS = {
        lab: "gaze-iris",
        host: "noise-iris",
    };

    // KPMUL_VIS — intentional dual (Feel-Entscheid .141/.142). Do NOT merge.
    // lab:"pd-gain" = koerperstudio phys.kp/kd *= kpMul.
    // host:"map-alpha" = humanoid MOTION_RIG_MAP one-pole when kpMul<1 (.142); kpMul>=1 instant.
    // Tetrapoda Host already reads kpMul (.81) — other species, sibling α, not this Feel merge.
    // Still no MOTION_RIG_MAP kpMul row. Like AUGEN_VIS .131.
    var KPMUL_VIS = {
        lab: "pd-gain",
        host: "map-alpha",
    };

    // W8 — die Gestalten je Rezept (B2c): JEDES Rezept trägt GESTALTEN_JE_REZEPT Individuen (ein neues zählt mit).
    for (var _gid in PRESETS) PORTAL_RENDER_CONFIG.lod.budget.gestalten[_gid] = GESTALTEN_JE_REZEPT;

    // ── 0710-4 (rein additiv) — DER LEIB DES MENSCHEN ALS MASSE: die Dichte des Körpers (kg/m³, mit der Luft der Lunge
    //    knapp unter Wasser). Die Masse eines Menschen ist das Volumen seiner geschlossenen Haut (bauMensch) mal dieser
    //    Zahl — EINE Quelle für jeden Stoß (Wirt: _leibMasse). ──
    // ── Welle LF 09.10. (rein additiv) — DER ARM ALS ANTEIL DER MASSE: ein Arm samt Hand wiegt 5,0 % des Körpers (Dempster
    //    1955: Oberarm 2,8 · Unterarm 1,6 · Hand 0,6 %). Eine Maus-Arm-Aktion bewegt ihn samt Gerät — ihre Ausdauer wächst
    //    mit (m_Arm + m_Gerät) / m_Arm (Wirt: _mausAusdauer; die leere Hand trägt aktionAusdauer). ──
    // ── halten.K5 (rein additiv) — DER STURZ IST ENERGIE: den Aufprall des Leibs (m/s, gemessen im Fang der Landung des
    //    Leib-Lösers) tragen die Beine bis schadlosMs (7,7 m/s: ein Fall aus 3 m, √(2g·3)); darüber kostet jedes J/kg der
    //    Aufprall-Energie ½(v² − schadlosMs²) lebenJeJkg Lebenskraft (Wirt: _loopPhysicsSync). Der bloße Leib (Lebenskraft
    //    134) verliert aus 4 m 11, aus 8 m 56, aus 12 m 101 und stirbt aus 15 m (17,2 m/s). ──
    // ── leib.K2 (rein additiv) — DER SPRUNG AUS MASSE UND KRAFT: die Beine strecken den Leib über den Abdruck-Weg abdruckM
    //    (m, die Streckung von Knie und Hüfte aus der Hocke) mit der Kraft F gegen sein Gewicht, ½ m v² = (F − m g) d, also
    //    v = √(2 d (F/m − g)). Die Sprungkraft der Seele (bewegung.jumpPower, m/s) ist das Abdruck-Tempo, das ihre Beine dem
    //    Bezugs-Leib refKg unter der Erd-Schwere refG geben (der Mensch der START_PARAMS: Haut-Volumen × dichteKgM3 = 89,0 kg),
    //    die Kraft F = refKg (refG + v²/2d). Ein schwererer Leib springt niedriger und kürzer, stärkere Beine höher und
    //    weiter (Wirt: _sprungKraft, _sprungAbdruck). ──
    // ── w4-koerper-park (rein additiv) — DIE KOPF-EINHEIT DES MENSCHEN IN DER WELT (m): 8 Kopf-Einheiten sind die Höhe des
    //    Menschen der START_PARAMS (1,7 m); die Gelenk-Einheit des Gusses (labProportionen H = 6) misst 8 · kopfM / H Meter
    //    (`leibMassstab`). Wirt (PLAYER_KH, der Wrap `_buildHumanoidRig`) und Labor (die Bühne des Spiel-Modus in Metern)
    //    lesen DIESE Zahl. ──
    var LEIB = Object.freeze({
        dichteKgM3: 985,
        armAnteil: 0.05,
        sturz: Object.freeze({ schadlosMs: 7.7, lebenJeJkg: 1.15 }),
        sprung: Object.freeze({ abdruckM: 0.4, refKg: 89, refG: 9.81 }),
        kopfM: 0.2125,
        // DIE KAPSEL DES LEIBS (m, am 1-m-Box-Collider geeicht): fussM die Sohle unter der Mitte der Kapsel, stufeM wie hoch der
        // Leib ohne Sprung aufsteigt, haftM wie weit unter den Füßen er am Boden haftet (nur geerdet, nie im Fall), radiusM der
        // Wand-Radius — der Kontakt-Löser der Welt (`_stepCharacter`, PLAYER_*) und der des Labors (die Park-Boxen) lesen sie.
        kapsel: Object.freeze({ fussM: 0.5, stufeM: 0.6, haftM: 0.25, radiusM: 0.35 }),
    });

    // ── K2 (rein additiv) — DIE WEBUNG je Stoff-Art (Kleid-Zeile `webe`): [Frequenz, Tiefe] der Mikro-Struktur, die die
    //    Stoff-Farbe moduliert (Strick grob, Denim/Baumwolle fein, Leder/Gummi glatt) — EINE Tafel für Labor und Welt. ──
    var WEBE = Object.freeze({
        knit: Object.freeze([90, 0.1]),
        wool: Object.freeze([70, 0.08]),
        denim: Object.freeze([160, 0.06]),
        cotton: Object.freeze([140, 0.06]),
        leather: Object.freeze([24, 0.05]),
        rubber: Object.freeze([24, 0.03]),
    });

    // ── VERHALTEN (Meisterkarte mensch.K2, rein additiv; die Form des Kapitels VERHALTEN in tetrapoda-core) — DER TAG EINES
    //    MENSCHEN als REINE Funktion der Uhr: wer er ist (sein Same, die Rolle seines Hauses aus dem Fachwerk-Plan) und
    //    welche Stunde schlägt, ergibt, wo er sein soll und was er dort tut. Kein Zustand, kein Zufall: derselbe Same und
    //    dieselbe Stunde ⇒ dasselbe Wort (bit-gleich). TAGES_GESETZ trägt die Wenden des Tags in Stunden (0–24): aufstehen
    //    (wach), zum Werk (werk[0]), Mittag (mittag), Feierabend (werk[1]), zu Bett (ruhe); jeder Mensch verschiebt jede
    //    Wende um bis zu ±streuH (aus seinem Samen — das Dorf wacht nicht im selben Atemzug). Die Rollen der Häuser mit
    //    eigenem Werk (die Schmiede, die Kirche, das Gasthaus) tragen ihre eigenen Stunden; im Wohnhaus wählt der Same den
    //    Beruf nach `berufe` (markt: der Stand auf dem Platz · feld: der Acker · hof: der eigene Hof). Mittags und abends geht
    //    der Anteil platzMittag / platzAbend auf den Platz, wer mittags nicht dort ist, isst daheim (drinnen; die Rolle mit
    //    mittagAmWerk am Werk). DER MORGENGANG (mensch.K3): die ersten morgenPlatzH Stunden nach dem Aufstehen geht jeder
    //    über den Platz (Brunnen, Markt) — jeder Tag trägt so 4–10 Wege, keiner bleibt an seiner Tür. DER BESUCH (mensch.K3
    //    Staffel 2, ≥ 100 m Weg je Tag): reicht der Wirt einen Ort des Besuchs (die Tür eines anderen Hauses fern von Heim und
    //    Platz), steht der Mensch dort besuchH Stunden — nach dem Werk, wo der Abend sie trägt (eine halbe Stunde vor der Ruhe),
    //    sonst nach dem Morgengang, wo die Zeit bis zum Werk sie trägt. Das Tempo des Gangs ist das Gesetz des Leibs
    //    (tetrapoda tempoEinheit × gang). Leser: der Wirt (`_tickBewohner`, `_bewohnerListe`) und gate:kreatur-takt bewohner. ──
    var TAGES_GESETZ = Object.freeze({
        wach: 6.5,
        werk: Object.freeze([8, 17]),
        mittag: Object.freeze([12, 13]),
        ruhe: 22,
        streuH: 0.5,
        platzMittag: 0.45,
        platzAbend: 0.4,
        morgenPlatzH: 1,
        besuchH: 0.75,
        gang: 1.3,
        rollen: Object.freeze({
            schmiede: Object.freeze({ werk: Object.freeze([7, 18]) }),
            kirche: Object.freeze({ werk: Object.freeze([7, 19]) }),
            gasthaus: Object.freeze({ werk: Object.freeze([10, 23]), ruhe: 23.6, mittagAmWerk: true }),
            // DER FAHRER (PFLICHT-OFFEN C): wer einen Wagen der Stadt fährt (der Wirt gibt ihm die Rolle, `_verkehrAnlegen`), ist
            // von früh bis spät am Steuer — sein Werk ist der Platz seines Wagens, das Mittag fährt er durch; DER NACHTFAHRER
            // lebt denselben Tag um `versatzH` Stunden versetzt (am Steuer von 19 bis 7 Uhr: der Wagen der Stadt fährt bei Tag
            // und bei Nacht, am Platz wechselt die Schicht)
            fahrer: Object.freeze({ werk: Object.freeze([7, 19]), mittagAmWerk: true, haltung: false }),
            nachtfahrer: Object.freeze({ werk: Object.freeze([7, 19]), mittagAmWerk: true, versatzH: 12, haltung: false }),
            // DIE WACHE (PFLICHT-OFFEN A, der Prüfplatz): wer am Platz Wache steht (der Wirt gibt die Rolle zwei Bewohnern, wie
            // dem Fahrer), steht von 6 bis 20 Uhr an seinem Punkt — sein Werk und sein Platz sind der Wache-Punkt, das Mittag hält
            // er durch; DER NACHTWÄCHTER lebt denselben Tag um `versatzH` Stunden versetzt (18 bis 8 Uhr) — zu jeder Stunde steht
            // einer draußen, auch um Mitternacht, wenn jeder andere drinnen schläft (`ruhe`)
            waechter: Object.freeze({ werk: Object.freeze([6, 20]), mittagAmWerk: true, haltung: false }),
            nachtwaechter: Object.freeze({ werk: Object.freeze([6, 20]), mittagAmWerk: true, versatzH: 12, haltung: false }),
        }),
        // DAS VERB DES LEIBS (w28-mensch-menge; Leser: der Wirt `_bewohnerGemuet` → die EINE Emotions-Brücke, gate:koerper-kern
        // VERB): je Akt des Tags (`tagesPlan`) die Haltung, in der sein Leib steht — ein Profil der Bewegung (MOTION): bei der
        // Arbeit über das Werk gebeugt, in der Pause und beim Besuch offen, am Abend müde; der Morgen und jede Rolle mit
        // `haltung: false` (die Wache, der Fahrer am Steuer) stehen neutral. Bis hier schrieb der Wirt den Akt und las ihn nie:
        // jeder Bewohner stand zu jeder Stunde in derselben Haltung.
        haltung: Object.freeze({ arbeit: "pwalk", mittag: "showcase", besuch: "showcase", abend: "sad" }),
        berufe: Object.freeze({ markt: 0.35, feld: 0.3, hof: 0.35 }),
    });
    // DIE HALTUNG ZUM AKT (TAGES_GESETZ.haltung): der Name des Profils der Bewegung oder null (neutral)
    function tagesHaltung(akt, rolle) {
        var R = TAGES_GESETZ.rollen[rolle],
            h = R && R.haltung === false ? null : TAGES_GESETZ.haltung[akt];
        return h && MOTION[h] ? h : null;
    }
    // die Zahl des Samens zu einem Wort: [0, 1), rein (der Same ist eine ganze Zahl, das Wort benennt die Wende)
    function _tagZahl(same, wort) {
        var h = ((same >>> 0) ^ 0x9e3779b9) >>> 0;
        for (var i = 0; i < wort.length; i++) {
            h = Math.imul(h ^ wort.charCodeAt(i), 0x85ebca6b);
            h ^= h >>> 13;
        }
        h = Math.imul(h ^ (h >>> 16), 0xc2b2ae35);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296;
    }
    // DER BERUF: das Werk der Rolle seines Hauses (schmiede · kirche · gasthaus), im Wohnhaus aus dem Samen nach `berufe`
    function berufVon(same, rolle) {
        if (Object.prototype.hasOwnProperty.call(TAGES_GESETZ.rollen, rolle)) return rolle;
        var u = _tagZahl(same, "beruf");
        var B = TAGES_GESETZ.berufe;
        var a = 0;
        for (var k in B) {
            a += B[k];
            if (u < a) return k;
        }
        return "hof";
    }
    // DER PLAN DER STUNDE: heim / werk / platz / besuch sind die Orte des Menschen (der Wirt reicht sie; ohne Werk ist der Hof
    // das Werk, ohne Platz das Heim der Platz, ohne Besuch kein Besuch). Liefert { ort, wo, akt, drinnen } — ort ist einer der
    // gereichten Orte, akt eines von schlaf · morgen · besuch · arbeit · mittag · abend; drinnen = der Mensch ist in seinem Haus
    // (an der Tür ungezeichnet).
    function tagesPlan(same, rolle, heim, werk, stunde, platz, besuch) {
        var G = TAGES_GESETZ;
        var R = G.rollen[rolle] || {};
        var h = (((Number(stunde) - (R.versatzH || 0)) % 24) + 24) % 24;
        var j = function (wort) {
            return (_tagZahl(same, wort) * 2 - 1) * G.streuH;
        };
        var wach = G.wach + j("wach");
        var w0 = (R.werk || G.werk)[0] + j("werk0");
        var w1 = (R.werk || G.werk)[1] + j("werk1");
        var m0 = G.mittag[0] + j("mittag");
        var m1 = m0 + (G.mittag[1] - G.mittag[0]);
        var ruhe = (R.ruhe || G.ruhe) + j("ruhe");
        var w = werk || heim;
        var p = platz || heim;
        var aus = function (wo, akt, drinnen) {
            var ort = wo === "werk" ? w : wo === "platz" ? p : wo === "besuch" ? besuch : heim;
            return { ort: ort, wo: wo, akt: akt, drinnen: !!drinnen };
        };
        var bA = besuch && w1 + G.besuchH <= ruhe - 0.5;
        var bM = besuch && !bA && wach + G.morgenPlatzH + G.besuchH <= w0;
        if (h < wach || h >= ruhe) return aus("heim", "schlaf", true);
        if (h < wach + G.morgenPlatzH) return aus("platz", "morgen", false);
        if (bM && h < wach + G.morgenPlatzH + G.besuchH) return aus("besuch", "besuch", false);
        if (h < w0) return aus("heim", "morgen", false);
        if (h >= m0 && h < m1 && !R.mittagAmWerk)
            return _tagZahl(same, "mittagPlatz") < G.platzMittag ? aus("platz", "mittag", false) : aus("heim", "mittag", true);
        if (h < w1) return aus("werk", "arbeit", false);
        if (bA && h < w1 + G.besuchH) return aus("besuch", "besuch", false);
        return _tagZahl(same, "abendPlatz") < G.platzAbend ? aus("platz", "abend", false) : aus("heim", "abend", false);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  DER EINE BEWEGUNGS-TAKT DES LEIBS (w4-koerper-park, rein additiv) — Labor = Welt: der Ninja-Park des Körperstudios
    //  IST der Spielplatz der Welt. Welt (stamm `_loopPlayerMovement` · `_stepCharacter` · `_gaitTick` · `_animateHumanoidRig`)
    //  und Labor (worlds/koerperstudio, der Spiel-Modus) rufen DIESELBEN Funktionen in derselben Folge je festem Sim-Schritt:
    //    leibPlan     die Eingabe wird Geschwindigkeit — Rutsch, Antrieb und Bremse (fx.bewegung.luft), Sprung-Fenster und
    //                 Boden-Sprung (fx.bewegung.sprung, die Kraft der Beine LEIB.sprung), Wand- und Doppelsprung, Klettern an
    //                 der Wand (fx.bewegung.parkour) und die VERBEN AN DEN GERÄTEN (VERB_GESETZ, das Angebot der Werke des
    //                 Fachwerks: Schaukeln, Rutschen, Klettern, Hangeln, Balancieren, Wippen);
    //    leibImpuls · leibFall · leibLandung   die Vertikale des Kapsel-Schritts und die Erdung nach dem Kontakt des Wirts;
    //    leibGangTakt · leibRigPose            die Phase des EINEN Gang-Gesetzes (tetrapoda gangSchritt) und die Pose der Glieder;
    //    leibVerbPose                          die Pose je Verb und Phase über den EINEN Löser `leibPose` (Hand am Griff-Anker,
    //                                          Fuß am Tritt-Anker, Zwei-Knochen-Kette je Glied).
    //  Der Wirt trägt nur, was seins ist: den Kontakt (Feld und Blocker der Welt, die Substanz der Werke im Labor), die Lage im
    //  Bild und die Seele (Tempo, Sprungkraft, Masse aus seiner Stat-Pipeline — im Labor `leibWerte` und `leibMasse` nach
    //  demselben Gesetz). Die Arcade-Zeile des Labors (NINJA_FEEL: Sprung 15,5 · Klettern 8,5 · Sprint 18 Lab-Einheiten/s
    //  unter der Bühnen-Schwere 44) und ihr Zwillings-Etikett NINJA_VIS fielen mit dieser Welle: das Labor springt, klettert
    //  und läuft, wie die Welt es tut. Jeder Leser ist fail-closed — ein fehlendes Feld bricht laut (`leibGesetz`).
    // ═══════════════════════════════════════════════════════════════════════
    // DIE VERBEN AN DEN GERÄTEN — die Zahlen der Physik je Verb (SI). Das Gerät trägt sein Angebot als Daten (fachwerk WERKE
    // `angebot`: Verb, Griff- und Tritt-Anker, Pendel-Achse, Bahn), der Leib trägt das Gesetz:
    //   schaukeln   das Pendel des Leibs um die Achse der Schaukel: θ'' = −(g/L)·sin θ − daempf·θ' + pumpe·u·sgn θ', L die
    //               Strecke Achse → Schwerpunkt des Sitzenden (die Kette bis zum Sitz minus sitzSchwerpunktM), die Periode
    //               klein ausgelenkt 2π√(L/g); maxRad hält die Kette straff (jenseits fiele sie schlaff), der Absprung trägt
    //               die Bahn-Geschwindigkeit des Sitzes.
    //   rutschen    das Gleiten auf der Bahn: a = g·(sin α − reibung·cos α) je Abschnitt (Stoff auf Blech, Gleitreibung), nie
    //               rückwärts; am Ende der Auslauf in den freien Leib mit der Fahrt der Bahn.
    //   klettern    an Griff und Tritt: der Leib steigt mit parkour.kletterV (die EINE Zahl der Wand), je Glied ein Anker im
    //               Stand, eines im Schwung (Kreuzgang: rechte Hand · linker Fuß · linke Hand · rechter Fuß), die Ausdauer
    //               zehrt wie an der Wand; reichM die Reichweite, in der ein Anker gegriffen wird; die Hand greift
    //               griffUeberM über der Schulter (der Arm streckt sich zum Griff und zieht gebeugt — nie der Griff vor der Brust).
    //   hangeln     am Holm: der Leib hängt unter dem Griff (Pendel um die Hand), jeder Griff-Wechsel ist eine halbe Pendel-
    //               Schwingung π√(L/g) (Brachiation), die Hand greift den nächsten Holm; quer am Reck um querM je Griff.
    //   balancieren auf dem Balken: das Tempo höchstens tempo (Tandem-Gang, Fuß vor Fuß auf der Linie), quer höchstens querMs;
    //               wer die halbe Breite plus fussM verlässt, fällt.
    //   wippen      der Hebel um die Achse: I·φ'' = −m·g·r·cos φ − daempf·φ' (der Sitzende auf seiner Seite), am Boden der Anschlag
    //               (stoss: der Rest der Fahrt nach dem Aufschlag), der Abstoß der Beine hebt um abstossMs.
    var VERB_GESETZ = Object.freeze({
        schaukeln: Object.freeze({ daempf: 0.06, pumpe: 0.55, maxRad: 1.05, sitzSchwerpunktM: 0.3, eintrittM: 0.55 }),
        rutschen: Object.freeze({ reibung: 0.35, eintrittM: 0.5 }),
        klettern: Object.freeze({ reichM: 0.75, schwungSec: 0.26, abstandM: 0.32, griffUeberM: 0.5, reichAnteil: 0.95, seiteM: 0.25, hoeherM: 0.05, ausstiegM: 0.25, ueberHandM: 0.1, griffBeuge: 75 }),
        hangeln: Object.freeze({ reichM: 0.3, querM: 0.18, spreizM: 0.2 }),
        balancieren: Object.freeze({ tempo: 0.5, querMs: 0.15, fussM: 0.05 }),
        wippen: Object.freeze({ daempf: 0.8, stoss: 0.15, abstossMs: 1.6, balkenKg: 45, eintrittM: 0.6 }),
    });
    // die Pflicht-Felder je Block (ein fehlendes ist laut — kein stiller Rückfall auf ein Literal)
    var LEIB_PFLICHT = {
        luft: ["kAcc", "kAccLuft", "kBrake", "kBrakeLuft"],
        sprung: ["coyoteSec", "bufferSec"],
        hang: ["maxSlopeY", "malus"],
        parkour: ["doppelspruenge", "doppelsprungMul", "wandsprungMul", "wandAbstoss", "kletterV", "kletterAusdauerProS", "kontaktFrischeSec", "slideTempoMul", "slideDauerSec", "slideMinTempo"],
        slidePose: ["lehne", "beinVor", "knieKnick", "armStuetz", "armFrei", "kopf"],
        gang: ["schrittBasis", "schrittFroude", "tastgrad", "tastgradLauf", "laufFroude", "maxWinkel", "hub", "hubLauf", "hubForm", "beckenHub", "rollWinkel", "fersenAb", "ballen", "knoechel"],
    };
    var _leibGesetzMemo = null;
    function leibGesetz() {
        if (_leibGesetzMemo) return _leibGesetzMemo;
        var B = PRESETS.mensch.fx.bewegung,
            P = B && B.parkour;
        var block = function (name) {
            return name === "slidePose" ? P && P.slidePose : B && B[name];
        };
        for (var name in LEIB_PFLICHT) {
            var g = block(name);
            if (!g) throw new Error("KERN-PFLICHT verletzt: koerper fx.bewegung." + name + " fehlt (leibGesetz)");
            for (var i = 0; i < LEIB_PFLICHT[name].length; i++)
                if (!isFinite(g[LEIB_PFLICHT[name][i]])) throw new Error("KERN-PFLICHT verletzt: koerper fx.bewegung." + name + "." + LEIB_PFLICHT[name][i] + " ist keine Zahl (leibGesetz)");
        }
        _leibGesetzMemo = { luft: B.luft, sprung: B.sprung, hang: B.hang, parkour: P, slidePose: P.slidePose, gang: B.gang, verben: VERB_GESETZ };
        return _leibGesetzMemo;
    }
    // DIE GELENK-EINHEIT IN METERN: der Guss misst in Gelenk-Einheiten (labProportionen H = 6 ist die Höhe), die Welt in Metern —
    // 8 Kopf-Einheiten LEIB.kopfM sind die Höhe des Menschen der START_PARAMS (Wirt: der Wrap `_buildHumanoidRig`, PLAYER_KH)
    function leibMassstab() {
        return (8 * LEIB.kopfM) / labProportionen().H;
    }
    // DIE MASSE DES LEIBS (kg): das gemessene Volumen des Gusses (`leibV`, Gelenk-Einheiten³, Beipack des Ofens) mal die Skala
    // der Wurzel (die Dials) mal der Maßstab³ mal der Dichte (LEIB.dichteKgM3) — dieselbe Zahl, die der Wirt aus der Haut des
    // getragenen Leibs liest (`_leibMasse`, gate:fahr-leben labMensch)
    function leibMasse(sk) {
        var w = null;
        for (var i = 0; i < sk.joints.length; i++) if (sk.joints[i].name === sk.root) w = sk.joints[i].scale;
        if (!(sk.leibV > 0) || !w) throw new Error("KERN-PFLICHT verletzt: der Guss trägt kein Volumen oder keine Wurzel (leibMasse)");
        return sk.leibV * w[0] * w[1] * w[2] * leibMassstab() ** 3 * LEIB.dichteKgM3;
    }
    // DIE GRÖSSE DES MENSCHEN aus seinen Dials (die Stats des Leibs wachsen mit ihr: die Lebenskraft mit √, Tempo und Sprung
    // fallen mit 1/√) — der Wirt liest sie für die eingebaute Seele (`computePlayerStats`)
    function leibGroesse(dials) {
        var s = dials || {};
        if (!isFinite(s.height) || !isFinite(s.mass) || !isFinite(s.tone)) throw new Error("KERN-PFLICHT verletzt: leibGroesse ohne height/mass/tone");
        return s.height * s.height * (1 + 0.25 * (s.mass - 0.35)) * (1 + 0.1 * (s.tone - 0.5));
    }
    // DIE WERTE DES MENSCHEN im Labor (die Seele des Labors ist der Mensch ohne Gerät, Boost und Wunde): die Basis des Gesetzes
    // (fx.bewegung speed · jumpPower — der Mensch der Welt sättigt seine Tags: dichte 1, magieleitung 0) mal der Größe, mit dem
    // Boden des Tempos (2/7 der Basis) wie der Wirt (`_applySizeMultipliersToStats`); der Sprint mal sprintMul.
    function leibWerte(dials) {
        var B = PRESETS.mensch.fx.bewegung;
        var sizeHpMul = Math.sqrt(leibGroesse(dials)),
            sizeSpeedMul = 1 / sizeHpMul;
        var speed = Math.max((2 / 7) * B.speed.base, (B.speed.base + 0 * B.speed.leicht + 0 * B.speed.mag) * sizeSpeedMul);
        return { speed: speed, sprintSpeed: speed * B.sprintMul, jumpPower: (B.jumpPower.base + 0 * B.jumpPower.leicht + 0 * B.jumpPower.mag) * sizeSpeedMul };
    }
    // Der Leib-Zustand (die Felder, die das Gesetz liest und schreibt — dieselben Namen wie im Zustand des Wirts) mit dem
    // schmalen Geschwindigkeits-Speicher (`setValue` · `x()` · `y()` · `z()`, wie der Feld-Vektor des Wirts `_makeFieldVec`)
    function leibVec(x, y, z) {
        return {
            _x: x || 0,
            _y: y || 0,
            _z: z || 0,
            setValue: function (a, b, c) {
                this._x = a;
                this._y = b;
                this._z = c;
                return this;
            },
            x: function () {
                return this._x;
            },
            y: function () {
                return this._y;
            },
            z: function () {
                return this._z;
            },
        };
    }
    function leibZustand() {
        return {
            playerVel: leibVec(0, 0, 0),
            _fieldVy: 0,
            isInAir: false,
            isJumping: false,
            lastGroundedTime: -Infinity,
            _jumpPressedAt: -Infinity,
            _spaceWasDown: false,
            _cWasDown: false,
            _parkourSlide: null,
            _parkourKletter: 0,
            _airJumps: 0,
            _wandKontaktNx: 0,
            _wandKontaktNz: 0,
            _wandKontaktAt: null,
            onSteepSlope: false,
            _landImpactPending: 0,
            forward: { x: 0, y: 0, z: 1 },
            right: { x: 1, y: 0, z: 0 },
            moveDirection: { x: 0, y: 0, z: 0 },
            leibVerb: null,
            leibStoss: null,
        };
    }
    // DIE RICHTUNG DES SCHRITTS aus Blick und Tafel: vorwärts (sin yaw, 0, cos yaw), rechts (cos yaw, 0, −sin yaw) — die
    // arithmetische Richtung, player-anatomisch LINKS (quer + = links, A) —, die Absicht vorwärts·vor + rechts·quer
    function leibRichtung(L, yaw, vor, quer) {
        var f = L.forward,
            r = L.right,
            m = L.moveDirection;
        f.x = Math.sin(yaw);
        f.y = 0;
        f.z = Math.cos(yaw);
        r.x = Math.cos(yaw);
        r.y = 0;
        r.z = -Math.sin(yaw);
        m.x = 0;
        m.y = 0;
        m.z = 0;
        m.x += f.x * vor;
        m.y += f.y * vor;
        m.z += f.z * vor;
        m.x += r.x * quer;
        m.y += r.y * quer;
        m.z += r.z * quer;
        return m;
    }
    // DIE KRAFT DER BEINE (N): die Sprungkraft der Seele (das Abdruck-Tempo des Bezugs-Leibs) als Kraft nach LEIB.sprung
    function leibSprungKraft(jumpPower) {
        var G = LEIB.sprung;
        return G.refKg * (G.refG + jumpPower ** 2 / (2 * G.abdruckM));
    }
    // DER ABDRUCK (m/s): ½ m v² = (F − m g) d — der schwerere Leib springt niedriger, die stärkeren Beine höher (F die Kraft der
    // Beine, `leibSprungKraft`; m die Masse des Leibs; g die Schwere der Welt)
    function leibAbdruck(F, m, g) {
        var a = F / m - g;
        return Math.sqrt(2 * LEIB.sprung.abdruckM * Math.max(0, a));
    }
    // DIE DECKEN-KLEMME: unter niedriger Decke (< 3,4 m Kopfraum) steigt der Sprung nur so hoch, wie Kopffreiheit da ist
    // (v = √(2·g·Steighöhe), Marge 0,35 m); unter 1,2 m/s kein Sprung (null)
    function leibSprungKlemme(jumpV, kopfraum, g) {
        if (kopfraum >= 3.4) return jumpV;
        var v = Math.min(jumpV, Math.sqrt(2 * g * Math.max(0, kopfraum - 0.35)));
        return v < 1.2 ? null : v;
    }
    // DER BODEN-SPRUNG: geerdet oder im Coyote-Fenster und nicht schon im Sprung; am Steilhang fragt der Wirt seine Seele
    // (`hangSprung`), der Abdruck kommt aus Kraft und Masse (`abdruck`), die Decke klemmt ihn (`kopfraum`)
    function leibSprung(L, K, t) {
        if (!L.playerVel) return false;
        var isGrounded = K.amBoden();
        var withinCoyoteTime = t - L.lastGroundedTime <= leibGesetz().sprung.coyoteSec;
        if ((isGrounded || withinCoyoteTime) && !L.isJumping) {
            if (L.onSteepSlope && !K.hangSprung()) return false;
            var jumpV = leibSprungKlemme(K.abdruck(), K.kopfraum(), K.g);
            if (jumpV === null) return false;
            var velocity = L.playerVel;
            L.playerVel.setValue(velocity.x(), jumpV, velocity.z());
            L.isJumping = true;
            L.isInAir = true;
            if (K.gesprungen) K.gesprungen(t);
            return true;
        }
        return false;
    }
    // DER LUFT-SPRUNG auf frischen Druck in der Luft: WANDSPRUNG zuerst (die Wand jünger als kontaktFrischeSec — Abdruck mal
    // wandsprungMul und der Abstoß längs der Normale, der Kontakt wird verbraucht), sonst DOPPELSPRUNG (doppelspruenge je
    // Luftphase, die Landung füllt auf)
    function leibLuftsprung(L, K, t) {
        var P = leibGesetz().parkour;
        if (K.wasser || !L.playerVel || K.ritt) return false;
        var frisch = P.kontaktFrischeSec;
        var wandFrisch = Number.isFinite(L._wandKontaktAt) && t - L._wandKontaktAt < frisch && Number.isFinite(L._wandKontaktNx);
        var mul = 0,
            abX = 0,
            abZ = 0;
        if (wandFrisch) {
            mul = P.wandsprungMul;
            var ab = P.wandAbstoss;
            abX = L._wandKontaktNx * ab;
            abZ = L._wandKontaktNz * ab;
            L._wandKontaktAt = -Infinity;
            L._wandSprungAt = t;
        } else if ((L._airJumps | 0) < (P.doppelspruenge | 0)) {
            mul = P.doppelsprungMul;
            L._airJumps = (L._airJumps | 0) + 1;
            L._doppelSprungAt = t;
        } else {
            return false;
        }
        var jumpV = leibSprungKlemme(K.abdruck() * mul, K.kopfraum(), K.g);
        if (jumpV === null) return false;
        var v = L.playerVel;
        L.playerVel.setValue(v.x() + abX, jumpV, v.z() + abZ);
        L.isJumping = true;
        L.isInAir = true;
        return true;
    }
    // DER PLAN DES SCHRITTS (je fester Sim-Schritt, vor dem Kontakt des Wirts). L: der Leib-Zustand; T: die Verb-Tafel (vor ·
    // quer · sprint · sprung · rutsch); K: der Wirt — tempo (Geh- bzw. Sprint-Tempo des Schritts, im Wasser mal speedMul, im
    // Sattel das des Gefährts), gehTempo (das Geh-Tempo, auf das der Rutsch ausklingt), hang (die Drossel am Steilhang), ritt
    // (das Profil des Gefährts oder null) mit rittKAcc · rittKBrake (seine Kurven oder null), reitet (der Leib sitzt auf),
    // fahr (der Fahr-Schritt des Gefährts oder null), wasser (der Leib schwimmt) und wasserKBrake, leben ({stamina}),
    // angebote und lage (die Geräte in Reichweite und der Fuß-Punkt, Welt-Rahmen), mass und masse (die Maße und die Masse des
    // Leibs), die Rückrufe amBoden · hangSprung · abdruck · kopfraum (· gesprungen) und g (die Schwere, positiv).
    // ── physik.K5 (rein additiv) — DER STOSS IM GANG: ein Impuls von außen (ein Stoß, ein Tier, ein Wagen) ist Geschwindigkeit,
    //    die der Gang NICHT erzeugt hat — der Antrieb (kAcc, 25 ms) zieht nur die eigene Geschwindigkeit des Gangs auf sein Ziel,
    //    den Rest d trägt der Schwerpunkt, bis die Balance ihn abbaut. Die Balance ist das lineare inverse Pendel (Kajita 2001)
    //    um den Druckpunkt p unter dem Fuß: e'' = ω²(e − p), ω = √(g/Bein), e der Weg des Schwerpunkts aus der Bahn des Gangs;
    //    der Capture-Point ξ = e + d/ω (Pratt 2006) ist der Ort, an dem ein Fuß den Leib fängt. Bis fussM neben dem Fuß fängt ihn
    //    der Knöchel (der Druckpunkt wandert im Fuß, kein Schritt); weiter draußen setzt der Leib nach reaktionS + schwungS
    //    (Reflex und schneller Schwung, Hof 2010) den Fuß der Stoß-Seite AN den Capture-Point (der Ausfallschritt, bis
    //    schrittBein × Bein vom Schwerpunkt — wer weiter fällt, setzt alle schrittS nach), das andere Bein schließt nach schrittS
    //    auf, und der Schwerpunkt kommt über dem neuen Fuß zur Ruhe (d → 0 mit der Rate ω): er geht auf der versetzten Bahn
    //    weiter. Doppelte Masse heißt halber Impuls-Sprung, halber Schritt. Erkannt wird der Stoß am Leib selbst: der Kontakt
    //    des Wirts hinterlegt in `leibLandung` die Geschwindigkeit, die er dem Schritt ließ (Wand, Hang, Strömung sind sein
    //    Gesetz), was sie bis zum nächsten Plan ändert, ist Stoß (ein Stoß IM Kontakt-Schritt meldet sich über
    //    `leibStossMerke`); ein Versetzen des Leibs (Spawn, Rettung, Halt) und jeder Plan nicht zu Fuß (Luft, Sattel, Wasser,
    //    Verb, Rutsch) tragen keinen. ──
    var LEIB_STOSS = Object.freeze({
        reaktionS: 0.15,
        schwungS: 0.15,
        schrittS: 0.3,
        fussM: 0.04,
        schrittBein: 0.6,
        ruheMs: 0.02,
        merkMs: 1e-6,
        versetztM: 0.5,
        hebKnieRad: 0.8,
    });
    // DER STOSS-ZUSTAND AM LEIB (die Felder, die ein Wirt mit dem Leib tauscht, wenn er einen fremden Schritt auf demselben
    // Zustand fährt — das Replay, der Geist des Lockstep): der Stoß, die Geschwindigkeit nach dem Kontakt, die Lage des letzten
    // Plans, der Plan zu Fuß, der gemeldete Stoß im Kontakt
    var LEIB_STOSS_FELDER = Object.freeze(["leibStoss", "_leibNach", "_stossLage", "_stossFrei", "_stossOffen"]);
    // ein Stoß, den der Wirt IM Kontakt-Schritt in die Geschwindigkeit schrieb (der Wagen, die Kiste, gegen die er prallt)
    function leibStossMerke(L, dvx, dvz) {
        var o = L._stossOffen || (L._stossOffen = [0, 0]);
        o[0] += dvx;
        o[1] += dvz;
    }
    // der Fuß i (0 = die Seite „1“, +x des Leibs) des Stoß-Zustands zur Zeit B.t: vom alten Ort zum gesetzten im Schwung
    function leibStossFuss(B, i) {
        var f = B.fuss[i],
            u = f[4] < 0 ? 1 : Math.max(0, Math.min(1, (B.t - f[4]) / LEIB_STOSS.schwungS));
        u = u * u * (3 - 2 * u);
        return [f[2] + (f[0] - f[2]) * u, f[3] + (f[1] - f[3]) * u, f[4] >= 0 && B.t - f[4] < LEIB_STOSS.schwungS ? (B.t - f[4]) / LEIB_STOSS.schwungS : -1];
    }
    function _stossSetze(B, i, x, z) {
        var j = leibStossFuss(B, i),
            f = B.fuss[i];
        f[2] = j[0];
        f[3] = j[1];
        f[0] = x;
        f[1] = z;
        f[4] = B.t;
        B.zuletzt = i;
        B.schritte++;
    }
    // DER STOSS AM LEIB LESEN (zu Beginn des Plans): die Abweichung der Geschwindigkeit von der, die der Kontakt dem letzten
    // Schritt ließ — nur, wenn der letzte Plan zu Fuß ging, der Kontakt eben lief (seine Uhr ein Schritt zurück) und der Leib
    // nicht versetzt wurde (der Weg seit dem letzten Plan ≤ Tempo × dt + versetztM). null: kein Stoß im Leib.
    function leibStossLesen(L, K, t, dt) {
        var S = LEIB_STOSS,
            v = L.playerVel,
            n = L._leibNach,
            vor = L._stossLage,
            lage = K.lage;
        // DER HALT: wer die Geschwindigkeit auf Ruhe setzt (die Rettung, das Aufschütten, der Ladestand, das Absteigen, eine Bühne,
        // die den Leib stellt), hält ihn an — er stößt nicht; die Kraft, die einen gehenden Leib genau auf 0 brächte, gibt es nicht.
        // Bis w6-physik-k5 las der Plan den Halt als Stoß gegen die Laufrichtung, der Leib fiel rückwärts und der nächste Gang
        // ging gebremst (Gamepad-Verben leib.K5 an z171: 0,431 statt 0,628 m/s bei 0,6 Auslenkung).
        var dx = 0,
            dz = 0,
            versetzt = !vor || !lage || (v.x() === 0 && v.z() === 0);
        if (!versetzt) {
            var weg = Math.hypot(lage[0] - vor[0], lage[2] - vor[1]);
            versetzt = weg > (n ? Math.hypot(n[0], n[1]) : 0) * dt + Math.hypot(v.x(), v.z()) * dt + S.versetztM;
        }
        if (!versetzt && n && L._stossFrei && t - n[2] >= -1e-9 && t - n[2] <= 1.5 * dt + 1e-9) {
            dx = v.x() - n[0];
            dz = v.z() - n[1];
        }
        if (L._stossOffen) L._stossOffen[0] = L._stossOffen[1] = 0;
        L._leibNach = null;
        L._stossLage = lage ? [lage[0], lage[2]] : null;
        if (versetzt) L.leibStoss = null;
        var B = L.leibStoss || null;
        if (Math.abs(dx) > S.merkMs || Math.abs(dz) > S.merkMs) {
            if (!B)
                B = L.leibStoss = {
                    d: [0, 0],
                    e: [0, 0],
                    p: [0, 0],
                    t: 0,
                    naechster: S.reaktionS + S.schwungS,
                    schritte: 0,
                    zuletzt: -1,
                    fuss: [
                        [0, 0, 0, 0, -1],
                        [0, 0, 0, 0, -1],
                    ],
                };
            B.d[0] += dx;
            B.d[1] += dz;
        }
        return B;
    }
    // DER SCHRITT DER BALANCE (dt): der Ausfallschritt an den Capture-Point, der Druckpunkt im Fuß, das Pendel; true = der Stoß
    // ist abgebaut (nach dem Moment des ersten Schritts ruht der Schwerpunkt über dem Fuß, beide Füße auf der neuen Bahn)
    function leibStossSchritt(L, B, K, dt) {
        var S = LEIB_STOSS,
            w = Math.sqrt(K.g / K.beinM);
        B.t += dt;
        var xi = [B.e[0] + B.d[0] / w, B.e[1] + B.d[1] / w];
        if (B.t >= B.naechster) {
            var rx = xi[0] - B.p[0],
                rz = xi[1] - B.p[1];
            if (Math.hypot(rx, rz) > S.fussM) {
                // der Ausfallschritt: der Fuß der Seite, zu der der Leib fällt (zuerst), dann im Wechsel — an den Capture-Point,
                // höchstens schrittBein × Bein vom Schwerpunkt
                var cx = xi[0] - B.e[0],
                    cz = xi[1] - B.e[1],
                    cl = Math.hypot(cx, cz),
                    weit = S.schrittBein * K.beinM,
                    k = cl > weit ? weit / cl : 1;
                var i = B.zuletzt < 0 ? (rx * L.right.x + rz * L.right.z >= 0 ? 0 : 1) : 1 - B.zuletzt;
                B.p[0] = B.e[0] + cx * k;
                B.p[1] = B.e[1] + cz * k;
                _stossSetze(B, i, B.p[0], B.p[1]);
                B.naechster = B.t + S.schrittS;
            } else if (B.schritte % 2 === 1) {
                // das andere Bein schließt auf die neue Bahn auf
                _stossSetze(B, 1 - B.zuletzt, B.p[0], B.p[1]);
                B.naechster = B.t + S.schrittS;
            }
        }
        // der Druckpunkt: der Fuß (vor dem ersten Schritt der stehende an der Bahn), im Fuß bis fussM zum Capture-Point hin
        var qx = xi[0] - B.p[0],
            qz = xi[1] - B.p[1],
            ql = Math.hypot(qx, qz),
            kq = ql > S.fussM ? S.fussM / ql : 1;
        var px = B.p[0] + qx * kq,
            pz = B.p[1] + qz * kq;
        B.d[0] += w * w * (B.e[0] - px) * dt;
        B.d[1] += w * w * (B.e[1] - pz) * dt;
        B.e[0] += B.d[0] * dt;
        B.e[1] += B.d[1] * dt;
        // abgebaut erst nach dem Moment des ersten Schritts (bis dahin läuft der Stoß noch ein), dann ruhend über dem Fuß
        return B.t >= S.reaktionS + S.schwungS && Math.hypot(B.d[0], B.d[1]) < S.ruheMs && B.schritte % 2 === 0 && ql <= S.fussM;
    }
    // DIE POSE DES AUSFALLSCHRITTS (nach `leibRigPose`, vor der Fuß-IK des Wirts): jedes Bein rollt in der Hüfte quer zu seinem
    // Fuß (der Ort des Stoß-Zustands gegen den Schwerpunkt, quer zur Gier `gier`), die Sohle bleibt waagrecht; im Schwung hebt
    // das Knie den Fuß (hip.userData.stossSchwung: die Fuß-IK des Wirts lässt ihn los; stossRoll: der Roll). M = die Bein-Maße
    // (L, Meter).
    function leibStossPose(r, L, gier, M) {
        if (!r || !r.legL || !r.legR) return;
        var B = L && L.leibStoss,
            legs = [r.legL, r.legR],
            qx = Math.cos(gier),
            qz = -Math.sin(gier);
        for (var i = 0; i < 2; i++) {
            var leg = legs[i],
                th = 0,
                schwung = -1;
            if (B && M && M.L > 0) {
                var f = leibStossFuss(B, i),
                    q = (f[0] - B.e[0]) * qx + (f[1] - B.e[1]) * qz;
                th = Math.asin(Math.max(-0.6, Math.min(0.6, q / M.L)));
                schwung = f[2];
            }
            if (!leg.hip) continue;
            // am Gelenk (userData), nie am Bein-Objekt: dessen Schlüssel sind die Gelenke, die der Wirt je Pose zurücksetzt
            leg.hip.userData.stossRoll = th;
            leg.hip.userData.stossSchwung = schwung >= 0;
            if (th) leg.hip.rotation.z += th;
            if (th && leg.ankle) leg.ankle.rotation.z -= th;
            if (schwung >= 0 && leg.knee && leg.hip) {
                var heb = Math.sin(Math.PI * schwung) * LEIB_STOSS.hebKnieRad;
                leg.knee.rotation.x += heb;
                leg.hip.rotation.x -= heb / 2;
            }
        }
    }
    function leibPlan(L, T, K, t, dt) {
        var G = leibGesetz();
        // DER STOSS IM LEIB (physik.K5): was seit dem Kontakt von außen in die Geschwindigkeit kam
        var Bs = leibStossLesen(L, K, t, dt);
        L._stossFrei = false;
        // DIE VERBEN AN DEN GERÄTEN führen, solange eines trägt (das Gerät hält den Leib — kein freier Antrieb)
        if (leibVerbTakt(L, T, K, t, dt)) {
            L.leibStoss = null;
            return;
        }
        var parkG = !K.ritt && !K.wasser ? G.parkour : null;
        var slide = L._parkourSlide || null;
        if (slide && (t >= slide.bis || L.isInAir || !parkG)) {
            slide = L._parkourSlide = null;
        }
        if (parkG) {
            var cFresh = T.rutsch && !L._cWasDown;
            L._cWasDown = T.rutsch;
            if (!slide && cFresh && !L.isInAir) {
                var v0 = L.playerVel;
                var sp0 = Math.hypot(v0.x(), v0.z());
                if (sp0 > parkG.slideMinTempo) {
                    var dauer = parkG.slideDauerSec;
                    slide = L._parkourSlide = { bis: t + dauer, dauer: dauer, dx: v0.x() / sp0, dz: v0.z() / sp0, v0: sp0 * parkG.slideTempoMul };
                    L._landImpactPending = Math.max(L._landImpactPending || 0, 1.2);
                }
            }
        } else if (L._cWasDown) {
            L._cWasDown = false;
        }
        var md = L.moveDirection;
        // zu Fuß trägt die Balance den Stoß; in der Luft, im Sattel, im Wasser und im Rutsch bleibt er Fahrt des Leibs (die
        // Geschwindigkeit behält ihn), ein Leib ohne Beine (kein Bein-Maß) setzt keinen Fuß
        var zuFuss = !K.fahr && !slide && !L.isInAir && !K.ritt && !K.reitet && !K.wasser && K.beinM > 0 && K.g > 0;
        L._stossFrei = zuFuss;
        if (Bs && !zuFuss) Bs = L.leibStoss = null;
        if (Bs) L.playerVel.setValue(L.playerVel.x() - Bs.d[0], L.playerVel.y(), L.playerVel.z() - Bs.d[1]);
        if (K.fahr) {
            K.fahr();
        } else if (slide) {
            var rest = Math.max(0, (slide.bis - t) / Math.max(0.001, slide.dauer));
            var spZiel = K.gehTempo + Math.max(0, slide.v0 - K.gehTempo) * rest;
            var vSl = L.playerVel;
            L.playerVel.setValue(slide.dx * spZiel, vSl.y(), slide.dz * spZiel);
        } else if (Math.sqrt(md.x * md.x + md.y * md.y + md.z * md.z) > 0) {
            var laenge = Math.sqrt(md.x * md.x + md.y * md.y + md.z * md.z);
            var zug = Math.min(1, laenge);
            var inv = 1 / (laenge || 1);
            md.x *= inv;
            md.y *= inv;
            md.z *= inv;
            var v = L.playerVel;
            var LG = G.luft;
            var kAcc = K.rittKAcc !== null ? K.rittKAcc : L.isInAir ? LG.kAccLuft : LG.kAcc;
            var f = 1 - Math.exp(-kAcc * dt);
            var tx = md.x * K.tempo * K.hang * zug;
            var tz = md.z * K.tempo * K.hang * zug;
            L.playerVel.setValue(v.x() + (tx - v.x()) * f, v.y(), v.z() + (tz - v.z()) * f);
        } else if (!L.onSteepSlope) {
            var vb = L.playerVel;
            var LB = G.luft;
            var kBrake = K.rittKBrake !== null ? K.rittKBrake : K.wasser ? K.wasserKBrake : L.isInAir ? LB.kBrakeLuft : LB.kBrake;
            var fb = 1 - Math.exp(-kBrake * dt);
            L.playerVel.setValue(vb.x() * (1 - fb), vb.y(), vb.z() * (1 - fb));
        }
        // die Balance baut den Stoß ab; die Geschwindigkeit des Leibs ist die des Gangs plus der Rest des Stoßes
        if (Bs) {
            var ruht = leibStossSchritt(L, Bs, K, dt);
            L.playerVel.setValue(L.playerVel.x() + Bs.d[0], L.playerVel.y(), L.playerVel.z() + Bs.d[1]);
            if (ruht) L.leibStoss = null;
        }
        // DAS SPRUNG-FENSTER: ein Druck kurz VOR der Landung wird gemerkt (bufferSec) und feuert beim Aufsetzen; der Sprung
        // läuft durch den Boden-Sprung (Coyote, Steilhang, Decke) — in der Luft der frische Druck durch den Luft-Sprung
        var spaceFresh = T.sprung && !L._spaceWasDown;
        if (spaceFresh) L._jumpPressedAt = t;
        L._spaceWasDown = T.sprung;
        var buffered = t - (L._jumpPressedAt || -Infinity) <= G.sprung.bufferSec;
        if ((T.sprung || buffered) && !L.isJumping) {
            leibSprung(L, K, t);
            if (L.isJumping) L._jumpPressedAt = -Infinity;
        } else if (spaceFresh && L.isJumping) {
            if (leibLuftsprung(L, K, t)) L._jumpPressedAt = -Infinity;
        }
        // KLETTERN AN DER WAND: vor gegen die frische Wand (der Blick höchstens 45° neben ihrer Normalen) zehrt Ausdauer und
        // trägt den Leib mit kletterV; erschöpft, vor los oder die Wand weg — er fällt. Ein Gerät mit Griffen (die Kletterwand,
        // das Gerüst, die Leiter der Rutsche) nimmt den Leib in sein Verb (`leibVerbTakt`).
        var kletterV = 0;
        if (
            parkG &&
            T.vor > 0 &&
            !slide &&
            L.forward.x * L._wandKontaktNx + L.forward.z * L._wandKontaktNz < -Math.SQRT1_2 &&
            Number.isFinite(L._wandKontaktAt) &&
            t - L._wandKontaktAt < parkG.kontaktFrischeSec
        ) {
            var plK = K.leben;
            if (plK && plK.stamina > 0) {
                kletterV = parkG.kletterV;
                plK.stamina = Math.max(0, plK.stamina - parkG.kletterAusdauerProS * dt);
                L.isInAir = true;
            }
        }
        L._parkourKletter = kletterV;
    }
    // DER FRISCHE SPRUNG-IMPULS: schrieb der Plan einen Sprung in die Geschwindigkeit, übernimmt ihn die Vertikale des Schritts
    function leibImpuls(L) {
        var bvy = L.playerVel.y();
        if (bvy > L._fieldVy + 0.5) L._fieldVy = bvy;
        return L._fieldVy;
    }
    // DIE VERTIKALE an Land: der Griff des Kletterns ersetzt die Schwere, sonst fällt der Leib (gedeckelt −25 m/s gegen das
    // Tunneln); `schwere` ist die Schwere der Welt (negativ, m/s²)
    function leibFall(L, vy, schwere, dt) {
        if (L._parkourKletter > 0) return L._parkourKletter;
        vy += schwere * dt;
        if (vy < -25) vy = -25;
        return vy;
    }
    // DIE ERDUNG nach dem Kontakt: geerdet füllt die Landung die Luft-Sprünge auf und beendet den Sprung; in der Luft, wer nicht
    // schwimmt
    function leibLandung(L, amBoden, schwimmt, t) {
        // die Geschwindigkeit, die der Kontakt dem Schritt ließ (ohne den Stoß, den er selbst meldete) — der Plan liest an ihr
        // den Stoß von außen (`leibStossLesen`)
        var vN = L.playerVel,
            oN = L._stossOffen;
        if (vN) L._leibNach = [vN.x() - (oN ? oN[0] : 0), vN.z() - (oN ? oN[1] : 0), t];
        if (oN) oN[0] = oN[1] = 0;
        if (amBoden) {
            L.lastGroundedTime = t;
            L.isInAir = false;
            if (L._airJumps) L._airJumps = 0;
            L.isJumping = false;
        } else {
            L.isInAir = !schwimmt;
        }
    }

    // ── DIE VERBEN AN DEN GERÄTEN ──
    // Ein Angebot (der Wirt reicht es im Welt-Rahmen, Meter — fachwerk WERKE `angebot`, mit der Lage des Werks gedreht): {verb, id,
    // griff:[[x,y,z]…] (Punkt-Anker der Hand: Griff, Kette, Haltegriff), holme:[[[x,y,z],[x,y,z]]…] (Strecken-Anker der Hand: Sprosse,
    // Holm, Stange), tritt / sprossen (dasselbe für den Fuß), flaeche · normale · quer (die Kletter-Fläche: ein Punkt, die Normale
    // zum Kletternden, die halbe Breite), boden, oben (der Austritt), achse:{a, b} (die Pendel- bzw. Dreh-Achse), sitz, bahn,
    // breite, schiene, richtung, phiMax, zustand}. Der Leib trägt L.leibVerb = {verb, ang, phase, huefte (Welt, m), lage (der
    // Fuß-Punkt: dort stünde die Sohle), gier, …}; das Gerät führt — der Wirt setzt die Lage ohne Kontakt-Löser, solange `lage`
    // steht. Die Seite „1“ eines Gelenks (arm1, hip1 …) liegt +x im Rahmen des Leibs: blickt er längs (sin ψ, 0, cos ψ), zeigt
    // sie nach (cos ψ, 0, −sin ψ) — die arithmetische Rechte des Wirts, player-anatomisch links.
    function _v3(a) {
        return [a[0], a[1], a[2]];
    }
    function _sub(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }
    function _add(a, b) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    }
    function _mul(a, s) {
        return [a[0] * s, a[1] * s, a[2] * s];
    }
    function _dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    function _cross(a, b) {
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }
    function _len(a) {
        return Math.sqrt(_dot(a, a));
    }
    function _norm(a) {
        var l = _len(a) || 1;
        return [a[0] / l, a[1] / l, a[2] / l];
    }
    function _mix(a, b, t) {
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }
    function _seite1(gier) {
        return [Math.cos(gier), 0, -Math.sin(gier)];
    }
    // der nächste Anker zu `ziel` unter Punkten und Strecken (die Strecke: ihr nächster Punkt); `aus(q)` schließt aus
    function _naechster(punkte, strecken, ziel, aus) {
        var best = null,
            bd = Infinity;
        var probe = function (q) {
            if (aus && aus(q)) return;
            var d = _len(_sub(q, ziel));
            if (d < bd) {
                bd = d;
                best = q;
            }
        };
        var i;
        if (punkte) for (i = 0; i < punkte.length; i++) probe(punkte[i]);
        if (strecken)
            for (i = 0; i < strecken.length; i++) {
                var A = strecken[i][0],
                    ab = _sub(strecken[i][1], A),
                    l2 = _dot(ab, ab);
                var u = l2 > 0 ? Math.max(0, Math.min(1, _dot(_sub(ziel, A), ab) / l2)) : 0;
                probe(_add(A, _mul(ab, u)));
            }
        return best ? _v3(best) : null;
    }
    // die Lage (der Fuß-Punkt der Kapsel) aus der Hüfte: eine Beinlänge unter ihr — nie unter dem Boden des Geräts (wer sitzt,
    // schaukelt oder wippt, trägt die Hüfte tiefer als eine Beinlänge; die Übergabe an den freien Leib beginnt auf dem Boden,
    // nie in ihm). Ein Angebot ohne Boden ist laut.
    function _lageAusHuefte(K, huefte, a) {
        if (!Number.isFinite(a.boden)) throw new Error("LEIB-TAKT: das Angebot " + a.id + " trägt keinen Boden");
        return [huefte[0], Math.max(huefte[1] - K.mass.huefteM, a.boden), huefte[2]];
    }
    function _merke(L, T) {
        L._cWasDown = T.rutsch;
        L._spaceWasDown = T.sprung;
    }
    // das Verb endet: der freie Leib übernimmt mit der Fahrt (vx, vy, vz) an der letzten Lage des Verbs
    function _verbEnde(L, vx, vy, vz, t) {
        var V = L.leibVerb;
        L._verbLage = V && V.lage ? _v3(V.lage) : null;
        L.leibVerb = null;
        L.playerVel.setValue(vx, vy, vz);
        L._fieldVy = vy;
        L.isInAir = true;
        L.isJumping = vy > 0;
        L._verbEndeAt = t;
    }
    function _angebotFuer(K, verb, pruef) {
        var A = K.angebote || [],
            best = null,
            bd = Infinity;
        for (var i = 0; i < A.length; i++) {
            if (A[i].verb !== verb) continue;
            var d = pruef(A[i]);
            if (d !== null && d < bd) {
                bd = d;
                best = A[i];
            }
        }
        return best;
    }
    // die Lage zur Kletter-Fläche: der Abstand vor ihrer Ebene (d, + auf der Seite des Kletternden) und die Höhe über ihrem Boden
    function _flaecheAbstand(a, p) {
        var n = [a.normale[0], 0, a.normale[1]],
            u = [-n[2], 0, n[0]];
        var d = _dot(_sub(p, a.flaeche), n),
            q = _dot(_sub(p, a.flaeche), u);
        if (d < -0.05 || Math.abs(q) > a.quer + 0.2) return null;
        return { d: d, y: p[1] - a.boden };
    }
    // die Lage zur Bahn eines Balkens (Strecke bahn[0] → bahn[1]): u ∈ [0, 1] längs, quer, die Höhe der Bahn, ihre Richtung
    function _bahnAbstand(bahn, p) {
        var a = bahn[0],
            b = bahn[bahn.length - 1];
        var ab = [b[0] - a[0], 0, b[2] - a[2]],
            l2 = ab[0] * ab[0] + ab[2] * ab[2];
        var u = ((p[0] - a[0]) * ab[0] + (p[2] - a[2]) * ab[2]) / (l2 || 1);
        var q = _mix(a, b, Math.max(0, Math.min(1, u)));
        return { u: u, quer: Math.hypot(p[0] - q[0], p[2] - q[2]), y: q[1], q: q, dir: _norm(ab) };
    }
    // DER TAKT DER VERBEN: der Eintritt (frei, nie im Sattel, Wasser oder Fahrt; 0,4 s nach einem Austritt nicht) und je Verb sein
    // Schritt. true: das Gerät führt den Leib in diesem Schritt (der freie Plan ruht).
    function leibVerbTakt(L, T, K, t, dt) {
        var V = L.leibVerb,
            VG = VERB_GESETZ;
        var frischC = T.rutsch && !L._cWasDown,
            frischS = T.sprung && !L._spaceWasDown;
        if (!V) {
            if (K.ritt || K.reitet || K.wasser || K.fahr || !K.angebote || !K.angebote.length) return false;
            if (t - (L._verbEndeAt || -Infinity) < 0.4) return false;
            var p = K.lage,
                fw = [L.forward.x, 0, L.forward.z],
                amBoden = !L.isInAir;
            if (frischC && amBoden) {
                // SITZEN: C am Sitz der Schaukel oder der Wippe, am Kopf der Rutsche
                var sitz = _angebotFuer(K, "schaukeln", function (a) {
                    var d = Math.hypot(p[0] - a.sitz[0], p[2] - a.sitz[2]);
                    return d < VG.schaukeln.eintrittM ? d : null;
                });
                if (sitz) {
                    L.leibVerb = { verb: "schaukeln", ang: sitz, phase: 0, seit: t };
                    return _schaukeln(L, T, K, t, dt, true);
                }
                var wip = _angebotFuer(K, "wippen", function (a) {
                    var d = Math.min(Math.hypot(p[0] - a.sitz[0][0], p[2] - a.sitz[0][2]), Math.hypot(p[0] - a.sitz[1][0], p[2] - a.sitz[1][2]));
                    return d < VG.wippen.eintrittM ? d : null;
                });
                if (wip) {
                    var seite = Math.hypot(p[0] - wip.sitz[0][0], p[2] - wip.sitz[0][2]) <= Math.hypot(p[0] - wip.sitz[1][0], p[2] - wip.sitz[1][2]) ? 0 : 1;
                    L.leibVerb = { verb: "wippen", ang: wip, seite: seite, phase: 0, seit: t };
                    return _wippen(L, T, K, t, dt, true);
                }
                var ru = _angebotFuer(K, "rutschen", function (a) {
                    var s0 = a.bahn[0];
                    var d = Math.hypot(p[0] - s0[0], p[2] - s0[2]);
                    return d < VG.rutschen.eintrittM && Math.abs(p[1] - a.podest) < 0.3 ? d : null;
                });
                if (ru) {
                    L.leibVerb = { verb: "rutschen", ang: ru, s: 0, v: 0, phase: 0, seit: t };
                    return _rutschen(L, T, K, t, dt, true);
                }
            }
            if (T.vor > 0) {
                // KLETTERN: vor gegen eine Kletter-Fläche in Reichweite (der Blick höchstens 45° neben ihrer Normalen)
                var kl = _angebotFuer(K, "klettern", function (a) {
                    if (_dot(fw, [a.normale[0], 0, a.normale[1]]) > -Math.SQRT1_2) return null;
                    var e = _flaecheAbstand(a, p);
                    return e !== null && e.d < VG.klettern.reichM && e.y > -0.1 && e.y < 0.6 ? e.d : null;
                });
                if (kl) {
                    L.leibVerb = { verb: "klettern", ang: kl, phase: 0, seit: t };
                    return _klettern(L, T, K, t, dt, true);
                }
            }
            if (L.isInAir && L.playerVel.y() > -4) {
                // HANGELN: in der Luft erreicht die Hand einen Holm (die Griff-Höhe über der Sohle ± reichM)
                var hg = p[1] + K.mass.griffHoeheM;
                var ha = _angebotFuer(K, "hangeln", function (a) {
                    var q = _naechster(null, a.holme, [p[0], hg, p[2]]);
                    if (!q) return null;
                    var dh = Math.hypot(q[0] - p[0], q[2] - p[2]);
                    return dh < 0.45 && Math.abs(q[1] - hg) < VG.hangeln.reichM ? dh : null;
                });
                if (ha) {
                    L.leibVerb = { verb: "hangeln", ang: ha, phase: 0, seit: t };
                    return _hangeln(L, T, K, t, dt, true);
                }
            }
            if (amBoden) {
                // BALANCIEREN: wer auf dem Balken steht
                var ba = _angebotFuer(K, "balancieren", function (a) {
                    var e = _bahnAbstand(a.bahn, p);
                    return e.quer <= a.breite / 2 + VG.balancieren.fussM && Math.abs(p[1] - e.y) < 0.05 && e.u >= 0 && e.u <= 1 ? e.quer : null;
                });
                if (ba) {
                    L.leibVerb = { verb: "balancieren", ang: ba, phase: 0, seit: t, gangPhase: 0 };
                    return _balancieren(L, T, K, t, dt, true);
                }
            }
            return false;
        }
        if (V.verb === "schaukeln") return _schaukeln(L, T, K, t, dt, false, frischC, frischS);
        if (V.verb === "wippen") return _wippen(L, T, K, t, dt, false, frischC, frischS);
        if (V.verb === "rutschen") return _rutschen(L, T, K, t, dt, false);
        if (V.verb === "klettern") return _klettern(L, T, K, t, dt, false, frischS);
        if (V.verb === "hangeln") return _hangeln(L, T, K, t, dt, false, frischS);
        if (V.verb === "balancieren") return _balancieren(L, T, K, t, dt, false);
        throw new Error("LEIB-TAKT: unbekanntes Verb " + V.verb);
    }
    // ── SCHAUKELN: das Pendel um die Achse; der Zustand des Geräts trägt θ und ω (die Schaukel schwingt aus, wenn der Leib
    //    absteigt). Pumpen: vor (W) treibt in Richtung der Fahrt.
    function _schaukelGeo(a) {
        var ax = _norm(_sub(a.achse.b, a.achse.a));
        var mitte = [a.sitz[0], (a.achse.a[1] + a.achse.b[1]) / 2, a.sitz[2]];
        var ebene = _norm(_cross(ax, [0, 1, 0]));
        return { ax: ax, mitte: mitte, ebene: ebene, kette: mitte[1] - a.sitz[1] };
    }
    function leibSchaukelSchritt(z, Lp, u, g, dt) {
        var VG = VERB_GESETZ.schaukeln;
        var acc = -(g / Lp) * Math.sin(z.theta) - VG.daempf * z.omega;
        // das Pumpen treibt in die Richtung der Fahrt; aus der Ruhe stößt es nach vorn an (der Anlauf aus dem Stand)
        if (u) acc += VG.pumpe * u * (Math.abs(z.omega) > 1e-4 ? (z.omega > 0 ? 1 : -1) : 1);
        z.omega += acc * dt;
        z.theta += z.omega * dt;
        if (z.theta > VG.maxRad) {
            z.theta = VG.maxRad;
            if (z.omega > 0) z.omega = 0;
        } else if (z.theta < -VG.maxRad) {
            z.theta = -VG.maxRad;
            if (z.omega < 0) z.omega = 0;
        }
        return z;
    }
    // die Lage auf der Schaukel zum Winkel θ: der Sitz auf seinem Kreis, die Hüfte sitzHuefteM über ihm längs der Kette
    function _schaukelLage(a, S, theta, hs) {
        var c = Math.cos(theta),
            s = Math.sin(theta);
        var sitzP = [S.mitte[0] + S.ebene[0] * S.kette * s, S.mitte[1] - S.kette * c, S.mitte[2] + S.ebene[2] * S.kette * s];
        return { sitzP: sitzP, huefte: [sitzP[0] - S.ebene[0] * hs * s, sitzP[1] + hs * c, sitzP[2] - S.ebene[2] * hs * s] };
    }
    function _schaukeln(L, T, K, t, dt, neu, frischC, frischS) {
        var V = L.leibVerb,
            a = V.ang,
            S = _schaukelGeo(a),
            z = a.zustand || (a.zustand = {});
        if (!Number.isFinite(z.theta)) z.theta = z.omega = 0; // das Gerät hängt in seiner Ruhe, bis ein Leib es bewegt
        var Lp = S.kette - VERB_GESETZ.schaukeln.sitzSchwerpunktM;
        _merke(L, T);
        if (!neu && (frischS || frischC)) {
            // der Absprung (Sprung) bzw. das Absteigen (C): die Bahn-Fahrt des Schwerpunkts, der Sprung dazu den Abdruck aufwärts
            var vt = z.omega * Lp,
                c = Math.cos(z.theta),
                s = Math.sin(z.theta);
            z.wach = true;
            V.lage = frischC ? [V.sitzP[0] + S.ebene[0] * 0.3, a.boden, V.sitzP[2] + S.ebene[2] * 0.3] : V.lage;
            _verbEnde(L, S.ebene[0] * vt * c, vt * s + (frischS ? 0.5 * K.abdruck() : 0), S.ebene[2] * vt * c, t);
            return true;
        }
        leibSchaukelSchritt(z, Lp, T.vor || 0, K.g, dt);
        z.wach = true;
        var LG = _schaukelLage(a, S, z.theta, K.mass.sitzHuefteM);
        V.sitzP = LG.sitzP;
        V.huefte = LG.huefte;
        V.lage = _lageAusHuefte(K, LG.huefte, a);
        V.theta = z.theta;
        V.omega = z.omega;
        V.gier = Math.atan2(S.ebene[0], S.ebene[2]);
        V.phase = Math.abs(z.omega) < 0.05 && Math.abs(z.theta) < 0.05 ? 0 : z.omega >= 0 ? 1 : 2; // ruhig · vor · zurück
        var vt2 = z.omega * Lp;
        L.playerVel.setValue(S.ebene[0] * vt2 * Math.cos(z.theta), vt2 * Math.sin(z.theta), S.ebene[2] * vt2 * Math.cos(z.theta));
        L._fieldVy = 0;
        L.isInAir = false;
        L.isJumping = false;
        return true;
    }
    // DIE LAGE DES SCHWINGENDEN TEILS (w4-koerper-park — dasselbe Gesetz wie `_schaukelLage` und `_wippePunkt`): die Drehung um die
    // Achse des Angebots {p: Punkt der Achse, ax: Richtung a→b, w: Winkel (rechte Hand um ax)}, die jeden Punkt des Teils aus seiner
    // Ruhe an seine Lage im Zustand trägt — die Schaukel um −θ (θ > 0 schwingt längs der Ebene), die Wippe um −φ (φ > 0 senkt Sitz 0);
    // null: das Angebot schwingt nicht. Leser: die Linse des Durchgreifens (das Instrument des Labors), der Selbst-Beweis Sitz → sitzP.
    function leibSchwenk(a) {
        var z = a.zustand || {},
            ax = _norm(_sub(a.achse ? a.achse.b : [0, 0, 1], a.achse ? a.achse.a : [0, 0, 0]));
        if (a.verb === "schaukeln") return { p: _schaukelGeo(a).mitte, ax: ax, w: -(z.theta || 0) };
        if (a.verb === "wippen") return { p: _wippeGeo(a).mitte, ax: ax, w: -(z.phi || 0) };
        return null;
    }
    // ein Punkt q (Ruhe-Lage) des schwingenden Teils an seiner Lage (Rodrigues um die Achse des Schwenks)
    function leibSchwenkPunkt(S, q) {
        if (!S) return _v3(q);
        var v = _sub(q, S.p),
            c = Math.cos(S.w),
            s = Math.sin(S.w);
        return _add(S.p, _add(_add(_mul(v, c), _mul(_cross(S.ax, v), s)), _mul(S.ax, _dot(S.ax, v) * (1 - c))));
    }
    // DAS GERÄT SCHWINGT AUS, wenn kein Leib es führt (der Wirt ruft es je Schritt für jedes wache Gerät; es schläft, sobald es ruht)
    function leibGeraetAusschwingen(a, g, dt) {
        var z = a.zustand;
        if (!z || !z.wach) return false;
        if (a.verb === "schaukeln") {
            var S = _schaukelGeo(a);
            leibSchaukelSchritt(z, S.kette, 0, g, dt);
            if (Math.abs(z.theta) < 1e-3 && Math.abs(z.omega) < 1e-3) {
                z.theta = 0;
                z.omega = 0;
                z.wach = false;
            }
            return true;
        }
        if (a.verb === "wippen") {
            leibWippeSchritt(a, z, null, 0, g, dt);
            return true;
        }
        z.wach = false;
        return false;
    }
    // ── WIPPEN: der Hebel um die Achse; φ > 0 senkt Sitz 0. Ohne Gegenlast kippt die Wippe zur Seite des Sitzenden, bis sein Ende
    //    den Boden trifft (phiMax); am Boden hebt ihn der Abstoß der Beine (die Sprung-Taste).
    function _wippeGeo(a) {
        var mitte = _mix(a.achse.a, a.achse.b, 0.5);
        var armH = _norm([a.sitz[0][0] - mitte[0], 0, a.sitz[0][2] - mitte[2]]);
        return { mitte: mitte, armH: armH, r: Math.hypot(a.sitz[0][0] - mitte[0], a.sitz[0][2] - mitte[2]), phiMax: a.phiMax };
    }
    // ein Punkt q (Ruhe-Lage, φ = 0) des Hebels, gedreht um φ (φ > 0 senkt die Seite von Sitz 0)
    function _wippePunkt(W, q, phi) {
        var r = (q[0] - W.mitte[0]) * W.armH[0] + (q[2] - W.mitte[2]) * W.armH[2];
        var h = q[1] - W.mitte[1];
        var c = Math.cos(phi),
            s = Math.sin(phi);
        var r2 = r * c + h * s,
            h2 = h * c - r * s;
        var quer = [q[0] - W.mitte[0] - W.armH[0] * r, 0, q[2] - W.mitte[2] - W.armH[2] * r];
        return [W.mitte[0] + W.armH[0] * r2 + quer[0], W.mitte[1] + h2, W.mitte[2] + W.armH[2] * r2 + quer[2]];
    }
    function leibWippeSchritt(a, z, seite, masse, g, dt) {
        var W = _wippeGeo(a),
            VG = VERB_GESETZ.wippen;
        var I = (VG.balkenKg * (2 * W.r) * (2 * W.r)) / 12 + (masse || 0) * W.r * W.r;
        var M = seite === null ? 0 : (seite === 0 ? 1 : -1) * (masse || 0) * g * W.r * Math.cos(z.phi);
        z.omega += ((M - VG.daempf * z.omega * I) / I) * dt;
        z.phi += z.omega * dt;
        if (z.phi > W.phiMax) {
            z.phi = W.phiMax;
            if (z.omega > 0) z.omega = -z.omega * VG.stoss;
        } else if (z.phi < -W.phiMax) {
            z.phi = -W.phiMax;
            if (z.omega < 0) z.omega = -z.omega * VG.stoss;
        }
        if (seite === null && Math.abs(z.omega) < 1e-3) z.wach = false;
        return z;
    }
    function _wippen(L, T, K, t, dt, neu, frischC, frischS) {
        var V = L.leibVerb,
            a = V.ang,
            W = _wippeGeo(a),
            z = a.zustand || (a.zustand = {});
        if (!Number.isFinite(z.phi)) z.phi = z.omega = 0; // das Gerät steht in seiner Ruhe, bis ein Leib es bewegt
        var sg = V.seite === 0 ? 1 : -1;
        z.wach = true;
        _merke(L, T);
        if (!neu && frischC) {
            // absteigen: neben den Sitz, nach außen
            var sp = _wippePunkt(W, a.sitz[V.seite], z.phi);
            V.lage = [sp[0] + W.armH[0] * sg * 0.45, a.boden, sp[2] + W.armH[2] * sg * 0.45];
            _verbEnde(L, 0, 0, 0, t);
            return true;
        }
        var unten = sg * z.phi >= W.phiMax - 1e-6;
        if (!neu && frischS && unten) z.omega = -sg * (VERB_GESETZ.wippen.abstossMs / W.r);
        leibWippeSchritt(a, z, V.seite, K.masse, K.g, dt);
        var sitzP = _wippePunkt(W, a.sitz[V.seite], z.phi);
        // der Leib sitzt in der Ebene des Sitzes (das Becken kippt mit dem Hebel; lotrecht über dem gekippten Sitz lagen die
        // Oberschenkel 1,6 cm in ihm): die Hüfte auf seiner Normalen, das Nicken der Normalen in der Blick-Richtung
        var nS = _sub(_wippePunkt(W, _add(a.sitz[V.seite], [0, 1, 0]), z.phi), sitzP);
        V.gier = Math.atan2(-sg * W.armH[0], -sg * W.armH[2]); // der Blick zur Achse
        V.nick = Math.atan2(nS[0] * Math.sin(V.gier) + nS[2] * Math.cos(V.gier), nS[1]);
        var huefte = _add(sitzP, _mul(nS, K.mass.sitzHuefteM));
        V.sitzP = sitzP;
        V.huefte = huefte;
        V.lage = _lageAusHuefte(K, huefte, a);
        V.phi = z.phi;
        V.phase = sg * z.phi >= W.phiMax - 1e-6 ? 0 : sg * z.omega < 0 ? 1 : 2; // unten · steigt · sinkt
        L.playerVel.setValue(0, 0, 0);
        L._fieldVy = 0;
        L.isInAir = false;
        L.isJumping = false;
        return true;
    }
    // ── RUTSCHEN: das Gleiten auf der Bahn (Polylinie), a = g·(sin α − μ·cos α), nie rückwärts; am Ende der Auslauf
    // der Punkt der Bahn bei der Länge s (ueber: hinter ihrem Ende geradeaus weiter — der Fuß ragt über den Auslauf hinaus)
    function _bahnPunkt(bahn, s, ueber) {
        var acc = 0;
        for (var i = 0; i + 1 < bahn.length; i++) {
            var seg = _sub(bahn[i + 1], bahn[i]),
                l = _len(seg);
            if (s <= acc + l || i + 2 === bahn.length) {
                var u = Math.max(0, (s - acc) / (l || 1));
                if (!ueber) u = Math.min(1, u);
                return { p: _mix(bahn[i], bahn[i + 1], u), dir: _norm(seg), ende: s >= acc + l && i + 2 === bahn.length };
            }
            acc += l;
        }
        return { p: _v3(bahn[bahn.length - 1]), dir: [0, 0, 1], ende: true };
    }
    function leibRutschSchritt(z, bahn, g, dt) {
        var P = _bahnPunkt(bahn, z.s);
        var sinA = -P.dir[1],
            cosA = Math.sqrt(Math.max(0, 1 - sinA * sinA));
        z.v = Math.max(0, z.v + g * (sinA - VERB_GESETZ.rutschen.reibung * cosA) * dt);
        z.s += z.v * dt;
        return _bahnPunkt(bahn, z.s);
    }
    // die Neigung des Beckens auf der Rutsche (Welt, nach vorn +): zurück um rutschLehne, je rad Gefälle um rutschLehneNeig mehr
    function _rutschBecken(neig) {
        return VERB_POSE.rutschLehne - VERB_POSE.rutschLehneNeig * neig;
    }
    function _rutschen(L, T, K, t, dt, neu) {
        var V = L.leibVerb,
            a = V.ang;
        _merke(L, T);
        var P = leibRutschSchritt(V, a.bahn, K.g, dt);
        // die Hüfte steht sitzHuefteM über der Bahn auf ihrer Normalen (der Leib sitzt AUF der Schräge, nie lotrecht über ihr: lotrecht
        // trug die Schräge von 33° das Becken 2 cm durch das Blech)
        var hlP = Math.hypot(P.dir[0], P.dir[2]) || 1,
            nP = [(-P.dir[1] * P.dir[0]) / hlP, hlP, (-P.dir[1] * P.dir[2]) / hlP],
            neigP = Math.asin(Math.max(-1, Math.min(1, -P.dir[1])));
        // … in der Höhe, die die Haut bei der Neigung des Beckens gegen die Bahn trägt (die Pose lehnt es zurück, die Bahn kippt vor)
        var huefte = _add(P.p, _mul(nP, _sitzTiefe(K, _rutschBecken(neigP) - neigP)));
        V.sitzP = P.p;
        V.huefte = huefte;
        V.lage = _lageAusHuefte(K, huefte, a);
        V.dir = P.dir;
        V.gier = Math.atan2(P.dir[0], P.dir[2]);
        V.phase = V.s < 0.25 ? 0 : P.dir[1] < -0.2 ? 1 : 2; // Anfahrt · Gleiten · Auslauf
        V.tempo = V.v;
        if (P.ende || (V.phase === 2 && V.v < 0.05)) {
            // am Ende der Bahn steht der Leib auf (die Fahrt der Bahn waagrecht)
            var h = [P.dir[0], 0, P.dir[2]],
                hl = _len(h) || 1;
            V.lage = [P.p[0], a.boden, P.p[2]];
            _verbEnde(L, (h[0] / hl) * V.v, 0, (h[2] / hl) * V.v, t);
            return true;
        }
        L.playerVel.setValue(P.dir[0] * V.v, P.dir[1] * V.v, P.dir[2] * V.v);
        L._fieldVy = 0;
        L.isInAir = false;
        L.isJumping = false;
        return true;
    }
    // ── KLETTERN an Griff und Tritt: der Leib steigt mit parkour.kletterV (vor auf, zurück ab, quer seitlich; die EINE Zahl der
    //    Wand), die Ausdauer zehrt wie an der Wand. DER KREUZGANG: die Glieder setzen in diagonalen Paaren um (die Hand der einen
    //    mit dem Fuß der anderen Seite), je Paar ein Schwung von schwungSec; ein Paar greift neu, sobald seine Anker um den halben
    //    Sprossen-Abstand hinter dem Soll liegen. Oben steigt der Leib über die Kante (`oben`), unten ab, der Sprung stößt ab.
    var _PAARE = [
        ["hand1", "fuss-1"],
        ["hand-1", "fuss1"],
    ];
    var _GLIEDER = ["hand1", "hand-1", "fuss1", "fuss-1"];
    // die Soll-Lage jedes Glieds zur Hüfte (n: von der Fläche zum Kletternden, s1: die Seite „1“ des Leibs)
    function _kletterSoll(K, huefte, n, s1, glied) {
        var M = K.mass,
            sd = glied === "hand1" || glied === "fuss1" ? 1 : -1;
        if (glied.charAt(0) === "h") return _add(_add(huefte, [0, M.schulterM + VERB_GESETZ.klettern.griffUeberM, 0]), _add(_mul(s1, sd * M.schulterBreiteM * 1.1), _mul(n, -M.wandM)));
        return _add(_add(huefte, [0, -M.huefteM + 0.34, 0]), _add(_mul(s1, sd * 0.13), _mul(n, -M.wandM + 0.06)));
    }
    function _kletterAnker(a, glied, soll) {
        return glied.charAt(0) === "h" ? _naechster(a.griff, a.holme, soll) : _naechster(a.tritt, a.sprossen, soll);
    }
    // der kleinste Abstand zweier Strecken (P0P1, Q0Q1)
    function _streckenAbstand(P0, P1, Q0, Q1) {
        var d1 = _sub(P1, P0),
            d2 = _sub(Q1, Q0),
            r = _sub(P0, Q0),
            a = _dot(d1, d1),
            e = _dot(d2, d2),
            f = _dot(d2, r),
            sc,
            tc;
        if (a < 1e-12 && e < 1e-12) return _len(r);
        if (a < 1e-12) {
            sc = 0;
            tc = Math.max(0, Math.min(1, f / e));
        } else {
            var c = _dot(d1, r);
            if (e < 1e-12) {
                tc = 0;
                sc = Math.max(0, Math.min(1, -c / a));
            } else {
                var b = _dot(d1, d2),
                    den = a * e - b * b;
                sc = den > 1e-12 ? Math.max(0, Math.min(1, (b * f - c * e) / den)) : 0;
                tc = (b * sc + f) / e;
                if (tc < 0) {
                    tc = 0;
                    sc = Math.max(0, Math.min(1, -c / a));
                } else if (tc > 1) {
                    tc = 1;
                    sc = Math.max(0, Math.min(1, (b - c) / a));
                }
            }
        }
        return _len(_sub(_add(P0, _mul(d1, sc)), _add(Q0, _mul(d2, tc))));
    }
    // DIE FREIHEIT EINES GLIEDS AM KLETTER-GERÄT (die Kapsel P0P1 mit Halbmesser r gegen das Angebot): vor der festen Fläche einer Wand
    // (Griffe ohne Sprossen), weg von jeder Sprosse und Kante (Stangen, Halbmesser stangeM), innerhalb der Breite (quer); m: > 0 frei
    function _kletterFrei(a, P0, P1, r) {
        var n = [a.normale[0], 0, a.normale[1]],
            sq = [n[2], 0, -n[0]],
            fl = a.flaeche,
            g = Infinity,
            i;
        var pr = [P0, P1, _mix(P0, P1, 0.5)];
        for (i = 0; i < 3; i++) {
            var d = _sub(pr[i], fl);
            g = Math.min(g, a.quer - Math.abs(_dot(d, sq)) - r);
            if (a.griff && !a.sprossen) g = Math.min(g, _dot(d, n) - r);
        }
        var st = (a.holme || []).concat(a.sprossen || []);
        for (i = 0; i < st.length; i++) g = Math.min(g, _streckenAbstand(P0, P1, st[i][0], st[i][1]) - r - VERB_POSE.stangeM);
        return g;
    }
    // die Mitte der Hand an einem Anker (die Stange liegt in den Fingern, VERB_POSE.griffVersatz über ihr)
    function _griffMitte(q) {
        return [q[0], q[1] - VERB_POSE.griffVersatz, q[2]];
    }
    // die Schulter der Seite des Glieds über der Hüfte (die Lage, aus der die Hand greift)
    function _kletterSchulter(K, huefte, s1, glied, n) {
        var lean = VERB_POSE.kletterNick + VERB_POSE.kletterRumpf;
        return _add(_add(huefte, [-n[0] * K.mass.schulterM * Math.sin(lean), K.mass.schulterM * Math.cos(lean), -n[2] * K.mass.schulterM * Math.sin(lean)]), _mul(s1, (glied === "hand1" ? 1 : -1) * K.mass.schulterBreiteM));
    }
    // DER GRIFF AN DER GRENZE DER REICHWEITE (w4-koerper-park — „die Hand greift griffUeberM über der Schulter“ hieß bis hierher: der
    // Anker, der dem Soll am nächsten liegt; an Sprossen alle 0,3 m lag er bis zu 0,15 m tiefer, der Arm griff gebeugt, Ellbogen
    // 95–114° an jedem Gerät): der HÖCHSTE Anker (Griff, oder auf der Sprosse der Punkt an der Seite der Hand), den die Hand von der
    // Schulter am Ende des Schwungs mit gestrecktem Arm erreicht (reichM × reichAnteil), auf ihrer Seite (± seiteM um das Soll);
    // erreicht sie keinen, der nächste zum Soll
    function _kletterGriff(K, a, huefte, n, s1, glied) {
        var M = K.mass,
            VG = VERB_GESETZ.klettern,
            sd = glied === "hand1" ? 1 : -1,
            soll = _kletterSoll(K, huefte, n, s1, glied);
        var schulter = _kletterSchulter(K, huefte, s1, glied, n);
        var reich = M.reichM * VG.reichAnteil,
            best = null,
            i;
        var probe = function (q) {
            if (Math.abs(_dot(_sub(q, soll), s1)) > VG.seiteM || _len(_sub(_griffMitte(q), schulter)) > reich) return;
            if (!best || q[1] > best[1] + 1e-9) best = q;
        };
        for (i = 0; a.griff && i < a.griff.length; i++) probe(a.griff[i]);
        for (i = 0; a.holme && i < a.holme.length; i++) {
            var A = a.holme[i][0],
                ab = _sub(a.holme[i][1], A),
                l2 = _dot(ab, ab);
            probe(_add(A, _mul(ab, l2 > 0 ? Math.max(0, Math.min(1, _dot(_sub(soll, A), ab) / l2)) : 0)));
        }
        return best ? _v3(best) : _kletterAnker(a, glied, soll);
    }
    function _klettern(L, T, K, t, dt, neu, frischS) {
        var V = L.leibVerb,
            a = V.ang,
            P = leibGesetz().parkour,
            VG = VERB_GESETZ.klettern,
            M = K.mass;
        var n = [a.normale[0], 0, a.normale[1]],
            gier = Math.atan2(-n[0], -n[2]),
            s1 = _seite1(gier),
            gl,
            i;
        if (neu) {
            var p0 = K.lage;
            var hu = _add(_add(p0, [0, M.huefteM, 0]), _mul(n, M.wandM - _dot(_sub(p0, a.flaeche), n)));
            V.huefte = hu;
            V.halt = {};
            for (i = 0; i < _GLIEDER.length; i++) {
                gl = _GLIEDER[i];
                V.halt[gl] = gl.charAt(0) === "h" ? _kletterGriff(K, a, hu, n, s1, gl) : _kletterAnker(a, gl, _kletterSoll(K, hu, n, s1, gl));
            }
            V.paar = -1;
            V.zyklus = 0;
            V.seitGlied = t;
        }
        _merke(L, T);
        if (!neu && frischS) {
            // der Absprung rückwärts von der Fläche (der Wandsprung)
            V.lage = _lageAusHuefte(K, V.huefte, a);
            _verbEnde(L, n[0] * P.wandAbstoss, K.abdruck() * P.wandsprungMul, n[2] * P.wandAbstoss, t);
            L._wandSprungAt = t;
            return true;
        }
        var plK = K.leben,
            kann = !plK || plK.stamina > 0;
        // DER LEIB WARTET AUF SEINE HÄNDE: greift eine Hand um oder will sie höher greifen (ein höherer Anker liegt in ihrer
        // Reichweite), steigt der Leib nur so weit, dass ihr Anker den Griff-Abstand des Solls behält (unten, greifM) — sonst stieg
        // er an kurzen Geräten an ihr vorbei, und sie nahm die oberste Reihe gebeugt (Ellbogen 99–112°, w4-koerper-park)
        var gewollt = [],
            hP = V.paar >= 0 ? _PAARE[V.paar][0] : null;
        if (hP && _len(_sub(V.ziel[hP], V.von[hP])) > 1e-6) gewollt.push([hP, V.ziel[hP]]);
        else if ((T.vor || 0) > 0)
            for (i = 0; i < 2; i++) {
                var qW = _kletterGriff(K, a, V.huefte, n, s1, _GLIEDER[i]);
                if (qW[1] > V.halt[_GLIEDER[i]][1] + VG.hoeherM) gewollt.push([_GLIEDER[i], qW]);
            }
        var wille = kann && ((T.vor || 0) !== 0 || (T.quer || 0) !== 0);
        var vv = kann ? (T.vor || 0) * P.kletterV : 0,
            vq = kann ? (T.quer || 0) * P.kletterV : 0;
        if (plK && (vv || vq)) plK.stamina = Math.max(0, plK.stamina - P.kletterAusdauerProS * dt);
        var hu2 = _add(V.huefte, [s1[0] * vq * dt, vv * dt, s1[2] * vq * dt]);
        // seitlich nie über die Fläche hinaus
        var sq = _dot(_sub(hu2, a.flaeche), s1),
            rand = Math.max(0, a.quer - M.schulterBreiteM);
        if (Math.abs(sq) > rand) hu2 = _add(hu2, _mul(s1, (sq > 0 ? rand : -rand) - sq));
        var oberst = -Infinity;
        var ankerY = function (q) {
            if (q[1] > oberst) oberst = q[1];
        };
        for (i = 0; a.griff && i < a.griff.length; i++) ankerY(a.griff[i]);
        for (i = 0; a.holme && i < a.holme.length; i++) ankerY(a.holme[i][0]);
        var unten = a.boden + M.huefteM;
        if (hu2[1] <= unten && vv < 0) {
            V.lage = [hu2[0] + n[0] * 0.05, a.boden, hu2[2] + n[2] * 0.05];
            _verbEnde(L, 0, 0, 0, t);
            L.isInAir = false;
            return true;
        }
        // oben: liegt die oberste Reihe nur noch ausstiegM über der Schulter, steigt der Leib aus (darüber falteten sich die Arme vor der
        // schmalen Leiter — der Ellbogen fand keinen freien Platz, die Kletterwand hielt die Hand 10 cm vom Griff)
        if (a.oben && hu2[1] + M.schulterM > oberst - VG.ausstiegM) {
            V.lage = _v3(a.oben);
            _verbEnde(L, 0, 0, 0, t);
            return true;
        }
        if (!a.oben && hu2[1] + M.schulterM + 0.3 > oberst) hu2[1] = oberst - M.schulterM - 0.3;
        // der Leib steigt nie über seine Hände: die Schulter höchstens ueberHandM über dem tieferen Griff (sonst hingen die Arme unter
        // der Schulter und der Oberarm stieß durch das Podest — am Gerüst fehlt zwischen 1,8 und 2,4 m die Sprosse)
        var hTief = Math.min(V.halt.hand1[1], V.halt["hand-1"][1]);
        if (vv > 0 && hu2[1] + M.schulterM > hTief + VG.ueberHandM) hu2[1] = Math.max(V.huefte[1], hTief + VG.ueberHandM - M.schulterM);
        // der Leib steigt einer Hand, die höher greifen will, nie zu nah an ihren Anker: der Griff-Abstand des Solls (der Ellbogen ≤
        // VERB_SOLL.griff aus Ober- und Unterarm der Kette) — sonst griff sie gebeugt, nachdem der Leib an ihr vorbei stieg
        for (i = 0; i < gewollt.length; i++) if (_len(_sub(_griffMitte(gewollt[i][1]), _kletterSchulter(K, hu2, s1, gewollt[i][0], n))) < M.greifM) hu2 = _v3(V.huefte);
        hu2[1] = Math.max(unten, hu2[1]);
        var bewegt = _len(_sub(hu2, V.huefte));
        V.huefte = hu2;
        V.tempo = bewegt / dt;
        if (V.paar >= 0 && t - V.seitGlied >= VG.schwungSec) {
            V.halt[_PAARE[V.paar][0]] = V.ziel[_PAARE[V.paar][0]];
            V.halt[_PAARE[V.paar][1]] = V.ziel[_PAARE[V.paar][1]];
            V.paar = -1;
        }
        if (V.paar < 0 && (bewegt > 0 || wille)) {
            // der neue Tritt zielt auf die Lage am ENDE des Schwungs (der Leib steigt während des Umsetzens weiter) — sonst fällt der
            // Fuß je Zyklus um den Hub des Schwungs zurück, bis er unter der Reichweite des Beins an der Sprosse hängt; die Hand greift
            // schon an der Grenze ihrer Reichweite (griffUeberM), ihr Griff bleibt der der Lage von jetzt
            var huZ = _add(hu2, [s1[0] * vq * VG.schwungSec, vv * VG.schwungSec, s1[2] * vq * VG.schwungSec]);
            // das Paar, dessen Hand höher greift, geht vor (sonst der Kreuzgang in seiner Folge)
            var wahl = [];
            for (var kk = 0; kk < 2; kk++) {
                var pi = (V.zyklus + kk) % 2,
                    noetig = false,
                    handZiel = false,
                    ziele = {};
                for (var g2 = 0; g2 < 2; g2++) {
                    var gn = _PAARE[pi][g2],
                        soll = _kletterSoll(K, hu2, n, s1, gn),
                        ziel;
                    if (gn.charAt(0) === "h" && vv >= 0) {
                        // DIE HAND GREIFT UM, sobald ein höherer Anker in ihrer Reichweite liegt (dann an deren Grenze) oder ihr Griff seitlich
                        // aus ihrer Seite fällt — sonst hält sie (bis w4-koerper-park: erst 0,16 m hinter dem Soll, dann lag der nächste
                        // Anker oft unter der Schulter)
                        // (die Hand greift aus der Lage von jetzt: während sie umgreift, hält der Leib ihren Griff-Abstand)
                        ziel = _kletterGriff(K, a, hu2, n, s1, gn);
                        if (ziel[1] > V.halt[gn][1] + VG.hoeherM || Math.abs(_dot(_sub(V.halt[gn], soll), s1)) > VG.seiteM) noetig = handZiel = true;
                        else ziel = V.halt[gn];
                    } else {
                        ziel = _kletterAnker(a, gn, gn.charAt(0) === "f" ? _kletterSoll(K, handZiel ? hu2 : huZ, n, s1, gn) : soll);
                        if (_len(_sub(V.halt[gn], soll)) > VG.abstandM * 0.5 && _len(_sub(ziel, V.halt[gn])) > 1e-6) noetig = true;
                    }
                    ziele[gn] = ziel;
                }
                if (noetig) wahl.push({ pi: pi, ziele: ziele, hand: handZiel });
            }
            var gw = wahl.filter(function (w) {
                return w.hand;
            })[0] || wahl[0];
            if (gw) {
                V.paar = gw.pi;
                V.ziel = gw.ziele;
                V.von = { hand1: V.halt.hand1, "hand-1": V.halt["hand-1"], fuss1: V.halt.fuss1, "fuss-1": V.halt["fuss-1"] };
                V.seitGlied = t;
                V.zyklus = 1 - gw.pi;
            }
        }
        V.lage = _lageAusHuefte(K, hu2, a);
        V.gier = gier;
        V.phase = V.paar < 0 ? 0 : V.paar + 1; // halten · Schwung Hand 1 + Fuß −1 · Schwung Hand −1 + Fuß 1
        L.playerVel.setValue(s1[0] * vq, vv, s1[2] * vq);
        L._fieldVy = 0;
        L.isInAir = true;
        L.isJumping = false;
        return true;
    }
    // ── HANGELN am Holm: der Leib hängt unter dem Griff (das Pendel um die Hände); an der Hangel-Leiter wechselt vor (W) die
    //    hintere Hand an die Sprosse vor der vorderen — jeder Wechsel eine halbe Schwingung π√(L/g), Hand über Hand; am Reck
    //    greift quer (A/D) um querM seitlich. Der Sprung lässt los.
    function _holmAchse(a, q) {
        // die Achse der Sprosse bzw. Stange, an der q liegt
        var best = null,
            bd = Infinity;
        for (var i = 0; i < a.holme.length; i++) {
            var A = a.holme[i][0],
                ab = _sub(a.holme[i][1], A),
                l2 = _dot(ab, ab);
            var u = l2 > 0 ? Math.max(0, Math.min(1, _dot(_sub(q, A), ab) / l2)) : 0;
            var d = _len(_sub(_add(A, _mul(ab, u)), q));
            if (d < bd) {
                bd = d;
                best = _norm(ab);
            }
        }
        return best;
    }
    function _handAm(a, q, hand, gier) {
        var ax = _holmAchse(a, q),
            s1 = _seite1(gier);
        var sx = _dot(ax, s1) >= 0 ? ax : _mul(ax, -1);
        return a.richtung ? _add(q, _mul(sx, (hand === "hand1" ? 1 : -1) * VERB_GESETZ.hangeln.spreizM)) : _v3(q);
    }
    function _holmMitte(a, i) {
        return _mix(a.holme[i][0], a.holme[i][1], 0.5);
    }
    function _hangeln(L, T, K, t, dt, neu, frischS) {
        var V = L.leibVerb,
            a = V.ang,
            M = K.mass,
            g = K.g,
            VG = VERB_GESETZ.hangeln;
        var Lp = M.reichM + M.schulterM; // Griff → Hüfte (das Pendel)
        var halb = Math.PI * Math.sqrt(Lp / g);
        var i;
        if (neu) {
            var p0 = K.lage,
                h0 = [p0[0], p0[1] + M.griffHoeheM, p0[2]],
                fw = [L.forward.x, 0, L.forward.z];
            if (a.richtung) {
                var r0 = [a.richtung[0], 0, a.richtung[2]];
                V.blick = _dot(fw, r0) >= 0 ? r0 : _mul(r0, -1);
                var bi = 0,
                    bd = Infinity;
                for (i = 0; i < a.holme.length; i++) {
                    var dd = _len(_sub(_holmMitte(a, i), h0));
                    if (dd < bd) {
                        bd = dd;
                        bi = i;
                    }
                }
                V.griff = { hand1: _holmMitte(a, bi), "hand-1": _holmMitte(a, bi) };
            } else {
                var ax = _norm(_sub(a.achse.b, a.achse.a)),
                    nr = _norm([ax[2], 0, -ax[0]]);
                V.blick = _dot(fw, nr) >= 0 ? nr : _mul(nr, -1);
                var g0 = _naechster(null, a.holme, h0);
                var s1i = _seite1(Math.atan2(V.blick[0], V.blick[2])),
                    axo = _dot(ax, s1i) >= 0 ? ax : _mul(ax, -1);
                V.griff = { hand1: _naechster(null, a.holme, _add(g0, _mul(axo, VG.spreizM))), "hand-1": _naechster(null, a.holme, _add(g0, _mul(axo, -VG.spreizM))) };
            }
            V.gier = Math.atan2(V.blick[0], V.blick[2]);
            V.hand = { hand1: _handAm(a, V.griff.hand1, "hand1", V.gier), "hand-1": _handAm(a, V.griff["hand-1"], "hand-1", V.gier) };
            V.wechsel = null;
            V.zyklus = 0;
            V.swing = { theta: 0, omega: 0 };
            V.huefte = [p0[0], (V.hand.hand1[1] + V.hand["hand-1"][1]) / 2 - Lp, p0[2]];
        }
        _merke(L, T);
        if (!neu && frischS) {
            V.lage = _lageAusHuefte(K, V.huefte, a);
            _verbEnde(L, L.playerVel.x(), 0, L.playerVel.z(), t);
            return true;
        }
        if (!V.wechsel) {
            var ziel = null,
                hand = null;
            if (a.richtung && (T.vor || 0) > 0) {
                var gleich = _len(_sub(V.griff.hand1, V.griff["hand-1"])) < 1e-6;
                var vorne = _dot(_sub(V.griff.hand1, V.griff["hand-1"]), V.blick) >= 0 ? "hand1" : "hand-1";
                hand = gleich ? (V.zyklus % 2 === 0 ? "hand1" : "hand-1") : vorne === "hand1" ? "hand-1" : "hand1";
                var basis = V.griff[gleich ? hand : vorne];
                var bestZ = null,
                    bz = Infinity;
                for (i = 0; i < a.holme.length; i++) {
                    var q = _holmMitte(a, i),
                        vor = _dot(_sub(q, basis), V.blick);
                    if (vor > 0.05 && vor < bz) {
                        bz = vor;
                        bestZ = q;
                    }
                }
                ziel = bestZ;
            } else if (!a.richtung && Math.abs(T.quer || 0) > 0) {
                var s1q = _seite1(V.gier),
                    axq = _norm(_sub(a.achse.b, a.achse.a));
                var dirQ = _dot(axq, s1q) >= 0 ? axq : _mul(axq, -1);
                if (T.quer < 0) dirQ = _mul(dirQ, -1);
                var fuehrend = T.quer > 0 ? "hand1" : "hand-1",
                    folgend = fuehrend === "hand1" ? "hand-1" : "hand1";
                var abst = _dot(_sub(V.griff[fuehrend], V.griff[folgend]), dirQ);
                hand = abst > 2 * VG.spreizM + 0.01 ? folgend : fuehrend;
                var ziel0 = _add(V.griff[hand], _mul(dirQ, VG.querM));
                var zq = _naechster(null, a.holme, ziel0);
                ziel = zq && _len(_sub(zq, V.griff[hand])) > 0.02 ? zq : null;
            }
            if (ziel && hand) {
                V.wechsel = { hand: hand, von: V.hand[hand], griff: _v3(ziel), ziel: _handAm(a, ziel, hand, V.gier), seit: t, dauer: halb };
                V.zyklus++;
            }
        }
        var traeger = null;
        if (V.wechsel) {
            var w = V.wechsel,
                s = Math.min(1, (t - w.seit) / w.dauer),
                e = 0.5 - 0.5 * Math.cos(Math.PI * s);
            // die Hand löst nach UNTEN (der Unterarm hängt unter der Stange — gehoben führte sie ihn durch die Stange) und greift von unten;
            // der Leib hängt an der Bahn der Hand, nie an ihrem Tauchen (sonst reißt der haltende Arm über seine Reichweite)
            traeger = _mix(w.von, w.ziel, e);
            V.hand[w.hand] = _add(traeger, [0, -0.1 * Math.sin(Math.PI * s), 0]);
            if (s >= 1) {
                V.hand[w.hand] = _v3(w.ziel);
                V.griff[w.hand] = w.griff;
                V.wechsel = null;
                traeger = null;
            }
        }
        var hTr = { hand1: V.hand.hand1, "hand-1": V.hand["hand-1"] };
        if (traeger) hTr[w.hand] = traeger;
        var mitte = _mix(hTr.hand1, hTr["hand-1"], 0.5);
        // die Hüfte hängt unter der Mitte der Hände so tief, dass beide Arme reichen (die Hände liegen längs um ± halb auseinander)
        var halbW = Math.abs(_dot(_sub(hTr.hand1, hTr["hand-1"]), V.blick)) / 2;
        var tiefe = Math.sqrt(Math.max(0, (0.97 * M.reichM) * (0.97 * M.reichM) - halbW * halbW)) + M.schulterM;
        // das Pendel um die Mitte der Hände (der Wechsel schwingt die Hüfte in die Fahrt)
        var sw = V.swing;
        sw.omega += (-(g / tiefe) * Math.sin(sw.theta) - 1.2 * sw.omega) * dt;
        var huefte = [mitte[0] - V.blick[0] * tiefe * Math.sin(sw.theta), mitte[1] - tiefe * Math.cos(sw.theta), mitte[2] - V.blick[2] * tiefe * Math.sin(sw.theta)];
        // ohne Pendel-Schub folgt die Hüfte der Mitte waagrecht (der Wechsel zieht sie mit), das Pendel trägt den Rest
        sw.theta += sw.omega * dt;
        var alt = V.huefte;
        V.huefte = huefte;
        V.mitte = mitte;
        V.tempo = Math.hypot(huefte[0] - alt[0], huefte[2] - alt[2]) / dt;
        V.lage = _lageAusHuefte(K, huefte, a);
        V.phase = V.wechsel ? (V.wechsel.hand === "hand1" ? 1 : 2) : 0; // hängen · Hand 1 greift um · Hand −1 greift um
        L.playerVel.setValue((huefte[0] - alt[0]) / dt, (huefte[1] - alt[1]) / dt, (huefte[2] - alt[2]) / dt);
        L._fieldVy = 0;
        L.isInAir = true;
        L.isJumping = false;
        return true;
    }
    // ── BALANCIEREN auf dem Balken: längs höchstens tempo, quer höchstens querMs, der Antrieb der Luft-Zeile; wer die halbe Breite
    //    plus fussM verlässt, fällt (der freie Leib). Der Kontakt des Wirts trägt den Leib (keine Lage des Verbs).
    function _balancieren(L, T, K, t, dt, neu) {
        var V = L.leibVerb,
            a = V.ang,
            VG = VERB_GESETZ.balancieren;
        var p = K.lage,
            e = _bahnAbstand(a.bahn, p);
        _merke(L, T);
        if (!neu && (e.quer > a.breite / 2 + VG.fussM || e.u < 0 || e.u > 1 || L.isInAir || T.sprung)) {
            L.leibVerb = null;
            L._verbEndeAt = t;
            return false;
        }
        var md = L.moveDirection;
        var laenge = Math.sqrt(md.x * md.x + md.z * md.z),
            zug = Math.min(1, laenge);
        var mx = laenge > 0 ? md.x / laenge : 0,
            mz = laenge > 0 ? md.z / laenge : 0;
        var vor = mx * e.dir[0] + mz * e.dir[2],
            quer = mx * e.dir[2] - mz * e.dir[0];
        var vl = vor * VG.tempo * zug,
            vq = quer * VG.querMs * zug;
        var v = L.playerVel,
            f = 1 - Math.exp(-leibGesetz().luft.kAcc * dt);
        var tx = e.dir[0] * vl + e.dir[2] * vq,
            tz = e.dir[2] * vl - e.dir[0] * vq;
        L.playerVel.setValue(v.x() + (tx - v.x()) * f, v.y(), v.z() + (tz - v.z()) * f);
        var sp = Math.hypot(L.playerVel.x(), L.playerVel.z());
        V.gangPhase = (V.gangPhase + (sp / Math.max(0.05, 2 * K.mass.fussM)) * dt) % 1;
        if (sp > 0.02) V.gier = Math.atan2(L.playerVel.x(), L.playerVel.z());
        else if (V.gier == null) V.gier = Math.atan2(e.dir[0], e.dir[2]);
        V.linie = e;
        V.lage = null;
        V.tempo = sp;
        V.phase = sp < 0.02 ? 0 : V.gangPhase < 0.5 ? 1 : 2; // stehen · Fuß 1 vor · Fuß −1 vor
        return true;
    }

    // ── DER GANG (die Phase des EINEN Gang-Gesetzes und die Pose der Glieder; Welt `_gaitTick` · `_animateHumanoidRig`) ──
    // DER POSEN-BLEND: w(speed) exp-geglättet statt hartem isMoving-Schnitt — Rampe 0,25 → 0,55 m/s, k = 10, plus harte
    // ±0,2-Steilheits-Wand je Tick; NaN-Wände vor dem Gedächtnis
    function leibGangBlend(wPrev, speed, dt) {
        var w0 = Number.isFinite(wPrev) ? Math.min(1, Math.max(0, wPrev)) : 0;
        var v = Number.isFinite(speed) && speed > 0 ? speed : 0;
        var ziel = Math.min(1, Math.max(0, (v - 0.25) / 0.3));
        var d = Number.isFinite(dt) && dt > 0 ? Math.min(0.1, dt) : 0.016;
        var dw = (ziel - w0) * (1 - Math.exp(-10 * d));
        if (dw > 0.2) dw = 0.2;
        else if (dw < -0.2) dw = -0.2;
        return w0 + dw;
    }
    // ZWEI-KNOCHEN-IK (Kosinussatz) in der Sagittal-Ebene; vor/unten = Ziel-Offset in l1/l2-Einheiten. hip = rotation.x
    // (negativ = Bein vor), knee ≥ 0 beugt NACH HINTEN. Ziel im Hüftpunkt oder außer Reichweite → gestreckt Richtung Ziel,
    // reached = false — nie NaN.
    function leibZweiKnochen(l1, l2, vor, unten) {
        var L1 = Number(l1);
        var L2 = Number(l2);
        if (!(L1 > 1e-6) || !(L2 > 1e-6)) return { hip: 0, knee: 0, reached: false };
        var dF = Number.isFinite(vor) ? vor : 0;
        var dU = Number.isFinite(unten) ? unten : 0;
        var d = Math.hypot(dF, dU);
        if (!(d > 1e-6)) return { hip: 0, knee: 0, reached: false };
        var at = Math.atan2(dF, dU);
        if (d >= L1 + L2 - 1e-6) return { hip: -at, knee: 0, reached: false };
        var minD = Math.abs(L1 - L2) + 1e-6;
        if (d < minD) d = minD;
        var cosK = Math.max(-1, Math.min(1, (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2)));
        var knie = Math.PI - Math.acos(cosK);
        var cosG = Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)));
        var hip = -(at + Math.acos(cosG));
        if (!Number.isFinite(hip) || !Number.isFinite(knie)) return { hip: 0, knee: 0, reached: false };
        return { hip: hip, knee: knie, reached: true };
    }
    // DER GANG-TAKT je Bild: die Phase am Halter (der stehende Fuß hält, tetrapoda gangPhaseHaelt), das Blend-Gewicht, die
    // Amplitude mit dem Tempo. TC = der tetrapoda-Kern, gs = gangSchritt(v, L, Zeile), L = die Beinlänge (m), vRef = das
    // Bezugs-Tempo der Amplitude (das Geh-Tempo der Seele).
    function leibGangTakt(TC, halter, gs, v, d, emoF, vRef, L) {
        var g = halter._gait || (halter._gait = { w: 0, amp: 1, ik: null, S: 0, tast: 0.5, auf: Math.PI, omega: 0, L: 0 });
        var S1 = gs.S / emoF;
        if (gs.omega > 0) {
            var steht = !(halter._gaitW > 0.05) || !(g.S > 0);
            var S0 = steht ? 0 : g.S;
            if (steht || Math.abs(S0 - S1) > 1e-9 || g.tast !== gs.tast)
                halter.walkPhase = TC.gangPhaseHaelt(Number.isFinite(halter.walkPhase) ? halter.walkPhase : 0, S0, g.tast, S1, gs.tast);
        }
        halter.walkPhase = (halter.walkPhase || 0) + d * gs.omega * emoF;
        halter._gaitW = root.__koerperCore.leibGangBlend(halter._gaitW, v, d);
        g.w = halter._gaitW;
        g.S = S1;
        g.tast = gs.tast;
        g.hub = gs.hub;
        g.auf = 2 * Math.PI * (1 - gs.tast);
        g.omega = gs.omega * emoF;
        g.L = L;
        g.amp = Math.max(0.7, Math.min(1.3, 0.55 + 0.45 * (v / vRef)));
        return g;
    }
    // DIE ZUORDNUNG Profil → Rig als Daten: welches koerper-fx.motion-Feld welches Rig-Bone um welche Achse verschiebt (mul =
    // Vorzeichen-Brücke Labor ↔ Rig: armL + hebt, die L-Schulter-z ist die Adduktions-Achse, R gespiegelt). Angewandt als
    // DELTA zum Labor-idle (`p[key] − ref[key]`) — idle ist per Konstruktion neutral.
    var MOTION_RIG_MAP = Object.freeze([
        Object.freeze({ key: "headX", bone: "head", axis: "x", mul: 1 }),
        Object.freeze({ key: "headY", bone: "head", axis: "y", mul: 1 }),
        Object.freeze({ key: "headZ", bone: "head", axis: "z", mul: 1 }),
        Object.freeze({ key: "spineX", bone: "spine", axis: "x", mul: 1 }),
        Object.freeze({ key: "spineY", bone: "spine", axis: "y", mul: 1 }),
        Object.freeze({ key: "spineZ", bone: "spine", axis: "z", mul: 1 }),
        Object.freeze({ key: "armL", bone: "armL.shoulder", axis: "z", mul: 1 }),
        Object.freeze({ key: "armR", bone: "armR.shoulder", axis: "z", mul: -1 }),
        Object.freeze({ key: "armLX", bone: "armL.shoulder", axis: "x", mul: 1 }),
        Object.freeze({ key: "armRX", bone: "armR.shoulder", axis: "x", mul: 1 }),
        Object.freeze({ key: "elbowL", bone: "armL.elbow", axis: "x", mul: -1 }),
        Object.freeze({ key: "elbowR", bone: "armR.elbow", axis: "x", mul: -1 }),
        Object.freeze({ key: "hipLX", bone: "legL.hip", axis: "x", mul: 1 }),
        Object.freeze({ key: "hipRX", bone: "legR.hip", axis: "x", mul: 1 }),
        Object.freeze({ key: "hipLZ", bone: "legL.hip", axis: "z", mul: 1 }),
        Object.freeze({ key: "hipRZ", bone: "legR.hip", axis: "z", mul: 1 }),
        Object.freeze({ key: "kneeL", bone: "legL.knee", axis: "x", mul: 1 }),
        Object.freeze({ key: "kneeR", bone: "legR.knee", axis: "x", mul: 1 }),
    ]);
    // DAS RIG AUF DEN GELENKEN DES GUSSES (w28-mensch-samen — die EINE Zuordnung: Welt `_buildHumanoidRig`, Labor `playLeib`, das
    // Urteil der Ruhe `armRuheUrteil`): t = die Gelenke nach Namen (die Knochen des Ofens oder Daten-Knoten mit `rotation`), wie
    // sie in der RUHE des Gusses stehen (der Bind-Pose: `_armRuhe` hängte die Arme an den Rumpf). `armRuhe` merkt die Ruhe der
    // Arm-Kette, je Seite je Gelenk [x, y, z] (Euler XYZ): die neutrale Pose stellt sie (`leibRigNeutral`), und keine Pose an
    // Land legt die Schulter darunter (`leibRigPose`). Bis hier trugen Welt und Labor die Zuordnung je selbst, und ihre neutrale
    // Pose stellte jedes Gelenk auf 0: die Ruhe der Arme (ARM_RUHE, 6–21° Abspreizung je Körperbau) fiel in jedem Bild der Welt,
    // der Oberarm hing lotrecht im Brustkorb, und der Kontrapost legte 0,19 / 0,17 rad nach innen dazu — am Guss des Ofens
    // (L0, die fünf Körper von ARM_RUHE) 174–261 Arm-Ecken im Rumpf, die Hände im Schritt, in der Bind-Pose 0.
    function leibRig(t) {
        var kette = function (a, b, c, na, nb, nc) {
            var o = {};
            o[na] = t[a] || null;
            o[nb] = t[b] || null;
            o[nc] = t[c] || null;
            return o;
        };
        var arm = function (sd) {
            return kette("arm" + sd, "elbow" + sd, "hand" + sd, "shoulder", "elbow", "wrist");
        };
        var bein = function (sd) {
            return kette("hip" + sd, "knee" + sd, "ankle" + sd, "hip", "knee", "ankle");
        };
        var r = { hips: t.mensch || null, spine: t.torso || null, chest: t.torso || null, neck: t.head || null, head: t.head || null, armL: arm("1"), armR: arm("-1"), legL: bein("1"), legR: bein("-1") };
        _rigRuhe(r);
        return r;
    }
    // DIE RUHE EINES RIGS: die Lage seiner Arm-Knochen, wenn es zum ersten Mal steht — an `leibRig` die Bind-Pose des Gusses, an
    // jedem anderen Rig (der Rig-Probe einer Linse) die Lage, in der es zum ersten Mal neutral gestellt wird. EINE Stelle, die die
    // Ruhe merkt; bis hier warf die neutrale Pose an einem Rig, das nicht durch `leibRig` ging, und die Emotion erreichte den Kopf
    // nie (gate:nervensystem-labs E: sad=undefined).
    function _rigRuhe(r) {
        if (!Array.isArray(r.armRuhe))
            r.armRuhe = [r.armL, r.armR].map(function (seite) {
                var o = {};
                for (var k in seite) if (seite[k]) o[k] = [seite[k].rotation.x, seite[k].rotation.y, seite[k].rotation.z];
                return o;
            });
        return r.armRuhe;
    }
    // DIE NEUTRALE POSE DES RIGS (absolut gesetzt vor jeder Pose — kein Drift zwischen ihnen; Welt `_animateHumanoidRig`, Labor
    // `playPose`): Becken, Rumpf, Kopf und Beine auf 0, die Arm-Kette in ihrer Ruhe (`_rigRuhe`).
    function leibRigNeutral(r) {
        _rigRuhe(r);
        var mitte = [r.hips, r.spine, r.chest, r.neck, r.head],
            seiten = [r.armL, r.armR, r.legL, r.legR],
            i,
            k;
        for (i = 0; i < mitte.length; i++) if (mitte[i]) mitte[i].rotation.set(0, 0, 0);
        for (i = 0; i < seiten.length; i++)
            for (k in seiten[i]) {
                var u = i < 2 ? r.armRuhe[i][k] : null;
                if (seiten[i][k]) seiten[i][k].rotation.set(u ? u[0] : 0, u ? u[1] : 0, u ? u[2] : 0);
            }
    }
    // DIE POSE DES RIGS an Land (Ruhe ×(1−w) und Gehen ×w, beide additiv über der neutralen Pose `leibRigNeutral`): das
    // Kontrapost mit Atem und der Emotion als Daten-Delta (mp/mref die Profile des Wirts, kalt null), die Beine auf dem Ziel des
    // Gang-Gesetzes (tetrapoda gangFuss, das Becken gangBecken, die Zwei-Knochen-IK), die Arme gegen die Beine, die Becken-Senke.
    // r = das Rig (`leibRig`) {hips, spine, chest, neck, head, armL/armR {shoulder, elbow, wrist}, legL/legR {hip, knee, ankle}} mit
    // THREE-Rotationen; M = die Bein-Maße (l1, l2, wpl, wz, L), Z = die Gang-Zeile der Welt-Schwere, TC = der tetrapoda-Kern.
    // DIE RUHE DER ARME HÄLT (w28-mensch-samen): nach jedem Delta — Kontrapost, Emotion, Gang — steht die Schulter nie unter ihrer
    // Ruhe (`r.armRuhe`: der Arm hängt am Rumpf, weiter innen liegt er IN ihm); der Kontrapost trägt die Arme nicht mehr nach innen.
    function leibRigPose(r, t, walkPhase, isMoving, gait, mp, mref, M, Z, TC) {
        if (!Array.isArray(r.armRuhe)) throw new Error("leibRigPose: das Rig ohne die Ruhe seiner Arme (koerper leibRig) — fail-closed");
        var w = gait && Number.isFinite(gait.w) ? Math.max(0, Math.min(1, gait.w)) : isMoving ? 1 : 0;
        var amp = gait && Number.isFinite(gait.amp) ? Math.max(0.5, Math.min(1.6, gait.amp)) : 1;
        var add = function (b, ax, v) {
            if (b && v) b.rotation[ax] += v;
        };
        if (w < 0.999) {
            var wi = 1 - w;
            var bAmp = mp && mref && Number.isFinite(mp.breath) && mref.breath > 0 ? 0.02 * (mp.breath / mref.breath) : 0.02;
            var bRate = mp && mref && Number.isFinite(mp.freq) && mref.freq > 0 ? 1.6 * (mp.freq / mref.freq) : 1.6;
            var breath = Math.sin(t * bRate) * bAmp;
            add(r.spine, "z", 0.1 * wi);
            add(r.chest, "z", -0.06 * wi);
            add(r.neck, "z", 0.05 * wi);
            add(r.spine, "x", (-0.02 + breath) * wi);
            add(r.legL.hip, "x", 0.08 * wi);
            add(r.legL.knee, "x", 0.16 * wi);
            add(r.legR.knee, "x", 0.04 * wi);
            add(r.armL.elbow, "x", -0.18 * wi);
            add(r.armR.elbow, "x", -0.1 * wi);
            var kpMul = mp && Number.isFinite(Number(mp.kpMul)) ? Number(mp.kpMul) : 1;
            var dtK = r._kpmulT != null ? Math.max(0, Math.min(0.08, t - r._kpmulT)) : 0;
            r._kpmulT = t;
            if (mp && mref && mp === mref) r._kpmulAcc = null;
            if (mp && mref && mp !== mref) {
                if (!r._kpmulAcc) r._kpmulAcc = Object.create(null);
                var a = kpMul >= 0.999 || dtK <= 0 ? 1 : 1 - Math.exp(-Math.max(18, 55 * kpMul) * dtK);
                for (var ri = 0; ri < MOTION_RIG_MAP.length; ri++) {
                    var row = MOTION_RIG_MAP[ri];
                    var dv = ((Number(mp[row.key]) || 0) - (Number(mref[row.key]) || 0)) * wi;
                    var accKey = row.key + "." + row.axis;
                    var prev = r._kpmulAcc[accKey] || 0;
                    var out = prev + (dv - prev) * a;
                    r._kpmulAcc[accKey] = out;
                    if (!out) continue;
                    var seg = row.bone.split(".");
                    var bone = seg.length === 2 ? r[seg[0]] && r[seg[0]][seg[1]] : r[seg[0]];
                    if (bone && bone.rotation) bone.rotation[row.axis] += out * row.mul;
                }
            }
            if (r.hips && mp) {
                var m0 = mref || mp;
                var dX = ((Number(mp.bodyX) || 0) - (Number(m0.bodyX) || 0)) * wi;
                var dZ = ((Number(mp.bodyZ) || 0) - (Number(m0.bodyZ) || 0)) * wi;
                add(r.hips, "x", dX);
                add(r.hips, "z", dZ);
                var swayA = Number.isFinite(mp.sway) ? mp.sway : 0.022;
                add(r.hips, "z", Math.sin(t * 1.1) * swayA * wi);
                add(r.hips, "x", Math.sin(t * 0.7) * swayA * 0.35 * wi);
            }
        }
        var S = w > 0.001 && gait && gait.S > 0 ? gait.S : 0;
        var MM = S > 0 ? M : null;
        var sw = Math.sin(walkPhase);
        r._gangSenke = 0;
        if (r._gangStand) r._gangStand[0] = r._gangStand[1] = true;
        if (r._gangRoll) r._gangRoll[0] = r._gangRoll[1] = null;
        if (MM && MM.l1 > 0 && MM.l2 > 0) {
            var tast = gait.tast;
            var Sl = S / MM.wz;
            var hubL = (gait.hub * MM.L) / MM.wpl;
            var L12 = MM.l1 + MM.l2;
            var R = TC.gangReich(L12);
            var FL = TC.gangFuss(walkPhase, Sl, tast, Z, R);
            var FR = TC.gangFuss(walkPhase + Math.PI, Sl, tast, Z, R);
            var roll = r._gangRoll || (r._gangRoll = [null, null]);
            var Zs = r._sohle && (r._sohleZ || (r._sohleZ = Object.assign({}, Z, { ballen: r._sohle[0] / R, knoechel: r._sohle[1] / R })));
            roll[0] = Zs ? TC.gangFuss(walkPhase, Sl, tast, Zs, R) : FL;
            roll[1] = Zs ? TC.gangFuss(walkPhase + Math.PI, Sl, tast, Zs, R) : FR;
            var tief = L12 - R + TC.gangBecken(walkPhase, Sl, tast, R, gait.omega, Z, MM.wpl);
            r._gangSenke = tief;
            var auf = 2 * Math.PI * (1 - tast);
            var uu = function (p) {
                return ((p % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
            };
            r._gangStand = r._gangStand || [false, false];
            r._gangStand[0] = uu(walkPhase) >= auf;
            r._gangStand[1] = uu(walkPhase + Math.PI) >= auf;
            var unten = function (F, h) {
                return Math.min(L12 - tief - h, Math.sqrt(Math.max(0, R * R - F.dz * F.dz)));
            };
            var ikL = root.__koerperCore.leibZweiKnochen(MM.l1, MM.l2, FL.dz, unten(FL, FL.hub * hubL + FL.heb));
            var ikR = root.__koerperCore.leibZweiKnochen(MM.l1, MM.l2, FR.dz, unten(FR, FR.hub * hubL + FR.heb));
            add(r.legL.hip, "x", ikL.hip * w);
            add(r.legL.knee, "x", ikL.knee * w);
            add(r.legL.ankle, "x", (FL.roll - ikL.hip - ikL.knee) * w);
            add(r.legR.hip, "x", ikR.hip * w);
            add(r.legR.knee, "x", ikR.knee * w);
            add(r.legR.ankle, "x", (FR.roll - ikR.hip - ikR.knee) * w);
            sw = Math.max(-1, Math.min(1, (FR.dz - FL.dz) / Sl));
        }
        if (w > 0.001) {
            var wa = w * amp;
            // DIE ARME IM LAUF: wer läuft (der Tastgrad des Gang-Gesetzes fällt unter den des Gehens, die Flug-Phase beginnt), trägt
            // die Ellbogen gebeugt — beim Gehen ~20°, im Lauf ~90° (Hinrichs 1990); dazwischen gleitend über den Tastgrad
            var GA = GANG_ARME,
                lauf = gait && Number.isFinite(gait.tast) ? Math.max(0, Math.min(1, (GA.tastGehen - gait.tast) / (GA.tastGehen - GA.tastLauf))) : 0;
            var ell = GA.ellbogenGehen + (GA.ellbogenLauf - GA.ellbogenGehen) * lauf;
            add(r.armL.shoulder, "x", -0.4 * sw * wa);
            add(r.armR.shoulder, "x", 0.4 * sw * wa);
            add(r.armL.elbow, "x", (-ell - 0.2 * Math.max(0, -sw) * amp) * w);
            add(r.armR.elbow, "x", (-ell - 0.2 * Math.max(0, sw) * amp) * w);
            add(r.spine, "z", 0.05 * sw * wa);
            add(r.spine, "y", 0.07 * sw * wa);
            add(r.chest, "y", -0.06 * sw * wa);
        }
        var sL = r.armL.shoulder,
            sR = r.armR.shoulder,
            uL = r.armRuhe[0].shoulder,
            uR = r.armRuhe[1].shoulder;
        if (sL && uL && sL.rotation.z < uL[2]) sL.rotation.z = uL[2];
        if (sR && uR && sR.rotation.z > uR[2]) sR.rotation.z = uR[2];
        if (r.hips) {
            if (r._baseHipY == null) r._baseHipY = r.hips.position.y;
            r.hips.position.y = r._baseHipY - r._gangSenke * w;
        }
    }

    // ── DER EINE LEIB-LÖSER DER POSE (je Verb und Phase): Hand am Griff-Anker, Fuß am Tritt-Anker, je Glied die Zwei-Knochen-
    //    Kette in 3D (Schulter–Ellbogen–Griff der Hand, Hüfte–Knie–Knöchel–Ballen), die Wurzel aus dem Verb. Gerechnet im
    //    Rahmen der Wurzel (Gelenk-Einheiten, vor ihrer Skala), ausgegeben als Welt-Lage der Wurzel und lokale Quaternionen —
    //    der Wirt legt sie auf DIESELBEN Gelenke (Welt: das Rig des Ofens, Labor: der Baum des Gusses).
    function _qMul(a, b) {
        return [
            a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
            a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
            a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
            a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
        ];
    }
    function _qInv(q) {
        return [-q[0], -q[1], -q[2], q[3]];
    }
    function _qRot(q, v) {
        var x = v[0],
            y = v[1],
            z = v[2],
            qx = q[0],
            qy = q[1],
            qz = q[2],
            qw = q[3];
        var ix = qw * x + qy * z - qz * y,
            iy = qw * y + qz * x - qx * z,
            iz = qw * z + qx * y - qy * x,
            iw = -qx * x - qy * y - qz * z;
        return [ix * qw + iw * -qx + iy * -qz - iz * -qy, iy * qw + iw * -qy + iz * -qx - ix * -qz, iz * qw + iw * -qz + ix * -qy - iy * -qx];
    }
    function _qAchse(ax, w) {
        var s = Math.sin(w / 2);
        return [ax[0] * s, ax[1] * s, ax[2] * s, Math.cos(w / 2)];
    }
    // Euler in der Ordnung des Rigs (XYZ: erst z, dann y, dann x im Eltern-Rahmen — die THREE-Voreinstellung der Gelenke)
    function _qEuler(x, y, z) {
        var c1 = Math.cos(x / 2),
            c2 = Math.cos(y / 2),
            c3 = Math.cos(z / 2),
            s1 = Math.sin(x / 2),
            s2 = Math.sin(y / 2),
            s3 = Math.sin(z / 2);
        return [s1 * c2 * c3 + c1 * s2 * s3, c1 * s2 * c3 - s1 * c2 * s3, c1 * c2 * s3 + s1 * s2 * c3, c1 * c2 * c3 - s1 * s2 * s3];
    }
    // die Wurzel in der Ordnung der Gruppe des Wirts (YXZ: Gier, dann Nicken, dann Rollen)
    function _qGier(gier, nick, roll) {
        return _qMul(_qMul(_qAchse([0, 1, 0], gier), _qAchse([1, 0, 0], nick || 0)), _qAchse([0, 0, 1], roll || 0));
    }
    // die Rotation, die die Basis (e1, e2) auf (f1, f2) legt (beide orthonormal ergänzt)
    function _qBasis(e1, e2, f1, f2) {
        var a2 = _norm(_sub(e2, _mul(e1, _dot(e2, e1)))),
            b2 = _norm(_sub(f2, _mul(f1, _dot(f2, f1))));
        var a3 = _cross(e1, a2),
            b3 = _cross(f1, b2);
        // R = B · Aᵀ
        var m = [];
        for (var i = 0; i < 3; i++)
            for (var j = 0; j < 3; j++) m[i * 3 + j] = f1[i] * e1[j] + b2[i] * a2[j] + b3[i] * a3[j];
        var tr = m[0] + m[4] + m[8],
            q;
        if (tr > 0) {
            var s = 0.5 / Math.sqrt(tr + 1);
            q = [(m[7] - m[5]) * s, (m[2] - m[6]) * s, (m[3] - m[1]) * s, 0.25 / s];
        } else if (m[0] > m[4] && m[0] > m[8]) {
            var s1 = 2 * Math.sqrt(1 + m[0] - m[4] - m[8]);
            q = [0.25 * s1, (m[1] + m[3]) / s1, (m[2] + m[6]) / s1, (m[7] - m[5]) / s1];
        } else if (m[4] > m[8]) {
            var s2 = 2 * Math.sqrt(1 + m[4] - m[0] - m[8]);
            q = [(m[1] + m[3]) / s2, 0.25 * s2, (m[5] + m[7]) / s2, (m[2] - m[6]) / s2];
        } else {
            var s3 = 2 * Math.sqrt(1 + m[8] - m[0] - m[4]);
            q = [(m[2] + m[6]) / s3, (m[5] + m[7]) / s3, 0.25 * s3, (m[3] - m[1]) / s3];
        }
        var l = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]) || 1;
        return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
    }
    // DIE KETTE DES LEIBS aus dem Skelett des Gusses ({joints:[{name, parent, pos, quat, scale}], root, handMitte, sitz}): die Ruhe-Lage
    // je Gelenk (relativ zum Eltern-Gelenk, Gelenk-Einheiten), die Skala der Wurzel (die Dials), die Mitte der Hand, die Höhe des
    // Sitzes (leibSitz, die gegossene Haut), die Sohle und der Ballen des Fußes (labProportionen footBelowAnkle, Gang-Zeile ballen ×
    // Bein) — und die Maße des Leibs in Metern
    var KETTE_GELENKE = ["torso", "head", "arm1", "arm-1", "elbow1", "elbow-1", "hand1", "hand-1", "hip1", "hip-1", "knee1", "knee-1", "ankle1", "ankle-1"];
    // DIE SOHLE DES GEBAUTEN FUSSES (leib.K2 — die EINE Messung für Welt, Labor und Linse): [Spitze vor, Sohle unter, Ferse vor]
    // dem Knöchel im Knöchel-Raum der Bind-Pose — die Ecken der Haut, die der Knöchel trägt (Gewicht > 0,5, jede Haut unter `mesh`):
    // die vorderste Stelle der Unterkante (≤ 0,02 Maß über der tiefsten), die tiefste, die hinterste. Ein Fuß ohne Zehen-Gelenk
    // rollt über die Spitze seiner Sohle (die Welt: `_gaitRollung`). Die Rechnung ist die der THREE-Matrix (Spalten-Ordnung,
    // dieselbe Folge der Summen), ohne THREE: der Knöchel-Raum = boneInverse × bindMatrix × Ecke. null: keine Haut am Knöchel.
    // DIE GUSS-LAGE eines Meshes (haar.K4 — die Leser der gegossenen Haut: leibSohle · leibSitz · leibGlieder, die Haut-Proben des
    // Labors): ein Tuch, das der weiche Löser bewegt, trägt in seinem Positions-Puffer den Takt (`tuchTakt` schreibt ihn, im Labor in
    // die Geometrie selbst, in der Welt in die eigene Spalte) — gemessen wird der Guss, nie ein Takt des Tuchs: der Puffer eines
    // Zustands (`tuchZustand` trägt ihn hier ein) liest seine Ruhe-Lage (die drapierte Ecke des Gitters), jeder andere sich selbst.
    var _TUCH_RUHE = typeof WeakMap === "function" ? new WeakMap() : null;
    function leibGussLage(o) {
        var pa = o.geometry.attributes.position,
            r = _TUCH_RUHE && _TUCH_RUHE.get(pa);
        if (!r) return pa;
        return {
            count: pa.count,
            getX: function (i) {
                return r[3 * i];
            },
            getY: function (i) {
                return r[3 * i + 1];
            },
            getZ: function (i) {
                return r[3 * i + 2];
            },
        };
    }
    function leibSohle(mesh, knoechel) {
        var p = [];
        var komp = function (a, i, k) {
            return k === 0 ? a.getX(i) : k === 1 ? a.getY(i) : k === 2 ? a.getZ(i) : a.getW(i);
        };
        mesh.traverse(function (o) {
            var b = o.isSkinnedMesh ? o.skeleton.bones.indexOf(knoechel) : -1;
            if (b < 0) return;
            var A = o.geometry.attributes,
                si = A.skinIndex,
                sw = A.skinWeight,
                pa = leibGussLage(o);
            var ae = o.skeleton.boneInverses[b].elements,
                be = o.bindMatrix.elements,
                e = new Array(16),
                r,
                c;
            for (c = 0; c < 4; c++) for (r = 0; r < 4; r++) e[c * 4 + r] = ae[r] * be[c * 4] + ae[4 + r] * be[c * 4 + 1] + ae[8 + r] * be[c * 4 + 2] + ae[12 + r] * be[c * 4 + 3];
            for (var i = 0; i < pa.count; i++)
                for (var k = 0; k < 4; k++)
                    if (komp(si, i, k) === b && komp(sw, i, k) > 0.5) {
                        var x = pa.getX(i),
                            y = pa.getY(i),
                            z = pa.getZ(i),
                            w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
                        p.push([(e[0] * x + e[4] * y + e[8] * z + e[12]) * w, (e[1] * x + e[5] * y + e[9] * z + e[13]) * w, (e[2] * x + e[6] * y + e[10] * z + e[14]) * w]);
                    }
        });
        if (!p.length) return null;
        var y0 = Infinity,
            vorn = -Infinity,
            hinten = Infinity,
            j;
        for (j = 0; j < p.length; j++) y0 = Math.min(y0, p[j][1]);
        for (j = 0; j < p.length; j++) {
            if (p[j][1] <= y0 + 0.02) vorn = Math.max(vorn, p[j][2]);
            hinten = Math.min(hinten, p[j][2]);
        }
        return [vorn, -y0, hinten];
    }
    // DIE HÖHE DES SITZES (w4-koerper-park — die gegossene Haut statt der geratenen 0,1 m): wie hoch die Mitte der Hüft-Gelenke über
    // der tiefsten Haut des Sitzenden steht — die Haut des Beckens (Gewicht > 0,5 am Wurzel-Gelenk), um die Neigung des Beckens gegen
    // die Fläche gedreht (SITZ_KIPP: −1,2 … 0,6 rad, nach vorn +), die Haut des Oberschenkels (Gewicht > 0,5 am Hüft-Gelenk, das
    // obere Drittel bis zum Knie: was auf dem Sitz liegt) um die Beuge des Sitzens (VERB_POSE.sitzHuefte) in der Fläche gedreht —
    // jede Ecke gehäutet wie im Shader: ihr Anteil an den Oberschenkeln beugt, der Rest kippt mit dem Becken (w21-leib-bau);
    // dieselbe Bind-Rechnung wie leibSohle (Knochen-Raum = boneInverse × bindMatrix × Ecke). Meter je Neigung (Gelenk-Einheiten ×
    // Skala der Wurzel × Maßstab), Leser `_sitzTiefe`. knochen {mensch, hip1, "hip-1"}: die Gelenke der Haut (Welt: das Rig, Labor: der
    // Baum des Gusses). null: keine Haut an Becken oder Hüfte.
    var SITZ_KIPP = Object.freeze({ von: -1.2, schritt: 0.1, n: 19 });
    // DIE DICKE DER GLIEDER (w4-koerper-park — der Löser führt sie an den Teilen der Geräte vorbei): je Glied der Halbmesser der
    // gegossenen Haut um seinen Knochen — die Ecken mit Gewicht > 0,5 am Gelenk (Oberarm arm, Unterarm elbow, Oberschenkel hip,
    // Unterschenkel knee) im mittleren Teil des Glieds (25–75 % der Strecke Gelenk → Kind-Gelenk: die Säume an Schulter, Hüfte und
    // Gelenk zählen nicht), ihr Abstand zur Strecke im Knochen-Raum der Bind-Pose (dieselbe Rechnung wie leibSohle), das 75. Perzentil,
    // beide Seiten zusammen, in Metern. null: ein Glied ohne Haut.
    var GLIED_KNOCHEN = Object.freeze({ oberarm: ["arm", "elbow"], unterarm: ["elbow", "hand"], oberschenkel: ["hip", "knee"], unterschenkel: ["knee", "ankle"] });
    function leibGlieder(mesh, sk, knochen) {
        var J = {},
            i,
            out = {};
        for (i = 0; i < sk.joints.length; i++) J[sk.joints[i].name] = sk.joints[i];
        var m = J[sk.root].scale[1] * leibMassstab(),
            ab = {};
        mesh.traverse(function (o) {
            if (!o.isSkinnedMesh) return;
            var A = o.geometry.attributes,
                si = A.skinIndex,
                sw = A.skinWeight,
                pa = leibGussLage(o),
                be = o.bindMatrix.elements,
                E = {};
            var komp = function (a, n, k) {
                return k === 0 ? a.getX(n) : k === 1 ? a.getY(n) : k === 2 ? a.getZ(n) : a.getW(n);
            };
            for (var g in GLIED_KNOCHEN)
                for (var sd = 0; sd < 2; sd++) {
                    var nm = GLIED_KNOCHEN[g][0] + (sd ? "-1" : "1"),
                        b = o.skeleton.bones.indexOf(knochen[nm]);
                    if (b < 0) continue;
                    var ae = o.skeleton.boneInverses[b].elements,
                        e = new Array(16),
                        r,
                        c;
                    for (c = 0; c < 4; c++) for (r = 0; r < 4; r++) e[c * 4 + r] = ae[r] * be[c * 4] + ae[4 + r] * be[c * 4 + 1] + ae[8 + r] * be[c * 4 + 2] + ae[12 + r] * be[c * 4 + 3];
                    E[b] = { e: e, g: g, kind: J[GLIED_KNOCHEN[g][1] + (sd ? "-1" : "1")].pos };
                }
            for (var n = 0; n < pa.count; n++)
                for (var k = 0; k < 4; k++) {
                    var B = E[komp(si, n, k)];
                    if (!B || !(komp(sw, n, k) > 0.5)) continue;
                    var e2 = B.e,
                        x = pa.getX(n),
                        y = pa.getY(n),
                        z = pa.getZ(n),
                        w = 1 / (e2[3] * x + e2[7] * y + e2[11] * z + e2[15]);
                    var q = [(e2[0] * x + e2[4] * y + e2[8] * z + e2[12]) * w, (e2[1] * x + e2[5] * y + e2[9] * z + e2[13]) * w, (e2[2] * x + e2[6] * y + e2[10] * z + e2[14]) * w];
                    var l2 = _dot(B.kind, B.kind),
                        u = l2 > 0 ? _dot(q, B.kind) / l2 : 0;
                    if (u < 0.25 || u > 0.75) continue;
                    (ab[B.g] = ab[B.g] || []).push(_len(_sub(q, _mul(B.kind, u))));
                }
        });
        for (var g2 in GLIED_KNOCHEN) {
            var L = ab[g2];
            if (!L || !L.length) return null;
            L.sort(function (a, b) {
                return a - b;
            });
            out[g2] = L[Math.floor(0.75 * (L.length - 1))] * m;
        }
        return out;
    }
    function leibSitz(mesh, sk, knochen) {
        var J = {},
            i;
        for (i = 0; i < sk.joints.length; i++) J[sk.joints[i].name] = sk.joints[i];
        var s = J[sk.root].scale,
            qS = _qEuler(VERB_POSE.sitzHuefte, 0, 0),
            hY = (J.hip1.pos[1] + J["hip-1"].pos[1]) / 2,
            hZ = (J.hip1.pos[2] + J["hip-1"].pos[2]) / 2,
            becken = [],
            nBecken = 0,
            nBein = 0;
        var komp = function (a, n, k) {
            return k === 0 ? a.getX(n) : k === 1 ? a.getY(n) : k === 2 ? a.getZ(n) : a.getW(n);
        };
        mesh.traverse(function (o) {
            if (!o.isSkinnedMesh) return;
            var namen = ["mensch", "hip1", "hip-1"],
                idx = namen.map(function (n) {
                    return o.skeleton.bones.indexOf(knochen[n]);
                });
            if (idx[0] < 0 && idx[1] < 0 && idx[2] < 0) return;
            var A = o.geometry.attributes,
                si = A.skinIndex,
                sw = A.skinWeight,
                pa = leibGussLage(o),
                be = o.bindMatrix.elements;
            // das Gewicht, wie der Shader der Welt es liest (Uint16 normiert, stamm `_hautGewicht`; das Labor trägt Float32):
            // Welt und Labor rechnen dieselbe Zahl (Labor = Welt im Takt, gate:tier-gang)
            var gew = function (n, k) {
                return Math.round(Math.min(1, Math.max(0, komp(sw, n, k))) * 65535) / 65535;
            };
            var E = idx.map(function (b) {
                if (b < 0) return null;
                var ae = o.skeleton.boneInverses[b].elements,
                    e = new Array(16),
                    r,
                    c;
                for (c = 0; c < 4; c++) for (r = 0; r < 4; r++) e[c * 4 + r] = ae[r] * be[c * 4] + ae[4 + r] * be[c * 4 + 1] + ae[8 + r] * be[c * 4 + 2] + ae[12 + r] * be[c * 4 + 3];
                return e;
            });
            // die Ecke im Raum des Knochens g (Knochen-Raum = boneInverse × bindMatrix × Ecke)
            var lage = function (g, x, y, z) {
                var e = E[g],
                    w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
                return [(e[0] * x + e[4] * y + e[8] * z + e[12]) * w, (e[1] * x + e[5] * y + e[9] * z + e[13]) * w, (e[2] * x + e[6] * y + e[10] * z + e[14]) * w];
            };
            // die Ecke im Oberschenkel g, gebeugt wie im Sitzen
            var gebeugt = function (g, q) {
                var H = J[namen[g]];
                return _add(H.pos, _qRot(qS, [q[0] * H.scale[0], q[1] * H.scale[1], q[2] * H.scale[2]]));
            };
            for (var n = 0; n < pa.count; n++)
                for (var k = 0; k < 4; k++) {
                    var g = idx.indexOf(komp(si, n, k));
                    if (g < 0 || !(gew(n, k) > 0.5)) continue;
                    var x = pa.getX(n),
                        y = pa.getY(n),
                        z = pa.getZ(n),
                        q = lage(g, x, y, z);
                    if (g > 0 && q[1] < -_len(J[g === 1 ? "knee1" : "knee-1"].pos) / 3) continue;
                    // die Ecke gehäutet wie im Shader (Summe ihrer vier Gewichte, w21-leib-bau): der Anteil der Oberschenkel beugt mit
                    // ihnen, jeder andere (Wurzel, Rumpf) kippt mit dem Becken — bis hier zählte die Ecke starr an ihrem stärksten
                    // Gelenk, und die Brücke der EINEN Haut zwischen den Schenkeln (Wurzel 0,53, Schenkel 0,43) hing im Sitzen 0,77 E
                    // unter der Hüfte statt mit den Schenkeln gebeugt: der Leib saß 6 cm über dem Sitz, Arm und Schenkel in Kette und Griff
                    var ruhe = g > 0 ? _add(J[namen[g]].pos, [q[0] * J[namen[g]].scale[0], q[1] * J[namen[g]].scale[1], q[2] * J[namen[g]].scale[2]]) : q,
                        wB = 0,
                        yS = 0;
                    for (var k3 = 0; k3 < 4; k3++) {
                        var wk = gew(n, k3),
                            gk = idx.indexOf(komp(si, n, k3));
                        if (!(wk > 0)) continue;
                        if (gk > 0) yS += wk * (gebeugt(gk, gk === g ? q : lage(gk, x, y, z))[1] - hY);
                        else wB += wk;
                    }
                    becken.push([wB * (ruhe[1] - hY), wB * (ruhe[2] - hZ), yS]);
                    if (g > 0) nBein++;
                    else nBecken++;
                }
        });
        if (!nBecken || !nBein) return null;
        var tiefe = [],
            m = s[1] * leibMassstab();
        for (var k2 = 0; k2 < SITZ_KIPP.n; k2++) {
            var al = SITZ_KIPP.von + k2 * SITZ_KIPP.schritt,
                c = Math.cos(al),
                sn = Math.sin(al),
                yM = Infinity;
            for (var b = 0; b < becken.length; b++) yM = Math.min(yM, becken[b][0] * c - becken[b][1] * sn + becken[b][2]);
            tiefe.push(-yM * m);
        }
        return { von: SITZ_KIPP.von, schritt: SITZ_KIPP.schritt, tiefe: tiefe };
    }
    // die Höhe des Sitzes bei der Neigung al (rad, das Becken gegen die Fläche, nach vorn +), linear zwischen den Zeilen von leibSitz
    function _sitzTiefe(K, al) {
        var T = K.mass.sitzKipp,
            x = Math.max(0, Math.min(T.tiefe.length - 1, (al - T.von) / T.schritt)),
            i = Math.min(T.tiefe.length - 2, Math.floor(x));
        return T.tiefe[i] + (T.tiefe[i + 1] - T.tiefe[i]) * (x - i);
    }
    function leibKette(sk) {
        var J = {};
        for (var i = 0; i < sk.joints.length; i++) J[sk.joints[i].name] = sk.joints[i];
        if (!J[sk.root]) throw new Error("KERN-PFLICHT verletzt: das Skelett trägt keine Wurzel (leibKette)");
        for (var k = 0; k < KETTE_GELENKE.length; k++) if (!J[KETTE_GELENKE[k]]) throw new Error("KERN-PFLICHT verletzt: dem Skelett fehlt das Gelenk " + KETTE_GELENKE[k] + " (leibKette)");
        if (!sk.handMitte || !sk.handMitte.hand1 || !sk.handMitte["hand-1"]) throw new Error("KERN-PFLICHT verletzt: der Guss trägt keine Hand-Mitte (leibKette, Ofen L0)");
        if (!sk.sitz || !Array.isArray(sk.sitz.tiefe) || !(sk.sitz.tiefe.length > 1)) throw new Error("KERN-PFLICHT verletzt: der Leib trägt keine Höhe des Sitzes (leibKette, die gegossene Haut: leibSitz)");
        if (!sk.glieder || !(sk.glieder.unterarm > 0)) throw new Error("KERN-PFLICHT verletzt: der Leib trägt keine Dicke der Glieder (leibKette, die gegossene Haut: leibGlieder)");
        var LP = labProportionen(),
            f = leibMassstab(),
            s = J[sk.root].scale,
            G = leibGesetz().gang;
        var bein = _len(J.knee1.pos) + _len(J.ankle1.pos);
        var K = { J: J, root: sk.root, skala: s, f: f, handMitte: sk.handMitte, fussUnter: LP.footBelowAnkle, ballenZ: G.ballen * bein };
        var hY = J.hip1.pos[1];
        var schulterY = J.torso.pos[1] + J.arm1.pos[1];
        var unterarm = _len(_add(J.hand1.pos, sk.handMitte.hand1)),
            oberarm = _len(J.elbow1.pos);
        K.mass = {
            huefteM: (bein + LP.footBelowAnkle) * s[1] * f,
            schulterM: (schulterY - hY) * s[1] * f,
            schulterBreiteM: Math.abs(J.torso.pos[0] + J.arm1.pos[0]) * s[0] * f,
            reichM: (oberarm + unterarm) * s[1] * f,
            sitzKipp: sk.sitz,
            glied: sk.glieder,
            // die Hüfte vor der Kletter-Fläche: das gebeugte Bein findet Raum — der Oberschenkel zweimal (er faltet sich), der
            // Unterschenkel und die Sprosse (bis w4-koerper-park geraten 0,3 m: Oberschenkel und Knie lagen 11-14 cm hinter der Fläche)
            wandM: 2 * sk.glieder.oberschenkel + sk.glieder.unterschenkel + 2 * VERB_POSE.stangeM,
            fussM: (G.ballen * bein + 0.2) * s[2] * f,
        };
        K.mass.sitzHuefteM = _sitzTiefe(K, 0);
        K.mass.griffHoeheM = K.mass.huefteM + K.mass.schulterM + K.mass.reichM;
        // der Griff-Abstand (Schulter → Hand-Mitte), an dem der Ellbogen griffBeuge gebeugt ist (Kosinussatz über Ober- und Unterarm;
        // das Gesetz greift gestreckter als das Soll VERB_SOLL.griff erlaubt — die Schulter des Lösers ist geschätzt)
        var oa = oberarm * s[1] * f,
            ua = unterarm * s[1] * f,
            gb = Math.PI - (VERB_GESETZ.klettern.griffBeuge * Math.PI) / 180;
        K.mass.greifM = Math.sqrt(oa * oa + ua * ua - 2 * oa * ua * Math.cos(gb));
        return K;
    }
    // die Welt-Lage → der Rahmen der Wurzel (Gelenk-Einheiten vor ihrer Skala)
    function _inWurzel(R, p) {
        var d = _qRot(_qInv(R.q), _sub(p, R.p));
        return [d[0] / (R.f * R.s[0]), d[1] / (R.f * R.s[1]), d[2] / (R.f * R.s[2])];
    }
    // eine Welt-Richtung im Rahmen der Wurzel (die Skala der Wurzel streckt sie je Achse; Einheit)
    function _richtungWurzel(R, d) {
        var w = _qRot(_qInv(R.q), d);
        return _norm([w[0] / R.s[0], w[1] / R.s[1], w[2] / R.s[2]]);
    }
    // ein Glied: Ziel G (Wurzel-Rahmen) über die Kette Ursprung S (Wurzel-Rahmen) · Eltern-Rotation Qp (Wurzel-Rahmen) · u (zweites
    // Gelenk im eigenen Rahmen) · c (Ende im Rahmen des zweiten Gelenks, das um seine x-Achse um sg·φ beugt) · Pol pol (Wurzel-
    // Rahmen) → lokale Quaternion des ersten Gelenks, die Beuge φ, der Rest-Fehler (Gelenk-Einheiten)
    function _glied(S, Qp, u, c, G, pol, sg, phiMax) {
        var w = _qRot(_qInv(Qp), _sub(G, S)),
            d = _len(w);
        var r = function (phi) {
            return _add(u, _qRot(_qAchse([1, 0, 0], sg * phi), c));
        };
        var lo = 0,
            hi = phiMax,
            phi;
        if (_len(r(0)) <= d) phi = 0;
        else if (_len(r(phiMax)) >= d) phi = phiMax;
        else {
            for (var it = 0; it < 48; it++) {
                var m = (lo + hi) / 2;
                if (_len(r(m)) > d) lo = m;
                else hi = m;
            }
            phi = (lo + hi) / 2;
        }
        var ra = r(phi),
            ua = _norm(u),
            rn = _norm(ra);
        var cb = Math.max(-1, Math.min(1, _dot(ua, rn))),
            beta = Math.acos(cb);
        var wn = d > 1e-9 ? _mul(w, 1 / d) : _qRot(_qInv(Qp), [0, -1, 0]);
        var pl = _qRot(_qInv(Qp), pol);
        var pp = _sub(pl, _mul(wn, _dot(pl, wn)));
        if (_len(pp) < 1e-6) pp = Math.abs(wn[1]) < 0.9 ? _sub([0, 1, 0], _mul(wn, wn[1])) : _sub([1, 0, 0], _mul(wn, wn[0]));
        pp = _norm(pp);
        var ut = _add(_mul(wn, Math.cos(beta)), _mul(pp, Math.sin(beta)));
        // DAS GESTRECKTE GLIED (w21-leib-bau): liegt das Ende auf der Achse des Glieds (das Knie gestreckt, Ober- und Unterschenkel auf
        // einer Linie), bestimmen Ende und Ziel die Ebene der Beuge nicht — die Achse aus einem Rest von 1e-16 drehte das Glied nach dem
        // Rundungs-Rauschen um sich selbst (das Bein auf der Rutsche stand 0,04 oder 0,74 m neben seinem Ziel, je nach der siebten
        // Stelle der Sitz-Höhe). Dort gilt der Grenzwert derselben Abbildung (β → 0): die Richtung, in die das Ende beim Beugen
        // wandert, zeigt gegen den Pol
        var e2 = rn,
            f2 = wn;
        if (_len(_sub(rn, _mul(ua, _dot(rn, ua)))) < 1e-9) {
            var zieht = _mul(_cross([1, 0, 0], _qRot(_qAchse([1, 0, 0], sg * phi), c)), sg),
                zq = _sub(zieht, _mul(ua, _dot(zieht, ua)));
            if (_len(zq) > 1e-9) {
                e2 = _norm(zq);
                f2 = _sub(_mul(wn, Math.sin(beta)), _mul(pp, Math.cos(beta)));
            }
        }
        var q = _qBasis(ua, e2, ut, f2);
        var ende = _add(S, _qRot(Qp, _qRot(q, ra))),
            fehler = _len(_sub(ende, G));
        // was die Länge des Glieds nicht erreicht (gestreckt zu kurz, ganz gebeugt zu lang) — der Rest darüber ist ein Fehler des
        // Lösers (`ueber`; die Linse: leibSollUrteil „neben dem Ziel“, VERB_SOLL.glied)
        return { q: q, phi: phi, fehler: fehler, ueber: Math.max(0, fehler - Math.max(0, d - _len(r(0)), _len(r(phiMax)) - d)), ende: ende };
    }
    // P: {wurzel:{p (Welt, m), gier, nick, roll} | huefte:[x,y,z] (Welt, m) statt p, rumpf:{x,y,z}, kopf:{x,y,z}, haende:{hand1:[…]
    // Welt | null, "hand-1"}, fuesse:{fuss1:{p:[…] Welt (der Ballen), nick} | null, …}, pol:{hand1:[…] Wurzel-Rahmen, …}, arme:{arm1:
    // {x,z,ell} lokal}, beine:{hip1:{x,z,knie,fuss}}} → {wurzel:{p, q}, q:{gelenk: [x,y,z,w]}, fehler:{hand1: m, …}, ueber:{hand1: m, …}}
    // (ueber: der Fehler über dem, was die Länge des Glieds nicht erreicht — ein Fehler des Lösers)
    function leibPose(K, P) {
        var J = K.J,
            s = K.skala,
            f = K.f;
        var Qr = _qGier(P.wurzel.gier || 0, P.wurzel.nick || 0, P.wurzel.roll || 0);
        var hM = _mul(_add(J.hip1.pos, J["hip-1"].pos), 0.5);
        var o = P.wurzel.huefte ? _sub(P.wurzel.huefte, _qRot(Qr, [hM[0] * s[0] * f, hM[1] * s[1] * f, hM[2] * s[2] * f])) : _v3(P.wurzel.p);
        var R = { p: o, q: Qr, f: f, s: s };
        var out = { wurzel: { p: o, q: Qr }, q: {}, fehler: {}, ueber: {} };
        var rz = P.rumpf || {};
        var Qt = _qEuler(rz.x || 0, rz.y || 0, rz.z || 0);
        out.q.torso = Qt;
        var kz = P.kopf || {};
        out.q.head = _qEuler(kz.x || 0, kz.y || 0, kz.z || 0);
        var T0 = J.torso.pos;
        for (var a = 0; a < 2; a++) {
            var sd = a === 0 ? "1" : "-1",
                sv = a === 0 ? 1 : -1;
            var arm = "arm" + sd,
                ell = "elbow" + sd,
                hand = "hand" + sd;
            var S = _add(T0, _qRot(Qt, J[arm].pos));
            var ziel = P.haende && P.haende[hand],
                hRi = ziel && P.handRichtung && P.handRichtung[hand],
                Qh = null;
            if (ziel) {
                var c = _add(J[hand].pos, K.handMitte[hand]),
                    zW = _inWurzel(R, ziel);
                // die Hand mit Richtung (handRichtung {auf, zu}, Welt): ihre Länge (Handgelenk → Hand-Mitte) längs auf, ihre Fläche (die
                // Wölbung der Finger, lokal +z) zu — der Löser führt dann das Handgelenk an den Punkt vor der Mitte
                if (hRi) {
                    Qh = _qBasis(_norm(K.handMitte[hand]), [0, 0, 1], _richtungWurzel(R, hRi.auf), _richtungWurzel(R, hRi.zu));
                    zW = _sub(zW, _qRot(Qh, K.handMitte[hand]));
                    c = J[hand].pos;
                }
                var pol = (P.pol && P.pol[hand]) || [sv * 0.8, -1, -0.4];
                var gl = _glied(S, Qt, J[ell].pos, c, zW, pol, -1, 2.5);
                // DIE WAHL DES ELLBOGENS (ellbogenWahl {pole: {hand: [Pol, …]}, guete(pWelt)}): je Pol der Lauf des Arms, der erste, dessen
                // Ellbogen frei steht (guete ≥ 0), sonst der beste — der Pol allein wird senkrecht zur Linie Schulter → Hand und trug den
                // Ellbogen beim Klettern in die Wand bzw. in den Pfosten
                var EW = P.ellbogenWahl;
                if (EW && EW.pole[hand]) {
                    var beste = null;
                    for (var pk = 0; pk < EW.pole[hand].length; pk++) {
                        var gk = _glied(S, Qt, J[ell].pos, c, zW, EW.pole[hand][pk], -1, 2.5);
                        var welt = function (p) {
                            return _add(R.p, _qRot(R.q, [p[0] * f * s[0], p[1] * f * s[1], p[2] * f * s[2]]));
                        };
                        var eW = _add(S, _qRot(Qt, _qRot(gk.q, J[ell].pos))),
                            wW = _add(eW, _qRot(Qt, _qRot(gk.q, _qRot(_qAchse([1, 0, 0], -gk.phi), J[hand].pos))));
                        var g = EW.guete(welt(S), welt(eW), welt(wW), ziel);
                        if (!beste || g > beste.g) beste = { gl: gk, g: g };
                        if (g >= 0) break;
                    }
                    gl = beste.gl;
                }
                out.q[arm] = gl.q;
                out.q[ell] = _qAchse([1, 0, 0], -gl.phi);
                out.fehler[hand] = gl.fehler * f * s[1];
                out.ueber[hand] = gl.ueber * f * s[1];
            } else {
                var aa = (P.arme && P.arme[arm]) || { x: 0, z: sv * 0.08, ell: 0.15 };
                out.q[arm] = _qEuler(aa.x || 0, 0, aa.z || 0);
                out.q[ell] = _qAchse([1, 0, 0], -(aa.ell || 0));
            }
            out.q[hand] = Qh ? _qMul(_qInv(_qMul(Qt, _qMul(out.q[arm], out.q[ell]))), Qh) : J[hand].quat.slice();
            var hip = "hip" + sd,
                knie = "knee" + sd,
                fuss = "ankle" + sd;
            var fz = P.fuesse && P.fuesse["fuss" + sd];
            if (fz) {
                var nick = fz.nick || 0;
                var Rf = _qAchse([1, 0, 0], nick);
                var ball = [0, -K.fussUnter, K.ballenZ];
                var A = _sub(_inWurzel(R, fz.p), _qRot(Rf, ball));
                var glb = _glied(J[hip].pos, [0, 0, 0, 1], J[knie].pos, J[fuss].pos, A, fz.pol || [0, 0, 1], 1, 2.4);
                // DIE WAHL DES KNIES (knieWahl, wie die des Ellbogens): der erste Pol, dessen Knie frei steht, sonst der beste
                var KW = P.knieWahl;
                if (KW && KW.pole["fuss" + sd]) {
                    var bK = null;
                    for (var kp = 0; kp < KW.pole["fuss" + sd].length; kp++) {
                        var gk2 = _glied(J[hip].pos, [0, 0, 0, 1], J[knie].pos, J[fuss].pos, A, KW.pole["fuss" + sd][kp], 1, 2.4);
                        var weltK = function (p) {
                            return _add(R.p, _qRot(R.q, [p[0] * f * s[0], p[1] * f * s[1], p[2] * f * s[2]]));
                        };
                        var kW = _add(J[hip].pos, _qRot(gk2.q, J[knie].pos)),
                            aW = _add(kW, _qRot(gk2.q, _qRot(_qAchse([1, 0, 0], gk2.phi), J[fuss].pos)));
                        var g2 = KW.guete(weltK(J[hip].pos), weltK(kW), weltK(aW));
                        if (!bK || g2 > bK.g) bK = { gl: gk2, g: g2 };
                        if (g2 >= 0) break;
                    }
                    glb = bK.gl;
                }
                out.q[hip] = glb.q;
                out.q[knie] = _qAchse([1, 0, 0], glb.phi);
                out.q[fuss] = _qMul(_qInv(_qMul(glb.q, out.q[knie])), Rf);
                out.fehler["fuss" + sd] = glb.fehler * f * s[1];
                out.ueber["fuss" + sd] = glb.ueber * f * s[1];
            } else {
                var bb = (P.beine && P.beine[hip]) || { x: 0, z: 0, knie: 0, fuss: 0 };
                out.q[hip] = _qEuler(bb.x || 0, 0, bb.z || 0);
                out.q[knie] = _qAchse([1, 0, 0], bb.knie || 0);
                out.q[fuss] = _qAchse([1, 0, 0], bb.fuss || 0);
            }
        }
        return out;
    }
    // DIE POSE JE VERB UND PHASE — die Ziele des Lösers aus dem Zustand des Verbs (L.leibVerb) und, frei, aus Sprung, Doppel-,
    // Wandsprung und Rutsch (die Luft-Posen des Labors, im Maß der Welt). Liefert die Pose (leibPose) oder null (frei am Boden:
    // die Gang-Pose `leibRigPose` trägt allein). ueber = true: die Pose legt sich ÜBER die Gang-Pose (nur die genannten Gelenke).
    // DIE ARME DES GANGS: die Beugung des Ellbogens (rad) beim Gehen und im Lauf, geblendet über den Tastgrad (der Anteil des Zyklus
    // im Stand: Gehen ~0,6, Laufen ~0,25 — das Gang-Gesetz `gangSchritt`)
    var GANG_ARME = Object.freeze({ ellbogenGehen: 0.3, ellbogenLauf: 1.45, tastGehen: 0.55, tastLauf: 0.32 });
    var VERB_POSE = Object.freeze({
        // die Luft (Sprung): die Beine lesen die Vertikale (fl = vy·luftK), die Arme heben; Doppelsprung-Hocke tuckSec, Wand-Kick kickSec
        luftK: 0.12,
        tuckSec: 0.42,
        tuckHuefte: -1.6,
        tuckKnie: 2.0,
        kickSec: 0.34,
        kickArm: -1.6,
        // das Sitzen: die Hüfte gebeugt, das Knie gebeugt (Schaukel, Wippe), die Rutsche mit gestreckten Beinen
        sitzHuefte: -1.45,
        sitzKnie: 1.45,
        // die Beine auf dem Sitz zwischen den Ketten (die Schaukel: die Oberschenkel lagen 1,2 cm in der Kette) und über dem Hebel der
        // Wippe gespreizt (die Unterschenkel hängen neben dem Hebel, nie in ihm)
        sitzSpreiz: -0.04,
        wippeSpreiz: 0.3,
        // die Knie an Wand und Sprossen öffnen zur Seite (der Pol des Knies seitlich vor dem Leib — nach vorn trug er die Knie in die
        // Wand und durch die Sprossen)
        kletterKnie: 1.2,
        kletterEllbogen: 0.3,
        // die Pole des Ellbogens beim Klettern der Reihe nach (Wurzel-Rahmen der Seite 1: seitlich-hinten, hinten, hinten-oben), der
        // Rand, um den der Ellbogen vor der Fläche und innerhalb ihrer Breite steht
        kletterPole: Object.freeze([Object.freeze([0.7, -0.6, -0.6]), Object.freeze([0.2, -1, -0.2]), Object.freeze([0.7, -0.3, -0.7]), Object.freeze([0.25, -0.2, -1]), Object.freeze([1, 0, -0.2]), Object.freeze([0.3, 0.5, -1])]),
        // der Halbmesser einer Sprosse bzw. Kante für die Freiheit der Glieder (m)
        stangeM: 0.02,
        // die Pole des Knies beim Klettern: ein Kranz von seitlich (90°) über vorn (0°) bis seitlich-hinten (120°), je etwas auf und ab —
        // nach vorn allein trug der Pol das Knie in die Wand
        // (je Winkel w der Pol [sin w, ±0,3, cos w] als Zahl: die Daten rufen beim Laden keine Transzendente — Plattform-Probe v7)
        kniePole: Object.freeze([
            Object.freeze([1, 0.3, 0]),
            Object.freeze([1, -0.3, 0]),
            Object.freeze([0.866, 0.3, 0.5]),
            Object.freeze([0.866, -0.3, 0.5]),
            Object.freeze([0.5, 0.3, 0.866]),
            Object.freeze([0.5, -0.3, 0.866]),
            Object.freeze([0, 0.3, 1]),
            Object.freeze([0, -0.3, 1]),
            Object.freeze([0.866, 0.3, -0.5]),
            Object.freeze([0.866, -0.3, -0.5]),
            Object.freeze([0.966, 0.3, 0.259]),
            Object.freeze([0.966, -0.3, 0.259]),
            Object.freeze([0.707, 0.3, 0.707]),
            Object.freeze([0.707, -0.3, 0.707]),
            Object.freeze([0.259, 0.3, 0.966]),
            Object.freeze([0.259, -0.3, 0.966]),
        ]),
        // die Stange in den Fingern: über der Mitte der Hand (m); der Bogen des Umsetzens steigt bis zu diesem Anteil des Schwungs
        griffVersatz: 0.02,
        bogenHoch: 0.85,
        // wie weit der Bogen von der Fläche abhebt (m): die Hand, der Fuß
        bogenHand: 0.1,
        bogenFuss: 0.1,
        // der Kletternde neigt Becken und Rumpf zur Fläche (die Schulter, aus der die Hand greift, liegt um ihren Sinus näher)
        kletterNick: 0.12,
        kletterRumpf: 0.05,
        rutschHuefte: -1.35,
        rutschKnie: 0.25,
        // das Balancieren: die Arme abgespreizt, die Füße auf der Linie (die Hüfte adduziert um die halbe Hüft-Breite)
        balanceArm: 1.25,
        // die Füße auf der Bahn der Rutsche: der Ballen rutschVor voraus und rutschBallen über dem Blech, die Zehen auf (rutschFuss)
        rutschVor: 0.85,
        rutschBallen: 0.27,
        rutschFuss: -1.25,
        // der Rumpf auf der Rutsche: zurück um rutschLehne und je rad Gefälle um rutschLehneNeig mehr (nie vor über die Beine)
        rutschLehne: -0.1,
        rutschLehneNeig: 0.3,
        // der Griff der Wippe (die Hände je Seite um wippeGriff vom Griff), der Tritt des Kletterns (der Ballen trittH über, trittVor
        // vor dem Anker)
        wippeGriff: 0.12,
        trittH: 0.02,
        trittVor: 0.05,
        // der Fuß auf der Sprosse liegt waagrecht (gegen den Nick der Wurzel 0,12), die Spitze leicht auf — sie ragt über die Sprosse
        // zur Fläche hin, nie in sie
        trittNick: -0.3,
        // das Hängen am Holm: die Knie gebeugt, die Füße zusammen (frei über der Leiter des Zugangs)
        hangKnie: 0.75,
    });
    // DAS SOLL DER BEWEGUNG (die Linse gate:mensch-anatomie misst den EINEN Takt und den EINEN Löser dagegen): je Verb und Phase
    // die Bänder der Gelenk-Winkel in Grad — knie/ellbogen die Beugung (0 = gestreckt), huefte der Oberschenkel gegen den Rumpf
    // in der Sagittal-Ebene (vor +), schulter die Hebung des Oberarms (0 = hängt, 180 = über dem Kopf); das Band gilt beiden Seiten
    // über die ganze Phase, …Max/…Min der Spitze bzw. dem Tiefpunkt der Phase je Seite. Quellen: Gehen Perry & Burnfield 2010 (Knie
    // im Stand ≤ 15°, im Schwung ~60°), Laufen Novacheck 1998 (Knie im Schwung 80–130°), die Arme im Lauf Hinrichs 1990 (Ellbogen
    // ~90°), Sitzen und Hängen die Anatomie der Gelenke (Knie 0–150°, Ellbogen 0–150°, Schulter-Hebung bis 180°). Die Hand liegt
    // höchstens `hand` m am Anker, der Fuß nie in der Substanz des Geräts (`fuss` m: die Tiefe, die Tritt-Fläche trägt ihn), die
    // Tempi im realen Band (m/s; Klettern an Sprosse und Griff 0,3–0,6, Brachiation 0,2–0,6, der Tandem-Gang auf dem Balken
    // ≤ 0,5), die Periode der Schaukel 2π√(L/g) auf `periode` genau. Die Hüfte des Gangs (Gehen, Laufen) steht nicht im Soll: die
    // Stand-IK des Fußes (Lock, Rolle um die Spitze der Sohle, Stamm `_gaitApplyFussIK`) fährt nur die Welt, das Labor zeigt die
    // Pose des Gesetzes ohne sie — die Hüfte ist offen gemessen (Gehen −29…41°, Laufen −52…75°), nie geurteilt.
    var _SITZ_ARME = { ellbogen: [40, 150], schulter: [20, 100] };
    var VERB_SOLL = Object.freeze({
        winkel: Object.freeze({
            "schaukeln:0": Object.assign({ knie: [60, 110], huefte: [60, 110] }, _SITZ_ARME),
            "schaukeln:1": Object.assign({ knie: [0, 45], huefte: [60, 110] }, _SITZ_ARME),
            "schaukeln:2": Object.assign({ knie: [70, 130], huefte: [60, 110] }, _SITZ_ARME),
            "wippen:0": { knie: [40, 120], huefte: [45, 110], ellbogen: [30, 150], schulter: [0, 90] },
            "wippen:1": { knie: [40, 120], huefte: [45, 110], ellbogen: [30, 150], schulter: [0, 90] },
            "wippen:2": { knie: [40, 120], huefte: [45, 110], ellbogen: [30, 150], schulter: [0, 90] },
            "rutschen:0": { knie: [0, 45], huefte: [10, 100], ellbogen: [20, 150], schulter: [0, 100] },
            "rutschen:1": { knie: [0, 70], huefte: [10, 110], ellbogen: [20, 150], schulter: [0, 100] },
            "rutschen:2": { knie: [0, 70], huefte: [40, 115], ellbogen: [20, 150], schulter: [0, 100] },
            "klettern:0": { knie: [0, 130], huefte: [-30, 100], ellbogen: [0, 150], schulter: [20, 180] },
            "klettern:1": { knie: [0, 130], huefte: [-30, 100], ellbogen: [0, 150], schulter: [20, 180] },
            "klettern:2": { knie: [0, 130], huefte: [-30, 100], ellbogen: [0, 150], schulter: [20, 180] },
            "hangeln:0": { knie: [0, 60], huefte: [-20, 45], ellbogen: [0, 90], schulter: [130, 180] },
            "hangeln:1": { knie: [0, 60], huefte: [-20, 45], ellbogen: [0, 90], schulter: [130, 180] },
            "hangeln:2": { knie: [0, 60], huefte: [-20, 45], ellbogen: [0, 90], schulter: [130, 180] },
            "balancieren:1": { knie: [0, 70], huefte: [-25, 40], ellbogen: [0, 45], schulter: [45, 110] },
            "balancieren:2": { knie: [0, 70], huefte: [-25, 40], ellbogen: [0, 45], schulter: [45, 110] },
            "gehen:0": { knie: [0, 70], knieMax: [45, 70], knieMin: [0, 15], ellbogen: [0, 45], schulter: [0, 45] },
            "laufen:0": { knie: [0, 135], knieMax: [80, 135], knieMin: [0, 30], ellbogen: [0, 120], ellbogenMax: [70, 120], schulter: [0, 60] },
            "springen:1": { knie: [0, 90], huefte: [-40, 60] },
            "springen:2": { knie: [0, 90], huefte: [-40, 60] },
            // die Hocke: beide Knie zur Brust
            "doppelsprung:0": { knieMax: [90, 150], huefteMax: [60, 130] },
            // der Abstoß von der Wand: der Arm hebt
            "wandsprung:0": { knie: [0, 120], schulterMax: [60, 180] },
        }),
        hand: 0.03,
        fuss: 0,
        // jedes Glied trifft sein Ziel, so nah es seine Länge erlaubt (m, w21-leib-bau): bis dahin drehte sich das gestreckte Bein der
        // Rutsche nach dem Rest der Rechnung um seine Achse und stand 0,69 m über seiner Reichweite neben dem Ziel (koerper `_glied`)
        glied: 0.001,
        // im Schwung öffnet sich der greifende Arm zum Griff über der Schulter: je Griff einer Hand, die an einen neuen Anker greift
        // (klettern: von ≠ ziel), der Ellbogen an seinem Tiefpunkt im Schwung ≤ griff Grad (bis w4-koerper-park das Minimum der Phase
        // je Seite — es urteilte auch die Hand, die im Paar an ihrem Griff blieb, und hielt nur über die Vereinigung dreier Geräte)
        griff: 80,
        // die Haut des Leibs gegen die Teile des Geräts (m, w4-koerper-park „kein Durchgreifen“): kein Punkt der gegossenen Haut tiefer
        // als `haut` in einem Teil (das Polster der Haut über dem Knochen und das Raster der Probe, 2 cm) — die greifende Hand umschließt
        // ihre Stange (Kette, Sprosse, Holm, Griff), jedes andere Teil auch für sie
        haut: 0.01,
        // die Kapsel des Leibs gegen die Teile eines Geräts (m): der Rest des Kontakt-Lösers zwischen zwei Teilen
        kapsel: 0.02,
        tempo: Object.freeze({ klettern: [0.3, 0.6], hangeln: [0.2, 0.6], hangelnQuer: [0.05, 0.4], balancieren: [0.1, 0.5], gehen: [1.0, 1.6], laufen: [3.0, 8.0], rutscheAusgang: [1.5, 4.0], rutscheMax: [2.0, 4.0], sprungHoehe: [0.25, 0.6] }),
        periode: 0.05,
    });
    // DIE ZEILE DES BEWEGUNGS-TAKTS (der deterministische Zustand des Leibs nach einem Schritt — die Spur der Wiedergabe der Welt
    // `replayRun`, die Spur des Labors, ihr Vergleich Labor = Welt): die Lage über dem Boden, die Fahrt, die Vertikale, Luft, Sprung,
    // Luft-Sprünge, Klettern, Rutsch, Verb und Phase, der Zustand des beobachteten Geräts (θ bzw. φ, ω), die Hüfte des Verbs
    var LEIB_TAKT_NAMEN = Object.freeze(["x", "y", "z", "vx", "vy", "vz", "fieldVy", "luft", "sprung", "luftSpruenge", "kletter", "rutsch", "verb", "phase", "geraet", "geraetW", "huefteX", "huefteY", "huefteZ"]);
    function leibTaktZeile(L, p, boden, ang) {
        var v = L.playerVel,
            V = L.leibVerb,
            z = ang && ang.zustand,
            h = V && V.huefte;
        return [p[0], p[1] - boden, p[2], v.x(), v.y(), v.z(), L._fieldVy, +!!L.isInAir, +!!L.isJumping, L._airJumps | 0, L._parkourKletter, L._parkourSlide ? 1 : 0, V ? V.verb : "", V ? V.phase : -1, z ? z.theta || z.phi || 0 : 0, z ? z.omega || 0 : 0, h ? h[0] : 0, h ? h[1] - boden : 0, h ? h[2] : 0];
    }
    // DIE WINKEL DER POSE (die EINE Messung — das Instrument des Labors, die Linse): aus den Welt-Lagen der Gelenke G (mensch,
    // head, hip±1, knee±1, ankle±1, arm±1, elbow±1, hand±1; jede Einheit) und dem Vorwärts der Wurzel, in Grad wie VERB_SOLL
    function leibPoseWinkel(G, vor) {
        var oben = _norm(_sub(G.head, G.mensch)),
            v = _norm(_sub(vor, _mul(oben, _dot(vor, oben)))),
            o = {};
        var w = function (a, b) {
            return (Math.acos(Math.max(-1, Math.min(1, _dot(_norm(a), _norm(b))))) * 180) / Math.PI;
        };
        [["1", "L"], ["-1", "R"]].forEach(function (s) {
            var ober = _sub(G["knee" + s[0]], G["hip" + s[0]]),
                arm = _sub(G["elbow" + s[0]], G["arm" + s[0]]);
            o["knie" + s[1]] = w(ober, _sub(G["ankle" + s[0]], G["knee" + s[0]]));
            o["ellbogen" + s[1]] = w(arm, _sub(G["hand" + s[0]], G["elbow" + s[0]]));
            o["huefte" + s[1]] = (Math.atan2(_dot(ober, v), -_dot(ober, oben)) * 180) / Math.PI;
            o["schulter" + s[1]] = w(arm, _mul(oben, -1));
        });
        return o;
    }
    // DAS URTEIL GEGEN DAS SOLL (die EINE Prüfung der Bewegung): die Messung m — zeilen {"verb:phase": {w: {knieL: [min, max], …}}} der
    // freien Verben, angebote [{id, name}] (jedes Angebot jedes Geräts im Park), geraete {id: {name, verb, posen, zeilen, hand, handWo,
    // fuss, fussWo, durch, durchWo, glied, gliedWo}} je Angebot, tempo {…}, doppel, wand — gegen VERB_SOLL; je Verstoß ein Satz beim Namen (leer: die
    // Bewegung hält ihr Soll). Jede gemessene Phase trägt ihr Soll, jedes Soll seine Messung (beide Seiten) — die Verben der Geräte
    // (VERB_GESETZ) an JEDEM Gerät, das sie anbietet.
    function leibSollUrteil(m) {
        var S = VERB_SOLL,
            out = [],
            key,
            k;
        var band = function (name, x, b, tol) {
            if (!Number.isFinite(x)) return out.push(name + " nicht messbar");
            if (x < b[0] - tol || x > b[1] + tol) out.push(name + " " + +x.toFixed(3) + " außerhalb [" + b[0] + ", " + b[1] + "]");
        };
        var amGeraet = function (key) {
            return !!VERB_GESETZ[key.split(":")[0]];
        };
        // eine Zeile gegen ihr Soll (wo: das Gerät davor, leer bei den freien Verben)
        var zeile = function (wo, key, z) {
            if (!z) return out.push(wo + key + ": nicht gemessen (Vorbedingung)");
            for (var k2 in S.winkel[key]) {
                var art = /Max$/.test(k2) ? 1 : /Min$/.test(k2) ? 0 : -1,
                    basis = k2.replace(/(Max|Min)$/, ""),
                    b = S.winkel[key][k2];
                ["L", "R"].forEach(function (seite) {
                    var x = z.w[basis + seite];
                    if (!x) return out.push(wo + key + " " + basis + seite + ": nicht messbar");
                    if (art >= 0) band(wo + key + " " + basis + seite + (art ? " Spitze" : " Tiefpunkt"), x[art], b, 0.5);
                    else if (x[0] < b[0] - 0.5 || x[1] > b[1] + 0.5) out.push(wo + key + " " + basis + seite + " " + x[0].toFixed(0) + "…" + x[1].toFixed(0) + "° außerhalb [" + b[0] + ", " + b[1] + "]");
                });
            }
        };
        for (key in m.zeilen) if (!S.winkel[key] || amGeraet(key)) out.push(key + ": gemessen, aber ohne Soll (VERB_SOLL.winkel)");
        for (key in S.winkel) if (!amGeraet(key)) zeile("", key, m.zeilen[key]);
        var ang = m.angebote || [];
        if (!ang.length) out.push("Geräte: der Park nennt kein Angebot (Vorbedingung)");
        for (var a = 0; a < ang.length; a++) if (!m.geraete[ang[a].id]) out.push(ang[a].name + ": nicht gemessen (jedes Angebot jedes Geräts)");
        for (var n in m.geraete) {
            var G = m.geraete[n],
                wo = G.name + " ";
            if (!G.posen) out.push(G.name + ": das Verb begann nicht (Vorbedingung)");
            for (key in G.zeilen) if (!S.winkel[key] || key.split(":")[0] !== G.verb) out.push(wo + key + ": gemessen, aber ohne Soll (VERB_SOLL.winkel)");
            for (key in S.winkel) if (key.split(":")[0] === G.verb) zeile(wo, key, G.zeilen[key]);
            if (G.hand > S.hand) out.push(G.name + ": die Hand " + (G.hand * 100).toFixed(1) + " cm vom Anker (" + G.handWo + ", Soll ≤ " + S.hand * 100 + " cm)");
            if (!Number.isFinite(G.glied)) out.push(G.name + ": das Glied nicht gemessen (Vorbedingung)");
            else if (G.glied > S.glied) out.push(G.name + ": " + G.gliedWo + " " + (G.glied * 100).toFixed(1) + " cm über seiner Reichweite neben dem Ziel (Soll ≤ " + S.glied * 100 + " cm; Täter: _glied)");
            if (G.verb === "klettern") {
                var gr = G.griffe || {},
                    nG = 0,
                    schlimm = null;
                for (k in gr) {
                    nG++;
                    if (!schlimm || gr[k].w > schlimm.w) schlimm = gr[k];
                }
                if (!nG) out.push(G.name + ": keine Hand greift um (Vorbedingung)");
                else if (schlimm.w > S.griff) out.push(G.name + ": die Hand greift gebeugt — Ellbogen " + schlimm.w.toFixed(0) + "° im Schwung (" + schlimm.wo + ", Soll ≤ " + S.griff + "°; " + nG + " Griffe)");
            }
            if (G.fuss > S.fuss + 1e-9) out.push(G.name + ": der Fuß " + (G.fuss * 100).toFixed(1) + " cm im Gerät (" + G.fussWo + ")");
            if (!Number.isFinite(G.durch)) out.push(G.name + ": die Haut nicht gemessen (Vorbedingung)");
            else if (G.durch > S.haut) out.push(G.name + ": die Haut greift " + (G.durch * 100).toFixed(1) + " cm in " + G.durchWo + " (Soll ≤ " + S.haut * 100 + " cm; Täter: leibVerbPose)");
        }
        var T = m.tempo || {};
        for (k in S.tempo) for (var j = 0; j < (T[k] || [NaN]).length; j++) band("Tempo " + k + (T[k] && T[k].length > 1 ? " " + j : ""), (T[k] || [NaN])[j], S.tempo[k], 1e-9);
        var P = T.periode;
        if (!P || !(Math.abs(P[0] / P[1] - 1) <= S.periode)) out.push("Schaukel Periode " + (P ? P[0].toFixed(3) + " s gegen 2π√(L/g) " + P[1].toFixed(3) : "—") + " s (Soll ± " + S.periode * 100 + " %)");
        if (!T.wippe || !(T.wippe[0] >= T.wippe[1] - 1e-6)) out.push("Wippe: der Sitzende kippt den Hebel nicht an den Anschlag (" + (T.wippe ? T.wippe[0].toFixed(3) : "—") + ")");
        // die Kapsel gegen die Geräte (die Sprints der Vorführung gegen Wand, Turm, Bock und Pfosten): nie tiefer als `kapsel`
        for (n in m.kapsel || {}) {
            var C = m.kapsel[n];
            if (!(C.weg >= 2)) out.push("Sprint " + n + ": der Leib kommt nicht ans Gerät (" + C.weg + " m)");
            else if (C.tief > S.kapsel) out.push("Sprint " + n + ": die Kapsel dringt " + (C.tief * 100).toFixed(1) + " cm in " + C.wo + " (Täter: der Kontakt des Wirts)");
        }
        // der Leib der Kamera (K06, fx.bewegung.kamera): nie in einem Teil, nie ein Teil zwischen Ziel und Kamera
        var KM = m.kamera;
        if (!KM || !KM.takte) out.push("Kamera: nicht gemessen (Vorbedingung)");
        else if (KM.fehl) out.push("Kamera: " + KM.fehl + " von " + KM.takte + " Takten im Park — erste " + KM.erste + " (Täter: die Kamera des Wirts)");
        if (!m.doppel) out.push("Doppelsprung: der zweite Druck springt nicht (Vorbedingung)");
        if (!m.wand) out.push("Wandsprung: die frische Wand stößt nicht ab (Vorbedingung)");
        return out;
    }
    function leibVerbPose(K, L, t) {
        var V = L.leibVerb,
            VP = VERB_POSE;
        if (!V || !V.huefte) return null;
        var s1 = _seite1(V.gier),
            haende = {},
            i;
        if (V.verb === "schaukeln") {
            var a = V.ang,
                S = _schaukelGeo(a),
                c = Math.cos(V.theta),
                s = Math.sin(V.theta);
            for (i = 0; i < a.griff.length; i++) {
                var gq = a.griff[i],
                    lot = S.kette - (gq[1] - a.sitz[1]);
                var seit = [gq[0] - a.sitz[0], 0, gq[2] - a.sitz[2]];
                haende[_dot(seit, s1) > 0 ? "hand1" : "hand-1"] = [S.mitte[0] + seit[0] + S.ebene[0] * lot * s, S.mitte[1] - lot * c, S.mitte[2] + seit[2] + S.ebene[2] * lot * s];
            }
            var lehne = V.phase === 1 ? -0.3 : V.phase === 2 ? 0.2 : 0;
            var knie = V.phase === 1 ? 0.35 : V.phase === 2 ? 1.75 : VP.sitzKnie;
            return leibPose(K, {
                wurzel: { huefte: V.huefte, gier: V.gier, nick: -V.theta + lehne },
                rumpf: { x: 0.1 },
                kopf: { x: -lehne * 0.5 },
                haende: haende,
                pol: { hand1: [1, -1, -0.6], "hand-1": [-1, -1, -0.6] },
                beine: { hip1: { x: VP.sitzHuefte, z: VP.sitzSpreiz, knie: knie, fuss: 0.2 }, "hip-1": { x: VP.sitzHuefte, z: -VP.sitzSpreiz, knie: knie, fuss: 0.2 } },
            });
        }
        if (V.verb === "wippen") {
            var w = V.ang,
                W = _wippeGeo(w),
                gw = _wippePunkt(W, w.griff[V.seite], V.phi);
            haende.hand1 = _add(gw, _mul(s1, VP.wippeGriff));
            haende["hand-1"] = _add(gw, _mul(s1, -VP.wippeGriff));
            var kn = V.phase === 0 ? 1.2 : 1.6;
            return leibPose(K, {
                wurzel: { huefte: V.huefte, gier: V.gier, nick: V.nick },
                rumpf: { x: 0.15 - V.nick },
                haende: haende,
                pol: { hand1: [1, -1, -0.5], "hand-1": [-1, -1, -0.5] },
                beine: { hip1: { x: VP.sitzHuefte, z: VP.wippeSpreiz, knie: kn, fuss: 0.1 }, "hip-1": { x: VP.sitzHuefte, z: -VP.wippeSpreiz, knie: kn, fuss: 0.1 } },
            });
        }
        if (V.verb === "rutschen") {
            var d = V.dir,
                neig = Math.asin(Math.max(-1, Math.min(1, -d[1])));
            var hp = _add(V.sitzP, _add(_mul(d, -0.05), [0, V.ang.schieneH, 0]));
            haende.hand1 = _add(hp, _mul(s1, V.ang.schiene));
            haende["hand-1"] = _add(hp, _mul(s1, -V.ang.schiene));
            // die Fersen auf dem Blech, die Zehen auf: der Ballen über dem Punkt der Bahn rutschVor voraus (längs der Bahn, über den
            // Knick in den Auslauf) um rutschBallen auf seiner Normalen
            var Pf = _bahnPunkt(V.ang.bahn, V.s + VP.rutschVor, true),
                df = Pf.dir;
            var hl = Math.hypot(df[0], df[2]) || 1,
                nb = [(-df[1] * df[0]) / hl, hl, (-df[1] * df[2]) / hl];
            var fz = {};
            for (i = 0; i < 2; i++) {
                var sd = i === 0 ? 1 : -1;
                fz["fuss" + (i === 0 ? "1" : "-1")] = { p: _add(Pf.p, _add(_mul(nb, VP.rutschBallen), _mul(s1, sd * 0.11))), nick: VP.rutschFuss, pol: [0, 1, 0.2] };
            }
            // der Rumpf lehnt zurück, je steiler die Bahn, desto mehr (der Schwerpunkt hinter den Fersen), nie über die Beine vor
            return leibPose(K, {
                wurzel: { huefte: V.huefte, gier: V.gier, nick: _rutschBecken(neig) },
                rumpf: { x: -0.1 },
                kopf: { x: 0.25 },
                haende: haende,
                fuesse: fz,
                pol: { hand1: [0.6, 0.2, -1], "hand-1": [-0.6, 0.2, -1] },
            });
        }
        if (V.verb === "klettern") {
            var n = [V.ang.normale[0], 0, V.ang.normale[1]],
                fu = {};
            for (i = 0; i < _GLIEDER.length; i++) {
                var gl = _GLIEDER[i],
                    pz = V.halt[gl];
                // nur das Glied, das an einen neuen Anker umsetzt, schwingt (das andere des Paars hält seinen Griff bzw. Tritt)
                if (V.paar >= 0 && (_PAARE[V.paar][0] === gl || _PAARE[V.paar][1] === gl) && _len(_sub(V.ziel[gl], V.von[gl])) > 1e-6) {
                    // der Bogen hebt das Glied von seinem Anker ab; die Hand steigt auf die Höhe ihres Ziels (bis VP.bogenHoch des Schwungs) und
                    // fährt dann an die Stange, der Fuß steigt gleichmäßig (früh gehoben faltete er das Knie über 130°)
                    var e = Math.min(1, (t - V.seitGlied) / VERB_GESETZ.klettern.schwungSec),
                        ee = 0.5 - 0.5 * Math.cos(Math.PI * e),
                        eh = gl.charAt(0) === "h" ? 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, e / VP.bogenHoch)) : ee,
                        dv = _sub(V.ziel[gl], V.von[gl]);
                    pz = _add(V.von[gl], [dv[0] * ee, dv[1] * eh, dv[2] * ee]);
                    pz = _add(pz, _mul(n, (gl.charAt(0) === "h" ? VP.bogenHand : VP.bogenFuss) * Math.sin(Math.PI * e)));
                }
                // die Stange liegt in den Fingern, griffVersatz über der Mitte der Hand (an der Mitte lag sie 4 cm vor dem Handgelenk, der
                // Unterarm berührte sie)
                if (gl.charAt(0) === "h") haende[gl] = _griffMitte(pz);
                else fu[gl] = { p: _add(pz, _add([0, VP.trittH, 0], _mul(n, VP.trittVor))), nick: VP.trittNick, pol: [gl === "fuss1" ? VP.kletterKnie : -VP.kletterKnie, 0.3, 1] };
            }
            // die Hand am Griff: ihre Länge hinauf, die Fläche zur Wand bzw. zu den Sprossen (sie folgte dem Unterarm und stak 3 cm in
            // der Wand); die Ellbogen hängen nach unten und hinten (nach außen trugen sie den Unterarm in den Pfosten des Turms, nach vorn
            // in das Podest unter der Haltesprosse)
            var hRi = { auf: [0, 1, 0], zu: [-n[0], 0, -n[2]] },
                EP = VP.kletterPole;
            // die Glieder stehen frei (_kletterFrei: Ober- und Unterarm bzw. -schenkel als Kapseln aus der Dicke der gegossenen Haut gegen
            // Wand, Sprossen, Kanten und Breite; das Ende am eigenen Anker — Hand an der Stange, Fuß auf dem Tritt — zählt ab seinem
            // Viertel) — und der Ellbogen nie über seinem Griff (der Unterarm kommt von unten an die Stange)
            var GD = K.mass.glied,
                A = V.ang;
            var armGuete = function (sch, ell, hg, ziel) {
                var g = Math.min(_kletterFrei(A, sch, ell, GD.oberarm), _kletterFrei(A, ell, _mix(hg, ell, 0.25), GD.unterarm));
                return Math.min(g, ziel[1] - ell[1]);
            };
            var beinGuete = function (hu, kn, kn2) {
                return Math.min(_kletterFrei(A, hu, kn, GD.oberschenkel), _kletterFrei(A, kn, _mix(kn, kn2, 0.75), GD.unterschenkel));
            };
            var spiegel = function (q) {
                return [-q[0], q[1], q[2]];
            };
            return leibPose(K, {
                wurzel: { huefte: V.huefte, gier: V.gier, nick: VP.kletterNick },
                rumpf: { x: VP.kletterRumpf },
                kopf: { x: -0.35 },
                haende: haende,
                handRichtung: { hand1: hRi, "hand-1": hRi },
                fuesse: fu,
                pol: { hand1: [VP.kletterEllbogen, -1, -0.5], "hand-1": [-VP.kletterEllbogen, -1, -0.5] },
                ellbogenWahl: { pole: { hand1: EP, "hand-1": EP.map(spiegel) }, guete: armGuete },
                knieWahl: { pole: { fuss1: VP.kniePole, "fuss-1": VP.kniePole.map(spiegel) }, guete: beinGuete },
            });
        }
        if (V.verb === "hangeln") {
            var sw = V.swing ? V.swing.theta : 0;
            return leibPose(K, {
                wurzel: { huefte: V.huefte, gier: V.gier, nick: -sw },
                rumpf: { x: -0.05 },
                kopf: { x: -0.25 },
                haende: { hand1: V.hand.hand1, "hand-1": V.hand["hand-1"] },
                pol: { hand1: [1, 0.2, -0.3], "hand-1": [-1, 0.2, -0.3] },
                beine: { hip1: { x: -0.15 - 0.3 * Math.sin(sw), z: 0.04, knie: VP.hangKnie, fuss: 0.35 }, "hip-1": { x: -0.15 + 0.3 * Math.sin(sw), z: -0.04, knie: VP.hangKnie + 0.1, fuss: 0.35 } },
            });
        }
        return null;
    }
    // DIE ÜBERLAGE der freien Luft und des Balancierens über der Gang-Pose (r: das Rig wie in leibRigPose, absolut gesetzt auf
    // die genannten Gelenke): Sprung (Beine aus der Vertikalen, Arme vor), Doppelsprung-Hocke, Wand-Kick, Rutsch (slidePose),
    // Balance (Arme abgespreizt, die Füße auf der Linie). Liefert die Neigung der Gruppe (rad) oder null.
    function leibLuftPose(r, L, t) {
        var VP = VERB_POSE,
            set = function (b, ax, v) {
                if (b) b.rotation[ax] = v;
            };
        if (L.leibVerb && L.leibVerb.verb === "balancieren") {
            // der Tandem-Gang auf dem Balken: die Füße auf der Linie (die Hüfte adduziert), die Arme abgespreizt, der Fuß FLACH auf
            // dem Holz (kein Abrollen über die Spitze — wer balanciert, setzt die Sohle ganz auf und hebt sie ganz ab)
            var hb = 0.15;
            r.legL.hip.rotation.z += -hb;
            r.legR.hip.rotation.z += hb;
            r.legL.ankle.rotation.x = -(r.legL.hip.rotation.x + r.legL.knee.rotation.x);
            r.legR.ankle.rotation.x = -(r.legR.hip.rotation.x + r.legR.knee.rotation.x);
            r.legL.ankle.rotation.z = hb;
            r.legR.ankle.rotation.z = -hb;
            // abgespreizt heißt nach AUSSEN (links +z, rechts −z, wie MOTION_RIG_MAP und die Schwimm-Pose): bis w28-mensch-samen
            // trug die Zeile das Vorzeichen verkehrt — beide Arme 72° nach innen durch den Rumpf (L0: 294–531 Arm-Ecken in ihm);
            // VERB_SOLL maß den Winkel ohne Vorzeichen und blieb grün
            r.armL.shoulder.rotation.z += VP.balanceArm;
            r.armR.shoulder.rotation.z += -VP.balanceArm;
            return null;
        }
        if (L._parkourSlide) {
            var SP = leibGesetz().slidePose;
            set(r.head, "x", SP.kopf);
            set(r.legL && r.legL.hip, "x", -SP.beinVor);
            set(r.legR && r.legR.hip, "x", -SP.beinVor * 0.85);
            set(r.legL && r.legL.knee, "x", SP.knieKnick);
            set(r.legR && r.legR.knee, "x", SP.knieKnick * 1.3);
            set(r.armL && r.armL.shoulder, "x", SP.armStuetz);
            set(r.armR && r.armR.shoulder, "x", SP.armFrei);
            return SP.lehne;
        }
        if (!L.isInAir || L.leibVerb || L._parkourKletter > 0) return null;
        var vy = L.playerVel.y();
        var fl = Math.max(-0.5, Math.min(0.5, vy * VP.luftK));
        set(r.legL.hip, "x", -0.42 + fl);
        set(r.legL.knee, "x", 0.75 - fl * 0.5);
        set(r.legL.ankle, "x", 0.1);
        set(r.legR.hip, "x", 0.22 - fl);
        set(r.legR.knee, "x", 0.5 + fl * 0.5);
        set(r.legR.ankle, "x", 0);
        set(r.armL.shoulder, "x", -0.55);
        set(r.armR.shoulder, "x", -0.75);
        set(r.armL.elbow, "x", -0.9);
        set(r.armR.elbow, "x", -0.9);
        var tD = t - (L._doppelSprungAt || -Infinity);
        if (tD >= 0 && tD < VP.tuckSec) {
            // DIE HOCKE des Doppelsprungs: beide Knie zur Brust (die Hüften auf tuckHuefte, die Knie auf tuckKnie), nie nur das
            // vordere Bein
            var tk = Math.sin((1 - tD / VP.tuckSec) * Math.PI);
            r.legL.hip.rotation.x += (VP.tuckHuefte - r.legL.hip.rotation.x) * tk;
            r.legR.hip.rotation.x += (VP.tuckHuefte - r.legR.hip.rotation.x) * tk;
            r.legL.knee.rotation.x += (VP.tuckKnie - r.legL.knee.rotation.x) * tk;
            r.legR.knee.rotation.x += (VP.tuckKnie - r.legR.knee.rotation.x) * tk;
            if (r.spine) r.spine.rotation.x += 0.38 * tk;
        }
        var tW = t - (L._wandSprungAt || -Infinity);
        if (tW >= 0 && tW < VP.kickSec) {
            // DER ABSTOSS VON DER WAND: der Rumpf dreht aus, das Bein stößt, BEIDE Arme schwingen hoch (der Schwung der Arme hebt den
            // Leib) — aus der Luft-Pose geblendet, nie gesprungen
            var wk = 1 - tW / VP.kickSec;
            if (r.spine) r.spine.rotation.y += 0.35 * wk;
            r.legR.knee.rotation.x += 0.8 * wk;
            r.legL.hip.rotation.x -= 0.4 * wk;
            r.armL.shoulder.rotation.x += (VP.kickArm - r.armL.shoulder.rotation.x) * wk;
            r.armR.shoulder.rotation.x += (VP.kickArm * 0.85 - r.armR.shoulder.rotation.x) * wk;
        }
        return null;
    }

    // ════════════════════════════════════════════════════════════════════
    // DAS WEICHE GESETZ (physik.K4 · haar.K4) — EIN Löser für Seil, Tuch und Weiches: XPBD (Macklin, Müller, Chentanez 2016,
    //   „XPBD: Position-Based Simulation of Compliant Constrained Dynamics"; die kleinen Schritte nach Macklin et al. 2019,
    //   „Small Steps in Physics Simulation"). Punkt-Massen (inverse Masse w, 0 = geführt), integriert als Verlet-Schritt
    //   x' = x + (x − x_alt)·e^(−d·h) + g·h²; jede Bedingung C(x) mit ihrer Nachgiebigkeit α (m/N, 0 = starr) projiziert
    //   Δλ = (−C − α̃·λ) / (Σw + α̃), α̃ = α / h². Das SEIL ist eine 1D-Kette dieser Bedingungen (der Anker geführt, die Länge
    //   danach hart, `folge`), das TUCH ein 2D-Gitter derselben: Abstand längs jeder Kante, Biegung über jede Kante (der
    //   Abstand der zwei Gegen-Ecken), die Bindung an den Leib (die Lage der Haut-Pose, weich, mit hartem Halter) und die
    //   Kollision mit der Haut (die Haut bleibt innen). Labor und Welt rufen DIESE Funktionen (Gebot 4) — die Schmiede ihr
    //   Seil (`seilSchritt`), Welt und Körper-Studio das Tuch (`tuchTakt`).
    // ════════════════════════════════════════════════════════════════════
    // DER SCHRITT um dt (s) am Zustand z (die Felder unten, `xpbdKette` und `tuchZustand` bauen ihn). Geführte Punkte (w 0)
    // gleiten im Teil-Schritt linear von `zielAlt` nach `ziel`; die Bindung (`zielAlpha` endlich) zieht jeden freien Punkt weich
    // zu seinem Ziel, der Halter (`zielMax`) hält ihn hart in dessen Kugel, die Halb-Ebene (`zielN`, `tiefe`) über ihm.
    // Antwort: true, wenn der Zustand rechnete; false, wenn er ruhte (steht das Ziel und steht jeder Punkt `ruheSchritte`
    // Teil-Schritte lang, ruht er bis zur nächsten Regung — keine Kosten).
    function xpbdSchritt(z, dt, g) {
        var p = z.p,
            q = z.q,
            w = z.w,
            n = z.n,
            ziel = z.ziel,
            za = z.zielAlt,
            dZ = 0,
            i;
        if (z.zielAlle) {
            // das Gitter am Leib: was das Tuch bewegt, ist die BESCHLEUNIGUNG seines Ziels (die Trägheit) — gleitet der Leib
            // gleichmäßig (das Wiegen im Stand, der Atem), trägt das Tuch seine Abweichung starr mit (`_zielRuht`)
            dZ = _zielBeschleunigung(z, dt);
            if (z.ruht) {
                if (dZ < z.ruheA) {
                    _zielWeiter(z, dt);
                    return false;
                }
                // es regt sich: das Tuch steht, wo es ruhte (das Ziel + seine Abweichung), und geht mit dem Ziel
                var kw = Math.max(1, Math.ceil(dt / z.schrittS - 1e-9));
                for (i = 0; i < 3 * n; i++) {
                    p[i] = za[i] + z.abw[i];
                    q[i] = p[i] - (z.dtAlt > 0 ? (z.zielD[i] * dt) / z.dtAlt : 0) / kw;
                }
                z.ruht = false;
                z.still = 0;
            }
        } else {
            for (i = 0; i < 3; i++) {
                var dz = Math.abs(ziel[i] - za[i]); // die Kette: nur der Anker (Punkt 0) ist geführt
                if (dz > dZ) dZ = dz;
            }
            if (z.ruht) {
                if (dZ < z.ruheM) return false;
                z.ruht = false;
                z.still = 0;
            }
        }
        if (!(dt > 0)) return false;
        var gx = g ? g[0] : 0,
            gy = g ? g[1] : 0,
            gz = g ? g[2] : 0;
        var k = Math.min(z.maxSchritte, Math.max(1, Math.ceil(dt / z.schrittS - 1e-9))),
            h = Math.min(dt, z.maxSchritte * z.schrittS) / k,
            keep = Math.exp(-z.daempfungS * h),
            h2 = h * h,
            bewegt = 0,
            pa = z.paare,
            rl = z.laenge,
            al = z.alpha,
            lam = z.lam,
            np = pa.length >> 1,
            zA = z.zielAlpha > 0 && isFinite(z.zielAlpha) ? z.zielAlpha / h2 : -1,
            zM = z.zielMax,
            zN = z.zielN,
            tf = z.tiefe,
            kA = z.kontaktAlt || null,
            gA = z.gAbw || null; // die Schwere je Punkt, über g hinaus (das Tuch: seine Abweichung von der Lotrechten der Ruhe)
        // je Paar seine Nachgiebigkeit im Teil-Schritt (α / h²) und der Kehrwert seines Nenners (w_a + w_b + α / h²; 0: das Paar
        // hängt zwischen zwei geführten Punkten), je Punkt der Anteil der weichen Bindung (w / (w + α_Ziel / h²)) — EINMAL je
        // Aufruf, die Runden teilen nicht mehr (w12-tuch-grob: am Poncho, Gitter-Stufe 0, drei Teil-Schritte je Takt: der Schritt
        // ohne Kollision 10,6 → 7,7 ms)
        var xA = z._xA && z._xA.length >= np ? z._xA : (z._xA = new Float64Array(np)),
            xD = z._xD && z._xD.length >= np ? z._xD : (z._xD = new Float64Array(np)),
            xK = null;
        for (var jx = 0; jx < np; jx++) {
            var wJ = w[pa[2 * jx]] + w[pa[2 * jx + 1]],
                aJ = al[jx] / h2;
            xA[jx] = aJ;
            xD[jx] = wJ === 0 ? 0 : 1 / (wJ + aJ);
        }
        if (z.zielAlle && zA > 0) {
            xK = z._xK && z._xK.length >= n ? z._xK : (z._xK = new Float64Array(n));
            for (i = 0; i < n; i++) xK[i] = w[i] / (w[i] + zA);
        }
        for (var st = 1; st <= k; st++) {
            var t = st / k;
            // Verlet: x' = x + (x − x_alt) · keep + g · h²; geführte Punkte gleiten zum Ziel
            for (i = 0; i < n; i++) {
                var o = 3 * i;
                if (w[i] === 0) {
                    q[o] = p[o];
                    q[o + 1] = p[o + 1];
                    q[o + 2] = p[o + 2];
                    p[o] = za[o] + (ziel[o] - za[o]) * t;
                    p[o + 1] = za[o + 1] + (ziel[o + 1] - za[o + 1]) * t;
                    p[o + 2] = za[o + 2] + (ziel[o + 2] - za[o + 2]) * t;
                    continue;
                }
                var vx = (p[o] - q[o]) * keep,
                    vy = (p[o + 1] - q[o + 1]) * keep,
                    vz = (p[o + 2] - q[o + 2]) * keep;
                q[o] = p[o];
                q[o + 1] = p[o + 1];
                q[o + 2] = p[o + 2];
                p[o] += vx + (gA ? gx + gA[o] : gx) * h2;
                p[o + 1] += vy + (gA ? gy + gA[o + 1] : gy) * h2;
                p[o + 2] += vz + (gA ? gz + gA[o + 2] : gz) * h2;
            }
            for (var j0 = 0; j0 < np; j0++) lam[j0] = 0;
            for (var it = 0; it < z.iter; it++) {
                // der Abstand je Paar: C = |x_b − x_a| − l, die Korrektur nach den inversen Massen
                for (var j = 0; j < np; j++) {
                    var dn = xD[j];
                    if (dn === 0) continue;
                    var ia = pa[2 * j],
                        ib = pa[2 * j + 1],
                        a = 3 * ia,
                        b = 3 * ib,
                        wa = w[ia],
                        wb = w[ib],
                        dx = p[b] - p[a],
                        dy = p[b + 1] - p[a + 1],
                        dzz = p[b + 2] - p[a + 2],
                        d = Math.sqrt(dx * dx + dy * dy + dzz * dzz) || 1e-9,
                        dl = (rl[j] - d - xA[j] * lam[j]) * dn,
                        f = -dl / d;
                    lam[j] += dl;
                    p[a] += dx * f * wa;
                    p[a + 1] += dy * f * wa;
                    p[a + 2] += dzz * f * wa;
                    p[b] -= dx * f * wb;
                    p[b + 1] -= dy * f * wb;
                    p[b + 2] -= dzz * f * wb;
                }
                if (!z.zielAlle) continue;
                // die Bindung an den Leib (weich, der Löser trägt sie ohne λ-Gedächtnis: je Teil-Schritt eine Runde) und der
                // Halter (hart): das Ziel des Teil-Schritts gleitet wie die geführten Punkte
                for (i = 0; i < n; i++) {
                    if (w[i] === 0) continue;
                    var o2 = 3 * i,
                        tx = za[o2] + (ziel[o2] - za[o2]) * t,
                        ty = za[o2 + 1] + (ziel[o2 + 1] - za[o2 + 1]) * t,
                        tz = za[o2 + 2] + (ziel[o2 + 2] - za[o2 + 2]) * t,
                        ex = p[o2] - tx,
                        ey = p[o2 + 1] - ty,
                        ez = p[o2 + 2] - tz,
                        el = Math.sqrt(ex * ex + ey * ey + ez * ez);
                    if (zA > 0 && el > 1e-9) {
                        var kz = xK[i];
                        ex -= ex * kz;
                        ey -= ey * kz;
                        ez -= ez * kz;
                        el *= 1 - kz;
                    }
                    // der Halter und die Halb-Ebene schweigen, wo die Haut das Tuch im letzten Bild schob (`kontaktAlt`): die Haut hat
                    // dort das letzte Wort, die weiche Bindung zieht weiter — ein harter Halter risse es je Teil-Schritt zurück
                    var frei = !(kA && kA[i]);
                    if (frei && zM && el > zM[i]) {
                        var km = zM[i] / el;
                        ex *= km;
                        ey *= km;
                        ez *= km;
                    }
                    // die Halb-Ebene über der Haut-Pose: der Punkt sinkt höchstens `tiefe` unter sein Ziel (längs der Normale)
                    if (frei && zN) {
                        var hn = ex * zN[o2] + ey * zN[o2 + 1] + ez * zN[o2 + 2] + tf[i];
                        if (hn < 0) {
                            ex -= hn * zN[o2];
                            ey -= hn * zN[o2 + 1];
                            ez -= hn * zN[o2 + 2];
                        }
                    }
                    p[o2] = tx + ex;
                    p[o2 + 1] = ty + ey;
                    p[o2 + 2] = tz + ez;
                }
            }
            // die Kette: die Länge HART (Müller et al. 2012, „Fast Simulation of Inextensible Hair and Fur", follow the leader) —
            // nach den Runden trägt jedes Glied vom Anker aus genau seine Teilung, das Seil dehnt sich nie, es biegt nur
            if (z.folge)
                for (var jf = 0; jf < np; jf++) {
                    var fa = 3 * pa[2 * jf],
                        fb = 3 * pa[2 * jf + 1],
                        fx = p[fb] - p[fa],
                        fy = p[fb + 1] - p[fa + 1],
                        fz = p[fb + 2] - p[fa + 2],
                        fl = Math.sqrt(fx * fx + fy * fy + fz * fz) || 1e-9,
                        fk = rl[jf] / fl;
                    p[fb] = p[fa] + fx * fk;
                    p[fb + 1] = p[fa + 1] + fy * fk;
                    p[fb + 2] = p[fa + 2] + fz * fk;
                }
            // die Kollision mit dem Leib (zuletzt — sie gewinnt; im letzten Teil-Schritt, wo der Leib steht): der Zustand trägt sie
            if (z.kollision && st === k) z.kollision(z);
            var mx = 0;
            for (var m = z.zielAlle ? 0 : 3; m < 3 * n; m++) {
                var dm = Math.abs(p[m] - q[m]);
                if (dm > mx) mx = dm;
            }
            if (mx > bewegt) bewegt = mx;
        }
        if (z.zielAlle) {
            // die Ruhe des Gitters: die Abweichung vom Ziel steht (das Tuch schwingt nicht mehr: ihre mittlere Änderung je Bild
            // unter ruheM, gemessen an den Punkten ohne Haut — in einer Falte kippt die nächste Haut-Ecke, ruht das Tuch, steht
            // auch sie) und das Ziel beschleunigt nicht
            var dv = 0,
                nf = 0,
                kn = z.kontakt;
            for (i = 0; i < n; i++) {
                var o3 = 3 * i,
                    ax = p[o3] - ziel[o3],
                    ay = p[o3 + 1] - ziel[o3 + 1],
                    az = p[o3 + 2] - ziel[o3 + 2];
                if (!(kn && kn[i]) && !(kA && kA[i])) {
                    dv += Math.abs(ax - z.abw[o3]) + Math.abs(ay - z.abw[o3 + 1]) + Math.abs(az - z.abw[o3 + 2]);
                    nf++;
                }
                z.abw[o3] = ax;
                z.abw[o3 + 1] = ay;
                z.abw[o3 + 2] = az;
            }
            _zielWeiter(z, dt);
            z.regung = dv / Math.max(1, nf);
            z.beschl = dZ;
            if (z.regung < z.ruheM && dZ < z.ruheA) z.still += k;
            else z.still = 0;
        } else {
            for (i = 0; i < 3 * n; i++) za[i] = ziel[i];
            if (bewegt < z.ruheM && dZ < z.ruheM * k) z.still += k;
            else z.still = 0;
        }
        if (z.still >= z.ruheSchritte) z.ruht = true;
        return true;
    }
    // Die Beschleunigung des Ziels (m/s²) über den Takt dt: die größte Änderung seines Tempos gegen das des letzten Takts
    // (|Δziel/dt − Δziel_alt/dt_alt| / dt) — in Sekunden, nie je Bild: der Wirt rechnet sein Tuch höchstens im Takt taktS, das Labor
    // je Bild, und beide ruhen bei derselben Regung
    function _zielBeschleunigung(z, dt) {
        if (!(dt > 0)) return 0;
        var ziel = z.ziel,
            za = z.zielAlt,
            D = z.zielD,
            vA = z.dtAlt > 0 ? 1 / z.dtAlt : 0,
            a = 0;
        for (var i = 0; i < ziel.length; i++) {
            var e = Math.abs((ziel[i] - za[i]) / dt - D[i] * vA);
            if (e > a) a = e;
        }
        return a / dt;
    }
    // Das Ziel geht weiter: sein Schritt dieses Takts (dt) wird der alte, seine Lage die alte
    function _zielWeiter(z, dt) {
        var ziel = z.ziel,
            za = z.zielAlt,
            D = z.zielD;
        for (var i = 0; i < ziel.length; i++) {
            D[i] = ziel[i] - za[i];
            za[i] = ziel[i];
        }
        z.dtAlt = dt > 0 ? dt : 0;
    }
    // DIE KETTE (das Seil, 1D): Punkte p (flach [x,y,z,…], Punkt 0 der Anker, geführt), je Glied j die Länge l[j] zwischen j und
    // j+1, die inversen Massen w (w[0] = 0); starr (α 0), `iter` Runden je Teil-Schritt, die Länge danach hart. `g` = die
    // Gangart { schrittS, iter, daempfungS, ruheM, ruheSchritte, maxSchritte }.
    function xpbdKette(p, l, w, g) {
        var N = p.length / 3,
            paare = new Int32Array(2 * (N - 1));
        for (var j = 0; j < N - 1; j++) {
            paare[2 * j] = j;
            paare[2 * j + 1] = j + 1;
        }
        var P = new Float64Array(p);
        return {
            art: "kette",
            n: N,
            p: P,
            q: new Float64Array(P),
            w: Float64Array.from(w),
            paare: paare,
            laenge: Float64Array.from(l),
            alpha: new Float64Array(N - 1),
            lam: new Float64Array(N - 1),
            ziel: new Float64Array(P),
            zielAlt: new Float64Array(P),
            zielAlle: false,
            zielAlpha: 0,
            zielMax: null,
            zielN: null,
            tiefe: null,
            kollision: null,
            folge: true,
            schrittS: g.schrittS,
            iter: g.iter,
            daempfungS: g.daempfungS,
            maxSchritte: g.maxSchritte,
            ruheM: g.ruheM,
            ruheSchritte: g.ruheSchritte,
            ruht: false,
            still: 0,
        };
    }

    // DAS TUCH AM LEIB (haar.K4) — die Gangart des Gitters und die Bindung an den Leib. Das Tuch hängt in der Ruhe-Pose des
    // Ofens schon unter der Schwere (die Drapierung ist seine Gestalt): der Löser trägt die ABWEICHUNG davon — der Leib
    // beschleunigt, das Tuch bleibt zurück, schwingt nach und kehrt in seine Lage zurück (die weiche Bindung, Eigenfrequenz
    // `hz`), nie weiter als `freiM` (der Halter), nie tiefer als `tiefeM` unter seine Haut-Pose; die Haut bleibt innen (jede
    // Tuch-Ecke liegt mindestens `luftM` über der nächsten Haut-Ecke, längs deren Normale, im Radius `hautM`). Die Webung der
    // Kleid-Zeile wählt die Art: Wolle (der weite Poncho) fällt frei, Denim sitzt eng.
    var TUCH_GESETZ = Object.freeze({
        schrittS: 1 / 60, // der Teil-Schritt (Small Steps: je Bild der Welt EIN Schritt mit EINER Runde)
        iter: 1,
        maxSchritte: 6, // je Aufruf höchstens (nach einer Pause springt der Leib, das Tuch schießt nicht)
        daempfungS: 2.5, // 1/s — die Luft und die Reibung des Gewebes
        dichteKgM2: 0.3, // die Flächen-Masse des Gewebes
        dehnAlpha: 1e-8, // m/N — die Kante dehnt sich kaum
        biegeAlpha: 0.02, // m/N — die Biegung gibt nach
        luftM: 0.003, // der Abstand über der nächsten Haut-Ecke (die Linse urteilt bei −2 mm)
        hautM: 0.035, // der Radius der Haut-Suche
        bandM: 0.002, // das Band um die nächste Haut-Ecke, in dem jede ihre Halb-Ebene hält (Gleichstände der zwei Stufen)
        tiefeM: 0.004,
        ruheM: 2e-3, // m je Schritt: so wenig ändert sich die Abweichung eines ruhenden Tuchs von seinem Ziel (im Mittel der freien
        // Punkte; gemessen im Stand 0,8 mm — das Zittern der Falten —, ein schwingendes Tuch nach dem Gang zentimeterweit)
        ruheA: 0.4, // m/s²: so wenig beschleunigt das Ziel eines ruhenden Tuchs (der Stand der Welt mit Atem und Wiegen 0,24–0,27, der Gang
        // ≥ 0,7; bis w6-weiches 1e-4 m je Bild² — am 30-Hz-Takt der Welt 0,09 m/s²: der stehende Bewohner schlief nie)
        ruheSchritte: 30,
        nahM: 14, // nur so nahe Leiber rechnen ihr Tuch (vom Auge, m) — ferner ruht es in der Pose
        px: 1, // und nur, wo sein Schwung (webe._.freiM) am Schirm so viele Bildpunkte deckt (der Wirt: pxJeM · freiM / px)
        taktS: 1 / 30, // so oft rechnet ein Tuch höchstens (Spielzeit; dazwischen trägt es seine Abweichung starr mit der Haut)
        leiber: 2, // höchstens so viele (die dem Auge nächsten sichtbaren): die Kosten gehören dem Schirm, nie der Zahl der Leiber
        raffer: 2, // läuft die Spielzeit eines Leibs schneller als so oft die Echtzeit (der Zeitraffer, Takte ohne Bild), ruht sein Tuch
        sprungS: 0.25, // ein Takt nach mehr Spielzeit ist ein Sprung (Pause, Teleport): das Tuch steht in der Haut-Pose
        // die Stufen des Gitters (w11-koerper): je Stufe die Zelle (m; 0 = jede Ecke der Grobstufe), gewählt am Schirm — die
        // gröbste, deren Zelle höchstens gitterPx Bildpunkte deckt (± gitterHyst)
        gitterM: Object.freeze([0, 0.05, 0.1]),
        gitterPx: 12,
        gitterHyst: 0.15,
        nahHautM: 0.05, // so weit über hautM hinaus liegt die Haut, die ein Folger prüft und der Takt rechnet (in der Ruhe)
        webe: {
            wool: { hz: 2.2, freiM: 0.045 },
            knit: { hz: 3.0, freiM: 0.03 },
            cotton: { hz: 3.5, freiM: 0.022 },
            denim: { hz: 5.0, freiM: 0.012 },
            _: { hz: 3.5, freiM: 0.02 },
        },
    });
    // Die Blend-Matrix eines Punkts (die Haut-Gewichte über die Knochen, 3×4 spaltenweise in M ab o): Σ w_k · B_k
    function _tuchBlend(B, bi, bw, i, M, o) {
        for (var e = 0; e < 12; e++) M[o + e] = 0;
        for (var k = 0; k < 4; k++) {
            var wk = bw[4 * i + k];
            if (!wk) continue;
            var c = 16 * bi[4 * i + k];
            M[o] += wk * B[c];
            M[o + 1] += wk * B[c + 1];
            M[o + 2] += wk * B[c + 2];
            M[o + 3] += wk * B[c + 4];
            M[o + 4] += wk * B[c + 5];
            M[o + 5] += wk * B[c + 6];
            M[o + 6] += wk * B[c + 8];
            M[o + 7] += wk * B[c + 9];
            M[o + 8] += wk * B[c + 10];
            M[o + 9] += wk * B[c + 12];
            M[o + 10] += wk * B[c + 13];
            M[o + 11] += wk * B[c + 14];
        }
    }
    // Die Knochen eines Skeletts (die Welt-Matrix × die Bindungs-Inverse, three `Skeleton.update` ohne Puffer) — flach, 16 je Knochen
    function _tuchKnochen(sk, out) {
        var bones = sk.bones,
            inv = sk.boneInverses;
        for (var b = 0; b < bones.length; b++) {
            var a = bones[b].matrixWorld.elements,
                c = inv[b].elements,
                o = 16 * b;
            for (var col = 0; col < 4; col++)
                for (var row = 0; row < 4; row++)
                    out[o + 4 * col + row] =
                        a[row] * c[4 * col] + a[4 + row] * c[4 * col + 1] + a[8 + row] * c[4 * col + 2] + a[12 + row] * c[4 * col + 3];
        }
        return out;
    }
    function _m3inv(m, o, out) {
        var a = m[o], b = m[o + 3], c = m[o + 6], d = m[o + 1], e = m[o + 4], f = m[o + 7], g = m[o + 2], h = m[o + 5], k = m[o + 8];
        var A = e * k - f * h, B = -(d * k - f * g), C = d * h - e * g, det = a * A + b * B + c * C;
        if (!det) det = 1e-12;
        var r = 1 / det;
        // out zeilenweise (die Inverse, angewandt als out · v)
        out[0] = A * r; out[1] = -(b * k - c * h) * r; out[2] = (b * f - c * e) * r;
        out[3] = B * r; out[4] = (a * k - c * g) * r; out[5] = -(a * f - c * d) * r;
        out[6] = C * r; out[7] = -(a * h - b * g) * r; out[8] = (a * e - b * d) * r;
        return out;
    }
    // Die Haut-Gewichte als Zahlen (three trägt sie normiert als Uint16/Uint8 oder als Float32)
    function _tuchGewichte(a) {
        var arr = a.array;
        if (!a.normalized || arr instanceof Float32Array || arr instanceof Float64Array) return Float32Array.from(arr);
        var mx = arr instanceof Uint8Array ? 255 : arr instanceof Uint16Array ? 65535 : 4294967295,
            o = new Float32Array(arr.length);
        for (var i = 0; i < arr.length; i++) o[i] = arr[i] / mx;
        return o;
    }
    // Die Bindungs-Matrix eines Meshes (three `bindMatrix`) auf eine Ruhe-Lage: v' = bM · v (der Raum der Knochen-Inversen)
    function _tuchBind(mesh, pos, n, nrm) {
        var e = mesh.bindMatrix.elements,
            r = new Float64Array(3 * n),
            nn = nrm ? new Float64Array(3 * n) : null;
        for (var i = 0; i < n; i++) {
            var x = pos[3 * i], y = pos[3 * i + 1], z = pos[3 * i + 2];
            r[3 * i] = e[0] * x + e[4] * y + e[8] * z + e[12];
            r[3 * i + 1] = e[1] * x + e[5] * y + e[9] * z + e[13];
            r[3 * i + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
            if (nn) {
                var a = nrm[3 * i], b = nrm[3 * i + 1], c = nrm[3 * i + 2];
                var u = e[0] * a + e[4] * b + e[8] * c, v = e[1] * a + e[5] * b + e[9] * c, ww = e[2] * a + e[6] * b + e[10] * c, l = Math.hypot(u, v, ww) || 1;
                nn[3 * i] = u / l; nn[3 * i + 1] = v / l; nn[3 * i + 2] = ww / l;
            }
        }
        var bm = [e[0], e[1], e[2], e[4], e[5], e[6], e[8], e[9], e[10]];
        return { r: r, n: nn, inv: _m3inv(bm, 0, new Float64Array(9)) };
    }
    // DAS GITTER DES TUCHS (die Gestalt, je Vorlage EINMAL — die Leiber derselben Tracht teilen es, Lehre 14): `sim` die
    // Tuch-Meshes der Stufe, die das Bild trägt (die feine: ihre Ecken tragen das Gitter des Lösers), `folge` die Tuch-Meshes der
    // anderen Stufe (die grobe, die nah nur ihren Schatten wirft: jede Ecke trägt die Abweichung ihrer drei nächsten Punkte des
    // nächsten Kleids, in der Ruhe gewogen 1/d², ohne eigene Kollision), `haut` die Haut-Meshes der Stufe des Bilds (die
    // Kollision: das Tuch liegt über der Haut, mit der es gezeichnet wird), `webe` je sim-Mesh die Webung seiner Kleid-Zeile. Gelesen werden nur Felder der
    // three-SkinnedMeshes (Geometrie-Puffer, bindMatrix) — der Kern bleibt three-frei. Je Kante eine Abstands-Bedingung, je Kante
    // zwischen zwei Dreiecken eine Biege-Bedingung (der Abstand der Gegen-Ecken), die Masse je Ecke ein Drittel ihrer Dreiecke ×
    // die Flächen-Masse.
    // DIE STUFEN DES GITTERS (w11-koerper, Gebot 7 — die Kosten gehören dem Schirm): je Zelle `gitterM` eine Stufe; Stufe 0 ist
    // jede Ecke der Grobstufe (3 029 Punkte am Start-Leib), jede weitere fasst die Ecken einer Zelle zu EINEM Punkt (der Ecke an
    // ihrer Mitte: ihre Haut-Gewichte, ihre Lage) mit der Masse der Zelle; Kanten zwischen Zellen, deren Ecken eine Kante teilen,
    // die Biegung zwischen den Nachbarn, die einander über den Punkt gegenüberliegen. Jede Ecke, die kein Punkt ist (sim und
    // folge), folgt den drei nächsten Punkten. DIE NÄHE DER HAUT: ein Folger prüft die Haut nur, wo sie ihm in der Ruhe näher als
    // `hautM + nahHautM` liegt — und der Takt rechnet nur die Haut-Ecken, die so einer Tuch-Ecke nahe liegen (die Haut unter dem
    // Ärmel, am Kragen, am Bund; nie die Hand). Bis w11-koerper trug das grobe Tuch das Gitter (3 029 Punkte, wie klein der Leib
    // am Schirm auch stand), es prüfte die Haut beider Stufen, und jede der 8 192 Ecken des feinen prüfte sie je Takt als Folger.
    function tuchGitter(sim, folge, haut, webe) {
        var G = TUCH_GESETZ,
            mE = leibMassstab(),
            teile = [],
            n = 0,
            i;
        sim.forEach(function (m, si) {
            var ga = m.geometry.attributes,
                k = ga.position.count,
                bnd = _tuchBind(m, ga.position.array, k, ga.normal ? ga.normal.array : null),
                art = G.webe[(webe && webe[si]) || "_"] || G.webe._;
            teile.push({ n: k, off: n, ruhe: Float32Array.from(ga.position.array), r: bnd.r, nrm: bnd.n, bInv: bnd.inv, bi: ga.skinIndex.array, bw: _tuchGewichte(ga.skinWeight), art: art, idx: m.geometry.index ? m.geometry.index.array : null });
            n += k;
        });
        var masse = new Float64Array(n),
            teilVon = new Int32Array(n),
            P0 = new Float64Array(3 * n);
        teile.forEach(function (T, ti) {
            var fl = new Float64Array(T.n),
                kanten = new Map(),
                idx = T.idx;
            for (i = 0; i < 3 * T.n; i++) P0[3 * T.off + i] = T.r[i];
            if (idx)
                for (var t = 0; t + 2 < idx.length; t += 3) {
                    var A = idx[t], B = idx[t + 1], C = idx[t + 2],
                        ux = T.r[3 * B] - T.r[3 * A], uy = T.r[3 * B + 1] - T.r[3 * A + 1], uz = T.r[3 * B + 2] - T.r[3 * A + 2],
                        vx = T.r[3 * C] - T.r[3 * A], vy = T.r[3 * C + 1] - T.r[3 * A + 1], vz = T.r[3 * C + 2] - T.r[3 * A + 2],
                        ar = 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
                    fl[A] += ar / 3;
                    fl[B] += ar / 3;
                    fl[C] += ar / 3;
                    for (var e = 0; e < 3; e++) {
                        var a = idx[t + e], b = idx[t + ((e + 1) % 3)], c = idx[t + ((e + 2) % 3)],
                            key = a < b ? a * T.n + b : b * T.n + a,
                            kk = kanten.get(key);
                        if (!kk) kanten.set(key, [a < b ? a : b, a < b ? b : a, c]);
                        else if (kk.length === 3) kk.push(c);
                    }
                }
            T.kanten = [];
            kanten.forEach(function (kk) {
                T.kanten.push(kk);
            });
            for (i = 0; i < T.n; i++) {
                masse[T.off + i] = Math.max(1e-6, fl[i] * G.dichteKgM2);
                teilVon[T.off + i] = ti;
            }
        });
        // die Folge-Meshes: je Mesh das nächste sim-Kleid (in der Ruhe, im Raum der Bindung)
        var folgeT = folge.map(function (m) {
            var ga = m.geometry.attributes,
                k = ga.position.count,
                bnd = _tuchBind(m, ga.position.array, k, null),
                besten = 0,
                bd = Infinity;
            teile.forEach(function (T, ti) {
                var s = 0, c = 0;
                for (var v = 0; v < k; v += Math.max(1, (k / 40) | 0)) {
                    var md = Infinity;
                    for (var u = 0; u < T.n; u += 3) md = Math.min(md, Math.hypot(T.r[3 * u] - bnd.r[3 * v], T.r[3 * u + 1] - bnd.r[3 * v + 1], T.r[3 * u + 2] - bnd.r[3 * v + 2]));
                    s += md;
                    c++;
                }
                if (s / c < bd) {
                    bd = s / c;
                    besten = ti;
                }
            });
            return { n: k, ruhe: Float32Array.from(ga.position.array), r: bnd.r, bInv: bnd.inv, bi: ga.skinIndex.array, bw: _tuchGewichte(ga.skinWeight), teil: besten };
        });
        // die Haut in der Ruhe, und die Nähe: je Haut-Ecke, ob eine Tuch-Ecke (beider Stufen) näher liegt als die Reichweite —
        // nur sie rechnet der Takt; je Tuch-Ecke, ob eine Haut-Ecke so nahe liegt — nur sie prüft die Haut als Folger
        var reich = (G.hautM + G.nahHautM) / mE,
            hautT = haut.map(function (m) {
                var ga = m.geometry.attributes,
                    k = ga.position.count,
                    bnd = _tuchBind(m, ga.position.array, k, ga.normal.array);
                return { n: k, r: bnd.r, nrm: bnd.n, bi: ga.skinIndex.array, bw: _tuchGewichte(ga.skinWeight) };
            });
        var hautFach = _tuchFach(reich),
            tuchFach = _tuchFach(reich);
        hautT.forEach(function (H) {
            for (var v = 0; v < H.n; v++) hautFach.rein(H.r, v);
        });
        teile.forEach(function (T) {
            for (var v = 0; v < T.n; v++) tuchFach.rein(T.r, v);
        });
        var nh = 0;
        hautT.forEach(function (H) {
            var L = [];
            for (var v = 0; v < H.n; v++) if (tuchFach.nahe(H.r[3 * v], H.r[3 * v + 1], H.r[3 * v + 2])) L.push(v);
            H.nah = Int32Array.from(L);
            nh += L.length;
        });
        var naheHaut = function (r, k) {
            var o = new Uint8Array(k);
            for (var v = 0; v < k; v++) o[v] = hautFach.nahe(r[3 * v], r[3 * v + 1], r[3 * v + 2]) ? 1 : 0;
            return o;
        };
        teile.forEach(function (T) {
            T.nahe = naheHaut(T.r, T.n);
        });
        folgeT.forEach(function (F) {
            F.nahe = new Uint8Array(F.n); // die andere Stufe folgt ohne Kollision (sie trägt das Bild nicht, nur ihren Wurf)
        });
        var Q = { n: n, nh: nh, teile: teile, folge: folgeT, haut: hautT, teilVon: teilVon };
        Q.stufen = G.gitterM.map(function (zm) {
            return _tuchGitterStufe(Q, P0, masse, zm / mE);
        });
        return Q;
    }
    // Ein Fach-Gitter über Lagen (Kante `zelle`): `rein(r, v)` legt die Lage v des flachen Felds r hinein, `nahe(x, y, z)`
    // fragt, ob eine eingelegte Lage näher als `zelle` liegt
    function _tuchFach(zelle) {
        var F = new Map(),
            ic = 1 / zelle,
            k = function (a, b, c) {
                return (a + 4096) * 67108864 + (b + 4096) * 8192 + (c + 4096);
            };
        return {
            rein: function (r, v) {
                var key = k(Math.floor(r[3 * v] * ic), Math.floor(r[3 * v + 1] * ic), Math.floor(r[3 * v + 2] * ic)),
                    L = F.get(key);
                if (!L) F.set(key, (L = []));
                L.push(r[3 * v], r[3 * v + 1], r[3 * v + 2]);
            },
            nahe: function (x, y, z) {
                var cx = Math.floor(x * ic), cy = Math.floor(y * ic), cz = Math.floor(z * ic), z2 = zelle * zelle;
                for (var dx = -1; dx <= 1; dx++)
                    for (var dy = -1; dy <= 1; dy++)
                        for (var dz = -1; dz <= 1; dz++) {
                            var L = F.get(k(cx + dx, cy + dy, cz + dz));
                            if (!L) continue;
                            for (var j = 0; j < L.length; j += 3) {
                                var ax = L[j] - x, ay = L[j + 1] - y, az = L[j + 2] - z;
                                if (ax * ax + ay * ay + az * az < z2) return true;
                            }
                        }
                return false;
            },
        };
    }
    // EINE STUFE DES GITTERS (Zelle `zE` in Einheiten der Bindung; 0: jede Ecke ein Punkt): die Punkte (`idx`: ihre Ecke der
    // Grobstufe), Massen, Kanten, Biegung, die Bindung (α = 1 / (m · ω²), die Eigenfrequenz der Art für die mittlere Masse), der
    // Halter, und je Mesh die Folger (null: das sim-Mesh der Stufe 0 — seine Ecken sind die Punkte)
    function _tuchGitterStufe(Q, P0, masse, zE) {
        var G = TUCH_GESETZ,
            teile = Q.teile,
            n = Q.n,
            cl = new Int32Array(n),
            idx = [],
            mS = [],
            i,
            j;
        if (!(zE > 0)) {
            for (i = 0; i < n; i++) {
                cl[i] = i;
                idx.push(i);
                mS.push(masse[i]);
            }
        } else
            teile.forEach(function (T) {
                var zellen = new Map(),
                    ic = 1 / zE;
                for (var v = 0; v < T.n; v++) {
                    var key = Math.floor(T.r[3 * v] * ic) + "," + Math.floor(T.r[3 * v + 1] * ic) + "," + Math.floor(T.r[3 * v + 2] * ic),
                        L = zellen.get(key);
                    if (!L) zellen.set(key, (L = []));
                    L.push(v);
                }
                zellen.forEach(function (L) {
                    var cx = 0, cy = 0, cz = 0, m = 0, best = L[0], bd = Infinity, k;
                    for (k = 0; k < L.length; k++) {
                        cx += T.r[3 * L[k]] / L.length;
                        cy += T.r[3 * L[k] + 1] / L.length;
                        cz += T.r[3 * L[k] + 2] / L.length;
                        m += masse[T.off + L[k]];
                    }
                    for (k = 0; k < L.length; k++) {
                        var d = Math.hypot(T.r[3 * L[k]] - cx, T.r[3 * L[k] + 1] - cy, T.r[3 * L[k] + 2] - cz);
                        if (d < bd) {
                            bd = d;
                            best = L[k];
                        }
                    }
                    for (k = 0; k < L.length; k++) cl[T.off + L[k]] = idx.length;
                    idx.push(T.off + best);
                    mS.push(m);
                });
            });
        var np = idx.length,
            w = new Float64Array(np),
            zMax = new Float64Array(np),
            ruheP = new Float64Array(3 * np),
            hzS = 0,
            mM = 0;
        for (j = 0; j < np; j++) {
            var g = idx[j],
                Tg = teile[Q.teilVon[g]],
                art = Tg.art;
            w[j] = 1 / mS[j];
            zMax[j] = art.freiM;
            hzS += art.hz;
            mM += mS[j] / np;
            ruheP[3 * j] = P0[3 * g];
            ruheP[3 * j + 1] = P0[3 * g + 1];
            ruheP[3 * j + 2] = P0[3 * g + 2];
        }
        // die Kanten: zwischen den Punkten zweier Ecken, die eine Kante teilen; die Biegung: Stufe 0 die Gegen-Ecken zweier
        // Dreiecke, gröber die Nachbarn eines Punkts, die einander über ihn gegenüberliegen (cos < −0,7)
        var paare = [],
            alpha = [],
            gesehen = new Set(),
            nachbarn = [];
        for (j = 0; j < np; j++) nachbarn.push([]);
        var paar = function (a, b, al) {
            if (a === b) return false;
            var key = a < b ? a * np + b : b * np + a;
            if (gesehen.has(key)) return false;
            gesehen.add(key);
            paare.push(a, b);
            alpha.push(al);
            return true;
        };
        teile.forEach(function (T) {
            T.kanten.forEach(function (kk) {
                var a = cl[T.off + kk[0]],
                    b = cl[T.off + kk[1]];
                if (paar(a, b, G.dehnAlpha)) {
                    nachbarn[a].push(b);
                    nachbarn[b].push(a);
                }
                if (!(zE > 0) && kk.length === 4) paar(cl[T.off + kk[2]], cl[T.off + kk[3]], G.biegeAlpha);
            });
        });
        if (zE > 0)
            for (j = 0; j < np; j++) {
                var N = nachbarn[j];
                for (var a2 = 0; a2 < N.length; a2++) {
                    var ax = ruheP[3 * N[a2]] - ruheP[3 * j], ay = ruheP[3 * N[a2] + 1] - ruheP[3 * j + 1], az = ruheP[3 * N[a2] + 2] - ruheP[3 * j + 2],
                        al = Math.hypot(ax, ay, az) || 1,
                        gb = -1,
                        gc = -0.7;
                    for (var b2 = 0; b2 < N.length; b2++) {
                        if (b2 === a2) continue;
                        var bx = ruheP[3 * N[b2]] - ruheP[3 * j], by = ruheP[3 * N[b2] + 1] - ruheP[3 * j + 1], bz = ruheP[3 * N[b2] + 2] - ruheP[3 * j + 2],
                            c = (ax * bx + ay * by + az * bz) / (al * (Math.hypot(bx, by, bz) || 1));
                        if (c < gc) {
                            gc = c;
                            gb = N[b2];
                        }
                    }
                    if (gb >= 0) paar(N[a2], gb, G.biegeAlpha);
                }
            }
        var om = 2 * Math.PI * (hzS / Math.max(1, np));
        // die Folger: je Ecke die drei nächsten Punkte (sim: des eigenen Kleids, folge: des nächsten), in der Ruhe gewogen 1/d²
        var punkteVon = teile.map(function () {
            return [];
        });
        for (j = 0; j < np; j++) punkteVon[Q.teilVon[idx[j]]].push(j);
        var folger = function (r, k, ti) {
            var L = punkteVon[ti],
                Z = Math.max(0.04, zE),
                fach = new Map(),
                zk = function (a, b, c) {
                    return (a + 4096) * 67108864 + (b + 4096) * 8192 + (c + 4096);
                };
            L.forEach(function (pj) {
                var key = zk(Math.floor(ruheP[3 * pj] / Z), Math.floor(ruheP[3 * pj + 1] / Z), Math.floor(ruheP[3 * pj + 2] / Z));
                (fach.get(key) || fach.set(key, []).get(key)).push(pj);
            });
            var eltern = new Int32Array(3 * k),
                gew = new Float32Array(3 * k),
                best,
                nimm = function (uu, d2) {
                    if (d2 >= best[2][1]) return;
                    best[2] = [uu, d2];
                    best.sort(function (A, B) { return A[1] - B[1] || A[0] - B[0]; });
                };
            for (var v = 0; v < k; v++) {
                var x = r[3 * v], y = r[3 * v + 1], zz = r[3 * v + 2],
                    cx = Math.floor(x / Z), cy = Math.floor(y / Z), cz = Math.floor(zz / Z),
                    d2f = function (uu) {
                        return (ruheP[3 * uu] - x) * (ruheP[3 * uu] - x) + (ruheP[3 * uu + 1] - y) * (ruheP[3 * uu + 1] - y) + (ruheP[3 * uu + 2] - zz) * (ruheP[3 * uu + 2] - zz);
                    };
                best = [[-1, Infinity], [-1, Infinity], [-1, Infinity]];
                for (var ring = 1; ring <= 3 && best[2][0] < 0; ring++)
                    for (var dx = -ring; dx <= ring; dx++)
                        for (var dy = -ring; dy <= ring; dy++)
                            for (var dz = -ring; dz <= ring; dz++) {
                                if (ring > 1 && Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) !== ring) continue;
                                var F = fach.get(zk(cx + dx, cy + dy, cz + dz));
                                if (F) for (var li = 0; li < F.length; li++) nimm(F[li], d2f(F[li]));
                            }
                // fern vom Gitter (ein Zipfel ohne Gegenstück): die nächsten im ganzen Kleid
                if (best[2][0] < 0) for (var ub = 0; ub < L.length; ub++) nimm(L[ub], d2f(L[ub]));
                var sw = 0;
                for (var bb = 0; bb < 3; bb++) {
                    eltern[3 * v + bb] = best[bb][0] < 0 ? best[0][0] : best[bb][0];
                    var gg = best[bb][0] < 0 ? 0 : 1 / (best[bb][1] + 1e-6);
                    gew[3 * v + bb] = gg;
                    sw += gg;
                }
                for (bb = 0; bb < 3; bb++) gew[3 * v + bb] /= sw || 1;
            }
            return { eltern: eltern, gew: gew };
        };
        return {
            zelleE: zE,
            n: np,
            idx: Int32Array.from(idx),
            w: w,
            paare: Int32Array.from(paare),
            alpha: Float64Array.from(alpha),
            zielAlpha: 1 / (mM * om * om),
            zielMax: zMax,
            tiefe: new Float64Array(np).fill(G.tiefeM),
            ruheP: ruheP,
            simF: teile.map(function (T, ti) {
                return zE > 0 ? folger(T.r, T.n, ti) : null;
            }),
            folgeF: Q.folge.map(function (F) {
                return folger(F.r, F.n, F.teil);
            }),
        };
    }
    // DER ZUSTAND DES TUCHS eines Leibs: sein Gitter (`tuchGitter`, geteilt) und seine Meshes in derselben Reihe (sim · folge ·
    // haut) — ihre Skelette (die Knochen dieses Leibs) und die Positions-Puffer, in die `tuchTakt` schreibt; `meterJe` Meter je
    // Einheit der Szene (die Welt 1, das Labor sein Maßstab) — der Löser rechnet in Metern. Die Ruhe-Längen der Kanten nimmt
    // der erste Takt aus den Zielen (die Größe DIESES Leibs). Er beginnt auf der feinsten Stufe; `tuchTakt` wählt sie am Schirm.
    function tuchZustand(gitter, sim, folge, haut, meterJe) {
        var G = TUCH_GESETZ,
            Q = gitter,
            skel = [],
            skelIdx = function (m) {
                var i = skel.indexOf(m.skeleton);
                if (i < 0) {
                    skel.push(m.skeleton);
                    i = skel.length - 1;
                }
                return i;
            };
        var nh = Q.nh;
        var z = {
            art: "tuch",
            gitter: Q,
            mj: meterJe > 0 ? meterJe : 1,
            zielAlle: true,
            kollision: _tuchKollision,
            folge: false,
            iter: G.iter,
            daempfungS: G.daempfungS,
            maxSchritte: G.maxSchritte,
            ruheM: G.ruheM,
            ruheA: G.ruheA,
            ruheSchritte: G.ruheSchritte,
            // der Leib: die Puffer und die Knochen (je Teil das Skelett seines Meshes)
            simPos: sim.map(function (m) { return m.geometry.attributes.position; }),
            folgePos: folge.map(function (m) { return m.geometry.attributes.position; }),
            simSk: sim.map(skelIdx),
            folgeSk: folge.map(skelIdx),
            hautSk: haut.map(skelIdx),
            skel: skel,
            hP: new Float64Array(3 * nh),
            hN: new Float64Array(3 * nh),
            mF: new Float64Array(12),
            inv: new Float64Array(9),
            ms: 0,
            stufe: -1,
        };
        // die Guss-Lage der Puffer, in die der Takt schreibt (`leibGussLage`): die Ruhe des Gitters
        if (_TUCH_RUHE) {
            z.simPos.forEach(function (pa, i) { _TUCH_RUHE.set(pa, Q.teile[i].ruhe); });
            z.folgePos.forEach(function (pa, i) { _TUCH_RUHE.set(pa, Q.folge[i].ruhe); });
        }
        z.skelB = skel.map(function (sk) { return new Float64Array(16 * sk.bones.length); });
        z.skelAlt = z.skelB.map(function (b) { return new Float64Array(b.length); });
        _tuchStufe(z, 0);
        return z;
    }
    // Die Stufe L des Zustands: die Felder des Lösers in ihrer Größe, der Teil-Schritt mit der Zelle (je Stufe doppelt, bis zum
    // Takt), der nächste Takt ist der Sprung in die Haut-Pose
    function _tuchStufe(z, L) {
        var G = TUCH_GESETZ,
            S = z.gitter.stufen[L],
            n = S.n;
        z.stufe = L;
        z.S = S;
        z.n = n;
        z.p = new Float64Array(S.ruheP);
        z.q = new Float64Array(S.ruheP);
        z.w = S.w;
        z.paare = S.paare;
        z.laenge = new Float64Array(S.alpha.length);
        z.alpha = S.alpha;
        z.lam = new Float64Array(S.alpha.length);
        z.ziel = new Float64Array(S.ruheP);
        z.zielAlt = new Float64Array(S.ruheP);
        z.zielAlpha = S.zielAlpha;
        z.zielMax = S.zielMax;
        z.zielN = new Float64Array(3 * n);
        z.tiefe = S.tiefe;
        z.zielD = new Float64Array(3 * n);
        z.abw = new Float64Array(3 * n);
        z.gAbw = new Float64Array(3 * n);
        z.M = new Float64Array(12 * n);
        z.kontakt = new Uint8Array(n);
        z.kontaktAlt = new Uint8Array(n);
        z._dB = new Float64Array(3 * n);
        z.schrittS = Math.min(G.taktS, G.schrittS * Math.pow(2, L));
        z.ruht = false;
        z.still = 0;
        z.frisch = true;
    }
    // Die Stufe am Schirm: die gröbste, deren Zelle höchstens `gitterPx` Bildpunkte deckt (`pxM` Bildpunkte je Meter am Leib;
    // die Stufe 0 misst die halbe Zelle der Stufe 1), mit der Schwelle `gitterHyst` gegen das Pendeln
    function _tuchStufeWahl(z, pxM) {
        var G = TUCH_GESETZ,
            Z = G.gitterM,
            L = Math.max(0, z.stufe),
            px = function (k) {
                return (Z[k] || 0.5 * Z[1]) * pxM;
            };
        while (L > 0 && px(L) > G.gitterPx * (1 + G.gitterHyst)) L--;
        while (L + 1 < Z.length && px(L + 1) <= G.gitterPx * (1 - G.gitterHyst)) L++;
        return L;
    }
    // DAS GITTER DER HAUT (je Bild): die Haut-Ecken z.hP[0 … 3·nh) in Zellen der Kante hautM über ihrer Hülle (ein Ring mehr
    // je Seite: jede Lage, die eine Haut-Ecke im Radius hautM hat, liegt im Gitter), je Zelle ihre Ecken (Zählen, Präfix,
    // Füllen) und die NÄHE (die Belegung, um eine Zelle je Achse geweitet: liest eine Lage dort 0, ist keine Haut in Reichweite —
    // eine Lesung statt 27 Zellen).
    function _hautGitter(z, nh) {
        var c = TUCH_GESETZ.hautM,
            ic = 1 / c,
            hP = z.hP,
            x0 = Infinity,
            y0 = Infinity,
            z0 = Infinity,
            x1 = -Infinity,
            y1 = -Infinity,
            z1 = -Infinity,
            i;
        for (i = 0; i < nh; i++) {
            var cx = Math.floor(hP[3 * i] * ic),
                cy = Math.floor(hP[3 * i + 1] * ic),
                cz = Math.floor(hP[3 * i + 2] * ic);
            if (cx < x0) x0 = cx;
            if (cx > x1) x1 = cx;
            if (cy < y0) y0 = cy;
            if (cy > y1) y1 = cy;
            if (cz < z0) z0 = cz;
            if (cz > z1) z1 = cz;
        }
        if (!(nh > 0)) {
            z.gnx = z.gny = z.gnz = 0;
            return;
        }
        x0--;
        y0--;
        z0--;
        var nx = x1 - x0 + 2,
            ny = y1 - y0 + 2,
            nz = z1 - z0 + 2,
            n = nx * ny * nz;
        if (!z.gS || z.gS.length < n + 1) {
            z.gS = new Int32Array(n + 1);
            z.gN = new Uint8Array(n);
            z.gW = new Uint8Array(n);
        }
        if (!z.gL || z.gL.length < nh) z.gL = new Int32Array(nh);
        var S = z.gS,
            N = z.gN,
            W = z.gW,
            L = z.gL,
            zelle = z.gZ && z.gZ.length >= nh ? z.gZ : (z.gZ = new Int32Array(nh));
        S.fill(0, 0, n + 1);
        for (i = 0; i < nh; i++) {
            var k = Math.floor(hP[3 * i] * ic) - x0 + nx * (Math.floor(hP[3 * i + 1] * ic) - y0 + ny * (Math.floor(hP[3 * i + 2] * ic) - z0));
            zelle[i] = k;
            S[k + 1]++;
        }
        for (i = 0; i < n; i++) S[i + 1] += S[i];
        var fuell = z.gF && z.gF.length >= n ? z.gF : (z.gF = new Int32Array(n));
        fuell.set(S.subarray(0, n));
        for (i = 0; i < nh; i++) L[fuell[zelle[i]]++] = i;
        // die Nähe: die Belegung, geweitet längs x, dann y, dann z (eine Zelle: keine Haut näher als hautM, wo sie 0 liest)
        for (i = 0; i < n; i++) N[i] = S[i + 1] > S[i] ? 1 : 0;
        // (je Achse eine Schleife über Zeilen — keine Teilung je Zelle)
        var weiten = function (Q) {
            var x, y, zc, j, b2;
            for (zc = 0; zc < nz; zc++)
                for (y = 0; y < ny; y++)
                    for (x = 0, j = nx * (y + ny * zc); x < nx; x++, j++) W[j] = Q[j] || (x > 0 && Q[j - 1]) || (x < nx - 1 && Q[j + 1]) ? 1 : 0;
            for (zc = 0; zc < nz; zc++)
                for (y = 0; y < ny; y++)
                    for (x = 0, j = nx * (y + ny * zc); x < nx; x++, j++) Q[j] = W[j] || (y > 0 && W[j - nx]) || (y < ny - 1 && W[j + nx]) ? 1 : 0;
            var st = nx * ny;
            for (zc = 0; zc < nz; zc++)
                for (j = st * zc, b2 = j + st; j < b2; j++) W[j] = Q[j] || (zc > 0 && Q[j - st]) || (zc < nz - 1 && Q[j + st]) ? 1 : 0;
            Q.set(W.subarray(0, n));
        };
        weiten(N);
        z.gx0 = x0;
        z.gy0 = y0;
        z.gz0 = z0;
        z.gnx = nx;
        z.gny = ny;
        z.gnz = nz;
    }
    // DIE HAUT BLEIBT INNEN: je Punkt die nächste Haut-Ecke im Radius hautM (die Haut der Stufe, die das Bild trägt); liegt er
    // weniger als luftM über ihr (längs ihrer Normale), hebt er sich auf luftM — die Haut bewegt sich nie (sie ist der Leib). JEDER
    // Punkt prüft sie in JEDEM Takt (wo keine Haut nah ist, liest er eine Zelle der Nähe, `_hautGitter`). Gefallen ist DIE FREIHEIT
    // DER RUHE (w11-koerper, gefallen in w12-tuch-grob): wer weniger abwich als seine in der Ruhe gemessene Höhe über der Haut,
    // prüfte nie — „Tuch und Haut tragen dieselben Haut-Gewichte, jede Pose trägt die Freiheit mit". Die Pose trägt sie nicht: die
    // Mischung der Knochen staucht Achsel, Ellbogen und Hüfte, und der schwingende Unterarm geht durch den Poncho an der Hüfte
    // (haar.K4#2 an b62542c9: die feine Stufe im Gang 3 057 Tuch-Ecken hinter ihrer Haut in 40 von 40 Bildern, die grobe 543). Eine
    // Freiheit, die die Pose misst (die Regung der Haut gegen den Punkt im Rahmen der Wurzel, oder je Takt gegen den letzten), hielt
    // im Gang nie: ~2 200–2 750 der ~3 500 Prüfungen blieben, und ihr Messen kostete mehr, als es sparte. Die Kosten der vollen
    // Prüfung (Kollision 1,1 → 3,3 ms je Takt am Poncho, Gitter-Stufe 0) trägt der Takt selbst: der Schritt teilt nicht mehr je
    // Paar und Runde (`xpbdSchritt`), die Ziele messen ihre Längen ohne `Math.hypot` (`tuchTakt`).
    function _tuchKollision(z) {
        _hautHeben(z, z.p, z.n, z.kontakt, z.q, true);
    }
    // DIE PRÜFUNG einer Lage (x, y, zz) gegen die Haut: die nächste Haut-Ecke im Radius hautM und jede im Band um sie (`bandM`:
    // Gleichstände — die Haut beider Stufen liegt oft deckungsgleich, mit anderen Normalen); `q` erhält [nächste, tiefste,
    // tiefe] (Indizes ×3 in hP; tiefste −1, wenn jede Halb-Ebene hält); die Kandidaten im Radius bleiben in z._cd (d², j)
    // × z._cn. Antwort: die nächste (−1: keine Haut nah — die Nähe des Gitters liest 0).
    function _hautPruefen(z, x, y, zz, q) {
        var G = TUCH_GESETZ,
            ic = 1 / G.hautM,
            nx = z.gnx,
            ny = z.gny,
            nz = z.gnz,
            ix = Math.floor(x * ic) - z.gx0,
            iy = Math.floor(y * ic) - z.gy0,
            iz = Math.floor(zz * ic) - z.gz0;
        q[0] = -1;
        q[1] = -1;
        q[2] = G.luftM;
        z._cn = 0;
        if (ix < 0 || iy < 0 || iz < 0 || ix >= nx || iy >= ny || iz >= nz || !z.gN[ix + nx * (iy + ny * iz)]) return -1;
        var hP = z.hP,
            hN = z.hN,
            S = z.gS,
            L = z.gL,
            cd = z._cd || (z._cd = new Float64Array(1024)),
            cn = 0,
            b = -1,
            bd = G.hautM * G.hautM,
            r2 = bd;
        // nur die Zellen, die den Radius berühren (die Kante ist der Radius: je Achse zwei, nie drei — dieselben Kandidaten in
        // derselben Folge wie die 27 Nachbarn, ein Drittel der Zellen)
        var r = G.hautM,
            ax0 = Math.max(0, Math.floor((x - r) * ic) - z.gx0),
            ax1 = Math.min(nx - 1, Math.floor((x + r) * ic) - z.gx0),
            ay0 = Math.max(0, Math.floor((y - r) * ic) - z.gy0),
            ay1 = Math.min(ny - 1, Math.floor((y + r) * ic) - z.gy0),
            az0 = Math.max(0, Math.floor((zz - r) * ic) - z.gz0),
            az1 = Math.min(nz - 1, Math.floor((zz + r) * ic) - z.gz0);
        for (var cz = az0; cz <= az1; cz++)
            for (var cy = ay0; cy <= ay1; cy++) {
                var zeile = nx * (cy + ny * cz);
                for (var cx = ax0; cx <= ax1; cx++) {
                    var c = zeile + cx;
                    for (var s = S[c], e = S[c + 1]; s < e; s++) {
                        var j = 3 * L[s],
                            ax = hP[j] - x,
                            ay = hP[j + 1] - y,
                            az = hP[j + 2] - zz,
                            d2 = ax * ax + ay * ay + az * az;
                        if (d2 >= r2) continue;
                        if (cn < 1024) {
                            cd[cn++] = d2;
                            cd[cn++] = j;
                        }
                        if (d2 < bd) {
                            bd = d2;
                            b = j;
                        }
                    }
                }
            }
        z._cn = cn;
        q[0] = b;
        if (b < 0) return -1;
        var rb = Math.sqrt(bd) + G.bandM,
            rb2 = rb * rb;
        for (var t = 0; t < cn; t += 2) {
            if (cd[t] > rb2) continue;
            var jj = cd[t + 1],
                hq = (x - hP[jj]) * hN[jj] + (y - hP[jj + 1]) * hN[jj + 1] + (zz - hP[jj + 2]) * hN[jj + 2];
            if (hq < q[2]) {
                q[2] = hq;
                q[1] = jj;
            }
        }
        return b;
    }
    // DIE HAUT BLEIBT INNEN — das Heben: liegt die Ecke hinter einer Halb-Ebene der Prüfung, hebt sie sich längs der tiefsten
    // Verletzung auf luftM; nach dem Heben kann eine andere Haut-Ecke die nächste sein (bis zu vier Runden). Im Takt hebt sie
    // mit der Lage auch ihre Vorlage (`q0`): die Haut schiebt das Tuch, sie stößt es nicht (ein Stoß ginge als Tempo in den
    // nächsten Schritt — das Tuch pendelte zwischen Ziel und Haut). Die Ruhe (`rueckfall`): pendelt sie in einer Falte (Achsel,
    // Schritt — zwei Häute, deren Halb-Ebenen einander ausschließen), setzt sie sich auf die nächste Haut-Ecke, über der sie
    // selbst die Prüfung hält (deren Lage + 1,5 · luftM längs ihrer Normale, sonst 3 und 6 ·; die nächsten zuerst, höchstens
    // 16). Antwort: die Zahl der gehobenen Punkte.
    function _hautHeben(z, p, n, kontakt, q0, rueckfall) {
        var G = TUCH_GESETZ,
            luft = G.luftM,
            hP = z.hP,
            hN = z.hN,
            q = z._q || (z._q = new Float64Array(3)),
            gehoben = 0;
        for (var i = 0; i < n; i++) {
            var o = 3 * i,
                hob = false,
                ok = false;
            for (var runde = 0; runde < 4; runde++) {
                if (_hautPruefen(z, p[o], p[o + 1], p[o + 2], q) < 0 || q[1] < 0) {
                    ok = true;
                    break;
                }
                var nb = q[1],
                    k = luft - q[2];
                p[o] += k * hN[nb];
                p[o + 1] += k * hN[nb + 1];
                p[o + 2] += k * hN[nb + 2];
                if (q0) {
                    q0[o] += k * hN[nb];
                    q0[o + 1] += k * hN[nb + 1];
                    q0[o + 2] += k * hN[nb + 2];
                }
                hob = true;
            }
            if (rueckfall && !ok && !(_hautPruefen(z, p[o], p[o + 1], p[o + 2], q) < 0 || q[1] < 0)) {
                // der Rückfall der Falte: die Kandidaten der letzten Prüfung nach Abstand (die 16 nächsten, ohne Müll: in festen Puffern
                // des Zustands, gereiht nach Abstand, dann Index)
                var cd = z._cd,
                    ord = z._rOrd || (z._rOrd = new Float64Array(1024)),
                    idx = z._rIdx || (z._rIdx = new Int32Array(512)),
                    nIdx = 0;
                for (var a = 0; a < z._cn; a += 2) {
                    ord[a] = cd[a];
                    ord[a + 1] = cd[a + 1];
                    var e = nIdx++;
                    while (e > 0 && (ord[idx[e - 1]] > cd[a] || (ord[idx[e - 1]] === cd[a] && ord[idx[e - 1] + 1] > cd[a + 1]))) {
                        idx[e] = idx[e - 1];
                        e--;
                    }
                    idx[e] = a;
                }
                var fertig = false;
                for (var hoch = 1.5; hoch <= 6 && !fertig; hoch *= 2)
                    for (var t = 0; t < nIdx && t < 16; t++) {
                        var jj = ord[idx[t] + 1],
                            px = hP[jj] + hoch * luft * hN[jj],
                            py = hP[jj + 1] + hoch * luft * hN[jj + 1],
                            pz = hP[jj + 2] + hoch * luft * hN[jj + 2];
                        if (_hautPruefen(z, px, py, pz, q) < 0 || q[1] < 0) {
                            p[o] = px;
                            p[o + 1] = py;
                            p[o + 2] = pz;
                            fertig = true;
                            break;
                        }
                    }
            }
            if (hob) {
                gehoben++;
                if (kontakt) kontakt[i] = 1;
            }
        }
        return gehoben;
    }
    // DAS TUCH IN DER RUHE (haar.K4): dieselbe Kollision wie im Takt, an der Ruhe-Pose des Leibs — dort, wo seine zwei Stufen
    // zusammenkommen (der Wirt `_tuchVorlageDrapieren`, das Labor `tuchAnlegen`), liegt jede Tuch-Ecke über der Haut, die mit ihr
    // gezeichnet wird: je Stufe ihr Tuch über IHRER Haut (w11-koerper — gegen die Haut beider blieb der Kragen der feinen 22–24 mm
    // in ihrem Hals: die grobe Hals-Haut lag innen und galt als die nächste) (`tuch`, `haut` three-SkinnedMeshes, gelesen im
    // Raum ihrer Bindung; `meterJe` Meter je Einheit dieses
    // Raums). Gemessen am main 5fba36ea lagen in der Ruhe-Pose 544 von 9 950 Tuch-Ecken hinter der Haut — nicht der Saum: die
    // Achsel, die Hand an der Hüfte, der Versatz der Stufen; so steht auch das Ziel des Takts nie in einer Falte (ein Ziel
    // hinter der Haut zöge das Tuch je Bild hinein, die Kollision hinaus). Schreibt die Positionen der Tuch-Meshes (in place,
    // needsUpdate); der Wirt rechnet ihre Normalen neu. Antwort: die Zahl der gehobenen Ecken.
    function tuchDrapieren(tuch, haut, meterJe) {
        var e = meterJe > 0 ? meterJe : 1,
            H = haut.map(function (m) {
                var ga = m.geometry.attributes;
                return _tuchBind(m, ga.position.array, ga.position.count, ga.normal.array);
            }),
            nh = 0,
            i;
        H.forEach(function (b) {
            nh += b.r.length / 3;
        });
        var z = { hP: new Float64Array(3 * nh), hN: new Float64Array(3 * nh) },
            o = 0;
        H.forEach(function (b) {
            for (var j = 0; j < b.r.length; j++) {
                z.hP[o + j] = b.r[j] * e;
                z.hN[o + j] = b.n[j];
            }
            o += b.r.length;
        });
        _hautGitter(z, nh);
        var k = 0;
        tuch.forEach(function (m) {
            var pa = m.geometry.attributes.position,
                n = pa.count,
                b = _tuchBind(m, pa.array, n, null),
                p = new Float64Array(3 * n),
                t = m.bindMatrix.elements;
            for (i = 0; i < 3 * n; i++) p[i] = b.r[i] * e;
            var km = _hautHeben(z, p, n, null, null, true);
            if (!km) return;
            k += km;
            for (i = 0; i < n; i++) {
                var x = p[3 * i] / e - t[12],
                    y = p[3 * i + 1] / e - t[13],
                    zz = p[3 * i + 2] / e - t[14];
                pa.array[3 * i] = b.inv[0] * x + b.inv[1] * y + b.inv[2] * zz;
                pa.array[3 * i + 1] = b.inv[3] * x + b.inv[4] * y + b.inv[5] * zz;
                pa.array[3 * i + 2] = b.inv[6] * x + b.inv[7] * y + b.inv[8] * zz;
            }
            pa.needsUpdate = true;
        });
        return k;
    }
    // DER TAKT DES TUCHS: die Stufe des Gitters am Schirm (`pxM` Bildpunkte je Meter am Leib; ohne: die feinste — das Labor),
    // die Knochen des Bilds (die Welt-Matrizen müssen stehen), daraus je Punkt seine Haut-Pose (das Ziel) und DIE SCHWERE ALS
    // ABWEICHUNG: das Tuch hängt in der Ruhe-Pose des Ofens schon unter der Schwere (die Drapierung ist seine Gestalt) — es fällt um
    // das, was die Pose an der Lotrechten seines Punkts ändert (g − g · R(unten); R die Drehung seiner Blend-Matrix: der stehende
    // Leib trägt keine, der gebeugte lässt sein Tuch zur Erde fallen, bis Bindung und Halter es halten). Dann die Haut des Bilds,
    // soweit das Tuch sie erreicht, in ihrem Gitter (`_hautGitter`), EIN Löser-Schritt um dt — dann die Abweichung jedes Punkts
    // zurück in den Raum der Bindung (die Inverse seiner Blend-Matrix) in die Positionen der Meshes und, über die Eltern, der
    // Folger. dt ≤ 0 oder ein Sprung (> sprungS) setzt das Tuch in die Haut-Pose. Stehen alle Knochen und ruht das Tuch, rechnet
    // nichts. Antwort: true, wenn Positionen neu sind (der Wirt lädt sie hoch).
    function tuchTakt(z, dt, pxM) {
        if (!z || z.art !== "tuch") return false;
        var t0 = typeof performance !== "undefined" ? performance.now() : 0;
        if (pxM > 0) {
            var L = _tuchStufeWahl(z, pxM);
            if (L !== z.stufe) _tuchStufe(z, L);
        }
        var still = true;
        for (var s = 0; s < z.skel.length; s++) {
            var B = _tuchKnochen(z.skel[s], z.skelB[s]),
                A = z.skelAlt[s];
            if (z.mj !== 1) for (var bm = 0; bm < B.length; bm++) B[bm] *= z.mj;
            for (var e = 0; e < B.length; e++)
                if (Math.abs(B[e] - A[e]) > 1e-6) {
                    still = false;
                    break;
                }
            A.set(B);
        }
        if (still && z.ruht && !z.frisch) return false;
        var Q = z.gitter,
            S = z.S,
            p = z.p,
            M = z.M,
            ziel = z.ziel,
            zN = z.zielN,
            gA = z.gAbw,
            gS = LEIB.sprung.refG,
            i;
        // die Ziele: die Haut-Pose jedes Punkts, ihre Normale, die Schwere seiner Pose
        for (var j = 0; j < S.n; j++) {
            var g = S.idx[j],
                ti = Q.teilVon[g],
                T = Q.teile[ti],
                Bk = z.skelB[z.simSk[ti]],
                o = 12 * j;
            i = g - T.off;
            _tuchBlend(Bk, T.bi, T.bw, i, M, o);
            var rx = T.r[3 * i], ry = T.r[3 * i + 1], rz = T.r[3 * i + 2];
            ziel[3 * j] = M[o] * rx + M[o + 3] * ry + M[o + 6] * rz + M[o + 9];
            ziel[3 * j + 1] = M[o + 1] * rx + M[o + 4] * ry + M[o + 7] * rz + M[o + 10];
            ziel[3 * j + 2] = M[o + 2] * rx + M[o + 5] * ry + M[o + 8] * rz + M[o + 11];
            if (T.nrm) {
                var nx = T.nrm[3 * i], ny = T.nrm[3 * i + 1], nz = T.nrm[3 * i + 2],
                    ax = M[o] * nx + M[o + 3] * ny + M[o + 6] * nz,
                    ay = M[o + 1] * nx + M[o + 4] * ny + M[o + 7] * nz,
                    az = M[o + 2] * nx + M[o + 5] * ny + M[o + 8] * nz,
                    al = Math.sqrt(ax * ax + ay * ay + az * az) || 1;
                zN[3 * j] = ax / al;
                zN[3 * j + 1] = ay / al;
                zN[3 * j + 2] = az / al;
            }
            // die Lotrechte der Ruhe (−y der Bindung) in der Pose: −(Spalte y der Blend-Matrix), normiert
            var ul = Math.sqrt(M[o + 3] * M[o + 3] + M[o + 4] * M[o + 4] + M[o + 5] * M[o + 5]) || 1;
            gA[3 * j] = (gS * M[o + 3]) / ul;
            gA[3 * j + 1] = -gS + (gS * M[o + 4]) / ul;
            gA[3 * j + 2] = (gS * M[o + 5]) / ul;
        }
        // ruht das Tuch und beschleunigt sein Ziel kaum (das Wiegen, der Atem des stehenden Leibs), trägt es seine Abweichung starr
        // mit: keine Haut, kein Schritt, nichts hochzuladen
        if (z.ruht && !z.frisch && dt > 0 && dt <= TUCH_GESETZ.sprungS && _zielBeschleunigung(z, dt) < z.ruheA) {
            _zielWeiter(z, dt);
            return false;
        }
        // die Haut des Bilds, soweit das Tuch sie erreicht: jede nahe Ecke durch ihre Knochen, ins Gitter der Haut
        var hP = z.hP,
            hN = z.hN,
            mF = z.mF,
            nh = 0;
        for (var hi = 0; hi < Q.haut.length; hi++) {
            var H = Q.haut[hi],
                Bh = z.skelB[z.hautSk[hi]],
                NH = H.nah;
            for (var hk = 0; hk < NH.length; hk++) {
                var v = NH[hk],
                    jh = 3 * nh;
                _tuchBlend(Bh, H.bi, H.bw, v, mF, 0);
                var x = H.r[3 * v], y = H.r[3 * v + 1], zz = H.r[3 * v + 2];
                hP[jh] = mF[0] * x + mF[3] * y + mF[6] * zz + mF[9];
                hP[jh + 1] = mF[1] * x + mF[4] * y + mF[7] * zz + mF[10];
                hP[jh + 2] = mF[2] * x + mF[5] * y + mF[8] * zz + mF[11];
                var hx = H.nrm[3 * v], hy = H.nrm[3 * v + 1], hz = H.nrm[3 * v + 2],
                    bx = mF[0] * hx + mF[3] * hy + mF[6] * hz,
                    by = mF[1] * hx + mF[4] * hy + mF[7] * hz,
                    bz = mF[2] * hx + mF[5] * hy + mF[8] * hz,
                    bl = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
                hN[jh] = bx / bl;
                hN[jh + 1] = by / bl;
                hN[jh + 2] = bz / bl;
                nh++;
            }
        }
        _hautGitter(z, nh);
        // der Sprung (der erste Takt, eine Pause, ein Teleport, eine neue Stufe): das Tuch steht in der Haut-Pose, der Löser
        // beginnt in Ruhe
        if (z.frisch || !(dt > 0) || dt > TUCH_GESETZ.sprungS) {
            p.set(ziel);
            z.q.set(ziel);
            z.zielAlt.set(ziel);
            z.zielD.fill(0);
            z.dtAlt = 0;
            z.frisch = false;
            for (var pj = 0, pa = z.paare; pj < z.laenge.length; pj++) {
                var ia = 3 * pa[2 * pj],
                    ib = 3 * pa[2 * pj + 1];
                z.laenge[pj] = Math.hypot(ziel[ib] - ziel[ia], ziel[ib + 1] - ziel[ia + 1], ziel[ib + 2] - ziel[ia + 2]);
            }
            z.ruht = false;
            z.still = 0;
            z.kontakt.fill(0);
            _tuchKollision(z);
            z.q.set(p);
            for (i = 0; i < 3 * z.n; i++) z.abw[i] = p[i] - ziel[i];
        } else {
            z.kontaktAlt.set(z.kontakt);
            z.kontakt.fill(0);
            if (!xpbdSchritt(z, dt, null)) return false;
        }
        _tuchSchreiben(z);
        z.ms = (typeof performance !== "undefined" ? performance.now() : 0) - t0;
        return true;
    }
    // Die Abweichung jedes Punkts von seiner Haut-Pose, zurück in den Raum der Bindung (Blend⁻¹); jede Ecke der Meshes trägt die
    // ihres Punkts (sim, Stufe 0) oder das Mittel ihrer Eltern (die Folger) in den Raum der Geometrie (bindMatrix⁻¹). Ein Folger,
    // dem die Haut in der Ruhe nahe liegt, liegt selbst über ihr (dieselbe Kollision, Ecke für Ecke, durch ihre eigenen Knochen).
    function _tuchSchreiben(z) {
        var Q = z.gitter,
            S = z.S,
            p = z.p,
            ziel = z.ziel,
            M = z.M,
            inv = z.inv,
            dB = z._dB,
            j;
        for (j = 0; j < S.n; j++) {
            var dx = p[3 * j] - ziel[3 * j],
                dy = p[3 * j + 1] - ziel[3 * j + 1],
                dz = p[3 * j + 2] - ziel[3 * j + 2];
            _m3inv(M, 12 * j, inv);
            dB[3 * j] = inv[0] * dx + inv[1] * dy + inv[2] * dz;
            dB[3 * j + 1] = inv[3] * dx + inv[4] * dy + inv[5] * dz;
            dB[3 * j + 2] = inv[6] * dx + inv[7] * dy + inv[8] * dz;
        }
        for (var ti = 0; ti < Q.teile.length; ti++) {
            var T = Q.teile[ti];
            _tuchFolgen(z, T, S.simF[ti], z.simPos[ti], z.skelB[z.simSk[ti]], T.off);
        }
        for (var fi = 0; fi < Q.folge.length; fi++) _tuchFolgen(z, Q.folge[fi], S.folgeF[fi], z.folgePos[fi], z.skelB[z.folgeSk[fi]], -1);
    }
    // Ein Mesh schreibt seine Ecken: ohne Folger (`F` null: das sim-Mesh der Stufe 0) trägt Ecke i den Punkt off + i
    function _tuchFolgen(z, D, F, pos, Bk, off) {
        var a = pos.array,
            fI = D.bInv,
            dB = z._dB,
            mF = z.mF,
            inv = z.inv,
            pt = z._pt || (z._pt = new Float64Array(3));
        for (var i = 0; i < D.n; i++) {
            var o = 3 * i,
                ux,
                uy,
                uz;
            if (!F) {
                var k = 3 * (off + i);
                ux = dB[k];
                uy = dB[k + 1];
                uz = dB[k + 2];
            } else {
                var e0 = 3 * F.eltern[o], e1 = 3 * F.eltern[o + 1], e2 = 3 * F.eltern[o + 2],
                    g0 = F.gew[o], g1 = F.gew[o + 1], g2 = F.gew[o + 2];
                ux = g0 * dB[e0] + g1 * dB[e1] + g2 * dB[e2];
                uy = g0 * dB[e0 + 1] + g1 * dB[e1 + 1] + g2 * dB[e2 + 1];
                uz = g0 * dB[e0 + 2] + g1 * dB[e1 + 2] + g2 * dB[e2 + 2];
                // die Ecke selbst gegen die Haut, wenn sie ihr in der Ruhe nahe liegt: in die Welt durch ihre Knochen, gehoben, zurück
                if (D.nahe[i]) {
                    _tuchBlend(Bk, D.bi, D.bw, i, mF, 0);
                    var rx = D.r[o] + ux, ry = D.r[o + 1] + uy, rz = D.r[o + 2] + uz;
                    pt[0] = mF[0] * rx + mF[3] * ry + mF[6] * rz + mF[9];
                    pt[1] = mF[1] * rx + mF[4] * ry + mF[7] * rz + mF[10];
                    pt[2] = mF[2] * rx + mF[5] * ry + mF[8] * rz + mF[11];
                    var wx = pt[0], wy = pt[1], wz = pt[2];
                    if (_hautHeben(z, pt, 1, null, null, true)) {
                        var cx = pt[0] - wx, cy = pt[1] - wy, cz = pt[2] - wz;
                        _m3inv(mF, 0, inv);
                        ux += inv[0] * cx + inv[1] * cy + inv[2] * cz;
                        uy += inv[3] * cx + inv[4] * cy + inv[5] * cz;
                        uz += inv[6] * cx + inv[7] * cy + inv[8] * cz;
                    }
                }
            }
            a[o] = D.ruhe[o] + fI[0] * ux + fI[1] * uy + fI[2] * uz;
            a[o + 1] = D.ruhe[o + 1] + fI[3] * ux + fI[4] * uy + fI[5] * uz;
            a[o + 2] = D.ruhe[o + 2] + fI[6] * ux + fI[7] * uy + fI[8] * uz;
        }
        pos.needsUpdate = true;
    }
    // DIE RUHE DES TUCHS: jedes Mesh kehrt in seine Ruhe-Lage zurück (der Leib verlässt die Nähe, die Stufe wechselt) — der Zustand
    // beginnt beim nächsten Takt frisch.
    function tuchRuhe(z) {
        if (!z || z.art !== "tuch") return z;
        var Q = z.gitter;
        Q.teile.concat(Q.folge).forEach(function (T, i) {
            var pos = i < Q.teile.length ? z.simPos[i] : z.folgePos[i - Q.teile.length];
            pos.array.set(T.ruhe);
            pos.needsUpdate = true;
        });
        z.frisch = true;
        return z;
    }

    // ── Der Namensraum (Vertrag v1.1 §7 + §8 MESHFREI) ──
    root.__koerperCore = {
        VERSION: VERSION,
        labProportionen: labProportionen,
        labMorph: labMorph,
        labLandmarks: labLandmarks,
        bauMensch: bauMensch,
        morphAuf: morphAuf,
        // w11-koerper — die Ruhe der Arme (Leser: morphAuf), ihr Urteil am Guss (Leser: die Linse gate:mensch-anatomie RUHE) und die
        // Anlage, mit der die Rumpf-Hülle dem ruhenden Arm weicht (Leser: der Mensch-Guss)
        ARM_RUHE: ARM_RUHE,
        armRuheUrteil: armRuheUrteil,
        leibGussGestellt: leibGussGestellt,
        leibUrteil: leibUrteil,
        leibKanon: leibKanon,
        gussNetze: gussNetze,
        kopfGussUrteil: kopfGussUrteil,
        randRinge: randRinge,
        armAnlage: armAnlage,
        MATERIAL_KLASSEN: MATERIAL_KLASSEN,
        HAUT_LOOK: HAUT_LOOK,
        HAAR_LOOK: HAAR_LOOK,
        HAAR_STRICH: HAAR_STRICH,
        haarAchse: haarAchse,
        haarLappen: haarLappen,
        haarFlimmern: haarFlimmern,
        haarGlanzSelbsttest: haarGlanzSelbsttest,
        lichtSelbsttest: lichtSelbsttest,
        MENSCH_GESTALT: MENSCH_GESTALT,
        MENSCH_SOLL: MENSCH_SOLL,
        KOPF_SOLL: KOPF_SOLL,
        LEIB_SOLL: LEIB_SOLL,
        LEIB_RELIEF: LEIB_RELIEF,
        leibRelief: leibRelief,
        LEIB_FORM_SOLL: LEIB_FORM_SOLL,
        leibFormUrteil: leibFormUrteil,
        kopfToene: kopfToene,
        // w12-gesicht — das Gesicht im Bild: seine Züge unter seinem Licht (Leser: werkbank bild, die Soll-Tafel mensch-kopf) und sein
        // Selbsttest mit Mutanten (Leser: diag-kamera-laub K5)
        gesichtMasse: gesichtMasse,
        gesichtSelbsttest: gesichtSelbsttest,
        haarKappe: haarKappe,
        HAAR_VOLUMEN: HAAR_VOLUMEN,
        // studios.K1 — die Fülle des Leibs (der Regler mass): das Unterhaut-Fett je Gelenk (Leser: der Mensch-Guss)
        MENSCH_FETT: MENSCH_FETT,
        fettDepot: fettDepot,
        // mensch.K4 — das Gesicht aus dem Genom: die Bereiche der vier Achsen (Leser: der Genom-Roller des Wirts, die Linsen)
        GESICHT_GENOM: GESICHT_GENOM,
        // mensch.K4 — die Schnitte mit Volumen (je Stil die Kappe): die Gestalten einer Siedlung wählen aus ihnen
        HAAR_KAPPE: HAAR_KAPPE,
        // w26-leib-raum — der EINE Leib-Raum der Menge: die Achsen und ihre Knoten, die Vorlage, der Punkt einer Person (Leser: der
        // Ofen der Mengen-Stufen, der Wirt: Genom-Roller und Satz der Bewohner)
        LEIB_RAUM: LEIB_RAUM,
        leibRaumVorlage: leibRaumVorlage,
        leibRaumPunkt: leibRaumPunkt,
        // mensch.K4 — die Töne des Menschen: der Ton je Stoff-Klasse, die Braue, die Palette (Leser: der Ofen, der Wirt)
        MENSCH_TON: MENSCH_TON,
        KOPF_TON: KOPF_TON,
        menschTon: menschTon,
        brauTon: brauTon,
        menschPalette: menschPalette,
        SKIN_TONES: SKIN_TONES,
        CLOTH_COLORS: CLOTH_COLORS,
        // V18.463 — die Hüllen-Maschine (verbatim, THREE-frei):
        voxDilate: _vox_dilate,
        voxErode: _vox_erode,
        voxFill: _vox_fill,
        blur3: _blur3,
        surfaceNets: surfaceNets,
        kleidZonen: kleidZonen,
        haarStreu: haarStreu,
        HAIR_COLORS: HAIR_COLORS,
        DIAL_MAP: DIAL_MAP,
        BEVOELKERUNG: BEVOELKERUNG,
        bevoelkerung: bevoelkerung,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        MESHFREI: MESHFREI,
        PORTAL_RENDER_CONFIG: PORTAL_RENDER_CONFIG,
        PRESETS: PRESETS,
        PARAMS_BY_KIND: { koerper: PARAMS },
        // B8 — der Stammbaum (studios.K5): wie das Buch sich und seine Arten nennt (der Wirt leitet den EINEN Baum ab)
        STAMMBAUM: { studio: "Da Vinci", arten: { koerper: "Gestalt des Spielers" } },
        LEIB: LEIB,
        WEBE: WEBE,
        // mensch.K2 — DER TAG (VERHALTEN): das Gesetz, der Beruf, der Plan der Stunde (Leser: _bewohnerListe, _tickBewohner)
        TAGES_GESETZ: TAGES_GESETZ,
        berufVon: berufVon,
        tagesPlan: tagesPlan,
        tagesHaltung: tagesHaltung,
        // Die Lab-Quellen (die Shell liest DIESE eine Quelle — Aliasse):
        START_PARAMS: START_PARAMS,
        MOTION: MOTION,
        AUGEN_VIS: AUGEN_VIS,
        KPMUL_VIS: KPMUL_VIS,
        // die Bewegungs-Zeile des Menschen (fx.bewegung) — der EINE Takt liest sie über leibGesetz
        bewegung: PRESETS.mensch.fx.bewegung,
        // w4-koerper-park — DER EINE BEWEGUNGS-TAKT DES LEIBS (Welt und Labor rufen dieselben Funktionen, LEIB_TAKT oben)
        VERB_GESETZ: VERB_GESETZ,
        VERB_POSE: VERB_POSE,
        VERB_SOLL: VERB_SOLL,
        leibPoseWinkel: leibPoseWinkel,
        leibTaktZeile: leibTaktZeile,
        LEIB_TAKT_NAMEN: LEIB_TAKT_NAMEN,
        leibSollUrteil: leibSollUrteil,
        MOTION_RIG_MAP: MOTION_RIG_MAP,
        leibGesetz: leibGesetz,
        leibMassstab: leibMassstab,
        leibMasse: leibMasse,
        leibGroesse: leibGroesse,
        leibWerte: leibWerte,
        leibVec: leibVec,
        leibZustand: leibZustand,
        leibRichtung: leibRichtung,
        leibSprungKraft: leibSprungKraft,
        leibAbdruck: leibAbdruck,
        leibSprungKlemme: leibSprungKlemme,
        leibSprung: leibSprung,
        leibLuftsprung: leibLuftsprung,
        leibPlan: leibPlan,
        leibImpuls: leibImpuls,
        leibFall: leibFall,
        leibLandung: leibLandung,
        LEIB_STOSS: LEIB_STOSS,
        LEIB_STOSS_FELDER: LEIB_STOSS_FELDER,
        leibStossMerke: leibStossMerke,
        leibStossLesen: leibStossLesen,
        leibStossSchritt: leibStossSchritt,
        leibStossFuss: leibStossFuss,
        leibStossPose: leibStossPose,
        leibVerbTakt: leibVerbTakt,
        leibSchaukelSchritt: leibSchaukelSchritt,
        leibWippeSchritt: leibWippeSchritt,
        leibRutschSchritt: leibRutschSchritt,
        leibGeraetAusschwingen: leibGeraetAusschwingen,
        leibSchwenk: leibSchwenk,
        leibSchwenkPunkt: leibSchwenkPunkt,
        leibGangBlend: leibGangBlend,
        leibZweiKnochen: leibZweiKnochen,
        leibGangTakt: leibGangTakt,
        leibRig: leibRig,
        leibRigNeutral: leibRigNeutral,
        leibRigPose: leibRigPose,
        leibKette: leibKette,
        leibSohle: leibSohle,
        leibGussLage: leibGussLage,
        leibSitz: leibSitz,
        leibGlieder: leibGlieder,
        leibPose: leibPose,
        leibVerbPose: leibVerbPose,
        leibLuftPose: leibLuftPose,
        // DAS WEICHE GESETZ (physik.K4 · haar.K4): der EINE XPBD-Löser — die Kette des Seils, das Gitter des Tuchs
        xpbdSchritt: xpbdSchritt,
        xpbdKette: xpbdKette,
        TUCH_GESETZ: TUCH_GESETZ,
        tuchGitter: tuchGitter,
        tuchZustand: tuchZustand,
        tuchTakt: tuchTakt,
        tuchRuhe: tuchRuhe,
        tuchDrapieren: tuchDrapieren,
    };
})(typeof self !== "undefined" ? self : globalThis);
