// spike-bef: die Werkbank-Befehle des Spikes „Stufe aus der L0" — je Vorlage, Stufe und Abstand drei Bilder an derselben Kamera:
// E (nur der Werfer der Stufe 3), A (L0), B (die Stufe aus der L0: Ecken-Bündelung, `buendel.js`, Zelle = ein Bildpunkt an d)
// und zum Vergleich C (die Stufe aus ihrem eigenen Rezept, heute).
// node spike-bef.cjs <aus.bef> <bildordner> <faelle-json>   faelle: [[typ, preset, werfer, halbDiag, blickHoehe, stufe, d, zellePx = 1], …]
const fs = require("fs"), path = require("path");
const [aus, G, faelleS] = process.argv.slice(2);
const F = JSON.parse(faelleS);
const BRENNWEITE = 703.7; // px je m an 1080 Zeilen (Schritt 0, `wirt._brennweite(0)`)
const P = { x: -262, z: -1060 };
const dir = (() => { const d = [1, 0.7], l = Math.hypot(...d); return d.map((v) => v / l); })();
const quelle = fs
    .readFileSync(path.join(__dirname, "buendel.js"), "utf8")
    .split("\n")
    .filter((z) => !/^\s*\/\//.test(z))
    .join(" ");
if (/'/.test(quelle)) throw new Error("buendel.js trägt ein Hochkomma — die Werkbank-Zeile bricht");
const L = [];
L.push(
    `eval '${quelle} window.__buendel = buendel; const P = { x: ${P.x}, z: ${P.z} }; const y = r.getTerrainHeightAt(P.x, P.z); const F = ${JSON.stringify(F)}; const S = (window.__stufe = {}); const tri = (ms) => ms.reduce((s, m) => s + (m && m.index ? m.index.length / 3 : 0), 0); const zahl = {}; const setze = (g, werfer) => { g.position.set(P.x, y, P.z); g.visible = false; if (werfer) g.traverse((o) => { if (o.isMesh) o.castShadow = false; }); r.state.scene.add(g); return g; }; for (const [typ, p, werfer, , , k, d, zp = 1] of F) { const e = (S[typ + "-" + k + "-" + d + "-" + zp] = {}); const m0 = await r._foundryWorkerRequest(p, 1, 0); const mk = await r._foundryWorkerRequest(p, 1, k); const mb = buendel(m0, (zp * d) / ${BRENNWEITE}); zahl[typ + " L" + k + " @" + d + " Zelle " + zp + " px"] = { L0: tri(m0), heute: tri(mk), ausL0: tri(mb) }; e.A = setze(r._foundryBuildGroup(m0, { preset: p }), werfer); e.B = setze(r._foundryBuildGroup(mb, { preset: p }), werfer); e.C = setze(r._foundryBuildGroup(mk, { preset: p }), werfer); if (werfer) { const m3 = await r._foundryWorkerRequest(p, 1, 3); const w = r._foundryBuildGroup(m3.filter((x) => x && x.kind === "schatten"), { preset: p }); setze(w, false); w.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.material = o.material.clone(); o.material.colorWrite = false; o.material.depthWrite = false; } }); e.werfer = w; } } window.__zeige = (fall, was) => { for (const t in S) for (const j in S[t]) S[t][j].visible = false; if (fall) { if (S[fall].werfer) S[fall].werfer.visible = true; if (was !== "E") S[fall][was].visible = true; } }; return JSON.stringify(zahl);'`
);
for (const [typ, , , r, hy, k, d0, zp = 1] of F) {
    const fall = `${typ}-${k}-${d0}-${zp}`;
    const d = Math.max(d0, r + 0.5);
    const cx = (P.x + dir[0] * d).toFixed(2), cz = (P.z + dir[1] * d).toFixed(2);
    const kam = `bild ${cx} +1.7 ${cz} ${P.x} +${hy} ${P.z} --fuss false --uhr 0.5 --w 1920 --h 1080 --wahl 0`;
    const n = `${typ}-L${k}-d${d.toFixed(1)}-z${zp}`;
    for (const was of ["E", "A", "B", "C"]) L.push(`eval 'window.__zeige("${fall}", "${was}"); return "${was}";'`, `${kam} --datei ${G}/${n}-${was}.png`);
}
L.push(`eval 'window.__zeige(null); return "aus";'`);
fs.writeFileSync(aus, L.join("\n") + "\n");
console.log(L.length, "Befehle");
