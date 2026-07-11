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

    // ── Der Namensraum (Vertrag v1.1 §7 + §8 MESHFREI) ──
    root.__tetrapodaCore = {
        VERSION: VERSION,
        ARCHETYPES: ARCHETYPES,
        buildSkeleton: buildSkeleton,
        deriveTierParams: deriveTierParams,
        cpgStep: cpgStep,
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
