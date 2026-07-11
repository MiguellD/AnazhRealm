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

    // ── Der Namensraum (Vertrag v1.1 §7 + §8 MESHFREI) ──
    root.__koerperCore = {
        VERSION: VERSION,
        landmarks: landmarks,
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
