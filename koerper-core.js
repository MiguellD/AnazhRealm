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
                },
            },
        };
    })();


    // ════════════════════════════════════════════════════════════════════
    // ALTLASTEN-NULL HERZ (V18.449) — DIE EINE ANATOMIE-QUELLE.
    // Die humanoiden LANDMARKEN (8-Kopf-Stationen, Referenz-vermessen; die
    // eine Quelle, die Rig + Metaball-Haut + Werkstatt lesen) wohnen im
    // Anatomie-Gesetzbuch (diesem Kern), nicht im Stamm. Reine Mathe ->
    // Stationen/joint()-Ableser; MESHFREI §8. Der Stamm DELEGIERT hierher.
    // (Verbatim aus dem Stamm gewandert — byte-gleicher Guss, Batterie-belegt.)
    // ════════════════════════════════════════════════════════════════════
    function landmarks(g) {
        g = g || {};
        const sex = Math.max(0, Math.min(1, g.sex != null ? g.sex : 0)); // 0 mask. V-Taper, 1 weibl. Sanduhr
        const build = Math.max(0, Math.min(1, g.build != null ? g.build : 0.52)); // 0 schlank · 0.5 athlet. · 1 schwer
        const muscle = Math.max(0, Math.min(1, g.muscle != null ? g.muscle : Math.min(1, build + 0.18))); // Glied-Masse
        const headRatio = Math.max(0.8, Math.min(1.4, g.headRatio != null ? g.headRatio : 1.0)); // Alter/Heroik
        const limbF = 0.82 + muscle * 0.6; // Glied-Durchmesser-Faktor
        const girthF = 0.92 + build * 0.34; // Rumpf-Girth
        const bellyF = build * build * 0.5; // Bauch-Vorwölbung (quadratisch)
        const mF = 0.85 + muscle * 0.55; // Muskel-Fülle
        // 8-Kopf-Stationen (Sohle y=0) + Breiten (Halbachsen) — Referenz-vermessen:
        const shoulderHalf = 1.12 - sex * 0.27; // Schulter ~2.2 KH (Referenz-breit) → schmaler (weibl.)
        const waistHalf = 0.72 - sex * 0.05; // Taille (eingezogen)
        const hipHalf = 0.76 + sex * 0.18; // Becken: schmal (mask. V) → breit (weibl.)
        const hipY = 4.15,
            waistY = 5.0,
            shoulderY = 6.5;
        // benannte Gelenk-Knoten: die Mittellinien-Kette (Rig) + die paarigen Glied-Knoten (Haut+Rig).
        const joint = (name, s) => {
            s = s || 1;
            switch (name) {
                case "hips":
                    return [0, hipY, 0];
                case "spine":
                    return [0, waistY, 0];
                case "chest":
                    return [0, shoulderY - 0.5, 0];
                case "neck":
                    return [0, shoulderY + 0.12, 0];
                case "head":
                    return [0, 7.2, 0];
                case "headTop":
                    return [0, 7.95, 0];
                case "shoulder":
                    return [s * shoulderHalf, shoulderY - 0.1, 0]; // Schulter-Gelenk (Arm-Ursprung, im Deltoid)
                case "elbow":
                    return [s * (shoulderHalf + 0.4), waistY + 0.1, 0];
                case "wrist":
                    return [s * (shoulderHalf + 0.6), hipY - 0.3, 0];
                case "hand":
                    return [s * (shoulderHalf + 0.6), hipY - 0.62, 0.05]; // Knöchel-Reihe (Skinning-Ende)
                case "hip":
                    return [s * hipHalf * 0.72, hipY - 0.1, -0.12]; // Hüft-Gelenk (Schenkel-Ursprung)
                case "knee":
                    return [s * 0.4, 2.3, 0];
                case "ankle":
                    return [s * 0.38, 0.4, 0];
                case "foot":
                    return [s * 0.38, 0.2, 0.56]; // Zehen-Ballen (vorn)
                // ── Muskel-Ansatz-Landmarken (Ursprung/Ansatz — „geführt über die Gelenke") ──
                case "sternumTop":
                    return [0, 6.0, 0.32 * girthF]; // Manubrium (obere Brust-Front)
                case "sternumLow":
                    return [0, 5.4, 0.34 * girthF];
                case "xiphoid":
                    return [0, 5.0, 0.34 * girthF];
                case "navel":
                    return [0, 4.32, 0.36 * girthF];
                case "pubis":
                    return [0, 3.85, 0.2 * girthF];
                case "c7":
                    return [0, 6.85, -0.16 * girthF]; // Nacken-Basis hinten
                case "sacrum":
                    return [s * 0.13, 4.15, -0.34 * girthF];
                case "erectorTop":
                    return [s * 0.13, 6.2, -0.34 * girthF];
                case "mastoid":
                    return [s * 0.19, 7.28, -0.05]; // Warzenfortsatz hinterm Ohr
                case "cheek":
                    return [s * 0.3 * headRatio, 7.46, 0.16 * headRatio];
                case "jawAngle":
                    return [s * 0.29 * headRatio, 7.12, 0.04 * headRatio];
                case "clavicleMed":
                    return [s * 0.12, 6.42, 0.2 * girthF];
                case "acromion":
                    return [s * shoulderHalf * 1.04, 6.62, 0]; // Schulter-Spitze
                case "scapula":
                    return [s * shoulderHalf * 0.64, 6.05, -0.34 * girthF];
                case "axilla":
                    return [s * shoulderHalf * 0.82, 5.95, -0.14 * girthF]; // Achsel (Lat/Teres-Ansatz)
                case "deltoidIns":
                    return [s * shoulderHalf * 1.06, 5.85, 0]; // Deltoid-Tuberositas (Humerus-Mitte)
                case "pecIns":
                    return [s * shoulderHalf * 0.88, 6.0, 0.12 * girthF]; // Pec-Ansatz (Humerus vorn)
                case "shoulderFront":
                    return [s * shoulderHalf, 6.3, 0.14 * limbF]; // Bizeps-Ursprung
                case "shoulderBack":
                    return [s * shoulderHalf, 6.3, -0.14 * limbF]; // Trizeps-Ursprung
                case "elbowFront":
                    return [s * (shoulderHalf + 0.4), 5.05, 0.12 * limbF];
                case "elbowBack":
                    return [s * (shoulderHalf + 0.4), 5.08, -0.13 * limbF]; // Olecranon (Trizeps-Ansatz)
                case "iliac":
                    return [s * hipHalf * 0.95, 4.42, 0.02 * girthF]; // Darmbeinkamm
                case "iliacBack":
                    return [s * hipHalf * 0.62, 4.3, -0.32 * girthF]; // Becken hinten (Glute/Lat-Ursprung)
                case "ischium":
                    return [s * hipHalf * 0.52, 3.9, -0.3 * girthF]; // Sitzbein (Hamstring-Ursprung)
                case "hipFront":
                    return [s * hipHalf * 0.66, 4.0, 0.12 * girthF]; // Quad-Ursprung (vorn)
                case "thighInner":
                    return [s * 0.22, 3.1, 0.02]; // innerer Oberschenkel (Adduktor-Ansatz)
                case "kneeFront":
                    return [s * 0.4, 2.36, 0.14 * girthF]; // Patella (Quad/Tibialis)
                case "kneeBack":
                    return [s * 0.4, 2.36, -0.16 * girthF]; // Kniekehle (Hamstring/Gastroc)
                case "shinTop":
                    return [s * 0.4, 2.05, -0.1 * girthF]; // oberer Schienbein hinten (Soleus)
                case "ankleFront":
                    return [s * 0.38, 0.58, 0.1 * girthF]; // Knöchel vorn (Tibialis-Ansatz)
                case "heel":
                    return [s * 0.38, 0.3, -0.22]; // Fersenbein (Achilles/Gastroc-Ansatz)
                // ── Glied-Vollkachelung (Vastus/Brachialis/Extensoren/Peroneus) + Schulter-Kappe ──
                case "kneeOut":
                    return [s * (0.4 + 0.18 * limbF), 2.4, 0.06 * girthF]; // äußeres Knie (Vastus lateralis-Ansatz)
                case "kneeIn":
                    return [s * (0.4 - 0.14 * limbF), 2.5, 0.1 * girthF]; // inneres Knie / „Tropfen" (Vastus medialis)
                case "shinOut":
                    return [s * (0.38 + 0.16 * limbF), 1.2, 0.04 * girthF]; // äußerer Unterschenkel (Peroneus)
                case "upperArmOut":
                    return [s * (shoulderHalf + 0.46), 5.4, 0]; // außen-mittlerer Oberarm (Brachialis)
                case "forearmBack":
                    return [s * (shoulderHalf + 0.62), hipY - 0.32, -0.12 * limbF]; // dorsales Handgelenk (Extensoren)
                case "humerusTop":
                    return [s * shoulderHalf * 1.02, 6.42, 0]; // Humeruskopf-Scheitel (Schulter-Kappen-Brücke)
                default:
                    return [0, 0, 0];
            }
        };
        return {
            sex,
            build,
            muscle,
            headRatio,
            limbF,
            girthF,
            bellyF,
            mF,
            shoulderHalf,
            waistHalf,
            hipHalf,
            hipY,
            waistY,
            shoulderY,
            joint,
        };
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

    // ── Der Namensraum (Vertrag v1.1 §7 + §8 MESHFREI) ──
    root.__koerperCore = {
        VERSION: VERSION,
        landmarks: landmarks,
        labProportionen: labProportionen,
        labMorph: labMorph,
        labLandmarks: labLandmarks,
        DIAL_MAP: DIAL_MAP,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        MESHFREI: MESHFREI,
        PRESETS: PRESETS,
        PARAMS_BY_KIND: { koerper: PARAMS },
        // Die Lab-Quellen (die Shell liest DIESE eine Quelle — Aliasse):
        START_PARAMS: START_PARAMS,
        MOTION: MOTION,
    };
})(typeof self !== "undefined" ? self : globalThis);
