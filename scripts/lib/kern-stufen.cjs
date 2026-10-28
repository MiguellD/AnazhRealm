// kern-stufen.cjs — DIE STUFEN-WAHRHEIT DER KERNE als EINE Erwartung der Nervensystem-Linsen. Der
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

// Das Urteil über den Ingest-Merge (Teil B der ε-Beweise): das LIVE-Buch trägt die Stufen-Liste JEDES Kerns.
function stufenUrteil(check, live, kern) {
    const ab = stufenAbweichung(live, kern);
    check("B: der Ingest-Merge traegt die Stufen-Liste JEDES Kerns (kein Kern ueberschreibt einen anderen)", !ab.length, ab.join(" · ") || `${Object.keys(kern).length} Arten`);
}
// TEIL E der ε-Beweise (porta · schmiede · vehicle; Seiten-Kontext): das Asset `preset` aus dem EINEN Foundry-Worker auf Stufe 0
// — Mesh-Zahl, ob die Material-Farbe reist, die Gruppe aus `_foundryBuildGroup` und ob jedes Kind das color-Attribut trägt
// (die Gruppe fällt danach, kein Leck in der Probe).
async function assetSeite(preset) {
    const r = window.anazhRealm;
    try {
        const meshes = await Promise.race([r._foundryRequest(preset, 7, 0), new Promise((ok) => setTimeout(() => ok(null), 30000))]);
        const e = { meshCount: Array.isArray(meshes) ? meshes.length : -1 };
        e.hasMatColor = e.meshCount > 0 && meshes.some((m) => m && m.mat && Array.isArray(m.mat.color) && m.mat.color.length === 3);
        const g = e.meshCount > 0 ? r._foundryBuildGroup(meshes) : null;
        e.groupChildren = g ? g.children.length : 0;
        e.allHaveColor = !!g && g.children.every((ch) => !!(ch.geometry && ch.geometry.attributes && ch.geometry.attributes.color));
        if (g) g.traverse((o) => o.isMesh && o.geometry && o.geometry.dispose());
        return e;
    } catch (x) {
        return { err: (x && x.message) || String(x) };
    }
}
// Das Urteil über Teil E; `was` (das Tor-Asset …) nennt die Mesh-Zeile, ohne `was` prüft der Aufrufer die Mesh-Zahl selbst.
function assetUrteil(check, e, was) {
    if (was) check(`E: der Worker liefert ${was} (Meshes > 0)`, e.meshCount > 0, e.err || `meshes=${e.meshCount}`);
    check("E: die Material-Farbe reist mit (mat.color)", e.hasMatColor === true);
    check("E: _foundryBuildGroup baut die Gruppe (Kinder > 0)", e.groupChildren > 0, String(e.groupChildren));
    check("E: jedes Kind traegt das color-Attribut (WebGPU-STRIKT-Fill)", e.allHaveColor === true);
}

module.exports = { kernRaeume, seitenStufen, stufenAbweichung, geklemmteStufe, selbsttest, stufenUrteil, assetSeite, assetUrteil };
