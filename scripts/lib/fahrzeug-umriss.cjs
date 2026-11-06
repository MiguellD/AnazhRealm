// fahrzeug-umriss.cjs — DER UMRISS DER GEZEICHNETEN WAGEN-GESTALT: je Fahrzeug-Rezept ihr GRUNDRISS als k-DOP (die
// Stützweite der Gestalt je Richtung θ = 0°, 22,5° … 180° im Fahrt-Rahmen x längs, z quer; gespiegelt für z < 0) und ihr
// Dach — je als ÜBERSTAND über die Stationen der Hülle (`exportDrive.huelle`: das Rechteck noseX · tailX · ±bw, yRoof):
// positiv, wo die Gestalt hinausragt (Lichter, Lippe, Schürze, Kotflügel, Spiegel), negativ, wo sie innen bleibt (die
// gerundeten Ecken: das Rechteck stand dort bis 24 cm in der Luft). Gemessen an der Gestalt, die das Studio zeichnet
// (vehicle-core `buildInstance`, Stufe 0 und 1 — seed-invariant, gate:vehicle-contract), jede Ecke jedes Teils.
// Der Wirt fährt und stößt den Wagen mit diesem Grundriss (`_fahrzeugGestaltUmriss` → `_fahrHuelle`) — die Kollision IST
// die gezeichnete Gestalt (physik.K2 Staffel 2: Bild = Kollision). Der Wirt baut die Gestalt NIE selbst (nie synchron am
// Spawn) — er liest die gemintete Tafel `__vehicleCore.FAHRZEUG_UMRISS`; gate:vehicle-contract misst sie hier gegen die
// gebaute Gestalt (Mint-Treue), `MINT_FAHRZEUG_UMRISS=1 node scripts/diag-vehicle-contract.cjs` druckt die Tafel neu.
"use strict";

// Auf den Zentimeter nach AUSSEN gerundet (der Umriss deckt das Bild, nie weniger).
const aufCm = (v) => Math.ceil(v * 100 - 1e-6) / 100;
const RICHTUNGEN = 9; // θ_k = k · 22,5°, k = 0 … 8

// die Stützweite des Stations-Rechtecks in Richtung θ (x längs, z quer)
const stationStuetze = (h, t) => Math.max(h.noseX * Math.cos(t), h.tailX * Math.cos(t)) + h.bw * Math.abs(Math.sin(t));

// Der Überstand der Gestalt `id` über ihre Stationen: { ueber: [9 × m], dach: m } (je Richtung das Maximum über Stufe 0 und 1).
function fahrzeugUmrissMessen(VC, THREE, id) {
    const pre = VC.PRESETS[id];
    if (!pre || pre.kind !== "vehicle") return null;
    const h = VC.exportDrive(Object.assign({}, pre.s, pre.fx)).huelle;
    const v = new THREE.Vector3();
    const t = Array.from({ length: RICHTUNGEN }, (_, k) => (k * Math.PI) / (RICHTUNGEN - 1));
    const S = t.map(() => -Infinity);
    let dach = -Infinity;
    for (const lod of [0, 1]) {
        const g = VC.buildInstance(id, 7, lod);
        if (!g) return null;
        g.updateMatrixWorld(true);
        g.traverse((o) => {
            const P = o.isMesh && o.geometry && o.geometry.attributes ? o.geometry.attributes.position : null;
            if (!P) return;
            for (let i = 0; i < P.count; i++) {
                v.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld);
                dach = Math.max(dach, v.y);
                const az = Math.abs(v.z);
                for (let k = 0; k < RICHTUNGEN; k++) S[k] = Math.max(S[k], v.x * Math.cos(t[k]) + az * Math.sin(t[k]));
            }
        });
    }
    return { ueber: S.map((s, k) => s - stationStuetze(h, t[k])), dach: dach - h.yRoof };
}

// Die Tafel, wie sie in vehicle-core steht: je Rezept { ueber: [9 Zahlen], dach }, aufgerundet auf den cm.
function fahrzeugUmrissTafel(VC, THREE) {
    const T = {};
    for (const id of Object.keys(VC.PRESETS)) {
        const m = fahrzeugUmrissMessen(VC, THREE, id);
        if (m) T[id] = { ueber: m.ueber.map(aufCm), dach: aufCm(m.dach) };
    }
    return T;
}

// Die Mint-Treue: jede Zahl der Tafel deckt die gemessene (≥) und liegt höchstens 1 cm darüber. Liste der Abweichungen.
function fahrzeugUmrissTreue(tafel, gemessen) {
    const bad = [];
    for (const id of Object.keys(gemessen)) {
        const t = tafel && tafel[id];
        if (!t || !Array.isArray(t.ueber) || t.ueber.length !== RICHTUNGEN) {
            bad.push(`${id}: keine Zeile in FAHRZEUG_UMRISS`);
            continue;
        }
        const paare = gemessen[id].ueber.map((b, k) => [`ueber[${k}]`, t.ueber[k], b]);
        paare.push(["dach", t.dach, gemessen[id].dach]);
        for (const [wo, a, b] of paare)
            if (!(Number.isFinite(a) && a >= b - 1e-9 && a - b <= 0.01 + 1e-9))
                bad.push(`${id}.${wo}: Tafel ${a} gegen gebaut ${b.toFixed(4)}`);
    }
    for (const id of Object.keys(tafel || {})) if (!gemessen[id]) bad.push(`${id}: Zeile ohne Fahrzeug-Rezept`);
    return bad;
}

module.exports = { fahrzeugUmrissMessen, fahrzeugUmrissTafel, fahrzeugUmrissTreue, aufCm, RICHTUNGEN };
