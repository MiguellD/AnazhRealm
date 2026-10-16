// 1610-ZWEIGIPFEL, der Bau-Satz zerlegt (nach split.cjs an f6fa9f63: der Bau-Satz kostet in der langsamen Welt 1,36 ms, die Tore,
// Studios und die Esse ≈ 0): in EINER Welt (Genesis Ego) je Bau-Satz-Mesh der Preis an/aus (ABBA × 2), dann die ZEICHEN-REIHE:
// der Bau-Satz alphaTest-geprüft (discard → späte Tiefe) zahlt je nachdem, ob seine Verdecker (Bündel @wahl/@global, Boden) vor ihm
// zeichnen. R+ setzt renderOrder +10 (der Satz zeichnet nach allen Opaken), R− setzt −10 (davor), R0 zurück; je Stellung gpu-bank × 4.
// Dazu die Lage in der Szene: Index der Bau-Satz-Meshes und der Bündel in scene.children, die Opak-Reihe des letzten Frames.
// node split2.cjs <werkbank.cjs> <aus.json>
const { execFileSync } = require("child_process");
const fs = require("fs");
const [wb, aus] = process.argv.slice(2);
const rufe = (...a) => {
    const t = execFileSync("node", [wb, ...a], { encoding: "utf8", maxBuffer: 64 << 20, timeout: 120000 });
    return JSON.parse(t.slice(t.indexOf("{")));
};
const bank = () => rufe("gpu-bank", "60", "--runden", "2").gpuJeFrameMs;
const median = (v) => {
    const s = v.slice().sort((x, y) => x - y);
    return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const SAMMLE = `const st = r.state; const satz = []; st.scene.traverse((o) => { if (o.visible === true && !!o.geometry && o.isMesh && r._taeterKlasse(o) === "bauSatz") satz.push(o); }); window.__satz = satz;`;
const LAGE = `${SAMMLE} const K = st.scene.children; const lage = (o) => { let p = o; while (p.parent && p.parent !== st.scene) p = p.parent; return K.indexOf(p); }; const buendel = []; K.forEach((c, i) => { if (c && c.isBundleGroup) buendel.push([i, String(c.userData && c.userData.regionKey)]); }); return { kinder: K.length, buendel, satz: satz.map((o, i) => { const g = o.geometry; const m = o.material; return { i, szene: lage(o), id: o.id, stoffId: m.id, tri: Math.round((g.index ? g.index.count : g.attributes.position.count) / 3), alphaTest: m.alphaTest, durchsichtig: m.transparent, seiten: m.side, ordnung: o.renderOrder, wirft: o.castShadow }; }) };`;
const EIN = (i, an) => `${SAMMLE} const o = window.__satz[${i}]; if (o) o.visible = ${an}; r.state.scene.traverse((x) => { if (x.isBundleGroup) x.needsUpdate = true; }); return !!o;`;
const ORDNUNG = (v) => `${SAMMLE} for (const o of satz) o.renderOrder = ${v}; r.state.scene.traverse((x) => { if (x.isBundleGroup) x.needsUpdate = true; }); return satz.length;`;
const out = { start: new Date().toISOString(), lage: rufe("eval", LAGE).ergebnis, meshes: {}, reihe: {} };
const n = (out.lage && out.lage.satz && out.lage.satz.length) || 0;
bank();
bank();
out.gesamtAn = [bank(), bank(), bank()];
console.log(`Bau-Satz: ${n} Meshes · gesamt an ${median(out.gesamtAn).toFixed(2)} ms`);
// die Zeichen-Reihe zuerst (unberührte Welt): R0 R+ R+ R0 R− R− R0
const reihe = { R0: [], "R+": [], "R-": [] };
for (const [k, v] of [["R0", 0], ["R+", 10], ["R+", 10], ["R0", 0], ["R-", -10], ["R-", -10], ["R0", 0]]) {
    rufe("eval", ORDNUNG(v));
    bank();
    reihe[k].push(bank(), bank());
}
for (const [k, v] of Object.entries(reihe)) {
    out.reihe[k] = { banks: v, median: +median(v).toFixed(3) };
    console.log(`Reihe ${k.padEnd(3)} ${median(v).toFixed(2)} ms`);
}
rufe("eval", ORDNUNG(0));
// je Mesh an/aus, ABBA × 2
for (let i = 0; i < n; i++) {
    const an = [],
        ab = [];
    for (let runde = 0; runde < 2; runde++) {
        an.push(bank());
        rufe("eval", EIN(i, false));
        bank();
        ab.push(bank(), bank());
        rufe("eval", EIN(i, true));
        bank();
        an.push(bank());
    }
    const d = median(an) - median(ab);
    const m = out.lage.satz[i];
    out.meshes[i] = { ...m, an, aus: ab, preisMs: +d.toFixed(3) };
    console.log(`Mesh ${i} tri ${String(m.tri).padStart(6)} alphaTest ${m.alphaTest} durchs. ${m.durchsichtig} Seiten ${m.seiten} Szene ${m.szene}  Preis ${d.toFixed(2)} ms`);
}
out.ende = new Date().toISOString();
fs.writeFileSync(aus, JSON.stringify(out, null, 1));
