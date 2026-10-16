// kern-stufen.cjs — DIE STUFEN-WAHRHEIT DER KERNE als EINE Erwartung der Nervensystem-Linsen (K64). Befund: vier Linsen
// (nervensystem porta · fachwerk · schmiede · vehicle) schrieben die Stufen-Listen fremder Kerne als Literale ab („gate
// [0,1,3] UNANGETASTET") — die Stufe 2 der Tore (K64) machte drei von ihnen rot, ohne dass der Merge am Ingest brach. Der
// Merge ist treu, wenn jede Art des Live-Buchs die Liste trägt, die ihr Kern deklariert: die Erwartung liest die Kerne in
// der Seite (dieselben Dateien, die der Foundry-Worker lädt; die Namensräume aus cores.manifest.json), nie eine Abschrift.
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");

// Die Namensräume der Kerne in der Seite — der Baum-Kern (phyto, ohne eigenen Raum) trägt seine Karte an `__terrainCore`
// (foundry-core `__terrainCore.PORTAL_RENDER_CONFIG`).
function kernRaeume(root = ROOT) {
    const m = JSON.parse(fs.readFileSync(path.join(root, "cores.manifest.json"), "utf8"));
    return m.map((z) => z.ns || "__terrainCore");
}

// In der Seite: `await page.evaluate(seitenStufen, kernRaeume())` — je Art die deklarierte Liste ihres Kerns (JSON).
function seitenStufen(raeume) {
    const aus = {};
    for (const ns of raeume) {
        const k = globalThis[ns];
        const ks = k && k.PORTAL_RENDER_CONFIG && k.PORTAL_RENDER_CONFIG.lod && k.PORTAL_RENDER_CONFIG.lod.kindStages;
        if (ks) for (const art of Object.keys(ks)) aus[art] = JSON.stringify(ks[art]);
    }
    return aus;
}

// Der Vergleich: jede deklarierte Art trägt im Live-Buch (`live` = `_studioRenderConfig.lod.kindStages`) ihre Liste —
// jede Abweichung beim Namen der Art.
function stufenAbweichung(live, kern) {
    if (!kern || !Object.keys(kern).length) return ["keine Kern-Deklaration gelesen"];
    const ab = [];
    for (const art of Object.keys(kern)) {
        const ist = live && live[art] !== undefined ? JSON.stringify(live[art]) : "fehlt";
        if (ist !== kern[art]) ab.push(`${art}: Buch ${ist} ≠ Kern ${kern[art]}`);
    }
    return ab;
}

// Die Stufe, die der Wirt für eine Distanz-Wahl `wahl` serviert: die größte deklarierte ≤ wahl (sonst die erste).
function geklemmteStufe(listeJson, wahl) {
    const S = JSON.parse(listeJson);
    let st = S[0];
    for (const s of S) if (s <= wahl) st = s;
    return st;
}

// Selbsttest: ein Buch mit einer abgeschriebenen Liste muss beim Namen fallen, ein treues Buch nicht.
function selbsttest() {
    const kern = { gate: "[0,1,2,3]", tree: "[0,1,2]" };
    const falsch = stufenAbweichung({ gate: [0, 1, 3], tree: [0, 1, 2] }, kern);
    const treu = stufenAbweichung({ gate: [0, 1, 2, 3], tree: [0, 1, 2] }, kern);
    return (
        falsch.length === 1 &&
        /^gate: Buch \[0,1,3\]/.test(falsch[0]) &&
        treu.length === 0 &&
        stufenAbweichung({}, {}).length === 1 &&
        geklemmteStufe("[0,1,2,3]", 2) === 2 &&
        geklemmteStufe("[0,1,3]", 2) === 1
    );
}

module.exports = { kernRaeume, seitenStufen, stufenAbweichung, geklemmteStufe, selbsttest };
