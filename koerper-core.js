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

    // ── DAS HUMANOIDE SKELETT-GESETZ (der Muskel-Atlas, verbatim aus dem Stamm gewandert,
    //    ULTRAGUSS U7): ein aufrechter Zweibeiner aus 8-Kopf-Proportionen — Rippenkorb,
    //    Hand-Fächer, Fuß/Zehen, die gelenk-verankerte MUSC-Tabelle + der COVERAGE-Pass. Reine
    //    Daten (kein THREE, kein `this`). Liest die EINE Landmark-Quelle (`landmarks` oben) —
    //    dieselbe, die das Skinning-Rig liest (kein Parallel-Pfad, V9.82). Der Host bleibt der
    //    OFEN (bake-core-Isosurface baut die Haut über diesen parts).
    function humanSkeleton(g) {
        g = g || {};
        const kh = g.kh || 1; // Kopfhöhe als Einheit
        const bodyMat = g.bodyMat || "fleisch";
        const limbMat = g.limbMat || bodyMat;
        const headMat = g.headMat || "knochen";
        const bodyCol = g.bodyColor;
        const limbCol = typeof g.limbColor === "number" ? g.limbColor : bodyCol;
        // GENOM-ACHSEN + 8-Kopf-PROPORTIONEN kommen aus der EINEN gemessenen Landmark-Quelle
        // (`_humanoidLandmarks`) — DIESELBE, die das Skinning-Rig liest (kein Parallel-Pfad, V9.82).
        // build (schlank↔schwer) · muscle (Glied-Masse) · headRatio (Alter/Heroik). Die Stationen
        // überlappen physik-erhaltend (die Haut verschmilzt sie). shoulderHalf/waistHalf/hipHalf +
        // hipY/waistY/shoulderY + mF (Muskel-Fülle) sind hier mit-destrukturiert (eine Quelle).
        const {
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
            joint: J,
        } = landmarks(g);
        const parts = [];
        const add = (shape, material, x, y, z, sx, sy, sz, rot, col, extra) => {
            const p = {
                shape,
                material,
                position: { x: x * kh, y: y * kh, z: z * kh },
                size: { x: sx * kh, y: sy * kh, z: sz * kh },
            };
            if (rot && (rot.x || rot.y || rot.z)) p.rotation = rot;
            if (typeof col === "number") p.color = col;
            if (extra) Object.assign(p, extra);
            parts.push(p);
            return p;
        };
        // ein gegliedertes Glied A→B als getaperte Kapsel: rotation.z bildet die lokale +y-
        // Achse auf (dx,dy) ab (xy-Frontalebene — aufrechte Glieder mit lateraler Auslenkung).
        // Die Länge schließt die runden Caps ein (+diam·0.8) → das Glied überlappt seine
        // Gelenke (die smin-Verschmelzung der Metaball-Haut).
        // DAS VERBINDUNGS-GESETZ (3D): die lokale +y-Achse auf eine BELIEBIGE Richtung (dx,dy,dz)
        //   abbilden — NICHT nur die Frontalebene (der alte `limb` ignorierte dz → vorwärts-Glieder
        //   wurden als vertikale Stäbe gezeichnet, GEMESSEN die Wurzel des „zehen falsch"). Aus den
        //   zwei Achsen-Gesetzen vereint: rotZ schwenkt in der XY-Ebene, rotX kippt nach vorn/hinten.
        //   Reduziert korrekt auf den alten `limb` (dz=0) UND `segBetween` (dx=0). Jetzt KENNT jede
        //   Verbindung ihre volle Richtung — ein Knochen/Muskel weiss, welche zwei Knoten er spannt.
        const aimRot = (dx, dy, dz) => ({ x: Math.atan2(dz, dy), y: 0, z: Math.atan2(-dx, Math.hypot(dy, dz)) });
        const limb = (ax, ay, az, bx, by, bz, diam, mat, col, extra) => {
            const dx = bx - ax,
                dy = by - ay,
                dz = bz - az;
            const len = Math.hypot(dx, dy, dz) || 0.01;
            add(
                "limb",
                mat || limbMat,
                (ax + bx) / 2,
                (ay + by) / 2,
                (az + bz) / 2,
                diam,
                len + diam * 0.8,
                diam,
                aimRot(dx, dy, dz),
                typeof col === "number" ? col : limbCol,
                extra
            );
        };
        // DAS MUSKEL-GESETZ („Fasern wie Federn über Knoten", Schöpfer-Vision): ein Muskel SPANNT zwei
        //   Skelett-Knoten (Ursprung A → Ansatz B). Seine SPINDEL-Form (fusiform — dünn an den Sehnen-
        //   Enden, dick am Bauch) + die volle 3D-Orientierung EMERGIEREN aus der Verbindung; die Masse
        //   wird NICHT mehr gewürfelt. `bulge` = halbe Bauchdicke (Querschnitt), `belly` verschiebt den
        //   dicksten Punkt (0.5 = Mitte; <0.5 = proximal). Ein Ellipsoid mit size.y=Länge/2 IST die
        //   Spindel (spitz an den Polen = die Sehnen, dick am Äquator = der Bauch).
        const musk = (ax, ay, az, bx, by, bz, bulge, opts) => {
            opts = opts || {};
            const dx = bx - ax,
                dy = by - ay,
                dz = bz - az;
            const len = Math.hypot(dx, dy, dz) || 0.01;
            const t = opts.belly != null ? opts.belly : 0.5; // Lage des Bauchs entlang A→B
            const cx = ax + dx * t,
                cy = ay + dy * t,
                cz = az + dz * t;
            return add(
                "sphere",
                opts.mat || bodyMat,
                cx,
                cy,
                cz,
                bulge,
                len * 0.5 + bulge * 0.25,
                bulge * (opts.depth || 1),
                aimRot(dx, dy, dz),
                opts.col != null ? opts.col : bodyCol,
                Object.assign({ def: true, kScale: opts.kScale != null ? opts.kScale : 0.8 }, opts.extra || {})
            );
        };
        // ── PROPORTIONEN (8-Kopf, Sohle y=0): shoulderHalf/waistHalf/hipHalf + hipY/waistY/shoulderY
        //    kommen aus _humanoidLandmarks (oben destrukturiert) — die EINE Quelle. ──
        // ── (1) RUMPF — eine vertikale Kette aus Stationen mit glatten BREITE- UND TIEFE-
        //    Profilen (wie der Kreatur-Leib): die V-/Sanduhr-Silhouette UND die Körper-TIEFE
        //    (Brustkorb tief, Taille schmaler) EMERGIEREN aus den Profilen — kein Wespentaillen-
        //    Kink durch diskrete Blöcke, kein Brett. Stationen überlappen (smin verschmilzt). ──
        const lerpCP = (cps, t) => {
            if (t <= cps[0][0]) return cps[0][1];
            for (let i = 1; i < cps.length; i++)
                if (t <= cps[i][0]) {
                    const f = (t - cps[i - 1][0]) / (cps[i][0] - cps[i - 1][0]);
                    return cps[i - 1][1] + (cps[i][1] - cps[i - 1][1]) * f;
                }
            return cps[cps.length - 1][1];
        };
        // Breite (Halbachse x): Hüfte → Taille (schmal) → Schulter (breit). t: 0=Becken … 1=Schulter
        const widthCP = [
            [0, hipHalf * 0.84 * girthF],
            [0.16, hipHalf * girthF],
            [0.42, waistHalf * girthF],
            [0.66, shoulderHalf * 0.9 * girthF],
            [0.86, shoulderHalf * (1 + muscle * 0.1)], // breitester Punkt (Akromion)
            [1, shoulderHalf * 0.58], // KLAVIKULA verjüngt zum Hals → die Schulterlinie FÄLLT ab (kein flaches Regal)
        ];
        // Tiefe (Halbachse z): Becken tief → Taille schmaler → Brustkorb am TIEFSTEN → Schulter flach;
        // bellyF wölbt die Taille bei schwerem Build vor (der Bauch).
        const depthCP = [
            [0, (0.46 + bellyF * 0.5) * girthF],
            [0.42, (0.34 + bellyF) * girthF],
            [0.66, 0.58 * girthF], // Brustkorb am TIEFSTEN (kein Brett-Profil)
            [1, 0.32 * girthF],
        ];
        const torsoBaseY = 3.8,
            torsoTopY = 6.62,
            NT = 9;
        // ── (1) RUMPF-SKELETT (ANATOMISCH: Brustkorb + Bauch + Wirbelsäule statt flacher Stationen) —
        //    die Silhouette EMERGIERT aus Knochen (Brustkorb/Becken) + Fleisch (Bauch/Muskeln):
        //    breiter Ei-Brustkorb → schmale Lende → breites Becken = der V-/Sanduhr-Taper, anatomisch.
        void lerpCP;
        void widthCP;
        void depthCP;
        void NT;
        void torsoBaseY;
        void torsoTopY;
        // BRUSTKORB (thorax, knochen): das Ovoid — WIDER als TIEF und nur die OBERE Rumpf-Hälfte
        //    (kein kugel-rundes Barrel, GEMESSEN: war 1.81×1.58×1.23 ≈ ein Ei über den ganzen Rumpf
        //    bis in den Hals). Jetzt ein flacheres, kürzeres Brust-Ovoid, das zur Taille tapert.
        add("box", "knochen", 0, 5.6, 0.04 * girthF, shoulderHalf * 1.32, 0.98, 0.76 * girthF, null, limbCol, {
            kScale: 0.96,
            bodyRole: "chest",
            struct: true,
        });
        // RIPPEN (costae, knochen, dünn, IM Brustkorb-Ovoid): horizontale Bänder, die das Ovoid als
        //    echten RIPPENKORB lesen lassen (Referenz). Schmaler oben + unten (Ei-Form), breit Mitte,
        //    flach in der Tiefe (kein Barrel).
        for (let rb = 0; rb < 6; rb++) {
            const ry = 4.92 + rb * 0.26; // sechs Rippen-Ebenen (über die Brustkorb-Höhe verteilt)
            const tt = (rb + 0.5) / 6;
            const rw = shoulderHalf * (0.92 + 0.42 * Math.sin(tt * Math.PI)); // Ei: Mitte am breitesten
            const rd = (0.58 + 0.24 * Math.sin(tt * Math.PI)) * girthF; // flacher als breit
            add("box", "knochen", 0, ry, 0.05 * girthF, rw, 0.11, rd, null, limbCol, { kScale: 0.5, struct: true });
        }
        // BRUSTBEIN (sternum, knochen): vordere Mittel-Platte → die Brust-Front + Sternum-Linie.
        add("box", "knochen", 0, 5.46, 0.32 * girthF, shoulderHalf * 0.5, 0.82, 0.16, null, limbCol, {
            kScale: 0.66,
            struct: true,
        });
        // BAUCH (abdomen): die tiefe Rumpf-Muskel-/Viszeral-Masse = die TAILLE (Rectus/Obliques liegen
        //    als Relief darüber). def → rendert als Muskel, kein halbtransparentes Fleisch (Parallelpfad).
        add("box", bodyMat, 0, 4.7, -0.02 * girthF, waistHalf * 1.5, 1.12, 0.58 * girthF, null, bodyCol, {
            kScale: 0.92, // FLACHER Taillen-Sockel (war 0.84 tief/rund = ein Bauch-Ball, der das Sixpack schluckte) — jetzt liegt der Rectus als Relief darauf
            def: true,
        });
        // WIRBELSÄULE (spine, knochen) — die Rücken-Säule mit S-KURVE (Lende VOR · Brust ZURÜCK · Hals VOR):
        //    der Rücken curve, kein Brett. Drei Segmente, je z-versetzt.
        add("box", "knochen", 0, 4.5, -0.24 * girthF, 0.36, 1.05, 0.24 * girthF, null, limbCol, {
            kScale: 0.58,
            struct: true,
        }); // Lende (lumbar, vor)
        add("box", "knochen", 0, 5.72, -0.42 * girthF, 0.32, 1.4, 0.22 * girthF, null, limbCol, {
            kScale: 0.58,
            struct: true,
        }); // Brust (thoracic, zurück)
        add("box", "knochen", 0, 6.95, -0.07 * girthF, 0.3, 1.2, 0.22 * girthF, null, limbCol, {
            kScale: 0.54,
            struct: true,
        }); // Halswirbelsäule (cervical) — REICHT JETZT bis zum Schädel (verband den schwebenden Kopf)
        // GESÄSS — ZWEI Glute-Massen hinter dem Becken (statt EINER brückenden Platte, die die
        // Oberschenkel zu einem Rock verschmolz, GEMESSEN am Avatar-Render): links/rechts mit
        // Mittel-Spalt → das Gesäß liest ALS Gesäß UND der Spalt zwischen den Schenkeln öffnet
        // sich. Symmetrisch → das V18.209-Symmetrie-Template bleibt unverbogen; der smin rundet.
        for (const s of [-1, 1])
            add(
                "sphere",
                bodyMat,
                s * hipHalf * 0.44,
                hipY - 0.18, // HÖHER (war hipY-0.44 → hing als „poo" tief herab); das Gesäß sitzt auf Becken-Höhe
                -0.52 * girthF, // klar HINTER dem Becken (die Gesäß-Masse)
                hipHalf * 0.62 * girthF,
                0.66,
                0.46 * girthF,
                null,
                bodyCol,
                {
                    kScale: 0.92,
                    def: true, // Gluteus = MUSKEL (rot), kein halbtransparentes Fleisch (kein Parallelpfad zum Atlas-Gluteus)
                }
            );
        // ── MUSKEL-RELIEF + LANDMARK-SCHÄRFE (lebendiger-koerper §2½ — der Torso liest als KÖRPER,
        //    nicht als Schlauch): Muskel-Massen ∝ muscle-Achse, an den Landmarken knochen-scharf
        //    (kScale<1) → das Feld trägt weiche Bäuche UND scharfe Kanten (BEDINGUNG ii). bodyMat
        //    → Rumpf-/tag-treu (der Avatar-Tag liegt in der separaten Soul-bodyParts-Liste). ──
        // mF (Muskel-Fülle) kommt aus _humanoidLandmarks (oben destrukturiert) — die EINE Quelle.
        // KLAVIKEL (Schlüsselbein, knochen) — die SCHARFE horizontale Gräte, die die Schulter-Breite
        //    VORN trägt (mit Skapula+Deltoid, da der Brustkorb schmaler ist) + den Hals→Brust-Übergang.
        add("box", "knochen", 0, shoulderY + 0.02, 0.04 * girthF, shoulderHalf * 1.04, 0.13, 0.16, null, limbCol, {
            kScale: 0.94,
        }); // KLAVIKEL — eine SOLIDE verbindende Gräte (Hals↔Schulter): kräftiger (0.13/0.16 statt 0.08/0.09) + breiter kScale 0.94 + NICHT MEHR `struct` → der COVERAGE-Shrink (×0.54/×0.5) machte sie so dünn, dass sie bei res 176 die Verbindung verlor („Schlüsselbein nicht verbunden", Schöpfer-Befund). Bridged jetzt robust + res-unabhängig; kScale 0.94 hält sie als sanften Grat (kein poking Bar)
        // SCHULTERBLÄTTER (scapula, knochen) — zwei Platten am oberen Rücken: formen den oberen Rücken
        //    + die hintere Schulter UND geben der Achsel ihre Kante (fehlten → die Achsel verklebte).
        for (const s of [-1, 1])
            add(
                "box",
                "knochen",
                s * shoulderHalf * 0.58,
                shoulderY - 0.5,
                -0.24 * girthF,
                shoulderHalf * 0.56,
                0.88,
                0.24 * girthF,
                null,
                limbCol,
                {
                    kScale: 0.62,
                    struct: true, // Schulterblatt sitzt jetzt INNEN (z −0.24 statt −0.4) → Trapez/Lat bilden die Rücken-Oberfläche, der Knochen poked nicht mehr nackt vor
                }
            );
        // PECTORALIS / DELTOID / LAT / TRAPEZ / SCM / Arm- + Bein-Muskeln kommen jetzt aus dem
        //    MUSKEL-ATLAS (unten, vor dem COVERAGE-PASS) — EINE gelenk-verankerte Baugruppe, kein
        //    Streu-Tweak. RECTUS/OBLIQUES/SERRATUS/ERECTOR bleiben parametrische Loops (schon anchored).
        // RECTUS ABDOMINIS — der SIXPACK: zwei Säulen (links/rechts der Linea alba) × drei Reihen,
        // jede eine vorgewölbte Masse mit knochig-tightem kScale → der Anatomie-Detail-Pass schnitzt
        // die Linea-alba-Mittelrinne + die queren Sehnen-Furchen aus den SPALTEN dazwischen (die
        // Furche emergiert aus der Anatomie, nicht gemalt). Protrudiert vorn über den Basis-Leib.
        // RECTUS ABDOMINIS — das Sixpack EMERGIERT aus den zwei KNOTEN, die es spannt (Xiphoid/untere
        //   Rippen → Schambein): die drei Sehnen-Päckchen INTERPOLIEREN über dem Nabel, nicht auf feste
        //   y gewürfelt (Schöpfer: „die Dinge wissen nicht, was sie verbinden" — wie bei den Zehen).
        //   Die kScale-Furchen schnitzen Linea alba + Querfurchen; ein unteres Segment Nabel→Schambein.
        const absMF = 0.9 + muscle * 0.5;
        const xiphoidY = 5.45, // HÖHER (war 5.0): der Rectus reicht jetzt bis unter die Pecs (kein Bauch-Loch unter der Brust, Schöpfer-Befund „Bauchmuskelposition")
            navelY = 4.32,
            pubisY = 3.78; // die Knoten des Rectus
        const absZ = 0.46 * girthF; // die Päckchen sitzen PROUD auf dem flachen Sockel (sichtbares Relief)
        for (const sx of [-1, 1]) {
            for (let row = 0; row < 3; row++) {
                const f = (row + 0.5) / 3; // 0..1 Nabel→Xiphoid
                const ay = navelY + (xiphoidY - navelY) * f;
                const aw = (0.24 - row * 0.012) * absMF; // obere Päckchen leicht breiter; zwei klare Säulen (Linea alba in der Mitte)
                add("box", bodyMat, sx * 0.21, ay, absZ, aw, 0.21, 0.14 * girthF, null, bodyCol, {
                    kScale: 0.56,
                    def: true,
                }); // weicher (war 0.42 = scharfe Riss-Furche) → das Sixpack liest als sanfte Muskel-Schatten, kein Crack (PBR-Haut)
            }
            add(
                "box",
                bodyMat,
                sx * 0.19,
                (navelY + pubisY) * 0.5,
                absZ,
                0.22 * absMF,
                0.3,
                0.13 * girthF,
                null,
                bodyCol,
                { kScale: 0.6, def: true }
            ); // unteres Bauch-Segment (Nabel→Schambein), weicher Merge
        }
        // OBLIQUES / „ADONIS"-V-LINIE — seitliche Bauch-Massen, die zur Leiste hin taper.
        for (const sx of [-1, 1])
            add(
                "box",
                bodyMat,
                sx * 0.42,
                4.74,
                0.3 * girthF,
                0.2 * mF,
                0.92,
                0.24 * girthF,
                { x: 0, y: 0, z: sx * 0.12 },
                bodyCol,
                {
                    kScale: 0.78,
                    def: true,
                }
            );
        // (LATISSIMUS / TERES → MUSKEL-ATLAS unten)
        // SERRATUS ANTERIOR — die finger-artigen Muskel-Slips auf den unteren SEITLICHEN Rippen (unter
        //    dem Pectoralis, verzahnt mit den Obliques): DIE Signatur eines definierten, schlanken
        //    Rumpfes (Referenz-Front, fehlte mir komplett). Drei kleine schräge Massen je Seite, nach
        //    vorn-unten gerichtet, progressiv tiefer + medialer (das Reissverschluss-Muster der Slips).
        for (const s of [-1, 1])
            for (let k = 0; k < 3; k++)
                add(
                    "box",
                    bodyMat,
                    s * (shoulderHalf * 0.52 - k * 0.04),
                    5.42 - k * 0.2,
                    0.32 * girthF,
                    0.11 * mF,
                    0.14,
                    0.18 * girthF,
                    { x: 0, y: 0, z: -s * 0.3 },
                    bodyCol,
                    {
                        kScale: 0.62, // weicher (war 0.5) → Serratus-Slips als sanfte Wellen, kein scharfer Riss
                        def: true,
                    }
                );
        // ERECTOR SPINAE — zwei Rücken-Säulen entlang der Wirbelsäule (protrudieren am Rücken); der
        // Detail-Pass schnitzt die RÜCKEN-RINNE = das Tal zwischen ihnen (die Wirbelsäulen-Furche),
        // die Signatur des Rücken-Blicks deiner Referenz. Plus ein Trapez-Keil im oberen Rücken.
        for (const s of [-1, 1])
            add("box", bodyMat, s * 0.13, 5.05, -0.36 * girthF, 0.17 * mF, 1.95, 0.15 * girthF, null, bodyCol, {
                kScale: 0.74,
                def: true,
            });
        // ── (2) HALS + KOPF — der Kopf SITZT über den Schultern (kein Vorragen), als CLUSTER:
        //    Schädel (rund, zentriert) + Hinterkopf/Occiput (füllt die Nacken-Kerbe) + Kiefer
        //    (gibt das Kinn + die Gesichts-Ebene). So eine echte Kopf-Form statt eines Eis;
        //    der Hals vertikal + schlank thront ihn (kein offener Ring im Nacken). ──
        const hr = headRatio; // Kopf-Cluster skaliert mit der Alter/Heroik-Achse
        limb(0, shoulderY - 0.12, -0.02, 0, 7.22, -0.04, 0.54 * (0.96 + muscle * 0.25), bodyMat, bodyCol, {
            def: true,
            kScale: 0.95,
        }); // Hals — KRÄFTIGER (war 0.46) + kürzer → sturdy, kein Giraffen-Hals; trägt den Kopf, verschmilzt glatt mit Trapez/Brust
        // (STERNOCLEIDOMASTOIDEUS → MUSKEL-ATLAS unten)
        // SCHÄDEL — ein sauberes OVOID: EIN Cranium-Dome deckt Scheitel UND Hinterkopf (Occiput) in einer
        //    glatten Form (war Kugel + separater Occiput-Bump = „Schädel komisch"); höher als breit + leicht
        //    nach hinten (menschliche Kopf-Proportion). Der Kiefer hängt vorn-unten = die Gesichts-Ebene.
        add("sphere", headMat, 0, 7.6, -0.08, 0.66 * hr, 0.8 * hr, 0.74 * hr, null, limbCol, {
            bodyRole: "head",
            eyeFront: 0.85,
        }); // Cranium (Scheitel + Occiput in EINEM Dome)
        add("box", headMat, 0, 7.16, 0.14, 0.42 * hr, 0.36 * hr, 0.42 * hr, null, limbCol, { kScale: 0.72 }); // Kiefer/Kinn (definiert, vorn-unten)
        for (const s of [-1, 1])
            add("box", headMat, s * 0.3 * hr, 7.48, 0.2 * hr, 0.14 * hr, 0.16 * hr, 0.2 * hr, null, limbCol, {
                kScale: 0.58,
            }); // JOCHBEIN (Wangenknochen)
        // GESICHTS-RELIEF IM SCHÄDEL-FELD (der Profi-Weg: Nase/Brauen EMERGIEREN aus dem Metaball,
        // statt als Mr.-Potato-Head-Teile aufgeklebt zu werden — die verschmelzen nicht): ein
        // Brauen-Wulst + ein Nasen-Rücken, die der smin in die Gesichts-Ebene einschmilzt.
        add("box", headMat, 0, 7.66, 0.28, 0.48 * hr, 0.09 * hr, 0.16 * hr, null, limbCol); // Brauen-Wulst (verschmolzen, schmaler)
        // NASE — eine DEFINIERTE Nase (war flach): schmaler Rücken (Brauen→Mitte, leicht vor) +
        //   vorspringende runde SPITZE + Flügel-Basis (Breite). Der smin schmilzt sie in die Gesichts-Ebene.
        add("box", headMat, 0, 7.5, 0.34, 0.07 * hr, 0.22 * hr, 0.13 * hr, { x: -0.14, y: 0, z: 0 }, limbCol, {
            kScale: 0.58,
        }); // Nasen-Rücken (schmal, vorgeneigt)
        add("sphere", headMat, 0, 7.37, 0.43, 0.1 * hr, 0.09 * hr, 0.12 * hr, null, limbCol, { kScale: 0.52 }); // Nasen-SPITZE (rundet klar vor)
        add("box", headMat, 0, 7.34, 0.36, 0.17 * hr, 0.08 * hr, 0.1 * hr, null, limbCol, { kScale: 0.58 }); // Nasen-Flügel/Basis (Breite)
        // ── GESICHTS-MUSKEL-SCHICHT (Écorché: rote Mienenmuskeln über dem beigen Schädel) ──
        //    Dünne, schädel-anliegende Fleisch-Blätter (def → rot), die der smin in die Gesichts-Ebene
        //    einschmilzt — KEINE aufgeklebten Tropfen, geringe z-Halbweite. Augen-Partie bleibt FREI.
        //    Befund (Fischer, Kopf-Detailshot): diskrete Pads = Googly-Blobs, kein Referenz-Gesicht.
        //    Nur FLACHE, schädel-anliegende Blätter, die der smin in die Gesichts-Ebene einschmilzt;
        //    die Augenhöhle bleibt eine MULDE aus der Schädel-Form (Brauen + Jochbein), kein Pad-Ring.
        // KOPF-FUNDAMENT = sauberer SCHÄDEL (Knochen) mit nur einem DÜNNEN Gesichts-Hint (skel zeigt
        //    diskrete Massen als Blobs → die feine Gesichtsmuskel-Schicht der Referenz gehört in den
        //    Merge-Pass). Ein flacher Frontalis + eine dünne Wangen-/Schläfen-Fläche je Seite, schädel-
        //    anliegend (geringe z-Tiefe), Augenhöhle frei.
        // GESICHTS-MUSKELN (Referenz: dünne Schicht über der Schädel-Front, dem Gesichts-Relief folgend) —
        //    DETAIL statt flacher Schale: alle DÜNN + schädel-anliegend (kein vorstehender Blob), die
        //    Augenhöhle bleibt als Mulde FREI (Brauen+Jochbein rahmen sie), die Schädel-KUPPE oben blank.
        // GESICHTS-WEICHTEIL (PBR-realistisch, KEIN Écorché-Striping): dünne schädel-anliegende
        //   Fleisch-Füllungen, die der smin GLATT einschmilzt — non-def (kein seamGroove-Furchen-RISS
        //   mehr → das war die „Krater"-Wurzel am Kiefer/Wange) + hoher kScale (weicher Merge). Wange/
        //   Stirn/Schläfe runden das Gesicht zu glatter Haut; die Augenhöhle bleibt eine Mulde
        //   (Brauen+Jochbein-Knochen rahmen sie). Ein Gesicht ist Haut, keine geflayte Muskel-Wand.
        add("box", limbMat, 0, 7.74, 0.3, 0.4 * hr, 0.12 * hr, 0.07 * hr, null, limbCol, { kScale: 0.92 }); // Stirn-Fülle (glatt)
        add("box", limbMat, 0, 7.12, 0.35, 0.14 * hr, 0.1 * hr, 0.09 * hr, null, limbCol, { kScale: 0.92 }); // Mund-/Lippen-Umgebung (glatt)
        for (const s of [-1, 1]) {
            add("box", limbMat, s * 0.45 * hr, 7.58, 0.08, 0.07 * hr, 0.24 * hr, 0.24 * hr, null, limbCol, {
                kScale: 0.94,
            }); // Schläfe/Seitenkopf (füllt glatt, kein Loch)
            add("box", limbMat, s * 0.31 * hr, 7.18, 0.2 * hr, 0.15 * hr, 0.24 * hr, 0.15 * hr, null, limbCol, {
                kScale: 0.92,
            }); // Wange (voll, glatt)
        }
        // (MASSETER → MUSKEL-ATLAS unten)
        // ── (3) ARME (A-Pose: Ellbogen auf Nabel-, Handgelenk auf Schritthöhe; distal dünner) ──
        for (const s of [-1, 1]) {
            const shX = s * shoulderHalf * 1.0,
                shY = shoulderY + 0.08; // Schulter höher + weiter aussen → das Glied fällt fast senkrecht, die ACHSEL öffnet sich unter dem Deltoideus
            // (DELTOIDEUS / TRAPEZIUS → MUSKEL-ATLAS unten — gelenk-verankert)
            const elbowX = s * (shoulderHalf + 0.4),
                elbowY = waistY + 0.1;
            const wristX = s * (shoulderHalf + 0.6),
                wristY = hipY - 0.3; // Handgelenk TIEFER → der Unterarm ~so lang wie der Oberarm (war 0.68× → stämmig/kurz, Schöpfer „arme nicht sauber")
            limb(shX, shY - 0.18, 0, elbowX, elbowY, 0, 0.37 * limbF, limbMat, limbCol, { def: true, kScale: 0.95 }); // Oberarm — VOLLER Muskel-Kern (war 0.32, Arme zu dünn); Bizeps/Trizeps als Relief darüber
            // (BIZEPS / TRIZEPS / UNTERARM-MUSKEL → MUSKEL-ATLAS unten — gelenk-verankert)
            limb(elbowX, elbowY, 0, wristX, wristY, 0, 0.29 * limbF, limbMat, limbCol, { def: true, kScale: 0.95 }); // Unterarm — VOLLER (war 0.24); taper zum Handgelenk via die Hand
            // ── ARM-KNOCHEN (das starre Gerüst + die GELENK-PUNKTE = die Rig-Bones, ein Gerüst zwei
            //    Zwecke: Form UND Animation): dünne knochen-Schäfte IM Fleisch (inneres Gerüst, unsichtbar
            //    in der Haut) + Gelenk-Knöpfe an Schulter/Ellbogen/Handgelenk (die T-Knochen-Enden, die
            //    an den Landmarken die Haut bony machen UND die Animations-Achse markieren).
            limb(shX, shY - 0.18, 0, elbowX, elbowY, 0, 0.17 * limbF, "knochen", limbCol); // Humerus-Schaft
            limb(elbowX, elbowY, 0, wristX, wristY, 0, 0.15 * limbF, "knochen", limbCol); // Radius/Ulna-Schaft
            add("sphere", "knochen", shX, shY - 0.06, -0.04, 0.3 * limbF, 0.3 * limbF, 0.3 * limbF, null, limbCol, {
                kScale: 0.72,
                struct: true,
            }); // Humeruskopf — struct → tritt zurück (kein nackter Schulter-Knopf), die Schulter-Kappe deckt ihn
            add("sphere", "knochen", elbowX, elbowY, 0, 0.26 * limbF, 0.27 * limbF, 0.24 * limbF, null, limbCol, {
                kScale: 0.6,
            }); // Ellbogen-Kondylen
            add("sphere", "knochen", wristX, wristY, 0, 0.21 * limbF, 0.19 * limbF, 0.18 * limbF, null, limbCol, {
                kScale: 0.6,
            }); // Handwurzel (Handgelenk)
            add("box", "knochen", elbowX, elbowY + 0.02, -0.1, 0.24 * limbF, 0.3, 0.2, null, limbCol, { kScale: 0.5 }); // OLECRANON (scharfer Ellbogen, knochen)
            // HAND — sauberer KNOCHEN-FÄCHER nach der Referenz (blankes Skelett): Retinaculum-Band am
            //    Handgelenk → Karpus-Block → fächernde Mittelhand-Knochen → Finger mit ZWEI Phalangen
            //    (proximal+distal) und Gelenken, leicht nach vorn gekrümmt → Daumen opponiert. Ein
            //    SCHLANKER Fleisch-Handrücken gibt der geskinnten Hand Volumen ohne die Finger zu verweben.
            const hw = wristX + s * 0.02;
            add("box", limbMat, wristX, wristY - 0.02, 0.02, 0.22 * limbF, 0.07, 0.2 * limbF, null, limbCol, {
                kScale: 0.72,
            }); // Retinaculum (Sehnen-Manschette am Handgelenk)
            add("box", "knochen", hw, wristY - 0.17, 0.04, 0.24 * limbF, 0.13, 0.13 * limbF, null, limbCol, {
                kScale: 0.5,
                struct: true,
            }); // Karpus (Handwurzel-Block — Basis des Fächers)
            add("box", limbMat, hw, wristY - 0.22, 0.03, 0.27 * limbF, 0.17, 0.1, null, limbCol, { kScale: 0.86 }); // Handrücken-Fleisch (dünn) — die Knochen-Finger bleiben als eigene Glieder (hohe Auflösung löst sie auf), kein Mitt
            const knuckY = wristY - 0.36; // Knöchel-Reihe (Metacarpalköpfe)
            for (let f = 0; f < 4; f++) {
                const sp = f - 1.5; // -1.5 … 1.5 (vier Finger, fächern symmetrisch)
                const baseX = hw + sp * 0.05 * limbF; // Mittelhand-Basis am Karpus (eng)
                const kx = hw + sp * 0.082 * limbF; // Knöchel-Reihe ENGER (kein Spinnen-Spreizen), Finger liegen natürlich beisammen
                const kz = 0.06 + Math.abs(sp) * 0.014; // die Knöchel-Reihe bogt leicht vor
                limb(baseX, wristY - 0.18, 0.03, kx, knuckY, kz, 0.05 * limbF, "knochen", limbCol); // Mittelhand-Knochen (Metacarpus, fächert)
                add("sphere", "knochen", kx, knuckY, kz, 0.05 * limbF, 0.05 * limbF, 0.05 * limbF, null, limbCol, {
                    kScale: 0.42,
                }); // Knöchel-Gelenk (Metacarpalkopf)
                const fl = (f === 1 || f === 2 ? 0.34 : 0.28) * limbF; // Mittel-/Zeigefinger länger
                const tipX = kx + sp * 0.025 * limbF;
                const midY = knuckY - fl * 0.56,
                    midZ = kz + fl * 0.42; // Mittelgelenk (krümmt nach vorn)
                limb(kx, knuckY, kz, tipX, midY, midZ, 0.042 * limbF, "knochen", limbCol); // Proximal-Phalange
                add("sphere", "knochen", tipX, midY, midZ, 0.038 * limbF, 0.038 * limbF, 0.038 * limbF, null, limbCol, {
                    kScale: 0.4,
                }); // Fingermittelgelenk
                limb(tipX, midY, midZ, tipX, midY - fl * 0.46, midZ + fl * 0.28, 0.035 * limbF, "knochen", limbCol); // Distal-Phalange (Fingerspitze)
                // FLEISCH-FINGER (der Profiweg): ein Fleisch-Sleeve über dem Knochen — Mittelhand-Strahl +
                //   Finger (Knöchel→Spitze), dick genug, dass jeder Finger als EINZELNER fleischiger Finger
                //   auflöst (kein dünner Knochen-Stab, kein zur Mitt verschmolzener Klumpen).
                limb(baseX, wristY - 0.16, 0.03, kx, knuckY + 0.02, kz, 0.08 * limbF, limbMat, limbCol, {
                    kScale: 0.82,
                }); // Mittelhand gefleischt (VOLLER → deckt den Knochen, kein Klauen-Stab)
                limb(kx, knuckY + 0.02, kz, tipX, midY - fl * 0.46, midZ + fl * 0.28, 0.078 * limbF, limbMat, limbCol, {
                    kScale: 0.8,
                }); // Finger-Fleisch (deutlich voller → löst als fleischiger Finger auf statt Spike/Klaue)
            }
            // DAUMEN — opponiert: Mittelhand abduziert (zur Körpermitte + vorn) + zwei Glieder mit Gelenk.
            const thbBaseX = hw - s * 0.03,
                thbX = hw - s * 0.17,
                thbY = wristY - 0.13;
            limb(thbBaseX, wristY - 0.08, 0.08, thbX, thbY, 0.2, 0.055 * limbF, "knochen", limbCol); // Daumen-Mittelhand (abduziert)
            add("sphere", "knochen", thbX, thbY, 0.2, 0.045 * limbF, 0.045 * limbF, 0.045 * limbF, null, limbCol, {
                kScale: 0.42,
            }); // Daumen-Grundgelenk
            limb(thbX, thbY, 0.2, thbX - s * 0.04, thbY - 0.17, 0.31, 0.042 * limbF, "knochen", limbCol); // Daumen-Glied (distal)
            limb(thbBaseX, wristY - 0.06, 0.08, thbX - s * 0.04, thbY - 0.17, 0.31, 0.068 * limbF, limbMat, limbCol, {
                kScale: 0.82,
            }); // Daumen FLEISCH (Sleeve über dem Knochen)
        }
        // (GLUTEUS MAXIMUS → MUSKEL-ATLAS unten — gelenk-verankert)
        // ── (4) BEINE (Oberschenkel/Unterschenkel gegliedert; Fuß mit FERSE + Spann, kein Latschen) ──
        // STAND-BREITE: die Beine weit genug AUSEINANDER, dass der innere Spalt > die smin-Blend-
        // breite k bleibt — sonst verschmilzt das Feld beide Beine zu EINER Säule (gemessen die
        // Wurzel des „kein Spalt zwischen den Oberschenkeln"). Ein natürlicher schmaler Stand.
        for (const s of [-1, 1]) {
            const hipX = s * (hipHalf * 0.72),
                kneeX = s * 0.4, // Femur winkelt EINWÄRTS (breite Hüfte → Knie über dem Fuß): die echte Bein-Achse, schließt den Groin-Spalt zur natürlichen Leiste statt zweier Säulen
                ankleX = s * 0.38;
            limb(hipX, hipY - 0.1, -0.12, kneeX, 2.3, 0, 0.58 * limbF, limbMat, limbCol, { def: true, kScale: 0.95 }); // Oberschenkel — tiefer Muskel-Kern; Quad/Hamstring/Vastus/Adduktor liegen als Relief darüber (kein nacktes Fleisch)
            // GROIN/ADDUKTOR — EINE zentrierte Masse (nur einmal) füllt die Leiste zu einem GLATTEN
            // Schoß: zwei symmetrische Massen erzeugen eine Mittellinien-Mulde, die der Schärfe-Pass
            // zur „Doppel-Beule" vertieft — eine einzige mittige Masse hat keine Mittel-Naht. Weich.
            // ── BECKEN-KNOCHEN (knochen = scharfe Union, die STRUKTUR): die Schenkel sockeln daran,
            //    das Gewebe drapiert darüber. FEHLTE komplett → die Schenkel-Köpfe WAREN die Leisten-
            //    Form (die hartnäckige Doppel-Beule). Jetzt definiert der KNOCHEN die Hüft-/Schoß-Form.
            // Darmbein-Schaufel je Seite (breit, oben-lateral) → die Hüft-Breite + die Sockel-Wand.
            add(
                "box",
                "knochen",
                s * hipHalf * 0.6,
                hipY + 0.06,
                -0.04 * girthF,
                hipHalf * 0.72,
                0.6,
                0.5 * girthF,
                null,
                limbCol,
                {
                    kScale: 0.72,
                    struct: true,
                }
            );
            if (s > 0) {
                // Scham-Schild (pubic) — EINE glatte, breite Front-Platte tief-mittig = die Leisten-Front,
                //    weit genug vorn, dass sie ÜBER beide Schenkel-Köpfe drapiert (kein Doppel-Beule mehr).
                add(
                    "box",
                    "knochen",
                    0,
                    hipY - 0.34,
                    0.27 * girthF,
                    hipHalf * 1.02,
                    0.56,
                    0.4 * girthF,
                    null,
                    limbCol,
                    {
                        kScale: 0.82,
                        struct: true,
                    }
                );
                // Kreuzbein (sacrum) hinten-mittig — verbindet zur Wirbelsäule, formt den unteren Rücken.
                add("box", "knochen", 0, hipY + 0.02, -0.3 * girthF, hipHalf * 0.5, 0.7, 0.34 * girthF, null, limbCol, {
                    kScale: 0.78,
                    struct: true,
                });
            }
            // (QUADRIZEPS / HAMSTRING / SARTORIUS / ADDUKTOR → MUSKEL-ATLAS unten — gelenk-verankert)
            limb(kneeX, 2.3, 0, ankleX, 0.4, 0, 0.36 * limbF, limbMat, limbCol, { def: true, kScale: 0.95 }); // Unterschenkel — tiefer Muskel-Kern; Gastroc/Soleus/Tibialis liegen als Relief darüber
            // ── BEIN-KNOCHEN (das starre Gerüst + die GELENK-PUNKTE = die Rig-Bones): dünne knochen-
            //    Schäfte IM Fleisch (Femur, Tibia) + Gelenk-Knöpfe an Hüfte/Knie/Knöchel (T-Knochen-
            //    Enden — bony an den Landmarken, die Animations-Achse Hüfte→Knie→Knöchel).
            limb(hipX, hipY - 0.1, -0.12, kneeX, 2.3, 0, 0.18 * limbF, "knochen", limbCol); // Femur-Schaft
            limb(kneeX, 2.3, 0, ankleX, 0.4, 0, 0.16 * limbF, "knochen", limbCol); // Tibia/Fibula-Schaft
            add("sphere", "knochen", hipX, hipY - 0.06, -0.12, 0.32 * limbF, 0.3 * limbF, 0.3 * limbF, null, limbCol, {
                kScale: 0.72,
            }); // Femurkopf (Hüft-Gelenk)
            add("sphere", "knochen", kneeX, 2.32, 0, 0.3 * limbF, 0.3 * limbF, 0.28 * limbF, null, limbCol, {
                kScale: 0.6,
            }); // Knie-Kondylen
            add("sphere", "knochen", ankleX, 0.55, -0.02, 0.2 * limbF, 0.24 * limbF, 0.2 * limbF, null, limbCol, {
                kScale: 0.55,
            }); // Knöchel (Malleolen — die seitlichen Knochen-Vorsprünge am UNTEREN Tibia/Fibula-Ende, am Knöchelgelenk, nicht mehr im Schienbein verirrt)
            add("box", "knochen", kneeX, 2.36, 0.14, 0.32 * limbF, 0.36, 0.18, null, limbCol, { kScale: 0.5 }); // PATELLA (scharfe Kniescheibe vorn, knochen)
            // (GASTROCNEMIUS / SOLEUS / TIBIALIS → MUSKEL-ATLAS unten — gelenk-verankert)
            // FUSS — ein SAUBERER Fuß über die FORM (Schöpfer-Befund „Sohle von oben / Loch"): FLACHE
            //    Sohle (alle Unterkanten y≈0) + Rist-Bogen oben + Ballen + fünf lesbare FLEISCH-Zehen.
            //    Das FLEISCH bildet die Oberfläche; die Knochen sitzen KLEIN INNEN (zersplittern die Haut
            //    nicht mehr → keine invertierte Normale). Die Massen überlappen → glatte Sohle.
            add("box", limbMat, ankleX, 0.19, -0.13, 0.26, 0.19, 0.27, null, limbCol); // Ferse (hinten, Sohle y≈0, der Knöchel sitzt drauf)
            add("box", limbMat, ankleX, 0.18, 0.16, 0.28, 0.18, 0.42, null, limbCol); // Mittelfuß (Rist-Bogen oben, Sohle flach, länger)
            add("box", limbMat, ankleX, 0.1, 0.5, 0.3, 0.1, 0.3, null, limbCol); // Ballen (vorn-breit, flach)
            // ZEHEN — fünf sanfte FLEISCH-Ridges am Ballen (lesbar; Grosszeh innen dicker), kScale weich:
            for (let t = 0; t < 5; t++) {
                const sp = (t - 2) / 2; // -1 innen (Grosszeh) … +1 aussen
                const isBig = t === 0;
                const tx = ankleX + s * sp * 0.078 * limbF;
                const tw = (isBig ? 0.072 : 0.052) * limbF;
                add(
                    "box",
                    limbMat,
                    tx,
                    0.075,
                    0.66 - Math.abs(sp) * 0.05,
                    tw,
                    0.055,
                    isBig ? 0.12 : 0.095,
                    null,
                    limbCol,
                    { kScale: 0.82 }
                );
            }
            // ── FUSS-SKELETT (knochen, KLEIN + INNEN — bildet NICHT die Haut-Oberfläche, nur écorché-sichtbar):
            //    Talus → Calcaneus → Fußwurzel → Metatarsus → Zehen-Knochen, alle schlank im Fleisch.
            add("sphere", "knochen", ankleX, 0.4, -0.02, 0.17 * limbF, 0.17 * limbF, 0.19 * limbF, null, limbCol, {
                kScale: 0.5,
            }); // Talus
            add("box", "knochen", ankleX, 0.17, -0.26, 0.16 * limbF, 0.17, 0.25, { x: 0.3, y: 0, z: 0 }, limbCol, {
                kScale: 0.46,
            }); // Calcaneus
            add("sphere", "knochen", ankleX, 0.24, 0.1, 0.17 * limbF, 0.14 * limbF, 0.17 * limbF, null, limbCol, {
                kScale: 0.5,
            }); // Fußwurzel
            for (let t = 0; t < 5; t++) {
                const sp = (t - 2) / 2;
                const lat = ankleX + s * sp * 0.078 * limbF;
                const isBig = t === 0;
                add(
                    "sphere",
                    "knochen",
                    lat,
                    0.19,
                    0.3 - Math.abs(sp) * 0.02,
                    0.038 * limbF,
                    0.038 * limbF,
                    0.2 * limbF,
                    { x: 0.34, y: 0, z: 0 },
                    limbCol,
                    { kScale: 0.4 }
                ); // Metatarsus (klein, innen)
                add(
                    "sphere",
                    "knochen",
                    lat,
                    0.085,
                    0.62 - Math.abs(sp) * 0.04,
                    (isBig ? 0.046 : 0.032) * limbF,
                    (isBig ? 0.04 : 0.028) * limbF,
                    (isBig ? 0.095 : 0.07) * limbF,
                    { x: 0.08, y: 0, z: 0 },
                    limbCol,
                    { kScale: 0.4 }
                ); // Zehen-Knochen (klein, innen)
            }
        }
        // ── DER MUSKEL-ATLAS (die Baugruppe, „gelernt von den Profis") — jeder Muskel SPANNT zwei
        //    benannte Gelenk-Knoten (Ursprung→Ansatz auf L), genau wie ein echter Muskel zwei Knochen
        //    spannt: „geführt über die Gelenke". EINE Tabelle, kein Streu-Tweak — in JEDER Pose sitzt
        //    der Muskel richtig (die Landmarken reisen mit dem Skelett/Rig). Die Fasern überziehen den
        //    ganzen Körper (Referenz-Écorché), der Knochen bleibt das innere Gerüst. b = Bauch-Dicke
        //    (× mF Rumpf / limbF Glied), belly = Lage des dicksten Punkts, depth = Abplattung. ──
        const MUSC = [
            // HALS + KOPF
            { o: "mastoid", i: "clavicleMed", b: 0.085, sc: mF, belly: 0.5, depth: 0.85, kS: 0.82 }, // Sternocleidomastoideus (Hals-V — schlanker, hugt den Hals, kein Lump am Hals-Boden)
            { o: "cheek", i: "jawAngle", b: 0.1, sc: mF, belly: 0.5, kS: 0.55, mat: headMat, col: limbCol, ndef: true }, // Masseter
            { o: "c7", i: "acromion", b: 0.28, sc: mF, belly: 0.52, depth: 0.5, kS: 0.86 }, // Trapezius (oberer — BREITER Hals→Schulter-BRÜCKE: füllt die Lücke Nacken→Schulterknochen, glatt + flach, kein Loch, kein Lump)
            { o: "c7", i: "scapula", b: 0.34, sc: mF, belly: 0.5, depth: 0.45, kS: 0.8 }, // Trapezius (mittlerer — deckt das Schulterblatt = der Rücken-Diamant)
            { o: "erectorTop", i: "scapula", b: 0.3, sc: mF, belly: 0.5, depth: 0.45, kS: 0.82 }, // Trapezius (unterer Kopf — der Diamant reicht bis Mitte-Rücken)
            // SCHULTER (Deltoideus — eine gerundete KAPPE über dem Schultergelenk, drei Köpfe fächern
            //    vom Akromion/Klavikel/Skapula zur Humerus-Mitte; breit + voll = die Referenz-Kuppe, kein dünner Stab)
            {
                o: "clavicleMed",
                i: "deltoidIns",
                b: 0.26,
                sc: limbF,
                belly: 0.34,
                depth: 0.95,
                kS: 0.78,
                mat: limbMat,
                col: limbCol,
            }, // vorderer Kopf
            {
                o: "acromion",
                i: "deltoidIns",
                b: 0.32,
                sc: limbF,
                belly: 0.32,
                depth: 1.0,
                kS: 0.78,
                mat: limbMat,
                col: limbCol,
                extra: { def: true, disp: true, amp: 0.2, reach: 1.7 },
            }, // seitlicher Kopf (die Haupt-Kappe)
            {
                o: "scapula",
                i: "deltoidIns",
                b: 0.26,
                sc: limbF,
                belly: 0.34,
                depth: 0.95,
                kS: 0.78,
                mat: limbMat,
                col: limbCol,
            }, // hinterer Kopf
            // BRUST (Pectoralis — ein breiter gerundeter SCHILD je Seite, der die halbe Brust deckt: vier
            //    Köpfe fächern vom Sternum/Klavikel zum Humerus, BREIT (füllt die Brust) + FLACH (liegt als
            //    Schild, kein Ballen), Bulk zum Sternum (die fleischige Innenbrust), unterer Kopf = Pec-Shelf)
            { o: "clavicleMed", i: "pecIns", b: 0.3, sc: mF, belly: 0.52, depth: 0.5, kS: 0.82 }, // klavikulärer Kopf (obere Fasern, schlanker oben → kein Knoten am Hals)
            { o: "sternumTop", i: "pecIns", b: 0.5, sc: mF, belly: 0.46, depth: 0.5, kS: 0.82 }, // oberer sternaler (Hauptmasse, VOLL) — kScale 0.82 = glatter Merge (kein Krater)
            { o: "sternumLow", i: "pecIns", b: 0.5, sc: mF, belly: 0.44, depth: 0.5, kS: 0.82 }, // mittlerer sternaler (VOLL)
            { o: "xiphoid", i: "pecIns", b: 0.42, sc: mF, belly: 0.42, depth: 0.48, kS: 0.82 }, // unterer Kopf (Pec-Shelf, klare Unterkante)
            // RÜCKEN (Latissimus-V + Teres + Erector)
            { o: "iliacBack", i: "axilla", b: 0.38, sc: mF, belly: 0.42, depth: 0.38, kS: 0.88 }, // Latissimus (iliakal — das breite V-Blatt)
            { o: "sacrum", i: "axilla", b: 0.34, sc: mF, belly: 0.46, depth: 0.38, kS: 0.88 }, // Latissimus (lumbal — füllt das untere V, deckt den Rücken)
            { o: "erectorTop", i: "axilla", b: 0.3, sc: mF, belly: 0.46, depth: 0.4, kS: 0.88 }, // Latissimus (thorakal)
            { o: "scapula", i: "axilla", b: 0.17, sc: mF, belly: 0.4, kS: 0.8 }, // Teres
            { o: "sacrum", i: "erectorTop", b: 0.16, sc: mF, belly: 0.5, depth: 0.42, kS: 0.74 }, // Erector spinae (Rücken-Säule)
            // ARM
            {
                o: "shoulderFront",
                i: "elbowFront",
                b: 0.25,
                sc: limbF,
                belly: 0.46,
                depth: 0.92,
                kS: 0.85,
                mat: limbMat,
                col: limbCol,
            }, // Bizeps (voller, fusiformer Bauch)
            {
                o: "shoulderBack",
                i: "elbowBack",
                b: 0.27,
                sc: limbF,
                belly: 0.52,
                depth: 0.92,
                kS: 0.85,
                mat: limbMat,
                col: limbCol,
            }, // Trizeps (voller, hinten getrennt)
            { o: "elbowFront", i: "wrist", b: 0.18, sc: limbF, belly: 0.34, kS: 0.85, mat: limbMat, col: limbCol }, // Unterarm-Flexoren
            // GESÄSS + OBERSCHENKEL
            { o: "iliacBack", i: "hip", b: 0.42, sc: mF, belly: 0.5, depth: 0.9, kS: 0.92 }, // Gluteus maximus
            { o: "hipFront", i: "kneeFront", b: 0.36, sc: limbF, belly: 0.44, kS: 0.84, mat: limbMat, col: limbCol }, // Quadrizeps
            { o: "ischium", i: "kneeBack", b: 0.34, sc: limbF, belly: 0.46, kS: 0.9, mat: limbMat, col: limbCol }, // Hamstring
            { o: "iliac", i: "kneeFront", b: 0.12, sc: limbF, belly: 0.55, kS: 0.7, mat: limbMat, col: limbCol }, // Sartorius (diagonal)
            { o: "pubis", i: "thighInner", b: 0.18, sc: limbF, belly: 0.5, kS: 0.78, mat: limbMat, col: limbCol }, // Adduktor (Leiste)
            // UNTERSCHENKEL
            { o: "kneeBack", i: "heel", b: 0.4, sc: limbF, belly: 0.3, kS: 0.86, mat: limbMat, col: limbCol }, // Gastrocnemius (Wade)
            { o: "shinTop", i: "heel", b: 0.24, sc: limbF, belly: 0.42, kS: 0.82, mat: limbMat, col: limbCol }, // Soleus
            { o: "kneeFront", i: "ankleFront", b: 0.17, sc: limbF, belly: 0.4, kS: 0.8, mat: limbMat, col: limbCol }, // Tibialis anterior
            // ── VOLLKACHELUNG (parallel-Welle): die fehlenden Köpfe → kein Knochen scheint zwischen den Muskeln ──
            {
                o: "clavicleMed",
                i: "humerusTop",
                b: 0.2,
                sc: limbF,
                belly: 0.62,
                depth: 0.85,
                kS: 0.8,
                mat: limbMat,
                col: limbCol,
            }, // Schulter-Kappe (deckt den Humeruskopf)
            { o: "deltoidIns", i: "upperArmOut", b: 0.18, sc: limbF, belly: 0.5, kS: 0.84, mat: limbMat, col: limbCol }, // Brachialis (Bizeps↔Trizeps-Lücke)
            { o: "elbowBack", i: "forearmBack", b: 0.16, sc: limbF, belly: 0.36, kS: 0.84, mat: limbMat, col: limbCol }, // Unterarm-Extensoren (Rückseite)
            { o: "iliac", i: "kneeOut", b: 0.3, sc: limbF, belly: 0.5, kS: 0.84, mat: limbMat, col: limbCol }, // Vastus lateralis (Außenschenkel)
            { o: "hipFront", i: "kneeIn", b: 0.3, sc: limbF, belly: 0.68, kS: 0.82, mat: limbMat, col: limbCol }, // Vastus medialis (voller Innen-Tropfen direkt überm Knie)
            { o: "shinTop", i: "shinOut", b: 0.13, sc: limbF, belly: 0.5, kS: 0.8, mat: limbMat, col: limbCol }, // Peroneus (Außen-Unterschenkel)
            { o: "sternumTop", i: "xiphoid", b: 0.17, sc: mF, belly: 0.5, depth: 0.55, kS: 0.85 }, // Brust-Mittelfüllung (schlank + weich → Sternum ist eine sanfte Rinne zwischen den Pecs, kein Bump/Loch)
            { o: "pubis", i: "navel", b: 0.16, sc: mF, belly: 0.3, depth: 0.55, kS: 0.78 }, // untere Bauch-/Schoß-Füllung (Scham-Schild vorn)
        ];
        for (const m of MUSC) {
            for (const s of [-1, 1]) {
                const a = J(m.o, s),
                    b = J(m.i, s);
                musk(a[0], a[1], a[2], b[0], b[1], b[2], m.b * (m.sc || 1), {
                    mat: m.mat || bodyMat,
                    col: m.col != null ? m.col : bodyCol,
                    belly: m.belly,
                    depth: m.depth || 1,
                    kScale: m.kS,
                    extra: m.extra || (m.ndef ? { def: false } : undefined),
                });
            }
        }
        // ── COVERAGE-PASS (Referenz-Écorché: der MUSKEL deckt den Körper, der Knochen tritt zurück) ──
        //    EINE Baugruppe-weite Operation, KEIN Muskel-für-Muskel-Tweak: die Befund war, dass das
        //    Skelett (Brustkorb/Becken) den Leib bildet und die Muskeln schwebende Tropfen sind — die
        //    UMKEHRUNG der Referenz, wo der Muskel den ganzen Körper überzieht. Dieser Pass dreht es um:
        //    (1) die Muskel-Massen (`def`) werden im QUERSCHNITT voller (x/z, nicht die Länge y → sie
        //    schießen nicht über ihre Gelenke), bis sie abutten + den Leib tragen; (2) die INNEREN
        //    Struktur-Knochen (Brustkorb/Rippen/Sternum/Wirbel/Skapula/Becken) treten im Querschnitt
        //    zurück, damit sie IM Fleisch sitzen statt nackt vorzustehen — sichtbar bleiben nur Hände,
        //    Füße, Schädel + die scharfen Landmarken (Klavikel/Patella/Olecranon, kScale<0.5). Der
        //    smin der Haut verschmilzt die volleren Massen → ein muskulöser Leib, kein Knochen-Display.
        const COVER = 1.1 + muscle * 0.12; // Muskel-Deckungs-Marge (der Atlas trägt die Hauptmasse; dies lässt die Bäuche knapp abutten)
        for (const p of parts) {
            if (!p.size) continue;
            if (p.def) {
                // Muskel: voller im Querschnitt (deckt Breite + tritt vor das Skelett), Länge bleibt.
                p.size.x *= COVER;
                p.size.z *= COVER;
            } else if (p.material === "knochen" && p.struct) {
                // innerer Struktur-Knochen: deutlich schmaler/flacher → sitzt TIEF im Fleisch (der Muskel
                //    deckt ihn, kein nackter Knochen-Fleck zwischen den Muskeln, Referenz-Écorché).
                p.size.x *= 0.54;
                p.size.z *= 0.5; // tiefer Z-Recede → die Front-Flächen (Sternum/Becken) verschwinden hinter dem Muskel
            }
        }
        return parts;
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
        humanSkeleton: humanSkeleton,
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
