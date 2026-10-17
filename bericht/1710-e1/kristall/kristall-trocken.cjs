// kristall-trocken.cjs — der Beweis der Kristall-Kette in EINER Welt (17.10.): dieselben Probe-Punkte der Chunk-Bepflanzung
// (`_populateVoxelChunkVegetation`: 10 × 10 je Chunk, Saat je Punkt) laufen durch `_vegetationSampleSpawn`, einmal mit der
// Streu-Seltenheit des Buchs (`_studioRenderConfig.placement.rarity`, kristalle 0,05) und einmal ohne sie (so wie vor der
// Ankunft des Buchs). `_enqueueVegetationSpawn` zählt nur (kein Eintrag entsteht), danach steht alles wie vorher.
//   node kristall-trocken.cjs --datei <pfad>      (Werkbank läuft; Orte genesis und wiese, je 7 × 7 Chunks um den Spieler)
"use strict";
const http = require("http");
const fs = require("fs");
const opt = (n, d) => {
    const i = process.argv.indexOf(n);
    return i >= 0 ? process.argv[i + 1] : d;
};
const DATEI = opt("--datei", "kristall-trocken.json"),
    PORT = Number(opt("--port", 4490)),
    RADIUS = Number(opt("--radius", 3));
function R(weg, nutzlast) {
    return new Promise((res, rej) => {
        const body = JSON.stringify(nutzlast || {});
        const req = http.request(
            { host: "127.0.0.1", port: PORT, path: weg, method: "POST", headers: { "Content-Type": "application/json" } },
            (r) => {
                let d = "";
                r.on("data", (c) => (d += c));
                r.on("end", () => {
                    try {
                        res(JSON.parse(d));
                    } catch (_e) {
                        res({ roh: d.slice(0, 400) });
                    }
                });
            }
        );
        req.on("error", rej);
        req.setTimeout(1800000, () => req.destroy(new Error(`${weg}: Frist`)));
        req.end(body);
    });
}
const TROCKEN = `
const st = r.state, p = st.playerMesh.position, { span } = r._voxelChunkConfig();
const cx0 = Math.floor(p.x / span), cz0 = Math.floor(p.z / span), RAD = ${RADIUS};
const lauf = (mitSeltenheit) => {
    const zaehl = {}, orte = [];
    const altQ = r._enqueueVegetationSpawn, altN = r._naturSetzen, altCfg = AnazhRealm._studioRenderConfig;
    r._enqueueVegetationSpawn = (name, pos) => { zaehl[name] = (zaehl[name] || 0) + 1; if (/kristall/.test(name)) orte.push([Math.round(pos.x), Math.round(pos.z)]); };
    r._naturSetzen = (name) => { zaehl["direkt:" + name] = (zaehl["direkt:" + name] || 0) + 1; };
    if (!mitSeltenheit) {
        const kopie = Object.assign({}, altCfg);
        kopie.placement = Object.assign({}, altCfg.placement); delete kopie.placement.rarity;
        AnazhRealm._studioRenderConfig = kopie;
    }
    let punkte = 0;
    try {
        for (let cz = cz0 - RAD; cz <= cz0 + RAD; cz++) for (let cx = cx0 - RAD; cx <= cx0 + RAD; cx++) {
            const ox = cx * span, oz = cz * span, S = 10, step = span / S, tagsJe = new Map();
            for (let zi = 0; zi < S; zi++) for (let xi = 0; xi < S; xi++) {
                const sx = ox + (xi + 0.5) * step, sz = oz + (zi + 0.5) * step, sy = r._voxelSurfaceY(sx, sz);
                if (sy === null || !Number.isFinite(sy)) continue;
                const seed = ((cx * 73856093) ^ (cz * 19349663) ^ (xi * 83492791) ^ (zi * 11)) >>> 0;
                r._vegetationSampleSpawn(sx, sz, sy, seed, tagsJe); punkte++;
            }
        }
    } finally {
        r._enqueueVegetationSpawn = altQ; r._naturSetzen = altN; AnazhRealm._studioRenderConfig = altCfg;
    }
    return { punkte, zaehl, kristallOrte: orte.slice(0, 40) };
};
const rar = AnazhRealm._studioRenderConfig && AnazhRealm._studioRenderConfig.placement && AnazhRealm._studioRenderConfig.placement.rarity;
return { version: AnazhRealm.VERSION, spieler: [Math.round(p.x), Math.round(p.z)], span, chunks: (2 * RAD + 1) ** 2, rarity: rar || null,
    presetKristall: r._foundryPresetFor("kristall_geode"), presetStein: r._foundryPresetFor("stein_block"),
    mit: lauf(true), ohne: lauf(false) };`;
(async () => {
    const aus = { start: new Date().toISOString(), orte: {} };
    const log = (x) => console.log(`${new Date().toISOString().slice(11, 19)} ${x}`);
    await R("/eval", { code: "window.__anazhAutoSettlement = false; return true;" });
    for (const ort of ["genesis", "wiese"]) {
        const um = await R("/umstellen", { ort, sicht: "ego" });
        log(`umstellen ${ort}: ${JSON.stringify(um).slice(0, 120)}`);
        const e = await R("/eval", { code: TROCKEN });
        const x = (e && e.ergebnis) || e;
        aus.orte[ort] = x;
        log(`${ort}: ${JSON.stringify(x).slice(0, 1400)}`);
    }
    fs.writeFileSync(DATEI, JSON.stringify(aus, null, 1));
})().catch((e) => {
    console.error("kristall-trocken FEHLER:", (e && e.stack) || e);
    process.exit(2);
});
