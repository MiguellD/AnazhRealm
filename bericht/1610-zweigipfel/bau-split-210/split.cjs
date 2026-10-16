// 1610-ZWEIGIPFEL, die Bau-Klasse zerlegt: in EINER Welt (Genesis Ego, langsam oder schnell) je Teil-Klasse der Bau-Klasse
// (Täter-Klasse `r._taeterKlasse(o)`, wie die Zerlege-Linse sie schaltet) die gpu-bank-Differenz an/aus, ABBA (an aus aus an) × 3,
// je Probe gpu-bank 60 × 2. Dazu das Inventar der Bau-Objekte (Name, Typ, Stoff, Dreiecke, Instanzen, Schatten, Schichten, Bündel).
// node split.cjs <werkbank.cjs> <aus.json>
const { execFileSync } = require("child_process");
const fs = require("fs");
const [wb, aus] = process.argv.slice(2);
const KLASSEN = [
    "f:gt:L1",
    "bauSatz",
    "bau:start_plattform",
    "bau:welt_koerperstudio",
    "bau:welt_klang",
    "bau:welt_tetrapoda",
    "bau:esse",
    "bauWurf",
];
const rufe = (...a) => {
    const t = execFileSync("node", [wb, ...a], { encoding: "utf8", maxBuffer: 64 << 20, timeout: 120000 });
    return JSON.parse(t.slice(t.indexOf("{")));
};
const bank = () => rufe("gpu-bank", "60", "--runden", "2").gpuJeFrameMs;
const INVENTAR = `const st = r.state; const aus = {}; st.scene.traverse((o) => { if (!(o.visible === true && !!o.geometry && (o.isMesh || o.isLine || o.isPoints || o.isSprite))) return; const k = r._taeterKlasse(o); if (!/^(bau|f:gt)/.test(String(k))) return; const g = o.geometry; const tri = Math.round(((g.index ? g.index.count : g.attributes.position ? g.attributes.position.count : 0) / 3) * (o.isInstancedMesh ? o.count : 1)); let b = o.parent; while (b && !b.isBundleGroup) b = b.parent; const m = Array.isArray(o.material) ? o.material[0] : o.material; (aus[k] = aus[k] || []).push({ name: o.name || "", typ: o.type, stoff: m ? (m.type + (m.name ? ":" + m.name : "")) : null, stoffId: m ? m.id : null, durchsichtig: m ? !!m.transparent : null, alphaTest: m ? m.alphaTest : null, seiten: m ? m.side : null, tri, instanzen: o.isInstancedMesh ? o.count : null, wirft: o.castShadow, empfaengt: o.receiveShadow, schichten: o.layers.mask, buendel: b ? String(b.userData && b.userData.regionKey) : null, ordnung: o.renderOrder, frustum: o.frustumCulled }); }); return aus;`;
const AUS = (k) =>
    `const st = r.state; window.__bauAus = window.__bauAus || {}; const a = []; st.scene.traverse((o) => { if (o.visible === true && !!o.geometry && (o.isMesh || o.isLine || o.isPoints || o.isSprite) && r._taeterKlasse(o) === ${JSON.stringify(k)}) a.push(o); }); for (const o of a) o.visible = false; window.__bauAus[${JSON.stringify(k)}] = a; st.scene.traverse((o) => { if (o.isBundleGroup) o.needsUpdate = true; }); return a.length;`;
const AN = (k) =>
    `const a = (window.__bauAus || {})[${JSON.stringify(k)}] || []; for (const o of a) o.visible = true; r.state.scene.traverse((o) => { if (o.isBundleGroup) o.needsUpdate = true; }); return a.length;`;
const median = (v) => {
    const s = v.slice().sort((x, y) => x - y);
    return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const out = { start: new Date().toISOString(), inventar: rufe("eval", INVENTAR).ergebnis, klassen: {} };
bank();
bank(); // einschwingen
out.gesamtAn = [bank(), bank(), bank()];
for (const k of KLASSEN) {
    const an = [],
        aus2 = [];
    let n = 0;
    for (let runde = 0; runde < 3; runde++) {
        an.push(bank());
        n = rufe("eval", AUS(k)).ergebnis;
        bank();
        aus2.push(bank());
        aus2.push(bank());
        rufe("eval", AN(k));
        bank();
        an.push(bank());
    }
    const d = median(an) - median(aus2);
    out.klassen[k] = { objekte: n, an, aus: aus2, preisMs: +d.toFixed(3) };
    console.log(`${k.padEnd(24)} Objekte ${String(n).padStart(3)}  an ${median(an).toFixed(2)}  aus ${median(aus2).toFixed(2)}  Preis ${d.toFixed(2)} ms`);
}
out.ende = new Date().toISOString();
fs.writeFileSync(aus, JSON.stringify(out, null, 1));
