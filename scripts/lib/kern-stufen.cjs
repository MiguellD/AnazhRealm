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

// DER KÖRPER EINES KERNS (Teil E jeder Nervensystem-Linse, die EINE Probe statt vier Abschriften): die Seite fragt den Worker
// nach dem Werk `preset` (Same 7) je Stufe — Meshes je Stufe, die NUR-WURF-Stufe 3 mit ihrem Beipack `__fern` —, und die erste
// Stufe geht durch `_foundryBuildGroup`: die Farbe des Stoffs reist (`mat.color`), jedes Kind trägt das color-Attribut.
async function seitenKoerper(preset, stufen) {
    const [r, e] = [window.anazhRealm, { meshCount: {} }];
    try {
        for (const L of stufen) {
            const m = await Promise.race([r._foundryRequest(preset, 7, L), new Promise((ok) => setTimeout(ok, 45000, null))]);
            e.meshCount[L] = Array.isArray(m) ? m.length : -1;
            if (L === 3) e.fern3 = !!m?.some((x) => x?.kind === "__fern" && Array.isArray(x.huelle?.teile));
            if (L !== stufen[0] || !m?.length) continue;
            e.hasMatColor = m.some((x) => Array.isArray(x?.mat?.color) && x.mat.color.length === 3);
            const g = r._foundryBuildGroup(m);
            e.groupChildren = g?.children?.length || 0;
            e.allHaveColor = !!g && g.children.every((ch) => !!ch.geometry?.attributes?.color);
            g?.traverse((o) => o.isMesh && o.geometry?.dispose());
        }
    } catch (x) {
        e.err = x?.message || String(x);
    }
    return e;
}
// DIE KERN-PROBE jeder Nervensystem-Linse an der lebenden Seite, mit ihrem `check`: der Ingest-Merge trägt die Stufen-Liste
// jedes Kerns (Teil B), und der Körper von `preset` reist je Stufe (Teil E, `art` nennt das Werk). → die Stufen { ks, kern }.
async function kernProbe(page, check, preset, stufen, art) {
    const ks = await page.evaluate(() => window.anazhRealm.constructor._studioRenderConfig.lod.kindStages);
    const kern = await page.evaluate(seitenStufen, kernRaeume());
    const [ab, e] = [stufenAbweichung(ks, kern), await page.evaluate(seitenKoerper, preset, stufen)];
    check("B: der Ingest-Merge traegt die Stufen-Liste JEDES Kerns (kein Kern ueberschreibt einen anderen)", !ab.length, ab.join(" · ") || `${Object.keys(kern).length} Arten`);
    check(`E: der Worker liefert das ${art}-Asset (Meshes > 0 je Stufe ${stufen}${stufen.includes(3) ? ", die Stufe 3 mit Beipack __fern" : ""})`, stufen.every((L) => e.meshCount[L] > 0) && (!stufen.includes(3) || e.fern3), e.err || JSON.stringify(e.meshCount));
    check("E: die Material-Farbe reist mit (mat.color)", e.hasMatColor === true);
    check("E: _foundryBuildGroup baut die Gruppe (Kinder > 0)", e.groupChildren > 0, String(e.groupChildren));
    check("E: jedes Kind traegt das color-Attribut (WebGPU-STRIKT-Fill)", e.allHaveColor === true);
    return { ks, kern };
}

module.exports = { kernRaeume, seitenStufen, stufenAbweichung, geklemmteStufe, selbsttest, kernProbe };
