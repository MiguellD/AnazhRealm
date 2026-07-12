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


    // ════════════════════════════════════════════════════════════════════
    // ALTLASTEN-NULL HERZ (V18.449) — DIE EINE ANATOMIE-QUELLE.
    // Das Vierbeiner-Skelett-GESETZ wohnt im Evolutions-Gesetzbuch (diesem
    // Kern), nicht im Stamm: die Archetyp-Proportionen (Referenz-vermessen)
    // + der Skelett-Bauer (reine Daten+Mathe -> Part-Liste; MESHFREI §8 —
    // kein Mesh, der Host/Ofen backt). Der Stamm DELEGIERT hierher; der
    // Worker trägt denselben Kern — EIN Gesetz, alle Leser.
    // (Verbatim aus dem Stamm gewandert — byte-gleicher Guss, Batterie-belegt.)
    // ════════════════════════════════════════════════════════════════════
    var ARCHETYPES = Object.freeze({
    balanced: {
        legFrac: 0.5,
        segRatio: 1.0,
        torsoL: 0.58,
        torsoW: 0.32,
        torsoH: 0.42,
        neckFrac: 0.24,
        neckTilt: 0.55,
        headFrac: 0.24,
        tailFrac: 0.34,
        eyeFront: 0.4,
        kneeFwd: 0.05,
    },
    deer: {
        legFrac: 0.6,
        segRatio: 0.82,
        torsoL: 0.54,
        torsoW: 0.28,
        torsoH: 0.44,
        neckFrac: 0.34,
        neckTilt: 0.5,
        headFrac: 0.21,
        tailFrac: 0.16,
        eyeFront: 0.12,
        kneeFwd: 0.055,
    },
    wolf: {
        legFrac: 0.54,
        segRatio: 1.0,
        torsoL: 0.6,
        torsoW: 0.3,
        torsoH: 0.44,
        neckFrac: 0.22,
        neckTilt: 0.46,
        headFrac: 0.26,
        tailFrac: 0.42,
        eyeFront: 0.5,
        kneeFwd: 0.06,
    },
    bear: {
        legFrac: 0.42,
        segRatio: 1.2,
        torsoL: 0.62,
        torsoW: 0.46,
        torsoH: 0.52,
        neckFrac: 0.16,
        neckTilt: 0.42,
        headFrac: 0.26,
        tailFrac: 0.12,
        eyeFront: 0.35,
        kneeFwd: 0.05,
    },
    bigcat: {
        legFrac: 0.48,
        segRatio: 1.0,
        torsoL: 0.62,
        torsoW: 0.36,
        torsoH: 0.48,
        neckFrac: 0.16,
        neckTilt: 0.38,
        headFrac: 0.27,
        tailFrac: 0.5,
        eyeFront: 0.75,
        kneeFwd: 0.065,
    },
    weasel: {
        legFrac: 0.2,
        segRatio: 1.0,
        torsoL: 0.86,
        torsoW: 0.22,
        torsoH: 0.24,
        neckFrac: 0.16,
        neckTilt: 0.5,
        headFrac: 0.2,
        tailFrac: 0.5,
        eyeFront: 0.35,
        kneeFwd: 0.03,
    },
    horse: {
        legFrac: 0.62,
        segRatio: 0.78,
        torsoL: 0.58,
        torsoW: 0.3,
        torsoH: 0.46,
        neckFrac: 0.32,
        neckTilt: 0.46,
        headFrac: 0.22,
        tailFrac: 0.3,
        eyeFront: 0.12,
        kneeFwd: 0.05,
    },
    });

    function buildSkeleton(g) {
        g = g || {};
        const bodyMat = g.bodyMat || "stein";
        const limbMat = g.limbMat || bodyMat;
        const headMat = g.headMat || limbMat;
        const SH = g.shapes || {};
        const torsoShape = SH.torso || "box";
        const limbShape = SH.limb || "limb";
        const headShape = SH.head || "sphere";
        const snoutShape = SH.snout || "limb";
        const s = g.size || 1;
        const bodyCol = g.bodyColor;
        const limbCol = g.limbColor;
        const parts = [];
        const add = (shape, material, x, y, z, sx, sy, sz, rot, col, extra) => {
            const p = { shape, material, position: { x, y, z }, size: { x: sx, y: sy, z: sz } };
            if (rot && (rot.x || rot.y || rot.z)) p.rotation = rot;
            if (typeof col === "number") p.color = col;
            if (extra) Object.assign(p, extra);
            parts.push(p);
            return p;
        };
        // wahrerguss System B — die BIOMECHANISCHE ARCHETYP-Grammatik (Form folgt Funktion,
        // recherchiert): Wolf/Reh/Bär/Wiesel/Pferd/Großkatze unterscheiden sich in Bein-Anteil,
        // Glied-Gliederung (distal schlanker), Hals/Kopf, Rumpf-Breite/Höhe, Augen-FRONTALITÄT
        // (Jäger vorwärts ~0.7 / Pflanzenfresser seitlich ~0.12), Neigung. EIN Schema, viele
        // Tiere. TAG-NEUTRAL: nur Längen/Positionen/Anzahl variieren (gleiche Shapes+Materialien
        // → der compound-MAX bleibt unverändert; GEMESSEN diag-genom Affinität-Band).
        const A = g.archetype || ARCHETYPES.balanced || {};
        const af = (k, d) => (A && A[k] != null ? A[k] : d);
        const BL = (g.bodyLen != null ? g.bodyLen : 1.0) * s; // Körper-Länge = Referenz
        const torsoLen = BL * af("torsoL", 0.55);
        const torsoW = BL * af("torsoW", 0.3);
        const torsoH = BL * af("torsoH", 0.36);
        const legLen = BL * af("legFrac", 0.5);
        const legR = BL * af("legR", 0.05);
        const neckLen = BL * af("neckFrac", 0.24);
        const neckTilt = af("neckTilt", 0.55); // +y-Ende nach vorn-oben (rotV: (0,cos,sin))
        const headFull = BL * af("headFrac", 0.22);
        const headR = headFull * 0.5;
        const tailLen = BL * af("tailFrac", 0.34);
        const eyeFront = af("eyeFront", 0.4);
        const stanceX = torsoW * 0.42; // Beine leicht INNERHALB der Körper-Kante (Bein überlappt den Leib)

        // (1) RUMPF — die ZWEI LASTTRAGENDEN BLÖCKE (Reh-Referenz, Schöpfer-Tafel; „ein
        //     Tierkörper ist gebaute Topologieoptimierung"): ein tiefer BRUSTKORB (Thorax,
        //     vorn-tief, die dominante Masse) + ein hohes BECKEN (Kruppe, hinten), verbunden
        //     durch eine leichtere Lende mit Bauch-Einzug. Die Topline ist GEKRÜMMT (Widerrist
        //     → Senke → Kruppe), nie gerade (Spore-Lektion: die gerade Oberlinie liest tot).
        //     ALLE Massen sind KONVEX + überlappend → der smin verschmilzt sie zu EINEM Leib
        //     OHNE Front-Mulde (der alte 5-Kugel-Spine erzeugte den konkaven Brust-Krater).
        //     TAG-NEUTRAL: nur torsoShape + bodyMat, allein Längen/Positionen variieren.
        const barrel = g.bodyBarrel !== false;
        const bodyLen = torsoLen * 1.7; // sichtbare Körper-Länge entlang z
        // ── DER KÖRPER ALS REGEL (Schöpfer „schärfe die Regel statt zu brute-forcen — kein fetter
        //    Ball"): ZWEI KURVEN + ein PROFIL, an N Stationen abgetastet — KEINE hand-platzierten
        //    Blobs. · TOPLINE yTop(zf): die Rücken-Kurve (Widerrist hoch · Rücken · Kruppe hoch).
        //    · TIEFE depth(zf): die Brust-Tiefe nach UNTEN (Ribcage tief · Flanke getuckt · Becken).
        //    · BREITE width(zf): die SCHMALE Körper-Breite. Jede Station ist ein ANISOTROPES
        //    Ellipsoid (x schmal, y tief, z = Scheibe) → Rücken = yTop, Bauch = yTop − depth: die
        //    tiefe SCHMALE Brust + der Flanken-Tuck EMERGIEREN aus den Profilen. Reh-Referenz-
        //    Parameter (Archetyp/Genom variieren sie). TAG-NEUTRAL (torsoShape+bodyMat; Maße zählen
        //    nicht in die Compound-Tags).
        const lerpCurve = (cps, zf) => {
            if (zf >= cps[0][0]) return cps[0][1];
            for (let i = 1; i < cps.length; i++)
                if (zf >= cps[i][0]) {
                    const t = (zf - cps[i][0]) / (cps[i - 1][0] - cps[i][0]);
                    return cps[i][1] + (cps[i - 1][1] - cps[i][1]) * t;
                }
            return cps[cps.length - 1][1];
        };
        // ANIMAL-ANATOMIE (Hunde-/ARAP-Referenz): ein Tier ist eine HÄNGEBRÜCKE — ein tiefer SCHMALER
        // Brustkorb + ein hohes Becken, verbunden durch eine LEICHTE Lende mit scharfem Flanken-TUCK
        // (der Bauch zieht sich HOCH). KEIN Barrel. Tiefe ≫ Breite. Widerrist + Kruppe als Anker.
        const toplineCP = af("topline", 0) || [
            [0.5, 0.46], // Brust-Ansatz
            [0.34, 0.52], // WIDERRIST hoch (Schulterblatt)
            [0.08, 0.4], // Rücken
            [-0.16, 0.38], // Lende
            [-0.32, 0.5], // KRUPPE hoch (Becken)
            [-0.5, 0.4], // Schwanz-Ansatz (rund, nicht spitz)
        ];
        const depthCP = af("depthProfile", 0) || [
            [0.5, 0.5], // Brisket rund-blunt vorn (kein Raketen-Prow)
            [0.34, 1.02], // tiefer BRUSTKORB — die dominante Masse, hängt tief
            [0.12, 0.92], // Rippen
            [-0.06, 0.4], // FLANKEN-TUCK — der Bauch zieht sich HOCH (die Taille des Tiers)
            [-0.3, 0.74], // Becken/Schenkel-Masse
            [-0.5, 0.44], // Heck rund (nicht spitz)
        ];
        const widthCP = af("widthProfile", 0) || [
            [0.5, 0.4], // schmale runde Brust vorn
            [0.3, 0.6], // Brustkorb (breiteste Stelle — aber SCHMAL: ein Tier ist tief, nicht breit)
            [0.0, 0.42], // schmale Lende
            [-0.3, 0.6], // Kruppe/Hinterhand (etwas breiter)
            [-0.5, 0.42], // Heck rund
        ];
        // der dichte Kern (verborgen) — trägt die dichte-Tags.
        // kleiner dichte-Kern im BRUSTKORB (trägt die dichte-Tags — Größe geht NICHT in die Tags ein);
        // klein + vorn-oben → er füllt NICHT den Flanken-Tuck (der alte große Mittel-Kern war ein
        // Haupt-Treiber des Barrel-Blobs, GEMESSEN am Render).
        add(
            torsoShape,
            bodyMat,
            0,
            torsoH * 0.12,
            torsoLen * 0.24,
            torsoW * 0.34,
            torsoH * 0.32,
            torsoLen * 0.34,
            null,
            bodyCol
        );
        let bellyShoulder = -torsoH * 0.3,
            bellyHip = -torsoH * 0.3;
        if (barrel) {
            const NS = 13;
            for (let i = 0; i < NS; i++) {
                const zf = 0.5 - (i / (NS - 1)) * 1.0; // +0.5 … −0.5 (Front → Heck)
                const yTop = lerpCurve(toplineCP, zf) * torsoH;
                const depth = Math.max(0.06, lerpCurve(depthCP, zf) * torsoH);
                const width = Math.max(0.06, lerpCurve(widthCP, zf) * torsoW);
                const cy = yTop - depth * 0.5; // Top ≈ Topline (Rücken), Bauch hängt um depth
                const sliceZ = (bodyLen / (NS - 1)) * 1.5; // leichter überlappend (feiner gesampelt) → der Flanken-TUCK überlebt statt verschmiert zu werden
                add(torsoShape, bodyMat, 0, cy, zf * bodyLen, width, depth, sliceZ, null, bodyCol);
                if (Math.abs(zf - 0.34) < 0.07) bellyShoulder = yTop - depth; // Bauch an der Schulter
                if (Math.abs(zf + 0.28) < 0.07) bellyHip = yTop - depth; // Bauch an der Hüfte
            }
        }

        // (2) BEINE — schlanke gegliederte Streben aus dem BAUCH jeder Station (Kragträger): das
        //     obere Glied tief im Bauch verankert (glatte Emergenz, kein Pin-Kneif), das untere
        //     sehnig-dünn, ein flacher HUF-Donor am Boden. Vorderbein fast gerade, Hinterbein
        //     Z-gebogen (Stifle/Sprunggelenk — die Reh-Signatur). Vier Paare → Stützpolygon (Ω-Φ2).
        const shoulderZ = torsoLen * 0.5;
        const hipZ = torsoLen * 0.48;
        const segBetween = (ax, ay, az, bx, by, bz, r) => {
            const dy = by - ay,
                dz = bz - az;
            const len = Math.hypot(bx - ax, dy, dz) || 0.01;
            add(
                limbShape,
                limbMat,
                (ax + bx) / 2,
                (ay + by) / 2,
                (az + bz) / 2,
                r * 2,
                len,
                r * 2,
                { x: Math.atan2(dz, dy), y: 0, z: 0 },
                limbCol
            );
        };
        const hoofCol = typeof limbCol === "number" ? (limbCol >> 1) & 0x7f7f7f : limbCol; // dunkler Huf (tag-neutral)
        const embedY = torsoH * 0.08;
        const groundY = Math.min(bellyShoulder, bellyHip) - legLen; // gemeinsamer Boden → Füße auf einer Ebene
        // WURZEL 2 (lebendiger-koerper §2½ — MUSKEL ALS DYNAMIK): die Hinterhand ist der Gang-MOTOR
        // (Gluteus/Biceps femoris erzeugen das Spitzen-Hüft-Drehmoment beim Abstoß), das Vorderbein
        // die passive STREBE/der Stoßdämpfer. Muskel-Querschnitt ∝ Spitzen-Gang-Drehmoment — das liegt
        // in Ω-CHRONOS (DYNAMIK), nicht Ω-PHYSIS (STATIK: ein Tisch steht ohne einen einzigen Muskel).
        // Darum trägt die Hinterhand eine große PROXIMALE Masse (verdicktes Oberglied + ein Schenkel-
        // Bauch an der Kruppe), das Vorderbein eine kleinere Schulter; DISTAL bleibt sehnig-dünn (die
        // distale Leichtigkeit echter Läufer = niedrige Glied-Trägheit). Die Muskel-Kapsel überlappt
        // Leib + Oberglied → der smin verschmilzt sie zu EINEM muskulösen Massiv (kein aufgeklebter
        // Blob — die Mr.-Potato-Lehre). TAG-NEUTRAL: limb + limbMat (im Compound-MAX schon da, Maße
        // zählen nicht), die Masse bleibt INNERHALB der Körper-AABB (sizeFactor-stabil, V18.208).
        const hindMotor = af("hindMotor", 0.95); // Propulsions-Anteil der Hinterhand (Läufer hoch)
        const foreMotor = af("foreMotor", 0.5); // Vorderbein = Strebe (leichter)
        const muscleScale = af("limbMuscle", 1.0);
        // DIGITIGRADE Z-FALTUNG (Hunde-/ARAP-Referenz, die Schöpfer-Tafel): ein Tier steht auf den
        // ZEHEN — das Bein faltet Hüfte→Stifle(hoch,vorn)→SPRUNGGELENK(mittig, HOCH über dem Boden)→
        // Zehen. Das HOHE Hock/Handwurzel-Gelenk + der lange ~vertikale Mittelfuß ist die Signatur,
        // die das Tier vom plumpen Stelzen-Tisch trennt. fold = {stifleH, stifleZ, hockH, hockZ, toeZ}
        // (H = Höhe als Anteil der Beinhöhe über Boden, Z = Versatz in legLen — aus der Referenz).
        const buildLeg = (sgnX, belly, zPos, fold, motor) => {
            const x = sgnX * stanceX;
            const topY = belly + embedY; // Hüft-/Schulter-Gelenk, tief im Bauch verankert
            const drop = topY - groundY; // ganze Beinhöhe
            const m = Math.max(0, motor || 0) * muscleScale;
            const stifleY = groundY + drop * fold.stifleH,
                stifleZ = zPos + legLen * fold.stifleZ;
            const hockY = groundY + drop * fold.hockH, // das HOHE Sprung-/Handwurzelgelenk
                hockZ = zPos + legLen * fold.hockZ;
            const toeZ = zPos + legLen * fold.toeZ;
            const upperR = legR * (1.15 + m * 0.6); // Femur/Humerus proximal bemuskelt ∝ Motor
            segBetween(x, topY, zPos, x, stifleY, stifleZ, upperR); // Femur/Humerus
            segBetween(x, stifleY, stifleZ, x, hockY, hockZ, legR * 0.74); // Tibia/Radius (sehnig)
            segBetween(x, hockY, hockZ, x, groundY + legR * 0.5, toeZ, legR * 0.56); // Mittelfuß (dünn, ~vertikal)
            // MUSKEL-BAUCH — Kruppe/Schenkel (Heck) bzw. Schulter (vorn) am proximalen Glied.
            if (m > 0.12) {
                const bz = zPos + (zPos < 0 ? -legLen * 0.04 : legLen * 0.03);
                const by2 = topY - drop * 0.16;
                segBetween(
                    x * 0.86,
                    belly + embedY * 1.4,
                    bz,
                    x * 0.95,
                    by2,
                    stifleZ - legLen * 0.02,
                    legR * (0.95 + m * 1.4)
                );
            }
            // PFOTE — flach am Boden, die Zehen vorn (überlappt den Mittelfuß → smin verbindet).
            add(
                "box",
                limbMat,
                x,
                groundY + legR * 0.5,
                toeZ + legR * 0.55,
                legR * 1.2,
                legR * 0.85,
                legR * 2.1,
                null,
                hoofCol
            );
        };
        // Fore = straffer (Stütze), Hind = stärker gefaltet (Motor) — beide digitigrad, Hock HOCH.
        const foreFold = { stifleH: 0.62, stifleZ: -0.03, hockH: 0.3, hockZ: 0.04, toeZ: 0.06 };
        const hindFold = { stifleH: 0.64, stifleZ: 0.13, hockH: 0.33, hockZ: -0.05, toeZ: 0.03 };
        buildLeg(-1, bellyShoulder, shoulderZ, foreFold, foreMotor); // Vorderbein
        buildLeg(1, bellyShoulder, shoulderZ, foreFold, foreMotor);
        buildLeg(-1, bellyHip, -hipZ, hindFold, hindMotor); // Hinterbein
        buildLeg(1, bellyHip, -hipZ, hindFold, hindMotor);

        // (3) HALS + (4) KOPF — Neigung aus der Rolle. Der Hals verbindet die Rumpf-Front mit dem
        //     Kopf; rotV: ein y-Glied mit rotation.x=θ zeigt sein +y-Ende nach (0,cosθ,sinθ) =
        //     vorn-oben. Der Kopf sitzt am Hals-Ende; er trägt den ANKER + die Augen-FRONTALITÄT.
        const neckCY = torsoH * 0.34,
            neckCZ = torsoLen * 0.64; // Hals an der Brust-FRONT des langen Leibs
        const dirY = Math.cos(neckTilt),
            dirZ = Math.sin(neckTilt);
        // THROAT-BRIDGE — eine ~kubische torsoShape-Masse (→ Kugel im Feld) füllt den Hals-Brust-
        // Reentrant; ohne sie liest der dünne Hals auf der großen Brust von VORN als konkaver
        // Kehl-Krater. torsoShape+bodyMat → tag-neutral (Box in beiden Seelen-Sets; Größe geht
        // nicht in die Compound-Tags ein).
        add(
            torsoShape,
            bodyMat,
            0,
            neckCY * 0.5,
            neckCZ * 0.92,
            torsoW * 0.78,
            torsoH * 0.5,
            torsoLen * 0.41,
            null,
            bodyCol
        );
        add(
            limbShape,
            limbMat,
            0,
            neckCY,
            neckCZ,
            legR * 2.3,
            neckLen,
            legR * 1.9,
            { x: neckTilt, y: 0, z: 0 },
            limbCol
        );
        const headCY = neckCY + dirY * (neckLen * 0.5 + headR * 0.55);
        const headCZ = neckCZ + dirZ * (neckLen * 0.5 + headR * 0.55);
        add(headShape, headMat, 0, headCY, headCZ, headFull * 0.92, headFull * 0.86, headFull * 1.12, null, limbCol, {
            bodyRole: "head",
            eyeFront,
        });
        // MAUL/SCHNAUZE — nach vorn (rotation x≈1.5 → fast +z). Länge aus der Rolle: ein
        // Pflanzenfresser (eyeFront niedrig) trägt ein längeres Grasmaul, ein Jäger ein
        // kürzeres, tieferes (höhere Bisskraft). reference-first an den Tier-Fotos.
        const muzzleLen = headR * (1.05 + (1 - eyeFront) * 0.85);
        const muzzleW = headR * (0.95 - eyeFront * 0.1);
        add(
            snoutShape,
            headMat,
            0,
            headCY - headR * 0.16,
            headCZ + headR * 0.82,
            muzzleW,
            muzzleLen,
            muzzleW,
            { x: 1.5, y: 0, z: 0 },
            limbCol
        );

        // (5) SCHWANZ — im HECK VERANKERT (die Wurzel überlappt den Rumpf → kein schwebender
        //     Stummel, der reference-Fix), nach hinten-unten via segBetween (die Metaball-Haut
        //     verschmilzt ihn mit dem Körper).
        const tRootZ = -torsoLen * 0.62,
            tRootY = torsoH * 0.18; // Schwanz-Wurzel am HECK des langen Leibs
        // dicker Schwanz-ANSATZ (torsoH·0.2, tapert zur Spitze) → liest als Schwanz, der aus dem
        // Körper wächst, statt als dünner Stummel, den die Körper-Masse verschluckt. Der Ansatz
        // SITZT im Heck (überlappt die Hüft-Wirbel) → verbindet ohne Kneif.
        segBetween(0, tRootY, tRootZ, 0, tRootY - tailLen * 0.5, tRootZ - tailLen * 0.82, torsoH * 0.2);

        // (6) ACCESSOIRES — Hörner + Rücken-Kamm (symmetrisch/zentral → Template unverbogen).
        if (g.horns) {
            const hornShape = SH.horn || "cone";
            const hl = BL * af("hornFrac", 0.18);
            for (const sgnX of [-1, 1])
                add(
                    hornShape,
                    headMat,
                    sgnX * headR * 0.7,
                    headCY + headR * 1.0,
                    headCZ - headR * 0.2,
                    headR * 0.55,
                    hl,
                    headR * 0.55,
                    { x: -0.3, y: 0, z: sgnX * 0.3 },
                    limbCol
                );
        }
        if (g.crest) {
            const crestShape = SH.crest || "cone";
            for (let i = 0; i < 3; i++)
                add(
                    crestShape,
                    limbMat,
                    0,
                    torsoH * 0.45,
                    torsoLen * (0.2 - i * 0.2),
                    legR * 0.9,
                    legR * 2.4,
                    legR * 0.7,
                    null,
                    limbCol
                );
        }
        return parts;
    }

    // Dial→Archetyp-Achsen (axis = base + mul·dial, aufs deer-Paar geeicht;
    // die Lab-Slider-Semantik als DATEN — verbatim aus dem Stamm gewandert):
    //   neck→neckFrac · leg→legFrac (Einheiten-Brücke) · build→torsoW ·
    //   diet→eyeFront (Carnivor frontal, Herbivor lateral). BEWUSST unmapped:
    //   size (stats-tragende V18.208-Tarierung, kein Render-Dial).
    var DIAL_MAP = Object.freeze([
        Object.freeze({ dial: "neck", axis: "neckFrac", base: 0, mul: 1 }),
        Object.freeze({ dial: "leg", axis: "legFrac", base: 0, mul: 0.6 / 0.28 }),
        Object.freeze({ dial: "build", axis: "torsoW", base: 0, mul: 1 }),
        Object.freeze({ dial: "diet", axis: "eyeFront", base: 0.12, mul: 0.63 }),
    ]);


    // ULTRAGUSS U4 — DIE DIAL→TIER-ALLOMETRIE (verbatim aus dem Lab gewandert;
    // die EINE Quelle für Lab-Anatomie UND jeden künftigen Leser). Reine Mathe:
    // dials {size, neckLen, legLen, diet, build} → ~25 abgeleitete Größen
    // (Muskel-Skalierung ^0.67 · Schädel ^0.25 · Schnauze/Auge aus diet ·
    // Fell-Dichten · Farb-Triade). MESHFREI §8 — Zahlen, keine Meshes.
    function deriveTierParams(d) {
        var size = d.size, neckLen = d.neckLen, legLen = d.legLen, diet = d.diet, build = d.build;
        var legMuscle = 0.42 * Math.pow(size / 2.4, 0.67) + (build - 0.5) * 0.3;
        legMuscle = Math.max(0.10, Math.min(0.90, legMuscle));
        var neckAng = 8 + (neckLen - 0.263) * 55,
            snoutZ = 1.50 + (1 - diet) * 0.35,
            snoutX = 0.92 - (1 - diet) * 0.25,
            eyeFwd = 0.05 + diet * 0.18,
            noseW = 2.00 - diet * 0.40;
        var bWF = 0.35 + build * 0.20,
            bellyD = 0.04 + build * 0.18,
            skullR = 0.064 * Math.pow(size / 2.4, 0.25),
            tailSegs = Math.round(4 + (1 - build) * 7);
        var cB, cD, cL, base;
        if (diet > 0.7) { cB = 0x6b5840; cD = 0x3a2e1c; cL = 0xc0a060; base = '#5a4838'; }
        else if (diet > 0.3) { cB = 0x3a2a1a; cD = 0x1a1208; cL = 0x5a4030; base = '#3a2a18'; }
        else { cB = 0x7a5a38; cD = 0x3a2a18; cL = 0x9a7a50; base = '#6a4a28'; }
        var guardL = 0.025 + build * 0.020,
            underL = 0.010 + build * 0.010,
            gDens = Math.round(30000 + build * 30000),
            uDens = Math.round(15000 + build * 14000),
            maneCount = Math.round(2000 * diet),
            maneLen = 0.16;
        return {
            size: size, neckLen: neckLen, neckAng: neckAng, legLen: legLen, legMuscle: legMuscle,
            diet: diet, build: build, snoutZ: snoutZ, snoutX: snoutX, eyeFwd: eyeFwd, noseW: noseW,
            bWF: bWF, bellyD: bellyD, skullR: skullR, tailSegs: tailSegs,
            cB: cB, cD: cD, cL: cL, base: base,
            guardL: guardL, underL: underL, gDens: gDens, uDens: uDens,
            maneCount: maneCount, maneLen: maneLen, throat: 0.15 + diet * 0.10,
        };
    }

    // ULTRAGUSS U4 — DER CPG-PHASEN-SCHRITT (das Gang-Netz-Gesetz, verbatim aus
    // dem Lab): phases[4] werden über die Kopplungs-Matrix + Gain 0.8 fortgeschrieben.
    function cpgStep(phases, freq, coupling, dt) {
        var d = [0, 0, 0, 0];
        for (var i = 0; i < 4; i++) {
            var c = 0;
            for (var j = 0; j < 4; j++) c += coupling[i][j] * Math.sin(phases[j] - phases[i]);
            d[i] = freq + c * 0.8;
        }
        for (var k = 0; k < 4; k++) phases[k] += d[k] * dt;
        return phases;
    }

    // KONVERGENZ III — die Tier-Materialfarben (verbatim aus buildAnimal Z.137):
    var TIER_MATERIAL_KLASSEN = Object.freeze({
        nase: Object.freeze({ c: 0x060606, r: 0.1 }),
        tierauge: Object.freeze({ c: 0xeec040, r: 0.06, emissiv: 0x442200, ei: 0.3 }),
        pupille: Object.freeze({ c: 0x000000, r: 0.2 }),
        hornhaut: Object.freeze({ c: 0xffffff, r: 0 }),
        klaue: Object.freeze({ c: 0x181818, r: 0.2 }),
        ballen: Object.freeze({ c: 0x161616, r: 0.45 }),
        zahn: Object.freeze({ c: 0xeeeeee, r: 0.18 }),
        zahnfleisch: Object.freeze({ c: 0x060606, r: 0.5 }),
        dunkel: Object.freeze({ c: 0x040000, r: 0.9 }),
    });

    // ════════════════════════════════════════════════════════════════════
    // KONVERGENZ III — DER EINE TIER-BAU: bauTier(F, dials) baut den kompletten
    // Studio-Vierbeiner (verbatim aus worlds/tetrapoda/tetrapoda.js buildAnimal
    // gewandert; der Schöpfer formte ihn) über FABRIK-HAKEN — MESHFREI §8:
    // der Kern NENNT keine Meshes, F baut. Haken:
    //   F.gruppe() · F.kugel(r, klasse, sc?) · F.zylinder(rt,rb,h, klasse) ·
    //   F.kugelFein(r, klasse, segs) · F.v3(x,y,z) (Vektor MIT clone/add/
    //   multiplyScalar/normalize/sub — beide Leser reichen ihre echte Klasse) ·
    //   F.richte(node, dirV3) (Knoten-Ausrichtung) · F.fellSchweif(segG, segR, i)
    //   (Schweif-Strähnen — die Shell streut, der Stamm lässt es).
    // Klassen: fell · straehne · nase · tierauge · pupille · hornhaut · klaue ·
    // ballen · zahn · zahnfleisch · dunkel (Farben: TIER_MATERIAL_KLASSEN).
    // Rückgabe: {teile, tailSegs, spineSegs, neckSegs, pawOffsets, masse, P}.
    function bauTier(F, dials) {
        var wolf, headGroup, jawGroup, earL, earR, lidTL, lidTR, tailRoot, legFL, legFR, legHL, legHR, shoulderL, shoulderR, ribcage, waist, flank, belly, lowerAbd, mane, throat, larynx, larynxUp, deltL, deltR, tricepL, tricepR, quadL, quadR, hamL, hamR, gastroL, gastroR, gluteL, gluteR, flU, flL, flP, frU, frL, frP, hlT, hlC, hlP, hrT, hrC, hrP;
        var tricep, quad, ham, gastro;
        var tailSegs=[], spineSegs=[], neckSegs=[];

        var s = function (r, k, sc) { return F.kugel(r, k, sc); };
        var cH = function (rt, rb, h, k) { return F.zylinder(rt, rb, h, k); };
        var boneSph = function (r, len, k) { return s(r, k, [0.92, len / (2 * r), 0.92]); };
        var pawOffsets=[0,0,0,0];
          var P = dials && dials.legMuscle != null && dials.size != null ? dials : deriveTierParams(dials || {});H=P.size;sY=H;hY=H*0.858;sZ=H*0.458;hZ=-H*0.50;lv=1.0+P.legMuscle;by=P.bellyD;tv=P.throat;
          var bX=P.bWF,hipY=hY-0.09*H,hipJointY=hY-0.06*H;bt=1.0+(P.build-0.42)*1.2;
          var hindReach=P.legLen*H*3.5,hindLegY=Math.min(hipY,hindReach+0.02*H);
          var spF=STAND_POSE[0],spH=STAND_POSE[2];
          var fRH=spF[0]+spF[1],fRR=fRH+spF[2],fRM=fRR+spF[3];
          var hRH=spH[0]+spH[1],hTR=hRH+spH[2],hTM=hTR+spH[3];
          var frontYReach=P.legLen*H*(Math.cos(25*Math.PI/180+fRH)+1.45*Math.cos(10*Math.PI/180+fRR)+0.91*Math.cos(15*Math.PI/180+fRM))+0.014*H;
          var hindYReach=P.legLen*H*(1.27*Math.cos(35*Math.PI/180+hRH)+1.73*Math.cos(45*Math.PI/180+hTR)+1.18*Math.cos(5*Math.PI/180+hTM))+0.011*H;
          var frontLegY=hindLegY-hindYReach+frontYReach;
          pawOffsets[0]=pawOffsets[1]=P.legLen*0.91*H*Math.cos(15*Math.PI/180)+0.012*H;
          pawOffsets[2]=pawOffsets[3]=P.legLen*1.18*H*Math.cos(5*Math.PI/180)+0.010*H;
        wolf=F.gruppe();
          ribcage=s(0.42*H,"fell",[bX,0.76,0.78]);ribcage.position.set(0,sY-0.22*H,0.42);wolf.add(ribcage);
          var ribFront=s(0.36*H,"fell",[bX*0.96,0.66,0.74]);ribFront.position.set(0,sY-0.26*H,0.72);wolf.add(ribFront);
          var lowerRib=s(0.32*H,"fell",[bX*0.96,0.62,0.88]);lowerRib.position.set(0,sY-0.30*H,0.14);wolf.add(lowerRib);
          var sternum=s(0.17*H,"fell",[bX*0.88,0.36,0.82]);sternum.position.set(0,sY-0.40*H,0.48);wolf.add(sternum);
          waist=s(0.30*H,"fell",[bX*0.92,0.56,0.96]);waist.position.set(0,sY-0.34*H+by*2,-0.12-by*0.8);wolf.add(waist);
          flank=s(0.28*H,"fell",[bX*0.88,0.52,0.94]);flank.position.set(0,sY-0.38*H+by*1.5,-0.30-by);wolf.add(flank);
          belly=s(0.30*H,"fell",[bX*0.92,0.50+by*0.8,0.96]);belly.position.set(0,sY-0.38*H+by*2,-0.35-by*1.5);wolf.add(belly);
          lowerAbd=s(0.28*H,"fell",[bX*0.83,0.48,0.90]);lowerAbd.position.set(0,sY-0.34*H+by*2,-0.55-by*1.5);wolf.add(lowerAbd);
          var loinBridge=s(0.24*H,"fell",[bX*0.83,0.52,0.88]);loinBridge.position.set(0,sY-0.32*H,-0.42);wolf.add(loinBridge);
          var hipTrans=s(0.22*H,"fell",[bX*0.79,0.58,0.54]);hipTrans.position.set(0,hY+0.06*H,-0.42);wolf.add(hipTrans);
          var upperPel=s(0.25*H,"fell",[bX*0.75,0.60,0.58]);upperPel.position.set(0,hY-0.02*H,-0.58);wolf.add(upperPel);
          var pelvis=s(0.28*H,"fell",[bX*0.79,0.66,0.42]);pelvis.position.set(0,hY-0.06*H,-0.74);wolf.add(pelvis);
          var croup=s(0.20*H,"fell",[bX*1.04,0.44,0.36]);croup.position.set(0,hY-0.10*H,-0.88);croup.rotation.x=0.22;wolf.add(croup);
          var loin=s(0.28*H,"fell",[bX*0.79,0.60,1.48]);loin.position.set(0,topY(-0.20)-0.04*H,-0.20);wolf.add(loin);
          var hipJoint=s(0.17*H,"fell",[bX*1.74*1.20,0.56*0.80,0.82]);hipJoint.position.set(0,hipJointY+0.01*H,-0.82);wolf.add(hipJoint);
          var brisket=s(0.20*H,"fell",[bX*1.04,0.58,0.78]);brisket.position.set(0,sY-0.38*H,0.62);wolf.add(brisket);
          var chestLow=s(0.17*H,"fell",[bX*0.96,0.54,0.82]);chestLow.position.set(0,sY-0.44*H,0.34);wolf.add(chestLow);
          var chestFront=s(0.15*H,"fell",[bX*0.88,0.56,0.70]);chestFront.position.set(0,sY-0.36*H,0.82);wolf.add(chestFront);
          function buildPec(side){var p=s(0.10*H,"fell",[bX*0.92,0.48,0.82]);p.position.set(side*0.08*H,sY-0.36*H,0.58);p.rotation.z=side*0.15;return p;}wolf.add(buildPec(-1));wolf.add(buildPec(1));
          function buildScap(side){var sp=s(0.09*H,"fell",[0.28,1.12,0.34]);sp.position.set(side*0.05*H,topY(0.48)-0.025,0.48);sp.rotation.z=side*0.22;return sp;}wolf.add(buildScap(-1));wolf.add(buildScap(1));
          var longZ=[0.42,0.16,-0.12,-0.36,-0.56];for(var i=0;i<5;i++){var segY=topY(longZ[i])-0.018;for(var sd=-1;sd<=1;sd+=2){var seg=s(0.048*H,"fell",[bX*0.96,0.50,0.78]);seg.position.set(sd*0.048*H,segY,longZ[i]);wolf.add(seg);spineSegs.push(seg);} }
          function buildTrap(side){var t=s(0.09*H,"fell",[bX*0.96,0.52,0.84]);t.position.set(side*0.05*H,topY(0.48)-0.025,0.48);t.rotation.z=side*0.10;return t;}wolf.add(buildTrap(-1));wolf.add(buildTrap(1));
          var withersBridge=s(0.14*H,"fell",[bX*1.25,0.56,0.66]);withersBridge.position.set(0,sY-0.04*H,0.60);wolf.add(withersBridge);
          var chestNeckBridge=s(0.095*H,"fell",[bX*1.40,0.55,0.95]);chestNeckBridge.position.set(0,sY-0.17*H,0.82);wolf.add(chestNeckBridge);
          function buildFrontLeg(side){var g=F.gruppe();g.position.set(side*0.115*H,frontLegY,sZ-0.02*H);var rS=0.068*H,rE=0.050*H*Math.pow(bt,0.6),rC=0.042*H*Math.pow(bt,1.0),rM=0.028*H*Math.pow(bt,1.3);
            var scap=s(0.09*H,"fell",[0.28,1.12,0.34]);scap.position.set(side*-0.025,0.08*H,-0.03*H);scap.rotation.z=side*0.22;g.add(scap);
            var delt=s(rS*1.15,"fell",[1.10,1.32,1.05*lv]);delt.position.set(side*0.015,0.0,0.004*H);g.add(delt);if(side<0)deltL=delt;else deltR=delt;
            var humLen=P.legLen*H,humAng=25*Math.PI/180;var humVec=F.v3(0,-humLen*Math.cos(humAng),-humLen*Math.sin(humAng));var upper=F.gruppe();g.add(upper);var hum=boneSph(rS*0.50,humLen,"fell");hum.position.copy(humVec.clone().multiplyScalar(0.5));hum.rotation.x=humAng;upper.add(hum);
            tricep=s(0.092*H,"fell",[0.72,1.44,0.62*lv]);tricep.position.copy(humVec.clone().multiplyScalar(0.5).add(F.v3(0,0.005*H,-0.012*H)));tricep.rotation.x=humAng;upper.add(tricep);if(side<0)tricepL=tricep;else tricepR=tricep;
            var bic=s(0.065*H,"fell",[0.52,1.5,0.48]);bic.position.copy(humVec.clone().multiplyScalar(0.5).add(F.v3(0,0,0.014*H)));bic.rotation.x=humAng;upper.add(bic);
            var hf=s(0.048*H*Math.pow(bt,0.3),"fell",[0.95,0.9,0.95]);hf.position.copy(humVec.clone().multiplyScalar(0.2));hf.rotation.x=humAng;upper.add(hf);
            var elbow=s(rE*1.08,"fell",[0.85,0.75,1.0]);elbow.position.copy(humVec);upper.add(elbow);
            var radLen=P.legLen*1.45*H,radAng=10*Math.PI/180;var radVec=F.v3(0,-radLen*Math.cos(radAng),radLen*Math.sin(radAng));var lower=F.gruppe();lower.position.copy(humVec);upper.add(lower);var fa=boneSph(rE*0.55,radLen,"fell");fa.position.copy(radVec.clone().multiplyScalar(0.5));fa.rotation.x=-radAng;lower.add(fa);var rf=s(0.030*H*Math.pow(bt,0.8),"fell",[0.95,0.9,0.95]);rf.position.copy(radVec.clone().multiplyScalar(0.55));rf.rotation.x=-radAng;lower.add(rf);var ext=s(0.022*H*Math.pow(bt,1.0),"fell",[0.36,1.2,0.32]);ext.position.copy(radVec.clone().multiplyScalar(0.2).add(F.v3(0,0,0.012*H)));ext.rotation.x=-radAng;lower.add(ext);var carpus=s(rC*1.08,"fell",[0.85,0.65,1.0]);carpus.position.copy(radVec);lower.add(carpus);
            var metaLen=P.legLen*0.91*H,metaAng=15*Math.PI/180;var metaVec=F.v3(0,-metaLen*Math.cos(metaAng),metaLen*Math.sin(metaAng));var pawG=F.gruppe();pawG.position.copy(radVec);lower.add(pawG);var meta=boneSph(rC*0.68,metaLen,"fell");meta.position.copy(metaVec.clone().multiplyScalar(0.5));meta.rotation.x=-metaAng;pawG.add(meta);var metaFlesh=s(0.026*H*Math.pow(bt,1.2),"fell",[0.95,1.0,0.85]);metaFlesh.position.copy(metaVec.clone().multiplyScalar(0.5).add(F.v3(0,0.002*H,0.006*H)));metaFlesh.rotation.x=-metaAng;pawG.add(metaFlesh);var paw=F.gruppe();paw.position.copy(metaVec);pawG.add(paw);var padMain=s(0.015*H,"ballen",[1.6,0.28,1.2]);padMain.position.set(0,-0.010*H,0.010*H);paw.add(padMain);var pm=s(rM*1.05,"fell",[1.0,0.30,1.0]);pm.position.set(0,0.002*H,0.012*H);paw.add(pm);for(var i=0;i<4;i++){var tx=(i-1.5)*0.022*H;var toe=s(0.010*H,"fell",[1.0,0.58,1.5]);toe.position.set(tx,-0.002*H,0.024*H);paw.add(toe);var claw=s(0.003*H,"klaue",[1.0,1.3,1.0]);claw.position.set(tx,-0.012*H,0.048*H);claw.rotation.x=0.42;paw.add(claw);var toePad=s(0.006*H,"ballen",[1.5,0.28,1.2]);toePad.position.set(tx,-0.010*H,0.022*H);paw.add(toePad);}var dew=s(0.005*H,"fell",[1.0,1.0,1.0]);dew.position.set(side*0.024*H,0,-0.010*H);paw.add(dew);if(side<0){flU=upper;flL=lower;flP=pawG;}else{frU=upper;frL=lower;frP=pawG;}return g;}
          function buildHindLeg(side){var g=F.gruppe();g.position.set(side*0.088*H,hindLegY,hZ+0.04);var rH=0.080*H,rSt=0.062*H*Math.pow(bt,0.6),rHk=0.048*H*Math.pow(bt,1.0),rMT=0.028*H*Math.pow(bt,1.3);
            var glute=s(rH*1.35,"fell",[1.10,1.10*lv,1.22*lv]);glute.position.set(side*-0.028,0.030*H,-0.020*H);g.add(glute);if(side<0)gluteL=glute;else gluteR=glute;
            var tfl=s(0.044*H,"fell",[0.48,1.12,0.42]);tfl.position.set(side*0.012,-0.04*H,0.045*H);g.add(tfl);
            var femLen=P.legLen*1.27*H,femAng=35*Math.PI/180;var femVec=F.v3(0,-femLen*Math.cos(femAng),femLen*Math.sin(femAng));var thigh=F.gruppe();g.add(thigh);var fem=boneSph(rH*0.50,femLen,"fell");fem.position.copy(femVec.clone().multiplyScalar(0.5));fem.rotation.x=-femAng;thigh.add(fem);
            quad=s(0.084*H,"fell",[0.52,1.86,0.74*lv]);quad.position.copy(femVec.clone().multiplyScalar(0.5).add(F.v3(0,0,0.040*H)));quad.rotation.x=-femAng;thigh.add(quad);if(side<0)quadL=quad;else quadR=quad;
            ham=s(0.094*H,"fell",[0.74,1.70,0.84*lv]);ham.position.copy(femVec.clone().multiplyScalar(0.5).add(F.v3(0,0,-0.026*H)));ham.rotation.x=-femAng;thigh.add(ham);if(side<0)hamL=ham;else hamR=ham;
            var semi=s(0.058*H,"fell",[0.50,1.22,0.60]);semi.position.copy(femVec.clone().multiplyScalar(0.45).add(F.v3(0,-0.04*H,-0.014*H)));semi.rotation.x=-femAng;thigh.add(semi);var ff=s(0.050*H*Math.pow(bt,0.3),"fell",[0.95,0.9,0.95]);ff.position.copy(femVec.clone().multiplyScalar(0.18));ff.rotation.x=-femAng;thigh.add(ff);var stifle=s(rSt*1.10,"fell",[0.85,0.70,1.0]);stifle.position.copy(femVec);thigh.add(stifle);
            var tibLen=P.legLen*1.73*H,tibAng=45*Math.PI/180;var tibVec=F.v3(0,-tibLen*Math.cos(tibAng),-tibLen*Math.sin(tibAng));var calf=F.gruppe();calf.position.copy(femVec);thigh.add(calf);var tib=boneSph(rSt*0.54,tibLen,"fell");tib.position.copy(tibVec.clone().multiplyScalar(0.5));tib.rotation.x=tibAng;calf.add(tib);gastro=s(0.052*H,"fell",[0.52,1.52,0.50*lv]);gastro.position.copy(tibVec.clone().multiplyScalar(0.25).add(F.v3(0,0,-0.012*H)));gastro.rotation.x=tibAng;calf.add(gastro);if(side<0)gastroL=gastro;else gastroR=gastro;var tf=s(0.034*H*Math.pow(bt,0.8),"fell",[0.95,0.9,0.95]);tf.position.copy(tibVec.clone().multiplyScalar(0.6));tf.rotation.x=tibAng;calf.add(tf);var hock=s(rHk*1.14,"fell",[0.85,0.68,1.0]);hock.position.copy(tibVec);calf.add(hock);
            var metaTLen=P.legLen*1.18*H,metaTAng=5*Math.PI/180;var metaTVec=F.v3(0,-metaTLen*Math.cos(metaTAng),metaTLen*Math.sin(metaTAng));var pawG=F.gruppe();pawG.position.copy(tibVec);calf.add(pawG);var metaT2=boneSph(rHk*0.68,metaTLen,"fell");metaT2.position.copy(metaTVec.clone().multiplyScalar(0.5));metaT2.rotation.x=-metaTAng;pawG.add(metaT2);var metaTFlesh=s(0.024*H*Math.pow(bt,1.2),"fell",[0.95,1.0,0.85]);metaTFlesh.position.copy(metaTVec.clone().multiplyScalar(0.5).add(F.v3(0,0.002*H,0.005*H)));metaTFlesh.rotation.x=-metaTAng;pawG.add(metaTFlesh);var paw=F.gruppe();paw.position.copy(metaTVec);pawG.add(paw);var padMain2=s(0.013*H,"ballen",[1.6,0.26,1.2]);padMain2.position.set(0,-0.008*H,0.008*H);paw.add(padMain2);var pm2=s(rMT*1.02,"fell",[1.0,0.28,1.0]);pm2.position.set(0,0.002*H,0.012*H);paw.add(pm2);for(var i=0;i<4;i++){var tx2=(i-1.5)*0.018*H;var toe2=s(0.009*H,"fell",[1.0,0.52,1.4]);toe2.position.set(tx2,-0.002*H,0.022*H);paw.add(toe2);var claw2=s(0.0028*H,"klaue",[1.0,1.3,1.0]);claw2.position.set(tx2,-0.010*H,0.042*H);claw2.rotation.x=0.42;paw.add(claw2);var toePad2=s(0.005*H,"ballen",[1.4,0.28,1.2]);toePad2.position.set(tx2,-0.008*H,0.020*H);paw.add(toePad2);}if(side<0){hlT=thigh;hlC=calf;hlP=pawG;}else{hrT=thigh;hrC=calf;hrP=pawG;}return g;}
          legFL=buildFrontLeg(-1);legFR=buildFrontLeg(1);legHL=buildHindLeg(-1);legHR=buildHindLeg(1);
          function buildShoulderBridge(side){var wrap=F.gruppe();wrap.position.set(0,0.024*H,0);wrap.scale.set(0.80,1.20,1.0);var b=s(0.125*H,"fell",[bX*1.38,0.89,0.74]);b.rotation.z=side*0.10;wrap.add(b);if(side<0)shoulderL=b;else shoulderR=b;return wrap;}legFL.add(buildShoulderBridge(-1));legFR.add(buildShoulderBridge(1));
          function buildShoulderConnect(side){var wrap=F.gruppe();wrap.position.set(-side*0.015*H,-0.01*H,-0.04*H);wrap.scale.set(0.80,1.20,1.0);var c1=s(0.085*H,"fell",[1.18,0.70,0.64]);c1.rotation.z=side*0.12;wrap.add(c1);return wrap;}legFL.add(buildShoulderConnect(-1));legFR.add(buildShoulderConnect(1));
          wolf.add(legFL);wolf.add(legFR);wolf.add(legHL);wolf.add(legHR);
          var neckBaseZ=0.92,nLen=P.neckLen*H,nAng=P.neckAng*Math.PI/180;var neckStart=F.v3(0,sY-0.06*H,neckBaseZ);var neckEnd=F.v3(0,neckStart.y+nLen*Math.sin(nAng),neckBaseZ+nLen*Math.cos(nAng));var neckDir=neckEnd.clone().sub(neckStart);var neckN=neckDir.clone().normalize();var nThick=P.build<0.3?[0.10,0.09,0.08,0.06]:P.build<0.5?[0.13,0.12,0.11,0.09]:[0.16,0.15,0.13,0.11];var nR=nThick.map(function(t){return t*H;});var nPos=[0.0,0.30,0.60,1.0];for(var i=0;i<4;i++){var nP=neckStart.clone().add(neckDir.clone().multiplyScalar(nPos[i]));nP.y+=Math.sin(nPos[i]*Math.PI)*0.020*H;var nS=s(nR[i],"fell",[0.90,0.94,1.18]);nS.position.copy(nP);wolf.add(nS);neckSegs.push(nS);}function buildNeckRidge(side){var r=s(0.024*H,"fell",[0.32,2.8,0.32]);var mid=neckStart.clone().add(neckDir.clone().multiplyScalar(0.5));r.position.copy(mid.clone().add(F.v3(side*0.022*H,0.022*H,0)));F.richte(r,neckN);return r;}wolf.add(buildNeckRidge(-1));wolf.add(buildNeckRidge(1));mane=s(0.062*H,"fell",[0.85,0.70,1.38]);mane.position.copy(neckStart.clone().add(neckDir.clone().multiplyScalar(0.25)).add(F.v3(0,-0.02*H,0)));wolf.add(mane);throat=s(0.066*H,"fell",[0.52+tv*0.2,1+tv*2,1+tv*1.5]);throat.position.copy(neckStart.clone().add(neckDir.clone().multiplyScalar(0.28)).add(F.v3(0,-0.038*H,0.01*H)));wolf.add(throat);var throatLower=s(0.056*H,"fell",[0.50+tv*0.1,1+tv*1.5,1+tv]);throatLower.position.copy(neckStart.clone().add(neckDir.clone().multiplyScalar(0.48)).add(F.v3(0,-0.028*H,0.01*H)));wolf.add(throatLower);larynx=s(0.064*H,"fell",[0.52+tv*0.2,1+tv*3,1+tv*2]);larynx.position.copy(neckStart.clone().add(neckDir.clone().multiplyScalar(0.63)).add(F.v3(0,-0.018*H,0.008*H)));wolf.add(larynx);larynxUp=s(0.054*H,"fell",[0.52+tv*0.2,1+tv*3,1+tv*2]);larynxUp.position.copy(neckStart.clone().add(neckDir.clone().multiplyScalar(0.78)).add(F.v3(0,-0.008*H,0.005*H)));wolf.add(larynxUp);
          var neckHeadBlend=s(0.082*H,"fell",[0.68,1.01,1.45]);neckHeadBlend.position.copy(neckEnd);neckHeadBlend.position.y-=0.008*H;wolf.add(neckHeadBlend);
          var fBk=F.v3(0,-0.12,-0.92);tailRoot=F.gruppe();tailRoot.position.set(0,hY-0.10*H,-0.92-0.08*H);tailRoot.scale.z=1.6;wolf.add(tailRoot);var tailParent=tailRoot;for(var i=0;i<P.tailSegs;i++){var segG=F.gruppe();var segR=Math.max(0.014,0.036*H-i*0.004*H);var seg=s(segR,"fell",[0.95,1.18,1.18]);seg.position.z=-0.048*H;segG.add(seg);F.fellSchweif(segG,segR,i);segG.position.z=(i===0)?0:-0.042*H;if(i>0)segG.position.y=-0.003*H*(i+1);tailParent.add(segG);tailParent=segG;tailSegs.push(segG);}
          var headY=neckEnd.y-0.02*H-0.008*H,headZ=neckEnd.z+0.12*H;headGroup=F.gruppe();headGroup.position.set(0,headY,headZ);
          var cranium=s(P.skullR*H,"fell",[0.95,0.96,1.26]);cranium.position.set(0,0.030*H,-0.08*H);headGroup.add(cranium);var sagCrest=cH(0.004*H,0.012*H,0.060*H,"fell");sagCrest.position.set(0,0.070*H,-0.06*H);headGroup.add(sagCrest);function buildTemp(side){var t=s(0.032*H,"fell",[0.50,0.82,0.58]);t.position.set(side*0.050*H,0.024*H,-0.038*H);return t;}headGroup.add(buildTemp(-1));headGroup.add(buildTemp(1));var forehead=s(0.046*H,"fell",[1.18,0.68,0.72]);forehead.position.set(0,0.036*H,0.0);forehead.rotation.x=0.28;headGroup.add(forehead);var stopBump=s(0.020*H,"fell",[1.35,0.55,0.85]);stopBump.position.set(0,0.024*H,0.030*H);headGroup.add(stopBump);var faceBase=s(0.044*H,"fell",[1.00,0.82,0.86]);faceBase.position.set(0,0.004*H,0.040*H);headGroup.add(faceBase);function buildZyg(side){var z=s(0.028*H,"fell",[1.08,0.48,0.74]);z.position.set(side*0.050*H,-0.008*H,0.030*H);return z;}headGroup.add(buildZyg(-1));headGroup.add(buildZyg(1));function buildMass(side){var m=s(0.032*H,"fell",[0.72,0.98,0.72]);m.position.set(side*0.048*H,-0.032*H,0.036*H);return m;}headGroup.add(buildMass(-1));headGroup.add(buildMass(1));function buildJowl(side){var j=s(0.022*H,"fell",[0.82,0.62,0.90]);j.position.set(side*0.042*H,-0.026*H,0.060*H);return j;}headGroup.add(buildJowl(-1));headGroup.add(buildJowl(1));var maxG=F.gruppe();maxG.position.set(0,-0.012*H,0.028*H);var muzzle=s(0.044*H,"fell",[P.snoutX,0.78,P.snoutZ]);muzzle.position.set(0,-0.006*H,0.060*H);maxG.add(muzzle);var muzzleBridge=s(0.036*H,"fell",[P.snoutX*0.87,0.62,P.snoutZ*0.61]);muzzleBridge.position.set(0,0.006*H,0.048*H);maxG.add(muzzleBridge);var palate=s(0.026*H,"fell",[1.00,0.55,0.72]);palate.position.set(0,-0.020*H,0.066*H);maxG.add(palate);var palateMesh=s(0.016*H,"zahnfleisch",[2.0,0.2,1.60]);palateMesh.position.set(0,-0.018*H,0.066*H);maxG.add(palateMesh);var noseTip=s(0.026*H,"fell",[0.95,0.72,0.68]);noseTip.position.set(0,-0.014*H,0.110*H);maxG.add(noseTip);var noseB=cH(0.015*H,0.008*H,0.072*H,matStrandDk);noseB.rotation.x=Math.PI/2;noseB.position.set(0,0.004*H,0.068*H);maxG.add(noseB);var nose=s(0.020*H,"nase",[P.noseW,0.86,0.70]);nose.position.set(0,-0.014*H,0.132*H);maxG.add(nose);for(var sd=-1;sd<=1;sd+=2){var n2=s(0.006*H,"dunkel",[1.2,0.5,1.0]);n2.position.set(sd*0.012*H,-0.008*H,0.138*H);maxG.add(n2);}var ulip=s(0.016*H,"fell",[1.42,0.44,0.88]);ulip.position.set(0,-0.024*H,0.112*H);maxG.add(ulip);for(var sd=-1;sd<=1;sd+=2){var fang=cH(0.004*H,0.0015*H,0.030*H,"zahn");fang.position.set(sd*0.018*H,-0.030*H,0.085*H);fang.rotation.x=Math.PI*0.92;maxG.add(fang);var carn=cH(0.0045*H,0.002*H,0.024*H,"zahn");carn.position.set(sd*0.024*H,-0.024*H,0.050*H);carn.rotation.x=Math.PI;maxG.add(carn);}for(var i=0;i<3;i++){var inc=cH(0.0025*H,0.001*H,0.014*H,"zahn");inc.position.set((i-1)*0.009*H,-0.026*H,0.100*H);inc.rotation.x=Math.PI;maxG.add(inc);}headGroup.add(maxG);jawGroup=F.gruppe();jawGroup.position.set(0,-0.040*H,-0.018*H);var jawLen=P.diet>0.7?1.60:P.diet>0.3?1.50:1.65;var jawBody=s(0.027*H,"fell",[0.74,0.62,jawLen]);jawBody.position.set(0,-0.006*H,0.062*H);jawGroup.add(jawBody);var chin=s(0.019*H,"fell",[0.92,0.70,0.58]);chin.position.set(0,-0.016*H,0.122*H);jawGroup.add(chin);var llip=s(0.014*H,"fell",[1.30,0.42,0.76]);llip.position.set(0,-0.018*H,0.100*H);jawGroup.add(llip);var tongue=s(0.013*H,"zahnfleisch",[1.5,0.42,1.36]);tongue.position.set(0,-0.028*H,0.076*H);jawGroup.add(tongue);for(var sd=-1;sd<=1;sd+=2){var fangL=cH(0.0035*H,0.0012*H,0.026*H,"zahn");fangL.position.set(sd*0.016*H,0.016*H,0.104*H);jawGroup.add(fangL);var carnL=cH(0.004*H,0.0018*H,0.022*H,"zahn");carnL.position.set(sd*0.022*H,0.010*H,0.056*H);jawGroup.add(carnL);}for(var i=0;i<3;i++){var incL=cH(0.0022*H,0.0008*H,0.012*H,"zahn");incL.position.set((i-1)*0.008*H,0.012*H,0.116*H);jawGroup.add(incL);}headGroup.add(jawGroup);
          var jawThroatFill=s(0.044*H,"fell",[1.30,1.60,1.70]);jawThroatFill.position.set(0,-0.006*H,0.010*H);headGroup.add(jawThroatFill);
          var cheekFill=s(0.030*H,"fell",[1.50,0.85,1.15]);cheekFill.position.set(0,0.002*H,0.038*H);headGroup.add(cheekFill);
          var jawHingeFill=s(0.024*H,"fell",[1.20,0.65,1.05]);jawHingeFill.position.set(0,-0.034*H,-0.022*H);headGroup.add(jawHingeFill);
          var eyeY=0.016-(1-P.diet)*0.006;function buildEye(side){var e=F.gruppe();var socket=s(0.024*H,"dunkel",[1.10,1.12,0.48]);socket.position.z=-0.004*H;e.add(socket);var ball=s(0.017*H,"tierauge",[1.0,1.0,0.9]);e.add(ball);var pup=s(0.009*H,"pupille",[0.8,0.8,0.5]);pup.position.z=0.012*H;e.add(pup);var cor=F.kugelFein(0.019*H,"hornhaut",32);e.add(cor);var lidT=s(0.019*H,"fell",[0.98,0.32,0.88]);lidT.position.y=0.012*H;e.add(lidT);if(side<0)lidTL=lidT;else lidTR=lidT;var lidB=s(0.017*H,"fell",[0.94,0.36,0.88]);lidB.position.y=-0.012*H;e.add(lidB);e.position.set(side*0.054*H,eyeY*H,0.014*H);e.rotation.y=side*P.eyeFwd;return e;}headGroup.add(buildEye(-1));headGroup.add(buildEye(1));function buildEar(side){var e=F.gruppe();var outer=cH(0.003*H,0.015*H,0.062*H,"fell");outer.position.y=0.032*H;outer.scale.z=0.32;e.add(outer);var inner=cH(0.002*H,0.011*H,0.052*H,"zahnfleisch");inner.position.set(0,0.028*H,-0.004*H);inner.scale.z=0.28;e.add(inner);var rim=cH(0.0022*H,0.0018*H,0.062*H,matStrandDk);rim.position.set(side*0.002,0.032*H,0.002);rim.scale.z=0.30;e.add(rim);e.position.set(side*0.046*H,0.066*H,-0.052*H);e.rotation.z=side*0.15;e.rotation.x=-0.08;return e;}earL=buildEar(-1);earR=buildEar(1);headGroup.add(earL);headGroup.add(earR);wolf.add(headGroup);
        return {
            teile: {wolf: wolf, headGroup: headGroup, jawGroup: jawGroup, earL: earL, earR: earR, lidTL: lidTL, lidTR: lidTR, tailRoot: tailRoot, legFL: legFL, legFR: legFR, legHL: legHL, legHR: legHR, shoulderL: shoulderL, shoulderR: shoulderR, ribcage: ribcage, waist: waist, flank: flank, belly: belly, lowerAbd: lowerAbd, mane: mane, throat: throat, larynx: larynx, larynxUp: larynxUp, deltL: deltL, deltR: deltR, tricepL: tricepL, tricepR: tricepR, quadL: quadL, quadR: quadR, hamL: hamL, hamR: hamR, gastroL: gastroL, gastroR: gastroR, gluteL: gluteL, gluteR: gluteR, flU: flU, flL: flL, flP: flP, frU: frU, frL: frL, frP: frP, hlT: hlT, hlC: hlC, hlP: hlP, hrT: hrT, hrC: hrC, hrP: hrP, croup: croup, pelvis: pelvis, throatLower: throatLower, cranium: cranium},
            neckStart: neckStart, neckDir: neckDir, neckEnd: neckEnd,
            tailSegs: tailSegs, spineSegs: spineSegs, neckSegs: neckSegs,
            pawOffsets: pawOffsets,
            masse: { H: H, sY: sY, hY: hY, sZ: sZ, hZ: hZ, bX: bX, bt: bt, lv: lv, by: by, tv: tv },
            P: P,
        };
    }

    // ── Der Namensraum (Vertrag v1.1 §7 + §8 MESHFREI) ──
    root.__tetrapodaCore = {
        VERSION: VERSION,
        ARCHETYPES: ARCHETYPES,
        buildSkeleton: buildSkeleton,
        deriveTierParams: deriveTierParams,
        cpgStep: cpgStep,
        bauTier: bauTier,
        TIER_MATERIAL_KLASSEN: TIER_MATERIAL_KLASSEN,
        DIAL_MAP: DIAL_MAP,
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
