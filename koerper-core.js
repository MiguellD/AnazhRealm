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


    // KONVERGENZ II — DIE FARB-WAHRHEITEN wohnen im Gesetzbuch (Schöpfer „es sind
    // noch immer nachbauten": die Stamm-KL-Tabelle und die Genom-Paletten waren
    // ZWILLINGE der Lab-Werte — gefallen; beide Leser lesen NUR noch hier):
    // MATERIAL_KLASSEN — die flachen Klassen-Farben der Lab-Materialien (Z.77,
    // verbatim: lips/eye/iris/cornea/socket/dark/joint/shadow); skin/hair reisen
    // als Genom/Wahl, shorts ist das Stamm-Würde-Band.
    var MATERIAL_KLASSEN = Object.freeze({
        lips: Object.freeze({ c: 0xaa5544, r: 0.4 }),
        eye: Object.freeze({ c: 0xf5f5f0, r: 0.08 }),
        iris: Object.freeze({ c: 0x2a4a6a, r: 0.15 }),
        pupil: Object.freeze({ c: 0x000000, r: 0.2 }),
        socket: Object.freeze({ c: 0x5a3320, r: 0.6 }),
        dark: Object.freeze({ c: 0x050000, r: 0.9 }),
        joint: Object.freeze({ c: 0x806060, r: 0.6 }),
        shadow: Object.freeze({ c: 0x8a5840, r: 0.7 }),
        shorts: Object.freeze({ c: 0x4a5058, r: 0.8 }),
    });
    // SKIN_TONES / HAIR_COLORS — die Lab-Paletten (Z.63/Z.79, verbatim):
    // prettier-ignore
    var SKIN_TONES = {porzellan:{hex:0xf0d5c0,name:'Porzellan'},hell:{hex:0xe3b898,name:'Hell'},sand:{hex:0xd4a17e,name:'Sand'},karamell:{hex:0xc48566,name:'Karamell'},bronze:{hex:0xa86a4d,name:'Bronze'},umbra:{hex:0x7d4a33,name:'Umbra'},mahagoni:{hex:0x5f3826,name:'Mahagoni'},ebenholz:{hex:0x3f2418,name:'Ebenholz'}};
    // prettier-ignore
    var HAIR_COLORS = {black:{base:0x141014,lt:0x2a2228,name:'Schwarz'},darkbrown:{base:0x2a1a10,lt:0x42291a,name:'Dunkelbraun'},brown:{base:0x472c18,lt:0x6b4226,name:'Braun'},chestnut:{base:0x6b3a1a,lt:0x8f5a2e,name:'Kastanie'},blond:{base:0xa9803f,lt:0xceac6a,name:'Blond'},platinum:{base:0xcfc097,lt:0xe8ddbf,name:'Platin'},ginger:{base:0x8a3b18,lt:0xb35e2a,name:'Rot'},grey:{base:0x6e6a66,lt:0x9a958f,name:'Grau'},white:{base:0xcecbc5,lt:0xeeece8,name:'Weiß'},blue:{base:0x244a8a,lt:0x4a78c0,name:'Blau'},pink:{base:0xb0497a,lt:0xd47aa6,name:'Pink'},teal:{base:0x1f6a66,lt:0x3a9a94,name:'Teal'}};

    // KONVERGENZ-WELLE: der 8-KH-Eigen-Atlas des Stamms (landmarks + humanSkeleton,
    // ~940 Z.) ist GEFALLEN — der EINE Mensch ist der Da-Vinci-Teile-Baum
    // (bauMensch + morphAuf, unten); beide Leser (Lab-Shell wie Stamm) bauen NUR
    // noch daraus. Kein zweites Anatomie-Gesetz mehr.

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
        const {H,headSeg,acromionY,nippleY,trochanterY,shoulderHW,hipHW,baseArmX,thighLen,calfLen,upperArmLen,forearmLen,skullBaseR,skullCY,skullRX,skullRY,skullRZ,eyeDist,jawW,chinW,browY,eyeY,cheekY,noseY,lipY,chinY,jawY,hairlineY} = labProportionen();
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
        [-1,1].forEach(sd=>{const hipG=F.gruppe();hipG.position.set(sd*hipHW*0.8,trochanterY,0);reg('hip'+(sd===1?'1':'-1'),hipG);const qR=0.32;const quad=reg('quad'+(sd===1?'1':'-1'),s(qR,matSkin,[0.9,thighLen/(qR*2),0.9]));quad.position.set(0,-thighLen/2,0.1);hipG.add(quad);const vL=reg('vlat'+(sd===1?'1':'-1'),s(0.16,matSkin,[0.85,thighLen/0.41,0.9]));vL.position.set(sd*0.17,-thighLen/2,0.06);hipG.add(vL);const ad2=reg('adduct'+(sd===1?'1':'-1'),s(0.17,matSkin,[0.9,thighLen/0.6,0.85]));ad2.position.set(sd*-0.2,-thighLen/2,-0.02);hipG.add(ad2);const ham=reg('hamstring'+(sd===1?'1':'-1'),s(0.20,matSkin,[1,thighLen/0.40,0.9]));ham.position.set(0,-thighLen/2,-0.2);hipG.add(ham);const knee=reg('kneecap'+(sd===1?'1':'-1'),s(0.24,matJoint,[1.05,0.75,1.05]));knee.position.set(0,-thighLen,0.05);hipG.add(knee);const kneeG=F.gruppe();kneeG.position.set(0,-thighLen,0);hipG.add(kneeG);reg('knee'+(sd===1?'1':'-1'),kneeG);const cR=0.27;const calf=reg('calf'+(sd===1?'1':'-1'),s(cR,matSkin,[1,calfLen/(cR*2),0.8]));calf.position.set(0,-calfLen/2,-0.12);kneeG.add(calf);const shin=reg('shin'+(sd===1?'1':'-1'),s(0.16,matSkin,[1,calfLen/0.36,1]));shin.position.set(0,-calfLen/2,0.1);kneeG.add(shin);const aY=-calfLen;const ankleG=F.gruppe();ankleG.position.set(0,aY,0);kneeG.add(ankleG);reg('ankle'+(sd===1?'1':'-1'),ankleG);const ankleSphere=s(0.15,matJoint,[1.1,0.5,1]);ankleG.add(ankleSphere);const foot=F.gruppe();const heel=s(0.2,matSkin,[1.2,1,1.5]);heel.position.set(0,0,-0.15);foot.add(heel);const mid=s(0.25,matSkin,[0.8,0.6,1.5]);mid.position.set(0,-0.05,0.2);foot.add(mid);for(let i=0;i<5;i++){const tX=(i-2)*0.08,tZ=0.4+(i*0.02),tR=0.06-(i*0.005);const t1=s(tR,matSkin,[1.5,0.8,1.2]);t1.position.set(tX,-0.15,tZ);foot.add(t1);const t2=s(tR*0.8,matSkin,[1.5,0.8,1.2]);t2.position.set(tX,-0.15,tZ+0.15);foot.add(t2);}foot.position.set(0,-0.1,0.1);ankleG.add(foot);hipG.rotation.z=sd*0.05;character.add(hipG);});
        const ribcage=reg('ribcage',s(1.0,matSkin,[shoulderHW,1.2,0.6]));ribcage.position.set(0,nippleY-trochanterY,0);torsoG.add(ribcage);
        const waist=reg('waist',s(0.5,matSkin,[1.14,1.0,0.5]));waist.position.set(0,(nippleY+trochanterY)/2-trochanterY,0);torsoG.add(waist);
        [-1,1].forEach(sd=>{const g=F.gruppe();const t1=s(0.5,matSkin,[0.8,0.6,0.3]);t1.position.set(sd*0.7,acromionY-0.5-trochanterY,-0.1);g.add(t1);const t2=s(0.4,matSkin,[0.6,0.6,0.3]);t2.position.set(sd*0.4,acromionY-1.0-trochanterY,-0.1);g.add(t2);const t3=s(0.3,matSkin,[0.4,0.6,0.3]);t3.position.set(sd*0.1,0.5,-0.1);g.add(t3);reg('lat'+(sd===1?'1':'-1'),g);torsoG.add(g);});
        const upperBack=reg('upperBack',s(0.8,matSkin,[1.15,0.8,0.5]));upperBack.position.set(0,acromionY-0.2-trochanterY,-0.2);torsoG.add(upperBack);
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
        [-1,1].forEach(sd=>{const cl=c(0.07,0.05,0.55,matSkin);cl.position.set(sd*0.38,acromionY+0.08-trochanterY,0.08);cl.rotation.set(0,sd*0.2,sd*-0.5);torsoG.add(cl);});
        [-1,1].forEach(sd=>{const armG=F.gruppe();armG.position.set(sd*baseArmX,acromionY-trochanterY,0);reg('arm'+(sd===1?'1':'-1'),armG);const delt=reg('deltoid'+(sd===1?'1':'-1'),s(0.30,matSkin,[1,1.1,1]));armG.add(delt);const bic=reg('bicep'+(sd===1?'1':'-1'),s(0.26,matSkin,[0.9,upperArmLen/0.52,1]));bic.position.set(0,-upperArmLen/2,0.1);armG.add(bic);const tri=reg('tricep'+(sd===1?'1':'-1'),s(0.27,matSkin,[0.9,upperArmLen/0.54,0.9]));tri.position.set(0,-upperArmLen/2,-0.15);armG.add(tri);const uarm=reg('uarm'+(sd===1?'1':'-1'),s(0.23,matSkin,[1.0,upperArmLen/0.46,0.96]));uarm.position.set(0,-upperArmLen/2,-0.02);armG.add(uarm);const el=s(0.165,matJoint,[1,0.75,1]);el.position.set(0,-upperArmLen,0);armG.add(el);const elbowG=F.gruppe();elbowG.position.set(0,-upperArmLen,0);armG.add(elbowG);reg('elbow'+(sd===1?'1':'-1'),elbowG);const fa=reg('forearm'+(sd===1?'1':'-1'),s(0.24,matSkin,[1.2,forearmLen/0.48,1]));fa.position.set(sd*0.05,-forearmLen/2,0);elbowG.add(fa);const wY=-forearmLen;const wr=s(0.14,matSkin,[1,0.5,0.9]);wr.position.set(sd*0.05,wY,0);elbowG.add(wr);
        const hand=F.gruppe();hand.userData.sd=sd;hand.userData.fingers=[];hand.userData.thumbs=[];
        const palmG=F.gruppe();hand.add(palmG);hand.userData.palmG=palmG;reg('palm'+(sd===1?'1':'-1'),palmG);
        const palm=s(0.25,matSkin,[1,1.2,0.5]);palmG.add(palm);
        for(let i=0;i<4;i++){const fX=(i-1.5)*0.12,fZ=0.1-Math.abs(i-1.5)*0.05;const fG=F.gruppe();fG.position.set(fX,-0.28,fZ);fG.rotation.z=(i-1.5)*0.13;reg('fA'+i+'_'+(sd===1?'1':'-1'),fG);fG.add(s(0.08,matSkin,[0.9,0.8,0.9]));const f1=c(0.06,0.05,0.18,matSkin);f1.position.y=-0.09;fG.add(f1);const jG1=F.gruppe();jG1.position.set(0,-0.18,0);reg('fB'+i+'_'+(sd===1?'1':'-1'),jG1);jG1.add(s(0.05,matSkin,[1.0,0.8,1.0]));const f2=c(0.05,0.04,0.14,matSkin);f2.position.set(0,-0.07,-0.01);jG1.add(f2);const jG2=F.gruppe();jG2.position.set(0,-0.14,-0.02);reg('fC'+i+'_'+(sd===1?'1':'-1'),jG2);jG2.add(s(0.04,matSkin,[1.0,0.8,1.0]));const f3=c(0.04,0.03,0.1,matSkin);f3.position.set(0,-0.05,-0.04);jG2.add(f3);jG1.add(jG2);fG.add(jG1);palmG.add(fG);hand.userData.fingers.push({mcp:fG,pip:jG1,dip:jG2});}
        const thumbG=F.gruppe();thumbG.position.set(-sd*0.3,-0.15,0.1);thumbG.rotation.set(0,sd*0.5,sd*-1.2);reg('tA_'+(sd===1?'1':'-1'),thumbG);thumbG.add(s(0.1,matSkin,[0.8,1.5,0.8]));const thumbF1=c(0.06,0.05,0.12,matSkin);thumbF1.position.y=-0.06;thumbG.add(thumbF1);const thumbJG=F.gruppe();thumbJG.position.set(0,-0.12,0);reg('tB_'+(sd===1?'1':'-1'),thumbJG);thumbJG.add(s(0.06,matSkin,[0.8,0.8,0.8]));const thumbTip=c(0.05,0.04,0.08,matSkin);thumbTip.position.y=-0.04;thumbJG.add(thumbTip);thumbG.add(thumbJG);palmG.add(thumbG);hand.userData.thumbs.push({mcp:thumbG,ip:thumbJG});
        hand.position.set(sd*0.05,wY-0.3,0);elbowG.add(hand);reg('hand'+(sd===1?'1':'-1'),hand);
        armG.rotation.z=sd*0.2;armG.rotation.x=0.05;armG.userData.baseRotZ=sd*0.2;armG.userData.baseRotX=0.05;torsoG.add(armG);});
        const headGroup=F.gruppe();headGroup.position.y=H-headSeg/2-trochanterY;reg('head',headGroup);var HEAD_S=0.92;headGroup.scale.setScalar(HEAD_S);base.headPosY=H-headSeg/2-headSeg*0.20*(1-HEAD_S);   // loomis-pass: 5.7->6.6 koepfe; pivot-korrektur haelt das KINN auf hoehe (halsroehre!)
        const skull=s(skullBaseR*1.03,matSkin,[1.0,1.12,1.0]);skull.position.y=skullCY;headGroup.add(skull);
        [-1,1].forEach(sd=>{const t=s(0.2,matSkin,[0.62,1.05,0.85]);t.position.set(sd*0.36,headSeg*0.48,0);headGroup.add(t);});
        const forehead=s(0.13,matSkin,[1.35,0.95,0.72]);forehead.position.set(0,(browY+hairlineY)/2,0.26);forehead.rotation.x=0.2;headGroup.add(forehead);
        const glabella=s(0.05,matSkin,[0.8,0.6,1.0]);glabella.position.set(0,browY+0.06,0.38);headGroup.add(glabella);
        const browRidge=s(0.15,matSkin,[2.0,0.42,0.72]);browRidge.position.set(0,browY,0.36);headGroup.add(browRidge);
        [-1,1].forEach(sd=>{const sock=s(0.145,matSocket,[1.0,0.88,0.50]);sock.position.set(sd*eyeDist/2,eyeY,0.3);headGroup.add(sock);});
        [-1,1].forEach(sd=>{const e=F.gruppe();e.add(s(0.12,matEye,[1,1.1,1]));const iris=s(0.07,matIris,[0.8,1,0.8]);iris.position.z=0.08;e.add(iris);const pupil=s(0.04,matPupil);pupil.position.z=0.11;e.add(pupil);e.add(s(0.13,matCornea,[1,1.1,1]));const lidT=s(0.14,matSkin,[1.15,0.35,0.9]);lidT.position.y=0.07;e.add(lidT);const lidB=s(0.14,matSkin,[1.15,0.45,0.95]);lidB.position.y=-0.09;e.add(lidB);e.position.set(sd*eyeDist/2,eyeY,0.32);headGroup.add(e);if(sd<0){eyeL=e;irisL=iris;lidTL=lidT;lidBL=lidB;}else{eyeR=e;irisR=iris;lidTR=lidT;lidBR=lidB;}});
        [-1,1].forEach(sd=>{const g=F.gruppe();const bone=reg('cheekbone'+(sd===1?'1':'-1'),s(0.13,matSkin,[1.15,0.52,0.72]));bone.position.set(sd*0.22,eyeY-0.04,0.27);bone.rotation.y=sd*0.12;bone.rotation.z=sd*-0.05;g.add(bone);headGroup.add(g);});
        [-1,1].forEach(sd=>{const b=reg('buccal'+(sd===1?'1':'-1'),s(0.14,matSkin,[0.75,0.65,0.5]));b.position.set(sd*0.18,(cheekY+jawY)/2,0.22);headGroup.add(b);});
        const maxilla=s(0.15,matSkin,[0.75,0.88,0.85]);maxilla.position.set(0,(lipY+noseY)/2,0.325);headGroup.add(maxilla);
        [-1,1].forEach(sd=>{const nl=c(0.008,0.005,0.12,matShadow);nl.position.set(sd*0.09,(lipY+noseY)/2,0.38);nl.rotation.z=sd*-0.6;headGroup.add(nl);});
        const jawBody=reg('jaw',s(0.31,matSkin,[0.85,0.7,0.8]));jawBody.position.set(0,jawY,0.15);headGroup.add(jawBody);
        [-1,1].forEach(sd=>{const g=reg('gonion'+(sd===1?'1':'-1'),s(0.1,matSkin,[0.7,0.85,0.8]));g.position.set(sd*jawW/2,jawY+0.02,0.03);headGroup.add(g);});
        [-1,1].forEach(sd=>{const r=c(0.05,0.06,0.2,matSkin);r.position.set(sd*jawW/2+0.03,cheekY+0.04,0.0);r.rotation.z=sd*0.08;headGroup.add(r);});
        [-1,1].forEach(sd=>{const m=reg('masseter'+(sd===1?'1':'-1'),s(0.08,matSkin,[0.4,1.1,0.6]));m.position.set(sd*0.2,(cheekY+jawY)/2,0.16);headGroup.add(m);});
        const chin=reg('chin',s(chinW/2,matSkin,[1.3,0.9,1.1]));chin.position.set(0,chinY,0.35);headGroup.add(chin);
        const chinLine=s(0.03,matSkin,[0.6,2.0,0.8]);chinLine.position.set(0,chinY+0.04,0.38);headGroup.add(chinLine);
        const noseBridge=reg('noseBr',c(0.04,0.06,(browY-noseY)*1.1,matSkin));noseBridge.position.set(0,(browY+noseY)/2,0.4);headGroup.add(noseBridge);
        const noseTip=reg('noseTip',s(0.055,matSkin,[1.2,1,1.2]));noseTip.position.set(0,noseY,0.45);headGroup.add(noseTip);
        [-1,1].forEach(sd=>{const n2=reg('noseA'+(sd===1?'1':'-1'),s(0.035,matSkin,[1,0.5,1]));n2.position.set(sd*0.05,noseY-0.04,0.43);headGroup.add(n2);});
        const upperLip=s(0.12,matLips,[1.22,0.42,0.62]);upperLip.position.set(0,lipY+0.02,0.415);headGroup.add(upperLip);upperLipRef=upperLip;
        const lowerLip=s(0.14,matLips,[1.12,0.48,0.64]);lowerLip.position.set(0,lipY-0.052,0.405);headGroup.add(lowerLip);lowerLipRef=lowerLip;
        const philtrum=s(0.03,matShadow,[0.5,1.0,0.8]);philtrum.position.set(0,lipY+0.08,0.41);headGroup.add(philtrum);
        [-1,1].forEach(sd=>{const mc=s(0.025,matSkin,[0.8,0.8,1.0]);mc.position.set(sd*0.095,lipY-0.01,0.39);headGroup.add(mc);});
        [-1,1].forEach(sd=>{const e=F.gruppe();const helix=s(0.12,matSkin,[0.35,1.7,0.95]);e.add(helix);const concha=s(0.09,matSocket,[0.55,0.95,0.5]);concha.position.set(sd*-0.02,0.0,0.03);e.add(concha);const tragus=s(0.042,matSkin,[0.6,0.75,0.5]);tragus.position.set(sd*-0.065,-0.03,0.07);e.add(tragus);const lobe=s(0.055,matSkin,[0.5,0.75,1]);lobe.position.set(sd*-0.01,-0.17,0.02);e.add(lobe);e.position.set(sd*0.43,eyeY-0.04,-0.03);e.rotation.y=sd*-0.45;headGroup.add(e);});
        [-1,1].forEach(sd=>{const g=F.gruppe();for(let i=0;i<5;i++){const b=c(0.012,0.012,0.07,matHair);b.position.set((i-2)*0.032,-Math.abs(i-2)*0.008,0);b.rotation.z=sd*0.2;g.add(b);}g.position.set(sd*eyeDist/2,browY+0.03,0.35);g.rotation.z=sd*-0.1;headGroup.add(g);if(sd<0)browL=g;else browR=g;});
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

    // ── Der Namensraum (Vertrag v1.1 §7 + §8 MESHFREI) ──
    root.__koerperCore = {
        VERSION: VERSION,
        labProportionen: labProportionen,
        labMorph: labMorph,
        labLandmarks: labLandmarks,
        bauMensch: bauMensch,
        morphAuf: morphAuf,
        MATERIAL_KLASSEN: MATERIAL_KLASSEN,
        SKIN_TONES: SKIN_TONES,
        HAIR_COLORS: HAIR_COLORS,
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
