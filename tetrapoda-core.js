// AnazhRealm — tetrapoda-core.js: DER KREATUR-STUDIO-KERN (Katalysator-Bogen W-A6, ε-Checkliste).
// Die GESTALT- + BEWEGUNGS-DATEN des Tetrapoda-Labs (worlds/tetrapoda/index.html —
// Evolution Lab "Aureus": Wolf/Fuchs/Baer/Hirsch aus fuenf allometrischen Dials;
// CPG-Gangnetz + Emotions-Bewegungsprofile). Byte-treu aus dem Schoepfer-Werk
// extrahiert (Literal-Slices, sha256-Beleg im Wellen-Bericht) — die Shell UND
// AnazhRealm lesen DIESE eine Quelle (G2.1), ein Nachbau ist verboten.
//
// FORM (Vertrag v1.1 §7 N7.2 + §8): namespaced IIFE __tetrapodaCore, MESHFREI = 1 —
// DER HOST BLEIBT DER OFEN (W-A6-Gesetz): bake-core-Isosurface + _creatureSkeleton +
// _buildCreatureSkinGeometry bauen die Koerper; dieser Kern liefert GESTALT-PARAMETER
// (die fuenf Dials je Gattung) + das benannte v1.1-Feld fx.motion (die Emotions-
// Gang-Profile + CPG-Kopplung + Stand-Pose als DATEN — der Host-Konsument ist der
// _animateCompoundMotion-/Rig-Bogen, benannter Andock-Punkt im Wellen-Bericht).
// KEIN buildInstance (B2 N/A), kein Mesh-Kanal, kein Parallel-Sim.
//
// DETERMINISMUS (G2.3): reine Daten — kein Math.random/keine Zeit im Manifest-Pfad
// (die Verhaltens-Wuerfe des Labs bleiben Shell-Runtime). THREE-frei, DOM-frei.
(function (root) {
    "use strict";

    var VERSION = "1.0.0";
    var STUDIO_VERTRAG = 1; // G4.3
    var MESHFREI = 1; // v1.1 §8 — components-only-Kern (keine Gestalt, nur Daten)

    // ── Die vier Gattungen (byte-treu Lab Z.62): fuenf allometrische Dials je Art ──
    // prettier-ignore
    var GATTUNGEN = {wolf:{size:2.4,neck:0.263,leg:0.22,diet:1.0,build:0.42},fox:{size:1.5,neck:0.290,leg:0.22,diet:1.0,build:0.22},bear:{size:3.2,neck:0.180,leg:0.20,diet:0.5,build:0.70},deer:{size:2.8,neck:0.330,leg:0.28,diet:0.0,build:0.28}};
    // ── Das CPG-Kopplungsnetz (byte-treu Lab Z.80) + die Stand-Pose (Z.96) ──
    // prettier-ignore
    var CPG_COUPLING = [[0,-0.5,0.5,0],[-0.5,0,0,0.5],[0.5,0,0,-0.5],[0,0.5,-0.5,0]];
    // prettier-ignore
    var STAND_POSE = [[0.02,-0.03,0.05,0.02],[0.02,-0.03,0.05,0.02],[-0.02,0.02,0.05,-0.02],[-0.02,0.02,0.05,-0.02]];
    // ── Die Emotions-Bewegungsprofile (byte-treu Lab Z.130–135) — das motion-Feld ──
    // prettier-ignore
    var MOTION = {
    idle:{freq:0.25,stride:0,bodyX:0,bodyZ:0,headX:-0.01,headY:0,ear:0.15,tailAmp:0.10,tailRate:0.5,tension:0.9,bob:0.002,sway:0.006,kpMul:1.0,phases:[0,0,0,0]},
    joy:{freq:3.2,stride:0.06,bodyX:-0.04,bodyZ:0.02,headX:0.04,headY:0,ear:0.05,tailAmp:0.38,tailRate:5.5,tension:1.0,bob:0.020,sway:0.025,kpMul:0.55,phases:[0,Math.PI*0.75,Math.PI*1.5,Math.PI*0.25]},
    hunt:{freq:0.9,stride:0.018,bodyX:0.10,bodyZ:0,headX:-0.12,headY:0,ear:0.0,tailAmp:0.02,tailRate:0.15,tension:1.6,bob:0.002,sway:0.002,kpMul:1.8,phases:[0,Math.PI*0.75,Math.PI*1.5,Math.PI*0.25]},
    flee:{freq:9.0,stride:0.18,bodyX:0.05,bodyZ:0,headX:0.01,headY:0,ear:-0.22,tailAmp:0.006,tailRate:11.0,tension:1.5,bob:0.030,sway:0.010,kpMul:1.5,phases:[0,Math.PI,Math.PI,0]},
    alert:{freq:0.08,stride:0,bodyX:-0.03,bodyZ:0,headX:-0.06,headY:0,ear:0.08,tailAmp:0.04,tailRate:0.6,tension:1.2,bob:0.001,sway:0.001,kpMul:1.3,phases:[0,0,0,0]},
    showcase:{freq:0.1,stride:0,bodyX:0,bodyZ:0,headX:-0.02,headY:0,ear:0.12,tailAmp:0.16,tailRate:0.4,tension:0.9,bob:0.002,sway:0.012,kpMul:1.0,phases:[0,0,0,0]}
    };

    // ═══════════════════════════════════════════════════════════════════════
    //  B4 PARAMS — die fuenf Lab-Slider als DATEN (worlds/tetrapoda/index.html
    //  Z.42–51: min/max/step/value + die law-Zeilen woertlich).
    // ═══════════════════════════════════════════════════════════════════════
    var PARAMS = [
        {
            id: "size",
            lab: "Groesse",
            min: 1.0,
            max: 4.0,
            step: 0.1,
            def: 2.4,
            law: "Beinmuskel = 0.42 x (Groesse/2.4)^0.67 -- Allometrie",
            grp: "KOERPER",
        },
        {
            id: "neck",
            lab: "Nacklaenge",
            min: 0.15,
            max: 0.4,
            step: 0.01,
            def: 0.263,
            law: "Nackwinkel = 8 + (Laenge-0.26)x55 -- laenger = aufrichtiger",
            grp: "KOERPER",
        },
        {
            id: "leg",
            lab: "Beinlaenge",
            min: 0.15,
            max: 0.35,
            step: 0.01,
            def: 0.22,
            law: "Gangtempo = sqrt(Beinlaenge/0.22) x 1.2 -- Froude",
            grp: "KOERPER",
        },
        {
            id: "diet",
            lab: "Ernaehrung",
            min: 0,
            max: 1,
            step: 0.05,
            def: 1.0,
            law: "Fanglaenge, Augenpos. -- Carnivor kurz+vorne, Herbivor lang+seitlich",
            grp: "KOERPER",
        },
        {
            id: "build",
            lab: "Statur",
            min: 0,
            max: 1,
            step: 0.05,
            def: 0.42,
            law: "Muskel, Bauchtiefe, Beindicke -- schlank bis massiv",
            grp: "KOERPER",
        },
    ];

    // ═══════════════════════════════════════════════════════════════════════
    //  B1 REZEPTE (Vertrags-Form) — die vier klickbaren Gattungen: kind
    //  "kreatur", s = die fuenf Dials, fx.motion = das v1.1-Komponenten-Feld
    //  (Profile + CPG + Stand-Pose, JSON-klonbar), fx.place {mode:"none"}
    //  (Spawn ueber den Hof, nie Worldgen — der Fahrplan-Entscheid).
    // ═══════════════════════════════════════════════════════════════════════
    var PRESETS = (function () {
        var out = {};
        var labels = { wolf: "Wolf", fox: "Fuchs", bear: "Baer", deer: "Hirsch" };
        for (var id in GATTUNGEN) {
            if (!Object.prototype.hasOwnProperty.call(GATTUNGEN, id)) continue;
            out[id] = {
                kind: "kreatur",
                lab: labels[id] || id,
                s: Object.assign({}, GATTUNGEN[id]),
                fx: {
                    place: { mode: "none" },
                    motion: {
                        presets: JSON.parse(JSON.stringify(MOTION)),
                        cpgCoupling: JSON.parse(JSON.stringify(CPG_COUPLING)),
                        standPose: JSON.parse(JSON.stringify(STAND_POSE)),
                    },
                },
            };
        }
        return out;
    })();

    // ── Der Namensraum (Vertrag v1.1 §7 + §8 MESHFREI) ──
    root.__tetrapodaCore = {
        VERSION: VERSION,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        MESHFREI: MESHFREI,
        PRESETS: PRESETS,
        PARAMS_BY_KIND: { kreatur: PARAMS },
        // Die Lab-Quellen (die Shell liest DIESE eine Quelle — Aliasse):
        GATTUNGEN: GATTUNGEN,
        MOTION: MOTION,
        CPG_COUPLING: CPG_COUPLING,
        STAND_POSE: STAND_POSE,
    };
})(typeof self !== "undefined" ? self : globalThis);
