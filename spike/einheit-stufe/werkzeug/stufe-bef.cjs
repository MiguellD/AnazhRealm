// stufe-bef: schreibt die Werkbank-Befehle des Spikes B1 (je Vorlage und Stufe: E = nur der Werfer, L0, Lk an derselben Kamera)
// node stufe-bef.cjs <aus.bef> <bildordner>
const fs = require("fs");
const [aus, G, gruppe = "alle", mitRauschen = "0"] = process.argv.slice(2);
const ABST = { haus1: [12, 26, 50], haus2: [26, 50, 100], wagen1: [6, 12, 26] };
const P = { x: -262, z: -1060 };
const dir = (() => { const d = [1, 0.7], l = Math.hypot(...d); return d.map((v) => v / l); })();
// [typ, preset, Werfer der Stufe 3, Halb-Diagonale, Blickhöhe über Grund, [[Stufe, b aus Schritt 0]]]
const V = [
    ["haus_alemannisch", "alemannisch", 1, Math.hypot(4, 5.15), 4.0, [[1, 3], [2, 14.5]]],
    ["haus_japanisch", "japanisch", 1, Math.hypot(5.96, 4.65), 2.5, [[1, 7.8], [2, 31.9]]],
    ["haus_modern", "modern", 1, Math.hypot(5, 4.65), 2.5, [[1, 3], [2, 3]]],
    ["gt", "gt", 0, Math.hypot(2.45, 1.03), 0.5, [[1, 3]]],
    ["suv", "suv", 0, Math.hypot(2.4, 1.07), 0.7, [[1, 3]]],
    ["limousine", "limousine", 0, Math.hypot(2.6, 1.03), 0.6, [[1, 3]]],
];
const L = [];
L.push(
    `eval 'const P = { x: ${P.x}, z: ${P.z} }; const y = r.getTerrainHeightAt(P.x, P.z); const V = ${JSON.stringify(V.map((v) => [v[0], v[1], v[2]]))}; const S = (window.__stufe = {}); for (const [typ, p, mitWerfer] of V) { const e = (S[typ] = {}); for (const k of [0, 1, 2]) { if (!mitWerfer && k === 2) continue; const m = await r._foundryWorkerRequest(p, 1, k); const g = r._foundryBuildGroup(m, { preset: p }); g.position.set(P.x, y, P.z); g.visible = false; if (mitWerfer) g.traverse((o) => { if (o.isMesh) o.castShadow = false; }); r.state.scene.add(g); e[k] = g; } if (mitWerfer) { const m3 = await r._foundryWorkerRequest(p, 1, 3); const w = r._foundryBuildGroup(m3.filter((x) => x && x.kind === "schatten"), { preset: p }); w.position.set(P.x, y, P.z); w.visible = false; w.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.material = o.material.clone(); o.material.colorWrite = false; o.material.depthWrite = false; } }); r.state.scene.add(w); e.werfer = w; } } window.__zeige = (typ, k) => { for (const t in S) for (const j in S[t]) S[t][j].visible = false; if (typ) { if (S[typ].werfer) S[typ].werfer.visible = true; if (k !== "E") S[typ][k].visible = true; } }; return JSON.stringify({ y, typen: Object.keys(S) });'`
);
for (const [typ, , werfer, r, hy, stufen] of V)
    for (const [k] of stufen)
    for (const d of ABST[(werfer ? "haus" : "wagen") + k]) {
        if (gruppe !== "alle" && (gruppe === "haus") !== !!werfer) continue;
        const cx = (P.x + dir[0] * d).toFixed(2), cz = (P.z + dir[1] * d).toFixed(2);
        const kam = `bild ${cx} +1.7 ${cz} ${P.x} +${hy} ${P.z} --fuss false --uhr 0.5 --w 1920 --h 1080 --wahl 0`;
        const n = `${typ}-L${k}-d${d.toFixed(1)}`;
        L.push(`eval 'window.__zeige("${typ}", "E"); return "E";'`, `${kam} --datei ${G}/${n}-E.png`);
        L.push(`eval 'window.__zeige("${typ}", 0); return "L0";'`, `${kam} --datei ${G}/${n}-A.png`);
        if (mitRauschen === "1" && d === ABST[(werfer ? "haus" : "wagen") + k][0]) L.push(`${kam} --datei ${G}/${n}-A2.png`);
        L.push(`eval 'window.__zeige("${typ}", ${k}); return "L${k}";'`, `${kam} --datei ${G}/${n}-B.png`);
    }
L.push(`eval 'window.__zeige(null); return "aus";'`);
fs.writeFileSync(aus, L.join("\n") + "\n");
console.log(L.length, "Befehle");
