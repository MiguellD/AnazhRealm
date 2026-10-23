// M43 material.K3 Fels-Seite (Seiten-Code für `werkbank eval`, r = Welt, T = THREE): die Stufen-Abfrage am Felsbogen bis zur
// Kulling-Grenze. Das EINE Auge der Stufen (`_lodAuge`) rückt auf der Diagonale vom Felsbogen weg; je Abstand ticken 60 Takte
// (`__buehne` + `_gameLoopTick`), gelesen: die Wunsch-Stufe der Distanz (`_lodLevel`), die servierte Stufe (`_servedLod`,
// nach der kindStages-Klammer), ob er gezeichnet ist, und die Stufen-Klammer der Art (`_foundryKindStages`).
const st = r.state, C = r.constructor, D = C.LOD_DISTANCES, G = r._genesisMitte();
const sleep0 = (ms) => new Promise((f) => setTimeout(f, ms));
// die Welt der Werkbank ruht: ticken, bis der Formationen-Satz am Genesis-Ring steht (höchstens 900 Takte)
let takte = 0;
for (; takte < 900 && !st.architectures.some((e) => e && /^(felsbogen|felsturm)$/.test(e.type)); takte++) {
    try { window.__buehne && window.__buehne(); r._gameLoopTick(performance.now()); } catch (_e) {}
    await sleep0(30);
}
const felsen = st.architectures.filter((e) => e && /^(felsbogen|felsturm)$/.test(e.type));
if (!felsen.length) return { fehler: "kein Felsbogen in der Welt", typen: [...new Set(st.architectures.map((e) => e && e.type))].slice(0, 40) };
felsen.sort((a, b) => Math.hypot(a.position.x - G.x, a.position.z - G.z) - Math.hypot(b.position.x - G.x, b.position.z - G.z));
const e = felsen[0];
const preset = r._foundryPresetForEntry(e);
const stufen = r._foundryKindStages(preset);
const klammer = [0, 1, 2, 3].map((w) => r._foundryDeclaredStage(preset, w));
const cull = st.architectureCullingRadius;
const abst = [4, 8, 12, 16, 20, 25, 30, 40, 50, 60, 80, 100, 120, 140, 150, 160, 180, 200].filter((d) => d <= cull + 50);
const sleep = (ms) => new Promise((f) => setTimeout(f, ms));
const zeilen = [];
try {
    for (const d of abst) {
        const auge = new T.Vector3(e.position.x + d / Math.SQRT2, e.position.y + 1.7, e.position.z + d / Math.SQRT2);
        r._lodAuge = () => auge;
        for (let i = 0; i < 60; i++) {
            try { window.__buehne && window.__buehne(); r._gameLoopTick(performance.now()); } catch (_e) {}
            await sleep(20);
        }
        zeilen.push({ d, wunsch: e._lodLevel, serviert: e._servedLod, gezeichnet: r._archIsRendered(e), instanziert: !!e.instanced, typ: e.type });
    }
} finally {
    delete r._lodAuge;
}
return { version: C.VERSION, takteBisFels: takte, felsbogen: { typ: e.type, ort: [+e.position.x.toFixed(1), +e.position.z.toFixed(1)], abstandGenesis: +Math.hypot(e.position.x - G.x, e.position.z - G.z).toFixed(1), anzahlFelsen: felsen.length }, preset, kindStages: stufen, klammerWunsch0bis3: klammer, lod: { thresh01: D.thresh01, thresh12: D.thresh12 }, kullingRadius: cull, satzKlasse: C.BAU_SATZ && C.BAU_SATZ.rock, zeilen };
