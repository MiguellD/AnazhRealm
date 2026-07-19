// AnazhRealm — vehicle-core.js: DER FAHRZEUG-STUDIO-KERN (Studio-Vertrag Phase 1, W7a).
// Die generative Substanz des Garage-Labors (worlds/garage/garage.js — ANATOMIE ·
// FAHRZEUG): Lehren · Rahmen/Hardpoints · Gelenk-Räder · Karosserie-Haut ·
// Baukörper · Presets/Params/Kulturen. Byte-treu aus dem Schöpfer-Werk extrahiert
// (Zeilen-Slices, Paritäts-Hash-bewiesen) — die Shell UND AnazhRealm lesen DIESE
// eine Quelle (G2.1), ein Nachbau ist verboten.
//
// FORM (Entscheid E-A, Vertrag v1.1 §7): namespaced IIFE __vehicleCore — der
// ZWEIT-Kern einer Laufzeit darf keine Top-Level-Globals tragen (const-Kollision
// mit foundry-core.js:94/96/2248 STUDIO_VERTRAG/PORTAL_RENDER_CONFIG/PRESETS im
// selben Worker). Die Manifest-Blöcke (B1 PRESETS · B2 buildInstance+kindStages ·
// B4 PARAMS · B5 LEHREN+messen · STUDIO_VERTRAG) leben unter dem Namensraum,
// namens- und formgleich; der Validator (gate:studio-vertrag) mappt per CORES-ns.
//
// DETERMINISMUS (G2.3): der Bau ist eine reine Funktion der Parameter — das
// Garage-Studio trägt KEINEN stochastischen Term (Math.random lebt nur in der
// Shell-Deko: Reifenrauch/Pylonen). Das seed-Argument reist mit (Vertrags-
// Signatur) und ist RESERVIERT: buildInstance(id, 7, …) == buildInstance(id,
// 12345, …) byte-gleich — eingefroren in spec/asset-contract/v3 (cv:3). Eine
// künftige Seed-Variation ist ein bewusster Golden-Re-Mint, kein Drift.
//
// THREE ist zur Laufzeit global (Browser: worlds/terrain/lib/three-r128.min.js
// VOR diesem Skript; Node-Gate: global.THREE vor require). Der Manifest-Teil
// (Daten + Funktions-Definitionen) läuft THREE-frei (Validator-vm mit Stub).
(function (root) {
    "use strict";

    const VERSION = "1.0.0";
    const STUDIO_VERTRAG = 1; // G4.3 — EINE Versions-Semantik (v1.1 ist Adressierungs-Norm, kein Block-Bruch)

    // ── B2-Daten: die Stufen-Wahrheit der Domäne (kindStages-Vertrag) ──
    // Fahrzeuge tragen NUR Stufe 0 (fein); L1=L0-Grade + L2-Auto-Impostor sind
    // Sache des Wirts (docs/studio-vertrag.md B2 / W7b-Merge am EINEN Ingest).
    const PORTAL_RENDER_CONFIG = {
        lod: { kindStages: { vehicle: [0] } },
    };

    // ── Materialien (geteilt, nie disposen) ── — lazy (der Validator-vm lädt ohne THREE; erst der erste Bau ruft sie)
    let M = null;
    function materials() {
        if (M) return M;
        M = {
            hard: new THREE.MeshBasicMaterial({ color: 0x6fd0e8 }),
            joint: new THREE.MeshBasicMaterial({ color: 0xffb24a }),
            clay: new THREE.MeshStandardMaterial({
                color: 0x8d9499,
                roughness: 0.88,
                metalness: 0.02,
                envMapIntensity: 0.7,
            }),
            paint: new THREE.MeshPhysicalMaterial({
                color: 0x26384a,
                metalness: 0.85,
                roughness: 0.22,
                clearcoat: 1.0,
                clearcoatRoughness: 0.04,
                envMapIntensity: 2.6,
            }),
            glass: new THREE.MeshPhysicalMaterial({
                color: 0x0a0f18,
                metalness: 0,
                roughness: 0.02,
                transparent: true,
                opacity: 0.42,
                clearcoat: 1,
                envMapIntensity: 3.0,
                side: THREE.DoubleSide,
            }),
            tire: new THREE.MeshStandardMaterial({
                color: 0x131519,
                roughness: 0.85,
                metalness: 0,
                side: THREE.DoubleSide,
            }),
            rimM: new THREE.MeshStandardMaterial({
                color: 0xb4c0cc,
                roughness: 0.3,
                metalness: 0.85,
                envMapIntensity: 1.6,
            }),
            rimD: new THREE.MeshStandardMaterial({
                color: 0x788494,
                roughness: 0.4,
                metalness: 0.8,
                envMapIntensity: 1.2,
            }),
            cal: new THREE.MeshStandardMaterial({ color: 0x962e22, roughness: 0.5, metalness: 0.3 }),
            pillar: new THREE.MeshStandardMaterial({ color: 0x101418, roughness: 0.4, metalness: 0.4 }),
            steel: new THREE.MeshStandardMaterial({
                color: 0x55677a,
                roughness: 0.45,
                metalness: 0.85,
                envMapIntensity: 1.2,
            }),
            batt: new THREE.MeshStandardMaterial({
                color: 0x1c2c44,
                roughness: 0.5,
                metalness: 0.6,
                envMapIntensity: 0.8,
            }),
            motor: new THREE.MeshStandardMaterial({
                color: 0x3a536a,
                roughness: 0.35,
                metalness: 0.9,
                envMapIntensity: 1.4,
            }),
            seat: new THREE.MeshStandardMaterial({
                color: 0x241f2e,
                roughness: 0.7,
                metalness: 0.05,
                envMapIntensity: 0.5,
            }),
            trim: new THREE.MeshStandardMaterial({ color: 0x14161e, roughness: 0.6, metalness: 0.2 }),
            brake: new THREE.MeshStandardMaterial({ color: 0x6a4636, roughness: 0.4, metalness: 0.6 }),
            door: new THREE.MeshStandardMaterial({
                color: 0x969da3,
                roughness: 0.85,
                metalness: 0.05,
                envMapIntensity: 0.7,
            }),
            liner: new THREE.MeshStandardMaterial({ color: 0x2e323a, roughness: 0.9, metalness: 0.05 }),
            neg: new THREE.MeshBasicMaterial({
                color: 0xff5a7a,
                transparent: true,
                opacity: 0.13,
                side: THREE.DoubleSide,
                depthWrite: false,
            }),
            // ── Lichtsignatur (emissiv → glüht im WebGL; Basisfarbe trägt auch ungelitt) ──
            drl: new THREE.MeshStandardMaterial({
                color: 0xe6f0ff,
                emissive: 0xbcd8ff,
                emissiveIntensity: 0.9,
                roughness: 0.3,
                metalness: 0.1,
            }),
            lensW: new THREE.MeshStandardMaterial({
                color: 0xeef5ff,
                emissive: 0xcfe6ff,
                emissiveIntensity: 1.1,
                roughness: 0.25,
                metalness: 0.0,
            }),
            lensR: new THREE.MeshStandardMaterial({
                color: 0xd0271a,
                emissive: 0xff2616,
                emissiveIntensity: 0.85,
                roughness: 0.32,
                metalness: 0.0,
            }),
            lensA: new THREE.MeshStandardMaterial({
                color: 0xff9a1f,
                emissive: 0xff7400,
                emissiveIntensity: 0.8,
                roughness: 0.32,
                metalness: 0.0,
            }),
            housing: new THREE.MeshStandardMaterial({
                color: 0x07090d,
                roughness: 0.42,
                metalness: 0.4,
                envMapIntensity: 1.3,
            }),
            grille: new THREE.MeshStandardMaterial({
                color: 0x0a0c11,
                roughness: 0.55,
                metalness: 0.45,
                envMapIntensity: 1.1,
            }),
        };
        return M;
    }

    // ── Geometrie-Helfer (wie s/c/b in der Körperbasis) ──
    function box(w, h, d, m) {
        const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
        me.castShadow = true;
        me.receiveShadow = true;
        return me;
    }
    function cyl(rt, rb, h, m, seg) {
        const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 28), m);
        me.castShadow = true;
        me.receiveShadow = true;
        return me;
    }
    // Baukörper-Helfer: Box über Mittelpunkt+Halbmaß (wie im Audit), Zylinder mit Achse
    function B(cx, cy, cz, hw, hh, hd, m, rotZ) {
        const me = box(hw * 2, hh * 2, hd * 2, m);
        me.position.set(cx, cy, cz);
        if (rotZ) me.rotation.z = rotZ;
        return me;
    }
    // ── Parametrische Licht-SIGNATUR ─────────────────────────────────────────────
    // GESETZE (gelten für JEDEN Charakter): die Signatur ist ein STRICH-Graph in der Öffnung ·
    //   konstante Strichstärke w (wie der Duktus einer Schrift) · alles proud auf EINER Ebene
    //   (kein Z-Fight) · bilateral über sd. Der CHARAKTER kommt allein über 'sig'.
    function lightStrokes(g, sig, sd, zI, zO, yB, yT, xF, w, mat) {
        const dx = 0.005,
            m = w; // dx=proud-Tiefe, m=Rand=eine Strichstärke
        const Hr = (yy, z0, z1) => g.add(B(xF, yy, (sd * (z0 + z1)) / 2, dx, w / 2, Math.abs(z1 - z0) / 2, mat)); // horizontaler Strich (z-Lauf)
        const Vr = (zz, y0, y1) => g.add(B(xF, (y0 + y1) / 2, sd * zz, dx, Math.abs(y1 - y0) / 2, w / 2, mat)); // vertikaler Strich (y-Lauf)
        const Dr = (y0, z0, y1, z1) => {
            const my = (y0 + y1) / 2,
                mz = (sd * (z0 + z1)) / 2,
                len = Math.hypot(y1 - y0, z1 - z0) / 2,
                ang = Math.atan2(sd * (z1 - z0), y1 - y0);
            const me = new THREE.Mesh(new THREE.BoxGeometry(dx * 2, len * 2, w * 0.7), mat);
            me.position.set(xF, my, mz);
            me.rotation.x = ang;
            g.add(me);
        }; // diagonaler Strich (für scharfe Signaturen)
        const zi = zI + m,
            zo = zO - m,
            yt = yT - m,
            yb = yB + m;
        if (sig === "hook") {
            Hr(yt, zi, zo);
            Vr(zo, yb, yt);
        } // L: oben + aussen runter — aggressiv
        else if (sig === "c") {
            Hr(yt, zi, zo);
            Hr(yb, zi, zo);
            Vr(zo, yb, yt);
        } // C: oben+unten+aussen — bold
        else if (sig === "split") {
            Hr(yt, zi, zo);
            Hr((yb + yt) / 2, zi, zo);
        } // zwei parallele — tech
        else if (sig === "brow") {
            Hr(yt, zi, zo);
            Hr(yt - w * 2.2, zi + w, zo);
        } // dicke Braue + dünne Linie — athletisch
        else if (sig === "l_single") {
            g.add(B(xF, (yb + yt) / 2, (sd * (zi + zo)) / 2, dx, w * 0.85, Math.abs(zo - zi) / 2, mat));
        } // Audi: durchgehender LED-Balken
        else if (sig === "l_oval") {
            Hr(yt, zi, zo);
            Vr(zi, yb, yt);
        } // Ferrari: L — oben + innen runter, elegant
        else if (sig === "l_hex") {
            const zc = (zi + zo) / 2;
            Dr(yt, zo, yb, zc);
            Dr(yb, zc, yt, zi);
        } // Lambo: V/Pfeil nach unten — scharf
        else if (sig === "l_wide") {
            Hr(yt, zi, zo);
            Hr(yb, zi, zo);
        } // Mercedes: zwei horizontale, breit ruhig
        else if (sig === "l_upright") {
            Vr(zi, yb, yt);
            Vr(zo, yb, yt);
        } // Rolls: zwei vertikale, aufrecht
        else {
            Hr(yt, zi, zo);
        } // 'blade' (default): EINE Linie oben — minimal
    }
    function C(cx, cy, cz, axis, r, len, m, seg) {
        const me = cyl(r, r, len, m, seg || 20);
        if (axis === "z") me.rotation.x = Math.PI / 2;
        else if (axis === "x") me.rotation.z = Math.PI / 2;
        me.position.set(cx, cy, cz);
        return me;
    }
    function dot(p, m, r) {
        const me = new THREE.Mesh(new THREE.SphereGeometry(r || 0.022, 16, 12), m);
        me.position.set(p[0], p[1], p[2]);
        return me;
    }
    function seg(a, b, m) {
        const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]);
        return new THREE.Line(g, m);
    }
    function polyline(pts, m) {
        const g = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p)));
        return new THREE.Line(g, m);
    }
    function ring(rad, m) {
        const me = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.006, 8, 32), m);
        return me;
    }

    // ════════════════════════════════════════════════════════════════════
    // 1 · DIE LEHREN — Soll-Proportionen, die urteilen
    //   Jede Lehre: misst aus P, vergleicht mit Toleranzband, gibt Zustand.
    // ════════════════════════════════════════════════════════════════════
    function derive(P) {
        const fAx = P.radstand / 2,
            rAx = -P.radstand / 2;
        const noseX = fAx + P.ueberhangV,
            tailX = rAx - P.ueberhangH;
        const roofF = P.kabineMitte + P.kabineLaenge / 2;
        let roofR = P.kabineMitte - P.kabineLaenge / 2;
        const cowlX = roofF + (P.dach - P.guertel) * (P.windshieldRake != null ? P.windshieldRake : 0.5); // Windschutz-Fuß
        const dRk = P.dach - P.guertel;
        const heck = P.heck || "stufe";
        let backX;
        if (heck === "steil") {
            backX = tailX + 0.06;
            roofR = backX + dRk * (P.backlightRake != null ? P.backlightRake : 0.2);
        } // 2-BOX: Dach bis nahe Heck, steile Klappe, KEIN Kofferraum
        else if (heck === "fliess") {
            backX = roofR - dRk * (P.backlightRake != null ? P.backlightRake : 0.62);
        } // FASTBACK
        else {
            backX = roofR - dRk * (P.backlightRake != null ? P.backlightRake : 0.45);
        } // STUFENHECK (Kofferraum)
        const Ltot = P.radstand + P.ueberhangV + P.ueberhangH;
        const dta = fAx - cowlX; // Dash-to-Axle (Vorderachse→A-Säule)
        return { fAx, rAx, noseX, tailX, roofF, roofR, cowlX, backX, Ltot, dta };
    }
    const LEHREN = [
        {
            id: "rl",
            lab: "Radstand / Länge",
            unit: "",
            dom: [0.5, 0.7],
            pass: [0.585, 0.645],
            hint: "Langer Radstand bei kurzem Auto = satter Stand. Kurz = nervös, billig.",
        },
        {
            id: "dta",
            lab: "Dash-to-Axle",
            unit: "",
            dom: [-0.04, 0.4],
            pass: [0.16, 0.3],
            hint: "Vorderachse→A-Säule. Lang = Längsmotor/Heck­antrieb-Eleganz. Kurz/negativ = Fronttriebler.",
        },
        {
            id: "ueb",
            lab: "Überhang-Balance V/H",
            unit: "",
            dom: [0.4, 1.7],
            pass: [0.72, 1.04],
            hint: "Vorn etwas kürzer als hinten wirkt sportlich-ausgewogen. >1 = Front­triebler-Nase.",
        },
        {
            id: "bf",
            lab: "Bodenfreiheit / Rad-Ø",
            unit: "",
            dom: [0.1, 0.8],
            pass: [0.28, 0.46],
            hint: "Tief = sportlich, aber unter ~0.28 schrammt es. Hoch = SUV / robust.",
        },
        {
            id: "dlo",
            lab: "Greenhouse-Anteil (DLO)",
            unit: "",
            dom: [0.2, 0.6],
            pass: [0.3, 0.42],
            hint: "Glasband ÷ Gesamthöhe. Niedrig = Coupé-aggressiv. Hoch = Van, praktisch.",
        },
        {
            id: "cab",
            lab: "Kabinen-Rücklage",
            unit: "",
            dom: [-0.2, 0.4],
            pass: [0.05, 0.24],
            hint: "Kabine nach hinten = lange Haube, Premium. Nach vorn = Raumwunder / FWD.",
        },
        {
            id: "tum",
            lab: "Tumblehome",
            unit: "",
            dom: [0.0, 0.35],
            pass: [0.08, 0.2],
            hint: "Dachflanken-Einzug. Etwas = muskulöse Schulter. Zuviel = wackelig, Spielzeug.",
        },
    ];
    for (const Lh of LEHREN) {
        const bw = Lh.pass[1] - Lh.pass[0];
        Lh.warn = [Lh.pass[0] - bw * 0.18, Lh.pass[1] + bw * 0.18];
    }
    const MESS = {
        rl: (P, D) => P.radstand / D.Ltot,
        dta: (P, D) => D.dta / P.radstand,
        ueb: (P) => P.ueberhangV / P.ueberhangH,
        bf: (P) => P.fahrhoehe / P.radR,
        dlo: (P) => (P.dach - P.guertel) / P.dach,
        cab: (P) => -P.kabineMitte / (P.radstand / 2),
        tum: (P) => P.tumblehome / (P.spur / 2),
    };
    function messen(P) {
        const D = derive(P);
        const out = {};
        for (const Lh of LEHREN) out[Lh.id] = MESS[Lh.id](P, D);
        return out;
    }
    function evalLehren(P) {
        const D = derive(P);
        return LEHREN.map((L) => {
            const v = MESS[L.id](P, D);
            const [lo, hi] = L.pass;
            const bw = hi - lo;
            let st = "pass";
            if (v < lo - bw * 0.18 || v > hi + bw * 0.18) st = "fail";
            else if (v < lo || v > hi) st = "warn";
            return { L, v, st };
        });
    }

    // ════════════════════════════════════════════════════════════════════
    // 2 · DER RAHMEN — Skelett aus benannten Hardpoints + Gliedern
    // ════════════════════════════════════════════════════════════════════
    function hardpoints(P) {
        const D = derive(P);
        const hz = P.spur / 2;
        const rk = P.fahrhoehe;
        return {
            // Achs- & Radmitten (Radmitte = Gelenk)
            A_F: [D.fAx, 0, 0],
            A_R: [D.rAx, 0, 0],
            HUB_FL: [D.fAx, P.radR, -hz],
            HUB_FR: [D.fAx, P.radR, hz],
            HUB_RL: [D.rAx, P.radR, -hz],
            HUB_RR: [D.rAx, P.radR, hz],
            // Längs-Enden
            NOSE: [D.noseX, rk + 0.06, 0],
            TAIL: [D.tailX, rk + 0.04, 0],
            // Schweller / Boden
            ROCK_F: [D.fAx + 0.1, rk, hz * 0.92],
            ROCK_R: [D.rAx - 0.1, rk, hz * 0.92],
            // Greenhouse-Knochen
            COWL: [D.cowlX, P.guertel, 0], // A-Säulen-Fuß
            HDR_F: [D.roofF, P.dach, 0], // Dachvorderkante
            HDR_R: [D.roofR, P.dach, 0], // Dachhinterkante
            BACK: [D.backX, P.guertel, 0], // C-Säulen-Fuß
            // Schulter / Haube / Deckel
            SHO_F: [D.fAx, P.guertel, 0],
            SHO_R: [D.rAx, P.guertel, 0],
            HOOD: [(D.fAx + D.cowlX) / 2, P.guertel - 0.02, 0],
            DECK: [(D.rAx + D.backX) / 2, P.guertel - 0.01, 0],
        };
    }
    function buildFrame(H, P, ctx) {
        const M = (ctx && ctx.M) || materials();
        const g = new THREE.Group();
        const hz = P.spur / 2;
        const lineM = new THREE.LineBasicMaterial({ color: 0x4f8fa6, transparent: true, opacity: 0.75 });
        const ghM = new THREE.LineBasicMaterial({ color: 0x7aa0c0, transparent: true, opacity: 0.85 });
        // Hardpoint-Kugeln
        for (const k in H) {
            if (k.startsWith("HUB")) continue;
            g.add(dot(H[k], M.hard));
        }
        // Längsträger (beide Seiten) + Quertraversen — das tragende Skelett
        for (const s of [-1, 1]) {
            g.add(
                seg([H.A_F[0], P.fahrhoehe + 0.04, s * hz * 0.78], [H.A_R[0], P.fahrhoehe + 0.04, s * hz * 0.78], lineM)
            );
            g.add(seg([H.NOSE[0], H.NOSE[1], s * hz * 0.5], [H.A_F[0], P.fahrhoehe + 0.04, s * hz * 0.78], lineM));
            g.add(seg([H.A_R[0], P.fahrhoehe + 0.04, s * hz * 0.78], [H.TAIL[0], H.TAIL[1], s * hz * 0.5], lineM));
        }
        for (const x of [H.A_F[0], H.A_R[0], 0])
            g.add(seg([x, P.fahrhoehe + 0.04, -hz * 0.78], [x, P.fahrhoehe + 0.04, hz * 0.78], lineM));
        // Greenhouse-Rahmen (A-Säule, Dach, C-Säule) — die „Schädel"-Knochen
        g.add(polyline([H.COWL, H.HDR_F, H.HDR_R, H.BACK], ghM));
        for (const s of [-1, 1]) {
            g.add(seg([H.COWL[0], H.COWL[1], s * hz * 0.62], [H.HDR_F[0], H.HDR_F[1], s * hz * 0.5], ghM));
            g.add(seg([H.HDR_R[0], H.HDR_R[1], s * hz * 0.5], [H.BACK[0], H.BACK[1], s * hz * 0.62], ghM));
            g.add(seg([H.HDR_F[0], H.HDR_F[1], s * hz * 0.5], [H.HDR_R[0], H.HDR_R[1], s * hz * 0.5], ghM));
        }
        // Schulterlinie (Hüftlinie des Autos)
        for (const s of [-1, 1])
            g.add(seg([H.NOSE[0], P.guertel, s * hz * 0.9], [H.TAIL[0], P.guertel, s * hz * 0.9], lineM));
        return g;
    }
    function makeWheel(P, os, ctx) {
        const M = (ctx && ctx.M) || materials();
        const g = new THREE.Group();
        const w = 0.22,
            r = P.radR;
        const rimLip = r * 0.66,
            hubR = r * 0.18,
            Rin = r * 0.2,
            Rout = r * 0.6;
        // Reifen: offene Lauffläche + zwei Flanken-Ringe (Felge sichtbar)
        g.add(crownedTread(r, w, 0.12, M.tire));
        for (const s of [-1, 1]) {
            const sw = new THREE.Mesh(new THREE.RingGeometry(rimLip, r, 36), M.tire);
            sw.position.z = (s * w) / 2;
            g.add(sw);
        }
        // Felgenbett + Bremsscheibe (dreht mit)
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(rimLip, rimLip, w * 0.84, 36, 1, true), M.rimM);
        barrel.rotation.x = Math.PI / 2;
        g.add(barrel);
        const rotor = new THREE.Mesh(new THREE.CylinderGeometry(Rout * 0.92, Rout * 0.92, w * 0.18, 28), M.brake);
        rotor.rotation.x = Math.PI / 2;
        rotor.position.z = -os * w * 0.1;
        g.add(rotor);
        // 5 Speichen + Nabendeckel + Radbolzen, auf der Aussenseite
        const fz = os * w * 0.3;
        // KULTUR-FELGE: Stil je Marke — oval/Ferrari 5 schlank · hex/Lambo Y-Speiche · wide/Merc 10 Multi · single/Audi 5 Doppel · upright/Rolls Scheibe
        {
            const cg = P.cGrille,
                nSp = cg === "wide" ? 10 : cg === "hex" ? 5 : 5,
                spW = cg === "wide" ? r * 0.05 : r * 0.13;
            if (cg === "hex") {
                for (let i = 0; i < 5; i++) {
                    const a = (i / 5) * Math.PI * 2;
                    for (const off of [-0.2, 0.2]) {
                        const sp = box(Rout - Rin, r * 0.06, w * 0.15, M.rimM);
                        sp.position.set(
                            (Math.cos(a + off) * (Rin + Rout)) / 2,
                            (Math.sin(a + off) * (Rin + Rout)) / 2,
                            fz
                        );
                        sp.rotation.z = a + off;
                        g.add(sp);
                    }
                }
            } // Y-Speiche
            else if (cg === "single") {
                for (let i = 0; i < 5; i++) {
                    const a = (i / 5) * Math.PI * 2;
                    for (const off of [-0.1, 0.1]) {
                        const sp = box(Rout - Rin, r * 0.055, w * 0.15, M.rimM);
                        sp.position.set(
                            (Math.cos(a + off) * (Rin + Rout)) / 2,
                            (Math.sin(a + off) * (Rin + Rout)) / 2,
                            fz
                        );
                        sp.rotation.z = a + off;
                        g.add(sp);
                    }
                }
            } // Doppelspeiche
            else if (cg === "upright") {
                const disc = new THREE.Mesh(new THREE.CylinderGeometry(Rout * 0.94, Rout * 0.94, w * 0.1, 28), M.rimM);
                disc.rotation.x = Math.PI / 2;
                disc.position.z = fz;
                g.add(disc);
                for (let i = 0; i < 12; i++) {
                    const a = (i / 12) * Math.PI * 2;
                    const sl = box(Rout * 0.3, r * 0.02, w * 0.04, M.rimD);
                    sl.position.set(Math.cos(a) * Rout * 0.6, Math.sin(a) * Rout * 0.6, fz + w * 0.05);
                    sl.rotation.z = a;
                    g.add(sl);
                }
            } // Vollscheibe
            else {
                for (let i = 0; i < nSp; i++) {
                    const a = (i / nSp) * Math.PI * 2;
                    const sp = box(Rout - Rin, spW, w * 0.16, M.rimM);
                    sp.position.set((Math.cos(a) * (Rin + Rout)) / 2, (Math.sin(a) * (Rin + Rout)) / 2, fz);
                    sp.rotation.z = a;
                    g.add(sp);
                }
            }
        }
        // Felgenring (verbindet die Speichen außen) + Bremsabnutzungs-Ring auf der Scheibe
        const rimRing = new THREE.Mesh(new THREE.TorusGeometry(rimLip, 0.016, 8, 36), M.rimM);
        rimRing.position.z = fz;
        g.add(rimRing);
        const wear = new THREE.Mesh(new THREE.TorusGeometry(Rout * 0.74, 0.006, 6, 28), M.rimD);
        wear.position.z = -os * w * 0.1;
        g.add(wear);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(hubR, hubR, w * 0.3, 18), M.rimM);
        cap.rotation.x = Math.PI / 2;
        cap.position.z = os * w * 0.34;
        g.add(cap);
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 + 0.3;
            const lb = cyl(r * 0.025, r * 0.025, w * 0.12, M.rimD, 8);
            lb.rotation.x = Math.PI / 2;
            lb.position.set(Math.cos(a) * r * 0.1, Math.sin(a) * r * 0.1, os * w * 0.4);
            g.add(lb);
        }
        return g;
    }
    function buildWheels(H, P, ctx) {
        const M = (ctx && ctx.M) || materials();
        const corners = (ctx && ctx.corners) || [];
        const g = new THREE.Group();
        corners.length = 0;
        const defs = [
            ["HUB_FL", true],
            ["HUB_FR", true],
            ["HUB_RL", false],
            ["HUB_RR", false],
        ];
        for (const [k, front] of defs) {
            const p = H[k];
            const hub = new THREE.Group();
            hub.position.set(p[0], p[1], p[2]);
            const spin = new THREE.Group();
            hub.add(spin);
            spin.add(makeWheel(P, Math.sign(p[2]), ctx));
            const cal = box(0.05, P.radR * 0.24, 0.085, M.cal);
            cal.position.set(0, P.radR * 0.5, -Math.sign(p[2]) * 0.07);
            hub.add(cal); // Bremssattel (über Rotor, innerhalb Lauffläche)
            g.add(hub);
            corners.push({ grp: hub, wheelSpin: spin, front, phase: k.endsWith("L") ? 0 : Math.PI * 0.5, baseY: p[1] });
        }
        return g;
    }

    // ════════════════════════════════════════════════════════════════════
    // 4 · KAROSSERIE = HAUT (Aussenpaneele, scharf) + BAUKÖRPER (Organe)
    //   Beides aus denselben Hardpoints. Greenhouse sitzt auf dem Gürtel
    //   (kein Schweben), Räder an den Ecken, alles koaxial.
    // ════════════════════════════════════════════════════════════════════
    function scal(H, P) {
        return {
            fAx: H.A_F[0],
            rAx: H.A_R[0],
            noseX: H.NOSE[0],
            tailX: H.TAIL[0],
            cowlX: H.COWL[0],
            backX: H.BACK[0],
            roofF: H.HDR_F[0],
            roofR: H.HDR_R[0],
            hz: P.spur / 2,
            bw: P.spur / 2 + 0.13,
            cw: P.spur / 2 - 0.06,
            yFloor: P.fahrhoehe,
            yBatt: P.fahrhoehe + 0.12,
            ySill: P.fahrhoehe + 0.18,
            yBelt: P.guertel,
            yRoof: P.dach,
            Awin: Math.atan2(P.dach - P.guertel, H.HDR_F[0] - H.COWL[0]),
            Cwin: Math.atan2(P.dach - P.guertel, H.HDR_R[0] - H.BACK[0]),
        };
    }
    // leanende Glasscheibe (Tumblehome): unten cwBelt, oben cwRoof → koplanar überm Türblatt
    function glassPane(xF, xB, sd, yB, yT, cwB, cwR) {
        const M = materials();
        const len = Math.abs(xB - xF),
            h = yT - yB;
        const ax = Math.asin(Math.max(-1, Math.min(1, (sd * (cwR - cwB)) / h)));
        const m = box(len, h / Math.cos(ax), 0.004, M.glass);
        m.position.set((xF + xB) / 2, (yB + yT) / 2, (sd * (cwB + cwR)) / 2);
        m.rotation.x = ax;
        return m;
    }
    // Trapez-Quad (Front/Heck): unten breit, oben schmal → kein Dreieck-Überstand
    function quad4(p0, p1, p2, p3, mat) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array([...p0, ...p1, ...p2, ...p0, ...p2, ...p3]), 3)
        );
        geo.computeVertexNormals();
        return new THREE.Mesh(geo, mat);
    }

    // ── QUERSCHNITT: aus dem flachen Kasten eine echte Karosserie-Sektion ──
    //   Breitester Punkt an der Gürtellinie (Schulter). Darunter Einzug (Taille),
    //   darüber Dach-Einzug der Seitenscheibe (Tumblehome). Quadratisch → volle Schulter, Verjüngung erst zu den Enden.
    function crossSection(y, x, S, P) {
        const { ySill, yBelt, yRoof, bw, noseX, tailX, fAx, rAx } = S;
        // ── VERTIKAL zy ── Schulter am Gürtel = breitester Punkt; darunter Unterschnitt (Tuck), darüber Tumblehome.
        let zy;
        if (y >= yBelt) {
            const f = Math.min(1, (y - yBelt) / Math.max(0.02, yRoof - yBelt));
            zy = 1 - (P.tumblehome / bw) * f * f;
        } else {
            const g = Math.min(1, (yBelt - y) / Math.max(0.02, yBelt - ySill));
            const sig = Math.max(0.05, (fAx - rAx) / 2) * 0.42,
                hip = Math.max(
                    0,
                    1 - Math.exp(-Math.pow((x - fAx) / sig, 2)) - Math.exp(-Math.pow((x - rAx) / sig, 2))
                ); // Taille NUR an der Tür, →0 über den Achsen: Hüfte umschliesst das Rad (sonst zieht der Einzug die Flanke ins Reifen-Profil)
            zy = 1 - (P.taille / bw) * Math.pow(g, 0.85) * hip;
        } // g^0.85: zieht direkt unter dem Gürtel ein → Schulter liest als Kante
        // ── GRUNDRISS zx ── Coke-Bottle: schmale Nase → volle Achse → Taille an der Tür → volle Achse → schmales Heck.
        const coke = P.coke || 0;
        let zx = 1;
        if (coke > 0) {
            const xF0 = fAx + P.radR + 0.05,
                xR0 = rAx - P.radR - 0.05;
            if (x > xF0) {
                const f = Math.min(1, (x - xF0) / Math.max(0.05, noseX - xF0));
                zx = 1 - coke * f * f;
            } // Nase verjüngt
            else if (x < xR0) {
                const f = Math.min(1, (xR0 - x) / Math.max(0.05, xR0 - tailX));
                zx = 1 - coke * 0.7 * f * f;
            } // Heck verjüngt
            else {
                const half = Math.max(0.05, (fAx - rAx) / 2);
                const waistAmp = P.waist != null ? P.waist : coke * 0.8; // Taillen-Pinch an der Tür → echter Hourglass (nicht 6 %)
                const haunchAmp = P.haunch != null ? P.haunch : 0; // optionale Hüfte über den Achsen (default 0 → kein Stance-Verlust)
                const sig = half * 0.42,
                    bl = Math.exp(-Math.pow((x - fAx) / sig, 2)) + Math.exp(-Math.pow((x - rAx) / sig, 2));
                zx = 1 + haunchAmp * bl - waistAmp * Math.max(0, 1 - Math.pow(x / half, 2));
            }
        } // Taille mittig maximal, voll an den Achsen
        return zy * zx;
    }
    // Verjüngt eine Aufbau-Gruppe: skaliert jeden Vertex in z nach seiner Höhe (im Gruppen-Frame, egal wo das Fahrzeug steht).
    // Greift Meshes UND Linien (der Frame ist aus Liniensegmenten).
    function taperBody(group, S, P) {
        if (P.taille <= 0 && P.tumblehome <= 0 && !(P.coke > 0)) return;
        group.updateMatrixWorld(true);
        const gInv = new THREE.Matrix4().copy(group.matrixWorld).invert();
        const v = new THREE.Vector3(),
            toL = new THREE.Matrix4(),
            mInv = new THREE.Matrix4();
        group.traverse((o) => {
            const geo = o.geometry;
            if (!geo || !geo.attributes || !geo.attributes.position) return;
            const pos = geo.attributes.position;
            toL.multiplyMatrices(gInv, o.matrixWorld);
            mInv.copy(toL).invert();
            for (let i = 0; i < pos.count; i++) {
                v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(toL);
                v.z *= crossSection(v.y, v.x, S, P);
                v.applyMatrix4(mInv);
                pos.setXYZ(i, v.x, v.y, v.z);
            }
            pos.needsUpdate = true;
            if (o.isMesh) geo.computeVertexNormals();
        });
    }

    // schneidet [x0,x1] an den Radhaus-Lücken aus → saubere Wand-Segmente
    function clipSegs(x0, x1, gaps) {
        let segs = [[Math.min(x0, x1), Math.max(x0, x1)]];
        for (const [g0, g1] of gaps) {
            const ng = [];
            for (const [a, b] of segs) {
                if (g1 <= a || g0 >= b) {
                    ng.push([a, b]);
                    continue;
                }
                if (g0 > a) ng.push([a, g0]);
                if (g1 < b) ng.push([g1, b]);
            }
            segs = ng;
        }
        return segs.filter(([a, b]) => b - a > 0.02);
    }

    // Gewölbtes Blech: unterteilte Box, Scheitel in der Mitte hochgezogen (Parabel über die Breite z), Normalen neu → liest sich rund statt flach.
    function dome(cx, cy, cz, hw, hh, hd, m, crown, rotZ, xTaper) {
        const segD = Math.max(14, Math.round(hd * 30)),
            segW = Math.max(10, Math.round(hw * 16));
        const geo = new THREE.BoxGeometry(hw * 2, hh * 2, hd * 2, segW, 1, segD);
        const p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) {
            const X = p.getX(i),
                Z = p.getZ(i);
            const fx = xTaper ? 1 - Math.pow(Math.min(1, Math.abs(X) / hw), 3) : 1; // Scheitel läuft an den x-Enden auf 0 → trifft Scheibe/Kante sauber (kein Spalt)
            p.setY(i, p.getY(i) + crown * (1 - Math.pow(Z / hd, 2)) * fx);
        } // Mitte rauf, Ränder bleiben
        geo.computeVertexNormals();
        const me = new THREE.Mesh(geo, m);
        me.position.set(cx, cy, cz);
        if (rotZ) me.rotation.z = rotZ;
        me.castShadow = true;
        me.receiveShadow = true;
        return me;
    }

    // gewölbtes Glas-Quad: 3x3-Gitter, Mitte entlang Flächennormale nach aussen (konvex in der Draufsicht)
    // unterteilte Box: viele Stützpunkte → taperBody/crossSection rendert die Schnitt-Form GLATT (Hüfte/Taille/Tuck) statt facettiert.
    function Bsub(cx, cy, cz, hw, hh, hd, m, sx, sy) {
        const me = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, hh * 2, hd * 2, sx || 1, sy || 1, 1), m);
        me.position.set(cx, cy, cz);
        me.castShadow = me.receiveShadow = true;
        return me;
    }
    // getonnte Lauffläche: Radius wölbt zur Mitte (Tonnenprofil), Schultern runden ab — echter Reifen statt gerader Zylinder.
    function crownedTread(r, w, crown, m) {
        const g = new THREE.CylinderGeometry(r, r, w, 40, 8, true);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i),
                y = pos.getY(i),
                z = pos.getZ(i);
            const f = 1 + crown * (1 - Math.pow((2 * y) / w, 2));
            pos.setX(i, x * f);
            pos.setZ(i, z * f);
        }
        g.computeVertexNormals();
        const me = new THREE.Mesh(g, m);
        me.rotation.x = Math.PI / 2;
        me.castShadow = true;
        return me;
    }
    // ── KULTUR: Grill-Signatur-Geometrie (Marken-DNA als Form). Rahmen aus Segment-Boxen entlang Polygon → Hexagon/Oval/aufrecht/Singleframe/breit. ──
    function polyFill(cx, yc, pts, mat) {
        const v = [cx, yc, 0];
        const idx = [];
        for (const q of pts) v.push(cx, q[0], q[1]);
        for (let i = 0; i < pts.length; i++) idx.push(0, 1 + i, 1 + ((i + 1) % pts.length));
        const ge = new THREE.BufferGeometry();
        ge.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
        ge.setIndex(idx);
        ge.computeVertexNormals();
        return new THREE.Mesh(ge, mat);
    }
    function ringEdges(gr, cx, yc, sides, rw, rh, rot, th, mat) {
        const pts = [];
        for (let i = 0; i < sides; i++) {
            const a = rot + (i / sides) * Math.PI * 2;
            pts.push([yc + Math.cos(a) * rh, Math.sin(a) * rw]);
        }
        for (let i = 0; i < sides; i++) {
            const A = pts[i],
                Q = pts[(i + 1) % sides];
            const my = (A[0] + Q[0]) / 2,
                mz = (A[1] + Q[1]) / 2,
                len = Math.hypot(Q[0] - A[0], Q[1] - A[1]) / 2,
                ang = Math.atan2(Q[1] - A[1], Q[0] - A[0]);
            const m = new THREE.Mesh(new THREE.BoxGeometry(th * 2, len * 2 + th * 1.6, th * 1.6), mat);
            m.position.set(cx, my, mz);
            m.rotation.x = ang;
            m.castShadow = true;
            gr.add(m);
        }
        return pts;
    }
    // ── KULTUR: geformte Scheinwerfer/Rückleuchten-Blende — maskiert die Rechteck-Öffnung in eine Markenform (Ring aus Segment-Boxen an (cx,yc,zc)). ──
    // ── KULTUR: geformte LEUCHTFLÄCHE (gefüllte Markenform) — die Linse selbst ist oval/winklig/breit/hoch, parametrisch wie Türen/Sitze. ──
    function shapedLens(g, type, cx, yc, zc, hw, hh, mat) {
        let sides, rw, rh, rot;
        if (type === "l_oval") {
            sides = 22;
            rw = hw;
            rh = hh * 0.82;
            rot = 0;
        } else if (type === "l_hex") {
            sides = 6;
            rw = hw;
            rh = hh;
            rot = 0;
        } else if (type === "l_upright") {
            sides = 4;
            rw = hw * 0.62;
            rh = hh;
            rot = Math.PI / 4;
        } else if (type === "l_single" || type === "l_wide") {
            sides = 4;
            rw = hw;
            rh = hh * 0.6;
            rot = Math.PI / 4;
        } else {
            sides = 4;
            rw = hw;
            rh = hh;
            rot = Math.PI / 4;
        }
        const v = [cx, yc, zc];
        const idx = [];
        for (let i = 0; i < sides; i++) {
            const a = rot + (i / sides) * Math.PI * 2;
            v.push(cx, yc + Math.cos(a) * rh, zc + Math.sin(a) * rw);
        }
        for (let i = 0; i < sides; i++) idx.push(0, 1 + i, 1 + ((i + 1) % sides));
        const ge = new THREE.BufferGeometry();
        ge.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
        ge.setIndex(idx);
        ge.computeVertexNormals();
        g.add(new THREE.Mesh(ge, mat));
    }
    function headlightShape(g, type, cx, yc, zc, hw, hh, M) {
        let sides, rw, rh, rot;
        if (type === "l_oval") {
            sides = 22;
            rw = hw;
            rh = hh * 0.82;
            rot = 0;
        } // Ferrari: oval
        else if (type === "l_hex") {
            sides = 6;
            rw = hw;
            rh = hh;
            rot = 0;
        } // Lambo: winklig (Hexagon)
        else if (type === "l_upright") {
            sides = 4;
            rw = hw * 0.62;
            rh = hh;
            rot = Math.PI / 4;
        } // Rolls: hoch/schmal
        else if (type === "l_single" || type === "l_wide") {
            sides = 4;
            rw = hw;
            rh = hh * 0.6;
            rot = Math.PI / 4;
        } // Audi/Merc: breit/flach
        else {
            sides = 4;
            rw = hw;
            rh = hh;
            rot = Math.PI / 4;
        } // Standard: gerundet-rechteckig
        for (let i = 0; i < sides; i++) {
            const a0 = rot + (i / sides) * Math.PI * 2,
                a1 = rot + ((i + 1) / sides) * Math.PI * 2;
            const y0 = yc + Math.cos(a0) * rh,
                z0 = zc + Math.sin(a0) * rw,
                y1 = yc + Math.cos(a1) * rh,
                z1 = zc + Math.sin(a1) * rw;
            const my = (y0 + y1) / 2,
                mz = (z0 + z1) / 2,
                len = Math.hypot(y1 - y0, z1 - z0) / 2,
                ang = Math.atan2(z1 - z0, y1 - y0);
            const m = new THREE.Mesh(new THREE.BoxGeometry(0.02, len * 2 + 0.012, 0.013), M.steel);
            m.position.set(cx, my, mz);
            m.rotation.x = ang;
            m.castShadow = true;
            g.add(m);
        }
    }
    function grilleShape(gr, type, cx, yc, hw, hh, M) {
        if (type === "hex") {
            const p = ringEdges(gr, cx + 0.006, yc, 6, hw, hh, Math.PI / 6, 0.013, M.steel);
            gr.add(polyFill(cx - 0.05, yc, p, M.grille));
            for (let i = 0; i < 2; i++) {
                const yy = yc - hh * 0.33 + hh * 0.66 * i;
                gr.add(B(cx - 0.02, yy, 0, 0.01, 0.005, hw * 0.72, M.steel));
            }
        } else if (type === "oval") {
            const p = ringEdges(gr, cx + 0.006, yc, 28, hw, hh * 0.94, 0, 0.012, M.steel);
            gr.add(polyFill(cx - 0.05, yc, p, M.grille));
            for (let i = 0; i < 5; i++) {
                const f = Math.sqrt(Math.max(0.1, 1 - Math.pow((i - 2) / 2.6, 2)));
                const yy = yc - hh * 0.6 + (hh * 1.2 * i) / 4;
                gr.add(B(cx - 0.02, yy, 0, 0.011, 0.004, hw * 0.78 * f, M.steel));
            }
        } else if (type === "upright") {
            const rw = hw * 0.62,
                rh = hh * 1.16;
            gr.add(B(cx - 0.05, yc, 0, 0.03, rh, rw, M.grille));
            gr.add(B(cx - 0.004, yc, 0, 0.012, rh + 0.012, rw + 0.012, M.steel));
            for (let i = 0; i < 7; i++) {
                const zz = -rw * 0.82 + (rw * 1.64 * i) / 6;
                gr.add(B(cx - 0.02, yc, zz, 0.015, rh * 0.94, 0.005, M.steel));
            }
        } else if (type === "single") {
            const rh = hh * 1.45,
                cyy = yc + hh * 0.3;
            const p = ringEdges(gr, cx + 0.006, cyy, 6, hw, rh, Math.PI / 6, 0.013, M.steel);
            gr.add(polyFill(cx - 0.05, cyy, p, M.grille));
            for (let i = 0; i < 8; i++) {
                const zz = -hw * 0.82 + (hw * 1.64 * i) / 7;
                gr.add(B(cx - 0.02, cyy, zz, 0.013, rh * 0.82, 0.004, M.steel));
            }
        } else if (type === "wide") {
            const rw = hw * 1.1,
                rh = hh * 0.72;
            gr.add(B(cx - 0.05, yc, 0, 0.03, rh, rw, M.grille));
            gr.add(B(cx - 0.004, yc, 0, 0.012, rh + 0.01, rw + 0.012, M.steel));
            for (let i = 0; i < 3; i++) {
                const yy = yc + (i - 1) * rh * 0.5;
                gr.add(B(cx - 0.018, yy, 0, 0.012, 0.01, rw * 0.9, M.steel));
            }
            gr.add(B(cx + 0.03, yc, 0, 0.035, rh * 0.3, rh * 0.3, M.steel));
        } else {
            gr.add(B(cx - 0.06, yc, 0, 0.03, hh, hw - 0.005, M.grille));
            for (let i = 0; i < 4; i++) {
                const yy = yc - hh + 0.015 + ((2 * hh - 0.03) * i) / 3;
                gr.add(B(cx - 0.025, yy, 0, 0.018, 0.006, hw - 0.015, M.steel));
            }
            gr.add(B(cx - 0.004, yc, 0, 0.012, hh + 0.008, hw + 0.008, M.housing));
        }
    }
    function bowedQuad(p0, p1, p2, p3, bow, mat) {
        const N = 6;
        const lp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
        const e1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]],
            e2 = [p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]];
        let nx = e1[1] * e2[2] - e1[2] * e2[1],
            ny = e1[2] * e2[0] - e1[0] * e2[2],
            nz = e1[0] * e2[1] - e1[1] * e2[0];
        const nl = Math.hypot(nx, ny, nz) || 1;
        nx /= nl;
        ny /= nl;
        nz /= nl;
        const Pt = (u, v) => {
            const tp = lp(p0, p1, u),
                bt = lp(p3, p2, u),
                q = lp(tp, bt, v),
                b = bow * (1 - Math.pow(2 * u - 1, 2)) * (1 - Math.pow(2 * v - 1, 2));
            return [q[0] + nx * b, q[1] + ny * b, q[2] + nz * b];
        };
        const arr = [];
        for (let i = 0; i < N; i++)
            for (let j = 0; j < N; j++) {
                const a = Pt(i / N, j / N),
                    b = Pt((i + 1) / N, j / N),
                    c = Pt(i / N, (j + 1) / N),
                    d = Pt((i + 1) / N, (j + 1) / N);
                arr.push(...a, ...c, ...b, ...b, ...c, ...d);
            }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
        geo.computeVertexNormals();
        return new THREE.Mesh(geo, mat);
    }
    // Plan-Konvexität an Nase/Heck: Mitte wölbt in x nach aussen, Ränder bleiben → Draufsicht konvex (Geschwister von taperBody).
    // BIEGUNG: krümmt EINE Komponente entlang Achse u, versetzt Achse d — überlagerbar mit Wölbung (Deformer-Stack).
    //   fn(t), t∈[-1,1] über die Mesh-Ausdehnung in u. Parabel (1-t²)=weich; (1-t⁴)/Tangenten-Tuck=Tension/progressiver Rand.
    function bend(mesh, u, d, fn) {
        const pos = mesh.geometry.attributes.position;
        const U = u.toUpperCase(),
            D = d.toUpperCase();
        let lo = Infinity,
            hi = -Infinity;
        for (let i = 0; i < pos.count; i++) {
            const uu = pos["get" + U](i);
            if (uu < lo) lo = uu;
            if (uu > hi) hi = uu;
        }
        const c = (lo + hi) / 2,
            h = (hi - lo) / 2 || 1;
        for (let i = 0; i < pos.count; i++) {
            const t = (pos["get" + U](i) - c) / h;
            pos["set" + D](i, pos["get" + D](i) + fn(t));
        }
        if (mesh.geometry.computeVertexNormals) mesh.geometry.computeVertexNormals();
    }
    function bowEnds(group, S) {
        const noseX = S.noseX,
            tailX = S.tailX,
            bw = S.bw;
        const zoneF = Math.max(0.2, (noseX - S.cowlX) * 0.55),
            zoneR = Math.max(0.2, (S.backX - tailX) * 0.55),
            amp = 0.07,
            ampV = 0.052,
            yMidF = (S.ySill + S.yBelt) / 2,
            yHalfF = (S.yBelt - S.ySill) / 2 + 0.08; // ampV/yf: vertikale Stirnflächen-Wölbung
        group.updateMatrixWorld(true);
        const gInv = new THREE.Matrix4().copy(group.matrixWorld).invert();
        const v = new THREE.Vector3(),
            toL = new THREE.Matrix4(),
            mInv = new THREE.Matrix4();
        group.traverse((o) => {
            const geo = o.geometry;
            if (!geo || !geo.attributes || !geo.attributes.position) return;
            const pos = geo.attributes.position;
            toL.multiplyMatrices(gInv, o.matrixWorld);
            mInv.copy(toL).invert();
            for (let i = 0; i < pos.count; i++) {
                v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(toL);
                const zf = 1 - Math.min(1, Math.pow(v.z / bw, 2));
                const yf = Math.max(0, 1 - Math.pow((v.y - yMidF) / yHalfF, 2));
                let dx = 0; // yf=vertikale Wölbung (Mitte-Fascia max)
                if (v.x > noseX - zoneF) {
                    const r = Math.min(1, (v.x - (noseX - zoneF)) / zoneF);
                    dx = (amp * zf + ampV * yf) * r * r;
                } else if (v.x < tailX + zoneR) {
                    const r = Math.min(1, (tailX + zoneR - v.x) / zoneR);
                    dx = -(amp * zf + ampV * yf) * r * r;
                }
                v.x += dx;
                v.applyMatrix4(mInv);
                pos.setXYZ(i, v.x, v.y, v.z);
            }
            pos.needsUpdate = true;
            if (o.isMesh) geo.computeVertexNormals();
        });
    }
    function buildSkin(H, P, ctx) {
        const M = (ctx && ctx.M) || materials();
        const bodyMat = (ctx && ctx.bodyMat) || materials().clay;
        const doors = (ctx && ctx.doors) || [];
        const g = new THREE.Group();
        const S = scal(H, P);
        const cEdge = P.cEdge != null ? P.cEdge : 0.3,
            cTen = P.cTension != null ? P.cTension : 0.5,
            cSta = P.cStance != null ? P.cStance : 0.5; // KULTUR-Achsen
        const cMul = (1 - cEdge * 0.4) * (0.82 + cTen * 0.4); // Kante↔Fläche × Spannung → Crown-Multiplikator (Kante=flacher, Spannung=voller)
        const { fAx, rAx, noseX, tailX, cowlX, backX, roofF, roofR, bw, ySill, yBelt, yRoof } = S;
        const t = 0.025,
            cwK = bw - 0.015,
            archHalf = P.radR * 1.18,
            hz = P.spur / 2,
            clr = hz - 0.135;
        const yC = (ySill + yBelt) / 2,
            yH = (yBelt - ySill) / 2,
            yU = (ySill + 0.1 + yBelt) / 2,
            yUh = (yBelt - (ySill + 0.1)) / 2;
        const Aw = S.Awin,
            Cw = S.Cwin,
            gB = yBelt + 0.02,
            gT = yRoof - 0.022;
        const gaps = [
            [fAx - archHalf, fAx + archHalf],
            [rAx - archHalf, rAx + archHalf],
        ];
        const dFx = Math.min(cowlX - 0.02, fAx - archHalf - 0.04),
            dBx = P.kabineMitte; // Türvorderkante: nie in der Radaussparung
        const hasVent = cowlX - 0.02 - dFx > 0.05; // FWD/SUV: Kabine weit vorn → Eckfenster nötig
        const tueren = P.tueren || 2; // 2- oder 4-Türer
        const xAt = (y) => cowlX + ((y - yBelt) / (yRoof - yBelt)) * (roofF - cowlX); // A-Säulen-Linie
        const xAtC = (y) => backX + ((y - yBelt) / (yRoof - yBelt)) * (roofR - backX); // C-Säulen-Linie
        const dFxAt = (y) => dFx + ((y - yBelt) / (yRoof - yBelt)) * (roofF - cowlX); // Türvorderkante (parallel A-Säule)
        const dRx = tueren >= 4 ? Math.max(backX, rAx + archHalf + 0.04) : backX; // Hintertür-Hinterkante: nie ins Hinterrad
        const hasRearQ = tueren >= 4 && dRx - backX > 0.05; // dann festes hinteres Eckfenster (Sail)
        const archShoulderY = (xx) => {
            // Bogen-Hüllkurve (Radkasten-Scheitel) an xx — Struktur muss DRÜBER, nie schneiden (Bogen ist Master)
            let y = yBelt;
            for (const ax of [fAx, rAx]) {
                const d = Math.abs(xx - ax);
                if (d < archHalf) {
                    const archTopV = Math.max(yBelt + 0.015, 2 * P.radR + wheelClearance(P, ax, ax === fAx).gap); // Scheitel: Freigang aus LIVE-Nickphysik (deckt Bremstauchen+Squat)
                    y = Math.max(y, yBelt + (archTopV - yBelt) * (1 - Math.pow(d / archHalf, 2)));
                }
            }
            return y;
        };
        // ── F · KAROSSERIE-SCHALE: Aussenpaneele auf z=±bw, Stirn auf x=nose/tail (saubere Ecken) ──
        const fenderSegs =
            tueren >= 4
                ? [
                      [dFx, noseX],
                      [dRx, backX],
                      [backX, tailX],
                  ]
                : [
                      [dFx, noseX],
                      [dBx, backX],
                      [backX, tailX],
                  ]; // 4-Türer: Türen frei, Quarter ab dRx
        for (const sd of [-1, 1]) {
            for (const [a, b] of clipSegs(tailX, noseX, gaps))
                g.add(
                    Bsub(
                        (a + b) / 2,
                        ySill + 0.05,
                        sd * bw,
                        (b - a) / 2,
                        0.05,
                        t,
                        bodyMat,
                        Math.max(2, Math.round((b - a) * 8)),
                        3
                    )
                ); // Schweller (an Rädern ausgespart)
            for (const [x0, x1] of fenderSegs)
                for (const [a, b] of clipSegs(x0, x1, gaps))
                    g.add(
                        Bsub(
                            (a + b) / 2,
                            yU,
                            sd * bw,
                            (b - a) / 2,
                            yUh,
                            t,
                            bodyMat,
                            Math.max(3, Math.round((b - a) * 9)),
                            6
                        )
                    ); // Kotflügel/Quarter (Türbereiche frei)
            {
                const ySh = yBelt - 0.14,
                    zSh = bw + 0.006;
                for (const [x0, x1] of fenderSegs)
                    for (const [a, b] of clipSegs(x0, x1, gaps))
                        g.add(B((a + b) / 2, ySh, sd * zSh, (b - a) / 2, 0.013, 0.013, bodyMat));
            } // nur Karosserie-Paneele (Türzonen frei) // CHARAKTER-SICKE: Schulterlinie bricht die flache Flanke
            for (const x of [fAx, rAx]) {
                const isFront = x === fAx; // Radkasten: folgt dem Rad als hochgezogener Bogen
                // Freiraum GEMESSEN aus der LIVE-Fahrphysik: Nicktauchen+Squat (vertikal) · Einlenk-Schwenk+Wanken (inboard) — keine 1-g-Schaetzung
                const WC = wheelClearance(P, x, isFront);
                const archGap = WC.gap; // Spalt zum Rad = Bremstauchen+Squat+Reserve (aMax, ζ-Ueberschwingen)
                const archTopV = Math.max(yBelt + 0.015, 2 * P.radR + archGap),
                    humpRise = archTopV - yBelt; // Bogenscheitel über dem Rad
                {
                    const iwT = yBelt + humpRise + 0.04,
                        cy = (ySill + iwT) / 2,
                        nx = Math.max(16, Math.round(archHalf * 50));
                    const clrIn = hz - clr; // Schalen-Grund-Einzug ab Radmitte (=0.135)
                    const bowReq = WC.inb - clrIn + P.radR * WC.roll + 0.015; // noetiger Zusatz-Schwenk: gelenkter inboard-Rand + Wankversatz + 15 mm
                    const bowMax = Math.min(clr * 0.82, Math.max(Math.min(0.13, P.radR * 0.34), bowReq)); // nie kleiner als bisher, nie ueber die Mitte
                    const iw = Bsub(x, cy, sd * clr, archHalf, (iwT - ySill) / 2, t, bodyMat, nx, 4);
                    const pos = iw.geometry.attributes.position;
                    for (let i = 0; i < pos.count; i++) {
                        const lx = pos.getX(i),
                            tgt = yBelt + humpRise * (1 - Math.pow(lx / archHalf, 2)) + 0.022,
                            wy = cy + pos.getY(i),
                            f = Math.min(1, Math.max(0, (wy - ySill) / (iwT - ySill)));
                        pos.setY(i, ySill + f * (tgt - ySill) - cy);
                        const bow = bowMax * (1 - Math.pow(lx / archHalf, 2)) * (1 - f);
                        pos.setZ(i, pos.getZ(i) - sd * bow);
                    } // Radmitte max einwaerts (gelenkter Reifen), oben 0 (clr, am Kotfluegel)
                    iw.geometry.computeVertexNormals();
                    g.add(iw);
                }
                g.add(
                    B(
                        x + archHalf,
                        (ySill + yBelt + 0.022) / 2,
                        (sd * (clr + bw)) / 2,
                        t,
                        (yBelt + 0.022 - ySill) / 2,
                        (bw - clr) / 2,
                        bodyMat
                    )
                ); //   Wand vorn
                g.add(
                    B(
                        x - archHalf,
                        (ySill + yBelt + 0.022) / 2,
                        (sd * (clr + bw)) / 2,
                        t,
                        (yBelt + 0.022 - ySill) / 2,
                        (bw - clr) / 2,
                        bodyMat
                    )
                ); //   Wand hinten
                const tHalf = 0.115,
                    zTin = Math.max(clr + 0.005, hz - tHalf),
                    zTo = bw + 0.024; //   Reifenfenster (z) — voll (Bogen ist Master, wird NICHT geschrumpft)
                const wF = x + P.radR + 0.01,
                    wB = x - P.radR - 0.01; //   Reifen-Vorder-/Hinterkante
                const par = (xx) => yBelt + humpRise * (1 - Math.pow((xx - x) / archHalf, 2)); //   Bogen-Parabel
                // ── RADLAUF-KOTFLÜGEL: gebogene Streifen entlang par (statt ~30 Box-Segmenten) ──
                const NA = Math.max(34, Math.round(archHalf * 72)),
                    yTop = yBelt + humpRise,
                    parB = (tt) => par(x + tt * archHalf) - yBelt;
                for (const seg of [
                    [x - archHalf, wB, clr, zTo],
                    [wF, x + archHalf, clr, zTo],
                    [wB, wF, clr, zTin],
                    [wB, wF, Math.min(hz + tHalf, zTo - 0.005), zTo],
                ]) {
                    // Haunch-Fläche: beside-tire voll, over-tire inboard + OUTBOARD-Streifen (neben Reifen, sonst Durchblick ins Leere)
                    const xa = seg[0],
                        xb = seg[1],
                        za = seg[2],
                        zb = seg[3];
                    if (xb - xa < 0.012 || zb - za < 0.008) continue;
                    const xc = (xa + xb) / 2,
                        xh = (xb - xa) / 2,
                        ns = Math.max(6, Math.round(xh * 64));
                    const pan = Bsub(
                        xc,
                        (yBelt + yTop) / 2,
                        (sd * (za + zb)) / 2,
                        xh,
                        (yTop - yBelt) / 2,
                        (zb - za) / 2,
                        bodyMat,
                        ns,
                        1
                    );
                    bend(pan, "x", "y", (tt) => par(xc + tt * xh) - yTop);
                    g.add(pan);
                } // Oberkante glatt auf par gebogen
                {
                    const ob = Bsub(x, yBelt, (sd * (zTin + zTo)) / 2, archHalf, t, (zTo - zTin) / 2, bodyMat, NA, 1);
                    bend(ob, "x", "y", parB);
                    g.add(ob);
                } // Aussen-Band über dem Reifen — EIN glatter Streifen
                g.add(
                    B(
                        wF,
                        (yBelt + par(wF)) / 2,
                        (sd * (zTin + zTo)) / 2,
                        t,
                        (par(wF) - yBelt) / 2 + t,
                        (zTo - zTin) / 2,
                        bodyMat
                    )
                ); // Kappe vorn
                g.add(
                    B(
                        wB,
                        (yBelt + par(wB)) / 2,
                        (sd * (zTin + zTo)) / 2,
                        t,
                        (par(wB) - yBelt) / 2 + t,
                        (zTo - zTin) / 2,
                        bodyMat
                    )
                ); // Kappe hinten
                {
                    const zLip = zTo + 0.014;
                    const rim = Bsub(x, yBelt, sd * zLip, archHalf, 0.014, 0.014, bodyMat, NA, 1);
                    bend(rim, "x", "y", parB);
                    g.add(rim);
                } // BOGENRAND: EIN gebogener Streifen, full arch → glatte Radlauf-Kontur
            }
            // Überhang-Innenwände: Front-/Heck-Überhang inboard schliessen → kein Durchblick im Eck Haube↔Lampe
            {
                const oxc = (fAx + archHalf + noseX) / 2,
                    oxh = (noseX - (fAx + archHalf)) / 2,
                    oT = yBelt + 0.04,
                    cy = (ySill + oT) / 2,
                    nx = Math.max(10, Math.round(oxh * 32)),
                    HD = Math.min(0.18, (noseX - cowlX) * 0.22); // Front-Überhang: tan + gebogen, Oberkante folgt Haube-Kotflügel-Linie zur Nase → durchgehende Kontur Bogen→Nase
                const ow = Bsub(oxc, cy, sd * clr, oxh, (oT - ySill) / 2, t, bodyMat, nx, 1);
                const pos = ow.geometry.attributes.position;
                for (let i = 0; i < pos.count; i++) {
                    const wx = oxc + pos.getX(i),
                        tgt = Math.max(yBelt - ((wx - cowlX) / (noseX - cowlX)) * HD, yBelt - 0.015) + 0.008,
                        wy = cy + pos.getY(i),
                        f = (wy - ySill) / (oT - ySill);
                    pos.setY(i, ySill + f * (tgt - ySill) - cy);
                }
                ow.geometry.computeVertexNormals();
                g.add(ow);
            }
            g.add(
                B(
                    (rAx - archHalf + tailX) / 2,
                    (ySill + yBelt) / 2,
                    sd * clr,
                    (rAx - archHalf - tailX) / 2,
                    (yBelt - ySill) / 2,
                    t,
                    bodyMat
                )
            );
        }
        const hoodDrop = Math.min(0.18, (noseX - cowlX) * 0.22),
            yNose = yBelt - hoodDrop; // Haubenkante fällt zur Nase → Keil/Stance
        // ── FRONT — Rahmen-Schürze (Eck-Loch zu) + vertiefter Grill + integrierte Scheinwerfer ──
        {
            const gH = bw * (P.grilleW || 0.33),
                yGB = ySill + 0.05,
                yGT = yBelt - (P.grilleDrop != null ? P.grilleDrop : 0.18); // Grill-Öffnung (Mitte)
            const zLi = clr + 0.02,
                zLo = bw - 0.03,
                yLc = yBelt - (P.lightDrop || 0.115),
                yLh = P.lightH || 0.055,
                yLb = yLc - yLh,
                yLt = yLc + yLh; // Scheinwerfer-Öffnung (aussen) — grösser
            g.add(B(noseX, (ySill + yGB) / 2, 0, t, (yGB - ySill) / 2, clr, bodyMat)); //   Rahmen: unter Grill
            g.add(B(noseX, (yGT + yNose) / 2, 0, t, (yNose - yGT) / 2, clr, bodyMat)); //   Rahmen: über Grill (bis Haubenkante)
            for (const sd of [-1, 1]) {
                g.add(B(noseX, (yGB + yGT) / 2, (sd * (gH + clr)) / 2, t, (yGT - yGB) / 2, (clr - gH) / 2, bodyMat)); //   neben Grill (innen)
                g.add(
                    B(noseX, (ySill + yLb) / 2, (sd * (clr + bw)) / 2, t, (yLb - ySill) / 2, (bw - clr) / 2, bodyMat)
                ); //   unter Licht (aussen)
                g.add(
                    B(noseX, (yLt + yBelt) / 2, (sd * (clr + bw)) / 2, t, (yBelt - yLt) / 2, (bw - clr) / 2, bodyMat)
                ); //   über Licht bis Gürtel → Eck-Loch zu
                g.add(B(noseX, (yLb + yLt) / 2, (sd * (clr + zLi)) / 2, t, (yLt - yLb) / 2, (zLi - clr) / 2, bodyMat)); //   innen neben Licht
                g.add(B(noseX, (yLb + yLt) / 2, (sd * (zLo + bw)) / 2, t, (yLt - yLb) / 2, (bw - zLo) / 2, bodyMat)); //   aussen neben Licht
            }
            grilleShape(g, P.cGrille || "rect", noseX, (yGB + yGT) / 2, gH, (yGT - yGB) / 2, M); //   KULTUR-SIGNATUR: Grill-Form je Marke
            if (cEdge > 0.45) {
                const prom = 0.003 + cEdge * 0.01; //   KULTUR cEdge: Charakterlinien NUR auf Karosserie-Paneelen (Radhäuser+Türöffnung ausgespart → kein Schweben/Überlauf)
                for (const sd of [-1, 1])
                    for (const [x0, x1] of fenderSegs)
                        for (const [a, b] of clipSegs(x0, x1, gaps)) {
                            g.add(B((a + b) / 2, yBelt - 0.1, sd * bw, (b - a) / 2, 0.009, prom, bodyMat)); //   Schulter-Linie
                            g.add(B((a + b) / 2, ySill + 0.11, sd * bw, (b - a) / 2, 0.008, prom * 0.85, bodyMat));
                        } //   Rocker-Akzent
                if (cEdge > 0.7)
                    for (const sd of [-1, 1]) {
                        const cf = 0.6,
                            cx2 = cowlX + cf * (noseX - cowlX),
                            chw = Math.abs(noseX - cowlX) * 0.26,
                            cy2 = yBelt - cf * hoodDrop + 0.01,
                            dpu = (hoodDrop * chw) / (noseX - cowlX);
                        const cr = Bsub(cx2, cy2, sd * clr * 0.5, chw, 0.006, prom * 0.8, bodyMat, 8, 1);
                        bend(cr, "x", "y", (u) => -dpu * u);
                        g.add(cr);
                    }
            } // Power-Dome-Grat SITZT auf der Haube (Höhe=Haubenfläche bei f, fällt linear mit hoodDrop)
            g.add(B(noseX - 0.03, ySill + 0.045, 0, 0.02, 0.022, bw * 0.46, M.grille)); //   unterer Lufteinlass (Splitter-Schlund)
            g.add(
                B(
                    noseX + 0.015 + cSta * 0.022,
                    ySill + 0.028,
                    0,
                    0.018 + cSta * 0.012,
                    0.01,
                    bw * (0.56 + cSta * 0.24),
                    bodyMat
                )
            ); //   FRONT-SPLITTER: KULTUR Haltung skaliert Tiefe+Breite
            if (cSta > 0.62) g.add(B(noseX + 0.045, ySill + 0.016, 0, 0.016, 0.006, bw * 0.5, M.housing)); //   aggressive Frontlippe (Haltung)
            const wSig = (yLt - yLb) * 0.17; //   GESETZ: Strichstärke = Anteil der Öffnungshöhe (gleicher Duktus über alle Presets)
            for (const sd of [-1, 1]) {
                const zc = (zLi + zLo) / 2,
                    zhw = (zLo - zLi) / 2;
                g.add(B(noseX - 0.055, yLc, sd * zc, 0.038, yLh, zhw, M.housing)); //   Wanne (dunkel, tief)
                g.add(B(noseX - 0.012, yLc, sd * zc, 0.008, yLh - 0.012, zhw - 0.012, M.steel)); //   Reflektor (tief, klein)
                shapedLens(g, P.cLight || "rect", noseX - 0.002, yLc, sd * zc, zhw * 0.88, yLh * 0.92, M.lensW); //   KULTUR: geformte LEUCHTFLÄCHE (Linse als Markenform)
                headlightShape(g, P.cLight || "rect", noseX + 0.006, yLc, sd * zc, zhw * 0.92, yLh * 0.98, M); //   geformte Blende (Ring) um die Linse
                g.add(B(noseX + 0.006, yLc - 0.014, sd * (zc - zhw * 0.35), 0.008, 0.014, 0.024, M.lensW)); //   Projektor = Hauptlicht (hinter der Signatur)
                lightStrokes(g, P.cLight || P.sig || "blade", sd, zLi, zLo, yLb, yLt, noseX + 0.028, wSig, M.drl); //   DRL-SIGNATUR — Charakter über P.sig
                g.add(B(noseX + 0.026, yLb + wSig * 0.7, sd * (zLi + 0.06), 0.006, wSig * 0.45, 0.05, M.lensA)); //   Blinker (amber, fester Slot: unten innen)
                g.add(B(noseX - 0.075, yLt - 0.01, sd * (bw + 0.03), 0.055, 0.009, 0.004, M.drl)); //   DRL um die Ecke (proud Flanke)
            }
        }
        // ── HECK — Rahmen-Schürze + vertiefte Rückleuchten + definierter Diffusor ──
        {
            const dH = bw * 0.4,
                yDB = ySill + 0.04,
                yDT = ySill + 0.16; // Diffusor-Öffnung (unten Mitte)
            const zRi = bw * 0.3,
                zRo = bw - 0.03,
                yRc = yBelt - 0.13,
                yRh = 0.045,
                yRb = yRc - yRh,
                yRt = yRc + yRh; // Rückleuchten-Band (breit, bis Mitte)
            g.add(B(tailX, (yRt + yBelt) / 2, 0, t, (yBelt - yRt) / 2, bw, bodyMat)); //   Rahmen: über Leuchten (volle Breite)
            g.add(B(tailX, (ySill + yRb) / 2, 0, t, (yRb - ySill) / 2, zRi, bodyMat)); //   Rahmen: unter Leuchten Mitte (über Diffusor)
            for (const sd of [-1, 1]) {
                g.add(
                    B(tailX, (ySill + yRb) / 2, (sd * (zRi + bw)) / 2, t, (yRb - ySill) / 2, (bw - zRi) / 2, bodyMat)
                ); //   unter Leuchten aussen
                g.add(B(tailX, (yRb + yRt) / 2, (sd * (zRo + bw)) / 2, t, (yRt - yRb) / 2, (bw - zRo) / 2, bodyMat)); //   aussen neben Leuchten
            }
            g.add(B(tailX, (yRb + yRt) / 2, 0, t, (yRt - yRb) / 2, zRi, bodyMat)); //   Mittelsteg zwischen den Leuchten
            // Rückleuchten — Leuchtband (Signatur) + Eck-Cluster; ALLE Linsen stehen VOR der Heckfläche (tailX−t) → poke-through, durchgehend, keine Bugs
            const rs = tailX - t; // echte Heckfläche (Paneele sind ±t dick)
            const wSigR = (yRt - yRb) * 0.18;
            for (const sd of [-1, 1]) {
                const zc = (zRi + zRo) / 2,
                    zhw = (zRo - zRi) / 2;
                g.add(B(tailX + 0.03, yRc, sd * zc, 0.035, yRh, zhw, M.housing)); //   Wanne (dunkel)
                g.add(B(rs + 0.004, yRc, sd * zc, 0.007, yRh - 0.012, zhw - 0.012, M.steel)); //   Reflektor (tief, klein)
                shapedLens(g, P.cLight || "rect", rs + 0.004, yRc, sd * zc, zhw * 0.88, yRh * 0.92, M.lensR); //   KULTUR: geformte rote LEUCHTFLÄCHE
                headlightShape(g, P.cLight || "rect", rs + 0.001, yRc, sd * zc, zhw * 0.92, yRh * 0.98, M); //   geformte Blende (Ring)
                lightStrokes(g, P.cLight || P.sig || "blade", sd, zRi, zRo, yRb, yRt, rs - 0.006, wSigR, M.lensR); //   Rück-SIGNATUR (gleicher Charakter, rot)
                g.add(B(rs - 0.004, yRb + wSigR * 0.7, sd * (zRo - 0.06), 0.006, wSigR * 0.45, 0.05, M.lensA)); //   Blinker (amber)
            }
            if (P.cLight === "l_single")
                g.add(B(rs - 0.004, yRc, 0, 0.006, (yRt - yRb) * 0.5 * 0.45, zRi * 0.96, M.lensR)); //   KULTUR: durchgehendes Heck-Leuchtband (Audi)
            // Diffusor — vertiefte Rückwand + vertikale Finnen
            g.add(B(tailX + 0.045, (yDB + yDT) / 2, 0, 0.03, (yDT - yDB) / 2, dH, M.grille)); //   Rückwand (vertieft)
            g.add(B(tailX - 0.016, ySill + 0.03, 0, 0.018, 0.01, bw * 0.6, bodyMat)); //   HECK-Schürzenlippe: Tiefe am Heck
            for (let i = 0; i < 5; i++) {
                const zz = -dH + 0.02 + ((2 * dH - 0.04) * i) / 4;
                g.add(B(tailX + 0.02, (yDB + yDT) / 2, zz, 0.02, (yDT - yDB) / 2 - 0.005, 0.012, M.steel));
            } //   Finnen (vertikal)
            // ── KULTUR Auspuff (Marken-Signatur am Heck) ──
            {
                const ey = ySill + 0.035,
                    ex = tailX - 0.012,
                    gr = P.cGrille;
                if (gr === "oval") {
                    for (const o of [-1, 1])
                        for (let i = 0; i < 2; i++)
                            g.add(C(ex, ey, o * (bw * 0.26 + i * 0.075), "x", 0.027, 0.05, M.steel));
                } // Ferrari: vier runde Endrohre
                else if (gr === "hex") {
                    g.add(B(ex - 0.01, ey, 0, 0.022, 0.034, bw * 0.16, M.housing));
                    for (const o of [-1, 1]) g.add(C(ex, ey, o * bw * 0.2, "x", 0.034, 0.06, M.steel));
                } // Lambo: zentral-hexagonal, zwei grosse
                else if (gr === "single") {
                    for (const o of [-1, 1]) g.add(B(ex, ey, o * bw * 0.52, 0.02, 0.024, 0.055, M.steel));
                } // Audi: zwei Trapez-Endrohre aussen
                else if (gr === "wide") {
                    for (const o of [-1, 1]) g.add(C(ex, ey, o * bw * 0.52, "x", 0.026, 0.05, M.steel));
                } // Mercedes: zwei runde, weit aussen
                /* Monolith (upright): versteckt — kein sichtbares Endrohr */
            }
        }
        // ── KULTUR Haltung: Heckflügel (aggressiv) + Seitenschweller ──
        {
            const aH = P.radR * 1.18; // Radhaus-Halbbreite (für saubere Skirt-Länge zwischen den Rädern)
            if ((P.heck || "stufe") !== "steil" && P.cGrille === "hex" && cSta > 0.7) {
                const wy = yBelt + 0.135,
                    wx = tailX + 0.05,
                    sp = bw * 0.76,
                    ch = 0.085; // TORO/Lambo: hoher Heckflügel auf Stützen
                const bl = Bsub(wx, wy, 0, ch, 0.009, sp, M.housing, 10, 1);
                bend(bl, "x", "y", (u) => -0.014 * (1 - u * u));
                g.add(bl); //   Airfoil-Wölbung (Mitte höher → Profil statt Brett)
                g.add(B(wx, wy + 0.009, 0, ch * 0.7, 0.004, sp * 0.99, M.steel)); //   Oberkante (Glanzkante)
                for (const sd of [-1, 1])
                    g.add(
                        B(
                            wx - 0.005,
                            (yBelt + 0.015 + wy) / 2,
                            sd * sp * 0.8,
                            0.01,
                            (wy - 0.015 - yBelt) / 2,
                            0.012,
                            M.steel,
                            -0.16
                        )
                    );
            } //   geneigte schlanke Stützen
            else if ((P.heck || "stufe") !== "steil" && P.cGrille === "oval" && cSta > 0.65) {
                const dy = yBelt + 0.03,
                    dx2 = tailX + 0.045; // CAVALLO/Ferrari: dezenter Ducktail (Abrisskante statt Flügel)
                const dt = Bsub(dx2, dy, 0, 0.07, 0.012, bw * 0.8, M.housing, 8, 1);
                bend(dt, "x", "y", (u) => 0.026 * Math.max(0, -u));
                g.add(dt); //   Hinterkante kickt hoch
                g.add(B(dx2 - 0.01, dy + 0.012, 0, 0.05, 0.004, bw * 0.79, M.steel));
            } //   Glanzkante
            if (cSta > 0.62) {
                const xc = (fAx + rAx) / 2,
                    xh = Math.abs(fAx - rAx) / 2 - aH - 0.02; // Seitenschweller: NUR zwischen den Radhäusern, am Schweller, proud (kein Schweben/Überlauf)
                for (const sd of [-1, 1]) g.add(B(xc, ySill + 0.012, sd * bw, xh, 0.02, 0.026, M.housing));
            }
        } //   sitzt auf der Schwellerlinie (z=bw → taperBody zieht ihn auf die Tuck-Fläche)
        g.add(B((noseX + tailX) / 2, ySill, 0, (noseX - tailX) / 2, t, hz - 0.16, bodyMat)); // Unterboden Mitte (auf echter Nase-Heck-Mitte, nicht Achs-Mitte)
        for (const sd of [-1, 1])
            for (const [a, b] of clipSegs(tailX, noseX, gaps))
                g.add(
                    B((a + b) / 2, ySill, (sd * (hz - 0.16 + bw)) / 2, (b - a) / 2, t, (bw - (hz - 0.16)) / 2, bodyMat)
                ); // äusserer Boden bis zur Flanke (an Rädern ausgespart) — keine Lücke mehr
        // ── KONTUR-LIPPEN: Rahmen überragt die Stirnflächen minimal (proud > ±t) → Schattenkante statt flaches Brett, kein Koplanar-Bug ──
        {
            const fpl = noseX + 0.025,
                rpl = tailX - 0.025; // proud-Ebene vor Front/Heck-Fläche
            const yFb = ySill + 0.32 * (yNose - ySill),
                yRb = ySill + 0.32 * (yBelt - ySill); // untere Lippen: ANTEILIG zur Fascia-Höhe → konsistente Kontur über alle Presets (nicht fix)
            g.add(B(fpl, yFb, 0, 0.012, 0.013, bw * 0.93, bodyMat)); //   Front: untere Schürzenlippe (Schattenlinie) — proud, anteilig
            g.add(B(fpl, yNose - 0.004, 0, 0.011, 0.01, bw * 0.97, bodyMat)); //   Front: obere Haubenlippe
            g.add(B(rpl, yRb, 0, 0.012, 0.013, bw * 0.93, bodyMat)); //   Heck: untere Schürzenlippe — anteilig
            g.add(B(rpl, yBelt - 0.012, 0, 0.011, 0.01, bw * 0.97, bodyMat));
        } //   Heck: obere Kante
        {
            const hoodLen = Math.hypot(noseX - cowlX, hoodDrop),
                hoodAng = -Math.atan2(hoodDrop, noseX - cowlX),
                hoodHalf = clr; // Haube ZWISCHEN den Kotflügeln (Rad freigestellt)
            {
                const hd = dome(
                    (cowlX + noseX) / 2,
                    (yBelt + yNose) / 2,
                    0,
                    hoodLen / 2,
                    t,
                    hoodHalf,
                    bodyMat,
                    Math.min(0.1, hoodHalf * 0.14) * cMul,
                    hoodAng,
                    false
                );
                bend(hd, "x", "y", (t) => {
                    var u = Math.max(0, (t + 1) / 2),
                        a = P.hoodArc != null ? P.hoodArc : 0.022;
                    return a * 0.35 * Math.sin(Math.PI * u) - 0.045 * Math.pow(u, 5);
                });
                /* Haube: Laengs-Krone (sin, an beiden Enden 0) skaliert mit hoodArc + progressiver Abfall zur Nase; Nasen-Endpunkt fix => Fascia-Anschluss bleibt. hoodArc war zuvor toter Parameter. */ g.add(
                    hd
                );
            } // Haube flacher: Nase ein paar ° hoch (endet auf Grillkante, nicht ins Loch getaucht)  // Hauben-Längsgrat //   Haubenblech gewölbt, fällt zur Nase
            {
                const aHd = P.hoodArc != null ? P.hoodArc : 0.022;
                const fyAt = (xc) => {
                    const uH = (xc - cowlX) / (noseX - cowlX),
                        crownH = aHd * 0.35 * Math.sin(Math.PI * uH) - 0.045 * Math.pow(uH, 5),
                        fdesc = yBelt - uH * hoodDrop + crownH;
                    return Math.max(fdesc, archShoulderY(xc) - 0.015);
                }; // deckt Nase/Lampe (archShoulderY bleibt)
                for (const sd of [-1, 1])
                    for (const [a, b] of clipSegs(cowlX, noseX, gaps)) {
                        if (b - a < 0.02) continue;
                        const cc = (a + b) / 2,
                            hh2 = (b - a) / 2,
                            nf = Math.max(8, Math.round((b - a) * 22));
                        const strip = Bsub(
                            cc,
                            yBelt,
                            (sd * (hoodHalf + bw)) / 2,
                            hh2,
                            t,
                            (bw - hoodHalf) / 2,
                            bodyMat,
                            nf,
                            1
                        );
                        bend(strip, "x", "y", (tt) => fyAt(cc + tt * hh2) - yBelt);
                        g.add(strip);
                    }
            }
        } // Radloch ausgespart → Haunch macht den Bogen allein (kein 15mm-Doppel)
        {
            const deckHalf = clr; // Heckdeckel ZWISCHEN den Kotflügeln
            {
                const dk = dome(
                    (backX + tailX) / 2,
                    yBelt,
                    0,
                    Math.abs(backX - tailX) / 2,
                    t,
                    deckHalf,
                    bodyMat,
                    Math.min(0.045, deckHalf * 0.07),
                    0,
                    true
                );
                bend(dk, "x", "y", (u) => 0.014 * Math.max(0, u) - 0.026 * Math.pow(Math.max(0, -u), 2));
                g.add(dk);
            } //   Deckel: flach + echte S (Kabinen-Hügel → fällt zur Heckkante), NICHT gebläht
            {
                const dyAt = (xc) => Math.max(yBelt - 0.005, archShoulderY(xc) - 0.015);
                for (const sd of [-1, 1])
                    for (const [a, b] of clipSegs(tailX, backX, gaps)) {
                        if (b - a < 0.02) continue;
                        const cc = (a + b) / 2,
                            hh2 = (b - a) / 2,
                            nd = Math.max(8, Math.round((b - a) * 22));
                        const strip = Bsub(
                            cc,
                            yBelt,
                            (sd * (deckHalf + bw)) / 2,
                            hh2,
                            t,
                            (bw - deckHalf) / 2,
                            bodyMat,
                            nd,
                            1
                        );
                        bend(strip, "x", "y", (tt) => dyAt(cc + tt * hh2) - yBelt);
                        g.add(strip);
                    }
            }
        } // Radloch ausgespart
        for (const ax of [fAx, rAx]) {
            const isFront = ax === fAx; // RADLAUF-BROW: EIN glatter Bogen je Seite (ersetzt 26 Facetten-Boxen → keine Treppe), folgt archShoulderY
            const humpRise = Math.max(0.015, 2 * P.radR + wheelClearance(P, ax, isFront).gap - yBelt),
                NB = Math.max(34, Math.round(archHalf * 72));
            for (const sd of [-1, 1]) {
                const brow = Bsub(ax, yBelt, sd * (bw + 0.006), archHalf, 0.016, 0.022, bodyMat, NB, 1);
                bend(brow, "x", "y", (tt) => humpRise * (1 - tt * tt));
                g.add(brow);
            }
        }
        {
            const roofZ = cwK + 0.028;
            const rf = dome(
                (roofF + roofR) / 2,
                yRoof,
                0,
                (roofF - roofR) / 2,
                t,
                roofZ,
                bodyMat,
                Math.min(0.06, roofZ * 0.07) * cMul,
                0,
                true
            );
            bend(rf, "x", "y", (t) => (P.roofArc != null ? P.roofArc : 0.022) * (1 - Math.pow(t, 4)));
            g.add(rf);
        } // Dach DOPPELT gekrümmt: z-Crown × x-Bogen, Tension-Profil (1-t⁴, flach mittig, progressiv zum Rand)       // Dach gewölbt (±cwK)
        // ── G · GREENHOUSE-RAHMEN — Füsse auf der Schulter (Bogen-Hüllkurve), Säule passt sich dem Bogen an ──
        const footF = archShoulderY(cowlX),
            footR = archShoulderY(backX); // Schulter vorn/hinten (steigt übers Rad)
        const angA = Math.atan2(yRoof - footF, roofF - cowlX),
            lenA = Math.hypot(roofF - cowlX, yRoof - footF); // A-Säule/Windschutz ab Schulter
        const angC = Math.atan2(yRoof - footR, roofR - backX),
            lenC = Math.hypot(roofR - backX, yRoof - footR); // C-Säule/Heck ab Schulter
        const footRpil = footR + 0.028,
            angCp = Math.atan2(yRoof - footRpil, roofR - backX),
            lenCp = Math.hypot(roofR - backX, yRoof - footRpil); // C-Säulen-Fuss höher → Unterkante sitzt auf der Bogenlinie, taucht nicht durch
        const xAtC2 = (y) =>
            backX + ((y - footR) / (yRoof - footR)) * (roofR - backX) + 0.034 * Math.max(0, 1 - (y - footR) / 0.13); // + HOFMEISTER-KNICK (konkav am C-Säulen-Fuss)                                                   // C-Säulen-Linie ab Schulter (Quarter/Sail)
        for (const sd of [-1, 1]) {
            {
                const pA = B((cowlX + roofF) / 2, (footF + yRoof) / 2, sd * cwK, lenA / 2, 0.028, 0.028, bodyMat, angA);
                g.add(pA);
            } // A-Säule GEBOGEN: zieht zum Dach hin nach innen, progressiv (Tension)                           // A-Säule (Fuss auf Schulter)
            g.add(B(P.kabineMitte, (yBelt + yRoof) / 2, sd * cwK, 0.024, (yRoof - yBelt) / 2, 0.022, bodyMat)); // B-Säule oben (Fenster-Teiler, schlank, Aussenkante ≈ Türlinie)
            if (tueren >= 4)
                g.add(
                    B(P.kabineMitte, (ySill + yBelt) / 2, sd * (bw + 0.014), 0.024, (yBelt - ySill) / 2, 0.006, bodyMat)
                ); // B-Säule unten: GLEICHE Breite/Material, echt proud (Rücken auf Türfront bw+0.008) → ein durchgehender Körper bis zum Boden, kein Durchdrücken
            {
                const pC = B(
                    (backX + roofR) / 2,
                    (footRpil + yRoof) / 2,
                    sd * cwK,
                    lenCp / 2,
                    0.028,
                    0.028,
                    bodyMat,
                    angCp
                );
                g.add(pC);
            } // C-Säule GEBOGEN                       // C-Säule (Fuss höher → kein Bogen-Durchstoss; passt sich dem Bogen an)
            {
                const dh = Bsub(
                    (roofF + roofR) / 2,
                    yRoof - 0.02,
                    sd * (cwK + 0.014),
                    (roofF - roofR) / 2,
                    0.02,
                    0.028,
                    bodyMat,
                    Math.max(6, Math.round((roofF - roofR) * 10)),
                    1
                );
                bend(dh, "x", "y", (t) => (P.roofArc != null ? P.roofArc : 0.022) * (1 - Math.pow(t, 4)));
                g.add(dh);
            } // Dachholm FOLGT der Dachhaut + Enden ziehen innen (zu den Säulenköpfen)
            {
                const qF = tueren >= 4 ? dRx : dBx;
                if (Math.abs(qF - backX) > 0.03) {
                    const xa = Math.min(qF, backX),
                        xb = Math.max(qF, backX),
                        xc = (xa + xb) / 2,
                        xh = (xb - xa) / 2,
                        NR = Math.max(16, Math.round(xh * 70));
                    const prof = (xx) => Math.max(footR, archShoulderY(xx) + 0.015),
                        y0 = prof(xc); // Gürtelschiene am Quarter FOLGT dem Radbogen — EIN gebogener Streifen (ersetzt 12 Box-Segmente → keine Treppe), steigt übers Rad, schwebt nicht
                    const rail = Bsub(xc, y0, sd * cwK, xh, 0.02, 0.03, bodyMat, NR, 1);
                    bend(rail, "x", "y", (t) => prof(xc + t * xh) - y0);
                    g.add(rail);
                }
            }
        }
        // ── UNTERBODEN-BODENBLECH: schliesst die Kabinen-Unterseite (Package nicht mehr von schräg unten sichtbar). z=±bw → taperBody tuckt es auf die eingezogene Karosseriebreite. ──
        for (const [a, b] of clipSegs(Math.min(backX, cowlX), Math.max(backX, cowlX), gaps))
            g.add(B((a + b) / 2, ySill - 0.004, 0, (b - a) / 2, t, bw, M.trim));
        g.add(B(cowlX, footF, 0, 0.022, 0.022, cwK, bodyMat)); // Cowl-Querleiste (auf Schulter)
        g.add(B(backX, footR, 0, 0.022, 0.022, cwK, bodyMat)); // Heck-Querleiste (auf Schulter → über dem Rad, streift es NICHT mehr)
        if (footF > yBelt + 0.003) g.add(B(cowlX, (yBelt + footF) / 2, 0, 0.024, (footF - yBelt) / 2, cwK, bodyMat)); // Body-Band unter Windschutz (Gürtel→Schulter)
        if (footR > yBelt + 0.003) g.add(B(backX, (yBelt + footR) / 2, 0, 0.024, (footR - yBelt) / 2, cwK, bodyMat)); // Body-Band unter Heckscheibe
        if (tueren < 4) {
            const sh = Math.max(footR, gB);
            if (sh > yBelt + 0.004)
                for (const sd of [-1, 1])
                    // 2-Türer: Schulter-Band hinter der Fahrtür (Gürtel→Schulter, Tür→Heckscheibe) → kein Spalt mehr
                    g.add(
                        B(
                            (dBx + 0.02 + backX) / 2,
                            (yBelt + sh) / 2,
                            sd * cwK,
                            Math.abs(backX - (dBx + 0.02)) / 2,
                            (sh - yBelt) / 2,
                            t,
                            bodyMat
                        )
                    );
        }
        // ── H · GLAS — gewölbt (folgt der Dachwölbung in z), Fuss auf Schulter ──
        g.add(
            dome(
                (cowlX + roofF) / 2,
                (footF + yRoof) / 2,
                0,
                lenA / 2,
                0.005,
                cwK,
                M.glass,
                -Math.min(0.095, cwK * 0.11),
                angA,
                true
            )
        ); // Windschutz gewölbt — NEG: lokal+Y zeigt bei dieser Neigung nach innen, also minus = nach aussen (konvex)
        g.add(
            dome(
                (backX + roofR) / 2,
                (footR + yRoof) / 2,
                0,
                lenC / 2,
                0.005,
                cwK,
                M.glass,
                Math.min(0.085, cwK * 0.1),
                angC,
                true
            )
        ); // Heckscheibe gewölbt (konvex, dezenter)
        if (tueren < 4)
            for (const sd of [-1, 1]) {
                const gBr = Math.max(gB, footR);
                g.add(
                    bowedQuad(
                        [dBx + 0.02, gBr, sd * cwK],
                        [xAtC2(gBr), gBr, sd * cwK],
                        [xAtC2(gT), gT, sd * cwK],
                        [dBx + 0.02, gT, sd * cwK],
                        sd * 0.026,
                        M.glass
                    )
                );
            } // Quarter (Basis auf Schulter)
        if (hasRearQ)
            for (const sd of [-1, 1]) {
                const gBr = Math.max(gB, footR);
                g.add(
                    quad4(
                        [dRx, gBr, sd * cwK],
                        [xAtC2(gBr), gBr, sd * cwK],
                        [xAtC2(gT), gT, sd * cwK],
                        [dRx, gT, sd * cwK],
                        M.glass
                    )
                ); // hinteres Eckfenster (Sail) — Basis auf Schulter
                g.add(B(dRx, (gBr + yRoof) / 2, sd * cwK, 0.024, (yRoof - gBr) / 2, 0.024, bodyMat)); // Säule zwischen Hintertür und Eckfenster
            }
        // ── G2 · TÜREN — Trapez-Glas (Kanten folgen den Säulen); Vorder-+Hintertür bei 4-Türern ──
        const ySillTop = ySill + 0.1,
            pvY = (ySillTop + yBelt) / 2;
        function makeDoor(xHinge, xLatch, feFn, beFn, mirror) {
            for (const sd of [-1, 1]) {
                const doorLen = xHinge - xLatch,
                    dz = sd * cwK - sd * bw;
                const pv = new THREE.Group();
                pv.position.set(xHinge, pvY, sd * bw);
                const skin = box(doorLen, yBelt - ySillTop, 0.016, M.door);
                skin.position.set(-doorLen / 2, 0, 0);
                pv.add(skin); // Türblatt
                const fb = [feFn(gB) - xHinge, gB - pvY, dz],
                    bb = [beFn(gB) - xHinge, gB - pvY, dz],
                    bt = [beFn(gT) - xHinge, gT - pvY, dz],
                    ft = [feFn(gT) - xHinge, gT - pvY, dz];
                pv.add(bowedQuad(fb, bb, bt, ft, sd * 0.032, M.glass)); // Türglas gewölbt (konvex nach aussen)                                                                             // Türglas (Trapez)
                const topLen = Math.abs(bt[0] - ft[0]);
                const fr = box(topLen, 0.028, 0.028, M.pillar);
                fr.position.set((ft[0] + bt[0]) / 2, gT - pvY, dz);
                pv.add(fr); // Rahmen oben
                const belt = box(doorLen, 0.05, 0.05, bodyMat);
                belt.position.set(-doorLen / 2, yBelt - pvY, 0);
                pv.add(belt); // Gürtel (fährt mit)
                {
                    const ySh = yBelt - 0.14;
                    const sk = box(doorLen, 0.026, 0.026, bodyMat);
                    sk.position.set(-doorLen / 2, ySh - pvY, sd * 0.006);
                    pv.add(sk);
                } // CHARAKTER-SICKE auf der Tür → schwebt nicht mehr
                const handle = box(0.12, 0.03, 0.026, M.pillar);
                handle.position.set(-doorLen + 0.2, yBelt - 0.12 - pvY, sd * 0.025);
                pv.add(handle); // Griff
                if (mirror) {
                    const sail = box(0.05, 0.05, 0.03, bodyMat);
                    sail.position.set(0.02, yBelt + 0.015 - pvY, sd * 0.04);
                    pv.add(sail);
                    const mst = box(0.075, 0.016, 0.018, M.pillar);
                    mst.position.set(-0.02, yBelt - 0.04 - pvY, sd * 0.055);
                    pv.add(mst);
                    const mir = box(0.05, 0.05, 0.095, M.pillar);
                    mir.position.set(-0.055, yBelt - 0.03 - pvY, sd * 0.1);
                    mir.rotation.y = sd * 0.12;
                    pv.add(mir);
                } // Spiegel: an Gürtellinie (nicht über Haube)
                g.add(pv);
                doors.push({ pv, sd });
            }
        }
        makeDoor(dFx, dBx, dFxAt, (y) => dBx + 0.02, true); // Vordertür (vorn raked A-Säule, hinten an B-Säule)
        if (tueren >= 4) makeDoor(dBx, dRx, (y) => dBx - 0.02, hasRearQ ? (y) => dRx : xAtC, false); // Hintertür (Hinterkante an dRx = vor dem Hinterrad; sonst an C-Säule)
        // Eckfenster (Vent) für cab-forward Presets: füllt A-Säule ↔ Türvorderkante, plus Türvorderkante-Säule
        if (hasVent)
            for (const sd of [-1, 1]) {
                g.add(
                    quad4(
                        [xAt(gB), gB, sd * cwK],
                        [dFxAt(gB), gB, sd * cwK],
                        [dFxAt(gT), gT, sd * cwK],
                        [xAt(gT), gT, sd * cwK],
                        M.glass
                    )
                ); // Eckfenster
                g.add(
                    B(
                        dFx + 0.5 * (roofF - cowlX),
                        (yBelt + yRoof) / 2,
                        sd * cwK,
                        Math.hypot(roofF - cowlX, yRoof - yBelt) / 2,
                        0.024,
                        0.024,
                        bodyMat,
                        Aw
                    )
                ); // Türvorderkante-Säule
            }
        return g;
    }

    function buildPackage(H, P, ctx) {
        const M = (ctx && ctx.M) || materials();
        const bodyMat = (ctx && ctx.bodyMat) || materials().clay;
        const g = new THREE.Group();
        const S = scal(H, P);
        const { fAx, rAx, noseX, tailX, cowlX, backX, roofF, roofR, hz, bw, cw, yFloor, yBatt, ySill, yBelt, yRoof } =
            S;
        const cwK = bw - 0.015,
            archHalf = P.radR * 1.18,
            gaps = [
                [fAx - archHalf, fAx + archHalf],
                [rAx - archHalf, rAx + archHalf],
            ];
        const cellY = (ySill + yBelt) / 2 + 0.05;
        // Plattform — alle Querbauteile schmaler als die Reifen-Innenkante (hz-0.11≈0.70), damit nichts durch die Räder geht
        {
            const bBot = Math.max(yFloor, ySill),
                bTop = Math.max(yBatt, bBot + 0.06);
            g.add(B(0, (bBot + bTop) / 2, 0, P.radstand / 2 - 0.05, (bTop - bBot) / 2, hz - 0.18, M.batt));
        } // Akku-Paket: Boden auf Schwellerlinie geklemmt (ragt NICHT unter die Türkante), schmal (frei von Rädern)
        g.add(B(fAx, 0.2, 0, 0.22, 0.06, hz - 0.16, M.steel));
        g.add(B(rAx, 0.2, 0, 0.24, 0.06, hz - 0.16, M.steel)); // Hilfsrahmen (schmal)
        for (const sd of [-1, 1]) {
            g.add(B((fAx + noseX) / 2, 0.32, sd * 0.34, (noseX - fAx) / 2, 0.05, 0.05, M.steel));
            g.add(B((rAx + tailX) / 2, 0.3, sd * 0.34, Math.abs(tailX - rAx) / 2, 0.05, 0.05, M.steel));
        } // Längsträger
        g.add(B(noseX - 0.05, 0.34, 0, 0.04, 0.06, hz * 0.9, M.steel));
        g.add(B(tailX + 0.05, 0.32, 0, 0.04, 0.06, hz * 0.9, M.steel)); // Crashträger (vor/hinter Rädern)
        // Antrieb (Wellen liegen auf der Nabenlinie → koaxial)
        g.add(C(fAx, 0.27, 0, "z", 0.13, 0.34, M.motor, 18));
        g.add(C(rAx, 0.27, 0, "z", 0.14, 0.4, M.motor, 18));
        for (const sd of [-1, 1]) {
            g.add(C(fAx, P.radR, sd * 0.49, "z", 0.026, 0.62, M.rimM, 12));
            g.add(C(rAx, P.radR, sd * 0.49, "z", 0.028, 0.62, M.rimM, 12));
        }
        // Zelle (Ring bindet das Greenhouse an)
        g.add(B((cowlX + backX) / 2, ySill + 0.04, 0, (cowlX - backX) / 2, 0.02, hz - 0.16, M.trim)); // Bodenplatte (frei von Rädern)
        {
            const fwF = Math.abs(cowlX - fAx) < archHalf + 0.1 ? hz - 0.17 : bw - 0.05,
                fwR = Math.abs(backX + 0.05 - rAx) < archHalf + 0.1 ? hz - 0.17 : bw - 0.05;
            g.add(B(cowlX, cellY, 0, 0.03, 0.22, fwF, M.steel));
            g.add(B(backX + 0.05, cellY, 0, 0.03, 0.2, fwR, M.steel));
        } // Schott: vollbreit wenn frei, schmal (innen vom Radhaus) nahe Achse → kein Durchblick UND kein Radkasten-Durchstoss
        for (const sd of [-1, 1]) {
            {
                const wT = Math.min(cellY + 0.19, yBelt - 0.02);
                g.add(
                    B(
                        (cowlX + fAx) / 2,
                        (cellY - 0.19 + wT) / 2,
                        sd * (hz - 0.17),
                        Math.abs(fAx - cowlX) / 2,
                        (wT - (cellY - 0.19)) / 2,
                        0.02,
                        M.steel
                    )
                );
            } // vordere Radhauswand: schliesst Kabinenseite vom Vorderrad/Motor (inboard → kein Durchstoss)
            {
                const wT = Math.min(cellY + 0.17, yBelt - 0.02);
                g.add(
                    B(
                        (backX + rAx) / 2,
                        (cellY - 0.17 + wT) / 2,
                        sd * (hz - 0.17),
                        Math.abs(backX - rAx) / 2,
                        (wT - (cellY - 0.17)) / 2,
                        0.02,
                        M.steel
                    )
                );
            } // hintere Radhauswand
            for (const [a, b] of clipSegs(
                (cowlX + backX) / 2 - ((fAx - rAx) / 2 - 0.1),
                (cowlX + backX) / 2 + ((fAx - rAx) / 2 - 0.1),
                gaps
            ))
                g.add(B((a + b) / 2, ySill + 0.075, sd * (bw - 0.17), (b - a) / 2, 0.035, 0.03, M.trim)); // Schweller höher+WEIT innen (innerhalb der eingezogenen Tuck-Flanke → ragt nicht raus/unter Tür)
            {
                const pa = B(
                    (cowlX + roofF) / 2,
                    (yBelt + yRoof) / 2,
                    sd * cwK,
                    Math.hypot(roofF - cowlX, yRoof - yBelt) / 2,
                    0.022,
                    0.022,
                    M.steel,
                    S.Awin
                );
                g.add(pa);
            } // A-Säule GEBOGEN wie Haut
            g.add(B(P.kabineMitte, (yBelt + yRoof) / 2, sd * cwK, 0.022, (yRoof - yBelt) / 2, 0.022, M.steel)); // B-Säule
            {
                const pc = B(
                    (backX + roofR) / 2,
                    (yBelt + yRoof) / 2,
                    sd * cwK,
                    Math.hypot(roofR - backX, yRoof - yBelt) / 2,
                    0.022,
                    0.022,
                    M.steel,
                    S.Cwin
                );
                g.add(pc);
            } // C-Säule GEBOGEN wie Haut
            {
                const dh = Bsub(
                    (roofF + roofR) / 2,
                    yRoof - 0.02,
                    sd * cwK,
                    (roofF - roofR) / 2,
                    0.02,
                    0.022,
                    M.steel,
                    Math.max(6, Math.round((roofF - roofR) * 10)),
                    1
                );
                bend(dh, "x", "y", (u) => (P.roofArc != null ? P.roofArc : 0.022) * (1 - Math.pow(u, 4)));
                g.add(dh);
            }
        } // Dachholm FOLGT der Haut-Dachkurve
        // Sitze — Reihen an der Kabine verankert (vorn an Cowl, hinten vorm Schott); Lenkrad fix am Brett
        const tueren = P.tueren || 2;
        function seatRow(cx) {
            for (const z of [-0.4, 0.4]) {
                g.add(B(cx, ySill + 0.11, z, 0.27, 0.055, 0.24, M.seat)); // Sitzfläche
                g.add(B(cx - 0.28, ySill + 0.37, z, 0.055, 0.26, 0.23, M.seat, 0.13)); // Lehne (lehnt nach hinten)
                g.add(B(cx - 0.35, ySill + 0.62, z, 0.07, 0.075, 0.11, M.seat));
            }
        } // Kopfstütze
        const frontCx = cowlX - 0.72;
        seatRow(frontCx); // vordere Reihe
        if (tueren >= 4) seatRow(backX + 0.58); // hintere Reihe (nur 4-Türer)
        {
            const tBot = Math.max(yFloor + 0.1, ySill + 0.01);
            g.add(B(frontCx + 0.1, (tBot + yFloor + 0.3) / 2, 0, 0.32, (yFloor + 0.3 - tBot) / 2, 0.06, M.trim));
        } // Mitteltunnel: Boden auf Schwellerlinie (ragt nicht unter die Karosserie)
        // Cockpit — Brett an Cowl, Säule verbindet Brett→Lenkrad (kein Schweben mehr)
        g.add(B(cowlX - 0.12, yBelt - 0.06, 0, 0.1, 0.06, hz - 0.14, M.trim)); // Armaturenbrett
        g.add(B(cowlX - 0.23, yBelt - 0.05, -0.38, 0.11, 0.018, 0.018, M.trim)); // Lenksäule (Brett → Lenkrad)
        g.add(C(cowlX - 0.34, yBelt - 0.02, -0.38, "x", 0.15, 0.025, M.trim, 16)); // Lenkrad (am Säulenende)
        return g;
    }

    // Schwerpunkthöhe ABGELEITET aus der Form: Bodenfreiheit + Masse sitzt tief (Chassis/Akku) + etwas Aufbau.
    // → flacher Supersportler = tiefer SP = wenig Wanken · hoher SUV = hoher SP = mehr Wanken (automatisch).
    function cgHeightOf(P) {
        return P.fahrhoehe * 0.7 + P.guertel * 0.45 + (P.dach - P.guertel) * 0.1;
    }
    const A_PITCH_MAX = 13,
        A_LAT_MAX = 11; // Laengs-/Quer-Beschl.-Klammern (g-equiv.) — EINZIGE Quelle: updateVehicle UND Radkasten-Huellkurve
    // ── N6.1 (Nervensystem Phase δ) — DIE FAHR-KONSTANTEN: Formel-UMZUG aus der Shell
    // (worlds/garage/garage.js, byte-gleiche Werte). Die Antriebs-/Reifen-Konstanten der
    // Probefahrt tragen KEINEN Geometrie-Bezug (Lenkanschlag · Brems-/Roll-/Handbrems-
    // Verzoegerung · Reifen-Steifigkeiten · Reibkreis · Gier-Traegheits-Faktor). Die Shell
    // LIEST sie von hier (VC.FAHR) — EINE Quelle fuer Probefahrt UND exportDrive (M1/M9:
    // kein zweiter Wahrheits-Satz). wheelClearance oben findet sie jetzt immer (der
    // typeof-Fallback 0.52 == FAHR.maxSteer bleibt als Robustheits-Wand, byte-gleich).
    const FAHR = {
        maxSteer: 0.52,
        brakeDecel: 14,
        rollDecel: 1.0,
        handDecel: 9,
        G: 9.8,
        CA_F: 5.0,
        CA_R: 5.6,
        maxGrip: 1.0,
        izzK: 1.4,
        // ULTRAGUSS U6 — die Feder-Momenten-Koeffizienten als EINE Quelle
        // (vorher zweimal getippt: Lab updateVehicle + Kern wheelClearance —
        // ein einseitiges Tuning ließ die Radkasten-Hüllkurve still divergieren):
        pitchGain: 2.6,
        rollGain: 1.8,
        heaveA: 0.08,
        heaveV: 0.035,
        heaveKMul: 1.3,
        heaveCMul: 1.15,
        // ── PHYSIK-NAHT (N6.5b, rein additive DATEN-Zeile — Praezedenz: §8.5-Stufen-Zeile) —
        // DIE HOST-EMERGENZ-KOEFFIZIENTEN: die Fallback-Fahr-Formel des Wirts (ein Werk OHNE
        // Studio-Rezept: Tempo-Bonus je Rad, Ritt-Schritt je Bein, kAcc/kBrake je Masse)
        // liest ihre Zahlen von HIER (EINE Quelle fuer Lab-Vergleich UND Welt-Fallback).
        // Der Wirt liest fail-soft: Kern kalt → seine byte-gleichen historischen Literale.
        hostEmergent: {
            radMul: 0.12, // Tempo-Bonus je Rad (+12 %)
            radCap: 0.6, // Deckel des Rad-Bonus (+60 %)
            beinBonus: 0.15, // Ritt-Schritt (≥ 2 Beine, keine Raeder)
            kAcc: 7, // Beschleunigungs-k ÷ Masse (schwer = traege)
            kBrakeRad: 3.5, // Roll-aus-k ÷ Masse (Raeder rollen aus)
            kBrakeBein: 8, // Stopp-k ÷ Masse (Beine/starr stoppen prompt)
            // ── ZENSUS-REST V18.488 (rein additiv): die KLEMM-GRENZEN der
            //    Emergenz-Formel wohnen NEBEN ihren Koeffizienten (waren
            //    Stamm-Literale 2.5-10 / 1.5-6 / 4-10) + das GIER-FOLGE-
            //    GEFUEHL des richtungs-folgenden Ritts (yawFolgeK = exp-k
            //    der Gier-Glaettung; fahrtGate = m/s, ab der die Fahrt
            //    dreht — auch die Schwelle der echten S-Bremse). ──
            kAccMin: 2.5,
            kAccMax: 10,
            kBrakeRadMin: 1.5,
            kBrakeRadMax: 6,
            kBrakeBeinMin: 4,
            kBrakeBeinMax: 10,
            yawFolgeK: 4,
            fahrtGate: 0.4,
        },
        // ── ZENSUS-REST V18.488 (rein additive DATEN-Zeile): die AUFSITZ-
        //    REICHWEITE des Welt-Ritts (m, E-Mount) — Interaktions-Gesetz des
        //    Fahrens, kein Stamm-Literal. Byte-gleich 3. ──
        mountRangeM: 3,
        // ── FAHR-GEFUEHL (rein additive DATEN-Zeile — Praezedenz: hostEmergent) —
        // DIE LENK-/DRIFT-GESETZE der Probefahrt fuer den Welt-Ritt: sfK ist die
        // selbstzentrierende Lenkung des Labs (sf = 1/(1 + v·sfK), updateVehicle
        // Z.302), gripK der Quer-Slip-Abbau je Sekunde (die Reibkreis-VEREINFACHUNG
        // des Wirts — das volle Slip-Winkel-Modell bleibt die Lab-Sim), driftGripMul
        // der Grip-Anteil unter Handbremse (Lab-Muster FLatR·0.32), kehrV der
        // Rueckwaerts-Anteil der S-Taste. exportDrive reicht sie (zusammen mit
        // maxSteer/handDecel aus DIESEM Satz + dem Rezept-Radstand) als
        // fahrprofil.lenkung ins Buch; der Wirt liest fail-soft (ohne lenkung
        // bleibt der byte-alte richtungs-folgende Ritt).
        lenkung: {
            sfK: 0.05,
            gripK: 6,
            driftGripMul: 0.35,
            kehrV: 0.45,
        },
        // ── N7 (19.07., rein additive DATEN-Zeile — Praezedenz: lenkung) —
        // DAS VOLLE ZWEISPUR-GESETZ REIST: die bisher Lab-privaten Groessen des
        // Schlupfwinkel-Modells (updateVehicle) werden benannte Kern-Daten, damit
        // exportDrive.zweispur den Welt-Ritt mit DEMSELBEN Modell fahren kann,
        // das die Probefahrt faehrt (Reibkreis-Vereinfachung gripK bleibt der
        // fail-soft-Pfad kalter Buecher). Werte byte-gleich den Lab-Literalen:
        // steerK/steerZentrK = die per-Frame-Lerps der Lenksaeule (60-fps-Basis;
        // Leser rechnen 1-(1-k)^(dt·60)), slipEps = Tiefpass im Schlupf-Nenner,
        // handLatMul = Heck-Seitenfuehrungs-Rest unter Handbremse (FlatR·0.32),
        // lowBlendV/lowLatK = kinematische Blende unterhalb Schritttempo. ──
        zweispur: {
            steerK: 0.18,
            steerZentrK: 0.3,
            slipEps: 1.4,
            handLatMul: 0.32,
            lowBlendV: 2.4,
            lowLatK: 0.6,
        },
    };
    // ── Rad-Bewegungshuellkurve: GEMESSEN aus der LIVE-Fahrphysik (gleiche Klammern/Federn wie updateVehicle), keine 1-g-Schaetzung ──
    //    vert  = Nicktauchen am Achs-x (aMax + Feder-Ueberschwingen ζ) + Squat(Heave)  → vertikaler Freigang Bogenscheitel↔Reifen
    //    inb   = inboard-Reichweite des (gelenkten) Reifens ab Radmitte · roll = Wank-Spitze  → Tiefe der inneren Radhausschale
    function wheelClearance(P, axleX, front) {
        const cgH = cgHeightOf(P),
            L = P.radstand,
            W = P.spur,
            k = P.springRate || 95,
            c = P.damping || 12,
            R = P.radR,
            hw = 0.11;
        const steer = typeof FAHR !== "undefined" ? FAHR.maxSteer : 0.52; // voller Lenkeinschlag (Worst Case: Schritttempo, sf≈1)
        const OS = (kk, cc) => {
            const z = cc / (2 * Math.sqrt(kk));
            return 1 + (z < 1 ? Math.exp((-z * Math.PI) / Math.sqrt(1 - z * z)) : 0);
        }; // Ueberschwing-Faktor aus ζ=c/2√k
        const pitch = ((A_PITCH_MAX * (cgH / L) * FAHR.pitchGain) / k) * OS(k, c); // Nickwinkel-Spitze [rad]
        const roll = ((A_LAT_MAX * (cgH / W) * FAHR.rollGain) / k) * OS(k, c); // Wankwinkel-Spitze [rad]
        const heave =
            ((A_PITCH_MAX * FAHR.heaveA + 12 * FAHR.heaveV) / (k * FAHR.heaveKMul)) *
            OS(k * FAHR.heaveKMul, c * FAHR.heaveCMul); // Squat-Spitze [m] (v≈12 m/s)
        const vert = Math.abs(axleX) * Math.sin(pitch) + heave; // vertikale Annaeherung Reifen→Bogenscheitel
        const inb = (front ? R * Math.sin(steer) : 0) + hw * Math.cos(front ? steer : 0); // inboard-Rand des gelenkten Reifens ab Radmitte
        return { pitch, roll, heave, vert, inb, gap: Math.min(0.3, Math.max(0.045, vert + 0.025)) }; // +25 mm Reserve, gedeckelt
    }
    // Antriebsphysik AUS DER FORM abgeleitet:
    //   Masse ∝ Länge·Breite·Höhe (Bounding-Volumen) → a = F/m: schwerer = träger.
    //   Stirnfläche ∝ Breite·Höhe → Luftwiderstand → Tempo am Limit (Schub = Widerstand, Masse kürzt sich raus).
    //   F0 (Motorschub) + Beiwert sind konstant (Antrieb, keine Geometrie); auf GT geeicht → a≈9, vmax≈16.
    function carPhys(P) {
        const len = P.radstand + P.ueberhangV + P.ueberhangH,
            mass = len * P.spur * P.dach,
            front = P.spur * P.dach,
            F0 = 80.5,
            dragC = 0.1618;
        return { aEngine: F0 / mass, dragK: (dragC * front) / mass, vmax: Math.sqrt(F0 / (dragC * front)), mass: mass };
    }
    // ── N6.1 (Nervensystem Phase δ, Wörterbuch v1 `drive`) — DIE EINE FAHR-FORMEL ALS EXPORT:
    // exportDrive(P) leitet die Host-Fahr-Skalare aus DENSELBEN Gesetzen ab, die die Probefahrt
    // faehrt — carPhys (Masse/Antrieb/Widerstand AUS DER FORM, oben) + FAHR (Roll-Widerstand) +
    // Federrate. KEIN zweiter Wahrheits-Satz (M1/M9): ein Schoepfer-Edit an carPhys/FAHR aendert
    // Probefahrt UND Welt-Fahrgefuehl zugleich. Die Ableitung (die Lab-Wahrheit, dokumentiert):
    //   topSpeedMul   — vmax des Rezepts am GT-EICH-ANKER: carPhys ist auf den GT geeicht
    //                   (vmax≈16, s. o.), und der GT faehrt am emergenten Vier-Rad-Cap des
    //                   Hosts (1 + 0.6) → VMAX_REF = 16/1.6 = 10 [m/s je Mul-Einheit].
    //   kAcc   [1/s]  — die linearisierte Laengs-Zeitkonstante des Antriebs: aEngine/vmax
    //                   (der exp-Host beschleunigt bei v=0 damit exakt mit aEngine-Aequivalent).
    //   kBrake [1/s]  — die linearisierte ROLL-AUS-Konstante bei vmax (der Host-kBrake wirkt
    //                   ohne Eingabe = Ausrollen): Luftwiderstand (dragK·vmax² == aEngine am
    //                   Gleichgewicht) + Rollwiderstand → (aEngine + FAHR.rollDecel)/vmax.
    //   mass/vmax     — die Lab-Groessen als DATEN (must-ignore-Reisende; der Host-`mass`
    //                   bleibt sein _compoundSizeFactor — andere Einheit, bewusst NICHT geführt).
    //   spring {k,c}  — Federrate/Daempfung als benannter N6.5-Anschluss (das Host-Verb
    //                   Nick/Wank ist NICHT gebaut — M4: erst wenn das Verb erweitert wird).
    //   floats FEHLT BEWUSST: Schwimmen entscheidet die SUBSTANZ des Werks im Host (W-F
    //                   V18.175, volumen-gewichtete Dichte) — das Lab kennt kein Wasser.
    // REIN + THREE-frei (validator-vm-fest); ein PARTIELLER Regler-Vektor (z. B. pre.s+pre.fx
    // der Presets) mergt ueber DIESELBE Basis wie buildInstance (DEFAULT_P + BASE_P) — die
    // eine Merge-Ordnung, kein Duplikat.
    function exportDrive(Pin) {
        const P = Object.assign({}, DEFAULT_P, BASE_P, Pin || {});
        const ph = carPhys(P);
        // DONOR-ABSCHIED (18.07., rein additiv): die Stations-Wahrheit des Baus
        // (derive + scal-Y-Linien + seatRow-Anker) reist als DATEN mit — der
        // Wirt setzt Reiter-Sitz und Kollisions-Hülle aus dem Gesetzbuch statt
        // aus einer eingefrorenen Donor-Substanz. buildInstance byte-unberührt.
        const D = derive(P);
        const VMAX_REF = 10; // GT-Eich-Anker: vmax_GT≈16 / Host-Vier-Rad-Cap 1.6
        return {
            // SITZ — der vordere seatRow-Anker (frontCx = cowlX − 0.72; Ober-
            // kante der Sitzfläche ySill + 0.11 + 0.055; Fahrerseite z −0.4).
            sitz: { x: D.cowlX - 0.72, y: P.fahrhoehe + 0.18 + 0.165, z: -0.4 },
            // HÜLLE — die Blocker-Stationen (scal: bw = spur/2+0.13, cw =
            // spur/2−0.06, ySill = fahrhoehe+0.18); der Wirt komponiert daraus
            // Unterkörper + Greenhouse + Räder als Pseudo-Parts.
            huelle: {
                noseX: D.noseX,
                tailX: D.tailX,
                cowlX: D.cowlX,
                backX: D.backX,
                fAx: D.fAx,
                rAx: D.rAx,
                bw: P.spur / 2 + 0.13,
                cw: P.spur / 2 - 0.06,
                yFloor: P.fahrhoehe,
                ySill: P.fahrhoehe + 0.18,
                yBelt: P.guertel,
                yRoof: P.dach,
                radR: P.radR,
                spur: P.spur,
            },
            topSpeedMul: ph.vmax / VMAX_REF,
            kAcc: ph.aEngine / ph.vmax,
            kBrake: (ph.aEngine + FAHR.rollDecel) / ph.vmax,
            // mass: BEWUSSTER must-ignore-Reisender (Zensus 17.07.): der Wirt
            // traegt seine eigene Groessen-Achse (_compoundSizeFactor) — die
            // Kern-Masse reist als Mess-Flaeche mit, wird aber nicht gefahren.
            mass: ph.mass,
            vmax: ph.vmax,
            spring: { k: P.springRate, c: P.damping },
            // SPIEGEL-ZENSUS 17.07. (rein additiv) — die SCHWERPUNKT-HOEHE aus
            // der EINEN Form-Formel (cgHeightOf: Bodenfreiheit + Guertel +
            // Aufbau): der Wirt federt seinen Beschleunigungs-Nick mit cgH/L
            // aus KERN-Geometrie (radstand reist in lenkung) statt mit der
            // Host-Naeherung sitzHeight*0.5 / 2*halfLen (die faellt fail-soft).
            cgH: cgHeightOf(P),
            // ZENSUS-REST V18.488 (rein additiv) — die RAD- und SPUR-Geometrie
            // reist mit: radR dreht die Rad-Rolle des Wirts mit Weg/radR
            // (statt Magie-Konstante 2.2), spur traegt den Quer-Wank
            // (rollGain-Formel cgH/W — dieselbe wie wheelClearance).
            radR: P.radR,
            spur: P.spur,
            // FAHR-GEFUEHL — die Lenk-/Drift-Gesetze reisen mit (EINE Quelle:
            // FAHR; radstand fuer die Gier-Rate v·tan(δ)/L des Wirts).
            lenkung: {
                sfK: FAHR.lenkung.sfK,
                maxSteer: FAHR.maxSteer,
                gripK: FAHR.lenkung.gripK,
                driftGripMul: FAHR.lenkung.driftGripMul,
                handDecel: FAHR.handDecel,
                kehrV: FAHR.lenkung.kehrV,
                radstand: P.radstand,
                // ZENSUS-REST V18.488 (rein additiv): die echte BREMSE der
                // Probefahrt (m/s² — S bei Fahrt bremst statt rueckwaerts).
                brakeDecel: FAHR.brakeDecel,
            },
            // ── N7 (19.07., rein additiv) — DAS VOLLE ZWEISPUR-MODELL ALS GESETZ:
            // bisher fuhr der Wirt die Reibkreis-VEREINFACHUNG (lenkung.gripK) und
            // NUR die Probefahrt das echte Schlupfwinkel-Modell — der benannte
            // Bruchteil. Jetzt reisen ALLE Groessen des updateVehicle-Modells:
            // Achsabstaende b/c (CG mittig wie die Probefahrt), Gier-Traegheit
            // Izz = m·(L²+W²)/12·izzK, Schraeglauf-Steifigkeiten CA_F/CA_R,
            // Reibkreis-Kappe maxGrip·grip, Achslast-Basis m·G mit Laengs-
            // Lastverlagerung ueber cgH/L, plus die Lenksaeulen-/Blende-Daten
            // (FAHR.zweispur). Der Wirt integriert damit DASSELBE Newton-Euler-
            // Modell im Koerperframe (Seitenkraefte gegen den Schlupf, Gier aus
            // dem Reifenmoment, kinematische Blende am Stand); ohne zweispur
            // (kaltes Buch) bleibt der gripK-Pfad byte-alt. Feder-Antwort:
            // dieselben Momenten-Gains wie wheelClearance (pitch/roll/heave) —
            // der Aufbau taucht beim Bremsen, legt sich in die Kurve, federt
            // mit dem Rezept-k/c aus, exakt wie auf der Probestrecke.
            zweispur: {
                b: P.radstand * 0.5,
                c: P.radstand * 0.5,
                Izz: (ph.mass * (P.radstand * P.radstand + P.spur * P.spur)) / 12 * FAHR.izzK,
                mass: ph.mass,
                grip: P.grip,
                CA_F: FAHR.CA_F,
                CA_R: FAHR.CA_R,
                maxGrip: FAHR.maxGrip,
                G: FAHR.G,
                steerK: FAHR.zweispur.steerK,
                steerZentrK: FAHR.zweispur.steerZentrK,
                slipEps: FAHR.zweispur.slipEps,
                handLatMul: FAHR.zweispur.handLatMul,
                lowBlendV: FAHR.zweispur.lowBlendV,
                lowLatK: FAHR.zweispur.lowLatK,
                pitchGain: FAHR.pitchGain,
                rollGain: FAHR.rollGain,
                heaveA: FAHR.heaveA,
                heaveV: FAHR.heaveV,
                heaveKMul: FAHR.heaveKMul,
                heaveCMul: FAHR.heaveCMul,
                aPitchMax: A_PITCH_MAX,
                aLatMax: A_LAT_MAX,
            },
        };
    }

    const PARAMS = [
        {
            id: "radstand",
            lab: "Radstand",
            min: 2.2,
            max: 3.4,
            step: 0.01,
            grp: "RAHMEN",
            law: "Achsen ±radstand/2 → Radkasten-Mitte",
        },
        {
            id: "spur",
            lab: "Spur",
            min: 1.3,
            max: 1.9,
            step: 0.01,
            grp: "RAHMEN",
            law: "Karosseriebreite = spur/2 + 0.13 (deckt Räder)",
        },
        {
            id: "ueberhangV",
            lab: "Überhang vorn",
            min: 0.4,
            max: 1.2,
            step: 0.01,
            grp: "RAHMEN",
            law: "Nase = Vorderachse + ÜH-V",
        },
        {
            id: "ueberhangH",
            lab: "Überhang hinten",
            min: 0.4,
            max: 1.3,
            step: 0.01,
            grp: "RAHMEN",
            law: "Heck = Hinterachse − ÜH-H · Front unberührt",
        },
        {
            id: "taille",
            lab: "Taillierung",
            min: 0,
            max: 0.2,
            step: 0.005,
            grp: "RAHMEN",
            law: "seitlicher Einzug der Flanke",
        },
        {
            id: "radR",
            lab: "Rad-Radius",
            min: 0.26,
            max: 0.42,
            step: 0.005,
            grp: "STANCE",
            law: "Radkasten-Radius = radR · 1.18",
        },
        {
            id: "fahrhoehe",
            lab: "Bodenfreiheit",
            min: 0.06,
            max: 0.3,
            step: 0.005,
            grp: "STANCE",
            law: "hebt Schweller/Boden → Stance",
        },
        {
            id: "guertel",
            lab: "Gürtellinie",
            min: 0.55,
            max: 0.95,
            step: 0.01,
            grp: "GREENHOUSE",
            law: "Gürtel = Fenster-Unterkante",
        },
        {
            id: "dach",
            lab: "Dachhöhe",
            min: 1.05,
            max: 1.75,
            step: 0.01,
            grp: "GREENHOUSE",
            law: "Scheiben-Neigung ∝ (Dach − Gürtel)",
        },
        {
            id: "kabineMitte",
            lab: "Kabinen-Mitte",
            min: -0.6,
            max: 0.4,
            step: 0.01,
            grp: "GREENHOUSE",
            law: "Dach-Front/Heck = Mitte ± Länge/2",
        },
        {
            id: "kabineLaenge",
            lab: "Kabinen-Länge",
            min: 1.2,
            max: 2.4,
            step: 0.01,
            grp: "GREENHOUSE",
            law: "länger → mehr Glas, ab Schwelle 4-Türer",
        },
        {
            id: "tumblehome",
            lab: "Tumblehome",
            min: 0,
            max: 0.3,
            step: 0.005,
            grp: "GREENHOUSE",
            law: "Dach-Einzug der Seitenscheibe",
        },
        {
            id: "springRate",
            lab: "Federrate",
            min: 40,
            max: 170,
            step: 1,
            grp: "DYNAMIK · FAHRWERK",
            law: "Winkel = Moment/Steifigkeit · steifer = weniger Nicken · steifer = engerer Radbogen",
        },
        {
            id: "damping",
            lab: "Dämpfung",
            min: 4,
            max: 24,
            step: 0.5,
            grp: "DYNAMIK · FAHRWERK",
            dyn: true,
            law: "ζ = c/2√k · höher = kein Nachschwingen",
        },
        {
            id: "grip",
            lab: "Reifen-Grip",
            min: 0.6,
            max: 1.4,
            step: 0.02,
            grp: "DYNAMIK · FAHRWERK",
            dyn: true,
            law: "Reibkreis μ · weniger = früher Drift/Übersteuern",
        },
    ];
    // ── KULTUREN: eingefrorener Kontroll-Vektor je Marke (orthogonal zum Typ). Achsen: cEdge Kante↔Fläche · cTension Spannung · cStance Haltung · cGrille Signatur. ──
    const CULTURES = {
        cavallo: {
            lab: "Cavallo",
            fx: { cEdge: 0.15, cTension: 0.85, cStance: 0.72, cGrille: "oval", cLight: "l_oval" },
        }, // Ferrari: Fläche, gespannt, aggressiv-elegant
        toro: { lab: "Toro", fx: { cEdge: 0.9, cTension: 0.45, cStance: 0.95, cGrille: "hex", cLight: "l_hex" } }, // Lamborghini: Keil/Kante, Hexagon
        stern: { lab: "Stern", fx: { cEdge: 0.25, cTension: 0.38, cStance: 0.32, cGrille: "wide", cLight: "l_wide" } }, // Mercedes: ruhige Fläche, würdevoll
        vorsprung: {
            lab: "Vorsprung",
            fx: { cEdge: 0.62, cTension: 0.32, cStance: 0.5, cGrille: "single", cLight: "l_single" },
        }, // Audi: geometrisch, Singleframe
        monolith: {
            lab: "Monolith",
            fx: { cEdge: 0.48, cTension: 0.2, cStance: 0.12, cGrille: "upright", cLight: "l_upright" },
        }, // Rolls: aufrecht, monumental
    };
    const PRESETS = {
        gt: {
            kind: "vehicle",
            lab: "GT",
            s: {
                radstand: 2.9,
                spur: 1.62,
                ueberhangV: 0.78,
                ueberhangH: 0.92,
                radR: 0.34,
                fahrhoehe: 0.13,
                guertel: 0.72,
                dach: 1.2,
                kabineMitte: -0.28,
                kabineLaenge: 1.7,
                tumblehome: 0.13,
                taille: 0.1,
                tueren: 2,
                springRate: 100,
                coke: 0.18,
                grilleW: 0.36,
                grilleDrop: 0.18,
                lightH: 0.05,
                lightDrop: 0.115,
                roofArc: 0.03,
                pillarCurve: 0.045,
                pillarProfile: 0.024,
                haunch: 0.035,
                hoodArc: 0.028,
            },
            fx: { sig: "hook" },
        },
        supersport: {
            kind: "vehicle",
            lab: "Supersport",
            s: {
                radstand: 2.7,
                spur: 1.66,
                ueberhangV: 0.6,
                ueberhangH: 0.7,
                radR: 0.36,
                fahrhoehe: 0.085,
                guertel: 0.74,
                dach: 1.12,
                kabineMitte: -0.34,
                kabineLaenge: 1.55,
                tumblehome: 0.17,
                taille: 0.13,
                tueren: 2,
                springRate: 135,
                coke: 0.22,
                grilleW: 0.44,
                grilleDrop: 0.24,
                lightH: 0.04,
                lightDrop: 0.1,
                roofArc: 0.038,
                pillarCurve: 0.055,
                pillarProfile: 0.03,
                haunch: 0.05,
                hoodArc: 0.02,
            },
            fx: { sig: "split" },
        },
        limousine: {
            kind: "vehicle",
            lab: "Limousine",
            s: {
                radstand: 3.05,
                spur: 1.6,
                ueberhangV: 0.88,
                ueberhangH: 1.0,
                radR: 0.34,
                fahrhoehe: 0.14,
                guertel: 0.84,
                dach: 1.42,
                kabineMitte: -0.34,
                kabineLaenge: 2.05,
                tumblehome: 0.11,
                taille: 0.07,
                tueren: 4,
                springRate: 82,
                coke: 0.11,
                grilleW: 0.45,
                grilleDrop: 0.15,
                lightH: 0.058,
                lightDrop: 0.115,
                roofArc: 0.022,
                pillarCurve: 0.032,
                pillarProfile: 0.014,
                haunch: 0.02,
                hoodArc: 0.016,
                windshieldRake: 0.55,
            },
            fx: { sig: "blade" },
        },
        kompakt_fwd: {
            kind: "vehicle",
            lab: "Kompakt-FWD",
            s: {
                radstand: 2.6,
                spur: 1.55,
                ueberhangV: 0.72,
                ueberhangH: 0.52,
                radR: 0.32,
                fahrhoehe: 0.135,
                guertel: 0.84,
                dach: 1.44,
                kabineMitte: -0.1,
                kabineLaenge: 1.95,
                tumblehome: 0.1,
                taille: 0.05,
                tueren: 4,
                springRate: 92,
                coke: 0.1,
                grilleW: 0.3,
                grilleDrop: 0.2,
                lightH: 0.052,
                lightDrop: 0.12,
                roofArc: 0.02,
                pillarCurve: 0.028,
                pillarProfile: 0.012,
                haunch: 0.015,
                hoodArc: 0.012,
                windshieldRake: 0.52,
            },
            fx: { sig: "c", heck: "steil" },
        },
        suv: {
            kind: "vehicle",
            lab: "SUV",
            s: {
                radstand: 2.85,
                spur: 1.64,
                ueberhangV: 0.82,
                ueberhangH: 0.86,
                radR: 0.41,
                fahrhoehe: 0.22,
                guertel: 0.88,
                dach: 1.66,
                kabineMitte: -0.22,
                kabineLaenge: 2.0,
                tumblehome: 0.08,
                taille: 0.04,
                tueren: 4,
                springRate: 68,
                coke: 0.07,
                grilleW: 0.4,
                grilleDrop: 0.09,
                lightH: 0.072,
                lightDrop: 0.13,
                roofArc: 0.013,
                pillarCurve: 0.016,
                pillarProfile: 0.008,
                haunch: 0.026,
                hoodArc: 0.012,
                windshieldRake: 0.45,
            },
            fx: { sig: "brow", heck: "steil" },
        },
    };
    // Der Regler-Grundzustand (Original garage.js Z.712–714) + die Preset-Klick-Basis
    // (Z.816: heck/windshieldRake reset) — die Shell UND buildInstance mergen identisch.
    const DEFAULT_P = {
        radstand: 2.9,
        spur: 1.62,
        ueberhangV: 0.78,
        ueberhangH: 0.92,
        radR: 0.34,
        fahrhoehe: 0.13,
        guertel: 0.72,
        dach: 1.2,
        kabineMitte: -0.28,
        kabineLaenge: 1.7,
        tumblehome: 0.13,
        taille: 0.1,
        springRate: 95,
        damping: 12,
        grip: 1.0,
    };
    const BASE_P = { heck: "stufe", windshieldRake: 0.5 };
    function presetPatch(id) {
        const pre = PRESETS[id];
        if (!pre) return null;
        return Object.assign({}, BASE_P, pre.s, pre.fx);
    }

    // ── B2: buildInstance(rezeptId, seed, lod, ov?) — die EINE Bau-Funktion ──
    // Deterministisch (rein aus den Parametern, s. Kopf: seed reserviert, Goldens
    // cv:3 frieren die Seed-Invarianz ein); lod wird auf die einzige getragene
    // Stufe 0 geklemmt (kindStages.vehicle=[0] — L1/L2 gradet der Wirt). ov reist
    // als Parameter-Override (z. B. CULTURES[x].fx). Ausgang: EINE THREE.Group
    // (Baukörper + Haut + Räder, Querschnitt-verjüngt + plan-konvex), Welt-Matrizen
    // aktualisiert — die Naht sind die Float32-Attribute ihrer Meshes (G2.2).
    function buildInstance(rezeptId, seed, lod, ov) {
        const pre = PRESETS[rezeptId];
        if (!pre) return null;
        const P = Object.assign({}, DEFAULT_P, BASE_P, pre.s, pre.fx, ov || {});
        const mats = materials();
        const ctx = { M: mats, bodyMat: mats.clay, doors: [], corners: [] };
        const H = hardpoints(P);
        const g = new THREE.Group();
        const pkg = buildPackage(H, P, ctx);
        const body = buildSkin(H, P, ctx);
        const wheels = buildWheels(H, P, ctx);
        g.add(pkg);
        g.add(body);
        g.add(wheels);
        const S = scal(H, P); // dieselbe Nachbearbeitung wie die Shell-rebuild (Verjüngung + Bug-Konvexität)
        taperBody(pkg, S, P);
        taperBody(body, S, P);
        bowEnds(body, S);
        bowEnds(pkg, S);
        g.userData = { kind: "vehicle", rezeptId: rezeptId, seed: seed, lod: 0 };
        g.updateMatrixWorld(true);
        return g;
    }

    // ── Der Namensraum (Vertrag v1.1 §7): Manifest-Blöcke + Bau-Vokabular ──
    root.__vehicleCore = {
        VERSION: VERSION,
        STUDIO_VERTRAG: STUDIO_VERTRAG,
        PORTAL_RENDER_CONFIG: PORTAL_RENDER_CONFIG,
        PRESETS: PRESETS,
        PARAMS_BY_KIND: { vehicle: PARAMS },
        LEHREN: LEHREN,
        CULTURES: CULTURES,
        DEFAULT_P: DEFAULT_P,
        BASE_P: BASE_P,
        presetPatch: presetPatch,
        buildInstance: buildInstance,
        // Mess- & Physik-Fläche (Shell + Wirt lesen dieselben Gesetze)
        derive: derive,
        messen: messen,
        evalLehren: evalLehren,
        hardpoints: hardpoints,
        cgHeightOf: cgHeightOf,
        wheelClearance: wheelClearance,
        carPhys: carPhys,
        FAHR: FAHR,
        exportDrive: exportDrive,
        A_PITCH_MAX: A_PITCH_MAX,
        A_LAT_MAX: A_LAT_MAX,
        // Bau-Fläche (die Shell baut ihre Ebenen aus DIESER Quelle)
        materials: materials,
        buildFrame: buildFrame,
        buildWheels: buildWheels,
        buildSkin: buildSkin,
        buildPackage: buildPackage,
        makeWheel: makeWheel,
        scal: scal,
        taperBody: taperBody,
        bowEnds: bowEnds,
        crossSection: crossSection,
        // Geometrie-Vokabular (Shell-Overlays: Gelenke/Lehren/Negativ)
        box: box,
        cyl: cyl,
        B: B,
        C: C,
        dot: dot,
        seg: seg,
        polyline: polyline,
        ring: ring,
        Bsub: Bsub,
        dome: dome,
        bend: bend,
        clipSegs: clipSegs,
        glassPane: glassPane,
        quad4: quad4,
    };
})(typeof self !== "undefined" ? self : globalThis);
