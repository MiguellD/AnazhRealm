// 2210 Messschuld M36 siedlung.K5 (Seiten-Code für `werkbank eval`, r = Welt, T = THREE): die Zelle `window.__m36.zelle` erwacht im
// Spielpfad. Ihre Zell-Info trägt nH = `window.__m36.nH` (Same und Anker der Welt). Der Spieler geht im echten Loop (rAF, der Takt
// des Spiels) mit 4 m/s vom Start (Abstand `start` m zum Anker) auf sie zu, der Blick auf den Anker — durch den Vorlauf-Ring (Export
// und Ort-Wahl vorab) bis zum Erwachen (`_autoSettlementSpawnCell`). Gemessen: die Zeit vom Erwachen bis zum ersten Bild, in
// dem ein Haus der Zelle im Sichtkegel der Kamera in der Stufe gezeichnet ist, die seine Studio-Kette für seinen Abstand wählt —
// das Bild des Ausgabe-Pfads: in der Mesh-Zone (`architectureCullingRadius`) sein Mesh (`_archIsRendered`), jenseits die Hülle
// seines Gesetzbuchs (fernform "huelle", fachwerk B2c) im Welt-March; der Feld-Satz einer Brücke in der Mesh-Zone zählt nie.
// Zerlegt: Erwachen → erstes Haus gesetzt → im Sichtradius der Bauten und im Kegel → gezeichnet (die Latenz, die das Soll
// meint: ab dem Bild, in dem das Haus stehen KANN). Dazu der Bau-Hash (FNV über Same, nH, Anker und Typ · Same · Ort des ersten Hauses). Frist in Bildern, nie in Sekunden.
const M = window.__m36, st = r.state, A = r.constructor.AUTO_SETTLEMENT, rend = st.renderer;
const info0 = r._autoSettlementCellInfo(M.zelle[0], M.zelle[1]);
if (!info0) return { fehler: "die Zelle trägt kein Dorf", zelle: M.zelle };
const info = Object.assign({}, info0, { nH: M.nH });
const orig = r._autoSettlementCellInfo;
r._autoSettlementCellInfo = function (x, z) {
    return x === M.zelle[0] && z === M.zelle[1] ? info : orig.call(this, x, z);
};
const pm = st.playerMesh.position;
const rx = pm.x - info.x, rz = pm.z - info.z, rl = Math.hypot(rx, rz) || 1;
const sx = info.x + (rx / rl) * M.start, sz = info.z + (rz / rl) * M.start;
pm.set(sx, r._voxelSurfaceY(sx, sz) + 1.8, sz);
let erwacht = null, erstes = null, erstesMesh = null, gesetzt = null, imRadius = null, bild = 0, hash = null;
const vorher = new Set(st.architectures);
const spawn = r._autoSettlementSpawnCell;
r._autoSettlementSpawnCell = function (cx, cz, i) {
    if (cx === M.zelle[0] && cz === M.zelle[1] && !erwacht) erwacht = { t: performance.now(), bild, d: Math.hypot(pm.x - info.x, pm.z - info.z) };
    return spawn.call(this, cx, cz, i);
};
const fnv = (s) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    return h.toString(16);
};
const cam = st.camera, frust = new T.Frustum(), mat = new T.Matrix4();
const fertig = new Promise((ok) => {
    let t0 = null;
    rend.setAnimationLoop((t) => {
        bild++;
        t0 ??= t;
        // die gehende Pose: 4 m/s auf den Anker zu, auch nach dem Erwachen, bis 30 m vor ihm — die Lage absolut je Bild gesetzt
        // (wie die Bahn der Werkbank; der Takt schreibt die Lage aus dem Sim-Zustand zurück, ein Schritt-Zuschlag verliefe)
        const weg = Math.min(M.start - 30, (4 * (t - t0)) / 1000);
        pm.set(sx - ((sx - info.x) / M.start) * weg, pm.y, sz - ((sz - info.z) / M.start) * weg);
        st.yaw = Math.atan2(info.x - pm.x, info.z - pm.z);
        st.pitch = 0;
        r._gameLoopTick(t);
        if (erwacht && !erstesMesh) {
            cam.updateMatrixWorld(true);
            frust.setFromProjectionMatrix(mat.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
            const jetzt = () => ({ ms: +(performance.now() - erwacht.t).toFixed(1), bilder: bild - erwacht.bild });
            for (const e of st.architectures) {
                if (vorher.has(e) || !/^haus_/.test(e.type) || Math.hypot(e.position.x - info.x, e.position.z - info.z) > 260) continue;
                gesetzt ??= jetzt();
                if (!frust.containsPoint(e.position)) continue;
                const d = Math.hypot(e.position.x - pm.x, e.position.z - pm.z);
                const nah = d <= st.architectureCullingRadius;
                if (nah) imRadius ??= Object.assign(jetzt(), { radius: st.architectureCullingRadius });
                // die Stufe der Kette am Abstand: nah das Mesh, fern die Hülle des Gesetzbuchs, gezeichnet im Feld (Texel 3 ≠ 0)
                const h = e._ziegelSlot, L = st.weltMarch && st.weltMarch.listeDaten, fp = h && r._archFoundryPreset(e);
                const stufe = nah ? (r._archIsRendered(e) ? "mesh" : null) : h && L && L[h.feld * 32 + 3] !== 0 && fp && r._foundryFernForm(fp) === "huelle" ? "huelle" : null;
                if (!stufe) continue;
                const bei = { ms: +(performance.now() - erwacht.t).toFixed(1), bilder: bild - erwacht.bild, stufe, typ: e.type, same: e.seed, ort: [+e.position.x.toFixed(2), +e.position.z.toFixed(2)], abstand: +d.toFixed(1), auge: [+pm.x.toFixed(1), +pm.y.toFixed(1), +pm.z.toFixed(1)] };
                if (!erstes) {
                    erstes = bei;
                    hash = fnv([info.seed, info.nH, info.x.toFixed(2), info.z.toFixed(2), e.type, e.seed, erstes.ort].join("|"));
                }
                if (stufe === "mesh") {
                    erstesMesh = bei;
                    break;
                }
            }
        }
        if (erstesMesh || bild > M.maxBilder) {
            rend.setAnimationLoop(null);
            ok();
        }
    });
});
await fertig;
r._autoSettlementCellInfo = orig;
r._autoSettlementSpawnCell = spawn;
const zelle = (st.worldMeta.settlementCells || {})[info.key] || null;
return { gesetzt, imRadius, latenzMs: erstesMesh && imRadius ? +(erstesMesh.ms - imRadius.ms).toFixed(1) : null, erstesMesh, radius: st.architectureCullingRadius, zelle: M.zelle, nH: M.nH, same: info.seed, anker: [+info.x.toFixed(1), +info.z.toFixed(1)], erwacht: erwacht && { bild: erwacht.bild, d: +erwacht.d.toFixed(1) }, erstes, hash, bilder: bild, reserviert: zelle };
