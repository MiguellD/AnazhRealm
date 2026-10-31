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
        // K57: trägt der Stil eine Kappe (HAAR_KAPPE, das Volumen), sind die Strähnen ihr Rand — halbe Dichte
        var vol = Math.max(0.3, typeof d.hairVol === "number" ? d.hairVol : 1.0) * (HAAR_KAPPE[stil] ? 0.5 : 1);
        var len = Math.max(0.25, typeof d.hairLen === "number" ? d.hairLen : 1.0);
        // K57: die Kalotten-Schale IST die Haar-Kappe des Stils (die Strähnen wurzeln auf dem Volumen; vorher eine eigene
        // Schale, deren Vorderseite auf Stirnhöhe lag — die Strähnen stachen als Punkte aus der Stirn)
        var kap = haarKappe({ hairStyle: HAAR_KAPPE[stil] ? stil : "mittel" })[0];
        var K = kap.c, // Kalotten-Schale (Zentrum · Radius · Skala)
            KR = kap.r,
            KS = kap.sc;
        var N = [0, 0.28, -0.16], // Nacken-Schale
            NR = 0.36,
            NS = [0.9, 0.75, 0.7];
        var zi = function (n, l, extra) {
            var z = { teil: "head", c: K, r: KR, sc: KS, d: [0, -0.12, -0.85], n: Math.round(n * vol), l: l * len, t: 0.01 };
            if (extra) for (var k in extra) z[k] = extra[k];
            return z;
        };
        var nacken = function (n, l, extra) {
            var z = { teil: "head", c: N, r: NR, sc: NS, d: [0, -0.55, -0.6], n: Math.round(n * vol), l: l * len, t: 0.01 };
            if (extra) for (var k in extra) z[k] = extra[k];
            return z;
        };
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
                { teil: "head", c: [0, 0.42, -0.02], r: 0.5, sc: [0.95, 0.9, 0.95], radial: 1, d: [0, 0, 0], n: Math.round(1500 * vol), l: 0.2 * len, lj: 0.1, t: 0.01 },
                { teil: "head", c: [0, 0.42, -0.02], r: 0.56, sc: [0.95, 0.9, 0.95], radial: 1, d: [0, 0, 0], n: Math.round(700 * vol), l: 0.2 * len, lj: 0.12, t: 0.01 },
            ],
            zopf: [
                zi(900, 0.1, { d: [0, -0.35, -0.92] }), nacken(300, 0.09, { d: [0, -0.35, -0.92] }),
                { teil: "head", art: "quaste", c: [0, 0.68, -0.38], box: [0.16, 0.06, 0.1], d: [0, -1, -0.22], n: Math.round(240 * vol), l: 0.7 * len, lj: 0.55, t: 0.02 },
            ],
            dutt: [
                zi(900, 0.1, { d: [0, -0.35, -0.92] }), nacken(300, 0.09, { d: [0, -0.35, -0.92] }),
                { teil: "head", art: "knoten", c: [0, 0.81, -0.2], r: 0.2, sc: [1.1, 1.0, 0.9], d: [0, 0, 0], n: Math.round(420 * vol), l: 0.09 * len, lj: 0.06, t: 0.018 },
            ],
            undercut: [
                zi(420, 0.03),
                { teil: "head", c: [0, 0.58, -0.02], r: 0.4, sc: [0.9, 0.55, 0.95], d: [0.55, -0.5, -0.2], n: Math.round(550 * vol), l: 0.19 * len, lj: 0.12, t: 0.02 },
            ],
        };
        return STILE[stil] || STILE.mittel;
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
                        // darunter feuert kein Schritt-Burst; die Timbre-Tabelle
                        // wohnt im klang-Gesetzbuch SCHRITT_TIMBRE).
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
    var HAAR_LOOK = Object.freeze({
        tipRimPow: 3,
        tipRimFarbe: Object.freeze([0.35, 0.18, 0.05]),
        specPow: 8,
        specAmt: 0.3,
        specFarbe: Object.freeze([0.3, 0.15, 0.04]),
        wurzelAnker: 0.12,
    });

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
    // prettier-ignore
    var MENSCH_GESTALT = Object.freeze({
        hand: Object.freeze({ mass: 0.67, breite: 0.8 }),
        unterarm: Object.freeze({ breite: 0.66, tiefe: 0.8, bauch: 0.42 }),
        handgelenk: Object.freeze({ breite: 0.72, tiefe: 0.52 }),
        fuss: Object.freeze({ laenge: 0.9 }),
        kopf: Object.freeze({ mass: 0.75, breite: 0.86 }),
        auge: Object.freeze({ mass: 0.5, abstand: 0.8, pupille: 0.55, hoehle: 1.15, zurueck: 0.03, lid: Object.freeze([0.045, 0.035]),
            iris: Object.freeze({ hoch: 0.8, vor: 0.09 }), schatten: Object.freeze({ saum: 0.015, tief: 0.15 }),
            lidRand: Object.freeze({ saum: 0.06, tief: 0.25 }) }),
        schaedel: Object.freeze({ hoch: 0.08 }),
        ohr: Object.freeze({ mass: 0.755, tiefer: 0.082 }),
        augeRaster: Object.freeze({ w: 12, h: 8 }),
        gesicht: Object.freeze({ lippe: 0.55, lippeZurueck: 0.03, oberkiefer: 0.78, wange: 0.82, naseTiefer: 0.05,
            brauHoch: 0.028, kiefer: 0.72, kieferBreite: 0.78, kieferTiefe: 0.85, kinnZurueck: 0.04, unten: 0.84,
            mundTiefer: 0.035 }),
        rumpf: Object.freeze({ brustkorb: 0.52, nacken: 0.7 }),
        kopfHaut: Object.freeze({ vox: 0.026, blend: 0.055, mundSpalt: 0.45, hoehleSaum: 0.8, brauSaum: Object.freeze([0.05, 0.008]),
            brauBogen: 0.04, verdeckung: Object.freeze({ schritt: 0.05, stufen: 4, staerke: 2, frei: 0.97, oben: 1,
                kanal: Object.freeze([0.373, 1, 1]) }) }),
        handHaut: Object.freeze({ vox: 0.012, blend: 0.02 }),
    });
    // DAS SOLL in Zahlen (gate:mensch-anatomie, normiert auf die Körperhöhe Hk; Bänder um den erwachsenen Mann):
    // handL = Hand-Länge (Handgelenk bis Fingerspitze, 0,108 Hk) · handB = Mittelhand-Breite ohne Daumen (0,047) ·
    // handgelenk = Breite am Handgelenk (0,033) · unterarm = Unterarm-Breite / Oberarm-Breite (0,8–1,0) · kopfH = Kinn bis
    // Scheitel (0,13) · kopfB = Kopf-Breite ohne Ohren (0,086) · augenAbstand = Pupillen-Abstand (0,035) · augapfel
    // (0,0135) · iris (0,0066) · mund = Mund-Breite (0,028) · fuss = Fuß, Ferse bis Zeh (0,15).
    // prettier-ignore
    var MENSCH_SOLL = Object.freeze({
        handL: [0.1, 0.116], handB: [0.042, 0.053], handgelenk: [0.028, 0.04], unterarm: [0.78, 1.0],
        kopfH: [0.12, 0.138], kopfB: [0.078, 0.096], augenAbstand: [0.031, 0.039], augapfel: [0.012, 0.016],
        iris: [0.0058, 0.0076], mund: [0.025, 0.033], fuss: [0.135, 0.165],
    });
    // DAS SOLL DES KOPFES (K57, gate:mensch-anatomie KOPF): die Verhältnisse des Gesichts, nicht nur seine Größen —
    // gemessen am GEBACKENEN Kopf (Ofen L0: die Haut, die Augen, das Haar, wie die Welt sie zeichnet), normiert auf die
    // Kopfhöhe kH (Kinn bis Scheitel, ohne Haar). Anthropometrie des erwachsenen Mannes (Farkas-Normen: v–gn 232 mm,
    // en–en 33 mm, ex–en 30 mm, ch–ch 54 mm, IPD 63 mm, sa–sba 62 mm) und Farbmetrik der Lippe gegen die Wange (CIELAB):
    //   kopfAnteil = kH / Körperhöhe (Soll 1/7,5) · augenLinie = Augenmitte über dem Kinn / kH (die Augen auf halber
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
    //   Striche unter einem Bildpunkt).
    // prettier-ignore
    var KOPF_SOLL = Object.freeze({
        kopfAnteil: [0.127, 0.14], augenLinie: [0.45, 0.53], augenSpalt: [0.9, 1.25], mundZuPupille: [0.78, 1.0],
        ohrOben: [-0.02, 0.1], ohrUnten: [-0.06, 0.03], ohrLaenge: [0.23, 0.3], augenVorstand: [0.01, 0.035], augeFrei: [0.9, 1.0],
        lippeL: [-14, -4], lippeA: [4, 14], hoehleL: [-12, 0], hoehleA: [-2, 6], hautAlbedo: [0.05, 0.62],
        haarDeckung: [0.9, 1.0], kopfDreiecke: [0, 12000], haarLinie: 0.8,
        brauKontrast: [8, 80],
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
    // −11 → −13 (auf 6 m mischt jeder Bildpunkt des Munds die Wange hinein: −11 las −2,7 gegen die Wange, Soll ≤ −4)
    var KOPF_TON = Object.freeze({
        lippe: Object.freeze([-13, 13, 2]),
        hoehle: Object.freeze([-8, 5, 1]),
        braue: Object.freeze({ deckung: 0.75 }),
        mundLinie: Object.freeze([0.6, 0.2, 0.2]),
    });
    function _hexLab(hx) {
        var c = [(hx >> 16) & 255, (hx >> 8) & 255, hx & 255].map(function (v) {
            v /= 255;
            return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
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
    function haarKappe(d) {
        var t = HAAR_KAPPE[(d && d.hairStyle) || "mittel"];
        if (!t) return []; // glatze
        var P = labProportionen(),
            r = P.skullBaseR * 1.03,
            SH = MENSCH_GESTALT.schaedel.hoch;
        var sy = 1.12 + SH / (2 * r);
        return [{ c: [0, P.skullCY + SH / 2 + t[1], -t[2]], r: r, sc: [1 + t[0], sy + t[0], 1 + t[0]] }];
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
        return [(hx >> 16) & 255, (hx >> 8) & 255, hx & 255].map(function (v) {
            v /= 255;
            return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
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
            baseArmX = shoulderHW * 0.95;
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
        var waistMod = 0.76 + p.gender * 0.24;
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
            shell: {
                ribcage: function (b) {
                    return { x: b.x * shMod, y: b.y, z: b.z * (0.95 + p.gender * 0.05) };
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
                        x: b.x * (0.62 + p.gender * 0.38) * (1 + (torsoM - 1) * 0.1),
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
    function bauMensch(F) {
        const {H,headSeg,acromionY,nippleY,trochanterY,shoulderHW,hipHW,baseArmX,thighLen,calfLen,upperArmLen,forearmLen,skullBaseR,skullCY,skullRX,skullRY,skullRZ,eyeDist,jawW,chinW,browY,eyeY,cheekY,noseY,lipY:lipY0,chinY:chinY0,jawY:jawY0,hairlineY} = labProportionen();
        const matSkin = "skin", matJoint = "joint", matDark = "dark", matEye = "eye", matIris = "iris",
            matCornea = "cornea", matSocket = "socket", matShadow = "shadow", matLips = "lips", matHair = "hair", matPupil = "pupil";
        const parts = {}, base = {};
        const s = (r, m, sc) => F.kugel(r, m, sc);
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
        [-1,1].forEach(sd=>{const hipG=F.gruppe();hipG.position.set(sd*hipHW*0.8,trochanterY,0);reg('hip'+(sd===1?'1':'-1'),hipG);const qR=0.32;const quad=reg('quad'+(sd===1?'1':'-1'),s(qR,matSkin,[0.9,thighLen/(qR*2),0.9]));quad.position.set(0,-thighLen/2,0.1);hipG.add(quad);const vL=reg('vlat'+(sd===1?'1':'-1'),s(0.16,matSkin,[0.85,thighLen/0.41,0.9]));vL.position.set(sd*0.17,-thighLen/2,0.06);hipG.add(vL);const ad2=reg('adduct'+(sd===1?'1':'-1'),s(0.17,matSkin,[0.9,thighLen/0.6,0.85]));ad2.position.set(sd*-0.2,-thighLen/2,-0.02);hipG.add(ad2);const ham=reg('hamstring'+(sd===1?'1':'-1'),s(0.20,matSkin,[1,thighLen/0.40,0.9]));ham.position.set(0,-thighLen/2,-0.2);hipG.add(ham);const knee=reg('kneecap'+(sd===1?'1':'-1'),s(0.24,matJoint,[1.05,0.75,1.05]));knee.position.set(0,-thighLen,0.05);hipG.add(knee);const kneeG=F.gruppe();kneeG.position.set(0,-thighLen,0);hipG.add(kneeG);reg('knee'+(sd===1?'1':'-1'),kneeG);const cR=0.27;const calf=reg('calf'+(sd===1?'1':'-1'),s(cR,matSkin,[1,calfLen/(cR*2),0.8]));calf.position.set(0,-calfLen/2,-0.12);kneeG.add(calf);const shin=reg('shin'+(sd===1?'1':'-1'),s(0.16,matSkin,[1,calfLen/0.36,1]));shin.position.set(0,-calfLen/2,0.1);kneeG.add(shin);const aY=-calfLen;const ankleG=F.gruppe();ankleG.position.set(0,aY,0);kneeG.add(ankleG);reg('ankle'+(sd===1?'1':'-1'),ankleG);const ankleSphere=s(0.15,matJoint,[1.1,0.5,1]);ankleG.add(ankleSphere);const foot=F.gruppe();const heel=s(0.2,matSkin,[1.2,1,1.5]);heel.position.set(0,0,-0.15);foot.add(heel);const mid=s(0.25,matSkin,[0.8,0.6,1.5]);mid.position.set(0,-0.05,0.2);foot.add(mid);for(let i=0;i<5;i++){const tX=(i-2)*0.08,tZ=0.4+(i*0.02),tR=0.06-(i*0.005);const t1=s(tR,matSkin,[1.5,0.8,1.2]);t1.position.set(tX,-0.15,tZ);foot.add(t1);const t2=s(tR*0.8,matSkin,[1.5,0.8,1.2]);t2.position.set(tX,-0.15,tZ+0.15);foot.add(t2);}foot.position.set(0,-0.1,0.1);foot.scale.z=MENSCH_GESTALT.fuss.laenge;ankleG.add(foot);hipG.rotation.z=sd*0.05;character.add(hipG);});
        const ribcage=reg('ribcage',s(1.0,matSkin,[shoulderHW,1.2*MENSCH_GESTALT.rumpf.brustkorb,0.6]));ribcage.position.set(0,nippleY-trochanterY,0);torsoG.add(ribcage);
        const waist=reg('waist',s(0.5,matSkin,[1.14,1.0,0.5]));waist.position.set(0,(nippleY+trochanterY)/2-trochanterY,0);torsoG.add(waist);
        [-1,1].forEach(sd=>{const g=F.gruppe();const t1=s(0.5,matSkin,[0.8,0.6,0.3]);t1.position.set(sd*0.7,acromionY-0.5-trochanterY,-0.1);g.add(t1);const t2=s(0.4,matSkin,[0.6,0.6,0.3]);t2.position.set(sd*0.4,acromionY-1.0-trochanterY,-0.1);g.add(t2);const t3=s(0.3,matSkin,[0.4,0.6,0.3]);t3.position.set(sd*0.1,0.5,-0.1);g.add(t3);reg('lat'+(sd===1?'1':'-1'),g);torsoG.add(g);});
        const upperBack=reg('upperBack',s(0.8,matSkin,[1.15,0.8*MENSCH_GESTALT.rumpf.nacken,0.5]));upperBack.position.set(0,acromionY-0.2-trochanterY,-0.2);torsoG.add(upperBack);
        [-1,1].forEach(sd=>{const o=reg('oblique'+(sd===1?'1':'-1'),s(0.24,matSkin,[0.48,1.4,0.4]));o.position.set(sd*0.46,(nippleY+trochanterY)/2-trochanterY,0.08);torsoG.add(o);});
        const chestCore=reg('chest',s(0.5,matSkin,[1.8,1.0,0.8]));chestCore.position.set(0,nippleY+0.2-trochanterY,0.3);torsoG.add(chestCore);
        [-1,1].forEach(sd=>{const g=F.gruppe();const l=s(0.4,matSkin,[1.4,0.6,0.8]);l.position.set(sd*0.22,nippleY+0.2-trochanterY,0.35);l.rotation.z=sd*-0.2;g.add(l);const u=s(0.3,matSkin,[1.2,0.4,0.6]);u.position.set(sd*0.55,nippleY+0.6-trochanterY,0.32);u.rotation.set(0,sd*0.2,sd*0.4);g.add(u);reg('pec'+(sd===1?'1':'-1'),g);torsoG.add(g);});
        [-1,1].forEach(sd=>{const br=reg('breast'+(sd===1?'1':'-1'),s(0.32,matSkin,[1.0,1.05,1.0]));br.position.set(sd*0.27,nippleY+0.06-trochanterY,0.44);br.rotation.x=-0.12;torsoG.add(br);});
        const sternum=s(0.04,matDark,[0.4,2.5,0.5]);sternum.position.set(0,nippleY+0.1-trochanterY,0.38);torsoG.add(sternum);
        const absBase=reg('abs',s(0.5,matSkin,[0.8,1.6,0.4]));absBase.position.set(0,(nippleY+trochanterY)/2-trochanterY,0.3);torsoG.add(absBase);
        for(let i=0;i<4;i++){const y=(nippleY-0.1)-(i*0.2*headSeg)-trochanterY;const aL=s(0.11,matSkin,[1,1,0.8]);aL.position.set(-0.12,y-0.02,0.37);torsoG.add(aL);const aR=s(0.11,matSkin,[1,1,0.8]);aR.position.set(0.12,y-0.02,0.37);torsoG.add(aR);const tV=s(0.035,matDark,[0.22,0.6,0.5]);tV.position.set(0,y-0.04,0.4);torsoG.add(tV);const tH=s(0.03,matDark,[1.8,0.1,0.5]);tH.position.set(0,y+0.05,0.4);torsoG.add(tH);}
        [-1,1].forEach(sd=>{const t=reg('trap'+(sd===1?'1':'-1'),s(0.3,matSkin,[1.3,0.6,0.6]));t.position.set(sd*0.3,acromionY-trochanterY,-0.1);t.rotation.z=sd*0.2;torsoG.add(t);});
        const nSY=acromionY+0.02,nEY=acromionY+0.46,nH=nEY-nSY;const neckBase=reg('neckBase',c(0.125,0.155,0.13,matSkin));neckBase.position.set(0,nSY+0.06-trochanterY,0);torsoG.add(neckBase);const neckMain=reg('neckMain',c(0.10,0.12,nH*0.75,matSkin));neckMain.position.set(0,nSY+0.12+nH*0.375-trochanterY,0);torsoG.add(neckMain);const neckTop=c(0.10,0.11,0.05,matSkin);neckTop.position.set(0,nEY-0.025-trochanterY,0);torsoG.add(neckTop);const adamsApple=s(0.019,matSkin,[0.85,0.9,0.8]);adamsApple.position.set(0,nSY+0.16-trochanterY,0.06);torsoG.add(adamsApple);const nape=s(0.028,matSkin,[0.55,0.55,0.45]);nape.position.set(0,nSY+0.08-trochanterY,-0.04);torsoG.add(nape);
        [-1,1].forEach(sd=>{const scm=reg('scm'+(sd===1?'1':'-1'),c(0.026,0.042,nH*0.95,matSkin));scm.position.set(sd*0.06,nSY+nH*0.42-trochanterY,0.035);scm.rotation.z=sd*-0.18;scm.rotation.x=0.10;torsoG.add(scm);});   // sternocleidomastoideus: v-zug kiefer->drosselgrube
        [-1,1].forEach(sd=>{const tn=reg('tneck'+(sd===1?'1':'-1'),s(0.115,matSkin,[0.85,1.4,0.70]));tn.position.set(sd*0.17,nSY+0.06-trochanterY,-0.10);tn.rotation.z=sd*0.55;torsoG.add(tn);});   // nacken-trapez-bruecke: schliesst die harte hals->schulter-kante
        const nf1=reg('napeFill1',s(0.10,matSkin,[0.9,1.3,1.0]));nf1.position.set(0,5.10-trochanterY,-0.14);torsoG.add(nf1);   // HINTERHAUPT-NACKEN-FUELLER: harness-befund -- schaedelbasis hing 0.39-0.43 HINTER dem hals,
        const nf2=reg('napeFill2',s(0.08,matSkin,[0.85,1.1,0.95]));nf2.position.set(0,5.24-trochanterY,-0.15);torsoG.add(nf2);   // man sah von hinten unter den offenen schaedel ins leere. koerperfeld waechst jetzt hoch dagegen.
        [-1,1].forEach(sd=>{const cl=reg('clavicle'+(sd===1?'1':'-1'),c(0.07,0.05,0.55,matSkin));cl.position.set(sd*0.38,acromionY+0.08-trochanterY,0.08);cl.rotation.set(0,sd*0.2,sd*-0.5);torsoG.add(cl);});
        [-1,1].forEach(sd=>{const armG=F.gruppe();armG.position.set(sd*baseArmX,acromionY-trochanterY,0);reg('arm'+(sd===1?'1':'-1'),armG);const delt=reg('deltoid'+(sd===1?'1':'-1'),s(0.30,matSkin,[1,1.1,1]));armG.add(delt);const bic=reg('bicep'+(sd===1?'1':'-1'),s(0.26,matSkin,[0.9,upperArmLen/0.52,1]));bic.position.set(0,-upperArmLen/2,0.1);armG.add(bic);const tri=reg('tricep'+(sd===1?'1':'-1'),s(0.27,matSkin,[0.9,upperArmLen/0.54,0.9]));tri.position.set(0,-upperArmLen/2,-0.15);armG.add(tri);const uarm=reg('uarm'+(sd===1?'1':'-1'),s(0.23,matSkin,[1.0,upperArmLen/0.46,0.96]));uarm.position.set(0,-upperArmLen/2,-0.02);armG.add(uarm);const el=s(0.165,matJoint,[1,0.75,1]);el.position.set(0,-upperArmLen,0);armG.add(el);const elbowG=F.gruppe();elbowG.position.set(0,-upperArmLen,0);armG.add(elbowG);reg('elbow'+(sd===1?'1':'-1'),elbowG);const UA=MENSCH_GESTALT.unterarm,HG=MENSCH_GESTALT.handgelenk;const fa=reg('forearm'+(sd===1?'1':'-1'),s(0.24,matSkin,[1.2*UA.breite,forearmLen/0.48,UA.tiefe]));fa.position.set(sd*0.05,-forearmLen*UA.bauch,0);elbowG.add(fa);const wY=-forearmLen;const wr=s(0.14,matSkin,[HG.breite,0.5,HG.tiefe]);wr.position.set(sd*0.05,wY,0);elbowG.add(wr);
        const hk=MENSCH_GESTALT.hand.mass,hb=MENSCH_GESTALT.hand.breite;const hand=F.gruppe();hand.userData.sd=sd;hand.userData.fingers=[];hand.userData.thumbs=[];
        const palmG=F.gruppe();hand.add(palmG);hand.userData.palmG=palmG;reg('palm'+(sd===1?'1':'-1'),palmG);
        const palm=s(0.25*hk,matSkin,[hb,1.2,0.5]);palmG.add(palm);
        for(let i=0;i<4;i++){const fX=(i-1.5)*0.12*hk*hb,fZ=(0.1-Math.abs(i-1.5)*0.05)*hk;const fG=F.gruppe();fG.position.set(fX,-0.28*hk,fZ);fG.rotation.z=(i-1.5)*0.13;reg('fA'+i+'_'+(sd===1?'1':'-1'),fG);fG.add(s(0.08*hk,matSkin,[0.9*hb,0.8,0.9]));const f1=c(0.06*hk*hb,0.05*hk*hb,0.18*hk,matSkin);f1.position.y=-0.09*hk;fG.add(f1);const jG1=F.gruppe();jG1.position.set(0,-0.18*hk,0);reg('fB'+i+'_'+(sd===1?'1':'-1'),jG1);jG1.add(s(0.05*hk*hb,matSkin,[1.0,0.8,1.0]));const f2=c(0.05*hk*hb,0.04*hk*hb,0.14*hk,matSkin);f2.position.set(0,-0.07*hk,-0.01*hk);jG1.add(f2);const jG2=F.gruppe();jG2.position.set(0,-0.14*hk,-0.02*hk);reg('fC'+i+'_'+(sd===1?'1':'-1'),jG2);jG2.add(s(0.04*hk*hb,matSkin,[1.0,0.8,1.0]));const f3=c(0.04*hk*hb,0.03*hk*hb,0.1*hk,matSkin);f3.position.set(0,-0.05*hk,-0.04*hk);jG2.add(f3);jG1.add(jG2);fG.add(jG1);palmG.add(fG);hand.userData.fingers.push({mcp:fG,pip:jG1,dip:jG2});}
        const thumbG=F.gruppe();thumbG.position.set(-sd*0.3*hk*hb,-0.15*hk,0.1*hk);thumbG.rotation.set(0,sd*0.5,sd*-1.2);reg('tA_'+(sd===1?'1':'-1'),thumbG);thumbG.add(s(0.1*hk,matSkin,[0.8,1.5,0.8]));const thumbF1=c(0.06*hk,0.05*hk,0.12*hk,matSkin);thumbF1.position.y=-0.06*hk;thumbG.add(thumbF1);const thumbJG=F.gruppe();thumbJG.position.set(0,-0.12*hk,0);reg('tB_'+(sd===1?'1':'-1'),thumbJG);thumbJG.add(s(0.06*hk,matSkin,[0.8,0.8,0.8]));const thumbTip=c(0.05*hk,0.04*hk,0.08*hk,matSkin);thumbTip.position.y=-0.04*hk;thumbJG.add(thumbTip);thumbG.add(thumbJG);palmG.add(thumbG);hand.userData.thumbs.push({mcp:thumbG,ip:thumbJG});
        hand.position.set(sd*0.05,wY-0.3*hk,0);elbowG.add(hand);reg('hand'+(sd===1?'1':'-1'),hand);
        armG.rotation.z=sd*0.2;armG.rotation.x=0.05;armG.userData.baseRotZ=sd*0.2;armG.userData.baseRotX=0.05;torsoG.add(armG);});
        const headGroup=F.gruppe();headGroup.position.y=H-headSeg/2-trochanterY;reg('head',headGroup);var HEAD_S=MENSCH_GESTALT.kopf.mass,HEAD_B=MENSCH_GESTALT.kopf.breite;headGroup.scale.set(HEAD_S*HEAD_B,HEAD_S,HEAD_S);base.headPosY=H-headSeg/2-headSeg*0.20*(1-HEAD_S);const nY=noseY-MENSCH_GESTALT.gesicht.naseTiefer,bY=browY+MENSCH_GESTALT.gesicht.brauHoch;const UG=MENSCH_GESTALT.gesicht.unten,lipY=nY+(lipY0-nY)*UG-MENSCH_GESTALT.gesicht.mundTiefer,chinY=nY+(chinY0-nY)*UG,jawY=nY+(jawY0-nY)*UG;base.headPosY-=(chinY-chinY0)*HEAD_S;const SH=MENSCH_GESTALT.schaedel.hoch;   // loomis-pass: 5.7->6.6 koepfe; pivot-korrektur haelt das KINN auf hoehe (halsroehre!)
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

        return {
            character,
            parts,
            base,
            augen: { eyeL, eyeR, irisL, irisR, lidTL, lidTR, lidBL, lidBR, browL, browR, upperLipRef, lowerLipRef },
            // Drei un-registrierte Teile, die die Shell nach dem Bau weiter anfasst
            // (Hals-Deckel + Kehlkopf + Nacken — Anim/Outfit lesen sie direkt):
            extra: { neckTop: neckTop, adamsApple: adamsApple, nape: nape },
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
        character.scale.set(M.charScale.x,M.charScale.y,M.charScale.z);const MU=M.shell;function aply(m,sc){m.scale.set(sc.x,sc.y,sc.z);return sc;}if(parts.ribcage)parts.ribcage.userData.baseScaleY=aply(parts.ribcage,MU.ribcage(base.ribcage)).y;if(parts.pelvis)aply(parts.pelvis,MU.pelvis(base.pelvis));if(parts.waist)aply(parts.waist,MU.waist(base.waist));function pair(name,fn){[-1,1].forEach(sd=>{const k=name+(sd===1?'1':'-1');if(parts[k])fn(parts[k],base[k],sd);});}if(parts.abs)parts.abs.userData.baseScaleY=aply(parts.abs,MU.abs(base.abs)).y;pair('oblique',(m,b)=>aply(m,MU.oblique(b)));pair('glute',(m,b)=>aply(m,MU.glute(b)));pair('quad',(m,b)=>{m.userData.baseScaleY=aply(m,MU.quad(b)).y;});pair('hamstring',(m,b)=>aply(m,MU.hamstring(b)));pair('calf',(m,b)=>{m.userData.baseScaleY=aply(m,MU.calf(b)).y;});pair('bicep',(m,b)=>{m.userData.baseScaleY=aply(m,MU.bicep(b)).y;});pair('tricep',(m,b)=>aply(m,MU.tricep(b)));pair('uarm',(m,b)=>aply(m,MU.uarm(b)));pair('forearm',(m,b)=>aply(m,MU.forearm(b)));pair('deltoid',(m,b)=>aply(m,MU.deltoid(b)));pair('trap',(m,b)=>aply(m,MU.trap(b)));pair('lat',(m,b)=>aply(m,MU.lat(b)));if(parts.upperBack)aply(parts.upperBack,MU.upperBack(base.upperBack));if(parts.chest){var csc=aply(parts.chest,MU.chest(base.chest));parts.chest.userData.baseScaleX=csc.x;parts.chest.userData.baseScaleY=csc.y;parts.chest.userData.baseScaleZ=csc.z;}pair('pec',(m,b)=>aply(m,MU.pec(b)));pair('breast',(m,b)=>aply(m,MU.breast(b)));if(parts.neckMain)aply(parts.neckMain,MU.neck(base.neckMain));if(parts.neckBase)aply(parts.neckBase,MU.neck(base.neckBase));pair('scm',(m,b)=>aply(m,MU.neck(b)));pair('tneck',(m,b)=>aply(m,MU.neck(b)));if(parts.jaw)aply(parts.jaw,MU.jaw(base.jaw));if(parts.chin)aply(parts.chin,MU.chin(base.chin));pair('buccal',(m,b)=>aply(m,MU.buccal(b)));pair('cheekbone',(m,b)=>aply(m,MU.cheekbone(b)));pair('masseter',(m,b)=>aply(m,MU.masseter(b)));[-1,1].forEach(sd=>{const k='arm'+(sd===1?'1':'-1');if(parts[k]){parts[k].position.x=sd*baseArmX*M.armPose.xMul;const bz=sd*M.armPose.rotZ;const bx=M.armPose.rotX;parts[k].rotation.z=bz;parts[k].rotation.x=bx;parts[k].userData.baseRotZ=bz;parts[k].userData.baseRotX=bx;}});if(parts.head){parts.head.position.y=base.headPosY-trochanterY-M.headPose.ageDrop;parts.head.position.z=M.headPose.fwd;}
        return M;
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
            fahrer: Object.freeze({ werk: Object.freeze([7, 19]), mittagAmWerk: true }),
            nachtfahrer: Object.freeze({ werk: Object.freeze([7, 19]), mittagAmWerk: true, versatzH: 12 }),
        }),
        berufe: Object.freeze({ markt: 0.35, feld: 0.3, hof: 0.35 }),
    });
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
        klettern: Object.freeze({ reichM: 0.75, schwungSec: 0.32, abstandM: 0.32, griffUeberM: 0.5 }),
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
    function leibPlan(L, T, K, t, dt) {
        var G = leibGesetz();
        // DIE VERBEN AN DEN GERÄTEN führen, solange eines trägt (das Gerät hält den Leib — kein freier Antrieb)
        if (leibVerbTakt(L, T, K, t, dt)) return;
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
        var huefte = [sitzP[0], sitzP[1] + K.mass.sitzHuefteM, sitzP[2]];
        V.sitzP = sitzP;
        V.huefte = huefte;
        V.lage = _lageAusHuefte(K, huefte, a);
        V.phi = z.phi;
        V.gier = Math.atan2(-sg * W.armH[0], -sg * W.armH[2]); // der Blick zur Achse
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
    function _rutschen(L, T, K, t, dt, neu) {
        var V = L.leibVerb,
            a = V.ang;
        _merke(L, T);
        var P = leibRutschSchritt(V, a.bahn, K.g, dt);
        var huefte = [P.p[0], P.p[1] + K.mass.sitzHuefteM, P.p[2]];
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
                V.halt[gl] = _kletterAnker(a, gl, _kletterSoll(K, hu, n, s1, gl));
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
        if (a.oben && hu2[1] + M.schulterM > oberst + 0.1) {
            V.lage = _v3(a.oben);
            _verbEnde(L, 0, 0, 0, t);
            return true;
        }
        if (!a.oben && hu2[1] + M.schulterM + 0.3 > oberst) hu2[1] = oberst - M.schulterM - 0.3;
        hu2[1] = Math.max(unten, hu2[1]);
        var bewegt = _len(_sub(hu2, V.huefte));
        V.huefte = hu2;
        V.tempo = bewegt / dt;
        if (V.paar >= 0 && t - V.seitGlied >= VG.schwungSec) {
            V.halt[_PAARE[V.paar][0]] = V.ziel[_PAARE[V.paar][0]];
            V.halt[_PAARE[V.paar][1]] = V.ziel[_PAARE[V.paar][1]];
            V.paar = -1;
        }
        if (V.paar < 0 && bewegt > 0) {
            // der neue Tritt zielt auf die Lage am ENDE des Schwungs (der Leib steigt während des Umsetzens weiter) — sonst fällt der
            // Fuß je Zyklus um den Hub des Schwungs zurück, bis er unter der Reichweite des Beins an der Sprosse hängt; die Hand greift
            // schon an der Grenze ihrer Reichweite (griffUeberM), ihr Griff bleibt der der Lage von jetzt
            var huZ = _add(hu2, [s1[0] * vq * VG.schwungSec, vv * VG.schwungSec, s1[2] * vq * VG.schwungSec]);
            for (var kk = 0; kk < 2; kk++) {
                var pi = (V.zyklus + kk) % 2,
                    noetig = false,
                    ziele = {};
                for (var g2 = 0; g2 < 2; g2++) {
                    var gn = _PAARE[pi][g2],
                        soll = _kletterSoll(K, hu2, n, s1, gn),
                        ziel = _kletterAnker(a, gn, gn.charAt(0) === "f" ? _kletterSoll(K, huZ, n, s1, gn) : soll);
                    ziele[gn] = ziel;
                    if (_len(_sub(V.halt[gn], soll)) > VG.abstandM * 0.5 && _len(_sub(ziel, V.halt[gn])) > 1e-6) noetig = true;
                }
                if (noetig) {
                    V.paar = pi;
                    V.ziel = ziele;
                    V.von = { hand1: V.halt.hand1, "hand-1": V.halt["hand-1"], fuss1: V.halt.fuss1, "fuss-1": V.halt["fuss-1"] };
                    V.seitGlied = t;
                    V.zyklus = 1 - pi;
                    break;
                }
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
        if (V.wechsel) {
            var w = V.wechsel,
                s = Math.min(1, (t - w.seit) / w.dauer),
                e = 0.5 - 0.5 * Math.cos(Math.PI * s);
            V.hand[w.hand] = _add(_mix(w.von, w.ziel, e), [0, 0.1 * Math.sin(Math.PI * s), 0]);
            if (s >= 1) {
                V.hand[w.hand] = _v3(w.ziel);
                V.griff[w.hand] = w.griff;
                V.wechsel = null;
            }
        }
        var mitte = _mix(V.hand.hand1, V.hand["hand-1"], 0.5);
        // die Hüfte hängt unter der Mitte der Hände so tief, dass beide Arme reichen (die Hände liegen längs um ± halb auseinander)
        var halbW = Math.abs(_dot(_sub(V.hand.hand1, V.hand["hand-1"]), V.blick)) / 2;
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
    // DIE POSE DES RIGS an Land (Ruhe ×(1−w) und Gehen ×w, beide additiv über der neutralen Pose, die der Wirt setzt): das
    // Kontrapost mit Atem und der Emotion als Daten-Delta (mp/mref die Profile des Wirts, kalt null), die Beine auf dem Ziel des
    // Gang-Gesetzes (tetrapoda gangFuss, das Becken gangBecken, die Zwei-Knochen-IK), die Arme gegen die Beine, die Becken-Senke.
    // r = das Rig {hips, spine, chest, neck, head, armL/armR {shoulder, elbow, wrist}, legL/legR {hip, knee, ankle}} mit
    // THREE-Rotationen; M = die Bein-Maße (l1, l2, wpl, wz, L), Z = die Gang-Zeile der Welt-Schwere, TC = der tetrapoda-Kern.
    function leibRigPose(r, t, walkPhase, isMoving, gait, mp, mref, M, Z, TC) {
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
            add(r.armL.shoulder, "z", -0.19 * wi);
            add(r.armR.shoulder, "z", 0.17 * wi);
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
    // DIE KETTE DES LEIBS aus dem Skelett des Gusses ({joints:[{name, parent, pos, quat, scale}], root, handMitte}): die Ruhe-Lage
    // je Gelenk (relativ zum Eltern-Gelenk, Gelenk-Einheiten), die Skala der Wurzel (die Dials), die Mitte der Hand, die Sohle
    // und der Ballen des Fußes (labProportionen footBelowAnkle, Gang-Zeile ballen × Bein) — und die Maße des Leibs in Metern
    var KETTE_GELENKE = ["torso", "head", "arm1", "arm-1", "elbow1", "elbow-1", "hand1", "hand-1", "hip1", "hip-1", "knee1", "knee-1", "ankle1", "ankle-1"];
    // DIE SOHLE DES GEBAUTEN FUSSES (leib.K2 — die EINE Messung für Welt, Labor und Linse): [Spitze vor, Sohle unter, Ferse vor]
    // dem Knöchel im Knöchel-Raum der Bind-Pose — die Ecken der Haut, die der Knöchel trägt (Gewicht > 0,5, jede Haut unter `mesh`):
    // die vorderste Stelle der Unterkante (≤ 0,02 Maß über der tiefsten), die tiefste, die hinterste. Ein Fuß ohne Zehen-Gelenk
    // rollt über die Spitze seiner Sohle (die Welt: `_gaitRollung`). Die Rechnung ist die der THREE-Matrix (Spalten-Ordnung,
    // dieselbe Folge der Summen), ohne THREE: der Knöchel-Raum = boneInverse × bindMatrix × Ecke. null: keine Haut am Knöchel.
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
                pa = A.position;
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
    function leibKette(sk) {
        var J = {};
        for (var i = 0; i < sk.joints.length; i++) J[sk.joints[i].name] = sk.joints[i];
        if (!J[sk.root]) throw new Error("KERN-PFLICHT verletzt: das Skelett trägt keine Wurzel (leibKette)");
        for (var k = 0; k < KETTE_GELENKE.length; k++) if (!J[KETTE_GELENKE[k]]) throw new Error("KERN-PFLICHT verletzt: dem Skelett fehlt das Gelenk " + KETTE_GELENKE[k] + " (leibKette)");
        if (!sk.handMitte || !sk.handMitte.hand1 || !sk.handMitte["hand-1"]) throw new Error("KERN-PFLICHT verletzt: der Guss trägt keine Hand-Mitte (leibKette, Ofen L0)");
        var LP = labProportionen(),
            f = leibMassstab(),
            s = J[sk.root].scale,
            G = leibGesetz().gang;
        var bein = _len(J.knee1.pos) + _len(J.ankle1.pos);
        var K = { J: J, root: sk.root, skala: s, f: f, handMitte: sk.handMitte, fussUnter: LP.footBelowAnkle, ballenZ: G.ballen * bein };
        var hY = J.hip1.pos[1];
        var schulterY = J.torso.pos[1] + J.arm1.pos[1];
        var unterarm = _len(_add(J.hand1.pos, sk.handMitte.hand1));
        K.mass = {
            huefteM: (bein + LP.footBelowAnkle) * s[1] * f,
            schulterM: (schulterY - hY) * s[1] * f,
            schulterBreiteM: Math.abs(J.torso.pos[0] + J.arm1.pos[0]) * s[0] * f,
            reichM: (_len(J.elbow1.pos) + unterarm) * s[1] * f,
            sitzHuefteM: 0.1,
            wandM: 0.3,
            fussM: (G.ballen * bein + 0.2) * s[2] * f,
        };
        K.mass.griffHoeheM = K.mass.huefteM + K.mass.schulterM + K.mass.reichM;
        return K;
    }
    // die Welt-Lage → der Rahmen der Wurzel (Gelenk-Einheiten vor ihrer Skala)
    function _inWurzel(R, p) {
        var d = _qRot(_qInv(R.q), _sub(p, R.p));
        return [d[0] / (R.f * R.s[0]), d[1] / (R.f * R.s[1]), d[2] / (R.f * R.s[2])];
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
        var q = _qBasis(ua, rn, ut, wn);
        var ende = _add(S, _qRot(Qp, _qRot(q, ra)));
        return { q: q, phi: phi, fehler: _len(_sub(ende, G)), ende: ende };
    }
    // P: {wurzel:{p (Welt, m), gier, nick, roll} | huefte:[x,y,z] (Welt, m) statt p, rumpf:{x,y,z}, kopf:{x,y,z}, haende:{hand1:[…]
    // Welt | null, "hand-1"}, fuesse:{fuss1:{p:[…] Welt (der Ballen), nick} | null, …}, pol:{hand1:[…] Wurzel-Rahmen, …}, arme:{arm1:
    // {x,z,ell} lokal}, beine:{hip1:{x,z,knie,fuss}}} → {wurzel:{p, q}, q:{gelenk: [x,y,z,w]}, fehler:{hand1: m, …}}
    function leibPose(K, P) {
        var J = K.J,
            s = K.skala,
            f = K.f;
        var Qr = _qGier(P.wurzel.gier || 0, P.wurzel.nick || 0, P.wurzel.roll || 0);
        var hM = _mul(_add(J.hip1.pos, J["hip-1"].pos), 0.5);
        var o = P.wurzel.huefte ? _sub(P.wurzel.huefte, _qRot(Qr, [hM[0] * s[0] * f, hM[1] * s[1] * f, hM[2] * s[2] * f])) : _v3(P.wurzel.p);
        var R = { p: o, q: Qr, f: f, s: s };
        var out = { wurzel: { p: o, q: Qr }, q: {}, fehler: {} };
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
            var ziel = P.haende && P.haende[hand];
            if (ziel) {
                var c = _add(J[hand].pos, K.handMitte[hand]);
                var pol = (P.pol && P.pol[hand]) || [sv * 0.8, -1, -0.4];
                var gl = _glied(S, Qt, J[ell].pos, c, _inWurzel(R, ziel), pol, -1, 2.5);
                out.q[arm] = gl.q;
                out.q[ell] = _qAchse([1, 0, 0], -gl.phi);
                out.fehler[hand] = gl.fehler * f * s[1];
            } else {
                var aa = (P.arme && P.arme[arm]) || { x: 0, z: sv * 0.08, ell: 0.15 };
                out.q[arm] = _qEuler(aa.x || 0, 0, aa.z || 0);
                out.q[ell] = _qAchse([1, 0, 0], -(aa.ell || 0));
            }
            out.q[hand] = J[hand].quat.slice();
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
                out.q[hip] = glb.q;
                out.q[knie] = _qAchse([1, 0, 0], glb.phi);
                out.q[fuss] = _qMul(_qInv(_qMul(glb.q, out.q[knie])), Rf);
                out.fehler["fuss" + sd] = glb.fehler * f * s[1];
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
        rutschHuefte: -1.35,
        rutschKnie: 0.25,
        // das Balancieren: die Arme abgespreizt, die Füße auf der Linie (die Hüfte adduziert um die halbe Hüft-Breite)
        balanceArm: 1.25,
        // die Füße auf der Bahn der Rutsche: der Ballen rutschVor voraus und rutschBallen über dem Blech, die Zehen auf (rutschFuss)
        rutschVor: 0.78,
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
            // im Schwung öffnet sich der greifende Arm zum Griff über der Schulter (≤ 80° gebeugt)
            "klettern:1": { knie: [0, 130], huefte: [-30, 100], ellbogen: [0, 150], schulter: [20, 180], ellbogenMin: [0, 80] },
            "klettern:2": { knie: [0, 130], huefte: [-30, 100], ellbogen: [0, 150], schulter: [20, 180], ellbogenMin: [0, 80] },
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
    // DAS URTEIL GEGEN DAS SOLL (die EINE Prüfung der Bewegung): die Messung m — zeilen {"verb:phase": {w: {knieL: [min, max], …}}},
    // geraete {name: {posen, hand, handWo, fuss, fussWo}}, tempo {…}, doppel, wand — gegen VERB_SOLL; je Verstoß ein Satz beim
    // Namen (leer: die Bewegung hält ihr Soll). Jede gemessene Phase trägt ihr Soll, jedes Soll seine Messung (beide Seiten).
    function leibSollUrteil(m) {
        var S = VERB_SOLL,
            out = [],
            key,
            k;
        var band = function (name, x, b, tol) {
            if (!Number.isFinite(x)) return out.push(name + " nicht messbar");
            if (x < b[0] - tol || x > b[1] + tol) out.push(name + " " + +x.toFixed(3) + " außerhalb [" + b[0] + ", " + b[1] + "]");
        };
        for (key in m.zeilen) if (!S.winkel[key]) out.push(key + ": gemessen, aber ohne Soll (VERB_SOLL.winkel)");
        for (key in S.winkel) {
            var z = m.zeilen[key];
            if (!z) {
                out.push(key + ": nicht gemessen (Vorbedingung)");
                continue;
            }
            for (k in S.winkel[key]) {
                var art = /Max$/.test(k) ? 1 : /Min$/.test(k) ? 0 : -1,
                    basis = k.replace(/(Max|Min)$/, ""),
                    b = S.winkel[key][k];
                ["L", "R"].forEach(function (seite) {
                    var x = z.w[basis + seite];
                    if (!x) return out.push(key + " " + basis + seite + ": nicht messbar");
                    if (art >= 0) band(key + " " + basis + seite + (art ? " Spitze" : " Tiefpunkt"), x[art], b, 0.5);
                    else if (x[0] < b[0] - 0.5 || x[1] > b[1] + 0.5) out.push(key + " " + basis + seite + " " + x[0].toFixed(0) + "…" + x[1].toFixed(0) + "° außerhalb [" + b[0] + ", " + b[1] + "]");
                });
            }
        }
        for (var n in m.geraete) {
            var G = m.geraete[n];
            if (!G.posen) out.push(n + ": das Verb begann nicht (Vorbedingung)");
            if (G.hand > S.hand) out.push(n + ": die Hand " + (G.hand * 100).toFixed(1) + " cm vom Anker (" + G.handWo + ", Soll ≤ " + S.hand * 100 + " cm)");
            if (G.fuss > S.fuss + 1e-9) out.push(n + ": der Fuß " + (G.fuss * 100).toFixed(1) + " cm im Gerät (" + G.fussWo + ")");
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
                beine: { hip1: { x: VP.sitzHuefte, z: 0.06, knie: knie, fuss: 0.2 }, "hip-1": { x: VP.sitzHuefte, z: -0.06, knie: knie, fuss: 0.2 } },
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
                wurzel: { huefte: V.huefte, gier: V.gier, nick: 0 },
                rumpf: { x: 0.15 },
                haende: haende,
                pol: { hand1: [1, -1, -0.5], "hand-1": [-1, -1, -0.5] },
                beine: { hip1: { x: VP.sitzHuefte + 0.25, z: 0.08, knie: kn, fuss: 0.1 }, "hip-1": { x: VP.sitzHuefte + 0.25, z: -0.08, knie: kn, fuss: 0.1 } },
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
                wurzel: { huefte: V.huefte, gier: V.gier, nick: VP.rutschLehne - VP.rutschLehneNeig * neig },
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
                if (V.paar >= 0 && (_PAARE[V.paar][0] === gl || _PAARE[V.paar][1] === gl)) {
                    var e = Math.min(1, (t - V.seitGlied) / VERB_GESETZ.klettern.schwungSec),
                        ee = 0.5 - 0.5 * Math.cos(Math.PI * e);
                    pz = _add(_mix(V.von[gl], V.ziel[gl], ee), _mul(n, 0.1 * Math.sin(Math.PI * e)));
                }
                if (gl.charAt(0) === "h") haende[gl] = pz;
                else fu[gl] = { p: _add(pz, _add([0, VP.trittH, 0], _mul(n, VP.trittVor))), nick: VP.trittNick, pol: [0, 0.3, 1] };
            }
            return leibPose(K, {
                wurzel: { huefte: V.huefte, gier: V.gier, nick: 0.12 },
                rumpf: { x: 0.05 },
                kopf: { x: -0.35 },
                haende: haende,
                fuesse: fu,
                pol: { hand1: [0.8, -1, -0.5], "hand-1": [-0.8, -1, -0.5] },
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
            r.armL.shoulder.rotation.z += -VP.balanceArm;
            r.armR.shoulder.rotation.z += VP.balanceArm;
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

    // ── Der Namensraum (Vertrag v1.1 §7 + §8 MESHFREI) ──
    root.__koerperCore = {
        VERSION: VERSION,
        labProportionen: labProportionen,
        labMorph: labMorph,
        labLandmarks: labLandmarks,
        bauMensch: bauMensch,
        morphAuf: morphAuf,
        MATERIAL_KLASSEN: MATERIAL_KLASSEN,
        HAUT_LOOK: HAUT_LOOK,
        HAAR_LOOK: HAAR_LOOK,
        MENSCH_GESTALT: MENSCH_GESTALT,
        MENSCH_SOLL: MENSCH_SOLL,
        KOPF_SOLL: KOPF_SOLL,
        kopfToene: kopfToene,
        haarKappe: haarKappe,
        // mensch.K4 — die Schnitte mit Volumen (je Stil die Kappe): die Gestalten einer Siedlung wählen aus ihnen
        HAAR_KAPPE: HAAR_KAPPE,
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
        leibVerbTakt: leibVerbTakt,
        leibSchaukelSchritt: leibSchaukelSchritt,
        leibWippeSchritt: leibWippeSchritt,
        leibRutschSchritt: leibRutschSchritt,
        leibGeraetAusschwingen: leibGeraetAusschwingen,
        leibGangBlend: leibGangBlend,
        leibZweiKnochen: leibZweiKnochen,
        leibGangTakt: leibGangTakt,
        leibRigPose: leibRigPose,
        leibKette: leibKette,
        leibSohle: leibSohle,
        leibPose: leibPose,
        leibVerbPose: leibVerbPose,
        leibLuftPose: leibLuftPose,
    };
})(typeof self !== "undefined" ? self : globalThis);
