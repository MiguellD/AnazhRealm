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

    // ── Der Namensraum (Vertrag v1.1 §7 + §8 MESHFREI) ──
    root.__koerperCore = {
        VERSION: VERSION,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        MESHFREI: MESHFREI,
        PRESETS: PRESETS,
        PARAMS: PARAMS,
        // Die Lab-Quellen (die Shell liest DIESE eine Quelle — Aliasse):
        START_PARAMS: START_PARAMS,
        MOTION: MOTION,
    };
})(typeof self !== "undefined" ? self : globalThis);
