// tor-huelle.cjs — DIE MASSE DER GEZEICHNETEN TOR-GESTALT (Leben-Schau 2, Nachbesserung 10.10.): je Tor-Rezept die Hülle,
// mit der der Wirt das Tor stoßen lässt (`_torBlockerAABBs`), gemessen an der Gestalt, die das Studio zeichnet (porta-core
// `buildInstance`, LOD 0 — seed-invariant, im Foundry-Worker auf three r128 gebaut wie hier in Node). Je Seite (0: x < 0,
// 1: x > 0 — eine Ruine fehlt hier ein Stein, dort nicht): die Außenkante der Pfosten (Punkte außerhalb der Öffnung ±rimAx
// im Körper-Band 0,1 m bis zur Kämpferlinie) und ihre Tiefe, darüber Außenkante und Tiefe des Rahmens; dazu die Oberkante.
// Der Wirt baut die Gestalt NIE selbst (bis zur Gegenprüfung 10.10. baute er sie synchron am Spawn: 15–50 ms je Gestalt
// auf dem Haupt-Thread) — er liest die gemintete Tafel `__portaCore.TOR_HUELLE`; gate:porta-contract misst sie hier gegen
// die gebaute Gestalt (Mint-Treue), `MINT_TOR_HUELLE=1 node scripts/diag-porta-contract.cjs` druckt die Tafel neu.
"use strict";

// Auf den Zentimeter nach AUSSEN gerundet (die Hülle deckt das Bild, nie weniger).
const aufCm = (v) => Math.ceil(v * 100 - 1e-6) / 100;

function torHuelleMessen(PC, THREE, id) {
    const pre = PC.PRESETS[id];
    if (!pre || pre.kind !== "gate") return null;
    const mu = PC.membranUniforms(PC.gateParams(pre));
    const g = PC.buildInstance(id, 0, 0);
    if (!g) return null;
    const v = new THREE.Vector3();
    const seite = () => ({ pfostenX: mu.rimAx, pfostenZ: 0, obenX: mu.rimAx, obenZ: 0 });
    const S = [seite(), seite()];
    let oberkante = mu.apexY;
    g.updateMatrixWorld(true);
    g.traverse((o) => {
        const P = o.isMesh && o.geometry && o.geometry.attributes ? o.geometry.attributes.position : null;
        if (!P) return;
        for (let i = 0; i < P.count; i++) {
            v.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld);
            const s = S[v.x < 0 ? 0 : 1];
            const ax = Math.abs(v.x);
            const az = Math.abs(v.z);
            if (v.y > oberkante) oberkante = v.y;
            if (v.y > mu.springY) {
                if (ax > s.obenX) s.obenX = ax;
                if (az > s.obenZ) s.obenZ = az;
            } else if (v.y > 0.1 && ax >= mu.rimAx) {
                if (ax > s.pfostenX) s.pfostenX = ax;
                if (az > s.pfostenZ) s.pfostenZ = az;
            }
        }
    });
    const zeile = (s) => [s.pfostenX, s.pfostenZ, s.obenX, s.obenZ];
    return { seiten: [zeile(S[0]), zeile(S[1])], oberkante };
}

// Die Tafel, wie sie in porta-core steht: [pfostenX, pfostenZ, obenX, obenZ] je Seite, aufgerundet auf den cm.
function torHuelleTafel(PC, THREE) {
    const T = {};
    for (const id of Object.keys(PC.PRESETS)) {
        const m = torHuelleMessen(PC, THREE, id);
        if (m) T[id] = { seiten: m.seiten.map((z) => z.map(aufCm)), oberkante: aufCm(m.oberkante) };
    }
    return T;
}

// Die Mint-Treue: jede Zahl der Tafel deckt die gemessene (≥) und liegt höchstens 1 cm darüber. Liste der Abweichungen.
function torHuelleTreue(tafel, gemessen) {
    const bad = [];
    for (const id of Object.keys(gemessen)) {
        const t = tafel && tafel[id];
        const m = gemessen[id];
        if (!t) {
            bad.push(`${id}: keine Zeile in TOR_HUELLE`);
            continue;
        }
        const paare = [["oberkante", t.oberkante, m.oberkante]];
        const namen = ["pfostenX", "pfostenZ", "obenX", "obenZ"];
        for (let k = 0; k < 2; k++)
            for (let j = 0; j < 4; j++)
                paare.push([
                    `seiten[${k}].${namen[j]}`,
                    t.seiten && t.seiten[k] ? t.seiten[k][j] : NaN,
                    m.seiten[k][j],
                ]);
        for (const [wo, a, b] of paare)
            if (!(Number.isFinite(a) && a >= b - 1e-9 && a - b <= 0.01 + 1e-9))
                bad.push(`${id}.${wo}: Tafel ${a} gegen gebaut ${b.toFixed(4)}`);
    }
    for (const id of Object.keys(tafel || {})) if (!gemessen[id]) bad.push(`${id}: Zeile ohne Tor-Rezept`);
    return bad;
}

module.exports = { torHuelleMessen, torHuelleTafel, torHuelleTreue, aufCm };
